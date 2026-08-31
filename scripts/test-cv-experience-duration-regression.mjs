import assert from "node:assert/strict";
import { buildRecruiterEvidence, evidenceFor } from "../src/lib/cvAnalyzer/careerEvidence.ts";

const experience = `
AI Automation Project Specialist - Independent Portfolio
Budapest, Hungary | January 2026 - August 2026
Designed and implemented workflow automations using Power Automate and n8n.
Built API-driven prototypes and AI automation workflows.

Operations & Data Analyst - Northstar Retail Logistics
Budapest, Hungary | March 2023 - December 2025
Built and maintained Power BI dashboards covering inventory flow and operational exceptions.
Automated recurring reporting tasks with Excel, Power Query and Power Automate.
Used SQL extracts and Excel models to investigate stock discrepancies.

Operations Coordinator - Northstar Retail Logistics
Budapest, Hungary | June 2021 - February 2023
Coordinated daily warehouse activities and operational reporting.
`;

const profile = buildRecruiterEvidence({
  headline: "Operations and data professional transitioning into AI automation",
  summary: "Hands-on AI automation experience supported by several years of analytics and process-improvement work.",
  skills: "Power Automate, n8n, Power BI, DAX, Excel, SQL, workflow automation",
  experience,
  projects: "",
  education: "",
  certifications: "",
  source: experience,
  projectEvidence: {},
});

const aiAutomation = evidenceFor(profile, "ai-automation");
const businessIntelligence = evidenceFor(profile, "business-intelligence");
const sql = evidenceFor(profile, "sql");

assert.ok(aiAutomation, "AI automation evidence should be detected from the recent independent role.");
assert.ok(businessIntelligence, "Business intelligence evidence should be detected from the dated Data Analyst role.");
assert.ok(sql, "SQL evidence should be detected from the dated Data Analyst role.");

assert.equal(aiAutomation.durationBucket, "6–12 months", "Recent AI automation evidence must retain the January-August 2026 duration.");
assert.equal(businessIntelligence.durationBucket, "2–4 years", "Month-year Data Analyst evidence must retain the March 2023-December 2025 duration.");
assert.equal(sql.durationBucket, "2–4 years", "SQL evidence in the Data Analyst role must inherit that role's multi-year duration.");
assert.ok(aiAutomation.contexts.includes("independent_role"), "A role header immediately before its month-year date line must remain attached to the dated entry.");
assert.ok(businessIntelligence.contexts.includes("employed_role"), "The employed Data Analyst role must remain attached to its own date range.");

console.log("CV month-year experience duration regression: PASS", {
  aiAutomation: aiAutomation.durationBucket,
  businessIntelligence: businessIntelligence.durationBucket,
  sql: sql.durationBucket,
});
