"use client";
// src/components/roadmap/RoadmapTimeline.tsx
// Clean, readable timeline showing all phases with week ranges.
// Each phase row is clickable and links to the phases section.

import { RoadmapPhase, ProgressState } from "@/types/roadmap";

interface RoadmapTimelineProps {
  phases: RoadmapPhase[];
  duration: string;
  progress: ProgressState;
}

function getPhaseCompletion(
  phase: RoadmapPhase,
  progress: ProgressState
): number {
  if (!phase.sections || phase.sections.length === 0) return 0;
  const done = phase.sections.filter((s) =>
    progress.completedSections.includes(s.id)
  ).length;
  return Math.round((done / phase.sections.length) * 100);
}

export default function RoadmapTimeline({
  phases,
  duration,
  progress,
}: RoadmapTimelineProps) {
  if (!phases || phases.length === 0) return null;
  return (
    <section
      id="timeline"
      className="bg-white border-b border-gray-100 px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-1">
              Learning Timeline
            </h2>
            <p className="text-sm text-gray-500">
              Estimated total duration:{" "}
              <strong className="text-gray-700">{duration}</strong>
            </p>
          </div>
        </div>

        <div className="relative">
          {/* Vertical accent line */}
          <div
            className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-4">
            {phases.map((phase) => {
              const completion = getPhaseCompletion(phase, progress);
              const isLocked = phase.access === "locked";

              return (
                <a
                  key={phase.id}
                  href="#phases"
                  className={`group relative flex gap-5 rounded-xl border p-5 transition-all hover:shadow-md ${
                    isLocked
                      ? "border-gray-100 bg-gray-50 opacity-80"
                      : "border-indigo-100 bg-white shadow-sm"
                  }`}
                  aria-label={`${phase.weekRange}: ${phase.title}`}
                >
                  {/* Phase number dot */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold z-10 ${
                      isLocked
                        ? "bg-gray-200 text-gray-400"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    {phase.phaseNumber}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
                          {phase.weekRange}
                        </span>
                        <h3
                          className={`text-base font-bold mt-0.5 ${
                            isLocked ? "text-gray-500" : "text-gray-900"
                          }`}
                        >
                          {phase.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isLocked ? (
                          <span className="flex items-center gap-1 rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-500">
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
                              <rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                                ry="2"
                              />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Premium
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            Free
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {phase.estimatedDuration}
                        </span>
                      </div>
                    </div>

                    <p
                      className={`text-sm leading-relaxed mt-1.5 ${
                        isLocked ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {phase.outcome}
                    </p>

                    {/* Sections count + progress */}
                    <div className="mt-3 flex items-center gap-4">
                      <span className="text-xs text-gray-400">
                        {phase.sections.length} sections
                      </span>
                      {!isLocked && (
                        <div className="flex items-center gap-2 flex-1 max-w-xs">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div
                              className="bg-indigo-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-indigo-600">
                            {completion}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrow hint */}
                  <div className="flex items-center self-center text-gray-300 group-hover:text-indigo-400 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
