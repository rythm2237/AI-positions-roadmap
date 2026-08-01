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
    { title: "AI Technical Product Manager", keywords: ["Technical Product Manager AI"] },
    { title: "AI Platform Product Manager", keywords: ["AI Platform PM"] },
    { title: "Data and AI Product Manager", keywords: ["Data AI Product Manager"] },
    { title: "Applied AI Product Manager", keywords: ["Applied AI PM"] },
    { title: "AI Product Lead", keywords: ["Head of AI Product", "AI Product Owner"] },
    { title: "Conversational AI Product Manager", keywords: ["Chatbot Product Manager"] },
    { title: "AI Solutions Product Manager", keywords: ["Enterprise AI Product Manager"] },
    { title: "Intelligent Products Manager", keywords: ["Intelligent Product Manager"] },
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
    { title: "Intelligent Automation Developer", keywords: ["IA Developer"] },
    { title: "Hyperautomation Engineer", keywords: ["Hyperautomation Developer", "Hyperautomation Specialist"] },
    { title: "RPA Engineer", keywords: ["RPA Developer"] },
    { title: "Process Automation Engineer", keywords: ["Business Process Automation Engineer"] },
    { title: "Automation Engineer", keywords: ["Enterprise Automation Engineer"] },
    { title: "Automation Solutions Engineer", keywords: ["Automation Solution Engineer"] },
    { title: "Workflow Automation Engineer", keywords: ["Workflow Engineer"] },
    { title: "Intelligent Process Automation Engineer", keywords: ["IPA Engineer"] },
    { title: "Automation Platform Engineer", keywords: ["RPA Platform Engineer"] },
    { title: "UiPath Developer", companies: ["UiPath ecosystem"] },
    { title: "Power Automate Developer", companies: ["Microsoft ecosystem"] },
  ],
  "ai-integration-specialist": [
    { title: "AI Integration Engineer", keywords: ["AI Integrations Engineer"] },
    { title: "Generative AI Integration Engineer", keywords: ["GenAI Integration Engineer"] },
    { title: "LLM Integration Engineer", keywords: ["Large Language Model Integration Engineer"] },
    { title: "AI API Integration Specialist", keywords: ["AI API Engineer"] },
    { title: "AI Solutions Integration Engineer" },
    { title: "AI Application Integration Engineer" },
    { title: "AI Systems Integrator" },
    { title: "Conversational AI Integration Specialist" },
  ],
  "ai-workflow-architect": [
    { title: "AI Workflow Solution Architect" },
    { title: "Agentic Workflow Architect" },
    { title: "AI Orchestration Architect" },
    { title: "Intelligent Workflow Architect" },
    { title: "Automation Solution Architect" },
    { title: "Enterprise Workflow Architect" },
    { title: "Human-AI Workflow Architect" },
    { title: "AI Process Architect" },
    { title: "Agentic Systems Architect" },
    { title: "Workflow Automation Architect" },
  ],
  "ai-solutions-consultant": [
    { title: "Generative AI Consultant", keywords: ["GenAI Consultant"] },
    { title: "AI Solution Consultant" },
    { title: "AI Advisory Consultant" },
    { title: "AI Strategy Consultant" },
    { title: "AI Presales Consultant", keywords: ["AI Sales Engineer"] },
    { title: "Enterprise AI Consultant" },
    { title: "Applied AI Consultant" },
    { title: "AI Transformation Consultant" },
    { title: "AI Solutions Specialist" },
    { title: "Cloud AI Consultant" },
  ],
  "ai-transformation-consultant": [
    { title: "Enterprise AI Transformation Consultant", keywords: ["Enterprise AI Transformation Advisor"] },
    { title: "AI Strategy and Transformation Consultant", keywords: ["AI Strategy Consultant"] },
    { title: "Generative AI Transformation Consultant", keywords: ["GenAI Transformation Consultant"] },
    { title: "Digital Transformation Consultant", keywords: ["AI Digital Transformation Consultant"] },
    { title: "AI Operating Model Consultant", keywords: ["AI Operating Model Advisor"] },
    { title: "AI Adoption and Transformation Consultant", keywords: ["AI Adoption Consultant"] },
    { title: "Enterprise AI Advisor", keywords: ["AI Transformation Advisor"] },
    { title: "AI Change and Transformation Lead", keywords: ["AI Change Lead"] },
    { title: "AI Transformation Manager", keywords: ["Enterprise AI Transformation Manager"] },
    { title: "Technology Transformation Consultant", keywords: ["AI Technology Transformation Consultant"] },
  ],
  "generative-engine-optimization-specialist": [
    { title: "GEO Specialist", keywords: ["Generative Engine Optimization Specialist"] },
    { title: "Answer Engine Optimization Specialist", keywords: ["AEO Specialist", "Answer Engine Optimizer"] },
    { title: "AI Search Optimization Specialist", keywords: ["AI Search Specialist"] },
    { title: "Generative Search Specialist", keywords: ["Generative Search Optimization Specialist"] },
    { title: "LLM Optimization Specialist", keywords: ["LLM Visibility Specialist"] },
    { title: "AI Visibility Strategist", keywords: ["Generative AI Visibility Strategist"] },
    { title: "AI Search Strategist", keywords: ["Generative Search Strategist"] },
    { title: "Organic AI Search Specialist", keywords: ["AI Organic Growth Specialist"] },
    { title: "Generative Discovery Specialist", keywords: ["AI Discovery Optimization Specialist"] },
    { title: "AI Citation Optimization Specialist", keywords: ["Citation Visibility Specialist"] },
  ],
  "ai-content-strategist": [
    { title: "Generative AI Content Strategist", keywords: ["GenAI Content Strategist"] },
    { title: "AI Editorial Strategist", keywords: ["Editorial AI Strategist"] },
    { title: "AI Content Operations Strategist", keywords: ["AI Content Operations Manager"] },
    { title: "Content Intelligence Strategist", keywords: ["Content Intelligence Lead"] },
    { title: "AI Content Architect", keywords: ["Content Systems Architect"] },
    { title: "AI-Assisted Content Strategist", keywords: ["AI Enabled Content Strategist"] },
    { title: "Content Automation Strategist", keywords: ["AI Content Automation Specialist"] },
    { title: "AI Knowledge Content Strategist", keywords: ["Knowledge Content Strategist"] },
    { title: "AI Editorial Operations Lead", keywords: ["Editorial Automation Lead"] },
    { title: "Intelligent Content Strategist", keywords: ["Intelligent Content Manager"] },
  ],
};

export function normalizeCareerTitle(value: string): string {
  return value.toLocaleLowerCase("en").normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
}

export function getDefaultCareerTitleAliases(slug: string): CareerTitleAlias[] {
  return [...(CAREER_TITLE_ALIASES[slug] ?? [])].map((alias) => ({
    ...alias,
    countries: alias.countries ? [...alias.countries] : undefined,
    companies: alias.companies ? [...alias.companies] : undefined,
    keywords: alias.keywords ? [...alias.keywords] : undefined,
  }));
}

export function getCareerTitleAliases(career: Pick<CareerWorkspaceData, "slug" | "titleAliases">): CareerTitleAlias[] {
  return career.titleAliases?.length ? career.titleAliases : getDefaultCareerTitleAliases(career.slug);
}

export function applyCareerTitleAliasPolicy(career: CareerWorkspaceData): CareerWorkspaceData {
  const aliases = getCareerTitleAliases(career);
  return aliases.length ? { ...career, titleAliases: aliases } : career;
}

export function aliasSearchTerms(canonicalTitle: string, aliases: readonly CareerTitleAlias[]): string[] {
  return [canonicalTitle, ...aliases.flatMap((alias) => [alias.title, ...(alias.keywords ?? []), ...(alias.countries ?? []), ...(alias.companies ?? [])])];
}
