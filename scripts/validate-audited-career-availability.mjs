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
  "enterprise-ai-consultant",
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

for (const slug of active) {
  if (!catalog.includes(`"${slug}"`) || !catalog.includes(`"/careers/${slug}`)) {
    throw new Error(`${slug} should be available in Career Universe.`);
  }
}

const availableCount = (catalog.match(/"available",\s*"\/careers\//g) ?? []).length;
if (availableCount !== active.length) {
  throw new Error(`Expected ${active.length} available Careers, found ${availableCount}.`);
}

if (/enterprise-ai-consultant[^\n]+planned/.test(catalog)) {
  throw new Error("Enterprise AI Consultant must not remain Planned.");
}

console.log("Career availability validated: 23 active Careers and no Coming Soon Careers.");
