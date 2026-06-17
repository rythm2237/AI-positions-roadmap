"use client";
// src/components/roadmap/RoadmapProgressDashboard.tsx
// Floating sticky progress dashboard shown on the roadmap page.
// Appears after the user scrolls past the header (after mount).
// Shows overall %, sections done, projects done, tests passed.
// Collapses to a small pill on mobile; expands on click.

import { useState, useEffect, useCallback } from "react";
import { Roadmap, ProgressState } from "@/types/roadmap";
import { calculateProgress } from "@/lib/roadmapUtils";

interface RoadmapProgressDashboardProps {
  roadmap: Roadmap;
  progress: ProgressState;
}

export default function RoadmapProgressDashboard({
  roadmap,
  progress,
}: RoadmapProgressDashboardProps) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Show only after scrolling 300px
  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > 300);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalSections = (roadmap.phases ?? []).reduce(
    (acc, p) => acc + (p.sections ?? []).length,
    0
  );
  const totalProjects = (roadmap.projects ?? []).length;
  const totalTests = totalSections + (roadmap.phases ?? []).length;

  const overallPct = calculateProgress(
    roadmap.slug,
    progress,
    totalSections,
    totalProjects,
    totalTests
  );

  const completedSections = progress.completedSections.length;
  const completedProjects = progress.completedProjects.length;

  const passedTests = [
    ...Object.values(progress.sectionTestResults),
    ...Object.values(progress.phaseTestResults),
  ].filter((r) => r.status === "passed").length;

  const hasStarted = overallPct > 0;

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      role="complementary"
      aria-label="Progress dashboard"
    >
      {/* ── Collapsed pill (always visible when scrolled) ── */}
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2.5 rounded-full bg-indigo-600 pl-3 pr-4 py-2.5 text-white shadow-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Expand progress dashboard"
        >
          {/* Mini ring */}
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
            <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeDasharray={`${(overallPct / 100) * 87.96} 87.96`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[9px] font-extrabold text-white">
              {overallPct}%
            </span>
          </div>
          <div className="text-left">
            <p className="text-xs font-bold leading-tight">
              {hasStarted ? "Your Progress" : "Start Learning"}
            </p>
            <p className="text-[10px] text-indigo-200 leading-tight">
              {completedSections}/{totalSections} sections
            </p>
          </div>
          {/* Chevron */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-indigo-300 ml-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      ) : (
        /* ── Expanded panel ── */
        <div className="w-72 rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-indigo-600 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wide">
                Your Progress
              </p>
              <p className="text-sm font-bold text-white truncate max-w-[180px]">
                {roadmap.title}
              </p>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="rounded-lg p-1 text-indigo-300 hover:bg-indigo-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Collapse progress dashboard"
            >
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
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            {/* Overall progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">Overall completion</span>
                <span className="text-sm font-extrabold text-indigo-600">
                  {overallPct}%
                </span>
              </div>
              <div
                className="w-full bg-gray-100 rounded-full h-2.5"
                role="progressbar"
                aria-valuenow={overallPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Overall roadmap completion"
              >
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {/* Sections */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-2.5 text-center">
                <div className="text-lg font-extrabold text-gray-900">
                  {completedSections}
                  <span className="text-xs font-normal text-gray-400">
                    /{totalSections}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">Sections</div>
              </div>
              {/* Projects */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-2.5 text-center">
                <div className="text-lg font-extrabold text-gray-900">
                  {completedProjects}
                  <span className="text-xs font-normal text-gray-400">
                    /{totalProjects}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">Projects</div>
              </div>
              {/* Tests */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-2.5 text-center">
                <div className="text-lg font-extrabold text-gray-900">
                  {passedTests}
                  <span className="text-xs font-normal text-gray-400">
                    /{totalTests}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">Tests</div>
              </div>
            </div>

            {/* Phase progress bars */}
            <div className="flex flex-col gap-2 mb-4">
              {roadmap.phases.map((phase) => {
                const isLocked = phase.access === "locked";
                const done = phase.sections.filter((s) =>
                  progress.completedSections.includes(s.id)
                ).length;
                const pct =
                  phase.sections.length > 0
                    ? Math.round((done / phase.sections.length) * 100)
                    : 0;

                return (
                  <div key={phase.id} className="flex items-center gap-2">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                        isLocked
                          ? "bg-gray-200 text-gray-400"
                          : pct === 100
                          ? "bg-emerald-500 text-white"
                          : "bg-indigo-600 text-white"
                      }`}
                    >
                      {pct === 100 && !isLocked ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        phase.phaseNumber
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-gray-600 truncate">
                          {phase.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold shrink-0 ml-1 ${
                            isLocked ? "text-gray-400" : "text-indigo-600"
                          }`}
                        >
                          {isLocked ? "🔒" : `${pct}%`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all ${
                            isLocked ? "bg-gray-200" : "bg-indigo-400"
                          }`}
                          style={{ width: isLocked ? "0%" : `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <a
              href="#phases"
              onClick={() => setExpanded(false)}
              className="block w-full rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-bold text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {hasStarted ? "Continue Learning" : "Start Phase 1"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
