"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Status = "queued" | "running" | "review" | "failed";

export function CareerGenerationStatusPanel({
  requestId,
  title,
  initialStatus,
  errorCode,
  careerTitle,
}: {
  requestId: string;
  title: string;
  initialStatus: string;
  errorCode: string | null;
  careerTitle: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>((["queued", "running", "review", "failed"].includes(initialStatus) ? initialStatus : "queued") as Status);

  useEffect(() => {
    if (status === "review" || status === "failed") return;
    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(`/api/career-discovery/requests/${encodeURIComponent(requestId)}`, { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json() as { status?: Status };
        if (cancelled || !result.status) return;
        setStatus(result.status);
        if (result.status === "review" || result.status === "failed") router.refresh();
      } catch {
        // Temporary status-check failures leave the request view usable.
      }
    };
    const timer = window.setInterval(poll, 6000);
    void poll();
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [requestId, router, status]);

  const titleText = status === "queued"
    ? "Your career blueprint is queued"
    : status === "running"
      ? "Building the career blueprint"
      : status === "review"
        ? "Blueprint ready for review"
        : "Generation needs another attempt";

  return (
    <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8" aria-live="polite">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-300">Career discovery request</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">{titleText}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-300">{careerTitle ?? title}</p>
      {status === "failed" ? (
        <div className="mt-4 rounded-xl border border-rose-300/20 bg-rose-300/[.06] p-4 text-sm text-rose-100">
          This request could not be completed after the bounded retry limit. {errorCode ? <span className="text-rose-200/70">Reference: {errorCode}</span> : null}
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1 capitalize">{status}</span>
          <span>Existing careers and learning resources are reused when verified matches exist.</span>
        </div>
      )}
    </section>
  );
}
