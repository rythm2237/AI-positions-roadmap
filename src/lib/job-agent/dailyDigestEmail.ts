import "server-only";

import { createJobEmailActionToken } from "@/lib/job-agent/emailActionToken";

export type DailyDigestJob = {
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
  verification_status?: string; eligibility_version?: string; decision_classification?: string | null;
  freshness_status?: string; seniority?: string | null; snoozed_until?: string | null;
  strengths?: string[]; gaps?: string[];
  fit_explanation?: { career?: { track: string | null; seniority: string; requiredYears: number; transition: boolean } };
};

const esc = (value: string) => value.replace(/[&<>'"]/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[char] ?? char));

function salary(job: DailyDigestJob) {
  if (job.salary_min == null && job.salary_max == null) return "";
  const currency = job.salary_currency ?? "";
  if (job.salary_min != null && job.salary_max != null) return `${currency} ${Math.round(job.salary_min).toLocaleString()}–${Math.round(job.salary_max).toLocaleString()}`.trim();
  return `${currency} ${Math.round(job.salary_min ?? job.salary_max ?? 0).toLocaleString()}+`.trim();
}

function eligibility(job: DailyDigestJob) {
  if (job.eligibility_status === "eligible") return "Vacancy verified · Eligibility checks passed";
  if (job.eligibility_status === "blocked") return "Blocked by eligibility checks";
  return "Verification pending";
}

function action(site: string, userId: string, jobId: string, type: "save" | "unsave" | "not_relevant") {
  return `${site}/job-action/${encodeURIComponent(createJobEmailActionToken({ userId, jobId, action: type }))}`;
}

function card(job: DailyDigestJob, site: string) {
  const location = job.location || job.country || "Location not specified";
  const pay = salary(job);
  const fit = job.fit_score == null ? "—" : `${Math.round(job.fit_score)}%`;
  const career = job.fit_explanation?.career;
  const detail = career ? `${career.track ?? "Career track"} · ${career.seniority} · ${career.requiredYears ? `${career.requiredYears}+ years required` : "Experience years not specified"}` : (job.seniority ?? "Seniority pending");
  return `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:16px;margin:0 0 10px">
    <div style="font-size:16px;line-height:22px;font-weight:800;color:#111827">${esc(job.role)}</div>
    <div style="font-size:12px;line-height:19px;color:#64748b;margin-top:4px"><strong style="color:#334155">${esc(job.company)}</strong> · ${esc(location)}${pay ? ` · ${esc(pay)}` : ""}</div>
    <div style="font-size:12px;line-height:18px;color:#475569;margin-top:8px">${esc(eligibility(job))} · ${esc(fit)} fit</div>
    <div style="font-size:12px;line-height:19px;color:#475569;margin-top:8px">${esc(detail)}<br>${esc((job.strengths ?? []).slice(0,2).join(" · "))}${job.gaps?.length ? `<br>Gaps: ${esc(job.gaps.slice(0,2).join(" · "))}` : ""}</div>
    <div style="padding-top:12px">
      <a href="${esc(job.job_url)}" style="display:inline-block;border-radius:10px;padding:9px 11px;font-size:12px;font-weight:800;margin:0 6px 6px 0;background:#315efb;color:#fff;text-decoration:none">Open Job ↗</a>
      <a href="${esc(action(site, job.user_id, job.id, "save"))}" style="display:inline-block;border-radius:10px;padding:9px 11px;font-size:12px;font-weight:800;margin:0 6px 6px 0;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;text-decoration:none">Save</a>
      <a href="${esc(action(site, job.user_id, job.id, "not_relevant"))}" style="display:inline-block;border-radius:10px;padding:9px 11px;font-size:12px;font-weight:800;margin:0 6px 6px 0;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;text-decoration:none">Not Relevant</a>
    </div>
  </div>`;
}

function savedCard(job: DailyDigestJob, site: string) {
  const location = job.location || job.country || "Location not specified";
  return `<div style="background:#fbfdff;border:1px solid #dbeafe;border-radius:12px;padding:13px;margin-bottom:8px">
    <div style="font-size:14px;font-weight:800;color:#111827">${esc(job.role)} — ${esc(job.company)}</div>
    <div style="font-size:12px;color:#64748b;margin-top:4px">${esc(location)}${job.fit_score == null ? "" : ` · ${Math.round(job.fit_score)}% fit`}</div>
    <div style="margin-top:8px"><a href="${esc(job.job_url)}" style="font-size:12px;font-weight:800;color:#315efb;text-decoration:none;margin-right:12px">Open saved job ↗</a><a href="${esc(action(site, job.user_id, job.id, "unsave"))}" style="font-size:12px;font-weight:800;color:#64748b;text-decoration:none">Remove</a></div>
  </div>`;
}

export function renderDailyJobDigestEmail(input: {
  userId: string;
  name?: string | null;
  jobs: DailyDigestJob[];
  savedJobs: DailyDigestJob[];
  site: string;
  periodLabel: string;
  searchStats?: {received: number; reviewed: number; pending: number; blocked: number; providerErrors: number} | null;
}) {
  const strong = input.jobs.filter((job) => job.decision_classification === "strong_match").length;
  const eligible = input.jobs.filter((job) => job.eligibility_status === "eligible").length;
  const unverified = input.searchStats?.pending ?? input.jobs.filter((job) => job.eligibility_status === "unverified").length;
  const greeting = input.name?.trim() ? `Hi ${esc(input.name.trim())}, ` : "";
  const saved = input.savedJobs.map((job) => savedCard(job, input.site)).join("");
  const sections = [
    ["Strong Matches", input.jobs.filter(j=>j.decision_classification==="strong_match" && !j.fit_explanation?.career?.transition)],
    ["Good Matches", input.jobs.filter(j=>j.decision_classification==="good_match" && !j.fit_explanation?.career?.transition)],
    ["Career Transition Opportunities", input.jobs.filter(j=>["strong_match","good_match"].includes(j.decision_classification??"") && j.fit_explanation?.career?.transition)],
    ["Stretch Opportunities", input.jobs.filter(j=>["stretch","worth_reviewing"].includes(j.decision_classification??""))],
  ] as const;
  const jobs = sections.filter(([,items])=>items.length).map(([heading,items])=>`<h2 style="font-size:17px">${heading}</h2>${items.map(job=>card(job,input.site)).join("")}`).join("");

  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Daily Job Digest</title></head><body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827">
  <div style="width:100%;background:#f4f7fb;padding:24px 0"><div style="width:94%;max-width:760px;margin:0 auto">
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:20px;padding:26px">
      <div style="font-size:12px;font-weight:700;letter-spacing:1.2px;color:#315efb;text-transform:uppercase">AI Role Path · Job Agent</div>
      <div style="font-size:29px;line-height:35px;font-weight:800;margin:7px 0 8px">Your Daily Job Digest</div>
      <div style="font-size:14px;line-height:22px;color:#64748b">${greeting}this report separates verified recommendations from vacancies still under review. Fit scores describe alignment, not hiring probability.</div>
      <table role="presentation" width="100%" style="border-collapse:collapse;margin-top:18px"><tr>
        <td width="25%" style="padding:3px"><div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:12px;text-align:center"><strong style="display:block;font-size:21px">${input.jobs.length}</strong><span style="font-size:11px;color:#64748b">Recommended</span></div></td>
        <td width="25%" style="padding:3px"><div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:12px;text-align:center"><strong style="display:block;font-size:21px">${eligible}</strong><span style="font-size:11px;color:#64748b">Verified</span></div></td>
        <td width="25%" style="padding:3px"><div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:12px;text-align:center"><strong style="display:block;font-size:21px">${unverified}</strong><span style="font-size:11px;color:#64748b">Pending verify</span></div></td>
        <td width="25%" style="padding:3px"><div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:12px;text-align:center"><strong style="display:block;font-size:21px">${strong}</strong><span style="font-size:11px;color:#64748b">High match</span></div></td>
      </tr></table>
    </div>
    ${input.searchStats ? `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:14px 18px;margin-top:12px;font-size:12px;line-height:19px;color:#475569"><strong>Search transparency:</strong> ${input.searchStats.received} provider records received · ${input.searchStats.reviewed} evaluated · ${input.searchStats.pending} need review · ${input.searchStats.blocked} blocked · ${input.searchStats.providerErrors} provider errors. <a href="${esc(input.site)}/job-agent/diagnostics" style="color:#315efb">View diagnostics</a></div>` : "" }
    ${input.savedJobs.length ? `<div style="margin-top:14px"><div style="font-size:15px;font-weight:800;color:#111827;padding:0 4px 9px">Saved Jobs</div>${saved}</div>` : ""}
    <div style="margin-top:14px"><div style="font-size:15px;font-weight:800;color:#111827;padding:0 4px 9px">Recommended opportunities · ${esc(input.periodLabel)}</div>${jobs || `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:20px;color:#64748b;font-size:13px">No new vacancies passed all verification and career checks today. ${unverified ? `${unverified} candidate(s) still need review; they are not verified recommendations.` : "No pending candidates were reported for this run."}</div>`}</div>
    <div style="font-size:11px;line-height:18px;color:#94a3b8;text-align:center;padding:20px 14px">Save and Not Relevant use secure signed links and require confirmation.<br><a href="${esc(input.site)}/job-agent" style="color:#64748b">Open Job Agent dashboard</a></div>
  </div></div></body></html>`;
}
