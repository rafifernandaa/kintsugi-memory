export interface Concept {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags?: string[];
  keyMechanisms: string[];
  commonMisconceptions: string[];
  sourceSnippet?: string;
  stability: number; // in days
  difficulty: number; // 1 to 10
  lastReviewedAt: string; // ISO string
  nextReviewAt: string; // ISO string
  currentRetention: number; // 0 to 1
  confidenceLow: number; // 0 to 1
  confidenceHigh: number; // 0 to 1
  reviewCount: number;
  kintsugiRepairs: number; // times golden joinery was earned
  status: 'healthy' | 'wilting' | 'critical' | 'golden';
  history: ReviewRecord[];
}

export interface ReviewRecord {
  id: string;
  timestamp: string;
  question: string;
  questionType: 'free_recall' | 'mcq' | 'socratic_scenario';
  studentAnswer: string;
  score: number; // 0 to 100
  feedback: string;
  misconceptionsFound: string[];
  priorRetention: number;
  postRetention: number;
  newStability: number;
}

export interface QuestionPrompt {
  id: string;
  conceptId: string;
  conceptTitle: string;
  type: 'free_recall' | 'mcq';
  difficultyLevel: 'gentle' | 'calibrated' | 'provocative';
  promptText: string;
  options?: string[];
  correctOptionIndex?: number;
  modelAnswer: string;
  rubric: string[];
  contextHint?: string;
}

export interface AutonomousPing {
  id: string;
  conceptId: string;
  conceptTitle: string;
  predictedRetention: number;
  urgency: 'urgent_cliff' | 'approaching' | 'scheduled';
  generatedAt: string;
  scheduledFor: string;
  delivered: boolean;
  editorialSubject: string;
  teaserQuestion: string;
  method: 'in_app' | 'browser_notification' | 'simulated_email';
  zineMessage: string;
}

export interface IngestionResult {
  title: string;
  subject: string;
  overview: string;
  concepts: Array<{
    title: string;
    summary: string;
    keyMechanisms: string[];
    commonMisconceptions: string[];
    initialDifficulty: number; // 1 to 10
    sourceSnippet: string;
  }>;
}

export interface EvaluationResult {
  score: number; // 0 to 100
  rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';
  comprehensionLevel: 'deep_mastery' | 'sound_recall' | 'partial_gap' | 'critical_fracture' | 'off_topic' | 'superficial_recognition' | 'partial_retrieval' | string;
  isCorrect?: boolean;
  isOffTopic?: boolean;
  feedback: string;
  goldenInsight: string; // The Kintsugi repair note
  misconceptionsIdentified: string[];
  missingElements: string[];
  strengths?: string[];
  updatedStabilityDays: number;
  newPredictedRetention: number;
  retentionConfidenceInterval: [number, number];
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  agentRole: 'Ingestion Agent' | 'Socratic Interviewer' | 'Bayesian FSRS Engine' | 'Cliff Scheduler';
  action: string;
  details: string;
  latencyMs: number;
  status: 'success' | 'warning' | 'info';
}

export interface ConceptDiagnostic {
  conceptTitle: string;
  diagnosis: string;
  vulnerabilityRisk: 'high' | 'medium' | 'low';
  recommendedIntervention: string;
}

export interface CognitiveInsightData {
  headline: string;
  decayDynamicsAnalysis: string;
  fastestDecayingFactor: string;
  retrievalPrescription: string;
  conceptDiagnostics: ConceptDiagnostic[];
  generatedAt?: string;
}

export interface SupportMaterial {
  id: string;
  title: string;
  type: 'slide_image' | 'whiteboard_photo' | 'handout_text' | 'document';
  textSnippet?: string;
  imageBase64?: string;
  mimeType?: string;
  addedAt: string;
}

export interface SynchronousNotesExtraction {
  title: string;
  subject: string;
  executiveSummary: string;
  masterNotesMarkdown: string;
  slideTranscriptAlignment: Array<{
    slideTitle: string;
    timestamp?: string;
    synthesis: string;
  }>;
  actionItems: string[];
  potentialExamQuestions: string[];
  concepts: Array<{
    title: string;
    summary: string;
    keyMechanisms: string[];
    commonMisconceptions: string[];
    initialDifficulty: number;
    sourceSnippet: string;
  }>;
}

export interface SynapticStreakData {
  currentStreak: number;
  bestStreak: number;
  lastSessionDate: string;
  historyDates: string[];
  totalSessionsCompleted: number;
}

export interface ExamEvent {
  id: string;
  title: string;
  courseCode: string;
  subject: string;
  date: string; // ISO date string e.g. "2026-09-05T09:00:00"
  targetRetention: number; // e.g. 0.90 for 90%
  conceptIds: string[]; // Linked concepts in Kintsugi Memory
  location?: string; // e.g. "Room 302 / Online"
  notes?: string;
  urgencyLevel?: 'high' | 'medium' | 'normal';
  color?: string;
  createdAt: string;
  savedStudyPlan?: ExamStudyPlan;
}

export interface ExamDailyScheduleItem {
  dayOffset: number;
  dateStr: string;
  focusTopic: string;
  conceptTitles: string[];
  estimatedMinutes: number;
  retrievalType: 'socratic_free_recall' | 'mcq_mechanisms' | 'kintsugi_repair' | 'synthesis_simulation';
  reasoning: string;
}

export interface ExamStudyPlan {
  examId: string;
  examTitle: string;
  daysRemaining: number;
  currentMeanRetention: number;
  projectedExamRetention: number;
  recommendedDailyMinutes: number;
  highRiskConcepts: string[];
  strategySummary: string;
  dailySchedule: ExamDailyScheduleItem[];
  examDayProTips: string[];
  generatedAt?: string;
}

