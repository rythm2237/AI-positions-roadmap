import fs from "node:fs";

const path = "src/data/careers/ai-automation-specialist.ts";
let source = fs.readFileSync(path, "utf8");

const replacements = [
  [
    'title: "Microsoft Power Automate Documentation",',
    'title: "Tutorial: Get started with cloud flows",',
  ],
  [
    '"Official guidance for cloud flows, desktop flows, connectors, process mining, governance, testing, and troubleshooting.",',
    '"Official hands-on tutorial that takes the learner through creating, testing, running, and inspecting a real cloud flow.",',
  ],
  [
    'url: "https://learn.microsoft.com/en-us/power-automate/",',
    'url: "https://learn.microsoft.com/en-us/power-automate/get-started-tutorial",',
  ],
  [
    'title: "Microsoft Copilot Studio Documentation",',
    'title: "Quickstart: Create and deploy an agent",',
  ],
  [
    '"Official guidance for building agents, connecting knowledge, adding tools, creating workflows, testing, analytics, and deployment.",',
    '"Official Copilot Studio quickstart for creating an agent, adding knowledge, testing it, and publishing it to a demo destination.",',
  ],
  [
    'url: "https://learn.microsoft.com/en-us/microsoft-copilot-studio/",',
    'url: "https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-get-started",',
  ],
  [
    'title: "OpenAI API Documentation",',
    'title: "OpenAI API: Using tools",',
  ],
  [
    '"Official reference for model integration, structured outputs, tool use, evaluation, safety, and production API patterns.",',
    '"Official OpenAI guide for connecting models to tools and building tool-enabled API workflows with current platform capabilities.",',
  ],
  [
    'url: "https://platform.openai.com/docs",',
    'url: "https://developers.openai.com/api/docs/guides/tools",',
  ],
  [
    'title: "n8n Documentation",',
    'title: "n8n Quickstart",',
  ],
  [
    '"Practical documentation for API-first workflow automation, AI nodes, branching, sub-workflows, credentials, and error handling.",',
    '"Direct n8n quickstart for building and running a first workflow before moving into API, AI, branching, credentials, and reliability patterns.",',
  ],
  [
    'url: "https://docs.n8n.io/",',
    'url: "https://docs.n8n.io/try-it-out/quickstart/",',
  ],
  [
    'title: "UiPath Documentation",',
    'title: "UiPath Studio Web Tutorials",',
  ],
  [
    '"Enterprise reference for RPA, document understanding, low-code agents, orchestration, queues, and human validation.",',
    '"Official step-by-step Studio Web tutorials for building practical API and automation workflows instead of browsing the full UiPath documentation catalog.",',
  ],
  [
    'url: "https://docs.uipath.com/",',
    'url: "https://docs.uipath.com/studio-web/automation-cloud/latest/user-guide/tutorials",',
  ],
  [
    'title: "Python Documentation",',
    'title: "The Python Tutorial",',
  ],
  [
    '"Canonical reference for scripting, data transformation, API clients, exception handling, and reusable automation utilities.",',
    '"Official Python tutorial covering the language foundations needed for scripting, transformations, API clients, exception handling, and reusable automation utilities.",',
  ],
  [
    'url: "https://docs.python.org/3/",',
    'url: "https://docs.python.org/3/tutorial/",',
  ],
  [
    'title: "GitHub Docs: Get Started",',
    'title: "GitHub Hello World",',
  ],
  [
    '"Official guidance for repositories, branches, pull requests, Actions, documentation, and professional portfolio presentation.",',
    '"Official guided exercise that walks through creating a repository, branch, commit, pull request, and merge without making the learner browse GitHub Docs.",',
  ],
  [
    'url: "https://docs.github.com/en/get-started",',
    'url: "https://docs.github.com/en/get-started/start-your-journey/hello-world",',
  ],
  [
    'title: "Postman Learning Center",',
    'title: "Postman quick start",',
  ],
  [
    '"Useful for testing APIs, inspecting authentication, documenting requests, validating responses, and debugging integrations.",',
    '"Official quickstart that sends a real API request, saves it to a collection, and adds a basic response test in Postman.",',
  ],
  [
    'url: "https://learning.postman.com/docs/",',
    'url: "https://learning.postman.com/docs/getting-started/quick-start/",',
  ],
  [
    'title: "Microsoft Learn: Power Automate Training",',
    'title: "Automate and extend your solutions with AI in Microsoft Power Automate",',
  ],
  [
    'estimatedTime: "20+ hours",',
    'estimatedTime: "Structured learning path",',
  ],
  [
    '"Structured learning modules for creating, managing, monitoring, and improving Microsoft Power Platform automations.",',
    '"Direct Microsoft Learn path focused on Power Automate workflows, Dataverse, approvals, and adding AI Builder prompts to business automation.",',
  ],
  [
    'url: "https://learn.microsoft.com/en-us/training/powerplatform/power-automate",',
    'url: "https://learn.microsoft.com/en-us/training/paths/automate-business-processes-power-automate/",',
  ],
  [
    'title: "OWASP GenAI Security Project",',
    'title: "OWASP LLM01:2025 Prompt Injection",',
  ],
  [
    '"Security guidance for prompt injection, sensitive information disclosure, excessive agency, insecure outputs, and other GenAI risks.",',
    '"Focused OWASP guidance on prompt injection risks and mitigations for AI-enabled automation and agent workflows.",',
  ],
  [
    'url: "https://genai.owasp.org/",',
    'url: "https://genai.owasp.org/llmrisk/llm01-prompt-injection/",',
  ],
  [
    'salary: "$80,000-$180,000+ depending on market, scope, and seniority",',
    'salary: "Market-dependent — see Career Intelligence for verified salary data",',
  ],
  [
    'hiringDemand: "High and expanding across operations, consulting, IT, and digital transformation",',
    'hiringDemand: "See Career Intelligence for current demand signals",',
  ],
  [
    'remoteAvailability: "Very Good",',
    'remoteAvailability: "Varies by employer, seniority, location, and operating model",',
  ],
  [
    'aiCompatibilityScore: "9.7 / 10",',
    'aiCompatibilityScore: "Not scored — role definition is AI-automation-native",',
  ],
  [
    'lastUpdated: "July 2026",',
    'lastUpdated: "August 2026",',
  ],
];

for (const [from, to] of replacements) {
  if (!source.includes(from)) {
    throw new Error(`AI Automation Specialist production patch target not found: ${from}`);
  }
  source = source.replace(from, to);
}

const forbidden = [
  "https://learn.microsoft.com/en-us/power-automate/\"",
  "https://learn.microsoft.com/en-us/microsoft-copilot-studio/\"",
  "https://platform.openai.com/docs\"",
  "https://docs.n8n.io/\"",
  "https://docs.uipath.com/\"",
  "https://docs.python.org/3/\"",
  "https://docs.github.com/en/get-started\"",
  "https://learning.postman.com/docs/\"",
  "https://learn.microsoft.com/en-us/training/powerplatform/power-automate\"",
  "https://genai.owasp.org/\"",
  "$80,000-$180,000+",
  "9.7 / 10",
];

for (const token of forbidden) {
  if (source.includes(token)) {
    throw new Error(`AI Automation Specialist still contains a generic or unsupported production token: ${token}`);
  }
}

fs.writeFileSync(path, source);
console.log("AI Automation Specialist hardened: deep-linked first-party resources and evidence-safe market claims applied.");
