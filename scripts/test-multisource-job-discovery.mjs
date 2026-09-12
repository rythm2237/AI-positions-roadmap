import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { canonicalJobKey, deduplicateJobs, safeExternalUrl } from "../src/lib/job-agent/normalization.ts";
import { orchestrateProviderSearch } from "../src/lib/job-agent/providerOrchestration.ts";

const root = new URL("..", import.meta.url);
const source = (path) => readFileSync(new URL(path, root), "utf8");

function job(provider, overrides = {}) {
  const providerHost = provider.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  const value = {
    externalId: `${provider}-1`, source: provider, sourceQuery: "AI Solutions Consultant", company: "Example GmbH",
    title: "AI Solutions Consultant", normalizedTitle: "ai solutions consultant", location: "Berlin", country: "Germany",
    sourceUrl: `https://${providerHost}.example/jobs/1`, applicationUrl: `https://${providerHost}.example/jobs/1`,
    description: "Design and deliver enterprise AI automation solutions with customers, workshops, discovery and measurable outcomes. This complete vacancy description is deliberately stable across observations.",
    descriptionComplete: true, workplaceModel: "hybrid", employmentTypes: ["full_time"], seniority: "mid",
    salaryMin: null, salaryMax: null, currency: null, requiredLanguages: ["English"], requiredSkills: ["AI Automation"], preferredSkills: [], educationRequirements: [], certificationRequirements: [], visaSponsorship: null,
    postedAt: "2026-09-10T00:00:00.000Z", expiresAt: null, canonicalKey: "", sourceQueries: ["AI Solutions Consultant"],
    sources: [{ provider, sourceJobId: `${provider}-1`, sourceQuery: "AI Solutions Consultant", sourceUrl: `https://${providerHost}.example/jobs/1`, providerPayload: {} }],
    ...overrides,
  };
  value.canonicalKey = canonicalJobKey(value);
  return value;
}

function provider(name, providerType, stage, priority, outcome, counter = { calls: 0 }) {
  return {
    name,
    metadata: { providerType, stage, priority, supportedSources: [name.toLowerCase()], fallbackOnly: stage === "FALLBACK" },
    countrySupport: () => true,
    health: async () => ({ configured: true, status: "healthy" }),
    rateLimitState: async () => ({}),
    search: async () => {
      counter.calls += 1;
      const jobs = outcome === "success" ? [job(name)] : [];
      return { provider: name, status: outcome, jobs, latencyMs: 1, requestCount: 1, rawCount: jobs.length, normalizedCount: jobs.length, rateLimitState: {}, ...(outcome === "provider_error" ? { errorCode: "DOWN" } : {}) };
    },
  };
}

const run = (providers, options = {}) => orchestrateProviderSearch({ providers, queries: ["AI Solutions Consultant"], countries: ["Germany"], correlationId: "matrix", mode: "primary", minimumBeforeFallback: 1, ...options });

test("A — direct provider succeeds and fallback stays idle", async () => {
  const fallbackCalls = { calls: 0 };
  const result = await run([provider("Direct", "DIRECT", "PRIMARY", 10, "success"), provider("SerpApi", "SEARCH_API", "FALLBACK", 100, "success", fallbackCalls)]);
  assert.equal(result.jobs.length, 1); assert.equal(result.fallbackTriggered, false); assert.equal(fallbackCalls.calls, 0);
});

test("B — direct failure is isolated and Apify succeeds", async () => {
  const fallbackCalls = { calls: 0 };
  const result = await run([provider("Direct", "DIRECT", "PRIMARY", 10, "provider_error"), provider("Apify:linkedin", "APIFY", "SECONDARY", 20, "success"), provider("SerpApi", "SEARCH_API", "FALLBACK", 100, "success", fallbackCalls)]);
  assert.equal(result.jobs.length, 1); assert.equal(result.jobs[0].source, "Apify:linkedin"); assert.equal(fallbackCalls.calls, 0);
});

test("C — direct and Apify failure trigger SerpApi fallback", async () => {
  const fallbackCalls = { calls: 0 };
  const result = await run([provider("Direct", "DIRECT", "PRIMARY", 10, "provider_error"), provider("Apify:linkedin", "APIFY", "SECONDARY", 20, "provider_error"), provider("SerpApi", "SEARCH_API", "FALLBACK", 100, "success", fallbackCalls)]);
  assert.equal(result.fallbackTriggered, true); assert.equal(fallbackCalls.calls, 1); assert.equal(result.jobs[0].source, "SerpApi");
});

test("D/O — all providers fail or return zero without throwing", async () => {
  const failed = await run([provider("Direct", "DIRECT", "PRIMARY", 10, "provider_error"), provider("SerpApi", "SEARCH_API", "FALLBACK", 100, "provider_error")]);
  const empty = await run([provider("Direct", "DIRECT", "PRIMARY", 10, "no_results"), provider("SerpApi", "SEARCH_API", "FALLBACK", 100, "no_results")]);
  assert.deepEqual(failed.jobs, []); assert.deepEqual(empty.jobs, []); assert.ok(failed.attempts.every((attempt) => attempt.errorCode === "DOWN"));
});

test("E/J — three-provider duplicate becomes one canonical official vacancy with provenance", () => {
  const shared = { postedAt: null };
  const rows = [
    job("Apify:linkedin", { ...shared, sourceUrl: "https://www.linkedin.com/jobs/view/123", applicationUrl: "https://www.linkedin.com/jobs/view/123" }),
    job("SerpApi", { ...shared, sourceUrl: "https://jobs.google.com/view/abc", applicationUrl: "https://jobs.google.com/view/abc" }),
    job("Greenhouse:example", { ...shared, sourceUrl: "https://boards.greenhouse.io/example/jobs/42", applicationUrl: "https://boards.greenhouse.io/example/jobs/42" }),
  ];
  const result = deduplicateJobs(rows);
  assert.equal(result.length, 1); assert.equal(result[0].sources.length, 3); assert.match(result[0].applicationUrl, /greenhouse\.io/);
});

test("F/G/I — unsafe and generic destinations remain behind canonical verification gates", () => {
  assert.equal(safeExternalUrl("http://169.254.169.254/latest/meta-data"), null);
  const verification = source("src/lib/job-agent/vacancyVerification.ts");
  assert.match(verification, /looksLikeListingPage/); assert.match(verification, /login|sign.?in/i); assert.match(verification, /NOT_CANONICAL_VACANCY/);
});

test("H — closed vacancy signals and 404/410 expiry paths exist", () => {
  const verification = source("src/lib/job-agent/vacancyVerification.ts");
  assert.match(verification, /404 \|\| response\.status === 410/); assert.match(verification, /no longer available/); assert.match(verification, /applications\? closed/);
});

test("K/L/M — Apify rejects malformed items and classifies timeout/failed Actor states", () => {
  const apify = source("src/lib/job-agent/providers/apify.ts");
  assert.match(apify, /!title \|\| !company \|\| !sourceUrl \|\| !applicationUrl/);
  assert.match(apify, /APIFY_ACTOR_TIMEOUT/); assert.match(apify, /APIFY_ACTOR_\$\{run\?\.status/); assert.match(apify, /TERMINAL/);
});

test("N — rate limit is an isolated typed provider outcome", async () => {
  const limited = provider("SerpApi", "SEARCH_API", "FALLBACK", 100, "rate_limit");
  const result = await run([provider("Direct", "DIRECT", "PRIMARY", 10, "no_results"), limited]);
  assert.equal(result.attempts.at(-1)?.status, "rate_limit"); assert.deepEqual(result.jobs, []);
});

test("P/Q/R/S — scheduler boundary, filters, tenant RLS and secret isolation remain explicit", () => {
  const search = source("src/app/(account)/job-agent/searchActions.ts");
  const migration = source("supabase/migrations/202609110001_multisource_job_discovery_v2.sql");
  const apify = source("src/lib/job-agent/providers/apify.ts");
  assert.match(search, /intent\.hard\.citiesRegions/); assert.match(search, /intent\.hard\.countries/);
  assert.doesNotMatch(migration, /disable row level security/i); assert.match(source("supabase/migrations/20260903103540_job_acquisition_system.sql"), /auth\.uid\(\)\) = user_id/);
  assert.match(apify, /Authorization: `Bearer \$\{token\}`/); assert.doesNotMatch(source(".env.example"), /NEXT_PUBLIC_APIFY/);
});

test("T — threshold suppresses Apify/fallback and the Actor run cap is enforced when needed", async () => {
  const apifyCalls = { calls: 0 }; const fallbackCalls = { calls: 0 };
  const result = await orchestrateProviderSearch({ providers: [provider("Direct", "DIRECT", "PRIMARY", 10, "success"), provider("Apify:linkedin", "APIFY", "SECONDARY", 20, "success", apifyCalls), provider("SerpApi", "SEARCH_API", "FALLBACK", 100, "success", fallbackCalls)], queries: ["AI", "Automation"], countries: ["Germany"], correlationId: "cost", mode: "primary", minimumBeforeFallback: 1, maxApifyRuns: 1 });
  assert.equal(apifyCalls.calls, 0); assert.equal(fallbackCalls.calls, 0); assert.equal(result.fallbackTriggered, false);
  const cappedCalls = { calls: 0 };
  await orchestrateProviderSearch({ providers: [provider("Direct", "DIRECT", "PRIMARY", 10, "no_results"), provider("Apify:linkedin", "APIFY", "SECONDARY", 20, "success", cappedCalls)], queries: ["AI", "Automation"], countries: ["Germany"], correlationId: "cap", mode: "primary", minimumBeforeFallback: 5, maxApifyRuns: 1 });
  assert.equal(cappedCalls.calls, 1);
});
