import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { completeOnboarding } from "../actions";

const steps = [
  { title: "Complete your profile", body: "Add optional career context for more useful recommendations.", href: "/profile" },
  { title: "Upload your resume", body: "Keep multiple private resume versions ready for future analysis.", href: "/dashboard#resumes" },
  { title: "Find matching jobs", body: "Set an independent job-search region for future matching.", href: "/profile#job-search" },
];
export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser("/onboarding"); const query = await searchParams;
  return <main className="mx-auto max-w-6xl px-5 py-16"><p className="eyebrow">Optional setup</p><h1 className="mt-3 font-display text-4xl font-semibold text-white">Make Career OS yours</h1><p className="mt-3 max-w-2xl text-slate-400">Choose any starting point. Nothing is mandatory, and you can change everything later.</p>{query.error ? <p role="alert" className="mt-5 text-sm text-rose-300">We could not save that choice. Please try again.</p> : null}<div className="mt-10 grid gap-5 md:grid-cols-3">{steps.map((step, index) => <article key={step.title} className="glass rounded-2xl border border-white/[.08] p-6"><span className="text-xs font-bold text-indigo-400">0{index + 1}</span><h2 className="mt-5 text-xl font-semibold text-white">{step.title}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{step.body}</p><Link href={step.href} className="btn-primary mt-6 inline-flex min-h-11 items-center text-sm">Continue</Link></article>)}</div><form action={completeOnboarding} className="mt-8 text-center"><button className="min-h-11 px-4 text-sm text-slate-400 underline-offset-4 hover:text-white hover:underline">Skip for now</button></form></main>;
}
