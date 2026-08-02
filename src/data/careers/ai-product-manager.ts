import { aiWorkflowArchitectCareer } from "@/data/careers/ai-workflow-architect";
import { applyCareerTitleAliasPolicy } from "@/data/careerTitleAliases";
import type {
  CareerJourneyStage,
  CareerRoadmapPhase,
  CareerWorkspaceData,
} from "@/types/careerWorkspace";

const stageContent = [
  {
    title: "AI Product Management Orientation",
    landmark: "Product Strategy Observatory",
    theme: "Understand the role, its boundaries, and the evidence expected from an AI Product Manager.",
    summary: "Map the role across customer discovery, product strategy, AI capability assessment, delivery, evaluation, governance, adoption, and business outcomes.",
    explanation: "AI Product Managers do more than add model features to existing products. They identify valuable problems, define safe product behavior, align data and engineering constraints, establish evaluation criteria, and lead adoption and iteration.",
    lessons: ["Role scope and career variants", "AI product lifecycle", "Evidence and portfolio plan"],
    tasks: [
      "Compare five AI Product Manager vacancies and extract recurring responsibilities.",
      "Create a skills baseline covering discovery, strategy, data, evaluation, delivery, risk, and adoption.",
      "Choose one user problem for an end-to-end AI product capstone.",
    ],
  },
  {
    title: "Customer Discovery and Problem Framing",
    landmark: "Customer Insight Lab",
    theme: "Find a valuable problem before choosing an AI capability.",
    summary: "Research users, workflows, pain points, constraints, alternatives, and measurable outcomes.",
    explanation: "You will learn to distinguish a real customer problem from technology enthusiasm. The output is an evidence-based opportunity statement with target users, current behavior, risks, constraints, and success criteria.",
    lessons: ["User research", "Workflow and jobs-to-be-done analysis", "Opportunity framing and prioritization"],
    tasks: [
      "Conduct or simulate five structured user interviews.",
      "Map the current workflow, alternatives, pain points, and decision points.",
      "Write a problem brief with measurable customer and business outcomes.",
    ],
  },
  {
    title: "AI Capability and Feasibility Assessment",
    landmark: "Capability Evaluation Studio",
    theme: "Match product problems to realistic model capabilities, data, cost, and risk.",
    summary: "Assess whether rules, search, prediction, generation, retrieval, agents, or no AI is the correct approach.",
    explanation: "Product decisions must reflect model limitations, data readiness, latency, cost, privacy, reliability, and operational constraints. You will learn to ask the technical questions required before committing to a roadmap.",
    lessons: ["AI capability patterns", "Data and technical feasibility", "Build-buy-partner decisions"],
    tasks: [
      "Create an AI capability-to-problem fit matrix.",
      "Document data, latency, cost, privacy, and reliability constraints.",
      "Produce a build-versus-buy recommendation with explicit assumptions.",
    ],
  },
  {
    title: "Product Strategy, Vision, and Roadmapping",
    landmark: "Strategy Command Center",
    theme: "Turn validated opportunity into a focused product strategy and sequenced roadmap.",
    summary: "Define product vision, target segment, value proposition, differentiation, strategic bets, and learning milestones.",
    explanation: "AI roadmaps must sequence uncertainty reduction, not only features. You will connect customer value, business value, data readiness, technical risk, governance, and adoption into one product strategy.",
    lessons: ["Vision and positioning", "Strategic prioritization", "Outcome-based roadmapping"],
    tasks: [
      "Write a one-page AI product strategy.",
      "Create an outcome-based roadmap with discovery, prototype, pilot, and scale phases.",
      "Define what will not be built and why.",
    ],
  },
  {
    title: "AI Product Requirements and Experience Design",
    landmark: "Human-AI Experience Workshop",
    theme: "Specify useful behavior, user control, failure states, and product boundaries.",
    summary: "Design human-AI interactions with clear inputs, outputs, confidence, feedback, review, override, and fallback behavior.",
    explanation: "An AI requirement is incomplete if it only describes the happy path. You will define product behavior under uncertainty, explainability needs, human authority, escalation, accessibility, and recovery.",
    lessons: ["AI product requirements", "Human-AI interaction patterns", "Failure, feedback, and fallback design"],
    tasks: [
      "Write a product requirements document with AI-specific acceptance criteria.",
      "Create user flows for normal, uncertain, unsafe, and unavailable-model states.",
      "Design feedback and correction mechanisms that improve product learning.",
    ],
  },
  {
    title: "Evaluation, Metrics, and Experimentation",
    landmark: "Product Evaluation Lab",
    theme: "Measure product value, model quality, safety, cost, and user trust together.",
    summary: "Build an evaluation system combining offline tests, product analytics, experiments, qualitative review, and operational metrics.",
    explanation: "Model accuracy alone does not prove product success. You will define a metric hierarchy covering customer outcomes, task success, quality, harmful failure, latency, cost, adoption, and business impact.",
    lessons: ["Metric hierarchy", "Evaluation datasets and rubrics", "Experiments and product analytics"],
    tasks: [
      "Define north-star, guardrail, quality, cost, and adoption metrics.",
      "Create a representative evaluation dataset and scoring rubric.",
      "Design an experiment or pilot decision framework.",
    ],
  },
  {
    title: "Responsible AI, Trust, and Product Governance",
    landmark: "Trust and Governance Gate",
    theme: "Build privacy, safety, fairness, transparency, and accountability into product decisions.",
    summary: "Identify harms, define controls, assign ownership, and establish release and monitoring requirements.",
    explanation: "The Product Manager is responsible for ensuring that risk decisions are visible and owned. You will create risk assessments, human-review policy, data and model governance requirements, and release gates.",
    lessons: ["AI risk assessment", "Privacy, fairness, and transparency", "Governance and release controls"],
    tasks: [
      "Create a product risk register and misuse analysis.",
      "Define human oversight, appeal, and incident escalation requirements.",
      "Create release gates for quality, safety, privacy, security, and operations.",
    ],
  },
  {
    title: "Delivery, Launch, and Cross-Functional Leadership",
    landmark: "Product Delivery Hub",
    theme: "Lead discovery-to-launch collaboration across design, data, engineering, legal, operations, and go-to-market.",
    summary: "Manage scope, dependencies, decisions, pilots, rollout, change management, and stakeholder alignment.",
    explanation: "AI products require tight cross-functional coordination because capability, risk, data, and user behavior evolve together. You will learn to run decision forums, manage uncertainty, and launch progressively.",
    lessons: ["Cross-functional delivery", "Pilot and rollout strategy", "Stakeholder and change management"],
    tasks: [
      "Create a delivery plan with owners, dependencies, risks, and decision points.",
      "Design a pilot with entry, exit, pause, and rollback criteria.",
      "Prepare stakeholder communications for launch and adoption.",
    ],
  },
  {
    title: "AI Product Capstone and Portfolio",
    landmark: "Product Review Forum",
    theme: "Produce and defend a complete AI product case from problem evidence to launch plan.",
    summary: "Deliver customer evidence, strategy, requirements, prototype, evaluation, risk controls, roadmap, and business case.",
    explanation: "Your capstone must demonstrate judgment across the full product lifecycle. It should make assumptions, trade-offs, evidence, risks, and next decisions inspectable.",
    lessons: ["End-to-end product case", "Portfolio storytelling", "Executive and technical communication"],
    tasks: [
      "Complete the AI product capstone with a testable prototype or detailed interaction model.",
      "Publish a case study covering evidence, strategy, metrics, risks, and lessons learned.",
      "Present the product recommendation to a simulated executive and technical review panel.",
    ],
  },
  {
    title: "Job Search and AI Product Interviews",
    landmark: "Product Career Launchpad",
    theme: "Target the correct product role family and defend decisions with evidence.",
    summary: "Search across title variants, tailor portfolio evidence, and practice product sense, execution, analytics, strategy, and AI scenarios.",
    explanation: "AI Product Manager roles vary widely. You will compare actual responsibilities, identify technical depth expectations, tailor your case studies, and practice structured interviews.",
    lessons: ["Role-title mapping", "Portfolio and application strategy", "AI product interview frameworks"],
    tasks: [
      "Build a target-role matrix across AI, ML, data, platform, and GenAI Product Manager titles.",
      "Tailor one capstone narrative to three vacancy patterns.",
      "Complete mock interviews covering product sense, execution, metrics, strategy, risk, and technical trade-offs.",
    ],
  },
] as const;

const roadmapContent = [
  {
    title: "AI Product and Customer Foundations",
    goal: "Understand AI product management and validate a meaningful customer problem.",
    sections: ["Role foundations", "User research", "Workflow analysis", "Problem framing", "Opportunity sizing", "Prioritization"],
  },
  {
    title: "AI Feasibility and Product Strategy",
    goal: "Assess capability, data, constraints, differentiation, and strategic direction.",
    sections: ["AI patterns", "Data readiness", "Technical feasibility", "Build versus buy", "Vision", "Roadmapping"],
  },
  {
    title: "Product Requirements and Human-AI Experience",
    goal: "Define useful, controllable product behavior across normal and failure conditions.",
    sections: ["PRDs", "User flows", "Confidence", "Human review", "Feedback", "Fallbacks"],
  },
  {
    title: "Evaluation, Responsible AI, and Governance",
    goal: "Measure product value and establish quality, safety, privacy, fairness, and release controls.",
    sections: ["Metrics", "Evaluation", "Experiments", "Risk", "Responsible AI", "Governance"],
  },
  {
    title: "Delivery, Launch, and Product Capstone",
    goal: "Lead cross-functional delivery and produce a complete AI product case with launch evidence.",
    sections: ["Delivery", "Pilots", "Rollout", "Adoption", "Capstone", "Business case"],
  },
  {
    title: "Portfolio and Employment Readiness",
    goal: "Package product evidence and prepare for AI product applications and interviews.",
    sections: ["Case studies", "Resume", "Role mapping", "Product sense", "Analytics", "Interview defense"],
  },
] as const;

function mapStage(stage: CareerJourneyStage, index: number): CareerJourneyStage {
  const content = stageContent[index] ?? stageContent[stageContent.length - 1];
  return {
    ...stage,
    id: `aipm-${index + 1}-${stage.id}`,
    title: content.title,
    label: content.title,
    landmark: content.landmark,
    theme: content.theme,
    summary: content.summary,
    explanation: content.explanation,
    lessons: [...content.lessons],
    tasks: content.tasks.map((description, taskIndex) => ({
      id: `aipm-stage-${index + 1}-task-${taskIndex + 1}`,
      title: description,
      description,
      type: index >= 8 ? "career" : index === 7 ? "project" : "lesson",
    })),
    topicAssessments: stage.topicAssessments?.map((assessment, assessmentIndex) => ({
      ...assessment,
      id: `aipm-stage-${index + 1}-topic-${assessmentIndex + 1}-assessment`,
      title: `${content.lessons[assessmentIndex % content.lessons.length]} knowledge check`,
      topicLabel: content.lessons[assessmentIndex % content.lessons.length],
    })),
    phaseExam: stage.phaseExam
      ? {
          ...stage.phaseExam,
          id: `aipm-stage-${index + 1}-comprehensive-assessment`,
          title: `${content.title} comprehensive assessment`,
          description: `A 20-question product scenario assessment covering ${content.lessons.join(", ")}.`,
        }
      : undefined,
  };
}

function mapRoadmap(phase: CareerRoadmapPhase, index: number): CareerRoadmapPhase {
  const content = roadmapContent[index] ?? roadmapContent[roadmapContent.length - 1];
  return {
    ...phase,
    id: `aipm-roadmap-phase-${index + 1}`,
    phaseNumber: index + 1,
    title: content.title,
    goal: content.goal,
    sections: [...content.sections],
    mentorTip:
      index === 0
        ? "Start with evidence about users and workflows. AI capability is not a substitute for a valuable problem."
        : index === 3
          ? "Treat quality, safety, privacy, cost, and trust as product metrics—not compliance footnotes."
          : "Make assumptions and trade-offs explicit, then design the next test that reduces the most important uncertainty.",
    practicalMissions: [
      `Create one reviewable product artifact for ${content.sections[0]}.`,
      `Validate a decision covering ${content.sections.slice(1, 4).join(", ")}.`,
    ],
    expectedOutcome: `You can make and defend product decisions across ${content.sections.join(", ")}.`,
    quiz: {
      ...phase.quiz,
      id: `aipm-roadmap-phase-${index + 1}-quiz`,
      phaseId: `aipm-roadmap-phase-${index + 1}`,
      title: `${content.title} checkpoint`,
    },
    lessons: phase.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      id: `aipm-roadmap-${index + 1}-lesson-${lessonIndex + 1}`,
      title: `${content.sections[lessonIndex % content.sections.length]} product practice`,
      summary: `Apply ${content.sections[lessonIndex % content.sections.length]} in an AI Product Manager scenario.`,
      mission: `Create and review a product artifact demonstrating ${content.sections[lessonIndex % content.sections.length]}.`,
    })),
  };
}

const base = aiWorkflowArchitectCareer;

const aiProductManagerBase: CareerWorkspaceData = {
  ...base,
  slug: "ai-product-manager",
  title: "AI Product Manager",
  category: "AI Product",
  visual: {
    nodeLabel: "AI Product Manager",
    sceneTitle: "AI Product Discovery and Launch Lab",
    sceneDescription:
      "A product environment connecting customer evidence, AI capability, data, experience design, evaluation, governance, delivery, and adoption.",
    imageAlt:
      "AI product management workspace showing user research, product strategy, model evaluation, responsible AI, roadmap, and launch metrics.",
  },
  shortDescription:
    "Identify valuable customer problems and lead useful, responsible AI products from discovery through strategy, evaluation, delivery, launch, adoption, and continuous improvement.",
  difficulty: "Intermediate to Advanced",
  estimatedLearningTime: "7-11 months part-time",
  salary: "Varies by country, product seniority, technical depth, and company stage",
  hiringDemand: "Strong and growing across SaaS, enterprise software, AI platforms, consulting, financial services, healthcare, and digital products",
  remoteAvailability: "High, with hybrid work common for discovery and cross-functional leadership",
  aiCompatibilityScore: "97%",
  bestFor: [
    "Product Managers moving into AI",
    "Business analysts and consultants with strong customer discovery skills",
    "Technical professionals moving toward product leadership",
    "Design and operations professionals who can frame user problems",
    "Founders and product owners building AI-enabled products",
  ],
  programmingRequirement: "Low to Moderate: enough technical literacy to work with APIs, data, models, evaluation, and engineering trade-offs",
  mathRequirement: "Moderate: product analytics, experiments, evaluation metrics, cost, and business cases",
  creativityLevel: "Very High",
  communicationLevel: "Very High",
  lastUpdated: "2026-08-01",
  metrics: [
    { label: "Primary outcome", value: "Useful and trusted AI products", detail: "Customer value, business impact, safe behavior, and sustainable adoption." },
    { label: "Core decisions", value: "Problem + capability + evidence", detail: "Choose where AI creates value and how success will be measured." },
    { label: "Cross-functional scope", value: "Product, design, data, engineering, risk", detail: "Align teams around outcomes, constraints, and learning." },
    { label: "Release standard", value: "Measured and governed", detail: "Quality, safety, privacy, cost, and operations are release criteria." },
  ],
  overview: {
    title: "What does an AI Product Manager do?",
    body:
      "An AI Product Manager identifies valuable user and business problems, evaluates whether AI is an appropriate solution, defines product strategy and behavior, aligns cross-functional delivery, establishes evaluation and responsible-AI controls, and leads launch, adoption, and iteration.",
    responsibilities: [
      "Conduct customer discovery and map user workflows",
      "Define product vision, strategy, positioning, and roadmap",
      "Assess AI capability, data readiness, technical feasibility, cost, and risk",
      "Write AI-specific product requirements and acceptance criteria",
      "Design human control, feedback, fallback, and failure behavior",
      "Define evaluation datasets, quality metrics, experiments, and guardrails",
      "Coordinate product, design, engineering, data, legal, security, and operations",
      "Lead pilots, launches, adoption, and change management",
      "Monitor customer outcomes, model behavior, cost, safety, and business impact",
      "Communicate decisions, assumptions, trade-offs, and evidence to stakeholders",
    ],
    industries: [
      "Enterprise software and SaaS",
      "AI platforms and developer tools",
      "Financial services and insurance",
      "Healthcare and life sciences",
      "Retail and e-commerce",
      "Professional services and consulting",
      "Education and knowledge products",
      "Operations, supply chain, and productivity software",
    ],
  },
  journeyMap: {
    ...base.journeyMap,
    theme: "future-space-colony",
    overviewTitle: "AI Product Management Journey",
    overviewDescription:
      "Progress from customer discovery and AI feasibility through strategy, requirements, evaluation, responsible AI, delivery, capstone evidence, and job readiness.",
  },
  journeyStages: base.journeyStages.map(mapStage),
  roadmap: base.roadmap.map(mapRoadmap),
  projects: [
    {
      id: "aipm-project-opportunity-brief",
      title: "AI Product Opportunity and Discovery Brief",
      difficulty: "Intermediate",
      estimatedTime: "25-35 hours",
      phaseId: "aipm-roadmap-phase-1",
      description:
        "Research a target user workflow, validate the problem, assess alternatives, size the opportunity, and recommend whether AI should be explored.",
      deliverables: ["Interview guide", "Research synthesis", "Workflow map", "Opportunity statement", "Prioritization score", "Recommendation memo"],
      skills: ["Discovery", "User research", "Problem framing", "Opportunity sizing", "Prioritization"],
    },
    {
      id: "aipm-project-ai-prd",
      title: "AI Product Requirements and Experience Specification",
      difficulty: "Intermediate",
      estimatedTime: "30-45 hours",
      phaseId: "aipm-roadmap-phase-3",
      description:
        "Define an AI-enabled product experience with user flows, requirements, acceptance criteria, uncertainty handling, human review, feedback, and fallback behavior.",
      deliverables: ["PRD", "User flows", "Prototype", "Acceptance criteria", "Failure-state matrix", "Feedback design"],
      skills: ["PRDs", "Human-AI UX", "Requirements", "Failure design", "Product communication"],
    },
    {
      id: "aipm-project-evaluation-plan",
      title: "AI Product Evaluation and Responsible Launch Plan",
      difficulty: "Advanced",
      estimatedTime: "35-50 hours",
      phaseId: "aipm-roadmap-phase-4",
      description:
        "Create a metric hierarchy, evaluation dataset, quality rubric, risk register, experiment design, release gates, and monitoring plan.",
      deliverables: ["Metric tree", "Evaluation set", "Scoring rubric", "Risk register", "Experiment plan", "Release checklist"],
      skills: ["Evaluation", "Analytics", "Responsible AI", "Experimentation", "Governance"],
    },
    {
      id: "aipm-project-capstone",
      title: "End-to-End AI Product Capstone",
      difficulty: "Advanced",
      estimatedTime: "60-90 hours",
      phaseId: "aipm-roadmap-phase-5",
      description:
        "Develop and defend a complete AI product recommendation from customer evidence through strategy, requirements, prototype, evaluation, risk controls, roadmap, rollout, and business case.",
      deliverables: ["Discovery evidence", "Product strategy", "Roadmap", "PRD", "Prototype", "Evaluation plan", "Risk controls", "Launch plan", "Business case"],
      skills: ["Product strategy", "AI literacy", "Delivery", "Evaluation", "Responsible AI", "Executive communication"],
    },
  ],
  finalChallenge: {
    title: "AI Product Investment and Launch Review",
    description:
      "Defend an AI product recommendation before a review panel representing customers, engineering, data, legal, security, operations, finance, and executive leadership.",
    requirements: [
      "Validated customer problem and target segment",
      "Justified AI capability and alternative analysis",
      "Clear product strategy and roadmap",
      "Testable requirements and human-AI interaction design",
      "Evaluation, experiment, and metric framework",
      "Responsible-AI, privacy, security, and governance controls",
      "Pilot, rollout, monitoring, and adoption plan",
      "Defensible business case and explicit assumptions",
    ],
    deliverables: [
      "Customer evidence pack",
      "Product strategy and roadmap",
      "PRD and prototype",
      "Evaluation and metric plan",
      "Risk and governance register",
      "Pilot and launch plan",
      "Business case",
      "Ten-minute product defense",
    ],
    evaluation: [
      "Customer and problem understanding",
      "AI capability judgment",
      "Product strategy quality",
      "Experience and requirement clarity",
      "Evaluation rigor",
      "Responsible-AI controls",
      "Delivery and adoption realism",
      "Business judgment and communication",
    ],
  },
  relatedCareers: [
    "Product Manager",
    "Technical Product Manager",
    "Machine Learning Product Manager",
    "Generative AI Product Manager",
    "AI Solutions Consultant",
    "AI Program Manager",
  ],
  portfolioTasks: [
    {
      id: "aipm-portfolio-discovery-case",
      title: "Publish an AI opportunity discovery case study",
      description: "Show user evidence, workflow analysis, alternatives, prioritization, and the decision to use or reject AI.",
      type: "portfolio",
    },
    {
      id: "aipm-portfolio-product-case",
      title: "Publish an AI product specification case study",
      description: "Present strategy, PRD, prototype, evaluation, risk controls, and product trade-offs.",
      type: "portfolio",
    },
    {
      id: "aipm-portfolio-capstone-demo",
      title: "Record the capstone product review",
      description: "Explain customer evidence, product choices, metrics, risks, roadmap, and launch recommendation.",
      type: "portfolio",
    },
  ],
  jobSearchTasks: [
    {
      id: "aipm-job-title-matrix",
      title: "Create an AI Product Manager title matrix",
      description: "Track AI Product Manager, ML Product Manager, GenAI Product Manager, Technical Product Manager, Data Product Manager, and adjacent titles.",
      type: "job-search",
    },
    {
      id: "aipm-job-evidence-map",
      title: "Map vacancies to product evidence",
      description: "Connect discovery, strategy, delivery, analytics, AI literacy, risk, and adoption requirements to specific artifacts.",
      type: "job-search",
    },
    {
      id: "aipm-job-application-cycle",
      title: "Run a targeted AI product application cycle",
      description: "Submit evidence-matched applications, track response patterns, and refine positioning weekly.",
      type: "job-search",
    },
  ],
  interviewPrep: {
    title: "AI Product Manager Interview Preparation",
    practiceAreas: [
      "Product sense and customer discovery",
      "AI capability and technical trade-offs",
      "Product strategy and prioritization",
      "Requirements and human-AI experience",
      "Metrics, evaluation, and experimentation",
      "Responsible AI, privacy, and trust",
      "Delivery and cross-functional leadership",
      "Launch, adoption, and business impact",
    ],
    questions: [
      "How would you identify a valuable problem for an AI product?",
      "When should a team use rules, search, prediction, generation, agents, or no AI?",
      "Design an AI assistant for a high-impact workflow and explain human control requirements.",
      "How would you define success for a generative AI feature?",
      "What offline and online evaluations would you use before launch?",
      "How would you handle hallucinations or low-confidence outputs in the product experience?",
      "How would you prioritize quality, latency, cost, safety, and feature scope?",
      "Describe a pilot and rollout strategy for an enterprise AI product.",
      "How would you respond when leadership wants to launch before risk controls are ready?",
      "How would you evaluate build versus buy for an AI capability?",
      "Tell me about a product assumption that should be tested before engineering investment.",
      "Walk through your capstone from customer problem to launch recommendation.",
    ],
  },
};

export const aiProductManagerCareer = applyCareerTitleAliasPolicy(
  aiProductManagerBase
);
