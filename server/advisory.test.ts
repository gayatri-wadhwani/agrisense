import { describe, expect, it } from "vitest";
import { cachedWeather, fallbackAdvisory, getWeather } from "./routers";

describe("weather adapter", () => {
  it("returns clearly marked cached data when the live provider fails", async () => {
    const result = await getWeather(20.01, 73.78, async () => { throw new Error("offline"); });
    expect(result).toEqual(cachedWeather);
    expect(result.source).toBe("cached");
    expect(result.fetchedAt).toContain("Demo fallback");
  });
});

describe("advisory safety framing", () => {
  it("uses cautious language and referral guidance in the deterministic fallback", () => {
    const result = fallbackAdvisory({
      state: "Maharashtra", district: "Nashik", crop: "Cotton", stage: "Flowering", irrigation: "Drip irrigation",
      soilPh: 6.8, organicCarbon: 0.62, soilMoisture: 43, latitude: 20.01, longitude: 73.78, language: "en",
    }, cachedWeather);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.referral).toContain("agriculture officer");
    expect(result.immediateActions.join(" ")).toContain("solely from this screening");
    expect(result.assumptions.join(" ")).toContain("Soil pH");
  });

  it("accepts a prefilled profile shape and returns an actionable brief", () => {
    const profile = { state: "Bihar", district: "Madhubani", crop: "Rice", stage: "Tillering", irrigation: "Canal irrigation", soilPh: 6.4, organicCarbon: 0.71, soilMoisture: 61, latitude: 26.35, longitude: 86.07, language: "hi" as const };
    const result = fallbackAdvisory(profile, cachedWeather);
    expect(result.immediateActions.length).toBeGreaterThanOrEqual(2);
    expect(result.regenerativePractices.length).toBeGreaterThanOrEqual(2);
    expect(result.riskLevel).toMatch(/low|moderate|high/);
  });
});
