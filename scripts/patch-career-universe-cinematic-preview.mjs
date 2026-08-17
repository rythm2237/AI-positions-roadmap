import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const worldPath = path.join(root, "src/components/opening-scene/World.tsx");
let source = await readFile(worldPath, "utf8");

if (source.includes("const CAREER_CINEMATIC_PREVIEW = true;")) {
  console.log("Career Universe cinematic preview patch already applied.");
  process.exit(0);
}

function replaceRequired(search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error(`Career Universe cinematic preview patch failed: could not locate ${label}.`);
  }
  source = source.replace(search, replacement);
}

if (!source.includes("const CAREER_ORBIT_FOCUS_INTERVAL_MS = 3500;")) {
  throw new Error("Career Universe cinematic preview patch requires the focus cadence patch first.");
}

replaceRequired(
  `const CAREER_IMMERSIVE_PILOT_SPEED = 4.2;\nconst CAREER_ORBIT_FOCUS_INTERVAL_MS = 3500;\nconst CAREER_ORBIT_FOCUS_HOLD_MS = 1650;`,
  `const CAREER_CINEMATIC_PREVIEW = true;\nconst CAREER_IMMERSIVE_PILOT_SPEED = 3.6;\nconst CAREER_ORBIT_FOCUS_INTERVAL_MS = 3500;\nconst CAREER_ORBIT_FOCUS_HOLD_MS = 1150;`,
  "cinematic timing constants",
);

replaceRequired(
  `const holdMs = renderer.domElement.clientWidth < 768 ? 1950 : CAREER_ORBIT_FOCUS_HOLD_MS;`,
  `const holdMs = renderer.domElement.clientWidth < 768 ? 1400 : CAREER_ORBIT_FOCUS_HOLD_MS;`,
  "mobile cinematic focus hold",
);

replaceRequired(
  `cruiseLabelEl.style.maxWidth = "min(320px,calc(100vw - 48px))";\n    cruiseLabelEl.style.padding = "12px 14px";`,
  `cruiseLabelEl.style.maxWidth = "min(280px,calc(100vw - 48px))";\n    cruiseLabelEl.style.padding = "9px 12px";`,
  "compact title-only label",
);

replaceRequired(
  `cruiseLabelEl.append(cruiseLabelTitle, cruiseLabelCategory, cruiseLabelDescription, cruiseLabelHint);`,
  `cruiseLabelEl.append(cruiseLabelTitle);`,
  "title-only cruise label children",
);

replaceRequired(
  `cruiseLabelCategory.textContent = entry?.category ?? node.category;\n      cruiseLabelDescription.textContent = "Explore its roadmap, skills, projects, and career evidence.";\n      cruiseLabelHint.textContent = "Click or tap the planet to enter";`,
  `// Cinematic cruise intentionally shows only the Career title.\n      cruiseLabelCategory.textContent = "";\n      cruiseLabelDescription.textContent = "";\n      cruiseLabelHint.textContent = "";`,
  "title-only cruise copy",
);

replaceRequired(
  `cruiseLabelEl.style.background = "rgba(3,5,14,.74)";`,
  `cruiseLabelEl.style.background = "rgba(3,5,14,.56)";`,
  "lighter cinematic label surface",
);

const desktopPanelBefore = `  } : {\n    position: "fixed",\n    bottom: 58,\n    left: "50%",\n    top: "auto",\n    transform: show ? "translateX(-50%)" : "translateX(-50%) translateY(14px)",\n    width: isOpen ? "min(520px,calc(100vw - 48px))" : 198,\n    height: isOpen ? "min(58vh,520px)" : 58,\n    background: isOpen ? "rgba(3,5,14,.88)" : "rgba(6,9,24,.78)",\n    border: "1px solid rgba(129,140,248,.22)",\n    borderRadius: isOpen ? 22 : 999,\n    backdropFilter: "blur(24px)",\n    boxShadow: isOpen ? "0 18px 70px rgba(0,0,0,.5)" : "0 10px 38px rgba(0,0,0,.32), 0 0 28px rgba(99,102,241,.08)",\n    transition: "width .38s cubic-bezier(.22,1,.36,1), height .38s cubic-bezier(.22,1,.36,1), border-radius .3s ease, opacity .35s ease, transform .35s ease",\n    opacity: show ? 1 : 0,\n    zIndex: 40, overflow: "hidden", display: "flex", flexDirection: "column",\n    pointerEvents: show ? "auto" : "none",\n  };`;

const desktopPanelAfter = `  } : {\n    position: "fixed",\n    bottom: isOpen ? 86 : 58,\n    left: isOpen ? 24 : "50%",\n    top: "auto",\n    transform: show\n      ? (isOpen ? "translateX(0)" : "translateX(-50%)")\n      : (isOpen ? "translateX(-18px) translateY(10px)" : "translateX(-50%) translateY(14px)"),\n    width: isOpen ? "min(360px,calc(100vw - 48px))" : 210,\n    height: isOpen ? "min(58vh,560px)" : 58,\n    background: isOpen ? "rgba(3,5,14,.82)" : "rgba(6,9,24,.74)",\n    border: "1px solid rgba(129,140,248,.2)",\n    borderRadius: isOpen ? 20 : 999,\n    backdropFilter: "blur(22px)",\n    boxShadow: isOpen\n      ? "0 22px 72px rgba(0,0,0,.42), 0 0 0 1px rgba(129,140,248,.04)"\n      : "0 10px 34px rgba(0,0,0,.28), 0 0 24px rgba(99,102,241,.07)",\n    transition: "left .42s cubic-bezier(.22,1,.36,1), bottom .42s cubic-bezier(.22,1,.36,1), width .42s cubic-bezier(.22,1,.36,1), height .42s cubic-bezier(.22,1,.36,1), border-radius .3s ease, opacity .35s ease, transform .42s cubic-bezier(.22,1,.36,1)",\n    opacity: show ? 1 : 0,\n    zIndex: 40, overflow: "hidden", display: "flex", flexDirection: "column",\n    pointerEvents: show ? "auto" : "none",\n  };`;

replaceRequired(desktopPanelBefore, desktopPanelAfter, "desktop side Career Browser");

replaceRequired(
  `height: isOpen ? "62vh" : 58,`,
  `height: isOpen ? "52vh" : 58,`,
  "mobile half-height Career Browser",
);

replaceRequired(
  `const nodeMat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });`,
  `const nodeMat = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.78 });`,
  "planet base material",
);

replaceRequired(
  `scene.add(instancedNodes);\n\n    // ── Ambient fill nodes`,
  `scene.add(instancedNodes);\n\n    // ── Cinematic planet visual families ──────────────────────────────────\n    const planetVisuals = allNodes.map((node) => {\n      const entry = UNIVERSE_REGISTRY.find((item) => item.id === node.id);\n      const category = entry?.category ?? node.category;\n      const family =\n        category.includes("Data") ? "data" :\n        category.includes("Automation") ? "automation" :\n        category.includes("Product") || category.includes("Marketing") ? "product" :\n        category.includes("Infrastructure") || category.includes("Security") ? "infra" :\n        "neural";\n      const sectorColor = entry ? (SECTORS[entry.sectorKey]?.color ?? "#818cf8") : "#818cf8";\n      const color = new THREE.Color(sectorColor);\n      const group = new THREE.Group();\n      group.position.set(...node.position);\n\n      const atmosphere = new THREE.Mesh(\n        new THREE.SphereGeometry(0.76, 12, 10),\n        new THREE.MeshBasicMaterial({\n          color,\n          transparent: true,\n          opacity: 0.09,\n          side: THREE.BackSide,\n          depthWrite: false,\n        }),\n      );\n      group.add(atmosphere);\n\n      let detailGeometry: THREE.BufferGeometry;\n      if (family === "infra") {\n        detailGeometry = new THREE.IcosahedronGeometry(0.69, 1);\n      } else if (family === "neural") {\n        detailGeometry = new THREE.IcosahedronGeometry(0.68, 2);\n      } else {\n        detailGeometry = new THREE.SphereGeometry(0.67, family === "product" ? 18 : 14, family === "product" ? 12 : 9);\n      }\n\n      const detail = new THREE.Mesh(\n        detailGeometry,\n        new THREE.MeshBasicMaterial({\n          color,\n          wireframe: true,\n          transparent: true,\n          opacity: family === "product" ? 0.2 : 0.31,\n          depthWrite: false,\n        }),\n      );\n      group.add(detail);\n\n      const rings: THREE.Mesh[] = [];\n      if (family === "automation" || family === "data") {\n        const ringCount = family === "automation" ? 2 : 1;\n        for (let ringIndex = 0; ringIndex < ringCount; ringIndex += 1) {\n          const ring = new THREE.Mesh(\n            new THREE.TorusGeometry(0.78 + ringIndex * 0.08, 0.018, 5, 44),\n            new THREE.MeshBasicMaterial({\n              color,\n              transparent: true,\n              opacity: 0.28 - ringIndex * 0.06,\n              depthWrite: false,\n            }),\n          );\n          ring.rotation.x = Math.PI * (0.28 + ringIndex * 0.21);\n          ring.rotation.y = Math.PI * (0.12 + ringIndex * 0.18);\n          group.add(ring);\n          rings.push(ring);\n        }\n      }\n\n      if (family === "product") {\n        const latitude = new THREE.Mesh(\n          new THREE.TorusGeometry(0.74, 0.012, 4, 48),\n          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22, depthWrite: false }),\n        );\n        latitude.rotation.x = Math.PI / 2;\n        group.add(latitude);\n        rings.push(latitude);\n      }\n\n      group.visible = false;\n      scene.add(group);\n      return { group, detail, atmosphere, rings, family };\n    });\n\n    // ── Ambient fill nodes`,
  "cinematic planet family visuals",
);

replaceRequired(
  `instancedNodes.setMatrixAt(i, dummy.matrix);\n      });\n      instancedNodes.instanceMatrix.needsUpdate = true;`,
  `instancedNodes.setMatrixAt(i, dummy.matrix);\n\n        const visual = planetVisuals[i];\n        if (visual) {\n          const closeEnoughForDetail = dist < 78 && scale > 0;\n          visual.group.visible = closeEnoughForDetail;\n          if (closeEnoughForDetail) {\n            visual.group.position.set(nx, ny, nz);\n            visual.group.scale.setScalar(scale * pulse * (isDest ? 1.04 : 1));\n            visual.group.rotation.y += delta * (visual.family === "automation" ? 0.24 : 0.11);\n            visual.group.rotation.x += delta * (visual.family === "neural" ? 0.045 : 0.018);\n            visual.rings.forEach((ring, ringIndex) => {\n              ring.rotation.z += delta * (0.12 + ringIndex * 0.07);\n            });\n            const emphasis = isHovered || isDest ? 1 : 0;\n            const detailMaterial = visual.detail.material as THREE.MeshBasicMaterial;\n            const atmosphereMaterial = visual.atmosphere.material as THREE.MeshBasicMaterial;\n            detailMaterial.opacity = THREE.MathUtils.lerp(\n              visual.family === "product" ? 0.2 : 0.31,\n              0.48,\n              emphasis,\n            );\n            atmosphereMaterial.opacity = THREE.MathUtils.lerp(0.09, 0.17, emphasis);\n          }\n        }\n      });\n      instancedNodes.instanceMatrix.needsUpdate = true;`,
  "planet family animation and distance culling",
);

replaceRequired(
  `type CareerEntryDetail = {\n  title: string;\n  path: string;\n  originX: number;\n  originY: number;\n  color: string;\n};`,
  `type PlanetVisualFamily = "neural" | "data" | "automation" | "product" | "infra";\n\nfunction getPlanetVisualFamily(category?: string): PlanetVisualFamily {\n  if (category?.includes("Data")) return "data";\n  if (category?.includes("Automation")) return "automation";\n  if (category?.includes("Product") || category?.includes("Marketing")) return "product";\n  if (category?.includes("Infrastructure") || category?.includes("Security")) return "infra";\n  return "neural";\n}\n\nfunction getPlanetEntryBackground(family: PlanetVisualFamily, color: string) {\n  if (family === "neural") {\n    return "radial-gradient(circle at 32% 28%,rgba(255,255,255,.92) 0%,transparent 8%)," +\n      "repeating-conic-gradient(from 22deg,transparent 0deg 9deg," + color + "66 10deg 11deg,transparent 12deg 24deg)," +\n      "radial-gradient(circle at 50% 55%," + color + " 0%,#111633 54%,#02030a 100%)";\n  }\n  if (family === "data") {\n    return "repeating-linear-gradient(0deg,transparent 0 18px," + color + "33 19px 20px)," +\n      "repeating-linear-gradient(90deg,transparent 0 18px," + color + "2b 19px 20px)," +\n      "radial-gradient(circle at 34% 28%,rgba(255,255,255,.78),transparent 11%)," +\n      "radial-gradient(circle at 50% 55%," + color + " 0%,#0b1530 58%,#02030a 100%)";\n  }\n  if (family === "automation") {\n    return "repeating-radial-gradient(circle at 50% 50%,transparent 0 9%," + color + "3d 9.5% 10.4%,transparent 11% 18%)," +\n      "conic-gradient(from 25deg," + color + " 0 10%,#11162f 10% 22%," + color + " 22% 28%,#080b1c 28% 46%," + color + " 46% 52%,#11162f 52% 100%)";\n  }\n  if (family === "product") {\n    return "radial-gradient(ellipse at 30% 34%,rgba(255,255,255,.82) 0%,transparent 13%)," +\n      "radial-gradient(ellipse at 66% 44%," + color + "b8 0 16%,transparent 17%)," +\n      "radial-gradient(ellipse at 39% 67%," + color + "75 0 20%,transparent 21%)," +\n      "radial-gradient(circle at 50% 52%,#24325a 0%,#101a38 48%,#03050e 100%)";\n  }\n  return "conic-gradient(from 30deg,#11162f 0 12%," + color + "75 12% 18%,#080b1c 18% 32%," + color + "55 32% 39%,#121a35 39% 56%," + color + "66 56% 62%,#060813 62% 100%)," +\n    "radial-gradient(circle at 32% 28%,rgba(255,255,255,.7),transparent 12%)";\n}\n\ntype CareerEntryDetail = {\n  title: string;\n  path: string;\n  originX: number;\n  originY: number;\n  color: string;\n  family: PlanetVisualFamily;\n};`,
  "planet family entry contract",
);

replaceRequired(
  `const color = entry ? (SECTORS[entry.sectorKey]?.color ?? "#818cf8") : "#818cf8";\n  window.dispatchEvent(new Event(CAREER_AUTOTOUR_STOP_EVENT));`,
  `const color = entry ? (SECTORS[entry.sectorKey]?.color ?? "#818cf8") : "#818cf8";\n  const family = getPlanetVisualFamily(entry?.category);\n  window.dispatchEvent(new Event(CAREER_AUTOTOUR_STOP_EVENT));`,
  "planet family selection for entry",
);

replaceRequired(
  `detail: { title: node.title, path, originX, originY, color },`,
  `detail: { title: node.title, path, originX, originY, color, family },`,
  "planet family entry detail",
);

replaceRequired(
  `background: "radial-gradient(circle at 35% 30%, #ffffff 0%, " + entry.color + " 16%, " + entry.color + " 52%, #080b1c 100%)",`,
  `background: getPlanetEntryBackground(entry.family, entry.color),\n          backgroundSize: entry.family === "data" ? "34px 34px,34px 34px,100% 100%,100% 100%" : "100% 100%",`,
  "textured close-up planet transition",
);

replaceRequired(
  `boxShadow: "0 0 42px " + entry.color + ", inset 0 0 18px rgba(255,255,255,.28)",`,
  `boxShadow: "0 0 56px " + entry.color + ", 0 0 120px " + entry.color + "55, inset -18px -24px 44px rgba(0,0,0,.38), inset 10px 12px 24px rgba(255,255,255,.2)",`,
  "cinematic planet depth lighting",
);

if (!source.includes("const CAREER_CINEMATIC_PREVIEW = true;")) {
  throw new Error("Career Universe cinematic preview patch failed: preview marker missing.");
}
if (!source.includes('cruiseLabelEl.append(cruiseLabelTitle);')) {
  throw new Error("Career Universe cinematic preview patch failed: title-only labels missing.");
}
if (!source.includes('left: isOpen ? 24 : "50%"')) {
  throw new Error("Career Universe cinematic preview patch failed: desktop side browser missing.");
}
if (!source.includes("const planetVisuals = allNodes.map")) {
  throw new Error("Career Universe cinematic preview patch failed: planet visual families missing.");
}
if (!source.includes("getPlanetEntryBackground(entry.family, entry.color)")) {
  throw new Error("Career Universe cinematic preview patch failed: textured entry transition missing.");
}

await writeFile(worldPath, source, "utf8");
console.log("Career Universe cinematic preview applied: side Career Browser, title-only fly-bys, procedural planet families, slower cruise, and textured close-up entry.");
