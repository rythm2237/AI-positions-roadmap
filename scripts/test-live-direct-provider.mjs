import assert from "node:assert/strict";
import { WorkdayProvider } from "../src/lib/job-agent/providers/workday.ts";

const provider = new WorkdayProvider({
  tenant: "ms",
  site: "External",
  host: "ms.wd5.myworkdayjobs.com",
  company: "Morgan Stanley",
  priority: 12,
});

const targetTitle = "Finance Automation & Solution Design Analyst";
const result = await provider.search({
  query: targetTitle,
  country: "Hungary",
  location: "Budapest",
  limit: 20,
  correlationId: "live-direct-smoke",
});

assert.equal(result.status, "success", `Direct Workday provider did not succeed: ${result.errorCode ?? "unknown"}`);
assert.ok((result.rawCount ?? 0) > 0, "Expected the public Workday CXS endpoint to return postings.");
assert.ok(result.jobs.length > 0, "Expected at least one normalized Direct vacancy.");

const exact = result.jobs.find((job) => job.title.toLowerCase() === targetTitle.toLowerCase());
const budapest = result.jobs.find((job) => /budapest/i.test(job.location ?? ""));
const vacancy = exact ?? budapest ?? result.jobs[0];

assert.ok(vacancy.title.trim().length > 0);
assert.match(vacancy.sourceUrl, /^https:\/\/ms\.wd5\.myworkdayjobs\.com\//);
assert.equal(vacancy.applicationUrl, vacancy.sourceUrl);

const canonicalResponse = await fetch(vacancy.sourceUrl, {
  method: "GET",
  redirect: "follow",
  headers: { Accept: "text/html" },
  signal: AbortSignal.timeout(12_000),
});
assert.ok(canonicalResponse.ok, `Canonical vacancy returned HTTP ${canonicalResponse.status}.`);

console.log(JSON.stringify({
  provider: result.provider,
  providerType: provider.metadata.providerType,
  structuredSource: result.metadata?.source ?? null,
  status: result.status,
  query: targetTitle,
  rawCount: result.rawCount ?? null,
  normalizedCount: result.normalizedCount ?? result.jobs.length,
  exactTargetFound: Boolean(exact),
  title: vacancy.title,
  location: vacancy.location,
  country: vacancy.country,
  sourceUrl: vacancy.sourceUrl,
  canonicalStatus: canonicalResponse.status,
  latencyMs: result.latencyMs,
  costUsd: 0,
}, null, 2));
