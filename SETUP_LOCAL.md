# Agrisense — local and Google Cloud setup

This guide assumes you will run every Google Cloud command yourself. Do not send passwords, private keys, service-account JSON, API keys, or `.env` contents to anyone.

## 1. What is already usable without GCP credentials

The app can be started locally with Node.js and pnpm. Live weather uses Open-Meteo and has a labelled cached fallback. If the server-side AI gateway is unavailable, the application returns a deterministic, safety-aware advisory fallback. This is sufficient for a repeatable demo, but it is not the same as a live Vertex AI response.

The current project uses the preconfigured server-side project LLM adapter when its runtime environment is available. Setting `AGRISENSE_LLM_MODEL` by itself does not magically create a direct Vertex AI connection. A direct Vertex AI adapter is a separate integration and requires the Google Cloud project and authentication steps below.

## 2. Install local tools

### Windows quick start

Download the source ZIP delivered with this project and extract it with File Explorer using **Extract All**. Open PowerShell in the extracted `agrisense-ai` folder. Install Node.js 22 or newer from https://nodejs.org/ and Git from https://git-scm.com/download/win. The Google Cloud CLI is already installed on your machine. Restart PowerShell after installing Node.js so `node` and `npm` are available.

Install pnpm in PowerShell:

```powershell
corepack enable
corepack prepare pnpm@10.4.1 --activate
```

If `corepack` is unavailable, use https://pnpm.io/installation. Verify:

```powershell
node --version
pnpm --version
gcloud --version
```


Install Node.js 22 or newer, Git, and pnpm 10 or newer. Install the Google Cloud CLI from the official instructions: https://cloud.google.com/sdk/docs/install

Verify:

```bash
node --version
pnpm --version
gcloud --version
```

Docker is not required for the source-based Cloud Run deployment path. It is useful only if you want to build and test a container locally.

## 3. Create a new Google Cloud project

Use the Cloud Console at https://console.cloud.google.com/projectcreate to create a project. Choose a short display name such as `Agrisense Demo`; Google Cloud will assign a unique Project ID. Copy the Project ID exactly. Open **Billing** and link the project to the billing account that contains your available credits. If the credit is not visible, do not deploy billable services until the billing account is confirmed.

In PowerShell, replace `YOUR_PROJECT_ID` with your actual Project ID:

```powershell
gcloud auth login
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
gcloud config set run/region asia-south1
gcloud projects describe YOUR_PROJECT_ID --format="value(projectId)"
```

Enable the minimum APIs:

```powershell
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com aiplatform.googleapis.com
```

Do not send authentication output or tokens to chat. It is safe to send only the Project ID and names of enabled services if troubleshooting is needed.

## 4. Download and run the project locally

Extract `agrisense-ai-source.zip`, open a terminal in the extracted directory, and run:

```bash
cd agrisense-ai
pnpm install
cp docs/environment.template .env
pnpm check
pnpm test
pnpm dev
```

Open the URL printed by the development server. Do not commit `.env`. If the copied template contains empty project-specific values, the safe weather and deterministic advisory fallback should still let you inspect the interface.

### Existing-project alternative

Open https://console.cloud.google.com/ and select the project connected to your credit balance. Record the **Project ID**, not only the display name. Confirm that billing is enabled for the project and that the credit is attached to the same billing account.

Then authenticate locally:

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
gcloud config set run/region asia-south1
```

Verify without revealing secrets:

```bash
gcloud auth list
gcloud config get-value project
gcloud projects describe YOUR_PROJECT_ID --format='value(projectId)'
```

If the billing account is not already attached, use the Google Cloud Console Billing page. Do not paste billing-account credentials into chat.

## 5. Enable the minimum Cloud Run and Vertex APIs

Run this as the authenticated user with project-owner or equivalent API-admin permission:

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  aiplatform.googleapis.com
```

Confirm:

```bash
gcloud services list --enabled \
  --filter='config.name:(run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com aiplatform.googleapis.com)' \
  --format='table(config.name)'
```

Do not enable every Google API just to satisfy a checklist. Enable a service when it supports a working user journey.

## 6. Direct Vertex AI option

The stable demo can continue to use the project LLM adapter. For a direct Vertex AI implementation, the server must call the Vertex AI SDK using Application Default Credentials or a Cloud Run service identity. The minimum project preparation is:

```bash
gcloud services enable aiplatform.googleapis.com
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

For local code, the SDK should receive the project ID and region from environment variables such as:

```text
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
GOOGLE_CLOUD_LOCATION=asia-south1
AGRISENSE_LLM_MODEL=YOUR_SUPPORTED_GEMINI_MODEL
```

Do not place a service-account JSON file in the repository or frontend. Prefer Application Default Credentials locally and a dedicated Cloud Run service account or workload identity in deployment. Confirm the selected Gemini model is available in your chosen region using the Vertex AI Model Garden before changing the model name.

The app’s fallback must remain enabled. If Vertex AI returns quota, model, permission, or timeout errors, the user should still see a clearly identified safe fallback rather than a blank page.

## 7. Cloud Run deployment

From the project root, deploy the source-based application. In PowerShell, use a single line to avoid shell line-continuation differences:

```powershell
gcloud run deploy agrisense-ai --source . --region asia-south1 --allow-unauthenticated
```

Cloud Run will print the public service URL. Test it in a private browser window. Check the service in PowerShell:

```powershell
gcloud run services describe agrisense-ai --region asia-south1 --format="value(status.url)"
```

Set non-secret configuration through Cloud Run configuration. The runtime must receive the project ID explicitly; local ADC does not transfer into Cloud Run. Use Secret Manager for real credentials. In PowerShell, keep the command on one line:

```powershell
gcloud run services update agrisense-ai --region asia-south1 --set-env-vars="GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,GOOGLE_CLOUD_LOCATION=asia-south1,AGRISENSE_AI_PROVIDER=vertex,AGRISENSE_VERTEX_MODEL=gemini-2.5-flash,WEATHER_API_BASE_URL=https://api.open-meteo.com/v1/forecast,AGRISENSE_DEFAULT_LANGUAGE=en"
```

For direct Vertex AI, attach a dedicated runtime service account and grant only the required Vertex invocation permission. Do not make the default service account more powerful than necessary. Run from Bash or adapt the same values in PowerShell:

```bash
gcloud iam service-accounts create agrisense-runtime --display-name="Agrisense Cloud Run runtime"
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID --member="serviceAccount:agrisense-runtime@YOUR_PROJECT_ID.iam.gserviceaccount.com" --role="roles/aiplatform.user"
gcloud run services update agrisense-ai --region asia-south1 --service-account="agrisense-runtime@YOUR_PROJECT_ID.iam.gserviceaccount.com"
```

## 8. Earth Engine setup (configured integration)

Earth Engine is a configured production integration for this submission. Register the Cloud project for Earth Engine, enable the Earth Engine API, use the dedicated Earth Engine service account, and grant the documented permissions. Follow: https://developers.google.com/earth-engine/guides/service_account

After configuration, test a tiny region and one index request first. Set a strict timeout. If setup takes more than 60–90 minutes or permission errors remain, keep the cached satellite indicator and label it cached. Never display cached NDVI as live telemetry.

## 9. Cloud Storage for private leaf images (configured integration)

The configured screening path uses a private bucket for real uploads. The bucket is in the same region as Cloud Run:

```bash
gcloud storage buckets create gs://YOUR_UNIQUE_BUCKET_NAME \
  --location=asia-south1 \
  --uniform-bucket-level-access
```

Use a lifecycle rule to delete demo uploads, restrict object access, validate MIME type and file size server-side, and store only object metadata in the database. Do not expose the bucket publicly. Use short-lived signed URLs or a server proxy for reads.

For browser uploads, use a narrowly scoped CORS policy that allows only your deployed app origin, the required methods, and content headers. Create `cors.json` locally (do not put secrets in it):

```json
[
  {
    "origin": ["https://YOUR_CLOUD_RUN_HOSTNAME"],
    "method": ["GET", "PUT", "POST"],
    "responseHeader": ["Content-Type", "ETag"],
    "maxAgeSeconds": 3600
  }
]
```

Apply and verify it from your own machine:

```bash
gcloud storage buckets update gs://YOUR_UNIQUE_BUCKET_NAME --cors-file=cors.json
gcloud storage buckets describe gs://YOUR_UNIQUE_BUCKET_NAME --format='default(cors_config)'
```

Do not use `*` as the origin for a production bucket. If the upload uses a server proxy or signed URL, prefer keeping the bucket non-public and allow only the exact frontend origin. Update the origin when the Cloud Run hostname or custom domain changes.

The application keeps the curated sample as a safe continuity path, but the deployed demo should be recorded with the configured bucket available.

## 10. Verification checklist

Run the local checks:

```bash
pnpm check
pnpm test
pnpm build
pnpm package:source
```

For the deployed service, verify the following journey in a fresh browser: select Meera Patil, confirm Nashik and Cotton are loaded, click **Generate advisory**, inspect the live or cached weather label, open the curated screening panel, toggle Hindi, and expand the interoperability panel. Confirm that no secret appears in the browser network panel or frontend bundle.

## 11. Troubleshooting

If `gcloud` is not found, install or restart the terminal after installing the Google Cloud CLI. If `PERMISSION_DENIED` occurs, inspect the active account with `gcloud auth list` and confirm the project with `gcloud config get-value project`. If billing or API enablement fails, ask the project owner to grant the required IAM permission.

If Vertex AI fails locally, do not paste the error together with credentials. Capture only the error code and message, remove sensitive identifiers, and continue using the deterministic fallback. If Cloud Run deploy fails during build, run `pnpm check`, `pnpm test`, and `pnpm build` locally before retrying.

If Earth Engine fails, do not weaken permissions repeatedly. Return to the cached satellite path and document the integration as pending. If a weather request fails, the app should display its cached label and continue rendering the advisory workspace.

## 12. What to send back for guided assistance

You may send only non-secret outputs such as:

```bash
gcloud --version
gcloud auth list --format='table(account,status)'
gcloud config get-value project
gcloud services list --enabled --format='value(config.name)' | grep -E 'run|cloudbuild|artifactregistry|aiplatform|earthengine'
```

Never send `.env`, private keys, access tokens, service-account JSON, or the output of commands that print secret values.

## References

- Google Cloud CLI installation: https://cloud.google.com/sdk/docs/install
- Cloud Run source deployment: https://docs.cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-python-fastapi-service
- Earth Engine service accounts: https://developers.google.com/earth-engine/guides/service_account
- Vertex AI structured output: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/capabilities/control-generated-output
- Open-Meteo API: https://open-meteo.com/en/docs
- Hackathon page: https://hack2skill.com/event/codeforcommunities2?utm_source=hack2skill&utm_medium=homepage

## 14. Direct Vertex AI configuration

The app uses the official `@google/genai` SDK with Google Cloud Application Default Credentials when `AGRISENSE_AI_PROVIDER=vertex` and `GOOGLE_CLOUD_PROJECT` are configured. No OpenAI key is required. In PowerShell, set these non-secret values for the current session before starting the server:

```powershell
$env:AGRISENSE_AI_PROVIDER="vertex"
$env:GOOGLE_CLOUD_PROJECT="agrisense-506317"
$env:GOOGLE_CLOUD_LOCATION="asia-south1"
$env:AGRISENSE_VERTEX_MODEL="gemini-2.5-flash"
pnpm.cmd dev
```

The model name is configurable because Google’s available model catalog can change. If a selected model is unavailable in the chosen region, try another model shown in the Google Cloud Model Garden or temporarily use the safe deterministic fallback by setting `$env:AGRISENSE_AI_PROVIDER="fallback"`. Never place credentials in the frontend or commit them to Git.

## 15. Analytics is optional

The app does not load an analytics script when analytics configuration is absent. `VITE_ANALYTICS_ENDPOINT` and `VITE_ANALYTICS_WEBSITE_ID` are not required for the farmer workflow, judging demo, Vertex AI, weather, or Cloud Run. Leave them unset unless you intentionally configure an analytics provider and have an appropriate privacy notice.

## 16. Public demo access

The demo is intentionally unauthenticated so a judge can open it directly. Account-specific persistence is outside the current prototype scope.

## 17. Proactive PowerShell configuration block

After `gcloud.cmd auth application-default login` succeeds, use this block in the same PowerShell session. Replace only `YOUR_PROJECT_ID`; it contains no secret values:

```powershell
$env:AGRISENSE_AI_PROVIDER="vertex"
$env:GOOGLE_CLOUD_PROJECT="agrisense-506317"
$env:GOOGLE_CLOUD_LOCATION="asia-south1"
$env:AGRISENSE_VERTEX_MODEL="gemini-2.5-flash"
$env:WEATHER_API_BASE_URL="https://api.open-meteo.com/v1/forecast"
$env:AGRISENSE_DEFAULT_LANGUAGE="en"
$env:VITE_APP_TITLE="Agrisense"

pnpm.cmd dev
```

The public demo does not require account or gateway credentials. Do not set analytics variables unless you have selected an analytics provider and prepared a privacy notice. To use the deterministic offline mode temporarily, change only `AGRISENSE_AI_PROVIDER` to `fallback`.

A quick non-secret configuration check is:

```powershell
Get-ChildItem Env:AGRISENSE_AI_PROVIDER,Env:GOOGLE_CLOUD_LOCATION,Env:AGRISENSE_VERTEX_MODEL | Format-Table Name,Value
```

Do not print or share environment variables that contain credentials.

## 18. Configured Google Cloud data plane: Earth Engine, Cloud Storage, and BigQuery

The submission contains three server-side Google Cloud adapters. They are configured in the project and must be shown in the final recording with their live status labels. The application never receives service-account keys in the browser.

### Enable services and register Earth Engine

```powershell
gcloud.cmd services enable earthengine.googleapis.com storage.googleapis.com bigquery.googleapis.com
```

Earth Engine also requires project registration through the [Earth Engine Cloud Project Registration](https://code.earthengine.google.com/register) flow. Use the same project ID as `GOOGLE_CLOUD_PROJECT` and accept the project terms before testing a live request.

### Create the Cloud Storage bucket

Choose a globally unique bucket name and a region close to the intended pilot. The server writes private leaf images and returns short-lived V4 signed read URLs.

```powershell
$env:BUCKET="agrisense-leaves-$env:GOOGLE_CLOUD_PROJECT"
gcloud.cmd storage buckets create "gs://$env:BUCKET" --project=$env:GOOGLE_CLOUD_PROJECT --location=asia-south1 --uniform-bucket-level-access
gcloud.cmd storage buckets update "gs://$env:BUCKET" --lifecycle-file=docs/gcs-lifecycle.json
```

Do not make the bucket public. For Cloud Run, grant the runtime service account `roles/storage.objectCreator` and `roles/storage.objectViewer` on this bucket. Local development uses Application Default Credentials.

### Create the BigQuery telemetry table

The writer stores non-identifying provenance only: state, district, crop, language, provider/source labels, confidence, and timestamps.

```powershell
bq.cmd --location=asia-south1 mk --dataset "$env:GOOGLE_CLOUD_PROJECT:agrisense_telemetry"
bq.cmd query --use_legacy_sql=false "CREATE TABLE IF NOT EXISTS \`$env:GOOGLE_CLOUD_PROJECT.agrisense_telemetry.advisory_events\` (eventId STRING, insertedAt TIMESTAMP, generatedAt TIMESTAMP, state STRING, district STRING, crop STRING, language STRING, weatherSource STRING, satelliteSource STRING, advisoryProvider STRING, confidence FLOAT64)"
```

Grant the Cloud Run runtime service account `roles/bigquery.dataEditor` on the dataset and `roles/bigquery.jobUser` on the project if required by the deployment policy.

### Configure the adapters locally

After `gcloud.cmd auth application-default login`, copy `docs/environment.template` to `.env` and set the following values locally. Keep the Earth Engine service-account JSON in a local-only environment variable or Secret Manager; never commit it.

```powershell
$env:AGRISENSE_EARTH_ENGINE_ENABLED="true"
$env:EARTH_ENGINE_SERVICE_ACCOUNT_JSON=(Get-Content .\\earthengine-service-account.json -Raw)
$env:EARTH_ENGINE_DATE_START="2026-06-01"
$env:EARTH_ENGINE_DATE_END="2026-09-30"
$env:EARTH_ENGINE_MAX_CLOUD_PERCENT="50"
$env:AGRISENSE_GCS_BUCKET="agrisense-leaves-$env:GOOGLE_CLOUD_PROJECT"
$env:AGRISENSE_GCS_SIGNED_URL_MINUTES="30"
$env:AGRISENSE_BQ_DATASET="agrisense_telemetry"
$env:AGRISENSE_BQ_TABLE="advisory_events"
pnpm.cmd dev
```

With the final project configured, the expected live statuses are: Earth Engine `live`, Cloud Storage `configured` followed by `private Cloud Storage` after an upload, and BigQuery `written` after advisory generation. If any adapter is unavailable, the app continues safely and labels the affected path as fallback, request-scoped, or failed.
