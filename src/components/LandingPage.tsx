import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Plus, Sparkles, Languages, Brain, Mic } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenPhilosophyModal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [activeArtifactIndex, setActiveArtifactIndex] = useState<number>(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const artifacts = [
    {
      id: '01',
      title: 'THE ART OF REPAIR',
      subtitle: '金継ぎの美学',
      description: 'Rather than hiding the cracks, Kintsugi highlights them — transforming breaks into something stronger, something more resilient and beautiful.',
      meta: 'Urushi Lacquer • 24K Gold Powder',
      conceptParallel: 'In Bayesian FSRS, memory decay exposes cognitive fracture points so Socratic retrieval can seal them permanently.',
      type: 'White Celadon Porcelain Vase',
    },
    {
      id: '02',
      title: 'THE WISDOM OF WABI-SABI',
      subtitle: '侘び寂びの精神',
      description: 'Embracing transience, asymmetry, and the natural patina of time. Perfection is fragile, but repaired imperfection is permanent.',
      meta: 'Sumi Charcoal • Indigo Glaze • Gold Leaf',
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF8F2] via-[#F5F1E6] to-[#FAF8F2] text-[#2B2827] flex flex-col font-sans selection:bg-[#BF9A2A]/30 selection:text-[#2B2827] relative overflow-x-hidden">
      
      {/* Ambient Liquid Glass Backdrop Lighting Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[15%] left-[20%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-[#F2E3B6]/35 to-[#BF9A2A]/10 blur-3xl" />
        <div className="absolute top-[45%] -right-[10%] w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-[#C2D1FF]/25 to-[#152659]/5 blur-3xl" />
        <div className="absolute bottom-[10%] left-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#EAE6D6]/50 to-[#BF9A2A]/15 blur-3xl" />
      </div>

      {/* 1. Top Liquid Glass Navigation Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#FAF8F2]/75 border-b border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between">
          
          {/* Logo & Kanji */}
          <div
            className="flex flex-col cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="font-serif tracking-[0.28em] text-lg sm:text-xl font-semibold text-[#152659] group-hover:text-[#8F6A00] transition-colors">
              K I N T S U G I
            </span>
            <span className="text-[10px] tracking-[0.35em] text-[#8F6A00] font-mono -mt-0.5">
              金 継 ぎ • NEURAL JOINERY
            </span>
          </div>

          {/* Center Navigation Anchors connected to page sections */}
          <nav className="flex items-center gap-6 sm:gap-9 text-xs tracking-[0.18em] font-mono text-[#5A5553] uppercase">
            <button
              onClick={() => scrollToSection('three-step-mending-cycle')}
              className="hover:text-[#8F6A00] transition-colors cursor-pointer hidden sm:inline-block"
            >
              Mending Cycle
            </button>
            <button
              onClick={() => scrollToSection('crafted-for-learners')}
              className="hover:text-[#8F6A00] transition-colors cursor-pointer hidden md:inline-block"
            >
              For Learners
            </button>
            <button
              onClick={() => scrollToSection('zen-philosophy-reflection')}
              className="hover:text-[#8F6A00] transition-colors cursor-pointer hidden lg:inline-block"
            >
              Philosophy
            </button>

            {/* Single Primary Enter App Button */}
            <button
              onClick={onEnterApp}
              className="px-5 py-2.5 rounded-full bg-[#152659] hover:bg-[#1E357A] text-white transition-all text-xs font-mono font-medium tracking-[0.15em] flex items-center gap-2 group shadow-[0_4px_16px_rgba(21,38,89,0.25)] hover:shadow-[0_6px_20px_rgba(21,38,89,0.35)] cursor-pointer"
            >
              <span>ENTER APP</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#BF9A2A] group-hover:translate-x-1 transition-transform" />
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <div className="relative z-10 flex flex-col">
        
        {/* 2. Hero Section (3-Column Layout with Liquid Glass Cards) */}
        <section id="hero-overview" className="max-w-7xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* LEFT HERO COLUMN (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-6 lg:pr-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[11px] font-mono tracking-[0.2em] text-[#8F6A00] uppercase font-semibold mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <span className="w-2 h-2 rounded-full bg-[#BF9A2A] animate-pulse" />
                WHEN BROKEN BECOMES BEAUTIFUL
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#152659] font-normal tracking-wide leading-tight">
                KINTSUGI
              </h1>
              <div className="text-base font-serif text-[#8F6A00] tracking-[0.2em] mt-1 mb-4 flex items-center gap-2">
                <span>金継ぎ</span>
                <span className="w-10 h-[1px] bg-[#BF9A2A]" />
                <span className="text-xs font-mono text-[#736D6B] tracking-normal">Memory Mending</span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#5A5553] font-serif leading-relaxed">
              Kintsugi is the Japanese art of repairing broken pottery with 24K gold lacquer. In cognitive retention, memory decay is not a failure — it is the exact boundary where Socratic retrieval seals knowledge into lifelong resilience.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onEnterApp}
                className="px-7 py-3.5 rounded-full bg-[#152659] hover:bg-[#1E357A] text-white transition-all font-mono text-xs tracking-[0.18em] uppercase flex items-center justify-center gap-2.5 group shadow-[0_8px_24px_rgba(21,38,89,0.25)] hover:shadow-[0_12px_28px_rgba(21,38,89,0.35)] cursor-pointer"
              >
                <span>START YOUR JOURNEY</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#BF9A2A] group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection('three-step-mending-cycle')}
                className="px-5 py-3.5 rounded-full bg-white/60 backdrop-blur-md border border-white/90 hover:bg-white/80 text-[#5A5553] transition-all font-mono text-xs tracking-wider uppercase flex items-center justify-center cursor-pointer shadow-xs"
              >
                How It Works
              </button>
            </div>
          </div>

          {/* CENTER HERO SHOWCASE (4 Cols) - Handcrafted Ceramic Centerpiece Vase */}
          <div className="lg:col-span-4 relative flex flex-col items-center justify-center py-6 sm:py-8">
            
            {/* Top-Left Floating Annotation: ORIGIN (Liquid Glass) */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute -top-3 sm:top-2 left-0 sm:-left-4 z-20 w-52 sm:w-56 p-3.5 bg-white/80 backdrop-blur-xl border border-white/90 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] text-xs"
            >
              <div className="flex items-center justify-between mb-1.5 border-b border-[#BF9A2A]/20 pb-1">
                <span className="font-mono text-[10px] tracking-widest text-[#8F6A00] font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BF9A2A]" /> ORIGIN
                </span>
                <span className="text-[10px] font-mono text-[#736D6B]">15th Century</span>
              </div>
              <p className="text-[11px] text-[#5A5553] font-serif leading-relaxed">
                Kintsugi (金継ぎ) means &quot;golden joinery&quot;. Rooted in <em>wabi-sabi</em> — finding resilience and beauty in imperfection.
              </p>
              <div className="mt-2 pt-1.5 flex items-center justify-between text-[9px] font-mono text-[#736D6B] border-t border-black/5">
                <span>BAYESIAN FSRS</span>
                <button
                  onClick={() => setActiveHotspot(activeHotspot === 'origin' ? null : 'origin')}
                  className="w-4 h-4 rounded-md border border-[#DDD7C8] flex items-center justify-center hover:bg-[#152659] hover:text-white transition-colors"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            </motion.div>

            {/* Central High-Art Kintsugi Vase Artwork */}
            <div className="relative w-64 sm:w-72 md:w-80 aspect-[4/5] bg-gradient-to-b from-[#252220] via-[#3D3835] to-[#181615] p-4 flex flex-col items-center justify-center shadow-[0_25px_50px_rgba(0,0,0,0.25)] rounded-3xl overflow-hidden border border-[#BF9A2A]/40">
              
              {/* Studio Backdrop Lighting Flare */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_25%,rgba(242,227,182,0.25)_0%,transparent_60%)]" />
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
                    <stop offset="0%" stopColor="#FAF8F5" />
                    <stop offset="35%" stopColor="#F2EDE4" />
                    <stop offset="70%" stopColor="#DFD7CB" />
                    <stop offset="100%" stopColor="#B5AB9C" />
                  </linearGradient>

                  {/* Shading Cylinder */}
                  <linearGradient id="vase-shade" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                    <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.1" />
                    <stop offset="60%" stopColor="#000000" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
                  </linearGradient>

                  {/* 24K Molten Gold Lacquer */}
                  <linearGradient id="gold-seam" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#BF8D30" />
                    <stop offset="30%" stopColor="#BF9A2A" />
                    <stop offset="50%" stopColor="#F2E3B6" />
                    <stop offset="70%" stopColor="#BF9A2A" />
                    <stop offset="100%" stopColor="#8F6A00" />
                  </linearGradient>

                  <filter id="gold-sheen">
                    <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#F2E3B6" floodOpacity="0.9" />
                    <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#8F6A00" floodOpacity="0.5" />
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
                <ellipse cx="150" cy="50" rx="40" ry="8" fill="#E8E2D5" stroke="#B5AB9C" strokeWidth="1" />
                <ellipse cx="150" cy="50" rx="32" ry="5" fill="#3A3633" />

                {/* Golden Joinery Fault Lines */}
                <path
                  d="M 148,110 Q 155,160 170,205 T 195,280 Q 210,320 200,355"
                  fill="none"
                  stroke="#5C3809"
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

                <path
                  d="M 75,220 Q 120,200 170,205 T 235,225"
                  fill="none"
                  stroke="#5C3809"
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

                <path
                  d="M 170,205 Q 130,170 105,140"
                  fill="none"
                  stroke="url(#gold-seam)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  filter="url(#gold-sheen)"
                />

                <path
                  d="M 170,205 Q 135,255 120,310 L 115,355"
                  fill="none"
                  stroke="url(#gold-seam)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  filter="url(#gold-sheen)"
                />

                {/* Central Golden Lacquer Nexus Patch */}
                <polygon
                  points="166,198 178,202 174,212 163,208"
                  fill="url(#gold-seam)"
                  filter="url(#gold-sheen)"
                />
              </svg>

              {/* Vault Plate */}
              <div className="absolute bottom-0 inset-x-0 h-8 bg-[#1D1714] border-t border-[#4A2E20]/60 flex items-center justify-between px-3 text-[9px] font-mono text-[#BF8F54]/80">
                <span>CERAMIC VAULT</span>
                <span>NO. 0826</span>
              </div>
            </div>

            {/* Bottom-Right Floating Annotation: MATERIAL (Liquid Glass) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-3 sm:bottom-4 right-0 sm:-right-4 z-20 w-52 sm:w-56 p-3.5 bg-white/80 backdrop-blur-xl border border-white/90 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] text-xs"
            >
              <div className="flex items-center justify-between mb-1.5 border-b border-[#BF9A2A]/20 pb-1">
                <span className="font-mono text-[10px] tracking-widest text-[#8F6A00] font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BF9A2A]" /> MATERIAL
                </span>
                <span className="text-[10px] font-mono text-[#736D6B]">24K Urushi Lacquer</span>
              </div>
              <p className="text-[11px] text-[#5A5553] font-serif leading-relaxed">
                Natural tree resin blended with gold powder. In memory, Socratic synthesis acts as the lacquer bonding neurons.
              </p>
              <div className="mt-2 pt-1.5 flex items-center justify-between text-[9px] font-mono text-[#736D6B] border-t border-black/5">
                <span>PERMANENT RECALL</span>
                <button
                  onClick={() => setActiveHotspot(activeHotspot === 'material' ? null : 'material')}
                  className="w-4 h-4 rounded-md border border-[#DDD7C8] flex items-center justify-center hover:bg-[#152659] hover:text-white transition-colors"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN (4 Cols) - Artifact Explorer (Liquid Glass Card) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6 lg:pl-2">
            
            {/* Artifact Card Box (Liquid Glass) */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/80 p-6 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] relative">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-3xl font-serif font-bold text-[#152659]">
                  {currentArtifact.id}
                </span>
                <span className="text-[11px] font-mono tracking-[0.2em] text-[#8F6A00] font-bold uppercase">
                  {currentArtifact.title}
                </span>
              </div>

              {/* Repaired Bowl Line Art Engraving Box */}
              <div className="w-full aspect-[16/9] bg-white/50 backdrop-blur-md border border-[#DDD7C8] rounded-2xl flex items-center justify-center p-3 mb-4 relative overflow-hidden shadow-inner">
                <svg viewBox="0 0 200 120" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M 20,40 C 25,90 70,105 100,105 C 130,105 175,90 180,40 Z"
                    fill="#FFFFFF"
                    stroke="#152659"
                    strokeWidth="1.5"
                  />
                  <ellipse cx="100" cy="40" rx="80" ry="12" fill="#F4F0E8" stroke="#152659" strokeWidth="1.5" />
                  
                  {/* Golden Joinery Cracks on Bowl */}
                  <path
                    d="M 50,45 Q 80,75 100,105 M 100,75 Q 140,65 160,45 M 80,75 L 45,90"
                    fill="none"
                    stroke="#BF9A2A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="80" cy="75" r="3" fill="#8F6A00" />
                </svg>
                <div className="absolute top-2 right-2 text-[9px] font-mono text-[#8F6A00] font-bold">
                  {currentArtifact.type}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#5A5553] font-serif leading-relaxed mb-4">
                {currentArtifact.description}
              </p>

              <div className="pt-3 border-t border-[#DDD7C8]/70 flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] text-[#736D6B] truncate max-w-[170px]">
                  {currentArtifact.meta}
                </span>

                {/* Pagination Arrow Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setActiveArtifactIndex((prev) => (prev > 0 ? prev - 1 : artifacts.length - 1))}
                    className="w-7 h-7 rounded-lg border border-[#DDD7C8] hover:bg-[#152659] hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                    aria-label="Previous artifact"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveArtifactIndex((prev) => (prev < artifacts.length - 1 ? prev + 1 : 0))}
                    className="w-7 h-7 rounded-lg border border-[#DDD7C8] hover:bg-[#152659] hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                    aria-label="Next artifact"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Status Box (Liquid Glass) */}
            <div className="p-4 bg-white/60 backdrop-blur-lg rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#BF9A2A] animate-ping" />
                <span className="text-[#8F6A00] font-bold">Bayesian FSRS Active</span>
              </div>
              <span className="text-[11px] text-[#736D6B]">Continuous Retention</span>
            </div>

          </div>
        </section>

        {/* 3. Core 3 Pillars Section ("THE THREE-STEP MENDING CYCLE") */}
        <section id="three-step-mending-cycle" className="max-w-7xl w-full mx-auto px-6 sm:px-10 py-14 border-t border-[#DDD7C8]/70">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#8F6A00] uppercase font-bold">
              THE THREE-STEP MENDING CYCLE
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#152659] mt-1 font-normal">
              How Cognitive Lacquer Works
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5553] font-serif mt-1">
              Transforming raw forgetting curves into resilient long-term memory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 bg-white/65 backdrop-blur-xl border border-white/90 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-3 hover:shadow-[0_15px_35px_rgba(191,154,42,0.1)] transition-all">
              <span className="text-3xl font-serif font-bold text-[#8F6A00]">01</span>
              <h3 className="text-base font-serif font-bold text-[#152659]">Biological Decay & Fracture Detection</h3>
              <p className="text-xs sm:text-sm text-[#5A5553] font-serif leading-relaxed">
                The Bayesian FSRS model tracks your memory half-life in real-time, predicting the exact moment retention dips below optimal stability.
              </p>
            </div>

            <div className="p-7 bg-white/65 backdrop-blur-xl border border-white/90 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-3 hover:shadow-[0_15px_35px_rgba(191,154,42,0.1)] transition-all">
              <span className="text-3xl font-serif font-bold text-[#8F6A00]">02</span>
              <h3 className="text-base font-serif font-bold text-[#152659]">Active Socratic Interrogation</h3>
              <p className="text-xs sm:text-sm text-[#5A5553] font-serif leading-relaxed">
                Gemini AI generates high-friction counterfactual and applied retrieval prompts to challenge structural understanding instead of shallow rote memorization.
              </p>
            </div>

            <div className="p-7 bg-white/65 backdrop-blur-xl border border-white/90 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-3 hover:shadow-[0_15px_35px_rgba(191,154,42,0.1)] transition-all">
              <span className="text-3xl font-serif font-bold text-[#8F6A00]">03</span>
              <h3 className="text-base font-serif font-bold text-[#152659]">Golden Lacquer Sealing</h3>
              <p className="text-xs sm:text-sm text-[#5A5553] font-serif leading-relaxed">
                Every answered challenge adds gold joinery to your ceramic artifact, multiplying stability and cementing lifelong retention.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Use Cases Section ("CRAFTED FOR LIFELONG LEARNERS") */}
        <section id="crafted-for-learners" className="max-w-7xl w-full mx-auto px-6 sm:px-10 py-14 border-t border-[#DDD7C8]/70">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#8F6A00] uppercase font-bold">
              CRAFTED FOR LIFELONG LEARNERS
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#152659] mt-1 font-normal">
              Master Languages, Complex Concepts & Reflections
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5553] font-serif mt-1">
              Built for language enthusiasts, academic scholars, and deliberate thinkers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Languages */}
            <div className="p-7 bg-white/65 backdrop-blur-xl border border-white/90 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-3 hover:shadow-[0_15px_35px_rgba(191,154,42,0.1)] transition-all">
              <div className="w-10 h-10 rounded-2xl bg-white/80 border border-[#DDD7C8] flex items-center justify-center text-[#8F6A00] shadow-xs">
                <Languages className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-[#152659]">Language Acquisition</h3>
              <p className="text-xs sm:text-sm text-[#5A5553] font-serif leading-relaxed">
                Retain intricate grammatical invariants (such as the WEIRDO subjunctive trigger rule), vocabulary nuance, and spoken pronunciation drills.
              </p>
            </div>

            {/* Card 2: Complex Technical Concepts */}
            <div className="p-7 bg-white/65 backdrop-blur-xl border border-white/90 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-3 hover:shadow-[0_15px_35px_rgba(191,154,42,0.1)] transition-all">
              <div className="w-10 h-10 rounded-2xl bg-white/80 border border-[#DDD7C8] flex items-center justify-center text-[#8F6A00] shadow-xs">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-[#152659]">Academic & Technical Domains</h3>
              <p className="text-xs sm:text-sm text-[#5A5553] font-serif leading-relaxed">
                Anchor transformer attention mechanisms, operating system cache hierarchies, medical diagnostics, or legal statutes into permanent memory.
              </p>
            </div>

            {/* Card 3: Reflective Journaling */}
            <div className="p-7 bg-white/65 backdrop-blur-xl border border-white/90 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-3 hover:shadow-[0_15px_35px_rgba(191,154,42,0.1)] transition-all">
              <div className="w-10 h-10 rounded-2xl bg-white/80 border border-[#DDD7C8] flex items-center justify-center text-[#8F6A00] shadow-xs">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-[#152659]">Voice & Reflective Journaling</h3>
              <p className="text-xs sm:text-sm text-[#5A5553] font-serif leading-relaxed">
                Record daily spoken thoughts. The AI transcribes your audio and distills key insights into customized Socratic mending prompts.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Philosophy Zen Quote Banner (Liquid Glass) */}
        <section id="zen-philosophy-reflection" className="max-w-7xl w-full mx-auto px-6 sm:px-10 py-12 border-t border-[#DDD7C8]/70">
          <div className="p-8 sm:p-10 bg-white/70 backdrop-blur-2xl border border-[#BF9A2A]/40 rounded-3xl shadow-[0_15px_40px_rgba(191,154,42,0.08),inset_0_1px_2px_rgba(255,255,255,0.9)] space-y-2">
            <span className="text-4xl font-serif text-[#BF9A2A] leading-none select-none">“</span>
            <blockquote className="text-sm sm:text-base font-serif italic text-[#2B2827] leading-relaxed -mt-2">
              The beauty of Kintsugi is not in pretending the vessel never broke, but in celebrating how the golden joinery made it stronger and more resilient than before.
            </blockquote>
            <div className="text-[11px] font-mono text-[#8F6A00] uppercase tracking-wider font-semibold pt-1">
              — The Wabi-Sabi Principle of Resilient Mastery
            </div>
          </div>
        </section>
      </div>

      {/* 6. Serene Minimalist Footer (Without bottom enter button or Kyoto, Japan) */}
      <footer className="relative z-20 w-full border-t border-[#DDD7C8]/70 bg-white/40 backdrop-blur-md py-6 px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#736D6B] uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <span>BAYESIAN FSRS</span>
          <span>•</span>
          <span>GEMINI AI SOCRATIC</span>
          <span>•</span>
          <span>URUSHI GOLD RETENTION</span>
        </div>

        <div>© 2026 KINTSUGI MEMORY</div>
      </footer>
    </div>
  );
};
