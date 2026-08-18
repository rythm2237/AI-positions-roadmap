export type SemanticCVProfile = {
  fullName: string;
  headline: string;
  targetPosition: string;
  openToSuggestions: boolean;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  projects: string;
  certifications: string;
  languages: string;
  weeklyHours: string;
  linkedinUrl: string;
};

export type CareerReference = {
  slug: string;
  title: string;
  domain: string;
  description: string;
};

export type SemanticScoreRow = { label: string; score: number; note: string };

export type SemanticCVAnalysis = {
  overall: number;
  verdict: string;
  rows: SemanticScoreRow[];
  strengths: string[];
  gaps: string[];
  nextActions: string[];
  matches: { title: string; match: number; weeks: string }[];
};

type SectionKey =
  | "summary"
  | "experience"
  | "skills"
  | "education"
  | "projects"
  | "certifications"
  | "languages";

type ParsedCV = {
  sections: Record<SectionKey, string>;
  header: string;
  explicitSections: Set<SectionKey>;
  summaryInferred: boolean;
  wordCount: number;
};

const SECTION_ALIASES: Record<SectionKey, string[]> = {
  summary: [
    "summary",
    "professional summary",
    "profile",
    "professional profile",
    "career profile",
    "about me",
    "objective",
    "career objective",
    "executive summary",
  ],
  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment history",
    "career history",
    "work history",
    "employment",
  ],
  skills: [
    "skills",
    "technical skills",
    "core skills",
    "key skills",
    "competencies",
    "core competencies",
    "tools and technologies",
    "technologies",
    "expertise",
  ],
  education: [
    "education",
    "academic background",
    "academic history",
    "education and training",
    "qualifications",
  ],
  projects: [
    "projects",
    "selected projects",
    "key projects",
    "portfolio",
    "personal projects",
    "professional projects",
  ],
  certifications: [
    "certifications",
    "certificates",
    "licenses and certifications",
    "certificates and licenses",
    "professional certifications",
  ],
  languages: ["languages", "language skills", "language proficiency"],
};

const ACTION_VERBS = [
  "achieved", "automated", "built", "created", "delivered", "designed", "developed", "drove",
  "enabled", "established", "implemented", "improved", "increased", "launched", "led", "managed",
  "migrated", "optimized", "orchestrated", "reduced", "redesigned", "resolved", "scaled", "streamlined",
  "transformed", "integrated", "analyzed", "analysed", "deployed", "coordinated", "owned", "introduced",
];

const OUTCOME_TERMS = [
  "accuracy", "adoption", "cost", "efficiency", "growth", "kpi", "quality", "revenue", "roi", "saved",
  "saving", "sla", "throughput", "time saved", "productivity", "performance", "conversion", "cycle time",
  "lead time", "utilization", "utilisation", "availability", "reliability", "compliance", "risk reduction",
];

const SKILL_GROUPS: Record<string, string[]> = {
  data: [
    "sql", "power bi", "tableau", "excel", "dax", "power query", "python", "pandas", "statistics",
    "data analysis", "data analytics", "dashboard", "reporting", "data modeling", "data modelling", "etl",
    "fabric", "databricks", "spark", "dbt", "airflow", "data warehouse",
  ],
  automation: [
    "power automate", "power apps", "copilot studio", "n8n", "make.com", "make", "zapier", "uipath", "rpa",
    "workflow automation", "process automation", "webhook", "webhooks", "rest api", "api", "apis", "dataverse",
  ],
  ai: [
    "artificial intelligence", "generative ai", "llm", "llms", "openai", "anthropic", "prompt engineering",
    "rag", "retrieval augmented generation", "embeddings", "vector database", "ai agents", "agents",
    "machine learning", "scikit-learn", "pytorch", "transformers", "model evaluation",
  ],
  productConsulting: [
    "stakeholder management", "stakeholder", "requirements", "business analysis", "business analyst", "consulting",
    "discovery", "workshop", "product strategy", "roadmap", "user research", "change management", "adoption",
    "process mapping", "process analysis", "solution design", "business case", "value realization", "value realisation",
  ],
  engineering: [
    "javascript", "typescript", "react", "next.js", "nextjs", "node.js", "nodejs", "git", "github", "docker",
    "kubernetes", "terraform", "azure", "aws", "gcp", "ci/cd", "linux", "oauth", "json", "microservices",
  ],
  security: [
    "cybersecurity", "security", "siem", "soc", "incident response", "vulnerability management", "iam",
    "identity", "threat detection", "cloud security", "zero trust", "compliance",
  ],
  marketingContent: [
    "seo", "geo", "content strategy", "content marketing", "campaign", "crm", "segmentation", "lifecycle",
    "marketing automation", "google analytics", "analytics", "experimentation", "a/b testing", "editorial",
  ],
};

const DOMAIN_TERMS: Record<string, string[]> = {
  "AI Engineering": ["python", "llm", "machine learning", "api", "model", "rag", "deployment", "evaluation"],
  "AI Product": ["product", "roadmap", "discovery", "user", "stakeholder", "metrics", "experiment", "launch"],
  "AI Automation": ["automation", "workflow", "process", "api", "power automate", "n8n", "copilot", "rpa"],
  "Enterprise AI & Consulting": ["consulting", "stakeholder", "strategy", "governance", "adoption", "value", "transformation", "business"],
  "AI Data & Analytics": ["data", "sql", "analytics", "dashboard", "python", "model", "reporting", "pipeline"],
  "AI Infrastructure & Security": ["cloud", "azure", "aws", "security", "infrastructure", "deployment", "monitoring", "identity"],
  "AI Marketing": ["marketing", "content", "seo", "campaign", "audience", "analytics", "growth", "search"],
};

const ROLE_TERMS: Record<string, string[]> = {
  "ai-engineer": ["python", "llm", "machine learning", "rag", "api", "model evaluation", "deployment", "vector database", "pytorch", "transformers", "mlops"],
  "ai-product-manager": ["product strategy", "discovery", "roadmap", "user research", "stakeholder", "metrics", "experimentation", "launch", "adoption", "ai evaluation"],
  "ai-automation-specialist": ["workflow automation", "power automate", "n8n", "make.com", "api", "webhook", "process mapping", "copilot", "automation", "ai agents"],
  "intelligent-automation-engineer": ["rpa", "power automate", "uipath", "document intelligence", "workflow", "api", "process automation", "governance", "process mining", "automation"],
  "microsoft-copilot-consultant": ["copilot studio", "microsoft 365", "power platform", "power automate", "dataverse", "sharepoint", "teams", "governance", "connectors", "adoption"],
  "ai-integration-specialist": ["api", "rest api", "webhook", "oauth", "json", "integration", "middleware", "data mapping", "event", "systems"],
  "ai-workflow-architect": ["workflow", "orchestration", "ai agents", "api", "state", "handoff", "governance", "process", "architecture", "automation"],
  "ai-solutions-consultant": ["discovery", "stakeholder", "requirements", "solution design", "business case", "roi", "architecture", "workshop", "consulting", "governance"],
  "ai-transformation-consultant": ["transformation", "operating model", "portfolio", "governance", "change management", "adoption", "strategy", "value realization", "roadmap", "stakeholder"],
  "business-ai-consultant": ["business analysis", "stakeholder", "process analysis", "roi", "use case", "value", "adoption", "consulting", "requirements", "automation"],
  "enterprise-ai-consultant": ["enterprise architecture", "governance", "strategy", "portfolio", "operating model", "sourcing", "risk", "executive", "adoption", "transformation"],
  "ai-adoption-consultant": ["change management", "training", "enablement", "adoption", "communication", "governance", "workflow redesign", "stakeholder", "measurement", "business"],
  "data-analyst": ["sql", "power bi", "tableau", "excel", "data analysis", "dashboard", "kpi", "statistics", "reporting", "insights"],
  "bi-developer": ["power bi", "dax", "semantic model", "sql", "etl", "data model", "dashboard", "power query", "fabric", "reporting"],
  "data-engineer": ["sql", "python", "etl", "elt", "pipeline", "spark", "databricks", "data warehouse", "cloud", "dbt", "airflow"],
  "data-scientist": ["python", "statistics", "machine learning", "pandas", "scikit-learn", "experiment", "model", "feature", "causal", "sql"],
  "ai-knowledge-engineer": ["rag", "vector database", "embeddings", "knowledge graph", "taxonomy", "retrieval", "search", "evaluation", "llm", "ontology"],
  "cloud-engineer": ["azure", "aws", "gcp", "terraform", "kubernetes", "docker", "networking", "iam", "monitoring", "infrastructure", "cloud"],
  "devops-engineer": ["ci/cd", "github actions", "docker", "kubernetes", "terraform", "observability", "linux", "cloud", "deployment", "automation"],
  "cybersecurity-analyst": ["siem", "incident response", "vulnerability", "soc", "detection", "identity", "iam", "security", "threat", "cloud security"],
  "generative-engine-optimization-specialist": ["seo", "generative engine", "structured data", "schema", "entity", "citation", "content", "search", "analytics", "llm"],
  "ai-marketing-specialist": ["campaign", "segmentation", "crm", "lifecycle", "analytics", "experimentation", "content", "growth", "marketing automation", "ai"],
  "ai-content-strategist": ["content strategy", "editorial", "audience", "content operations", "governance", "seo", "distribution", "analytics", "knowledge architecture", "ai"],
};

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "build", "for", "from", "in", "into", "of", "on", "or",
  "that", "the", "through", "to", "use", "using", "with", "across", "existing", "reliable", "responsible",
  "practical", "business", "ai", "systems", "solutions", "data", "role", "roles", "work", "teams",
]);

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9+#.%/ -]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizedHeading(value: string) {
  return normalize(value.replace(/[:|•·]+$/g, "")).replace(/\s+/g, " ");
}

function words(value: string) {
  return normalize(value).split(" ").filter(Boolean);
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function countPhrase(text: string, phrase: string) {
  const normalizedText = normalize(text);
  const normalizedPhrase = normalize(phrase);
  if (!normalizedPhrase) return 0;
  let count = 0;
  let cursor = 0;
  while (true) {
    const index = normalizedText.indexOf(normalizedPhrase, cursor);
    if (index < 0) break;
    count += 1;
    cursor = index + normalizedPhrase.length;
  }
  return count;
}

function detectHeading(line: string): SectionKey | null {
  const heading = normalizedHeading(line);
  if (!heading || heading.length > 48 || heading.split(" ").length > 6) return null;
  for (const [key, aliases] of Object.entries(SECTION_ALIASES) as [SectionKey, string[]][]) {
    if (aliases.includes(heading)) return key;
  }
  return null;
}

function parseCV(text: string): ParsedCV {
  const cleaned = text
    .replace(/\r/g, "")
    .replace(/^\s*--\s*\d+\s+of\s+\d+\s*--\s*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const lines = cleaned.split("\n").map((line) => line.trim()).filter(Boolean);
  const buckets: Record<SectionKey, string[]> = {
    summary: [], experience: [], skills: [], education: [], projects: [], certifications: [], languages: [],
  };
  const header: string[] = [];
  const explicitSections = new Set<SectionKey>();
  let current: SectionKey | null = null;

  for (const line of lines) {
    const heading = detectHeading(line);
    if (heading) {
      current = heading;
      explicitSections.add(heading);
      continue;
    }
    if (current) buckets[current].push(line);
    else header.push(line);
  }

  let summaryInferred = false;
  if (!buckets.summary.length && header.length) {
    const candidates = header.filter((line, index) => {
      if (index < 2 && words(line).length <= 8) return false;
      if (/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(line)) return false;
      if (/linkedin\.com|github\.com|https?:\/\//i.test(line)) return false;
      if (/\+?\d[\d\s().-]{7,}/.test(line)) return false;
      return words(line).length >= 6;
    });
    const inferred = candidates.join(" ").slice(0, 900).trim();
    if (words(inferred).length >= 18) {
      buckets.summary.push(inferred);
      summaryInferred = true;
    }
  }

  return {
    sections: Object.fromEntries(
      Object.entries(buckets).map(([key, value]) => [key, value.join("\n").trim()]),
    ) as Record<SectionKey, string>,
    header: header.join("\n"),
    explicitSections,
    summaryInferred,
    wordCount: words(cleaned).length,
  };
}

function metricEvidence(text: string) {
  const patterns = [
    /\b\d+(?:\.\d+)?\s*%\b/g,
    /(?:€|\$|£)\s?\d[\d,.]*(?:\s?[kmb])?/gi,
    /\b\d{1,3}(?:,\d{3})+\b/g,
    /\b\d+(?:\.\d+)?\s*(?:hours?|hrs?|days?|weeks?|months?|users?|customers?|employees?|people|projects?|workflows?|processes?|reports?|dashboards?|sites?|locations?|countries?|minutes?|seconds?)\b/gi,
    /\b(?:saved|reduced|increased|improved|grew|cut|decreased|accelerated)\s+(?:by\s+)?\d+(?:\.\d+)?/gi,
  ];
  return patterns.reduce((sum, pattern) => sum + (text.match(pattern)?.length ?? 0), 0);
}

function dateRangeEvidence(text: string) {
  const yearRanges = text.match(/\b(?:19|20)\d{2}\s*(?:-|to|–|—)\s*(?:(?:19|20)\d{2}|present|current|now)\b/gi)?.length ?? 0;
  const monthYears = text.match(/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(?:19|20)\d{2}\b/gi)?.length ?? 0;
  return yearRanges + Math.floor(monthYears / 2);
}

function actionEvidence(text: string) {
  const normalizedText = normalize(text);
  return ACTION_VERBS.reduce((sum, verb) => sum + countPhrase(normalizedText, verb), 0);
}

function outcomeEvidence(text: string) {
  const normalizedText = normalize(text);
  return OUTCOME_TERMS.reduce((sum, term) => sum + countPhrase(normalizedText, term), 0);
}

function contactSignals(text: string) {
  return {
    email: /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(text),
    phone: /\+?\d[\d\s().-]{7,}/.test(text),
    linkedin: /linkedin\.com\/in\//i.test(text),
    portfolio: /github\.com|portfolio|behance\.net|dribbble\.com|notion\.site/i.test(text),
  };
}

function allSkillPhrases() {
  return unique(Object.values(SKILL_GROUPS).flat()).sort((a, b) => b.length - a.length);
}

function detectedSkills(text: string) {
  const normalizedText = normalize(text);
  return allSkillPhrases().filter((skill) => normalizedText.includes(normalize(skill)));
}

function skillGroupCoverage(skills: string[]) {
  const skillSet = new Set(skills.map(normalize));
  return Object.values(SKILL_GROUPS).filter((group) => group.some((skill) => skillSet.has(normalize(skill)))).length;
}

function mergeSection(profileValue: string, parsedValue: string) {
  return [profileValue.trim(), parsedValue.trim()].filter(Boolean).join("\n").trim();
}

function scoreSummary(summary: string, inferred: boolean) {
  if (!summary.trim()) return 12;
  const count = words(summary).length;
  const lengthFit = count >= 35 && count <= 120 ? 32 : count >= 22 && count <= 160 ? 23 : 12;
  const specificity = unique(detectedSkills(summary)).length;
  const evidence = metricEvidence(summary) + outcomeEvidence(summary);
  const roleLanguage = /\b(?:specialist|manager|engineer|consultant|analyst|developer|architect|leader|professional|planner|strategist)\b/i.test(summary);
  let score = 25 + lengthFit + Math.min(20, specificity * 3) + Math.min(15, evidence * 4) + (roleLanguage ? 8 : 0);
  if (inferred) score = Math.min(score, 82);
  return clamp(score);
}

function scoreExperience(experience: string, fallbackText: string) {
  const text = experience.trim() || fallbackText;
  if (words(text).length < 35) return 18;
  const actions = actionEvidence(text);
  const metrics = metricEvidence(text);
  const outcomes = outcomeEvidence(text);
  const dates = dateRangeEvidence(text);
  const lineCount = text.split("\n").filter((line) => words(line).length >= 4).length;
  return clamp(
    25 +
    Math.min(24, actions * 2.4) +
    Math.min(22, metrics * 4) +
    Math.min(14, outcomes * 2) +
    Math.min(10, dates * 3) +
    Math.min(8, lineCount),
  );
}

function scoreEvidence(source: string, projects: string) {
  const metrics = metricEvidence(source);
  const outcomes = outcomeEvidence(source);
  const actions = actionEvidence(source);
  const projectSignals = words(projects).length >= 20 ? 12 : words(projects).length >= 8 ? 6 : 0;
  const portfolioSignal = contactSignals(source).portfolio ? 8 : 0;
  return clamp(12 + Math.min(42, metrics * 6) + Math.min(20, outcomes * 2) + Math.min(8, Math.floor(actions / 3)) + projectSignals + portfolioSignal);
}

function scoreSkills(skillsSection: string, source: string, experience: string, projects: string) {
  const declared = unique(detectedSkills(skillsSection));
  const allDetected = unique(detectedSkills(source));
  const evidenceText = `${experience}\n${projects}`;
  const evidenced = allDetected.filter((skill) => normalize(evidenceText).includes(normalize(skill)));
  const groups = skillGroupCoverage(allDetected);
  return clamp(
    15 +
    Math.min(35, allDetected.length * 3) +
    Math.min(18, declared.length * 2) +
    Math.min(20, evidenced.length * 2.5) +
    Math.min(12, groups * 3),
  );
}

function scoreStructure(parsed: ParsedCV, source: string, profile: SemanticCVProfile) {
  const contacts = contactSignals(source);
  const explicit = parsed.explicitSections;
  let score = 10;
  score += contacts.email ? 9 : 0;
  score += contacts.phone ? 5 : 0;
  score += contacts.linkedin || profile.linkedinUrl ? 4 : 0;
  score += explicit.has("experience") || profile.experience ? 22 : 0;
  score += explicit.has("skills") || profile.skills ? 15 : 0;
  score += explicit.has("education") || profile.education ? 12 : 0;
  score += explicit.has("summary") || profile.summary ? 13 : parsed.summaryInferred ? 7 : 0;
  score += explicit.has("projects") || profile.projects ? 5 : 0;
  score += explicit.has("certifications") || profile.certifications ? 3 : 0;
  score += dateRangeEvidence(source) >= 1 ? 6 : 0;
  return clamp(score);
}

function scoreATS(parsed: ParsedCV, source: string, profile: SemanticCVProfile) {
  const contacts = contactSignals(source);
  const chars = source.length || 1;
  const oddChars = source.match(/[�\u0000]/g)?.length ?? 0;
  const readableRatio = 1 - oddChars / chars;
  const wc = parsed.wordCount;
  const lengthScore = wc >= 250 && wc <= 1400 ? 30 : wc >= 150 && wc <= 1800 ? 22 : wc >= 80 ? 14 : 5;
  const sectionScore = Math.min(30, (parsed.explicitSections.size + (profile.experience ? 1 : 0) + (profile.skills ? 1 : 0)) * 5);
  const contactScore = (contacts.email ? 8 : 0) + (contacts.phone ? 5 : 0) + (contacts.linkedin || profile.linkedinUrl ? 3 : 0);
  const chronologyScore = Math.min(10, dateRangeEvidence(source) * 3);
  return clamp(12 + lengthScore + sectionScore + contactScore + chronologyScore + (readableRatio > 0.995 ? 8 : 2));
}

function catalogTerms(career: CareerReference) {
  return unique(
    words(`${career.title} ${career.description} ${career.domain}`)
      .filter((term) => term.length >= 3 && !STOP_WORDS.has(term)),
  );
}

function matchedTerms(source: string, terms: string[]) {
  const normalizedSource = normalize(source);
  return unique(terms.map(normalize)).filter((term) => term && normalizedSource.includes(term));
}

function careerAlignment(career: CareerReference, source: string, evidenceText: string) {
  const roleTerms = ROLE_TERMS[career.slug] ?? [];
  const catalog = catalogTerms(career);
  const domain = DOMAIN_TERMS[career.domain] ?? [];
  const roleMatches = matchedTerms(source, roleTerms);
  const catalogMatches = matchedTerms(source, catalog);
  const domainMatches = matchedTerms(source, domain);
  const evidenceMatches = matchedTerms(evidenceText, roleTerms);

  const roleCoverage = roleTerms.length ? roleMatches.length / roleTerms.length : 0;
  const catalogCoverage = catalog.length ? catalogMatches.length / catalog.length : 0;
  const domainCoverage = domain.length ? domainMatches.length / domain.length : 0;
  const evidenceCoverage = roleTerms.length ? evidenceMatches.length / roleTerms.length : 0;

  return clamp(8 + roleCoverage * 52 + catalogCoverage * 18 + domainCoverage * 12 + evidenceCoverage * 10);
}

function titleSimilarity(target: string, career: CareerReference) {
  const targetWords = unique(words(target).filter((word) => !STOP_WORDS.has(word)));
  const careerWords = unique(words(career.title).filter((word) => !STOP_WORDS.has(word)));
  if (!targetWords.length || !careerWords.length) return 0;
  const overlap = targetWords.filter((word) => careerWords.includes(word)).length;
  return overlap / Math.max(targetWords.length, careerWords.length);
}

function scoreTarget(profile: SemanticCVProfile, source: string, evidenceText: string, careers: readonly CareerReference[]) {
  const ranked = careers
    .map((career) => ({ career, score: careerAlignment(career, source, evidenceText) }))
    .sort((a, b) => b.score - a.score);

  if (profile.openToSuggestions || !profile.targetPosition.trim()) {
    return ranked[0]?.score ?? 0;
  }

  const closest = careers
    .map((career) => ({ career, similarity: titleSimilarity(profile.targetPosition, career) }))
    .sort((a, b) => b.similarity - a.similarity)[0];
  if (closest && closest.similarity >= 0.34) return careerAlignment(closest.career, source, evidenceText);

  const targetTerms = unique(words(profile.targetPosition).filter((word) => word.length >= 3 && !STOP_WORDS.has(word)));
  const directCoverage = targetTerms.length ? matchedTerms(source, targetTerms).length / targetTerms.length : 0;
  return clamp(12 + directCoverage * 70 + Math.min(18, detectedSkills(evidenceText).length * 2));
}

function gapClosingEstimate(career: CareerReference, source: string, weeklyHours: number, alignment: number) {
  const roleTerms = ROLE_TERMS[career.slug] ?? catalogTerms(career).slice(0, 10);
  const missing = roleTerms.filter((term) => !normalize(source).includes(normalize(term)));
  let hours = 12 + Math.min(10, missing.length) * 6;
  if (alignment < 40) hours += 24;
  else if (alignment < 60) hours += 12;
  else if (alignment >= 80) hours = Math.max(12, hours - 12);
  const low = Math.max(2, Math.ceil(hours / weeklyHours));
  const high = Math.max(low + 1, Math.ceil((hours * 1.25) / weeklyHours));
  return `${low}–${high} weeks at ${weeklyHours}h/week`;
}

export function analyzeSemanticCV(
  profile: SemanticCVProfile,
  rawText: string,
  careers: readonly CareerReference[],
): SemanticCVAnalysis {
  const profileText = [
    profile.headline,
    profile.summary,
    profile.experience,
    profile.education,
    profile.skills,
    profile.projects,
    profile.certifications,
    profile.languages,
  ].filter(Boolean).join("\n");
  const source = [rawText, profileText].filter(Boolean).join("\n").trim();
  const parsed = parseCV(rawText || profileText);

  const summary = mergeSection(profile.summary, parsed.sections.summary);
  const experience = mergeSection(profile.experience, parsed.sections.experience);
  const education = mergeSection(profile.education, parsed.sections.education);
  const skills = mergeSection(profile.skills, parsed.sections.skills);
  const projects = mergeSection(profile.projects, parsed.sections.projects);
  const certifications = mergeSection(profile.certifications, parsed.sections.certifications);
  const evidenceText = `${experience}\n${projects}`.trim() || source;

  const summaryScore = scoreSummary(summary, parsed.summaryInferred && !profile.summary);
  const experienceScore = scoreExperience(experience, source);
  const evidenceScore = scoreEvidence(source, projects);
  const skillsScore = scoreSkills(skills, source, experience, projects);
  const targetScore = scoreTarget(profile, source, evidenceText, careers);
  const structureScore = scoreStructure(parsed, source, profile);
  const atsScore = scoreATS(parsed, source, profile);

  const rows: SemanticScoreRow[] = [
    { label: "ATS readability", score: atsScore, note: "Career OS baseline for extractability, contact signals, chronology and recognizable CV sections; not an employer ATS score." },
    { label: "Professional summary", score: summaryScore, note: "Evaluates detected or entered summary for positioning, specificity, evidence and useful length." },
    { label: "Experience quality", score: experienceScore, note: "Evaluates experience evidence using action language, chronology, scope, outcomes and measurable results." },
    { label: "Achievement evidence", score: evidenceScore, note: "Measures quantified outcomes, result language, project proof and portfolio evidence across the CV." },
    { label: "Skills relevance", score: skillsScore, note: "Detects skills in the uploaded CV and checks whether they also appear in experience or project evidence." },
    { label: "Target job alignment", score: targetScore, note: profile.openToSuggestions ? "Uses evidence alignment against the strongest matching live Career OS role." : "Compares CV evidence with the selected role or closest live Career OS role." },
    { label: "CV structure", score: structureScore, note: "Checks whether key sections, contact details and chronology can be located from the extracted CV text." },
  ];

  const weights = [0.15, 0.10, 0.22, 0.18, 0.15, 0.10, 0.10];
  const overall = clamp(rows.reduce((sum, row, index) => sum + row.score * weights[index], 0));

  const strengths: string[] = [];
  const gaps: string[] = [];
  const detected = unique(detectedSkills(source));
  const evidenced = detected.filter((skill) => normalize(evidenceText).includes(normalize(skill)));
  const metrics = metricEvidence(source);

  if (atsScore >= 75) strengths.push("The uploaded CV is text-extractable and exposes core recruiter/ATS-readable signals.");
  if (summaryScore >= 72) strengths.push("The professional summary presents a reasonably specific role identity and value proposition.");
  if (experienceScore >= 72) strengths.push("Experience contains credible action, chronology and outcome evidence.");
  if (metrics >= 4) strengths.push(`The CV contains ${metrics} measurable evidence signals rather than relying only on responsibilities.`);
  if (evidenced.length >= 6) strengths.push(`${evidenced.length} detected skills are supported inside experience or project evidence.`);

  if (structureScore < 70) gaps.push("Make Summary, Experience, Skills and Education explicit and consistently headed so recruiters can locate them quickly.");
  if (summaryScore < 65) gaps.push("Strengthen the summary with a clear role identity, domain focus and 1–2 differentiating proof points.");
  if (experienceScore < 65) gaps.push("Rewrite weak experience bullets around action + scope + outcome, and preserve clear role dates.");
  if (metrics < 3) gaps.push("Add measurable outcomes such as time saved, cost, volume, quality, adoption, revenue or performance change.");
  if (skillsScore < 65) gaps.push("Add a focused skills section and repeat important skills naturally inside experience or project evidence.");
  if (targetScore < 55) gaps.push(profile.openToSuggestions ? "Current evidence only partially aligns with the strongest Career OS roles; strengthen role-specific tools and proof." : `Evidence for ${profile.targetPosition || "the target role"} is incomplete; add role-specific skills, tools and outcomes.`);
  if (!projects && !contactSignals(source).portfolio) gaps.push("Add at least one project, case study or portfolio link when it materially proves a target-role skill.");

  const weekly = Math.max(1, Math.min(40, Number(profile.weeklyHours) || 5));
  const matches = careers
    .map((career) => {
      const match = careerAlignment(career, source, evidenceText);
      return { title: career.title, match, weeks: gapClosingEstimate(career, source, weekly, match) };
    })
    .sort((a, b) => b.match - a.match)
    .slice(0, 3);

  const firstGap = gaps[0] ?? "Tailor the strongest evidence to the role you want to pursue.";
  const nextActions = [
    firstGap,
    evidenced.length < 6
      ? "Turn important declared skills into proof by attaching them to projects, results or concrete work examples."
      : "Keep the strongest evidenced skills prominent and remove low-value or unsupported skill claims.",
    profile.openToSuggestions
      ? "Compare the top evidence-aligned Career OS roles, then run a targeted analysis for the strongest realistic direction."
      : `Create a targeted CV version for ${profile.targetPosition || "the selected role"} using the missing role-specific evidence as a checklist.`,
  ];

  return {
    overall,
    verdict:
      overall >= 85 ? "Strong Career OS CV baseline" :
      overall >= 70 ? "Competitive baseline with specific improvement opportunities" :
      overall >= 55 ? "Usable baseline, but evidence and positioning need work" :
      "Needs restructuring and stronger evidence before targeted applications",
    rows,
    strengths: strengths.length ? strengths.slice(0, 5) : ["The CV contains enough readable content to establish a Career OS baseline."],
    gaps: unique(gaps).slice(0, 6),
    nextActions,
    matches,
  };
}
