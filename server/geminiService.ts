import { GoogleGenAI, Type } from "@google/genai";

/**
 * ============================================================================
 * GEMINI SERVICE: GOOGLE GENAI SDK INTEGRATION
 * ============================================================================
 * Manages model inference, structured response schemas, and Vertex AI routing.
 * ============================================================================
 */

const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
];

export function getGeminiClient(apiKeyOverride?: string): { ai: GoogleGenAI; model: string; mode: string } {
  const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || "kintsugi-memory-service";
  const location = process.env.VERTEX_AI_LOCATION || process.env.GOOGLE_CLOUD_LOCATION || "global";
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  // 1. If API Key is present -> Direct Gemini API Developer Mode
  if (apiKey && apiKey.trim() !== "" && apiKey !== "MY_GEMINI_API_KEY") {
    const ai = new GoogleGenAI({
      apiKey: apiKey.trim(),
    });
    return { ai, model, mode: "Gemini Developer API" };
  }

  // 2. Vertex AI Mode using GCP ADC / Service Account
  console.log(`[Vertex AI Initializer] Initializing GoogleGenAI client with Vertex AI ADC (Project: ${projectId}, Location: ${location}, Default Model: ${model})`);
  const ai = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location,
  });
  return { ai, model, mode: `Google Cloud Vertex AI (${projectId}/${location})` };
}

async function executeWithModelRetry<T>(
  ai: GoogleGenAI,
  preferredModel: string,
  fn: (model: string) => Promise<T>
): Promise<T> {
  const modelsToTry = [
    preferredModel,
    ...CANDIDATE_MODELS.filter((m) => m !== preferredModel),
  ];

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      const startTime = Date.now();
      console.log(`[Vertex AI / Gemini Execution] Invoking model "${model}" with structured schema...`);
      const result = await fn(model);
      const latencyMs = Date.now() - startTime;
      console.log(`[Vertex AI / Gemini Execution] Success on model "${model}" (${latencyMs}ms latency)`);
      return result;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`[Vertex AI / Gemini Execution] Model "${model}" failed (${errMsg.slice(0, 120)}), retrying next candidate...`);
    }
  }
  throw lastError || new Error("Failed to execute Gemini request across all candidate models.");
}

/**
 * 1. Process Memory from Raw Transcript
 */
export async function processMemory(transcript: string, topic?: string, apiKey?: string) {
  if (!transcript || transcript.trim() === "") {
    throw new Error("Transcript payload is empty.");
  }

  const { ai, model } = getGeminiClient(apiKey);

  return executeWithModelRetry(ai, model, async (targetModel) => {
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: `Analyze and extract core academic memories, technical invariants, and action items from this lecture transcript (Topic: ${topic || "Academic Lecture"}):\n\n${transcript}`,
      config: {
        systemInstruction:
          "You are a cognitive knowledge extraction AI agent. Extract atomic engrams, theoretical invariants, and actionable exam items.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyInvariants: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            examAlerts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            subject: { type: Type.STRING },
          },
          required: ["summary", "keyInvariants", "examAlerts", "actionItems"],
        },
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned empty response text.");
    }

    return JSON.parse(response.text);
  });
}

/**
 * 2. Universal Document & Text Concept Extraction
 */
export async function extractAtomicConcepts(options: {
  rawText?: string;
  fileBase64?: string;
  fileMime?: string;
  filename?: string;
  subjectHint?: string;
  apiKey?: string;
}) {
  const { rawText, fileBase64, fileMime, filename, subjectHint, apiKey } = options;

  if (!rawText && !fileBase64) {
    throw new Error("Please provide text, lecture notes, or an uploaded document/image.");
  }

  const { ai, model } = getGeminiClient(apiKey);
  const parts: any[] = [];

  if (fileBase64 && fileMime) {
    const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, "");
    parts.push({
      inlineData: {
        data: cleanBase64,
        mimeType: fileMime,
      },
    });
  }

  const prompt = `
You are the Knowledge Ingestion Agent for Kintsugi Memory.
Analyze the provided material and extract atomic concept vessels for long-term memory consolidation.
Domain Hint: ${subjectHint || "General STEM / Professional Domain"}
Filename: ${filename || "lecture_materials"}

For each atomic concept:
- title: Concise technical concept name
- summary: 2-sentence mechanism description
- keyMechanisms: 2-4 core underlying rules, invariants, or mathematical equations
- commonMisconceptions: 2 specific traps or illusions of competence students encounter
- initialDifficulty: integer 1-10 (1=basic fact, 10=complex multi-hop system)
- sourceSnippet: Exact quotation or reference from context

Material:
${rawText || "(Analyze the attached visual slide / document)"}
`;

  parts.push({ text: prompt });

  return executeWithModelRetry(ai, model, async (targetModel) => {
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: [
        {
          role: "user",
          parts,
        },
      ],
      config: {
        systemInstruction:
          "You are an expert cognitive knowledge extraction agent. Isolate causal models and misconceptions to eliminate illusions of competence.",
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

    if (!response.text) {
      throw new Error("Gemini returned empty concept extraction response.");
    }

    return JSON.parse(response.text);
  });
}

/**
 * 3. Generate Calibrated Socratic Active Retrieval Questions
 */
export async function generateSocraticQuestions(options: {
  concept: any;
  currentRetention?: number;
  mode?: string;
  apiKey?: string;
}) {
  const { concept, currentRetention, mode, apiKey } = options;

  if (!concept || !concept.title) {
    throw new Error("Target concept is required to generate Socratic questions.");
  }

  const { ai, model } = getGeminiClient(apiKey);

  const prompt = `
You are the Socratic Question Generator for Kintsugi Memory.
Target Concept: "${concept.title}"
Summary: "${concept.summary}"
Key Mechanisms: ${JSON.stringify(concept.keyMechanisms || [])}
Common Misconceptions: ${JSON.stringify(concept.commonMisconceptions || [])}
Current Stability: ${concept.stability || 1} days. Difficulty: ${concept.difficulty || 5}/10.
Mode: ${mode || "balanced"}

Generate 2 high-impact Socratic questions designed to force genuine neural retrieval:
1. One "free_recall" scenario debugging question where the student must articulate the causal mechanism from scratch.
2. One "mcq" question with subtle, plausible distractor options explicitly targeting the common misconceptions.
`;

  return executeWithModelRetry(ai, model, async (targetModel) => {
    const response = await ai.models.generateContent({
      model: targetModel,
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

    if (!response.text) {
      throw new Error("Gemini returned empty question generation response.");
    }

    return JSON.parse(response.text);
  });
}

/**
 * 4. Evaluate Cognitive Recall & Synthesize Golden Insight (Kintsugi Gold Seam)
 */
export async function evaluateCognitiveRetrieval(options: {
  concept: any;
  question: any;
  userAnswer: string;
  timeSpentSeconds?: number;
  apiKey?: string;
}) {
  const { concept, question, userAnswer, timeSpentSeconds, apiKey } = options;

  if (!concept || !question || typeof userAnswer !== "string") {
    throw new Error("Concept, question, and userAnswer are required for cognitive evaluation.");
  }

  const { ai, model } = getGeminiClient(apiKey);

  const prompt = `
You are the Cognitive Evaluator and Kintsugi Synthesis Agent.
Evaluate the student's retrieval response with precision, pedagogical clarity, and philosophical depth.

Target Concept: "${concept.title}"
Underlying Invariants & Mechanisms: ${JSON.stringify(concept.keyMechanisms || [])}
Common Traps: ${JSON.stringify(concept.commonMisconceptions || [])}
Question Asked: "${question.promptText || question.prompt}"
Model Reference Answer: "${question.modelAnswer}"
Question Type: ${question.type}

Student's Response:
"${userAnswer}"

Time Spent: ${timeSpentSeconds || 30} seconds.

EVALUATE:
1. Relevance Check: Is the student's response on-topic? If it is gibberish, spam, or completely unrelated to "${concept.title}", set isOffTopic=true, score=0-15, comprehensionLevel="off_topic", rating="AGAIN".
2. If on-topic and correct: Grade 75-100. Set isCorrect=true, comprehensionLevel="deep_mastery" (90-100) or "sound_recall" (75-89), rating="EASY" or "GOOD". Highlight what they got right.
3. If on-topic but incorrect or incomplete: Grade 20-69. Set isCorrect=false, comprehensionLevel="partial_gap" (50-69) or "critical_fracture" (0-49), rating="HARD" or "AGAIN". Identify the exact misconception or missing causal link.
4. Golden Insight: Synthesize a memorable 1-2 sentence realization (the Kintsugi Gold Seam) that repairs their mental model permanently.
`;

  return executeWithModelRetry(ai, model, async (targetModel) => {
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: {
        systemInstruction:
          "You are a master cognitive scientist and philosophical tutor in the tradition of Kintsugi (repairing flaws with gold). Provide constructive, compassionate, mathematically rigorous cognitive feedback. Correctly distinguish between accurate answers, conceptual misconceptions, and off-topic/gibberish responses.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "0 to 100 score" },
            isCorrect: { type: Type.BOOLEAN },
            isOffTopic: { type: Type.BOOLEAN, description: "True if the answer is completely unrelated, random, or gibberish" },
            comprehensionLevel: {
              type: Type.STRING,
              description: "deep_mastery | sound_recall | partial_gap | critical_fracture | off_topic",
            },
            rating: {
              type: Type.STRING,
              description: "EASY | GOOD | HARD | AGAIN",
            },
            feedback: { type: Type.STRING, description: "Detailed feedback explaining why it is correct, incorrect, or off-topic" },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            misconceptionsIdentified: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            missingElements: {
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
            "isOffTopic",
            "comprehensionLevel",
            "rating",
            "feedback",
            "strengths",
            "misconceptionsIdentified",
            "missingElements",
            "goldenInsight",
          ],
        },
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned empty cognitive evaluation response.");
    }

    const parsed = JSON.parse(response.text);

    // Normalize and enforce safe fields
    const isOffTopic = Boolean(parsed.isOffTopic || parsed.comprehensionLevel === "off_topic");
    const score = isOffTopic ? Math.min(15, parsed.score || 0) : (parsed.score ?? (parsed.isCorrect ? 85 : 45));
    const isCorrect = isOffTopic ? false : (score >= 70);

    const comprehensionLevel = isOffTopic
      ? "off_topic"
      : (parsed.comprehensionLevel || (score >= 90 ? "deep_mastery" : score >= 70 ? "sound_recall" : score >= 50 ? "partial_gap" : "critical_fracture"));

    const rating = isOffTopic
      ? "AGAIN"
      : (parsed.rating || (score >= 90 ? "EASY" : score >= 70 ? "GOOD" : score >= 50 ? "HARD" : "AGAIN"));

    // Apply Bayesian FSRS Stability Updating Equation
    const prevStability = concept.stability || concept.fsrs?.stability || 1.5;
    const prevDifficulty = concept.difficulty || concept.fsrs?.difficulty || 5.0;

    let newStability: number;
    let newDifficulty: number;

    if (score >= 70) {
      const recallFactor = 1 + 0.9 * (11 - prevDifficulty) * Math.pow(Math.max(0.1, prevStability), -0.2);
      newStability = Math.min(365, Number((prevStability * recallFactor).toFixed(1)));
      newDifficulty = Math.max(1, Number((prevDifficulty - 0.2).toFixed(1)));
    } else {
      newStability = Math.max(0.5, Number((prevStability * 0.4).toFixed(1)));
      newDifficulty = Math.min(10, Number((prevDifficulty + 0.4).toFixed(1)));
    }

    const newPredictedRetention = Number(Math.exp(-1 / Math.max(0.5, newStability)).toFixed(2));
    const retentionConfidenceInterval: [number, number] = [
      Math.max(0.1, Number((newPredictedRetention - 0.05).toFixed(2))),
      Math.min(0.99, Number((newPredictedRetention + 0.04).toFixed(2))),
    ];

    return {
      ...parsed,
      score,
      isCorrect,
      isOffTopic,
      comprehensionLevel,
      rating,
      feedback: parsed.feedback || (isOffTopic ? "Your answer is unrelated to the question. Please focus on the core mechanisms." : isCorrect ? "Excellent recall!" : "Some gaps were detected in your explanation."),
      strengths: parsed.strengths || [],
      misconceptionsIdentified: parsed.misconceptionsIdentified || [],
      missingElements: parsed.missingElements || [],
      goldenInsight: parsed.goldenInsight || `Anchor the invariants of ${concept.title} to stabilize long-term retention.`,
      previousStability: prevStability,
      newStability,
      updatedStabilityDays: newStability,
      previousDifficulty: prevDifficulty,
      newDifficulty,
      newPredictedRetention,
      retentionConfidenceInterval,
      reviewedAt: new Date().toISOString(),
    };
  });
}

/**
 * 5. Generate Autonomous Forgetting-Cliff Zine Telegram
 */
export async function generateForgettingCliffTelegram(options: {
  concept: any;
  currentRetention: number;
  daysSinceReview: number;
  apiKey?: string;
}) {
  const { concept, currentRetention, daysSinceReview, apiKey } = options;

  if (!concept) {
    throw new Error("Target concept is required to generate cliff telegram.");
  }

  const { ai, model } = getGeminiClient(apiKey);

  const prompt = `
You are the Autonomous Initiation Governor for Kintsugi Memory.
A student's memory vessel for "${concept.title}" has reached the critical 70% forgetting cliff!
Current Estimated Retention: ${Math.round(currentRetention * 100)}%
Days since last retrieval: ${daysSinceReview} days.
Key Mechanics: ${JSON.stringify(concept.keyMechanisms || [])}

Write a short, provocative, editorial "zine-style" initiation telegram.
Tone: Intellectual, calm, wabi-sabi (appreciating the beauty of transient memory and deliberate repair).
No annoying spam alarms. Make it feel like an inspiring professor reaching out at the exact moment of synaptic forgetting.

Provide:
- editorialSubject: Crisp intriguing subject line
- teaserQuestion: One razor-sharp micro-question sparking immediate forced retrieval in their mind
- zineMessage: 2-3 poetic yet scientifically grounded sentences
- urgency: 'urgent_cliff' or 'approaching'
`;

  return executeWithModelRetry(ai, model, async (targetModel) => {
    const response = await ai.models.generateContent({
      model: targetModel,
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

    if (!response.text) {
      throw new Error("Gemini returned empty cliff telegram response.");
    }

    return JSON.parse(response.text);
  });
}

/**
 * 6. Generate AI Exam Countdown & Socratic Study Blueprint with Gemini 3.7
 */
export async function generateExamStudyPlan(options: {
  exam: any;
  concepts?: any[];
  apiKey?: string;
}) {
  const { exam, concepts = [], apiKey } = options;

  if (!exam || !exam.title) {
    throw new Error("Exam details are required to generate a study plan.");
  }

  const { ai, model } = getGeminiClient(apiKey);

  const examDate = new Date(exam.date);
  const now = new Date();
  const daysRemaining = Math.max(1, Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const linkedConcepts = concepts.filter((c: any) => exam.conceptIds && exam.conceptIds.includes(c.id));
  const conceptSummaries = linkedConcepts.length > 0
    ? linkedConcepts.map((c: any) => ({
        id: c.id,
        title: c.title,
        retention: Math.round((c.currentRetention || 0.8) * 100),
        stability: c.stability || 2,
        mechanisms: c.keyMechanisms || [],
        misconceptions: c.commonMisconceptions || [],
      }))
    : [{ title: exam.subject || exam.title, retention: 75, stability: 2, mechanisms: [], misconceptions: [] }];

  const targetRetentionPct = Math.round((exam.targetRetention || 0.90) * 100);

  const prompt = `
You are the Exam Strategy & Cognitive Countdown Agent for Kintsugi Memory.
Formulate a high-yield, Bayesian active-retrieval study blueprint for an upcoming university exam.

Exam Details:
- Title: "${exam.title}"
- Course Code: "${exam.courseCode || 'N/A'}"
- Subject: "${exam.subject || 'Academic'}"
- Exam Date: ${exam.date} (${daysRemaining} days remaining)
- Target Retention Goal: ${targetRetentionPct}%
- Location/Format: "${exam.location || 'In-Person / Online'}"
- Syllabus / Invariant Notes: "${exam.notes || 'Core course syllabus'}"

In-Scope Memory Vessels (${conceptSummaries.length}):
${JSON.stringify(conceptSummaries, null, 2)}

TASK:
1. Synthesize a comprehensive Bayesian study blueprint.
2. Provide a daily countdown schedule for the remaining ${Math.min(daysRemaining, 14)} days leading directly into the exam.
3. For each day, assign a specific cognitive retrieval format ('socratic_free_recall', 'mcq_mechanisms', 'kintsugi_repair', 'synthesis_simulation') designed to repair synaptic fractures before the ${targetRetentionPct}% threshold.
4. Highlight high-risk concepts that show low retention or tricky misconceptions.
5. Provide 3 actionable "Exam Day Cognitive Execution Tactics" avoiding illusions of competence.
`;

  return executeWithModelRetry(ai, model, async (targetModel) => {
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: {
        systemInstruction:
          "You are a world-class cognitive learning strategist and Socratic examiner. Create evidence-based, spaced retrieval study blueprints.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            examId: { type: Type.STRING },
            examTitle: { type: Type.STRING },
            daysRemaining: { type: Type.INTEGER },
            currentMeanRetention: { type: Type.NUMBER },
            projectedExamRetention: { type: Type.NUMBER },
            recommendedDailyMinutes: { type: Type.INTEGER },
            highRiskConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            strategySummary: { type: Type.STRING },
            dailySchedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayOffset: { type: Type.INTEGER },
                  dateStr: { type: Type.STRING },
                  focusTopic: { type: Type.STRING },
                  conceptTitles: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  estimatedMinutes: { type: Type.INTEGER },
                  retrievalType: {
                    type: Type.STRING,
                    description: "socratic_free_recall | mcq_mechanisms | kintsugi_repair | synthesis_simulation",
                  },
                  reasoning: { type: Type.STRING },
                },
                required: [
                  "dayOffset",
                  "dateStr",
                  "focusTopic",
                  "conceptTitles",
                  "estimatedMinutes",
                  "retrievalType",
                  "reasoning",
                ],
              },
            },
            examDayProTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "examId",
            "examTitle",
            "daysRemaining",
            "currentMeanRetention",
            "projectedExamRetention",
            "recommendedDailyMinutes",
            "highRiskConcepts",
            "strategySummary",
            "dailySchedule",
            "examDayProTips",
          ],
        },
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned empty study plan response.");
    }

    const parsed = JSON.parse(response.text);
    parsed.examId = exam.id;
    parsed.examTitle = exam.title;
    parsed.daysRemaining = daysRemaining;

    return parsed;
  });
}

/**
 * 7. Distill Flashcards, Vocabulary, and Grammatical Nuances from Journal Reflections
 */
export async function distillJournalFlashcards(
  journalText: string,
  title?: string,
  targetLanguage?: string,
  category?: string,
  apiKey?: string
) {
  if (!journalText || journalText.trim() === "") {
    throw new Error("Journal text payload is empty.");
  }

  const { ai, model } = getGeminiClient(apiKey);

  return executeWithModelRetry(ai, model, async (targetModel) => {
    const prompt = `You are a Master Cognitive & Polyglot AI Scribe. Analyze the following student journal entry (Topic: ${title || "Reflection"}, Target Language / Discipline: ${targetLanguage || "General / Polyglot"}, Category: ${category || "language"}).
Extract interactive learning flashcards for key vocabulary terms, grammar invariants, conceptual mental models, or pronunciation subtleties. For each card, generate a challenging Socratic question that tests deep conceptual/contextual understanding instead of rote memory. Also provide 1-2 Golden Joinery Invariant Insights that clarify subtle misconceptions or linguistic nuances.

Journal Text:
${journalText}`;

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert language pedagogue and cognitive scientist. Distill structured vocabulary flashcards with readings, contextual meanings, nuance distinctions, example sentences, and Socratic challenge questions.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            targetLanguage: { type: Type.STRING },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING, description: "Target word, phrase, or concept invariant" },
                  reading: { type: Type.STRING, description: "Pronunciation, Romaji, Pinyin, or phonetic reading" },
                  meaning: { type: Type.STRING, description: "Clear definition or translation in context" },
                  nuance: { type: Type.STRING, description: "Grammatical nuance, invariant rule, or cognitive boundary" },
                  exampleSentence: { type: Type.STRING, description: "Natural example sentence in target language" },
                  exampleTranslation: { type: Type.STRING, description: "Translation of the example sentence" },
                  socraticChallenge: { type: Type.STRING, description: "A probing Socratic inquiry testing active discrimination" },
                },
                required: ["term", "reading", "meaning", "nuance", "exampleSentence", "exampleTranslation", "socraticChallenge"],
              },
            },
            goldenJoineryInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Deep mental models or linguistic rules clarified in this reflection",
            },
            grammarNuances: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["summary", "targetLanguage", "flashcards", "goldenJoineryInsights"],
        },
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned empty flashcard distillation response.");
    }

    return JSON.parse(response.text);
  });
}

/**
 * 8. Generate Cognitive Forgetting Pattern Insights (Retention Oracle)
 */
export async function generateCognitiveInsights(
  concepts: any[],
  examDaysAhead: number = 7,
  apiKeyOverride?: string
): Promise<any> {
  const { ai, model, mode } = getGeminiClient(apiKeyOverride);
  console.log(`[Vertex AI / CognitiveInsights] Running cognitive telemetry correlation via ${mode} on model ${model}...`);

  const conceptsSummary = concepts.map((c: any) => ({
    title: c.title,
    domain: c.category || c.subject || "General",
    stabilityDays: c.stability || 2,
    difficulty: c.difficulty || 5,
    kintsugiRepairs: c.kintsugiRepairs || 0,
    reviewCount: c.reviewCount || (c.history?.length || 1),
    lastReviewedAt: c.lastReviewedAt,
  }));

  const prompt = `You are an elite Cognitive Neuroscientist and Bayesian Memory Analyst.
Analyze the student's synaptic memory graph and learning telemetry for an upcoming exam horizon of ${examDaysAhead} days:

Current Concepts & Stability Telemetry:
${JSON.stringify(conceptsSummary, null, 2)}

Provide a structured, deeply analytical cognitive telemetry diagnostic:
1. headline: High-level executive finding (e.g. Asymmetric decay pattern, specific volatility).
2. decayDynamicsAnalysis: Deep explanation of why specific concepts decay faster (e.g., lack of procedural anchoring, abstract interference).
3. fastestDecayingFactor: The single most impactful cognitive vulnerability causing forgetting.
4. retrievalPrescription: Concrete, actionable high-friction Socratic study plan before day ${examDaysAhead}.
5. conceptDiagnostics: Array evaluating each concept with:
   - conceptTitle: Exact title
   - diagnosis: Diagnostic observation
   - vulnerabilityRisk: "high", "medium", or "low"
   - recommendedIntervention: Specific cognitive intervention`;

  return executeWithModelRetry(ai, model, async (candidateModel) => {
    const response = await ai.models.generateContent({
      model: candidateModel,
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert cognitive telemetry and Bayesian memory scientist. Analyze memory graphs to detect root causes of forgetting and prescribe exact Socratic interventions.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            decayDynamicsAnalysis: { type: Type.STRING },
            fastestDecayingFactor: { type: Type.STRING },
            retrievalPrescription: { type: Type.STRING },
            conceptDiagnostics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  conceptTitle: { type: Type.STRING },
                  diagnosis: { type: Type.STRING },
                  vulnerabilityRisk: { type: Type.STRING },
                  recommendedIntervention: { type: Type.STRING },
                },
                required: ["conceptTitle", "diagnosis", "vulnerabilityRisk", "recommendedIntervention"],
              },
            },
          },
          required: ["headline", "decayDynamicsAnalysis", "fastestDecayingFactor", "retrievalPrescription", "conceptDiagnostics"],
        },
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned empty cognitive insights response.");
    }

    const parsed = JSON.parse(response.text);
    return {
      ...parsed,
      generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  });
}

