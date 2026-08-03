import fs from "node:fs";

const career = fs.readFileSync("src/data/careers/ai-integration-specialist.ts", "utf8");
const milestones = fs.readFileSync("src/data/milestones/ai-integration-specialist.ts", "utf8");
const requirements = fs.readFileSync("src/data/resource-requirements/ai-integration-specialist.ts", "utf8");
const registry = fs.readFileSync("src/data/milestones/index.ts", "utf8");
const catalog = fs.readFileSync("src/data/careerCatalog.ts", "utf8");
const mainRoute = fs.readFileSync("src/app/careers/[slug]/page.tsx", "utf8");
const learningRoute = fs.readFileSync("src/app/careers/[slug]/learning/page.tsx", "utf8");
const learningUi = fs.readFileSync("src/components/career/learning/LearningWorkspace.tsx", "utf8");
const milestoneUi = fs.readFileSync("src/components/career/learning/MilestonePreviewList.tsx", "utf8");

for (const title of [
  "AI Integration Orientation and Role Boundaries",
  "Integration Discovery and Architecture Decisions",
  "APIs, Identity, and Secure Connectivity",
  "Data Contracts, Context, and Privacy",
  "AI Services, Structured Outputs, and Safety Controls",
  "Workflow Orchestration, Events, and Human Handoffs",
  "Testing, Evaluation, Performance, and Cost",
  "Observability, Incident Response, and Lifecycle Governance",
  "Production AI Integration Capstone",
  "Portfolio, Job Search, and Integration Interviews",
]) {
  if (!career.includes(title)) throw new Error(`Missing stage: ${title}`);
}

const milestoneEntries = milestones.match(/\bm\(\d+,\s*\d+,/g) ?? [];
if (milestoneEntries.length !== 30) throw new Error(`Expected 30 milestones; found ${milestoneEntries.length}.`);
for (let stage = 1; stage <= 10; stage += 1) {
  const count = (milestones.match(new RegExp(`\\bm\\(${stage},\\s*\\d+,`, "g")) ?? []).length;
  if (count !== 3) throw new Error(`Stage ${stage} must have three milestones; found ${count}.`);
}
for (const field of ["learningOutcomes", "skills", "practicalTask", "deliverables", "assessmentScope", "resourceRequirementIds"]) {
  if (!milestones.includes(field)) throw new Error(`Milestone contract missing ${field}.`);
}
for (const title of [
  "Design and consume production APIs",
  "Prepare context and knowledge for AI services",
  "Control AI-specific failure modes",
  "Evaluate AI-assisted outcomes",
  "Implement integration observability",
  "Build and validate the production integration",
]) {
  if (!milestones.includes(title)) throw new Error(`Missing milestone: ${title}`);
}
if (!requirements.includes("AI_INTEGRATION_SPECIALIST_MILESTONES.map")) throw new Error("Requirements are not generated one-to-one from milestones.");
for (const mode of ['"reading"', '"video"', '"practice"']) {
  if (!requirements.includes(mode)) throw new Error(`Missing required mode ${mode}.`);
}
if (!requirements.includes("resourceIds: []")) throw new Error("Resource mappings must remain empty in Blueprint phase.");
if (/https?:\/\//.test(career) || /https?:\/\//.test(milestones) || /https?:\/\//.test(requirements)) {
  throw new Error("Direct external URLs are forbidden in Blueprint files.");
}
if (!registry.includes('"ai-integration-specialist": AI_INTEGRATION_SPECIALIST_MILESTONES')) throw new Error("Milestones are not registered for Learning UI.");
if (!learningUi.includes("getCareerMilestones") || !learningUi.includes("MilestonePreviewList")) throw new Error("Learning UI does not render milestone registry data.");
for (const label of ["Learning outcomes", "Required skills", "Practical task", "Deliverables", "Assessment scope", "Reading", "Video", "Practice", "Resource curation pending"]) {
  if (!milestoneUi.includes(label)) throw new Error(`Milestone UI missing ${label}.`);
}
if (!catalog.includes('["ai-integration-specialist", "AI Integration Specialist"') || !catalog.includes('"available", "/careers/ai-integration-specialist?entry=galaxy"')) throw new Error("Career is not activated.");
if (!mainRoute.includes('from "@/data/careers/ai-integration-specialist"') || !learningRoute.includes('from "@/data/careers/ai-integration-specialist"')) throw new Error("Routes do not use the dedicated career file.");
for (const forbidden of ["activation-batch", "Build practical evidence for", "practical mission 1"]) {
  if (career.includes(forbidden)) throw new Error(`Template-derived content detected: ${forbidden}`);
}

console.log("AI Integration Specialist validated: dedicated career, 10 stages, 30 rendered milestones, one-to-one resource requirements, activation, and no embedded URLs.");
