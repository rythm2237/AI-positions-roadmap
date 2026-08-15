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
    { title: "Applied AI Consultant" },
    { title: "AI Transformation Consultant" },
    { title: "AI Solutions Specialist" },
    { title: "Cloud AI Consultant" },
  ],
  "enterprise-ai-consultant": [
    { title: "Enterprise AI Advisor", keywords: ["Enterprise AI Advisory Consultant"] },
    { title: "Enterprise AI Strategy Consultant", keywords: ["Enterprise AI Strategist"] },
    { title: "AI Strategy and Architecture Consultant", keywords: ["Enterprise AI Strategy and Architecture"] },
    { title: "Enterprise AI Advisory Manager", keywords: ["AI Advisory Manager"] },
    { title: "Enterprise Generative AI Consultant", keywords: ["Enterprise GenAI Consultant"] },
    { title: "AI Platform Strategy Consultant", keywords: ["Enterprise AI Platform Consultant"] },
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
  "ai-adoption-consultant": [
    { title: "AI Change Management Consultant", keywords: ["AI Change Consultant", "AI Change Manager"] },
    { title: "AI Enablement Consultant", keywords: ["AI Workforce Enablement Consultant", "AI Enablement Lead"] },
    { title: "AI Adoption Specialist", keywords: ["AI Adoption Lead", "Generative AI Adoption Specialist"] },
    { title: "AI Workforce Transformation Consultant", keywords: ["AI Workforce Consultant"] },
    { title: "GenAI Adoption Consultant", keywords: ["Generative AI Adoption Consultant"] },
    { title: "AI Learning and Adoption Consultant", keywords: ["AI Training and Adoption Consultant"] },
  ],
  "microsoft-copilot-consultant": [
    { title: "Microsoft 365 Copilot Consultant", keywords: ["M365 Copilot Consultant"] },
    { title: "Copilot Studio Consultant", keywords: ["Microsoft Copilot Studio Specialist"] },
    { title: "Microsoft Copilot Specialist", keywords: ["Copilot Solutions Specialist"] },
    { title: "Copilot Adoption Consultant", keywords: ["Microsoft Copilot Adoption Lead"] },
    { title: "Power Platform Copilot Consultant", keywords: ["Microsoft Power Platform AI Consultant"] },
    { title: "Copilot Solutions Architect", keywords: ["Microsoft Copilot Architect"] },
  ],
  "ai-marketing-specialist": [
    { title: "Generative AI Marketing Specialist", keywords: ["GenAI Marketing Specialist"] },
    { title: "AI Growth Marketing Specialist", keywords: ["AI Growth Marketer"] },
    { title: "AI Marketing Automation Specialist", keywords: ["AI Campaign Automation Specialist"] },
    { title: "AI Digital Marketing Specialist", keywords: ["Artificial Intelligence Marketing Specialist"] },
    { title: "AI Performance Marketing Specialist", keywords: ["AI Performance Marketer"] },
    { title: "AI Lifecycle Marketing Specialist", keywords: ["AI CRM Marketing Specialist"] },
  ],
  "data-analyst": [
    { title: "Business Data Analyst", keywords: ["Business Analyst Data"] },
    { title: "BI Analyst", keywords: ["Business Intelligence Analyst"] },
    { title: "Reporting Analyst", keywords: ["Data Reporting Analyst"] },
    { title: "Product Data Analyst", keywords: ["Product Analyst"] },
    { title: "Operations Data Analyst", keywords: ["Operations Analyst"] },
    { title: "Insights Analyst", keywords: ["Data Insights Analyst"] },
  ],
  "data-scientist": [
    { title: "Applied Data Scientist", keywords: ["Applied Scientist Data"] },
    { title: "Machine Learning Data Scientist", keywords: ["ML Data Scientist"] },
    { title: "Product Data Scientist", keywords: ["Data Scientist Product"] },
    { title: "Decision Scientist", keywords: ["Decision Science Analyst"] },
    { title: "Research Data Scientist", keywords: ["Data Science Researcher"] },
    { title: "Statistical Data Scientist", keywords: ["Statistical Scientist"] },
  ],
  "bi-developer": [
    { title: "Business Intelligence Developer", keywords: ["Business Intelligence Engineer"] },
    { title: "Power BI Developer", keywords: ["Microsoft Power BI Developer"] },
    { title: "BI Engineer", keywords: ["Business Intelligence Engineer"] },
    { title: "Analytics Developer", keywords: ["Analytical Applications Developer"] },
    { title: "Reporting Developer", keywords: ["Enterprise Reporting Developer"] },
    { title: "Semantic Model Developer", keywords: ["Tabular Model Developer"] },
  ],
  "ai-knowledge-engineer": [
    { title: "Knowledge Engineer", keywords: ["Enterprise Knowledge Engineer"] },
    { title: "Generative AI Knowledge Engineer", keywords: ["GenAI Knowledge Engineer"] },
    { title: "RAG Engineer", keywords: ["Retrieval Augmented Generation Engineer"] },
    { title: "AI Knowledge Architect", keywords: ["Knowledge Architecture Specialist"] },
    { title: "Knowledge Graph Engineer", keywords: ["Graph Knowledge Engineer"] },
    { title: "Search and Retrieval Engineer", keywords: ["AI Retrieval Engineer"] },
  ],
  "data-engineer": [
    { title: "Cloud Data Engineer", keywords: ["Data Engineer Cloud"] },
    { title: "Analytics Engineer", keywords: ["Analytics Data Engineer"] },
    { title: "Big Data Engineer", keywords: ["Distributed Data Engineer"] },
    { title: "Data Platform Engineer", keywords: ["Enterprise Data Platform Engineer"] },
    { title: "ETL Developer", keywords: ["ELT Developer", "Data Integration Developer"] },
    { title: "Streaming Data Engineer", keywords: ["Real-Time Data Engineer"] },
  ],
  "devops-engineer": [
    { title: "Cloud DevOps Engineer", keywords: ["DevOps Cloud Engineer"] },
    { title: "Platform Engineer", keywords: ["Developer Platform Engineer"] },
    { title: "Site Reliability Engineer", keywords: ["SRE"] },
    { title: "Infrastructure Automation Engineer", keywords: ["Infrastructure Engineer Automation"] },
    { title: "CI/CD Engineer", keywords: ["Continuous Delivery Engineer"] },
    { title: "DevSecOps Engineer", keywords: ["Secure DevOps Engineer"] },
  ],
  "business-ai-consultant": [
    { title: "Business AI Advisor", keywords: ["AI Business Advisor"] },
    { title: "AI Business Consultant", keywords: ["Artificial Intelligence Business Consultant"] },
    { title: "AI Opportunity Consultant", keywords: ["AI Use Case Consultant"] },
    { title: "AI Value Consultant", keywords: ["AI Business Value Consultant"] },
    { title: "Generative AI Business Consultant", keywords: ["GenAI Business Consultant"] },
    { title: "AI Business Solutions Consultant", keywords: ["Business AI Solutions Specialist"] },
  ],
  "cybersecurity-analyst": [
    { title: "Security Operations Analyst", keywords: ["SOC Analyst", "Cyber Security Operations Analyst"] },
    { title: "Information Security Analyst", keywords: ["InfoSec Analyst", "IT Security Analyst"] },
    { title: "Cyber Defense Analyst", keywords: ["Defensive Security Analyst"] },
    { title: "Incident Response Analyst", keywords: ["Cyber Incident Analyst", "DFIR Analyst"] },
    { title: "Threat Detection Analyst", keywords: ["Detection and Response Analyst"] },
    { title: "Cloud Security Analyst", keywords: ["Cloud Cybersecurity Analyst"] },
  ],
  "cloud-engineer": [
    { title: "Cloud Infrastructure Engineer", keywords: ["Cloud Infrastructure Specialist"] },
    { title: "Cloud Platform Engineer", keywords: ["Cloud Platform Specialist"] },
    { title: "Cloud Operations Engineer", keywords: ["Cloud Ops Engineer"] },
    { title: "Azure Cloud Engineer", keywords: ["Microsoft Azure Engineer"] },
    { title: "AWS Cloud Engineer", keywords: ["Amazon Web Services Cloud Engineer"] },
    { title: "Google Cloud Engineer", keywords: ["GCP Cloud Engineer"] },
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
