
"use client";
// src/components/opening-scene/World.tsx — v6
//
// ROOT CAUSE FIX: framer-motion removed entirely.
// framer-motion v11 calls React hooks (useId, useInsertionEffect) at module
// import time. When next/dynamic loads this chunk lazily, those hooks run
// outside a render cycle → "Invalid hook call". Fix: pure CSS transitions.
//
// INTERACTION MODEL:
//   idle       → Universe breathes. Mouse parallax. CTA visible.
//   activating → CTA clicked. Camera pulls back. Universe reacts.
//   travelling → Camera journeys to destination node.
//   arrived    → Camera settles. Career preview appears.
//   exploring  → User is free. Orbital drag. Hover labels. Click nodes.
//                Navigation panel visible. No automatic exit. Ever.
//
// NAVIGATION:
//   • Career Navigation Panel (left sidebar / mobile bottom sheet)
//   • Direct node click via raycasting on instanced mesh
//   • Free orbital drag — hold and drag to look around
//
// PERFORMANCE:
//   • LOD: nodes >120 units from camera rendered at scale=0
//   • Instanced rendering: all named nodes in one InstancedMesh draw call
//   • Dynamic connections: only dest connections are bright; rest dim
//   • Particle pool: 130 fixed instances reassigned when they reach end
//   • Pixel ratio capped at 2 to prevent 3x/4x renders on HiDPI
//   • Delta time capped at 50ms to prevent spiral-of-death on tab restore

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SceneProvider, useScene, CareerNode } from "./SceneContext";
import HeroContent from "./HeroContent";
import TransitionController from "./TransitionController";

// ─── Seeded deterministic RNG ─────────────────────────────────────────────────
function seededRng(seed: number) {
  let s = seed | 0;
  return () => {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── Universe registry ────────────────────────────────────────────────────────
// Every entry here becomes a named, reachable career node in the universe.
// Add new careers here — they appear in the world and navigation panel automatically.
export const UNIVERSE_REGISTRY: {
  id: string;
  title: string;
  category: string;
  status: "available" | "coming-soon";
  sectorKey: string;
  roadmapSlug?: string;
}[] = [
  // ── Near field ───────────────────────────────────────────────────────────
  { id: "ai-engineer",            title: "AI Engineer",              category: "Engineering",    status: "coming-soon", sectorKey: "near-centre"    },
  { id: "ml-engineer",            title: "ML Engineer",              category: "Engineering",    status: "coming-soon", sectorKey: "near-centre"    },
  { id: "prompt-engineer",        title: "Prompt Engineer",          category: "Engineering",    status: "coming-soon", sectorKey: "near-left"      },
  { id: "ai-automation-specialist", title: "AI Automation Specialist", category: "Automation", status: "available",    sectorKey: "near-left",     roadmapSlug: "ai-automation-specialist" },
  { id: "no-code-ai",             title: "No-Code AI Builder",       category: "Automation",    status: "coming-soon", sectorKey: "near-right"     },
  { id: "ai-product-manager",     title: "AI Product Manager",       category: "Product",       status: "coming-soon", sectorKey: "near-top"       },
  { id: "ai-ux-designer",         title: "AI UX Designer",           category: "Design",        status: "coming-soon", sectorKey: "near-top"       },
  { id: "ai-business-analyst",    title: "AI Business Analyst",      category: "Business",      status: "coming-soon", sectorKey: "near-bottom"    },
  { id: "ai-consultant",          title: "AI Consultant",            category: "Business",      status: "coming-soon", sectorKey: "near-bottom"    },
  // ── Mid field ────────────────────────────────────────────────────────────
  { id: "ai-content-creator",     title: "AI Content Creator",       category: "Content",       status: "coming-soon", sectorKey: "mid-top-far"    },
  { id: "ai-marketing-specialist",title: "AI Marketing Specialist",  category: "Marketing",     status: "coming-soon", sectorKey: "mid-left-far"   },
  { id: "ai-sales-specialist",    title: "AI Sales Specialist",      category: "Sales",         status: "coming-soon", sectorKey: "mid-right-far"  },
  { id: "ai-support-specialist",  title: "AI Support Specialist",    category: "Support",       status: "coming-soon", sectorKey: "mid-right-far"  },
  { id: "ai-agent-developer",     title: "AI Agent Developer",       category: "Engineering",   status: "coming-soon", sectorKey: "mid-bottom-far" },
  { id: "ai-workflow-engineer",   title: "AI Workflow Engineer",     category: "Automation",    status: "coming-soon", sectorKey: "mid-bottom-far" },
  { id: "data-scientist",         title: "Data Scientist",           category: "Data",          status: "coming-soon", sectorKey: "mid-deep"       },
  { id: "ai-data-engineer",       title: "AI Data Engineer",         category: "Data",          status: "coming-soon", sectorKey: "mid-deep"       },
  // ── Deep field ───────────────────────────────────────────────────────────
  { id: "ml-ops-engineer",        title: "MLOps Engineer",           category: "Engineering",   status: "coming-soon", sectorKey: "deep-mlops"     },
  { id: "llm-engineer",           title: "LLM Engineer",             category: "Engineering",   status: "coming-soon", sectorKey: "deep-llm"       },
  { id: "ai-architect",           title: "AI Architect",             category: "Architecture",  status: "coming-soon", sectorKey: "deep-arch"      },
  { id: "ai-solutions-architect", title: "AI Solutions Architect",   category: "Architecture",  status: "coming-soon", sectorKey: "deep-arch"      },
  { id: "ai-researcher",          title: "AI Researcher",            category: "Research",      status: "coming-soon", sectorKey: "deep-research"  },
  { id: "computer-vision-engineer",title:"Computer Vision Engineer", category: "Engineering",   status: "coming-soon", sectorKey: "deep-vision"    },
  { id: "ai-security-engineer",   title: "AI Security Engineer",     category: "Security",      status: "coming-soon", sectorKey: "deep-security"  },
  { id: "robotics-ai-engineer",   title: "Robotics AI Engineer",     category: "Robotics",      status: "coming-soon", sectorKey: "deep-robotics"  },
  { id: "ai-infrastructure-engineer", title: "AI Infrastructure Engineer", category: "Infrastructure", status: "coming-soon", sectorKey: "deep-infra" },
  { id: "generative-ai-engineer", title: "Generative AI Engineer",   category: "Engineering",   status: "coming-soon", sectorKey: "deep-ml"        },
  { id: "ai-developer",           title: "AI Developer",             category: "Engineering",   status: "coming-soon", sectorKey: "deep-ml"        },
  { id: "ai-developer-advocate",  title: "AI Developer Advocate",    category: "Community",     status: "coming-soon", sectorKey: "deep-data"      },
  { id: "ai-ethicist",            title: "AI Ethicist",              category: "Research",      status: "coming-soon", sectorKey: "deep-research"  },
];

// ─── Sector definitions ───────────────────────────────────────────────────────
export const SECTORS: Record<string, {
  centre: [number, number, number];
  spread: [number, number, number];
  color: string;
  label: string;
}> = {
  "near-centre":    { centre: [  0,   0,   4], spread: [12, 8, 10], color: "#818cf8", label: "AI Core"           },
  "near-left":      { centre: [-28,   4,  18], spread: [10, 6,  8], color: "#6366f1", label: "Automation"        },
  "near-right":     { centre: [ 32,  -2,  14], spread: [10, 6,  8], color: "#8b5cf6", label: "No-Code"           },
  "near-top":       { centre: [  4,  22,  10], spread: [ 8, 5,  8], color: "#a78bfa", label: "Product & Design"  },
  "near-bottom":    { centre: [ -6, -20,  12], spread: [ 8, 5,  8], color: "#22d3ee", label: "Business"          },
  "mid-left-far":   { centre: [-55,   8,  -8], spread: [12, 7, 10], color: "#c084fc", label: "Marketing"         },
  "mid-right-far":  { centre: [ 58,  -5,  -6], spread: [12, 7, 10], color: "#38bdf8", label: "Sales & Support"   },
  "mid-top-far":    { centre: [ 10,  38, -12], spread: [10, 6,  8], color: "#34d399", label: "Content"           },
  "mid-bottom-far": { centre: [ -8, -35, -10], spread: [10, 6,  8], color: "#f472b6", label: "AI Agents"         },
  "mid-deep":       { centre: [  0,   0, -22], spread: [16, 10,12], color: "#60a5fa", label: "Data"              },
  "deep-ml":        { centre: [ 70,  14, -55], spread: [14, 8, 12], color: "#818cf8", label: "ML Engineering"    },
  "deep-data":      { centre: [-72,   8, -52], spread: [14, 8, 12], color: "#a5b4fc", label: "Data Science"      },
  "deep-research":  { centre: [  0,  55, -80], spread: [12, 8, 10], color: "#7c3aed", label: "AI Research"       },
  "deep-vision":    { centre: [ 85, -18, -70], spread: [12, 7, 10], color: "#06b6d4", label: "Computer Vision"   },
  "deep-llm":       { centre: [-80,  20, -65], spread: [12, 7, 10], color: "#8b5cf6", label: "LLM Engineering"   },
  "deep-mlops":     { centre: [ 55,   5,-110], spread: [14, 8, 12], color: "#10b981", label: "MLOps"             },
  "deep-arch":      { centre: [-55,  12,-105], spread: [14, 8, 12], color: "#f59e0b", label: "Architecture"      },
  "deep-security":  { centre: [  0, -50, -95], spread: [12, 7, 10], color: "#ef4444", label: "AI Security"       },
  "deep-robotics":  { centre: [110,   0, -85], spread: [12, 7, 10], color: "#84cc16", label: "Robotics"          },
  "deep-infra":     { centre: [-110,  0, -90], spread: [12, 7, 10], color: "#fb923c", label: "Infrastructure"    },
};

const SECTOR_LINKS: [string, string][] = [
  ["near-centre","near-left"],["near-centre","near-right"],
  ["near-centre","near-top"],["near-centre","near-bottom"],
  ["near-centre","mid-deep"],["near-left","mid-left-far"],
  ["near-right","mid-right-far"],["near-top","mid-top-far"],
  ["near-bottom","mid-bottom-far"],["mid-deep","deep-ml"],
  ["mid-deep","deep-data"],["mid-left-far","deep-data"],
  ["mid-right-far","deep-ml"],["mid-top-far","deep-research"],
  ["mid-bottom-far","deep-llm"],["deep-ml","deep-mlops"],
  ["deep-ml","deep-vision"],["deep-data","deep-research"],
  ["deep-llm","deep-arch"],["deep-mlops","deep-arch"],
  ["deep-vision","deep-robotics"],["deep-arch","deep-security"],
  ["deep-security","deep-infra"],["deep-infra","deep-robotics"],
];

// ─── Build universe layout ────────────────────────────────────────────────────
function buildUniverseLayout(): CareerNode[] {
  const nodes: CareerNode[] = [];
  const positionMap: Record<string, [number, number, number]> = {};

  UNIVERSE_REGISTRY.forEach((entry, idx) => {
    const sector = SECTORS[entry.sectorKey];
    if (!sector) return;
    const rng = seededRng(idx * 7919 + entry.id.charCodeAt(0) * 31);
    const spread = sector.spread;
    const pos: [number, number, number] = [
      sector.centre[0] + (rng() - 0.5) * 2 * spread[0],
      sector.centre[1] + (rng() - 0.5) * 2 * spread[1],
      sector.centre[2] + (rng() - 0.5) * 2 * spread[2],
    ];
    positionMap[entry.id] = pos;
    nodes.push({
      id: entry.id,
      title: entry.title,
      category: entry.category,
      status: entry.status,
      position: pos,
      connections: [],
    });
  });

  // Build connections: connect careers in same sector + cross-sector links
  nodes.forEach((node) => {
    const myEntry = UNIVERSE_REGISTRY.find((e) => e.id === node.id);
    if (!myEntry) return;
    const sameSecNodes = nodes.filter((n) => {
      const e = UNIVERSE_REGISTRY.find((r) => r.id === n.id);
      return e && e.sectorKey === myEntry.sectorKey && n.id !== node.id;
    });
    sameSecNodes.forEach((n) => {
      if (!node.connections.includes(n.id)) node.connections.push(n.id);
      if (!n.connections.includes(node.id)) n.connections.push(node.id);
    });
  });

  return nodes;
}

// ─── Ambient fill positions ───────────────────────────────────────────────────
function buildAmbientPositions(): Float32Array {
  const rng = seededRng(42);
  const count = 220;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3  ] = (rng()-0.5)*320;
    pos[i*3+1] = (rng()-0.5)*160;
    pos[i*3+2] = rng()*-220 + 20;
  }
  return pos;
}

function buildStarField(scene: THREE.Scene) {
  const rng = seededRng(99);
  const count = 1400;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = rng() * Math.PI * 2;
    const phi   = Math.acos(2 * rng() - 1);
    const r     = 140 + rng() * 200;
    pos[i*3  ] = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = r * Math.cos(phi);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.28, sizeAttenuation: true, transparent: true, opacity: 0.55 });
  const stars = new THREE.Points(geo, mat);
  stars.frustumCulled = false;
  scene.add(stars);
}

// ─── CSS-only transition helpers (replaces framer-motion) ────────────────────
// All UI panels use inline style transitions — zero dependency on framer-motion.
const TRANSITION_BASE = "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1), filter 0.6s cubic-bezier(0.22,1,0.36,1)";

// ─── Vignette overlay ─────────────────────────────────────────────────────────
function VignetteOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(3,5,14,0.72) 100%)",
      }}
    />
  );
}

// ─── Explore hint ─────────────────────────────────────────────────────────────
function ExploreHint() {
  const { phase } = useScene();
  const visible = phase === "exploring";
  return (
    <div
      aria-live="polite"
      style={{
        position: "absolute", bottom: 32, left: "50%",
        transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(12px)",
        opacity: visible ? 1 : 0,
        filter: visible ? "blur(0)" : "blur(4px)",
        transition: TRANSITION_BASE,
        zIndex: 20, pointerEvents: "none",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      }}
    >
      <p style={{ color: "rgba(165,180,252,0.7)", fontSize: 13, letterSpacing: "0.08em", fontFamily: "inherit" }}>
        Drag to look around · Click any node to travel
      </p>
      <div style={{ width: 1, height: 32, background: "linear-gradient(to bottom, rgba(99,102,241,0.5), transparent)" }} />
    </div>
  );
}

// ─── Hover label ─────────────────────────────────────────────────────────────
interface HoverLabelProps { node: CareerNode | null; screenPos: { x: number; y: number }; }
function HoverLabel({ node, screenPos }: HoverLabelProps) {
  const entry = node ? UNIVERSE_REGISTRY.find((e) => e.id === node.id) : null;
  const visible = !!node;
  return (
    <div
      aria-live="polite"
      style={{
        position: "absolute",
        left: screenPos.x + 16,
        top: screenPos.y - 12,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.92)",
        filter: visible ? "blur(0)" : "blur(4px)",
        transition: "opacity 0.25s ease, transform 0.25s ease, filter 0.25s ease",
        pointerEvents: "none", zIndex: 30,
        background: "rgba(3,5,14,0.88)",
        border: "1px solid rgba(99,102,241,0.35)",
        borderRadius: 10, padding: "8px 14px",
        backdropFilter: "blur(12px)",
        boxShadow: "0 0 24px rgba(99,102,241,0.1)",
      }}
    >
      {node && (
        <>
          <p style={{ color: "#e0e7ff", fontSize: 13, fontWeight: 600, margin: 0, fontFamily: "inherit" }}>{node.title}</p>
          <p style={{ color: "rgba(165,180,252,0.6)", fontSize: 11, margin: "2px 0 0", fontFamily: "inherit" }}>{entry?.category}</p>
        </>
      )}
    </div>
  );
}

// ─── Career preview card ─────────────────────────────────────────────────────
function CareerPreviewCard() {
  const { phase, destination, travelTo, nodes } = useScene();
  const show = (phase === "arrived" || phase === "exploring") && destination !== null;
  const entry = destination ? UNIVERSE_REGISTRY.find((e) => e.id === destination.id) : null;

  function handleOpenRoadmap() {
    if (!entry?.roadmapSlug) { window.location.hash = "roadmaps"; return; }
    window.location.href = `/roadmaps/${entry.roadmapSlug}`;
  }

  const nearbyNode = destination && nodes.length > 0
    ? nodes.find((n) => n.id !== destination.id && destination.connections.includes(n.id))
    : null;

  return (
    <div
      role="dialog"
      aria-label={destination ? `Career preview: ${destination.title}` : undefined}
      aria-hidden={!show}
      style={{
        position: "absolute",
        right: "clamp(24px,4vw,60px)", top: "50%",
        transform: show ? "translateY(-50%) translateX(0)" : "translateY(-50%) translateX(40px)",
        opacity: show ? 1 : 0,
        filter: show ? "blur(0)" : "blur(12px)",
        transition: TRANSITION_BASE,
        zIndex: 25,
        width: "clamp(240px,28vw,320px)",
        background: "rgba(3,5,14,0.82)",
        border: "1px solid rgba(99,102,241,0.28)",
        borderRadius: 20, padding: "28px 24px",
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 60px rgba(99,102,241,0.12), 0 0 0 1px rgba(99,102,241,0.08)",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      {destination && entry && (
        <>
          {/* Sector badge */}
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
            color: SECTORS[entry.sectorKey]?.color ?? "#818cf8",
            textTransform: "uppercase", margin: "0 0 12px", fontFamily: "inherit",
          }}>
            {SECTORS[entry.sectorKey]?.label ?? entry.category}
          </p>
          {/* Title */}
          <h2 style={{ fontSize: "clamp(18px,2vw,22px)", fontWeight: 700, color: "#e0e7ff", margin: "0 0 8px", lineHeight: 1.2, fontFamily: "inherit" }}>
            {destination.title}
          </h2>
          {/* Category */}
          <p style={{ fontSize: 13, color: "rgba(165,180,252,0.65)", margin: "0 0 20px", fontFamily: "inherit" }}>
            {entry.category}
          </p>
          {/* Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: entry.status === "available" ? "#34d399" : "#6366f1",
              boxShadow: entry.status === "available" ? "0 0 8px #34d399" : "0 0 8px #6366f1",
            }} />
            <span style={{ fontSize: 12, color: "rgba(165,180,252,0.7)", fontFamily: "inherit" }}>
              {entry.status === "available" ? "Roadmap available" : "Coming soon"}
            </span>
          </div>
          {/* CTA */}
          <button
            onClick={handleOpenRoadmap}
            style={{
              width: "100%", padding: "12px 0",
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.4)",
              borderRadius: 12, color: "#a5b4fc",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "background 0.2s, border-color 0.2s",
              fontFamily: "inherit", marginBottom: nearbyNode ? 10 : 0,
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = "rgba(99,102,241,0.28)";
              (e.target as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.7)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = "rgba(99,102,241,0.15)";
              (e.target as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.4)";
            }}
          >
            {entry.status === "available" ? "Open Roadmap →" : "Join Waitlist →"}
          </button>
          {nearbyNode && (
            <button
              onClick={() => travelTo(nearbyNode)}
              style={{
                width: "100%", padding: "10px 0",
                background: "transparent", border: "none",
                color: "rgba(165,180,252,0.55)", fontSize: 12,
                cursor: "pointer", fontFamily: "inherit",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.color = "rgba(165,180,252,0.9)"; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.color = "rgba(165,180,252,0.55)"; }}
            >
              Explore nearby: {nearbyNode.title} →
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ─── Career navigation panel ──────────────────────────────────────────────────
interface NavPanelProps { allNodes: CareerNode[]; }
function CareerNavPanel({ allNodes }: NavPanelProps) {
  const { phase, travelTo, destination } = useScene();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const show = phase === "exploring" || phase === "arrived";

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Group nodes by sector
  const grouped = Object.entries(SECTORS).map(([key, sector]) => ({
    key, label: sector.label, color: sector.color,
    nodes: allNodes.filter((n) => {
      const entry = UNIVERSE_REGISTRY.find((e) => e.id === n.id);
      return entry?.sectorKey === key;
    }),
  })).filter((g) => g.nodes.length > 0);

  const panelStyle: React.CSSProperties = isMobile ? {
    // Mobile: bottom sheet
    position: "fixed", bottom: 0, left: 0, right: 0,
    height: isOpen ? "60vh" : 56,
    background: "rgba(3,5,14,0.92)",
    border: "1px solid rgba(99,102,241,0.18)",
    borderRadius: "20px 20px 0 0",
    backdropFilter: "blur(24px)",
    boxShadow: "0 -8px 40px rgba(0,0,0,0.4)",
    transition: "height 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease, transform 0.5s ease",
    opacity: show ? 1 : 0,
    transform: show ? "translateY(0)" : "translateY(100%)",
    zIndex: 40, overflow: "hidden", display: "flex", flexDirection: "column",
    pointerEvents: show ? "auto" : "none",
  } : {
    // Desktop: left sidebar
    position: "fixed", top: "50%", left: 24,
    transform: show ? "translateY(-50%)" : "translateY(-50%) translateX(-20px)",
    width: isOpen ? 280 : 48,
    maxHeight: "80vh",
    background: "rgba(3,5,14,0.82)",
    border: "1px solid rgba(99,102,241,0.14)",
    borderRadius: 20,
    backdropFilter: "blur(24px)",
    boxShadow: "0 0 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.06)",
    transition: "width 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease, transform 0.5s ease",
    opacity: show ? 1 : 0,
    zIndex: 40, overflow: "hidden", display: "flex", flexDirection: "column",
    pointerEvents: show ? "auto" : "none",
  };

  return (
    <div style={panelStyle} role="navigation" aria-label="Career Universe navigation">
      {/* Toggle / handle */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close career list" : "Open career list"}
        style={{
          flexShrink: 0,
          display: "flex", alignItems: "center",
          gap: 10, padding: isMobile ? "14px 20px" : "14px 12px",
          background: "transparent", border: "none", cursor: "pointer",
          color: "#a5b4fc", fontFamily: "inherit",
          borderBottom: isOpen ? "1px solid rgba(99,102,241,0.12)" : "none",
        }}
      >
        {/* Compass icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
        </svg>
        {(isOpen || isMobile) && (
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
            {isMobile ? (isOpen ? "AI Careers" : "Explore Careers") : "AI Careers"}
          </span>
        )}
        {isOpen && !isMobile && (
          <span style={{ marginLeft: "auto", fontSize: 18, color: "rgba(165,180,252,0.5)", lineHeight: 1 }}>×</span>
        )}
      </button>

      {/* Career list */}
      <div style={{ overflowY: "auto", flex: 1, padding: isOpen ? "8px 0 12px" : 0 }}>
        {isOpen && grouped.map((group) => (
          <div key={group.key}>
            {/* Sector header */}
            <button
              onClick={() => setExpandedSector((s) => s === group.key ? null : group.key)}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: 8, padding: "8px 16px",
                background: "transparent", border: "none", cursor: "pointer",
                color: group.color, fontFamily: "inherit", textAlign: "left",
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: group.color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", flex: 1 }}>
                {group.label}
              </span>
              <span style={{ fontSize: 12, color: "rgba(165,180,252,0.4)", transform: expandedSector === group.key ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
            </button>

            {/* Career items */}
            {(expandedSector === group.key || expandedSector === null) && group.nodes.map((node) => {
              const isActive = destination?.id === node.id;
              const entry = UNIVERSE_REGISTRY.find((e) => e.id === node.id);
              return (
                <button
                  key={node.id}
                  onClick={() => travelTo(node)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    gap: 10, padding: "7px 16px 7px 28px",
                    background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
                    border: "none", borderLeft: isActive ? `2px solid ${group.color}` : "2px solid transparent",
                    cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.07)"; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                    background: entry?.status === "available" ? "#34d399" : "rgba(99,102,241,0.5)",
                    boxShadow: entry?.status === "available" ? "0 0 6px #34d399" : "none",
                  }} />
                  <span style={{ fontSize: 12, color: isActive ? "#e0e7ff" : "rgba(165,180,252,0.75)", fontWeight: isActive ? 600 : 400, lineHeight: 1.3 }}>
                    {node.title}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Three.js scene ───────────────────────────────────────────────────────────
const TRAVEL_DURATION = 2800;
const CAM_START_Z     = 52;

type CameraBehavior = {
  name: string;
  run: (
    progress: number,
    startPos: THREE.Vector3,
    startTarget: THREE.Vector3,
    endPos: THREE.Vector3,
    endTarget: THREE.Vector3,
    camPos: THREE.Vector3,
    camTarget: THREE.Vector3,
  ) => void;
};

const CAMERA_BEHAVIORS: CameraBehavior[] = [
  {
    name: "smoothArc",
    run: (progress, startPos, startTarget, endPos, endTarget, camPos, camTarget) => {
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      camPos.lerpVectors(startPos, endPos, eased);
      camPos.x += Math.sin(eased * Math.PI) * 18;
      camPos.y += Math.sin(eased * Math.PI) * 6;
      camTarget.lerpVectors(startTarget, endTarget, eased);
    },
  },
  {
    name: "highDescend",
    run: (progress, startPos, startTarget, endPos, endTarget, camPos, camTarget) => {
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      camPos.lerpVectors(startPos, endPos, eased);
      camPos.y += (1 - eased) * 24;
      camPos.z += (1 - eased) * 16;
      camTarget.lerpVectors(startTarget, endTarget, eased);
    },
  },
  {
    name: "sideSweep",
    run: (progress, startPos, startTarget, endPos, endTarget, camPos, camTarget) => {
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      camPos.lerpVectors(startPos, endPos, eased);
      camPos.x += (eased - 0.5) * 32;
      camTarget.lerpVectors(startTarget, endTarget, eased);
      camTarget.x += (eased - 0.5) * 12;
    },
  },
  {
    name: "gentleOrbit",
    run: (progress, startPos, startTarget, endPos, endTarget, camPos, camTarget) => {
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      camPos.x = startPos.x + (endPos.x - startPos.x) * eased + Math.cos(eased * Math.PI * 2) * 12;
      camPos.y = startPos.y + (endPos.y - startPos.y) * eased + Math.sin(eased * Math.PI * 1.4) * 8;
      camPos.z = startPos.z + (endPos.z - startPos.z) * eased + Math.sin(eased * Math.PI * 2) * 10;
      camTarget.lerpVectors(startTarget, endTarget, eased);
    },
  },
  {
    name: "forwardFlyIn",
    run: (progress, startPos, startTarget, endPos, endTarget, camPos, camTarget) => {
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      camPos.lerpVectors(startPos, endPos, eased);
      camPos.z += (1 - eased) * 34;
      camPos.y += Math.sin(eased * Math.PI) * 3;
      camTarget.lerpVectors(startTarget, endTarget, eased);
    },
  },
  {
    name: "wideReveal",
    run: (progress, startPos, startTarget, endPos, endTarget, camPos, camTarget) => {
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      camPos.lerpVectors(startPos, endPos, eased);
      camPos.x += Math.sin(eased * Math.PI) * 10;
      camPos.y += Math.cos(eased * Math.PI * 0.5) * 8;
      camPos.z += (1 - eased) * 18;
      camTarget.lerpVectors(startTarget, endTarget, eased);
      camTarget.x += Math.sin(eased * Math.PI) * 6;
    },
  },
];

function ThreeScene() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    phase, mouseNorm, setMouseNorm,
    destination,
    setNodes, setDestination,
    hoveredNodeId, setHoveredNodeId,
    travelTo,
  } = useScene();

  const phaseRef          = useRef(phase);
  const mouseRef          = useRef(mouseNorm);
  const activationTimeRef = useRef(0);
  const travelToRef       = useRef(travelTo);
  const setHoveredRef     = useRef(setHoveredNodeId);
  const cameraRef         = useRef<THREE.PerspectiveCamera | null>(null);
  const camPosSmoothedRef = useRef(new THREE.Vector3());
  const camTargetSmoothedRef = useRef(new THREE.Vector3());
  const rebuildConnectionsRef = useRef<(node: CareerNode) => void>(() => {});

  const [hoveredNode, setHoveredNode]     = useState<CareerNode | null>(null);
  const [hoverScreenPos, setHoverScreenPos] = useState({ x: 0, y: 0 });
  const [allNodesState, setAllNodesState] = useState<CareerNode[]>([]);

  useEffect(() => { phaseRef.current = phase; },              [phase]);
  useEffect(() => { mouseRef.current = mouseNorm; },          [mouseNorm]);
  useEffect(() => { travelToRef.current = travelTo; },        [travelTo]);
  useEffect(() => { setHoveredRef.current = setHoveredNodeId; }, [setHoveredNodeId]);
  useEffect(() => {
    if (phase === "activating" || phase === "travelling") {
      activationTimeRef.current = performance.now();
    }
  }, [phase]);

  const allNodesRef   = useRef<CareerNode[]>([]);
  const destNodeRef   = useRef<CareerNode | null>(null);
  const destPosRef    = useRef(new THREE.Vector3());
  const destCamPosRef = useRef(new THREE.Vector3());
  const startCamPosRef = useRef(new THREE.Vector3());
  const startCamTargetRef = useRef(new THREE.Vector3());
  const activeCameraBehaviorRef = useRef<CameraBehavior | null>(null);
  const recentCameraBehaviorsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!destination) return;
    const node = destination;
    destNodeRef.current = node;
    destPosRef.current.set(...node.position);
    destCamPosRef.current.set(node.position[0], node.position[1] + 4, node.position[2] + 14);
    startCamPosRef.current.copy(camPosSmoothedRef.current);
    startCamTargetRef.current.copy(camTargetSmoothedRef.current);
    rebuildConnectionsRef.current(node);
  }, [destination]);

  const setHoveredNodeState = useCallback((node: CareerNode | null, sx: number, sy: number) => {
    setHoveredNode(node);
    setHoverScreenPos({ x: sx, y: sy });
    setHoveredRef.current(node?.id ?? null);
  }, []);

  // Orbital drag state — no hooks, plain mutable object
  const orbitRef = useRef({
    isDragging: false, startX: 0, startY: 0,
    lastX: 0, lastY: 0,
    yaw: 0, pitch: 0,
    dragDist: 0,
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;
    const w = container.clientWidth  || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#03050e");
    scene.fog = new THREE.FogExp2("#03050e", 0.0025);

    // ── Camera ─────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(58, w / h, 0.1, 600);
    camera.position.set(0, 0, CAM_START_Z);
    cameraRef.current = camera;

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // ── Stars ──────────────────────────────────────────────────────────────
    buildStarField(scene);

    // ── Named career nodes (instanced) ────────────────────────────────────
    const allNodes = buildUniverseLayout();
    allNodesRef.current = allNodes;
    setNodes(allNodes);
    setAllNodesState(allNodes);

    // Pick initial destination: a random deep-field node
    const deepNodes = allNodes.filter((n) => {
      const e = UNIVERSE_REGISTRY.find((r) => r.id === n.id);
      return e && e.sectorKey.startsWith("deep-");
    });
    const seed = Date.now() % deepNodes.length;
    const initDest = deepNodes[seed] ?? allNodes[0];
    destNodeRef.current = initDest;
    destPosRef.current.set(...initDest.position);
    destCamPosRef.current.set(
      initDest.position[0],
      initDest.position[1] + 4,
      initDest.position[2] + 14,
    );
    setDestination(initDest);

    const nodeCount = allNodes.length;
    const nodeGeo = new THREE.SphereGeometry(0.38, 10, 10);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });
    const instancedNodes = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
    instancedNodes.frustumCulled = false;
    const dummy = new THREE.Object3D();
    const nodeColors = new Float32Array(nodeCount * 3);

    allNodes.forEach((node, i) => {
      const entry = UNIVERSE_REGISTRY.find((e) => e.id === node.id);
      const sectorColor = entry ? (SECTORS[entry.sectorKey]?.color ?? "#818cf8") : "#818cf8";
      const c = new THREE.Color(sectorColor);
      nodeColors[i*3] = c.r; nodeColors[i*3+1] = c.g; nodeColors[i*3+2] = c.b;
      dummy.position.set(...node.position);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      instancedNodes.setMatrixAt(i, dummy.matrix);
      instancedNodes.setColorAt(i, c);
    });
    instancedNodes.instanceMatrix.needsUpdate = true;
    if (instancedNodes.instanceColor) instancedNodes.instanceColor.needsUpdate = true;
    scene.add(instancedNodes);

    // ── Ambient fill nodes ─────────────────────────────────────────────────
    const ambientPos = buildAmbientPositions();
    const ambCount = ambientPos.length / 3;
    const ambGeo = new THREE.SphereGeometry(0.12, 5, 5);
    const ambMat = new THREE.MeshBasicMaterial({ color: 0x4338ca, transparent: true, opacity: 0.45 });
    const ambInstanced = new THREE.InstancedMesh(ambGeo, ambMat, ambCount);
    ambInstanced.frustumCulled = false;
    for (let i = 0; i < ambCount; i++) {
      dummy.position.set(ambientPos[i*3], ambientPos[i*3+1], ambientPos[i*3+2]);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      ambInstanced.setMatrixAt(i, dummy.matrix);
    }
    ambInstanced.instanceMatrix.needsUpdate = true;
    scene.add(ambInstanced);

    // ── Connections ────────────────────────────────────────────────────────
    const dimConnGeo  = new THREE.BufferGeometry();
    const destConnGeo = new THREE.BufferGeometry();
    const dimConnMat  = new THREE.LineBasicMaterial({ color: 0x312e81, transparent: true, opacity: 0.18 });
    const destConnMat = new THREE.LineBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.65 });
    const dimConnLines  = new THREE.LineSegments(dimConnGeo, dimConnMat);
    const destConnLines = new THREE.LineSegments(destConnGeo, destConnMat);
    scene.add(dimConnLines); scene.add(destConnLines);

    function rebuildConnections(destNode: CareerNode) {
      const dimVerts: number[] = [];
      const destVerts: number[] = [];
      allNodesRef.current.forEach((node) => {
        node.connections.forEach((cid) => {
          const other = allNodesRef.current.find((n) => n.id === cid);
          if (!other) return;
          const isDest = node.id === destNode.id || other.id === destNode.id;
          const arr = isDest ? destVerts : dimVerts;
          arr.push(...node.position, ...other.position);
        });
      });
      dimConnGeo.setAttribute("position",  new THREE.Float32BufferAttribute(dimVerts,  3));
      destConnGeo.setAttribute("position", new THREE.Float32BufferAttribute(destVerts, 3));
    }
    rebuildConnectionsRef.current = rebuildConnections;
    rebuildConnections(initDest);

    // ── Sector spine lines ─────────────────────────────────────────────────
    const spineVerts: number[] = [];
    SECTOR_LINKS.forEach(([a, b]) => {
      const sa = SECTORS[a]; const sb = SECTORS[b];
      if (!sa || !sb) return;
      spineVerts.push(...sa.centre, ...sb.centre);
    });
    const spineGeo = new THREE.BufferGeometry();
    spineGeo.setAttribute("position", new THREE.Float32BufferAttribute(spineVerts, 3));
    const spineMat = new THREE.LineBasicMaterial({ color: 0x1e1b4b, transparent: true, opacity: 0.12 });
    scene.add(new THREE.LineSegments(spineGeo, spineMat));

    // ── Particles ──────────────────────────────────────────────────────────
    const PART_COUNT = 130;
    const partGeo = new THREE.SphereGeometry(0.06, 4, 4);
    const partMat = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.7 });
    const partMesh = new THREE.InstancedMesh(partGeo, partMat, PART_COUNT);
    partMesh.frustumCulled = false;
    const partState = Array.from({ length: PART_COUNT }, () => ({
      t: Math.random(), speed: 0.0015 + Math.random() * 0.002,
      srcIdx: Math.floor(Math.random() * nodeCount),
      dstIdx: Math.floor(Math.random() * nodeCount),
    }));
    scene.add(partMesh);

    // ── Camera state ───────────────────────────────────────────────────────
    const camPos    = new THREE.Vector3(0, 0, CAM_START_Z);
    const camTarget = new THREE.Vector3(0, 0, 0);
    const camPosSmoothed    = camera.position.clone();
    const camTargetSmoothed = new THREE.Vector3();
    const clock = new THREE.Clock();

    // ── Raycasting ─────────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.5 };
    const pointer = new THREE.Vector2();

    function doRaycast(clientX: number, clientY: number) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x =  ((clientX - rect.left) / rect.width)  * 2 - 1;
      pointer.y = -((clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(instancedNodes);
      if (hits.length > 0) {
        const idx = hits[0].instanceId ?? -1;
        if (idx >= 0 && idx < allNodesRef.current.length) {
          const node = allNodesRef.current[idx];
          const sp = hits[0].point.clone().project(camera);
          const rect2 = renderer.domElement.getBoundingClientRect();
          const sx = ( sp.x * 0.5 + 0.5) * rect2.width;
          const sy = (-sp.y * 0.5 + 0.5) * rect2.height;
          setHoveredNodeState(node, sx, sy);
          return idx;
        }
      }
      setHoveredNodeState(null, 0, 0);
      return -1;
    }

    // ── Pointer events ─────────────────────────────────────────────────────
    function onPointerDown(e: PointerEvent) {
      orbitRef.current.isDragging = true;
      orbitRef.current.startX = e.clientX;
      orbitRef.current.startY = e.clientY;
      orbitRef.current.lastX  = e.clientX;
      orbitRef.current.lastY  = e.clientY;
      orbitRef.current.dragDist = 0;
    }

    function onPointerMove(e: PointerEvent) {
      const o = orbitRef.current;
      if (o.isDragging) {
        const dx = e.clientX - o.lastX;
        const dy = e.clientY - o.lastY;
        o.dragDist += Math.abs(dx) + Math.abs(dy);
        if (phaseRef.current === "exploring") {
          o.yaw   -= dx * 0.004;
          o.pitch -= dy * 0.003;
          o.pitch  = Math.max(-0.8, Math.min(0.8, o.pitch));
        }
        o.lastX = e.clientX;
        o.lastY = e.clientY;
      }
      doRaycast(e.clientX, e.clientY);
    }

    function onPointerUp(e: PointerEvent) {
      const o = orbitRef.current;
      o.isDragging = false;
      // Only fire click if pointer barely moved (not a drag)
      if (o.dragDist < 5 && phaseRef.current === "exploring") {
        const idx = doRaycast(e.clientX, e.clientY);
        if (idx >= 0) {
          const node = allNodesRef.current[idx];
          destNodeRef.current = node;
          destPosRef.current.set(...node.position);
          destCamPosRef.current.set(node.position[0], node.position[1]+4, node.position[2]+14);
          startCamPosRef.current.copy(camPosSmoothed);
          startCamTargetRef.current.copy(camTargetSmoothed);
          const availableBehaviors = CAMERA_BEHAVIORS.filter((behavior) => !recentCameraBehaviorsRef.current.includes(behavior.name));
          const pool = availableBehaviors.length > 0 ? availableBehaviors : CAMERA_BEHAVIORS;
          const behavior = pool[Math.floor(Math.random() * pool.length)];
          activeCameraBehaviorRef.current = behavior;
          recentCameraBehaviorsRef.current = [...recentCameraBehaviorsRef.current.slice(-2), behavior.name];
          console.log("Camera Behavior:", behavior.name);
          rebuildConnections(node);
          // Reset orbit offsets so new destination is centered
          o.yaw = 0; o.pitch = 0;
          travelToRef.current(node);
        }
      }
    }

    function onPointerLeave() {
      orbitRef.current.isDragging = false;
      setHoveredNodeState(null, 0, 0);
    }

    renderer.domElement.addEventListener("pointerdown",  onPointerDown);
    renderer.domElement.addEventListener("pointermove",  onPointerMove);
    renderer.domElement.addEventListener("pointerup",    onPointerUp);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);

    // ── Resize ─────────────────────────────────────────────────────────────
    function onResize() {
      const nw = container.clientWidth  || window.innerWidth;
      const nh = container.clientHeight || window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    }
    window.addEventListener("resize", onResize);

    // ── RAF loop ───────────────────────────────────────────────────────────
    let rafId = 0;
    function animate() {
      rafId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const t     = clock.elapsedTime;
      const phase = phaseRef.current;
      const mouse = mouseRef.current;

      // ── LOD: scale nodes by camera distance ─────────────────────────────
      allNodesRef.current.forEach((node, i) => {
        const [nx, ny, nz] = node.position;
        const dist = camera.position.distanceTo(new THREE.Vector3(nx, ny, nz));
        const isHovered = node.id === hoveredNodeId;
        const isDest    = destNodeRef.current?.id === node.id;
        let scale = dist > 120 ? 0 : dist > 80 ? 0.6 : 1;
        if (isDest)    scale *= 1.6;
        if (isHovered) scale *= 1.3;
        // Pulse
        const pulse = 1 + Math.sin(t * 1.8 + i * 0.7) * 0.06;
        dummy.position.set(nx, ny, nz);
        dummy.scale.setScalar(scale * pulse);
        dummy.updateMatrix();
        instancedNodes.setMatrixAt(i, dummy.matrix);
      });
      instancedNodes.instanceMatrix.needsUpdate = true;

      // ── Particles ────────────────────────────────────────────────────────
      partState.forEach((p, i) => {
        p.t += p.speed;
        if (p.t >= 1) {
          p.t = 0;
          p.srcIdx = p.dstIdx;
          p.dstIdx = Math.floor(Math.random() * nodeCount);
        }
        const src = allNodesRef.current[p.srcIdx];
        const dst = allNodesRef.current[p.dstIdx];
        if (!src || !dst) return;
        const px = src.position[0] + (dst.position[0] - src.position[0]) * p.t;
        const py = src.position[1] + (dst.position[1] - src.position[1]) * p.t;
        const pz = src.position[2] + (dst.position[2] - src.position[2]) * p.t;
        dummy.position.set(px, py, pz);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        partMesh.setMatrixAt(i, dummy.matrix);
      });
      partMesh.instanceMatrix.needsUpdate = true;

      // ── Camera behaviour per phase ───────────────────────────────────────
      const easeInOut = (x: number) => x < 0.5 ? 2*x*x : 1-Math.pow(-2*x+2,2)/2;
      const elapsedMs = performance.now() - activationTimeRef.current;

      if (phase === "idle") {
        const drift = Math.sin(t * 0.12) * 2.5;
        camPos.set(mouse.x * 2.5 + drift, mouse.y * 1.5, CAM_START_Z);
        camTarget.set(mouse.x * 4, mouse.y * 2.5, 0);
      } else if (phase === "activating") {
        const prog = Math.min(elapsedMs / 900, 1);
        const e    = easeInOut(prog);
        camPos.set(mouse.x * 1.5, mouse.y * 1.0, CAM_START_Z + 8 * e);
        camTarget.set(0, 0, 0);
      } else if (phase === "travelling") {
        const prog = Math.min(elapsedMs / TRAVEL_DURATION, 1);
        const behavior = activeCameraBehaviorRef.current;
        const startPos = startCamPosRef.current;
        const startTarget = startCamTargetRef.current;
        const endPos = destCamPosRef.current;
        const endTarget = destPosRef.current;
        if (behavior) {
          behavior.run(prog, startPos, startTarget, endPos, endTarget, camPos, camTarget);
        } else {
          const e = easeInOut(prog);
          const startZ = CAM_START_Z + 8;
          camPos.set(
            endPos.x * e,
            endPos.y * e,
            startZ + (endPos.z - startZ) * e,
          );
          camTarget.copy(endTarget);
        }
      } else if (phase === "arrived") {
        camPos.copy(destCamPosRef.current);
        camTarget.copy(destPosRef.current);
      } else if (phase === "exploring") {
        // User controls the look-around via orbital drag
        const o = orbitRef.current;
        const base = destCamPosRef.current;
        const lookBase = destPosRef.current;
        camPos.copy(base);
        camTarget.set(
          lookBase.x + Math.sin(o.yaw) * 22,
          lookBase.y + Math.sin(o.pitch) * 12,
          lookBase.z + Math.cos(o.yaw) * 4,
        );
      }

      // Smooth camera
      const lerpSpeed = phase === "idle" ? 2.5 : phase === "exploring" ? 4.0 : 5.5;
      camPosSmoothed.lerp(camPos, delta * lerpSpeed);
      camTargetSmoothed.lerp(camTarget, delta * lerpSpeed);
      camera.position.copy(camPosSmoothed);
      camera.lookAt(camTargetSmoothed);
      camPosSmoothedRef.current.copy(camPosSmoothed);
      camTargetSmoothedRef.current.copy(camTargetSmoothed);

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      renderer.domElement.removeEventListener("pointerdown",  onPointerDown);
      renderer.domElement.removeEventListener("pointermove",  onPointerMove);
      renderer.domElement.removeEventListener("pointerup",    onPointerUp);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMouseNorm({
        x: ((e.clientX - rect.left) / rect.width  - 0.5) * 2,
        y: ((e.clientY - rect.top)  / rect.height - 0.5) * 2,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const handleMouseLeave = useCallback(() => setMouseNorm({ x: 0, y: 0 }), []); // eslint-disable-line

  return (
    <div
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, cursor: "crosshair" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label="AI Career Universe — interactive 3D environment"
    >
      <HoverLabel node={hoveredNode} screenPos={hoverScreenPos} />
      <CareerNavPanel allNodes={allNodesState} />
    </div>
  );
}

// ─── World inner ──────────────────────────────────────────────────────────────
function WorldInner() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#03050e", overflow: "hidden" }}>
      <ThreeScene />
      <VignetteOverlay />
      <HeroContent />
      <CareerPreviewCard />
      <ExploreHint />
      <TransitionController />
    </div>
  );
}

// ─── World — exported root ────────────────────────────────────────────────────
export default function World() {
  return (
    <SceneProvider>
      <WorldInner />
    </SceneProvider>
  );
}
