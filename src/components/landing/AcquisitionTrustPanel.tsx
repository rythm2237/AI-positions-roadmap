"use client";

import Link from "next/link";
import { useState } from "react";

const VERIFIED_CAPABILITIES = [
  "23 active AI and digital career paths",
  "Baseline skill diagnostic with adaptive roadmap placement",
  "Reviewed project evidence and recruiter-shareable proof",
  "Job-fit, interview and application execution workflows",
];

export default function AcquisitionTrustPanel() {
  const [open, setOpen] = useState(false);

  return (
    <aside className="pointer-events-none absolute left-4 top-[88px] z-20 sm:left-6 lg:left-8">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="pointer-events-auto inline-flex min-h-10 items-center gap-2 rounded-full border border-cyan-300/15 bg-[#070a17]/76 px-3.5 py-2 text-xs font-semibold text-cyan-100 shadow-xl backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-[#0a1020]/90">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-cyan-300/10 text-cyan-200">✓</span>
          Why AI Role Path
          <span className="text-slate-500">· 23 careers</span>
        </button>
      ) : (
        <div className="pointer-events-auto w-[min(92vw,470px)] rounded-2xl border border-white/10 bg-slate-950/88 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300 sm:text-xs">From discovery to evidence-backed applications</p>
              <h2 className="mt-2 max-w-lg font-display text-xl font-semibold leading-tight text-white sm:text-2xl">Pick the right AI career, prove the skills, then execute the job search.</h2>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-400 hover:text-white" aria-label="Close trust panel">×</button>
          </div>
          <p className="mt-3 max-w-lg text-xs leading-5 text-slate-400 sm:text-sm sm:leading-6">AI Role Path connects career discovery, adaptive learning, assessed evidence, portfolio proof, job targeting and interview/application workflows in one measurable path.</p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {VERIFIED_CAPABILITIES.map((item) => (
              <div key={item} className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2.5 text-xs leading-5 text-slate-300"><span className="mr-2 text-emerald-300">✓</span>{item}</div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link href="/careers" className="inline-flex min-h-10 items-center rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-100">Explore all careers</Link>
            <Link href="/careers/ai-automation-specialist" className="inline-flex min-h-10 items-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-2.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/[0.1]">Live product preview</Link>
            <Link href="/ai-transparency" className="inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]">How evidence is handled</Link>
          </div>

          <p className="mt-4 border-t border-white/10 pt-3 text-[10px] leading-5 text-slate-600">Trust policy: AI Role Path does not publish invented testimonials, hiring rates or Before → After stories. Verified outcome proof is added only from real users and auditable product data.</p>
        </div>
      )}
    </aside>
  );
}
