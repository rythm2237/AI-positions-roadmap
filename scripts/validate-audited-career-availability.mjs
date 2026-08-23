import fs from "node:fs";
import "./patch-guided-project-reviewer.mjs";

const catalog = fs.readFileSync("src/data/careerCatalog.ts", "utf8");

const active = [
  "ai-engineer",
  "ai-product-manager",
  "ai-automation-specialist",
  "intelligent-automation-engineer",
  "microsoft-copilot-consultant",
  "ai-integration-specialist",
  "ai-workflow-architect",
  "ai-solutions-consultant",
  "ai-transformation-consultant",
  "business-ai-consultant",
  "enterprise-ai-consultant",
  "ai-adoption-consultant",
  "data-analyst",
  "bi-developer",
  "data-engineer",
  "data-scientist",
  "ai-knowledge-engineer",
  "cloud-engineer",
  "devops-engineer",
  "cybersecurity-analyst",
  "generative-engine-optimization-specialist",
  "ai-marketing-specialist",
  "ai-content-strategist",
];

for (const slug of active) {
  if (!catalog.includes(`"${slug}"`) || !catalog.includes(`"/careers/${slug}`)) {
    throw new Error(`${slug} should be available in Career Universe.`);
  }
}

const availableCount = (catalog.match(/"available",\s*"\/careers\//g) ?? []).length;
if (availableCount !== active.length) {
  throw new Error(`Expected ${active.length} available Careers, found ${availableCount}.`);
}

if (/enterprise-ai-consultant[^\n]+planned/.test(catalog)) {
  throw new Error("Enterprise AI Consultant must not remain Planned.");
}

const workspace = fs.readFileSync("src/components/career/CareerWorkspace.tsx", "utf8");
const reviewer = fs.readFileSync("src/components/career/projects/GuidedProjectsWorkspace.tsx", "utf8");
const route = fs.readFileSync("src/app/api/project-review/route.ts", "utf8");
const evidence = fs.readFileSync("src/lib/projectEvidence.ts", "utf8");

for (const token of [
  "GuidedProjectsWorkspace career={career}",
  "Projects count toward Job Readiness only after a rubric review",
  "Submit for AI review",
  "PROJECT_PASSING_SCORE = 70",
  "PROJECT_JOB_READY_SCORE = 85",
  'model: process.env.PROJECT_REVIEW_MODEL || "openai/gpt-4.1"',
  "review.passed",
]) {
  if (![workspace, reviewer, route, evidence].some((source) => source.includes(token))) {
    throw new Error(`Guided project reviewer validation missing: ${token}`);
  }
}

if (workspace.includes('section === "project" ? <ProjectsModule progress={progress}')) {
  throw new Error("Legacy click-to-complete ProjectsModule is still active.");
}

console.log("Career availability validated: 23 active Careers and guided project evidence review is active.");
