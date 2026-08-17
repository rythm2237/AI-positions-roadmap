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

      {/* Preview V2: utility links stay outside the cinematic focal area. */}
      <footer className="pointer-events-none fixed bottom-3 right-3 z-40 hidden justify-end sm:flex">
        <nav
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/[0.06] bg-[#050817]/55 px-3 py-1.5 text-[10px] text-slate-500 opacity-50 shadow-md backdrop-blur-md transition-opacity duration-300 hover:opacity-90"
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
