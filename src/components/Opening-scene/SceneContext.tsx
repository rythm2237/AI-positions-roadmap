
"use client";
// src/components/opening-scene/SceneContext.tsx — v6
//
// Single source of truth for the Career Universe state.
//
// Phase machine:
//   idle       → universe breathes, camera drifts, nodes pulse
//   activating → CTA clicked, world reacts, camera pulls back
//   travelling → camera journeys to destination node
//   arrived    → camera settles, career preview appears
//   exploring  → user is free: drag to look, hover, click nodes to travel
//
// "complete" phase is REMOVED. The universe never exits automatically.
// The user leaves only by clicking "Open Roadmap" in the career preview.
//
// Travel is repeatable:
//   exploring → travelTo(node) → travelling → arrived → exploring → …

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";

export type ScenePhase =
  | "idle"
  | "activating"
  | "travelling"
  | "arrived"
  | "exploring";

export interface CareerNode {
  id: string;
  title: string;
  category: string;
  status: "available" | "coming-soon";
  position: [number, number, number];
  connections: string[];
}

interface SceneContextValue {
  phase: ScenePhase;
  activate: () => void;
  advance: (p: ScenePhase) => void;

  mouseNorm: { x: number; y: number };
  setMouseNorm: (v: { x: number; y: number }) => void;

  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;

  destination: CareerNode | null;
  setDestination: (node: CareerNode | null) => void;

  // travelTo: called when user clicks a node or selects from nav panel.
  // Triggers a new travel sequence from wherever the camera currently is.
  travelTo: (node: CareerNode) => void;

  nodes: CareerNode[];
  setNodes: (nodes: CareerNode[]) => void;

  activationTime: React.MutableRefObject<number>;
}

const SceneContext = createContext<SceneContextValue | null>(null);

export function SceneProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase]               = useState<ScenePhase>("idle");
  const [mouseNorm, setMouseNorm]       = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [nodes, setNodes]               = useState<CareerNode[]>([]);
  const [destination, setDestination]   = useState<CareerNode | null>(null);
  const activationTime                  = useRef<number>(0);

  const activate = useCallback(() => {
    activationTime.current = performance.now();
    setPhase("activating");
  }, []);

  const advance = useCallback((p: ScenePhase) => {
    setPhase(p);
  }, []);

  // travelTo: user has chosen a new destination.
  // Sets the destination and begins a fresh travel sequence.
  const travelTo = useCallback((node: CareerNode) => {
    setDestination(node);
    activationTime.current = performance.now();
    setPhase("travelling");
  }, []);

  return (
    <SceneContext.Provider
      value={{
        phase, activate, advance,
        mouseNorm, setMouseNorm,
        hoveredNodeId, setHoveredNodeId,
        destination, setDestination,
        travelTo,
        nodes, setNodes,
        activationTime,
      }}
    >
      {children}
    </SceneContext.Provider>
  );
}

export function useScene() {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error("useScene must be used inside <SceneProvider>");
  return ctx;
}
