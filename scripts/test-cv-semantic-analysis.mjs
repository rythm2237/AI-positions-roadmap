import assert from "node:assert/strict";
import { analyzeSemanticCV } from "../src/lib/cvAnalyzer/semanticAnalysis.ts";

const careers = [
  {
    slug: "ai-automation-specialist",
    title: "AI Automation Specialist",
    domain: "AI Automation",
    description: "Design and implement AI-powered automations that connect models, APIs, data, workflow platforms, and business operations.",
  },
  {
    slug: "data-analyst",
    title: "Data Analyst",
    domain: "AI Data & Analytics",
    description: "Turn business questions into reliable datasets, analysis, dashboards, experiments, and decision-ready insights.",
  },
  {
    slug: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    domain: "AI Infrastructure & Security",
    description: "Monitor, investigate, contain, and reduce cyber risk through security operations and incident response.",
  },
];

const profile = {
  fullName: "",
  headline: "",
  targetPosition: "",
  openToSuggestions: true,
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

const uploadedCV = `
Yaser Example
Bratislava, Slovakia | yaser@example.com | +421 900 123 456 | linkedin.com/in/yaser-example

PROFESSIONAL SUMMARY
Operations and automation specialist combining process analysis, Power BI and Power Automate to improve recurring business workflows. Built reporting and workflow improvements used across six operational areas and reduced manual preparation time by 4 hours per week.

WORK EXPERIENCE
Fulfilment Operations Flow Planner | Retail Company | 2025 - Present
- Automated weekly reporting with Power BI and Power Automate, reducing manual preparation by 4 hours per week.
- Analyzed operational KPIs across 6 areas and designed dashboards used by team leaders for daily decisions.
- Improved replenishment planning and process mapping, reducing recurring manual checks by 25%.
- Coordinated stakeholders and documented workflow requirements for automation initiatives.

Logistics Specialist | Retail Company | 2022 - 2025
- Managed operational flow and introduced process improvements across high-volume warehouse activities.

SKILLS
Power BI, Power Automate, Excel, data analysis, dashboard, process mapping, stakeholder management, API, workflow automation

PROJECTS
Automated KPI reporting workflow - Power BI and Power Automate. Reduced preparation time by 4 hours/week and standardized reporting for 6 operational areas.

EDUCATION
BSc Business Management | 2018 - 2022

CERTIFICATIONS
Microsoft Azure AI Fundamentals
`;

const analysis = analyzeSemanticCV(profile, uploadedCV, careers);
const scores = Object.fromEntries(analysis.rows.map((row) => [row.label, row.score]));

assert.ok(scores["Professional summary"] > 50, "Uploaded summary must be detected without wizard fields.");
assert.ok(scores["Skills relevance"] > 50, "Uploaded skills must be detected without wizard fields.");
assert.ok(scores["CV structure"] >= 70, "Explicit CV headings should produce a strong structure baseline.");
assert.ok(scores["Experience quality"] > 55, "Action + chronology + metrics should improve experience score.");
assert.ok(scores["Achievement evidence"] > 55, "Quantified outcomes should improve evidence score.");
assert.ok(analysis.overall > 50 && analysis.overall <= 100, "Overall semantic baseline should be bounded and non-trivial.");
assert.equal(analysis.matches[0]?.title, "AI Automation Specialist", "Role ranking should use CV evidence against real career definitions.");
assert.ok(analysis.matches[0].match > analysis.matches.at(-1).match, "Career evidence alignment must differentiate roles.");
assert.match(analysis.matches[0].weeks, /weeks at 5h\/week/, "Gap-closing estimate must be tied to available learning time.");

const sparse = analyzeSemanticCV(profile, "Name\nemail@example.com\nI am hardworking and motivated.", careers);
assert.ok(sparse.overall < analysis.overall, "Sparse unstructured CVs must score below evidence-rich CVs.");

console.log("CV semantic analysis tests passed: section detection, evidence scoring, live-role ranking, and gap estimates.");
