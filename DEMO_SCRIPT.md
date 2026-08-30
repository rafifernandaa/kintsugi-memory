# 🎬 Kintsugi Memory — Master Demo Video Script
### Google Cloud: All Things Agentic Hackathon
**Target Duration:** 3 Minutes 40 Seconds (Strict Limit: 4:00)  
**Primary Track:** *The Collaborative Partner* ($20,000) & *Grand Prize* ($50,000)  
**Delivery Tone:** Energetic, natural human voiceover (no robotic AI TTS), crisp pacing, zero dead air.

---

## ⏱️ Video Runtime & Scene Budget

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 0:00 ─── 0:30 [30s] 💥 SCENE 1: The 30-Second Hook & The Problem                       │
│ 0:30 ─── 1:15 [45s] 🎙️ SCENE 2: Live Scribe Studio & Multimodal Distillation           │
│ 1:15 ─── 2:00 [45s] 🥋 SCENE 3: Socratic Active Retrieval Room & 24K Gold Seams         │
│ 2:00 ─── 2:30 [30s] 📔 SCENE 4: Cognitive Journal & Polyglot Grammar Mastery            │
│ 2:30 ─── 3:10 [40s] 📬 SCENE 5: Async Pub/Sub Decay, Cloud Shell Ack & Gmail Alert      │
│ 3:10 ─── 3:40 [30s] ☁️ SCENE 6: GCP Production Proof (Cloud Run, Vertex AI Logs) & Close │
└────────────────────────────────────────────────────────────────────────────────────────┘
Total Duration: 3:40 (20-Second Safety Buffer Under the 4:00 Hard Cutoff)
```

---

## 🖥️ Pre-Recording Browser Tab Layout (Open in Advance)

| Tab # | Destination | URL / State |
|:---:|---|---|
| **Tab 1** | **Live App** | `https://kintsugi-memory-service-676289354133.us-west1.run.app/` (Start on Landing Page) |
| **Tab 2** | **Google Cloud Shell** | Cloud Shell Terminal open with pre-typed command: <br>`gcloud pubsub subscriptions pull kintsugi-cliff-pings-sub --auto-ack --limit=1` |
| **Tab 3** | **Gmail Inbox** | `https://mail.google.com/` (Open with recent test alert `⚠️ Synaptic Decay Alert`) |
| **Tab 4** | **Google Cloud Console** | Cloud Run dashboard for `kintsugi-memory-service` (`us-west1`) with **Logs** tab ready |

---

## 📜 Scene-by-Scene Script & Action Guide

---

### Scene 1: The 30-Second Hook & The Problem (0:00 – 0:30)

* **Visual on Screen:**
  - Start on the live **Landing Page** (`Tab 1`).
  - At **0:05**, click the gold CTA button: **`[ENTER APP →]`**.
  - Smooth transition into the **Dashboard Sanctuary**, showing the live **14-Day Streak Flame** and the **D3 Synaptic Knowledge Graph**.
  - Hover cursor over a concept showing the red **70% Forgetting Cliff Threshold** line.
* **Voiceover (Natural human energy):**
  > *"Traditional flashcards and spaced repetition apps are fundamentally broken because they are completely passive. They sit silent on your phone while your memory plunges off a steep biological power-law forgetting cliff, creating the illusion of competence.*  
  > *This is **Kintsugi Memory**—an autonomous cognitive partner deployed on Google Cloud. Instead of waiting for you to study, it continuously models your memory decay, proactively challenges you with Socratic active retrieval, and mends fragile understanding with 24-karat gold lacquer."*

---

### Scene 2: Live Scribe Studio & Multimodal Distillation (0:30 – 1:15)

* **Visual on Screen:**
  - Click **`Materials`** in sidebar $\to$ Click **`🎙️ Live Scribe Studio`**.
  - Click **`Start Recording`**, speak 2 seconds: *"In Spanish, the subjunctive WEIRDO rule triggers whenever expressing wishes, doubt, or emotions."*
  - Click **`Stop & Finalize`**.
  - Show the speaker-diarized transcript appearing on screen.
  - Quick-cut: Click **`Synthesize & Plant`**. Show 3 new atomic porcelain vessels appearing in the garden with Bayesian stability ratings ($S=2.8\text{d}$) and initial retrievability $98\%$.
* **Voiceover:**
  > *"Smart data lifecycle begins with multimodal ingestion. In our Live Scribe Studio, you can record spoken lectures or language classes with real-time pause and resume controls. Gemini 3.5 automatically diarizes speaker turns, extracts causal invariants, and distills the audio into atomic memory vessels.*  
  > *You can also drop PDF slide decks, Word documents, or research papers. In seconds, Gemini synthesizes the core principles and seeds them into your Synaptic Garden with mathematically parameterized stability."*

---

### Scene 3: Socratic Active Retrieval & Golden Joinery (1:15 – 2:00)

* **Visual on Screen:**
  - Click **`Active Retrieval`** in sidebar.
  - Show Gemini generating a counterfactual Socratic probe on screen:  
    *“Why does 'Quiero que vayas' require the subjunctive, but 'Quiero ir' uses the infinitive?”*
  - **Quick Action (Paste `Ctrl+V`):** Paste prepared answer:  
    `"Because 'Quiero ir' shares identical subjects in both clauses, whereas 'Quiero que vayas' has a change of subject."`
  - Click **`Submit to Socratic Oracle`**.
  - Show the 24K gold particle burst, score **95/100**, the **Golden Insight** callout, and stability expanding on screen ($1.8\text{d} \to 4.2\text{d}$).
* **Voiceover:**
  > *"Instead of shallow multiple-choice flashcards, Kintsugi challenges you with high-friction Socratic probes that test causal constraints.*  
  > *When you submit an answer, Gemini evaluates conceptual depth, isolates subtle misconceptions, and synthesizes a permanent 'Golden Insight.' Our Bayesian FSRS engine updates the memory half-life in real time—multiplying synaptic stability and cementing lifelong retention."*

---

### Scene 4: Cognitive Journal & Polyglot Grammar Mastery (2:00 – 2:30)

* **Visual on Screen:**
  - Click **`Journal`** in sidebar.
  - Scroll through a formatted markdown entry for *The WEIRDO Subjunctive Rule* (with headings, bold triggers, and callouts).
  - Click **`Plant into Synaptic Garden`**.
  - Show it generating interactive flashcards and an audio pronunciation drill with one-click TTS audio playback.
* **Voiceover:**
  > *"For polyglots and deep thinkers, the Cognitive Journal provides a rich markdown space for logging grammar edge-cases, syntax nuances, and audio reflections.*  
  > *With one click, journal reflections are converted into active retrieval vessels and pronunciation drills, seamlessly bridging reflective writing with empirical spaced repetition."*

---

### Scene 5: Async Pub/Sub Decay, Cloud Shell Ack & Live Gmail (2:30 – 3:10)

* **Visual on Screen:**
  - In App (`Tab 1`): Click **`Insights (Pub/Sub)`** in sidebar $\to$ Click **`Fast Forward +3 Days Decay`**. Show the retention bar dropping below the red $70\%$ cliff line.
  - Switch to **Google Cloud Shell (`Tab 2`)**: Press **`Enter`** to execute:  
    `gcloud pubsub subscriptions pull kintsugi-cliff-pings-sub --auto-ack --limit=1`  
    Show the live JSON event payload with `conceptTitle` and `currentRetentionPct` printed and acknowledged in the terminal!
  - Switch to **Gmail Inbox (`Tab 3`)**: Open the incoming email: **`⚠️ Synaptic Decay Alert`** showing the teaser challenge and the golden button **`✨ Mend Vessel in Socratic Garden`**. Click it—it opens the Cloud Run app directly.
* **Voiceover:**
  > *"Here is true autonomy in action. If you stop using the app, the background governor calculates your biological decay. The moment retrievability hits the 70% forgetting cliff, an event is published to Google Cloud Pub/Sub.*  
  > *In Google Cloud Shell, we see the message pulled and acknowledged in real time directly from our Pub/Sub subscription. Simultaneously, the agent dispatches an individualized Socratic challenge to your Gmail inbox, giving you a direct link to mend your memory vessel before it wilts."*

---

### Scene 6: Google Cloud Console Proof & Closing (3:10 – 3:40)

* **Visual on Screen:**
  - Switch to **Google Cloud Console (`Tab 4`)**:
    1. Show **Cloud Run dashboard** for `kintsugi-memory-service` in `us-west1` with green checkmark and live traffic metrics.
    2. Click **Logs** tab: show real-time structured logs for Vertex AI / Gemini 3.5 requests.
  - Switch back to **App (`Tab 1`)**: Show the **D3.js Synaptic Knowledge Graph**, click **`Reset View`** (smoothly centers). Zoom in on the logo **`K I N T S U G I  M E M O R Y`**.
* **Voiceover:**
  > *"Kintsugi Memory is 100% production-ready, deployed on Google Cloud Run with container autoscaling, Cloud Pub/Sub asynchronous event streaming, and Vertex AI Gemini 3.5 integration.*  
  > *Kintsugi Memory proves that memory decay is not defeat—it is the opportunity for mastery. Remember more, forget less, and grow always. Thank you!"*

---

## 🎯 Pro Recording & Delivery Tips

1. **Paste, Don't Type**: Copy your Socratic answer beforehand so you can paste it instantly with `Ctrl+V`.
2. **Trim Loading Lags**: Cut out 1–2 seconds of API waiting in post-production to keep the tempo fast-paced.
3. **Audio Quality**: Record in a quiet room with a clear microphone. Speak with warmth and enthusiasm.
4. **Resolution**: Record and export at 1080p (1920×1080) at 60fps.
5. **YouTube Settings**: Upload as **Public** or **Unlisted**, and paste the link into your Devpost submission!
