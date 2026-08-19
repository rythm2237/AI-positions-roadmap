import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { careerReadiness, getIdentityWorkspace, profileCompletion } from "@/lib/identity/repository";
import { createClient } from "@/lib/supabase/server";
import { ProgressMeter } from "@/components/identity/ProgressMeter";
import { ResumeUploader } from "@/components/identity/ResumeUploader";

function Card({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return <section id={id} className="glass rounded-2xl border border-white/[.07] p-6"><h2 className="text-sm font-semibold text-white">{title}</h2><div className="mt-5">{children}</div></section>;
}

function ToolCard({ eyebrow, title, description, status, href, cta }: { eyebrow: string; title: string; description: string; status: string; href: string; cta: string }) {
  return <Link href={href} className="group rounded-2xl border border-violet-300/15 bg-[linear-gradient(145deg,rgba(124,58,237,.13),rgba(15,23,42,.48))] p-6 transition hover:border-violet-300/35 hover:bg-violet-500/[.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
    <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-violet-300">{eyebrow}</p><h2 className="mt-2 font-display text-xl font-semibold text-white">{title}</h2></div><span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1 text-[11px] font-semibold text-slate-300">{status}</span></div>
    <p className="mt-4 text-sm leading-6 text-slate-400">{description}</p>
    <span className="mt-5 inline-flex items-center text-sm font-semibold text-violet-200 transition group-hover:text-white">{cta} →</span>
  </Link>;
}

export default async function DashboardPage() {
  const user = await requireUser();
  const [data, supabase] = await Promise.all([getIdentityWorkspace(user), createClient()]);
  const { data: jobAgent } = await supabase.from("job_agents").select("status").eq("user_id", user.id).maybeSingle<{ status: string }>();
  const completion = profileCompletion(data.profile);
  const readiness = careerReadiness(data.profile, data.resumes.length > 0, Boolean(data.preferences?.job_search_region));
  const cvStatus = data.resumes.length ? "CV available" : "Ready to start";
  const agentStatus = jobAgent?.status === "active" ? "Agent active" : jobAgent ? "Configured" : "Ready to activate";

  return <main className="mx-auto max-w-6xl px-5 py-12">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Career command center</p><h1 className="mt-2 font-display text-3xl font-semibold text-white">Welcome{data.profile.name ? `, ${data.profile.name.split(" ")[0]}` : " to your Career OS"}</h1><p className="mt-2 text-sm text-slate-400">A focused view of your identity, readiness, and next actions.</p></div><Link href="/profile" className="btn-secondary min-h-11 text-sm">Edit profile</Link></div>

    <section className="mt-8" aria-labelledby="career-tools-heading"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-slate-500">Career execution tools</p><h2 id="career-tools-heading" className="mt-1 font-display text-2xl font-semibold text-white">Move from readiness to applications</h2></div></div>
      <div className="grid gap-5 md:grid-cols-2">
        <ToolCard eyebrow="CV intelligence" title="CV Analyzer" description="Analyze ATS readability, evidence strength, role alignment and skill gaps. Upload an existing CV or build one step by step." status={cvStatus} href="/cv-analyzer" cta={data.resumes.length ? "Analyze my CV" : "Open CV Analyzer"} />
        <ToolCard eyebrow="Job execution" title="Job Application Agent" description="Find matching vacancies, review fit, then choose Apply, Reject or Snooze. The Agent only proceeds after your approval." status={agentStatus} href="/job-agent" cta={jobAgent ? "Open Job Agent" : "Activate Job Agent"} />
      </div>
    </section>

    <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3"><Card title="Profile completion"><ProgressMeter value={completion} label={completion === 100 ? "Profile complete" : "Strengthen your career identity"} /></Card><Card title="Career readiness"><ProgressMeter value={readiness} label={readiness >= 80 ? "Ready for focused action" : "Build the foundations"} /></Card><Card title="Subscription"><p className="text-2xl font-semibold capitalize text-white">{data.subscription?.plan ?? "free"}</p><p className="mt-2 text-sm text-slate-500">Your current Career OS plan</p></Card>
      <Card title="Saved careers"><p className="text-3xl font-semibold text-white">{data.savedCareers.length}</p><p className="mt-2 text-sm leading-6 text-slate-500">{data.savedCareers.length ? data.savedCareers.slice(0, 3).map((career) => career.career_slug.replaceAll("-", " ")).join(" · ") : "Bookmark promising directions from any career workspace."}</p><Link href="/#career-universe" className="mt-4 inline-block text-sm text-indigo-300">Explore careers →</Link></Card>
      <Card title="Resumes" id="resumes"><div className="flex items-start justify-between gap-4"><div><p className="text-3xl font-semibold text-white">{data.resumes.length}</p><p className="mt-2 text-sm text-slate-500">{data.resumes[0] ? `Latest: ${data.resumes[0].title}` : "Your private resume library is ready."}</p></div><ResumeUploader userId={user.id} /></div>{data.resumes.length > 1 ? <ul className="mt-4 space-y-2 border-t border-white/[.06] pt-4">{data.resumes.slice(0, 3).map((resume) => <li key={resume.id} className="flex justify-between text-xs"><span className="text-slate-300">{resume.title}</span><span className="uppercase text-slate-600">{resume.file_type} · v{resume.version}</span></li>)}</ul> : null}</Card>
      <Card title="Recent activity">{data.activity.length ? <ul className="space-y-3">{data.activity.slice(0, 5).map((activity) => <li key={activity.id} className="flex justify-between gap-4 text-sm"><span className="capitalize text-slate-300">{activity.action.replaceAll("_", " ")}</span><time className="text-xs text-slate-600">{new Date(activity.created_at).toLocaleDateString()}</time></li>)}</ul> : <p className="text-sm leading-6 text-slate-500">Your milestones will appear here as you build momentum.</p>}</Card></div>
  </main>;
}
