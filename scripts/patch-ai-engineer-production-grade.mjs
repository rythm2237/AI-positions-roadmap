import fs from "node:fs";

const path = "src/data/careers/ai-engineer.ts";
let source = fs.readFileSync(path, "utf8");

const youtubeResource = `  freeCodeCampPython: {
    id: "journey-fcc-python",
    title: "Python Full Course",
    type: "Video" as const,
    provider: "freeCodeCamp",
    cost: "Free" as const,
    estimatedTime: "4 hours",
    whyUseful: "A practical free refresher for Python syntax, functions, and beginner project habits.",
    url: "https://www.youtube.com/@freecodecamp",
    priority: "Recommended" as const,
  },`;

const officialPythonResource = `  pythonTutorial: {
    id: "journey-python-tutorial",
    title: "The Python Tutorial",
    type: "Documentation" as const,
    provider: "Python Software Foundation",
    cost: "Free" as const,
    estimatedTime: "6-10 hours",
    whyUseful: "Official Python documentation covering syntax, control flow, data structures, functions, modules, classes, and practical language fundamentals.",
    url: "https://docs.python.org/3/tutorial/",
    priority: "Recommended" as const,
  },`;

if (!source.includes(youtubeResource)) {
  throw new Error("AI Engineer direct-YouTube Python resource block was not found.");
}
source = source.replace(youtubeResource, officialPythonResource);
source = source.replaceAll("officialResources.freeCodeCampPython", "officialResources.pythonTutorial");

const replacements = [
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
  source = source.replace(from, to);
}

if (source.includes("youtube.com/") || source.includes("youtu.be/")) {
  throw new Error("AI Engineer still contains a direct YouTube learning-resource URL.");
}

fs.writeFileSync(path, source);
console.log("AI Engineer production content hardened: official Python source, evidence-safe market claims, and transparent jobs messaging applied.");
