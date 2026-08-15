import fs from "node:fs";

const source = fs.readFileSync("src/data/careers/enterprise-ai-consultant.ts", "utf8");
const catalog = fs.readFileSync("src/data/careerCatalog.ts", "utf8");
const careerPage = fs.readFileSync("src/app/careers/[slug]/page.tsx", "utf8");
const learningPage = fs.readFileSync("src/app/careers/[slug]/learning/page.tsx", "utf8");

const required = [
  'slug: "enterprise-ai-consultant"',
  'title: "Enterprise AI Consultant"',
  "Enterprise Strategy and Portfolio Discovery",
  "Enterprise Architecture and Platform Strategy",
  "Responsible AI, Risk, Security, and Regulatory Governance",
  "Build, Buy, Partner, and Vendor Strategy",
  "Operating Model, Delivery Governance, and Scale",
  "Executive Advisory Capstone and Career Launch",
  "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10",
  "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence",
  "https://www.nist.gov/video/introduction-nist-ai-risk-management-framework-ai-rmf-10-explainer-video",
  "https://airc.nist.gov/airmf-resources/playbook/",
  "https://docs.aws.amazon.com/prescriptive-guidance/latest/strategy-enterprise-ready-gen-ai-platform/",
  "https://learn.microsoft.com/en-us/training/modules/design-overall-ai-strategy-business-solutions/",
  "https://learn.microsoft.com/en-us/training/courses/ab-731t00",
  "https://cloud.google.com/transform/scaling-ai-from-experimentation-to-enterprise-reality-google",
  'salary: "Use Career Intelligence for current country- and seniority-specific compensation evidence"',
  'hiringDemand: "Use Career Intelligence for current vacancy, title, industry, and geography signals"',
  "projects:",
  "portfolioTasks:",
  "jobSearchTasks:",
  "interviewPrep:",
  "finalChallenge:",
];

for (const token of required) {
  if (!source.includes(token)) throw new Error(`Missing Enterprise AI Consultant production requirement: ${token}`);
}

for (const token of ["youtube.com/", "youtu.be/", "$120,000", "$150,000", "95%", "97%", "240+", "500+"]) {
  if (source.includes(token)) throw new Error(`Forbidden or unsupported Enterprise AI Consultant token remains: ${token}`);
}

for (const stage of [
  "Enterprise AI Consulting Orientation",
  "Enterprise Strategy and Portfolio Discovery",
  "Value, Economics, and Portfolio Prioritization",
  "Enterprise Architecture and Platform Strategy",
  "Data, Integration, and Knowledge Readiness",
  "Responsible AI, Risk, Security, and Regulatory Governance",
  "Build, Buy, Partner, and Vendor Strategy",
  "Operating Model, Delivery Governance, and Scale",
  "Adoption, Workforce, and Value Realization",
  "Executive Advisory Capstone and Career Launch",
]) {
  if (!source.includes(stage)) throw new Error(`Missing Enterprise AI Consultant stage: ${stage}`);
}

for (const mode of ['"Documentation"', '"Video"', '"Course"']) {
  if (!source.includes(mode)) throw new Error(`Enterprise AI Consultant adaptive resource mode missing: ${mode}`);
}

if (!catalog.includes('["enterprise-ai-consultant", "Enterprise AI Consultant"') || !catalog.includes('"available", "/careers/enterprise-ai-consultant?entry=galaxy"')) {
  throw new Error("Enterprise AI Consultant is not available in the canonical catalog.");
}

for (const routeSource of [careerPage, learningPage]) {
  if (!routeSource.includes('"enterprise-ai-consultant": enterpriseAiConsultantCareer')) {
    throw new Error("Enterprise AI Consultant is missing from a dynamic Career route registry.");
  }
}

console.log("Enterprise AI Consultant production baseline tests passed: content, direct resources, adaptive learning modes, routes, and availability.");
