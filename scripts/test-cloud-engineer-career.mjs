import fs from "node:fs";

const career = fs.readFileSync("src/data/careers/cloud-engineer.ts", "utf8");
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

const stageIds = [...career.matchAll(/id: `cloud-engineer-stage-\$\{stage\}`/g)].length;
if (stageIds !== 1 || !career.includes("const stageSpecs: StageSpec[]")) {
  throw new Error("Cloud Engineer stages are not generated from the dedicated stage specification.");
}

if ((requirements.match(/requirement\(/g) ?? []).length !== 11) {
  throw new Error("Expected ten Cloud Engineer requirement contracts plus the helper declaration.");
}
for (let stage = 1; stage <= 10; stage += 1) {
  if (!requirements.includes(`requirement(${stage},`)) throw new Error(`Missing resource requirement for stage ${stage}.`);
}
for (const mode of ['"reading"', '"video"', '"practice"']) {
  if (!requirements.includes(mode)) throw new Error(`Missing mandatory learning mode ${mode}.`);
}
if (!requirements.includes("resourceIds: []")) throw new Error("Resource IDs must remain empty during Career Blueprint production.");
if (/https?:\/\//.test(career) || /https?:\/\//.test(requirements)) {
  throw new Error("Direct external URLs are forbidden in the Career Blueprint and requirement contracts.");
}
for (const forbidden of [
  "Build practical evidence for",
  "practical mission 1",
  "Create a reviewable artifact demonstrating",
  "AI Product Management Orientation",
]) {
  if (career.includes(forbidden)) throw new Error(`Template-derived wording detected: ${forbidden}`);
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

console.log("Cloud Engineer validated: dedicated content, ten milestones, assessments, projects, career preparation, resource requirement contracts, route activation, and no embedded resource URLs.");
