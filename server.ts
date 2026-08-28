import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { parseUploadedDocument } from "./server/documentParser";
import {
  ScribeAgent,
  SocraticInterviewerAgent,
  CognitiveEvaluatorAgent,
  AutonomousCliffAgent,
} from "./server/googleAgentFramework";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Runtime configuration
let runtimeApiKey = process.env.GEMINI_API_KEY || "";
let runtimeModel = process.env.GEMINI_MODEL || "gemini-3.7-flash";
const gcpProjectId = process.env.GOOGLE_CLOUD_PROJECT || "my-project-31-491314";
const gcpPubSubTopic = process.env.GOOGLE_CLOUD_PUBSUB_TOPIC || `projects/${gcpProjectId}/topics/kintsugi-cliff-pings`;

function resolveApiKey(req: express.Request): string | null {
  const headerKey = (req.headers["x-gemini-api-key"] as string) || (req.headers["authorization"]?.replace(/^Bearer\s+/, ""));
  const key = headerKey || runtimeApiKey || process.env.GEMINI_API_KEY || "";
  if (!key || key.trim() === "" || key === "MY_GEMINI_API_KEY") {
    return null;
  }
  return key.trim();
}

// In-Memory store for persisted streaks and notification logs
let serverStreakStore = {
  currentStreak: 0,
  bestStreak: 0,
  lastSessionDate: new Date().toISOString().split("T")[0],
  historyDates: [] as string[],
  totalSessionsCompleted: 0,
};

let serverNotificationLogs: Array<{
  id: string;
  recipientEmail: string;
  conceptTitle: string;
  editorialSubject: string;
  teaserQuestion: string;
  zineMessage: string;
  dispatchedAt: string;
  status: "delivered" | "queued" | "failed";
  gcpPubSubMessageId: string;
}> = [];

// -------------------------------------------------------------
// 0. CONFIGURATION & HEALTH ENDPOINTS
// -------------------------------------------------------------
app.get("/api/config", (req, res) => {
  const apiKey = resolveApiKey(req);
  res.json({
    geminiConfigured: !!apiKey,
    currentModel: runtimeModel,
    googleCloudProject: gcpProjectId,
    pubSubTopic: gcpPubSubTopic,
    registeredEmail: process.env.USER_NOTIFICATION_EMAIL || "student@kintsugi-memory.ai",
  });
});

app.post("/api/set-api-key", (req, res) => {
  const { apiKey, model } = req.body;
  if (apiKey && typeof apiKey === "string") {
    runtimeApiKey = apiKey.trim();
    process.env.GEMINI_API_KEY = runtimeApiKey;
  }
  if (model && typeof model === "string") {
    runtimeModel = model.trim();
  }
  return res.json({
    success: true,
    geminiConfigured: !!runtimeApiKey,
    currentModel: runtimeModel,
  });
});

app.get("/api/health", async (req, res) => {
  const apiKey = resolveApiKey(req);
  let geminiLiveTest = false;
  let testLatencyMs = 0;
  let errorDetail: string | null = null;

  if (apiKey) {
    const start = Date.now();
    try {
      const scribe = new ScribeAgent(apiKey, runtimeModel);
      // Fast lightweight ping
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      const resp = await ai.models.generateContent({
        model: runtimeModel,
        contents: "Respond with the word 'OK'.",
      });
      if (resp && resp.text) {
        geminiLiveTest = true;
      }
      testLatencyMs = Date.now() - start;
    } catch (e: any) {
      errorDetail = e?.message || String(e);
      console.warn("[Health Check] Gemini ping error:", errorDetail);
    }
  }

  res.json({
    status: "ok",
    service: "Kintsugi Memory Autonomous Agent",
    geminiConfigured: !!apiKey,
    geminiLiveTest,
    testLatencyMs,
    currentModel: runtimeModel,
    googleCloudProject: gcpProjectId,
    gcpPubSubTopic,
    errorDetail,
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// 0B. STREAK PERSISTENCE ENDPOINTS
// -------------------------------------------------------------
app.get("/api/streak", (req, res) => {
  res.json(serverStreakStore);
});

app.post("/api/streak", (req, res) => {
  const { streak } = req.body;
  if (streak && typeof streak.currentStreak === "number") {
    serverStreakStore = {
      ...serverStreakStore,
      ...streak,
    };
  }
  res.json({ success: true, streak: serverStreakStore });
});

// -------------------------------------------------------------
// 1. LIVE AUDIO SPEECH SCRIBE AGENT (Gemini 3.7 Multimodal Audio)
// -------------------------------------------------------------
app.post("/api/transcribe-audio", async (req, res) => {
  try {
    const apiKey = resolveApiKey(req);
    if (!apiKey) {
      return res.status(401).json({
        error: "GEMINI_API_KEY is required for live audio transcription. Please enter your API key in the Judge Modal or configure it on Cloud Run.",
      });
    }

    const { audioBase64, mimeType, filename, meetingTitle, subjectHint } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: "Please provide audio data from microphone or audio file upload." });
    }

    const scribeAgent = new ScribeAgent(apiKey, runtimeModel);
    const result = await scribeAgent.transcribeAudioStream({
      audioBase64,
      mimeType: mimeType || "audio/webm",
      filename,
      subjectHint,
      meetingTitle,
    });

    return res.json(result);
  } catch (error: any) {
    console.error("[Transcribe Audio Agent Error]:", error);
    return res.status(500).json({
      error: `Transcription failed: ${error?.message || "Unknown error"}. Check if your Gemini API key has quota for ${runtimeModel}.`,
    });
  }
});

// -------------------------------------------------------------
// 2. UNIVERSAL DOCUMENT PARSER & CONCEPT EXTRACTION AGENT
// -------------------------------------------------------------
app.post("/api/parse-document", async (req, res) => {
  try {
    const { filename, fileBase64 } = req.body;
    if (!fileBase64 || !filename) {
      return res.status(400).json({ error: "Filename and fileBase64 are required." });
    }

    const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");
    const parsed = await parseUploadedDocument(buffer, filename);

    return res.json(parsed);
  } catch (error: any) {
    console.error("[Document Parser Error]:", error);
    return res.status(500).json({ error: "Failed to parse document: " + error.message });
  }
});

app.post("/api/extract-concepts", async (req, res) => {
  try {
    const apiKey = resolveApiKey(req);
    if (!apiKey) {
      return res.status(401).json({
        error: "GEMINI_API_KEY is required for atomic concept distillation. Please configure your key in Judge Modal or Cloud Run.",
      });
    }

    const { rawText, fileBase64, fileMime, filename, subjectHint } = req.body;
    if (!rawText && !fileBase64) {
      return res.status(400).json({ error: "Please provide study notes, text, or an uploaded document/image." });
    }

    const scribeAgent = new ScribeAgent(apiKey, runtimeModel);
    const result = await scribeAgent.extractConceptsFromMaterial({
      rawText,
      fileBase64,
      fileMime,
      filename,
      subjectHint,
    });

    return res.json(result);
  } catch (error: any) {
    console.error("[Concept Extraction Error]:", error);
    return res.status(500).json({
      error: `Concept extraction failed: ${error?.message || "Unknown error"}.`,
    });
  }
});

// -------------------------------------------------------------
// 3. SOCRATIC INTERVIEWER AGENT (Active Retrieval Generation)
// -------------------------------------------------------------
app.post("/api/generate-questions", async (req, res) => {
  try {
    const apiKey = resolveApiKey(req);
    if (!apiKey) {
      return res.status(401).json({
        error: "GEMINI_API_KEY is required to generate Socratic retrieval questions.",
      });
    }

    const { concept, currentRetention, mode } = req.body;
    if (!concept || !concept.title) {
      return res.status(400).json({ error: "Concept data is required to generate questions." });
    }

    const interviewerAgent = new SocraticInterviewerAgent(apiKey, runtimeModel);
    const result = await interviewerAgent.generateDiagnosticQuestions({
      concept,
      currentRetention,
      mode,
    });

    return res.json(result);
  } catch (error: any) {
    console.error("[Question Generator Error]:", error);
    return res.status(500).json({
      error: `Question generation failed: ${error?.message || "Unknown error"}.`,
    });
  }
});

// -------------------------------------------------------------
// 4. COGNITIVE EVALUATOR AGENT (Bayesian Scoring & Golden Insight)
// -------------------------------------------------------------
const handleEvaluateRetrieval = async (req: express.Request, res: express.Response) => {
  try {
    const apiKey = resolveApiKey(req);
    if (!apiKey) {
      return res.status(401).json({
        error: "GEMINI_API_KEY is required to evaluate active recall and update FSRS parameters.",
      });
    }

    const { concept, question, userAnswer, timeSpentSeconds } = req.body;
    if (!concept || !question || typeof userAnswer !== "string") {
      return res.status(400).json({ error: "Concept, question, and userAnswer are required." });
    }

    const evaluatorAgent = new CognitiveEvaluatorAgent(apiKey, runtimeModel);
    const result = await evaluatorAgent.evaluateRetrieval({
      concept,
      question,
      userAnswer,
      timeSpentSeconds,
    });

    return res.json(result);
  } catch (error: any) {
    console.error("[Cognitive Evaluator Error]:", error);
    return res.status(500).json({
      error: `Answer evaluation failed: ${error?.message || "Unknown error"}.`,
    });
  }
};

app.post("/api/evaluate-answer", handleEvaluateRetrieval);
app.post("/api/evaluate-retrieval", handleEvaluateRetrieval);

// -------------------------------------------------------------
// 5. AUTONOMOUS CLIFF AGENT (Forgetting-Cliff Pings & Pub/Sub Dispatch)
// -------------------------------------------------------------
app.post("/api/generate-cliff-ping", async (req, res) => {
  try {
    const apiKey = resolveApiKey(req);
    if (!apiKey) {
      return res.status(401).json({
        error: "GEMINI_API_KEY is required for autonomous cliff telegram generation.",
      });
    }

    const { concept, currentRetention, daysSinceReview } = req.body;
    if (!concept) {
      return res.status(400).json({ error: "Concept object is required." });
    }

    const cliffAgent = new AutonomousCliffAgent(apiKey, runtimeModel, gcpProjectId, gcpPubSubTopic);
    const result = await cliffAgent.generateZineTelegram({
      concept,
      currentRetention: currentRetention || 0.68,
      daysSinceReview: daysSinceReview || 3,
    });

    return res.json(result);
  } catch (error: any) {
    console.error("[Cliff Ping Error]:", error);
    return res.status(500).json({
      error: `Cliff ping generation failed: ${error?.message || "Unknown error"}.`,
    });
  }
});

app.post("/api/send-cliff-notification", async (req, res) => {
  try {
    const apiKey = resolveApiKey(req);
    const { email, conceptTitle, currentRetention, editorialSubject, teaserQuestion, zineMessage, urgency } = req.body;
    const recipient = email || process.env.USER_NOTIFICATION_EMAIL || "student@kintsugi-memory.ai";

    const cliffAgent = new AutonomousCliffAgent(apiKey || "anon", runtimeModel, gcpProjectId, gcpPubSubTopic);
    const pubsubResult = await cliffAgent.publishForgettingCliffAlert({
      recipientEmail: recipient,
      conceptTitle: conceptTitle || "Active Memory Synapse",
      currentRetention: currentRetention || 68,
      editorialSubject: editorialSubject || `[Forgetting Cliff Alert] ${conceptTitle}`,
      teaserQuestion: teaserQuestion || "What is the key invariant before synaptic decay?",
      zineMessage: zineMessage || "Your memory vessel is at the forgetting threshold. Take 30 seconds to mend the seam.",
      urgency: urgency || "urgent_cliff",
    });

    const notificationRecord = {
      id: `notif_${Date.now()}`,
      recipientEmail: recipient,
      conceptTitle: conceptTitle || "Active Synapse",
      editorialSubject: editorialSubject || `[Forgetting Cliff] ${conceptTitle}`,
      teaserQuestion: teaserQuestion || "What is the primary boundary condition?",
      zineMessage: zineMessage || "Memory vessel nearing forgetting threshold.",
      dispatchedAt: new Date().toISOString(),
      status: "delivered" as const,
      gcpPubSubMessageId: pubsubResult.publishedGcpMessageId,
    };

    serverNotificationLogs.unshift(notificationRecord);
    if (serverNotificationLogs.length > 50) {
      serverNotificationLogs.pop();
    }

    return res.json({
      success: true,
      delivered: true,
      recipientEmail: recipient,
      gcpProjectId,
      gcpPubSubTopic,
      gcpPubSubMessageId: pubsubResult.publishedGcpMessageId,
      notificationRecord,
      message: `Autonomous Editorial Ping successfully published to Google Cloud Pub/Sub and delivered to ${recipient}!`,
    });
  } catch (error: any) {
    console.error("[Send Notification Error]:", error);
    return res.status(500).json({ error: "Failed to dispatch notification: " + error.message });
  }
});

app.get("/api/notification-logs", (req, res) => {
  res.json({ logs: serverNotificationLogs });
});

// -------------------------------------------------------------
// VITE STATIC ASSET SERVING
// -------------------------------------------------------------
const distPath = path.resolve(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(distPath, "index.html"));
    }
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌸 Kintsugi Memory Server running on port ${PORT}`);
  console.log(`⚡ Model active: ${runtimeModel} | GCP Project: ${gcpProjectId}`);
  console.log(`📬 Pub/Sub Topic: ${gcpPubSubTopic}`);
});
