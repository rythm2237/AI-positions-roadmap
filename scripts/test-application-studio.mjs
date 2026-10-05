import assert from "node:assert/strict";
import { buildStudioProfileDraft } from "../src/lib/applicationStudio/profileDraft.ts";
import { sourceMap, validate, fetchPublic, extractJobPosting } from "../src/lib/applicationStudio/validation.mjs";

const course = { id: "course", title: "SQL foundations", provider: "Course provider" };
const career = { journeyStages: [{ resources: [course] }], roadmap: [], projects: [{ id: "pass", title: "Reviewed project" }, { id: "fail", title: "Failed project" }, { id: "fallback", title: "Fallback project" }, { id: "empty", title: "No artifact" }] };
const profile = { name: "Example Candidate", skills: ["SQL"], certificates: ["Self-declared certificate"] };
const projects = { reviews: {
  pass: { reviewer: "ai", passed: true, overallScore: 80 },
  fail: { reviewer: "ai", passed: false, overallScore: 50 },
  fallback: { reviewer: "fallback", passed: true, overallScore: 80 },
  empty: { reviewer: "ai", passed: true, overallScore: 80 },
}, submissions: {
  pass: { summary: "Built a documented SQL analysis.", artifactUrl: "https://example.com/project" },
  fail: { summary: "Unqualified work", artifactUrl: "https://example.com/fail" },
  fallback: { summary: "Fallback work", artifactUrl: "https://example.com/fallback" },
  empty: { summary: "Uninspectable work" },
} };
const draft = buildStudioProfileDraft(profile, career, { completedResources: ["course", "invented"] }, projects);
assert.match(draft, /SQL foundations/);
assert.match(draft, /not employment experience or a verified certification/);
assert.match(draft, /self-reported; not independently verified/);
assert.match(draft, /Built a documented SQL analysis/);
assert.doesNotMatch(draft, /Failed project|Fallback project|No artifact|invented/);
assert.doesNotMatch(buildStudioProfileDraft(profile, career, { completedResources: [] }), /SQL foundations/);
const sources = sourceMap("Candidate\nUses SQL");
const analysis = validate("analysis", { job: {}, matrix: [{ requirement: "SAP PP", priority: "Mandatory", category: "tools", level: "Strong Match", evidenceIds: ["JOB1"], vacancyQuote:"SAP PP required" }] }, {vacancy:"SAP PP required"}, sources);
assert.equal(analysis.matrix[0].level, "Unknown");
assert.equal(analysis.score, 0);
assert.equal(analysis.gaps[0].type, "Critical Gap");
const changes = validate("changes", { changes: [{ sectionId: "skills", original: "Uses SQL", proposed: "Uses SQL and SAP PP; improved throughput 40%", evidenceIds: ["CV2"] }] }, { cv: [{ id: "skills", title: "Skills", text: "Uses SQL" }] }, sources);
assert.equal(changes.changes.length, 0);
await assert.rejects(fetchPublic("https://private.example", async () => [{ address: "127.0.0.1", family: 4 }]), /blocked/);
await assert.rejects(fetchPublic("https://linkedin.com/in/example"), /LinkedIn/);
const studioHtml = await (await import("node:fs/promises")).readFile(new URL("../public/application-studio/index.html", import.meta.url), "utf8");
const studioRoute = await (await import("node:fs/promises")).readFile(new URL("../src/app/api/application-studio/[action]/route.ts", import.meta.url), "utf8");
const studioHost = await (await import("node:fs/promises")).readFile(new URL("../src/components/career/jobs/ApplicationStudio.tsx", import.meta.url), "utf8");
assert.match(studioHtml, /Taylor Example/);
assert.match(studioHtml, /Example Supply Co\. \(fictional\)/);
assert.match(studioHtml, /NOT A REAL JOB POSTING/);
assert.doesNotMatch(studioHtml, /Open CV editor & test demo|Try the NEURA demo|Alex Example|Fulfilment Operations Flow Planner — IKEA/);
assert.match(studioHtml, /outdated practice sample that contained personal details was removed/);
assert.match(studioHtml, /function leaveSampleForRealProfile\(\).*j\.vacancy='';.*j\.job=\{\}.*j\.analysis=null/s);
assert.doesNotMatch(studioRoute, /test the demo/i);
assert.match(studioRoute, /requestId/);
assert.match(studioRoute, /const errorName = error instanceof Error \? error\.name/);
assert.match(studioRoute, /configured spend limit/);
assert.match(studioHost, /useState\(true\)/);
assert.match(studioHost, /createPortal/);
assert.match(studioHost, /fixed .*z-\[1000\]/);
assert.match(studioHost, /Exit full screen/);
assert.match(studioHost, /setOpen\(false\)/);
assert.match(studioHtml, /top:16px;bottom:auto/);
assert.match(studioHtml, /id="jobSalary"/);
assert.match(studioHtml, /id="validThrough"/);
assert.match(studioHtml, /id="jobCategory"/);
assert.match(studioHtml, /id="jobSkills"/);
assert.match(studioHtml, /id="jobQualifications"/);
const jobPosting = extractJobPosting(`<html><script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "https://schema.org/JobPosting",
  title: "Production Planner",
  hiringOrganization: { name: "Example Manufacturing Ltd" },
  jobLocationType: "TELECOMMUTE",
  jobLocation: { address: { addressLocality: "Berlin", addressCountry: { name: "Germany" } } },
  employmentType: ["FULL_TIME"],
  experienceRequirements: "Two years of planning experience",
  occupationalCategory: "Production Planning",
  industry: "Manufacturing",
  skills: ["ERP", "scheduling"],
  qualifications: "Bachelor's degree or equivalent experience",
  responsibilities: "Coordinate weekly production plans",
  workHours: "40 hours per week",
  baseSalary: { currency: "EUR", value: { minValue: 55000, maxValue: 62000, unitText: "YEAR" } },
  datePosted: "2026-09-01",
  validThrough: "2026-10-31",
  description: "<p>Plan daily production schedules and coordinate material availability across teams.</p>" + " Details.".repeat(12),
})}</script></html>`);
assert.equal(jobPosting.job.title, "Production Planner");
assert.equal(jobPosting.job.company, "Example Manufacturing Ltd");
assert.equal(jobPosting.job.location, "Berlin, Germany");
assert.equal(jobPosting.job.workplaceType, "Remote");
assert.equal(jobPosting.job.employmentType, "FULL_TIME");
assert.equal(jobPosting.job.salary, "55000–62000 EUR YEAR");
assert.equal(jobPosting.job.validThrough, "2026-10-31");
assert.equal(jobPosting.job.category, "Production Planning");
assert.equal(jobPosting.job.industry, "Manufacturing");
assert.equal(jobPosting.job.skills, "ERP, scheduling");
assert.equal(jobPosting.job.qualifications, "Bachelor's degree or equivalent experience");
assert.equal(jobPosting.job.responsibilities, "Coordinate weekly production plans");
assert.equal(jobPosting.job.workHours, "40 hours per week");
assert.match(jobPosting.description, /Plan daily production schedules/);
console.log("Application studio: provenance, course completion, project qualification, fabricated claims and private URL guards passed.");

// A high average must not mask explicit screening gaps or unknown eligibility.
const { recruiterAssessment, submittedCV } = await import('../src/lib/applicationStudio/recruiter.mjs');
const { designFor, splitSections, TEMPLATES } = await import('../src/lib/applicationStudio/design.mjs');
const row=(level,extra={})=>({requirement:'SQL',priority:'Mandatory',category:'technical',level,evidenceIds:level==='Unknown'?[]:['CV2'],evidence:['Uses SQL'],vacancyQuote:'SQL required',...extra});
const good=recruiterAssessment([row('Strong Match')]);
assert.equal(good.score,100);assert.equal(good.decision,'Strong shortlist evidence');assert.equal(good.probability,null);
const gate=recruiterAssessment([row('Strong Match'),row('Missing',{category:'eligibility',screeningGate:true,requirement:'Work authorization'})]);
assert.equal(gate.decision,'High screening risk');
assert.equal(recruiterAssessment([row('Unknown',{category:'languages',screeningGate:true})]).decision,'Eligibility needs verification');
assert.equal(recruiterAssessment([row('Transferable Skill')]).decision,'Mandatory evidence gaps');
assert.equal(recruiterAssessment([row('Partial Match')]).score,63);
assert.equal(submittedCV({candidate:'Master-only secret fact',cv:[{title:'Skills',text:'Uses SQL'}]}),'Skills\nUses SQL');
assert.throws(()=>validate('analysis',{job:{},matrix:[row('Strong Match',{vacancyQuote:'Invented requirement'})]},{vacancy:'SQL required'},sources),/traced/);
const arbitraryGate=validate('analysis',{job:{},matrix:[row('Strong Match',{screeningGate:true})]},{vacancy:'SQL required'},sources);
assert.equal(arbitraryGate.matrix[0].screeningGate,false);
assert.equal(TEMPLATES.length,8);assert.equal(new Set(TEMPLATES.map(t=>[t.layout,t.header,t.font,t.size,t.margin].join('|'))).size,8);
assert.equal(designFor('Modern',{accent:'url(javascript:x)',layout:'fake',size:100}).accent,'#344778');
assert.equal(designFor('Modern',{size:100}).size,11);
const content=[{title:'Header',text:'Candidate'},{title:'Experience',text:'Real work'},{title:'Skills',text:'SQL'},{title:'Custom',text:'User section'}];
const split=splitSections(content);assert.equal(split.side[0].text,'SQL');assert.deepEqual([...split.main,...split.side].map(s=>s.text).sort(),content.slice(1).map(s=>s.text).sort());
console.log('Structured recruiter rubric, explicit gates, unknowns, vacancy traceability, submitted CV sources, design sanitization and content preservation passed.');
