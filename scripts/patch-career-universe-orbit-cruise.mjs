import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const worldPath = path.join(root, "src/components/opening-scene/World.tsx");
let source = await readFile(worldPath, "utf8");

if (source.includes("const CAREER_ORBIT_CRUISE_SPEED = 13.5;")) {
  console.log("Career Universe orbital cruise patch already applied.");
  process.exit(0);
}

function replaceSection(startMarker, endMarker, replacement, label) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) {
    throw new Error(`Career Universe orbital cruise patch failed: could not locate ${label}.`);
  }
  source = `${source.slice(0, start)}${replacement.trim()}\n\n${source.slice(end)}`;
}

if (!source.includes("function FocusedCareerLabel()")) {
  throw new Error("Career Universe orbital cruise patch requires the base auto-tour patch first.");
}

source = source.replace(
  "const CAM_START_Z     = 52;",
  `const CAM_START_Z     = 52;\nconst CAREER_ORBIT_CRUISE_SPEED = 13.5;\nconst CAREER_ORBIT_PAUSE_MS = 620;\nconst CAREER_ORBIT_LABEL_RADIUS = 16;`,
);

source = source.replace(
  "Auto tour · Click or tap any node to enter",
  "Orbit cruise · Click or tap any node to enter",
);

source = source.replace(
  "  const recentCameraBehaviorsRef = useRef<string[]>([]);",
  `  const recentCameraBehaviorsRef = useRef<string[]>([]);\n  const cruiseEnabledRef = useRef(true);\n\n  useEffect(() => {\n    function stopCruise() {\n      cruiseEnabledRef.current = false;\n    }\n    window.addEventListener(CAREER_AUTOTOUR_STOP_EVENT, stopCruise);\n    window.addEventListener(CAREER_ENTRY_EVENT, stopCruise);\n    return () => {\n      window.removeEventListener(CAREER_AUTOTOUR_STOP_EVENT, stopCruise);\n      window.removeEventListener(CAREER_ENTRY_EVENT, stopCruise);\n    };\n  }, []);`,
);

source = source.replace(
  "    container.appendChild(renderer.domElement);",
  `    container.appendChild(renderer.domElement);\n\n    // Minimal planet-side label. It lives in the WebGL container so it can stay\n    // visually attached to the Career node during the short cruise pause without\n    // adding another persistent card to the page.\n    const cruiseLabelEl = document.createElement("div");\n    cruiseLabelEl.style.position = "absolute";\n    cruiseLabelEl.style.zIndex = "31";\n    cruiseLabelEl.style.pointerEvents = "none";\n    cruiseLabelEl.style.opacity = "0";\n    cruiseLabelEl.style.transform = "translate(18px,-50%) scale(.96)";\n    cruiseLabelEl.style.transition = "opacity .2s ease, transform .28s cubic-bezier(.22,1,.36,1)";\n    cruiseLabelEl.style.maxWidth = "260px";\n    cruiseLabelEl.style.padding = "8px 11px";\n    cruiseLabelEl.style.borderRadius = "11px";\n    cruiseLabelEl.style.border = "1px solid rgba(165,180,252,.18)";\n    cruiseLabelEl.style.background = "rgba(3,5,14,.74)";\n    cruiseLabelEl.style.backdropFilter = "blur(14px)";\n    cruiseLabelEl.style.boxShadow = "0 12px 36px rgba(0,0,0,.3)";\n    const cruiseLabelTitle = document.createElement("div");\n    cruiseLabelTitle.style.color = "#eef2ff";\n    cruiseLabelTitle.style.fontSize = "13px";\n    cruiseLabelTitle.style.fontWeight = "700";\n    cruiseLabelTitle.style.lineHeight = "1.25";\n    const cruiseLabelCategory = document.createElement("div");\n    cruiseLabelCategory.style.marginTop = "2px";\n    cruiseLabelCategory.style.color = "rgba(199,210,254,.52)";\n    cruiseLabelCategory.style.fontSize = "10px";\n    cruiseLabelCategory.style.lineHeight = "1.2";\n    cruiseLabelEl.append(cruiseLabelTitle, cruiseLabelCategory);\n    container.appendChild(cruiseLabelEl);`,
);

source = source.replace(
  "    rebuildConnections(initDest);\n",
  `    rebuildConnections(initDest);\n\n    // Closed nearest-neighbour route keeps the camera moving through nearby\n    // regions of the Universe instead of repeatedly zooming to isolated nodes.\n    // Point zero matches the initial arrival camera exactly for a seamless handoff.\n    const cruiseNodes: CareerNode[] = [initDest];\n    const unvisitedCruiseNodes = allNodes.filter((node) => node.id !== initDest.id);\n    while (unvisitedCruiseNodes.length > 0) {\n      const current = cruiseNodes[cruiseNodes.length - 1];\n      let bestIndex = 0;\n      let bestDistance = Number.POSITIVE_INFINITY;\n      for (let index = 0; index < unvisitedCruiseNodes.length; index += 1) {\n        const candidate = unvisitedCruiseNodes[index];\n        const dx = candidate.position[0] - current.position[0];\n        const dy = candidate.position[1] - current.position[1];\n        const dz = candidate.position[2] - current.position[2];\n        const distance = dx * dx + dy * dy + dz * dz;\n        if (distance < bestDistance) {\n          bestDistance = distance;\n          bestIndex = index;\n        }\n      }\n      cruiseNodes.push(unvisitedCruiseNodes.splice(bestIndex, 1)[0]);\n    }\n\n    const cruiseUp = new THREE.Vector3(0, 1, 0);\n    const cruisePoints = cruiseNodes.map((node, index) => {\n      if (index === 0) {\n        return new THREE.Vector3(node.position[0], node.position[1] + 4, node.position[2] + 14);\n      }\n      const previous = cruiseNodes[(index - 1 + cruiseNodes.length) % cruiseNodes.length];\n      const next = cruiseNodes[(index + 1) % cruiseNodes.length];\n      const previousPos = new THREE.Vector3(...previous.position);\n      const nextPos = new THREE.Vector3(...next.position);\n      const tangent = nextPos.sub(previousPos).normalize();\n      const side = new THREE.Vector3().crossVectors(tangent, cruiseUp);\n      if (side.lengthSq() < 0.0001) side.set(1, 0, 0);\n      side.normalize().multiplyScalar(9);\n      return new THREE.Vector3(...node.position).add(side).add(new THREE.Vector3(0, 3.5, 0));\n    });\n    const cruiseCurve = new THREE.CatmullRomCurve3(cruisePoints, true, "centripetal", 0.5);\n    const cruiseLength = Math.max(cruiseCurve.getLength(), 1);\n    let cruiseDistance = 0;\n    let cruiseStarted = false;\n    let cruisePauseUntil = 0;\n    let lastCruiseNodeId: string | null = initDest.id;\n    let activeCruiseLabelId: string | null = null;\n    let lastCruiseLabelProjectionAt = 0;\n`,
);

source = source.replace(
  "    // ── Pointer events ─────────────────────────────────────────────────────",
  `    function hideCruiseLabel() {\n      activeCruiseLabelId = null;\n      cruiseLabelEl.style.opacity = "0";\n      cruiseLabelEl.style.transform = "translate(10px,-50%) scale(.96)";\n    }\n\n    function showCruiseLabel(node: CareerNode) {\n      const rect = syncViewport();\n      const projected = new THREE.Vector3(...node.position).project(camera);\n      const onScreen = projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 1.06 && Math.abs(projected.y) < 1.06;\n      if (!onScreen) {\n        hideCruiseLabel();\n        return;\n      }\n      const entry = UNIVERSE_REGISTRY.find((item) => item.id === node.id);\n      const color = entry ? (SECTORS[entry.sectorKey]?.color ?? "#818cf8") : "#818cf8";\n      const x = (projected.x * 0.5 + 0.5) * rect.width;\n      const y = (-projected.y * 0.5 + 0.5) * rect.height;\n      activeCruiseLabelId = node.id;\n      cruiseLabelTitle.textContent = node.title;\n      cruiseLabelCategory.textContent = entry?.category ?? node.category;\n      cruiseLabelEl.style.left = String(x) + "px";\n      cruiseLabelEl.style.top = String(y) + "px";\n      cruiseLabelEl.style.borderColor = color + "55";\n      cruiseLabelEl.style.boxShadow = "0 12px 36px rgba(0,0,0,.3), 0 0 20px " + color + "22";\n      cruiseLabelEl.style.opacity = "1";\n      cruiseLabelEl.style.transform = "translate(18px,-50%) scale(1)";\n    }\n\n    // ── Pointer events ─────────────────────────────────────────────────────`,
);

replaceSection(
  "  const panelStyle: React.CSSProperties = isMobile ? {",
  "  return (",
  `  const panelStyle: React.CSSProperties = isMobile ? {
    position: "fixed", bottom: 0, left: 0, right: 0,
    height: isOpen ? "62vh" : 58,
    background: "rgba(3,5,14,0.9)",
    border: "1px solid rgba(99,102,241,0.18)",
    borderRadius: "20px 20px 0 0",
    backdropFilter: "blur(24px)",
    boxShadow: "0 -10px 42px rgba(0,0,0,.38)",
    transition: "height .38s cubic-bezier(.22,1,.36,1), opacity .35s ease, transform .35s ease",
    opacity: show ? 1 : 0,
    transform: show ? "translateY(0)" : "translateY(100%)",
    zIndex: 40, overflow: "hidden", display: "flex", flexDirection: "column",
    pointerEvents: show ? "auto" : "none",
  } : {
    position: "fixed",
    bottom: 58,
    left: "50%",
    top: "auto",
    transform: show ? "translateX(-50%)" : "translateX(-50%) translateY(14px)",
    width: isOpen ? "min(520px,calc(100vw - 48px))" : 198,
    height: isOpen ? "min(58vh,520px)" : 58,
    background: isOpen ? "rgba(3,5,14,.88)" : "rgba(6,9,24,.78)",
    border: "1px solid rgba(129,140,248,.22)",
    borderRadius: isOpen ? 22 : 999,
    backdropFilter: "blur(24px)",
    boxShadow: isOpen ? "0 18px 70px rgba(0,0,0,.5)" : "0 10px 38px rgba(0,0,0,.32), 0 0 28px rgba(99,102,241,.08)",
    transition: "width .38s cubic-bezier(.22,1,.36,1), height .38s cubic-bezier(.22,1,.36,1), border-radius .3s ease, opacity .35s ease, transform .35s ease",
    opacity: show ? 1 : 0,
    zIndex: 40, overflow: "hidden", display: "flex", flexDirection: "column",
    pointerEvents: show ? "auto" : "none",
  };`,
  "bottom Explore Careers dock",
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
          const isPaused = now < cruisePauseUntil;
          if (!isPaused) {
            cruiseDistance = (cruiseDistance + CAREER_ORBIT_CRUISE_SPEED * delta) % cruiseLength;
          }

          const u = (cruiseDistance % cruiseLength) / cruiseLength;
          const aheadStep = Math.min(0.02, Math.max(0.006, 8 / cruiseLength));
          const cruisePosition = cruiseCurve.getPointAt(u);
          const cruiseAhead = cruiseCurve.getPointAt((u + aheadStep) % 1);
          camPos.copy(cruisePosition);
          camTarget.copy(cruiseAhead);

          let nearestNode: CareerNode | null = null;
          let nearestDistance = Number.POSITIVE_INFINITY;
          for (const node of allNodesRef.current) {
            const distance = cruisePosition.distanceTo(new THREE.Vector3(...node.position));
            if (distance < nearestDistance) {
              nearestDistance = distance;
              nearestNode = node;
            }
          }

          if (nearestNode && nearestDistance < 26) {
            camTarget.lerp(new THREE.Vector3(...nearestNode.position), isPaused ? 0.72 : 0.18);
          }

          if (!isPaused && nearestNode && nearestDistance <= CAREER_ORBIT_LABEL_RADIUS && nearestNode.id !== lastCruiseNodeId) {
            lastCruiseNodeId = nearestNode.id;
            cruisePauseUntil = now + CAREER_ORBIT_PAUSE_MS;
            destNodeRef.current = nearestNode;
            destPosRef.current.set(...nearestNode.position);
            setDestination(nearestNode);
            rebuildConnections(nearestNode);
            showCruiseLabel(nearestNode);
            lastCruiseLabelProjectionAt = now;
          } else if (now < cruisePauseUntil && activeCruiseLabelId) {
            const activeNode = allNodesRef.current.find((node) => node.id === activeCruiseLabelId) ?? null;
            if (activeNode) {
              camTarget.lerp(new THREE.Vector3(...activeNode.position), 0.72);
              if (now - lastCruiseLabelProjectionAt > 80) {
                lastCruiseLabelProjectionAt = now;
                showCruiseLabel(activeNode);
              }
            }
          } else if (activeCruiseLabelId) {
            hideCruiseLabel();
          }
        }
      }

      // Smooth camera`,
  "continuous orbital cruise camera",
);

source = source.replace(
  `      const lerpSpeed = phase === "idle" ? 2.5 : phase === "exploring" ? 4.0 : 5.5;`,
  `      const lerpSpeed = phase === "idle" ? 2.5 : phase === "exploring" ? 8.5 : 5.5;`,
);

source = source.replace("      <FocusedCareerLabel />\n", "");
source = source.replace("      <ExploreHint />\n", "");
source = source.replace(
  "      renderer.dispose();",
  `      renderer.dispose();\n      if (container.contains(cruiseLabelEl)) container.removeChild(cruiseLabelEl);`,
);

if (!source.includes("CAREER_ORBIT_CRUISE_SPEED = 13.5")) {
  throw new Error("Career Universe orbital cruise patch failed: cruise speed contract missing.");
}
if (!source.includes("new THREE.CatmullRomCurve3")) {
  throw new Error("Career Universe orbital cruise patch failed: closed cruise curve missing.");
}
if (source.includes("<FocusedCareerLabel />")) {
  throw new Error("Career Universe orbital cruise patch failed: bottom focused label is still rendered.");
}
if (source.includes("<ExploreHint />")) {
  throw new Error("Career Universe orbital cruise patch failed: redundant bottom hint is still rendered.");
}

await writeFile(worldPath, source, "utf8");
console.log("Career Universe orbital cruise applied: constant-speed route, short planet pauses, planet-side labels, and fixed Explore Careers dock.");