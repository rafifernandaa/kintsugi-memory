import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { animate } from 'animejs';
import { ArrowRight, ChevronDown, Sparkles, Brain, Shield, Layers } from 'lucide-react';

interface SynapticVesselHeroProps {
  onEnterApp: () => void;
  onScrollToFeatures?: () => void;
}

// Coordinate definitions for 16 ceramic shards
// Each shard has its scattered position (x, y, rotate, scale) and target seated position on the vase
interface ShardDef {
  id: string;
  // Scatter offset from center
  scatterX: number;
  scatterY: number;
  scatterRot: number;
  scatterScale: number;
  // Final assemble offset relative to vase center (0,0)
  targetX: number;
  targetY: number;
  targetRot: number;
  targetScale: number;
  // Visual geometry & SVG path
  path: string;
  color: string;
  goldEdgePath?: string;
  hasGoldGlaze?: boolean;
  size: number;
  depth: number;
}

const SHARDS: ShardDef[] = [
  // 1. Large Top-Left Shoulder Shard
  {
    id: 'shard-tl-1',
    scatterX: -270,
    scatterY: -190,
    scatterRot: -28,
    scatterScale: 1.15,
    targetX: -45,
    targetY: -65,
    targetRot: 0,
    targetScale: 1.0,
    path: 'M 10,45 Q 30,10 75,15 Q 90,40 80,75 Q 40,85 15,65 Z',
    goldEdgePath: 'M 10,45 Q 30,10 75,15',
    color: '#E3DDD3',
    hasGoldGlaze: true,
    size: 90,
    depth: 1,
  },
  // 2. High Floating Neck Fragment (Center-Left)
  {
    id: 'shard-neck-l',
    scatterX: -140,
    scatterY: -280,
    scatterRot: 45,
    scatterScale: 0.9,
    targetX: -18,
    targetY: -105,
    targetRot: 0,
    targetScale: 1.0,
    path: 'M 10,25 Q 35,5 60,18 L 50,45 Q 25,48 10,25 Z',
    goldEdgePath: 'M 10,25 Q 35,5 60,18',
    color: '#D8D1C5',
    hasGoldGlaze: true,
    size: 65,
    depth: 2,
  },
  // 3. Floating Neck Fragment (Center-Right)
  {
    id: 'shard-neck-r',
    scatterX: 160,
    scatterY: -260,
    scatterRot: -35,
    scatterScale: 0.95,
    targetX: 18,
    targetY: -105,
    targetRot: 0,
    targetScale: 1.0,
    path: 'M 5,18 Q 30,5 55,25 L 45,45 Q 20,48 5,18 Z',
    goldEdgePath: 'M 5,18 Q 30,5 55,25',
    color: '#DDD7CB',
    hasGoldGlaze: true,
    size: 60,
    depth: 2,
  },
  // 4. Large Right Shoulder Shard
  {
    id: 'shard-tr-1',
    scatterX: 260,
    scatterY: -170,
    scatterRot: 32,
    scatterScale: 1.1,
    targetX: 45,
    targetY: -60,
    targetRot: 0,
    targetScale: 1.0,
    path: 'M 15,15 Q 60,10 80,45 Q 75,75 35,80 Q 10,65 15,15 Z',
    goldEdgePath: 'M 15,15 Q 60,10 80,45',
    color: '#E1DBD0',
    hasGoldGlaze: true,
    size: 85,
    depth: 1,
  },
  // 5. Far Left Mid Body Chunk
  {
    id: 'shard-ml-1',
    scatterX: -330,
    scatterY: -30,
    scatterRot: -18,
    scatterScale: 1.25,
    targetX: -65,
    targetY: -5,
    targetRot: 0,
    targetScale: 1.0,
    path: 'M 5,30 Q 30,5 85,20 Q 95,70 65,95 Q 15,85 5,30 Z',
    goldEdgePath: 'M 5,30 Q 30,5 85,20',
    color: '#D5CFC3',
    hasGoldGlaze: true,
    size: 100,
    depth: 1,
  },
  // 6. Far Right Mid Body Chunk
  {
    id: 'shard-mr-1',
    scatterX: 320,
    scatterY: -20,
    scatterRot: 24,
    scatterScale: 1.2,
    targetX: 65,
    targetY: -5,
    targetRot: 0,
    targetScale: 1.0,
    path: 'M 15,20 Q 70,5 95,30 Q 85,85 35,95 Q 5,70 15,20 Z',
    goldEdgePath: 'M 15,20 Q 70,5 95,30',
    color: '#DBD5C9',
    hasGoldGlaze: true,
    size: 100,
    depth: 1,
  },
  // 7. Center Heart Fragment (Front Belly)
  {
    id: 'shard-center-1',
    scatterX: -30,
    scatterY: -200,
    scatterRot: 15,
    scatterScale: 0.95,
    targetX: 0,
    targetY: -25,
    targetRot: 0,
    targetScale: 1.0,
    path: 'M 25,5 Q 60,10 70,40 Q 55,75 20,65 Q 5,35 25,5 Z',
    goldEdgePath: 'M 25,5 Q 60,10 70,40',
    color: '#E6E0D6',
    hasGoldGlaze: true,
    size: 75,
    depth: 2,
  },
  // 8. Lower Left Base Shard
  {
    id: 'shard-bl-1',
    scatterX: -250,
    scatterY: 140,
    scatterRot: -40,
    scatterScale: 1.05,
    targetX: -40,
    targetY: 50,
    targetRot: 0,
    targetScale: 1.0,
    path: 'M 10,20 Q 55,10 75,35 Q 65,70 20,75 Q 5,50 10,20 Z',
    goldEdgePath: 'M 10,20 Q 55,10 75,35',
    color: '#CDC7BB',
    hasGoldGlaze: true,
    size: 80,
    depth: 1,
  },
  // 9. Lower Right Base Shard
  {
    id: 'shard-br-1',
    scatterX: 240,
    scatterY: 150,
    scatterRot: 36,
    scatterScale: 1.05,
    targetX: 40,
    targetY: 50,
    targetRot: 0,
    targetScale: 1.0,
    path: 'M 15,35 Q 35,10 80,20 Q 85,50 70,75 Q 25,70 15,35 Z',
    goldEdgePath: 'M 15,35 Q 35,10 80,20',
    color: '#D2CCC0',
    hasGoldGlaze: true,
    size: 80,
    depth: 1,
  },
  // 10. Center Base Pedestal Shard
  {
    id: 'shard-base-center',
    scatterX: 10,
    scatterY: 220,
    scatterRot: -12,
    scatterScale: 1.0,
    targetX: 0,
    targetY: 85,
    targetRot: 0,
    targetScale: 1.0,
    path: 'M 10,15 Q 45,5 80,15 Q 75,40 50,45 Q 15,40 10,15 Z',
    goldEdgePath: 'M 10,15 Q 45,5 80,15',
    color: '#C7C1B5',
    hasGoldGlaze: true,
    size: 85,
    depth: 1,
  },
  // 11. Drifting Gold Debris (Top Left Specks)
  {
    id: 'gold-dust-1',
    scatterX: -370,
    scatterY: -270,
    scatterRot: 65,
    scatterScale: 1.4,
    targetX: -10,
    targetY: -80,
    targetRot: 0,
    targetScale: 0.1,
    path: 'M 5,12 Q 12,2 20,8 Q 18,18 10,22 Z',
    color: '#D4AF37',
    hasGoldGlaze: true,
    size: 24,
    depth: 3,
  },
  // 12. Drifting Gold Debris (Top Right Specks)
  {
    id: 'gold-dust-2',
    scatterX: 360,
    scatterY: -280,
    scatterRot: -50,
    scatterScale: 1.3,
    targetX: 15,
    targetY: -75,
    targetRot: 0,
    targetScale: 0.1,
    path: 'M 8,4 Q 18,8 15,18 Q 6,20 4,10 Z',
    color: '#E8D4A2',
    hasGoldGlaze: true,
    size: 22,
    depth: 3,
  },
  // 13. Drifting Small Clay Shard (Mid Left)
  {
    id: 'shard-sm-l',
    scatterX: -200,
    scatterY: -65,
    scatterRot: 80,
    scatterScale: 0.8,
    targetX: -25,
    targetY: 15,
    targetRot: 0,
    targetScale: 0.9,
    path: 'M 5,15 Q 20,5 35,12 Q 30,30 10,28 Z',
    goldEdgePath: 'M 5,15 Q 20,5 35,12',
    color: '#D0C9BD',
    hasGoldGlaze: true,
    size: 40,
    depth: 2,
  },
  // 14. Drifting Small Clay Shard (Mid Right)
  {
    id: 'shard-sm-r',
    scatterX: 190,
    scatterY: -55,
    scatterRot: -70,
    scatterScale: 0.8,
    targetX: 25,
    targetY: 15,
    targetRot: 0,
    targetScale: 0.9,
    path: 'M 5,12 Q 20,5 35,15 Q 28,30 8,25 Z',
    goldEdgePath: 'M 5,12 Q 20,5 35,15',
    color: '#D5CEC2',
    hasGoldGlaze: true,
    size: 40,
    depth: 2,
  },
  // 15. Tiny Gold Flake (Bottom Left)
  {
    id: 'gold-dust-3',
    scatterX: -290,
    scatterY: 230,
    scatterRot: 110,
    scatterScale: 1.2,
    targetX: -5,
    targetY: 35,
    targetRot: 0,
    targetScale: 0.1,
    path: 'M 4,8 Q 12,2 16,8 Q 12,16 6,14 Z',
    color: '#BF9A2A',
    hasGoldGlaze: true,
    size: 18,
    depth: 3,
  },
  // 16. Tiny Gold Flake (Bottom Right)
  {
    id: 'gold-dust-4',
    scatterX: 300,
    scatterY: 250,
    scatterRot: -95,
    scatterScale: 1.2,
    targetX: 5,
    targetY: 40,
    targetRot: 0,
    targetScale: 0.1,
    path: 'M 6,4 Q 14,8 12,16 Q 4,14 4,6 Z',
    color: '#BF9A2A',
    hasGoldGlaze: true,
    size: 18,
    depth: 3,
  },
];

// Synaptic neural filament connection paths between scattered shards
const SYNAPTIC_CONNECTIONS = [
  { from: 0, to: 1, cp1: [-200, -230], cp2: [-170, -250] },
  { from: 1, to: 2, cp1: [-80, -290], cp2: [80, -290] },
  { from: 2, to: 3, cp1: [190, -240], cp2: [220, -210] },
  { from: 0, to: 4, cp1: [-280, -110], cp2: [-310, -70] },
  { from: 3, to: 5, cp1: [280, -100], cp2: [300, -60] },
  { from: 4, to: 7, cp1: [-300, 40], cp2: [-260, 90] },
  { from: 5, to: 8, cp1: [290, 50], cp2: [250, 100] },
  { from: 7, to: 9, cp1: [-160, 180], cp2: [-70, 200] },
  { from: 8, to: 9, cp1: [160, 180], cp2: [70, 200] },
  { from: 6, to: 0, cp1: [-120, -120], cp2: [-180, -140] },
  { from: 6, to: 3, cp1: [120, -110], cp2: [180, -130] },
];

// Easing function for smooth organic trajectory
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const SynapticVesselHero: React.FC<SynapticVesselHeroProps> = ({
  onEnterApp,
  onScrollToFeatures,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const animProgressObj = useRef<{ value: number }>({ value: 0 });

  // Sync natural window scroll to 0.0 -> 1.0 progress
  // Reaches full 1.0 assembly at ~65% of scroll and holds locked in view through 100%
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isAutoPlaying) return;

    const rect = containerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const totalScrollable = containerRef.current.offsetHeight - windowHeight;

    if (totalScrollable <= 0) return;

    const currentScrolled = -rect.top;
    // Scale so it completes assembly smoothly and holds the assembled vessel in view
    const normalized = Math.max(0, Math.min(1, currentScrolled / (totalScrollable * 0.75)));

    setScrollProgress(normalized);
    animProgressObj.current.value = normalized;
  }, [isAutoPlaying]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Smooth Auto-Assemble Glide (when clicking "SCROLL TO BEGIN")
  const handleGlideToProgress = (targetProgress: number) => {
    if (!containerRef.current) return;
    setIsAutoPlaying(true);

    const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;
    const targetScrollY = containerRef.current.offsetTop + (targetProgress * totalScrollable * 0.75);

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    });

    animate(animProgressObj.current, {
      value: targetProgress,
      duration: 1100,
      ease: 'inOutCubic',
      onUpdate: () => {
        setScrollProgress(animProgressObj.current.value);
      },
      onComplete: () => {
        setIsAutoPlaying(false);
      },
    });
  };

  // Eased progress for trajectory convergence
  const pEased = useMemo(() => easeInOutCubic(scrollProgress), [scrollProgress]);

  // Vase reveal threshold
  const vaseOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.4) / 0.45));
  const shardsOpacity = Math.max(0, Math.min(1, 1 - (scrollProgress - 0.55) / 0.35));
  const textOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.5) / 0.4));
  const textTranslateY = (1 - textOpacity) * 25;
  const promptOpacity = Math.max(0, 1 - scrollProgress * 2.2);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[220vh] bg-[#F4F0E8] text-[#2B2827] font-sans selection:bg-[#BF9A2A]/30 overflow-hidden"
    >
      {/* Sticky Viewport Hero Stage */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden">
        
        {/* Background Light Flare */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[700px] sm:h-[900px] rounded-full bg-[radial-gradient(circle_at_center,rgba(242,227,182,0.38)_0%,rgba(244,240,232,0)_70%)]" />
        </div>

        {/* Minimalist Top Header (Matching Reference Image) */}
        <header className="relative z-30 w-full max-w-7xl mx-auto px-6 sm:px-10 py-5 flex items-center justify-between">
          <div className="flex flex-col cursor-pointer" onClick={() => handleGlideToProgress(0)}>
            <span className="font-serif tracking-[0.28em] text-sm sm:text-base font-bold text-[#152659] uppercase">
              K I N T S U G I &nbsp; M E M O R Y
            </span>
            <span className="text-[10px] tracking-[0.35em] text-[#8F6A00] font-mono -mt-0.5">
              金 継 ぎ • N E U R A L &nbsp; J O I N E R Y
            </span>
          </div>

          <nav className="flex items-center gap-6 sm:gap-8 text-xs font-mono tracking-wider uppercase">
            <button
              onClick={() => onScrollToFeatures ? onScrollToFeatures() : handleGlideToProgress(1)}
              className="text-[#5A5553] hover:text-[#BF9A2A] transition-colors hidden sm:inline-block cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => onScrollToFeatures ? onScrollToFeatures() : handleGlideToProgress(1)}
              className="text-[#5A5553] hover:text-[#BF9A2A] transition-colors hidden md:inline-block cursor-pointer"
            >
              Neuroplasticity
            </button>
            <button
              onClick={() => onScrollToFeatures ? onScrollToFeatures() : handleGlideToProgress(1)}
              className="text-[#5A5553] hover:text-[#BF9A2A] transition-colors hidden lg:inline-block cursor-pointer"
            >
              About
            </button>
            <button
              onClick={onEnterApp}
              className="px-5 py-2 rounded-full bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] text-xs font-mono font-medium tracking-wide shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#BF9A2A]" />
            </button>
          </nav>
        </header>

        {/* Central Visual Animation Canvas */}
        <div className="relative flex-1 w-full max-w-5xl mx-auto flex items-center justify-center">
          
          <div className="relative w-[340px] sm:w-[460px] md:w-[560px] h-[340px] sm:h-[420px] md:h-[480px] flex items-center justify-center">
            
            {/* Layer 1: Synaptic Neural Network Filaments (Visible in Scatter Phase) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-300"
              viewBox="-280 -250 560 500"
              style={{
                opacity: Math.max(0, 1 - scrollProgress * 1.8),
              }}
            >
              <defs>
                <linearGradient id="synapse-gold-line" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#BF9A2A" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#F2E3B6" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#8F6A00" stopOpacity="0.75" />
                </linearGradient>
                <filter id="synapse-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {SYNAPTIC_CONNECTIONS.map((conn, idx) => {
                const s1 = SHARDS[conn.from];
                const s2 = SHARDS[conn.to];
                if (!s1 || !s2) return null;
                const pathD = `M ${s1.scatterX * 0.75} ${s1.scatterY * 0.75} Q ${conn.cp1[0] * 0.7} ${conn.cp1[1] * 0.7} ${s2.scatterX * 0.75} ${s2.scatterY * 0.75}`;
                return (
                  <g key={`synapse-${idx}`}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#synapse-gold-line)"
                      strokeWidth="1.2"
                      strokeDasharray="3 4"
                      filter="url(#synapse-glow)"
                      className="animate-pulse"
                      style={{ animationDuration: `${2.5 + (idx % 3)}s` }}
                    />
                    <circle
                      cx={conn.cp1[0] * 0.7}
                      cy={conn.cp1[1] * 0.7}
                      r="2.5"
                      fill="#F2E3B6"
                      filter="url(#synapse-glow)"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Layer 2: Radiating Golden Synaptic Filaments (Radiating upward when assembled) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-15 transition-opacity duration-500"
              viewBox="-280 -250 560 500"
              style={{ opacity: vaseOpacity }}
            >
              <defs>
                <linearGradient id="radiance-gold" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#BF9A2A" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#F2E3B6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#BF9A2A" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path
                d="M 0,-115 Q -40,-170 -120,-210"
                fill="none"
                stroke="url(#radiance-gold)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M 0,-115 Q -10,-180 -40,-230"
                fill="none"
                stroke="url(#radiance-gold)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M 0,-115 Q 15,-185 55,-235"
                fill="none"
                stroke="url(#radiance-gold)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M 0,-115 Q 50,-170 130,-205"
                fill="none"
                stroke="url(#radiance-gold)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            {/* Layer 3: The 16 Animated Ceramic Shards (Anime.js Trajectory Interpolation) */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 transition-opacity duration-300"
              style={{ opacity: shardsOpacity }}
            >
              {SHARDS.map((shard, index) => {
                const currentX = shard.scatterX + (shard.targetX - shard.scatterX) * pEased;
                const currentY = shard.scatterY + (shard.targetY - shard.scatterY) * pEased;
                const currentRot = shard.scatterRot + (shard.targetRot - shard.scatterRot) * pEased;
                const currentScale = shard.scatterScale + (shard.targetScale - shard.scatterScale) * pEased;

                return (
                  <div
                    key={shard.id}
                    className="absolute will-change-transform drop-shadow-md"
                    style={{
                      width: shard.size,
                      height: shard.size,
                      transform: `translate(${currentX}px, ${currentY}px) rotate(${currentRot}deg) scale(${currentScale})`,
                    }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id={`shard-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FAF8F5" />
                          <stop offset="45%" stopColor={shard.color} />
                          <stop offset="100%" stopColor="#B3ACA0" />
                        </linearGradient>
                        <linearGradient id={`shard-gold-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#BF8D30" />
                          <stop offset="50%" stopColor="#F2E3B6" />
                          <stop offset="100%" stopColor="#8F6A00" />
                        </linearGradient>
                        <filter id={`shard-glow-${index}`}>
                          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#8F6A00" floodOpacity="0.4" />
                        </filter>
                      </defs>

                      {/* Shard Porcelain Body */}
                      <path
                        d={shard.path}
                        fill={`url(#shard-grad-${index})`}
                        stroke="#8C8377"
                        strokeWidth="0.75"
                      />

                      {/* Gold Seam Line */}
                      {shard.goldEdgePath && (
                        <path
                          d={shard.goldEdgePath}
                          fill="none"
                          stroke={`url(#shard-gold-${index})`}
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          filter={`url(#shard-glow-${index})`}
                        />
                      )}

                      {/* Gold Specks */}
                      {shard.id.includes('gold-dust') && (
                        <circle cx="10" cy="10" r="4" fill="#F2E3B6" filter={`url(#shard-glow-${index})`} />
                      )}
                    </svg>
                  </div>
                );
              })}
            </div>

            {/* Layer 4: Completed High-Definition Kintsugi Ceramic Vase */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-25 transition-all duration-500"
              style={{
                opacity: vaseOpacity,
                transform: `scale(${0.96 + vaseOpacity * 0.04})`,
              }}
            >
              <div className="relative w-52 sm:w-64 md:w-72 aspect-[3/4] flex items-center justify-center">
                
                {/* Pedestal Shadow */}
                <div className="absolute -bottom-4 w-44 h-8 bg-black/15 rounded-full blur-md" />

                <svg
                  viewBox="0 0 300 400"
                  className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.18)]"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="completed-porcelain" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="35%" stopColor="#F5EFE6" />
                      <stop offset="70%" stopColor="#E0D7CA" />
                      <stop offset="100%" stopColor="#BAAFA0" />
                    </linearGradient>

                    <linearGradient id="completed-shading" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                      <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.1" />
                      <stop offset="65%" stopColor="#000000" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
                    </linearGradient>

                    <linearGradient id="gold-seams-lux" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#BF8D30" />
                      <stop offset="25%" stopColor="#BF9A2A" />
                      <stop offset="50%" stopColor="#F2E3B6" />
                      <stop offset="75%" stopColor="#BF9A2A" />
                      <stop offset="100%" stopColor="#8F6A00" />
                    </linearGradient>

                    <filter id="completed-gold-bloom" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#F2E3B6" floodOpacity="0.9" />
                      <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#8F6A00" floodOpacity="0.6" />
                    </filter>
                  </defs>

                  {/* Vase Body */}
                  <path
                    d="M 125,70 C 120,60 115,55 110,50 L 190,50 C 185,55 180,60 175,70 C 170,95 240,170 240,245 C 240,320 200,360 150,360 C 100,360 60,320 60,245 C 60,170 130,95 125,70 Z"
                    fill="url(#completed-porcelain)"
                  />
                  <path
                    d="M 125,70 C 120,60 115,55 110,50 L 190,50 C 185,55 180,60 175,70 C 170,95 240,170 240,245 C 240,320 200,360 150,360 C 100,360 60,320 60,245 C 60,170 130,95 125,70 Z"
                    fill="url(#completed-shading)"
                  />

                  {/* Vase Rim */}
                  <ellipse cx="150" cy="50" rx="40" ry="8" fill="#E8E2D5" stroke="#BAAFA0" strokeWidth="1" />
                  <ellipse cx="150" cy="50" rx="32" ry="5" fill="#3D3835" />

                  {/* Signature 24K Gold Kintsugi Fractures */}
                  <path
                    d="M 148,110 Q 155,160 170,205 T 195,280 Q 210,320 200,355"
                    fill="none"
                    stroke="#5C3809"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 148,110 Q 155,160 170,205 T 195,280 Q 210,320 200,355"
                    fill="none"
                    stroke="url(#gold-seams-lux)"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    filter="url(#completed-gold-bloom)"
                  />

                  <path
                    d="M 75,220 Q 120,200 170,205 T 235,225"
                    fill="none"
                    stroke="#5C3809"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 75,220 Q 120,200 170,205 T 235,225"
                    fill="none"
                    stroke="url(#gold-seams-lux)"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    filter="url(#completed-gold-bloom)"
                  />

                  <path
                    d="M 170,205 Q 130,170 105,140"
                    fill="none"
                    stroke="url(#gold-seams-lux)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    filter="url(#completed-gold-bloom)"
                  />

                  <path
                    d="M 170,205 Q 135,255 120,310 L 115,355"
                    fill="none"
                    stroke="url(#gold-seams-lux)"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    filter="url(#completed-gold-bloom)"
                  />

                  {/* Central Gold Nexus Joinery Accent */}
                  <polygon
                    points="166,198 178,202 174,212 163,208"
                    fill="url(#gold-seams-lux)"
                    filter="url(#completed-gold-bloom)"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 1: "SCROLL TO BEGIN" Prompt (Top Initial State) */}
        <div
          className="relative z-30 pb-8 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-300"
          style={{ opacity: promptOpacity }}
          onClick={() => handleGlideToProgress(1)}
        >
          <span className="text-[11px] font-mono tracking-[0.3em] text-[#5A5553] uppercase font-medium hover:text-[#8F6A00] transition-colors">
            SCROLL TO BEGIN
          </span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-[#8F6A00] to-transparent mt-2 animate-pulse" />
        </div>

        {/* Phase 2: Grand Hero Typography & CTA (Revealed as Pottery Assembles) */}
        <div
          className="absolute inset-x-0 bottom-6 sm:bottom-10 z-30 flex flex-col items-center justify-center text-center px-4 pointer-events-auto transition-all duration-500"
          style={{
            opacity: textOpacity,
            transform: `translateY(${textTranslateY}px)`,
            pointerEvents: textOpacity > 0.4 ? 'auto' : 'none',
          }}
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-[#152659] tracking-[0.18em] uppercase">
            KINTSUGI
          </h1>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-serif text-[#BF9A2A] tracking-[0.45em] uppercase font-light -mt-1 mb-2">
            M E M O R Y
          </h2>
          <p className="text-xs sm:text-sm font-serif text-[#5A5553] max-w-md mx-auto mb-5 leading-relaxed">
            Remember more. Forget less. Grow always.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onEnterApp}
              className="px-7 py-3 rounded-full bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] font-mono text-xs sm:text-sm font-semibold tracking-wider flex items-center gap-2.5 shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-4 h-4 text-[#BF9A2A] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
