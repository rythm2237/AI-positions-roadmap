import { NextResponse } from "next/server";
import { configuredJobProviders } from "@/lib/job-agent/providers/gateway";
import { scheduledDiscoveryEnabled } from "@/lib/job-agent/scheduledDiscovery";

export const dynamic = "force-dynamic";

function dbConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

async function serviceProbe<T>(path: string) {
  const db = dbConfig();
  if (!db) return { ok: false, status: null as number | null, data: null as T | null };
  try {
    const response = await fetch(`${db.url}/rest/v1/${path}`, {
      headers: { apikey: db.key },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return { ok: false, status: response.status, data: null as T | null };
    return { ok: true, status: response.status, data: await response.json() as T };
  } catch {
    return { ok: false, status: 0, data: null as T | null };
  }
}

export async function GET() {
  const providers = configuredJobProviders();
  const [agentsProbe, runsProbe] = await Promise.all([
    serviceProbe<Array<{ user_id: string }>>("job_agents?status=eq.active&select=user_id&limit=20"),
    serviceProbe<Array<{ started_at: string; status: string; error_code: string | null }>>("job_search_runs?select=started_at,status,error_code&order=started_at.desc&limit=1"),
  ]);

  return NextResponse.json({
    ok: true,
    scheduledDiscovery: {
      enabled: scheduledDiscoveryEnabled(),
      maxUsers: Math.max(1, Math.min(5, Number(process.env.JOB_DISCOVERY_SCHEDULED_MAX_USERS) || 2)),
      killSwitch: process.env.JOB_DISCOVERY_SCHEDULED_KILL_SWITCH === "true",
    },
    databaseConfigured: Boolean(dbConfig()),
    databaseReachable: agentsProbe.ok && runsProbe.ok,
    databaseStatus: { agents: agentsProbe.status, runs: runsProbe.status },
    providers: providers.map((provider) => provider.name),
    providerCount: providers.length,
    activeAgentCount: agentsProbe.data?.length ?? null,
    latestSearchRun: runsProbe.data?.[0] ?? null,
  });
}
