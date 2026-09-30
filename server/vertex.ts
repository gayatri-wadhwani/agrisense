import { GoogleGenAI } from "@google/genai";
import { ENV } from "./_core/env";

type JsonSchema = Record<string, unknown>;

type VertexAdvisoryRequest = {
  prompt: string;
  schema: JsonSchema;
};

let client: GoogleGenAI | null = null;

function getVertexClient() {
  if (!ENV.googleCloudProject) {
    throw new Error("GOOGLE_CLOUD_PROJECT is not configured");
  }

  if (!client) {
    client = new GoogleGenAI({
      enterprise: true,
      project: ENV.googleCloudProject,
      location: ENV.googleCloudLocation,
      apiVersion: "v1",
    });
  }

  return client;
}

function parseJsonResponse(text: string, label: string) {
  const normalized = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    return JSON.parse(normalized) as Record<string, unknown>;
  } catch {
    const start = normalized.indexOf("{");
    const end = normalized.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(normalized.slice(start, end + 1)) as Record<string, unknown>;
      } catch {
        // Preserve the useful original parse error below.
      }
    }
    throw new Error(`Vertex AI returned invalid ${label} JSON (response may have been truncated)`);
  }
}

export async function generateVertexAdvisory({ prompt, schema }: VertexAdvisoryRequest) {
  if (ENV.aiProvider !== "vertex") {
    throw new Error(`Unsupported AI provider: ${ENV.aiProvider}`);
  }

  const request = (contents: string, maxOutputTokens: number) => getVertexClient().models.generateContent({
    model: ENV.vertexModel,
    contents,
    config: {
      temperature: 0.1,
      maxOutputTokens,
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });
  let response = await request(prompt, 3000);
  let text = response.text?.trim();
  if (!text) throw new Error("Vertex AI returned an empty response");
  try {
    return parseJsonResponse(text, "advisory");
  } catch {
    response = await request(`${prompt}\nKeep every string concise. Return one complete JSON object only; do not explain your answer.`, 3000);
    text = response.text?.trim();
    if (!text) throw new Error("Vertex AI returned an empty response on retry");
    return parseJsonResponse(text, "advisory");
  }
}

export function vertexConfigurationStatus() {
  return {
    provider: ENV.aiProvider,
    configured: ENV.aiProvider === "vertex" && Boolean(ENV.googleCloudProject),
    requireVertex: ENV.requireVertex,
    projectConfigured: Boolean(ENV.googleCloudProject),
    location: ENV.googleCloudLocation,
    model: ENV.vertexModel,
  };
}

export async function generateVertexLeafScreening({ imageData, mimeType }: { imageData: string; mimeType: string }) {
  if (ENV.aiProvider !== "vertex") {
    throw new Error(`Unsupported AI provider: ${ENV.aiProvider}`);
  }

  const response = await getVertexClient().models.generateContent({
    model: ENV.vertexModel,
    contents: [{
      role: "user",
      parts: [
        {
          text: "Screen this crop-leaf image conservatively. Return JSON only. Describe visual observations, give a possible issue rather than a definitive diagnosis, include confidence from 0 to 1, list safe next steps, and recommend referral when evidence is insufficient. Do not recommend pesticide products or dosages.",
        },
        { inlineData: { mimeType, data: imageData } },
      ],
    }],
    config: {
      temperature: 0.15,
      maxOutputTokens: 900,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          possibleIssue: { type: "string" },
          observations: { type: "array", items: { type: "string" } },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          safeNextSteps: { type: "array", items: { type: "string" } },
          referral: { type: "string" },
        },
        required: ["possibleIssue", "observations", "confidence", "safeNextSteps", "referral"],
        additionalProperties: false,
      },
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Vertex AI returned an empty screening response");
  return parseJsonResponse(text, "screening") as {
    possibleIssue: string;
    observations: string[];
    confidence: number;
    safeNextSteps: string[];
    referral: string;
  };
}
