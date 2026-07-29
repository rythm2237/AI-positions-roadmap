import Link from "next/link";
import { notFound } from "next/navigation";
import { CandidateReviewControls } from "@/components/admin/IntelligenceControls";
import { requireAdmin } from "@/lib/admin/adminAuth";
import {
  currentPublishedFor,
  getAdminSnapshot,
  type AdminSnapshot,
} from "@/lib/admin/adminIntelligenceRepository";
import {
  numericDelta,
  salaryEvidenceLabel,
  salaryQuality,
  salaryReviewMetrics,
  type SalaryReviewMetrics,
} from "@/lib/intelligence/salaryCandidateReview";

const locales: Record<string, string> = {
  gb: "en-GB", us: "en-US", ca: "en-CA", au: "en-AU", de: "de-DE", fr: "fr-FR",
  nl: "nl-NL", nz: "en-NZ", ch: "de-CH",
};
const number = (value: unknown) => typeof value === "number" ? value : 0;
const evidence = (snapshot: AdminSnapshot) =>
  ((snapshot.snapshot_type === "salary" ? snapshot.normalized_payload.snapshot : snapshot.normalized_payload) ?? {}) as Record<string, unknown>;

function money(value: number | null, currency: string | null, country: string) {
  if (value === null || !currency) return "Unavailable";
  try {
    return new Intl.NumberFormat(locales[country] ?? "en", {
      style: "currency", currency, maximumFractionDigits: 0,
    }).format(value);
  } catch { return `${currency} ${Math.round(value).toLocaleString()}`; }
}

function deltaText(current: number | null, previous: number | null, format: (value: number) => string) {
  const change = numericDelta(current, previous);
  if (change.absolute === null) return "Not comparable";
  const sign = change.absolute > 0 ? "+" : "";
  const percent = change.percent === null ? "Not comparable" : `${change.percent > 0 ? "+" : ""}${change.percent.toFixed(1)}%`;
  return `${sign}${format(change.absolute)} (${percent})`;
}

export default async function CandidatePage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reviewed?: string; error?: string }>;
}) {
  const auth = await requireAdmin();
  if (auth.status !== "admin") return null;
  const { id } = await params;
  const candidate = await getAdminSnapshot(auth.accessToken, id);
  if (!candidate) notFound();
  const current = await currentPublishedFor(auth.accessToken, candidate);
  const query = await searchParams;
  const salary = candidate.snapshot_type === "salary";
  const candidateSalary = salary ? salaryReviewMetrics(candidate) : null;
  const publishedSalary = salary && current ? salaryReviewMetrics(current) : null;
  const quality = candidateSalary ? salaryQuality(candidateSalary, publishedSalary) : null;
  const marketWarnings: string[] = [];
  const candidateEvidence = evidence(candidate), publishedEvidence = current ? evidence(current) : {};
  if (!salary) {
    if (candidate.sample_size < 3) marketWarnings.push("Extremely small retrieved sample.");
    if (number(candidateEvidence.primaryMatchCount) === 0) marketWarnings.push("No exact or approved-equivalent title matches.");
    if (current && candidate.sample_size < current.sample_size * .5) marketWarnings.push("Retrieved sample dropped by more than 50% versus the published snapshot.");
    if (!candidate.validation_result.valid) marketWarnings.push("Required candidate validation did not pass.");
  }
  const warnings = quality ? [...quality.blocking, ...quality.warnings] : marketWarnings;
  const publishable = candidate.status === "validating" && candidate.validation_result.valid !== false && (!quality || quality.valid);

  return <main className="p-4 sm:p-8">
    <Link href="/admin/intelligence/snapshots?status=validating" className="text-sm text-cyan-300 underline">← Candidates</Link>
    <h2 className="mt-5 font-display text-3xl font-semibold text-white">Candidate review</h2>
    <p className="mt-2 text-sm text-slate-400">{candidate.career_slug} · {candidate.country_code.toUpperCase()} · {candidate.snapshot_type} · {candidate.provider} · run {candidate.refresh_run_id.slice(0, 8)}</p>
    {query.reviewed ? <p className="mt-4 rounded-xl bg-emerald-400/10 p-3 text-emerald-200">Candidate {query.reviewed} successfully.</p> : null}
    {query.error ? <p role="alert" className="mt-4 rounded-xl bg-rose-400/10 p-3 text-rose-200">{query.error}</p> : null}

    {salary && candidateSalary ? <SalaryReview candidate={candidate} current={current} next={candidateSalary} previous={publishedSalary} /> : <MarketReview candidate={candidate} current={current} />}

    <section className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-400/5 p-5">
      <h3 className="font-semibold text-amber-100">Quality validation</h3>
      {quality ? <p className="mt-2 text-sm text-slate-300">Evidence label: <strong>{salaryEvidenceLabel(candidateSalary!.salaryEvidence)}</strong>. These labels describe product evidence, not statistical certainty.</p> : null}
      {warnings.length ? <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-100/80">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : <p className="mt-2 text-sm text-slate-400">No automatic warning threshold was triggered. Admin review is still required.</p>}
      {!publishable ? <p className="mt-3 text-sm font-semibold text-rose-200">Publication is blocked until structural validation passes.</p> : null}
    </section>
    <div className="mt-6"><CandidateReviewControls id={candidate.id} status={candidate.status} publishable={publishable} requiresAcknowledgement={quality?.requiresAcknowledgement ?? false} /></div>
  </main>;
}

function SalaryReview({ candidate, current, next, previous }: { candidate: AdminSnapshot; current: AdminSnapshot | null; next: SalaryReviewMetrics; previous: SalaryReviewMetrics | null }) {
  return <>
    <div className="mt-6 grid gap-3 lg:grid-cols-2">
      <SalaryPanel title="Candidate" snapshot={candidate} metrics={next} />
      <SalaryPanel title="Currently published" snapshot={current} metrics={previous} />
    </div>
    <section className="mt-5 rounded-2xl border border-white/10 p-5">
      <h3 className="font-semibold text-white">Candidate versus published</h3>
      <p className="mt-2 text-xs text-slate-500">Changes in counts may reflect a different retrieval sample and are not claims of market growth.</p>
      {previous ? <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Value label="Observed median" value={deltaText(next.median, previous.median, value => money(value, next.currency, candidate.country_code))} />
        <Value label="Observed minimum" value={deltaText(next.minimum, previous.minimum, value => money(value, next.currency, candidate.country_code))} />
        <Value label="Observed maximum" value={deltaText(next.maximum, previous.maximum, value => money(value, next.currency, candidate.country_code))} />
        <Value label="Exact/equivalent matches" value={deltaText(next.exactMatches, previous.exactMatches, String)} />
        <Value label="Salary evidence" value={deltaText(next.salaryEvidence, previous.salaryEvidence, String)} />
        <Value label="Retrieved sample" value={deltaText(next.retrieved, previous.retrieved, String)} />
      </dl> : <p className="mt-3 text-sm text-slate-500">No currently published salary snapshot exists. Changes are not comparable.</p>}
    </section>
    <section className="mt-5 rounded-2xl border border-white/10 p-5">
      <h3 className="font-semibold text-white">Methodology and provenance</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">Adzuna returned {next.retrieved} of {String(candidate.query_metadata.requestedSampleSize ?? candidate.sample_size)} requested listings for the configured query. Exact and approved-equivalent taxonomy matches were separated from adjacent and unmatched titles. Salary aggregates use annual employer-disclosed values in {next.currency ?? "the recorded local currency"}; provider-estimated records remain separately counted and are not merged into the observed median. Retrieved {new Date(candidate.captured_at).toLocaleString()}, provider {candidate.provider}. {next.partial ? "The stored warnings indicate a partial or retry condition." : "No partial-response condition is recorded."}</p>
      <p className="mt-2 text-xs text-slate-500">Query label: {String(candidate.query_metadata.canonicalTitle ?? candidateEvidenceLabel(candidate))}. No credentials or provider request headers are stored here.</p>
    </section>
  </>;
}

function candidateEvidenceLabel(snapshot: AdminSnapshot) {
  const payload = evidence(snapshot);
  return payload.query ?? snapshot.career_slug;
}

function SalaryPanel({ title, snapshot, metrics }: { title: string; snapshot: AdminSnapshot | null; metrics: SalaryReviewMetrics | null }) {
  if (!snapshot || !metrics) return <section className="rounded-2xl border border-white/10 p-5"><h3 className="font-semibold text-white">{title}</h3><p className="mt-2 text-sm text-slate-500">No published snapshot.</p></section>;
  return <section className="rounded-2xl border border-white/10 p-5">
    <h3 className="font-semibold text-white">{title}</h3>
    <p className="mt-2 text-xs text-slate-500"><strong className="text-slate-300">Broad provider-query total:</strong> {metrics.providerTotal ?? "Unavailable"}. This is not the verified count of exact-title vacancies and must not be interpreted as total market size.</p>
    <dl className="mt-4 grid grid-cols-2 gap-3">
      <Value label="Retrieved sample" value={metrics.retrieved} /><Value label="Unique analyzed" value={metrics.analyzed} />
      <Value label="Exact/equivalent" value={metrics.exactMatches} /><Value label="Adjacent" value={metrics.adjacentMatches} />
      <Value label="Salary evidence" value={metrics.salaryEvidence} /><Value label="Employer-disclosed" value={metrics.employerDisclosed} />
      <Value label="Provider-estimated" value={metrics.providerEstimated} /><Value label="Local currency" value={metrics.currency ?? "Missing"} />
      <Value label="Pay period / basis" value={metrics.payPeriod === "annual" ? "Annual employer-disclosed" : metrics.payPeriod ?? "Missing"} />
      <Value label="Observed median" value={money(metrics.median, metrics.currency, snapshot.country_code)} />
      <Value label="Observed minimum" value={money(metrics.minimum, metrics.currency, snapshot.country_code)} />
      <Value label="Observed maximum" value={money(metrics.maximum, metrics.currency, snapshot.country_code)} />
      <Value label="Observed range" value={metrics.minimum === null || metrics.maximum === null ? "Unavailable" : `${money(metrics.minimum, metrics.currency, snapshot.country_code)} – ${money(metrics.maximum, metrics.currency, snapshot.country_code)}`} />
      <Value label="Generated / refreshed" value={new Date(snapshot.captured_at).toLocaleString()} />
      <Value label="Provider · country · type" value={`${snapshot.provider} · ${snapshot.country_code.toUpperCase()} · ${snapshot.snapshot_type}`} />
    </dl>
    <h4 className="mt-5 text-sm font-semibold text-slate-200">Broad-query salary distribution</h4>
    {metrics.histogram.length ? <div className="mt-2 space-y-1">{metrics.histogram.map(bucket => <div key={bucket.salary} className="flex justify-between gap-4 text-xs text-slate-400"><span>{money(bucket.salary, metrics.currency, snapshot.country_code)}</span><span>{bucket.count} provider results</span></div>)}</div> : <p className="mt-2 text-xs text-slate-500">No distribution buckets were stored.</p>}
    <p className="mt-2 text-xs text-slate-500">Distribution buckets come from the broad provider query and are not the distribution of verified exact-title matches.</p>
  </section>;
}

function MarketReview({ candidate, current }: { candidate: AdminSnapshot; current: AdminSnapshot | null }) {
  const next = evidence(candidate), previous = current ? evidence(current) : {};
  return <><div className="mt-6 grid gap-3 sm:grid-cols-2"><MarketPanel title="Candidate" snapshot={candidate} payload={next} /><MarketPanel title="Currently published" snapshot={current} payload={previous} /></div><section className="mt-5 rounded-2xl border border-white/10 p-5"><h3 className="font-semibold text-white">Change from published</h3>{current ? <dl className="mt-3 grid gap-3 sm:grid-cols-3"><Value label="Retrieved sample" value={deltaText(candidate.sample_size, current.sample_size, String)} /><Value label="Exact/equivalent matches" value={deltaText(number(next.primaryMatchCount), number(previous.primaryMatchCount), String)} /><Value label="Salary evidence" value={deltaText(number(next.salarySampleSize), number(previous.salarySampleSize), String)} /></dl> : <p className="mt-2 text-sm text-slate-500">No currently published comparison exists.</p>}</section></>;
}

function MarketPanel({ title, snapshot, payload }: { title: string; snapshot: AdminSnapshot | null; payload: Record<string, unknown> }) {
  return <section className="rounded-2xl border border-white/10 p-5"><h3 className="font-semibold text-white">{title}</h3>{snapshot ? <dl className="mt-3 grid grid-cols-2 gap-3"><Value label="Broad provider-query total" value={snapshot.total_count ?? "Unavailable"} /><Value label="Retrieved" value={payload.recordsRetrieved ?? snapshot.sample_size} /><Value label="Unique analyzed" value={payload.uniqueRecordsAnalyzed ?? snapshot.sample_size} /><Value label="Exact/equivalent" value={payload.primaryMatchCount ?? 0} /><Value label="Adjacent" value={payload.adjacentMatchCount ?? 0} /></dl> : <p className="mt-2 text-sm text-slate-500">No published snapshot.</p>}</section>;
}

function Value({ label, value }: { label: string; value: unknown }) {
  return <div><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 text-slate-200">{String(value)}</dd></div>;
}
