import "server-only";

import type { JobAgent } from "@/types/jobAgent";
import { jobReportDue } from "@/lib/job-agent/notificationSchedule";

type ServiceAgent = JobAgent & { user_id: string };
type ServiceProfile = { id: string; email: string; name: string | null };
type OpportunityRow = {
  id: string;
  user_id: string;
  fit_score: number | null;
  status: string;
  recommendation: string | null;
  eligibility_status: "eligible" | "blocked" | "unverified";
  decision_status: string;
  snoozed_until: string | null;
  company: string;
  role: string;
  location: string | null;
  country: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  job_url: string;
  discovered_at: string;
};
type ApplicationRow = { user_id: string; status: string; next_action: string | null; created_at: string; job_opportunities?: { company?: string; role?: string } | Array<{ company?: string; role?: string }> | null };

function dbConfig() { const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY; return url && key ? { url, key } : null; }
async function serviceFetch<T>(path: string, init: RequestInit = {}) { const db = dbConfig(); if (!db) throw new Error("JOB_AGENT_DATABASE_NOT_CONFIGURED"); const response = await fetch(`${db.url}/rest/v1/${path}`, { ...init, headers: { apikey: db.key, Authorization: `Bearer ${db.key}`, "Content-Type": "application/json", Prefer: "return=representation", ...init.headers }, cache: "no-store" }); if (!response.ok) throw new Error(`JOB_AGENT_DATABASE_${response.status}`); return response.json() as Promise<T>; }
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char] ?? char));
const salary = (job: OpportunityRow) => { if (job.salary_min == null && job.salary_max == null) return null; const c = job.salary_currency ?? ""; if (job.salary_min != null && job.salary_max != null) return `${c} ${Math.round(job.salary_min).toLocaleString()}–${Math.round(job.salary_max).toLocaleString()}`.trim(); return `${c} ${Math.round(job.salary_min ?? job.salary_max ?? 0).toLocaleString()}+`.trim(); };
async function sendEmail(input: { to: string; subject: string; html: string }) { const apiKey = process.env.RESEND_API_KEY; const from = process.env.RESEND_FROM_EMAIL; if (!apiKey || !from) throw new Error("RESEND_NOT_CONFIGURED"); const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [input.to], subject: input.subject.replace(/[\r\n]+/g, " ").slice(0, 180), html: input.html }) }); if (!response.ok) throw new Error(`RESEND_${response.status}`); const payload = await response.json().catch(() => ({})) as { id?: string }; return payload.id ?? null; }

type InboxDelivery = { id: string; user_id: string; inbox_item_id: string; idempotency_key: string };
type InboxRow = { id: string; user_id: string; title: string; body: string; category: string; recommended_action: string | null; deep_link: string | null; priority: string };

export async function sendPendingJobInboxEmails(now = new Date()) {
  const deliveries = await serviceFetch<InboxDelivery[]>("job_notification_deliveries?channel=eq.email&status=eq.pending&select=id,user_id,inbox_item_id,idempotency_key&order=created_at.asc&limit=100");
  if (!deliveries.length) return { pending: 0, sent: 0, failed: 0, skipped: 0 };
  const userIds = [...new Set(deliveries.map((item) => item.user_id))];
  const inboxIds = [...new Set(deliveries.map((item) => item.inbox_item_id))];
  const [profiles, agents, inboxItems] = await Promise.all([
    serviceFetch<ServiceProfile[]>(`profiles?id=in.(${userIds.join(",")})&select=id,email,name`),
    serviceFetch<ServiceAgent[]>(`job_agents?user_id=in.(${userIds.join(",")})&select=*`),
    serviceFetch<InboxRow[]>(`job_agent_inbox?id=in.(${inboxIds.join(",")})&select=id,user_id,title,body,category,recommended_action,deep_link,priority`),
  ]);
  const profileById = new Map(profiles.map((item) => [item.id, item]));
  const agentByUser = new Map(agents.map((item) => [item.user_id, item]));
  const inboxById = new Map(inboxItems.map((item) => [item.id, item]));
  let sent = 0, failed = 0, skipped = 0;
  for (const delivery of deliveries) {
    const profile = profileById.get(delivery.user_id); const agent = agentByUser.get(delivery.user_id); const inbox = inboxById.get(delivery.inbox_item_id);
    if (!profile?.email || !agent?.notification_channels.includes("email") || !inbox) {
      await serviceFetch(`job_notification_deliveries?id=eq.${delivery.id}`, { method: "PATCH", body: JSON.stringify({ status: "skipped", error_code: "EMAIL_DISABLED_OR_CONTEXT_MISSING" }) }); skipped++; continue;
    }
    const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.airolepath.com").replace(/\/$/, "");
    const deepLink = inbox.deep_link?.startsWith("/") ? `${site}${inbox.deep_link}` : `${site}/job-agent`;
    const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#172033"><div style="font-size:12px;text-transform:uppercase;color:#6d4aff">${escapeHtml(inbox.category.replaceAll("_", " "))}</div><h2>${escapeHtml(inbox.title)}</h2><p>${escapeHtml(inbox.body)}</p>${inbox.recommended_action ? `<p><strong>Next action:</strong> ${escapeHtml(inbox.recommended_action)}</p>` : ""}<p style="margin-top:24px"><a href="${escapeHtml(deepLink)}" style="display:inline-block;padding:12px 18px;background:#111827;color:#fff;text-decoration:none;border-radius:8px">Open in AI Role Path</a></p><p style="font-size:12px;color:#6b7280">This email never changes application state. Open your authenticated workspace to take action.</p></div>`;
    try {
      const providerId = await sendEmail({ to: profile.email, subject: inbox.title, html });
      await serviceFetch(`job_notification_deliveries?id=eq.${delivery.id}`, { method: "PATCH", body: JSON.stringify({ status: "sent", provider_message_id: providerId, sent_at: now.toISOString(), error_code: null }) }); sent++;
    } catch (error) {
      await serviceFetch(`job_notification_deliveries?id=eq.${delivery.id}`, { method: "PATCH", body: JSON.stringify({ status: "failed", error_code: error instanceof Error ? error.message.slice(0, 120) : "EMAIL_SEND_FAILED" }) }).catch(() => null); failed++;
    }
  }
  return { pending: deliveries.length, sent, failed, skipped };
}

type FollowUpRow = { id: string; user_id: string; application_id: string; due_at: string; suggested_action: string; applications?: { job_id?: string; job_opportunities?: { company?: string; role?: string } | Array<{ company?: string; role?: string }> | null } | Array<{ job_id?: string; job_opportunities?: { company?: string; role?: string } | Array<{ company?: string; role?: string }> | null }> | null };
export async function enqueueDueJobFollowUps(now = new Date()) {
  const rows = await serviceFetch<FollowUpRow[]>(`job_follow_ups?status=eq.pending&due_at=lte.${encodeURIComponent(now.toISOString())}&select=id,user_id,application_id,due_at,suggested_action,applications(job_id,job_opportunities(company,role))&limit=100`);
  let enqueued = 0;
  for (const row of rows) {
    const rawApplication = row.applications; const application = Array.isArray(rawApplication) ? rawApplication[0] : rawApplication;
    const rawJob = application?.job_opportunities; const job = Array.isArray(rawJob) ? rawJob[0] : rawJob;
    const inserted = await serviceFetch<Array<{ id: string }>>("job_agent_inbox?on_conflict=user_id,dedupe_key", { method: "POST", headers: { Prefer: "resolution=ignore-duplicates,return=representation" }, body: JSON.stringify({ user_id: row.user_id, job_id: application?.job_id ?? null, application_id: row.application_id, category: "follow_up_due", title: `Follow-up due${job?.company ? ` — ${job.company}` : ""}`.slice(0, 160), body: `${job?.role ?? "Application"} is due for a status review.`, priority: "normal", recommended_action: row.suggested_action, deep_link: `/job-agent/applications/${row.application_id}`, dedupe_key: `follow-up:${row.id}` }) }).catch(() => []);
    if (inserted.length) enqueued++;
  }
  return { due: rows.length, enqueued };
}

export async function sendDueJobAgentReports(now = new Date()) {
  const agents = await serviceFetch<ServiceAgent[]>("job_agents?status=eq.active&select=*");
  const dueAgents = agents.flatMap((agent) => { const schedule = jobReportDue(agent, now); return schedule ? [{ agent, schedule }] : []; });
  if (!dueAgents.length) return { checked: agents.length, due: 0, sent: 0, failed: 0 };
  const ids = dueAgents.map(({ agent }) => agent.user_id);
  const idFilter = ids.join(",");
  const since = new Date(now.getTime() - 40 * 86400000).toISOString();
  const [profiles, jobs, applications] = await Promise.all([
    serviceFetch<ServiceProfile[]>(`profiles?id=in.(${idFilter})&select=id,email,name`),
    serviceFetch<OpportunityRow[]>(`job_opportunities?user_id=in.(${idFilter})&eligibility_status=eq.eligible&discovered_at=gte.${encodeURIComponent(since)}&select=id,user_id,fit_score,status,recommendation,eligibility_status,decision_status,snoozed_until,company,role,location,country,salary_min,salary_max,salary_currency,job_url,discovered_at`),
    serviceFetch<ApplicationRow[]>(`applications?user_id=in.(${idFilter})&created_at=gte.${encodeURIComponent(since)}&select=user_id,status,next_action,created_at,job_opportunities(company,role)`),
  ]);
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  let sent = 0, failed = 0;
  for (const { agent, schedule } of dueAgents) {
    const existing = await serviceFetch<Array<{ id: string; status: string }>>(`job_agent_reports?agent_id=eq.${agent.id}&report_type=eq.${schedule.type}&period_key=eq.${encodeURIComponent(schedule.periodKey)}&delivery_channel=eq.email&select=id,status&limit=1`);
    if (existing[0]?.status === "sent") continue;
    const profile = profileMap.get(agent.user_id);
    if (!profile?.email) continue;
    const userJobs = jobs
      .filter((job) => job.user_id === agent.user_id && job.eligibility_status === "eligible" && job.status !== "skipped" && job.recommendation !== "skip" && job.decision_status !== "rejected" && job.decision_status !== "approved" && (job.decision_status !== "snoozed" || !job.snoozed_until || Date.parse(job.snoozed_until) <= now.getTime()))
      .sort((a,b) => (b.fit_score ?? 0) - (a.fit_score ?? 0))
      .slice(0, 8);
    const userApps = applications.filter((application) => application.user_id === agent.user_id);
    const summary = { reviewed: userJobs.length, qualified: userJobs.filter((job) => (job.fit_score ?? 0) >= agent.auto_prepare_threshold).length, strongMatches: userJobs.filter((job) => (job.fit_score ?? 0) >= agent.strong_match_threshold).length, applied: userApps.filter((application) => application.status === "applied" || application.status === "submitted").length, readyForSubmit: userApps.filter((application) => application.status === "ready_for_submit").length, needsDecision: userJobs.length };
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.airolepath.com";
    const cards = userJobs.map((job) => { const pay = salary(job); const details = `${escapeHtml(job.country ?? job.location ?? "Location not specified")}${pay ? ` · ${escapeHtml(pay)}` : ""}`; const base = `${site}/job-agent/jobs/${job.id}`; const reminder = job.decision_status === "snoozed" ? `<div style="font-size:12px;color:#92400e;margin-bottom:6px">Snoozed reminder</div>` : ""; return `<div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:12px 0">${reminder}<div style="font-weight:700">${escapeHtml(job.role)}</div><div style="color:#4b5563;margin-top:4px">${escapeHtml(job.company)} · ${details}</div><div style="margin-top:6px">${job.fit_score ?? "—"}% Fit</div><div style="margin-top:14px"><a href="${base}?intent=apply#decision-actions" style="display:inline-block;padding:9px 13px;background:#6d4aff;color:#fff;text-decoration:none;border-radius:7px;margin-right:6px">Apply</a><a href="${base}?intent=reject#decision-actions" style="display:inline-block;padding:9px 13px;background:#f3f4f6;color:#111827;text-decoration:none;border-radius:7px;margin-right:6px">Reject</a><a href="${base}?intent=snooze#decision-actions" style="display:inline-block;padding:9px 13px;background:#f3f4f6;color:#111827;text-decoration:none;border-radius:7px">Snooze</a></div></div>`; }).join("");
    const html = `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#172033"><h2>${schedule.type === "weekly" ? "Your weekly" : "Today's"} Job Agent decision report</h2><p><strong>${summary.needsDecision}</strong> job${summary.needsDecision === 1 ? "" : "s"} need your decision. Every surfaced vacancy has passed your configured hard eligibility filters.</p>${cards || "<p>No verified jobs need a decision right now.</p>"}<p style="margin-top:24px"><a href="${site}/job-agent" style="display:inline-block;padding:12px 18px;background:#111827;color:#fff;text-decoration:none;border-radius:8px">Open full Job Agent dashboard</a></p><p style="font-size:12px;color:#6b7280">Email buttons open your authenticated workspace; they do not change application state from an email GET request. This prevents mail scanners from approving or rejecting jobs on your behalf.</p></div>`;
    let ledgerId = existing[0]?.id;
    if (!ledgerId) { const created = await serviceFetch<Array<{ id: string }>>("job_agent_reports", { method: "POST", body: JSON.stringify({ user_id: agent.user_id, agent_id: agent.id, report_type: schedule.type, period_key: schedule.periodKey, delivery_channel: "email", status: "pending", summary }) }); ledgerId = created[0]?.id; }
    try {
      await sendEmail({ to: profile.email, subject: `${summary.needsDecision} verified job decision${summary.needsDecision === 1 ? "" : "s"} waiting in AI Role Path`, html });
      if (ledgerId) await serviceFetch(`job_agent_reports?id=eq.${ledgerId}`, { method: "PATCH", body: JSON.stringify({ status: "sent", sent_at: now.toISOString(), summary, error_code: null }) });
      sent++;
    } catch (error) {
      if (ledgerId) await serviceFetch(`job_agent_reports?id=eq.${ledgerId}`, { method: "PATCH", body: JSON.stringify({ status: "failed", summary, error_code: error instanceof Error ? error.message.slice(0, 120) : "SEND_FAILED" }) }).catch(() => null);
      failed++;
    }
  }
  return { checked: agents.length, due: dueAgents.length, sent, failed };
}
