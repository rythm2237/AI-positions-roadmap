import { cybersecurityAnalystCareer as legacyCybersecurityLayout } from "@/data/careers/activation-batch-seven";
import { applyCareerTitleAliasPolicy } from "@/data/careerTitleAliases";
import type {
  CareerAssessment,
  CareerJourneyStage,
  CareerLesson,
  CareerQuizQuestion,
  CareerResource,
  CareerRoadmapPhase,
  CareerWorkspaceData,
  WorkspaceDifficulty,
} from "@/types/careerWorkspace";

const resources: Record<string, CareerResource> = {
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
    estimatedTime: "Multi-path curriculum",
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
    questionType: question.toLowerCase().includes("scenario")
      ? "scenario"
      : "multiple-choice",
    status: "active",
    lastReviewedAt: "2026-08-02",
    version: 1,
  };
}

function topicAssessment(
  stageNumber: number,
  resource: CareerResource,
  questions: CareerQuizQuestion[],
): CareerAssessment {
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

function comprehensiveAssessment(
  stageNumber: number,
  title: string,
  questions: CareerQuizQuestion[],
): CareerAssessment {
  const expanded = [
    ...questions,
    ...questions.map((question, index) => ({
      ...question,
      id: `${question.id}-scenario-${index + 1}`,
      question: `Scenario follow-up: ${question.question}`,
    })),
  ];

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

function lesson(
  id: string,
  title: string,
  summary: string,
  outcomes: string[],
  mission: string,
  lessonResources: CareerResource[],
  difficulty: WorkspaceDifficulty = "Intermediate",
): CareerLesson {
  return {
    id,
    title,
    summary,
    estimatedTime: "3-5 hours",
    difficulty,
    outcomes,
    resources: lessonResources,
    mission,
  };
}

const stageSpecs = [
  {
    title: "Security Foundations and Analyst Mindset",
    landmark: "Defense Orientation Center",
    theme: "Understand risk, controls, evidence, and the responsibilities of a defensive security analyst.",
    summary: "Build the vocabulary, reasoning, and evidence discipline required for security operations.",
    explanation: "Security analysis starts with assets, threats, vulnerabilities, controls, impact, and trustworthy evidence rather than tool output alone.",
    lessons: ["Risk, assets, threats, and controls", "CIA triad and security objectives", "Analyst evidence and case discipline"],
    tasks: ["Create an asset-threat-control map for a small company.", "Classify ten security events by confidentiality, integrity, availability, and business impact.", "Write a case note separating facts, assumptions, hypotheses, and next actions."],
    resourceKeys: ["nistCsf", "sentinel"],
    questions: [
      q("cyber-s1-q1", "Which statement best describes cyber risk?", ["Any technical weakness", "Likelihood and impact affecting objectives", "Every alert", "Only financial loss"], 1, "Risk connects uncertain events to organizational impact.", "Risk"),
      q("cyber-s1-q2", "Unauthorized payroll changes primarily affect which objective?", ["Confidentiality", "Integrity", "Availability", "Privacy only"], 1, "Unauthorized modification is an integrity failure.", "CIA triad"),
      q("cyber-s1-q3", "What should be recorded first in an investigation?", ["Final attribution", "Verified evidence, timestamps, source, and scope", "Public statement", "Remediation deadline"], 1, "Initial records must preserve facts and provenance.", "Evidence"),
      q("cyber-s1-q4", "A control is effective when:", ["It exists in policy", "Evidence shows it operates and reduces relevant risk", "It is expensive", "It has no owner"], 1, "Control effectiveness requires operating evidence.", "Controls"),
      q("cyber-s1-q5", "Why label assumptions separately from facts?", ["To make notes longer", "To preserve analytical integrity and uncertainty", "To avoid collecting logs", "To prove attribution"], 1, "Clear evidence boundaries make conclusions defensible.", "Analyst reasoning"),
    ],
  },
  {
    title: "Networking, Operating Systems, and Identity",
    landmark: "Systems Visibility Lab",
    theme: "Interpret network, endpoint, operating-system, and identity evidence.",
    summary: "Build the technical foundations needed to investigate authentication, processes, protocols, and account activity.",
    explanation: "Telemetry becomes useful only when the analyst understands normal communication, authentication, process execution, permissions, and logging.",
    lessons: ["TCP/IP, DNS, HTTP, TLS, and common protocols", "Windows and Linux security evidence", "Authentication, authorization, MFA, and least privilege"],
    tasks: ["Trace a browser request from DNS through TLS and HTTP.", "Compare Windows and Linux failed-sign-in evidence.", "Create a privileged-access review for one business role."],
    resourceKeys: ["sentinel", "siemQueries", "nistCsf"],
    questions: [
      q("cyber-s2-q1", "Which source is most useful for repeated failed Windows sign-ins?", ["DNS cache", "Windows Security log", "Printer log", "Marketing analytics"], 1, "Windows Security logs contain authentication events.", "Windows logs"),
      q("cyber-s2-q2", "Why is DNS telemetry valuable?", ["It proves intent", "It reveals suspicious domain lookups and infrastructure", "It replaces EDR", "It contains every file hash"], 1, "DNS shows destination patterns and infrastructure.", "DNS"),
      q("cyber-s2-q3", "Least privilege means:", ["Everyone is admin", "Access is limited to task requirements", "Passwords never expire", "One shared account"], 1, "Least privilege limits permissions and blast radius.", "Identity"),
      q("cyber-s2-q4", "Which field helps connect a process event to a user session?", ["Screen brightness", "Account or security identifier", "Printer queue", "Browser theme"], 1, "Identity fields connect activity to an authenticated principal.", "Endpoint evidence"),
      q("cyber-s2-q5", "What does TLS primarily protect in transit?", ["Physical devices", "Confidentiality and integrity of communications", "User job titles", "File ownership only"], 1, "TLS protects network communications from reading and tampering.", "TLS"),
    ],
  },
  {
    title: "Telemetry, Logging, and SIEM Operations",
    landmark: "Security Telemetry Exchange",
    theme: "Collect, normalize, query, correlate, and triage security evidence.",
    summary: "Turn diverse logs into searchable evidence and actionable cases.",
    explanation: "A SIEM is useful only when data sources, fields, parsing, timestamps, retention, and coverage gaps are understood.",
    lessons: ["Security log sources and data quality", "KQL/SIEM queries and correlation", "Alert triage and case management"],
    tasks: ["Create a telemetry inventory with owners and retention.", "Write queries for failed sign-ins, suspicious processes, and unusual outbound traffic.", "Triage a simulated queue and document evidence and disposition."],
    resourceKeys: ["siemQueries", "sentinel"],
    questions: [
      q("cyber-s3-q1", "What is the best response to a noisy SIEM rule?", ["Disable all logs", "Review logic, data quality, thresholds, and suppression", "Mark every alert benign", "Raise severity"], 1, "Tuning starts with rule logic and evidence quality.", "SIEM tuning"),
      q("cyber-s3-q2", "Why normalize timestamps?", ["Reduce storage only", "Build a reliable cross-system sequence", "Hide sources", "Make events unique"], 1, "Timelines require consistent time interpretation.", "Correlation"),
      q("cyber-s3-q3", "Triage priority should use:", ["Alert color", "Evidence, asset criticality, scope, behavior, and impact", "Analyst seniority", "Dashboard count"], 1, "Priority must reflect evidence and business risk.", "Triage"),
      q("cyber-s3-q4", "A missing data source creates:", ["Guaranteed safety", "A visibility and detection gap", "Automatic containment", "Better attribution"], 1, "No telemetry means reduced ability to observe behavior.", "Coverage"),
      q("cyber-s3-q5", "What should a closed benign alert contain?", ["No notes", "Evidence, reasoning, disposition, and tuning feedback", "Only a screenshot", "A password"], 1, "Documented disposition supports review and improvement.", "Case management"),
    ],
  },
  {
    title: "Detection Engineering and Threat Hunting",
    landmark: "Detection Workshop",
    theme: "Translate adversary behavior into testable detections and proactive hunts.",
    summary: "Create explainable, maintainable detections connected to observable behavior.",
    explanation: "Detection engineering combines threat knowledge, telemetry, rule logic, validation, tuning, and coverage measurement.",
    lessons: ["MITRE ATT&CK behavior mapping", "Detection design, testing, and tuning", "Threat-hunting hypotheses and evidence"],
    tasks: ["Map five ATT&CK techniques to available telemetry.", "Write and test a suspicious PowerShell detection.", "Run a hunt for anomalous account behavior."],
    resourceKeys: ["mitreAttack", "sentinel", "siemQueries"],
    questions: [
      q("cyber-s4-q1", "What makes a detection maintainable?", ["No documentation", "Defined intent, data dependencies, tests, thresholds, and tuning history", "Alert on everything", "One analyst's memory"], 1, "Maintainable detections are explicit and testable.", "Detection engineering"),
      q("cyber-s4-q2", "A useful hunt hypothesis is:", ["Impossible to disprove", "Specific and testable with available evidence", "Based only on marketing", "Unrelated to behavior"], 1, "Hunts must connect plausible behavior to observable data.", "Threat hunting"),
      q("cyber-s4-q3", "MITRE ATT&CK describes:", ["Legal penalties", "Adversary tactics and techniques", "Passwords", "Asset values"], 1, "ATT&CK is a behavior knowledge base.", "ATT&CK"),
      q("cyber-s4-q4", "How should a detection be validated?", ["Only by reading it", "Against known positive and negative test data", "By increasing severity", "By removing filters"], 1, "Validation requires representative test evidence.", "Validation"),
      q("cyber-s4-q5", "A coverage map should connect techniques to:", ["Office locations", "Telemetry, detections, owners, and response capability", "Employee birthdays", "Vendor logos"], 1, "Coverage is operational, not cosmetic.", "Coverage"),
    ],
  },
  {
    title: "Incident Response and Digital Evidence",
    landmark: "Incident Command Room",
    theme: "Investigate, contain, eradicate, recover, and learn while preserving evidence.",
    summary: "Practice disciplined incident handling from report through recovery.",
    explanation: "Incident response balances speed, evidence preservation, continuity, communication, uncertainty, and risk.",
    lessons: ["Incident lifecycle, roles, and playbooks", "Timeline reconstruction and evidence handling", "Containment, recovery, and lessons learned"],
    tasks: ["Build a timeline from endpoint, identity, and network evidence.", "Compare containment options and rollback risks.", "Write executive and technical incident reports."],
    resourceKeys: ["incidentResponse", "sentinel", "mitreAttack"],
    questions: [
      q("cyber-s5-q1", "Why can immediate shutdown be harmful?", ["It always costs more", "It may destroy volatile evidence and interrupt observation", "It changes the IP only", "It guarantees notification"], 1, "Containment must consider evidence and operations.", "Evidence"),
      q("cyber-s5-q2", "Which belongs in preparation?", ["Contacts, tools, roles, and playbooks", "Deleting logs", "Publishing attribution", "Disabling alerts"], 0, "Preparation establishes response capability.", "Preparation"),
      q("cyber-s5-q3", "A defensible timeline records:", ["Unlabeled guesses", "Sourced events, confidence, gaps, and normalized time", "Only root cause", "Only successful steps"], 1, "Timelines preserve provenance and uncertainty.", "Timeline"),
      q("cyber-s5-q4", "Containment decisions should include:", ["Only technical speed", "Business impact, evidence preservation, reversibility, and scope", "Vendor preference", "No owner"], 1, "Containment is a risk decision.", "Containment"),
      q("cyber-s5-q5", "Lessons learned should produce:", ["Blame only", "Specific control, process, detection, and ownership improvements", "Fewer records", "Automatic attribution"], 1, "Post-incident review must improve the system.", "Lessons learned"),
    ],
  },
  {
    title: "Vulnerability and Exposure Management",
    landmark: "Exposure Reduction Center",
    theme: "Prioritize remediation using exploitability, exposure, asset value, controls, and impact.",
    summary: "Move beyond vulnerability counts toward measurable exposure reduction.",
    explanation: "Severity scores are inputs; active exploitation, exposure, asset criticality, controls, and ownership determine priority.",
    lessons: ["Vulnerability validation and evidence", "Risk-based prioritization", "Remediation tracking and exception governance"],
    tasks: ["Validate a finding and identify false-positive conditions.", "Build a risk-prioritization model.", "Create a remediation dashboard with owners and SLAs."],
    resourceKeys: ["owasp", "nistCsf", "incidentResponse"],
    questions: [
      q("cyber-s6-q1", "Which vulnerability is usually highest priority?", ["Low severity on isolated test", "Actively exploited on an internet-facing critical asset", "No affected asset", "Oldest finding only"], 1, "Exploitation, exposure, and criticality drive risk.", "Prioritization"),
      q("cyber-s6-q2", "A compensating control is:", ["A duplicate finding", "A control reducing risk while the preferred fix is pending", "A complaint", "A license"], 1, "Compensating controls reduce exposure temporarily.", "Controls"),
      q("cyber-s6-q3", "A remediation exception should include:", ["No expiry", "Justification, owner, controls, review date, and accepted risk", "Only CVE", "No evidence"], 1, "Exceptions require accountable, time-bound decisions.", "Exceptions"),
      q("cyber-s6-q4", "Why validate scanner findings?", ["Scanners are always wrong", "To confirm affected assets, conditions, and exploitability", "To remove ownership", "To avoid patching"], 1, "Validation improves accuracy and priority.", "Validation"),
      q("cyber-s6-q5", "What best measures exposure reduction?", ["Number of scans", "Critical exploitable paths closed with evidence", "Dashboard colors", "Emails sent"], 1, "Outcomes matter more than activity counts.", "Metrics"),
    ],
  },
  {
    title: "Cloud, Endpoint, and Identity Defense",
    landmark: "Modern Defense Operations Hub",
    theme: "Investigate cloud control planes, endpoints, identities, tokens, and SaaS activity.",
    summary: "Apply consistent defensive reasoning across modern distributed environments.",
    explanation: "Modern incidents frequently involve identity, sessions, APIs, cloud configuration, endpoint behavior, and control-plane events.",
    lessons: ["Cloud audit and control-plane evidence", "Endpoint detection and response", "Identity compromise and privileged access"],
    tasks: ["Investigate a compromised cloud account.", "Correlate EDR, identity, and network evidence.", "Review privileged roles, dormant accounts, MFA, and risky sign-ins."],
    resourceKeys: ["cloudSecurity", "sentinel", "siemQueries"],
    questions: [
      q("cyber-s7-q1", "Best evidence for suspicious cloud administration?", ["Screenshots only", "Cloud audit and control-plane logs", "Printer logs", "Marketing data"], 1, "Cloud audit logs record administrative and API activity.", "Cloud logs"),
      q("cyber-s7-q2", "Token theft may allow:", ["Changing hardware serials", "Reusing an authenticated session", "Disabling all encryption", "Bypassing every protocol"], 1, "Stolen tokens can provide authenticated access.", "Identity"),
      q("cyber-s7-q3", "EDR is especially valuable for:", ["Process, command line, file, and endpoint behavior", "Payroll", "Door access only", "Domain ownership"], 0, "EDR exposes endpoint activity and response options.", "EDR"),
      q("cyber-s7-q4", "Which control most reduces privileged-account risk?", ["Shared admin accounts", "MFA, least privilege, separate admin identities, and review", "No logging", "Permanent tokens"], 1, "Layered identity controls reduce compromise impact.", "Privileged access"),
      q("cyber-s7-q5", "Why correlate identity and endpoint evidence?", ["To duplicate alerts", "To connect authenticated users with observed device behavior", "To avoid timelines", "To remove context"], 1, "Cross-domain evidence improves scope and confidence.", "Correlation"),
    ],
  },
  {
    title: "Governance, Risk, and Security Communication",
    landmark: "Risk and Governance Forum",
    theme: "Connect technical findings to controls, ownership, business risk, and decisions.",
    summary: "Communicate evidence and uncertainty in a way that supports accountable action.",
    explanation: "Analysts translate findings into risk, options, owners, deadlines, controls, metrics, and proof of closure.",
    lessons: ["Control frameworks and policy", "Risk reporting and stakeholder communication", "Metrics, assurance, and continuous improvement"],
    tasks: ["Map findings to NIST CSF outcomes and owners.", "Write technical and executive summaries for one incident.", "Design metrics for coverage, response, exposure, and outcomes."],
    resourceKeys: ["nistCsf", "incidentResponse", "sentinel"],
    questions: [
      q("cyber-s8-q1", "Which metric reflects response effectiveness?", ["Dashboard colors", "Time to detect, contain, recover, and close actions with quality evidence", "Emails", "Tools purchased"], 1, "Outcome metrics should reflect speed and quality.", "Metrics"),
      q("cyber-s8-q2", "An executive summary should emphasize:", ["Raw logs only", "Impact, evidence, uncertainty, options, ownership, and decisions", "Every command", "Vendor slogans"], 1, "Decision-makers need implications and accountable choices.", "Communication"),
      q("cyber-s8-q3", "Control assurance requires:", ["Policy existence only", "Evidence the control operates as intended", "Complex naming", "No owner"], 1, "Assurance depends on operating evidence.", "Assurance"),
      q("cyber-s8-q4", "Why document uncertainty?", ["To weaken findings", "To communicate confidence and prevent overclaiming", "To avoid decisions", "To hide evidence"], 1, "Professional analysis distinguishes confidence levels.", "Uncertainty"),
      q("cyber-s8-q5", "A good risk owner is responsible for:", ["Only receiving reports", "Accepting, reducing, transferring, or avoiding risk with evidence", "Writing every detection", "Running every scan"], 1, "Risk decisions require accountable ownership.", "Risk ownership"),
    ],
  },
  {
    title: "Cyber Defense Capstone",
    landmark: "SOC Readiness Review",
    theme: "Integrate monitoring, detection, investigation, response, exposure management, and governance.",
    summary: "Produce portfolio-grade evidence of end-to-end defensive operations.",
    explanation: "The capstone demonstrates technical execution, prioritization, evidence quality, escalation, communication, and measurable improvement.",
    lessons: ["SOC operating model and coverage", "Integrated investigation and response", "Portfolio evidence and readiness review"],
    tasks: ["Design a small SOC telemetry and detection model.", "Run an end-to-end simulated incident.", "Present the defensive program to technical and business reviewers."],
    resourceKeys: ["nistCsf", "mitreAttack", "sentinel", "incidentResponse"],
    questions: [
      q("cyber-s9-q1", "A capstone investigation should demonstrate:", ["Screenshots only", "Evidence chain, reasoning, scope, response, communication, and improvement", "Vendor list", "No uncertainty"], 1, "Professional evidence shows the full process.", "Capstone"),
      q("cyber-s9-q2", "Coverage mapping shows:", ["Every attack is blocked", "Which behaviors and assets have evidence, detections, and response", "Risk is eliminated", "Testing is unnecessary"], 1, "Coverage mapping exposes strengths and gaps.", "Coverage"),
      q("cyber-s9-q3", "A readiness review should challenge:", ["Visual design only", "Assumptions, evidence, failure modes, ownership, and outcomes", "Job title", "Page count"], 1, "Review tests operational quality.", "Readiness"),
      q("cyber-s9-q4", "Why include negative test results?", ["They are irrelevant", "They show limits, false positives, and validation quality", "They replace evidence", "They prove zero risk"], 1, "Negative tests reveal boundaries and tuning needs.", "Testing"),
      q("cyber-s9-q5", "A portfolio artifact is strongest when:", ["It hides decisions", "Another analyst can reproduce and review the reasoning", "It contains only screenshots", "It has no context"], 1, "Reproducibility demonstrates professional evidence quality.", "Portfolio"),
    ],
  },
  {
    title: "Cybersecurity Career Positioning and Interviews",
    landmark: "Security Career Operations Desk",
    theme: "Translate security evidence into targeted applications and credible interviews.",
    summary: "Position experience for SOC, security analyst, incident response, cloud, and vulnerability roles.",
    explanation: "Security hiring evaluates technical fundamentals, investigative reasoning, communication, and practical evidence under varied job titles.",
    lessons: ["Security role and title mapping", "Resume and portfolio evidence", "Technical and behavioral interview practice"],
    tasks: ["Build a matrix of twenty target roles.", "Tailor three case studies to SOC, cloud, and incident-response vacancies.", "Complete mock investigations and explain decisions under challenge."],
    resourceKeys: ["mitreAttack", "sentinel", "nistCsf"],
    questions: [
      q("cyber-s10-q1", "Strongest way to describe a security project?", ["Tool name only", "Context, evidence, actions, judgment, controls, and result", "Claim zero false positives", "Unexplained acronyms"], 1, "Hiring evidence should connect work to outcomes.", "Resume"),
      q("cyber-s10-q2", "First step in a scenario interview?", ["Guess attacker", "Clarify scope, assets, evidence, impact, and constraints", "Buy a SIEM", "Close incident"], 1, "Structured investigation starts with scope and evidence.", "Interview"),
      q("cyber-s10-q3", "Why search multiple role titles?", ["Responsibilities appear under varied titles", "Every title is identical", "Keywords are rejected", "Only certificates matter"], 0, "Defensive work is advertised under several titles.", "Job search"),
      q("cyber-s10-q4", "What makes a portfolio credible?", ["Claims without evidence", "Reproducible artifacts, reasoning, limitations, and results", "Only certificates", "Only tool logos"], 1, "Evidence demonstrates capability.", "Portfolio"),
      q("cyber-s10-q5", "How should you answer an unknown technical question?", ["Invent an answer", "State assumptions, explain investigation steps, and identify evidence needed", "Change subject", "Blame the tool"], 1, "Structured reasoning is more credible than guessing.", "Interview judgment"),
    ],
  },
] as const;

const journeyStages: CareerJourneyStage[] =
  legacyCybersecurityLayout.journeyStages.map((stage, index) => {
    const spec = stageSpecs[index] ?? stageSpecs[stageSpecs.length - 1];
    const stageNumber = index + 1;
    const stageResources = spec.resourceKeys.map((key) => resources[key]);

    return {
      ...stage,
      id: `cyber-stage-${stageNumber}`,
      order: stageNumber,
      title: spec.title,
      label: spec.title,
      landmark: spec.landmark,
      theme: spec.theme,
      summary: spec.summary,
      explanation: spec.explanation,
      lessons: [...spec.lessons],
      resources: stageResources,
      tasks: spec.tasks.map((description, taskIndex) => ({
        id: `cyber-stage-${stageNumber}-task-${taskIndex + 1}`,
        title: description,
        description,
        type:
          index === 8
            ? "portfolio"
            : index === 9
              ? "job-search"
              : "lesson",
      })),
      topicAssessments: stageResources.map((resource) =>
        topicAssessment(stageNumber, resource, [...spec.questions]),
      ),
      phaseExam: comprehensiveAssessment(
        stageNumber,
        spec.title,
        [...spec.questions],
      ),
    };
  });

const roadmapSpecs = [
  ["Security and Systems Foundations", "Risk and controls", "Networking", "Operating systems", "Identity", "Evidence"],
  ["Monitoring and SIEM", "Telemetry design", "Queries", "Correlation", "Alert triage", "Case management"],
  ["Detection and Incident Response", "ATT&CK mapping", "Detection rules", "Threat hunting", "Incident response", "Forensics"],
  ["Exposure and Modern Defense", "Vulnerability management", "Endpoint security", "Cloud security", "Identity defense", "Remediation"],
  ["Governance and Capstone", "NIST CSF", "Risk reporting", "Metrics", "SOC operations", "Cyber defense capstone"],
  ["Employment Readiness", "Portfolio", "Resume evidence", "Role mapping", "Scenario interviews", "Targeted applications"],
] as const;

const roadmap: CareerRoadmapPhase[] = legacyCybersecurityLayout.roadmap.map(
  (phase, index) => {
    const sections = roadmapSpecs[index] ?? roadmapSpecs[roadmapSpecs.length - 1];
    const stage = stageSpecs[Math.min(index * 2, stageSpecs.length - 1)];
    const stageResources = stage.resourceKeys.map((key) => resources[key]);

    return {
      ...phase,
      id: `cyber-roadmap-${index + 1}`,
      phaseNumber: index + 1,
      title: sections[0],
      goal: `Build defensible capability across ${sections.slice(1).join(", ")}.`,
      sections: [...sections],
      mentorTip:
        "Tie conclusions to observable evidence, asset context, uncertainty, risk, and an accountable next action.",
      practicalMissions: [stage.tasks[0], stage.tasks[1]],
      expectedOutcome: `You can investigate and explain work across ${sections
        .slice(1)
        .join(", ")}.`,
      lessons: sections.slice(1, 4).map((section, lessonIndex) =>
        lesson(
          `cyber-roadmap-${index + 1}-lesson-${lessonIndex + 1}`,
          section,
          `Develop practical Cybersecurity Analyst capability in ${section.toLowerCase()}.`,
          [
            `Explain ${section.toLowerCase()} in defensive operations.`,
            `Apply ${section.toLowerCase()} to a realistic scenario.`,
            "Produce evidence another analyst can review.",
          ],
          `Create a portfolio-ready artifact demonstrating ${section.toLowerCase()}.`,
          stageResources,
          index === 0
            ? "Beginner"
            : index >= 4
              ? "Advanced"
              : "Intermediate",
        ),
      ),
      quiz: {
        id: `cyber-roadmap-${index + 1}-quiz`,
        phaseId: `cyber-roadmap-${index + 1}`,
        title: `${sections[0]} checkpoint`,
        description: `Validate practical understanding of ${sections
          .slice(1)
          .join(", ")}.`,
        questions: [...stage.questions],
      },
    };
  },
);

const cybersecurityAnalystBase: CareerWorkspaceData = {
  ...legacyCybersecurityLayout,
  slug: "cybersecurity-analyst",
  title: "Cybersecurity Analyst",
  titleAliases: undefined,
  category: "AI Infrastructure & Security",
  visual: {
    nodeLabel: "Cybersecurity Analyst",
    sceneTitle: "Security Operations and Threat Defense Center",
    sceneDescription:
      "A defensive operations environment connecting telemetry, identities, endpoints, networks, cloud controls, detections, investigations, incidents, recovery, and governance.",
    imageAlt:
      "Cybersecurity analyst investigating security telemetry, identity events, endpoint activity, cloud logs, and incident evidence.",
  },
  shortDescription:
    "Monitor, investigate, contain, and reduce cyber risk through security operations, detection engineering, incident response, vulnerability management, identity defense, cloud security, and evidence-based governance.",
  difficulty: "Intermediate",
  estimatedLearningTime: "8-12 months part-time",
  salary:
    "Varies by country, seniority, industry, certification, and operational scope",
  hiringDemand:
    "Strong across regulated organizations, technology companies, cloud environments, critical infrastructure, consulting, and managed security services",
  remoteAvailability:
    "Medium to High depending on incident-response, access, and on-call requirements",
  aiCompatibilityScore: "88%",
  bestFor: [
    "Investigative problem solvers",
    "Risk-aware systems thinkers",
    "People who remain methodical under pressure",
    "Professionals who value evidence and operational responsibility",
  ],
  programmingRequirement:
    "Low to Moderate: PowerShell, shell, Python, query languages, regular expressions, and log parsing",
  mathRequirement:
    "Low to Moderate: baselines, rates, probability, risk scoring, and analytical reasoning",
  creativityLevel: "High",
  communicationLevel: "High",
  lastUpdated: "2026-08-02",
  metrics: [
    {
      label: "Primary outcome",
      value: "Reduced cyber risk",
      detail:
        "Detection, response, controls, and remediation must protect real operations.",
    },
    {
      label: "Evidence standard",
      value: "Reproducible investigations",
      detail:
        "Findings remain traceable to logs, timelines, sources, confidence, and decisions.",
    },
    {
      label: "Operating focus",
      value: "Detect to recover",
      detail:
        "Monitoring, investigation, containment, recovery, and learning form one lifecycle.",
    },
    {
      label: "Professional standard",
      value: "Defensible judgment",
      detail:
        "Analysts distinguish facts from assumptions and communicate uncertainty.",
    },
  ],
  overview: {
    title: "What does a Cybersecurity Analyst do?",
    body:
      "A Cybersecurity Analyst protects systems, identities, data, and operations by turning telemetry into evidence, evidence into decisions, and decisions into measurable risk reduction.",
    responsibilities: [
      "Monitor and triage security events and alerts",
      "Investigate identity, endpoint, network, application, and cloud behavior",
      "Create, test, tune, and document detection rules",
      "Contain incidents and coordinate recovery",
      "Prioritize vulnerabilities using exploitability and asset context",
      "Review identity, endpoint, network, and cloud control effectiveness",
      "Preserve evidence, timelines, reasoning, and lessons learned",
      "Communicate risk, ownership, and defensive improvement",
    ],
    industries: [
      "Financial services",
      "Healthcare",
      "Retail",
      "Technology",
      "Manufacturing",
      "Public sector",
      "Critical infrastructure",
      "Cybersecurity consulting and managed services",
    ],
  },
  journeyMap: {
    ...legacyCybersecurityLayout.journeyMap,
    theme: "cyber-fortress",
    overviewTitle: "Cybersecurity Analyst Defense Journey",
    overviewDescription:
      "Progress from technical foundations to production-grade monitoring, detection, investigation, response, governance, and employment readiness.",
  },
  journeyStages,
  roadmap,
  projects: [
    {
      id: "cyber-project-siem-detection",
      title: "SIEM Detection and Investigation Lab",
      difficulty: "Intermediate",
      estimatedTime: "30-45 hours",
      phaseId: "cyber-roadmap-2",
      description:
        "Ingest identity, endpoint, and network logs; write detections; tune false positives; investigate alerts; and document evidence.",
      deliverables: [
        "Telemetry inventory",
        "Three detection rules",
        "Validation dataset",
        "Investigation case notes",
        "Tuning and coverage report",
      ],
      skills: [
        "SIEM",
        "Log analysis",
        "Detection engineering",
        "Alert triage",
        "Documentation",
      ],
    },
    {
      id: "cyber-project-incident-response",
      title: "Incident Investigation and Response Case",
      difficulty: "Intermediate",
      estimatedTime: "35-50 hours",
      phaseId: "cyber-roadmap-3",
      description:
        "Reconstruct a simulated compromise, scope affected assets, select containment actions, coordinate recovery, and report.",
      deliverables: [
        "Evidence register",
        "Incident timeline",
        "Containment decision record",
        "Recovery plan",
        "Lessons-learned report",
      ],
      skills: [
        "Incident response",
        "Timeline analysis",
        "Evidence handling",
        "Containment",
        "Risk communication",
      ],
    },
    {
      id: "cyber-project-exposure-management",
      title: "Vulnerability and Identity Exposure Program",
      difficulty: "Advanced",
      estimatedTime: "45-65 hours",
      phaseId: "cyber-roadmap-4",
      description:
        "Prioritize vulnerability and identity risk using exploitability, exposure, asset criticality, controls, and remediation evidence.",
      deliverables: [
        "Exposure inventory",
        "Risk-prioritization model",
        "Remediation backlog",
        "Exception register",
        "Executive risk dashboard",
      ],
      skills: [
        "Vulnerability management",
        "IAM",
        "Risk prioritization",
        "Remediation governance",
        "Metrics",
      ],
    },
    {
      id: "cyber-project-capstone",
      title: "Cyber Defense Operations Capstone",
      difficulty: "Advanced",
      estimatedTime: "70-100 hours",
      phaseId: "cyber-roadmap-5",
      description:
        "Design and defend a small security operating model covering telemetry, ATT&CK coverage, detections, incidents, exposure, metrics, and improvement.",
      deliverables: [
        "SOC operating model",
        "Telemetry and coverage map",
        "Detection pack",
        "Incident playbook",
        "Risk and metrics report",
        "Portfolio case study",
      ],
      skills: [
        "SOC operations",
        "Detection",
        "Incident response",
        "Governance",
        "Security architecture",
        "Communication",
      ],
    },
  ],
  globalResources: Object.values(resources),
  finalChallenge: {
    title: "Cybersecurity Analyst Operational Readiness Review",
    description:
      "Present and defend an end-to-end cyber defense engagement before simulated technical and business reviewers.",
    requirements: [
      "Evidence-based scope and risk model",
      "Telemetry and detection coverage",
      "Reproducible investigation",
      "Containment and recovery decisions",
      "Exposure and control improvement",
      "Clear technical and executive communication",
    ],
    deliverables: [
      "Executive summary",
      "Evidence and timeline package",
      "Detection and coverage report",
      "Incident-response plan",
      "Risk and remediation register",
      "Portfolio case study",
    ],
    evaluation: [
      "Technical accuracy",
      "Investigative reasoning",
      "Evidence quality",
      "Risk prioritization",
      "Operational practicality",
      "Communication",
    ],
  },
  relatedCareers: [
    "Security Operations Analyst",
    "SOC Analyst",
    "Cloud Security Analyst",
    "Incident Response Analyst",
    "Detection Engineer",
    "DevSecOps Engineer",
  ],
  portfolioTasks: [
    {
      id: "cyber-portfolio-1",
      title: "Publish a SIEM detection and investigation case study",
      description:
        "Show data sources, query logic, validation, triage, evidence, tuning, and limitations.",
      type: "portfolio",
    },
    {
      id: "cyber-portfolio-2",
      title: "Publish an incident-response report and timeline",
      description:
        "Show provenance, scope, decisions, containment, recovery, and lessons learned.",
      type: "portfolio",
    },
    {
      id: "cyber-portfolio-3",
      title: "Publish an exposure-reduction plan",
      description:
        "Show vulnerability, identity, cloud, and business context with remediation priorities.",
      type: "portfolio",
    },
  ],
  jobSearchTasks: [
    {
      id: "cyber-job-1",
      title: "Build a defensive-security title matrix",
      description:
        "Track Cybersecurity Analyst, SOC Analyst, Security Operations Analyst, Incident Response Analyst, and adjacent titles.",
      type: "job-search",
    },
    {
      id: "cyber-job-2",
      title: "Map vacancy requirements to portfolio evidence",
      description:
        "Link SIEM, detection, incident, identity, cloud, and vulnerability requirements to artifacts.",
      type: "job-search",
    },
    {
      id: "cyber-job-3",
      title: "Run a targeted security application cycle",
      description:
        "Prioritize roles by evidence fit, scope, technology stack, and development potential.",
      type: "job-search",
    },
  ],
  interviewPrep: {
    title: "Cybersecurity Analyst Interview Preparation",
    practiceAreas: [
      "Networking and operating systems",
      "SIEM and log analysis",
      "Detection engineering",
      "Incident response",
      "Threat intelligence",
      "Identity security",
      "Vulnerability management",
      "Cloud security",
      "Risk communication",
    ],
    questions: [
      "How would you investigate an impossible-travel alert?",
      "What logs would you use for suspicious PowerShell activity?",
      "How do you tune a noisy detection without hiding real attacks?",
      "Walk through the incident-response lifecycle using an example.",
      "How would you prioritize vulnerabilities across hundreds of assets?",
      "Explain authentication, authorization, MFA, and least privilege.",
      "How would you investigate a compromised cloud administrator account?",
      "How do you communicate technical security risk to a business owner?",
      "What evidence would convince you that containment succeeded?",
      "How do you measure defensive coverage and blind spots?",
    ],
  },
};

export const cybersecurityAnalystCareer =
  applyCareerTitleAliasPolicy(cybersecurityAnalystBase);
