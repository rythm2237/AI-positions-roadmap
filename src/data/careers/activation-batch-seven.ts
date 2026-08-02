import { aiProductManagerCareer } from "@/data/careers/ai-product-manager";
import { applyCareerTitleAliasPolicy } from "@/data/careerTitleAliases";
import type {
  CareerJourneyStage,
  CareerRoadmapPhase,
  CareerWorkspaceData,
} from "@/types/careerWorkspace";

type CareerSpec = {
  slug: string;
  title: string;
  shortDescription: string;
  sceneTitle: string;
  sceneDescription: string;
  overview: string;
  responsibilities: string[];
  industries: string[];
  stages: string[];
  roadmap: string[][];
  projects: Array<{ title: string; description: string; skills: string[] }>;
  portfolio: string[];
  jobs: string[];
  interviewAreas: string[];
  interviewQuestions: string[];
  related: string[];
  difficulty: string;
  learningTime: string;
  programmingRequirement: string;
  mathRequirement: string;
};

function buildCareer(spec: CareerSpec): CareerWorkspaceData {
  const base = aiProductManagerCareer;

  const journeyStages: CareerJourneyStage[] = base.journeyStages.map((stage, index) => {
    const title = spec.stages[index] ?? spec.stages[spec.stages.length - 1];
    const lessons = [
      `${title} foundations`,
      `${title} applied practice`,
      `${title} validation, risk, and operations`,
    ];

    return {
      ...stage,
      id: `${spec.slug}-stage-${index + 1}`,
      title,
      label: title,
      landmark: title,
      theme: `Build practical evidence for ${title.toLowerCase()}.`,
      summary: `Develop professional capability in ${title.toLowerCase()} for the ${spec.title} role.`,
      explanation: `This stage converts ${title.toLowerCase()} into reviewable architecture, investigations, configurations, tests, controls, measurements, and operational evidence.`,
      lessons,
      tasks: [1, 2, 3].map((number) => ({
        id: `${spec.slug}-stage-${index + 1}-task-${number}`,
        title: `${title} practical mission ${number}`,
        description: `Create a reviewable artifact demonstrating ${title.toLowerCase()} in a realistic ${spec.title} scenario.`,
        type: index >= 8 ? "career" : index === 7 ? "project" : "lesson",
      })),
      topicAssessments: stage.topicAssessments?.map((assessment, assessmentIndex) => ({
        ...assessment,
        id: `${spec.slug}-stage-${index + 1}-topic-${assessmentIndex + 1}`,
        title: `${lessons[assessmentIndex % lessons.length]} knowledge check`,
        topicLabel: lessons[assessmentIndex % lessons.length],
      })),
      phaseExam: stage.phaseExam
        ? {
            ...stage.phaseExam,
            id: `${spec.slug}-stage-${index + 1}-comprehensive`,
            title: `${title} comprehensive assessment`,
            description: `A 20-question scenario assessment covering ${lessons.join(", ")}.`,
          }
        : undefined,
    };
  });

  const roadmap: CareerRoadmapPhase[] = base.roadmap.map((phase, index) => {
    const sections = spec.roadmap[index] ?? spec.roadmap[spec.roadmap.length - 1];
    return {
      ...phase,
      id: `${spec.slug}-roadmap-${index + 1}`,
      phaseNumber: index + 1,
      title: sections[0],
      goal: `Build practical competence across ${sections.join(", ")}.`,
      sections,
      mentorTip:
        "Keep every decision traceable to threat or service requirements, architecture constraints, evidence, measurable outcomes, and operational ownership.",
      practicalMissions: [
        `Complete one applied mission for ${sections[1] ?? sections[0]}.`,
        `Produce reviewable evidence covering ${sections.slice(2, 5).join(", ")}.`,
      ],
      expectedOutcome: `You can demonstrate and defend work across ${sections.join(", ")}.`,
      quiz: {
        ...phase.quiz,
        id: `${spec.slug}-roadmap-${index + 1}-quiz`,
        phaseId: `${spec.slug}-roadmap-${index + 1}`,
        title: `${sections[0]} checkpoint`,
      },
      lessons: phase.lessons.map((lesson, lessonIndex) => ({
        ...lesson,
        id: `${spec.slug}-roadmap-${index + 1}-lesson-${lessonIndex + 1}`,
        title: `${sections[lessonIndex % sections.length]} practice`,
        summary: `Apply ${sections[lessonIndex % sections.length]} in a ${spec.title} scenario.`,
        mission: `Create and review a professional artifact demonstrating ${sections[lessonIndex % sections.length]}.`,
      })),
    };
  });

  const career: CareerWorkspaceData = {
    ...base,
    slug: spec.slug,
    title: spec.title,
    category: "AI Infrastructure & Security",
    visual: {
      nodeLabel: spec.title,
      sceneTitle: spec.sceneTitle,
      sceneDescription: spec.sceneDescription,
      imageAlt: `${spec.title} professional workspace and career journey.`,
    },
    shortDescription: spec.shortDescription,
    difficulty: spec.difficulty,
    estimatedLearningTime: spec.learningTime,
    salary: "Varies by country, seniority, certification, platform scope, and industry",
    hiringDemand:
      "Strong across organizations operating cloud services, regulated systems, digital products, and AI-enabled infrastructure",
    remoteAvailability: "Medium to High depending on incident, access, and infrastructure responsibilities",
    aiCompatibilityScore: "93%",
    bestFor: [
      "Systems thinkers",
      "Risk-aware problem solvers",
      "People who enjoy investigation and operational ownership",
      "Technical professionals building reliable digital systems",
    ],
    programmingRequirement: spec.programmingRequirement,
    mathRequirement: spec.mathRequirement,
    creativityLevel: "High",
    communicationLevel: "High",
    lastUpdated: "2026-08-01",
    metrics: [
      { label: "Primary outcome", value: "Secure and reliable systems", detail: "Controls and infrastructure must support measurable business operations." },
      { label: "Evidence standard", value: "Tested operational artifacts", detail: "Architecture, detections, controls, incidents, and recovery remain inspectable." },
      { label: "Operating focus", value: "Continuous lifecycle", detail: "Design, deployment, monitoring, response, recovery, and improvement." },
      { label: "Professional standard", value: "Least privilege and resilience", detail: "Risk, ownership, security, cost, and service quality are explicit." },
    ],
    overview: {
      title: `What does a ${spec.title} do?`,
      body: spec.overview,
      responsibilities: spec.responsibilities,
      industries: spec.industries,
    },
    journeyMap: {
      ...base.journeyMap,
      overviewTitle: `${spec.title} Career Journey`,
      overviewDescription: spec.shortDescription,
    },
    journeyStages,
    roadmap,
    projects: spec.projects.map((project, index) => ({
      id: `${spec.slug}-project-${index + 1}`,
      title: project.title,
      difficulty: index >= 2 ? "Advanced" : "Intermediate",
      estimatedTime: index >= 2 ? "50-80 hours" : "25-45 hours",
      phaseId: `${spec.slug}-roadmap-${Math.min(index + 2, 5)}`,
      description: project.description,
      deliverables: [
        "Requirements and architecture brief",
        "Working configuration or investigation",
        "Validation and failure tests",
        "Monitoring or response plan",
        "Portfolio case study",
      ],
      skills: project.skills,
    })),
    finalChallenge: {
      title: `${spec.title} Production Readiness Review`,
      description: `Present and defend an end-to-end ${spec.title} engagement before a simulated engineering, security, operations, and business review panel.`,
      requirements: [
        "Evidence-based requirements and risk model",
        "Clear architecture or investigation method",
        "Security, reliability, and governance controls",
        "Representative tests and failure scenarios",
        "Monitoring, response, and recovery",
        "Operational ownership and measurable outcomes",
      ],
      deliverables: [
        "Executive summary",
        "Architecture or investigation package",
        "Validation report",
        "Risk and control register",
        "Operations or incident runbook",
        "Portfolio case study",
      ],
      evaluation: [
        "Technical judgment",
        "Security and reliability",
        "Evidence quality",
        "Operational practicality",
        "Risk management",
        "Communication",
      ],
    },
    relatedCareers: spec.related,
    portfolioTasks: spec.portfolio.map((title, index) => ({
      id: `${spec.slug}-portfolio-${index + 1}`,
      title,
      description:
        "Publish a concise case study with context, architecture or investigation, decisions, tests, controls, outcomes, limitations, and next steps.",
      type: "portfolio",
    })),
    jobSearchTasks: spec.jobs.map((title, index) => ({
      id: `${spec.slug}-job-${index + 1}`,
      title,
      description: `Use role-title mapping and evidence matching to target relevant ${spec.title} vacancies.`,
      type: "job-search",
    })),
    interviewPrep: {
      title: `${spec.title} Interview Preparation`,
      practiceAreas: spec.interviewAreas,
      questions: spec.interviewQuestions,
    },
  };

  return applyCareerTitleAliasPolicy(career);
}

export const cybersecurityAnalystCareer = buildCareer({
  slug: "cybersecurity-analyst",
  title: "Cybersecurity Analyst",
  shortDescription:
    "Monitor, investigate, contain, and reduce cyber risk through security operations, detection engineering, incident response, vulnerability management, identity, cloud security, and governance.",
  sceneTitle: "Security Operations and Threat Defense Center",
  sceneDescription:
    "A defensive security environment connecting telemetry, SIEM, detections, investigations, identity, vulnerabilities, cloud controls, incidents, and recovery.",
  overview:
    "A Cybersecurity Analyst protects systems, identities, data, and business operations. The role combines security monitoring, log analysis, detection, threat intelligence, incident response, vulnerability management, identity security, endpoint and network defense, cloud security, risk communication, and continuous improvement.",
  responsibilities: [
    "Monitor security events and alerts",
    "Investigate suspicious activity and incidents",
    "Create and tune detection rules",
    "Contain threats and coordinate response",
    "Analyze vulnerabilities and remediation priorities",
    "Review identity, endpoint, network, and cloud controls",
    "Document evidence, timelines, and lessons learned",
    "Communicate risk and improve defensive operations",
  ],
  industries: [
    "Financial services",
    "Healthcare",
    "Retail",
    "Technology",
    "Manufacturing",
    "Public sector",
    "Critical infrastructure",
    "Consulting and managed security services",
  ],
  stages: [
    "Cybersecurity Role Orientation",
    "Security Foundations and Threat Landscape",
    "Networking, Systems, and Identity",
    "Security Monitoring and SIEM",
    "Detection Engineering and Threat Hunting",
    "Incident Response and Digital Evidence",
    "Vulnerability, Cloud, and Endpoint Security",
    "Governance, Risk, and Security Operations",
    "Cybersecurity Analyst Capstone",
    "Job Search and Security Interviews",
  ],
  roadmap: [
    ["Security Foundations", "CIA triad", "Threat actors", "Attack lifecycle", "Risk", "Security controls"],
    ["Systems and Identity", "Networking", "Windows and Linux", "IAM", "Authentication", "Least privilege"],
    ["Security Operations", "Logs", "SIEM", "Alert triage", "Case management", "Threat intelligence"],
    ["Detection and Response", "Detection rules", "MITRE ATT&CK", "Threat hunting", "Incident response", "Forensics"],
    ["Security Programs", "Vulnerabilities", "Cloud security", "Endpoint security", "Governance", "Capstone"],
    ["Employment Readiness", "Labs", "Portfolio", "Role mapping", "Scenario interviews", "Applications"],
  ],
  projects: [
    {
      title: "Security Monitoring and SIEM Detection Lab",
      description:
        "Ingest representative logs, create detections, tune false positives, investigate alerts, and document response decisions.",
      skills: ["SIEM", "Log analysis", "Detection", "Alert triage"],
    },
    {
      title: "Incident Investigation and Response Case",
      description:
        "Reconstruct a simulated compromise, create a timeline, identify root cause, contain the threat, and produce an incident report.",
      skills: ["Incident response", "Evidence", "Threat analysis", "Communication"],
    },
    {
      title: "Vulnerability and Identity Risk Program",
      description:
        "Prioritize vulnerabilities and identity risks using exploitability, exposure, business impact, ownership, and remediation evidence.",
      skills: ["Vulnerability management", "IAM", "Risk", "Remediation"],
    },
    {
      title: "Cyber Defense Operations Capstone",
      description:
        "Deliver a production-style defensive security program covering telemetry, detections, incident response, cloud controls, reporting, and improvement.",
      skills: ["SOC", "Detection engineering", "Cloud security", "Governance", "Operations"],
    },
  ],
  portfolio: [
    "Publish a SIEM detection and investigation case study",
    "Publish an incident-response report and timeline",
    "Publish a vulnerability and security-control improvement plan",
  ],
  jobs: [
    "Build a cybersecurity analyst title matrix",
    "Map SOC, SIEM, incident, identity, and cloud evidence",
    "Run a targeted security application cycle",
  ],
  interviewAreas: [
    "Networking and operating systems",
    "SIEM and log analysis",
    "Detection engineering",
    "Incident response",
    "Threat intelligence",
    "Identity security",
    "Vulnerability management",
    "Cloud security",
  ],
  interviewQuestions: [
    "How would you investigate an impossible-travel alert?",
    "What logs would you use to investigate suspicious PowerShell activity?",
    "How do you tune a noisy detection without hiding real attacks?",
    "Walk through the incident-response lifecycle.",
    "How would you prioritize vulnerabilities across hundreds of assets?",
    "Explain authentication, authorization, and least privilege.",
    "How would you investigate a compromised cloud account?",
    "How do you communicate technical security risk to a business owner?",
  ],
  related: [
    "Security Operations Analyst",
    "SOC Analyst",
    "Cloud Security Analyst",
    "Incident Response Analyst",
    "DevSecOps Engineer",
  ],
  difficulty: "Intermediate",
  learningTime: "8-12 months part-time",
  programmingRequirement:
    "Low to Moderate: shell, PowerShell or Python, query languages, log parsing, and automation",
  mathRequirement: "Low to Moderate: risk scoring, baselines, rates, and analytical reasoning",
});

export const cloudEngineerCareer = buildCareer({
  slug: "cloud-engineer",
  title: "Cloud Engineer",
  shortDescription:
    "Design, build, secure, automate, monitor, and optimize cloud infrastructure and platform services for reliable digital and AI-enabled workloads.",
  sceneTitle: "Cloud Infrastructure and Platform Operations Center",
  sceneDescription:
    "A cloud environment connecting identity, networks, compute, storage, containers, infrastructure as code, observability, security, reliability, and cost management.",
  overview:
    "A Cloud Engineer builds and operates cloud infrastructure that applications, data platforms, and AI services depend on. The role combines cloud architecture, identity, networking, compute, storage, databases, containers, infrastructure as code, automation, observability, security, reliability, disaster recovery, governance, and cost optimization.",
  responsibilities: [
    "Design cloud environments and landing zones",
    "Configure identity, access, and network controls",
    "Provision compute, storage, databases, and platform services",
    "Automate infrastructure with code and pipelines",
    "Operate containers and cloud-native workloads",
    "Implement monitoring, backup, recovery, and scaling",
    "Secure and govern cloud resources",
    "Optimize performance, reliability, and cost",
  ],
  industries: [
    "Technology",
    "Financial services",
    "Retail",
    "Healthcare",
    "Manufacturing",
    "Media",
    "Public sector",
    "Cloud consulting and managed services",
  ],
  stages: [
    "Cloud Engineering Orientation",
    "Cloud Foundations and Shared Responsibility",
    "Identity, Networking, and Security",
    "Compute, Storage, and Managed Services",
    "Infrastructure as Code and Automation",
    "Containers and Cloud-Native Platforms",
    "Observability, Reliability, and Recovery",
    "Governance, FinOps, and Platform Operations",
    "Cloud Engineering Capstone",
    "Job Search and Cloud Interviews",
  ],
  roadmap: [
    ["Cloud Foundations", "Service models", "Regions", "Shared responsibility", "Architecture", "Command line"],
    ["Identity and Networking", "IAM", "VPC or VNet", "Subnets", "DNS", "Security groups"],
    ["Cloud Services", "Compute", "Storage", "Databases", "Load balancing", "Serverless"],
    ["Automation and Platforms", "Terraform", "CI/CD", "Containers", "Kubernetes", "Configuration management"],
    ["Operations and Governance", "Monitoring", "SLOs", "Backup", "Disaster recovery", "FinOps"],
    ["Employment Readiness", "Certifications", "Architecture labs", "Portfolio", "Interviews", "Applications"],
  ],
  projects: [
    {
      title: "Secure Cloud Landing Zone",
      description:
        "Design and implement accounts or subscriptions, identity, networking, logging, policy, budgets, and baseline security controls.",
      skills: ["Cloud architecture", "IAM", "Networking", "Governance"],
    },
    {
      title: "Infrastructure-as-Code Application Environment",
      description:
        "Provision a repeatable multi-environment application stack with Terraform, secrets, state controls, validation, and CI/CD.",
      skills: ["Terraform", "Automation", "CI/CD", "Cloud services"],
    },
    {
      title: "Reliable Containerized Workload Platform",
      description:
        "Deploy a containerized service with autoscaling, observability, secure networking, backup, and failure recovery.",
      skills: ["Containers", "Kubernetes", "Observability", "Reliability"],
    },
    {
      title: "Production Cloud Platform Capstone",
      description:
        "Deliver a secure, observable, resilient, cost-aware cloud platform with architecture, automation, operations, and handover evidence.",
      skills: ["Architecture", "IaC", "Security", "SRE", "FinOps"],
    },
  ],
  portfolio: [
    "Publish a cloud landing-zone architecture case study",
    "Publish an infrastructure-as-code repository and validation report",
    "Publish a reliability, recovery, and cost-optimization review",
  ],
  jobs: [
    "Build a Cloud Engineer title and platform matrix",
    "Map IAM, networking, IaC, containers, and operations evidence",
    "Run a targeted cloud engineering application cycle",
  ],
  interviewAreas: [
    "Cloud architecture",
    "IAM",
    "Networking",
    "Compute and storage",
    "Infrastructure as code",
    "Containers and Kubernetes",
    "Observability and reliability",
    "Security and FinOps",
  ],
  interviewQuestions: [
    "Design a secure cloud environment for a public web application.",
    "How would you structure accounts, subscriptions, or projects?",
    "Explain public and private subnets and routing.",
    "How do you manage Terraform state safely?",
    "When would you choose containers, serverless, or virtual machines?",
    "How would you diagnose intermittent application latency?",
    "Design backup and disaster recovery for a critical service.",
    "How do you reduce cloud cost without reducing reliability?",
  ],
  related: [
    "DevOps Engineer",
    "Platform Engineer",
    "Site Reliability Engineer",
    "Cloud Security Engineer",
    "Solutions Architect",
  ],
  difficulty: "Intermediate",
  learningTime: "9-13 months part-time",
  programmingRequirement:
    "Moderate: shell, Python, infrastructure as code, YAML, APIs, and automation",
  mathRequirement: "Low to Moderate: capacity, availability, latency, and cost analysis",
});
