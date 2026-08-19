import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getJobAgentWorkspace } from "@/lib/job-agent/repository";
import { saveJobAgent, setJobAgentStatus } from "./actions";
import { runJobSearch } from "./searchActions";

const modes = [
  ["discovery_only", "Discovery only", "Find and score roles. No application preparation or sending."],
  ["prepare_applications", "Prepare applications", "Create tailored application packs while you submit manually."],
  ["assisted_apply", "Assisted apply", "Prepare everything, use permitted email automation, and stop before consequential final submits."],
] as const;

const statCards = [
  ["jobsFound", "Jobs Found"], ["strongMatches", "Strong Matches"], ["applicationsSent", "Applications Sent"],
  ["readyForSubmit", "Ready for Submit"], ["recruiterReplies", "Recruiter Replies"], ["interviews", "Interviews"],
] as const;

function csv(values?: string[] | null) { return values?.join(", ") ?? ""; }

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
  const knownLanguages = csv(workspace.profile.languages);
  const latestResume = workspace.resumes[0];

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Roadmap execution layer</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">Job Application Agent</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">Turn your career preparation into job discovery, fit analysis, tailored application packs and a persistent application tracker. Consequential decisions remain under your control.</p>
        </div>
        {agent ? (
          <div className="flex flex-wrap gap-3">
            <form action={runJobSearch}><button className="btn-primary min-h-11">Search jobs now</button></form>
            <form action={setJobAgentStatus}>
              <input type="hidden" name="status" value={agent.status === "active" ? "paused" : "active"} />
              <button className={agent.status === "active" ? "btn-secondary min-h-11" : "btn-primary min-h-11"}>{agent.status === "active" ? "Pause Agent" : "Resume Agent"}</button>
            </form>
          </div>
        ) : null}
      </div>

      {query.saved ? <p role="status" className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">Job Agent settings saved.</p> : null}
      {query.searched ? <p role="status" className="mt-6 rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">Search completed. {query.searched} matching provider records were evaluated and deduplicated.</p> : null}
      {query.error ? <p role="alert" className="mt-6 rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-200">The Agent could not complete that action. Check search criteria, provider configuration and threshold values.</p> : null}

      <section className="mt-8 grid gap-4 md:grid-cols-3" aria-label="Career identity sources">
        <div className="glass rounded-2xl border border-white/[.07] p-5"><p className="text-xs uppercase tracking-[.16em] text-slate-500">Profile</p><p className="mt-2 font-semibold text-white">{workspace.profile.current_position || "Current role not set"}</p><p className="mt-2 text-sm text-slate-400">{workspace.profile.skills.length} skills · {workspace.profile.certificates.length} certifications · {workspace.profile.languages.length} languages</p><Link href="/profile" className="mt-4 inline-block text-sm font-semibold text-violet-300">Review profile →</Link></div>
        <div className="glass rounded-2xl border border-white/[.07] p-5"><p className="text-xs uppercase tracking-[.16em] text-slate-500">Master CV</p><p className="mt-2 font-semibold text-white">{latestResume ? latestResume.title : "No CV uploaded"}</p><p className="mt-2 text-sm text-slate-400">{latestResume ? `Version ${latestResume.version} · ${latestResume.file_type.toUpperCase()}` : "Upload a factual master CV before generating tailored versions."}</p></div>
        <div className="glass rounded-2xl border border-white/[.07] p-5"><p className="text-xs uppercase tracking-[.16em] text-slate-500">LinkedIn</p><p className="mt-2 font-semibold text-white">{agent?.linkedin_url ? "Profile linked by URL" : "Not connected"}</p><p className="mt-2 text-sm text-slate-400">V1 stores your URL and import/review preference. It does not claim live LinkedIn synchronization without approved API access.</p></div>
      </section>

      {agent ? (
        <>
          <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6" aria-label="Job Agent summary">
            {statCards.map(([key, label]) => <div key={key} className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4"><p className="text-2xl font-semibold text-white">{workspace.stats[key]}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>)}
          </section>

          <section className="mt-8 glass rounded-2xl border border-white/[.07] p-5 sm:p-6" aria-labelledby="matches-title">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">What jobs did you find?</p><h2 id="matches-title" className="mt-1 font-display text-xl font-semibold text-white">Latest recommendations</h2></div><p className="text-xs text-slate-500">Fit is explainable and uses verified profile data; missing requirements remain gaps.</p></div>
            {workspace.jobs.length ? <div className="mt-5 grid gap-4 lg:grid-cols-2">{workspace.jobs.slice(0, 12).map((job) => <article key={job.id} className="rounded-2xl border border-white/[.07] bg-black/10 p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-white">{job.role}</p><p className="mt-1 text-sm text-slate-400">{job.company}{job.location ? ` · ${job.location}` : ""}</p></div><div className="text-right"><p className="text-xl font-semibold text-cyan-200">{job.fit_score ?? "—"}%</p><p className="text-[11px] uppercase tracking-[.12em] text-slate-500">Fit</p></div></div><div className="mt-3 flex flex-wrap gap-2">{job.strengths.slice(0, 3).map((item) => <span key={item} className="rounded-full bg-emerald-400/[.08] px-2.5 py-1 text-xs text-emerald-200">{item}</span>)}</div>{job.gaps.length ? <p className="mt-3 text-xs leading-5 text-amber-200">Gap: {job.gaps.slice(0, 2).join(" · ")}</p> : null}<div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs capitalize text-slate-500">{job.status.replaceAll("_", " ")} · {job.source}</span><a href={job.job_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-violet-300">View vacancy →</a></div></article>)}</div> : <div className="mt-5 rounded-xl border border-dashed border-white/10 p-6 text-sm leading-6 text-slate-400">No discovered jobs yet. Configure at least one supported search country and target role, then use <strong className="text-slate-200">Search jobs now</strong>. V1 uses Adzuna through its official API; additional providers can be added behind the same provider boundary.</div>}
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
            <div className="glass rounded-2xl border border-white/[.07] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Application tracker</p><h2 className="mt-1 font-display text-xl font-semibold text-white">Recent applications</h2></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">{agent.status}</span></div>
              {workspace.applications.length ? <div className="mt-5 space-y-3">{workspace.applications.slice(0, 8).map((application) => {
                const job = application.job_opportunities;
                return <article key={application.id} className="rounded-xl border border-white/[.07] bg-black/10 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold text-white">{job?.role ?? "Application"}</p><p className="mt-1 text-sm text-slate-400">{job?.company ?? "Company"}{job?.location ? ` · ${job.location}` : ""}</p></div><span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-200">{application.status.replaceAll("_", " ")}</span></div>{application.next_action ? <p className="mt-3 text-sm text-amber-200">Action: {application.next_action}</p> : null}{application.continuation_url ? <a href={application.continuation_url} className="mt-3 inline-block text-sm font-semibold text-cyan-300" rel="noreferrer">Continue application →</a> : null}</article>;
              })}</div> : <div className="mt-5 rounded-xl border border-dashed border-white/10 p-6 text-sm leading-6 text-slate-400">No applications yet. The tracker will only mark <strong className="text-slate-200">Applied</strong> after a real submission or email send is confirmed.</div>}
            </div>

            <div className="glass rounded-2xl border border-white/[.07] p-5 sm:p-6">
              <p className="eyebrow">What needs you</p><h2 className="mt-1 font-display text-xl font-semibold text-white">Required actions</h2>
              <div className="mt-5 space-y-3">{workspace.applications.filter((item) => item.next_action || item.status === "ready_for_submit").slice(0, 6).map((item) => <div key={item.id} className="rounded-xl border border-amber-300/15 bg-amber-400/[.04] p-4"><p className="text-sm font-semibold text-amber-100">{item.status === "ready_for_submit" ? "Ready for Submit" : "Decision required"}</p><p className="mt-1 text-sm leading-6 text-slate-400">{item.next_action ?? "Open the saved ATS application and press Submit after review."}</p></div>)}{!workspace.applications.some((item) => item.next_action || item.status === "ready_for_submit") ? <p className="rounded-xl border border-white/[.07] p-4 text-sm leading-6 text-slate-400">Nothing requires your attention right now.</p> : null}</div>
            </div>
          </section>
        </>
      ) : (
        <section className="mt-8 rounded-2xl border border-violet-300/15 bg-violet-400/[.04] p-5 sm:p-6"><p className="eyebrow">First activation</p><h2 className="mt-2 font-display text-2xl font-semibold text-white">Confirm only what the roadmap does not already know</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Your target career, languages and latest CV are prefilled where available. Sensitive employment and salary information stays optional.</p></section>
      )}

      <form action={saveJobAgent} className="mt-8 space-y-6">
        <section className="glass rounded-2xl border border-white/[.07] p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-white">1. Target roles</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2"><label className="text-sm text-slate-400">Primary career<input name="primary_career" defaultValue={primaryCareer} className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">Secondary careers<input name="secondary_careers" defaultValue={csv(agent?.secondary_careers)} placeholder="AI Solutions Consultant, Data Analyst" className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">Desired job titles<input name="desired_titles" defaultValue={csv(agent?.desired_titles)} className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">Adjacent roles<input name="adjacent_roles" defaultValue={csv(agent?.adjacent_roles)} className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400 md:col-span-2">Roles to exclude<input name="excluded_roles" defaultValue={csv(agent?.excluded_roles)} className="input-field mt-2 min-h-11 w-full" /></label></div>
        </section>

        <section className="glass rounded-2xl border border-white/[.07] p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-white">2. Geography & work style</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2"><label className="text-sm text-slate-400">Search countries<input name="search_countries" defaultValue={csv(agent?.search_countries) || (workspace.preferences?.job_search_country ?? "")} placeholder="Germany, France, Netherlands" className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">Cities / regions<input name="cities_regions" defaultValue={csv(agent?.cities_regions)} className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">Excluded countries<input name="excluded_countries" defaultValue={csv(agent?.excluded_countries)} className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">Maximum commute (minutes)<input type="number" min="0" max="360" name="max_commute_minutes" defaultValue={agent?.max_commute_minutes ?? ""} className="input-field mt-2 min-h-11 w-full" /></label></div>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-300">{["remote", "hybrid", "on_site"].map((value) => <label key={value} className="flex items-center gap-2"><input type="checkbox" name="workplace_preferences" value={value} defaultChecked={agent?.workplace_preferences.includes(value)} />{value.replace("_", " ")}</label>)}</div>
          <div className="mt-5 grid gap-5 md:grid-cols-2"><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" name="willing_to_relocate" defaultChecked={agent?.willing_to_relocate ?? false} />Willing to relocate</label><label className="text-sm text-slate-400">Preferred relocation countries<input name="relocation_countries" defaultValue={csv(agent?.relocation_countries)} className="input-field mt-2 min-h-11 w-full" /></label></div>
        </section>

        <section className="glass rounded-2xl border border-white/[.07] p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-white">3. Constraints & preferences</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2"><label className="text-sm text-slate-400">Languages<input name="profile_languages" defaultValue={knownLanguages} className="input-field mt-2 min-h-11 w-full" /></label><div className="space-y-3 pt-1 text-sm text-slate-300"><label className="flex items-center gap-2"><input type="checkbox" name="english_only_priority" defaultChecked={agent?.english_only_priority} />Prioritize English-only roles</label><label className="flex items-center gap-2"><input type="checkbox" name="exclude_unknown_languages" defaultChecked={agent ? agent.exclude_unknown_languages : true} />Penalize jobs requiring unknown languages</label></div><label className="text-sm text-slate-400">Work authorization<input name="work_authorization" defaultValue={agent?.work_authorization ?? ""} placeholder="Optional — or Ask me when needed" className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">Sponsorship requirement<input name="sponsorship_requirement" defaultValue={agent?.sponsorship_requirement ?? ""} placeholder="Optional — or Ask me when needed" className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">Notice period<input name="notice_period" defaultValue={agent?.notice_period ?? ""} className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">Earliest start date<input type="date" name="earliest_start_date" defaultValue={agent?.earliest_start_date ?? ""} className="input-field mt-2 min-h-11 w-full" /></label></div>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-300">{[["full_time","Full-time"],["part_time","Part-time"],["contract","Contract"],["freelance","Freelance"],["internship","Internship"],["permanent","Permanent"]].map(([value,label]) => <label key={value} className="flex items-center gap-2"><input type="checkbox" name="employment_types" value={value} defaultChecked={agent?.employment_types.includes(value)} />{label}</label>)}</div>
          <div className="mt-5 grid gap-5 md:grid-cols-2"><label className="text-sm text-slate-400">Industries<input name="industries" defaultValue={csv(agent?.industries)} className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">Excluded companies<input name="excluded_companies" defaultValue={csv(agent?.excluded_companies)} className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">Minimum salary<input type="number" min="0" name="minimum_salary" defaultValue={agent?.minimum_salary ?? ""} className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">Preferred salary<input type="number" min="0" name="preferred_salary" defaultValue={agent?.preferred_salary ?? ""} className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">Currency<input name="salary_currency" defaultValue={agent?.salary_currency ?? "EUR"} className="input-field mt-2 min-h-11 w-full" /></label></div>
        </section>

        <section className="glass rounded-2xl border border-white/[.07] p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-white">4. Agent authority</h2><p className="mt-2 text-sm text-slate-400">Assisted Apply is recommended. Maximum Automation is deliberately not exposed until compliant submission integrations exist.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">{modes.map(([value,title,description]) => <label key={value} className="rounded-xl border border-white/[.08] p-4"><span className="flex items-start gap-3"><input type="radio" name="automation_mode" value={value} defaultChecked={(agent?.automation_mode ?? "assisted_apply") === value} /><span><span className="block font-semibold text-white">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-400">{description}</span></span></span></label>)}</div>
          <div className="mt-5 grid gap-5 md:grid-cols-3"><label className="text-sm text-slate-400">Auto-prepare at ≥<input type="number" min="0" max="100" name="auto_prepare_threshold" defaultValue={agent?.auto_prepare_threshold ?? 75} className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">Strong match at ≥<input type="number" min="0" max="100" name="strong_match_threshold" defaultValue={agent?.strong_match_threshold ?? 85} className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">Skip below<input type="number" min="0" max="100" name="auto_skip_threshold" defaultValue={agent?.auto_skip_threshold ?? 60} className="input-field mt-2 min-h-11 w-full" /></label></div>
          <div className="mt-5 space-y-3 text-sm text-slate-300"><label className="flex items-center gap-2"><input type="checkbox" name="automatically_send_email_applications" defaultChecked={agent?.automatically_send_email_applications} />Allow permitted email applications after authorization</label><label className="flex items-center gap-2"><input type="checkbox" name="never_submit_ats_automatically" defaultChecked={agent ? agent.never_submit_ats_automatically : true} />Never submit ATS automatically</label><label className="flex items-center gap-2"><input type="checkbox" name="ask_before_startups" defaultChecked={agent ? agent.ask_before_startups : true} />Ask before applying to startups</label></div>
        </section>

        <section className="glass rounded-2xl border border-white/[.07] p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-white">5. LinkedIn & reporting</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2"><label className="text-sm text-slate-400">LinkedIn profile URL<input type="url" name="linkedin_url" defaultValue={agent?.linkedin_url ?? ""} className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">New LinkedIn information<select name="linkedin_sync_mode" defaultValue={agent?.linkedin_sync_mode ?? "review_first"} className="input-field mt-2 min-h-11 w-full"><option value="review_first">Review first</option><option value="use_automatically">Use automatically after verified import</option><option value="ignore">Ignore</option></select></label><label className="text-sm text-slate-400">Report frequency<select name="report_frequency" defaultValue={agent?.report_frequency ?? "daily"} className="input-field mt-2 min-h-11 w-full"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="none">No scheduled report</option></select></label><label className="text-sm text-slate-400">Report time<input type="time" name="report_time" defaultValue={agent?.report_time?.slice(0,5) ?? "20:00"} className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">Timezone<input name="timezone" defaultValue={agent?.timezone ?? "Europe/Budapest"} className="input-field mt-2 min-h-11 w-full" /></label><label className="text-sm text-slate-400">Immediate high-fit alert at ≥<input type="number" min="0" max="100" name="immediate_high_fit_threshold" defaultValue={agent?.immediate_high_fit_threshold ?? 90} className="input-field mt-2 min-h-11 w-full" /></label></div>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-300">{[["in_app","In-app"],["email","Email"],["push","Push"]].map(([value,label]) => <label key={value} className="flex items-center gap-2"><input type="checkbox" name="notification_channels" value={value} defaultChecked={agent ? agent.notification_channels.includes(value) : value !== "push"} />{label}</label>)}</div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><button className="btn-primary min-h-12 px-6">{agent ? "Save Agent Settings" : "Activate Job Agent"}</button><p className="text-xs leading-5 text-slate-500">Saving activates the Agent configuration. Job submissions remain constrained by the selected authority mode and available integrations.</p></div>
      </form>
    </main>
  );
}
