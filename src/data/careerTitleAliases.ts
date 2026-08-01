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
  "ai-product-manager": [
    { title: "Machine Learning Product Manager", keywords: ["ML Product Manager", "Machine Learning PM"] },
    { title: "Generative AI Product Manager", keywords: ["GenAI Product Manager", "Generative AI PM"] },
    { title: "AI Technical Product Manager", keywords: ["Technical Product Manager AI", "Technical AI Product Manager"] },
    { title: "AI Platform Product Manager", keywords: ["AI Platform PM", "Machine Learning Platform Product Manager"] },
    { title: "Data and AI Product Manager", keywords: ["Data AI Product Manager", "Data Product Manager AI"] },
    { title: "Applied AI Product Manager", keywords: ["Applied AI PM", "AI Applications Product Manager"] },
    { title: "AI Product Lead", keywords: ["Head of AI Product", "AI Product Owner"] },
    { title: "Conversational AI Product Manager", keywords: ["Chatbot Product Manager", "Conversational AI PM"] },
    { title: "AI Solutions Product Manager", keywords: ["AI Solution Product Manager", "Enterprise AI Product Manager"] },
    { title: "Intelligent Products Manager", keywords: ["Intelligent Product Manager", "Cognitive Product Manager"] },
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
    { title: "Intelligent Automation Developer", keywords: ["Intelligent Automation Programmer", "IA Developer"] },
    { title: "Hyperautomation Engineer", keywords: ["Hyperautomation Developer", "Hyperautomation Specialist"] },
    { title: "RPA Engineer", keywords: ["Robotic Process Automation Engineer", "RPA Developer"] },
    { title: "Process Automation Engineer", keywords: ["Business Process Automation Engineer", "Digital Process Automation Engineer"] },
    { title: "Automation Engineer", keywords: ["Enterprise Automation Engineer", "Business Automation Engineer"] },
    { title: "Automation Solutions Engineer", keywords: ["Automation Solution Engineer", "Intelligent Automation Solutions Engineer"] },
    { title: "Workflow Automation Engineer", keywords: ["Workflow Engineer", "Digital Workflow Engineer"] },
    { title: "Intelligent Process Automation Engineer", keywords: ["IPA Engineer", "Cognitive Automation Engineer"] },
    { title: "Automation Platform Engineer", keywords: ["RPA Platform Engineer", "Automation Infrastructure Engineer"] },
    { title: "UiPath Developer", companies: ["UiPath ecosystem"], keywords: ["UiPath Automation Developer", "UiPath Engineer"] },
    { title: "Power Automate Developer", companies: ["Microsoft ecosystem"], keywords: ["Microsoft Power Platform Developer", "Power Platform Automation Engineer"] },
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
  "ai-workflow-architect": [
    { title: "AI Workflow Solution Architect", keywords: ["AI Workflow Solutions Architect", "AI Process Solution Architect"] },
    { title: "Agentic Workflow Architect", keywords: ["Agent Workflow Architect", "Agentic Process Architect"] },
    { title: "AI Orchestration Architect", keywords: ["Agent Orchestration Architect", "AI Process Orchestration Architect"] },
    { title: "Intelligent Workflow Architect", keywords: ["Intelligent Process Architect", "Cognitive Workflow Architect"] },
    { title: "Automation Solution Architect", keywords: ["Automation Solutions Architect", "Intelligent Automation Architect"] },
    { title: "Enterprise Workflow Architect", keywords: ["Business Workflow Architect", "Digital Workflow Architect"] },
    { title: "Human-AI Workflow Architect", keywords: ["Human AI Collaboration Architect", "Human-in-the-Loop Architect"] },
    { title: "AI Process Architect", keywords: ["AI Business Process Architect", "AI-Enabled Process Architect"] },
    { title: "Agentic Systems Architect", keywords: ["AI Agent Systems Architect", "Multi-Agent Systems Architect"] },
    { title: "Workflow Automation Architect", keywords: ["Process Automation Architect", "Automation Workflow Architect"] },
  ],
  "ai-solutions-consultant": [
    {
      title: "Generative AI Consultant",
      keywords: ["GenAI Consultant", "Generative AI Solutions Consultant"],
      note: "Common where the consulting portfolio focuses on generative AI use cases and adoption.",
    },
    {
      title: "AI Solution Consultant",
      keywords: ["Artificial Intelligence Solution Consultant", "AI Solutions Advisor"],
    },
    {
      title: "AI Advisory Consultant",
      keywords: ["AI Advisor", "Artificial Intelligence Advisory Consultant"],
    },
    {
      title: "AI Strategy Consultant",
      keywords: ["Artificial Intelligence Strategy Consultant", "GenAI Strategy Consultant"],
    },
    {
      title: "AI Presales Consultant",
      keywords: ["AI Pre-Sales Consultant", "AI Sales Engineer", "AI Solutions Engineer"],
      note: "May include discovery, demonstrations, solution framing, proposals, and commercial support.",
    },
    {
      title: "Enterprise AI Consultant",
      keywords: ["Enterprise Generative AI Consultant", "Enterprise AI Advisor"],
    },
    {
      title: "Applied AI Consultant",
      keywords: ["Applied Artificial Intelligence Consultant", "AI Applications Consultant"],
    },
    {
      title: "AI Transformation Consultant",
      keywords: ["Generative AI Transformation Consultant", "Digital AI Transformation Consultant"],
    },
    {
      title: "AI Solutions Specialist",
      keywords: ["AI Solution Specialist", "AI Business Solutions Specialist"],
    },
    {
      title: "Cloud AI Consultant",
      keywords: ["Azure AI Consultant", "AWS AI Consultant", "Google Cloud AI Consultant"],
      companies: ["Cloud and technology providers"],
    },
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
