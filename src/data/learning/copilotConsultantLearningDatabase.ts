import type { ReferenceLearningOption, ReferenceResource } from "@/types/reference";

const reviewedAt = "2026-08-03";
const nextReviewAt = "2026-10-02";

type OptionInput = Omit<ReferenceLearningOption, "verifiedContentType" | "verifiedAt" | "verificationSource"> & {
  verificationSource?: string;
};

type ResourceInput = Omit<
  ReferenceResource,
  "languages" | "segments" | "status" | "lastVerifiedAt" | "reviewIntervalDays" | "nextReviewAt" | "learningOptions"
> & { learningOptions: OptionInput[] };

function option(input: OptionInput): ReferenceLearningOption {
  return {
    ...input,
    verifiedContentType: true,
    verifiedAt: reviewedAt,
    verificationSource: input.verificationSource ?? "official-microsoft-source",
  };
}

function resource(input: ResourceInput): ReferenceResource {
  return {
    ...input,
    languages: ["en"],
    segments: [],
    status: "active",
    lastVerifiedAt: reviewedAt,
    reviewIntervalDays: 60,
    nextReviewAt,
    learningOptions: input.learningOptions.map(option),
  };
}

const microsoftVideo = (title: string, description: string, url: string): OptionInput => ({
  mode: "video",
  contentType: "video-series",
  title,
  description,
  url,
  provider: "Microsoft Learn",
  durationLabel: "Self-paced",
  isOfficial: true,
  access: "free",
});

const microsoftPractice = (title: string, description: string, url: string): OptionInput => ({
  mode: "practice",
  contentType: "guided-module",
  title,
  description,
  url,
  provider: "Microsoft Learn",
  durationLabel: "Self-paced",
  isOfficial: true,
  access: "free",
});

export const COPILOT_CONSULTANT_LEARNING_DATABASE: ReferenceResource[] = [
  resource({
    id: "mcc-role-overview",
    title: "Microsoft Copilot Consultant Role and Platform Orientation",
    provider: "Microsoft Learn",
    description: "Understand the Microsoft Copilot product family, agent concepts, platform boundaries, and consultant evidence expected across advisory, adoption, functional, and delivery roles.",
    type: "learning-path",
    canonicalUrl: "https://learn.microsoft.com/en-us/copilot/",
    isOfficial: true,
    topics: ["microsoft-copilot", "career-orientation", "consulting"],
    skillLevels: ["Beginner", "Intermediate"],
    priority: "essential",
    access: "free",
    durationLabel: "2-4 hours",
    learningOptions: [
      { mode: "reading", contentType: "documentation", title: "Explore Microsoft Copilot documentation", description: "Map Microsoft 365 Copilot, Copilot Studio, agents, extensibility, administration, and adoption responsibilities.", url: "https://learn.microsoft.com/en-us/copilot/", provider: "Microsoft Learn", durationLabel: "60-90 minutes", isOfficial: true, access: "free" },
      microsoftVideo("Copilot Studio Agent Academy: Introduction to agents", "Watch Microsoft's foundation lesson on agents, RAG, conversational agents, and autonomous agents.", "https://learn.microsoft.com/en-us/shows/copilot-studio-agent-academy/introduction-to-agents"),
      microsoftPractice("Understand features of Copilot Studio agents", "Complete the module assessment while mapping knowledge, tools, analytics, flows, evaluation, and lifecycle responsibilities.", "https://learn.microsoft.com/en-us/training/modules/understand-features-copilot-studio-agents/"),
    ],
  }),
  resource({
    id: "mcc-m365-readiness",
    title: "Microsoft 365 Copilot Readiness and Deployment Planning",
    provider: "Microsoft Learn",
    description: "Assess minimum requirements, licensing, identity, information access, deployment readiness, and organizational preparation before a Copilot pilot.",
    type: "documentation",
    canonicalUrl: "https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-setup",
    isOfficial: true,
    topics: ["readiness", "microsoft-365", "deployment"],
    skillLevels: ["Intermediate"],
    priority: "essential",
    access: "free",
    durationLabel: "3-5 hours",
    learningOptions: [
      { mode: "reading", contentType: "documentation", title: "Prepare and set up Microsoft 365 Copilot", description: "Study setup, minimum requirements, data readiness, license assignment, and rollout guidance.", url: "https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-setup", provider: "Microsoft Learn", durationLabel: "2 hours", isOfficial: true, access: "free" },
      microsoftVideo("Strategically implement Microsoft Copilot", "Review expert implementation guidance covering readiness, business strategy, adoption, and common rollout mistakes.", "https://learn.microsoft.com/en-us/shows/copilot-learning-hub/how-to-strategically-implement-microsoft-copilot-expert-insights-and-best-practices-part-1"),
      microsoftPractice("Get ready to work with Microsoft 365 Copilot", "Complete the official module and assessment covering grounding, enterprise data protection, sensitivity labels, agents, and prompt structure.", "https://learn.microsoft.com/en-us/training/modules/get-ready-work-microsoft-365-copilot/"),
    ],
  }),
  resource({
    id: "mcc-m365-use",
    title: "Microsoft 365 Copilot Scenarios and Prompt Enablement",
    provider: "Microsoft Learn",
    description: "Design role-based scenarios and responsible prompt patterns across Microsoft 365 apps with explicit review and verification steps.",
    type: "learning-path",
    canonicalUrl: "https://learn.microsoft.com/en-us/training/paths/get-started-with-microsoft-365-copilot/",
    isOfficial: true,
    topics: ["prompting", "microsoft-365-apps", "enablement"],
    skillLevels: ["Beginner", "Intermediate"],
    priority: "essential",
    access: "free",
    durationLabel: "4-6 hours",
    learningOptions: [
      { mode: "reading", contentType: "learning-path", title: "Get started with Microsoft 365 Copilot", description: "Follow the official path across Copilot concepts, Microsoft 365 app scenarios, and responsible use.", url: "https://learn.microsoft.com/en-us/training/paths/get-started-with-microsoft-365-copilot/", provider: "Microsoft Learn", durationLabel: "1 hour 31 minutes", isOfficial: true, access: "free" },
      microsoftVideo("Microsoft 365 Copilot overview", "Watch the official overview embedded in Microsoft's current product documentation.", "https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-overview"),
      microsoftPractice("Create and draft content with Microsoft 365 Copilot", "Use the guided sample-data exercise to practice context, goal, source, expectations, and human review.", "https://learn.microsoft.com/en-us/training/modules/create-draft-content-with-microsoft-copilot-microsoft-365/"),
    ],
  }),
  resource({
    id: "mcc-agent-build",
    title: "Copilot Studio Agent Design and Build",
    provider: "Microsoft Learn",
    description: "Define agent purpose, instructions, topics, variables, generative behavior, fallback, testing, and publication using the shared Copilot Studio workflow.",
    type: "learning-path",
    canonicalUrl: "https://learn.microsoft.com/en-us/training/paths/create-extend-custom-copilots-microsoft-copilot-studio/",
    isOfficial: true,
    topics: ["copilot-studio", "agent-design", "topics"],
    skillLevels: ["Beginner", "Intermediate"],
    priority: "essential",
    access: "free",
    durationLabel: "4-7 hours",
    learningOptions: [
      { mode: "reading", contentType: "learning-path", title: "Create agents in Microsoft Copilot Studio", description: "Follow the official path for agent creation, topics, intelligent responses, testing, and publishing.", url: "https://learn.microsoft.com/en-us/training/paths/create-extend-custom-copilots-microsoft-copilot-studio/", provider: "Microsoft Learn", durationLabel: "3-5 hours", isOfficial: true, access: "free" },
      microsoftVideo("Create your first agent in Copilot Studio", "Watch a step-by-step Microsoft demonstration covering instructions, topics, generative answers, tools, publishing, and analytics.", "https://learn.microsoft.com/en-us/shows/mastering-copilot-studio/create-first-agent-copilot-studio"),
      microsoftPractice("Guided project: Create agents with Copilot Studio", "Complete the hands-on project for tables, topics, generative AI, and agent configuration.", "https://learn.microsoft.com/en-us/training/modules/create-bots-power-virtual-agents-copilot/"),
    ],
  }),
  resource({
    id: "mcc-knowledge",
    title: "Copilot Studio Knowledge and Grounding",
    provider: "Microsoft Learn",
    description: "Select, configure, evaluate, and govern approved knowledge sources for permission-aware, current, and evidence-based agent responses.",
    type: "documentation",
    canonicalUrl: "https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio",
    isOfficial: true,
    topics: ["knowledge", "grounding", "retrieval"],
    skillLevels: ["Intermediate"],
    priority: "essential",
    access: "free",
    durationLabel: "3-5 hours",
    learningOptions: [
      { mode: "reading", contentType: "documentation", title: "Study Copilot Studio knowledge sources", description: "Review supported source types, authentication, source descriptions, orchestration, and grounding boundaries.", url: "https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio", provider: "Microsoft Learn", durationLabel: "90 minutes", isOfficial: true, access: "free" },
      microsoftVideo("Mastering Copilot Studio: Knowledge and grounding", "Use the official series to watch practical knowledge, grounding, topic, and agent demonstrations.", "https://learn.microsoft.com/en-us/shows/mastering-copilot-studio/"),
      microsoftPractice("Build intelligent agents with knowledge", "Complete the knowledge-agent exercise and module assessment for sources, generative answers, and contextual responses.", "https://learn.microsoft.com/en-us/training/modules/copilot-studio-knowledge/"),
    ],
  }),
  resource({
    id: "mcc-actions",
    title: "Copilot Studio Tools, Agent Flows, and Business Actions",
    provider: "Microsoft Learn",
    description: "Design controlled tools and agent flows with connectors, inputs, outputs, validations, approvals, monitoring, and operational safeguards.",
    type: "documentation",
    canonicalUrl: "https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/tools-overview",
    isOfficial: true,
    topics: ["tools", "power-automate", "connectors"],
    skillLevels: ["Intermediate", "Advanced"],
    priority: "essential",
    access: "free",
    durationLabel: "4-7 hours",
    learningOptions: [
      { mode: "reading", contentType: "documentation", title: "Study tools for Copilot Studio agents", description: "Understand how the orchestrator selects tools and how tool descriptions, inputs, authentication, and outputs affect execution.", url: "https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/tools-overview", provider: "Microsoft Learn", durationLabel: "60-90 minutes", isOfficial: true, access: "free" },
      microsoftVideo("Mastering Copilot Studio: Triggers and actions", "Watch the official series for demonstrations of tools, triggers, actions, and real-world agent tasks.", "https://learn.microsoft.com/en-us/shows/mastering-copilot-studio/"),
      microsoftPractice("Automate workflows using agent flows", "Build and assess an agent flow with triggers, actions, connectors, control logic, and monitoring.", "https://learn.microsoft.com/en-us/training/modules/automate-workflows-agent-flows-copilot-studio/"),
    ],
  }),
  resource({
    id: "mcc-security",
    title: "Copilot Security, Governance, DLP, and Lifecycle Management",
    provider: "Microsoft Learn",
    description: "Apply identity, least privilege, data policies, environments, governance, responsible AI, auditability, and release controls to Copilot solutions.",
    type: "documentation",
    canonicalUrl: "https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-and-governance",
    isOfficial: true,
    topics: ["security", "governance", "dlp", "alm"],
    skillLevels: ["Intermediate", "Advanced"],
    priority: "essential",
    access: "free",
    durationLabel: "5-8 hours",
    learningOptions: [
      { mode: "reading", contentType: "documentation", title: "Study Copilot Studio security and governance", description: "Review data residency, DLP, administration, tenant controls, compliance, and secure operating practices.", url: "https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-and-governance", provider: "Microsoft Learn", durationLabel: "2 hours", isOfficial: true, access: "free" },
      microsoftVideo("Copilot Studio Agent Academy", "Watch Microsoft's agent-building course and identify security, data access, governance, and lifecycle decisions in each mission.", "https://learn.microsoft.com/en-us/shows/copilot-studio-agent-academy/"),
      microsoftPractice("Introduction to Power Platform security and governance", "Create an environment and work through DLP policy concepts using the official exercise and assessment.", "https://learn.microsoft.com/en-us/training/modules/security-governance-intro/"),
    ],
  }),
  resource({
    id: "mcc-analytics",
    title: "Copilot Studio Testing, Evaluation, Analytics, and Reliability",
    provider: "Microsoft Learn",
    description: "Create representative test cases, evaluate answer and action quality, inspect analytics, diagnose failures, and define production release criteria.",
    type: "documentation",
    canonicalUrl: "https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-overview",
    isOfficial: true,
    topics: ["testing", "evaluation", "analytics", "reliability"],
    skillLevels: ["Intermediate", "Advanced"],
    priority: "essential",
    access: "free",
    durationLabel: "4-7 hours",
    learningOptions: [
      { mode: "reading", contentType: "documentation", title: "Analyze agent performance in Copilot Studio", description: "Study usage, component, outcome, satisfaction, and operational analytics before defining monitoring and improvement routines.", url: "https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-overview", provider: "Microsoft Learn", durationLabel: "90 minutes", isOfficial: true, access: "free" },
      microsoftVideo("Create your first agent: Test, publish, and analyze", "Use Microsoft's step-by-step video to review testing, publication, and analytics in one complete workflow.", "https://learn.microsoft.com/en-us/shows/mastering-copilot-studio/create-first-agent-copilot-studio"),
      microsoftPractice("Get started with Copilot Studio", "Complete the official exercise, test the agent, publish it, analyze performance, and pass the module assessment.", "https://learn.microsoft.com/en-us/training/modules/power-virtual-agents-bots/"),
    ],
  }),
  resource({
    id: "mcc-adoption",
    title: "Microsoft 365 Copilot Adoption and Value Realization",
    provider: "Microsoft Adoption",
    description: "Design pilots, communications, champions, role-based skilling, support, feedback, usage measurement, outcome measurement, and scale decisions.",
    type: "learning-path",
    canonicalUrl: "https://adoption.microsoft.com/en-us/copilot/",
    isOfficial: true,
    topics: ["adoption", "change-management", "value-realization"],
    skillLevels: ["Intermediate"],
    priority: "essential",
    access: "free",
    durationLabel: "4-7 hours",
    learningOptions: [
      { mode: "reading", contentType: "adoption-guidance", title: "Use Microsoft Copilot adoption resources", description: "Review scenarios, enablement materials, rollout guidance, stakeholder assets, and adoption planning resources.", url: "https://adoption.microsoft.com/en-us/copilot/", provider: "Microsoft Adoption", durationLabel: "2-3 hours", isOfficial: true, access: "free" },
      microsoftVideo("Unlocking Copilot adoption", "Watch Microsoft's adoption discussion on change management, user enablement, and sustained technology adoption.", "https://learn.microsoft.com/en-us/shows/copilot-learning-hub/unlocking-copilot-adoption-strategies-for-successful-tech-integration"),
      microsoftPractice("Envision successful Microsoft 365 Copilot adoption", "Complete the official user-enablement module and assessment for readiness, stakeholder alignment, scenarios, and adoption foundations.", "https://learn.microsoft.com/en-us/training/modules/phase-one-envision/"),
    ],
  }),
  resource({
    id: "mcc-applied-skill",
    title: "Copilot Studio Capstone and Applied Skills Evidence",
    provider: "Microsoft Learn",
    description: "Integrate agent design, knowledge, tools, testing, publication, governance, and professional evidence into a defensible capstone and job-ready case study.",
    type: "certification",
    canonicalUrl: "https://learn.microsoft.com/en-us/credentials/applied-skills/build-an-agent-in-microsoft-copilot-studio/",
    isOfficial: true,
    topics: ["capstone", "applied-skills", "portfolio"],
    skillLevels: ["Intermediate", "Advanced"],
    priority: "essential",
    access: "free",
    durationLabel: "8-16 hours",
    learningOptions: [
      { mode: "reading", contentType: "credential-guide", title: "Review the Copilot Studio Applied Skills credential", description: "Map the assessed tasks, prerequisite knowledge, lab expectations, and evidence required for the applied assessment.", url: "https://learn.microsoft.com/en-us/credentials/applied-skills/build-an-agent-in-microsoft-copilot-studio/", provider: "Microsoft Learn", durationLabel: "60 minutes", isOfficial: true, access: "free" },
      microsoftVideo("Copilot Studio Agent Academy full course", "Review the official 11-part practical series before recording and defending your capstone demonstration.", "https://learn.microsoft.com/en-us/shows/copilot-studio-agent-academy/"),
      microsoftPractice("Build an agent in Microsoft Copilot Studio", "Complete the official applied assessment or reproduce its task pattern in a separate practice environment before publishing portfolio evidence.", "https://learn.microsoft.com/en-us/credentials/applied-skills/build-an-agent-in-microsoft-copilot-studio/"),
    ],
  }),
];
