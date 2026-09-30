import { z } from "zod";
import { generateVertexAdvisory, generateVertexLeafScreening, vertexConfigurationStatus } from "./vertex";
import { ENV } from "./_core/env";
import { CACHED_SATELLITE, CACHED_WEATHER, PROVENANCE_DEFAULTS } from "@shared/agriConfig";
import { systemRouter } from "./_core/systemRouter";
import { getSatelliteContext, gcpAdapterStatus, storeLeafImage, writeAdvisoryTelemetry } from "./gcpAdapters";
import { publicProcedure, router } from "./_core/trpc";

const intakeSchema = z.object({
  state: z.string().min(2),
  district: z.string().min(2),
  crop: z.string().min(2),
  stage: z.string().min(2),
  irrigation: z.string().min(2),
  soilPh: z.number().min(0).max(14),
  organicCarbon: z.number().min(0).max(10),
  soilMoisture: z.number().min(0).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  language: z.enum(["en", "hi"]),
});

type Weather = {
  temperature: number;
  rainfall: number;
  humidity: number;
  soilMoisture: number;
  source: "live" | "cached";
  fetchedAt: string;
};

export const cachedWeather: Weather = CACHED_WEATHER;

export async function getWeather(latitude: number, longitude: number, fetchImpl: typeof fetch = fetch): Promise<Weather> {
  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: "temperature_2m,relative_humidity_2m,precipitation",
      hourly: "soil_moisture_0_to_1cm",
      forecast_days: "1",
      timezone: "auto",
    });
    const response = await fetchImpl(`${ENV.weatherApiBaseUrl}?${params}`, {
      signal: AbortSignal.timeout(4500),
    });
    if (!response.ok) throw new Error(`Weather provider returned ${response.status}`);
    const data = await response.json() as {
      current?: { temperature_2m?: number; relative_humidity_2m?: number; precipitation?: number };
      hourly?: { soil_moisture_0_to_1cm?: number[] };
    };
    return {
      temperature: data.current?.temperature_2m ?? cachedWeather.temperature,
      rainfall: data.current?.precipitation ?? cachedWeather.rainfall,
      humidity: data.current?.relative_humidity_2m ?? cachedWeather.humidity,
      soilMoisture: data.hourly?.soil_moisture_0_to_1cm?.[0] != null
        ? Math.round((data.hourly.soil_moisture_0_to_1cm[0] ?? 0) * 100)
        : cachedWeather.soilMoisture,
      source: "live",
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn("[Weather] Falling back to cached demo data", error);
    return cachedWeather;
  }
}

const advisorySchema = {
  type: "object",
  properties: {
    riskLevel: { type: "string", enum: ["low", "moderate", "high"] },
    headline: { type: "string" },
    summary: { type: "string" },
    immediateActions: { type: "array", items: { type: "string" } },
    regenerativePractices: { type: "array", items: { type: "string" } },
    weatherRisks: { type: "array", items: { type: "string" } },
    assumptions: { type: "array", items: { type: "string" } },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    referral: { type: "string" },
  },
  required: ["riskLevel", "headline", "summary", "immediateActions", "regenerativePractices", "weatherRisks", "assumptions", "confidence", "referral"],
  additionalProperties: false,
} as const;

export function fallbackAdvisory(input: z.infer<typeof intakeSchema>, weather: Weather) {
  const highMoisture = weather.humidity > 75 || weather.rainfall > 8;
  return {
    riskLevel: highMoisture ? "moderate" : "low",
    headline: highMoisture ? "Watch for moisture-related stress" : "Conditions are broadly manageable",
    summary: `For ${input.crop} at the ${input.stage} stage in ${input.district}, use the weather signal with your field observations before taking action.`,
    immediateActions: [
      highMoisture ? "Inspect lower leaves and field drainage within 24 hours." : "Walk the field and check five representative plants before irrigating.",
      "Prefer targeted, low-input action and record what you observe.",
      "Avoid applying any product solely from this screening; consult a local expert if symptoms spread.",
    ],
    regenerativePractices: [
      "Maintain soil cover with residue or locally available mulch.",
      "Use measured irrigation and avoid standing water around the root zone.",
      "Plan a rotation or intercrop that supports soil structure and biodiversity.",
    ],
    weatherRisks: [highMoisture ? "High humidity or rainfall may increase fungal pressure." : "A dry spell could increase water stress if the soil profile is low.", "Recheck the forecast before irrigation or field spraying."],
    assumptions: [`Soil pH entered as ${input.soilPh}; organic carbon entered as ${input.organicCarbon}%.`, "No laboratory report or field image was provided for confirmation."],
    confidence: 0.68,
    referral: "If symptoms persist for 48 hours, affect new growth, or spread across the plot, contact a Krishi Vigyan Kendra or state agriculture officer.",
  };
}

export const appRouter = router({
  system: systemRouter,
  screening: router({
    analyze: publicProcedure.input(z.object({ imageData: z.string().min(1000).max(9000000), mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]) })).mutation(async ({ input }) => {
      let storage: Awaited<ReturnType<typeof storeLeafImage>> = null;
      try {
        storage = await storeLeafImage({ ...input, prefix: "leaf-screenings" });
      } catch (error) {
        console.warn("[Cloud Storage] Leaf persistence unavailable; continuing without durable image storage", error);
      }
      try {
        const screening = await generateVertexLeafScreening(input);
        return { screening, aiGenerated: true, source: "Vertex AI Gemini" as const, storage };
      } catch (error) {
        console.warn("[Screening] Vertex AI unavailable; using curated safe screening", error);
        if (ENV.requireVertex) throw error;
        return {
          screening: {
            possibleIssue: "Possible moisture or nutrient-related leaf stress",
            observations: ["Look for localized discoloration or edge changes", "Compare several representative leaves before acting"],
            confidence: 0.52,
            safeNextSteps: ["Photograph multiple leaves in natural light", "Check undersides and new growth", "Avoid applying a product solely from this image"],
            referral: "If symptoms spread or affect new growth, consult a Krishi Vigyan Kendra or state agriculture officer.",
          },
          aiGenerated: false,
          source: "Curated demo fallback" as const,
          storage,
        };
      }
    }),
  }),
  advisory: router({
    generate: publicProcedure.input(intakeSchema).mutation(async ({ input }) => {
      const weather = await getWeather(input.latitude, input.longitude);
      const satellite = await getSatelliteContext(input.latitude, input.longitude);
      let advisory = fallbackAdvisory(input, weather);
      let aiGenerated = false;

      try {
        const generated = await generateVertexAdvisory({
          schema: advisorySchema,
          prompt: [
            "You are Agrisense, a cautious agricultural advisory assistant for small and marginal farmers in India.",
            "Give practical, low-risk guidance. Never make definitive disease or pesticide claims.",
            "Use confidence framing, state assumptions, and refer the farmer to a local agriculture expert when evidence is insufficient.",
            `Respond in ${input.language === "hi" ? "Hindi" : "English"}. Follow the supplied JSON response schema exactly.`,
            "Farmer and field context:",
            JSON.stringify({ input, weather }),
          ].join("\\n"),
        });
        advisory = { ...advisory, ...generated };
        aiGenerated = true;
      } catch (error) {
        console.warn("[Advisory] Vertex AI unavailable; using deterministic safe response", error);
        if (ENV.requireVertex) throw error;
      }

      const generatedAt = new Date().toISOString();
      const telemetryStatus = await writeAdvisoryTelemetry({
        state: input.state,
        district: input.district,
        crop: input.crop,
        language: input.language,
        weatherSource: weather.source,
        satelliteSource: satellite.source,
        advisoryProvider: aiGenerated ? "Vertex AI Gemini" : "Agrisense safe fallback",
        confidence: advisory.confidence,
        generatedAt,
      });
      return {
        weather,
        satellite,
        advisory,
        aiGenerated,
        vertex: vertexConfigurationStatus(),
        provenance: {
          ...PROVENANCE_DEFAULTS,
          state: input.state,
          crop: input.crop,
          weatherSource: weather.source,
          satelliteSource: satellite.source,
          advisoryProvider: aiGenerated ? "Vertex AI Gemini" : "Agrisense safe fallback",
          generatedAt,
        },
        adapterStatus: gcpAdapterStatus(),
        telemetryStatus,
        generatedAt,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
