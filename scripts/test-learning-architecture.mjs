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
assert.match(learning, /<EffortEstimate estimate=\{current\.estimatedEffort\}/);
assert.doesNotMatch(learning, /label="Duration"/);

const effortComponent = fs.readFileSync("src/components/career/EffortEstimate.tsx", "utf8");
assert.match(effortComponent, /Estimated effort/);
assert.match(effortComponent, /Resources/);
assert.match(effortComponent, /Activities/);
assert.match(effortComponent, /Assessment/);
assert.match(effortComponent, /estimate\.ongoing/);

const aiEngineer = fs.readFileSync("src/data/careers/ai-engineer.ts", "utf8");
const journeyStageSource = aiEngineer.slice(
  aiEngineer.indexOf("journeyStages: ["),
  aiEngineer.indexOf("roadmap: [")
);
const effortPattern =
  /estimatedEffort:\s*\{\s*minMinutes:\s*(\d+),\s*maxMinutes:\s*(\d+),\s*breakdown:\s*\{\s*resources:\s*\{\s*minMinutes:\s*(\d+),\s*maxMinutes:\s*(\d+)\s*\},\s*activities:\s*\{\s*minMinutes:\s*(\d+),\s*maxMinutes:\s*(\d+)\s*\},\s*assessment:\s*\{\s*minMinutes:\s*(\d+),\s*maxMinutes:\s*(\d+)\s*\}/g;
const effortEstimates = [...journeyStageSource.matchAll(effortPattern)];
assert.equal(effortEstimates.length, 13);
for (const estimate of effortEstimates) {
  const [min, max, resourcesMin, resourcesMax, activitiesMin, activitiesMax, assessmentMin, assessmentMax] =
    estimate.slice(1).map(Number);
  assert.equal(min, resourcesMin + activitiesMin + assessmentMin);
  assert.equal(max, resourcesMax + activitiesMax + assessmentMax);
  assert.ok(min > 0 && max >= min);
}
assert.equal((journeyStageSource.match(/ongoing:\s*\{/g) ?? []).length, 2);
assert.doesNotMatch(journeyStageSource, /\bduration:\s*"(?:Ongoing|\d)/);

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
assert.match(workspace, /<EffortEstimate estimate=\{stage\.estimatedEffort\} compact/);
assert.doesNotMatch(workspace, /Duration: \{stage\.duration\}/);

const journeyEngine = fs.readFileSync("src/components/career/journey-engine/CareerJourneyEngine.tsx", "utf8");
assert.match(journeyEngine, /Stage \{index \+ 1\} of \{total\}/);
assert.match(journeyEngine, /Current checkpoint: \{stage\.label \?\? stage\.title\}/);
assert.match(journeyEngine, /from-cyan-400 to-teal-300/);
assert.match(journeyEngine, /Current.*Complete.*Available.*Locked/);
assert.match(journeyEngine, /d=\{camera\.path\}/);

console.log("Learning architecture checks passed (navigation, shared Journey, resolver, gating, persistence).")
