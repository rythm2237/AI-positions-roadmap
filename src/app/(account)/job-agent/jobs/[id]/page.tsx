import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { approveJob, rejectJob, snoozeJob } from "../../decisionActions";
import type { JobAgent, JobOpportunity } from "@/types/jobAgent";

const salary = (job: JobOpportunity) => {
  if (job.salary_min == null && job.salary_max == null) return null;
  const currency = job.salary_currency ?? "";
  if (job.salary_min != null && job.salary_max != null) return `${currency} ${Math.round(job.salary_min).toLocaleString()}–${Math.round(job.salary_max).toLocaleString()}`.trim();
  return `${currency} ${Math.round(job.salary_min ?? job.salary_max ?? 0).toLocaleString()}+`.trim();
};

export default async function JobRecommendationPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; intent?: string }> }) {
  const user = await requireUser("/job-agent");
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();
  const [jobResult, agentResult, existingResult] = await Promise.all([
    supabase.from("job_opportunities").select("*").eq("id", id).eq("user_id", user.id).maybeSingle<JobOpportunity & { job_description?: string | null; required_languages?: string[] }>(),
    supabase.from("job_agents").select("*").eq("user_id", user.id).single<JobAgent>(),
    supabase.from("applications").select("id,status").eq("user_id", user.id).eq("job_id", id).maybeSingle(),
  ]);
  if (!jobResult.data || jobResult.error || agentResult.error) notFound();
  const job = jobResult.data;
  const agent = agentResult.data;
  const skipped = job.status === "skipped" || job.recommendation === "skip";
  const pay = salary(job);
  const decided = job.decision_status === "approved" || job.decision_status === "rejected";

  return <main className="mx-auto max-w-4xl px-5 py-10 sm:py-12">
    <Link href="/job-agent" className="text-sm font-semibold text-violet-300">← Job Agent</Link>
    {query.error === "not-eligible" ? <p role="alert" className="mt-5 rounded-xl border border-amber-300/20 bg-amber-400/[.06] p-4 text-sm text-amber-100">This vacancy is not eligible under your current Job Agent rules.</p> : null}
    {query.intent ? <p className="mt-5 rounded-xl border border-cyan-300/20 bg-cyan-400/[.05] p-4 text-sm text-cyan-100">Email action selected: <strong className="capitalize">{query.intent}</strong>. Confirm your decision below. Email links never change application state automatically.</p> : null}
    <div className="mt-6 glass rounded-3xl border border-white/[.07] p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="eyebrow">{skipped ? "Not recommended" : "Job recommendation"}</p><h1 className="mt-2 font-display text-3xl font-semibold text-white">{job.role}</h1><p className="mt-2 text-slate-400">{job.company}{job.location ? ` · ${job.location}` : ""}{job.country ? ` · ${job.country}` : ""}</p>{pay ? <p className="mt-2 text-sm text-emerald-200">Salary: {pay}</p> : null}</div><div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/[.05] px-5 py-3 text-center"><p className="text-3xl font-semibold text-cyan-100">{job.fit_score ?? "—"}%</p><p className="text-xs uppercase tracking-[.14em] text-slate-500">Fit Score</p></div></div>
      {skipped && job.skip_reason ? <p className="mt-6 rounded-xl border border-amber-300/20 bg-amber-400/[.05] p-4 text-sm leading-6 text-amber-100"><strong>Excluded:</strong> {job.skip_reason}</p> : null}
      <div className="mt-7 grid gap-5 sm:grid-cols-2"><section><h2 className="font-semibold text-emerald-200">Strong signals</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">{job.strengths.length ? job.strengths.map((item) => <li key={item}>✓ {item}</li>) : <li>No strong signal recorded.</li>}</ul></section><section><h2 className="font-semibold text-amber-200">Gaps / uncertainty</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">{job.gaps.length ? job.gaps.map((item) => <li key={item}>• {item}</li>) : <li>No material gap detected from available data.</li>}</ul></section></div>
      {job.required_languages?.length ? <p className="mt-6 rounded-xl border border-white/[.07] p-4 text-sm text-slate-300"><strong className="text-white">Detected language requirements:</strong> {job.required_languages.join(", ")}</p> : <p className="mt-6 rounded-xl border border-white/[.07] p-4 text-sm text-slate-400"><strong className="text-white">Language:</strong> No reliable requirement was detected from the provider text.</p>}
      <div className="mt-7"><a href={job.job_url} target="_blank" rel="noreferrer" className="btn-secondary inline-flex min-h-11 items-center justify-center">Open original vacancy</a></div>
    </div>

    {!skipped && !decided && !existingResult.data ? <section id="decision-actions" className="mt-6 rounded-2xl border border-violet-300/15 bg-violet-400/[.04] p-5"><p className="eyebrow">Your decision</p><h2 className="mt-1 font-display text-xl font-semibold text-white">What should the Agent do?</h2><p className="mt-2 text-sm leading-6 text-slate-400">No application is prepared or submitted until you approve this vacancy.</p><div className="mt-5 flex flex-wrap gap-3">{agent.automation_mode !== "discovery_only" ? <form action={approveJob}><input type="hidden" name="job_id" value={job.id} /><button className="btn-primary min-h-11 px-5">Apply</button></form> : <p className="text-sm text-slate-400">Switch the Agent out of Discovery Only before approving applications.</p>}<form action={rejectJob}><input type="hidden" name="job_id" value={job.id} /><button className="btn-secondary min-h-11 px-5">Reject</button></form><form action={snoozeJob} className="flex items-center gap-2"><input type="hidden" name="job_id" value={job.id} /><select name="snooze_days" defaultValue="1" className="input-field min-h-11"><option value="1">1 day</option><option value="3">3 days</option><option value="7">1 week</option><option value="30">1 month</option></select><button className="btn-secondary min-h-11 px-5">Snooze</button></form></div></section> : null}
    {job.decision_status === "approved" ? <section className="mt-6 rounded-2xl border border-emerald-300/15 bg-emerald-400/[.04] p-5"><p className="text-sm text-emerald-100">You approved this vacancy. The Agent may prepare and, where a compliant direct-submission integration exists, submit it. Without a verified submission receipt it will not be marked Applied.</p>{existingResult.data ? <Link href={`/job-agent/applications/${existingResult.data.id}`} className="mt-4 inline-block text-sm font-semibold text-cyan-300">Open application pack →</Link> : null}</section> : null}
    {job.decision_status === "rejected" ? <section className="mt-6 rounded-2xl border border-white/[.07] p-5 text-sm text-slate-400">You rejected this vacancy. It remains in history and is removed from the active decision queue.</section> : null}
    <section className="mt-6 rounded-2xl border border-white/[.07] bg-white/[.02] p-5"><p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">Submission policy</p><p className="mt-2 text-sm leading-6 text-slate-400">Apply is your authorization to proceed. The current Adzuna discovery provider does not provide a universal applicant-side submission API, so the Agent prepares the application and keeps final external submission manual unless an official ATS integration with valid credentials returns a real receipt.</p></section>
  </main>;
}
