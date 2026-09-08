import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const buttonSource = readFileSync(new URL("../src/components/job-agent/JobAgentSearchButton.tsx", import.meta.url), "utf8");
const pageSource = readFileSync(new URL("../src/app/(account)/job-agent/page.tsx", import.meta.url), "utf8");
const dashboardSource = readFileSync(new URL("../src/components/job-agent/JobAgentDashboardView.tsx", import.meta.url), "utf8");
const repositorySource = readFileSync(new URL("../src/lib/job-agent/repository.ts", import.meta.url), "utf8");
const normalizationSource = readFileSync(new URL("../src/lib/job-agent/normalization.ts", import.meta.url), "utf8");

test("search control exposes an immediate accessible pending state without disabling its submit intent", () => {
  assert.match(buttonSource, /aria-disabled=\{pending\}/);
  assert.match(buttonSource, /aria-busy=\{pending\}/);
  assert.match(buttonSource, /data-pending=\{pending \? "true" : "false"\}/);
  assert.match(buttonSource, /role="status"/);
  assert.match(buttonSource, /aria-live="polite"/);
  assert.doesNotMatch(buttonSource, /disabled=\{pending\}/);
});

test("search control communicates staged progress without claiming exact backend completion", () => {
  assert.match(buttonSource, /Saving settings/);
  assert.match(buttonSource, /Searching providers/);
  assert.match(buttonSource, /Verifying vacancies/);
  assert.match(buttonSource, /Ranking results/);
  assert.match(buttonSource, /progress: 90/);
  assert.doesNotMatch(buttonSource, /100% complete/i);
});

test("search form blocks duplicate submissions while preserving save-and-search intent", () => {
  assert.match(buttonSource, /const onSubmit = \(event: SubmitEvent\)/);
  assert.match(buttonSource, /if \(searchInFlight\.current\)/);
  assert.match(buttonSource, /event\.preventDefault\(\)/);
  assert.match(buttonSource, /beginProgress\(\)/);
  assert.match(buttonSource, /name="intent"/);
  assert.match(buttonSource, /value="save_and_search"/);
  assert.match(buttonSource, /getAttribute\("value"\) === "save_and_search"/);
  assert.doesNotMatch(buttonSource, /submitter\.disabled = true/);
  assert.doesNotMatch(buttonSource, /disabled=\{pending\}/);
});

test("search progress resets only after navigation actually changes", () => {
  assert.match(buttonSource, /searchStartNavigationKey/);
  assert.match(buttonSource, /navigationKey !== startKey/);
  assert.match(buttonSource, /window\.location\.href !== startHref/);
});

test("search summary uses visual cards and omits expired counts", () => {
  assert.match(pageSource, /Canonical jobs/);
  assert.match(pageSource, /Needs review/);
  assert.match(pageSource, /Source issues/);
  assert.match(pageSource, /Expired vacancies are removed before ranking/);
  assert.doesNotMatch(pageSource, /label: "Expired"/);
});

test("desktop identity sources live in a sticky sidebar and mobile uses a collapsible panel", () => {
  assert.match(pageSource, /sticky top-24 hidden lg:block/);
  assert.match(pageSource, /Profile, CV & LinkedIn/);
  assert.match(pageSource, /Your search identity/);
});

test("job results render as compact expandable rows with actions inside", () => {
  assert.match(dashboardSource, /<details className=/);
  assert.match(dashboardSource, /Compact by default/);
  assert.match(dashboardSource, /Prepare with review/);
  assert.match(dashboardSource, /Evidence & details/);
  assert.match(dashboardSource, /Snooze/);
  assert.match(dashboardSource, /Blocked by hard rules/);
});

test("expired vacancies are removed before ranking and excluded from workspace stats", () => {
  assert.match(normalizationSource, /Expired vacancies are removed at the earliest canonicalization boundary/);
  assert.match(normalizationSource, /expiration <= now\.getTime\(\)/);
  assert.match(repositorySource, /\.neq\("freshness_status", "expired"\)/);
  assert.match(repositorySource, /job\.freshness_status !== "expired"/);
});
