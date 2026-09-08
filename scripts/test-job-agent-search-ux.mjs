import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/components/job-agent/JobAgentSearchButton.tsx", import.meta.url), "utf8");

test("search control exposes an immediate accessible pending state", () => {
  assert.match(source, /disabled=\{pending\}/);
  assert.match(source, /aria-busy=\{pending\}/);
  assert.match(source, /role="status"/);
  assert.match(source, /aria-live="polite"/);
});

test("search control communicates staged progress without claiming exact backend completion", () => {
  assert.match(source, /Saving settings/);
  assert.match(source, /Searching providers/);
  assert.match(source, /Verifying vacancies/);
  assert.match(source, /Ranking results/);
  assert.match(source, /progress: 90/);
  assert.doesNotMatch(source, /100% complete/i);
});

test("search form blocks a second save-and-search submission while one is in flight", () => {
  assert.match(source, /searchInFlight/);
  assert.match(source, /event\.preventDefault\(\)/);
  assert.match(source, /submitter\.disabled = true/);
  assert.match(source, /value\) === "save_and_search"/);
});
