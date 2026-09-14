import "server-only";

import { searchJobsForScheduledUser } from "@/app/(account)/job-agent/searchActions";

type AgentRow = { user_id: string; updated_at: string };

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  const secret = process.env.CRON_SECRET;
  return url && key && secret ? { url, key, secret } : null;
}

export async function runScheduledJobDiscovery() {
  if (process.env.JOB_DISCOVERY_SCHEDULED_ENABLED !== "true") return { status: "disabled", attempted: 0, completed: 0, failed: 0 };
  const database = config();
  if (!database) throw new Error("SCHEDULED_DISCOVERY_NOT_CONFIGURED");
  const maxUsers = Math.max(1, Math.min(5, Number(process.env.JOB_DISCOVERY_SCHEDULED_MAX_USERS) || 2));
  const response = await fetch(`${database.url}/rest/v1/job_agents?status=eq.active&select=user_id,updated_at&order=updated_at.asc&limit=${maxUsers}`, { headers: { apikey: database.key, Authorization: `Bearer ${database.key}` }, cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`SCHEDULED_DISCOVERY_DATABASE_${response.status}`);
  const agents = await response.json() as AgentRow[];
  const outcomes = await Promise.all(agents.map(async (agent) => {
    try {
      const result = await searchJobsForScheduledUser(agent.user_id, database.secret);
      return "error" in result ? { ok: false, code: result.error } : { ok: true, code: result.outcome };
    } catch (error) {
      return { ok: false, code: error instanceof Error ? error.message.slice(0, 80) : "SCHEDULED_DISCOVERY_FAILED" };
    }
  }));
  return { status: outcomes.some((outcome) => !outcome.ok) ? "partial" : "completed", attempted: outcomes.length, completed: outcomes.filter((outcome) => outcome.ok).length, failed: outcomes.filter((outcome) => !outcome.ok).length, outcomes };
}
