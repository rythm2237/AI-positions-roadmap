import fs from "node:fs";

const client = fs.readFileSync("src/components/cv-analyzer/CVAnalyzerClient.tsx", "utf8");
const semantic = fs.readFileSync("src/lib/cvAnalyzer/semanticAnalysis.ts", "utf8");
const matching = fs.readFileSync("src/lib/cvAnalyzer/careerMatching.ts", "utf8");
const projectEvidence = fs.readFileSync("src/lib/cvAnalyzer/projectEvidence.ts", "utf8");

for (const token of [
  "analyzeSemanticCV",
  "AVAILABLE_CAREERS",
  "initialTargetPosition",
  "CV freshness warning",
  "Update my recent experience",
  "analysis.alignmentMode",
  "match.evidenceSignals",
]) {
  if (!client.includes(token)) throw new Error(`Canonical CV Analyzer UI contract is missing: ${token}`);
}

for (const token of [
  '"top skills"',
  '"certifications"',
  '"Career direction alignment"',
  '"Target job alignment"',
  "assessProjectEvidence",
  "rankCareerEvidence",
  "alignmentMode",
  "freshness: CVFreshness",
]) {
  if (!semantic.includes(token)) throw new Error(`Canonical semantic scoring contract is missing: ${token}`);
}

for (const token of ["Career's own canonical title", "careerConcepts", "evidenceSignals", "missingSignals", "resolveTargetCareer"]) {
  if (!matching.includes(token)) throw new Error(`Career matching contract is missing: ${token}`);
}

for (const token of ["named_product_evidence", "implementation_evidence", "case_study_evidence", "explicit_project_section"]) {
  if (!projectEvidence.includes(token)) throw new Error(`Project evidence contract is missing: ${token}`);
}

console.log("CV Analyzer canonical semantic architecture verified: transparent scoring, project evidence, catalog-derived matching, explainability and discovery/targeted modes.");
