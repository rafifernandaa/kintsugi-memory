import React, { useState } from 'react';
import { Concept } from '../types';
import {
  Bell,
  X,
  Sparkles,
  AlertTriangle,
  Send,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Mail,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface PubSubNotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  concepts: Concept[];
  onStartRetrievalForConcept: (concept: Concept) => void;
  onNavigateToInsights: () => void;
  onAddTelemetry: (action: string, details: string, role?: any, type?: any) => void;
}

export const PubSubNotificationPopover: React.FC<PubSubNotificationPopoverProps> = ({
  isOpen,
  onClose,
  concepts,
  onStartRetrievalForConcept,
  onNavigateToInsights,
  onAddTelemetry,
}) => {
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('kintsugi_registered_email') || 'student@kintsugi-memory.ai';
  });
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<Record<string, string>>({});
  const [emailPreviewHtml, setEmailPreviewHtml] = useState<string | null>(null);

  if (!isOpen) return null;

  const cliffConcepts = concepts.filter((c) => (c?.currentRetention ?? 0.95) < 0.70);
  const approachingConcepts = concepts.filter(
    (c) => (c?.currentRetention ?? 0.95) >= 0.70 && (c?.currentRetention ?? 0.95) < 0.80
  );

  const handleSaveEmail = (newEmail: string) => {
    const clean = newEmail.trim();
    if (clean) {
      setUserEmail(clean);
      localStorage.setItem('kintsugi_registered_email', clean);
      setIsEditingEmail(false);
      onAddTelemetry(
        'Notification Email Updated',
        `Registered user email "${clean}" for automatic Google Cloud Pub/Sub cliff dispatches.`,
        'Cliff Scheduler',
        'success'
      );
    }
  };

  const handleManualDispatch = async (concept: Concept) => {
    setDispatchStatus((prev) => ({ ...prev, [concept.id]: 'dispatching' }));
    try {
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      // 1. Generate Socratic teaser
      const pingRes = await fetch('/api/generate-cliff-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-gemini-api-key': apiKey },
        body: JSON.stringify({
          concept,
          currentRetention: concept.currentRetention,
          daysSinceReview: 3,
        }),
      });
      const pingData = await pingRes.json();

      // 2. Dispatch to Pub/Sub & Email
      const res = await fetch('/api/send-cliff-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-gemini-api-key': apiKey },
        body: JSON.stringify({
          email: userEmail,
          conceptTitle: concept.title,
          currentRetention: Math.round(concept.currentRetention * 100),
          editorialSubject: pingData.editorialSubject || `[Forgetting Cliff Alert] ${concept.title}`,
          teaserQuestion: pingData.teaserQuestion || `What is the key invariant of ${concept.title}?`,
          zineMessage: pingData.zineMessage || `Your memory vessel is at ${Math.round(concept.currentRetention * 100)}% retention.`,
          urgency: 'urgent_cliff',
        }),
      });
      const dispatchData = await res.json();

      setDispatchStatus((prev) => ({
        ...prev,
        [concept.id]: `Delivered (${dispatchData.gcpPubSubMessageId?.substring(0, 14)}...)`,
      }));

      if (dispatchData.htmlPreview) {
        setEmailPreviewHtml(dispatchData.htmlPreview);
      }

      onAddTelemetry(
        'Autonomous Pub/Sub Alert Dispatched',
        `Dispatched forgetting cliff alert for "${concept.title}" to ${userEmail} via GCP Pub/Sub.`,
        'Cliff Scheduler',
        'success'
      );
    } catch (err: any) {
      setDispatchStatus((prev) => ({ ...prev, [concept.id]: 'Failed' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/20 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] mt-12 sm:mt-16 mr-0 sm:mr-4 animate-in slide-in-from-top-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#DDD7C8] bg-[#FAF8F2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#BF9A2A]/15 border border-[#BF9A2A]/40 flex items-center justify-center text-[#8F6A00]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-serif font-bold text-[#2B2827]">
                  Autonomous Cliff Alerts
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#EBF0FA] text-[#152659] border border-[#BDCCEB]">
                  <Radio className="w-2.5 h-2.5 text-[#152659] animate-pulse" /> Pub/Sub Live
                </span>
              </div>
              <p className="text-[11px] text-[#736D6B] font-mono">
                Topic: <code className="text-[#8F6A00]">kintsugi-cliff-pings</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#EAE6D6] text-[#736D6B] hover:text-[#2B2827] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Email Registration Bar */}
        <div className="px-4 py-2.5 bg-[#FAF3E0] border-b border-[#E8D4A2] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#8F6A00] truncate flex-1 mr-2">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            {isEditingEmail ? (
              <input
                type="email"
                defaultValue={userEmail}
                onBlur={(e) => handleSaveEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEmail((e.target as HTMLInputElement).value)}
                autoFocus
                placeholder="Enter notification email..."
                className="w-full bg-[#FFFFFF] border border-[#BF9A2A] rounded px-2 py-0.5 text-xs text-[#2B2827] focus:outline-none"
              />
            ) : (
              <span className="truncate font-semibold">{userEmail}</span>
            )}
          </div>
          <button
            onClick={() => setIsEditingEmail(!isEditingEmail)}
            className="text-[11px] text-[#8F6A00] hover:underline font-bold shrink-0 cursor-pointer"
          >
            {isEditingEmail ? 'Save' : 'Change'}
          </button>
        </div>

        {/* Notification List Body */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 scrollbar-thin">
          {cliffConcepts.length === 0 && approachingConcepts.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#F0F7F1] border border-[#BFE0C4] flex items-center justify-center text-[#2F6A38] mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-serif font-bold text-[#2B2827]">
                All Synaptic Vessels Healthy
              </h4>
              <p className="text-xs text-[#5A5553] max-w-xs mx-auto">
                No memory vessels are currently on the forgetting cliff. Autonomous Pub/Sub monitors memory decay in real-time.
              </p>
            </div>
          ) : (
            <>
              {cliffConcepts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#993B2B]">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Critical Cliff Threshold (&lt;70%)
                    </span>
                    <span>{cliffConcepts.length} Vessel{cliffConcepts.length > 1 ? 's' : ''}</span>
                  </div>

                  {cliffConcepts.map((concept) => {
                    const retPct = Math.round((concept.currentRetention ?? 0.65) * 100);
                    const status = dispatchStatus[concept.id];

                    return (
                      <div
                        key={concept.id}
                        className="p-3 rounded-2xl bg-[#FDF2F0] border border-[#F2C0B8] space-y-2 relative"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#FFFFFF] border border-[#F2C0B8] text-[#993B2B] font-semibold">
                              {concept.category}
                            </span>
                            <h4 className="text-xs font-serif font-bold text-[#2B2827] pt-0.5">
                              {concept.title}
                            </h4>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#993B2B] bg-[#FFFFFF] px-2 py-0.5 rounded-lg border border-[#F2C0B8]">
                            {retPct}% Recall
                          </span>
                        </div>

                        <p className="text-[11px] text-[#5A5553] line-clamp-2 leading-relaxed">
                          {concept.summary}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => {
                              onClose();
                              onStartRetrievalForConcept(concept);
                            }}
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] text-[11px] font-mono font-semibold flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-[#BF9A2A]" />
                            <span>Mend Vessel</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => handleManualDispatch(concept)}
                            disabled={status === 'dispatching'}
                            className="py-1.5 px-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EAE6D6] text-[#8F6A00] border border-[#DDD7C8] text-[11px] font-mono font-semibold flex items-center gap-1 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                            title="Dispatch editorial email alert via Pub/Sub"
                          >
                            <Send className="w-3 h-3" />
                            <span>{status ? status : 'Send Alert'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {approachingConcepts.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#8F6A00]">
                    <span>Approaching Cliff (70–80%)</span>
                    <span>{approachingConcepts.length}</span>
                  </div>
                  {approachingConcepts.map((concept) => (
                    <div
                      key={concept.id}
                      className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-serif font-bold text-[#2B2827] truncate">
                          {concept.title}
                        </div>
                        <span className="text-[10px] font-mono text-[#736D6B]">
                          {Math.round((concept.currentRetention ?? 0.75) * 100)}% retention
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          onStartRetrievalForConcept(concept);
                        }}
                        className="text-xs font-mono text-[#8F6A00] hover:underline font-semibold shrink-0 cursor-pointer"
                      >
                        Mend →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#FAF8F2] border-t border-[#DDD7C8] flex items-center justify-between text-xs font-mono">
          <button
            onClick={() => {
              onClose();
              onNavigateToInsights();
            }}
            className="text-[#152659] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Open Pub/Sub Dispatch Hub</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          <span className="text-[10px] text-[#736D6B]">Google Cloud Pub/Sub</span>
        </div>
      </div>

      {/* HTML Email Preview Modal */}
      {emailPreviewHtml && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#DDD7C8] pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#8F6A00]" />
                <h3 className="text-sm font-serif font-bold text-[#2B2827]">
                  Dispatched Email Preview
                </h3>
              </div>
              <button
                onClick={() => setEmailPreviewHtml(null)}
                className="p-1 rounded-lg text-[#736D6B] hover:text-[#2B2827]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              className="flex-1 overflow-y-auto rounded-xl border border-[#DDD7C8] p-2 bg-[#FAF8F2] text-xs"
              dangerouslySetInnerHTML={{ __html: emailPreviewHtml }}
            />
            <button
              onClick={() => setEmailPreviewHtml(null)}
              className="w-full py-2 rounded-xl bg-[#152659] text-[#FFFFFF] font-mono text-xs font-bold"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
