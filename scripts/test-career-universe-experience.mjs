import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const [world, controller, hero] = await Promise.all([
  read("src/components/opening-scene/World.tsx"),
  read("src/components/opening-scene/TransitionController.tsx"),
  read("src/components/opening-scene/HeroContent.tsx"),
]);

assert.doesNotMatch(world, /CareerPreviewCard/, "Universe must not show a default right-side Career preview card.");
assert.match(world, /function FocusedCareerLabel\(/, "Universe must show a compact label for the node currently in front of the camera.");
assert.match(world, /Auto tour · Click or tap any node to enter/, "Universe must explain single-click/tap entry.");
assert.match(world, /scheduleCareerEntry\(node, entry\.careerPath, e\.clientX, e\.clientY\)/, "A single node click/tap must start Career entry from the selected screen position.");
assert.doesNotMatch(world, /wasFocused/, "Node entry must not require a second click on an already focused node.");
assert.match(world, /scale\(\$\{zooming \? 190 : 1\}\)/, "Selected node must expand monotonically to cover the viewport.");
assert.match(world, /window\.location\.assign\(detail\.path\)/, "Career navigation must happen only after the zoom transition is underway.");
assert.match(world, /CAREER_AUTOTOUR_STOP_EVENT/, "Explore/selection actions must be able to stop ambient touring.");

assert.match(controller, /AUTO_TOUR_PAUSE_MS = 2600/, "Auto-tour must pause long enough for the focused Career name to be read.");
assert.match(controller, /phase === "exploring"[\s\S]*travelTo\(nextNode\)/, "Auto-tour must continuously advance to another Career node.");
assert.match(controller, /ai-career-autotour-stop/, "Auto-tour must stop when Explore Careers is used.");
assert.match(controller, /ai-career-node-entry/, "Auto-tour must stop when a node is selected for entry.");

assert.match(hero, /Enter Career Universe/, "Homepage must retain an explicit Universe entry action.");
assert.match(hero, /tour AI roles automatically/, "Homepage copy must accurately describe the ambient tour.");
assert.match(hero, /pointerEvents: exiting \? "none" : "auto"/, "Hidden landing CTAs must not intercept pointer/touch input after entering the Universe.");

console.log("Career Universe experience checks passed: ambient tour, single-tap entry, monotonic zoom, and no default preview card.");
