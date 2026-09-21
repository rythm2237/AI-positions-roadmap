import { NextResponse } from "next/server";
import { createClient as createServiceSupabaseClient } from "@supabase/supabase-js";
import { configuredJobProviders } from "@/lib/job-agent/providers/gateway";
import { scheduledDiscoveryEnabled } from "@/lib/job-agent/scheduledDiscovery";

export const dynamic = "force-dynamic";

const normalizedUrl = (value: string | undefined) => value?.trim().replace(/\/$/, "") || null;
const projectRef = (value: string | null) => {
  if (!value) return null;
  try {
    const hostname = new URL(value).hostname;
    const match = hostname.match(/^([a-z0-9]+)\.supabase\.co$/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
};

function dbConfig() {
  const serverUrl = normalizedUrl(process.env.SUPABASE_URL);
  const publicUrl = normalizedUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const url = serverUrl ?? publicUrl;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  return url && key ? { url, key, serverUrl, publicUrl } : null;
}

const keyKind = (value: string | undefined) => {
  if (!value) return "missing";
  if (value.startsWith("sb_secret_")) return "modern_secret";
  if (value.startsWith("eyJ")) return "legacy_jwt";
  return "unknown";
};

export async function GET() {
  const providers = configuredJobProviders();
  const db = dbConfig();

  let agentsData: Array<{ user_id: string }> | null = null;
  let runsData: Array<{ started_at: string; status: string; error_code: string | null }> | null = null;
  let agentsError: string | null = null;
  let runsError: string | null = null;

  if (db) {
    const serviceClient = createServiceSupabaseClient(db.url, db.key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const [agents, runs] = await Promise.all([
      serviceClient.from("job_agents").select("user_id").eq("status", "active").limit(20).returns<Array<{ user_id: string }>>(),
      serviceClient.from("job_search_runs").select("started_at,status,error_code").order("started_at", { ascending: false }).limit(1).returns<Array<{ started_at: string; status: string; error_code: string | null }>>(),
    ]);
    agentsData = agents.data;
    runsData = runs.data;
    agentsError = agents.error?.code ?? null;
    runsError = runs.error?.code ?? null;
  }

  return NextResponse.json({
    ok: true,
    scheduledDiscovery: {
      enabled: scheduledDiscoveryEnabled(),
      maxUsers: Math.max(1, Math.min(5, Number(process.env.JOB_DISCOVERY_SCHEDULED_MAX_USERS) || 2)),
      killSwitch: process.env.JOB_DISCOVERY_SCHEDULED_KILL_SWITCH === "true",
    },
    databaseConfigured: Boolean(db),
    databaseReachable: Boolean(db) && !agentsError && !runsError,
    databaseStatus: {
      agents: agentsError ?? "ok",
      runs: runsError ?? "ok",
    },
    databaseEnvironment: {
      selectedProjectRef: projectRef(db?.url ?? null),
      serverProjectRef: projectRef(db?.serverUrl ?? null),
      publicProjectRef: projectRef(db?.publicUrl ?? null),
      keyKind: keyKind(process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY),
      serverAndPublicMatch: Boolean(db?.serverUrl && db?.publicUrl && projectRef(db.serverUrl) === projectRef(db.publicUrl)),
    },
    providers: providers.map((provider) => provider.name),
    providerCount: providers.length,
    activeAgentCount: agentsData?.length ?? null,
    latestSearchRun: runsData?.[0] ?? null,
  });
}
