import fs from "node:fs";
import "./patch-guided-project-reviewer.mjs";
import "./patch-portfolio-proof.mjs";
import "./patch-job-launch-workspace.mjs";

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
  if (!catalog.includes(`"${slug}"`) || !catalog.includes(`"/careers/${slug}`)) throw new Error(`${slug} should be available in Career Universe.`);
}
const availableCount = (catalog.match(/"available",\s*"\/careers\//g) ?? []).length;
if (availableCount !== active.length) throw new Error(`Expected ${active.length} available Careers, found ${availableCount}.`);
if (/enterprise-ai-consultant[^\n]+planned/.test(catalog)) throw new Error("Enterprise AI Consultant must not remain Planned.");

const workspace = fs.readFileSync("src/components/career/CareerWorkspace.tsx", "utf8");
const reviewer = fs.readFileSync("src/components/career/projects/GuidedProjectsWorkspace.tsx", "utf8");
const route = fs.readFileSync("src/app/api/project-review/route.ts", "utf8");
const evidence = fs.readFileSync("src/lib/projectEvidence.ts", "utf8");
const portfolio = fs.readFileSync("src/components/career/portfolio/PortfolioProofWorkspace.tsx", "utf8");
const proofModel = fs.readFileSync("src/lib/portfolioProof.ts", "utf8");
const proofPage = fs.readFileSync("src/app/proof/[careerSlug]/page.tsx", "utf8");
const jobWorkspace = fs.readFileSync("src/components/career/jobs/JobLaunchWorkspace.tsx", "utf8");
const jobMatch = fs.readFileSync("src/lib/jobMatch.ts", "utf8");

for (const token of [
  "GuidedProjectsWorkspace career={career}",
  "Submit for AI review",
  "PROJECT_PASSING_SCORE = 70",
  "PROJECT_JOB_READY_SCORE = 85",
  'model: process.env.PROJECT_REVIEW_MODEL || "openai/gpt-4.1"',
  "PortfolioProofWorkspace career={career}",
  "Recruiter-ready portfolio evidence",
  "Copy recruiter proof link",
  "buildProofProfile",
  "decodeProofProfile",
  "Verified Proof of Skill",
  "JobLaunchWorkspace career={career}",
  "Job readiness gate",
  "Analyze job fit",
  "analyzeJobMatch",
  'ApplyDecision = "apply" | "conditional" | "build-gap"',
  "A strong JD match does not override missing core evidence",
]) {
  if (![workspace, reviewer, route, evidence, portfolio, proofModel, proofPage, jobWorkspace, jobMatch].some((source) => source.includes(token))) throw new Error(`Zero-to-hired validation missing: ${token}`);
}
if (workspace.includes('section === "project" ? <ProjectsModule progress={progress}')) throw new Error("Legacy click-to-complete ProjectsModule is still active.");
if (workspace.includes('section === "portfolio" ? <PortfolioModule progress={progress}')) throw new Error("Legacy manual PortfolioModule is still active.");
if (workspace.includes('section === "jobs" ? <JobsModule progress={progress}')) throw new Error("Legacy generic JobsModule is still active.");
console.log("Career availability validated: 23 active Careers, guided project review, proof profiles, readiness gating, and JD gap matching are active.");
