"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { decodeProofProfile } from "@/lib/portfolioProof";

export default function ProofProfilePage() {
  const params = useParams<{ careerSlug: string }>();
  const searchParams = useSearchParams();
  const payload = decodeProofProfile(searchParams.get("data") ?? "");

  if (!payload || payload.careerSlug !== params.careerSlug) {
    return <main className="min-h-screen bg-slate-950 px-5 py-16 text-slate-200"><div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[.03] p-8"><h1 className="text-2xl font-semibold text-white">Proof profile unavailable</h1><p className="mt-3 text-sm leading-6 text-slate-400">This link is invalid or incomplete.</p><Link href="/" className="mt-6 inline-flex text-sm font-semibold text-cyan-300">Explore AI Role Path</Link></div></main>;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-200">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-3xl border border-cyan-300/20 bg-[radial-gradient(circle_at_15%_0%,rgba(34,211,238,.12),transparent_42%),rgba(2,6,23,.86)] p-7">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">AI Role Path • Verified Proof of Skill</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-white">{payload.careerTitle}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">This profile contains only project evidence that passed the platform project-review threshold. Scores reflect submitted evidence, not identity verification or employment certification.</p>
          <div className="mt-6 flex flex-wrap gap-3"><div className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-3"><strong className="text-2xl text-white">{payload.proofScore}</strong><span className="ml-2 text-xs text-slate-500">proof score</span></div><div className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-3"><strong className="text-2xl text-white">{payload.portfolioReadyProjects}</strong><span className="ml-2 text-xs text-slate-500">verified projects</span></div><div className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-3"><strong className="text-2xl text-white">{payload.jobReadyProjects}</strong><span className="ml-2 text-xs text-slate-500">job-ready projects</span></div></div>
        </header>
        <section className="mt-6 grid gap-5">
          {payload.caseStudies.map((study) => <article key={study.projectId} className="rounded-2xl border border-white/10 bg-white/[.03] p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs uppercase tracking-[.14em] text-indigo-300">{study.level.replace("-", " ")}</p><h2 className="mt-2 text-2xl font-semibold text-white">{study.title}</h2></div><span className="w-fit rounded-full border border-cyan-300/20 bg-cyan-400/[.06] px-3 py-1 text-sm font-semibold text-cyan-100">{study.score}/100</span></div><p className="mt-4 text-sm leading-6 text-slate-300">{study.recruiterSummary}</p><div className="mt-5 grid gap-5 md:grid-cols-3"><div><h3 className="text-sm font-semibold text-white">Approach</h3><p className="mt-2 text-sm leading-6 text-slate-400">{study.approach}</p></div><div><h3 className="text-sm font-semibold text-white">Evidence</h3><p className="mt-2 text-sm leading-6 text-slate-400">{study.evidence}</p></div><div><h3 className="text-sm font-semibold text-white">Limitations</h3><p className="mt-2 text-sm leading-6 text-slate-400">{study.limitations}</p></div></div><div className="mt-5 flex flex-wrap gap-2">{study.skills.map((skill) => <span key={skill} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{skill}</span>)}</div><div className="mt-5 flex gap-4 text-sm font-semibold">{study.artifactUrl ? <a href={study.artifactUrl} target="_blank" rel="noreferrer" className="text-cyan-300">Artifact</a> : null}{study.repositoryUrl ? <a href={study.repositoryUrl} target="_blank" rel="noreferrer" className="text-cyan-300">Repository</a> : null}</div></article>)}
        </section>
        <footer className="py-8 text-center text-xs text-slate-600">Generated {new Date(payload.generatedAt).toLocaleDateString()} • Evidence supplied by the learner and reviewed against AI Role Path rubric.</footer>
      </div>
    </main>
  );
}
