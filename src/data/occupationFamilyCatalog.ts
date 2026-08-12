import type { CareerDomain } from "@/data/careerCatalog";

export interface OccupationFamilyCatalogEntry {
  slug: string;
  domain: CareerDomain;
  name: string;
  shortName: string;
  description: string;
  classificationScope: string;
  aliases: string[];
  includedOccupations: string[];
  excludedOccupations: string[];
  methodologySummary: string;
  mappingVersion: string;
  careerSlugs: string[];
}

const sharedMethodology =
  "Each country requires independently reviewed official occupation mappings. Family membership is product taxonomy only and must not be used to combine official statistics across occupation codes.";

export const OCCUPATION_FAMILY_CATALOG: readonly OccupationFamilyCatalogEntry[] = [
  {
    slug: "ai-ml-engineering",
    domain: "AI Engineering",
    name: "AI and Machine Learning Engineering",
    shortName: "AI/ML Engineering",
    description: "Statistical identity for careers that design, build, evaluate, deploy and operate AI and machine-learning systems.",
    classificationScope: "Country-specific official classifications; no single global AI-engineering code or combined statistic is asserted.",
    aliases: ["Artificial Intelligence Engineering", "Machine Learning Engineering"],
    includedOccupations: ["AI Engineer"],
    excludedOccupations: ["Generic IT management", "Unrelated data-entry occupations"],
    methodologySummary: sharedMethodology,
    mappingVersion: "1.0.0",
    careerSlugs: ["ai-engineer"],
  },
  {
    slug: "ai-product-management",
    domain: "AI Product",
    name: "AI Product Management",
    shortName: "AI Product",
    description: "Statistical identity for product professionals responsible for useful, responsible and commercially viable AI products.",
    classificationScope: "Country mappings may span product, project and technology-management classifications; no universal code is asserted.",
    aliases: ["Artificial Intelligence Product Management", "AI Product Leadership"],
    includedOccupations: ["AI Product Manager"],
    excludedOccupations: ["General sales management", "Unrelated administrative management"],
    methodologySummary: sharedMethodology,
    mappingVersion: "1.0.0",
    careerSlugs: ["ai-product-manager"],
  },
  {
    slug: "ai-automation",
    domain: "AI Automation",
    name: "AI Automation and Workflow Engineering",
    shortName: "AI Automation",
    description: "Statistical identity for careers that connect AI, automation platforms, agents, APIs and enterprise workflows.",
    classificationScope: "Country mappings may span software development, systems analysis, automation and consulting occupations; each mapping remains separate.",
    aliases: ["Intelligent Automation", "AI Workflow Engineering"],
    includedOccupations: ["AI Automation Specialist", "Intelligent Automation Engineer", "Microsoft Copilot Consultant", "AI Integration Specialist", "AI Workflow Architect"],
    excludedOccupations: ["Purely mechanical automation", "Unrelated clerical processing"],
    methodologySummary: sharedMethodology,
    mappingVersion: "1.0.0",
    careerSlugs: ["ai-automation-specialist", "intelligent-automation-engineer", "microsoft-copilot-consultant", "ai-integration-specialist", "ai-workflow-architect"],
  },
  {
    slug: "enterprise-ai-consulting",
    domain: "Enterprise AI & Consulting",
    name: "Enterprise AI Strategy and Consulting",
    shortName: "Enterprise AI Consulting",
    description: "Statistical identity for careers that guide organizations through AI strategy, solution design, transformation, adoption and value realization.",
    classificationScope: "Country mappings may span management analysis, technology consulting and organizational-change occupations; no blended benchmark is asserted.",
    aliases: ["AI Transformation Consulting", "Business AI Consulting"],
    includedOccupations: ["AI Solutions Consultant", "AI Transformation Consultant", "Business AI Consultant", "Enterprise AI Consultant", "AI Adoption Consultant"],
    excludedOccupations: ["Generic management consulting without technology scope", "Direct software sales"],
    methodologySummary: sharedMethodology,
    mappingVersion: "1.0.0",
    careerSlugs: ["ai-solutions-consultant", "ai-transformation-consultant", "business-ai-consultant", "enterprise-ai-consultant", "ai-adoption-consultant"],
  },
  {
    slug: "ai-data-analytics",
    domain: "AI Data & Analytics",
    name: "AI Data, Analytics and Knowledge Engineering",
    shortName: "AI Data & Analytics",
    description: "Statistical identity for careers that build data systems, analysis, business intelligence, data science and AI-ready knowledge.",
    classificationScope: "Official data, analytics, science and engineering occupation codes remain independently mapped and reported by country.",
    aliases: ["Data and Analytics", "AI Data Engineering"],
    includedOccupations: ["Data Analyst", "BI Developer", "Data Engineer", "Data Scientist", "AI Knowledge Engineer"],
    excludedOccupations: ["Unrelated data entry", "Generic database administration without analytics or engineering scope"],
    methodologySummary: sharedMethodology,
    mappingVersion: "1.0.0",
    careerSlugs: ["data-analyst", "bi-developer", "data-engineer", "data-scientist", "ai-knowledge-engineer"],
  },
  {
    slug: "ai-infrastructure-security",
    domain: "AI Infrastructure & Security",
    name: "Cloud, DevOps and Cybersecurity",
    shortName: "Infrastructure & Security",
    description: "Statistical identity for careers that build, operate, secure and improve cloud and software-delivery infrastructure.",
    classificationScope: "Cloud, DevOps and cybersecurity mappings remain separate official occupations; family-level aggregation is prohibited without an approved method.",
    aliases: ["Cloud Infrastructure and Security", "Platform Operations and Cybersecurity"],
    includedOccupations: ["Cloud Engineer", "DevOps Engineer", "Cybersecurity Analyst"],
    excludedOccupations: ["General help-desk support", "Physical security occupations"],
    methodologySummary: sharedMethodology,
    mappingVersion: "1.0.0",
    careerSlugs: ["cloud-engineer", "devops-engineer", "cybersecurity-analyst"],
  },
  {
    slug: "ai-marketing",
    domain: "AI Marketing",
    name: "AI Marketing, Content and Generative Discovery",
    shortName: "AI Marketing",
    description: "Statistical identity for careers applying AI to marketing, content systems and visibility across generative answer engines.",
    classificationScope: "Country mappings may span marketing, market research, content strategy and search-related occupations; each source statistic remains separate.",
    aliases: ["Artificial Intelligence Marketing", "Generative Discovery and Content"],
    includedOccupations: ["Generative Engine Optimization (GEO) Specialist", "AI Marketing Specialist", "AI Content Strategist"],
    excludedOccupations: ["Unrelated advertising sales", "Pure graphic-production roles"],
    methodologySummary: sharedMethodology,
    mappingVersion: "1.0.0",
    careerSlugs: ["generative-engine-optimization-specialist", "ai-marketing-specialist", "ai-content-strategist"],
  },
];

export function findOccupationFamilyCatalogEntry(slug: string) {
  return OCCUPATION_FAMILY_CATALOG.find((family) => family.slug === slug);
}
