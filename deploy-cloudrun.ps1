# Deploy Kintsugi Memory to Google Cloud Run (Windows PowerShell)
$PROJECT_ID = "my-project-31-491314"
$REGION = "us-west1"
$SERVICE_NAME = "kintsugi-memory-service"

Write-Host "🌸 Deploying Kintsugi Memory Agent to Google Cloud Run..." -ForegroundColor Cyan
Write-Host "Project ID: $PROJECT_ID | Region: $REGION | Service: $SERVICE_NAME" -ForegroundColor Yellow

# Set active project
gcloud config set project $PROJECT_ID

# Enable required Google Cloud APIs
Write-Host "⚡ Enabling Google Cloud Services (Cloud Run, Cloud Build, Speech-to-Text, Pub/Sub, Artifact Registry)..." -ForegroundColor Cyan
gcloud services enable run.googleapis.com cloudbuild.googleapis.com speech.googleapis.com pubsub.googleapis.com artifactregistry.googleapis.com

# Create Cloud Pub/Sub Topic and Subscription
Write-Host "📬 Setting up Google Cloud Pub/Sub Topic & Subscription..." -ForegroundColor Cyan
gcloud pubsub topics create kintsugi-cliff-pings --project=$PROJECT_ID 2>$null
gcloud pubsub subscriptions create kintsugi-cliff-pings-sub --topic=kintsugi-cliff-pings --ack-deadline=60 --project=$PROJECT_ID 2>$null

# Build and Deploy to Cloud Run
Write-Host "🚀 Deploying directly to Google Cloud Run..." -ForegroundColor Cyan
gcloud run deploy $SERVICE_NAME `
  --source . `
  --region $REGION `
  --allow-unauthenticated `
  --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GOOGLE_CLOUD_REGION=$REGION,GEMINI_MODEL=gemini-3.7-flash,GOOGLE_CLOUD_PUBSUB_TOPIC=projects/$PROJECT_ID/topics/kintsugi-cliff-pings

Write-Host "✅ Deployment Complete! Service live on Google Cloud Run." -ForegroundColor Green
