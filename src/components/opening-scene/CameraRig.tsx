"use client";
// src/components/opening-scene/CameraRig.tsx
//
// ─── PRODUCT INFRASTRUCTURE — VIRTUAL CAMERA ─────────────────────────────
//
// The camera is not a cinematic trick. It is how the user perceives the world.
// The world is much larger than the viewport — the camera is the window into it.
//
// Behaviours:
//
//   idle       → very slow sinusoidal drift on X/Y + subtle Z breathing
//                + gentle mouse parallax (camera follows cursor at ~3% strength)
//                The drift is almost invisible — just enough to feel alive.
//                Camera sits at Z=14, looking at origin — the world extends
//                in all directions beyond the frame.
//
//   activating → camera begins a slow, confident forward zoom toward the
//                network centre. The world draws the user in.
//
//   travelling → camera accelerates. Connections illuminate. The network
//                rushes toward the viewer. FOV narrows slightly.
//
// Design principle:
//   The camera never feels mechanical. Every transition is lerped with
//   different easing speeds so motion feels organic, not programmatic.

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useScene } from "./SceneContext";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Camera sits far back — the world extends beyond all edges of the viewport.
// At Z=14 with FOV=55, the visible width at Z=0 is roughly ±10 units.
// The network spans ±20 units — so roughly half the network is always offscreen.
const IDLE_Z      = 14;
const ACTIVATE_Z  = 9;
const TRAVEL_Z    = 1;

export default function CameraRig() {
  const { camera } = useThree();
  const { phase, mouseNorm } = useScene();

  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    const elapsed = t.current;

    if (phase === "idle") {
      // Slow sinusoidal drift — each axis has a different period
      const driftX = Math.sin(elapsed * 0.06) * 0.7 + Math.sin(elapsed * 0.11) * 0.3;
      const driftY = Math.sin(elapsed * 0.04) * 0.35 + Math.cos(elapsed * 0.08) * 0.2;
      const driftZ = IDLE_Z + Math.sin(elapsed * 0.035) * 0.5;

      // Mouse parallax — camera gently follows cursor
      const parallaxX = mouseNorm.x * 1.2;
      const parallaxY = mouseNorm.y * 0.6;

      const targetX = driftX + parallaxX;
      const targetY = driftY + parallaxY;

      // Very slow lerp — the world feels heavy and real
      camera.position.x = lerp(camera.position.x, targetX, 0.018);
      camera.position.y = lerp(camera.position.y, targetY, 0.018);
      camera.position.z = lerp(camera.position.z, driftZ,  0.012);
      camera.lookAt(0, 0, 0);
    }

    if (phase === "activating") {
      // Slow, confident pull forward — the world invites the user in
      camera.position.x = lerp(camera.position.x, 0,          0.025);
      camera.position.y = lerp(camera.position.y, 0.3,        0.025);
      camera.position.z = lerp(camera.position.z, ACTIVATE_Z, 0.018);
      camera.lookAt(0, 0, 0);
    }

    if (phase === "travelling") {
      // Accelerating rush — the network fills the frame
      camera.position.x = lerp(camera.position.x, 0,         0.06);
      camera.position.y = lerp(camera.position.y, 0.8,       0.05);
      camera.position.z = lerp(camera.position.z, TRAVEL_Z,  0.045);
      camera.lookAt(0, 0.5, 0);
    }
  });

  return null;
}
