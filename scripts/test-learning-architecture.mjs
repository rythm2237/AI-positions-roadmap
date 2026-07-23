import assert from "node:assert/strict";
import fs from "node:fs";
await import("./test-public-beta.mjs");

const nav = fs.readFileSync("src/lib/careerNavigation.ts", "utf8");
const labels = [...nav.matchAll(/label: "([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(labels, ["Hero", "Roadmap", "Learning", "Project", "Portfolio", "Jobs", "Interview Brief"]);
assert.doesNotMatch(nav, /career-intelligence/);
assert.match(nav, /\/learning/);

const learning = fs.readFileSync("src/components/career/learning/LearningWorkspace.tsx", "utf8");
assert.match(learning, /career\.journeyStages\.map/);
assert.doesNotMatch(learning, /const\s+(phases|modules)\s*=\s*\[/);
assert.match(learning, /isJourneyStageUnlocked/);
assert.match(learning, /resolveCareerStepReferences/);
assert.match(learning, /Career OS Role Validation/);

const resolver = fs.readFileSync("src/lib/references/referenceResolver.ts", "utf8");
assert.match(resolver, /timestampSeconds/);
assert.match(resolver, /segment\.anchor/);
assert.match(resolver, /status === "replaced"/);

const progress = fs.readFileSync("src/lib/careerWorkspaceProgress.ts", "utf8");
assert.match(progress, /assessmentAttempts/);
assert.match(progress, /resourceViewedAt/);

const workspace = fs.readFileSync("src/components/career/CareerWorkspace.tsx", "utf8");
assert.match(workspace, /<DesktopMenu activeSection=\{activeSection\} open=\{roadmapMenuOpen\}/);
assert.match(workspace, /<MobileNav activeSection=\{activeSection\} switchSection=\{switchSection\} \/>/);
assert.match(workspace, /aria-current=\{active \? "page" : undefined\}/);
assert.match(workspace, /left-\[76px\]/);
assert.doesNotMatch(workspace, /if \(isRoadmapMode\) return/);
assert.doesNotMatch(workspace, /bg-\[#eadfca\]/);
assert.match(workspace, /aria-label="Back to Career Universe"/);

const journeyEngine = fs.readFileSync("src/components/career/journey-engine/CareerJourneyEngine.tsx", "utf8");
assert.match(journeyEngine, /Phase: \{stage\.title\}/);
assert.match(journeyEngine, /Current checkpoint: \{stage\.label \?\? stage\.title\}/);
assert.match(journeyEngine, /from-cyan-400 to-teal-300/);
assert.match(journeyEngine, /Current.*Complete.*Available.*Locked/);
assert.match(journeyEngine, /d=\{camera\.path\}/);

console.log("Learning architecture checks passed (navigation, shared Journey, resolver, gating, persistence).")
