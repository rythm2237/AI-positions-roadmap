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

const slug = "cloud-engineer";

type StageSpec = {
  title: string;
  landmark: string;
  type: CareerJourneyStage["type"];
  summary: string;
  explanation: string;
  lessons: string[];
  tasks: string[];
  topics: [string, string, string];
  minMinutes: number;
  maxMinutes: number;
};

function q(
  id: string,
  question: string,
  answers: string[],
  correctAnswerIndex: number,
  explanation: string,
  relatedTopic: string,
  difficulty: WorkspaceDifficulty = "Intermediate",
): CareerQuizQuestion {
  return {
    id,
    question,
    answers,
    correctAnswerIndex,
    explanation,
    difficulty,
    relatedTopic,
    questionType: question.toLowerCase().includes("scenario") ? "scenario" : "multiple-choice",
    status: "active",
    lastReviewedAt: "2026-08-03",
    version: 1,
  };
}

function questions(stage: number, topics: [string, string, string]): CareerQuizQuestion[] {
  const [a, b, c] = topics;
  return [
    q(`cloud-s${stage}-q1`, `Which artifact best demonstrates professional capability in ${a}?`, ["A service-name list", "A documented design with requirements, trade-offs, implementation evidence, tests, and ownership", "A copied reference diagram", "An unexplained screenshot"], 1, "Cloud engineering evidence must connect requirements, decisions, implementation, validation, and operations.", a),
    q(`cloud-s${stage}-q2`, `What is the strongest way to validate ${b}?`, ["Assume the managed service handles everything", "Use representative tests, telemetry, failure cases, and documented acceptance criteria", "Check only the happy path", "Rely on a certification badge"], 1, "Professional validation requires evidence under representative operating conditions.", b),
    q(`cloud-s${stage}-q3`, `Scenario: a design involving ${c} works in development but fails under production load. What should happen first?`, ["Increase every resource", "Inspect telemetry and reproduce the failure against defined workload and service objectives", "Change cloud providers", "Disable monitoring"], 1, "Diagnosis should begin with workload evidence, telemetry, and explicit objectives.", c),
    q(`cloud-s${stage}-q4`, `Which decision principle is most important when implementing ${a}?`, ["Maximum service count", "Least necessary complexity with explicit security, reliability, cost, and ownership", "Newest feature first", "No operational documentation"], 1, "Cloud systems should minimize unmanaged complexity while preserving required outcomes.", a),
    q(`cloud-s${stage}-q5`, `Why must ${b} include operational ownership?`, ["To make the diagram larger", "Because deployment without monitoring, response, recovery, and lifecycle ownership is incomplete", "To avoid automation", "To remove accountability"], 1, "Cloud engineering includes the full operating lifecycle, not only initial provisioning.", b),
  ];
}

function topicAssessment(stage: number, topic: string, bank: CareerQuizQuestion[]): CareerAssessment {
  return {
    id: `cloud-engineer-stage-${stage}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-assessment`,
    title: `${topic} knowledge check`,
    description: `Five Cloud Engineer questions covering decisions, implementation, validation, risk, and operations for ${topic}.`,
    passingScore: 60,
    assessmentType: "topic",
    topicId: `cloud-engineer-stage-${stage}-resource-requirement`,
    topicLabel: topic,
    durationMinutes: 12,
    questionsPerAttempt: 5,
    questions: bank,
  };
}

function comprehensive(stage: number, title: string, bank: CareerQuizQuestion[]): CareerAssessment {
  return {
    id: `cloud-engineer-stage-${stage}-comprehensive-assessment`,
    title: `${title} comprehensive assessment`,
    description: "A ten-question scenario checkpoint covering architecture, implementation, security, reliability, cost, and operational judgment.",
    passingScore: 70,
    assessmentType: "comprehensive",
    durationMinutes: 25,
    questionsPerAttempt: 10,
    questions: [...bank, ...bank.map((item, index) => ({ ...item, id: `${item.id}-advanced-${index + 1}`, question: `Applied scenario: ${item.question}`, difficulty: "Advanced" as WorkspaceDifficulty }))],
  };
}

const stageSpecs: StageSpec[] = [
  {
    title: "Cloud Engineering Orientation and Role Boundaries",
    landmark: "Cloud Operations Observatory",
    type: "orientation",
    summary: "Understand the Cloud Engineer profession, adjacent roles, employer expectations, evidence standards, and the multi-cloud service landscape.",
    explanation: "Separate Cloud Engineering from architecture-only, DevOps-only, platform-only, SRE-only, and security-only work. Build a role map that connects infrastructure decisions to delivery and operational ownership.",
    lessons: ["Cloud Engineer responsibilities and adjacent roles", "AWS, Azure, and Google Cloud service categories", "Evidence, labs, certifications, and production judgment"],
    tasks: ["Build a responsibility matrix for Cloud Engineer, Cloud Architect, DevOps Engineer, Platform Engineer, SRE, and Cloud Security Engineer.", "Translate ten Cloud Engineer vacancies into a capability and evidence matrix.", "Create a personal cloud lab and evidence plan without selecting learning-resource URLs."],
    topics: ["cloud role boundaries", "multi-cloud platform landscape", "professional evidence standards"],
    minMinutes: 330,
    maxMinutes: 540,
  },
  {
    title: "Cloud Foundations and Architecture Decisions",
    landmark: "Regional Architecture Control Room",
    type: "foundation",
    summary: "Build a durable mental model for cloud service models, regions, zones, shared responsibility, managed services, and architecture trade-offs.",
    explanation: "Move beyond memorizing product names. Learn to derive cloud decisions from workload requirements, failure domains, compliance, latency, data, operations, and cost constraints.",
    lessons: ["Service and deployment models", "Regions, zones, fault domains, and shared responsibility", "Architecture requirements, constraints, assumptions, and trade-offs"],
    tasks: ["Create a workload requirements template covering users, data, availability, latency, security, recovery, operations, and cost.", "Compare three hosting patterns for the same workload and document trade-offs.", "Design a region and availability-zone strategy with explicit failure assumptions."],
    topics: ["cloud architecture foundations", "failure domains and shared responsibility", "managed-service selection"],
    minMinutes: 480,
    maxMinutes: 780,
  },
  {
    title: "Identity, Networking, and Cloud Security Foundations",
    landmark: "Identity and Network Security Gateway",
    type: "core-skills",
    summary: "Design least-privilege identity, network boundaries, connectivity, DNS, secrets, encryption, and baseline security controls.",
    explanation: "Treat identity and networking as foundational architecture, not afterthoughts. Build secure access patterns for humans, workloads, services, administration, and hybrid connectivity.",
    lessons: ["Human and workload identity, roles, federation, and least privilege", "Addressing, subnets, routing, DNS, ingress, egress, and private connectivity", "Secrets, encryption, logging, segmentation, and security boundaries"],
    tasks: ["Design an identity model for administrators, engineers, applications, and automation.", "Create a segmented network architecture with public, private, data, and management paths.", "Produce a threat-informed baseline control and logging checklist."],
    topics: ["cloud identity and least privilege", "cloud networking and connectivity", "security controls and secrets"],
    minMinutes: 660,
    maxMinutes: 1080,
  },
  {
    title: "Compute, Storage, Databases, and Managed Services",
    landmark: "Cloud Service Selection Foundry",
    type: "core-skills",
    summary: "Select and integrate compute, storage, database, messaging, load-balancing, caching, and serverless services from workload evidence.",
    explanation: "Choose services by state, scale, latency, consistency, durability, recovery, control, portability, operational effort, and cost rather than preference or popularity.",
    lessons: ["Virtual machines, autoscaling, serverless, and managed compute", "Object, block, file, relational, NoSQL, cache, and analytics storage patterns", "Load balancing, asynchronous messaging, integration, and managed-service composition"],
    tasks: ["Create a compute decision matrix for three workload types.", "Design a storage and database architecture with backup, recovery, encryption, and lifecycle controls.", "Build a high-level application architecture using load balancing, caching, messaging, and managed services."],
    topics: ["compute pattern selection", "storage and database architecture", "managed-service integration"],
    minMinutes: 660,
    maxMinutes: 1140,
  },
  {
    title: "Infrastructure as Code and Delivery Automation",
    landmark: "Infrastructure Automation Factory",
    type: "tools",
    summary: "Build repeatable environments with infrastructure as code, validation, policy, secrets, state management, CI/CD, promotion, rollback, and drift control.",
    explanation: "Infrastructure automation is a software-delivery discipline. Design modular code, safe state, reviewable changes, tests, environment separation, policy gates, and recovery procedures.",
    lessons: ["Infrastructure modules, dependencies, variables, outputs, and state", "Validation, testing, policy, security scanning, and drift detection", "CI/CD, environment promotion, change control, rollback, and secrets"],
    tasks: ["Build a reusable infrastructure module contract and repository structure.", "Design a pipeline with formatting, validation, plan review, policy checks, approval, apply, and rollback.", "Create a drift-detection and state-recovery runbook."],
    topics: ["infrastructure as code", "cloud delivery automation", "state policy and drift controls"],
    minMinutes: 720,
    maxMinutes: 1260,
  },
  {
    title: "Containers and Cloud-Native Platforms",
    landmark: "Container Platform Operations Deck",
    type: "tools",
    summary: "Build and operate containerized workloads, registries, Kubernetes primitives, configuration, networking, autoscaling, upgrades, and platform controls.",
    explanation: "Use containers and orchestration only when their operational model fits. Learn image supply chains, workload identity, scheduling, service discovery, configuration, secrets, scaling, reliability, and cluster lifecycle.",
    lessons: ["Container images, registries, runtime security, and supply chain", "Kubernetes workloads, services, configuration, secrets, and networking", "Autoscaling, upgrades, policy, observability, and platform operations"],
    tasks: ["Containerize an application with a minimal, reproducible, non-root image and documented supply-chain controls.", "Design a Kubernetes deployment with services, configuration, secrets, health checks, scaling, and disruption controls.", "Compare VM, serverless, managed container, and Kubernetes options for a realistic workload."],
    topics: ["container engineering", "kubernetes workload design", "cloud-native platform operations"],
    minMinutes: 720,
    maxMinutes: 1320,
  },
  {
    title: "Observability, Reliability, Incident Response, and Recovery",
    landmark: "Reliability and Recovery Command Center",
    type: "core-skills",
    summary: "Operate cloud services with logs, metrics, traces, service objectives, alerting, incident response, capacity, backup, restore, failover, and disaster recovery.",
    explanation: "Reliability requires measurable objectives and tested recovery. Build telemetry, diagnose from evidence, control alert quality, manage incidents, and prove that backups and failover procedures work.",
    lessons: ["Logs, metrics, traces, dashboards, alerts, and service objectives", "Troubleshooting, capacity, performance, incidents, and post-incident learning", "Backup, restore, continuity, failover, and disaster recovery"],
    tasks: ["Define SLIs, SLOs, alerts, dashboards, and escalation for a cloud service.", "Run and document a latency or availability incident investigation.", "Design and test backup, restore, and regional recovery procedures against RTO and RPO targets."],
    topics: ["cloud observability and SRE", "incident diagnosis and response", "backup and disaster recovery"],
    minMinutes: 720,
    maxMinutes: 1200,
  },
  {
    title: "Governance, FinOps, and Platform Operations",
    landmark: "Cloud Governance and FinOps Council",
    type: "core-skills",
    summary: "Design scalable cloud governance, account structures, policy, ownership, compliance, support, lifecycle, cost allocation, forecasting, and optimization.",
    explanation: "Cloud engineering at scale is an operating model. Make ownership, guardrails, policy, support, change, risk, quotas, tagging, budgets, unit economics, and service lifecycle explicit.",
    lessons: ["Organizations, accounts, subscriptions, projects, policies, tags, and ownership", "FinOps allocation, budgets, forecasts, optimization, and unit economics", "Platform service model, support, lifecycle, compliance, and operational governance"],
    tasks: ["Design an account or subscription hierarchy with policy and ownership boundaries.", "Create a cost allocation, budget, anomaly, and optimization scorecard.", "Write a platform service offering with support, change, security, reliability, and lifecycle responsibilities."],
    topics: ["cloud governance and policy", "finops and cost management", "platform operating model"],
    minMinutes: 660,
    maxMinutes: 1140,
  },
  {
    title: "Production Cloud Platform Capstone",
    landmark: "Production Readiness Review Board",
    type: "projects",
    summary: "Deliver an end-to-end secure, automated, observable, resilient, and cost-aware cloud platform with production evidence.",
    explanation: "Integrate requirements, architecture, identity, networking, managed services, infrastructure as code, delivery, security, observability, recovery, governance, and operational handover.",
    lessons: ["End-to-end cloud platform architecture", "Implementation, validation, failure testing, and security review", "Operational handover, cost model, governance, and production-readiness defense"],
    tasks: ["Implement a secure multi-environment cloud platform using infrastructure as code.", "Run security, performance, reliability, recovery, and cost validation scenarios.", "Present the platform in a production-readiness review with architecture decisions, evidence, risks, and ownership."],
    topics: ["production cloud architecture", "cloud validation and failure testing", "operational handover and readiness"],
    minMinutes: 1260,
    maxMinutes: 2040,
  },
  {
    title: "Portfolio, Job Search, and Cloud Interviews",
    landmark: "Cloud Engineering Career Launchpad",
    type: "job-search",
    summary: "Convert technical work into credible portfolio evidence and target Cloud Engineer roles by platform, scope, seniority, and operating responsibility.",
    explanation: "Cloud titles are inconsistent. Map vacancies by responsibilities and prove architecture, implementation, automation, troubleshooting, security, reliability, cost, and communication with redacted evidence.",
    lessons: ["Cloud portfolio architecture and operations case studies", "Role-title, platform, scope, and evidence mapping", "Architecture, troubleshooting, IaC, security, reliability, and FinOps interviews"],
    tasks: ["Publish three redacted cloud case studies with requirements, decisions, implementation, tests, outcomes, and limitations.", "Build a 30-role vacancy matrix across Cloud Engineer, Infrastructure Engineer, Platform Engineer, and adjacent roles.", "Complete architecture and troubleshooting mock interviews and revise evidence gaps."],
    topics: ["cloud portfolio evidence", "cloud job market mapping", "cloud engineering interviews"],
    minMinutes: 540,
    maxMinutes: 900,
  },
];

const journeyStages: CareerJourneyStage[] = stageSpecs.map((spec, index) => {
  const layout = workspaceLayout.journeyStages[index] ?? workspaceLayout.journeyStages[0];
  const stage = index + 1;
  const bank = questions(stage, spec.topics);
  return {
    ...layout,
    id: `cloud-engineer-stage-${stage}`,
    order: stage,
    type: spec.type,
    title: spec.title,
    label: spec.title,
    landmark: spec.landmark,
    theme: spec.title,
    summary: spec.summary,
    explanation: spec.explanation,
    lessons: spec.lessons,
    resources: [],
    estimatedEffort: {
      minMinutes: spec.minMinutes,
      maxMinutes: spec.maxMinutes,
      breakdown: {
        resources: { minMinutes: 0, maxMinutes: 0 },
        activities: { minMinutes: spec.minMinutes - 60, maxMinutes: spec.maxMinutes - 90 },
        assessment: { minMinutes: 60, maxMinutes: 90 },
      },
    },
    tasks: spec.tasks.map((description, taskIndex) => ({
      id: `cloud-engineer-stage-${stage}-task-${taskIndex + 1}`,
      title: description,
      description,
      type: index === 8 ? "project" : index === 9 ? "job-search" : "lesson",
    })),
    topicAssessments: [topicAssessment(stage, spec.title, bank)],
    phaseExam: comprehensive(stage, spec.title, bank),
  };
});

const roadmapSpecs = [
  ["Cloud Foundations and Architecture", "Role boundaries", "Cloud models", "Regions and zones", "Shared responsibility", "Architecture decisions"],
  ["Identity, Networking, and Security", "IAM", "Network design", "DNS and connectivity", "Secrets and encryption", "Security controls"],
  ["Services and Workload Platforms", "Compute", "Storage", "Databases", "Managed integration", "Containers and Kubernetes"],
  ["Infrastructure Automation and Delivery", "Infrastructure as code", "State and modules", "Validation and policy", "CI/CD", "Drift and rollback"],
  ["Reliability, Governance, and FinOps", "Observability", "Incident response", "Backup and recovery", "Governance", "FinOps"],
  ["Capstone and Employment Readiness", "Production platform", "Validation", "Portfolio", "Job mapping", "Interviews"],
] as const;

const roadmap: CareerRoadmapPhase[] = workspaceLayout.roadmap.slice(0, 6).map((phase, index) => {
  const [title, ...sections] = roadmapSpecs[index];
  return {
    ...phase,
    id: `cloud-engineer-roadmap-${index + 1}`,
    phaseNumber: index + 1,
    title,
    goal: `Build and prove professional competence across ${sections.join(", ")}.`,
    sections: [...sections],
    mentorTip: "Make every cloud decision traceable to workload requirements, security, reliability, cost, evidence, and operational ownership.",
    practicalMissions: [`Produce a reviewable ${sections[0]} artifact.`, `Validate a realistic scenario covering ${sections.slice(1, 4).join(", ")}.`],
    expectedOutcome: `You can design, implement, validate, and defend work across ${title.toLowerCase()}.`,
    lessons: phase.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      id: `cloud-engineer-roadmap-${index + 1}-lesson-${lessonIndex + 1}`,
      title: `${sections[lessonIndex % sections.length]} applied practice`,
      summary: `Apply ${sections[lessonIndex % sections.length]} in a Cloud Engineer scenario.`,
      resources: [],
      mission: `Create evidence that demonstrates ${sections[lessonIndex % sections.length]}.`,
    })),
    quiz: { ...phase.quiz, id: `cloud-engineer-roadmap-${index + 1}-quiz`, phaseId: `cloud-engineer-roadmap-${index + 1}`, title: `${title} checkpoint`, officialPracticeLink: undefined },
  };
});

const career: CareerWorkspaceData = {
  ...workspaceLayout,
  slug,
  title: "Cloud Engineer",
  category: "AI Infrastructure & Security",
  visual: {
    nodeLabel: "Cloud Engineer",
    sceneTitle: "Cloud Infrastructure and Platform Operations Center",
    sceneDescription: "A production cloud environment connecting identity, networks, compute, storage, managed services, infrastructure as code, containers, observability, security, recovery, governance, and cost.",
    imageAlt: "Cloud Engineer workspace showing secure cloud architecture, automation, observability, reliability, governance, and platform operations.",
  },
  shortDescription: "Design, build, secure, automate, observe, recover, govern, and optimize cloud infrastructure and platform services for reliable digital, data, and AI-enabled workloads.",
  difficulty: "Intermediate",
  estimatedLearningTime: "9-13 months part-time before resource curation; practical workload varies by prior systems experience",
  salary: "Varies by country, platform, seniority, on-call scope, security responsibility, and industry",
  hiringDemand: "Strong across cloud-native organizations, enterprise modernization, platform teams, consulting, managed services, data platforms, and AI infrastructure",
  remoteAvailability: "Medium to High; some roles require regulated access, on-call response, or hybrid infrastructure work",
  aiCompatibilityScore: "93%",
  bestFor: ["Systems thinkers", "People who enjoy automation and operational ownership", "Developers or administrators moving into cloud infrastructure", "Risk-aware technical problem solvers", "Engineers comfortable learning across architecture and operations"],
  programmingRequirement: "Moderate: shell, Python or another scripting language, infrastructure as code, YAML, APIs, Git, and automation",
  mathRequirement: "Low to Moderate: capacity, availability, latency, throughput, probability, cost, and unit-economics reasoning",
  creativityLevel: "High",
  communicationLevel: "High",
  lastUpdated: "2026-08-03",
  metrics: [
    { label: "Primary outcome", value: "Reliable cloud platforms", detail: "Infrastructure supports workload, security, recovery, and operational requirements." },
    { label: "Delivery model", value: "Automated and reviewable", detail: "Environments are repeatable through code, validation, policy, and controlled delivery." },
    { label: "Operating standard", value: "Observable and recoverable", detail: "Services have telemetry, objectives, incident response, backup, and tested recovery." },
    { label: "Decision discipline", value: "Security, reliability, cost", detail: "Trade-offs and ownership remain explicit throughout the lifecycle." },
  ],
  overview: {
    title: "What does a Cloud Engineer do?",
    body: "A Cloud Engineer designs, builds, secures, automates, operates, and improves cloud infrastructure and platform services. The role connects identity, networking, compute, storage, databases, managed services, infrastructure as code, containers, delivery pipelines, observability, incident response, backup, disaster recovery, governance, and FinOps. Unlike an architecture-only role, the Cloud Engineer is expected to produce working, tested, supportable systems and operational evidence.",
    responsibilities: ["Translate workload and business requirements into cloud infrastructure decisions", "Design account, identity, network, security, and governance foundations", "Provision compute, storage, database, messaging, and managed platform services", "Build repeatable environments with infrastructure as code and delivery pipelines", "Operate containers and cloud-native workload platforms", "Implement observability, service objectives, incident response, backup, and recovery", "Manage policy, compliance, cost allocation, optimization, and lifecycle controls", "Document architecture, runbooks, risks, ownership, and production-readiness evidence"],
    industries: ["Technology and SaaS", "Financial services", "Retail and e-commerce", "Healthcare", "Manufacturing", "Media and telecommunications", "Public sector", "Cloud consulting and managed services", "Data and AI platforms"],
  },
  journeyMap: {
    ...workspaceLayout.journeyMap,
    theme: "future-space-colony",
    overviewTitle: "Cloud Engineer Production Journey",
    overviewDescription: "Ten dedicated stages from role orientation and cloud foundations through secure infrastructure, automation, cloud-native platforms, reliability, governance, capstone delivery, portfolio, and employment readiness.",
  },
  journeyStages,
  roadmap,
  globalResources: [],
  projects: [
    { id: "cloud-engineer-project-landing-zone", title: "Secure Cloud Landing Zone", difficulty: "Intermediate", estimatedTime: "35-55 hours", phaseId: "cloud-engineer-roadmap-2", description: "Design and implement a governed cloud foundation with organization structure, identity, networking, logging, policy, budgets, and baseline security controls.", deliverables: ["Requirements and responsibility model", "Account or subscription architecture", "Identity and network design", "Policy, logging, and budget controls", "Validation and handover report"], skills: ["Cloud architecture", "IAM", "Networking", "Security", "Governance"] },
    { id: "cloud-engineer-project-iac", title: "Multi-Environment Infrastructure-as-Code Platform", difficulty: "Intermediate", estimatedTime: "45-70 hours", phaseId: "cloud-engineer-roadmap-4", description: "Build a reusable infrastructure codebase and controlled pipeline for development, test, and production environments.", deliverables: ["Module architecture", "Environment and state strategy", "Validation and policy pipeline", "Secrets and approval design", "Drift and rollback runbook"], skills: ["Infrastructure as code", "Git", "CI/CD", "Policy", "Automation"] },
    { id: "cloud-engineer-project-reliable-workload", title: "Reliable Cloud-Native Workload", difficulty: "Advanced", estimatedTime: "55-85 hours", phaseId: "cloud-engineer-roadmap-5", description: "Deploy and operate a containerized or managed workload with secure connectivity, autoscaling, observability, service objectives, backup, and failure recovery.", deliverables: ["Workload architecture", "Deployment automation", "Telemetry and SLO package", "Failure and recovery tests", "Incident and operations runbook"], skills: ["Containers", "Cloud services", "Observability", "SRE", "Disaster recovery"] },
    { id: "cloud-engineer-project-capstone", title: "Production Cloud Platform Capstone", difficulty: "Advanced", estimatedTime: "80-120 hours", phaseId: "cloud-engineer-roadmap-6", description: "Deliver a secure, automated, observable, resilient, governed, and cost-aware platform and defend it in a production-readiness review.", deliverables: ["Executive and workload requirements", "Architecture and infrastructure code", "Security and governance controls", "Validation and failure-test report", "Cost model and optimization plan", "Operational handover and case study"], skills: ["Architecture", "IaC", "Security", "Reliability", "FinOps", "Operations"] },
  ],
  finalChallenge: {
    title: "Cloud Platform Production Readiness Review",
    description: "Present and defend a production-style cloud platform before a simulated engineering, security, operations, finance, compliance, and business review panel.",
    requirements: ["Traceable workload and service requirements", "Secure identity, networking, data, and platform architecture", "Repeatable infrastructure and delivery automation", "Representative security, performance, resilience, and recovery tests", "Observability, incident response, and operational ownership", "Governance, compliance, lifecycle, and cost controls"],
    deliverables: ["Executive summary", "Architecture decision package", "Infrastructure code and pipeline evidence", "Validation and failure-test report", "Risk, governance, and cost register", "Operations runbook", "Portfolio case study"],
    evaluation: ["Architecture judgment", "Implementation quality", "Security", "Reliability and recovery", "Automation", "Operational practicality", "Cost and governance", "Communication"],
  },
  relatedCareers: ["Platform Engineer", "DevOps Engineer", "Site Reliability Engineer", "Cloud Security Engineer", "Cloud Solutions Architect", "Infrastructure Engineer"],
  portfolioTasks: [
    { id: "cloud-engineer-portfolio-landing-zone", title: "Publish a cloud foundation case study", description: "Show requirements, organization model, IAM, networking, policy, security, logging, budgets, tests, and ownership with sensitive details removed.", type: "portfolio" },
    { id: "cloud-engineer-portfolio-iac", title: "Publish an infrastructure-as-code repository", description: "Show module design, environment separation, validation, policy, state controls, CI/CD, drift handling, and rollback evidence.", type: "portfolio" },
    { id: "cloud-engineer-portfolio-reliability", title: "Publish a reliability and recovery case study", description: "Show service objectives, telemetry, incident analysis, backup, restore, failure testing, recovery decisions, and limitations.", type: "portfolio" },
    { id: "cloud-engineer-portfolio-review", title: "Record a production-readiness defense", description: "Explain requirements, architecture, automation, security, reliability, cost, risks, and ownership in a concise technical presentation.", type: "portfolio" },
  ],
  jobSearchTasks: [
    { id: "cloud-engineer-job-matrix", title: "Build a Cloud Engineer responsibility matrix", description: "Compare Cloud Engineer, Infrastructure Engineer, Platform Engineer, DevOps Engineer, SRE, and cloud operations vacancies by actual responsibility and seniority.", type: "job-search" },
    { id: "cloud-engineer-job-evidence", title: "Map each vacancy to technical evidence", description: "Connect IAM, networking, services, IaC, containers, observability, reliability, security, governance, and FinOps requirements to portfolio artifacts.", type: "job-search" },
    { id: "cloud-engineer-job-cycle", title: "Run a targeted cloud application cycle", description: "Apply to roles matching platform and operating scope, track evidence gaps, and revise the portfolio from interview feedback.", type: "job-search" },
  ],
  interviewPrep: {
    title: "Cloud Engineer Interview Preparation",
    practiceAreas: ["Cloud architecture and service selection", "Identity and least privilege", "Networking, DNS, routing, and private connectivity", "Compute, storage, and databases", "Infrastructure as code and delivery automation", "Containers and Kubernetes", "Observability, troubleshooting, and incident response", "Backup, disaster recovery, governance, security, and FinOps"],
    questions: ["Design a secure cloud environment for a public application with private data services.", "How would you structure organizations, accounts, subscriptions, or projects for multiple teams and environments?", "Explain public and private subnets, routing, NAT, DNS, load balancing, and private endpoints.", "How do you design least-privilege access for humans, workloads, and CI/CD?", "How do you manage infrastructure state, modules, secrets, drift, and rollback safely?", "When would you choose virtual machines, serverless, managed containers, or Kubernetes?", "How would you diagnose intermittent latency when infrastructure metrics look normal?", "Design backup and disaster recovery for a critical stateful service with defined RTO and RPO.", "How would you reduce cloud cost without weakening reliability or security?", "Walk through a cloud incident and explain what evidence you would preserve for the post-incident review."],
  },
};

export const cloudEngineerCareer = applyCareerTitleAliasPolicy(career);
