import assert from "node:assert/strict";
import test from "node:test";
import { orchestrateProviderSearch } from "../src/lib/job-agent/providerOrchestration.ts";
import { canonicalJobKey } from "../src/lib/job-agent/normalization.ts";

let nextId = 1;
function job(overrides = {}) {
  const id = `job-${nextId++}`;
  const row = {
    externalId: id,
    source: "Adzuna",
    sourceQuery: "AI Solutions Consultant",
    company: "Example Co",
    title: "Generic role",
    normalizedTitle: "generic role",
    location: "Berlin",
    country: "Germany",
    sourceUrl: `https://www.adzuna.de/details/${id}`,
    applicationUrl: `https://www.adzuna.de/details/${id}`,
    description: "Incomplete aggregator snippet.",
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
    sources: [],
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

test("trusted recovery ranks title relevance inside a source query before spending budget", async () => {
  process.env.JOB_AGENT_TRUSTED_RECOVERY_MAX = "1";
  const calls = [];
  const irrelevant = job({
    externalId: "accounting",
    company: "GE Vernova",
    title: "Accounting Operations Manager (m/f/d)",
    normalizedTitle: "accounting operations manager m f d",
    sourceUrl: "https://www.adzuna.de/details/accounting",
    applicationUrl: "https://www.adzuna.de/details/accounting",
  });
  const relevant = job({
    externalId: "solution-consultant",
    company: "Bechtle",
    title: "AI Solution Consultant (w/m/d)",
    normalizedTitle: "ai solution consultant w m d",
    sourceUrl: "https://www.adzuna.de/details/solution-consultant",
    applicationUrl: "https://www.adzuna.de/details/solution-consultant",
  });

  const adzuna = {
    name: "Adzuna",
    countrySupport: () => true,
    health: async () => ({ configured: true, status: "healthy" }),
    rateLimitState: async () => ({}),
    search: async () => outcome("Adzuna", [irrelevant, relevant]),
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

  await orchestrateProviderSearch({
    providers: [adzuna, serp],
    queries: ["AI Solutions Consultant"],
    countries: ["Germany"],
    correlationId: "relevance-ranking",
    maxRequests: 2,
  });

  const recoveryCalls = calls.filter((call) => call.correlationId.endsWith(":trusted-recovery"));
  assert.equal(recoveryCalls.length, 1);
  assert.match(recoveryCalls[0].query, /AI Solution Consultant/);
  assert.doesNotMatch(recoveryCalls[0].query, /Accounting Operations Manager/);
});

test("continuity priority remains stronger than ordinary relevance inside the same query", async () => {
  process.env.JOB_AGENT_TRUSTED_RECOVERY_MAX = "1";
  const calls = [];
  const continuity = job({
    externalId: "continuity",
    company: "Persisted Co",
    title: "AI Consultant",
    normalizedTitle: "ai consultant",
    sourceUrl: "https://www.adzuna.de/details/continuity",
    applicationUrl: "https://www.adzuna.de/details/continuity",
    sources: [{ provider: "Adzuna", sourceJobId: "continuity", sourceQuery: "AI Solutions Consultant", sourceUrl: "https://www.adzuna.de/details/continuity", providerPayload: { continuitySeed: true } }],
  });
  const exactFresh = job({
    externalId: "exact-fresh",
    company: "Fresh Co",
    title: "AI Solutions Consultant",
    normalizedTitle: "ai solutions consultant",
    sourceUrl: "https://www.adzuna.de/details/exact-fresh",
    applicationUrl: "https://www.adzuna.de/details/exact-fresh",
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
      return outcome("SerpApi", []);
    },
  };
  const extraAdzuna = {
    ...adzuna,
    search: async () => outcome("Adzuna", [exactFresh]),
  };

  await orchestrateProviderSearch({
    providers: [adzuna, extraAdzuna, serp],
    queries: ["AI Solutions Consultant"],
    countries: ["Germany"],
    correlationId: "continuity-priority",
    maxRequests: 3,
    continuityJobs: [continuity],
  });

  const recoveryCalls = calls.filter((call) => call.correlationId.endsWith(":trusted-recovery"));
  assert.equal(recoveryCalls.length, 1);
  assert.match(recoveryCalls[0].query, /Persisted Co/);
});
