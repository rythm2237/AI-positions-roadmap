import { NextResponse } from "next/server";
import { configuredJobProviders } from "@/lib/job-agent/providers/gateway";

export const dynamic = "force-dynamic";

function dbConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

async function serviceGet<T>(path: string): Promise<T | null> {
  const db = dbConfig();
  if (!db) return null;
  try {
    const response = await fetch(`${db.url}/rest/v1/${path}`, {
      headers: { apikey: db.key, Authorization: `Bearer ${db.key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return null;
    return response.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function GET() {
  const providers = configuredJobProviders();
  const [agents, runs] = await Promise.all([
    serviceGet<Array<{ user_id: string }>>("job_agents?status=eq.active&select=user_id&limit=20"),
    serviceGet<Array<{ started_at: string; status: string; error_code: string | null }>>("job_search_runs?select=started_at,status,error_code&order=started_at.desc&limit=1"),
  ]);

  return NextResponse.json({
    ok: true,
    scheduledDiscovery: {
      enabled: process.env.JOB_DISCOVERY_SCHEDULED_ENABLED === "true",
      maxUsers: Math.max(1, Math.min(5, Number(process.env.JOB_DISCOVERY_SCHEDULED_MAX_USERS) || 2)),
    },
    databaseConfigured: Boolean(dbConfig()),
    providers: providers.map((provider) => provider.name),
    providerCount: providers.length,
    activeAgentCount: agents?.length ?? null,
    latestSearchRun: runs?.[0] ?? null,
  });
}
