import assert from "node:assert/strict";
import { buildStudioProfileDraft } from "../src/lib/applicationStudio/profileDraft.ts";
import { sourceMap, validate, fetchPublic } from "../src/lib/applicationStudio/validation.mjs";

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
