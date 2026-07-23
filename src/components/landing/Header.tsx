"use client";
// src/components/landing/Header.tsx
// AI Career OS v2.0 — Navigation
// Smart hide-on-scroll · Full mobile drawer · Keyboard accessible · WCAG AA

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// ══════════════════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════════════════

type PublicOverlay = "how" | "why";

const PUBLIC_NAV_ITEMS = [
  { label: "Explore Careers", kind: "link", href: "/#career-universe" },
  { label: "How It Works", kind: "overlay", overlay: "how" },
  { label: "Why Career OS", kind: "overlay", overlay: "why" },
] as const;

const HOW_IT_WORKS_STEPS = [
  ["Explore AI careers", "Discover AI-focused career directions."],
  ["Choose your direction", "Select the role that fits your goals and background."],
  ["Follow your roadmap and learn", "Progress through one shared Career Journey across Roadmap and Learning."],
  ["Build proof and prepare for jobs", "Complete projects, strengthen your portfolio and prepare credible applications."],
] as const;

function trapFocus(event: KeyboardEvent, container: HTMLElement | null) {
  if (event.key !== "Tab" || !container) return;
  const focusable = Array.from(container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  ));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

// ══════════════════════════════════════════════════════════════════════════
// LOGO MARK
// ══════════════════════════════════════════════════════════════════════════

function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-700 transition-all duration-300 group-hover:shadow-[0_0_22px_rgba(99,102,241,0.6)]"
      style={{
        width: size,
        height: size,
        boxShadow: "0 0 14px rgba(99,102,241,0.38)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.8"
        strokeLinecap="round"
        style={{ width: size * 0.5, height: size * 0.5 }}
        aria-hidden="true"
      >
        {/* Neural network icon — 3 nodes connected */}
        <circle cx="12" cy="5"  r="2" fill="white" />
        <circle cx="5"  cy="19" r="2" fill="white" />
        <circle cx="19" cy="19" r="2" fill="white" />
        <line x1="12" y1="7" x2="12" y2="11" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
        <line x1="12" y1="11" x2="5.5" y2="17" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
        <line x1="12" y1="11" x2="18.5" y2="17" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
      </svg>
      {/* Glass highlight */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/22 to-transparent pointer-events-none" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// HEADER
// ══════════════════════════════════════════════════════════════════════════

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<PublicOverlay | null>(null);
  const [contextAction, setContextAction] = useState({ label: "Explore AI Careers", href: "/#career-universe" });
  const [scrolled,   setScrolled]   = useState(false);
  const [visible,    setVisible]    = useState(true);
  const lastY = useRef(0);
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayDialogRef = useRef<HTMLDivElement>(null);
  const overlayReturnFocusRef = useRef<HTMLElement | null>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);

  // Smart hide-on-scroll
  const onScroll = useCallback(() => {
    const y = window.scrollY;
    setScrolled(y > 24);
    // Show header when scrolling up OR near the top
    setVisible(y < lastY.current || y < 80);
    lastY.current = y;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("career_workspace_progress__ai-engineer");
      if (!raw) return;
      const progress = JSON.parse(raw) as Record<string, unknown>;
      const hasSavedJourney = Boolean(progress.lastActiveStageId)
        || Object.values(progress).some((value) => Array.isArray(value) && value.length > 0)
        || (typeof progress.assessmentResults === "object" && progress.assessmentResults !== null && Object.keys(progress.assessmentResults).length > 0);
      if (hasSavedJourney) setContextAction({ label: "Continue Journey", href: "/careers/ai-engineer?section=roadmap" });
    } catch {
      // Malformed or unavailable browser storage keeps the safe exploration fallback.
    }
  }, []);

  // Body scroll lock while either navigation surface is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen || activeOverlay ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeOverlay, mobileOpen]);

  // Close on Escape and keep focus inside the active surface.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (activeOverlay) {
        if (e.key === "Escape") {
          setActiveOverlay(null);
          window.requestAnimationFrame(() => overlayReturnFocusRef.current?.focus());
          return;
        }
        trapFocus(e, overlayDialogRef.current);
      } else if (mobileOpen) {
        if (e.key === "Escape") {
          setMobileOpen(false);
          window.requestAnimationFrame(() => mobileTriggerRef.current?.focus());
          return;
        }
        trapFocus(e, drawerRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeOverlay, mobileOpen]);

  useEffect(() => {
    if (activeOverlay) {
      window.requestAnimationFrame(() => overlayDialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus());
    } else if (mobileOpen) {
      window.requestAnimationFrame(() => drawerRef.current?.querySelector<HTMLElement>('a[href],button:not([disabled])')?.focus());
    }
  }, [activeOverlay, mobileOpen]);

  const openOverlay = (overlay: PublicOverlay, trigger: HTMLElement) => {
    overlayReturnFocusRef.current = trigger;
    setActiveOverlay(overlay);
  };

  const closeOverlay = () => {
    setActiveOverlay(null);
    window.requestAnimationFrame(() => overlayReturnFocusRef.current?.focus());
  };

  const closeMobile = (returnFocus = false) => {
    setMobileOpen(false);
    if (returnFocus) window.requestAnimationFrame(() => mobileTriggerRef.current?.focus());
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          MAIN HEADER BAR
      ══════════════════════════════════════════════════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-500 ease-out ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
        role="banner"
      >
        <div
          className={`transition-all duration-500 ${
            scrolled
              ? "glass border-b border-white/[0.045] shadow-[0_8px_48px_rgba(0,0,0,0.5)]"
              : "border-b border-transparent bg-transparent"
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">

            {/* ── Brand ── */}
            <Link
              href="/"
              className="group flex items-center gap-3 shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
              aria-label="AI Career OS — Home"
            >
              <LogoMark size={34} />
              <div className="flex flex-col leading-none">
                <span className="font-display text-[14.5px] font-bold tracking-tight text-white">
                  AI Career{" "}
                  <span className="gradient-text">OS</span>
                </span>
                <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600">
                  Career Operating System
                </span>
              </div>
            </Link>

            {/* ── Desktop nav ── */}
            <nav
              className="hidden items-center gap-0.5 md:flex"
              aria-label="Primary navigation"
            >
              {PUBLIC_NAV_ITEMS.map((item) => item.kind === "link" ? (
                <Link key={item.label} href={item.href} className="relative rounded-xl px-3.5 py-2 text-[13px] font-medium text-slate-500 transition-all duration-200 hover:bg-white/[0.045] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:text-white">
                  {item.label}
                </Link>
              ) : (
                <button key={item.label} type="button" onClick={(event) => openOverlay(item.overlay, event.currentTarget)} className="relative rounded-xl px-3.5 py-2 text-[13px] font-medium text-slate-500 transition-all duration-200 hover:bg-white/[0.045] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50">
                  {item.label}
                </button>
              ))}
            </nav>

            {/* ── Desktop right CTAs ── */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href={contextAction.href}
                className="btn-primary text-[13px]"
                style={{ borderRadius: "11px", padding: "8px 18px" }}
              >
                {contextAction.label}
              </Link>
            </div>

            {/* ── Mobile burger ── */}
            <button
              ref={mobileTriggerRef}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.065] text-slate-400
                hover:text-white hover:bg-white/[0.045] transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              <svg
                className="h-[18px] w-[18px] transition-all duration-200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {mobileOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <>
                    <line x1="3" y1="7"  x2="21" y2="7"  />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="17" x2="21" y2="17" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE DRAWER — full-height slide-in
      ══════════════════════════════════════════════════════════════ */}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => closeMobile(true)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
        aria-label="Navigation menu"
        className={`fixed right-0 top-0 bottom-0 z-50 w-[82vw] max-w-[320px] glass-elevated flex flex-col transition-transform duration-400 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)" }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            onClick={() => closeMobile()}
            aria-label="AI Career OS — Home"
          >
            <LogoMark size={30} />
            <span className="font-display text-[14px] font-bold text-white">
              AI Career <span className="gradient-text">OS</span>
            </span>
          </Link>
          <button
            onClick={() => closeMobile(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-slate-500 hover:text-white transition-all"
            aria-label="Close navigation menu"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer nav links */}
        <nav className="flex flex-col gap-1 px-4 py-5 flex-1" aria-label="Mobile navigation">
          {PUBLIC_NAV_ITEMS.map((item, index) => item.kind === "link" ? (
            <Link key={item.label} href={item.href} onClick={() => closeMobile()} className="flex min-h-11 items-center rounded-xl px-4 py-3.5 text-[14px] font-medium text-slate-400 transition-all duration-200 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50" style={{ animationDelay: `${index * 50}ms` }}>
              {item.label}
            </Link>
          ) : (
            <button key={item.label} type="button" onClick={(event) => openOverlay(item.overlay, event.currentTarget)} className="flex min-h-11 items-center rounded-xl px-4 py-3.5 text-left text-[14px] font-medium text-slate-400 transition-all duration-200 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50">
              {item.label}
            </button>
          ))}
        </nav>

        {/* Drawer CTA */}
        <div className="border-t border-white/[0.06] px-4 py-5">
          <Link
            href={contextAction.href}
            onClick={() => closeMobile()}
            className="btn-primary block w-full text-center text-[14px]"
            style={{ borderRadius: "12px", padding: "13px 20px" }}
          >
            {contextAction.label}
          </Link>
          <p className="mt-3 text-center text-[11px] text-slate-700">
            Public Beta · One complete workspace available
          </p>
        </div>
      </div>

      <button
        type="button"
        tabIndex={activeOverlay ? 0 : -1}
        aria-label={`Close ${activeOverlay === "why" ? "Why Career OS" : "How It Works"}`}
        onClick={closeOverlay}
        className={`fixed inset-0 z-[60] bg-black/65 backdrop-blur-md transition-opacity ${activeOverlay ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <div
        ref={overlayDialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="public-overlay-title"
        aria-hidden={!activeOverlay}
        inert={!activeOverlay}
        className={`fixed inset-x-3 bottom-3 z-[61] max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-3xl border border-white/10 bg-[#080b1c]/98 p-5 shadow-2xl backdrop-blur-xl transition duration-300 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(680px,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:p-7 ${activeOverlay ? "opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">{activeOverlay === "why" ? "Connected by design" : "A shared career journey"}</p>
            <h2 id="public-overlay-title" className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{activeOverlay === "why" ? "Why Career OS" : "How It Works"}</h2>
          </div>
          <button type="button" onClick={closeOverlay} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/[0.05] hover:text-white" aria-label={`Close ${activeOverlay === "why" ? "Why Career OS" : "How It Works"}`}>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {activeOverlay === "why" ? (
          <div className="mt-6">
            <p className="font-display text-xl font-semibold leading-8 text-white">Not another list of courses.<br /><span className="gradient-text">One connected system for choosing, building and proving your AI career.</span></p>
            <p className="mt-4 text-sm leading-7 text-slate-300">Career OS connects career discovery, a structured Roadmap, aligned Learning, practical projects, portfolio evidence, job preparation and interview preparation. Reliable market intelligence appears only when reviewed published data is available.</p>
            <p className="mt-6 rounded-2xl border border-indigo-300/15 bg-indigo-500/[0.07] px-4 py-3 text-center font-display text-sm font-semibold tracking-[0.08em] text-indigo-100">Choose → Learn → Build → Prove → Apply</p>
          </div>
        ) : (
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {HOW_IT_WORKS_STEPS.map(([title, description], index) => (
              <li key={title} className="relative border-l border-indigo-300/25 py-2 pl-5">
                <span className="absolute -left-3 top-1 grid h-6 w-6 place-items-center rounded-full border border-indigo-300/30 bg-[#11152d] text-[10px] font-bold text-indigo-200">{index + 1}</span>
                <h3 className="font-display text-base font-semibold text-white">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
