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
      <main id="career-universe" className="h-dvh overflow-hidden">
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
