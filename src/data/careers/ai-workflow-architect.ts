import { intelligentAutomationEngineerCareer } from "@/data/careers/intelligent-automation-engineer";
import { applyCareerTitleAliasPolicy } from "@/data/careerTitleAliases";
import type {
  CareerJourneyStage,
  CareerRoadmapPhase,
  CareerWorkspaceData,
} from "@/types/careerWorkspace";

const stageContent = [
  {
    title: "Role Orientation and Workflow Architecture Thinking",
    landmark: "Architecture Observatory",
    theme: "Understand the role, its boundaries, and the evidence expected from an AI Workflow Architect.",
    summary: "Map the role across process architecture, AI orchestration, integration, controls, operating models, and measurable outcomes.",
    explanation: "You begin by distinguishing workflow architecture from workflow building. The architect defines system boundaries, decision ownership, handoffs, data movement, failure behavior, human control, and the operating model before implementation begins.",
    lessons: ["Role scope and architecture responsibilities", "Workflow opportunity framing", "Architecture evidence plan"],
    tasks: [
      "Compare five AI Workflow Architect or adjacent vacancies and extract recurring architecture responsibilities.",
      "Create a capability baseline covering process, integration, AI, security, reliability, and stakeholder communication.",
      "Select one cross-functional business workflow for an end-to-end architecture capstone.",
    ],
  },
  {
    title: "Workflow Discovery and Domain Modeling",
    landmark: "Workflow Mapping Chamber",
    theme: "Model business intent, actors, state, decisions, and exceptions before selecting technology.",
    summary: "Translate real work into a domain model with events, decisions, ownership, data, constraints, and measurable outcomes.",
    explanation: "A credible architecture begins with an accurate model of the business system. You will map current and future states, identify bounded contexts, distinguish deterministic rules from judgment, and expose exception paths that must remain visible.",
    lessons: ["Workflow discovery", "Domain and event modeling", "Decision and exception architecture"],
    tasks: [
      "Create current-state and future-state workflow maps.",
      "Document actors, events, state transitions, decisions, exceptions, and owners.",
      "Build a workflow architecture brief with measurable acceptance criteria.",
    ],
  },
  {
    title: "Human-AI Workflow Design",
    landmark: "Collaboration Design Studio",
    theme: "Allocate work deliberately between people, deterministic systems, models, and agents.",
    summary: "Design human-AI collaboration patterns with clear authority, review, escalation, and accountability.",
    explanation: "You will decide which tasks belong to rules, APIs, models, agents, or people. The architecture must preserve human authority where impact, uncertainty, regulation, or organizational judgment requires it.",
    lessons: ["Task allocation and AI boundaries", "Human-in-the-loop patterns", "Approval, escalation, and accountability"],
    tasks: [
      "Create a task-allocation matrix for a complex business workflow.",
      "Define confidence and impact thresholds for human review.",
      "Design escalation and override paths for disputed or unsafe outcomes.",
    ],
  },
  {
    title: "Orchestration, State, and Long-Running Workflows",
    landmark: "Orchestration Core",
    theme: "Coordinate services, agents, people, and durable state across long-running processes.",
    summary: "Architect workflow state, events, queues, retries, compensation, timeouts, and resumable execution.",
    explanation: "Long-running AI workflows fail when state and side effects are implicit. You will design durable orchestration, idempotency, correlation, retry policies, compensating actions, and clear ownership for stalled or partially completed work.",
    lessons: ["Durable workflow state", "Events, queues, and correlation", "Retries, compensation, and recovery"],
    tasks: [
      "Design a state machine for a multi-day business workflow.",
      "Define idempotency, retry, timeout, and compensation policies.",
      "Create recovery scenarios for partial failure and duplicate events.",
    ],
  },
  {
    title: "AI Agents, Tools, and Decision Services",
    landmark: "Agent Coordination Lab",
    theme: "Use agents and models as governed components inside explicit workflows.",
    summary: "Design bounded agents, tool contracts, decision services, retrieval, evaluation, and safe fallback behavior.",
    explanation: "Agents should not replace architecture. You will define approved tools, permissions, context boundaries, schemas, evaluation criteria, memory policy, and fallback routes before an agent can participate in a business workflow.",
    lessons: ["Agent and tool architecture", "Decision services and structured outputs", "Evaluation, fallback, and bounded autonomy"],
    tasks: [
      "Define a tool contract and permission model for an agent.",
      "Create an evaluation set for tool selection and decision quality.",
      "Design safe fallback behavior for uncertainty, unavailable tools, and policy violations.",
    ],
  },
  {
    title: "Integration and Workflow Platform Architecture",
    landmark: "Enterprise Integration Grid",
    theme: "Connect enterprise systems through explicit contracts and supportable platform boundaries.",
    summary: "Architect APIs, events, connectors, files, identity, data contracts, and platform responsibilities.",
    explanation: "AI workflows frequently span CRM, ERP, collaboration, document, analytics, and custom systems. You will separate orchestration from integration logic, define system-of-record boundaries, and prevent vendor-specific implementation details from becoming the architecture.",
    lessons: ["Integration boundaries and contracts", "Identity and access across workflows", "Platform selection and portability"],
    tasks: [
      "Create an integration context diagram and data-flow model.",
      "Define source-of-truth, authentication, rate-limit, and reconciliation rules.",
      "Write a platform decision record comparing at least two implementation approaches.",
    ],
  },
  {
    title: "Security, Governance, and Responsible AI Controls",
    landmark: "Governance Gate",
    theme: "Build policy, security, privacy, audit, and responsible-AI controls into the workflow design.",
    summary: "Architect least privilege, data boundaries, approval policy, auditability, model controls, and release governance.",
    explanation: "Security and governance cannot be added after the workflow is built. You will define trust boundaries, data classification, role-based access, tool restrictions, audit requirements, retention, model-risk controls, and approval authority as first-class architecture elements.",
    lessons: ["Threat modeling and trust boundaries", "Responsible AI workflow controls", "Audit, policy, and release governance"],
    tasks: [
      "Create a threat model for the capstone workflow.",
      "Define access, data handling, audit, and retention requirements.",
      "Create release gates for security, AI quality, and operational readiness.",
    ],
  },
  {
    title: "Observability, Reliability, and Workflow Operations",
    landmark: "Workflow Operations Center",
    theme: "Operate workflows as measurable production systems with clear ownership and recovery.",
    summary: "Design telemetry, service levels, alerts, runbooks, incident response, rollback, and continuous improvement.",
    explanation: "A workflow architecture is incomplete until failures can be detected, explained, contained, and recovered. You will define business and technical telemetry, trace correlation, service-level objectives, error budgets, incident ownership, and learning loops.",
    lessons: ["Workflow observability", "Reliability and service levels", "Incident response and continuous improvement"],
    tasks: [
      "Define business, workflow, model, and integration telemetry.",
      "Create service-level objectives and alert thresholds.",
      "Write an incident runbook covering containment, recovery, communication, and review.",
    ],
  },
  {
    title: "Architecture Capstone and Portfolio Evidence",
    landmark: "Architecture Review Forum",
    theme: "Produce and defend a complete AI workflow architecture with measurable business value.",
    summary: "Deliver architecture artifacts, prototypes, controls, evaluations, operations design, and decision records.",
    explanation: "Your capstone must show the full architecture lifecycle: discovery, domain model, task allocation, orchestration, integrations, AI boundaries, security, observability, operating model, and value measurement.",
    lessons: ["Architecture documentation", "Prototype and validation strategy", "Architecture review and business case"],
    tasks: [
      "Produce the complete architecture pack and bounded prototype.",
      "Run a review against normal, exception, security, and recovery scenarios.",
      "Defend the architecture to business, security, engineering, and operations stakeholders.",
    ],
  },
  {
    title: "Career Positioning and Architecture Interviews",
    landmark: "Architecture Career Terminal",
    theme: "Target the correct role family and communicate architecture decisions with evidence.",
    summary: "Search across workflow, automation, agentic, solution, and enterprise architecture titles and prepare for architecture interviews.",
    explanation: "This role may appear under several names. You will compare responsibilities rather than titles, tailor architecture evidence, practice whiteboard scenarios, and explain trade-offs without hiding uncertainty.",
    lessons: ["Role-title mapping", "Architecture portfolio positioning", "Workflow and system-design interviews"],
    tasks: [
      "Build a target-role matrix across at least ten title variations.",
      "Tailor the capstone architecture narrative to three vacancy patterns.",
      "Complete mock interviews covering workflow design, AI boundaries, reliability, governance, and operating model.",
    ],
  },
] as const;

const roadmapContent = [
  {
    title: "Workflow and Domain Foundations",
    goal: "Model business workflows, actors, state, decisions, exceptions, and measurable outcomes.",
    sections: ["Workflow discovery", "Domain modeling", "Events", "State", "Decisions", "Exceptions"],
  },
  {
    title: "Human-AI Collaboration Architecture",
    goal: "Allocate work between people, rules, models, agents, and systems with explicit authority and handoffs.",
    sections: ["Task allocation", "AI boundaries", "Human review", "Approvals", "Escalation", "Accountability"],
  },
  {
    title: "Orchestration and Integration Architecture",
    goal: "Design durable workflows and dependable enterprise integrations with clear contracts and recovery.",
    sections: ["Orchestration", "State machines", "Queues", "APIs", "Events", "Reconciliation"],
  },
  {
    title: "Agentic Systems and Governance",
    goal: "Architect bounded agents, tool use, evaluation, security, responsible-AI controls, and release governance.",
    sections: ["Agents", "Tools", "Evaluation", "Security", "Responsible AI", "Governance"],
  },
  {
    title: "Operations and Architecture Capstone",
    goal: "Design observability, reliability, operating ownership, and a production-ready architecture capstone.",
    sections: ["Observability", "SLOs", "Runbooks", "Operating model", "Architecture pack", "Business case"],
  },
  {
    title: "Portfolio and Employment Readiness",
    goal: "Package architecture evidence and prepare for workflow, automation, agentic, and solution-architecture roles.",
    sections: ["Case studies", "Decision records", "Resume", "Role-title mapping", "System design", "Interview defense"],
  },
] as const;

function mapStage(stage: CareerJourneyStage, index: number): CareerJourneyStage {
  const content = stageContent[index] ?? stageContent[stageContent.length - 1];
  return {
    ...stage,
    id: `awa-${index + 1}-${stage.id}`,
    title: content.title,
    label: content.title,
    landmark: content.landmark,
    theme: content.theme,
    summary: content.summary,
    explanation: content.explanation,
    lessons: [...content.lessons],
    tasks: content.tasks.map((description, taskIndex) => ({
      id: `awa-stage-${index + 1}-task-${taskIndex + 1}`,
      title: description,
      description,
      type: index >= 8 ? "career" : index === 8 ? "portfolio" : "lesson",
    })),
    topicAssessments: stage.topicAssessments?.map((assessment, assessmentIndex) => ({
      ...assessment,
      id: `awa-stage-${index + 1}-topic-${assessmentIndex + 1}-assessment`,
      title: `${content.lessons[assessmentIndex % content.lessons.length]} knowledge check`,
      topicLabel: content.lessons[assessmentIndex % content.lessons.length],
    })),
    phaseExam: stage.phaseExam
      ? {
          ...stage.phaseExam,
          id: `awa-stage-${index + 1}-comprehensive-assessment`,
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
    id: `awa-roadmap-phase-${index + 1}`,
    phaseNumber: index + 1,
    title: content.title,
    goal: content.goal,
    sections: [...content.sections],
    mentorTip:
      index === 0
        ? "Do not begin with a tool. Begin with actors, state, decisions, constraints, and measurable outcomes."
        : index === 3
          ? "Agent autonomy must be bounded by tool contracts, access policy, evaluation evidence, and safe escalation."
          : "Keep every architecture decision traceable to business intent, failure cost, ownership, and operational evidence.",
    practicalMissions: [
      `Create one reviewable architecture artifact for ${content.sections[0]}.`,
      `Validate a design decision covering ${content.sections.slice(1, 4).join(", ")}.`,
    ],
    expectedOutcome: `You can design and defend solutions across ${content.sections.join(", ")}.`,
    quiz: {
      ...phase.quiz,
      id: `awa-roadmap-phase-${index + 1}-quiz`,
      phaseId: `awa-roadmap-phase-${index + 1}`,
      title: `${content.title} checkpoint`,
    },
    lessons: phase.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      id: `awa-roadmap-${index + 1}-lesson-${lessonIndex + 1}`,
      title: `${content.sections[lessonIndex % content.sections.length]} architecture practice`,
      summary: `Apply ${content.sections[lessonIndex % content.sections.length]} in an AI Workflow Architect scenario.`,
      mission: `Create and review an architecture artifact demonstrating ${content.sections[lessonIndex % content.sections.length]}.`,
    })),
  };
}

const base = intelligentAutomationEngineerCareer;

const aiWorkflowArchitectBase: CareerWorkspaceData = {
  ...base,
  slug: "ai-workflow-architect",
  title: "AI Workflow Architect",
  category: "AI Automation",
  visual: {
    nodeLabel: "AI Workflow Architect",
    sceneTitle: "Human-AI Orchestration City",
    sceneDescription:
      "A coordinated environment where people, AI agents, services, business systems, controls, and durable workflow state operate as one governed architecture.",
    imageAlt:
      "AI workflow architecture connecting people, agents, tools, enterprise systems, approvals, state, governance, and monitoring.",
  },
  shortDescription:
    "Design scalable, governed human-and-AI workflows that coordinate people, agents, models, tools, APIs, enterprise systems, decisions, and operational controls.",
  difficulty: "Advanced",
  estimatedLearningTime: "9-14 months part-time",
  salary: "Varies by country, architecture seniority, enterprise scope, and platform ecosystem",
  hiringDemand: "Emerging and growing across enterprise AI, automation, consulting, digital operations, and agentic-system programs",
  remoteAvailability: "High for design and consulting work; hybrid for enterprise delivery and stakeholder discovery",
  aiCompatibilityScore: "98%",
  bestFor: [
    "Automation engineers moving into architecture",
    "Solution architects adding AI and agentic workflows",
    "Business technologists who can bridge operations and engineering",
    "Integration professionals designing cross-system processes",
    "AI practitioners focused on enterprise workflow adoption",
  ],
  programmingRequirement: "Moderate: APIs, schemas, events, state, integration patterns, and prototype-level scripting",
  mathRequirement: "Low to Moderate: evaluation metrics, reliability, confidence thresholds, capacity, and value modeling",
  creativityLevel: "Very High",
  communicationLevel: "Very High",
  lastUpdated: "2026-08-01",
  metrics: [
    { label: "Primary outcome", value: "Governed human-AI workflows", detail: "Reliable coordination across people, agents, tools, decisions, and systems." },
    { label: "Architecture focus", value: "State + handoffs + controls", detail: "The workflow remains explicit, auditable, recoverable, and owned." },
    { label: "AI boundary", value: "Bounded autonomy", detail: "Agents and models operate through constrained tools, evaluation, approval, and fallback." },
    { label: "Operating model", value: "Designed before release", detail: "Ownership, observability, support, security, and improvement are part of the architecture." },
  ],
  overview: {
    title: "What does an AI Workflow Architect do?",
    body:
      "An AI Workflow Architect designs how people, deterministic systems, AI models, agents, tools, and enterprise platforms collaborate to complete business work. The role defines workflow state, decisions, handoffs, integration contracts, AI boundaries, human authority, security, observability, recovery, ownership, and measurable outcomes before implementation teams build the solution.",
    responsibilities: [
      "Discover and model cross-functional business workflows",
      "Allocate tasks between people, rules, models, agents, and systems",
      "Design durable orchestration, state, queues, events, retries, and compensation",
      "Define human review, approval, escalation, and override patterns",
      "Specify agent tools, permissions, context, memory, schemas, and evaluation",
      "Architect APIs, events, connectors, identity, and data contracts",
      "Create threat models, trust boundaries, audit, and responsible-AI controls",
      "Define observability, service levels, incident response, and rollback",
      "Write architecture decision records and platform-selection rationale",
      "Align business, engineering, security, operations, and governance stakeholders",
      "Measure workflow outcomes, reliability, adoption, and business value",
    ],
    industries: [
      "Financial services",
      "Insurance",
      "Retail and supply chain",
      "Manufacturing",
      "Healthcare operations",
      "Shared services",
      "Enterprise software",
      "Professional services and consulting",
      "Public sector",
      "Telecommunications",
    ],
  },
  journeyMap: {
    ...base.journeyMap,
    theme: "future-space-colony",
    overviewTitle: "AI Workflow Architecture Journey",
    overviewDescription:
      "Progress from workflow discovery and domain modeling through human-AI collaboration, durable orchestration, agentic systems, integration, governance, operations, architecture evidence, and job readiness.",
  },
  journeyStages: base.journeyStages.map(mapStage),
  roadmap: base.roadmap.map(mapRoadmap),
  projects: [
    {
      id: "awa-project-human-ai-case-management",
      title: "Human-AI Case Management Architecture",
      difficulty: "Advanced",
      estimatedTime: "40-60 hours",
      phaseId: "awa-roadmap-phase-2",
      description:
        "Design a case-management workflow that allocates work between rules, AI services, agents, specialists, and approvers while preserving state, accountability, and safe escalation.",
      deliverables: ["Current/future workflow", "Task-allocation matrix", "State model", "Approval policy", "AI boundary specification", "Architecture review"],
      skills: ["Human-AI design", "Workflow state", "Approvals", "Escalation", "Architecture communication"],
    },
    {
      id: "awa-project-durable-agent-orchestration",
      title: "Durable Agentic Workflow Architecture",
      difficulty: "Advanced",
      estimatedTime: "50-75 hours",
      phaseId: "awa-roadmap-phase-3",
      description:
        "Architect a long-running agentic workflow with constrained tools, durable state, events, retries, compensation, human approval, and complete traceability.",
      deliverables: ["Sequence and state diagrams", "Tool contracts", "Permission model", "Retry and compensation policy", "Evaluation plan", "Recovery runbook"],
      skills: ["Agent orchestration", "State machines", "Tool security", "Evaluation", "Recovery"],
    },
    {
      id: "awa-project-enterprise-workflow-platform",
      title: "Enterprise Workflow Platform Decision",
      difficulty: "Advanced",
      estimatedTime: "35-50 hours",
      phaseId: "awa-roadmap-phase-4",
      description:
        "Compare and select an implementation architecture across workflow, integration, low-code, agent, and cloud-service options for a defined enterprise scenario.",
      deliverables: ["Requirements matrix", "Option comparison", "Architecture decision records", "Risk analysis", "Operating model", "Migration plan"],
      skills: ["Platform architecture", "Trade-off analysis", "Integration", "Governance", "Stakeholder alignment"],
    },
    {
      id: "awa-project-capstone",
      title: "Production-Ready AI Workflow Architecture Capstone",
      difficulty: "Advanced",
      estimatedTime: "80-120 hours",
      phaseId: "awa-roadmap-phase-5",
      description:
        "Deliver and defend a complete architecture for a measurable cross-functional workflow, including discovery, domain model, orchestration, integrations, agents or AI services, human controls, security, observability, operations, and value realization.",
      deliverables: ["Business architecture brief", "Workflow and state models", "System context and sequence diagrams", "AI and tool contracts", "Threat model", "Observability design", "Operating model", "Prototype", "Review defense"],
      skills: ["Workflow architecture", "Human-AI collaboration", "Orchestration", "Integration", "Security", "Observability", "Operating model"],
    },
  ],
  finalChallenge: {
    title: "AI Workflow Architecture Review Board",
    description:
      "Defend a complete AI workflow architecture before a review board representing business ownership, enterprise architecture, security, responsible AI, engineering, and operations.",
    requirements: [
      "Validated business workflow and measurable outcome",
      "Explicit domain, event, state, decision, and exception model",
      "Justified human, rule, model, agent, and system task allocation",
      "Durable orchestration and recovery design",
      "Secure integration, identity, and data boundaries",
      "Agent tool, permission, evaluation, and fallback contracts",
      "Human review, approval, escalation, and override policy",
      "Observability, service levels, incident response, and ownership",
      "Architecture decision records and platform rationale",
      "Value, adoption, and continuous-improvement model",
    ],
    deliverables: [
      "Business and workflow architecture brief",
      "Context, workflow, state, and sequence diagrams",
      "Decision and tool contracts",
      "Threat model and governance checklist",
      "Evaluation and test strategy",
      "Observability and operations design",
      "Bounded prototype or simulation",
      "Architecture decision records",
      "Fifteen-minute architecture defense",
    ],
    evaluation: [
      "Business and domain understanding",
      "Workflow clarity and state design",
      "Human-AI allocation quality",
      "Agent and integration boundaries",
      "Reliability and recovery",
      "Security and responsible AI",
      "Observability and operating model",
      "Trade-off reasoning",
      "Measurable value",
      "Communication and stakeholder alignment",
    ],
  },
  relatedCareers: [
    "Intelligent Automation Engineer",
    "AI Automation Specialist",
    "AI Integration Specialist",
    "Automation Solution Architect",
    "Agentic Systems Architect",
    "Enterprise Solution Architect",
    "Business Process Architect",
  ],
  portfolioTasks: [
    {
      id: "awa-portfolio-workflow-case-study",
      title: "Publish a human-AI workflow architecture case study",
      description: "Show workflow discovery, task allocation, state, decisions, exceptions, controls, outcomes, and trade-offs.",
      type: "portfolio",
    },
    {
      id: "awa-portfolio-architecture-pack",
      title: "Publish a complete architecture pack",
      description: "Include context, workflow, state, sequence, integration, security, observability, and operating-model artifacts.",
      type: "portfolio",
    },
    {
      id: "awa-portfolio-decision-records",
      title: "Publish architecture decision records",
      description: "Document rejected alternatives, selected patterns, constraints, risks, and evidence.",
      type: "portfolio",
    },
    {
      id: "awa-portfolio-review-video",
      title: "Record an architecture review defense",
      description: "Explain the business outcome, design, AI boundaries, failure handling, governance, and operational ownership.",
      type: "portfolio",
    },
  ],
  jobSearchTasks: [
    {
      id: "awa-job-title-matrix",
      title: "Create an AI Workflow Architecture title matrix",
      description: "Track AI Workflow Architect, Automation Architect, Agentic Workflow Architect, AI Orchestration Architect, Solution Architect, and related titles.",
      type: "job-search",
    },
    {
      id: "awa-job-responsibility-clusters",
      title: "Cluster vacancies by actual architecture responsibility",
      description: "Separate workflow architecture, automation architecture, agentic systems, integration architecture, and consulting roles by real scope.",
      type: "job-search",
    },
    {
      id: "awa-job-evidence-match",
      title: "Match architecture requirements to evidence",
      description: "Map discovery, modeling, orchestration, integration, AI, governance, operations, and stakeholder requirements to portfolio artifacts.",
      type: "job-search",
    },
    {
      id: "awa-job-targeted-cycle",
      title: "Run a targeted architecture application cycle",
      description: "Submit evidence-matched applications and review response patterns, title fit, and recurring gaps each week.",
      type: "job-search",
    },
  ],
  interviewPrep: {
    title: "AI Workflow Architect Interview Preparation",
    practiceAreas: [
      "Workflow discovery and domain modeling",
      "Human-AI task allocation",
      "Durable orchestration and state",
      "Agent and tool architecture",
      "Enterprise integration and identity",
      "Security and responsible-AI controls",
      "Observability, reliability, and operations",
      "Platform and pattern selection",
      "Architecture governance and decision records",
      "Stakeholder facilitation and business value",
    ],
    questions: [
      "How would you decide which parts of a workflow belong to people, rules, models, agents, or enterprise systems?",
      "Design a long-running customer case workflow that spans AI triage, specialist review, approvals, and system updates.",
      "How would you model state, correlation, retries, compensation, and duplicate events?",
      "When should an agent be a workflow participant rather than the workflow controller?",
      "How would you constrain tools and permissions for an agent performing consequential actions?",
      "How would you design human review without creating an unmanageable operational bottleneck?",
      "Explain your approach to workflow observability across business outcomes, models, agents, integrations, and human queues.",
      "How would you compare a low-code workflow platform, custom orchestration service, and agent framework?",
      "What architecture controls are required before an AI workflow can enter production?",
      "How would you recover a workflow after a partial failure that already changed one external system?",
      "How do you document and govern architecture decisions across multiple delivery teams?",
      "Describe a workflow you would simplify or reject rather than automate with AI.",
      "How would you measure whether the architecture improved the business process after launch?",
      "Walk through your capstone from discovery to operating ownership.",
    ],
  },
};

export const aiWorkflowArchitectCareer = applyCareerTitleAliasPolicy(
  aiWorkflowArchitectBase
);
