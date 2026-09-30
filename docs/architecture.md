# Agrisense — Architecture Decision Record

## Recommendation

The proposed architecture is **conceptually more aligned with the challenge** because it makes the Google Cloud data plane explicit: Vertex AI, Earth Engine, external agricultural APIs, a sanitized payload boundary, BigQuery telemetry, and a regional audio output. However, the best submission architecture for Agrisense is not a late rewrite to Mesop and FastAPI. The existing React + Express + tRPC implementation already delivers the farmer journey, direct Vertex AI text and multimodal reasoning, live weather, safe fallbacks, configured Earth Engine NDVI, private Cloud Storage persistence, and BigQuery telemetry.

The recommended approach is therefore to adopt the proposed architecture as the **logical system architecture** while preserving the current implementation as the **working MVP runtime**. This maximizes judging alignment without introducing a risky framework migration immediately before submission.

> Use the proposed boxes to explain the system boundary; use the actual implementation names when demonstrating or submitting the repository.

## Logical architecture used for the submission

```text
[ FARMER TOUCHPOINT ]
 React 19 + Tailwind farmer workspace
 (English/Hindi active; Marathi pack ready for review)
                     |
                     v
[ GOOGLE CLOUD RUN SERVICE ]
 Express 4 + tRPC 11 server runtime
                     |
       +-------------+-------------+----------------+
       |                           |                |
       v                           v                v
[ VERTEX AI ]              [ EARTH ENGINE ]   [ EXTERNAL WEATHER ]
Gemini structured         Sentinel-2 NDVI    Open-Meteo forecast
advisory + multimodal     optional live path  live + cached fallback
leaf screening             cached fallback
       |                           |                |
       +-------------+-------------+----------------+
                     v
             [ SANITIZED PAYLOAD ]
     source labels, confidence, assumptions,
     state/rules/language provenance, no secrets
                     |
       +-------------+----------------+
       |                              |
       v                              v
[ CLOUD STORAGE ]               [ BIGQUERY ]
Private leaf objects            Optional non-identifying
short-lived signed reads        advisory telemetry
lifecycle cleanup               non-blocking writes

[ FUTURE SCOPE ]
Cloud Text-to-Speech / Translation for regional audio delivery
Agmarknet mandi prices after a validated source adapter and farmer-facing journey
```

## Implementation mapping

| Logical layer | Current implementation | Truthful submission wording |
|---|---|---|
| Farmer touchpoint | `client/src/pages/Home.tsx` | React farmer workspace; not Google Mesop |
| Server runtime | `server/_core/index.ts`, Express, tRPC | Cloud Run-ready Node service; not FastAPI |
| AI reasoning | `server/vertex.ts` using direct Vertex AI | Live Google Cloud AI for structured advisory and multimodal screening |
| Satellite context | `server/gcpAdapters.ts` using Earth Engine SDK when enabled | Optional live Sentinel-2 NDVI with cached fallback |
| Weather | `server/routers.ts` Open-Meteo adapter | Live external weather with labelled cached fallback |
| Sanitization/provenance | `server/routers.ts`, `shared/agriConfig.ts` | Server-side source labels, confidence, assumptions, and state-model metadata |
| Image persistence | `server/gcpAdapters.ts` using Cloud Storage | Optional private object persistence with signed reads and lifecycle cleanup |
| Telemetry | `server/gcpAdapters.ts` using BigQuery | Optional non-identifying, non-blocking advisory provenance |
| Regional audio | Not implemented | Future scope until language QA, consent, and a working demo path exist |
| Mandi prices | Not implemented | Future scope until Agmarknet access, licensing, freshness, and fallback are validated |

## Why not migrate to Mesop/FastAPI now?

Mesop and FastAPI would make the architecture diagram visually closer to a Python-first Google Cloud reference design, but a migration would replace the already-tested UI, typed tRPC contracts, upload flow, and server integrations. It would also consume time without adding a required farmer capability. The hackathon value comes from meaningful Google AI usage, community relevance, India-scale interoperability, deployability, and honest evidence—not from using a particular frontend framework when that framework is not a compulsory requirement.

A future Python service can be added behind the same sanitized payload contract if the team later needs Python-native geospatial processing, scheduled data science jobs, or a Mesop-based internal operations console. That should be a deliberate second-stage architecture change, not a submission-week rewrite.

## Audio decision

Keep **Cloud Text-to-Speech and regional neural audio as future scope**. It is a strong inclusion and accessibility idea, but it should not be represented as implemented until the project has a working language-specific audio journey, consent and privacy treatment, a browser playback path, and a recorded demo. The current bilingual text interface and Marathi-ready language registry are safer evidence for this submission.

## Architecture boundaries for the demo

The demo should show one complete path: farmer profile, weather context, Vertex AI advisory, conservative leaf screening, NDVI source status, adapter readiness, provenance, and bilingual interface. If the user’s project has configured Earth Engine, Cloud Storage, and BigQuery, the recording may show their live statuses. Otherwise, the demo must call them disabled or fallback paths. No credential, private key, unvalidated disease certainty, fabricated impact statistic, or unimplemented Agmarknet integration should appear in the submission.

## References

1. [Google Cloud Run documentation](https://cloud.google.com/run/docs)
2. [Google Earth Engine service-account guidance](https://developers.google.com/earth-engine/guides/service_account)
3. [Vertex AI Gemini documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/overview)
4. [Google Cloud Text-to-Speech documentation](https://cloud.google.com/text-to-speech/docs)
5. [Code for Communities — Second Edition](https://hack2skill.com/event/codeforcommunities2)
