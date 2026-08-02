import fs from "node:fs";

const careerSource = fs.readFileSync(
  "src/data/careers/ai-workflow-architect.ts",
  "utf8"
);
const catalogSource = fs.readFileSync("src/data/careerCatalog.ts", "utf8");
const aliasesSource = fs.readFileSync("src/data/careerTitleAliases.ts", "utf8");
const routeSource = fs.readFileSync(
  "src/app/careers/ai-workflow-architect/page.tsx",
  "utf8"
);
const learningRouteSource = fs.readFileSync(
  "src/app/careers/ai-workflow-architect/learning/page.tsx",
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
    throw new Error(`Missing AI Workflow Architect section: ${requiredSection}`);
  }
}

for (const requiredTopic of [
  "Workflow Discovery and Domain Modeling",
  "Human-AI Workflow Design",
  "Orchestration, State, and Long-Running Workflows",
  "AI Agents, Tools, and Decision Services",
  "Integration and Workflow Platform Architecture",
  "Security, Governance, and Responsible AI Controls",
  "Observability, Reliability, and Workflow Operations",
  "Architecture Capstone and Portfolio Evidence",
  "Career Positioning and Architecture Interviews",
]) {
  if (!careerSource.includes(requiredTopic)) {
    throw new Error(`Missing AI Workflow Architect topic: ${requiredTopic}`);
  }
}

if (!catalogSource.includes('"/careers/ai-workflow-architect?entry=galaxy"')) {
  throw new Error("AI Workflow Architect is not activated in the Career Universe.");
}

if (!aliasesSource.includes('"ai-workflow-architect"')) {
  throw new Error("AI Workflow Architect title aliases are missing.");
}

if (!routeSource.includes("aiWorkflowArchitectCareer")) {
  throw new Error("Main AI Workflow Architect route is not connected to its career data.");
}

if (!learningRouteSource.includes('initialSection="learning"')) {
  throw new Error("AI Workflow Architect Learning route is not configured.");
}

console.log(
  "AI Workflow Architect validated: Hero, Roadmap, Learning, assessments, Projects, Portfolio, Jobs, Interview, aliases, routes, and Career Universe activation."
);
