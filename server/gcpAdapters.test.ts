import { afterEach, describe, expect, it, vi } from "vitest";
import { cachedSatellite, getSatelliteContext } from "./gcpAdapters";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("Google Cloud agriculture adapters", () => {
  it("returns a clearly labelled satellite fallback when Earth Engine is disabled", async () => {
    const result = await getSatelliteContext(20.01, 73.78);
    expect(result.ndvi).toBe(cachedSatellite.ndvi);
    expect(result.status).toBe("disabled");
    expect(result.provider).toMatch(/cached/i);
  });

  it("supports an injected live Earth Engine result without credentials", async () => {
    const { getSatelliteContext: getWithClient } = await import("./gcpAdapters");
    const result = await getWithClient(20.01, 73.78, async () => 0.742);
    expect(result).toMatchObject({ ndvi: 0.742, source: "live-earth-engine", status: "live", provider: "Google Earth Engine" });
  });

  it("uploads leaf bytes through an injected Cloud Storage client", async () => {
    vi.stubEnv("AGRISENSE_GCS_BUCKET", "test-bucket");
    const { storeLeafImage } = await import("./gcpAdapters");
    const save = vi.fn(async () => undefined);
    const getSignedUrl = vi.fn(async () => ["https://storage.test/signed"] as [string]);
    const client = { bucket: () => ({ file: () => ({ save, getSignedUrl }) }) };
    const result = await storeLeafImage({ imageData: Buffer.from("leaf").toString("base64"), mimeType: "image/jpeg" }, () => client);
    expect(result?.source).toBe("Google Cloud Storage");
    expect(result?.url).toBe("https://storage.test/signed");
    expect(save).toHaveBeenCalledOnce();
  });

  it("returns a non-blocking failed status when the injected BigQuery writer fails", async () => {
    vi.stubEnv("AGRISENSE_BQ_DATASET", "telemetry");
    vi.stubEnv("AGRISENSE_BQ_TABLE", "events");
    const { writeAdvisoryTelemetry } = await import("./gcpAdapters");
    const insert = vi.fn(async () => { throw new Error("permission denied"); });
    const client = { dataset: () => ({ table: () => ({ insert }) }) };
    expect(await writeAdvisoryTelemetry({ crop: "Cotton" }, () => client)).toBe("failed");
    expect(insert).toHaveBeenCalledOnce();
  });
});
