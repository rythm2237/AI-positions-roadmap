import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("..", import.meta.url);
const source = (path) => readFileSync(new URL(path, root), "utf8");
const portfolio = source("src/lib/job-agent/providers/directCompanyPortfolio.ts");
const expansion = source("src/lib/job-agent/providers/directCompanyExpansion.ts");
const feeds = source("src/lib/job-agent/providers/publicFeeds.ts");
const eligibility = source("src/lib/job-agent/eligibility.ts");
const fit = source("src/lib/job-agent/fitIntelligence.ts");

test("direct company monitoring covers exactly 100 technology-first employers", () => {
  assert.equal((portfolio.match(/company: "/g) ?? []).length, 50);
  assert.equal((expansion.match(/company: "/g) ?? []).length, 50);
  for (const company of [
    "Microsoft", "Google", "Apple", "Amazon", "Meta", "NVIDIA", "IBM", "Oracle", "SAP", "Salesforce",
    "OpenAI", "Anthropic", "Databricks", "Cloudflare", "Mistral AI", "Adobe", "Atlassian", "GitHub",
    "Cisco", "ServiceNow", "Snowflake", "CrowdStrike", "Palo Alto Networks", "Personio", "N26", "UiPath",
  ]) {
    assert.ok(portfolio.includes(`company: "${company}"`) || expansion.includes(`company: "${company}"`), `${company} missing`);
  }
});

test("portfolio prefers direct public ATS feeds and official employer career pages", () => {
  const combined = `${portfolio}\n${expansion}`;
  assert.match(combined, /kind: "greenhouse"/);
  assert.match(combined, /kind: "lever"/);
  assert.match(combined, /kind: "career_page"/);
  assert.match(combined, /boards-api\.greenhouse\.io\/v1\/boards/);
  assert.match(combined, /api\.lever\.co\/v0\/postings/);
});

test("top strategic IT employers remain direct sources rather than third-party aggregators", () => {
  for (const company of ["Microsoft", "Google", "Apple", "Amazon", "Meta", "NVIDIA", "IBM", "Oracle", "SAP", "Salesforce"]) {
    const index = portfolio.indexOf(`company: "${company}"`);
    assert.ok(index >= 0, `${company} missing`);
    const slice = portfolio.slice(index, index + 600);
    assert.match(slice, /kind: "career_page"/);
    assert.match(slice, /priority: "top"/);
  }
});

test("the two direct portfolios remain aggregated providers and share the emergency kill switch", () => {
  assert.match(portfolio, /readonly name = "DirectCompanyPortfolio"/);
  assert.match(expansion, /readonly name = "DirectCompanyExpansion"/);
  assert.match(feeds, /\.\.\.directCompanyPortfolioProviders\(\)/);
  assert.match(feeds, /\.\.\.directCompanyExpansionProviders\(\)/);
  assert.match(portfolio, /JOB_AGENT_DIRECT_COMPANY_ENABLED === "false"/);
  assert.match(expansion, /JOB_AGENT_DIRECT_COMPANY_ENABLED === "false"/);
});

test("direct results retain high-confidence provenance and country filtering", () => {
  assert.match(portfolio, /sourceConfidence: "high"/);
  assert.match(expansion, /sourceConfidence: "high"/);
  assert.match(portfolio, /directCompany: true/);
  assert.match(expansion, /directCompany: true/);
  assert.match(portfolio, /locationMatchesCountry/);
  assert.match(expansion, /countryMatch/);
});

test("unknown sponsorship is neutral while explicit no-sponsorship remains blocking", () => {
  assert.doesNotMatch(eligibility, /Sponsorship availability could not be verified/);
  assert.match(eligibility, /Vacancy states that sponsorship\/right-to-work support is unavailable/);
  assert.match(eligibility, /positive signal, not a hard completeness gate/);
});

test("explicit sponsorship receives a positive ranking signal without penalizing unknown sponsorship", () => {
  assert.match(fit, /const sponsorship = job\.visaSponsorship === "available" \? 5 : 0/);
  assert.match(fit, /Visa\/work-permit sponsorship explicitly available/);
  assert.match(fit, /Unknown sponsorship is neutral and does not reduce the score/);
  assert.match(fit, /evidence-fit-v3-sponsorship-signal/);
});
