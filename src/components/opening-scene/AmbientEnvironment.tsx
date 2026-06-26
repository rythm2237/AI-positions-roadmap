"use client";
// src/components/opening-scene/AmbientEnvironment.tsx
//
// ─── PRODUCT INFRASTRUCTURE — WORLD ATMOSPHERE ────────────────────────────
//
// Lighting, fog, and atmospheric depth for the Career Network world.
//
// Three orbiting point lights create a dynamic, living light environment
// that interacts with every node's MeshStandardMaterial — nodes shift in
// colour and intensity as the lights orbit. This is not decoration: it makes
// the network feel alive and responsive without any explicit animation code
// on the nodes themselves.
//
// Fog:
//   Deep indigo fog starting at Z=12, fully opaque at Z=40.
//   Nodes beyond Z=12 fade into the fog — the world feels infinite.
//   The fog colour matches the background exactly (#03050e) so the
//   fade is invisible: nodes simply dissolve into the dark.
//
// Activation:
//   All lights boost intensity when phase becomes "activating" or "travelling".
//   This makes the entire world feel like it is waking up.

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useScene } from "./SceneContext";

function OrbitingLight({
  color,
  intensity,
  radius,
  speed,
  yOffset = 0,
  phaseOffset = 0,
  activationBoost = 2.4,
}: {
  color: string;
  intensity: number;
  radius: number;
  speed: number;
  yOffset?: number;
  phaseOffset?: number;
  activationBoost?: number;
}) {
  const ref = useRef<THREE.PointLight>(null!);
  const { phase } = useScene();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + phaseOffset;
    const isActive = phase === "activating" || phase === "travelling";
    const targetIntensity = intensity * (isActive ? activationBoost : 1);

    ref.current.position.set(
      Math.sin(t) * radius,
      yOffset + Math.cos(t * 0.55) * (radius * 0.28),
      Math.cos(t) * radius
    );
    ref.current.intensity = THREE.MathUtils.lerp(
      ref.current.intensity,
      targetIntensity,
      0.04
    );
  });

  return (
    <pointLight
      ref={ref}
      color={color}
      intensity={intensity}
      distance={24}
      decay={2}
    />
  );
}

export default function AmbientEnvironment() {
  return (
    <>
      {/*
        Deep space fog — nodes fade into the dark at distance.
        The world feels infinite because the boundaries are never visible.
      */}
      <fog attach="fog" args={["#03050e", 14, 42]} />

      {/* Very dim base — just enough to see the scene without washing it out */}
      <ambientLight color="#080b20" intensity={0.5} />

      {/* Sky/ground hemisphere — subtle blue-black gradient */}
      <hemisphereLight
        color="#1a1740"
        groundColor="#03050e"
        intensity={0.7}
      />

      {/* ── Three orbiting coloured lights ─────────────────────────────── */}

      {/* Indigo — primary OS colour, slow wide orbit */}
      <OrbitingLight
        color="#6366f1"
        intensity={4.0}
        radius={8}
        speed={0.10}
        yOffset={1.5}
        phaseOffset={0}
        activationBoost={2.6}
      />

      {/* Violet — mid orbit, adds warmth and depth */}
      <OrbitingLight
        color="#8b5cf6"
        intensity={3.2}
        radius={10}
        speed={0.08}
        yOffset={-2.5}
        phaseOffset={Math.PI * 0.66}
        activationBoost={2.2}
      />

      {/* Cyan — electric highlight, fast tight orbit */}
      <OrbitingLight
        color="#22d3ee"
        intensity={2.5}
        radius={6}
        speed={0.16}
        yOffset={3.5}
        phaseOffset={Math.PI * 1.33}
        activationBoost={2.0}
      />

      {/* Static uplight from below — subtle purple */}
      <pointLight
        position={[0, -10, 2]}
        color="#4c1d95"
        intensity={2.2}
        distance={20}
        decay={2}
      />

      {/* Distant fill — makes far ghost nodes barely visible */}
      <pointLight
        position={[0, 0, -20]}
        color="#1e1b4b"
        intensity={1.2}
        distance={35}
        decay={1.5}
      />
    </>
  );
}
