"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { applicationTrackerStorageKey, type TrackedApplication } from "@/lib/applicationTracker";
import {
  buildRetentionSnapshot,
  buildWeeklyProgressReport,
  retentionStorageKey,
  shouldCaptureWeeklySnapshot,
  type RetentionSnapshot,
} from "@/lib/retentionProgress";
import type { CareerWorkspaceData, CareerWorkspaceProgress } from "@/types/careerWorkspace";

export default function RetentionProgressPanel({
  career,
  progress,
}: {
  career: CareerWorkspaceData;
  progress: CareerWorkspaceProgress;
}) {
  const [applications, setApplications] = useState<TrackedApplication[]>([]);
  const [snapshots, setSnapshots] = useState<RetentionSnapshot[]>([]);
  const [loaded, setLoaded] = useState(false);
  const trackedView = useRef(false);

  useEffect(() => {
    try {
      const appRaw = localStorage.getItem(applicationTrackerStorageKey(career.slug));
      const snapshotRaw = localStorage.getItem(retentionStorageKey(career.slug));
      setApplications(appRaw ? JSON.parse(appRaw) : []);
      setSnapshots(snapshotRaw ? JSON.parse(snapshotRaw) : []);
    } catch {
      setApplications([]);
      setSnapshots([]);
    } finally {
      setLoaded(true);
    }
  }, [career.slug]);

  useEffect(() => {
    if (!loaded || !shouldCaptureWeeklySnapshot(snapshots)) return;
    const next = [...snapshots, buildRetentionSnapshot(career, progress, applications)].slice(-12);
    setSnapshots(next);
    try {
      localStorage.setItem(retentionStorageKey(career.slug), JSON.stringify(next));
    } catch {}
  }, [applications, career, loaded, progress, snapshots]);

  const report = useMemo(
    () => buildWeeklyProgressReport(career, progress, applications, snapshots),
    [applications, career, progress, snapshots]
  );

  useEffect(() => {
    if (!loaded || trackedView.current) return;
    trackedView.current = true;
    trackEvent(analyticsEvents.weeklyProgressViewed, {
      career_slug: career.slug,
      readiness_score: report.current.readinessScore,
      readiness_delta: report.readinessDelta,
      snapshot_count: snapshots.length,
      application_count: applications.length,
    });
  }, [applications.length, career.slug, loaded, report.current.readinessScore, report.readinessDelta, snapshots.length]);

  const trendLabel = report.readinessDelta > 0 ? `+${report.readinessDelta}` : `${report.readinessDelta}`;

  return (
    <section className="mt-5 rounded-2xl border border-sky-300/15 bg-sky-300/[0.025] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">Weekly progress loop</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Keep momentum visible</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">This report compares tracked evidence and application activity. It does not estimate hiring probability.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3 text-right">
          <p className="text-xs text-slate-500">Readiness change</p>
          <p className={`text-2xl font-semibold ${report.readinessDelta > 0 ? "text-emerald-300" : report.readinessDelta < 0 ? "text-amber-300" : "text-white"}`}>{trendLabel} pts</p>
        </div>
      </div>

      {report.milestone ? <div className="mt-4 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.04] p-3 text-sm font-semibold text-emerald-200">{report.milestone}</div> : null}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Metric label="Current readiness" value={`${report.current.readinessScore}%`} />
        <Metric label="Validated skills trend" value={`${report.validationDelta > 0 ? "+" : ""}${report.validationDelta} pts`} />
        <Metric label="Project evidence trend" value={`${report.projectDelta > 0 ? "+" : ""}${report.projectDelta} pts`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-300">What changed</p>
          <div className="mt-3 space-y-2">{report.explanation.map((item) => <p key={item} className="text-xs leading-5 text-slate-400">• {item}</p>)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-300">Next best action</p>
          <p className="mt-3 text-sm leading-6 text-slate-200">{report.nextBestAction}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-sm font-semibold text-white">Reminders & nudges</p>
          <div className="mt-2 space-y-2">{report.reminders.map((item) => <p key={item} className="text-xs leading-5 text-slate-400">• {item}</p>)}</div>
        </div>
        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-sm font-semibold text-white">Career market check</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">{report.marketNote}</p>
          <Link href={`/career-intelligence?career=${encodeURIComponent(career.slug)}`} className="mt-3 inline-flex rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-sky-200 hover:bg-white/[0.05]">Open Career Intelligence</Link>
        </div>
      </div>

      <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-5 text-slate-500">Weekly snapshots are stored per career in this browser. Readiness changes are explainable only from recorded learning, assessments, reviewed projects, career tasks and application activity.</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-semibold text-white">{value}</p></div>;
}
