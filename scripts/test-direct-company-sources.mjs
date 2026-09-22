import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("..", import.meta.url);
const source = (path) => readFileSync(new URL(path, root), "utf8");
const direct = source("src/lib/job-agent/providers/directCompanySources.ts");
const feeds = source("src/lib/job-agent/providers/publicFeeds.ts");

test("direct company registry covers a technology-first Germany, France and Hungary portfolio", () => {
  for (const company of [
    "Celonis", "Yext", "Pigment", "Qonto", "Dataiku", "Raisin", "GetYourGuide",
    "Contentful", "Contentsquare", "BlaBlaCar", "Back Market",
  ]) {
    assert.match(direct, new RegExp(`company: \\"${company}\\"`));
  }
  assert.match(direct, /countries: \["Germany", "France"\]/);
  assert.match(direct, /countries: \["Hungary"\]/);
  assert.match(direct, /ats: "greenhouse"/);
  assert.match(direct, /ats: "lever"/);
  assert.ok((direct.match(/company: "/g) ?? []).length >= 11);
});

test("direct providers use public ATS APIs and cache one payload per provider instance", () => {
  assert.match(direct, /boards-api\.greenhouse\.io\/v1\/boards/);
  assert.match(direct, /api\.lever\.co\/v0\/postings/);
  assert.match(direct, /this\.payloadPromise \?\?=/);
  assert.match(direct, /networkRequest \? 1 : 0/);
});

test("direct company results preserve source trust metadata and conservative country filtering", () => {
  assert.match(direct, /sourceConfidence: "high"/);
  assert.match(direct, /directCompany: true/);
  assert.match(direct, /locationMatchesCountry/);
  assert.match(direct, /\.filter\(\(job\) => locationMatchesCountry/);
});

test("direct source layer is registered by default with an emergency kill switch", () => {
  assert.match(feeds, /\.\.\.directCompanyProviders\(\)/);
  assert.match(direct, /JOB_AGENT_DIRECT_COMPANY_ENABLED === "false"/);
});
