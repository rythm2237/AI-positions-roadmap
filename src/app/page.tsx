// src/app/page.tsx
// Landing page — composes all section components.
// This is a Server Component by default (Next.js App Router).
// WaitlistSection is a Client Component and is imported normally — Next.js handles the boundary.

import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import CareerPositionsSection from "@/components/landing/CareerPositionsSection";
import FeaturedRoadmapPreview from "@/components/landing/FeaturedRoadmapPreview";
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
        <FeaturedRoadmapPreview />
        <HowItWorksSection />
        <PricingPreviewSection />
        <WaitlistSection />
      </main>

      <Footer />
    </>
  );
}
