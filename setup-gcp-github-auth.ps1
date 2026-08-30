# Setup Google Cloud Service Account for GitHub Actions Continuous Deployment
$PROJECT_ID = if ($args[0]) { $args[0] } elseif ($env:GOOGLE_CLOUD_PROJECT) { $env:GOOGLE_CLOUD_PROJECT } else { (gcloud config get-value project 2>$null) }
if (-not $PROJECT_ID) { $PROJECT_ID = "kintsugi-memory-service" }
$SA_NAME = "github-actions-deployer"
$SA_EMAIL = "$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

Write-Host "⚡ Setting up Google Cloud Service Account for GitHub CI/CD..." -ForegroundColor Cyan
Write-Host "Project ID: $PROJECT_ID | Service Account: $SA_EMAIL`n" -ForegroundColor Yellow

# 1. Set active project
gcloud config set project $PROJECT_ID

# 2. Enable required GCP services
Write-Host "Enabling Cloud Run, Cloud Build, Container Registry, Speech-to-Text, Pub/Sub, Vertex AI..." -ForegroundColor Cyan
gcloud services enable run.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com pubsub.googleapis.com speech.googleapis.com aiplatform.googleapis.com iam.googleapis.com

# 3. Create Service Account if not existing
Write-Host "Creating Service Account $SA_NAME..." -ForegroundColor Cyan
gcloud iam service-accounts create $SA_NAME --description="GitHub Actions CI/CD Deployer" --display-name="GitHub Actions Deployer" 2>$null

# 4. Grant required IAM roles
Write-Host "Granting Cloud Run Admin, Storage Admin, Service Account User, Speech Client, PubSub Admin, and Vertex AI User roles..." -ForegroundColor Cyan
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/run.admin" --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/storage.admin" --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/iam.serviceAccountUser" --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/pubsub.admin" --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/speech.client" --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/aiplatform.user" --quiet

# 5. Create Pub/Sub Topic and Subscription
Write-Host "Creating Google Cloud Pub/Sub Topic and Subscription..." -ForegroundColor Cyan
gcloud pubsub topics create kintsugi-cliff-pings --project=$PROJECT_ID 2>$null
gcloud pubsub subscriptions create kintsugi-cliff-pings-sub --topic=kintsugi-cliff-pings --ack-deadline=60 --project=$PROJECT_ID 2>$null

# 6. Create and download JSON key
Write-Host "Generating JSON Key for GitHub Secrets..." -ForegroundColor Cyan
gcloud iam service-accounts keys create gcp-sa-key.json --iam-account=$SA_EMAIL

# 7. Read and display key
if (Test-Path gcp-sa-key.json) {
    $keyContent = Get-Content gcp-sa-key.json -Raw
    Write-Host "`n======================================================================" -ForegroundColor Green
    Write-Host "✅ SERVICE ACCOUNT & GCP INFRASTRUCTURE READY!" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "Next Step: Add this secret to your GitHub repository:" -ForegroundColor Yellow
    Write-Host "1. Open https://github.com/rafifernandaa/kintsugi-memory/settings/secrets/actions" -ForegroundColor Cyan
    Write-Host "2. Click 'New repository secret'" -ForegroundColor Cyan
    Write-Host "3. Name: GCP_SA_KEY" -ForegroundColor Yellow
    Write-Host "4. Value: Paste the contents of 'gcp-sa-key.json'`n" -ForegroundColor Yellow
    Write-Host "Also add your GEMINI_API_KEY secret with name 'GEMINI_API_KEY'" -ForegroundColor Yellow
    Write-Host "======================================================================" -ForegroundColor Green
}
