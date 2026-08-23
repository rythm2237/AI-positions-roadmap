"use client";

import { useEffect, useMemo, useState } from "react";
import type { CareerNote, CareerProject, CareerWorkspaceData, CareerWorkspaceProgress } from "@/types/careerWorkspace";
import { PROJECT_PASSING_SCORE, PROJECT_RUBRIC, projectEvidenceStorageKey, validateProjectSubmission, type ProjectReview, type ProjectSubmission } from "@/lib/projectEvidence";

type EvidenceState = {
  submissions: Record<string, ProjectSubmission>;
  reviews: Record<string, ProjectReview>;
};

const EMPTY: EvidenceState = { submissions: {}, reviews: {} };

function loadEvidence(slug: string): EvidenceState {
  if (typeof window === "undefined") return EMPTY;
  try {
    return { ...EMPTY, ...JSON.parse(window.localStorage.getItem(projectEvidenceStorageKey(slug)) || "{}") };
  } catch {
    return EMPTY;
  }
}

function saveEvidence(slug: string, state: EvidenceState) {
  try { window.localStorage.setItem(projectEvidenceStorageKey(slug), JSON.stringify(state)); } catch {}
}

function defaultSubmission(projectId: string): ProjectSubmission {
  return { projectId, summary: "", artifactUrl: "", repositoryUrl: "", evidence: "", limitations: "", submittedAt: "" };
}

export default function GuidedProjectsWorkspace({
  career,
  progress,
  updateProgress,
  openNote,
}: {
  career: CareerWorkspaceData;
  progress: CareerWorkspaceProgress;
  updateProgress: (updater: (previous: CareerWorkspaceProgress) => CareerWorkspaceProgress) => void;
  openNote: (contextType: CareerNote["contextType"], contextId: string, contextLabel: string) => void;
}) {
  const [evidence, setEvidence] = useState<EvidenceState>(EMPTY);
  const [activeProjectId, setActiveProjectId] = useState(career.projects[0]?.id ?? "");
  const [draft, setDraft] = useState<ProjectSubmission>(() => defaultSubmission(career.projects[0]?.id ?? ""));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { setEvidence(loadEvidence(career.slug)); }, [career.slug]);
  const project = useMemo(() => career.projects.find((item) => item.id === activeProjectId) ?? career.projects[0], [activeProjectId, career.projects]);
  useEffect(() => {
    if (!project) return;
    setDraft(evidence.submissions[project.id] ?? defaultSubmission(project.id));
  }, [evidence.submissions, project]);

  if (!project) return <p className="text-sm text-slate-400">No guided projects are configured for this career yet.</p>;

  function persist(next: EvidenceState) { setEvidence(next); saveEvidence(career.slug, next); }
  function selectProject(next: CareerProject) { setActiveProjectId(next.id); setMessage(""); }

  async function submitForReview() {
    const errors = validateProjectSubmission(project, draft);
    if (errors.length) { setMessage(errors[0]); return; }
    setBusy(true); setMessage("");
    const submission = { ...draft, submittedAt: new Date().toISOString() };
    const withSubmission = { ...evidence, submissions: { ...evidence.submissions, [project.id]: submission } };
    persist(withSubmission);
    try {
      const response = await fetch("/api/project-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ careerTitle: career.title, project, submission }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.review) throw new Error(payload.error || "Review failed.");
      const review = payload.review as ProjectReview;
      persist({ ...withSubmission, reviews: { ...withSubmission.reviews, [project.id]: review } });
      updateProgress((previous) => ({
        ...previous,
        completedProjects: review.passed
          ? (previous.completedProjects.includes(project.id) ? previous.completedProjects : [...previous.completedProjects, project.id])
          : previous.completedProjects.filter((id) => id !== project.id),
      }));
      setMessage(review.passed ? `Project evidence passed at ${review.overallScore}%.` : `Review score ${review.overallScore}%. Improve the evidence and resubmit.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Project review failed.");
    } finally { setBusy(false); }
  }

  const currentReview = evidence.reviews[project.id];
  const qualifiedCount = career.projects.filter((item) => evidence.reviews[item.id]?.passed).length;

  return (
    <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/[.05] p-4">
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-cyan-300">Proof of skill</p>
          <p className="mt-2 text-2xl font-semibold text-white">{qualifiedCount}/{career.projects.length}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">Projects count toward Job Readiness only after a rubric review scores at least {PROJECT_PASSING_SCORE}%.</p>
        </div>
        {career.projects.map((item, index) => {
          const review = evidence.reviews[item.id];
          return <button key={item.id} type="button" onClick={() => selectProject(item)} className={`w-full rounded-xl border p-3 text-left ${item.id === project.id ? "border-cyan-300/40 bg-cyan-400/[.08]" : "border-white/10 bg-white/[.03]"}`}>
            <span className="text-xs text-slate-500">Project {index + 1} · {item.difficulty}</span>
            <span className="mt-1 block text-sm font-semibold text-white">{item.title}</span>
            <span className={`mt-2 inline-block text-xs ${review?.passed ? "text-emerald-300" : review ? "text-amber-300" : "text-slate-500"}`}>{review ? `${review.overallScore}% · ${review.level}` : "Not reviewed"}</span>
          </button>;
        })}
      </div>

      <div className="space-y-5">
        <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-indigo-300">Real-world brief</p><h3 className="mt-2 text-2xl font-semibold text-white">{project.title}</h3><p className="mt-2 text-sm text-slate-400">{project.estimatedTime} · {project.difficulty}</p></div>
            <button type="button" onClick={() => openNote("project", project.id, project.title)} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200">Project note</button>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">{project.description}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div><h4 className="text-sm font-semibold text-white">Required deliverables</h4><ul className="mt-2 space-y-2 text-sm text-slate-400">{project.deliverables.map((item) => <li key={item}>• {item}</li>)}</ul></div>
            <div><h4 className="text-sm font-semibold text-white">Skills to demonstrate</h4><div className="mt-2 flex flex-wrap gap-2">{project.skills.map((skill) => <span key={skill} className="tag">{skill}</span>)}</div></div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <h4 className="text-lg font-semibold text-white">Submit your evidence</h4>
          <p className="mt-1 text-sm text-slate-400">Describe your decisions and results. The reviewer is instructed not to infer work you do not demonstrate.</p>
          <div className="mt-4 grid gap-4">
            <label className="text-sm text-slate-300">What you built and why<textarea value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white" placeholder="Problem, approach, users/business context, architecture..." /></label>
            <div className="grid gap-4 md:grid-cols-2"><label className="text-sm text-slate-300">Artifact/demo URL<input value={draft.artifactUrl ?? ""} onChange={(e) => setDraft({ ...draft, artifactUrl: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white" placeholder="https://..." /></label><label className="text-sm text-slate-300">Repository URL<input value={draft.repositoryUrl ?? ""} onChange={(e) => setDraft({ ...draft, repositoryUrl: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white" placeholder="https://github.com/..." /></label></div>
            <label className="text-sm text-slate-300">Concrete evidence and results<textarea value={draft.evidence} onChange={(e) => setDraft({ ...draft, evidence: e.target.value })} rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white" placeholder="Tests, metrics, screenshots, outputs, validation, measurable outcome..." /></label>
            <label className="text-sm text-slate-300">Limitations and trade-offs<textarea value={draft.limitations} onChange={(e) => setDraft({ ...draft, limitations: e.target.value })} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white" placeholder="What is incomplete, risky, simplified, or would change in production?" /></label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" disabled={busy} onClick={() => void submitForReview()} className="btn-primary min-h-11">{busy ? "Reviewing evidence..." : currentReview ? "Resubmit for review" : "Submit for AI review"}</button>{message ? <p role="status" className="text-sm text-cyan-200">{message}</p> : null}</div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-cyan-300">Hiring rubric</p><h4 className="mt-1 text-lg font-semibold text-white">Evidence quality review</h4></div>{currentReview ? <div className="text-right"><p className="text-3xl font-semibold text-white">{currentReview.overallScore}%</p><p className={currentReview.passed ? "text-xs text-emerald-300" : "text-xs text-amber-300"}>{currentReview.level}</p></div> : null}</div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">{PROJECT_RUBRIC.map((criterion) => { const result = currentReview?.criteria.find((item) => item.id === criterion.id); return <div key={criterion.id} className="rounded-xl border border-white/10 bg-white/[.03] p-3"><p className="text-sm font-semibold text-white">{criterion.label}</p><p className="mt-1 text-xs text-slate-500">Weight {criterion.weight}%</p>{result ? <><p className="mt-3 text-xl font-semibold text-cyan-200">{result.score}%</p><p className="mt-2 text-xs leading-5 text-slate-400">{result.feedback}</p></> : <p className="mt-3 text-xs leading-5 text-slate-500">{criterion.description}</p>}</div>; })}</div>
          {currentReview ? <div className="mt-5 grid gap-4 md:grid-cols-2"><div><h5 className="text-sm font-semibold text-emerald-200">Strengths</h5><ul className="mt-2 space-y-2 text-sm text-slate-400">{currentReview.strengths.map((item) => <li key={item}>• {item}</li>)}</ul></div><div><h5 className="text-sm font-semibold text-amber-200">Improve next</h5><ul className="mt-2 space-y-2 text-sm text-slate-400">{currentReview.improvements.map((item) => <li key={item}>• {item}</li>)}</ul></div><div className="md:col-span-2 rounded-xl border border-indigo-300/15 bg-indigo-400/[.05] p-4"><p className="text-xs font-semibold uppercase tracking-[.12em] text-indigo-300">Recruiter summary</p><p className="mt-2 text-sm leading-6 text-slate-300">{currentReview.recruiterSummary}</p></div></div> : null}
        </section>
      </div>
    </div>
  );
}
