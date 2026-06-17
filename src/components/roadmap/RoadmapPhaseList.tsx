// src/components/roadmap/RoadmapPhaseList.tsx
// Renders the full list of roadmap phases with free/locked indicators.
// Shows full explanation for free phases; teaser message for locked ones.

import { RoadmapPhase } from "@/types/career";

interface RoadmapPhaseListProps {
  phases: RoadmapPhase[];
}

function PhaseItem({ phase }: { phase: RoadmapPhase }) {
  const isLocked = phase.access === "locked";

  return (
    <div
      className={`relative flex gap-5 rounded-2xl border p-6 transition-all ${
        isLocked
          ? "border-gray-200 bg-gray-50 opacity-80"
          : "border-indigo-200 bg-white shadow-sm"
      }`}
    >
      {/* Phase number circle */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          isLocked ? "bg-gray-200 text-gray-500" : "bg-indigo-600 text-white"
        }`}
        aria-hidden="true"
      >
        {phase.phaseNumber}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Phase title + access badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h3
            className={`text-base font-bold ${
              isLocked ? "text-gray-500" : "text-gray-900"
            }`}
          >
            Phase {phase.phaseNumber}: {phase.title}
          </h3>

          {isLocked ? (
            <span className="flex items-center gap-1.5 rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Premium
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Free Access
            </span>
          )}
        </div>

        {/* Phase explanation */}
        <p
          className={`text-sm leading-relaxed ${
            isLocked ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {isLocked
            ? "Unlock full access to view all lessons, projects, and quizzes in this phase."
            : phase.explanation}
        </p>

        {/* Free phase — "Start this phase" link */}
        {!isLocked && (
          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 border border-indigo-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Start this phase — Free
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RoadmapPhaseList({ phases }: RoadmapPhaseListProps) {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
          Roadmap Phases
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          Phase 1 is completely free — no account required to start.
        </p>

        {/* Vertical phase list with connector line */}
        <div className="relative flex flex-col gap-4">
          {/* Vertical connector line */}
          <div
            className="absolute left-[2.35rem] top-12 bottom-12 w-0.5 bg-gray-200 -z-10"
            aria-hidden="true"
          />
          {phases.map((phase) => (
            <PhaseItem key={phase.phaseNumber} phase={phase} />
          ))}
        </div>
      </div>
    </section>
  );
}
