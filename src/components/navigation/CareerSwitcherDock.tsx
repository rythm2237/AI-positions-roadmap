"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { CAREER_CATALOG, CAREER_DOMAINS } from "@/data/careerCatalog";

export default function CareerSwitcherDock() {
  const pathname = usePathname();
  const match = pathname.match(/^\/careers\/([^/]+)/);
  const currentSlug = match?.[1];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const current = CAREER_CATALOG.find((career) => career.slug === currentSlug);
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value ? CAREER_CATALOG.filter((career) => `${career.title} ${career.domain}`.toLowerCase().includes(value)) : CAREER_CATALOG;
  }, [query]);

  if (!currentSlug) return null;

  return (
    <div className="fixed left-3 top-[76px] z-[57] lg:left-[88px] lg:top-3">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex max-w-[240px] items-center gap-2 rounded-xl border border-white/10 bg-[#080b1c]/92 px-3 py-2.5 text-left shadow-xl backdrop-blur-xl transition hover:border-violet-300/25" aria-expanded={open}>
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,.8)]" />
        <span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-semibold uppercase tracking-[.16em] text-slate-500">Current career</span><span className="block truncate text-sm font-semibold text-white">{current?.title ?? "Choose a career"}</span></span>
        <span className="text-slate-500">⌄</span>
      </button>

      {open ? (
        <div className="mt-2 flex max-h-[min(70vh,620px)] w-[min(360px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#080b1c]/98 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 p-3"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search careers…" className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-300/35" /></div>
          <div className="overflow-y-auto p-2">
            {CAREER_DOMAINS.map((domain) => {
              const careers = filtered.filter((career) => career.domain === domain);
              if (!careers.length) return null;
              return <section key={domain} className="mb-3"><p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-slate-600">{domain}</p><div className="grid gap-1">{careers.map((career) => career.availability === "available" && career.route ? <Link key={career.slug} href={career.route} onClick={() => setOpen(false)} className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/[0.05] ${career.slug === currentSlug ? "bg-violet-500/12 text-white" : "text-slate-300"}`}><span>{career.title}</span><span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Available</span></Link> : <div key={career.slug} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-600"><span>{career.title}</span><span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300/70">In Development</span></div>)}</div></section>;
            })}
          </div>
          <Link href="/#career-universe" onClick={() => setOpen(false)} className="border-t border-white/10 px-4 py-3 text-center text-sm font-semibold text-violet-200 hover:bg-white/[0.04]">Explore full Career Universe</Link>
        </div>
      ) : null}
    </div>
  );
}
