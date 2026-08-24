import { requireUser } from "@/lib/auth/session";
import { completeOnboarding } from "../actions";

const paths = [
  {
    mode: "learn_and_build",
    eyebrow: "Build career readiness",
    title: "Learn & Build",
    body: "Use the full AI Role Path journey: diagnostic, adaptive roadmap, learning, projects, proof of skill, interview preparation and job search.",
    cta: "Build my career path",
    items: ["Baseline diagnostic", "Adaptive roadmap", "Guided projects", "Portfolio evidence", "Job search when ready"],
  },
  {
    mode: "ready_to_apply",
    eyebrow: "Already job-ready",
    title: "Ready to Apply",
    body: "Skip training and move directly into the hiring workflow. Your learning roadmap remains available whenever you need it.",
    cta: "Start my job search",
    items: ["CV Analyzer", "Job Match", "Job Application Agent", "Application Tracker", "Interview preparation"],
  },
] as const;

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser("/onboarding"); const query = await searchParams;
  return <main className="mx-auto max-w-6xl px-5 py-14 sm:py-16"><p className="eyebrow">Choose your starting point</p><h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold text-white sm:text-5xl">What do you need from AI Role Path right now?</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">There is no forced learning sequence. Choose the path that matches your current readiness. You can switch later without losing progress.</p>{query.error ? <p role="alert" className="mt-5 rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-200">We could not save that choice. Please try again.</p> : null}<div className="mt-10 grid gap-6 lg:grid-cols-2">{paths.map((path) => <form key={path.mode} action={completeOnboarding} className="glass flex h-full flex-col rounded-3xl border border-white/[.09] p-6 sm:p-8"><input type="hidden" name="journey_mode" value={path.mode} /><p className="text-xs font-bold uppercase tracking-[.18em] text-violet-300">{path.eyebrow}</p><h2 className="mt-3 font-display text-3xl font-semibold text-white">{path.title}</h2><p className="mt-4 text-sm leading-6 text-slate-400">{path.body}</p><ul className="mt-6 space-y-3 text-sm text-slate-300">{path.items.map((item) => <li key={item} className="flex gap-3"><span className="text-violet-300">✓</span><span>{item}</span></li>)}</ul><button className="btn-primary mt-8 min-h-12 w-full sm:w-auto">{path.cta}</button></form>)}</div><p className="mt-6 text-center text-xs text-slate-500">Your choice personalizes navigation only. Both paths remain available to every Public Beta user.</p></main>;
}
