# Agrisense — Submission Brief

Agrisense is a Google Cloud-powered farmer advisory workspace that turns fragmented weather, soil, and plant-health signals into structured, explainable field briefs. Using direct Vertex AI text and multimodal Gemini analysis, it provides small and marginal farmers with weather-aware regenerative recommendations and conservative crop-leaf screening—designed as an interoperable Digital Public Good for India-scale reach.

The India-scale data plane is implemented as configured server adapters: Earth Engine computes Sentinel-2 point NDVI; Cloud Storage persists private leaf images with short-lived signed reads and lifecycle cleanup; and BigQuery receives non-identifying advisory provenance through a non-blocking writer. The recording shows the live status of each path and labels any request-level failure honestly. English/Hindi readiness, state-model metadata, safe fallbacks, and Cloud Run deployment guidance are included.
