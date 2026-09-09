import assert from "node:assert/strict";
import test from "node:test";
import { orchestrateProviderSearch } from "../src/lib/job-agent/providerOrchestration.ts";
import { canonicalJobKey } from "../src/lib/job-agent/normalization.ts";
import { enrichRequirements } from "../src/lib/job-agent/requirements.ts";
import { extractRequiredLanguages, inferPostingLanguage } from "../src/lib/job-agent/eligibility.ts";

function job(overrides = {}) {
  const row = {
    externalId: "adzuna-5870802812",
    source: "Adzuna",
    sourceQuery: "AI Solution Consultant",
    company: "Bechtle",
    title: "AI Solution Consultant (w/m/d)",
    normalizedTitle: "ai solution consultant w m d",
    location: "Köln, Nordrhein-Westfalen",
    country: "Germany",
    sourceUrl: "https://www.adzuna.de/details/5870802812",
    applicationUrl: "https://www.adzuna.de/details/5870802812",
    description: "Short Adzuna provider snippet that is intentionally incomplete and must not be treated as full vacancy evidence.",
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
    sourceQueries: ["AI Solution Consultant"],
    sources: [{ provider: "Adzuna", sourceJobId: "5870802812", sourceQuery: "AI Solution Consultant", sourceUrl: "https://www.adzuna.de/details/5870802812", providerPayload: {} }],
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

test("SerpApi receives Germany override while persisted candidates keep configured country name", async () => {
  const calls = [];
  const serp = {
    name: "SerpApi",
    countrySupport: () => true,
    health: async () => ({ configured: true, status: "healthy" }),
    rateLimitState: async () => ({}),
    search: async (input) => {
      calls.push(input);
      return outcome("SerpApi", [job({ source: "SerpApi", country: input.country, descriptionComplete: true })]);
    },
  };
  const result = await orchestrateProviderSearch({ providers: [serp], queries: ["AI Solution Consultant"], countries: ["Germany"], correlationId: "country-normalization", maxRequests: 1 });
  assert.equal(calls[0].country, "de");
  assert.equal(result.jobs[0].country, "Germany");
  assert.equal(result.attempts[0].country, "Germany");
});

test("SerpApi keeps France human-readable so its location parameter is not reduced to fr", async () => {
  const calls = [];
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
  const result = await orchestrateProviderSearch({ providers: [serp], queries: ["AI Solutions Consultant"], countries: ["France"], correlationId: "france-label", maxRequests: 1 });
  assert.equal(calls[0].country, "France");
  assert.equal(result.attempts[0].country, "France");
});

test("trusted-source recovery performs one bounded exact lookup for an incomplete Adzuna vacancy", async () => {
  const calls = [];
  const adzuna = {
    name: "Adzuna",
    countrySupport: () => true,
    health: async () => ({ configured: true, status: "healthy" }),
    rateLimitState: async () => ({}),
    search: async (input) => {
      calls.push({ provider: "Adzuna", ...input });
      return outcome("Adzuna", [job()]);
    },
  };
  const trusted = job({
    externalId: "ba-15086-44420166-94-S",
    source: "SerpApi",
    sourceQuery: "recovery",
    country: "de",
    sourceUrl: "https://www.arbeitsagentur.de/jobsuche/jobdetail/15086-44420166-94-S",
    applicationUrl: "https://www.arbeitsagentur.de/jobsuche/jobdetail/15086-44420166-94-S",
    description: "Complete independent public vacancy text for Bechtle AI Solution Consultant.",
    descriptionComplete: true,
    employmentTypes: ["full_time"],
    sources: [{ provider: "SerpApi", sourceJobId: "ba-15086-44420166-94-S", sourceQuery: "recovery", sourceUrl: "https://www.arbeitsagentur.de/jobsuche/jobdetail/15086-44420166-94-S", providerPayload: {} }],
  });
  const serp = {
    name: "SerpApi",
    countrySupport: () => true,
    health: async () => ({ configured: true, status: "healthy" }),
    rateLimitState: async () => ({}),
    search: async (input) => {
      calls.push({ provider: "SerpApi", ...input });
      if (input.query.includes("Bechtle")) return outcome("SerpApi", [trusted]);
      return outcome("SerpApi", []);
    },
  };

  const result = await orchestrateProviderSearch({ providers: [adzuna, serp], queries: ["AI Solution Consultant"], countries: ["Germany"], location: "Köln", correlationId: "test-recovery", maxRequests: 2 });
  const recoveryCalls = calls.filter((call) => call.provider === "SerpApi" && call.query.includes("Bechtle"));
  assert.equal(recoveryCalls.length, 1);
  assert.match(recoveryCalls[0].query, /"AI Solution Consultant \(w\/m\/d\)" Bechtle/);
  assert.equal(recoveryCalls[0].country, "de");
  assert.equal(recoveryCalls[0].location, undefined);
  assert.equal(result.jobs.some((item) => item.applicationUrl.includes("arbeitsagentur.de") && item.descriptionComplete && item.country === "Germany"), true);
  assert.equal(result.attempts.some((attempt) => attempt.query.includes("Bechtle") && attempt.provider === "SerpApi"), true);
});

test("trusted-source recovery shares its bounded budget across configured countries", async () => {
  const priorLimit = process.env.JOB_AGENT_TRUSTED_RECOVERY_MAX;
  process.env.JOB_AGENT_TRUSTED_RECOVERY_MAX = "2";
  const calls = [];
  const franceJobs = [
    job({ externalId: "fr-1", company: "France One", title: "AI Consultant France One", normalizedTitle: "ai consultant france one", country: "France", location: "Paris", sourceUrl: "https://www.adzuna.fr/details/fr-1", applicationUrl: "https://www.adzuna.fr/details/fr-1" }),
    job({ externalId: "fr-2", company: "France Two", title: "AI Consultant France Two", normalizedTitle: "ai consultant france two", country: "France", location: "Paris", sourceUrl: "https://www.adzuna.fr/details/fr-2", applicationUrl: "https://www.adzuna.fr/details/fr-2" }),
  ];
  const germanyJobs = [
    job({ externalId: "de-1", company: "Bechtle", title: "AI Solution Consultant (w/m/d)", country: "Germany", location: "Köln" }),
    job({ externalId: "de-2", company: "Germany Two", title: "AI Consultant Germany Two", normalizedTitle: "ai consultant germany two", country: "Germany", location: "Berlin", sourceUrl: "https://www.adzuna.de/details/de-2", applicationUrl: "https://www.adzuna.de/details/de-2" }),
  ];
  const adzuna = {
    name: "Adzuna",
    countrySupport: () => true,
    health: async () => ({ configured: true, status: "healthy" }),
    rateLimitState: async () => ({}),
    search: async (input) => outcome("Adzuna", input.country === "France" ? franceJobs : germanyJobs),
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
  try {
    await orchestrateProviderSearch({ providers: [adzuna, serp], queries: ["AI Consultant"], countries: ["France", "Germany"], correlationId: "country-fairness", maxRequests: 4 });
    const recoveryCalls = calls.filter((call) => call.correlationId?.endsWith(":trusted-recovery"));
    assert.equal(recoveryCalls.length, 2);
    assert.equal(recoveryCalls.some((call) => call.country === "France"), true);
    assert.equal(recoveryCalls.some((call) => call.country === "de"), true);
  } finally {
    if (priorLimit === undefined) delete process.env.JOB_AGENT_TRUSTED_RECOVERY_MAX;
    else process.env.JOB_AGENT_TRUSTED_RECOVERY_MAX = priorLimit;
  }
});

test("trusted-source recovery remains conservative when no alternate canonical source is found", async () => {
  const adzuna = { name: "Adzuna", countrySupport: () => true, health: async () => ({ configured: true, status: "healthy" }), rateLimitState: async () => ({}), search: async () => outcome("Adzuna", [job()]) };
  const serp = { name: "SerpApi", countrySupport: () => true, health: async () => ({ configured: true, status: "healthy" }), rateLimitState: async () => ({}), search: async () => outcome("SerpApi", []) };
  const result = await orchestrateProviderSearch({ providers: [adzuna, serp], queries: ["AI Solution Consultant"], countries: ["Germany"], location: "Köln", correlationId: "test-no-recovery", maxRequests: 2 });
  const adzunaResult = result.jobs.find((item) => item.source === "Adzuna");
  assert.ok(adzunaResult);
  assert.equal(adzunaResult.descriptionComplete, false);
  assert.equal(result.jobs.some((item) => item.source === "SerpApi"), false);
});

test("Bechtle German fixture extracts consulting skills and both required languages without losing travel evidence", () => {
  const bechtleText = `
Deine Skills? Mehr als interessant:
Wir arbeiten mit unseren Kunden und für die Fachbereiche. Deine Kenntnisse und Erfahrungen sind für die Rolle wichtig.
Fundiertes Verständnis für AI im Unternehmensumfeld.
Erfahrung in Workshops und Bedarfsanalysen sowie in der Erstellung von Business Cases und Entscheidungsvorlagen.
Praktische Erfahrung in der Kundenberatung oder im Lösungsvertrieb.
Reisebereitschaft von ca. 40 % innerhalb Deutschlands.
Sehr gute Deutschkenntnisse sowie gute Englischkenntnisse in Wort und Schrift sind erforderlich.
`;
  const enriched = enrichRequirements(job({ description: bechtleText, descriptionComplete: true, requiredSkills: [] }), []);
  assert.deepEqual(enriched.requiredSkills.sort(), ["Business Case Development", "Solution Consulting", "Workshop Facilitation"].sort());
  assert.deepEqual(extractRequiredLanguages(bechtleText).sort(), ["English", "German"].sort());
  assert.equal(inferPostingLanguage(bechtleText), "German");
  assert.match(enriched.description, /40\s*%\s*innerhalb Deutschlands/i);
});
