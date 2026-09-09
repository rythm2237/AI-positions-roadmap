import assert from "node:assert/strict";
import test from "node:test";
import { orchestrateProviderSearch } from "../src/lib/job-agent/providerOrchestration.ts";
import { canonicalJobKey } from "../src/lib/job-agent/normalization.ts";

function makeJob(index, overrides = {}) {
  const row = {
    externalId: `adzuna-${index}`,
    source: "Adzuna",
    sourceQuery: "AI Solutions Consultant",
    company: `Company ${index}`,
    title: `AI Solutions Consultant ${index}`,
    normalizedTitle: `ai solutions consultant ${index}`,
    location: "Germany",
    country: "Germany",
    sourceUrl: `https://www.adzuna.de/details/${index}`,
    applicationUrl: `https://www.adzuna.de/details/${index}`,
    description: "Incomplete Adzuna snippet",
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
    postedAt: null,
    expiresAt: null,
    canonicalKey: "",
    sourceQueries: ["AI Solutions Consultant"],
    sources: [{ provider: "Adzuna", sourceJobId: String(index), sourceQuery: "AI Solutions Consultant", sourceUrl: `https://www.adzuna.de/details/${index}`, providerPayload: {} }],
    ...overrides,
  };
  row.canonicalKey = canonicalJobKey(row);
  return row;
}

const outcome = (provider, jobs) => ({ provider, status: jobs.length ? "success" : "no_results", jobs, latencyMs: 1, requestCount: 1, rateLimitState: {} });

test("trusted recovery candidates are emitted before bulk discovery rows so downstream caps cannot drop them", async () => {
  const primaryJobs = Array.from({ length: 90 }, (_, index) => makeJob(index));
  const trusted = makeJob(999, {
    externalId: "trusted-0",
    source: "SerpApi",
    sourceQuery: '"AI Solutions Consultant 0" Company 0',
    company: "Company 0",
    title: "AI Solutions Consultant 0",
    sourceUrl: "https://example.com/trusted/company-0",
    applicationUrl: "https://example.com/trusted/company-0",
    description: "Complete independent vacancy text",
    descriptionComplete: true,
    sources: [{ provider: "SerpApi", sourceJobId: "trusted-0", sourceQuery: '"AI Solutions Consultant 0" Company 0', sourceUrl: "https://example.com/trusted/company-0", providerPayload: {} }],
  });

  const adzuna = {
    name: "Adzuna",
    countrySupport: () => true,
    health: async () => ({ configured: true, status: "healthy" }),
    rateLimitState: async () => ({}),
    search: async () => outcome("Adzuna", primaryJobs),
  };
  const serp = {
    name: "SerpApi",
    countrySupport: () => true,
    health: async () => ({ configured: true, status: "healthy" }),
    rateLimitState: async () => ({}),
    search: async (input) => input.correlationId.endsWith(":trusted-recovery") && input.query.includes("Company 0")
      ? outcome("SerpApi", [trusted])
      : outcome("SerpApi", []),
  };

  const result = await orchestrateProviderSearch({
    providers: [adzuna, serp],
    queries: ["AI Solutions Consultant"],
    countries: ["Germany"],
    correlationId: "priority-test",
    maxRequests: 2,
  });

  assert.ok(result.jobs.length > 80);
  assert.equal(result.jobs[0].source, "SerpApi");
  assert.equal(result.jobs[0].applicationUrl, "https://example.com/trusted/company-0");
  assert.equal(result.jobs.slice(0, 80).some((job) => job.applicationUrl === trusted.applicationUrl), true);
});
