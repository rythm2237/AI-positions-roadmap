"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const SEARCH_STARTED_EVENT = "job-agent-search-started";

const phases = [
  { label: "Saving settings", progress: 18 },
  { label: "Searching providers", progress: 45 },
  { label: "Verifying vacancies", progress: 72 },
  { label: "Ranking results", progress: 90 },
] as const;

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
  const [pending, setPending] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const resetProgress = useCallback(() => {
    searchInFlight.current = false;
    searchStartHref.current = null;
    setPending(false);
    setElapsedSeconds(0);
  }, []);

  const beginProgress = useCallback(() => {
    searchInFlight.current = true;
    searchStartHref.current = window.location.href;
    setPending(true);
    setElapsedSeconds(0);
  }, []);

  useEffect(() => {
    const start = () => beginProgress();
    window.addEventListener(SEARCH_STARTED_EVENT, start);
    return () => window.removeEventListener(SEARCH_STARTED_EVENT, start);
  }, [beginProgress]);

  // Next.js can preserve this client component when a server action redirects back
  // to /job-agent with new search params. Reset local progress after that navigation.
  useEffect(() => {
    if (!pending) return;
    resetProgress();
  }, [navigationKey, pending, resetProgress]);

  // Browser URL is the source of truth for completion. In some Next.js server-action
  // redirects the component instance is preserved and useSearchParams can lag behind
  // the actual location. Detect the real URL change directly so the control cannot
  // remain visually stuck at "Ranking results…" after results are already rendered.
  useEffect(() => {
    if (!pending || !searchStartHref.current) return;

    const poll = window.setInterval(() => {
      const startHref = searchStartHref.current;
      if (!startHref) return;
      if (window.location.href !== startHref) resetProgress();
    }, 250);

    return () => window.clearInterval(poll);
  }, [pending, resetProgress]);

  // Recover correctly when the page is restored from browser back/forward cache.
  useEffect(() => {
    const onPageShow = () => resetProgress();
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [resetProgress]);

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    const onSubmit = (event: SubmitEvent) => {
      const submitter = event.submitter as HTMLButtonElement | HTMLInputElement | null;
      const isSearch = submitter?.getAttribute("name") === "intent" && submitter?.getAttribute("value") === "save_and_search";
      if (!isSearch) return;

      if (searchInFlight.current) {
        event.preventDefault();
        return;
      }

      if (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) submitter.disabled = true;
      window.dispatchEvent(new Event(SEARCH_STARTED_EVENT));
    };

    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [formId]);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [pending]);

  const phaseIndex = useMemo(() => {
    if (elapsedSeconds < 2) return 0;
    if (elapsedSeconds < 7) return 1;
    if (elapsedSeconds < 15) return 2;
    return 3;
  }, [elapsedSeconds]);

  const phase = phases[phaseIndex];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (pending || searchInFlight.current) {
      event.preventDefault();
      return;
    }

    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form || !form.checkValidity()) return;

    beginProgress();
  };

  return (
    <button
      type="submit"
      form={formId}
      name="intent"
      value="save_and_search"
      disabled={pending}
      aria-disabled={pending}
      aria-busy={pending}
      onClick={handleClick}
      className={`${className} relative min-w-[16rem] overflow-hidden disabled:cursor-wait disabled:opacity-100`}
    >
      {pending ? (
        <>
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
            <span
              className="block h-full bg-white/70 transition-[width] duration-700 ease-out"
              style={{ width: `${phase.progress}%` }}
            />
          </span>
          <span className="relative flex items-center justify-center gap-2">
            <span className="inline-block size-2 animate-pulse rounded-full bg-white" />
            {phase.label}…
          </span>
          <span className="sr-only" role="status" aria-live="polite">
            Job search is running. Please wait and do not submit again.
          </span>
        </>
      ) : (
        <span className="relative">{idleLabel}</span>
      )}
    </button>
  );
}
