"use client";

interface NotesModalProps {
  title: string;
  noteValue: string;
  onNoteChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function NotesModal({
  title,
  noteValue,
  onNoteChange,
  onSave,
  onClose,
}: NotesModalProps) {
  function handleSave() {
    onSave();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notes-modal-title"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
              Notes
            </p>
            <h2 id="notes-modal-title" className="mt-1 text-lg font-bold text-gray-900">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close notes"
          >
            X
          </button>
        </div>

        <div className="px-5 py-4">
          <textarea
            value={noteValue}
            onChange={(event) => onNoteChange(event.target.value)}
            className="min-h-56 w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-relaxed text-gray-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="Write reflections, reminders, links, or next steps..."
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}
