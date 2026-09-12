import assert from "node:assert/strict";
import test from "node:test";
import { WorkdayProvider } from "../src/lib/job-agent/providers/workday.ts";

const originalFetch = globalThis.fetch;
test.after(() => { globalThis.fetch = originalFetch; });

test("Workday direct provider uses the approved public CXS endpoint and normalizes results", async () => {
  let request;
  globalThis.fetch = async (url, init) => {
    request = { url: String(url), init };
    return Response.json({ total: 1, jobPostings: [{ title: "AI Solutions Consultant", externalPath: "/en-US/External/job/Berlin/AI-Solutions-Consultant_R-42", locationsText: "Berlin, Germany", postedOn: "Posted Today", bulletFields: ["Full time"], jobReqId: "R-42", remoteType: "Hybrid" }] });
  };
  const provider = new WorkdayProvider({ tenant: "example", site: "External", host: "example.wd5.myworkdayjobs.com", company: "Example GmbH", priority: 12 });
  const result = await provider.search({ query: "AI Solutions Consultant", country: "Germany", location: "Berlin", limit: 10, correlationId: "workday-test" });
  assert.equal(result.status, "success"); assert.equal(result.jobs[0].externalId, "R-42"); assert.equal(result.jobs[0].company, "Example GmbH"); assert.equal(result.jobs[0].workplaceModel, "hybrid");
  assert.equal(request.url, "https://example.wd5.myworkdayjobs.com/wday/cxs/example/External/jobs"); assert.equal(request.init.method, "POST");
});

test("Workday direct provider isolates rate limits", async () => {
  globalThis.fetch = async () => new Response("", { status: 429 });
  const result = await new WorkdayProvider({ tenant: "example", site: "External", host: "example.wd5.myworkdayjobs.com", company: "Example GmbH", priority: 12 }).search({ query: "AI", country: "Germany", limit: 5, correlationId: "workday-limit" });
  assert.equal(result.status, "rate_limit"); assert.equal(result.errorCode, "WORKDAY_RATE_LIMIT");
});
