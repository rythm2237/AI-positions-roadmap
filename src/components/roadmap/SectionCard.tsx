"use client";

import { useState } from "react";
import type {
  ProgressState,
  RoadmapSection,
  TestResultStatus,
} from "@/types/roadmap";
import {
  saveSectionNote,
  saveSectionTestResult,
  toggleSectionComplete,
} from "@/lib/roadmapProgress";
import NotesModal from "./NotesModal";
import TestModal from "./TestModal";

interface SectionCardProps {
  section: RoadmapSection;
  phaseId: string;
  slug: string;
  isLocked: boolean;
  progress: ProgressState;
  onProgressUpdate: (updated: ProgressState) => void;
}

const testStatusConfig: Record<
  TestResultStatus,
  { label: string; className: string }
> = {
  "not-attempted": {
    label: "Take Quiz",
    className: "bg-gray-100 text-gray-600 hover:bg-gray-200",
  },
  passed: {
    label: "Quiz Passed",
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  },
  "needs-review": {
    label: "Review Quiz",
    className: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  },
};

const resourceTypeConfig: Record<
  RoadmapSection["resources"][number]["type"],
  { icon: string; className: string }
> = {
  video: { icon: "🎬", className: "bg-red-50 text-red-700 border-red-100" },
  article: {
    icon: "📖",
    className: "bg-purple-50 text-purple-700 border-purple-100",
  },
  practice: {
    icon: "⚡",
    className: "bg-orange-50 text-orange-700 border-orange-100",
  },
  tool: { icon: "🛠️", className: "bg-teal-50 text-teal-700 border-teal-100" },
  project: {
    icon: "🚀",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
};

export default function SectionCard({
  section,
  phaseId,
  slug,
  isLocked,
  progress,
  onProgressUpdate,
}: SectionCardProps) {
  const noteKey = `${phaseId}__${section.id}`;
  const [notesOpen, setNotesOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [localNote, setLocalNote] = useState(progress.sectionNotes[noteKey] ?? "");

  const isComplete = progress.completedSections.includes(section.id);
  const hasNote = !!progress.sectionNotes[noteKey];
  const testResult = progress.sectionTestResults[section.id];
  const testStatus: TestResultStatus = testResult?.status ?? "not-attempted";

  function handleToggleComplete() {
    onProgressUpdate(toggleSectionComplete(slug, section.id, progress));
  }

  function handleSaveNote() {
    const updated = saveSectionNote(slug, phaseId, section.id, localNote, progress);
    onProgressUpdate(updated);
  }

  function handleTestResult(score: number, passed: boolean) {
    const updated = saveSectionTestResult(
      slug,
      {
        sectionId: section.id,
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
      <article
        className={`rounded-xl border p-4 transition-colors ${
          isLocked
            ? "border-gray-100 bg-gray-50"
            : isComplete
            ? "border-emerald-200 bg-emerald-50"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                {section.estimatedTime}
              </span>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                {section.difficulty}
              </span>
              {section.learningTypes.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-500"
                >
                  {type}
                </span>
              ))}
            </div>

            <h4 className="text-base font-bold text-gray-900">{section.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              {section.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {section.resources.map((resource) => {
                const config = resourceTypeConfig[resource.type];
                const isDisabled = resource.url === "#";
                const content = (
                  <>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 ${config.className}`}
                    >
                      <span aria-hidden="true">{config.icon}</span>
                      <span className="capitalize">{resource.type}</span>
                    </span>
                    <span className="min-w-0 flex-1">{resource.label}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      Free
                    </span>
                  </>
                );

                return isDisabled ? (
                  <span
                    key={`${resource.label}-${resource.url}`}
                    title="Link coming soon"
                    className="inline-flex max-w-full cursor-not-allowed items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-400"
                    aria-disabled="true"
                  >
                    {content}
                  </span>
                ) : (
                  <a
                    key={`${resource.label}-${resource.url}`}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {content}
                  </a>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleComplete}
            disabled={isLocked}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed ${
              isComplete
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {isComplete ? "Completed" : "Mark Complete"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={() => {
              setLocalNote(progress.sectionNotes[noteKey] ?? "");
              setNotesOpen(true);
            }}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              hasNote
                ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {hasNote ? "Edit Notes" : "Add Notes"}
          </button>
          <button
            type="button"
            onClick={() => setTestOpen(true)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${testStatusConfig[testStatus].className}`}
          >
            {testStatusConfig[testStatus].label}
          </button>
          {testResult && (
            <span className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-500">
              Score: {testResult.score}%
            </span>
          )}
        </div>
      </article>

      {notesOpen && (
        <NotesModal
          title={section.title}
          noteValue={localNote}
          onNoteChange={setLocalNote}
          onSave={handleSaveNote}
          onClose={() => setNotesOpen(false)}
        />
      )}
      {testOpen && (
        <TestModal
          test={section.test}
          onClose={() => setTestOpen(false)}
          onResult={handleTestResult}
        />
      )}
    </>
  );
}
