import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const worldPath = path.join(root, "src/components/opening-scene/World.tsx");
const tourPath = path.join(root, "src/components/onboarding/FirstVisitGuidedTour.tsx");
let source = await readFile(worldPath, "utf8");
let tourSource = await readFile(tourPath, "utf8");

if (source.includes("const CAREER_UNIVERSE_STABLE_CINEMATIC_V4 = true;")) {
  console.log("Career Universe stable cinematic patch already applied.");
  process.exit(0);
}

function replaceRequired(search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error(`Career Universe stable cinematic patch failed: could not locate ${label}.`);
  }
  source = source.replace(search, replacement);
}

function replaceTourRequired(search, replacement, label) {
  if (!tourSource.includes(search)) {
    throw new Error(`Guided Tour completion patch failed: could not locate ${label}.`);
  }
  tourSource = tourSource.replace(search, replacement);
}

function replaceSection(startMarker, endMarker, replacement, label) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) {
    throw new Error(`Career Universe stable cinematic patch failed: could not locate ${label}.`);
  }
  const endExclusive = end + endMarker.length;
  source = `${source.slice(0, start)}${replacement.trim()}\n\n${source.slice(endExclusive)}`;
}

if (!source.includes("const CAREER_NATURAL_CRUISE = true;")) {
  throw new Error("Career Universe stable cinematic patch requires the natural cruise patch first.");
}

// Keep the approved natural cruise motion. Only make the presentation cadence,
// route variant, hover arbitration, and deliberate planet-entry approach stable.
replaceRequired(
  `const CAREER_NATURAL_CRUISE = true;\nconst CAREER_NATURAL_FOCUS_MAX_DISTANCE = 34;\nconst CAREER_NATURAL_FOCUS_MIN_FORWARD_DOT = 0.2;`,
  `const CAREER_NATURAL_CRUISE = true;\nconst CAREER_NATURAL_FOCUS_MAX_DISTANCE = 34;\nconst CAREER_NATURAL_FOCUS_MIN_FORWARD_DOT = 0.2;\nconst CAREER_UNIVERSE_STABLE_CINEMATIC_V4 = true;\nconst CAREER_STABLE_FOCUS_INTERVAL_MS = 3600;\nconst CAREER_LANDING_APPROACH_MS = 2650;`,
  "stable cinematic constants",
);

replaceRequired(
  `const CAREER_ENTRY_ZOOM_MS = 1950;`,
  `const CAREER_ENTRY_ZOOM_MS = 900;`,
  "entry handoff duration",
);

// Limit route generation to three deterministic starting variants. The same
// nearest-neighbour curve construction and camera interpolation remain intact.
replaceRequired(
  `    const seed = Date.now() % deepNodes.length;\n    const initDest = deepNodes[seed] ?? allNodes[0];`,
  `    const routeVariant = Math.floor(Math.random() * 3);\n    const routeVariantIndexes = [\n      0,\n      Math.floor(deepNodes.length / 3),\n      Math.floor((deepNodes.length * 2) / 3),\n    ];\n    const seed = routeVariantIndexes[routeVariant] ?? 0;\n    const initDest = deepNodes[seed] ?? allNodes[0];`,
  "three stable route variants",
);

// Pointer movement may steer the camera only while no planet is actually under
// the pointer. Hovering a planet freezes both camera position and gaze target so
// the hit target and title cannot drift away from the user.
replaceRequired(
  `          if (userControlActive) {\n            // Mouse movement hands control to the user immediately. Freeze forward\n            // translation at the exact cruise distance and only steer the gaze.\n            // This removes camera-position jitter while preserving responsive looking.\n            camPos.copy(camPosSmoothed);\n            camTarget.copy(cruiseAhead)\n              .addScaledVector(cruiseRight, steerX * CAREER_ORBIT_STEER_X)\n              .addScaledVector(cruiseVertical, steerY * CAREER_ORBIT_STEER_Y);\n          } else {`,
  `          if (hoveredPlanet) {\n            // Hover means literal frame freeze. The camera pose itself is preserved\n            // later in the render pipeline, so no hover-specific retarget belongs here.\n            camPos.copy(camPosSmoothed);\n            camTarget.copy(camTargetSmoothed);\n          } else if (userControlActive) {\n            // Free-space pointer movement can steer the gaze without translating\n            // the ship. It must never compete with a locked hover target.\n            camPos.copy(camPosSmoothed);\n            camTarget.copy(cruiseAhead)\n              .addScaledVector(cruiseRight, steerX * CAREER_ORBIT_STEER_X)\n              .addScaledVector(cruiseVertical, steerY * CAREER_ORBIT_STEER_Y);\n          } else {`,
  "hover-locked camera arbitration",
);

replaceRequired(
  `          if (userControlActive && cruiseFocusNode) {`,
  `          if (userControlActive && cruiseFocusNode && !hoveredPlanet) {`,
  "hover-safe automatic focus clearing",
);

// Hover never changes the visual size of a Career node. This removes the 30%
// scale jump that made the planet appear to move under a stationary pointer.
replaceRequired(
  `        if (isHovered) scale *= 1.3;`,
  `        // Keep hovered geometry at the exact pre-hover scale for a stable hit target.`,
  "hover planet scale jump",
);

// Remove the legacy hover retarget. Hover means one thing only: freeze the exact
// frame that the user acquired, keep the title projected, and wait for click.
replaceRequired(
  `          if (hoveredPlanet) {\n            // Hover is a stronger intent than the automatic cadence. Keep the\n            // viewer physically still and look only at the hovered Career.\n            cruiseFocusNode = null;\n            cruisePauseUntil = 0;\n            nextCruiseFocusAt = Math.max(nextCruiseFocusAt, now + 900);\n            camPos.copy(camPosSmoothed);\n            cruiseFocusPosition.set(...hoveredPlanet.position);\n            camTarget.copy(cruiseFocusPosition);\n            if (now - lastCruiseLabelProjectionAt > 60) {\n              lastCruiseLabelProjectionAt = now;\n              showCruiseLabel(hoveredPlanet);\n            }\n          } else if (o.isDragging) {`,
  `          if (hoveredPlanet) {\n            // True frame freeze: no retarget, orbit adjustment, zoom, or camera\n            // interpolation is allowed while a planet is under the pointer.\n            cruiseFocusNode = null;\n            cruisePauseUntil = 0;\n            nextCruiseFocusAt = Math.max(nextCruiseFocusAt, now + 900);\n            camPos.copy(camPosSmoothed);\n            camTarget.copy(camTargetSmoothed);\n            if (now - lastCruiseLabelProjectionAt > 60) {\n              lastCruiseLabelProjectionAt = now;\n              showCruiseLabel(hoveredPlanet);\n            }\n          } else if (o.isDragging) {`,
  "true frame-freeze hover",
);

// Freeze the *rendered* camera frame as well. Upstream smoothing and cockpit roll
// otherwise continue changing the pose for several RAF frames after hover starts.
replaceRequired(
  `      // Smooth camera\n      const lerpSpeed = phase === "idle" ? 2.5 : phase === "exploring" ? 3.2 : 5.5;\n      camPosSmoothed.lerp(camPos, delta * lerpSpeed);\n      camTargetSmoothed.lerp(camTarget, delta * lerpSpeed);\n      camera.position.copy(camPosSmoothed);\n      camera.lookAt(camTargetSmoothed);\n      if (phase === "exploring") {\n        const o = orbitRef.current;\n        const focusSuppressesBank = hoveredNodeRef.current !== null || performance.now() - lastPointerActivityAt < CAREER_USER_CONTROL_TAKEOVER_MS;\n        const roll = focusSuppressesBank ? 0 : THREE.MathUtils.clamp(-(mouse.x + o.yaw * 0.18) * 0.022, -0.034, 0.034);\n        camera.rotateZ(roll);\n      }`,
  `      // Hover is a literal freeze of the last rendered camera frame. Do not\n      // smooth, retarget, or roll until the pointer leaves the Career node.\n      const hoverFrameFrozen = phase === "exploring" && hoveredNodeRef.current !== null;\n      if (!hoverFrameFrozen) {\n        const lerpSpeed = phase === "idle" ? 2.5 : phase === "exploring" ? 3.2 : 5.5;\n        camPosSmoothed.lerp(camPos, delta * lerpSpeed);\n        camTargetSmoothed.lerp(camTarget, delta * lerpSpeed);\n        camera.position.copy(camPosSmoothed);\n        camera.lookAt(camTargetSmoothed);\n        if (phase === "exploring") {\n          const o = orbitRef.current;\n          const focusSuppressesBank = performance.now() - lastPointerActivityAt < CAREER_USER_CONTROL_TAKEOVER_MS;\n          const roll = focusSuppressesBank ? 0 : THREE.MathUtils.clamp(-(mouse.x + o.yaw * 0.18) * 0.022, -0.034, 0.034);\n          camera.rotateZ(roll);\n        }\n      }`,
  "render-pipeline hover freeze",
);

// Replace proximity-dependent focus discovery with a screen-space cadence. The
// camera still follows exactly the natural closed curve; every ~3.6 s we choose
// the best already-visible Career rather than waiting an unpredictable time for
// a node to cross a narrow distance threshold.
const candidateStart = `            if (!reduceMotion && now >= nextCruiseFocusAt) {\n              let focusCandidate: CareerNode | null = null;\n              let focusCandidateScore = Number.POSITIVE_INFINITY;`;
const candidateEnd = `              } else {\n                // No suitable Career is naturally in front yet. Keep flying and retry\n                // shortly rather than cutting the camera toward a distant planet.\n                nextCruiseFocusAt = now + 420;\n              }\n            }`;

const stableCandidateBlock = `            if (!reduceMotion && now >= nextCruiseFocusAt) {
              let focusCandidate: CareerNode | null = null;
              let focusCandidateScore = Number.POSITIVE_INFINITY;

              for (const node of cruiseNodes) {
                if (node.id === lastCruiseNodeId) continue;
                const projected = new THREE.Vector3(...node.position).project(camera);
                const visible = projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 0.92 && Math.abs(projected.y) < 0.82;
                if (!visible) continue;

                const nodePosition = new THREE.Vector3(...node.position);
                const distance = nodePosition.distanceTo(cruisePosition);
                const recentPenalty = recentCruiseFocusIds.includes(node.id) ? 70 : 0;
                const centrePenalty = Math.abs(projected.x) * 14 + Math.abs(projected.y) * 10;
                const score = distance * 0.42 + centrePenalty + recentPenalty;
                if (score < focusCandidateScore) {
                  focusCandidateScore = score;
                  focusCandidate = node;
                }
              }

              if (focusCandidate) {
                const holdMs = renderer.domElement.clientWidth < 768 ? 1400 : CAREER_ORBIT_FOCUS_HOLD_MS;
                cruiseFocusNode = focusCandidate;
                cruiseFocusPosition.set(...focusCandidate.position);
                cruisePauseUntil = now + holdMs;
                nextCruiseFocusAt = now + CAREER_STABLE_FOCUS_INTERVAL_MS;
                lastCruiseNodeId = focusCandidate.id;
                recentCruiseFocusIds.push(focusCandidate.id);
                if (recentCruiseFocusIds.length > 5) recentCruiseFocusIds.shift();

                // Presentation only: do not move or retarget the camera.
                showCruiseLabel(focusCandidate);
                lastCruiseLabelProjectionAt = now;
              } else {
                // Retry quickly without changing the route. This bounds cadence drift
                // while still requiring the Career to be genuinely on screen.
                nextCruiseFocusAt = now + 240;
              }
            }`;

replaceSection(candidateStart, candidateEnd, stableCandidateBlock, "stable visible-Career cadence");

// Single click starts a real camera approach first. Only after the ship has
// moved close to the selected planet do we use the short radial handoff overlay
// and navigate to the Career workspace.
replaceRequired(
  `          if (entry?.careerPath) {\n            scheduleCareerEntry(node, entry.careerPath, e.clientX, e.clientY);\n            return;\n          }`,
  `          if (entry?.careerPath) {\n            const careerPath = entry.careerPath;\n            destNodeRef.current = node;\n            destPosRef.current.set(...node.position);\n            destCamPosRef.current.set(node.position[0], node.position[1] + 0.7, node.position[2] + 3.2);\n            startCamPosRef.current.copy(camPosSmoothed);\n            startCamTargetRef.current.copy(camTargetSmoothed);\n            activeCameraBehaviorRef.current = CAMERA_BEHAVIORS.find((behavior) => behavior.name === "forwardFlyIn") ?? CAMERA_BEHAVIORS[0];\n            rebuildConnections(node);\n            o.yaw = 0;\n            o.pitch = 0;\n            travelToRef.current(node);\n            hideCruiseLabel();\n            const reduceEntryMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;\n            window.setTimeout(() => {\n              scheduleCareerEntry(node, careerPath, e.clientX, e.clientY);\n            }, reduceEntryMotion ? 120 : CAREER_LANDING_APPROACH_MS);\n            return;\n          }`,
  "single-click cinematic landing",
);

// Completing the onboarding is distinct from dismissing it. Persist completion
// first, then always return the user to the landing page instead of leaving them
// on the final Career Workspace used by the walkthrough.
if (!tourSource.includes("const finishTour = useCallback")) {
  replaceTourRequired(
    `  const closeTour = useCallback((status: "completed" | "dismissed") => {\n    writeTourStatus(status);\n    setInviteOpen(false);\n    setActive(false);\n    setTargetRect(null);\n    setTargetReady(false);\n    targetRef.current = null;\n  }, []);`,
    `  const closeTour = useCallback((status: "completed" | "dismissed") => {\n    writeTourStatus(status);\n    setInviteOpen(false);\n    setActive(false);\n    setTargetRect(null);\n    setTargetReady(false);\n    targetRef.current = null;\n  }, []);\n\n  const finishTour = useCallback(() => {\n    closeTour("completed");\n    window.location.assign("/");\n  }, [closeTour]);`,
    "tour completion handler",
  );
  replaceTourRequired(
    `onClick={() => closeTour("completed")}`,
    `onClick={finishTour}`,
    "Finish button completion action",
  );
}

if (!source.includes("CAREER_UNIVERSE_STABLE_CINEMATIC_V4 = true")) {
  throw new Error("Career Universe stable cinematic patch failed: marker missing.");
}
if (!source.includes("CAREER_STABLE_FOCUS_INTERVAL_MS = 3600")) {
  throw new Error("Career Universe stable cinematic patch failed: stable cadence missing.");
}
if (source.includes("if (isHovered) scale *= 1.3;")) {
  throw new Error("Career Universe stable cinematic patch failed: hover scale jump remains.");
}
if (!source.includes(`const hoverFrameFrozen = phase === "exploring" && hoveredNodeRef.current !== null;`)) {
  throw new Error("Career Universe stable cinematic patch failed: rendered frame freeze missing.");
}
if (!source.includes("CAREER_LANDING_APPROACH_MS")) {
  throw new Error("Career Universe stable cinematic patch failed: landing approach missing.");
}
if (!tourSource.includes("window.location.assign(\"/\")") || !tourSource.includes("onClick={finishTour}")) {
  throw new Error("Guided Tour completion patch failed: landing-page return is missing.");
}

await Promise.all([
  writeFile(worldPath, source, "utf8"),
  writeFile(tourPath, tourSource, "utf8"),
]);
console.log("Career Universe stable cinematic applied: three route variants, ~3.6s reveal cadence, zero-motion hover freeze, deliberate click landing, and Guided Tour home return.");