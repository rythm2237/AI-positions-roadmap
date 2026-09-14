import "server-only";

import { createJobEmailActionToken } from "@/lib/job-agent/emailActionToken";

export type DigestJob = {
  id: string;
  user_id: string;
  fit_score: number | null;
  status: string;
  recommendation: string | null;
  eligibility_status: "eligible" | "blocked" | "unverified";
  decision_status: string;
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

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[char] ?? char));

function salary(job: DigestJob) {
  if (job.salary_min == null && job.salary_max == null) return null;
  const currency = job.salary_currency ?? "";
  if (job.salary_min != null && job.salary_max != null) return `${currency} ${Math.round(job.salary_min).toLocaleString()}–${Math.round(job.salary_max).toLocaleString()}`.trim();
  return `${currency} ${Math.round(job.salary_min ?? job.salary_max ?? 0).toLocaleString()}+`.trim();
}

function location(job: DigestJob) {
  return job.location || job.country || "Location not specified";
}

function actionLink(site: string, userId: string, jobId: string, action: "save" | "unsave" | "not_relevant") {
  const token = createJobEmailActionToken({ userId, jobId, action });
  return `${site}/job-action/${encodeURIComponent(token)}`;
}

function initials(company: string) {
  const parts = company.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : company.slice(0, 2)).toUpperCase();
}

function jobCard(job: DigestJob, site: string) {
  const pay = salary(job);
  const save = actionLink(site, job.user_id, job.id, "save");
  const reject = actionLink(site, job.user_id, job.id, "not_relevant");
  const match = job.fit_score == null ? "—" : `${Math.round(job.fit_score)}%`;
  const recommendation = job.recommendation && job.recommendation !== "review" ? job.recommendation.replaceAll("_", " ") : null;
  return `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;margin-bottom:10px;overflow:hidden">
    <div style="padding:17px">
      <table role="presentation" width="100%" style="border-collapse:collapse"><tr>
        <td width="56" valign="top"><div style="width:46px;height:46px;border-radius:12px;background:#eef3ff;color:#315efb;font-size:14px;font-weight:800;text-align:center;line-height:46px">${escapeHtml(initials(job.company))}</div></td>
        <td valign="top" style="padding-right:8px"><div style="font-size:16px;line-height:21px;font-weight:800;color:#111827">${escapeHtml(job.role)}</div><div style="font-size:12px;line-height:19px;color:#64748b;margin-top:4px"><strong style="color:#334155">${escapeHtml(job.company)}</strong> · ${escapeHtml(location(job))}${pay ? ` · ${escapeHtml(pay)}` : ""}</div></td>
        <td width="65" valign="top" align="right"><span style="font-size:11px;font-weight:800;color:#047857;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:999px;padding:6px 8px;white-space:nowrap">${escapeHtml(match)} fit</span></td>
      </tr></table>
    </div>
    <div style="padding:0 17px 17px"><div style="border-top:1px solid #e5e7eb;padding-top:14px">
      <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;color:#64748b">Match details</div>
      <div style="font-size:13px;line-height:20px;color:#475569;margin-top:7px">Verified eligible opportunity${recommendation ? ` · ${escapeHtml(recommendation)}` : ""}. Open the original vacancy for full requirements and application details.</div>
      <div style="padding-top:12px">
        <a href="${escapeHtml(job.job_url)}" style="display:inline-block;border-radius:11px;padding:10px 12px;font-size:12px;font-weight:800;margin:0 6px 6px 0;background:#315efb;color:#fff;text-decoration:none">Open Job ↗</a>
        <a href="${escapeHtml(save)}" style="display:inline-block;border-radius:11px;padding:10px 12px;font-size:12px;font-weight:800;margin:0 6px 6px 0;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;text-decoration:none">Save</a>
        <a href="${escapeHtml(reject)}" style="display:inline-block;border-radius:11px;padding:10px 12px;font-size:12px;font-weight:800;margin:0 6px 6px 0;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;text-decoration:none">Not Relevant</a>
      </div>
    </div></div>
  </div>`;
}

function savedCard(job: DigestJob, site: string) {
  const remove = actionLink(site, job.user_id, job.id, "unsave");
  return `<div style="background:#fbfdff;border:1px solid #dbeafe;border-radius:14px;padding:14px;margin-bottom:8px">
    <div style="font-size:14px;font-weight:800;color:#111827">${escapeHtml(job.role)} — ${escapeHtml(job.company)}</div>
    <div style="font-size:12px;color:#64748b;margin-top:4px">${escapeHtml(location(job))}${job.fit_score == null ? "" : ` · ${Math.round(job.fit_score)}% fit`}</div>
    <div style="margin-top:8px"><a href="${escapeHtml(job.job_url)}" style="font-size:12px;font-weight:800;color:#315efb;text-decoration:none;margin-right:12px">Open saved job ↗</a><a href="${escapeHtml(remove)}" style="font-size:12px;font-weight:800;color:#64748b;text-decoration:none">Remove</a></div>
  </div>`;
}

export function renderJobDigestEmail(input: {
  userId: string;
  name?: string | null;
  newJobs: DigestJob[];
  savedJobs: DigestJob[];
  site?: string;
  reportLabel?: string;
}) {
  const site = (input.site ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.airolepath.com").replace(/\/$/, "");
  const strongMatches = input.newJobs.filter((job) => (job.fit_score ?? 0) >= 80).length;
  const remoteHybrid = input.newJobs.filter((job) => /remote|hybrid/i.test(`${job.location ?? ""} ${job.country ?? ""}`)).length;
  const greeting = input.name?.trim() ? `Hi ${escapeHtml(input.name.trim())}, ` : "";
  const dateLabel = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date());
  const saved = input.savedJobs.slice(0, 8).map((job) => savedCard(job, site)).join("");
  const jobs = input.newJobs.slice(0, 12).map((job) => jobCard(job, site)).join("");

  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Your Job Search Digest</title></head>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827">
    <div style="width:100%;background:#f4f7fb;padding:24px 0"><div style="width:94%;max-width:760px;margin:0 auto">
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:20px;padding:26px">
        <div style="font-size:12px;font-weight:700;letter-spacing:1.2px;color:#315efb;text-transform:uppercase">AI Role Path · Job Agent</div>
        <div style="font-size:30px;line-height:36px;font-weight:800;margin:7px 0 8px">Your Job Search Digest</div>
        <div style="font-size:14px;line-height:22px;color:#64748b">${greeting}${escapeHtml(input.reportLabel ?? "here are the newest verified opportunities selected for you")}. Open a role, save it for later, or mark it as not relevant.</div>
        <table role="presentation" width="100%" style="border-collapse:collapse;margin-top:18px"><tr>
          <td width="24%" style="padding:3px"><div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:12px;text-align:center"><strong style="display:block;font-size:21px">${input.newJobs.length}</strong><span style="font-size:11px;color:#64748b">New jobs</span></div></td>
          <td width="24%" style="padding:3px"><div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:12px;text-align:center"><strong style="display:block;font-size:21px">${strongMatches}</strong><span style="font-size:11px;color:#64748b">High match</span></div></td>
          <td width="24%" style="padding:3px"><div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:12px;text-align:center"><strong style="display:block;font-size:21px">${remoteHybrid}</strong><span style="font-size:11px;color:#64748b">Remote / Hybrid</span></div></td>
          <td width="24%" style="padding:3px"><div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:12px;text-align:center"><strong style="display:block;font-size:21px">${input.savedJobs.length}</strong><span style="font-size:11px;color:#64748b">Saved jobs</span></div></td>
        </tr></table>
      </div>

      ${input.savedJobs.length ? `<div style="margin-top:14px"><div style="padding:16px 18px;background:#eef3ff;border:1px solid #dce5ff;border-radius:16px"><div style="font-size:14px;font-weight:800;color:#1e3a8a">Saved Jobs</div><div style="font-size:12px;line-height:18px;color:#475569;margin-top:4px">Jobs you saved previously stay here in future digests until you remove them or the vacancy is no longer eligible.</div></div><div style="margin-top:9px">${saved}</div></div>` : ""}

      <div style="margin-top:14px"><div style="font-size:15px;font-weight:800;color:#111827;padding:0 4px 9px">New Matches <span style="font-size:12px;color:#64748b;font-weight:400">· ${escapeHtml(dateLabel)}</span></div>${jobs || `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:20px;color:#64748b;font-size:13px">No new verified jobs are waiting right now.</div>`}</div>

      <div style="font-size:11px;line-height:18px;color:#94a3b8;text-align:center;padding:20px 14px">Save and Not Relevant use secure signed links. For protection against email security scanners, opening a link does not change data until you confirm the action on AI Role Path.<br><a href="${site}/job-agent" style="color:#64748b">Open Job Agent dashboard</a></div>
    </div></div>
  </body></html>`;
}
