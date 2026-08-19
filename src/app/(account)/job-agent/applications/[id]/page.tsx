import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

type Asset = { id: string; asset_type: string; version: string; structured_content: Record<string, unknown> | null; created_at: string };
type Grounded = { text?: string; evidenceIds?: string[] };

function groundedList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is Grounded => Boolean(item && typeof item === "object")) : [];
}

export default async function ApplicationPackPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ generated?: string }> }) {
  const user = await requireUser("/job-agent");
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();
  const [applicationResult, assetsResult] = await Promise.all([
    supabase.from("applications").select("id,status,agent_mode,next_action,notes,created_at,job_opportunities(id,company,role,location,job_url,fit_score,source,founder_positioning)").eq("id", id).eq("user_id", user.id).maybeSingle(),
    supabase.from("application_assets").select("id,asset_type,version,structured_content,created_at").eq("application_id", id).eq("user_id", user.id).order("created_at", { ascending: false }).returns<Asset[]>(),
  ]);
  if (!applicationResult.data || applicationResult.error) notFound();
  const application = applicationResult.data;
  const rawJob = application.job_opportunities;
  const job = Array.isArray(rawJob) ? rawJob[0] : rawJob;
  const assets = assetsResult.data ?? [];
  const latest = new Map<string, Asset>();
  for (const asset of assets) if (!latest.has(asset.asset_type)) latest.set(asset.asset_type, asset);
  const cv = latest.get("cv")?.structured_content ?? {};
  const portfolio = latest.get("portfolio")?.structured_content ?? {};
  const cover = latest.get("cover_note")?.structured_content ?? {};
  const screening = latest.get("screening_answers")?.structured_content ?? {};
  const summary = cv.professionalSummary as Grounded | undefined;
  const skills = Array.isArray(cv.selectedSkills) ? cv.selectedSkills.map(String) : [];
  const highlights = groundedList(cv.highlights);
  const cases = Array.isArray(portfolio.cases) ? portfolio.cases as Array<{ title?: string; framing?: string; relevance?: Grounded }> : [];
  const paragraphs = groundedList(cover.paragraphs);
  const answers = Array.isArray(screening.answers) ? screening.answers as Array<{ question?: string; answer?: string | null; requiresUserDecision?: boolean }> : [];
  const missing = Array.isArray(screening.missingUserDecisions) ? screening.missingUserDecisions.map(String) : [];

  return <main className="mx-auto max-w-5xl px-5 py-10 sm:py-12">
    <Link href="/job-agent" className="text-sm font-semibold text-violet-300">← Job Agent</Link>
    {query.generated ? <p role="status" className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">Grounded application pack generated. Review it before using it.</p> : null}
    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Application Pack</p><h1 className="mt-2 font-display text-3xl font-semibold text-white">{job?.role ?? "Application"}</h1><p className="mt-2 text-slate-400">{job?.company ?? "Company"}{job?.location ? ` · ${job.location}` : ""}</p></div><div className="flex items-center gap-3"><span className="rounded-full border border-violet-300/20 bg-violet-400/[.06] px-3 py-1.5 text-xs font-semibold capitalize text-violet-200">{String(application.status).replaceAll("_", " ")}</span>{job?.fit_score !== null && job?.fit_score !== undefined ? <span className="text-sm font-semibold text-cyan-200">{job.fit_score}% Fit</span> : null}</div></div>
    {application.next_action ? <div className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-400/[.04] p-4"><p className="text-xs font-semibold uppercase tracking-[.14em] text-amber-200">Next action</p><p className="mt-2 text-sm text-slate-300">{application.next_action}</p></div> : null}

    <div className="mt-7 grid gap-6 lg:grid-cols-2">
      <section className="glass rounded-2xl border border-white/[.07] p-5"><h2 className="font-display text-xl font-semibold text-white">Tailored CV content</h2>{summary?.text ? <div className="mt-4"><p className="text-xs uppercase tracking-[.14em] text-slate-500">Professional summary</p><p className="mt-2 text-sm leading-6 text-slate-300">{summary.text}</p></div> : null}{skills.length ? <div className="mt-4 flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="rounded-full bg-cyan-400/[.07] px-2.5 py-1 text-xs text-cyan-100">{skill}</span>)}</div> : null}<div className="mt-5 space-y-3">{highlights.map((item, index) => <div key={`${item.text}-${index}`} className="rounded-xl border border-white/[.06] p-3"><p className="text-sm leading-6 text-slate-300">{item.text}</p><p className="mt-2 text-[11px] text-slate-600">Evidence: {item.evidenceIds?.join(", ")}</p></div>)}</div></section>
      <section className="glass rounded-2xl border border-white/[.07] p-5"><h2 className="font-display text-xl font-semibold text-white">Tailored portfolio</h2><div className="mt-4 space-y-3">{cases.length ? cases.map((item, index) => <article key={`${item.title}-${index}`} className="rounded-xl border border-white/[.06] p-4"><div className="flex items-start justify-between gap-3"><p className="font-semibold text-white">{item.title ?? "Case study"}</p><span className="text-xs text-violet-300">{item.framing}</span></div><p className="mt-2 text-sm leading-6 text-slate-300">{item.relevance?.text}</p></article>) : <p className="text-sm text-slate-400">No verified project case was selected from the current canonical evidence.</p>}</div>{job?.founder_positioning ? <p className="mt-4 text-xs leading-5 text-slate-500">Founder positioning: {job.founder_positioning}</p> : null}</section>
      <section className="glass rounded-2xl border border-white/[.07] p-5"><h2 className="font-display text-xl font-semibold text-white">Cover / application note</h2><div className="mt-4 space-y-4">{paragraphs.map((item, index) => <p key={index} className="text-sm leading-6 text-slate-300">{item.text}</p>)}</div></section>
      <section className="glass rounded-2xl border border-white/[.07] p-5"><h2 className="font-display text-xl font-semibold text-white">Screening answers</h2><div className="mt-4 space-y-3">{answers.length ? answers.map((item, index) => <div key={index} className="rounded-xl border border-white/[.06] p-3"><p className="text-sm font-semibold text-white">{item.question}</p><p className="mt-1 text-sm text-slate-300">{item.answer ?? "No safe answer available."}</p>{item.requiresUserDecision ? <p className="mt-2 text-xs font-semibold text-amber-200">User decision required</p> : null}</div>) : <p className="text-sm text-slate-400">No screening questions were generated from the available facts.</p>}</div></section>
    </div>

    {missing.length ? <section className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-400/[.035] p-5"><h2 className="font-semibold text-amber-100">Decisions the Agent will not make for you</h2><ul className="mt-3 space-y-2 text-sm text-slate-300">{missing.map((item) => <li key={item}>• {item}</li>)}</ul></section> : null}
    <div className="mt-7 flex flex-col gap-3 sm:flex-row"><a href={job?.job_url ?? "#"} target="_blank" rel="noreferrer" className="btn-primary inline-flex min-h-11 items-center justify-center">Continue to vacancy</a><p className="self-center text-xs leading-5 text-slate-500">This pack is <strong className="text-slate-300">Ready for Review</strong>, not “Applied” and not “Ready for Submit.” Those statuses require actual external execution evidence.</p></div>
  </main>;
}
