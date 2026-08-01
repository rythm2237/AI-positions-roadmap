"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AVAILABLE_CAREERS,
  CAREER_DOMAINS,
  careersByDomain,
  type CareerDomain,
} from "@/data/careerCatalog";

const DOMAIN_ACCENTS: Record<CareerDomain, string> = {
  "AI Engineering": "from-indigo-500/25 to-cyan-500/10",
  "AI Product": "from-violet-500/25 to-fuchsia-500/10",
  "AI Automation": "from-amber-500/20 to-indigo-500/10",
  "Enterprise AI & Consulting": "from-cyan-500/20 to-violet-500/10",
  "AI Data & Analytics": "from-blue-500/25 to-cyan-500/10",
  "AI Infrastructure & Security": "from-emerald-500/20 to-blue-500/10",
  "AI Marketing": "from-fuchsia-500/20 to-indigo-500/10",
};

export default function CareerPositionsSection() {
  const [activeDomain, setActiveDomain] = useState<CareerDomain>("AI Automation");
  const planned = careersByDomain(activeDomain).filter((career) => career.availability === "planned");

  return (
    <section id="roadmaps" className="relative scroll-mt-20 overflow-hidden px-5 py-24 sm:px-8 sm:py-28" aria-labelledby="career-catalog-title">
      <div aria-hidden="true" className="section-divider absolute left-1/2 top-0 w-3/4 -translate-x-1/2" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(79,70,229,0.10),transparent_30%),radial-gradient(circle_at_82%_70%,rgba(6,182,212,0.07),transparent_34%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow mb-5">Career Network</div>
          <h2 id="career-catalog-title" className="heading-lg text-white">Find your place in the <span className="gradient-text">AI economy.</span></h2>
          <p className="body-md mx-auto mt-5 max-w-2xl">Explore focused career directions across AI, automation, data, product, consulting, infrastructure, and marketing. Complete workspaces open only when they are ready.</p>
        </div>

        {AVAILABLE_CAREERS.map((career) => (
          <article key={career.id} className="animated-border relative mx-auto mt-12 overflow-hidden rounded-3xl glass-elevated p-6 sm:p-8 lg:p-10">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(99,102,241,0.20),transparent_40%),radial-gradient(circle_at_90%_100%,rgba(6,182,212,0.12),transparent_42%)]" />
            <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="status-live rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1">Available in Public Beta</span>
                  <span className="label-sm">{career.domain}</span>
                </div>
                <h3 className="mt-5 font-display text-3xl font-semibold text-white sm:text-4xl">{career.title}</h3>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{career.description} Follow the structured journey, build practical projects, record progress, and prepare credible proof of your skills.</p>
              </div>
              <Link href={career.route!} className="btn-primary inline-flex min-h-12 items-center justify-center gap-2 px-6 py-3 text-sm">
                Open Workspace <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ))}

        <div className="mt-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label-sm">Explore what is planned</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">Career directions by domain</h3>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-500">Planned roles are intentionally compact. Registering interest helps prioritize the next complete workspace.</p>
          </div>

          <div className="-mx-5 mt-7 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0" role="tablist" aria-label="Career domains">
            <div className="flex w-max min-w-full gap-2 sm:flex-wrap">
              {CAREER_DOMAINS.map((domain) => {
                const active = domain === activeDomain;
                return (
                  <button
                    key={domain}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls="planned-careers-panel"
                    onClick={() => setActiveDomain(domain)}
                    className={`min-h-11 whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${active ? "border-indigo-400/40 bg-indigo-500/20 text-indigo-100" : "border-white/[0.07] bg-white/[0.025] text-slate-500 hover:border-white/15 hover:text-slate-300"}`}
                  >
                    {domain}
                  </button>
                );
              })}
            </div>
          </div>

          <div id="planned-careers-panel" role="tabpanel" className={`mt-5 rounded-3xl border border-white/[0.07] bg-gradient-to-br ${DOMAIN_ACCENTS[activeDomain]} p-5 sm:p-7`}>
            <div className="flex items-center justify-between gap-4">
              <h4 className="font-display text-xl font-semibold text-white">{activeDomain}</h4>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{planned.length} planned</span>
            </div>
            {planned.length ? (
              <ul className="mt-5 grid gap-3 md:grid-cols-2" aria-label={`Planned careers in ${activeDomain}`}>
                {planned.map((career) => (
                  <li key={career.id} className="rounded-2xl border border-white/[0.07] bg-slate-950/45 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h5 className="min-w-0 text-sm font-semibold leading-6 text-white sm:text-base">{career.title}</h5>
                      <span className="shrink-0 rounded-full border border-white/[0.07] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Planned</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{career.description}</p>
                    <a href="/#waitlist" className="mt-3 inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-indigo-300 hover:text-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400" aria-label={`Register interest in ${career.title}`}>
                      Register interest <span className="ml-1" aria-hidden="true">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 rounded-2xl border border-white/[0.07] bg-slate-950/40 p-5 text-sm leading-6 text-slate-300">AI Engineer is already available in this domain. Open the workspace above to begin.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
