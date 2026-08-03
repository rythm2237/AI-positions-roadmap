import type { ResourceRequirement } from "@/types/resourceRequirement";

const careerSlug = "cloud-engineer";

function requirement(
  stage: number,
  topic: string,
  outcomes: string[],
  skillLevel: "Beginner" | "Intermediate" | "Advanced",
  minMinutes: number,
  maxMinutes: number,
  preferredProviders: string[] = [],
): ResourceRequirement {
  return {
    id: `cloud-engineer-stage-${stage}-resource-requirement`,
    careerSlug,
    milestoneId: `cloud-engineer-stage-${stage}`,
    topic,
    requiredModes: ["reading", "video", "practice"],
    requiredLearningOutcomes: outcomes,
    skillLevel,
    allowedContentTypes: [
      "documentation",
      "guided-module",
      "video-series",
      "interactive-lab",
      "sandbox",
      "reference-architecture",
    ],
    preferredProviders,
    officialPreferred: true,
    freePreferred: true,
    estimatedDuration: { minMinutes, maxMinutes },
    resourceIds: [],
  };
}

export const CLOUD_ENGINEER_RESOURCE_REQUIREMENTS: ResourceRequirement[] = [
  requirement(1, "Cloud engineering role, operating model, and platform landscape", [
    "Explain how Cloud Engineer responsibilities differ from Cloud Architect, DevOps Engineer, Platform Engineer, SRE, and Cloud Security Engineer",
    "Compare AWS, Azure, and Google Cloud service categories without treating service names as architecture",
    "Translate a vacancy into a capability and evidence matrix",
  ], "Beginner", 150, 270, ["AWS", "Microsoft Learn", "Google Cloud"]),
  requirement(2, "Cloud foundations, regions, availability, shared responsibility, and architecture decisions", [
    "Explain service, deployment, region, zone, and shared-responsibility models",
    "Select suitable managed-service and hosting patterns from workload requirements",
    "Document assumptions, constraints, failure domains, and trade-offs",
  ], "Beginner", 240, 420, ["AWS", "Microsoft Learn", "Google Cloud"]),
  requirement(3, "Identity, networking, secrets, and cloud security foundations", [
    "Design least-privilege human and workload identity access",
    "Design address spaces, subnets, routing, DNS, ingress, egress, and private connectivity",
    "Define secrets, encryption, logging, and security-boundary controls",
  ], "Intermediate", 360, 600, ["AWS", "Microsoft Learn", "Google Cloud", "Cloud Security Alliance"]),
  requirement(4, "Compute, storage, databases, load balancing, and serverless service selection", [
    "Choose compute patterns from scaling, state, latency, control, and operational requirements",
    "Choose storage and database patterns from consistency, access, durability, recovery, and cost needs",
    "Design load balancing, caching, asynchronous processing, and managed-service integration",
  ], "Intermediate", 360, 660, ["AWS", "Microsoft Learn", "Google Cloud"]),
  requirement(5, "Infrastructure as code, configuration, CI/CD, and environment automation", [
    "Build reusable infrastructure modules with explicit inputs, outputs, dependencies, and state controls",
    "Design validation, policy, secrets, promotion, rollback, and drift-detection workflows",
    "Operate separate environments without copy-paste infrastructure",
  ], "Intermediate", 420, 720, ["HashiCorp", "GitHub", "AWS", "Microsoft Learn", "Google Cloud"]),
  requirement(6, "Containers, Kubernetes, registries, and cloud-native workload platforms", [
    "Build and secure container images and registries",
    "Design Kubernetes workloads, services, configuration, secrets, autoscaling, and upgrades",
    "Choose between containers, Kubernetes, serverless, and virtual machines using operational evidence",
  ], "Intermediate", 420, 780, ["Kubernetes", "Docker", "AWS", "Microsoft Learn", "Google Cloud"]),
  requirement(7, "Observability, SRE, incident response, backup, and disaster recovery", [
    "Define service indicators, objectives, alerts, dashboards, logs, metrics, and traces",
    "Diagnose failures using evidence rather than platform guesswork",
    "Design tested backup, restore, failover, continuity, and incident runbooks",
  ], "Advanced", 420, 720, ["Google SRE", "OpenTelemetry", "AWS", "Microsoft Learn", "Google Cloud"]),
  requirement(8, "Governance, platform operations, policy, compliance, and FinOps", [
    "Design account, subscription, project, tagging, policy, quota, and ownership controls",
    "Create cost allocation, budgeting, forecasting, optimization, and unit-economics practices",
    "Design a platform service model with support, change, risk, and lifecycle ownership",
  ], "Advanced", 360, 660, ["FinOps Foundation", "AWS", "Microsoft Learn", "Google Cloud"]),
  requirement(9, "Production cloud platform capstone", [
    "Integrate architecture, identity, networking, IaC, deployment, security, observability, resilience, and cost controls",
    "Test representative failures, recovery procedures, and operational ownership",
    "Present technical and business decisions in a production-readiness review",
  ], "Advanced", 600, 960, ["AWS", "Microsoft Learn", "Google Cloud", "HashiCorp", "Kubernetes"]),
  requirement(10, "Cloud engineering portfolio, job search, and interviews", [
    "Convert cloud work into redacted architecture and operations case studies",
    "Map job requirements to specific technical evidence",
    "Defend architecture, troubleshooting, automation, security, reliability, and cost decisions in interviews",
  ], "Intermediate", 240, 420, ["AWS", "Microsoft Learn", "Google Cloud"]),
];
