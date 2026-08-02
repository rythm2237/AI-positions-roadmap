import fs from "node:fs";

const source = fs.readFileSync("src/data/careers/activation-batch-seven.ts", "utf8");
const catalog = fs.readFileSync("src/data/careerCatalog.ts", "utf8");
const pageRoute = fs.readFileSync("src/app/careers/[slug]/page.tsx", "utf8");
const learningRoute = fs.readFileSync("src/app/careers/[slug]/learning/page.tsx", "utf8");
const aliasPatch = fs.readFileSync("scripts/patch-activation-batch-seven-aliases.mjs", "utf8");

const careers = [
  {
    slug: "cybersecurity-analyst",
    exportName: "cybersecurityAnalystCareer",
    topics: [
      "Security Monitoring and SIEM",
      "Detection Engineering and Threat Hunting",
      "Incident Response and Digital Evidence",
      "Vulnerability, Cloud, and Endpoint Security",
    ],
  },
  {
    slug: "cloud-engineer",
    exportName: "cloudEngineerCareer",
    topics: [
      "Identity, Networking, and Security",
      "Infrastructure as Code and Automation",
      "Containers and Cloud-Native Platforms",
      "Observability, Reliability, and Recovery",
    ],
  },
];

for (const career of careers) {
  for (const section of [
    "journeyStages,",
    "roadmap,",
    "projects:",
    "portfolioTasks:",
    "jobSearchTasks:",
    "interviewPrep:",
    "finalChallenge:",
  ]) {
    if (!source.includes(section)) throw new Error(`${career.slug} is missing ${section}`);
  }

  if (!source.includes(`export const ${career.exportName}`)) {
    throw new Error(`${career.slug} export is missing.`);
  }

  for (const topic of career.topics) {
    if (!source.includes(topic)) throw new Error(`${career.slug} is missing topic ${topic}`);
  }

  if (!catalog.includes(`"/careers/${career.slug}?entry=galaxy"`)) {
    throw new Error(`${career.slug} is not active in Career Universe.`);
  }

  if (!pageRoute.includes(`"${career.slug}"`)) {
    throw new Error(`${career.slug} is missing from the dynamic main route registry.`);
  }

  if (!learningRoute.includes(`"${career.slug}"`)) {
    throw new Error(`${career.slug} is missing from the dynamic learning route registry.`);
  }

  if (!aliasPatch.includes(`"${career.slug}": [`)) {
    throw new Error(`${career.slug} alias patch entry is missing.`);
  }
}

if (!learningRoute.includes('initialSection="learning"')) {
  throw new Error("Dynamic learning route is not configured for the Learning section.");
}

if (!pageRoute.includes("managed?.data ?? builtIn[slug] ?? null")) {
  throw new Error("Dynamic main route lacks the published-content fallback contract.");
}

console.log(
  "Cybersecurity Analyst and Cloud Engineer validated: complete workspaces, assessments, routes, aliases, fallbacks, and Career Universe activation."
);
