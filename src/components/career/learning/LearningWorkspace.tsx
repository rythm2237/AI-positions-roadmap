"use client";

import { motion, useReducedMotion } from "framer-motion";
import ReferenceLearningChooser from "@/components/career/resources/ReferenceLearningChooser";
import { EffortEstimate } from "@/components/career/EffortEstimate";
import { isQualifiedResult } from "@/lib/assessmentPolicy";
import {
  getJourneyStageProgress,
  isJourneyAssessmentUnlocked,
  isJourneyStageUnlocked,
} from "@/lib/careerWorkspaceProgress";
import { resolveCareerStepReferences } from "@/lib/references/referenceResolver";
import type {
  CareerJourneyStage,
  CareerNote,
  CareerWorkspaceData,
  CareerWorkspaceProgress,
} from "@/types/careerWorkspace";

type Props = {
  career: CareerWorkspaceData;
  progress: CareerWorkspaceProgress;
  selectedStageId: string;
  onSelectStage: (id: string) => void;
  onOpenNote: (
    type: CareerNote["contextType"],
    id: string,
    label: string
  ) => void;
  onOpenAssessment: (
    stage: CareerJourneyStage,
    kind: "section" | "phase"
  ) => void;
  onViewResource: (id: string) => void;
};

export default function LearningWorkspace({
  career,
  progress,
  selectedStageId,
  onSelectStage,
  onOpenNote,
  onOpenAssessment,
  onViewResource,
}: Props) {
  const reduceMotion = useReducedMotion();

  const current =
    career.journeyStages.find((stage) => stage.id === selectedStageId) ??
    career.journeyStages[0];

  if (!current) {
    return (
      <section className="grid h-full place-items-center p-8 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Learning content is being prepared.
          </h1>
          <p className="mt-2 text-slate-400">
            This career has no Journey steps yet.
          </p>
        </div>
      </section>
    );
  }

  const unlocked = isJourneyStageUnlocked(current.id, career, progress);
  const resources = resolveCareerStepReferences(
    current.resources.map((item) => item.id)
  );

  const completed = career.journeyStages.filter(
    (stage) => isQualifiedResult(progress.assessmentResults[stage.test.id])
  ).length;

  const overall = Math.round(
    (completed / career.journeyStages.length) * 100
  );

  const phaseAssessmentUnlocked = isJourneyAssessmentUnlocked(
    current.id,
    "phase",
    career,
    progress
  );

  const allComplete = career.journeyStages.every(
    (stage) => isQualifiedResult(progress.assessmentResults[stage.test.id])
  );

  return (
    <motion.section
      className="h-full w-full min-w-0 max-w-full overflow-x-hidden overflow-y-auto px-4 pb-28 pt-5 lg:px-8 lg:pb-8"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="mx-auto max-w-7xl rounded-3xl border border-violet-300/15 bg-[radial-gradient(circle_at_15%_0%,rgba(124,58,237,.24),transparent_38%),rgba(2,6,23,.76)] p-5 shadow-premium sm:p-7">
        <p className="eyebrow">
          {career.title} · Shared Career Journey
        </p>

        <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl font-semibold text-white sm:text-5xl">
              Learning cockpit
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Build capability step by step. Every module below is the
              matching Roadmap station, using the same stable ID and progress
              record.
            </p>
          </div>

          <div className="min-w-48">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Journey verified</span>
              <span>{overall}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400"
                style={{ width: `${overall}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div
        className="mx-auto mt-5 max-w-7xl overflow-x-auto"
        aria-label="Learning phases"
      >
        <div className="flex min-w-max gap-2 pb-2" role="tablist">
          {career.journeyStages.map((stage) => {
            const available = isJourneyStageUnlocked(
              stage.id,
              career,
              progress
            );
            const passed = isQualifiedResult(
              progress.assessmentResults[stage.test.id]
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
                <span className="mr-2">
                  {passed ? "✓" : available ? stage.order : "🔒"}
                </span>
                {stage.label ?? stage.title}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-3 grid min-w-0 max-w-7xl gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="min-w-0 space-y-4">
          <article className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="label-sm text-cyan-300">
                  Roadmap step · {current.id}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {current.title}
                </h2>
              </div>
              <span
                className={`tag ${
                  unlocked ? "tag-cyan" : "tag-amber"
                }`}
              >
                {unlocked ? "Available" : "Locked · view only"}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              {current.explanation}
            </p>

            {!unlocked ? (
              <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-400/10 p-3 text-sm text-amber-100">
                Complete the previous Roadmap station’s Section Check to
                unlock actions. Objectives and requirements remain available
                for planning.
              </p>
            ) : null}

            <div className="mt-5 grid gap-3 lg:grid-cols-[2fr_1fr_1fr]">
              <EffortEstimate estimate={current.estimatedEffort} />
              <Info label="Required level" value="Intermediate" />
              <Info
                label="Step progress"
                value={`${getJourneyStageProgress(
                  current.id,
                  career,
                  progress
                )}%`}
              />
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <h3 className="text-lg font-semibold text-white">
              Learning objectives
            </h3>
            <ul className="mt-3 space-y-2">
              {current.lessons.length ? (
                current.lessons.map((lesson) => (
                  <li
                    key={lesson}
                    className="flex gap-3 text-sm leading-6 text-slate-300"
                  >
                    <span className="text-cyan-300">◇</span>
                    {lesson}
                  </li>
                ))
              ) : (
                <li className="text-sm text-amber-200">
                  This step is missing required learning-objective metadata.
                </li>
              )}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Trusted resources
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Choose reading, video, or hands-on practice before opening the exact learning
                  destination.
                </p>
              </div>
              <span className="tag">Registry resolved</span>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {resources.length ? (
                resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="rounded-2xl border border-white/10 bg-white/[.035] p-4"
                  >
                    <p className="text-xs uppercase tracking-wider text-violet-300">
                      {resource.type} · {resource.provider}
                    </p>
                    <h4 className="mt-2 font-semibold text-white">
                      {resource.title}
                    </h4>
                    <p className="mt-2 text-sm leading-5 text-slate-400">
                      {resource.description}
                    </p>
                    {resource.warning ? (
                      <p className="mt-2 text-xs text-amber-200">
                        {resource.warning}
                      </p>
                    ) : null}

                    <ReferenceLearningChooser
                      resource={resource}
                      disabled={!unlocked}
                      onOpen={() => onViewResource(resource.id)}
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-amber-200">
                  Resources need review. No valid Registry references are
                  mapped to this step.
                </p>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <h3 className="text-lg font-semibold text-white">
              Section Check
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Answer {current.test.questions.length} stored questions. A
              score of {current.test.passingScore}% verifies this same
              Roadmap step.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!unlocked}
                onClick={() => onOpenAssessment(current, "section")}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isQualifiedResult(progress.assessmentResults[current.test.id])
                  ? "Qualified · Retry Section Check"
                  : "Start Section Check"}
              </button>
              <button
                type="button"
                onClick={() =>
                  onOpenNote("step", current.id, current.title)
                }
                className="btn-secondary"
              >
                Open step notes
              </button>
            </div>
          </article>
        </main>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-cyan-300/15 bg-slate-950/75 p-5 xl:sticky xl:top-5">
            <p className="label-sm text-cyan-300">Current focus</p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              {current.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {current.summary}
            </p>
            <div className="mt-4 space-y-2">
              {current.tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-white/10 p-3"
                >
                  <p className="text-sm font-medium text-white">
                    {task.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {task.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/75 p-5">
            <h3 className="font-semibold text-white">
              Phase assessment
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Unlocks after this phase’s required step is verified.
            </p>
            <button
              type="button"
              disabled={!phaseAssessmentUnlocked || !current.phaseExam}
              onClick={() => onOpenAssessment(current, "phase")}
              className="btn-secondary mt-3 w-full disabled:opacity-40"
            >
              {current.phaseExam
                ? "Start phase assessment"
                : "Assessment not available yet"}
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/75 p-5">
            <p className="label-sm text-violet-300">
              Career OS Role Validation
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Non-official final role assessment. Unlocks when every
              required Roadmap station is verified.
            </p>
            <button
              type="button"
              disabled={!allComplete}
              className="btn-secondary mt-3 w-full disabled:opacity-40"
            >
              {allComplete
                ? "Begin role validation"
                : "Final assessment locked"}
            </button>
          </div>
        </aside>
      </div>
    </motion.section>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[.035] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
