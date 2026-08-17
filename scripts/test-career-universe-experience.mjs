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
assert.match(world, /CAREER_IMMERSIVE_PILOT_SPEED = 3\.6/, "Cruise must use a slow boat-like cinematic speed.");
assert.match(world, /CAREER_ORBIT_FOCUS_INTERVAL_MS = 3500/, "Career title opportunities must remain roughly 3.5 seconds apart when a suitable planet is naturally ahead.");
assert.match(world, /CAREER_ORBIT_FOCUS_HOLD_MS = 1150/, "Desktop title presentation must remain a brief cinematic beat.");
assert.match(world, /new THREE\.CatmullRomCurve3\(cruisePoints, true/, "Universe cruise must remain one continuous closed route.");
assert.match(world, /cruiseDistance = \(cruiseDistance \+ CAREER_IMMERSIVE_PILOT_SPEED \* delta\)/, "Cruise progress must remain frame-rate independent.");
assert.match(world, /const motionPaused = reduceMotion \|\| interactionPaused/, "Automatic Career labels must never pause or reframe the camera path.");

assert.match(world, /CAREER_NATURAL_FOCUS_MAX_DISTANCE = 34/, "Automatic Career labels must only consider nearby planets.");
assert.match(world, /CAREER_NATURAL_FOCUS_MIN_FORWARD_DOT = 0\.2/, "Automatic Career labels must only select planets naturally ahead of the camera.");
assert.match(world, /distance > CAREER_NATURAL_FOCUS_MAX_DISTANCE/, "Distant Careers must not cause camera cuts.");
assert.match(world, /forwardDot < CAREER_NATURAL_FOCUS_MIN_FORWARD_DOT/, "Behind-camera Careers must not trigger presentation.");
assert.doesNotMatch(world, /camPos\.copy\(cruiseFocusCameraPosition\);\n\s*camTarget\.copy\(cruiseFocusPosition\);/, "Automatic Career presentation must never lock camera position and target.");
assert.doesNotMatch(world, /setDestination\(focusCandidate\)/, "Automatic Career presentation must not mutate navigation destination.");
assert.doesNotMatch(world, /rebuildConnections\(focusCandidate\)/, "Automatic Career presentation must not rebuild scene state just to show a title.");

assert.match(world, /CAREER_USER_CONTROL_TAKEOVER_MS = 3200/, "Pointer activity must own the camera for a 3.2 second inactivity grace period.");
assert.match(world, /lastPointerActivityAt = performance\.now\(\)/, "Pointer movement must immediately transfer control to the user.");
assert.match(world, /userControlActive = now - lastPointerActivityAt < CAREER_USER_CONTROL_TAKEOVER_MS/, "User-control activity must be determined independently of automatic labels.");
assert.match(world, /interactionPaused = hoveredPlanet !== null \|\| o\.isDragging \|\| userControlActive/, "Cruise translation must freeze during direct mouse takeover, hover, or drag.");
assert.match(world, /camPos\.copy\(camPosSmoothed\)[\s\S]*camTarget\.copy\(cruiseAhead\)/, "Mouse takeover must freeze camera position while allowing stable gaze steering.");
assert.match(world, /pointerStabilizesPlanets \? 1 : 1 \+ Math\.sin/, "Planet pulse must stop during pointer control so hover targets cannot oscillate under the cursor.");
assert.match(world, /nextCruiseFocusAt = Math\.max\(nextCruiseFocusAt, now \+ 500\)/, "Automatic labels must stay dormant while the user is actively looking around.");
assert.match(world, /focusSuppressesBank = hoveredNodeRef\.current !== null \|\| performance\.now\(\) - lastPointerActivityAt < CAREER_USER_CONTROL_TAKEOVER_MS/, "Only direct user intent should suppress the gentle cinematic bank.");
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

console.log("Career Universe natural cruise checks passed: uninterrupted camera path, forward-field title fly-bys, exclusive mouse takeover, stable hover, slower textured entry, compact side browser, and performance-capped planet families.");
