import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const worldPath = path.join(root, "src/components/opening-scene/World.tsx");
let source = await readFile(worldPath, "utf8");

if (source.includes("const CAREER_IMMERSIVE_PILOT_SPEED = 4.2;")) {
  console.log("Career Universe immersive pilot patch already applied.");
  process.exit(0);
}

function replaceRequired(search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error(`Career Universe immersive pilot patch failed: could not locate ${label}.`);
  }
  source = source.replace(search, replacement);
}

function replaceSection(startMarker, endMarker, replacement, label) {
  let start = source.indexOf(startMarker);
  if (start < 0) start = source.indexOf(startMarker.trim());
  let end = source.indexOf(endMarker, Math.max(0, start) + startMarker.trim().length);
  if (end < 0) end = source.indexOf(endMarker.trim(), Math.max(0, start) + startMarker.trim().length);
  if (start < 0 || end < 0) {
    throw new Error(`Career Universe immersive pilot patch failed: could not locate ${label}.`);
  }
  source = `${source.slice(0, start)}${replacement.trim()}\n\n${source.slice(end)}`;
}

if (!source.includes("const CAREER_ORBIT_CRUISE_SPEED = 13.5;")) {
  throw new Error("Career Universe immersive pilot patch requires the orbital cruise patch first.");
}

replaceRequired(
  `const CAREER_ORBIT_CRUISE_SPEED = 13.5;\nconst CAREER_ORBIT_PAUSE_MS = 620;\nconst CAREER_ORBIT_LABEL_RADIUS = 16;`,
  `const CAREER_IMMERSIVE_PILOT_SPEED = 4.2;\nconst CAREER_ORBIT_PAUSE_MS = 1900;\nconst CAREER_ORBIT_LABEL_RADIUS = 18;\nconst CAREER_ORBIT_APPROACH_RADIUS = 30;\nconst CAREER_ORBIT_STEER_X = 5.5;\nconst CAREER_ORBIT_STEER_Y = 3.2;`,
  "cruise tuning constants",
);

replaceRequired(
  `  const cruiseEnabledRef = useRef(true);`,
  `  const cruiseEnabledRef = useRef(true);\n  const hoveredNodeRef = useRef<CareerNode | null>(null);`,
  "hover-pause ref",
);

replaceRequired(
  `  const setHoveredNodeState = useCallback((node: CareerNode | null, sx: number, sy: number) => {\n    setHoveredNode(node);\n    setHoverScreenPos({ x: sx, y: sy });\n    setHoveredRef.current(node?.id ?? null);\n  }, []);`,
  `  const setHoveredNodeState = useCallback((node: CareerNode | null, sx: number, sy: number) => {\n    hoveredNodeRef.current = node;\n    setHoveredNode(node);\n    setHoverScreenPos({ x: sx, y: sy });\n    setHoveredRef.current(node?.id ?? null);\n  }, []);`,
  "hover state bridge",
);

replaceRequired(
  `    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));`,
  `    renderer.setPixelRatio(Math.min(devicePixelRatio, window.innerWidth < 768 ? 1.35 : 1.75));`,
  "initial adaptive pixel ratio",
);
replaceRequired(
  `      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);`,
  `      const pixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.35 : 1.75);`,
  "resize adaptive pixel ratio",
);

replaceRequired(
  `    container.appendChild(renderer.domElement);`,
  `    container.appendChild(renderer.domElement);\n    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;`,
  "motion preference",
);

replaceRequired(
  `    const nodeGeo = new THREE.SphereGeometry(0.38, 10, 10);`,
  `    const nodeGeo = new THREE.SphereGeometry(0.58, 16, 16);`,
  "larger interactive planets",
);

replaceRequired(
  `      side.normalize().multiplyScalar(9);\n      return new THREE.Vector3(...node.position).add(side).add(new THREE.Vector3(0, 3.5, 0));`,
  `      side.normalize().multiplyScalar(7);\n      return new THREE.Vector3(...node.position).add(side).add(new THREE.Vector3(0, 2.5, 0));`,
  "closer planet fly-bys",
);

replaceSection(
  `    function hideCruiseLabel() {`,
  `    // ── Pointer events ─────────────────────────────────────────────────────`,
  `    function hideCruiseLabel() {
      activeCruiseLabelId = null;
      cruiseLabelEl.style.opacity = "0";
      cruiseLabelEl.style.transform = "translate(12px,-50%) scale(.97)";
    }

    function showCruiseLabel(node: CareerNode) {
      const rect = syncViewport();
      const projected = new THREE.Vector3(...node.position).project(camera);
      const onScreen = projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 1.05 && Math.abs(projected.y) < 1.05;
      if (!onScreen) {
        hideCruiseLabel();
        return;
      }

      const entry = UNIVERSE_REGISTRY.find((item) => item.id === node.id);
      const color = entry ? (SECTORS[entry.sectorKey]?.color ?? "#818cf8") : "#818cf8";
      const x = (projected.x * 0.5 + 0.5) * rect.width;
      const y = (-projected.y * 0.5 + 0.5) * rect.height;
      const placeLeft = x > rect.width * 0.68;
      const safeX = Math.max(22, Math.min(rect.width - 22, x));
      const safeY = Math.max(92, Math.min(rect.height - 94, y));

      activeCruiseLabelId = node.id;
      cruiseLabelTitle.textContent = node.title;
      cruiseLabelCategory.textContent = entry?.category ?? node.category;
      cruiseLabelDescription.textContent = "Explore its roadmap, skills, projects, and career evidence.";
      cruiseLabelHint.textContent = "Click or tap the planet to enter";
      cruiseLabelEl.style.left = String(safeX) + "px";
      cruiseLabelEl.style.top = String(safeY) + "px";
      cruiseLabelEl.style.borderColor = color + "66";
      cruiseLabelEl.style.boxShadow = "0 16px 44px rgba(0,0,0,.38), 0 0 28px " + color + "26";
      cruiseLabelEl.style.opacity = "1";
      cruiseLabelEl.style.transform = placeLeft
        ? "translate(calc(-100% - 18px),-50%) scale(1)"
        : "translate(18px,-50%) scale(1)";
    }

    // ── Pointer events ─────────────────────────────────────────────────────`,
  "immersive planet label functions",
);

replaceRequired(
  `    cruiseLabelEl.style.maxWidth = "260px";\n    cruiseLabelEl.style.padding = "8px 11px";`,
  `    cruiseLabelEl.style.maxWidth = "min(320px,calc(100vw - 48px))";\n    cruiseLabelEl.style.padding = "12px 14px";`,
  "label sizing",
);

replaceRequired(
  `    cruiseLabelCategory.style.lineHeight = "1.2";\n    cruiseLabelEl.append(cruiseLabelTitle, cruiseLabelCategory);`,
  `    cruiseLabelCategory.style.lineHeight = "1.2";\n    const cruiseLabelDescription = document.createElement("div");\n    cruiseLabelDescription.style.marginTop = "7px";\n    cruiseLabelDescription.style.color = "rgba(226,232,240,.72)";\n    cruiseLabelDescription.style.fontSize = "11px";\n    cruiseLabelDescription.style.lineHeight = "1.45";\n    const cruiseLabelHint = document.createElement("div");\n    cruiseLabelHint.style.marginTop = "8px";\n    cruiseLabelHint.style.color = "rgba(165,180,252,.72)";\n    cruiseLabelHint.style.fontSize = "10px";\n    cruiseLabelHint.style.fontWeight = "650";\n    cruiseLabelHint.style.letterSpacing = ".035em";\n    cruiseLabelEl.append(cruiseLabelTitle, cruiseLabelCategory, cruiseLabelDescription, cruiseLabelHint);`,
  "label explanatory copy",
);

replaceRequired(
  `          setHoveredNodeState(node, sx, sy);\n          return idx;`,
  `          setHoveredNodeState(node, sx, sy);\n          renderer.domElement.style.cursor = "pointer";\n          showCruiseLabel(node);\n          return idx;`,
  "hover pause hit state",
);
replaceRequired(
  `      setHoveredNodeState(null, 0, 0);\n      return -1;`,
  `      setHoveredNodeState(null, 0, 0);\n      renderer.domElement.style.cursor = orbitRef.current.isDragging ? "grabbing" : "grab";\n      return -1;`,
  "non-hover cursor state",
);

replaceRequired(
  `    function onPointerDown(e: PointerEvent) {\n      orbitRef.current.isDragging = true;`,
  `    function onPointerDown(e: PointerEvent) {\n      orbitRef.current.isDragging = true;\n      renderer.domElement.style.cursor = "grabbing";`,
  "drag cursor",
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
          lastCruiseNodeId = destNodeRef.current?.id ?? initDest.id;
          hideCruiseLabel();
        }

        if (!cruiseEnabledRef.current) {
          camPos.copy(camPosSmoothed);
          camTarget.copy(camTargetSmoothed);
          hideCruiseLabel();
        } else {
          const autoPaused = now < cruisePauseUntil;
          const interactionPaused = hoveredPlanet !== null || o.isDragging;
          const motionPaused = reduceMotion || autoPaused || interactionPaused;

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

          // Cockpit-style steering: pointer movement changes where the rider looks
          // and adds only a subtle lateral drift so the automatic route remains calm.
          const steerX = THREE.MathUtils.clamp(mouse.x + o.yaw * 0.18, -1.15, 1.15);
          const steerY = THREE.MathUtils.clamp(-mouse.y + o.pitch * 0.22, -1.0, 1.0);
          camPos.copy(cruisePosition)
            .addScaledVector(cruiseRight, steerX * 1.15)
            .addScaledVector(cruiseVertical, steerY * 0.7);
          camTarget.copy(cruiseAhead)
            .addScaledVector(cruiseRight, steerX * CAREER_ORBIT_STEER_X)
            .addScaledVector(cruiseVertical, steerY * CAREER_ORBIT_STEER_Y);

          let nearestNode: CareerNode | null = null;
          let nearestDistance = Number.POSITIVE_INFINITY;
          for (const node of allNodesRef.current) {
            const distance = cruisePosition.distanceTo(new THREE.Vector3(...node.position));
            if (distance < nearestDistance) {
              nearestDistance = distance;
              nearestNode = node;
            }
          }

          if (hoveredPlanet) {
            // Hover/focus means "I am interested": freeze travel indefinitely and
            // turn the view toward that planet until the pointer leaves it.
            const hoveredPosition = new THREE.Vector3(...hoveredPlanet.position);
            camTarget.lerp(hoveredPosition, 0.82);
            if (now - lastCruiseLabelProjectionAt > 60) {
              lastCruiseLabelProjectionAt = now;
              showCruiseLabel(hoveredPlanet);
            }
          } else {
            if (nearestNode && nearestDistance < CAREER_ORBIT_APPROACH_RADIUS) {
              const nearestPosition = new THREE.Vector3(...nearestNode.position);
              const lookWeight = autoPaused ? 0.64 : THREE.MathUtils.lerp(0.08, 0.28, 1 - nearestDistance / CAREER_ORBIT_APPROACH_RADIUS);
              camTarget.lerp(nearestPosition, lookWeight);
            }

            if (!autoPaused && nearestNode && nearestDistance <= CAREER_ORBIT_LABEL_RADIUS && nearestNode.id !== lastCruiseNodeId) {
              lastCruiseNodeId = nearestNode.id;
              const pauseMs = renderer.domElement.clientWidth < 768 ? 2500 : CAREER_ORBIT_PAUSE_MS;
              cruisePauseUntil = now + pauseMs;
              destNodeRef.current = nearestNode;
              destPosRef.current.set(...nearestNode.position);
              setDestination(nearestNode);
              rebuildConnections(nearestNode);
              showCruiseLabel(nearestNode);
              lastCruiseLabelProjectionAt = now;
            } else if (autoPaused && activeCruiseLabelId) {
              const activeNode = allNodesRef.current.find((node) => node.id === activeCruiseLabelId) ?? null;
              if (activeNode) {
                camTarget.lerp(new THREE.Vector3(...activeNode.position), 0.68);
                if (now - lastCruiseLabelProjectionAt > 70) {
                  lastCruiseLabelProjectionAt = now;
                  showCruiseLabel(activeNode);
                }
              }
            } else if (activeCruiseLabelId) {
              hideCruiseLabel();
            }
          }
        }
      }

      // Smooth camera`,
  "slow user-steered immersive cruise",
);

replaceRequired(
  `      const lerpSpeed = phase === "idle" ? 2.5 : phase === "exploring" ? 8.5 : 5.5;`,
  `      const lerpSpeed = phase === "idle" ? 2.5 : phase === "exploring" ? 3.2 : 5.5;`,
  "cinematic camera smoothing",
);

replaceRequired(
  `      camera.lookAt(camTargetSmoothed);`,
  `      camera.lookAt(camTargetSmoothed);\n      if (phase === "exploring") {\n        const o = orbitRef.current;\n        const roll = THREE.MathUtils.clamp(-(mouse.x + o.yaw * 0.18) * 0.022, -0.034, 0.034);\n        camera.rotateZ(roll);\n      }`,
  "subtle cockpit banking",
);

source = source.replace(`      <HoverLabel node={hoveredNode} screenPos={hoverScreenPos} />\n`, "");

if (!source.includes("CAREER_IMMERSIVE_PILOT_SPEED = 4.2")) {
  throw new Error("Career Universe immersive pilot patch failed: pilot constants are missing.");
}
if (!source.includes("hoveredNodeRef.current = node")) {
  throw new Error("Career Universe immersive pilot patch failed: hover-to-pause is missing.");
}
if (!source.includes("interactionPaused = hoveredPlanet !== null || o.isDragging")) {
  throw new Error("Career Universe immersive pilot patch failed: interaction pause contract is missing.");
}
if (!source.includes("Explore its roadmap, skills, projects, and career evidence.")) {
  throw new Error("Career Universe immersive pilot patch failed: planet microcopy is missing.");
}

await writeFile(worldPath, source, "utf8");
console.log("Career Universe immersive pilot applied: slow cockpit cruise, pointer steering, hover-to-pause, readable planet microcopy, and adaptive rendering.");
