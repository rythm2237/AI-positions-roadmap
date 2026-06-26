"use client";
// src/components/opening-scene/OpeningScene.tsx
//
// Root entry point for the Career Universe.
// This is the ONLY file page.tsx imports from the opening-scene folder.
// Everything else (World, SceneContext, HeroContent, TransitionController)
// is encapsulated inside World via dynamic import.
//
// Dynamic import with ssr:false is REQUIRED — Three.js needs browser APIs.

import dynamic from "next/dynamic";

const World = dynamic(() => import("./World"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        background: "#03050e",
      }}
      aria-hidden="true"
    />
  ),
});

export default function OpeningScene() {
  return (
    <section
      aria-label="AI Career OS — Career Network"
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      {/* Skip to content — keyboard accessibility */}
      <a
        href="#roadmaps"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to careers
      </a>

      <World />
    </section>
  );
}
