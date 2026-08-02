import fs from "node:fs";

const aliasesSource = fs.readFileSync("src/data/careerTitleAliases.ts", "utf8");
const landingSource = fs.readFileSync("src/components/search/CareerSearch.tsx", "utf8");
const heroSource = fs.readFileSync("src/components/career/CareerTitleAliasPanel.tsx", "utf8");
const migrationSource = fs.readFileSync("scripts/patch-career-title-aliases.mjs", "utf8");

for (const slug of [
  "ai-engineer",
  "ai-product-manager",
  "ai-automation-specialist",
  "intelligent-automation-engineer",
  "ai-integration-specialist",
  "ai-workflow-architect",
  "ai-solutions-consultant",
  "generative-engine-optimization-specialist",
  "ai-content-strategist",
  "ai-transformation-consultant",
  "ai-adoption-consultant",
  "microsoft-copilot-consultant",
  "ai-marketing-specialist",
  "data-analyst",
  "data-scientist",
]) {
  if (!aliasesSource.includes(`\"${slug}\"`)) {
    throw new Error(`Missing career alias registry entry for ${slug}.`);
  }
}

for (const expectedAlias of [
  "LLM Engineer",
  "Machine Learning Product Manager",
  "Hyperautomation Engineer",
  "AI Integration Engineer",
  "Agentic Workflow Architect",
  "Generative AI Consultant",
  "Answer Engine Optimization Specialist",
  "AI Content Architect",
  "AI Transformation Advisor",
  "AI Change Management Consultant",
  "Microsoft 365 Copilot Consultant",
  "Generative AI Marketing Specialist",
  "Business Data Analyst",
  "Applied Data Scientist",
]) {
  if (!aliasesSource.includes(expectedAlias)) {
    throw new Error(`Missing representative alias: ${expectedAlias}.`);
  }
}

if (!landingSource.includes("aliasSearchTerms")) throw new Error("Navigation career search is not alias-aware.");
if (!heroSource.includes("This career may also be advertised as")) throw new Error("Career Hero alias panel is missing.");
if (!migrationSource.includes("titleAliases must include at least one alternative job title.")) throw new Error("Admin career validation does not require title aliases.");
if (!migrationSource.includes("CareerTitleAliasPanel career={career}")) throw new Error("Career Hero migration does not insert the alias panel.");

console.log("Career title aliases validated for 15 active careers, navigation search, Hero display, and Admin requirements.");
