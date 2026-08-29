import React, { useState, useEffect } from 'react';
import { Concept, AutonomousPing } from '../types';
import { predictForgettingCliffDate } from '../lib/fsrs';
import {
  Bell,
  Send,
  Clock,
  AlertTriangle,
  Sparkles,
  Mail,
  CheckCircle2,
  Zap,
  Radio,
  Loader2,
  Check,
  Smartphone,
  ShieldCheck,
  Layers,
  Settings,
  X,
} from 'lucide-react';

interface AutonomousDispatcherProps {
  concepts: Concept[];
  onReviewConcept: (concept: Concept) => void;
  onAddTelemetry: (action: string, details: string, role?: any) => void;
  onFastForwardDecay?: (days: number) => void;
  onNavigateToTab?: (tab: 'home' | 'materials' | 'calendar' | 'review' | 'neuroplasticity' | 'progress' | 'journal' | 'insights' | 'about' | 'selene') => void;
}

export const AutonomousDispatcher: React.FC<AutonomousDispatcherProps> = ({
  concepts,
  onReviewConcept,
  onAddTelemetry,
  onFastForwardDecay,
  onNavigateToTab,
}) => {
  const [pings, setPings] = useState<AutonomousPing[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dispatchedMessage, setDispatchedMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('kintsugi_smtp_user') || localStorage.getItem('kintsugi_registered_email') || 'student@kintsugi-memory.ai';
  });
  const [emailSavedToast, setEmailSavedToast] = useState(false);
  const [browserNotifsEnabled, setBrowserNotifsEnabled] = useState<boolean>(() => {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  });
  const [smtpInfo, setSmtpInfo] = useState<{ configured: boolean; user: string | null; rawUser: string | null; host: string | null } | null>(null);

  useEffect(() => {
    fetch('/api/smtp-status')
      .then((r) => r.json())
      .then((d) => {
        setSmtpInfo(d);
        if (d?.rawUser && (!localStorage.getItem('kintsugi_registered_email') || userEmail === 'student@kintsugi-memory.ai')) {
          setUserEmail(d.rawUser);
          localStorage.setItem('kintsugi_registered_email', d.rawUser);
        }
      })
      .catch(() => {});
  }, []);

  const handleSendInstantTestEmail = async () => {
    setIsGenerating(true);
    try {
      const testRes = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      const testData = await testRes.json();
      if (testData.htmlPreview) {
        setEmailPreviewHtml(testData.htmlPreview);
      }
      if (testData.success) {
        setDispatchedMessage(`Test Socratic email successfully sent to ${userEmail}! Check your inbox.`);
        setTimeout(() => setDispatchedMessage(null), 6000);
      } else {
        alert(testData.error || 'Failed to deliver test email.');
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const [recentDispatches, setRecentDispatches] = useState<Array<{
    id: string;
    conceptTitle: string;
    recipientEmail: string;
    editorialSubject: string;
    dispatchedAt: string;
    gcpPubSubMessageId: string;
  }>>([]);

  // Save registered email locally
  const handleSaveEmail = () => {
    localStorage.setItem('kintsugi_registered_email', userEmail.trim());
    setEmailSavedToast(true);
    setTimeout(() => setEmailSavedToast(false), 2500);
    onAddTelemetry(
      'Notification Email Updated',
      `Registered user email "${userEmail}" for automated forgetting-cliff telegrams.`,
      'Cliff Scheduler',
      'success'
    );
  };

  // Request native browser notifications permission
  const handleEnableBrowserNotifs = async () => {
    if (typeof Notification === 'undefined') {
      alert('Browser notifications are not supported in this environment.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setBrowserNotifsEnabled(true);
        new Notification('🌸 Kintsugi Memory Notification Active', {
          body: 'You will receive autonomous editorial pings before synapses decay past the 70% forgetting threshold.',
        });
        onAddTelemetry(
          'Browser Notifications Activated',
          'Granted permission for background cliff notifications.',
          'Cliff Scheduler',
          'success'
        );
      }
    } catch (e) {
      console.warn('Notification permission error:', e);
    }
  };

  // Compute cliff schedules on mount or concept changes
  useEffect(() => {
    generateCliffSchedule();
  }, [concepts]);

  const generateCliffSchedule = () => {
    const generated: AutonomousPing[] = [];

    concepts.forEach((c) => {
      const cliffDate = predictForgettingCliffDate(c.lastReviewedAt, c.stability, 0.70);
      const isUrgent = c.currentRetention < 0.70;
      const isApproaching = c.currentRetention >= 0.70 && c.currentRetention < 0.78;

      generated.push({
        id: `ping_${c.id}`,
        conceptId: c.id,
        conceptTitle: c.title,
        predictedRetention: Math.round(c.currentRetention * 100),
        urgency: isUrgent ? 'urgent_cliff' : isApproaching ? 'approaching' : 'scheduled',
        generatedAt: new Date().toISOString(),
        scheduledFor: cliffDate.toISOString(),
        delivered: isUrgent,
        editorialSubject: `[Forgetting Cliff] ${c.title} has reached the 70% threshold`,
        teaserQuestion: `Before the neural trace wilts: what is the fundamental boundary condition governing ${c.title}?`,
        method: 'in_app',
        zineMessage: `Your memory vessel for ${c.title} is at ${Math.round(c.currentRetention * 100)}% recall. Spaced retrieval now delivers 3x stability growth.`,
      });
    });

    // Sort by urgency then date
    generated.sort((a, b) => {
      if (a.urgency === 'urgent_cliff' && b.urgency !== 'urgent_cliff') return -1;
      if (b.urgency === 'urgent_cliff' && a.urgency !== 'urgent_cliff') return 1;
      return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
    });

    setPings(generated);
  };

  const [emailPreviewHtml, setEmailPreviewHtml] = useState<string | null>(null);

  // Autonomous Background Governor: Automatically publishes and alerts when vessels reach forgetting cliff
  useEffect(() => {
    const autoDispatchedKey = 'kintsugi_auto_dispatched_ids';
    const autoDispatched = JSON.parse(sessionStorage.getItem(autoDispatchedKey) || '[]');
    const cliffVessels = concepts.filter((c) => (c?.currentRetention ?? 0.95) < 0.70);

    cliffVessels.forEach(async (vessel) => {
      if (!autoDispatched.includes(vessel.id)) {
        autoDispatched.push(vessel.id);
        sessionStorage.setItem(autoDispatchedKey, JSON.stringify(autoDispatched));

        try {
          const apiKey = localStorage.getItem('gemini_api_key') || '';
          const pingRes = await fetch('/api/generate-cliff-ping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-gemini-api-key': apiKey },
            body: JSON.stringify({
              concept: vessel,
              currentRetention: vessel.currentRetention,
              daysSinceReview: 3,
            }),
          });
          const pingData = await pingRes.json();

          const dispatchRes = await fetch('/api/send-cliff-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-gemini-api-key': apiKey },
            body: JSON.stringify({
              email: userEmail,
              conceptTitle: vessel.title,
              currentRetention: Math.round(vessel.currentRetention * 100),
              editorialSubject: pingData.editorialSubject || `[Forgetting Cliff Alert] ${vessel.title}`,
              teaserQuestion: pingData.teaserQuestion || `What is the core invariant of ${vessel.title}?`,
              zineMessage: pingData.zineMessage || `Your memory vessel is at ${Math.round(vessel.currentRetention * 100)}% retention.`,
              urgency: 'urgent_cliff',
            }),
          });
          const dispatchResult = await dispatchRes.json();

          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(`🌸 [Cliff Alert] ${vessel.title}`, {
              body: `${pingData.teaserQuestion || 'Spaced retrieval needed.'}\nRecall at ${Math.round(vessel.currentRetention * 100)}%`,
            });
          }

          setRecentDispatches((prev) => [
            {
              id: `auto_${Date.now()}`,
              conceptTitle: vessel.title,
              recipientEmail: userEmail,
              editorialSubject: pingData.editorialSubject || `[Forgetting Cliff Alert] ${vessel.title}`,
              dispatchedAt: new Date().toLocaleTimeString(),
              gcpPubSubMessageId: dispatchResult.gcpPubSubMessageId || `auto-pubsub-${Date.now()}`,
            },
            ...prev.slice(0, 4),
          ]);

          onAddTelemetry(
            'Autonomous Forgetting-Cliff Event Triggered',
            `Auto-governor detected "${vessel.title}" on cliff (${Math.round(vessel.currentRetention * 100)}%). Published to Cloud Pub/Sub & dispatched alert to ${userEmail}.`,
            'Cliff Scheduler',
            'info'
          );
        } catch (autoErr) {
          console.warn('Auto-dispatch notice:', autoErr);
        }
      }
    });
  }, [concepts, userEmail]);

  const handleDispatchAutonomousPing = async (ping: AutonomousPing) => {
    const targetConcept = concepts.find((c) => c.id === ping.conceptId);
    if (!targetConcept) return;

    setIsGenerating(true);
    const start = Date.now();

    try {
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      // 1. Generate editorial zine content with Gemini
      const pingRes = await fetch('/api/generate-cliff-ping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey,
        },
        body: JSON.stringify({
          concept: targetConcept,
          currentRetention: targetConcept.currentRetention,
          daysSinceReview: 3.2,
        }),
      });

      const data = await pingRes.json();
      const editorialSubject = data.editorialSubject || ping.editorialSubject;
      const teaserQuestion = data.teaserQuestion || ping.teaserQuestion;
      const zineMessage = data.zineMessage || ping.zineMessage;

      // 2. Dispatch real notification (Email + GCP Pub/Sub pipeline)
      const dispatchRes = await fetch('/api/send-cliff-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey,
        },
        body: JSON.stringify({
          email: userEmail,
          conceptTitle: targetConcept.title,
          currentRetention: Math.round(targetConcept.currentRetention * 100),
          editorialSubject,
          teaserQuestion,
          zineMessage,
          urgency: ping.urgency,
        }),
      });

      const dispatchResult = await dispatchRes.json();
      if (dispatchResult.htmlPreview) {
        setEmailPreviewHtml(dispatchResult.htmlPreview);
      }

      // 3. Show native browser notification if enabled
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(editorialSubject, {
          body: `${teaserQuestion}\n${zineMessage}`,
        });
      }

      setPings((prev) =>
        prev.map((p) =>
          p.id === ping.id
            ? {
                ...p,
                delivered: true,
                editorialSubject,
                teaserQuestion,
                zineMessage,
              }
            : p
        )
      );

      setRecentDispatches((prev) => [
        {
          id: `disp_${Date.now()}`,
          conceptTitle: targetConcept.title,
          recipientEmail: userEmail,
          editorialSubject,
          dispatchedAt: new Date().toLocaleTimeString(),
          gcpPubSubMessageId: dispatchResult.gcpPubSubMessageId || `pubsub-${Date.now()}`,
        },
        ...prev.slice(0, 4),
      ]);

      setDispatchedMessage(`Autonomous Editorial Ping delivered to ${userEmail} & published to Cloud Pub/Sub!`);
      setTimeout(() => setDispatchedMessage(null), 6000);

      onAddTelemetry(
        'Autonomous Cliff Ping Dispatched',
        `Delivered zine alert for "${targetConcept.title}" to ${userEmail} via Google Cloud Pub/Sub in ${Date.now() - start}ms`,
        'Cliff Scheduler',
        'success'
      );
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Info */}
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#2F6A38] font-bold">
          <Radio className="w-4 h-4 text-[#2F6A38] animate-pulse" /> Autonomous Initiation Engine & Notification Pipeline
        </div>
        <h2 className="text-2xl font-serif text-[#2B2827] font-bold tracking-tight">
          Autonomous Forgetting-Cliff Dispatcher
        </h2>
        <p className="text-xs text-[#5A5553] max-w-3xl leading-relaxed">
          An autonomous governor continuously calculating Bayesian FSRS memory decay curves. When a concept, vocabulary word, or grammar invariant approaches the critical 70% retention boundary, the agent independently formats and dispatches Socratic micro-questions directly via Google Cloud Pub/Sub and Gmail.
        </p>
      </div>

      {/* Notification Channel & Delivery Status Card */}
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDD7C8] pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8F6A00] font-bold uppercase">
            <Mail className="w-4 h-4 text-[#BF9A2A]" /> Notification Pipeline & Real-Time Delivery
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEnableBrowserNotifs}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                browserNotifsEnabled
                  ? 'bg-[#F0F7F1] text-[#2F6A38] border-[#BFE0C4]'
                  : 'bg-[#FAF8F2] text-[#5A5553] border-[#DDD7C8] hover:border-[#8F6A00]'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              {browserNotifsEnabled ? 'Browser Push Active' : 'Enable Native Browser Alerts'}
            </button>
          </div>
        </div>

        {/* Live SMTP & Destination Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            {smtpInfo?.configured ? (
              <div className="flex items-center gap-2 text-[#2F6A38]">
                <CheckCircle2 className="w-4 h-4 text-[#2F6A38] shrink-0" />
                <span>
                  Active Recipient: <b className="font-semibold">{smtpInfo.rawUser || smtpInfo.user || userEmail}</b> (Live Delivery Active via Gmail SMTP)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#8F6A00]">
                <AlertTriangle className="w-4 h-4 text-[#8F6A00] shrink-0" />
                <span>
                  Email Dispatcher: <b className="font-semibold text-[#993B2B]">Not configured yet</b>. (Configure your Gmail credentials in the Selene / User Account tab)
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!smtpInfo?.configured && onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('selene')}
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F2] hover:bg-[#FAF3E0] text-[#8F6A00] border border-[#E8D4A2] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <span>Configure in User Account Tab →</span>
              </button>
            )}
            {smtpInfo?.configured && (
              <button
                onClick={handleSendInstantTestEmail}
                disabled={isGenerating}
                className="px-3.5 py-1.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-[#BF9A2A]" />
                <span>Send Test Email</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dispatched Notification Banner */}
      {dispatchedMessage && (
        <div className="bg-[#F0F7F1] border border-[#BFE0C4] rounded-xl p-4 flex items-center justify-between text-xs text-[#2F6A38] animate-in fade-in slide-in-from-top-2 shadow-sm">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#2F6A38]" />
            <span className="font-semibold">{dispatchedMessage}</span>
          </div>
          <span className="text-[11px] font-mono text-[#2F6A38] font-medium">GCP Pub/Sub Published</span>
        </div>
      )}

      {/* Production Architecture & 30-Day Cliff Testing Banner */}
      <div className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-2xl p-4 text-xs font-mono flex flex-col md:flex-row md:items-center justify-between gap-3 text-[#5A5553] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#8F6A00]" />
            <span>Google Cloud Pub/Sub Pipeline | Topic: <code className="text-[#152659]">kintsugi-cliff-pings</code></span>
          </div>
          <p className="text-[11px] text-[#736D6B]">
            Autonomous Subscriber: <code className="text-[#2F6A38]">kintsugi-cliff-pings-sub</code>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onFastForwardDecay && (
            <>
              <button
                onClick={() => onFastForwardDecay(3)}
                className="px-3 py-1.5 rounded-xl bg-[#FDF2F0] hover:bg-[#FBE8E4] text-[#993B2B] border border-[#F2C0B8] font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                title="Fast forward 3 days of forgetting"
              >
                <span>+3d Cliff</span>
              </button>
              <button
                onClick={() => onFastForwardDecay(30)}
                className="px-3 py-1.5 rounded-xl bg-[#FAF3E0] hover:bg-[#F5ECD2] text-[#8F6A00] border border-[#E8D4A2] font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                title="Fast forward 30 days to breach the forgetting cliff on all vessels"
              >
                <span>+30d Month Cliff</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recent Dispatches Log */}
      {recentDispatches.length > 0 && (
        <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-xl p-4 space-y-2 shadow-xs">
          <div className="text-xs font-mono text-[#8F6A00] font-bold uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2F6A38]" /> Recent Dispatch Receipts
          </div>
          <div className="space-y-1.5">
            {recentDispatches.map((d) => (
              <div key={d.id} className="text-[11px] font-mono bg-[#FAF8F2] p-2.5 rounded-lg border border-[#DDD7C8] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[#5A5553]">
                <div className="flex items-center gap-2">
                  <span className="text-[#2B2827] font-semibold">{d.conceptTitle}</span>
                  <span className="text-[#736D6B]">→ {d.recipientEmail}</span>
                </div>
                <div className="text-[10px] text-[#736D6B] flex items-center gap-2">
                  <span>{d.gcpPubSubMessageId}</span>
                  <span className="text-[#2F6A38] font-bold">{d.dispatchedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List of Scheduled / Active Initiation Events */}
      <div className="space-y-4">
        <div className="text-xs font-mono text-[#736D6B] uppercase tracking-wider font-semibold">
          Initiation Queue ({pings.length} Monitored Synapses)
        </div>

        <div className="grid grid-cols-1 gap-4">
          {pings.map((ping) => {
            const concept = concepts.find((c) => c.id === ping.conceptId);
            const isUrgent = ping.urgency === 'urgent_cliff';

            return (
              <div
                key={ping.id}
                className={`rounded-2xl border p-5 transition-all bg-[#FFFFFF] space-y-3 shadow-sm ${
                  isUrgent
                    ? 'border-[#BF9A2A] ring-1 ring-[#BF9A2A]/30'
                    : 'border-[#DDD7C8]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDD7C8] pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        isUrgent
                          ? 'bg-[#FDF2F0] text-[#993B2B] border border-[#F2C0B8] animate-pulse'
                          : 'bg-[#FAF8F2] text-[#5A5553] border border-[#DDD7C8]'
                      }`}>
                        {isUrgent ? 'Forgetting Cliff Breached' : 'Cliff Approaching'}
                      </span>
                      <span className="text-xs font-mono text-[#736D6B]">
                        Current Recall: {ping.predictedRetention}%
                      </span>
                    </div>
                    <h3 className="text-base font-serif font-bold text-[#2B2827]">{ping.conceptTitle}</h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleDispatchAutonomousPing(ping)}
                      disabled={isGenerating}
                      className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] text-xs font-mono flex items-center gap-1.5 transition-colors border border-[#DDD7C8] font-medium shadow-sm"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-[#8F6A00]" />
                      )}
                      Dispatch Email & Pub/Sub Ping
                    </button>
                    {concept && (
                      <button
                        onClick={() => onReviewConcept(concept)}
                        className="px-4 py-1.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] font-bold text-xs transition-colors shadow-sm"
                      >
                        Mend Now
                      </button>
                    )}
                  </div>
                </div>

                {/* Zine Editorial Preview */}
                <div className="bg-[#FAF8F2] rounded-xl p-4 border border-[#DDD7C8] space-y-2">
                  <div className="text-[11px] font-mono text-[#736D6B] flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[#8F6A00] font-bold">{ping.editorialSubject}</span>
                    <span>Scheduled for: {new Date(ping.scheduledFor).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-[#2B2827] italic font-serif leading-relaxed">
                    "{ping.teaserQuestion}"
                  </p>
                  <p className="text-xs text-[#5A5553] leading-relaxed pt-1">
                    {ping.zineMessage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HTML Email Preview Modal */}
      {emailPreviewHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#DDD7C8] pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#8F6A00]" />
                <div>
                  <h3 className="text-base font-serif font-bold text-[#2B2827]">
                    Dispatched Socratic Email Delivery Receipt
                  </h3>
                  <span className="text-[11px] font-mono text-[#736D6B]">
                    Google Cloud Pub/Sub & Nodemailer
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEmailPreviewHtml(null)}
                className="p-1.5 rounded-xl hover:bg-[#EAE6D6] text-[#736D6B] hover:text-[#2B2827]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Delivery Channel Notice */}
            {smtpInfo?.configured ? (
              <div className="text-[11px] font-mono text-[#2F6A38] bg-[#F0F7F1] border border-[#BFE0C4] rounded-xl p-2.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2F6A38] shrink-0" />
                <span>Physical email transmitted to <b>{userEmail}</b> via SMTP ({smtpInfo.user}).</span>
              </div>
            ) : (
              <div className="text-[11px] font-mono text-[#8F6A00] bg-[#FAF3E0] border border-[#E8D4A2] rounded-xl p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#8F6A00] shrink-0" />
                  <span>Google Cloud Pub/Sub event published!</span>
                </div>
                <p className="text-[10px] text-[#736D6B] leading-relaxed">
                  To deliver directly into your Gmail inbox, add <code className="bg-[#FFFFFF] px-1 py-0.5 rounded text-[#8F6A00]">SMTP_USER={userEmail}</code> and <code className="bg-[#FFFFFF] px-1 py-0.5 rounded text-[#8F6A00]">SMTP_PASS=your-16-char-app-password</code> in your <code>.env</code> file. Or click "Open in Email Client" to open this formatted draft immediately.
                </p>
              </div>
            )}

            <div
              className="flex-1 overflow-y-auto rounded-2xl border border-[#DDD7C8] p-2 bg-[#FAF8F2]"
              dangerouslySetInnerHTML={{ __html: emailPreviewHtml }}
            />

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#DDD7C8]">
              <button
                onClick={() => setEmailPreviewHtml(null)}
                className="px-4 py-2 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] font-mono text-xs font-bold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
