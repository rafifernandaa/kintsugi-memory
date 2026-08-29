import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Sparkles,
  Sliders,
  Volume2,
  Brain,
  Zap,
  CheckCircle2,
  RotateCcw,
  Shield,
  Gauge,
} from 'lucide-react';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTelemetry?: (action: string, details: string, role?: any, status?: 'success' | 'warn' | 'error') => void;
}

export interface AppPreferences {
  socraticRigor: 'gentle' | 'balanced' | 'rigorous';
  cliffThresholdPct: number;
  autoSpeakQuestions: boolean;
  speechRate: number;
  enableProceduralChimes: boolean;
  enableGoldenSeamVisuals: boolean;
}

const DEFAULT_PREFERENCES: AppPreferences = {
  socraticRigor: 'balanced',
  cliffThresholdPct: 70,
  autoSpeakQuestions: true,
  speechRate: 1.0,
  enableProceduralChimes: true,
  enableGoldenSeamVisuals: true,
};

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({
  isOpen,
  onClose,
  onAddTelemetry,
}) => {
  const [prefs, setPrefs] = useState<AppPreferences>(() => {
    try {
      const saved = localStorage.getItem('kintsugi_app_preferences');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('kintsugi_app_preferences', JSON.stringify(prefs));
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 500);

    onAddTelemetry?.(
      'App Settings Updated',
      `Rigor: ${prefs.socraticRigor}, Cliff: ${prefs.cliffThresholdPct}%, Voice: ${prefs.autoSpeakQuestions ? 'ON' : 'OFF'}`,
      'System Settings',
      'success'
    );
  };

  const handleReset = () => {
    setPrefs(DEFAULT_PREFERENCES);
    localStorage.setItem('kintsugi_app_preferences', JSON.stringify(DEFAULT_PREFERENCES));
    onAddTelemetry?.('App Settings Reset', 'Reset preferences to defaults.', 'System Settings');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2B2827]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Compact Header */}
        <div className="px-4 py-3 border-b border-[#DDD7C8] flex items-center justify-between bg-[#FAF8F2] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#152659] text-white flex items-center justify-center shadow-xs">
              <Settings className="w-3.5 h-3.5 text-[#BF9A2A]" />
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold text-[#2B2827] leading-tight">
                App Preferences & Agent Settings
              </h2>
              <p className="text-[10px] font-mono text-[#736D6B] leading-tight">
                Configure AI personality, audio, and decay parameters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#EAE6D6] text-[#736D6B] hover:text-[#2B2827] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Scrollable Content */}
        <div className="p-3.5 sm:p-4 space-y-3.5 overflow-y-auto flex-1">
          {/* 1. Socratic Agent Rigor */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-[#2B2827] flex items-center gap-1">
              <Brain className="w-3 h-3 text-[#152659]" /> Socratic Evaluator Rigor
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'gentle', label: 'Gentle', desc: 'Hints' },
                { id: 'balanced', label: 'Balanced', desc: 'Inquiry' },
                { id: 'rigorous', label: 'Challenger', desc: 'Edge cases' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, socraticRigor: lvl.id as any })}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    prefs.socraticRigor === lvl.id
                      ? 'bg-[#152659] text-white border-[#152659] shadow-xs'
                      : 'bg-[#FAF8F2] text-[#5A5553] hover:bg-[#EAE6D6] border-[#DDD7C8]'
                  }`}
                >
                  <div className="text-[11px] font-bold font-sans">{lvl.label}</div>
                  <div className={`text-[9px] ${prefs.socraticRigor === lvl.id ? 'text-[#DDD7C8]' : 'text-[#736D6B]'}`}>
                    {lvl.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Forgetting Cliff Threshold */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#2B2827]">
              <span className="flex items-center gap-1">
                <Gauge className="w-3 h-3 text-[#8F6A00]" /> Cliff Alert Threshold
              </span>
              <span className="text-[#8F6A00] font-bold">{prefs.cliffThresholdPct}% Retention</span>
            </div>
            <input
              type="range"
              min={60}
              max={85}
              step={5}
              value={prefs.cliffThresholdPct}
              onChange={(e) => setPrefs({ ...prefs, cliffThresholdPct: Number(e.target.value) })}
              className="w-full accent-[#BF9A2A] cursor-pointer h-1 bg-[#FAF8F2] border border-[#DDD7C8] rounded-lg"
            />
            <div className="flex justify-between text-[9px] font-mono text-[#736D6B]">
              <span>60% (Lax)</span>
              <span>70% (Standard FSRS)</span>
              <span>85% (Aggressive)</span>
            </div>
          </div>

          {/* 3. Audio & Voice Synthesizer */}
          <div className="space-y-1.5 pt-2 border-t border-[#DDD7C8]">
            <label className="text-[11px] font-mono font-bold text-[#2B2827] flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-[#2F6A38]" /> Speech & Audio Settings
            </label>

            <div className="space-y-1.5">
              <label className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] cursor-pointer">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-semibold text-[#2B2827]">Auto-Speak Socratic Inquiries</div>
                  <div className="text-[9px] text-[#736D6B]">Play audio voice prompts upon new retrieval sessions</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.autoSpeakQuestions}
                  onChange={(e) => setPrefs({ ...prefs, autoSpeakQuestions: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#152659] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] cursor-pointer">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-semibold text-[#2B2827]">Zen Procedural Chimes</div>
                  <div className="text-[9px] text-[#736D6B]">Harmonic chord upon golden synaptic mending</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.enableProceduralChimes}
                  onChange={(e) => setPrefs({ ...prefs, enableProceduralChimes: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#152659] rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* 4. Visual Aesthetics */}
          <div className="space-y-1.5 pt-2 border-t border-[#DDD7C8]">
            <label className="text-[11px] font-mono font-bold text-[#2B2827] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#BF9A2A]" /> Visual Aesthetics
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] cursor-pointer">
              <div className="space-y-0.5">
                <div className="text-[11px] font-semibold text-[#2B2827]">Golden Seam Particles</div>
                <div className="text-[9px] text-[#736D6B]">Display gold lacquer shimmer on repaired memory vessels</div>
              </div>
              <input
                type="checkbox"
                checked={prefs.enableGoldenSeamVisuals}
                onChange={(e) => setPrefs({ ...prefs, enableGoldenSeamVisuals: e.target.checked })}
                className="w-3.5 h-3.5 accent-[#BF9A2A] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Compact Footer */}
        <div className="px-4 py-2.5 border-t border-[#DDD7C8] bg-[#FAF8F2] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="text-[10px] font-mono text-[#736D6B] hover:text-[#993B2B] flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#EAE6D6] text-[#5A5553] text-xs font-mono font-semibold border border-[#DDD7C8] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 py-1 rounded-lg bg-[#152659] hover:bg-[#1E357A] text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#BF9A2A]" />
              <span>{savedToast ? 'Saved!' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
