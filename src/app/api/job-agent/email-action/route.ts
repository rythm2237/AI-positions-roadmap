import { verifyJobEmailActionToken } from "@/lib/job-agent/emailActionToken";

function dbConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

async function dbFetch(path: string, init: RequestInit = {}) {
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
  return response;
}

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
}[char] ?? char));

function resultHtml(input: { title: string; message: string; jobUrl?: string | null }) {
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.airolepath.com").replace(/\/$/, "");
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(input.title)}</title></head><body style="margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#111827"><main style="padding:48px 18px"><section style="max-width:560px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:20px;padding:28px;box-shadow:0 14px 40px rgba(15,23,42,.08)"><div style="font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#315efb">AI Role Path · Job Agent</div><h1 style="font-size:28px;margin:10px 0">${escapeHtml(input.title)}</h1><p style="color:#64748b;line-height:1.65">${escapeHtml(input.message)}</p><p style="margin-top:22px">${input.jobUrl ? `<a href="${escapeHtml(input.jobUrl)}" style="display:inline-block;padding:11px 15px;border-radius:11px;background:#315efb;color:#fff;text-decoration:none;font-weight:800;margin-right:8px">Open Job ↗</a>` : ""}<a href="${site}/job-agent" style="display:inline-block;padding:11px 15px;border-radius:11px;background:#f1f5f9;color:#334155;text-decoration:none;font-weight:800">Job Agent dashboard</a></p></section></main></body></html>`;
}

type JobRow = { id: string; user_id: string; role: string; company: string; job_url: string | null };

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const token = String(form.get("token") ?? "");
    const payload = verifyJobEmailActionToken(token);
    if (!payload) return new Response(resultHtml({ title: "Link expired", message: "This action link is invalid or has expired. Open Job Agent to review the vacancy." }), { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } });

    const jobResponse = await dbFetch(`job_opportunities?id=eq.${encodeURIComponent(payload.jobId)}&user_id=eq.${encodeURIComponent(payload.userId)}&select=id,user_id,role,company,job_url&limit=1`);
    const jobs = await jobResponse.json() as JobRow[];
    const job = jobs[0];
    if (!job) return new Response(resultHtml({ title: "Job unavailable", message: "This vacancy is no longer available in your Job Agent workspace." }), { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });

    const now = new Date().toISOString();
    if (payload.action === "save") {
      await dbFetch("job_saved_jobs?on_conflict=user_id,job_id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({ user_id: payload.userId, job_id: payload.jobId, saved_at: now, updated_at: now }),
      });
      await dbFetch("user_activity", { method: "POST", body: JSON.stringify({ user_id: payload.userId, action: "job_agent_job_saved_from_email", metadata: { job_id: payload.jobId } }) }).catch(() => null);
      return new Response(resultHtml({ title: "Job saved ✓", message: `${job.role} at ${job.company} is now in Saved Jobs and will stay visible in future digests while the vacancy remains available.`, jobUrl: job.job_url }), { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    if (payload.action === "unsave") {
      await dbFetch(`job_saved_jobs?user_id=eq.${encodeURIComponent(payload.userId)}&job_id=eq.${encodeURIComponent(payload.jobId)}`, { method: "DELETE" });
      await dbFetch("user_activity", { method: "POST", body: JSON.stringify({ user_id: payload.userId, action: "job_agent_job_unsaved_from_email", metadata: { job_id: payload.jobId } }) }).catch(() => null);
      return new Response(resultHtml({ title: "Removed from Saved Jobs", message: `${job.role} at ${job.company} has been removed from your saved list.`, jobUrl: job.job_url }), { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    await Promise.all([
      dbFetch(`job_saved_jobs?user_id=eq.${encodeURIComponent(payload.userId)}&job_id=eq.${encodeURIComponent(payload.jobId)}`, { method: "DELETE" }),
      dbFetch(`job_opportunities?id=eq.${encodeURIComponent(payload.jobId)}&user_id=eq.${encodeURIComponent(payload.userId)}`, { method: "PATCH", body: JSON.stringify({ decision_status: "rejected", decision_at: now, snoozed_until: null, updated_at: now }) }),
      dbFetch("user_activity", { method: "POST", body: JSON.stringify({ user_id: payload.userId, action: "job_agent_job_not_relevant_from_email", metadata: { job_id: payload.jobId, role: job.role, company: job.company } }) }).catch(() => null),
    ]);
    await dbFetch("rpc/record_job_agent_learning_signal", {
      method: "POST",
      body: JSON.stringify({ p_signal_type: "rejected_role", p_signal_key: job.role, p_value: { role: job.role, company: job.company, lastJobId: job.id, source: "email_digest", inspectable: true }, p_confidence: 0.25 }),
    }).catch(() => null);

    return new Response(resultHtml({ title: "Feedback recorded ✓", message: "This vacancy will no longer be surfaced as a recommendation. Your feedback will also help improve future Job Agent ranking." }), { headers: { "Content-Type": "text/html; charset=utf-8" } });
  } catch (error) {
    console.error("Job Agent email action failed", error);
    return new Response(resultHtml({ title: "Action failed", message: "We could not update this job right now. Please open Job Agent and try again." }), { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
}
