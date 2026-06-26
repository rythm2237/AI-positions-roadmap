"use client";
// src/components/opening-scene/TransitionController.tsx
//
// ─── PRODUCT INFRASTRUCTURE — ACTIVATION SEQUENCE ────────────────────────
//
// Orchestrates the timed sequence that happens when the user clicks the CTA.
// This component has no visual output — it is a pure controller.
//
// Sequence:
//   t=0ms    CTA clicked → phase becomes "activating" (set in HeroContent)
//   t=0ms    NeuralNetwork begins cascade illumination (driven by phase)
//   t=0ms    AmbientEnvironment lights boost intensity (driven by phase)
//   t=0ms    CameraRig begins slow forward zoom (driven by phase)
//   t=1200ms phase advances to "travelling" → camera accelerates
//   t=1800ms HeroContent triggers router.push (in HeroContent useEffect)
//
// Why a separate component:
//   The timing logic is isolated here so it can be extended without touching
//   the visual components. As the product grows, this controller will handle
//   deeper transitions: career selection, roadmap entry, dashboard navigation.

import { useEffect, useRef } from "react";
import { useScene } from "./SceneContext";

export default function TransitionController() {
  const { phase, advance } = useScene();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (phase === "activating") {
      // After world reacts for 1.2s, advance to travelling
      timerRef.current = setTimeout(() => {
        advance("travelling");
      }, 1200);
    }

    if (phase === "complete") {
      // Clean up — nothing to do here; navigation is handled in HeroContent
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, advance]);

  // Pure controller — no visual output
  return null;
}
