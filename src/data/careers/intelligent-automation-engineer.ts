import { aiAutomationSpecialistCareer } from "@/data/careers/ai-automation-specialist";
import { applyCareerTitleAliasPolicy } from "@/data/careerTitleAliases";
import type {
  CareerJourneyStage,
  CareerRoadmapPhase,
  CareerWorkspaceData,
} from "@/types/careerWorkspace";

const stageContent = [
  {
    title: "Role Orientation and Automation Systems Thinking",
    landmark: "Automation Control Room",
    theme: "Understand the role, its engineering boundaries, and the evidence employers expect.",
    summary: "Map the Intelligent Automation Engineer role across process engineering, RPA, integrations, AI, orchestration, and production operations.",
    explanation: "You begin by separating intelligent automation engineering from simple task automation. You will define target industries, platform expectations, system boundaries, and a practical evidence plan.",
    lessons: ["Role scope and target environments", "Automation opportunity assessment", "Engineering evidence plan"],
    tasks: [
      "Compare five Intelligent Automation Engineer vacancies and extract recurring responsibilities.",
      "Create a skills baseline covering process, RPA, integration, AI, testing, security, and operations.",
      "Define one operational process suitable for an end-to-end capstone.",
    ],
  },
  {
    title: "Process Discovery and Redesign",
    landmark: "Process Observatory",
    theme: "Model real work before automating it.",
    summary: "Discover current-state processes, exceptions, controls, bottlenecks, ownership, and measurable outcomes.",
    explanation: "Reliable automation starts with process evidence. You will use interviews, event data, BPMN-style mapping, process mining concepts, and future-state design to avoid automating broken work.",
    lessons: ["Process discovery", "BPMN and decision logic", "Process mining and value analysis"],
    tasks: [
      "Create current-state and future-state process maps.",
      "Document rules, exceptions, handoffs, data, controls, and owners.",
      "Build an automation opportunity score using value, feasibility, risk, and maintainability.",
    ],
  },
  {
    title: "RPA and Workflow Engineering",
    landmark: "Robot Workshop",
    theme: "Build deterministic automations that survive real operational conditions.",
    summary: "Engineer attended and unattended automations with reusable components, queues, retries, state, and safe recovery.",
    explanation: "This step covers desktop automation, selectors, UI resilience, workflow design, idempotency, transaction handling, and human escalation. The focus is not recording clicks; it is producing supportable automation.",
    lessons: ["RPA architecture", "Workflow state and queues", "Retries, idempotency, and recovery"],
    tasks: [
      "Build a transaction-based automation with a queue and retry policy.",
      "Create reusable components for login, validation, logging, and exception handling.",
      "Test UI changes, partial failures, duplicate inputs, and recovery scenarios.",
    ],
  },
  {
    title: "Enterprise Integration Engineering",
    landmark: "Integration Exchange",
    theme: "Connect systems through APIs, events, files, and governed data contracts.",
    summary: "Integrate cloud and enterprise systems using authentication, webhooks, pagination, rate limits, schemas, and reconciliation.",
    explanation: "Intelligent automation frequently spans ERP, CRM, collaboration, document, and custom systems. You will design reliable interfaces rather than hiding fragile integrations inside long workflows.",
    lessons: ["REST APIs and authentication", "Events, files, and asynchronous integration", "Data contracts and reconciliation"],
    tasks: [
      "Build an authenticated two-system synchronization.",
      "Handle pagination, rate limits, retries, and malformed responses.",
      "Produce an integration contract and reconciliation report.",
    ],
  },
  {
    title: "Document Intelligence and AI Decisions",
    landmark: "Document Intelligence Lab",
    theme: "Use AI where documents, language, and uncertainty require it.",
    summary: "Add OCR, document understanding, classification, extraction, LLM reasoning, confidence handling, and human review.",
    explanation: "You will combine deterministic workflow controls with probabilistic AI. Every AI result must have validation, evaluation, confidence policy, escalation, and traceability before it can affect business systems.",
    lessons: ["Intelligent document processing", "Structured AI outputs", "Confidence thresholds and human validation"],
    tasks: [
      "Build an invoice or request-document intake pipeline.",
      "Validate extracted fields against schemas and business rules.",
      "Route uncertain or high-impact cases to human review.",
    ],
  },
  {
    title: "Agentic Orchestration and Human-in-the-Loop",
    landmark: "Orchestration Tower",
    theme: "Coordinate tools, agents, people, and long-running business state.",
    summary: "Design controlled agentic workflows with approved tools, explicit state, permissions, approvals, and bounded autonomy.",
    explanation: "Agents should not bypass workflow engineering. You will learn where agents add value, how to constrain tool access, how to preserve auditability, and when a human must retain decision authority.",
    lessons: ["Agent and tool orchestration", "Long-running state and approvals", "Bounded autonomy and escalation"],
    tasks: [
      "Build an agent that can use only approved read and action tools.",
      "Add approval gates for consequential actions.",
      "Evaluate tool selection, task completion, unsafe actions, and escalation quality.",
    ],
  },
  {
    title: "Production Reliability, Security, and Governance",
    landmark: "Automation Operations Center",
    theme: "Operate automations as production systems.",
    summary: "Implement environments, secrets, access control, monitoring, alerts, runbooks, rollback, audit, and release governance.",
    explanation: "A production automation needs owners, service levels, observability, incident response, and controlled change. This step turns a working prototype into a system an organization can trust.",
    lessons: ["ALM and environments", "Security and governance", "Observability and incident response"],
    tasks: [
      "Create development, test, and production release controls.",
      "Define least-privilege access and secret-management requirements.",
      "Build monitoring, alerting, a runbook, and a rollback procedure.",
    ],
  },
  {
    title: "Intelligent Automation Capstone",
    landmark: "Enterprise Automation Plant",
    theme: "Deliver one complete automation system with measurable operational value.",
    summary: "Build and defend an end-to-end solution combining process redesign, RPA or workflow, integration, AI, controls, and operations.",
    explanation: "Your capstone must show the entire engineering lifecycle: discovery, architecture, delivery, testing, security, UAT, deployment, monitoring, support, and benefit measurement.",
    lessons: ["Solution architecture", "Testing and UAT", "Value realization and operational handover"],
    tasks: [
      "Deliver the end-to-end automation with representative test data.",
      "Document architecture, controls, exceptions, and operational ownership.",
      "Measure time saved, quality improvement, exception rate, and total operating cost.",
    ],
  },
  {
    title: "Portfolio and Professional Evidence",
    landmark: "Evidence Gallery",
    theme: "Translate engineering work into credible hiring evidence.",
    summary: "Package projects as concise case studies showing process, architecture, controls, results, and limitations.",
    explanation: "Hiring teams need proof that you can engineer and operate automation, not only use a platform. You will create artifacts that make your decisions and results inspectable.",
    lessons: ["Technical case studies", "Architecture communication", "Resume and profile evidence"],
    tasks: [
      "Publish three case studies covering workflow, integration, and AI-enabled automation.",
      "Create architecture and process diagrams for the capstone.",
      "Write evidence-based resume bullets without overstating production experience.",
    ],
  },
  {
    title: "Job Search and Interview Readiness",
    landmark: "Career Launch Terminal",
    theme: "Target the correct role family and defend your engineering decisions.",
    summary: "Search across title variations, tailor evidence, practice system-design scenarios, and build a repeatable application pipeline.",
    explanation: "This role appears under many names. You will search across Intelligent Automation, RPA, Hyperautomation, Workflow, Process Automation, and Automation Engineering titles while comparing actual responsibilities.",
    lessons: ["Role-title mapping", "Targeted applications", "Automation system-design interviews"],
    tasks: [
      "Build a target-role matrix across at least eight relevant title variations.",
      "Tailor one project case study to three different vacancy patterns.",
      "Complete mock interviews covering process discovery, architecture, AI boundaries, reliability, security, and ROI.",
    ],
  },
] as const;

const roadmapContent = [
  {
    title: "Process and Engineering Foundations",
    goal: "Model business processes and establish the technical foundations for automation engineering.",
    sections: ["Process discovery", "BPMN", "Requirements", "APIs", "Data", "Git and scripting"],
  },
  {
    title: "RPA, Workflow, and Integration Engineering",
    goal: "Build modular automations and dependable system integrations with explicit state and recovery.",
    sections: ["RPA", "Workflow architecture", "Queues", "Approvals", "APIs", "Reconciliation"],
  },
  {
    title: "Document Intelligence and Applied AI",
    goal: "Integrate document understanding and AI decisions with validation and human control.",
    sections: ["OCR", "IDP", "Extraction", "Classification", "LLMs", "Human review"],
  },
  {
    title: "Orchestration, Governance, and Operations",
    goal: "Operate intelligent automations securely with monitoring, ownership, and controlled releases.",
    sections: ["Orchestration", "Agents", "ALM", "Security", "Monitoring", "Runbooks"],
  },
  {
    title: "Capstone and Portfolio Evidence",
    goal: "Deliver a production-style automation and convert it into inspectable professional evidence.",
    sections: ["Architecture", "Testing", "UAT", "Deployment", "ROI", "Case studies"],
  },
  {
    title: "Employment Readiness",
    goal: "Target the right title variants and prepare for technical and business-facing interviews.",
    sections: ["Job-title mapping", "Resume", "Portfolio", "System design", "Behavioral interviews", "Application pipeline"],
  },
] as const;

function mapStage(stage: CareerJourneyStage, index: number): CareerJourneyStage {
  const content = stageContent[index] ?? stageContent[stageContent.length - 1];
  return {
    ...stage,
    id: `iae-${index + 1}-${stage.id}`,
    title: content.title,
    label: content.title,
    landmark: content.landmark,
    theme: content.theme,
    summary: content.summary,
    explanation: content.explanation,
    lessons: [...content.lessons],
    tasks: content.tasks.map((description, taskIndex) => ({
      id: `iae-stage-${index + 1}-task-${taskIndex + 1}`,
      title: description,
      description,
      type: index >= 8 ? "career" : index === 7 ? "project" : "lesson",
    })),
    topicAssessments: stage.topicAssessments?.map((assessment, assessmentIndex) => ({
      ...assessment,
      id: `iae-stage-${index + 1}-topic-${assessmentIndex + 1}-assessment`,
      title: `${content.lessons[assessmentIndex % content.lessons.length]} knowledge check`,
      topicLabel: content.lessons[assessmentIndex % content.lessons.length],
    })),
    phaseExam: stage.phaseExam
      ? {
          ...stage.phaseExam,
          id: `iae-stage-${index + 1}-comprehensive-assessment`,
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
    id: `iae-roadmap-phase-${index + 1}`,
    phaseNumber: index + 1,
    title: content.title,
    goal: content.goal,
    sections: [...content.sections],
    mentorTip:
      index === 0
        ? "Do not automate assumptions. Observe the real process and document exceptions before selecting technology."
        : index === 3
          ? "Operational ownership, access control, monitoring, and recovery are part of the architecture—not post-launch extras."
          : "Keep every technical choice traceable to a process requirement, risk, measurable outcome, and support model.",
    practicalMissions: [
      `Complete one applied mission for ${content.sections[0]}.`,
      `Produce reviewable evidence covering ${content.sections.slice(1, 4).join(", ")}.`,
    ],
    expectedOutcome: `You can demonstrate practical competence across ${content.sections.join(", ")}.`,
    quiz: {
      ...phase.quiz,
      id: `iae-roadmap-phase-${index + 1}-quiz`,
      phaseId: `iae-roadmap-phase-${index + 1}`,
      title: `${content.title} checkpoint`,
    },
    lessons: phase.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      id: `iae-roadmap-${index + 1}-lesson-${lessonIndex + 1}`,
      title: `${content.sections[lessonIndex % content.sections.length]} practice`,
      summary: `Apply ${content.sections[lessonIndex % content.sections.length]} in an Intelligent Automation Engineer scenario.`,
      mission: `Create a reviewable artifact demonstrating ${content.sections[lessonIndex % content.sections.length]}.`,
    })),
  };
}

const base = aiAutomationSpecialistCareer;

const intelligentAutomationEngineerBase: CareerWorkspaceData = {
  ...base,
  slug: "intelligent-automation-engineer",
  title: "Intelligent Automation Engineer",
  category: "AI Automation",
  visual: {
    nodeLabel: "Intelligent Automation Engineer",
    sceneTitle: "Enterprise Automation Plant",
    sceneDescription:
      "A connected environment where process models, robots, APIs, document intelligence, agents, controls, and operations work as one engineered system.",
    imageAlt:
      "Intelligent automation engineering environment connecting workflows, RPA, APIs, AI, human review, and monitoring.",
  },
  shortDescription:
    "Design, build, integrate, and operate enterprise automation systems that combine process engineering, workflow platforms, RPA, APIs, document intelligence, AI agents, and human decision controls.",
  difficulty: "Intermediate to Advanced",
  estimatedLearningTime: "8-12 months part-time",
  salary: "Varies by country, seniority, platform stack, and enterprise scope",
  hiringDemand: "Strong in enterprise operations, shared services, finance, supply chain, consulting, and digital transformation",
  remoteAvailability: "Medium to High",
  aiCompatibilityScore: "95%",
  bestFor: [
    "Process-minded engineers",
    "Automation developers moving beyond single-tool delivery",
    "RPA professionals adding APIs, AI, and production engineering",
    "Business technologists working across operations and IT",
  ],
  programmingRequirement: "Moderate: APIs, JSON, scripting, expressions, and reusable components",
  mathRequirement: "Low to Moderate: metrics, process analysis, confidence thresholds, and ROI",
  creativityLevel: "High",
  communicationLevel: "High",
  lastUpdated: "2026-08-01",
  metrics: [
    { label: "Primary outcome", value: "Reliable automation systems", detail: "Improved cycle time, quality, control, and operational capacity." },
    { label: "Core stack", value: "Process + RPA + APIs + AI", detail: "Technology is selected according to process and risk, not vendor preference." },
    { label: "Engineering focus", value: "End-to-end lifecycle", detail: "Discovery, architecture, delivery, testing, deployment, monitoring, and support." },
    { label: "Human control", value: "Designed into workflow", detail: "Approvals and review remain where uncertainty or business impact requires them." },
  ],
  overview: {
    title: "What does an Intelligent Automation Engineer do?",
    body:
      "An Intelligent Automation Engineer turns business processes into secure, observable, supportable automation systems. The role combines process analysis, workflow engineering, robotic process automation, enterprise integration, document intelligence, applied AI, orchestration, governance, and production operations.",
    responsibilities: [
      "Discover and redesign business processes before automation",
      "Select the correct mix of workflow, RPA, APIs, rules, AI, and human review",
      "Build modular and reusable automation components",
      "Integrate enterprise systems and reconcile data",
      "Implement document understanding and AI-assisted decisions safely",
      "Design queues, state, approvals, retries, and idempotency",
      "Secure credentials, data, tools, and deployment environments",
      "Test, monitor, support, and continuously improve production automations",
      "Measure operational value and communicate architecture and risk",
    ],
    industries: [
      "Financial services",
      "Insurance",
      "Retail and supply chain",
      "Manufacturing",
      "Healthcare operations",
      "Shared service centers",
      "Public sector",
      "Professional services and consulting",
    ],
  },
  journeyMap: {
    ...base.journeyMap,
    theme: "tech-city",
    overviewTitle: "Intelligent Automation Engineering Journey",
    overviewDescription:
      "Progress from process discovery through RPA, integration, document intelligence, agentic orchestration, production governance, capstone evidence, and job readiness.",
  },
  journeyStages: base.journeyStages.map(mapStage),
  roadmap: base.roadmap.map(mapRoadmap),
  projects: [
    {
      id: "iae-project-document-operations",
      title: "Intelligent Document Operations Pipeline",
      difficulty: "Intermediate",
      estimatedTime: "35-50 hours",
      phaseId: "iae-roadmap-phase-3",
      description:
        "Process inbound documents using OCR or document intelligence, schema validation, business rules, confidence thresholds, human review, and system updates.",
      deliverables: ["Process map", "Architecture diagram", "Working pipeline", "Evaluation set", "Exception dashboard", "Runbook"],
      skills: ["IDP", "AI validation", "Workflow", "Human-in-the-loop", "Observability"],
    },
    {
      id: "iae-project-enterprise-sync",
      title: "Resilient Enterprise System Synchronization",
      difficulty: "Intermediate",
      estimatedTime: "30-45 hours",
      phaseId: "iae-roadmap-phase-2",
      description:
        "Synchronize records between two systems using APIs, durable state, pagination, rate-limit handling, retries, idempotency, and reconciliation.",
      deliverables: ["Integration contract", "Working synchronization", "Failure tests", "Reconciliation report", "Security notes"],
      skills: ["APIs", "Authentication", "State", "Idempotency", "Reconciliation"],
    },
    {
      id: "iae-project-agentic-service-request",
      title: "Controlled Agentic Service-Request Orchestrator",
      difficulty: "Advanced",
      estimatedTime: "45-65 hours",
      phaseId: "iae-roadmap-phase-4",
      description:
        "Use an agent to classify requests, gather approved context, call constrained tools, request approval for consequential actions, and preserve a complete audit trail.",
      deliverables: ["Threat model", "Tool contract", "Agent evaluation", "Approval workflow", "Audit log", "Rollback plan"],
      skills: ["Agents", "Tool security", "Approvals", "Evaluation", "Governance"],
    },
    {
      id: "iae-project-capstone",
      title: "End-to-End Intelligent Automation Capstone",
      difficulty: "Advanced",
      estimatedTime: "70-100 hours",
      phaseId: "iae-roadmap-phase-5",
      description:
        "Deliver a production-style automation for a measurable operational process, including discovery, redesign, RPA or workflow, integration, AI where justified, testing, UAT, deployment, monitoring, support, and value measurement.",
      deliverables: ["Business case", "Current/future process maps", "Architecture", "Working solution", "Test and UAT evidence", "Operations pack", "Benefit report"],
      skills: ["Solution architecture", "RPA", "Integration", "AI", "Testing", "Operations", "ROI"],
    },
  ],
  finalChallenge: {
    title: "Intelligent Automation Production Readiness Review",
    description:
      "Defend an end-to-end automation before a review panel acting as process owner, security lead, operations lead, and solution architect.",
    requirements: [
      "Validated current-state and future-state process",
      "Justified technology-selection decisions",
      "Secure integration and access model",
      "Representative normal, exception, retry, and recovery tests",
      "AI evaluation and human-review policy where AI is used",
      "Monitoring, incident response, rollback, and ownership",
      "Measured or defensible value model",
    ],
    deliverables: [
      "Architecture and process diagrams",
      "Working demonstration",
      "Test and evaluation report",
      "Security and governance checklist",
      "Operations runbook",
      "Value-realization report",
      "Ten-minute technical and business defense",
    ],
    evaluation: [
      "Process understanding",
      "Architecture quality",
      "Reliability and recovery",
      "Security and governance",
      "Appropriate AI boundaries",
      "Operational supportability",
      "Measured business value",
      "Communication and judgment",
    ],
  },
  relatedCareers: [
    "AI Automation Specialist",
    "RPA Developer",
    "Automation Solution Architect",
    "Process Automation Engineer",
    "AI Integration Specialist",
    "Business Process Analyst",
  ],
  portfolioTasks: [
    {
      id: "iae-portfolio-process-case-study",
      title: "Publish a process-redesign case study",
      description: "Show the original process, exceptions, future state, architecture, controls, and measurable outcome.",
      type: "portfolio",
    },
    {
      id: "iae-portfolio-operations-pack",
      title: "Publish an automation operations pack",
      description: "Include monitoring, alerts, ownership, runbook, incident response, and rollback evidence.",
      type: "portfolio",
    },
    {
      id: "iae-portfolio-demo",
      title: "Record a complete capstone walkthrough",
      description: "Explain process evidence, architecture, failure handling, AI boundaries, results, and limitations.",
      type: "portfolio",
    },
  ],
  jobSearchTasks: [
    {
      id: "iae-job-title-matrix",
      title: "Create an Intelligent Automation title matrix",
      description: "Track Intelligent Automation Engineer, RPA Engineer, Hyperautomation Engineer, Process Automation Engineer, Automation Developer, and related titles.",
      type: "job-search",
    },
    {
      id: "iae-job-evidence-match",
      title: "Match vacancy requirements to portfolio evidence",
      description: "Map process, platform, integration, AI, testing, security, and operations requirements to specific artifacts.",
      type: "job-search",
    },
    {
      id: "iae-job-targeted-applications",
      title: "Run a targeted application cycle",
      description: "Submit evidence-matched applications and review response patterns every week.",
      type: "job-search",
    },
  ],
  interviewPrep: {
    title: "Intelligent Automation Engineer Interview Preparation",
    practiceAreas: [
      "Process discovery and redesign",
      "RPA and workflow architecture",
      "API and enterprise integration",
      "Document intelligence and AI decisions",
      "Queues, state, retries, and idempotency",
      "Agent security and human approval",
      "Testing, observability, and operations",
      "Governance, CoE, and release management",
      "ROI and stakeholder communication",
    ],
    questions: [
      "How do you decide between API integration, workflow automation, RPA, AI, or process redesign?",
      "Design an invoice-processing system with extraction, validation, approvals, ERP updates, and exception handling.",
      "How would you make a desktop automation resilient to UI changes?",
      "Explain your approach to queues, retries, idempotency, and partial failure.",
      "When should an AI decision be routed to a human reviewer?",
      "How would you secure an agent that can call enterprise tools?",
      "What should be monitored in a production automation platform?",
      "How would you structure development, test, and production environments?",
      "How do you measure realized value after deployment?",
      "Describe an automation you would reject and why.",
      "How would you investigate a process whose users bypass the automation?",
      "Walk through your capstone from process evidence to operational handover.",
    ],
  },
};

export const intelligentAutomationEngineerCareer = applyCareerTitleAliasPolicy(
  intelligentAutomationEngineerBase
);
