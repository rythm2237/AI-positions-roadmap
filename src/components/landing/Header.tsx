"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PublicOverlay = "how" | "why";
type NavItem =
  | { kind: "link"; label: string; href: string }
  | { kind: "overlay"; label: string; overlay: PublicOverlay };

const NAV_ITEMS: NavItem[] = [
  { kind: "link", label: "Explore Careers", href: "/#career-universe" },
  { kind: "overlay", label: "How It Works", overlay: "how" },
  { kind: "overlay", label: "Why Career OS", overlay: "why" },
];

const STEPS = [
  ["Explore", "Compare focused AI career directions."],
  ["Choose", "Select the role that fits your goals and background."],
  ["Learn", "Follow one connected roadmap and learning journey."],
  ["Prove", "Build projects, portfolio evidence, and job readiness."],
] as const;

export function BrandMark({ size = 38 }: { size?: number }) {
  return (
    <span className="relative grid shrink-0 place-items-center overflow-hidden rounded-[13px] border border-violet-200/20 bg-[radial-gradient(circle_at_35%_28%,#a5b4fc_0%,#7c3aed_38%,#4c1d95_72%,#120b2f_100%)] shadow-[0_0_28px_rgba(124,58,237,.45)]" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 32 32" className="h-[68%] w-[68%]" fill="none"><circle cx="16" cy="16" r="4" fill="white" /><circle cx="7" cy="10" r="2.2" fill="#c4b5fd" /><circle cx="25" cy="8" r="2.2" fill="#67e8f9" /><circle cx="24" cy="24" r="2.2" fill="#f0abfc" /><path d="M10 11.5 13.2 14M19 13.5l4-4M19 19l3.5 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity=".9" /><circle cx="16" cy="16" r="11.5" stroke="white" strokeOpacity=".2" /></svg>
      <span className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
    </span>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [overlay, setOverlay] = useState<PublicOverlay | null>(null);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || overlay ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, overlay]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMobileOpen(false); setOverlay(null); }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.045] bg-[#03050e]/78 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-5 px-5 sm:px-8">
          <Link href="/" className="group flex shrink-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" aria-label="AI Career OS home"><BrandMark /><span className="hidden min-[430px]:block"><span className="block font-display text-[15px] font-bold tracking-tight text-white">AI Career <span className="text-violet-300">OS</span></span><span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">Career Operating System</span></span></Link>
          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => item.kind === "link" ? <Link key={item.label} href={item.href} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.045] hover:text-white">{item.label}</Link> : <button key={item.label} type="button" onClick={() => setOverlay(item.overlay)} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.045] hover:text-white">{item.label}</button>)}
          </nav>
          <button type="button" onClick={() => setMobileOpen(true)} className="ml-auto grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300 lg:hidden" aria-label="Open navigation"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg></button>
        </div>
      </header>

      <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" className={`fixed inset-0 z-[70] bg-black/65 backdrop-blur-sm transition ${mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside className={`fixed inset-y-0 right-0 z-[71] flex w-[min(340px,88vw)] flex-col border-l border-white/10 bg-[#070919]/98 p-5 shadow-2xl transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "translate-x-full"}`} aria-hidden={!mobileOpen}>
        <div className="flex items-center justify-between border-b border-white/10 pb-5"><div className="flex items-center gap-3"><BrandMark size={34} /><span className="font-display font-semibold text-white">AI Career OS</span></div><button type="button" onClick={() => setMobileOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300" aria-label="Close navigation">×</button></div>
        <nav className="mt-5 grid gap-2">{NAV_ITEMS.map((item) => item.kind === "link" ? <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.05]">{item.label}</Link> : <button key={item.label} type="button" onClick={() => { setMobileOpen(false); setOverlay(item.overlay); }} className="rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-300 hover:bg-white/[0.05]">{item.label}</button>)}</nav>
      </aside>

      <button type="button" onClick={() => setOverlay(null)} aria-label="Close information" className={`fixed inset-0 z-[80] bg-black/70 backdrop-blur-md transition ${overlay ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
      <div role="dialog" aria-modal="true" aria-hidden={!overlay} className={`fixed left-1/2 top-1/2 z-[81] w-[min(680px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-[#080b1c]/98 p-6 shadow-2xl transition ${overlay ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}>
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-300">{overlay === "why" ? "Connected by design" : "A clear path forward"}</p><h2 className="mt-2 font-display text-3xl font-bold text-white">{overlay === "why" ? "Why Career OS" : "How It Works"}</h2></div><button type="button" onClick={() => setOverlay(null)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300">×</button></div>
        {overlay === "why" ? <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300"><p className="font-display text-xl font-semibold text-white">Not another list of courses.</p><p>Career OS connects discovery, Roadmap, Learning, projects, portfolio evidence, and job preparation in one coherent journey.</p><p className="rounded-2xl border border-violet-300/15 bg-violet-500/[0.07] px-4 py-3 text-center font-semibold tracking-[.08em] text-violet-100">CHOOSE → LEARN → BUILD → PROVE → APPLY</p></div> : <ol className="mt-6 grid gap-3 sm:grid-cols-2">{STEPS.map(([title, description], index) => <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><span className="text-xs font-bold text-violet-300">0{index + 1}</span><h3 className="mt-2 font-display text-lg font-semibold text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{description}</p></li>)}</ol>}
      </div>
    </>
  );
}
