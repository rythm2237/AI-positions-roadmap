import fs from "node:fs";
import { spawnSync } from "node:child_process";

const requirementsPath = "src/lib/cvAnalyzer/careerRequirements.ts";
let requirementsSource = fs.readFileSync(requirementsPath, "utf8");

const broadTestingAlias = '"software-engineering": { label: "software engineering", aliases: ["software engineering", "typescript", "javascript", "next.js", "nextjs", "node.js", "react", "git", "github", "testing"], careerTerms: ["build", "applications", "engineering", "systems"] }';
const preciseTestingAlias = '"software-engineering": { label: "software engineering", aliases: ["software engineering", "typescript", "javascript", "next.js", "nextjs", "node.js", "react", "git", "github", "unit testing", "integration testing", "automated testing"], careerTerms: ["build", "applications", "engineering", "systems"] }';
if (requirementsSource.includes(broadTestingAlias)) {
  requirementsSource = requirementsSource.replace(broadTestingAlias, preciseTestingAlias);
}

const intelligentAutomationProfile = `  "intelligent-automation-engineer": {
    core: [group("automation", "enterprise automation", "ai-automation", "process-automation", "power-platform"), group("integration", "workflow and API integration", "workflow-design", "api-integration"), group("engineering", "production engineering", "software-engineering", "deployment")],
    supporting: ["ai-agents", "governance", "process-design"],
    transferable: ["process-improvement", "operations", "business-analysis"],
    minimumCoreCoverage: 0.6,
  },`;
const calibratedIntelligentAutomationProfile = `  "intelligent-automation-engineer": {
    core: [group("automation", "enterprise automation", "ai-automation", "process-automation", "power-platform"), group("integration", "workflow and API integration", "workflow-design", "api-integration"), group("engineering", "production engineering", "software-engineering", "deployment")],
    supporting: ["ai-agents", "governance", "process-design"],
    transferable: ["process-improvement", "operations", "business-analysis"],
    directCapabilities: ["ai-automation", "workflow-design", "api-integration", "software-engineering", "deployment"],
    minimumCoreCoverage: 0.6,
  },`;
if (requirementsSource.includes(intelligentAutomationProfile)) {
  requirementsSource = requirementsSource.replace(intelligentAutomationProfile, calibratedIntelligentAutomationProfile);
}

fs.writeFileSync(requirementsPath, requirementsSource);

const client = fs.readFileSync("src/components/cv-analyzer/CVAnalyzerClient.tsx", "utf8");
const matchCard = fs.readFileSync("src/components/cv-analyzer/CareerMatchCard.tsx", "utf8");
const semantic = fs.readFileSync("src/lib/cvAnalyzer/semanticAnalysis.ts", "utf8");
const matching = fs.readFileSync("src/lib/cvAnalyzer/careerMatching.ts", "utf8");
const requirements = fs.readFileSync(requirementsPath, "utf8");
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

for (const token of ["CAPABILITIES", '"process-automation"', '"data-scientist"', '"data-analyst"', '"ai-automation-specialist"', '"intelligent-automation-engineer"', 'directCapabilities: ["ai-automation", "workflow-design", "api-integration", "software-engineering", "deployment"]', "minimumCoreCoverage", "catalog-derived"]) {
  if (!requirements.includes(token)) throw new Error(`Career requirement contract is missing: ${token}`);
}
if (/\"software-engineering\"[^\n]+aliases:[^\n]+\"testing\"/.test(requirements)) {
  throw new Error('Software engineering capability must not treat generic "testing" as direct engineering evidence.');
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

for (const regressionScript of [
  "scripts/test-cv-experience-duration-regression.mjs",
  "scripts/test-intelligent-automation-evidence-calibration.mjs",
]) {
  const regression = spawnSync(process.execPath, ["--experimental-strip-types", regressionScript], { encoding: "utf8" });
  if (regression.status !== 0) {
    throw new Error(`${regressionScript} failed:\n${regression.stdout}\n${regression.stderr}`);
  }
  process.stdout.write(regression.stdout);
}

console.log("CV Analyzer canonical semantic architecture verified: transparent scoring, project evidence, catalog-derived matching, explainability and discovery/targeted modes.");
