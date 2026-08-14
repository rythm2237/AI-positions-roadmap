import fs from "node:fs";

const careerSource = fs.readFileSync("src/data/careers/intelligent-automation-engineer.ts", "utf8");
const sharedAutomationSource = fs.readFileSync("src/data/careers/ai-automation-specialist.ts", "utf8");

for (const token of [
  'salary: "Market-dependent — see Career Intelligence for verified salary data"',
  'hiringDemand: "See Career Intelligence for current demand signals"',
  'remoteAvailability: "Varies by employer, seniority, location, client environment, and operating model"',
  'aiCompatibilityScore: "Not scored — role definition is intelligent-automation-native"',
  'lastUpdated: "2026-08-14"',
  'slug: "intelligent-automation-engineer"',
  'title: "Intelligent Automation Engineer"',
]) {
  if (!careerSource.includes(token)) {
    throw new Error(`Missing Intelligent Automation Engineer production requirement: ${token}`);
  }
}

for (const token of [
  'hiringDemand: "Strong in enterprise operations',
  'remoteAvailability: "Medium to High"',
  'aiCompatibilityScore: "95%"',
  "youtube.com/",
  "youtu.be/",
]) {
  if (careerSource.includes(token)) {
    throw new Error(`Forbidden Intelligent Automation Engineer production token remains: ${token}`);
  }
}

// This Career intentionally extends the AI Automation Specialist learning-resource foundation.
// The shared source must therefore already have passed the direct-destination hardening gate.
for (const url of [
  "https://learn.microsoft.com/en-us/power-automate/get-started-tutorial",
  "https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-get-started",
  "https://developers.openai.com/api/docs/guides/tools",
  "https://docs.uipath.com/studio-web/automation-cloud/latest/user-guide/tutorials",
  "https://learning.postman.com/docs/getting-started/quick-start/",
]) {
  if (!sharedAutomationSource.includes(url)) {
    throw new Error(`Shared direct learning destination is missing for Intelligent Automation Engineer: ${url}`);
  }
}

for (const section of [
  "stageContent",
  "roadmapContent",
  "projects:",
  "portfolioTasks:",
  "jobSearchTasks:",
  "interviewPrep:",
]) {
  if (!careerSource.includes(section)) {
    throw new Error(`Intelligent Automation Engineer is missing required production section: ${section}`);
  }
}

console.log("Intelligent Automation Engineer production baseline tests passed.");
