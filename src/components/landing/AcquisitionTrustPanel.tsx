import Link from "next/link";

const VERIFIED_CAPABILITIES = [
  "23 active AI and digital career paths",
  "Baseline skill diagnostic with adaptive roadmap placement",
  "Reviewed project evidence and recruiter-shareable proof",
  "Job-fit, interview and application execution workflows",
];

export default function AcquisitionTrustPanel() {
  return (
    <aside className="pointer-events-none absolute left-4 top-24 z-20 w-[min(92vw,520px)] sm:left-6 sm:top-28 lg:left-8 lg:top-32">
      <div className="pointer-events-auto rounded-2xl border border-white/10 bg-slate-950/72 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300 sm:text-xs">
          From discovery to evidence-backed applications
        </p>
        <h1 className="mt-2 max-w-xl font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
          Pick the right AI career, prove the skills, then execute the job search.
        </h1>
        <p className="mt-3 max-w-xl text-xs leading-5 text-slate-400 sm:text-sm sm:leading-6">
          AI Role Path combines career discovery, adaptive learning, assessed evidence, portfolio proof, job targeting and interview/application workflows in one measurable path.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {VERIFIED_CAPABILITIES.map((item) => (
            <div key={item} className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2.5 text-xs leading-5 text-slate-300">
              <span className="mr-2 text-emerald-300">✓</span>{item}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link href="/careers" className="inline-flex min-h-10 items-center rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-100 sm:text-sm">
            Explore all careers
          </Link>
          <Link href="/careers/ai-automation-specialist" className="inline-flex min-h-10 items-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-2.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/[0.1] sm:text-sm">
            Live product preview
          </Link>
          <Link href="/ai-transparency" className="inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08] sm:text-sm">
            How evidence is handled
          </Link>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-[11px] leading-5 text-slate-500">
            Trust policy: AI Role Path does not publish invented testimonials, hiring rates or Before → After stories. Verified outcome proof will be added only when it comes from real users and auditable product data.
          </p>
        </div>
      </div>
    </aside>
  );
}
