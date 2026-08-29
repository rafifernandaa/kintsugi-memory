import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { parseUploadedDocument } from "./server/documentParser";
import { transcribeAudio } from "./server/speechService";
import {
  publishCliffEvent,
  startPubSubSubscriber,
  inMemoryPubSubAuditLogs,
  getSmtpStatus,
  updateRuntimeSmtp,
  verifySmtpConnection,
  sendDirectTestEmail,
} from "./server/pubsubService";
import {
  extractAtomicConcepts,
  generateSocraticQuestions,
  evaluateCognitiveRetrieval,
  generateForgettingCliffTelegram,
  generateExamStudyPlan,
  processMemory,
  distillJournalFlashcards,
} from "./server/geminiService";
import { ScribeAgent } from "./server/googleAgentFramework";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Runtime environment resolution
let runtimeApiKey = process.env.GEMINI_API_KEY || "";
let runtimeModel = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const gcpProjectId = process.env.GOOGLE_CLOUD_PROJECT || "my-project-31-491314";
const gcpPubSubTopic = process.env.GOOGLE_CLOUD_PUBSUB_TOPIC || `projects/${gcpProjectId}/topics/kintsugi-cliff-pings`;

function resolveApiKey(req: express.Request): string | undefined {
  const headerKey = (req.headers["x-gemini-api-key"] as string) || (req.headers["authorization"]?.replace(/^Bearer\s+/, ""));
  const key = headerKey || runtimeApiKey || process.env.GEMINI_API_KEY || "";
  if (!key || key.trim() === "" || key === "MY_GEMINI_API_KEY") {
    return undefined;
  }
  return key.trim();
}

// In-Memory store for persisted streaks
let serverStreakStore = {
  currentStreak: 0,
  bestStreak: 0,
  lastSessionDate: new Date().toISOString().split("T")[0],
  historyDates: [] as string[],
  totalSessionsCompleted: 0,
};

// -------------------------------------------------------------
// 0. CONFIGURATION & HEALTH ENDPOINTS
// -------------------------------------------------------------
// 0. CONFIGURATION & HEALTH ENDPOINTS
// -------------------------------------------------------------
app.get("/api/config", (req, res) => {
  const apiKey = resolveApiKey(req);
  const isVertexAI = process.env.USE_VERTEX_AI === "true" || !apiKey;
  res.json({
    geminiConfigured: !!apiKey || isVertexAI,
    authMode: isVertexAI ? "Google Cloud Vertex AI (ADC / GCP Credentials)" : "Gemini Developer API",
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
    process.env.GEMINI_MODEL = runtimeModel;
  }
  return res.json({
    success: true,
    geminiConfigured: !!runtimeApiKey,
    currentModel: runtimeModel,
  });
});

app.get("/api/health", async (req, res) => {
  const apiKey = resolveApiKey(req);
  const isVertexAI = process.env.USE_VERTEX_AI === "true" || !apiKey;
  let geminiLiveTest = false;
  let testLatencyMs = 0;
  let errorDetail: string | null = null;

  const start = Date.now();
  try {
    const { GoogleGenAI } = await import("@google/genai");
    let ai: any;
    if (isVertexAI) {
      ai = new GoogleGenAI({
        vertexai: true,
        project: gcpProjectId,
        location: process.env.VERTEX_AI_LOCATION || process.env.GOOGLE_CLOUD_LOCATION || "global",
      });
    } else {
      ai = new GoogleGenAI({ apiKey: apiKey! });
    }

    const resp = await ai.models.generateContent({
      model: runtimeModel,
      contents: "Respond with 'OK'.",
    });
    if (resp && resp.text) {
      geminiLiveTest = true;
    }
    testLatencyMs = Date.now() - start;
  } catch (e: any) {
    errorDetail = e?.message || String(e);
    console.warn("[Health Check] Model ping notice:", errorDetail);
  }

  res.json({
    status: "ok",
    service: "Kintsugi Memory Autonomous Agent",
    authMode: isVertexAI ? "Google Cloud Vertex AI (ADC / GCP Credentials)" : "Gemini Developer API",
    geminiConfigured: !!apiKey || isVertexAI,
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
// 1. LIVE AUDIO SPEECH & TRANSCRIPTION ENDPOINT
// -------------------------------------------------------------
app.post("/api/transcribe-audio", async (req, res) => {
  try {
    const { audioBase64, mimeType, filename, meetingTitle, subjectHint } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: "Please provide audio data from microphone or audio file upload." });
    }

    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, "");
    const audioBuffer = Buffer.from(cleanBase64, "base64");
    const apiKey = resolveApiKey(req);

    const result = await transcribeAudio({
      audioBuffer,
      mimeType: mimeType || "audio/webm",
      filename,
      meetingTitle,
      subjectHint,
      geminiApiKey: apiKey,
      geminiModel: runtimeModel,
    });

    return res.json(result);
  } catch (error: any) {
    console.error("[Transcribe Audio Route Error]:", error);
    return res.status(500).json({
      error: error?.message || "Failed to transcribe audio.",
    });
  }
});

// -------------------------------------------------------------
// 2. UNIVERSAL DOCUMENT PARSER & CONCEPT EXTRACTION ENDPOINTS
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
    console.error("[Document Parser Route Error]:", error);
    return res.status(500).json({ error: "Failed to parse document: " + error.message });
  }
});

app.post("/api/extract-concepts", async (req, res) => {
  try {
    const apiKey = resolveApiKey(req);
    const { rawText, fileBase64, fileMime, filename, subjectHint } = req.body;

    const result = await extractAtomicConcepts({
      rawText,
      fileBase64,
      fileMime,
      filename,
      subjectHint,
      apiKey,
    });

    return res.json(result);
  } catch (error: any) {
    console.error("[Concept Extraction Route Error]:", error);
    return res.status(500).json({
      error: error?.message || "Failed to extract concepts.",
    });
  }
});

app.post("/api/extract-class-notes", async (req, res) => {
  try {
    const apiKey = resolveApiKey(req);
    const { meetingTitle, subject, speakerName, transcript, liveStudentNotes, supportMaterials } = req.body;

    const scribe = new ScribeAgent(apiKey, runtimeModel);
    const result = await scribe.extractClassNotes({
      meetingTitle,
      subject,
      speakerName,
      transcript,
      liveStudentNotes,
      supportMaterials,
    });

    return res.json(result);
  } catch (error: any) {
    console.error("[Extract Class Notes Route Error]:", error);
    return res.status(500).json({
      error: error?.message || "Failed to extract class notes.",
    });
  }
});

// -------------------------------------------------------------
// 3. SOCRATIC ACTIVE RETRIEVAL QUESTION GENERATOR
// -------------------------------------------------------------
app.post("/api/generate-questions", async (req, res) => {
  try {
    const apiKey = resolveApiKey(req);
    const { concept, currentRetention, mode } = req.body;

    const result = await generateSocraticQuestions({
      concept,
      currentRetention,
      mode,
      apiKey,
    });

    return res.json(result);
  } catch (error: any) {
    console.error("[Question Generator Route Error]:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate questions.",
    });
  }
});

// -------------------------------------------------------------
// 3B. EXAM STUDY PLAN COUNTDOWN GENERATOR (GEMINI 3.7)
// -------------------------------------------------------------
app.post("/api/generate-exam-study-plan", async (req, res) => {
  try {
    const apiKey = resolveApiKey(req);
    const { exam, concepts } = req.body;

    if (!exam) {
      return res.status(400).json({ error: "Exam payload is required." });
    }

    const result = await generateExamStudyPlan({
      exam,
      concepts,
      apiKey,
    });

    return res.json(result);
  } catch (error: any) {
    console.error("[Exam Study Plan Route Error]:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate exam study plan.",
    });
  }
});

// -------------------------------------------------------------
// 3C. JOURNAL FLASHCARDS & LINGUISTIC DISTILLER (GEMINI 3.5/3.7)
// -------------------------------------------------------------
app.post("/api/distill-journal-flashcards", async (req, res) => {
  try {
    const apiKey = resolveApiKey(req);
    const { journalText, content, title, targetLanguage, category } = req.body;
    const textToAnalyze = journalText || content;

    if (!textToAnalyze || textToAnalyze.trim() === "") {
      return res.status(400).json({ error: "Journal content text is required." });
    }

    const result = await distillJournalFlashcards(
      textToAnalyze,
      title,
      targetLanguage,
      category,
      apiKey
    );

    return res.json(result);
  } catch (error: any) {
    console.error("[Journal Flashcard Distiller Error]:", error);
    return res.status(500).json({
      error: error?.message || "Failed to distill journal flashcards.",
    });
  }
});

// -------------------------------------------------------------
// 4. COGNITIVE RETRIEVAL EVALUATOR & GOLDEN SEAM SYNTHESIZER
// -------------------------------------------------------------
const handleEvaluateRetrieval = async (req: express.Request, res: express.Response) => {
  try {
    const apiKey = resolveApiKey(req);
    const { concept, question, userAnswer, studentAnswer, timeSpentSeconds } = req.body;
    const finalAnswer = userAnswer || studentAnswer;

    const result = await evaluateCognitiveRetrieval({
      concept,
      question,
      userAnswer: finalAnswer,
      timeSpentSeconds,
      apiKey,
    });

    return res.json(result);
  } catch (error: any) {
    console.error("[Cognitive Evaluator Route Error]:", error);
    return res.status(500).json({
      error: error?.message || "Failed to evaluate answer.",
    });
  }
};

app.post("/api/evaluate-answer", handleEvaluateRetrieval);
app.post("/api/evaluate-retrieval", handleEvaluateRetrieval);

// -------------------------------------------------------------
// 5. AUTONOMOUS FORGETTING-CLIFF PINGS & GOOGLE CLOUD PUB/SUB
// -------------------------------------------------------------
app.post("/api/generate-cliff-ping", async (req, res) => {
  try {
    const apiKey = resolveApiKey(req);
    const { concept, currentRetention, daysSinceReview } = req.body;

    const result = await generateForgettingCliffTelegram({
      concept,
      currentRetention: currentRetention || 0.68,
      daysSinceReview: daysSinceReview || 3,
      apiKey,
    });

    return res.json(result);
  } catch (error: any) {
    console.error("[Cliff Ping Route Error]:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate cliff ping.",
    });
  }
});

app.post("/api/send-cliff-notification", async (req, res) => {
  try {
    const { email, conceptTitle, currentRetention, editorialSubject, teaserQuestion, zineMessage, urgency } = req.body;
    let recipient = (email || "").trim();
    if (!recipient || recipient === "student@kintsugi-memory.ai") {
      recipient = process.env.USER_NOTIFICATION_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER || "student@kintsugi-memory.ai";
    }

    const dispatchResult = await publishCliffEvent({
      recipientEmail: recipient,
      conceptTitle: conceptTitle || "Active Memory Synapse",
      currentRetentionPct: currentRetention || 68,
      urgency: urgency || "urgent_cliff",
      subject: editorialSubject || `[Forgetting Cliff Alert] ${conceptTitle}`,
      teaserQuestion: teaserQuestion || "What is the key invariant before synaptic decay?",
      zineMessage: zineMessage || "Your memory vessel is at the forgetting threshold. Take 30 seconds to mend the seam.",
      triggeredBy: "FSRS Autonomous Initiation Governor",
    });

    return res.json({
      success: true,
      delivered: true,
      recipientEmail: recipient,
      gcpProjectId,
      gcpPubSubTopic,
      gcpPubSubMessageId: dispatchResult.messageId,
      emailSent: dispatchResult.emailSent,
      smtpConfigured: dispatchResult.smtpConfigured,
      mailError: dispatchResult.mailError,
      htmlPreview: dispatchResult.htmlPreview,
      message: dispatchResult.emailSent
        ? `Autonomous Editorial Ping successfully published to Google Cloud Pub/Sub (${dispatchResult.messageId}) and delivered directly to your inbox (${recipient})!`
        : `Autonomous Editorial Ping published to Google Cloud Pub/Sub (${dispatchResult.messageId}). To receive real emails in your inbox, configure SMTP_PASS in .env.`,
    });
  } catch (error: any) {
    console.error("[Send Notification Route Error]:", error);
    return res.status(500).json({ error: "Failed to dispatch notification: " + error.message });
  }
});

app.get("/api/smtp-status", (req, res) => {
  res.json(getSmtpStatus());
});

app.post("/api/configure-smtp", async (req, res) => {
  try {
    let user = (req.body.smtpUser || req.body.user || req.body.email || "").trim();
    let pass = (req.body.smtpPass || req.body.pass || req.body.password || "").trim();

    // If user submitted a masked email (e.g. cub***@gmail.com), resolve to existing rawUser or process.env.SMTP_USER
    if (user && user.includes("***")) {
      const existingStatus = getSmtpStatus();
      if (existingStatus.rawUser) {
        user = existingStatus.rawUser;
      } else if (process.env.SMTP_USER) {
        user = process.env.SMTP_USER.trim();
      }
    }

    if (!user || !pass) {
      return res.status(400).json({ error: "Both email (SMTP_USER) and App Password (SMTP_PASS) are required." });
    }

    updateRuntimeSmtp(user, pass);
    const verification = await verifySmtpConnection();

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        error: `SMTP authentication failed: ${verification.error}. Please ensure 2-Step Verification is enabled and a valid 16-character App Password is used.`,
      });
    }

    return res.json({
      success: true,
      message: `SMTP successfully authenticated for ${user}!`,
      status: getSmtpStatus(),
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to configure SMTP: " + error.message });
  }
});

app.post("/api/test-email", async (req, res) => {
  try {
    const { email } = req.body;
    const targetEmail = (email || process.env.USER_NOTIFICATION_EMAIL || process.env.SMTP_USER || "cubetestxyz@gmail.com").trim();

    const result = await sendDirectTestEmail(targetEmail);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        htmlPreview: result.htmlPreview,
      });
    }

    return res.json({
      success: true,
      message: `Test email successfully delivered to ${targetEmail}! Check your inbox.`,
      messageId: result.messageId,
      htmlPreview: result.htmlPreview,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to send test email: " + error.message });
  }
});

app.get("/api/notification-logs", (req, res) => {
  res.json({ logs: inMemoryPubSubAuditLogs });
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

// Start background Pub/Sub subscriber
startPubSubSubscriber();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌸 Kintsugi Memory Server running on port ${PORT}`);
  console.log(`⚡ Model active: ${runtimeModel} | GCP Project: ${gcpProjectId}`);
  console.log(`📬 Pub/Sub Topic: ${gcpPubSubTopic}`);
});
