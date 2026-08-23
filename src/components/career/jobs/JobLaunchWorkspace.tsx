"use client";

import { useEffect, useMemo, useState } from "react";
import { analyzeJobMatch, jobMatchStorageKey, type JobMatchInput, type JobMatchResult } from "@/lib/jobMatch";
import { getJobReadinessReport } from "@/lib/jobReadiness";
import type { CareerWorkspaceData, CareerWorkspaceProgress } from "@/types/careerWorkspace";

interface SavedMatch {
  id: string;
  input: JobMatchInput;
  result: JobMatchResult;
  analyzedAt: string;
}

export function JobLaunchWorkspace({ career, progress }: { career: CareerWorkspaceData; progress: CareerWorkspaceProgress }) {
  const readiness = useMemo(() => getJobReadinessReport(career, progress), [career, progress]);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [current, setCurrent] = useState<SavedMatch | null>(null);
  const [saved, setSaved] = useState<SavedMatch[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(jobMatchStorageKey(career.slug));
      if (raw) setSaved(JSON.parse(raw));
    } catch {
      setSaved([]);
    }
  }, [career.slug]);

  function analyze() {
    if (title.trim().length < 3 || description.trim().length < 120) return;
    const input = { title: title.trim(), company: company.trim(), description: description.trim() };
    const match: SavedMatch = {
      id: `${Date.now()}`,
      input,
      result: analyzeJobMatch(career, progress, input),
      analyzedAt: new Date().toISOString(),
    };
    const next = [match, ...saved].slice(0, 10);
    setCurrent(match);
    setSaved(next);
    localStorage.setItem(jobMatchStorageKey(career.slug), JSON.stringify(next));
  }

  const gateLabel = readiness.band === "application-ready" ? "Application gate open" : readiness.band === "almost-ready" ? "Selective applications only" : "Build evidence before applying";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Job readiness gate</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{gateLabel}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Readiness is evidence-based: validated assessments, reviewed project proof and launch preparation. A strong JD match does not override missing core evidence.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/60 px-5 py-4 text-right">
            <p className="text-xs text-slate-500">Readiness</p>
            <p className="text-3xl font-semibold text-white">{readiness.score}%</p>
          </div>
        </div>
        {readiness.gaps.length > 0 ? <div className="mt-4 grid gap-2 md:grid-cols-2">{readiness.gaps.slice(0, 4).map((gap) => <div key={gap.id} className="rounded-xl border border-amber-300/10 bg-amber-300/[0.04] p-3"><p className="text-sm font-semibold text-amber-100">{gap.label}</p><p className="mt-1 text-xs leading-5 text-slate-400">{gap.detail}</p></div>)}</div> : null}
      </section>

      <section className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">Analyze a real vacancy</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Paste the job description</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">AI Role Path compares only requirements actually present in the vacancy with evidence already demonstrated in this career workspace.</p>
          <div className="mt-5 space-y-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job title" className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40" />
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company (optional)" className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={11} placeholder="Paste the full job description here..." className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-300/40" />
            <button type="button" onClick={analyze} disabled={title.trim().length < 3 || description.trim().length < 120} className="w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">Analyze job fit</button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          {!current ? <div className="grid min-h-[420px] place-items-center text-center"><div><p className="text-lg font-semibold text-white">No vacancy analyzed yet</p><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Paste a real JD to get an evidence-based match score, skill gaps and an application decision.</p></div></div> : <MatchResult match={current} />}
        </div>
      </section>

      {saved.length > 0 ? <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Saved analyses</p><h3 className="mt-1 text-lg font-semibold text-white">Compare opportunities</h3></div><span className="text-xs text-slate-500">Last {saved.length}</span></div><div className="mt-4 grid gap-3 lg:grid-cols-2">{saved.map((match) => <button key={match.id} type="button" onClick={() => setCurrent(match)} className="rounded-xl border border-white/10 bg-slate-950/40 p-4 text-left hover:border-cyan-300/20"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-white">{match.input.title}</p><p className="mt-1 text-xs text-slate-500">{match.input.company || "Company not specified"}</p></div><span className="text-lg font-semibold text-cyan-200">{match.result.matchScore}%</span></div><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{decisionLabel(match.result.decision)}</p></button>)}</div></section> : null}
    </div>
  );
}

function decisionLabel(decision: JobMatchResult["decision"]) {
  if (decision === "apply") return "Apply — evidence supports this target";
  if (decision === "conditional") return "Conditional — tailor and close priority gaps";
  return "Build gap first — application evidence is weak";
}

function MatchResult({ match }: { match: SavedMatch }) {
  const result = match.result;
  return <div><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">JD gap analysis</p><h3 className="mt-2 text-2xl font-semibold text-white">{match.input.title}</h3><p className="mt-1 text-sm text-slate-500">{match.input.company || "Company not specified"}</p></div><div className="text-right"><p className="text-4xl font-semibold text-white">{result.matchScore}%</p><p className="mt-1 text-xs text-slate-500">Evidence match</p></div></div><div className="mt-5 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05] p-4"><p className="text-sm font-semibold text-cyan-100">{decisionLabel(result.decision)}</p></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><SkillBox title="Matched evidence" items={result.matchedSkills} empty="No explicitly matched skills yet." positive /><SkillBox title="Priority gaps" items={result.missingSkills} empty="No career-specific gaps detected in the pasted JD." /></div>{result.evidenceProjects.length > 0 ? <div className="mt-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Evidence projects</p><div className="mt-2 flex flex-wrap gap-2">{result.evidenceProjects.map((item) => <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{item}</span>)}</div></div> : null}<div className="mt-5 space-y-2">{result.reasons.map((reason) => <p key={reason} className="text-xs leading-5 text-slate-400">• {reason}</p>)}</div><p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-slate-500">This analysis is decision support, not a claim that the employer will shortlist or hire you. It does not infer requirements that are absent from the pasted vacancy.</p></div>;
}

function SkillBox({ title, items, empty, positive = false }: { title: string; items: string[]; empty: string; positive?: boolean }) {
  return <div className={`rounded-xl border p-4 ${positive ? "border-emerald-300/10 bg-emerald-300/[0.035]" : "border-amber-300/10 bg-amber-300/[0.035]"}`}><p className="text-sm font-semibold text-white">{title}</p>{items.length ? <div className="mt-3 flex flex-wrap gap-2">{items.map((item) => <span key={item} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">{item}</span>)}</div> : <p className="mt-2 text-xs leading-5 text-slate-500">{empty}</p>}</div>;
}
