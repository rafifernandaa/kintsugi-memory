import React, { useState } from 'react';
import { SynapticStreakData } from '../types';
import { getStreakTier, getTodayDateString } from '../lib/streak';
import { Flame, Sparkles, Trophy } from 'lucide-react';
import { SynapticStreakModal } from './SynapticStreakModal';
import { playGoldenKintsugiChime } from '../lib/audio';

interface SynapticStreakTrackerProps {
  streak: SynapticStreakData;
  onStartRetrieval: () => void;
  onUpdateStreak?: (updated: SynapticStreakData) => void;
}

export const SynapticStreakTracker: React.FC<SynapticStreakTrackerProps> = ({
  streak,
  onStartRetrieval,
  onUpdateStreak,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const tier = getStreakTier(streak.currentStreak);
  const today = getTodayDateString();
  const completedToday = (streak.historyDates || []).includes(today);

  const handleClick = () => {
    playGoldenKintsugiChime();
    setModalOpen(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`group relative px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border flex items-center gap-1.5 sm:gap-2 transition-all duration-300 shadow-sm ${
          streak.currentStreak > 0
            ? 'bg-[#FFFFFF] border-[#BF9A2A]/50 hover:border-[#BF9A2A] shadow-md'
            : 'bg-[#FFFFFF] border-[#DDD7C8] hover:border-[#736D6B]'
        }`}
        title={`Synaptic Streak: ${streak.currentStreak} Days (${tier.title}). Click to view details.`}
      >
        {/* Subtle continuous golden shimmer bar at top edge */}
        {streak.currentStreak > 0 && (
          <div className="absolute inset-x-0 -top-px h-0.5 bg-gradient-to-r from-transparent via-[#BF9A2A] to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
        )}

        {/* Icon with animated glow */}
        <div className="relative flex items-center justify-center">
          {completedToday ? (
            <div className="relative">
              <Sparkles className="w-4 h-4 text-[#BF9A2A] animate-pulse drop-shadow-[0_0_6px_rgba(191,154,42,0.4)]" />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#BF9A2A] animate-ping" />
            </div>
          ) : (
            <Flame className="w-4 h-4 text-[#BF9A2A] group-hover:text-[#A66D03] animate-bounce transition-colors drop-shadow-[0_0_6px_rgba(191,154,42,0.4)]" />
          )}
        </div>

        {/* Streak Numbers & Label */}
        <div className="flex items-baseline gap-1 font-mono">
          <span className="text-xs sm:text-sm font-bold text-[#8F6A00]">
            {streak.currentStreak}
          </span>
          <span className="text-[10px] text-[#736D6B] font-serif uppercase tracking-wider hidden sm:inline">
            {streak.currentStreak === 1 ? 'day' : 'days'}
          </span>
        </div>

        {/* Gold Japanese Character Badge: 継 (Tsunagu / To mend & connect) */}
        <span className="text-[10px] font-serif font-bold text-[#8F6A00] px-1.5 py-0.2 rounded bg-[#BF9A2A]/15 border border-[#BF9A2A]/40 hidden md:inline">
          継
        </span>
      </button>

      {/* Detail Modal */}
      <SynapticStreakModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        streak={streak}
        onStartRetrieval={onStartRetrieval}
        onUpdateStreak={onUpdateStreak}
      />
    </>
  );
};
