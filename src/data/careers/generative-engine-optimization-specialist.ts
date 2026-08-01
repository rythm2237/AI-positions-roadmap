import { aiProductManagerCareer } from "@/data/careers/ai-product-manager";
import { applyCareerTitleAliasPolicy } from "@/data/careerTitleAliases";
import type { CareerJourneyStage, CareerRoadmapPhase, CareerWorkspaceData } from "@/types/careerWorkspace";

const stages = [
  ["GEO Role Orientation", "Answer Engine Observatory", "Understand GEO, adjacent SEO/content roles, employer expectations, and the evidence required to prove impact."],
  ["Generative Search and Retrieval Foundations", "Retrieval Systems Lab", "Understand how answer engines retrieve, rank, synthesize, cite, and attribute information."],
  ["Audience, Intent, and Query Intelligence", "Intent Mapping Studio", "Map audience questions, task intent, journeys, and high-value answer opportunities."],
  ["Entity Authority and Knowledge Architecture", "Knowledge Graph Foundry", "Strengthen entities, topical relationships, source clarity, structured knowledge, and organizational authority."],
  ["Citation-Ready Content Design", "Evidence Publishing Workshop", "Create answerable, evidence-led content with clear claims, definitions, structure, provenance, and expert signals."],
  ["Technical GEO and Discoverability", "Technical Discovery Grid", "Improve crawlability, rendering, metadata, structured data, canonicalization, feeds, and machine-readable access."],
  ["Distribution, Digital PR, and Source Authority", "Authority Network", "Build credible third-party mentions, expert participation, source diversity, and reputation signals."],
  ["Measurement, Experiments, and Reporting", "Visibility Analytics Center", "Measure answer visibility, citation share, entity coverage, referral quality, assisted conversion, and change over time."],
  ["GEO Strategy Capstone and Portfolio", "Generative Visibility Review", "Deliver and defend a complete GEO audit, strategy, implementation plan, experiment backlog, and executive report."],
  ["Job Search and GEO Interviews", "GEO Career Launchpad", "Target GEO, AI search, organic growth, content intelligence, and answer-engine roles using evidence-based case studies."],
] as const;

const roadmap = [
  ["Generative Search Foundations", ["Answer engines", "Retrieval", "Citations", "Entities", "Search intent", "Source quality"]],
  ["Research and Opportunity Mapping", ["Audience research", "Query sets", "Journey mapping", "Competitor citations", "Gap analysis", "Prioritization"]],
  ["Knowledge and Content Architecture", ["Entity strategy", "Topic clusters", "Information architecture", "Claims", "Evidence", "Expert signals"]],
  ["Technical GEO and Authority", ["Structured data", "Crawlability", "Canonicalization", "Feeds", "Digital PR", "Reputation"]],
  ["Measurement and GEO Capstone", ["Visibility tracking", "Citation share", "Experiments", "Dashboards", "Capstone", "Executive reporting"]],
  ["Portfolio and Employment", ["Case studies", "Resume", "Title mapping", "Audit exercise", "Strategy interview", "Stakeholder defense"]],
] as const;

function mapStage(stage: CareerJourneyStage, index: number): CareerJourneyStage {
  const [title, landmark, summary] = stages[index] ?? stages[stages.length - 1];
  const topics = ["Research", "Architecture", "Execution"];
  return {
    ...stage,
    id: `geo-${index + 1}-${stage.id}`,
    title, label: title, landmark, theme: summary, summary, explanation: summary,
    lessons: topics.map((topic) => `${title}: ${topic}`),
    tasks: topics.map((topic, i) => ({ id: `geo-${index + 1}-task-${i + 1}`, title: `${topic} deliverable`, description: `Produce a reviewable ${topic.toLowerCase()} artifact for ${title}.`, type: index >= 8 ? "career" : "lesson" })),
    topicAssessments: stage.topicAssessments?.map((a, i) => ({ ...a, id: `geo-${index + 1}-topic-${i + 1}`, title: `${title} topic check`, topicLabel: title })),
    phaseExam: stage.phaseExam ? { ...stage.phaseExam, id: `geo-${index + 1}-exam`, title: `${title} comprehensive assessment` } : undefined,
  };
}

function mapRoadmap(phase: CareerRoadmapPhase, index: number): CareerRoadmapPhase {
  const [title, sections] = roadmap[index] ?? roadmap[roadmap.length - 1];
  return {
    ...phase,
    id: `geo-roadmap-${index + 1}`,
    phaseNumber: index + 1,
    title,
    goal: `Build practical competence across ${sections.join(", ")}.`,
    sections: [...sections],
    mentorTip: "Optimize for trustworthy usefulness and source clarity, not unsupported claims about manipulating generative systems.",
    practicalMissions: [`Audit one site for ${sections[0]}.`, `Create an implementation artifact covering ${sections.slice(1, 4).join(", ")}.`],
    expectedOutcome: `You can analyze, implement, and explain ${title.toLowerCase()}.`,
    quiz: { ...phase.quiz, id: `geo-roadmap-${index + 1}-quiz`, phaseId: `geo-roadmap-${index + 1}`, title: `${title} checkpoint` },
    lessons: phase.lessons.map((lesson, i) => ({ ...lesson, id: `geo-roadmap-${index + 1}-lesson-${i + 1}`, title: `${sections[i % sections.length]} practice`, summary: `Apply ${sections[i % sections.length]} in a GEO scenario.`, mission: `Create evidence for ${sections[i % sections.length]}.` })),
  };
}

const base = aiProductManagerCareer;
const career: CareerWorkspaceData = {
  ...base,
  slug: "generative-engine-optimization-specialist",
  title: "Generative Engine Optimization (GEO) Specialist",
  category: "AI Marketing",
  visual: { nodeLabel: "GEO Specialist", sceneTitle: "Generative Visibility Observatory", sceneDescription: "A research and publishing system connecting audience intent, entities, evidence, technical discoverability, citations, authority, and measurement.", imageAlt: "GEO workspace showing answer-engine research, citation analysis, entity architecture, content evidence, and visibility measurement." },
  shortDescription: "Improve how credible brands, experts, and content are understood, retrieved, cited, and recommended across generative answer engines and AI-assisted search experiences.",
  difficulty: "Intermediate",
  estimatedLearningTime: "6-9 months part-time",
  salary: "Varies by market, seniority, analytics depth, and ownership of organic growth",
  hiringDemand: "Emerging across SEO, content, digital PR, product marketing, agencies, and AI-search teams",
  remoteAvailability: "High",
  aiCompatibilityScore: "99%",
  bestFor: ["SEO specialists", "Content strategists", "Digital PR professionals", "Analytical marketers", "Knowledge and information-architecture practitioners"],
  programmingRequirement: "Low to Moderate: analytics, structured data, crawling concepts, and optional scripting",
  mathRequirement: "Low to Moderate: experimentation, trend analysis, attribution, and reporting",
  creativityLevel: "High", communicationLevel: "High", lastUpdated: "2026-08-01",
  metrics: [
    { label: "Primary outcome", value: "Trusted generative visibility", detail: "Useful, attributable presence across answer experiences." },
    { label: "Core system", value: "Intent + entities + evidence", detail: "Content and authority structured for users and machines." },
    { label: "Measurement", value: "Citation and visibility evidence", detail: "Track query sets, sources, mentions, referrals, and business outcomes." },
    { label: "Risk principle", value: "No guaranteed rankings", detail: "Use transparent experiments and avoid unsupported claims." },
  ],
  overview: {
    title: "What does a GEO Specialist do?",
    body: "A GEO Specialist researches generative answer behavior, maps audience questions, improves entity and knowledge architecture, produces citation-ready content, strengthens technical discoverability and authority, and measures visibility and business impact without claiming deterministic control over external models.",
    responsibilities: ["Research answer-engine results and citations", "Map audience intent and query sets", "Design entity and topic architecture", "Improve evidence, claims, authorship, and provenance", "Coordinate technical SEO and structured data", "Build source authority and digital PR", "Run experiments and report visibility changes", "Align GEO with SEO, content, brand, product, and analytics"],
    industries: ["SaaS", "E-commerce", "Media", "Professional services", "Healthcare information", "Education", "Travel", "Agencies"],
  },
  journeyMap: { ...base.journeyMap, theme: "future-space-colony", overviewTitle: "GEO Specialist Journey", overviewDescription: "Progress from generative-search foundations through research, knowledge architecture, citation-ready publishing, technical discoverability, authority, measurement, portfolio, and employment." },
  journeyStages: base.journeyStages.map(mapStage),
  roadmap: base.roadmap.map(mapRoadmap),
  projects: [
    { id: "geo-project-audit", title: "Generative Visibility and Citation Audit", difficulty: "Intermediate", estimatedTime: "25-35 hours", phaseId: "geo-roadmap-2", description: "Audit a brand across a governed query set and document visibility, citations, competitors, content gaps, and source patterns.", deliverables: ["Query set", "Citation dataset", "Gap analysis", "Prioritized recommendations"], skills: ["Research", "Citation analysis", "Prioritization"] },
    { id: "geo-project-knowledge", title: "Entity and Knowledge Architecture Redesign", difficulty: "Intermediate", estimatedTime: "30-45 hours", phaseId: "geo-roadmap-3", description: "Redesign entities, topic relationships, information architecture, claims, evidence, and expert signals for a content domain.", deliverables: ["Entity map", "Topic architecture", "Content specifications", "Evidence model"], skills: ["Entities", "Information architecture", "Content design"] },
    { id: "geo-project-experiment", title: "GEO Experiment and Measurement System", difficulty: "Advanced", estimatedTime: "35-50 hours", phaseId: "geo-roadmap-5", description: "Implement a controlled content and technical improvement, track visibility and citations, and report limitations and outcomes.", deliverables: ["Experiment plan", "Implementation", "Dashboard", "Results report"], skills: ["Experimentation", "Analytics", "Reporting"] },
    { id: "geo-project-capstone", title: "End-to-End GEO Strategy Capstone", difficulty: "Advanced", estimatedTime: "60-80 hours", phaseId: "geo-roadmap-5", description: "Deliver a full GEO audit, strategy, roadmap, implementation backlog, governance model, and executive presentation.", deliverables: ["Audit", "Strategy", "Roadmap", "Measurement framework", "Executive deck"], skills: ["Strategy", "Technical GEO", "Authority", "Executive communication"] },
  ],
  finalChallenge: { title: "GEO Strategy Review", description: "Defend a complete GEO strategy before brand, content, technical, legal, and executive stakeholders.", requirements: ["Transparent query and citation methodology", "Evidence-led content and entity strategy", "Technical and authority recommendations", "Measurement with limitations", "Governance and ownership"], deliverables: ["Audit", "Strategy", "Prioritized backlog", "Dashboard", "Executive presentation"], evaluation: ["Research quality", "Strategic judgment", "Evidence quality", "Technical feasibility", "Measurement integrity", "Communication"] },
  relatedCareers: ["AI Content Strategist", "SEO Specialist", "Digital PR Specialist", "Content Intelligence Analyst", "AI Marketing Specialist"],
  portfolioTasks: [
    { id: "geo-portfolio-audit", title: "Publish a GEO audit case study", description: "Show methodology, query set, citations, findings, recommendations, and limitations.", type: "portfolio" },
    { id: "geo-portfolio-architecture", title: "Publish an entity architecture", description: "Show entity relationships, topic structure, evidence, and content specifications.", type: "portfolio" },
    { id: "geo-portfolio-dashboard", title: "Publish a visibility dashboard", description: "Track citations, mentions, source share, referrals, and business outcomes.", type: "portfolio" },
  ],
  jobSearchTasks: [
    { id: "geo-job-titles", title: "Build a GEO title matrix", description: "Track GEO, AI Search, Answer Engine Optimization, Organic Growth, Content Intelligence, and adjacent roles.", type: "job-search" },
    { id: "geo-job-evidence", title: "Map vacancies to evidence", description: "Match research, content, technical, PR, analytics, and reporting requirements to portfolio artifacts.", type: "job-search" },
    { id: "geo-job-cycle", title: "Run a targeted application cycle", description: "Apply with role-specific audit and strategy evidence and review response patterns weekly.", type: "job-search" },
  ],
  interviewPrep: { title: "GEO Specialist Interview Preparation", practiceAreas: ["Generative retrieval", "Query research", "Entity strategy", "Content evidence", "Technical GEO", "Digital PR", "Measurement", "Stakeholder communication"], questions: ["How would you audit generative visibility for a new market?", "How do GEO and SEO overlap and differ?", "What makes content citation-ready?", "How would you prioritize entity and content gaps?", "Which technical issues can reduce machine discoverability?", "How would you measure GEO without overclaiming causality?", "How would you respond to a request for guaranteed AI rankings?", "Present your capstone and its limitations."] },
};

export const generativeEngineOptimizationSpecialistCareer = applyCareerTitleAliasPolicy(career);
