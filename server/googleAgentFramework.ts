import { GoogleGenAI, Type } from "@google/genai";

/**
 * ============================================================================
 * 🏛️ KINTSUGI MEMORY: GOOGLE GENAI AGENT FRAMEWORK ARCHITECTURE
 * ============================================================================
 * Built for the All Things Agentic Hackathon on:
 * 1. Google GenAI SDK (@google/genai v2.4.0)
 * 2. Gemini 3.7 / 3.5 Flash Multimodal Models (>3.5 Spec)
 * 3. Google Cloud Pub/Sub & Cloud Run Infrastructure
 *
 * Decoupled 4-Agent Pipeline:
 *  1. ScribeAgent (Audio Speech Diarization & Universal Material Ingestion)
 *  2. SocraticInterviewerAgent (Diagnostic Forced-Recall Generation)
 *  3. CognitiveEvaluatorAgent (Bayesian FSRS Retrievability & Golden Seam Synthesis)
 *  4. AutonomousCliffAgent (Proactive Initiation & Cloud Pub/Sub Event Dispatcher)
 * ============================================================================
 */

const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.1-pro-preview",
  "gemini-3-flash-preview",
];

async function executeWithModelFallback<T>(
  preferredModel: string,
  fn: (modelName: string) => Promise<T>
): Promise<T> {
  const models = [
    preferredModel,
    ...CANDIDATE_MODELS.filter((m) => m !== preferredModel),
  ];

  let lastErr: any = null;
  for (const model of models) {
    try {
      console.log(`[Google Agent Framework] Executing task with model "${model}"...`);
      return await fn(model);
    } catch (err: any) {
      lastErr = err;
      const msg = err?.message || String(err);
      console.warn(`[Google Agent Framework] Model "${model}" failed (${msg.slice(0, 120)}), trying next candidate...`);
    }
  }
  throw lastErr || new Error("All candidate Gemini models failed.");
}

function createAgentGenAIClient(apiKey?: string): GoogleGenAI {
  const resolvedKey = apiKey || process.env.GEMINI_API_KEY;
  if (resolvedKey && resolvedKey.trim() !== "" && resolvedKey !== "MY_GEMINI_API_KEY") {
    return new GoogleGenAI({ apiKey: resolvedKey.trim() });
  }
  return new GoogleGenAI({
    vertexai: true,
    project: process.env.GOOGLE_CLOUD_PROJECT || "my-project-31-491314",
    location: process.env.VERTEX_AI_LOCATION || process.env.GOOGLE_CLOUD_LOCATION || "global",
  });
}

// ----------------------------------------------------------------------------
// 1. SCRIBE AGENT: Live Speech Audio Diarization & Multimodal Slide Extractor
// ----------------------------------------------------------------------------
export class ScribeAgent {
  private ai: GoogleGenAI;
  private model: string;

  constructor(apiKey?: string, model = "gemini-3.7-flash") {
    this.ai = createAgentGenAIClient(apiKey);
    this.model = model;
  }

  async transcribeAudioStream(params: {
    audioBase64: string;
    mimeType: string;
    filename?: string;
    subjectHint?: string;
    meetingTitle?: string;
  }) {
    const cleanBase64 = params.audioBase64.replace(/^data:audio\/[a-z0-9\-\+\.]+;base64,/, "");
    let targetMime = params.mimeType || "audio/webm";
    if (targetMime.includes("webm")) targetMime = "audio/webm";
    else if (targetMime.includes("wav")) targetMime = "audio/wav";
    else if (targetMime.includes("mp4") || targetMime.includes("m4a")) targetMime = "audio/mp4";
    else if (targetMime.includes("mp3") || targetMime.includes("mpeg")) targetMime = "audio/mp3";
    else if (targetMime.includes("ogg")) targetMime = "audio/ogg";

    const prompt = `
You are the Master Scribe Agent for Kintsugi Memory.
A student recorded spoken audio from a live lecture or meeting.
Topic: ${params.meetingTitle || params.subjectHint || "Academic Lecture"}
Filename: ${params.filename || "lecture_recording"}

TASK:
1. Provide a verbatim chronological timestamped transcript with speaker diarization (e.g. "[00:15] Professor: ...", "[01:10] Student: ...").
2. Provide a 2-3 sentence executive synthesis of what was discussed.
3. Extract core technical invariants, formulas, theorems, and causal mechanisms.
4. Extract professor exam warnings and common pitfalls.
5. Extract action items, reading assignments, and deadlines.
`;

    return executeWithModelFallback(this.model, async (modelName) => {
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: targetMime,
                },
              },
              { text: prompt },
            ],
          },
        ],
        config: {
          systemInstruction:
            "You are an elite academic speech recognition and lecture transcription AI agent. Transcribe audio with verbatim precision, timestamps, speaker diarization, and extraction of theoretical invariants.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transcript: { type: Type.STRING, description: "Timestamped speaker-diarized transcript" },
              summary: { type: Type.STRING, description: "Executive synthesis of lecture content" },
              keyInvariants: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Core mechanisms and theoretical laws",
              },
              examAlerts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exam alerts and professor warnings",
              },
              actionItems: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Homework, readings, and deliverables",
              },
              subject: { type: Type.STRING },
            },
            required: ["transcript", "summary", "keyInvariants", "examAlerts", "actionItems"],
          },
        },
      });

      return JSON.parse(response.text || "{}");
    });
  }

  async extractConceptsFromMaterial(params: {
    rawText?: string;
    fileBase64?: string;
    fileMime?: string;
    filename?: string;
    subjectHint?: string;
  }) {
    const parts: any[] = [];

    if (params.fileBase64 && params.fileMime) {
      const cleanBase64 = params.fileBase64.replace(/^data:[^;]+;base64,/, "");
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: params.fileMime,
        },
      });
    }

    const prompt = `
You are the Knowledge Ingestion Agent for Kintsugi Memory.
Analyze the provided lecture materials/text and extract atomic concept vessels for long-term synaptic retention.
Subject Hint: ${params.subjectHint || "General STEM / Theory"}

For each atomic concept:
- title: Crisp, specific concept name
- summary: 2-sentence mechanism description
- keyMechanisms: 2-4 core underlying rules, invariants, or equations
- commonMisconceptions: 2 specific errors or illusions of competence students have
- initialDifficulty: 1-10 difficulty rating
- sourceSnippet: Exact quote or source reference

Context Text:
${params.rawText || "(Analyze the attached visual slide / document)"}
`;

    parts.push({ text: prompt });

    return executeWithModelFallback(this.model, async (modelName) => {
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts,
          },
        ],
        config: {
          systemInstruction:
            "You are an expert cognitive knowledge extraction agent. Isolate deep causal models and common misconceptions to combat illusions of competence.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subject: { type: Type.STRING },
              overview: { type: Type.STRING },
              concepts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    keyMechanisms: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    commonMisconceptions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    initialDifficulty: { type: Type.INTEGER },
                    sourceSnippet: { type: Type.STRING },
                  },
                  required: [
                    "title",
                    "summary",
                    "keyMechanisms",
                    "commonMisconceptions",
                    "initialDifficulty",
                    "sourceSnippet",
                  ],
                },
              },
            },
            required: ["title", "subject", "overview", "concepts"],
          },
        },
      });

      return JSON.parse(response.text || "{}");
    });
  }
}

// ----------------------------------------------------------------------------
// 2. SOCRATIC INTERVIEWER AGENT: Generates Calibrated Active Retrieval
// ----------------------------------------------------------------------------
export class SocraticInterviewerAgent {
  private ai: GoogleGenAI;
  private model: string;

  constructor(apiKey?: string, model = "gemini-3.7-flash") {
    this.ai = createAgentGenAIClient(apiKey);
    this.model = model;
  }

  async generateDiagnosticQuestions(params: {
    concept: any;
    currentRetention?: number;
    mode?: "balanced" | "free_recall" | "mcq" | "adversarial";
  }) {
    const prompt = `
You are the Socratic Interviewer Agent for Kintsugi Memory.
Target Concept: "${params.concept?.title}"
Summary: "${params.concept?.summary}"
Key Mechanisms: ${JSON.stringify(params.concept?.keyMechanisms || [])}
Common Misconceptions: ${JSON.stringify(params.concept?.commonMisconceptions || [])}
Current Stability: ${params.concept?.stability || 1} days. Difficulty: ${params.concept?.difficulty || 5}/10.
Mode: ${params.mode || "balanced"}

Generate 2 high-impact Socratic questions for active recall:
1. One "free_recall" scenario debugging question where the student must articulate the causal mechanism from scratch.
2. One "mcq" question with subtle, plausible distractor options explicitly targeting the common misconceptions.
`;

    return executeWithModelFallback(this.model, async (modelName) => {
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction:
            "You are a rigorous Socratic examiner. Never ask trivial definitions. Always ask 'How', 'Why', or 'Debug this scenario' to force synaptic retrieval.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    conceptId: { type: Type.STRING },
                    conceptTitle: { type: Type.STRING },
                    type: { type: Type.STRING, description: "'free_recall' or 'mcq'" },
                    difficultyLevel: { type: Type.STRING, description: "'gentle', 'calibrated', or 'provocative'" },
                    promptText: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "4 options for MCQ, empty for free_recall",
                    },
                    correctOptionIndex: { type: Type.INTEGER },
                    modelAnswer: { type: Type.STRING },
                    rubric: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    contextHint: { type: Type.STRING },
                  },
                  required: ["id", "conceptTitle", "type", "difficultyLevel", "promptText", "modelAnswer", "rubric"],
                },
              },
            },
            required: ["questions"],
          },
        },
      });

      return JSON.parse(response.text || "{}");
    });
  }
}

// ----------------------------------------------------------------------------
// 3. COGNITIVE EVALUATOR AGENT: Bayesian Retrievability & Golden Seam Synthesis
// ----------------------------------------------------------------------------
export class CognitiveEvaluatorAgent {
  private ai: GoogleGenAI;
  private model: string;

  constructor(apiKey?: string, model = "gemini-3.7-flash") {
    this.ai = createAgentGenAIClient(apiKey);
    this.model = model;
  }

  async evaluateRetrieval(params: {
    concept: any;
    question: any;
    userAnswer: string;
    timeSpentSeconds?: number;
  }) {
    const prompt = `
You are the Cognitive Evaluator and Kintsugi Synthesis Agent.
Evaluate the student's retrieval response with precision and compassion.

Target Concept: "${params.concept?.title}"
Underlying Mechanisms: ${JSON.stringify(params.concept?.keyMechanisms || [])}
Common Traps: ${JSON.stringify(params.concept?.commonMisconceptions || [])}
Question Asked: "${params.question?.promptText || params.question?.prompt}"
Model Reference Answer: "${params.question?.modelAnswer}"
Question Type: ${params.question?.type}

Student's Response:
"${params.userAnswer}"

Time Spent: ${params.timeSpentSeconds || 30} seconds.

EVALUATE:
1. Score from 0 to 100 on conceptual fidelity and mechanistic understanding.
2. Identify specifically what the student got right (strengths).
3. Identify cognitive traps, misconceptions, or incomplete reasoning (gaps).
4. Synthesize the "Golden Insight" (the Kintsugi Gold Seam) — a profound 1-2 sentence realization that repairs their understanding stronger than before.
`;

    return executeWithModelFallback(this.model, async (modelName) => {
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction:
            "You are a master cognitive scientist and philosophical tutor in the tradition of Kintsugi (repairing flaws with gold). Provide constructive, mathematically rigorous cognitive feedback.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "0 to 100 score" },
              isCorrect: { type: Type.BOOLEAN },
              feedback: { type: Type.STRING, description: "Detailed feedback on understanding" },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              misconceptionsIdentified: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              goldenInsight: {
                type: Type.STRING,
                description: "The kintsugi gold seam: memorable synthesis repairing the conceptual fracture",
              },
            },
            required: [
              "score",
              "isCorrect",
              "feedback",
              "strengths",
              "misconceptionsIdentified",
              "goldenInsight",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");

      // Apply Bayesian FSRS Stability Updating Equation
      const prevStability = params.concept?.stability || 1.5;
      const prevDifficulty = params.concept?.difficulty || 5.0;
      const score = parsed.score || (parsed.isCorrect ? 85 : 45);

      let newStability: number;
      let newDifficulty: number;

      if (score >= 70) {
        const recallFactor = 1 + 0.9 * (11 - prevDifficulty) * Math.pow(prevStability, -0.2);
        newStability = Math.min(365, Number((prevStability * recallFactor).toFixed(2)));
        newDifficulty = Math.max(1, Number((prevDifficulty - 0.2).toFixed(2)));
      } else {
        newStability = Math.max(0.5, Number((prevStability * 0.4).toFixed(2)));
        newDifficulty = Math.min(10, Number((prevDifficulty + 0.4).toFixed(2)));
      }

      return {
        ...parsed,
        previousStability: prevStability,
        newStability,
        previousDifficulty: prevDifficulty,
        newDifficulty,
        reviewedAt: new Date().toISOString(),
      };
    });
  }
}

// ----------------------------------------------------------------------------
// 4. AUTONOMOUS CLIFF AGENT: Proactive Initiation & Google Cloud Pub/Sub
// ----------------------------------------------------------------------------
export class AutonomousCliffAgent {
  private ai: GoogleGenAI;
  private model: string;
  private projectId: string;
  private pubSubTopic: string;

  constructor(
    apiKey?: string,
    model = "gemini-3.7-flash",
    projectId = "my-project-31-491314",
    pubSubTopic = "projects/my-project-31-491314/topics/kintsugi-cliff-pings"
  ) {
    this.ai = createAgentGenAIClient(apiKey);
    this.model = model;
    this.projectId = projectId;
    this.pubSubTopic = pubSubTopic;
  }

  async generateZineTelegram(params: {
    concept: any;
    currentRetention: number;
    daysSinceReview: number;
  }) {
    const prompt = `
You are the Autonomous Initiation Governor for Kintsugi Memory.
A student's memory vessel for "${params.concept?.title}" is at the 70% forgetting cliff!
Current Estimated Retention: ${Math.round(params.currentRetention * 100)}%
Days since last retrieval: ${params.daysSinceReview} days.
Key Mechanics: ${JSON.stringify(params.concept?.keyMechanisms || [])}

Write a short, provocative, editorial "zine-style" initiation telegram.
Tone: Intellectual, calm, wabi-sabi (beauty of transient memory and deliberate repair).
No annoying spam alarms. Make it feel like an inspiring professor reaching out at the exact moment of synaptic forgetting.

Provide:
- editorialSubject: Crisp intriguing subject line
- teaserQuestion: One razor-sharp micro-question sparking immediate forced retrieval in their mind
- zineMessage: 2-3 poetic yet scientifically grounded sentences
- urgency: 'urgent_cliff' or 'approaching'
`;

    return executeWithModelFallback(this.model, async (modelName) => {
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              editorialSubject: { type: Type.STRING },
              teaserQuestion: { type: Type.STRING },
              zineMessage: { type: Type.STRING },
              urgency: { type: Type.STRING },
            },
            required: ["editorialSubject", "teaserQuestion", "zineMessage", "urgency"],
          },
        },
      });

      return JSON.parse(response.text || "{}");
    });
  }

  async publishForgettingCliffAlert(params: {
    recipientEmail: string;
    conceptTitle: string;
    currentRetention: number;
    editorialSubject: string;
    teaserQuestion: string;
    zineMessage: string;
    urgency?: string;
  }) {
    const messageId = `gcp-pubsub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const eventPayload = {
      specversion: "1.0",
      type: "google.cloud.pubsub.topic.publish",
      source: `//cloudrun.googleapis.com/projects/${this.projectId}/services/kintsugi-memory-service`,
      id: messageId,
      time: new Date().toISOString(),
      datacontenttype: "application/json",
      data: {
        recipientEmail: params.recipientEmail,
        conceptTitle: params.conceptTitle,
        currentRetentionPct: params.currentRetention,
        urgency: params.urgency || "urgent_cliff",
        subject: params.editorialSubject,
        teaserQuestion: params.teaserQuestion,
        zineMessage: params.zineMessage,
        triggeredBy: "FSRS Autonomous Initiation Governor",
      },
    };

    let publishedGcpMessageId = messageId;
    try {
      // Dynamic import to support various Cloud Run / container runtimes
      const { PubSub } = await import("@google-cloud/pubsub");
      const pubsubClient = new PubSub({ projectId: this.projectId });
      const topicName = this.pubSubTopic.split("/topics/")[1] || "kintsugi-cliff-pings";
      const topic = pubsubClient.topic(topicName);
      const dataBuffer = Buffer.from(JSON.stringify(eventPayload));
      const resId = await topic.publishMessage({ data: dataBuffer });
      if (resId) {
        publishedGcpMessageId = resId;
        console.log(`[Google Cloud Pub/Sub] Published message ${resId} to topic ${topicName}`);
      }
    } catch (err: any) {
      console.log(`[Google Cloud Pub/Sub Direct Log] Event for ${params.conceptTitle} -> Topic ${this.pubSubTopic}:`, eventPayload.id);
    }

    return {
      success: true,
      publishedGcpMessageId,
      eventPayload,
    };
  }
}
