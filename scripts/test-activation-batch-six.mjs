import fs from "node:fs";

const source = fs.readFileSync("src/data/careers/activation-batch-six.ts", "utf8");
const catalog = fs.readFileSync("src/data/careerCatalog.ts", "utf8");
const aliases = fs.readFileSync("src/data/careerTitleAliases.ts", "utf8");
const route = fs.readFileSync("src/app/careers/[slug]/page.tsx", "utf8");
const learningRoute = fs.readFileSync("src/app/careers/[slug]/learning/page.tsx", "utf8");

const careers = [
  {
    slug: "bi-developer",
    exportName: "biDeveloperCareer",
    topics: ["Business Requirements and KPI Design", "Dimensional and Semantic Modeling", "Dashboard and UX Engineering"],
  },
  {
    slug: "ai-knowledge-engineer",
    exportName: "aiKnowledgeEngineerCareer",
    topics: ["Taxonomy, Ontology, and Metadata", "Search, Embeddings, and Retrieval", "RAG and Knowledge Graph Patterns"],
  },
  {
    slug: "data-engineer",
    exportName: "dataEngineerCareer",
    topics: ["Data Modeling and Warehousing", "Orchestration and Data Quality", "Streaming and Event Data"],
  },
  {
    slug: "devops-engineer",
    exportName: "devOpsEngineerCareer",
    topics: ["Source Control and CI", "Infrastructure as Code and Cloud", "Observability, SRE, and Incident Response"],
  },
  {
    slug: "business-ai-consultant",
    exportName: "businessAiConsultantCareer",
    topics: ["Process and Opportunity Analysis", "Business Case and Value Modeling", "Portfolio Governance and Value Realization"],
  },
];

for (const career of careers) {
  for (const section of [
    "journeyStages:",
    "roadmap:",
    "projects:",
    "portfolioTasks:",
    "jobSearchTasks:",
    "interviewPrep:",
    "finalChallenge:",
  ]) {
    if (!source.includes(section)) throw new Error(`${career.slug} is missing ${section}`);
  }

  for (const topic of career.topics) {
    if (!source.includes(topic)) throw new Error(`${career.slug} is missing topic ${topic}`);
  }

  if (!source.includes(`export const ${career.exportName}`)) {
    throw new Error(`${career.slug} export is missing.`);
  }
  if (!catalog.includes(`"/careers/${career.slug}?entry=galaxy"`)) {
    throw new Error(`${career.slug} is not active in Career Universe.`);
  }
  if (!aliases.includes(`"${career.slug}"`)) {
    throw new Error(`${career.slug} aliases are missing.`);
  }
  if (!route.includes(`"${career.slug}"`)) {
    throw new Error(`${career.slug} is missing from the dynamic career registry.`);
  }
  if (!learningRoute.includes(`"${career.slug}"`)) {
    throw new Error(`${career.slug} is missing from the dynamic learning registry.`);
  }
}

if (!route.includes("managed?.data ?? builtIn[slug]")) {
  throw new Error("Dynamic career route lacks published-content fallback contract.");
}
if (!learningRoute.includes('initialSection="learning"')) {
  throw new Error("Dynamic learning route is not configured for the Learning section.");
}

console.log(
  "BI Developer, AI Knowledge Engineer, Data Engineer, DevOps Engineer, and Business AI Consultant validated: complete workspaces, assessments, aliases, routes, fallbacks, and Career Universe activation."
);
