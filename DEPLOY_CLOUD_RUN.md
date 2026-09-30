# Deploy Agrisense to Cloud Run

This is the shortest deployment path for the configured project:

- **Project:** `agrisense-506317`
- **Region:** `asia-south1`
- **Bucket:** `agrisense-leaves-506317`
- **BigQuery dataset:** `agrisense_telemetry`
- **Cloud Run service:** `agrisense`

## 1. Prepare the local machine

Open PowerShell in the repository root and verify the tools:

```powershell
gcloud.cmd --version
node --version
pnpm.cmd --version
```

Authenticate both the CLI and local Google Cloud SDK:

```powershell
gcloud.cmd auth login
gcloud.cmd auth application-default login
gcloud.cmd config set project agrisense-506317
gcloud.cmd config set run/region asia-south1
```

Do not commit the ADC file, service-account JSON, or `.env`.

## 2. Enable required services

```powershell
gcloud.cmd services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com aiplatform.googleapis.com earthengine.googleapis.com storage.googleapis.com bigquery.googleapis.com
```

## 3. Verify locally against Vertex

```powershell
Copy-Item docs/environment.template .env
$env:EARTH_ENGINE_SERVICE_ACCOUNT_JSON=(Get-Content .\earthengine-service-account.json -Raw)
pnpm.cmd dev
```

Open `http://localhost:3000`, run all four steps, upload a leaf, and confirm the adapter cards show the configured statuses. Keep the service-account JSON local only.

## 4. Create or verify the Cloud Run runtime service account

```powershell
gcloud.cmd iam service-accounts create agrisense-runtime --display-name="Agrisense Cloud Run runtime"
gcloud.cmd projects add-iam-policy-binding agrisense-506317 --member="serviceAccount:agrisense-runtime@agrisense-506317.iam.gserviceaccount.com" --role="roles/aiplatform.user"
gcloud.cmd projects add-iam-policy-binding agrisense-506317 --member="serviceAccount:agrisense-runtime@agrisense-506317.iam.gserviceaccount.com" --role="roles/earthengine.resourceViewer"
gcloud.cmd projects add-iam-policy-binding agrisense-506317 --member="serviceAccount:agrisense-runtime@agrisense-506317.iam.gserviceaccount.com" --role="roles/storage.objectAdmin"
gcloud.cmd projects add-iam-policy-binding agrisense-506317 --member="serviceAccount:agrisense-runtime@agrisense-506317.iam.gserviceaccount.com" --role="roles/bigquery.dataEditor"
gcloud.cmd projects add-iam-policy-binding agrisense-506317 --member="serviceAccount:agrisense-runtime@agrisense-506317.iam.gserviceaccount.com" --role="roles/bigquery.jobUser"
```

If the service account already exists, continue with the IAM bindings.

## 5. Deploy the public prototype

From the repository root:

```powershell
gcloud.cmd run deploy agrisense --source . --region asia-south1 --service-account agrisense-runtime@agrisense-506317.iam.gserviceaccount.com --allow-unauthenticated --set-env-vars="AGRISENSE_AI_PROVIDER=vertex,AGRISENSE_REQUIRE_VERTEX=true,GOOGLE_CLOUD_PROJECT=agrisense-506317,GOOGLE_CLOUD_LOCATION=asia-south1,AGRISENSE_VERTEX_MODEL=gemini-2.5-flash,WEATHER_API_BASE_URL=https://api.open-meteo.com/v1/forecast,AGRISENSE_DEFAULT_LANGUAGE=en,AGRISENSE_EARTH_ENGINE_ENABLED=true,AGRISENSE_GCS_BUCKET=agrisense-leaves-506317,AGRISENSE_GCS_SIGNED_URL_MINUTES=30,AGRISENSE_BQ_DATASET=agrisense_telemetry,AGRISENSE_BQ_TABLE=advisory_events"
```

The command prints the public service URL. That URL is the **working prototype link** for the Hack2Skill form.

Retrieve it again at any time:

```powershell
gcloud.cmd run services describe agrisense --region asia-south1 --format="value(status.url)"
```

Copy the returned `https://...run.app` address into **Submit your working prototype link**.

## 6. Verify the public link

Open the URL in an incognito window and run this sequence:

1. Select Meera Patil.
2. Generate the advisory and confirm the live Vertex response.
3. Upload a leaf image and confirm private Cloud Storage status.
4. Continue to scale readiness and confirm Earth Engine and BigQuery statuses.
5. Toggle Hindi.

If needed, inspect only non-secret logs:

```powershell
gcloud.cmd run services logs read agrisense --region asia-south1 --limit 50
```

## 7. Submission links

- **GitHub:** make the repository public and copy its `https://github.com/...` URL.
- **Prototype:** copy the Cloud Run `https://...run.app` URL.
- **Demo video:** upload to YouTube as Unlisted or Google Drive with **Anyone with the link** access.
- **Deck:** upload the PDF deck. This session cannot create a native editable `.pptx`; the PDF is the supported submission artifact here.
