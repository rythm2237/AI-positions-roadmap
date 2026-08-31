import fs from "node:fs";
import { spawnSync } from "node:child_process";

const client = fs.readFileSync("src/components/cv-analyzer/CVAnalyzerClient.tsx", "utf8");
const matchCard = fs.readFileSync("src/components/cv-analyzer/CareerMatchCard.tsx", "utf8");
const semantic = fs.readFileSync("src/lib/cvAnalyzer/semanticAnalysis.ts", "utf8");
const matching = fs.readFileSync("src/lib/cvAnalyzer/careerMatching.ts", "utf8");
const requirements = fs.readFileSync("src/lib/cvAnalyzer/careerRequirements.ts", "utf8");
const recruiterEvidence = fs.readFileSync("src/lib/cvAnalyzer/careerEvidence.ts", "utf8");
const projectEvidence = fs.readFileSync("src/lib/cvAnalyzer/projectEvidence.ts", "utf8");

for (const token of [
  "analyzeSemanticCV",
  "AVAILABLE_CAREERS",
  "initialTargetPosition",
  "CV freshness warning",
  "Update my recent experience",
  "analysis.alignmentMode",
  "CareerMatchCard",
  "No priority CV gap was detected",
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

for (const token of ["CAREER_MATCH_WEIGHTS", "roleRelevance", "professionalEvidence", "coreRequirements", "trajectory", "transferability", "scoreCeiling", "coreGaps", "supportingOpportunities", "directDurationBucket", "transferableDurationBucket", "resolveTargetCareer"]) {
  if (!matching.includes(token)) throw new Error(`Career matching contract is missing: ${token}`);
}

for (const token of ["CAPABILITIES", '"process-automation"', '"data-scientist"', '"data-analyst"', '"ai-automation-specialist"', "directCapabilities", "minimumCoreCoverage", "catalog-derived"]) {
  if (!requirements.includes(token)) throw new Error(`Career requirement contract is missing: ${token}`);
}

for (const token of ["employed_role", "independent_role", "implemented_project", "durationBucket", "recentImplementationCount", "buildRecruiterEvidence", "EXPERIENCE_DATE_RANGE", "likelyExperienceHeader"]) {
  if (!recruiterEvidence.includes(token)) throw new Error(`Recruiter evidence contract is missing: ${token}`);
}

for (const token of ["Role relevance", "Professional evidence", "Core requirements", "Current trajectory", "Transferability", "Direct Career evidence", "Core evidence gaps", "Additional evidence opportunities", "No material core-evidence limitation", "Why this Career ranks here", "not hiring probability"]) {
  if (!matchCard.includes(token)) throw new Error(`Career match explanation UI is missing: ${token}`);
}

for (const token of ["named_product_evidence", "implementation_evidence", "case_study_evidence", "explicit_project_section"]) {
  if (!projectEvidence.includes(token)) throw new Error(`Project evidence contract is missing: ${token}`);
}

const durationRegression = spawnSync(process.execPath, ["--experimental-strip-types", "scripts/test-cv-experience-duration-regression.mjs"], { encoding: "utf8" });
if (durationRegression.status !== 0) {
  throw new Error(`CV experience-duration regression failed:\n${durationRegression.stdout}\n${durationRegression.stderr}`);
}
process.stdout.write(durationRegression.stdout);

console.log("CV Analyzer canonical semantic architecture verified: transparent scoring, project evidence, catalog-derived matching, explainability and discovery/targeted modes.");
