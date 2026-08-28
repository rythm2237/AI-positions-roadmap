"use client";

import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TOUR_EVENT = "ai-career-os:start-guided-tour";
const INVITE_DELAY_MS = 3000;

type TourStep = {
  id: string;
  selector?: string;
  eyebrow: string;
  title: string;
  body: string;
  placement?: "auto" | "center";
};

type PageTour = {
  id: string;
  inviteTitle: string;
  inviteBody: string;
  steps: TourStep[];
};

const LANDING_TOUR: PageTour = {
  id: "landing-v3",
  inviteTitle: "Want a quick tour of this page?",
  inviteBody: "We’ll show you how to search, explore Careers, and use the Career Universe without leaving this page.",
  steps: [
    {
      id: "welcome",
      eyebrow: "Welcome to AI Role Path",
      title: "Discover your next AI career from here",
      body: "This page is your discovery hub. The tour stays here and shows only the controls and experiences available on the landing page.",
      placement: "center",
    },
    {
      id: "navigation",
      selector: 'header[role="banner"]',
      eyebrow: "01 · Navigate",
      title: "Search and explore without losing your place",
      body: "Use the top navigation to search Careers, browse the directory, understand how AI Role Path works, and return to this landing experience.",
    },
    {
      id: "universe",
      eyebrow: "02 · Career Universe",
      title: "Explore Careers visually",
      body: "Enter the Career Universe, open the Career list, select a role, and click its focused planet to enter that Career. The Universe moves automatically; normal mouse movement does not steer it.",
      placement: "center",
    },
  ],
};

const READY_TO_APPLY_TOUR: PageTour = {
  id: "ready-to-apply-v1",
  inviteTitle: "Tour your Ready to Apply workspace?",
  inviteBody: "This tour stays in Fast Track and shows the execution tools that take you from job-ready to hired.",
  steps: [
    {
      id: "fast-track-intro",
      selector: '[data-tour="fast-track-header"]',
      eyebrow: "Ready to Apply · 01",
      title: "This is your execution path",
      body: "Fast Track skips mandatory learning and keeps you focused on CV quality, eligible job matches, applications, and interview preparation.",
    },
    {
      id: "readiness",
      selector: '[data-tour="fast-track-readiness"]',
      eyebrow: "Ready to Apply · 02",
      title: "Check the inputs used for matching",
      body: "Confirm your target role, languages, search region, and Master CV. Missing matching filters are surfaced here before Job Agent activation.",
    },
    {
      id: "cv",
      selector: '[data-tour="fast-track-cv"]',
      eyebrow: "Ready to Apply · 03",
      title: "Strengthen the CV you will apply with",
      body: "Open CV Analyzer to check ATS readability, evidence quality, role alignment, and gaps before your profile is matched to vacancies.",
    },
    {
      id: "job-matching",
      selector: '[data-tour="fast-track-job-matching"]',
      eyebrow: "Ready to Apply · 04",
      title: "Configure precise job matching",
      body: "Job Agent uses your target roles, geography, languages, workplace model, seniority, and exclusions. Hard eligibility is applied before Fit Score.",
    },
    {
      id: "application",
      selector: '[data-tour="fast-track-application"]',
      eyebrow: "Ready to Apply · 05",
      title: "Move selected opportunities into execution",
      body: "Review eligible jobs, approve the opportunities you want, create grounded application assets, and track progress through the application pipeline.",
    },
    {
      id: "interview",
      selector: '[data-tour="fast-track-interview"]',
      eyebrow: "Ready to Apply · 06",
      title: "Prepare for the exact role",
      body: "Interview preparation remains available for your target Career without forcing you to complete the learning roadmap first.",
    },
    {
      id: "learning-option",
      selector: '[data-tour="fast-track-learning"]',
      eyebrow: "Ready to Apply · 07",
      title: "Learning remains optional and available",
      body: "If a real job exposes a skill gap, you can open the relevant Career path or switch back to Learn & Build whenever that becomes useful.",
    },
  ],
};

const CV_TOUR: PageTour = {
  id: "cv-analyzer-v1",
  inviteTitle: "Tour the CV Analyzer?",
  inviteBody: "See how to bring in your CV and turn its evidence and gaps into next actions.",
  steps: [
    { id: "overview", selector: '[data-help-title="CV Analyzer overview"]', eyebrow: "CV Analyzer · 01", title: "Understand your current profile", body: "Use this workspace to evaluate CV structure, achievements, evidence, skills, and target-role fit." },
    { id: "input", selector: '[aria-label="CV input options"]', eyebrow: "CV Analyzer · 02", title: "Choose how to provide your CV", body: "Upload a supported file or use the guided input options available on this page. The tour will not send you anywhere else." },
  ],
};

const CAREERS_TOUR: PageTour = {
  id: "career-directory-v1",
  inviteTitle: "Tour the Career Directory?",
  inviteBody: "Learn how this page helps you compare available Career directions.",
  steps: [
    { id: "directory", selector: "#careers-title", eyebrow: "Careers · 01", title: "Compare career directions", body: "The directory groups available roles so you can compare paths before opening a Career Workspace." },
    { id: "card", selector: "main article", eyebrow: "Careers · 02", title: "Open the Career that fits your goal", body: "Each Career card leads to its own workspace. This tour stays on the directory page while explaining the choice." },
  ],
};

const CAREER_WORKSPACE_TOUR: PageTour = {
  id: "career-workspace-v1",
  inviteTitle: "Tour this Career Workspace?",
  inviteBody: "See how the sections on this Career page connect your roadmap, evidence, jobs, and interview preparation.",
  steps: [
    { id: "workspace", selector: "main", eyebrow: "Career Workspace", title: "Your Career journey lives on this page", body: "Use the sections in this workspace to move between roadmap, learning, projects, portfolio evidence, jobs, and interview preparation. The tour remains inside the Career you opened." },
  ],
};

const SIMPLE_PAGE_TOURS: Record<string, PageTour> = {
  "/profile": {
    id: "profile-v1",
    inviteTitle: "Tour your Profile?",
    inviteBody: "See what information on this page drives personalization and job matching.",
    steps: [{ id: "profile", selector: "main", eyebrow: "Profile", title: "Keep your career identity and job preferences current", body: "Your target Career, languages, location and job-search preferences influence matching and recommendations. This tour stays on your Profile page." }],
  },
  "/job-agent": {
    id: "job-agent-v1",
    inviteTitle: "Tour Job Agent?",
    inviteBody: "See how this page turns your filters into eligible job matches and application actions.",
    steps: [{ id: "job-agent", selector: "main", eyebrow: "Job Agent", title: "Control the jobs that reach your pipeline", body: "Use this workspace to configure eligibility, review matches, approve opportunities, and follow application activity. This tour stays on Job Agent." }],
  },
  "/career-dashboard": {
    id: "career-dashboard-v1",
    inviteTitle: "Tour your Career Dashboard?",
    inviteBody: "See how this page summarizes your current Career progress and next actions.",
    steps: [{ id: "dashboard", selector: "main", eyebrow: "Career Dashboard", title: "Use this page as your progress overview", body: "Review your current Career state, progress signals, and next actions here. The tour does not navigate away from the dashboard." }],
  },
  "/career-intelligence": {
    id: "career-intelligence-v1",
    inviteTitle: "Tour Career Intelligence?",
    inviteBody: "See how to use the market and Career information presented on this page.",
    steps: [{ id: "intelligence", selector: "main", eyebrow: "Career Intelligence", title: "Read the market context for your decisions", body: "Use the evidence and market context on this page to compare Career decisions. This tour remains inside Career Intelligence." }],
  },
};

function getPageTour(pathname: string): PageTour | null {
  if (pathname === "/") return LANDING_TOUR;
  if (pathname === "/job-search-mode") return READY_TO_APPLY_TOUR;
  if (pathname === "/cv-analyzer") return CV_TOUR;
  if (pathname === "/careers") return CAREERS_TOUR;
  if (pathname.startsWith("/careers/")) return CAREER_WORKSPACE_TOUR;
  return SIMPLE_PAGE_TOURS[pathname] ?? null;
}

type Rect = { top: number; left: number; width: number; height: number };

function storageKey(tourId: string) {
  return `ai-rolepath-page-tour:${tourId}`;
}

function readTourStatus(tourId: string) {
  try {
    return window.localStorage.getItem(storageKey(tourId));
  } catch {
    return null;
  }
}

function writeTourStatus(tourId: string, value: "completed" | "dismissed") {
  try {
    window.localStorage.setItem(storageKey(tourId), value);
  } catch {
    // The tour remains usable for the current session if localStorage is unavailable.
  }
}

export default function FirstVisitGuidedTour() {
  const pathname = usePathname();
  const pageTour = useMemo(() => getPageTour(pathname), [pathname]);
  const steps = pageTour?.steps ?? [];
  const [inviteOpen, setInviteOpen] = useState(false);
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [targetReady, setTargetReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const targetRef = useRef<HTMLElement | null>(null);
  const activePathRef = useRef(pathname);
  const step = steps[stepIndex];
  const isMobile = viewportWidth < 640;

  const publicRoute = useMemo(
    () => !pathname.startsWith("/admin") && !pathname.startsWith("/login") && !pathname.startsWith("/auth"),
    [pathname],
  );

  useEffect(() => {
    setMounted(true);
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!active) {
      activePathRef.current = pathname;
      return;
    }
    if (pathname !== activePathRef.current) {
      setActive(false);
      setInviteOpen(false);
      setStepIndex(0);
      setTargetRect(null);
      setTargetReady(false);
      targetRef.current = null;
      activePathRef.current = pathname;
    }
  }, [active, pathname]);

  useEffect(() => {
    if (active || pathname !== "/" || !pageTour) return;
    if (readTourStatus(pageTour.id) === null) {
      const timer = window.setTimeout(() => setInviteOpen(true), INVITE_DELAY_MS);
      return () => window.clearTimeout(timer);
    }
  }, [active, pageTour, pathname]);

  const startTour = useCallback(() => {
    if (!pageTour || pageTour.steps.length === 0) return;
    activePathRef.current = pathname;
    setInviteOpen(false);
    setStepIndex(0);
    setTargetRect(null);
    setTargetReady(false);
    setActive(true);
  }, [pageTour, pathname]);

  useEffect(() => {
    const restart = () => startTour();
    window.addEventListener(TOUR_EVENT, restart);
    return () => window.removeEventListener(TOUR_EVENT, restart);
  }, [startTour]);

  const closeTour = useCallback((status: "completed" | "dismissed") => {
    if (pageTour) writeTourStatus(pageTour.id, status);
    setInviteOpen(false);
    setActive(false);
    setTargetRect(null);
    setTargetReady(false);
    targetRef.current = null;
  }, [pageTour]);

  const updateTargetRect = useCallback(() => {
    const element = targetRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const padding = 8;
    const visibleHeight = Math.max(120, window.innerHeight * 0.46);
    setTargetRect({
      top: Math.max(8, rect.top - padding),
      left: Math.max(8, rect.left - padding),
      width: Math.min(window.innerWidth - 16, rect.width + padding * 2),
      height: Math.min(window.innerHeight - 16, isMobile ? visibleHeight : rect.height + padding * 2),
    });
  }, [isMobile]);

  useEffect(() => {
    if (!active || !step) return;
    setTargetReady(false);
    targetRef.current = null;
    setTargetRect(null);

    if (!step.selector || step.placement === "center") {
      setTargetReady(true);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const findTarget = () => {
      if (cancelled) return;
      const element = document.querySelector<HTMLElement>(step.selector!);
      if (element) {
        targetRef.current = element;
        element.scrollIntoView({ behavior: "smooth", block: isMobile ? "start" : "center", inline: "nearest" });
        window.setTimeout(() => {
          if (cancelled) return;
          updateTargetRect();
          setTargetReady(true);
        }, isMobile ? 340 : 260);
        return;
      }
      attempts += 1;
      if (attempts < 24) window.setTimeout(findTarget, 120);
      else setTargetReady(true);
    };
    findTarget();
    return () => { cancelled = true; };
  }, [active, isMobile, step, updateTargetRect]);

  useEffect(() => {
    if (!active || !targetRef.current) return;
    const update = () => updateTargetRect();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, targetReady, updateTargetRect]);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTour("dismissed");
      if (event.key === "ArrowRight" && stepIndex < steps.length - 1) setStepIndex((value) => value + 1);
      if (event.key === "ArrowLeft" && stepIndex > 0) setStepIndex((value) => value - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, closeTour, stepIndex, steps.length]);

  if (!mounted || !publicRoute || !pageTour || steps.length === 0) return null;

  const progress = `${stepIndex + 1} / ${steps.length}`;
  const isCentered = step?.placement === "center" || !targetRect;
  const cardStyle: CSSProperties = isMobile
    ? { left: 12, right: 12, bottom: "max(12px, env(safe-area-inset-bottom))", width: "auto" }
    : isCentered
      ? { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
      : (() => {
          const cardWidth = Math.min(390, window.innerWidth - 32);
          const estimatedHeight = 285;
          const gap = 18;
          let left = Math.min(window.innerWidth - cardWidth - 16, Math.max(16, targetRect.left));
          let top = targetRect.top + targetRect.height + gap;
          if (top + estimatedHeight > window.innerHeight - 16) top = targetRect.top - estimatedHeight - gap;
          if (top < 16) {
            top = Math.max(16, Math.min(window.innerHeight - estimatedHeight - 16, targetRect.top));
            left = targetRect.left + targetRect.width + gap;
            if (left + cardWidth > window.innerWidth - 16) left = Math.max(16, targetRect.left - cardWidth - gap);
          }
          return { left, top };
        })();

  return (
    <>
      {!active && !inviteOpen ? (
        <button type="button" onClick={startTour} className="fixed bottom-4 left-4 z-[62] inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-[#070a18]/80 px-3.5 py-2 text-xs font-semibold text-slate-300 shadow-lg backdrop-blur-xl transition hover:border-violet-300/30 hover:bg-[#0a0d20]/95 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" aria-label={`Start ${pageTour.id} guided tour`}>
          <span className="grid h-5 w-5 place-items-center rounded-full bg-violet-500/15 text-[11px] text-violet-200" aria-hidden="true">?</span>
          Tour
        </button>
      ) : null}

      {inviteOpen && !active ? (
        <div className="fixed inset-0 z-[90] grid place-items-end bg-black/35 p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-[2px] sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="tour-invite-title">
          <div className="w-full max-w-md rounded-3xl border border-violet-300/20 bg-[#070a18] p-4 text-white shadow-[0_28px_90px_rgba(0,0,0,.55)] sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-violet-300/20 bg-violet-500/10 text-lg text-violet-200 sm:h-11 sm:w-11 sm:text-xl" aria-hidden="true">✦</div>
              <div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-violet-300">Page tour</p><h2 id="tour-invite-title" className="mt-1 font-display text-lg font-semibold sm:text-xl">{pageTour.inviteTitle}</h2><p className="mt-2 text-[13px] leading-5 text-slate-300 sm:text-sm sm:leading-6">{pageTour.inviteBody}</p></div>
            </div>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:mt-5 sm:flex-row sm:justify-end"><button type="button" onClick={() => closeTour("dismissed")} className="min-h-10 rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white sm:min-h-11">Maybe later</button><button type="button" onClick={startTour} className="min-h-10 rounded-xl bg-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(124,58,237,.3)] transition hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 sm:min-h-11">Start tour</button></div>
          </div>
        </div>
      ) : null}

      {active && step ? (
        <div className="pointer-events-auto fixed inset-0 z-[100]" aria-live="polite">
          {targetRect && step.placement !== "center" ? <div className="pointer-events-none absolute rounded-2xl border border-violet-300/70 shadow-[0_0_0_9999px_rgba(1,3,10,.72),0_0_40px_rgba(139,92,246,.4)] transition-[top,left,width,height] duration-300" style={{ top: targetRect.top, left: targetRect.left, width: targetRect.width, height: targetRect.height }} aria-hidden="true" /> : <div className="pointer-events-none absolute inset-0 bg-[#01030a]/76 backdrop-blur-[2px]" aria-hidden="true" />}
          <section role="dialog" aria-modal="true" aria-label={`Guided tour: ${step.title}`} className={`fixed z-[102] max-h-[44svh] overflow-y-auto overscroll-contain rounded-[26px] border border-white/10 bg-[#080b1c] p-4 text-white shadow-[0_25px_90px_rgba(0,0,0,.62)] transition-opacity sm:max-h-none sm:w-[min(390px,calc(100vw-32px))] sm:rounded-3xl sm:p-5 ${targetReady ? "opacity-100" : "opacity-0"}`} style={cardStyle}>
            {isMobile ? <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" aria-hidden="true" /> : null}
            <div className="flex items-center justify-between gap-3"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-violet-300">{step.eyebrow}</p><span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-slate-500">{progress}</span></div>
            <h2 className="mt-2.5 font-display text-lg font-semibold leading-tight sm:mt-3 sm:text-2xl">{step.title}</h2>
            <p className="mt-2 text-[13px] leading-5 text-slate-300 sm:text-sm sm:leading-6">{step.body}</p>
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3 sm:mt-5 sm:pt-4"><button type="button" onClick={() => closeTour("dismissed")} className="rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-400 hover:bg-white/[0.04] hover:text-slate-200">Skip</button><div className="flex items-center gap-2"><button type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((value) => Math.max(0, value - 1))} className="min-h-9 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 disabled:opacity-30">Back</button>{stepIndex === steps.length - 1 ? <button type="button" onClick={() => closeTour("completed")} className="min-h-9 rounded-xl bg-violet-500 px-4 py-2 text-xs font-bold text-white hover:bg-violet-400">Finish</button> : <button type="button" onClick={() => setStepIndex((value) => Math.min(steps.length - 1, value + 1))} className="min-h-9 rounded-xl bg-violet-500 px-4 py-2 text-xs font-bold text-white hover:bg-violet-400">Next</button>}</div></div>
          </section>
        </div>
      ) : null}
    </>
  );
}
