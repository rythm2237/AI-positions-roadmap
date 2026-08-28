import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const worldPath = path.join(root, "src/components/opening-scene/World.tsx");
const footerPath = path.join(root, "src/components/landing/GlobalFooter.tsx");
const tourPath = path.join(root, "src/components/onboarding/FirstVisitGuidedTour.tsx");
const explainPath = path.join(root, "src/components/help/GlobalExplainMode.tsx");

function replaceRequired(source, search, replacement, label) {
  if (!source.includes(search)) throw new Error(`Mobile/Universe hardening failed: ${label} signature not found.`);
  return source.replace(search, replacement);
}

let world = await readFile(worldPath, "utf8");
if (!world.includes("const CAREER_MOBILE_UNIVERSE_CONTINUITY = true;")) {
  world = replaceRequired(
    world,
    "const CAREER_NATURAL_CRUISE = true;\nconst CAREER_NATURAL_FOCUS_MAX_DISTANCE = 34;\nconst CAREER_NATURAL_FOCUS_MIN_FORWARD_DOT = 0.2;",
    "const CAREER_NATURAL_CRUISE = true;\nconst CAREER_MOBILE_UNIVERSE_CONTINUITY = true;\nconst CAREER_NATURAL_FOCUS_MAX_DISTANCE = 56;\nconst CAREER_NATURAL_FOCUS_MIN_FORWARD_DOT = -0.08;",
    "natural cruise constants",
  );

  // Passive showcase cadence: a readable Career should naturally enter the
  // foreground every ~2.4s, with enough label hold time to overlap the next
  // approach instead of creating visually empty beats.
  world = world.replace("const CAREER_ORBIT_FOCUS_INTERVAL_MS = 3500;", "const CAREER_ORBIT_FOCUS_INTERVAL_MS = 2400;");
  world = world.replace("const CAREER_ORBIT_FOCUS_HOLD_MS = 1150;", "const CAREER_ORBIT_FOCUS_HOLD_MS = 1700;");
  world = world.replace("const CAREER_IMMERSIVE_PILOT_SPEED = 4.2;", "const CAREER_IMMERSIVE_PILOT_SPEED = 5.4;");
  world = world.replace("const camera = new THREE.PerspectiveCamera(58, w / h, 0.1, 600);", "const camera = new THREE.PerspectiveCamera(w < 768 ? 68 : 60, w / h, 0.1, 600);");
  world = world.replace("const nodeGeo = new THREE.SphereGeometry(0.38, 10, 10);", "const nodeGeo = new THREE.SphereGeometry(w < 768 ? 0.58 : 0.48, 12, 12);");
  world = world.replace("let scale = dist > 120 ? 0 : dist > 80 ? 0.6 : 1;", "let scale = dist > 150 ? 0.28 : dist > 105 ? 0.42 : dist > 72 ? 0.68 : 1;");
  world = world.replace("side.normalize().multiplyScalar(9);", "side.normalize().multiplyScalar(6.25);");
  world = world.replace(".add(new THREE.Vector3(0, 3.5, 0));", ".add(new THREE.Vector3(0, 2.6, 0));");
  world = world.replace("const holdMs = renderer.domElement.clientWidth < 768 ? 1400 : CAREER_ORBIT_FOCUS_HOLD_MS;", "const holdMs = renderer.domElement.clientWidth < 768 ? 1800 : CAREER_ORBIT_FOCUS_HOLD_MS;");
  world = world.replace("nextCruiseFocusAt = now + 420;", "nextCruiseFocusAt = now + 240;");

  // Landing/Universe is now a passive cinematic display. Normal pointer motion,
  // hover and incidental cursor crossings must never pause, steer or retarget
  // the cruise. Node click/tap navigation remains available through raycasting.
  world = world.replaceAll(
    "lastPointerActivityAt = performance.now();",
    "// Passive cruise: pointer activity does not take over the camera.",
  );
  world = world.replace(
    "const hoveredPlanet = hoveredNodeRef.current;",
    "const hoveredPlanet = ((): CareerNode | null => null)();",
  );
  world = world.replace(
    "const interactionPaused = hoveredPlanet !== null || o.isDragging || userControlActive;",
    "const interactionPaused = false;",
  );
  world = world.replace(
    "const steerX = THREE.MathUtils.clamp(mouse.x + o.yaw * 0.18, -1.15, 1.15);\n          const steerY = THREE.MathUtils.clamp(-mouse.y + o.pitch * 0.22, -1.0, 1.0);",
    "const steerX = 0;\n          const steerY = 0;",
  );

  await writeFile(worldPath, world, "utf8");
}

let footer = await readFile(footerPath, "utf8");
footer = footer.replace(
  'className="fixed bottom-0 left-1/2 z-[62] flex -translate-x-1/2 items-center gap-2 rounded-t-2xl border border-b-0 border-white/10 bg-[#070919]/92 px-4 py-2 text-xs font-semibold text-slate-300 shadow-2xl backdrop-blur-xl transition hover:bg-[#0a0d20] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:px-5"',
  'className="fixed bottom-0 left-1/2 z-[62] hidden -translate-x-1/2 items-center gap-2 rounded-t-2xl border border-b-0 border-white/10 bg-[#070919]/92 px-4 py-2 text-xs font-semibold text-slate-300 shadow-2xl backdrop-blur-xl transition hover:bg-[#0a0d20] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:flex sm:px-5"',
);
await writeFile(footerPath, footer, "utf8");

let tour = await readFile(tourPath, "utf8");
tour = tour.replace(
  'className="fixed bottom-4 right-[4.75rem] z-[86] grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#070a18]/88 p-0 text-violet-200 shadow-[0_16px_50px_rgba(0,0,0,.45)] backdrop-blur-xl transition hover:border-violet-300/35 hover:bg-[#0c1026] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"',
  'className="fixed right-[4.5rem] top-[calc(env(safe-area-inset-top,0px)+5.25rem)] z-[86] grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#070a18]/88 p-0 text-violet-200 shadow-[0_16px_50px_rgba(0,0,0,.45)] backdrop-blur-xl transition hover:border-violet-300/35 hover:bg-[#0c1026] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:bottom-4 sm:right-[4.75rem] sm:top-auto"',
);
await writeFile(tourPath, tour, "utf8");

let explain = await readFile(explainPath, "utf8");
explain = explain.replace(
  'fixed bottom-4 right-4 z-[86] grid h-11 w-11 place-items-center',
  'fixed right-4 top-[calc(env(safe-area-inset-top,0px)+5.25rem)] z-[86] grid h-11 w-11 place-items-center sm:bottom-4 sm:top-auto',
);
await writeFile(explainPath, explain, "utf8");

console.log("Mobile + Career Universe continuity hardening applied: passive pointer-independent cruise, ~2.4s Career cadence, longer readable title overlap, dense visible planets, and collision-free mobile utilities.");
