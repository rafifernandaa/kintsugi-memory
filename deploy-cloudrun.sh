#!/bin/bash
# Deploy Kintsugi Memory to Google Cloud Run with Dedicated Service Account & Vertex AI
set -e

PROJECT_ID="my-project-31-491314"
REGION="us-west1"
SERVICE_NAME="kintsugi-memory-service"
SA_NAME="kintsugi-runner"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🌸 ===================================================================="
echo "🌸 Deploying Kintsugi Memory Agent to Google Cloud Run"
echo "🌸 Project: $PROJECT_ID | Region: $REGION | Service: $SERVICE_NAME"
echo "🌸 Dedicated Service Account: $SA_EMAIL"
echo "🌸 ===================================================================="

# 1. Set active project
echo "⚙️ Setting active GCP project to $PROJECT_ID..."
gcloud config set project "$PROJECT_ID"

# 2. Enable required Google Cloud APIs
echo "⚡ Enabling GCP Services (Vertex AI, Cloud Run, Cloud Build, Speech-to-Text, Pub/Sub, IAM)..."
gcloud services enable \
  aiplatform.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  speech.googleapis.com \
  pubsub.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com

# 3. Create Dedicated Service Account if not exists
echo "👤 Creating dedicated Service Account ($SA_NAME)..."
gcloud iam service-accounts create "$SA_NAME" \
  --display-name="Kintsugi Memory Dedicated Service Account" \
  --description="Runtime service account for Kintsugi Memory Cloud Run container" 2>/dev/null || echo "Service account $SA_NAME already exists."

# 4. Grant required IAM roles to Dedicated Service Account
echo "🔐 Binding IAM roles to $SA_EMAIL..."
ROLES=(
  "roles/aiplatform.user"
  "roles/pubsub.publisher"
  "roles/pubsub.subscriber"
  "roles/speech.client"
  "roles/storage.objectViewer"
  "roles/iam.serviceAccountUser"
)

for ROLE in "${ROLES[@]}"; do
  echo "  -> Adding role: $ROLE"
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$ROLE" \
    --quiet
done

# 5. Create Cloud Pub/Sub Topic and Subscription
echo "📬 Ensuring Google Cloud Pub/Sub Topic & Subscription exist..."
gcloud pubsub topics create kintsugi-cliff-pings --project="$PROJECT_ID" 2>/dev/null || true
gcloud pubsub subscriptions create kintsugi-cliff-pings-sub --topic=kintsugi-cliff-pings --ack-deadline=60 --project="$PROJECT_ID" 2>/dev/null || true

# 6. Deploy to Google Cloud Run using Dedicated Service Account
echo "🚀 Deploying directly to Google Cloud Run with Dedicated Service Account..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --service-account "$SA_EMAIL" \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT="$PROJECT_ID",GOOGLE_CLOUD_REGION="$REGION",GEMINI_MODEL="gemini-3.7-flash",USE_VERTEX_AI="true",GOOGLE_CLOUD_PUBSUB_TOPIC="projects/$PROJECT_ID/topics/kintsugi-cliff-pings"

echo "🌸 ===================================================================="
echo "✅ DEPLOYMENT COMPLETE! Service is live on Google Cloud Run."
echo "🌸 Dedicated Service Account ($SA_EMAIL) authenticated for Vertex AI & Pub/Sub."
echo "🌸 ===================================================================="
