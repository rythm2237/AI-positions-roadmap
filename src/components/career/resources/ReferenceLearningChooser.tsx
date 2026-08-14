"use client";

import { useEffect, useMemo, useState } from "react";
import { getReferenceLearningOptions } from "@/lib/references/referenceResolver";
import type {
  ReferenceLearningMode,
  ResolvedReference,
} from "@/types/reference";

type Props = {
  resource: ResolvedReference;
  disabled?: boolean;
  onOpen?: (mode: ReferenceLearningMode) => void;
};

const MODES: Array<{
  mode: ReferenceLearningMode;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    mode: "reading",
    label: "Read",
    icon: "Aa",
    description: "Direct reading",
  },
  {
    mode: "video",
    label: "Watch",
    icon: "▶",
    description: "Direct video",
  },
  {
    mode: "practice",
    label: "Practice",
    icon: "◇",
    description: "Direct hands-on",
  },
];

function actionLabel(mode: ReferenceLearningMode) {
  if (mode === "video") return "Play video";
  if (mode === "practice") return "Start practice";
  return "Open reading";
}

export default function ReferenceLearningChooser({
  resource,
  disabled = false,
  onOpen,
}: Props) {
  const options = useMemo(
    () => getReferenceLearningOptions(resource),
    [resource]
  );

  const defaultMode =
    options.find((option) => option.mode === "reading")?.mode ??
    options[0]?.mode ??
    "reading";

  const [selectedMode, setSelectedMode] =
    useState<ReferenceLearningMode>(defaultMode);

  const optionSignature = options
    .map(
      (option) =>
        `${option.mode}:${option.contentType}:${option.url}:${option.verifiedAt}`
    )
    .join("|");

  useEffect(() => {
    setSelectedMode(
      options.find((option) => option.mode === "reading")?.mode ??
        options[0]?.mode ??
        "reading"
    );
  }, [resource.id, optionSignature, options]);

  const selectedOption =
    options.find((option) => option.mode === selectedMode) ?? options[0];

  const canOpen = Boolean(
    selectedOption &&
      selectedOption.verifiedContentType &&
      resource.available &&
      !disabled
  );

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Choose your learning format
      </p>

      <div
        className="mt-2 grid gap-2 sm:grid-cols-3"
        role="group"
        aria-label={`Choose how to learn ${resource.title}`}
      >
        {MODES.map(({ mode, label, icon, description }) => {
          const option = options.find((item) => item.mode === mode);
          const selected = selectedMode === mode;
          const unavailable =
            disabled || !option || !option.verifiedContentType;

          return (
            <button
              key={mode}
              type="button"
              disabled={unavailable}
              aria-pressed={selected}
              onClick={() => option && setSelectedMode(mode)}
              className={`min-h-16 rounded-xl border px-3 py-2 text-left transition ${
                unavailable
                  ? "cursor-not-allowed border-white/5 bg-white/[0.02] text-slate-600"
                  : selected
                    ? mode === "practice"
                      ? "border-emerald-300/50 bg-emerald-400/10 text-white"
                      : "border-cyan-300/50 bg-cyan-400/10 text-white"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-violet-300/35 hover:bg-violet-400/[0.07]"
              }`}
            >
              <span className="block text-sm font-semibold">
                {icon} {label}
              </span>
              <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                {option && option.verifiedContentType
                  ? description
                  : `No direct ${label.toLowerCase()} available`}
              </span>
            </button>
          );
        })}
      </div>

      {selectedOption ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/45 p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                {selectedOption.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {selectedOption.provider}
                {selectedOption.durationLabel
                  ? ` · ${selectedOption.durationLabel}`
                  : ""}
                {selectedOption.isOfficial
                  ? " · Official resource"
                  : " · Curated external resource"}
              </p>
            </div>

            <div className="flex flex-wrap gap-1">
              <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {selectedOption.mode}
              </span>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-400/[0.06] px-2 py-1 text-[10px] font-semibold text-emerald-200">
                Direct destination verified
              </span>
            </div>
          </div>

          {selectedOption.description ? (
            <p className="mt-2 text-xs leading-5 text-slate-400">
              {selectedOption.description}
            </p>
          ) : null}

          {!selectedOption.isOfficial && selectedOption.curationReason ? (
            <p className="mt-2 rounded-lg border border-amber-300/15 bg-amber-400/[0.06] p-2 text-[11px] leading-4 text-amber-100">
              Why this external resource: {selectedOption.curationReason}
            </p>
          ) : null}

          <p className="mt-2 text-[10px] text-slate-600">
            Content type: {selectedOption.contentType} · Verified{" "}
            {selectedOption.verifiedAt}
          </p>

          <a
            href={canOpen ? selectedOption.url : undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!canOpen}
            onClick={(event) => {
              if (!canOpen) {
                event.preventDefault();
                return;
              }
              onOpen?.(selectedOption.mode);
            }}
            className={`mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              canOpen
                ? selectedOption.mode === "practice"
                  ? "border-emerald-300/30 bg-emerald-400/[0.08] text-emerald-100 hover:bg-emerald-400/15"
                  : "border-violet-300/30 bg-violet-400/[0.08] text-violet-100 hover:bg-violet-400/15"
                : "cursor-not-allowed border-white/5 text-slate-600"
            }`}
          >
            {canOpen ? actionLabel(selectedOption.mode) : "Direct resource unavailable"}
          </a>
        </div>
      ) : null}
    </div>
  );
}
