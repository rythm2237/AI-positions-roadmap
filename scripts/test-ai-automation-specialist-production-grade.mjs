import fs from "node:fs";

const source = fs.readFileSync("src/data/careers/ai-automation-specialist.ts", "utf8");

const required = [
  "https://learn.microsoft.com/en-us/power-automate/get-started-tutorial",
  "https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-get-started",
  "https://developers.openai.com/api/docs/guides/tools",
  "https://docs.n8n.io/try-it-out/quickstart/",
  "https://docs.uipath.com/studio-web/automation-cloud/latest/user-guide/tutorials",
  "https://docs.python.org/3/tutorial/",
  "https://docs.github.com/en/get-started/start-your-journey/hello-world",
  "https://learning.postman.com/docs/getting-started/quick-start/",
  "https://learn.microsoft.com/en-us/training/paths/automate-business-processes-power-automate/",
  "https://genai.owasp.org/llmrisk/llm01-prompt-injection/",
  'salary: "Market-dependent — see Career Intelligence for verified salary data"',
  'hiringDemand: "See Career Intelligence for current demand signals"',
  'remoteAvailability: "Varies by employer, seniority, location, and operating model"',
  'aiCompatibilityScore: "Not scored — role definition is AI-automation-native"',
  'lastUpdated: "August 2026"',
];

for (const token of required) {
  if (!source.includes(token)) {
    throw new Error(`Missing AI Automation Specialist production requirement: ${token}`);
  }
}

const forbidden = [
  'url: "https://learn.microsoft.com/en-us/power-automate/"',
  'url: "https://learn.microsoft.com/en-us/microsoft-copilot-studio/"',
  'url: "https://platform.openai.com/docs"',
  'url: "https://docs.n8n.io/"',
  'url: "https://docs.uipath.com/"',
  'url: "https://docs.python.org/3/"',
  'url: "https://docs.github.com/en/get-started"',
  'url: "https://learning.postman.com/docs/"',
  'url: "https://learn.microsoft.com/en-us/training/powerplatform/power-automate"',
  'url: "https://genai.owasp.org/"',
  "$80,000-$180,000+",
  "Very Good",
  "9.7 / 10",
  "youtube.com/",
  "youtu.be/",
];

for (const token of forbidden) {
  if (source.includes(token)) {
    throw new Error(`Forbidden AI Automation Specialist production token remains: ${token}`);
  }
}

const stageCount = (source.match(/\n    \{\n      id: "/g) ?? []).length;
if (stageCount < 8) {
  throw new Error(`AI Automation Specialist journey appears unexpectedly shallow; found ${stageCount} stage-like blocks.`);
}

for (const section of ["projects:", "portfolioTasks:", "jobSearchTasks:", "interviewPrep:", "finalChallenge:"]) {
  if (!source.includes(section)) {
    throw new Error(`AI Automation Specialist is missing required production section: ${section}`);
  }
}

console.log("AI Automation Specialist production baseline tests passed.");
