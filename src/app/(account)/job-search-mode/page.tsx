import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getIdentityWorkspace } from "@/lib/identity/repository";
import { createClient } from "@/lib/supabase/server";
import { CAREER_CATALOG } from "@/data/careerCatalog";
import { setJourneyMode } from "../actions";

function StepCard({ step, title, description, href, cta, ready }: { step: string; title: string; description: string; href: string; cta: string; ready?: boolean }) {
  return <Link href={href} className="group rounded-2xl border border-white/[.08] bg-white/[.035] p-5 transition hover:border-violet-300/30 hover:bg-violet-400/[.06]"><div className="flex items-start justify-between gap-3"><span className="text-xs font-bold uppercase tracking-[.16em] text-violet-300">{step}</span>{ready !== undefined ? <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${ready ? "bg-emerald-400/10 text-emerald-200" : "bg-amber-400/10 text-amber-200"}`}>{ready ? "Ready" : "Needs setup"}</span> : null}</div><h2 className="mt-3 text-xl font-semibold text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{description}</p><span className="mt-5 inline-flex text-sm font-semibold text-violet-200 group-hover:text-white">{cta} →</span></Link>;
}

function resolveTargetCareerRoute(targetCareer: string | null | undefined) {
  const normalized = targetCareer?.trim().toLowerCase();
  if (!normalized) return null;
  const career = CAREER_CATALOG.find((item) => item.slug.toLowerCase() === normalized || item.title.toLowerCase() === normalized);
  if (!career) return null;
  return `/careers/${career.slug}`;
}

export default async function JobSearchModePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await requireUser("/job-search-mode"); const data = await getIdentityWorkspace(user); const query = await searchParams; const supabase = await createClient();
  const { data: agent } = await supabase.from("job_agents").select("id,status").eq("user_id", user.id).maybeSingle<{ id: string; status: string }>();
  const hasCv = data.resumes.length > 0; const hasTarget = Boolean(data.profile.target_career); const hasLanguages = data.profile.languages.length > 0; const hasRegion = Boolean(data.preferences?.job_search_region);
  const targetCareerRoute = resolveTargetCareerRoute(data.profile.target_career);
  const interviewHref = targetCareerRoute ? `${targetCareerRoute}?section=interview` : "/careers";
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:py-12">{query.welcome ? <p role="status" className="mb-6 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">Fast Track activated. You can start applying without completing the learning roadmap first.</p> : null}<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="eyebrow">Job-ready fast track</p><h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">Go from ready to apply to hired</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">Use only the execution tools you need. AI Role Path keeps the full learning journey available, but it will not force you through training you have already completed.</p></div><form action={setJourneyMode}><input type="hidden" name="journey_mode" value="learn_and_build" /><button className="btn-secondary min-h-11 text-sm">Switch to Learn & Build</button></form></div>

    <section className="mt-8 rounded-2xl border border-violet-300/15 bg-violet-400/[.05] p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-violet-300">Fast-track readiness</p><div className="mt-4 grid gap-3 text-sm sm:grid-cols-4"><div><span className="text-slate-500">Target role</span><p className="mt-1 text-white">{hasTarget ? data.profile.target_career : "Not set"}</p></div><div><span className="text-slate-500">Languages</span><p className="mt-1 text-white">{hasLanguages ? data.profile.languages.join(", ") : "Not set"}</p></div><div><span className="text-slate-500">Search region</span><p className="mt-1 text-white">{hasRegion ? data.preferences?.job_search_region?.replaceAll("_", " ") : "Not set"}</p></div><div><span className="text-slate-500">Master CV</span><p className="mt-1 text-white">{hasCv ? data.resumes[0].title : "Not uploaded"}</p></div></div>{(!hasTarget || !hasLanguages || !hasRegion) ? <Link href="/profile#job-search" className="mt-4 inline-flex text-sm font-semibold text-amber-200">Complete matching filters before activating Job Agent →</Link> : null}</section>

    <section className="mt-8 grid gap-5 md:grid-cols-2"><StepCard step="01 · CV intelligence" title="Analyze and strengthen your CV" description="Check ATS readability, evidence quality, target-role alignment and gaps before matching against live vacancies." href="/cv-analyzer" cta="Open CV Analyzer" ready={hasCv} /><StepCard step="02 · Job matching" title="Configure precise job filters" description="Set target roles, countries, languages, workplace model, seniority and exclusions. Hard eligibility is enforced before Fit Score." href="/job-agent" cta={agent ? "Review Job Agent" : "Configure Job Agent"} ready={Boolean(agent)} /><StepCard step="03 · Application execution" title="Match, approve and track applications" description="Review only eligible opportunities, approve the ones you want, generate grounded application packs and manage the application pipeline." href="/job-agent" cta="Open matching & tracker" /><StepCard step="04 · Interview preparation" title="Use role-specific interview practice when needed" description="Interview preparation remains available inside each career workspace, so you can practice against the exact role without completing its learning roadmap." href={interviewHref} cta="Open interview preparation" /></section>

    <section className="mt-8 rounded-2xl border border-white/[.07] p-5"><h2 className="font-semibold text-white">Need to fill a skill gap later?</h2><p className="mt-2 text-sm leading-6 text-slate-400">Fast Track does not lock you out of learning. Open any career roadmap whenever a job match exposes a gap worth fixing.</p><Link href="/#career-universe" className="mt-4 inline-flex text-sm font-semibold text-violet-300">Explore full career paths →</Link></section>
  </main>;
}
