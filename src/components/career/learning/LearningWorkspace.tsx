"use client";

import { motion, useReducedMotion } from "framer-motion";
import ReferenceLearningChooser from "@/components/career/resources/ReferenceLearningChooser";
import { EffortEstimate } from "@/components/career/EffortEstimate";
import { isAssessmentQualified } from "@/lib/assessmentPolicy";
import {
  getJourneyStageProgress,
  isJourneyAssessmentUnlocked,
  isJourneyStageUnlocked,
} from "@/lib/careerWorkspaceProgress";
import { resolveReference } from "@/lib/references/referenceResolver";
import type {
  CareerAssessment,
  CareerNote,
  CareerWorkspaceData,
  CareerWorkspaceProgress,
} from "@/types/careerWorkspace";

type Props = {
  career: CareerWorkspaceData;
  progress: CareerWorkspaceProgress;
  selectedStageId: string;
  onSelectStage: (id: string) => void;
  onOpenNote: (type: CareerNote["contextType"], id: string, label: string) => void;
  onOpenAssessment: (assessment: CareerAssessment, stageId: string) => void;
  onViewResource: (id: string) => void;
};

export default function LearningWorkspace(props: Props) {
  const {
    career,
    progress,
    selectedStageId,
    onSelectStage,
    onOpenNote,
    onOpenAssessment,
    onViewResource,
  } = props;
  const reduceMotion = useReducedMotion();
  const stageIndex = Math.max(
    0,
    career.journeyStages.findIndex((stage) => stage.id === selectedStageId),
  );
  const current = career.journeyStages[stageIndex] ?? career.journeyStages[0];

  if (!current) {
    return (
      <section className="grid h-full place-items-center p-8 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Learning content is being prepared.</h1>
          <p className="mt-2 text-slate-400">This career has no Journey steps yet.</p>
        </div>
      </section>
    );
  }

  const unlocked = isJourneyStageUnlocked(current.id, career, progress);
  const stageProgress = getJourneyStageProgress(current.id, career, progress);
  const previous = career.journeyStages[stageIndex - 1];
  const next = career.journeyStages[stageIndex + 1];
  const checkpointUnlocked = isJourneyAssessmentUnlocked(
    current.id,
    "comprehensive",
    career,
    progress,
  );
  const completedStages = career.journeyStages.filter((stage) =>
    Boolean(
      stage.phaseExam &&
        isAssessmentQualified(
          stage.phaseExam,
          progress.assessmentResults[stage.phaseExam.id],
        ),
    ),
  ).length;
  const overall = Math.round(
    (completedStages / Math.max(1, career.journeyStages.length)) * 100,
  );

  return (
    <motion.section
      className="h-full w-full min-w-0 overflow-x-hidden overflow-y-auto px-4 pb-28 pt-4 lg:px-7 lg:pb-8"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="mx-auto max-w-7xl pb-3">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#070a18]/92 px-4 py-3 shadow-xl backdrop-blur-xl">
          <button
            type="button"
            disabled={!previous}
            onClick={() => previous && onSelectStage(previous.id)}
            className="min-h-10 rounded-xl border border-white/10 px-3 text-sm font-semibold text-slate-300 disabled:opacity-30"
          >
            ← Previous
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-violet-300">
              Stage {current.order} of {career.journeyStages.length}
            </p>
            <p className="truncate text-sm font-semibold text-white">{current.title}</p>
          </div>
          <button
            type="button"
            disabled={!next || !isJourneyStageUnlocked(next.id, career, progress)}
            onClick={() => next && onSelectStage(next.id)}
            className="min-h-10 rounded-xl border border-white/10 px-3 text-sm font-semibold text-slate-300 disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      </div>

      <header className="mx-auto max-w-7xl rounded-3xl border border-violet-300/15 bg-[radial-gradient(circle_at_15%_0%,rgba(124,58,237,.22),transparent_42%),rgba(2,6,23,.78)] p-5 shadow-premium sm:p-7">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="eyebrow">{career.title} · Learning Journey</p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-5xl">
              {current.title}
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">{current.explanation}</p>
          </div>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/15 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Step progress</span><span>{stageProgress}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400" style={{ width: `${stageProgress}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {completedStages} of {career.journeyStages.length} stages verified · {overall}% overall
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-[2fr_1fr_auto]">
          <EffortEstimate estimate={current.estimatedEffort} />
          <Info label="Required level" value="Intermediate" />
          <button type="button" onClick={() => onOpenNote("step", current.id, current.title)} className="btn-secondary min-h-11 self-stretch">Step notes</button>
        </div>
      </header>

      <div className="mx-auto mt-4 max-w-7xl overflow-x-auto" aria-label="Learning stages">
        <div className="flex min-w-max gap-2 pb-2" role="tablist">
          {career.journeyStages.map((stage) => {
            const available = isJourneyStageUnlocked(stage.id, career, progress);
            const passed = Boolean(
              stage.phaseExam &&
                isAssessmentQualified(
                  stage.phaseExam,
                  progress.assessmentResults[stage.phaseExam.id],
                ),
            );
            return (
              <button
                key={stage.id}
                type="button"
                role="tab"
                aria-selected={stage.id === current.id}
                onClick={() => onSelectStage(stage.id)}
                className={`min-h-11 rounded-xl border px-4 text-left text-xs font-semibold ${
                  stage.id === current.id
                    ? "border-cyan-300/50 bg-cyan-400/10 text-white"
                    : passed
                      ? "border-emerald-300/25 text-emerald-200"
                      : "border-white/10 text-slate-400"
                }`}
              >
                <span className="mr-2">{passed ? "✓" : available ? stage.order : "🔒"}</span>
                {stage.label ?? stage.title}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-3 grid max-w-7xl gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <main className="min-w-0 space-y-4">
          <article className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <p className="label-sm text-cyan-300">Mission</p>
            <h2 className="mt-2 text-xl font-semibold text-white">What you will accomplish</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{current.summary}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {current.lessons.map((lesson) => (
                <li key={lesson} className="flex gap-3 rounded-xl border border-white/8 bg-white/[.025] p-3 text-sm leading-6 text-slate-300">
                  <span className="text-cyan-300">◇</span>{lesson}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="label-sm text-violet-300">Learn → Apply → Check</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Your learning path</h2>
                <p className="mt-1 text-xs text-slate-500">Official resources remain visible even before they are added to the central Registry.</p>
              </div>
              <span className="tag">{current.resources.length} milestones</span>
            </div>

            <div className="mt-6 space-y-4">
              {current.resources.map((source, resourceIndex) => {
                const registry = resolveReference(source.id, true);
                const assessment = (current.topicAssessments ?? []).find(
                  (item) => item.topicId === source.id,
                );
                const result = assessment
                  ? progress.assessmentResults[assessment.id]
                  : undefined;
                const qualified = Boolean(
                  assessment && isAssessmentQualified(assessment, result),
                );

                return (
                  <motion.div
                    key={source.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018))]"
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: resourceIndex * 0.04 }}
                  >
                    <div className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-violet-300">
                            {registry?.type ?? source.type} · {registry?.provider ?? source.provider}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-white">
                            {registry?.title ?? source.title}
                          </h3>
                        </div>
                        <span className={qualified ? "tag tag-cyan" : "tag"}>
                          {qualified ? "Completed" : source.priority}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {registry?.description ?? source.whyUseful}
                      </p>
                      <div className="mt-4">
                        {registry ? (
                          <ReferenceLearningChooser
                            resource={registry}
                            disabled={!unlocked}
                            onOpen={() => onViewResource(source.id)}
                          />
                        ) : (
                          <a
                            href={unlocked ? source.url : undefined}
                            target="_blank"
                            rel="noreferrer"
                            aria-disabled={!unlocked}
                            onClick={(event) => {
                              if (!unlocked) {
                                event.preventDefault();
                                return;
                              }
                              onViewResource(source.id);
                            }}
                            className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                              unlocked
                                ? "border-violet-300/30 bg-violet-500/12 text-violet-100 hover:bg-violet-500/20"
                                : "cursor-not-allowed border-white/8 text-slate-600"
                            }`}
                          >
                            Open official resource ↗
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-white/10 bg-slate-950/45 p-5">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <p className="label-sm text-cyan-300">Knowledge check</p>
                          <p className="mt-1 text-sm text-slate-300">Five questions · 60% required</p>
                          {result ? <p className={`mt-1 text-xs ${qualified ? "text-emerald-300" : "text-rose-300"}`}>{qualified ? "Passed" : "Review and try again"} · {result.score}%</p> : null}
                        </div>
                        <button
                          type="button"
                          disabled={!unlocked || !assessment}
                          onClick={() => assessment && onOpenAssessment(assessment, current.id)}
                          className="btn-primary min-h-11 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {qualified ? "Try a new check" : "Start check"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </article>

          <article className="rounded-3xl border border-violet-300/15 bg-slate-950/75 p-5 sm:p-6">
            <p className="label-sm text-violet-300">Step checkpoint</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Comprehensive step assessment</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Pass every milestone check to unlock the final assessment and next stage.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" disabled={!checkpointUnlocked || !current.phaseExam} onClick={() => current.phaseExam && onOpenAssessment(current.phaseExam, current.id)} className="btn-primary min-h-11 disabled:opacity-40">Start step assessment</button>
              <button type="button" onClick={() => onOpenNote("step", current.id, current.title)} className="btn-secondary min-h-11">Add reflection note</button>
            </div>
          </article>
        </main>

        <aside className="min-w-0">
          <div className="xl:sticky xl:top-[78px] xl:max-h-[calc(100dvh-96px)] xl:overflow-y-auto xl:pr-1">
            <div className="rounded-3xl border border-cyan-300/15 bg-slate-950/78 p-5">
              <p className="label-sm text-cyan-300">Current focus</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{current.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{current.summary}</p>
              <div className="mt-5 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-600">Practical checklist</p>
                {current.tasks.map((task) => (
                  <div key={task.id} className="rounded-xl border border-white/10 p-3">
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{task.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </motion.section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[.035] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
