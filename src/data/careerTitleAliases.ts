import type { CareerWorkspaceData } from "@/types/careerWorkspace";

export interface CareerTitleAlias {
  title: string;
  countries?: string[];
  companies?: string[];
  keywords?: string[];
  note?: string;
}

export const CAREER_TITLE_ALIASES: Readonly<Record<string, readonly CareerTitleAlias[]>> = {
  "ai-engineer": [
    { title: "Machine Learning Engineer", keywords: ["ML Engineer", "production ML"] },
    { title: "Applied AI Engineer", keywords: ["Applied AI", "AI applications"] },
    { title: "Generative AI Engineer", keywords: ["GenAI Engineer", "Generative AI Developer"] },
    { title: "LLM Engineer", keywords: ["Large Language Model Engineer"] },
    { title: "AI Software Engineer", keywords: ["AI Developer", "AI Application Engineer"] },
    { title: "Applied Machine Learning Engineer", keywords: ["Applied ML Engineer"] },
  ],
  "ai-automation-specialist": [
    { title: "Intelligent Automation Specialist", keywords: ["AI Automation Specialist"] },
    { title: "AI Workflow Specialist", keywords: ["AI Workflow Automation Specialist"] },
    { title: "Automation Solutions Specialist", keywords: ["Automation Solution Specialist"] },
    { title: "Business Automation Specialist", keywords: ["Business Process Automation Specialist"] },
    { title: "Power Platform Automation Specialist", companies: ["Microsoft ecosystem"] },
    { title: "Automation Consultant", keywords: ["Digital Automation Consultant"] },
  ],
  "intelligent-automation-engineer": [
    {
      title: "Intelligent Automation Developer",
      keywords: ["Intelligent Automation Programmer", "IA Developer"],
      note: "Common delivery-focused title for engineers building RPA, workflow, integration, and AI solutions.",
    },
    {
      title: "Hyperautomation Engineer",
      keywords: ["Hyperautomation Developer", "Hyperautomation Specialist"],
      note: "Often used where process mining, orchestration, RPA, APIs, and AI are delivered as one automation capability.",
    },
    {
      title: "RPA Engineer",
      keywords: ["Robotic Process Automation Engineer", "RPA Developer"],
      note: "May describe the same role when desktop automation remains the dominant delivery platform.",
    },
    {
      title: "Process Automation Engineer",
      keywords: ["Business Process Automation Engineer", "Digital Process Automation Engineer"],
    },
    {
      title: "Automation Engineer",
      keywords: ["Enterprise Automation Engineer", "Business Automation Engineer"],
      note: "Read the responsibilities carefully because this title can also refer to industrial or test automation.",
    },
    {
      title: "Automation Solutions Engineer",
      keywords: ["Automation Solution Engineer", "Intelligent Automation Solutions Engineer"],
    },
    {
      title: "Workflow Automation Engineer",
      keywords: ["Workflow Engineer", "Digital Workflow Engineer"],
    },
    {
      title: "Intelligent Process Automation Engineer",
      keywords: ["IPA Engineer", "Cognitive Automation Engineer"],
    },
    {
      title: "Automation Platform Engineer",
      keywords: ["RPA Platform Engineer", "Automation Infrastructure Engineer"],
      note: "More common when the position includes platform operations, environments, governance, and release engineering.",
    },
    {
      title: "UiPath Developer",
      companies: ["UiPath ecosystem"],
      keywords: ["UiPath Automation Developer", "UiPath Engineer"],
    },
    {
      title: "Power Automate Developer",
      companies: ["Microsoft ecosystem"],
      keywords: ["Microsoft Power Platform Developer", "Power Platform Automation Engineer"],
    },
  ],
  "ai-integration-specialist": [
    { title: "AI Integration Engineer", keywords: ["AI Integrations Engineer"] },
    { title: "Generative AI Integration Engineer", keywords: ["GenAI Integration Engineer"] },
    { title: "LLM Integration Engineer", keywords: ["Large Language Model Integration Engineer"] },
    { title: "AI API Integration Specialist", keywords: ["AI API Engineer"] },
    { title: "AI Solutions Integration Engineer", keywords: ["AI Solution Integration Specialist"] },
    { title: "AI Application Integration Engineer", keywords: ["AI Applications Integrator"] },
    { title: "AI Systems Integrator", keywords: ["AI System Integration Specialist"] },
    { title: "Conversational AI Integration Specialist", keywords: ["Chatbot Integration Engineer"] },
  ],
};

export function normalizeCareerTitle(value: string): string {
  return value
    .toLocaleLowerCase("en")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getDefaultCareerTitleAliases(slug: string): CareerTitleAlias[] {
  return [...(CAREER_TITLE_ALIASES[slug] ?? [])].map((alias) => ({
    ...alias,
    countries: alias.countries ? [...alias.countries] : undefined,
    companies: alias.companies ? [...alias.companies] : undefined,
    keywords: alias.keywords ? [...alias.keywords] : undefined,
  }));
}

export function getCareerTitleAliases(
  career: Pick<CareerWorkspaceData, "slug" | "titleAliases">
): CareerTitleAlias[] {
  return career.titleAliases?.length
    ? career.titleAliases
    : getDefaultCareerTitleAliases(career.slug);
}

export function applyCareerTitleAliasPolicy(
  career: CareerWorkspaceData
): CareerWorkspaceData {
  const aliases = getCareerTitleAliases(career);
  return aliases.length ? { ...career, titleAliases: aliases } : career;
}

export function aliasSearchTerms(
  canonicalTitle: string,
  aliases: readonly CareerTitleAlias[]
): string[] {
  return [
    canonicalTitle,
    ...aliases.flatMap((alias) => [
      alias.title,
      ...(alias.keywords ?? []),
      ...(alias.countries ?? []),
      ...(alias.companies ?? []),
    ]),
  ];
}
