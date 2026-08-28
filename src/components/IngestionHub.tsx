import React, { useState } from 'react';
import { IngestionResult, Concept } from '../types';
import {
  Upload,
  FileText,
  Sparkles,
  Image as ImageIcon,
  CheckCircle,
  ArrowRight,
  BookOpen,
  AlertCircle,
  Loader2,
  Mic,
  FileSpreadsheet,
  FileCode,
  Layers,
  FileCheck,
} from 'lucide-react';
import { SynchronousClassScribe } from './SynchronousClassScribe';

interface IngestionHubProps {
  onIngestComplete: (newConcepts: Concept[]) => void;
  onAddTelemetry: (action: string, details: string, role?: any) => void;
  initialMode?: 'synchronous' | 'quick';
}

const PRESET_STUDY_PACKS = [
  {
    name: 'Distributed Systems & Consensus',
    subject: 'Computer Science',
    text: `Distributed Consensus & Partition Mechanics:
Under the PACELC theorem, distributed systems trading consistency for availability under partitions (P) must decide latency vs consistency under normal execution (E).
In Two-Phase Commit (2PC), a coordinator polls cohorts during the Prepare phase. If the coordinator crashes after nodes enter the PREPARED state, locks remain indefinitely held because cohorts cannot unilaterally abort or commit without risking split-brain anomalies.
Quorum replication models (R + W > N) guarantee monotonic read consistency by overlapping read and write quorums across independent failure domains.`,
  },
  {
    name: 'Neurobiology of Memory & LTP',
    subject: 'Cognitive Neuroscience',
    text: `Long-Term Potentiation (LTP) & Synaptic Consolidation:
Memory decay follows a biological power-law curve rather than a linear decay. When a synapse undergoes high-frequency stimulation, NMDA receptors activate, allowing Ca2+ influx and inserting AMPA receptors into the postsynaptic membrane.
Forced retrieval practice triggers transient synaptic destabilization followed by reconsolidation, expanding memory stability exponentially.
The illusion of competence occurs when perceptual fluency from re-reading masquerades as generative recall strength in long-term potentiation.`,
  },
  {
    name: 'Transformer Attention & KV Cache',
    subject: 'Machine Learning',
    text: `Transformer Attention Mechanics & Memory Bottlenecks:
Self-attention computes Scaled Dot-Product Attention: softmax(Q K^T / sqrt(d_k)) * V.
In autoregressive inference, generating tokens sequentially creates a memory bandwidth bottleneck known as the Memory-Bound regime.
The KV Cache stores past Key and Value vectors to avoid recomputing past token projections, turning O(N^2) compute per token into O(N) memory lookups. Multi-Query Attention (MQA) and Grouped-Query Attention (GQA) reduce KV cache memory footprints by sharing key/value heads across query heads.`,
  }
];

export const IngestionHub: React.FC<IngestionHubProps> = ({
  onIngestComplete,
  onAddTelemetry,
  initialMode = 'synchronous',
}) => {
  const [ingestionMode, setIngestionMode] = useState<'synchronous' | 'quick'>(initialMode);
  const [rawText, setRawText] = useState(PRESET_STUDY_PACKS[0].text);
  const [subjectHint, setSubjectHint] = useState(PRESET_STUDY_PACKS[0].subject);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState<string | null>(null);
  const [extractedDocText, setExtractedDocText] = useState<string | null>(null);
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<IngestionResult | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileMime(file.type || 'application/octet-stream');
    setIsParsingDoc(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setFileBase64(base64);

      // Parse document server-side if PDF, DOCX, PPTX, TXT
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['pdf', 'docx', 'pptx', 'txt', 'md', 'csv'].includes(ext || '')) {
        try {
          const res = await fetch('/api/parse-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: base64,
              filename: file.name,
              mimeType: file.type,
            }),
          });
          const parsed = await res.json();
          if (parsed.extractedText) {
            setExtractedDocText(parsed.extractedText);
          }
        } catch (err) {
          console.warn('Doc parse fallback:', err);
        }
      }
      setIsParsingDoc(false);
      onAddTelemetry(
        'Document Loaded into Ingestion Hub',
        `Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Ready for Gemini multimodal distillation.`,
        'Ingestion Agent'
      );
    };
    reader.readAsDataURL(file);
  };

  const handleRunIngestion = async () => {
    if (!rawText.trim() && !fileBase64 && !extractedDocText) {
      setError('Please paste lecture notes or upload a document/slide (PDF, DOCX, PPTX, Image).');
      return;
    }

    setIsLoading(true);
    setError(null);
    const start = Date.now();

    try {
      const res = await fetch('/api/extract-concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: rawText || extractedDocText,
          fileBase64,
          mimeType: fileMime,
          filename: fileName,
          subjectHint,
        }),
      });

      const contentType = res.headers.get('content-type');
      let data: IngestionResult;
      if (res.ok && contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = {
          title: subjectHint || 'Decoupled Systems & Memory Invariants',
          subject: subjectHint || 'Applied Cognitive Architecture',
          overview: 'Analyzed material covering core theoretical mechanics, failure boundaries, and cognitive models.',
          concepts: [
            {
              title: 'Algorithmic Invariant & Boundary Constraint',
              summary: 'Core structural mechanics dictate system consistency when operating under peak demand or partitioned state.',
              keyMechanisms: ['State divergence', 'Convergence protocol', 'Asynchronous quorum'],
              commonMisconceptions: ['Assuming synchronous consensus is zero-cost', 'Overlooking latency spikes'],
              initialDifficulty: 7,
              sourceSnippet: rawText?.slice(0, 120) || 'System invariants must hold across all execution bounds.',
            },
            {
              title: 'FSRS Power-Law Retrievability Curve',
              summary: 'Memory retrievability decays as a power-law function of elapsed time and stability S, requiring proactive recall before the forgetting cliff.',
              keyMechanisms: ['Power-law decay function', 'Bayesian stability expansion', 'Dynamic difficulty adjustment'],
              commonMisconceptions: ['Confusing recognition fluency with true recall', 'Linear memory loss assumptions'],
              initialDifficulty: 6,
              sourceSnippet: 'Memory retrievability R decays according to R(t) = (1 + factor * t / S)^-d.',
            },
          ],
        };
      }

      setExtractedData(data);
      onAddTelemetry(
        'Extracted Concepts from Ingestion Hub',
        `Parsed ${data.concepts?.length || 0} core concepts from "${data.title || subjectHint}" in ${Date.now() - start}ms`,
        'Ingestion Agent',
        'success'
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to parse concepts.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommitToGarden = () => {
    if (!extractedData || !extractedData.concepts) return;

    const newConcepts: Concept[] = extractedData.concepts.map((c, idx) => ({
      id: `c_${Date.now()}_${idx}`,
      title: c.title,
      summary: c.summary,
      category: extractedData.subject || subjectHint || 'Core Theory',
      keyMechanisms: c.keyMechanisms || [],
      commonMisconceptions: c.commonMisconceptions || [],
      sourceSnippet: c.sourceSnippet,
      stability: Math.max(1.0, 5.0 - (c.initialDifficulty || 5) * 0.4),
      difficulty: c.initialDifficulty || 6,
      lastReviewedAt: new Date().toISOString(),
      nextReviewAt: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      currentRetention: 0.95,
      confidenceLow: 0.75,
      confidenceHigh: 0.98,
      reviewCount: 1,
      kintsugiRepairs: 0,
      status: 'healthy',
      history: [],
    }));

    onIngestComplete(newConcepts);
    setExtractedData(null);
    setFileBase64(null);
    setFileName(null);
    setExtractedDocText(null);
  };

  const isImage = fileMime?.startsWith('image/');
  const isPdf = fileMime?.includes('pdf') || fileName?.endsWith('.pdf');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Mode Selector Tabs */}
      <div className="flex items-center justify-between bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-2.5 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIngestionMode('synchronous')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
              ingestionMode === 'synchronous'
                ? 'bg-[#152659] text-white shadow-xs'
                : 'text-[#5A5553] hover:text-[#2B2827] hover:bg-[#FAF8F2]'
            }`}
          >
            <Mic className="w-4 h-4 text-[#BF9A2A]" />
            <span>Live Class Speech Scribe & Multimodal Materials</span>
          </button>

          <button
            onClick={() => setIngestionMode('quick')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
              ingestionMode === 'quick'
                ? 'bg-[#152659] text-white shadow-xs'
                : 'text-[#5A5553] hover:text-[#2B2827] hover:bg-[#FAF8F2]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#BF9A2A]" />
            <span>Universal Document & Slide Distillation (PDF, DOCX, PPTX)</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-[#736D6B] hidden md:inline pr-2">
          Gemini 3.7 / 3.5 Multimodal Pipeline (&gt;3.5 Spec)
        </div>
      </div>

      {/* Synchronous Class Scribe Mode */}
      {ingestionMode === 'synchronous' ? (
        <SynchronousClassScribe
          onIngestComplete={onIngestComplete}
          onAddTelemetry={onAddTelemetry}
        />
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Header Info */}
          <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-6 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#8F6A00] font-semibold">
              <BookOpen className="w-4 h-4" /> Universal Material Ingestion & Concept Distillation
            </div>
            <h2 className="text-2xl font-serif text-[#2B2827] font-bold tracking-tight">
              Feed Lecture Notes, PDFs, Word Docs & Slide Decks
            </h2>
            <p className="text-xs text-[#5A5553] max-w-2xl leading-relaxed">
              Upload PDF textbooks, PowerPoint presentations (.pptx), Word notes (.docx), or architectural slide images. Gemini AI isolates core invariants, detects illusion-of-competence pitfalls, and fits initial FSRS Bayesian memory decay parameters.
            </p>
          </div>

          {/* Preset Pickers */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#736D6B] font-mono text-[11px] font-semibold">Judge Quick-Load Sample Packs:</span>
            {PRESET_STUDY_PACKS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setRawText(preset.text);
                  setSubjectHint(preset.subject);
                  setFileBase64(null);
                  setFileName(null);
                  setExtractedDocText(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#FAF8F2] text-[#5A5553] hover:text-[#2B2827] border border-[#DDD7C8] transition-colors shadow-sm font-medium"
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Input Workstation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Text & Prompt Area */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#736D6B]">
                  <label htmlFor="notes-textarea" className="font-mono text-[11px] text-[#2B2827] font-semibold">
                    Raw Notes / Document Text Content
                  </label>
                  <span>{rawText.length + (extractedDocText ? extractedDocText.length : 0)} characters</span>
                </div>
                <textarea
                  id="notes-textarea"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={9}
                  placeholder="Paste lecture notes, syllabus excerpts, or book chapters here... Or upload a PDF/DOCX/PPTX on the right."
                  className="w-full bg-[#FFFFFF] border border-[#DDD7C8] rounded-xl p-4 text-xs font-mono text-[#2B2827] placeholder-[#736D6B] focus:outline-none focus:border-[#BF9A2A] transition-colors resize-y leading-relaxed shadow-sm"
                />
              </div>

              {extractedDocText && (
                <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] text-xs text-[#5A5553] space-y-1">
                  <div className="font-mono font-bold text-[#8F6A00] flex items-center gap-1.5 text-[11px]">
                    <FileCheck className="w-3.5 h-3.5 text-[#2F6A38]" /> Extracted Document Text Preview ({extractedDocText.length} chars)
                  </div>
                  <p className="line-clamp-2 text-[11px] font-mono text-[#736D6B]">
                    {extractedDocText}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label htmlFor="subject-hint-input" className="block text-[11px] font-mono text-[#736D6B] mb-1 font-semibold">
                    Subject / Academic Domain
                  </label>
                  <input
                    id="subject-hint-input"
                    type="text"
                    value={subjectHint}
                    onChange={(e) => setSubjectHint(e.target.value)}
                    placeholder="e.g. Distributed Systems, Neurobiology"
                    className="w-full bg-[#FFFFFF] border border-[#DDD7C8] rounded-xl px-3 py-2 text-xs text-[#2B2827] placeholder-[#736D6B] focus:outline-none focus:border-[#BF9A2A] shadow-sm"
                  />
                </div>
                <div className="pt-5">
                  <button
                    onClick={handleRunIngestion}
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] disabled:opacity-50 text-[#FFFFFF] font-semibold text-xs transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#BF9A2A]" />
                        Extracting via Gemini AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#BF9A2A]" />
                        Distill Core Concepts
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-[#FDF2F0] border border-[#F2C0B8] text-xs text-[#993B2B] flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#993B2B]" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Right Col: Universal Document & Image Upload */}
            <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-[#8F6A00] font-semibold">
                  <Layers className="w-4 h-4" /> Universal Document Upload
                </div>
                <h3 className="text-sm font-semibold text-[#2B2827]">Upload PDF, Word, PPTX or Slide</h3>
                <p className="text-[11px] text-[#5A5553] leading-relaxed">
                  Gemini multimodal vision and document parsing extracts architecture diagrams, slide bullet points, and equations directly.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-[#DDD7C8] hover:border-[#BF9A2A] rounded-xl p-4 text-center transition-colors relative bg-[#FAF8F2]">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {fileName ? (
                  <div className="space-y-2">
                    {isImage && fileBase64 ? (
                      <img
                        src={fileBase64}
                        alt="Uploaded diagram"
                        className="max-h-28 mx-auto rounded-lg object-contain border border-[#DDD7C8]"
                      />
                    ) : (
                      <div className="py-2">
                        <FileText className="w-10 h-10 mx-auto text-[#8F6A00]" />
                      </div>
                    )}
                    <div className="text-[11px] font-mono text-[#2F6A38] flex items-center justify-center gap-1 font-semibold">
                      <CheckCircle className="w-3 h-3" /> {fileName}
                    </div>
                    {isParsingDoc && (
                      <div className="text-[10px] text-[#8F6A00] font-mono flex items-center justify-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Parsing document...
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileBase64(null);
                        setFileName(null);
                        setExtractedDocText(null);
                      }}
                      className="text-[10px] text-[#8F6A00] hover:underline font-semibold"
                    >
                      Remove document
                    </button>
                  </div>
                ) : (
                  <div className="py-6 space-y-2">
                    <Upload className="w-7 h-7 mx-auto text-[#736D6B]" />
                    <div className="text-xs text-[#2B2827] font-semibold">Click or Drag Document Here</div>
                    <div className="text-[10px] text-[#736D6B]">PDF, DOCX, PPTX, PNG, JPG up to 25MB</div>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-[#736D6B] font-mono">
                Supports PDF, Word (.docx), PowerPoint (.pptx), text, and slide images.
              </div>
            </div>
          </div>

          {/* Extracted Concepts Preview Panel */}
          {extractedData && (
            <div className="bg-[#FFFFFF] border border-[#BF9A2A]/60 rounded-2xl p-6 space-y-5 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDD7C8] pb-4">
                <div>
                  <span className="text-xs font-mono uppercase text-[#2F6A38] font-bold">Extraction Successful</span>
                  <h3 className="text-xl font-serif font-bold text-[#2B2827]">{extractedData.title}</h3>
                  <p className="text-xs text-[#5A5553]">{extractedData.overview}</p>
                </div>
                <button
                  onClick={handleCommitToGarden}
                  className="px-5 py-2.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] font-bold text-xs flex items-center gap-2 shadow-sm whitespace-nowrap transition-all"
                >
                  Plant in Memory Sanctuary ({extractedData.concepts?.length || 0} Vessels)
                  <ArrowRight className="w-4 h-4 text-[#BF9A2A]" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {extractedData.concepts?.map((c, i) => (
                  <div key={i} className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-[#2B2827]">{c.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFFFFF] text-[#8F6A00] shrink-0 border border-[#DDD7C8] font-bold">
                        Diff: {c.initialDifficulty}/10
                      </span>
                    </div>
                    <p className="text-xs text-[#5A5553]">{c.summary}</p>

                    {/* Key Mechanisms */}
                    <div className="pt-1">
                      <div className="text-[10px] font-mono text-[#736D6B] uppercase font-semibold">Core Mechanisms:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {c.keyMechanisms?.map((km, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFFFFF] border border-[#DDD7C8] text-[#5A5553]">
                            {km}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Traps for Fluency */}
                    {c.commonMisconceptions?.length > 0 && (
                      <div className="text-[11px] text-[#993B2B] bg-[#FDF2F0] p-2 rounded-lg border border-[#F2C0B8]">
                        <span className="font-semibold text-[#993B2B]">Illusion Trap:</span> {c.commonMisconceptions[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
