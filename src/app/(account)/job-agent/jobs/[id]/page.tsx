import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { prepareApplication } from "../../applicationActions";
import type { JobAgent, JobOpportunity } from "@/types/jobAgent";

export default async function JobRecommendationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("/job-agent");
  const { id } = await params;
  const supabase = await createClient();
  const [jobResult, agentResult, existingResult] = await Promise.all([
    supabase.from("job_opportunities").select("*").eq("id", id).eq("user_id", user.id).maybeSingle<JobOpportunity & { job_description?: string | null; required_languages?: string[] }>(),
    supabase.from("job_agents").select("*").eq("user_id", user.id).single<JobAgent>(),
    supabase.from("applications").select("id,status").eq("user_id", user.id).eq("job_id", id).maybeSingle(),
  ]);
  if (!jobResult.data || jobResult.error || agentResult.error) notFound();
  const job = jobResult.data;
  const agent = agentResult.data;

  return <main className="mx-auto max-w-4xl px-5 py-10 sm:py-12">
    <Link href="/job-agent" className="text-sm font-semibold text-violet-300">← Job Agent</Link>
    <div className="mt-6 glass rounded-3xl border border-white/[.07] p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="eyebrow">Job recommendation</p><h1 className="mt-2 font-display text-3xl font-semibold text-white">{job.role}</h1><p className="mt-2 text-slate-400">{job.company}{job.location ? ` · ${job.location}` : ""}</p></div><div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/[.05] px-5 py-3 text-center"><p className="text-3xl font-semibold text-cyan-100">{job.fit_score ?? "—"}%</p><p className="text-xs uppercase tracking-[.14em] text-slate-500">Fit Score</p></div></div>
      <div className="mt-7 grid gap-5 sm:grid-cols-2"><section><h2 className="font-semibold text-emerald-200">Strong signals</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">{job.strengths.length ? job.strengths.map((item) => <li key={item}>✓ {item}</li>) : <li>No strong signal recorded.</li>}</ul></section><section><h2 className="font-semibold text-amber-200">Gaps / uncertainty</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">{job.gaps.length ? job.gaps.map((item) => <li key={item}>• {item}</li>) : <li>No material gap detected from available data.</li>}</ul></section></div>
      {job.required_languages?.length ? <p className="mt-6 rounded-xl border border-white/[.07] p-4 text-sm text-slate-300"><strong className="text-white">Detected language requirements:</strong> {job.required_languages.join(", ")}</p> : null}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row"><a href={job.job_url} target="_blank" rel="noreferrer" className="btn-secondary inline-flex min-h-11 items-center justify-center">Open original vacancy</a>{existingResult.data ? <Link href={`/job-agent/applications/${existingResult.data.id}`} className="btn-primary inline-flex min-h-11 items-center justify-center">Open application pack</Link> : agent.automation_mode === "discovery_only" ? <p className="self-center text-sm text-slate-500">Switch to Prepare or Assisted Apply to generate an application pack.</p> : <form action={prepareApplication}><input type="hidden" name="job_id" value={job.id} /><button className="btn-primary min-h-11">Prepare grounded application pack</button></form>}</div>
    </div>
    <section className="mt-6 rounded-2xl border border-white/[.07] bg-white/[.02] p-5"><p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">Transparency</p><p className="mt-2 text-sm leading-6 text-slate-400">Preparing a pack does not submit an application. The generator uses your current Master CV and profile as canonical evidence, rejects unknown evidence references, and leaves consequential or unsupported answers for your review.</p></section>
  </main>;
}
