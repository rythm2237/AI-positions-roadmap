import { formatEffortRange } from "@/lib/careerEffort";
import type { CareerJourneyEffortEstimate } from "@/types/careerWorkspace";

const breakdownLabels = {
  resources: "Resources",
  activities: "Activities",
  assessment: "Assessment",
} as const;

export function EffortEstimate({
  estimate,
  compact = false,
}: {
  estimate?: CareerJourneyEffortEstimate;
  compact?: boolean;
}) {
  if (!estimate) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-400">
        <span className="font-medium text-slate-300">Estimated effort:</span>{" "}
        Estimate pending
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
        Estimated effort
      </p>
      <p className="mt-1 font-semibold text-white">
        {formatEffortRange(estimate)}
      </p>
      <div
        className={`mt-3 grid gap-2 ${compact ? "grid-cols-1" : "sm:grid-cols-3"}`}
        aria-label="Estimated effort breakdown"
      >
        {Object.entries(estimate.breakdown).map(([key, range]) => (
          <div
            key={key}
            className="rounded-lg border border-white/10 bg-slate-950/35 px-2.5 py-2"
          >
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              {breakdownLabels[key as keyof typeof breakdownLabels]}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-200">
              {formatEffortRange(range)}
            </p>
          </div>
        ))}
      </div>
      {estimate.ongoing ? (
        <p className="mt-3 text-xs leading-5 text-amber-100">
          <span className="font-semibold">Ongoing:</span>{" "}
          {estimate.ongoing.note}
        </p>
      ) : null}
    </div>
  );
}
