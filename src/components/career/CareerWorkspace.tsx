"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import CareerJourneyEngine from "@/components/career/journey-engine/CareerJourneyEngine";
import LearningWorkspace from "@/components/career/learning/LearningWorkspace";
import CareerTitleAliasPanel from "@/components/career/CareerTitleAliasPanel";
import ReferenceLearningChooser from "@/components/career/resources/ReferenceLearningChooser";
import { EffortEstimate } from "@/components/career/EffortEstimate";
import { aiEngineerCareer } from "@/data/careers/ai-engineer";
import { CAREER_NAV_ITEMS, careerWorkspaceSectionHref } from "@/lib/careerNavigation";
import { getReviewableInterviewQuestions } from "@/lib/careerInterviewQuality";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import {
  didPassAssessment,
  isAssessmentQualified,
  isQualifiedResult,
} from "@/lib/assessmentPolicy";
import {
  resolveReference,
  resolveReferenceSegment,
} from "@/lib/references/referenceResolver";
import {
  defaultCareerWorkspaceProgress,
  getCareerWorkspaceStats,
  getJourneyStageProgress,
  isJourneyAssessmentUnlocked,
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
  CareerWorkspaceData,
  CareerWorkspaceProgress,
  CareerWorkspaceSectionId,
} from "@/types/careerWorkspace";

type IconName =
  | "arrow"
  | "bookmark"
  | "check"
  | "copy"
  | "code"
  | "download"
  | "folder"
  | "home"
  | "interview"
  | "jobs"
  | "lock"
  | "map"
  | "menu"
  | "note"
  | "play"
  | "learning"
  | "target"
  | "timer"
  | "universe"
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

const CareerDataContext = React.createContext<CareerWorkspaceData>(aiEngineerCareer);

function useCareerData(): CareerWorkspaceData {
  return React.useContext(CareerDataContext);
}

function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    bookmark: <path d="M7 4h10v16l-5-3-5 3V4z" />,
    check: <path d="M20 6 9 17l-5-5" />,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    code: <><path d="m8 9-4 3 4 3" /><path d="m16 9 4 3-4 3" /><path d="m14 5-4 14" /></>,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    folder: <path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" />,
    home: <><path d="m4 11 8-7 8 7" /><path d="M6 10v10h12V10" /><path d="M10 20v-6h4v6" /></>,
    interview: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" /><path d="M8 9h8M8 13h5" /></>,
    jobs: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" /><path d="M9 3v15" /><path d="M15 6v15" /></>,
    menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
    note: <><path d="M4 4h16v16H4z" /><path d="M8 8h8" /><path d="M8 12h8" /><path d="M8 16h5" /></>,
    play: <path d="m8 5 11 7-11 7V5z" />,
    learning: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16z" /></>,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></>,
    timer: <><circle cx="12" cy="13" r="8" /><path d="M12 9v5l3 2" /><path d="M9 2h6" /></>,
    universe: <><circle cx="12" cy="12" r="3" /><circle cx="5" cy="6" r="2" /><circle cx="19" cy="7" r="2" /><circle cx="18" cy="18" r="2" /><path d="m6.7 7.1 3 3M14.8 10.4l2.5-2.1M14.6 14.2l2 2.1" /></>,
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

const SECTION_ICONS: Record<CareerWorkspaceSectionId, IconName> = {
  hero: "home",
  roadmap: "map",
  learning: "learning",
  project: "code",
  portfolio: "folder",
  jobs: "jobs",
  "interview-brief": "interview",
  intelligence: "target",
};

function keepFocusInside(event: KeyboardEvent, container: HTMLElement | null) {
  if (event.key !== "Tab" || !container) return;
  const focusable = Array.from(container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  ));
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
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

function uniqueResources(career: CareerWorkspaceData): CareerResource[] {
  const resources = new Map<string, CareerResource>();

  career.journeyStages.forEach((stage) => {
    stage.resources.forEach((resource) => {
      resources.set(resource.id, resource);
    });
  });

  career.globalResources.forEach((resource) => {
    resources.set(resource.id, resource);
  });

  return Array.from(resources.values());
}

function allAssessments(
  career: CareerWorkspaceData
): Array<{
  assessment: CareerAssessment;
  stage: CareerJourneyStage;
  type: "topic" | "comprehensive";
}> {
  return career.journeyStages.flatMap((stage) => [
    ...(stage.topicAssessments ?? []).map((assessment) => ({
      assessment,
      stage,
      type: "topic" as const,
    })),
    ...(stage.phaseExam
      ? [
          {
            assessment: stage.phaseExam,
            stage,
            type: "comprehensive" as const,
          },
        ]
      : []),
  ]);
}

function validateJourneyData(career: CareerWorkspaceData): string[] {
  return career.journeyStages.flatMap((stage) => {
    const warnings: string[] = [];
    const topicAssessments = stage.topicAssessments ?? [];

    if (topicAssessments.length !== stage.resources.length) {
      warnings.push(
        stage.title + " must provide one topic assessment for every learning resource."
      );
    }

    topicAssessments.forEach((assessment) => {
      if ((assessment.questionsPerAttempt ?? 0) !== 5) {
        warnings.push(assessment.title + " must select 5 questions per attempt.");
      }
      if (assessment.questions.length < 5) {
        warnings.push(assessment.title + " has fewer than 5 questions.");
      }
      if (assessment.passingScore !== 60) {
        warnings.push(assessment.title + " must use a 60% passing score.");
      }
    });

    if (!stage.phaseExam) {
      warnings.push(stage.title + " is missing its comprehensive assessment.");
    } else {
      if ((stage.phaseExam.questionsPerAttempt ?? 0) !== 20) {
        warnings.push(
          stage.title + " comprehensive assessment must select 20 questions."
        );
      }
      if (stage.phaseExam.questions.length < 20) {
        warnings.push(
          stage.title + " comprehensive assessment has fewer than 20 questions."
        );
      }
      if (stage.phaseExam.passingScore !== 70) {
        warnings.push(
          stage.title + " comprehensive assessment must use a 70% passing score."
        );
      }
    }

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

function useElementViewport(elementRef: React.RefObject<HTMLElement | null>): ViewportSize {
  const [viewport, setViewport] = useState<ViewportSize>({ width: 1280, height: 720 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    function updateViewport() {
      const bounds = element!.getBoundingClientRect();
      setViewport({
        width: Math.max(320, Math.round(bounds.width)),
        height: Math.max(320, Math.round(bounds.height)),
      });
    }

    updateViewport();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateViewport);
      return () => window.removeEventListener("resize", updateViewport);
    }

    const observer = new ResizeObserver(updateViewport);
    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef]);

  return viewport;
}

type CareerWorkspaceProps = {
  initialSection?: CareerWorkspaceSectionId;
  career?: CareerWorkspaceData;
  navigationBasePath?: string;
  learningSourcesHref?: string;
  embedded?: boolean;
};

export default function CareerWorkspace({
  initialSection = "hero",
  career: careerData = aiEngineerCareer,
  navigationBasePath,
  learningSourcesHref,
  embedded = false,
}: CareerWorkspaceProps) {
  const career = careerData;
  const reduceMotion = useReducedMotion();
  const workspaceMainRef = useRef<HTMLElement>(null);
  const viewport = useElementViewport(workspaceMainRef);
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
  const getSectionHref = React.useCallback(
    (section: CareerWorkspaceSectionId, stepId?: string) => careerWorkspaceSectionHref(
      career.slug,
      section,
      stepId,
      navigationBasePath,
    ),
    [career.slug, navigationBasePath],
  );

  useEffect(() => {
    const supabase = createSupabaseClient();
    let active = true;
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("saved_careers").select("id").eq("career_slug", career.slug).maybeSingle();
      if (active) setBookmarked(Boolean(data));
    })();
    return () => { active = false; };
  }, [career.slug]);

  async function updateBookmark(value: boolean) {
    const previous = bookmarked; setBookmarked(value); const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBookmarked(previous); window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`); return; }
    const result = value
      ? await supabase.from("saved_careers").upsert({ user_id: user.id, career_slug: career.slug }, { onConflict: "user_id,career_slug" })
      : await supabase.from("saved_careers").delete().eq("user_id", user.id).eq("career_slug", career.slug);
    if (result.error) { setBookmarked(previous); setActionMessage("Bookmark update failed. Please try again."); return; }
    if (value) await supabase.from("user_activity").insert({ user_id: user.id, action: "career_saved", metadata: { career_slug: career.slug } });
    setActionMessage(value ? "Career saved to your dashboard." : "Career removed from saved careers.");
  }

  const stats = useMemo(
    () => getCareerWorkspaceStats(career, progress),
    [career, progress]
  );
  const resources = useMemo(
    () => uniqueResources(career),
    [career]
  );
  const assessments = useMemo(
    () => allAssessments(career),
    [career]
  );
  const dataWarnings = useMemo(
    () => validateJourneyData(career),
    [career]
  );
  const previousGuidedIndexRef = React.useRef(guidedIndex);
  const wasGuidedRef = React.useRef(guidedMode);
  const selectedStage = useMemo(
    () => career.journeyStages.find((stage) => stage.id === selectedStageId) ?? career.journeyStages[0],
    [career, selectedStageId]
  );
  const focusedStage = guidedMode ? career.journeyStages[guidedIndex] : selectedStage;
  const modalStage = stationModalStageId
    ? career.journeyStages.find((stage) => stage.id === stationModalStageId) ?? null
    : null;

  useEffect(() => {
    setProgress(loadCareerWorkspaceProgress(career.slug));
    setSelectedStageId(career.journeyStages[0]?.id ?? "");
    setStationModalStageId(null);
    setGuidedIndex(0);
    setIsLoaded(true);

    const params = new URLSearchParams(window.location.search);
    const requestedSection = params.get("section");
    const validSection = CAREER_NAV_ITEMS.find((item) => item.id === requestedSection)?.id;

    if (validSection) {
      setActiveSection(validSection);
    } else {
      setActiveSection(initialSection);
    }

    const requestedStep = params.get("step");

    if (
      requestedStep &&
      career.journeyStages.some((stage) => stage.id === requestedStep)
    ) {
      setSelectedStageId(requestedStep);
    }
  }, [career, initialSection]);

  useEffect(() => {
    if (isLoaded) {
      saveCareerWorkspaceProgress(career.slug, progress);
    }
  }, [career.slug, isLoaded, progress]);

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
    window.history.pushState({}, "", getSectionHref(section, section === "learning" ? progress.lastActiveStageId : undefined));
    if (section === "roadmap" && !selectedStageId) setSelectedStageId(career.journeyStages[0].id);
    if (section !== "roadmap") {
      setGuidedMode(false);
      wasGuidedRef.current = false;
    }
  }

  function startLearning() {
    const lastActive = career.journeyStages.find(
      (stage) => {
        return (
          stage.id === progress.lastActiveStageId &&
          isJourneyStageUnlocked(stage.id, career, progress) &&
          !Boolean(
            stage.phaseExam &&
              isAssessmentQualified(
                stage.phaseExam,
                progress.assessmentResults[stage.phaseExam.id]
              )
          )
        );
      }
    );
    const firstUnlockedIncomplete = lastActive ??
      career.journeyStages.find((stage) => {
        const unlocked = isJourneyStageUnlocked(stage.id, career, progress);
        const qualified = Boolean(
          stage.phaseExam &&
            isAssessmentQualified(
              stage.phaseExam,
              progress.assessmentResults[stage.phaseExam.id]
            )
        );
        return unlocked && !qualified;
      }) ?? career.journeyStages[0];

    setSelectedStageId(firstUnlockedIncomplete.id);
    setLearningMode(false);
    setStationModalStageId(null);
    updateProgress((previous) => ({ ...previous, lastActiveStageId: firstUnlockedIncomplete.id }));
    setActiveSection("learning");
    window.history.pushState({}, "", getSectionHref("learning", firstUnlockedIncomplete.id));
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
    if (stageId) {
      const stage = career.journeyStages.find((item) => item.id === stageId);
      const assessmentType =
        assessment.assessmentType === "comprehensive"
          ? "comprehensive"
          : "topic";

      if (
        !stage ||
        !isJourneyAssessmentUnlocked(
          stageId,
          assessmentType,
          career,
          progress
        )
      ) {
        setRoadmapNotification(
          assessmentType === "comprehensive"
            ? "Pass every course check in this step before starting the comprehensive assessment."
            : "You can’t start this step yet. Qualify in every previous step first."
        );
        window.setTimeout(() => setRoadmapNotification(""), 4000);
        return;
      }
    }

    const attemptQuestionCount = Math.min(
      assessment.questionsPerAttempt ?? assessment.questions.length,
      assessment.questions.length
    );
    const attemptQuestions = shuffleIndexes(assessment.questions.length)
      .slice(0, attemptQuestionCount)
      .map((index) => assessment.questions[index]);
    const attemptAssessment = {
      ...assessment,
      questions: attemptQuestions,
    };
    const answerOrders = Object.fromEntries(
      attemptQuestions.map((question) => [question.id, shuffleIndexes(question.answers.length)])
    );

    setExamSession({
      assessment: attemptAssessment,
      stageId,
      questionOrder: shuffleIndexes(attemptQuestions.length),
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
      assessmentType: examSession.assessment.assessmentType,
      score,
      passed: didPassAssessment(examSession.assessment, correctCount),
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

  return (
    <CareerDataContext.Provider value={career}>
      <div className={`neural-bg overflow-hidden text-slate-200 ${embedded ? "h-full" : "h-screen"}`}>
      <div className="flex h-full">
        <DesktopMenu activeSection={activeSection} open={roadmapMenuOpen} setOpen={setRoadmapMenuOpen} switchSection={switchSection} />

        <main ref={workspaceMainRef} className="relative h-full min-w-0 flex-1 overflow-hidden pt-[calc(3.75rem+env(safe-area-inset-top))] lg:pt-0">
          <AnimatePresence mode="wait">
            {activeSection === "hero" ? (
              <HeroScene
                key="hero"
                stats={stats}
                bookmarked={bookmarked}
                setBookmarked={(value) => { void updateBookmark(value); }}
                copyShareLink={copyShareLink}
                startLearning={startLearning}
                startGuidedJourney={startGuidedJourney}
                actionMessage={actionMessage}
              />
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
                learningSourcesHref={learningSourcesHref}
                onSelectStage={(id) => { setSelectedStageId(id); updateProgress((previous) => ({ ...previous, lastActiveStageId: id })); window.history.replaceState({}, "", getSectionHref("learning", id)); }}
                onOpenNote={openNote}
                onOpenAssessment={(assessment, stageId) => openAssessment(assessment, stageId)}
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
                getSectionHref={getSectionHref}
              />
            )}
          </AnimatePresence>
        </main>
      </div>

      <MobileNav activeSection={activeSection} switchSection={switchSection} />

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
    </CareerDataContext.Provider>
  );
}

function DesktopMenu({
  activeSection,
  open,
  setOpen,
  switchSection,
}: {
  activeSection: CareerWorkspaceSectionId;
  open: boolean;
  setOpen: (open: boolean) => void;
  switchSection: (section: CareerWorkspaceSectionId) => void;
}) {
  const career = useCareerData();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        window.requestAnimationFrame(() => triggerRef.current?.focus());
        return;
      }
      keepFocusInside(event, panelRef.current);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => panelRef.current?.querySelector<HTMLButtonElement>("button[data-workspace-destination]")?.focus());
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  function closePanel(returnFocus = false) {
    setOpen(false);
    if (returnFocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <aside className="relative z-40 hidden h-full w-[76px] shrink-0 flex-col items-center border-r border-white/10 bg-slate-950/80 px-3 py-3 backdrop-blur-md lg:flex">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(!open)}
          className={`mb-4 grid h-11 w-11 place-items-center rounded-xl border ${shellButton(open)}`}
          aria-label={open ? "Close workspace navigation" : "Open workspace navigation"}
          aria-expanded={open}
          aria-controls="desktop-workspace-navigation"
        >
          <Icon name={open ? "x" : "menu"} className="h-5 w-5" />
        </button>
        <nav className="flex w-full flex-col items-center gap-1.5" aria-label="Career workspace navigation">
          {CAREER_NAV_ITEMS.map(({ id: sectionId, label }) => {
            const active = activeSection === sectionId;
            return (
              <div key={sectionId} className="group relative">
                <button
                  type="button"
                  onClick={() => switchSection(sectionId)}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  aria-describedby={`workspace-tooltip-${sectionId}`}
                  className={`grid h-11 w-11 place-items-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${active ? "border-indigo-300/35 bg-indigo-500/18 text-indigo-100 shadow-[inset_3px_0_0_rgba(103,232,249,.7)]" : "border-transparent text-slate-500 hover:border-white/10 hover:bg-white/[0.05] hover:text-slate-200"}`}
                >
                  <Icon name={SECTION_ICONS[sectionId]} className="h-5 w-5" />
                </button>
                <span
                  id={`workspace-tooltip-${sectionId}`}
                  role="tooltip"
                  className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-[70] -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-950/95 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  {label}
                </span>
              </div>
            );
          })}
        </nav>
        <div className="group relative mt-auto">
          <Link href="/" aria-label="Back to Career Universe" aria-describedby="workspace-tooltip-universe" className="grid h-11 w-11 place-items-center rounded-xl border border-transparent text-slate-500 transition hover:border-white/10 hover:bg-white/[0.05] hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
            <Icon name="universe" className="h-5 w-5" />
          </Link>
          <span id="workspace-tooltip-universe" role="tooltip" className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-[70] -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-950/95 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">Back to Career Universe</span>
        </div>
      </aside>

      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Close workspace navigation"
        className={`fixed inset-0 z-[44] hidden bg-black/35 backdrop-blur-[2px] transition-opacity lg:block ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => closePanel(true)}
      />
      <aside
        ref={panelRef}
        id="desktop-workspace-navigation"
        aria-label="Expanded career workspace navigation"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-y-0 left-[76px] z-[45] hidden w-[min(300px,calc(100vw-76px))] border-r border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl transition-transform duration-300 lg:block ${open ? "translate-x-0" : "-translate-x-[calc(100%+76px)]"}`}
      >
        <div className="mb-6 flex items-center justify-between gap-3 px-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">{career.title}</p>
            <p className="mt-1 text-sm text-slate-400">Career Workspace</p>
          </div>
          <button type="button" onClick={() => closePanel(true)} className={`grid h-11 w-11 place-items-center rounded-xl border ${shellButton(false)}`} aria-label="Close workspace navigation">
            <Icon name="x" />
          </button>
        </div>
        <WorkspaceMenuContents activeSection={activeSection} switchSection={(section) => { switchSection(section); closePanel(true); }} />
      </aside>
    </>
  );
}

function WorkspaceMenuContents({ activeSection, switchSection }: { activeSection: CareerWorkspaceSectionId; switchSection: (section: CareerWorkspaceSectionId) => void }) {
  return <>
      <div>
        <Link href="/" className="mb-4 flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-white hover:bg-white/5" aria-label="Back to Career Universe">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ai-500/20 text-ai-200">AI</span>
          Back to Career Universe
        </Link>
        <nav className="space-y-1" aria-label="Career workspace navigation">
          {CAREER_NAV_ITEMS.map(({ id: sectionId, label }) => {
            return (
              <button
                key={sectionId}
                type="button"
                onClick={() => switchSection(sectionId)}
                aria-label={label}
                aria-current={activeSection === sectionId ? "page" : undefined}
                data-workspace-destination
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition ${shellButton(activeSection === sectionId)}`}
              >
                <span className="flex items-center gap-3"><Icon name={SECTION_ICONS[sectionId]} className="h-5 w-5 shrink-0" />{label}</span>
                {activeSection === sectionId ? <span className="h-2 w-2 rounded-full bg-cyan-300" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </nav>
      </div>
    </>;
}

function MobileNav({
  activeSection,
  switchSection,
}: {
  activeSection: CareerWorkspaceSectionId;
  switchSection: (section: CareerWorkspaceSectionId) => void;
}) {
  const career = useCareerData();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        window.requestAnimationFrame(() => triggerRef.current?.focus());
        return;
      }
      keepFocusInside(event, drawerRef.current);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => drawerRef.current?.querySelector<HTMLButtonElement>("button[data-workspace-destination]")?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function close(returnFocus = false) {
    setOpen(false);
    if (returnFocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-[calc(3.75rem+env(safe-area-inset-top))] items-end border-b border-white/10 bg-slate-950/92 px-2 pb-2 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:hidden">
        <div className="flex min-w-[88px] items-center">
          {activeSection !== "hero" ? (
          <button
            type="button"
            onClick={() => switchSection("hero")}
            className="grid h-11 w-11 place-items-center rounded-xl text-slate-300 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            aria-label={`Back to ${career.title} Workspace`}
          >
            <Icon name="arrow" className="h-5 w-5 rotate-180" />
          </button>
          ) : <span className="h-11 w-11" aria-hidden="true" />}
          <Link href="/" className="grid h-11 w-11 place-items-center rounded-xl text-slate-300 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300" aria-label="Back to Career Universe">
            <Icon name="universe" className="h-5 w-5" />
          </Link>
        </div>
        <h1 className="min-w-0 flex-1 truncate px-2 text-center font-display text-sm font-semibold text-white">
          {activeSection === "hero" ? career.title : CAREER_NAV_ITEMS.find((item) => item.id === activeSection)?.label ?? career.title}
        </h1>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-11 w-11 place-items-center rounded-xl text-slate-300 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            aria-label="Open workspace navigation"
            aria-expanded={open}
            aria-controls="mobile-workspace-navigation"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>
      </header>
      <button type="button" tabIndex={open ? 0 : -1} onClick={() => close(true)} aria-label="Close workspace navigation" className={`fixed inset-0 z-[54] bg-black/55 backdrop-blur-sm transition-opacity lg:hidden ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside
        ref={drawerRef}
        id="mobile-workspace-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Career workspace navigation"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-y-0 left-0 z-[55] flex w-[min(320px,88vw)] flex-col border-r border-white/10 bg-slate-950/98 p-4 shadow-2xl transition-transform duration-300 lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div><p className="font-semibold text-white">{career.title}</p><p className="mt-1 text-xs text-slate-500">Career Workspace</p></div>
          <button type="button" onClick={() => close(true)} className={`grid h-11 w-11 place-items-center rounded-xl border ${shellButton(false)}`} aria-label="Close workspace navigation"><Icon name="x" /></button>
        </div>
        <WorkspaceMenuContents activeSection={activeSection} switchSection={(section) => { switchSection(section); close(true); }} />
      </aside>
    </>
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
  const career = useCareerData();
  const hasProgress = stats.overallProgress > 0 || stats.notesCount > 0;
  return (
    <motion.section
      className="relative h-full overflow-hidden px-4 py-5 pb-24 lg:px-8 lg:pb-5"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_35%,rgba(79,70,229,0.24),transparent_30%),radial-gradient(circle_at_70%_68%,rgba(6,182,212,0.12),transparent_34%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(129,140,248,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(129,140,248,0.05)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div aria-hidden="true" className="absolute right-[8%] top-1/2 hidden h-80 w-80 -translate-y-1/2 lg:block">
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/30 bg-[radial-gradient(circle_at_40%_35%,#fde68a,#6366f1_48%,#11152d_75%)] shadow-[0_0_90px_rgba(99,102,241,.55)]" />
        {[[8,20],[78,12],[88,68],[14,82]].map(([left,top], index) => <React.Fragment key={index}><span className="absolute h-3 w-3 rounded-full bg-cyan-300/70 shadow-[0_0_18px_rgba(103,232,249,.8)]" style={{left:`${left}%`,top:`${top}%`}} /><span className="absolute left-1/2 top-1/2 h-px origin-left bg-gradient-to-r from-indigo-300/50 to-transparent" style={{width:"42%",transform:`rotate(${index * 86 - 145}deg)`}} /></React.Fragment>)}
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center">
        <div className="max-w-3xl">
          <p className="eyebrow">{career.visual.nodeLabel}</p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold leading-none text-white md:text-7xl">{career.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">{career.shortDescription}</p>
          <CareerTitleAliasPanel career={career} />
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={startGuidedJourney} className="btn-primary gap-2">
              <Icon name="map" />
              {hasProgress ? "Continue Journey" : "Start Journey"}
            </button>
            <button type="button" onClick={startLearning} className="btn-secondary gap-2">
              <Icon name="play" />
              Explore Learning
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

        <div className="mt-10 max-w-3xl border-t border-white/10 pt-5">
          {hasProgress ? <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <ProgressBar value={stats.overallProgress} label="Journey progress" />
            <p className="text-sm text-slate-300"><strong className="text-white">{stats.completedProjects}</strong> projects completed</p>
            <p className="text-sm text-slate-300"><strong className="text-white">{stats.notesCount}</strong> saved notes</p>
          </div> : <p className="text-sm text-slate-400">No journey progress recorded yet. Start at the first station when you are ready.</p>}
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
  const career = useCareerData();
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
  updateProgress: (
    updater: (
      previous: CareerWorkspaceProgress
    ) => CareerWorkspaceProgress
  ) => void;
  openNote: (
    contextType: CareerNote["contextType"],
    contextId: string,
    contextLabel: string
  ) => void;
}) {
  const complete = progress.completedResources.includes(resource.id);
  const registryResource = resolveReference(resource.id, true);

  const markResourceViewed = () => {
    updateProgress((previous) => ({
      ...previous,
      completedResources: previous.completedResources.includes(resource.id)
        ? previous.completedResources
        : [...previous.completedResources, resource.id],
      resourceViewedAt: {
        ...previous.resourceViewedAt,
        [resource.id]: new Date().toISOString(),
      },
    }));
  };

  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/[0.035] p-3 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <div className="min-w-0">
        <h4 className="font-semibold text-white">
          {registryResource?.title ?? resource.title}
        </h4>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className="tag">
            {registryResource?.type ?? resource.type}
          </span>
          <span
            className={
              resource.cost === "Free"
                ? "tag tag-emerald"
                : "tag tag-amber"
            }
          >
            {resource.cost}
          </span>
          <span className="tag">
            {registryResource?.provider ?? resource.provider}
          </span>
          <span className="tag">
            {registryResource?.durationLabel ?? resource.estimatedTime}
          </span>
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-400">
          {resource.whyUseful}
        </p>

        {registryResource ? (
          <ReferenceLearningChooser
            resource={registryResource}
            disabled={disabled}
            onOpen={markResourceViewed}
          />
        ) : (
          <a
            href={disabled ? undefined : resource.url}
            target="_blank"
            rel="noreferrer"
            aria-disabled={disabled}
            onClick={(event) => {
              if (disabled) {
                event.preventDefault();
                return;
              }
              markResourceViewed();
            }}
            className={`mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold ${shellButton(
              false,
              Boolean(disabled)
            )}`}
          >
            Open resource
          </a>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              updateProgress((previous) => ({
                ...previous,
                completedResources: toggleId(
                  previous.completedResources,
                  resource.id
                ),
              }))
            }
            className={`min-h-11 rounded-lg border px-3 py-2 text-xs ${shellButton(
              complete,
              Boolean(disabled)
            )}`}
          >
            {complete ? "Done" : "Track"}
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              openNote("resource", resource.id, resource.title)
            }
            className={`min-h-11 rounded-lg border p-3 ${shellButton(
              false,
              Boolean(disabled)
            )}`}
            aria-label={`Add note for ${resource.title}`}
          >
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
  getSectionHref,
}: {
  section: CareerWorkspaceSectionId;
  progress: CareerWorkspaceProgress;
  stats: ReturnType<typeof getCareerWorkspaceStats>;
  resources: CareerResource[];
  assessments: Array<{ assessment: CareerAssessment; stage: CareerJourneyStage; type: "topic" | "comprehensive" }>;
  noteFilter: CareerNote["contextType"] | "all";
  setNoteFilter: (filter: CareerNote["contextType"] | "all") => void;
  openNote: (contextType: CareerNote["contextType"], contextId: string, contextLabel: string) => void;
  openAssessment: (assessment: CareerAssessment, stageId?: string) => void;
  updateProgress: (updater: (previous: CareerWorkspaceProgress) => CareerWorkspaceProgress) => void;
  deleteNote: (id: string) => void;
  exportNotesAsPdf: () => void;
  getSectionHref: (section: CareerWorkspaceSectionId, stepId?: string) => string;
}) {
  const career = useCareerData();
  const current = career.mapSections.find((item) => item.id === section);
  return (
    <motion.section className="relative h-full overflow-hidden p-4 pb-24 lg:p-6 lg:pb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(79,70,229,0.16),transparent_36%),radial-gradient(circle_at_80%_70%,rgba(6,182,212,0.1),transparent_32%)]" />
      <div className="relative z-10 flex h-full flex-col gap-4">
        <div className="border-b border-white/10 pb-4">
          <p className="label-sm text-cyber-300">{current?.eyebrow ?? "Workspace"}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">{current?.label ?? section}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{current?.summary}</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {section === "project" ? <ProjectsModule progress={progress} updateProgress={updateProgress} openNote={openNote} /> : null}
          {section === "portfolio" ? <PortfolioModule progress={progress} updateProgress={updateProgress} getSectionHref={getSectionHref} /> : null}
          {section === "jobs" ? <JobsModule progress={progress} updateProgress={updateProgress} getSectionHref={getSectionHref} /> : null}
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
  const career = useCareerData();
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
  const career = useCareerData();
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

function PortfolioModule({
  progress,
  updateProgress,
  getSectionHref,
}: {
  progress: CareerWorkspaceProgress;
  updateProgress: (updater: (previous: CareerWorkspaceProgress) => CareerWorkspaceProgress) => void;
  getSectionHref: (section: CareerWorkspaceSectionId, stepId?: string) => string;
}) {
  const career = useCareerData();
  const completedCount = career.portfolioTasks.filter((task) => progress.completedStageTasks.includes(task.id)).length;
  const completion = Math.round((completedCount / Math.max(1, career.portfolioTasks.length)) * 100);

  return (
    <div className="space-y-5">
      <PanelCard className="bg-[radial-gradient(circle_at_15%_0%,rgba(34,211,238,.1),transparent_42%),rgba(2,6,23,.72)]">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="label-sm text-cyan-300">Evidence workspace</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-white">Turn completed work into employer-reviewable proof.</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Each portfolio artifact should connect a real problem, your decisions, the resulting evidence, and an honest account of limitations.</p>
          </div>
          <Link href={getSectionHref("project")} className="btn-secondary min-h-11 shrink-0">Review source projects</Link>
        </div>
        <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
          <span>{completedCount} of {career.portfolioTasks.length} artifacts prepared</span>
          <span>{completion}%</span>
        </div>
        <ProgressBar value={completion} />
      </PanelCard>

      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {career.portfolioTasks.map((task, index) => {
          const complete = progress.completedStageTasks.includes(task.id);
          return (
            <PanelCard key={task.id} className="flex min-h-52 flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-cyan-300/20 bg-cyan-400/[.07] text-xs font-semibold text-cyan-200">{index + 1}</span>
                <span className={complete ? "tag tag-cyan" : "tag"}>{complete ? "Evidence ready" : "Needs evidence"}</span>
              </div>
              <h4 className="mt-4 font-semibold text-white">{task.title}</h4>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{task.description}</p>
              <button
                type="button"
                onClick={() => updateProgress((previous) => ({ ...previous, completedStageTasks: toggleId(previous.completedStageTasks, task.id) }))}
                className={`mt-5 min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold ${shellButton(complete)}`}
              >
                {complete ? "Mark as in progress" : "Mark evidence ready"}
              </button>
            </PanelCard>
          );
        })}
      </div>
    </div>
  );
}

function ExamsModule({
  assessments,
  progress,
  openAssessment,
}: {
  assessments: Array<{ assessment: CareerAssessment; stage: CareerJourneyStage; type: "topic" | "comprehensive" }>;
  progress: CareerWorkspaceProgress;
  openAssessment: (assessment: CareerAssessment, stageId?: string) => void;
}) {
  const career = useCareerData();
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {assessments.map(({ assessment, stage, type }) => {
        const result = progress.assessmentResults[assessment.id];
        const unlocked = isJourneyAssessmentUnlocked(
          stage.id,
          type,
          career,
          progress
        );
        const qualified = isAssessmentQualified(assessment, result);
        return (
          <PanelCard key={assessment.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="label-sm text-ai-300">{type === "comprehensive" ? "Comprehensive assessment" : `Topic assessment · ${assessment.topicLabel}`} / {stage.title}</p>
                <h3 className="mt-2 font-semibold text-white">{assessment.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{assessment.description}</p>
              </div>
              {!unlocked ? <Icon name="lock" className="h-5 w-5 text-slate-500" /> : null}
            </div>
            {result ? <p className={`mt-3 text-sm ${qualified ? "text-emerald-300" : "text-rose-300"}`}>{qualified ? "Qualified" : "Needs review"} · Latest score: {result.score}%</p> : null}
            <button type="button" disabled={!unlocked} onClick={() => openAssessment(assessment, stage.id)} className={`mt-4 min-h-11 rounded-xl border px-3 py-2 text-xs font-semibold ${shellButton(false, !unlocked)}`}>
              {qualified ? "Retake" : "Start"}
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
  const career = useCareerData();
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
  progress,
  updateProgress,
  getSectionHref,
}: {
  progress: CareerWorkspaceProgress;
  updateProgress: (updater: (previous: CareerWorkspaceProgress) => CareerWorkspaceProgress) => void;
  getSectionHref: (section: CareerWorkspaceSectionId, stepId?: string) => string;
}) {
  const career = useCareerData();
  const hasProjectProof = progress.completedProjects.length > 0;
  const hasPortfolioProof = career.portfolioTasks.some((task) => progress.completedStageTasks.includes(task.id));
  const hasApplicationNotes = progress.notes.some((note) => note.contextType === "career" || note.contextType === "project");
  const steps = [
    {
      title: "Resume",
      purpose: "Turn project decisions and measurable outcomes into concise, role-specific evidence.",
      status: hasProjectProof ? "Proof available" : "Needs project evidence",
      href: getSectionHref("project"),
      action: hasProjectProof ? "Review project evidence" : "Build project evidence",
    },
    {
      title: "LinkedIn",
      purpose: `Use a clear ${career.title} headline, focused skills, and featured project case studies.`,
      status: hasPortfolioProof ? "Portfolio proof available" : "Needs portfolio proof",
      href: getSectionHref("portfolio"),
      action: "Prepare portfolio proof",
    },
    {
      title: "Applications",
      purpose: "Target roles that match your demonstrated scope and tailor evidence without overstating experience.",
      status: hasApplicationNotes ? "Preparation notes saved" : "Not started",
    },
    {
      title: "Positioning",
      purpose: "Explain the AI systems you can build, evaluate, deploy, and improve—not just the tools you have tried.",
      status: "Practice available",
      href: getSectionHref("interview-brief"),
      action: "Open interview brief",
    },
  ];
  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.75fr)]">
        <div>
          <p className="label-sm text-cyber-300">Job preparation</p>
          <h3 className="mt-3 max-w-xl font-display text-3xl font-semibold text-white">Prepare a credible {career.title} application.</h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">Build from evidence already captured in your journey. This workspace does not invent vacancies, salary claims, or market demand.</p>
          <div className="mt-8 rounded-2xl border border-indigo-300/15 bg-indigo-500/[0.06] p-5">
            <p className="text-sm font-semibold text-indigo-100">Recommended next step</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{hasProjectProof ? "Shape your strongest completed project into a concise case study." : "Complete one practical project before drafting application claims."}</p>
            <Link href={getSectionHref("project")} className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-indigo-300/25 px-4 py-2 text-sm font-semibold text-indigo-100 hover:bg-indigo-400/10">
              {hasProjectProof ? "Review project proof" : "Go to projects"}
            </Link>
          </div>
        </div>
        <ol className="relative space-y-0 border-l border-white/10 pl-6">
          {steps.map((step, index) => (
            <li key={step.title} className="relative pb-6 last:pb-0">
              <span aria-hidden="true" className="absolute -left-[31px] top-0 grid h-4 w-4 place-items-center rounded-full border border-indigo-300/30 bg-[#080b1c] text-[9px] text-indigo-200">{index + 1}</span>
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-semibold text-white">{step.title}</h4>
                <span className="rounded-full bg-white/[0.05] px-2 py-1 text-[10px] font-medium text-slate-400">{step.status}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">{step.purpose}</p>
              {step.href && step.action ? <Link href={step.href} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-cyan-200 hover:text-white">{step.action} <span className="ml-1" aria-hidden="true">→</span></Link> : null}
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <TaskModule
          title="Job-search execution plan"
          tasks={career.jobSearchTasks}
          progress={progress}
          updateProgress={updateProgress}
        />
      </div>
    </div>
  );
}

function InterviewModule() {
  const career = useCareerData();
  const questions = getReviewableInterviewQuestions(career.title, career.interviewPrep.questions);
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
          {questions.map((question) => <p key={question} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">{question}</p>)}
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
  const career = useCareerData();
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
  const topicAssessments = stage.topicAssessments ?? [];
  const passedTopicCount = topicAssessments.filter((assessment) =>
    isAssessmentQualified(
      assessment,
      progress.assessmentResults[assessment.id]
    )
  ).length;
  const phaseResult = stage.phaseExam ? progress.assessmentResults[stage.phaseExam.id] : undefined;
  const phaseQualified = stage.phaseExam
    ? isAssessmentQualified(stage.phaseExam, phaseResult)
    : false;
  const phaseUnlocked = isJourneyAssessmentUnlocked(
    stage.id,
    "comprehensive",
    career,
    progress
  );

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
              <EffortEstimate estimate={stage.estimatedEffort} compact />
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-300">Comprehensive passing score: {stage.phaseExam?.passingScore ?? 70}%</div>
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
                  <h3 className="text-lg font-semibold text-white">Course checks</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Complete a short, fresh knowledge check after each course before moving to the step checkpoint.</p>
                  <p className="mt-2 text-sm text-slate-300">{passedTopicCount} of {topicAssessments.length} course checks passed</p>
                  <div className="mt-3 space-y-2">
                    {topicAssessments.map((assessment) => {
                      const result = progress.assessmentResults[assessment.id];
                      const qualified = isAssessmentQualified(assessment, result);
                      return (
                        <div key={assessment.id} className="rounded-xl border border-white/10 p-3">
                          <p className="text-sm font-medium text-white">{assessment.topicLabel}</p>
                          {result ? <p className={`mt-1 text-xs ${qualified ? "text-emerald-300" : "text-rose-300"}`}>{qualified ? "Qualified" : "Needs review"} · {result.score}%</p> : null}
                          <button type="button" aria-disabled={!unlocked} onClick={() => unlocked ? openAssessment(assessment, stage.id) : notifyLockedStage()} className={`mt-2 min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold ${shellButton(false, !unlocked)}`}>
                            {qualified ? "Try a New Check" : "Start Check"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <button type="button" onClick={() => openNote("step", stage.id, stage.title)} className={`mt-3 min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold ${shellButton(false)}`}>Note</button>
                </PanelCard>
                {stage.phaseExam ? (
                  <PanelCard>
                    <h3 className="text-lg font-semibold text-white">Comprehensive step assessment</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{stage.phaseExam.description}</p>
                    {phaseResult ? <p className={`mt-2 text-sm ${phaseQualified ? "text-emerald-300" : "text-rose-300"}`}>{phaseQualified ? "Qualified" : "Needs review"} · Latest exam score: {phaseResult.score}%</p> : null}
                    <p className="mt-2 text-sm text-slate-400">20 scenario questions · 70% required · passing unlocks the next step.</p>
                    {!phaseUnlocked ? <p className="mt-2 text-sm text-amber-200">Pass all {topicAssessments.length} course checks to unlock this assessment.</p> : null}
                    <button type="button" disabled={!phaseUnlocked} onClick={() => openAssessment(stage.phaseExam as CareerAssessment, stage.id)} className={`mt-3 min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold ${shellButton(false, !phaseUnlocked)}`}>
                      {phaseQualified ? "Retake Comprehensive Assessment" : "Start Comprehensive Assessment"}
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
                  <p className={isQualifiedResult(session.result) ? "text-emerald-300" : "text-rose-300"}>
                    Score: {session.result?.score}% / {isQualifiedResult(session.result) ? "Qualified" : "Needs review"}
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
