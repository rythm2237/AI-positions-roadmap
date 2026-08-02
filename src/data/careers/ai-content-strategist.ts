import { generativeEngineOptimizationSpecialistCareer } from "@/data/careers/generative-engine-optimization-specialist";
import { applyCareerTitleAliasPolicy } from "@/data/careerTitleAliases";
import type { CareerJourneyStage, CareerRoadmapPhase, CareerWorkspaceData } from "@/types/careerWorkspace";

const stages = [
  ["AI Content Strategy Orientation", "Content Systems Observatory", "Understand the role across audience research, editorial strategy, AI-assisted production, governance, distribution, and measurement."],
  ["Audience, Brand, and Content Discovery", "Audience Insight Lab", "Research audiences, journeys, jobs-to-be-done, brand position, existing assets, gaps, and constraints."],
  ["Content Strategy and Portfolio Architecture", "Content Architecture Studio", "Define content pillars, formats, lifecycle stages, channels, ownership, and prioritization."],
  ["Knowledge and Information Architecture", "Knowledge Design Foundry", "Structure taxonomies, entities, metadata, reusable knowledge, source-of-truth, and retrieval-ready content."],
  ["AI-Assisted Editorial Workflows", "Editorial Automation Workshop", "Design governed workflows for research, briefs, drafting, review, repurposing, localization, and publishing."],
  ["Quality, Voice, and Responsible AI", "Editorial Trust Gate", "Protect accuracy, originality, brand voice, accessibility, rights, privacy, and human accountability."],
  ["Distribution, SEO, GEO, and Content Operations", "Distribution Command Center", "Coordinate organic search, generative discovery, social, lifecycle, partnerships, and operational publishing."],
  ["Measurement, Experimentation, and Optimization", "Content Intelligence Center", "Measure audience value, quality, engagement, discoverability, conversion, reuse, cost, and workflow performance."],
  ["Content Strategy Capstone and Portfolio", "Editorial Review Forum", "Deliver a complete AI-enabled content operating system with strategy, governance, workflows, measurement, and examples."],
  ["Job Search and Content Strategy Interviews", "Content Career Launchpad", "Target AI content, editorial strategy, content operations, knowledge, and organic-growth roles with evidence."],
] as const;

const roadmap = [
  ["Audience and Content Foundations", ["Audience research", "Brand", "Journeys", "Content audit", "Gap analysis", "Prioritization"]],
  ["Strategy and Content Architecture", ["Content pillars", "Portfolio", "Formats", "Channels", "Taxonomy", "Metadata"]],
  ["AI Editorial Workflow Design", ["Research", "Briefs", "Drafting", "Review", "Repurposing", "Localization"]],
  ["Quality, Governance, and Distribution", ["Voice", "Accuracy", "Rights", "SEO", "GEO", "Publishing operations"]],
  ["Measurement and Content Capstone", ["KPIs", "Experiments", "Dashboards", "Workflow metrics", "Capstone", "Executive reporting"]],
  ["Portfolio and Employment", ["Case studies", "Resume", "Title mapping", "Strategy exercise", "Editorial critique", "Interview defense"]],
] as const;

function mapStage(stage: CareerJourneyStage, index: number): CareerJourneyStage {
  const [title, landmark, summary] = stages[index] ?? stages[stages.length - 1];
  const topics = ["Research", "System design", "Operational evidence"];
  return { ...stage, id: `aics-${index + 1}-${stage.id}`, title, label: title, landmark, theme: summary, summary, explanation: summary, lessons: topics.map((x) => `${title}: ${x}`), tasks: topics.map((x, i) => ({ id: `aics-${index + 1}-task-${i + 1}`, title: `${x} deliverable`, description: `Create a reviewable ${x.toLowerCase()} artifact for ${title}.`, type: index >= 8 ? "career" : "lesson" })), topicAssessments: stage.topicAssessments?.map((a, i) => ({ ...a, id: `aics-${index + 1}-topic-${i + 1}`, title: `${title} topic check`, topicLabel: title })), phaseExam: stage.phaseExam ? { ...stage.phaseExam, id: `aics-${index + 1}-exam`, title: `${title} comprehensive assessment` } : undefined };
}

function mapRoadmap(phase: CareerRoadmapPhase, index: number): CareerRoadmapPhase {
  const [title, sections] = roadmap[index] ?? roadmap[roadmap.length - 1];
  return { ...phase, id: `aics-roadmap-${index + 1}`, phaseNumber: index + 1, title, goal: `Build practical competence across ${sections.join(", ")}.`, sections: [...sections], mentorTip: "Use AI to improve the content system, but keep editorial judgment, source accountability, and audience value under human ownership.", practicalMissions: [`Create one artifact for ${sections[0]}.`, `Validate a workflow covering ${sections.slice(1, 4).join(", ")}.`], expectedOutcome: `You can design and operate ${title.toLowerCase()}.`, quiz: { ...phase.quiz, id: `aics-roadmap-${index + 1}-quiz`, phaseId: `aics-roadmap-${index + 1}`, title: `${title} checkpoint` }, lessons: phase.lessons.map((lesson, i) => ({ ...lesson, id: `aics-roadmap-${index + 1}-lesson-${i + 1}`, title: `${sections[i % sections.length]} practice`, summary: `Apply ${sections[i % sections.length]} in an AI content strategy scenario.`, mission: `Create evidence for ${sections[i % sections.length]}.` })) };
}

const base = generativeEngineOptimizationSpecialistCareer;
const career: CareerWorkspaceData = {
  ...base,
  slug: "ai-content-strategist",
  title: "AI Content Strategist",
  category: "AI Marketing",
  visual: { nodeLabel: "AI Content Strategist", sceneTitle: "AI Content Operating System", sceneDescription: "A governed content system connecting audience insight, knowledge, editorial workflows, AI assistance, quality controls, distribution, and analytics.", imageAlt: "AI content strategy workspace showing audience research, taxonomy, editorial workflows, governance, distribution, and performance measurement." },
  shortDescription: "Design audience-centered content systems that use AI responsibly for research, production, reuse, distribution, governance, and measurable business outcomes.",
  difficulty: "Intermediate",
  estimatedLearningTime: "6-10 months part-time",
  salary: "Varies by market, strategic ownership, industry, and operational scope",
  hiringDemand: "Growing across brands, agencies, SaaS, media, knowledge teams, and AI-enabled marketing organizations",
  remoteAvailability: "High",
  aiCompatibilityScore: "98%",
  bestFor: ["Content strategists", "Editors", "Content marketers", "Knowledge managers", "SEO and GEO specialists", "Content operations professionals"],
  programmingRequirement: "Low: content systems, analytics, CMS, automation, and optional structured-data skills",
  mathRequirement: "Low to Moderate: experimentation, funnel metrics, efficiency, and reporting",
  creativityLevel: "Very High", communicationLevel: "Very High", lastUpdated: "2026-08-01",
  metrics: [
    { label: "Primary outcome", value: "Scalable audience value", detail: "Useful, differentiated content across journeys and channels." },
    { label: "Operating model", value: "Human-led, AI-assisted", detail: "Automation supports research and production while people own quality and decisions." },
    { label: "Core system", value: "Strategy + knowledge + workflow", detail: "Content assets are structured, reusable, governed, and measurable." },
    { label: "Quality principle", value: "Evidence before volume", detail: "Accuracy, originality, voice, and usefulness outrank output quantity." },
  ],
  overview: {
    title: "What does an AI Content Strategist do?",
    body: "An AI Content Strategist designs the strategy, architecture, workflows, governance, distribution, and measurement system behind AI-assisted content. The role aligns audience needs, brand, knowledge sources, editorial quality, technology, and business outcomes.",
    responsibilities: ["Research audiences and content journeys", "Audit content and define portfolio strategy", "Create taxonomies and reusable knowledge structures", "Design AI-assisted editorial workflows", "Define voice, quality, source, rights, and review standards", "Coordinate SEO, GEO, social, lifecycle, and channel distribution", "Measure content value and operational efficiency", "Lead stakeholder adoption and editorial governance"],
    industries: ["Technology", "Media", "E-commerce", "Education", "Professional services", "Healthcare information", "Financial services", "Agencies"],
  },
  journeyMap: { ...base.journeyMap, theme: "ai-laboratory", overviewTitle: "AI Content Strategist Journey", overviewDescription: "Progress from audience and content research through architecture, AI editorial workflows, governance, distribution, measurement, portfolio, and employment." },
  journeyStages: base.journeyStages.map(mapStage),
  roadmap: base.roadmap.map(mapRoadmap),
  projects: [
    { id: "aics-project-audit", title: "Audience and Content Portfolio Audit", difficulty: "Intermediate", estimatedTime: "25-35 hours", phaseId: "aics-roadmap-1", description: "Audit a content estate against audience journeys, brand goals, quality, reuse, distribution, and performance.", deliverables: ["Audience map", "Content inventory", "Gap analysis", "Prioritization model"], skills: ["Research", "Audit", "Strategy"] },
    { id: "aics-project-workflow", title: "Governed AI Editorial Workflow", difficulty: "Intermediate", estimatedTime: "30-45 hours", phaseId: "aics-roadmap-3", description: "Design and prototype an AI-assisted workflow covering research, briefing, drafting, review, provenance, approval, and publishing.", deliverables: ["Workflow map", "Prompt and source policy", "Review rubric", "Prototype", "Runbook"], skills: ["Workflow design", "AI governance", "Editorial operations"] },
    { id: "aics-project-knowledge", title: "Content Knowledge and Taxonomy System", difficulty: "Advanced", estimatedTime: "35-50 hours", phaseId: "aics-roadmap-2", description: "Create a structured content model with entities, taxonomy, metadata, source-of-truth, reuse rules, and retrieval patterns.", deliverables: ["Taxonomy", "Content model", "Metadata schema", "Governance rules"], skills: ["Information architecture", "Knowledge management", "Content modeling"] },
    { id: "aics-project-capstone", title: "AI Content Operating System Capstone", difficulty: "Advanced", estimatedTime: "60-85 hours", phaseId: "aics-roadmap-5", description: "Deliver a full content strategy, operating model, AI workflow, governance framework, distribution plan, dashboard, and executive recommendation.", deliverables: ["Strategy", "Architecture", "Workflow", "Governance", "Measurement framework", "Executive presentation"], skills: ["Strategy", "Operations", "Governance", "Analytics", "Leadership"] },
  ],
  finalChallenge: { title: "AI Content Strategy Review", description: "Defend a complete AI-enabled content operating system before editorial, brand, legal, technology, analytics, and executive stakeholders.", requirements: ["Audience and portfolio evidence", "Content and knowledge architecture", "Governed AI workflow", "Quality and rights controls", "Distribution and measurement plan"], deliverables: ["Strategy", "Operating model", "Workflow", "Governance handbook", "Dashboard", "Executive presentation"], evaluation: ["Audience insight", "Strategic coherence", "Editorial quality", "Responsible AI", "Operational feasibility", "Measurement", "Communication"] },
  relatedCareers: ["GEO Specialist", "Content Strategist", "Knowledge Manager", "Content Operations Manager", "AI Marketing Specialist"],
  portfolioTasks: [
    { id: "aics-portfolio-audit", title: "Publish a content strategy audit", description: "Show audience evidence, portfolio findings, prioritization, and recommendations.", type: "portfolio" },
    { id: "aics-portfolio-workflow", title: "Publish an AI editorial workflow", description: "Show sources, prompts, review, quality controls, ownership, and metrics.", type: "portfolio" },
    { id: "aics-portfolio-system", title: "Publish a content operating model", description: "Show roles, governance, taxonomy, lifecycle, distribution, and measurement.", type: "portfolio" },
  ],
  jobSearchTasks: [
    { id: "aics-job-titles", title: "Build a content-role title matrix", description: "Track AI Content Strategist, Content Strategy, Editorial AI, Content Operations, Knowledge, and Organic Growth roles.", type: "job-search" },
    { id: "aics-job-evidence", title: "Map vacancies to content evidence", description: "Connect strategy, workflow, governance, SEO/GEO, analytics, and leadership requirements to portfolio artifacts.", type: "job-search" },
    { id: "aics-job-cycle", title: "Run a targeted application cycle", description: "Apply with role-specific content-system evidence and review results weekly.", type: "job-search" },
  ],
  interviewPrep: { title: "AI Content Strategist Interview Preparation", practiceAreas: ["Audience research", "Content strategy", "Taxonomy", "AI workflows", "Editorial quality", "Rights and governance", "Distribution", "Measurement"], questions: ["How would you audit a fragmented content estate?", "When should AI not be used in editorial production?", "How do you preserve brand voice at scale?", "Design a governed AI editorial workflow.", "How would you structure content for reuse and retrieval?", "How do SEO and GEO fit the content strategy?", "Which metrics show audience and business value?", "Present your capstone and key trade-offs."] },
};

export const aiContentStrategistCareer = applyCareerTitleAliasPolicy(career);
