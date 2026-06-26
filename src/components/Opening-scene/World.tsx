"use client";
// src/components/opening-scene/World.tsx
//
// ─── THE WORLD — VANILLA THREE.JS (NO R3F RECONCILER) ────────────────────
//
// Uses vanilla Three.js inside useEffect to avoid the react-reconciler
// version conflict between @react-three/fiber v8 and Next.js 15.
//
// The scene is built imperatively once on mount and animated via
// requestAnimationFrame. All scene logic (camera, lights, network, particles)
// lives in this single file to keep the imperative code co-located.
//
// React is only used for:
//   - SceneProvider context (phase, mouse, nodes)
//   - HeroContent overlay (Framer Motion HTML)
//   - TransitionController (timing logic)
//
// Three.js handles everything visual inside the canvas.

import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { MotionConfig } from "framer-motion";
import { SceneProvider, useScene, CareerNode } from "./SceneContext";
import HeroContent from "./HeroContent";
import TransitionController from "./TransitionController";
import { careerPositions } from "@/data/careerRoadmaps";

// ─── Seeded RNG ───────────────────────────────────────────────────────────────
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ─── Category cluster centres ─────────────────────────────────────────────────
const CATEGORY_CENTRES: Record<string, [number, number, number]> = {
  Automation:          [  0,    0,   0],
  "No-Code":           [  5,    1,  -4],
  Marketing:           [ -6,    2,  -3],
  Productivity:        [  8,   -2,   3],
  Operations:          [ -7,   -1,   4],
  "Customer Support":  [  4,    3,   5],
  Content:             [ -5,    3,  -6],
  "AI Agents":         [  2,   -3,  -7],
  "Business Analysis": [ -3,   -4,   6],
  "ML Engineering":    [ 12,    2,  -8],
  "Data Science":      [-12,    1,  -9],
  "AI Research":       [  0,    8, -12],
  Product:             [ 10,   -5,   8],
  Security:            [-10,   -6,   9],
};

const CATEGORY_COLOURS: Record<string, string> = {
  Automation:          "#6366f1",
  "No-Code":           "#8b5cf6",
  Marketing:           "#a78bfa",
  Productivity:        "#22d3ee",
  Operations:          "#38bdf8",
  "Customer Support":  "#34d399",
  Content:             "#c084fc",
  "AI Agents":         "#f472b6",
  "Business Analysis": "#60a5fa",
};

const CONNECTED_CATEGORIES: [string, string][] = [
  ["Automation", "No-Code"],
  ["Automation", "AI Agents"],
  ["Automation", "Operations"],
  ["Automation", "Marketing"],
  ["Automation", "Customer Support"],
  ["No-Code", "Marketing"],
  ["No-Code", "Productivity"],
  ["No-Code", "Content"],
  ["Marketing", "Content"],
  ["Marketing", "Operations"],
  ["Productivity", "Operations"],
  ["Productivity", "Business Analysis"],
  ["Operations", "Business Analysis"],
  ["Customer Support", "AI Agents"],
  ["Content", "AI Agents"],
  ["AI Agents", "Business Analysis"],
];

// ─── Layout ───────────────────────────────────────────────────────────────────
function computeNodeLayout(): CareerNode[] {
  const rng = seededRandom(42);
  return careerPositions.map((career) => {
    const centre = CATEGORY_CENTRES[career.category] ?? [0, 0, 0];
    const spread = 2.5;
    const px = centre[0] + (rng() - 0.5) * spread * 2;
    const py = centre[1] + (rng() - 0.5) * spread;
    const pz = centre[2] + (rng() - 0.5) * spread * 2;

    const connections: string[] = [];
    careerPositions.forEach((other) => {
      if (other.id === career.id) return;
      const sameCategory = other.category === career.category;
      const crossLinked = CONNECTED_CATEGORIES.some(
        ([a, b]) =>
          (a === career.category && b === other.category) ||
          (b === career.category && a === other.category)
      );
      const sharedSkill = career.keySkills?.some((s) =>
        other.keySkills?.includes(s)
      );
      if (sameCategory || crossLinked || sharedSkill) connections.push(other.id);
    });

    return {
      id: career.id,
      title: career.title,
      category: career.category,
      status: career.status as "available" | "coming-soon",
      position: [px, py, pz] as [number, number, number],
      connections,
    };
  });
}

function buildGhostNodes(): CareerNode[] {
  const rng = seededRandom(99);
  const ghosts: CareerNode[] = [];
  const futureCategories = ["ML Engineering", "Data Science", "AI Research", "Product", "Security"];
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

// ─── Vignette ─────────────────────────────────────────────────────────────────
function VignetteOverlay() {
  const { phase } = useScene();
  const isActive = phase === "activating" || phase === "travelling";
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 5,
        background: `radial-gradient(ellipse at center, transparent 40%, rgba(3,5,14,${isActive ? 0.88 : 0.55}) 100%)`,
        transition: "background 1.2s ease",
      }}
    />
  );
}

// ─── Three.js scene ───────────────────────────────────────────────────────────
function ThreeScene() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { phase, mouseNorm, setNodes } = useScene();
  const phaseRef = useRef(phase);
  const mouseRef = useRef(mouseNorm);
  const activationTimeRef = useRef(0);

  // Keep refs current so animation loop always reads latest values
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { mouseRef.current = mouseNorm; }, [mouseNorm]);
  useEffect(() => {
    if (phase === "activating") activationTimeRef.current = performance.now();
  }, [phase]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // ── Scene setup ──────────────────────────────────────────────────────────
    const container = canvasRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#03050e");
    scene.fog = new THREE.Fog("#03050e", 14, 42);

    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    camera.position.set(0, 0, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    // ── Lights ───────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight("#080b20", 0.5);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight("#1a1740", "#03050e", 0.7);
    scene.add(hemi);

    const lights = [
      { color: "#6366f1", intensity: 4.0, radius: 8,  speed: 0.10, yOff:  1.5, phase: 0 },
      { color: "#8b5cf6", intensity: 3.2, radius: 10, speed: 0.08, yOff: -2.5, phase: Math.PI * 0.66 },
      { color: "#22d3ee", intensity: 2.5, radius: 6,  speed: 0.16, yOff:  3.5, phase: Math.PI * 1.33 },
    ].map((cfg) => {
      const light = new THREE.PointLight(cfg.color, cfg.intensity, 24, 2);
      scene.add(light);
      return { ...cfg, light };
    });

    const upLight = new THREE.PointLight("#4c1d95", 2.2, 20, 2);
    upLight.position.set(0, -10, 2);
    scene.add(upLight);

    // ── Network data ─────────────────────────────────────────────────────────
    const realNodes = computeNodeLayout();
    const ghostNodes = buildGhostNodes();
    const allNodes = [...realNodes, ...ghostNodes];
    setNodes(realNodes);

    // ── Node instanced mesh ──────────────────────────────────────────────────
    const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const nodeMat = new THREE.MeshStandardMaterial({
      roughness: 0.2,
      metalness: 0.8,
      vertexColors: true,
      emissive: new THREE.Color("#4338ca"),
      emissiveIntensity: 0.6,
    });

    const nodeCount = allNodes.length;
    const nodeMesh = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
    nodeMesh.frustumCulled = false;

    const colArray = new Float32Array(nodeCount * 3);
    allNodes.forEach((node, i) => {
      const hex = CATEGORY_COLOURS[node.category] ?? "#6366f1";
      const c = new THREE.Color(hex);
      colArray[i * 3] = c.r; colArray[i * 3 + 1] = c.g; colArray[i * 3 + 2] = c.b;
    });
    nodeGeo.setAttribute("color", new THREE.InstancedBufferAttribute(colArray, 3));

    const dummy = new THREE.Object3D();
    allNodes.forEach((node, i) => {
      dummy.position.set(...node.position);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      nodeMesh.setMatrixAt(i, dummy.matrix);
    });
    nodeMesh.instanceMatrix.needsUpdate = true;
    scene.add(nodeMesh);

    // ── Connection lines ─────────────────────────────────────────────────────
    const seen = new Set<string>();
    const linePositions: number[] = [];
    realNodes.forEach((node) => {
      node.connections.forEach((targetId) => {
        const key = [node.id, targetId].sort().join("|");
        if (seen.has(key)) return;
        seen.add(key);
        const target = realNodes.find((n) => n.id === targetId);
        if (target) linePositions.push(...node.position, ...target.position);
      });
    });

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    const lineMat = new THREE.LineBasicMaterial({ color: "#4338ca", transparent: true, opacity: 0.08 });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // ── Ghost lines ──────────────────────────────────────────────────────────
    const ghostLinePos: number[] = [];
    ghostNodes.forEach((ghost) => {
      let nearest: CareerNode | null = null;
      let nearestDist = Infinity;
      realNodes.forEach((real) => {
        const d = new THREE.Vector3(...ghost.position).distanceTo(new THREE.Vector3(...real.position));
        if (d < nearestDist) { nearestDist = d; nearest = real; }
      });
      if (nearest && nearestDist < 14) ghostLinePos.push(...ghost.position, ...(nearest as CareerNode).position);
    });
    const ghostLineGeo = new THREE.BufferGeometry();
    ghostLineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(ghostLinePos), 3));
    const ghostLineMat = new THREE.LineBasicMaterial({ color: "#312e81", transparent: true, opacity: 0.03 });
    scene.add(new THREE.LineSegments(ghostLineGeo, ghostLineMat));

    // ── Particles ────────────────────────────────────────────────────────────
    const PARTICLE_COUNT = 120;
    const connectionPairs: [CareerNode, CareerNode][] = [];
    const seenPairs = new Set<string>();
    realNodes.forEach((node) => {
      node.connections.forEach((targetId) => {
        const key = [node.id, targetId].sort().join("|");
        if (seenPairs.has(key)) return;
        seenPairs.add(key);
        const target = realNodes.find((n) => n.id === targetId);
        if (target) connectionPairs.push([node, target]);
      });
    });

    const particleGeo = new THREE.SphereGeometry(0.025, 6, 6);
    const particleMat = new THREE.MeshBasicMaterial({ color: "#a5b4fc", transparent: true, opacity: 0.7 });
    const particleMesh = new THREE.InstancedMesh(particleGeo, particleMat, PARTICLE_COUNT);
    particleMesh.frustumCulled = false;
    scene.add(particleMesh);

    const rngP = seededRandom(7);
    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const pairIdx = Math.floor(rngP() * Math.max(connectionPairs.length, 1));
      return {
        fromId: connectionPairs[pairIdx]?.[0].id ?? realNodes[0]?.id,
        toId:   connectionPairs[pairIdx]?.[1].id ?? realNodes[1]?.id,
        t:      rngP(),
        speed:  0.0008 + rngP() * 0.0012,
      };
    });

    const posMap = new Map<string, THREE.Vector3>();
    allNodes.forEach((n) => posMap.set(n.id, new THREE.Vector3(...n.position)));

    // ── Camera state ─────────────────────────────────────────────────────────
    const camTarget = new THREE.Vector3(0, 0, 14);
    const IDLE_Z = 14, ACTIVATE_Z = 9, TRAVEL_Z = 1;
    let elapsed = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // ── Animation loop ────────────────────────────────────────────────────────
    let rafId: number;
    let lastTime = performance.now();

    function animate() {
      rafId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += delta;

      const phase = phaseRef.current;
      const mouse = mouseRef.current;
      const isActivating = phase === "activating";
      const isTravelling = phase === "travelling";
      const activationAge = (isActivating || isTravelling)
        ? (now - activationTimeRef.current) / 1000
        : 0;

      // ── Camera ─────────────────────────────────────────────────────────────
      if (phase === "idle") {
        const driftX = Math.sin(elapsed * 0.06) * 0.7 + Math.sin(elapsed * 0.11) * 0.3;
        const driftY = Math.sin(elapsed * 0.04) * 0.35 + Math.cos(elapsed * 0.08) * 0.2;
        const driftZ = IDLE_Z + Math.sin(elapsed * 0.035) * 0.5;
        const targetX = driftX + mouse.x * 1.2;
        const targetY = driftY + mouse.y * 0.6;
        camera.position.x = lerp(camera.position.x, targetX, 0.018);
        camera.position.y = lerp(camera.position.y, targetY, 0.018);
        camera.position.z = lerp(camera.position.z, driftZ, 0.012);
      } else if (isActivating) {
        camera.position.x = lerp(camera.position.x, 0, 0.025);
        camera.position.y = lerp(camera.position.y, 0.3, 0.025);
        camera.position.z = lerp(camera.position.z, ACTIVATE_Z, 0.018);
      } else if (isTravelling) {
        camera.position.x = lerp(camera.position.x, 0, 0.06);
        camera.position.y = lerp(camera.position.y, 0.8, 0.05);
        camera.position.z = lerp(camera.position.z, TRAVEL_Z, 0.045);
      }
      camera.lookAt(0, 0, 0);

      // ── Lights ─────────────────────────────────────────────────────────────
      lights.forEach(({ light, radius, speed, yOff, phase: ph, intensity }) => {
        const t = elapsed * speed + ph;
        const boost = (isActivating || isTravelling) ? 2.4 : 1;
        light.position.set(Math.sin(t) * radius, yOff + Math.cos(t * 0.55) * radius * 0.28, Math.cos(t) * radius);
        light.intensity = lerp(light.intensity, intensity * boost, 0.04);
      });

      // ── Nodes ──────────────────────────────────────────────────────────────
      allNodes.forEach((node, i) => {
        const isGhost = node.status === "coming-soon";
        const distFromCentre = new THREE.Vector3(...node.position).length();
        const cascadeDelay = distFromCentre * 0.18;
        const cascadeProgress = Math.max(0, Math.min(1, activationAge - cascadeDelay));
        const pulsePhase = (node.id.charCodeAt(0) % 10) / 10;
        const idlePulse = 0.85 + Math.sin(elapsed * 0.8 + pulsePhase * Math.PI * 2) * 0.15;
        let scale = isGhost ? 0.3 : idlePulse;
        if (isActivating || isTravelling) {
          scale = lerp(scale, isGhost ? 0.4 : 1.4, cascadeProgress);
        }
        dummy.position.set(...node.position);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        nodeMesh.setMatrixAt(i, dummy.matrix);
      });
      nodeMesh.instanceMatrix.needsUpdate = true;

      // ── Line opacity ────────────────────────────────────────────────────────
      let targetOpacity = 0.08;
      if (isActivating) targetOpacity = lerp(0.08, 0.45, Math.min(activationAge / 1.5, 1));
      if (isTravelling) targetOpacity = 0.7;
      lineMat.opacity = lerp(lineMat.opacity, targetOpacity, 0.04);

      // ── Particles ──────────────────────────────────────────────────────────
      if (connectionPairs.length > 0) {
        const speedMult = isTravelling ? 6 : isActivating ? 2.5 : 1;
        particles.forEach((p, i) => {
          p.t += p.speed * speedMult;
          if (p.t > 1) {
            const rng2 = seededRandom(i + Math.floor(elapsed * 10));
            const pairIdx = Math.floor(rng2() * connectionPairs.length);
            p.fromId = connectionPairs[pairIdx][0].id;
            p.toId   = connectionPairs[pairIdx][1].id;
            p.t = 0;
          }
          const from = posMap.get(p.fromId);
          const to   = posMap.get(p.toId);
          if (!from || !to) return;
          const pos = from.clone().lerp(to, p.t);
          dummy.position.copy(pos);
          dummy.scale.setScalar(1);
          dummy.updateMatrix();
          particleMesh.setMatrixAt(i, dummy.matrix);
        });
        particleMesh.instanceMatrix.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }

    animate();

    // ── Resize handler ────────────────────────────────────────────────────────
    function onResize() {
      const w2 = container.clientWidth;
      const h2 = container.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    }
    window.addEventListener("resize", onResize);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { setMouseNorm } = useScene();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMouseNorm({
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
      });
    },
    [setMouseNorm]
  );

  const handleMouseLeave = useCallback(() => {
    setMouseNorm({ x: 0, y: 0 });
  }, [setMouseNorm]);

  return (
    <div
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    />
  );
}

// ─── Inner world ──────────────────────────────────────────────────────────────
function WorldInner() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#03050e",
        overflow: "hidden",
      }}
    >
      <ThreeScene />
      <VignetteOverlay />
      <HeroContent />
      <TransitionController />
    </div>
  );
}

// ─── World — exported root ────────────────────────────────────────────────────
export default function World() {
  return (
    <MotionConfig reducedMotion="user">
      <SceneProvider>
        <WorldInner />
      </SceneProvider>
    </MotionConfig>
  );
}
