import Link from "next/link";
import { notFound } from "next/navigation";
import { RunProcessor } from "@/components/admin/IntelligenceControls";
import { requireAdmin } from "@/lib/admin/adminAuth";
import {
  getRefreshRun, listRefreshItems, snapshotsByIds,
} from "@/lib/admin/adminIntelligenceRepository";
import { isActiveRefreshItem } from "@/lib/intelligence/refreshLifecycle";

export default async function RunPage({ params }: { params: Promise<{ runId: string }> }) {
  const auth = await requireAdmin();
  if (auth.status !== "admin") return null;
  const { runId } = await params;
  const [run, items] = await Promise.all([
    getRefreshRun(auth.accessToken, runId), listRefreshItems(auth.accessToken, runId),
  ]);
  if (!run) notFound();
  const candidateIds = items.flatMap(item => item.candidate_snapshot_id ? [item.candidate_snapshot_id] : []);
  const candidates = await snapshotsByIds(auth.accessToken, candidateIds);
  const candidateById = new Map(candidates.map(candidate => [candidate.id, candidate]));
  const activeItems = items.filter(item => isActiveRefreshItem(item.status));
  const active = activeItems.length > 0;
  const reason = activeItems.some(item => item.status === "running")
    ? "An item is currently processing."
    : activeItems.some(item => item.status === "queued")
      ? `${activeItems.filter(item => item.status === "queued").length} queued item(s) remain.`
      : activeItems.length
        ? `${activeItems.length} item(s) are waiting for a scheduled retry.`
        : "All refresh execution items are terminal. Candidate review is tracked separately.";

  return <main className="p-4 sm:p-8">
    <Link href="/admin/intelligence/runs" className="text-sm text-cyan-300 underline">← Refresh runs</Link>
    <h2 className="mt-5 font-display text-3xl font-semibold text-white">Run {run.id.slice(0, 8)}</h2>
    <div className="mt-3 grid gap-3 sm:grid-cols-3">
      <Summary label="Execution status" value={run.status} />
      <Summary label="Provider" value={run.provider} />
      <Summary label="Requested sample" value={`${run.requested_sample_size} per item`} />
    </div>
    <p className="mt-3 text-sm text-slate-400">{reason}</p>
    <div className="mt-5"><RunProcessor runId={run.id} active={active} /></div>
    <div className="mt-6 space-y-2">{items.map(item => {
      const candidate = item.candidate_snapshot_id ? candidateById.get(item.candidate_snapshot_id) : null;
      return <article key={item.id} className="rounded-2xl border border-white/10 p-4">
        <div className="flex flex-wrap justify-between gap-2">
          <h3 className="font-semibold">{item.career_slug} · {item.country_code.toUpperCase()} · {item.capability}</h3>
          <span className="text-xs uppercase text-slate-400">Execution: {item.status}</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">Pages {item.pages_requested} · Retrieved {item.records_retrieved} · Unique analyzed {item.unique_records_analyzed} · Attempts {item.attempt_count}</p>
        {item.status === "retryable" && item.retry_after ? <p className="mt-2 text-sm text-amber-200">Next retry eligible {new Date(item.retry_after).toLocaleString()}.</p> : null}
        {item.error_code ? <p className="mt-2 text-sm text-rose-200">{item.error_code}: {item.error_message}</p> : null}
        {candidate ? <p className="mt-2 text-sm text-slate-300">Review outcome: <strong className="uppercase">{candidate.status}</strong>{candidate.reviewed_at ? ` · ${new Date(candidate.reviewed_at).toLocaleString()}` : " · awaiting Admin review"}</p> : <p className="mt-2 text-sm text-slate-500">Review outcome: no candidate created.</p>}
        {candidate ? <Link className="mt-2 inline-block text-sm text-cyan-300 underline" href={`/admin/intelligence/candidates/${candidate.id}`}>{candidate.status === "validating" ? "Review candidate" : "View candidate record"}</Link> : null}
      </article>;
    })}</div>
  </main>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 uppercase text-slate-200">{value}</p></div>;
}
