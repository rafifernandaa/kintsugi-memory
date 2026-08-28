# 🌸 Kintsugi Memory (金継ぎ)
### Autonomous Forgetting-Cliff Agent for Proactive Cognitive Mastery
**Built for the [All Things Agentic Hackathon](https://allthingsagentichackathon.devpost.com)**  
**Primary Category Track:** Collaborative Partner  
**Google Cloud Project ID:** `my-project-28-497709`

---

## 🏛️ Hackathon Mandatory Requirements Compliance

| # | Requirement | Implementation in Kintsugi Memory |
|---|---|---|
| **1** | **Gemini 3.5 or newer (&gt; 3.5) via Gemini API or Vertex AI** | Powered by `gemini-3.7-flash` / `gemini-3.7-pro` multimodal models (Audio Speech, PDF Documents, Vision Diagrams, Structured JSON schemas) with `gemini-3.5-flash` / `gemini-3.5-pro` fallback. |
| **2** | **At least one Google Agent Framework** | Built on the official **Google GenAI SDK (`@google/genai`)** with a decoupled 4-Agent pipeline architecture (Ingestion, Socratic Interviewer, Bayesian FSRS Engine, Autonomous Cliff Initiator). |
| **3** | **At least one Google Cloud Infrastructure Service** | Containerized on **Google Cloud Run**, automated CI/CD via **Cloud Build**, and asynchronous notification event publishing via **Google Cloud Pub/Sub** (`projects/my-project-28-497709/topics/kintsugi-cliff-pings`). |

---

## ⚡ Core Feature Capabilities

### 1. 🎙️ Live Synchronous Class Scribe & Multimodal Materials
- **Live Microphone Recording**: Real-time `MediaRecorder` audio capture.
- **Audio File Upload**: Upload lecture recordings (`.mp3`, `.wav`, `.m4a`, `.webm`, `.ogg`).
- **Gemini Audio Transcription**: Verbatim timestamped transcripts with speaker diarization, executive summaries, core invariants, and action items.
- **Universal Document Support**: Attach PDF slides, PowerPoint presentations (`.pptx`), Word documents (`.docx`), and whiteboard photos.

### 2. 📚 Universal Document Ingestion & Concept Distillation
- Upload PDF papers, Word documents, PPTX decks, or paste raw lecture notes.
- Gemini AI isolates atomic concepts, causal mechanisms, and cognitive *illusion of competence* traps.
- Calibrates initial Bayesian FSRS memory decay priors.

### 3. 📬 Autonomous Forgetting-Cliff Telegrams (Email & Cloud Pub/Sub)
- Unlike passive chatbots that wait for prompts, the agent monitors power-law decay curves and **proactively initiates** contact right when retrievability reaches 70%.
- Dispatches zine-style editorial micro-questions to the student's registered email and native browser notifications.
- Publishes event messages to Google Cloud Pub/Sub topic `projects/my-project-28-497709/topics/kintsugi-cliff-pings`.

### 4. 🥋 Socratic Interviewer & Bayesian FSRS Engine
- Generates scenario-based free-recall challenges and misconception-discriminating MCQs.
- Evaluates student voice/text responses, updates stability $S$, difficulty $D$, and provides a *Golden Insight* (the gold seam in Kintsugi).

### 5. 🔥 Synaptic Streak Continuum & Gamified Level-Up
- Tracks daily practice streaks with power-law decay validation.
- Interactive 7-day visual calendar, streak milestones, and Judge Demo testing controls.

### 6. 📅 Exam Readiness Countdown Planner
- Generates day-by-day active retrieval study blueprints for upcoming midterms/finals based on real concept retention.

---

## 🚀 Quickstart & Local Execution

### Prerequisites
- Node.js (v18+)
- Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Steps
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Copy .env.example to .env and set your GEMINI_API_KEY
cp .env.example .env

# 3. Start local development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## ☁️ Google Cloud Run Deployment

To deploy directly to Google Cloud Run under project `my-project-28-497709`:

### Windows PowerShell:
```powershell
.\deploy-cloudrun.ps1
```

### Linux / macOS:
```bash
chmod +x deploy-cloudrun.sh
./deploy-cloudrun.sh
```
