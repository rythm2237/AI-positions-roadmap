import { aiProductManagerCareer } from "@/data/careers/ai-product-manager";
import { applyCareerTitleAliasPolicy } from "@/data/careerTitleAliases";
import type {
  CareerJourneyStage,
  CareerRoadmapPhase,
  CareerWorkspaceData,
} from "@/types/careerWorkspace";

const stageContent = [
  {
    title: "AI Solutions Consulting Orientation",
    landmark: "Consulting Strategy Observatory",
    theme: "Understand the role, its boundaries, and the evidence clients and employers expect.",
    summary: "Map the role across business discovery, AI opportunity assessment, solution design, value cases, governance, delivery planning, adoption, and executive communication.",
    explanation: "An AI Solutions Consultant translates ambiguous business needs into practical, trustworthy solution options. The role combines consulting structure, technical fluency, commercial judgment, stakeholder alignment, and delivery awareness.",
    lessons: ["Role scope and consulting models", "AI solution lifecycle", "Evidence and portfolio plan"],
    tasks: [
      "Compare five AI Solutions Consultant vacancies and extract recurring responsibilities.",
      "Create a baseline covering discovery, business analysis, AI, architecture, governance, value, and communication.",
      "Select one client-style business problem for an end-to-end consulting capstone.",
    ],
  },
  {
    title: "Client Discovery and Problem Framing",
    landmark: "Discovery Workshop",
    theme: "Structure the real business problem before proposing technology.",
    summary: "Interview stakeholders, map workflows, identify constraints, clarify outcomes, and separate symptoms from root causes.",
    explanation: "Consulting quality begins with disciplined discovery. You will learn to gather evidence, reconcile stakeholder perspectives, map current-state work, identify decision rights, and define measurable outcomes without prematurely committing to AI.",
    lessons: ["Stakeholder interviews", "Process and pain-point analysis", "Problem statements and success criteria"],
    tasks: [
      "Run a structured discovery workshop with representative stakeholders.",
      "Create a current-state workflow and stakeholder map.",
      "Write a consulting problem statement with assumptions, constraints, risks, and measurable outcomes.",
    ],
  },
  {
    title: "AI Opportunity and Feasibility Assessment",
    landmark: "Opportunity Evaluation Lab",
    theme: "Determine where AI creates defensible value and where it does not.",
    summary: "Assess use cases across value, data, technical feasibility, operating impact, risk, cost, and adoption readiness.",
    explanation: "You will compare rules, analytics, automation, search, predictive AI, generative AI, agents, and non-technical process changes. The output is a prioritized opportunity portfolio rather than a list of fashionable use cases.",
    lessons: ["Use-case qualification", "Data and technical feasibility", "Value-risk prioritization"],
    tasks: [
      "Build an AI opportunity scorecard.",
      "Assess data, integration, latency, privacy, reliability, and operating constraints.",
      "Prioritize use cases using value, feasibility, risk, and adoption criteria.",
    ],
  },
  {
    title: "Solution Options and Architecture Framing",
    landmark: "Solution Design Studio",
    theme: "Convert business requirements into understandable solution options and trade-offs.",
    summary: "Frame solution boundaries, AI patterns, integrations, human controls, data flows, operating responsibilities, and implementation choices.",
    explanation: "A consultant does not need to own every implementation detail, but must ask the right architecture questions. You will create option papers, context diagrams, build-buy-partner comparisons, and decision records that engineering and business stakeholders can evaluate.",
    lessons: ["Solution pattern selection", "Integration and data-flow framing", "Build-buy-partner analysis"],
    tasks: [
      "Create three solution options with trade-offs.",
      "Produce a high-level architecture and data-flow diagram.",
      "Write a recommendation covering capability, cost, risk, time, ownership, and portability.",
    ],
  },
  {
    title: "Business Case, ROI, and Commercial Value",
    landmark: "Value Realization Center",
    theme: "Connect the proposed solution to measurable economic and operational outcomes.",
    summary: "Estimate benefits, costs, risks, capacity impact, adoption requirements, and value-realization milestones.",
    explanation: "AI business cases must include implementation, data, integration, governance, human review, change, and operating costs. You will distinguish potential value from realized value and make uncertainty visible.",
    lessons: ["Benefits and cost modeling", "ROI and scenario analysis", "Value-realization planning"],
    tasks: [
      "Build a transparent value model with baseline assumptions.",
      "Run optimistic, expected, and conservative scenarios.",
      "Define post-launch measures for realized value, quality, adoption, and risk.",
    ],
  },
  {
    title: "Responsible AI, Security, and Governance",
    landmark: "Trust and Governance Forum",
    theme: "Make trust, security, privacy, accountability, and human authority part of the recommendation.",
    summary: "Assess data handling, access, model risk, harmful failure, auditability, human oversight, policy, and regulatory constraints.",
    explanation: "Responsible AI is not a separate appendix. You will identify trust boundaries, classify impacts, define approval authority, specify evaluation and monitoring requirements, and know when a use case should be delayed or rejected.",
    lessons: ["Risk and impact assessment", "Security and privacy framing", "Governance and human oversight"],
    tasks: [
      "Create a responsible-AI and security risk register.",
      "Define human review and escalation policy.",
      "Add governance, audit, monitoring, and release controls to the recommendation.",
    ],
  },
  {
    title: "Proof of Value and Delivery Planning",
    landmark: "Pilot Delivery Hub",
    theme: "Design a small, measurable proof of value that reduces the most important uncertainties.",
    summary: "Define scope, hypotheses, evaluation, stakeholders, environments, dependencies, acceptance criteria, and transition paths.",
    explanation: "A strong pilot is not a miniature production system or a theatrical demo. It tests the assumptions that could invalidate the investment and creates credible evidence for stop, iterate, or scale decisions.",
    lessons: ["Proof-of-value design", "Evaluation and acceptance criteria", "Delivery roadmap and dependencies"],
    tasks: [
      "Write a proof-of-value charter.",
      "Define evaluation data, user scenarios, acceptance thresholds, and stop conditions.",
      "Create a phased delivery plan from discovery through production readiness.",
    ],
  },
  {
    title: "Adoption, Change, and Operating Model",
    landmark: "Adoption and Operations Center",
    theme: "Design how the solution will be adopted, governed, supported, and improved after launch.",
    summary: "Plan roles, training, workflow changes, ownership, support, service levels, feedback, monitoring, and continuous improvement.",
    explanation: "AI solutions fail when organizations treat deployment as adoption. You will identify impacted roles, design communication and enablement, define operating ownership, and create mechanisms for user feedback, incident handling, and model or workflow improvement.",
    lessons: ["Change impact and adoption", "Operating model and ownership", "Support, monitoring, and improvement"],
    tasks: [
      "Create a stakeholder and change-impact plan.",
      "Define product, business, technical, risk, and support ownership.",
      "Produce an adoption, support, and continuous-improvement roadmap.",
    ],
  },
  {
    title: "Consulting Capstone and Portfolio Evidence",
    landmark: "Client Review Board",
    theme: "Deliver and defend a complete AI solution recommendation for a realistic client problem.",
    summary: "Package discovery, opportunity analysis, solution options, architecture, value, risk, pilot, adoption, and executive recommendation.",
    explanation: "Your capstone must show consulting judgment rather than a generic technology presentation. Every recommendation should be traceable to evidence, assumptions, trade-offs, measurable outcomes, and ownership.",
    lessons: ["Consulting deliverables", "Executive storytelling", "Recommendation defense"],
    tasks: [
      "Produce a complete client-style recommendation pack.",
      "Create a concise executive presentation and technical appendix.",
      "Defend the recommendation against commercial, security, delivery, and adoption challenges.",
    ],
  },
  {
    title: "Job Search and Consulting Interviews",
    landmark: "Consulting Career Terminal",
    theme: "Target the correct role family and demonstrate structured thinking under ambiguity.",
    summary: "Search across AI consulting title variants, tailor evidence, practice cases, and communicate technical and commercial trade-offs.",
    explanation: "This role appears under consulting, solutions, advisory, presales, transformation, and architecture titles. You will compare responsibilities, tailor your portfolio, and practice discovery, recommendation, stakeholder, and case-interview scenarios.",
    lessons: ["Role-title mapping", "Consulting case interviews", "Executive and technical communication"],
    tasks: [
      "Build a target-role matrix across at least ten title variants.",
      "Tailor one consulting case study to three vacancy patterns.",
      "Complete mock interviews covering discovery, solution framing, value, risk, adoption, and stakeholder conflict.",
    ],
  },
] as const;

const roadmapContent = [
  {
    title: "Consulting and Discovery Foundations",
    goal: "Structure ambiguous business problems and gather evidence from stakeholders, workflows, data, and constraints.",
    sections: ["Consulting structure", "Stakeholder interviews", "Process mapping", "Problem framing", "Requirements", "Success criteria"],
  },
  {
    title: "AI Opportunity and Solution Assessment",
    goal: "Qualify AI opportunities and compare realistic solution patterns using value, feasibility, risk, and ownership.",
    sections: ["Use-case assessment", "AI patterns", "Data readiness", "Technical feasibility", "Build-buy-partner", "Prioritization"],
  },
  {
    title: "Architecture, Value, and Governance",
    goal: "Frame solution architecture, business value, security, responsible AI, and governance requirements.",
    sections: ["Solution options", "Architecture", "ROI", "Security", "Responsible AI", "Governance"],
  },
  {
    title: "Proof of Value and Delivery Strategy",
    goal: "Design measurable pilots and phased delivery plans that reduce uncertainty and prepare for production.",
    sections: ["PoV charter", "Evaluation", "Acceptance criteria", "Dependencies", "Roadmap", "Production readiness"],
  },
  {
    title: "Adoption and Consulting Capstone",
    goal: "Design adoption, operating ownership, support, and a complete client recommendation.",
    sections: ["Change impact", "Adoption", "Operating model", "Support", "Executive story", "Recommendation pack"],
  },
  {
    title: "Portfolio and Employment Readiness",
    goal: "Package consulting evidence and prepare for case, stakeholder, solution, and commercial interviews.",
    sections: ["Case studies", "Resume", "Role-title mapping", "Case interviews", "Executive communication", "Application pipeline"],
  },
] as const;

function mapStage(stage: CareerJourneyStage, index: number): CareerJourneyStage {
  const content = stageContent[index] ?? stageContent[stageContent.length - 1];
  return {
    ...stage,
    id: `asc-${index + 1}-${stage.id}`,
    title: content.title,
    label: content.title,
    landmark: content.landmark,
    theme: content.theme,
    summary: content.summary,
    explanation: content.explanation,
    lessons: [...content.lessons],
    tasks: content.tasks.map((description, taskIndex) => ({
      id: `asc-stage-${index + 1}-task-${taskIndex + 1}`,
      title: description,
      description,
      type: index >= 8 ? "career" : index === 6 ? "project" : "lesson",
    })),
    topicAssessments: stage.topicAssessments?.map((assessment, assessmentIndex) => ({
      ...assessment,
      id: `asc-stage-${index + 1}-topic-${assessmentIndex + 1}-assessment`,
      title: `${content.lessons[assessmentIndex % content.lessons.length]} knowledge check`,
      topicLabel: content.lessons[assessmentIndex % content.lessons.length],
    })),
    phaseExam: stage.phaseExam
      ? {
          ...stage.phaseExam,
          id: `asc-stage-${index + 1}-comprehensive-assessment`,
          title: `${content.title} comprehensive assessment`,
          description: `A 20-question scenario assessment covering ${content.lessons.join(", ")}.`,
        }
      : undefined,
  };
}

function mapRoadmap(phase: CareerRoadmapPhase, index: number): CareerRoadmapPhase {
  const content = roadmapContent[index] ?? roadmapContent[roadmapContent.length - 1];
  return {
    ...phase,
    id: `asc-roadmap-phase-${index + 1}`,
    phaseNumber: index + 1,
    title: content.title,
    goal: content.goal,
    sections: [...content.sections],
    mentorTip:
      index === 0
        ? "Do not begin with a preferred technology. Begin with evidence, outcomes, constraints, and stakeholder alignment."
        : index === 2
          ? "Make assumptions, uncertainty, risk, ownership, and total operating cost visible in every recommendation."
          : "A consulting deliverable is credible only when its recommendation is traceable to evidence and measurable outcomes.",
    practicalMissions: [
      `Create one client-ready artifact for ${content.sections[0]}.`,
      `Review a recommendation covering ${content.sections.slice(1, 4).join(", ")}.`,
    ],
    expectedOutcome: `You can apply and communicate ${content.sections.join(", ")} in a client-style engagement.`,
    quiz: {
      ...phase.quiz,
      id: `asc-roadmap-phase-${index + 1}-quiz`,
      phaseId: `asc-roadmap-phase-${index + 1}`,
      title: `${content.title} checkpoint`,
    },
    lessons: phase.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      id: `asc-roadmap-${index + 1}-lesson-${lessonIndex + 1}`,
      title: `${content.sections[lessonIndex % content.sections.length]} consulting practice`,
      summary: `Apply ${content.sections[lessonIndex % content.sections.length]} in an AI Solutions Consultant engagement.`,
      mission: `Create a client-ready artifact demonstrating ${content.sections[lessonIndex % content.sections.length]}.`,
    })),
  };
}

const base = aiProductManagerCareer;

const aiSolutionsConsultantBase: CareerWorkspaceData = {
  ...base,
  slug: "ai-solutions-consultant",
  title: "AI Solutions Consultant",
  category: "Enterprise AI & Consulting",
  visual: {
    nodeLabel: "AI Solutions Consultant",
    sceneTitle: "Enterprise AI Advisory Center",
    sceneDescription:
      "A consulting environment where client needs, AI capabilities, solution options, value, governance, delivery, and adoption are aligned into one practical recommendation.",
    imageAlt:
      "AI solutions consulting environment connecting business discovery, solution architecture, value analysis, governance, delivery planning, and adoption.",
  },
  shortDescription:
    "Translate business needs into practical, trustworthy AI solution strategies by combining discovery, use-case assessment, solution framing, value analysis, governance, delivery planning, and adoption.",
  difficulty: "Intermediate to Advanced",
  estimatedLearningTime: "7-11 months part-time",
  salary: "Varies by country, consulting seniority, industry, technical depth, and commercial responsibility",
  hiringDemand: "Strong across technology consulting, cloud providers, AI vendors, systems integrators, enterprise transformation teams, and professional services",
  remoteAvailability: "High, with client workshops and enterprise engagements often hybrid",
  aiCompatibilityScore: "97%",
  bestFor: [
    "Business technologists who can translate between stakeholders and engineering",
    "Consultants adding practical AI fluency",
    "Solution specialists moving into advisory work",
    "Product, automation, data, or operations professionals with strong communication skills",
    "Technical professionals interested in client-facing problem solving",
  ],
  programmingRequirement: "Low to Moderate: enough to understand APIs, data flows, prototypes, integration constraints, and technical trade-offs",
  mathRequirement: "Low to Moderate: business cases, scenario analysis, evaluation metrics, capacity, and risk",
  creativityLevel: "Very High",
  communicationLevel: "Very High",
  lastUpdated: "2026-08-01",
  metrics: [
    { label: "Primary outcome", value: "Practical AI recommendations", detail: "Solutions aligned to business value, technical reality, risk, ownership, and adoption." },
    { label: "Core method", value: "Discover → assess → recommend", detail: "Evidence precedes architecture, roadmap, and investment decisions." },
    { label: "Client value", value: "Decision clarity", detail: "Stakeholders understand options, trade-offs, assumptions, costs, and next steps." },
    { label: "Trust model", value: "Governed by design", detail: "Security, responsible AI, human authority, audit, and operations are included from the start." },
  ],
  overview: {
    title: "What does an AI Solutions Consultant do?",
    body:
      "An AI Solutions Consultant helps organizations decide where AI can create value and how to implement it responsibly. The role combines business discovery, use-case assessment, solution architecture framing, commercial analysis, governance, delivery planning, adoption, and executive communication.",
    responsibilities: [
      "Run stakeholder interviews and discovery workshops",
      "Frame business problems, workflows, constraints, and success measures",
      "Assess AI use cases for value, feasibility, risk, and readiness",
      "Compare solution options and build-buy-partner approaches",
      "Create high-level architectures, roadmaps, and delivery recommendations",
      "Build ROI, cost, and value-realization cases",
      "Include security, privacy, responsible AI, and governance controls",
      "Design proofs of value and measurable evaluation plans",
      "Plan adoption, operating ownership, support, and continuous improvement",
      "Communicate recommendations to executives, business owners, and technical teams",
    ],
    industries: [
      "Technology consulting",
      "Cloud and software providers",
      "Financial services",
      "Retail and supply chain",
      "Manufacturing",
      "Healthcare",
      "Public sector",
      "Professional services",
      "Enterprise shared services",
    ],
  },
  journeyMap: {
    ...base.journeyMap,
    theme: "tech-city",
    overviewTitle: "AI Solutions Consulting Journey",
    overviewDescription:
      "Progress from client discovery through opportunity assessment, solution framing, value, governance, proof of value, adoption, consulting evidence, and interview readiness.",
  },
  journeyStages: base.journeyStages.map(mapStage),
  roadmap: base.roadmap.map(mapRoadmap),
  projects: [
    {
      id: "asc-project-discovery-assessment",
      title: "AI Opportunity Discovery and Assessment",
      difficulty: "Intermediate",
      estimatedTime: "25-35 hours",
      phaseId: "asc-roadmap-phase-1",
      description:
        "Conduct a client-style discovery, map the current workflow, identify candidate use cases, and prioritize them using value, feasibility, risk, and readiness.",
      deliverables: ["Stakeholder map", "Discovery notes", "Current-state workflow", "Opportunity scorecard", "Prioritized use-case portfolio"],
      skills: ["Discovery", "Problem framing", "Use-case assessment", "Prioritization", "Facilitation"],
    },
    {
      id: "asc-project-solution-options",
      title: "AI Solution Options and Recommendation",
      difficulty: "Intermediate",
      estimatedTime: "30-45 hours",
      phaseId: "asc-roadmap-phase-3",
      description:
        "Develop and compare multiple solution approaches, including architecture, integrations, AI patterns, controls, cost, ownership, and implementation trade-offs.",
      deliverables: ["Requirements summary", "Three option papers", "Architecture diagrams", "Build-buy-partner analysis", "Recommendation memo"],
      skills: ["Solution framing", "Architecture communication", "Commercial judgment", "Trade-off analysis", "Technical fluency"],
    },
    {
      id: "asc-project-pov-plan",
      title: "Responsible AI Proof-of-Value Plan",
      difficulty: "Intermediate",
      estimatedTime: "25-40 hours",
      phaseId: "asc-roadmap-phase-4",
      description:
        "Design a proof of value with hypotheses, evaluation data, acceptance criteria, responsible-AI controls, stakeholders, dependencies, and scale decisions.",
      deliverables: ["PoV charter", "Evaluation plan", "Risk register", "Acceptance thresholds", "Delivery roadmap", "Decision framework"],
      skills: ["Pilot design", "Evaluation", "Responsible AI", "Delivery planning", "Decision governance"],
    },
    {
      id: "asc-project-capstone",
      title: "Enterprise AI Consulting Capstone",
      difficulty: "Advanced",
      estimatedTime: "60-90 hours",
      phaseId: "asc-roadmap-phase-5",
      description:
        "Deliver a complete client recommendation covering discovery, use-case assessment, solution options, architecture, value, governance, proof of value, adoption, operating model, and executive decision materials.",
      deliverables: ["Discovery pack", "Opportunity portfolio", "Solution architecture", "Business case", "Governance plan", "PoV roadmap", "Adoption plan", "Executive presentation"],
      skills: ["Consulting", "Strategy", "Solution design", "Business case", "Governance", "Adoption", "Executive communication"],
    },
  ],
  finalChallenge: {
    title: "AI Solution Executive Recommendation Review",
    description:
      "Defend a complete AI solution recommendation before a panel acting as executive sponsor, business owner, security lead, architecture lead, finance partner, and operations owner.",
    requirements: [
      "Evidence-based problem statement and stakeholder analysis",
      "Prioritized AI opportunity with documented assumptions",
      "Multiple solution options and transparent trade-offs",
      "High-level architecture, integration, data, and ownership model",
      "Business case with scenario analysis and total operating cost",
      "Responsible-AI, security, privacy, and governance controls",
      "Proof-of-value and phased delivery plan",
      "Adoption, operating model, support, and value-realization plan",
    ],
    deliverables: [
      "Client recommendation document",
      "Architecture and workflow diagrams",
      "Value and cost model",
      "Risk and governance register",
      "Proof-of-value charter",
      "Adoption and operating-model plan",
      "Ten-minute executive presentation",
      "Technical appendix and assumptions log",
    ],
    evaluation: [
      "Discovery quality",
      "Problem-solution fit",
      "Technical credibility",
      "Commercial and value judgment",
      "Security and responsible-AI quality",
      "Delivery realism",
      "Adoption and operating ownership",
      "Executive communication",
      "Handling of challenge and uncertainty",
    ],
  },
  relatedCareers: [
    "AI Product Manager",
    "AI Workflow Architect",
    "AI Integration Specialist",
    "AI Automation Specialist",
    "AI Transformation Consultant",
    "Business AI Consultant",
    "Enterprise AI Consultant",
    "AI Solution Architect",
  ],
  portfolioTasks: [
    {
      id: "asc-portfolio-discovery-case",
      title: "Publish an AI discovery and opportunity case study",
      description: "Show stakeholder evidence, workflow analysis, candidate use cases, prioritization, assumptions, and rejected options.",
      type: "portfolio",
    },
    {
      id: "asc-portfolio-recommendation",
      title: "Publish a solution recommendation pack",
      description: "Include options, architecture, value, risk, governance, roadmap, and decision rationale.",
      type: "portfolio",
    },
    {
      id: "asc-portfolio-executive-presentation",
      title: "Record an executive recommendation presentation",
      description: "Present the client problem, recommendation, trade-offs, value, risks, and next decision in under ten minutes.",
      type: "portfolio",
    },
  ],
  jobSearchTasks: [
    {
      id: "asc-job-title-matrix",
      title: "Create an AI consulting title matrix",
      description: "Track AI Solutions Consultant, Generative AI Consultant, AI Advisory Consultant, AI Solution Specialist, AI Presales Consultant, and adjacent titles.",
      type: "job-search",
    },
    {
      id: "asc-job-evidence-mapping",
      title: "Map consulting requirements to evidence",
      description: "Connect discovery, solution, value, governance, delivery, adoption, and communication requirements to specific portfolio artifacts.",
      type: "job-search",
    },
    {
      id: "asc-job-application-cycle",
      title: "Run a targeted consulting application cycle",
      description: "Submit evidence-matched applications and review interview conversion, title patterns, industry fit, and capability gaps weekly.",
      type: "job-search",
    },
  ],
  interviewPrep: {
    title: "AI Solutions Consultant Interview Preparation",
    practiceAreas: [
      "Client discovery and stakeholder interviews",
      "Problem framing and requirements",
      "AI opportunity assessment",
      "Solution options and architecture communication",
      "Build-buy-partner decisions",
      "Business cases and value realization",
      "Responsible AI, security, and governance",
      "Proof-of-value and delivery planning",
      "Adoption and operating models",
      "Executive storytelling and case interviews",
    ],
    questions: [
      "How would you respond when a client asks for generative AI before defining the business problem?",
      "Run the first ten minutes of a discovery conversation for a customer-service use case.",
      "How do you prioritize AI use cases across value, feasibility, risk, and readiness?",
      "When would you recommend rules, automation, search, predictive AI, generative AI, agents, or no AI?",
      "How would you compare build, buy, and partner options?",
      "Create a high-level solution recommendation for an AI document-processing use case.",
      "How do you include total operating cost and uncertainty in an AI business case?",
      "What would make you reject or delay an AI use case?",
      "How would you design a proof of value that avoids becoming a demo without decision value?",
      "How would you handle disagreement between an executive sponsor and the security team?",
      "What operating model is needed after an AI solution launches?",
      "Present your capstone recommendation to a non-technical executive in five minutes.",
    ],
  },
};

export const aiSolutionsConsultantCareer = applyCareerTitleAliasPolicy(
  aiSolutionsConsultantBase
);
