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

replaceSection(
  "type CareerEntryDetail = {",
  "// ─── Vignette overlay",
  `type CareerEntryDetail = {
  title: string;
  path: string;
  originX: number;
  originY: number;
  color: string;
};

type CruiseCareerLabelDetail = {
  title: string;
  category: string;
  color: string;
  x: number;
  y: number;
} | null;

const CAREER_ENTRY_ZOOM_MS = 1080;
const CAREER_AUTOTOUR_STOP_EVENT = "ai-career-autotour-stop";
const CAREER_CRUISE_LABEL_EVENT = "ai-career-cruise-label";
const CAREER_ORBIT_CRUISE_SPEED = 13.5;
const CAREER_ORBIT_PAUSE_MS = 620;
const CAREER_ORBIT_LABEL_RADIUS = 16;
let careerEntryScheduled = false;

function scheduleCareerEntry(node: CareerNode, path: string, originX: number, originY: number) {
  if (typeof window === "undefined" || careerEntryScheduled) return;
  careerEntryScheduled = true;
  const entry = UNIVERSE_REGISTRY.find((item) => item.id === node.id);
  const color = entry ? (SECTORS[entry.sectorKey]?.color ?? "#818cf8") : "#818cf8";
  window.dispatchEvent(new Event(CAREER_AUTOTOUR_STOP_EVENT));
  window.dispatchEvent(new CustomEvent<CareerEntryDetail>(CAREER_ENTRY_EVENT, {
    detail: { title: node.title, path, originX, originY, color },
  }));
}
`,
  "career entry and cruise event contract",
);

replaceSection(
  "// ─── Focused career label",
  "// ─── Career navigation panel",
  `// ─── Planet-side Career label ────────────────────────────────────────────────
function CruiseCareerLabel() {
  const [detail, setDetail] = useState<CruiseCareerLabelDetail>(null);

  useEffect(() => {
    function handleCruiseLabel(event: Event) {
      setDetail((event as CustomEvent<CruiseCareerLabelDetail>).detail ?? null);
    }
    window.addEventListener(CAREER_CRUISE_LABEL_EVENT, handleCruiseLabel);
    return () => window.removeEventListener(CAREER_CRUISE_LABEL_EVENT, handleCruiseLabel);
  }, []);

  const visible = detail !== null;
  return (
    <div
      aria-live="polite"
      aria-hidden={!visible}
      style={{
        position: "absolute",
        left: detail?.x ?? "50%",
        top: detail?.y ?? "50%",
        transform: visible ? "translate(18px,-50%) scale(1)" : "translate(10px,-50%) scale(.96)",
        opacity: visible ? 1 : 0,
        filter: visible ? "blur(0)" : "blur(5px)",
        transition: "opacity .22s ease, transform .3s cubic-bezier(.22,1,.36,1), filter .22s ease",
        zIndex: 31,
        pointerEvents: "none",
        maxWidth: "min(260px,64vw)",
        padding: "9px 12px 9px 11px",
        borderRadius: 12,
        border: "1px solid rgba(165,180,252,.18)",
        background: "rgba(3,5,14,.72)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 12px 42px rgba(0,0,0,.32)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ width: 7, height: 7, borderRadius: "999px", flexShrink: 0, background: detail?.color ?? "#818cf8", boxShadow: detail ? `0 0 12px ${detail.color}` : "none" }} />
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, color: "#eef2ff", fontSize: 13, lineHeight: 1.25, fontWeight: 700, whiteSpace: "normal" }}>
            {detail?.title}
          </p>
          <p style={{ margin: "2px 0 0", color: "rgba(199,210,254,.52)", fontSize: 10, lineHeight: 1.2 }}>
            {detail?.category}
          </p>
        </div>
      </div>
    </div>
  );
}`,
  "planet-side Career label",
);

source = source.replace(
  "Auto tour · Click or tap any node to enter",
  "Orbit cruise · Click or tap any node to enter",
);

source = source.replace(
  "  const recentCameraBehaviorsRef = useRef<string[]>([]);",
  `  const recentCameraBehaviorsRef = useRef<string[]>([]);\n  const cruiseEnabledRef = useRef(true);\n\n  useEffect(() => {\n    function stopCruise() {\n      cruiseEnabledRef.current = false;\n      window.dispatchEvent(new CustomEvent<CruiseCareerLabelDetail>(CAREER_CRUISE_LABEL_EVENT, { detail: null }));\n    }\n    window.addEventListener(CAREER_AUTOTOUR_STOP_EVENT, stopCruise);\n    window.addEventListener(CAREER_ENTRY_EVENT, stopCruise);\n    return () => {\n      window.removeEventListener(CAREER_AUTOTOUR_STOP_EVENT, stopCruise);\n      window.removeEventListener(CAREER_ENTRY_EVENT, stopCruise);\n    };\n  }, []);`,
);

source = source.replace(
  "    rebuildConnections(initDest);\n",
  `    rebuildConnections(initDest);\n\n    // Build one closed, spatially coherent route through the Career Universe.\n    // The first point exactly matches the initial arrival camera position so the\n    // cinematic entry hands off to the cruise without a jump or second zoom.\n    const cruiseNodes: CareerNode[] = [initDest];\n    const unvisitedCruiseNodes = allNodes.filter((node) => node.id !== initDest.id);\n    while (unvisitedCruiseNodes.length > 0) {\n      const current = cruiseNodes[cruiseNodes.length - 1];\n      let bestIndex = 0;\n      let bestDistance = Number.POSITIVE_INFINITY;\n      unvisitedCruiseNodes.forEach((candidate, index) => {\n        const dx = candidate.position[0] - current.position[0];\n        const dy = candidate.position[1] - current.position[1];\n        const dz = candidate.position[2] - current.position[2];\n        const distance = dx * dx + dy * dy + dz * dz;\n        if (distance < bestDistance) {\n          bestDistance = distance;\n          bestIndex = index;\n        }\n      });\n      cruiseNodes.push(unvisitedCruiseNodes.splice(bestIndex, 1)[0]);\n    }\n\n    const cruiseUp = new THREE.Vector3(0, 1, 0);\n    const cruisePoints = cruiseNodes.map((node, index) => {\n      if (index === 0) {\n        return new THREE.Vector3(node.position[0], node.position[1] + 4, node.position[2] + 14);\n      }\n      const previous = cruiseNodes[(index - 1 + cruiseNodes.length) % cruiseNodes.length];\n      const next = cruiseNodes[(index + 1) % cruiseNodes.length];\n      const previousPos = new THREE.Vector3(...previous.position);\n      const nextPos = new THREE.Vector3(...next.position);\n      const tangent = nextPos.sub(previousPos).normalize();\n      const side = new THREE.Vector3().crossVectors(tangent, cruiseUp);\n      if (side.lengthSq() < 0.0001) side.set(1, 0, 0);\n      side.normalize().multiplyScalar(9);\n      return new THREE.Vector3(...node.position).add(side).add(new THREE.Vector3(0, 3.5, 0));\n    });\n    const cruiseCurve = new THREE.CatmullRomCurve3(cruisePoints, true, "centripetal", 0.5);\n    const cruiseLength = Math.max(cruiseCurve.getLength(), 1);\n    let cruiseDistance = 0;\n    let cruiseStarted = false;\n    let cruisePauseUntil = 0;\n    let lastCruiseNodeId: string | null = initDest.id;\n    let activeCruiseLabelId: string | null = null;\n    let lastCruiseLabelProjectionAt = 0;\n`,
);

source = source.replace(
  "    // ── Pointer events ─────────────────────────────────────────────────────",
  `    function dispatchCruiseLabel(node: CareerNode | null) {\n      if (!node) {\n        if (activeCruiseLabelId !== null) {\n          window.dispatchEvent(new CustomEvent<CruiseCareerLabelDetail>(CAREER_CRUISE_LABEL_EVENT, { detail: null }));\n          activeCruiseLabelId = null;\n        }\n        return;\n      }\n\n      const rect = syncViewport();\n      const projected = new THREE.Vector3(...node.position).project(camera);\n      const onScreen = projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 1.08 && Math.abs(projected.y) < 1.08;\n      if (!onScreen) {\n        dispatchCruiseLabel(null);\n        return;\n      }\n      const entry = UNIVERSE_REGISTRY.find((item) => item.id === node.id);\n      const color = entry ? (SECTORS[entry.sectorKey]?.color ?? "#818cf8") : "#818cf8";\n      const x = rect.left + (projected.x * 0.5 + 0.5) * rect.width;\n      const y = rect.top + (-projected.y * 0.5 + 0.5) * rect.height;\n      activeCruiseLabelId = node.id;\n      window.dispatchEvent(new CustomEvent<CruiseCareerLabelDetail>(CAREER_CRUISE_LABEL_EVENT, {\n        detail: { title: node.title, category: entry?.category ?? node.category, color, x, y },\n      }));\n    }\n\n    // ── Pointer events ─────────────────────────────────────────────────────`,
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
          dispatchCruiseLabel(destNodeRef.current);
        }
      } else if (phase === "exploring") {
        const now = performance.now();
        if (!cruiseStarted) {
          cruiseStarted = true;
          cruiseDistance = 0;
          cruisePauseUntil = 0;
          lastCruiseNodeId = destNodeRef.current?.id ?? initDest.id;
          dispatchCruiseLabel(null);
        }

        if (!cruiseEnabledRef.current) {
          camPos.copy(camPosSmoothed);
          camTarget.copy(camTargetSmoothed);
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
          allNodesRef.current.forEach((node) => {
            const distance = cruisePosition.distanceTo(new THREE.Vector3(...node.position));
            if (distance < nearestDistance) {
              nearestDistance = distance;
              nearestNode = node;
            }
          });

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
            dispatchCruiseLabel(nearestNode);
            lastCruiseLabelProjectionAt = now;
          } else if (now < cruisePauseUntil && activeCruiseLabelId) {
            const activeNode = allNodesRef.current.find((node) => node.id === activeCruiseLabelId) ?? null;
            if (activeNode) {
              camTarget.lerp(new THREE.Vector3(...activeNode.position), 0.72);
              if (now - lastCruiseLabelProjectionAt > 80) {
                lastCruiseLabelProjectionAt = now;
                dispatchCruiseLabel(activeNode);
              }
            }
          } else if (activeCruiseLabelId) {
            dispatchCruiseLabel(null);
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

source = source.replace("      <FocusedCareerLabel />", "      <CruiseCareerLabel />");
source = source.replace("      <ExploreHint />\n", "");

if (!source.includes("CAREER_ORBIT_CRUISE_SPEED = 13.5")) {
  throw new Error("Career Universe orbital cruise patch failed: cruise speed contract missing.");
}
if (!source.includes("new THREE.CatmullRomCurve3")) {
  throw new Error("Career Universe orbital cruise patch failed: closed cruise curve missing.");
}
if (!source.includes("<CruiseCareerLabel />")) {
  throw new Error("Career Universe orbital cruise patch failed: planet-side label missing.");
}
if (source.includes("<FocusedCareerLabel />")) {
  throw new Error("Career Universe orbital cruise patch failed: bottom focused label still rendered.");
}

await writeFile(worldPath, source, "utf8");
console.log("Career Universe orbital cruise applied: constant-speed route, short planet pauses, planet-side labels, and fixed Explore Careers dock.");
