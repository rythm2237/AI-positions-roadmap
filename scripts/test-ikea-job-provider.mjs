import assert from "node:assert/strict";
import test from "node:test";
import { IkeaProvider, parseIkeaVacancies } from "../src/lib/job-agent/providers/ikea.ts";

function listing(id, title, location, next = false) {
  return `<a href="/en/job/city/title/24107/${id}" data-job-id="${id}" class="job-list__anchor">
    <span class="job-list__title">${title}</span>
    <span class="job-list__location">${location}</span>
    <span class="job-list__categories">Logistics &amp; Supply Chain</span>
    <span class="job-list__job-type">Full time</span></a>
    ${next ? '<a class="next" href="/next">Next</a>' : ""}`;
}

test("IKEA extracts official vacancy identity and decodes public listing fields", () => {
  const [job] = parseIkeaVacancies(listing("123", "Employ&#xE9; logistique", "Paris, France"));
  assert.equal(job.id, "123");
  assert.equal(job.title, "Employé logistique");
  assert.equal(job.department, "Logistics & Supply Chain");
  assert.equal(new URL(job.url).hostname, "jobs.ikea.com");
});

test("IKEA follows bounded public pagination, scopes countries, and shares listing requests", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async (url) => {
    assert.equal(new URL(url).hostname, "jobs.ikea.com");
    assert.match(new URL(url).pathname, /^\/en\/location\//);
    return new Response(url.endsWith("/1")
      ? listing("123", "Fulfilment Operations", "Budapest, Hungary", true)
      : listing("456", "Warehouse Operator", "Budapest, Hungary") + listing("789", "Warehouse Operator", "Paris, France"));
  });
  const provider = new IkeaProvider();
  const search = { country: "HU", query: "warehouse", limit: 10, correlationId: "test" };
  const [first, second] = await Promise.all([provider.search(search), provider.search(search)]);
  assert.deepEqual(first.jobs.map((job) => job.externalId), ["456", "123"]);
  assert.equal(first.jobs[0].descriptionComplete, false);
  assert.deepEqual(first.jobs[0].requiredLanguages, []);
  assert.equal(first.jobs[0].sources[0].provider, "Direct:IKEA");
  assert.equal(first.requestCount, 2);
  assert.equal(second.requestCount, 0);
  assert.equal(fetch.mock.callCount(), 2);
});

test("IKEA distinguishes rate limits and markup changes from zero vacancies", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response("", { status: 429 }));
  const input = { country: "France", query: "logistique", limit: 10, correlationId: "test" };
  assert.equal((await new IkeaProvider().search(input)).status, "rate_limit");
  fetch.mock.mockImplementation(async () => new Response("<html>Unexpected structure</html>"));
  assert.equal((await new IkeaProvider().search(input)).errorCode, "IKEA_LISTING_FORMAT_UNRECOGNIZED");
});

import { SmartRecruitersProvider, smartRecruitersEmployers } from "../src/lib/job-agent/providers/smartRecruiters.ts";
import { canonicalizeJobUrl } from "../src/lib/job-agent/normalization.ts";

test("SmartRecruiters limits discovery to the employer's public country-specific postings", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async (input) => {
    const url = new URL(input);
    assert.equal(url.hostname, "api.smartrecruiters.com");
    assert.equal(url.searchParams.get("country"), "de");
    assert.equal(url.searchParams.get("destination"), "PUBLIC");
    const sample = { id: "101", name: "Warehouse Automation Specialist", visibility: "PUBLIC", location: { country: "de" } };
    return Response.json({ content: [{...sample,id:"100",visibility:"INTERNAL"},sample], totalFound: 2 });
  });
  const r = await new SmartRecruitersProvider(smartRecruitersEmployers[0]).search({country:"Germany",query:"automation",limit:10,correlationId:"test"});
  assert.equal(r.status,"success");
  assert.deepEqual(r.jobs.map((job) => job.externalId),["101"]);
  assert.equal(r.jobs[0].company,"BEUMER Group");
  assert.equal(fetch.mock.callCount(),1);
  assert.equal(canonicalizeJobUrl("https://jobs.smartrecruiters.com/BEUMERGroup1/101-job-title?source=external"), r.jobs[0].sourceUrl);
});
