import assert from "node:assert/strict";

process.env.JOB_DISCOVERY_V2_MODE = "primary";
process.env.JOB_PROVIDER_DIRECT_ENABLED = "true";
process.env.JOB_PROVIDER_APIFY_ENABLED = "false";
process.env.JOB_PROVIDER_SERPAPI_ENABLED = "false";
process.env.JOB_PROVIDER_ADZUNA_ENABLED = "false";
process.env.JOB_AGENT_GREENHOUSE_BOARDS = "";
process.env.JOB_AGENT_LEVER_SITES = "milltownpartners";
process.env.JOB_DISCOVERY_WORKDAY_SITES = "[]";

const { configuredJobProviders } = await import("../src/lib/job-agent/providers/gateway.ts");
const providers = configuredJobProviders();
const direct = providers.find((provider) => provider.id === "lever:milltownpartners");

assert.ok(direct, "Expected the configured public Lever provider.");
assert.equal(direct.metadata.providerType, "DIRECT");

const result = await direct.search({
  query: "AI Solutions Consultant",
  country: "United Kingdom",
  location: "London",
  limit: 5,
  correlationId: "live-direct-smoke",
});

assert.equal(result.status, "success", `Direct Lever provider did not succeed: ${result.errorCode ?? "unknown"}`);
assert.ok((result.rawCount ?? 0) > 0, "Expected the public Lever board to return postings.");
assert.ok(result.jobs.length > 0, "Expected at least one normalized Direct vacancy.");

const vacancy = result.jobs.find((job) => /AI Solutions Consultant/i.test(job.title)) ?? result.jobs[0];
assert.match(vacancy.title, /AI Solutions Consultant/i);
assert.match(vacancy.sourceUrl, /^https:\/\/jobs\.lever\.co\/milltownpartners\//);
assert.match(vacancy.applicationUrl, /^https:\/\/jobs\.lever\.co\/milltownpartners\//);

const canonicalResponse = await fetch(vacancy.sourceUrl, {
  method: "GET",
  redirect: "follow",
  headers: { Accept: "text/html" },
  signal: AbortSignal.timeout(12_000),
});
assert.ok(canonicalResponse.ok, `Canonical vacancy returned HTTP ${canonicalResponse.status}.`);

console.log(JSON.stringify({
  provider: result.provider,
  status: result.status,
  rawCount: result.rawCount ?? null,
  normalizedCount: result.normalizedCount ?? result.jobs.length,
  title: vacancy.title,
  sourceUrl: vacancy.sourceUrl,
  applicationUrl: vacancy.applicationUrl,
  canonicalStatus: canonicalResponse.status,
  latencyMs: result.latencyMs,
}, null, 2));
