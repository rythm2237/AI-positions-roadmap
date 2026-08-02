import { requireUser } from "@/lib/auth/session";
import { getIdentityWorkspace } from "@/lib/identity/repository";
import { AvatarUploader } from "@/components/identity/AvatarUploader";
import { saveProfile } from "../actions";

const fields = [
  ["name", "Name"], ["current_country", "Current country"], ["current_position", "Current position"],
  ["years_experience", "Years of experience"], ["skills", "Skills (comma separated)"],
  ["certificates", "Certificates (comma separated)"], ["languages", "Languages (comma separated)"], ["target_career", "Target career"],
] as const;
export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser("/profile"); const data = await getIdentityWorkspace(user); const query = await searchParams;
  return <main className="mx-auto max-w-3xl px-5 py-12"><p className="eyebrow">Career identity</p><h1 className="mt-2 font-display text-3xl font-semibold text-white">Your profile</h1><p className="mt-2 text-sm text-slate-400">Everything is optional and can be updated whenever your goals change.</p>
    <div className="mt-8"><AvatarUploader userId={user.id} currentUrl={data.profile.avatar_url} /></div>{query.saved ? <p role="status" className="mt-5 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-200">Profile saved.</p> : null}{query.error ? <p role="alert" className="mt-5 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-200">Please review the highlighted information and try again.</p> : null}
    <form action={saveProfile} className="mt-8 space-y-8"><section className="glass grid gap-5 rounded-2xl border border-white/[.07] p-6 sm:grid-cols-2">{fields.map(([key, label]) => { const value = data.profile[key]; return <label key={key} className="text-sm text-slate-400">{label}<input name={key} type={key === "years_experience" ? "number" : "text"} min={key === "years_experience" ? 0 : undefined} max={key === "years_experience" ? 80 : undefined} step={key === "years_experience" ? .5 : undefined} defaultValue={Array.isArray(value) ? value.join(", ") : value ?? ""} className="input-field mt-2 min-h-11 w-full" /></label>; })}</section>
      <section id="job-search" className="glass rounded-2xl border border-white/[.07] p-6"><h2 className="font-semibold text-white">Job-search preferences</h2><p className="mt-1 text-sm text-slate-500">Independent from your current country and used only for matching.</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="text-sm text-slate-400">Search region<select name="job_search_region" defaultValue={data.preferences?.job_search_region ?? ""} className="input-field mt-2 min-h-11 w-full"><option value="">Not set</option><option value="country">Individual country</option><option value="european_union">European Union</option><option value="remote">Remote</option><option value="worldwide">Worldwide</option></select></label><label className="text-sm text-slate-400">Country, when applicable<input name="job_search_country" defaultValue={data.preferences?.job_search_country ?? ""} className="input-field mt-2 min-h-11 w-full" /></label></div></section>
      <button className="btn-primary min-h-12">Save profile</button></form></main>;
}
