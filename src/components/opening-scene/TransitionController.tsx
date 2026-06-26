
"use client";
// src/components/opening-scene/TransitionController.tsx — v6
//
// Drives ONLY the timed phase transitions that require no user input.
//
// Sequence:
//   activating → 900ms  → travelling
//   travelling → 3000ms → arrived    (matches TRAVEL_DURATION in World.tsx)
//   arrived    → 600ms  → exploring  (let arrival animation play)
//
// What this controller does NOT do:
//   • Does NOT advance to "complete" — that phase is removed.
//   • Does NOT scroll the page.
//   • Does NOT trigger navigation.
//
// The "exploring" phase is permanent until the user clicks another node,
// which calls travelTo() → sets destination → phase = "travelling" again.
// This cycle can repeat indefinitely. The user is never forced to leave.

import { useEffect, useRef } from "react";
import { useScene } from "./SceneContext";

export default function TransitionController() {
  const { phase, advance } = useScene();
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Clear any pending timers from previous phase
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (phase === "activating") {
      // Camera pulls back, world reacts, then begin travel
      timersRef.current.push(setTimeout(() => advance("travelling"), 900));
    }

    if (phase === "travelling") {
      // Travel duration (3000ms ≈ TRAVEL_DURATION + small buffer) then arrive
      timersRef.current.push(setTimeout(() => advance("arrived"), 3000));
    }

    if (phase === "arrived") {
      // Let the arrival animation settle, then enter free exploration
      timersRef.current.push(setTimeout(() => advance("exploring"), 600));
    }

    // "exploring" has no timer — permanent until user action.

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [phase, advance]);

  return null;
}
