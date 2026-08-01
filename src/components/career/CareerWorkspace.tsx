"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import CareerJourneyEngine from "@/components/career/journey-engine/CareerJourneyEngine";
import LearningWorkspace from "@/components/career/learning/LearningWorkspace";
import ReferenceLearningChooser from "@/components/career/resources/ReferenceLearningChooser";
import { EffortEstimate } from "@/components/career/EffortEstimate";
import { aiEngineerCareer } from "@/data/careers/ai-engineer";
import { CAREER_NAV_ITEMS, careerSectionHref } from "@/lib/careerNavigation";
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

    if ((stage.topicAssessments ?? []).length !== stage.lessons.length) {
      warnings.push(`${stage.title} does not have one assessment per topic.`);
    }
    if ((stage.topicAssessments ?? []).some((assessment) => assessment.questions.length !== 15)) {
      warnings.push(`${stage.title} has a topic assessment without 15 questions.`);
    }

    if (!stage.phaseExam || stage.phaseExam.questions.length !== 20) {
      warnings.push(`${stage.title} comprehensive assessment must have 20 questions.`);
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

type CareerWorkspaceProps = {
  initialSection?: CareerWorkspaceSectionId;
  career?: CareerWorkspaceData;
};

export default function CareerWorkspace({
  initialSection = "hero",
  career: careerData = aiEngineerCareer,
}: CareerWorkspaceProps) {
  const career = careerData;
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
    window.history×İ´ŞÚ$z{-®éÜj×·7FvRæW7F–ÖFVDVff÷'GÒ6ö×7BóàĞ¢ÆF—b6Æ74æÖSÒ'&÷VæFVB×†Â&÷&FW"&÷&FW"×v†—FRó&r×v†—FRõ³ã3UÒÓ2FW‡B×6ÒFW‡B×6ÆFRÓ3#åF÷–272Ö&³¢2öbR6÷'&V7CÂöF—càĞ¢ÂöF—càĞ¢ÂöF—càĞ Ğ¢ÆF—b6Æ74æÖSÒ&Ö–âÖ‚ÓfÆW‚Ó÷fW&fÆ÷r×’ÖWFòÓB"Õ¶6Æ2ƒãW&VÕòµöVçb‡6fRÖ&VÖ–ç6WBÖ&÷GFöÒ’•Ò6Ó§ÓR#àĞ¢ÆF—b6Æ74æÖSÒ&w&–BvÓBÆs¦w&–BÖ6öÇ2Õ³ã–g%óãg%Ò#àĞ¢ÆF—b6Æ74æÖSÒ'76R×’ÓB#àĞ¢ÅæVÄ6&CàĞ¢Æƒ26Æ74æÖSÒ'FW‡BÖÆrföçB×6VÖ–&öÆBFW‡B×v†—FR#ä÷fW'f–WsÂöƒ3àĞ¢Ç6Æ74æÖSÒ&×BÓ"FW‡B×6ÒÆVF–ærÓbFW‡B×6ÆFRÓC#ç·7FvRç7VÖÖ'—ÓÂ÷àĞ¢ÆF—b6Æ74æÖSÒ&×BÓ2fÆW‚fÆW‚×w&vÓ"#àĞ¢·7FvRæÆW76öç2æÖ‚†ÆW76öâ’ÓâÇ7â¶W“×¶ÆW76öçÒ6Æ74æÖSÒ'Fr#ç¶ÆW76öçÓÂ÷7ãâ—ĞĞ¢ÂöF—càĞ¢ÂõæVÄ6&CàĞ¢ÅæVÄ6&CàĞ¢Æƒ26Æ74æÖSÒ'FW‡BÖÆrföçB×6VÖ–&öÆBFW‡B×v†—FR#åF6·2æBÖ—76–öç3Âöƒ3àĞ¢ÆF—b6Æ74æÖSÒ&×BÓ276R×’Ó"#àĞ¢·7FvRçF6·2æÖ‚‡F6²’ÓâÅF6µ&÷r¶W“×·F6²æ–GÒF6³×·F6·ÒF—6&ÆVC×²VæÆö6¶VGÒ&öw&W73×·&öw&W77ÒWFFU&öw&W73×·WFFU&öw&W77Òóâ—ĞĞ¢ÂöF—càĞ¢ÂõæVÄ6&CàĞ¢ÅæVÄ6&CàĞ¢Æƒ26Æ74æÖSÒ'FW‡BÖÆrföçB×6VÖ–&öÆBFW‡B×v†—FR#ä6÷W'6R6†V6·3Âöƒ3àĞ¢Ç6Æ74æÖSÒ&×BÓ"FW‡B×6ÒÆVF–ærÓbFW‡B×6ÆFRÓC#ä6ö×ÆWFR6†÷'BÂg&W6‚¶æ÷vÆVFvR6†V6²gFW"V6‚6÷W'6R&Vf÷&RÖ÷f–ærFòF†R7FW6†V6·ö–çBãÂ÷àĞ¢Ç6Æ74æÖSÒ&×BÓ"FW‡B×6ÒFW‡B×6ÆFRÓ3#ç·76VEF÷–46÷VçGÒöb·F÷–476W76ÖVçG2æÆVæwF‡Ò6÷W'6R6†V6·276VCÂ÷àĞ¢ÆF—b6Æ74æÖSÒ&×BÓ276R×’Ó"#àĞ¢·F÷–476W76ÖVçG2æÖ‚†76W76ÖVçB’Óâ°Ğ¢6öç7B&W7VÇBÒ&öw&W72æ76W76ÖVçE&W7VÇG5¶76W76ÖVçBæ–EÓ°Ğ¢6öç7BVÆ–f–VBÒ—476W76ÖVçEVÆ–f–VB†76W76ÖVçBÂ&W7VÇB“°Ğ¢&WGW&â€Ğ¢ÆF—b¶W“×¶76W76ÖVçBæ–GÒ6Æ74æÖSÒ'&÷VæFVB×†Â&÷&FW"&÷&FW"×v†—FRóÓ2#àĞ¢Ç6Æ74æÖSÒ'FW‡B×6ÒföçBÖÖVF—VÒFW‡B×v†—FR#ç¶76W76ÖVçBçF÷–4Æ&VÇÓÂ÷àĞ¢·&W7VÇBòÇ6Æ74æÖS×¶×BÓFW‡B×‡2G·VÆ–f–VBò'FW‡BÖVÖW&ÆBÓ3"¢'FW‡B×&÷6RÓ3'ÖÓç·VÆ–f–VBò%VÆ–f–VB"¢$æVVG2&Wf–Wr'Ò+r·&W7VÇBç66÷&WÒSÂ÷â¢çVÆÇĞĞ¢Æ'WGFöâG—SÒ&'WGFöâ"&–ÖF—6&ÆVC×²VæÆö6¶VGÒöä6Æ–6³×²‚’ÓâVæÆö6¶VBò÷Vä76W76ÖVçB†76W76ÖVçBÂ7FvRæ–B’¢æ÷F–g”Æö6¶VE7FvR‚—Ò6Æ74æÖS×¶×BÓ"Ö–âÖ‚Ó&÷VæFVB×†Â&÷&FW"‚ÓB’Ó"FW‡B×6ÒföçB×6VÖ–&öÆBG·6†VÆÄ'WGFöâ†fÇ6RÂVæÆö6¶VB—ÖÓàĞ¢·VÆ–f–VBò%G'’æWr6†V6²"¢%7F'B6†V6²'ĞĞ¢Âö'WGFöãàĞ¢ÂöF—càĞ¢“°Ğ¢Ò—ĞĞ¢ÂöF—càĞ¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâ÷Väæ÷FR‚'7FW"Â7FvRæ–BÂ7FvRçF—FÆR—Ò6Æ74æÖS×¶×BÓ2Ö–âÖ‚Ó&÷VæFVB×†Â&÷&FW"‚ÓB’Ó"FW‡B×6ÒföçB×6VÖ–&öÆBG·6†VÆÄ'WGFöâ†fÇ6R—ÖÓäæ÷FSÂö'WGFöãàĞ¢ÂõæVÄ6&CàĞ¢·7FvRç†6TW†Òò€Ğ¢ÅæVÄ6&CàĞ¢Æƒ26Æ74æÖSÒ'FW‡BÖÆrföçB×6VÖ–&öÆBFW‡B×v†—FR#ä6ö×&V†Vç6—fR7FW76W76ÖVçCÂöƒ3àĞ¢Ç6Æ74æÖSÒ&×BÓ"FW‡B×6ÒÆVF–ærÓbFW‡B×6ÆFRÓC#ç·7FvRç†6TW†ÒæFW67&—F–öçÓÂ÷àĞ¢·†6U&W7VÇBòÇ6Æ74æÖS×¶×BÓ"FW‡B×6ÒG·†6UVÆ–f–VBò'FW‡BÖVÖW&ÆBÓ3"¢'FW‡B×&÷6RÓ3'ÖÓç·†6UVÆ–f–VBò%VÆ–f–VB"¢$æVVG2&Wf–Wr'Ò+rÆFW7BW†Ò66÷&S¢·†6U&W7VÇBç66÷&WÒSÂ÷â¢çVÆÇĞĞ¢Ç6Æ74æÖSÒ&×BÓ"FW‡B×6ÒFW‡B×6ÆFRÓC#ã#66Væ&–òVW7F–öç2+rsR&WV—&VB+r76–ærVæÆö6·2F†RæW‡B7FWãÂ÷àĞ¢²†6UVæÆö6¶VBòÇ6Æ74æÖSÒ&×BÓ"FW‡B×6ÒFW‡BÖÖ&W"Ó##å72ÆÂ·F÷–476W76ÖVçG2æÆVæwF‡Ò6÷W'6R6†V6·2FòVæÆö6²F†—276W76ÖVçBãÂ÷â¢çVÆÇĞĞ¢Æ'WGFöâG—SÒ&'WGFöâ"F—6&ÆVC×²†6UVæÆö6¶VGÒöä6Æ–6³×²‚’Óâ÷Vä76W76ÖVçB‡7FvRç†6TW†Ò26&VW$76W76ÖVçBÂ7FvRæ–B—Ò6Æ74æÖS×¶×BÓ2Ö–âÖ‚Ó&÷VæFVB×†Â&÷&FW"‚ÓB’Ó"FW‡B×6ÒföçB×6VÖ–&öÆBG·6†VÆÄ'WGFöâ†fÇ6RÂ†6UVæÆö6¶VB—ÖÓàĞ¢·†6UVÆ–f–VBò%&WF¶R6ö×&V†Vç6—fR76W76ÖVçB"¢%7F'B6ö×&V†Vç6—fR76W76ÖVçB'ĞĞ¢Âö'WGFöãàĞ¢ÂõæVÄ6&CàĞ¢’¢çVÆÇĞĞ¢ÂöF—càĞ Ğ¢ÅæVÄ6&CàĞ¢ÆF—b6Æ74æÖSÒ&fÆW‚—FV×2Ö6VçFW"§W7F–g’Ö&WGvVVâvÓ2#àĞ¢Æƒ26Æ74æÖSÒ'FW‡BÖÆrföçB×6VÖ–&öÆBFW‡B×v†—FR#äg&VRæB&WWF&ÆR&W6÷W&6W3Âöƒ3àĞ¢Ç7â6Æ74æÖSÒ'FrFrÖÖ&W"#ç·7FvRç&W6÷W&6W2æÆVæwF‡ÒÆ–æ·3Â÷7ãàĞ¢ÂöF—càĞ¢ÆF—b6Æ74æÖSÒ&×BÓB76R×’Ó2#àĞ¢·7FvRç&W6÷W&6W2æÆVæwF‚âò€Ğ¢7FvRç&W6÷W&6W2æÖ‚‡&W6÷W&6R’ÓâÅ&W6÷W&6U&÷r¶W“×·&W6÷W&6Ræ–GÒ&W6÷W&6S×·&W6÷W&6WÒF—6&ÆVC×²VæÆö6¶VGÒ&öw&W73×·&öw&W77ÒWFFU&öw&W73×·WFFU&öw&W77Ò÷Väæ÷FS×¶÷Väæ÷FWÒóâĞ¢’¢€Ğ¢Ç6Æ74æÖSÒ'FW‡B×6ÒFW‡B×6ÆFRÓC#åDôDó¢FBöff–6–Âg&VR&W6÷W&6W2f÷"F†—27FF–öâ–âF†R6&VW"FFf–ÆRãÂ÷àĞ¢—ĞĞ¢ÂöF—càĞ¢ÂõæVÄ6&CàĞ¢ÂöF—càĞ¢ÂöF—càĞ¢ÂöÖ÷F–öâæF—càĞ¢ÂöÖ÷F–öâæF—càĞ¢Âôæ–ÖFU&W6Væ6SàĞ¢“°Ğ§ĞĞ Ğ¦gVæ7F–öâæ÷FTÖöFÂ‡°Ğ¢7FFRÀĞ¢G&gBÀĞ¢6Æ÷6RÀĞ¢öä6†ævRÀĞ¢öå6fRÀĞ¢öäFVÆWFRÀĞ§Ó¢°Ğ¢7FFS¢æ÷FTÖöFÅ7FFRÂçVÆÃ°Ğ¢G&gC¢7G&–æs°Ğ¢6Æ÷6S¢‚’Óâfö–C°Ğ¢öä6†ævS¢‡fÇVS¢7G&–ær’Óâfö–C°Ğ¢öå6fS¢‚’Óâfö–C°Ğ¢öäFVÆWFSó¢‚’Óâfö–C°Ğ§Ò’°Ğ¢&WGW&â€Ğ¢Äæ–ÖFU&W6Væ6SàĞ¢·7FFRò€Ğ¢ÆÖ÷F–öâæF—b6Æ74æÖSÒ&f—†VB–ç6WBÓ¢Õ³sÒfÆW‚—FV×2ÖVæB§W7F–g’Ö6VçFW"&rÖ&Æ6²ócÓ&6¶G&÷Ö&ÇW"×6Ò6Ó§Ó2ÖC¦—FV×2Ö6VçFW""–æ—F–Ã×·²÷6—G“¢×Òæ–ÖFS×·²÷6—G“¢×ÒW†—C×·²÷6—G“¢×ÓàĞ¢ÆÖ÷F–öâæF—b6Æ74æÖSÒ&fÆW‚Ö‚Ö‚Õ³“&Gf…ÒrÖgVÆÂÖ‚×rÓ'†ÂfÆW‚Ö6öÂ&÷VæFVB×BÓ7†Â&÷&FW"&÷&FW"×v†—FRó&r×6ÆFRÓ“SÓB"Õ¶6Æ2ƒ&VÕòµöVçb‡6fRÖ&VÖ–ç6WBÖ&÷GFöÒ’•Ò6†F÷r×&VÖ—VÒ6Ó§&÷VæFVBÓ'†Â"–æ—F–Ã×·²“¢#BÂ66ÆS¢ã“‚×Òæ–ÖFS×·²“¢Â66ÆS¢×ÒW†—C×·²“¢#BÂ66ÆS¢ã“‚×ÓàĞ¢ÆF—b6Æ74æÖSÒ&fÆW‚—FV×2×7F'B§W7F–g’Ö&WGvVVâvÓB#àĞ¢ÆF—càĞ¢Ç6Æ74æÖSÒ&Æ&VÂ×6ÒFW‡BÖ7–&W"Ó3#ç·7FFRæ6öçFW‡EG—WÓÂ÷àĞ¢Æƒ"6Æ74æÖSÒ&×BÓ"FW‡B×†ÂföçB×6VÖ–&öÆBFW‡B×v†—FR#ç·7FFRæ6öçFW‡DÆ&VÇÓÂöƒ#àĞ¢Ç6Æ74æÖSÒ&×BÓFW‡B×‡2FW‡BÖVÖW&ÆBÓ3#ç¶G&gBçG&–Ò‚’ò$WFò×6fVBÆö6ÆÇ’"¢%7F'BG—–ærFòWFò×6fR'ÓÂ÷àĞ¢ÂöF—càĞ¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶6Æ÷6WÒ6Æ74æÖS×¶Ö–âÖ‚ÓÖ–â×rÓ&÷VæFVB×†Â&÷&FW"Ó"G·6†VÆÄ'WGFöâ†fÇ6R—ÖÒ&–ÖÆ&VÃÒ$6Æ÷6Ræ÷FRÖöFÂ#àĞ¢Ä–6öâæÖSÒ'‚"óàĞ¢Âö'WGFöãàĞ¢ÂöF—càĞ¢ÇFW‡F&VfÇVS×¶G&gGÒöä6†ævS×²†WfVçB’Óâöä6†ævR†WfVçBçF&vWBçfÇVR—Ò&÷w3×³‡Ò6Æ74æÖSÒ&–çWBÖf–VÆB×BÓBÖ–âÖ‚ÓfÆW‚Ó&W6—¦RÖæöæR"Æ6V†öÆFW#Ò%w&—FR–÷W"æ÷FRâââ"óàĞ¢ÆF—b6Æ74æÖSÒ&×BÓBfÆW‚fÆW‚×w&§W7F–g’Ö&WGvVVâvÓ2#àĞ¢¶öäFVÆWFRòÆ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶öäFVÆWFWÒ6Æ74æÖSÒ&Ö–âÖ‚Ó&÷VæFVB×†Â&÷&FW"&÷&FW"×&÷6RÓ3ó#‚ÓB’Ó"FW‡B×6ÒFW‡B×&÷6RÓ#†÷fW#¦&r×&÷6RÓSó#äFVÆWFRæ÷FSÂö'WGFöãâ¢Ç7âóçĞĞ¢ÆF—b6Æ74æÖSÒ&fÆW‚vÓ"#àĞ¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶6Æ÷6WÒ6Æ74æÖSÒ&'Fâ×6V6öæF'’Ö–âÖ‚Ó’Ó"FW‡B×6Ò#ä6Æ÷6SÂö'WGFöãàĞ¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶öå6fWÒ6Æ74æÖSÒ&'Fâ×&–Ö'’Ö–âÖ‚Ó’Ó"FW‡B×6Ò#å6fSÂö'WGFöãàĞ¢ÂöF—càĞ¢ÂöF—càĞ¢ÂöÖ÷F–öâæF—càĞ¢ÂöÖ÷F–öâæF—càĞ¢’¢çVÆÇĞĞ¢Âôæ–ÖFU&W6Væ6SàĞ¢“°Ğ§ĞĞ Ğ¦gVæ7F–öâ76W76ÖVçDÖöFÂ‡°Ğ¢6W76–öâÀĞ¢6WE6W76–öâÀĞ¢7V&Ö—D76W76ÖVçBÀĞ§Ó¢°Ğ¢6W76–öã¢W†Õ6W76–öâÂçVÆÃ°Ğ¢6WE6W76–öã¢‡6W76–öã¢W†Õ6W76–öâÂçVÆÂ’Óâfö–C°Ğ¢7V&Ö—D76W76ÖVçC¢‚’Óâfö–C°Ğ§Ò’°Ğ¢–b‚6W76–öâ’&WGW&âçVÆÃ°Ğ Ğ¢6öç7BVW7F–öâÒ6W76–öâæ76W76ÖVçBçVW7F–öç5·6W76–öâçVW7F–öä÷&FW%·6W76–öâæ7W'&VçD–æFW…ÕÓ°Ğ¢6öç7Bç7vW$÷&FW"Ò6W76–öâæç7vW$÷&FW'5·VW7F–öâæ–EÒóòVW7F–öâæç7vW'2æÖ‚…òÂ–æFW‚’Óâ–æFW‚“°Ğ¢6öç7B6VÆV7FVBÒ6W76–öâç6VÆV7FVDç7vW'5·VW7F–öâæ–EÓ°Ğ¢6öç7BÆÄç7vW&VBÒ6W76–öâæ76W76ÖVçBçVW7F–öç2æWfW'’‚†—FVÒ’Óâ6W76–öâç6VÆV7FVDç7vW'5¶—FVÒæ–EÒÓÒVæFVf–æVB“°Ğ Ğ¢&WGW&â€Ğ¢Äæ–ÖFU&W6Væ6SàĞ¢ÆÖ÷F–öâæF—b6Æ74æÖSÒ&f—†VB–ç6WBÓ¢Õ³ƒÒfÆW‚—FV×2ÖVæB§W7F–g’Ö6VçFW"&rÖ&Æ6²ósÓ&6¶G&÷Ö&ÇW"×6Ò6Ó§Ó2ÖC¦—FV×2Ö6VçFW""–æ—F–Ã×·²÷6—G“¢×Òæ–ÖFS×·²÷6—G“¢×ÒW†—C×·²÷6—G“¢×ÓàĞ¢ÆÖ÷F–öâæF—b6Æ74æÖSÒ&fÆW‚Ö‚Ö‚Õ³“FGf…ÒrÖgVÆÂÖ‚×rÓ7†ÂfÆW‚Ö6öÂ÷fW&fÆ÷rÖ†–FFVâ&÷VæFVB×BÓ7†Â&÷&FW"&÷&FW"×v†—FRó&r×6ÆFRÓ“S6†F÷r×&VÖ—VÒ6Ó§&÷VæFVBÓ'†Â"–æ—F–Ã×·²“¢#BÂ66ÆS¢ã“‚×Òæ–ÖFS×·²“¢Â66ÆS¢×ÒW†—C×·²“¢#BÂ66ÆS¢ã“‚×ÓàĞ¢ÆF—b6Æ74æÖSÒ&&÷&FW"Ö"&÷&FW"×v†—FRóÓB#àĞ¢ÆF—b6Æ74æÖSÒ&fÆW‚—FV×2×7F'B§W7F–g’Ö&WGvVVâvÓB#àĞ¢ÆF—càĞ¢Ç6Æ74æÖSÒ&Æ&VÂ×6ÒFW‡BÖ7–&W"Ó3#äW†Ò×7G–ÆR&7F–6RVW7F–öç3Â÷àĞ¢Æƒ"6Æ74æÖSÒ&×BÓ"FW‡B×†ÂföçB×6VÖ–&öÆBFW‡B×v†—FR#ç·6W76–öâæ76W76ÖVçBçF—FÆWÓÂöƒ#àĞ¢Ç6Æ74æÖSÒ&×BÓFW‡B×6ÒFW‡B×6ÆFRÓC#åVW7F–öâ·6W76–öâæ7W'&VçD–æFW‚²Òöb·6W76–öâæ76W76ÖVçBçVW7F–öç2æÆVæwF‡Òò76–ær66÷&R·6W76–öâæ76W76ÖVçBç76–æu66÷&WÒSÂ÷àĞ¢ÂöF—càĞ¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâ6WE6W76–öâ†çVÆÂ—Ò6Æ74æÖS×¶Ö–âÖ‚ÓÖ–â×rÓ&÷VæFVB×†Â&÷&FW"Ó"G·6†VÆÄ'WGFöâ†fÇ6R—ÖÒ&–ÖÆ&VÃÒ$6Æ÷6R76W76ÖVçB#àĞ¢Ä–6öâæÖSÒ'‚"óàĞ¢Âö'WGFöãàĞ¢ÂöF—càĞ¢·6W76–öâæ76W76ÖVçBæGW&F–öäÖ–çWFW2ò€Ğ¢Ç6Æ74æÖSÒ&×BÓ2–æÆ–æRÖfÆW‚—FV×2Ö6VçFW"vÓ"&÷VæFVBÖgVÆÂ&÷&FW"&÷&FW"×v†—FRó&r×v†—FRõ³ã3UÒ‚Ó2’ÓFW‡B×‡2FW‡B×6ÆFRÓ3#àĞ¢Ä–6öâæÖSÒ'F–ÖW""óàĞ¢÷F–öæÂF–ÖW"F&vWC¢·6W76–öâæ76W76ÖVçBæGW&F–öäÖ–çWFW7ÒÖ–àĞ¢Â÷àĞ¢’¢çVÆÇĞĞ¢ÂöF—càĞ Ğ¢ÆF—b6Æ74æÖSÒ&Ö–âÖ‚ÓfÆW‚Ó÷fW&fÆ÷r×’ÖWFòÓB"Õ¶6Æ2ƒ&VÕòµöVçb‡6fRÖ&VÖ–ç6WBÖ&÷GFöÒ’•Ò#àĞ¢²6W76–öâç7V&Ö—GFVBò€Ğ¢ÆF—càĞ¢ÆF—b6Æ74æÖSÒ&fÆW‚fÆW‚×w&vÓ"#àĞ¢Ç7â6Æ74æÖSÒ'Fr#ç·VW7F–öâæF–ff–7VÇG—ÓÂ÷7ãàĞ¢Ç7â6Æ74æÖSÒ'Fr#ç·VW7F–öâç&VÆFVEF÷–7ÓÂ÷7ãàĞ¢ÂöF—càĞ¢Ç6Æ74æÖSÒ&×BÓBFW‡BÖÆrföçB×6VÖ–&öÆBÆVF–ærÓrFW‡B×v†—FR#ç·VW7F–öâçVW7F–öçÓÂ÷àĞ¢ÆF—b6Æ74æÖSÒ&×BÓBw&–BvÓ"#àĞ¢¶ç7vW$÷&FW"æÖ‚†ç7vW$–æFW‚’Óâ€Ğ¢Æ'WGFöàĞ¢¶W“×¶ç7vW$–æFW‡ĞĞ¢G—SÒ&'WGFöâ Ğ¢öä6Æ–6³×²‚’Óâ6WE6W76–öâ‡²ââç6W76–öâÂ6VÆV7FVDç7vW'3¢²ââç6W76–öâç6VÆV7FVDç7vW'2Â·VW7F–öâæ–EÓ¢ç7vW$–æFW‚ÒÒ—ĞĞ¢6Æ74æÖS×¶&÷VæFVB×†Â&÷&FW"‚ÓB’Ó2FW‡BÖÆVgBFW‡B×6ÒG&ç6—F–öâG·6†VÆÄ'WGFöâ‡6VÆV7FVBÓÓÒç7vW$–æFW‚—ÖĞĞ¢àĞ¢·VW7F–öâæç7vW'5¶ç7vW$–æFW…×ĞĞ¢Âö'WGFöãàĞ¢’—ĞĞ¢ÂöF—càĞ¢ÂöF—càĞ¢’¢€Ğ¢ÆF—b6Æ74æÖSÒ'76R×’ÓB#àĞ¢ÅæVÄ6&CàĞ¢Ç6Æ74æÖS×¶—5VÆ–f–VE&W7VÇB‡6W76–öâç&W7VÇB’ò'FW‡BÖVÖW&ÆBÓ3"¢'FW‡B×&÷6RÓ3'ÓàĞ¢66÷&S¢·6W76–öâç&W7VÇCòç66÷&WÒRò¶—5VÆ–f–VE&W7VÇB‡6W76–öâç&W7VÇB’ò%VÆ–f–VB"¢$æVVG2&Wf–Wr'ĞĞ¢Â÷àĞ¢·6W76–öâç&W7VÇCòç&Wf–WuF÷–72æÆVæwF‚ò€Ğ¢Ç6Æ74æÖSÒ&×BÓ"FW‡B×6ÒFW‡B×6ÆFRÓ3#å&Wf–Ws¢·6W76–öâç&W7VÇBç&Wf–WuF÷–72æ¦ö–â‚"Â"—ÓÂ÷àĞ¢’¢çVÆÇĞĞ¢ÂõæVÄ6&CàĞ¢·6W76–öâæ76W76ÖVçBçVW7F–öç2æÖ‚†—FVÒ’Óâ°Ğ¢6öç7B6VÆV7FVD–æFW‚Ò6W76–öâç6VÆV7FVDç7vW'5¶—FVÒæ–EÓ°Ğ¢6öç7B6÷'&V7BÒ6VÆV7FVD–æFW‚ÓÓÒ—FVÒæ6÷'&V7Dç7vW$–æFWƒ°Ğ¢6öç7B&VÖVF–F–öâÒ—FVÒç&VfW&Væ6T–Bò&W6öÇfU&VfW&Væ6U6VvÖVçB†—FVÒç&VfW&Væ6T–BÂ—FVÒç6VvÖVçD–B’¢çVÆÃ°Ğ¢&WGW&â€Ğ¢ÅæVÄ6&B¶W“×¶—FVÒæ–GÓàĞ¢Ç6Æ74æÖSÒ&föçB×6VÖ–&öÆBFW‡B×v†—FR#ç¶—FVÒçVW7F–öçÓÂ÷àĞ¢Ç6Æ74æÖS×¶6÷'&V7Bò&×BÓ"FW‡B×6ÒFW‡BÖVÖW&ÆBÓ3"¢&×BÓ"FW‡B×6ÒFW‡B×&÷6RÓ3'ÓàĞ¢¶6÷'&V7Bò$6÷'&V7B"¢%&Wf–WræVVFVB'ĞĞ¢Â÷àĞ¢²6÷'&V7BòÆF—b6Æ74æÖSÒ&×BÓ2fÆW‚fÆW‚×w&vÓ"#àĞ¢·&VÖVF–F–öãòæf–Æ&ÆRòÆ6Æ74æÖSÒ&Ö–âÖ‚Ó&÷VæFVB×†Â&÷&FW"&÷&FW"ÖÖ&W"Ó3ó#R‚ÓB’Ó"FW‡B×6ÒföçB×6VÖ–&öÆBFW‡BÖÖ&W"Ó"‡&Vc×·&VÖVF–F–öâçW&ÇÒF&vWCÒ%ö&Ææ²"&VÃÒ&æ÷&VfW'&W"#å&Wf–WrW†7B&W6÷W&6R6V7F–öãÂöâ¢Ç7â6Æ74æÖSÒ'FW‡B×‡2FW‡BÖÖ&W"Ó##åF†R&VÖVF–F–öâ&VfW&Væ6RæVVG2&Wf–WrãÂ÷7ãçĞĞ¢ÆFWF–Ç26Æ74æÖSÒ'rÖgVÆÂ&÷VæFVB×†Â&÷&FW"&÷&FW"×v†—FRóÓ2#ãÇ7VÖÖ'’6Æ74æÖSÒ&7W'6÷"×ö–çFW"FW‡B×6ÒföçB×6VÖ–&öÆBFW‡BÖ7–âÓ##äW‡Æ–â—B†W&SÂ÷7VÖÖ'“ãÇ6Æ74æÖSÒ&×BÓ"FW‡B×6ÒÆVF–ærÓbFW‡B×6ÆFRÓ3#ç¶—FVÒæW‡ÆæF–öçÓÂ÷ãÂöFWF–Ç3àĞ¢ÂöF—câ¢çVÆÇĞĞ¢ÂõæVÄ6&CàĞ¢“°Ğ¢Ò—ĞĞ¢ÂöF—càĞ¢—ĞĞ¢ÂöF—càĞ Ğ¢ÆF—b6Æ74æÖSÒ&fÆW‚fÆW‚×w&—FV×2Ö6VçFW"§W7F–g’Ö&WGvVVâvÓ2&÷&FW"×B&÷&FW"×v†—FRóÓB#àĞ¢Æ'WGFöâG—SÒ&'WGFöâ"F—6&ÆVC×·6W76–öâæ7W'&VçD–æFW‚ÓÓÒÇÂ6W76–öâç7V&Ö—GFVGÒöä6Æ–6³×²‚’Óâ6WE6W76–öâ‡²ââç6W76–öâÂ7W'&VçD–æFWƒ¢ÖF‚æÖ‚ƒÂ6W76–öâæ7W'&VçD–æFW‚Ò’Ò—Ò6Æ74æÖS×¶Ö–âÖ‚Ó&÷VæFVB×†Â&÷&FW"‚ÓB’Ó"FW‡B×6ÒföçB×6VÖ–&öÆBG·6†VÆÄ'WGFöâ†fÇ6RÂ6W76–öâæ7W'&VçD–æFW‚ÓÓÒÇÂ6W76–öâç7V&Ö—GFVB—ÖÓàĞ¢&Wf–÷W0Ğ¢Âö'WGFöãàĞ¢ÆF—b6Æ74æÖSÒ&fÆW‚vÓ"#àĞ¢²6W76–öâç7V&Ö—GFVBbb6W76–öâæ7W'&VçD–æFW‚Â6W76–öâæ76W76ÖVçBçVW7F–öç2æÆVæwF‚Òò€Ğ¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâ6WE6W76–öâ‡²ââç6W76–öâÂ7W'&VçD–æFWƒ¢6W76–öâæ7W'&VçD–æFW‚²Ò—Ò6Æ74æÖS×¶Ö–âÖ‚Ó&÷VæFVB×†Â&÷&FW"‚ÓB’Ó"FW‡B×6ÒföçB×6VÖ–&öÆBG·6†VÆÄ'WGFöâ†fÇ6R—ÖÓàĞ¢æW‡@Ğ¢Âö'WGFöãàĞ¢’¢çVÆÇĞĞ¢²6W76–öâç7V&Ö—GFVBò€Ğ¢Æ'WGFöâG—SÒ&'WGFöâ"F—6&ÆVC×²ÆÄç7vW&VGÒöä6Æ–6³×·7V&Ö—D76W76ÖVçGÒ6Æ74æÖS×¶Ö–âÖ‚Ó&÷VæFVB×†Â&÷&FW"‚ÓB’Ó"FW‡B×6ÒföçB×6VÖ–&öÆBG·6†VÆÄ'WGFöâ†fÇ6RÂÆÄç7vW&VB—ÖÓàĞ¢7V&Ö—@Ğ¢Âö'WGFöãàĞ¢’¢€Ğ¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâ6WE6W76–öâ†çVÆÂ—Ò6Æ74æÖSÒ&'Fâ×&–Ö'’Ö–âÖ‚Ó’Ó"FW‡B×6Ò#àĞ¢6Æ÷6PĞ¢Âö'WGFöãàĞ¢—ĞĞ¢ÂöF—càĞ¢ÂöF—càĞ¢ÂöÖ÷F–öâæF—càĞ¢ÂöÖ÷F–öâæF—càĞ¢Âôæ–ÖFU&W6Væ6SàĞ¢“°Ğ§ĞĞ