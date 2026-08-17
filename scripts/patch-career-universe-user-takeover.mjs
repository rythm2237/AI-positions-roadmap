import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const worldPath = path.join(root, "src/components/opening-scene/World.tsx");
let source = await readFile(worldPath, "utf8");

if (source.includes("const CAREER_USER_CONTROL_TAKEOVER_MS = 3200;")) {
  console.log("Career Universe user takeover patch already applied.");
  process.exit(0);
}

function replaceRequired(search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error(`Career Universe user takeover patch failed: could not locate ${label}.`);
  }
  source = source.replace(search, replacement);
}

if (!source.includes("const CAREER_CINEMATIC_PREVIEW = true;")) {
  throw new Error("Career Universe user takeover patch requires the cinematic preview patch first.");
}

// Slow the final planet-entry transition enough for the user to perceive the
// surface detail and feel a deliberate approach instead of an instantaneous wipe.
replaceRequired(
  `const CAREER_ENTRY_ZOOM_MS = 1080;`,
  `const CAREER_ENTRY_ZOOM_MS = 1950;\nconst CAREER_USER_CONTROL_TAKEOVER_MS = 3200;`,
  "planet entry duration",
);

replaceRequired(
  `const pointerState = { clientX: 0, clientY: 0, inside: false };`,
  `const pointerState = { clientX: 0, clientY: 0, inside: false };\n    let lastPointerActivityAt = Number.NEGATIVE_INFINITY;`,
  "pointer activity state",
);

replaceRequired(
  `function onPointerDown(e: PointerEvent) {\n      orbitRef.current.isDragging = true;`,
  `function onPointerDown(e: PointerEvent) {\n      lastPointerActivityAt = performance.now();\n      orbitRef.current.isDragging = true;`,
  "pointer-down takeover",
);

replaceRequired(
  `pointerState.inside = true;\n      const o = orbitRef.current;`,
  `pointerState.inside = true;\n      lastPointerActivityAt = performance.now();\n      const o = orbitRef.current;`,
  "pointer-move takeover",
);

replaceRequired(
  `const focusLocked = cruiseFocusNode !== null && now < cruisePauseUntil;\n          const interactionPaused = hoveredPlanet !== null || o.isDragging;\n          const motionPaused = reduceMotion || focusLocked || interactionPaused;`,
  `const userControlActive = now - lastPointerActivityAt < CAREER_USER_CONTROL_TAKEOVER_MS;\n          if (userControlActive && cruiseFocusNode) {\n            // Explicit user input always wins over an automatic Career focus.\n            // Clear the focus before camera targets are calculated so two systems\n            // can never fight over the same frame.\n            cruiseFocusNode = null;\n            cruisePauseUntil = 0;\n            hideCruiseLabel();\n          }\n          const focusLocked = cruiseFocusNode !== null && now < cruisePauseUntil;\n          const interactionPaused = hoveredPlanet !== null || o.isDragging || userControlActive;\n          const motionPaused = reduceMotion || focusLocked || interactionPaused;`,
  "exclusive user-control arbitration",
);

replaceRequired(
  `if (focusLocked) {\n            // During an automatic Career reveal, both camera position and target are\n            // locked to fixed vectors. This prevents pointer steering, nearest-node\n            // attraction, and route look-ahead from competing for the camera target.\n            camPos.copy(cruiseFocusCameraPosition);\n            camTarget.copy(cruiseFocusPosition);\n          } else {\n            camPos.copy(cruisePosition)\n              .addScaledVector(cruiseRight, steerX * 1.15)\n              .addScaledVector(cruiseVertical, steerY * 0.7);\n            camTarget.copy(cruiseAhead)\n              .addScaledVector(cruiseRight, steerX * CAREER_ORBIT_STEER_X)\n              .addScaledVector(cruiseVertical, steerY * CAREER_ORBIT_STEER_Y);\n          }`,
  `if (focusLocked) {\n            // During an automatic Career reveal, both camera position and target are\n            // locked to fixed vectors.\n            camPos.copy(cruiseFocusCameraPosition);\n            camTarget.copy(cruiseFocusPosition);\n          } else if (userControlActive) {\n            // Mouse movement hands control to the user immediately. Freeze forward\n            // translation at the exact cruise distance and only steer the gaze.\n            // This removes camera-position jitter while preserving responsive looking.\n            camPos.copy(camPosSmoothed);\n            camTarget.copy(cruiseAhead)\n              .addScaledVector(cruiseRight, steerX * CAREER_ORBIT_STEER_X)\n              .addScaledVector(cruiseVertical, steerY * CAREER_ORBIT_STEER_Y);\n          } else {\n            camPos.copy(cruisePosition)\n              .addScaledVector(cruiseRight, steerX * 1.15)\n              .addScaledVector(cruiseVertical, steerY * 0.7);\n            camTarget.copy(cruiseAhead)\n              .addScaledVector(cruiseRight, steerX * CAREER_ORBIT_STEER_X)\n              .addScaledVector(cruiseVertical, steerY * CAREER_ORBIT_STEER_Y);\n          }`,
  "manual camera takeover",
);

replaceRequired(
  `} else if (focusLocked && cruiseFocusNode) {`,
  `} else if (userControlActive) {\n            // Keep automatic presentation dormant while the user is looking around.\n            // After 3.2s without pointer movement the existing cruiseDistance resumes\n            // from exactly where it was frozen.\n            nextCruiseFocusAt = Math.max(nextCruiseFocusAt, now + 500);\n            hideCruiseLabel();\n          } else if (focusLocked && cruiseFocusNode) {`,
  "manual-control focus suppression",
);

replaceRequired(
  `const focusSuppressesBank = performance.now() < cruisePauseUntil || hoveredNodeRef.current !== null;`,
  `const focusSuppressesBank = performance.now() < cruisePauseUntil || hoveredNodeRef.current !== null || performance.now() - lastPointerActivityAt < CAREER_USER_CONTROL_TAKEOVER_MS;`,
  "manual-control bank suppression",
);

replaceRequired(
  `const pulse = 1 + Math.sin(t * 1.8 + i * 0.7) * 0.06;`,
  `const pointerStabilizesPlanets = performance.now() - lastPointerActivityAt < CAREER_USER_CONTROL_TAKEOVER_MS;\n        const pulse = pointerStabilizesPlanets ? 1 : 1 + Math.sin(t * 1.8 + i * 0.7) * 0.06;`,
  "stable hover target geometry",
);

replaceRequired(
  `transition: "transform " + CAREER_ENTRY_ZOOM_MS + "ms cubic-bezier(.65,0,.35,1), box-shadow " + CAREER_ENTRY_ZOOM_MS + "ms ease",`,
  `transition: "transform " + CAREER_ENTRY_ZOOM_MS + "ms cubic-bezier(.28,.08,.18,1), box-shadow " + CAREER_ENTRY_ZOOM_MS + "ms ease",`,
  "slower cinematic entry easing",
);

if (!source.includes("CAREER_ENTRY_ZOOM_MS = 1950")) {
  throw new Error("Career Universe user takeover patch failed: slower planet entry is missing.");
}
if (!source.includes("userControlActive")) {
  throw new Error("Career Universe user takeover patch failed: user-control arbitration is missing.");
}
if (!source.includes("pointerStabilizesPlanets")) {
  throw new Error("Career Universe user takeover patch failed: stable hover geometry is missing.");
}

await writeFile(worldPath, source, "utf8");
console.log("Career Universe user takeover applied: slower 1.95s planet entry, immediate pointer control, stable hover, and 3.2s idle cruise resume.");
