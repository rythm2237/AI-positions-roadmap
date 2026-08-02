import fs from "node:fs";

const catalog = fs.readFileSync("src/data/careerCatalog.ts", "utf8");

const auditedAvailable = [
  "ai-engineer",
  "ai-product-manager",
  "ai-automation-specialist",
  "intelligent-automation-engineer",
  "ai-workflow-architect",
  "ai-solutions-consultant",
  "cybersecurity-analyst",
];

const planned = [
  "microsoft-copilot-consultant",
  "ai-integration-specialist",
  "ai-transformation-consultant",
  "business-ai-consultant",
  "enterprise-ai-consultant",
  "ai-adoption-consultant",
  "data-analyst",
  "bi-developer",
  "data-engineer",
  "data-scientist",
  "ai-knowledge-engineer",
  "cloud-engineer",
  "devops-engineer",
  "generative-engine-optimization-specialist",
  "ai-marketing-specialist",
  "ai-content-strategist",
];

for (const slug of auditedAvailable) {
  if (!catalog.includes(`\"${slug}\"`) || !catalog.includes(`\"/careers/${slug}?entry=galaxy\"`)) {
    throw new Error(`${slug} should remain available in Career Universe.`);
  }
}

for (const slug of planned) {
  if (!catalog.includes(`\"${slug}\"`)) throw new Error(`${slug} is missing from the catalog.`);
  if (catalog.includes(`\"/careers/${slug}?entry=galaxy\"`)) {
    throw new Error(`${slug} should be visible but planned until its curriculum is independently audited.`);
  }
}

const availableCount = (catalog.match(/\"available\",\s*\"\\\/careers\\\//g) ?? []).length;
if (availableCount !== auditedAvailable.length) {
  throw new Error(`Expected ${auditedAvailable.length} audited available careers, found ${availableCount}.`);
}

console.log("Audited Career availability validated: 7 active, remaining template-based Careers planned.");
