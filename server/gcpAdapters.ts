import { BigQuery } from "@google-cloud/bigquery";
import { Storage } from "@google-cloud/storage";
import { ENV } from "./_core/env";
import { CACHED_SATELLITE } from "@shared/agriConfig";

export type SatelliteContext = {
  ndvi: number;
  source: "live-earth-engine" | "cached";
  observedAt: string;
  provider: "Google Earth Engine" | "Agrisense cached fallback";
  status: "live" | "fallback" | "disabled";
};

export type LeafUploadResult = {
  key: string;
  url: string;
  source: "Google Cloud Storage";
  storedAt: string;
};

export type TelemetryStatus = "written" | "disabled" | "failed";
export type EarthEngineNdviClient = (latitude: number, longitude: number) => Promise<number>;
export type StorageClientLike = { bucket: (name: string) => { file: (key: string) => { save: (data: Buffer, options: Record<string, unknown>) => Promise<void>; getSignedUrl: (options: Record<string, unknown>) => Promise<[string]> } } };
export type BigQueryClientLike = { dataset: (name: string) => { table: (name: string) => { insert: (row: Record<string, unknown>, options: Record<string, unknown>) => Promise<unknown> } } };

const cachedSatellite: SatelliteContext = {
  ...CACHED_SATELLITE,
  source: "cached",
  provider: "Agrisense cached fallback",
  status: "fallback",
};

let earthEngineInitialized: Promise<unknown> | null = null;

function initializeEarthEngine(): Promise<unknown> {
  if (earthEngineInitialized) return earthEngineInitialized;
  earthEngineInitialized = new Promise(async (resolve, reject) => {
    try {
      if (!ENV.earthEngineServiceAccountJson) {
        reject(new Error("EARTH_ENGINE_SERVICE_ACCOUNT_JSON is not configured"));
        return;
      }
      const module = await import("@google/earthengine");
      const ee = (module.default ?? module) as any;
      const privateKey = JSON.parse(ENV.earthEngineServiceAccountJson);
      ee.data.authenticateViaPrivateKey(
        privateKey,
        () => ee.initialize(null, null, () => resolve(ee), reject, null, ENV.googleCloudProject),
        reject,
      );
    } catch (error) {
      reject(error);
    }
  });
  return earthEngineInitialized;
}

export async function getSatelliteContext(latitude: number, longitude: number, injectedClient?: EarthEngineNdviClient): Promise<SatelliteContext> {
  if (!ENV.earthEngineEnabled && !injectedClient) return { ...cachedSatellite, status: "disabled" };
  try {
    if (injectedClient) {
      const value = await injectedClient(latitude, longitude);
      return { ndvi: value, source: "live-earth-engine", observedAt: new Date().toISOString(), provider: "Google Earth Engine", status: "live" };
    }
    const ee = await initializeEarthEngine() as any;
    const point = ee.Geometry.Point([longitude, latitude]);
    const image = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
      .filterBounds(point)
      .filterDate(ENV.earthEngineDateStart, ENV.earthEngineDateEnd)
      .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", ENV.earthEngineMaxCloudPercent))
      .sort("CLOUDY_PIXEL_PERCENTAGE")
      .first();
    const ndvi = image.normalizedDifference(["B8", "B4"]).rename("ndvi").reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: point,
      scale: 10,
      maxPixels: 1e8,
    }).get("ndvi");
    const value = await new Promise<number>((resolve, reject) => {
      ndvi.evaluate((result: unknown, error: unknown) => {
        if (error) return reject(error);
        const numeric = Number(result);
        if (!Number.isFinite(numeric)) return reject(new Error("Earth Engine returned no NDVI value"));
        resolve(Number(numeric.toFixed(3)));
      });
    });
    return {
      ndvi: value,
      source: "live-earth-engine",
      observedAt: new Date().toISOString(),
      provider: "Google Earth Engine",
      status: "live",
    };
  } catch (error) {
    console.warn("[Earth Engine] Falling back to cached satellite indicator", error);
    return { ...cachedSatellite, status: "fallback" };
  }
}

export async function storeLeafImage(input: { imageData: string; mimeType: string; prefix?: string }, clientFactory: () => StorageClientLike = () => new Storage({ projectId: ENV.googleCloudProject || undefined }) as unknown as StorageClientLike): Promise<LeafUploadResult | null> {
  if (!ENV.cloudStorageBucket) return null;
  const storage = clientFactory();
  const extension = input.mimeType.split("/")[1] ?? "jpg";
  const key = `${input.prefix ?? "screening"}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const buffer = Buffer.from(input.imageData.replace(/^data:[^;]+;base64,/, ""), "base64");
  const file = storage.bucket(ENV.cloudStorageBucket).file(key);
  await file.save(buffer, {
    resumable: false,
    contentType: input.mimeType,
    metadata: { cacheControl: "private, max-age=0, no-store" },
  });
  let url = `gs://${ENV.cloudStorageBucket}/${key}`;
  try {
    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + ENV.cloudStorageSignedUrlMinutes * 60_000,
    });
    url = signedUrl;
  } catch (error) {
    console.warn("[Cloud Storage] Object persisted, but signed URL was unavailable; retaining private gs:// reference", error);
  }
  return { key, url, source: "Google Cloud Storage", storedAt: new Date().toISOString() };
}

export async function writeAdvisoryTelemetry(row: Record<string, unknown>, clientFactory: () => BigQueryClientLike = () => new BigQuery({ projectId: ENV.googleCloudProject || undefined }) as unknown as BigQueryClientLike): Promise<TelemetryStatus> {
  if (!ENV.bigQueryDataset || !ENV.bigQueryTable) return "disabled";
  try {
    const client = clientFactory();
    await client.dataset(ENV.bigQueryDataset).table(ENV.bigQueryTable).insert({
      ...row,
      eventId: row.eventId ?? crypto.randomUUID(),
      insertedAt: new Date().toISOString(),
    }, { ignoreUnknownValues: true, skipInvalidRows: false });
    return "written";
  } catch (error) {
    console.warn("[BigQuery] Non-blocking telemetry write failed", error);
    return "failed";
  }
}

export function gcpAdapterStatus() {
  return {
    earthEngine: ENV.earthEngineEnabled ? "configured" : "disabled",
    cloudStorage: ENV.cloudStorageBucket ? "configured" : "disabled",
    bigQuery: ENV.bigQueryDataset && ENV.bigQueryTable ? "configured" : "disabled",
  } as const;
}

export { cachedSatellite };
