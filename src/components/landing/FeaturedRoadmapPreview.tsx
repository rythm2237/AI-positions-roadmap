// src/components/landing/FeaturedRoadmapPreview.tsx
// Preview of the AI Automation Specialist roadmap with locked/unlocked phases.

import Link from "next/link";
import { aiAutomationRoadmapPreview } from "@/data/careerRoadmaps";
import { RoadmapPhase } from "@/types/career";

function PhaseCard({ phase }: { phase: RoadmapPhase }) {
  const isLocked = phase.access === "locked";

  return (
    <div
      className={`relative flex gap-4 rounded-xl border p-5 transition-colors ${
        isLocked
          ? "border-gray-200 bg-gray-50 opacity-75"
          : "border-indigo-200 bg-white shadow-sm"
      }`}
    >
      {/* Phase number circle */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          isLocked
            ? "bg-gray-200 text-gray-500"
            : "bg-indigo-600 text-white"
        }`}
        aria-hidden="true"
      >
        {phase.phaseNumber}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3
            className={`text-sm font-semibold ${
              isLocked ? "text-gray-500" : "text-gray-900"
            }`}
          >
            Phase {phase.phaseNumber}: {phase.title}
          </h3>

          {isLocked ? (
            <span className="flex items-center gap-1 rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-500">
              {/* Lock icon via SVG — no external library required */}
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
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              Free
            </span>
          )}
        </div>

        <p
          className={`mt-1.5 text-sm leading-relaxed ${
            isLocked ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {isLocked
            ? "Unlock full access to view lessons, projects, and quizzes in this phase."
            : phase.explanation}
        </p>
      </div>
    </div>
  );
}

export default function FeaturedRoadmapPreview() {
  return (
    <section id="preview" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Section header */}
        <div className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-700">
            Featured Roadmap
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            AI Automation Specialist
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-600">
            Get a feel for how the roadmap is structured. Phase 1 is completely
            free — no account required to start.
          </p>
        </div>

        {/* Phase list */}
        <div className="flex flex-col gap-4">
          {aiAutomationRoadmapPreview.map((phase) => (
            <PhaseCard key={phase.phaseNumber} phase={phase} />
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/roadmaps/ai-automation-specialist"
            className="w-full rounded-xl bg-white px-8 py-3.5 text-center text-base font-semibold text-indigo-600 border border-indigo-300 shadow-sm transition-colors hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Start Free Preview
          </Link>
          <Link
            href="/roadmaps/ai-automation-specialist"
            className="w-full rounded-xl bg-indigo-600 px-8 py-3.5 text-center text-base font-semibold text-white shadow-md transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Unlock Full Roadmap
          </Link>
        </div>
      </div>
    </section>
  );
}
