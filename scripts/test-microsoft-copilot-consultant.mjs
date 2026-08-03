import fs from "node:fs";

const career = fs.readFileSync("src/data/careers/microsoft-copilot-consultant.ts", "utf8");
const validatedWorkspace = fs.readFileSync("src/data/careers/microsoft-copilot-consultant-workspace.ts", "utf8");
const learningDatabase = fs.readFileSync("src/data/learning/copilotConsultantLearningDatabase.ts", "utf8");
const roleOrientation = fs.readFileSync("src/data/learning/copilotRoleOrientationResource.ts", "utf8");
const geoCareer = fs.readFileSync("src/data/careers/generative-engine-optimization-specialist.ts", "utf8");
const geoDatabase = fs.readFileSync("src/data/learning/geoLearningDatabase.ts", "utf8");
const resolver = fs.readFileSync("src/lib/references/referenceResolver.ts", "utf8");
const learningUi = fs.readFileSync("src/components/career/learning/LearningWorkspace.tsx", "utf8");
const chooser = fs.readFileSync("src/components/career/resources/ReferenceLearningChooser.tsx", "utf8");
const switcher = fs.readFileSync("src/components/navigation/CareerSwitcherDock.tsx", "utf8");
const catalog = fs.readFileSync("src/data/careerCatalog.ts", "utf8");
const mainRoute = fs.readFileSync("src/app/careers/[slug]/page.tsx", "utf8");
const learningRoute = fs.readFileSync("src/app/careers/[slug]/learning/page.tsx", "utf8");

for (const section of ["journeyStages:", "roadmap:", "projects:", "globalResources:", "readiness:", "portfolioTasks:", "jobSearchTasks:", "interviewPrep:", "finalChallenge:"]) {
  if (!career.includes(section)) throw new Error(`Missing Copilot career section: ${section}`);
}

for (const topic of [
  "Microsoft 365 Copilot Readiness and Use-Case Discovery",
  "Microsoft 365 Copilot Experience and Prompt Enablement",
  "Copilot Studio Agent Design",
  "Knowledge, Grounding, and Information Architecture",
  "Actions, Power Automate, Connectors, and Dataverse",
  "Security, Data Protection, Governance, and ALM",
  "Testing, Evaluation, Analytics, and Reliability",
  "Deployment, Adoption, Change, and Value Realization",
  "Copilot Consulting Capstone and Career Positioning",
]) {
  if (!career.includes(topic)) throw new Error(`Missing Copilot-specific topic: ${topic}`);
}

const copilotIds = [...learningDatabase.matchAll(/id: "(mcc-[^"]+)"/g)].map((match) => match[1]);
if (copilotIds.length !== 10 || new Set(copilotIds).size !== 10) {
  throw new Error(`Expected 10 unique Copilot Registry resources; found ${copilotIds.length}.`);
}
if (!learningDatabase.includes('mode: "reading"') || !learningDatabase.includes('mode: "video"') || !learningDatabase.includes('mode: "practice"')) {
  throw new Error("Copilot Registry does not define all three canonical learning modes.");
}
for (const id of copilotIds) {
  const block = learningDatabase.split(`id: "${id}"`)[1]?.split("resource({")[0] ?? "";
  if (!block.includes('mode: "reading"')) throw new Error(`${id} is missing verified reading.`);
  if (!block.includes("microsoftVideo(")) throw new Error(`${id} is missing verified video.`);
  if (!block.includes("microsoftPractice(")) throw new Error(`${id} is missing verified practice.`);
}

for (const required of [
  'id: "mcc-role-overview"',
  "Microsoft 365 Copilot overview",
  "Explore Microsoft 365 Copilot business possibilities",
  "convert those scenarios into a consultant role map and evidence plan rather than building an agent",
]) {
  if (!roleOrientation.includes(required)) throw new Error(`Role-orientation correction is missing: ${required}`);
}
if (roleOrientation.includes("Introduction to agents") || roleOrientation.includes("Understand features of Copilot Studio agents")) {
  throw new Error("Role orientation still points learners to agent-building content.");
}
if (!resolver.includes("COPILOT_ROLE_ORIENTATION_RESOURCE") || resolver.indexOf("COPILOT_ROLE_ORIENTATION_RESOURCE") < resolver.indexOf("COPILOT_CONSULTANT_LEARNING_DATABASE")) {
  throw new Error("Corrected role orientation is not registered as the canonical final resource override.");
}

if (!learningUi.includes("resolveCareerStepReferences") || !learningUi.includes("ReferenceLearningChooser")) {
  throw new Error("Learning Workspace no longer uses the central Registry and shared chooser.");
}
for (const label of ["Choose your learning format", "Read", "Watch", "Practice"]) {
  if (!chooser.includes(label)) throw new Error(`Shared Learning chooser is missing ${label}.`);
}
if (learningUi.includes("Open official resource") || learningUi.includes("buildDirectReference")) {
  throw new Error("Learning Workspace contains the rejected direct-link fallback instead of the canonical chooser.");
}

for (const required of [
  'topicId: resourceId',
  'passingScore: 60',
  'questionsPerAttempt: 5',
  'questionsPerAttempt: 20',
  'passingScore: 70',
  'topicAssessments: [topicAssessment]',
]) {
  if (!validatedWorkspace.includes(required)) throw new Error(`Validated Copilot assessment contract is missing: ${required}`);
}

if (!catalog.includes('"available", "/careers/microsoft-copilot-consultant?entry=galaxy"')) {
  throw new Error("Microsoft Copilot Consultant is not available in the Career Universe.");
}
if (!catalog.includes('"available", "/careers/generative-engine-optimization-specialist?entry=galaxy"')) {
  throw new Error("GEO Specialist availability was not restored.");
}
if (!switcher.includes("careers.map((career) => career.route ?")) {
  throw new Error("Career Switcher still depends on a second availability flag instead of the canonical public route.");
}
if (!mainRoute.includes('from "@/data/careers/microsoft-copilot-consultant-workspace"') || !learningRoute.includes('from "@/data/careers/microsoft-copilot-consultant-workspace"')) {
  throw new Error("Routes do not use the validated Copilot workspace.");
}
if (!mainRoute.includes("generativeEngineOptimizationSpecialistCareer") || !learningRoute.includes("generativeEngineOptimizationSpecialistCareer")) {
  throw new Error("GEO Specialist is not registered in both public routes.");
}
if ((geoDatabase.match(/resource\(\{/g) ?? []).length !== 12) {
  throw new Error("GEO central learning database does not contain 12 resources.");
}
for (const required of [
  "const stageSpecs: StageSpec[]",
  "GEO Role Orientation and Evidence Standards",
  "Audience, Query, and Citation Intelligence",
  "Citation-Ready Content and Source Provenance",
  "GEO Measurement, Experiments, and Reporting",
  "International GEO Strategy and Capstone",
  "const journeyStages: CareerJourneyStage[]",
  "globalResources: Object.values(resources)",
]) {
  if (!geoCareer.includes(required)) throw new Error(`Dedicated GEO workspace is missing: ${required}`);
}
if (geoCareer.includes("const stages = [") || geoCareer.includes("base.journeyStages.map(mapStage)")) {
  throw new Error("GEO has regressed to the shared template-derived career file.");
}

for (const forbidden of ["AI Product Management Orientation", "Create a reviewable artifact that demonstrates", "practical mission 1", "Shape the future", "Unlock your potential"]) {
  if (career.includes(forbidden)) throw new Error(`Copied or placeholder terminology detected: ${forbidden}`);
}

const projectIds = [...career.matchAll(/id: "mcc-project-/g)].length;
const portfolioIds = [...career.matchAll(/id: "mcc-portfolio-/g)].length;
if (projectIds < 4) throw new Error("At least four Copilot-specific projects are required.");
if (portfolioIds < 4) throw new Error("At least four Copilot portfolio artifacts are required.");

console.log("Career content validated: corrected Copilot orientation, canonical switcher routes, dedicated GEO workspace, central learning formats, assessments, routing, and availability.");
