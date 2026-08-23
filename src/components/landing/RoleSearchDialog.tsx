"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { roleSearchPreview } from "@/lib/job-agent/roleSearchExpansion";

export default function RoleSearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const preview = useMemo(() => roleSearchPreview(query), [query]);
  const trimmed = query.trim();
  const jobAgentHref = `/job-agent${trimmed ? `?career=${encodeURIComponent(preview?.canonical ?? trimmed)}` : ""}`;

  return (
    <>
      <button type="button" aria-label="Close job search" onClick={onClose} className={`fixed inset-0 z-[90] bg-black/70 backdrop-blur-md transition ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
      <section role="dialog" aria-modal="true" aria-hidden={!open} aria-labelledby="job-search-title" className={`fixed left-1/2 top-1/2 z-[91] max-h-[calc(100dvh-2rem)] w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-white/10 bg-[#080b1c]/98 p-5 shadow-2xl transition sm:p-6 ${open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-cyan-300 sm:text-xs">Semantic role search</p>
            <h2 id="job-search-title" className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">Search the role, not only the exact title.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Enter the position you want. AI Role Path expands it into equivalent and adjacent market titles before the Job Agent searches supported countries.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-300" aria-label="Close job search">×</button>
        </div>

        <label className="mt-5 block text-sm font-medium text-slate-300">
          Position or career
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 focus-within:border-cyan-300/30">
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
            <input autoFocus={open} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. AI Automation Specialist, ML Engineer, Power BI Developer" className="min-h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
          </div>
        </label>

        {trimmed ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            {preview ? (
              <>
                <p className="text-xs uppercase tracking-[.14em] text-slate-500">Role family detected</p>
                <p className="mt-1 text-lg font-semibold text-white">{preview.canonical}</p>
                <p className="mt-3 text-xs leading-5 text-slate-400">Vacancies may use different titles across employers and countries. The search will include:</p>
                <div className="mt-3 flex flex-wrap gap-2">{preview.equivalentTitles.map((title) => <span key={title} className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.05] px-3 py-1.5 text-xs text-cyan-100">{title}</span>)}</div>
                <p className="mt-4 text-xs text-slate-500">Adjacent roles are included as broader discovery signals, but are labeled as related rather than automatically treated as the same job.</p>
                <div className="mt-2 flex flex-wrap gap-2">{preview.adjacentTitles.map((title) => <span key={title} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-400">{title}</span>)}</div>
              </>
            ) : (
              <p className="text-sm leading-6 text-slate-400">No predefined role family matched this title. The Job Agent will still use your entered title and any desired/adjacent roles you configure, rather than blocking the search.</p>
            )}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link href={jobAgentHref} onClick={onClose} className={`inline-flex min-h-11 items-center rounded-xl px-5 py-3 text-sm font-semibold transition ${trimmed ? "bg-cyan-300 text-slate-950 hover:bg-cyan-200" : "pointer-events-none bg-white/10 text-slate-600"}`}>
            Search live jobs →
          </Link>
          <p className="text-xs leading-5 text-slate-500">Live vacancies come from the configured job provider. Country coverage depends on provider support and your Job Agent settings.</p>
        </div>
      </section>
    </>
  );
}
