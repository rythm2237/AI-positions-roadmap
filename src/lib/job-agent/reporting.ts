import "server-only";

import type { JobAgent } from "@/types/jobAgent";

type ServiceAgent = JobAgent & { user_id: string };
type ServiceProfile = { id: string; email: string; name: string | null };
type OpportunityRow = { user_id: string; fit_score: number | null; status: string; company: string; role: string; location: string | null; job_url: string; discovered_at: string };
type ApplicationRow = { user_id: string; status: string; next_action: string | null; created_at: string; job_opportunities?: { company?: string; role?: string } | Array<{ company?: string; role?: string }> | null };

function dbConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  return url && key ? { url, key } : null;
}

async function serviceFetch<T>(path: string, init: RequestInit = {}) {
  const db = dbConfig();
  if (!db) throw new Error("JOB_AGENT_DATABASE_NOT_CONFIGURED");
  const response = await fetch(`${db.url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: db.key, Authorization: `Bearer ${db.key}`, "Content-Type": "application/json", Prefer: "return=representation", ...init.headers },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`JOB_AGENT_DATABASE_${response.status}`);
  return response.json() as Promise<T>;
}

function localParts(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, weekday: parts.weekday, hour: Number(parts.hour), minute: Number(parts.minute) };
}

function due(agent: ServiceAgent, now: Date) {
  if (agent.status !== "active" || agent.report_frequency === "none" || !agent.notification_channels.includes("email")) return null;
  const local = localParts(now, agent.timezone || "UTC");
  const [hour] = (agent.report_time ?? "20:00").split(":").map(Number);
  if (local.hour !== hour) return null;
  if (agent.report_frequency === "weekly" && local.weekday !== "Mon") return null;
  return { type: agent.report_frequency as "daily" | "weekly", periodKey: agent.report_frequency === "weekly" ? `${local.date}:week` : local.date };
}

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char] ?? char));

async function sendEmail(input: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("RESEND_NOT_CONFIGURED");
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [input.to], subject: input.subject, html: input.html }) });
  if (!response.ok) throw new Error(`RESEND_${response.status}`);
}

export async function sendDueJobAgentReports(now = new Date()) {
  const agents = await serviceFetch<ServiceAgent[]>("job_agents?status=eq.active&select=*");
  const dueAgents = agents.flatMap((agent) => { try { const schedule = due(agent, now); return schedule ? [{ agent, schedule }] : []; } catch { return []; } });
  if (!dueAgents.length) return { checked: agents.length, due: 0, sent: 0, failed: 0 };
  const ids = dueAgents.map(({ agent }) => agent.user_id);
  const idFilter = ids.join(",");
  const since = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString();
  const [profiles, jobs, applications] = await Promise.all([
    serviceFetch<ServiceProfile[]>(`profiles?id=in.(${idFilter})&select=id,email,name`),
    serviceFetch<OpportunityRow[]>(`job_opportunities?user_id=in.(${idFilter})&discovered_at=gte.${encodeURIComponent(since)}&select=user_id,fit_score,status,company,role,location,job_url,discovered_at`),
    serviceFetch<ApplicationRow[]>(`applications?user_id=in.(${idFilter})&created_at=gte.${encodeURIComponent(since)}&select=user_id,status,next_action,created_at,job_opportunities(company,role)`),
  ]);
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  let sent = 0, failed = 0;
  for (const { agent, schedule } of dueAgents) {
    const existing = await serviceFetch<Array<{ id: string; status: string }>>(`job_agent_reports?agent_id=eq.${agent.id}&report_type=eq.${schedule.type}&period_key=eq.${encodeURIComponent(schedule.periodKey)}&delivery_channel=eq.email&select=id,status&limit=1`);
    if (existing[0]?.status === "sent") continue;
    const profile = profileMap.get(agent.user_id);
    if (!profile?.email) continue;
    const windowMs = schedule.type === "weekly" ? 7 * 86400000 : 86400000;
    const cutoff = now.getTime() - windowMs;
    const userJobs = jobs.filter((job) => job.user_id === agent.user_id && Date.parse(job.discovered_at) >= cutoff);
    const userApps = applications.filter((application) => application.user_id === agent.user_id && Date.parse(application.created_at) >= cutoff);
    const summary = {
      reviewed: userJobs.length,
      qualified: userJobs.filter((job) => (job.fit_score ?? 0) >= agent.auto_prepare_threshold).length,
      strongMatches: userJobs.filter((job) => (job.fit_score ?? 0) >= agent.strong_match_threshold).length,
      applied: userApps.filter((application) => application.status === "applied").length,
      readyForSubmit: userApps.filter((application) => application.status === "ready_for_submit").length,
      needsAction: userApps.filter((application) => Boolean(application.next_action)).length,
    };
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.airolepath.com";
    const topJobs = [...userJobs].sort((a, b) => (b.fit_score ?? 0) - (a.fit_score ?? 0)).slice(0, 3);
    const html = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#172033"><h2>${schedule.type === "weekly" ? "Your weekly" : "Today's"} Job Agent report</h2><p>Reviewed <strong>${summary.reviewed}</strong> jobs · <strong>${summary.strongMatches}</strong> strong matches · <strong>${summary.applied}</strong> applied · <strong>${summary.needsAction}</strong> need your attention.</p>${topJobs.length ? `<h3>Top matches</h3><ul>${topJobs.map((job) => `<li><strong>${escapeHtml(job.role)}</strong> at ${escapeHtml(job.company)} — ${job.fit_score ?? "—"}% Fit</li>`).join("")}</ul>` : ""}<p style="margin-top:24px"><a href="${site}/job-agent" style="display:inline-block;padding:12px 18px;background:#6d4aff;color:#fff;text-decoration:none;border-radius:8px">Review full Job Agent report</a></p><p style="font-size:12px;color:#6b7280">The email is intentionally a summary. Application documents, recruiter details and decisions stay in your private AI Career OS workspace.</p></div>`;
    let ledgerId = existing[0]?.id;
    if (!ledgerId) {
      const created = await serviceFetch<Array<{ id: string }>>("job_agent_reports", { method: "POST", body: JSON.stringify({ user_id: agent.user_id, agent_id: agent.id, report_type: schedule.type, period_key: schedule.periodKey, delivery_channel: "email", status: "pending", summary }) });
      ledgerId = created[0]?.id;
    }
    try {
      await sendEmail({ to: profile.email, subject: `${summary.strongMatches} strong job match${summary.strongMatches === 1 ? "" : "es"} in your ${schedule.type} report`, html });
      if (ledgerId) await serviceFetch(`job_agent_reports?id=eq.${ledgerId}`, { method: "PATCH", body: JSON.stringify({ status: "sent", sent_at: now.toISOString(), summary, error_code: null }) });
      sent++;
    } catch (error) {
      if (ledgerId) await serviceFetch(`job_agent_reports?id=eq.${ledgerId}`, { method: "PATCH", body: JSON.stringify({ status: "failed", summary, error_code: error instanceof Error ? error.message.slice(0, 120) : "SEND_FAILED" }) }).catch(() => null);
      failed++;
    }
  }
  return { checked: agents.length, due: dueAgents.length, sent, failed };
}
