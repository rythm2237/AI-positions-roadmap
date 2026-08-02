import fs from "node:fs";

const careerSource = fs.readFileSync(
  "src/data/careers/ai-product-manager.ts",
  "utf8"
);
const catalogSource = fs.readFileSync("src/data/careerCatalog.ts", "utf8");
const aliasesSource = fs.readFileSync("src/data/careerTitleAliases.ts", "utf8");
const routeSource = fs.readFileSync(
  "src/app/careers/ai-product-manager/page.tsx",
  "utf8"
);
const learningRouteSource = fs.readFileSync(
  "src/app/careers/ai-product-manager/learning/page.tsx",
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
    throw new Error(`Missing AI Product Manager section: ${requiredSection}`);
  }
}

for (const requiredTopic of [
  "Customer Discovery and Problem Framing",
  "AI Capability and Feasibility Assessment",
  "Product Strategy, Vision, and Roadmapping",
  "AI Product Requirements and Experience Design",
  "Evaluation, Metrics, and Experimentation",
  "Responsible AI, Trust, and Product Governance",
  "Delivery, Launch, and Cross-Functional Leadership",
  "AI Product Capstone and Portfolio",
  "Job Search and AI Product Interviews",
]) {
  if (!careerSource.includes(requiredTopic)) {
    throw new Error(`Missing AI Product Manager topic: ${requiredTopic}`);
  }
}

if (!catalogSource.includes('"/careers/ai-product-manager?entry=galaxy"')) {
  throw new Error("AI Product Manager is not activated in the Career Universe.");
}

if (!aliasesSource.includes('"ai-product-manager"')) {
  throw new Error("AI Product Manager title aliases are missing.");
}

if (!routeSource.includes("aiProductManagerCareer")) {
  throw new Error("Main AI Product Manager route lacks its static fallback.");
}

if (!learningRouteSource.includes('initialSection="learning"')) {
  throw new Error("AI Product Manager Learning route is not configured.");
}

console.log(
  "AI Product Manager validated: Hero, Roadmap, Learning, Projects, Portfolio, Jobs, Interview, routes, aliases, and Career Universe activation."
);
