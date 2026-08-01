import fs from "node:fs";

const careerSource = fs.readFileSync(
  "src/data/careers/ai-solutions-consultant.ts",
  "utf8"
);
const catalogSource = fs.readFileSync("src/data/careerCatalog.ts", "utf8");
const aliasSource = fs.readFileSync("src/data/careerTitleAliases.ts", "utf8");
const routeSource = fs.readFileSync(
  "src/app/careers/ai-solutions-consultant/page.tsx",
  "utf8"
);
const learningRouteSource = fs.readFileSync(
  "src/app/careers/ai-solutions-consultant/learning/page.tsx",
  "utf8"
);

for (const requiredSection of [
  "journeyStages:",
  "roadmap:",
  "projects:",
  "portfolioTasks:",
  "jobSearchTasks:",
  "interviewPrep:",
  "finalChallenge:",
]) {
  if (!careerSource.includes(requiredSection)) {
    throw new Error(`Missing AI Solutions Consultant section: ${requiredSection}`);
  }
}

for (const requiredTopic of [
  "Client Discovery and Problem Framing",
  "AI Opportunity and Feasibility Assessment",
  "Solution Options and Architecture Framing",
  "Business Case, ROI, and Commercial Value",
  "Responsible AI, Security, and Governance",
  "Proof of Value and Delivery Planning",
  "Adoption, Change, and Operating Model",
  "Consulting Capstone and Portfolio Evidence",
  "Job Search and Consulting Interviews",
]) {
  if (!careerSource.includes(requiredTopic)) {
    throw new Error(`Missing AI Solutions Consultant topic: ${requiredTopic}`);
  }
}

if (!catalogSource.includes('"/careers/ai-solutions-consultant?entry=galaxy"')) {
  throw new Error("AI Solutions Consultant is not activated in the Career Universe.");
}

if (!aliasSource.includes('"ai-solutions-consultant"') || !aliasSource.includes("Generative AI Consultant")) {
  throw new Error("AI Solutions Consultant aliases are missing.");
}

if (!routeSource.includes("aiSolutionsConsultantCareer")) {
  throw new Error("Main AI Solutions Consultant route lacks its static fallback.");
}

if (!learningRouteSource.includes('initialSection="learning"')) {
  throw new Error("AI Solutions Consultant Learning route is not configured.");
}

console.log(
  "AI Solutions Consultant validated: Hero, Roadmap, Learning, Projects, Portfolio, Jobs, Interview, routes, aliases, and Career Universe activation."
);
