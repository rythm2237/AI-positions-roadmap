import assert from "node:assert/strict";
import test from "node:test";
import { ApifyJobProvider } from "../src/lib/job-agent/providers/apify.ts";

const originalFetch = globalThis.fetch;
const originalToken = process.env.APIFY_API_TOKEN;
const originalTimeout = process.env.JOB_DISCOVERY_APIFY_TIMEOUT_MS;
const actor = { source: "linkedin", actorId: "approved~public-jobs", enabled: true, priority: 20, maxResults: 10, maxChargeUsd: 1, inputTemplate: { keywords: "{{query}}", location: "{{location}}", maxItems: "{{limit}}" } };
const input = { query: "AI Solutions Consultant", country: "Germany", location: "Berlin", limit: 5, correlationId: "apify-test" };

process.env.APIFY_API_TOKEN = "test-token-never-logged";

test.after(() => {
  globalThis.fetch = originalFetch;
  if (originalToken == null) delete process.env.APIFY_API_TOKEN; else process.env.APIFY_API_TOKEN = originalToken;
  if (originalTimeout == null) delete process.env.JOB_DISCOVERY_APIFY_TIMEOUT_MS; else process.env.JOB_DISCOVERY_APIFY_TIMEOUT_MS = originalTimeout;
});

test("K — malformed Apify rows are ignored without failing the run", { concurrency: false }, async () => {
  globalThis.fetch = async (url) => String(url).includes("/datasets/")
    ? Response.json([{ title: "Missing company and URL" }, null, "bad"])
    : Response.json({ data: { id: "run-1", status: "SUCCEEDED", defaultDatasetId: "dataset-1", usageTotalUsd: 0.01 } });
  const result = await new ApifyJobProvider(actor).search(input);
  assert.equal(result.status, "no_results"); assert.equal(result.rawCount, 3); assert.equal(result.normalizedCount, 0);
});

test("M — failed Actor run becomes an isolated provider error", { concurrency: false }, async () => {
  globalThis.fetch = async () => Response.json({ data: { id: "run-failed", status: "FAILED" } });
  const result = await new ApifyJobProvider(actor).search(input);
  assert.equal(result.status, "provider_error"); assert.equal(result.errorCode, "APIFY_ACTOR_FAILED");
});

test("L — non-terminal Actor run respects the bounded polling timeout", { concurrency: false }, async () => {
  process.env.JOB_DISCOVERY_APIFY_TIMEOUT_MS = "50";
  globalThis.fetch = async () => Response.json({ data: { id: "run-timeout", status: "RUNNING" } });
  const started = Date.now();
  const result = await new ApifyJobProvider(actor).search(input);
  assert.equal(result.status, "provider_error"); assert.equal(result.errorCode, "APIFY_ACTOR_TIMEOUT"); assert.ok(Date.now() - started < 1000);
});

test("Apify public job payload normalizes and credentials stay in Authorization", { concurrency: false }, async () => {
  delete process.env.JOB_DISCOVERY_APIFY_TIMEOUT_MS;
  const requests = [];
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), headers: init?.headers });
    if (String(url).includes("/datasets/")) return Response.json([{ id: "li-1", title: "AI Solutions Consultant", companyName: "Example GmbH", location: "Berlin, Germany", jobUrl: "https://www.linkedin.com/jobs/view/123", descriptionText: "A complete public vacancy description with enterprise AI discovery, workshops, automation design, stakeholder delivery and measurable business outcomes for customers." }]);
    return Response.json({ data: { id: "run-ok", status: "SUCCEEDED", defaultDatasetId: "dataset-ok", usageTotalUsd: 0.02 } });
  };
  const result = await new ApifyJobProvider(actor).search(input);
  assert.equal(result.status, "success"); assert.equal(result.jobs[0].company, "Example GmbH"); assert.equal(result.costUsd, 0.02);
  assert.ok(requests.every((request) => !request.url.includes("test-token"))); assert.ok(requests.every((request) => request.headers.Authorization === "Bearer test-token-never-logged"));
});
