import fs from "node:fs";

const path = "src/data/careers/ai-engineer.ts";
let source = fs.readFileSync(path, "utf8");

const replacements = [
  ["  freeCodeCampPython: {", "  pythonTutorial: {"],
  ["    id: \"journey-fcc-python\",", "    id: \"journey-python-tutorial\","],
  ["    title: \"Python Full Course\",", "    title: \"The Python Tutorial\","],
  ["    type: \"Video\" as const,", "    type: \"Documentation\" as const,"],
  ["    provider: \"freeCodeCamp\",", "    provider: \"Python Software Foundation\","],
  ["    estimatedTime: \"4 hours\",", "    estimatedTime: \"6-10 hours\","],
  ["    whyUseful: \"A practical free refresher for Python syntax, functions, and beginner project habits.\",", "    whyUseful: \"Official Python documentation covering syntax, control flow, data structures, functions, modules, classes, and practical language fundamentals.\","],
  ["    url: \"https://www.youtube.com/@freecodecamp\",", "    url: \"https://docs.python.org/3/tutorial/\","],
  ["officialResources.freeCodeCampPython", "officialResources.pythonTutorial"],
  ["  salary: \"$95,000-$260,000+\",", "  salary: \"Market-dependent — see Career Intelligence for verified salary data\","],
  ["  hiringDemand: \"Very High\",", "  hiringDemand: \"See Career Intelligence for current demand signals\","],
  ["  remoteAvailability: \"Excellent\",", "  remoteAvailability: \"Varies by employer, seniority, and location\","],
  ["  aiCompatibilityScore: \"9.8 / 10\",", "  aiCompatibilityScore: \"Not scored — role definition is AI-native\","],
  ["    { label: \"Market signal\", value: \"Rising\", detail: \"LLM, agent, RAG, and production AI roles continue to expand.\" },", "    { label: \"Market signal\", value: \"Live data\", detail: \"Use Career Intelligence for current demand, salary, geography, and occupation-mapping evidence.\" },"],
  ["    { id: \"jobs\", label: \"Jobs\", eyebrow: \"Market\", summary: \"Live vacancy integration placeholder with job board filters.\", x: 1040, y: 650 },", "    { id: \"jobs\", label: \"Jobs\", eyebrow: \"Market\", summary: \"Job-search system and vacancy integration status with transparent availability messaging.\", x: 1040, y: 650 },"],
];

for (const [from, to] of replacements) {
  if (!source.includes(from)) {
    throw new Error(`AI Engineer production patch target not found: ${from}`);
  }
  source = source.replaceAll(from, to);
}

if (/https?:\\/\\/(?:www\\.)?youtube\\.com/i.test(source) || /https?:\\/\\/youtu\\.be/i.test(source)) {
  throw new Error("AI Engineer still contains a direct YouTube learning-resource URL.");
}

fs.writeFileSync(path, source);
console.log("AI Engineer production content hardened: official Python source, evidence-safe market claims, and transparent jobs messaging applied.");
