import React from 'react';
import { Sparkles, Layers, BookOpen, Activity, Bell, Award, Terminal, FastForward, RotateCcw, Brain, Home } from 'lucide-react';
import { SynapticStreakData } from '../types';
import { SynapticStreakTracker } from './SynapticStreakTracker';

interface NavigationProps {
  currentTab: 'garden' | 'ingest' | 'retrieve' | 'oracle' | 'dispatch';
  onChangeTab: (tab: 'garden' | 'ingest' | 'retrieve' | 'oracle' | 'dispatch') => void;
  onReturnToLanding?: () => void;
  timeWarpDays: number;
  onFastForwardDecay: (days: number) => void;
  onOpenJudgeModal: () => void;
  onOpenDailySummary?: () => void;
  onToggleTelemetry: () => void;
  telemetryCount: number;
  urgentCount: number;
  streak: SynapticStreakData;
  onStartRetrieval: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onChangeTab,
  onReturnToLanding,
  timeWarpDays,
  onFastForwardDecay,
  onOpenJudgeModal,
  onOpenDailySummary,
  onToggleTelemetry,
  telemetryCount,
  urgentCount,
  streak,
  onStartRetrieval,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F2F0E4]/95 backdrop-blur-md border-b border-[#DDD7C8]">
      {/* Top Hackathon Ribbon */}
      <div className="bg-[#EAE6D6] border-b border-[#DDD7C8] px-4 py-1.5 text-xs text-[#403C3B] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {onReturnToLanding && (
            <button
              onClick={onReturnToLanding}
              className="px-2.5 py-0.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F2F0E4] text-[#2B2827] border border-[#DDD7C8] text-[10px] font-mono font-bold flex items-center gap-1 transition-colors shadow-sm"
              title="Return to Philosophy Landing Page"
            >
              <Home className="w-3 h-3 text-[#BF9A2A]" />
              <span>Philosophy Landing</span>
            </button>
          )}
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/40">
            Devpost Hackathon Edition
          </span>
          <span className="text-[#736D6B] font-mono text-[11px] hidden sm:inline">
            Track: Collaborative Partner • Gemini 3.7 Flash + Google Cloud
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Daily Synaptic Summary Button */}
          {onOpenDailySummary && (
            <button
              onClick={onOpenDailySummary}
              className="px-2.5 py-0.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F2F0E4] text-[#2B2827] border border-[#DDD7C8] text-[11px] font-mono font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Open Daily Synaptic Summary & Cliff Overview"
            >
              <Brain className="w-3.5 h-3.5 text-[#BF9A2A]" />
              <span className="hidden sm:inline">Daily Summary</span>
              {urgentCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#993B2B] text-[#FFFFFF] border border-[#993B2B] text-[9px] font-bold animate-pulse">
                  {urgentCount}
                </span>
              )}
            </button>
          )}

          {/* Judge Time-Warp Slider */}
          <div className="flex items-center gap-2 bg-[#FFFFFF] px-2.5 py-0.5 rounded-lg border border-[#DDD7C8] text-[11px] font-mono shadow-sm">
            <FastForward className="w-3.5 h-3.5 text-[#BF9A2A]" />
            <span className="text-[#736D6B] hidden md:inline">Time-Warp:</span>
            <span className="text-[#8F6A00] font-bold">+{timeWarpDays.toFixed(1)}d</span>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={timeWarpDays}
              onChange={(e) => onFastForwardDecay(Number(e.target.value) - timeWarpDays)}
              className="w-16 sm:w-20 accent-[#BF9A2A] cursor-pointer h-1 bg-[#EAE6D6] rounded"
              title="Fast-forward days of memory decay"
            />
            {timeWarpDays > 0 && (
              <button
                onClick={() => onFastForwardDecay(-timeWarpDays)}
                className="text-[#736D6B] hover:text-[#2B2827]"
                title="Reset time"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Hackathon Judge Dossier Button */}
          <button
            onClick={onOpenJudgeModal}
            className="px-2.5 py-0.5 rounded-lg bg-[#BF9A2A]/15 hover:bg-[#BF9A2A]/25 text-[#8F6A00] border border-[#BF9A2A]/40 text-[11px] font-mono font-semibold flex items-center gap-1 transition-colors shadow-sm"
          >
            <Award className="w-3.5 h-3.5 text-[#8F6A00]" />
            <span className="hidden sm:inline">Judge Dossier & Arch</span>
            <span className="sm:hidden">Judge</span>
          </button>

          {/* Telemetry Button */}
          <button
            onClick={onToggleTelemetry}
            className="px-2.5 py-0.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F2F0E4] text-[#2B2827] border border-[#DDD7C8] text-[11px] font-mono flex items-center gap-1 transition-colors relative shadow-sm"
            title="Open Live Multi-Agent Telemetry Stream"
          >
            <Terminal className="w-3.5 h-3.5 text-[#2F6A38]" />
            <span className="hidden sm:inline">Telemetry</span>
            {telemetryCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#2F6A38] animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Synaptic Streak Badge */}
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div
            onClick={() => onChangeTab('garden')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#152659] to-[#1E357A] border border-[#BF9A2A]/50 flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
              <span className="text-lg font-serif font-bold text-[#F2E3B6]">金</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-serif font-bold text-[#2B2827] tracking-tight">
                  Kintsugi Memory
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#EAE6D6] text-[#8F6A00] border border-[#DDD7C8] font-bold">
                  v2.5 FSRS
                </span>
              </div>
              <p className="text-[11px] text-[#736D6B] font-serif italic">
                The Forgetting-Cliff Agent
              </p>
            </div>
          </div>

          {/* Synaptic Streak Tracker Badge */}
          <div className="flex items-center">
            <SynapticStreakTracker
              streak={streak}
              onStartRetrieval={onStartRetrieval}
            />
          </div>
        </div>

        {/* Tab Switcher - Using High Contrast Indigo for Active Tab and Clean Porcelain for Inactive */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-mono">
          <button
            onClick={() => onChangeTab('garden')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentTab === 'garden'
                ? 'bg-[#152659] text-[#FFFFFF] font-bold shadow-md shadow-[#152659]/20'
                : 'text-[#5A5553] hover:text-[#2B2827] hover:bg-[#EAE6D6]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#BF9A2A]" /> Synaptic Garden
          </button>

          <button
            onClick={() => onChangeTab('ingest')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentTab === 'ingest'
                ? 'bg-[#152659] text-[#FFFFFF] font-bold shadow-md shadow-[#152659]/20'
                : 'text-[#5A5553] hover:text-[#2B2827] hover:bg-[#EAE6D6]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#BF9A2A]" /> Ingest Notes
          </button>

          <button
            onClick={() => onChangeTab('retrieve')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentTab === 'retrieve'
                ? 'bg-[#152659] text-[#FFFFFF] font-bold shadow-md shadow-[#152659]/20'
                : 'text-[#5A5553] hover:text-[#2B2827] hover:bg-[#EAE6D6]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#BF9A2A]" /> Socratic Interview
          </button>

          <button
            onClick={() => onChangeTab('oracle')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentTab === 'oracle'
                ? 'bg-[#152659] text-[#FFFFFF] font-bold shadow-md shadow-[#152659]/20'
                : 'text-[#5A5553] hover:text-[#2B2827] hover:bg-[#EAE6D6]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#BF9A2A]" /> Bayesian Oracle
          </button>

          <button
            onClick={() => onChangeTab('dispatch')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap relative ${
              currentTab === 'dispatch'
                ? 'bg-[#152659] text-[#FFFFFF] font-bold shadow-md shadow-[#152659]/20'
                : 'text-[#5A5553] hover:text-[#2B2827] hover:bg-[#EAE6D6]'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-[#BF9A2A]" /> Autonomous Initiation
            {urgentCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#993B2B] border border-[#BF9A2A] animate-pulse" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
