import { requireUser } from "@/lib/auth/session";
import { getIdentityWorkspace } from "@/lib/identity/repository";
import { AvatarUploader } from "@/components/identity/AvatarUploader";
import { CareerProfileSimple } from "@/components/identity/CareerProfileSimple";
import { saveProfile } from "../actions";

const fields = [
  ["name", "Full name"], ["current_country", "Current country"], ["current_position", "Current position"],
  ["years_experience", "Total years of experience"], ["target_career", "Target career"],
] as const;

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser("/profile");
  const data = await getIdentityWorkspace(user);
  const query = await searchParams;
  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
    <p className="eyebrow">My career identity</p>
    <h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">My career profile</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Everything about your career in one place. Import a CV, check the details, and update anything later.</p>
    <div className="mt-6 flex flex-wrap items-center gap-5 rounded-2xl border border-white/10 p-4 sm:p-6">
      <AvatarUploader userId={user.id} currentUrl={data.profile.avatar_url} />
      <div className="min-w-0"><p className="font-semibold text-white">{data.profile.name || "Your professional profile"}</p>
        <p className="mt-1 break-all text-sm text-slate-400">{data.profile.email}</p>
        <p className="mt-2 text-xs text-slate-500">Your records are private to your account and remain editable.</p></div>
    </div>
    {query.saved && <p role="status" className="mt-5 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-200">Basic profile saved.</p>}
    {query.error && <p role="alert" className="mt-5 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-200">The profile could not be saved. Please check the information.</p>}
    <CareerProfileSimple profile={data.profile} userId={user.id} hasResume={data.resumes.length > 0} />
    <details className="glass mt-8 rounded-2xl border border-white/10 p-5 sm:p-7">
      <summary className="cursor-pointer text-xl font-semibold text-white">Account details (optional)</summary>
      <p className="mt-3 text-sm text-slate-400">Edit your public-facing basics and search region. Detailed skills, credentials and professional records belong in Career Profile Hub above.</p>
      <form action={saveProfile} className="mt-6 space-y-7">
        <div className="grid gap-4 sm:grid-cols-2">{fields.map(([key, title]) => <label key={key} className="text-sm text-slate-300">{title}
          <input name={key} type={key === "years_experience" ? "number" : "text"} min={key === "years_experience" ? 0 : undefined} max={key === "years_experience" ? 80 : undefined} step={key === "years_experience" ? .5 : undefined} defaultValue={data.profile[key] ?? ""} className="input-field mt-2 min-h-11 w-full" />
        </label>)}</div>
        <div className="rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold text-white">Previously saved quick lists</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">These legacy fields stay available for compatibility. New details should be recorded as separate items in Career Profile Hub.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(["skills", "certificates", "languages"] as const).map((key) => <label key={key} className="text-sm capitalize text-slate-300">{key} (comma separated)
              <input name={key} className="input-field mt-2 min-h-11 w-full" defaultValue={data.profile[key].join(", ")} />
            </label>)}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-slate-300">Job-search region<select name="job_search_region" defaultValue={data.preferences?.job_search_region ?? ""} className="input-field mt-2 min-h-11 w-full">
            <option value="">Not set</option><option value="country">Individual country</option><option value="european_union">European Union</option><option value="remote">Remote</option><option value="worldwide">Worldwide</option>
          </select></label>
          <label className="text-sm text-slate-300">Country, if applicable<input name="job_search_country" defaultValue={data.preferences?.job_search_country ?? ""} className="input-field mt-2 min-h-11 w-full" /></label>
        </div>
        <button className="btn-primary min-h-12">Save basic details</button>
      </form>
    </details>
  </main>;
}
