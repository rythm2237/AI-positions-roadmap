import type { Metadata } from "next";
import Link from "next/link";
import CVAnalyzerClient from "@/components/cv-analyzer/CVAnalyzerClient";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "CV Analyzer — AI Career OS",
  description:
    "Upload or build your CV, assess ATS readability, evidence strength and career fit, and turn skill gaps into an actionable path toward job readiness.",
  alternates: { canonical: absoluteUrl("/cv-analyzer") },
};

// CV Analyzer public entry point. Keep this page server-rendered for metadata and route stability.
export default function CVAnalyzerPage() {
  return (
    <div className="relative bg-[#03050e]">
      <div className="fixed left-4 top-4 z-[60] sm:left-6 sm:top-5">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-[#070a18]/88 px-3.5 py-2 text-xs font-semibold text-slate-300 shadow-lg backdrop-blur-xl transition hover:border-violet-300/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          aria-label="Back to AI Career OS home"
        >
          <span aria-hidden="true">←</span>
          Career OS
        </Link>
      </div>
      <CVAnalyzerClient />
    </div>
  );
}
