import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/landing/Header";
import SafeCareerUniverse from "@/components/landing/SafeCareerUniverse";
import CookieSettingsButton from "@/components/legal/CookieSettingsButton";

export const metadata: Metadata = {
  title: "AI Career OS — Your Personal AI Career Operating System",
  description:
    "Explore AI career directions through an interactive Career Universe, then open practical roadmaps across AI engineering, product, automation, consulting, data, cloud, cybersecurity, and AI marketing.",
};

export default function LandingPage() {
  return (
    <div className="relative h-dvh min-h-[100svh] overflow-hidden bg-[#03050e] text-white">
      <Header />

      <main className="absolute inset-0 overflow-hidden">
        <SafeCareerUniverse />
      </main>

      <footer className="pointer-events-none fixed inset-x-0 bottom-3 z-40 hidden justify-center px-3 sm:flex">
        <nav
          className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-white/10 bg-[#050817]/78 px-4 py-2 text-[11px] text-slate-400 shadow-lg backdrop-blur-md"
          aria-label="Legal and privacy navigation"
        >
          <Link href="/legal" className="transition hover:text-white">Legal</Link>
          <Link href="/legal/privacy" className="transition hover:text-white">Privacy</Link>
          <Link href="/legal/terms" className="transition hover:text-white">Terms</Link>
          <Link href="/sources" className="transition hover:text-white">Sources</Link>
          <CookieSettingsButton />
        </nav>
      </footer>
    </div>
  );
}
