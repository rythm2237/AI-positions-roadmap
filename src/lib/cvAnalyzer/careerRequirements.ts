import type { CareerReference } from "./careerMatching.ts";

type CapabilityDefinition = {
  label: string;
  aliases: readonly string[];
  careerTerms: readonly string[];
};

export const CAPABILITIES = {
  "ai-automation": { label: "AI automation", aliases: ["ai automation", "intelligent automation", "ai-powered automation", "ai powered automation", "ai-powered workflow", "ai powered workflow"], careerTerms: ["ai-powered automations", "intelligent automation"] },
  "process-automation": { label: "process automation", aliases: ["process automation", "workflow automation", "business automation", "automated workflow", "automated workflows", "automation"], careerTerms: ["automation", "automate"] },
  "ai-agents": { label: "AI-agent systems", aliases: ["ai agents", "ai agent", "ai-agents", "ai-agent", "agentic ai", "multi-agent", "multi agent"], careerTerms: ["agents", "agent"] },
  "ai-product": { label: "AI product delivery", aliases: ["ai product", "ai products", "ai product builder", "ai-powered product", "model-powered application", "llm application"], careerTerms: ["ai products", "model-powered applications", "ai product"] },
  "workflow-design": { label: "workflow design", aliases: ["workflow design", "workflow architecture", "workflow platform", "workflow platforms", "workflows", "workflow"], careerTerms: ["workflows", "workflow"] },
  "process-design": { label: "business-process design", aliases: ["business process design", "process design", "process mapping", "process redesign", "process analysis"], careerTerms: ["process redesign", "business workflows", "process"] },
  "process-improvement": { label: "process improvement", aliases: ["process improvement", "process optimization", "process optimisation", "continuous improvement"], careerTerms: ["process", "operations"] },
  "api-integration": { label: "API and system integration", aliases: ["ai integration", "api integration", "system integration", "rest api", "apis", "api", "webhooks", "webhook"], careerTerms: ["apis", "api", "connect", "integration"] },
  "solution-architecture": { label: "solution and product architecture", aliases: ["product architecture", "solution architecture", "system architecture", "solution design", "architecture"], careerTerms: ["architecture", "solution framing", "design"] },
  "power-platform": { label: "workflow platforms", aliases: ["power platform", "power automate", "power apps", "copilot studio", "dataverse", "uipath", "n8n", "make.com", "zapier"], careerTerms: ["workflow platforms", "copilot studio", "microsoft 365 copilot", "rpa"] },
  deployment: { label: "production deployment", aliases: ["production deployment", "deployed", "deployment", "launched", "production operations", "ci/cd"], careerTerms: ["deploy", "production", "delivery", "launch"] },
  "human-in-loop": { label: "human-in-the-loop controls", aliases: ["human-in-the-loop", "human in the loop", "human approval", "approval controls", "human-and-ai"], careerTerms: ["human-and-ai", "governed", "responsible"] },
  "software-engineering": { label: "software engineering", aliases: ["software engineering", "typescript", "javascript", "next.js", "nextjs", "node.js", "react", "git", "github", "testing"], careerTerms: ["build", "applications", "engineering", "systems"] },
  "data-analysis": { label: "data and operational analysis", aliases: ["data analysis", "data analytics", "operational analytics", "analytics", "kpi analysis", "operational kpi", "kpis", "kpi", "analytical skills"], careerTerms: ["analysis", "analytics", "insights"] },
  "business-intelligence": { label: "business intelligence and dashboards", aliases: ["business intelligence", "power bi", "tableau", "dashboards", "dashboard", "dax", "power query", "semantic model"], careerTerms: ["dashboards", "business intelligence", "semantic models"] },
  reporting: { label: "reporting and decision-ready insight", aliases: ["reporting", "reports", "decision-ready insights", "decision support", "decision-support", "kpi reporting"], careerTerms: ["reporting", "decision-ready insights", "decisions"] },
  sql: { label: "SQL", aliases: ["sql", "postgresql", "mysql", "t-sql"], careerTerms: ["sql", "datasets"] },
  "data-modeling": { label: "data modeling", aliases: ["data modeling", "data modelling", "data model", "data models", "dimensional modeling", "dimensional modelling"], careerTerms: ["data models", "semantic models", "datasets"] },
  forecasting: { label: "forecasting", aliases: ["forecasting", "forecasts", "forecast", "demand forecast", "predictive forecasting"], careerTerms: ["forecasting", "prediction"] },
  statistics: { label: "statistical modeling", aliases: ["statistical modeling", "statistical modelling", "statistical analysis", "statistics", "probability", "regression analysis"], careerTerms: ["statistics", "statistical"] },
  experimentation: { label: "experimental design", aliases: ["experimental design", "experimentation", "controlled experiment", "a/b testing", "ab testing", "hypothesis testing"], careerTerms: ["experimentation", "experiments"] },
  "machine-learning": { label: "machine-learning model development", aliases: ["machine learning", "ml model", "ml models", "predictive model", "scikit-learn", "sklearn", "pytorch", "tensorflow", "random forest", "gradient boosting"], careerTerms: ["machine learning", "production ml", "models"] },
  "python-ml": { label: "Python ML stack", aliases: ["python", "pandas", "numpy", "scikit-learn", "sklearn", "jupyter"], careerTerms: ["python", "machine learning"] },
  "causal-reasoning": { label: "causal inference", aliases: ["causal inference", "causal reasoning", "causal analysis", "treatment effect", "causal model"], careerTerms: ["causal reasoning", "causal"] },
  "model-validation": { label: "scientific model validation", aliases: ["model validation", "cross-validation", "cross validation", "model evaluation", "validation metrics", "precision and recall", "roc auc", "rmse"], careerTerms: ["model validation", "evaluation", "reliable"] },
  "data-pipelines": { label: "data platforms and pipelines", aliases: ["data pipeline", "data pipelines", "etl", "elt", "dbt", "airflow", "databricks", "data warehouse", "data platform"], careerTerms: ["data platforms", "pipelines", "transformations"] },
  "business-analysis": { label: "business analysis", aliases: ["business analysis", "business analyst", "business questions", "requirements analysis", "problem definition", "problem framing"], careerTerms: ["business questions", "business needs", "business problems"] },
  "decision-support": { label: "decision support", aliases: ["decision support", "decision-support", "decision making", "decision-making", "planning decisions"], careerTerms: ["decisions", "decision-ready"] },
  operations: { label: "business operations", aliases: ["business operations", "operations", "operational planning", "capacity planning", "logistics", "warehouse"], careerTerms: ["business operations", "operations", "operational"] },
  "consulting-discovery": { label: "consulting and discovery", aliases: ["consulting", "consultant", "discovery", "opportunity assessment", "requirements workshop", "workshop", "solution framing"], careerTerms: ["discovery", "opportunity assessment", "consult", "advise"] },
  "stakeholder-management": { label: "stakeholder leadership", aliases: ["stakeholder management", "stakeholders", "stakeholder", "executive stakeholders", "cross-functional"], careerTerms: ["stakeholder", "teams", "organizations"] },
  "product-strategy": { label: "product strategy and discovery", aliases: ["product strategy", "product discovery", "product management", "roadmap", "user research", "customer problem"], careerTerms: ["product", "discovery", "strategy", "customer problems"] },
  transformation: { label: "AI and digital transformation", aliases: ["ai transformation", "digital transformation", "transformation", "business transformation"], careerTerms: ["transformation", "business change"] },
  governance: { label: "AI governance", aliases: ["ai governance", "responsible ai", "governance", "risk controls", "policy controls", "compliance"], careerTerms: ["governance", "responsible", "risk"] },
  "enterprise-strategy": { label: "enterprise AI strategy", aliases: ["enterprise ai strategy", "enterprise strategy", "operating model", "portfolio investment", "enterprise architecture", "sourcing strategy"], careerTerms: ["enterprise", "strategy", "operating models", "portfolio investment"] },
  "value-realization": { label: "business value realization", aliases: ["value realization", "value realisation", "business value", "business case", "roi", "measurable value"], careerTerms: ["value realization", "value analysis", "measurable business change"] },
  "change-management": { label: "change and adoption", aliases: ["change management", "adoption", "enablement", "training strategy", "organizational change", "organisational change"], careerTerms: ["adoption", "change management", "enablement"] },
  "cloud-infrastructure": { label: "cloud infrastructure", aliases: ["cloud infrastructure", "azure", "aws", "gcp", "terraform", "kubernetes", "docker", "platform services"], careerTerms: ["cloud", "infrastructure", "platform services"] },
  devops: { label: "DevOps and delivery systems", aliases: ["devops", "ci/cd", "continuous delivery", "observability", "infrastructure as code", "site reliability"], careerTerms: ["delivery", "observability", "infrastructure", "operational systems"] },
  "security-operations": { label: "security operations", aliases: ["cybersecurity", "security operations", "incident response", "threat detection", "vulnerability management", "iam", "cloud security", "zero trust", "siem", "soc"], careerTerms: ["security", "incident response", "vulnerability", "cyber risk"] },
  "knowledge-engineering": { label: "knowledge engineering", aliases: ["knowledge engineering", "knowledge graph", "rag", "retrieval augmented generation", "vector database", "semantic search", "information retrieval"], careerTerms: ["knowledge", "retrieval", "rag", "search"] },
  "marketing-analytics": { label: "AI marketing and measurement", aliases: ["ai marketing", "digital marketing", "marketing automation", "campaign analytics", "segmentation", "lifecycle", "google analytics"], careerTerms: ["marketing", "campaigns", "segmentation", "growth"] },
  "content-strategy": { label: "content strategy", aliases: ["content strategy", "content systems", "editorial workflow", "editorial", "audience research", "content operations"], careerTerms: ["content", "editorial", "audience"] },
  "generative-discovery": { label: "generative discoverability", aliases: ["generative engine optimization", "generative engine optimisation", "geo", "answer engine optimization", "answer engine optimisation", "llmo", "structured data", "schema.org"], careerTerms: ["generative answer engines", "retrieval", "citation", "discoverability"] },
} as const satisfies Record<string, CapabilityDefinition>;

export type CapabilityId = keyof typeof CAPABILITIES;

export type CareerRequirementGroup = {
  id: string;
  label: string;
  capabilities: readonly CapabilityId[];
};

export type ResolvedCareerRequirements = {
  core: readonly CareerRequirementGroup[];
  supporting: readonly CapabilityId[];
  transferable: readonly CapabilityId[];
  directCapabilities: readonly CapabilityId[];
  minimumCoreCoverage: number;
  source: "explicit" | "catalog-derived";
};

type RequirementProfile = Omit<ResolvedCareerRequirements, "source" | "directCapabilities"> & {
  directCapabilities?: readonly CapabilityId[];
};

const group = (id: string, label: string, ...capabilities: CapabilityId[]): CareerRequirementGroup => ({ id, label, capabilities });

const PROFILES: Partial<Record<string, RequirementProfile>> = {
  "data-scientist": {
    core: [
      group("statistics", "statistical modeling", "statistics"),
      group("experimentation", "experimentation or causal inference", "experimentation", "causal-reasoning"),
      group("ml-development", "machine-learning model development", "machine-learning"),
      group("model-validation", "scientific model validation", "model-validation"),
    ],
    supporting: ["python-ml", "data-analysis", "forecasting", "data-modeling"],
    transferable: ["business-analysis", "decision-support", "business-intelligence", "operations"],
    directCapabilities: ["statistics", "experimentation", "causal-reasoning", "machine-learning", "model-validation"],
    minimumCoreCoverage: 0.6,
  },
  "data-analyst": {
    core: [
      group("analysis", "business and data analysis", "data-analysis", "business-analysis"),
      group("decision-output", "dashboards, reporting or decision-ready insight", "business-intelligence", "reporting", "decision-support"),
      group("data-handling", "structured data handling", "sql", "data-modeling", "business-intelligence"),
    ],
    supporting: ["sql", "forecasting", "statistics", "experimentation"],
    transferable: ["operations", "process-improvement", "stakeholder-management"],
    directCapabilities: ["data-analysis", "business-intelligence", "reporting", "sql", "data-modeling"],
    minimumCoreCoverage: 0.55,
  },
  "bi-developer": {
    core: [group("bi", "business-intelligence product development", "business-intelligence"), group("models", "governed data or semantic models", "data-modeling", "sql"), group("delivery", "reliable BI delivery", "reporting", "deployment")],
    supporting: ["data-pipelines", "data-analysis"],
    transferable: ["business-analysis", "decision-support", "stakeholder-management"],
    minimumCoreCoverage: 0.6,
  },
  "data-engineer": {
    core: [group("pipelines", "data platforms and pipelines", "data-pipelines"), group("engineering", "software or data engineering", "software-engineering", "sql"), group("operations", "reliable platform operations", "deployment", "cloud-infrastructure", "devops")],
    supporting: ["data-modeling", "governance"],
    transferable: ["data-analysis", "business-intelligence"],
    minimumCoreCoverage: 0.6,
  },
  "ai-automation-specialist": {
    core: [group("automation", "AI or process automation", "ai-automation", "process-automation"), group("workflow", "workflow design", "workflow-design", "process-design"), group("integration", "API or system integration", "api-integration"), group("implementation", "implemented and deployed solutions", "deployment", "ai-product")],
    supporting: ["ai-agents", "power-platform", "human-in-loop", "solution-architecture"],
    transferable: ["process-improvement", "operations", "business-analysis", "decision-support"],
    directCapabilities: ["ai-automation", "ai-agents", "ai-product"],
    minimumCoreCoverage: 0.55,
  },
  "intelligent-automation-engineer": {
    core: [group("automation", "enterprise automation", "ai-automation", "process-automation", "power-platform"), group("integration", "workflow and API integration", "workflow-design", "api-integration"), group("engineering", "production engineering", "software-engineering", "deployment")],
    supporting: ["ai-agents", "governance", "process-design"],
    transferable: ["process-improvement", "operations", "business-analysis"],
    minimumCoreCoverage: 0.6,
  },
  "ai-integration-specialist": {
    core: [group("integration", "AI and system integration", "api-integration"), group("engineering", "software implementation", "software-engineering"), group("production", "safe production delivery", "deployment", "governance")],
    supporting: ["solution-architecture", "ai-product", "cloud-infrastructure"],
    transferable: ["workflow-design", "business-analysis"],
    minimumCoreCoverage: 0.6,
  },
  "ai-workflow-architect": {
    core: [group("workflow", "workflow architecture", "workflow-design", "process-design"), group("systems", "system and API integration", "api-integration", "solution-architecture"), group("governance", "governed human-and-AI operation", "governance", "human-in-loop")],
    supporting: ["ai-agents", "ai-automation", "deployment"],
    transferable: ["operations", "process-improvement", "stakeholder-management"],
    directCapabilities: ["workflow-design", "solution-architecture", "human-in-loop", "governance"],
    minimumCoreCoverage: 0.6,
  },
  "microsoft-copilot-consultant": {
    core: [group("platform", "Microsoft Copilot or Power Platform", "power-platform"), group("workflow", "business workflow design", "workflow-design", "process-design"), group("delivery", "secure adoption and deployment", "deployment", "governance", "change-management")],
    supporting: ["ai-agents", "api-integration", "consulting-discovery"],
    transferable: ["stakeholder-management", "business-analysis", "process-improvement"],
    minimumCoreCoverage: 0.55,
  },
  "ai-engineer": {
    core: [group("product", "AI application or product implementation", "ai-product", "machine-learning"), group("engineering", "software engineering", "software-engineering"), group("production", "production deployment", "deployment"), group("integration", "model or API integration", "api-integration")],
    supporting: ["python-ml", "model-validation", "cloud-infrastructure"],
    transferable: ["solution-architecture", "data-analysis"],
    minimumCoreCoverage: 0.6,
  },
  "ai-product-manager": {
    core: [group("product", "AI product discovery and strategy", "product-strategy", "ai-product"), group("stakeholders", "stakeholder leadership", "stakeholder-management"), group("delivery", "delivery, launch or adoption", "deployment", "change-management"), group("evaluation", "product evaluation or responsible delivery", "experimentation", "governance", "value-realization")],
    supporting: ["business-analysis", "consulting-discovery"],
    transferable: ["operations", "process-improvement", "decision-support"],
    minimumCoreCoverage: 0.55,
  },
  "ai-solutions-consultant": {
    core: [group("discovery", "consulting discovery", "consulting-discovery", "business-analysis"), group("solution", "solution framing", "solution-architecture", "api-integration"), group("value", "value and adoption planning", "value-realization", "change-management"), group("stakeholders", "stakeholder facilitation", "stakeholder-management")],
    supporting: ["governance", "ai-product", "transformation"],
    transferable: ["operations", "process-improvement", "decision-support"],
    minimumCoreCoverage: 0.55,
  },
  "business-ai-consultant": {
    core: [group("opportunity", "AI opportunity and business analysis", "consulting-discovery", "business-analysis"), group("change", "measurable business change", "value-realization", "transformation"), group("delivery", "governed solution and adoption planning", "governance", "change-management")],
    supporting: ["stakeholder-management", "ai-product", "solution-architecture"],
    transferable: ["operations", "decision-support", "process-improvement"],
    minimumCoreCoverage: 0.55,
  },
  "enterprise-ai-consultant": {
    core: [group("strategy", "enterprise AI strategy", "enterprise-strategy"), group("governance", "governance and responsible scale", "governance"), group("transformation", "enterprise transformation and adoption", "transformation", "change-management"), group("stakeholders", "executive stakeholder advisory", "stakeholder-management", "consulting-discovery")],
    supporting: ["solution-architecture", "value-realization"],
    transferable: ["operations", "business-analysis", "decision-support"],
    minimumCoreCoverage: 0.6,
  },
  "ai-transformation-consultant": {
    core: [group("transformation", "AI transformation delivery", "transformation"), group("operating-model", "strategy and operating models", "enterprise-strategy"), group("adoption", "adoption and change", "change-management"), group("governance", "responsible-AI governance", "governance")],
    supporting: ["value-realization", "stakeholder-management", "consulting-discovery"],
    transferable: ["operations", "process-improvement", "business-analysis"],
    minimumCoreCoverage: 0.6,
  },
  "ai-adoption-consultant": {
    core: [group("adoption", "AI adoption and enablement", "change-management"), group("workflow", "workflow redesign", "workflow-design", "process-design"), group("governance", "responsible governance", "governance"), group("value", "measurable adoption value", "value-realization")],
    supporting: ["stakeholder-management", "consulting-discovery"],
    transferable: ["operations", "process-improvement", "business-analysis"],
    minimumCoreCoverage: 0.55,
  },
};

const DOMAIN_DEFAULTS: Record<string, { supporting: CapabilityId[]; transferable: CapabilityId[] }> = {
  "AI Engineering": { supporting: ["software-engineering", "deployment", "api-integration"], transferable: ["data-analysis", "solution-architecture"] },
  "AI Product": { supporting: ["product-strategy", "stakeholder-management", "ai-product"], transferable: ["business-analysis", "operations"] },
  "AI Automation": { supporting: ["ai-automation", "process-automation", "workflow-design", "api-integration"], transferable: ["process-improvement", "operations"] },
  "Enterprise AI & Consulting": { supporting: ["consulting-discovery", "stakeholder-management", "transformation"], transferable: ["business-analysis", "operations"] },
  "AI Data & Analytics": { supporting: ["data-analysis", "data-modeling", "reporting"], transferable: ["business-analysis", "decision-support"] },
  "AI Infrastructure & Security": { supporting: ["cloud-infrastructure", "devops", "security-operations"], transferable: ["software-engineering", "governance"] },
  "AI Marketing": { supporting: ["marketing-analytics", "content-strategy", "generative-discovery"], transferable: ["data-analysis", "experimentation"] },
};

export function normalizeEvidenceText(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/&/g, " and ").replace(/[–—]/g, "-").replace(/[^a-z0-9+#.%/ -]+/g, " ").replace(/\s+/g, " ").trim();
}

function containsPhrase(text: string, phrase: string) {
  const normalizedPhrase = normalizeEvidenceText(phrase);
  return Boolean(normalizedPhrase) && ` ${normalizeEvidenceText(text)} `.includes(` ${normalizedPhrase} `);
}

export function capabilityAppears(text: string, capabilityId: CapabilityId) {
  return CAPABILITIES[capabilityId].aliases.some((alias) => containsPhrase(text, alias));
}

export function capabilityLabel(capabilityId: CapabilityId) {
  return CAPABILITIES[capabilityId].label;
}

export function findCapabilities(text: string): CapabilityId[] {
  return (Object.keys(CAPABILITIES) as CapabilityId[]).filter((capabilityId) => capabilityAppears(text, capabilityId));
}

function unique<T>(values: readonly T[]) {
  return [...new Set(values)];
}

function catalogDerived(career: CareerReference): ResolvedCareerRequirements {
  const catalogText = `${career.title} ${career.domain} ${career.description}`;
  const selected = (Object.keys(CAPABILITIES) as CapabilityId[]).filter((capabilityId) =>
    CAPABILITIES[capabilityId].careerTerms.some((term) => containsPhrase(catalogText, term)),
  );
  const defaults = DOMAIN_DEFAULTS[career.domain] ?? { supporting: [] as CapabilityId[], transferable: [] as CapabilityId[] };
  const coreIds = unique([...selected, ...defaults.supporting]).slice(0, 4);
  return {
    core: coreIds.map((capabilityId) => group(capabilityId, capabilityLabel(capabilityId), capabilityId)),
    supporting: unique([...selected.slice(4), ...defaults.supporting]).filter((capabilityId) => !coreIds.includes(capabilityId)).slice(0, 5),
    transferable: defaults.transferable,
    directCapabilities: coreIds,
    minimumCoreCoverage: 0.5,
    source: "catalog-derived",
  };
}

export function resolveCareerRequirements(career: CareerReference): ResolvedCareerRequirements {
  const explicit = PROFILES[career.slug];
  if (!explicit) return catalogDerived(career);
  return {
    ...explicit,
    directCapabilities: explicit.directCapabilities ?? unique(explicit.core.flatMap((requirement) => requirement.capabilities)),
    source: "explicit",
  };
}
