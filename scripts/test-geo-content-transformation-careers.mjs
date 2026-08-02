import fs from "node:fs";

const careers = [
  {
    slug: "generative-engine-optimization-specialist",
    exportName: "generativeEngineOptimizationSpecialistCareer",
    topics: ["Generative Search and Retrieval Foundations", "Entity Authority and Knowledge Architecture", "Citation-Ready Content Design", "Technical GEO and Discoverability", "Measurement, Experiments, and Reporting"],
  },
  {
    slug: "ai-content-strategist",
    exportName: "aiContentStrategistCareer",
    topics: ["Audience, Brand, and Content Discovery", "Content Strategy and Portfolio Architecture", "AI-Assisted Editorial Workflows", "Quality, Voice, and Responsible AI", "Measurement, Experimentation, and Optimization"],
  },
  {
    slug: "ai-transformation-consultant",
    exportName: "aiTransformationConsultantCareer",
    topics: ["Enterprise Discovery and Current-State Assessment", "AI Opportunity Portfolio and Value Prioritization", "Transformation Strategy and Target Operating Model", "Adoption, Change, and Workforce Enablement", "Roadmap, Delivery Governance, and Value Realization"],
  },
];

const catalog = fs.readFileSync("src/data/careerCatalog.ts", "utf8");
const aliases = fs.readFileSync("src/data/careerTitleAliases.ts", "utf8");

for (const career of careers) {
  const source = fs.readFileSync(`src/data/careers/${career.slug}.ts`, "utf8");
  const route = fs.readFileSync(`src/app/careers/${career.slug}/page.tsx`, "utf8");
  const learningRoute = fs.readFileSync(`src/app/careers/${career.slug}/learning/page.tsx`, "utf8");

  for (const section of ["journeyStages:", "roadmap:", "projects:", "portfolioTasks:", "jobSearchTasks:", "interviewPrep:", "finalChallenge:"]) {
    if (!source.includes(section)) throw new Error(`${career.slug} is missing ${section}`);
  }
  for (const topic of career.topics) {
    if (!source.includes(topic)) throw new Error(`${career.slug} is missing topic ${topic}`);
  }
  if (!source.includes(`export const ${career.exportName}`)) throw new Error(`${career.slug} export is missing.`);
  if (!catalog.includes(`"/careers/${career.slug}?entry=galaxy"`)) throw new Error(`${career.slug} is not active in Career Universe.`);
  if (!aliases.includes(`"${career.slug}"`)) throw new Error(`${career.slug} aliases are missing.`);
  if (!route.includes("publishedCareerRepository") || !route.includes("managed?.data")) throw new Error(`${career.slug} route lacks published-content fallback contract.`);
  if (!learningRoute.includes('initialSection="learning"')) throw new Error(`${career.slug} learning route is not configured.`);
}

console.log("GEO Specialist, AI Content Strategist, and AI Transformation Consultant validated: complete workspaces, assessments, routes, aliases, fallbacks, and Career Universe activation.");
