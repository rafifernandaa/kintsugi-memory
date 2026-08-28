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
  GraduationCap
} from 'lucide-react';

interface ExamCalendarProps {
  concepts: Concept[];
  onStartReviewForConcept: (concept: Concept) => void;
  onAddTelemetry: (action: string, details: string, agent: string) => void;
}

const DEFAULT_SAMPLE_EXAMS: ExamEvent[] = [
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
  onStartReviewForConcept,
  onAddTelemetry
}) => {
  // Persistence
  const [exams, setExams] = useState<ExamEvent[]>(() => {
    try {
      const saved = localStorage.getItem('kintsugi_exam_events');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved exams', e);
    }
    return DEFAULT_SAMPLE_EXAMS;
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
    setModalSelectedConceptIds(concepts.slice(0, 3).map((c) => c.id));
    setModalUrgency('medium');
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
    setIsModalOpen(true);
  };

  // Save Exam
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    const fullDate = `${modalDate}T${modalTime}:00`;
    const colorMap: Record<string, string> = {
      'high': '#8F2A2A',
      'medium': '#152659',
      'normal': '#2F6A38'
    };

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
                conceptIds: modalSelectedConceptIds,
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
        `Modified exam parameters for "${modalTitle.trim()}" (${modalCourse}) scheduled for ${modalDate}.`,
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
        conceptIds: modalSelectedConceptIds,
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
        `Marked upcoming exam "${newExam.title}" (${newExam.courseCode}) on ${modalDate} with ${(newExam.targetRetention * 100).toFixed(0)}% target retention.`,
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

  // Generate AI Study Plan with Gemini 3.7
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
        dailySchedule,
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
      // Pick first general concept
      if (concepts.length > 0) onStartReviewForConcept(concepts[0]);
      return;
    }
    // Sort by retention ascending (highest priority first)
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
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/30 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-[#8F6A00]" /> Exam Horizon & Bayesian Calendar
              </span>
              <span className="text-xs font-mono text-[#736D6B]">
                金継ぎ 試験日程 • FSRS Retention Countdown
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B2827] tracking-tight">
              Calibrate Active Retrieval to Your Exam Milestones
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5553] max-w-2xl leading-relaxed">
              Mark course exam dates and midterms. Kintsugi Memory computes Bayesian decay countdowns, detects knowledge illusions in advance, and schedules high-yield Socratic review sprints.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#BF9A2A]" />
              <span>Mark New Exam</span>
            </button>
          </div>
        </div>

        {/* Quick Horizon Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#DDD7C8]/60">
          {exams.slice(0, 3).map((exam) => {
            const daysLeft = getDaysRemaining(exam.date);
            const { mean, highRisk } = getExamReadiness(exam);
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
                  <div className="flex items-center gap-2 text-[11px] text-[#736D6B] font-mono mt-1">
                    <Clock className="w-3 h-3 text-[#BF9A2A]" />
                    <span>{new Date(exam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}</span>
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

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg border border-[#DDD7C8] hover:bg-[#FAF8F2] text-[#2B2827] transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleToday}
                  className="px-2.5 py-1 rounded-lg border border-[#DDD7C8] hover:bg-[#FAF8F2] text-[11px] font-mono font-bold text-[#8F6A00] transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg border border-[#DDD7C8] hover:bg-[#FAF8F2] text-[#2B2827] transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-[#736D6B] pb-1 border-b border-[#DDD7C8]">
              <div>SUN</div>
              <div>MON</div>
              <div>TUE</div>
              <div>WED</div>
              <div>THU</div>
              <div>FRI</div>
              <div>SAT</div>
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((cell, idx) => {
                const isToday = cell.dateStr === todayStr;
                const isSelected = cell.dateStr === selectedDateStr;
                const dayExams = exams.filter((e) => e.date.startsWith(cell.dateStr));
                const hasExam = dayExams.length > 0;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedDateStr(cell.dateStr);
                      if (hasExam) {
                        setSelectedExamId(dayExams[0].id);
                      }
                    }}
                    className={`min-h-[84px] sm:min-h-[96px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative ${
                      !cell.isCurrentMonth
                        ? 'bg-[#FAF8F2]/40 border-[#DDD7C8]/40 text-[#9C9491]'
                        : isSelected
                        ? 'bg-[#FAF8F2] border-[#BF9A2A] shadow-xs'
                        : isToday
                        ? 'bg-[#FAF8F2]/70 border-[#8F6A00]/60'
                        : 'bg-[#FFFFFF] border-[#DDD7C8]/70 hover:border-[#BF9A2A]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-bold inline-flex items-center justify-center w-5 h-5 rounded-full ${
                          isToday
                            ? 'bg-[#BF9A2A] text-white'
                            : isSelected
                            ? 'bg-[#152659] text-white'
                            : ''
                        }`}
                      >
                        {cell.day}
                      </span>
                      {hasExam && (
                        <span className="w-2 h-2 rounded-full bg-[#8F2A2A] animate-ping" />
                      )}
                    </div>

                    {/* Day Exams Mini Badges */}
                    <div className="space-y-1 mt-1">
                      {dayExams.map((e) => (
                        <div
                          key={e.id}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold truncate border flex items-center gap-1 shadow-2xs"
                          style={{
                            backgroundColor: `${e.color || '#152659'}15`,
                            color: e.color || '#152659',
                            borderColor: `${e.color || '#152659'}40`
                          }}
                          title={`${e.courseCode}: ${e.title}`}
                        >
                          <GraduationCap className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{e.courseCode || e.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 1 Col: Selected Date & Exam Details */}
          <div className="space-y-4">
            {/* Selected Date Summary Panel */}
            <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#DDD7C8] pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8F6A00] font-bold">
                    Target Inspection Day
                  </span>
                  <h4 className="text-base font-serif font-bold text-[#2B2827]">
                    {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h4>
                </div>
                {selectedDateStr === todayStr && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/30">
                    TODAY
                  </span>
                )}
              </div>

              {/* Exams on this day */}
              {exams.filter((e) => e.date.startsWith(selectedDateStr)).length > 0 ? (
                <div className="space-y-3">
                  <div className="text-xs font-mono text-[#5A5553] font-bold">
                    Scheduled Exams on this Date:
                  </div>
                  {exams
                    .filter((e) => e.date.startsWith(selectedDateStr))
                    .map((exam) => {
                      const { mean, highRisk } = getExamReadiness(exam);
                      const daysLeft = getDaysRemaining(exam.date);

                      return (
                        <div
                          key={exam.id}
                          className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-2xl p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#152659] text-white">
                                  {exam.courseCode}
                                </span>
                                <span className="text-[11px] font-mono text-[#736D6B]">
                                  {new Date(exam.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <h5 className="text-sm font-serif font-bold text-[#2B2827] mt-1">
                                {exam.title}
                              </h5>
                            </div>
                            <button
                              onClick={() => handleOpenEditModal(exam)}
                              className="p-1 rounded text-[#736D6B] hover:text-[#2B2827]"
                              title="Edit Exam"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {exam.location && (
                            <div className="flex items-center gap-1.5 text-xs text-[#5A5553]">
                              <MapPin className="w-3.5 h-3.5 text-[#BF9A2A]" />
                              <span>{exam.location}</span>
                            </div>
                          )}

                          {/* Readiness breakdown */}
                          <div className="space-y-1.5 pt-2 border-t border-[#DDD7C8]/60">
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-[#5A5553]">Mean Retention:</span>
                              <span className="font-bold text-[#2B2827]">
                                {Math.round(mean * 100)}% / {Math.round(exam.targetRetention * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-[#DDD7C8] h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-[#BF9A2A] h-full rounded-full"
                                style={{ width: `${Math.round(mean * 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="pt-2 flex flex-wrap gap-2">
                            <button
                              onClick={() => handleLaunchSprintReview(exam)}
                              className="flex-1 px-3 py-2 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <Play className="w-3 h-3 text-[#BF9A2A]" />
                              <span>Sprint Review</span>
                            </button>
                            <button
                              onClick={() => handleGenerateStudyPlan(exam)}
                              className="px-3 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F2] text-[#2B2827] border border-[#DDD7C8] text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#BF9A2A]" />
                              <span>AI Plan</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <CalendarIcon className="w-8 h-8 text-[#DDD7C8] mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-[#5A5553]">
                      No exams scheduled for this date.
                    </p>
                    <p className="text-[11px] text-[#736D6B]">
                      Great day for standard FSRS spaced retrieval maintenance!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setModalDate(selectedDateStr);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#FAF8F2] hover:bg-[#EAE6D6] text-xs font-mono font-bold text-[#8F6A00] border border-[#DDD7C8] inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Schedule Exam on {selectedDateStr}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Cognitive Spaced Repetition Pro Tip */}
            <div className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-3xl p-5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#8F6A00]">
                <Brain className="w-3.5 h-3.5" />
                <span>The Bayesian Horizon Theorem</span>
              </div>
              <p className="text-xs text-[#5A5553] leading-relaxed">
                Re-reading notes 24 hours before an exam yields rapid decay. Performing 1 calibrated Socratic retrieval session 4 days out locks the memory trace across the exam horizon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Agenda Mode: All Cards List */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const daysLeft = getDaysRemaining(exam.date);
              const { mean, count, highRisk } = getExamReadiness(exam);
              const linked = concepts.filter((c) => exam.conceptIds && exam.conceptIds.includes(c.id));

              return (
                <div
                  key={exam.id}
                  className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-[#152659] text-white">
                        {exam.courseCode || 'EXAM'}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                          daysLeft <= 3 && daysLeft >= 0
                            ? 'bg-[#8F2A2A]/15 text-[#8F2A2A] border border-[#8F2A2A]/30 animate-pulse'
                            : 'bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/30'
                        }`}
                      >
                        {daysLeft < 0 ? 'Passed' : daysLeft === 0 ? 'TODAY' : `In ${daysLeft} days`}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-serif font-bold text-[#2B2827] leading-snug">
                        {exam.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[#736D6B] font-mono mt-1">
                        <Clock className="w-3.5 h-3.5 text-[#BF9A2A]" />
                        <span>
                          {new Date(exam.date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {exam.location && (
                        <div className="flex items-center gap-2 text-xs text-[#5A5553] mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#736D6B]" />
                          <span>{exam.location}</span>
                        </div>
                      )}
                    </div>

                    {exam.notes && (
                      <p className="text-xs text-[#5A5553] bg-[#FAF8F2] p-2.5 rounded-xl border border-[#DDD7C8]/60 leading-relaxed">
                        {exam.notes}
                      </p>
                    )}

                    {/* Scope & Concepts */}
                    <div className="space-y-2 pt-2 border-t border-[#DDD7C8]/60">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#5A5553]">Linked Scope ({count} vessels):</span>
                        <span className="font-bold text-[#2B2827]">
                          {Math.round(mean * 100)}% / {Math.round(exam.targetRetention * 100)}% Target
                        </span>
                      </div>

                      <div className="w-full bg-[#EAE6D6] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#BF9A2A] h-full rounded-full"
                          style={{ width: `${Math.round(mean * 100)}%` }}
                        />
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {linked.map((c) => (
                          <span
                            key={c.id}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                              c.currentRetention < 0.75
                                ? 'bg-[#8F2A2A]/10 text-[#8F2A2A] border-[#8F2A2A]/30'
                                : 'bg-[#FAF8F2] text-[#5A5553] border-[#DDD7C8]'
                            }`}
                          >
                            {c.title} ({Math.round(c.currentRetention * 100)}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 border-t border-[#DDD7C8] space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleLaunchSprintReview(exam)}
                        className="px-3 py-2 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Play className="w-3 h-3 text-[#BF9A2A]" />
                        <span>Sprint Practice</span>
                      </button>
                      <button
                        onClick={() => handleGenerateStudyPlan(exam)}
                        className="px-3 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#2B2827] border border-[#DDD7C8] text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#BF9A2A]" />
                        <span>AI Plan</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        onClick={() => handleOpenEditModal(exam)}
                        className="text-[#736D6B] hover:text-[#2B2827] flex items-center gap-1 font-mono text-[11px]"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Scope</span>
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="text-[#8F2A2A] hover:text-red-700 flex items-center gap-1 font-mono text-[11px]"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Study Plan View */}
      {viewMode === 'planner' && (
        <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#DDD7C8] pb-4 flex-wrap gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/30">
                  Gemini 3.7 Flash Strategy Synthesizer
                </span>
                <span className="text-xs font-mono text-[#736D6B]">
                  Target Exam: {selectedExam?.title} ({selectedExam?.courseCode})
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#2B2827]">
                Countdown Retrieval Roadmap
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {selectedExam && (
                <button
                  onClick={() => handleGenerateStudyPlan(selectedExam)}
                  disabled={isGeneratingPlan}
                  className="px-4 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#2B2827] border border-[#DDD7C8] text-xs font-mono font-bold inline-flex items-center gap-2"
                >
                  {isGeneratingPlan ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#BF9A2A]" />}
                  <span>Regenerate Strategy</span>
                </button>
              )}
              <button
                onClick={() => setViewMode('calendar')}
                className="px-3 py-2 rounded-xl bg-[#152659] text-white text-xs font-semibold"
              >
                Back to Calendar
              </button>
            </div>
          </div>

          {isGeneratingPlan && (
            <div className="text-center py-16 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#BF9A2A]/15 border border-[#BF9A2A]/40 flex items-center justify-center mx-auto animate-bounce">
                <Sparkles className="w-6 h-6 text-[#BF9A2A]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-serif font-bold text-[#2B2827]">
                  Synthesizing Socratic Exam Countdown...
                </h4>
                <p className="text-xs font-mono text-[#736D6B] max-w-md mx-auto">
                  Fitting FSRS Bayesian stability priors against exam milestone date and isolating illusion of competence traps.
                </p>
              </div>
            </div>
          )}

          {!isGeneratingPlan && studyPlan && (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs font-mono uppercase font-bold text-[#8F6A00] flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    <span>Strategic Diagnosis</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span>Current Retention: <strong className="text-[#2B2827]">{Math.round(studyPlan.currentMeanRetention * 100)}%</strong></span>
                    <span>•</span>
                    <span>Recommended Daily: <strong className="text-[#8F6A00]">{studyPlan.recommendedDailyMinutes} mins</strong></span>
                  </div>
                </div>
                <p className="text-sm text-[#403C3B] leading-relaxed">
                  {studyPlan.strategySummary}
                </p>
              </div>

              {/* High Risk Concept Traps */}
              {studyPlan.highRiskConcepts && studyPlan.highRiskConcepts.length > 0 && (
                <div className="bg-[#8F2A2A]/5 border border-[#8F2A2A]/20 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#8F2A2A]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>High-Vulnerability Exam Concepts (Priority Retrieval Targets)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {studyPlan.highRiskConcepts.map((item, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-[#FFFFFF] border border-[#8F2A2A]/30 text-xs text-[#8F2A2A] font-semibold flex items-center gap-1.5 shadow-2xs"
                      >
                        <Zap className="w-3 h-3 text-[#8F2A2A]" />
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Day by Day Schedule Grid */}
              <div className="space-y-3">
                <h4 className="text-base font-serif font-bold text-[#2B2827]">
                  Daily Active Retrieval Roadmap
                </h4>
                <div className="space-y-3">
                  {studyPlan.dailySchedule?.map((day, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-[#BF9A2A]/60 transition-colors"
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#152659] text-white">
                            Day {day.dayOffset}
                          </span>
                          <span className="text-xs font-mono text-[#736D6B]">
                            {day.dateStr}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FAF8F2] text-[#8F6A00] border border-[#DDD7C8]">
                            ⏱️ {day.estimatedMinutes} mins
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
                    <Sparkles className="w-3.5 h-3.5" />
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

      {/* Add / Edit Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DDD7C8] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#8F6A00] font-bold">
                  {editingExamId ? 'Edit Exam Milestone' : 'Schedule Upcoming Exam'}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#2B2827]">
                  {editingExamId ? 'Update Exam Scope' : 'Mark Exam on Synaptic Calendar'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#736D6B] hover:text-[#2B2827]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4">
              {/* Exam Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#2B2827]">
                  Exam Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus & Raft Midterm"
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

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#2B2827]">
                  Location / Format
                </label>
                <input
                  type="text"
                  placeholder="e.g. Turing Lecture Hall 101 / Online Exam"
                  value={modalLocation}
                  onChange={(e) => setModalLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD7C8] bg-[#FAF8F2] text-xs text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
                />
              </div>

              {/* Concept Scope Multi-Select */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-[#2B2827]">
                    Select Scope Vessels ({modalSelectedConceptIds.length} chosen)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (modalSelectedConceptIds.length === concepts.length) {
                        setModalSelectedConceptIds([]);
                      } else {
                        setModalSelectedConceptIds(concepts.map((c) => c.id));
                      }
                    }}
                    className="text-[10px] font-mono text-[#8F6A00] hover:underline"
                  >
                    {modalSelectedConceptIds.length === concepts.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-36 overflow-y-auto border border-[#DDD7C8] rounded-xl p-2 bg-[#FAF8F2] space-y-1">
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
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#2B2827]">
                  Syllabus Invariants & Topic Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Key theorems, formula focus, or professor cautions..."
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
                  className="px-5 py-2.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-white text-xs font-semibold shadow-xs"
                >
                  {editingExamId ? 'Save Changes' : 'Schedule Exam Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
