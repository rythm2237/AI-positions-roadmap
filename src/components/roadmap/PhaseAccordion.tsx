"use client";
// src/components/roadmap/PhaseAccordion.tsx
// Collapsible phase cards with sections, notes, and phase final test.

import { useState } from "react";
import { RoadmapPhase, ProgressState, TestResultStatus } from "@/types/roadmap";
import { savePhaseNote, savePhaseTestResult } from "@/lib/roadmapProgress";
import SectionCard from "./SectionCard";
import NotesModal from "./NotesModal";
import TestModal from "./TestModal";

interface PhaseAccordionProps {
  phase: RoadmapPhase;
  slug: string;
  isOpenDefault: boolean;
  progress: ProgressState;
  onProgressUpdate: (updated: ProgressState) => void;
}

const testStatusConfig: Record<
  TestResultStatus,
  { label: string; class: string }
> = {
  "not-attempted": {
    label: "Phase Test",
    class: "bg-gray-100 text-gray-600 hover:bg-gray-200",
  },
  passed: {
    label: "✓ Phase Test Passed",
    class: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  },
  "needs-review": {
    label: "Phase Test — Needs Review",
    class: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  },
};

export default function PhaseAccordion({
  phase,
  slug,
  isOpenDefault,
  progress,
  onProgressUpdate,
}: PhaseAccordionProps) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [phaseNotesOpen, setPhaseNotesOpen] = useState(false);
  const [phaseTestOpen, setPhaseTestOpen] = useState(false);
  const [localPhaseNote, setLocalPhaseNote] = useState(
    progress.phaseNotes[phase.id] ?? ""
  );

  const isLocked = phase.access === "locked";
  const sections = phase.sections ?? [];
  const completedCount = sections.filter((s) =>
    progress.completedSections.includes(s.id)
  ).length;
  const phaseProgress =
    sections.length > 0
      ? Math.round((completedCount / sections.length) * 100)
      : 0;
  const hasPhaseNote = !!progress.phaseNotes[phase.id];
  const phaseTestResult = progress.phaseTestResults[phase.id];
  const phaseTestStatus: TestResultStatus =
    phaseTestResult?.status ?? "not-attempted";

  function handleSavePhaseNote() {
    const updated = savePhaseNote(slug, phase.id, localPhaseNote, progress);
    onProgressUpdate(updated);
  }

  function handlePhaseTestResult(score: number, passed: boolean) {
    const updated = savePhaseTestResult(
      slug,
      {
        phaseId: phase.id,
        score,
        status: passed ? "passed" : "needs-review",
        answeredAt: new Date().toISOString(),
      },
      progress
    );
    onProgressUpdate(updated);
  }

  return (
    <>
      <div
        className={`rounded-2xl border transition-all ${
          isLocked
            ? "border-gray-100 bg-gray-50"
            : isOpen
            ? "border-indigo-200 bg-white shadow-md"
            : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-sm"
        }`}
      >
        {/* ── Phase header — clickable to expand/collapse ── */}
        <button
          onClick={() => !isLocked && setIsOpen((v) => !v)}
          className={`w-full flex items-start gap-4 p-5 text-left transition-colors rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-inset ${
            isLocked ? "cursor-default" : "cursor-pointer"
          }`}
          aria-expanded={isOpen}
          aria-controls={`phase-content-${phase.id}`}
          disabled={isLocked}
        >
          {/* Phase number circle */}
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              isLocked
                ? "bg-gray-200 text-gray-400"
                : phaseProgress === 100
                ? "bg-emerald-500 text-white"
                : "bg-indigo-600 text-white"
            }`}
          >
            {phaseProgress === 100 && !isLocked ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
            ) : isLocked ? (
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
            ) : (
              phase.phaseNumber
            )}
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
                {phase.weekRange}
              </span>
              {isLocked ? (
                <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-500">
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
            <h3
              className={`text-base font-extrabold ${
                isLocked ? "text-gray-500" : "text-gray-900"
              }`}
            >
              Phase {phase.phaseNumber}: {phase.title}
            </h3>
            <p
              className={`text-sm mt-1 leading-relaxed ${
                isLocked ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {isLocked
                ? "Unlock full access to view all content in this phase."
                : phase.description}
            </p>

            {/* Progress bar (unlocked only) */}
            {!isLocked && (
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 max-w-xs bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${phaseProgress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-indigo-600">
                  {phaseProgress}%
                </span>
                <span className="text-xs text-gray-400">
                  {completedCount}/{sections.length} sections
                </span>
              </div>
            )}
          </div>

          {/* Expand/collapse chevron */}
          {!isLocked && (
            <div className="shrink-0 mt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-gray-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          )}
        </button>

        {/* ── Locked upgrade CTA ── */}
        {isLocked && (
          <div className="px-5 pb-5">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-sm text-indigo-700 font-medium mb-3">
                Full roadmap access is available with Single Roadmap Access or
                All Access subscription.
              </p>
              <a
                href="/#pricing"
                className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                View Plans
              </a>
            </div>
          </div>
        )}

        {/* ── Expanded content ── */}
        {isOpen && !isLocked && (
          <div id={`phase-content-${phase.id}`} className="px-5 pb-5">
            {/* Outcome banner */}
            <div className="mb-4 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-0.5">
                Phase Outcome
              </p>
              <p className="text-sm text-indigo-800">{phase.outcome}</p>
            </div>

            {/* Sections */}
            <div className="flex flex-col gap-3 mb-4">
              {sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  phaseId={phase.id}
                  slug={slug}
                  isLocked={false}
                  progress={progress}
                  onProgressUpdate={onProgressUpdate}
                />
              ))}
            </div>

            {/* Phase action buttons */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
              {/* Phase notes button */}
              <button
                onClick={() => {
                  setLocalPhaseNote(progress.phaseNotes[phase.id] ?? "");
                  setPhaseNotesOpen(true);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  hasPhaseNote
                    ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
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
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                {hasPhaseNote ? "Edit Phase Notes" : "Phase Notes"}
              </button>

              {/* Phase final test button */}
              <button
                onClick={() => setPhaseTestOpen(true)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${testStatusConfig[phaseTestStatus].class}`}
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
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                {testStatusConfig[phaseTestStatus].label}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {phaseNotesOpen && (
        <NotesModal
          title={`Phase ${phase.phaseNumber}: ${phase.title}`}
          noteValue={localPhaseNote}
          onNoteChange={setLocalPhaseNote}
          onSave={handleSavePhaseNote}
          onClose={() => setPhaseNotesOpen(false)}
        />
      )}
      {phaseTestOpen && (
        <TestModal
          test={phase.finalTest}
          onClose={() => setPhaseTestOpen(false)}
          onResult={handlePhaseTestResult}
        />
      )}
    </>
  );
}
