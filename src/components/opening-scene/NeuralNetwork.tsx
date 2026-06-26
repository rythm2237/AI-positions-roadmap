"use client";
// src/components/opening-scene/NeuralNetwork.tsx
//
// ─── PRODUCT INFRASTRUCTURE — THE CAREER NETWORK ─────────────────────────
//
// This is NOT a visual effect. This is the product.
//
// Every node is a real AI career from careerRoadmaps.ts.
// Every connection represents a meaningful skill relationship between careers.
// The 3D layout places careers in clustered constellations by category,
// extending far beyond the visible viewport — the world is larger than the screen.
//
// Architecture for scalability:
//   • Nodes use InstancedMesh — handles thousands of careers without perf cost
//   • Connections are built as a LineSegments geometry — single draw call
//   • Each node stores its CareerPosition.id — future click → career deep-link
//   • Layout algorithm is deterministic (seeded) — same positions every render
//   • The component publishes node positions back to SceneContext so other
//     components (HeroContent, TransitionController) can reference them
//
// Activation sequence (driven by SceneContext.phase):
//   idle       → nodes pulse softly, connections very dim, particles drift
//   activating → cascade wave of illumination from centre outward
//   travelling → all connections bright, particles stream toward centre

import { useRef, useEffect, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useScene, CareerNode } from "./SceneContext";
import { careerPositions } from "@/data/careerRoadmaps";

// ─── Seeded pseudo-random (deterministic layout) ──────────────────────────────
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ─── Category cluster centres (in 3D world space) ────────────────────────────
// The world extends from roughly -20 to +20 on X/Z and -8 to +8 on Y.
// The visible camera window at Z=14 sees roughly ±6 units — so most of
// the network exists outside the visible frame. This creates the sense of
// infinite scale.
const CATEGORY_CENTRES: Record<string, [number, number, number]> = {
  Automation:        [ 0,    0,   0],   // centre — the core
  "No-Code":         [ 5,    1,  -4],
  Marketing:         [-6,    2,  -3],
  Productivity:      [ 8,   -2,   3],
  Operations:        [-7,   -1,   4],
  "Customer Support":[ 4,    3,   5],
  Content:           [-5,    3,  -6],
  "AI Agents":       [ 2,   -3,  -7],
  "Business Analysis":[-3,  -4,   6],
  // Future categories — positions reserved for growth
  "ML Engineering":  [12,    2,  -8],
  "Data Science":    [-12,   1,  -9],
  "AI Research":     [ 0,    8, -12],
  "Product":         [10,   -5,   8],
  "Security":        [-10,  -6,   9],
};

// ─── Skill-based connection rules ────────────────────────────────────────────
// Careers share connections when they share key skills or are in adjacent
// categories. This is the semantic layer of the Career Network.
const CONNECTED_CATEGORIES: [string, string][] = [
  ["Automation",        "No-Code"],
  ["Automation",        "AI Agents"],
  ["Automation",        "Operations"],
  ["Automation",        "Marketing"],
  ["Automation",        "Customer Support"],
  ["No-Code",           "Marketing"],
  ["No-Code",           "Productivity"],
  ["No-Code",           "Content"],
  ["Marketing",         "Content"],
  ["Marketing",         "Operations"],
  ["Productivity",      "Operations"],
  ["Productivity",      "Business Analysis"],
  ["Operations",        "Business Analysis"],
  ["Customer Support",  "AI Agents"],
  ["Content",           "AI Agents"],
  ["AI Agents",         "Business Analysis"],
];

// ─── Layout: compute 3D positions for all career nodes ───────────────────────
function computeNodeLayout(): CareerNode[] {
  const rng = seededRandom(42);

  return careerPositions.map((career, i) => {
    const centre = CATEGORY_CENTRES[career.category] ?? [0, 0, 0];
    // Spread nodes within their cluster — radius 2.5 units
    const spread = 2.5;
    const px = centre[0] + (rng() - 0.5) * spread * 2;
    const py = centre[1] + (rng() - 0.5) * spread;
    const pz = centre[2] + (rng() - 0.5) * spread * 2;

    // Connections: same category neighbours + cross-category rules
    const connections: string[] = [];
    careerPositions.forEach((other) => {
      if (other.id === career.id) return;
      const sameCategory = other.category === career.category;
      const crossLinked = CONNECTED_CATEGORIES.some(
        ([a, b]) =>
          (a === career.category && b === other.category) ||
          (b === career.category && a === other.category)
      );
      // Also connect if they share a key skill
      const sharedSkill = career.keySkills.some((s) =>
        other.keySkills.includes(s)
      );
      if (sameCategory || crossLinked || sharedSkill) {
        connections.push(other.id);
      }
    });

    return {
      id: career.id,
      title: career.title,
      category: career.category,
      status: career.status,
      position: [px, py, pz] as [number, number, number],
      connections,
    };
  });
}

// ─── Node colour by category ──────────────────────────────────────────────────
const CATEGORY_COLOURS: Record<string, string> = {
  Automation:          "#6366f1", // indigo — the core
  "No-Code":           "#8b5cf6", // violet
  Marketing:           "#a78bfa", // light violet
  Productivity:        "#22d3ee", // cyan
  Operations:          "#38bdf8", // sky
  "Customer Support":  "#34d399", // emerald
  Content:             "#c084fc", // purple
  "AI Agents":         "#f472b6", // pink
  "Business Analysis": "#60a5fa", // blue
};

// ─── Ghost nodes: extend the world beyond real careers ───────────────────────
// These are placeholder nodes that suggest the network extends far beyond
// what is currently visible — the world is larger than the product today.
function buildGhostNodes(realNodes: CareerNode[]): CareerNode[] {
  const rng = seededRandom(99);
  const ghosts: CareerNode[] = [];
  const futureCategories = [
    "ML Engineering", "Data Science", "AI Research", "Product", "Security"
  ];

  futureCategories.forEach((cat) => {
    const centre = CATEGORY_CENTRES[cat] ?? [0, 0, 0];
    for (let i = 0; i < 4; i++) {
      ghosts.push({
        id: `ghost-${cat}-${i}`,
        title: "Coming Soon",
        category: cat,
        status: "coming-soon",
        position: [
          centre[0] + (rng() - 0.5) * 5,
          centre[1] + (rng() - 0.5) * 3,
          centre[2] + (rng() - 0.5) * 5,
        ] as [number, number, number],
        connections: [],
      });
    }
  });

  return ghosts;
}

// ─── Particle system ──────────────────────────────────────────────────────────
// Particles travel along connection edges — they represent knowledge flow
// between career paths. This is not decoration; it visualises the
// interconnected nature of AI skills.
const PARTICLE_COUNT = 120;

interface Particle {
  fromId: string;
  toId: string;
  t: number;       // 0..1 progress along edge
  speed: number;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NeuralNetwork() {
  const { phase, setNodes, activationTime, hoveredNodeId } = useScene();

  // Compute layout once
  const realNodes = useMemo(() => computeNodeLayout(), []);
  const ghostNodes = useMemo(() => buildGhostNodes(realNodes), [realNodes]);
  const allNodes = useMemo(() => [...realNodes, ...ghostNodes], [realNodes, ghostNodes]);

  // Publish positions to context (for HeroContent, TransitionController)
  useEffect(() => {
    setNodes(realNodes);
  }, [realNodes, setNodes]);

  // Build connection pairs from real nodes only
  const connectionPairs = useMemo(() => {
    const pairs: [CareerNode, CareerNode][] = [];
    const seen = new Set<string>();
    realNodes.forEach((node) => {
      node.connections.forEach((targetId) => {
        const key = [node.id, targetId].sort().join("|");
        if (seen.has(key)) return;
        seen.add(key);
        const target = realNodes.find((n) => n.id === targetId);
        if (target) pairs.push([node, target]);
      });
    });
    return pairs;
  }, [realNodes]);

  // ── Instanced mesh for nodes ──────────────────────────────────────────────
  const nodeCount = allNodes.length;
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const nodeGeometry = useMemo(() => new THREE.SphereGeometry(0.12, 16, 16), []);
  const nodeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#6366f1",
        emissive: "#4338ca",
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8,
      }),
    []
  );

  // Per-instance colour buffer
  const nodeColours = useMemo(() => {
    const colours = new Float32Array(nodeCount * 3);
    allNodes.forEach((node, i) => {
      const hex = CATEGORY_COLOURS[node.category] ?? "#6366f1";
      const c = new THREE.Color(hex);
      colours[i * 3]     = c.r;
      colours[i * 3 + 1] = c.g;
      colours[i * 3 + 2] = c.b;
    });
    return colours;
  }, [allNodes, nodeCount]);

  // Set initial instance transforms
  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const colAttr = new THREE.InstancedBufferAttribute(nodeColours, 3);
    meshRef.current.geometry.setAttribute("color", colAttr);
    (meshRef.current.material as THREE.MeshStandardMaterial).vertexColors = true;

    allNodes.forEach((node, i) => {
      dummy.position.set(...node.position);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [allNodes, nodeColours]);

  // ── Connection lines ──────────────────────────────────────────────────────
  const linesRef = useRef<THREE.LineSegments>(null!);
  const linePositions = useMemo(() => {
    const positions: number[] = [];
    connectionPairs.forEach(([a, b]) => {
      positions.push(...a.position, ...b.position);
    });
    return new Float32Array(positions);
  }, [connectionPairs]);

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    return geo;
  }, [linePositions]);

  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#4338ca",
        transparent: true,
        opacity: 0.08,
      }),
    []
  );

  // ── Ghost connection lines (very faint — suggest scale) ───────────────────
  const ghostLinesRef = useRef<THREE.LineSegments>(null!);
  const ghostLinePositions = useMemo(() => {
    const positions: number[] = [];
    // Connect each ghost to the nearest real node
    ghostNodes.forEach((ghost) => {
      let nearest: CareerNode | null = null;
      let nearestDist = Infinity;
      realNodes.forEach((real) => {
        const d = new THREE.Vector3(...ghost.position).distanceTo(
          new THREE.Vector3(...real.position)
        );
        if (d < nearestDist) { nearestDist = d; nearest = real; }
      });
      if (nearest && nearestDist < 14) {
        positions.push(...ghost.position, ...(nearest as CareerNode).position);
      }
    });
    return new Float32Array(positions);
  }, [ghostNodes, realNodes]);

  const ghostLineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(ghostLinePositions, 3));
    return geo;
  }, [ghostLinePositions]);

  const ghostLineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#312e81",
        transparent: true,
        opacity: 0.03,
      }),
    []
  );

  // ── Particles ─────────────────────────────────────────────────────────────
  const particleMeshRef = useRef<THREE.InstancedMesh>(null!);
  const particleGeo = useMemo(() => new THREE.SphereGeometry(0.025, 6, 6), []);
  const particleMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#a5b4fc",
        transparent: true,
        opacity: 0.7,
      }),
    []
  );

  const particles = useRef<Particle[]>([]);
  useEffect(() => {
    if (connectionPairs.length === 0) return;
    const rng = seededRandom(7);
    particles.current = Array.from({ length: PARTICLE_COUNT }, () => {
      const pairIdx = Math.floor(rng() * connectionPairs.length);
      return {
        fromId: connectionPairs[pairIdx][0].id,
        toId:   connectionPairs[pairIdx][1].id,
        t:      rng(),
        speed:  0.0008 + rng() * 0.0012,
      };
    });
  }, [connectionPairs]);

  // ── Node index lookup ─────────────────────────────────────────────────────
  const nodeIndexMap = useMemo(() => {
    const m = new Map<string, number>();
    allNodes.forEach((n, i) => m.set(n.id, i));
    return m;
  }, [allNodes]);

  const nodePositionMap = useMemo(() => {
    const m = new Map<string, THREE.Vector3>();
    allNodes.forEach((n) => m.set(n.id, new THREE.Vector3(...n.position)));
    return m;
  }, [allNodes]);

  // ── Animation loop ────────────────────────────────────────────────────────
  const dummy = useRef(new THREE.Object3D());
  const clock = useRef(0);

  useFrame((_, delta) => {
    clock.current += delta;
    const t = clock.current;
    const isIdle       = phase === "idle";
    const isActivating = phase === "activating";
    const isTravelling = phase === "travelling";

    // Activation cascade progress (0..1 over 1.5 seconds)
    const activationAge = isActivating || isTravelling
      ? (performance.now() - activationTime.current) / 1000
      : 0;

    // ── Update node scales and emissive (pulse + activation cascade) ────────
    if (meshRef.current) {
      allNodes.forEach((node, i) => {
        const isReal   = node.status === "available" || i < realNodes.length;
        const isHovered = node.id === hoveredNodeId;

        // Cascade: nodes light up in a wave from centre outward
        const distFromCentre = new THREE.Vector3(...node.position).length();
        const cascadeDelay   = distFromCentre * 0.18; // further = later
        const cascadeProgress = Math.max(0, Math.min(1, activationAge - cascadeDelay));

        // Idle pulse — each node has a unique phase
        const pulsePhase  = (node.id.charCodeAt(0) % 10) / 10;
        const idlePulse   = 0.85 + Math.sin(t * 0.8 + pulsePhase * Math.PI * 2) * 0.15;

        // Scale
        let scale = isReal ? idlePulse : 0.6;
        if (isHovered) scale *= 1.8;
        if (isActivating || isTravelling) {
          scale = THREE.MathUtils.lerp(scale, isHovered ? 2.2 : 1.4, cascadeProgress);
        }
        if (!isReal) scale *= 0.5; // ghost nodes are smaller

        dummy.current.position.set(...node.position);
        dummy.current.scale.setScalar(scale);
        dummy.current.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.current.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    // ── Update connection line opacity ────────────────────────────────────
    if (linesRef.current) {
      const mat = linesRef.current.material as THREE.LineBasicMaterial;
      let targetOpacity = 0.08;
      if (isActivating) targetOpacity = THREE.MathUtils.lerp(0.08, 0.45, Math.min(activationAge / 1.5, 1));
      if (isTravelling) targetOpacity = 0.7;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.04);
    }

    // ── Update particles ──────────────────────────────────────────────────
    if (particleMeshRef.current && particles.current.length > 0) {
      const speedMult = isTravelling ? 6 : isActivating ? 2.5 : 1;

      particles.current.forEach((p, i) => {
        p.t += p.speed * speedMult;
        if (p.t > 1) {
          // Respawn on a new edge
          const rng = seededRandom(i + Math.floor(t * 10));
          const pairIdx = Math.floor(rng() * connectionPairs.length);
          p.fromId = connectionPairs[pairIdx][0].id;
          p.toId   = connectionPairs[pairIdx][1].id;
          p.t      = 0;
        }

        const fromPos = nodePositionMap.get(p.fromId);
        const toPos   = nodePositionMap.get(p.toId);
        if (!fromPos || !toPos) return;

        const pos = fromPos.clone().lerp(toPos, p.t);
        dummy.current.position.copy(pos);
        dummy.current.scale.setScalar(1);
        dummy.current.updateMatrix();
        particleMeshRef.current.setMatrixAt(i, dummy.current.matrix);
      });
      particleMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Real career nodes */}
      <instancedMesh
        ref={meshRef}
        args={[nodeGeometry, nodeMaterial, nodeCount]}
        frustumCulled={false}
      />

      {/* Career connections */}
      <lineSegments ref={linesRef} geometry={lineGeometry} material={lineMaterial} />

      {/* Ghost connections (suggest infinite scale) */}
      <lineSegments ref={ghostLinesRef} geometry={ghostLineGeometry} material={ghostLineMaterial} />

      {/* Travelling particles */}
      <instancedMesh
        ref={particleMeshRef}
        args={[particleGeo, particleMat, PARTICLE_COUNT]}
        frustumCulled={false}
      />
    </group>
  );
}
