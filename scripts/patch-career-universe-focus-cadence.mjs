import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const worldPath = path.join(root, "src/components/opening-scene/World.tsx");
let source = await readFile(worldPath, "utf8");

if (source.includes("const CAREER_ORBIT_FOCUS_INTERVAL_MS = 3500;")) {
  console.log("Career Universe focus cadence patch already applied.");
  process.exit(0);
}

function replaceRequired(search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error(`Career Universe focus cadence patch failed: could not locate ${label}.`);
  }
  source = source.replace(search, replacement);
}

function replaceSection(startMarker, endMarker, replacement, label) {
  let start = source.indexOf(startMarker);
  if (start < 0) start = source.indexOf(startMarker.trim());
  let end = source.indexOf(endMarker, Math.max(0, start) + startMarker.trim().length);
  if (end < 0) end = source.indexOf(endMarker.trim(), Math.max(0, start) + startMarker.trim().length);
  if (start < 0 || end < 0) {
    throw new Error(`Career Universe focus cadence patch failed: could not locate ${label}.`);
  }
  source = `${source.slice(0, start)}${replacement.trim()}\n\n${source.slice(end)}`;
}

if (!source.includes("const CAREER_IMMERSIVE_PILOT_SPEED = 4.2;")) {
  throw new Error("Career Universe focus cadence patch requires the immersive pilot patch first.");
}

replaceRequired(
  `const CAREER_IMMERSIVE_PILOT_SPEED = 4.2;\nconst CAREER_ORBIT_PAUSE_MS = 1900;\nconst CAREER_ORBIT_LABEL_RADIUS = 18;`,
  `const CAREER_IMMERSIVE_PILOT_SPEED = 4.2;\nconst CAREER_ORBIT_FOCUS_INTERVAL_MS = 3500;\nconst CAREER_ORBIT_FOCUS_HOLD_MS = 1650;\nconst CAREER_ORBIT_LABEL_RADIUS = 18;`,
  "focus timing constants",
);

replaceRequired(
  `    let activeCruiseLabelId: string | null = null;\n    let lastCruiseLabelProjectionAt = 0;`,
  `    let activeCruiseLabelId: string | null = null;\n    let lastCruiseLabelProjectionAt = 0;\n    let nextCruiseFocusAt = 0;\n    let cruiseFocusNode: CareerNode | null = null;\n    const cruiseFocusPosition = new THREE.Vector3();\n    const cruiseFocusCameraPosition = new THREE.Vector3();\n    const recentCruiseFocusIds: string[] = [];`,
  "stable focus-lock state",
);

replaceSection(
  `      } else if (phase === "arrived") {`,
  `      // Smooth camera`,
  `      } else if (phase === "arrived") {
        camPos.copy(destCamPosRef.current);
        camTarget.copy(destPosRef.current);
        const now = performance.now();
        if (destNodeRef.current && now - lastCruiseLabelProjectionAt > 80) {
          lastCruiseLabelProjectionAt = now;
          showCruiseLabel(destNodeRef.current);
        }
      } else if (phase === "exploring") {
        const now = performance.now();
        const o = orbitRef.current;
        const hoveredPlanet = hoveredNodeRef.current;

        if (!cruiseStarted) {
          cruiseStarted = true;
          cruiseDistance = 0;
          cruisePauseUntil = 0;
          nextCruiseFocusAt = now + 900;
          cruiseFocusNode = null;
          lastCruiseNodeId = destNodeRef.current?.id ?? initDest.id;
          recentCruiseFocusIds.length = 0;
          if (lastCruiseNodeId) recentCruiseFocusIds.push(lastCruiseNodeId);
          hideCruiseLabel();
        }

        if (!cruiseEnabledRef.current) {
          camPos.copy(camPosSmoothed);
          camTarget.copy(camTargetSmoothed);
          cruiseFocusNode = null;
          hideCruiseLabel();
        } else {
          const focusLocked = cruiseFocusNode !== null && now < cruisePauseUntil;
          const interactionPaused = hoveredPlanet !== null || o.isDragging;
          const motionPaused = reduceMotion || focusLocked || interactionPaused;

          if (!motionPaused) {
            cruiseDistance = (cruiseDistance + CAREER_IMMERSIVE_PILOT_SPEED * delta) % cruiseLength;
          }

          const u = (cruiseDistance % cruiseLength) / cruiseLength;
          const aheadStep = Math.min(0.018, Math.max(0.005, 7 / cruiseLength));
          const cruisePosition = cruiseCurve.getPointAt(u);
          const cruiseAhead = cruiseCurve.getPointAt((u + aheadStep) % 1);
          const cruiseTangent = cruiseCurve.getTangentAt(u).normalize();
          const cruiseRight = new THREE.Vector3().crossVectors(cruiseTangent, cruiseUp);
          if (cruiseRight.lengthSq() < 0.0001) cruiseRight.set(1, 0, 0);
          cruiseRight.normalize();
          const cruiseVertical = new THREE.Vector3().crossVectors(cruiseRight, cruiseTangent).normalize();

          const steerX = THREE.MathUtils.clamp(mouse.x + o.yaw * 0.18, -1.15, 1.15);
          const steerY = THREE.MathUtils.clamp(-mouse.y + o.pitch * 0.22, -1.0, 1.0);

          if (focusLocked) {
            // During an automatic Career reveal, both camera position and target are
            // locked to fixed vectors. This prevents pointer steering, nearest-node
            // attraction, and route look-ahead from competing for the camera target.
            camPos.copy(cruiseFocusCameraPosition);
            camTarget.copy(cruiseFocusPosition);
          } else {
            camPos.copy(cruisePosition)
              .addScaledVector(cruiseRight, steerX * 1.15)
              .addScaledVector(cruiseVertical, steerY * 0.7);
            camTarget.copy(cruiseAhead)
              .addScaledVector(cruiseRight, steerX * CAREER_ORBIT_STEER_X)
              .addScaledVector(cruiseVertical, steerY * CAREER_ORBIT_STEER_Y);
          }

          if (hoveredPlanet) {
            // Hover is a stronger intent than the automatic cadence. Keep the
            // viewer physically still and look only at the hovered Career.
            cruiseFocusNode = null;
            cruisePauseUntil = 0;
            nextCruiseFocusAt = Math.max(nextCruiseFocusAt, now + 900);
            camPos.copy(camPosSmoothed);
            cruiseFocusPosition.set(...hoveredPlanet.position);
            camTarget.copy(cruiseFocusPosition);
            if (now - lastCruiseLabelProjectionAt > 60) {
              lastCruiseLabelProjectionAt = now;
              showCruiseLabel(hoveredPlanet);
            }
          } else if (o.isDragging) {
            // Dragging intentionally suspends automatic presentation. Resume the
            // cadence shortly after release instead of snapping immediately.
            cruiseFocusNode = null;
            cruisePauseUntil = 0;
            nextCruiseFocusAt = Math.max(nextCruiseFocusAt, now + 900);
            hideCruiseLabel();
          } else if (focusLocked && cruiseFocusNode) {
            camPos.copy(cruiseFocusCameraPosition);
            camTarget.copy(cruiseFocusPosition);
            if (now - lastCruiseLabelProjectionAt > 60) {
              lastCruiseLabelProjectionAt = now;
              showCruiseLabel(cruiseFocusNode);
            }
          } else {
            if (cruiseFocusNode && now >= cruisePauseUntil) {
              cruiseFocusNode = null;
              hideCruiseLabel();
            }

            if (!reduceMotion && now >= nextCruiseFocusAt) {
              let focusCandidate: CareerNode | null = null;
              let focusCandidateScore = Number.POSITIVE_INFINITY;

              for (const node of cruiseNodes) {
                if (node.id === lastCruiseNodeId) continue;
                const nodePosition = new THREE.Vector3(...node.position);
                const toNode = nodePosition.clone().sub(cruisePosition);
                const distance = toNode.length();
                const direction = distance > 0.001 ? toNode.clone().multiplyScalar(1 / distance) : cruiseTangent;
                const behindPenalty = Math.max(0, -cruiseTangent.dot(direction)) * 18;
                const recentPenalty = recentCruiseFocusIds.includes(node.id) ? 80 : 0;
                const score = distance + behindPenalty + recentPenalty;
                if (score < focusCandidateScore) {
                  focusCandidateScore = score;
                  focusCandidate = node;
                }
              }

              if (focusCandidate) {
                const holdMs = renderer.domElement.clientWidth < 768 ? 1950 : CAREER_ORBIT_FOCUS_HOLD_MS;
                cruiseFocusNode = focusCandidate;
                cruiseFocusPosition.set(...focusCandidate.position);
                cruiseFocusCameraPosition.copy(camPosSmoothed);
                cruisePauseUntil = now + holdMs;
                nextCruiseFocusAt = now + CAREER_ORBIT_FOCUS_INTERVAL_MS;
                lastCruiseNodeId = focusCandidate.id;
                recentCruiseFocusIds.push(focusCandidate.id);
                if (recentCruiseFocusIds.length > 5) recentCruiseFocusIds.shift();

                destNodeRef.current = focusCandidate;
                destPosRef.current.copy(cruiseFocusPosition);
                setDestination(focusCandidate);
                rebuildConnections(focusCandidate);
                camPos.copy(cruiseFocusCameraPosition);
                camTarget.copy(cruiseFocusPosition);
                showCruiseLabel(focusCandidate);
                lastCruiseLabelProjectionAt = now;
              } else {
                nextCruiseFocusAt = now + 500;
              }
            }
          }
        }
      }

      // Smooth camera`,
  "cadenced stable Career focus camera",
);

replaceRequired(
  `      if (phase === "exploring") {\n        const o = orbitRef.current;\n        const roll = THREE.MathUtils.clamp(-(mouse.x + o.yaw * 0.18) * 0.022, -0.034, 0.034);\n        camera.rotateZ(roll);\n      }`,
  `      if (phase === "exploring") {\n        const o = orbitRef.current;\n        const focusSuppressesBank = performance.now() < cruisePauseUntil || hoveredNodeRef.current !== null;\n        const roll = focusSuppressesBank ? 0 : THREE.MathUtils.clamp(-(mouse.x + o.yaw * 0.18) * 0.022, -0.034, 0.034);\n        camera.rotateZ(roll);\n      }`,
  "focus-safe cockpit banking",
);

if (!source.includes("CAREER_ORBIT_FOCUS_INTERVAL_MS = 3500")) {
  throw new Error("Career Universe focus cadence patch failed: 3.5 second focus cadence is missing.");
}
if (!source.includes("camPos.copy(cruiseFocusCameraPosition)")) {
  throw new Error("Career Universe focus cadence patch failed: camera position lock is missing.");
}
if (!source.includes("camTarget.copy(cruiseFocusPosition)")) {
  throw new Error("Career Universe focus cadence patch failed: stable target lock is missing.");
}
if (!source.includes("focusSuppressesBank")) {
  throw new Error("Career Universe focus cadence patch failed: bank suppression is missing.");
}

await writeFile(worldPath, source, "utf8");
console.log("Career Universe focus cadence applied: ~3.5s Career reveals with stable focus-lock framing and no competing camera targets.");
