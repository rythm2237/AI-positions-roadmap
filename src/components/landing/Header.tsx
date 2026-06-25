"use client";
// src/components/landing/Header.tsx
// Premium dark navigation — sticky, glassmorphic, with animated CTA.

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Careers", href: "/#roadmaps" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "CV Analyzer", href: "/cv-analyzer", highlight: false },
  { label: "Career Analyzer", href: "/career-dashboard", highlight: true },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [visible, setVisible]        = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setVisible(y < lastScrollY.current || y < 60);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        visible ? "translate-y-0" : "-translate-y-full"
      } ${
        scrolled
          ? "glass border-b border-indigo-500/10 shadow-glass"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* ── Brand ── */}
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
          {/* Logo mark */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow-sm">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
              <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
          </div>
          <span className="font-display text-lg font-bold text-white tracking-tight">
            AI Career <span className="gradient-text">OS</span>
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                link.highlight
                  ? "text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.highlight && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-indigo-400 animate-neural-pulse" />
              )}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop CTA ── */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/cv-analyzer"
            className="btn-secondary text-sm px-4 py-2"
          >
            Analyze CV
          </Link>
          <Link
            href="/#waitlist"
            className="btn-primary text-sm px-4 py-2"
          >
            Get Early Access
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden flex items-center justify-center rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="glass border-t border-indigo-500/10 md:hidden">
          <nav className="flex flex-col px-4 py-3 gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  link.highlight
                    ? "text-indigo-300 hover:bg-indigo-500/10"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-2">
              <Link
                href="/cv-analyzer"
                onClick={() => setMobileOpen(false)}
                className="btn-secondary text-sm text-center py-2.5"
              >
                Analyze My CV
              </Link>
              <Link
                href="/#waitlist"
                onClick={() => setMobileOpen(false)}
                className="btn-primary text-sm text-center py-2.5"
              >
                Get Early Access
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
