"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo, BrandLogoWithDescriptor, BrandMark } from "@/components/brand/BrandLogo";
import RoleSearchDialog from "@/components/landing/RoleSearchDialog";

type PublicOverlay = "how" | "why";
type NavItem =
  | { kind: "link"; label: string; href: string }
  | { kind: "overlay"; label: string; overlay: PublicOverlay };

const NAV_ITEMS: NavItem[] = [
  { kind: "link", label: "Explore Careers", href: "/careers" },
  { kind: "link", label: "CV Analyzer", href: "/cv-analyzer" },
  { kind: "overlay", label: "How It Works", overlay: "how" },
  { kind: "overlay", label: "Why AI Role Path", overlay: "why" },
];

const STEPS = [
  ["Explore", "Compare focused AI career directions."],
  ["Analyze", "Upload or build your CV to understand strengths, gaps, and role fit."],
  ["Choose", "Select the role that fits your goals and background."],
  ["Learn", "Follow one connected roadmap and learning journey."],
  ["Prove", "Build projects, portfolio evidence, and job readiness."],
] as const;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [overlay, setOverlay] = useState<PublicOverlay | null>(null);
  const [jobSearchOpen, setJobSearchOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || overlay || jobSearchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, overlay, jobSearchOpen]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMobileOpen(false); setOverlay(null); setJobSearchOpen(false); }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.045] bg-[#03050e]/78 backdrop-blur-xl" role="banner">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-4 px-5 pr-[4.75rem] sm:px-8 sm:pr-[5.25rem]">
          <Link href="/" className="group flex shrink-0 items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" aria-label="AI Role Path home">
            <BrandMark size={38} className="h-[38px] w-auto min-[430px]:hidden" />
            <BrandLogoWithDescriptor priority className="hidden h-10 w-auto min-[430px]:block" />
          </Link>
          <nav className="ml-auto hidden min-w-0 items-center gap-1 xl:flex" aria-label="Primary navigation">
            <button type="button" onClick={() => setJobSearchOpen(true)} className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-cyan-300/15 bg-cyan-300/[0.04] px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/[0.08]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
              Search Jobs
            </button>
            {NAV_ITEMS.map((item) => item.kind === "link" ? <Link key={item.label} href={item.href} className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.045] hover:text-white">{item.label}</Link> : <button key={item.label} type="button" onClick={() => setOverlay(item.overlay)} className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.045] hover:text-white">{item.label}</button>)}
          </nav>
          <button type="button" onClick={() => setMobileOpen(true)} className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-[#080b1c]/70 text-slate-300 backdrop-blur-sm xl:hidden" aria-label="Open navigation"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg></button>
        </div>
      </header>

      <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" className={`fixed inset-0 z-[70] bg-black/65 backdrop-blur-sm transition ${mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside className={`fixed inset-y-0 right-0 z-[71] flex w-[min(340px,88vw)] flex-col overflow-y-auto overscroll-contain border-l border-white/10 bg-[#070919]/98 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "translate-x-full"}`} aria-hidden={!mobileOpen}>
        <div className="flex items-center justify-between border-b border-white/10 pb-5"><BrandLogo className="h-8 w-auto" /><button type="button" onClick={() => setMobileOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300" aria-label="Close navigation">×</button></div>
        <nav className="mt-5 grid gap-2" aria-label="Mobile primary navigation">
          <button type="button" onClick={() => { setMobileOpen(false); setJobSearchOpen(true); }} className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] px-4 py-3 text-left text-sm font-semibold text-cyan-100">Search Jobs<span className="float-right">⌕</span></button>
          {NAV_ITEMS.map((item) => item.kind === "link" ? (
            <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-xl border border-violet-300/15 bg-violet-500/[0.09] px-4 py-3 text-sm font-semibold text-violet-100 hover:bg-violet-500/[0.15]">{item.label}<span className="float-right" aria-hidden="true">→</span></Link>
          ) : (
            <button key={item.label} type="button" onClick={() => { setMobileOpen(false); setOverlay(item.overlay); }} className="rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-300 hover:bg-white/[0.05]">{item.label}</button>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-600">Information</p>
          <nav className="grid grid-cols-2 gap-2 text-xs text-slate-400" aria-label="Mobile utility navigation">
            <Link href="/methodology" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/[0.04] hover:text-white">Methodology</Link>
            <Link href="/sources" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/[0.04] hover:text-white">Sources</Link>
            <Link href="/legal" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/[0.04] hover:text-white">Legal</Link>
            <Link href="/legal/privacy" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/[0.04] hover:text-white">Privacy</Link>
          </nav>
        </div>
      </aside>

      <button type="button" onClick={() => setOverlay(null)} aria-label="Close information" className={`fixed inset-0 z-[80] bg-black/70 backdrop-blur-md transition ${overlay ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
      <div role="dialog" aria-modal="true" aria-hidden={!overlay} className={`fixed left-1/2 top-1/2 z-[81] max-h-[calc(100dvh-2rem)] w-[min(680px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-white/10 bg-[#080b1c]/98 p-5 shadow-2xl transition sm:p-6 ${overlay ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}>
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-violet-300 sm:text-xs">{overlay === "why" ? "Connected by design" : "A clear path forward"}</p><h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{overlay === "why" ? "Why AI Role Path" : "How It Works"}</h2></div><button type="button" onClick={() => setOverlay(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-300">×</button></div>
        {overlay === "why" ? <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300 sm:mt-6 sm:leading-7"><p className="font-display text-lg font-semibold text-white sm:text-xl">Not another list of courses.</p><p>AI Role Path connects discovery, CV analysis, Roadmap, Learning, projects, portfolio evidence, and job preparation in one coherent journey.</p><p className="rounded-2xl border border-violet-300/15 bg-violet-500/[0.07] px-4 py-3 text-center text-xs font-semibold tracking-[.06em] text-violet-100 sm:text-sm sm:tracking-[.08em]">ANALYZE → CHOOSE → LEARN → BUILD → PROVE → APPLY</p></div> : <ol className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2">{STEPS.map(([title, description], index) => <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><span className="text-xs font-bold text-violet-300">0{index + 1}</span><h3 className="mt-2 font-display text-lg font-semibold text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{description}</p></li>)}</ol>}
      </div>
      <RoleSearchDialog open={jobSearchOpen} onClose={() => setJobSearchOpen(false)} />
    </>
  );
}
