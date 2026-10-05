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
const analysis = validate("analysis", { job: {}, matrix: [{ requirement: "SAP PP", priority: "Mandatory", category: "tools", level: "Strong Match", evidenceIds: ["JOB1"] }] }, {}, sources);
assert.equal(analysis.matrix[0].level, "Unknown");
assert.equal(analysis.score, 0);
assert.equal(analysis.gaps[0].type, "Critical Gap");
const changes = validate("changes", { changes: [{ sectionId: "skills", original: "Uses SQL", proposed: "Uses SQL and SAP PP; improved throughput 40%", evidenceIds: ["CV2"] }] }, { cv: [{ id: "skills", title: "Skills", text: "Uses SQL" }] }, sources);
assert.equal(changes.changes.length, 0);
await assert.rejects(fetchPublic("https://private.example", async () => [{ address: "127.0.0.1", family: 4 }]), /blocked/);
await assert.rejects(fetchPublic("https://linkedin.com/in/example"), /LinkedIn/);
console.log("Application studio: provenance, course completion, project qualification, fabricated claims and private URL guards passed.");
