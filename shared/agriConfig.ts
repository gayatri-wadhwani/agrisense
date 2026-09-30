export const DEMO_PROFILES = [
  { name: "Meera Patil", location: "Nashik, Maharashtra", crop: "Cotton", stage: "Flowering", state: "Maharashtra", district: "Nashik", irrigation: "Drip irrigation", soilPh: 6.8, organicCarbon: 0.62, soilMoisture: 43, latitude: 20.01, longitude: 73.78, language: "en" as const },
  { name: "Ravi Kumar", location: "Guntur, Andhra Pradesh", crop: "Chilli", stage: "Vegetative", state: "Andhra Pradesh", district: "Guntur", irrigation: "Borewell", soilPh: 7.1, organicCarbon: 0.48, soilMoisture: 36, latitude: 16.31, longitude: 80.44, language: "en" as const },
  { name: "Sita Devi", location: "Madhubani, Bihar", crop: "Rice", stage: "Tillering", state: "Bihar", district: "Madhubani", irrigation: "Canal irrigation", soilPh: 6.4, organicCarbon: 0.71, soilMoisture: 61, latitude: 26.35, longitude: 86.07, language: "en" as const },
] as const;

export const CACHED_WEATHER = {
  temperature: 28,
  rainfall: 4.2,
  humidity: 68,
  soilMoisture: 41,
  source: "cached" as const,
  fetchedAt: "Demo fallback • 22 Aug 2026, 09:00 IST",
};

export const CACHED_SATELLITE = {
  ndvi: 0.63,
  source: "cached satellite indicator" as const,
  observedAt: "Demo observation · Aug 2026",
};

export const SUPPORTED_STATES = ["Maharashtra", "Andhra Pradesh", "Bihar"] as const;
export const SUPPORTED_CROPS = ["Cotton", "Chilli", "Rice"] as const;
export const SUPPORTED_STAGES = ["Vegetative", "Flowering", "Tillering"] as const;
export const SUPPORTED_IRRIGATION = ["Drip irrigation", "Borewell", "Canal irrigation"] as const;
export const INTEROPERABILITY_LAYERS = ["Crop calendars", "Language packs", "Soil thresholds", "Approved rules"] as const;

export const LANGUAGE_PACKS = {
  en: { code: "en-IN", label: "English", status: "active" },
  hi: { code: "hi-IN", label: "हिन्दी", status: "active" },
  mr: { code: "mr-IN", label: "मराठी", status: "ready-for-review" },
} as const;

export const STATE_MODEL_GOVERNANCE = {
  owner: "Agrisense state adapter registry",
  approvalStatus: "demo-review-required",
  reviewAuthority: "State agriculture department or designated agronomy panel",
  changePolicy: "Version crop calendars, soil thresholds, language packs, referral rules, and source metadata together",
} as const;

export const PROVENANCE_DEFAULTS = {
  stateModelVersion: "state-model-demo-v1",
  rulesPack: "regenerative-baseline-v1",
  languagePack: "en-hi-core-v1",
  governanceStatus: STATE_MODEL_GOVERNANCE.approvalStatus,
} as const;

export const CURATED_SCREENING = {
  possibleIssue: "Moisture-related leaf stress",
  observations: "Pale edge, mild spotting",
  confidence: "64% · moderate",
  disclaimer: "This is not a definitive diagnosis. Isolate the observation, inspect more plants, and contact a local agriculture officer if symptoms spread.",
};
