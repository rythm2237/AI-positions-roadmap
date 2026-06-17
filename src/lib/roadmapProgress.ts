// src/lib/roadmapProgress.ts
// LocalStorage helpers for the roadmap progress system.
// All functions are SSR-safe — they guard against window/localStorage access.
// Replace these functions with Supabase/API calls when backend is ready.

import { ProgressState, SectionTestResult, PhaseTestResult } from "@/types/roadmap";

// NOTE: calculateProgress lives in roadmapUtils.ts — import it from there directly.
// Do NOT re-export it here to avoid Turbopack circular module resolution issues.

// ─── Storage key ─────────────────────────────────────────────────────────────

function storageKey(slug: string): string {
  return `roadmap_progress__${slug}`;
}

// ─── Default state ───────────────────────────────────────────────────────────

export function defaultProgress(): ProgressState {
  return {
    completedSections: [],
    completedProjects: [],
    sectionTestResults: {},
    phaseTestResults: {},
    sectionNotes: {},
    phaseNotes: {},
  };
}

// ─── Load ────────────────────────────────────────────────────────────────────

export function loadProgress(slug: string): ProgressState {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(raw) };
  } catch {
    return defaultProgress();
  }
}

// ─── Save ────────────────────────────────────────────────────────────────────

export function saveProgress(slug: string, state: ProgressState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify(state));
  } catch {
    // Silently fail (e.g. private browsing quota exceeded)
  }
}

// ─── Section completion ──────────────────────────────────────────────────────

export function toggleSectionComplete(
  slug: string,
  sectionId: string,
  state: ProgressState
): ProgressState {
  const isComplete = state.completedSections.includes(sectionId);
  const updated: ProgressState = {
    ...state,
    completedSections: isComplete
      ? state.completedSections.filter((id) => id !== sectionId)
      : [...state.completedSections, sectionId],
  };
  saveProgress(slug, updated);
  return updated;
}

// ─── Project completion ──────────────────────────────────────────────────────

export function toggleProjectComplete(
  slug: string,
  projectId: string,
  state: ProgressState
): ProgressState {
  const isComplete = state.completedProjects.includes(projectId);
  const updated: ProgressState = {
    ...state,
    completedProjects: isComplete
      ? state.completedProjects.filter((id) => id !== projectId)
      : [...state.completedProjects, projectId],
  };
  saveProgress(slug, updated);
  return updated;
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export function saveSectionNote(
  slug: string,
  phaseId: string,
  sectionId: string,
  note: string,
  state: ProgressState
): ProgressState {
  const key = `${phaseId}__${sectionId}`;
  const updated: ProgressState = {
    ...state,
    sectionNotes: { ...state.sectionNotes, [key]: note },
  };
  saveProgress(slug, updated);
  return updated;
}

export function savePhaseNote(
  slug: string,
  phaseId: string,
  note: string,
  state: ProgressState
): ProgressState {
  const updated: ProgressState = {
    ...state,
    phaseNotes: { ...state.phaseNotes, [phaseId]: note },
  };
  saveProgress(slug, updated);
  return updated;
}

// ─── Test results ─────────────────────────────────────────────────────────────

export function saveSectionTestResult(
  slug: string,
  result: SectionTestResult,
  state: ProgressState
): ProgressState {
  const updated: ProgressState = {
    ...state,
    sectionTestResults: {
      ...state.sectionTestResults,
      [result.sectionId]: result,
    },
  };
  saveProgress(slug, updated);
  return updated;
}

export function savePhaseTestResult(
  slug: string,
  result: PhaseTestResult,
  state: ProgressState
): ProgressState {
  const updated: ProgressState = {
    ...state,
    phaseTestResults: {
      ...state.phaseTestResults,
      [result.phaseId]: result,
    },
  };
  saveProgress(slug, updated);
  return updated;
}
