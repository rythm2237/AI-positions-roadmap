import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const worldPath = path.join(root, "src/components/opening-scene/World.tsx");
let source = await readFile(worldPath, "utf8");

if (source.includes("const CAREER_UNIVERSE_STABLE_CINEMATIC_V3 = true;")) {
  console.log("Career Universe stable cinematic patch already applied.");
  process.exit(0);
}

function replaceRequired(search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error(`Career Universe stable cinematic patch failed: could not locate ${label}.`);
  }
  source = source.replace(search, replacement);
}

function replaceSection(startMarker, endMarker, replacement, label) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) {
    throw new Error(`Career Universe stable cinematic patch failed: could not locate ${label}.`);
  }
  source = `${source.slice(0, start)}${replacement.trim()}\n\n${source.slice(end)}`;
}

if (!source.includes("const CAREER_NATURAL_CRUISE = true;")) {
  throw new Error("Career Universe stable cinematic patch requires the natural cruise patch first.");
}

// Keep the approved natural cruise motion. Only make the presentation cadence,
// route variant, hover arbitration, and deliberate planet-entry approach stable.
replaceRequired(
  `const CAREER_NATURAL_CRUISE = true;\nconst CAREER_NATURAL_FOCUS_MAX_DISTANCE = 34;\nconst CAREER_NATURAL_FOCUS_MIN_FORWARD_DOT = 0.2;`,
  `const CAREER_NATURAL_CRUISE = true;\nconst CAREER_NATURAL_FOCUS_MAX_DISTANCE = 34;\nconst CAREER_NATURAL_FOCUS_MIN_FORWARD_DOT = 0.2;\nconst CAREER_UNIVERSE_STABLE_CINEMATIC_V3 = true;\nconst CAREER_STABLE_FOCUS_INTERVAL_MS = 3600;\nconst CAREER_LANDING_APPROACH_MS = 2650;\nconst CAREER_ENTRY_HANDOFF_MS = 900;`,
  "stable cinematic constants",
);

replaceRequired(
  `const CAREER_ENTRY_ZOOM_MS = 1950;`,
  `const CAREER_ENTRY_ZOOM_MS = CAREER_ENTRY_HANDOFF_MS;`,
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
  `          if (hoveredPlanet) {\n            // Hover lock: once the pointer acquires a planet, freeze the rendered\n            // camera pose completely. This keeps the planet and its title stationary\n            // until the user clicks or moves away.\n            camPos.copy(camPosSmoothed);\n            camTarget.copy(camTargetSmoothed);\n          } else if (userControlActive) {\n            // Free-space pointer movement can steer the gaze without translating\n            // the ship. It must never compete with a locked hover target.\n            camPos.copy(camPosSmoothed);\n            camTarget.copy(cruiseAhead)\n              .addScaledVector(cruiseRight, steerX * CAREER_ORBIT_STEER_X)\n              .addScaledVector(cruiseVertical, steerY * CAREER_ORBIT_STEER_Y);\n          } else {`,
  "hover-locked camera arbitration",
);

replaceRequired(
  `          if (userControlActive && cruiseFocusNode) {`,
  `          if (userControlActive && cruiseFocusNode && !hoveredPlanet) {`,
  "hover-safe automatic focus clearing",
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
  `          if (entry?.careerPath) {\n            destNodeRef.current = node;\n            destPosRef.current.set(...node.position);\n            destCamPosRef.current.set(node.position[0], node.position[1] + 0.7, node.position[2] + 3.2);\n            startCamPosRef.current.copy(camPosSmoothed);\n            startCamTargetRef.current.copy(camTargetSmoothed);\n            activeCameraBehaviorRef.current = CAMERA_BEHAVIORS.find((behavior) => behavior.name === "forwardFlyIn") ?? CAMERA_BEHAVIORS[0];\n            rebuildConnections(node);\n            o.yaw = 0;\n            o.pitch = 0;\n            travelToRef.current(node);\n            hideCruiseLabel();\n            const reduceEntryMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;\n            window.setTimeout(() => {\n              scheduleCareerEntry(node, entry.careerPath, e.clientX, e.clientY);\n            }, reduceEntryMotion ? 120 : CAREER_LANDING_APPROACH_MS);\n            return;\n          }`,
  "single-click cinematic landing",
);

if (!source.includes("CAREER_UNIVERSE_STABLE_CINEMATIC_V3 = true")) {
  throw new Error("Career Universe stable cinematic patch failed: marker missing.");
}
if (!source.includes("CAREER_STABLE_FOCUS_INTERVAL_MS = 3600")) {
  throw new Error("Career Universe stable cinematic patch failed: stable cadence missing.");
}
if (!source.includes("if (hoveredPlanet) {\n            // Hover lock")) {
  throw new Error("Career Universe stable cinematic patch failed: hover lock missing.");
}
if (!source.includes("CAREER_LANDING_APPROACH_MS")) {
  throw new Error("Career Universe stable cinematic patch failed: landing approach missing.");
}

await writeFile(worldPath, source, "utf8");
console.log("Career Universe stable cinematic applied: three route variants, ~3.6s reveal cadence, hover-locked targets, and deliberate camera landing before workspace handoff.");