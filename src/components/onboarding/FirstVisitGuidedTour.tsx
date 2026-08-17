"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "ai-career-os-guided-tour-v1";
const TOUR_EVENT = "ai-career-os:start-guided-tour";

type TourStep = {
  id: string;
  route: string;
  selector?: string;
  eyebrow: string;
  title: string;
  body: string;
  placement?: "auto" | "center";
};

const STEPS: TourStep[] = [
  {
    id: "welcome",
    route: "/",
    eyebrow: "Welcome to AI Career OS",
    title: "A quick tour before you explore?",
    body: "In about a minute, we’ll show you how to discover an AI career, understand its roadmap, learn the right skills, build evidence, and prepare for opportunities.",
    placement: "center",
  },
  {
    id: "navigation",
    route: "/",
    selector: '[data-tour="primary-navigation"]',
    eyebrow: "01 · Navigate",
    title: "Everything starts from here",
    body: "Use the top navigation to browse Careers, understand how Career OS works, and return to the Universe whenever you want.",
  },
  {
    id: "universe",
    route: "/",
    selector: '[data-tour="career-universe"]',
    eyebrow: "02 · Discover",
    title: "Explore the Career Universe",
    body: "The Universe is an interactive way to discover roles. Let it cruise, move your pointer to take control, hover a planet to pause, or select one to enter its career workspace.",
  },
  {
    id: "directory",
    route: "/careers",
    selector: '[data-tour="career-directory"]',
    eyebrow: "03 · Compare",
    title: "Prefer a standard list?",
    body: "The Career Directory groups available roles by domain so you can compare paths without using the 3D experience.",
  },
  {
    id: "career-card",
    route: "/careers",
    selector: '[data-tour="career-card"]',
    eyebrow: "04 · Choose",
    title: "Open any career workspace",
    body: "Each role has its own structured workspace. Career descriptions help you decide which direction is worth exploring before committing to a learning path.",
  },
  {
    id: "workspace",
    route: "/careers/ai-engineer",
    selector: '[data-tour="career-workspace"]',
    eyebrow: "05 · Build your path",
    title: "One workspace connects the whole journey",
    body: "Inside a Career Workspace you can move through Roadmap, Learning, Projects, Portfolio evidence, Jobs, Interview preparation, and career intelligence while keeping your progress connected.",
  },
  {
    id: "finish",
    route: "/careers/ai-engineer",
    eyebrow: "You’re ready",
    title: "Explore at your own pace",
    body: "Choose a role that fits your goals, follow its roadmap, complete the learning and projects, and use your evidence to prepare for real opportunities. You can restart this tour any time from the Tour button.",
    placement: "center",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

function routeMatches(pathname: string, route: string) {
  return route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(`${route}/`);
}

function readTourStatus() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeTourStatus(value: "completed" | "dismissed") {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage can be unavailable in hardened/private browser modes. The tour still works for this session.
  }
}

export default function FirstVisitGuidedTour() {
  const pathname = usePathname();
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [targetReady, setTargetReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);
  const step = STEPS[stepIndex];

  const publicRoute = useMemo(
    () => !pathname.startsWith("/admin") && !pathname.startsWith("/login") && !pathname.startsWith("/auth"),
    [pathname],
  );

  useEffect(() => {
    setMounted(true);
    if (pathname === "/" && readTourStatus() === null) {
      const timer = window.setTimeout(() => setInviteOpen(true), 1400);
      return () => window.clearTimeout(timer);
    }
  }, [pathname]);

  const startTour = useCallback(() => {
    setInviteOpen(false);
    setStepIndex(0);
    setTargetRect(null);
    setTargetReady(false);
    setActive(true);
    if (pathname !== "/") router.push("/");
  }, [pathname, router]);

  useEffect(() => {
    const restart = () => startTour();
    window.addEventListener(TOUR_EVENT, restart);
    return () => window.removeEventListener(TOUR_EVENT, restart);
  }, [startTour]);

  const closeTour = useCallback((status: "completed" | "dismissed") => {
    writeTourStatus(status);
    setInviteOpen(false);
    setActive(false);
    setTargetRect(null);
    setTargetReady(false);
    targetRef.current = null;
  }, []);

  const updateTargetRect = useCallback(() => {
    const element = targetRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const padding = 8;
    setTargetRect({
      top: Math.max(8, rect.top - padding),
      left: Math.max(8, rect.left - padding),
      width: Math.min(window.innerWidth - 16, rect.width + padding * 2),
      height: Math.min(window.innerHeight - 16, rect.height + padding * 2),
    });
  }, []);

  useEffect(() => {
    if (!active || !step) return;
    setTargetReady(false);
    targetRef.current = null;
    setTargetRect(null);

    if (!routeMatches(pathname, step.route)) {
      router.push(step.route);
      return;
    }

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
        element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        window.setTimeout(() => {
          if (cancelled) return;
          updateTargetRect();
          setTargetReady(true);
        }, 260);
        return;
      }
      attempts += 1;
      if (attempts < 24) window.setTimeout(findTarget, 120);
      else setTargetReady(true);
    };
    findTarget();

    return () => { cancelled = true; };
  }, [active, pathname, router, step, updateTargetRect]);

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
      if (event.key === "ArrowRight" && stepIndex < STEPS.length - 1) setStepIndex((value) => value + 1);
      if (event.key === "ArrowLeft" && stepIndex > 0) setStepIndex((value) => value - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, closeTour, stepIndex]);

  if (!mounted || !publicRoute) return null;

  const progress = `${stepIndex + 1} / ${STEPS.length}`;
  const isCentered = step?.placement === "center" || !targetRect;
  const cardStyle: React.CSSProperties = isCentered
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
        <button
          type="button"
          onClick={startTour}
          className="fixed bottom-4 left-4 z-[62] inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-[#070a18]/80 px-3.5 py-2 text-xs font-semibold text-slate-300 shadow-lg backdrop-blur-xl transition hover:border-violet-300/30 hover:bg-[#0a0d20]/95 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          aria-label="Start guided tour"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-violet-500/15 text-[11px] text-violet-200" aria-hidden="true">?</span>
          Tour
        </button>
      ) : null}

      {inviteOpen && !active ? (
        <div className="fixed inset-0 z-[90] grid place-items-end bg-black/35 p-4 backdrop-blur-[2px] sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="tour-invite-title">
          <div className="w-full max-w-md rounded-3xl border border-violet-300/20 bg-[#070a18]/96 p-5 text-white shadow-[0_28px_90px_rgba(0,0,0,.55)] backdrop-blur-2xl sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-violet-300/20 bg-violet-500/10 text-xl text-violet-200">✦</div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-violet-300">First visit</p>
                <h2 id="tour-invite-title" className="mt-1 font-display text-xl font-semibold">Want a 1-minute guided tour?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">We’ll show you the Career Universe, the standard Career Directory, and how a Career Workspace connects learning to real career evidence.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => closeTour("dismissed")} className="min-h-11 rounded-xl px-4 py-2 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white">Maybe later</button>
              <button type="button" onClick={startTour} className="min-h-11 rounded-xl bg-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(124,58,237,.3)] transition hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">Start tour</button>
            </div>
          </div>
        </div>
      ) : null}

      {active && step ? (
        <div className="fixed inset-0 z-[100] pointer-events-none" aria-live="polite">
          {targetRect && step.placement !== "center" ? (
            <div
              className="absolute rounded-2xl border border-violet-300/70 shadow-[0_0_0_9999px_rgba(1,3,10,.72),0_0_40px_rgba(139,92,246,.4)] transition-[top,left,width,height] duration-300"
              style={{ top: targetRect.top, left: targetRect.left, width: targetRect.width, height: targetRect.height }}
              aria-hidden="true"
            />
          ) : (
            <div className="absolute inset-0 bg-[#01030a]/76 backdrop-blur-[2px]" aria-hidden="true" />
          )}

          <section
            role="dialog"
            aria-modal="true"
            aria-label={`Guided tour: ${step.title}`}
            className={`pointer-events-auto fixed z-[102] w-[min(390px,calc(100vw-32px))] rounded-3xl border border-white/10 bg-[#080b1c]/97 p-5 text-white shadow-[0_25px_90px_rgba(0,0,0,.62)] backdrop-blur-2xl transition-opacity ${targetReady ? "opacity-100" : "opacity-0"}`}
            style={cardStyle}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-violet-300">{step.eyebrow}</p>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-slate-500">{progress}</span>
            </div>
            <h2 className="mt-3 font-display text-xl font-semibold leading-tight sm:text-2xl">{step.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{step.body}</p>

            <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.07]" aria-hidden="true">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-[width] duration-300" style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button type="button" onClick={() => closeTour("dismissed")} className="min-h-10 rounded-xl px-2 text-xs font-semibold text-slate-500 transition hover:text-white">Skip tour</button>
              <div className="flex items-center gap-2">
                {stepIndex > 0 ? (
                  <button type="button" onClick={() => setStepIndex((value) => value - 1)} className="min-h-10 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.07] hover:text-white">Back</button>
                ) : null}
                {stepIndex < STEPS.length - 1 ? (
                  <button type="button" onClick={() => setStepIndex((value) => value + 1)} className="min-h-10 rounded-xl bg-violet-500 px-4 text-sm font-semibold text-white transition hover:bg-violet-400">Next</button>
                ) : (
                  <button type="button" onClick={() => closeTour("completed")} className="min-h-10 rounded-xl bg-violet-500 px-4 text-sm font-semibold text-white transition hover:bg-violet-400">Finish</button>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export function restartFirstVisitGuidedTour() {
  window.dispatchEvent(new Event(TOUR_EVENT));
}
