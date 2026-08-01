import { aiSolutionsConsultantCareer } from "@/data/careers/ai-solutions-consultant";
import { applyCareerTitleAliasPolicy } from "@/data/careerTitleAliases";
import type { CareerJourneyStage, CareerRoadmapPhase, CareerWorkspaceData } from "@/types/careerWorkspace";

const stages = [
  ["AI Transformation Consulting Orientation", "Transformation Strategy Observatory", "Understand enterprise AI transformation, consulting expectations, executive outcomes, and the evidence required for the role."],
  ["Enterprise Discovery and Current-State Assessment", "Enterprise Diagnostic Lab", "Assess strategy, processes, data, technology, risk, talent, culture, governance, and adoption readiness."],
  ["AI Opportunity Portfolio and Value Prioritization", "Opportunity Portfolio Studio", "Identify, size, compare, and sequence AI opportunities using value, feasibility, risk, readiness, and strategic fit."],
  ["Transformation Strategy and Target Operating Model", "Operating Model Foundry", "Define ambition, principles, capabilities, roles, decision rights, funding, governance, and delivery structure."],
  ["Technology, Data, and Platform Direction", "Enterprise AI Architecture Forum", "Align platform, data, integration, security, model, vendor, and build-buy-partner decisions with the transformation strategy."],
  ["Responsible AI, Risk, and Governance", "Responsible AI Council", "Design policy, accountability, risk classification, controls, oversight, audit, and escalation across the portfolio."],
  ["Adoption, Change, and Workforce Enablement", "Adoption and Capability Hub", "Redesign work, engage leaders, build skills, manage resistance, communicate value, and embed new behaviors."],
  ["Roadmap, Delivery Governance, and Value Realization", "Transformation Control Tower", "Sequence pilots and scale, manage dependencies, track benefits, resolve blockers, and govern execution."],
  ["Transformation Capstone and Executive Portfolio", "Executive Transformation Review", "Deliver a complete enterprise AI transformation strategy, operating model, portfolio, roadmap, governance, and value case."],
  ["Job Search and Consulting Interviews", "Consulting Career Launchpad", "Target transformation, strategy, advisory, adoption, and enterprise AI roles and practice executive case interviews."],
] as const;

const roadmap = [
  ["Enterprise Discovery Foundations", ["Stakeholders", "Current state", "Process landscape", "Data maturity", "Technology maturity", "Readiness"]],
  ["Opportunity Portfolio and Strategy", ["Use cases", "Value sizing", "Feasibility", "Risk", "Prioritization", "Strategic ambition"]],
  ["Operating Model and Governance", ["Capabilities", "Roles", "Decision rights", "Funding", "Responsible AI", "Portfolio governance"]],
  ["Platform, Adoption, and Workforce", ["Data", "Platforms", "Vendors", "Workflow redesign", "Skills", "Change management"]],
  ["Roadmap and Transformation Capstone", ["Pilots", "Scaling", "Dependencies", "Benefits", "Capstone", "Executive communication"]],
  ["Portfolio and Employment", ["Case studies", "Resume", "Title mapping", "Case interviews", "Executive presentation", "Stakeholder defense"]],
] as const;

function mapStage(stage: CareerJourneyStage, index: number): CareerJourneyStage {
  const [title, landmark, summary] = stages[index] ?? stages[stages.length - 1];
  const topics = ["Diagnostic", "Strategy", "Executive deliverable"];
  return { ...stage, id: `aitc-${index + 1}-${stage.id}`, title, label: title, landmark, theme: summary, summary, explanation: summary, lessons: topics.map((x) => `${title}: ${x}`), tasks: topics.map((x, i) => ({ id: `aitc-${index + 1}-task-${i + 1}`, title: `${x} artifact`, description: `Create a reviewable ${x.toLowerCase()} artifact for ${title}.`, type: index >= 8 ? "career" : "lesson" })), topicAssessments: stage.topicAssessments?.map((a, i) => ({ ...a, id: `aitc-${index + 1}-topic-${i + 1}`, title: `${title} topic check`, topicLabel: title })), phaseExam: stage.phaseExam ? { ...stage.phaseExam, id: `aitc-${index + 1}-exam`, title: `${title} comprehensive assessment` } : undefined };
}

function mapRoadmap(phase: CareerRoadmapPhase, index: number): CareerRoadmapPhase {
  const [title, sections] = roadmap[index] ?? roadmap[roadmap.length - 1];
  return { ...phase, id: `aitc-roadmap-${index + 1}`, phaseNumber: index + 1, title, goal: `Build practical competence across ${sections.join(", ")}.`, sections: [...sections], mentorTip: "Transformation is not a technology rollout. Link portfolio choices, operating model, governance, adoption, and benefits to measurable enterprise outcomes.", practicalMissions: [`Create one consulting artifact for ${sections[0]}.`, `Validate a recommendation covering ${sections.slice(1, 4).join(", ")}.`], expectedOutcome: `You can diagnose, design, and communicate ${title.toLowerCase()}.`, quiz: { ...phase.quiz, id: `aitc-roadmap-${index + 1}-quiz`, phaseId: `aitc-roadmap-${index + 1}`, title: `${title} checkpoint` }, lessons: phase.lessons.map((lesson, i) => ({ ...lesson, id: `aitc-roadmap-${index + 1}-lesson-${i + 1}`, title: `${sections[i % sections.length]} consulting practice`, summary: `Apply ${sections[i % sections.length]} in an AI transformation scenario.`, mission: `Create evidence for ${sections[i % sections.length]}.` })) };
}

const base = aiSolutionsConsultantCareer;
const career: CareerWorkspaceData = {
  ...base,
  slug: "ai-transformation-consultant",
  title: "AI Transformation Consultant",
  category: "Enterprise AI & Consulting",
  visual: { nodeLabel: "AI Transformation Consultant", sceneTitle: "Enterprise AI Transformation Command Center", sceneDescription: "An enterprise strategy environment connecting opportunity portfolios, operating models, governance, platforms, workforce adoption, delivery roadmaps, and value realization.", imageAlt: "AI transformation consulting workspace showing enterprise assessment, use-case portfolio, operating model, governance, adoption, and roadmap." },
  shortDescription: "Help organizations define, govern, deliver, adopt, and scale AI transformation through strategy, prioritized portfolios, operating models, responsible AI, workforce change, and measurable value realization.",
  difficulty: "Advanced",
  estimatedLearningTime: "9-14 months part-time",
  salary: "Varies by market, consulting seniority, industry expertise, and enterprise scope",
  hiringDemand: "Strong across consulting, enterprise strategy, digital transformation, technology advisory, and AI adoption programs",
  remoteAvailability: "Medium to High; stakeholder discovery and executive work often require hybrid delivery",
  aiCompatibilityScore: "97%",
  bestFor: ["Management and technology consultants", "Digital transformation professionals", "AI solutions consultants", "Product and program leaders", "Business architects", "Change and adoption specialists"],
  programmingRequirement: "Low to Moderate: sufficient technical fluency to evaluate platforms, data, integrations, feasibility, and delivery risk",
  mathRequirement: "Moderate: value sizing, scenario analysis, portfolio economics, benefits tracking, and prioritization",
  creativityLevel: "High", communicationLevel: "Very High", lastUpdated: "2026-08-01",
  metrics: [
    { label: "Primary outcome", value: "Enterprise value from AI", detail: "A governed portfolio translated into adopted capabilities and measurable outcomes." },
    { label: "Consulting scope", value: "Strategy to scale", detail: "Discovery, portfolio, operating model, governance, adoption, roadmap, and benefits." },
    { label: "Core artifact", value: "Transformation blueprint", detail: "A decision-ready target state with ownership, sequencing, investment, and controls." },
    { label: "Success principle", value: "Adoption over pilots", detail: "Transformation succeeds when work, decisions, skills, and outcomes change sustainably." },
  ],
  overview: {
    title: "What does an AI Transformation Consultant do?",
    body: "An AI Transformation Consultant helps leaders move from isolated AI experiments to a coherent enterprise transformation. The role diagnoses readiness, prioritizes opportunities, defines the target operating model and governance, aligns technology and data direction, leads adoption planning, and establishes delivery and value-realization mechanisms.",
    responsibilities: ["Assess enterprise AI readiness and current state", "Facilitate executive and stakeholder discovery", "Build and prioritize AI opportunity portfolios", "Define transformation strategy and target operating model", "Recommend platform, data, vendor, and sourcing direction", "Design responsible-AI and portfolio governance", "Plan workforce enablement and change adoption", "Create roadmaps, investment cases, and delivery governance", "Track benefits, risk, and executive decisions"],
    industries: ["Consulting", "Financial services", "Retail", "Manufacturing", "Healthcare", "Public sector", "Telecommunications", "Professional services"],
  },
  journeyMap: { ...base.journeyMap, theme: "tech-city", overviewTitle: "AI Transformation Consultant Journey", overviewDescription: "Progress from enterprise diagnosis through opportunity portfolios, strategy, operating model, governance, platform direction, adoption, delivery, executive capstone, and employment." },
  journeyStages: base.journeyStages.map(mapStage),
  roadmap: base.roadmap.map(mapRoadmap),
  projects: [
    { id: "aitc-project-assessment", title: "Enterprise AI Readiness Assessment", difficulty: "Intermediate", estimatedTime: "30-45 hours", phaseId: "aitc-roadmap-1", description: "Assess strategy, process, data, technology, risk, talent, culture, governance, and adoption readiness for a representative organization.", deliverables: ["Assessment framework", "Stakeholder findings", "Maturity heatmap", "Executive diagnosis"], skills: ["Discovery", "Assessment", "Executive synthesis"] },
    { id: "aitc-project-portfolio", title: "AI Opportunity Portfolio and Business Case", difficulty: "Advanced", estimatedTime: "35-50 hours", phaseId: "aitc-roadmap-2", description: "Create a governed opportunity portfolio with value, feasibility, risk, readiness, dependencies, and investment scenarios.", deliverables: ["Use-case inventory", "Prioritization model", "Portfolio map", "Business case"], skills: ["Portfolio strategy", "Value sizing", "Prioritization"] },
    { id: "aitc-project-operating-model", title: "AI Target Operating Model", difficulty: "Advanced", estimatedTime: "40-60 hours", phaseId: "aitc-roadmap-3", description: "Design capabilities, roles, decision rights, governance forums, funding, delivery pathways, risk controls, and ownership.", deliverables: ["Capability model", "Operating model", "RACI", "Governance design", "Implementation plan"], skills: ["Operating models", "Governance", "Organization design"] },
    { id: "aitc-project-capstone", title: "Enterprise AI Transformation Blueprint", difficulty: "Advanced", estimatedTime: "75-110 hours", phaseId: "aitc-roadmap-5", description: "Deliver a complete transformation strategy covering diagnosis, ambition, portfolio, operating model, technology direction, responsible AI, adoption, roadmap, investment, and value realization.", deliverables: ["Executive strategy", "Portfolio", "Operating model", "Governance", "Roadmap", "Benefits framework", "Board presentation"], skills: ["Transformation strategy", "Adoption", "Executive consulting", "Value realization"] },
  ],
  finalChallenge: { title: "Executive AI Transformation Review", description: "Defend an enterprise AI transformation blueprint before executives representing business, technology, finance, risk, HR, and operations.", requirements: ["Evidence-based enterprise diagnosis", "Prioritized opportunity portfolio", "Target operating model and governance", "Technology and data direction", "Adoption and workforce plan", "Roadmap, investment, and benefits model"], deliverables: ["Transformation blueprint", "Portfolio model", "Operating model", "Roadmap", "Benefits dashboard design", "Executive presentation"], evaluation: ["Diagnostic quality", "Strategic coherence", "Value and feasibility", "Governance", "Adoption realism", "Executive communication", "Consulting judgment"] },
  relatedCareers: ["AI Solutions Consultant", "Enterprise AI Consultant", "Business AI Consultant", "AI Adoption Consultant", "Digital Transformation Consultant"],
  portfolioTasks: [
    { id: "aitc-portfolio-assessment", title: "Publish an AI readiness assessment", description: "Show framework, evidence, maturity findings, implications, and recommendations.", type: "portfolio" },
    { id: "aitc-portfolio-model", title: "Publish a target operating model", description: "Show capabilities, roles, governance, funding, delivery pathways, and accountability.", type: "portfolio" },
    { id: "aitc-portfolio-blueprint", title: "Publish a transformation blueprint", description: "Show portfolio, roadmap, adoption, governance, investment, and benefits logic.", type: "portfolio" },
  ],
  jobSearchTasks: [
    { id: "aitc-job-titles", title: "Build a transformation-role matrix", description: "Track AI Transformation, Digital Transformation, AI Strategy, Enterprise AI, Adoption, and Technology Advisory roles.", type: "job-search" },
    { id: "aitc-job-evidence", title: "Map consulting requirements to evidence", description: "Connect discovery, strategy, operating model, governance, adoption, and executive communication to portfolio artifacts.", type: "job-search" },
    { id: "aitc-job-cycle", title: "Run a targeted consulting application cycle", description: "Apply with role-specific transformation cases and review response patterns weekly.", type: "job-search" },
  ],
  interviewPrep: { title: "AI Transformation Consultant Interview Preparation", practiceAreas: ["Enterprise discovery", "Opportunity portfolios", "Operating models", "Responsible AI", "Platform direction", "Adoption", "Value realization", "Executive cases"], questions: ["How would you assess AI readiness in a global organization?", "How do you prioritize an AI opportunity portfolio?", "Design a target operating model for enterprise AI.", "How should responsible-AI governance connect to delivery?", "How would you choose between centralized and federated models?", "What causes AI pilots to fail at scale?", "How would you measure transformation value?", "Present your capstone to a skeptical executive committee."] },
};

export const aiTransformationConsultantCareer = applyCareerTitleAliasPolicy(career);
