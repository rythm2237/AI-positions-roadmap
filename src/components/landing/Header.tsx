"use client";
// src/components/landing/Header.tsx
// AI Career OS v2.0 — Navigation
// Smart hide-on-scroll · Full mobile drawer · Keyboard accessible · WCAG AA

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// ══════════════════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════════════════

const NAV_LINKS = [
  { label: "Explore Careers", href: "/#roadmaps"    },
  { label: "How It Works",    href: "/#how-it-works" },
  { label: "Pricing",         href: "/#pricing"      },
  { label: "CV Analyzer",     href: "/cv-analyzer"   },
];

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
  const [scrolled,   setScrolled]   = useState(false);
  const [visible,    setVisible]    = useState(true);
  const lastY = useRef(0);
  const drawerRef = useRef<HTMLDivElement>(null);

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

  // Body scroll lock when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close on Escape + focus trap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

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
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="relative rounded-xl px-3.5 py-2 text-[13px] font-medium text-slate-500 transition-all duration-200
                    hover:text-white hover:bg-white/[0.045]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* ── Desktop right CTAs ── */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/#waitlist"
                className="btn-primary text-[13px]"
                style={{ borderRadius: "11px", padding: "8px 18px" }}
              >
                Get Early Access
              </Link>
            </div>

            {/* ── Mobile burger ── */}
            <button
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
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
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
            onClick={closeMobile}
            aria-label="AI Career OS — Home"
          >
            <LogoMark size={30} />
            <span className="font-display text-[14px] font-bold text-white">
              AI Career <span className="gradient-text">OS</span>
            </span>
          </Link>
          <button
            onClick={closeMobile}
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
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={closeMobile}
              className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-[14px] font-medium text-slate-400 transition-all duration-200
                hover:text-white hover:bg-white/[0.05]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Drawer CTA */}
        <div className="border-t border-white/[0.06] px-4 py-5">
          <Link
            href="/#waitlist"
            onClick={closeMobile}
            className="btn-primary block w-full text-center text-[14px]"
            style={{ borderRadius: "12px", padding: "13px 20px" }}
          >
            Get Early Access
          </Link>
          <p className="mt-3 text-center text-[11px] text-slate-700">
            Free to join · No credit card required
          </p>
        </div>
      </div>
    </>
  );
}
