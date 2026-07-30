import {
  CAREER_ASSESSMENT_PASSING_SCORE,
  CAREER_ASSESSMENT_QUESTION_COUNT,
} from "@/lib/assessmentPolicy";
import type {
  CareerAssessment,
  CareerQuizQuestion,
} from "@/types/careerWorkspace";

type StageAssessmentProfile = {
  referenceId: string;
  evidence: string;
  firstDecision: string;
  control: string;
  metric: string;
  judgment: string;
};

const profiles: Record<string, StageAssessmentProfile> = {
  orientation: {
    referenceId: "journey-ms-learn-ai",
    evidence: "A written target-role analysis that maps current skills, gaps, and one realistic first project",
    firstDecision: "Compare target job requirements with current evidence before choosing courses",
    control: "Set a bounded learning scope and review it against a target role every two weeks",
    metric: "The percentage of target-role requirements supported by demonstrable evidence",
    judgment: "Choose a role direction first, then select only the learning that closes verified gaps",
  },
  foundations: {
    referenceId: "journey-fcc-python",
    evidence: "A tested Python program that reads data, handles invalid input, and explains its own design choices",
    firstDecision: "Clarify inputs, outputs, constraints, and failure cases before writing the implementation",
    control: "Use validation, exceptions, tests, and version control for every small program",
    metric: "Automated test pass rate across normal, boundary, and invalid inputs",
    judgment: "Prefer a simple readable solution whose behavior can be tested over an unfamiliar complex framework",
  },
  "core-skills": {
    referenceId: "journey-openai-docs",
    evidence: "An evaluated AI application with a fixed test set, structured outputs, safety checks, and documented failure cases",
    firstDecision: "Define the user task and evaluation criteria before selecting a model or prompt pattern",
    control: "Validate model output against a schema and route uncertain or unsafe cases to a fallback",
    metric: "Task success on a representative evaluation set, segmented by important failure category",
    judgment: "Use retrieval, tools, or fine-tuning only when evaluation evidence shows the simpler baseline is insufficient",
  },
  "professional-tools": {
    referenceId: "journey-github-docs",
    evidence: "A reproducible repository with reviewable commits, tests, environment instructions, and automated checks",
    firstDecision: "Create a small reproducible baseline and record dependencies before expanding the system",
    control: "Protect changes with branches, pull-request review, tests, and secret-safe configuration",
    metric: "The rate of changes that pass automated quality checks before merge",
    judgment: "Select tools by reproducibility, team support, and operational needs rather than popularity",
  },
  "real-projects": {
    referenceId: "journey-dlai-mlops",
    evidence: "An end-to-end project with a baseline, evaluation report, deployed demo, monitoring plan, and failure analysis",
    firstDecision: "Translate the user problem into measurable acceptance criteria and a baseline",
    control: "Separate training or prompt experiments from the versioned evaluation and deployment pipeline",
    metric: "User-relevant quality and reliability compared with the documented baseline",
    judgment: "Reduce project scope when necessary while preserving a complete, measurable delivery loop",
  },
  "portfolio-building": {
    referenceId: "journey-github-docs",
    evidence: "Three concise case studies showing the problem, architecture, trade-offs, evaluation, failures, and outcome",
    firstDecision: "Choose projects that demonstrate different capabilities required by the target role",
    control: "Remove secrets and sensitive data while keeping setup and evaluation reproducible",
    metric: "The share of portfolio claims backed by inspectable code, results, or a working demonstration",
    judgment: "Explain limitations and rejected alternatives instead of presenting a demo as production-ready",
  },
  "resume-prep": {
    referenceId: "journey-ibm-skillsbuild",
    evidence: "Resume bullets that connect an action and technical scope to a verified result without overstating ownership",
    firstDecision: "Extract the role's recurring requirements and map each one to truthful evidence",
    control: "Review every claim for accuracy, context, and proof before publishing the resume",
    metric: "The proportion of priority job requirements supported by a specific resume example",
    judgment: "Use precise scope and measurable outcomes instead of unsupported AI keywords",
  },
  "profile-optimization": {
    referenceId: "journey-github-docs",
    evidence: "A consistent LinkedIn and GitHub profile that makes specialization and strongest evidence clear within one minute",
    firstDecision: "Define the one professional message the target audience should understand immediately",
    control: "Keep titles, dates, skills, links, and project claims consistent across public profiles",
    metric: "The percentage of profile visits that continue to a relevant project or contact action",
    judgment: "Prioritize clear evidence and navigation over a long list of tools",
  },
  "job-search-strategy": {
    referenceId: "journey-ibm-skillsbuild",
    evidence: "A target-company and role matrix linked to evidence gaps, tailored applications, referrals, and follow-up",
    firstDecision: "Define target roles, seniority, location, and non-negotiable constraints before applying",
    control: "Track applications and review outcomes weekly to prevent repetitive untargeted submissions",
    metric: "Qualified interview conversations per targeted application",
    judgment: "Apply where evidence substantially matches the role and close recurring gaps deliberately",
  },
  "live-jobs": {
    referenceId: "journey-ms-learn-ai",
    evidence: "A verified vacancy shortlist with source links, posting dates, requirements, and evidence-based fit notes",
    firstDecision: "Verify that each vacancy is current and comes from the employer or a trustworthy listing source",
    control: "Treat missing salary, duplicated listings, and stale dates as data-quality flags",
    metric: "The percentage of shortlisted vacancies that remain active and meet the target criteria",
    judgment: "Separate verified listing facts from inferred fit or compensation expectations",
  },
  "interview-prep": {
    referenceId: "journey-ms-ai-credentials",
    evidence: "Recorded mock interviews that explain system boundaries, trade-offs, evaluation, incidents, and business impact",
    firstDecision: "Clarify users, constraints, success measures, data sensitivity, and failure cost before proposing architecture",
    control: "State assumptions explicitly and include evaluation, security, monitoring, and rollback in the design",
    metric: "The percentage of mock answers that include evidence, trade-offs, and a clear decision rationale",
    judgment: "Say what you would verify instead of inventing certainty when a scenario is underspecified",
  },
  "final-assessment": {
    referenceId: "journey-ms-ai-credentials",
    evidence: "A defended capstone and readiness audit covering engineering, evaluation, operations, portfolio, and communication",
    firstDecision: "Compare all evidence with the target-role rubric and identify the highest-risk remaining gap",
    control: "Require reproducible evidence for every readiness claim and record unresolved limitations",
    metric: "Rubric coverage across technical delivery, reliability, responsible AI, and professional communication",
    judgment: "Delay broad applications when a critical capability lacks evidence, while continuing targeted opportunities",
  },
  "ready-to-apply": {
    referenceId: "journey-ms-ai-credentials",
    evidence: "A repeatable application, interview, learning, and portfolio-improvement system informed by market feedback",
    firstDecision: "Prioritize the next action using current pipeline data and the most frequent feedback gap",
    control: "Time-box market monitoring and protect consistent practice and delivery time",
    metric: "Progression from targeted application to interview and from interview to next stage",
    judgment: "Update evidence and targeting from patterns in feedback rather than reacting to one rejection",
  },
  "automation-orientation": {
    referenceId: "automation-ms-power-platform-training",
    evidence: "A ranked automation backlog plus a justified primary stack and baseline skills assessment",
    firstDecision: "Measure process value, frequency, risk, and feasibility before selecting an automation tool",
    control: "Exclude unsafe or poorly understood processes from the first delivery backlog",
    metric: "Expected hours saved or errors avoided, adjusted for delivery and operational risk",
    judgment: "Choose one primary stack that fits the target environment and learn adjacent tools only when required",
  },
  "process-foundations": {
    referenceId: "automation-power-automate-docs",
    evidence: "Current-state and future-state process maps with actors, rules, exceptions, data, ownership, and acceptance criteria",
    firstDecision: "Observe the real process and confirm exceptions with process owners before designing automation",
    control: "Document exception paths and human decision points instead of automating only the happy path",
    metric: "The proportion of real process cases represented by validated requirements and test scenarios",
    judgment: "Improve or simplify a broken process before reproducing it in automation",
  },
  "workflow-engineering": {
    referenceId: "automation-power-automate-docs",
    evidence: "A modular workflow with idempotency, approvals, retries, audit history, and recovery tests",
    firstDecision: "Define trigger semantics, state, side effects, and duplicate behavior before building actions",
    control: "Use an idempotency key and persist execution state before a non-reversible side effect",
    metric: "Successful business transactions without duplicate side effects, including retry scenarios",
    judgment: "Split long workflows into owned components with explicit contracts and recovery behavior",
  },
  "ai-integration": {
    referenceId: "automation-copilot-studio-docs",
    evidence: "An AI-assisted workflow with grounded context, schema validation, confidence handling, human review, and safety tests",
    firstDecision: "Determine whether the task requires probabilistic AI or can be solved reliably with deterministic rules",
    control: "Constrain tools and validate outputs before an AI response can trigger a consequential action",
    metric: "Correctly completed cases plus safe escalation rate on a representative evaluation set",
    judgment: "Keep approval with a human when impact is high or model confidence cannot be validated",
  },
  "data-integrations": {
    referenceId: "automation-postman-docs",
    evidence: "A secure two-system synchronization with a data contract, pagination, rate-limit handling, and reconciliation",
    firstDecision: "Define source of truth, identifiers, ownership, and update conflict rules before mapping fields",
    control: "Use least-privilege credentials, validated payloads, bounded retries, and reconciliation records",
    metric: "Reconciled records divided by expected records, segmented by failure reason",
    judgment: "Use asynchronous processing when provider limits or workload duration make synchronous completion unreliable",
  },
  "production-governance": {
    referenceId: "automation-owasp-genai",
    evidence: "A monitored automation with access controls, tests, alerts, runbook, owner, rollback, and incident review",
    firstDecision: "Classify data, business impact, dependencies, and failure modes before production approval",
    control: "Apply least privilege, secret management, output validation, audit logs, and an operational kill switch",
    metric: "Successful run rate and business outcome, segmented by failure category and manual intervention",
    judgment: "Block release when ownership or safe recovery is undefined, even if the demo succeeds",
  },
  "automation-projects": {
    referenceId: "automation-uipath-docs",
    evidence: "A production-style capstone with requirements, architecture, tests, controls, monitoring, UAT, and measured value",
    firstDecision: "Agree on baseline performance and acceptance criteria with stakeholders before implementation",
    control: "Test normal, exception, permission, retry, and rollback scenarios before user acceptance",
    metric: "Verified business benefit after subtracting manual exceptions, maintenance, and operating cost",
    judgment: "Prefer a smaller solution adopted by users over a broad automation that cannot be supported",
  },
  "automation-portfolio": {
    referenceId: "journey-github-docs",
    evidence: "Three business-readable case studies with process maps, architecture, demos, controls, results, and limitations",
    firstDecision: "Select case studies that collectively prove discovery, integration, AI judgment, and production reliability",
    control: "Anonymize business data and remove credentials while retaining credible technical detail",
    metric: "The percentage of solution claims traceable to a demo, artifact, test, or measured result",
    judgment: "Show failure handling and governance because a happy-path demo is insufficient professional evidence",
  },
  "automation-career-assets": {
    referenceId: "automation-ms-power-platform-training",
    evidence: "A resume and public profile that connect process change, solution architecture, controls, and verified outcomes",
    firstDecision: "Map target-role language to truthful project evidence before rewriting profile text",
    control: "Separate personal projects, prototypes, and production experience explicitly",
    metric: "Priority role requirements supported by a specific bullet, case study, or credential",
    judgment: "Position yourself as a solution designer and delivery specialist, not only as a tool operator",
  },
  "automation-job-search": {
    referenceId: "automation-ms-power-platform-training",
    evidence: "A role matrix spanning automation, Power Platform, integration, AI solutions, and transformation titles",
    firstDecision: "Group vacancies by actual responsibilities and stack rather than relying on job titles alone",
    control: "Verify vacancy source, scope, seniority, and location before tailoring an application",
    metric: "Relevant recruiter or hiring-manager responses per evidence-matched application",
    judgment: "Tailor the most relevant case study instead of sending every project to every role",
  },
  "automation-interview": {
    referenceId: "automation-copilot-studio-docs",
    evidence: "Mock solution reviews that cover discovery, deterministic versus AI choices, integrations, controls, ROI, and adoption",
    firstDecision: "Ask about process volume, exceptions, systems, data sensitivity, users, and cost of failure",
    control: "Define human approval, access boundaries, monitoring, and recovery for consequential automation actions",
    metric: "Scenario rubric coverage across business value, architecture, reliability, security, and communication",
    judgment: "Challenge the premise when automation would add more risk or cost than value",
  },
  "automation-final-assessment": {
    referenceId: "automation-owasp-genai",
    evidence: "A capstone defense proving discovery, architecture, AI boundaries, reliability, governance, value, and supportability",
    firstDecision: "Audit the proposed solution against business acceptance, security, operations, and ownership criteria",
    control: "Require evidence for permissions, data handling, evaluation, monitoring, rollback, and incident ownership",
    metric: "Readiness rubric coverage plus unresolved high-impact risks",
    judgment: "Do not approve production readiness while a high-impact failure lacks detection and recovery",
  },
  "automation-ready": {
    referenceId: "automation-ms-power-platform-training",
    evidence: "A sustainable system for targeted applications, feedback review, portfolio improvement, and platform updates",
    firstDecision: "Use current market feedback to choose the next highest-value evidence or skill improvement",
    control: "Review platform changes against official documentation before changing a working production pattern",
    metric: "Application-pipeline progression and portfolio improvements completed per review cycle",
    judgment: "Keep learning tied to target-role evidence instead of chasing every new automation feature",
  },
};

function question(
  id: string,
  prompt: string,
  correct: string,
  distractors: [string, string, string],
  explanation: string,
  topic: string,
  referenceId: string
): CareerQuizQuestion {
  return {
    id,
    question: prompt,
    answers: [correct, ...distractors],
    correctAnswerIndex: 0,
    explanation,
    difficulty: "Intermediate",
    relatedTopic: topic,
    learningObjectiveId: `${id}-objective`,
    skillLevel: "Intermediate",
    questionType: "multiple-choice",
    referenceId,
    status: "active",
    lastReviewedAt: "2026-07-30",
    version: 2,
  };
}

export function createSectionQuestions(
  stageId: string,
  topic: string,
  completionSignal: string
): CareerQuizQuestion[] {
  const profile = profiles[stageId] ?? {
    referenceId: "journey-ibm-skillsbuild",
    evidence: completionSignal,
    firstDecision: "Clarify the goal, constraints, and success criteria before selecting an implementation",
    control: "Test the important failure cases and document ownership before release",
    metric: "A measure tied directly to user value and solution quality",
    judgment: "Choose the simplest supportable approach that satisfies verified requirements",
  };

  const questions = [
    question(
      `${stageId}-q1`,
      `A reviewer asks for the strongest evidence of competence in ${topic}. Which response is best?`,
      profile.evidence,
      [
        "A list of tools with no linked work",
        "A course completion screenshot with no applied result",
        "A claim that the topic was covered informally",
      ],
      "Professional qualification requires inspectable evidence, not familiarity claims.",
      topic,
      profile.referenceId
    ),
    question(
      `${stageId}-q2`,
      `You receive an ambiguous scenario involving ${topic}. What should you do first?`,
      profile.firstDecision,
      [
        "Choose the newest platform before clarifying the problem",
        "Build the full solution and ask for requirements afterward",
        "Copy an architecture from an unrelated example",
      ],
      "Strong exam and workplace judgment begins by resolving the decision that controls the rest of the solution.",
      topic,
      profile.referenceId
    ),
    question(
      `${stageId}-q3`,
      `Which control most directly improves safety and reliability for ${topic}?`,
      profile.control,
      [
        "Hide failures from users and retry forever",
        "Give every component administrator access",
        "Depend on manual memory instead of a documented control",
      ],
      "The correct control addresses likely failure modes while keeping behavior observable and recoverable.",
      topic,
      profile.referenceId
    ),
    question(
      `${stageId}-q4`,
      `Which measure provides the most useful decision signal for ${topic}?`,
      profile.metric,
      [
        "The number of tools named in the solution",
        "The total number of dashboard colors",
        "The number of hours spent without reference to outcome",
      ],
      "Useful measures connect evidence or system behavior to the intended outcome.",
      topic,
      profile.referenceId
    ),
    question(
      `${stageId}-q5`,
      `Which statement demonstrates the strongest professional judgment about ${topic}?`,
      profile.judgment,
      [
        "More components always produce a more professional solution",
        "A successful demo removes the need for evaluation",
        "Official documentation can be ignored once a tutorial works",
      ],
      "Professional judgment balances value, evidence, risk, maintainability, and explicit trade-offs.",
      topic,
      profile.referenceId
    ),
  ];

  if (questions.length !== CAREER_ASSESSMENT_QUESTION_COUNT) {
    throw new Error(`Expected ${CAREER_ASSESSMENT_QUESTION_COUNT} questions for ${stageId}.`);
  }

  return questions;
}

export function createPhaseAssessment(
  stageId: string,
  title: string,
  topic: string
): CareerAssessment {
  const profile = profiles[stageId];
  const referenceId = profile?.referenceId ?? "journey-ibm-skillsbuild";

  return {
    id: `${stageId}-phase-exam`,
    title,
    description: `Original Career OS scenario assessment aligned with reputable learning objectives for ${topic}; it is not an official vendor exam.`,
    passingScore: CAREER_ASSESSMENT_PASSING_SCORE,
    durationMinutes: 12,
    questions: [
      question(
        `${stageId}-exam-q1`,
        `A proposed ${topic} solution works in a demo but requirements are incomplete. What is the best next action?`,
        "Return to the unresolved requirements, define acceptance criteria, and test a bounded version",
        [
          "Release immediately because the demo succeeded",
          "Add more platforms before collecting evidence",
          "Remove the documented limitations",
        ],
        "A credible solution is judged against explicit requirements and representative tests.",
        topic,
        referenceId
      ),
      question(
        `${stageId}-exam-q2`,
        `Two approaches to ${topic} meet the happy path. How should the team choose between them?`,
        "Compare them using user value, failure behavior, security, cost, and supportability",
        [
          "Choose the approach with the longest feature list",
          "Choose whichever was mentioned most recently online",
          "Ignore operational requirements until after launch",
        ],
        "Scenario assessments reward defensible trade-offs rather than tool preference.",
        topic,
        referenceId
      ),
      question(
        `${stageId}-exam-q3`,
        `A test of ${topic} fails only on an important edge case. What is the most professional response?`,
        "Record the failure, fix or safely handle it, and add the case to regression evaluation",
        [
          "Delete the edge case from the evaluation",
          "Report only the average score",
          "Retry manually until it passes once",
        ],
        "Important failures must become visible, handled, and repeatably tested.",
        topic,
        referenceId
      ),
      question(
        `${stageId}-exam-q4`,
        `Which documentation is most valuable when another professional inherits work on ${topic}?`,
        "Purpose, assumptions, architecture, decisions, controls, known failures, ownership, and recovery steps",
        [
          "Only a screenshot of the final interface",
          "Only the package or connector list",
          "A statement that the design is self-explanatory",
        ],
        "Operational documentation preserves the reasoning and safe-use boundaries needed for maintenance.",
        topic,
        referenceId
      ),
      question(
        `${stageId}-exam-q5`,
        `After scoring below the qualification threshold in ${topic}, what should the learner do?`,
        "Review the missed objectives, rebuild a focused example, and retry with a new attempt",
        [
          "Unlock every later step anyway",
          "Memorize the answer positions",
          "Change the stored result manually",
        ],
        "Assessment failure should trigger targeted learning and new evidence, not bypass the progression rule.",
        topic,
        referenceId
      ),
    ],
  };
}
