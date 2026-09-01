import { TimezoneField } from "./TimezoneField";
import { inferSearchCurrency } from "@/lib/job-agent/currency";
import type { JobAgent } from "@/types/jobAgent";

const modes = [
  ["discovery_only", "Discovery only", "Find and score roles. No application preparation or sending."],
  ["prepare_applications", "Prepare applications", "Create tailored application packs while you submit manually."],
  ["assisted_apply", "Assisted apply", "Prepare everything, use permitted email automation, and stop before consequential final submits."],
] as const;

const csv = (values?: string[] | null) => values?.join(", ") ?? "";

export function JobAgentSettingsForm({
  agent,
  primaryCareer,
  knownLanguages,
  preferenceCountry,
  action,
}: {
  agent?: JobAgent | null;
  primaryCareer: string;
  knownLanguages: string;
  preferenceCountry?: string | null;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const savedCountries = agent?.search_countries?.length
    ? agent.search_countries
    : preferenceCountry
      ? [preferenceCountry]
      : [];
  const inferredCurrency = inferSearchCurrency(savedCountries);

  return (
    <form id="job-agent-settings" action={action} className="mt-8 space-y-6">
      <section className="glass rounded-2xl border border-white/[.07] p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold text-white">1. Target roles</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="text-sm text-slate-400">Primary career<input name="primary_career" defaultValue={primaryCareer} className="input-field mt-2 min-h-11 w-full" /></label>
          <label className="text-sm text-slate-400">Secondary careers<input name="secondary_careers" defaultValue={csv(agent?.secondary_careers)} placeholder="AI Solutions Consultant, Data Analyst" className="input-field mt-2 min-h-11 w-full" /></label>
          <label className="text-sm text-slate-400">Desired job titles<input name="desired_titles" defaultValue={csv(agent?.desired_titles)} className="input-field mt-2 min-h-11 w-full" /></label>
          <label className="text-sm text-slate-400">Adjacent roles<input name="adjacent_roles" defaultValue={csv(agent?.adjacent_roles)} className="input-field mt-2 min-h-11 w-full" /></label>
          <label className="text-sm text-slate-400 md:col-span-2">Roles to exclude<input name="excluded_roles" defaultValue={csv(agent?.excluded_roles)} className="input-field mt-2 min-h-11 w-full" /></label>
        </div>
      </section>

      <section className="glass rounded-2xl border border-white/[.07] p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold text-white">2. Geography & work style</h2>
        <p className="mt-2 text-xs leading-5 text-cyan-200/80">Use “Save & Search” after editing. The current form values are saved first, then the search runs with exactly those values. If the country changes and an old city is left untouched, the stale city filter is cleared automatically.</p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="text-sm text-slate-400">Search countries<input name="search_countries" defaultValue={csv(agent?.search_countries) || (preferenceCountry ?? "")} placeholder="Germany, France, Netherlands" className="input-field mt-2 min-h-11 w-full" /></label>
          <label className="text-sm text-slate-400">Cities / regions<input name="cities_regions" defaultValue={csv(agent?.cities_regions)} className="input-field mt-2 min-h-11 w-full" /></label>
          <label className="text-sm text-slate-400">Excluded countries<input name="excluded_countries" defaultValue={csv(agent?.excluded_countries)} className="input-field mt-2 min-h-11 w-full" /></label>
          <label className="text-sm text-slate-400">Maximum commute (minutes)<input type="number" min="0" max="360" name="max_commute_minutes" defaultValue={agent?.max_commute_minutes ?? ""} className="input-field mt-2 min-h-11 w-full" /></label>
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-300">
          {["remote", "hybrid", "on_site"].map((value) => <label key={value} className="flex items-center gap-2"><input type="checkbox" name="workplace_preferences" value={value} defaultChecked={agent?.workplace_preferences.includes(value)} />{value.replace("_", " ")}</label>)}
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" name="willing_to_relocate" defaultChecked={agent?.willing_to_relocate ?? false} />Willing to relocate</label>
          <label className="text-sm text-slate-400">Preferred relocation countries<input name="relocation_countries" defaultValue={csv(agent?.relocation_countries)} className="input-field mt-2 min-h-11 w-full" /></label>
        </div>
      </section>

      <section className="glass rounded-2xl border border-white/[.07] p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold text-white">3. Constraints & preferences</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="text-sm text-slate-400">Languages<input name="profile_languages" defaultValue={knownLanguages} className="input-field mt-2 min-h-11 w-full" /></label>
          <div className="space-y-3 pt-1 text-sm text-slate-300">
            <label className="flex items-center gap-2"><input type="checkbox" name="english_only_priority" defaultChecked={agent?.english_only_priority} />Prioritize English-only roles</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="exclude_unknown_languages" defaultChecked={agent ? agent.exclude_unknown_languages : true} />Penalize jobs requiring unknown languages</label>
          </div>
          <label className="text-sm text-slate-400">Work authorization<input name="work_authorization" defaultValue={agent?.work_authorization ?? ""} placeholder="Optional — or Ask me when needed" className="input-field mt-2 min-h-11 w-full" /></label>
          <label className="text-sm text-slate-400">Sponsorship requirement<input name="sponsorship_requirement" defaultValue={agent?.sponsorship_requirement ?? ""} placeholder="Optional — or Ask me when needed" className="input-field mt-2 min-h-11 w-full" /></label>
          <label className="text-sm text-slate-400">Notice period<input name="notice_period" defaultValue={agent?.notice_period ?? ""} className="input-field mt-2 min-h-11 w-full" /></label>
          <label className="text-sm text-slate-400">Earliest start date<input type="date" name="earliest_start_date" defaultValue={agent?.earliest_start_date ?? ""} className="input-field mt-2 min-h-11 w-full" /></label>
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-300">
          {[["full_time","Full-time"],["part_time","Part-time"],["contract","Contract"],["freelance","Freelance"],["internship","Internship"],["permanent","Permanent"]].map(([value,label]) => <label key={value} className="flex items-center gap-2"><input type="checkbox" name="employment_types" value={value} defaultChecked={agent?.employment_types.includes(value)} />{label}</label>)}
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="text-sm text-slate-400">Industries<input name="industries" defaultValue={csv(agent?.industries)} className="input-field mt-2 min-h-11 w-full" /></label>
          <label className="text-sm text-slate-400">Excluded companies<input name="excluded_companies" defaultValue={csv(agent?.excluded_companies)} className="input-field mt-2 min-h-11 w-full" /></label>
          <label className="text-sm text-slate-400">Minimum salary<input type="number" min="0" name="minimum_salary" defaultValue={agent?.minimum_salary ?? ""} className="input-field mt-2 min-h-11 w-full" /></label>
          <label className="text-sm text-slate-400">Preferred salary<input type="number" min="0" name="preferred_salary" defaultValue={agent?.preferred_salary ?? ""} className="input-field mt-2 min-h-11 w-full" /></label>
          <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[.04] p-4 text-sm text-slate-300 md:col-span-2">
            <p className="font-semibold text-cyan-100">Salary currency: {inferredCurrency ?? "automatic per vacancy"}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">Currency is no longer entered manually. It is inferred from the saved search countries. Hungary uses HUF; Germany, France and other euro-area countries use EUR. If selected countries use different currencies, salary thresholds are not compared numerically until the vacancy currency can be verified.</p>
          </div>
        </div>
      </section>

      <section className="glass rounded-2xl border border-white/[.07] p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold text-white">4. Agent authority</h2>
        <p className="mt-2 text-sm text-slate-400">Assisted Apply is recommended. Maximum Automation is deliberately unavailable until compliant submission integrations exist.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {modes.map(([value,title,description]) => <label key={value} className="rounded-xl border border-white/[.08] p-4"><span className="flex items-start gap-3"><input type="radio" name="automation_mode" value={value} defaultChecked={(agent?.automation_mode ?? "assisted_apply") === value} /><span><span className="block font-semibold text-white">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-400">{description}</span></span></span></label>)}
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <label className="text-sm text-slate-400">Auto-prepare at ≥<input type="number" min="0" max="100" name="auto_prepare_threshold" defaultValue={agent?.auto_prepare_threshold ?? 75} className="input-field mt-2 min-h-11 w-full" /></label>
          <label className="text-sm text-slate-400">Strong match at ≥<input type="number" min="0" max="100" name="strong_match_threshold" defaultValue={agent?.strong_match_threshold ?? 85} className="input-field mt-2 min-h-11 w-full" /></label>
          <label className="text-sm text-slate-400">Skip below<input type="number" min="0" max="100" name="auto_skip_threshold" defaultValue={agent?.auto_skip_threshold ?? 60} className="input-field mt-2 min-h-11 w-full" /></label>
        </div>
        <div className="mt-5 space-y-3 text-sm text-slate-300">
          <label className="flex items-center gap-2"><input type="checkbox" name="automatically_send_email_applications" defaultChecked={agent?.automatically_send_email_applications} />Allow permitted email applications after authorization</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="never_submit_ats_automatically" defaultChecked={agent ? agent.never_submit_ats_automatically : true} />Never submit ATS automatically</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="ask_before_startups" defaultChecked={agent ? agent.ask_before_startups : true} />Ask before applying to startups</label>
        </div>
      </section>

      <section className="glass rounded-2xl border border-white/[.07] p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold text-white">5. LinkedIn & reporting</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="text-sm text-slate-400">LinkedIn profile URL<input type="url" name="linkedin_url" defaultValue={agent?.linkedin_url ?? ""} className="input-field mt-2 min-h-11 w-full" /></label>
          <label className="text-sm text-slate-400">New LinkedIn information<select name="linkedin_sync_mode" defaultValue={agent?.linkedin_sync_mode ?? "review_first"} className="input-field mt-2 min-h-11 w-full"><option value="review_first">Review first</option><option value="use_automatically">Use automatically after verified import</option><option value="ignore">Ignore</option></select></label>
          <label className="text-sm text-slate-400">Report frequency<select name="report_frequency" defaultValue={agent?.report_frequency ?? "daily"} className="input-field mt-2 min-h-11 w-full"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="none">No scheduled report</option></select></label>
          <label className="text-sm text-slate-400">Report time<input type="time" name="report_time" defaultValue={agent?.report_time?.slice(0,5) ?? "20:00"} className="input-field mt-2 min-h-11 w-full" /></label>
          <TimezoneField savedValue={agent?.timezone} />
          <label className="text-sm text-slate-400">Immediate high-fit alert at ≥<input type="number" min="0" max="100" name="immediate_high_fit_threshold" defaultValue={agent?.immediate_high_fit_threshold ?? 90} className="input-field mt-2 min-h-11 w-full" /></label>
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-300">
          {[["in_app","In-app"],["email","Email"],["push","Push"]].map(([value,label]) => <label key={value} className="flex items-center gap-2"><input type="checkbox" name="notification_channels" value={value} defaultChecked={agent ? agent.notification_channels.includes(value) : value !== "push"} />{label}</label>)}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" name="intent" value="save_and_search" className="btn-primary min-h-12 px-6">{agent ? "Save & Search Jobs" : "Activate & Search Jobs"}</button>
        <button type="submit" name="intent" value="save_only" className="btn-secondary min-h-12 px-6">{agent ? "Save Settings Only" : "Activate Without Search"}</button>
        <p className="text-xs leading-5 text-slate-500">“Save & Search” persists the current form first and then searches with that exact configuration. Job submissions remain constrained by the selected authority mode and available integrations.</p>
      </div>
    </form>
  );
}
