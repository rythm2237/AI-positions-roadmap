"use client";

import { useEffect, useMemo, useState } from "react";

const SEARCH_STARTED_EVENT = "job-agent-search-started";

const phases = [
  "Saving settings",
  "Searching providers",
  "Verifying vacancies",
  "Ranking results",
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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (pending) {
      event.preventDefault();
      return;
    }

    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form || !form.checkValidity()) return;

    setPending(true);
    setElapsedSeconds(0);
    window.dispatchEvent(new Event(SEARCH_STARTED_EVENT));
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
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1/2 animate-[job-agent-search-progress_1.7s_ease-in-out_infinite] bg-white/15"
          />
          <span className="relative flex items-center justify-center gap-2">
            <span className="inline-block size-2 animate-pulse rounded-full bg-white" />
            {phases[phaseIndex]}…
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
