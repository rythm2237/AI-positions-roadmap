import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/landing/Header";

export const metadata: Metadata = {
  title: "Ready to Job | AI Role Path",
  description: "Prepare an evidence-backed CV, find suitable roles, build applications, and get ready for interviews.",
};

const steps = [
  {
    title: "Check your job readiness",
    description: "Identify role fit, skill gaps, and the evidence you can already demonstrate to recruiters.",
    href: "/job-search-mode",
    action: "Open job-ready workspace",
  },
  {
    title: "Analyze your CV",
    description: "Review your existing CV against the work you want to do, then improve clarity and relevance.",
    href: "/cv-analyzer",
    action: "Analyze my CV",
  },
  {
    title: "Find matching opportunities",
    description: "Explore career paths and follow role-specific job opportunities instead of applying blindly.",
    href: "/careers",
    action: "Explore careers",
  },
  {
    title: "Prepare an application",
    description: "Build or tailor your CV and supporting application documents around a real vacancy.",
    href: "/application-studio?mode=targeted",
    action: "Open application studio",
  },
];

export default function ReadyToJobLanding() {
  return (
    <div className="min-h-screen bg-[#03050e] text-white">
      <Header />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-32 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-300">Job-ready fast track</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-6xl">
          Ready to Job
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
          Already have experience and want to apply? Move from career fit to a strong CV, relevant opportunities, tailored applications, and interview preparation without starting a full learning roadmap.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/job-search-mode" className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">Start job-ready fast track</Link>
          <Link href="/application-studio?mode=general" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Create a general CV</Link>
        </div>
        <section aria-labelledby="job-ready-steps" className="mt-16">
          <h2 id="job-ready-steps" className="font-display text-2xl font-semibold">Your application journey</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {steps.map((step, index) => (
              <article key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                <span className="text-sm font-semibold text-cyan-300">0{index + 1}</span>
                <h3 className="mt-3 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 min-h-[4.5rem] text-sm leading-7 text-slate-400">{step.description}</p>
                <Link href={step.href} className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-cyan-200 underline-offset-4 hover:underline">{step.action} →</Link>
              </article>
            ))}
          </div>
        </section>
        <section className="mt-12 rounded-2xl border border-violet-400/20 bg-violet-500/[0.07] p-6">
          <h2 className="font-display text-xl font-semibold">Interview preparation and readiness</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">Use the job-ready workspace to review readiness, strengthen evidence for the target role, and continue into interview preparation. Your progress and available features depend on your account.</p>
          <Link href="/job-search-mode" className="mt-4 inline-flex min-h-11 items-center font-semibold text-violet-200 underline-offset-4 hover:underline">Continue to my workspace →</Link>
        </section>
      </main>
    </div>
  );
}
