"use client";
// src/components/opening-scene/OpeningScene.tsx
//
// ─── OPENING SCENE — ROOT ENTRY POINT ────────────────────────────────────
//
// This is the only import page.tsx needs from the opening-scene folder.
// Everything else is encapsulated inside World.
//
// Responsibilities:
//   • 100dvh container — the entire first screen
//   • Accessibility: role="main" region with aria-label
//   • Keyboard: skip-to-content link for screen readers
//   • Reduced motion: handled inside World via MotionConfig
//   • Mobile: the Canvas scales to any viewport size
//
// This component intentionally has no visual logic of its own.
// It is a clean boundary between the Opening Scene and the rest of the page.

import dynamic from "next/dynamic";

// Dynamic import with no SSR — Three.js requires browser APIs (WebGL, window).
// The loading state is the dark background — no flash of unstyled content.
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
