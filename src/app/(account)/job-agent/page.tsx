import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getJobAgentWorkspace } from "@/lib/job-agent/repository";
import { JobAgentDashboardView } from "@/components/job-agent/JobAgentDashboardView";
import { JobAgentSettingsForm } from "@/components/job-agent/JobAgentSettingsForm";
import { ResumeUploader } from "@/components/identity/ResumeUploader";
import { saveJobAgent, setJobAgentStatus } from "./actions";

const errorMessages: Record<string, string> = {
  criteria: "Add at least one target role and one search country before running the Agent.",
  country: "None of the configured countries are supported by the current job provider. Review the country names in Job Agent settings.",
  provider: "The live job provider is not configured for this environment.",
  "provider-failure": "Every configured provider failed. No empty result was recorded as a successful search; retry after checking provider health, limits and credentials.",
  profile: "Your Job Agent profile could not be loaded. Review your profile and Agent settings, then retry.",
  paused: "The Job Agent is paused. Resume it before running a search.",
  "master-cv": "Upload a Master CV before preparing an application pack.",
  pack: "Application pack generation failed. The saved application contains the specific retry action; your job was not marked as applied.",
  thresholds: "Fit thresholds are invalid. Auto-skip must be lower than auto-prepare, which must be lower than strong-match.",
  salary: "Preferred salary cannot be lower than minimum salary.",
  save: "The Job Agent settings could not be saved. Review the fields and retry.",
  "search-save": "The search completed, but the discovered vacancies could not be saved. Retry the search.",
};

export default async function JobAgentPage({
  searchParams,
}: {
  searchParams: Promise<{ career?: string; saved?: string; error?: string; status?: string; searched?: string; eligible?: string; unverified?: string; blocked?: string; expired?: string; provider_errors?: string; outcome?: string; correlation?: string }>;
}) {
  const user = await requireUser("/job-agent");
  const workspace = await getJobAgentWorkspace(user);
  const query = await searchParams;
  const agent = workspace.agent;
  const primaryCareer = agent?.primary_career ?? query.career ?? workspace.profile.target_career ?? workspace.savedCareers[0]?.career_slug ?? "";
  const knownLanguages = workspace.profile.languages.join(", ");
  const latestResume = workspace.resumes[0];
  const errorMessage = query.error ? errorMessages[query.error] ?? "The Agent could not complete that action. Review the relevant settings and retry." : null;
  const searchContext = agent ? [agent.search_countries.join(", ") || "No country", agent.workplace_preferences.length ? agent.workplace_preferences.map((value) => value.replace("_", " ")).join("/") : "Any workplace", agent.english_only_priority ? "English-only" : (agent.search_languages?.join(", ") || workspace.profile.languages.join(", ") || "Languages unconfirmed"), agent.primary_career || agent.desired_titles[0] || "No target role"].join(" · ") : null;

  return <main className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="eyebrow">Roadmap execution layer</p><h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">Job Acquisition System</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">Live discovery, source-aware verification, hard eligibility, evidence-grounded ranking, truthful application packs and lifecycle tracking. Consequential decisions remain under your control.</p>{searchContext ? <div className="mt-3 rounded-xl border border-cyan-300/15 bg-cyan-300/[.04] px-3 py-2 text-sm text-cyan-100"><strong>Current confirmed search:</strong> {searchContext}</div> : null}</div>{agent ? <div className="flex flex-wrap gap-3"><button type="submit" form="job-agent-settings" name="intent" value="save_and_search" className="btn-primary min-h-11">Save & Search current settings</button><form action={setJobAgentStatus}><input type="hidden" name="status" value={agent.status === "active" ? "paused" : "active"} /><button className={agent.status === "active" ? "btn-secondary min-h-11" : "btn-primary min-h-11"}>{agent.status === "active" ? "Pause Agent" : "Resume Agent"}</button></form></div> : null}</div>

    {query.saved ? <p role="status" className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">Job Agent settings saved. The search used this saved configuration.</p> : null}
    {query.searched ? <p role="status" className="mt-6 rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-sm leading-6 text-cyan-100">Search {query.outcome === "partial" ? "completed with provider warnings" : query.outcome === "no_results" ? "completed with no matching records" : "completed"}. {query.searched} canonical vacancies · {query.eligible ?? 0} eligible · {query.unverified ?? 0} unverified · {query.blocked ?? 0} blocked · {query.expired ?? 0} expired{Number(query.provider_errors ?? 0) ? ` · ${query.provider_errors} provider errors` : ""}. Correlation: <code>{query.correlation?.slice(0, 8)}</code>.</p> : null}
    {errorMessage ? <p role="alert" className="mt-6 rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-200">{errorMessage}</p> : null}

    <section className="mt-8 grid gap-4 md:grid-cols-3" aria-label="Career identity sources">
      <div className="glass rounded-2xl border border-white/[.07] p-5"><p className="text-xs uppercase tracking-[.16em] text-slate-500">Profile</p><p className="mt-2 font-semibold text-white">{workspace.profile.current_position || "Current role not set"}</p><p className="mt-2 text-sm text-slate-400">{workspace.profile.skills.length} skills · {workspace.profile.certificates.length} certifications · {workspace.profile.languages.length} languages</p><Link href="/profile" className="mt-4 inline-block text-sm font-semibold text-violet-300">Review profile →</Link></div>
      <div className="glass rounded-2xl border border-white/[.07] p-5"><p className="text-xs uppercase tracking-[.16em] text-slate-500">Master CV</p><p className="mt-2 font-semibold text-white">{latestResume ? latestResume.title : "No CV uploaded"}</p><p className="mt-2 text-sm text-slate-400">{latestResume ? `Version ${latestResume.version} · ${latestResume.file_type.toUpperCase()}` : "Upload a factual Master CV so Job Agent can score roles against CV evidence."}</p><div className="mt-4"><ResumeUploader userId={user.id} label={latestResume ? "Replace Master CV" : "Upload Master CV"} /></div></div>
      <div className="glass rounded-2xl border border-white/[.07] p-5"><p className="text-xs uppercase tracking-[.16em] text-slate-500">LinkedIn</p><p className="mt-2 font-semibold text-white">{agent?.linkedin_url ? "Profile URL saved" : "Not connected"}</p><p className="mt-2 text-sm text-slate-400">V1 records the URL and review preference. No live synchronization is claimed without approved API access.</p></div>
    </section>

    {workspace.latestSearch ? <section className="mt-6 rounded-2xl border border-white/[.07] bg-white/[.025] p-4 text-xs leading-5 text-slate-400"><strong className="text-slate-200">Latest run evidence:</strong> {workspace.latestSearch.status} · {workspace.latestSearch.deduplicated_count} canonical jobs · {workspace.latestSearch.latency_ms ?? "—"} ms · estimated provider cost ${Number(workspace.latestSearch.estimated_cost ?? 0).toFixed(4)} · correlation {String(workspace.latestSearch.correlation_id).slice(0, 8)}</section> : null}

    {agent ? <JobAgentDashboardView agent={agent} stats={workspace.stats} jobs={workspace.jobs} applications={workspace.applications} inbox={workspace.inbox} /> : <section className="mt-8 rounded-2xl border border-violet-300/15 bg-violet-400/[.04] p-5 sm:p-6"><p className="eyebrow">First activation</p><h2 className="mt-2 font-display text-2xl font-semibold text-white">Confirm only what the roadmap does not already know</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Your target career and latest CV are reused as evidence without silently changing your profile. Sensitive employment and salary information stays optional.</p></section>}

    <JobAgentSettingsForm agent={agent} primaryCareer={primaryCareer} knownLanguages={knownLanguages} preferenceCountry={workspace.preferences?.job_search_country} action={saveJobAgent} />
  </main>;
}
