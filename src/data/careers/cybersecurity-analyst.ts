import { cybersecurityAnalystCareer as legacyCybersecurityLayout } from "@/data/careers/activation-batch-seven";
import { applyCareerTitleAliasPolicy } from "@/data/careerTitleAliases";
import type {
  CareerAssessment,
  CareerJourneyEffortEstimate,
  CareerJourneyStage,
  CareerLesson,
  CareerQuizQuestion,
  CareerResource,
  CareerRoadmapPhase,
  CareerWorkspaceData,
  WorkspaceDifficulty,
} from "@/types/careerWorkspace";

type ResourceKey = keyof typeof resources;

type StageSpec = {
  title: string;
  landmark: string;
  theme: string;
  summary: string;
  explanation: string;
  lessons: string[];
  tasks: string[];
  resourceKeys: ResourceKey[];
  questions: CareerQuizQuestion[];
};

const resources = {
  nistCsf: {
    id: "cyber-resource-nist-csf",
    title: "NIST Cybersecurity Framework 2.0",
    type: "Documentation",
    provider: "NIST",
    cost: "Free",
    estimatedTime: "3-5 hours",
    whyUseful: "Organizes cybersecurity outcomes across Govern, Identify, Protect, Detect, Respond, and Recover.",
    url: "https://www.nist.gov/cyberframework",
    priority: "Essential",
  },
  mitreAttack: {
    id: "cyber-resource-mitre-attack",
    title: "MITRE ATT&CK Enterprise",
    type: "Documentation",
    provider: "MITRE",
    cost: "Free",
    estimatedTime: "6-10 hours",
    whyUseful: "Connects adversary behavior to telemetry, detection, investigation, and threat hunting.",
    url: "https://attack.mitre.org/",
    priority: "Essential",
  },
  sentinel: {
    id: "cyber-resource-microsoft-sentinel",
    title: "Microsoft Sentinel Security Operations",
    type: "Learning Path",
    provider: "Microsoft Learn",
    cost: "Free",
    estimatedTime: "8-14 hours",
    whyUseful: "Provides guided SIEM, investigation, detection, automation, and threat-hunting practice.",
    url: "https://learn.microsoft.com/en-us/training/career-paths/security-operations-analyst",
    priority: "Essential",
  },
  siemQueries: {
    id: "cyber-resource-splunk-search",
    title: "SIEM Querying and Event Investigation",
    type: "Learning Path",
    provider: "Microsoft Learn",
    cost: "Free",
    estimatedTime: "6-12 hours",
    whyUseful: "Builds practical log collection, query, correlation, triage, and investigation skills.",
    url: "https://learn.microsoft.com/en-us/training/paths/sc-200-configure-azure-sentinel-environment/",
    priority: "Essential",
  },
  incidentResponse: {
    id: "cyber-resource-nist-incident-response",
    title: "NIST SP 800-61 Revision 3",
    type: "Documentation",
    provider: "NIST",
    cost: "Free",
    estimatedTime: "4-6 hours",
    whyUseful: "Provides current incident-response guidance aligned with CSF 2.0.",
    url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final",
    priority: "Essential",
  },
  owasp: {
    id: "cyber-resource-owasp-top-ten",
    title: "OWASP Top 10 and Web Security Practice",
    type: "Course",
    provider: "OWASP / PortSwigger",
    cost: "Free",
    estimatedTime: "10-20 hours",
    whyUseful: "Combines application-security risk knowledge with interactive labs.",
    url: "https://owasp.org/www-project-top-ten/",
    priority: "Recommended",
  },
  cloudSecurity: {
    id: "cyber-resource-cisa-cloud-security",
    title: "CISA Cloud Security Technical Reference Architecture",
    type: "Documentation",
    provider: "CISA",
    cost: "Free",
    estimatedTime: "4-7 hours",
    whyUseful: "Frames cloud trust, identity, logging, configuration, and resilience controls.",
    url: "https://www.cisa.gov/resources-tools/resources/cloud-security-technical-reference-architecture",
    priority: "Recommended",
  },
} satisfies Record<string, CareerResource>;

const resourceMinutes: Record<ResourceKey, { min: number; max: number }> = {
  nistCsf: { min: 180, max: 300 },
  mitreAttack: { min: 360, max: 600 },
  sentinel: { min: 480, max: 840 },
  siemQueries: { min: 360, max: 720 },
  incidentResponse: { min: 240, max: 360 },
  owasp: { min: 600, max: 1200 },
  cloudSecurity: { min: 240, max: 420 },
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
    lastReviewedAt: "2026-08-02",
    version: 1,
  };
}

function buildQuestions(stageNumber: number, topics: string[]): CareerQuizQuestion[] {
  const [a, b, c] = topics;
  return [
    q(`cyber-s${stageNumber}-q1`, `Which result best demonstrates practical understanding of ${a}?`, ["A copied definition", "A documented decision supported by evidence", "A tool screenshot without context", "An unexplained score"], 1, "Cybersecurity work must connect evidence to a defensible decision.", a),
    q(`cyber-s${stageNumber}-q2`, `What is the strongest way to validate work involving ${b}?`, ["Assume the result is correct", "Use representative positive and negative evidence", "Increase severity", "Remove documentation"], 1, "Validation requires evidence that tests expected and unexpected outcomes.", b),
    q(`cyber-s${stageNumber}-q3`, `Scenario: evidence for ${c} is incomplete. What should the analyst do first?`, ["Declare a final conclusion", "Record the gap, confidence, and next evidence required", "Delete the case", "Ignore uncertainty"], 1, "Professional analysis makes uncertainty and evidence gaps explicit.", c),
    q(`cyber-s${stageNumber}-q4`, `Which practice most improves repeatability in ${a}?`, ["Rely on memory", "Document inputs, method, assumptions, and output", "Avoid peer review", "Change criteria per case"], 1, "Repeatable work is explicit and reviewable.", a),
    q(`cyber-s${stageNumber}-q5`, `Why should ${b} be linked to business or asset context?`, ["To make reports longer", "To prioritize action based on actual risk and impact", "To avoid technical evidence", "To replace investigation"], 1, "Security priorities depend on the affected asset and business impact.", b),
  ];
}

function topicAssessment(stageNumber: number, resource: CareerResource, questions: CareerQuizQuestion[]): CareerAssessment {
  return {
    id: `cyber-stage-${stageNumber}-${resource.id}-assessment`,
    title: `${resource.title} knowledge check`,
    description: `Five role-specific questions connecting ${resource.title} to Cybersecurity Analyst work.`,
    passingScore: 70,
    assessmentType: "topic",
    topicId: resource.id,
    topicLabel: resource.title,
    durationMinutes: 12,
    questionsPerAttempt: 5,
    questions,
  };
}

function comprehensiveAssessment(stageNumber: number, title: string, questions: CareerQuizQuestion[]): CareerAssessment {
  const expanded = [...questions, ...questions.map((question, index) => ({ ...question, id: `${question.id}-scenario-${index + 1}`, question: `Scenario follow-up: ${question.question}` }))];
  return {
    id: `cyber-stage-${stageNumber}-comprehensive-assessment`,
    title: `${title} comprehensive assessment`,
    description: "A ten-question checkpoint covering concepts, evidence, decisions, and practical analyst judgment.",
    passingScore: 70,
    assessmentType: "comprehensive",
    durationMinutes: 25,
    questionsPerAttempt: 10,
    questions: expanded,
  };
}

function calculateEffort(resourceKeys: ResourceKey[], taskCount: number): CareerJourneyEffortEstimate {
  const resourceRange = resourceKeys.reduce(
    (total, key) => ({ min: total.min + resourceMinutes[key].min, max: total.max + resourceMinutes[key].max }),
    { min: 0, max: 0 },
  );
  const activities = { min: taskCount * 60, max: taskCount * 120 };
  const assessment = { min: resourceKeys.length * 12 + 25, max: resourceKeys.length * 20 + 35 };
  return {
    minMinutes: resourceRange.min + activities.min + assessment.min,
    maxMinutes: resourceRange.max + activities.max + assessment.max,
    breakdown: {
      resources: { minMinutes: resourceRange.min, maxMinutes: resourceRange.max },
      activities: { minMinutes: activities.min, maxMinutes: activities.max },
      assessment: { minMinutes: assessment.min, maxMinutes: assessment.max },
    },
  };
}

const stageSpecs: StageSpec[] = [
  {
    title: "Security Foundations and Analyst Mindset",
    landmark: "Defense Orientation Center",
    theme: "Understand risk, controls, evidence, and analyst responsibility.",
    summary: "Build the vocabulary, reasoning, and evidence discipline required for security operations.",
    explanation: "Security analysis starts with assets, threats, vulnerabilities, controls, impact, and trustworthy evidence rather than tool output alone.",
    lessons: ["Risk, assets, threats, and controls", "CIA triad and security objectives", "Analyst evidence and case discipline"],
    tasks: ["Create an asset-threat-control map.", "Classify ten security events by impact.", "Write a case note separating facts and assumptions."],
    resourceKeys: ["nistCsf"],
    questions: buildQuestions(1, ["risk analysis", "security controls", "evidence discipline"]),
  },
  {
    title: "Networking, Operating Systems, and Identity",
    landmark: "Systems Visibility Lab",
    theme: "Interpret network, endpoint, operating-system, and identity evidence.",
    summary: "Build the technical foundations needed to investigate authentication, processes, protocols, and account activity.",
    explanation: "Telemetry becomes useful only when the analyst understands normal communication, authentication, process execution, permissions, and logging.",
    lessons: ["TCP/IP, DNS, HTTP, and TLS", "Windows and Linux security evidence", "Authentication, MFA, and least privilege"],
    tasks: ["Trace a browser request from DNS through TLS.", "Compare Windows and Linux sign-in evidence.", "Review one privileged business role."],
    resourceKeys: ["siemQueries", "cloudSecurity"],
    questions: buildQuestions(2, ["network evidence", "operating-system logs", "identity security"]),
  },
  {
    title: "Telemetry, Logging, and SIEM Operations",
    landmark: "Security Telemetry Exchange",
    theme: "Collect, normalize, query, correlate, and triage security evidence.",
    summary: "Turn diverse logs into searchable evidence and actionable cases.",
    explanation: "A SIEM is useful only when data sources, fields, parsing, timestamps, retention, and coverage gaps are understood.",
    lessons: ["Security log sources and data quality", "KQL and event correlation", "Alert triage and case management"],
    tasks: ["Create a telemetry inventory.", "Write three investigation queries.", "Triage a simulated alert queue."],
    resourceKeys: ["sentinel", "siemQueries"],
    questions: buildQuestions(3, ["telemetry design", "SIEM querying", "alert triage"]),
  },
  {
    title: "Detection Engineering and Threat Hunting",
    landmark: "Detection Workshop",
    theme: "Translate adversary behavior into testable detections and proactive hunts.",
    summary: "Create explainable, maintainable detections connected to observable behavior.",
    explanation: "Detection engineering combines threat knowledge, telemetry, rule logic, validation, tuning, and coverage measurement.",
    lessons: ["MITRE ATT&CK behavior mapping", "Detection testing and tuning", "Threat-hunting hypotheses"],
    tasks: ["Map five techniques to telemetry.", "Test a suspicious PowerShell detection.", "Run an account-anomaly hunt."],
    resourceKeys: ["mitreAttack", "sentinel"],
    questions: buildQuestions(4, ["ATT&CK mapping", "detection validation", "threat hunting"]),
  },
  {
    title: "Incident Response and Digital Evidence",
    landmark: "Incident Command Room",
    theme: "Investigate, contain, eradicate, recover, and learn while preserving evidence.",
    summary: "Practice disciplined incident handling from initial report through recovery.",
    explanation: "Incident response balances speed, evidence preservation, continuity, communication, uncertainty, and risk.",
    lessons: ["Incident lifecycle and playbooks", "Timeline reconstruction", "Containment and recovery"],
    tasks: ["Build an incident timeline.", "Compare containment options.", "Write technical and executive reports."],
    resourceKeys: ["incidentResponse", "sentinel"],
    questions: buildQuestions(5, ["incident handling", "digital evidence", "containment decisions"]),
  },
  {
    title: "Vulnerability and Exposure Management",
    landmark: "Exposure Reduction Center",
    theme: "Prioritize remediation using exploitability, exposure, asset value, and control context.",
    summary: "Move beyond vulnerability counts toward evidence-based reduction of exploitable risk.",
    explanation: "Severity scores are inputs, not final decisions. Analysts must consider exposure, exploitation, asset criticality, and compensating controls.",
    lessons: ["Vulnerability evidence", "Risk-based prioritization", "Remediation and exception governance"],
    tasks: ["Validate a vulnerability finding.", "Build a prioritization model.", "Create a remediation dashboard."],
    resourceKeys: ["owasp", "nistCsf"],
    questions: buildQuestions(6, ["vulnerability validation", "risk prioritization", "remediation governance"]),
  },
  {
    title: "Cloud, Endpoint, and Identity Defense",
    landmark: "Modern Defense Operations Hub",
    theme: "Investigate risk across cloud control planes, endpoints, identities, and SaaS activity.",
    summary: "Apply consistent defensive reasoning to modern distributed environments.",
    explanation: "Cloud incidents often involve identities, tokens, configuration, APIs, and control-plane events rather than traditional perimeter evidence alone.",
    lessons: ["Cloud audit evidence", "Endpoint detection and response", "Identity compromise and privileged access"],
    tasks: ["Investigate a compromised cloud account.", "Correlate endpoint and identity evidence.", "Review MFA and privileged roles."],
    resourceKeys: ["cloudSecurity", "sentinel"],
    questions: buildQuestions(7, ["cloud audit logs", "endpoint defense", "identity compromise"]),
  },
  {
    title: "Governance, Risk, and Security Communication",
    landmark: "Risk and Governance Forum",
    theme: "Connect technical findings to accountable decisions, controls, policy, and measurable business risk.",
    summary: "Communicate security evidence in ways that support action without overstating certainty.",
    explanation: "Analysts must translate investigations and control gaps into clear risk, ownership, options, deadlines, and evidence of closure.",
    lessons: ["Control frameworks and policy", "Risk reporting", "Metrics and assurance"],
    tasks: ["Map findings to CSF functions.", "Write technical and executive summaries.", "Design outcome-focused security metrics."],
    resourceKeys: ["nistCsf", "incidentResponse"],
    questions: buildQuestions(8, ["security governance", "risk communication", "control assurance"]),
  },
  {
    title: "Cyber Defense Capstone",
    landmark: "SOC Readiness Review",
    theme: "Integrate telemetry, detection, investigation, response, exposure management, and governance.",
    summary: "Produce portfolio-grade evidence of end-to-end cybersecurity analysis and operational judgment.",
    explanation: "The capstone demonstrates technical work, prioritization, evidence quality, escalation, communication, and measurable improvement.",
    lessons: ["SOC operating model", "Integrated investigation", "Portfolio evidence"],
    tasks: ["Design a SOC coverage model.", "Run an end-to-end simulated incident.", "Present the program to technical and business reviewers."],
    resourceKeys: ["mitreAttack", "incidentResponse", "nistCsf"],
    questions: buildQuestions(9, ["SOC coverage", "integrated response", "readiness review"]),
  },
  {
    title: "Cybersecurity Career Positioning and Interviews",
    landmark: "Security Career Operations Desk",
    theme: "Translate security evidence into targeted applications and credible scenario-based interviews.",
    summary: "Position experience across SOC, security analysis, incident response, cloud security, and vulnerability roles.",
    explanation: "Security hiring evaluates technical fundamentals, investigative reasoning, communication, and practical evidence across varied job titles.",
    lessons: ["Security role and title mapping", "Resume and portfolio evidence", "Technical and behavioral interview practice"],
    tasks: ["Build a target-role matrix.", "Tailor three portfolio case studies.", "Complete mock investigations and interviews."],
    resourceKeys: ["sentinel", "mitreAttack"],
    questions: buildQuestions(10, ["career evidence", "scenario interviews", "job-title mapping"]),
  },
];

const journeyStages: CareerJourneyStage[] = stageSpecs.map((spec, index) => {
  const layout = legacyCybersecurityLayout.journeyStages[index] ?? legacyCybersecurityLayout.journeyStages[0];
  const stageNumber = index + 1;
  const stageResources = spec.resourceKeys.map((key) => resources[key]);
  return {
    ...layout,
    id: `cyber-stage-${stageNumber}`,
    order: stageNumber,
    title: spec.title,
    label: spec.title,
    landmark: spec.landmark,
    theme: spec.theme,
    summary: spec.summary,
    explanation: spec.explanation,
    lessons: spec.lessons,
    resources: stageResources,
    estimatedEffort: calculateEffort(spec.resourceKeys, spec.tasks.length),
    tasks: spec.tasks.map((description, taskIndex) => ({ id: `cyber-stage-${stageNumber}-task-${taskIndex + 1}`, title: description, description, type: index === 8 ? "portfolio" : index === 9 ? "job-search" : "lesson" })),
    topicAssessments: stageResources.map((resource) => topicAssessment(stageNumber, resource, spec.questions)),
    phaseExam: comprehensiveAssessment(stageNumber, spec.title, spec.questions),
  };
});

const roadmapSpecs = [
  ["Security and Systems Foundations", "Risk and controls", "Networking", "Operating systems"],
  ["Monitoring and SIEM", "Telemetry design", "Queries", "Alert triage"],
  ["Detection and Incident Response", "ATT&CK mapping", "Detection rules", "Incident response"],
  ["Exposure and Modern Defense", "Vulnerability management", "Cloud security", "Identity defense"],
  ["Governance and Capstone", "Risk reporting", "Metrics", "Cyber defense capstone"],
  ["Employment Readiness", "Portfolio", "Role mapping", "Scenario interviews"],
] as const;

function lesson(id: string, title: string, stage: StageSpec, difficulty: WorkspaceDifficulty): CareerLesson {
  return {
    id,
    title,
    summary: `Develop practical Cybersecurity Analyst capability in ${title.toLowerCase()}.`,
    estimatedTime: "3-5 hours",
    difficulty,
    outcomes: [`Explain ${title.toLowerCase()} in defensive operations.`, `Apply ${title.toLowerCase()} to a realistic scenario.`, "Produce evidence another analyst can review."],
    resources: stage.resourceKeys.map((key) => resources[key]),
    mission: `Create a portfolio-ready artifact demonstrating ${title.toLowerCase()}.`,
  };
}

const roadmap: CareerRoadmapPhase[] = legacyCybersecurityLayout.roadmap.slice(0, 6).map((phase, index) => {
  const sections = roadmapSpecs[index];
  const stage = stageSpecs[Math.min(index * 2, stageSpecs.length - 1)];
  return {
    ...phase,
    id: `cyber-roadmap-${index + 1}`,
    phaseNumber: index + 1,
    title: sections[0],
    goal: `Build defensible capability across ${sections.slice(1).join(", ")}.`,
    sections: [...sections],
    mentorTip: "Keep every conclusion tied to observable evidence, asset context, uncertainty, risk, and accountable next action.",
    practicalMissions: stage.tasks.slice(0, 2),
    expectedOutcome: `You can investigate and explain work across ${sections.slice(1).join(", ")}.`,
    lessons: sections.slice(1).map((section, lessonIndex) => lesson(`cyber-roadmap-${index + 1}-lesson-${lessonIndex + 1}`, section, stage, index === 0 ? "Beginner" : index >= 4 ? "Advanced" : "Intermediate")),
    quiz: { id: `cyber-roadmap-${index + 1}-quiz`, phaseId: `cyber-roadmap-${index + 1}`, title: `${sections[0]} checkpoint`, description: `Validate practical understanding of ${sections.slice(1).join(", ")}.`, questions: stage.questions },
  };
});

const cybersecurityAnalystBase: CareerWorkspaceData = {
  ...legacyCybersecurityLayout,
  slug: "cybersecurity-analyst",
  title: "Cybersecurity Analyst",
  category: "AI Infrastructure & Security",
  visual: {
    nodeLabel: "Cybersecurity Analyst",
    sceneTitle: "Security Operations and Threat Defense Center",
    sceneDescription: "A defensive operations environment connecting telemetry, identities, endpoints, networks, cloud controls, detections, investigations, incidents, recovery, and risk governance.",
    imageAlt: "Cybersecurity analyst investigating security telemetry, identity events, endpoint activity, cloud logs, and incident evidence.",
  },
  shortDescription: "Monitor, investigate, contain, and reduce cyber risk through security operations, detection engineering, incident response, vulnerability management, identity defense, cloud security, and evidence-based governance.",
  estimatedLearningTime: "Calculated per stage from assigned resources, practical work, and assessments",
  lastUpdated: "2026-08-02",
  journeyMap: {
    ...legacyCybersecurityLayout.journeyMap,
    theme: "cyber-fortress",
    overviewTitle: "Cybersecurity Analyst Defense Journey",
    overviewDescription: "Ten distinct stages from security foundations to operational readiness and employment positioning.",
  },
  journeyStages,
  roadmap,
  globalResources: Object.values(resources),
  relatedCareers: ["Security Operations Analyst", "SOC Analyst", "Cloud Security Analyst", "Incident Response Analyst", "Detection Engineer", "DevSecOps Engineer"],
};

export const cybersecurityAnalystCareer = applyCareerTitleAliasPolicy(cybersecurityAnalystBase);
