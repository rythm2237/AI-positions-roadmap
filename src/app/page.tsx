// src/app/page.tsx
// AI Career OS — Landing page.
//
// Architecture:
//   The Opening Scene is the entire first experience.
//   It is a 3D world, not a hero section.
//   The user enters the world before they see anything else.
//
//   Below the Opening Scene, the rest of the product is discovered by scrolling.
//   The Header floats transparently above the world and materialises on scroll.

import type { Metadata } from "next";
import Header from "@/components/landing/Header";
import OpeningScene from "@/components/opening-scene/OpeningScene";
import CareerPositionsSection from "@/components/landing/CareerPositionsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PricingPreviewSection from "@/components/landing/PricingPreviewSection";
import WaitlistSection from "@/components/landing/WaitlistSection";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: {
    default: "AI Career OS — Your Personal AI Career Operating System",
    template: "%s | AI Career OS",
  },
  description:
    "Discover your perfect AI career, follow a structured roadmap, build real portfolio projects, and become job-ready — guided by intelligent AI every step of the way.",
  keywords: [
    "AI career",
    "machine learning career",
    "AI roadmap",
    "AI Engineer path",
    "LLM Engineer",
    "MLOps",
    "AI Product Manager",
    "career operating system",
  ],
  openGraph: {
    title: "AI Career OS — Your Personal AI Career Operating System",
    description: "Discover, plan, and build your AI career with intelligent guidance.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Career OS",
    description: "The world's first AI Career Operating System.",
  },
  robots: { index: true, follow: true },
};

export default function LandingPage() {
  return (
    <>
      {/*
        Header floats transparently inside the Opening Scene world.
        It does not sit above the world — it belongs to it.
        It materialises (glass) only after the user scrolls past the Opening Scene.
      */}
      <Header />

      <main>
        {/*
          The Opening Scene — the entire first screen.
          This is not a hero section. This is the product itself.
          A 3D Career Network world that the user enters.
        */}
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
