import type { SemanticCareerMatch } from "@/lib/cvAnalyzer/semanticAnalysis";

const DIMENSIONS = [
  ["roleRelevance", "Role relevance"],
  ["professionalEvidence", "Professional evidence"],
  ["coreRequirements", "Core requirements"],
  ["trajectory", "Current trajectory"],
  ["transferability", "Transferability"],
] as const;

export function CareerMatchCard({ match, index, alignmentMode }: { match: SemanticCareerMatch; index: number; alignmentMode: "discovery" | "targeted" }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-violet-300">{alignmentMode === "discovery" ? `#${index + 1}` : "Selected target"}</span>
        <span className="text-sm font-bold">{match.score}% evidence alignment</span>
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold">{match.title}</h3>
      <p className="mt-1 text-xs text-slate-500">Evidence quality and Career coverage—not hiring probability.</p>

      <dl className="mt-4 grid gap-2.5">
        {DIMENSIONS.map(([key, label]) => (
          <div key={key} className="grid grid-cols-[minmax(0,1fr)_2rem] items-center gap-x-3 gap-y-1">
            <dt className="truncate text-xs text-slate-400">{label}</dt>
            <dd className="text-right text-xs font-semibold text-slate-200">{match.dimensions[key]}</dd>
            <div className="col-span-2 h-1 overflow-hidden rounded-full bg-white/8" role="progressbar" aria-label={`${label} for ${match.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={match.dimensions[key]}>
              <div className="h-full rounded-full bg-violet-400" style={{ width: `${match.dimensions[key]}%` }} />
            </div>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span>Confidence: <strong className="capitalize text-slate-300">{match.confidence}</strong></span>
        <span aria-hidden="true">·</span>
        <span>Direct Career evidence: {match.professionalEvidence.directDurationBucket}</span>
        {match.professionalEvidence.transferableDurationBucket !== "unknown" ? <><span aria-hidden="true">·</span><span>Transferable evidence: {match.professionalEvidence.transferableDurationBucket}</span></> : null}
      </div>

      <details className="mt-4 rounded-xl border border-white/8 bg-black/10 px-3 py-2.5">
        <summary className="cursor-pointer text-xs font-semibold text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50">Why this Career ranks here</summary>
        <div className="mt-3 grid gap-3 text-xs leading-5">
          {match.evidenceSummary.strongestEvidence.length ? <section><h4 className="font-semibold text-emerald-300/85">Strongest evidence</h4><ul className="mt-1 text-slate-400">{match.evidenceSummary.strongestEvidence.map((signal) => <li key={signal}>• {signal}</li>)}</ul></section> : null}
          {match.evidenceSummary.transferableEvidence.length ? <section><h4 className="font-semibold text-sky-300/85">Transferable evidence</h4><ul className="mt-1 text-slate-400">{match.evidenceSummary.transferableEvidence.map((signal) => <li key={signal}>• {signal}</li>)}</ul></section> : null}
          {match.evidenceSummary.coreGaps.length ? <section><h4 className="font-semibold text-amber-200/85">Core evidence gaps</h4><ul className="mt-1 text-slate-400">{match.evidenceSummary.coreGaps.map((signal) => <li key={signal}>• {signal}</li>)}</ul></section> : null}
          {match.evidenceSummary.limitingFactors.length ? <section><h4 className="font-semibold text-amber-200/85">Evidence-depth limits</h4><ul className="mt-1 text-slate-400">{match.evidenceSummary.limitingFactors.map((signal) => <li key={signal}>• {signal}</li>)}</ul></section> : null}
          {match.evidenceSummary.supportingOpportunities.length ? <section><h4 className="font-semibold text-cyan-200/85">Additional evidence opportunities</h4><ul className="mt-1 text-slate-400">{match.evidenceSummary.supportingOpportunities.map((signal) => <li key={signal}>• {signal}</li>)}</ul></section> : null}
          {!match.evidenceSummary.coreGaps.length && !match.evidenceSummary.limitingFactors.length ? <p className="text-emerald-200/80">No material core-evidence limitation was detected.</p> : null}
        </div>
      </details>

      <p className="mt-3 text-xs leading-5 text-slate-500">Core-gap estimate: {match.weeks}</p>
    </article>
  );
}
