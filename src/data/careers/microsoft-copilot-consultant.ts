
import { aiSolutionsConsultantCareer } from "@/data/careers/ai-solutions-consultant";
import { applyCareerTitleAliasPolicy } from "@/data/careerTitleAliases";
import type {
  CareerAssessment,
  CareerJourneyStage,
  CareerQuizQuestion,
  CareerResource,
  CareerRoadmapPhase,
  CareerWorkspaceData,
} from "@/types/careerWorkspace";

type StageSpec = {
  title: string;
  landmark: string;
  theme: string;
  summary: string;
  explanation: string;
  lessons: [string, string, string];
  tasks: [string, string, string];
  resource: CareerResource;
  concepts: [string, string, string, string];
};

const official = (
  id: string,
  title: string,
  type: CareerResource["type"],
  estimatedTime: string,
  whyUseful: string,
  url: string,
  priority: CareerResource["priority"] = "Essential",
): CareerResource => ({
  id,
  title,
  type,
  provider: "Microsoft Learn",
  cost: "Free",
  estimatedTime,
  whyUseful,
  url,
  priority,
});

const stages: readonly StageSpec[] = [
  {
    title: "Microsoft Copilot Consulting Orientation",
    landmark: "Copilot Advisory Observatory",
    theme: "Define the consultant role, engagement boundaries, Microsoft ecosystem, and evidence expected by employers and clients.",
    summary: "Distinguish Microsoft 365 Copilot, Copilot Studio, Power Platform, Azure AI services, agents, adoption work, and solution architecture responsibilities.",
    explanation: "A Microsoft Copilot Consultant connects business workflows with Microsoft 365 Copilot and extensible agents. The role requires discovery, licensing and readiness analysis, solution design, security, governance, testing, deployment, adoption, and measurable value realization.",
    lessons: ["Role scope and title variants", "Microsoft Copilot product landscape", "Consulting evidence plan"],
    tasks: [
      "Compare ten current Copilot-related vacancies and classify each as advisory, adoption, functional consulting, development, or architecture.",
      "Create a capability map covering Microsoft 365 Copilot, Copilot Studio, Power Platform, Microsoft Graph, identity, information protection, and analytics.",
      "Select one realistic organization and workflow for the end-to-end Copilot consulting capstone.",
    ],
    resource: official("mcc-role-overview", "Microsoft Copilot documentation", "Documentation", "60-90 minutes", "Establishes the official product landscape and terminology before solution design.", "https://learn.microsoft.com/en-us/copilot/"),
    concepts: ["role boundaries", "Microsoft 365 Copilot", "Copilot Studio", "consulting evidence"],
  },
  {
    title: "Microsoft 365 Copilot Readiness and Use-Case Discovery",
    landmark: "Readiness Assessment Center",
    theme: "Assess whether people, data, permissions, licensing, and workflows are ready for Microsoft 365 Copilot.",
    summary: "Map business tasks, prioritize high-value scenarios, inspect information hygiene, and define readiness gaps before launching a pilot.",
    explanation: "Copilot readiness depends on more than license assignment. Consultants must understand existing Microsoft 365 usage, oversharing risk, identity, content quality, stakeholder outcomes, and the work patterns where Copilot can produce measurable benefit.",
    lessons: ["Workflow and persona discovery", "Tenant and information readiness", "Use-case prioritization"],
    tasks: [
      "Run a structured discovery workshop for three user personas and map their recurring Microsoft 365 tasks.",
      "Create a readiness assessment covering licenses, identity, permissions, sensitive content, sharing practices, support, and adoption capacity.",
      "Prioritize use cases using value, feasibility, risk, frequency, and measurable outcome criteria.",
    ],
    resource: official("mcc-m365-readiness", "Prepare for Microsoft 365 Copilot", "Learning Path", "3-5 hours", "Provides official guidance for technical and organizational preparation before deployment.", "https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-setup"),
    concepts: ["workflow discovery", "information readiness", "permissions", "use-case prioritization"],
  },
  {
    title: "Microsoft 365 Copilot Experience and Prompt Enablement",
    landmark: "Workplace Copilot Lab",
    theme: "Design effective, responsible use of Copilot across Word, Excel, PowerPoint, Outlook, Teams, and Microsoft 365 Chat.",
    summary: "Translate workflows into prompt patterns, human review steps, source verification, role-based scenarios, and enablement materials.",
    explanation: "The consultant must design how employees use Copilot inside real work, not merely teach generic prompts. This stage covers task decomposition, context, grounding, review, confidentiality, and repeatable prompt patterns connected to business outcomes.",
    lessons: ["App-specific Copilot scenarios", "Prompt patterns and verification", "Role-based enablement"],
    tasks: [
      "Create a scenario library for five Microsoft 365 applications with expected inputs, outputs, review steps, and risks.",
      "Build a prompt pattern guide that includes context, objective, source boundaries, output format, and validation.",
      "Facilitate a role-based practice session and document observed quality, trust, and workflow issues.",
    ],
    resource: official("mcc-m365-use", "Get started with Microsoft 365 Copilot", "Learning Path", "4-6 hours", "Provides official app-level learning for practical workplace scenarios and responsible use.", "https://learn.microsoft.com/en-us/training/paths/get-started-with-microsoft-365-copilot/"),
    concepts: ["prompt design", "human review", "Microsoft 365 apps", "role-based enablement"],
  },
  {
    title: "Copilot Studio Agent Design",
    landmark: "Agent Design Workshop",
    theme: "Design a focused agent with explicit purpose, users, boundaries, instructions, conversation behavior, and fallback paths.",
    summary: "Convert a business problem into a Copilot Studio agent specification before adding knowledge, tools, and channels.",
    explanation: "A useful agent begins with a constrained job, clear instructions, user expectations, escalation, and measurable success criteria. Consultants must prevent scope drift and distinguish deterministic topics from generative orchestration.",
    lessons: ["Agent purpose and scope", "Instructions, topics, and variables", "Conversation and fallback design"],
    tasks: [
      "Write an agent charter with users, supported jobs, excluded requests, success criteria, and ownership.",
      "Build the initial agent in Copilot Studio with instructions, starter prompts, variables, and at least one deterministic topic.",
      "Design clarification, fallback, escalation, and unsupported-request behavior.",
    ],
    resource: official("mcc-agent-build", "Create and manage agents in Copilot Studio", "Learning Path", "5-7 hours", "Covers the official agent creation workflow, core components, testing, and publishing concepts.", "https://learn.microsoft.com/en-us/training/paths/create-extend-custom-copilots-microsoft-copilot-studio/"),
    concepts: ["agent scope", "instructions", "topics", "fallback behavior"],
  },
  {
    title: "Knowledge, Grounding, and Information Architecture",
    landmark: "Knowledge Grounding Library",
    theme: "Ground agent responses in approved organizational knowledge while respecting source quality, access, and freshness.",
    summary: "Select knowledge sources, structure content, control retrieval boundaries, test citations, and define content ownership.",
    explanation: "Grounding quality depends on the source system, permissions, content structure, duplication, metadata, freshness, and expected question patterns. Consultants must design both the technical source configuration and the operating process that keeps knowledge reliable.",
    lessons: ["Knowledge-source selection", "Grounding and retrieval quality", "Content governance and ownership"],
    tasks: [
      "Audit candidate SharePoint, website, Dataverse, and file sources for authority, access, duplication, freshness, and answerability.",
      "Configure approved knowledge sources and create a representative question set with expected source evidence.",
      "Produce a knowledge operating model defining owners, review frequency, retirement, escalation, and quality metrics.",
    ],
    resource: official("mcc-knowledge", "Add knowledge to an agent", "Documentation", "2-3 hours", "Explains supported knowledge sources and how Copilot Studio uses them for grounded answers.", "https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio"),
    concepts: ["knowledge sources", "grounding", "permissions", "content governance"],
  },
  {
    title: "Actions, Power Automate, Connectors, and Dataverse",
    landmark: "Automation Integration Hub",
    theme: "Extend agents from answering questions to performing controlled business actions.",
    summary: "Design tools, flows, connectors, inputs, outputs, validations, approvals, error handling, and audit evidence.",
    explanation: "Action design introduces operational risk. A consultant must decide which tasks can execute automatically, which require confirmation or approval, how authentication is handled, and how failures or duplicate submissions are prevented.",
    lessons: ["Agent tools and actions", "Power Automate and connectors", "Validation, approvals, and error handling"],
    tasks: [
      "Design an action contract with required inputs, permissions, validation, expected outputs, and failure conditions.",
      "Connect an agent to a Power Automate flow that creates or updates a governed business record.",
      "Add confirmation, approval, idempotency, timeout, error, and audit behavior.",
    ],
    resource: official("mcc-actions", "Use tools with agents in Copilot Studio", "Documentation", "3-4 hours", "Provides official guidance for connecting agents to actions, connectors, flows, and external capabilities.", "https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-plugin-actions"),
    concepts: ["tools", "Power Automate", "approvals", "error handling"],
  },
  {
    title: "Security, Data Protection, Governance, and ALM",
    landmark: "Trust and Governance Gate",
    theme: "Apply identity, least privilege, data policies, environment strategy, lifecycle management, and responsible-AI controls.",
    summary: "Define authentication, authorization, DLP, connector policy, environment boundaries, solution packaging, release gates, and operational accountability.",
    explanation: "Copilot solutions inherit the permissions and risks of connected data and systems. Consultants must understand tenant controls, Power Platform governance, environment strategy, managed solutions, service accounts, auditability, and the distinction between access control and model behavior.",
    lessons: ["Identity and least privilege", "DLP and environment strategy", "ALM, release, and responsible AI"],
    tasks: [
      "Create a security and data-flow diagram showing users, agent, knowledge, actions, connectors, identities, and trust boundaries.",
      "Define a Power Platform environment and DLP policy for development, testing, and production.",
      "Create an ALM and release checklist covering solutions, connection references, environment variables, approvals, rollback, and ownership.",
    ],
    resource: official("mcc-security", "Security and governance for Copilot Studio", "Documentation", "4-6 hours", "Supports design of authentication, data policies, environments, administration, and governance controls.", "https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-and-governance"),
    concepts: ["identity", "DLP", "environment strategy", "ALM"],
  },
  {
    title: "Testing, Evaluation, Analytics, and Reliability",
    landmark: "Agent Evaluation Lab",
    theme: "Prove that the agent is useful, grounded, safe, reliable, observable, and ready for controlled release.",
    summary: "Build test sets, evaluate answer and action quality, inspect transcripts and analytics, define thresholds, and establish incident response.",
    explanation: "A successful demo is not production evidence. Consultants need representative scenarios, expected outcomes, adversarial cases, permission tests, action validation, failure analysis, analytics, and release criteria linked to business and risk outcomes.",
    lessons: ["Test-set and rubric design", "Agent analytics and diagnostics", "Reliability and release criteria"],
    tasks: [
      "Create a test suite covering normal, ambiguous, unsupported, sensitive, unauthorized, stale, and action-failure scenarios.",
      "Score groundedness, completeness, citation quality, task success, latency, escalation, and harmful failure.",
      "Define release thresholds, monitoring, incident triage, retraining or content correction, and rollback responsibilities.",
    ],
    resource: official("mcc-analytics", "Analyze agent performance in Copilot Studio", "Documentation", "3-5 hours", "Explains official analytics and operational signals used to improve agent quality and adoption.", "https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-overview"),
    concepts: ["test sets", "evaluation rubrics", "analytics", "release criteria"],
  },
  {
    title: "Deployment, Adoption, Change, and Value Realization",
    landmark: "Enterprise Adoption Center",
    theme: "Move from technical readiness to sustained use, changed work practices, support, and measurable value.",
    summary: "Plan pilots, audience waves, communications, champions, training, support, usage measurement, outcome measurement, and scale decisions.",
    explanation: "Deployment does not equal adoption. Consultants must coordinate technical enablement, stakeholder expectations, workflow change, learning, leadership sponsorship, user support, telemetry, qualitative feedback, and benefit realization.",
    lessons: ["Pilot and rollout design", "Change and adoption system", "Usage, outcomes, and value realization"],
    tasks: [
      "Create a pilot charter with target personas, scenarios, baseline measures, support model, exit criteria, and pause conditions.",
      "Design communications, manager enablement, champions, office hours, learning assets, and feedback loops.",
      "Build a value scorecard separating licenses, active use, proficiency, task outcomes, business outcomes, risk, and operating cost.",
    ],
    resource: official("mcc-adoption", "Microsoft 365 Copilot adoption resources", "Documentation", "4-6 hours", "Provides official adoption, scenario, rollout, and measurement guidance for enterprise Copilot programs.", "https://adoption.microsoft.com/en-us/copilot/"),
    concepts: ["pilot design", "change management", "usage metrics", "value realization"],
  },
  {
    title: "Copilot Consulting Capstone and Career Positioning",
    landmark: "Client Review Board",
    theme: "Deliver and defend an end-to-end Copilot engagement and position the resulting evidence for the correct job market.",
    summary: "Integrate discovery, readiness, agent design, grounding, actions, security, testing, deployment, adoption, and value into a client-ready case.",
    explanation: "The capstone demonstrates consulting judgment rather than feature familiarity. Every decision must be traceable to business evidence, Microsoft platform constraints, security controls, test results, operating ownership, adoption requirements, and measurable outcomes.",
    lessons: ["End-to-end consulting case", "Portfolio and confidentiality", "Job search and interview defense"],
    tasks: [
      "Produce a complete client pack: discovery brief, readiness assessment, solution design, agent prototype, governance plan, test report, rollout plan, and value model.",
      "Publish a redacted case study with screenshots, architecture, decisions, evidence, limitations, and next steps.",
      "Run a panel-style defense covering licensing, permissions, knowledge quality, actions, DLP, testing, adoption, and ROI.",
    ],
    resource: official("mcc-applied-skill", "Build an agent in Microsoft Copilot Studio", "Exam", "4-8 hours preparation", "Provides an official applied-skills lab aligned with practical Copilot Studio agent construction.", "https://learn.microsoft.com/en-us/credentials/applied-skills/build-an-agent-in-microsoft-copilot-studio/"),
    concepts: ["capstone", "portfolio evidence", "job positioning", "interview defense"],
  },
] as const;

function makeQuestions(stageIndex: number, concepts: readonly string[]): CareerQuizQuestion[] {
  const resolvedStageIndex = Math.min(stageIndex, stages.length - 1);
  return Array.from({ length: 12 }, (_, index) => {
    const focus = concepts[index % concepts.length];
    const scenario = index % 3 === 0;
    return {
      id: `mcc-stage-${resolvedStageIndex + 1}-question-${index + 1}`,
      question: scenario
        ? `In a Microsoft Copilot consulting engagement, which decision best demonstrates sound judgment about ${focus}?`
        : `Which statement about ${focus} is most accurate for a Microsoft Copilot Consultant?`,
      answers: [
        `Define the business outcome, evidence, permissions, risk controls, owner, and validation criteria before scaling ${focus}.`,
        `Enable ${focus} tenant-wide immediately and use adoption data to discover requirements later.`,
        `Treat ${focus} as a user-training issue because platform configuration does not affect outcomes.`,
        `Avoid documenting ${focus} so the solution remains flexible after launch.`,
      ],
      correctAnswerIndex: 0,
      explanation: `Professional Copilot consulting makes ${focus} traceable to business outcomes, platform constraints, access, risk, validation, and accountable ownership.`,
      difficulty: resolvedStageIndex < 3 ? "Beginner" : resolvedStageIndex < 7 ? "Intermediate" : "Advanced",
      relatedTopic: focus,
      learningObjectiveId: `mcc-stage-${resolvedStageIndex + 1}-${index % concepts.length + 1}`,
      questionType: scenario ? "scenario" : "multiple-choice",
      referenceId: stages[resolvedStageIndex].resource.id,
      status: "active",
      lastReviewedAt: "2026-08-03",
      version: 1,
    };
  });
}

function makeAssessment(stageIndex: number, type: "topic" | "comprehensive", topicIndex = 0): CareerAssessment {
  const resolvedStageIndex = Math.min(stageIndex, stages.length - 1);
  const stage = stages[resolvedStageIndex];
  const all = makeQuestions(resolvedStageIndex, stage.concepts);
  const questions = type === "topic"
    ? all.slice(topicIndex * 4, topicIndex * 4 + 5)
    : all;
  return {
    id: type === "topic"
      ? `mcc-stage-${resolvedStageIndex + 1}-topic-${topicIndex + 1}-assessment`
      : `mcc-stage-${resolvedStageIndex + 1}-comprehensive-assessment`,
    title: type === "topic"
      ? `${stage.lessons[topicIndex]} knowledge check`
      : `${stage.title} comprehensive assessment`,
    description: type === "topic"
      ? `A focused check on ${stage.lessons[topicIndex].toLowerCase()}.`
      : `A scenario-based assessment covering ${stage.lessons.join(", ")}.`,
    passingScore: 70,
    assessmentType: type,
    topicId: type === "topic" ? `mcc-stage-${resolvedStageIndex + 1}-topic-${topicIndex + 1}` : undefined,
    topicLabel: type === "topic" ? stage.lessons[topicIndex] : stage.title,
    durationMinutes: type === "topic" ? 10 : 25,
    questionsPerAttempt: type === "topic" ? 5 : 10,
    questions,
    officialPracticeLinks: [{ title: stage.resource.title, url: stage.resource.url }],
  };
}

function mapStage(stage: CareerJourneyStage, index: number): CareerJourneyStage {
  const spec = stages[index] ?? stages[stages.length - 1];
  return {
    ...stage,
    id: `mcc-stage-${index + 1}`,
    order: index + 1,
    title: spec.title,
    label: spec.title,
    landmark: spec.landmark,
    theme: spec.theme,
    summary: spec.summary,
    explanation: spec.explanation,
    lessons: [...spec.lessons],
    resources: [spec.resource],
    tasks: spec.tasks.map((description, taskIndex) => ({
      id: `mcc-stage-${index + 1}-task-${taskIndex + 1}`,
      title: description,
      description,
      type: index === 9 ? "career" : index >= 7 ? "project" : "lesson",
    })),
    estimatedEffort: {
      minMinutes: 480 + index * 60,
      maxMinutes: 720 + index * 90,
      breakdown: {
        resources: { minMinutes: 180, maxMinutes: 300 },
        activities: { minMinutes: 240 + index * 45, maxMinutes: 330 + index * 60 },
        assessment: { minMinutes: 60, maxMinutes: 90 },
      },
    },
    test: undefined,
    topicAssessments: [0, 1, 2].map((topicIndex) => makeAssessment(index, "topic", topicIndex)),
    phaseExam: makeAssessment(index, "comprehensive"),
  };
}

const roadmapSpecs = [
  {
    title: "Copilot Consulting and Readiness Foundations",
    goal: "Define the role, Microsoft ecosystem, business scenarios, tenant readiness, permissions, and prioritized use cases.",
    sections: ["Role scope", "Microsoft ecosystem", "Workflow discovery", "Licensing", "Information readiness", "Use-case portfolio"],
  },
  {
    title: "Microsoft 365 Copilot Experience and Enablement",
    goal: "Design role-based Copilot scenarios, prompt patterns, review controls, and practical workplace enablement.",
    sections: ["Word", "Excel", "PowerPoint", "Outlook and Teams", "Prompt patterns", "Human verification"],
  },
  {
    title: "Copilot Studio Agent and Knowledge Design",
    goal: "Create a focused agent with instructions, topics, variables, grounded knowledge, and governed content ownership.",
    sections: ["Agent charter", "Instructions", "Topics", "Variables", "Knowledge sources", "Grounding quality"],
  },
  {
    title: "Actions, Security, Governance, and ALM",
    goal: "Connect controlled actions and establish identity, data protection, environments, DLP, lifecycle, and release controls.",
    sections: ["Tools", "Power Automate", "Connectors", "Identity", "DLP", "ALM"],
  },
  {
    title: "Testing, Deployment, Adoption, and Value",
    goal: "Evaluate agent quality, publish safely, run pilots, support users, and measure adoption and realized value.",
    sections: ["Test suites", "Analytics", "Release criteria", "Pilot", "Adoption", "Value scorecard"],
  },
  {
    title: "Capstone, Portfolio, Jobs, and Interviews",
    goal: "Package an end-to-end Copilot consulting engagement and defend it in employer and client scenarios.",
    sections: ["Client pack", "Agent demonstration", "Governance evidence", "Case study", "Role mapping", "Interview defense"],
  },
] as const;

function mapRoadmap(phase: CareerRoadmapPhase, index: number): CareerRoadmapPhase {
  const spec = roadmapSpecs[index] ?? roadmapSpecs[roadmapSpecs.length - 1];
  return {
    ...phase,
    id: `mcc-roadmap-phase-${index + 1}`,
    phaseNumber: index + 1,
    title: spec.title,
    goal: spec.goal,
    duration: index < 2 ? "4-6 weeks" : "5-8 weeks",
    status: index === 0 ? "unlocked" : "locked",
    sections: [...spec.sections],
    mentorTip: index === 0
      ? "Do not recommend licenses or agents before documenting workflows, permissions, information quality, risk, and measurable outcomes."
      : "Keep every Copilot decision traceable to user need, Microsoft platform behavior, security, validation evidence, and operational ownership.",
    practicalMissions: [
      `Produce a client-ready artifact for ${spec.sections[0]}.`,
      `Validate a decision spanning ${spec.sections.slice(1, 4).join(", ")}.`,
    ],
    expectedOutcome: `You can design and defend work across ${spec.sections.join(", ")}.`,
    lessons: phase.lessons.map((lesson, lessonIndex) => {
      const stageIndex = Math.min(index * 2 + Math.floor(lessonIndex / 2), stages.length - 1);
      const stage = stages[stageIndex];
      const topic = spec.sections[lessonIndex % spec.sections.length];
      return {
        ...lesson,
        id: `mcc-roadmap-${index + 1}-lesson-${lessonIndex + 1}`,
        title: `${topic} guided practice`,
        summary: `Study and apply ${topic} in a Microsoft Copilot consulting scenario.`,
        mission: `Create a reviewable artifact demonstrating ${topic}, validation, risk controls, and accountable ownership.`,
        outcomes: [
          `Explain ${topic} using Microsoft platform terminology.`,
          `Apply ${topic} to a realistic business workflow.`,
          `Document evidence, assumptions, risks, and validation.`,
        ],
        resources: [stage.resource],
      };
    }),
    quiz: {
      ...phase.quiz,
      id: `mcc-roadmap-phase-${index + 1}-quiz`,
      phaseId: `mcc-roadmap-phase-${index + 1}`,
      title: `${spec.title} checkpoint`,
      description: `Check professional judgment across ${spec.sections.join(", ")}.`,
      questions: makeQuestions(Math.min(index + 2, stages.length - 1), spec.sections).slice(0, 10),
    },
  };
}

const base = aiSolutionsConsultantCareer;

const career: CareerWorkspaceData = {
  ...base,
  slug: "microsoft-copilot-consultant",
  title: "Microsoft Copilot Consultant",
  category: "AI Automation",
  visual: {
    nodeLabel: "Microsoft Copilot Consultant",
    sceneTitle: "Microsoft Copilot Advisory and Agent Lab",
    sceneDescription: "A consulting environment connecting Microsoft 365 Copilot, Copilot Studio agents, enterprise knowledge, Power Platform actions, security, governance, adoption, and value.",
    imageAlt: "Microsoft Copilot consulting workspace showing readiness assessment, Microsoft 365 scenarios, Copilot Studio agent design, knowledge grounding, Power Automate actions, governance, testing, and adoption.",
  },
  shortDescription: "Assess, design, build, secure, deploy, and scale Microsoft 365 Copilot and Copilot Studio solutions across real business workflows.",
  difficulty: "Intermediate",
  estimatedLearningTime: "6-9 months part-time",
  salary: "Varies by country, consulting seniority, Microsoft platform depth, delivery responsibility, and employer type",
  hiringDemand: "Role titles and demand vary across Microsoft partners, consultancies, systems integrators, managed-service providers, and enterprise digital-workplace teams",
  remoteAvailability: "Medium to High; discovery, design, build, and support can be remote, while workshops and rollout activities are often hybrid",
  aiCompatibilityScore: "High: the role works directly with AI systems but remains accountable for discovery, architecture, governance, adoption, and professional judgment",
  bestFor: [
    "Microsoft 365 or Power Platform professionals moving into AI consulting",
    "Business analysts and process specialists who can translate workflows into solutions",
    "Automation professionals adding Copilot Studio and enterprise adoption skills",
    "Consultants comfortable with stakeholders, governance, and technical delivery",
    "Digital workplace specialists building measurable AI-enabled ways of working",
  ],
  programmingRequirement: "Low to Moderate: functional work is largely low-code, but APIs, JSON, authentication, connectors, expressions, and debugging are valuable",
  mathRequirement: "Low: business baselines, usage metrics, quality measures, benefit estimates, and scenario analysis",
  creativityLevel: "High",
  communicationLevel: "Very High",
  lastUpdated: "2026-08-03",
  metrics: [
    { label: "Primary outcome", value: "Governed Copilot solutions", detail: "Useful Microsoft 365 experiences and agents tied to real workflows, permissions, validation, and ownership." },
    { label: "Core platform", value: "Microsoft ecosystem", detail: "Microsoft 365 Copilot, Copilot Studio, Power Platform, Microsoft Graph, Entra ID, SharePoint, Dataverse, and Purview." },
    { label: "Delivery model", value: "Advisory to adoption", detail: "Discovery, readiness, design, build, testing, deployment, enablement, monitoring, and value realization." },
    { label: "Portfolio proof", value: "Client-ready evidence", detail: "Readiness assessment, agent prototype, security design, test report, rollout plan, and value scorecard." },
  ],
  overview: {
    title: "What does a Microsoft Copilot Consultant do?",
    body: "A Microsoft Copilot Consultant helps organizations use Microsoft 365 Copilot and Copilot Studio safely and productively. The consultant discovers workflows, assesses tenant and information readiness, prioritizes scenarios, configures or builds agents, grounds them in approved knowledge, connects controlled actions, defines security and governance, tests quality and reliability, plans deployment and adoption, and measures realized business value.",
    responsibilities: [
      "Lead stakeholder discovery and map Microsoft 365 workflows",
      "Assess licensing, identity, permissions, information hygiene, and organizational readiness",
      "Prioritize Copilot scenarios using value, feasibility, frequency, risk, and measurable outcomes",
      "Design Microsoft 365 Copilot usage patterns and role-based enablement",
      "Build Copilot Studio agents with instructions, topics, variables, knowledge, and tools",
      "Connect Power Automate flows, connectors, APIs, Dataverse, and approval steps",
      "Define authentication, least privilege, DLP, environment strategy, ALM, and release controls",
      "Create test suites and evaluate groundedness, task success, safety, access, latency, and failures",
      "Plan pilots, rollout waves, communications, champions, training, support, and feedback",
      "Measure active use, proficiency, workflow outcomes, business value, operating cost, and risk",
    ],
    industries: ["Microsoft partners", "Technology consulting", "Professional services", "Financial services", "Retail", "Manufacturing", "Healthcare", "Public sector", "Education", "Digital workplace teams"],
  },
  journeyMap: {
    ...base.journeyMap,
    overviewTitle: "Microsoft Copilot Consultant Career Journey",
    overviewDescription: "Progress from Microsoft ecosystem orientation and readiness assessment through Copilot Studio agent delivery, governance, adoption, and client-ready portfolio evidence.",
  },
  journeyStages: base.journeyStages.slice(0, stages.length).map(mapStage),
  roadmap: base.roadmap.slice(0, roadmapSpecs.length).map(mapRoadmap),
  projects: [
    {
      id: "mcc-project-readiness",
      title: "Microsoft 365 Copilot Readiness and Scenario Assessment",
      difficulty: "Intermediate",
      estimatedTime: "25-40 hours",
      phaseId: "mcc-roadmap-phase-1",
      description: "Assess a realistic organization’s workflows, licenses, identity, information access, oversharing risk, stakeholder readiness, support capacity, and prioritized Microsoft 365 Copilot scenarios.",
      deliverables: ["Discovery guide and stakeholder map", "Persona and workflow inventory", "Tenant and information-readiness checklist", "Use-case scoring model", "Pilot recommendation with exclusions and risks", "Executive summary"],
      skills: ["Discovery", "Microsoft 365", "Readiness", "Permissions", "Information governance", "Use-case prioritization"],
    },
    {
      id: "mcc-project-knowledge-agent",
      title: "Governed Copilot Studio Knowledge Agent",
      difficulty: "Intermediate",
      estimatedTime: "35-55 hours",
      phaseId: "mcc-roadmap-phase-3",
      description: "Build a focused Copilot Studio agent grounded in approved knowledge, with deterministic and generative behavior, citations, fallback, escalation, content ownership, and a representative evaluation set.",
      deliverables: ["Agent charter", "Conversation design", "Configured knowledge sources", "Source-quality audit", "Test set and scoring rubric", "Analytics and improvement report", "Redacted agent demonstration"],
      skills: ["Copilot Studio", "Agent design", "Knowledge grounding", "Content governance", "Testing", "Analytics"],
    },
    {
      id: "mcc-project-action-workflow",
      title: "Copilot Action with Approval and Audit Controls",
      difficulty: "Advanced",
      estimatedTime: "40-65 hours",
      phaseId: "mcc-roadmap-phase-4",
      description: "Connect an agent to a Power Automate workflow that performs a business action with validation, user confirmation, approval, least privilege, error handling, idempotency, and audit evidence.",
      deliverables: ["Action contract", "Architecture and data-flow diagram", "Power Automate flow", "Approval and exception paths", "DLP and identity design", "Functional and security test report", "Operations runbook"],
      skills: ["Power Automate", "Connectors", "Approvals", "Authentication", "DLP", "Error handling", "Operations"],
    },
    {
      id: "mcc-project-enterprise-blueprint",
      title: "Enterprise Copilot Deployment and Adoption Blueprint",
      difficulty: "Advanced",
      estimatedTime: "55-85 hours",
      phaseId: "mcc-roadmap-phase-5",
      description: "Design a phased Microsoft 365 Copilot and Copilot Studio program with governance, environment strategy, pilot design, change management, support, analytics, and value realization.",
      deliverables: ["Target operating model", "Governance and ALM framework", "Pilot charter", "Rollout waves", "Communications and enablement plan", "Support and incident model", "Usage and value scorecard", "Scale decision memo"],
      skills: ["Architecture", "Governance", "ALM", "Adoption", "Change management", "Analytics", "Value realization"],
    },
  ],
  globalResources: stages.map((stage) => stage.resource),
  readiness: [
    { id: "mcc-ready-1", label: "Readiness assessment", description: "Can assess workflows, licensing, identity, permissions, information quality, risk, support, and adoption capacity.", weight: 14 },
    { id: "mcc-ready-2", label: "Microsoft 365 Copilot scenarios", description: "Can design app-specific, role-based Copilot scenarios with review and verification.", weight: 10 },
    { id: "mcc-ready-3", label: "Copilot Studio agent", description: "Can create a scoped agent with instructions, topics, variables, fallback, and escalation.", weight: 14 },
    { id: "mcc-ready-4", label: "Knowledge grounding", description: "Can select, configure, test, and govern approved knowledge sources.", weight: 10 },
    { id: "mcc-ready-5", label: "Actions and automation", description: "Can connect controlled tools, flows, connectors, approvals, and business systems.", weight: 12 },
    { id: "mcc-ready-6", label: "Security and governance", description: "Can design identity, least privilege, DLP, environments, ALM, and release controls.", weight: 14 },
    { id: "mcc-ready-7", label: "Testing and analytics", description: "Can build representative evaluations and use diagnostics to improve reliability.", weight: 10 },
    { id: "mcc-ready-8", label: "Adoption and value", description: "Can plan pilots, change, enablement, support, measurement, and value realization.", weight: 10 },
    { id: "mcc-ready-9", label: "Portfolio and interview defense", description: "Can present decisions, evidence, risks, limitations, and outcomes in client and employer scenarios.", weight: 6 },
  ],
  finalChallenge: {
    title: "Microsoft Copilot Enterprise Engagement Review",
    description: "Present and defend an end-to-end engagement covering readiness, Microsoft 365 Copilot scenarios, Copilot Studio design, knowledge, actions, security, testing, rollout, adoption, and value.",
    requirements: ["Evidence-based workflow and readiness analysis", "Clear product and licensing boundaries", "Working or demonstrable Copilot Studio agent", "Approved knowledge and action design", "Identity, DLP, environment, and ALM controls", "Representative test evidence", "Adoption and support model", "Qualified value case and limitations"],
    deliverables: ["Executive recommendation", "Readiness assessment", "Solution architecture", "Agent demonstration", "Governance pack", "Evaluation report", "Pilot and rollout plan", "Value scorecard", "Redacted portfolio case study"],
    evaluation: ["Problem framing", "Microsoft platform accuracy", "Security and governance", "Agent usefulness", "Grounding quality", "Action reliability", "Testing quality", "Adoption practicality", "Value evidence", "Communication"],
  },
  relatedCareers: ["Power Platform Consultant", "Microsoft 365 Consultant", "AI Adoption Consultant", "AI Automation Specialist", "AI Solutions Consultant", "Digital Workplace Consultant"],
  progressRules: { readinessThreshold: 75, minimumProjects: 3, minimumQuizScore: 70 },
  jobBoard: {
    title: "Microsoft Copilot and Power Platform Opportunities",
    description: "Search across Copilot, Microsoft 365, Power Platform, digital workplace, adoption, functional consulting, and solution architecture families.",
    integrationStatus: "coming-soon",
    filters: ["Microsoft 365 Copilot", "Copilot Studio", "Power Platform", "Functional Consultant", "Solution Architect", "Adoption", "Digital Workplace", "Microsoft Partner"],
    sampleDisclaimer: "Job titles vary significantly by employer. Review actual responsibilities and distinguish consulting, adoption, functional, development, presales, and architecture roles.",
  },
  portfolioTasks: [
    { id: "mcc-portfolio-1", title: "Publish a Copilot readiness assessment", description: "Show problem, personas, workflows, information and permission risks, scoring, exclusions, pilot choice, and limitations.", type: "portfolio" },
    { id: "mcc-portfolio-2", title: "Publish a Copilot Studio agent case study", description: "Show agent purpose, instructions, knowledge, tools, tests, analytics, failures, corrections, and ownership without exposing confidential content.", type: "portfolio" },
    { id: "mcc-portfolio-3", title: "Publish a security and governance design", description: "Show identities, trust boundaries, DLP, environments, ALM, release gates, incident handling, and residual risks.", type: "portfolio" },
    { id: "mcc-portfolio-4", title: "Publish an adoption and value blueprint", description: "Show pilot design, communications, champions, learning, support, metrics, realized-value logic, cost, and scale decisions.", type: "portfolio" },
  ],
  jobSearchTasks: [
    { id: "mcc-job-1", title: "Build a role-title and seniority matrix", description: "Separate Microsoft 365 Copilot Consultant, Copilot Studio Consultant, Power Platform Consultant, Copilot Adoption Consultant, Functional Consultant, Technical Consultant, and Solution Architect vacancies.", type: "job-search" },
    { id: "mcc-job-2", title: "Create a vacancy-to-evidence gap analysis", description: "Map requested Microsoft skills, consulting behaviors, certifications, security knowledge, delivery scope, and industry experience to inspectable portfolio evidence.", type: "job-search" },
    { id: "mcc-job-3", title: "Prepare Microsoft partner and enterprise versions", description: "Tailor one application toward billable client delivery and another toward internal digital-workplace ownership.", type: "job-search" },
    { id: "mcc-job-4", title: "Run scenario-based interview practice", description: "Practice readiness, licensing, permissions, grounding, actions, DLP, testing, failed pilots, stakeholder resistance, and value questions.", type: "job-search" },
  ],
  interviewPrep: {
    title: "Microsoft Copilot Consultant Interview Preparation",
    practiceAreas: ["Microsoft 365 Copilot versus Copilot Studio", "Readiness and licensing", "Microsoft Graph and permissions", "Agent instructions and topics", "Knowledge grounding and citations", "Power Automate actions and connectors", "Authentication, DLP, and environments", "ALM and release", "Testing and analytics", "Pilot, adoption, and value realization", "Stakeholder and consulting judgment", "Portfolio defense"],
    questions: [
      "How do Microsoft 365 Copilot and Copilot Studio differ, and when would you recommend each?",
      "How would you assess a tenant before assigning Microsoft 365 Copilot licenses?",
      "Why can overshared SharePoint content become a Copilot risk even when permissions technically work as designed?",
      "How do you convert an ambiguous business request into a scoped Copilot Studio agent charter?",
      "When would you use deterministic topics rather than generative orchestration?",
      "How would you evaluate whether a knowledge source is suitable for grounding?",
      "Design an agent action that updates a business record but requires approval for high-risk changes.",
      "How would you apply authentication, least privilege, DLP, environments, and connection references?",
      "What should an agent test set include beyond happy-path questions?",
      "How would you diagnose an agent that gives correct answers in testing but poor answers after publication?",
      "Design a Microsoft 365 Copilot pilot with measurable exit and pause criteria.",
      "Which metrics distinguish license assignment, active use, proficiency, task improvement, and realized business value?",
      "How would you respond when a stakeholder asks to deploy broadly before security and content-readiness issues are resolved?",
      "Walk through a failed Copilot project and explain how you would identify whether the root cause was product fit, data, permissions, agent design, adoption, or operating ownership.",
      "Which questions would you ask an employer about tenant access, delivery responsibility, partner certifications, billable utilization, governance authority, and support ownership?",
    ],
  },
};

export const microsoftCopilotConsultantCareer = applyCareerTitleAliasPolicy(career);
