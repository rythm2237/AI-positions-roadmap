import fs from "node:fs";

const aliasesSource = fs.readFileSync("src/data/careerTitleAliases.ts", "utf8");
const landingSource = fs.readFileSync("src/components/landing/CareerAliasSearch.tsx", "utf8");
const heroSource = fs.readFileSync("src/components/career/CareerTitleAliasPanel.tsx", "utf8");
const validationSource = fs.readFileSync("src/lib/careerContentValidation.ts", "utf8");

for (const slug of [
  "ai-engineer",
  "ai-automation-specialist",
  "ai-integration-specialist",
]) {
  if (!aliasesSource.includes(`\"${slug}\"`)) {
    throw new Error(`Missing career alias registry entry for ${slug}.`);
  }
}

for (const expectedAlias of [
  "LLM Engineer",
  "Hyperautomation Specialist",
  "AI Integration Engineer",
]) {
  if (!aliasesSource.includes(expectedAlias)) {
    throw new Error(`Missing representative alias: ${expectedAlias}.`);
  }
}

if (!landingSource.includes("aliasSearchTerms")) {
  throw new Error("Landing career search is not alias-aware.");
}

if (!heroSource.includes("This career may also be advertised as")) {
  throw new Error("Career Hero alias panel is missing.");
}

if (!validationSource.includes("titleAliases must include at least one alternative job title.")) {
  throw new Error("Admin career content validation does not require title aliases.");
}

console.log(
  "Career title aliases validated for 3 active careers, landing search, Hero display, and Admin requirements."
);
