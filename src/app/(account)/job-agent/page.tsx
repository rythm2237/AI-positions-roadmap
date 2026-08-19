import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getJobAgentWorkspace } from "@/lib/job-agent/repository";
import { JobAgentDashboardView } from "@/components/job-agent/JobAgentDashboardView";
import { JobAgentSettingsForm } from "@/components/job-agent/JobAgentSettingsForm";
import { saveJobAgent, setJobAgentStatus } from "./actions";
import { runJobSearch } from "./searchActions";

export default async function JobAgentPage({
  searchParams,
}: {
  searchParams: Promise<{ career?: string; saved?: string; error?: string; status?: string; searched?: string }>;
}) {
  const user = await requireUser("/job-agent");
  const workspace = await getJobAgentWorkspace(user);
  const query = await searchParams;
  const agent = workspace.agent;
  const primaryCareer = agent?.primary_career ?? query.career ?? workspace.profile.target_career ?? workspace.savedCareers[0]?.career_slug ?? "";
  const knownLanguages = workspace.profile.languages.join(", ");
  const latestResume = workspace.resumes[0];

  return <main className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="eyebrow">Roadmap execution layer</p><h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">Job Application Agent</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">Move from career preparation into job discovery, explainable Fit Scores, grounded application packs and a persistent tracker. Consequential decisions remain under your control.</p></div>{agent ? <div className="flex flex-wrap gap-3"><form action={runJobSearch}><button className="btn-primary min-h-11">Search jobs now</button></form><form action={setJobAgentStatus}><input type="hidden" name="status" value={agent.status === "active" ? "paused" : "active"} /><button className={agent.status === "active" ? "btn-secondary min-h-11" : "btn-primary min-h-11"}>{agent.status === "active" ? "Pause Agent" : "Resume Agent"}</button></form></div> : null}</div>

    {query.saved ? <p role="status" className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">Job Agent settings saved.</p> : null}
    {query.searched ? <p role="status" className="mt-6 rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">Search completed. {query.searched} provider records were evaluated and deduplicated.</p> : null}
    {query.error ? <p role="alert" className="mt-6 rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-200">The Agent could not complete that action. Check the search criteria, Master CV, provider configuration and thresholds.</p> : null}

    <section className="mt-8 grid gap-4 md:grid-cols-3" aria-label="Career identity sources"><div className="glass rounded-2xl border border-white/[.07] p-5"><p className="text-xs uppercase tracking-[.16em] text-slate-500">Profile</p><p className="mt-2 font-semibold text-white">{workspace.profile.current_position || "Current role not set"}</p><p className="mt-2 text-sm text-slate-400">{workspace.profile.skills.length} skills · {workspace.profile.certificates.length} certifications · {workspace.profile.languages.length} languages</p><Link href="/profile" className="mt-4 inline-block text-sm font-semibold text-violet-300">Review profile →</Link></div><div className="glass rounded-2xl border border-white/[.07] p-5"><p className="text-xs uppercase tracking-[.16em] text-slate-500">Master CV</p><p className="mt-2 font-semibold text-white">{latestResume ? latestResume.title : "No CV uploaded"}</p><p className="mt-2 text-sm text-slate-400">{latestResume ? `Version ${latestResume.version} · ${latestResume.file_type.toUpperCase()}` : "Upload a factual Master CV before generating tailored versions."}</p></div><div className="glass rounded-2xl border border-white/[.07] p-5"><p className="text-xs uppercase tracking-[.16em] text-slate-500">LinkedIn</p><p className="mt-2 font-semibold text-white">{agent?.linkedin_url ? "Profile URL saved" : "Not connected"}</p><p className="mt-2 text-sm text-slate-400">V1 records the URL and review preference. No live synchronization is claimed without approved API access.</p></div></section>

    {agent ? <JobAgentDashboardView agent={agent} stats={workspace.stats} jobs={workspace.jobs} applications={workspace.applications} /> : <section className="mt-8 rounded-2xl border border-violet-300/15 bg-violet-400/[.04] p-5 sm:p-6"><p className="eyebrow">First activation</p><h2 className="mt-2 font-display text-2xl font-semibold text-white">Confirm only what the roadmap does not already know</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Your target career, languages and latest CV are reused where available. Sensitive employment and salary information stays optional.</p></section>}

    <JobAgentSettingsForm agent={agent} primaryCareer={primaryCareer} knownLanguages={knownLanguages} preferenceCountry={workspace.preferences?.job_search_country} action={saveJobAgent} />
  </main>;
}
