# Deploy Kintsugi Memory to Google Cloud Run (Windows PowerShell)
$PROJECT_ID = "my-project-31-491314"
$REGION = "us-west1"
$SERVICE_NAME = "kintsugi-memory-service"

Write-Host "🌸 Deploying Kintsugi Memory Agent to Google Cloud Run..." -ForegroundColor Cyan
Write-Host "Project ID: $PROJECT_ID | Region: $REGION | Service: $SERVICE_NAME" -ForegroundColor Yellow

# Set active project
gcloud config set project $PROJECT_ID

# Enable required Google Cloud APIs
Write-Host "⚡ Enabling Google Cloud Services (Cloud Run, Cloud Build, Pub/Sub, Artifact Registry)..." -ForegroundColor Cyan
gcloud services enable run.googleapis.com cloudbuild.googleapis.com pubsub.googleapis.com artifactregistry.googleapis.com

# Create Cloud Pub/Sub Topic for Autonomous Initiation Notifications
Write-Host "📬 Setting up Google Cloud Pub/Sub Topic..." -ForegroundColor Cyan
gcloud pubsub topics create kintsugi-cliff-pings --project=$PROJECT_ID 2>$null

# Build and Deploy using Google Cloud Build
Write-Host "🚀 Building container image and deploying to Cloud Run..." -ForegroundColor Cyan
gcloud builds submit --config=cloudbuild.yaml --project=$PROJECT_ID

Write-Host "✅ Deployment Complete! Service live on Google Cloud Run." -ForegroundColor Green
