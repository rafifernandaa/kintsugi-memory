import React from 'react';
import {
  Sparkles,
  Brain,
  Zap,
  Activity,
  Layers,
  Cloud,
  Cpu,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  FileText,
  Mic,
  Bell,
  Award,
  BookOpen,
  Mail,
  User,
} from 'lucide-react';

interface AboutTabProps {
  onNavigateToTab: (tab: 'home' | 'materials' | 'calendar' | 'review' | 'neuroplasticity' | 'progress' | 'journal' | 'insights' | 'selene') => void;
}

export const AboutTab: React.FC<AboutTabProps> = ({ onNavigateToTab }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDD7C8] pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/30">
            Cognitive Science & System Architecture
          </span>
          <span className="text-xs font-mono text-[#736D6B]">
            Kintsugi Memory Platform
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B2827] tracking-tight">
          How Kintsugi Memory Works
        </h1>
        <p className="text-sm text-[#5A5553] max-w-3xl leading-relaxed">
          Kintsugi Memory is an autonomous cognitive partner that models biological power-law forgetting curves and repairs fragile synapses with Socratic gold.
        </p>
      </div>

      {/* 1. The Core Metaphor & Philosophy */}
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF3E0] border border-[#E8D4A2] flex items-center justify-center text-[#8F6A00]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#2B2827]">
              The Philosophy of Kintsugi (金継ぎ)
            </h2>
            <div className="text-xs font-mono text-[#736D6B]">
              Gold joinery: Making the fragile fracture the strongest part of understanding
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5A5553] leading-relaxed">
          Traditional learning apps treat forgetting as failure. In Japanese pottery, when a bowl breaks, masters repair the fractures with urushi lacquer mixed with powdered gold. The vessel becomes more beautiful and resilient than before it broke.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-2">
            <div className="text-xs font-mono font-bold text-[#993B2B] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> 1. The Crack (Forgetting)
            </div>
            <p className="text-xs text-[#5A5553] leading-relaxed">
              When retrievability drops below 70%, the concept enters the Forgetting Cliff where illusions of competence fail.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-2">
            <div className="text-xs font-mono font-bold text-[#152659] flex items-center gap-1.5">
              <Brain className="w-4 h-4" /> 2. Socratic Active Retrieval
            </div>
            <p className="text-xs text-[#5A5553] leading-relaxed">
              Instead of passive re-reading, the agent tests causal discrimination with scenario-based generative challenges.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-2">
            <div className="text-xs font-mono font-bold text-[#8F6A00] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> 3. The Golden Seam
            </div>
            <p className="text-xs text-[#5A5553] leading-relaxed">
              Memory stability expands exponentially with successful retrieval, locking the concept into permanent synaptic memory.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Bayesian FSRS Mathematical Engine */}
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F0F7F1] border border-[#BFE0C4] flex items-center justify-center text-[#2F6A38]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#2B2827]">
              Bayesian Free Spaced Repetition (FSRS)
            </h2>
            <div className="text-xs font-mono text-[#736D6B]">
              Power-law retrievability decay & adaptive interval scheduling
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5A5553] leading-relaxed">
          Unlike static flashcards or naive linear decay, Kintsugi Memory models human cognitive decay using a continuous two-component Bayesian parameterization:
        </p>

        <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] font-mono text-xs text-[#2B2827] space-y-2 overflow-x-auto">
          <div className="text-[#8F6A00] font-bold">Power-Law Retention Equation:</div>
          <div className="text-sm font-semibold text-[#152659] py-1">
            R(t, S) = (1 + Factor × (t / S))<sup>-decay_rate</sup>
          </div>
          <div className="text-[#736D6B] text-[11px] pt-1">
            Where <span className="text-[#152659] font-bold">t</span> is elapsed days since last practice, and <span className="text-[#152659] font-bold">S</span> is memory stability in days.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-1">
            <div className="font-bold text-[#2B2827]">Stability (S)</div>
            <p className="text-[#5A5553]">
              The duration (in days) before memory retention drops to 90%. Increases exponentially with successful Socratic recall.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-1">
            <div className="font-bold text-[#2B2827]">Difficulty (D)</div>
            <p className="text-[#5A5553]">
              Inherent cognitive load from 1 (intuitive) to 10 (highly abstract). Calibrated dynamically by AI evaluations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-1">
            <div className="font-bold text-[#2B2827]">Retrievability (R)</div>
            <p className="text-[#5A5553]">
              Current probability of successfully retrieving the concept without cues. Monitored continuously in real time.
            </p>
          </div>
        </div>
      </div>

      {/* 3. The 4-Agent Pipeline */}
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] flex items-center justify-center text-[#152659]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#2B2827]">
              The 4-Agent Pipeline
            </h2>
            <div className="text-xs font-mono text-[#736D6B]">
              Built with Google GenAI SDK & Google Cloud Vertex AI
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#152659] text-white text-xs font-mono font-bold flex items-center justify-center">1</span>
              <h3 className="font-serif font-bold text-[#2B2827] text-sm">IngestionDistillerAgent</h3>
            </div>
            <p className="text-xs text-[#5A5553] leading-relaxed">
              Consumes messy student notes, audio lecture recordings, and slide decks. Isolates atomic invariants, causal mechanisms, and common cognitive traps.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#8F6A00] text-white text-xs font-mono font-bold flex items-center justify-center">2</span>
              <h3 className="font-serif font-bold text-[#2B2827] text-sm">SocraticInterviewerAgent</h3>
            </div>
            <p className="text-xs text-[#5A5553] leading-relaxed">
              Generates scenario-based edge cases and misconception-discriminating challenges that cannot be answered with rote memorization.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#2F6A38] text-white text-xs font-mono font-bold flex items-center justify-center">3</span>
              <h3 className="font-serif font-bold text-[#2B2827] text-sm">CognitiveEvaluatorAgent</h3>
            </div>
            <p className="text-xs text-[#5A5553] leading-relaxed">
              Grades student spoken/written responses for conceptual fidelity, computes delta difficulty, and provides a customized Golden Insight.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#993B2B] text-white text-xs font-mono font-bold flex items-center justify-center">4</span>
              <h3 className="font-serif font-bold text-[#2B2827] text-sm">AutonomousCliffAgent</h3>
            </div>
            <p className="text-xs text-[#5A5553] leading-relaxed">
              Continuously runs in the background. Proactively initiates contact via Google Cloud Pub/Sub and email when a concept reaches its 70% forgetting cliff.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Google Cloud Infrastructure */}
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] flex items-center justify-center text-[#8F6A00]">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#2B2827]">
              Google Cloud Platform Production Infrastructure
            </h2>
            <div className="text-xs font-mono text-[#736D6B]">
              Google Cloud Run • Enterprise Managed Infrastructure
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-1.5">
            <div className="font-bold text-[#2B2827] flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#BF9A2A]" /> Google Cloud Run
            </div>
            <p className="text-[#5A5553] leading-relaxed">
              Auto-scaling container service hosting the full TypeScript SSR + Express agent backend under dedicated service account <code className="font-mono text-[10px] bg-[#FFFFFF] px-1 py-0.5 rounded border border-[#DDD7C8]">kintsugi-runner</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-1.5">
            <div className="font-bold text-[#2B2827] flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-[#152659]" /> Google Cloud Pub/Sub
            </div>
            <p className="text-[#5A5553] leading-relaxed">
              Asynchronous event topic <code className="font-mono text-[10px] bg-[#FFFFFF] px-1 py-0.5 rounded border border-[#DDD7C8]">kintsugi-cliff-pings</code> for non-blocking forgetting-cliff alerts and background worker dispatching.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-1.5">
            <div className="font-bold text-[#2B2827] flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-[#2F6A38]" /> Vertex AI & Speech-to-Text
            </div>
            <p className="text-[#5A5553] leading-relaxed">
              Dual audio pipeline using Gemini 3.5 multimodal audio and browser Web Speech API for live classroom and language conversation transcription.
            </p>
          </div>
        </div>
      </div>

      {/* Call-to-Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={() => onNavigateToTab('materials')}
          className="px-5 py-2.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4 text-[#BF9A2A]" />
          <span>Ingest First Learning Notes</span>
        </button>

        <button
          onClick={() => onNavigateToTab('selene')}
          className="px-5 py-2.5 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#2B2827] border border-[#DDD7C8] text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <User className="w-4 h-4 text-[#8F6A00]" />
          <span>Configure Selene Account & SMTP</span>
        </button>

        <button
          onClick={() => onNavigateToTab('journal')}
          className="px-5 py-2.5 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#2B2827] border border-[#DDD7C8] text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-[#BF9A2A]" />
          <span>Open Cognitive Journal</span>
        </button>
      </div>
    </div>
  );
};
