import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { supabaseServerConfig } from "@/lib/admin/supabaseServer";
import { configuredJobProviders } from "@/lib/job-agent/providers/gateway";
import { discoveryConfig } from "@/lib/job-agent/providerConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AttemptRow = { provider: string; status: string; records_received: number; normalized_count: number; latency_ms: number; cost_usd: number; created_at: string };
type RunRow = { fallback_triggered: boolean; started_at: string };
type SourceRow = { provider: string; job_id: string };
type VerificationRow = { job_id: string; status: string };

async function serviceRead<T>(path: string): Promise<T> {
  const { url, secretKey } = supabaseServerConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: secretKey, Authorization: `Bearer ${secretKey}` }, cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`DIAGNOSTICS_DATABASE_${response.status}`);
  return response.json() as Promise<T>;
}

export async function GET() {
  const authorization = await requireAdmin();
  if (authorization.status === "unauthenticated") return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  if (authorization.status !== "admin") return NextResponse.json({ error: "ADMIN_REQUIRED" }, { status: 403 });
  const since = encodeURIComponent(new Date(Date.now() - 30 * 86_400_000).toISOString());
  try {
    const providers = configuredJobProviders();
    const [attempts, runs, sources, verifications, health] = await Promise.all([
      serviceRead<AttemptRow[]>(`job_provider_attempts?select=provider,status,records_received,normalized_count,latency_ms,cost_usd,created_at&created_at=gte.${since}&order=created_at.desc&limit=5000`),
      serviceRead<RunRow[]>(`job_search_runs?select=fallback_triggered,started_at&started_at=gte.${since}&order=started_at.desc&limit=1000`),
      serviceRead<SourceRow[]>(`job_opportunity_sources?select=provider,job_id&last_seen_at=gte.${since}&limit=10000`),
      serviceRead<VerificationRow[]>(`job_verifications?select=job_id,status&verified_at=gte.${since}&limit=10000`),
      Promise.all(providers.map(async (provider) => ({ provider, health: await provider.health() }))),
    ]);
    const verifiedJobIds = new Set(verifications.filter((verification) => verification.status === "verified" || verification.status === "partially_verified").map((verification) => verification.job_id));
    const diagnostics = health.map(({ provider, health: providerHealth }) => {
      const rows = attempts.filter((attempt) => attempt.provider === provider.name);
      const successes = rows.filter((attempt) => attempt.status === "success");
      const failures = rows.filter((attempt) => ["provider_error", "rate_limit", "auth_failure", "invalid_query"].includes(attempt.status));
      return {
        provider: provider.name,
        providerType: provider.metadata.providerType,
        stage: provider.metadata.stage,
        priority: provider.metadata.priority,
        enabled: providerHealth.configured,
        status: providerHealth.status,
        reason: providerHealth.reason ?? null,
        lastSuccess: successes[0]?.created_at ?? null,
        lastFailure: failures[0]?.created_at ?? null,
        jobsReturned: rows.reduce((sum, row) => sum + (row.normalized_count || row.records_received), 0),
        jobsVerified: new Set(sources.filter((source) => source.provider === provider.name && verifiedJobIds.has(source.job_id)).map((source) => source.job_id)).size,
        averageLatencyMs: rows.length ? Math.round(rows.reduce((sum, row) => sum + row.latency_ms, 0) / rows.length) : null,
        estimatedCostUsd: rows.reduce((sum, row) => sum + Number(row.cost_usd || 0), 0),
      };
    });
    return NextResponse.json({ windowDays: 30, mode: discoveryConfig().mode, fallbackUsage: { runs: runs.filter((run) => run.fallback_triggered).length, totalRuns: runs.length }, providers: diagnostics }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ level: "error", message: "Job provider diagnostics failed", code: error instanceof Error ? error.message : "UNKNOWN" }));
    return NextResponse.json({ error: "DIAGNOSTICS_UNAVAILABLE" }, { status: 503 });
  }
}
