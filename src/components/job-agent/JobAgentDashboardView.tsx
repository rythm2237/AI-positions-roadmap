import Link from "next/link";
import { approveJob, rejectJob, snoozeJob } from "@/app/(account)/job-agent/decisionActions";
import { dismissInboxItem, markInboxRead } from "@/app/(account)/job-agent/inboxActions";
import type { ApplicationRecord, FitExplanation, JobAgent, JobAgentDashboardStats, JobAgentInboxItem, JobOpportunity } from "@/types/jobAgent";

const statCards: Array<[keyof JobAgentDashboardStats, string]> = [
  ["jobsFound", "Jobs Found"], ["strongMatches", "Strong Matches"], ["applicationsSent", "Submitted"],
  ["readyForSubmit", "Ready for Submit"], ["recruiterReplies", "Recruiter Replies"], ["interviews", "Interviews"],
];
const salary = (job: JobOpportunity) => {
  if (job.salary_min == null && job.salary_max == null) return null;
  const currency = job.salary_currency ?? "";
  if (job.salary_min != null && job.salary_max != null) return `${currency} ${Math.round(job.salary_min).toLocaleString()}–${Math.round(job.salary_max).toLocaleString()}`.trim();
  return `${currency} ${Math.round(job.salary_min ?? job.salary_max ?? 0).toLocaleString()}+`.trim();
};
const age = (job: JobOpportunity) => {
  const timestamp = Date.parse(job.posted_at ?? job.discovered_at);
  if (!Number.isFinite(timestamp)) return "Age unknown";
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
  return days === 0 ? "Today" : `${days}d old`;
};
const explanation = (job: JobOpportunity) => {
  const value = job.fit_explanation as FitExplanation | undefined;
  return Array.isArray(value?.whyRankedHere) ? value.whyRankedHere : [];
};
const badge = (status: string | null | undefined) => status?.replaceAll("_", " ") ?? "unknown";

export function JobAgentDashboardView({ agent, stats, jobs, applications, inbox }: { agent: JobAgent; stats: JobAgentDashboardStats; jobs: JobOpportunity[]; applications: ApplicationRecord[]; inbox: JobAgentInboxItem[] }) {
  const now = Date.now();
  return <>
    <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6" aria-label="Job Agent summary">{statCards.map(([key, label]) => <div key={key} className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4"><p className="text-2xl font-semibold text-white">{stats[key]}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>)}</section>

    <section className="mt-8 glass rounded-2xl border border-white/[.07] p-5 sm:p-6" aria-labelledby="matches-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Discover → verify → decide</p><h2 id="matches-title" className="mt-1 font-display text-xl font-semibold text-white">Current search results</h2></div><p className="text-xs text-slate-500">Fit is evidence alignment, not hiring probability. Eligibility and confidence remain separate.</p></div>
      {jobs.length ? <div className="mt-5 grid gap-4 lg:grid-cols-2">{jobs.slice(0, 20).map((job) => {
        const dueSnooze = job.decision_status === "snoozed" && job.snoozed_until && Date.parse(job.snoozed_until) <= now;
        const pay = salary(job);
        const blocked = job.eligibility_status === "blocked" || job.freshness_status === "expired";
        return <article key={job.id} className={`rounded-2xl border p-4 ${blocked ? "border-rose-300/15 bg-rose-400/[.035]" : "border-white/[.07] bg-black/10"}`}>
          <div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-white">{job.role}</p>{dueSnooze ? <span className="rounded-full bg-amber-400/10 px-2 py-1 text-[11px] font-semibold text-amber-200">Snoozed reminder</span> : null}</div><p className="mt-1 text-sm text-slate-400">{job.company}{job.location ? ` · ${job.location}` : " · Location unknown"}</p><p className="mt-1 text-xs text-slate-500">{job.source} · {age(job)} · {badge(job.verification_status)} location/details</p>{pay ? <p className="mt-1 text-xs text-emerald-200">Salary: {pay}</p> : <p className="mt-1 text-xs text-slate-600">Salary not disclosed</p>}</div><div className="text-right"><p className="text-xl font-semibold text-cyan-200">{job.fit_score ?? "—"}{job.fit_score == null ? "" : "%"}</p><p className="text-[11px] uppercase tracking-[.12em] text-slate-500">Fit · {job.fit_confidence ?? "n/a"}</p></div></div>
          <div className="mt-3 flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${job.eligibility_status === "eligible" ? "bg-emerald-400/[.1] text-emerald-200" : job.eligibility_status === "blocked" ? "bg-rose-400/[.1] text-rose-200" : "bg-amber-400/[.1] text-amber-200"}`}>{badge(job.eligibility_status)}</span><span className="rounded-full bg-violet-400/[.1] px-2.5 py-1 text-xs font-semibold text-violet-200">{badge(job.decision_classification)}</span><span className="rounded-full bg-slate-400/[.1] px-2.5 py-1 text-xs text-slate-300">{badge(job.workplace_model)}</span><span className="rounded-full bg-slate-400/[.1] px-2.5 py-1 text-xs text-slate-300">{badge(job.execution_capability)}</span></div>
          {explanation(job).length ? <div className="mt-3 rounded-xl border border-cyan-300/10 bg-cyan-300/[.025] px-3 py-2 text-xs leading-5 text-cyan-100"><strong>Why it ranks here:</strong> {explanation(job).slice(0, 2).join(" ")}</div> : null}
          {job.strengths.length ? <p className="mt-3 text-xs leading-5 text-emerald-200"><strong>Evidence:</strong> {job.strengths.slice(0, 2).join(" · ")}</p> : null}
          {job.gaps.length ? <p className="mt-2 text-xs leading-5 text-amber-200"><strong>{blocked ? "Blocker" : "Gap / verify"}:</strong> {job.gaps.slice(0, 3).join(" · ")}</p> : null}
          <div className="mt-4 flex flex-wrap items-center gap-2">{!blocked ? <form action={approveJob}><input type="hidden" name="job_id" value={job.id} /><button className="btn-primary min-h-10 px-4 text-sm">{job.eligibility_status === "unverified" ? "Prepare with review" : "Prepare application"}</button></form> : <span className="rounded-xl border border-rose-300/20 px-4 py-2 text-sm font-semibold text-rose-200">Application blocked</span>}<form action={rejectJob}><input type="hidden" name="job_id" value={job.id} /><button className="btn-secondary min-h-10 px-4 text-sm">Reject</button></form>{!blocked ? <form action={snoozeJob} className="flex items-center gap-2"><input type="hidden" name="job_id" value={job.id} /><select name="snooze_days" defaultValue="1" className="input-field min-h-10 px-2 text-xs"><option value="1">1 day</option><option value="3">3 days</option><option value="7">1 week</option><option value="30">1 month</option></select><button className="btn-secondary min-h-10 px-3 text-sm">Snooze</button></form> : null}<Link href={`/job-agent/jobs/${job.id}`} className="ml-auto text-sm font-semibold text-violet-300">Evidence & details →</Link></div>
        </article>;
      })}</div> : <div className="mt-5 rounded-xl border border-dashed border-white/10 p-6 text-sm leading-6 text-slate-400">No results for the current confirmed intent. Provider “no results” is kept distinct from provider failure in the latest-run evidence.</div>}
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]"><div className="glass rounded-2xl border border-white/[.07] p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Application tracker</p><h2 className="mt-1 font-display text-xl font-semibold text-white">Recent applications</h2></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">{agent.status}</span></div>{applications.length ? <div className="mt-5 space-y-3">{applications.slice(0, 8).map((application) => { const job = application.job_opportunities; return <article key={application.id} className="rounded-xl border border-white/[.07] bg-black/10 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold text-white">{job?.role ?? "Application"}</p><p className="mt-1 text-sm text-slate-400">{job?.company ?? "Company"}{job?.location ? ` · ${job.location}` : ""}</p></div><span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs font-semibold capitalize text-violet-200">{badge(application.status)}</span></div>{application.next_action ? <p className="mt-3 text-sm text-amber-200">Action: {application.next_action}</p> : null}<Link href={`/job-agent/applications/${application.id}`} className="mt-3 inline-block text-sm font-semibold text-cyan-300">Open application pack →</Link></article>; })}</div> : <div className="mt-5 rounded-xl border border-dashed border-white/10 p-6 text-sm leading-6 text-slate-400">No approved applications yet. “Submitted” is recorded only after external evidence or explicit user attestation exists.</div>}</div>
      <div className="glass rounded-2xl border border-white/[.07] p-5 sm:p-6"><p className="eyebrow">Job Agent Inbox</p><h2 className="mt-1 font-display text-xl font-semibold text-white">What needs you</h2><div className="mt-5 space-y-3">{inbox.slice(0, 8).map((item) => <article key={item.id} className={`rounded-xl border p-4 ${item.read_at ? "border-white/[.07] bg-black/10" : "border-amber-300/15 bg-amber-400/[.04]"}`}><div className="flex items-center justify-between gap-3"><Link href={item.deep_link ?? "/job-agent"} className="text-sm font-semibold text-amber-100">{item.title}</Link><span className="text-[10px] uppercase tracking-wide text-slate-500">{item.priority}</span></div><p className="mt-1 text-sm leading-6 text-slate-400">{item.recommended_action ?? item.body}</p><div className="mt-3 flex gap-2">{!item.read_at ? <form action={markInboxRead}><input type="hidden" name="inbox_id" value={item.id} /><button className="text-xs font-semibold text-cyan-300">Mark read</button></form> : null}<form action={dismissInboxItem}><input type="hidden" name="inbox_id" value={item.id} /><button className="text-xs font-semibold text-slate-500">Dismiss</button></form></div></article>)}{!inbox.length ? <p className="rounded-xl border border-white/[.07] p-4 text-sm leading-6 text-slate-400">No unread or open Inbox actions.</p> : null}</div></div>
    </section>
  </>;
}
