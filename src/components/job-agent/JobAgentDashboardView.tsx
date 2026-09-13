import Link from "next/link";
import { approveJob, rejectJob, snoozeJob } from "@/app/(account)/job-agent/decisionActions";
import { dismissInboxItem, markInboxRead } from "@/app/(account)/job-agent/inboxActions";
import type { ApplicationRecord, FitExplanation, JobAgent, JobAgentDashboardStats, JobAgentInboxItem, JobOpportunity } from "@/types/jobAgent";
import { groupCurrentJobResults } from "@/lib/job-agent/resultGroups";
import { userFacingJobSource } from "@/lib/job-agent/sourceLabel";

const activityStats: Array<[keyof JobAgentDashboardStats, string]> = [
  ["jobsFound", "Active jobs"],
  ["strongMatches", "Strong matches"],
  ["readyForSubmit", "Ready to submit"],
  ["applicationsSent", "Submitted"],
  ["recruiterReplies", "Replies"],
  ["interviews", "Interviews"],
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

const locationLabel = (job: JobOpportunity) => {
  const location = job.location?.trim();
  const country = job.country?.trim();
  if (location && country && !location.toLowerCase().includes(country.toLowerCase())) return `${location} · ${country}`;
  return location || country || "Location unverified";
};

function ResultActions({ job, blocked }: { job: JobOpportunity; blocked: boolean }) {
  return <div className="flex flex-wrap items-center gap-2">
    {!blocked ? <form action={approveJob}><input type="hidden" name="job_id" value={job.id} /><button className="btn-primary min-h-10 px-4 text-sm">{job.eligibility_status === "unverified" ? "Prepare with review" : "Prepare application"}</button></form> : <span className="rounded-xl border border-rose-300/20 px-4 py-2 text-sm font-semibold text-rose-200">Application blocked</span>}
    <form action={rejectJob}><input type="hidden" name="job_id" value={job.id} /><button className="btn-secondary min-h-10 px-4 text-sm">Reject</button></form>
    {!blocked ? <form action={snoozeJob} className="flex items-center gap-2"><input type="hidden" name="job_id" value={job.id} /><select name="snooze_days" defaultValue="1" className="input-field min-h-10 px-2 text-xs" aria-label={`Snooze ${job.role}`}><option value="1">1 day</option><option value="3">3 days</option><option value="7">1 week</option><option value="30">1 month</option></select><button className="btn-secondary min-h-10 px-3 text-sm">Snooze</button></form> : null}
    <Link href={`/job-agent/jobs/${job.id}`} className="text-sm font-semibold text-violet-300">Evidence & details →</Link>
  </div>;
}

function JobResult({ job, now }: { job: JobOpportunity; now: number }) {
  const dueSnooze = job.decision_status === "snoozed" && job.snoozed_until && Date.parse(job.snoozed_until) <= now;
  const pay = salary(job);
  const blocked = job.eligibility_status === "blocked";
  const reasons = explanation(job);
  return <details className={`group overflow-hidden rounded-2xl border transition ${blocked ? "border-rose-300/15 bg-rose-400/[.025]" : "border-white/[.08] bg-black/10 open:border-violet-300/20 open:bg-violet-400/[.025]"}`}>
    <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 marker:hidden sm:px-5 [&::-webkit-details-marker]:hidden">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate font-semibold text-white">{job.role}</p>
          {dueSnooze ? <span className="hidden shrink-0 rounded-full bg-amber-400/10 px-2 py-1 text-[10px] font-semibold text-amber-200 sm:inline">Snoozed</span> : null}
        </div>
        <p className="mt-1 truncate text-sm text-slate-400">{job.company} · {locationLabel(job)}</p>
      </div>
      <div className="hidden shrink-0 items-center gap-2 md:flex">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${job.eligibility_status === "eligible" ? "bg-emerald-400/10 text-emerald-200" : blocked ? "bg-rose-400/10 text-rose-200" : "bg-amber-400/10 text-amber-200"}`}>{job.eligibility_status === "unverified" ? "Needs review" : badge(job.eligibility_status)}</span>
        <span className="rounded-full bg-slate-400/[.08] px-2.5 py-1 text-[11px] text-slate-300">{badge(job.workplace_model)}</span>
      </div>
      <div className="w-16 shrink-0 text-right">
        <p className="text-xl font-semibold text-cyan-200">{job.fit_score ?? "—"}{job.fit_score == null ? "" : "%"}</p>
        <p className="text-[10px] uppercase tracking-[.12em] text-slate-500">Fit</p>
      </div>
      <span aria-hidden="true" className="ml-1 text-xl text-slate-500 transition-transform group-open:rotate-180">⌄</span>
    </summary>

    <div className="border-t border-white/[.06] px-4 pb-5 pt-4 sm:px-5">
      <div className="mb-4 flex flex-wrap gap-2 md:hidden"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${job.eligibility_status === "eligible" ? "bg-emerald-400/10 text-emerald-200" : blocked ? "bg-rose-400/10 text-rose-200" : "bg-amber-400/10 text-amber-200"}`}>{job.eligibility_status === "unverified" ? "Needs review" : badge(job.eligibility_status)}</span><span className="rounded-full bg-slate-400/[.08] px-2.5 py-1 text-xs text-slate-300">{badge(job.workplace_model)}</span></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[.06] bg-white/[.02] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-slate-500">Vacancy snapshot</p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs leading-5"><dt className="text-slate-500">Source</dt><dd className="text-slate-300">{userFacingJobSource(job.source)} · {age(job)}</dd><dt className="text-slate-500">Verification</dt><dd className="text-slate-300">{badge(job.verification_status)}</dd><dt className="text-slate-500">Execution</dt><dd className="text-slate-300">{badge(job.execution_capability)}</dd><dt className="text-slate-500">Salary</dt><dd className="text-slate-300">{pay ?? "Not disclosed"}</dd></dl>
        </div>
        <div className="rounded-xl border border-white/[.06] bg-white/[.02] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-slate-500">Why this result</p>
          {reasons.length ? <p className="mt-2 text-xs leading-5 text-cyan-100">{reasons.slice(0, 2).join(" ")}</p> : <p className="mt-2 text-xs leading-5 text-slate-500">No ranking explanation is available yet.</p>}
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-emerald-300/10 bg-emerald-400/[.025] p-3"><p className="text-xs font-semibold text-emerald-200">Evidence</p><p className="mt-1 text-xs leading-5 text-slate-400">{job.strengths.length ? job.strengths.slice(0, 3).join(" · ") : "No strong evidence recorded yet."}</p></div>
        <div className={`rounded-xl border p-3 ${blocked ? "border-rose-300/10 bg-rose-400/[.025]" : "border-amber-300/10 bg-amber-400/[.025]"}`}><p className={`text-xs font-semibold ${blocked ? "text-rose-200" : "text-amber-200"}`}>{blocked ? "Blockers" : "Needs verification"}</p><p className="mt-1 text-xs leading-5 text-slate-400">{job.gaps.length ? job.gaps.slice(0, 4).join(" · ") : "No material gaps recorded."}</p></div>
      </div>
      <div className="mt-4"><ResultActions job={job} blocked={blocked} /></div>
    </div>
  </details>;
}

export function JobAgentDashboardView({ agent, stats, jobs, applications, inbox }: { agent: JobAgent; stats: JobAgentDashboardStats; jobs: JobOpportunity[]; applications: ApplicationRecord[]; inbox: JobAgentInboxItem[] }) {
  const now = Date.now();
  const { active: activeJobs, ready: recommended, review, blocked } = groupCurrentJobResults(jobs);

  return <>
    <section className="mt-6 grid grid-flow-col auto-cols-[128px] gap-2 overflow-x-auto pb-1 sm:grid-flow-row sm:grid-cols-2 lg:grid-cols-6" aria-label="Job Agent activity summary">{activityStats.map(([key, label]) => <div key={key} className="rounded-xl border border-white/[.07] bg-white/[.02] px-3 py-3"><p className="text-xl font-semibold text-white">{stats[key]}</p><p className="mt-0.5 text-[11px] text-slate-500">{label}</p></div>)}</section>

    <section id="current-results" className="mt-6 glass rounded-2xl border border-white/[.07] p-4 sm:p-6" aria-labelledby="matches-title">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="eyebrow">Discover → verify → decide</p><h2 id="matches-title" className="mt-1 font-display text-xl font-semibold text-white">Current search results</h2><p className="mt-1 text-xs text-slate-500">Compact by default. Open only the jobs you want to inspect.</p></div>
        <nav className="flex flex-wrap gap-2 text-xs" aria-label="Result sections"><a href="#recommended-results" className="rounded-full border border-emerald-300/15 bg-emerald-400/[.04] px-3 py-1.5 text-emerald-200">Ready {recommended.length}</a><a href="#review-results" className="rounded-full border border-amber-300/15 bg-amber-400/[.04] px-3 py-1.5 text-amber-200">Needs review {review.length}</a><a href="#blocked-results" className="rounded-full border border-rose-300/15 bg-rose-400/[.04] px-3 py-1.5 text-rose-200">Blocked {blocked.length}</a></nav>
      </div>

      {activeJobs.length ? <div className="mt-5 space-y-5">
        {recommended.length ? <section id="recommended-results" aria-labelledby="recommended-title"><div className="mb-2 flex items-center justify-between"><h3 id="recommended-title" className="text-sm font-semibold text-emerald-200">Ready to review</h3><span className="text-xs text-slate-500">{recommended.length}</span></div><div className="space-y-2">{recommended.slice(0, 20).map((job) => <JobResult key={job.id} job={job} now={now} />)}</div></section> : null}
        {review.length ? <section id="review-results" aria-labelledby="review-title"><div className="mb-2 flex items-center justify-between"><h3 id="review-title" className="text-sm font-semibold text-amber-200">Needs review</h3><span className="text-xs text-slate-500">{review.length}</span></div><div className="space-y-2">{review.slice(0, 30).map((job) => <JobResult key={job.id} job={job} now={now} />)}</div></section> : null}
        {blocked.length ? <details id="blocked-results" className="group rounded-xl border border-rose-300/10 bg-rose-400/[.02]"><summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-rose-200 [&::-webkit-details-marker]:hidden"><span>Blocked by hard rules <span className="ml-1 text-xs font-normal text-slate-500">({blocked.length})</span></span><span aria-hidden="true" className="text-lg text-slate-500 transition-transform group-open:rotate-180">⌄</span></summary><div className="space-y-2 border-t border-rose-300/10 p-3">{blocked.slice(0, 30).map((job) => <JobResult key={job.id} job={job} now={now} />)}</div></details> : null}
      </div> : <div className="mt-5 rounded-xl border border-dashed border-white/10 p-6 text-sm leading-6 text-slate-400">No active results for the current confirmed search. Expired vacancies are removed before ranking and never shown here.</div>}
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]"><div className="glass rounded-2xl border border-white/[.07] p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Application tracker</p><h2 className="mt-1 font-display text-xl font-semibold text-white">Recent applications</h2></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">{agent.status}</span></div>{applications.length ? <div className="mt-5 space-y-3">{applications.slice(0, 8).map((application) => { const job = application.job_opportunities; return <article key={application.id} className="rounded-xl border border-white/[.07] bg-black/10 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold text-white">{job?.role ?? "Application"}</p><p className="mt-1 text-sm text-slate-400">{job?.company ?? "Company"}{job?.location ? ` · ${job.location}` : ""}</p></div><span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs font-semibold capitalize text-violet-200">{badge(application.status)}</span></div>{application.next_action ? <p className="mt-3 text-sm text-amber-200">Action: {application.next_action}</p> : null}<Link href={`/job-agent/applications/${application.id}`} className="mt-3 inline-block text-sm font-semibold text-cyan-300">Open application pack →</Link></article>; })}</div> : <div className="mt-5 rounded-xl border border-dashed border-white/10 p-6 text-sm leading-6 text-slate-400">No approved applications yet. “Submitted” is recorded only after external evidence or explicit user attestation exists.</div>}</div>
      <div className="glass rounded-2xl border border-white/[.07] p-5 sm:p-6"><p className="eyebrow">Job Agent Inbox</p><h2 className="mt-1 font-display text-xl font-semibold text-white">What needs you</h2><div className="mt-5 space-y-3">{inbox.slice(0, 8).map((item) => <article key={item.id} className={`rounded-xl border p-4 ${item.read_at ? "border-white/[.07] bg-black/10" : "border-amber-300/15 bg-amber-400/[.04]"}`}><div className="flex items-center justify-between gap-3"><Link href={item.deep_link ?? "/job-agent"} className="text-sm font-semibold text-amber-100">{item.title}</Link><span className="text-[10px] uppercase tracking-wide text-slate-500">{item.priority}</span></div><p className="mt-1 text-sm leading-6 text-slate-400">{item.recommended_action ?? item.body}</p><div className="mt-3 flex gap-2">{!item.read_at ? <form action={markInboxRead}><input type="hidden" name="inbox_id" value={item.id} /><button className="text-xs font-semibold text-cyan-300">Mark read</button></form> : null}<form action={dismissInboxItem}><input type="hidden" name="inbox_id" value={item.id} /><button className="text-xs font-semibold text-slate-500">Dismiss</button></form></div></article>)}{!inbox.length ? <p className="rounded-xl border border-white/[.07] p-4 text-sm leading-6 text-slate-400">No unread or open Inbox actions.</p> : null}</div></div>
    </section>
  </>;
}
