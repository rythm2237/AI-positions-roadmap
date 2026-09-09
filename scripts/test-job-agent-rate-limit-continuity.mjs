import assert from "node:assert/strict";
import test from "node:test";
import { orchestrateProviderSearch } from "../src/lib/job-agent/providerOrchestration.ts";
import { canonicalJobKey } from "../src/lib/job-agent/normalization.ts";

function job(overrides = {}) {
  const row = {
    externalId: "adzuna-bechtle",
    source: "Adzuna",
    sourceQuery: "AI Solutions Consultant",
    company: "Bechtle",
    title: "AI Solution Consultant (w/m/d)",
    normalizedTitle: "ai solution consultant w m d",
    location: "Köln, Nordrhein-Westfalen",
    country: "Germany",
    sourceUrl: "https://www.adzuna.de/details/5870802812",
    applicationUrl: "https://www.adzuna.de/details/5870802812",
    description: "Persisted incomplete Adzuna snippet.",
    descriptionComplete: false,
    workplaceModel: "unknown",
    employmentTypes: [],
    seniority: null,
    salaryMin: null,
    salaryMax: null,
    currency: "EUR",
    requiredLanguages: [],
    requiredSkills: [],
    preferredSkills: [],
    educationRequirements: [],
    certificationRequirements: [],
    visaSponsorship: null,
    postedAt: "2026-09-09T00:00:00.000Z",
    expiresAt: null,
    canonicalKey: "",
    sourceQueries: ["AI Solutions Consultant"],
    sources: [{ provider: "Adzuna", sourceJobId: "5870802812", sourceQuery: "AI Solutions Consultant", sourceUrl: "https://www.adzuna.de/details/5870802812", providerPayload: { continuitySeed: true } }],
    ...overrides,
  };
  row.canonicalKey = canonicalJobKey(row);
  return row;
}

const outcome = (provider, jobs, status = jobs.length ? "success" : "no_results") => ({
  provider,
  status,
  jobs,
  latencyMs: 5,
  requestCount: 1,
  rateLimitState: {},
});

test("rate-limited Adzuna query can use a persisted vacancy only as an exact trusted-recovery seed", async () => {
  const calls = [];
  const continuitySeed = job();
  const trusted = job({
    externalId: "ba-bechtle",
    source: "SerpApi",
    sourceQuery: "recovery",
    sourceQueries: ["recovery"],
    country: "de",
    sourceUrl: "https://www.arbeitsagentur.de/jobsuche/jobdetail/15086-44420166-94-S",
    applicationUrl: "https://www.arbeitsagentur.de/jobsuche/jobdetail/15086-44420166-94-S",
    description: "Complete independent vacancy text.",
    descriptionComplete: true,
    sources: [{ provider: "SerpApi", sourceJobId: "ba-bechtle", sourceQuery: "recovery", sourceUrl: "https://www.arbeitsagentur.de/jobsuche/jobdetail/15086-44420166-94-S", providerPayload: {} }],
  });
  const adzuna = {
    name: "Adzuna",
    countrySupport: () => true,
    health: async () => ({ configured: true, status: "healthy" }),
    rateLimitState: async () => ({}),
    search: async () => ({ ...outcome("Adzuna", [], "rate_limit"), errorCode: "RATE_LIMIT", errorMessage: "Adzuna returned HTTP 429" }),
  };
  const serp = {
    name: "SerpApi",
    countrySupport: () => true,
    health: async () => ({ configured: true, status: "healthy" }),
    rateLimitState: async () => ({}),
    search: async (input) => {
      calls.push(input);
      if (input.correlationId.endsWith(":trusted-recovery") && input.query.includes("Bechtle")) return outcome("SerpApi", [trusted]);
      return outcome("SerpApi", []);
    },
  };

  const result = await orchestrateProviderSearch({
    providers: [adzuna, serp],
    queries: ["AI Solutions Consultant"],
    countries: ["Germany"],
    correlationId: "rate-limit-continuity",
    maxRequests: 2,
    continuityJobs: [continuitySeed],
  });

  const recoveryCalls = calls.filter((call) => call.correlationId.endsWith(":trusted-recovery"));
  assert.equal(recoveryCalls.length, 1);
  assert.match(recoveryCalls[0].query, /Bechtle/);
  assert.equal(result.jobs.some((item) => item.source === "Adzuna" && item.externalId === continuitySeed.externalId), false, "cached seed must not be emitted as a current discovery");
  assert.equal(result.jobs.some((item) => item.applicationUrl.includes("arbeitsagentur.de") && item.descriptionComplete), true);
});

test("ordinary Adzuna no-results does not reactivate a persisted vacancy", async () => {
  const calls = [];
  const continuitySeed = job();
  const adzuna = {
    name: "Adzuna",
    countrySupport: () => true,
    health: async () => ({ configured: true, status: "healthy" }),
    rateLimitState: async () => ({}),
    search: async () => outcome("Adzuna", [], "no_results"),
  };
  const serp = {
    name: "SerpApi",
    countrySupport: () => true,
    health: async () => ({ configured: true, status: "healthy" }),
    rateLimitState: async () => ({}),
    search: async (input) => {
      calls.push(input);
      return outcome("SerpApi", []);
    },
  };

  const result = await orchestrateProviderSearch({
    providers: [adzuna, serp],
    queries: ["AI Solutions Consultant"],
    countries: ["Germany"],
    correlationId: "no-result-continuity",
    maxRequests: 2,
    continuityJobs: [continuitySeed],
  });

  assert.equal(calls.some((call) => call.correlationId.endsWith(":trusted-recovery")), false);
  assert.equal(result.jobs.length, 0);
});
