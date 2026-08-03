import fs from "node:fs";

const career = fs.readFileSync("src/data/careers/cloud-engineer.ts", "utf8");
const milestones = fs.readFileSync("src/data/milestones/cloud-engineer.ts", "utf8");
const milestoneRegistry = fs.readFileSync("src/data/milestones/index.ts", "utf8");
const milestonePreview = fs.readFileSync("src/components/career/learning/MilestonePreviewList.tsx", "utf8");
const learningWorkspace = fs.readFileSync("src/components/career/learning/LearningWorkspace.tsx", "utf8");
const requirements = fs.readFileSync("src/data/resource-requirements/cloud-engineer.ts", "utf8");
const catalog = fs.readFileSync("src/data/careerCatalog.ts", "utf8");
const mainRoute = fs.readFileSync("src/app/careers/[slug]/page.tsx", "utf8");
const learningRoute = fs.readFileSync("src/app/careers/[slug]/learning/page.tsx", "utf8");

for (const required of [
  "Cloud Engineering Orientation and Role Boundaries",
  "Cloud Foundations and Architecture Decisions",
  "Identity, Networking, and Cloud Security Foundations",
  "Compute, Storage, Databases, and Managed Services",
  "Infrastructure as Code and Delivery Automation",
  "Containers and Cloud-Native Platforms",
  "Observability, Reliability, Incident Response, and Recovery",
  "Governance, FinOps, and Platform Operations",
  "Production Cloud Platform Capstone",
  "Portfolio, Job Search, and Cloud Interviews",
  "projects:",
  "portfolioTasks:",
  "jobSearchTasks:",
  "interviewPrep:",
  "finalChallenge:",
]) {
  if (!career.includes(required)) throw new Error(`Missing Cloud Engineer content: ${required}`);
}

const milestoneEntries = milestones.match(/\bm\(\d+,\s*\d+,/g) ?? [];
if (milestoneEntries.length !== 30) {
  throw new Error(`Expected 30 granular Cloud Engineer milestones; found ${milestoneEntries.length}.`);
}
for (let stage = 1; stage <= 10; stage += 1) {
  const stageEntries = milestones.match(new RegExp(`\\bm\\(${stage},\\s*\\d+,`, "g")) ?? [];
  if (stageEntries.length !== 3) {
    throw new Error(`Expected exactly three milestones for Cloud Engineer stage ${stage}; found ${stageEntries.length}.`);
  }
}
for (const field of [
  "learningOutcomes",
  "skills",
  "practicalTask",
  "deliverables",
  "assessmentScope",
  "resourceRequirementIds",
]) {
  if (!milestones.includes(field)) throw new Error(`Milestone contract is missing ${field}.`);
}
for (const title of [
  "Design cloud networking and segmentation",
  "Control IaC state, policy, validation, and drift",
  "Build observability and service objectives",
  "Operate cloud cost and FinOps controls",
  "Validate the production cloud platform",
  "Prepare for Cloud Engineer interviews",
]) {
  if (!milestones.includes(title)) throw new Error(`Missing required granular milestone: ${title}`);
}

if (!milestoneRegistry.includes('"cloud-engineer": CLOUD_ENGINEER_MILESTONES')) {
  throw new Error("Cloud Engineer milestones are not registered for UI resolution.");
}
if (!learningWorkspace.includes("getCareerMilestones(career.slug)")) {
  throw new Error("LearningWorkspace does not resolve Career milestones.");
}
if (!learningWorkspace.includes("<MilestonePreviewList milestones={milestones} />")) {
  throw new Error("LearningWorkspace does not render milestone preview cards.");
}
for (const requiredUi of [
  "Learning outcomes",
  "Required skills",
  "Practical task",
  "Assessment scope",
  "Resource curation pending",
  "Reading",
  "Video",
  "Practice",
]) {
  if (!milestonePreview.includes(requiredUi)) {
    throw new Error(`Milestone preview is missing required UI: ${requiredUi}`);
  }
}

if (!requirements.includes("CLOUD_ENGINEER_MILESTONES.map")) {
  throw new Error("Resource requirements must be generated one-to-one from the milestone inventory.");
}
for (const mode of ['"reading"', '"video"', '"practice"']) {
  if (!requirements.includes(mode)) throw new Error(`Missing mandatory learning mode ${mode}.`);
}
if (!requirements.includes("milestoneId: milestone.id")) {
  throw new Error("Every resource requirement must target a granular milestone ID.");
}
if (!requirements.includes("requiredLearningOutcomes: milestone.learningOutcomes")) {
  throw new Error("Resource requirements must inherit the exact milestone learning outcomes.");
}
if (!requirements.includes("resourceIds: []")) {
  throw new Error("Resource IDs must remain empty during Career Blueprint production.");
}
if (/https?:\/\//.test(career) || /https?:\/\//.test(milestones) || /https?:\/\//.test(requirements)) {
  throw new Error("Direct external URLs are forbidden in the Career Blueprint, milestones, and requirement contracts.");
}
for (const forbidden of [
  "Build practical evidence for",
  "practical mission 1",
  "Create a reviewable artifact demonstrating",
  "AI Product Management Orientation",
]) {
  if (career.includes(forbidden) || milestones.includes(forbidden)) {
    throw new Error(`Template-derived wording detected: ${forbidden}`);
  }
}
if (!catalog.includes('["cloud-engineer", "Cloud Engineer"') || !catalog.includes('"available", "/careers/cloud-engineer?entry=galaxy"')) {
  throw new Error("Cloud Engineer is not activated in the Career Catalog.");
}
if (!mainRoute.includes('from "@/data/careers/cloud-engineer"') || !learningRoute.includes('from "@/data/careers/cloud-engineer"')) {
  throw new Error("Cloud Engineer routes do not use the dedicated blueprint.");
}
if (mainRoute.includes('cloudEngineerCareer } from "@/data/careers/activation-batch-seven"') || learningRoute.includes('cloudEngineerCareer } from "@/data/careers/activation-batch-seven"')) {
  throw new Error("Cloud Engineer still resolves from the shared activation template.");
}

console.log("Cloud Engineer validated: ten stages, thirty rendered granular milestones, measurable outcomes, practical evidence, assessment scopes, pending Reading/Video/Practice states, one-to-one resource requirement contracts, route activation, and no embedded resource URLs.");
