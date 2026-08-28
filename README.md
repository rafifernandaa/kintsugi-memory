# 🌸 Kintsugi Memory (金継ぎ)
### Autonomous Forgetting-Cliff Agent for Proactive Cognitive Mastery
**Built for the [All Things Agentic Hackathon](https://allthingsagentichackathon.devpost.com)**  
**Primary Category Track:** Collaborative Partner  
**Google Cloud Project ID:** `my-project-31-491314`  
**Google Cloud Region:** `us-west1`

---

## 🏛️ Hackathon Mandatory Requirements Compliance

| # | Requirement | Implementation in Kintsugi Memory |
|---|---|---|
| **1** | **Gemini 3.5 or newer (&gt; 3.5) via Vertex AI or Gemini API** | Powered by `gemini-3.7-flash` / `gemini-3.5-flash` multimodal models on **Google Cloud Vertex AI** (Application Default Credentials / Service Account) with audio transcription & structured JSON schemas. |
| **2** | **At least one Google Agent Framework** | Built on the official **Google GenAI SDK (`@google/genai`)** with a decoupled 4-Agent pipeline architecture (Ingestion, Socratic Interviewer, Bayesian FSRS Engine, Autonomous Cliff Initiator). |
| **3** | **At least one Google Cloud Infrastructure Service** | Containerized on **Google Cloud Run** with a **Dedicated Service Account (`kintsugi-runner`)**, automated builds via **Cloud Build**, and asynchronous notification event publishing via **Google Cloud Pub/Sub** (`projects/my-project-31-491314/topics/kintsugi-cliff-pings`). |

---

## ⚡ Core Feature Capabilities

### 1. 🎙️ Live Synchronous Class Scribe & Multimodal Materials
- **Live Microphone Recording**: Real-time `MediaRecorder` audio capture with interim speech isolation.
- **Audio File Upload**: Upload lecture recordings (`.mp3`, `.wav`, `.m4a`, `.webm`, `.ogg`).
- **Gemini Audio Transcription**: Verbatim timestamped transcripts with speaker diarization, executive summaries, core invariants, and action items.
- **Universal Document Support**: Attach PDF slides, PowerPoint presentations (`.pptx`), Word documents (`.docx`), and whiteboard photos.

### 2. 📚 Universal Document Ingestion & Concept Distillation
- Upload PDF papers, Word documents, PPTX decks, or paste raw lecture notes.
- Vertex AI isolates atomic concepts, causal mechanisms, and cognitive *illusion of competence* traps.
- Calibrates initial Bayesian FSRS memory decay priors.

### 3. 📬 Autonomous Forgetting-Cliff Telegrams (Email & Cloud Pub/Sub)
- Unlike passive chatbots that wait for prompts, the agent monitors power-law decay curves and **proactively initiates** contact right when retrievability reaches 70%.
- Dispatches zine-style editorial micro-questions to the student's registered email and native browser notifications.
- Publishes event messages to Google Cloud Pub/Sub topic `projects/my-project-31-491314/topics/kintsugi-cliff-pings`.

### 4. 🥋 Socratic Interviewer & Bayesian FSRS Engine
- Generates scenario-based free-recall challenges and misconception-discriminating MCQs.
- Evaluates student voice/text responses, updates stability $S$, difficulty $D$, and provides a *Golden Insight* (the gold seam in Kintsugi).

### 5. 🔥 Synaptic Streak Continuum & Gamified Level-Up
- Tracks daily practice streaks with power-law decay validation.
- Interactive 7-day visual calendar, streak milestones, and Judge Demo testing controls.

### 6. 📅 Exam Readiness Countdown Planner
- Generates day-by-day active retrieval study blueprints for upcoming midterms/finals based on real concept retention.

---

## ☁️ Google Cloud Run Deployment (Vertex AI + Dedicated Service Account)

The deployment script handles end-to-end infrastructure setup:
1. Enables required GCP APIs (`aiplatform.googleapis.com`, `run.googleapis.com`, `pubsub.googleapis.com`, `speech.googleapis.com`, etc.).
2. Creates a dedicated service account: `kintsugi-runner@my-project-31-491314.iam.gserviceaccount.com`.
3. Grants required IAM roles to the dedicated service account:
   - `roles/aiplatform.user` (Vertex AI User)
   - `roles/pubsub.publisher` & `roles/pubsub.subscriber` (Cloud Pub/Sub)
   - `roles/speech.client` (Speech-to-Text)
   - `roles/storage.objectViewer`
   - `roles/iam.serviceAccountUser`
4. Creates Cloud Pub/Sub topic `kintsugi-cliff-pings` & subscription.
5. Builds and deploys the container to Cloud Run in region `us-west1`.

### 🐧 Linux / macOS / Google Cloud Shell:

Make the script executable with `chmod +x` and run:

```bash
# 1. Make deploy script executable
chmod +x deploy-cloudrun.sh

# 2. Run the deployment script
./deploy-cloudrun.sh
```

### 🪟 Windows PowerShell:

```powershell
.\deploy-cloudrun.ps1
```

---

## 🚀 Local Development Execution

### Prerequisites
- Node.js (v18+)
- Google Cloud SDK (`gcloud`) or Gemini API Key

### Steps
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start local development server
npm run dev
```

Visit `http://localhost:3000` in your browser.
