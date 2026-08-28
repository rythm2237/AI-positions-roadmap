import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Preview-only final interaction layers. Vercel Preview applies these during
// prebuild without changing main.
await import("./patch-career-universe-user-takeover.mjs");
await import("./patch-career-universe-natural-cruise.mjs");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const [world, controller, hero] = await Promise.all([
  read("src/components/opening-scene/World.tsx"),
  read("src/components/opening-scene/TransitionController.tsx"),
  read("src/components/opening-scene/HeroContent.tsx"),
]);

assert.doesNotMatch(world, /CareerPreviewCard/, "Universe must not show a default right-side Career preview card.");
assert.doesNotMatch(world, /<FocusedCareerLabel \/>/, "Universe must not render the old bottom-center focused Career label.");
assert.doesNotMatch(world, /<ExploreHint \/>/, "Universe must not render a redundant bottom instruction above Explore Careers.");
assert.doesNotMatch(world, /<HoverLabel node=/, "Universe must avoid duplicate React hover cards over the planet label.");

assert.match(world, /CAREER_CINEMATIC_PREVIEW = true/, "Preview must carry an explicit cinematic feature marker.");
assert.match(world, /CAREER_NATURAL_CRUISE = true/, "Preview must enable uninterrupted natural cruise behavior.");
assert.match(world, /CAREER_MOBILE_UNIVERSE_CONTINUITY = true/, "Final Universe hardening must be applied.");
assert.match(world, /CAREER_IMMERSIVE_PILOT_SPEED = 3\.6/, "Cruise must use a slow boat-like cinematic speed.");
assert.match(world, /CAREER_ORBIT_FOCUS_INTERVAL_MS = 2400/, "A new readable Career opportunity must arrive roughly every 2.4 seconds.");
assert.match(world, /CAREER_ORBIT_FOCUS_HOLD_MS = 1700/, "Desktop Career titles must remain readable long enough to overlap the next approach.");
assert.match(world, /clientWidth < 768 \? 1800 : CAREER_ORBIT_FOCUS_HOLD_MS/, "Mobile Career titles must receive a longer readable hold.");
assert.match(world, /new THREE\.CatmullRomCurve3\(cruisePoints, true/, "Universe cruise must remain one continuous closed route.");
assert.match(world, /cruiseDistance = \(cruiseDistance \+ CAREER_IMMERSIVE_PILOT_SPEED \* delta\)/, "Cruise progress must remain frame-rate independent.");
assert.match(world, /const motionPaused = reduceMotion \|\| interactionPaused/, "Automatic Career labels must never reframe the camera path.");

assert.match(world, /CAREER_NATURAL_FOCUS_MAX_DISTANCE = 56/, "The passive cruise must keep enough nearby candidates to avoid empty beats.");
assert.match(world, /CAREER_NATURAL_FOCUS_MIN_FORWARD_DOT = -0\.08/, "The candidate window must allow near-edge planets without cutting the camera toward them.");
assert.match(world, /distance > CAREER_NATURAL_FOCUS_MAX_DISTANCE/, "Distant Careers must not cause camera cuts.");
assert.match(world, /forwardDot < CAREER_NATURAL_FOCUS_MIN_FORWARD_DOT/, "Out-of-path Careers must not trigger presentation.");
assert.doesNotMatch(world, /camPos\.copy\(cruiseFocusCameraPosition\);\n\s*camTarget\.copy\(cruiseFocusPosition\);/, "Automatic Career presentation must never lock camera position and target.");
assert.doesNotMatch(world, /setDestination\(focusCandidate\)/, "Automatic Career presentation must not mutate navigation destination.");
assert.doesNotMatch(world, /rebuildConnections\(focusCandidate\)/, "Automatic Career presentation must not rebuild scene state just to show a title.");

assert.doesNotMatch(world, /lastPointerActivityAt = performance\.now\(\)/, "Pointer movement must not transfer control away from the passive cruise.");
assert.match(world, /const hoveredPlanet: CareerNode \| null = null;/, "Incidental hover must not retarget or pause the cruise camera.");
assert.match(world, /const interactionPaused = false;/, "Mouse hover and drag state must not pause passive forward motion.");
assert.match(world, /const steerX = 0;\n\s*const steerY = 0;/, "Pointer position must not steer the passive camera path.");
assert.match(world, /userControlActive = now - lastPointerActivityAt < CAREER_USER_CONTROL_TAKEOVER_MS/, "Legacy arbitration can remain structurally present but must stay dormant without pointer timestamps.");
assert.match(world, /camera\.rotateZ\(roll\)/, "Free cruise may retain subtle cinematic banking outside direct user control.");

assert.match(world, /cruiseLabelEl\.append\(cruiseLabelTitle\)/, "Cruise label must render only the Career title.");
assert.doesNotMatch(world, /Explore its roadmap, skills, projects, and career evidence\./, "Cruise label must not show explanatory microcopy.");
assert.doesNotMatch(world, /Click or tap the planet to enter/, "Cruise label must not show an instruction line.");
assert.match(world, /cruiseLabelTitle\.textContent = node\.title/, "Career title must remain visually attached to the nearby planet.");

assert.match(world, /left: isOpen \? 24 : "50%"/, "Desktop Career Browser must move to a compact side console when open.");
assert.match(world, /width: isOpen \? "min\(360px,calc\(100vw - 48px\)\)" : 210/, "Desktop side console must preserve most of the Universe viewport.");
assert.match(world, /height: isOpen \? "52vh" : 58/, "Mobile Career Browser must remain a half-height bottom sheet.");

assert.match(world, /const planetVisuals = allNodes\.map/, "Career planets must gain procedural visual-family detail.");
assert.match(world, /family === "automation" \|\| family === "data"/, "Automation and Data planet families must use orbital visual detail.");
assert.match(world, /new THREE\.IcosahedronGeometry\(0\.68, 2\)/, "Neural planet family must use a network-like faceted shell.");
assert.match(world, /closeEnoughForDetail = dist < 78/, "Planet detail must be distance-culled for runtime performance.");
assert.match(world, /getPlanetEntryBackground\(entry\.family, entry\.color\)/, "Close-up entry must reveal a textured family-specific planet surface.");
assert.match(world, /family: PlanetVisualFamily/, "Career entry transition must carry the selected planet family.");

assert.match(world, /CAREER_ENTRY_ZOOM_MS = 1950/, "Selected planet entry must be slow enough to read as a deliberate cinematic approach.");
assert.match(world, /cubic-bezier\(\.28,\.08,\.18,1\)/, "Planet entry must use a gradual cinematic acceleration/ease instead of an abrupt wipe.");
assert.match(world, /innerWidth < 768 \? 1\.35 : 1\.75/, "WebGL pixel ratio must remain adaptively capped for mobile and desktop performance.");
assert.match(world, /scheduleCareerEntry\(node, entry\.careerPath, e\.clientX, e\.clientY\)/, "A single node click or tap must start Career entry from the selected screen position.");
assert.doesNotMatch(world, /wasFocused/, "Node entry must not require a second click.");
assert.match(world, /zooming \? 190 : 1/, "Selected planet must expand monotonically to cover the viewport.");
assert.match(world, /window\.location\.assign\(detail\.path\)/, "Career navigation must happen only after the zoom transition completes.");
assert.match(world, /CAREER_AUTOTOUR_STOP_EVENT/, "Explore and selection actions must be able to stop the cruise.");

assert.match(controller, /INITIAL_TRAVEL_MS = 2920/, "Initial cinematic travel must remain distinct from the later cruise.");
assert.match(controller, /phase === "arrived"[\s\S]*advance\("exploring"\)/, "Initial arrival must hand off once into exploration mode.");
assert.doesNotMatch(controller, /travelTo\(nextNode\)/, "Controller must not restart travelling for each later Career.");
assert.match(controller, /exploring is intentionally timer-free/, "Continuous movement must remain owned by the WebGL scene.");

assert.match(hero, /Enter Career Universe/, "Homepage must retain an explicit Universe entry action.");
assert.match(hero, /pointerEvents: exiting \? "none" : "auto"/, "Hidden landing CTAs must not intercept pointer or touch input after entering the Universe.");

console.log("Career Universe passive cruise checks passed: pointer-independent motion, ~2.4s Career fly-bys, overlapping readable titles, continuous no-cut camera path, dense mobile visibility, and preserved node entry navigation.");
