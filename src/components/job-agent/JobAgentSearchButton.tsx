"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [pending, setPending] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const start = () => {
      setPending(true);
      setElapsedSeconds(0);
    };
    window.addEventListener(SEARCH_STARTED_EVENT, start);
    return () => window.removeEventListener(SEARCH_STARTED_EVENT, start);
  }, []);

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    let searchInFlight = false;
    const onSubmit = (event: SubmitEvent) => {
      const submitter = event.submitter as HTMLButtonElement | HTMLInputElement | null;
      const isSearch = submitter?.getAttribute("name") === "intent" && submitter?.getAttribute("value") === "save_and_search";
      if (!isSearch) return;

      if (searchInFlight) {
        event.preventDefault();
        return;
      }

      searchInFlight = true;
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
    if (pending) {
      event.preventDefault();
      return;
    }

    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form || !form.checkValidity()) return;

    setPending(true);
    setElapsedSeconds(0);
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
