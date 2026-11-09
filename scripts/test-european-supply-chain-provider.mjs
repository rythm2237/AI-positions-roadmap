import assert from "node:assert/strict";
import test from "node:test";
import { EuropeanSupplyChainProvider, PublicSupplyChainBoard, publicSupplyChainBoards, parseSuccessFactorsListings } from "../src/lib/job-agent/providers/europeanSupplyChain.ts";

import { parseCareerPageLinks, parsePhenomListings, supplyChainLinkBoards } from "../src/lib/job-agent/providers/supplyChainCareerPages.ts";
const originalBoardNames = new Set(["DSV", "DACHSER", "cargo-partner", "OMP", "KNAPP", "Maersk", "KION Group", "Vanderlande"]);
const originalPublicBoards = () => publicSupplyChainBoards.filter((board) => originalBoardNames.has(board.company)).map((board) => new PublicSupplyChainBoard(board));

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
  const outcome = await new EuropeanSupplyChainProvider(originalPublicBoards()).search(search);
  assert.equal(outcome.status, "success");
  assert.equal(outcome.rateLimitState.attemptedSources, 8);
  assert.deepEqual(outcome.jobs.map((job) => job.source), ["Direct:DSV", "Direct:DACHSER"]);
  assert.ok(outcome.jobs.every((job) => job.country === "Germany" && job.sources[0].provider === job.source));
  assert.ok(outcome.rateLimitState.employers.some((employer) => employer.provider === "Direct:OMP"));
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
  const outcome = await new EuropeanSupplyChainProvider(originalPublicBoards()).search(search);
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
  const result = await new EuropeanSupplyChainProvider(originalPublicBoards()).search(search);
  assert.deepEqual(result.jobs.map(({ source, externalId, applicationUrl }) => [source, externalId, applicationUrl]), [
    ["Direct:KION Group", "JR-1", "https://kiongroup.wd3.myworkdayjobs.com/en-US/KIONGroup/job/Hamburg/Planner_JR-1"],
  ]);
});

test("Official career links reject cross-host lookalikes and keep employer-specific IDs", () => {
  const source = supplyChainLinkBoards.find((board) => board.company === "Picnic");
  const path = "/en/vacancies/JT8TU1ZC/engineering/logistics-engineer/amsterdam/north-holland/netherlands";
  const result = parseCareerPageLinks(`<a href="https://external.example${path}"><h4>External job</h4></a><a href="${path}"><h4>Logistics Engineer</h4></a>`, source);
  assert.deepEqual(result, [{ id: "JT8TU1ZC", title: "Logistics Engineer", location: "netherlands", url: `https://jobs.picnic.app${path}` }]);
});

test("Phenom extracts public records from embedded JSON without running page JavaScript", () => {
  const state = JSON.stringify({ eagerLoadRefineSearch: { data: { jobs: [
    { jobSeqNo: "KUNAGLOBAL123EXTERNAL", title: 'Logistics {Analyst} "warehouse"', country: "Germany", cityStateCountry: "Hamburg, Germany" },
    { jobSeqNo: "../other", title: "Unsafe route", country: "Germany" },
  ] } } });
  const result = parsePhenomListings(`<script>phApp.ddo = ${state}; initialize()</script>`, "https://jobs.kuehne-nagel.com");
  assert.equal(result.length, 1);
  assert.equal(result[0].title, 'Logistics {Analyst} "warehouse"');
  assert.equal(result[0].url, "https://jobs.kuehne-nagel.com/global/en/job/KUNAGLOBAL123EXTERNAL");
});

test("The new regional sources do not run in other countries", () => {
  const edeka = new PublicSupplyChainBoard(publicSupplyChainBoards.find((board) => board.company === "EDEKA"));
  assert.equal(edeka.countrySupport("DE"), true);
  assert.equal(edeka.countrySupport("France"), false);
});

test("Public vacancy API excludes internal postings and keeps the official detail URL", async (t) => {
  t.mock.method(globalThis, "fetch", async (input) => {
    const url = new URL(input);
    assert.equal(url.pathname, "/api/vacancy/");
    assert.equal(url.searchParams.get("search"), "warehouse");
    return Response.json({ vacancies: [
      { id: 40, title: "Warehouse Planner", slug: "warehouse-planner", country: "NLD" },
      { id: 41, title: "Internal Warehouse Planner", country: "NLD", internal_vacancy: true },
      { id: 42, title: "Warehouse Planner", country: "BEL" },
    ] });
  });
  const board = new PublicSupplyChainBoard(publicSupplyChainBoards.find(({ company }) => company === "Ahold Delhaize"));
  const result = await board.search({ ...search, country: "Netherlands", query: "warehouse" });
  assert.deepEqual(result.jobs.map((job) => job.applicationUrl), ["https://careers.aholddelhaize.com/vacancy/40/warehouse-planner"]);
});

test("Carrefour sitemap admits only same-origin listings with French vacancy evidence", async (t) => {
  const origin = "https://recrute.carrefour.fr";
  t.mock.method(globalThis, "fetch", async (input) => {
    const url = new URL(input);
    assert.equal(url.origin, origin);
    if (url.pathname.endsWith(".xml")) return new Response(`<urlset><loc>${origin}/offres/10-entrepots/</loc><loc>${origin}/offres/11-entrepots/</loc><loc>https://example.test/offres/12-entrepots/</loc></urlset>`);
    const addressCountry = url.pathname.includes("/10-") ? "FR" : "BE";
    return new Response(`<script type="application/ld+json">${JSON.stringify({ "@type": "JobPosting", title: "Responsable Entrepôts", jobLocation: { address: { addressCountry } } })}</script>`);
  });
  const board = new PublicSupplyChainBoard(publicSupplyChainBoards.find(({ company }) => company === "Carrefour"));
  const input = { ...search, country: "France", query: "entrepots" };
  const result = await board.search(input);
  assert.equal(result.requestCount, 3);
  assert.deepEqual(result.jobs.map((job) => job.applicationUrl), [`${origin}/offres/10-entrepots/`]);
  assert.equal((await board.search(input)).requestCount, 0);
});
