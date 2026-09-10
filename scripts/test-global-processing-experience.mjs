import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/components/processing/GlobalProcessingExperience.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");

test("global processing experience is mounted once at root", () => {
  assert.match(layout, /GlobalProcessingExperience/);
  assert.match(layout, /<GlobalProcessingExperience \/>/);
});

test("approved wait experience covers contextual Career OS operations", () => {
  for (const marker of [
    "/api/cv-analyzer/extract",
    "/api/cv-analyzer/evidence",
    "/api/career-intelligence/",
    "/api/project-review",
    "/api/interview-review",
    "Job Acquisition · Application Pack",
  ]) assert.ok(source.includes(marker), `missing processing context: ${marker}`);
});

test("job search remains specialized and is not intercepted by global fetch wrapper", () => {
  assert.doesNotMatch(source, /\/api\/job-agent\/search-progress/);
  assert.match(source, /window\.location\.pathname\.startsWith\("\/job-agent\/jobs\/"\)/);
});

test("processing shell exposes explicit stages and indicative progress", () => {
  assert.match(source, /Live process · progress is indicative/);
  assert.match(source, /complete \? "✓"/);
  assert.match(source, /phaseIndex/);
  assert.doesNotMatch(source, /100% complete/i);
});

test("application pack experience preserves explicit user Apply boundary", () => {
  assert.match(source, /label === "apply"/);
  assert.match(source, /input\[name="job_id"\]/);
  assert.match(source, /The application pack is generated for review, never silently submitted/);
});
