import fs from "node:fs";

const careerSource = fs.readFileSync(
  "src/data/careers/intelligent-automation-engineer.ts",
  "utf8"
);
const catalogSource = fs.readFileSync("src/data/careerCatalog.ts", "utf8");
const routeSource = fs.readFileSync(
  "src/app/careers/intelligent-automation-engineer/page.tsx",
  "utf8"
);
const learningRouteSource = fs.readFileSync(
  "src/app/careers/intelligent-automation-engineer/learning/page.tsx",
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
    throw new Error(`Missing Intelligent Automation Engineer section: ${requiredSection}`);
  }
}

for (const requiredTopic of [
  "Process Discovery and Redesign",
  "RPA and Workflow Engineering",
  "Enterprise Integration Engineering",
  "Document Intelligence and AI Decisions",
  "Agentic Orchestration and Human-in-the-Loop",
  "Production Reliability, Security, and Governance",
  "Intelligent Automation Capstone",
  "Job Search and Interview Readiness",
]) {
  if (!careerSource.includes(requiredTopic)) {
    throw new Error(`Missing Intelligent Automation Engineer topic: ${requiredTopic}`);
  }
}

if (!catalogSource.includes('"intelligent-automation-engineer"')) {
  throw new Error("Intelligent Automation Engineer is missing from the career catalog.");
}

if (!catalogSource.includes('"/careers/intelligent-automation-engineer?entry=galaxy"')) {
  throw new Error("Intelligent Automation Engineer is not activated in the Career Universe.");
}

if (!routeSource.includes("intelligentAutomationEngineerCareer")) {
  throw new Error("Main Intelligent Automation Engineer route lacks its static fallback.");
}

if (!learningRouteSource.includes('initialSection="learning"')) {
  throw new Error("Intelligent Automation Engineer Learning route is not configured.");
}

console.log(
  "Intelligent Automation Engineer validated: Hero, Roadmap, Learning, Projects, Portfolio, Jobs, Interview, routes, aliases, and Career Universe activation."
);
