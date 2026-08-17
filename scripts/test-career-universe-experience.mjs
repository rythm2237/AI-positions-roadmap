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
assert.doesNotMatch(world, /<FocusedCareerLabel \/>/, "Universe must not render the old bottom-center focused Career label.");
assert.doesNotMatch(world, /<ExploreHint \/>/, "Universe must not render a redundant bottom instruction above the Explore Careers dock.");
assert.match(world, /CAREER_ORBIT_CRUISE_SPEED = 13\.5/, "Universe cruise must use one explicit constant world-space speed.");
assert.match(world, /CAREER_ORBIT_PAUSE_MS = 620/, "Universe cruise must use only a short pause beside each Career node.");
assert.match(world, /new THREE\.CatmullRomCurve3\(cruisePoints, true/, "Universe cruise must follow one continuous closed route instead of node-to-node zoom resets.");
assert.match(world, /cruiseDistance = \(cruiseDistance \+ CAREER_ORBIT_CRUISE_SPEED \* delta\)/, "Cruise distance must advance continuously from delta time at constant speed.");
assert.match(world, /cruiseLabelTitle\.textContent = node\.title/, "Career name must appear beside the planet during its short pause.");
assert.match(world, /bottom: 58,[\s\S]*left: "50%"/, "Desktop Explore Careers control must remain fixed near the bottom center.");
assert.match(world, /scheduleCareerEntry\(node, entry\.careerPath, e\.clientX, e\.clientY\)/, "A single node click or tap must start Career entry from the selected screen position.");
assert.doesNotMatch(world, /wasFocused/, "Node entry must not require a second click on an already focused node.");
assert.match(world, /scale\(" \+ \(zooming \? 190 : 1\) \+ "\)"\)/, "Selected node must expand monotonically to cover the viewport.");
assert.match(world, /window\.location\.assign\(detail\.path\)/, "Career navigation must happen only after the zoom transition completes.");
assert.match(world, /CAREER_AUTOTOUR_STOP_EVENT/, "Explore and selection actions must be able to stop the cruise.");

assert.match(controller, /INITIAL_TRAVEL_MS = 2920/, "Initial cinematic travel must remain distinct from the later cruise.");
assert.match(controller, /phase === "arrived"[\s\S]*advance\("exploring"\)/, "Initial arrival must hand off once into exploration/cruise mode.");
assert.doesNotMatch(controller, /travelTo\(nextNode\)/, "Controller must not restart travelling for every node after initial entry.");
assert.match(controller, /exploring is intentionally timer-free/, "Continuous orbital movement must be owned by the WebGL scene, not repeated phase timers.");

assert.match(hero, /Enter Career Universe/, "Homepage must retain an explicit Universe entry action.");
assert.match(hero, /tour AI roles automatically/, "Homepage copy must still describe the automatic Universe experience.");
assert.match(hero, /pointerEvents: exiting \? "none" : "auto"/, "Hidden landing CTAs must not intercept pointer or touch input after entering the Universe.");

console.log("Career Universe experience checks passed: initial-only zoom, constant orbital cruise, short planet-side labels, fixed Explore Careers dock, and single-tap entry.");
