import React, { useState } from 'react';
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
  Radio,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SynapticStreakData } from '../types';

export type TabKey = 'home' | 'materials' | 'calendar' | 'review' | 'neuroplasticity' | 'progress' | 'journal' | 'insights' | 'about' | 'selene';

const MOTIVATION_QUOTES = [
  {
    quote: "Nothing is perfect, nothing is permanent. Everything is practice.",
    author: "Wabi-Sabi Tradition",
    theme: "Ceramic Joinery",
    illustration: (
      <svg viewBox="0 0 100 65" className="w-full h-10">
        <ellipse cx="50" cy="50" rx="16" ry="6" fill="#EAE6D6" stroke="#DDD7C8" />
        <path d="M 38 40 Q 32 48 50 54 Q 68 48 62 40 Z" fill="#DDD7C8" />
        <ellipse cx="50" cy="40" rx="12" ry="3" fill="#FAF8F2" stroke="#DDD7C8" />
        <path d="M 50 40 Q 44 46 53 52" stroke="#BF9A2A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="53" cy="52" r="1.5" fill="#BF9A2A" />
      </svg>
    ),
  },
  {
    quote: "A synapse strengthens not by passive reading, but by retrieval at the edge of forgetting.",
    author: "Cognitive Neuroscience",
    theme: "Synaptic Plasticity",
    illustration: (
      <svg viewBox="0 0 100 65" className="w-full h-10">
        <circle cx="32" cy="32" r="7" fill="#FAF8F2" stroke="#152659" strokeWidth="1.5" />
        <circle cx="68" cy="32" r="7" fill="#FAF8F2" stroke="#152659" strokeWidth="1.5" />
        <path d="M 39 32 Q 50 20 61 32" stroke="#BF9A2A" strokeWidth="2" fill="none" strokeDasharray="3 2" />
        <circle cx="50" cy="26" r="3" fill="#BF9A2A" />
      </svg>
    ),
  },
  {
    quote: "To learn a new language is to inhabit another soul. Every hesitation is gold in the making.",
    author: "Polyglot Mastery",
    theme: "Linguistic Fluency",
    illustration: (
      <svg viewBox="0 0 100 65" className="w-full h-10">
        <path d="M 50 52 Q 48 34 32 24 M 50 52 Q 52 30 70 18 M 32 24 Q 25 18 20 12 M 70 18 Q 78 14 85 10" stroke="#5A5553" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 50 52 Q 48 38 50 26" stroke="#BF9A2A" strokeWidth="2" fill="none" />
        <circle cx="32" cy="24" r="2" fill="#BF9A2A" />
        <circle cx="70" cy="18" r="2" fill="#BF9A2A" />
      </svg>
    ),
  },
  {
    quote: "Water shapes the stone not by force, but by persistence. Memory flows like a river.",
    author: "Zen Proverb",
    theme: "Effortless Flow",
    illustration: (
      <svg viewBox="0 0 100 65" className="w-full h-10">
        <ellipse cx="50" cy="38" rx="20" ry="10" fill="#EAE6D6" stroke="#DDD7C8" />
        <path d="M 22 46 Q 50 40 78 46" stroke="#BF9A2A" strokeWidth="1.5" fill="none" />
        <path d="M 28 52 Q 50 48 72 52" stroke="#8F6A00" strokeWidth="1" fill="none" opacity="0.7" />
      </svg>
    ),
  },
];

interface SidebarNavigationProps {
  currentTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  onReturnToLanding?: () => void;
  urgentCount: number;
  streak: SynapticStreakData;
  timeWarpDays: number;
  onFastForwardDecay: (days: number) => void;
  onOpenDailySummary: () => void;
  onOpenPubSubAlerts?: () => void;
  onToggleTelemetry: () => void;
  telemetryCount: number;
  onOpenSettingsModal?: () => void;
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
  onOpenDailySummary,
  onOpenPubSubAlerts,
  onToggleTelemetry,
  telemetryCount,
  onOpenSettingsModal,
  onUpdateStreak,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const nextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATION_QUOTES.length);
  };

  const prevQuote = () => {
    setQuoteIndex((prev) => (prev - 1 + MOTIVATION_QUOTES.length) % MOTIVATION_QUOTES.length);
  };

  const currentQuote = MOTIVATION_QUOTES[quoteIndex];

  const navItems: { key: TabKey; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'calendar', label: 'Exam Calendar', icon: Calendar },
    { key: 'materials', label: 'Materials', icon: BookOpen },
    { key: 'review', label: 'Active Retrieval', icon: Brain },
    { key: 'neuroplasticity', label: 'Memory Garden', icon: Sparkles, badge: urgentCount },
    { key: 'progress', label: 'Retention Oracle', icon: Activity },
    { key: 'journal', label: 'Journal', icon: BookOpen },
    { key: 'insights', label: 'Insights (Pub/Sub)', icon: Radio },
    { key: 'about', label: 'Architecture', icon: Info },
  ];

  return (
    <>
      {/* Desktop Sidebar (visible on lg+) */}
      <aside className="hidden lg:flex w-60 h-screen sticky top-0 bg-[#FAF8F2] border-r border-[#DDD7C8] flex-col justify-between p-3.5 z-30 shrink-0 select-none">
        <div className="space-y-3">
          {/* Brand Header */}
          <div className="flex items-center px-2 pt-1">
            <div
              onClick={() => (onReturnToLanding ? onReturnToLanding() : onChangeTab('home'))}
              className="flex items-center gap-2.5 cursor-pointer group"
              title="Return to Landing Page"
            >
              <div className="w-7 h-7 rounded-lg bg-[#152659] text-white flex items-center justify-center font-serif text-sm font-bold shadow-xs group-hover:scale-105 group-hover:bg-[#8F6A00] transition-all">
                金
              </div>
              <div className="space-y-0">
                <div className="text-xs font-serif font-bold text-[#2B2827] group-hover:text-[#8F6A00] transition-colors leading-tight">
                  Kintsugi Memory
                </div>
                <div className="text-[10px] font-mono text-[#736D6B] leading-tight">
                  Neural Sanctuary ↗
                </div>
              </div>
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
                  onClick={() => onChangeTab(item.key)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-sans transition-all relative cursor-pointer ${
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

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#993B2B] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Wabi-Sabi Quotes & Motivation Carousel Card (Below Architecture) */}
          <div className="pt-1">
            <div className="rounded-2xl border border-[#DDD7C8] bg-[#FFFFFF] p-2.5 shadow-xs space-y-1.5 relative group">
              {/* Illustration */}
              <div className="h-11 w-full rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] flex items-center justify-center relative overflow-hidden">
                {currentQuote.illustration}
              </div>

              {/* Quote Text */}
              <div className="space-y-1">
                <div className="text-[10px] font-serif italic text-[#2B2827] leading-tight text-center min-h-[32px] flex items-center justify-center px-1">
                  “{currentQuote.quote}”
                </div>
                <div className="flex items-center justify-between text-[8.5px] font-mono text-[#736D6B] pt-0.5 border-t border-[#FAF8F2]">
                  <span className="text-[#8F6A00] font-bold">{currentQuote.theme}</span>
                  <span>— {currentQuote.author}</span>
                </div>
              </div>

              {/* Swipe / Navigation Controls */}
              <div className="flex items-center justify-between pt-0.5">
                <button
                  type="button"
                  onClick={prevQuote}
                  className="p-1 rounded-lg hover:bg-[#EAE6D6] text-[#736D6B] hover:text-[#2B2827] transition-colors cursor-pointer"
                  title="Previous quote"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>

                {/* Dot indicators */}
                <div className="flex items-center gap-1">
                  {MOTIVATION_QUOTES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuoteIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === quoteIndex ? 'w-3 bg-[#BF9A2A]' : 'w-1.5 bg-[#DDD7C8]'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={nextQuote}
                  className="p-1 rounded-lg hover:bg-[#EAE6D6] text-[#736D6B] hover:text-[#2B2827] transition-colors cursor-pointer"
                  title="Next quote"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom User Profile Section */}
        <div className="pt-2 border-t border-[#DDD7C8] space-y-2">
          {/* Telemetry Quick Link */}
          <div className="flex items-center justify-between text-[10px] font-mono text-[#736D6B]">
            <button
              onClick={onToggleTelemetry}
              className="hover:text-[#8F6A00] flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Terminal className="w-3 h-3 text-[#BF9A2A]" />
              Telemetry ({telemetryCount})
            </button>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <div
              onClick={() => onChangeTab('selene')}
              className={`flex items-center gap-2 cursor-pointer group p-1 rounded-xl transition-all ${
                currentTab === 'selene' ? 'bg-[#EAE6D6]' : 'hover:bg-[#F2F0E4]'
              }`}
              title="View Selene Profile & Notification Settings"
            >
              <div className="w-7 h-7 rounded-full bg-[#152659] text-[#FFFFFF] font-serif font-bold text-xs flex items-center justify-center shadow-xs border border-[#BF9A2A]">
                S
              </div>
              <div className="space-y-0">
                <div className="text-xs font-semibold text-[#2B2827] group-hover:text-[#8F6A00] transition-colors leading-tight">Selene</div>
                <div className="text-[9px] text-[#736D6B] italic font-serif leading-tight">
                  User Account & SMTP
                </div>
              </div>
            </div>

            <button
              onClick={onOpenSettingsModal}
              className="p-1.5 rounded-lg hover:bg-[#EAE6D6] text-[#736D6B] hover:text-[#2B2827] transition-colors cursor-pointer"
              title="App Preferences & Socratic Settings"
            >
              <Settings className="w-3.5 h-3.5 text-[#5A5553] hover:text-[#8F6A00]" />
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
