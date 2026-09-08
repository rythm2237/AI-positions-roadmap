"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const phases = [
  { label: "Saving settings", progress: 18 },
  { label: "Searching providers", progress: 45 },
  { label: "Verifying vacancies", progress: 72 },
  { label: "Ranking results", progress: 92 },
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
  const searchStartNavigationKey = useRef<string | null>(null);
  const [pending, setPending] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const resetProgress = useCallback(() => {
    searchInFlight.current = false;
    searchStartHref.current = null;
    searchStartNavigationKey.current = null;
    setPending(false);
    setElapsedSeconds(0);
  }, []);

  const beginProgress = useCallback(() => {
    // Start progress only from the form submit event. Starting it from onClick can
    // disable the submit control before the browser performs the native submit.
    searchInFlight.current = true;
    searchStartHref.current = window.location.href;
    searchStartNavigationKey.current = navigationKey;
    setPending(true);
    setElapsedSeconds(0);
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

  // Reset only after search parameters really change. Depending on `pending` here
  // caused the previous regression: setting pending=true immediately triggered the
  // reset effect and could break the submission lifecycle.
  useEffect(() => {
    if (!pending) return;
    const startKey = searchStartNavigationKey.current;
    if (startKey !== null && navigationKey !== startKey) resetProgress();
  }, [navigationKey, pending, resetProgress]);

  // Next.js may preserve this client component across a server-action redirect.
  // The browser URL is therefore a second completion signal if useSearchParams lags.
  useEffect(() => {
    if (!pending || !searchStartHref.current) return;

    const poll = window.setInterval(() => {
      const startHref = searchStartHref.current;
      if (startHref && window.location.href !== startHref) resetProgress();
    }, 250);

    return () => window.clearInterval(poll);
  }, [pending, resetProgress]);

  // Avoid a permanently busy control if the browser restores the page from cache.
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

  const phaseIndex = useMemo(() => {
    // Searches in this workflow commonly complete in ~8–20 seconds. These shorter
    // intervals make each user-facing phase observable without delaying real work.
    if (elapsedSeconds < 1) return 0;
    if (elapsedSeconds < 4) return 1;
    if (elapsedSeconds < 8) return 2;
    return 3;
  }, [elapsedSeconds]);

  const phase = phases[phaseIndex];

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

    // Let native form validation and submission continue. The submit event above is
    // the single place that starts the progress state and duplicate-submit guard.
    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
    }
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
            {phase.label}. Job search is running. Please wait and do not submit again.
          </span>
        </>
      ) : (
        <span className="relative">{idleLabel}</span>
      )}
    </button>
  );
}
