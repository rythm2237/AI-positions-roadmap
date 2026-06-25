// src/app/page.tsx
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import CareerPositionsSection from "@/components/landing/CareerPositionsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PricingPreviewSection from "@/components/landing/PricingPreviewSection";
import WaitlistSection from "@/components/landing/WaitlistSection";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "AI Career OS — Build Your Future AI Career",
  description:
    "The personal AI Career Operating System. Explore AI roles, follow structured roadmaps, build a portfolio, and become job-ready with AI-powered guidance.",
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
