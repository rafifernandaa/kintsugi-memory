import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Concept } from '../types';
import { KintsugiOverlay } from './KintsugiOverlay';
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Sparkles,
  TrendingDown,
  X,
  Zap,
} from 'lucide-react';

interface DailySynapticSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  concepts: Concept[];
  onStartRetrievalForConcept: (concept: Concept) => void;
  onStartPriorityRetrieval: () => void;
}

export const DailySynapticSummaryModal: React.FC<DailySynapticSummaryModalProps> = ({
  isOpen,
  onClose,
  concepts,
  onStartRetrievalForConcept,
  onStartPriorityRetrieval,
}) => {
  const [dontShowAgainToday, setDontShowAgainToday] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dontShowAgainToday]);

  const handleDismiss = () => {
    if (dontShowAgainToday) {
      const todayStr = new Date().toISOString().split('T')[0];
      localStorage.setItem('kintsugi_daily_summary_dismissed_date', todayStr);
    }
    onClose();
  };

  if (!isOpen || typeof document === 'undefined') return null;

  // Compute cognitive cliff metrics
  const cliffConcepts = concepts
    .filter((c) => c.currentRetention < 0.70)
    .sort((a, b) => a.currentRetention - b.currentRetention);

  const wiltingConcepts = concepts
    .filter((c) => c.currentRetention >= 0.70 && c.currentRetention < 0.82)
    .sort((a, b) => a.currentRetention - b.currentRetention);

  const healthyCount = concepts.filter((c) => c.currentRetention >= 0.82).length;

  const averageRetention = concepts.length > 0
    ? Math.round(
        (concepts.reduce((acc, c) => acc + c.currentRetention, 0) / concepts.length) * 100
      )
    : 100;

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const estimatedMinutes = Math.max(1, Math.ceil(cliffConcepts.length * 1.5));

  const modalContent = (
    <div
      onClick={handleDismiss}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-4 bg-[#2B2827]/40 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-summary-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3 overflow-hidden ring-1 ring-[#BF9A2A]/30 cursor-default select-none my-auto max-h-[92vh] flex flex-col"
      >
        {/* Subtle Kintsugi ambient veins */}
        <KintsugiOverlay repairs={Math.max(3, cliffConcepts.length)} intensity="subtle" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          aria-label="Close Daily Synaptic Summary"
          className="absolute top-3.5 right-3.5 p-1 rounded-full bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] hover:text-[#2B2827] border border-[#DDD7C8] transition-colors z-30 flex items-center gap-1 text-[10px] font-mono shadow-xs"
        >
          <X className="w-3.5 h-3.5" />
          <span className="hidden sm:inline pr-0.5 text-[9px] text-[#736D6B]">Esc</span>
        </button>

        {/* Header Section */}
        <div className="relative z-20 space-y-0.5 pr-10">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/40 text-[9px] font-mono font-bold">
              <Calendar className="w-2.5 h-2.5 text-[#8F6A00]" />
              {todayFormatted}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FAF8F2] text-[#5A5553] border border-[#DDD7C8] text-[9px] font-mono font-medium">
              <Brain className="w-2.5 h-2.5 text-[#8F6A00]" />
              Daily Synaptic Briefing
            </span>
          </div>

          <h2
            id="daily-summary-title"
            className="text-lg sm:text-xl font-serif font-bold text-[#2B2827] flex items-center gap-1.5 pt-0.5 leading-tight"
          >
            <span>Daily Synaptic Summary</span>
          </h2>
          <p className="text-[11px] text-[#5A5553] leading-snug">
            {cliffConcepts.length > 0
              ? `${cliffConcepts.length} memory vessel${cliffConcepts.length > 1 ? 's are' : ' is'} crossing the 70% Forgetting Cliff today. Forced Socratic recall will reinforce the synaptic seams.`
              : 'All memory vessels are currently above the critical threshold. Review wilting concepts to maintain compound retention.'}
          </p>
        </div>

        {/* Cognitive Health Pulse KPI Strip */}
        <div className="relative z-20 grid grid-cols-3 gap-2 text-center font-mono">
          <div className="p-2 rounded-xl bg-[#FDF2F0] border border-[#F2C0B8] space-y-0.5 shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[#993B2B] font-bold text-sm sm:text-base">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{cliffConcepts.length}</span>
            </div>
            <div className="text-[9px] text-[#736D6B] uppercase tracking-tight font-medium">
              At Cliff (&lt;70%)
            </div>
          </div>

          <div className="p-2 rounded-xl bg-[#FAF8F2] border border-[#BF9A2A]/40 space-y-0.5 shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[#8F6A00] font-bold text-sm sm:text-base">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{wiltingConcepts.length}</span>
            </div>
            <div className="text-[9px] text-[#736D6B] uppercase tracking-tight font-medium">
              Wilting (70-82%)
            </div>
          </div>

          <div className="p-2 rounded-xl bg-[#F0F7F1] border border-[#BFE0C4] space-y-0.5 shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[#2F6A38] font-bold text-sm sm:text-base">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{averageRetention}%</span>
            </div>
            <div className="text-[9px] text-[#736D6B] uppercase tracking-tight font-medium">
              Avg Retention
            </div>
          </div>
        </div>

        {/* Cliff Concepts Scrollable Roster */}
        <div className="relative z-20 flex-1 overflow-y-auto space-y-1.5 pr-0.5 max-h-[140px]">
          <div className="text-[10px] font-mono text-[#736D6B] uppercase tracking-wider flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1 text-[#8F6A00]">
              <Flame className="w-3 h-3 text-[#8F6A00]" />
              Priority Forgetting-Cliff Roster
            </span>
            <span className="text-[9px] text-[#736D6B]">
              Sorted by urgency
            </span>
          </div>

          {cliffConcepts.length > 0 ? (
            cliffConcepts.map((concept) => {
              const retPct = Math.round(concept.currentRetention * 100);
              return (
                <div
                  key={concept.id}
                  className="p-2 rounded-xl bg-[#FFFFFF] border border-[#F2C0B8] hover:border-[#BF9A2A] transition-all flex items-center justify-between gap-2.5 group shadow-xs"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-mono uppercase font-bold bg-[#FDF2F0] text-[#993B2B] border border-[#F2C0B8] shrink-0">
                        {retPct}%
                      </span>
                      <span className="text-[9px] font-mono text-[#736D6B] uppercase truncate font-semibold">
                        {concept.category}
                      </span>
                    </div>

                    <h4 className="text-xs font-serif font-bold text-[#2B2827] truncate group-hover:text-[#8F6A00] transition-colors">
                      {concept.title}
                    </h4>

                    <p className="text-[10px] text-[#5A5553] line-clamp-1 leading-snug">
                      {concept.keyMechanisms?.[0] || concept.summary}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      handleDismiss();
                      onStartRetrievalForConcept(concept);
                    }}
                    className="px-2 py-1 rounded-lg bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] font-mono text-[10px] font-bold transition-all shrink-0 flex items-center gap-1 shadow-xs"
                  >
                    <span>Mend</span>
                    <ArrowRight className="w-2.5 h-2.5 text-[#BF9A2A]" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="p-2.5 rounded-xl bg-[#F0F7F1] border border-[#BFE0C4] text-center space-y-0.5">
              <CheckCircle2 className="w-4 h-4 text-[#2F6A38] mx-auto" />
              <div className="text-xs font-serif font-bold text-[#2F6A38]">
                No Critical Fractures Today
              </div>
              <p className="text-[10px] text-[#5A5553]">
                All synapses are safely consolidated above 70% retention.
              </p>
            </div>
          )}

          {/* Show top wilting concepts if cliff is small */}
          {cliffConcepts.length < 2 && wiltingConcepts.length > 0 && (
            <div className="pt-1 space-y-1">
              <div className="text-[9px] font-mono text-[#736D6B] uppercase font-semibold">
                Approaching Cliff (Next to decay)
              </div>
              {wiltingConcepts.slice(0, 2 - cliffConcepts.length).map((concept) => (
                <div
                  key={concept.id}
                  className="p-1.5 rounded-lg bg-[#FAF8F2] border border-[#DDD7C8] flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono text-[#8F6A00] font-bold">
                        {Math.round(concept.currentRetention * 100)}%
                      </span>
                      <h5 className="text-[11px] font-serif font-semibold text-[#2B2827] truncate">
                        {concept.title}
                      </h5>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleDismiss();
                      onStartRetrievalForConcept(concept);
                    }}
                    className="text-[10px] font-mono text-[#152659] hover:text-[#1E357A] font-bold flex items-center gap-1 shrink-0"
                  >
                    <span>Reinforce</span>
                    <ArrowRight className="w-2.5 h-2.5 text-[#8F6A00]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action & Consolidation Recommendation Footer */}
        <div className="relative z-20 pt-1 space-y-2 border-t border-[#DDD7C8]">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#736D6B]">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-[#8F6A00]" />
              Est. Session: ~{estimatedMinutes} min
            </span>
            <span className="flex items-center gap-1 text-[#8F6A00] font-bold">
              <Zap className="w-3 h-3 fill-[#8F6A00] text-[#8F6A00]" />
              ~2.4x Stability Multiplier
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={handleDismiss}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] hover:text-[#2B2827] font-mono text-[11px] transition-colors border border-[#DDD7C8] shadow-xs font-medium"
            >
              Explore Garden First
            </button>
            <button
              onClick={() => {
                handleDismiss();
                onStartPriorityRetrieval();
              }}
              className="w-full flex-1 py-2 px-3 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] font-bold font-mono text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm truncate"
            >
              <Zap className="w-3 h-3 fill-[#BF9A2A] text-[#BF9A2A] shrink-0" />
              <span className="truncate">
                {cliffConcepts.length > 0
                  ? `Mend Priority Concept (${cliffConcepts[0].title})`
                  : 'Start Daily Socratic Practice'}
              </span>
              <ArrowRight className="w-3 h-3 shrink-0 text-[#BF9A2A]" />
            </button>
          </div>

          {/* Don't show again today toggle */}
          <div className="flex items-center justify-between text-[10px] font-mono text-[#736D6B]">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#2B2827]">
              <input
                type="checkbox"
                checked={dontShowAgainToday}
                onChange={(e) => setDontShowAgainToday(e.target.checked)}
                className="w-3 h-3 rounded bg-[#FAF8F2] border-[#DDD7C8] text-[#152659] focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>Don't show again today</span>
            </label>
            <span className="text-[9px] text-[#736D6B]">
              Re-open anytime via navigation
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
