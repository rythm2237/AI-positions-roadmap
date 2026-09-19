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

export async function runScheduledJobDiscovery() {
  if (process.env.JOB_DISCOVERY_SCHEDULED_ENABLED !== "true") {
    return { status: "disabled", attempted: 0, completed: 0, failed: 0, outcomes: [] };
  }

  const database = config();
  if (!database) throw new Error("SCHEDULED_DISCOVERY_NOT_CONFIGURED");

  const maxUsers = scheduledDiscoveryMaxUsers(process.env.JOB_DISCOVERY_SCHEDULED_MAX_USERS);
  return executeScheduledJobDiscovery({
    maxUsers,
    async loadAgents(limit) {
      const response = await fetch(
        `${database.url}/rest/v1/job_agents?status=eq.active&select=user_id,updated_at&order=updated_at.asc&limit=${limit}`,
        {
          headers: {
            apikey: database.key,
            Authorization: `Bearer ${database.key}`,
          },
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
}
