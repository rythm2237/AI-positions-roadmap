import fs from "node:fs";

const path = "src/data/careers/microsoft-copilot-consultant.ts";
let source = fs.readFileSync(path, "utf8");

const replacements = [
  [
    'official("mcc-role-overview", "Microsoft Copilot documentation", "Documentation", "60-90 minutes", "Establishes the official product landscape and terminology before solution design.", "https://learn.microsoft.com/en-us/copilot/")',
    'official("mcc-role-overview", "Microsoft 365 Copilot overview", "Documentation", "45-60 minutes", "Establishes the current Microsoft 365 Copilot product model, grounding behavior, app integration, and terminology before solution design.", "https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-overview")',
  ],
  [
    'official("mcc-m365-readiness", "Prepare for Microsoft 365 Copilot", "Learning Path", "3-5 hours", "Provides official guidance for technical and organizational preparation before deployment.", "https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-setup")',
    'official("mcc-m365-readiness", "Set up Microsoft 365 Copilot and assign licenses", "Documentation", "2-3 hours", "Provides current Microsoft guidance for readiness, security controls, licensing, pilot preparation, deployment, and adoption measurement.", "https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-setup")',
  ],
  [
    'official("mcc-m365-use", "Get started with Microsoft 365 Copilot", "Learning Path", "4-6 hours", "Provides official app-level learning for practical workplace scenarios and responsible use.", "https://learn.microsoft.com/en-us/training/paths/get-started-with-microsoft-365-copilot/")',
    'official("mcc-m365-use", "Draft, analyze, and present with Microsoft 365 Copilot", "Learning Path", "Structured learning path", "Provides the current Microsoft Learn path for practical Copilot workflows across Microsoft 365 apps, work-grounded data, prompting, and responsible use.", "https://learn.microsoft.com/en-us/training/paths/draft-analyze-present-microsoft-365-copilot/")',
  ],
  [
    'official("mcc-agent-build", "Create and manage agents in Copilot Studio", "Learning Path", "5-7 hours", "Covers the official agent creation workflow, core components, testing, and publishing concepts.", "https://learn.microsoft.com/en-us/training/paths/create-extend-custom-copilots-microsoft-copilot-studio/")',
    'official("mcc-agent-build", "Create agents in Microsoft Copilot Studio", "Learning Path", "Structured learning path", "Covers the current Microsoft Learn path for agent creation, topics, knowledge, structured automation, testing, and publishing concepts.", "https://learn.microsoft.com/en-us/training/paths/create-extend-custom-copilots-microsoft-copilot-studio/")',
  ],
  [
    'official("mcc-actions", "Use tools with agents in Copilot Studio", "Documentation", "3-4 hours", "Provides official guidance for connecting agents to actions, connectors, flows, and external capabilities.", "https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-plugin-actions")',
    'official("mcc-actions", "Add tools to custom agents", "Documentation", "2-3 hours", "Provides current Microsoft guidance for connecting agents to tools, connectors, flows, and external systems with controlled execution.", "https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-tools-custom-agent")',
  ],
  [
    'salary: "Varies by country, consulting seniority, Microsoft platform depth, delivery responsibility, and employer type",',
    'salary: "Market-dependent — see Career Intelligence for verified salary data",',
  ],
  [
    'hiringDemand: "Role titles and demand vary across Microsoft partners, consultancies, systems integrators, managed-service providers, and enterprise digital-workplace teams",',
    'hiringDemand: "See Career Intelligence for current demand signals and title variants",',
  ],
  [
    'remoteAvailability: "Medium to High; discovery, design, build, and support can be remote, while workshops and rollout activities are often hybrid",',
    'remoteAvailability: "Varies by employer, consulting model, client location, workshop requirements, and delivery responsibility",',
  ],
  [
    'aiCompatibilityScore: "High: the role works directly with AI systems but remains accountable for discovery, architecture, governance, adoption, and professional judgment",',
    'aiCompatibilityScore: "Not scored — the role is AI-native and remains accountable for discovery, architecture, governance, adoption, and professional judgment",',
  ],
  [
    'lastUpdated: "2026-08-03",',
    'lastUpdated: "2026-08-14",',
  ],
];

for (const [from, to] of replacements) {
  if (!source.includes(from)) {
    throw new Error(`Microsoft Copilot Consultant production patch target not found: ${from}`);
  }
  source = source.replace(from, to);
}

for (const token of [
  '"https://learn.microsoft.com/en-us/copilot/"',
  '"https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-setup"',
  '"https://learn.microsoft.com/en-us/training/paths/get-started-with-microsoft-365-copilot/"',
  '"https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-plugin-actions"',
  'remoteAvailability: "Medium to High;',
]) {
  if (source.includes(token)) {
    throw new Error(`Microsoft Copilot Consultant still contains a legacy or unsupported production token: ${token}`);
  }
}

fs.writeFileSync(path, source);
console.log("Microsoft Copilot Consultant hardened: current canonical Microsoft learning destinations and evidence-safe market claims applied.");
