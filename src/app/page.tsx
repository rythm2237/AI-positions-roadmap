import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/landing/Header";
import SafeCareerUniverse from "@/components/landing/SafeCareerUniverse";
import { AVAILABLE_CAREERS, CAREER_DOMAINS } from "@/data/careerCatalog";

export const metadata: Metadata = {
  title: "AI Career OS — Choose, Learn, Build, Prove",
  description:
    "Explore active AI, automation, data, cloud, security, consulting, and marketing career journeys. Follow a structured roadmap from career choice to portfolio proof and job readiness.",
};

const PROCESS = [
  {
    label: "Choose",
    description: "Compare focused career directions and select the path that fits your strengths, goals, and background.",
  },
  {
    label: "Learn",
    description: "Follow a sequenced roadmap with milestones, learning resources, and clear outcomes instead of disconnected courses.",
  },
  {
    label: "Build",
    description: "Turn learning into practical projects and portfolio evidence that demonstrate applied capability.",
  },
  {
    label: "Prove",
    description: "Track readiness, close skill gaps, and prepare credible evidence for interviews and real job applications.",
  },
] as const;

const DOMAIN_COPY: Record<(typeof CAREER_DOMAINS)[number], string> = {
  "AI Engineering": "Build production AI systems and model-powered applications.",
  "AI Product": "Lead AI products from discovery through measurable adoption.",
  "AI Automation": "Connect AI, workflows, APIs, tools, and operations.",
  "Enterprise AI & Consulting": "Translate business needs into governed AI transformation.",
  "AI Data & Analytics": "Turn data into reliable analysis, decisions, and AI-ready foundations.",
  "AI Infrastructure & Security": "Operate the cloud, delivery, and security layers behind modern AI systems.",
  "AI Marketing": "Apply AI to trusted visibility, content systems, campaigns, and growth.",
};

export default function LandingPage() {
  const groupedCareers = CAREER_DOMAINS.map((domain) => ({
    domain,
    careers: AVAILABLE_CAREERS.filter((career) => career.domain === domain),
  })).filter((group) => group.careers.length > 0);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#03050e] text-white">
      <Header />

      <main>
        <section className="relative isolate overflow-hidden px-5 pb-20 pt-32 sm:px-8 sm:pb-28 sm:pt-40">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_18%,rgba(124,58,237,.22),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(34,211,238,.12),transparent_28%),linear-gradient(180deg,#050817_0%,#03050e_72%)]" />
          <div className="absolute inset-0 -z-10 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:56px_56px]" aria-hidden="true" />

          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-500/[0.08] px-3 py-1.5 text-xs font-semibold uppercase tracking-[.18em] text-violet-200">
                Public Beta · Career Operating System
              </div>
              <h1 className="mt-7 font-display text-5xl font-bold tracking-[-.045em] text-white sm:text-6xl lg:text-7xl">
                Turn career uncertainty into a practical operating plan.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                AI Career OS connects career discovery, structured roadmaps, learning, projects, portfolio evidence, and job readiness in one coherent journey.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="#career-directory" className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
                  Explore active careers
                </Link>
                <Link href="#career-universe-section" className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/[0.035] px-5 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-violet-300/30 hover:bg-violet-500/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
                  Open Career Universe
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400">
                <span><strong className="text-white">{AVAILABLE_CAREERS.length}</strong> active career journeys</span>
                <span><strong className="text-white">{groupedCareers.length}</strong> career domains</span>
                <span>No unsupported market-size claims</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-8 -z-10 rounded-full bg-violet-600/10 blur-3xl" aria-hidden="true" />
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-[0_30px_100px_rgba(0,0,0,.38)] backdrop-blur-xl sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-300">One connected system</p>
                <div className="mt-5 grid gap-3">
                  {["Career direction", "Roadmap & milestones", "Learning resources", "Projects & portfolio", "Readiness & job preparation"].map((item, index) => (
                    <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#090c1d]/75 p-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-violet-300/15 bg-violet-500/10 text-xs font-bold text-violet-200">0{index + 1}</span>
                      <span className="font-medium text-slate-100">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-400">The objective is not to consume more content. It is to know what to do next, why it matters, and what evidence proves the skill.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-white/[0.06] bg-white/[0.015] px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-300">How it works</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">A career journey with explicit next actions.</h2>
              <p className="mt-4 text-base leading-7 text-slate-400">Career OS is structured around progression, not content volume. Each stage should move you toward demonstrable capability.</p>
            </div>

            <ol className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {PROCESS.map((step, index) => (
                <li key={step.label} className="rounded-2xl border border-white/[0.08] bg-[#080b19] p-6">
                  <span className="text-xs font-bold tracking-[.16em] text-violet-300">0{index + 1}</span>
                  <h3 className="mt-4 font-display text-xl font-semibold text-white">{step.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="career-directory" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-300">Active career directory</p>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Explore careers by domain.</h2>
                <p className="mt-4 text-base leading-7 text-slate-400">Only active, complete career journeys are linked here. Planned careers remain outside public navigation until their content is ready.</p>
              </div>
              <p className="text-sm text-slate-500">{AVAILABLE_CAREERS.length} active journeys · {groupedCareers.length} domains</p>
            </div>

            <div className="mt-12 space-y-10">
              {groupedCareers.map(({ domain, careers }) => (
                <section key={domain} aria-labelledby={`domain-${domain.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}>
                  <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 id={`domain-${domain.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`} className="font-display text-xl font-semibold text-white">{domain}</h3>
                      <p className="mt-1 text-sm text-slate-500">{DOMAIN_COPY[domain]}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[.16em] text-slate-600">{careers.length} active</span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {careers.map((career) => (
                      <Link key={career.slug} href={career.route ?? `/careers/${career.slug}`} className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:-translate-y-0.5 hover:border-violet-300/25 hover:bg-violet-500/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-display text-lg font-semibold text-slate-100 transition group-hover:text-white">{career.title}</h4>
                          <span className="mt-0.5 text-violet-300 transition group-hover:translate-x-1" aria-hidden="true">→</span>
                        </div>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500 transition group-hover:text-slate-400">{career.description}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section id="career-universe-section" className="scroll-mt-20 border-y border-white/[0.06] bg-white/[0.012] px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-300">Career Universe</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">See how the career landscape connects.</h2>
              <p className="mt-4 text-base leading-7 text-slate-400">The interactive map is progressive enhancement. If WebGL is unavailable or unstable, the public site remains usable and the active career directory above stays fully accessible.</p>
            </div>
            <SafeCareerUniverse />
          </div>
        </section>

        <section id="waitlist" className="px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-violet-300/15 bg-[radial-gradient(circle_at_10%_10%,rgba(124,58,237,.2),transparent_38%),linear-gradient(135deg,#0b0e21,#060815)] p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,.35)] sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-300">Public Beta</p>
            <h2 className="mx-auto mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">Start with an active career journey and help shape what comes next.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">Create an account to keep your progress and continue across Career OS. Pricing is intentionally not published until the commercial model is finalized.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/login?mode=signup" className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">Join the public beta</Link>
              <Link href="#career-directory" className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/[0.035] px-5 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">Review careers first</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>AI Career OS · Public Beta</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer navigation">
            <Link href="#career-directory" className="transition hover:text-slate-300">Careers</Link>
            <Link href="#how-it-works" className="transition hover:text-slate-300">How it works</Link>
            <Link href="/methodology" className="transition hover:text-slate-300">Methodology</Link>
            <Link href="/login" className="transition hover:text-slate-300">Sign in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
