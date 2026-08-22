import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

const readiness = read("src/lib/jobReadiness.ts");
const panel = read("src/components/career/CareerReadinessPanel.tsx");
const workspace = read("src/components/career/CareerWorkspace.tsx");

assert.match(readiness, /getJobReadinessReport/);
assert.match(readiness, /passedAssessments === assessments\.length/);
assert.match(readiness, /completedProjects >= career\.progressRules\.minimumProjects/);
assert.match(readiness, /progressRules\.readinessThreshold/);
assert.match(readiness, /nextBestAction/);
assert.match(readiness, /remainingEffortMinutes/);
assert.match(readiness, /estimateReadinessWeeks/);
assert.match(readiness, /isAssessmentQualified/);

assert.match(panel, /Starting profile/);
assert.match(panel, /Hours available per week/);
assert.match(panel, /Estimated remaining time/);
assert.match(panel, /What is still missing/);
assert.match(panel, /Next best action/);
assert.match(panel, /does not treat a checked box as proof of skill/);
assert.match(panel, /career_starting_profile__/);

assert.match(workspace, /CareerReadinessPanel/);
assert.match(workspace, /progress=\{progress\}/);
assert.match(workspace, /<CareerReadinessPanel career=\{career\} progress=\{progress\} \/>/);

console.log("Zero-to-hired phase one readiness foundation validated.");
