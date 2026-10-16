import assert from "node:assert/strict";
import { emptyKnowledge, importKnowledge, confirmFact, retractFact, updateEntityMetadata, moveKnowledgeFact, confirmFactBatch } from "../src/lib/applicationStudio/knowledge.mjs";
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

const metadata = updateEntityMetadata(replaced,{entityId:existing.entityId,metadata:{level:"intermediate",yearsExperience:2,category:"Database"}});
assert.equal(metadata.entities.find(e=>e.id===existing.entityId).metadata.level,"intermediate");
assert.equal(metadata.entities.find(e=>e.id===existing.entityId).metadata.yearsExperience,2);
assert.throws(()=>updateEntityMetadata(metadata,{entityId:existing.entityId,metadata:{level:"superhuman"}}),/Invalid skill level/);
assert.throws(()=>updateEntityMetadata(metadata,{entityId:existing.entityId,metadata:{yearsExperience:-4}}),/Invalid experience duration/);
const approved=confirmFactBatch(metadata,[
 {text:"Completed a training on production planning",kind:"development",label:"Production planning",field:"context"},
 {text:"Designed a stock movement dashboard",kind:"projects",label:"Movement dashboard",field:"context"}
]);
assert.ok(approved.claims.some(c=>c.original==="Designed a stock movement dashboard"));
const newProject=approved.claims.find(c=>c.original==="Designed a stock movement dashboard");
const moved=moveKnowledgeFact(approved,{claimId:newProject.id,kind:"portfolio",label:"Movement dashboard"});
assert.equal(moved.entities.find(e=>e.id===moved.claims.find(c=>c.id===newProject.id).entityId).kind,"portfolio");
const multi=importKnowledge(moved,{text:"Certifications\\nData Analytics Certificate, Example Provider 2024\\nGoogle Analytics Certification",type:"certification",label:"another-document.pdf"});
assert.equal(multi.claims.filter(c=>c.original==="Data Analytics Certificate").length,1);
const skillsOnce=importKnowledge(multi,{text:"Skills\\nPower BI\\nSQL",type:"cv",label:"new-cv.pdf"});
assert.equal(skillsOnce.claims.filter(c=>c.original==="Power BI").length,1);
assert.ok(["portfolio","preferences"].every(kind=>sectionKind(kind==="portfolio"?"Portfolio":"Career Preferences")===kind));
console.log("Career Profile Hub: import, categorisation, deduplication, corrections, structured metadata, batch approval, reassignment and provenance passed.");
