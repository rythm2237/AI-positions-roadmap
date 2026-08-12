import fs from "node:fs";

const catalog = fs.readFileSync("src/data/careerCatalog.ts", "utf8");

const active = [
  "ai-engineer",
  "ai-product-manager",
  "ai-automation-specialist",
  "intelligent-automation-engineer",
  "microsoft-copilot-consultant",
  "ai-integration-specialist",
  "ai-workflow-architect",
  "ai-solutions-consultant",
  "ai-transformation-consultant",
  "business-ai-consultant",
  "ai-adoption-consultant",
  "data-analyst",
  "bi-developer",
  "data-engineer",
  "data-scientist",
  "ai-knowledge-engineer",
  "cloud-engineer",
  "devops-engineer",
  "cybersecurity-analyst",
  "generative-engine-optimization-specialist",
  "ai-marketing-specialist",
  "ai-content-strategist",
];
const planned = ["enterprise-ai-consultant"];

for (const slug of active) {
  if (!catalog.includes(`"${slug}"`) || !catalog.includes(`"/careers/${slug}`)) {
    throw new Error(`${slug} should remain available in Career Universe.`);
  }
}
for (const slug of planned) {
  if (!catalog.includes(`"${slug}"`)) throw new Error(`${slug} is missing from the catalog.`);
  if (catalog.includes(`"/careers/${slug}`)) throw new Error(`${slug} should remain Coming Soon.`);
}

const availableCount = (catalog.match(/"available",\s*"\/careers\//g) ?? []).length;
if (availableCount !== active.length) {
  throw new Error(`Expected ${active.length} available Careers, found ${availableCount}.`);
}

console.log("Career availability validated: 22 active Careers and one Coming Soon Career.");
