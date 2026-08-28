#!/bin/bash
# Deploy Kintsugi Memory to Google Cloud Run (Bash / Linux / macOS)
set -e

PROJECT_ID="my-project-28-497709"
REGION="us-central1"
SERVICE_NAME="kintsugi-memory-service"

echo "🌸 Deploying Kintsugi Memory Agent to Google Cloud Run..."
echo "Project ID: $PROJECT_ID | Region: $REGION | Service: $SERVICE_NAME"

# Set active project
gcloud config set project "$PROJECT_ID"

# Enable required Google Cloud APIs
echo "⚡ Enabling Google Cloud Services (Cloud Run, Cloud Build, Pub/Sub, Artifact Registry)..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com pubsub.googleapis.com artifactregistry.googleapis.com

# Create Cloud Pub/Sub Topic for Autonomous Initiation Notifications
echo "📬 Setting up Google Cloud Pub/Sub Topic..."
gcloud pubsub topics create kintsugi-cliff-pings --project="$PROJECT_ID" 2>/dev/null || true

# Build and Deploy using Google Cloud Build
echo "🚀 Building container image and deploying to Cloud Run..."
gcloud builds submit --config=cloudbuild.yaml --project="$PROJECT_ID"

echo "✅ Deployment Complete! Service live on Google Cloud Run."
