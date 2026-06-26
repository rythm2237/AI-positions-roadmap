"use client";
// src/components/opening-scene/SceneContext.tsx
//
// ─── PRODUCT INFRASTRUCTURE — NOT A PAGE COMPONENT ────────────────────────
//
// Global state shared across every layer of the Opening Scene and, in future,
// the full interactive Career Network. This context is the single source of
// truth for:
//
//   • Scene phase    — drives the activation sequence
//   • Mouse position — drives camera parallax across the whole world
//   • Hovered node   — drives focus state in NeuralNetwork and HeroContent
//   • Selected node  — drives future deep-link / career detail panel
//
// Architecture note:
//   This context is intentionally decoupled from any specific page or route.
//   As the product grows, the same SceneProvider can wrap the Career Network
//   page, the Dashboard, and any future interactive map — not just the
//   Opening Scene.

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";

// ─── Phase machine ────────────────────────────────────────────────────────────
//
// idle        → world breathes, camera drifts, user has not interacted
// activating  → CTA clicked — world begins to react (cascade, glow)
// travelling  → camera accelerates, connections illuminate, particles stream
// complete    → navigation triggered
//
export type ScenePhase =
  | "idle"
  | "activating"
  | "travelling"
  | "complete";

// ─── Career node — the atomic unit of the Career Network ─────────────────────
//
// Each CareerNode maps 1:1 to a real CareerPosition from careerRoadmaps.ts.
// The 3D position is computed by the network layout algorithm in
// NeuralNetwork.tsx and stored here so other components (HeroContent,
// TransitionController) can reference it without re-computing.
//
export interface CareerNode {
  id: string;           // matches CareerPosition.id
  title: string;        // matches CareerPosition.title
  category: string;     // matches CareerPosition.category
  status: "available" | "coming-soon";
  position: [number, number, number]; // 3D world position
  connections: string[]; // ids of connected nodes
}

interface SceneContextValue {
  // Phase
  phase: ScenePhase;
  activate: () => void;
  advance: (p: ScenePhase) => void;

  // Mouse (normalised -1..1)
  mouseNorm: { x: number; y: number };
  setMouseNorm: (v: { x: number; y: number }) => void;

  // Node interaction
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;

  // Network data (set once on mount by NeuralNetwork)
  nodes: CareerNode[];
  setNodes: (nodes: CareerNode[]) => void;

  // Activation timestamp — used by NeuralNetwork to stagger the cascade
  activationTime: React.MutableRefObject<number>;
}

const SceneContext = createContext<SceneContextValue | null>(null);

export function SceneProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<ScenePhase>("idle");
  const [mouseNorm, setMouseNorm] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<CareerNode[]>([]);
  const activationTime = useRef<number>(0);

  const activate = useCallback(() => {
    activationTime.current = performance.now();
    setPhase("activating");
  }, []);

  const advance = useCallback((p: ScenePhase) => {
    setPhase(p);
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
        selectedNodeId,
        setSelectedNodeId,
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
