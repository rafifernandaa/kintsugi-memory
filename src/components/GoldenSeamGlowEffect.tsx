import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface GoldenSeamGlowEffectProps {
  active: boolean;
  conceptTitle?: string;
  newStabilityDays?: number;
  newRetentionPct?: number;
  onAnimationComplete?: () => void;
}

export const GoldenSeamGlowEffect: React.FC<GoldenSeamGlowEffectProps> = ({
  active,
  conceptTitle,
  newStabilityDays,
  newRetentionPct = 95,
  onAnimationComplete,
}) => {
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (active) {
      setShowBadge(true);
      const timer = setTimeout(() => {
        setShowBadge(false);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 3800);
      return () => clearTimeout(timer);
    } else {
      setShowBadge(false);
    }
  }, [active, onAnimationComplete]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="golden-seam-fullscreen-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex flex-col items-center justify-center"
          aria-live="polite"
        >
          {/* 1. Screen-Wide Radiant Molten Gold Ambient Flash */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0, 0.45, 0.25, 0.35, 0],
              scale: [0.85, 1.08, 1.02, 1.04, 1.0],
            }}
            transition={{ duration: 3.2, ease: 'easeOut' }}
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.38)_0%,rgba(217,119,6,0.18)_40%,rgba(180,83,9,0.06)_65%,transparent_80%)] backdrop-blur-[1px]"
          />

          {/* 2. Top and Bottom Gold Screen Edge Flares */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.15, 0] }}
            transition={{ duration: 2.8, ease: 'easeInOut' }}
            className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-amber-500/25 via-amber-600/10 to-transparent"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.15, 0] }}
            transition={{ duration: 2.8, ease: 'easeInOut' }}
            className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-amber-500/25 via-amber-600/10 to-transparent"
          />

          {/* 3. Screen-Spanning Golden Kintsugi Fault Veins SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1920 1080"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Molten 24K Gold Gradient */}
              <linearGradient id="screen-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="20%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#fef08a" />
                <stop offset="75%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              {/* Ultra-luminous Center Core Gradient */}
              <linearGradient id="screen-gold-core" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="100%" stopColor="#fef08a" stopOpacity="0.8" />
              </linearGradient>

              {/* Intense Optical Bloom Filter */}
              <filter id="golden-screen-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="heavyBlur" />
                <feGaussianBlur stdDeviation="3.5" result="lightBlur" />
                <feMerge>
                  <feMergeNode in="heavyBlur" />
                  <feMergeNode in="lightBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Ambient Wide Golden Halo Vein 1 (Major Diagonal) */}
            <motion.path
              d="M -50,180 Q 380,310 740,460 T 1320,680 Q 1640,780 1980,920"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="20"
              strokeOpacity="0.22"
              filter="url(#golden-screen-glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1],
                opacity: [0, 0.4, 0.25, 0],
              }}
              transition={{ duration: 2.8, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Ambient Wide Golden Halo Vein 2 (Transverse Fracture) */}
            <motion.path
              d="M 1980,120 Q 1520,320 1180,490 T 560,780 Q 240,910 -50,960"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="16"
              strokeOpacity="0.18"
              filter="url(#golden-screen-glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1],
                opacity: [0, 0.35, 0.2, 0],
              }}
              transition={{ duration: 2.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Deep Amber Bed Base */}
            <motion.path
              d="M -50,180 Q 380,310 740,460 T 1320,680 Q 1640,780 1980,920"
              fill="none"
              stroke="#92400e"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.path
              d="M 1980,120 Q 1520,320 1180,490 T 560,780 Q 240,910 -50,960"
              fill="none"
              stroke="#92400e"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Primary Golden Seam Lines (Drawing Across Screen) */}
            <motion.path
              d="M -50,180 Q 380,310 740,460 T 1320,680 Q 1640,780 1980,920"
              fill="none"
              stroke="url(#screen-gold-grad)"
              strokeWidth="3.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 1, 0.8, 0] }}
              transition={{ duration: 3.2, ease: [0.16, 1, 0.3, 1] }}
            />

            <motion.path
              d="M 1980,120 Q 1520,320 1180,490 T 560,780 Q 240,910 -50,960"
              fill="none"
              stroke="url(#screen-gold-grad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 1, 0.8, 0] }}
              transition={{ duration: 3.0, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Ultra-Radiant White-Gold Core Centerlines */}
            <motion.path
              d="M -50,180 Q 380,310 740,460 T 1320,680 Q 1640,780 1980,920"
              fill="none"
              stroke="url(#screen-gold-core)"
              strokeWidth="1.6"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 1, 0.6, 0] }}
              transition={{ duration: 2.2, ease: [0.2, 1, 0.3, 1] }}
            />
            <motion.path
              d="M 1980,120 Q 1520,320 1180,490 T 560,780 Q 240,910 -50,960"
              fill="none"
              stroke="url(#screen-gold-core)"
              strokeWidth="1.4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 1, 0.6, 0] }}
              transition={{ duration: 2.2, delay: 0.15, ease: [0.2, 1, 0.3, 1] }}
            />

            {/* Capillary Branches Stitching the Center Intersection */}
            <motion.path
              d="M 740,460 Q 860,340 1020,310 M 1180,490 Q 1120,620 980,740 M 1320,680 Q 1480,640 1620,540 M 560,780 Q 420,700 280,660 M 380,310 Q 480,180 620,110"
              fill="none"
              stroke="#fef08a"
              strokeWidth="2.0"
              strokeDasharray="6 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.9, 0.7, 0] }}
              transition={{ duration: 2.5, delay: 0.3, ease: 'easeOut' }}
            />

            {/* Glowing Golden Nodules at Crossroads and Major Synapses */}
            {[
              { cx: 740, cy: 460, r: 7, delay: 0.4 },
              { cx: 1180, cy: 490, r: 8, delay: 0.5 },
              { cx: 960, cy: 530, r: 10, delay: 0.6 }, // Grand Central Nexus
              { cx: 1320, cy: 680, r: 6, delay: 0.7 },
              { cx: 560, cy: 780, r: 6, delay: 0.65 },
              { cx: 380, cy: 310, r: 5, delay: 0.45 },
              { cx: 1520, cy: 320, r: 5, delay: 0.55 },
            ].map((node, i) => (
              <g key={i}>
                {/* Expanding Luminous Ring */}
                <motion.circle
                  cx={node.cx}
                  cy={node.cy}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  initial={{ r: 0, opacity: 0 }}
                  animate={{
                    r: [0, node.r * 3.5, node.r * 5],
                    opacity: [0, 0.9, 0],
                  }}
                  transition={{
                    duration: 1.8,
                    delay: node.delay,
                    ease: 'easeOut',
                  }}
                />
                {/* Center Molten Solid Pip */}
                <motion.circle
                  cx={node.cx}
                  cy={node.cy}
                  fill="#ffffff"
                  filter="url(#golden-screen-glow)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.5, 1, 0],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: node.delay,
                    ease: 'easeOut',
                  }}
                  r={node.r}
                />
              </g>
            ))}

            {/* 4. Drifting Golden Dust Stardust Emitter Array */}
            {[
              { cx: 780, cy: 430, r: 2.5, dx: 30, dy: -40, dur: 2.8, delay: 0.2 },
              { cx: 840, cy: 470, r: 1.8, dx: -40, dy: 50, dur: 3.1, delay: 0.3 },
              { cx: 920, cy: 510, r: 3.2, dx: 50, dy: -30, dur: 2.6, delay: 0.1 },
              { cx: 1040, cy: 540, r: 2.2, dx: -20, dy: 60, dur: 2.9, delay: 0.4 },
              { cx: 1120, cy: 480, r: 2.8, dx: 40, dy: -50, dur: 3.0, delay: 0.25 },
              { cx: 620, cy: 400, r: 1.6, dx: -35, dy: -35, dur: 2.7, delay: 0.5 },
              { cx: 1250, cy: 620, r: 2.0, dx: 45, dy: 35, dur: 3.2, delay: 0.35 },
              { cx: 480, cy: 720, r: 2.4, dx: -30, dy: 40, dur: 2.8, delay: 0.4 },
              { cx: 1420, cy: 720, r: 1.9, dx: 35, dy: -45, dur: 3.0, delay: 0.45 },
            ].map((dust, idx) => (
              <motion.circle
                key={idx}
                cx={dust.cx}
                cy={dust.cy}
                r={dust.r}
                fill="#fef08a"
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0.8, 0],
                  scale: [0, 1.4, 1, 0.2],
                  x: [0, dust.dx],
                  y: [0, dust.dy],
                }}
                transition={{
                  duration: dust.dur,
                  delay: dust.delay,
                  ease: 'easeOut',
                }}
              />
            ))}
          </svg>

          {/* 5. Floating Zen Celebratory Kintsugi Emblem Badge */}
          {showBadge && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.88 }}
              animate={{
                opacity: [0, 1, 1, 1, 0],
                y: [40, 0, 0, -10, -25],
                scale: [0.88, 1.04, 1.0, 0.98, 0.9],
              }}
              transition={{
                duration: 3.4,
                times: [0, 0.2, 0.7, 0.85, 1],
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative z-30 flex flex-col items-center text-center px-6 py-4 rounded-3xl bg-stone-950/95 border-2 border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.45)] backdrop-blur-xl max-w-md mx-4 pointer-events-auto"
            >
              {/* Top Golden Light Pip */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-inner">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                </span>
                <span className="text-[11px] font-mono font-bold tracking-widest text-amber-300 uppercase">
                  金継ぎ • Kintsugi Mending Verified
                </span>
                <span className="p-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-inner">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                </span>
              </div>

              {/* Title & Concept Context */}
              <h3 className="text-xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 tracking-wide">
                Synaptic Crack Repaired with Gold
              </h3>

              {conceptTitle && (
                <p className="text-xs text-amber-300/90 font-mono mt-1 truncate max-w-xs">
                  "{conceptTitle}"
                </p>
              )}

              {/* Metric Multipliers */}
              <div className="flex items-center justify-center gap-3 mt-3 pt-2.5 border-t border-amber-500/30 w-full text-xs font-mono">
                <div className="flex items-center gap-1 text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Retention: <strong>{newRetentionPct}%</strong></span>
                </div>
                <span className="text-stone-600">•</span>
                <div className="flex items-center gap-1 text-amber-300">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>
                    Stability: <strong>{newStabilityDays ? `${newStabilityDays}d` : '+2.4x'}</strong>
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
