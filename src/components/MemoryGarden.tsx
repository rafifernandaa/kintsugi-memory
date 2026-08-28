import React, { useState, useMemo } from 'react';
import { Concept } from '../types';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Flame,
  Zap,
  Layers,
  Share2,
  LayoutGrid,
  Search,
  ChevronDown,
  ChevronRight,
  Brain,
  Cpu,
  Network,
  Database,
  BookOpen,
  FolderTree,
  Folder,
  SlidersHorizontal,
  X,
  TrendingDown,
  LineChart,
  Tag,
} from 'lucide-react';
import { playGoldenKintsugiChime } from '../lib/audio';
import { KintsugiOverlay } from './KintsugiOverlay';
import { SynapticForceGraph } from './SynapticForceGraph';
import { FutureDecayProjection } from './FutureDecayProjection';

interface MemoryGardenProps {
  concepts: Concept[];
  timeWarpDays: number;
  onSelectConceptForReview: (concept: Concept) => void;
  onInspectOracle: (concept: Concept) => void;
  onFastForwardDecay: (days: number) => void;
}

// Category Domain metadata helper using exact Garden Cluster & Main App palettes
function getCategoryMeta(category?: string) {
  const cat = (category || '').toLowerCase();
  if (
    cat.includes('bio') ||
    cat.includes('neuro') ||
    cat.includes('cognit') ||
    cat.includes('brain') ||
    cat.includes('psych')
  ) {
    return {
      icon: Brain,
      color: 'text-[#2F6A38]',
      bg: 'bg-[#F0F7F1]',
      border: 'border-[#BFE0C4]',
      badgeBg: 'bg-[#F0F7F1] text-[#2F6A38] border border-[#BFE0C4]',
      tagColor: 'text-[#2F6A38] bg-[#F0F7F1] border-[#BFE0C4]',
      gradient: 'from-[#FFFFFF] via-[#FAF8F2] to-[#FAF8F2]',
      accentGlow: 'shadow-[#2F6A38]/10',
      label: category || 'Biology & Neuroscience',
    };
  }
  if (
    cat.includes('machine') ||
    cat.includes('ml') ||
    cat.includes('ai') ||
    cat.includes('learn') ||
    cat.includes('transformer') ||
    cat.includes('deep')
  ) {
    return {
      icon: Cpu,
      color: 'text-[#152659]',
      bg: 'bg-[#EBF0FA]',
      border: 'border-[#BDCCEB]',
      badgeBg: 'bg-[#EBF0FA] text-[#152659] border border-[#BDCCEB]',
      tagColor: 'text-[#152659] bg-[#EBF0FA] border-[#BDCCEB]',
      gradient: 'from-[#FFFFFF] via-[#FAF8F2] to-[#FAF8F2]',
      accentGlow: 'shadow-[#152659]/10',
      label: category || 'Machine Learning & AI',
    };
  }
  if (
    cat.includes('distribut') ||
    cat.includes('system') ||
    cat.includes('network') ||
    cat.includes('cloud') ||
    cat.includes('consensus') ||
    cat.includes('computer')
  ) {
    return {
      icon: Network,
      color: 'text-[#8F6A00]',
      bg: 'bg-[#FAF3E0]',
      border: 'border-[#E8D4A2]',
      badgeBg: 'bg-[#FAF3E0] text-[#8F6A00] border border-[#E8D4A2]',
      tagColor: 'text-[#8F6A00] bg-[#FAF3E0] border-[#E8D4A2]',
      gradient: 'from-[#FFFFFF] via-[#FAF8F2] to-[#FAF8F2]',
      accentGlow: 'shadow-[#8F6A00]/10',
      label: category || 'Distributed Systems',
    };
  }
  if (
    cat.includes('database') ||
    cat.includes('storage') ||
    cat.includes('engine') ||
    cat.includes('sql') ||
    cat.includes('lock')
  ) {
    return {
      icon: Database,
      color: 'text-[#3E518C]',
      bg: 'bg-[#F0F3F9]',
      border: 'border-[#CAD3E8]',
      badgeBg: 'bg-[#F0F3F9] text-[#3E518C] border border-[#CAD3E8]',
      tagColor: 'text-[#3E518C] bg-[#F0F3F9] border-[#CAD3E8]',
      gradient: 'from-[#FFFFFF] via-[#FAF8F2] to-[#FAF8F2]',
      accentGlow: 'shadow-[#3E518C]/10',
      label: category || 'Database Engines & Storage',
    };
  }
  return {
    icon: BookOpen,
    color: 'text-[#5A5553]',
    bg: 'bg-[#FAF8F2]',
    border: 'border-[#DDD7C8]',
    badgeBg: 'bg-[#FAF8F2] text-[#5A5553] border border-[#DDD7C8]',
    tagColor: 'text-[#5A5553] bg-[#FAF8F2] border-[#DDD7C8]',
    gradient: 'from-[#FFFFFF] via-[#FAF8F2] to-[#FAF8F2]',
    accentGlow: 'shadow-[#5A5553]/10',
    label: category || 'General Knowledge',
  };
}

export const MemoryGarden: React.FC<MemoryGardenProps> = ({
  concepts,
  timeWarpDays,
  onSelectConceptForReview,
  onInspectOracle,
  onFastForwardDecay,
}) => {
  const [viewMode, setViewMode] = useState<'clustered' | 'flat' | 'network' | 'trajectory'>('clustered');
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical' | 'golden' | 'healthy'>('all');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [collapsedClusters, setCollapsedClusters] = useState<Record<string, boolean>>({});

  const toggleClusterCollapse = (clusterName: string) => {
    setCollapsedClusters((prev) => ({
      ...prev,
      [clusterName]: !prev[clusterName],
    }));
  };

  // Extract all unique tags across concepts
  const allTags = useMemo(() => {
    const set = new Set<string>();
    concepts.forEach((c) => {
      if (c && c.tags) {
        c.tags.forEach((t) => t && set.add(t));
      }
    });
    return Array.from(set);
  }, [concepts]);

  // Group concepts into subject/domain clusters
  const clusters = useMemo(() => {
    const map = new Map<string, Concept[]>();
    concepts.forEach((c) => {
      if (!c) return;
      const cat = c.category || 'General Knowledge';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(c);
    });

    return Array.from(map.entries())
      .map(([name, items]) => {
        const criticalCount = items.filter((c) => (c.currentRetention ?? 0.95) < 0.70).length;
        const goldenCount = items.filter((c) => (c.kintsugiRepairs ?? 0) > 0).length;
        const avgRet = items.length
          ? Math.round((items.reduce((acc, c) => acc + (c.currentRetention ?? 0.95), 0) / items.length) * 100)
          : 0;
        const avgStability = items.length
          ? (items.reduce((acc, c) => acc + (c.stability ?? 1), 0) / items.length).toFixed(1)
          : '0';

        return {
          name,
          items,
          criticalCount,
          goldenCount,
          avgRet,
          avgStability,
          meta: getCategoryMeta(name),
        };
      })
      .sort((a, b) => {
        if (a.criticalCount !== b.criticalCount) {
          return b.criticalCount - a.criticalCount;
        }
        return b.items.length - a.items.length;
      });
  }, [concepts]);

  // Filter concepts based on search, tags, status filter, and selected cluster
  const filterConcept = (c: Concept): boolean => {
    if (!c) return false;
    const ret = c.currentRetention ?? 0.95;
    const repairs = c.kintsugiRepairs ?? 0;

    if (statusFilter === 'critical' && ret >= 0.70) return false;
    if (statusFilter === 'golden' && repairs === 0) return false;
    if (statusFilter === 'healthy' && ret < 0.75) return false;

    if (selectedTag) {
      const tagLower = selectedTag.toLowerCase();
      const hasTag = c.tags?.some((t) => t && t.toLowerCase() === tagLower);
      const hasCat = (c.category || '').toLowerCase().includes(tagLower);
      if (!hasTag && !hasCat) return false;
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (c.title || '').toLowerCase().includes(q);
      const matchSummary = (c.summary || '').toLowerCase().includes(q);
      const matchCategory = (c.category || '').toLowerCase().includes(q);
      const matchTags = c.tags?.some((t) => t && t.toLowerCase().includes(q));
      const matchMechanisms = c.keyMechanisms?.some((m) => m && m.toLowerCase().includes(q));
      if (!matchTitle && !matchSummary && !matchCategory && !matchTags && !matchMechanisms) {
        return false;
      }
    }

    return true;
  };

  const filteredClusters = useMemo(() => {
    return clusters
      .filter((cl) => {
        if (selectedClusterFilter !== 'all' && cl.name !== selectedClusterFilter) {
          return false;
        }
        return true;
      })
      .map((cl) => ({
        ...cl,
        filteredItems: cl.items.filter(filterConcept),
      }))
      .filter((cl) => cl.filteredItems.length > 0 || (!searchQuery.trim() && !selectedTag));
  }, [clusters, selectedClusterFilter, statusFilter, searchQuery, selectedTag]);

  const criticalCount = concepts.filter((c) => (c?.currentRetention ?? 0.95) < 0.70).length;
  const goldenCount = concepts.filter((c) => (c?.kintsugiRepairs ?? 0) > 0).length;
  const avgRetention = concepts.length
    ? Math.round((concepts.reduce((acc, c) => acc + (c?.currentRetention ?? 0.95), 0) / concepts.length) * 100)
    : 0;

  // Render individual concept ceramic card with chosen palette
  const renderConceptCard = (concept: Concept) => {
    if (!concept) return null;
    const retPct = Math.round((concept.currentRetention ?? 0.95) * 100);
    const isCliff = (concept.currentRetention ?? 0.95) < 0.70;
    const isGolden = (concept.kintsugiRepairs ?? 0) > 0;
    const lowPct = Math.round((concept.confidenceLow ?? 0.75) * 100);
    const highPct = Math.round((concept.confidenceHigh ?? 0.98) * 100);
    const catMeta = getCategoryMeta(concept.category);

    return (
      <div
        key={concept.id}
        className={`rounded-2xl border transition-all duration-300 p-5 space-y-4 relative overflow-hidden bg-[#FFFFFF] flex flex-col justify-between shadow-sm hover:shadow-md ${
          isCliff
            ? 'border-[#F2C0B8] ring-2 ring-[#993B2B]/20'
            : isGolden
            ? 'border-[#BF9A2A]/50 ring-1 ring-[#BF9A2A]/30'
            : 'border-[#DDD7C8] hover:border-[#736D6B]'
        }`}
      >
        {isGolden && (
          <KintsugiOverlay
            repairs={concept.kintsugiRepairs}
            intensity={concept.kintsugiRepairs >= 3 ? 'radiant' : 'vibrant'}
          />
        )}

        <div className="space-y-3 relative z-20">
          {/* Vessel Art & Status Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border flex items-center gap-1 font-semibold ${catMeta.tagColor}`}
                >
                  <catMeta.icon className="w-2.5 h-2.5" />
                  {concept.category}
                </span>
                {isGolden && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/40 flex items-center gap-1 font-bold shadow-sm">
                    <Sparkles className="w-3 h-3 text-[#BF9A2A] animate-pulse" />{' '}
                    {concept.kintsugiRepairs}x Mended
                  </span>
                )}
                {isCliff && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FDF2F0] text-[#993B2B] border border-[#F2C0B8] flex items-center gap-1 font-bold animate-pulse">
                    <AlertTriangle className="w-3 h-3 text-[#993B2B]" /> Forgetting Cliff
                  </span>
                )}
              </div>
              <h3 className="text-base font-serif font-bold text-[#2B2827] leading-snug pt-1">
                {concept.title}
              </h3>
            </div>

            {/* Ceramic Vessel Graphical Icon */}
            <div className="relative w-13 h-13 shrink-0 flex items-center justify-center rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] shadow-inner p-1.5">
              <svg viewBox="0 0 100 100" className="w-10 h-10 overflow-visible">
                <defs>
                  <linearGradient
                    id={`bowl-gold-${concept.id}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#A66D03" />
                    <stop offset="50%" stopColor="#F2E3B6" />
                    <stop offset="100%" stopColor="#BF9A2A" />
                  </linearGradient>
                </defs>
                {/* Ceramic Bowl Body */}
                <path
                  d="M 20 30 Q 50 20 80 30 Q 85 75 50 85 Q 15 75 20 30 Z"
                  fill={isGolden ? '#FAF8F2' : '#FFFFFF'}
                  stroke={isCliff ? '#993B2B' : isGolden ? '#BF9A2A' : '#A6A09B'}
                  strokeWidth="3.5"
                />
                {/* Raw Fractures */}
                {isCliff && (
                  <path
                    d="M 50 30 L 45 50 L 55 65 L 48 80"
                    stroke="#993B2B"
                    strokeWidth="2"
                    strokeDasharray="2,2"
                    fill="none"
                  />
                )}
                {/* Mended Golden Lacquer Faults (Kintsugi) */}
                {isGolden && (
                  <>
                    <path
                      d="M 35 32 Q 52 52 46 68 Q 58 58 68 76"
                      stroke={`url(#bowl-gold-${concept.id})`}
                      strokeWidth={concept.kintsugiRepairs >= 3 ? '3.6' : '2.8'}
                      strokeLinecap="round"
                      fill="none"
                    />
                    {concept.kintsugiRepairs >= 2 && (
                      <path
                        d="M 52 52 Q 68 40 76 33 M 46 68 Q 30 72 24 65"
                        stroke="#BF9A2A"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        fill="none"
                      />
                    )}
                    <circle cx="52" cy="52" r="2.5" fill="#BF9A2A" />
                  </>
                )}
              </svg>
              {isGolden && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#BF9A2A] rounded-full animate-ping opacity-75" />
              )}
            </div>
          </div>

          {/* Summary Description */}
          <p className="text-xs text-[#5A5553] leading-relaxed line-clamp-2">{concept.summary}</p>

          {/* Key Mechanisms Chips */}
          {concept.keyMechanisms && concept.keyMechanisms.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {concept.keyMechanisms.slice(0, 2).map((mech, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F2] text-[#5A5553] border border-[#DDD7C8] truncate max-w-full"
                >
                  ⚡ {mech}
                </span>
              ))}
            </div>
          )}

          {/* Tags */}
          {concept.tags && concept.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {concept.tags.map((tag) => {
                const isTagSelected = selectedTag?.toLowerCase() === tag.toLowerCase() ||
                  (searchQuery.trim() && tag.toLowerCase().includes(searchQuery.toLowerCase().trim()));
                return (
                  <button
                    key={tag}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTag(selectedTag === tag ? null : tag);
                    }}
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                      isTagSelected
                        ? 'bg-[#BF9A2A]/20 text-[#8F6A00] border border-[#BF9A2A]/60 font-bold'
                        : 'bg-[#FFFFFF] text-[#736D6B] hover:text-[#2B2827] border border-[#DDD7C8]'
                    }`}
                    title={`Filter by #${tag}`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          )}

          {/* Bayesian Retention Bar with Confidence Interval */}
          <div className="space-y-1.5 bg-[#FAF8F2] p-3 rounded-xl border border-[#DDD7C8]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5A5553] flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#736D6B]" /> Retention Probability
              </span>
              <span className="font-mono font-bold text-[#2B2827]">
                {retPct}%{' '}
                <span className="text-[#736D6B] text-[11px] font-normal">
                  [{lowPct}–{highPct}%]
                </span>
              </span>
            </div>

            {/* Progress Visualizer */}
            <div className="relative w-full h-2.5 bg-[#EAE6D6] rounded-full overflow-hidden">
              <div
                className="absolute top-0 bottom-0 bg-[#DDD7C8] rounded-full"
                style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
              />
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isCliff
                    ? 'bg-gradient-to-r from-[#993B2B] to-[#BF9A2A]'
                    : isGolden
                    ? 'bg-gradient-to-r from-[#8F6A00] to-[#BF9A2A]'
                    : 'bg-gradient-to-r from-[#152659] to-[#3E518C]'
                }`}
                style={{ width: `${retPct}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-[#993B2B] z-10"
                style={{ left: '70%' }}
                title="70% Forgetting Cliff Threshold"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#736D6B] pt-0.5">
              <span>Stability S: {concept.stability}d</span>
              <span>Difficulty D: {concept.difficulty}/10</span>
              <span>Reviewed: {concept.reviewCount}x</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 gap-2 border-t border-[#DDD7C8] mt-3 relative z-20">
          <button
            onClick={() => onInspectOracle(concept)}
            className="px-3 py-1.5 rounded-xl text-xs text-[#5A5553] hover:text-[#2B2827] bg-[#FAF8F2] hover:bg-[#EAE6D6] border border-[#DDD7C8] transition-colors flex items-center gap-1.5 font-mono shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-[#736D6B]" /> Curve
          </button>

          <button
            onClick={() => {
              playGoldenKintsugiChime();
              onSelectConceptForReview(concept);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm font-mono ${
              isCliff
                ? 'bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] shadow-md'
                : 'bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF]'
            }`}
          >
            {isCliff ? (
              <Zap className="w-3.5 h-3.5 text-[#BF9A2A] fill-[#BF9A2A]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#BF9A2A]" />
            )}
            {isCliff ? 'Mend Cliff' : 'Forced Retrieval'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Garden Ambient Summary Banner */}
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-5 md:p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#BF9A2A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif uppercase tracking-widest text-[#8F6A00] font-semibold">
                Wabi-Sabi Memory Sanctuary
              </span>
              <span className="text-xs text-[#736D6B]">•</span>
              <span className="text-xs text-[#5A5553] font-mono">
                {timeWarpDays === 0
                  ? 'Real-time timeline'
                  : `+${timeWarpDays.toFixed(1)} Days Time-Warp Active`}
              </span>
            </div>
            <h2 className="text-2xl font-serif text-[#2B2827] font-bold tracking-tight flex items-center gap-2">
              <span>Synaptic Vessel Garden</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/40 font-bold">
                {clusters.length} Subject Clusters • {concepts.length} Vessels
              </span>
            </h2>
            <p className="text-xs text-[#5A5553] max-w-xl">
              Memories are clustered into curated domain gardens. As time elapses, hairline
              fractures form. Repairing them at the 70% forgetting cliff fills the cracks with gold
              (Kintsugi), multiplying biological stability.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 bg-[#FAF8F2] border border-[#DDD7C8] rounded-2xl p-2.5 shrink-0 shadow-sm">
            <div className="text-center px-3 border-r border-[#DDD7C8]">
              <div className="text-lg font-bold font-mono text-[#8F6A00]">{avgRetention}%</div>
              <div className="text-[10px] text-[#736D6B] uppercase tracking-wider font-semibold">
                Sanctuary Avg
              </div>
            </div>
            <div className="text-center px-3 border-r border-[#DDD7C8]">
              <div
                className={`text-lg font-bold font-mono ${
                  criticalCount > 0 ? 'text-[#993B2B]' : 'text-[#2F6A38]'
                }`}
              >
                {criticalCount}
              </div>
              <div className="text-[10px] text-[#736D6B] uppercase tracking-wider font-semibold">
                At Cliff (&lt;70%)
              </div>
            </div>
            <div className="text-center px-3">
              <div className="text-lg font-bold font-mono text-[#8F6A00] flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#BF9A2A]" /> {goldenCount}
              </div>
              <div className="text-[10px] text-[#736D6B] uppercase tracking-wider font-semibold">
                Golden Mended
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher, Search Bar, and Filter Controls */}
        <div className="mt-5 pt-4 border-t border-[#DDD7C8] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: View Mode Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[#FAF8F2] p-1 rounded-xl border border-[#DDD7C8] text-xs">
              <button
                onClick={() => setViewMode('clustered')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-mono ${
                  viewMode === 'clustered'
                    ? 'bg-[#152659] text-[#FFFFFF] font-bold shadow-sm'
                    : 'text-[#5A5553] hover:text-[#2B2827]'
                }`}
                title="View grouped by subject/domain clusters"
              >
                <FolderTree className="w-3.5 h-3.5 text-[#BF9A2A]" /> Clustered Terraces
              </button>
              <button
                onClick={() => setViewMode('trajectory')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-mono ${
                  viewMode === 'trajectory'
                    ? 'bg-[#152659] text-[#FFFFFF] font-bold shadow-sm'
                    : 'text-[#5A5553] hover:text-[#2B2827]'
                }`}
                title="Project 30-day future decay curves with dotted path trajectories"
              >
                <TrendingDown className="w-3.5 h-3.5 text-[#BF9A2A]" /> 30d Trajectory
              </button>
              <button
                onClick={() => setViewMode('flat')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-mono ${
                  viewMode === 'flat'
                    ? 'bg-[#152659] text-[#FFFFFF] font-bold shadow-sm'
                    : 'text-[#5A5553] hover:text-[#2B2827]'
                }`}
                title="View all vessels in single matrix grid"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#BF9A2A]" /> All Vessels
              </button>
              <button
                onClick={() => setViewMode('network')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-mono ${
                  viewMode === 'network'
                    ? 'bg-[#152659] text-[#FFFFFF] font-bold shadow-sm'
                    : 'text-[#5A5553] hover:text-[#2B2827]'
                }`}
                title="Interactive D3 force-directed neural graph"
              >
                <Share2 className="w-3.5 h-3.5 text-[#BF9A2A]" /> D3 Force Graph
              </button>
            </div>

            {/* Quick Status Filter Pills */}
            {viewMode !== 'network' && viewMode !== 'trajectory' && (
              <div className="flex items-center gap-1.5 bg-[#FAF8F2] p-1 rounded-xl border border-[#DDD7C8] text-xs">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all font-mono text-[11px] ${
                    statusFilter === 'all'
                      ? 'bg-[#152659] text-[#FFFFFF] font-semibold'
                      : 'text-[#736D6B] hover:text-[#2B2827]'
                  }`}
                >
                  All ({concepts.length})
                </button>
                <button
                  onClick={() => setStatusFilter('critical')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all font-mono text-[11px] ${
                    statusFilter === 'critical'
                      ? 'bg-[#993B2B] text-[#FFFFFF] font-semibold'
                      : 'text-[#736D6B] hover:text-[#993B2B]'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 text-[#993B2B]" /> Cliffs ({criticalCount})
                </button>
                <button
                  onClick={() => setStatusFilter('golden')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all font-mono text-[11px] ${
                    statusFilter === 'golden'
                      ? 'bg-[#BF9A2A] text-[#2B2827] font-bold'
                      : 'text-[#736D6B] hover:text-[#8F6A00]'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-[#BF9A2A]" /> Kintsugi ({goldenCount})
                </button>
                <button
                  onClick={() => setStatusFilter('healthy')}
                  className={`px-2.5 py-1 rounded-lg transition-all font-mono text-[11px] ${
                    statusFilter === 'healthy'
                      ? 'bg-[#2F6A38] text-[#FFFFFF] font-semibold'
                      : 'text-[#736D6B] hover:text-[#2F6A38]'
                  }`}
                >
                  Healthy
                </button>
              </div>
            )}
          </div>

          {/* Right: Search & Fast Forward Time */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {viewMode !== 'network' && viewMode !== 'trajectory' && (
              <div className="relative flex-1 sm:w-64 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-[#736D6B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, tags, or mechanisms..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs font-mono bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl text-[#2B2827] placeholder-[#736D6B] focus:outline-none focus:border-[#BF9A2A]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#736D6B] hover:text-[#2B2827]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Time Warp Fast Actions */}
            <div className="flex items-center gap-1.5 text-xs bg-[#FAF8F2] px-2.5 py-1 rounded-xl border border-[#DDD7C8]">
              <span className="text-[#736D6B] font-mono text-[10px] hidden sm:inline">
                Time-Warp:
              </span>
              <button
                onClick={() => onFastForwardDecay(1)}
                className="px-2 py-0.5 rounded-lg bg-[#FFFFFF] hover:bg-[#EAE6D6] text-[#2B2827] border border-[#DDD7C8] transition-colors font-mono text-[11px] font-semibold shadow-sm"
                title="Fast forward 1 day of biological forgetting"
              >
                +1d
              </button>
              <button
                onClick={() => onFastForwardDecay(3)}
                className="px-2 py-0.5 rounded-lg bg-[#FDF2F0] hover:bg-[#FBE8E4] text-[#993B2B] border border-[#F2C0B8] transition-colors font-mono text-[11px] font-bold shadow-sm"
                title="Fast forward 3 days of biological forgetting"
              >
                +3d (Cliff)
              </button>
              {timeWarpDays > 0 && (
                <button
                  onClick={() => onFastForwardDecay(-timeWarpDays)}
                  className="px-1.5 py-0.5 text-[#8F6A00] hover:underline font-mono text-[10px] font-bold"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cluster Pills Bar */}
        {viewMode !== 'network' && viewMode !== 'trajectory' && clusters.length > 1 && (
          <div className="mt-4 pt-3 border-t border-[#DDD7C8] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] font-mono text-[#736D6B] uppercase shrink-0 flex items-center gap-1 font-semibold">
              <Folder className="w-3 h-3 text-[#BF9A2A]" />
              Clusters:
            </span>

            <button
              onClick={() => setSelectedClusterFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-mono transition-all shrink-0 flex items-center gap-1.5 ${
                selectedClusterFilter === 'all'
                  ? 'bg-[#152659] text-[#FFFFFF] font-bold shadow-sm'
                  : 'bg-[#FAF8F2] text-[#5A5553] hover:text-[#2B2827] border border-[#DDD7C8]'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] opacity-80">({concepts.length})</span>
            </button>

            {clusters.map((cluster) => {
              const Icon = cluster.meta.icon;
              const isSelected = selectedClusterFilter === cluster.name;
              return (
                <button
                  key={cluster.name}
                  onClick={() => setSelectedClusterFilter(cluster.name)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono transition-all shrink-0 flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#152659] text-[#FFFFFF] font-bold border-[#152659] shadow-sm'
                      : `bg-[#FAF8F2] text-[#5A5553] hover:text-[#2B2827] border-[#DDD7C8] hover:border-[#736D6B]`
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F2E3B6]' : cluster.meta.color}`} />
                  <span>{cluster.name}</span>
                  <span className="text-[10px] opacity-80">({cluster.items.length})</span>
                  {cluster.criticalCount > 0 && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-[#F2E3B6]' : 'bg-[#993B2B]'
                      } animate-pulse`}
                      title={`${cluster.criticalCount} concept(s) at forgetting cliff`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Tag Filter Pills Bar */}
        {viewMode !== 'network' && viewMode !== 'trajectory' && allTags.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-[#DDD7C8]/70 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] font-mono text-[#736D6B] uppercase shrink-0 flex items-center gap-1 font-semibold pr-1">
              <Tag className="w-3 h-3 text-[#BF9A2A]" />
              Tags:
            </span>

            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono transition-all shrink-0 ${
                selectedTag === null
                  ? 'bg-[#152659] text-[#FFFFFF] font-bold shadow-sm'
                  : 'bg-[#FAF8F2] text-[#5A5553] hover:text-[#2B2827] border border-[#DDD7C8]'
              }`}
            >
              All Tags
            </button>

            {allTags.map((tag) => {
              const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-[#BF9A2A] text-[#2B2827] font-bold border-[#BF9A2A] shadow-sm'
                      : 'bg-[#FAF8F2] text-[#5A5553] hover:text-[#2B2827] border-[#DDD7C8] hover:border-[#BF9A2A]'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}

            {(searchQuery.trim() || selectedTag) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                }}
                className="ml-auto px-2 py-0.5 text-[10px] font-mono text-[#993B2B] hover:underline font-bold shrink-0"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Garden Workspace */}
      {viewMode === 'trajectory' ? (
        <FutureDecayProjection
          concepts={concepts}
          onSelectConceptForReview={onSelectConceptForReview}
          onInspectOracle={onInspectOracle}
        />
      ) : viewMode === 'network' ? (
        <SynapticForceGraph
          concepts={concepts}
          onSelectConcept={onSelectConceptForReview}
          onInspectOracle={onInspectOracle}
        />
      ) : viewMode === 'clustered' ? (
        <div className="space-y-8">
          {filteredClusters.length > 0 ? (
            filteredClusters.map((cluster) => {
              const Icon = cluster.meta.icon;
              const isCollapsed = collapsedClusters[cluster.name];
              const criticalInCluster = cluster.items.filter((c) => c.currentRetention < 0.70);

              return (
                <section
                  key={cluster.name}
                  className={`rounded-3xl border ${cluster.meta.border} bg-[#FFFFFF] p-5 sm:p-6 shadow-sm space-y-4 transition-all duration-300 relative overflow-hidden`}
                >
                  {/* Cluster Pavilion Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 pb-2 border-b border-[#DDD7C8]">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-2xl ${cluster.meta.bg} border ${cluster.meta.border} shrink-0`}
                      >
                        <Icon className={`w-5 h-5 ${cluster.meta.color}`} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#2B2827]">
                            {cluster.name}
                          </h3>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${cluster.meta.badgeBg}`}
                          >
                            {cluster.items.length} Vessel{cluster.items.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-xs text-[#736D6B] font-mono flex items-center gap-2 pt-0.5">
                          <span>Avg Retention: <strong className="text-[#2B2827]">{cluster.avgRet}%</strong></span>
                          <span>•</span>
                          <span>Avg Stability: <strong className="text-[#2B2827]">{cluster.avgStability}d</strong></span>
                        </p>
                      </div>
                    </div>

                    {/* Cluster Level Quick Actions & Collapse Toggle */}
                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                      <button
                        onClick={() => setViewMode('trajectory')}
                        className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#8F6A00] border border-[#DDD7C8] text-xs font-mono flex items-center gap-1.5 transition-colors shadow-sm"
                        title={`View 30-day future decay curves for ${cluster.name}`}
                      >
                        <TrendingDown className="w-3.5 h-3.5 text-[#8F6A00]" />
                        <span className="hidden sm:inline">30d</span> Trajectory
                      </button>

                      {criticalInCluster.length > 0 && (
                        <button
                          onClick={() => {
                            playGoldenKintsugiChime();
                            onSelectConceptForReview(criticalInCluster[0]);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] font-bold font-mono text-xs flex items-center gap-1.5 shadow-sm"
                          title="Immediately start Socratic review on first critical vessel in this cluster"
                        >
                          <Zap className="w-3.5 h-3.5 fill-[#BF9A2A] text-[#BF9A2A]" />
                          <span>Mend {criticalInCluster.length} Critical</span>
                        </button>
                      )}

                      <button
                        onClick={() => toggleClusterCollapse(cluster.name)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] hover:text-[#2B2827] border border-[#DDD7C8] text-xs font-mono flex items-center gap-1 transition-colors shadow-sm"
                        title={isCollapsed ? 'Expand cluster pavilion' : 'Collapse cluster pavilion'}
                      >
                        {isCollapsed ? (
                          <>
                            <span>Expand</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>Fold</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Clustered Vessel Matrix */}
                  {!isCollapsed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-1">
                      {cluster.filteredItems.map((concept) => renderConceptCard(concept))}
                    </div>
                  )}

                  {!isCollapsed && cluster.filteredItems.length === 0 && (
                    <div className="p-6 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] text-center space-y-1">
                      <p className="text-xs font-mono text-[#5A5553]">
                        No vessels match the current search or status filter in this cluster.
                      </p>
                      <button
                        onClick={() => {
                          setStatusFilter('all');
                          setSearchQuery('');
                        }}
                        className="text-xs font-mono text-[#8F6A00] hover:underline pt-1 inline-block font-semibold"
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </section>
              );
            })
          ) : (
            <div className="p-8 rounded-3xl bg-[#FFFFFF] border border-[#DDD7C8] text-center space-y-2 shadow-sm">
              <BookOpen className="w-8 h-8 text-[#736D6B] mx-auto" />
              <h4 className="text-base font-serif font-bold text-[#2B2827]">
                No matching memory vessels found
              </h4>
              <p className="text-xs text-[#5A5553] max-w-sm mx-auto">
                Try adjusting your search query or selected domain cluster to explore more materials.
              </p>
              <button
                onClick={() => {
                  setSelectedClusterFilter('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#152659] text-[#FFFFFF] text-xs font-mono font-bold hover:bg-[#1E357A] transition-colors inline-block mt-2 shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {concepts.filter(filterConcept).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {concepts.filter(filterConcept).map((concept) => renderConceptCard(concept))}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-[#FFFFFF] border border-[#DDD7C8] text-center space-y-2 shadow-sm">
              <BookOpen className="w-8 h-8 text-[#736D6B] mx-auto" />
              <h4 className="text-base font-serif font-bold text-[#2B2827]">
                No matching memory vessels found
              </h4>
              <p className="text-xs text-[#5A5553] max-w-sm mx-auto">
                Try adjusting your search query or status filter to find vessels.
              </p>
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                  setSelectedTag(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#152659] text-[#FFFFFF] text-xs font-mono font-bold hover:bg-[#1E357A] transition-colors inline-block mt-2 shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
