import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("..", import.meta.url);
const source = (path) => readFileSync(new URL(path, root), "utf8");
const portfolio = source("src/lib/job-agent/providers/directCompanyPortfolio.ts");
const feeds = source("src/lib/job-agent/providers/publicFeeds.ts");

test("direct company portfolio contains exactly 50 technology-first employers", () => {
  assert.equal((portfolio.match(/company: "/g) ?? []).length, 50);
  for (const company of [
    "Microsoft", "Google", "Apple", "Amazon", "Meta", "NVIDIA", "IBM", "Oracle", "SAP", "Salesforce",
    "Celonis", "Dataiku", "Datadog", "Cloudflare", "Grafana Labs", "Figma", "Anthropic", "OpenAI",
    "Databricks", "MongoDB", "Snyk", "Palantir", "Stripe", "GitLab", "Elastic", "Mistral AI",
  ]) {
    assert.match(portfolio, new RegExp(`company: \\"${company}\\"`));
  }
});

test("portfolio prefers direct public ATS feeds and supports official career pages for strategic employers", () => {
  assert.match(portfolio, /kind: "greenhouse"/);
  assert.match(portfolio, /kind: "lever"/);
  assert.match(portfolio, /kind: "career_page"/);
  assert.match(portfolio, /boards-api\.greenhouse\.io\/v1\/boards/);
  assert.match(portfolio, /api\.lever\.co\/v0\/postings/);
  assert.match(portfolio, /official-search-page/);
});

test("top ten strategic IT employers are direct sources rather than third-party aggregators", () => {
  for (const company of ["Microsoft", "Google", "Apple", "Amazon", "Meta", "NVIDIA", "IBM", "Oracle", "SAP", "Salesforce"]) {
    const index = portfolio.indexOf(`company: "${company}"`);
    assert.ok(index >= 0, `${company} missing`);
    const slice = portfolio.slice(index, index + 600);
    assert.match(slice, /kind: "career_page"/);
    assert.match(slice, /priority: "top"/);
  }
});

test("portfolio remains one gateway provider so fifty companies do not exhaust provider request slots", () => {
  assert.match(portfolio, /readonly name = "DirectCompanyPortfolio"/);
  assert.match(portfolio, /return \[new DirectCompanyPortfolioProvider\(\)\]/);
  assert.match(feeds, /\.\.\.directCompanyPortfolioProviders\(\)/);
  assert.doesNotMatch(feeds, /\.\.\.directCompanyProviders\(\)/);
});

test("direct results retain high-confidence provenance, country filtering and emergency kill switch", () => {
  assert.match(portfolio, /sourceConfidence: "high"/);
  assert.match(portfolio, /directCompany: true/);
  assert.match(portfolio, /locationMatchesCountry/);
  assert.match(portfolio, /JOB_AGENT_DIRECT_COMPANY_ENABLED === "false"/);
});
