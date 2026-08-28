#!/bin/bash
# Deploy Kintsugi Memory to Google Cloud Run with Vertex AI (Bash / Linux / macOS)
set -e

PROJECT_ID="my-project-31-491314"
REGION="us-west1"
SERVICE_NAME="kintsugi-memory-service"

echo "🌸 Deploying Kintsugi Memory Agent to Google Cloud Run (Vertex AI Mode)..."
echo "Project ID: $PROJECT_ID | Region: $REGION | Service: $SERVICE_NAME"

# Set active project
gcloud config set project "$PROJECT_ID"

# Enable required Google Cloud APIs (Vertex AI, Cloud Run, Speech-to-Text, Pub/Sub, Cloud Build)
echo "⚡ Enabling Google Cloud Services (Vertex AI, Cloud Run, Cloud Build, Speech-to-Text, Pub/Sub, Artifact Registry)..."
gcloud services enable \
  aiplatform.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  speech.googleapis.com \
  pubsub.googleapis.com \
  artifactregistry.googleapis.com

# Create Cloud Pub/Sub Topic and Subscription
echo "📬 Setting up Google Cloud Pub/Sub Topic & Subscription..."
gcloud pubsub topics create kintsugi-cliff-pings --project="$PROJECT_ID" 2>/dev/null || true
gcloud pubsub subscriptions create kintsugi-cliff-pings-sub --topic=kintsugi-cliff-pings --ack-deadline=60 --project="$PROJECT_ID" 2>/dev/null || true

# Deploy directly to Cloud Run
echo "🚀 Deploying directly to Google Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT="$PROJECT_ID",GOOGLE_CLOUD_REGION="$REGION",GEMINI_MODEL="gemini-3.7-flash",USE_VERTEX_AI="true",GOOGLE_CLOUD_PUBSUB_TOPIC="projects/$PROJECT_ID/topics/kintsugi-cliff-pings"

echo "✅ Deployment Complete! Service live on Google Cloud Run with Vertex AI."
