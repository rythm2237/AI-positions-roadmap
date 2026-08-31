import assert from "node:assert/strict";
import { AVAILABLE_CAREERS } from "../src/data/careerCatalog.ts";
import { analyzeSemanticCV } from "../src/lib/cvAnalyzer/semanticAnalysis.ts";

const profile = {
  fullName: "",
  headline: "",
  targetPosition: "Intelligent Automation Engineer",
  openToSuggestions: false,
  summary: "",
  experience: "",
  education: "",
  skills: "",
  projects: "",
  certifications: "",
  languages: "",
  weeklyHours: "5",
  linkedinUrl: "",
};

const cv = `
PROFESSIONAL SUMMARY
Operations and data professional transitioning into AI automation. Hands-on experience designing workflow automations with Microsoft Power Automate, n8n, REST APIs and OpenAI-based components, supported by 3+ years of analytics and process-improvement experience.

PROFESSIONAL EXPERIENCE
AI Automation Project Specialist - Independent Portfolio
January 2026 - August 2026
Designed and implemented 6 workflow automations using Power Automate and n8n for document intake, approval routing, notifications and structured data capture.
Built API-driven prototypes that transformed unstructured text into structured JSON and routed results to downstream workflows.
Added validation, retry handling, approval gates and audit-friendly logging to reduce silent automation failures.

Operations & Data Analyst - Northstar Retail Logistics
March 2023 - December 2025
Built and maintained Power BI dashboards covering inventory flow, productivity, service level and operational exceptions.
Automated recurring reporting tasks with Excel, Power Query and Power Automate, reducing manual preparation time by approximately 12 hours per week.
Supported user acceptance testing and post-release validation for internal process and reporting changes.
Used SQL extracts and Excel models to investigate stock discrepancies and recurring process failures.

SKILLS
Power Automate, n8n, REST APIs, JSON, basic Python, Power BI, SQL, process mapping, UAT
`;

const analysis = analyzeSemanticCV(profile, cv, AVAILABLE_CAREERS);
const match = analysis.matches[0];
assert.equal(match.careerSlug, "intelligent-automation-engineer");
assert.equal(match.professionalEvidence.directDurationBucket, "6–12 months", "Recent direct automation-engineering evidence must not inherit the full analytics-role duration.");
assert.equal(match.confidence, "medium", "Recent direct Intelligent Automation evidence should remain medium confidence until established over time.");
assert.ok(!match.evidenceSummary.strongestEvidence.some((item) => /software engineering \(2–4 years\)/i.test(item)), "Generic UAT/testing must not create multi-year software-engineering evidence.");
assert.ok(match.dimensions.coreRequirements >= 55, "Relevant automation and integration evidence should preserve material Intelligent Automation core coverage.");

console.log("Intelligent Automation evidence calibration: PASS", {
  score: match.score,
  confidence: match.confidence,
  directDuration: match.professionalEvidence.directDurationBucket,
  dimensions: match.dimensions,
  strongestEvidence: match.evidenceSummary.strongestEvidence,
});
