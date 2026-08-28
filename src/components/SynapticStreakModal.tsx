import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SynapticStreakData } from '../types';
import {
  getStreakTier,
  getLast7DaysStatus,
  getTodayDateString,
  simulateStreakDayIncrement,
  resetStreakForDemo,
  recordSessionInStreak,
} from '../lib/streak';
import { Sparkles, Flame, Calendar, CheckCircle2, X, ArrowRight, Zap, RefreshCw, PlusCircle, RotateCcw } from 'lucide-react';
import { KintsugiOverlay } from './KintsugiOverlay';
import { playGoldenKintsugiChime } from '../lib/audio';
import confetti from 'canvas-confetti';

interface SynapticStreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: SynapticStreakData;
  onStartRetrieval: () => void;
  onUpdateStreak?: (updated: SynapticStreakData) => void;
}

export const SynapticStreakModal: React.FC<SynapticStreakModalProps> = ({
  isOpen,
  onClose,
  streak,
  onStartRetrieval,
  onUpdateStreak,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const tier = getStreakTier(streak.currentStreak);
  const weekDays = getLast7DaysStatus(streak.historyDates);
  const today = getTodayDateString();
  const completedToday = (streak.historyDates || []).includes(today);

  // Next milestone calculation
  const milestones = [3, 7, 14, 30, 60, 100];
  const nextMilestone = milestones.find((m) => m > streak.currentStreak) || streak.currentStreak + 10;
  const prevMilestone = [...milestones].reverse().find((m) => m <= streak.currentStreak) || 0;
  const progressToNext = Math.min(
    100,
    Math.max(0, Math.round(((streak.currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100))
  );

  const handleSimulatePlusOne = () => {
    const updated = simulateStreakDayIncrement(streak);
    playGoldenKintsugiChime();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#BF8F54', '#A66D03', '#CBD5F2', '#F2E3B6'],
    });
    if (onUpdateStreak) {
      onUpdateStreak(updated);
    }
  };

  const handleSimulateSessionDone = () => {
    const { updatedStreak } = recordSessionInStreak(streak);
    playGoldenKintsugiChime();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#BF8F54', '#A66D03', '#CBD5F2', '#F2E3B6'],
    });
    if (onUpdateStreak) {
      onUpdateStreak(updatedStreak);
    }
  };

  const handleResetStreak = () => {
    const reset = resetStreakForDemo();
    if (onUpdateStreak) {
      onUpdateStreak(reset);
    }
  };

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-[#2B2827]/60 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5 overflow-hidden ring-1 ring-[#BF9A2A]/30 cursor-default select-none my-auto max-h-[95vh] overflow-y-auto"
      >
        {/* Ambient Kintsugi Gold Veins */}
        <KintsugiOverlay repairs={Math.max(2, streak.currentStreak)} intensity="subtle" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Synaptic Streak Modal"
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#736D6B] hover:text-[#2B2827] border border-[#DDD7C8] transition-colors z-30 flex items-center gap-1 text-[11px] font-mono"
        >
          <X className="w-3.5 h-3.5" />
          <span className="hidden sm:inline pr-0.5 text-[10px] text-[#736D6B]">Esc</span>
        </button>

        {/* Modal Header & Streak Number */}
        <div className="text-center space-y-1 relative z-20 pt-0.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/40 text-[10px] font-mono font-bold">
            <Sparkles className="w-3 h-3 text-[#BF9A2A] animate-pulse" />
            <span>Synaptic Streak Continuum</span>
          </div>

          <div className="flex items-center justify-center gap-2 py-0.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-[#8F6A00]">
                {streak.currentStreak}
              </span>
              <span className="text-sm sm:text-base font-serif font-bold text-[#403C3B]">
                {streak.currentStreak === 1 ? 'Day' : 'Days'}
              </span>
            </div>
            <span className="text-[#DDD7C8] text-xs">|</span>
            <div className="flex items-center gap-1 text-xs font-serif font-bold text-[#2B2827]">
              <Flame className="w-3.5 h-3.5 text-[#BF9A2A] animate-pulse" />
              <span id="streak-modal-title">{tier.title}</span>
            </div>
          </div>

          <p className="text-[11px] text-[#5A5553] max-w-xs mx-auto leading-tight">
            {tier.description}
          </p>
        </div>

        {/* Status Callout */}
        <div className="relative z-20">
          {completedToday ? (
            <div className="p-2.5 rounded-xl bg-[#F0F7F1] border border-[#BFE0C4] flex items-center gap-2.5 text-xs">
              <div className="w-6 h-6 rounded-lg bg-[#2F6A38] text-[#FFFFFF] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-serif font-bold text-[#2F6A38] text-xs leading-tight">
                  Golden Seam Sealed Today
                </div>
                <div className="text-[#5A5553] text-[10px] truncate">
                  Memory traces reinforced against biological decay.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#BF9A2A]/40 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-[#BF9A2A]/20 text-[#8F6A00] flex items-center justify-center shrink-0">
                  <Flame className="w-3.5 h-3.5 text-[#8F6A00] animate-bounce" />
                </div>
                <div className="min-w-0">
                  <div className="font-serif font-bold text-[#2B2827] text-xs leading-tight">
                    Streak Pending Today
                  </div>
                  <div className="text-[#736D6B] text-[10px] truncate">
                    Complete retrieval to maintain golden seam.
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onStartRetrieval();
                }}
                className="px-2.5 py-1 rounded-lg bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] font-bold font-mono text-[11px] whitespace-nowrap transition-colors shadow-sm"
              >
                Mend Now
              </button>
            </div>
          )}
        </div>

        {/* 7-Day Synaptic Calendar Matrix */}
        <div className="relative z-20 space-y-1.5 bg-[#FAF8F2] p-2.5 rounded-2xl border border-[#DDD7C8]">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#736D6B]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#BF9A2A]" /> Past 7 Days
            </span>
            <span className="text-[#8F6A00] font-bold">
              {weekDays.filter((d) => d.isCompleted).length}/7 Active
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center p-1 rounded-lg border text-center transition-all ${
                  day.isCompleted
                    ? 'bg-[#FFFFFF] border-[#BF9A2A]/60 text-[#8F6A00]'
                    : day.isToday
                    ? 'bg-[#FFFFFF] border-[#DDD7C8] text-[#2B2827] ring-1 ring-[#BF9A2A]/40'
                    : 'bg-[#FAF8F2] border-[#E8E3D5] text-[#736D6B]'
                }`}
              >
                <span className="text-[8px] font-mono uppercase">{day.dayName}</span>
                <div className="my-0.5 flex items-center justify-center">
                  {day.isCompleted ? (
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#BF9A2A] to-[#8F6A00] flex items-center justify-center text-[#FFFFFF]">
                      <Sparkles className="w-2.5 h-2.5 text-[#FFFFFF] fill-[#FFFFFF]" />
                    </div>
                  ) : (
                    <div
                      className={`w-4 h-4 rounded-full border border-dashed flex items-center justify-center text-[9px] font-mono ${
                        day.isToday ? 'border-[#BF9A2A] text-[#8F6A00]' : 'border-[#DDD7C8] text-[#736D6B]'
                      }`}
                    >
                      {day.dayNumber}
                    </div>
                  )}
                </div>
                <span className="text-[8px] font-mono font-semibold text-[#736D6B]">
                  {day.isCompleted ? 'Mended' : day.isToday ? 'Pending' : 'Rest'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone & Telemetry Combined Row */}
        <div className="grid grid-cols-3 gap-2 relative z-20 text-center font-mono">
          <div className="p-2 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-0.5">
            <div className="text-xs sm:text-sm font-bold text-[#8F6A00]">{streak.bestStreak}d</div>
            <div className="text-[9px] text-[#736D6B] uppercase leading-none">Best Streak</div>
          </div>
          <div className="p-2 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-0.5">
            <div className="text-xs sm:text-sm font-bold text-[#2B2827]">{streak.totalSessionsCompleted}</div>
            <div className="text-[9px] text-[#736D6B] uppercase leading-none">Total Sessions</div>
          </div>
          <div className="p-2 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] flex flex-col justify-between">
            <div className="text-xs sm:text-sm font-bold text-[#8F6A00]">{nextMilestone}d</div>
            <div className="text-[9px] text-[#736D6B] uppercase leading-none">Next Goal ({progressToNext}%)</div>
          </div>
        </div>

        {/* Judge Demo Testing Toolbar */}
        <div className="p-2.5 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-2 relative z-20">
          <div className="text-[10px] font-mono text-[#8F6A00] font-bold uppercase flex items-center justify-between">
            <span>Judge Demo Controls</span>
            <span className="text-[#736D6B] font-normal">Test Streak Dynamics</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={handleSimulatePlusOne}
              className="px-2 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#EAE6D6] border border-[#DDD7C8] text-[10px] font-mono font-semibold text-[#8F6A00] flex items-center justify-center gap-1 transition-colors"
              title="Add 1 day to streak"
            >
              <PlusCircle className="w-3 h-3" /> +1 Day
            </button>

            <button
              onClick={handleSimulateSessionDone}
              className="px-2 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#EAE6D6] border border-[#DDD7C8] text-[10px] font-mono font-semibold text-[#2F6A38] flex items-center justify-center gap-1 transition-colors"
              title="Simulate daily practice completed"
            >
              <CheckCircle2 className="w-3 h-3" /> Mark Done
            </button>

            <button
              onClick={handleResetStreak}
              className="px-2 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#EAE6D6] border border-[#DDD7C8] text-[10px] font-mono font-semibold text-[#736D6B] hover:text-[#993B2B] flex items-center justify-center gap-1 transition-colors"
              title="Reset streak to 1 day"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Dual Actions: Launch Retrieval OR Close */}
        <div className="relative z-20 pt-0.5 flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#403C3B] hover:text-[#2B2827] font-mono text-[11px] transition-colors border border-[#DDD7C8] whitespace-nowrap"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              onClose();
              onStartRetrieval();
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] font-bold font-mono text-xs flex items-center justify-center gap-1.5 transition-all shadow-md truncate"
          >
            <Zap className="w-3.5 h-3.5 fill-[#BF9A2A] text-[#BF9A2A] shrink-0" />
            <span className="truncate">Launch Socratic Retrieval</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
