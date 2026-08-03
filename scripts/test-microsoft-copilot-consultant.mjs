import fs from "node:fs";

const career = fs.readFileSync("src/data/careers/microsoft-copilot-consultant.ts", "utf8");
const catalog = fs.readFileSync("src/data/careerCatalog.ts", "utf8");
const mainRoute = fs.readFileSync("src/app/careers/[slug]/page.tsx", "utf8");
const learningRoute = fs.readFileSync("src/app/careers/[slug]/learning/page.tsx", "utf8");

const requiredSections = [
  "journeyStages:",
  "roadmap:",
  "projects:",
  "globalResources:",
  "readiness:",
  "portfolioTasks:",
  "jobSearchTasks:",
  "interviewPrep:",
  "finalChallenge:",
];
for (const section of requiredSections) {
  if (!career.includes(section)) throw new Error(`Missing Copilot career section: ${section}`);
}

const requiredTopics = [
  "Microsoft 365 Copilot Readiness and Use-Case Discovery",
  "Microsoft 365 Copilot Experience and Prompt Enablement",
  "Copilot Studio Agent Design",
  "Knowledge, Grounding, and Information Architecture",
  "Actions, Power Automate, Connectors, and Dataverse",
  "Security, Data Protection, Governance, and ALM",
  "Testing, Evaluation, Analytics, and Reliability",
  "Deployment, Adoption, Change, and Value Realization",
  "Copilot Consulting Capstone and Career Positioning",
];
for (const topic of requiredTopics) {
  if (!career.includes(topic)) throw new Error(`Missing Copilot-specific topic: ${topic}`);
}

if (!catalog.includes('"microsoft-copilot-consultant"') || !catalog.includes('"available", "/careers/microsoft-copilot-consultant?entry=galaxy"')) {
  throw new Error("Microsoft Copilot Consultant is not available in the Career Universe.");
}
if (!mainRoute.includes('from "@/data/careers/microsoft-copilot-consultant"')) {
  throw new Error("Main career route does not use the dedicated Copilot workspace.");
}
if (!learningRoute.includes('from "@/data/careers/microsoft-copilot-consultant"')) {
  throw new Error("Learning route does not use the dedicated Copilot workspace.");
}

const stageIds = [...career.matchAll(/id: `mcc-stage-\$\{index \+ 1\}`/g)];
if (stageIds.length !== 1) throw new Error("Stable Copilot stage ID mapping is missing.");
if (!career.includes('topicAssessments: [0, 1, 2]')) throw new Error("Topic assessments are missing.");
if (!career.includes('phaseExam: makeAssessment(index, "comprehensive")')) throw new Error("Comprehensive stage assessments are missing.");
if (!career.includes('cost: "Free"') || !career.includes('provider: "Microsoft Learn"')) {
  throw new Error("Official free Microsoft resources are not declared.");
}

for (const forbidden of [
  "AI Product Management Orientation",
  "Customer Discovery and Problem Framing",
  "Create a reviewable artifact that demonstrates",
  "practical mission 1",
  "Shape the future",
  "Unlock your potential",
]) {
  if (career.includes(forbidden)) throw new Error(`Copied or placeholder terminology detected: ${forbidden}`);
}

const projectIds = [...career.matchAll(/id: "mcc-project-/g)].length;
const portfolioIds = [...career.matchAll(/id: "mcc-portfolio-/g)].length;
const interviewQuestions = career.split("questions: [")[1]?.split("],")[0]?.match(/"[^"]+"/g)?.length ?? 0;
if (projectIds < 4) throw new Error("At least four Copilot-specific projects are required.");
if (portfolioIds < 4) throw new Error("At least four portfolio artifacts are required.");
if (interviewQuestions < 12) throw new Error("Interview preparation is too thin.");

console.log("Microsoft Copilot Consultant workspace validated: dedicated content, learning, assessments, projects, portfolio, jobs, interview, routing, and availability.");
