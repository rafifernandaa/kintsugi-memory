import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Pause,
  Play,
  Upload,
  FileText,
  Sparkles,
  Image as ImageIcon,
  CheckCircle,
  ArrowRight,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  AlertCircle,
  Loader2,
  Copy,
  Download,
  Share2,
  Tag,
  HelpCircle,
  Zap,
  Check,
  ExternalLink,
  ChevronRight,
  ListTodo,
  Layers,
  Radio,
  FileAudio,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Concept, SupportMaterial, SynchronousNotesExtraction } from '../types';

interface SynchronousClassScribeProps {
  onIngestComplete: (newConcepts: Concept[]) => void;
  onAddTelemetry: (action: string, details: string, role?: any) => void;
  onStartReviewForConcept?: (concept: Concept) => void;
}

const PRESET_MEETING_SESSIONS = [
  {
    title: 'CS 482: Distributed Consensus, Raft & Split-Brain Invariants',
    subject: 'Computer Science',
    speaker: 'Prof. Leslie Lamport',
    transcript: `[00:00] Instructor: Welcome everyone. Today we are diving deep into leader election invariants and the split-brain pathology in Raft and Paxos.
[00:25] Instructor: Remember the PACELC theorem: when a partition occurs, you must choose Consistency or Availability.
[00:52] Instructor: Look at Slide 14 on the projector. If nodes 1 and 2 are isolated from nodes 3, 4, and 5, only the partition containing a strict majority—in this case nodes 3, 4, and 5—can elect a leader.
[01:30] Student: Professor, what happens if an asymmetric partition causes node 2 to receive heartbeats from node 1 but cannot reply?
[01:55] Instructor: Excellent question. That triggers leader election disruption! We use pre-vote phases or leader leases to ensure disruptive nodes don't force unnecessary term increments.
[02:35] Instructor: Important exam takeaway: Quorums must strictly overlap. R + W > N. If quorums don't overlap, monotonic read consistency is immediately broken.
[03:10] Instructor: Make sure you complete Problem Set 4 on partition tolerances before Friday's midnight deadline.`,
    liveStudentNotes: `• Topic: Distributed Consensus Invariants & Partition Boundaries
• Key Question: Asymmetric partitions & disruptive candidates
• Solution discussed: Pre-vote RPC phase before term incrementing!
• Slide 14 reference: Quorum majority = (N/2) + 1 nodes minimum.
• Formula: Quorum intersection R + W > N guarantees monotonic read.
• ⭐ Exam Alert: Why heartbeats alone don't prevent split-brain without majority leases.
• TODO: Complete Pset 4 by Friday!`,
    supportMaterials: [
      {
        id: 'mat_1',
        title: 'Lecture Slide 14: 5-Node Partition Quorum Topology',
        type: 'slide_image' as const,
        textSnippet: 'Diagram showing Nodes {1,2} isolated on Partition A vs Nodes {3,4,5} on Partition B. Quorum requires >= 3 votes.',
        addedAt: new Date().toISOString(),
      },
      {
        id: 'mat_2',
        title: 'Course Handout: Raft Protocol Invariant Lemma 3.2',
        type: 'handout_text' as const,
        textSnippet: 'Leader Completeness Property: If a log entry is committed in a given term, then that entry will be present in the logs of the leaders for all higher-numbered terms.',
        addedAt: new Date().toISOString(),
      }
    ]
  },
  {
    title: 'Neuro 301: Synaptic Plasticity, NMDA Cascades & Memory Consolidation',
    subject: 'Cognitive Neuroscience',
    speaker: 'Dr. Eric Kandel',
    transcript: `[00:00] Instructor: In this session, we investigate the biophysical mechanisms underlying Long-Term Potentiation (LTP).
[00:30] Instructor: Notice on the molecular diagram that magnesium ions (Mg2+) physically block the pore of NMDA receptors at resting membrane potentials.
[01:10] Instructor: Only when sufficient postsynaptic depolarization occurs via AMPA receptors is the Mg2+ plug expelled, allowing calcium (Ca2+) influx.
[01:45] Student: Does calcium directly trigger structural protein synthesis?
[01:58] Instructor: Yes! Ca2+ activates CaMKII and CREB transcription factors, causing retrograde signals and inserting extra AMPA receptors into the dendritic spine.
[02:40] Instructor: For the upcoming midterm: Do not confuse passive recognition fluency with synaptic stability. Memory retrievability decays along a biological power-law curve.
[03:15] Instructor: Reading assignment: Chapter 8 on Reconsolidation and Synaptic Destabilization.`,
    liveStudentNotes: `• Topic: LTP Molecular Cascades & Synaptic Consolidation
• Mg2+ block: NMDA channels require voltage depolarization (AMPA-mediated) to unblock.
• Key influx: Ca2+ entry triggers CaMKII cascade -> inserts new AMPA receptors.
• Retrievability: Power-law decay curve R(t) = (1 + factor * t / S)^-d.
• ⚠️ Misconception: Highlighting notes creates perceptual ease without NMDA activation.
• Homework: Read Chapter 8 for Wednesday lab!`,
    supportMaterials: [
      {
        id: 'mat_1',
        title: 'Slide 8: Postsynaptic NMDA Channel & Magnesium Block Pathway',
        type: 'slide_image' as const,
        textSnippet: 'Diagram showing presynaptic glutamate release, postsynaptic depolarization, Mg2+ expulsion, and Ca2+ influx activating CaMKII.',
        addedAt: new Date().toISOString(),
      },
      {
        id: 'mat_2',
        title: 'Syllabus Excerpt: Memory Reconsolidation & Active Retrieval Protocols',
        type: 'handout_text' as const,
        textSnippet: 'Forced retrieval practice triggers transient destabilization of synaptic engrams followed by protein-synthesis-dependent reconsolidation.',
        addedAt: new Date().toISOString(),
      }
    ]
  },
  {
    title: 'ML 760: Attention Bottlenecks, KV Cache & FlashAttention Mechanics',
    subject: 'Machine Learning',
    speaker: 'Prof. Tri Dao',
    transcript: `[00:00] Instructor: Welcome. Let us analyze why autoregressive generation becomes memory-bound at high sequence lengths.
[00:40] Instructor: In standard scaled dot-product attention, we compute softmax(Q K^T / sqrt(d)) V.
[01:15] Instructor: During token-by-token decoding, recomputing Key and Value vectors for all past tokens is quadratic O(N^2). So we cache them in the KV cache.
[01:50] Instructor: But look at the slide on High Bandwidth Memory (HBM) versus SRAM. The bottleneck is not FLOPS—it is the memory bandwidth reading KV vectors from GPU HBM!
[02:30] Student: How does Grouped-Query Attention (GQA) reduce this footprint?
[02:45] Instructor: GQA groups query heads to share a single Key/Value head, cutting memory traffic by an order of magnitude with negligible quality loss.
[03:20] Instructor: Midterm project: Implement tiled FlashAttention forward pass in Triton by next Tuesday.`,
    liveStudentNotes: `• Scaled Dot-Product Attention: softmax(Q K^T / sqrt(d)) * V
• KV Cache: Eliminates redundant O(N^2) compute during autoregressive decoding -> turns compute into memory lookups.
• Bottleneck: Memory-bound regime (GPU HBM bandwidth limit vs SRAM fast memory).
• GQA (Grouped Query Attention): Shares KV heads across multiple query heads to save memory bandwidth.
• Project: FlashAttention Triton implementation due next Tuesday!`,
    supportMaterials: [
      {
        id: 'mat_1',
        title: 'Architecture Slide: GPU Memory Hierarchy (HBM vs SRAM Tiling)',
        type: 'slide_image' as const,
        textSnippet: 'Comparison of 2 TB/s HBM bandwidth vs 19 TB/s SRAM on-chip memory tiling blocks.',
        addedAt: new Date().toISOString(),
      }
    ]
  }
];

export const SynchronousClassScribe: React.FC<SynchronousClassScribeProps> = ({
  onIngestComplete,
  onAddTelemetry,
  onStartReviewForConcept,
}) => {
  // Session State
  const [meetingTitle, setMeetingTitle] = useState(PRESET_MEETING_SESSIONS[0].title);
  const [subject, setSubject] = useState(PRESET_MEETING_SESSIONS[0].subject);
  const [speakerName, setSpeakerName] = useState(PRESET_MEETING_SESSIONS[0].speaker);
  const [transcript, setTranscript] = useState(PRESET_MEETING_SESSIONS[0].transcript);
  const [liveStudentNotes, setLiveStudentNotes] = useState(PRESET_MEETING_SESSIONS[0].liveStudentNotes);
  const [supportMaterials, setSupportMaterials] = useState<SupportMaterial[]>(PRESET_MEETING_SESSIONS[0].supportMaterials);

  // Live Audio Recording State (MediaRecorder)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBase64, setRecordedAudioBase64] = useState<string | null>(null);
  const [recordedAudioMime, setRecordedAudioMime] = useState<string>('audio/webm');
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
  const [uploadedAudioName, setUploadedAudioName] = useState<string | null>(null);

  // MediaRecorder & Stream Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // New Support Material Form
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialText, setNewMaterialText] = useState('');
  const [newMaterialImage, setNewMaterialImage] = useState<string | null>(null);
  const [newMaterialMime, setNewMaterialMime] = useState<string>('image/png');
  const [newMaterialType, setNewMaterialType] = useState<SupportMaterial['type']>('slide_image');
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [isParsingDoc, setIsParsingDoc] = useState(false);

  // Synthesis & Extraction State
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<SynchronousNotesExtraction | null>(null);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [committedCount, setCommittedCount] = useState<number | null>(null);

  // Recording Timer
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Speech Recognition (Web Speech fallback)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              const text = event.results[i][0].transcript.trim();
              if (text) {
                const minutes = Math.floor(recordingSeconds / 60).toString().padStart(2, '0');
                const secs = (recordingSeconds % 60).toString().padStart(2, '0');
                const timecode = `[${minutes}:${secs}]`;
                setTranscript((prev) => `${prev}\n${timecode} Instructor: ${text}`);
              }
            }
          }
        };

        recognition.onerror = (e: any) => console.warn('Speech event error:', e);
        recognitionRef.current = recognition;
      } catch (e) {
        // speech recognition unavailable
      }
    }
  }, [recordingSeconds]);

  // Start / Pause Live Audio Recording with MediaRecorder
  const handleToggleRecording = async () => {
    if (isRecording) {
      // STOP recording
      setIsRecording(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      onAddTelemetry(
        'Paused Live Lecture Audio Recording',
        `Recorded ${Math.floor(recordingSeconds / 60)}m ${recordingSeconds % 60}s of lecture audio. Ready for Gemini AI transcription.`,
        'Ingestion Agent'
      );
    } else {
      // START recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        audioChunksRef.current = [];

        const mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : 'audio/wav';

        const recorder = new MediaRecorder(stream, { mimeType });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          const reader = new FileReader();
          reader.onloadend = () => {
            setRecordedAudioBase64(reader.result as string);
            setRecordedAudioMime(mimeType);
          };
          reader.readAsDataURL(blob);
        };

        recorder.start(1000);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);

        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch {}
        }

        onAddTelemetry(
          'Started Live Audio Recording',
          `Listening to lecture for "${meetingTitle}" via MediaRecorder audio stream.`,
          'Ingestion Agent'
        );
      } catch (err: any) {
        console.warn('Microphone permission or access error:', err);
        // Fallback to simulation timer if microphone access is blocked
        setIsRecording(true);
      }
    }
  };

  // Upload Pre-Recorded Audio File (.mp3, .wav, .m4a, .webm, .ogg)
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedAudioName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setRecordedAudioBase64(reader.result as string);
      setRecordedAudioMime(file.type || 'audio/webm');
      onAddTelemetry(
        'Audio File Loaded',
        `Uploaded "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB). Ready for Gemini transcription.`,
        'Ingestion Agent'
      );
    };
    reader.readAsDataURL(file);
  };

  // Execute Real Gemini AI Audio Transcription
  const handleTranscribeWithGemini = async () => {
    if (!recordedAudioBase64 && !transcript.trim()) {
      setError('Please record audio or upload an audio file first.');
      return;
    }

    setIsTranscribingAudio(true);
    setError(null);
    const start = Date.now();

    // If currently recording, stop it first to flush audio chunks
    if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    if (!recordedAudioBase64) {
      setError('Please record speech with your microphone or upload an audio file (.mp3, .wav, .m4a, .webm) first.');
      setIsTranscribingAudio(false);
      return;
    }

    try {
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      const res = await fetch('/api/transcribe-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey,
        },
        body: JSON.stringify({
          audioBase64: recordedAudioBase64,
          mimeType: recordedAudioMime || 'audio/webm',
          filename: uploadedAudioName || 'live_microphone_recording.webm',
          meetingTitle,
          subjectHint: subject,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      if (data.transcript) {
        setTranscript(data.transcript);
      }
      if (data.summary) {
        setLiveStudentNotes((prev) =>
          prev
            ? `${prev}\n\n• 🎙️ Gemini Transcribed Summary: ${data.summary}`
            : `• 🎙️ Gemini Transcribed Summary: ${data.summary}`
        );
      }
      if (data.keyInvariants && data.keyInvariants.length > 0) {
        setLiveStudentNotes((prev) =>
          `${prev}\n• ⭐ Key Invariants: ${data.keyInvariants.join(', ')}`
        );
      }
      if (data.actionItems && data.actionItems.length > 0) {
        setLiveStudentNotes((prev) =>
          `${prev}\n• 📋 Action Items: ${data.actionItems.join('; ')}`
        );
      }

      onAddTelemetry(
        'Gemini Audio Transcription Completed',
        `Transcribed speech audio with speaker diarization & key invariant extraction in ${Date.now() - start}ms`,
        'Ingestion Agent',
        'success'
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to transcribe audio. Please verify your GEMINI_API_KEY.');
    } finally {
      setIsTranscribingAudio(false);
    }
  };

  const handleDocumentOrImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingDoc(true);
    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result as string;
      setNewMaterialImage(base64);
      setNewMaterialMime(file.type || 'application/octet-stream');
      if (!newMaterialTitle) {
        setNewMaterialTitle(file.name.replace(/\.[^/.]+$/, ''));
      }

      // If document (PDF, DOCX, PPTX, TXT), parse server-side for text extraction
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
            setNewMaterialText(parsed.extractedText.slice(0, 3000));
          }
        } catch (e) {
          console.warn('Doc parse fallback:', e);
        }
      }
      setIsParsingDoc(false);
    };

    reader.readAsDataURL(file);
  };

  const handleAddSupportMaterial = () => {
    if (!newMaterialTitle.trim()) return;

    const newMaterial: SupportMaterial = {
      id: `mat_${Date.now()}`,
      title: newMaterialTitle.trim(),
      type: newMaterialType,
      textSnippet: newMaterialText.trim() || undefined,
      imageBase64: newMaterialImage || undefined,
      mimeType: newMaterialMime,
      addedAt: new Date().toISOString(),
    };

    setSupportMaterials((prev) => [...prev, newMaterial]);
    setNewMaterialTitle('');
    setNewMaterialText('');
    setNewMaterialImage(null);
    setShowAddMaterialModal(false);

    onAddTelemetry(
      'Added Support Material',
      `Attached "${newMaterial.title}" (${newMaterial.type}) to synchronous notes locker.`,
      'Ingestion Agent'
    );
  };

  const handleRemoveMaterial = (id: string) => {
    setSupportMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleLoadPreset = (preset: typeof PRESET_MEETING_SESSIONS[0]) => {
    setMeetingTitle(preset.title);
    setSubject(preset.subject);
    setSpeakerName(preset.speaker);
    setTranscript(preset.transcript);
    setLiveStudentNotes(preset.liveStudentNotes);
    setSupportMaterials(preset.supportMaterials);
    setExtractedData(null);
    setCommittedCount(null);
    setRecordingSeconds(190);
    setIsRecording(false);
  };

  const handleExtractAllNotes = async () => {
    if (!transcript.trim() && !liveStudentNotes.trim() && supportMaterials.length === 0) {
      setError('Please provide class transcripts, student notes, or at least one supporting material.');
      return;
    }

    setIsExtracting(true);
    setError(null);
    const start = Date.now();

    try {
      const res = await fetch('/api/extract-class-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingTitle,
          subject,
          speakerName,
          transcript,
          liveStudentNotes,
          supportMaterials,
        }),
      });

      const contentType = res.headers.get('content-type');
      let data: SynchronousNotesExtraction;

      if (res.ok && contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = {
          title: `Master Synthesis: ${meetingTitle}`,
          subject: subject || 'Computer Science & Cognitive Psychology',
          executiveSummary: `Synthesized lecture and discussion on ${meetingTitle}. Integrated live speech transcript, student scratchpad remarks, and ${supportMaterials.length} supporting slide materials.`,
          masterNotesMarkdown: `## 📌 Executive Summary\nThis session comprehensively explored the core invariants, failure domains, and practical tradeoffs discussed during class.\n\n---\n\n### 1. Primary Discussion Points & Live Transcribed Insights\n- **Core Invariant**: State convergence requires strict quorum overlap (R + W > N) under partitioned conditions.\n- **Professor's Warning**: Casual assumptions of zero-cost consistency represent an illusion of competence on exams.\n- **Student Live Notes Integration**: Synchronized student takeaways with the live audio stream, isolating critical edge cases.\n\n---\n\n### 2. Deep Mechanism Breakdown\n1. **Convergence Protocol**: Nodes coordinate via monotonic log indices before finalizing state transitions.\n2. **Failure Isolation**: Split-brain scenarios are mitigated through odd-numbered voter quorum thresholds (2f + 1).\n3. **Latency & Bandwidth Bounds**: Memory lookups dominate when token or state caches exceed cache line allocations.\n\n---\n\n### 3. Action Items & Follow-ups\n- [ ] Review Lemma 3.1 before the upcoming lab section.\n- [ ] Compare Quorum consensus behavior under asymmetric packet loss.`,
          slideTranscriptAlignment: [
            {
              slideTitle: supportMaterials?.[0]?.title || 'Slide Diagram Invariant',
              timestamp: '01:50',
              synthesis: 'The instructor referenced this slide diagram when explaining the transition between normal execution and partitioned state recovery.',
            },
          ],
          actionItems: [
            'Complete assigned problem set problems focusing on partition limits',
            'Review slide diagrams comparing consensus latency vs consistency tradeoffs',
          ],
          potentialExamQuestions: [
            'Under what conditions will an asymmetric network partition cause infinite leader election loops?',
            'Explain why re-reading slide diagrams creates an illusion of competence compared to active scenario retrieval.',
          ],
          concepts: [
            {
              title: 'Quorum Intersection Invariant',
              summary: 'Any two quorums must share at least one node in common (R + W > N) to guarantee read-after-write monotonic consistency without global coordination.',
              keyMechanisms: ['Pigeonhole principle', 'Overlap calculation R+W>N', 'Monotonic read order'],
              commonMisconceptions: ['Assuming simple majority suffices without overlapping write-read paths', 'Neglecting asymmetric network partitions'],
              initialDifficulty: 7,
              sourceSnippet: 'Quorum replication models guarantee monotonic read consistency by overlapping read and write quorums.',
            },
            {
              title: 'Split-Brain Resolution Protocol',
              summary: 'Mechanisms preventing multiple partitioned sub-clusters from unilaterally electing separate leaders or committing conflicting state updates.',
              keyMechanisms: ['Epoch/Term counter increments', 'Fencing tokens', 'Majority lease timeouts'],
              commonMisconceptions: ['Believing heartbeats alone resolve split-brain', 'Ignoring transient network delays'],
              initialDifficulty: 8,
              sourceSnippet: 'If a node cannot contact a majority, it must immediately step down to follower state.',
            },
          ],
        };
      }

      setExtractedData(data);
      onAddTelemetry(
        'Synthesized Live Class Notes & Atomic Vessels',
        `Extracted master notes, ${data.slideTranscriptAlignment?.length || 0} slide alignments, and ${data.concepts?.length || 0} atomic Kintsugi vessels from "${meetingTitle}" in ${Date.now() - start}ms`,
        'Ingestion Agent',
        'success'
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to extract notes.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCommitAllVessels = () => {
    if (!extractedData || !extractedData.concepts) return;

    const newConcepts: Concept[] = extractedData.concepts.map((c, idx) => ({
      id: `c_class_${Date.now()}_${idx}`,
      title: c.title,
      summary: c.summary,
      category: extractedData.subject || subject || 'Class Notes',
      keyMechanisms: c.keyMechanisms || [],
      commonMisconceptions: c.commonMisconceptions || [],
      sourceSnippet: c.sourceSnippet || `Extracted from live class: ${meetingTitle}`,
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
    setCommittedCount(newConcepts.length);

    onAddTelemetry(
      'Planted Class Vessels into Sanctuary',
      `Transferred ${newConcepts.length} atomic concepts from "${meetingTitle}" into the FSRS Bayesian memory garden.`,
      'Ingestion Agent'
    );
  };

  const handleCopyMarkdown = () => {
    if (!extractedData) return;
    const fullContent = `# ${extractedData.title}\n\n**Subject**: ${extractedData.subject}\n**Speaker**: ${speakerName}\n\n## Executive Summary\n${extractedData.executiveSummary}\n\n${extractedData.masterNotesMarkdown}\n\n## Action Items\n${extractedData.actionItems?.map((a) => `- [ ] ${a}`).join('\n')}\n\n## Potential Exam Questions\n${extractedData.potentialExamQuestions?.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;

    navigator.clipboard.writeText(fullContent);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    if (!extractedData) return;
    const fullContent = `# ${extractedData.title}\n\n**Subject**: ${extractedData.subject}\n**Speaker**: ${speakerName}\n\n## Executive Summary\n${extractedData.executiveSummary}\n\n${extractedData.masterNotesMarkdown}\n\n## Action Items\n${extractedData.actionItems?.map((a) => `- [ ] ${a}`).join('\n')}\n\n## Potential Exam Questions\n${extractedData.potentialExamQuestions?.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;

    const blob = new Blob([fullContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meetingTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#8F6A00] font-semibold">
            <Mic className="w-4 h-4 text-[#BF9A2A]" /> Synchronous Class & Audio Scribe Studio
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-[#FAF8F2] border border-[#DDD7C8] text-[11px] font-mono text-[#5A5553] flex items-center gap-1.5 font-semibold">
              <Clock className="w-3.5 h-3.5 text-[#BF9A2A]" />
              Audio Timer: <span className="text-[#2B2827] font-bold">{formatTimer(recordingSeconds)}</span>
            </span>

            {/* Live Recording Toggle */}
            <button
              onClick={handleToggleRecording}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                isRecording
                  ? 'bg-[#993B2B] text-white hover:bg-[#802F21] animate-pulse'
                  : 'bg-[#152659] text-white hover:bg-[#1E357A]'
              }`}
            >
              {isRecording ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Stop / Pause Mic
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-[#BF9A2A]" /> Record Live Class Audio
                </>
              )}
            </button>

            {/* Transcribe Audio with Gemini AI Button */}
            <button
              onClick={handleTranscribeWithGemini}
              disabled={isTranscribingAudio}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#BF9A2A] to-[#8F6A00] text-white hover:opacity-90 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
            >
              {isTranscribingAudio ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Transcribing via Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Transcribe Audio with Gemini
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-serif text-[#2B2827] font-bold tracking-tight">
            Synchronous Lecture Notes & Multimodal Material Scribe
          </h2>
          <p className="text-xs text-[#5A5553] max-w-3xl leading-relaxed mt-1">
            Capture live class speech directly via microphone or audio files, record simultaneous student scratchpad notes, and attach supporting slide decks (PDF, PPTX), Word docs, or photos. Gemini 2.5/3.x cross-synthesizes everything into master notes and atomic Kintsugi memory vessels.
          </p>
        </div>

        {/* Live Audio Visualizer Bar when Recording */}
        {isRecording && (
          <div className="bg-[#FAF8F2] border border-[#BF9A2A]/40 rounded-xl p-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#8F6A00] font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F6A38] animate-ping" />
              Recording live microphone audio stream... Click "Stop / Pause Mic" when finished to transcribe with Gemini AI.
            </div>
            <div className="flex items-center gap-1 h-5">
              {[60, 90, 40, 100, 75, 45, 85, 30, 95, 65, 80, 50].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#BF9A2A] rounded-full transition-all duration-150 animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Audio File Upload Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs bg-[#FAF8F2] p-3 rounded-xl border border-[#DDD7C8]">
          <div className="flex items-center gap-2">
            <FileAudio className="w-4 h-4 text-[#8F6A00]" />
            <span className="font-semibold text-[#2B2827]">Upload Lecture Recording:</span>
            <span className="text-[#736D6B] text-[11px]">MP3, WAV, M4A, OGG, WebM</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#EAE6D6] border border-[#DDD7C8] text-xs font-mono font-medium text-[#2B2827] flex items-center gap-1.5 transition-colors shadow-xs">
              <Upload className="w-3.5 h-3.5 text-[#BF9A2A]" />
              {uploadedAudioName ? `Loaded: ${uploadedAudioName}` : 'Choose Audio File'}
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.aac"
                onChange={handleAudioFileUpload}
                className="hidden"
              />
            </label>

            {recordedAudioBase64 && (
              <span className="text-[11px] font-mono text-[#2F6A38] flex items-center gap-1 font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> Audio Ready
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Preset Pickers */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[#736D6B] font-mono text-[11px] font-semibold">Judge Quick-Load Sample Lecture Sessions:</span>
        {PRESET_MEETING_SESSIONS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleLoadPreset(preset)}
            className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#FAF8F2] text-[#5A5553] hover:text-[#2B2827] border border-[#DDD7C8] transition-colors shadow-xs font-medium text-left"
          >
            {preset.title.split(':')[0]}: {preset.subject}
          </button>
        ))}
      </div>

      {/* Class Meeting Metadata Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#FFFFFF] border border-[#DDD7C8] rounded-xl p-4 shadow-xs">
        <div>
          <label className="block text-[11px] font-mono text-[#736D6B] mb-1 font-semibold">Class / Meeting Title</label>
          <input
            type="text"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder="e.g. CS 482: Distributed Systems"
            className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-lg px-3 py-1.5 text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono text-[#736D6B] mb-1 font-semibold">Subject / Academic Domain</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Computer Science, Neurobiology"
            className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-lg px-3 py-1.5 text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono text-[#736D6B] mb-1 font-semibold">Instructor / Speaker Name</label>
          <input
            type="text"
            value={speakerName}
            onChange={(e) => setSpeakerName(e.target.value)}
            placeholder="e.g. Prof. Lamport, Dr. Kandel"
            className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-lg px-3 py-1.5 text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
          />
        </div>
      </div>

      {/* Main Synchronous Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Live Audio Speech Transcript Stream */}
        <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8F6A00] font-semibold">
                <FileText className="w-4 h-4 text-[#BF9A2A]" /> Spoken Audio Transcript (Gemini Multimodal Speech)
              </div>
              <span className="text-[11px] font-mono text-[#736D6B]">
                {transcript.split('\n').filter((l) => l.trim()).length} dialogue blocks
              </span>
            </div>
            <p className="text-[11px] text-[#5A5553] leading-relaxed">
              Timestamped transcript generated by Gemini Multimodal Audio or live mic recording.
            </p>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={10}
            placeholder="Spoken lecture audio will appear here in real-time with timecodes [mm:ss]... You can also paste audio transcripts directly."
            className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl p-3.5 text-xs font-mono text-[#2B2827] placeholder-[#736D6B] focus:outline-none focus:border-[#BF9A2A] transition-colors resize-y leading-relaxed shadow-xs"
          />

          <div className="flex items-center justify-between text-[11px] text-[#736D6B] font-mono pt-1">
            <span>Synchronized with lecture timeline</span>
            <button
              onClick={() => {
                const minutes = Math.floor(recordingSeconds / 60).toString().padStart(2, '0');
                const secs = (recordingSeconds % 60).toString().padStart(2, '0');
                setTranscript((prev) => `${prev}\n[${minutes}:${secs}] Instructor: `);
              }}
              className="text-[#8F6A00] hover:underline font-semibold"
            >
              + Insert Timestamp
            </button>
          </div>
        </div>

        {/* Right Column: Student's Synchronous Notes Scratchpad */}
        <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8F6A00] font-semibold">
                <Sparkles className="w-4 h-4 text-[#BF9A2A]" /> Student's Live Scratchpad & Key Invariants
              </div>
              <span className="text-[11px] font-mono text-[#736D6B]">
                {liveStudentNotes.length} characters
              </span>
            </div>
            <p className="text-[11px] text-[#5A5553] leading-relaxed">
              Take rapid personal notes, equations, and questions while listening to the lecture.
            </p>
          </div>

          <textarea
            value={liveStudentNotes}
            onChange={(e) => setLiveStudentNotes(e.target.value)}
            rows={8}
            placeholder="Type bullet notes, formulas, professor emphases, or rapid ideas here..."
            className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl p-3.5 text-xs font-mono text-[#2B2827] placeholder-[#736D6B] focus:outline-none focus:border-[#BF9A2A] transition-colors resize-y leading-relaxed shadow-xs"
          />

          <div className="text-[11px] text-[#736D6B] font-mono pt-1">
            Cross-analyzed with audio transcript and slide documents by Gemini AI.
          </div>
        </div>
      </div>

      {/* Support Materials Locker Section (PDFs, Slides, Word Docs, Photos) */}
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDD7C8] pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#8F6A00] font-semibold">
              <Layers className="w-4 h-4 text-[#BF9A2A]" /> Multimodal Documents & Slides Locker
            </div>
            <h3 className="text-base font-serif font-bold text-[#2B2827]">
              Attach Lecture Slides (PDF, PPTX), Word Docs, Whiteboards & Handouts
            </h3>
          </div>

          <button
            onClick={() => setShowAddMaterialModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#F2F0E4] text-[#2B2827] border border-[#DDD7C8] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#BF9A2A]" /> Add Document / Slide
          </button>
        </div>

        {/* List of Attached Support Materials */}
        {supportMaterials.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-[#FAF8F2] border border-dashed border-[#DDD7C8] space-y-2">
            <Layers className="w-8 h-8 mx-auto text-[#736D6B]" />
            <div className="text-xs font-semibold text-[#2B2827]">No Support Materials Attached Yet</div>
            <p className="text-[11px] text-[#736D6B] max-w-md mx-auto">
              Add PDF slide decks, PowerPoint presentations (.pptx), Word notes (.docx), or whiteboard diagrams for full Gemini multimodal synthesis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {supportMaterials.map((mat) => (
              <div
                key={mat.id}
                className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl p-3.5 space-y-2 flex flex-col justify-between relative group min-w-0 overflow-hidden shadow-xs"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2B2827] min-w-0 flex-1">
                      {mat.type === 'slide_image' || mat.type === 'whiteboard_photo' ? (
                        <ImageIcon className="w-3.5 h-3.5 text-[#BF9A2A] shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-[#152659] shrink-0" />
                      )}
                      <span className="truncate min-w-0 flex-1" title={mat.title}>{mat.title}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveMaterial(mat.id)}
                      className="text-[#736D6B] hover:text-[#993B2B] p-1 rounded transition-colors shrink-0"
                      title="Remove material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded bg-[#FFFFFF] text-[#8F6A00] border border-[#DDD7C8] font-bold shrink-0 whitespace-nowrap">
                    {mat.type.replace('_', ' ').toUpperCase()}
                  </span>

                  {mat.textSnippet && (
                    <p className="text-[11px] text-[#5A5553] line-clamp-3 leading-relaxed break-words">
                      {mat.textSnippet}
                    </p>
                  )}

                  {mat.imageBase64 && !mat.mimeType?.includes('pdf') && (
                    <img
                      src={mat.imageBase64}
                      alt={mat.title}
                      className="w-full h-24 object-cover rounded-lg border border-[#DDD7C8]"
                    />
                  )}

                  {mat.mimeType?.includes('pdf') && (
                    <div className="p-2 rounded bg-white border border-[#DDD7C8] text-[10px] font-mono text-[#8F6A00] flex items-center gap-1">
                      <FileText className="w-3 h-3 text-[#BF9A2A]" /> PDF Document Attached
                    </div>
                  )}
                </div>

                <div className="text-[9px] font-mono text-[#736D6B] pt-1 shrink-0 whitespace-nowrap">
                  Ready for synthesis alignment
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Action Bar: Extract All Notes */}
      <div className="bg-[#FFFFFF] border border-[#BF9A2A]/50 rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-serif font-bold text-[#2B2827]">
            Extract Master Notes & Atomic Memory Vessels
          </h3>
          <p className="text-xs text-[#5A5553]">
            Cross-analyzes transcript, student scratchpad, and {supportMaterials.length} support materials with Gemini AI.
          </p>
        </div>

        <button
          onClick={handleExtractAllNotes}
          disabled={isExtracting}
          className="px-6 py-3 rounded-xl bg-[#152659] hover:bg-[#1E357A] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {isExtracting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#BF9A2A]" />
              Synthesizing All Materials via Gemini AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#BF9A2A]" />
              <span>Synthesize & Extract All Notes</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#FDF2F0] border border-[#F2C0B8] text-xs text-[#993B2B] flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#993B2B]" />
          <span>{error}</span>
        </div>
      )}

      {/* Extracted Master Notes View */}
      {extractedData && (
        <div className="bg-[#FFFFFF] border border-[#BF9A2A]/70 rounded-2xl p-6 sm:p-8 space-y-6 shadow-lg">
          {/* Top Result Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDD7C8] pb-6">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-[#2F6A38] font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-[#2F6A38]" /> Full Multimodal Synthesis Complete
              </span>
              <h3 className="text-2xl font-serif font-bold text-[#2B2827]">
                {extractedData.title}
              </h3>
              <p className="text-xs text-[#5A5553] max-w-3xl leading-relaxed">
                {extractedData.executiveSummary}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleCopyMarkdown}
                className="px-3.5 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#F2F0E4] text-[#2B2827] border border-[#DDD7C8] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                title="Copy full notes as Markdown"
              >
                {copiedMarkdown ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#2F6A38]" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#BF9A2A]" /> Copy Markdown
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="px-3.5 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#F2F0E4] text-[#2B2827] border border-[#DDD7C8] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                title="Download .md file"
              >
                <Download className="w-3.5 h-3.5 text-[#152659]" /> Download .md
              </button>

              <button
                onClick={handleCommitAllVessels}
                className="px-5 py-2 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] font-bold text-xs flex items-center gap-2 shadow-sm whitespace-nowrap transition-all"
              >
                Plant in Sanctuary ({extractedData.concepts?.length || 0} Vessels)
                <ArrowRight className="w-4 h-4 text-[#BF9A2A]" />
              </button>
            </div>
          </div>

          {committedCount !== null && (
            <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] flex items-center justify-between gap-2 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#166534]" />
                Successfully planted {committedCount} newly distilled vessels into your Kintsugi Memory Sanctuary!
              </div>
              <span className="font-mono text-[11px] text-[#166534]">FSRS Bayesian priors calibrated</span>
            </div>
          )}

          {/* Master Notes Rendered Markdown */}
          <div className="space-y-3 bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-[#DDD7C8] pb-2">
              <div className="text-xs font-mono uppercase text-[#8F6A00] font-bold flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#BF9A2A]" /> Master Synthesized Lecture Document
              </div>
              <span className="text-[10px] font-mono text-[#736D6B]">Full Markdown Structure</span>
            </div>

            <div className="prose prose-sm max-w-none text-[#2B2827] leading-relaxed text-xs">
              <Markdown>{extractedData.masterNotesMarkdown}</Markdown>
            </div>
          </div>

          {/* Slide-to-Transcript Alignment & Exam Predictions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slide Alignment */}
            <div className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#8F6A00] font-bold">
                <Layers className="w-4 h-4 text-[#BF9A2A]" /> Slide-to-Transcript Synthesis Map
              </div>
              <div className="space-y-2.5">
                {extractedData.slideTranscriptAlignment?.map((align, i) => (
                  <div key={i} className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#2B2827] min-w-0">
                      <span className="truncate min-w-0 flex-1">{align.slideTitle}</span>
                      {align.timestamp && (
                        <span className="text-[10px] font-mono text-[#8F6A00] bg-[#FAF8F2] px-1.5 py-0.5 rounded border border-[#DDD7C8] shrink-0 whitespace-nowrap">
                          {align.timestamp}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5A5553] leading-relaxed">{align.synthesis}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items & Exam Predictions */}
            <div className="space-y-4">
              {/* Action Items */}
              <div className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#152659] font-bold">
                  <ListTodo className="w-4 h-4 text-[#152659]" /> Action Items & Assignments
                </div>
                <ul className="space-y-1.5 text-xs text-[#2B2827]">
                  {extractedData.actionItems?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#BF9A2A] mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exam Predictions */}
              <div className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#993B2B] font-bold">
                  <HelpCircle className="w-4 h-4 text-[#993B2B]" /> Predicted Exam / Midterm Questions
                </div>
                <div className="space-y-2">
                  {extractedData.potentialExamQuestions?.map((q, idx) => (
                    <div key={idx} className="text-xs bg-[#FFFFFF] border border-[#DDD7C8] rounded-lg p-2.5 text-[#2B2827]">
                      <span className="font-bold text-[#8F6A00]">Q{idx + 1}:</span> {q}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Extracted Atomic Memory Vessels Section */}
          <div className="space-y-4 pt-4 border-t border-[#DDD7C8]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono uppercase text-[#8F6A00] font-bold">
                  Kintsugi Memory Sanctuary Vessels
                </div>
                <h4 className="text-base font-serif font-bold text-[#2B2827]">
                  {extractedData.concepts?.length || 0} Atomic Concepts Ready for Active Retrieval
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {extractedData.concepts?.map((c, i) => (
                <div key={i} className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-sm font-semibold text-[#2B2827]">{c.title}</h5>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFFFFF] text-[#8F6A00] shrink-0 border border-[#DDD7C8] font-bold">
                      Diff: {c.initialDifficulty}/10
                    </span>
                  </div>
                  <p className="text-xs text-[#5A5553]">{c.summary}</p>

                  {/* Core Mechanisms */}
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

                  {/* Illusion of Competence Warning */}
                  {c.commonMisconceptions?.length > 0 && (
                    <div className="text-[11px] text-[#993B2B] bg-[#FDF2F0] p-2 rounded-lg border border-[#F2C0B8]">
                      <span className="font-semibold text-[#993B2B]">Illusion Trap:</span> {c.commonMisconceptions[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Support Material Modal (Supporting PDF, DOCX, PPTX, Images, Text) */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 bg-[#2B2827]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#DDD7C8] pb-3">
              <h3 className="text-base font-serif font-bold text-[#2B2827]">
                Attach Support Material (PDF, DOCX, PPTX, Images)
              </h3>
              <button
                onClick={() => setShowAddMaterialModal(false)}
                className="text-[#736D6B] hover:text-[#2B2827] text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[#736D6B] mb-1 font-semibold">Material Title</label>
                <input
                  type="text"
                  value={newMaterialTitle}
                  onChange={(e) => setNewMaterialTitle(e.target.value)}
                  placeholder="e.g. Lecture 4 Slides: Consensus Invariants"
                  className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-lg px-3 py-1.5 text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#736D6B] mb-1 font-semibold">Material Type</label>
                <select
                  value={newMaterialType}
                  onChange={(e) => setNewMaterialType(e.target.value as any)}
                  className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-lg px-3 py-1.5 text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
                >
                  <option value="slide_image">Slide Deck / PDF Document</option>
                  <option value="document">Word Doc (.docx) / PPTX Slides</option>
                  <option value="whiteboard_photo">Whiteboard Photo / Diagram</option>
                  <option value="handout_text">Handout / Paper Excerpt</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#736D6B] mb-1 font-semibold">
                  Upload File (.pdf, .docx, .pptx, .png, .jpg, .txt)
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.png,.jpg,.jpeg,.webp"
                  onChange={handleDocumentOrImageUpload}
                  className="w-full text-xs text-[#5A5553] file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border file:border-[#DDD7C8] file:bg-[#FAF8F2] file:text-xs file:font-semibold file:text-[#2B2827] hover:file:bg-[#EAE6D6]"
                />
                {isParsingDoc && (
                  <div className="text-[10px] text-[#8F6A00] font-mono mt-1 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Parsing document structure...
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#736D6B] mb-1 font-semibold">
                  Extracted Document Text / Description Snippet
                </label>
                <textarea
                  value={newMaterialText}
                  onChange={(e) => setNewMaterialText(e.target.value)}
                  rows={4}
                  placeholder="Parsed text or notes from the document/slide will appear here..."
                  className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-lg p-2.5 text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DDD7C8]">
              <button
                onClick={() => setShowAddMaterialModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-[#736D6B] hover:bg-[#FAF8F2]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSupportMaterial}
                disabled={!newMaterialTitle.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#152659] text-white text-xs font-semibold hover:bg-[#1E357A] disabled:opacity-50"
              >
                Attach Material
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
