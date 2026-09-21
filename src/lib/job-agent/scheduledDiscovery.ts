import "server-only";

import { searchJobsForScheduledUser } from "@/app/(account)/job-agent/searchActions";
import {
  executeScheduledJobDiscovery,
  scheduledDiscoveryMaxUsers,
  type ScheduledDiscoveryAgent,
} from "@/lib/job-agent/scheduledDiscoveryRunner";

function config() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  const secret = process.env.CRON_SECRET;
  return url && key && secret ? { url: url.replace(/\/$/, ""), key, secret } : null;
}

export function scheduledDiscoveryEnabled() {
  if (process.env.JOB_DISCOVERY_SCHEDULED_KILL_SWITCH === "true") return false;
  if (process.env.JOB_DISCOVERY_SCHEDULED_ENABLED === "true") return true;
  return process.env.VERCEL_ENV === "production";
}

export async function runScheduledJobDiscovery() {
  const enabled = scheduledDiscoveryEnabled();
  const database = config();
  const maxUsers = scheduledDiscoveryMaxUsers(process.env.JOB_DISCOVERY_SCHEDULED_MAX_USERS);

  console.info("Job Agent scheduled discovery readiness", { enabled, databaseConfigured: Boolean(database), maxUsers });

  if (!enabled) return { status: "disabled", attempted: 0, completed: 0, failed: 0, outcomes: [] };
  if (!database) throw new Error("SCHEDULED_DISCOVERY_NOT_CONFIGURED");

  const result = await executeScheduledJobDiscovery({
    maxUsers,
    async loadAgents(limit) {
      const response = await fetch(
        `${database.url}/rest/v1/job_agents?status=eq.active&select=user_id,updated_at&order=updated_at.asc&limit=${limit}`,
        {
          // Modern sb_secret_* keys are API keys, not user JWTs. Sending them as
          // Authorization: Bearer can make Supabase reject the request with 401.
          headers: { apikey: database.key },
          cache: "no-store",
          signal: AbortSignal.timeout(10_000),
        },
      );
      if (!response.ok) throw new Error(`SCHEDULED_DISCOVERY_DATABASE_${response.status}`);
      return response.json() as Promise<ScheduledDiscoveryAgent[]>;
    },
    async searchUser(userId) {
      const result = await searchJobsForScheduledUser(userId, database.secret);
      return "error" in result ? { ok: false, code: result.error } : { ok: true, code: result.outcome };
    },
  });

  console.info("Job Agent scheduled discovery outcome", {
    status: result.status,
    attempted: result.attempted,
    completed: result.completed,
    failed: result.failed,
    codes: result.outcomes.map((outcome) => outcome.code),
  });
  return result;
}
