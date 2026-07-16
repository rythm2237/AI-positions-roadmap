"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import CareerJourneyEngine from "@/components/career/journey-engine/CareerJourneyEngine";
import LearningWorkspace from "@/components/career/learning/LearningWorkspace";
import CareerIntelligenceWorkspace from "@/components/career/intelligence/CareerIntelligenceWorkspace";
import { aiEngineerCareer } from "@/data/careers/ai-engineer";
import { CAREER_NAV_ITEMS, careerSectionHref } from "@/lib/careerNavigation";
import { resolveReferenceSegment } from "@/lib/references/referenceResolver";
import {
  defaultCareerWorkspaceProgress,
  getCareerWorkspaceStats,
  getJourneyStageProgress,
  isJourneyStageUnlocked,
  loadCareerWorkspaceProgress,
  saveCareerWorkspaceProgress,
} from "@/lib/careerWorkspaceProgress";
import type {
  CareerAssessment,
  CareerAssessmentResult,
  CareerJourneyStage,
  CareerJourneyTask,
  CareerNote,
  CareerQuizQuestion,
  CareerResource,
  CareerWorkspaceProgress,
  CareerWorkspaceSectionId,
} from "@/types/careerWorkspace";

type IconName =
  | "arrow"
  | "bookmark"
  | "check"
  | "copy"
  | "download"
  | "lock"
  | "map"
  | "menu"
  | "note"
  | "play"
  | "target"
  | "timer"
  | "x";

type NoteModalState = {
  contextType: CareerNote["contextType"];
  contextId: string;
  contextLabel: string;
  noteId?: string;
};

type ExamSession = {
  assessment: CareerAssessment;
  stageId?: string;
  questionOrder: number[];
  answerOrders: Record<string, number[]>;
  currentIndex: number;
  selectedAnswers: Record<string, number>;
  submitted: boolean;
  result?: CareerAssessmentResult;
};

type CameraPhase = "overview" | "travel" | "focus";

type ViewportSize = {
  width: number;
  height: number;
};

const career = aiEngineerCareer;

function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    bookmark: <path d="M7 4h10v16l-5-3-5 3V4z" />,
    check: <path d="M20 6 9 17l-5-5" />,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" /><path d="M9 3v15" /><path d="M15 6v15" /></>,
    menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
    note: <><path d="M4 4h16v16H4z" /><path d="M8 8h8" /><path d="M8 12h8" /><path d="M8 16h5" /></>,
    play: <path d="m8 5 11 7-11 7V5z" />,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></>,
    timer: <><circle cx="12" cy="13" r="8" /><path d="M12 9v5l3 2" /><path d="M9 2h6" /></>,
    x: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function percentLabel(value: number) {
  return `${Math.max(0, Math.min(100, value))}%`;
}

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

function shuffleIndexes(length: number): number[] {
  return Array.from({ length }, (_, index) => index).sort(() => Math.random() - 0.5);
}

function uniqueResources(): CareerResource[] {
  const resources = new Map<string, CareerResource>();
  career.journeyStages.forEach((stage) => stage.resources.forEach((resource) => resources.set(resource.id, resource)));
  career.globalResources.forEach((resource) => resources.set(resource.id, resource));
  return Array.from(resources.values());
}

function allAssessments(): Array<{ assessment: CareerAssessment; stage: CareerJourneyStage; type: "station" | "phase" }> {
  return career.journeyStages.flatMap((stage) => [
    { assessment: stage.test, stage, type: "station" as const },
    ...(stage.phaseExam ? [{ assessment: stage.phaseExam, stage, type: "phase" as const }] : []),
  ]);
}

function validateJourneyData(): string[] {
  return career.journeyStages.flatMap((stage) => {
    const warnings: string[] = [];
    if (stage.test.questions.length < 5) warnings.push(`${stage.title} station test has fewer than 5 questions.`);
    if (stage.phaseExam && stage.phaseExam.questions.length < 5) warnings.push(`${stage.title} phase exam has fewer than 5 questions.`);
    return warnings;
  });
}

function shellButton(active = false, disabled = false): string {
  if (disabled) return "border-white/5 bg-white/[0.025] text-slate-600";
  return active
    ? "border-cyber-300/70 bg-cyber-400/15 text-white shadow-glow-cyan"
    : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-ai-400/40 hover:bg-ai-500/10 hover:text-white";
}

function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      {label ? (
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>{label}</span>
          <span>{percentLabel(value)}</span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-ai-500 via-violet-500 to-cyber-400" style={{ width: percentLabel(value) }} />
      </div>
    </div>
  );
}

function PanelCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-card backdrop-blur-xl ${className}`}>{children}</div>;
}

function TypingText({ text, active }: { text: string; active: boolean }) {
  const reduceMotion = useReducedMotion();
  const [visibleText, setVisibleText] = useState(text);

  useEffect(() => {
    if (!active || reduceMotion) {
      setVisibleText(text);
      return;
    }

    setVisibleText("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 2;
      setVisibleText(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, 18);

    return () => window.clearInterval(timer);
  }, [active, reduceMotion, text]);

  return <p className="text-sm leading-6 text-slate-300">{visibleText}</p>;
}

function useViewportSize(): ViewportSize {
  const [viewport, setViewport] = useState<ViewportSize>({ width: 1280, height: 720 });

  useEffect(() => {
    function updateViewport() {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    }

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  return viewport;
}

export default function CareerWorkspace({ initialSection = "hero" }: { initialSection?: CareerWorkspaceSectionId }) {
  const reduceMotion = useReducedMotion();
  const viewport = useViewportSize();
  const [activeSection, setActiveSection] = useState<CareerWorkspaceSectionId>(initialSection);
  const [progress, setProgress] = useState<CareerWorkspaceProgress>(defaultCareerWorkspaceProgress);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [roadmapNotification, setRoadmapNotification] = useState("");
  const [selectedStageId, setSelectedStageId] = useState(career.journeyStages[0]?.id ?? "");
  const [guidedMode, setGuidedMode] = useState(false);
  const [roadmapMenuOpen, setRoadmapMenuOpen] = useState(false);
  const [guidedIndex, setGuidedIndex] = useState(0);
  const [cameraPhase, setCameraPhase] = useState<CameraPhase>("overview");
  const [learningMode, setLearningMode] = useState(false);
  const [stationModalStageId, setStationModalStageId] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<NoteModalState | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteFilter, setNoteFilter] = useState<CareerNote["contextType"] | "all">("all");
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [jobFilters, setJobFilters] = useState<Record<string, string>>({
    Location: "",
    Remote: "Any",
    Level: "Any",
    Salary: "",
    Company: "",
  });

  const stats = useMemo(() => getCareerWorkspaceStats(career, progress), [progress]);
  const resources = useMemo(uniqueResources, []);
  const assessments = useMemo(allAssessments, []);
  const dataWarnings = useMemo(validateJourneyData, []);
  const previousGuidedIndexRef = React.useRef(guidedIndex);
  const wasGuidedRef = React.useRef(guidedMode);
  const selectedStage = useMemo(
    () => career.journeyStages.find((stage) => stage.id === selectedStageId) ?? career.journeyStages[0],
    [selectedStageId]
  );
  const focusedStage = guidedMode ? career.journeyStages[guidedIndex] : selectedStage;
  const modalStage = stationModalStageId
    ? career.journeyStages.find((stage) => stage.id === stationModalStageId) ?? null
    : null;

  useEffect(() => {
    setProgress(loadCareerWorkspaceProgress(career.slug));
    setIsLoaded(true);

    const params = new URLSearchParams(window.location.search);
    const requestedSection = params.get("section");
    const validSection = CAREER_NAV_ITEMS.find((item) => item.id === requestedSection)?.id;
    if (validSection) setActiveSection(validSection);
    const requestedStep = params.get("step");
    if (requestedStep && career.journeyStages.some((stage) => stage.id === requestedStep)) setSelectedStageId(requestedStep);
  }, [initialSection]);

  useEffect(() => {
    if (isLoaded) saveCareerWorkspaceProgress(career.slug, progress);
  }, [isLoaded, progress]);

  useEffect(() => {
    if (!guidedMode) {
      setCameraPhase("overview");
      wasGuidedRef.current = false;
      return;
    }

    if (reduceMotion) {
      setCameraPhase("focus");
      return;
    }

    const enteringGuidedMode = !wasGuidedRef.current;
    const changedStation = previousGuidedIndexRef.current !== guidedIndex;
    previousGuidedIndexRef.current = guidedIndex;
    wasGuidedRef.current = true;

    if (enteringGuidedMode && !changedStation) {
      setCameraPhase("travel");
      const focusTimer = window.setTimeout(() => setCameraPhase("focus"), 100);
      return () => {
        window.clearTimeout(focusTimer);
      };
    }

    setCameraPhase("travel");
    const focusTimer = window.setTimeout(() => setCameraPhase("focus"), 120);
    return () => {
      window.clearTimeout(focusTimer);
    };
  }, [guidedMode, guidedIndex, reduceMotion]);

  function updateProgress(updater: (previous: CareerWorkspaceProgress) => CareerWorkspaceProgress) {
    setProgress((previous) => ({ ...updater(previous), startedAt: previous.startedAt ?? new Date().toISOString() }));
  }

  function switchSection(section: CareerWorkspaceSectionId) {
    setActiveSection(section);
    window.history.pushState({}, "", careerSectionHref(career.slug, section, section === "learning" ? progress.lastActiveStageId : undefined));
    if (section === "roadmap" && !selectedStageId) setSelectedStageId(career.journeyStages[0].id);
    if (section !== "roadmap") {
      setGuidedMode(false);
      wasGuidedRef.current = false;
    }
  }

  function startLearning() {
    const lastActive = career.journeyStages.find((stage) => stage.id === progress.lastActiveStageId && isJourneyStageUnlocked(stage.id, career, progress) && !progress.assessmentResults[stage.test.id]?.passed);
    const firstUnlockedIncomplete = lastActive ??
      career.journeyStages.find((stage) => {
        const unlocked = isJourneyStageUnlocked(stage.id, career, progress);
        const passed = progress.assessmentResults[stage.test.id]?.passed;
        return unlocked && !passed;
      }) ?? career.journeyStages[0];

    setSelectedStageId(firstUnlockedIncomplete.id);
    setLearningMode(false);
    setStationModalStageId(null);
    updateProgress((previous) => ({ ...previous, lastActiveStageId: firstUnlockedIncomplete.id }));
    setActiveSection("learning");
    window.history.pushState({}, "", careerSectionHref(career.slug, "learning", firstUnlockedIncomplete.id));
  }

  function startGuidedJourney() {
    setActiveSection("roadmap");
    setGuidedMode(true);
    setLearningMode(false);
    setGuidedIndex(0);
    setSelectedStageId(career.journeyStages[0].id);
  }

  function selectStage(stage: CareerJourneyStage) {
    setSelectedStageId(stage.id);
    setStationModalStageId(stage.id);
  }

  function notifyLockedStage() {
    setRoadmapNotification("You can’t start this step yet. Please complete the previous stations first.");
    window.setTimeout(() => setRoadmapNotification(""), 4000);
  }

  function closeStationDetails() {
    const stageId = stationModalStageId;
    setStationModalStageId(null);
    if (stageId) window.requestAnimationFrame(() => document.getElementById(`journey-station-${stageId}`)?.focus());
  }

  function openNote(contextType: CareerNote["contextType"], contextId: string, contextLabel: string) {
    const existing = progress.notes.find((note) => note.contextType === contextType && note.contextId === contextId);
    setNoteDraft(existing?.body ?? "");
    setNoteModal({ contextType, contextId, contextLabel, noteId: existing?.id });
  }

  function upsertNote(body: string) {
    if (!noteModal) return;
    const trimmed = body.trim();
    if (!trimmed) return;

    const noteId = noteModal.noteId ?? `note-${Date.now()}`;
    const note: CareerNote = {
      id: noteId,
      contextType: noteModal.contextType,
      contextId: noteModal.contextId,
      contextLabel: noteModal.contextLabel,
      body,
      updatedAt: new Date().toISOString(),
    };

    updateProgress((previous) => ({
      ...previous,
      notes: [note, ...previous.notes.filter((item) => item.id !== noteId)],
    }));
    if (!noteModal.noteId) setNoteModal({ ...noteModal, noteId });
  }

  function deleteNote(id: string) {
    updateProgress((previous) => ({ ...previous, notes: previous.notes.filter((note) => note.id !== id) }));
    setNoteModal(null);
    setNoteDraft("");
  }

  function handleNoteChange(value: string) {
    setNoteDraft(value);
    if (value.trim()) upsertNote(value);
  }

  function openAssessment(assessment: CareerAssessment, stageId?: string) {
    const answerOrders = Object.fromEntries(
      assessment.questions.map((question) => [question.id, shuffleIndexes(question.answers.length)])
    );

    setExamSession({
      assessment,
      stageId,
      questionOrder: shuffleIndexes(assessment.questions.length),
      answerOrders,
      currentIndex: 0,
      selectedAnswers: {},
      submitted: false,
    });
  }

  function submitAssessment() {
    if (!examSession) return;
    const correctCount = examSession.assessment.questions.filter((question) => examSession.selectedAnswers[question.id] === question.correctAnswerIndex).length;
    const score = Math.round((correctCount / examSession.assessment.questions.length) * 100);
    const reviewTopics = examSession.assessment.questions
      .filter((question) => examSession.selectedAnswers[question.id] !== question.correctAnswerIndex)
      .map((question) => question.relatedTopic);
    const result: CareerAssessmentResult = {
      assessmentId: examSession.assessment.id,
      score,
      passed: score >= examSession.assessment.passingScore,
      submittedAt: new Date().toISOString(),
      reviewTopics: Array.from(new Set(reviewTopics)),
      attemptId: `attempt-${Date.now()}`,
      answers: examSession.selectedAnswers,
      attemptNumber: progress.assessmentAttempts.filter((attempt) => attempt.assessmentId === examSession.assessment.id).length + 1,
      bestScore: Math.max(score, progress.assessmentResults[examSession.assessment.id]?.bestScore ?? 0),
      completedAt: new Date().toISOString(),
    };

    updateProgress((previous) => ({
      ...previous,
      assessmentResults: {
        ...previous.assessmentResults,
        [examSession.assessment.id]: result,
      },
      assessmentAttempts: [...previous.assessmentAttempts, result],
    }));
    setExamSession({ ...examSession, submitted: true, result });
  }

  function copyShareLink() {
    const url = typeof window !== "undefined" ? window.location.href : "/career-dashboard";
    if (navigator.share) {
      navigator.share({ title: career.title, text: career.shortDescription, url }).catch(() => undefined);
      return;
    }
    navigator.clipboard?.writeText(url);
    setActionMessage("Career link copied.");
  }

  function exportNotesAsPdf() {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      setActionMessage("Allow popups to export notes.");
      return;
    }
    const body = progress.notes
      .map((note) => `<article><strong>${note.contextType} / ${note.contextLabel}</strong><p>${note.body.replace(/\n/g, "<br />")}</p><small>${new Date(note.updatedAt).toLocaleString()}</small></article>`)
      .join("");
    printWindow.document.write(`<html><head><title>${career.title} Notes</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111827;line-height:1.5}article{border-top:1px solid #e5e7eb;padding:16px 0}strong{color:#4f46e5;text-transform:uppercase;font-size:12px;letter-spacing:.08em}</style></head><body><h1>${career.title} Notes</h1>${body || "<p>No notes yet.</p>"}<script>window.print()</script></body></html>`);
    printWindow.document.close();
  }

  const isRoadmapMode = activeSection === "roadmap";

  return (
    <div className="neural-bg h-screen overflow-hidden text-slate-200">
      <div className="flex h-full">
        <DesktopMenu activeSection={activeSection} isRoadmapMode={isRoadmapMode} open={roadmapMenuOpen} setOpen={setRoadmapMenuOpen} stats={stats} switchSection={switchSection} />

        <main className="relative h-full min-w-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeSection === "hero" ? (
              <HeroScene
                key="hero"
                stats={stats}
                bookmarked={bookmarked}
                setBookmarked={setBookmarked}
                copyShareLink={copyShareLink}
                startLearning={startLearning}
                startGuidedJourney={startGuidedJourney}
                actionMessage={actionMessage}
              />
            ) : activeSection === "intelligence" ? (
              <CareerIntelligenceWorkspace key="intelligence" career={career} />
            ) : activeSection === "roadmap" ? (
              <RoadmapWorld
                key="roadmap"
                viewport={viewport}
                progress={progress}
                focusedStage={focusedStage}
                selectedStage={selectedStage}
                guidedMode={guidedMode}
                navigationOpen={roadmapMenuOpen}
                guidedIndex={guidedIndex}
                cameraPhase={cameraPhase}
                learningMode={learningMode}
                reduceMotion={Boolean(reduceMotion)}
                selectStage={selectStage}
                setGuidedMode={setGuidedMode}
                setGuidedIndex={setGuidedIndex}
                startLearning={startLearning}
                dataWarnings={dataWarnings}
              />
            ) : activeSection === "learning" ? (
              <LearningWorkspace
                key="learning"
                career={career}
                progress={progress}
                selectedStageId={selectedStageId}
                onSelectStage={(id) => { setSelectedStageId(id); updateProgress((previous) => ({ ...previous, lastActiveStageId: id })); window.history.replaceState({}, "", careerSectionHref(career.slug, "learning", id)); }}
                onOpenNote={openNote}
                onOpenAssessment={(stage, kind) => { const assessment = kind === "phase" ? stage.phaseExam : stage.test; if (assessment) openAssessment(assessment, stage.id); }}
                onViewResource={(id) => updateProgress((previous) => ({ ...previous, completedResources: previous.completedResources.includes(id) ? previous.completedResources : [...previous.completedResources, id], resourceViewedAt: { ...previous.resourceViewedAt, [id]: new Date().toISOString() } }))}
              />
            ) : (
              <ModuleScene
                key={activeSection}
                section={activeSection}
                progress={progress}
                stats={stats}
                resources={resources}
                assessments={assessments}
                noteFilter={noteFilter}
                setNoteFilter={setNoteFilter}
                openNote={openNote}
                openAssessment={openAssessment}
                updateProgress={updateProgress}
                deleteNote={deleteNote}
                exportNotesAsPdf={exportNotesAsPdf}
                jobFilters={jobFilters}
                setJobFilters={setJobFilters}
              />
            )}
          </AnimatePresence>
        </main>
      </div>

      {!isRoadmapMode ? <MobileNav activeSection={activeSection} guidedMode={guidedMode} switchSection={switchSection} /> : null}

      <NoteModal
        state={noteModal}
        draft={noteDraft}
        close={() => setNoteModal(null)}
        onChange={handleNoteChange}
        onSave={() => {
          upsertNote(noteDraft);
          setNoteModal(null);
        }}
        onDelete={noteModal?.noteId ? () => deleteNote(noteModal.noteId as string) : undefined}
      />

      <AssessmentModal
        session={examSession}
        setSession={setExamSession}
        submitAssessment={submitAssessment}
      />

      <StationDetailsModal
        stage={modalStage}
        progress={progress}
        close={closeStationDetails}
        openNote={openNote}
        openAssessment={openAssessment}
        updateProgress={updateProgress}
        notifyLockedStage={notifyLockedStage}
      />
      <AnimatePresence>
        {roadmapNotification ? <motion.div role="status" aria-live="polite" className="fixed bottom-[calc(1rem_+_env(safe-area-inset-bottom))] left-1/2 z-[90] w-[min(30rem,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-amber-200/25 bg-[#5f4029]/95 px-4 py-3 text-center text-sm font-medium text-[#fff1d1] shadow-premium backdrop-blur-md" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}}>{roadmapNotification}</motion.div> : null}
      </AnimatePresence>
    </div>
  );
}

function DesktopMenu({
  activeSection,
  isRoadmapMode,
  open,
  setOpen,
  stats,
  switchSection,
}: {
  activeSection: CareerWorkspaceSectionId;
  isRoadmapMode: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  stats: ReturnType<typeof getCareerWorkspaceStats>;
  switchSection: (section: CareerWorkspaceSectionId) => void;
}) {
  if (isRoadmapMode) return <>
    <button type="button" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)} className="fixed left-0 top-[max(1rem,env(safe-area-inset-top))] z-[60] grid h-12 w-8 place-items-center rounded-r-xl border border-l-0 border-stone-700/20 bg-[#eadfca]/90 text-stone-700 shadow-md backdrop-blur-sm">{open ? "‹" : "›"}</button>
    <div className={`fixed inset-0 z-[54] bg-stone-950/15 transition-opacity ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setOpen(false)} aria-hidden="true" />
    <aside className={`fixed inset-y-0 left-0 z-[55] flex w-[min(18rem,86vw)] flex-col justify-between border-r border-stone-700/15 bg-[#eadfca]/94 p-3 shadow-2xl backdrop-blur-md transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <button type="button" onClick={() => setOpen(false)} className="absolute right-2 top-2 grid h-11 w-11 place-items-center text-xl text-stone-700" aria-label="Close navigation">×</button>
      <WorkspaceMenuContents activeSection={activeSection} isRoadmapMode stats={stats} switchSection={(section) => { switchSection(section); setOpen(false); }} />
    </aside>
  </>;
  return (
    <aside className="z-40 hidden h-full w-64 shrink-0 flex-col justify-between border-r border-white/10 bg-slate-950/80 p-3 backdrop-blur-md lg:flex">
      <WorkspaceMenuContents activeSection={activeSection} isRoadmapMode={false} stats={stats} switchSection={switchSection} />
    </aside>
  );
}

function WorkspaceMenuContents({ activeSection, isRoadmapMode, stats, switchSection }: { activeSection: CareerWorkspaceSectionId; isRoadmapMode: boolean; stats: ReturnType<typeof getCareerWorkspaceStats>; switchSection: (section: CareerWorkspaceSectionId) => void }) {
  return <>
      <div>
        <Link href="/" className={`mb-4 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold ${isRoadmapMode ? "text-stone-700 hover:bg-white/20" : "text-white hover:bg-white/5"}`}>
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${isRoadmapMode ? "border border-stone-500/20 text-stone-700" : "bg-ai-500/20 text-ai-200"}`}>AI</span>
          Career OS
        </Link>
        <nav className="space-y-1" aria-label="Career workspace navigation">
          {CAREER_NAV_ITEMS.map(({ id: sectionId, label }) => {
            return (
              <button
                key={sectionId}
                type="button"
                onClick={() => switchSection(sectionId)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition ${isRoadmapMode ? activeSection === sectionId ? "border-stone-500/15 bg-white/30 font-semibold text-stone-800" : "border-transparent bg-transparent text-stone-600 hover:bg-white/20 hover:text-stone-800" : shellButton(activeSection === sectionId)}`}
              >
                <span>{label}</span>
                {activeSection === sectionId ? <Icon name="target" className="h-4 w-4 text-cyber-300" /> : null}
              </button>
            );
          })}
        </nav>
      </div>
      <div className={isRoadmapMode ? "hidden" : "block"}><PanelCard>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Career readiness</p>
        <p className="mt-2 text-3xl font-semibold text-white">{stats.readinessScore}%</p>
        <ProgressBar value={stats.readinessScore} />
      </PanelCard></div>
    </>;
}

function MobileNav({
  activeSection,
  guidedMode,
  switchSection,
}: {
  activeSection: CareerWorkspaceSectionId;
  guidedMode: boolean;
  switchSection: (section: CareerWorkspaceSectionId) => void;
}) {
  const isRoadmapMode = activeSection === "roadmap";
  return (
    <nav className={`fixed inset-x-0 bottom-0 z-50 px-3 py-2 pb-[calc(0.5rem_+_env(safe-area-inset-bottom))] backdrop-blur-md transition-opacity lg:hidden ${isRoadmapMode ? guidedMode ? "border-t border-stone-700/10 bg-[#eee7d5]/55 opacity-80" : "border-t border-stone-700/10 bg-[#eee7d5]/75" : "border-t border-white/10 bg-slate-950/90"}`} aria-label="Mobile career workspace navigation">
      <div className="scrollbar-hide flex gap-2 overflow-x-auto">
        {CAREER_NAV_ITEMS.map(({ id: sectionId, label }) => {
          return (
            <button
              key={sectionId}
              type="button"
              onClick={() => switchSection(sectionId)}
              className={`min-h-11 shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold transition ${isRoadmapMode ? activeSection === sectionId ? "border-stone-500/20 bg-white/35 text-stone-800" : "border-transparent text-stone-600" : shellButton(activeSection === sectionId)}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function HeroScene({
  stats,
  bookmarked,
  setBookmarked,
  copyShareLink,
  startLearning,
  startGuidedJourney,
  actionMessage,
}: {
  stats: ReturnType<typeof getCareerWorkspaceStats>;
  bookmarked: boolean;
  setBookmarked: (value: boolean) => void;
  copyShareLink: () => void;
  startLearning: () => void;
  startGuidedJourney: () => void;
  actionMessage: string;
}) {
  return (
    <motion.section
      className="relative h-full overflow-hidden px-4 py-5 pb-24 lg:px-8 lg:pb-5"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_35%,rgba(79,70,229,0.24),transparent_30%),radial-gradient(circle_at_70%_68%,rgba(6,182,212,0.12),transparent_34%)]" />
      <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-ai-300/10 bg-ai-500/5 shadow-glow-md" />
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyber-300/20 bg-slate-950/60" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(129,140,248,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(129,140,248,0.05)_1px,transparent_1px)] bg-[size:56px_56px]" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center">
        <div className="max-w-4xl">
          <p className="eyebrow">{career.visual.nodeLabel}</p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold leading-none text-white md:text-7xl">{career.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">{career.shortDescription}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={startLearning} className="btn-primary gap-2">
              <Icon name="play" />
              Start Learning
            </button>
            <button type="button" onClick={startGuidedJourney} className="btn-secondary gap-2">
              <Icon name="map" />
              Start Journey
            </button>
            <button type="button" aria-label="Bookmark career" onClick={() => setBookmarked(!bookmarked)} className={`rounded-xl border p-3 ${shellButton(bookmarked)}`}>
              <Icon name="bookmark" />
            </button>
            <button type="button" aria-label="Share career" onClick={copyShareLink} className={`rounded-xl border p-3 ${shellButton(false)}`}>
              <Icon name="copy" />
            </button>
          </div>
          {actionMessage ? <p className="mt-3 text-sm text-cyber-200">{actionMessage}</p> : null}
        </div>

        <div className="mt-10 grid max-w-4xl gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Readiness", `${stats.readinessScore}%`, "Career readiness score"],
            ["Journey", `${stats.passedAssessments}/${stats.totalAssessments}`, "Assessments passed"],
            ["Projects", `${stats.completedProjects}/${stats.totalProjects}`, "Portfolio projects"],
            ["Notes", `${stats.notesCount}`, "Saved insights"],
          ].map(([label, value, detail]) => (
            <PanelCard key={label}>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
              <p className="mt-1 text-xs text-slate-400">{detail}</p>
            </PanelCard>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function RoadmapWorld({
  viewport,
  progress,
  focusedStage,
  selectedStage,
  guidedMode,
  navigationOpen,
  guidedIndex,
  cameraPhase,
  learningMode,
  reduceMotion,
  selectStage,
  setGuidedMode,
  setGuidedIndex,
  startLearning,
  dataWarnings,
}: {
  viewport: ViewportSize;
  progress: CareerWorkspaceProgress;
  focusedStage: CareerJourneyStage;
  selectedStage: CareerJourneyStage;
  guidedMode: boolean;
  navigationOpen: boolean;
  guidedIndex: number;
  cameraPhase: CameraPhase;
  learningMode: boolean;
  reduceMotion: boolean;
  selectStage: (stage: CareerJourneyStage) => void;
  setGuidedMode: (value: boolean) => void;
  setGuidedIndex: (value: number) => void;
  startLearning: () => void;
  dataWarnings: string[];
}) {
  return (
    <CareerJourneyEngine
      map={career.journeyMap}
      stages={career.journeyStages}
      progress={progress}
      viewport={viewport}
      focusedStage={focusedStage}
      selectedStage={selectedStage}
      guidedMode={guidedMode}
      navigationOpen={navigationOpen}
      guidedIndex={guidedIndex}
      cameraPhase={cameraPhase}
      learningMode={learningMode}
      reduceMotion={reduceMotion}
      dataWarnings={dataWarnings}
      isStageUnlocked={(stageId) => isJourneyStageUnlocked(stageId, career, progress)}
      getStageProgress={(stageId) => getJourneyStageProgress(stageId, career, progress)}
      onSelectStage={selectStage}
      onStartJourney={() => {
        setGuidedMode(true);
        setGuidedIndex(0);
      }}
      onStartLearning={startLearning}
      onExitJourney={() => setGuidedMode(false)}
      onGuidedIndexChange={setGuidedIndex}
    />
  );
}

function TaskRow({
  task,
  disabled,
  progress,
  updateProgress,
}: {
  task: CareerJourneyTask;
  disabled?: boolean;
  progress: CareerWorkspaceProgress;
  updateProgress: (updater: (previous: CareerWorkspaceProgress) => CareerWorkspaceProgress) => void;
}) {
  const complete = progress.completedStageTasks.includes(task.id);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => updateProgress((previous) => ({ ...previous, completedStageTasks: toggleId(previous.completedStageTasks, task.id) }))}
      className={`min-h-11 w-full rounded-xl border p-3 text-left transition ${shellButton(complete, Boolean(disabled))}`}
    >
      <span className="text-sm font-semibold">{task.title}</span>
      <span className="mt-1 block text-xs leading-5 text-slate-400">{task.description}</span>
    </button>
  );
}

function ResourceRow({
  resource,
  disabled,
  progress,
  updateProgress,
  openNote,
}: {
  resource: CareerResource;
  disabled?: boolean;
  progress: CareerWorkspaceProgress;
  updateProgress: (updater: (previous: CareerWorkspaceProgress) => CareerWorkspaceProgress) => void;
  openNote: (contextType: CareerNote["contextType"], contextId: string, contextLabel: string) => void;
}) {
  const complete = progress.completedResources.includes(resource.id);
  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.035] p-3 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h4 className="font-semibold text-white">{resource.title}</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="tag">{resource.type}</span>
            <span className={resource.cost === "Free" ? "tag tag-emerald" : "tag tag-amber"}>{resource.cost}</span>
            <span className="tag">{resource.provider}</span>
            <span className="tag">{resource.estimatedTime}</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">{resource.whyUseful}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <a
            href={disabled ? undefined : resource.url}
            target="_blank"
            rel="noreferrer"
            aria-disabled={disabled}
            className={`inline-flex min-h-11 items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold ${shellButton(false, Boolean(disabled))}`}
          >
            Open
          </a>
          <button type="button" disabled={disabled} onClick={() => updateProgress((previous) => ({ ...previous, completedResources: toggleId(previous.completedResources, resource.id) }))} className={`min-h-11 rounded-lg border px-3 py-2 text-xs ${shellButton(complete, Boolean(disabled))}`}>
            {complete ? "Done" : "Track"}
          </button>
          <button type="button" disabled={disabled} onClick={() => openNote("resource", resource.id, resource.title)} className={`min-h-11 rounded-lg border p-3 ${shellButton(false, Boolean(disabled))}`} aria-label={`Add note for ${resource.title}`}>
            <Icon name="note" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ModuleScene({
  section,
  progress,
  stats,
  resources,
  assessments,
  noteFilter,
  setNoteFilter,
  openNote,
  openAssessment,
  updateProgress,
  deleteNote,
  exportNotesAsPdf,
  jobFilters,
  setJobFilters,
}: {
  section: CareerWorkspaceSectionId;
  progress: CareerWorkspaceProgress;
  stats: ReturnType<typeof getCareerWorkspaceStats>;
  resources: CareerResource[];
  assessments: Array<{ assessment: CareerAssessment; stage: CareerJourneyStage; type: "station" | "phase" }>;
  noteFilter: CareerNote["contextType"] | "all";
  setNoteFilter: (filter: CareerNote["contextType"] | "all") => void;
  openNote: (contextType: CareerNote["contextType"], contextId: string, contextLabel: string) => void;
  openAssessment: (assessment: CareerAssessment, stageId?: string) => void;
  updateProgress: (updater: (previous: CareerWorkspaceProgress) => CareerWorkspaceProgress) => void;
  deleteNote: (id: string) => void;
  exportNotesAsPdf: () => void;
  jobFilters: Record<string, string>;
  setJobFilters: (filters: Record<string, string>) => void;
}) {
  const current = career.mapSections.find((item) => item.id === section);
  return (
    <motion.section className="relative h-full overflow-hidden p-4 pb-24 lg:p-6 lg:pb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(79,70,229,0.16),transparent_36%),radial-gradient(circle_at_80%_70%,rgba(6,182,212,0.1),transparent_32%)]" />
      <div className="relative z-10 flex h-full flex-col gap-4">
        <PanelCard>
          <p className="label-sm text-cyber-300">{current?.eyebrow ?? "Workspace"}</p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mt-2 font-display text-3xl font-semibold text-white">{current?.label ?? section}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{current?.summary}</p>
            </div>
            <div className="w-full md:w-64">
              <ProgressBar value={stats.readinessScore} label="Readiness" />
            </div>
          </div>
        </PanelCard>
        <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-xl">
          {section === "project" ? <ProjectsModule progress={progress} updateProgress={updateProgress} openNote={openNote} /> : null}
          {section === "portfolio" ? <TaskModule title="Portfolio proof" tasks={career.portfolioTasks} progress={progress} updateProgress={updateProgress} /> : null}
          {section === "jobs" ? <JobsModule jobFilters={jobFilters} setJobFilters={setJobFilters} /> : null}
          {section === "interview-brief" ? <InterviewModule /> : null}
        </div>
      </div>
    </motion.section>
  );
}

function ResourcesModule({
  resources,
  progress,
  updateProgress,
  openNote,
}: {
  resources: CareerResource[];
  progress: CareerWorkspaceProgress;
  updateProgress: (updater: (previous: CareerWorkspaceProgress) => CareerWorkspaceProgress) => void;
  openNote: (contextType: CareerNote["contextType"], contextId: string, contextLabel: string) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {resources.map((resource) => <ResourceRow key={resource.id} resource={resource} progress={progress} updateProgress={updateProgress} openNote={openNote} />)}
    </div>
  );
}

function NotesModule({
  progress,
  noteFilter,
  setNoteFilter,
  openNote,
  deleteNote,
  exportNotesAsPdf,
}: {
  progress: CareerWorkspaceProgress;
  noteFilter: CareerNote["contextType"] | "all";
  setNoteFilter: (filter: CareerNote["contextType"] | "all") => void;
  openNote: (contextType: CareerNote["contextType"], contextId: string, contextLabel: string) => void;
  deleteNote: (id: string) => void;
  exportNotesAsPdf: () => void;
}) {
  const filters: Array<CareerNote["contextType"] | "all"> = ["all", "career", "phase", "step", "resource", "project", "quiz", "exam"];
  const notes = noteFilter === "all" ? progress.notes : progress.notes.filter((note) => note.contextType === noteFilter);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button key={filter} type="button" onClick={() => setNoteFilter(filter)} className={`rounded-xl border px-3 py-2 text-xs font-semibold capitalize ${shellButton(noteFilter === filter)}`}>
            {filter}
          </button>
        ))}
        <button type="button" onClick={() => openNote("career", career.slug, career.title)} className="btn-primary ml-auto gap-2 py-2 text-xs">
          <Icon name="note" />
          New Career Note
        </button>
        <button type="button" onClick={exportNotesAsPdf} className="btn-secondary gap-2 py-2 text-xs">
          <Icon name="download" />
          Download PDF
        </button>
      </div>
      {notes.length === 0 ? (
        <PanelCard>No notes yet for this filter.</PanelCard>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {notes.map((note) => (
            <PanelCard key={note.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="label-sm text-ai-300">{note.contextType}</p>
                  <h3 className="mt-1 font-semibold text-white">{note.contextLabel}</h3>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => openNote(note.contextType, note.contextId, note.contextLabel)} className={`rounded-lg border px-2 py-1 text-xs ${shellButton(false)}`}>Edit</button>
                  <button type="button" onClick={() => deleteNote(note.id)} className="rounded-lg border border-rose-300/20 px-2 py-1 text-xs text-rose-200 hover:bg-rose-500/10">Delete</button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{note.body}</p>
              <p className="mt-3 text-xs text-slate-500">Auto-saved {new Date(note.updatedAt).toLocaleString()}</p>
            </PanelCard>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsModule({
  progress,
  updateProgress,
  openNote,
}: {
  progress: CareerWorkspaceProgress;
  updateProgress: (updater: (previous: CareerWorkspaceProgress) => CareerWorkspaceProgress) => void;
  openNote: (contextType: CareerNote["contextType"], contextId: string, contextLabel: string) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {career.projects.map((project) => {
        const complete = progress.completedProjects.includes(project.id);
        return (
          <PanelCard key={project.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="label-sm text-cyber-300">{project.difficulty} / {project.estimatedTime}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{project.title}</h3>
              </div>
              <button type="button" onClick={() => updateProgress((previous) => ({ ...previous, completedProjects: toggleId(previous.completedProjects, project.id) }))} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${shellButton(complete)}`}>
                {complete ? "Completed" : "Complete"}
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{project.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">{project.skills.map((skill) => <span key={skill} className="tag">{skill}</span>)}</div>
            <button type="button" onClick={() => openNote("project", project.id, project.title)} className={`mt-4 rounded-xl border px-3 py-2 text-xs font-semibold ${shellButton(false)}`}>Project Note</button>
          </PanelCard>
        );
      })}
    </div>
  );
}

function TaskModule({
  title,
  tasks,
  progress,
  updateProgress,
}: {
  title: string;
  tasks: CareerJourneyTask[];
  progress: CareerWorkspaceProgress;
  updateProgress: (updater: (previous: CareerWorkspaceProgress) => CareerWorkspaceProgress) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {tasks.map((task) => <TaskRow key={task.id} task={task} progress={progress} updateProgress={updateProgress} />)}
    </div>
  );
}

function ExamsModule({
  assessments,
  progress,
  openAssessment,
}: {
  assessments: Array<{ assessment: CareerAssessment; stage: CareerJourneyStage; type: "station" | "phase" }>;
  progress: CareerWorkspaceProgress;
  openAssessment: (assessment: CareerAssessment, stageId?: string) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {assessments.map(({ assessment, stage, type }) => {
        const result = progress.assessmentResults[assessment.id];
        const unlocked = isJourneyStageUnlocked(stage.id, career, progress);
        return (
          <PanelCard key={assessment.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="label-sm text-ai-300">{type === "phase" ? "Phase exam" : "Station test"} / {stage.title}</p>
                <h3 className="mt-2 font-semibold text-white">{assessment.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{assessment.description}</p>
              </div>
              {!unlocked ? <Icon name="lock" className="h-5 w-5 text-slate-500" /> : null}
            </div>
            {result ? <p className={`mt-3 text-sm ${result.passed ? "text-emerald-300" : "text-rose-300"}`}>Latest score: {result.score}%</p> : null}
            <button type="button" disabled={!unlocked} onClick={() => openAssessment(assessment, stage.id)} className={`mt-4 min-h-11 rounded-xl border px-3 py-2 text-xs font-semibold ${shellButton(false, !unlocked)}`}>
              {result?.passed ? "Retake" : "Start"}
            </button>
          </PanelCard>
        );
      })}
    </div>
  );
}

function ReadinessModule({
  stats,
  progress,
  updateProgress,
}: {
  stats: ReturnType<typeof getCareerWorkspaceStats>;
  progress: CareerWorkspaceProgress;
  updateProgress: (updater: (previous: CareerWorkspaceProgress) => CareerWorkspaceProgress) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <PanelCard>
        <p className="label-sm text-cyber-300">Readiness score</p>
        <p className="mt-4 text-6xl font-semibold text-white">{stats.readinessScore}%</p>
        <ProgressBar value={stats.readinessScore} />
        <p className="mt-4 text-sm leading-6 text-slate-400">{stats.readinessScore >= career.progressRules.readinessThreshold ? "Ready for targeted applications." : "Keep closing gaps before applying broadly."}</p>
      </PanelCard>
      <div className="space-y-3">
        {career.readiness.map((item) => {
          const complete = progress.completedReadinessItems.includes(item.id);
          return (
            <button key={item.id} type="button" onClick={() => updateProgress((previous) => ({ ...previous, completedReadinessItems: toggleId(previous.completedReadinessItems, item.id) }))} className={`w-full rounded-2xl border p-4 text-left ${shellButton(complete)}`}>
              <span className="font-semibold text-white">{item.label}</span>
              <span className="mt-1 block text-sm leading-6 text-slate-400">{item.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function JobsModule({
  jobFilters,
  setJobFilters,
}: {
  jobFilters: Record<string, string>;
  setJobFilters: (filters: Record<string, string>) => void;
}) {
  return (
    <div className="space-y-4">
      <PanelCard>
        <p className="label-sm text-cyber-300">{career.jobBoard.integrationStatus.replace("-", " ")}</p>
        <h3 className="mt-2 text-xl font-semibold text-white">{career.jobBoard.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{career.jobBoard.description}</p>
        <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-500/10 p-3 text-sm text-amber-100">{career.jobBoard.sampleDisclaimer}</p>
      </PanelCard>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {career.jobBoard.filters.map((filter) => (
          <label key={filter} className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-300">
            <span className="text-xs text-slate-500">{filter}</span>
            <input
              value={jobFilters[filter] ?? ""}
              onChange={(event) => setJobFilters({ ...jobFilters, [filter]: event.target.value })}
              placeholder={filter === "Remote" || filter === "Level" ? "Any" : filter}
              className="input-field mt-2 py-2"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function InterviewModule() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PanelCard>
        <h3 className="text-lg font-semibold text-white">{career.interviewPrep.title}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {career.interviewPrep.practiceAreas.map((area) => <span key={area} className="tag">{area}</span>)}
        </div>
      </PanelCard>
      <PanelCard>
        <h3 className="text-lg font-semibold text-white">Practice prompts</h3>
        <div className="mt-3 space-y-2 text-sm text-slate-300">
          {career.interviewPrep.questions.map((question) => <p key={question} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">{question}</p>)}
        </div>
      </PanelCard>
    </div>
  );
}

function StationDetailsModal({
  stage,
  progress,
  close,
  openNote,
  openAssessment,
  updateProgress,
  notifyLockedStage,
}: {
  stage: CareerJourneyStage | null;
  progress: CareerWorkspaceProgress;
  close: () => void;
  openNote: (contextType: CareerNote["contextType"], contextId: string, contextLabel: string) => void;
  openAssessment: (assessment: CareerAssessment, stageId?: string) => void;
  updateProgress: (updater: (previous: CareerWorkspaceProgress) => CareerWorkspaceProgress) => void;
  notifyLockedStage: () => void;
}) {
  useEffect(() => {
    if (!stage) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, stage]);

  if (!stage) return null;

  const unlocked = isJourneyStageUnlocked(stage.id, career, progress);
  const testResult = progress.assessmentResults[stage.test.id];
  const phaseResult = stage.phaseExam ? progress.assessmentResults[stage.phaseExam.id] : undefined;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[65] flex items-end justify-center bg-black/62 p-0 backdrop-blur-sm sm:p-4 md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onPointerDown={(event) => { if (event.target === event.currentTarget) close(); }}>
        <motion.div
          className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-slate-950 shadow-premium sm:rounded-3xl"
          initial={{ y: 40, scale: 0.98 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 40, scale: 0.98 }}
        >
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(251,191,36,0.14),transparent_34%)] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="label-sm text-amber-200">{unlocked ? stage.landmark : `🔒 Locked · ${stage.landmark}`}</p>
                <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">{stage.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{stage.explanation}</p>
              </div>
              <button type="button" onClick={close} className={`min-h-11 shrink-0 rounded-xl border p-3 ${shellButton(false)}`} aria-label="Close station details">
                <Icon name="x" />
              </button>
            </div>
            {!unlocked ? <p className="mt-3 rounded-xl border border-amber-300/25 bg-amber-500/10 p-3 text-sm text-amber-100">Complete the previous stations to unlock this step. Starting activities is disabled, but you can review the station plan and requirements.</p> : null}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <ProgressBar value={getJourneyStageProgress(stage.id, career, progress)} label="Station progress" />
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-300">Duration: {stage.duration}</div>
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-300">Passing score: {stage.test.passingScore}%</div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-[calc(1.5rem_+_env(safe-area-inset-bottom))] sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <PanelCard>
                  <h3 className="text-lg font-semibold text-white">Overview</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{stage.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {stage.lessons.map((lesson) => <span key={lesson} className="tag">{lesson}</span>)}
                  </div>
                </PanelCard>
                <PanelCard>
                  <h3 className="text-lg font-semibold text-white">Tasks and missions</h3>
                  <div className="mt-3 space-y-2">
                    {stage.tasks.map((task) => <TaskRow key={task.id} task={task} disabled={!unlocked} progress={progress} updateProgress={updateProgress} />)}
                  </div>
                </PanelCard>
                <PanelCard>
                  <h3 className="text-lg font-semibold text-white">Assessment</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{stage.test.description}</p>
                  {testResult ? <p className={`mt-2 text-sm ${testResult.passed ? "text-emerald-300" : "text-rose-300"}`}>Latest station score: {testResult.score}%</p> : null}
                  {testResult && !testResult.passed && testResult.reviewTopics.length > 0 ? <p className="mt-2 text-sm text-amber-200">Review: {testResult.reviewTopics.join(", ")}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" aria-disabled={!unlocked} onClick={() => unlocked ? openAssessment(stage.test, stage.id) : notifyLockedStage()} className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold ${shellButton(false, !unlocked)}`}>
                      Take Test
                    </button>
                    <button type="button" onClick={() => openNote("step", stage.id, stage.title)} className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold ${shellButton(false)}`}>
                      Note
                    </button>
                  </div>
                </PanelCard>
                {stage.phaseExam ? (
                  <PanelCard>
                    <h3 className="text-lg font-semibold text-white">Phase exam-style assessment</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{stage.phaseExam.description}</p>
                    {phaseResult ? <p className={`mt-2 text-sm ${phaseResult.passed ? "text-emerald-300" : "text-rose-300"}`}>Latest exam score: {phaseResult.score}%</p> : null}
                    <button type="button" aria-disabled={!unlocked} onClick={() => unlocked ? openAssessment(stage.phaseExam as CareerAssessment, stage.id) : notifyLockedStage()} className={`mt-3 min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold ${shellButton(false, !unlocked)}`}>
                      Start Phase Exam
                    </button>
                  </PanelCard>
                ) : null}
              </div>

              <PanelCard>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">Free and reputable resources</h3>
                  <span className="tag tag-amber">{stage.resources.length} links</span>
                </div>
                <div className="mt-4 space-y-3">
                  {stage.resources.length > 0 ? (
                    stage.resources.map((resource) => <ResourceRow key={resource.id} resource={resource} disabled={!unlocked} progress={progress} updateProgress={updateProgress} openNote={openNote} />)
                  ) : (
                    <p className="text-sm text-slate-400">TODO: add official free resources for this station in the career data file.</p>
                  )}
                </div>
              </PanelCard>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function NoteModal({
  state,
  draft,
  close,
  onChange,
  onSave,
  onDelete,
}: {
  state: NoteModalState | null;
  draft: string;
  close: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  onDelete?: () => void;
}) {
  return (
    <AnimatePresence>
      {state ? (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:p-3 md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-t-3xl border border-white/10 bg-slate-950 p-4 pb-[calc(1rem_+_env(safe-area-inset-bottom))] shadow-premium sm:rounded-2xl" initial={{ y: 24, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: 0.98 }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-sm text-cyber-300">{state.contextType}</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{state.contextLabel}</h2>
                <p className="mt-1 text-xs text-emerald-300">{draft.trim() ? "Auto-saved locally" : "Start typing to auto-save"}</p>
              </div>
              <button type="button" onClick={close} className={`min-h-11 min-w-11 rounded-xl border p-2 ${shellButton(false)}`} aria-label="Close note modal">
                <Icon name="x" />
              </button>
            </div>
            <textarea value={draft} onChange={(event) => onChange(event.target.value)} rows={8} className="input-field mt-4 min-h-0 flex-1 resize-none" placeholder="Write your note..." />
            <div className="mt-4 flex flex-wrap justify-between gap-3">
              {onDelete ? <button type="button" onClick={onDelete} className="min-h-11 rounded-xl border border-rose-300/20 px-4 py-2 text-sm text-rose-200 hover:bg-rose-500/10">Delete note</button> : <span />}
              <div className="flex gap-2">
                <button type="button" onClick={close} className="btn-secondary min-h-11 py-2 text-sm">Close</button>
                <button type="button" onClick={onSave} className="btn-primary min-h-11 py-2 text-sm">Save</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function AssessmentModal({
  session,
  setSession,
  submitAssessment,
}: {
  session: ExamSession | null;
  setSession: (session: ExamSession | null) => void;
  submitAssessment: () => void;
}) {
  if (!session) return null;

  const question = session.assessment.questions[session.questionOrder[session.currentIndex]];
  const answerOrder = session.answerOrders[question.id] ?? question.answers.map((_, index) => index);
  const selected = session.selectedAnswers[question.id];
  const allAnswered = session.assessment.questions.every((item) => session.selectedAnswers[item.id] !== undefined);

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:p-3 md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-slate-950 shadow-premium sm:rounded-2xl" initial={{ y: 24, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: 0.98 }}>
          <div className="border-b border-white/10 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-sm text-cyber-300">Exam-style practice questions</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{session.assessment.title}</h2>
                <p className="mt-1 text-sm text-slate-400">Question {session.currentIndex + 1} of {session.assessment.questions.length} / Passing score {session.assessment.passingScore}%</p>
              </div>
              <button type="button" onClick={() => setSession(null)} className={`min-h-11 min-w-11 rounded-xl border p-2 ${shellButton(false)}`} aria-label="Close assessment">
                <Icon name="x" />
              </button>
            </div>
            {session.assessment.durationMinutes ? (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs text-slate-300">
                <Icon name="timer" />
                Optional timer target: {session.assessment.durationMinutes} min
              </p>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-[calc(1rem_+_env(safe-area-inset-bottom))]">
            {!session.submitted ? (
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="tag">{question.difficulty}</span>
                  <span className="tag">{question.relatedTopic}</span>
                </div>
                <p className="mt-4 text-lg font-semibold leading-7 text-white">{question.question}</p>
                <div className="mt-4 grid gap-2">
                  {answerOrder.map((answerIndex) => (
                    <button
                      key={answerIndex}
                      type="button"
                      onClick={() => setSession({ ...session, selectedAnswers: { ...session.selectedAnswers, [question.id]: answerIndex } })}
                      className={`rounded-xl border px-4 py-3 text-left text-sm transition ${shellButton(selected === answerIndex)}`}
                    >
                      {question.answers[answerIndex]}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <PanelCard>
                  <p className={session.result?.passed ? "text-emerald-300" : "text-rose-300"}>
                    Score: {session.result?.score}% / {session.result?.passed ? "Passed" : "Needs review"}
                  </p>
                  {session.result?.reviewTopics.length ? (
                    <p className="mt-2 text-sm text-slate-300">Review: {session.result.reviewTopics.join(", ")}</p>
                  ) : null}
                </PanelCard>
                {session.assessment.questions.map((item) => {
                  const selectedIndex = session.selectedAnswers[item.id];
                  const correct = selectedIndex === item.correctAnswerIndex;
                  const remediation = item.referenceId ? resolveReferenceSegment(item.referenceId, item.segmentId) : null;
                  return (
                    <PanelCard key={item.id}>
                      <p className="font-semibold text-white">{item.question}</p>
                      <p className={correct ? "mt-2 text-sm text-emerald-300" : "mt-2 text-sm text-rose-300"}>
                        {correct ? "Correct" : "Review needed"}
                      </p>
                      {!correct ? <div className="mt-3 flex flex-wrap gap-2">
                        {remediation?.available ? <a className="min-h-11 rounded-xl border border-amber-300/25 px-4 py-2 text-sm font-semibold text-amber-100" href={remediation.url} target="_blank" rel="noreferrer">Review exact resource section</a> : <span className="text-xs text-amber-200">The remediation reference needs review.</span>}
                        <details className="w-full rounded-xl border border-white/10 p-3"><summary className="cursor-pointer text-sm font-semibold text-cyan-200">Explain It Here</summary><p className="mt-2 text-sm leading-6 text-slate-300">{item.explanation}</p></details>
                      </div> : null}
                    </PanelCard>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-4">
            <button type="button" disabled={session.currentIndex === 0 || session.submitted} onClick={() => setSession({ ...session, currentIndex: Math.max(0, session.currentIndex - 1) })} className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold ${shellButton(false, session.currentIndex === 0 || session.submitted)}`}>
              Previous
            </button>
            <div className="flex gap-2">
              {!session.submitted && session.currentIndex < session.assessment.questions.length - 1 ? (
                <button type="button" onClick={() => setSession({ ...session, currentIndex: session.currentIndex + 1 })} className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold ${shellButton(false)}`}>
                  Next
                </button>
              ) : null}
              {!session.submitted ? (
                <button type="button" disabled={!allAnswered} onClick={submitAssessment} className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold ${shellButton(false, !allAnswered)}`}>
                  Submit
                </button>
              ) : (
                <button type="button" onClick={() => setSession(null)} className="btn-primary min-h-11 py-2 text-sm">
                  Close
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
