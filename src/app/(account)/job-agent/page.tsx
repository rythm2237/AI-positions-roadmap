import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getJobAgentWorkspace } from "@/lib/job-agent/repository";
import { JobAgentDashboardView } from "@/components/job-agent/JobAgentDashboardView";
import { JobAgentSettingsForm } from "@/components/job-agent/JobAgentSettingsForm";
import { JobAgentSearchButton } from "@/components/job-agent/JobAgentSearchButton";
import { ResumeUploader } from "@/components/identity/ResumeUploader";
import { saveJobAgent, setJobAgentStatus } from "./actions";
import { countProviderIssues, groupCurrentJobResults } from "@/lib/job-agent/resultGroups";

const errorMessages: Record<string, string> = {
  "rate-limit": "A Job Agent search was started very recently. Wait a moment before starting another run.",
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

type IdentityPanelProps = {
  profile: { current_position: string | null; skills: string[]; certificates: string[]; languages: string[] };
  latestResume: { title: string; version: number; file_type: string } | undefined;
  userId: string;
  linkedinUrl: string | null | undefined;
};

function IdentityPanel({ profile, latestResume, userId, linkedinUrl }: IdentityPanelProps) {
  return <div className="space-y-3">
    <section className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[11px] uppercase tracking-[.16em] text-slate-500">Profile</p><p className="mt-2 font-semibold text-white">{profile.current_position || "Current role not set"}</p></div><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-slate-400">{profile.skills.length} skills</span></div>
      <p className="mt-2 text-xs leading-5 text-slate-400">{profile.certificates.length} certifications · {profile.languages.length} languages</p>
      <Link href="/profile" className="mt-3 inline-block text-sm font-semibold text-violet-300">Review profile →</Link>
    </section>
    <section className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4">
      <p className="text-[11px] uppercase tracking-[.16em] text-slate-500">Master CV</p>
      <p className="mt-2 font-semibold text-white">{latestResume ? latestResume.title : "No CV uploaded"}</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">{latestResume ? `Version ${latestResume.version} · ${latestResume.file_type.toUpperCase()}` : "Upload a factual Master CV so Job Agent can score roles against CV evidence."}</p>
      <div className="mt-3"><ResumeUploader userId={userId} label={latestResume ? "Replace Master CV" : "Upload Master CV"} /></div>
    </section>
    <section className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[11px] uppercase tracking-[.16em] text-slate-500">LinkedIn</p><p className="mt-2 font-semibold text-white">{linkedinUrl ? "Profile URL saved" : "Not connected"}</p></div><span className={`mt-1 h-2.5 w-2.5 rounded-full ${linkedinUrl ? "bg-emerald-300" : "bg-slate-600"}`} aria-hidden="true" /></div>
      <p className="mt-2 text-xs leading-5 text-slate-400">The saved URL is used as an identity reference. Live synchronization is not claimed without approved API access.</p>
    </section>
  </div>;
}

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
  const searchChips = agent ? [
    agent.search_countries.join(", ") || "No country",
    agent.workplace_preferences.length ? agent.workplace_preferences.map((value) => value.replace("_", " ")).join(" / ") : "Any workplace",
    agent.english_only_priority ? "English-only" : (agent.search_languages?.join(", ") || workspace.profile.languages.join(", ") || "Languages unconfirmed"),
    agent.primary_career || agent.desired_titles[0] || "No target role",
  ] : [];
  const groupedResults = groupCurrentJobResults(workspace.jobs);
  const sourceIssues = countProviderIssues(workspace.latestSearch?.provider_summary);
  const resultSummary = [
    { label: "Canonical jobs", value: groupedResults.active.length, tone: "text-cyan-200 border-cyan-300/15 bg-cyan-400/[.04]" },
    { label: "Ready", value: groupedResults.ready.length, tone: "text-emerald-200 border-emerald-300/15 bg-emerald-400/[.04]" },
    { label: "Needs review", value: groupedResults.review.length, tone: "text-amber-200 border-amber-300/15 bg-amber-400/[.04]" },
    { label: "Blocked", value: groupedResults.blocked.length, tone: "text-rose-200 border-rose-300/15 bg-rose-400/[.04]" },
    ...(sourceIssues ? [{ label: "Source issues", value: sourceIssues, tone: "text-violet-200 border-violet-300/15 bg-violet-400/[.04]" }] : []),
  ];

  return <main className="mx-auto max-w-[1440px] px-5 py-10 sm:py-12">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0"><p className="eyebrow">Roadmap execution layer</p><h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">Job Acquisition System</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">Live discovery, source-aware verification, hard eligibility, evidence-grounded ranking, truthful application packs and lifecycle tracking. Consequential decisions remain under your control.</p>{searchChips.length ? <div className="mt-4 flex flex-wrap gap-2" aria-label="Current confirmed search">{searchChips.map((chip) => <span key={chip} className="rounded-full border border-cyan-300/15 bg-cyan-300/[.035] px-3 py-1.5 text-xs text-cyan-100">{chip}</span>)}</div> : null}</div>
      {agent ? <div className="flex shrink-0 flex-wrap gap-3"><JobAgentSearchButton /><form action={setJobAgentStatus}><input type="hidden" name="status" value={agent.status === "active" ? "paused" : "active"} /><button className={agent.status === "active" ? "btn-secondary min-h-11" : "btn-primary min-h-11"}>{agent.status === "active" ? "Pause Agent" : "Resume Agent"}</button></form></div> : null}
    </div>

    {query.saved ? <p role="status" className="mt-5 rounded-xl border border-emerald-300/15 bg-emerald-400/[.06] px-4 py-3 text-sm text-emerald-200">Settings saved. This search used the confirmed configuration above.</p> : null}

    {workspace.latestSearch ? <section className="mt-5 rounded-2xl border border-white/[.07] bg-white/[.02] p-4" aria-labelledby="search-summary-title">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><p id="search-summary-title" className="text-sm font-semibold text-white">{workspace.latestSearch.status === "partial" ? "Search complete · some sources need attention" : groupedResults.active.length === 0 ? "Search complete · no matching jobs" : "Search complete"}</p><p className="mt-1 text-xs text-slate-500">Expired vacancies are removed before ranking and are not included below.</p></div><code className="text-[11px] text-slate-600">Run {String(workspace.latestSearch.correlation_id).slice(0, 8)}</code></div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">{resultSummary.map((item) => <div key={item.label} className={`rounded-xl border px-3 py-3 ${item.tone}`}><p className="text-2xl font-semibold">{item.value}</p><p className="mt-0.5 text-[11px] opacity-75">{item.label}</p></div>)}</div>
    </section> : null}

    {errorMessage ? <p role="alert" className="mt-5 rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-200">{errorMessage}</p> : null}

    <details className="mt-5 rounded-2xl border border-white/[.07] bg-white/[.02] lg:hidden"><summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-200 [&::-webkit-details-marker]:hidden">Profile, CV & LinkedIn <span className="float-right text-slate-500">⌄</span></summary><div className="border-t border-white/[.06] p-3"><IdentityPanel profile={workspace.profile} latestResume={latestResume} userId={user.id} linkedinUrl={agent?.linkedin_url} /></div></details>

    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="min-w-0">
        {workspace.latestSearch ? <section className="rounded-xl border border-white/[.06] bg-white/[.015] px-4 py-3 text-xs leading-5 text-slate-500"><strong className="text-slate-300">Latest run:</strong> {workspace.latestSearch.status} · {workspace.latestSearch.latency_ms ?? "—"} ms · estimated provider cost ${Number(workspace.latestSearch.estimated_cost ?? 0).toFixed(4)} · run {String(workspace.latestSearch.correlation_id).slice(0, 8)}</section> : null}
        {agent ? <JobAgentDashboardView agent={agent} stats={workspace.stats} jobs={workspace.jobs} applications={workspace.applications} inbox={workspace.inbox} /> : <section className="rounded-2xl border border-violet-300/15 bg-violet-400/[.04] p-5 sm:p-6"><p className="eyebrow">First activation</p><h2 className="mt-2 font-display text-2xl font-semibold text-white">Confirm only what the roadmap does not already know</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Your target career and latest CV are reused as evidence without silently changing your profile. Sensitive employment and salary information stays optional.</p></section>}
      </div>
      <aside className="sticky top-24 hidden lg:block" aria-label="Career identity sources"><div className="mb-3 flex items-center justify-between px-1"><p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">Your search identity</p><Link href="/profile" className="text-xs text-violet-300">Edit</Link></div><IdentityPanel profile={workspace.profile} latestResume={latestResume} userId={user.id} linkedinUrl={agent?.linkedin_url} /></aside>
    </div>

    <section className="mt-8"><JobAgentSettingsForm agent={agent} primaryCareer={primaryCareer} knownLanguages={knownLanguages} preferenceCountry={workspace.preferences?.job_search_country} action={saveJobAgent} /></section>
  </main>;
}
