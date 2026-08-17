import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const worldPath = path.join(root, "src/components/opening-scene/World.tsx");
let source = await readFile(worldPath, "utf8");

function replaceSection(startMarker, endMarker, replacement, label) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) {
    throw new Error(`Career Universe patch failed: could not locate ${label}.`);
  }
  source = `${source.slice(0, start)}${replacement.trim()}\n\n${source.slice(end)}`;
}

replaceSection(
  "// ─── Career preview card",
  "// ─── Career navigation panel",
  `// ─── Focused career label ────────────────────────────────────────────────────
function FocusedCareerLabel() {
  const { phase, destination } = useScene();
  const entry = destination ? UNIVERSE_REGISTRY.find((item) => item.id === destination.id) : null;
  const visible = Boolean(destination) && (phase === "arrived" || phase === "exploring");
  const sector = entry ? SECTORS[entry.sectorKey] : null;

  return (
    <div
      aria-live="polite"
      aria-hidden={!visible}
      style={{
        position: "absolute",
        left: "50%",
        bottom: "clamp(92px,12vh,132px)",
        transform: visible ? "translate(-50%,0) scale(1)" : "translate(-50%,10px) scale(.97)",
        opacity: visible ? 1 : 0,
        filter: visible ? "blur(0)" : "blur(6px)",
        transition: TRANSITION_BASE,
        zIndex: 24,
        width: "min(86vw,560px)",
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      <p style={{ margin: 0, color: sector?.color ?? "#a5b4fc", fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase" }}>
        {sector?.label ?? destination?.category ?? "AI Career"}
      </p>
      <h2 style={{ margin: "7px 0 0", color: "#eef2ff", fontSize: "clamp(18px,3.4vw,30px)", lineHeight: 1.1, fontWeight: 750, textShadow: "0 8px 36px rgba(0,0,0,.65)" }}>
        {destination?.title}
      </h2>
    </div>
  );
}`,
  "career preview card",
);

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

const CAREER_ENTRY_ZOOM_MS = 1080;
const CAREER_AUTOTOUR_STOP_EVENT = "ai-career-autotour-stop";
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

// ─── Vignette overlay`,
  "career entry event contract",
);

source = source.replace(
  "Drag to look around · Click any node to travel",
  "Auto tour · Click or tap any node to enter",
);

source = source.replace(
  `  function togglePanel() {\n    setIsOpen((open) => !open);`,
  `  function togglePanel() {\n    window.dispatchEvent(new Event(CAREER_AUTOTOUR_STOP_EVENT));\n    setIsOpen((open) => !open);`,
);
source = source.replace(
  `                  onClick={() => {\n                    travelTo(node);`,
  `                  onClick={() => {\n                    window.dispatchEvent(new Event(CAREER_AUTOTOUR_STOP_EVENT));\n                    travelTo(node);`,
);

replaceSection(
  "    function onPointerUp(e: PointerEvent) {",
  "    function onPointerLeave()",
  `    function onPointerUp(e: PointerEvent) {
      const o = orbitRef.current;
      o.isDragging = false;
      if (o.dragDist < 5 && (phaseRef.current === "exploring" || phaseRef.current === "arrived")) {
        const idx = doRaycast(e.clientX, e.clientY);
        if (idx >= 0) {
          const node = allNodesRef.current[idx];
          const entry = UNIVERSE_REGISTRY.find((career) => career.id === node.id);
          if (entry?.careerPath) {
            scheduleCareerEntry(node, entry.careerPath, e.clientX, e.clientY);
            return;
          }

          destNodeRef.current = node;
          destPosRef.current.set(...node.position);
          destCamPosRef.current.set(node.position[0], node.position[1] + 4, node.position[2] + 14);
          startCamPosRef.current.copy(camPosSmoothed);
          startCamTargetRef.current.copy(camTargetSmoothed);
          rebuildConnections(node);
          o.yaw = 0;
          o.pitch = 0;
          travelToRef.current(node);
        }
      }
    }

    function onPointerLeave()`,
  "node pointer-up handler",
);

replaceSection(
  "function CareerEntryTransitionOverlay() {",
  "// ─── World inner",
  `function CareerEntryTransitionOverlay() {
  const [entry, setEntry] = useState<CareerEntryDetail | null>(null);
  const [zooming, setZooming] = useState(false);
  const navigationTimerRef = useRef<number | null>(null);
  const frameOneRef = useRef<number | null>(null);
  const frameTwoRef = useRef<number | null>(null);

  useEffect(() => {
    function handleEntry(event: Event) {
      const detail = (event as CustomEvent<CareerEntryDetail>).detail;
      if (!detail?.path || entry) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setEntry(detail);
      setZooming(false);
      frameOneRef.current = window.requestAnimationFrame(() => {
        frameTwoRef.current = window.requestAnimationFrame(() => setZooming(true));
      });
      navigationTimerRef.current = window.setTimeout(() => {
        window.location.assign(detail.path);
      }, reduceMotion ? 140 : CAREER_ENTRY_ZOOM_MS + 35);
    }

    window.addEventListener(CAREER_ENTRY_EVENT, handleEntry);
    return () => {
      window.removeEventListener(CAREER_ENTRY_EVENT, handleEntry);
      if (navigationTimerRef.current !== null) window.clearTimeout(navigationTimerRef.current);
      if (frameOneRef.current !== null) window.cancelAnimationFrame(frameOneRef.current);
      if (frameTwoRef.current !== null) window.cancelAnimationFrame(frameTwoRef.current);
    };
  }, [entry]);

  if (!entry) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        overflow: "hidden",
        pointerEvents: "auto",
        background: zooming ? "rgba(3,5,14,.18)" : "transparent",
        transition: `background ${CAREER_ENTRY_ZOOM_MS}ms linear`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: entry.originX,
          top: entry.originY,
          width: 30,
          height: 30,
          borderRadius: "999px",
          transform: `translate(-50%,-50%) scale(${zooming ? 190 : 1})`,
          transformOrigin: "50% 50%",
          background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${entry.color} 16%, ${entry.color} 52%, #080b1c 100%)`,
          boxShadow: `0 0 42px ${entry.color}, inset 0 0 18px rgba(255,255,255,.28)`,
          transition: `transform ${CAREER_ENTRY_ZOOM_MS}ms cubic-bezier(.65,0,.35,1), box-shadow ${CAREER_ENTRY_ZOOM_MS}ms ease`,
          willChange: "transform",
        }}
      />
    </div>
  );
}

// ─── World inner`,
  "career entry transition overlay",
);

source = source.replace("      <CareerPreviewCard />", "      <FocusedCareerLabel />");
source = source.replace(
  'import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";',
  'import { useCallback, useEffect, useRef, useState } from "react";',
);

if (source.includes("CareerPreviewCard")) {
  throw new Error("Career Universe patch failed: legacy CareerPreviewCard is still present.");
}
if (!source.includes("FocusedCareerLabel") || !source.includes("scale(${zooming ? 190 : 1})")) {
  throw new Error("Career Universe patch failed: expected auto-tour entry UI was not installed.");
}

await writeFile(worldPath, source, "utf8");
console.log("Career Universe auto-tour and single-tap node entry patch applied.");
