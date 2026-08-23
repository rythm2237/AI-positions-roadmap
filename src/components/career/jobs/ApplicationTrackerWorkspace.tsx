"use client";

import { useEffect, useMemo, useState } from "react";
import { applicationTrackerStorageKey, getApplicationMetrics, nextTrackerAction, type ApplicationStage, type TrackedApplication } from "@/lib/applicationTracker";
import { jobMatchStorageKey, type JobMatchInput, type JobMatchResult } from "@/lib/jobMatch";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

type SavedMatch = { id: string; input: JobMatchInput; result: JobMatchResult; analyzedAt: string };

const STAGES: Array<{ id: ApplicationStage; label: string }> = [
  { id: "planned", label: "Planned" }, { id: "applied", label: "Applied" }, { id: "screening", label: "Screening" },
  { id: "interview", label: "Interview" }, { id: "offer", label: "Offer" }, { id: "rejected", label: "Rejected" }, { id: "withdrawn", label: "Withdrawn" },
];

export default function ApplicationTrackerWorkspace({ career }: { career: CareerWorkspaceData }) {
  const [items, setItems] = useState<TrackedApplication[]>([]);
  const [matches, setMatches] = useState<SavedMatch[]>([]);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(applicationTrackerStorageKey(career.slug)) || "[]")); } catch { setItems([]); }
    try { setMatches(JSON.parse(localStorage.getItem(jobMatchStorageKey(career.slug)) || "[]")); } catch { setMatches([]); }
  }, [career.slug]);

  const metrics = useMemo(() => getApplicationMetrics(items), [items]);
  const trackedMatchIds = useMemo(() => new Set(items.map((item) => item.matchId).filter(Boolean)), [items]);
  const due = useMemo(() => items.filter((item) => item.nextFollowUpAt && new Date(item.nextFollowUpAt) <= new Date() && !["offer", "rejected", "withdrawn"].includes(item.stage)), [items]);

  function persist(next: TrackedApplication[]) {
    setItems(next);
    localStorage.setItem(applicationTrackerStorageKey(career.slug), JSON.stringify(next));
  }

  function addFromMatch(match: SavedMatch) {
    if (trackedMatchIds.has(match.id)) return;
    const now = new Date();
    const next: TrackedApplication = {
      id: `${Date.now()}`,
      matchId: match.id,
      title: match.input.title,
      company: match.input.company || "",
      matchScore: match.result.matchScore,
      decision: match.result.decision,
      stage: "planned",
      lastActivityAt: now.toISOString(),
      notes: "",
    };
    persist([next, ...items]);
  }

  function update(id: string, patch: Partial<TrackedApplication>) {
    persist(items.map((item) => item.id === id ? { ...item, ...patch, lastActivityAt: new Date().toISOString() } : item));
  }

  function remove(id: string) { persist(items.filter((item) => item.id !== id)); }

  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Application tracker</p><h3 className="mt-2 text-2xl font-semibold text-white">Manage the job-search pipeline</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Track real applications, follow-up dates and outcomes. Funnel metrics are calculated only from entries you record.</p></div>
        <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05] px-4 py-3"><p className="text-xs text-slate-500">Next action</p><p className="mt-1 max-w-sm text-sm font-semibold text-cyan-100">{nextTrackerAction(items)}</p></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[["Tracked", metrics.total], ["Active", metrics.active], ["Interviews", metrics.interviews], ["Offers", metrics.offers], ["Response", `${metrics.responseRate}%`], ["Interview rate", `${metrics.interviewRate}%`]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-white/10 bg-slate-950/50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold text-white">{value}</p></div>)}
      </div>

      {due.length > 0 ? <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-4"><p className="text-sm font-semibold text-amber-100">Follow-up queue · {due.length} due</p><div className="mt-2 space-y-1">{due.map((item) => <p key={item.id} className="text-xs text-slate-300">{item.company || item.title} · {new Date(item.nextFollowUpAt!).toLocaleDateString()}</p>)}</div></div> : null}

      {matches.some((match) => !trackedMatchIds.has(match.id)) ? <div><p className="text-sm font-semibold text-white">Add from saved Job Match</p><div className="mt-3 grid gap-2 lg:grid-cols-2">{matches.filter((match) => !trackedMatchIds.has(match.id)).map((match) => <button key={match.id} type="button" onClick={() => addFromMatch(match)} className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-left hover:border-cyan-300/25"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-white">{match.input.title}</p><p className="text-xs text-slate-500">{match.input.company || "Company not specified"}</p></div><span className="text-sm font-semibold text-cyan-200">{match.result.matchScore}%</span></div><p className="mt-2 text-xs text-slate-400">Add to pipeline</p></button>)}</div></div> : null}

      {items.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">No applications tracked yet. Analyze a vacancy above, then add it to the pipeline.</div> : <div className="space-y-3">{items.map((item) => <article key={item.id} className="rounded-xl border border-white/10 bg-slate-950/45 p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h4 className="font-semibold text-white">{item.title}</h4>{item.matchScore != null ? <span className="rounded-full border border-cyan-300/15 px-2 py-0.5 text-xs text-cyan-200">{item.matchScore}% match</span> : null}</div><p className="mt-1 text-xs text-slate-500">{item.company || "Company not specified"}</p></div><button type="button" onClick={() => remove(item.id)} className="text-xs text-rose-300">Remove</button></div><div className="mt-4 grid gap-3 md:grid-cols-3"><label className="text-xs text-slate-400">Stage<select value={item.stage} onChange={(e) => update(item.id, { stage: e.target.value as ApplicationStage, appliedAt: e.target.value === "applied" && !item.appliedAt ? new Date().toISOString() : item.appliedAt })} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white">{STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}</select></label><label className="text-xs text-slate-400">Follow-up date<input type="date" value={item.nextFollowUpAt ? item.nextFollowUpAt.slice(0,10) : ""} onChange={(e) => update(item.id, { nextFollowUpAt: e.target.value ? new Date(`${e.target.value}T09:00:00`).toISOString() : undefined })} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white" /></label><label className="text-xs text-slate-400">Notes<input value={item.notes} onChange={(e) => update(item.id, { notes: e.target.value })} placeholder="Contact, next step, outcome..." className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white" /></label></div></article>)}</div>}

      <p className="border-t border-white/10 pt-4 text-xs leading-5 text-slate-500">Progress metrics describe your recorded pipeline only. They are not estimates of hiring probability or market demand.</p>
    </section>
  );
}
