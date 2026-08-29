import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Plus, Sparkles, Compass, Layers, ShieldCheck, Zap, BookOpen, ExternalLink } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenPhilosophyModal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'philosophy' | 'collection' | 'process' | 'journal'>('home');
  const [activeArtifactIndex, setActiveArtifactIndex] = useState<number>(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const artifacts = [
    {
      id: '01',
      title: 'THE ART OF REPAIR',
      subtitle: '金継ぎの美学',
      description: 'Rather than hiding the cracks, Kintsugi highlights them — transforming breaks into something stronger, something more beautiful.',
      meta: 'Urushi Lacquer • 24K Gold Powder • Kyoto, Japan',
      conceptParallel: 'In Bayesian FSRS, memory decay exposes cognitive fracture points so Socratic retrieval can seal them permanently.',
      type: 'White Celadon Porcelain Vase',
    },
    {
      id: '02',
      title: 'THE WISDOM OF WABI-SABI',
      subtitle: '侘び寂びの精神',
      description: 'Embracing transience, asymmetry, and the natural patina of time. Perfection is fragile, but repaired imperfection is resilient.',
      meta: 'Sumi Charcoal • Indigo Glaze • Gold Leaf Veins',
      conceptParallel: 'Cognitive effort during active recall generates deeper neural consolidation than passive recognition ever could.',
      type: 'Midnight Indigo Vessel',
    },
    {
      id: '03',
      title: 'SYNAPTIC JOINERY',
      subtitle: '神経の金繕い',
      description: 'When neural synapses fracture beneath the forgetting cliff, AI-guided Socratic dialogue applies cognitive lacquer to mend understanding.',
      meta: 'Bayesian Power-Law Decay • Socratic Dialogue Engine',
      conceptParallel: 'Every answered question is a stroke of golden lacquer turning forgotten knowledge into lifelong mastery.',
      type: 'Golden Synapse Matrix',
    },
  ];

  const currentArtifact = artifacts[activeArtifactIndex];

  return (
    <div className="min-h-screen bg-[#F2F0E4] text-[#403C3B] flex flex-col font-sans selection:bg-[#BF9A2A]/30 selection:text-[#403C3B] relative overflow-x-hidden">
      {/* Organic Background Golden Seam Lines SVG overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="landing-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BF8D30" />
            <stop offset="35%" stopColor="#BF9A2A" />
            <stop offset="65%" stopColor="#F2E3B6" />
            <stop offset="100%" stopColor="#BF9A2A" />
          </linearGradient>
          <filter id="gold-subtle-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Top-Left to Center Gold Branching Vein */}
        <motion.path
          d="M 0,160 Q 220,190 340,110 T 640,180 Q 820,240 960,340"
          fill="none"
          stroke="url(#landing-gold-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#gold-subtle-glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.4, ease: 'easeInOut' }}
        />
        <motion.path
          d="M 340,110 Q 420,40 510,20"
          fill="none"
          stroke="url(#landing-gold-grad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, delay: 0.3, ease: 'easeInOut' }}
        />
        <motion.path
          d="M 640,180 Q 720,120 780,90"
          fill="none"
          stroke="url(#landing-gold-grad)"
          strokeWidth="1.2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
        />

        {/* Right Corner to Center Gold Branching Vein */}
        <motion.path
          d="M 1920,90 Q 1700,210 1520,280 T 1280,360 Q 1120,420 960,490"
          fill="none"
          stroke="url(#landing-gold-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#gold-subtle-glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.6, delay: 0.2, ease: 'easeInOut' }}
        />
        <motion.path
          d="M 1700,210 Q 1640,140 1610,60"
          fill="none"
          stroke="url(#landing-gold-grad)"
          strokeWidth="1.4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, delay: 0.6, ease: 'easeInOut' }}
        />

        {/* Bottom Right Sweeping Gold Vein */}
        <motion.path
          d="M 1920,960 Q 1740,880 1580,720 T 1420,620 Q 1260,660 1140,780"
          fill="none"
          stroke="url(#landing-gold-grad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          filter="url(#gold-subtle-glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, delay: 0.4, ease: 'easeInOut' }}
        />
        <motion.path
          d="M 1580,720 Q 1620,810 1660,890"
          fill="none"
          stroke="url(#landing-gold-grad)"
          strokeWidth="1.3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, delay: 0.7, ease: 'easeInOut' }}
        />
      </svg>

      {/* 1. Top Navigation Bar (matching layout 1 ref.png) */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 flex items-center justify-between">
        {/* Brand Logo & Kanji */}
        <div className="flex flex-col">
          <span className="font-serif tracking-[0.25em] text-lg sm:text-xl font-medium text-[#403C3B]">
            K I N T S U G I
          </span>
          <span className="text-[11px] tracking-[0.3em] text-[#BF9A2A] font-light -mt-0.5">
            金 継 ぎ
          </span>
        </div>

        {/* Center/Right Navigation Links */}
        <nav className="flex items-center gap-6 sm:gap-10 text-xs tracking-[0.2em] font-mono text-[#403C3B]/80 uppercase">
          <button
            onClick={() => setActiveTab('home')}
            className={`transition-colors hover:text-[#BF9A2A] hidden sm:inline-block ${
              activeTab === 'home' ? 'text-[#BF9A2A] font-bold border-b border-[#BF9A2A] pb-0.5' : ''
            }`}
          >
            Philosophy
          </button>
          <button
            onClick={() => setActiveTab('collection')}
            className={`transition-colors hover:text-[#BF9A2A] hidden md:inline-block ${
              activeTab === 'collection' ? 'text-[#BF9A2A] font-bold border-b border-[#BF9A2A] pb-0.5' : ''
            }`}
          >
            Collection
          </button>
          <button
            onClick={() => setActiveTab('process')}
            className={`transition-colors hover:text-[#BF9A2A] hidden md:inline-block ${
              activeTab === 'process' ? 'text-[#BF9A2A] font-bold border-b border-[#BF9A2A] pb-0.5' : ''
            }`}
          >
            Process
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`transition-colors hover:text-[#BF9A2A] hidden lg:inline-block ${
              activeTab === 'journal' ? 'text-[#BF9A2A] font-bold border-b border-[#BF9A2A] pb-0.5' : ''
            }`}
          >
            Journal
          </button>

          {/* Primary Action Button (Bordered Pill in layout 1 ref.png) */}
          <button
            onClick={onEnterApp}
            className="px-5 py-2 rounded-full border border-[#403C3B] hover:bg-[#403C3B] hover:text-[#F2F0E4] transition-all text-xs font-mono font-medium tracking-[0.15em] flex items-center gap-2 group shadow-sm bg-transparent"
          >
            <span>ENTER SANCTUARY</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </nav>
      </header>

      {/* Main Content Area based on selected section */}
      {activeTab === 'home' && (
        <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* LEFT HERO COLUMN (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-6 lg:pr-4">
            <div>
              <div className="text-[11px] font-mono tracking-[0.25em] text-[#BF9A2A] uppercase font-semibold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#BF9A2A] animate-pulse" />
                WHEN BROKEN BECOMES BEAUTIFUL
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#403C3B] font-normal tracking-wide leading-tight">
                KINTSUGI
              </h1>
              <div className="text-lg font-serif text-[#BF9A2A] tracking-[0.2em] mt-1 mb-4 flex items-center gap-2">
                <span>金継ぎ</span>
                <span className="w-8 h-[1px] bg-[#BF9A2A]" />
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#403C3B]/80 font-serif leading-relaxed">
              Kintsugi is the Japanese art of repairing broken pottery with gold. It embraces flaws and tells a new story — where breaks become part of the beauty.
            </p>

            <div className="p-4 rounded-xl bg-[#F2E3B6]/30 border border-[#BF9A2A]/30 text-xs text-[#403C3B]/85 font-mono leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#BF8D30] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Synaptic Parallel</span>
              </div>
              <p>
                In cognitive memory, decay is not a failure. It is a natural fracture waiting to be illuminated through active Socratic retrieval.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onEnterApp}
                className="px-6 py-3.5 rounded-none bg-[#403C3B] hover:bg-[#152659] text-[#F2F0E4] transition-all font-mono text-xs tracking-[0.18em] uppercase flex items-center justify-center gap-2.5 group shadow-md"
              >
                <span>EXPLORE THE PHILOSOPHY</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#BF9A2A] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* CENTER HERO SHOWCASE (4 Cols) - Handcrafted Centerpiece Vase with Interactive Annotations */}
          <div className="lg:col-span-4 relative flex flex-col items-center justify-center py-6 sm:py-10">
            
            {/* Top-Left Floating Annotation: ORIGIN */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute -top-4 sm:top-2 left-0 sm:-left-4 z-20 w-52 sm:w-56 p-3.5 bg-[#F2F0E4]/95 border border-[#BF9A2A]/40 rounded-none shadow-md backdrop-blur-sm text-xs"
            >
              <div className="flex items-center justify-between mb-1.5 border-b border-[#BF9A2A]/20 pb-1">
                <span className="font-mono text-[10px] tracking-widest text-[#BF8D30] font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BF8D30]" /> ORIGIN
                </span>
                <span className="text-[10px] font-mono text-[#403C3B]/60">15th Century</span>
              </div>
              <p className="text-[11px] text-[#403C3B]/80 font-serif leading-relaxed">
                Kintsugi (金継ぎ) means &quot;golden joinery&quot; in Japanese. Born from the philosophy of <em>wabi-sabi</em> — finding beauty in imperfection.
              </p>
              <div className="mt-2 pt-1.5 flex items-center justify-between text-[9px] font-mono text-[#403C3B]/50 border-t border-[#BF9A2A]/15">
                <span>||| |||||| |||||||</span>
                <button
                  onClick={() => setActiveHotspot(activeHotspot === 'origin' ? null : 'origin')}
                  className="w-4 h-4 rounded border border-[#403C3B]/40 flex items-center justify-center hover:bg-[#403C3B] hover:text-white transition-colors"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Hairline Connector to Vase Seam */}
              <div className="hidden sm:block absolute -bottom-8 right-6 w-12 h-8 border-r border-b border-[#BF9A2A]/50 pointer-events-none">
                <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-[#BF9A2A]" />
              </div>
            </motion.div>

            {/* Central High-Art Kintsugi Vase Artwork */}
            <div className="relative w-64 sm:w-72 md:w-80 aspect-[4/5] bg-gradient-to-b from-[#2a2725] via-[#403C3B] to-[#1a1817] p-4 flex flex-col items-center justify-center shadow-2xl rounded-sm overflow-hidden border border-[#BF9A2A]/30">
              
              {/* Studio Backdrop Lighting Flare */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_25%,rgba(242,227,182,0.18)_0%,transparent_60%)]" />
              <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />

              {/* Rendered Handcrafted Ceramic Vase SVG with 24K Gold Seams */}
              <svg
                viewBox="0 0 300 400"
                className="w-full h-full relative z-10 drop-shadow-[0_20px_25px_rgba(0,0,0,0.6)]"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Porcelain Glaze Gradient */}
                  <linearGradient id="vase-porcelain" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#faf8f5" />
                    <stop offset="35%" stopColor="#f2ede4" />
                    <stop offset="70%" stopColor="#dfd7cb" />
                    <stop offset="100%" stopColor="#b5ab9c" />
                  </linearGradient>

                  {/* Shading Cylinder */}
                  <linearGradient id="vase-shade" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                    <stop offset="25%" stopColor="#ffffff" stopOpacity="0.1" />
                    <stop offset="60%" stopColor="#000000" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
                  </linearGradient>

                  {/* 24K Molten Gold Lacquer */}
                  <linearGradient id="gold-seam" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#BF8D30" />
                    <stop offset="30%" stopColor="#BF9A2A" />
                    <stop offset="50%" stopColor="#F2E3B6" />
                    <stop offset="70%" stopColor="#BF9A2A" />
                    <stop offset="100%" stopColor="#A66D03" />
                  </linearGradient>

                  <filter id="gold-sheen">
                    <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#F2E3B6" floodOpacity="0.8" />
                  </filter>
                </defs>

                {/* Wooden Display Pedestal Shadow */}
                <ellipse cx="150" cy="365" rx="80" ry="12" fill="#000000" opacity="0.6" filter="blur(4px)" />

                {/* Vase Porcelain Body Silhouette */}
                <path
                  d="M 125,70 C 120,60 115,55 110,50 L 190,50 C 185,55 180,60 175,70 C 170,95 240,170 240,245 C 240,320 200,360 150,360 C 100,360 60,320 60,245 C 60,170 130,95 125,70 Z"
                  fill="url(#vase-porcelain)"
                />

                {/* Vase Shading Layer */}
                <path
                  d="M 125,70 C 120,60 115,55 110,50 L 190,50 C 185,55 180,60 175,70 C 170,95 240,170 240,245 C 240,320 200,360 150,360 C 100,360 60,320 60,245 C 60,170 130,95 125,70 Z"
                  fill="url(#vase-shade)"
                />

                {/* Vase Lip Rim */}
                <ellipse cx="150" cy="50" rx="40" ry="8" fill="#e8e2d5" stroke="#b5ab9c" strokeWidth="1" />
                <ellipse cx="150" cy="50" rx="32" ry="5" fill="#3a3633" />

                {/* --- GOLDEN KINTSUGI CRACK FAULT LINES (The Signature Seams) --- */}
                {/* 1. Main Diagonal Fracture with Central Lacquer Star */}
                <path
                  d="M 148,110 Q 155,160 170,205 T 195,280 Q 210,320 200,355"
                  fill="none"
                  stroke="#5c3809"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 148,110 Q 155,160 170,205 T 195,280 Q 210,320 200,355"
                  fill="none"
                  stroke="url(#gold-seam)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  filter="url(#gold-sheen)"
                />

                {/* 2. Horizontal Transverse Joinery */}
                <path
                  d="M 75,220 Q 120,200 170,205 T 235,225"
                  fill="none"
                  stroke="#5c3809"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                />
                <path
                  d="M 75,220 Q 120,200 170,205 T 235,225"
                  fill="none"
                  stroke="url(#gold-seam)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  filter="url(#gold-sheen)"
                />

                {/* 3. Upper Left Branch */}
                <path
                  d="M 170,205 Q 130,170 105,140"
                  fill="none"
                  stroke="#5c3809"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M 170,205 Q 130,170 105,140"
                  fill="none"
                  stroke="url(#gold-seam)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* 4. Lower Base Fracture */}
                <path
                  d="M 170,205 Q 135,255 120,310 L 115,355"
                  fill="none"
                  stroke="#5c3809"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 170,205 Q 135,255 120,310 L 115,355"
                  fill="none"
                  stroke="url(#gold-seam)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />

                {/* Central Heavy Golden Lacquer Nexus Patch */}
                <polygon
                  points="166,198 178,202 174,212 163,208"
                  fill="url(#gold-seam)"
                  filter="url(#gold-sheen)"
                />
              </svg>

              {/* Wooden Table Horizon */}
              <div className="absolute bottom-0 inset-x-0 h-8 bg-[#2d1c14] border-t border-[#4a2e20]/60 flex items-center justify-between px-3 text-[9px] font-mono text-[#BF8F54]/70">
                <span>KYOTO CERAMIC VAULT</span>
                <span>NO. 0826</span>
              </div>
            </div>

            {/* Bottom-Right Floating Annotation: MATERIAL */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-4 sm:bottom-4 right-0 sm:-right-4 z-20 w-52 sm:w-56 p-3.5 bg-[#F2F0E4]/95 border border-[#BF9A2A]/40 rounded-none shadow-md backdrop-blur-sm text-xs"
            >
              <div className="flex items-center justify-between mb-1.5 border-b border-[#BF9A2A]/20 pb-1">
                <span className="font-mono text-[10px] tracking-widest text-[#BF8D30] font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BF8D30]" /> MATERIAL
                </span>
                <span className="text-[10px] font-mono text-[#403C3B]/60">24K Urushi</span>
              </div>
              <p className="text-[11px] text-[#403C3B]/80 font-serif leading-relaxed">
                Traditionally made using urushi tree lacquer mixed with gold, silver, or platinum powder.
              </p>
              <div className="mt-2 pt-1.5 flex items-center justify-between text-[9px] font-mono text-[#403C3B]/50 border-t border-[#BF9A2A]/15">
                <span>|||||||| |||| |||||</span>
                <button
                  onClick={() => setActiveHotspot(activeHotspot === 'material' ? null : 'material')}
                  className="w-4 h-4 rounded border border-[#403C3B]/40 flex items-center justify-center hover:bg-[#403C3B] hover:text-white transition-colors"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Hairline Connector to Vase Seam */}
              <div className="hidden sm:block absolute -top-8 left-4 w-10 h-8 border-l border-t border-[#BF9A2A]/50 pointer-events-none">
                <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-[#BF9A2A]" />
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN (4 Cols) - Card 01 THE ART OF REPAIR */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6 lg:pl-4">
            
            {/* Card 01 Box (matching layout 1 ref.png) */}
            <div className="bg-[#F2F0E4] border border-[#BF9A2A]/30 p-6 shadow-sm relative">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-3xl font-serif font-bold text-[#403C3B]">
                  {currentArtifact.id}
                </span>
                <span className="text-[11px] font-mono tracking-[0.2em] text-[#BF9A2A] font-bold uppercase">
                  {currentArtifact.title}
                </span>
              </div>

              {/* Repaired Bowl Line Art Engraving Box */}
              <div className="w-full aspect-[16/9] bg-[#F2E3B6]/20 border border-[#BF9A2A]/20 flex items-center justify-center p-3 mb-4 relative overflow-hidden">
                <svg viewBox="0 0 200 120" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Bowl Silhouette */}
                  <path
                    d="M 20,40 C 25,90 70,105 100,105 C 130,105 175,90 180,40 Z"
                    fill="#faf8f5"
                    stroke="#403C3B"
                    strokeWidth="1.5"
                  />
                  <ellipse cx="100" cy="40" rx="80" ry="12" fill="#e8e2d5" stroke="#403C3B" strokeWidth="1.5" />
                  
                  {/* Golden Joinery Cracks on Bowl */}
                  <path
                    d="M 50,45 Q 80,75 100,105 M 100,75 Q 140,65 160,45 M 80,75 L 45,90"
                    fill="none"
                    stroke="#BF9A2A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="80" cy="75" r="3" fill="#BF8D30" />
                </svg>
                <div className="absolute top-2 right-2 text-[9px] font-mono text-[#BF8D30] font-bold">
                  {currentArtifact.type}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#403C3B]/85 font-serif leading-relaxed mb-4">
                {currentArtifact.description}
              </p>

              <div className="pt-3 border-t border-[#BF9A2A]/20 flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] text-[#403C3B]/60 truncate max-w-[170px]">
                  {currentArtifact.meta}
                </span>

                {/* Pagination Arrow Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setActiveArtifactIndex((prev) => (prev > 0 ? prev - 1 : artifacts.length - 1))}
                    className="w-7 h-7 border border-[#403C3B]/30 hover:bg-[#403C3B] hover:text-[#F2F0E4] transition-colors flex items-center justify-center"
                    aria-label="Previous artifact"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveArtifactIndex((prev) => (prev < artifacts.length - 1 ? prev + 1 : 0))}
                    className="w-7 h-7 border border-[#403C3B]/30 hover:bg-[#403C3B] hover:text-[#F2F0E4] transition-colors flex items-center justify-center"
                    aria-label="Next artifact"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Launch App Mini Card */}
            <div className="p-4 bg-[#152659] text-[#D9D8D7] border border-[#BF8F54]/40 flex items-center justify-between gap-3 shadow-md">
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono tracking-widest text-[#BF8F54] uppercase font-bold">
                  KINTSUGI SYNAPSE ENGINE
                </div>
                <div className="text-xs font-serif text-[#D9D8D7]">
                  Ready to test your synaptic retention?
                </div>
              </div>
              <button
                onClick={onEnterApp}
                className="px-3.5 py-2 bg-[#A66D03] hover:bg-[#BF8F54] text-[#0F1B26] font-mono text-xs font-bold tracking-wider transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>OPEN APP</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        </main>
      )}

      {/* 2. COLLECTION TAB (Browse the Pottery & Synaptic Vessels) */}
      {activeTab === 'collection' && (
        <section className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-8">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#BF9A2A] uppercase font-bold">
              THE ARTIFACT COLLECTION
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#403C3B] mt-1">
              Vessels of Preserved Knowledge
            </h2>
            <p className="text-sm text-[#403C3B]/75 font-serif mt-2">
              Each ceramic vessel represents a mastered domain. The golden seams represent points where memory decayed and was subsequently reinforced through Socratic dialogue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Artifact 1 */}
            <div className="p-6 bg-[#F2F0E4] border border-[#BF9A2A]/40 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-full aspect-[4/3] bg-[#403C3B] p-4 flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="text-center space-y-1">
                    <span className="text-2xl font-serif text-[#F2E3B6]">金継ぎ 白磁</span>
                    <p className="text-[10px] font-mono text-[#BF9A2A]">White Celadon Vase with Gold Joinery</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#BF8D30] font-bold uppercase tracking-wider">DOMAIN: MACHINE LEARNING</span>
                <h3 className="text-lg font-serif text-[#403C3B] mt-1">Attention Mechanism & Transformer Layers</h3>
                <p className="text-xs text-[#403C3B]/75 font-serif mt-2">
                  Fractured 4 times under time decay, now permanently stabilized with a 92-day retention half-life.
                </p>
              </div>
              <button
                onClick={onEnterApp}
                className="mt-4 pt-3 border-t border-[#BF9A2A]/30 text-xs font-mono text-[#BF8D30] hover:text-[#403C3B] flex items-center justify-between"
              >
                <span>Inspect in Synaptic Garden</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Artifact 2 */}
            <div className="p-6 bg-[#F2F0E4] border border-[#BF9A2A]/40 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-full aspect-[4/3] bg-[#152659] p-4 flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="text-center space-y-1">
                    <span className="text-2xl font-serif text-[#C2D1FF]">藍染め 陶器</span>
                    <p className="text-[10px] font-mono text-[#BF8F54]">Indigo Glazed Pottery with 24K Leaf</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#BF8D30] font-bold uppercase tracking-wider">DOMAIN: SYSTEMS & HARDWARE</span>
                <h3 className="text-lg font-serif text-[#403C3B] mt-1">L1/L2 Cache Coherence & False Sharing</h3>
                <p className="text-xs text-[#403C3B]/75 font-serif mt-2">
                  Repaired with gold lacquer after answering counterfactual architectural challenges.
                </p>
              </div>
              <button
                onClick={onEnterApp}
                className="mt-4 pt-3 border-t border-[#BF9A2A]/30 text-xs font-mono text-[#BF8D30] hover:text-[#403C3B] flex items-center justify-between"
              >
                <span>Inspect in Synaptic Garden</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Artifact 3 */}
            <div className="p-6 bg-[#F2F0E4] border border-[#BF9A2A]/40 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-full aspect-[4/3] bg-[#3C5915] p-4 flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="text-center space-y-1">
                    <span className="text-2xl font-serif text-[#C0D9A0]">織部焼 苔緑</span>
                    <p className="text-[10px] font-mono text-[#F2E3B6]">Oribe Moss Green Ceramic</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#BF8D30] font-bold uppercase tracking-wider">DOMAIN: NEUROSCIENCE</span>
                <h3 className="text-lg font-serif text-[#403C3B] mt-1">Hippocampal Memory Consolidation</h3>
                <p className="text-xs text-[#403C3B]/75 font-serif mt-2">
                  Embodied with high synaptic stability across 8 consecutive daily retrieval streaks.
                </p>
              </div>
              <button
                onClick={onEnterApp}
                className="mt-4 pt-3 border-t border-[#BF9A2A]/30 text-xs font-mono text-[#BF8D30] hover:text-[#403C3B] flex items-center justify-between"
              >
                <span>Inspect in Synaptic Garden</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. PROCESS TAB (The 3-Step Kintsugi Synapse Methodology) */}
      {activeTab === 'process' && (
        <section className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-8">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#BF9A2A] uppercase font-bold">
              THE THREE-STEP MENDING CYCLE
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#403C3B] mt-1">
              How Cognitive Lacquer Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#F2F0E4] border border-[#BF9A2A]/30 space-y-3">
              <span className="text-3xl font-serif font-bold text-[#BF8D30]">01</span>
              <h3 className="text-lg font-serif text-[#403C3B]">Biological Decay & Fracture Detection</h3>
              <p className="text-xs text-[#403C3B]/80 font-serif leading-relaxed">
                The Bayesian FSRS model predicts the exact second memory drops below the 70% forgetting cliff, surfacing vulnerable vessels.
              </p>
            </div>

            <div className="p-6 bg-[#F2F0E4] border border-[#BF9A2A]/30 space-y-3">
              <span className="text-3xl font-serif font-bold text-[#BF8D30]">02</span>
              <h3 className="text-lg font-serif text-[#403C3B]">Active Socratic Interrogation</h3>
              <p className="text-xs text-[#403C3B]/80 font-serif leading-relaxed">
                Gemini 3.7 generates high-friction counterfactual and applied retrieval prompts to probe deep structural comprehension.
              </p>
            </div>

            <div className="p-6 bg-[#F2F0E4] border border-[#BF9A2A]/30 space-y-3">
              <span className="text-3xl font-serif font-bold text-[#BF8D30]">03</span>
              <h3 className="text-lg font-serif text-[#403C3B]">Golden Lacquer Sealing</h3>
              <p className="text-xs text-[#403C3B]/80 font-serif leading-relaxed">
                Successful recall triggers golden seam visual restoration, multiplying synaptic stability and expanding future retention.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 4. JOURNAL TAB */}
      {activeTab === 'journal' && (
        <section className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-8">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#BF9A2A] uppercase font-bold">
              THE PHILOSOPHICAL JOURNAL
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#403C3B] mt-1">
              Notes on Memory & Imperfection
            </h2>
          </div>

          <div className="space-y-4 max-w-3xl">
            <article className="p-6 bg-[#F2F0E4] border border-[#BF9A2A]/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#BF8D30]">
                <span>ENTRY #01 • KYOTO REFLECTION</span>
                <span>AUGUST 2026</span>
              </div>
              <h3 className="text-xl font-serif text-[#403C3B]">Why We Never Hide the Scars of Learning</h3>
              <p className="text-xs text-[#403C3B]/80 font-serif leading-relaxed">
                Traditional education treats forgotten items as failures to be penalized. Kintsugi inverts this paradigm: every forgotten concept is a pristine ceramic break waiting to be highlighted with 24K gold lacquer.
              </p>
            </article>
          </div>
        </section>
      )}

      {/* BOTTOM SECTION (Matching bottom half of layout 1 ref.png) */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 border-t border-[#BF9A2A]/25 items-center">
        
        {/* Bottom Left Module: 02 EMBRACE IMPERFECTION (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 sm:p-6 bg-[#F2F0E4] border border-[#BF9A2A]/30">
          {/* Artisan Thumbnail Box */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#403C3B] shrink-0 border border-[#BF9A2A]/40 flex flex-col items-center justify-center text-center p-2">
            <span className="text-xs font-serif text-[#F2E3B6]">職人の技</span>
            <span className="text-[9px] font-mono text-[#BF9A2A] mt-1">Master Urushi Artisan</span>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-serif font-bold text-[#403C3B]">02</span>
              <span className="text-xs font-mono tracking-[0.2em] text-[#BF9A2A] font-bold uppercase">
                EMBRACE IMPERFECTION
              </span>
            </div>
            <p className="text-xs text-[#403C3B]/80 font-serif leading-relaxed">
              Every crack holds a story. Every repair, a choice to continue. Kintsugi reminds us that imperfection is not something to hide, but something to honor.
            </p>

            {/* Material & Texture Swatches */}
            <div className="pt-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-sm bg-[#152659] border border-[#BF9A2A]/50 relative overflow-hidden" title="Indigo Glaze">
                <div className="absolute inset-0 flex items-center justify-center text-[#BF8F54] font-serif text-[10px]">金</div>
              </div>
              <div className="w-8 h-8 rounded-sm bg-[#BF9A2A] border border-[#403C3B]/20 relative overflow-hidden" title="Hammered 24K Gold Leaf">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.4)_0%,transparent_80%)]" />
              </div>
              <div className="w-8 h-8 rounded-sm bg-[#3C5915] border border-[#BF9A2A]/50 relative overflow-hidden" title="Oribe Moss Celadon" />
              <span className="text-[10px] font-mono text-[#403C3B]/60 ml-2">Ceramic Lacquer Swatches</span>
            </div>
          </div>
        </div>

        {/* Bottom Right Module: Quote Card (5 Cols) */}
        <div className="lg:col-span-5 p-4 sm:p-6 bg-[#F2F0E4] border border-[#BF9A2A]/30 flex items-start gap-4">
          <span className="text-4xl font-serif text-[#BF9A2A] leading-none select-none">
            “
          </span>
          <div className="space-y-2">
            <blockquote className="text-xs sm:text-sm font-serif italic text-[#403C3B] leading-relaxed">
              The beauty of Kintsugi is not in pretending it never broke, but in celebrating how it was mended.
            </blockquote>
            <div className="text-[10px] font-mono text-[#BF8D30] uppercase tracking-wider font-semibold">
              — Zen Philosophy of Resilient Mastery
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER BAR (Matching bottom metadata bar of layout 1 ref.png) */}
      <footer className="relative z-20 w-full border-t border-[#BF9A2A]/30 bg-[#F2F0E4] py-4 px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-[#403C3B]/70 uppercase tracking-widest">
        {/* Left: Engine Pillars */}
        <div className="flex items-center gap-4">
          <span>ACTIVE RETRIEVAL</span>
          <span>•</span>
          <span>BAYESIAN FSRS</span>
          <span>•</span>
          <span>AI SOCRATIC</span>
        </div>

        {/* Center: Scroll / Enter App Pill Button */}
        <button
          onClick={onEnterApp}
          className="px-4 py-1.5 rounded-full border border-[#403C3B]/40 hover:bg-[#403C3B] hover:text-[#F2F0E4] transition-all flex items-center gap-2 text-[10px] text-[#403C3B] font-bold"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#BF9A2A] animate-ping" />
          <span>ENTER KINTSUGI SYNAPSE</span>
        </button>

        {/* Right: Copyright & Location */}
        <div>
          KYOTO, JAPAN • © 2026 KINTSUGI SYNAPSE
        </div>
      </footer>
    </div>
  );
};
