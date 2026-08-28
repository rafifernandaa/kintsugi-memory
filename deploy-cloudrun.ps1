# Deploy Kintsugi Memory to Google Cloud Run with Dedicated Service Account & Vertex AI (PowerShell)
$PROJECT_ID = "my-project-31-491314"
$REGION = "us-west1"
$SERVICE_NAME = "kintsugi-memory-service"
$SA_NAME = "kintsugi-runner"
$SA_EMAIL = "$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

Write-Host "🌸 ====================================================================" -ForegroundColor Cyan
Write-Host "🌸 Deploying Kintsugi Memory Agent to Google Cloud Run" -ForegroundColor Cyan
Write-Host "🌸 Project: $PROJECT_ID | Region: $REGION | Service: $SERVICE_NAME" -ForegroundColor Yellow
Write-Host "🌸 Dedicated Service Account: $SA_EMAIL" -ForegroundColor Yellow
Write-Host "🌸 ====================================================================" -ForegroundColor Cyan

# 0. Check gcloud CLI
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Google Cloud SDK (gcloud) is not installed or not found in PATH." -ForegroundColor Red
    Write-Host "   Please install gcloud from https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# 1. Set active project
Write-Host "⚙️ Setting active GCP project to $PROJECT_ID..." -ForegroundColor Cyan
gcloud config set project $PROJECT_ID

# 2. Enable required Google Cloud APIs
Write-Host "⚡ Enabling Google Cloud Services (Vertex AI, Cloud Run, Cloud Build, Speech-to-Text, Pub/Sub, IAM, Artifact Registry)..." -ForegroundColor Cyan
gcloud services enable aiplatform.googleapis.com run.googleapis.com cloudbuild.googleapis.com speech.googleapis.com pubsub.googleapis.com artifactregistry.googleapis.com iam.googleapis.com

# 3. Create Dedicated Service Account if not exists
Write-Host "👤 Ensuring dedicated Service Account ($SA_NAME) exists..." -ForegroundColor Cyan
gcloud iam service-accounts create $SA_NAME --display-name="Kintsugi Memory Dedicated Service Account" --description="Runtime service account for Kintsugi Memory Cloud Run container" 2>$null

# 4. Grant required IAM roles to Dedicated Service Account
Write-Host "🔐 Binding IAM roles to $SA_EMAIL..." -ForegroundColor Cyan
$ROLES = @(
  "roles/aiplatform.user",
  "roles/pubsub.publisher",
  "roles/pubsub.subscriber",
  "roles/speech.client",
  "roles/storage.objectViewer",
  "roles/iam.serviceAccountUser"
)

foreach ($ROLE in $ROLES) {
  Write-Host "  -> Adding role: $ROLE" -ForegroundColor Gray
  gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="$ROLE" --quiet
}

# 5. Create Cloud Pub/Sub Topic and Subscription
Write-Host "📬 Ensuring Google Cloud Pub/Sub Topic & Subscription exist..." -ForegroundColor Cyan
gcloud pubsub topics create kintsugi-cliff-pings --project=$PROJECT_ID 2>$null
gcloud pubsub subscriptions create kintsugi-cliff-pings-sub --topic=kintsugi-cliff-pings --ack-deadline=60 --project=$PROJECT_ID 2>$null

# 6. Deploy to Google Cloud Run using Dedicated Service Account
Write-Host "🚀 Deploying directly to Google Cloud Run from source..." -ForegroundColor Cyan
gcloud run deploy $SERVICE_NAME `
  --source . `
  --region $REGION `
  --service-account $SA_EMAIL `
  --allow-unauthenticated `
  --memory 1Gi `
  --cpu 1 `
  --timeout 300 `
  --concurrency 80 `
  --min-instances 0 `
  --max-instances 10 `
  --ingress all `
  --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GOOGLE_CLOUD_REGION=$REGION,VERTEX_AI_LOCATION=global,GEMINI_MODEL=gemini-3.5-flash,USE_VERTEX_AI=true,GOOGLE_CLOUD_PUBSUB_TOPIC=projects/$PROJECT_ID/topics/kintsugi-cliff-pings

# 7. Print deployed URL
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)' 2>$null

Write-Host "====================================================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE! Service is live on Google Cloud Run." -ForegroundColor Green
if ($SERVICE_URL) {
  Write-Host "Live Application URL: $SERVICE_URL" -ForegroundColor Cyan
}
Write-Host "Dedicated Service Account: $SA_EMAIL" -ForegroundColor Green
Write-Host "Region: $REGION | Model: gemini-3.5-flash | Mode: Vertex AI ADC" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Green
