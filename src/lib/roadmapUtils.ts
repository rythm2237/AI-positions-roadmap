// src/lib/roadmapUtils.ts
// Pure utility functions for roadmap progress calculation.
// No browser APIs — safe to import in both server and client components.
// Separated from roadmapProgress.ts (which uses localStorage) to avoid
// Turbopack/Next.js module resolution issues with mixed server/client code.

import { ProgressState } from "@/types/roadmap";

// ─── Progress calculation ────────────────────────────────────────────────────
// Formula: sections 60% + projects 25% + tests 15%

export function calculateProgress(
  _slug: string,
  state: ProgressState,
  totalSections: number,
  totalProjects: number,
  totalTests: number // total section + phase tests combined
): number {
  if (totalSections === 0 && totalProjects === 0 && totalTests === 0) return 0;

  const sectionScore =
    totalSections > 0
      ? (state.completedSections.length / totalSections) * 60
      : 0;

  const projectScore =
    totalProjects > 0
      ? (state.completedProjects.length / totalProjects) * 25
      : 0;

  const passedTests = [
    ...Object.values(state.sectionTestResults),
    ...Object.values(state.phaseTestResults),
  ].filter((r) => r.status === "passed").length;

  const testScore =
    totalTests > 0 ? (passedTests / totalTests) * 15 : 0;

  return Math.round(sectionScore + projectScore + testScore);
}
