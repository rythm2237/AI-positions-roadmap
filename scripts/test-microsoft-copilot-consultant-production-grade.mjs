import fs from "node:fs";

const source = fs.readFileSync("src/data/careers/microsoft-copilot-consultant.ts", "utf8");

for (const token of [
  "https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-overview",
  "https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-setup",
  "https://learn.microsoft.com/en-us/training/paths/draft-analyze-present-microsoft-365-copilot/",
  "https://learn.microsoft.com/en-us/training/paths/create-extend-custom-copilots-microsoft-copilot-studio/",
  "https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio",
  "https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-tools-custom-agent",
  "https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-and-governance",
  "https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-overview",
  "https://learn.microsoft.com/en-us/credentials/applied-skills/build-an-agent-in-microsoft-copilot-studio/",
  'salary: "Market-dependent — see Career Intelligence for verified salary data"',
  'hiringDemand: "See Career Intelligence for current demand signals and title variants"',
  'lastUpdated: "2026-08-14"',
]) {
  if (!source.includes(token)) {
    throw new Error(`Missing Microsoft Copilot Consultant production requirement: ${token}`);
  }
}

for (const token of [
  '"https://learn.microsoft.com/en-us/copilot/"',
  '"https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-setup"',
  '"https://learn.microsoft.com/en-us/training/paths/get-started-with-microsoft-365-copilot/"',
  '"https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-plugin-actions"',
  'remoteAvailability: "Medium to High;',
  "youtube.com/",
  "youtu.be/",
]) {
  if (source.includes(token)) {
    throw new Error(`Forbidden Microsoft Copilot Consultant production token remains: ${token}`);
  }
}

if ((source.match(/provider: "Microsoft Learn"/g) ?? []).length < 1 && !source.includes('provider: "Microsoft Learn"')) {
  throw new Error("Microsoft Copilot Consultant must retain Microsoft Learn as the first-party learning provider.");
}

for (const section of ["journeyStages:", "roadmap:", "projects:", "globalResources:", "portfolioTasks:", "jobSearchTasks:", "interviewPrep:"]) {
  if (!source.includes(section)) {
    throw new Error(`Microsoft Copilot Consultant is missing required production section: ${section}`);
  }
}

console.log("Microsoft Copilot Consultant production baseline tests passed.");
