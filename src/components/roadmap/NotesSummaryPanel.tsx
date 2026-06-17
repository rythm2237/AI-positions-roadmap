"use client";
// src/components/roadmap/NotesSummaryPanel.tsx
// Displays all notes for a roadmap grouped by phase.
// Shows section notes under their phase, and phase-level notes clearly labelled.

import { Roadmap, ProgressState } from "@/types/roadmap";

interface NotesSummaryPanelProps {
  roadmap: Roadmap;
  progress: ProgressState;
}

export default function NotesSummaryPanel({
  roadmap,
  progress,
}: NotesSummaryPanelProps) {
  // Collect all notes grouped by phase
  const noteGroups = (roadmap.phases ?? [])
    .map((phase) => {
      const phaseNote = progress.phaseNotes[phase.id];
      const sectionNotes = (phase.sections ?? [])
        .map((s) => ({
          title: s.title,
          note: progress.sectionNotes[`${phase.id}__${s.id}`],
        }))
        .filter((s) => !!s.note);
      return { phase, phaseNote, sectionNotes };
    })
    .filter((g) => g.phaseNote || g.sectionNotes.length > 0);

  const hasAnyNotes = noteGroups.length > 0;

  return (
    <section
      id="notes"
      className="bg-white border-t border-gray-100 px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">
          Notes Summary
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          All your notes for this roadmap, grouped by phase.
        </p>

        {!hasAnyNotes ? (
          /* ── Empty state ── */
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-300 mx-auto mb-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <p className="text-sm font-semibold text-gray-500">No notes yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Add notes from any phase or section above.
            </p>
          </div>
        ) : (
          /* ── Notes grouped by phase ── */
          <div className="flex flex-col gap-6">
            {noteGroups.map(({ phase, phaseNote, sectionNotes }) => (
              <div
                key={phase.id}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
              >
                {/* Phase header */}
                <div className="bg-indigo-50 border-b border-indigo-100 px-5 py-3 flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {phase.phaseNumber}
                  </div>
                  <span className="text-sm font-bold text-indigo-900">
                    Phase {phase.phaseNumber}: {phase.title}
                  </span>
                </div>

                <div className="p-5 flex flex-col gap-4">
                  {/* Phase-level note */}
                  {phaseNote && (
                    <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
                        Phase Notes
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {phaseNote}
                      </p>
                    </div>
                  )}

                  {/* Section notes */}
                  {sectionNotes.map(({ title, note }) => (
                    <div
                      key={title}
                      className="rounded-xl bg-gray-50 border border-gray-200 p-4"
                    >
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        {title}
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
