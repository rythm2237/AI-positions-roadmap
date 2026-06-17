"use client";
// src/components/roadmap/RoadmapVisualOverview.tsx
// Visual roadmap overview — horizontal on desktop, vertical on mobile.
// Shows each phase as a connected node with status, title, and duration.

import { RoadmapPhase, ProgressState } from "@/types/roadmap";

interface RoadmapVisualOverviewProps {
  phases: RoadmapPhase[];
  progress: ProgressState;
}

type PhaseStatus = "completed" | "in-progress" | "unlocked" | "locked";

function getPhaseStatus(
  phase: RoadmapPhase,
  progress: ProgressState
): PhaseStatus {
  if (phase.access === "locked") return "locked";
  const sectionIds = (phase.sections ?? []).map((s) => s.id);
  const completed = sectionIds.filter((id) =>
    progress.completedSections.includes(id)
  ).length;
  if (completed === sectionIds.length && sectionIds.length > 0)
    return "completed";
  if (completed > 0) return "in-progress";
  return "unlocked";
}

const statusConfig: Record<
  PhaseStatus,
  {
    ring: string;
    bg: string;
    text: string;
    label: string;
    labelClass: string;
    connector: string;
  }
> = {
  completed: {
    ring: "ring-2 ring-emerald-500",
    bg: "bg-emerald-500",
    text: "text-white",
    label: "Completed",
    labelClass: "bg-emerald-100 text-emerald-700",
    connector: "bg-emerald-400",
  },
  "in-progress": {
    ring: "ring-2 ring-indigo-500",
    bg: "bg-indigo-600",
    text: "text-white",
    label: "In Progress",
    labelClass: "bg-indigo-100 text-indigo-700",
    connector: "bg-indigo-300",
  },
  unlocked: {
    ring: "ring-2 ring-indigo-300",
    bg: "bg-white",
    text: "text-indigo-600",
    label: "Free",
    labelClass: "bg-emerald-100 text-emerald-700",
    connector: "bg-gray-200",
  },
  locked: {
    ring: "ring-1 ring-gray-200",
    bg: "bg-gray-100",
    text: "text-gray-400",
    label: "Locked",
    labelClass: "bg-gray-100 text-gray-500",
    connector: "bg-gray-200",
  },
};

// ─── Lock icon ───────────────────────────────────────────────────────────────
function LockIcon() {
  return (
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
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// ─── Check icon ──────────────────────────────────────────────────────────────
function CheckIcon({ small = false }: { small?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={small ? "h-4 w-4" : "h-5 w-5"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function RoadmapVisualOverview({
  phases,
  progress,
}: RoadmapVisualOverviewProps) {
  // Guard: phases may be undefined if roadmap data is incomplete
  if (!phases || phases.length === 0) return null;

  return (
    <section className="bg-gray-50 border-b border-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">
          Roadmap Overview
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          Your complete learning path at a glance.
        </p>

        {/* ── Desktop: horizontal connected nodes ── */}
        <div className="hidden md:flex items-start justify-between gap-0 relative">
          {phases.map((phase, idx) => {
            const status = getPhaseStatus(phase, progress);
            const cfg = statusConfig[status];
            const isLast = idx === phases.length - 1;

            return (
              <div key={phase.id} className="flex items-start flex-1 min-w-0">
                {/* Node + content */}
                <div className="flex flex-col items-center flex-1 min-w-0 px-2">
                  {/* Circle */}
                  <a
                    href="#phases"
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm transition-transform hover:scale-105 ${cfg.ring} ${cfg.bg} ${cfg.text}`}
                    aria-label={`Go to Phase ${phase.phaseNumber}: ${phase.title}`}
                  >
                    {status === "completed" ? (
                      <CheckIcon />
                    ) : status === "locked" ? (
                      <LockIcon />
                    ) : (
                      phase.phaseNumber
                    )}
                  </a>

                  {/* Phase info */}
                  <div className="mt-3 text-center px-1">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium mb-1 ${cfg.labelClass}`}
                    >
                      {cfg.label}
                    </span>
                    <p className="text-xs font-bold text-gray-800 leading-tight">
                      {phase.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {phase.weekRange}
                    </p>
                  </div>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div className="flex-shrink-0 w-full max-w-[40px] mt-6">
                    <div className={`h-0.5 w-full ${cfg.connector}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Mobile: vertical timeline ── */}
        <div className="md:hidden flex flex-col gap-0">
          {phases.map((phase, idx) => {
            const status = getPhaseStatus(phase, progress);
            const cfg = statusConfig[status];
            const isLast = idx === phases.length - 1;

            return (
              <div key={phase.id} className="flex gap-4">
                {/* Left: circle + line */}
                <div className="flex flex-col items-center">
                  <a
                    href="#phases"
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ${cfg.ring} ${cfg.bg} ${cfg.text}`}
                    aria-label={`Phase ${phase.phaseNumber}: ${phase.title}`}
                  >
                    {status === "completed" ? (
                      <CheckIcon small />
                    ) : status === "locked" ? (
                      <LockIcon />
                    ) : (
                      phase.phaseNumber
                    )}
                  </a>
                  {!isLast && (
                    <div
                      className={`w-0.5 flex-1 min-h-[2rem] mt-1 ${cfg.connector}`}
                    />
                  )}
                </div>

                {/* Right: content */}
                <div className="pb-6 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.labelClass}`}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {phase.weekRange}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-800">
                    {phase.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {phase.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
