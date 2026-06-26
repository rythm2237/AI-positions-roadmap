// src/app/page.tsx
// AI Career OS — Landing page.

import type { Metadata } from "next";
import Header from "@/components/landing/Header";
import OpeningScene from "@/components/opening-scene/OpeningScene";
import CareerPositionsSection from "@/components/landing/CareerPositionsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PricingPreviewSection from "@/components/landing/PricingPreviewSection";
import WaitlistSection from "@/components/landing/WaitlistSection";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "AI Career OS — Your Personal AI Career Operating System",
  description:
    "Discover your perfect AI career, follow a structured roadmap, build real portfolio projects, and become job-ready — guided by intelligent AI every step of the way.",
};

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        {/* The Opening Scene — the full first screen 3D Career Universe */}
        <OpeningScene />

        {/* The rest of the product — discovered by scrolling */}
        <div id="roadmaps">
          <CareerPositionsSection />
        </div>
        <HowItWorksSection />
        <PricingPreviewSection />
        <WaitlistSection />
      </main>
      <Footer />
    </>
  );
}
