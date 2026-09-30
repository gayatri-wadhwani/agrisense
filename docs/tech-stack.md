# Agrisense — Current Technology Stack

## Executive summary

Agrisense is currently a **Google Cloud-powered, interoperable agricultural advisory MVP** for Track 4 — AgriN and Regenerative Agricultural Intelligence under the BRICS Cooperation theme. The farmer experience is implemented in React and the server boundary is implemented in Express with tRPC. Google Cloud services power the meaningful AI and the India-scale data-plane adapters. Mesop, FastAPI, Cloud Text-to-Speech, and Agmarknet are not claimed as current runtime components.

## Stack inventory

| Layer | Technology | Status | Farmer-facing capability | AgriN/BRICS relevance | Concrete demo/submission evidence |
|---|---|---|---|---|---|
| User touchpoint | React 19 + Tailwind CSS 4 | Implemented | Responsive farmer workspace for field intake, advisory, and leaf screening | Accessible shared interface for small and marginal farmers | `docs/demo-script.md` Parts 1–4; `docs/submission-evidence-template.md` items 1, 5, and 9 |
| Application contracts | tRPC 11 + TypeScript | Implemented | Typed end-to-end procedures for weather, advisory, and screening | Interoperable contracts between common platform and state models | `server/routers.ts`; `docs/architecture.md` implementation mapping |
| Server runtime | Express 4 on Node.js | Implemented; Cloud Run-ready | Server-side orchestration, credential isolation, safe fallbacks | Deployable digital-public-good service boundary | `server/_core/index.ts`; `SETUP_LOCAL.md`; `docs/architecture.md` |
| AI text reasoning | Vertex AI Gemini | Implemented | Structured risk, actions, regenerative practices, weather risks, assumptions, and referral | Meaningful AI-powered localized agro-advisory | `docs/demo-script.md` Part 3; evidence item 2; `server/vertex.test.ts` |
| AI vision reasoning | Vertex AI Gemini multimodal | Implemented | Conservative possible-issue screening, observations, confidence, safe next steps, and referral | Crop-disease screening without unsafe definitive diagnosis | `docs/demo-script.md` Part 4; evidence items 5–7; `server/vertex.test.ts` |
| Weather | Open-Meteo | Implemented with cached fallback | Temperature, rainfall, humidity, and soil-moisture context for coordinates | Climate forecasting input for localized advice | `docs/demo-script.md` Part 2; evidence item 3; `server/advisory.test.ts` |
| Satellite/geospatial | Google Earth Engine + Sentinel-2 | Configured live adapter with cached fallback | Point NDVI when registered and permissioned; transparent fallback otherwise | Satellite-data foundation for regenerative crop decisions | `docs/demo-script.md` Part 2; evidence item 8; `docs/gcp-architecture.png` |
| Image persistence | Google Cloud Storage | Configured live adapter | Private leaf-image object persistence with short-lived signed reads and lifecycle cleanup | Durable plant-health evidence layer | `docs/gcp-architecture.png`; `docs/environment.template`; screening upload path |
| Provenance telemetry | BigQuery | Configured live adapter | Non-identifying advisory provenance, adapter status, and model metadata | Shared analytics and cross-state cooperation foundation | `docs/demo-script.md` Part 5; evidence item 10; `server/gcpAdapters.test.ts` |
| State interoperability | Shared TypeScript model registry | Implemented | Crop calendars, soil thresholds, approved rules, language packs, version and governance metadata | State-to-state portability and BRICS data-model sharing | `client/src/pages/Home.tsx` interoperability panel; `docs/hack2skill-traceability.md`; `docs/gcp-architecture.png` |
| Language readiness | English + Hindi UI; Marathi `mr-IN` pack | English/Hindi active; Marathi ready for review | Bilingual farmer interface and regional expansion structure | Inclusion and regional adaptation | `client/src/pages/Home.tsx`; `shared/agriConfig.ts`; evidence item 9 |
| Persistence/auth foundation | Typed server contracts and optional persistence schema | Available; public demo is unauthenticated | Future protected user flows and project data foundation | Extensible public-good platform architecture | `drizzle/schema.ts`; `README.md` prerequisites and auth notes |
| Deployment | Google Cloud Run target | Documented and ready for user-owned deployment | Serverless deployment path with environment configuration | Scalable cloud delivery across districts and states | `SETUP_LOCAL.md`; `docs/final-submission-checklist.md` item 11; `docs/architecture.md` |
| Monitoring/analytics | BigQuery telemetry plus Cloud Run/Google Cloud operations path | Adapter implemented; user project activation required | Operational evidence and regional trend readiness | Cooperation, auditability, and scale | `server/gcpAdapters.test.ts`; evidence item 10; `docs/gcp-architecture.png` |
| Future audio | Cloud Text-to-Speech / Translation | Future scope | Regional neural audio and expanded language delivery | Accessibility extension after QA and consent design | `docs/architecture.md` Audio decision; pitch-deck future scope |
| Future market data | Agmarknet mandi prices | Future scope | Mandi-price-aware recommendations after source validation | Market-informed advisory extension | `docs/architecture.md` logical architecture; no live demo claim |

## What is implemented now

The strongest demonstrated path is: select an Indian farmer profile; fetch live or cached weather context; generate a structured Vertex AI advisory; inspect NDVI and provenance status; screen a leaf image conservatively with Vertex AI multimodal reasoning; persist the image to private Cloud Storage and write non-identifying advisory provenance to BigQuery; and switch the interface between English and Hindi. The UI explicitly labels live, fallback, disabled, and configured states.The deployed project is configured for these services. If an individual request fails, the UI shows a labelled fallback or failure status.

## What requires user-owned GCP activation

The user must register Earth Engine, create or select the Cloud Storage bucket, create the BigQuery dataset/table, configure the relevant environment variables, and deploy to Cloud Run. No credentials are embedded in the repository or handled by the agent. Until activated, the system remains usable through safe fallbacks.

## Exact challenge alignment

> **Track 4 — AgriN & Regenerative Agricultural Intelligence**
>
> **BRICS Theme: Cooperation**
>
> The implementation addresses the challenge through localized weather and soil context, regenerative recommendations, satellite NDVI readiness, conservative crop-disease screening, state-specific configuration, provenance metadata, and a Cloud Run-ready architecture. The project is designed as a scalable digital public good, while distinguishing current evidence from future extensions.

## References

1. [Google Cloud Run](https://cloud.google.com/run/docs)
2. [Vertex AI Generative AI](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/overview)
3. [Google Earth Engine](https://developers.google.com/earth-engine)
4. [Cloud Storage](https://cloud.google.com/storage/docs)
5. [BigQuery](https://cloud.google.com/bigquery/docs)
6. [Hack2Skill Code for Communities — Second Edition](https://hack2skill.com/event/codeforcommunities2)
