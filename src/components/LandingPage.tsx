import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Plus, Sparkles, Compass, Layers, ShieldCheck, Zap, BookOpen, ExternalLink, Languages, Brain, Mic } from 'lucide-react';

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
    <div className="min-h-screen bg-[#FAF8F2] text-[#2B2827] flex flex-col font-sans selection:bg-[#BF9A2A]/30 selection:text-[#2B2827] relative overflow-x-hidden">
      
      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 flex items-center justify-between border-b border-[#DDD7C8]/70">
        <div className="flex flex-col cursor-pointer" onClick={() => setActiveTab('home')}>
          <span className="font-serif tracking-[0.28em] text-lg sm:text-xl font-medium text-[#152659]">
            K I N T S U G I
          </span>
          <span className="text-[10px] tracking-[0.35em] text-[#8F6A00] font-mono -mt-0.5">
            金 継 ぎ • NEURAL JOINERY
          </span>
        </div>

        {/* Center / Right Navigation Links */}
        <nav className="flex items-center gap-6 sm:gap-9 text-xs tracking-[0.2em] font-mono text-[#5A5553] uppercase">
          <button
            onClick={() => setActiveTab('home')}
            className={`transition-colors hover:text-[#8F6A00] cursor-pointer ${
              activeTab === 'home' ? 'text-[#8F6A00] font-bold border-b border-[#8F6A00] pb-0.5' : ''
            }`}
          >
            Sanctuary
          </button>
          <button
            onClick={() => setActiveTab('collection')}
            className={`transition-colors hover:text-[#8F6A00] hidden md:inline-block cursor-pointer ${
              activeTab === 'collection' ? 'text-[#8F6A00] font-bold border-b border-[#8F6A00] pb-0.5' : ''
            }`}
          >
            Collection
          </button>
          <button
            onClick={() => setActiveTab('process')}
            className={`transition-colors hover:text-[#8F6A00] hidden md:inline-block cursor-pointer ${
              activeTab === 'process' ? 'text-[#8F6A00] font-bold border-b border-[#8F6A00] pb-0.5' : ''
            }`}
          >
            Process
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`transition-colors hover:text-[#8F6A00] hidden lg:inline-block cursor-pointer ${
              activeTab === 'journal' ? 'text-[#8F6A00] font-bold border-b border-[#8F6A00] pb-0.5' : ''
            }`}
          >
            Journal
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onEnterApp}
            className="px-5 py-2 rounded-full bg-[#152659] hover:bg-[#1E357A] text-white transition-all text-xs font-mono font-medium tracking-[0.15em] flex items-center gap-2 group shadow-sm cursor-pointer"
          >
            <span>ENTER APP</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#BF9A2A] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </nav>
      </header>

      {/* MAIN SANCTUARY (HOME) TAB */}
      {activeTab === 'home' && (
        <div className="flex flex-col">
          
          {/* 3-Column Hero Section */}
          <main className="relative z-10 max-w-7xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            
            {/* LEFT HERO COLUMN (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col justify-center space-y-6 lg:pr-2">
              <div>
                <div className="text-[11px] font-mono tracking-[0.25em] text-[#8F6A00] uppercase font-semibold mb-2.5 flex items-center gap-2">
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

              <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DDD7C8] text-xs text-[#2B2827] font-mono leading-relaxed space-y-1.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-[#8F6A00] font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#BF9A2A]" />
                  <span>The Synaptic Parallel</span>
                </div>
                <p className="text-[#5A5553]">
                  Bayesian FSRS algorithms calculate the forgetting curve, and Gemini Socratic AI triggers the active recall needed to gild your understanding.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={onEnterApp}
                  className="px-6 py-3.5 rounded-full bg-[#152659] hover:bg-[#1E357A] text-white transition-all font-mono text-xs tracking-[0.18em] uppercase flex items-center justify-center gap-2.5 group shadow-md cursor-pointer"
                >
                  <span>START YOUR JOURNEY</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#BF9A2A] group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setActiveTab('process')}
                  className="px-5 py-3.5 rounded-full border border-[#DDD7C8] hover:bg-[#F4F0E8] text-[#5A5553] transition-all font-mono text-xs tracking-wider uppercase flex items-center justify-center cursor-pointer"
                >
                  How It Works
                </button>
              </div>
            </div>

            {/* CENTER HERO SHOWCASE (4 Cols) - Handcrafted Ceramic Centerpiece Vase */}
            <div className="lg:col-span-4 relative flex flex-col items-center justify-center py-6 sm:py-8">
              
              {/* Top-Left Floating Annotation: ORIGIN */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute -top-3 sm:top-2 left-0 sm:-left-4 z-20 w-52 sm:w-56 p-3.5 bg-[#FFFFFF]/95 border border-[#BF9A2A]/40 rounded-xl shadow-md backdrop-blur-sm text-xs"
              >
                <div className="flex items-center justify-between mb-1.5 border-b border-[#BF9A2A]/20 pb-1">
                  <span className="font-mono text-[10px] tracking-widest text-[#8F6A00] font-bold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#BF9A2A]" /> ORIGIN
                  </span>
                  <span className="text-[10px] font-mono text-[#736D6B]">15th Century Kyoto</span>
                </div>
                <p className="text-[11px] text-[#5A5553] font-serif leading-relaxed">
                  Kintsugi (金継ぎ) means &quot;golden joinery&quot;. Rooted in <em>wabi-sabi</em> — finding resilience and beauty in imperfection.
                </p>
                <div className="mt-2 pt-1.5 flex items-center justify-between text-[9px] font-mono text-[#736D6B] border-t border-[#DDD7C8]">
                  <span>BAYESIAN FSRS</span>
                  <button
                    onClick={() => setActiveHotspot(activeHotspot === 'origin' ? null : 'origin')}
                    className="w-4 h-4 rounded border border-[#DDD7C8] flex items-center justify-center hover:bg-[#152659] hover:text-white transition-colors"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </motion.div>

              {/* Central High-Art Kintsugi Vase Artwork */}
              <div className="relative w-64 sm:w-72 md:w-80 aspect-[4/5] bg-gradient-to-b from-[#252220] via-[#3D3835] to-[#181615] p-4 flex flex-col items-center justify-center shadow-2xl rounded-2xl overflow-hidden border border-[#BF9A2A]/40">
                
                {/* Studio Backdrop Lighting Flare */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_25%,rgba(242,227,182,0.22)_0%,transparent_60%)]" />
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
                  <span>KYOTO CERAMIC VAULT</span>
                  <span>NO. 0826</span>
                </div>
              </div>

              {/* Bottom-Right Floating Annotation: MATERIAL */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-3 sm:bottom-4 right-0 sm:-right-4 z-20 w-52 sm:w-56 p-3.5 bg-[#FFFFFF]/95 border border-[#BF9A2A]/40 rounded-xl shadow-md backdrop-blur-sm text-xs"
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
                <div className="mt-2 pt-1.5 flex items-center justify-between text-[9px] font-mono text-[#736D6B] border-t border-[#DDD7C8]">
                  <span>PERMANENT RECALL</span>
                  <button
                    onClick={() => setActiveHotspot(activeHotspot === 'material' ? null : 'material')}
                    className="w-4 h-4 rounded border border-[#DDD7C8] flex items-center justify-center hover:bg-[#152659] hover:text-white transition-colors"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN (4 Cols) - Artifact Explorer & Quick Launch */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-6 lg:pl-2">
              
              {/* Artifact Card Box */}
              <div className="bg-[#FFFFFF] border border-[#DDD7C8] p-6 rounded-2xl shadow-xs relative">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-3xl font-serif font-bold text-[#152659]">
                    {currentArtifact.id}
                  </span>
                  <span className="text-[11px] font-mono tracking-[0.2em] text-[#8F6A00] font-bold uppercase">
                    {currentArtifact.title}
                  </span>
                </div>

                {/* Repaired Bowl Line Art Engraving Box */}
                <div className="w-full aspect-[16/9] bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl flex items-center justify-center p-3 mb-4 relative overflow-hidden">
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

                <div className="pt-3 border-t border-[#DDD7C8] flex items-center justify-between text-xs font-mono">
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

              {/* Launch App Status Card */}
              <div className="p-4.5 bg-[#152659] text-white rounded-2xl border border-[#BF9A2A]/40 flex items-center justify-between gap-3 shadow-md">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono tracking-widest text-[#BF9A2A] uppercase font-bold">
                    KINTSUGI ENGINE ACTIVE
                  </div>
                  <div className="text-xs font-serif text-[#DDD7C8]">
                    Ready to mend your synaptic retention?
                  </div>
                </div>
                <button
                  onClick={onEnterApp}
                  className="px-4 py-2 bg-[#BF9A2A] hover:bg-[#D4AF37] text-[#152659] font-mono text-xs font-bold tracking-wider transition-colors flex items-center gap-1.5 shrink-0 rounded-xl cursor-pointer shadow-sm"
                >
                  <span>OPEN APP</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          </main>

          {/* Core 3 Pillars Section */}
          <section className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-12 border-t border-[#DDD7C8]/80">
            <div className="max-w-2xl mb-8">
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#8F6A00] uppercase font-bold">
                THE THREE-STEP MENDING CYCLE
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#152659] mt-1 font-normal">
                How Cognitive Lacquer Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl shadow-xs space-y-3">
                <span className="text-3xl font-serif font-bold text-[#8F6A00]">01</span>
                <h3 className="text-base font-serif font-bold text-[#152659]">Biological Decay & Fracture Detection</h3>
                <p className="text-xs text-[#5A5553] font-serif leading-relaxed">
                  The Bayesian FSRS model tracks your memory half-life in real-time, predicting the exact moment retention dips below optimal stability.
                </p>
              </div>

              <div className="p-6 bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl shadow-xs space-y-3">
                <span className="text-3xl font-serif font-bold text-[#8F6A00]">02</span>
                <h3 className="text-base font-serif font-bold text-[#152659]">Active Socratic Interrogation</h3>
                <p className="text-xs text-[#5A5553] font-serif leading-relaxed">
                  Gemini AI generates high-friction counterfactual and applied retrieval prompts to challenge structural understanding instead of shallow rote memorization.
                </p>
              </div>

              <div className="p-6 bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl shadow-xs space-y-3">
                <span className="text-3xl font-serif font-bold text-[#8F6A00]">03</span>
                <h3 className="text-base font-serif font-bold text-[#152659]">Golden Lacquer Sealing</h3>
                <p className="text-xs text-[#5A5553] font-serif leading-relaxed">
                  Every answered challenge adds gold joinery to your ceramic artifact, multiplying stability and cementing lifelong retention.
                </p>
              </div>
            </div>
          </section>

          {/* Use Cases Section: Students, Language Learners, Thinkers */}
          <section className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-10 border-t border-[#DDD7C8]/80">
            <div className="max-w-2xl mb-8">
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#8F6A00] uppercase font-bold">
                CRAFTED FOR LIFELONG LEARNERS
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#152659] mt-1 font-normal">
                Master Languages, Complex Concepts & Reflections
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Languages */}
              <div className="p-6 bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] flex items-center justify-center text-[#8F6A00]">
                  <Languages className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-bold text-[#152659]">Language Acquisition</h3>
                <p className="text-xs text-[#5A5553] font-serif leading-relaxed">
                  Retain intricate grammatical invariants (such as the WEIRDO subjunctive trigger rule), vocabulary nuance, and spoken pronunciation drills.
                </p>
              </div>

              {/* Card 2: Complex Technical Concepts */}
              <div className="p-6 bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] flex items-center justify-center text-[#8F6A00]">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-bold text-[#152659]">Academic & Technical Domains</h3>
                <p className="text-xs text-[#5A5553] font-serif leading-relaxed">
                  Anchor transformer attention mechanisms, operating system cache hierarchies, medical diagnostics, or legal statutes into permanent memory.
                </p>
              </div>

              {/* Card 3: Reflective Journaling */}
              <div className="p-6 bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] flex items-center justify-center text-[#8F6A00]">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-bold text-[#152659]">Voice & Reflective Journaling</h3>
                <p className="text-xs text-[#5A5553] font-serif leading-relaxed">
                  Record daily spoken thoughts. The AI transcribes your audio and distills key insights into customized Socratic mending prompts.
                </p>
              </div>
            </div>
          </section>

          {/* Philosophy Zen Quote Banner */}
          <section className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-10 border-t border-[#DDD7C8]/80">
            <div className="p-8 sm:p-10 bg-[#FAF8F2] border border-[#BF9A2A]/40 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
              <div className="space-y-2 max-w-2xl">
                <span className="text-4xl font-serif text-[#BF9A2A] leading-none select-none">“</span>
                <blockquote className="text-sm sm:text-base font-serif italic text-[#2B2827] leading-relaxed -mt-2">
                  The beauty of Kintsugi is not in pretending the vessel never broke, but in celebrating how the golden joinery made it stronger and more resilient than before.
                </blockquote>
                <div className="text-[11px] font-mono text-[#8F6A00] uppercase tracking-wider font-semibold pt-1">
                  — The Wabi-Sabi Principle of Resilient Mastery
                </div>
              </div>

              <button
                onClick={onEnterApp}
                className="px-6 py-3.5 rounded-full bg-[#152659] hover:bg-[#1E357A] text-white font-mono text-xs font-bold tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
              >
                <span>ENTER SANCTUARY</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#BF9A2A]" />
              </button>
            </div>
          </section>
        </div>
      )}

      {/* COLLECTION TAB */}
      {activeTab === 'collection' && (
        <section className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-12">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#8F6A00] uppercase font-bold">
              THE ARTIFACT COLLECTION
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#152659] mt-1 font-normal">
              Vessels of Preserved Knowledge
            </h2>
            <p className="text-sm text-[#5A5553] font-serif mt-2">
              Each ceramic vessel represents a mastered domain. The golden seams represent points where memory decayed and was subsequently reinforced through Socratic dialogue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Artifact 1 */}
            <div className="p-6 bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-full aspect-[4/3] bg-[#152659] rounded-xl p-4 flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="text-center space-y-1">
                    <span className="text-2xl font-serif text-[#F2E3B6]">金継ぎ 白磁</span>
                    <p className="text-[10px] font-mono text-[#BF9A2A]">White Celadon Vase with Gold Joinery</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#8F6A00] font-bold uppercase tracking-wider">DOMAIN: MACHINE LEARNING</span>
                <h3 className="text-lg font-serif text-[#152659] mt-1">Attention Mechanism & Transformer Layers</h3>
                <p className="text-xs text-[#5A5553] font-serif mt-2">
                  Fractured 4 times under time decay, now permanently stabilized with a 92-day retention half-life.
                </p>
              </div>
              <button
                onClick={onEnterApp}
                className="mt-4 pt-3 border-t border-[#DDD7C8] text-xs font-mono text-[#8F6A00] hover:text-[#152659] flex items-center justify-between cursor-pointer"
              >
                <span>Inspect in Synaptic Garden</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Artifact 2 */}
            <div className="p-6 bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-full aspect-[4/3] bg-[#2A2421] rounded-xl p-4 flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="text-center space-y-1">
                    <span className="text-2xl font-serif text-[#C2D1FF]">藍染め 陶器</span>
                    <p className="text-[10px] font-mono text-[#BF8F54]">Indigo Glazed Pottery with 24K Leaf</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#8F6A00] font-bold uppercase tracking-wider">DOMAIN: SYSTEMS & HARDWARE</span>
                <h3 className="text-lg font-serif text-[#152659] mt-1">L1/L2 Cache Coherence & False Sharing</h3>
                <p className="text-xs text-[#5A5553] font-serif mt-2">
                  Repaired with gold lacquer after answering counterfactual architectural challenges.
                </p>
              </div>
              <button
                onClick={onEnterApp}
                className="mt-4 pt-3 border-t border-[#DDD7C8] text-xs font-mono text-[#8F6A00] hover:text-[#152659] flex items-center justify-between cursor-pointer"
              >
                <span>Inspect in Synaptic Garden</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Artifact 3 */}
            <div className="p-6 bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-full aspect-[4/3] bg-[#1E2D24] rounded-xl p-4 flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="text-center space-y-1">
                    <span className="text-2xl font-serif text-[#C0D9A0]">織部焼 苔緑</span>
                    <p className="text-[10px] font-mono text-[#F2E3B6]">Oribe Moss Green Ceramic</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#8F6A00] font-bold uppercase tracking-wider">DOMAIN: NEUROSCIENCE</span>
                <h3 className="text-lg font-serif text-[#152659] mt-1">Hippocampal Memory Consolidation</h3>
                <p className="text-xs text-[#5A5553] font-serif mt-2">
                  Embodied with high synaptic stability across 8 consecutive daily retrieval streaks.
                </p>
              </div>
              <button
                onClick={onEnterApp}
                className="mt-4 pt-3 border-t border-[#DDD7C8] text-xs font-mono text-[#8F6A00] hover:text-[#152659] flex items-center justify-between cursor-pointer"
              >
                <span>Inspect in Synaptic Garden</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* PROCESS TAB */}
      {activeTab === 'process' && (
        <section className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-12">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#8F6A00] uppercase font-bold">
              THE THREE-STEP MENDING CYCLE
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#152659] mt-1 font-normal">
              The Cognitive Lacquer Lifecycle
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl shadow-xs space-y-3">
              <span className="text-3xl font-serif font-bold text-[#8F6A00]">01</span>
              <h3 className="text-base font-serif font-bold text-[#152659]">Decay Identification</h3>
              <p className="text-xs text-[#5A5553] font-serif leading-relaxed">
                The Bayesian FSRS model predicts the exact second memory drops below the 70% forgetting cliff, surfacing vulnerable vessels in your garden.
              </p>
            </div>

            <div className="p-6 bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl shadow-xs space-y-3">
              <span className="text-3xl font-serif font-bold text-[#8F6A00]">02</span>
              <h3 className="text-base font-serif font-bold text-[#152659]">Socratic Interrogation</h3>
              <p className="text-xs text-[#5A5553] font-serif leading-relaxed">
                Gemini generates high-friction counterfactual and applied retrieval prompts to probe deep structural comprehension and causal invariants.
              </p>
            </div>

            <div className="p-6 bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl shadow-xs space-y-3">
              <span className="text-3xl font-serif font-bold text-[#8F6A00]">03</span>
              <h3 className="text-base font-serif font-bold text-[#152659]">Golden Sealing</h3>
              <p className="text-xs text-[#5A5553] font-serif leading-relaxed">
                Successful recall triggers golden seam visual restoration, multiplying synaptic stability and expanding future retention half-life.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* JOURNAL TAB */}
      {activeTab === 'journal' && (
        <section className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-12">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#8F6A00] uppercase font-bold">
              THE PHILOSOPHICAL JOURNAL
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#152659] mt-1 font-normal">
              Notes on Memory & Imperfection
            </h2>
          </div>

          <div className="space-y-4 max-w-3xl">
            <article className="p-6 bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#8F6A00]">
                <span>ENTRY #01 • KYOTO REFLECTION</span>
                <span>AUGUST 2026</span>
              </div>
              <h3 className="text-xl font-serif text-[#152659]">Why We Never Hide the Scars of Learning</h3>
              <p className="text-xs text-[#5A5553] font-serif leading-relaxed">
                Traditional education treats forgotten items as failures to be penalized. Kintsugi inverts this paradigm: every forgotten concept is a pristine ceramic break waiting to be highlighted with 24K gold lacquer.
              </p>
            </article>
          </div>
        </section>
      )}

      {/* FOOTER BAR */}
      <footer className="relative z-20 w-full border-t border-[#DDD7C8] bg-[#FAF8F2] py-5 px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#736D6B] uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <span>BAYESIAN FSRS</span>
          <span>•</span>
          <span>GEMINI AI SOCRATIC</span>
          <span>•</span>
          <span>URUSHI GOLD RETENTION</span>
        </div>

        <button
          onClick={onEnterApp}
          className="px-5 py-2 rounded-full bg-[#152659] text-white font-mono font-bold hover:bg-[#1E357A] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#BF9A2A] animate-ping" />
          <span>ENTER KINTSUGI MEMORY</span>
        </button>

        <div>KYOTO, JAPAN • © 2026 KINTSUGI MEMORY</div>
      </footer>
    </div>
  );
};
