import assert from "node:assert/strict";
import { AVAILABLE_CAREERS } from "../src/data/careerCatalog.ts";
import { analyzeSemanticCV } from "../src/lib/cvAnalyzer/semanticAnalysis.ts";

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

function analyze(text, overrides = {}) {
  return analyzeSemanticCV({ ...emptyProfile, ...overrides }, text, AVAILABLE_CAREERS);
}

function match(analysis, slug) {
  const result = analysis.matches.find((item) => item.careerSlug === slug);
  assert.ok(result, `${slug} must be present in the compared results.`);
  return result;
}

function targeted(text, title, overrides = {}) {
  return analyze(text, { ...overrides, targetPosition: title, openToSuggestions: false }).matches[0];
}

function monthYearMonthsAgo(months) {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - months);
  return date.toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

const experiencedBI = `
EXPERIENCED BI / DATA ANALYST
SUMMARY
Business intelligence analyst translating operational questions into reliable reporting and decision support.
EXPERIENCE
Senior BI Analyst | Manufacturing Company | 2021 - Present
Built governed Power BI dashboards and SQL datasets for operational KPI analysis, forecasting and weekly decisions.
Designed data models, DAX measures and reporting used by 8 teams; reduced manual reporting time by 35%.
Repeatedly analyzed business questions with stakeholders and validated dashboard outputs against source systems.
SKILLS
Power BI, SQL, DAX, Power Query, data analysis, data modeling, dashboards, reporting, forecasting
`;
const biDataAnalyst = targeted(experiencedBI, "Data Analyst");
const biDataScientist = targeted(experiencedBI, "Data Scientist");
assert.ok(biDataAnalyst.score > biDataScientist.score, "Analytics-heavy evidence without ML/statistics must favor Data Analyst over Data Scientist.");
assert.ok(biDataAnalyst.dimensions.professionalEvidence > biDataScientist.dimensions.professionalEvidence, "Relevant multi-year analytics must receive stronger professional credit for Data Analyst.");
assert.ok(biDataScientist.dimensions.transferability > 35, "Analytics should remain meaningfully transferable to Data Scientist.");
assert.ok(biDataScientist.dimensions.coreRequirements < 45, "Transferability must not replace missing Data Scientist core requirements.");

const juniorML = `
JUNIOR MACHINE LEARNING CANDIDATE
SUMMARY
Junior data scientist focused on statistical modeling, experimentation and machine-learning model development.
PROJECTS
Customer Churn Model | 2026
Built Python and scikit-learn classification models, designed controlled experiments, performed hypothesis testing and statistical analysis, and used cross-validation, precision and recall for model validation.
Demand Causal Study | 2026
Developed a causal inference analysis and evaluated treatment effects using Python, pandas and regression analysis.
SKILLS
Python, pandas, statistics, machine learning, scikit-learn, experimental design, causal inference, model validation
EDUCATION
BSc Mathematics | 2022 - 2026
`;
const juniorDataScientist = targeted(juniorML, "Data Scientist");
assert.ok(juniorDataScientist.dimensions.roleRelevance >= 70, "ML-heavy profile must score strongly on Data Scientist role relevance.");
assert.ok(juniorDataScientist.dimensions.coreRequirements >= 75, "ML-heavy profile must cover Data Scientist core requirements.");
assert.ok(juniorDataScientist.dimensions.professionalEvidence < juniorDataScientist.dimensions.roleRelevance, "Limited professional history must remain distinct from strong technical relevance.");

const transitionProfile = `
OPERATIONS ANALYTICS AND AI AUTOMATION PROFESSIONAL
SUMMARY
Operations professional transitioning into AI Automation through deployed independent products.
EXPERIENCE
Independent AI Product Builder | Independent | 2025 - Present
Built AI-agent workflows connected to business processes, designed product architecture and AI integration, implemented APIs and human approval controls, and deployed two production AI products.
Operations Planning Analyst | Retail Company | 2020 - 2025
Built Power BI dashboards, analyzed operational KPIs, produced forecasts and decision-support reporting, and improved planning processes across 6 operational areas.
SKILLS
Power BI, data analysis, forecasting, AI Automation, AI agents, workflow design, API integration, product architecture
PROJECTS
RYTHM Company OS. Implemented and deployed governed AI-agent workflows with human-in-the-loop approvals and API integrations.
AI Career OS. Designed product architecture, AI integration and production deployment for a career intelligence workflow.
`;
const transitionData = targeted(transitionProfile, "Data Analyst");
const transitionAutomation = targeted(transitionProfile, "AI Automation Specialist");
const transitionScientist = targeted(transitionProfile, "Data Scientist");
assert.ok(Math.abs(transitionData.score - transitionAutomation.score) <= 20, "Established analytics and recent AI Automation should rank competitively with different evidence profiles.");
assert.ok(transitionData.dimensions.professionalEvidence > transitionAutomation.dimensions.professionalEvidence, "Multi-year employed analytics should carry more established professional evidence.");
assert.ok(transitionAutomation.dimensions.trajectory > transitionData.dimensions.trajectory, "Recent direct AI implementation must materially strengthen AI Automation trajectory.");
assert.ok(transitionScientist.score < transitionData.score && transitionScientist.score < transitionAutomation.score, "Generic analytics transferability must not over-rank Data Scientist.");
assert.ok(!transitionAutomation.missingSignals.some((signal) => /product architecture|ai integration/i.test(signal)), "Detected product architecture and AI integration must never reappear as missing.");

const recentAiStart = monthYearMonthsAgo(3);
const establishedAnalyticsStart = monthYearMonthsAgo(17);
const realProfileTimeline = `
AI AUTOMATION AND OPERATIONS ANALYTICS PROFESSIONAL
SUMMARY
Independent AI Product Builder focused on AI Automation, AI agents, business solutions and human-in-the-loop systems.
EXPERIENCE
Independent AI Product Builder | Independent | ${recentAiStart} - Present
Built and deployed RYTHM Company OS and AI Career OS with AI agents, product architecture, API integration, governed workflows and human approval controls.
Fulfilment Operations Flow Planner | IKEA | ${establishedAnalyticsStart} - Present
Built Power BI decision-support tools for warehouse movement analysis, forecasting and capacity planning. Designed data models, reporting and business process automation.
PROJECTS
RYTHM Company OS. Implemented and deployed governed multi-agent workflows with API integrations and approval controls.
AI Career OS. Built an AI product with workflow design, AI integration, validation and production deployment.
SKILLS
AI Automation, AI agents, Power BI, operational analytics, forecasting, data models, process automation, workflow design, API integration
`;
const realTimelineAutomation = targeted(realProfileTimeline, "AI Automation Specialist");
const realTimelineAnalyst = targeted(realProfileTimeline, "Data Analyst");
assert.equal(realTimelineAutomation.professionalEvidence.directDurationBucket, "<6 months", "Recent AI-specific product evidence must not inherit the longer process-automation duration.");
assert.equal(realTimelineAutomation.confidence, "medium", "Strong but recent AI-specific evidence must remain medium confidence until it is established over time.");
assert.ok(realTimelineAutomation.evidenceSummary.limitingFactors.some((signal) => /shorter than one year/i.test(signal)), "Medium confidence from recent direct evidence must expose the matching duration limitation.");
assert.equal(realTimelineAutomation.evidenceSummary.coreGaps.length, 0, "Implemented AI products must not receive a fabricated core gap.");
assert.equal(realTimelineAutomation.weeks, "No core learning gap detected", "Supporting opportunities must not create a false core learning estimate.");
assert.equal(realTimelineAnalyst.professionalEvidence.directDurationBucket, "1–2 years", "Established analytics evidence must retain its own direct duration.");
assert.ok(realTimelineAnalyst.evidenceSummary.supportingOpportunities.some((signal) => /statistical modeling|experimental design/i.test(signal)), "Optional analytical depth must be reported as supporting opportunity.");
assert.ok(!realTimelineAnalyst.evidenceSummary.coreGaps.some((signal) => /statistical modeling|experimental design/i.test(signal)), "Optional Data Analyst capabilities must never be presented as core gaps.");

const experiencedBuilder = `
INDEPENDENT AI AUTOMATION BUILDER
EXPERIENCE
Independent AI Automation Builder | Self-employed | 2022 - Present
Architected and deployed 12 workflow systems connecting AI agents, REST APIs, business data and approval controls.
Implemented monitoring, validation, human-in-the-loop escalation and production operations for client workflows.
PROJECTS
Agent Operations Platform. Built and deployed an AI-agent orchestration product with API integration, workflow design and measurable production reliability.
SKILLS
AI Automation, AI agents, workflow design, REST API, system integration, production deployment, human-in-the-loop
`;
const builderAutomation = targeted(experiencedBuilder, "AI Automation Specialist");
assert.ok(builderAutomation.dimensions.roleRelevance >= 70, "Experienced independent builder must receive high direct role relevance.");
assert.ok(builderAutomation.dimensions.trajectory >= 70, "Current independent implementation must receive high trajectory.");
assert.ok(builderAutomation.dimensions.professionalEvidence >= 60, "Substantial independent implementation must count as recruiter-defensible professional evidence.");

const enterpriseConsultant = `
ENTERPRISE AI TRANSFORMATION CONSULTANT
EXPERIENCE
Enterprise AI Transformation Consultant | Advisory Group | 2018 - Present
Advised executive stakeholders on enterprise AI strategy, operating models, portfolio investment and responsible-AI governance.
Led discovery workshops, transformation roadmaps, sourcing decisions, change management and adoption programs with measurable value realization.
Designed governance controls and business cases across large cross-functional organizations.
SKILLS
Enterprise strategy, AI governance, executive stakeholders, operating model, transformation, change management, adoption, value realization
`;
const enterpriseMatch = targeted(enterpriseConsultant, "Enterprise AI Consultant");
const enterpriseScientist = targeted(enterpriseConsultant, "Data Scientist");
assert.ok(enterpriseMatch.score > enterpriseScientist.score + 20, "Enterprise consulting evidence must rank consulting above hands-on Data Scientist work.");
assert.ok(enterpriseMatch.dimensions.coreRequirements >= 70, "Enterprise consultant persona must cover consulting core requirements.");

const summaryOnly = targeted(`
SUMMARY
AI Automation Specialist with AI agents, workflow design, API integration, product architecture and production deployment.
SKILLS
AI Automation, AI agents, workflow design, API integration
`, "AI Automation Specialist");
assert.ok(builderAutomation.dimensions.professionalEvidence >= summaryOnly.dimensions.professionalEvidence + 25, "Summary-only claims must not equal substantial implementation evidence.");

const historicalAutomation = targeted(`
EXPERIENCE
AI Automation Builder | Technology Company | 2019 - 2021
Built and deployed AI workflow automation with API integration and human approval controls.
SKILLS
AI Automation, workflow design, API integration, deployment
`, "AI Automation Specialist");
assert.ok(builderAutomation.dimensions.trajectory >= historicalAutomation.dimensions.trajectory + 20, "Recent direct evidence must materially increase trajectory.");

const identityA = targeted(transitionProfile, "AI Automation Specialist", { fullName: "Candidate One" });
const identityB = targeted(transitionProfile, "AI Automation Specialist", { fullName: "Completely Different Name" });
assert.deepEqual(identityA.dimensions, identityB.dimensions, "Candidate identity must not affect ranking dimensions.");
assert.equal(identityA.score, identityB.score, "Candidate identity must not affect final ranking.");

const discovery = analyze(transitionProfile);
assert.equal(discovery.alignmentMode, "discovery");
assert.equal(targeted(transitionProfile, "AI Automation Specialist").careerSlug, "ai-automation-specialist");

const results = {
  experiencedBI: { dataAnalyst: biDataAnalyst.score, dataScientist: biDataScientist.score },
  juniorML: { dataScientist: juniorDataScientist.score, dimensions: juniorDataScientist.dimensions },
  transition: { dataAnalyst: transitionData.score, aiAutomation: transitionAutomation.score, dataScientist: transitionScientist.score },
  realProfileTimeline: {
    aiAutomation: { score: realTimelineAutomation.score, confidence: realTimelineAutomation.confidence, directDuration: realTimelineAutomation.professionalEvidence.directDurationBucket },
    dataAnalyst: { score: realTimelineAnalyst.score, confidence: realTimelineAnalyst.confidence, directDuration: realTimelineAnalyst.professionalEvidence.directDurationBucket },
  },
  transitionDiscoveryTop: discovery.matches.map(({ careerSlug, score, confidence }) => ({ careerSlug, score, confidence })),
  experiencedBuilder: { aiAutomation: builderAutomation.score, dimensions: builderAutomation.dimensions },
  enterpriseConsultant: { enterpriseAI: enterpriseMatch.score, dataScientist: enterpriseScientist.score },
};

console.log("Career matching calibration tests passed.");
console.log(JSON.stringify(results, null, 2));
