# Agrisense — Hack2Skill Pitch Deck

## Slide 1 — Agrisense

**Clarity for the next farm decision.**

A Google Cloud-powered, multilingual farmer advisory workspace for weather-aware, regenerative, and safer crop decisions.

Agricultural Intelligence · Cooperation · Built for India

## Slide 2 — The problem

Small and marginal farmers often make high-consequence crop decisions with fragmented weather, soil, and plant-health information. A missed weather window, an unseen soil stressor, or an overconfident disease guess can reduce resilience and income.

The gap is not a lack of information. It is a lack of **localised, explainable, actionable guidance** at the moment of decision.

## Slide 3 — Who we serve

Agrisense is designed for farmers and field facilitators who need a fast decision brief rather than a technical dashboard.

The MVP demonstrates Maharashtra cotton, Andhra Pradesh chilli, and Bihar rice profiles, while the shared model supports state-specific crop calendars, language packs, soil thresholds, and approved rules.

## Slide 4 — The solution

A farmer enters state, district, crop, growth stage, irrigation method, and basic soil signals. Agrisense adds local weather context and returns a structured field brief with risk, immediate actions, regenerative practices, weather risks, assumptions, confidence framing, and referral guidance.

The workflow is designed to be useful even when a live provider is temporarily unavailable.

## Slide 5 — Meaningful Google AI

**Vertex AI Gemini text generation** produces a structured field brief from farmer context and weather signals.

**Vertex AI Gemini multimodal analysis** screens a crop-leaf image conservatively and returns a possible issue, visual observations, confidence, safe next steps, and referral guidance.

The server keeps AI calls away from the browser, validates the response shape, and falls back to safe deterministic guidance when the provider is unavailable.

## Slide 6 — Data and provenance

Live Open-Meteo weather supplies temperature, rainfall, humidity, and soil-moisture context for the chosen coordinates. The UI labels live versus cached values.

The demo shows the NDVI card with an honest live-versus-fallback label. When configured, Earth Engine computes point NDVI from Sentinel-2; otherwise cached context remains explicitly labelled. Advisory responses expose state model version, rules pack, language pack, provider, weather source, satellite source, adapter readiness, and telemetry status.

No fabricated impact, disease certainty, or unconfigured live-satellite claim is presented.

## Slide 7 — Safety by design

Agrisense is decision support, not a diagnosis or pesticide-prescription engine.

The output uses confidence framing, possible-issue language, safe observation steps, and referral to local agricultural expertise. It avoids definitive disease claims and unsafe product dosages.

The fallback path is visible rather than hidden, so users and judges can distinguish AI output from demo-safe guidance.

## Slide 8 — Interoperability and India-scale reach

The shared farmer experience remains stable while state adapters provide crop calendars, translations, soil thresholds, approved rules, and provenance metadata. The same contract connects configured Earth Engine geospatial context, private Cloud Storage leaf objects, and BigQuery provenance telemetry.

This makes the architecture portable from one district to multiple Indian states and provides a path toward adaptation for other BRICS contexts without claiming local agronomy that has not been validated.

## Slide 9 — Deployability

The application is a stateless React + Express + tRPC service designed for Cloud Run. The logical architecture follows a Google Cloud service boundary with Vertex AI, Earth Engine, external weather, Cloud Storage, and BigQuery; the current runtime keeps the already-tested React farmer workspace rather than introducing a late Mesop/FastAPI rewrite.

A credible pilot can start with one crop and district: validate Vertex AI locally, activate registered Earth Engine/Storage/BigQuery adapters, then add reviewed state configuration rather than fork the platform.

## Slide 10 — Demo and next steps

The demo shows: select a farmer profile; generate a structured weather-aware advisory; inspect the live/cached labels and provenance; upload a leaf image for Vertex AI multimodal screening; show safe fallback behavior; switch English/Hindi; and open the interoperability panel.

Earth Engine NDVI, Cloud Storage image persistence, and BigQuery provenance telemetry are configured in the submission project and are shown with live status labels in the final demo. Cloud Text-to-Speech regional audio and Agmarknet mandi prices remain future scope until each has a validated farmer-facing journey.

**Agrisense turns fragmented signals into a safer next decision.**
