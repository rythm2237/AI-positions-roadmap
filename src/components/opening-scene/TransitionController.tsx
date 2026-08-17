"use client";

// Career Universe phase controller.
// After the user enters the Universe, the camera keeps touring career nodes:
// travel → settle → show the node name for a short pause → travel again.
// The ambient tour stops as soon as the user opens Explore Careers or chooses
// a node to enter.

import { useEffect, useRef } from "react";
import { useScene } from "./SceneContext";

const ACTIVATE_MS = 900;
const TRAVEL_MS = 2920;
const ARRIVAL_SETTLE_MS = 620;
const AUTO_TOUR_PAUSE_MS = 2600;
const AUTOTOUR_STOP_EVENT = "ai-career-autotour-stop";
const CAREER_ENTRY_EVENT = "ai-career-node-entry";

export default function TransitionController() {
  const { phase, advance, nodes, destination, travelTo } = useScene();
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const autoTourEnabledRef = useRef(true);

  useEffect(() => {
    function stopAutoTour() {
      autoTourEnabledRef.current = false;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    }

    window.addEventListener(AUTOTOUR_STOP_EVENT, stopAutoTour);
    window.addEventListener(CAREER_ENTRY_EVENT, stopAutoTour);
    return () => {
      window.removeEventListener(AUTOTOUR_STOP_EVENT, stopAutoTour);
      window.removeEventListener(CAREER_ENTRY_EVENT, stopAutoTour);
    };
  }, []);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (phase === "activating") {
      timersRef.current.push(setTimeout(() => advance("travelling"), ACTIVATE_MS));
    } else if (phase === "travelling") {
      timersRef.current.push(setTimeout(() => advance("arrived"), TRAVEL_MS));
    } else if (phase === "arrived") {
      timersRef.current.push(setTimeout(() => advance("exploring"), ARRIVAL_SETTLE_MS));
    } else if (phase === "exploring" && autoTourEnabledRef.current && nodes.length > 1) {
      timersRef.current.push(setTimeout(() => {
        if (!autoTourEnabledRef.current) return;
        const currentIndex = destination
          ? nodes.findIndex((node) => node.id === destination.id)
          : -1;
        const nextIndex = currentIndex >= 0
          ? (currentIndex + 1) % nodes.length
          : 0;
        const nextNode = nodes[nextIndex];
        if (nextNode) travelTo(nextNode);
      }, AUTO_TOUR_PAUSE_MS));
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [phase, advance, nodes, destination, travelTo]);

  return null;
}
