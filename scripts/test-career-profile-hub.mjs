import assert from "node:assert/strict";
import { emptyKnowledge, importKnowledge, confirmFact, retractFact } from "../src/lib/applicationStudio/knowledge.mjs";
import { sectionKind } from "../src/lib/applicationStudio/contentEngine.mjs";

assert.equal(sectionKind("Contact details"), "header");
assert.equal(sectionKind("Professional Development"), "development");
assert.equal(sectionKind("Training & Courses"), "development");
assert.equal(sectionKind("Certifications"), "certifications");
assert.equal(sectionKind("Achievements"), "additional");
assert.equal(sectionKind("Portfolio"), "projects");

const cv = [
  "Jane Sample", "jane@example.org", "",
  "Professional Summary", "Logistics operations planner improving warehouse flow.", "",
  "Work Experience", "Warehouse Planner — Example Operations 2023-2025",
  "- Coordinated replenishment scheduling", "- Delivered 12 weekly reports", "",
  "Skills", "Power BI", "Warehouse Planning", "",
  "Education", "Bachelor of Management, Example University 2020", "",
  "Certifications", "Data Analytics Certificate, Example Provider 2024", "",
  "Projects", "Workforce Forecast Dashboard", "- Built a capacity forecast model", "",
  "Languages", "English — C1", "",
  "Training & Courses", "Power Automate fundamentals", "",
  "Achievements", "Improved report processing time",
].join("\n");

const first = importKnowledge(emptyKnowledge(), { text: cv, type: "cv", label: "sample.pdf" }, "2026-10-16T08:00:00Z");
assert.ok(first.claims.length >= 9);
assert.ok(["header", "summary", "experience", "skills", "education", "certifications", "projects", "languages", "development", "additional"].every(k => first.entities.some(e => e.kind === k)), "CV sections are placed in their own records");
assert.ok(first.claims.every(c => c.sourceType === "cv" && c.original && c.sourceId), "Every claim keeps its provenance");
const second = importKnowledge(first, { text: cv, type: "cv", label: "same.pdf" });
assert.deepEqual(second, first, "Repeated upload does not duplicate claims");

const amended = importKnowledge(first, { text: "Skills\nPower BI\nSQL", type: "cv", label: "v2.pdf" });
const originalClaims = new Set(first.claims.map(c => c.id));
assert.equal(amended.claims.filter(c => !originalClaims.has(c.id)).length, 1, "Import adds only previously missing facts");
const existing = amended.claims.find(c => c.original === "SQL");
const changed = confirmFact(amended, { entityId: existing.entityId, kind: "skills", text: "SQL (intermediate)", field: "skills" });
const replaced = retractFact(changed, existing.id);
assert.ok(replaced.claims.find(c => c.original === "SQL (intermediate)" && c.verification === "candidate-confirmed"));
assert.equal(replaced.claims.find(c => c.id === existing.id).retracted, true);
assert.ok(replaced.claims.filter(c => c.confirmed && !c.retracted).some(c => c.original.includes("Warehouse Planning")));
console.log("Career Profile Hub: import, section mapping, deduplication, correction and provenance passed.");
