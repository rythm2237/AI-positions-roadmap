// src/app/page.tsx
// AI Career OS — Landing page.

import type { Metadata } from "next";
import Header from "@/components/landing/Header";
import SafeCareerUniverse from "@/components/landing/SafeCareerUniverse";

export const metadata: Metadata = {
  title: "AI Career OS — Your Personal AI Career Operating System",
  description:
    "Choose a career direction in AI, automation, data, or digital transformation. Follow a practical roadmap, build proof, and prepare to get hired.",
};

export default function LandingPage() {
  return (
    <div className="h-dvh overflow-hidden bg-[#03050e]">
      <Header />
      <main id="career-universe" className="h-dvh overflow-hidden">
        <SafeCareerUniverse />
      </main>
    </div>
  );
}
