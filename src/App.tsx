import React, { useState, useEffect } from 'react';
import { Concept, TelemetryLog, SynapticStreakData } from './types';
import { SEED_CONCEPTS, calculateRetention, calculateConfidenceInterval, getStatusFromRetention } from './lib/fsrs';
import { getStoredStreak, recordSessionInStreak } from './lib/streak';
import { SidebarNavigation, TabKey } from './components/SidebarNavigation';
import { DashboardHome } from './components/DashboardHome';
import { MemoryGarden } from './components/MemoryGarden';
import { IngestionHub } from './components/IngestionHub';
import { ActiveRetrievalRoom } from './components/ActiveRetrievalRoom';
import { RetentionOracle } from './components/RetentionOracle';
import { AutonomousDispatcher } from './components/AutonomousDispatcher';
import { JudgeModal } from './components/JudgeModal';
import { TelemetryDrawer } from './components/TelemetryDrawer';
import { DailySynapticSummaryModal } from './components/DailySynapticSummaryModal';
import { LandingPage } from './components/LandingPage';
import { ExamCalendar } from './components/ExamCalendar';
import { AboutTab } from './components/AboutTab';
import { Home, Sparkles, FastForward, RotateCcw, Award, Terminal, Brain } from 'lucide-react';

export default function App() {
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [concepts, setConcepts] = useState<Concept[]>(() => {
    const saved = localStorage.getItem('kintsugi_concepts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn('Failed to parse saved concepts:', e);
      }
    }
    return [];
  });

  const [streak, setStreak] = useState<SynapticStreakData>(() => getStoredStreak());
  const [currentTab, setCurrentTab] = useState<TabKey>('home');
  const [timeWarpDays, setTimeWarpDays] = useState<number>(0);
  const [activeReviewConcept, setActiveReviewConcept] = useState<Concept | null>(null);
  const [selectedOracleConceptId, setSelectedOracleConceptId] = useState<string | undefined>();
  const [judgeModalOpen, setJudgeModalOpen] = useState(false);
  const [telemetryDrawerOpen, setTelemetryDrawerOpen] = useState(false);
  const [dailySummaryOpen, setDailySummaryOpen] = useState<boolean>(false);

  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([
    {
      id: 't_init',
      timestamp: new Date().toISOString(),
      agentRole: 'Bayesian FSRS Engine',
      action: 'System Bootstrapped',
      details: 'Initialized 4-Agent pipeline with power-law decay parameterization and Gemini 3.7 server hooks.',
      latencyMs: 12,
      status: 'success',
    },
  ]);

  // Save concepts locally
  useEffect(() => {
    localStorage.setItem('kintsugi_concepts', JSON.stringify(concepts));
  }, [concepts]);

  // Recalculate retentions when timeWarpDays changes
  const applyTimeWarp = (deltaDays: number) => {
    const newDays = Math.max(0, timeWarpDays + deltaDays);
    setTimeWarpDays(newDays);

    setConcepts((prev) =>
      prev.map((c) => {
        const lastRev = new Date(c.lastReviewedAt);
        const naturalElapsedDays = Math.max(0, (Date.now() - lastRev.getTime()) / (1000 * 60 * 60 * 24));
        const totalElapsedDays = naturalElapsedDays + newDays;
        const newRetention = calculateRetention(c.stability, totalElapsedDays);
        const [low, high] = calculateConfidenceInterval(newRetention, c.reviewCount);

        return {
          ...c,
          currentRetention: Number(newRetention.toFixed(3)),
          confidenceLow: Number(low.toFixed(3)),
          confidenceHigh: Number(high.toFixed(3)),
          status: getStatusFromRetention(newRetention, c.kintsugiRepairs),
        };
      })
    );

    addTelemetry(
      'Time-Warp Fast Forward',
      `Simulated ${newDays.toFixed(1)} days of natural biological memory decay across ${concepts.length} synapses.`,
      'Bayesian FSRS Engine'
    );
  };

  const addTelemetry = (
    action: string,
    details: string,
    agentRole: TelemetryLog['agentRole'] = 'Bayesian FSRS Engine',
    status: TelemetryLog['status'] = 'info'
  ) => {
    const newLog: TelemetryLog = {
      id: `tel_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      agentRole,
      action,
      details,
      latencyMs: Math.round(Math.random() * 200 + 50),
      status,
    };
    setTelemetryLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  const handleIngestComplete = (newConcepts: Concept[]) => {
    setConcepts((prev) => [...newConcepts, ...prev]);
    setCurrentTab('home');
    addTelemetry(
      'New Concepts Planted',
      `Added ${newConcepts.length} newly distilled vessels to the synaptic sanctuary.`,
      'Ingestion Agent',
      'success'
    );
  };

  const handleAddConcepts = (newConcepts: Concept[]) => {
    setConcepts((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const uniqueNew = newConcepts.filter((c) => !existingIds.has(c.id));
      return [...uniqueNew, ...prev];
    });
    addTelemetry(
      'New Exam Vessels Synthesized',
      `Synthesized and planted ${newConcepts.length} atomic memory vessels directly from exam syllabus materials.`,
      'Ingestion Agent',
      'success'
    );
  };

  const handleUpdateConcept = (updated: Concept) => {
    setConcepts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setActiveReviewConcept(updated);
  };

  const handleRecordRetrievalSession = () => {
    setStreak((prev) => {
      const { updatedStreak, isNewDayStreak } = recordSessionInStreak(prev);
      if (isNewDayStreak) {
        addTelemetry(
          'Synaptic Streak Extended',
          `Maintained daily golden lacquer seam! Current streak is now ${updatedStreak.currentStreak} consecutive days.`,
          'Bayesian FSRS Engine',
          'success'
        );
      } else {
        addTelemetry(
          'Session Recorded',
          `Completed daily practice! Total sessions completed: ${updatedStreak.totalSessionsCompleted}.`,
          'Bayesian FSRS Engine',
          'info'
        );
      }
      return updatedStreak;
    });
  };

  const handleSelectConceptForReview = (concept?: Concept) => {
    if (concept) {
      setActiveReviewConcept(concept);
    } else if (concepts.length > 0) {
      // Find concept closest to cliff
      const sortedCliff = [...concepts].sort((a, b) => a.currentRetention - b.currentRetention);
      setActiveReviewConcept(sortedCliff[0]);
    }
    setCurrentTab('review');
  };

  const handleInspectOracle = (concept: Concept) => {
    setSelectedOracleConceptId(concept.id);
    setCurrentTab('progress');
  };

  const handleStartPriorityRetrieval = () => {
    const sortedCliff = [...concepts]
      .filter((c) => c.currentRetention < 0.70)
      .sort((a, b) => a.currentRetention - b.currentRetention);

    const targetConcept = sortedCliff.length > 0 ? sortedCliff[0] : concepts[0];
    if (targetConcept) {
      setActiveReviewConcept(targetConcept);
      setCurrentTab('review');
      addTelemetry(
        'Priority Socratic Practice Started',
        `Launched immediate golden repair for "${targetConcept.title}" (${Math.round(targetConcept.currentRetention * 100)}% retention).`,
        'Socratic Interviewer',
        'info'
      );
    }
  };

  const urgentCliffCount = concepts.filter((c) => c.currentRetention < 0.70).length;

  if (showLanding) {
    return (
      <LandingPage
        onEnterApp={() => {
          setShowLanding(false);
          // Trigger daily summary on entry if not dismissed today
          const todayStr = new Date().toISOString().split('T')[0];
          const dismissedDate = localStorage.getItem('kintsugi_daily_summary_dismissed_date');
          if (dismissedDate !== todayStr) {
            setDailySummaryOpen(true);
          }
        }}
        onOpenJudgeModal={() => setJudgeModalOpen(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F0E4] text-[#403C3B] flex flex-col lg:flex-row font-sans selection:bg-[#BF9A2A]/30 selection:text-[#2B2827]">
      {/* Left Sidebar Navigation (Desktop) & Bottom Bar (Mobile) */}
      <SidebarNavigation
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        onReturnToLanding={() => setShowLanding(true)}
        urgentCount={urgentCliffCount}
        streak={streak}
        timeWarpDays={timeWarpDays}
        onFastForwardDecay={applyTimeWarp}
        onOpenJudgeModal={() => setJudgeModalOpen(true)}
        onOpenDailySummary={() => setDailySummaryOpen(true)}
        onToggleTelemetry={() => setTelemetryDrawerOpen((prev) => !prev)}
        telemetryCount={telemetryLogs.length}
        onUpdateStreak={setStreak}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'home' && (
            <DashboardHome
              concepts={concepts}
              streak={streak}
              timeWarpDays={timeWarpDays}
              onStartReview={handleSelectConceptForReview}
              onNavigateToTab={(t) => {
                if (t === 'garden') setCurrentTab('neuroplasticity');
                else if (t === 'ingest') setCurrentTab('materials');
                else if (t === 'retrieve') setCurrentTab('review');
                else if (t === 'oracle') setCurrentTab('progress');
                else if (t === 'dispatch') setCurrentTab('insights');
                else if ((t as string) === 'calendar') setCurrentTab('calendar');
                else if ((t as string) === 'about') setCurrentTab('about');
              }}
              onOpenJournal={() => setDailySummaryOpen(true)}
              onOpenDailySummary={() => setDailySummaryOpen(true)}
              onOpenJudgeModal={() => setJudgeModalOpen(true)}
            />
          )}

          {currentTab === 'calendar' && (
            <ExamCalendar
              concepts={concepts}
              onAddConcepts={handleAddConcepts}
              onStartReviewForConcept={handleSelectConceptForReview}
              onAddTelemetry={addTelemetry}
            />
          )}

          {currentTab === 'materials' && (
            <IngestionHub
              onIngestComplete={handleIngestComplete}
              onAddTelemetry={addTelemetry}
            />
          )}

          {currentTab === 'review' && (
            <ActiveRetrievalRoom
              concept={activeReviewConcept || concepts[0]}
              onUpdateConcept={handleUpdateConcept}
              onRecordRetrievalSession={handleRecordRetrievalSession}
              onAddTelemetry={addTelemetry}
              onBackToGarden={() => setCurrentTab('home')}
            />
          )}

          {currentTab === 'neuroplasticity' && (
            <MemoryGarden
              concepts={concepts}
              timeWarpDays={timeWarpDays}
              onSelectConceptForReview={handleSelectConceptForReview}
              onInspectOracle={handleInspectOracle}
              onFastForwardDecay={applyTimeWarp}
            />
          )}

          {currentTab === 'progress' && (
            <RetentionOracle
              concepts={concepts}
              selectedConceptId={selectedOracleConceptId}
              onSelectConcept={(c) => setSelectedOracleConceptId(c.id)}
              onReviewConcept={handleSelectConceptForReview}
            />
          )}

          {currentTab === 'insights' && (
            <AutonomousDispatcher
              concepts={concepts}
              onReviewConcept={handleSelectConceptForReview}
              onAddTelemetry={addTelemetry}
            />
          )}

          {currentTab === 'about' && (
            <AboutTab
              onNavigateToTab={(t) => {
                if (t === 'home') setCurrentTab('home');
                else if (t === 'materials') setCurrentTab('materials');
                else if (t === 'calendar') setCurrentTab('calendar');
                else if (t === 'review') setCurrentTab('review');
                else if (t === 'neuroplasticity') setCurrentTab('neuroplasticity');
                else if (t === 'progress') setCurrentTab('progress');
                else if (t === 'journal') setCurrentTab('journal');
                else if (t === 'insights') setCurrentTab('insights');
              }}
              onOpenJudgeModal={() => setJudgeModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Daily Synaptic Summary Modal (Startup / Journal Overview) */}
      <DailySynapticSummaryModal
        isOpen={dailySummaryOpen}
        onClose={() => setDailySummaryOpen(false)}
        concepts={concepts}
        onStartRetrievalForConcept={handleSelectConceptForReview}
        onStartPriorityRetrieval={handleStartPriorityRetrieval}
      />

      {/* Hackathon Judge Dossier Modal */}
      <JudgeModal
        isOpen={judgeModalOpen}
        onClose={() => setJudgeModalOpen(false)}
      />

      {/* Live Agent Telemetry Stream Drawer */}
      <TelemetryDrawer
        isOpen={telemetryDrawerOpen}
        onClose={() => setTelemetryDrawerOpen(false)}
        logs={telemetryLogs}
        onClearLogs={() => setTelemetryLogs([])}
      />
    </div>
  );
}

