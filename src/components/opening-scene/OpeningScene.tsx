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
      id="career-universe"
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
        href="#universe-utilities"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to universe controls
      </a>

      <World />
      <div
        id="universe-utilities"
        className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 hidden items-center justify-end gap-4 px-6 py-4 text-[11px] text-slate-500 sm:flex"
      >
        <span>Public Beta · Multiple career journeys available</span>
        <span>Career progress is stored in this browser</span>
      </div>
    </section>
  );
}
