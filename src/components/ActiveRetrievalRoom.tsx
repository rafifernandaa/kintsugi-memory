import React, { useState, useEffect, useRef } from 'react';
import { Concept, QuestionPrompt, EvaluationResult } from '../types';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Layers,
  Award,
  Loader2,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Zap,
  Clock,
  Sun,
  Moon,
  HelpCircle,
  X,
  Radio,
  Flame,
  Trophy,
  Timer,
  Shield,
  Gauge,
} from 'lucide-react';
import {
  createSpeechRecognizer,
  SpeechRecognitionHandler,
  playGoldenKintsugiChime,
  speakText,
  stopSpeaking,
  playLevelUpFanfare,
  playRapidBonusChime,
  playTimerWarningTick,
} from '../lib/audio';
import { KintsugiOverlay } from './KintsugiOverlay';
import {
  calculateMasteryTier,
  MASTERY_TIERS,
  MasteryLevelInfo,
} from './SynapticLevelUpModal';
import confetti from 'canvas-confetti';

interface ActiveRetrievalRoomProps {
  concept?: Concept;
  allConcepts?: Concept[];
  onSelectConcept?: (concept: Concept) => void;
  onUpdateConcept: (updated: Concept) => void;
  onRecordRetrievalSession?: () => void;
  onAddTelemetry: (action: string, details: string, role?: any) => void;
  onBackToGarden: () => void;
  onNavigateToMaterials?: () => void;
}

export const ActiveRetrievalRoom: React.FC<ActiveRetrievalRoomProps> = ({
  concept,
  allConcepts,
  onSelectConcept,
  onUpdateConcept,
  onRecordRetrievalSession,
  onAddTelemetry,
  onBackToGarden,
  onNavigateToMaterials,
}) => {
  const [questions, setQuestions] = useState<QuestionPrompt[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [selectedMcqOption, setSelectedMcqOption] = useState<number | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Deep Focus State
  const [isDeepFocus, setIsDeepFocus] = useState(false);
  const [deepFocusTheme, setDeepFocusTheme] = useState<'obsidian' | 'alabaster'>('obsidian');
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [showHintInFocus, setShowHintInFocus] = useState(false);

  // -------------------------------------------------------------
  // SYNAPTIC CHALLENGE MODE STATE
  // -------------------------------------------------------------
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [challengeTimeLimit, setChallengeTimeLimit] = useState<30 | 45 | 60>(45);
  const [challengeSecondsRemaining, setChallengeSecondsRemaining] = useState<number>(45);
  const [challengeStreak, setChallengeStreak] = useState(0);
  const [totalSynapticPoints, setTotalSynapticPoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('synaptic_total_points');
      return saved ? parseInt(saved, 10) : 240;
    } catch {
      return 240;
    }
  });
  const [lastChallengeAward, setLastChallengeAward] = useState<{
    basePoints: number;
    velocityMultiplier: number;
    streakMultiplier: number;
    totalEarned: number;
    speedTierLabel: string;
  } | null>(null);

  const recognizerRef = useRef<SpeechRecognitionHandler | null>(null);
  const baseAnswerRef = useRef<string>('');

  // Save synaptic points to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('synaptic_total_points', totalSynapticPoints.toString());
    } catch (e) {
      // ignore
    }
  }, [totalSynapticPoints]);

  // Current Mastery Tier
  const currentTier = calculateMasteryTier(totalSynapticPoints);
  const nextTierIndex = MASTERY_TIERS.findIndex((t) => t.level === currentTier.level) + 1;
  const nextTier = nextTierIndex < MASTERY_TIERS.length ? MASTERY_TIERS[nextTierIndex] : null;
  const pointsInCurrentTier = totalSynapticPoints - currentTier.minPoints;
  const pointsNeededForNext = nextTier ? nextTier.minPoints - currentTier.minPoints : 1000;
  const tierProgressPct = nextTier ? Math.min(100, Math.round((pointsInCurrentTier / pointsNeededForNext) * 100)) : 100;

  // Synaptic Challenge Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (isChallengeMode && !evaluationResult && !isLoadingQuestions && currentQIndex < questions.length) {
      timer = setInterval(() => {
        setChallengeSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Warning tick on expiry
            playTimerWarningTick();
            return 0;
          }
          if (prev <= 6 && prev > 1) {
            playTimerWarningTick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isChallengeMode, evaluationResult, isLoadingQuestions, currentQIndex, questions.length]);

  // Reset challenge timer on question transition
  useEffect(() => {
    if (isChallengeMode) {
      setChallengeSecondsRemaining(challengeTimeLimit);
    }
  }, [currentQIndex, challengeTimeLimit, isChallengeMode]);

  // Flow State Timer during Deep Focus
  useEffect(() => {
    let timer: any = null;
    if (isDeepFocus) {
      timer = setInterval(() => {
        setFocusSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setFocusSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isDeepFocus]);

  // Global Keyboard shortcuts: ESC to exit deep focus, Alt+F to toggle, Cmd/Ctrl+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle deep focus with Alt+F
      if (e.altKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        handleToggleDeepFocus();
        return;
      }

      // Exit deep focus with Escape
      if (e.key === 'Escape' && isDeepFocus) {
        e.preventDefault();
        setIsDeepFocus(false);
        onAddTelemetry(
          'Deep Focus Disengaged',
          'Returned to standard interface.',
          'Focus Governor'
        );
        return;
      }

      // Submit with Cmd/Ctrl + Enter
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (!isEvaluating && !evaluationResult && currentQ) {
          e.preventDefault();
          handleSubmitAnswer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeepFocus, isEvaluating, evaluationResult, studentAnswer, selectedMcqOption, currentQIndex, questions]);

  const handleToggleDeepFocus = () => {
    const next = !isDeepFocus;
    setIsDeepFocus(next);
    if (next) {
      onAddTelemetry(
        'Deep Focus Mode Engaged',
        `Distraction-free high-contrast flow environment activated for "${concept.title}". Non-essential elements minimized.`,
        'Focus Governor'
      );
    } else {
      onAddTelemetry(
        'Deep Focus Disengaged',
        'Returned to standard interface.',
        'Focus Governor'
      );
    }
  };

  const handleToggleChallengeMode = () => {
    const next = !isChallengeMode;
    setIsChallengeMode(next);
    setChallengeSecondsRemaining(challengeTimeLimit);
    if (next) {
      onAddTelemetry(
        'Synaptic Challenge Engaged',
        `Timed constraints (${challengeTimeLimit}s) and rapid point-multipliers activated for ${concept.title}.`,
        'Bayesian FSRS Engine'
      );
    }
  };

  // Format focus timer (MM:SS)
  const formatFocusTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate live speed multiplier tier
  const timeUsedFraction = 1 - challengeSecondsRemaining / challengeTimeLimit;
  let currentSpeedMultiplier = 1.0;
  let currentSpeedTierLabel = 'Standard Pace (1.0x)';

  if (timeUsedFraction <= 0.25) {
    currentSpeedMultiplier = 3.0;
    currentSpeedTierLabel = '⚡ 3.0x Lightning Velocity';
  } else if (timeUsedFraction <= 0.5) {
    currentSpeedMultiplier = 2.0;
    currentSpeedTierLabel = '⚡ 2.0x Rapid Recall';
  } else if (timeUsedFraction <= 0.8) {
    currentSpeedMultiplier = 1.5;
    currentSpeedTierLabel = '⚡ 1.5x Swift Recall';
  } else {
    currentSpeedMultiplier = 1.0;
    currentSpeedTierLabel = '1.0x Base Velocity';
  }

  // Fetch Socratic questions on mount
  useEffect(() => {
    if (concept?.id) {
      fetchQuestions();
    }
    return () => {
      stopSpeaking();
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
    };
  }, [concept?.id]);

  const fetchQuestions = async () => {
    if (!concept) return;
    setIsLoadingQuestions(true);
    setEvaluationResult(null);
    setStudentAnswer('');
    setSelectedMcqOption(null);
    setShowHintInFocus(false);
    setLastChallengeAward(null);
    setChallengeSecondsRemaining(challengeTimeLimit);
    const start = Date.now();

    try {
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey,
        },
        body: JSON.stringify({
          concept,
          pastPerformance: concept.history,
        }),
      });

      const contentType = res.headers.get('content-type');
      let data: { questions?: QuestionPrompt[] } = {};
      if (res.ok && contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      const generatedQuestions = (data.questions && data.questions.length > 0) ? data.questions : [
        {
          id: `q_calibrated_${Date.now()}_1`,
          conceptId: concept.id,
          conceptTitle: concept.title,
          type: 'free_recall' as const,
          difficultyLevel: 'calibrated' as const,
          promptText: `In your own words, explain why ${concept.title} fails or degrades under edge conditions. How does the primary mechanism resolve this state?`,
          modelAnswer: `Under stress or partition, ${concept.title} enforces strict boundaries based on ${concept.keyMechanisms?.[0] || "core constraints"}.`,
          rubric: ['Identifies failure trigger', 'Articulates causal mechanism', 'Avoids superficial definitions'],
          contextHint: 'Focus on causality, not textbook buzzwords.',
        },
        {
          id: `q_calibrated_${Date.now()}_2`,
          conceptId: concept.id,
          conceptTitle: concept.title,
          type: 'mcq' as const,
          difficultyLevel: 'provocative' as const,
          promptText: `Which of the following describes a fatal misconception regarding ${concept.title}?`,
          options: [
            `Believing it operates symmetrically across all boundary states without trade-offs`,
            `Assuming it guarantees deterministic latency under network partitions`,
            `Treating it as a superficial static property rather than a dynamic invariant`,
            `All of the above reflect common illusions of competence`,
          ],
          correctOptionIndex: 3,
          modelAnswer: `All choices demonstrate common misconceptions where students overlook algorithmic trade-offs.`,
          rubric: ['Discriminates between genuine invariant vs superficial assumption'],
          contextHint: 'Watch out for subtle edge-case assumptions.',
        },
      ];

      setQuestions(generatedQuestions);
      setCurrentQIndex(0);
      onAddTelemetry(
        'Socratic Calibrated Questions Generated',
        `Produced ${generatedQuestions.length} questions tailored to ${concept.title} (Retention: ${Math.round(concept.currentRetention * 100)}%) in ${Date.now() - start}ms`,
        'Socratic Interviewer'
      );
    } catch (err) {
      console.warn('API question gen failed, falling back:', err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const currentQ = questions[currentQIndex];

  // Speech Recognition (Voice Input)
  const toggleVoiceRecording = () => {
    if (isListening) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListening(false);
      baseAnswerRef.current = studentAnswer;
      return;
    }

    setVoiceError(null);
    baseAnswerRef.current = studentAnswer.trim();

    const recognizer = createSpeechRecognizer(
      (confirmedText, interimText) => {
        const base = baseAnswerRef.current;
        const spoken = [confirmedText, interimText].filter(Boolean).join(' ').trim();
        const combined = base ? `${base} ${spoken}` : spoken;
        setStudentAnswer(combined);
      },
      (err) => {
        setVoiceError(err);
        setIsListening(false);
      }
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      recognizer.start();
      setIsListening(true);
      onAddTelemetry(
        'Voice Microphone Engaged',
        'Listening to student voice articulation for active free recall.',
        'Socratic Interviewer'
      );
    } else {
      setVoiceError('Speech recognition is not supported in this browser. Please type your answer.');
    }
  };

  // Text to Speech for question prompt
  const handleToggleSpeakQuestion = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else if (currentQ) {
      setIsSpeaking(true);
      speakText(currentQ.promptText, () => setIsSpeaking(false));
    }
  };

  // Submit Answer & Bayesian Evaluate
  const handleSubmitAnswer = async () => {
    if (!currentQ) return;
    const finalAnswer = currentQ.type === 'mcq'
      ? (selectedMcqOption !== null && currentQ.options ? currentQ.options[selectedMcqOption] : '')
      : studentAnswer;

    if (!finalAnswer.trim() && challengeSecondsRemaining > 0) {
      alert('Please provide an answer before submitting.');
      return;
    }

    setIsEvaluating(true);
    const start = Date.now();

    try {
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      const res = await fetch('/api/evaluate-retrieval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey,
        },
        body: JSON.stringify({
          concept,
          question: currentQ,
          userAnswer: finalAnswer || '(No answer provided within time limit)',
          timeSpentSeconds: challengeTimeLimit - challengeSecondsRemaining,
        }),
      });

      const contentType = res.headers.get('content-type');
      let rawData: any = {};
      if (res.ok && contentType && contentType.includes('application/json')) {
        rawData = await res.json();
      }

      const isCorrectMcq = currentQ.type === 'mcq' && selectedMcqOption === currentQ.correctOptionIndex;
      const fallbackScore = currentQ.type === 'mcq' ? (isCorrectMcq ? 95 : 35) : (finalAnswer.trim().length > 15 ? 75 : 30);
      const isOffTopic = Boolean(rawData.isOffTopic || rawData.comprehensionLevel === 'off_topic');
      const score = typeof rawData.score === 'number' ? rawData.score : fallbackScore;

      const evalData: EvaluationResult = {
        score,
        isCorrect: isOffTopic ? false : (typeof rawData.isCorrect === 'boolean' ? rawData.isCorrect : score >= 70),
        isOffTopic,
        rating: rawData.rating || (isOffTopic ? 'AGAIN' : score >= 90 ? 'EASY' : score >= 70 ? 'GOOD' : score >= 40 ? 'HARD' : 'AGAIN'),
        comprehensionLevel: rawData.comprehensionLevel || (isOffTopic ? 'off_topic' : score >= 90 ? 'deep_mastery' : score >= 70 ? 'sound_recall' : score >= 50 ? 'partial_gap' : 'critical_fracture'),
        feedback: rawData.feedback || (isOffTopic ? 'Your answer appears to be off-topic or unrelated to this concept. Please focus on the underlying invariants.' : score >= 70 ? 'Strong recall of fundamental mechanisms. Your explanation demonstrates genuine causal comprehension.' : 'Some cognitive gaps were identified in this explanation. Review the golden insight to reinforce understanding.'),
        goldenInsight: rawData.goldenInsight || `True mastery of ${concept.title} emerges from anchoring the invariant constraints rather than memorizing surface terminology.`,
        misconceptionsIdentified: Array.isArray(rawData.misconceptionsIdentified) ? rawData.misconceptionsIdentified : [],
        missingElements: Array.isArray(rawData.missingElements) ? rawData.missingElements : [],
        strengths: Array.isArray(rawData.strengths) ? rawData.strengths : [],
        updatedStabilityDays: typeof rawData.updatedStabilityDays === 'number' ? rawData.updatedStabilityDays : (typeof rawData.newStability === 'number' ? rawData.newStability : Number((concept.stability * (score >= 70 ? 2.2 : 0.5)).toFixed(1))),
        newPredictedRetention: typeof rawData.newPredictedRetention === 'number' ? rawData.newPredictedRetention : (score >= 70 ? 0.94 : 0.65),
        retentionConfidenceInterval: Array.isArray(rawData.retentionConfidenceInterval) ? rawData.retentionConfidenceInterval : (score >= 70 ? [0.88, 0.98] : [0.55, 0.75]),
      };

      setEvaluationResult(evalData);

      // Play Kintsugi sound effect & celebratory particle burst (inline, no blocking modal)
      if (evalData.score >= 70 && !evalData.isOffTopic) {
        playGoldenKintsugiChime();
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#BF8F54', '#A66D03', '#CBD5F2', '#F2E3B6'],
        });
      }

      // Calculate Synaptic Challenge Point Multipliers & Level Up
      if (isChallengeMode || evalData.score >= 70) {
        const baseScore = Math.max(10, evalData.score);
        const velocityMult = isChallengeMode ? currentSpeedMultiplier : 1.0;
        const currentStreakVal = evalData.score >= 70 ? challengeStreak + 1 : 0;
        const streakMult = 1.0 + currentStreakVal * 0.2;
        const earnedPoints = Math.round((baseScore * 1.5) * velocityMult * streakMult);

        setChallengeStreak(currentStreakVal);
        setLastChallengeAward({
          basePoints: Math.round(baseScore * 1.5),
          velocityMultiplier: velocityMult,
          streakMultiplier: streakMult,
          totalEarned: earnedPoints,
          speedTierLabel: currentSpeedTierLabel,
        });

        if (velocityMult > 1.0) {
          playRapidBonusChime(velocityMult);
        }

        // Calculate Level Progression
        const oldPoints = totalSynapticPoints;
        const newPoints = oldPoints + earnedPoints;
        const oldTier = calculateMasteryTier(oldPoints);
        const newTier = calculateMasteryTier(newPoints);

        setTotalSynapticPoints(newPoints);

        if (newTier.level > oldTier.level) {
          onAddTelemetry(
            'Synaptic Mastery Level Up!',
            `Student achieved Level ${newTier.level} (${newTier.title}) with ${newPoints} XP!`,
            'Bayesian FSRS Engine'
          );
        }
      }

      // Update Concept State
      const newReviewCount = concept.reviewCount + 1;
      const isGold = evalData.score >= 75;
      const newKintsugiCount = isGold ? concept.kintsugiRepairs + 1 : concept.kintsugiRepairs;
      const newRetention = evalData.newPredictedRetention || 0.92;
      const [newLow, newHigh] = evalData.retentionConfidenceInterval || [0.8, 0.95];

      const updatedConcept: Concept = {
        ...concept,
        stability: evalData.updatedStabilityDays || concept.stability * 1.8,
        lastReviewedAt: new Date().toISOString(),
        nextReviewAt: new Date(Date.now() + (evalData.updatedStabilityDays || 3) * 24 * 60 * 60 * 1000).toISOString(),
        currentRetention: newRetention,
        confidenceLow: newLow,
        confidenceHigh: newHigh,
        reviewCount: newReviewCount,
        kintsugiRepairs: newKintsugiCount,
        status: isGold ? 'golden' : newRetention >= 0.75 ? 'healthy' : 'wilting',
        history: [
          ...concept.history,
          {
            id: `h_${Date.now()}`,
            timestamp: new Date().toISOString(),
            question: currentQ.promptText,
            questionType: currentQ.type as any,
            studentAnswer: finalAnswer,
            score: evalData.score,
            feedback: evalData.feedback,
            misconceptionsFound: evalData.misconceptionsIdentified || [],
            priorRetention: concept.currentRetention,
            postRetention: newRetention,
            newStability: evalData.updatedStabilityDays || concept.stability,
          },
        ],
      };

      onUpdateConcept(updatedConcept);
      if (onRecordRetrievalSession) {
        onRecordRetrievalSession();
      }
      onAddTelemetry(
        'Bayesian FSRS Evaluation Completed',
        `Scored ${evalData.score}/100 (${evalData.rating}). Stability updated from ${concept.stability}d -> ${updatedConcept.stability.toFixed(1)}d in ${Date.now() - start}ms`,
        'Bayesian FSRS Engine'
      );
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!concept) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-6 bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#BF9A2A]/15 text-[#8F6A00] flex items-center justify-center mx-auto">
          <Target className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="text-xl font-serif font-bold text-[#2B2827]">
            No Memory Vessel Selected for Review
          </h2>
          <p className="text-xs text-[#736D6B] leading-relaxed">
            Select an active memory vessel from your Synaptic Garden to practice Socratic retrieval, or ingest new course materials.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={onBackToGarden}
            className="px-5 py-2.5 rounded-xl bg-[#152659] text-white text-xs font-semibold hover:bg-[#1E357A] transition-all shadow-xs inline-flex items-center gap-2"
          >
            <span>Open Synaptic Garden</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#BF9A2A]" />
          </button>
          {onNavigateToMaterials && (
            <button
              onClick={onNavigateToMaterials}
              className="px-5 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] text-xs font-semibold text-[#5A5553] hover:bg-[#EFEAD9] transition-all"
            >
              <span>Ingest Course Materials</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const wordCount = studentAnswer.trim() ? studentAnswer.trim().split(/\s+/).length : 0;
  const charCount = studentAnswer.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Concept Header with Deep Focus & Synaptic Challenge Toggles */}
      <div className={`bg-[#FFFFFF] border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden ${
        concept.kintsugiRepairs > 0 ? 'border-[#BF9A2A]/60 ring-1 ring-[#BF9A2A]/30' : 'border-[#DDD7C8]'
      }`}>
        {concept.kintsugiRepairs > 0 && (
          <KintsugiOverlay repairs={concept.kintsugiRepairs} intensity="subtle" />
        )}
        <div className="space-y-1 relative z-20 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-mono text-[#736D6B]">
              <button
                onClick={onBackToGarden}
                className="hover:text-[#8F6A00] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>← Return to Garden</span>
              </button>
              <span>/</span>
              <span className="text-[#8F6A00] font-bold">{concept.category}</span>
            </div>

            {allConcepts && allConcepts.length > 1 && onSelectConcept && (
              <select
                value={concept.id}
                onChange={(e) => {
                  const target = allConcepts.find((c) => c.id === e.target.value);
                  if (target) onSelectConcept(target);
                }}
                className="text-xs font-mono bg-[#FAF8F2] border border-[#DDD7C8] rounded-lg px-2.5 py-1 text-[#2B2827] focus:outline-hidden"
              >
                {allConcepts.map((c) => (
                  <option key={c.id} value={c.id}>
                    Switch: {c.title} ({Math.round(c.currentRetention * 100)}% Ret)
                  </option>
                ))}
              </select>
            )}
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#2B2827]">{concept.title}</h2>
          <div className="flex items-center gap-3 text-xs font-mono text-[#5A5553] pt-1 flex-wrap">
            <span>Prior Stability S: {concept.stability}d</span>
            <span>•</span>
            <span>Current Retention: {Math.round(concept.currentRetention * 100)}%</span>
            <span>•</span>
            <span className="text-[#8F6A00] font-bold">Mended: {concept.kintsugiRepairs}x Kintsugi</span>
            <span>•</span>
            <span className="text-[#152659] font-bold">XP: {totalSynapticPoints}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative z-20 self-start md:self-auto flex-wrap">
          {/* Synaptic Challenge Mode Toggle */}
          <button
            onClick={handleToggleChallengeMode}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all font-bold shadow-sm border ${
              isChallengeMode
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#BF9A2A] text-[#152659] border-[#A67E1E] ring-2 ring-[#BF9A2A]/50 shadow-md animate-pulse'
                : 'bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#8F6A00] border-[#BF9A2A]/40'
            }`}
            title="Toggle Synaptic Challenge (Timed constraints & rapid point-multipliers)"
          >
            <Flame className={`w-3.5 h-3.5 ${isChallengeMode ? 'text-[#152659]' : 'text-[#BF9A2A]'}`} />
            <span>Synaptic Challenge</span>
            {isChallengeMode && <span className="w-2 h-2 rounded-full bg-[#152659] animate-ping" />}
          </button>

          {/* Deep Focus Mode Toggle Button */}
          <button
            onClick={handleToggleDeepFocus}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all font-bold shadow-sm border ${
              isDeepFocus
                ? 'bg-[#BF9A2A] text-[#2B2827] border-[#A67E1E] ring-2 ring-[#BF9A2A]/40 animate-pulse'
                : 'bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] border-[#152659]'
            }`}
            title="Toggle high-contrast distraction-free flow state (Alt + F)"
          >
            <Zap className={`w-3.5 h-3.5 ${isDeepFocus ? 'text-[#2B2827]' : 'text-[#BF9A2A]'}`} />
            <span>Deep Focus</span>
            <span className="text-[10px] opacity-75 font-normal bg-black/20 px-1.5 py-0.5 rounded">Alt+F</span>
          </button>

          <button
            onClick={fetchQuestions}
            disabled={isLoadingQuestions}
            className="px-3.5 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] hover:text-[#2B2827] text-xs font-mono flex items-center gap-1.5 transition-colors border border-[#DDD7C8] shadow-sm font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#8F6A00] ${isLoadingQuestions ? 'animate-spin' : ''}`} />
            New Scenario
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SYNAPTIC CHALLENGE LIVE HUD & MASTERY PROGRESS BAR                         */}
      {/* ========================================================================= */}
      {isChallengeMode && (
        <div className="bg-gradient-to-r from-[#152659] via-[#1E357A] to-[#152659] text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-[#BF9A2A]/50 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Mastery Rank & Live Streak */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#BF9A2A]/20 border border-[#BF9A2A]/40 text-[#BF9A2A]">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase font-bold text-[#BF9A2A]">
                    Tier {currentTier.level} • {currentTier.title}
                  </span>
                  {challengeStreak > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EF4444]/30 text-[#FCA5A5] border border-[#EF4444]/40 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-[#F87171]" />
                      <span>{challengeStreak}-Streak ({`+${(challengeStreak * 0.2).toFixed(1)}x`})</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/80 font-mono">
                  {totalSynapticPoints} Synaptic XP {nextTier ? `(${pointsNeededForNext - pointsInCurrentTier} XP to ${nextTier.title})` : '• Max Rank'}
                </div>
              </div>
            </div>

            {/* Center / Right: Live Countdown Timer & Speed Multiplier */}
            <div className="flex items-center gap-3">
              {/* Time constraint Selector */}
              <div className="hidden md:flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/10 text-[10px] font-mono">
                {([30, 45, 60] as const).map((secs) => (
                  <button
                    key={secs}
                    onClick={() => {
                      setChallengeTimeLimit(secs);
                      setChallengeSecondsRemaining(secs);
                    }}
                    className={`px-2 py-1 rounded-lg transition-colors font-bold ${
                      challengeTimeLimit === secs
                        ? 'bg-[#BF9A2A] text-[#152659]'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {secs}s
                  </button>
                ))}
              </div>

              {/* Countdown Gauge */}
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all shadow-inner ${
                  challengeSecondsRemaining <= 10
                    ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#FCA5A5] animate-pulse'
                    : 'bg-black/30 border-[#BF9A2A]/40 text-[#FDE68A]'
                }`}
              >
                <Timer className={`w-4 h-4 ${challengeSecondsRemaining <= 10 ? 'text-[#EF4444]' : 'text-[#BF9A2A]'}`} />
                <span className="text-sm">{challengeSecondsRemaining}s remaining</span>
              </div>

              {/* Active Velocity Multiplier Badge */}
              <div className="px-3 py-1.5 rounded-xl bg-[#BF9A2A] text-[#152659] font-mono font-black text-xs border border-[#D4AF37] shadow-sm flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{currentSpeedTierLabel.split(' ')[0]} {currentSpeedTierLabel.split(' ')[1]}</span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar towards next Mastery Tier */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-white/70">
              <span>{currentTier.badgeName}</span>
              <span>{nextTier ? `Progress to Level ${nextTier.level} (${tierProgressPct}%)` : 'Mastery Perfected'}</span>
            </div>
            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-[#BF9A2A] via-[#FDE68A] to-[#D4AF37] transition-all duration-500 rounded-full"
                style={{ width: `${tierProgressPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Socratic Question Workspace (Standard View) */}
      {isLoadingQuestions ? (
        <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#8F6A00]" />
          <h3 className="text-sm font-serif text-[#2B2827] font-semibold">
            Generating Calibrated Socratic Scenario...
          </h3>
          <p className="text-xs text-[#736D6B] font-mono">
            Gemini 3.7 Flash tailoring question difficulty to your current forgetting curve
          </p>
        </div>
      ) : currentQ ? (
        <div className="space-y-6">
          {/* Question Card */}
          <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/40">
                  {currentQ.type === 'free_recall' ? 'Forced Free Recall' : 'Diagnostic MCQ'}
                </span>
                {isChallengeMode && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-[#EF4444]/15 text-[#993B2B] border border-[#EF4444]/30 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#993B2B]" /> Rapid Challenge
                  </span>
                )}
                <span className="text-xs font-mono text-[#736D6B]">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
              </div>

              {/* TTS Read Aloud & Focus Shortcut */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleSpeakQuestion}
                  className="p-1.5 rounded-lg bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] text-xs flex items-center gap-1 transition-colors border border-[#DDD7C8] shadow-sm font-semibold"
                  title="Listen to question"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-[#8F6A00]" /> : <Volume2 className="w-4 h-4 text-[#736D6B]" />}
                  <span className="text-[11px] font-mono">{isSpeaking ? 'Mute' : 'Listen'}</span>
                </button>

                <button
                  onClick={handleToggleDeepFocus}
                  className="p-1.5 rounded-lg bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] text-xs flex items-center gap-1 transition-colors border border-[#DDD7C8] shadow-sm font-semibold"
                  title="Enter Deep Focus Overlay"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#8F6A00]" />
                  <span className="text-[11px] font-mono hidden sm:inline">Focus</span>
                </button>
              </div>
            </div>

            {/* Prompt Text */}
            <h3 className="text-lg md:text-xl font-serif text-[#2B2827] font-semibold leading-relaxed">
              {currentQ.promptText}
            </h3>

            {currentQ.contextHint && (
              <div className="text-xs text-[#5A5553] bg-[#FAF8F2] p-3 rounded-xl border border-[#DDD7C8] font-mono">
                <span className="text-[#8F6A00] font-bold">Hint / Context:</span> {currentQ.contextHint}
              </div>
            )}
          </div>

          {/* Answer Input Area */}
          {!evaluationResult && (
            <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-6 space-y-4 shadow-sm">
              {currentQ.type === 'mcq' && currentQ.options ? (
                <div className="space-y-2.5">
                  <div className="text-xs font-mono text-[#736D6B] uppercase font-semibold">Select the most accurate formulation:</div>
                  {currentQ.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedMcqOption(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-mono transition-all flex items-start gap-3 ${
                        selectedMcqOption === idx
                          ? 'bg-[#EBF0FA] border-[#152659] text-[#152659] font-semibold shadow-sm'
                          : 'bg-[#FAF8F2] border-[#DDD7C8] text-[#5A5553] hover:border-[#736D6B] hover:text-[#2B2827]'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                        selectedMcqOption === idx ? 'border-[#152659] bg-[#152659] text-[#FFFFFF]' : 'border-[#DDD7C8] text-[#736D6B]'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="retrieval-answer-textarea" className="font-mono text-[#2B2827] font-semibold">Your Forced Retrieval Explanation</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleVoiceRecording}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                          isListening
                            ? 'bg-[#FDF2F0] text-[#993B2B] animate-pulse border border-[#F2C0B8]'
                            : 'bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] border border-[#DDD7C8]'
                        }`}
                      >
                        {isListening ? <Mic className="w-3.5 h-3.5 text-[#993B2B]" /> : <MicOff className="w-3.5 h-3.5 text-[#736D6B]" />}
                        {isListening ? 'Listening (Speak Now)...' : 'Use Voice Microphone'}
                      </button>
                    </div>
                  </div>

                  <textarea
                    id="retrieval-answer-textarea"
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    rows={6}
                    placeholder="Articulate the full mechanism from memory without consulting notes. What happens under boundary constraints?..."
                    className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl p-4 text-xs font-mono text-[#2B2827] placeholder-[#736D6B] focus:outline-none focus:border-[#BF9A2A] transition-colors leading-relaxed shadow-inner"
                  />

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#736D6B]">
                    <span>{wordCount} words • {charCount} characters</span>
                    <span className="text-[#8F6A00] font-medium">Tip: Press ⌘ + Enter to submit</span>
                  </div>

                  {voiceError && (
                    <div className="text-[11px] text-[#993B2B] font-mono font-semibold">{voiceError}</div>
                  )}
                </div>
              )}

              {/* Submit Button & Challenge Multiplier HUD */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                {isChallengeMode ? (
                  <div className="flex items-center gap-2 text-xs font-mono text-[#8F6A00] font-bold">
                    <Zap className="w-4 h-4 text-[#BF9A2A]" />
                    <span>Active Multiplier: {currentSpeedMultiplier.toFixed(1)}x Velocity {challengeStreak > 0 ? `+ ${(challengeStreak * 0.2).toFixed(1)}x Streak` : ''}</span>
                  </div>
                ) : (
                  <div />
                )}

                <button
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating}
                  className="px-6 py-3 rounded-xl bg-[#152659] hover:bg-[#1E357A] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#BF9A2A]" />
                      Evaluating Bayesian Retention...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#BF9A2A]" />
                      Submit & Mend Memory
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Evaluation & Kintsugi Repair Feedback Panel */}
          {evaluationResult && (
            <div className="bg-[#FFFFFF] border border-[#BF9A2A] rounded-2xl p-6 space-y-5 shadow-md relative overflow-hidden ring-1 ring-[#BF9A2A]/30">
              {evaluationResult.score >= 70 && (
                <KintsugiOverlay repairs={concept.kintsugiRepairs || 1} intensity="radiant" />
              )}

              {/* Synaptic Challenge XP Award Banner */}
              {lastChallengeAward && (
                <div className="bg-gradient-to-r from-[#FAF8F2] via-[#FDF9EE] to-[#FAF8F2] border-2 border-[#BF9A2A] rounded-2xl p-4 shadow-sm space-y-2 relative z-20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#BF9A2A]/20 text-[#8F6A00]">
                        <Zap className="w-4 h-4 fill-current" />
                      </div>
                      <span className="text-xs font-mono uppercase font-bold text-[#8F6A00]">
                        Synaptic Challenge Reward
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-mono font-black text-[#152659] flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-[#BF9A2A]" />
                      <span>+{lastChallengeAward.totalEarned} XP</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#DDD7C8] text-center text-[11px] font-mono">
                    <div className="p-1.5 rounded-lg bg-white border border-[#DDD7C8]">
                      <span className="text-[#736D6B] block text-[9px] uppercase">Base Points</span>
                      <span className="font-bold text-[#2B2827]">{lastChallengeAward.basePoints} pts</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-[#DDD7C8]">
                      <span className="text-[#736D6B] block text-[9px] uppercase">Speed Multiplier</span>
                      <span className="font-bold text-[#8F6A00]">{lastChallengeAward.velocityMultiplier.toFixed(1)}x ({lastChallengeAward.speedTierLabel.split(' ')[0]})</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-[#DDD7C8]">
                      <span className="text-[#736D6B] block text-[9px] uppercase">Streak Bonus</span>
                      <span className="font-bold text-[#2F6A38]">{lastChallengeAward.streakMultiplier.toFixed(1)}x ({challengeStreak} Combo)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Score & Rating Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDD7C8] pb-4 relative z-20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                      evaluationResult.isOffTopic || evaluationResult.comprehensionLevel === 'off_topic'
                        ? 'bg-[#FAF3E0] text-[#8F6A00] border border-[#E8D4A2]'
                        : evaluationResult.score >= 70
                        ? 'bg-[#F0F7F1] text-[#2F6A38] border border-[#BFE0C4]'
                        : 'bg-[#FDF2F0] text-[#993B2B] border border-[#F2C0B8]'
                    }`}>
                      FSRS Grade: {evaluationResult.rating || (evaluationResult.score >= 70 ? 'GOOD' : 'AGAIN')} ({evaluationResult.score}/100)
                    </span>
                    <span className="text-xs font-mono text-[#736D6B]">
                      Level: {String(evaluationResult.comprehensionLevel || 'evaluated').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h4 className="text-lg font-serif font-bold text-[#2B2827]">
                    {evaluationResult.isOffTopic || evaluationResult.comprehensionLevel === 'off_topic'
                      ? '⚠️ Off-Topic Response — Re-focus on Concept'
                      : evaluationResult.score >= 70
                      ? '🌸 Synaptic Crack Repaired with Gold!'
                      : '⚠️ Neural Gap Detected — Re-anchoring Synapse'}
                  </h4>
                </div>

                <div className="bg-[#FAF8F2] px-4 py-2 rounded-xl border border-[#DDD7C8] text-center shadow-sm">
                  <div className="text-xs text-[#736D6B] font-mono font-semibold">New Stability (S)</div>
                  <div className="text-lg font-bold font-mono text-[#8F6A00]">
                    {evaluationResult.updatedStabilityDays || 1.5} Days
                  </div>
                </div>
              </div>

              {/* Off-Topic Special Banner */}
              {(evaluationResult.isOffTopic || evaluationResult.comprehensionLevel === 'off_topic') && (
                <div className="bg-[#FAF3E0] border border-[#E8D4A2] rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#8F6A00]">
                    <AlertTriangle className="w-4 h-4 text-[#BF9A2A]" />
                    Divergent / Off-Topic Answer Detected
                  </div>
                  <p className="text-xs text-[#5A5553] leading-relaxed">
                    Your response did not engage with the core mechanism of <b>{concept.title}</b>. In spaced retrieval practice, actively explaining the question's causal constraints is required to strengthen biological memory traces.
                  </p>
                </div>
              )}

              {/* Feedback Body */}
              <div className="space-y-2 text-xs text-[#5A5553] leading-relaxed">
                <p>{evaluationResult.feedback}</p>
              </div>

              {/* Strengths / Accurate Points */}
              {evaluationResult.strengths && evaluationResult.strengths.length > 0 && (
                <div className="space-y-1 bg-[#F0F7F1] p-3 rounded-xl border border-[#BFE0C4] text-xs">
                  <div className="text-[11px] font-mono text-[#2F6A38] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2F6A38]" /> Accurate Mechanisms Recalled:
                  </div>
                  <ul className="list-disc list-inside text-[#2F6A38] space-y-0.5 pt-0.5">
                    {evaluationResult.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Misconceptions Caught */}
              {evaluationResult.misconceptionsIdentified && evaluationResult.misconceptionsIdentified.length > 0 && (
                <div className="space-y-1 bg-[#FDF2F0] p-3 rounded-xl border border-[#F2C0B8] text-xs">
                  <div className="text-[11px] font-mono text-[#993B2B] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#993B2B]" /> Illusion of Competence Corrected:
                  </div>
                  <ul className="list-disc list-inside text-[#993B2B] space-y-0.5 pt-0.5">
                    {evaluationResult.misconceptionsIdentified.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Core Elements */}
              {evaluationResult.missingElements && evaluationResult.missingElements.length > 0 && (
                <div className="space-y-1 bg-[#FAF8F2] p-3 rounded-xl border border-[#DDD7C8] text-xs">
                  <div className="text-[11px] font-mono text-[#8F6A00] font-bold flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-[#8F6A00]" /> Missing Invariant Details:
                  </div>
                  <ul className="list-disc list-inside text-[#5A5553] space-y-0.5 pt-0.5">
                    {evaluationResult.missingElements.map((el, i) => (
                      <li key={i}>{el}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Kintsugi Golden Insight Seam */}
              {evaluationResult.goldenInsight && (
                <div className="p-4 rounded-xl bg-[#FAF8F2] border border-[#BF9A2A]/60 space-y-1">
                  <div className="text-[11px] font-mono text-[#8F6A00] font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#BF9A2A]" /> Kintsugi Golden Seam (The Anchor):
                  </div>
                  <p className="text-xs text-[#2B2827] font-serif italic leading-relaxed">
                    "{evaluationResult.goldenInsight}"
                  </p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setEvaluationResult(null);
                      setStudentAnswer('');
                      setSelectedMcqOption(null);
                      setLastChallengeAward(null);
                      setChallengeSecondsRemaining(challengeTimeLimit);
                      if (currentQIndex < questions.length - 1) {
                        setCurrentQIndex((prev) => prev + 1);
                      } else {
                        fetchQuestions();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] hover:text-[#2B2827] text-xs font-mono transition-colors border border-[#DDD7C8] shadow-sm font-semibold"
                  >
                    Next Socratic Question →
                  </button>
                </div>

                <button
                  onClick={onBackToGarden}
                  className="px-5 py-2 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] font-bold text-xs transition-colors shadow-sm"
                >
                  Return to Synaptic Garden
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-8 text-center space-y-3 shadow-sm">
          <p className="text-sm text-[#5A5553]">No questions loaded for this concept.</p>
          <button
            onClick={fetchQuestions}
            className="px-4 py-2 rounded-xl bg-[#152659] text-[#FFFFFF] font-semibold text-xs shadow-sm hover:bg-[#1E357A]"
          >
            Generate Questions Now
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HIGH-CONTRAST DISTRACTION-FREE DEEP FOCUS FULLSCREEN OVERLAY              */}
      {/* ========================================================================= */}
      {isDeepFocus && (
        <div
          className={`fixed inset-0 z-50 overflow-y-auto flex flex-col justify-between backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 ${
            deepFocusTheme === 'obsidian'
              ? 'bg-[#0B0F19] text-[#F8FAFC]'
              : 'bg-[#F9F7F1] text-[#1E293B]'
          }`}
        >
          {/* Top Focus Bar */}
          <div
            className={`w-full px-6 py-4 flex items-center justify-between border-b transition-colors ${
              deepFocusTheme === 'obsidian'
                ? 'border-[#1E293B] bg-[#0F172A]/90'
                : 'border-[#DDD7C8] bg-[#FFFFFF]/90'
            }`}
          >
            {/* Left: Concept Title & Category */}
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#BF9A2A] animate-pulse shadow-[0_0_8px_#BF9A2A]" />
              <div>
                <span
                  className={`text-[10px] font-mono uppercase font-bold tracking-wider ${
                    deepFocusTheme === 'obsidian' ? 'text-[#BF9A2A]' : 'text-[#8F6A00]'
                  }`}
                >
                  {concept.category} • DEEP FOCUS ACTIVE
                </span>
                <h1 className="text-base sm:text-lg font-serif font-bold tracking-tight line-clamp-1">
                  {concept.title}
                </h1>
              </div>
            </div>

            {/* Center: Live Flow State Timer / Challenge Timer */}
            <div className="flex items-center gap-2">
              {isChallengeMode && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border shadow-inner ${
                    challengeSecondsRemaining <= 10
                      ? 'bg-[#EF4444]/30 border-[#EF4444] text-[#FCA5A5] animate-pulse'
                      : 'bg-[#BF9A2A]/20 border-[#BF9A2A] text-[#FDE68A]'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>Challenge: {challengeSecondsRemaining}s ({currentSpeedMultiplier.toFixed(1)}x)</span>
                </div>
              )}

              <div
                className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border shadow-inner ${
                  deepFocusTheme === 'obsidian'
                    ? 'bg-[#1E293B] border-[#334155] text-[#F1F5F9]'
                    : 'bg-[#FAF8F2] border-[#DDD7C8] text-[#2B2827]'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-[#BF9A2A] animate-spin" style={{ animationDuration: '6s' }} />
                <span>Flow: {formatFocusTime(focusSeconds)}</span>
              </div>
            </div>

            {/* Right: Theme Toggle & Exit Focus Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setDeepFocusTheme((prev) => (prev === 'obsidian' ? 'alabaster' : 'obsidian'))
                }
                className={`p-2 rounded-xl border text-xs transition-colors ${
                  deepFocusTheme === 'obsidian'
                    ? 'bg-[#1E293B] border-[#334155] text-[#94A3B8] hover:text-[#FFFFFF]'
                    : 'bg-[#FFFFFF] border-[#DDD7C8] text-[#736D6B] hover:text-[#2B2827]'
                }`}
                title="Toggle High-Contrast Theme (Obsidian Dark / Monastic Alabaster)"
              >
                {deepFocusTheme === 'obsidian' ? <Sun className="w-4 h-4 text-[#BF9A2A]" /> : <Moon className="w-4 h-4 text-[#152659]" />}
              </button>

              <button
                onClick={handleToggleDeepFocus}
                className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                  deepFocusTheme === 'obsidian'
                    ? 'bg-[#1E293B] hover:bg-[#334155] border-[#334155] text-[#F8FAFC]'
                    : 'bg-[#FFFFFF] hover:bg-[#EAE6D6] border-[#DDD7C8] text-[#2B2827]'
                }`}
                title="Exit Deep Focus (Press ESC)"
              >
                <Minimize2 className="w-3.5 h-3.5 text-[#BF9A2A]" />
                <span className="hidden sm:inline">Exit Flow</span>
                <span className="text-[10px] opacity-60 ml-0.5 bg-black/20 px-1 py-0.5 rounded font-mono">ESC</span>
              </button>
            </div>
          </div>

          {/* Central High-Contrast Flow Stage */}
          <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center space-y-6">
            {isLoadingQuestions ? (
              <div className="text-center py-16 space-y-4">
                <Loader2 className="w-10 h-10 mx-auto animate-spin text-[#BF9A2A]" />
                <h3 className="text-lg font-serif font-bold">Synthesizing Socratic Invariants...</h3>
                <p className="text-xs font-mono opacity-70">Gemini 3.7 Flash tailoring neural probe</p>
              </div>
            ) : currentQ ? (
              <>
                {/* Clean Prompt Card */}
                <div
                  className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-4 transition-all ${
                    deepFocusTheme === 'obsidian'
                      ? 'bg-[#131C2E] border-[#24344D]'
                      : 'bg-[#FFFFFF] border-[#DDD7C8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-mono uppercase font-bold border ${
                        deepFocusTheme === 'obsidian'
                          ? 'bg-[#BF9A2A]/20 text-[#F59E0B] border-[#BF9A2A]/50'
                          : 'bg-[#BF9A2A]/15 text-[#8F6A00] border-[#BF9A2A]/40'
                      }`}
                    >
                      {currentQ.type === 'free_recall' ? '⚡ Forced Generative Recall' : '🎯 Diagnostic MCQ Probe'}
                    </span>

                    <button
                      onClick={handleToggleSpeakQuestion}
                      className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors ${
                        deepFocusTheme === 'obsidian'
                          ? 'bg-[#1E293B] border-[#334155] text-[#94A3B8] hover:text-[#FFFFFF]'
                          : 'bg-[#FAF8F2] border-[#DDD7C8] text-[#5A5553] hover:text-[#2B2827]'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4 text-[#BF9A2A]" /> : <Volume2 className="w-4 h-4 text-[#BF9A2A]" />}
                      <span className="text-[11px]">{isSpeaking ? 'Mute' : 'Listen'}</span>
                    </button>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-serif font-bold leading-relaxed tracking-wide">
                    {currentQ.promptText}
                  </h2>

                  {/* Subtle Hint Toggle to prevent distraction */}
                  {currentQ.contextHint && (
                    <div>
                      {!showHintInFocus ? (
                        <button
                          onClick={() => setShowHintInFocus(true)}
                          className="text-xs font-mono text-[#BF9A2A] hover:underline flex items-center gap-1 font-semibold pt-1"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Show Context Hint</span>
                        </button>
                      ) : (
                        <div
                          className={`p-3.5 rounded-2xl text-xs font-mono border leading-relaxed ${
                            deepFocusTheme === 'obsidian'
                              ? 'bg-[#0B0F19] border-[#24344D] text-[#CBD5E1]'
                              : 'bg-[#FAF8F2] border-[#DDD7C8] text-[#5A5553]'
                          }`}
                        >
                          <span className="font-bold text-[#BF9A2A]">Hint:</span> {currentQ.contextHint}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Response Area */}
                {!evaluationResult ? (
                  <div className="space-y-4">
                    {currentQ.type === 'mcq' && currentQ.options ? (
                      <div className="space-y-3">
                        {currentQ.options.map((opt, idx) => {
                          const isSelected = selectedMcqOption === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedMcqOption(idx)}
                              className={`w-full text-left p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm font-mono transition-all flex items-start gap-4 shadow-sm ${
                                isSelected
                                  ? deepFocusTheme === 'obsidian'
                                    ? 'bg-[#1E3A8A] border-[#60A5FA] text-[#FFFFFF] font-bold ring-2 ring-[#60A5FA]/40'
                                    : 'bg-[#EBF0FA] border-[#152659] text-[#152659] font-bold ring-2 ring-[#152659]/30'
                                  : deepFocusTheme === 'obsidian'
                                  ? 'bg-[#131C2E] border-[#24344D] text-[#94A3B8] hover:text-[#FFFFFF] hover:border-[#475569]'
                                  : 'bg-[#FFFFFF] border-[#DDD7C8] text-[#5A5553] hover:text-[#2B2827] hover:border-[#736D6B]'
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                  isSelected
                                    ? 'bg-[#BF9A2A] text-[#0B0F19] border-[#BF9A2A]'
                                    : deepFocusTheme === 'obsidian'
                                    ? 'border-[#475569] text-[#94A3B8]'
                                    : 'border-[#DDD7C8] text-[#736D6B]'
                                }`}
                              >
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="leading-relaxed">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative">
                          <textarea
                            autoFocus
                            value={studentAnswer}
                            onChange={(e) => setStudentAnswer(e.target.value)}
                            rows={8}
                            placeholder="Articulate the full causal invariant from pure memory... (No notes, embrace constructive struggle)"
                            className={`w-full rounded-3xl p-5 sm:p-6 text-sm font-mono leading-relaxed border transition-all focus:outline-none focus:ring-2 shadow-inner ${
                              deepFocusTheme === 'obsidian'
                                ? 'bg-[#131C2E] border-[#24344D] text-[#F8FAFC] placeholder-[#64748B] focus:border-[#BF9A2A] focus:ring-[#BF9A2A]/20'
                                : 'bg-[#FFFFFF] border-[#DDD7C8] text-[#2B2827] placeholder-[#736D6B] focus:border-[#BF9A2A] focus:ring-[#BF9A2A]/20'
                            }`}
                          />

                          {/* Voice Input Floating Toggle inside textarea */}
                          <div className="absolute right-4 bottom-4 flex items-center gap-2">
                            <button
                              onClick={toggleVoiceRecording}
                              className={`p-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all shadow-md ${
                                isListening
                                  ? 'bg-[#EF4444] text-[#FFFFFF] border-[#DC2626] animate-pulse'
                                  : deepFocusTheme === 'obsidian'
                                  ? 'bg-[#1E293B] hover:bg-[#334155] border-[#334155] text-[#94A3B8] hover:text-[#FFFFFF]'
                                  : 'bg-[#FAF8F2] hover:bg-[#EAE6D6] border-[#DDD7C8] text-[#5A5553]'
                              }`}
                              title="Voice dictate answer"
                            >
                              {isListening ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-[#BF9A2A]" />}
                              <span className="text-[11px] hidden sm:inline">{isListening ? 'Recording...' : 'Voice Dictate'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono opacity-70 px-2">
                          <span>{wordCount} words • {charCount} characters</span>
                          <span className="text-[#BF9A2A] font-semibold">Press ⌘ + Enter to submit</span>
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={handleToggleDeepFocus}
                        className={`text-xs font-mono hover:underline ${
                          deepFocusTheme === 'obsidian' ? 'text-[#94A3B8]' : 'text-[#736D6B]'
                        }`}
                      >
                        Exit Deep Focus (ESC)
                      </button>

                      <button
                        onClick={handleSubmitAnswer}
                        disabled={isEvaluating}
                        className="px-8 py-3.5 rounded-2xl bg-[#BF9A2A] hover:bg-[#A67E1E] text-[#0B0F19] font-bold font-mono text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        {isEvaluating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#0B0F19]" />
                            Bayesian Evaluation...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Mend Synapse & Submit</span>
                            <span className="text-[10px] opacity-75 bg-black/15 px-1.5 py-0.5 rounded ml-1 font-mono">⌘↵</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Evaluation State inside Deep Focus */
                  <div
                    className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 transition-all relative overflow-hidden ${
                      deepFocusTheme === 'obsidian'
                        ? 'bg-[#131C2E] border-[#BF9A2A]/80'
                        : 'bg-[#FFFFFF] border-[#BF9A2A]'
                    }`}
                  >
                    {evaluationResult.score >= 70 && (
                      <KintsugiOverlay repairs={concept.kintsugiRepairs || 1} intensity="radiant" />
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#334155]/60 relative z-20">
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                            evaluationResult.score >= 70
                              ? 'bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40'
                              : 'bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/40'
                          }`}
                        >
                          FSRS Score: {evaluationResult.rating} ({evaluationResult.score}/100)
                        </span>
                        <h3 className="text-xl font-serif font-bold mt-2">
                          {evaluationResult.score >= 75
                            ? 'Synaptic Crack Repaired with Gold!'
                            : 'Constructive Neural Struggle Detected'}
                        </h3>
                      </div>

                      <div
                        className={`p-3 rounded-2xl border text-center font-mono ${
                          deepFocusTheme === 'obsidian'
                            ? 'bg-[#0B0F19] border-[#24344D]'
                            : 'bg-[#FAF8F2] border-[#DDD7C8]'
                        }`}
                      >
                        <div className="text-[10px] uppercase text-[#94A3B8]">New Stability</div>
                        <div className="text-xl font-bold text-[#BF9A2A]">
                          {evaluationResult.updatedStabilityDays} Days
                        </div>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="space-y-2 text-xs sm:text-sm leading-relaxed opacity-90">
                      <p>{evaluationResult.feedback}</p>
                    </div>

                    {/* Golden Seam */}
                    {evaluationResult.goldenInsight && (
                      <div
                        className={`p-4 rounded-2xl border space-y-1.5 ${
                          deepFocusTheme === 'obsidian'
                            ? 'bg-[#0B0F19] border-[#BF9A2A]/60'
                            : 'bg-[#FAF8F2] border-[#BF9A2A]/50'
                        }`}
                      >
                        <div className="text-xs font-mono text-[#BF9A2A] font-bold flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#BF9A2A]" /> Kintsugi Golden Seam (The Anchor):
                        </div>
                        <p className="text-xs sm:text-sm font-serif italic leading-relaxed text-[#BF9A2A]">
                          "{evaluationResult.goldenInsight}"
                        </p>
                      </div>
                    )}

                    {/* Next Question / Flow Continuation */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={handleToggleDeepFocus}
                        className="px-4 py-2 rounded-xl text-xs font-mono border hover:bg-black/10 transition-colors"
                      >
                        Exit Deep Focus
                      </button>

                      <button
                        onClick={() => {
                          setEvaluationResult(null);
                          setStudentAnswer('');
                          setSelectedMcqOption(null);
                          setShowHintInFocus(false);
                          setLastChallengeAward(null);
                          setChallengeSecondsRemaining(challengeTimeLimit);
                          if (currentQIndex < questions.length - 1) {
                            setCurrentQIndex((prev) => prev + 1);
                          } else {
                            fetchQuestions();
                          }
                        }}
                        className="px-6 py-3 rounded-2xl bg-[#BF9A2A] hover:bg-[#A67E1E] text-[#0B0F19] font-bold font-mono text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
                      >
                        <span>Next Calibrated Probe</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Bottom Minimalist Focus Bar */}
          <div
            className={`w-full px-6 py-3 border-t flex items-center justify-between text-[11px] font-mono opacity-60 ${
              deepFocusTheme === 'obsidian' ? 'border-[#1E293B]' : 'border-[#DDD7C8]'
            }`}
          >
            <span>Kintsugi Neuroplasticity Engine • Bayesian Retrieval</span>
            <div className="flex items-center gap-4">
              <span>Question {currentQIndex + 1} of {questions.length}</span>
              <span>•</span>
              <span>FSRS Stability S={concept.stability}d</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
