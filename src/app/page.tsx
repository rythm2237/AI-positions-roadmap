// src/app/page.tsx
// AI Career OS — Landing page.

import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/landing/Header";
import SafeCareerUniverse from "@/components/landing/SafeCareerUniverse";
import CookieSettingsButton from "@/components/legal/CookieSettingsButton";

export const metadata: Metadata = {
  title: "AI Career OS — Your Personal AI Career Operating System",
  description:
    "Choose a career direction in AI, automation, data, or digital transformation. Follow a practical roadmap, build proof, and prepare to get hired.",
};

export default function LandingPage() {
  return (
    <div className="relative h-dvh overflow-hidden bg-[#03050e]">
      <Header />
      <main id="career-universe" className="relative h-dvh overflow-hidden">
        <section
          className="pointer-events-none absolute left-4 top-[84px] z-30 max-w-[min(34rem,calc(100vw-2rem))] sm:left-8 sm:top-[92px]"
          aria-labelledby="homepage-title"
        >
          <div className="rounded-2xl border border-white/10 bg-[#050817]/72 p-4 shadow-xl backdrop-blur-md sm:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-violet-300 sm:text-xs">AI Career OS</p>
            <h1 id="homepage-title" className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
              Build a practical roadmap for your next AI career.
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
              Explore role-specific paths across AI engineering, product, automation, consulting, data, cloud, cybersecurity, and AI marketing.
            </p>
            <Link
              href="/careers"
              className="pointer-events-auto mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-500/15 px-4 py-2 text-xs font-semibold text-violet-100 transition hover:bg-violet-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:text-sm"
            >
              Browse all careers <span className="ml-1" aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        <SafeCareerUniverse />
      </main>
      <footer className="pointer-events-none fixed inset-x-0 bottom-2 z-40 flex justify-center px-3">
        <nav
          className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-white/10 bg-[#050817]/80 px-4 py-2 text-[11px] text-slate-400 shadow-lg backdrop-blur-md"
          aria-label="Legal and privacy navigation"
        >
          <Link href="/legal" className="transition hover:text-white">Legal</Link>
          <Link href="/legal/privacy" className="transition hover:text-white">Privacy</Link>
          <Link href="/legal/terms" className="transition hover:text-white">Terms</Link>
          <Link href="/legal/refunds" className="transition hover:text-white">Refunds</Link>
          <Link href="/legal/withdraw" className="transition hover:text-white">Withdraw</Link>
          <CookieSettingsButton />
        </nav>
      </footer>
    </div>
  );
}
