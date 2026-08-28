import React, { useState, useMemo } from 'react';
import { Concept } from '../types';
import { calculateRetention, FSRS_FACTOR, DECAY_POWER } from '../lib/fsrs';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Zap,
  Calendar,
  Layers,
  CheckSquare,
  Square,
  RotateCcw,
  Sliders,
  ArrowRight,
  Info,
  Clock,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { playGoldenKintsugiChime } from '../lib/audio';

interface FutureDecayProjectionProps {
  concepts: Concept[];
  onSelectConceptForReview: (concept: Concept) => void;
  onInspectOracle?: (concept: Concept) => void;
}

// Distinct high-contrast palette mapped to the user's custom color schemes
const CONCEPT_COLORS = [
  '#BF8F54', // Warm Bronze Gold
  '#C2D1FF', // Glow Periwinkle
  '#C0D9A0', // Sage Green
  '#6476AE', // Slate Blue
  '#A66D03', // Antique Gold
  '#CBD5F2', // Lavender Blue
  '#F2E3B6', // Champagne Gold
  '#7A8CBF', // Steel Blue
];

export const FutureDecayProjection: React.FC<FutureDecayProjectionProps> = ({
  concepts,
  onSelectConceptForReview,
  onInspectOracle,
}) => {
  const sortedConcepts = useMemo(() => {
    return [...concepts].sort((a, b) => a.currentRetention - b.currentRetention);
  }, [concepts]);

  const [selectedConceptIds, setSelectedConceptIds] = useState<string[]>(() => {
    return sortedConcepts.slice(0, 3).map((c) => c.id);
  });

  const [simulateMendToday, setSimulateMendToday] = useState<boolean>(false);
  const [timeHorizonDays, setTimeHorizonDays] = useState<number>(30);
  const [hoveredConceptId, setHoveredConceptId] = useState<string | null>(null);

  const toggleConceptSelection = (id: string) => {
    setSelectedConceptIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const selectPreset = (preset: 'cliff' | 'top3' | 'all' | 'ml' | 'bio' | 'systems') => {
    if (preset === 'cliff') {
      const cliff = concepts.filter((c) => c.currentRetention < 0.70).map((c) => c.id);
      setSelectedConceptIds(cliff.length > 0 ? cliff : sortedConcepts.slice(0, 2).map((c) => c.id));
    } else if (preset === 'top3') {
      setSelectedConceptIds(sortedConcepts.slice(0, 3).map((c) => c.id));
    } else if (preset === 'all') {
      setSelectedConceptIds(concepts.map((c) => c.id));
    } else if (preset === 'ml') {
      const ml = concepts.filter((c) => c.category?.toLowerCase().includes('machine') || c.category?.toLowerCase().includes('ml')).map((c) => c.id);
      setSelectedConceptIds(ml.length > 0 ? ml : [concepts[0].id]);
    } else if (preset === 'bio') {
      const bio = concepts.filter((c) => c.category?.toLowerCase().includes('bio') || c.category?.toLowerCase().includes('neuro')).map((c) => c.id);
      setSelectedConceptIds(bio.length > 0 ? bio : [concepts[0].id]);
    } else if (preset === 'systems') {
      const sys = concepts.filter((c) => c.category?.toLowerCase().includes('system') || c.category?.toLowerCase().includes('distribut')).map((c) => c.id);
      setSelectedConceptIds(sys.length > 0 ? sys : [concepts[0].id]);
    }
  };

  const selectedConcepts = useMemo(() => {
    return concepts.filter((c) => selectedConceptIds.includes(c.id));
  }, [concepts, selectedConceptIds]);

  // Generate the 30-day projection datapoints
  const projectionData = useMemo(() => {
    const dataPoints = [];
    const now = Date.now();

    for (let day = 0; day <= timeHorizonDays; day += 1) {
      const point: Record<string, any> = {
        day,
        label: day === 0 ? 'Today' : `+${day}d`,
        cliffThreshold: 70,
      };

      selectedConcepts.forEach((concept) => {
        const lastReview = new Date(concept.lastReviewedAt).getTime();
        const baseElapsedDays = Math.max(0, (now - lastReview) / (1000 * 60 * 60 * 24));
        const projectedElapsedDays = baseElapsedDays + day;

        if (simulateMendToday) {
          const boostedStability = concept.stability * 2.4;
          const ret = calculateRetention(boostedStability, day);
          point[concept.id] = Math.round(ret * 100);
        } else {
          const ret = calculateRetention(concept.stability, projectedElapsedDays);
          point[concept.id] = Math.round(ret * 100);
        }
      });

      dataPoints.push(point);
    }
    return dataPoints;
  }, [selectedConcepts, simulateMendToday, timeHorizonDays]);

  // Compute days until cliff for selected concepts
  const cliffAnalysis = useMemo(() => {
    const now = Date.now();
    return selectedConcepts.map((concept, index) => {
      const lastReview = new Date(concept.lastReviewedAt).getTime();
      const baseElapsedDays = Math.max(0, (now - lastReview) / (1000 * 60 * 60 * 24));

      const totalDaysToCliff = (concept.stability * (Math.pow(0.70, -1 / DECAY_POWER) - 1)) / FSRS_FACTOR;
      const daysFromNowToCliff = totalDaysToCliff - baseElapsedDays;

      const retentionAtDay30 = Math.round(
        calculateRetention(concept.stability, baseElapsedDays + 30) * 100
      );

      const color = CONCEPT_COLORS[index % CONCEPT_COLORS.length];

      return {
        concept,
        color,
        isAlreadyPastCliff: concept.currentRetention < 0.70,
        daysToCliff: Math.max(0, Number(daysFromNowToCliff.toFixed(1))),
        retentionAtDay30,
        currentRetentionPct: Math.round(concept.currentRetention * 100),
      };
    });
  }, [selectedConcepts]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#FFFFFF] border border-[#DDD7C8] p-3.5 rounded-2xl shadow-xl space-y-2 text-xs font-mono min-w-[220px]">
          <div className="flex items-center justify-between border-b border-[#DDD7C8] pb-1.5">
            <span className="text-[#8F6A00] font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#8F6A00]" />
              Day {label} {label === '0' ? '(Current State)' : 'Projection'}
            </span>
            <span className="text-[10px] text-[#736D6B] font-semibold">
              {simulateMendToday ? '⚡ Post-Mend' : '📉 Raw Decay'}
            </span>
          </div>

          <div className="space-y-1.5">
            {payload
              .filter((p: any) => p.dataKey !== 'cliffThreshold')
              .map((p: any) => {
                const concept = selectedConcepts.find((c) => c.id === p.dataKey);
                if (!concept) return null;
                const val = p.value;
                const isPast = val < 70;

                return (
                  <div
                    key={p.dataKey}
                    className="flex items-center justify-between gap-3 text-[11px]"
                  >
                    <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: p.stroke }}
                      />
                      <span className="text-[#2B2827] truncate font-medium">{concept.title}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 font-bold">
                      <span
                        className={
                          isPast
                            ? 'text-[#993B2B] font-bold flex items-center gap-0.5'
                            : 'text-[#152659]'
                        }
                      >
                        {val}%
                      </span>
                      {isPast && (
                        <span className="text-[9px] text-[#993B2B] uppercase font-bold">
                          [Cliff]
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="pt-1.5 border-t border-[#DDD7C8] text-[10px] text-[#736D6B] flex items-center justify-between">
            <span>Critical Cliff:</span>
            <span className="text-[#8F6A00] font-bold">70% Threshold</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-5 sm:p-6 shadow-sm space-y-6 relative overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#DDD7C8] pb-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/40 text-[10px] font-mono font-bold flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-[#8F6A00]" />
              FSRS Bayesian Trajectory Engine
            </span>
            <span className="text-xs text-[#736D6B]">•</span>
            <span className="text-xs text-[#5A5553] font-mono font-semibold">
              30-Day Prospective Simulation
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2B2827] flex items-center gap-2">
            <span>Future Decay Trajectory Projection</span>
          </h3>
          <p className="text-xs text-[#5A5553] max-w-2xl leading-relaxed">
            Simulates mathematical forgetting rates over the next {timeHorizonDays} days using <strong className="text-[#2B2827]">dotted path trajectories</strong>. Identifies exact future dates when concepts breach the 70% forgetting cliff threshold if un-mended.
          </p>
        </div>

        {/* Action Controls & Simulation Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-[#FAF8F2] p-1 rounded-xl border border-[#DDD7C8] text-xs font-mono shadow-sm">
            <button
              onClick={() => setTimeHorizonDays(14)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeHorizonDays === 14
                  ? 'bg-[#152659] text-[#FFFFFF] font-bold shadow-sm'
                  : 'text-[#5A5553] hover:text-[#2B2827]'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeHorizonDays(30)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeHorizonDays === 30
                  ? 'bg-[#152659] text-[#FFFFFF] font-bold shadow-sm'
                  : 'text-[#5A5553] hover:text-[#2B2827]'
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={() => setSimulateMendToday((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-semibold flex items-center gap-2 transition-all border shadow-sm ${
              simulateMendToday
                ? 'bg-[#152659] text-[#FFFFFF] border-[#152659]'
                : 'bg-[#FAF8F2] text-[#8F6A00] border-[#BF9A2A]/40 hover:border-[#BF9A2A]'
            }`}
            title="Toggle simulation of immediate Socratic mending (+2.4x Stability)"
          >
            <Zap className={`w-3.5 h-3.5 ${simulateMendToday ? 'fill-[#BF9A2A] text-[#BF9A2A]' : 'text-[#8F6A00]'}`} />
            <span>{simulateMendToday ? 'Simulating +2.4x Mend' : 'Simulate Mending Today'}</span>
          </button>
        </div>
      </div>

      {/* Preset Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#736D6B] text-[11px] uppercase mr-1 flex items-center gap-1 font-semibold">
            <Sliders className="w-3 h-3 text-[#8F6A00]" />
            Quick Trajectory Presets:
          </span>
          <button
            onClick={() => selectPreset('top3')}
            className="px-2.5 py-1 rounded-lg bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] border border-[#DDD7C8] text-[11px] transition-colors shadow-sm font-medium"
          >
            Top 3 High Priority
          </button>
          <button
            onClick={() => selectPreset('cliff')}
            className="px-2.5 py-1 rounded-lg bg-[#FDF2F0] hover:bg-[#FBE8E6] text-[#993B2B] border border-[#F2C0B8] text-[11px] transition-colors flex items-center gap-1 font-semibold"
          >
            <AlertTriangle className="w-3 h-3 text-[#993B2B]" />
            Cliff Vessels (&lt;70%)
          </button>
          <button
            onClick={() => selectPreset('ml')}
            className="px-2.5 py-1 rounded-lg bg-[#EBF0FA] hover:bg-[#DDE8F8] text-[#152659] border border-[#C5D5F0] text-[11px] transition-colors font-medium"
          >
            Machine Learning
          </button>
          <button
            onClick={() => selectPreset('bio')}
            className="px-2.5 py-1 rounded-lg bg-[#F0F7F1] hover:bg-[#E2F0E4] text-[#2F6A38] border border-[#BFE0C4] text-[11px] transition-colors font-medium"
          >
            Biology & Neuro
          </button>
          <button
            onClick={() => selectPreset('systems')}
            className="px-2.5 py-1 rounded-lg bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] border border-[#DDD7C8] text-[11px] transition-colors font-medium"
          >
            Systems
          </button>
          <button
            onClick={() => selectPreset('all')}
            className="px-2.5 py-1 rounded-lg bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#736D6B] border border-[#DDD7C8] text-[11px] transition-colors"
          >
            Select All ({concepts.length})
          </button>
        </div>

        <div className="text-[11px] text-[#736D6B] font-medium">
          Showing <span className="text-[#8F6A00] font-bold">{selectedConcepts.length}</span> curve{selectedConcepts.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Main 30-Day Dotted Curve Trajectory Canvas */}
      <div className="bg-[#FAF8F2] rounded-2xl p-4 sm:p-5 border border-[#DDD7C8] space-y-3 shadow-inner">
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-[#736D6B] pb-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#2B2827] font-semibold">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-[#8F6A00] inline-block" />
              Dotted Path = Prospective Decay Trajectory
            </span>
            <span className="hidden sm:inline text-[#DDD7C8]">•</span>
            <span className="flex items-center gap-1 text-[#8F6A00] font-semibold">
              <span className="w-3 h-0.5 bg-[#8F6A00] inline-block" />
              Accent Line = 70% Forgetting Cliff
            </span>
          </div>

          <span className="text-[11px] text-[#736D6B]">
            Horizontal Axis: Days from Today (t=0 to t={timeHorizonDays})
          </span>
        </div>

        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={projectionData}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#DDD7C8"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="#736D6B"
                fontSize={11}
                tickLine={false}
                interval={timeHorizonDays === 30 ? 4 : 2}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#736D6B"
                fontSize={11}
                tickLine={false}
                unit="%"
                ticks={[0, 25, 50, 70, 85, 100]}
              />
              <Tooltip content={<CustomTooltip />} />

              <ReferenceLine
                y={70}
                stroke="#8F6A00"
                strokeWidth={1.8}
                strokeOpacity={0.85}
                label={{
                  value: '70% Forgetting Cliff Threshold',
                  fill: '#8F6A00',
                  fontSize: 10,
                  position: 'insideTopRight',
                  offset: 8,
                }}
              />

              {/* Dynamic Dotted Line Paths */}
              {selectedConcepts.map((concept, index) => {
                const color = CONCEPT_COLORS[index % CONCEPT_COLORS.length];
                const isHovered = hoveredConceptId === concept.id;

                return (
                  <Line
                    key={concept.id}
                    type="monotone"
                    dataKey={concept.id}
                    name={concept.title}
                    stroke={color}
                    strokeWidth={isHovered ? 3.5 : 2.2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{
                      r: 6,
                      fill: color,
                      stroke: '#FFFFFF',
                      strokeWidth: 2,
                    }}
                    animationDuration={800}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Concept Breakdown & Interactive Trajectory Cards */}
      <div className="space-y-3">
        <div className="text-xs font-mono text-[#736D6B] uppercase tracking-wider flex items-center justify-between font-semibold">
          <span>Projected Vessels & Cliff Breach Timelines</span>
          <span className="text-[11px] text-[#736D6B]">
            Click checkbox to toggle curve • Click Mend to practice
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedConcepts.map((concept, index) => {
            const isSelected = selectedConceptIds.includes(concept.id);
            const color = CONCEPT_COLORS[index % CONCEPT_COLORS.length];
            const analysis = cliffAnalysis.find((a) => a.concept.id === concept.id);
            const isCliff = concept.currentRetention < 0.70;

            return (
              <div
                key={concept.id}
                onMouseEnter={() => setHoveredConceptId(concept.id)}
                onMouseLeave={() => setHoveredConceptId(null)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 relative flex flex-col justify-between space-y-3 shadow-sm ${
                  isSelected
                    ? 'bg-[#FFFFFF] border-[#DDD7C8]'
                    : 'bg-[#FAF8F2] border-[#DDD7C8]/70 opacity-60 hover:opacity-100'
                }`}
                style={{
                  borderLeftColor: isSelected ? color : undefined,
                  borderLeftWidth: isSelected ? '4px' : '1px',
                }}
              >
                <div className="space-y-1.5">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleConceptSelection(concept.id)}
                      className="flex items-center gap-1.5 text-xs font-mono text-[#5A5553] hover:text-[#2B2827] transition-colors"
                      title={isSelected ? 'Hide trajectory curve' : 'Show trajectory curve'}
                    >
                      {isSelected ? (
                        <CheckSquare
                          className="w-4 h-4"
                          style={{ color: isSelected ? color : '#736D6B' }}
                        />
                      ) : (
                        <Square className="w-4 h-4 text-[#736D6B]" />
                      )}
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[10px] text-[#736D6B] uppercase truncate max-w-[120px] font-semibold">
                        {concept.category}
                      </span>
                    </button>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isCliff
                          ? 'bg-[#FDF2F0] text-[#993B2B] border border-[#F2C0B8]'
                          : 'bg-[#EBF0FA] text-[#152659]'
                      }`}
                    >
                      {Math.round(concept.currentRetention * 100)}% Now
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-serif font-bold text-[#2B2827] line-clamp-1">
                    {concept.title}
                  </h4>

                  {/* Cliff Projection Stats */}
                  <div className="bg-[#FAF8F2] p-2 rounded-xl border border-[#DDD7C8] text-[11px] font-mono space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#736D6B] flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-[#736D6B]" /> Cliff Breach:
                      </span>
                      <span
                        className={`font-bold ${
                          isCliff
                            ? 'text-[#993B2B] animate-pulse'
                            : analysis && analysis.daysToCliff <= 5
                            ? 'text-[#8F6A00]'
                            : 'text-[#2B2827]'
                        }`}
                      >
                        {isCliff
                          ? 'Critical (Breached)'
                          : analysis
                          ? `In ${analysis.daysToCliff} days`
                          : 'Projected'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[#736D6B]">
                      <span>Day 30 Projected:</span>
                      <span
                        className={
                          (analysis?.retentionAtDay30 ?? 50) < 50
                            ? 'text-[#993B2B] font-bold'
                            : 'text-[#2B2827]'
                        }
                      >
                        ~{analysis?.retentionAtDay30 ?? Math.round(concept.currentRetention * 60)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Socratic Practice Trigger Button */}
                <div className="flex items-center justify-between pt-1 gap-2 border-t border-[#DDD7C8]">
                  <span className="text-[10px] font-mono text-[#736D6B]">
                    S: {concept.stability}d • D: {concept.difficulty}/10
                  </span>
                  <button
                    onClick={() => {
                      playGoldenKintsugiChime();
                      onSelectConceptForReview(concept);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] text-[11px] font-mono font-bold transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span>Mend</span>
                    <ArrowRight className="w-2.5 h-2.5 text-[#BF9A2A]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
