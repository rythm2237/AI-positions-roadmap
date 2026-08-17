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
assert.doesNotMatch(world, /<HoverLabel node=/, "Universe must avoid a duplicate React hover card over the immersive planet label.");

assert.match(world, /CAREER_IMMERSIVE_PILOT_SPEED = 4\.2/, "Universe must cruise slowly enough for a rider-like experience.");
assert.match(world, /CAREER_ORBIT_PAUSE_MS = 1900/, "Desktop fly-bys must pause long enough for the Career label to be read.");
assert.match(world, /clientWidth < 768 \? 2500 : CAREER_ORBIT_PAUSE_MS/, "Mobile fly-bys must give touch users extra decision time.");
assert.match(world, /new THREE\.CatmullRomCurve3\(cruisePoints, true/, "Universe cruise must follow one continuous closed route instead of node-to-node zoom resets.");
assert.match(world, /cruiseDistance = \(cruiseDistance \+ CAREER_IMMERSIVE_PILOT_SPEED \* delta\)/, "Cruise progress must remain frame-rate independent.");

assert.match(world, /hoveredNodeRef\.current = node/, "Raycast hover state must be available to pause the cruise without React frame churn.");
assert.match(world, /interactionPaused = hoveredPlanet !== null \|\| o\.isDragging/, "Hovering a planet or actively dragging must freeze travel.");
assert.match(world, /if \(!motionPaused\)[\s\S]*cruiseDistance =/, "Cruise distance must stop advancing while the user is interacting.");
assert.match(world, /mouse\.x \+ o\.yaw \* 0\.18/, "Pointer and drag input must steer the cockpit view horizontally.");
assert.match(world, /-mouse\.y \+ o\.pitch \* 0\.22/, "Pointer and drag input must steer the cockpit view vertically.");
assert.match(world, /camera\.rotateZ\(roll\)/, "Cockpit view must include only subtle cinematic banking.");

assert.match(world, /SphereGeometry\(0\.58, 16, 16\)/, "Career planets must be comfortably visible and targetable without excessive geometry.");
assert.match(world, /innerWidth < 768 \? 1\.35 : 1\.75/, "WebGL pixel ratio must be capped adaptively for mobile and desktop performance.");
assert.match(world, /Explore its roadmap, skills, projects, and career evidence\./, "Planet label must include concise useful Career microcopy.");
assert.match(world, /Click or tap the planet to enter/, "Planet label must make the interaction affordance explicit.");
assert.match(world, /cruiseLabelTitle\.textContent = node\.title/, "Career name must stay visually attached to the nearby planet.");
assert.match(world, /bottom: 58,[\s\S]*left: "50%"/, "Desktop Explore Careers control must remain fixed near the bottom center.");

assert.match(world, /scheduleCareerEntry\(node, entry\.careerPath, e\.clientX, e\.clientY\)/, "A single node click or tap must start Career entry from the selected screen position.");
assert.doesNotMatch(world, /wasFocused/, "Node entry must not require a second click on an already focused node.");
assert.match(world, /zooming \? 190 : 1/, "Selected node must expand monotonically to cover the viewport.");
assert.match(world, /window\.location\.assign\(detail\.path\)/, "Career navigation must happen only after the zoom transition completes.");
assert.match(world, /CAREER_AUTOTOUR_STOP_EVENT/, "Explore and selection actions must be able to stop the cruise.");

assert.match(controller, /INITIAL_TRAVEL_MS = 2920/, "Initial cinematic travel must remain distinct from the later cruise.");
assert.match(controller, /phase === "arrived"[\s\S]*advance\("exploring"\)/, "Initial arrival must hand off once into exploration/cruise mode.");
assert.doesNotMatch(controller, /travelTo\(nextNode\)/, "Controller must not restart travelling for every node after initial entry.");
assert.match(controller, /exploring is intentionally timer-free/, "Continuous orbital movement must be owned by the WebGL scene, not repeated phase timers.");

assert.match(hero, /Enter Career Universe/, "Homepage must retain an explicit Universe entry action.");
assert.match(hero, /tour AI roles automatically/, "Homepage copy must still describe the automatic Universe experience.");
assert.match(hero, /pointerEvents: exiting \? "none" : "auto"/, "Hidden landing CTAs must not intercept pointer or touch input after entering the Universe.");

console.log("Career Universe experience checks passed: slow immersive cockpit cruise, pointer steering, hover-to-pause, readable planet microcopy, mobile decision time, adaptive WebGL rendering, and single-tap entry.");
