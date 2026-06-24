// src/app/page.tsx
// Landing page — composes all section components.
// FeaturedRoadmapPreview removed: all positions are treated equally.

import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import CareerPositionsSection from "@/components/landing/CareerPositionsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PricingPreviewSection from "@/components/landing/PricingPreviewSection";
import WaitlistSection from "@/components/landing/WaitlistSection";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "AI Career Roadmaps — Build your future AI career",
  description:
    "Choose a role, follow a structured learning path, build real portfolio projects, and track your progress step by step.",
};

export default function LandingPage() {
  return (
    <>
      <Header />

      <main>
        <HeroSection />
        <CareerPositionsSection />
        <HowItWorksSection />
        <PricingPreviewSection />
        <WaitlistSection />
      </main>

      <Footer />
    </>
  );
}
