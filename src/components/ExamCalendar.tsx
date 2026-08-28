import React, { useState, useEffect } from 'react';
import { Concept, ExamEvent, ExamStudyPlan } from '../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Target,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Trash2,
  Edit2,
  Play,
  Brain,
  Layers,
  ArrowRight,
  MapPin,
  FileText,
  Zap,
  TrendingUp,
  X,
  Loader2,
  GraduationCap,
  Upload,
  FileUp,
  CheckSquare,
  Square,
  ListPlus,
  RefreshCw,
  Sliders,
  Check,
  HelpCircle,
  FileCode,
  Info,
} from 'lucide-react';

interface ExamCalendarProps {
  concepts: Concept[];
  onAddConcepts?: (newConcepts: Concept[]) => void;
  onStartReviewForConcept: (concept: Concept) => void;
  onAddTelemetry: (action: string, details: string, agent: string) => void;
}

export const DEFAULT_SAMPLE_EXAMS: ExamEvent[] = [
  {
    id: 'exam_cs482_midterm',
    title: 'Distributed Consensus & Partition Recovery Midterm',
    courseCode: 'CS 482',
    subject: 'Computer Science',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T10:00:00',
    targetRetention: 0.92,
    conceptIds: ['c1', 'c2', 'c3'],
    location: 'Turing Hall 102 & ProctorU',
    notes: 'Covers Raft leader election, Paxos quorums, Byzantine fault tolerance, and network partition split-brain resolution.',
    urgencyLevel: 'high',
    color: '#8F2A2A',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exam_neuro301_final',
    title: 'Synaptic Plasticity & Memory Consolidation Exam',
    courseCode: 'NEURO 301',
    subject: 'Neuroscience',
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T14:30:00',
    targetRetention: 0.90,
    conceptIds: ['c4', 'c5'],
    location: 'Biomedical Science Auditorium B',
    notes: 'Emphasizes NMDA receptor coincidence detection, late-LTP protein synthesis, and hippocampal replay during slow-wave sleep.',
    urgencyLevel: 'medium',
    color: '#152659',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exam_ml760_qual',
    title: 'FlashAttention, KV-Cache & Kernel Memory Qualifying Exam',
    courseCode: 'CS/ML 760',
    subject: 'Machine Learning',
    date: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T09:00:00',
    targetRetention: 0.95,
    conceptIds: ['c6'],
    location: 'Gates Computer Center Rm 410',
    notes: 'IO-aware tiling, SRAM vs HBM memory bottlenecks, chunked flash-decoding, and speculative execution.',
    urgencyLevel: 'normal',
    color: '#2F6A38',
    createdAt: new Date().toISOString()
  }
];

export const ExamCalendar: React.FC<ExamCalendarProps> = ({
  concepts,
  onAddConcepts,
  onStartReviewForConcept,
  onAddTelemetry
}) => {
  // Persistence
  const [exams, setExams] = useState<ExamEvent[]>(() => {
    try {
      const saved = localStorage.getItem('kintsugi_exam_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved exams', e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('kintsugi_exam_events', JSON.stringify(exams));
  }, [exams]);

  // View Controls
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda' | 'planner'>('calendar');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedExamId, setSelectedExamId] = useState<string | null>(
    exams.length > 0 ? exams[0].id : null
  );

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalCourse, setModalCourse] = useState('');
  const [modalSubject, setModalSubject] = useState('Computer Science');
  const [modalDate, setModalDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [modalTime, setModalTime] = useState('10:00');
  const [modalTargetRetention, setModalTargetRetention] = useState(90);
  const [modalLocation, setModalLocation] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [modalSelectedConceptIds, setModalSelectedConceptIds] = useState<string[]>([]);
  const [modalUrgency, setModalUrgency] = useState<'high' | 'medium' | 'normal'>('medium');

  // Support Materials & Extraction State in Modal
  const [modalVesselSourceTab, setModalVesselSourceTab] = useState<'upload' | 'existing'>('upload');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string>('');
  const [uploadedFileMime, setUploadedFileMime] = useState<string>('');
  const [uploadedTextNotes, setUploadedTextNotes] = useState<string>('');
  const [isExtractingVessels, setIsExtractingVessels] = useState<boolean>(false);
  const [extractionProgressStep, setExtractionProgressStep] = useState<string>('');
  const [extractedVessels, setExtractedVessels] = useState<Array<{
    title: string;
    summary: string;
    keyMechanisms: string[];
    commonMisconceptions: string[];
    initialDifficulty: number;
    sourceSnippet: string;
    selected: boolean;
  }>>([]);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // AI Study Plan State
  const [studyPlan, setStudyPlan] = useState<ExamStudyPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Helper calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDateStr(new Date().toISOString().split('T')[0]);
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingExamId(null);
    setModalTitle('');
    setModalCourse('');
    setModalSubject('Computer Science');
    setModalDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setModalTime('10:00');
    setModalTargetRetention(90);
    setModalLocation('Lecture Hall 101');
    setModalNotes('');
    setModalSelectedConceptIds([]);
    setModalUrgency('medium');

    // Reset extraction state
    setModalVesselSourceTab(concepts.length > 0 ? 'existing' : 'upload');
    setUploadedFileName('');
    setUploadedFileBase64('');
    setUploadedFileMime('');
    setUploadedTextNotes('');
    setExtractedVessels([]);
    setExtractionError(null);
    setExtractionProgressStep('');

    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (exam: ExamEvent) => {
    setEditingExamId(exam.id);
    setModalTitle(exam.title);
    setModalCourse(exam.courseCode || '');
    setModalSubject(exam.subject);
    const [d, t] = exam.date.split('T');
    setModalDate(d || exam.date);
    setModalTime(t ? t.substring(0, 5) : '10:00');
    setModalTargetRetention(Math.round(exam.targetRetention * 100));
    setModalLocation(exam.location || '');
    setModalNotes(exam.notes || '');
    setModalSelectedConceptIds(exam.conceptIds || []);
    setModalUrgency(exam.urgencyLevel || 'medium');

    // Reset extraction state
    setModalVesselSourceTab('existing');
    setUploadedFileName('');
    setUploadedFileBase64('');
    setUploadedFileMime('');
    setUploadedTextNotes('');
    setExtractedVessels([]);
    setExtractionError(null);
    setExtractionProgressStep('');

    setIsModalOpen(true);
  };

  // Handle File Selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setUploadedFileMime(file.type || 'application/octet-stream');
    setExtractionError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      setUploadedFileBase64(base64Str);
    };
    reader.readAsDataURL(file);
  };

  // Handle AI Invariant & Concept Extraction via Gemini 3.7 / Vertex AI
  const handleExtractVessels = async () => {
    if (!uploadedFileBase64 && !uploadedTextNotes.trim()) {
      setExtractionError('Please upload a document/slide or paste syllabus lecture notes to extract vessels.');
      return;
    }

    setIsExtractingVessels(true);
    setExtractionError(null);
    setExtractionProgressStep('Ingesting document structure & preparing multimodal prompt...');

    try {
      setExtractionProgressStep('Consulting Gemini 3.7 & Scribe Agent for causal invariants...');

      const payload: any = {
        rawText: uploadedTextNotes.trim() || undefined,
        fileBase64: uploadedFileBase64 || undefined,
        fileMime: uploadedFileMime || undefined,
        filename: uploadedFileName || 'exam_materials',
        subjectHint: `${modalSubject}: ${modalTitle || modalCourse}`
      };

      const res = await fetch('/api/extract-concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to extract concepts from server');
      }

      setExtractionProgressStep('Synthesizing atomic vessels and common cognitive traps...');
      const data = await res.json();

      if (data && Array.isArray(data.concepts) && data.concepts.length > 0) {
        const formatted = data.concepts.map((c: any) => ({
          title: c.title || 'Untitled Invariant',
          summary: c.summary || '',
          keyMechanisms: Array.isArray(c.keyMechanisms) ? c.keyMechanisms : [],
          commonMisconceptions: Array.isArray(c.commonMisconceptions) ? c.commonMisconceptions : [],
          initialDifficulty: c.initialDifficulty || 5,
          sourceSnippet: c.sourceSnippet || '',
          selected: true
        }));
        setExtractedVessels(formatted);
        onAddTelemetry(
          'Gemini 3.7 Extracted Exam Support Material',
          `Distilled ${formatted.length} atomic concept vessels from "${uploadedFileName || modalTitle}" via Google GenAI SDK.`,
          'Ingestion Agent'
        );
      } else {
        throw new Error('Gemini returned an empty concept list for this material.');
      }
    } catch (err: any) {
      console.warn('Extraction notice:', err);
      setExtractionError(err.message || 'Extraction failed. Please verify your file or text notes.');
    } finally {
      setIsExtractingVessels(false);
      setExtractionProgressStep('');
    }
  };

  // Save Exam (with newly synthesized vessels + existing ones)
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    const fullDate = `${modalDate}T${modalTime}:00`;
    const colorMap: Record<string, string> = {
      'high': '#8F2A2A',
      'medium': '#152659',
      'normal': '#2F6A38'
    };

    // 1. Create and plant any newly extracted vessels that are checked
    const selectedExtracted = extractedVessels.filter((v) => v.selected);
    const newConceptObjects: Concept[] = [];
    const newConceptIds: string[] = [];

    if (selectedExtracted.length > 0) {
      selectedExtracted.forEach((v, idx) => {
        const newId = `c_exam_${Date.now()}_${idx}`;
        newConceptIds.push(newId);
        newConceptObjects.push({
          id: newId,
          title: v.title,
          subject: modalSubject,
          summary: v.summary,
          keyMechanisms: v.keyMechanisms,
          commonMisconceptions: v.commonMisconceptions,
          difficulty: v.initialDifficulty || 5,
          stability: 2.0,
          currentRetention: 1.0,
          confidenceLow: 0.95,
          confidenceHigh: 1.0,
          lastReviewedAt: new Date().toISOString(),
          reviewCount: 0,
          kintsugiRepairs: 0,
          status: 'stable',
        });
      });

      if (onAddConcepts) {
        onAddConcepts(newConceptObjects);
      }
    }

    // Combine newly created concept IDs with any existing concept IDs selected
    const allLinkedConceptIds = Array.from(
      new Set([...modalSelectedConceptIds, ...newConceptIds])
    );

    if (editingExamId) {
      setExams((prev) =>
        prev.map((item) =>
          item.id === editingExamId
            ? {
                ...item,
                title: modalTitle.trim(),
                courseCode: modalCourse.trim().toUpperCase(),
                subject: modalSubject,
                date: fullDate,
                targetRetention: modalTargetRetention / 100,
                conceptIds: allLinkedConceptIds,
                location: modalLocation.trim(),
                notes: modalNotes.trim(),
                urgencyLevel: modalUrgency,
                color: colorMap[modalUrgency] || '#152659'
              }
            : item
        )
      );
      onAddTelemetry(
        'Exam Schedule Updated',
        `Modified exam parameters for "${modalTitle.trim()}" (${modalCourse}) with ${allLinkedConceptIds.length} vessels linked.`,
        'Exam Calendar'
      );
    } else {
      const newExam: ExamEvent = {
        id: `exam_${Date.now()}`,
        title: modalTitle.trim(),
        courseCode: modalCourse.trim().toUpperCase(),
        subject: modalSubject,
        date: fullDate,
        targetRetention: modalTargetRetention / 100,
        conceptIds: allLinkedConceptIds,
        location: modalLocation.trim(),
        notes: modalNotes.trim(),
        urgencyLevel: modalUrgency,
        color: colorMap[modalUrgency] || '#152659',
        createdAt: new Date().toISOString()
      };
      setExams((prev) => [...prev, newExam]);
      setSelectedExamId(newExam.id);
      onAddTelemetry(
        'New Exam Milestone Logged',
        `Marked upcoming exam "${newExam.title}" (${newExam.courseCode}) on ${modalDate} with ${allLinkedConceptIds.length} vessels linked.`,
        'Exam Calendar'
      );
    }

    setIsModalOpen(false);
  };

  // Delete Exam
  const handleDeleteExam = (id: string) => {
    const target = exams.find((e) => e.id === id);
    if (!target) return;
    setExams((prev) => prev.filter((e) => e.id !== id));
    if (selectedExamId === id) {
      setSelectedExamId(exams.length > 1 ? exams.find((e) => e.id !== id)!.id : null);
    }
    onAddTelemetry(
      'Exam Milestone Removed',
      `Deleted exam "${target.title}" from synaptic horizon calendar.`,
      'Exam Calendar'
    );
  };

  // Load sample benchmarks or clear
  const handleLoadSampleCurriculum = () => {
    setExams(DEFAULT_SAMPLE_EXAMS);
    setSelectedExamId(DEFAULT_SAMPLE_EXAMS[0].id);
    onAddTelemetry(
      'Sample Exam Curriculums Loaded',
      'Populated university benchmark exams for CS 482, NEURO 301, and ML 760.',
      'Exam Calendar'
    );
  };

  const handleClearAllExams = () => {
    setExams([]);
    setSelectedExamId(null);
    onAddTelemetry(
      'Exam Calendar Reset',
      'Cleared all scheduled exams for a pristine study horizon.',
      'Exam Calendar'
    );
  };

  // Calculate Days Remaining
  const getDaysRemaining = (examDateStr: string) => {
    const examDate = new Date(examDateStr);
    const now = new Date();
    const diff = examDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Compute Mean Retention for an Exam
  const getExamReadiness = (exam: ExamEvent) => {
    const linked = concepts.filter((c) => exam.conceptIds && exam.conceptIds.includes(c.id));
    if (linked.length === 0) return { mean: 0.85, count: 0, highRisk: [] };
    const mean = linked.reduce((acc, c) => acc + c.currentRetention, 0) / linked.length;
    const highRisk = linked.filter((c) => c.currentRetention < 0.75);
    return { mean, count: linked.length, highRisk };
  };

  // Generate AI Study Plan with Gemini 3.7 / Vertex AI
  const handleGenerateStudyPlan = async (exam: ExamEvent) => {
    setSelectedExamId(exam.id);
    setViewMode('planner');
    setIsGeneratingPlan(true);
    setPlanError(null);

    try {
      const res = await fetch('/api/generate-exam-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam,
          concepts
        })
      });

      if (!res.ok) {
        throw new Error('Server response not ok');
      }

      const data: ExamStudyPlan = await res.json();
      setStudyPlan(data);
      onAddTelemetry(
        'Gemini 3.7 Exam Study Plan Formulated',
        `Synthesized ${data.dailySchedule?.length || 0}-day active retrieval countdown for "${exam.title}" (${exam.courseCode}).`,
        'Exam Strategy Agent'
      );
    } catch (err: any) {
      console.warn('Study plan fetch notice, building local Bayesian plan:', err);
      // Construct rich local client fallback
      const days = getDaysRemaining(exam.date);
      const readiness = getExamReadiness(exam);
      const linked = concepts.filter((c) => exam.conceptIds && exam.conceptIds.includes(c.id));
      const dailySchedule = [];
      const numDays = Math.min(Math.max(1, days), 7);

      for (let i = 0; i < numDays; i++) {
        const scheduleDate = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
        const dayOffset = i + 1;
        const topic = linked[i % Math.max(1, linked.length)]?.title || exam.subject;
        dailySchedule.push({
          dayOffset,
          dateStr: scheduleDate.toISOString().split('T')[0],
          focusTopic: `Day ${dayOffset}: ${topic} Invariants & Boundary Stress`,
          conceptTitles: [topic],
          estimatedMinutes: 20 + (i % 2) * 10,
          retrievalType: i === 0 ? 'socratic_free_recall' : (i % 2 === 0 ? 'kintsugi_repair' : 'mcq_mechanisms'),
          reasoning: `Targeting causal mechanisms before memory decay breaches the ${(exam.targetRetention * 100).toFixed(0)}% goal threshold.`
        });
      }

      const fallbackPlan: ExamStudyPlan = {
        examId: exam.id,
        examTitle: exam.title,
        daysRemaining: days,
        currentMeanRetention: Number(readiness.mean.toFixed(2)),
        projectedExamRetention: Number((readiness.mean * Math.exp(-0.035 * Math.max(1, days))).toFixed(2)),
        recommendedDailyMinutes: 25,
        highRiskConcepts: readiness.highRisk.length > 0 ? readiness.highRisk.map(c => c.title) : ["Invariant Divergence", "Failure Mode Edge Condition"],
        strategySummary: `Bayesian countdown study blueprint for ${exam.title} (${exam.courseCode || exam.subject}) with ${days} days remaining. Focus on active Socratic generative recall to push retention toward your ${(exam.targetRetention * 100).toFixed(0)}% target goal.`,
        dailySchedule: dailySchedule as any,
        examDayProTips: [
          "Do not do cram-rereading on exam morning; perform 5 minutes of self-explanation on core causal invariants.",
          "When approaching complex multi-hop exam questions, first write down the core mathematical or algorithmic constraint.",
          "Beware the illusion of competence: recognizing a formula or diagram in notes is not the same as generating it unprompted."
        ]
      };

      setStudyPlan(fallbackPlan);
      onAddTelemetry(
        'Exam Study Plan Synthesized',
        `Formulated Bayesian active retrieval study blueprint for "${exam.title}" (${exam.courseCode}).`,
        'Exam Strategy Agent'
      );
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Sprint Review for Exam: Find the lowest retention concept in scope
  const handleLaunchSprintReview = (exam: ExamEvent) => {
    const linked = concepts.filter((c) => exam.conceptIds && exam.conceptIds.includes(c.id));
    if (linked.length === 0) {
      if (concepts.length > 0) onStartReviewForConcept(concepts[0]);
      return;
    }
    const sorted = [...linked].sort((a, b) => a.currentRetention - b.currentRetention);
    onAddTelemetry(
      'Exam Sprint Socratic Practice Initiated',
      `Targeting lowest retention vessel "${sorted[0].title}" (${Math.round(sorted[0].currentRetention * 100)}%) for ${exam.courseCode || exam.title}.`,
      'Socratic Interviewer'
    );
    onStartReviewForConcept(sorted[0]);
  };

  // Calendar Day Cells Generation
  const calendarCells = [];

  // Previous month padding days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    calendarCells.push({
      day: d,
      isCurrentMonth: false,
      dateStr: `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      dateStr
    });
  }

  // Next month padding days to complete 35 or 42 grid
  const remainingCells = (calendarCells.length > 35 ? 42 : 35) - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const dateStr = `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      day: d,
      isCurrentMonth: false,
      dateStr
    });
  }

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Strategy Metrics */}
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/30 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-[#8F6A00]" /> Exam Horizon & Bayesian Calendar
              </span>
              <span className="text-xs font-mono text-[#736D6B]">
                金継ぎ 試験日程 • FSRS Retention Countdown
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#152659]/10 text-[#152659] border border-[#152659]/20 font-semibold">
                Powered by Gemini 3.7
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B2827] tracking-tight">
              Calibrate Active Retrieval to Your Exam Milestones
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5553] max-w-2xl leading-relaxed">
              Schedule your midterms and finals. Upload course syllabi, lecture slides, or PDF notes to immediately extract atomic memory vessels via Gemini 3.7, preventing forgetting cliffs before exam day.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {exams.length === 0 ? (
              <button
                onClick={handleLoadSampleCurriculum}
                className="px-3.5 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#EFEAD9] text-[#2B2827] border border-[#DDD7C8] text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#8F6A00]" />
                <span>Load Sample Curriculums</span>
              </button>
            ) : (
              <button
                onClick={handleClearAllExams}
                className="px-3 py-2 rounded-xl hover:bg-[#8F2A2A]/10 text-[#736D6B] hover:text-[#8F2A2A] border border-transparent hover:border-[#8F2A2A]/30 text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                title="Clear all scheduled exams"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Calendar</span>
              </button>
            )}

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#BF9A2A]" />
              <span>Mark New Exam & Ingest Material</span>
            </button>
          </div>
        </div>

        {/* Quick Horizon Cards or Fresh Empty State */}
        {exams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#DDD7C8]/60">
            {exams.slice(0, 3).map((exam) => {
              const daysLeft = getDaysRemaining(exam.date);
              const { mean, highRisk, count } = getExamReadiness(exam);
              const isImminent = daysLeft <= 7 && daysLeft >= 0;

              return (
                <div
                  key={exam.id}
                  onClick={() => {
                    setSelectedExamId(exam.id);
                    const examDateOnly = exam.date.split('T')[0];
                    setSelectedDateStr(examDateOnly);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                    selectedExamId === exam.id
                      ? 'bg-[#FAF8F2] border-[#BF9A2A] shadow-xs'
                      : 'bg-[#FFFFFF] border-[#DDD7C8] hover:border-[#BF9A2A]/50 hover:bg-[#FAF8F2]/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#152659] text-white">
                      {exam.courseCode || 'EXAM'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        daysLeft < 0
                          ? 'bg-[#DDD7C8] text-[#5A5553]'
                          : isImminent
                          ? 'bg-[#8F2A2A]/15 text-[#8F2A2A] border border-[#8F2A2A]/30 animate-pulse'
                          : 'bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/30'
                      }`}
                    >
                      {daysLeft < 0
                        ? 'Completed'
                        : daysLeft === 0
                        ? 'TODAY'
                        : daysLeft === 1
                        ? 'TOMORROW'
                        : `IN ${daysLeft} DAYS`}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <h4 className="text-xs font-serif font-bold text-[#2B2827] line-clamp-1">
                      {exam.title}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-[#736D6B] font-mono mt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#BF9A2A]" />
                        <span>{new Date(exam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}</span>
                      </div>
                      <span className="text-[10px] text-[#8F6A00] font-semibold">{count} vessels</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#5A5553]">Mean Retention:</span>
                      <span className={`font-bold ${mean >= exam.targetRetention ? 'text-[#2F6A38]' : 'text-[#8F2A2A]'}`}>
                        {Math.round(mean * 100)}% / {Math.round(exam.targetRetention * 100)}% Goal
                      </span>
                    </div>
                    <div className="w-full bg-[#EAE6D6] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          mean >= exam.targetRetention ? 'bg-[#2F6A38]' : 'bg-[#BF9A2A]'
                        }`}
                        style={{ width: `${Math.min(100, Math.round(mean * 100))}%` }}
                      />
                    </div>
                  </div>

                  {highRisk.length > 0 && (
                    <div className="mt-2 text-[10px] font-mono text-[#8F2A2A] flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                      <span>{highRisk.length} concept{highRisk.length > 1 ? 's' : ''} at risk of decay</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="pt-4 border-t border-[#DDD7C8]/60">
            <div className="bg-[#FAF8F2] border border-dashed border-[#BF9A2A]/40 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#BF9A2A]/15 text-[#8F6A00] flex items-center justify-center mx-auto">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-sm font-serif font-bold text-[#2B2827]">
                  No Exam Horizons Scheduled Yet
                </h4>
                <p className="text-xs text-[#736D6B] leading-relaxed">
                  Start fresh by scheduling your first exam milestone and uploading lecture materials. Gemini 3.7 will automatically synthesize atomic concept vessels for your garden!
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 rounded-xl bg-[#152659] text-white text-xs font-semibold hover:bg-[#1E357A] transition-all inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#BF9A2A]" />
                  <span>Mark Your First Exam</span>
                </button>
                <button
                  onClick={handleLoadSampleCurriculum}
                  className="px-4 py-2 rounded-xl bg-white border border-[#DDD7C8] text-xs font-semibold text-[#5A5553] hover:bg-[#FAF8F2] transition-all inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#8F6A00]" />
                  <span>Load Sample Curriculums</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mode Selectors */}
      <div className="flex items-center justify-between bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-2.5 shadow-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
              viewMode === 'calendar'
                ? 'bg-[#152659] text-white shadow-xs'
                : 'text-[#5A5553] hover:text-[#2B2827] hover:bg-[#FAF8F2]'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[#BF9A2A]" />
            <span>Monthly Grid</span>
          </button>

          <button
            onClick={() => setViewMode('agenda')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
              viewMode === 'agenda'
                ? 'bg-[#152659] text-white shadow-xs'
                : 'text-[#5A5553] hover:text-[#2B2827] hover:bg-[#FAF8F2]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#BF9A2A]" />
            <span>Upcoming Exam Cards ({exams.length})</span>
          </button>

          {selectedExam && (
            <button
              onClick={() => handleGenerateStudyPlan(selectedExam)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
                viewMode === 'planner'
                  ? 'bg-[#152659] text-white shadow-xs'
                  : 'text-[#5A5553] hover:text-[#2B2827] hover:bg-[#FAF8F2]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#BF9A2A]" />
              <span>AI Socratic Study Plan</span>
            </button>
          )}
        </div>

        <div className="text-[11px] font-mono text-[#736D6B] hidden sm:block">
          Active Month: <span className="text-[#2B2827] font-bold">{monthNames[month]} {year}</span>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Monthly Matrix */}
          <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 shadow-sm space-y-4">
            {/* Month Nav Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-[#2B2827]">
                  {monthNames[month]} {year}
                </h3>
                <span className="text-xs font-mono text-[#736D6B]">
                  ({exams.filter((e) => e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length} exams this month)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToday}
                  className="px-3 py-1 rounded-xl text-xs font-mono font-semibold text-[#5A5553] hover:bg-[#FAF8F2] border border-[#DDD7C8]"
                >
                  Today
                </button>
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-xl text-[#5A5553] hover:bg-[#FAF8F2] border border-[#DDD7C8]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-xl text-[#5A5553] hover:bg-[#FAF8F2] border border-[#DDD7C8]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs font-semibold text-[#736D6B] border-b border-[#DDD7C8] pb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Month Grid Matrix */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {calendarCells.map((cell, idx) => {
                const isSelected = selectedDateStr === cell.dateStr;
                const isToday = todayStr === cell.dateStr;
                const dayExams = exams.filter((e) => e.date.startsWith(cell.dateStr));

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedDateStr(cell.dateStr);
                      if (dayExams.length > 0) {
                        setSelectedExamId(dayExams[0].id);
                      }
                    }}
                    className={`min-h-[85px] sm:min-h-[100px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      !cell.isCurrentMonth
                        ? 'bg-[#FAF8F2]/30 border-[#DDD7C8]/40 text-[#736D6B]/50'
                        : isSelected
                        ? 'bg-[#FAF8F2] border-[#BF9A2A] shadow-xs'
                        : isToday
                        ? 'bg-[#FFFFFF] border-[#152659] shadow-xs'
                        : 'bg-[#FFFFFF] border-[#DDD7C8]/70 hover:border-[#BF9A2A]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-bold ${
                          isToday
                            ? 'w-5 h-5 rounded-full bg-[#152659] text-white flex items-center justify-center text-[10px]'
                            : cell.isCurrentMonth
                            ? 'text-[#2B2827]'
                            : 'text-[#736D6B]/50'
                        }`}
                      >
                        {cell.day}
                      </span>
                      {dayExams.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-[#8F2A2A] animate-pulse" />
                      )}
                    </div>

                    {/* Day Exam Pills */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayExams.slice(0, 2).map((ex) => (
                        <div
                          key={ex.id}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white truncate shadow-2xs"
                          style={{ backgroundColor: ex.color || '#152659' }}
                          title={`${ex.courseCode}: ${ex.title}`}
                        >
                          {ex.courseCode || ex.title}
                        </div>
                      ))}
                      {dayExams.length > 2 && (
                        <div className="text-[9px] font-mono text-[#8F6A00] font-bold">
                          +{dayExams.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 1 Col: Selected Date / Exam Insight Card */}
          <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#DDD7C8] pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8F6A00] font-bold">
                    Selected Focus Date
                  </span>
                  <h4 className="text-sm font-serif font-bold text-[#2B2827]">
                    {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h4>
                </div>
                <span className="text-xs font-mono text-[#736D6B]">
                  {exams.filter((e) => e.date.startsWith(selectedDateStr)).length} exam(s)
                </span>
              </div>

              {/* Exams on this day */}
              {exams.filter((e) => e.date.startsWith(selectedDateStr)).length > 0 ? (
                <div className="space-y-3">
                  {exams
                    .filter((e) => e.date.startsWith(selectedDateStr))
                    .map((ex) => {
                      const daysLeft = getDaysRemaining(ex.date);
                      const readiness = getExamReadiness(ex);

                      return (
                        <div
                          key={ex.id}
                          className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-3 relative"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#152659] text-white">
                              {ex.courseCode || 'EXAM'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(ex)}
                                className="p-1 text-[#736D6B] hover:text-[#2B2827]"
                                title="Edit Exam"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteExam(ex.id)}
                                className="p-1 text-[#736D6B] hover:text-[#8F2A2A]"
                                title="Delete Exam"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h5 className="text-xs font-serif font-bold text-[#2B2827] leading-snug">
                            {ex.title}
                          </h5>

                          <div className="space-y-1.5 text-xs text-[#5A5553] font-mono text-[11px]">
                            {ex.location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-[#BF9A2A]" />
                                <span>{ex.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Target className="w-3 h-3 text-[#BF9A2A]" />
                              <span>
                                Target Retention: {(ex.targetRetention * 100).toFixed(0)}% (Mean: {Math.round(readiness.mean * 100)}%)
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Brain className="w-3 h-3 text-[#BF9A2A]" />
                              <span>{readiness.count} Memory Vessels Attached</span>
                            </div>
                          </div>

                          {ex.notes && (
                            <p className="text-[11px] text-[#736D6B] bg-white p-2.5 rounded-xl border border-[#DDD7C8]/70 leading-relaxed italic">
                              "{ex.notes}"
                            </p>
                          )}

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleLaunchSprintReview(ex)}
                              className="flex-1 py-2 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all shadow-xs"
                            >
                              <Play className="w-3.5 h-3.5 text-[#BF9A2A]" />
                              <span>Start Sprint</span>
                            </button>
                            <button
                              onClick={() => handleGenerateStudyPlan(ex)}
                              className="px-3 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#EFEAD9] text-[#2B2827] border border-[#DDD7C8] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#8F6A00]" />
                              <span>Study Plan</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 space-y-2">
                  <BookOpen className="w-8 h-8 text-[#DDD7C8] mx-auto" />
                  <p className="text-xs text-[#736D6B] font-mono">
                    No exams scheduled on this date.
                  </p>
                  <button
                    onClick={handleOpenCreateModal}
                    className="text-xs font-mono font-bold text-[#8F6A00] hover:underline"
                  >
                    + Schedule Exam on this Date
                  </button>
                </div>
              )}
            </div>

            {/* Quick Status Footer */}
            <div className="pt-4 border-t border-[#DDD7C8] text-[11px] font-mono text-[#736D6B] space-y-1">
              <div className="flex items-center justify-between">
                <span>Total Active Horizons:</span>
                <span className="font-bold text-[#2B2827]">{exams.length} Exams</span>
              </div>
              <div className="flex items-center justify-between">
                <span>FSRS Target Standard:</span>
                <span className="font-bold text-[#8F6A00]">90% - 95% Retention</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agenda Mode: List View of Upcoming Exams */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          {exams.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-12 text-center space-y-4">
              <CalendarIcon className="w-12 h-12 text-[#BF9A2A] mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-[#2B2827]">
                  No Upcoming Exams in Agenda
                </h3>
                <p className="text-xs text-[#736D6B] max-w-md mx-auto">
                  Click below to schedule your upcoming course midterm or final exam, and upload materials to extract memory vessels.
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="px-5 py-2.5 rounded-xl bg-[#152659] text-white text-xs font-semibold inline-flex items-center gap-2 hover:bg-[#1E357A]"
              >
                <Plus className="w-4 h-4 text-[#BF9A2A]" />
                <span>Mark New Exam</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map((ex) => {
                const daysLeft = getDaysRemaining(ex.date);
                const readiness = getExamReadiness(ex);
                const isImminent = daysLeft <= 7 && daysLeft >= 0;

                return (
                  <div
                    key={ex.id}
                    className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 shadow-sm space-y-4 hover:border-[#BF9A2A]/50 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#152659] text-white">
                          {ex.courseCode || 'EXAM'}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                            daysLeft < 0
                              ? 'bg-[#DDD7C8] text-[#5A5553]'
                              : isImminent
                              ? 'bg-[#8F2A2A]/15 text-[#8F2A2A] border border-[#8F2A2A]/30 animate-pulse'
                              : 'bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/30'
                          }`}
                        >
                          {daysLeft < 0
                            ? 'Completed'
                            : daysLeft === 0
                            ? 'TODAY'
                            : daysLeft === 1
                            ? 'TOMORROW'
                            : `IN ${daysLeft} DAYS`}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-serif font-bold text-[#2B2827]">
                          {ex.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-[#736D6B] font-mono mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#BF9A2A]" />
                            {new Date(ex.date).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {ex.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#BF9A2A]" />
                              {ex.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Retention Gauge */}
                      <div className="space-y-1.5 p-3 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8]">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#5A5553]">Attached Vessels ({readiness.count}):</span>
                          <span className={`font-bold ${readiness.mean >= ex.targetRetention ? 'text-[#2F6A38]' : 'text-[#8F2A2A]'}`}>
                            Current Mean: {Math.round(readiness.mean * 100)}% / Target {(ex.targetRetention * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-[#EAE6D6] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              readiness.mean >= ex.targetRetention ? 'bg-[#2F6A38]' : 'bg-[#BF9A2A]'
                            }`}
                            style={{ width: `${Math.min(100, Math.round(readiness.mean * 100))}%` }}
                          />
                        </div>
                      </div>

                      {ex.notes && (
                        <p className="text-xs text-[#5A5553] bg-[#FAF8F2]/60 p-3 rounded-xl border border-[#DDD7C8]/50 leading-relaxed italic">
                          "{ex.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#DDD7C8]">
                      <button
                        onClick={() => handleLaunchSprintReview(ex)}
                        className="flex-1 py-2.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 text-[#BF9A2A]" />
                        <span>Launch Socratic Sprint</span>
                      </button>
                      <button
                        onClick={() => handleGenerateStudyPlan(ex)}
                        className="px-3.5 py-2.5 rounded-xl bg-[#FAF8F2] hover:bg-[#EFEAD9] text-[#2B2827] border border-[#DDD7C8] text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#8F6A00]" />
                        <span>AI Plan</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(ex)}
                        className="p-2.5 rounded-xl text-[#736D6B] hover:text-[#2B2827] hover:bg-[#FAF8F2] border border-[#DDD7C8]"
                        title="Edit Parameters"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* AI Socratic Study Plan Mode */}
      {viewMode === 'planner' && (
        <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDD7C8] pb-6">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/30">
                Gemini 3.7 Strategic Study Blueprint
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2B2827]">
                Countdown Retrieval Plan: {selectedExam ? selectedExam.title : 'Target Exam'}
              </h3>
              <p className="text-xs text-[#5A5553] font-mono">
                {selectedExam ? `${selectedExam.courseCode} • Scheduled ${selectedExam.date.split('T')[0]}` : ''}
              </p>
            </div>

            {selectedExam && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerateStudyPlan(selectedExam)}
                  disabled={isGeneratingPlan}
                  className="px-4 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#EFEAD9] text-[#2B2827] border border-[#DDD7C8] text-xs font-semibold inline-flex items-center gap-2 transition-all"
                >
                  {isGeneratingPlan ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#BF9A2A]" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-[#8F6A00]" />
                  )}
                  <span>{isGeneratingPlan ? 'Re-Synthesizing...' : 'Regenerate Plan'}</span>
                </button>
                <button
                  onClick={() => handleLaunchSprintReview(selectedExam)}
                  className="px-4 py-2 rounded-xl bg-[#152659] text-white text-xs font-semibold inline-flex items-center gap-2 hover:bg-[#1E357A] shadow-xs"
                >
                  <Play className="w-4 h-4 text-[#BF9A2A]" />
                  <span>Start First Session</span>
                </button>
              </div>
            )}
          </div>

          {isGeneratingPlan && (
            <div className="py-16 text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-[#BF9A2A] mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-serif font-bold text-[#2B2827]">
                  Synthesizing Bayesian Retrieval Countdown with Gemini 3.7...
                </h4>
                <p className="text-xs text-[#736D6B] font-mono max-w-md mx-auto">
                  Computing multi-day decay projections and scheduling forced active retrieval sprints for each core invariant.
                </p>
              </div>
            </div>
          )}

          {!isGeneratingPlan && studyPlan && (
            <div className="space-y-6">
              {/* Plan Metrics Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-1">
                  <span className="text-[10px] font-mono text-[#736D6B] uppercase">Days Remaining</span>
                  <div className="text-2xl font-serif font-bold text-[#2B2827]">
                    {studyPlan.daysRemaining} Days
                  </div>
                  <p className="text-[10px] text-[#5A5553] font-mono">Until exam date</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-1">
                  <span className="text-[10px] font-mono text-[#736D6B] uppercase">Recommended Daily Time</span>
                  <div className="text-2xl font-serif font-bold text-[#8F6A00]">
                    {studyPlan.recommendedDailyMinutes} mins/day
                  </div>
                  <p className="text-[10px] text-[#5A5553] font-mono">Active forced recall</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-1">
                  <span className="text-[10px] font-mono text-[#736D6B] uppercase">Projected Exam Retention</span>
                  <div className="text-2xl font-serif font-bold text-[#2F6A38]">
                    {Math.round(studyPlan.projectedExamRetention * 100)}%
                  </div>
                  <p className="text-[10px] text-[#5A5553] font-mono">With daily practice</p>
                </div>
              </div>

              {/* Strategy Summary */}
              <div className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#8F6A00]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cognitive Strategy Summary</span>
                </div>
                <p className="text-xs sm:text-sm text-[#2B2827] leading-relaxed">
                  {studyPlan.strategySummary}
                </p>
              </div>

              {/* Daily Schedule Roadmap */}
              <div className="space-y-3">
                <h4 className="text-sm font-mono font-bold text-[#2B2827] uppercase tracking-wider">
                  Countdown Retrieval Roadmap
                </h4>
                <div className="space-y-3">
                  {studyPlan.dailySchedule?.map((day, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-[#DDD7C8] hover:border-[#BF9A2A] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#152659] text-white">
                            Day {day.dayOffset}
                          </span>
                          <span className="text-xs font-mono text-[#736D6B]">
                            {day.dateStr}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FAF8F2] text-[#8F6A00] border border-[#DDD7C8]">
                            ⏱️ {day.estimatedMinutes} mins
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#BF9A2A]/15 text-[#8F6A00]">
                            {day.retrievalType.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h5 className="text-sm font-serif font-bold text-[#2B2827]">
                          {day.focusTopic}
                        </h5>
                        <p className="text-xs text-[#5A5553] leading-relaxed">
                          {day.reasoning}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (selectedExam) handleLaunchSprintReview(selectedExam);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#152659] hover:text-white text-[#2B2827] border border-[#DDD7C8] text-xs font-semibold inline-flex items-center gap-2 transition-all shrink-0"
                      >
                        <Play className="w-3.5 h-3.5 text-[#BF9A2A]" />
                        <span>Practice This Day</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exam Day Pro Tips */}
              {studyPlan.examDayProTips && (
                <div className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#8F6A00]">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Exam Day Cognitive Execution Tactics</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[#5A5553]">
                    {studyPlan.examDayProTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#BF9A2A] mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Exam Modal with Support Material Ingestion */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DDD7C8] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#8F6A00] font-bold flex items-center gap-1.5">
                  <CalendarIcon className="w-3 h-3 text-[#8F6A00]" />
                  {editingExamId ? 'Edit Exam Milestone' : 'Schedule Upcoming Exam & Ingest Materials'}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#2B2827]">
                  {editingExamId ? 'Update Exam Parameters' : 'Mark Exam on Synaptic Calendar'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#736D6B] hover:text-[#2B2827]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-5">
              {/* Exam Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#2B2827]">
                  Exam Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus & Partition Recovery Midterm"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD7C8] bg-[#FAF8F2] text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
                />
              </div>

              {/* Course Code & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#2B2827]">
                    Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS 482 / NEURO 301"
                    value={modalCourse}
                    onChange={(e) => setModalCourse(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD7C8] bg-[#FAF8F2] text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#2B2827]">
                    Subject Field
                  </label>
                  <select
                    value={modalSubject}
                    onChange={(e) => setModalSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD7C8] bg-[#FAF8F2] text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Neuroscience">Neuroscience</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Economics">Economics</option>
                    <option value="General">General Knowledge</option>
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#2B2827]">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD7C8] bg-[#FAF8F2] text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#2B2827]">
                    Time
                  </label>
                  <input
                    type="time"
                    value={modalTime}
                    onChange={(e) => setModalTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD7C8] bg-[#FAF8F2] text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
                  />
                </div>
              </div>

              {/* Target Retention Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#2B2827]">Target Exam-Day Retention Goal:</span>
                  <span className="font-bold text-[#8F6A00]">{modalTargetRetention}%</span>
                </div>
                <input
                  type="range"
                  min={75}
                  max={98}
                  step={1}
                  value={modalTargetRetention}
                  onChange={(e) => setModalTargetRetention(Number(e.target.value))}
                  className="w-full accent-[#BF9A2A] cursor-pointer"
                />
                <p className="text-[10px] text-[#736D6B] font-mono">
                  FSRS Bayesian scheduler recommends 90-92% for university exams to prevent critical forgetting cliffs.
                </p>
              </div>

              {/* Location & Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#2B2827]">
                  Location / Exam Format
                </label>
                <input
                  type="text"
                  placeholder="e.g. Turing Hall 102 & ProctorU"
                  value={modalLocation}
                  onChange={(e) => setModalLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD7C8] bg-[#FAF8F2] text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
                />
              </div>

              {/* ========================================================================= */}
              {/* SUPPORT MATERIAL INGESTION & VESSEL SYNTHESIS (GEMINI 3.7 / VERTEX AI) */}
              {/* ========================================================================= */}
              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-3.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#BF9A2A]/20 text-[#8F6A00] flex items-center justify-center font-bold text-xs">
                      ✨
                    </span>
                    <label className="text-xs font-mono font-bold text-[#2B2827]">
                      Study Materials & Memory Vessel Synthesis
                    </label>
                  </div>

                  <div className="flex items-center bg-white border border-[#DDD7C8] rounded-xl p-0.5">
                    <button
                      type="button"
                      onClick={() => setModalVesselSourceTab('upload')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                        modalVesselSourceTab === 'upload'
                          ? 'bg-[#152659] text-white shadow-2xs'
                          : 'text-[#736D6B] hover:text-[#2B2827]'
                      }`}
                    >
                      Upload Material
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalVesselSourceTab('existing')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                        modalVesselSourceTab === 'existing'
                          ? 'bg-[#152659] text-white shadow-2xs'
                          : 'text-[#736D6B] hover:text-[#2B2827]'
                      }`}
                    >
                      Existing Garden ({concepts.length})
                    </button>
                  </div>
                </div>

                {/* Tab 1: Upload Support Materials (PDF, DOCX, PPTX, Image, Text) */}
                {modalVesselSourceTab === 'upload' && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#5A5553] leading-relaxed">
                      Upload your lecture slides, syllabus PDF, or paste text notes. Gemini 3.5 will analyze causal invariants and synthesize new memory vessels automatically attached to this exam.
                    </p>

                    {/* File Drop / Select Area */}
                    <div className="border-2 border-dashed border-[#DDD7C8] hover:border-[#BF9A2A] rounded-xl p-4 text-center bg-white transition-all">
                      <input
                        type="file"
                        id="exam-support-file"
                        accept=".pdf,.docx,.pptx,.txt,.md,.png,.jpg,.jpeg,.webp"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="exam-support-file" className="cursor-pointer block space-y-1.5">
                        <Upload className="w-6 h-6 text-[#BF9A2A] mx-auto" />
                        <div className="text-xs font-semibold text-[#2B2827]">
                          {uploadedFileName ? (
                            <span className="text-[#152659] font-mono font-bold">{uploadedFileName}</span>
                          ) : (
                            <span>Click to upload PDF, DOCX, PPTX, or slide image</span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#736D6B] block">
                          PDF • Slides • Handouts • Lecture Notes
                        </span>
                      </label>
                    </div>

                    {/* Or Paste Text Notes */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[#736D6B]">
                        Or Paste Syllabus / Lecture Text
                      </span>
                      <textarea
                        rows={2}
                        placeholder="Paste syllabus outlines, key equations, theorem statements, or professor hints..."
                        value={uploadedTextNotes}
                        onChange={(e) => setUploadedTextNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#DDD7C8] bg-white text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
                      />
                    </div>

                    {/* Extract Trigger Button */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleExtractVessels}
                        disabled={isExtractingVessels || (!uploadedFileBase64 && !uploadedTextNotes.trim())}
                        className="px-4 py-2 rounded-xl bg-[#152659] hover:bg-[#1E357A] disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-xs"
                      >
                        {isExtractingVessels ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#BF9A2A]" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-[#BF9A2A]" />
                        )}
                        <span>
                          {isExtractingVessels
                            ? 'Extracting with Gemini 3.5...'
                            : 'Extract Invariants & Vessels (Gemini 3.5)'}
                        </span>
                      </button>

                      {extractedVessels.length > 0 && (
                        <span className="text-xs font-mono text-[#2F6A38] font-bold">
                          ✓ {extractedVessels.filter(v => v.selected).length}/{extractedVessels.length} vessels ready
                        </span>
                      )}
                    </div>

                    {/* Progressive extraction step */}
                    {isExtractingVessels && extractionProgressStep && (
                      <div className="p-3 rounded-xl bg-white border border-[#DDD7C8] text-xs font-mono text-[#8F6A00] flex items-center gap-2 animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        <span>{extractionProgressStep}</span>
                      </div>
                    )}

                    {extractionError && (
                      <div className="p-3 rounded-xl bg-[#8F2A2A]/10 border border-[#8F2A2A]/20 text-xs font-mono text-[#8F2A2A] flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{extractionError}</span>
                      </div>
                    )}

                    {/* Extracted Vessels Checklist */}
                    {extractedVessels.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#DDD7C8]">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-[#2B2827]">
                            Synthesized Vessels ({extractedVessels.length} found):
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const allSelected = extractedVessels.every(v => v.selected);
                              setExtractedVessels(prev => prev.map(v => ({ ...v, selected: !allSelected })));
                            }}
                            className="text-[10px] text-[#8F6A00] hover:underline"
                          >
                            {extractedVessels.every(v => v.selected) ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                          {extractedVessels.map((v, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                setExtractedVessels(prev =>
                                  prev.map((item, idx) => (idx === i ? { ...item, selected: !item.selected } : item))
                                );
                              }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                                v.selected
                                  ? 'bg-white border-[#BF9A2A] shadow-2xs'
                                  : 'bg-[#FAF8F2] border-[#DDD7C8] opacity-60'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-serif font-bold text-xs text-[#2B2827]">
                                      {v.title}
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#BF9A2A]/15 text-[#8F6A00]">
                                      Diff: {v.initialDifficulty}/10
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#5A5553] leading-relaxed line-clamp-2">
                                    {v.summary}
                                  </p>
                                </div>
                                <div className="shrink-0 pt-0.5">
                                  {v.selected ? (
                                    <CheckSquare className="w-4 h-4 text-[#152659]" />
                                  ) : (
                                    <Square className="w-4 h-4 text-[#736D6B]" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Pick Existing Concepts from Garden */}
                {modalVesselSourceTab === 'existing' && (
                  <div className="space-y-2">
                    {concepts.length === 0 ? (
                      <div className="p-4 text-center space-y-2 bg-white rounded-xl border border-[#DDD7C8]">
                        <p className="text-xs text-[#736D6B]">
                          No memory vessels in your garden yet.
                        </p>
                        <button
                          type="button"
                          onClick={() => setModalVesselSourceTab('upload')}
                          className="text-xs font-mono font-bold text-[#8F6A00] hover:underline"
                        >
                          → Switch to "Upload Material" to extract your first vessels with Gemini 3.7
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#5A5553]">
                            Selected: {modalSelectedConceptIds.length} of {concepts.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (modalSelectedConceptIds.length === concepts.length) {
                                setModalSelectedConceptIds([]);
                              } else {
                                setModalSelectedConceptIds(concepts.map((c) => c.id));
                              }
                            }}
                            className="text-[10px] text-[#8F6A00] hover:underline"
                          >
                            {modalSelectedConceptIds.length === concepts.length ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>

                        <div className="max-h-40 overflow-y-auto border border-[#DDD7C8] rounded-xl p-2 bg-white space-y-1">
                          {concepts.map((c) => {
                            const isSelected = modalSelectedConceptIds.includes(c.id);
                            return (
                              <div
                                key={c.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setModalSelectedConceptIds((prev) => prev.filter((id) => id !== c.id));
                                  } else {
                                    setModalSelectedConceptIds((prev) => [...prev, c.id]);
                                  }
                                }}
                                className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-[#152659] text-white'
                                    : 'bg-white text-[#2B2827] border border-[#DDD7C8]/60 hover:bg-[#FAF8F2]'
                                }`}
                              >
                                <span className="font-semibold truncate max-w-xs">{c.title}</span>
                                <span className="font-mono text-[10px] shrink-0 ml-2">
                                  {Math.round(c.currentRetention * 100)}% retention
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#2B2827]">
                  Syllabus Invariants & Professor Caution Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Key theorems, boundary conditions, or exam trap areas..."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD7C8] bg-[#FAF8F2] text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DDD7C8]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#DDD7C8] hover:bg-[#FAF8F2] text-xs font-semibold text-[#5A5553]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-white text-xs font-semibold shadow-xs inline-flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-[#BF9A2A]" />
                  <span>
                    {editingExamId
                      ? 'Save Changes'
                      : extractedVessels.filter(v => v.selected).length > 0
                      ? `Schedule Exam & Plant ${extractedVessels.filter(v => v.selected).length} Vessels`
                      : 'Schedule Exam Milestone'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
