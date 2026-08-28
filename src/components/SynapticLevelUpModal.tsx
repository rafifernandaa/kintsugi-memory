import React, { useEffect } from 'react';
import { Sparkles, Trophy, Zap, Shield, Flame, CheckCircle, ArrowRight, Award, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playLevelUpFanfare } from '../lib/audio';

export interface MasteryLevelInfo {
  level: number;
  title: string;
  badgeName: string;
  perks: string[];
  color: string;
  minPoints: number;
  decayResistanceBonus: string;
}

export const MASTERY_TIERS: MasteryLevelInfo[] = [
  {
    level: 1,
    title: 'Novice Synapse',
    badgeName: 'Clay Vessel',
    perks: ['Basic FSRS Bayesian Tracking', 'Standard Calibrated Probes'],
    color: '#736D6B',
    minPoints: 0,
    decayResistanceBonus: '+0%',
  },
  {
    level: 2,
    title: 'Adept Recall',
    badgeName: 'Ceramic Core',
    perks: ['Rapid Multiplier 1.5x Unlocked', '+15% Baseline Stability Extension'],
    color: '#152659',
    minPoints: 300,
    decayResistanceBonus: '+15%',
  },
  {
    level: 3,
    title: 'Golden Joinery Artisan',
    badgeName: 'Kintsugi Seam',
    perks: ['Lightning Multiplier 2.5x Unlocked', 'Autonomous Cliff Detection Pings', 'Golden Aura on Memory Nodes'],
    color: '#8F6A00',
    minPoints: 800,
    decayResistanceBonus: '+30%',
  },
  {
    level: 4,
    title: 'Neural Architect',
    badgeName: 'Obsidian & Gold',
    perks: ['Supercharged 3.5x Multipliers', '+45% Forgetting Curve Shielding', 'Deep Socratic Invariant Probes'],
    color: '#BF9A2A',
    minPoints: 1600,
    decayResistanceBonus: '+45%',
  },
  {
    level: 5,
    title: 'Kintsugi Grandmaster',
    badgeName: 'Eternal Lacquer & Gold',
    perks: ['Max Velocity 5.0x Multiplier', '+60% Indestructible Synaptic Stability', 'Golden Mastery Halo Across Topology'],
    color: '#D4AF37',
    minPoints: 2800,
    decayResistanceBonus: '+60%',
  },
];

export function calculateMasteryTier(totalPoints: number): MasteryLevelInfo {
  let tier = MASTERY_TIERS[0];
  for (let i = MASTERY_TIERS.length - 1; i >= 0; i--) {
    if (totalPoints >= MASTERY_TIERS[i].minPoints) {
      tier = MASTERY_TIERS[i];
      break;
    }
  }
  return tier;
}

interface SynapticLevelUpModalProps {
  newLevel: MasteryLevelInfo;
  previousLevel: MasteryLevelInfo;
  totalPoints: number;
  retentionStreak: number;
  onClose: () => void;
}

export const SynapticLevelUpModal: React.FC<SynapticLevelUpModalProps> = ({
  newLevel,
  previousLevel,
  totalPoints,
  retentionStreak,
  onClose,
}) => {
  useEffect(() => {
    // Play celebratory sound
    playLevelUpFanfare();

    // Trigger dual-side gold confetti burst
    const end = Date.now() + 1500;
    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random() * 0.4 + 0.3, y: Math.random() * 0.4 + 0.3 },
        colors: ['#D4AF37', '#BF9A2A', '#8F6A00', '#152659', '#FAF8F2'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F19]/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Radiant Golden Background Burst */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#BF9A2A]/20 via-[#D4AF37]/30 to-[#8F6A00]/20 blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-lg bg-[#FAF8F2] border-2 border-[#BF9A2A] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-[#2B2827] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Decorative Kintsugi Seam in Background */}
        <svg className="absolute -top-12 -right-12 w-48 h-48 pointer-events-none opacity-25" viewBox="0 0 100 100">
          <path d="M10,90 Q40,40 60,60 T90,10" stroke="#BF9A2A" strokeWidth="4" fill="none" />
        </svg>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#736D6B] hover:text-[#2B2827] hover:bg-black/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Ribbon */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#BF9A2A]/20 text-[#8F6A00] border border-[#BF9A2A]/40 uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#BF9A2A] animate-spin" style={{ animationDuration: '4s' }} />
            <span>Synaptic Promotion Unlocked</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#2B2827]">
            Level Up: Tier {newLevel.level}
          </h2>
          <p className="text-xs font-mono text-[#5A5553]">
            Consistent retention & rapid recall velocity has elevated your neuroplasticity tier!
          </p>
        </div>

        {/* Promotion Progression Graphic */}
        <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            {/* Old Tier */}
            <div className="text-center space-y-1 flex-1 opacity-70">
              <div className="text-[10px] font-mono uppercase text-[#736D6B]">Previous</div>
              <div className="text-xs sm:text-sm font-serif font-bold text-[#5A5553] line-clamp-1">
                {previousLevel.title}
              </div>
              <div className="text-[10px] font-mono text-[#736D6B]">Lvl {previousLevel.level}</div>
            </div>

            <div className="flex flex-col items-center justify-center px-2">
              <ArrowRight className="w-5 h-5 text-[#BF9A2A] animate-pulse" />
            </div>

            {/* New Tier */}
            <div className="text-center space-y-1 flex-1 p-2 rounded-xl bg-[#FAF8F2] border border-[#BF9A2A] shadow-inner">
              <div className="text-[10px] font-mono uppercase text-[#8F6A00] font-bold">New Rank</div>
              <div className="text-xs sm:text-sm font-serif font-black text-[#2B2827] line-clamp-1">
                {newLevel.title}
              </div>
              <div className="text-[10px] font-mono font-bold text-[#8F6A00]">Lvl {newLevel.level} • {newLevel.badgeName}</div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#DDD7C8] text-center">
            <div className="p-2 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8]">
              <div className="text-[10px] font-mono text-[#736D6B] uppercase font-semibold">Total Synaptic Pts</div>
              <div className="text-lg font-mono font-bold text-[#152659] flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 text-[#BF9A2A]" />
                <span>{totalPoints}</span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8]">
              <div className="text-[10px] font-mono text-[#736D6B] uppercase font-semibold">Retention Boost</div>
              <div className="text-lg font-mono font-bold text-[#2F6A38] flex items-center justify-center gap-1">
                <Shield className="w-4 h-4 text-[#2F6A38]" />
                <span>{newLevel.decayResistanceBonus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Unlocked Synaptic Perks */}
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase font-bold text-[#8F6A00] flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>Newly Unlocked Neural Perks</span>
          </div>

          <div className="space-y-1.5">
            {newLevel.perks.map((perk, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFFFFF] border border-[#DDD7C8] text-xs font-mono text-[#2B2827] shadow-2xs"
              >
                <CheckCircle className="w-4 h-4 text-[#BF9A2A] shrink-0" />
                <span className="font-semibold">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Claim / Continue Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#152659] to-[#1E357A] hover:from-[#1E357A] hover:to-[#2A499E] text-white font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Trophy className="w-4 h-4 text-[#BF9A2A]" />
            <span>Claim Neural Mastery & Continue Challenge</span>
          </button>
        </div>
      </div>
    </div>
  );
};
