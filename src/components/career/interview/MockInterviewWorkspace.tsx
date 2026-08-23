"use client";

import { useEffect, useMemo, useState } from "react";
import { getReviewableInterviewQuestions } from "@/lib/careerInterviewQuality";
import { interviewEvidenceStorageKey, INTERVIEW_RUBRIC, validateInterviewAnswer, type InterviewAnswerReview } from "@/lib/interviewEvidence";
import { projectEvidenceStorageKey, type ProjectReview, type ProjectSubmission } from "@/lib/projectEvidence";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

type StoredInterview = {
  answers: Record<string, string>;
  reviews: Record<string, InterviewAnswerReview>;
};

type ProjectEvidenceState = {
  submissions?: Record<string, ProjectSubmission>;
  reviews?: Record<string, ProjectReview>;
};

const EMPTY: StoredInterview = { answers: {}, reviews: {} };

export default function MockInterviewWorkspace({ career }: { career: CareerWorkspaceData }) {
  const questions = useMemo(() => getReviewableInterviewQuestions(career.title, career.interviewPrep.questions), [career]);
  const [state, setState] = useState<StoredInterview>(EMPTY);
  const [activeIndex, setActiveIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(interviewEvidenceStorageKey(career.slug));
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      setState(EMPTY);
    }
  }, [career.slug]);

  const question = questions[activeIndex] ?? "";
  const questionId = `interview-${activeIndex + 1}`;
  const answer = state.answers[questionId] ?? "";
  const review = state.reviews[questionId];
  const reviewed = Object.values(state.reviews);
  const overall = reviewed.length ? Math.round(reviewed.reduce((sum, item) => sum + item.overallScore, 0) / reviewed.length) : 0;

  function persist(next: StoredInterview) {
    setState(next);
    try { localStorage.setItem(interviewEvidenceStorageKey(career.slug), JSON.stringify(next)); } catch {}
  }

  function updateAnswer(value: string) {
    persist({ ...state, answers: { ...state.answers, [questionId]: value } });
  }

  function evidenceContext() {
    try {
      const raw = localStorage.getItem(projectEvidenceStorageKey(career.slug));
      if (!raw) return "";
      const projectEvidence = JSON.parse(raw) as ProjectEvidenceState;
      return career.projects
        .filter((project) => projectEvidence.reviews?.[project.id]?.passed)
        .map((project) => {
          const submission = projectEvidence.submissions?.[project.id];
          const projectReview = projectEvidence.reviews?.[project.id];
          return `${project.title}: score ${projectReview?.overallScore ?? 0}; ${submission?.summary ?? ""}; evidence: ${submission?.evidence ?? ""}`;
        })
        .join("\n");
    } catch {
      return "";
    }
  }

  async function submit() {
    const validation = validateInterviewAnswer(answer);
    if (validation) { setMessage(validation); return; }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/interview-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ careerTitle: career.title, questionId, question, answer, evidenceContext: evidenceContext() }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.review) throw new Error(payload.error || "Interview review failed.");
      const next = { ...state, reviews: { ...state.reviews, [questionId]: payload.review as InterviewAnswerReview } };
      persist(next);
      setMessage(payload.review.passed ? `Answer passed at ${payload.review.overallScore}%.` : `Score ${payload.review.overallScore}%. Improve and retry.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Interview review failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Role-specific mock interview</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Practice like a real {career.title} interview.</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Answers are scored on relevance, verified evidence, depth, clarity and reflection. Unsupported claims are not rewarded.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/60 px-5 py-4 text-right">
            <p className="text-xs text-slate-500">Interview readiness</p>
            <p className="text-3xl font-semibold text-white">{overall}%</p>
            <p className="mt-1 text-xs text-slate-500">{reviewed.length}/{questions.length} reviewed</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-2">
          {questions.map((item, index) => {
            const result = state.reviews[`interview-${index + 1}`];
            return <button key={`${index}-${item}`} type="button" onClick={() => { setActiveIndex(index); setMessage(""); }} className={`w-full rounded-xl border p-3 text-left ${index === activeIndex ? "border-cyan-300/40 bg-cyan-400/[.08]" : "border-white/10 bg-white/[.03]"}`}>
              <span className="text-xs text-slate-500">Question {index + 1}</span>
              <span className="mt-1 block line-clamp-2 text-sm font-semibold text-white">{item}</span>
              <span className={`mt-2 inline-block text-xs ${result?.passed ? "text-emerald-300" : result ? "text-amber-300" : "text-slate-500"}`}>{result ? `${result.overallScore}%` : "Not reviewed"}</span>
            </button>;
          })}
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-300">Interview question</p>
            <h4 className="mt-2 text-xl font-semibold leading-8 text-white">{question}</h4>
            <textarea value={answer} onChange={(e) => updateAnswer(e.target.value)} rows={10} placeholder="Answer as you would in the interview. Use concrete examples, decisions, trade-offs and outcomes you can actually support." className="mt-5 w-full rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none focus:border-cyan-300/40" />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => void submit()} disabled={busy} className="btn-primary min-h-11">{busy ? "Reviewing answer..." : review ? "Resubmit for scoring" : "Submit for scoring"}</button>
              {message ? <p role="status" className="text-sm text-cyan-200">{message}</p> : null}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">Interview rubric</p><h4 className="mt-1 text-lg font-semibold text-white">Role-specific answer scoring</h4></div>
              {review ? <div className="text-right"><p className="text-3xl font-semibold text-white">{review.overallScore}%</p><p className={review.passed ? "text-xs text-emerald-300" : "text-xs text-amber-300"}>{review.reviewer === "ai" ? "AI reviewed" : "Fallback review"}</p></div> : null}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">{INTERVIEW_RUBRIC.map((criterion) => { const result = review?.criteria.find((item) => item.id === criterion.id); return <div key={criterion.id} className="rounded-xl border border-white/10 bg-white/[.03] p-3"><p className="text-sm font-semibold text-white">{criterion.label}</p><p className="mt-1 text-xs text-slate-500">Weight {criterion.weight}%</p>{result ? <><p className="mt-3 text-xl font-semibold text-cyan-200">{result.score}%</p><p className="mt-2 text-xs leading-5 text-slate-400">{result.feedback}</p></> : <p className="mt-3 text-xs leading-5 text-slate-500">{criterion.description}</p>}</div>; })}</div>
            {review ? <div className="mt-5 grid gap-4 md:grid-cols-2"><div><p className="text-sm font-semibold text-emerald-200">Strengths</p><ul className="mt-2 space-y-2 text-sm text-slate-400">{review.strengths.map((item) => <li key={item}>• {item}</li>)}</ul></div><div><p className="text-sm font-semibold text-amber-200">Improve next</p><ul className="mt-2 space-y-2 text-sm text-slate-400">{review.improvements.map((item) => <li key={item}>• {item}</li>)}</ul></div><div className="md:col-span-2 rounded-xl border border-indigo-300/15 bg-indigo-400/[.05] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-300">Interviewer summary</p><p className="mt-2 text-sm leading-6 text-slate-300">{review.interviewerSummary}</p></div></div> : null}
          </section>
        </div>
      </section>
    </div>
  );
}
