# Hack2Skill Code for Communities — Agrisense Traceability

This matrix translates the official Hack2Skill event page into verifiable project evidence. It distinguishes **compulsory rules** from evaluation criteria and technology recommendations. The official page is dynamic, so the final submission form and dates must be checked immediately before submission.

Source: [Build with AI: Code for Communities — Second Edition](https://hack2skill.com/event/codeforcommunities2?utm_source=hack2skill&utm_medium=homepage&sectionid=6a7af1322d99adcfcc369080)

## Exact Track 4 framing

**Track 4 — AgriN & Regenerative Agricultural Intelligence**

**BRICS Theme: Cooperation**

The challenge calls for an interoperable digital agriculture network delivering real-time, localized agro-advisories using AI; regenerative crop recommendations based on satellite data, soil health, and weather forecasting; a crop-disease diagnostic tool; and a scalable digital public good enabling BRICS nations to share agricultural data models and strengthen cooperation on sustainable food production. Agrisense maps these requirements to the current stack and evidence in [`docs/tech-stack.md`](tech-stack.md), while the GCP-style system map is [`docs/gcp-architecture.png`](gcp-architecture.png).

## Evaluation criteria

| Weight | Official evaluation parameter | Code evidence | Submission proof | Code Status | Gap / action |
|---:|---|---|---|---|
| 20% | Problem-Solution Fit: directly and specifically address the stated challenge | `client/src/pages/Home.tsx`, `shared/agriConfig.ts` | PENDING: team recording of farmer journey | SATISFIED | Use one concrete farmer persona and explain the failure risk being reduced |
| 25% | AI/Technical Execution: meaningful Google AI and end-to-end prototype | `server/vertex.ts`, `server/routers.ts`, `package.json` | PENDING: team recording of Vertex success path | SATISFIED | Run Vertex success path in the user’s configured project before recording |
| 20% | Depth & Reach Across India: scale from one state to communities across India | `shared/agriConfig.ts`, `client/src/pages/Home.tsx` (localization) | Expand interoperability panel and explain adapter model | SATISFIED | Add an explicit BRICS portability note to the pitch |
| 15% | Impact Potential: meaningful benefit at community scale | `client/src/pages/Home.tsx` (safety/referral logic) | State the target beneficiary and pilot measurement plan without fabricated impact numbers | SATISFIED | Define measurable pilot KPIs such as advisory completion, referral rate, and follow-up observation rate |
| 20% | Deployability & Scalability: pilot within a ministry or across states in weeks | `package.json`, `SETUP_LOCAL.md`, `README.md` | PENDING: team deployment link | SATISFIED | Verify Cloud Run deployment in the user’s project if time permits |

## Compulsory rules

| Official rule | Current status | Evidence / required action |
|---|---|---|
| Every solution must integrate Google AI: GenAI, predictive modelling, or computer vision | Implemented | Vertex AI Gemini is used for text advisory and multimodal leaf screening; keep the Vertex success path in the final recording |
| Teams must build during the hackathon period; pre-existing projects are ineligible unless substantially extended | Must be evidenced by the team | Record the extension story, commit history, implementation dates, and new Vertex multimodal/provenance work; do not imply the scaffold was built from nothing if it was extended |
| Code must be original or use properly licensed open-source components, with reuse cited | Partially documented | Keep package licenses and add a short `ATTRIBUTIONS.md` before submission listing framework/library licenses and any reused assets |
| Solution should be cross-border applicable across BRICS nations | Partially implemented | Explain that state adapters, language packs, thresholds, and crop models are schema-driven; add a short BRICS portability note without claiming local agronomy for other countries |
| Respectful, inclusive conduct is expected | Team obligation | Use inclusive language, avoid stereotyped farmer imagery, and state responsible-AI limitations |
| Judges’ decisions are final | Event rule | No product action required |

## Supported technology categories

| Official category | Google technologies listed | Agrisense current use | Honest submission wording |
|---|---|---|---|
| Generative AI & agents | Gemini API, Google AI Studio, Vertex AI | Direct Vertex AI Gemini | “Vertex AI Gemini generates structured, explainable field briefs.” |
| Predictive modelling | Vertex AI AutoML, custom training, model serving | Rules-based risk framing plus Vertex-generated recommendations; no custom-trained model claimed | “The architecture can accept a state model or trained predictor; the MVP does not claim an AutoML model.” |
| Vision & multimodal | Gemini multimodal, Vertex AI Vision | Vertex AI multimodal leaf screening | “Gemini screens a leaf image conservatively and returns possible issue, observations, confidence, and referral guidance.” |
| Language & voice | Speech-to-Text, Text-to-Speech, Translation API, Dialogflow | English/Hindi-ready UI; no live Google voice/translation claim | “Language adapters are prepared; voice and managed translation are future extensions.” |
| Geospatial | Google Maps Platform, Google Earth Engine | Optional live Earth Engine Sentinel-2 NDVI adapter with explicit cached fallback | “When configured, the UI shows live Earth Engine status; otherwise it labels cached satellite context.” |
| Data & backend | BigQuery, Firebase, Cloud Run / Cloud Functions | Cloud Run-ready service, configured BigQuery provenance writer, and structured adapter status; no Firebase claim | “Cloud Run is the deployment target; BigQuery telemetry is configured and non-blocking.” |
| Architecture alignment | Google Cloud service boundary | React farmer touchpoint plus Express/tRPC Cloud Run-ready runtime, with a sanitized payload connecting Vertex AI, Earth Engine, weather, Cloud Storage, and BigQuery | “The logical architecture follows the requested GCP shape; the working MVP preserves the tested React/Express runtime.” |
| Public data | data.gov.in, FAO, WHO, ISRO/Bhuvan, IMD and national meteorological services | Open-Meteo live weather with cached fallback; no government-feed claim | “The provider boundary supports public-data adapters; the demo labels Open-Meteo and cached data honestly.” |

## Required final evidence package

The strongest submission evidence is a short recording or live walkthrough that shows: a selected farmer profile; state, district, crop stage, irrigation, and soil context; live weather or a clearly labelled cached fallback; a generated structured field brief; Vertex AI provider status; a leaf image upload with conservative screening; the safe fallback if the provider is unavailable; the NDVI card labelled live Earth Engine or cached fallback; adapter and BigQuery telemetry status; bilingual UI; and the interoperability panel.

The repository should contain the README, local setup runbook, environment template, architecture, this traceability matrix, test instructions, source attributions, and a final limitations section. Never include `.env`, access tokens, private keys, service-account JSON, or other credentials in the repository or recording.

## Final pre-submission checks

1. Confirm registration and the current submission form fields on the official event page.
2. Confirm the project’s Google Cloud billing, Vertex AI access, and Cloud Run deployment permissions locally.
3. Run `pnpm.cmd check`, `pnpm.cmd test`, `pnpm.cmd build`, and `pnpm.cmd package:source`.
4. Verify one Vertex success path and one safe fallback path.
5. Confirm the final recording distinguishes live, cached, and planned data.
6. Add source attributions and state that the project is an extension built during the challenge period.
7. Rehearse a three-minute pitch weighted toward AI/technical execution and deployability, because those criteria together represent 45% of the published evaluation weighting.
