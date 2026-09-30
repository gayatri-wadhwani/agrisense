# Agrisense

Agrisense is a demo-ready, safety-aware farmer advisory workspace for Indian agriculture. It helps a farmer combine field context, weather signals, soil-health inputs, and a curated leaf-screening path into one explainable next-step brief.

## Why this project fits the challenge

The Agricultural Intelligence problem asks for an interoperable digital agriculture network that provides localised agro-advisories, regenerative crop recommendations, satellite and weather context, disease diagnostics, and a shared model across Indian states. Agrisense demonstrates that core journey in a deliberately small vertical slice: the platform stays common while state-specific crop calendars, language packs, soil thresholds, and approved rules are represented as configurable model layers.

The app is designed for a judge to understand in under three minutes. Select Meera Patil, Ravi Kumar, or Sita Devi; review the field context; click **Generate advisory**; inspect the weather/source label; and open the curated leaf-screening and interoperability panels.

## Implemented capabilities

| Capability | Current status | Notes |
|---|---|---|
| Farmer intake | Implemented | State, district, crop, growth stage, irrigation, pH, organic carbon, soil moisture, and coordinates |
| Three demo profiles | Implemented | Demo-only seed profiles for Nashik cotton, Guntur chilli, and Madhubani rice |
| Live weather | Implemented | Server-side Open-Meteo request with temperature, rainfall, humidity, and soil-moisture context |
| Cached weather fallback | Implemented | Clearly labelled deterministic fallback when the live provider fails |
| AI advisory | Implemented | Direct Vertex AI Gemini response through Application Default Credentials, with deterministic safe fallback |
| Safety framing | Implemented | Confidence, assumptions, referral guidance, and no definitive disease/pesticide claims |
| Leaf screening | Vertex AI multimodal + curated fallback | Upload a JPG/PNG/WebP image for conservative structured screening; curated demo remains available when Vertex is unavailable |
| English/Hindi readiness | Implemented | Language toggle updates the main farmer-facing interface copy |
| Interoperability | Implemented as architecture panel | Shows crop calendars, language packs, soil thresholds, and approved rules as state-specific layers |
| Earth Engine / NDVI | Implemented as optional live adapter | Computes a point NDVI from Sentinel-2 through the Earth Engine SDK when enabled; clearly labelled cached fallback otherwise |
| Cloud Storage leaf persistence | Implemented as optional server-side upload | Private object upload with short-lived V4 signed URL; screening continues if the bucket is unavailable |
| BigQuery telemetry | Implemented as optional non-blocking writer | Streams non-identifying advisory provenance to a configured dataset/table; advisory generation never depends on telemetry success |
| Speech, Translation, Maps | Not enabled in the stable demo path | Add only when the corresponding judged user journey is implemented and tested |

The project intentionally does **not** claim to use every Google Cloud service listed on the event page. A service-count checklist is less valuable than a reliable end-to-end farmer experience. This release uses direct Vertex AI for structured text advisory and multimodal leaf screening, Cloud Run-compatible full-stack architecture, and configured Earth Engine, Cloud Storage, and BigQuery adapters. Each adapter exposes a transparent status so a request-level failure is visible rather than misrepresented.

The shared model registry is also **regional-language and governance ready**. English and Hindi are active in the demo, Marathi (`mr-IN`) is represented as a ready-for-review language pack, and every state model carries an approval status, review authority, and versioned change policy. This is a portability contract, not a claim that agronomy has already been approved by a state department.

## Architecture

```text
React + Tailwind farmer workspace
          |
          v
tRPC procedure: advisory.generate
          |
          +--> Open-Meteo live forecast API
          |       \-> cached demo fallback on timeout/error
          |
          +--> direct Vertex AI Gemini via @google/genai + ADC
          |       \-> deterministic safety fallback on missing config/provider failure
          |
          +--> state-model configuration concept
          |       crop calendars, language packs, thresholds, approved rules
          |
          +--> optional Google Earth Engine Sentinel-2 NDVI
          |       \\-> cached NDVI fallback when disabled/unavailable
          |
          +--> optional Cloud Storage leaf persistence
          |       \\-> request-scoped image handling when bucket is absent
          |
          +--> configured BigQuery advisory telemetry
          |       \\-> non-blocking write; status returned to UI
          |
          v
Structured advisory JSON rendered as actions, risks, assumptions, confidence, referral, and provenance
```

The app is a React 19 frontend with Tailwind 4, Express 4, tRPC 11, and a TypeScript server. The AI calls are server-side so provider credentials are not exposed in the browser. Vertex AI is used for both structured advisory generation and conservative multimodal leaf screening. The weather call is also server-side, with a four-to-five-second request boundary and a clearly labelled cached response. See [`docs/architecture.md`](docs/architecture.md) for the architecture decision record comparing the proposed Mesop/FastAPI shape with the working MVP runtime. The visual system map is [`docs/gcp-architecture.png`](docs/gcp-architecture.png), with editable Mermaid source at [`docs/gcp-architecture.mmd`](docs/gcp-architecture.mmd), and the complete inventory is [`docs/tech-stack.md`](docs/tech-stack.md).

## Prerequisites

Install Node.js 22 or newer, pnpm 10 or newer, Git, and a Google Cloud account if you want to deploy to Cloud Run or connect a direct Vertex AI provider. A local demo can run with the project’s safe fallback and does not require a database migration.

## Local setup

```bash
git clone <your-repository-url>
cd agrisense-ai
pnpm install
cp docs/environment.template .env  # local only; never commit .env
pnpm check
pnpm test
pnpm dev
```

Open the local URL printed by the development server. Do not hardcode a port in scripts or deployment configuration; the managed runtime supplies the port.

The prefilled profiles are deliberately included for repeatable judging. They are not customer records and should be replaced with an authenticated farmer profile store before production use.

## Environment variables

The repository must not contain real secrets. Use the project’s secret manager or your deployment platform for production values.

| Variable | Required | Purpose |
|---|---:|---|
| `WEATHER_API_BASE_URL` | No | Defaults to Open-Meteo forecast endpoint; override for an approved provider or proxy |
| `AGRISENSE_LLM_MODEL` | No | Model name used by the project LLM adapter |
| `AGRISENSE_DEFAULT_LANGUAGE` | No | `en` or `hi`; the interface toggle remains available |
| `VITE_APP_TITLE` | Project/runtime | Browser title |
| `VITE_APP_LOGO` | Project/runtime | Optional application logo |
| `AGRISENSE_AI_PROVIDER` | Recommended | Use `vertex`; `fallback` is available for offline demos |
| `GOOGLE_CLOUD_PROJECT` | Required for Vertex | Your Google Cloud Project ID; never a secret |
| `GOOGLE_CLOUD_LOCATION` | Recommended | Vertex region, default `asia-south1` |
| `AGRISENSE_VERTEX_MODEL` | Recommended | Vertex model ID, default `gemini-2.5-flash` |
| `AGRISENSE_EARTH_ENGINE_ENABLED` | No | Set `true` only after Earth Engine project registration and service-account setup |
| `EARTH_ENGINE_SERVICE_ACCOUNT_JSON` | Only for live EE | Local/Secret Manager JSON for the dedicated Earth Engine service identity; never commit |
| `EARTH_ENGINE_DATE_START` / `EARTH_ENGINE_DATE_END` | No | Sentinel-2 observation window |
| `EARTH_ENGINE_MAX_CLOUD_PERCENT` | No | Maximum cloud filter, default `35` |
| `AGRISENSE_GCS_BUCKET` | No | Private bucket for leaf-screening images; empty disables persistence |
| `AGRISENSE_GCS_SIGNED_URL_MINUTES` | No | Signed URL lifetime, default `30` |
| `AGRISENSE_BQ_DATASET` | No | BigQuery dataset for advisory events; empty disables telemetry |
| `AGRISENSE_BQ_TABLE` | No | BigQuery table, default `advisory_events` |
| `PORT` | Runtime-provided | Supplied by local tooling or Cloud Run; do not hardcode |
| `NODE_ENV` | Script-provided | Set by `pnpm dev`, `pnpm build`, and `pnpm start` |
| `VITE_ANALYTICS_ENDPOINT` | Not needed | Analytics is intentionally disabled when unset |
| `VITE_ANALYTICS_WEBSITE_ID` | Not needed | Analytics is intentionally disabled when unset |

For a normal local Vertex setup, the only project-specific value you must enter is `GOOGLE_CLOUD_PROJECT`; authentication comes from `gcloud auth application-default login`. The remaining Vertex values have safe defaults. For Cloud Run, use a runtime service account and set the same non-secret variables through the deployment configuration rather than committing them to `.env`.
The file `docs/environment.template` lists the variable names and safe defaults. In the managed project, enter secrets through the project’s Secrets settings rather than committing a local `.env` file.

Do not put Google service-account JSON into the frontend or commit it to Git. If Earth Engine or direct Vertex AI is added, use workload identity or Secret Manager and grant the smallest possible service-account permissions.

## GCP deployment path

The current repository is compatible with a single Cloud Run service. The lowest-risk deployment path is:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
gcloud run deploy agrisense-ai --source . --region asia-south1 --allow-unauthenticated
```

Set runtime variables through the Cloud Run UI or CLI rather than committing `.env`:

```bash
gcloud run services update agrisense-ai \
  --region asia-south1 \
  --set-env-vars GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,GOOGLE_CLOUD_LOCATION=asia-south1,AGRISENSE_AI_PROVIDER=vertex,AGRISENSE_VERTEX_MODEL=gemini-2.5-flash,WEATHER_API_BASE_URL=https://api.open-meteo.com/v1/forecast,AGRISENSE_DEFAULT_LANGUAGE=en
```

For a direct Vertex AI integration, also enable `aiplatform.googleapis.com`, attach a runtime service account, and grant only the Vertex AI invocation role required by the service. Local Application Default Credentials do not transfer into Cloud Run. The direct Google Cloud adapter is kept behind one server function so the farmer UI remains independent of provider-specific details.

Earth Engine, Cloud Storage, and BigQuery are now implemented as optional adapters. Follow the exact commands in `SETUP_LOCAL.md` to register Earth Engine, create the private bucket and lifecycle rule, create the BigQuery table, and grant least-privilege permissions. The UI reports `live`, `fallback`, `configured`, `disabled`, and telemetry status values so a judge can distinguish a working adapter from a safe local fallback. Speech, Translation, Maps, and Dialogflow remain future extensions until they have a user journey, language QA, and a testable fallback.

## Testing and validation

```bash
pnpm check
pnpm test
pnpm build
```

The suite covers cached weather fallback, source labelling, advisory safety framing, referral guidance, prefilled-profile-to-advisory contract, and disabled-safe Google Cloud adapter behavior. The responsive layout has been reviewed at desktop and mobile widths.

## Judge demo script

First, select **Meera Patil** to load a Nashik cotton profile. Point out that the farmer’s state, district, crop stage, irrigation method, and basic soil signals are visible before any AI response is generated. Click **Generate advisory** and explain the weather cards, live/fallback source label, risk level, immediate actions, regenerative practices, assumptions, confidence framing, and referral guidance.

Next, use the **Vertex AI leaf screening** upload control with a representative JPG, PNG, or WebP leaf photo. Explain that the server sends the image to Gemini through Vertex AI and returns a structured possible issue, visual observations, confidence, safe next steps, and referral guidance. If Vertex AI is unavailable, the app visibly falls back to the curated safe screening path; neither path is a definitive disease diagnosis. Show the NDVI card and call out whether the result is live Earth Engine or the cached fallback. After generating an advisory, point to the adapter status and telemetry status labels. For the leaf upload, explain that the image is persisted to a private Cloud Storage bucket only when configured and otherwise remains request-scoped. Finally, expand the interoperability panel and explain that a new state can supply its crop calendar, translations, soil thresholds, approved rules, and provenance metadata without changing the shared farmer workflow.

## Responsible AI and limitations

Agrisense is an agricultural decision-support prototype. It is not a substitute for a soil laboratory, plant pathologist, Krishi Vigyan Kendra, or state agriculture officer. The UI avoids definitive disease claims and unsafe pesticide prescriptions. Farmers should verify field observations and follow locally approved guidance.

The direct AI path uses Google Cloud Vertex AI through the official `@google/genai` SDK. The server reads `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, and `AGRISENSE_VERTEX_MODEL`; credentials stay server-side through Application Default Credentials locally and a runtime identity on Cloud Run. If these settings or provider access are unavailable, the server returns the deterministic safe response instead.

The stable MVP currently uses a curated leaf-screening path instead of claiming a fully trained disease classifier, and it uses a cached weather response when a live provider is unavailable. Those choices are intentional: a transparent fallback is safer for a hackathon demonstration than an unreliable live integration.

## Submission checklist

Before submitting, verify that the public demo URL works in a fresh browser, the README explains the Google AI/GCP architecture, and the recording shows one complete farmer journey. The strongest evidence sequence is: live weather retrieval, structured Vertex AI advisory, Vertex AI multimodal leaf upload, safe fallback behavior, cached NDVI labelling, and the state-model interoperability panel. Capture the Vertex success or fallback state, keep all live versus cached data labelled, confirm no secret is in Git, and state the limitations. Implemented now: Vertex AI text + multimodal screening, Cloud Run-ready service, live Open-Meteo weather, safe fallbacks, and configured Earth Engine NDVI, Cloud Storage persistence, and BigQuery telemetry. Google voice/translation services remain optional future work. Include screenshots or a short recording only through the event’s official submission form.

## Event alignment

This app targets the event’s **Agricultural Intelligence** problem statement under the **Cooperation** theme. It is designed as a multilingual, state-extensible Digital Public Good for Indian agricultural decision support. The event page should be checked again immediately before submission because its dynamic timeline, registration, and submission instructions may change.

## License

Choose and add a license before public reuse. For a hackathon submission, MIT is a practical default if all included dependencies and assets permit it.

## References

1. [Code for Communities — Second Edition](https://hack2skill.com/event/codeforcommunities2?utm_source=hack2skill&utm_medium=homepage)
2. [Google Cloud Run: deploy a Python FastAPI service](https://docs.cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-python-fastapi-service)
3. [Google Earth Engine service accounts](https://developers.google.com/earth-engine/guides/service_account)
4. [Open-Meteo API documentation](https://open-meteo.com/en/docs)
5. [Google Cloud Gemini structured output](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/capabilities/control-generated-output)

## Google Cloud judging-value matrix

| Google technology | Farmer-facing capability | Demo evidence | Fallback | Judging value |
|---|---|---|---|---|
| Vertex AI Gemini | Structured advisory from crop, soil, weather, and stage context | Click **Generate advisory** and show risk, actions, assumptions, confidence, and referral | Deterministic safe advisory | AI depth, safety, localisation, explainability |
| Vertex AI multimodal | Conservative crop-leaf screening from an uploaded image | Upload a JPG/PNG/WebP and show possible issue, observations, confidence, and safe next steps | Curated screening response | Multimodal AI applied to a real community problem |
| Cloud Run | Publicly deployable single-service farmer workspace | Open the HTTPS demo URL | Local `pnpm.cmd dev` | Scalability and reproducibility |
| Earth Engine | Optional live Sentinel-2 point NDVI | Enable the adapter and show `live-earth-engine`; otherwise the UI labels cached NDVI | Cached NDVI fallback | Geospatial context with truthful provenance |
| Cloud Storage | Optional private leaf-image persistence | Upload a leaf image and show configured bucket path through the screening response | Request-scoped image handling | Secure media pipeline path |
| BigQuery | Optional advisory provenance telemetry | Generate an advisory and show `written` telemetry status when dataset/table are configured | Non-blocking `disabled` or `failed` status | Interoperability, auditability, and regional trend readiness |
| Cloud Translation / Text-to-Speech | Future regional-language and voice delivery | Current interface is English/Hindi-ready | Text-only bilingual UI | Accessibility and inclusion |

This matrix intentionally distinguishes what is live in the MVP from what is a documented extension. Judges can see meaningful Google AI usage today without confusing a configured roadmap item with a production integration. The logical architecture includes a future regional-audio layer, but Cloud Text-to-Speech and Agmarknet mandi prices are not claimed as implemented until their farmer-facing journeys are validated.

## Exact Track 4 alignment

The submission is for **Track 4 — AgriN & Regenerative Agricultural Intelligence** under the **BRICS Theme: Cooperation**. The implemented path addresses localized agro-advisories using weather, soil inputs, regenerative recommendations, satellite NDVI readiness, and conservative crop-disease screening. The shared state-model registry, provenance metadata, and Cloud Run-ready service boundary provide the interoperability story for cooperation across Indian states and future BRICS data-model sharing. See [`docs/tech-stack.md`](docs/tech-stack.md) and [`docs/gcp-architecture.png`](docs/gcp-architecture.png) for the exact current stack and system map.

## Hack2Skill requirement traceability

The official-section audit is maintained in [`docs/hack2skill-traceability.md`](docs/hack2skill-traceability.md). It maps the published evaluation weights, compulsory rules, supported technology categories, demo evidence, and remaining optional extensions to the implementation.

Use [`docs/submission-evidence-template.md`](docs/submission-evidence-template.md) to record the final video/live-demo evidence. Review [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) before submission and add the source/license for any new image, dataset, or open-source component.

## Official requirement compliance

Agrisense is designed to satisfy the **Build with AI: Code for Communities** criteria:

- **Working prototype:** a functioning React + Express + tRPC service deployable to Cloud Run.
- **End-to-end flow:** connected farmer intake, live weather context, structured advisory, and multimodal leaf screening.
- **Mandatory Google AI:** direct Vertex AI Gemini integration for text generation and multimodal vision.
- **Realistic data:** live Open-Meteo weather with clearly labelled cached fallbacks for demo reliability.
- **India-scale reach:** schema-driven state adapters for crop calendars, language packs, and soil thresholds.
- **Multilingual support:** English/Hindi-ready interface with a regional language toggle.
- **Digital Public Good:** interoperable architecture allowing states to share models and rules without platform forks.

## Hackathon submission package

The following artifacts are prepared for the [Hack2Skill](https://hack2skill.com/event/codeforcommunities2) submission form:

- **Pitch deck (10 slides):** [`docs/pitch-deck.md`](docs/pitch-deck.md) (source) and the downloadable presentation artifact from the latest project release.
- **Brief description (2–3 lines):** [`docs/submission-brief.md`](docs/submission-brief.md).
- **Demo script (3–5 minutes):** [`docs/demo-script.md`](docs/demo-script.md) with step-by-step narration and actions.
- **Traceability matrix:** [`docs/hack2skill-traceability.md`](docs/hack2skill-traceability.md) mapping official requirements to code and evidence.
- **Pre-submission checklist:** [`docs/final-submission-checklist.md`](docs/final-submission-checklist.md) for repository, video, deck, and live link.
