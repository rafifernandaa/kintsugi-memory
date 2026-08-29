import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Shield,
  Key,
  Check,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Languages,
  BookOpen,
  Sparkles,
  Award,
  Download,
  Trash2,
  ArrowRight,
  Radio,
  Send,
  Zap,
} from 'lucide-react';
import { Concept } from '../types';

interface SeleneAccountTabProps {
  concepts: Concept[];
  onNavigateToTab: (tab: 'home' | 'materials' | 'calendar' | 'review' | 'neuroplasticity' | 'progress' | 'journal' | 'insights' | 'about') => void;
  onAddTelemetry: (action: string, details: string, role?: any, status?: 'success' | 'warn' | 'error') => void;
}

export const SeleneAccountTab: React.FC<SeleneAccountTabProps> = ({
  concepts,
  onNavigateToTab,
  onAddTelemetry,
}) => {
  // User Profile State
  const [userName, setUserName] = useState(() => localStorage.getItem('kintsugi_user_name') || 'Selene');
  const [userBio, setUserBio] = useState(
    () => localStorage.getItem('kintsugi_user_bio') || 'Lifelong Learner & Polyglot. Embracing memory decay as the golden seam of knowledge.'
  );
  const [primaryLanguage, setPrimaryLanguage] = useState(
    () => localStorage.getItem('kintsugi_target_lang') || 'Japanese (日本語)'
  );
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(
    () => localStorage.getItem('kintsugi_daily_goal') || '15'
  );

  // SMTP Settings State
  const [smtpUser, setSmtpUser] = useState(() => localStorage.getItem('kintsugi_smtp_user') || 'cubetestxyz@gmail.com');
  const [smtpPass, setSmtpPass] = useState('');
  const [isConfiguringSmtp, setIsConfiguringSmtp] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [smtpStatusMsg, setSmtpStatusMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [smtpConfigured, setSmtpConfigured] = useState<boolean>(false);
  const [browserNotifsEnabled, setBrowserNotifsEnabled] = useState<boolean>(() => {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  });

  // Load server SMTP configuration status
  useEffect(() => {
    fetch('/api/smtp-status')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.configured) {
          setSmtpConfigured(true);
          if (data.rawUser) {
            setSmtpUser(data.rawUser);
          } else if (data.user) {
            setSmtpUser(data.user);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem('kintsugi_user_name', userName.trim());
    localStorage.setItem('kintsugi_user_bio', userBio.trim());
    localStorage.setItem('kintsugi_target_lang', primaryLanguage);
    localStorage.setItem('kintsugi_daily_goal', dailyGoalMinutes);
    onAddTelemetry('Profile Updated', `Updated profile settings for ${userName}.`, 'Account Manager', 'success');
    alert('Profile preferences saved!');
  };

  const handleSaveSmtp = async () => {
    if (!smtpUser.trim() || !smtpPass.trim()) {
      setSmtpStatusMsg({ text: 'Please provide both Gmail address and 16-character Google App Password.', success: false });
      return;
    }

    setIsConfiguringSmtp(true);
    setSmtpStatusMsg(null);

    try {
      const res = await fetch('/api/configure-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpUser: smtpUser.trim(),
          smtpPass: smtpPass.trim(),
          user: smtpUser.trim(),
          pass: smtpPass.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSmtpConfigured(true);
        const activeEmail = data.status?.rawUser || smtpUser.trim();
        setSmtpUser(activeEmail);
        localStorage.setItem('kintsugi_smtp_user', activeEmail);
        localStorage.setItem('kintsugi_user_email', activeEmail);
        setSmtpStatusMsg({ text: `SMTP Verified! Real emails will be delivered to ${activeEmail}.`, success: true });
        setSmtpPass('');
        onAddTelemetry('SMTP Configured', `Configured Gmail delivery to ${activeEmail}`, 'Email Gateway', 'success');
      } else {
        setSmtpStatusMsg({ text: data.error || 'Failed to authenticate Gmail credentials.', success: false });
      }
    } catch (e: any) {
      setSmtpStatusMsg({ text: e.message || 'Network error while configuring SMTP.', success: false });
    } finally {
      setIsConfiguringSmtp(false);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    setSmtpStatusMsg(null);

    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: smtpUser.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setSmtpStatusMsg({ text: `Test email dispatched to ${smtpUser.trim()}! Check your inbox.`, success: true });
        onAddTelemetry('Test Email Sent', `Sent verification test email to ${smtpUser.trim()}`, 'Email Gateway', 'success');
      } else {
        setSmtpStatusMsg({ text: data.error || 'Failed to dispatch test email.', success: false });
      }
    } catch (e: any) {
      setSmtpStatusMsg({ text: e.message || 'Network error while sending test email.', success: false });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleEnableBrowserNotifs = async () => {
    if (typeof Notification !== 'undefined') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setBrowserNotifsEnabled(true);
        new Notification('Kintsugi Memory', {
          body: 'Native browser alerts are now active for forgetting-cliff events.',
        });
        onAddTelemetry('Browser Notifications Enabled', 'Granted native browser notification permission.', 'Notification Dispatcher', 'success');
      }
    }
  };

  const handleExportData = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      concepts,
      journalEntries: localStorage.getItem('kintsugi_journal_entries')
        ? JSON.parse(localStorage.getItem('kintsugi_journal_entries')!)
        : [],
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kintsugi-memory-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#152659]/10 via-[#FAF3E0]/40 to-transparent rounded-full pointer-events-none blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-[#152659] text-white flex items-center justify-center text-2xl font-serif font-bold shadow-md border-2 border-[#BF9A2A]">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-bold text-[#2B2827] tracking-tight">
                  {userName}
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#FAF3E0] text-[#8F6A00] font-bold border border-[#E8D4A2]">
                  Active Scholar
                </span>
              </div>
              <p className="text-xs text-[#5A5553] font-serif italic max-w-lg">
                "{userBio}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportData}
              className="px-3.5 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] hover:text-[#2B2827] border border-[#DDD7C8] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#BF9A2A]" />
              <span>Export JSON Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Gmail SMTP & Notification Channel Configuration Card */}
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDD7C8] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F0F7F1] border border-[#BFE0C4] flex items-center justify-center text-[#2F6A38]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#2B2827]">
                Autonomous Forgetting-Cliff Email Pipeline
              </h2>
              <div className="text-xs font-mono text-[#736D6B]">
                Configure your Gmail SMTP credentials for proactive email micro-questions
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {smtpConfigured ? (
              <span className="px-3 py-1 rounded-full bg-[#F0F7F1] text-[#2F6A38] border border-[#BFE0C4] text-xs font-mono font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Live Delivery Active
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-[#FAF3E0] text-[#8F6A00] border border-[#E8D4A2] text-xs font-mono font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> In-App & Pub/Sub Preview Mode
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-[#2B2827]">
              Registered Gmail Address
            </label>
            <input
              type="email"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              placeholder="e.g. yourname@gmail.com"
              className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl px-3.5 py-2.5 text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-[#2B2827]">
              Google App Password (16 characters)
            </label>
            <input
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              placeholder="e.g. abcd efgh ijkl mnop"
              className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl px-3.5 py-2.5 text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
            />
          </div>
        </div>

        {smtpStatusMsg && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${
              smtpStatusMsg.success
                ? 'bg-[#F0F7F1] border-[#BFE0C4] text-[#2F6A38]'
                : 'bg-[#FDF2F0] border-[#F2C0B8] text-[#993B2B]'
            }`}
          >
            {smtpStatusMsg.success ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{smtpStatusMsg.text}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <p className="text-xs text-[#736D6B] leading-relaxed">
            Generate in your Google Account under <b>Security → 2-Step Verification → App Passwords</b>.
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {smtpConfigured && (
              <button
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
                className="px-4 py-2.5 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#2B2827] border border-[#DDD7C8] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#BF9A2A]" />
                <span>{isSendingTest ? 'Dispatching...' : 'Send Test Email'}</span>
              </button>
            )}

            <button
              onClick={handleSaveSmtp}
              disabled={isConfiguringSmtp}
              className="px-5 py-2.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Shield className="w-4 h-4 text-[#BF9A2A]" />
              <span>{isConfiguringSmtp ? 'Verifying with Google...' : 'Save & Authenticate'}</span>
            </button>
          </div>
        </div>

        {/* Native Browser Notifications */}
        <div className="pt-4 border-t border-[#DDD7C8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-mono font-bold text-[#2B2827] flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-[#8F6A00]" /> Native Browser Alerts
            </div>
            <p className="text-xs text-[#736D6B]">
              Receive immediate popups when memory vessels approach 70% retention while your browser is open.
            </p>
          </div>

          <button
            onClick={handleEnableBrowserNotifs}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
              browserNotifsEnabled
                ? 'bg-[#F0F7F1] text-[#2F6A38] border-[#BFE0C4]'
                : 'bg-[#FAF8F2] text-[#5A5553] border-[#DDD7C8] hover:border-[#8F6A00]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            {browserNotifsEnabled ? 'Browser Alerts Active' : 'Enable Browser Alerts'}
          </button>
        </div>
      </div>

      {/* 2. Personal Learning Preferences & Target Language */}
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-[#DDD7C8] pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF3E0] border border-[#E8D4A2] flex items-center justify-center text-[#8F6A00]">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-[#2B2827]">
              Learning Focus & Polyglot Profile
            </h2>
            <div className="text-xs font-mono text-[#736D6B]">
              Customize target disciplines, language immersion levels, and daily study targets
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-[#2B2827]">
              User Display Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl px-3.5 py-2.5 text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-[#2B2827]">
              Primary Language Immersion Focus
            </label>
            <select
              value={primaryLanguage}
              onChange={(e) => setPrimaryLanguage(e.target.value)}
              className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl px-3.5 py-2.5 text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
            >
              <option value="Japanese (日本語)">Japanese (日本語) — JLPT N2/N1 & Kanji</option>
              <option value="Spanish (Español)">Spanish (Español) — C1 Subjunctive & Discourse</option>
              <option value="Mandarin (中文)">Mandarin (中文) — HSK 5 Grammar & Particles</option>
              <option value="French (Français)">French (Français) — B2/C1 Subjunctive & Nuance</option>
              <option value="German (Deutsch)">German (Deutsch) — Cases & Verb Framing</option>
              <option value="Computer Science">Computer Science & Distributed Systems</option>
              <option value="Cognitive Neuroscience">Cognitive Neuroscience & Memory</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-bold text-[#2B2827]">
            Personal Philosophical Bio / Study Motto
          </label>
          <textarea
            rows={3}
            value={userBio}
            onChange={(e) => setUserBio(e.target.value)}
            className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl p-3 text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A] resize-none"
          />
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            onClick={handleSaveProfile}
            className="px-5 py-2.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#BF9A2A]" />
            <span>Save Profile Preferences</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Footer */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={() => onNavigateToTab('journal')}
          className="px-4 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#2B2827] border border-[#DDD7C8] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-[#BF9A2A]" />
          <span>Go to Cognitive Journal</span>
        </button>

        <button
          onClick={() => onNavigateToTab('insights')}
          className="px-4 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#2B2827] border border-[#DDD7C8] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Radio className="w-4 h-4 text-[#2F6A38]" />
          <span>Go to Forgetting-Cliff Insights</span>
        </button>
      </div>
    </div>
  );
};
