"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AVAILABLE_CAREERS } from "@/data/careerCatalog";
import { roleSearchPreview } from "@/lib/job-agent/roleSearchExpansion";

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export default function RoleSearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const preview = useMemo(() => roleSearchPreview(trimmed), [trimmed]);

  const results = useMemo(() => {
    const q = normalize(trimmed);
    if (!q) return AVAILABLE_CAREERS.slice(0, 8);
    const semanticTerms = preview
      ? [preview.canonical, ...preview.equivalentTitles, ...preview.adjacentTitles].map(normalize)
      : [];

    return AVAILABLE_CAREERS
      .map((career) => {
        const title = normalize(career.title);
        const domain = normalize(career.domain);
        const description = normalize(career.description);
        let score = 0;
        if (title === q) score += 100;
        if (title.startsWith(q)) score += 70;
        if (title.includes(q)) score += 55;
        if (domain.includes(q)) score += 30;
        if (description.includes(q)) score += 15;
        if (semanticTerms.some((term) => term === title)) score += 80;
        if (semanticTerms.some((term) => term.includes(title) || title.includes(term))) score += 40;
        return { career, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.career.displayOrder - b.career.displayOrder)
      .slice(0, 8)
      .map((item) => item.career);
  }, [preview, trimmed]);

  return (
    <>
      <button type="button" aria-label="Close career search" onClick={onClose} className={`fixed inset-0 z-[90] bg-black/70 backdrop-blur-md transition ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
      <section role="dialog" aria-modal="true" aria-hidden={!open} aria-labelledby="career-search-title" className={`fixed left-1/2 top-1/2 z-[91] max-h-[calc(100dvh-2rem)] w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-white/10 bg-[#080b1c]/98 p-5 shadow-2xl transition sm:p-6 ${open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-cyan-300 sm:text-xs">AI Role Path directory</p>
            <h2 id="career-search-title" className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">Find a career path inside AI Role Path.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Search by position, career family, or a related market title. Results open the matching Career Workspace — this search does not look for external job vacancies.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-300" aria-label="Close career search">×</button>
        </div>

        <label className="mt-5 block text-sm font-medium text-slate-300">
          Career or position
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 focus-within:border-cyan-300/30">
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
            <input autoFocus={open} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. AI Automation, Data Analyst, Copilot Consultant" className="min-h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
          </div>
        </label>

        <div className="mt-5 grid gap-2">
          {results.length ? results.map((career) => (
            <Link key={career.slug} href={career.route ?? `/careers/${career.slug}`} onClick={onClose} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-cyan-300/25 hover:bg-cyan-300/[0.045]">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-xs font-semibold uppercase tracking-[.13em] text-cyan-300/75">{career.domain}</p><h3 className="mt-1 text-base font-semibold text-white">{career.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{career.description}</p></div>
                <span className="mt-1 text-cyan-200 transition group-hover:translate-x-0.5" aria-hidden="true">→</span>
              </div>
            </Link>
          )) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-sm font-semibold text-white">No active Career Workspace matched that title yet.</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Try a broader role name, or browse all active careers. External vacancy search is available later in Job Search Mode and the Job Agent.</p>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
          <Link href="/careers" onClick={onClose} className="inline-flex min-h-11 items-center rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">Explore all careers →</Link>
          <p className="text-xs leading-5 text-slate-500">Already job-ready? Live vacancy matching is available from Ready to Apply / Job Search Mode.</p>
        </div>
      </section>
    </>
  );
}
