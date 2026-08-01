export const CAREER_DOMAINS = [
  "AI Engineering",
  "AI Product",
  "AI Automation",
  "Enterprise AI & Consulting",
  "AI Data & Analytics",
  "AI Infrastructure & Security",
  "AI Marketing",
] as const;

export type CareerDomain = (typeof CAREER_DOMAINS)[number];
export type CareerAvailability = "available" | "planned";

export interface CareerCatalogEntry {
  id: string;
  slug: string;
  title: string;
  domain: CareerDomain;
  description: string;
  availability: CareerAvailability;
  route?: string;
  displayOrder: number;
}

const catalog = [
  ["ai-engineer", "AI Engineer", "AI Engineering", "Build and deploy reliable AI products, model-powered applications, and production ML systems.", "available", "/careers/ai-engineer"],
  ["ai-product-manager", "AI Product Manager", "AI Product", "Identify valuable customer problems and lead useful, responsible AI products through discovery, strategy, evaluation, delivery, launch, adoption, and iteration.", "available", "/careers/ai-product-manager?entry=galaxy"],
  ["ai-automation-specialist", "AI Automation Specialist", "AI Automation", "Design and implement dependable AI-powered automations that connect models, APIs, data, workflow platforms, and business operations.", "available", "/careers/ai-automation-specialist?entry=galaxy"],
  ["intelligent-automation-engineer", "Intelligent Automation Engineer", "AI Automation", "Engineer enterprise automation systems that combine process redesign, RPA, workflows, APIs, document intelligence, agents, governance, and production operations.", "available", "/careers/intelligent-automation-engineer?entry=galaxy"],
  ["microsoft-copilot-consultant", "Microsoft Copilot Consultant", "AI Automation", "Design, deploy, govern, and drive adoption of Microsoft Copilot and Copilot Studio solutions across business workflows.", "available", "/careers/microsoft-copilot-consultant?entry=galaxy"],
  ["ai-integration-specialist", "AI Integration Specialist", "AI Automation", "Connect AI services safely to existing products, tools, and enterprise systems.", "available", "/careers/ai-integration-specialist?entry=galaxy"],
  ["ai-workflow-architect", "AI Workflow Architect", "AI Automation", "Design scalable, governed human-and-AI workflows across agents, models, tools, APIs, enterprise systems, decisions, state, handoffs, and operations.", "available", "/careers/ai-workflow-architect?entry=galaxy"],
  ["ai-solutions-consultant", "AI Solutions Consultant", "Enterprise AI & Consulting", "Translate business needs into practical, trustworthy AI solution strategies through discovery, opportunity assessment, solution framing, value analysis, governance, delivery planning, and adoption.", "available", "/careers/ai-solutions-consultant?entry=galaxy"],
  ["ai-transformation-consultant", "AI Transformation Consultant", "Enterprise AI & Consulting", "Define and deliver enterprise AI transformation through opportunity portfolios, operating models, responsible-AI governance, adoption, roadmaps, and value realization.", "available", "/careers/ai-transformation-consultant?entry=galaxy"],
  ["business-ai-consultant", "Business AI Consultant", "Enterprise AI & Consulting", "Identify valuable AI opportunities and turn them into measurable business change."],
  ["enterprise-ai-consultant", "Enterprise AI Consultant", "Enterprise AI & Consulting", "Guide large organizations through secure AI strategy, delivery, governance, and scale."],
  ["ai-adoption-consultant", "AI Adoption Consultant", "Enterprise AI & Consulting", "Help teams adopt AI responsibly through workflow redesign, enablement, governance, change management, and measurable value realization.", "available", "/careers/ai-adoption-consultant?entry=galaxy"],
  ["data-analyst", "Data Analyst", "AI Data & Analytics", "Turn business questions into reliable datasets, analysis, dashboards, experiments, and decision-ready insights.", "available", "/careers/data-analyst?entry=galaxy"],
  ["bi-developer", "BI Developer", "AI Data & Analytics", "Build governed reporting and semantic data products that support digital transformation and AI decisions."],
  ["data-engineer", "Data Engineer", "AI Data & Analytics", "Create reliable data platforms and pipelines that make production AI systems possible."],
  ["data-scientist", "Data Scientist", "AI Data & Analytics", "Use statistics, experimentation, machine learning, and causal reasoning to solve business problems and support reliable decisions.", "available", "/careers/data-scientist?entry=galaxy"],
  ["ai-knowledge-engineer", "AI Knowledge Engineer", "AI Data & Analytics", "Structure organizational knowledge for retrieval, reasoning, and trustworthy AI applications."],
  ["cloud-engineer", "Cloud Engineer", "AI Infrastructure & Security", "Build the secure cloud foundation required to operate modern AI and digital services."],
  ["devops-engineer", "DevOps Engineer", "AI Infrastructure & Security", "Create reliable delivery, observability, and operations systems for AI-enabled software."],
  ["cybersecurity-analyst", "Cybersecurity Analyst", "AI Infrastructure & Security", "Protect the data, infrastructure, and workflows behind AI and digital transformation."],
  ["generative-engine-optimization-specialist", "Generative Engine Optimization (GEO) Specialist", "AI Marketing", "Improve trusted visibility, retrieval, citation, and authority across generative answer engines through research, entities, evidence, technical discoverability, and measurement.", "available", "/careers/generative-engine-optimization-specialist?entry=galaxy"],
  ["ai-marketing-specialist", "AI Marketing Specialist", "AI Marketing", "Use AI responsibly across research, segmentation, content, campaigns, lifecycle operations, experimentation, analytics, and measurable growth.", "available", "/careers/ai-marketing-specialist?entry=galaxy"],
  ["ai-content-strategist", "AI Content Strategist", "AI Marketing", "Design governed AI-assisted content systems across audience research, knowledge architecture, editorial workflows, distribution, quality, and measurement.", "available", "/careers/ai-content-strategist?entry=galaxy"],
] as const;

export const CAREER_CATALOG: readonly CareerCatalogEntry[] = catalog.map((entry, index) => ({
  id: entry[0],
  slug: entry[0],
  title: entry[1],
  domain: entry[2],
  description: entry[3],
  availability: (entry[4] ?? "planned") as CareerAvailability,
  route: entry[5],
  displayOrder: index + 1,
}));

export const AVAILABLE_CAREERS = CAREER_CATALOG.filter((career) => career.availability === "available");
export function careersByDomain(domain: CareerDomain) { return CAREER_CATALOG.filter((career) => career.domain === domain); }
export function findCareerBySlug(slug: string) { return CAREER_CATALOG.find((career) => career.slug === slug); }
