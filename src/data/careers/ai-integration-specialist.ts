import { aiProductManagerCareer as workspaceLayout } from "@/data/careers/ai-product-manager";
import { applyCareerTitleAliasPolicy } from "@/data/careerTitleAliases";
import type {
  CareerAssessment,
  CareerJourneyStage,
  CareerQuizQuestion,
  CareerRoadmapPhase,
  CareerWorkspaceData,
  WorkspaceDifficulty,
} from "@/types/careerWorkspace";

const slug = "ai-integration-specialist";

type StageSpec = {
  title: string;
  landmark: string;
  type: CareerJourneyStage["type"];
  summary: string;
  explanation: string;
  lessons: [string, string, string];
  tasks: [string, string, string];
  topics: [string, string, string];
  minMinutes: number;
  maxMinutes: number;
};

function question(id: string, topic: string, index: number): CareerQuizQuestion {
  const prompts = [
    `Which evidence best demonstrates professional capability in ${topic}?`,
    `What is the strongest first step when an integration involving ${topic} fails in production?`,
    `Which design principle should guide ${topic}?`,
    `Why must ${topic} include explicit operational ownership?`,
    `Which validation approach is most credible for ${topic}?`,
  ];
  return {
    id,
    question: prompts[index % prompts.length],
    answers: [
      "A copied diagram without context",
      "Traceable requirements, design decisions, implementation evidence, representative tests, and named ownership",
      "A vendor feature list",
      "An unexplained screenshot",
    ],
    correctAnswerIndex: 1,
    explanation: "Production integration evidence must connect requirements, contracts, implementation, validation, failure handling, and ownership.",
    difficulty: index > 6 ? "Advanced" : "Intermediate",
    relatedTopic: topic,
    questionType: index % 3 === 1 ? "scenario" : "multiple-choice",
    status: "active",
    lastReviewedAt: "2026-08-03",
    version: 1,
  };
}

function assessment(stage: number, title: string, topics: [string, string, string]): CareerAssessment {
  const questions = Array.from({ length: 10 }, (_, index) =>
    question(`ai-integration-s${stage}-q${index + 1}`, topics[index % topics.length], index),
  );
  return {
    id: `ai-integration-specialist-stage-${stage}-comprehensive-assessment`,
    title: `${title} comprehensive assessment`,
    description: "A scenario-based checkpoint covering integration design, security, reliability, validation, and operational judgment.",
    passingScore: 70,
    assessmentType: "comprehensive",
    durationMinutes: 25,
    questionsPerAttempt: 10,
    questions,
  };
}

const stages: StageSpec[] = [
  {
    title: "AI Integration Orientation and Role Boundaries",
    landmark: "Enterprise Integration Observatory",
    type: "orientation",
    summary: "Understand the role, adjacent professions, employer expectations, integration landscape, and evidence standards.",
    explanation: "Define what an AI Integration Specialist owns across discovery, interfaces, identity, data, AI services, workflows, validation, and operations without collapsing the role into AI engineering or automation alone.",
    lessons: ["Role boundaries and collaboration", "Enterprise AI integration landscape", "Job evidence and portfolio planning"],
    tasks: ["Build a role responsibility matrix.", "Map a representative enterprise AI ecosystem.", "Create a vacancy-to-evidence backlog."],
    topics: ["role boundaries", "enterprise integration landscape", "professional evidence"],
    minMinutes: 360,
    maxMinutes: 600,
  },
  {
    title: "Integration Discovery and Architecture Decisions",
    landmark: "Systems Boundary and Pattern Studio",
    type: "foundation",
    summary: "Convert workflows and constraints into traceable system boundaries, interface contracts, and integration-pattern decisions.",
    explanation: "Integration quality begins before implementation. Capture functional and non-functional requirements, ownership, trust boundaries, dependencies, acceptance criteria, and failure behavior.",
    lessons: ["Requirements and constraints", "System boundaries and ownership", "Synchronous, asynchronous, event, batch, and human patterns"],
    tasks: ["Create an integration requirements brief.", "Produce a system and interface map.", "Write architecture decision records for competing patterns."],
    topics: ["requirements discovery", "system boundaries", "integration patterns"],
    minMinutes: 540,
    maxMinutes: 900,
  },
  {
    title: "APIs, Identity, and Secure Connectivity",
    landmark: "API and Identity Gateway",
    type: "core-skills",
    summary: "Design production APIs, authentication, authorization, resilient clients, gateways, quotas, and secure service connectivity.",
    explanation: "Build stable interfaces and secure access for users, services, and background processes. Treat timeouts, retries, rate limits, idempotency, versioning, and credential lifecycle as first-class design concerns.",
    lessons: ["API contracts and lifecycle", "OAuth, OIDC, service identity, scopes, and secrets", "Retries, backoff, rate limits, circuit breakers, and gateways"],
    tasks: ["Design an OpenAPI contract.", "Create an identity and scope model.", "Specify a resilient external-API client and gateway policy."],
    topics: ["API contracts", "authentication and authorization", "API resilience"],
    minMinutes: 720,
    maxMinutes: 1200,
  },
  {
    title: "Data Contracts, Context, and Privacy",
    landmark: "Data Exchange and Knowledge Control Center",
    type: "core-skills",
    summary: "Move governed data and context across systems using explicit schemas, transformations, retrieval, permissions, privacy, and lifecycle controls.",
    explanation: "AI integrations depend on trustworthy data flows. Define source-to-target contracts, context pipelines, provenance, permissions, freshness, classification, minimization, retention, and auditability.",
    lessons: ["Schemas, mapping, validation, and evolution", "Search, retrieval, documents, vectors, metadata, and permissions", "Privacy, sensitive data, retention, residency, and audit"],
    tasks: ["Build a data contract and mapping specification.", "Design a governed AI context pipeline.", "Produce a privacy and data-flow assessment."],
    topics: ["data contracts", "AI context and retrieval", "privacy and governance"],
    minMinutes: 720,
    maxMinutes: 1260,
  },
  {
    title: "AI Services, Structured Outputs, and Safety Controls",
    landmark: "AI Service Integration Foundry",
    type: "tools",
    summary: "Integrate model and multimodal services through stable adapters, structured outputs, tool contracts, validation, guardrails, fallbacks, and human oversight.",
    explanation: "AI APIs introduce probabilistic behavior and new attack surfaces. Separate provider-specific configuration from application contracts and make validation, fallback, confidence, safety, and escalation explicit.",
    lessons: ["Model, embedding, speech, vision, and document services", "Prompts, structured outputs, tools, and schemas", "Hallucination, prompt injection, fallbacks, and human review"],
    tasks: ["Design a provider-neutral AI adapter.", "Create a structured-output and tool contract.", "Build an AI failure-control matrix."],
    topics: ["AI service integration", "structured outputs and tools", "AI failure controls"],
    minMinutes: 780,
    maxMinutes: 1380,
  },
  {
    title: "Workflow Orchestration, Events, and Human Handoffs",
    landmark: "Workflow and Event Operations Hub",
    type: "tools",
    summary: "Coordinate multi-step integrations using state, queues, events, retries, compensation, approvals, exception routing, and auditable handoffs.",
    explanation: "Real integrations span time and systems. Model state transitions, idempotency, replay, dead letters, compensation, escalation thresholds, and human decisions so failures do not silently corrupt business processes.",
    lessons: ["Stateful workflow orchestration", "Events, messaging, idempotency, replay, and dead letters", "Human approvals, exception handling, and case management"],
    tasks: ["Design a recoverable stateful workflow.", "Create an event-driven processing pipeline.", "Define a low-confidence human-review flow."],
    topics: ["workflow orchestration", "events and messaging", "human-system handoffs"],
    minMinutes: 720,
    maxMinutes: 1260,
  },
  {
    title: "Testing, Evaluation, Performance, and Cost",
    landmark: "Integration Validation Laboratory",
    type: "core-skills",
    summary: "Validate deterministic interfaces and AI behavior through layered testing, evaluations, representative data, performance models, capacity, quotas, and unit economics.",
    explanation: "A successful demo is not production evidence. Build contract, integration, regression, security, AI-quality, latency, throughput, scalability, recovery, and cost validation with explicit release thresholds.",
    lessons: ["Contract, integration, regression, and security testing", "AI evaluation, golden datasets, rubrics, and release gates", "Latency, throughput, capacity, caching, quotas, and cost"],
    tasks: ["Create an end-to-end test strategy.", "Design an AI evaluation framework.", "Run a performance and cost review."],
    topics: ["integration testing", "AI evaluation", "performance and cost"],
    minMinutes: 780,
    maxMinutes: 1380,
  },
  {
    title: "Observability, Incident Response, and Lifecycle Governance",
    landmark: "Integration Reliability Command Center",
    type: "core-skills",
    summary: "Operate integrations with end-to-end telemetry, incident response, degraded modes, ownership, compatibility, access reviews, provider changes, and retirement controls.",
    explanation: "Production ownership continues after launch. Correlate transactions across systems, detect user impact, manage provider outages, preserve evidence, control versions, review access, and plan deprecation before change becomes failure.",
    lessons: ["Logs, metrics, traces, correlation, dashboards, and alerts", "Incident diagnosis, degraded modes, recovery, and postmortems", "Versioning, vendor change, ownership, support, and retirement"],
    tasks: ["Design integration observability.", "Run a provider-outage incident exercise.", "Write an integration lifecycle policy."],
    topics: ["integration observability", "incident response", "lifecycle governance"],
    minMinutes: 720,
    maxMinutes: 1200,
  },
  {
    title: "Production AI Integration Capstone",
    landmark: "Production Readiness Review Board",
    type: "projects",
    summary: "Deliver an end-to-end secure, governed, tested, observable, resilient, and supportable AI integration with production evidence.",
    explanation: "Integrate requirements, interfaces, identity, data, AI services, orchestration, safety, validation, observability, incident handling, cost, and operational handover into one defensible solution.",
    lessons: ["End-to-end integration architecture", "Implementation and representative validation", "Production-readiness defense and operational handover"],
    tasks: ["Design the capstone architecture.", "Build and validate the critical path.", "Run a production-readiness review and handover."],
    topics: ["capstone architecture", "capstone implementation and validation", "production handover"],
    minMinutes: 1440,
    maxMinutes: 2400,
  },
  {
    title: "Portfolio, Job Search, and Integration Interviews",
    landmark: "AI Integration Career Launchpad",
    type: "job-search",
    summary: "Convert technical work into credible evidence and target integration roles by responsibility, platform, seniority, and operating scope.",
    explanation: "Role titles vary widely. Prove requirements discovery, APIs, identity, data, AI services, workflows, testing, troubleshooting, security, and operations through redacted case studies and scenario interviews.",
    lessons: ["Portfolio case studies and evidence", "Role-title and vacancy mapping", "Architecture, debugging, security, and stakeholder interviews"],
    tasks: ["Publish three redacted case studies.", "Build a thirty-role targeting matrix.", "Complete architecture and troubleshooting mock interviews."],
    topics: ["portfolio evidence", "job-market mapping", "integration interviews"],
    minMinutes: 540,
    maxMinutes: 900,
  },
];

const journeyStages: CareerJourneyStage[] = stages.map((spec, index) => {
  const layout = workspaceLayout.journeyStages[index] ?? workspaceLayout.journeyStages[0];
  const order = index + 1;
  return {
    ...layout,
    id: `${slug}-stage-${order}`,
    order,
    type: spec.type,
    title: spec.title,
    label: spec.title,
    landmark: spec.landmark,
    theme: spec.title,
    summary: spec.summary,
    explanation: spec.explanation,
    lessons: spec.lessons,
    resources: [],
    tasks: spec.tasks.map((task, taskIndex) => ({
      id: `${slug}-stage-${order}-task-${taskIndex + 1}`,
      title: spec.lessons[taskIndex],
      description: task,
      type: order === 9 ? "project" : order === 10 ? "job-search" : "lesson",
    })),
    estimatedEffort: {
      minMinutes: spec.minMinutes,
      maxMinutes: spec.maxMinutes,
      breakdown: {
        resources: { minMinutes: Math.round(spec.minMinutes * 0.45), maxMinutes: Math.round(spec.maxMinutes * 0.45) },
        activities: { minMinutes: Math.round(spec.minMinutes * 0.4), maxMinutes: Math.round(spec.maxMinutes * 0.4) },
        assessment: { minMinutes: Math.round(spec.minMinutes * 0.15), maxMinutes: Math.round(spec.maxMinutes * 0.15) },
      },
    },
    topicAssessments: [],
    phaseExam: assessment(order, spec.title, spec.topics),
  };
});

const roadmapSpecs = [
  ["Integration Foundations", "Role boundaries", "Requirements", "System maps", "Integration patterns"],
  ["Secure Interfaces and Data", "APIs", "Identity", "Data contracts", "Privacy"],
  ["AI Services and Orchestration", "AI providers", "Structured outputs", "Workflows", "Events"],
  ["Production Validation", "Testing", "Evaluation", "Performance", "Cost"],
  ["Operations and Capstone", "Observability", "Incidents", "Lifecycle", "Capstone"],
  ["Employment Readiness", "Portfolio", "Role mapping", "Interviews", "Applications"],
] as const;

const roadmap: CareerRoadmapPhase[] = roadmapSpecs.map((sections, index) => {
  const base = workspaceLayout.roadmap[index] ?? workspaceLayout.roadmap[0];
  return {
    ...base,
    id: `${slug}-roadmap-${index + 1}`,
    phaseNumber: index + 1,
    title: sections[0],
    goal: `Build reviewable capability across ${sections.slice(1).join(", ")}.`,
    sections: [...sections],
    mentorTip: "Keep every integration decision traceable to workflow requirements, interface contracts, security boundaries, failure behavior, evidence, and named operational ownership.",
    practicalMissions: [
      `Produce one applied artifact for ${sections[1]}.`,
      `Validate one realistic scenario spanning ${sections.slice(2).join(", ")}.`,
    ],
    expectedOutcome: `You can design, implement, validate, and defend work across ${sections.slice(1).join(", ")}.`,
    lessons: base.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      id: `${slug}-roadmap-${index + 1}-lesson-${lessonIndex + 1}`,
      title: `${sections[(lessonIndex % (sections.length - 1)) + 1]} practice`,
      summary: `Apply ${sections[(lessonIndex % (sections.length - 1)) + 1]} in an AI integration scenario.`,
      resources: [],
      mission: `Create a professional artifact demonstrating ${sections[(lessonIndex % (sections.length - 1)) + 1]}.`,
    })),
    quiz: {
      ...base.quiz,
      id: `${slug}-roadmap-${index + 1}-quiz`,
      phaseId: `${slug}-roadmap-${index + 1}`,
      title: `${sections[0]} checkpoint`,
    },
  };
});

const career: CareerWorkspaceData = {
  ...workspaceLayout,
  slug,
  title: "AI Integration Specialist",
  category: "AI Automation",
  visual: {
    nodeLabel: "AI Integration Specialist",
    sceneTitle: "Enterprise AI Integration Control Center",
    sceneDescription: "A connected environment of applications, APIs, data, identity, AI services, events, workflows, observability, and governance.",
    imageAlt: "AI Integration Specialist career journey across enterprise systems and AI services.",
  },
  shortDescription: "Connect AI services safely to applications, data, workflows, and enterprise platforms through secure interfaces, governed context, resilient orchestration, evaluation, and production operations.",
  difficulty: "Intermediate",
  estimatedLearningTime: "9-13 months part-time",
  salary: "Varies by country, seniority, platform scope, and industry",
  hiringDemand: "Growing across organizations integrating generative AI and intelligent services into existing products and operations",
  remoteAvailability: "High, with environment and access constraints in regulated organizations",
  aiCompatibilityScore: "98%",
  bestFor: ["Systems thinkers", "API-oriented builders", "Cross-functional technical problem solvers", "People who enjoy connecting platforms and operations"],
  programmingRequirement: "Moderate: JavaScript or TypeScript, Python, APIs, JSON, SQL, shell, and workflow configuration",
  mathRequirement: "Low to Moderate: rates, latency, capacity, evaluation metrics, and cost analysis",
  creativityLevel: "High",
  communicationLevel: "High",
  lastUpdated: "2026-08-03",
  metrics: [
    { label: "Primary outcome", value: "Reliable AI connectivity", detail: "AI capabilities work safely across real systems and workflows." },
    { label: "Core evidence", value: "Working integrations", detail: "Contracts, code, tests, telemetry, controls, and runbooks remain inspectable." },
    { label: "Operating focus", value: "End-to-end lifecycle", detail: "Discovery, design, implementation, validation, launch, support, and retirement." },
    { label: "Professional standard", value: "Secure and recoverable", detail: "Identity, data, AI behavior, failure modes, cost, and ownership are explicit." },
  ],
  overview: {
    title: "What does an AI Integration Specialist do?",
    body: "An AI Integration Specialist connects model and AI services to existing applications, enterprise systems, data, knowledge, identity, APIs, events, and workflows. The role turns business requirements into secure interfaces, governed data flows, resilient orchestration, measurable AI quality, production telemetry, incident procedures, and operational ownership.",
    responsibilities: [
      "Discover integration requirements and constraints",
      "Design system boundaries, interfaces, and integration patterns",
      "Implement APIs, authentication, authorization, and secure connectivity",
      "Create data contracts, transformations, and governed AI context pipelines",
      "Integrate model, embedding, speech, vision, and document services",
      "Orchestrate workflows, events, queues, approvals, and human handoffs",
      "Test deterministic behavior, AI quality, security, performance, and cost",
      "Operate telemetry, incidents, provider changes, compatibility, and lifecycle governance",
    ],
    industries: ["Technology", "Financial services", "Retail", "Healthcare", "Manufacturing", "Professional services", "Public sector", "SaaS and enterprise software"],
  },
  journeyMap: {
    ...workspaceLayout.journeyMap,
    overviewTitle: "AI Integration Specialist Career Journey",
    overviewDescription: "Progress from role orientation to secure production AI integrations, operational ownership, portfolio evidence, and interviews.",
  },
  journeyStages,
  roadmap,
  projects: [
    {
      id: `${slug}-project-1`,
      title: "Secure AI API Integration",
      difficulty: "Intermediate",
      estimatedTime: "30-45 hours",
      phaseId: `${slug}-roadmap-2`,
      description: "Integrate an AI service into an existing application with API contracts, identity, secrets, validation, retries, rate limits, and audit evidence.",
      deliverables: ["Requirements brief", "API and identity design", "Working integration", "Failure tests", "Operational notes"],
      skills: ["APIs", "OAuth", "Secrets", "Resilience", "Testing"],
    },
    {
      id: `${slug}-project-2`,
      title: "Governed Enterprise Knowledge Integration",
      difficulty: "Intermediate",
      estimatedTime: "35-55 hours",
      phaseId: `${slug}-roadmap-3`,
      description: "Build a permission-aware context pipeline connecting enterprise content to an AI assistant with provenance, freshness, privacy, and evaluation controls.",
      deliverables: ["Context architecture", "Data contracts", "Permission model", "Evaluation set", "Risk register"],
      skills: ["RAG", "Search", "Data governance", "Permissions", "Evaluation"],
    },
    {
      id: `${slug}-project-3`,
      title: "Event-Driven AI Operations Workflow",
      difficulty: "Advanced",
      estimatedTime: "45-70 hours",
      phaseId: `${slug}-roadmap-4`,
      description: "Coordinate events, queues, AI processing, human review, retries, dead letters, observability, and recovery for a long-running business workflow.",
      deliverables: ["Event and workflow contracts", "Working critical path", "Failure handling", "Telemetry", "Runbook"],
      skills: ["Events", "Queues", "Workflow orchestration", "Human-in-the-loop", "Observability"],
    },
    {
      id: `${slug}-project-4`,
      title: "Production AI Integration Capstone",
      difficulty: "Advanced",
      estimatedTime: "70-110 hours",
      phaseId: `${slug}-roadmap-5`,
      description: "Deliver and defend a secure, governed, evaluated, observable, resilient, and cost-aware AI integration with operational handover.",
      deliverables: ["Architecture package", "Working implementation", "Validation evidence", "Operational runbook", "Production-readiness review"],
      skills: ["Architecture", "AI integration", "Security", "Evaluation", "Reliability", "Operations"],
    },
  ],
  globalResources: [],
  finalChallenge: {
    title: "AI Integration Production Readiness Review",
    description: "Present and defend an end-to-end AI integration before a simulated engineering, security, data, operations, and business panel.",
    requirements: ["Traceable requirements", "Secure interface and identity design", "Governed data and AI controls", "Representative tests and evaluations", "Observability and incident handling", "Named ownership and lifecycle plan"],
    deliverables: ["Executive summary", "Architecture and ADR package", "Working demonstration", "Validation report", "Risk register", "Operations runbook"],
    evaluation: ["Integration judgment", "Security and privacy", "AI quality", "Reliability", "Operational practicality", "Communication"],
  },
  relatedCareers: ["AI Automation Specialist", "AI Engineer", "AI Workflow Architect", "Solutions Architect", "Platform Engineer", "Data Engineer"],
  portfolioTasks: [
    { id: `${slug}-portfolio-1`, title: "Publish a secure API integration case study", description: "Show requirements, contracts, identity, implementation, tests, failures, and ownership.", type: "portfolio" },
    { id: `${slug}-portfolio-2`, title: "Publish a governed AI context case study", description: "Show data flows, permissions, retrieval, evaluation, privacy, and limitations.", type: "portfolio" },
    { id: `${slug}-portfolio-3`, title: "Publish an event-driven AI operations case study", description: "Show orchestration, human handoffs, telemetry, recovery, and measurable outcomes.", type: "portfolio" },
  ],
  jobSearchTasks: [
    { id: `${slug}-job-1`, title: "Build an AI integration title matrix", description: "Map AI Integration Specialist, Integration Engineer, Applied AI Engineer, Solutions Engineer, and adjacent titles by responsibility.", type: "job-search" },
    { id: `${slug}-job-2`, title: "Match vacancies to integration evidence", description: "Map each target role to API, identity, data, AI, workflow, testing, and operations artifacts.", type: "job-search" },
    { id: `${slug}-job-3`, title: "Run a focused application cycle", description: "Prioritize roles with strong evidence fit and document interview feedback and gaps.", type: "job-search" },
  ],
  interviewPrep: {
    title: "AI Integration Specialist Interview Preparation",
    practiceAreas: ["System and API design", "OAuth and service identity", "Data contracts and privacy", "AI service integration", "Workflow orchestration", "Testing and evaluation", "Troubleshooting and incidents", "Operational ownership"],
    questions: [
      "Design an AI integration for an existing customer-support platform.",
      "How would you secure service-to-service access to an external model API?",
      "How do you make an AI output contract safe for downstream automation?",
      "Design a permission-aware enterprise retrieval pipeline.",
      "How would you handle rate limits and provider outages?",
      "When should an integration use events instead of synchronous APIs?",
      "How do you evaluate an AI-assisted workflow before release?",
      "Walk through diagnosing intermittent latency across multiple systems.",
    ],
  },
};

export const aiIntegrationSpecialistCareer = applyCareerTitleAliasPolicy(career);
