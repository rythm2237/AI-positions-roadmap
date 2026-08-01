
"use client";
// src/components/opening-scene/SceneContext.tsx — v6
//
// Single source of truth for the Career Universe state.

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";

export type ScenePhase =
  | "idle"
  | "activating"
  | "travelling"
  | "arrived"
  | "exploring";

export const CAREER_UNIVERSE_PHASE_EVENT = "ai-career-universe-phase";

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
  travelTo: (node: CareerNode) => void;
  nodes: CareerNode[];
  setNodes: (nodes: CareerNode[]) => void;
  activationTime: React.MutableRefObject<number>;
}

const SceneContext = createContext<SceneContextValue | null>(null);

export function SceneProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<ScenePhase>("idle");
  const [mouseNorm, setMouseNorm] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<CareerNode[]>([]);
  const [destination, setDestination] = useState<CareerNode | null>(null);
  const activationTime = useRef<number>(0);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent<ScenePhase>(CAREER_UNIVERSE_PHASE_EVENT, {
        detail: phase,
      })
    );
  }, [phase]);

  const activate = useCallback(() => {
    activationTime.current = performance.now();
    setPhase("activating");
  }, []);

  const advance = useCallback((p: ScenePhase) => {
    setPhase(p);
  }, []);

  const travelTo = useCallback((node: CareerNode) => {
    setDestination(node);
    activationTime.current = performance.now();
    setPhase("travelling");
  }, []);

  return (
    <SceneContext.Provider
      value={{
        phase,
        activate,
        advance,
        mouseNorm,
        setMouseNorm,
        hoveredNodeId,
        setHoveredNodeId,
        destination,
        setDestination,
        travelTo,
        nodes,
        setNodes,
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
