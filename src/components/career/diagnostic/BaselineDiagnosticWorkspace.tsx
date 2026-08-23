"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adaptiveDiagnosticStorageKey,
  buildBaselineDiagnostic,
  scoreBaselineDiagnostic,
  type BaselineDiagnosticResult,
} from "@/lib/adaptiveDiagnostic";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

export default function BaselineDiagnosticWorkspace({ career }: { career: CareerWorkspaceData }) {
  const questions = useMemo(() => buildBaselineDiagnostic(career), [career]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<BaselineDiagnosticResult | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(adaptiveDiagnosticStorageKey(career.slug));
      if (raw) setResult(JSON.parse(raw));
    } catch {
      setResult(null);
    }
  }, [career.slug]);

  function submit() {
    if (!questions.length) return;
    const next = scoreBaselineDiagnostic(career, questions, answers);
    setResult(next);
    try {
      localStorage.setItem(adaptiveDiagnosticStorageKey(career.slug), JSON.stringify(next));
    } catch {}
    setOpen(false);
  }

  const answered = Object.keys(answers).length;
  const recommended = result?.stageResults.find((stage) => stage.stageId === result.recommendedStartStageId);

  return (
    <div className="mt-5 rounded-xl border border-violet-300/15 bg-violet-400/[0.04] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-300">Baseline skill diagnostic</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Start from demonstrated knowledge, not self-report alone.</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">A short placement test samples existing career assessments and adapts the roadmap. It never auto-passes formal assessments or creates proof-of-skill.</p>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className="min-h-10 rounded-lg border border-violet-300/20 px-3 py-2 text-xs font-semibold text-violet-100 hover:bg-violet-400/10">
          {open ? "Close diagnostic" : result ? "Retake diagnostic" : "Start diagnostic"}
        </button>
      </div>

      {result && !open ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-[180px_1fr]">
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
            <p className="text-xs text-slate-500">Baseline score</p>
            <p className="mt-1 text-3xl font-semibold text-white">{result.overallScore}%</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">Placement signal only</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">Adaptive start</p>
            <p className="mt-1 font-semibold text-white">{recommended?.stageTitle ?? "Review the first validated stage"}</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">{recommended?.recommendation ?? "Use the stage recommendations below to choose the next formal validation step."}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.stageResults.map((stage) => (
                <span key={stage.stageId} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">{stage.stageTitle}: {stage.score}% · {stage.placement}</span>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {open ? (
        <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
          {questions.length === 0 ? <p className="text-sm text-slate-400">This career does not yet have enough assessment questions for a baseline diagnostic.</p> : questions.map((question, index) => (
            <fieldset key={question.id} className="rounded-xl border border-white/10 bg-slate-950/45 p-4">
              <legend className="px-1 text-xs font-semibold text-slate-500">Question {index + 1} · {question.stageTitle}</legend>
              <p className="mt-2 text-sm font-semibold leading-6 text-white">{question.question}</p>
              <div className="mt-3 grid gap-2">
                {question.answers.map((answer, answerIndex) => (
                  <label key={`${question.id}-${answerIndex}`} className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm ${answers[question.id] === answerIndex ? "border-cyan-300/35 bg-cyan-300/[0.06] text-white" : "border-white/10 text-slate-300"}`}>
                    <input type="radio" name={question.id} checked={answers[question.id] === answerIndex} onChange={() => setAnswers((previous) => ({ ...previous, [question.id]: answerIndex }))} />
                    <span>{answer}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          {questions.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">Answered {answered}/{questions.length}. Complete all questions for the most reliable placement.</p>
              <button type="button" disabled={answered !== questions.length} onClick={submit} className="rounded-xl bg-violet-300 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">Build adaptive roadmap</button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
