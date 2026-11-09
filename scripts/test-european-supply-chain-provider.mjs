import assert from "node:assert/strict";
import test from "node:test";
import { EuropeanSupplyChainProvider, parseSuccessFactorsListings } from "../src/lib/job-agent/providers/europeanSupplyChain.ts";

const search = { country: "Germany", query: "Logistik", limit: 10, correlationId: "test" };
const row = (id, location) => `<tr class="data-row"><td><a href="/job/a/${id}/" class="jobTitle-link">Logistik &amp; Planung</a></td><td headers="hdrLocation"><span class="jobLocation">${location}</span></td></tr>`;

test("SuccessFactors extracts official listing identity and decodes location/title", () => {
  const rows = parseSuccessFactorsListings(row(123, "Berlin, DE") + '<a href="/job/listing/4/">Navigation</a>', "https://jobs.dsv.com");
  assert.deepEqual(rows, [{ id: "123", title: "Logistik & Planung", location: "Berlin, DE", url: "https://jobs.dsv.com/job/a/123/" }]);
});

test("Supply Chain portfolio filters foreign vacancies and preserves per-employer provenance", async (t) => {
  t.mock.method(globalThis, "fetch", async (input) => {
    const url = new URL(input);
    if (url.hostname.endsWith(".myworkdayjobs.com")) return Response.json({ jobPostings: [] });
    if (url.hostname === "www.knapp.com") return new Response('<h3 class="country-name">Germany</h3>');
    if (["jobs.dsv.com", "careers.dachser.com"].includes(url.hostname)) return new Response(row(123, "Berlin, DE") + row(456, "Lyon, FR"));
    if (url.hostname === "api.smartrecruiters.com") return Response.json({ content: [], totalFound: 0 });
    if (url.hostname === "boards-api.greenhouse.io") return Response.json({ jobs: [] });
    if (url.hostname === "api.lever.co") return Response.json([]);
    throw new Error(`Unexpected request: ${url.hostname}`);
  });
  const outcome = await new EuropeanSupplyChainProvider().search(search);
  assert.equal(outcome.status, "success");
  assert.equal(outcome.rateLimitState.attemptedSources, 16);
  assert.deepEqual(outcome.jobs.map((job) => job.source), ["Direct:DSV", "Direct:DACHSER"]);
  assert.ok(outcome.jobs.every((job) => job.country === "Germany" && job.sources[0].provider === job.source));
  assert.ok(outcome.rateLimitState.employers.some((employer) => employer.provider === "Direct:JYSK"));
});

test("One source outage is visible without suppressing results from healthy employers", async (t) => {
  t.mock.method(globalThis, "fetch", async (input) => {
    const { hostname } = new URL(input);
    if (hostname.endsWith(".myworkdayjobs.com")) return Response.json({ jobPostings: [] });
    if (hostname === "www.knapp.com") return new Response('<h3 class="country-name">Germany</h3>');
    if (hostname === "jobs.dsv.com") return new Response(row(123, "Berlin, DE"));
    if (hostname === "careers.dachser.com") return new Response("Unavailable", { status: 503 });
    if (hostname === "api.smartrecruiters.com") return Response.json({ content: [], totalFound: 0 });
    return Response.json(hostname === "api.lever.co" ? [] : { jobs: [] });
  });
  const outcome = await new EuropeanSupplyChainProvider().search(search);
  assert.equal(outcome.status, "success");
  assert.equal(outcome.rateLimitState.failedSources, 1);
  assert.equal(outcome.rateLimitState.employers.find((employer) => employer.provider === "Direct:DACHSER").errorCode, "HTTP_503");
});

test("Workday searches public boards and admits only vacancies with explicit country evidence", async (t) => {
  t.mock.method(globalThis, "fetch", async (input, options) => {
    const url = new URL(input);
    if (url.hostname === "kiongroup.wd3.myworkdayjobs.com") {
      assert.equal(options.method, "POST");
      assert.equal(JSON.parse(options.body).searchText, "Logistik");
      return Response.json({ jobPostings: [
        { title: "Material Flow Planner", externalPath: "/job/Hamburg/Planner_JR-1", locationsText: "Hamburg, Germany", bulletFields: ["JR-1"] },
        { title: "Planner", externalPath: "/job/Paris/Planner_JR-2", locationsText: "Paris, France" },
        { title: "Invalid link", externalPath: "//example.test/job/JR-3", locationsText: "Germany" },
      ] });
    }
    if (url.hostname.endsWith(".myworkdayjobs.com")) return Response.json({ jobPostings: [] });
    if (url.hostname === "www.knapp.com") return new Response('<h3 class="country-name">Germany</h3>');
    if (["jobs.dsv.com", "careers.dachser.com"].includes(url.hostname)) return new Response("No jobs found");
    if (url.hostname === "api.smartrecruiters.com") return Response.json({ content: [], totalFound: 0 });
    return Response.json(url.hostname === "api.lever.co" ? [] : { jobs: [] });
  });
  const result = await new EuropeanSupplyChainProvider().search(search);
  assert.deepEqual(result.jobs.map(({ source, externalId, applicationUrl }) => [source, externalId, applicationUrl]), [
    ["Direct:KION Group", "JR-1", "https://kiongroup.wd3.myworkdayjobs.com/en-US/KIONGroup/job/Hamburg/Planner_JR-1"],
  ]);
});
