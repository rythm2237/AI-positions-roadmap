import fs from "node:fs";

const source = fs.readFileSync("src/data/careers/activation-batch-five.ts", "utf8");
const catalog = fs.readFileSync("src/data/careerCatalog.ts", "utf8");
const aliases = fs.readFileSync("src/data/careerTitleAliases.ts", "utf8");
const route = fs.readFileSync("src/app/careers/[slug]/page.tsx", "utf8");
const learningRoute = fs.readFileSync("src/app/careers/[slug]/learning/page.tsx", "utf8");

const careers = [
  ["ai-adoption-consultant", "aiAdoptionConsultantCareer", "AI Adoption Readiness Assessment"],
  ["microsoft-copilot-consultant", "microsoftCopilotConsultantCareer", "Copilot Studio Knowledge Agent"],
  ["ai-marketing-specialist", "aiMarketingSpecialistCareer", "AI Marketing Growth Capstone"],
  ["data-analyst", "dataAnalystCareer", "Decision Analytics Capstone"],
  ["data-scientist", "dataScientistCareer", "End-to-End Data Science Capstone"],
];

for (const [slug, exportName, representativeProject] of careers) {
  if (!source.includes(`export const ${exportName}`)) throw new Error(`${slug} export is missing.`);
  if (!source.includes(representativeProject)) throw new Error(`${slug} specialist content is missing.`);
  if (!catalog.includes(`"/careers/${slug}?entry=galaxy"`)) throw new Error(`${slug} is not active in Career Universe.`);
  if (!aliases.includes(`"${slug}"`)) throw new Error(`${slug} aliases are missing.`);
  if (!route.includes(`"${slug}"`)) throw new Error(`${slug} main route registry entry is missing.`);
  if (!learningRoute.includes(`"${slug}"`)) throw new Error(`${slug} learning route registry entry is missing.`);
}

for (const section of ["journeyStages", "roadmap", "projects", "portfolioTasks", "jobSearchTasks", "interviewPrep", "finalChallenge"]) {
  if (!source.includes(section)) throw new Error(`Shared complete-career factory is missing ${section}.`);
}

if (!route.includes("managed?.data") || !learningRoute.includes("managed?.data")) {
  throw new Error("Dynamic routes do not use the published-content fallback contract.");
}
if (!learningRoute.includes('initialSection="learning"')) {
  throw new Error("Dynamic learning route is not configured.");
}

console.log("AI Adoption Consultant, Microsoft Copilot Consultant, AI Marketing Specialist, Data Analyst, and Data Scientist validated: complete workspaces, assessments, aliases, routes, fallbacks, and Career Universe activation.");
