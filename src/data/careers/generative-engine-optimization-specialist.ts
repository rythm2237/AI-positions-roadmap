import { aiProductManagerCareer as workspaceLayout } from "@/data/careers/ai-product-manager";
import { applyCareerTitleAliasPolicy } from "@/data/careerTitleAliases";
import type {
  CareerAssessment,
  CareerJourneyEffortEstimate,
  CareerJourneyStage,
  CareerQuizQuestion,
  CareerResource,
  CareerWorkspaceData,
  WorkspaceDifficulty,
} from "@/types/careerWorkspace";

const slug = "generative-engine-optimization-specialist";

type ResourceDefinition = CareerResource & { minMinutes: number; maxMinutes: number };

const resources: Record<string, ResourceDefinition> = {
  "geo-foundational-paper": {
    id: "geo-foundational-paper",
    title: "Generative Engine Optimization: Foundational Research",
    type: "Article",
    provider: "arXiv",
    cost: "Free",
    estimatedTime: "3-4 hours",
    whyUseful: "Introduces GEO visibility, controlled evaluation, and the limits of early findings.",
    url: "https://arxiv.org/abs/2311.09735",
    priority: "Essential",
    minMinutes: 180,
    maxMinutes: 240,
  },
  "geo-critical-survey": {
    id: "geo-critical-survey",
    title: "Critical Survey of Generative Engine Optimization",
    type: "Article",
    provider: "arXiv",
    cost: "Free",
    estimatedTime: "3-5 hours",
    whyUseful: "Frames GEO as stochastic and partially observable and separates evidence from unsupported market claims.",
    url: "https://arxiv.org/abs/2607.14035",
    priority: "Essential",
    minMinutes: 180,
    maxMinutes: 300,
  },
  "geo-google-ai-features": {
    id: "geo-google-ai-features",
    title: "AI Features and Your Website",
    type: "Documentation",
    provider: "Google Search Central",
    cost: "Free",
    estimatedTime: "2-3 hours",
    whyUseful: "Explains how established search fundamentals apply to AI Overviews and AI Mode.",
    url: "https://developers.google.com/search/docs/appearance/ai-features",
    priority: "Essential",
    minMinutes: 120,
    maxMinutes: 180,
  },
  "geo-search-essentials": {
    id: "geo-search-essentials",
    title: "Google Search Essentials",
    type: "Documentation",
    provider: "Google Search Central",
    cost: "Free",
    estimatedTime: "3-5 hours",
    whyUseful: "Covers technical requirements, spam policies, and people-first content principles.",
    url: "https://developers.google.com/search/docs/essentials",
    priority: "Essential",
    minMinutes: 180,
    maxMinutes: 300,
  },
  "geo-bing-ai-performance": {
    id: "geo-bing-ai-performance",
    title: "Bing Webmaster Tools AI Performance",
    type: "Article",
    provider: "Microsoft Bing",
    cost: "Free",
    estimatedTime: "2-3 hours",
    whyUseful: "Introduces cited-page, visibility, and grounding-query reporting for AI search.",
    url: "https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview",
    priority: "Essential",
    minMinutes: 120,
    maxMinutes: 180,
  },
  "geo-schema": {
    id: "geo-schema",
    title: "Schema.org Vocabulary",
    type: "Documentation",
    provider: "Schema.org",
    cost: "Free",
    estimatedTime: "4-6 hours",
    whyUseful: "Supports explicit entity, page, organization, article, term, and course relationships when visible content justifies them.",
    url: "https://schema.org/docs/full.html",
    priority: "Essential",
    minMinutes: 240,
    maxMinutes: 360,
  },
  "geo-genai-content": {
    id: "geo-genai-content",
    title: "Guidance on Generative AI Content",
    type: "Documentation",
    provider: "Google Search Central",
    cost: "Free",
    estimatedTime: "2-3 hours",
    whyUseful: "Clarifies appropriate AI assistance and the risk of scaled low-value content.",
    url: "https://developers.google.com/search/docs/fundamentals/using-gen-ai-content",
    priority: "Essential",
    minMinutes: 120,
    maxMinutes: 180,
  },
  "geo-quality-guidelines": {
    id: "geo-quality-guidelines",
    title: "Search Quality Rater Guidelines",
    type: "Documentation",
    provider: "Google",
    cost: "Free",
    estimatedTime: "8-12 hours",
    whyUseful: "Builds judgment around purpose, trust, experience, expertise, reputation, and high-stakes information quality.",
    url: "https://guidelines.raterhub.com/searchqualityevaluatorguidelines.pdf",
    priority: "Recommended",
    minMinutes: 480,
    maxMinutes: 720,
  },
  "geo-search-console": {
    id: "geo-search-console",
    title: "Search Console Performance Reports",
    type: "Documentation",
    provider: "Google Search Central",
    cost: "Free",
    estimatedTime: "4-6 hours",
    whyUseful: "Provides query, page, country, device, indexation, sitemap, and enhancement evidence.",
    url: "https://support.google.com/webmasters/answer/7576553",
    priority: "Essential",
    minMinutes: 240,
    maxMinutes: 360,
  },
  "geo-indexnow": {
    id: "geo-indexnow",
    title: "IndexNow Protocol",
    type: "Documentation",
    provider: "IndexNow",
    cost: "Free",
    estimatedTime: "2-3 hours",
    whyUseful: "Explains how participating search engines can be notified when URLs change.",
    url: "https://www.indexnow.org/documentation",
    priority: "Recommended",
    minMinutes: 120,
    maxMinutes: 180,
  },
  "geo-international": {
    id: "geo-international",
    title: "Managing Multi-Regional and Multilingual Sites",
    type: "Documentation",
    provider: "Google Search Central",
    cost: "Free",
    estimatedTime: "3-5 hours",
    whyUseful: "Covers locale URLs, hreflang, language signals, and international architecture.",
    url: "https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites",
    priority: "Recommended",
    minMinutes: 180,
    maxMinutes: 300,
  },
  "geo-career-workbook": {
    id: "geo-career-workbook",
    title: "GEO Role-Market Evidence Workbook",
    type: "Practice",
    provider: "AI Career OS",
    cost: "Free",
    estimatedTime: "5-8 hours",
    whyUseful: "Maps GEO, AEO, AI Search, SEO, content, digital PR, and organic-growth responsibilities to portfolio evidence.",
    url: "/methodology",
    priority: "Essential",
    minMinutes: 300,
    maxMinutes: 480,
  },
};

type StageSpec = {
  title: string;
  landmark: string;
  summary: string;
  explanation: string;
  lessons: string[];
  tasks: string[];
  resourceIds: string[];
  topics: [string, string, string];
};

function q(
  id: string,
  prompt: string,
  answers: string[],
  correctAnswerIndex: number,
  explanation: string,
  relatedTopic: string,
  difficulty: WorkspaceDifficulty = "Intermediate",
): CareerQuizQuestion {
  return {
    id,
    question: prompt,
    answers,
    correctAnswerIndex,
    explanation,
    difficulty,
    relatedTopic,
    questionType: prompt.toLowerCase().includes("scenario") ? "scenario" : "multiple-choice",
    status: "active",
    lastReviewedAt: "2026-08-03",
    version: 1,
  };
}

function stageQuestions(stageNumber: number, topics: [string, string, string]): CareerQuizQuestion[] {
  const [a, b, c] = topics;
  return [
    q(`geo-s${stageNumber}-q1`, `Which deliverable best proves capability in ${a}?`, ["A prediction without evidence", "A documented method, dataset, findings, confidence, and decision", "A copied competitor page", "One unexplained screenshot"], 1, "GEO evidence must be reproducible and decision-oriented.", a),
    q(`geo-s${stageNumber}-q2`, `What is the strongest validation method for ${b}?`, ["Check one prompt once", "Use a governed query sample, repeated observations, and independent technical evidence", "Assume every engine behaves identically", "Count mentions without checking context"], 1, "Repeated observations and independent evidence reduce false certainty.", b),
    q(`geo-s${stageNumber}-q3`, `Scenario: results involving ${c} improve for several prompts but not the control set. What should be reported?`, ["Guaranteed causal impact", "Directional evidence, comparison results, limitations, and the next test", "A ranking guarantee", "Only the best screenshots"], 1, "Professional GEO reporting separates observation from causal certainty.", c),
    q(`geo-s${stageNumber}-q4`, `Which practice most reduces risk when implementing ${a}?`, ["Publish at scale before review", "Tie claims and markup to visible, maintained, source-backed content", "Hide methodology", "Remove review dates"], 1, "Machine-readable signals must accurately represent visible content.", a),
    q(`geo-s${stageNumber}-q5`, `Why should ${b} connect to business and user outcomes?`, ["To replace technical validation", "To prioritize useful work rather than isolated visibility metrics", "To guarantee citations", "To avoid measuring uncertainty"], 1, "Visibility matters only when it supports accurate discovery, trust, qualified engagement, or measurable outcomes.", b),
  ];
}

function topicAssessment(stageNumber: number, resource: ResourceDefinition, questions: CareerQuizQuestion[]): CareerAssessment {
  return {
    id: `geo-stage-${stageNumber}-${resource.id}-assessment`,
    title: `${resource.title} knowledge check`,
    description: `Five GEO-specific questions connecting ${resource.title} to research, implementation, measurement, and professional judgment.`,
    passingScore: 60,
    assessmentType: "topic",
    topicId: resource.id,
    topicLabel: resource.title,
    durationMinutes: 12,
    questionsPerAttempt: 5,
    questions,
  };
}

function comprehensiveAssessment(stageNumber: number, title: string, questions: CareerQuizQuestion[]): CareerAssessment {
  return {
    id: `geo-stage-${stageNumber}-comprehensive-assessment`,
    title: `${title} comprehensive assessment`,
    description: "A ten-question checkpoint covering concepts, evidence, implementation decisions, uncertainty, and ethical GEO practice.",
    passingScore: 60,
    assessmentType: "comprehensive",
    durationMinutes: 25,
    questionsPerAttempt: 10,
    questions: [
      ...questions,
      ...questions.map((item, index) => ({
        ...item,
        id: `${item.id}-applied-${index + 1}`,
        question: `Applied scenario: ${item.question}`,
        difficulty: "Advanced" as WorkspaceDifficulty,
      })),
    ],
  };
}

function effort(stageResources: ResourceDefinition[], taskCount: number): CareerJourneyEffortEstimate {
  const totals = stageResources.reduce((sum, resource) => ({ min: sum.min + resource.minMinutes, max: sum.max + resource.maxMinutes }), { min: 0, max: 0 });
  return {
    minMinutes: totals.min + taskCount * 75 + 40,
    maxMinutes: totals.max + taskCount * 150 + 70,
    breakdown: {
      resources: { minMinutes: totals.min, maxMinutes: totals.max },
      activities: { minMinutes: taskCount * 75, maxMinutes: taskCount * 150 },
      assessment: { minMinutes: 40, maxMinutes: 70 },
    },
  };
}

const stageSpecs: StageSpec[] = [
  {
    title: "GEO Role Orientation and Evidence Standards",
    landmark: "Generative Discovery Observatory",
    summary: "Define the GEO profession, its overlap with SEO and AEO, and the evidence standard required in an emerging field.",
    explanation: "Distinguish durable search fundamentals from speculative GEO claims, map the role to real organizational functions, and create a professional code for responsible experimentation.",
    lessons: ["GEO, SEO, AEO, and AI Search boundaries", "How generative systems retrieve and synthesize sources", "Evidence maturity, uncertainty, and ethical claims"],
    tasks: ["Create a responsibility map separating GEO from adjacent roles.", "Compare source selection across three generative answer experiences.", "Write a GEO evidence and ethics policy."],
    resourceIds: ["geo-foundational-paper", "geo-critical-survey"],
    topics: ["GEO evidence standards", "generative source selection", "ethical professional claims"],
  },
  {
    title: "Search, Retrieval, and Grounding Foundations",
    landmark: "Retrieval Systems Lab",
    summary: "Understand crawling, indexing, retrieval, ranking, grounding, synthesis, and citation as connected but distinct processes.",
    explanation: "Build a technical mental model that diagnoses whether a visibility problem originates in access, indexation, relevance, source quality, entity ambiguity, or answer composition.",
    lessons: ["Crawling, rendering, indexing, and ranking", "Retrieval and grounding", "Query intent and answer composition"],
    tasks: ["Trace one page from crawl discovery to a citation opportunity.", "Create a failure-mode map for access, retrieval, and synthesis.", "Classify 50 real queries by intent and evidence need."],
    resourceIds: ["geo-google-ai-features", "geo-search-essentials"],
    topics: ["search-system architecture", "retrieval and grounding", "query intent classification"],
  },
  {
    title: "Audience, Query, and Citation Intelligence",
    landmark: "Answer Demand Research Studio",
    summary: "Build governed query panels and identify where audiences need definitions, comparisons, procedures, evidence, recommendations, or decisions.",
    explanation: "Create a reproducible research system rather than choosing prompts opportunistically. The output becomes the baseline for content, technical work, and experimentation.",
    lessons: ["Audience questions and task analysis", "Query-panel sampling and segmentation", "Citation and source-pattern analysis"],
    tasks: ["Build a 100-query panel with intent and value labels.", "Record citations across repeated observations.", "Produce an opportunity matrix separating content, authority, and technical gaps."],
    resourceIds: ["geo-bing-ai-performance", "geo-search-console"],
    topics: ["query-panel design", "citation intelligence", "opportunity prioritization"],
  },
  {
    title: "Entity and Knowledge Architecture",
    landmark: "Entity Resolution Foundry",
    summary: "Make organizations, people, products, concepts, and relationships explicit and internally consistent.",
    explanation: "Focus on disambiguation, topic ownership, page roles, internal linking, and structured relationships that help users and machines understand each entity.",
    lessons: ["Entity identity and disambiguation", "Topic clusters and page-role architecture", "Semantic HTML, internal links, and structured data"],
    tasks: ["Create an entity registry with canonical names and sources.", "Design a topic graph and page-role map.", "Implement and validate structured data that matches visible content."],
    resourceIds: ["geo-schema", "geo-search-essentials"],
    topics: ["entity disambiguation", "knowledge architecture", "structured data accuracy"],
  },
  {
    title: "Citation-Ready Content and Source Provenance",
    landmark: "Evidence Publishing Workshop",
    summary: "Create content that is useful to humans and independently extractable, verifiable, attributable, and maintainable.",
    explanation: "Replace vague optimization language with answer-first structures, explicit claims, primary sources, expert review, limitations, and update ownership.",
    lessons: ["Direct-answer and layered-detail writing", "Claim-evidence-provenance mapping", "Authorship, review, freshness, and trust controls"],
    tasks: ["Rewrite one weak article into answer blocks with layered evidence.", "Create a claim-evidence register.", "Run an extractability and hallucination-risk review."],
    resourceIds: ["geo-genai-content", "geo-quality-guidelines"],
    topics: ["answer-first content", "source provenance", "editorial trust controls"],
  },
  {
    title: "Technical GEO and Machine Accessibility",
    landmark: "Technical Discovery Grid",
    summary: "Ensure important content is rendered, canonical, discoverable, indexable, internally connected, and represented accurately.",
    explanation: "Turn technical SEO into a GEO implementation discipline covering rendered HTML, status codes, robots controls, canonicals, sitemaps, structured data, and change notification.",
    lessons: ["Rendered HTML and content accessibility", "Canonicals, robots, sitemaps, and duplicate control", "Structured data and update notification"],
    tasks: ["Complete a technical GEO audit with reproducible evidence.", "Repair one canonicalization or indexation failure.", "Design a sitemap and IndexNow workflow with monitoring."],
    resourceIds: ["geo-search-console", "geo-indexnow", "geo-schema"],
    topics: ["machine accessibility", "canonical and sitemap control", "technical change validation"],
  },
  {
    title: "Authority, Reputation, and Earned Source Strategy",
    landmark: "Authority Network Operations",
    summary: "Strengthen authority through expert participation, reputable coverage, source diversity, and transparent reputation signals.",
    explanation: "Design authority programs that earn independent corroboration rather than manufacturing reviews, citations, authors, or partnerships.",
    lessons: ["Reputation and source-authority analysis", "Expert attribution and first-party evidence", "Digital PR and independent corroboration"],
    tasks: ["Audit which sources shape the entity's reputation.", "Create an expert-evidence publishing plan.", "Design a digital PR brief based on original data or expertise."],
    resourceIds: ["geo-quality-guidelines", "geo-critical-survey"],
    topics: ["source authority", "expert evidence", "earned reputation strategy"],
  },
  {
    title: "GEO Measurement, Experiments, and Reporting",
    landmark: "Visibility Experiment Control Room",
    summary: "Measure visibility and citations without pretending generative systems are deterministic or fully observable.",
    explanation: "Create baselines, repeated query samples, control groups, implementation logs, dashboards, and decision rules that preserve uncertainty.",
    lessons: ["Visibility, citation, referral, and business metrics", "Sampling, controls, repeated observations, and confounders", "Executive reporting with limitations"],
    tasks: ["Define a GEO measurement dictionary and baseline.", "Run a pre/post experiment with a control query set.", "Present findings with confidence, limitations, and a go/stop/iterate decision."],
    resourceIds: ["geo-bing-ai-performance", "geo-search-console", "geo-critical-survey"],
    topics: ["GEO measurement design", "controlled experimentation", "uncertainty reporting"],
  },
  {
    title: "International GEO Strategy and Capstone",
    landmark: "Global Generative Visibility Review",
    summary: "Deliver an end-to-end GEO program across markets, languages, engines, and stakeholder constraints.",
    explanation: "Integrate query research, entities, content, technical delivery, authority, measurement, governance, and international architecture into one operating plan.",
    lessons: ["Engine and market differences", "Multilingual entities, localization, and hreflang", "Capstone governance and prioritization"],
    tasks: ["Compare one topic across two engines and two languages.", "Design an international entity and URL architecture.", "Deliver the complete GEO capstone to a simulated review panel."],
    resourceIds: ["geo-international", "geo-google-ai-features"],
    topics: ["international GEO architecture", "multi-engine strategy", "capstone governance"],
  },
  {
    title: "Portfolio, Job Search, and GEO Interviews",
    landmark: "GEO Career Launch Desk",
    summary: "Convert the work into credible case studies and target fragmented GEO, AEO, AI Search, SEO, content, and organic-growth roles by responsibility.",
    explanation: "Avoid relying on the emerging title alone. Map vacancies to specific evidence in research, content, technical implementation, authority, analytics, and communication.",
    lessons: ["Portfolio narrative and redacted evidence", "Role-title and responsibility mapping", "Audit, strategy, experiment, and stakeholder interviews"],
    tasks: ["Publish three GEO case studies with methods and limitations.", "Build a 30-role responsibility matrix.", "Complete a timed audit and defend it in a mock interview."],
    resourceIds: ["geo-career-workbook", "geo-foundational-paper"],
    topics: ["GEO portfolio evidence", "role-market mapping", "scenario interview defense"],
  },
];

const journeyStages: CareerJourneyStage[] = stageSpecs.map((spec, index) => {
  const layout = workspaceLayout.journeyStages[index] ?? workspaceLayout.journeyStages[0];
  const stageNumber = index + 1;
  const stageResources = spec.resourceIds.map((id) => resources[id]);
  const questions = stageQuestions(stageNumber, spec.topics);
  return {
    ...layout,
    id: `geo-stage-${stageNumber}`,
    order: stageNumber,
    title: spec.title,
    label: spec.title,
    landmark: spec.landmark,
    theme: spec.title,
    summary: spec.summary,
    explanation: spec.explanation,
    lessons: spec.lessons,
    resources: stageResources,
    estimatedEffort: effort(stageResources, spec.tasks.length),
    tasks: spec.tasks.map((description, taskIndex) => ({
      id: `geo-stage-${stageNumber}-task-${taskIndex + 1}`,
      title: description,
      description,
      type: index === 8 ? "project" : index === 9 ? "job-search" : "lesson",
    })),
    topicAssessments: stageResources.map((resource) => topicAssessment(stageNumber, resource, questions)),
    phaseExam: comprehensiveAssessment(stageNumber, spec.title, questions),
  };
});

const geoCareer: CareerWorkspaceData = {
  ...workspaceLayout,
  slug,
  title: "Generative Engine Optimization (GEO) Specialist",
  titleAliases: [
    { title: "GEO Specialist", keywords: ["Generative Engine Optimization Specialist"] },
    { title: "Answer Engine Optimization Specialist", keywords: ["AEO Specialist"] },
    { title: "AI Search Optimization Specialist", keywords: ["AI Search Specialist"] },
    { title: "Generative Search Strategist", keywords: ["Generative Search Specialist"] },
    { title: "AI Visibility Strategist", keywords: ["Generative AI Visibility Strategist"] },
    { title: "AI Citation & Discovery Specialist", keywords: ["AI Citation Specialist"] },
  ],
  category: "AI Marketing",
  visual: {
    nodeLabel: "GEO Specialist",
    sceneTitle: "Generative Discovery and Citation Intelligence Lab",
    sceneDescription: "A professional environment connecting query intelligence, entities, evidence, technical accessibility, authority, answer-engine monitoring, experimentation, and governance.",
    imageAlt: "GEO specialist workspace with query research, entity architecture, citation evidence, technical search controls, and visibility experiments.",
  },
  shortDescription: "Improve trusted discovery, retrieval, citation, and authority across generative answer engines through search fundamentals, entity architecture, evidence-led content, technical accessibility, reputation, and rigorous measurement.",
  difficulty: "Intermediate",
  estimatedLearningTime: "Calculated per stage from original GEO resources, practical work, and assessments",
  salary: "No reliable standalone GEO occupation dataset exists yet. Benchmark compensation against the actual SEO, content strategy, organic growth, digital PR, analytics, or search strategy responsibilities.",
  hiringDemand: "Emerging and fragmented. GEO responsibilities increasingly appear inside AI Search, SEO, AEO, content intelligence, organic growth, and digital PR roles.",
  remoteAvailability: "High for research, content systems, technical audits, analytics, and strategy; implementation still requires cross-functional access.",
  aiCompatibilityScore: "96%",
  bestFor: ["SEO and technical SEO professionals", "Content strategists and editors", "Digital PR and authority specialists", "Analytical marketers", "Information architects and knowledge practitioners"],
  programmingRequirement: "Low to Medium: HTML, structured data, analytics, APIs, crawling concepts, and optional scripting are useful.",
  mathRequirement: "Low to Medium: sampling, descriptive statistics, experiment design, and uncertainty interpretation matter more than advanced mathematics.",
  creativityLevel: "High",
  communicationLevel: "High",
  lastUpdated: "2026-08-03",
  metrics: [
    { label: "Primary outcome", value: "Trusted generative discovery", detail: "Useful information can be found, interpreted, verified, and cited without reducing human value." },
    { label: "Evidence standard", value: "Repeatable and source-backed", detail: "Methods, query samples, claims, citations, implementation logs, and limitations remain inspectable." },
    { label: "Operating model", value: "Cross-functional", detail: "GEO connects SEO, editorial, engineering, analytics, digital PR, legal, and subject-matter experts." },
    { label: "Field maturity", value: "Emerging", detail: "Established search fundamentals are more reliable than many engine-specific optimization claims." },
  ],
  overview: {
    title: "What does a Generative Engine Optimization (GEO) Specialist do?",
    body: "A GEO Specialist improves how authoritative information is discovered, interpreted, retrieved, synthesized, and cited by generative answer systems. The role combines search and retrieval fundamentals, query intelligence, entity and knowledge architecture, evidence-led content, technical SEO, structured data, authority development, analytics, experimentation, and governance. The specialist does not control external models or guarantee citations; the professional standard is to create useful, machine-accessible evidence and measure outcomes transparently.",
    responsibilities: [
      "Build governed query panels and analyze generative citations",
      "Diagnose crawl, indexation, retrieval, entity, content, and authority gaps",
      "Design entity registries, topic architecture, page roles, and internal links",
      "Create direct-answer content with explicit claims, provenance, authorship, and review ownership",
      "Coordinate rendering, canonical, sitemap, structured-data, and update-notification improvements",
      "Develop credible expert evidence and earned source authority",
      "Run repeated observations and controlled GEO experiments",
      "Report confidence, limitations, contradictory evidence, and business impact",
    ],
    industries: ["Software and SaaS", "Professional services", "E-commerce", "Financial services", "Healthcare information", "Education", "Media and publishing", "Travel", "Enterprise knowledge and B2B marketing"],
  },
  journeyMap: {
    ...workspaceLayout.journeyMap,
    theme: "future-space-colony",
    overviewTitle: "GEO Specialist Evidence Journey",
    overviewDescription: "Ten original stages from role orientation and retrieval foundations to entity architecture, citation-ready content, technical delivery, authority, measurement, international strategy, capstone, and employment readiness.",
  },
  journeyStages,
  globalResources: Object.values(resources),
  projects: [
    {
      id: "geo-project-visibility-audit",
      title: "Generative Visibility and Citation Audit",
      difficulty: "Intermediate",
      estimatedTime: "30-45 hours",
      phaseId: workspaceLayout.roadmap[1]?.id ?? workspaceLayout.roadmap[0].id,
      description: "Audit a real organization across a governed query panel, repeated observations, cited-source patterns, technical access, entity coverage, and content evidence.",
      deliverables: ["Governed query panel", "Citation and competitor dataset", "Technical and entity findings", "Confidence-rated opportunity backlog", "Executive audit report"],
      skills: ["Query research", "Citation analysis", "Technical diagnosis", "Entity mapping", "Reporting"],
    },
    {
      id: "geo-project-evidence-system",
      title: "Citation-Ready Knowledge and Content System",
      difficulty: "Intermediate",
      estimatedTime: "40-60 hours",
      phaseId: workspaceLayout.roadmap[3]?.id ?? workspaceLayout.roadmap[0].id,
      description: "Redesign one topic domain with entities, page roles, answer blocks, claim-evidence mapping, expert review, structured data, and maintenance ownership.",
      deliverables: ["Entity and topic architecture", "Page-role specifications", "Published answer-first content", "Claim-evidence register", "Editorial and structured-data validation"],
      skills: ["Information architecture", "Evidence-led writing", "Semantic HTML", "Structured data", "Editorial governance"],
    },
    {
      id: "geo-project-experiment",
      title: "Controlled GEO Experiment and Dashboard",
      difficulty: "Advanced",
      estimatedTime: "45-70 hours",
      phaseId: workspaceLayout.roadmap[4]?.id ?? workspaceLayout.roadmap[0].id,
      description: "Implement a controlled technical or content intervention and measure repeated visibility, citations, referral behavior, and business outcomes against a baseline and control set.",
      deliverables: ["Hypothesis and measurement dictionary", "Baseline and control sample", "Implementation log", "Dashboard", "Results and limitations report"],
      skills: ["Experiment design", "Analytics", "Technical implementation", "Uncertainty", "Executive communication"],
    },
    {
      id: "geo-project-capstone",
      title: "End-to-End GEO Operating Program",
      difficulty: "Advanced",
      estimatedTime: "70-100 hours",
      phaseId: workspaceLayout.roadmap[5]?.id ?? workspaceLayout.roadmap[0].id,
      description: "Deliver a production-style GEO program covering research, entities, content, technical accessibility, authority, international considerations, measurement, governance, and execution.",
      deliverables: ["Executive strategy", "Research and architecture package", "Implemented pilot", "Authority plan", "Experiment dashboard", "Governance and maintenance playbook"],
      skills: ["GEO strategy", "Cross-functional delivery", "Technical SEO", "Authority", "Measurement", "Governance"],
    },
  ],
  finalChallenge: {
    title: "GEO Production Readiness Review",
    description: "Present and defend an end-to-end GEO operating program before a simulated search, editorial, engineering, analytics, legal, communications, and business review panel.",
    requirements: ["Traceable query and citation methodology", "Entity and knowledge architecture", "Evidence-led content and source provenance", "Technical access and structured-data validation", "Authority strategy without fabricated signals", "Measurement with controls and uncertainty", "Governance, ownership, and maintenance"],
    deliverables: ["Executive strategy", "Audit dataset", "Architecture and implementation package", "Experiment report", "Dashboard", "Risk and governance register", "Portfolio case study"],
    evaluation: ["Research rigor", "Search and retrieval judgment", "Evidence quality", "Technical validity", "Editorial usefulness", "Measurement integrity", "Ethics and governance", "Communication"],
  },
  relatedCareers: ["Answer Engine Optimization Specialist", "AI Search Strategist", "Technical SEO Specialist", "AI Content Strategist", "Digital PR Specialist", "Organic Growth Strategist"],
  portfolioTasks: [
    { id: "geo-portfolio-audit", title: "Publish a generative visibility audit", description: "Show query methodology, repeated observations, cited-source analysis, entity and technical gaps, confidence, and prioritized decisions.", type: "portfolio" },
    { id: "geo-portfolio-content", title: "Publish a citation-ready content system", description: "Show entities, page roles, answer blocks, claim provenance, structured data, review controls, and validation evidence.", type: "portfolio" },
    { id: "geo-portfolio-experiment", title: "Publish a controlled GEO experiment", description: "Show hypothesis, baseline, control sample, implementation, observations, confounders, limitations, and decision outcome.", type: "portfolio" },
    { id: "geo-portfolio-review", title: "Record a GEO strategy defense", description: "Present the business problem, evidence, architecture, implementation, measurement, uncertainty, governance, and next actions in under eight minutes.", type: "portfolio" },
  ],
  jobSearchTasks: [
    { id: "geo-job-title-map", title: "Build a GEO responsibility matrix", description: "Compare GEO, AEO, AI Search, Technical SEO, Content Intelligence, Organic Growth, and Digital PR vacancies by responsibilities rather than title alone.", type: "job-search" },
    { id: "geo-job-evidence-map", title: "Map each vacancy to portfolio proof", description: "Connect every required capability to a specific query study, audit, architecture, implementation, authority plan, experiment, or stakeholder deliverable.", type: "job-search" },
    { id: "geo-job-application-cycle", title: "Run a targeted evidence-led application cycle", description: "Prioritize organizations with mature search, editorial, knowledge, analytics, or AI-discovery programs and tailor the evidence package to each role.", type: "job-search" },
  ],
  interviewPrep: {
    title: "GEO Specialist Interview Preparation",
    practiceAreas: ["GEO versus SEO and AEO", "Search, retrieval, and grounding", "Query-panel design", "Entity and knowledge architecture", "Evidence-led content", "Technical GEO", "Authority and digital PR", "Measurement and experimentation", "Ethics and uncertainty"],
    questions: [
      "How would you design a defensible GEO audit for a brand entering a new market?",
      "Which established SEO practices are foundational for GEO, and which claims remain speculative?",
      "How would you diagnose a page that is indexed but rarely used as a grounding source?",
      "What makes a query panel representative enough for repeated measurement?",
      "How would you design entities and page roles for a complex product portfolio?",
      "What makes a claim or page citation-ready without writing for machines at the expense of users?",
      "How would you validate structured data and machine accessibility after implementation?",
      "How would you build authority without manufacturing links, reviews, experts, or citations?",
      "How would you report an experiment with mixed results and high output variance?",
      "What governance and maintenance controls are required after a GEO pilot launches?",
    ],
  },
};

export const generativeEngineOptimizationSpecialistCareer = applyCareerTitleAliasPolicy(geoCareer);
