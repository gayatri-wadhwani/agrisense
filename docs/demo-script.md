# Agrisense — Final Judge Demo Script

**Target length:** 3–5 minutes  
**Demo path:** Field context → Field advisory → Leaf screening → State-ready scale

## 0:00–0:30 — Problem and promise

**Say:**

> Farmers make time-sensitive decisions using weather, soil, satellite, and plant-health signals that are usually scattered across different tools. Agrisense brings those signals into one guided workspace: one context form, one explainable field brief, one conservative leaf screen, and one scale-readiness view.

**Action:** Open the deployed Cloud Run URL. Point out the four numbered steps at the top. Do not scroll through a long dashboard; the product is intentionally sequential.

## 0:30–1:10 — Step 1: Field context

**Action:**

1. Select **Meera Patil**.
2. Confirm Maharashtra, Nashik, Cotton, flowering stage, drip irrigation, and the soil snapshot.
3. Click **Generate advisory**.

**Say:**

> Step 1 captures the minimum context needed to avoid generic advice. The form is designed for a farmer or field facilitator, and the profile shortcuts make the pilot easy to demonstrate without hiding the underlying fields.

## 1:10–2:00 — Step 2: Field advisory

**Action:** Show the generated field brief. Point to:

- weather provenance;
- confidence framing;
- immediate next action;
- regenerative practices;
- weather risks and referral guidance;
- telemetry and provider provenance.

**Say:**

> The server calls Vertex AI Gemini directly through the Google Cloud project and asks for a structured response. The result is intentionally explainable: actions, regenerative practices, risks, assumptions, confidence, and a referral path. If a provider fails, the safe fallback is explicitly labelled rather than presented as live output.

Click **View full field plan**, then **Continue to leaf screening**.

## 2:00–3:00 — Step 3: Leaf screening

**Action:**

1. Upload a real JPG/PNG/WebP leaf image, or use the curated screening demo.
2. Keep the preview visible in the correctly framed image box.
3. Show possible issue, visual observations, confidence, safe next steps, and referral.

**Say:**

> This is multimodal Vertex AI Gemini screening, not a definitive diagnosis. The system returns possible visual signals and confidence framing, then directs the user to local expert verification. The uploaded image is handled server-side and, when the configured bucket is available, persisted as a private Cloud Storage object with controlled access.

Click **Continue to scale readiness**.

## 3:00–3:40 — Step 4: State-ready scale

**Action:** Expand the interoperability panel and show the configured statuses for:

- **Earth Engine:** live Sentinel-2 NDVI path;
- **Cloud Storage:** private leaf-image persistence;
- **BigQuery:** non-identifying advisory telemetry;
- **Cloud Run:** single deployable service boundary.

**Say:**

> The Google Cloud data plane is part of the configured implementation, not a future mock. Earth Engine supplies the satellite context, Cloud Storage keeps leaf objects private, and BigQuery receives non-identifying provenance. The UI exposes the status of each adapter so a judge can distinguish a live path from a failed request instead of trusting an unlabelled number.

## 3:40–4:10 — Reach and responsibility

**Action:** Toggle Hindi and point to the state-model and language-pack indicators.

**Say:**

> The shared application contract stays stable while state-specific crop calendars, language packs, soil thresholds, and approved rules are versioned as configuration. That is the portability path across Indian states and, with reviewed local models, other BRICS contexts. The product is decision support: it does not prescribe pesticides or replace agronomists.

## Closing line

> Agrisense turns fragmented field signals into a clearer next decision, with Google Cloud execution, explicit provenance, conservative screening, and a deployment path that can move from one district to many communities.

## Recording checklist

- [ ] Start on the public Cloud Run URL.
- [ ] Show all four steps in order; do not present the old single-page layout.
- [ ] Show a live Vertex advisory success response.
- [ ] Show a live Vertex image-screening response.
- [ ] Show private Cloud Storage status after upload.
- [ ] Show live Earth Engine and BigQuery statuses from the configured project.
- [ ] Toggle Hindi.
- [ ] Never show `.env`, service-account JSON, access tokens, or secret values.
- [ ] If a provider request fails, say so and show the labelled failure/fallback state; do not call it live.
