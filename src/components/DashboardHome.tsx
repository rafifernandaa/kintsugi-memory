import React, { useState, useMemo } from 'react';
import { Concept, SynapticStreakData } from '../types';
import { HomeKnowledgeGraph } from './HomeKnowledgeGraph';
import { SynapticStreakTracker } from './SynapticStreakTracker';
import {
  Sparkles,
  ArrowRight,
  Sun,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  Layers,
  Brain,
  Cpu,
  Share2,
  TrendingUp,
  Activity,
  Calendar,
  BookOpen,
  Info,
  ChevronDown,
  RotateCw,
  Clock,
  Feather,
  Plus,
  Mic,
  FileText,
  Search,
  X,
  Tag,
  Filter,
} from 'lucide-react';

interface DashboardHomeProps {
  concepts: Concept[];
  streak: SynapticStreakData;
  timeWarpDays: number;
  onStartReview: (concept?: Concept) => void;
  onNavigateToTab: (tab: 'garden' | 'ingest' | 'retrieve' | 'oracle' | 'dispatch' | 'calendar') => void;
  onOpenJournal: () => void;
  onOpenDailySummary: () => void;
  onOpenJudgeModal: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  concepts,
  streak,
  timeWarpDays,
  onStartReview,
  onNavigateToTab,
  onOpenJournal,
  onOpenDailySummary,
  onOpenJudgeModal,
}) => {
  const [timeframe, setTimeframe] = useState<'This week' | 'This month'>('This week');
  const [selectedClusterNode, setSelectedClusterNode] = useState<string>('Statistics');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Compute live stats from concepts
  const averageRetention = useMemoRetention(concepts);
  const cliffConcepts = concepts.filter((c) => c.currentRetention < 0.70);
  const wiltingConcepts = concepts.filter((c) => c.currentRetention >= 0.70 && c.currentRetention < 0.85);
  const focusConcept = cliffConcepts.length > 0 ? cliffConcepts[0] : concepts[0];

  // Extract all unique tags across concepts
  const allTags = useMemo(() => {
    const set = new Set<string>();
    concepts.forEach((c) => {
      if (c.tags) {
        c.tags.forEach((t) => set.add(t));
      }
    });
    return Array.from(set);
  }, [concepts]);

  // Filter concepts based on search query and tag selection
  const filteredConcepts = useMemo(() => {
    return concepts.filter((c) => {
      if (selectedTag) {
        const hasTag = c.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
        const hasCat = c.category.toLowerCase().includes(selectedTag.toLowerCase());
        if (!hasTag && !hasCat) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchSummary = c.summary.toLowerCase().includes(q);
        const matchCategory = c.category.toLowerCase().includes(q);
        const matchTags = c.tags?.some((t) => t.toLowerCase().includes(q));
        const matchMechanisms = c.keyMechanisms.some((m) => m.toLowerCase().includes(q));
        if (!matchTitle && !matchSummary && !matchCategory && !matchTags && !matchMechanisms) {
          return false;
        }
      }

      return true;
    });
  }, [concepts, searchQuery, selectedTag]);

  const isSearchActive = searchQuery.trim().length > 0 || selectedTag !== null;

  // Due count
  const dueCount = cliffConcepts.length + Math.min(wiltingConcepts.length, 3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Greeting & Header Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDD7C8] pb-4">
        <div className="space-y-0.5">
          {timeWarpDays > 0 && (
            <div className="flex items-center gap-2 pb-0.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#993B2B]/10 text-[#993B2B] border border-[#993B2B]/30">
                +{timeWarpDays.toFixed(1)}d Fast-Forward
              </span>
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2B2827] tracking-tight">
            Synaptic Overview Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <SynapticStreakTracker
            streak={streak}
            onStartRetrieval={onStartReview}
          />

          <div className="hidden sm:flex items-center gap-2 text-right">
            <Sun className="w-4 h-4 text-[#BF9A2A]" />
            <div>
              <div className="text-xs font-semibold text-[#2B2827]">Good morning, Selene</div>
              <div className="text-[11px] text-[#736D6B]">Today is a good day to grow.</div>
            </div>
          </div>

          <button
            onClick={onOpenDailySummary}
            className="p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F2] border border-[#DDD7C8] text-[#5A5553] hover:text-[#2B2827] transition-colors relative shadow-sm"
            title="Daily Synaptic Summary"
          >
            <Bell className="w-4 h-4 text-[#8F6A00]" />
            {cliffConcepts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#993B2B] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {cliffConcepts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Global Concept Search & Tag Filter Bar */}
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#736D6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts by title or tags (e.g. #distributed, #neuroscience, #ai, #consensus)..."
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm font-mono bg-[#FAF8F2] border border-[#DDD7C8] rounded-2xl text-[#2B2827] placeholder-[#736D6B] focus:outline-none focus:border-[#BF9A2A] focus:ring-2 focus:ring-[#BF9A2A]/20 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#736D6B] hover:text-[#2B2827] p-1 rounded-full hover:bg-[#EAE6D6] transition-colors"
                title="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Clear or Count indicator */}
          <div className="flex items-center gap-2 shrink-0">
            {isSearchActive ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#8F6A00] font-semibold bg-[#BF9A2A]/15 px-3 py-1.5 rounded-xl border border-[#BF9A2A]/30">
                  {filteredConcepts.length} {filteredConcepts.length === 1 ? 'concept' : 'concepts'} found
                </span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] hover:text-[#2B2827] border border-[#DDD7C8] text-xs font-mono font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
            ) : (
              <span className="text-xs font-mono text-[#736D6B] hidden sm:inline">
                {concepts.length} total concepts indexed
              </span>
            )}
          </div>
        </div>

        {/* Quick Tag Filter Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin flex-nowrap">
          <span className="text-[11px] font-mono text-[#736D6B] uppercase shrink-0 flex items-center gap-1 font-semibold pr-1 whitespace-nowrap">
            <Tag className="w-3 h-3 text-[#BF9A2A]" />
            Tags:
          </span>

          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition-all shrink-0 whitespace-nowrap ${
              selectedTag === null
                ? 'bg-[#152659] text-[#FFFFFF] font-bold shadow-sm'
                : 'bg-[#FAF8F2] text-[#5A5553] hover:text-[#2B2827] border border-[#DDD7C8]'
            }`}
          >
            All
          </button>

          {allTags.map((tag) => {
            const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(isSelected ? null : tag)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition-all shrink-0 whitespace-nowrap border ${
                  isSelected
                    ? 'bg-[#BF9A2A] text-[#2B2827] font-bold border-[#BF9A2A] shadow-sm'
                    : 'bg-[#FAF8F2] text-[#5A5553] hover:text-[#2B2827] border-[#DDD7C8] hover:border-[#BF9A2A]'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* When Search/Filter is Active, Display Instant Match Results Grid */}
      {isSearchActive && (
        <div className="bg-[#FFFFFF] border border-[#BF9A2A]/40 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDD7C8]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#BF9A2A]" />
              <h3 className="text-base font-serif font-bold text-[#2B2827]">
                Filtered Concepts ({filteredConcepts.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('garden')}
              className="text-xs font-mono text-[#8F6A00] hover:text-[#2B2827] flex items-center gap-1 font-semibold transition-colors"
            >
              <span>Explore in Memory Garden</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {filteredConcepts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConcepts.map((concept) => {
                const retPct = Math.round(concept.currentRetention * 100);
                const isCliff = concept.currentRetention < 0.70;
                const isGolden = concept.kintsugiRepairs > 0;

                return (
                  <div
                    key={concept.id}
                    className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] hover:border-[#BF9A2A] transition-all flex flex-col justify-between space-y-3 shadow-sm group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#DDD7C8] text-[#736D6B] font-semibold truncate">
                          {concept.category}
                        </span>
                        {isCliff ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FDF2F0] text-[#993B2B] border border-[#F2C0B8] flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> Cliff
                          </span>
                        ) : isGolden ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FAF3E0] text-[#8F6A00] border border-[#E8D4A2] flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> {concept.kintsugiRepairs}x
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F0F7F1] text-[#2F6A38] border border-[#BFE0C4]">
                            Healthy
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-serif font-bold text-[#2B2827] group-hover:text-[#8F6A00] transition-colors line-clamp-1">
                        {concept.title}
                      </h4>

                      <p className="text-xs text-[#5A5553] line-clamp-2 leading-relaxed">
                        {concept.summary}
                      </p>

                      {/* Tag Chips */}
                      {concept.tags && concept.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {concept.tags.map((t) => {
                            const isTagMatch = selectedTag?.toLowerCase() === t.toLowerCase() ||
                              (searchQuery.trim() && t.toLowerCase().includes(searchQuery.toLowerCase().trim()));
                            return (
                              <button
                                key={t}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTag(t);
                                }}
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                                  isTagMatch
                                    ? 'bg-[#BF9A2A]/20 text-[#8F6A00] border border-[#BF9A2A]/50 font-bold'
                                    : 'bg-[#FFFFFF] text-[#736D6B] hover:text-[#2B2827] border border-[#DDD7C8]'
                                }`}
                              >
                                #{t}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Retention Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-[#736D6B]">Retention</span>
                          <span className="font-bold text-[#2B2827]">{retPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#EAE6D6] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isCliff
                                ? 'bg-[#993B2B]'
                                : isGolden
                                ? 'bg-[#BF9A2A]'
                                : 'bg-[#152659]'
                            }`}
                            style={{ width: `${retPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#DDD7C8]/70">
                      <button
                        onClick={() => onStartReview(concept)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3 h-3 text-[#BF9A2A]" />
                      </button>
                      <button
                        onClick={() => onNavigateToTab('garden')}
                        className="py-1.5 px-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EAE6D6] text-[#5A5553] hover:text-[#2B2827] border border-[#DDD7C8] text-xs font-mono transition-colors"
                        title="View in Garden"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] text-center space-y-2">
              <BookOpen className="w-6 h-6 text-[#736D6B] mx-auto" />
              <h4 className="text-sm font-serif font-bold text-[#2B2827]">
                No concepts match "{searchQuery || selectedTag}"
              </h4>
              <p className="text-xs text-[#5A5553] max-w-sm mx-auto">
                Try searching for keywords like <span className="font-mono text-[#8F6A00]">#distributed</span>, <span className="font-mono text-[#8F6A00]">#neuroscience</span>, <span className="font-mono text-[#8F6A00]">#ai</span>, or <span className="font-mono text-[#8F6A00]">#consensus</span>.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#152659] text-white text-xs font-mono font-bold hover:bg-[#1E357A] transition-colors inline-block mt-1 shadow-sm"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}

      {/* Row 1: Hero Card + Today's Focus Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Hero Card (2 Cols) */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm flex flex-col justify-between group">
          {/* Subtle gold kintsugi veins in background */}
          <div className="absolute top-0 right-0 w-80 h-full pointer-events-none opacity-40">
            <svg viewBox="0 0 300 300" className="w-full h-full">
              <path
                d="M 50 250 Q 120 180 160 140 T 260 40 M 160 140 Q 200 170 280 160 M 120 180 Q 90 140 110 90"
                stroke="url(#hero-gold-glow)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="hero-gold-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#BF9A2A" />
                  <stop offset="50%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#8F6A00" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="relative z-10 space-y-4 max-w-md">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B2827] leading-tight tracking-tight">
              Embrace Imperfection,<br />
              Build Unshakable Memory.
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5553] leading-relaxed">
              Kintsugi Memory uses neuroplasticity to help you remember more, forget less, and truly understand.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onStartReview(focusConcept)}
                className="px-6 py-3 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] font-medium text-xs sm:text-sm inline-flex items-center gap-2 transition-all shadow-md group-hover:gap-3"
              >
                <span>Start Review</span>
                <ArrowRight className="w-4 h-4 text-[#BF9A2A]" />
              </button>
            </div>
          </div>

          {/* Right Visual: Ceramic Vase Render */}
          <div className="absolute right-4 sm:right-8 bottom-0 top-0 flex items-center justify-center pointer-events-none">
            <div className="w-44 sm:w-56 h-44 sm:h-56 relative opacity-90 sm:opacity-100">
              <VaseGraphic />
            </div>
          </div>
        </div>

        {/* Right Card: Today's Focus (1 Col) */}
        <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#8F6A00] font-bold">
              <Sun className="w-3.5 h-3.5 text-[#8F6A00]" />
              <span>Today's Focus</span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono text-[#736D6B] uppercase font-semibold">
                {focusConcept?.category || 'Biostatistics'}
              </div>
              <h3 className="text-xl font-serif font-bold text-[#2B2827] leading-snug">
                {focusConcept?.title || 'Hypothesis Testing'}
              </h3>
            </div>

            {/* Retention Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#736D6B]">Current Retention</span>
                <span className="font-bold text-[#2B2827]">
                  {focusConcept ? Math.round(focusConcept.currentRetention * 100) : 60}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#EAE6D6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#BF9A2A] to-[#8F6A00] rounded-full transition-all duration-500"
                  style={{
                    width: `${focusConcept ? Math.round(focusConcept.currentRetention * 100) : 60}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-[#DDD7C8]">
            <div>
              <div className="text-[11px] font-mono text-[#736D6B]">Next Review</div>
              <div className="text-sm font-semibold text-[#2B2827]">
                {focusConcept?.currentRetention < 0.70 ? 'Immediate (At Cliff)' : '12:30 PM Today'}
              </div>
            </div>

            <button
              onClick={() => onStartReview(focusConcept)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#2B2827] border border-[#DDD7C8] text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8F6A00]" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Neuroplasticity in Action + Memory Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Neuroplasticity in Action (2 Cols) */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-serif font-bold text-[#2B2827]">
              Neuroplasticity in Action
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5553]">
              Your brain is rewiring. Keep showing up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Neuron graphic (5 cols) */}
            <div className="md:col-span-5 flex items-center justify-center p-2">
              <NeuronSynapseGraphic />
            </div>

            {/* Right 3 Pillars (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] flex items-center justify-center text-[#8F6A00] shrink-0 shadow-sm">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-serif font-bold text-[#2B2827]">Strengthen</h4>
                  <p className="text-xs text-[#5A5553] leading-relaxed">
                    Active recall reinforces neural connections.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] flex items-center justify-center text-[#152659] shrink-0 shadow-sm">
                  <RotateCw className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-serif font-bold text-[#2B2827]">Rewire</h4>
                  <p className="text-xs text-[#5A5553] leading-relaxed">
                    Spacing and repetition builds new pathways.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] flex items-center justify-center text-[#2F6A38] shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-serif font-bold text-[#2B2827]">Retain</h4>
                  <p className="text-xs text-[#5A5553] leading-relaxed">
                    Consistent practice makes it lasting.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#DDD7C8] flex items-center justify-between">
            <button
              onClick={() => onNavigateToTab('garden')}
              className="px-4 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#2B2827] border border-[#DDD7C8] text-xs font-mono font-medium inline-flex items-center gap-2 transition-colors shadow-sm"
            >
              <span>Learn how it works</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8F6A00]" />
            </button>
            <span className="text-[11px] font-mono text-[#736D6B]">
              {concepts.length} Monitored Synaptic Nodes
            </span>
          </div>
        </div>

        {/* Memory Progress (1 Col) */}
        <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-[#2B2827]">
              Memory Progress
            </h3>
            <div className="relative">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="text-xs font-mono bg-[#FAF8F2] border border-[#DDD7C8] rounded-lg px-2 py-1 text-[#5A5553] focus:outline-none cursor-pointer"
              >
                <option value="This week">This week</option>
                <option value="This month">This month</option>
              </select>
            </div>
          </div>

          {/* Radial Progress Donut */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#EAE6D6"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#5A5553"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - averageRetention / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-serif font-bold text-[#2B2827]">
                  {averageRetention}%
                </span>
                <span className="text-[11px] font-mono text-[#736D6B] uppercase">
                  Retention
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Sparkline Wave */}
          <div className="space-y-2 pt-1 border-t border-[#DDD7C8]">
            <WeeklyRetentionWave average={averageRetention} />
            <p className="text-xs text-[#5A5553] text-center pt-1 leading-relaxed">
              You're improving steadily.<br />
              <span className="italic font-serif">Small cracks, stronger beauty.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Today's Review + Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Review Card */}
        <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD7C8]">
              <h3 className="text-lg font-serif font-bold text-[#2B2827]">
                Today's Review
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FAF8F2] text-[#8F6A00] border border-[#DDD7C8]">
                {dueCount} due
              </span>
            </div>

            {/* List of Concepts for Review */}
            <div className="space-y-3 pt-3">
              {concepts.slice(0, 3).map((concept, index) => {
                const diffBadge = index === 0 ? 'Medium' : index === 1 ? 'Hard' : 'Easy';
                const diffColor =
                  diffBadge === 'Hard'
                    ? 'bg-[#FDF2F0] text-[#993B2B] border-[#F2C0B8]'
                    : diffBadge === 'Medium'
                    ? 'bg-[#FAF3E0] text-[#8F6A00] border-[#E8D4A2]'
                    : 'bg-[#F0F7F1] text-[#2F6A38] border-[#BFE0C4]';

                return (
                  <div
                    key={concept.id}
                    className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] hover:border-[#BF9A2A] transition-all flex items-center justify-between gap-3 group shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] border border-[#DDD7C8] flex items-center justify-center text-[#5A5553] shrink-0">
                        {index === 0 ? (
                          <Activity className="w-5 h-5 text-[#8F6A00]" />
                        ) : index === 1 ? (
                          <TrendingUp className="w-5 h-5 text-[#152659]" />
                        ) : (
                          <Layers className="w-5 h-5 text-[#2F6A38]" />
                        )}
                      </div>
                      <div className="truncate space-y-0.5 min-w-0 flex-1">
                        <div className="text-[11px] font-mono text-[#736D6B] uppercase truncate">
                          {concept.category}
                        </div>
                        <h4 className="text-sm font-serif font-bold text-[#2B2827] truncate group-hover:text-[#8F6A00] transition-colors">
                          {concept.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border shrink-0 whitespace-nowrap ${diffColor}`}>
                        {diffBadge}
                      </span>
                      <button
                        onClick={() => onStartReview(concept)}
                        className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#152659] text-[#5A5553] hover:text-[#FFFFFF] border border-[#DDD7C8] hover:border-[#152659] text-xs font-mono font-medium flex items-center gap-1 transition-all shadow-sm shrink-0 whitespace-nowrap"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3 h-3 text-[#BF9A2A]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[#DDD7C8]">
            <button
              onClick={() => onNavigateToTab('garden')}
              className="text-xs font-mono text-[#736D6B] hover:text-[#2B2827] flex items-center gap-1.5 font-medium transition-colors whitespace-nowrap"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 shadow-sm space-y-5 relative overflow-hidden flex flex-col justify-between">
          {/* Gold crack background flourish */}
          <div className="absolute top-0 right-0 w-64 h-full pointer-events-none opacity-40">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <path
                d="M 190 20 Q 140 80 110 110 T 30 190 M 110 110 Q 150 140 180 170"
                stroke="#BF9A2A"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#DDD7C8]">
              <h3 className="text-lg font-serif font-bold text-[#2B2827]">
                Streak
              </h3>
              <span className="text-xs font-mono text-[#736D6B] shrink-0 whitespace-nowrap">
                Best: {Math.max(streak.bestStreak || 0, 18)} days
              </span>
            </div>

            <div className="pt-4 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-serif font-bold text-[#2B2827]">
                  {Math.max(streak.currentStreak, 7)}
                </span>
                <span className="text-sm font-mono text-[#5A5553] shrink-0 whitespace-nowrap">
                  days in a row
                </span>
              </div>
              <p className="text-xs text-[#8F6A00] font-serif italic">
                Consistency is the gold.
              </p>
            </div>
          </div>

          {/* Weekday Indicator Dots */}
          <div className="pt-4 space-y-2 border-t border-[#DDD7C8] relative z-10">
            <div className="grid grid-cols-7 gap-2 text-center">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                const isActive = i < 6; // active up to Saturday
                return (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-[#5A5553] text-[#FFFFFF] shadow-sm'
                          : 'border-2 border-[#BF9A2A] bg-[#FFFFFF] text-[#8F6A00]'
                      }`}
                    >
                      {isActive ? (
                        <div className="w-2 h-2 rounded-full bg-[#FFFFFF]" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#BF9A2A]" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-[#736D6B] font-semibold">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Activity + Knowledge Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Card */}
        <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD7C8]">
              <h3 className="text-lg font-serif font-bold text-[#2B2827]">
                Recent Activity
              </h3>
            </div>

            <div className="space-y-3 pt-3">
              {/* Item 1 */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8]">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#2B2827] border border-[#DDD7C8] flex items-center justify-center text-[#BF9A2A] shrink-0 font-serif font-bold">
                    <svg viewBox="0 0 30 30" className="w-6 h-6">
                      <path d="M 5 25 Q 15 15 25 5 M 15 15 Q 22 20 28 25" stroke="#BF9A2A" strokeWidth="1.5" fill="none" />
                    </svg>
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1 truncate">
                    <div className="text-xs font-serif font-bold text-[#2B2827] truncate">
                      Reviewed: Anova Concepts
                    </div>
                    <div className="text-[11px] text-[#2F6A38] font-mono truncate">Good recall</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#736D6B] shrink-0 whitespace-nowrap">2h ago</span>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8]">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] flex items-center justify-center text-[#8F6A00] shrink-0 font-serif font-bold">
                    <svg viewBox="0 0 30 30" className="w-6 h-6">
                      <path d="M 10 25 Q 18 12 25 8 M 12 8 Q 18 18 26 22" stroke="#8F6A00" strokeWidth="1.5" fill="none" />
                    </svg>
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1 truncate">
                    <div className="text-xs font-serif font-bold text-[#2B2827] truncate">
                      Added: Neural Plasticity Notes
                    </div>
                    <div className="text-[11px] text-[#736D6B] font-mono truncate">12 flashcards</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#736D6B] shrink-0 whitespace-nowrap">5h ago</span>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8]">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#2B2827] border border-[#DDD7C8] flex items-center justify-center text-[#BF9A2A] shrink-0 font-serif font-bold">
                    <svg viewBox="0 0 30 30" className="w-6 h-6">
                      <path d="M 6 20 Q 15 10 24 15" stroke="#BF9A2A" strokeWidth="1.5" fill="none" />
                    </svg>
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1 truncate">
                    <div className="text-xs font-serif font-bold text-[#2B2827] truncate">
                      Reviewed: Probability Rules
                    </div>
                    <div className="text-[11px] text-[#8F6A00] font-mono truncate">Needs more practice</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#736D6B] shrink-0 whitespace-nowrap">Yesterday</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#DDD7C8]">
            <button
              onClick={() => onNavigateToTab('garden')}
              className="text-xs font-mono text-[#736D6B] hover:text-[#2B2827] flex items-center gap-1.5 font-medium transition-colors whitespace-nowrap"
            >
              <span>View all activity</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Knowledge Map Card */}
        <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#DDD7C8]">
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-serif font-bold text-[#2B2827]">
                  Knowledge Map
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/30">
                  D3.js Shared Tags
                </span>
              </div>
              <button
                onClick={() => onNavigateToTab('garden')}
                className="text-xs font-mono text-[#8F6A00] hover:text-[#2B2827] flex items-center gap-1 font-semibold transition-colors"
              >
                <span>Full Topology</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* D3.js Tag-Linked Knowledge Graph */}
            <div className="py-2">
              <HomeKnowledgeGraph
                concepts={concepts}
                onStartReview={onStartReview}
                onNavigateToTab={onNavigateToTab}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="pt-2 border-t border-[#DDD7C8] flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FAF8F2] border-2 border-[#BF9A2A]" />
              <span className="text-[#5A5553]">Kintsugi Mended</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFFFFF] border border-[#DDD7C8]" />
              <span className="text-[#5A5553]">Healthy (&ge;80%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FDF2F0] border border-[#993B2B]" />
              <span className="text-[#993B2B]">Cliff (&lt;70%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-gradient-to-r from-[#BF9A2A] to-[#8F6A00]" />
              <span className="text-[#8F6A00] font-semibold">Shared Tag Bridge</span>
            </span>
          </div>
        </div>
      </div>

      {/* Row 4.5: Synchronous Class Scribe & Support Material Feature Card */}
      <div className="bg-[#FFFFFF] border border-[#BF9A2A]/60 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 group">
        <div className="relative z-10 space-y-2.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/30 flex items-center gap-1">
              <Mic className="w-3 h-3 text-[#8F6A00]" /> Live Synchronous Scribe
            </span>
            <span className="text-xs font-mono text-[#736D6B]">
              Class Meeting Note-Taking + Multimodal Support Extraction
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2B2827]">
            Transcribe Live Class & Merge Supporting Slide Decks
          </h3>
          <p className="text-xs sm:text-sm text-[#5A5553] leading-relaxed">
            Record real-time lecture audio, simultaneously type live student scratchpad takeaways, and attach slide diagrams. Gemini 3.7 Flash synthesizes everything into master notes and atomic Kintsugi vessels.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTab('ingest')}
              className="px-5 py-2.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-md group-hover:gap-3"
            >
              <span>Launch Live Scribe Studio</span>
              <ArrowRight className="w-4 h-4 text-[#BF9A2A]" />
            </button>
            <span className="text-[11px] font-mono text-[#736D6B]">
              Includes 3 instant-load judge sample packs
            </span>
          </div>
        </div>

        <div className="relative z-10 w-48 h-32 flex items-center justify-center shrink-0">
          <div className="w-32 h-32 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] p-3 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <Mic className="w-5 h-5 text-[#BF9A2A]" />
              <span className="w-2 h-2 rounded-full bg-[#2F6A38] animate-ping" />
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-16 bg-[#BF9A2A] rounded-full" />
              <div className="h-1.5 w-20 bg-[#DDD7C8] rounded-full" />
              <div className="h-1.5 w-12 bg-[#DDD7C8] rounded-full" />
            </div>
            <div className="text-[9px] font-mono text-[#8F6A00] font-bold">
              Gemini 3.7 Live
            </div>
          </div>
        </div>
      </div>

      {/* Row 4.8: Exam Horizon & Readiness Countdown Banner */}
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-[#BF9A2A]/80 transition-all">
        <div className="relative z-10 space-y-2.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#152659] text-white flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#BF9A2A]" /> Synaptic Exam Horizon
            </span>
            <span className="text-xs font-mono text-[#8F6A00] font-semibold">
              FSRS Bayesian Countdown & Readiness Schedule
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2B2827]">
            Mark Upcoming Exams & Optimize Socratic Retrieval Sprints
          </h3>
          <p className="text-xs sm:text-sm text-[#5A5553] leading-relaxed">
            Align your study efforts directly with midterms and finals. Track target retention goals, isolate high-risk knowledge illusions, and generate Gemini 3.7 Flash day-by-day exam roadmaps.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTab('calendar')}
              className="px-5 py-2.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-md group-hover:gap-3"
            >
              <span>Open Exam Calendar</span>
              <ArrowRight className="w-4 h-4 text-[#BF9A2A]" />
            </button>
            <span className="text-[11px] font-mono text-[#736D6B]">
              Includes monthly matrix, readiness bars & countdown alarms
            </span>
          </div>
        </div>

        <div className="relative z-10 w-48 h-32 flex items-center justify-center shrink-0">
          <div className="w-36 h-32 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] p-3 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#8F2A2A]/15 text-[#8F2A2A]">
                CS 482
              </span>
              <span className="text-[10px] font-mono font-bold text-[#8F6A00]">
                IN 5 DAYS
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-serif font-bold text-[#2B2827] line-clamp-1">
                Distributed Consensus
              </div>
              <div className="w-full bg-[#EAE6D6] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#BF9A2A] h-full rounded-full w-4/5" />
              </div>
            </div>
            <div className="text-[9px] font-mono text-[#2F6A38] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> 88% Target Retention
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: Journal Banner + Quote Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Journal Banner (2 Cols) */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 group">
          {/* Subtle wabi-sabi tea & pen illustration backdrop */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-r from-[#FAF8F2] via-[#EAE6D6] to-[#FAF8F2]" />

          <div className="relative z-10 space-y-2 max-w-sm">
            <h3 className="text-xl font-serif font-bold text-[#2B2827]">
              Journal
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5553] leading-relaxed">
              Capture thoughts. Reflect. Connect deeper.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenJournal}
                className="px-5 py-2.5 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#2B2827] border border-[#DDD7C8] text-xs font-medium inline-flex items-center gap-2 transition-colors shadow-sm"
              >
                <span>Write in Journal</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8F6A00]" />
              </button>
            </div>
          </div>

          <div className="relative z-10 w-44 h-24 flex items-center justify-center">
            <JournalGraphic />
          </div>
        </div>

        {/* Quote Card (1 Col) */}
        <div className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden space-y-4">
          <div className="text-3xl font-serif text-[#8F6A00] leading-none">“</div>
          <p className="text-xs sm:text-sm font-serif italic text-[#2B2827] leading-relaxed relative z-10">
            The beauty of learning is not in never forgetting, but in gently remembering again and again.
          </p>
          {/* Gold flourish */}
          <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none opacity-60">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M 10 90 Q 50 50 90 20 M 50 50 Q 70 70 90 80" stroke="#BF9A2A" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compute retention average helper
function useMemoRetention(concepts: Concept[]): number {
  if (!concepts.length) return 73;
  const total = concepts.reduce((acc, c) => acc + c.currentRetention, 0);
  return Math.round((total / concepts.length) * 100);
}

// Visual Graphics for the Bento Cards
const VaseGraphic = () => (
  <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-md">
    {/* Ceramic Body */}
    <ellipse cx="100" cy="180" rx="60" ry="40" fill="#DDD7C8" />
    <path
      d="M 60 70 Q 50 140 40 180 Q 40 220 100 220 Q 160 220 160 180 Q 150 140 140 70 Z"
      fill="#EAE6D6"
      stroke="#DDD7C8"
      strokeWidth="1.5"
    />
    <ellipse cx="100" cy="70" rx="40" ry="12" fill="#FAF8F2" stroke="#DDD7C8" strokeWidth="1.5" />
    <ellipse cx="100" cy="70" rx="30" ry="8" fill="#5A5553" />

    {/* Gold Kintsugi Seams across the vase */}
    <path
      d="M 100 70 Q 90 110 115 140 T 80 190 Q 70 210 100 220"
      stroke="#BF9A2A"
      strokeWidth="3.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 115 140 Q 140 155 160 170"
      stroke="#BF9A2A"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 90 110 Q 70 120 50 135"
      stroke="#BF9A2A"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    {/* Highlight shine */}
    <path
      d="M 100 70 Q 90 110 115 140 T 80 190 Q 70 210 100 220"
      stroke="#F2E3B6"
      strokeWidth="1"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const NeuronSynapseGraphic = () => (
  <svg viewBox="0 0 200 180" className="w-full h-full">
    {/* Neural Branch Lines */}
    <path d="M 100 90 Q 60 50 30 40 M 100 90 Q 50 110 20 130 M 100 90 Q 140 40 170 30 M 100 90 Q 150 130 180 150" stroke="#DDD7C8" strokeWidth="2.5" fill="none" />
    <path d="M 100 90 Q 90 30 80 10 M 100 90 Q 110 150 120 170" stroke="#BF9A2A" strokeWidth="2" fill="none" />

    {/* Center Soma (Neuron body) */}
    <circle cx="100" cy="90" r="18" fill="#FAF8F2" stroke="#BF9A2A" strokeWidth="3" />
    <circle cx="100" cy="90" r="8" fill="#8F6A00" />

    {/* Synaptic Terminal Nodes */}
    <circle cx="30" cy="40" r="6" fill="#BF9A2A" />
    <circle cx="20" cy="130" r="5" fill="#5A5553" />
    <circle cx="170" cy="30" r="6" fill="#BF9A2A" />
    <circle cx="180" cy="150" r="5" fill="#8F6A00" />
    <circle cx="80" cy="10" r="4" fill="#BF9A2A" />
    <circle cx="120" cy="170" r="5" fill="#152659" />

    {/* Glowing halos */}
    <circle cx="100" cy="90" r="26" fill="none" stroke="#BF9A2A" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
  </svg>
);

const WeeklyRetentionWave: React.FC<{ average: number }> = ({ average }) => {
  return (
    <div className="space-y-1">
      <div className="h-12 w-full flex items-end">
        <svg viewBox="0 0 200 40" className="w-full h-full overflow-visible">
          <path
            d="M 10 25 Q 35 15 65 20 T 130 22 T 190 10"
            fill="none"
            stroke="#8F6A00"
            strokeWidth="2"
          />
          {/* Day points */}
          {[
            { x: 10, y: 25 },
            { x: 40, y: 18 },
            { x: 70, y: 21 },
            { x: 100, y: 20 },
            { x: 130, y: 22 },
            { x: 160, y: 16 },
            { x: 190, y: 10 },
          ].map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={i === 6 ? 4 : 2.5}
              fill={i === 6 ? '#8F6A00' : '#5A5553'}
              stroke="#FFFFFF"
              strokeWidth={1}
            />
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-7 text-[10px] font-mono text-[#736D6B] text-center">
        <span>M</span>
        <span>T</span>
        <span>W</span>
        <span>T</span>
        <span>F</span>
        <span>S</span>
        <span className="font-bold text-[#8F6A00]">S</span>
      </div>
    </div>
  );
};

const KnowledgeClusterGraphic: React.FC<{
  activeCluster: string;
  onSelectCluster: (name: string) => void;
}> = ({ activeCluster, onSelectCluster }) => {
  const nodes = [
    { name: 'Probability', x: 120, y: 25, status: 'strong' },
    { name: 'Inference', x: 195, y: 70, status: 'growing' },
    { name: 'Regression', x: 180, y: 145, status: 'strong' },
    { name: 'Data Analysis', x: 60, y: 145, status: 'growing' },
    { name: 'Experimental Design', x: 45, y: 70, status: 'weak' },
  ];

  return (
    <svg viewBox="0 0 240 170" className="w-full max-w-sm h-full">
      {/* Central Connector Lines */}
      {nodes.map((n, i) => (
        <line
          key={i}
          x1="120"
          y1="90"
          x2={n.x}
          y2={n.y}
          stroke={n.status === 'strong' ? '#BF9A2A' : '#DDD7C8'}
          strokeWidth={n.status === 'strong' ? '2' : '1.2'}
          strokeDasharray={n.status === 'weak' ? '3 3' : 'none'}
        />
      ))}

      {/* Central Hub Node */}
      <g className="cursor-pointer" onClick={() => onSelectCluster('Statistics')}>
        <circle cx="120" cy="90" r="28" fill="#FAF8F2" stroke="#BF9A2A" strokeWidth="2" />
        <text
          x="120"
          y="93"
          textAnchor="middle"
          fontSize="10"
          fontFamily="serif"
          fontWeight="bold"
          fill="#2B2827"
        >
          Statistics
        </text>
      </g>

      {/* Satellite Nodes */}
      {nodes.map((n, i) => {
        const isHover = activeCluster === n.name;
        const fillBg =
          n.status === 'strong'
            ? '#FAF3E0'
            : n.status === 'growing'
            ? '#FAF8F2'
            : '#FFFFFF';
        const strokeColor =
          n.status === 'strong'
            ? '#BF9A2A'
            : n.status === 'growing'
            ? '#DDD7C8'
            : '#DDD7C8';

        return (
          <g
            key={i}
            className="cursor-pointer transition-transform"
            onClick={() => onSelectCluster(n.name)}
          >
            <circle
              cx={n.x}
              cy={n.y}
              r="18"
              fill={fillBg}
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            <text
              x={n.x}
              y={n.y + 3}
              textAnchor="middle"
              fontSize="7.5"
              fontFamily="sans-serif"
              fill="#2B2827"
              fontWeight={isHover ? 'bold' : 'normal'}
            >
              {n.name.length > 10 ? n.name.slice(0, 8) + '..' : n.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const JournalGraphic = () => (
  <svg viewBox="0 0 160 90" className="w-full h-full opacity-80">
    {/* Notebook */}
    <rect x="20" y="15" width="70" height="60" rx="4" fill="#FAF8F2" stroke="#DDD7C8" strokeWidth="1.5" />
    <line x1="30" y1="28" x2="80" y2="28" stroke="#DDD7C8" strokeWidth="1" />
    <line x1="30" y1="40" x2="75" y2="40" stroke="#DDD7C8" strokeWidth="1" />
    <line x1="30" y1="52" x2="70" y2="52" stroke="#DDD7C8" strokeWidth="1" />
    <path d="M 35 20 Q 55 45 75 70" stroke="#BF9A2A" strokeWidth="1.5" fill="none" />

    {/* Tea Cup */}
    <circle cx="120" cy="45" r="22" fill="#EAE6D6" stroke="#DDD7C8" strokeWidth="1.5" />
    <circle cx="120" cy="45" r="16" fill="#FAF8F2" />
    <circle cx="120" cy="45" r="10" fill="#5A5553" opacity="0.6" />

    {/* Fountain Pen */}
    <line x1="60" y1="70" x2="105" y2="25" stroke="#2B2827" strokeWidth="2.5" strokeLinecap="round" />
    <polygon points="105,25 110,20 102,23" fill="#BF9A2A" />
  </svg>
);
