"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CAREER_CATALOG, CAREER_DOMAINS } from "@/data/careerCatalog";

export default function CareerSwitcherDock() {
  const pathname = usePathname();
  const match = pathname.match(/^\/careers\/([^/]+)/);
  const currentSlug = match?.[1];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const current = CAREER_CATALOG.find((career) => career.slug === currentSlug);
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value
      ? CAREER_CATALOG.filter((career) => `${career.title} ${career.domain}`.toLowerCase().includes(value))
      : CAREER_CATALOG;
  }, [query]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", escape);
    };
  }, []);

  if (!currentSlug) return null;

  return (
    <div ref={rootRef} className="fixed bottom-[4.25rem] left-4 z-[57] lg:bottom-[4.5rem] lg:left-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-[#080b1c]/94 text-violet-200 shadow-xl backdrop-blur-xl transition hover:border-violet-300/35 hover:bg-violet-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        aria-expanded={open}
        aria-label={`Switch career. Current career: ${current?.title ?? "Unknown"}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 7h11l-3-3" /><path d="m18 7-3 3" /><path d="M17 17H6l3 3" /><path d="m6 17 3-3" />
        </svg>
        <span className="pointer-events-none absolute left-[calc(100%+12px)] whitespace-nowrap rounded-lg border border-white/10 bg-slate-950/96 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition group-hover:opacity-100 group-focus-visible:opacity-100">Switch career</span>
      </button>

      {open ? (
        <div className="absolute bottom-0 left-[calc(100%+12px)] flex max-h-[min(72vh,640px)] w-[min(380px,calc(100vw-5.5rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#080b1c]/98 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[.17em] text-violet-300">Career workspace</p>
            <p className="mt-1 truncate text-sm font-semibold text-white">{current?.title ?? "Choose a career"}</p>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search career titles or domains…" className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-300/35" autoFocus />
          </div>
          <div className="overflow-y-auto p-2">
            {CAREER_DOMAINS.map((domain) => {
              const careers = filtered.filter((career) => career.domain === domain);
              if (!careers.length) return null;
              return (
                <section key={domain} className="mb-3">
                  <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-slate-600">{domain}</p>
                  <div className="grid gap-1">
                    {careers.map((career) => career.availability === "available" && career.route ? (
                      <Link key={career.slug} href={career.route} onClick={() => setOpen(false)} className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/[0.05] ${career.slug === currentSlug ? "bg-violet-500/12 text-white" : "text-slate-300"}`}>
                        <span>{career.title}</span>
                        {career.slug === currentSlug ? <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-300">Current</span> : null}
                      </Link>
                    ) : (
                      <div key={career.slug} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-600"><span>{career.title}</span><span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300/70">Planned</span></div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
          <Link href="/#career-universe" onClick={() => setOpen(false)} className="border-t border-white/10 px-4 py-3 text-center text-sm font-semibold text-violet-200 hover:bg-white/[0.04]">Explore Career Universe</Link>
        </div>
      ) : null}
    </div>
  );
}
