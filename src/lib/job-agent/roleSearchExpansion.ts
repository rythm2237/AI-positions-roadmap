import type { JobAgent } from "@/types/jobAgent";

type Relation = "equivalent" | "adjacent";

type RoleFamily = {
  canonical: string;
  aliases: string[];
  adjacent: string[];
};

const ROLE_FAMILIES: RoleFamily[] = [
  { canonical: "AI Engineer", aliases: ["Artificial Intelligence Engineer", "Machine Learning Engineer", "ML Engineer", "Applied AI Engineer", "Generative AI Engineer", "GenAI Engineer", "LLM Engineer"], adjacent: ["MLOps Engineer", "AI Solutions Architect", "Machine Learning Scientist"] },
  { canonical: "AI Product Manager", aliases: ["AI Product Lead", "Product Manager AI", "GenAI Product Manager", "Machine Learning Product Manager"], adjacent: ["Technical Product Manager", "Product Owner AI", "AI Program Manager"] },
  { canonical: "AI Automation Specialist", aliases: ["AI Automation Engineer", "Automation Specialist AI", "AI Workflow Specialist", "Business Automation Specialist", "AI Process Automation Specialist"], adjacent: ["Intelligent Automation Engineer", "RPA Developer", "Power Platform Developer", "Automation Consultant"] },
  { canonical: "Intelligent Automation Engineer", aliases: ["Automation Engineer", "Intelligent Process Automation Engineer", "RPA Engineer", "Hyperautomation Engineer"], adjacent: ["AI Automation Specialist", "RPA Developer", "Automation Architect"] },
  { canonical: "Microsoft Copilot Consultant", aliases: ["Copilot Consultant", "Microsoft 365 Copilot Consultant", "Copilot Studio Consultant", "Power Platform Copilot Consultant"], adjacent: ["Microsoft 365 Consultant", "Power Platform Consultant", "AI Solutions Consultant"] },
  { canonical: "AI Integration Specialist", aliases: ["AI Integration Engineer", "AI Systems Integration Engineer", "Generative AI Integration Engineer", "LLM Integration Engineer"], adjacent: ["Integration Engineer", "Solutions Engineer", "AI Engineer"] },
  { canonical: "AI Workflow Architect", aliases: ["AI Automation Architect", "Agentic Workflow Architect", "AI Process Architect", "AI Orchestration Architect"], adjacent: ["Solutions Architect AI", "Automation Architect", "Enterprise Architect AI"] },
  { canonical: "AI Solutions Consultant", aliases: ["AI Consultant", "AI Solutions Advisor", "Generative AI Consultant", "AI Solutions Specialist"], adjacent: ["AI Solutions Architect", "Business AI Consultant", "Pre-Sales AI Consultant"] },
  { canonical: "AI Transformation Consultant", aliases: ["AI Transformation Advisor", "Generative AI Transformation Consultant", "Digital AI Transformation Consultant"], adjacent: ["Digital Transformation Consultant", "AI Strategy Consultant", "Enterprise AI Consultant"] },
  { canonical: "Business AI Consultant", aliases: ["AI Business Consultant", "Business AI Advisor", "AI Business Solutions Consultant", "AI Value Consultant"], adjacent: ["AI Solutions Consultant", "Management Consultant AI", "AI Strategy Consultant"] },
  { canonical: "Enterprise AI Consultant", aliases: ["Enterprise AI Advisor", "Enterprise Generative AI Consultant", "AI Strategy Consultant", "Enterprise AI Specialist"], adjacent: ["Enterprise Architect AI", "AI Transformation Consultant", "AI Governance Consultant"] },
  { canonical: "AI Adoption Consultant", aliases: ["AI Adoption Specialist", "AI Change Consultant", "Generative AI Adoption Consultant", "AI Enablement Consultant"], adjacent: ["Change Management Consultant", "Digital Adoption Consultant", "AI Training Consultant"] },
  { canonical: "Data Analyst", aliases: ["Business Data Analyst", "Analytics Analyst", "BI Analyst", "Reporting Analyst"], adjacent: ["Business Analyst", "Product Analyst", "Insights Analyst"] },
  { canonical: "BI Developer", aliases: ["Business Intelligence Developer", "Power BI Developer", "BI Engineer", "Analytics Developer"], adjacent: ["Analytics Engineer", "Data Visualization Developer", "BI Analyst"] },
  { canonical: "Data Engineer", aliases: ["Data Platform Engineer", "Big Data Engineer", "Cloud Data Engineer", "ETL Engineer"], adjacent: ["Analytics Engineer", "Data Infrastructure Engineer", "Platform Engineer Data"] },
  { canonical: "Data Scientist", aliases: ["Applied Data Scientist", "Machine Learning Scientist", "Decision Scientist", "AI Data Scientist"], adjacent: ["ML Engineer", "Research Scientist", "Quantitative Analyst"] },
  { canonical: "AI Knowledge Engineer", aliases: ["Knowledge Engineer", "RAG Engineer", "AI Knowledge Management Engineer", "Knowledge Graph Engineer"], adjacent: ["Search Engineer", "Ontology Engineer", "NLP Engineer"] },
  { canonical: "Cloud Engineer", aliases: ["Cloud Infrastructure Engineer", "Cloud Platform Engineer", "Public Cloud Engineer", "Cloud Operations Engineer"], adjacent: ["Platform Engineer", "Site Reliability Engineer", "DevOps Engineer"] },
  { canonical: "DevOps Engineer", aliases: ["DevOps Specialist", "Cloud DevOps Engineer", "CI/CD Engineer", "Platform DevOps Engineer"], adjacent: ["Platform Engineer", "Site Reliability Engineer", "Cloud Engineer"] },
  { canonical: "Cybersecurity Analyst", aliases: ["Cyber Security Analyst", "Security Analyst", "SOC Analyst", "Information Security Analyst"], adjacent: ["Security Operations Analyst", "Incident Response Analyst", "Cloud Security Analyst"] },
  { canonical: "Generative Engine Optimization (GEO) Specialist", aliases: ["GEO Specialist", "Generative Engine Optimization Specialist", "AI Search Optimization Specialist", "LLM SEO Specialist"], adjacent: ["SEO Specialist", "AI Content Strategist", "Search Strategist"] },
  { canonical: "AI Marketing Specialist", aliases: ["AI Marketing Manager", "Generative AI Marketing Specialist", "Marketing AI Specialist", "AI Growth Marketer"], adjacent: ["Growth Marketing Specialist", "Marketing Automation Specialist", "Digital Marketing Specialist"] },
  { canonical: "AI Content Strategist", aliases: ["Generative AI Content Strategist", "AI Content Manager", "AI Editorial Strategist", "Content AI Specialist"], adjacent: ["Content Strategist", "AI Marketing Specialist", "Content Operations Manager"] },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+#]+/g, " ").replace(/\s+/g, " ").trim();
}

function tokens(value: string) {
  return new Set(normalize(value).split(" ").filter((token) => token.length > 1));
}

function similarity(a: string, b: string) {
  const left = tokens(a);
  const right = tokens(b);
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  for (const token of left) if (right.has(token)) overlap += 1;
  return overlap / Math.max(left.size, right.size);
}

function familyFor(value: string): RoleFamily | null {
  const normalized = normalize(value);
  const exact = ROLE_FAMILIES.find((family) => [family.canonical, ...family.aliases].some((title) => normalize(title) === normalized));
  if (exact) return exact;
  const ranked = ROLE_FAMILIES.map((family) => ({ family, score: Math.max(...[family.canonical, ...family.aliases].map((title) => similarity(value, title))) })).sort((a, b) => b.score - a.score);
  return ranked[0]?.score >= 0.5 ? ranked[0].family : null;
}

export function expandRoleQueries(agent: Pick<JobAgent, "primary_career" | "desired_titles" | "secondary_careers" | "adjacent_roles">, limit = 6) {
  const seeds = [agent.primary_career, ...agent.desired_titles, ...agent.secondary_careers, ...agent.adjacent_roles].filter((value): value is string => Boolean(value?.trim()));
  const ranked: string[] = [];
  const seen = new Set<string>();
  const push = (value: string) => {
    const key = normalize(value);
    if (!key || seen.has(key) || ranked.length >= limit) return;
    seen.add(key);
    ranked.push(value);
  };
  for (const seed of seeds) {
    push(seed);
    const family = familyFor(seed);
    if (!family) continue;
    push(family.canonical);
    family.aliases.forEach(push);
    family.adjacent.forEach(push);
  }
  return ranked.slice(0, limit);
}

export function explainRoleRelation(searchedRole: string, vacancyTitle: string): { relation: Relation; canonical: string; message: string } | null {
  const family = familyFor(searchedRole);
  if (!family) return null;
  const vacancy = normalize(vacancyTitle);
  const equivalent = [family.canonical, ...family.aliases].find((title) => normalize(title) === vacancy || similarity(vacancyTitle, title) >= 0.72);
  if (equivalent) return { relation: "equivalent", canonical: family.canonical, message: `This vacancy uses “${vacancyTitle}”, an equivalent market title in the ${family.canonical} role family.` };
  const adjacent = family.adjacent.find((title) => normalize(title) === vacancy || similarity(vacancyTitle, title) >= 0.66);
  if (adjacent) return { relation: "adjacent", canonical: family.canonical, message: `This vacancy uses “${vacancyTitle}”. It is an adjacent title with substantial overlap with ${family.canonical}. Review duties before treating it as the same role.` };
  return null;
}

export function roleSearchPreview(query: string) {
  const family = familyFor(query);
  if (!family) return null;
  return { canonical: family.canonical, equivalentTitles: family.aliases.slice(0, 5), adjacentTitles: family.adjacent.slice(0, 3) };
}
