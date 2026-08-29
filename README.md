# 🌸 Kintsugi Memory (金継ぎ)
### Autonomous Forgetting-Cliff Agent for Proactive Cognitive Mastery

**Built for the [All Things Agentic Hackathon](https://allthingsagentichackathon.devpost.com)**  
**Primary Track:** Collaborative Partner  
**Google Cloud Project ID:** `my-project-31-491314`  
**Google Cloud Run Region:** `us-west1`  
**Core Models:** Google Gemini 3.5 Flash & Gemini 3.7 Flash via `@google/genai` SDK & Google Cloud Vertex AI  

---

## 🏛️ Executive Summary & The Kintsugi Philosophy

In traditional spaced repetition (Anki, Quizlet), the software is **passive**: it sits idle on the student's device waiting for them to open the app. When students inevitably get busy, memory decay follows a steep biological power-law drop, leading to the *illusion of competence* (re-reading notes instead of forced generative recall).

**Kintsugi Memory** is an **autonomous, proactive cognitive partner** inspired by the Japanese art of *Kintsugi* (repairing broken pottery with gold lacquer). In cognitive neuroscience, when a memory trace begins to destabilize at the **Forgetting Cliff (retention < 70%)**, forced active retrieval triggers synaptic protein synthesis (Long-Term Potentiation), leaving the memory seam stronger than the original.

Instead of waiting for user prompts, Kintsugi Memory:
1. **Monitors Power-Law Decay Curves**: Computes continuous Bayesian FSRS retrievability for every concept.
2. **Proactively Dispatches Editorial Telegrams**: When a memory vessel approaches the forgetting cliff, the agent autonomously dispatches a Socratic question directly to the user's Gmail inbox and native browser alerts via **Google Cloud Pub/Sub**.
3. **Conducts Voice & Text Socratic Dialogues**: Challenges the student's core invariants, identifies subtle misconceptions, and updates memory stability $S$ and difficulty $D$.
4. **Live Synchronous Class Scribing**: Captures live lecture speech (Microphone WebRTC/Web Speech API), student scratchpad notes, and slide decks (PDF, PPTX, DOCX) to distill atomic knowledge vessels.

---

## 📐 System Architecture Diagram

```mermaid
flowchart TB
    subgraph Client["🖥️ Frontend Client (React 19 + TypeScript + Tailwind CSS v4)"]
        UI["Zen Wabi-Sabi Dashboard & Navigation"]
        AudioEngine["🎙️ Web Audio & Speech API (Record / Pause / Stop)"]
        D3Graph["🕸️ D3.js Synaptic Knowledge Graph"]
        FSRSEngine["📐 Client Bayesian FSRS v4.5 Decay Engine"]
        ErrBoundary["🛡️ Global React Error Boundary"]
    end

    subgraph Backend["☁️ Google Cloud Run Container (Node.js + Express)"]
        Server["Express API Gateway (server.ts)"]
        DocParser["📄 Multimodal Document & Slide Parser (PDF, PPTX, DOCX)"]
        SmtpService["📬 Nodemailer SMTP Dispatcher (Direct SSL Port 465)"]
        PubSubService["📡 Google Cloud Pub/Sub Broker Service"]
    end

    subgraph GCP["🌐 Google Cloud Platform Services"]
        PubSubTopic["📨 Cloud Pub/Sub Topic (kintsugi-cliff-pings)"]
        PubSubSub["📬 Cloud Pub/Sub Subscription (kintsugi-cliff-pings-sub)"]
        VertexAI["✨ Vertex AI / Google Gemini 3.5 & 3.7 Flash"]
        IAM["🔑 Dedicated Service Account (kintsugi-runner)"]
    end

    subgraph AutonomousAgents["🤖 4 Collaborative Autonomous Gemini Agents"]
        AgentScribe["1. Synchronous Lecture Scribe Agent"]
        AgentSocratic["2. Socratic Interviewer & Evaluator Agent"]
        AgentGovernor["3. Autonomous Forgetting-Cliff Governor"]
        AgentSynthesizer["4. Multimodal Knowledge Distillation Agent"]
    end

    %% Client to Backend
    UI -->|REST / API Calls| Server
    AudioEngine -->|Live Stream & Base64 Audio| Server
    FSRSEngine -->|Cliff Alerts & Retrievability States| UI

    %% Backend internal routing
    Server --> DocParser
    Server --> SmtpService
    Server --> PubSubService

    %% Backend to GCP
    PubSubService -->|Publish Events| PubSubTopic
    PubSubTopic -->|Queue & Pull| PubSubSub
    Server -->|@google/genai SDK / Vertex AI| VertexAI
    VertexAI --> AutonomousAgents
    IAM -->|RBAC Security| Server

    %% Autonomous Delivery
    SmtpService -->|Direct Email Dispatch| UserInbox["📧 Student Gmail Inbox (cubetestxyz@gmail.com)"]
    PubSubService -->|Audit Logs| UI
```

---

## 🏆 Alignment with Hackathon Judging Criteria

### 1. Innovation & Operational Utility (40%)
*How much real-world friction does the agent remove on its own?*
- **Zero-Handholding Proactive Initiation**: Chatbots require manual prompting. Kintsugi Memory acts autonomously: its **Forgetting-Cliff Governor** monitors synaptic half-life decay in the background. When a concept hits the critical 70% threshold, it independently generates a targeted Socratic teaser, formats a Zen editorial zine, and dispatches it via Cloud Pub/Sub and SMTP email.
- **Multimodal Synchronous Scribing**: Students struggle to listen, take notes, and read slides simultaneously. The **Live Class Scribe** captures live audio stream with real-time **Record / Pause / Resume / Stop** controls, extracts verbatim transcripts with speaker diarization, aligns timestamps with slide decks, and commits atomic memory vessels to the garden.
- **Cognitive Science Foundations**: Implements the Free Spaced Repetition Scheduler (FSRS v4.5) power-law decay model:
  $$R(t) = \left(1 + \text{factor} \cdot \frac{t}{S}\right)^{-d}$$
  Replacing naive linear decay with biological synaptic destabilization mathematics.

### 2. Architectural Discipline & Tech Stack (30%)
*How sound are engineering choices, system decoupling, memory management, and failure recovery?*
- **Decoupled Event Architecture**: Clean separation between the React 19 client, Node.js API server, Google Cloud Pub/Sub message broker, and the Gemini 3.5 GenAI SDK.
- **Production Credential & Security Isolation**:
  - Automatically strips whitespace and quotes from 16-character Google App Passwords (`izrv aolv hmgg wxyz` $\to$ `izrvaolvhmggwxyz`).
  - Google Cloud dedicated service account (`kintsugi-runner`) strictly granted least-privilege IAM roles (`roles/aiplatform.user`, `roles/pubsub.publisher`, `roles/pubsub.subscriber`).
  - No credentials hardcoded or committed to git.
- **Robust Error Recovery**:
  - Custom React [`ErrorBoundary.tsx`](file:///C:/Users/rafif/Downloads/kintsugi-memory%20(1)/src/components/ErrorBoundary.tsx) protects all dashboard tabs from unhandled rendering errors.
  - Safe null-handling across D3.js force-directed knowledge graph algorithms.
  - Dual-mode Gemini SDK (seamlessly switching between Vertex AI ADC and API Key).

### 3. Demo & Production Readiness (30%)
*How clearly do the repo and environment prove it works?*
- **Live Google Cloud Infrastructure**:
  - Live containerized Cloud Run service in `us-west1`.
  - Live Google Cloud Pub/Sub topic `kintsugi-cliff-pings`.
  - In-App SMTP configurator with instant verified email delivery to Gmail inboxes.
- **Judge Time-Warp Simulation Controls**:
  - Built-in `+3d`, `+7d`, and `+30d Month Cliff` fast-forward controls allowing judges to simulate weeks of memory decay and witness autonomous cliff alerts in real time.
- **Full Reproducibility**: Tested on Windows, macOS, Linux, and Google Cloud Shell.

---

## 🛠️ Tech Stack & Google Cloud Services

| Layer | Technologies Used |
|---|---|
| **AI Models & Frameworks** | Google Gemini 3.5 Flash, Gemini 3.7 Flash, `@google/genai` SDK, Google Cloud Vertex AI |
| **Cloud Infrastructure** | Google Cloud Run, Google Cloud Pub/Sub, Google Cloud Build, Google IAM |
| **Frontend UI** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, D3.js (Synaptic Force Graph) |
| **Audio & Speech Engine** | Web Speech API, MediaRecorder, Web Audio API procedural chime synthesizer |
| **Backend & Document Parser** | Node.js, Express, `pdf-parse`, `mammoth` (DOCX), `officeparser` (PPTX), `nodemailer` |
| **Memory Algorithm** | Bayesian Free Spaced Repetition Scheduler (FSRS v4.5) Power-Law Decay Engine |

---

## 🚀 Step-by-Step Spin-Up & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/) OR **Google Cloud CLI (`gcloud`)**

---

### Option A: Local Development Setup (Quickstart)

```bash
# 1. Clone the repository
git clone https://github.com/rafifernandaa/kintsugi-memory.git
cd kintsugi-memory

# 2. Install dependencies
npm install

# 3. Create .env configuration
cp .env.example .env
```

#### Edit your `.env` file:
```env
PORT=3000
GEMINI_API_KEY=your-gemini-api-key-here
GOOGLE_CLOUD_PROJECT=my-project-31-491314
GOOGLE_CLOUD_PUBSUB_TOPIC=projects/my-project-31-491314/topics/kintsugi-cliff-pings
GOOGLE_CLOUD_PUBSUB_SUBSCRIPTION=kintsugi-cliff-pings-server-sub

# Optional: Real Gmail Delivery (or configure directly in the UI)
SMTP_USER=cubetestxyz@gmail.com
SMTP_PASS=your-16-char-app-password
```

```bash
# 4. Build and run
npm run build
npm start

# Or for hot-reloading dev mode:
npm run dev
```

Open `http://localhost:3000` (or `http://localhost:5173` if running Vite dev server).

---

### Option B: Deploy to Google Cloud Run

#### 1. Linux / macOS / Google Cloud Shell:
```bash
# Authenticate gcloud
gcloud auth login
gcloud config set project my-project-31-491314

# Make script executable and run deployment
chmod +x deploy-cloudrun.sh
./deploy-cloudrun.sh
```

#### 2. Windows PowerShell:
```powershell
.\deploy-cloudrun.ps1
```

The script automatically enables required GCP APIs, creates the dedicated service account `kintsugi-runner`, grants Vertex AI and Pub/Sub roles, creates the Pub/Sub topic, and deploys the container to Cloud Run.

---

## 🧪 Verification & Judge Testing Guide

### 1. Verify Live Audio Recording & Scribe
1. Navigate to the **Materials (Scribe)** tab.
2. Click **"Record Live Class Audio"** and speak into your microphone.
3. Observe the audio timer and live transcription. Click **"Pause"** to hold, **"Resume"** to continue, and **"Stop & Finalize"** to finish.
4. Click **"Enhance Transcript (Gemini 3.5)"** to extract core invariants and atomic memory vessels.

### 2. Verify Forgetting Cliff & Fast-Forward Controls
1. Go to the **Memory Garden** or **Insights** tab.
2. Click the **`+30d Month Cliff`** fast-forward button.
3. Observe all vessels decaying past their half-life stability thresholds into the urgent forgetting zone (< 70%).

### 3. Verify Cloud Pub/Sub & Live Email Delivery
1. Go to the **Insights** tab.
2. Click **"Configure App Password"** to enter your Gmail credentials, or click **"Send Test Email"**.
3. In Google Cloud Shell, verify published Pub/Sub messages:
   ```bash
   gcloud pubsub subscriptions pull kintsugi-cliff-pings-sub --auto-ack --limit=5 --project=my-project-31-491314
   ```
4. Check your Gmail inbox at [mail.google.com](https://mail.google.com) to inspect the Socratic question and memory vessel alert.

---

## 📄 License & Open Source

Distributed under the **MIT License**. Built with deep care and wabi-sabi aesthetics for the Google All Things Agentic Hackathon.
