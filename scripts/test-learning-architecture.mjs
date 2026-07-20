import assert from "node:assert/strict";
import fs from "node:fs";

const nav = fs.readFileSync("src/lib/careerNavigation.ts", "utf8");
const labels = [...nav.matchAll(/label: "([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(labels, ["Hero", "Market Intelligence", "Roadmap", "Learning", "Project", "Portfolio", "Jobs", "Interview Brief"]);
assert.match(nav, /career-intelligence\/occupations\/ai-ml-engineering/);
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

console.log("Learning architecture checks passed (navigation, shared Journey, resolver, gating, persistence).")
