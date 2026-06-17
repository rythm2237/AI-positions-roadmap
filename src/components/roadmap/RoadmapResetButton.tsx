"use client";
// src/components/roadmap/RoadmapResetButton.tsx
// Danger-zone button that clears all localStorage progress for a roadmap.
// Requires a two-step confirmation to prevent accidental resets.
// Designed to be placed in the RoadmapHeader or a settings area.

import { useState } from "react";
import { defaultProgress } from "@/lib/roadmapProgress";
import { ProgressState } from "@/types/roadmap";

interface RoadmapResetButtonProps {
  slug: string;
  onReset: (fresh: ProgressState) => void;
}

export default function RoadmapResetButton({
  slug,
  onReset,
}: RoadmapResetButtonProps) {
  const [step, setStep] = useState<"idle" | "confirm">("idle");

  function handleReset() {
    // Clear from localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`roadmap_progress__${slug}`);
      } catch {
        // Silently ignore
      }
    }
    onReset(defaultProgress());
    setStep("idle");
  }

  if (step === "idle") {
    return (
      <button
        onClick={() => setStep("confirm")}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
        aria-label="Reset all roadmap progress"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
        </svg>
        Reset Progress
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
      <span className="text-xs font-medium text-red-700">
        This will erase all progress. Are you sure?
      </span>
      <button
        onClick={handleReset}
        className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-label="Confirm progress reset"
      >
        Yes, Reset
      </button>
      <button
        onClick={() => setStep("idle")}
        className="rounded-lg bg-white border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
        aria-label="Cancel progress reset"
      >
        Cancel
      </button>
    </div>
  );
}
