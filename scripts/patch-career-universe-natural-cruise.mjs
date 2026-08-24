import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const worldPath = path.join(root, "src/components/opening-scene/World.tsx");
let source = await readFile(worldPath, "utf8");

if (source.includes("const CAREER_NATURAL_CRUISE = true;")) {
  console.log("Career Universe natural cruise patch already applied.");
  await import("./patch-mobile-universe-continuity.mjs");
  process.exit(0);
}

function replaceRequired(search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error(`Career Universe natural cruise patch failed: could not locate ${label}.`);
  }
  source = source.replace(search, replacement);
}

if (!source.includes("const CAREER_USER_CONTROL_TAKEOVER_MS = 3200;")) {
  throw new Error("Career Universe natural cruise patch requires the user takeover patch first.");
}

replaceRequired(
  `const CAREER_ENTRY_ZOOM_MS = 1950;\nconst CAREER_USER_CONTROL_TAKEOVER_MS = 3200;`,
  `const CAREER_ENTRY_ZOOM_MS = 1950;\nconst CAREER_USER_CONTROL_TAKEOVER_MS = 3200;\nconst CAREER_NATURAL_CRUISE = true;\nconst CAREER_NATURAL_FOCUS_MAX_DISTANCE = 34;\nconst CAREER_NATURAL_FOCUS_MIN_FORWARD_DOT = 0.2;`,
  "natural cruise constants",
);

replaceRequired(
  `const motionPaused = reduceMotion || focusLocked || interactionPaused;`,
  `const motionPaused = reduceMotion || interactionPaused;`,
  "continuous cruise motion",
);

replaceRequired(
  `if (focusLocked) {\n            // During an automatic Career reveal, both camera position and target are\n            // locked to fixed vectors.\n            camPos.copy(cruiseFocusCameraPosition);\n            camTarget.copy(cruiseFocusPosition);\n          } else if (userControlActive) {`,
  `if (userControlActive) {`,
  "remove automatic camera reframing",
);

replaceRequired(
  `          } else if (focusLocked && cruiseFocusNode) {\n            camPos.copy(cruiseFocusCameraPosition);\n            camTarget.copy(cruiseFocusPosition);\n            if (now - lastCruiseLabelProjectionAt > 60) {`,
  `          } else if (focusLocked && cruiseFocusNode) {\n            // Natural fly-by: the camera never changes course or target for a label.\n            // We only keep projecting the Career title while the ship continues.\n            if (now - lastCruiseLabelProjectionAt > 60) {`,
  "label-only natural focus",
);

const candidateStart = `            if (!reduceMotion && now >= nextCruiseFocusAt) {\n              let focusCandidate: CareerNode | null = null;\n              let focusCandidateScore = Number.POSITIVE_INFINITY;`;
const candidateEnd = `              } else {\n                nextCruiseFocusAt = now + 500;\n              }\n            }`;
const startIndex = source.indexOf(candidateStart);
if (startIndex < 0) throw new Error("Career Universe natural cruise patch failed: could not locate candidate selection start.");
const endIndex = source.indexOf(candidateEnd, startIndex);
if (endIndex < 0) throw new Error("Career Universe natural cruise patch failed: could not locate candidate selection end.");
const endExclusive = endIndex + candidateEnd.length;

const naturalCandidateBlock = `            if (!reduceMotion && now >= nextCruiseFocusAt) {
              let focusCandidate: CareerNode | null = null;
              let focusCandidateScore = Number.POSITIVE_INFINITY;

              // Only introduce Careers that are already naturally ahead of the camera.
              // The camera never steers toward a Career; the Career earns a label by
              // entering the viewer's path and field of view.
              for (const node of cruiseNodes) {
                if (node.id === lastCruiseNodeId) continue;
                const nodePosition = new THREE.Vector3(...node.position);
                const toNode = nodePosition.clone().sub(cruisePosition);
                const distance = toNode.length();
                if (distance > CAREER_NATURAL_FOCUS_MAX_DISTANCE || distance < 0.001) continue;

                const direction = toNode.clone().multiplyScalar(1 / distance);
                const forwardDot = cruiseTangent.dot(direction);
                if (forwardDot < CAREER_NATURAL_FOCUS_MIN_FORWARD_DOT) continue;

                const recentPenalty = recentCruiseFocusIds.includes(node.id) ? 50 : 0;
                const centrePenalty = (1 - forwardDot) * 18;
                const score = distance + centrePenalty + recentPenalty;
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
                nextCruiseFocusAt = now + CAREER_ORBIT_FOCUS_INTERVAL_MS;
                lastCruiseNodeId = focusCandidate.id;
                recentCruiseFocusIds.push(focusCandidate.id);
                if (recentCruiseFocusIds.length > 5) recentCruiseFocusIds.shift();

                // Presentation state only. Do not set destination, rebuild connections,
                // reposition the camera, or retarget the lens.
                showCruiseLabel(focusCandidate);
                lastCruiseLabelProjectionAt = now;
              } else {
                // No suitable Career is naturally in front yet. Keep flying and retry
                // shortly rather than cutting the camera toward a distant planet.
                nextCruiseFocusAt = now + 420;
              }
            }`;

source = source.slice(0, startIndex) + naturalCandidateBlock + source.slice(endExclusive);

replaceRequired(
  `const focusSuppressesBank = performance.now() < cruisePauseUntil || hoveredNodeRef.current !== null || performance.now() - lastPointerActivityAt < CAREER_USER_CONTROL_TAKEOVER_MS;`,
  `const focusSuppressesBank = hoveredNodeRef.current !== null || performance.now() - lastPointerActivityAt < CAREER_USER_CONTROL_TAKEOVER_MS;`,
  "keep gentle bank during natural labels",
);

if (!source.includes("const CAREER_NATURAL_CRUISE = true;")) {
  throw new Error("Career Universe natural cruise patch failed: marker missing.");
}
if (source.includes("camPos.copy(cruiseFocusCameraPosition);\n            camTarget.copy(cruiseFocusPosition);")) {
  throw new Error("Career Universe natural cruise patch failed: automatic camera lock still exists.");
}
if (!source.includes("distance > CAREER_NATURAL_FOCUS_MAX_DISTANCE")) {
  throw new Error("Career Universe natural cruise patch failed: natural field-of-view selection missing.");
}

await writeFile(worldPath, source, "utf8");
await import("./patch-mobile-universe-continuity.mjs");
console.log("Career Universe natural cruise applied: uninterrupted camera path, no auto-reframe cuts, forward-field Career labels, gentle continuous motion, and mobile continuity hardening.");
