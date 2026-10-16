import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

type ProviderAttempt = {
  provider?: string; query?: string; country?: string; location?: string;
  status?: string; records_received?: number; error_code?: string | null;
};
type DiagnosticRun = {
  search_run_id: string; started_at: string; run_status: string;
  queries_planned: number | null; provider_records: number | null;
  deduplicated_count: number | null; eligible_count: number | null;
  unverified_count: number | null; blocked_count: number | null;
  recommended_count: number | null; provider_errors: number | null;
  diagnostic_category: string; providers: ProviderAttempt[] | null;
};
const label: Record<string, string> = {
  partial_provider_failure: "Some providers failed — results incomplete",
  no_provider_records: "No records returned by providers",
  deduplication_exhausted: "No unique records remained",
  eligibility_or_verification_bottleneck: "All candidates blocked or awaiting verification",
  recommendation_bottleneck: "Eligible vacancies did not reach recommendations",
  has_recommendations: "Recommendations available",
};
const count = (n?: number | null) => n ?? 0;

export default async function JobSearchDiagnosticsPage() {
  const user = await requireUser("/job-agent/diagnostics");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_search_run_diagnostics")
    .select("search_run_id,started_at,run_status,queries_planned,provider_records,deduplicated_count,eligible_count,unverified_count,blocked_count,recommended_count,provider_errors,diagnostic_category,providers")
    .eq("user_id", user.id).order("started_at", { ascending: false }).limit(10);
  const runs = (data ?? []) as DiagnosticRun[];
  return <main className="mx-auto max-w-6xl px-5 py-10 text-slate-100">
    <Link className="text-sm text-violet-300" href="/job-agent">← Back to Job Agent</Link>
    <h1 className="mt-5 text-3xl font-semibold">Search Diagnostics</h1>
    <p className="mt-2 text-sm text-slate-400">Last 10 search runs. Source errors and unverified results are not counted as an absence of jobs. Counts describe processing stages, not necessarily distinct sets that can be added together.</p>
    {error ? <p role="alert" className="mt-5 rounded-xl border border-rose-400/30 p-4 text-sm text-rose-200">Diagnostics unavailable. Check database migration and permissions. {error.message}</p> : null}
    {!error && runs.length === 0 ? <p className="mt-5 text-slate-400">No search runs recorded yet.</p> : null}
    <div className="mt-6 space-y-4">{runs.map(run => {
      const providers = Array.isArray(run.providers) ? run.providers : [];
      const summary = Object.entries(providers.reduce<Record<string, { attempts: number; records: number; errors: number }>>((acc, item) => {
        const key = item.provider || "Unknown";
        const current = acc[key] ?? { attempts: 0, records: 0, errors: 0 };
        current.attempts++;
        current.records += count(item.records_received);
        if (item.status !== "success" && item.status !== "no_results") current.errors++;
        acc[key] = current;
        return acc;
      }, {}));
      return <details key={run.search_run_id} className="rounded-2xl border border-white/10 bg-white/[.025] p-4">
        <summary className="cursor-pointer text-sm font-semibold">{new Date(run.started_at).toLocaleString()} · {run.run_status} · {label[run.diagnostic_category] ?? run.diagnostic_category}</summary>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([["Received",run.provider_records],["Unique",run.deduplicated_count],["Eligible",run.eligible_count],["Unverified",run.unverified_count],["Blocked",run.blocked_count],["Recommended",run.recommended_count],["Provider errors",run.provider_errors],["Planned queries",run.queries_planned]] as const).map(([key,value]) =>
            <div key={key} className="rounded-lg border border-white/10 p-3"><p className="text-xl font-semibold">{count(value)}</p><p className="text-xs text-slate-400">{key}</p></div>
          )}
        </div>
        <h2 className="mt-5 text-sm font-semibold">Sources actually queried</h2>
        <div className="mt-2 overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-white/10 text-slate-400"><th className="p-2">Provider</th><th className="p-2">Attempts</th><th className="p-2">Records</th><th className="p-2">Errors</th></tr></thead>
        <tbody>{summary.map(([provider,stats])=><tr className="border-b border-white/5" key={provider}><td className="p-2">{provider}</td><td className="p-2">{stats.attempts}</td><td className="p-2">{stats.records}</td><td className="p-2">{stats.errors}</td></tr>)}</tbody></table></div>
        <details className="mt-4"><summary className="cursor-pointer text-xs text-violet-300">View query, country, and error for every provider attempt</summary>
          <ul className="mt-2 space-y-2 text-xs text-slate-400">{providers.map((p,i)=><li key={i} className="rounded-lg border border-white/5 p-2">{p.provider} · {p.country || p.location || "unspecified location"} · {p.query || "default query"} · {p.status} · {count(p.records_received)} records {p.error_code ? `· ${p.error_code}` : ""}</li>)}</ul>
        </details>
      </details>;
    })}</div>
  </main>;
}
