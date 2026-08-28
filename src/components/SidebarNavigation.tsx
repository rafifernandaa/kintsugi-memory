import React from 'react';
import {
  Home,
  FileText,
  Target,
  Brain,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Settings,
  Plus,
  Sparkles,
  Zap,
  Layers,
  Activity,
  Bell,
  Award,
  Terminal,
  FastForward,
  RotateCcw,
  Calendar,
  Info,
} from 'lucide-react';
import { SynapticStreakData } from '../types';
import { SynapticStreakTracker } from './SynapticStreakTracker';

export type TabKey = 'home' | 'materials' | 'calendar' | 'review' | 'neuroplasticity' | 'progress' | 'journal' | 'insights' | 'about';

interface SidebarNavigationProps {
  currentTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  onReturnToLanding?: () => void;
  urgentCount: number;
  streak: SynapticStreakData;
  timeWarpDays: number;
  onFastForwardDecay: (days: number) => void;
  onOpenJudgeModal: () => void;
  onOpenDailySummary: () => void;
  onToggleTelemetry: () => void;
  telemetryCount: number;
  onUpdateStreak?: (updated: SynapticStreakData) => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  currentTab,
  onChangeTab,
  onReturnToLanding,
  urgentCount,
  streak,
  timeWarpDays,
  onFastForwardDecay,
  onOpenJudgeModal,
  onOpenDailySummary,
  onToggleTelemetry,
  telemetryCount,
  onUpdateStreak,
}) => {
  const navItems: { key: TabKey; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'calendar', label: 'Exam Calendar', icon: Calendar },
    { key: 'materials', label: 'Materials', icon: FileText },
    { key: 'review', label: 'Review', icon: Target, badge: urgentCount > 0 ? urgentCount : undefined },
    { key: 'neuroplasticity', label: 'Garden', icon: Brain },
    { key: 'progress', label: 'Progress', icon: TrendingUp },
    { key: 'journal', label: 'Journal', icon: BookOpen },
    { key: 'insights', label: 'Insights', icon: Lightbulb },
    { key: 'about', label: 'About', icon: Info },
  ];

  return (
    <>
      {/* Desktop Left Sidebar (hidden on mobile, visible on lg+) */}
      <aside className="hidden lg:flex flex-col justify-between w-56 xl:w-60 bg-[#FAF8F2] border-r border-[#DDD7C8] p-3 xl:p-3.5 shrink-0 h-screen sticky top-0 overflow-hidden">
        <div className="space-y-2 xl:space-y-2.5">
          {/* Brand Header & Streak Tracker */}
          <div className="space-y-2">
            <div
              onClick={onReturnToLanding || (() => onChangeTab('home'))}
              className="cursor-pointer group pt-0.5"
            >
              <div className="space-y-0.5">
                <h1 className="text-base xl:text-lg font-serif font-bold text-[#2B2827] tracking-[0.18em] uppercase leading-none group-hover:text-[#8F6A00] transition-colors">
                  Kintsugi
                </h1>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-[10px] xl:text-[11px] font-serif font-semibold text-[#5A5553] tracking-[0.2em] uppercase">
                    Memory
                  </h2>
                  <span className="text-[9px] xl:text-[10px] font-serif text-[#8F6A00] tracking-widest">
                    金継ぎ
                  </span>
                </div>
              </div>
            </div>

            {/* Synaptic Daily Streak Tracker Bar */}
            <div className="pt-0.5">
              <SynapticStreakTracker
                streak={streak}
                onStartRetrieval={() => onChangeTab('review')}
                onUpdateStreak={onUpdateStreak}
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    if (item.key === 'journal') {
                      onOpenDailySummary();
                    } else {
                      onChangeTab(item.key);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-sans transition-all relative ${
                    isActive
                      ? 'bg-[#EAE6D6] text-[#2B2827] font-semibold shadow-xs'
                      : 'text-[#5A5553] hover:text-[#2B2827] hover:bg-[#F2F0E4]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors ${
                        isActive ? 'text-[#8F6A00]' : 'text-[#736D6B]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#993B2B] text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {/* Golden right tab indicator on active item */}
                    {isActive && (
                      <span className="w-1 h-3 rounded-full bg-[#BF9A2A]" />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Wabi-Sabi Branch Card */}
          <div className="pt-0.5">
            <div className="rounded-xl border border-[#DDD7C8] bg-[#FFFFFF] p-2 overflow-hidden shadow-xs space-y-1">
              <div className="h-10 xl:h-12 w-full rounded-lg bg-[#FAF8F2] border border-[#DDD7C8] flex items-center justify-center relative overflow-hidden">
                {/* Stylized Ceramic Vase & Branch SVG */}
                <svg viewBox="0 0 100 80" className="w-full h-full p-1">
                  <path
                    d="M 50 50 Q 40 32 25 20 M 50 50 Q 60 28 75 16 M 50 50 Q 48 24 45 8 M 25 20 Q 20 12 15 8 M 75 16 Q 85 12 90 6"
                    stroke="#5A5553"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Vase */}
                  <ellipse cx="50" cy="68" rx="14" ry="8" fill="#EAE6D6" stroke="#DDD7C8" />
                  <path d="M 40 56 Q 34 64 50 70 Q 66 64 60 56 Z" fill="#DDD7C8" />
                  <ellipse cx="50" cy="56" rx="10" ry="3" fill="#FAF8F2" stroke="#DDD7C8" />
                  {/* Gold crack on branch vase */}
                  <path d="M 50 56 Q 46 62 54 68" stroke="#BF9A2A" strokeWidth="1.5" fill="none" />
                </svg>
              </div>

              <div className="text-[9.5px] font-serif italic text-[#5A5553] leading-tight text-center">
                “Nothing is perfect, nothing is permanent. Everything is practice.”
                <div className="text-[8.5px] font-sans not-italic text-[#736D6B] pt-0.5">
                  — Wabi-Sabi
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom User Profile Section */}
        <div className="pt-2 border-t border-[#DDD7C8] space-y-2">
          {/* Telemetry & Hackathon Quick Links */}
          <div className="flex items-center justify-between text-[10px] font-mono text-[#736D6B]">
            <button
              onClick={onToggleTelemetry}
              className="hover:text-[#8F6A00] flex items-center gap-1 font-semibold"
            >
              <Terminal className="w-3 h-3 text-[#BF9A2A]" />
              Telemetry ({telemetryCount})
            </button>

            <button
              onClick={onOpenJudgeModal}
              className="text-[#8F6A00] hover:underline font-bold flex items-center gap-1"
            >
              <Award className="w-3 h-3" /> Dossier
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#152659] text-[#FFFFFF] font-serif font-bold text-xs flex items-center justify-center shadow-xs">
                S
              </div>
              <div className="space-y-0">
                <div className="text-xs font-semibold text-[#2B2827] leading-tight">Selene</div>
                <div className="text-[9px] text-[#736D6B] italic font-serif leading-tight">
                  Keep learning, softly.
                </div>
              </div>
            </div>

            <button
              onClick={onOpenJudgeModal}
              className="p-1 rounded-md hover:bg-[#EAE6D6] text-[#736D6B] hover:text-[#2B2827] transition-colors"
              title="Hackathon Dossier & Architecture"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (visible on sm/md, hidden on lg+) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F2]/95 backdrop-blur-md border-t border-[#DDD7C8] px-2 py-2 flex items-center justify-around text-[10px] font-mono shadow-lg">
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center gap-1 p-1 ${
            currentTab === 'home' ? 'text-[#8F6A00] font-bold' : 'text-[#736D6B]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onChangeTab('calendar')}
          className={`flex flex-col items-center gap-1 p-1 ${
            currentTab === 'calendar' ? 'text-[#8F6A00] font-bold' : 'text-[#736D6B]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendar</span>
        </button>

        <button
          onClick={() => onChangeTab('materials')}
          className={`flex flex-col items-center gap-1 p-1 ${
            currentTab === 'materials' ? 'text-[#8F6A00] font-bold' : 'text-[#736D6B]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Notes</span>
        </button>

        <button
          onClick={() => onChangeTab('review')}
          className={`flex flex-col items-center gap-1 p-1 relative ${
            currentTab === 'review' ? 'text-[#8F6A00] font-bold' : 'text-[#736D6B]'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Review</span>
          {urgentCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#993B2B]" />
          )}
        </button>

        <button
          onClick={() => onChangeTab('neuroplasticity')}
          className={`flex flex-col items-center gap-1 p-1 ${
            currentTab === 'neuroplasticity' ? 'text-[#8F6A00] font-bold' : 'text-[#736D6B]'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Neuro</span>
        </button>

        <button
          onClick={() => onChangeTab('progress')}
          className={`flex flex-col items-center gap-1 p-1 ${
            currentTab === 'progress' ? 'text-[#8F6A00] font-bold' : 'text-[#736D6B]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Progress</span>
        </button>
      </div>
    </>
  );
};
