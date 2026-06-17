"use client";
// src/components/roadmap/RoadmapHeader.tsx
// Hero header for the roadmap detail page.
// Shows title, description, meta, progress summary, and primary CTAs.
// Block 3: accepts optional resetSlot for RoadmapResetButton injection.

import { ReactNode } from "react";
import { Roadmap, ProgressState } from "@/types/roadmap";
// Import directly from roadmapUtils — avoids Turbopack circular re-export issue
import { calculateProgress } from "@/lib/roadmapUtils";

interface RoadmapHeaderProps {
  roadmap: Roadmap;
  progress: ProgressState;
  /** Optional slot for the reset button — injected from the client wrapper */
  resetSlot?: ReactNode;
}

const levelColour: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700",
  "Beginner to Intermediate": "bg-yellow-100 text-yellow-700",
  Intermediate: "bg-orange-100 text-orange-700",
  Advanced: "bg-red-100 text-red-700",
};

export default function RoadmapHeader({
  roadmap,
  progress,
  resetSlot,
}: RoadmapHeaderProps) {
  const totalSections = (roadmap.phases ?? []).reduce(
    (acc, p) => acc + (p.sections ?? []).length,
    0
  );
  const totalProjects = (roadmap.projects ?? []).length;
  // section tests + phase final tests
  const totalTests = totalSections + (roadmap.phases ?? []).length;
  const overallProgress = calculateProgress(
    roadmap.slug,
    progress,
    totalSections,
    totalProjects,
    totalTests
  );
  const completedSections = progress.completedSections.length;

  return (
    <section
      id="overview"
      className="bg-white border-b border-gray-100 px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          {/* ── Left: title + meta ── */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                {roadmap.category}
              </span>
              {roadmap.status === "mvp-ready" ? (
                <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  MVP Ready
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Coming Soon
                </span>
              )}
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  levelColour[roadmap.level] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {roadmap.level}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
              {roadmap.title}
            </h1>

            {/* Description */}
            <p className="mt-3 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
              {roadmap.description}
            </p>

            {/* Meta row */}
            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-gray-500">
              {/* Duration */}
              <span className="flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {roadmap.duration}
              </span>
              {/* Hours */}
              <span className="flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                {roadmap.totalEstimatedHours}h total
              </span>
              {/* Phases + sections */}
              <span className="flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                {roadmap.phases.length} phases · {totalSections} sections
              </span>
            </div>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#phases"
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {overallProgress > 0 ? "Continue Roadmap" : "Start Roadmap"}
              </a>
              <button
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() =>
                  alert("Save to My Learning Plan — coming soon with auth!")
                }
              >
                Save to My Learning Plan
              </button>
              {/* Reset button injected from client wrapper */}
              {resetSlot}
            </div>
          </div>

          {/* ── Right: Progress summary card ── */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
                Your Progress
              </h2>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">
                    Overall completion
                  </span>
                  <span className="text-sm font-bold text-indigo-600">
                    {overallProgress}%
                  </span>
                </div>
                <div
                  className="w-full bg-gray-200 rounded-full h-2.5"
                  role="progressbar"
                  aria-valuenow={overallProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Overall roadmap completion"
                >
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white border border-gray-100 p-3 text-center">
                  <div className="text-xl font-extrabold text-gray-900">
                    {completedSections}
                    <span className="text-xs font-normal text-gray-400">
                      /{totalSections}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Sections</div>
                </div>
                <div className="rounded-xl bg-white border border-gray-100 p-3 text-center">
                  <div className="text-xl font-extrabold text-gray-900">
                    {progress.completedProjects.length}
                    <span className="text-xs font-normal text-gray-400">
                      /{totalProjects}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Projects</div>
                </div>
              </div>

              {/* Phase breakdown */}
              <div className="mt-4 flex flex-col gap-2">
                {roadmap.phases.map((phase) => {
                  const done = phase.sections.filter((s) =>
                    progress.completedSections.includes(s.id)
                  ).length;
                  const total = phase.sections.length;
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  const isLocked = phase.access === "locked";
                  return (
                    <div key={phase.id}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`text-xs font-medium truncate max-w-[160px] ${
                            isLocked ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          P{phase.phaseNumber}: {phase.title}
                        </span>
                        <span
                          className={`text-xs font-semibold shrink-0 ml-2 ${
                            isLocked
                              ? "text-gray-400"
                              : pct === 100
                              ? "text-emerald-600"
                              : "text-indigo-600"
                          }`}
                        >
                          {isLocked ? "🔒" : `${pct}%`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all ${
                            isLocked
                              ? "bg-gray-300"
                              : pct === 100
                              ? "bg-emerald-500"
                              : "bg-indigo-500"
                          }`}
                          style={{ width: `${isLocked ? 0 : pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
