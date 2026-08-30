import assert from "node:assert/strict";
import { parseLinkedInProfileText } from "../src/lib/cvAnalyzer/linkedinProfile.ts";
import { analyzeSemanticCV } from "../src/lib/cvAnalyzer/semanticAnalysis.ts";

const careers = [
  { slug: "ai-automation-specialist", title: "AI Automation Specialist", domain: "AI Automation", description: "Design and implement dependable AI-powered automations that connect models, APIs, data, workflow platforms, and business operations." },
  { slug: "ai-workflow-architect", title: "AI Workflow Architect", domain: "AI Automation", description: "Design scalable, governed human-and-AI workflows across agents, models, tools, APIs, enterprise systems, decisions, state, handoffs, and operations." },
  { slug: "ai-solutions-consultant", title: "AI Solutions Consultant", domain: "Enterprise AI & Consulting", description: "Translate business needs into practical, trustworthy AI solution strategies through discovery, opportunity assessment, solution framing, value analysis, governance, delivery planning, and adoption." },
  { slug: "business-ai-consultant", title: "Business AI Consultant", domain: "Enterprise AI & Consulting", description: "Identify high-value AI opportunities and translate them into measurable business change, governed solutions, adoption plans, and value realization." },
  { slug: "enterprise-ai-consultant", title: "Enterprise AI Consultant", domain: "Enterprise AI & Consulting", description: "Advise large organizations on enterprise AI strategy, portfolio investment, architecture, governance, sourcing, operating models, adoption, and responsible scale." },
  { slug: "data-analyst", title: "Data Analyst", domain: "AI Data & Analytics", description: "Turn business questions into reliable datasets, analysis, dashboards, experiments, and decision-ready insights." },
  { slug: "cybersecurity-analyst", title: "Cybersecurity Analyst", domain: "AI Infrastructure & Security", description: "Monitor, investigate, contain, and reduce cyber risk through security operations and incident response." },
];

const emptyProfile = {
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

SKILLS
Power BI, Power Automate, Excel, data analysis, dashboard, process mapping, stakeholder management, API, workflow automation

PROJECTS
Automated KPI Reporting Platform. Built with Power BI and Power Automate; reduced preparation time by 4 hours/week and standardized reporting for 6 operational areas.

EDUCATION
BSc Business Management | 2018 - 2022

CERTIFICATIONS
Microsoft Azure AI Fundamentals
`;

const analysis = analyzeSemanticCV(emptyProfile, uploadedCV, careers);
const scores = Object.fromEntries(analysis.rows.map((row) => [row.label, row.score]));

assert.ok(scores["Professional summary"] > 50, "Uploaded summary must be detected without wizard fields.");
assert.ok(scores["Skills relevance"] > 50, "Uploaded skills must be detected without wizard fields.");
assert.ok(scores["CV structure"] >= 70, "Explicit CV headings should produce a strong structure baseline.");
assert.ok(scores["Experience quality"] > 55, "Action + chronology + metrics should improve experience score.");
assert.ok(scores["Achievement evidence"] > 55, "Quantified outcomes should improve evidence score.");
assert.ok(scores["ATS readability"] < 100, "Career OS must not inflate readability to 100 by default.");
assert.ok(analysis.rows.some((row) => row.label === "Career direction alignment"), "Discovery must use Career direction alignment.");
assert.ok(!analysis.rows.some((row) => row.label === "Target job alignment"), "Discovery must not imply that a target was selected.");
assert.equal(analysis.alignmentMode, "discovery");
assert.equal(analysis.freshness.status, "current");
assert.ok(analysis.matches.every((match) => match.careerSlug && match.evidenceSignals.length > 0 && match.confidence), "Every recommendation must expose structured explainability.");
assert.ok(analysis.matches.every((match) => Object.values(match.dimensions).every((value) => Number.isInteger(value) && value >= 0 && value <= 100)), "Every Career recommendation must expose five bounded evidence dimensions.");
assert.ok(analysis.matches.every((match) => match.evidenceSummary.strongestEvidence.length || match.evidenceSummary.transferableEvidence.length), "Every recommendation must separate strongest and transferable evidence.");

const linkedinText = `
Contact
www.linkedin.com/in/yaser-tayyebialashti

Top Skills
Process Improvement Projects
Operational Planning
Analytical Skills

Certifications
The International certificate for Business competence / Level A
CompTIA Network+
Digital marketing
V-ray rendering

Yaser Tayyebialashti
Independent AI Product Builder at Independent
Budapest, Hungary

About
Independent AI Product Builder focused on AI Automation, AI Agents, Business AI Solutions, Process Automation, Power Platform, Power BI, Operational Analytics, Digital Transformation and Human-in-the-Loop AI. I define business problems and design product architecture, workflows, AI integrations, UX, validation and production deployment.

Experience
Independent AI Product Builder | Independent | 2025 - Present
Built RYTHM Company OS, a multi-agent business platform with governed workflows, AI integration, human approval controls, validation and production deployment.
Designed AI Career OS, a career intelligence product with evidence extraction, workflow design, AI agents, user experience and Production deployment.

Fulfilment Operations Flow Planner | IKEA | 2025 - Present
Built Power BI decision-support tools for warehouse movement analysis, forecasting and capacity planning. Designed structured rules and data models for process improvement and business process automation.

Education
BSc Business Management
BSc Industrial Management
Associate Degree in Computer Software
`;

const imported = parseLinkedInProfileText(linkedinText);
assert.equal(imported.profile.fullName, "Yaser Tayyebialashti", "Sidebar content must not be mistaken for identity.");
assert.equal(imported.profile.headline, "Independent AI Product Builder at Independent");
assert.match(imported.profile.skills ?? "", /Process Improvement Projects/);
assert.match(imported.profile.certifications ?? "", /CompTIA Network\+/);
assert.ok(imported.detectedSections.includes("skills"), "Top Skills must map to skills.");
assert.ok(imported.detectedSections.includes("certifications"), "Certifications must map to certifications.");
assert.equal(imported.fields.skills?.source, "linkedin_pdf");
assert.equal(imported.fields.certifications?.confidence, "high");
assert.equal(imported.rawText, linkedinText.trim(), "The complete extracted LinkedIn text must remain preserved.");

const linkedinProfile = { ...emptyProfile, ...imported.profile };
const linkedinAnalysis = analyzeSemanticCV(linkedinProfile, imported.rawText, careers);
assert.ok(["medium", "high"].includes(linkedinAnalysis.projectEvidence.confidence), "Named products plus implementation detail must count as project evidence.");
assert.ok(linkedinAnalysis.projectEvidence.namedProducts.some((name) => /RYTHM Company OS/i.test(name)));
assert.ok(linkedinAnalysis.projectEvidence.namedProducts.some((name) => /AI Career OS/i.test(name)));
assert.ok(!linkedinAnalysis.gaps.some((gap) => /add (?:at least one|a substantial) project/i.test(gap)), "Real product evidence must suppress the generic add-project gap.");

const automationScore = linkedinAnalysis.matches.find((match) => match.careerSlug === "ai-automation-specialist")?.score ?? 0;
const securityAnalysis = analyzeSemanticCV({ ...linkedinProfile, targetPosition: "Cybersecurity Analyst", openToSuggestions: false }, imported.rawText, careers);
const securityScore = securityAnalysis.matches[0]?.score ?? 0;
assert.ok(automationScore >= securityScore + 20, "Strong AI automation evidence must materially outrank unrelated security evidence.");
assert.ok(linkedinAnalysis.matches.some((match) => ["ai-automation-specialist", "ai-workflow-architect", "ai-solutions-consultant", "business-ai-consultant"].includes(match.careerSlug)), "AI automation/business-solution Careers must rank competitively.");

const targeted = analyzeSemanticCV({ ...linkedinProfile, targetPosition: "AI Automation Specialist", openToSuggestions: false }, imported.rawText, careers);
assert.equal(targeted.alignmentMode, "targeted");
assert.ok(targeted.rows.some((row) => row.label === "Target job alignment"));
assert.ok(!targeted.rows.some((row) => row.label === "Career direction alignment"));
assert.equal(targeted.matches.length, 1, "Targeted mode must score only the selected Career.");
assert.equal(targeted.matches[0].careerSlug, "ai-automation-specialist");
assert.equal(targeted.matches[0].evidenceSummary.coreGaps.length, 0, "Implemented AI products must satisfy the AI Automation core rather than produce a fabricated learning gap.");
assert.equal(targeted.matches[0].weeks, "No core learning gap detected", "Optional evidence opportunities must not produce a false gap-closing estimate.");
assert.ok(targeted.matches[0].professionalEvidence.directDurationBucket !== "unknown", "Career identity evidence must expose its own dated duration.");
assert.ok(Array.isArray(targeted.matches[0].evidenceSummary.supportingOpportunities), "Supporting opportunities must remain separate from core gaps.");

const rawOnly = analyzeSemanticCV(emptyProfile, imported.rawText, careers);
assert.ok(rawOnly.projectEvidence.namedProducts.length >= 2, "Structured-prefill failure must not remove raw text from semantic project analysis.");

const outdatedCV = `
Yaser Example
email@example.com
ABOUT
Experienced logistics and digital marketing professional focused on workflow optimization.
EXPERIENCE
Digital Marketer | Freelance | 2023
Managed content creation and campaign analysis.
SKILLS
Digital Marketing, SEO, workflow optimization
EDUCATION
Bachelor of Business Management | 2019
`;
const outdated = analyzeSemanticCV(emptyProfile, outdatedCV, careers);
assert.equal(outdated.freshness.status, "outdated");
assert.equal(outdated.freshness.latestExperienceYear, 2023, "Freshness must use the experience timeline, not education dates.");

const sparse = analyzeSemanticCV(emptyProfile, "Name\nemail@example.com\nI am hardworking and motivated.", careers);
assert.ok(sparse.overall < analysis.overall);
assert.equal(sparse.freshness.status, "unknown");

console.log("CV semantic analysis tests passed: LinkedIn aliases/identity/provenance, project evidence, raw-text preservation, explainable catalog matching, discovery/targeted modes, score integrity and freshness.");
