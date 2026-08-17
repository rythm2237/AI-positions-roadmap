"use client";

// Career Universe phase controller.
// The first entry keeps the cinematic reveal:
// activating -> travelling -> arrived -> exploring.
// Once exploring begins, ThreeScene owns one continuous orbital cruise. We do
// not re-enter travelling for every Career node, which prevents repeated
// zoom-out / zoom-in camera resets after the first reveal.

import { useEffect, useRef } from "react";
import { useScene } from "./SceneContext";

const ACTIVATE_MS = 900;
const INITIAL_TRAVEL_MS = 2920;
const INITIAL_ARRIVAL_MS = 720;

export default function TransitionController() {
  const { phase, advance } = useScene();
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (phase === "activating") {
      timersRef.current.push(setTimeout(() => advance("travelling"), ACTIVATE_MS));
    } else if (phase === "travelling") {
      timersRef.current.push(setTimeout(() => advance("arrived"), INITIAL_TRAVEL_MS));
    } else if (phase === "arrived") {
      timersRef.current.push(setTimeout(() => advance("exploring"), INITIAL_ARRIVAL_MS));
    }

    // exploring is intentionally timer-free. The WebGL scene advances along a
    // constant-speed closed curve and handles the short planet-side pauses.

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [phase, advance]);

  return null;
}
