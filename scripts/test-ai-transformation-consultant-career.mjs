import fs from "node:fs";

const career = fs.readFileSync("src/data/careers/ai-transformation-consultant.ts", "utf8");
const milestones = fs.readFileSync("src/data/milestones/ai-transformation-consultant.ts", "utf8");
const requirements = fs.readFileSync("src/data/resource-requirements/ai-transformation-consultant.ts", "utf8");
const registry = fs.readFileSync("src/data/milestones/index.ts", "utf8");
const learning = fs.readFileSync("src/components/career/learning/LearningWorkspace.tsx", "utf8");
const catalog = fs.readFileSync("src/data/careerCatalog.ts", "utf8");
const mainRoute = fs.readFileSync("src/app/careers/[slug]/page.tsx", "utf8");
const learningRoute = fs.readFileSync("src/app/careers/[slug]/learning/page.tsx", "utf8");

for (const title of [
  "AI Transformation Orientation and Role Boundaries",
  "Executive Discovery, Current State, and North Star",
  "Opportunity Portfolio and AI Business Cases",
  "Target Operating Model, Governance, and Foundations",
  "Delivery Model, Roadmap, and Program Governance",
  "Change, Adoption, and Workforce Transformation",
  "Value Realization, Scale Decisions, and Assurance",
  "Leadership Alignment, Narrative, and Trust",
  "Enterprise AI Transformation Capstone",
  "Portfolio, Job Search, and Transformation Interviews",
]) {
  if (!career.includes(title)) throw new Error(`Missing stage: ${title}`);
}

const entries = milestones.match(/\bm\(\d+,\s*\d+,/g) ?? [];
if (entries.length !== 30) throw new Error(`Expected 30 milestones; found ${entries.length}.`);
for (let stage = 1; stage <= 10; stage += 1) {
  const stageEntries = milestones.match(new RegExp(`\\bm\\(${stage},\\s*\\d+,`, "g")) ?? [];
  if (stageEntries.length !== 3) throw new Error(`Stage ${stage} must have exactly three milestones.`);
}

for (const title of [
  "Conduct executive and stakeholder discovery",
  "Prioritize an AI transformation portfolio",
  "Design the target AI operating model",
  "Establish responsible AI governance",
  "Build an executable transformation roadmap",
  "Plan workforce and capability transformation",
  "Design the value-realization framework",
  "Build leadership alignment and decision commitment",
  "Defend the transformation before an executive board",
  "Prepare for transformation consulting interviews",
]) {
  if (!milestones.includes(title)) throw new Error(`Missing milestone: ${title}`);
}

if (!requirements.includes("AI_TRANSFORMATION_CONSULTANT_MILESTONES.map")) throw new Error("Requirements must map one-to-one from milestones.");
for (const mode of ['"reading"', '"video"', '"practice"']) {
  if (!requirements.includes(mode)) throw new Error(`Missing mode: ${mode}`);
}
if (!requirements.includes("resourceIds: []")) throw new Error("Resource IDs must remain empty.");
if (/https?:\/\//.test(career) || /https?:\/\//.test(milestones) || /https?:\/\//.test(requirements)) {
  throw new Error("Direct external URLs are forbidden in blueprint content.");
}

if (!registry.includes("AI_TRANSFORMATION_CONSULTANT_MILESTONES") || !registry.includes('"ai-transformation-consultant"')) {
  throw new Error("Milestones are not registered for Learning UI.");
}
if (!learning.includes("getCareerMilestones") || !learning.includes("MilestonePreviewList")) {
  throw new Error("Learning UI does not render milestone inventory.");
}
if (!catalog.includes('"available", "/careers/ai-transformation-consultant?entry=galaxy"')) {
  throw new Error("Career is not activated in the catalog.");
}
if (!mainRoute.includes('from "@/data/careers/ai-transformation-consultant"') || !learningRoute.includes('from "@/data/careers/ai-transformation-consultant"')) {
  throw new Error("Career routes do not use the dedicated blueprint.");
}

console.log("AI Transformation Consultant validated: 10 stages, 30 visible milestones, one-to-one pending resource requirements, routes, activation, and no embedded URLs.");
