import "server-only";

import type { JobAgent } from "@/types/jobAgent";
import { localScheduleParts } from "@/lib/job-agent/notificationSchedule";
import { renderDailyJobDigestEmail, type DailyDigestJob } from "@/lib/job-agent/dailyDigestEmail";

type ServiceAgent = JobAgent & { user_id: string };
type ServiceProfile = { id: string; email: string; name: string | null };
type SavedRow = { user_id: string; job_id: string; saved_at: string };
type DeliveryRow = { id: string; inbox_item_id: string | null };
type InboxRef = { id: string; job_id: string | null };
type ReportRow = { id: string; status: string; sent_at?: string | null };

const jobSelect = "id,user_id,fit_score,status,recommendation,eligibility_status,decision_status,company,role,location,country,salary_min,salary_max,salary_currency,job_url,discovered_at";

function dbConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

async function serviceFetch<T>(path: string, init: RequestInit = {}) {
  const db = dbConfig();
  if (!db) throw new Error("JOB_AGENT_DATABASE_NOT_CONFIGURED");
  const response = await fetch(`${db.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: db.key,
      Authorization: `Bearer ${db.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...init.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`JOB_AGENT_DATABASE_${response.status}`);
  if (response.status === 204) return [] as T;
  return response.json() as Promise<T>;
}

async function sendEmail(input: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.JOB_AGENT_FROM_EMAIL ?? "AI Role Path Job Agent <jobs@rythm-os.com>";
  const replyTo = process.env.JOB_AGENT_REPLY_TO ?? process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "career-support@rythm-os.com";
  if (!apiKey) throw new Error("RESEND_NOT_CONFIGURED");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [input.to],
      reply_to: replyTo,
      subject: input.subject.replace(/[\r\n]+/g, " ").slice(0, 180),
      html: input.html,
    }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`RESEND_${response.status}${body ? `:${body.slice(0, 90)}` : ""}`);
  }
  const payload = await response.json().catch(() => ({})) as { id?: string };
  return payload.id ?? null;
}

async function fetchSavedJobs(userId: string) {
  const saved = await serviceFetch<SavedRow[]>(`job_saved_jobs?user_id=eq.${userId}&select=user_id,job_id,saved_at&order=saved_at.desc`);
  const ids = [...new Set(saved.map((row) => row.job_id))];
  if (!ids.length) return [];
  const jobs = await serviceFetch<DailyDigestJob[]>(`job_opportunities?id=in.(${ids.join(",")})&select=${jobSelect}`);
  const byId = new Map(jobs.map((job) => [job.id, job]));
  return saved.flatMap((row) => {
    const job = byId.get(row.job_id);
    if (!job || job.status === "skipped" || job.recommendation === "skip" || job.decision_status === "rejected") return [];
    return [job];
  });
}

export async function batchPendingJobEmailDeliveries() {
  const deliveries = await serviceFetch<DeliveryRow[]>("job_notification_deliveries?channel=eq.email&status=eq.pending&select=id,inbox_item_id&limit=1000");
  const inboxIds = [...new Set(deliveries.map((row) => row.inbox_item_id).filter((id): id is string => Boolean(id)))];
  const inboxRows = inboxIds.length
    ? await serviceFetch<InboxRef[]>(`job_agent_inbox?id=in.(${inboxIds.join(",")})&select=id,job_id`)
    : [];
  const jobInboxIds = new Set(inboxRows.filter((row) => Boolean(row.job_id)).map((row) => row.id));

  let batched = 0;
  for (const row of deliveries) {
    if (!row.inbox_item_id || !jobInboxIds.has(row.inbox_item_id)) continue;
    await serviceFetch(`job_notification_deliveries?id=eq.${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "skipped", error_code: "BATCHED_IN_DAILY_DIGEST" }),
    });
    batched++;
  }
  return { pending: deliveries.length, batched };
}

export async function sendDueDailyJobDigests(now = new Date()) {
  const agents = await serviceFetch<ServiceAgent[]>("job_agents?status=eq.active&select=*");
  const dueAgents = agents.flatMap((agent) => {
    if (agent.report_frequency !== "daily" || !agent.notification_channels.includes("email")) return [];
    try {
      const periodKey = localScheduleParts(now, agent.timezone || "UTC").date;
      return [{ agent, schedule: { type: "daily" as const, periodKey } }];
    } catch {
      return [];
    }
  });
  if (!dueAgents.length) return { checked: agents.length, due: 0, sent: 0, failed: 0, skippedAlreadySent: 0 };

  const userIds = dueAgents.map(({ agent }) => agent.user_id);
  const profiles = await serviceFetch<ServiceProfile[]>(`profiles?id=in.(${userIds.join(",")})&select=id,email,name`);
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  let sent = 0;
  let failed = 0;
  let skippedAlreadySent = 0;

  for (const { agent, schedule } of dueAgents) {
    const existing = await serviceFetch<ReportRow[]>(`job_agent_reports?agent_id=eq.${agent.id}&report_type=eq.daily&period_key=eq.${encodeURIComponent(schedule.periodKey)}&delivery_channel=eq.email&select=id,status,sent_at&limit=1`);
    if (existing[0]?.status === "sent") {
      skippedAlreadySent++;
      continue;
    }
    const profile = profileMap.get(agent.user_id);
    if (!profile?.email) continue;

    const previous = await serviceFetch<ReportRow[]>(`job_agent_reports?agent_id=eq.${agent.id}&report_type=eq.daily&delivery_channel=eq.email&status=eq.sent&sent_at=not.is.null&select=id,status,sent_at&order=sent_at.desc&limit=1`);
    const since = previous[0]?.sent_at ?? new Date(now.getTime() - 26 * 60 * 60 * 1000).toISOString();
    const recent = await serviceFetch<DailyDigestJob[]>(`job_opportunities?user_id=eq.${agent.user_id}&discovered_at=gt.${encodeURIComponent(since)}&discovered_at=lte.${encodeURIComponent(now.toISOString())}&select=${jobSelect}&order=discovered_at.desc&limit=1000`);
    const jobs = recent
      .filter((job) => job.status !== "skipped" && job.recommendation !== "skip" && job.decision_status !== "rejected" && job.decision_status !== "approved")
      .sort((a, b) => (b.fit_score ?? -1) - (a.fit_score ?? -1) || Date.parse(b.discovered_at) - Date.parse(a.discovered_at));

    const savedJobs = await fetchSavedJobs(agent.user_id);
    const summary = {
      found: jobs.length,
      verified: jobs.filter((job) => job.eligibility_status === "eligible").length,
      unverified: jobs.filter((job) => job.eligibility_status === "unverified").length,
      strongMatches: jobs.filter((job) => (job.fit_score ?? 0) >= agent.strong_match_threshold).length,
      saved: savedJobs.length,
      windowStartedAt: since,
      windowEndedAt: now.toISOString(),
    };
    const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.airolepath.com").replace(/\/$/, "");
    const html = renderDailyJobDigestEmail({
      userId: agent.user_id,
      name: profile.name,
      jobs,
      savedJobs,
      site,
      periodLabel: schedule.periodKey,
    });

    let ledgerId = existing[0]?.id;
    if (!ledgerId) {
      const created = await serviceFetch<Array<{ id: string }>>("job_agent_reports", {
        method: "POST",
        body: JSON.stringify({
          user_id: agent.user_id,
          agent_id: agent.id,
          report_type: "daily",
          period_key: schedule.periodKey,
          delivery_channel: "email",
          status: "pending",
          summary,
        }),
      });
      ledgerId = created[0]?.id;
    }

    try {
      const providerId = await sendEmail({
        to: profile.email,
        subject: `${jobs.length} jobs found in your daily Job Agent run — AI Role Path`,
        html,
      });
      if (ledgerId) {
        await serviceFetch(`job_agent_reports?id=eq.${ledgerId}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "sent", sent_at: now.toISOString(), summary: { ...summary, providerMessageId: providerId }, error_code: null }),
        });
      }
      sent++;
    } catch (error) {
      if (ledgerId) {
        await serviceFetch(`job_agent_reports?id=eq.${ledgerId}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "failed", summary, error_code: error instanceof Error ? error.message.slice(0, 180) : "SEND_FAILED" }),
        }).catch(() => null);
      }
      failed++;
    }
  }

  return { checked: agents.length, due: dueAgents.length, sent, failed, skippedAlreadySent };
}
