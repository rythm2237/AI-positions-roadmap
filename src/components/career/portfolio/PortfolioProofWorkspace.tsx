"use client";

import { useEffect, useMemo, useState } from "react";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";
import { projectEvidenceStorageKey, type ProjectReview, type ProjectSubmission } from "@/lib/projectEvidence";
import { buildProofProfile, encodeProofProfile } from "@/lib/portfolioProof";

type StoredEvidence = Record<string, { submission?: ProjectSubmission; review?: ProjectReview }>;

export default function PortfolioProofWorkspace({ career }: { career: CareerWorkspaceData }) {
  const [evidence, setEvidence] = useState<StoredEvidence>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(projectEvidenceStorageKey(career.slug));
      setEvidence(raw ? JSON.parse(raw) : {});
    } catch {
      setEvidence({});
    }
  }, [career.slug]);

  const profile = useMemo(() => buildProofProfile(career.slug, career.title, career.projects, evidence), [career, evidence]);

  async function copyProofLink() {
    if (!profile.caseStudies.length) return;
    const payload = encodeProofProfile(profile);
    const url = `${window.location.origin}/proof/${career.slug}?data=${encodeURIComponent(payload)}`;
    await navigator.clipboard?.writeText(url);
    setMessage("Recruiter proof link copied.");
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-cyan-300/20 bg-slate-950/75 p-5">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">Proof of Skill</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="font-display text-2xl font-semibold text-white">Recruiter-ready portfolio evidence</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Only projects that passed the Phase 2 review become case studies. The profile exposes evidence, limitations, skills, and review score instead of unsupported claims.</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-center"><strong className="block text-2xl text-white">{profile.proofScore}</strong><span className="text-xs text-slate-500">Proof score</span></div>
            <div className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-center"><strong className="block text-2xl text-white">{profile.portfolioReadyProjects}</strong><span className="text-xs text-slate-500">Verified projects</span></div>
          </div>
        </div>
        <button type="button" disabled={!profile.caseStudies.length} onClick={() => void copyProofLink()} className="mt-5 min-h-11 rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40">Copy recruiter proof link</button>
        {message ? <p className="mt-2 text-xs text-cyan-200">{message}</p> : null}
      </div>

      {profile.caseStudies.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5 text-sm text-slate-400">No verified case studies yet. Submit a project in Projects and earn at least 70/100 in the reviewer.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {profile.caseStudies.map((study) => (
            <article key={study.projectId} className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[.14em] text-indigo-300">{study.level.replace("-", " ")}</p><h4 className="mt-2 text-lg font-semibold text-white">{study.title}</h4></div><span className="rounded-full border border-white/10 px-3 py-1 text-sm font-semibold text-white">{study.score}/100</span></div>
              <p className="mt-4 text-sm leading-6 text-slate-300">{study.recruiterSummary}</p>
              <dl className="mt-5 space-y-4 text-sm"><div><dt className="font-semibold text-slate-200">Approach</dt><dd className="mt-1 leading-6 text-slate-400">{study.approach}</dd></div><div><dt className="font-semibold text-slate-200">Evidence</dt><dd className="mt-1 leading-6 text-slate-400">{study.evidence}</dd></div><div><dt className="font-semibold text-slate-200">Limitations</dt><dd className="mt-1 leading-6 text-slate-400">{study.limitations}</dd></div></dl>
              <div className="mt-4 flex flex-wrap gap-2">{study.skills.map((skill) => <span key={skill} className="tag">{skill}</span>)}</div>
              <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">{study.artifactUrl ? <a href={study.artifactUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">Open artifact</a> : null}{study.repositoryUrl ? <a href={study.repositoryUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">Open repository</a> : null}</div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
