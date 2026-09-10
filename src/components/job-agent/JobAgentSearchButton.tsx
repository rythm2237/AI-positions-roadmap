"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const phases = [
  { label: "Saving settings", progress: 18, kicker: "Preparing your search", detail: "Locking in the criteria that define your next move." },
  { label: "Searching providers", progress: 45, kicker: "Scanning the opportunity graph", detail: "Looking across live sources for roles that match your direction." },
  { label: "Verifying vacancies", progress: 72, kicker: "Separating signal from noise", detail: "Checking source quality, requirements, language and eligibility evidence." },
  { label: "Ranking results", progress: 90, kicker: "Building your shortlist", detail: "Comparing verified opportunities against your career evidence and constraints." },
] as const;

const insightMessages = [
  "Your profile is being used as evidence, not just keywords.",
  "Source trust is checked before a vacancy can become a recommendation.",
  "Language, location and sponsorship constraints are treated as hard gates.",
  "Role fit is evaluated separately from eligibility so strong-looking jobs do not slip through the wrong filters.",
  "The final shortlist favors explainable matches over noisy volume.",
] as const;

const signalCards = [
  { label: "Role signal", description: "Title & scope" },
  { label: "Evidence", description: "CV & profile" },
  { label: "Source trust", description: "Vacancy quality" },
  { label: "Eligibility", description: "Hard constraints" },
] as const;

type ProgressPayload = {
  run: null | {
    id: string;
    status: string;
    discovered: number;
    canonical: number;
    eligible: number;
    unverified: number;
    blocked: number;
    recommended: number;
    startedAt: string;
    completedAt: string | null;
  };
};

export function JobAgentSearchButton({
  formId = "job-agent-settings",
  idleLabel = "Save & Search current settings",
  className = "btn-primary min-h-11",
}: {
  formId?: string;
  idleLabel?: string;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const navigationKey = searchParams.toString();
  const searchInFlight = useRef(false);
  const searchStartHref = useRef<string | null>(null);
  const searchStartNavigationKey = useRef<string | null>(null);
  const searchStartedAt = useRef<number>(0);
  const [pending, setPending] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [targetDiscovered, setTargetDiscovered] = useState(0);
  const [displayedDiscovered, setDisplayedDiscovered] = useState(0);

  const resetProgress = useCallback(() => {
    searchInFlight.current = false;
    searchStartHref.current = null;
    searchStartNavigationKey.current = null;
    searchStartedAt.current = 0;
    setPending(false);
    setElapsedSeconds(0);
    setTargetDiscovered(0);
    setDisplayedDiscovered(0);
  }, []);

  const beginProgress = useCallback(() => {
    searchInFlight.current = true;
    searchStartHref.current = window.location.href;
    searchStartNavigationKey.current = navigationKey;
    searchStartedAt.current = Date.now();
    setPending(true);
    setElapsedSeconds(0);
    setTargetDiscovered(0);
    setDisplayedDiscovered(0);
  }, [navigationKey]);

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    const onSubmit = (event: SubmitEvent) => {
      const submitter = event.submitter as HTMLButtonElement | HTMLInputElement | null;
      const isSearch =
        submitter?.getAttribute("name") === "intent" &&
        submitter?.getAttribute("value") === "save_and_search";

      if (!isSearch) return;
      if (searchInFlight.current) {
        event.preventDefault();
        return;
      }
      beginProgress();
    };

    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [beginProgress, formId]);

  useEffect(() => {
    if (!pending) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [pending]);

  useEffect(() => {
    if (!pending) return;
    const startKey = searchStartNavigationKey.current;
    if (startKey !== null && navigationKey !== startKey) resetProgress();
  }, [navigationKey, pending, resetProgress]);

  useEffect(() => {
    if (!pending || !searchStartHref.current) return;
    const poll = window.setInterval(() => {
      const startHref = searchStartHref.current;
      if (startHref && window.location.href !== startHref) resetProgress();
    }, 250);
    return () => window.clearInterval(poll);
  }, [pending, resetProgress]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) resetProgress();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [resetProgress]);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [pending]);

  useEffect(() => {
    if (!pending) return;
    let cancelled = false;

    const readProgress = async () => {
      try {
        const response = await fetch("/api/job-agent/search-progress", { cache: "no-store" });
        if (!response.ok || cancelled) return;
        const payload = (await response.json()) as ProgressPayload;
        if (!payload.run) return;
        const runStartedAt = new Date(payload.run.startedAt).getTime();
        if (!Number.isFinite(runStartedAt) || runStartedAt + 1500 < searchStartedAt.current) return;
        setTargetDiscovered(Math.max(0, payload.run.discovered));
      } catch {
        // The visual experience must never block the search when progress telemetry is unavailable.
      }
    };

    void readProgress();
    const timer = window.setInterval(readProgress, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pending]);

  useEffect(() => {
    if (!pending || displayedDiscovered >= targetDiscovered) return;
    const distance = targetDiscovered - displayedDiscovered;
    const delay = distance > 60 ? 24 : distance > 25 ? 34 : 48;
    const timer = window.setTimeout(() => {
      setDisplayedDiscovered((value) => Math.min(value + 1, targetDiscovered));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [displayedDiscovered, pending, targetDiscovered]);

  const phaseIndex = useMemo(() => {
    if (elapsedSeconds < 2) return 0;
    if (elapsedSeconds < 45) return 1;
    if (elapsedSeconds < 180) return 2;
    return 3;
  }, [elapsedSeconds]);

  const phase = phases[phaseIndex];
  const insight = insightMessages[Math.floor(elapsedSeconds / 12) % insightMessages.length];
  const elapsedLabel = useMemo(() => {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, "0")}` : `${seconds}s`;
  }, [elapsedSeconds]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (pending || searchInFlight.current) {
      event.preventDefault();
      return;
    }
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) {
      event.preventDefault();
      return;
    }
    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
    }
  };

  return (
    <>
      <button
        type="submit"
        form={formId}
        name="intent"
        value="save_and_search"
        aria-disabled={pending}
        aria-busy={pending}
        data-pending={pending ? "true" : "false"}
        onClick={handleClick}
        className={`${className} relative min-w-[16rem] overflow-hidden data-[pending=true]:cursor-wait`}
      >
        {pending ? (
          <>
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
              <span className="block h-full bg-white/70 transition-[width] duration-700 ease-out" style={{ width: `${phase.progress}%` }} />
            </span>
            <span className="relative flex items-center justify-center gap-2">
              <span className="inline-block size-2 animate-pulse rounded-full bg-white" />
              {phase.label}…
            </span>
            <span className="sr-only" role="status" aria-live="polite">
              {phase.label}. Job search is running. Please wait and do not submit again.
            </span>
          </>
        ) : (
          <span className="relative">{idleLabel}</span>
        )}
      </button>

      {pending ? (
        <div
          className="fixed inset-0 z-[120] isolate overflow-hidden bg-[#07111f] text-white"
          role="status"
          aria-live="polite"
          aria-label="AI Role Path is building your job shortlist"
        >
          <div aria-hidden="true" className="absolute inset-0 opacity-80">
            <div className="absolute -left-24 top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute -right-24 bottom-[-8rem] h-[30rem] w-[30rem] rounded-full bg-violet-500/10 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(to_bottom,transparent,black_22%,black_78%,transparent)]" />
          </div>

          <div className="relative mx-auto flex min-h-full w-full max-w-7xl flex-col px-4 py-5 sm:px-6 sm:py-6 md:px-8 lg:px-10 xl:px-12">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl border border-white/15 bg-white/10 text-sm font-semibold tracking-[0.12em] shadow-[0_0_40px_rgba(34,211,238,0.12)] backdrop-blur-xl">AR</div>
                <div>
                  <p className="text-sm font-semibold tracking-wide text-white">AI Role Path</p>
                  <p className="text-xs text-white/45">Career intelligence in motion</p>
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/55 backdrop-blur-xl">{elapsedLabel} elapsed</div>
            </div>

            <div className="mx-auto mt-5 w-full max-w-5xl sm:mt-7">
              <div className="relative grid grid-cols-4 gap-2">
                <div aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-5 h-px bg-white/10" />
                <div
                  aria-hidden="true"
                  className="absolute left-[12.5%] top-5 h-px bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 transition-[width] duration-1000 ease-out"
                  style={{ width: `${phaseIndex * 25}%` }}
                >
                  <span className="absolute right-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_18px_rgba(103,232,249,0.95)]" />
                </div>
                {phases.map((item, index) => {
                  const current = index === phaseIndex;
                  const complete = index < phaseIndex;
                  return (
                    <div key={item.label} className="relative flex flex-col items-center text-center">
                      <div className={`relative z-10 grid size-10 place-items-center rounded-full border text-xs font-semibold transition-all duration-700 ${current ? "scale-110 border-cyan-200/60 bg-cyan-200/15 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.2)]" : complete ? "border-cyan-200/30 bg-cyan-200/10 text-cyan-100" : "border-white/10 bg-[#0b1727] text-white/30"}`}>
                        {complete ? "✓" : index + 1}
                        {current ? <span aria-hidden="true" className="absolute inset-[-6px] animate-ping rounded-full border border-cyan-300/25" /> : null}
                      </div>
                      <p className={`mt-2 hidden text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors sm:block ${current ? "text-cyan-100/85" : complete ? "text-white/55" : "text-white/25"}`}>{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center py-5 sm:py-7">
              <div className="grid w-full max-w-5xl items-center gap-7 lg:grid-cols-[1.05fr_.95fr] lg:gap-10">
                <div className="flex flex-col items-center lg:items-start">
                  <div className="relative mb-6 grid size-[13.5rem] place-items-center sm:size-[15rem] lg:size-[16rem]">
                    <div aria-hidden="true" className="absolute inset-0 rounded-full border border-cyan-300/10" />
                    <div aria-hidden="true" className="absolute inset-4 animate-[spin_18s_linear_infinite] rounded-full border border-dashed border-cyan-300/20">
                      <span className="absolute left-1/2 top-[-5px] size-2.5 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_22px_rgba(103,232,249,0.9)]" />
                      <span className="absolute bottom-[12%] right-[8%] size-2 rounded-full bg-violet-300 shadow-[0_0_20px_rgba(196,181,253,0.8)]" />
                    </div>
                    <div aria-hidden="true" className="absolute inset-9 animate-[spin_12s_linear_infinite_reverse] rounded-full border border-white/10">
                      <span className="absolute bottom-[-4px] left-1/2 size-2 -translate-x-1/2 rounded-full bg-white/90 shadow-[0_0_18px_rgba(255,255,255,0.65)]" />
                    </div>
                    <div aria-hidden="true" className="absolute inset-[4rem] rounded-full bg-gradient-to-br from-cyan-300/20 via-blue-400/10 to-violet-400/20 blur-xl" />
                    <div className="relative grid size-28 place-items-center rounded-[2rem] border border-white/15 bg-white/[0.08] shadow-[0_18px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                      <div className="absolute inset-2 rounded-[1.55rem] border border-white/10" />
                      <div className="relative text-center">
                        <div className="mx-auto mb-2 flex w-12 items-end justify-center gap-1">
                          <span className="h-4 w-1.5 animate-pulse rounded-full bg-cyan-200/80" />
                          <span className="h-7 w-1.5 animate-pulse rounded-full bg-white [animation-delay:140ms]" />
                          <span className="h-5 w-1.5 animate-pulse rounded-full bg-violet-200/80 [animation-delay:280ms]" />
                          <span className="h-8 w-1.5 animate-pulse rounded-full bg-cyan-100 [animation-delay:420ms]" />
                          <span className="h-3 w-1.5 animate-pulse rounded-full bg-white/70 [animation-delay:560ms]" />
                        </div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55">AI Career</p>
                        <p className="mt-1 text-sm font-semibold text-white">Signal Engine</p>
                      </div>
                    </div>
                  </div>

                  <div key={phaseIndex} className="max-w-2xl animate-[fade-in_.7s_ease-out] text-center lg:text-left">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">{phase.kicker}</p>
                    <h2 className="text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">Finding the right signal in the job market.</h2>
                    <p className="mt-3 text-sm leading-6 text-white/55 sm:text-base">{phase.detail} This search can take a few minutes because AI Role Path verifies opportunities before it ranks them.</p>
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <div className="overflow-hidden rounded-[1.75rem] border border-cyan-200/15 bg-gradient-to-br from-white/[0.08] to-white/[0.035] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/55">Positions discovered</p>
                        <p className="mt-1 text-xs text-white/35">Live count from the current search</p>
                      </div>
                      <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-cyan-200/15 bg-cyan-200/[0.07] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">
                        <span className="size-1.5 animate-pulse rounded-full bg-cyan-200" /> Live
                      </span>
                    </div>
                    <div className="mt-5 flex items-end gap-3">
                      <span key={displayedDiscovered} className="min-w-[4ch] text-6xl font-semibold tabular-nums tracking-[-0.06em] text-white sm:text-7xl">{displayedDiscovered}</span>
                      <span className="pb-2 text-sm text-white/35">vacancies found</span>
                    </div>
                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/8">
                      <div className="h-full w-1/3 animate-[pulse_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent" />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-white/35">The number only advances when search telemetry reports real provider results. It is not a simulated counter.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                    {signalCards.map((card, index) => {
                      const active = index <= phaseIndex;
                      return (
                        <div key={card.label} className={`rounded-2xl border px-3.5 py-3 text-left backdrop-blur-xl transition-all duration-700 ${active ? "border-cyan-200/20 bg-cyan-200/[0.07] shadow-[0_12px_40px_rgba(34,211,238,0.06)]" : "border-white/8 bg-white/[0.035]"}`}>
                          <div className="mb-2 flex items-center gap-2">
                            <span className={`size-1.5 rounded-full ${active ? "animate-pulse bg-cyan-200" : "bg-white/20"}`} />
                            <span className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${active ? "text-cyan-100/75" : "text-white/30"}`}>{active ? "Scanning" : "Queued"}</span>
                          </div>
                          <p className="text-sm font-medium text-white/90">{card.label}</p>
                          <p className="mt-0.5 text-xs text-white/40">{card.description}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3.5 backdrop-blur-xl sm:px-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-xl bg-white/10 text-xs text-cyan-100">✦</div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">While we work</p>
                        <p key={insight} className="mt-1 animate-[pulse_2.4s_ease-in-out_1] text-sm leading-5 text-white/65">{insight}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-5xl pb-1">
              <div className="mb-2 flex items-center justify-between gap-4 text-xs text-white/45">
                <span className="flex items-center gap-2"><span className="size-1.5 animate-pulse rounded-full bg-cyan-200" />{phase.label}</span>
                <span>Live process · progress is indicative</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="relative h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 transition-[width] duration-1000 ease-out" style={{ width: `${phase.progress}%` }}>
                  <span aria-hidden="true" className="absolute inset-y-0 right-0 w-16 animate-pulse bg-white/35 blur-md" />
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] leading-4 text-white/30">You can keep this tab open. Results will appear automatically when the search finishes.</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
