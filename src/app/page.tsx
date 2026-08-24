import type { Metadata } from "next";
import Header from "@/components/landing/Header";
import SafeCareerUniverse from "@/components/landing/SafeCareerUniverse";

export const metadata: Metadata = {
  title: "AI Role Path — Your Personal AI Career Operating System",
  description:
    "Explore AI career directions, diagnose skill gaps, follow adaptive roadmaps, build reviewed proof of skill, and prepare evidence-backed applications across AI engineering, product, automation, consulting, data, cloud, cybersecurity, and AI marketing.",
};

export default function LandingPage() {
  return (
    <div className="relative h-dvh min-h-[100svh] overflow-hidden bg-[#03050e] text-white">
      <Header />
      <main className="absolute inset-0 overflow-hidden">
        <SafeCareerUniverse />
      </main>
    </div>
  );
}
