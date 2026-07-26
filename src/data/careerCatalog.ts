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
  [
    "ai-engineer",
    "AI Engineer",
    "AI Engineering",
    "Build and deploy reliable AI products, model-powered applications, and production ML systems.",
    "available",
    "/careers/ai-engineer",
  ],
  [
    "ai-product-manager",
    "AI Product Manager",
    "AI Product",
    "Guide useful, responsible AI products from customer problem through delivery and evaluation.",
  ],
  [
    "ai-automation-specialist",
    "AI Automation Specialist",
    "AI Automation",
    "Design and implement dependable AI-powered automations that connect models, APIs, data, workflow platforms, and business operations.",
    "available",
    "/careers/ai-automation-specialist?entry=galaxy",
  ],
  [
    "intelligent-automation-engineer",
    "Intelligent Automation Engineer",
    "AI Automation",
    "Combine process engineering, automation platforms, and AI to improve complex operations.",
  ],
  [
    "microsoft-copilot-consultant",
    "Microsoft Copilot Consultant",
    "AI Automation",
    "Help organizations adopt and govern Microsoft Copilot across real workplace processes.",
  ],
  [
    "ai-integration-specialist",
    "AI Integration Specialist",
    "AI Automation",
    "Connect AI services safely to existing products, tools, and enterprise systems.",
  ],
  [
    "ai-workflow-architect",
    "AI Workflow Architect",
    "AI Automation",
    "Design scalable human-and-AI workflows with clear controls, handoffs, and outcomes.",
  ],
  [
    "ai-solutions-consultant",
    "AI Solutions Consultant",
    "Enterprise AI & Consulting",
    "Translate business needs into practical, trustworthy AI solution designs.",
  ],
  [
    "ai-transformation-consultant",
    "AI Transformation Consultant",
    "Enterprise AI & Consulting",
    "Shape organization-wide AI transformation plans, operating models, and adoption programs.",
  ],
  [
    "business-ai-consultant",
    "Business AI Consultant",
    "Enterprise AI & Consulting",
    "Identify valuable AI opportunities and turn them into measurable business change.",
  ],
  [
    "enterprise-ai-consultant",
    "Enterprise AI Consultant",
    "Enterprise AI & Consulting",
    "Guide large organizations through secure AI strategy, delivery, governance, and scale.",
  ],
  [
    "ai-adoption-consultant",
    "AI Adoption Consultant",
    "Enterprise AI & Consulting",
    "Help teams adopt AI responsibly through workflow redesign, enablement, and change management.",
  ],
  [
    "data-analyst",
    "Data Analyst",
    "AI Data & Analytics",
    "Turn data into decisions and build the analytical foundation used by AI-enabled organizations.",
  ],
  [
    "bi-developer",
    "BI Developer",
    "AI Data & Analytics",
    "Build governed reporting and semantic data products that support digital transformation and AI decisions.",
  ],
  [
    "data-engineer",
    "Data Engineer",
    "AI Data & Analytics",
    "Create reliable data platforms and pipelines that make production AI systems possible.",
  ],
  [
    "data-scientist",
    "Data Scientist",
    "AI Data & Analytics",
    "Use statistics, experimentation, and machine learning to solve business problems responsibly.",
  ],
  [
    "ai-knowledge-engineer",
    "AI Knowledge Engineer",
    "AI Data & Analytics",
    "Structure organizational knowledge for retrieval, reasoning, and trustworthy AI applications.",
  ],
  [
    "cloud-engineer",
    "Cloud Engineer",
    "AI Infrastructure & Security",
    "Build the secure cloud foundation required to operate modern AI and digital services.",
  ],
  [
    "devops-engineer",
    "DevOps Engineer",
    "AI Infrastructure & Security",
    "Create reliable delivery, observability, and operations systems for AI-enabled software.",
  ],
  [
    "cybersecurity-analyst",
    "Cybersecurity Analyst",
    "AI Infrastructure & Security",
    "Protect the data, infrastructure, and workflows behind AI and digital transformation.",
  ],
  [
    "generative-engine-optimization-specialist",
    "Generative Engine Optimization (GEO) Specialist",
    "AI Marketing",
    "Make authoritative content understandable and discoverable across generative answer systems.",
  ],
  [
    "ai-marketing-specialist",
    "AI Marketing Specialist",
    "AI Marketing",
    "Apply AI responsibly to research, campaigns, operations, and measurable customer growth.",
  ],
  [
    "ai-content-strategist",
    "AI Content Strategist",
    "AI Marketing",
    "Design useful, governed content systems for human audiences and AI-assisted discovery.",
  ],
] as const;

export const CAREER_CATALOG: readonly CareerCatalogEntry[] = catalog.map(
  (entry, index) => ({
    id: entry[0],
    slug: entry[0],
    title: entry[1],
    domain: entry[2],
    description: entry[3],
    availability: (entry[4] ?? "planned") as CareerAvailability,
    route: entry[5],
    displayOrder: index + 1,
  })
);

export const AVAILABLE_CAREERS = CAREER_CATALOG.filter(
  (career) => career.availability === "available"
);

export function careersByDomain(domain: CareerDomain) {
  return CAREER_CATALOG.filter((career) => career.domain === domain);
}

export function findCareerBySlug(slug: string) {
  return CAREER_CATALOG.find((career) => career.slug === slug);
}
