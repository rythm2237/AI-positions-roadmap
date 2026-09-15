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

const ordered = [...result.jobs].sort((left, right) => {
  const score = (job) =>
    (job.title.toLowerCase() === targetTitle.toLowerCase() ? 4 : 0) +
    (/automation/i.test(job.title) ? 2 : 0) +
    (/budapest/i.test(job.location ?? "") ? 1 : 0);
  return score(right) - score(left);
});

const checks = [];
let verified = null;
for (const vacancy of ordered.slice(0, 10)) {
  assert.match(vacancy.sourceUrl, /^https:\/\/ms\.wd5\.myworkdayjobs\.com\//);
  assert.equal(vacancy.applicationUrl, vacancy.sourceUrl);
  try {
    const response = await fetch(vacancy.sourceUrl, {
      method: "GET",
      redirect: "follow",
      headers: { Accept: "text/html" },
      signal: AbortSignal.timeout(8_000),
    });
    checks.push({ title: vacancy.title, location: vacancy.location, status: response.status });
    if (response.ok) {
      verified = { vacancy, status: response.status };
      break;
    }
  } catch (error) {
    checks.push({ title: vacancy.title, location: vacancy.location, status: error instanceof Error ? error.name : "FETCH_ERROR" });
  }
}

console.log(JSON.stringify({
  provider: result.provider,
  providerType: provider.metadata.providerType,
  structuredSource: result.metadata?.source ?? null,
  status: result.status,
  query: targetTitle,
  rawCount: result.rawCount ?? null,
  normalizedCount: result.normalizedCount ?? result.jobs.length,
  exactTargetFound: result.jobs.some((job) => job.title.toLowerCase() === targetTitle.toLowerCase()),
  checkedCanonicalDestinations: checks,
  verified: verified ? {
    title: verified.vacancy.title,
    location: verified.vacancy.location,
    country: verified.vacancy.country,
    sourceUrl: verified.vacancy.sourceUrl,
    canonicalStatus: verified.status,
  } : null,
  latencyMs: result.latencyMs,
  costUsd: 0,
}, null, 2));

assert.ok(verified, "Direct Workday CXS returned normalized rows, but none of the first 10 canonical source pages was live.");
