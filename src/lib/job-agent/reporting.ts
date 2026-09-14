import "server-only";

import type { JobAgent } from "@/types/jobAgent";
import { jobReportDue } from "@/lib/job-agent/notificationSchedule";
import { renderJobDigestEmail, type DigestJob } from "@/lib/job-agent/digestEmail";

type ServiceAgent = JobAgent & { user_id: string };
type ServiceProfile = { id: string; email: string; name: string | null };
type OpportunityRow = DigestJob & { snoozed_until: string | null };
type ApplicationRow = {
  user_id: string;
  status: string;
  next_action: string | null;
  created_at: string;
  job_opportunities?: { company?: string; role?: string } | Array<{ company?: string; role?: string }> | null;
};
type SavedRow = { user_id: string; job_id: string; saved_at: string };

type InboxDelivery = { id: string; user_id: string; inbox_item_id: string; idempotency_key: string };
type InboxRow = {
  id: string;
  user_id: string;
  job_id: string | null;
  title: string;
  body: string;
  category: string;
  recommended_action: string | null;
  deep_link: string | null;
  priority: string;
};

function dbConfig() {
  const url = process.env.SUPABASE_URL;
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
  return response.json() as Promise<T>;
}

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[char] ?? char));

async function sendEmail(input: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("RESEND_NOT_CONFIGURED");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject.replace(/[\r\n]+/g, " ").slice(0, 180),
      html: input.html,
    }),
  });
  if (!response.ok) throw new Error(`RESEND_${response.status}`);
  const payload = await response.json().catch(() => ({})) as { id?: string };
  return payload.id ?? null;
}

const jobSelect = "id,user_id,fit_score,status,recommendation,eligibility_status,decision_status,snoozed_until,company,role,location,country,salary_min,salary_max,salary_currency,job_url,discovered_at";

async function fetchSavedJobs(userIds: string[]) {
  if (!userIds.length) return new Map<string, OpportunityRow[]>();
  const saved = await serviceFetch<SavedRow[]>(`job_saved_jobs?user_id=in.(${userIds.join(",")})&select=user_id,job_id,saved_at&order=saved_at.desc`);
  const ids = [...new Set(saved.map((row) => row.job_id))];
  const jobs = ids.length
    ? await serviceFetch<OpportunityRow[]>(`job_opportunities?id=in.(${ids.join(",")})&select=${jobSelect}`)
    : [];
  const byId = new Map(jobs.map((job) => [job.id, job]));
  const result = new Map<string, OpportunityRow[]>();
  for (const row of saved) {
    const job = byId.get(row.job_id);
    if (!job || job.status === "skipped" || job.recommendation === "skip" || job.decision_status === "rejected") continue;
    const current = result.get(row.user_id) ?? [];
    current.push(job);
    result.set(row.user_id, current);
  }
  return result;
}

function appendInboxUpdates(html: string, updates: InboxRow[], site: string) {
  if (!updates.length) return html;
  const updateCards = updates.slice(0, 8).map((item) => {
    const href = item.deep_link?.startsWith("/") ? `${site}${item.deep_link}` : `${site}/job-agent`;
    return `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:14px;margin:8px 0"><div style="font-size:13px;font-weight:800;color:#111827">${escapeHtml(item.title)}</div><div style="font-size:12px;line-height:18px;color:#64748b;margin-top:5px">${escapeHtml(item.body)}</div><div style="margin-top:8px"><a href="${escapeHtml(href)}" style="font-size:12px;font-weight:800;color:#315efb;text-decoration:none">Open update ↗</a></div></div>`;
  }).join("");
  const section = `<div style="margin-top:14px"><div style="font-size:15px;font-weight:800;color:#111827;padding:0 4px 6px">Other Job Agent updates</div>${updateCards}</div>`;
  return html.replace("<div style=\"font-size:11px;line-height:18px;color:#94a3b8;text-align:center;padding:20px 14px\">", `${section}<div style="font-size:11px;line-height:18px;color:#94a3b8;text-align:center;padding:20px 14px">`);
}

export async function sendPendingJobInboxEmails(now = new Date()) {
  const deliveries = await serviceFetch<InboxDelivery[]>("job_notification_deliveries?channel=eq.email&status=eq.pending&select=id,user_id,inbox_item_id,idempotency_key&order=created_at.asc&limit=200");
  if (!deliveries.length) return { pending: 0, digests: 0, sent: 0, failed: 0, skipped: 0 };

  const userIds = [...new Set(deliveries.map((item) => item.user_id))];
  const inboxIds = [...new Set(deliveries.map((item) => item.inbox_item_id))];
  const [profiles, agents, inboxItems, savedByUser] = await Promise.all([
    serviceFetch<ServiceProfile[]>(`profiles?id=in.(${userIds.join(",")})&select=id,email,name`),
    serviceFetch<ServiceAgent[]>(`job_agents?user_id=in.(${userIds.join(",")})&select=*`),
    serviceFetch<InboxRow[]>(`job_agent_inbox?id=in.(${inboxIds.join(",")})&select=id,user_id,job_id,title,body,category,recommended_action,deep_link,priority`),
    fetchSavedJobs(userIds),
  ]);

  const jobIds = [...new Set(inboxItems.map((item) => item.job_id).filter((id): id is string => Boolean(id)))];
  const inboxJobs = jobIds.length
    ? await serviceFetch<OpportunityRow[]>(`job_opportunities?id=in.(${jobIds.join(",")})&select=${jobSelect}`)
    : [];
  const jobById = new Map(inboxJobs.map((job) => [job.id, job]));
  const profileById = new Map(profiles.map((item) => [item.id, item]));
  const agentByUser = new Map(agents.map((item) => [item.user_id, item]));
  const inboxById = new Map(inboxItems.map((item) => [item.id, item]));
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.airolepath.com").replace(/\/$/, "");

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  let digests = 0;

  for (const userId of userIds) {
    const userDeliveries = deliveries.filter((item) => item.user_id === userId);
    const profile = profileById.get(userId);
    const agent = agentByUser.get(userId);
    if (!profile?.email || !agent?.notification_channels.includes("email")) {
      for (const delivery of userDeliveries) {
        await serviceFetch(`job_notification_deliveries?id=eq.${delivery.id}`, { method: "PATCH", body: JSON.stringify({ status: "skipped", error_code: "EMAIL_DISABLED_OR_CONTEXT_MISSING" }) });
        skipped++;
      }
      continue;
    }

    const items = userDeliveries.map((delivery) => inboxById.get(delivery.inbox_item_id)).filter((item): item is InboxRow => Boolean(item));
    const seen = new Set<string>();
    const newJobs = items.flatMap((item) => {
      if (!item.job_id || seen.has(item.job_id)) return [];
      const job = jobById.get(item.job_id);
      if (!job || job.status === "skipped" || job.recommendation === "skip" || job.decision_status === "rejected" || job.decision_status === "approved") return [];
      seen.add(item.job_id);
      return [job];
    }).sort((a, b) => (b.fit_score ?? 0) - (a.fit_score ?? 0));
    const generalUpdates = items.filter((item) => !item.job_id);

    let html = renderJobDigestEmail({
      userId,
      name: profile.name,
      newJobs,
      savedJobs: savedByUser.get(userId) ?? [],
      site,
      reportLabel: "your Job Agent has grouped the latest activity into one digest",
    });
    html = appendInboxUpdates(html, generalUpdates, site);

    try {
      const providerId = await sendEmail({
        to: profile.email,
        subject: newJobs.length ? `${newJobs.length} new Job Agent match${newJobs.length === 1 ? "" : "es"} — AI Role Path` : "Your Job Agent digest — AI Role Path",
        html,
      });
      for (const delivery of userDeliveries) {
        await serviceFetch(`job_notification_deliveries?id=eq.${delivery.id}`, { method: "PATCH", body: JSON.stringify({ status: "sent", provider_message_id: providerId, sent_at: now.toISOString(), error_code: null }) });
        sent++;
      }
      digests++;
    } catch (error) {
      for (const delivery of userDeliveries) {
        await serviceFetch(`job_notification_deliveries?id=eq.${delivery.id}`, { method: "PATCH", body: JSON.stringify({ status: "failed", error_code: error instanceof Error ? error.message.slice(0, 120) : "EMAIL_SEND_FAILED" }) }).catch(() => null);
        failed++;
      }
    }
  }

  return { pending: deliveries.length, digests, sent, failed, skipped };
}

type FollowUpRow = {
  id: string;
  user_id: string;
  application_id: string;
  due_at: string;
  suggested_action: string;
  applications?: {
    job_id?: string;
    job_opportunities?: { company?: string; role?: string } | Array<{ company?: string; role?: string }> | null;
  } | Array<{
    job_id?: string;
    job_opportunities?: { company?: string; role?: string } | Array<{ company?: string; role?: string }> | null;
  }> | null;
};

export async function enqueueDueJobFollowUps(now = new Date()) {
  const rows = await serviceFetch<FollowUpRow[]>(`job_follow_ups?status=eq.pending&due_at=lte.${encodeURIComponent(now.toISOString())}&select=id,user_id,application_id,due_at,suggested_action,applications(job_id,job_opportunities(company,role))&limit=100`);
  let enqueued = 0;
  for (const row of rows) {
    const rawApplication = row.applications;
    const application = Array.isArray(rawApplication) ? rawApplication[0] : rawApplication;
    const rawJob = application?.job_opportunities;
    const job = Array.isArray(rawJob) ? rawJob[0] : rawJob;
    const inserted = await serviceFetch<Array<{ id: string }>>("job_agent_inbox?on_conflict=user_id,dedupe_key", {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({
        user_id: row.user_id,
        job_id: application?.job_id ?? null,
        application_id: row.application_id,
        category: "follow_up_due",
        title: `Follow-up due${job?.company ? ` — ${job.company}` : ""}`.slice(0, 160),
        body: `${job?.role ?? "Application"} is due for a status review.`,
        priority: "normal",
        recommended_action: row.suggested_action,
        deep_link: `/job-agent/applications/${row.application_id}`,
        dedupe_key: `follow-up:${row.id}`,
      }),
    }).catch(() => []);
    if (inserted.length) enqueued++;
  }
  return { due: rows.length, enqueued };
}

export async function sendDueJobAgentReports(now = new Date()) {
  const agents = await serviceFetch<ServiceAgent[]>("job_agents?status=eq.active&select=*");
  const dueAgents = agents.flatMap((agent) => {
    const schedule = jobReportDue(agent, now);
    return schedule ? [{ agent, schedule }] : [];
  });
  if (!dueAgents.length) return { checked: agents.length, due: 0, sent: 0, failed: 0 };

  const ids = dueAgents.map(({ agent }) => agent.user_id);
  const idFilter = ids.join(",");
  const since = new Date(now.getTime() - 40 * 86400000).toISOString();
  const [profiles, jobs, applications, savedByUser] = await Promise.all([
    serviceFetch<ServiceProfile[]>(`profiles?id=in.(${idFilter})&select=id,email,name`),
    serviceFetch<OpportunityRow[]>(`job_opportunities?user_id=in.(${idFilter})&eligibility_status=eq.eligible&discovered_at=gte.${encodeURIComponent(since)}&select=${jobSelect}`),
    serviceFetch<ApplicationRow[]>(`applications?user_id=in.(${idFilter})&created_at=gte.${encodeURIComponent(since)}&select=user_id,status,next_action,created_at,job_opportunities(company,role)`),
    fetchSavedJobs(ids),
  ]);
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  let sent = 0;
  let failed = 0;

  for (const { agent, schedule } of dueAgents) {
    const existing = await serviceFetch<Array<{ id: string; status: string }>>(`job_agent_reports?agent_id=eq.${agent.id}&report_type=eq.${schedule.type}&period_key=eq.${encodeURIComponent(schedule.periodKey)}&delivery_channel=eq.email&select=id,status&limit=1`);
    if (existing[0]?.status === "sent") continue;
    const profile = profileMap.get(agent.user_id);
    if (!profile?.email) continue;

    const userJobs = jobs
      .filter((job) => job.user_id === agent.user_id && job.eligibility_status === "eligible" && job.status !== "skipped" && job.recommendation !== "skip" && job.decision_status !== "rejected" && job.decision_status !== "approved" && (job.decision_status !== "snoozed" || !job.snoozed_until || Date.parse(job.snoozed_until) <= now.getTime()))
      .sort((a, b) => (b.fit_score ?? 0) - (a.fit_score ?? 0))
      .slice(0, 12);
    const userApps = applications.filter((application) => application.user_id === agent.user_id);
    const summary = {
      reviewed: userJobs.length,
      qualified: userJobs.filter((job) => (job.fit_score ?? 0) >= agent.auto_prepare_threshold).length,
      strongMatches: userJobs.filter((job) => (job.fit_score ?? 0) >= agent.strong_match_threshold).length,
      applied: userApps.filter((application) => application.status === "applied" || application.status === "submitted").length,
      readyForSubmit: userApps.filter((application) => application.status === "ready_for_submit").length,
      needsDecision: userJobs.length,
      saved: (savedByUser.get(agent.user_id) ?? []).length,
    };
    const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.airolepath.com").replace(/\/$/, "");
    const html = renderJobDigestEmail({
      userId: agent.user_id,
      name: profile.name,
      newJobs: userJobs,
      savedJobs: savedByUser.get(agent.user_id) ?? [],
      site,
      reportLabel: schedule.type === "weekly" ? "here is your weekly verified job digest" : "here is today's verified job digest",
    });

    let ledgerId = existing[0]?.id;
    if (!ledgerId) {
      const created = await serviceFetch<Array<{ id: string }>>("job_agent_reports", {
        method: "POST",
        body: JSON.stringify({ user_id: agent.user_id, agent_id: agent.id, report_type: schedule.type, period_key: schedule.periodKey, delivery_channel: "email", status: "pending", summary }),
      });
      ledgerId = created[0]?.id;
    }

    try {
      await sendEmail({
        to: profile.email,
        subject: `${summary.needsDecision} verified job match${summary.needsDecision === 1 ? "" : "es"} — AI Role Path`,
        html,
      });
      if (ledgerId) await serviceFetch(`job_agent_reports?id=eq.${ledgerId}`, { method: "PATCH", body: JSON.stringify({ status: "sent", sent_at: now.toISOString(), summary, error_code: null }) });
      sent++;
    } catch (error) {
      if (ledgerId) await serviceFetch(`job_agent_reports?id=eq.${ledgerId}`, { method: "PATCH", body: JSON.stringify({ status: "failed", summary, error_code: error instanceof Error ? error.message.slice(0, 120) : "SEND_FAILED" }) }).catch(() => null);
      failed++;
    }
  }

  return { checked: agents.length, due: dueAgents.length, sent, failed };
}
