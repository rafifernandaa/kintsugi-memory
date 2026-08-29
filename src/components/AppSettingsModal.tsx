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
    }, 600);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2827]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#DDD7C8] flex items-center justify-between bg-[#FAF8F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#152659] text-white flex items-center justify-center shadow-xs">
              <Settings className="w-4 h-4 text-[#BF9A2A]" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#2B2827]">
                App Preferences & Agent Settings
              </h2>
              <p className="text-[11px] font-mono text-[#736D6B]">
                Configure AI personality, audio speech, and FSRS parameters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#EAE6D6] text-[#736D6B] hover:text-[#2B2827] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. Socratic Agent Rigor */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-[#2B2827] flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-[#152659]" /> Socratic Evaluator Rigor
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gentle', label: 'Gentle Guide', desc: 'Supportive hints' },
                { id: 'balanced', label: 'Balanced', desc: 'Socratic inquiry' },
                { id: 'rigorous', label: 'Challenger', desc: 'Edge cases' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, socraticRigor: lvl.id as any })}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    prefs.socraticRigor === lvl.id
                      ? 'bg-[#152659] text-white border-[#152659] shadow-xs'
                      : 'bg-[#FAF8F2] text-[#5A5553] hover:bg-[#EAE6D6] border-[#DDD7C8]'
                  }`}
                >
                  <div className="text-xs font-bold font-sans">{lvl.label}</div>
                  <div className={`text-[10px] ${prefs.socraticRigor === lvl.id ? 'text-[#DDD7C8]' : 'text-[#736D6B]'}`}>
                    {lvl.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Forgetting Cliff Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#2B2827]">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-[#8F6A00]" /> Forgetting Cliff Alert Threshold
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
              className="w-full accent-[#BF9A2A] cursor-pointer h-1.5 bg-[#FAF8F2] border border-[#DDD7C8] rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#736D6B]">
              <span>60% (Lax)</span>
              <span>70% (Standard FSRS)</span>
              <span>85% (Aggressive)</span>
            </div>
          </div>

          {/* 3. Audio & Voice Synthesizer */}
          <div className="space-y-2 pt-2 border-t border-[#DDD7C8]">
            <label className="text-xs font-mono font-bold text-[#2B2827] flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#2F6A38]" /> Speech & Audio Settings
            </label>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] cursor-pointer">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#2B2827]">Auto-Speak Socratic Inquiries</div>
                  <div className="text-[10px] text-[#736D6B]">Play audio voice prompts when new retrieval sessions start</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.autoSpeakQuestions}
                  onChange={(e) => setPrefs({ ...prefs, autoSpeakQuestions: e.target.checked })}
                  className="w-4 h-4 accent-[#152659] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] cursor-pointer">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#2B2827]">Zen Procedural Chimes</div>
                  <div className="text-[10px] text-[#736D6B]">Synthesize harmonic chord upon golden synaptic mending</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.enableProceduralChimes}
                  onChange={(e) => setPrefs({ ...prefs, enableProceduralChimes: e.target.checked })}
                  className="w-4 h-4 accent-[#152659] rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* 4. Visual Aesthetics */}
          <div className="space-y-2 pt-2 border-t border-[#DDD7C8]">
            <label className="text-xs font-mono font-bold text-[#2B2827] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#BF9A2A]" /> Visual Aesthetics
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] cursor-pointer">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-[#2B2827]">Golden Seam Particle Effects</div>
                <div className="text-[10px] text-[#736D6B]">Display gold lacquer shimmer on repaired memory vessels</div>
              </div>
              <input
                type="checkbox"
                checked={prefs.enableGoldenSeamVisuals}
                onChange={(e) => setPrefs({ ...prefs, enableGoldenSeamVisuals: e.target.checked })}
                className="w-4 h-4 accent-[#BF9A2A] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#DDD7C8] bg-[#FAF8F2] flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-mono text-[#736D6B] hover:text-[#993B2B] flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EAE6D6] text-[#5A5553] text-xs font-mono font-semibold border border-[#DDD7C8] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              {savedToast ? <CheckCircle2 className="w-3.5 h-3.5 text-[#BF9A2A]" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{savedToast ? 'Saved!' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
