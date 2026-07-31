import {
  CAREER_ASSESSMENT_PASSING_SCORE,
  CAREER_ASSESSMENT_QUESTION_COUNT,
  CAREER_PHASE_ASSESSMENT_PASSING_SCORE,
  CAREER_PHASE_ASSESSMENT_QUESTION_COUNT,
  CAREER_SECTION_QUESTION_POOL_SIZE,
} from "@/lib/assessmentPolicy";
import type {
  CareerAssessment,
  CareerQuizQuestion,
  CareerWorkspaceData,
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
    question(
      `${stageId}-q6`,
      `Before claiming proficiency in ${topic}, what should the learner verify?`,
      `That the claimed capability is demonstrated by ${completionSignal}`,
      [
        "That the tool name appears on the resume",
        "That one tutorial was watched without practice",
        "That no limitations are mentioned",
      ],
      "A qualification claim should be supported by observable work and a clear completion signal.",
      topic,
      profile.referenceId
    ),
    question(
      `${stageId}-q7`,
      `A first attempt in ${topic} succeeds only on the happy path. What is the best next step?`,
      "Test boundary, invalid, permission, and recovery scenarios before treating it as reliable",
      [
        "Publish it immediately",
        "Remove error reporting",
        "Add unrelated features",
      ],
      "Reliable work demonstrates how important failure paths are detected and handled.",
      topic,
      profile.referenceId
    ),
    question(
      `${stageId}-q8`,
      `Which review comment is most useful for improving work in ${topic}?`,
      "A specific observation linked to a requirement, risk, or measurable outcome",
      [
        "Make it more impressive",
        "Use more tools",
        "It looks fine",
      ],
      "Actionable feedback is specific, evidence-based, and connected to the intended outcome.",
      topic,
      profile.referenceId
    ),
    question(
      `${stageId}-q9`,
      `When an official source and an old tutorial disagree about ${topic}, what should guide the implementation?`,
      "Verify current behavior in the official documentation and record the applicable version",
      [
        "Use the oldest source",
        "Choose the shortest explanation",
        "Combine both without testing",
      ],
      "Current first-party documentation is the stronger source for platform-specific behavior.",
      topic,
      profile.referenceId
    ),
    question(
      `${stageId}-q10`,
      `Which practice best makes progress in ${topic} durable?`,
      "Apply the concept in a bounded task, review the result, and record what failed and why",
      [
        "Repeat the same answer wording",
        "Collect bookmarks without using them",
        "Avoid feedback until the end",
      ],
      "Application, feedback, and reflection create stronger evidence than passive familiarity.",
      topic,
      profile.referenceId
    ),
    question(
      `${stageId}-q11`,
      `A solution for ${topic} meets the goal but is difficult to maintain. What is the strongest response?`,
      "Simplify the design or document a justified trade-off with clear ownership",
      [
        "Hide the complexity",
        "Assume future maintainers will understand it",
        "Add another platform",
      ],
      "Maintainability and ownership are part of professional solution quality.",
      topic,
      profile.referenceId
    ),
    question(
      `${stageId}-q12`,
      `Which evidence best supports a decision made during ${topic}?`,
      "A documented comparison using requirements, test results, risks, and constraints",
      [
        "Personal preference alone",
        "A vendor logo",
        "The number of available features",
      ],
      "A defensible decision connects the selected approach to evidence and constraints.",
      topic,
      profile.referenceId
    ),
    question(
      `${stageId}-q13`,
      `A learner repeatedly misses one objective in ${topic}. What is the most effective remediation?`,
      "Return to the exact source section, build a focused example, and test the objective again",
      [
        "Retake immediately without review",
        "Memorize the option position",
        "Skip the objective permanently",
      ],
      "Targeted remediation addresses the missed objective before a fresh assessment attempt.",
      topic,
      profile.referenceId
    ),
    question(
      `${stageId}-q14`,
      `What should be recorded when completing practical work in ${topic}?`,
      "Inputs, assumptions, decisions, results, failures, and the next improvement",
      [
        "Only the successful screenshot",
        "Only time spent",
        "Only the tool list",
      ],
      "A useful learning record preserves both evidence and reasoning.",
      topic,
      profile.referenceId
    ),
    question(
      `${stageId}-q15`,
      `Which outcome most strongly indicates readiness to continue beyond ${topic}?`,
      "The learner can apply the objective in a new scenario and explain the trade-offs",
      [
        "The learner recognizes the terminology",
        "The learner has opened every link",
        "The learner can repeat one example exactly",
      ],
      "Transfer to a new scenario is stronger evidence of understanding than recognition or repetition.",
      topic,
      profile.referenceId
    ),
  ];

  if (questions.length !== CAREER_SECTION_QUESTION_POOL_SIZE) {
    throw new Error(`Expected ${CAREER_SECTION_QUESTION_POOL_SIZE} questions for ${stageId}.`);
  }

  return questions;
}

export function createTopicAssessment(
  stageId: string,
  topic: string,
  topicIndex: number,
  completionSignal: string
): CareerAssessment {
  const topicId = `${stageId}-topic-${topicIndex + 1}`;
  return {
    id: `${topicId}-assessment`,
    title: `${topic} topic assessment`,
    description: `Five questions are selected from a 15-question bank focused on ${topic}.`,
    assessmentType: "topic",
    topicId,
    topicLabel: topic,
    passingScore: CAREER_ASSESSMENT_PASSING_SCORE,
    durationMinutes: 10,
    questionsPerAttempt: CAREER_ASSESSMENT_QUESTION_COUNT,
    questions: createSectionQuestions(topicId, topic, completionSignal),
  };
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
    assessmentType: "comprehensive",
    passingScore: CAREER_PHASE_ASSESSMENT_PASSING_SCORE,
    durationMinutes: 25,
    questionsPerAttempt: CAREER_PHASE_ASSESSMENT_QUESTION_COUNT,
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
      ...Array.from({ length: 15 }, (_, offset) => {
        const number = offset + 6;
        const scenarios = [
          {
            prompt: `A stakeholder asks to expand the ${topic} solution before its baseline is measured. What should happen first?`,
            correct: "Measure the baseline and agree on acceptance criteria before expanding scope",
            distractors: ["Expand immediately", "Remove the baseline", "Measure only feature count"],
            explanation: "A baseline makes improvement and trade-offs measurable.",
          },
          {
            prompt: `An important assumption in ${topic} has not been validated. What is the safest decision?`,
            correct: "Make the assumption explicit and validate it with a bounded test before relying on it",
            distractors: ["Treat it as fact", "Hide it from the review", "Add more dependencies"],
            explanation: "Unverified assumptions should remain visible and be tested before consequential use.",
          },
          {
            prompt: `A ${topic} implementation passes average-quality checks but fails for one high-impact group. How should it be evaluated?`,
            correct: "Segment the results, address the high-impact failure, and define an appropriate release gate",
            distractors: ["Report only the average", "Delete the segment", "Lower every quality check"],
            explanation: "Important segmented failures cannot be hidden by an acceptable average.",
          },
          {
            prompt: `The owner of a ${topic} control is leaving the team. What protects continuity?`,
            correct: "Assign a new owner and verify the runbook, access, alerts, and recovery procedure",
            distractors: ["Rely on memory", "Disable monitoring", "Remove the control"],
            explanation: "Operational controls require explicit ownership and usable recovery documentation.",
          },
          {
            prompt: `A lower-cost approach to ${topic} performs nearly as well as the preferred option. What is the best choice process?`,
            correct: "Compare quality, risk, latency, maintenance, and total cost against the actual requirement",
            distractors: ["Always choose the expensive option", "Ignore quality", "Select by brand recognition"],
            explanation: "The correct trade-off depends on requirements and total operating impact.",
          },
          {
            prompt: `A test set for ${topic} contains examples copied from the development work. What is the main concern?`,
            correct: "The evaluation may overstate generalization because the evidence is not sufficiently independent",
            distractors: ["The test set is too documented", "The project has too many owners", "The interface may be too simple"],
            explanation: "Evaluation evidence should represent unseen or independently selected cases.",
          },
          {
            prompt: `A change to ${topic} improves one metric but worsens a critical safety measure. What should the team do?`,
            correct: "Apply the agreed safety gate and investigate the trade-off before release",
            distractors: ["Release based on the improved metric", "Stop measuring safety", "Average the metrics without context"],
            explanation: "Critical release gates should not be overridden by unrelated aggregate improvement.",
          },
          {
            prompt: `Which handoff best supports another person maintaining ${topic}?`,
            correct: "A reproducible setup, decision record, tests, monitoring, known limitations, and recovery steps",
            distractors: ["A demo video only", "A tool list only", "An undocumented working environment"],
            explanation: "A professional handoff covers reproduction, reasoning, validation, and operations.",
          },
          {
            prompt: `A requirement for ${topic} conflicts with data-access policy. What is the correct response?`,
            correct: "Redesign the solution within policy or obtain formal approval before accessing the data",
            distractors: ["Bypass the policy for testing", "Use personal credentials", "Omit the access from documentation"],
            explanation: "Policy and access boundaries are design constraints, not optional implementation details.",
          },
          {
            prompt: `Users work around a technically successful ${topic} solution. What should be investigated first?`,
            correct: "Observe the real workflow and identify usability, exception, trust, or incentive gaps",
            distractors: ["Force adoption without review", "Add more dashboards", "Count deployment as success"],
            explanation: "Adoption problems require evidence from the real operating workflow.",
          },
          {
            prompt: `A retry in ${topic} can repeat a consequential side effect. Which control is most important?`,
            correct: "Use idempotency or a durable state check before repeating the side effect",
            distractors: ["Retry indefinitely", "Hide duplicate records", "Increase permissions"],
            explanation: "Retries must not duplicate consequential actions.",
          },
          {
            prompt: `A reviewer cannot reproduce the claimed result for ${topic}. What is the strongest correction?`,
            correct: "Provide versioned inputs, dependencies, instructions, and evaluation steps, then rerun the result",
            distractors: ["Ask the reviewer to trust the screenshot", "Remove the claim", "Change the metric"],
            explanation: "Reproducibility turns a result into credible evidence.",
          },
          {
            prompt: `A ${topic} release has no defined rollback. How should readiness be judged?`,
            correct: "Treat recovery as incomplete and define a safe rollback or containment plan before release",
            distractors: ["Release because rollback is rarely needed", "Disable alerts", "Assign recovery after an incident"],
            explanation: "Safe recovery is part of production readiness.",
          },
          {
            prompt: `What makes a limitation statement for ${topic} professionally useful?`,
            correct: "It names the affected scenario, impact, evidence, and current mitigation",
            distractors: ["It says results may vary", "It avoids all detail", "It blames the user"],
            explanation: "Specific limitations help users and maintainers make safe decisions.",
          },
          {
            prompt: `After completing ${topic}, what best demonstrates transferable understanding?`,
            correct: "Solving a new scenario while explaining requirements, evidence, controls, and trade-offs",
            distractors: ["Repeating the original tutorial", "Reciting definitions", "Selecting the same answer order"],
            explanation: "Transfer requires applying the underlying objectives to a new scenario.",
          },
        ] as const;
        const scenario = scenarios[offset];
        return question(
          `${stageId}-exam-q${number}`,
          scenario.prompt,
          scenario.correct,
          [...scenario.distractors] as [string, string, string],
          scenario.explanation,
          topic,
          referenceId
        );
      }),
    ],
  };
}

export function applyCareerAssessmentPolicy(
  career: CareerWorkspaceData
): CareerWorkspaceData {
  return {
    ...career,
    journeyStages: career.journeyStages.map((stage) => {
      const { test: _legacyStepTest, ...activeStage } = stage;
      return {
        ...activeStage,
        topicAssessments: stage.lessons.map((topic, topicIndex) =>
          createTopicAssessment(stage.id, topic, topicIndex, stage.summary)
        ),
        phaseExam: createPhaseAssessment(
          stage.id,
          `${stage.title} comprehensive assessment`,
          stage.lessons.join(", ")
        ),
      };
    }),
  };
}
