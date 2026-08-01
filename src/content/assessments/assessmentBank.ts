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
    metric: "Relevant recruiter or hiring-manager responses peÛŞº¶‰ËkºwµçM¡¥À…É”Á…ÉĞ½˜ÁÉ½™•ÍÍ¥½¹…°Í½±ÕÑ¥½¸ÅÕ…±¥Ñä¸ˆ°4(€€€€€Ñ½Á¥Œ°4(€€€€€ÁÉ½™¥±”¹É•™•É•¹•%4(€€€€¤°4(€€€ÅÕ•ÍÑ¥½¸ 4(€€€€€€‘íÍÑ…•%‘ôµÄÄÉ€°4(€€€€€]¡¥ •Ù¥‘•¹”‰•ÍĞÍÕÁÁ½ÉÑÌ„‘•¥Í¥½¸µ…‘”‘ÕÉ¥¹œ€‘íÑ½Á¥ôı€°4(€€€€€€‰‘½Õµ•¹Ñ•½µÁ…É¥Í½¸ÕÍ¥¹œÉ•ÅÕ¥É•µ•¹ÑÌ°Ñ•ÍĞÉ•ÍÕ±ÑÌ°É¥Í­Ì°…¹½¹ÍÑÉ…¥¹ÑÌˆ°4(€€€€€l4(€€€€€€€€‰A•ÉÍ½¹…°ÁÉ•™•É•¹”…±½¹”ˆ°4(€€€€€€€€‰Ù•¹‘½È±½¼ˆ°4(€€€€€€€€‰Q¡”¹Õµ‰•È½˜…Ù…¥±…‰±”™•…ÑÕÉ•Ìˆ°4(€€€€€t°4(€€€€€€‰‘•™•¹Í¥‰±”‘•¥Í¥½¸½¹¹•ÑÌÑ¡”Í•±•Ñ•…ÁÁÉ½… Ñ¼•Ù¥‘•¹”…¹½¹ÍÑÉ…¥¹ÑÌ¸ˆ°4(€€€€€Ñ½Á¥Œ°4(€€€€€ÁÉ½™¥±”¹É•™•É•¹•%4(€€€€¤°4(€€€ÅÕ•ÍÑ¥½¸ 4(€€€€€€‘íÍÑ…•%‘ôµÄÄÍ€°4(€€€€€±•…É¹•ÈÉ•Á•…Ñ•‘±äµ¥ÍÍ•Ì½¹”½‰©•Ñ¥Ù”¥¸€‘íÑ½Á¥ô¸]¡…Ğ¥ÌÑ¡”µ½ÍĞ•™™•Ñ¥Ù”É•µ•‘¥…Ñ¥½¸ı€°4(€€€€€€‰I•ÑÕÉ¸Ñ¼Ñ¡”•á…ĞÍ½ÕÉ”Í•Ñ¥½¸°‰Õ¥±„™½ÕÍ••á…µÁ±”°…¹Ñ•ÍĞÑ¡”½‰©•Ñ¥Ù”……¥¸ˆ°4(€€€€€l4(€€€€€€€€‰I•Ñ…­”¥µµ•‘¥…Ñ•±äİ¥Ñ¡½ÕĞÉ•Ù¥•Üˆ°4(€€€€€€€€‰5•µ½É¥é”Ñ¡”½ÁÑ¥½¸Á½Í¥Ñ¥½¸ˆ°4(€€€€€€€€‰M­¥ÀÑ¡”½‰©•Ñ¥Ù”Á•Éµ…¹•¹Ñ±äˆ°4(€€€€€t°4(€€€€€€‰Q…É•Ñ•É•µ•‘¥…Ñ¥½¸…‘‘É•ÍÍ•ÌÑ¡”µ¥ÍÍ•½‰©•Ñ¥Ù”‰•™½É”„™É•Í …ÍÍ•ÍÍµ•¹Ğ…ÑÑ•µÁĞ¸ˆ°4(€€€€€Ñ½Á¥Œ°4(€€€€€ÁÉ½™¥±”¹É•™•É•¹•%4(€€€€¤°4(€€€ÅÕ•ÍÑ¥½¸ 4(€€€€€€‘íÍÑ…•%‘ôµÄÄÑ€°4(€€€€€]¡…ĞÍ¡½Õ±‰”É•½É‘•İ¡•¸½µÁ±•Ñ¥¹œÁÉ…Ñ¥…°İ½É¬¥¸€‘íÑ½Á¥ôı€°4(€€€€€€‰%¹ÁÕÑÌ°…ÍÍÕµÁÑ¥½¹Ì°‘•¥Í¥½¹Ì°É•ÍÕ±ÑÌ°™…¥±ÕÉ•Ì°…¹Ñ¡”¹•áĞ¥µÁÉ½Ù•µ•¹Ğˆ°4(€€€€€l4(€€€€€€€€‰=¹±äÑ¡”ÍÕ•ÍÍ™Õ°ÍÉ••¹Í¡½Ğˆ°4(€€€€€€€€‰=¹±äÑ¥µ”ÍÁ•¹Ğˆ°4(€€€€€€€€‰=¹±äÑ¡”Ñ½½°±¥ÍĞˆ°4(€€€€€t°4(€€€€€€‰ÕÍ•™Õ°±•…É¹¥¹œÉ•½ÉÁÉ•Í•ÉÙ•Ì‰½Ñ •Ù¥‘•¹”…¹É•…Í½¹¥¹œ¸ˆ°4(€€€€€Ñ½Á¥Œ°4(€€€€€ÁÉ½™¥±”¹É•™•É•¹•%4(€€€€¤°4(€€€ÅÕ•ÍÑ¥½¸ 4(€€€€€€‘íÍÑ…•%‘ôµÄÄÕ€°4(€€€€€]¡¥ ½ÕÑ½µ”µ½ÍĞÍÑÉ½¹±ä¥¹‘¥…Ñ•ÌÉ•…‘¥¹•ÍÌÑ¼½¹Ñ¥¹Õ”‰•å½¹€‘íÑ½Á¥ôı€°4(€€€€€€‰Q¡”±•…É¹•È…¸…ÁÁ±äÑ¡”½‰©•Ñ¥Ù”¥¸„¹•ÜÍ•¹…É¥¼…¹•áÁ±…¥¸Ñ¡”ÑÉ…‘”µ½™™Ìˆ°4(€€€€€l4(€€€€€€€€‰Q¡”±•…É¹•ÈÉ•½¹¥é•ÌÑ¡”Ñ•Éµ¥¹½±½äˆ°4(€€€€€€€€‰Q¡”±•…É¹•È¡…Ì½Á•¹••Ù•Éä±¥¹¬ˆ°4(€€€€€€€€‰Q¡”±•…É¹•È…¸É•Á•…Ğ½¹”•á…µÁ±”•á…Ñ±äˆ°4(€€€€€t°4(€€€€€€‰QÉ…¹Í™•ÈÑ¼„¹•ÜÍ•¹…É¥¼¥ÌÍÑÉ½¹•È•Ù¥‘•¹”½˜Õ¹‘•ÉÍÑ…¹‘¥¹œÑ¡…¸É•½¹¥Ñ¥½¸½ÈÉ•Á•Ñ¥Ñ¥½¸¸ˆ°4(€€€€€Ñ½Á¥Œ°4(€€€€€ÁÉ½™¥±”¹É•™•É•¹•%4(€€€€¤°4(€tì4(4(€¥˜€¡ÅÕ•ÍÑ¥½¹Ì¹±•¹Ñ €„ôôII}MQ%=9}EUMQ%=9}A==1}M%i¤ì4(€€€Ñ¡É½Ü¹•ÜÉÉ½È¡áÁ•Ñ•€‘íII}MQ%=9}EUMQ%=9}A==1}M%iôÅÕ•ÍÑ¥½¹Ì™½È€‘íÍÑ…•%‘ô¹€¤ì4(€ô4(4(€É•ÑÕÉ¸ÅÕ•ÍÑ¥½¹Ìì4)ô4(4)•áÁ½ÉĞ™Õ¹Ñ¥½¸É•…Ñ•Q½Á¥ÍÍ•ÍÍµ•¹Ğ 4(€ÍÑ…•%èÍÑÉ¥¹œ°4(€Ñ½Á¥ŒèÍÑÉ¥¹œ°4(€Ñ½Á¥%¹‘•àè¹Õµ‰•È°4(€½µÁ±•Ñ¥½¹M¥¹…°èÍÑÉ¥¹œ°4(€½ÕÉÍ•%üèÍÑÉ¥¹œ4(¤è…É••ÉÍÍ•ÍÍµ•¹Ğì4(€½¹ÍĞ…ÍÍ•ÍÍµ•¹ÑM½Á•%€ô€‘íÍÑ…•%‘ôµ½ÕÉÍ”´‘íÑ½Á¥%¹‘•à€¬€Åõ€ì4(€½¹ÍĞÑ½Á¥%€ô½ÕÉÍ•%€üü…ÍÍ•ÍÍµ•¹ÑM½Á•%ì4(€É•ÑÕÉ¸ì4(€€€¥è€‘í…ÍÍ•ÍÍµ•¹ÑM½Á•%‘ôµ…ÍÍ•ÍÍµ•¹Ñ€°4(€€€Ñ¥Ñ±”è€‘íÑ½Á¥ô­¹½İ±•‘”¡•­€°4(€€€‘•ÍÉ¥ÁÑ¥½¸èÍ¡½ÉĞ­¹½İ±•‘”¡•¬™½ÕÍ•½¸Ñ¡”Í­¥±±Ì½Ù•É•¥¸€‘íÑ½Á¥ô¹€°4(€€€…ÍÍ•ÍÍµ•¹ÑQåÁ”è€‰Ñ½Á¥Œˆ°4(€€€Ñ½Á¥%°4(€€€Ñ½Á¥1…‰•°èÑ½Á¥Œ°4(€€€Á…ÍÍ¥¹M½É”èII}MMMM59Q}AMM%9}M=I°4(€€€‘ÕÉ…Ñ¥½¹5¥¹ÕÑ•Ìè€ÄÀ°4(€€€ÅÕ•ÍÑ¥½¹ÍA•ÉÑÑ•µÁĞèII}MMMM59Q}EUMQ%=9}=U9P°4(€€€ÅÕ•ÍÑ¥½¹ÌèÉ•…Ñ•M•Ñ¥½¹EÕ•ÍÑ¥½¹Ì 4(€€€€€…ÍÍ•ÍÍµ•¹ÑM½Á•%°4(€€€€€Ñ½Á¥Œ°4(€€€€€½µÁ±•Ñ¥½¹M¥¹…°4(€€€€¤°4(€ôì4)ô4(4)•áÁ½ÉĞ™Õ¹Ñ¥½¸É•…Ñ•A¡…Í•ÍÍ•ÍÍµ•¹Ğ 4(€ÍÑ…•%èÍÑÉ¥¹œ°4(€Ñ¥Ñ±”èÍÑÉ¥¹œ°4(€Ñ½Á¥ŒèÍÑÉ¥¹œ4(¤è…É••ÉÍÍ•ÍÍµ•¹Ğì4(€½¹ÍĞÁÉ½™¥±”€ôÁÉ½™¥±•ÍmÍÑ…•%‘tì4(€½¹ÍĞÉ•™•É•¹•%€ôÁÉ½™¥±”ü¹É•™•É•¹•%€üü€‰©½ÕÉ¹•äµ¥‰´µÍ­¥±±Í‰Õ¥±ˆì4(4(€É•ÑÕÉ¸ì4(€€€¥è€‘íÍÑ…•%‘ôµÁ¡…Í”µ•á…µ€°4(€€€Ñ¥Ñ±”°4(€€€‘•ÍÉ¥ÁÑ¥½¸è=É¥¥¹…°…É••È=LÍ•¹…É¥¼…ÍÍ•ÍÍµ•¹Ğ…±¥¹•İ¥Ñ É•ÁÕÑ…‰±”±•…É¹¥¹œ½‰©•Ñ¥Ù•Ì™½È€‘íÑ½Á¥ôì¥Ğ¥Ì¹½Ğ…¸½™™¥¥…°Ù•¹‘½È•á…´¹€°4(€€€…ÍÍ•ÍÍµ•¹ÑQåÁ”è€‰½µÁÉ•¡•¹Í¥Ù”ˆ°4(€€€Á…ÍÍ¥¹M½É”èII}A!M}MMMM59Q}AMM%9}M=I°4(€€€‘ÕÉ…Ñ¥½¹5¥¹ÕÑ•Ìè€ÈÔ°4(€€€ÅÕ•ÍÑ¥½¹ÍA•ÉÑÑ•µÁĞèII}A!M}MMMM59Q}EUMQ%=9}=U9P°4(€€€ÅÕ•ÍÑ¥½¹Ìèl4(€€€€€ÅÕ•ÍÑ¥½¸ 4(€€€€€€€€‘íÍÑ…•%‘ôµ•á…´µÄÅ€°4(€€€€€€€ÁÉ½Á½Í•€‘íÑ½Á¥ôÍ½±ÕÑ¥½¸İ½É­Ì¥¸„‘•µ¼‰ÕĞÉ•ÅÕ¥É•µ•¹ÑÌ…É”¥¹½µÁ±•Ñ”¸]¡…Ğ¥ÌÑ¡”‰•ÍĞ¹•áĞ…Ñ¥½¸ı€°4(€€€€€€€€‰I•ÑÕÉ¸Ñ¼Ñ¡”Õ¹É•Í½±Ù•É•ÅÕ¥É•µ•¹ÑÌ°‘•™¥¹”…•ÁÑ…¹”É¥Ñ•É¥„°…¹Ñ•ÍĞ„‰½Õ¹‘•Ù•ÉÍ¥½¸ˆ°4(€€€€€€€l4(€€€€€€€€€€‰I•±•…Í”¥µµ•‘¥…Ñ•±ä‰•…ÕÍ”Ñ¡”‘•µ¼ÍÕ••‘•ˆ°4(€€€€€€€€€€‰‘µ½É”Á±…Ñ™½ÉµÌ‰•™½É”½±±•Ñ¥¹œ•Ù¥‘•¹”ˆ°4(€€€€€€€€€€‰I•µ½Ù”Ñ¡”‘½Õµ•¹Ñ•±¥µ¥Ñ…Ñ¥½¹Ìˆ°4(€€€€€€€t°4(€€€€€€€€‰É•‘¥‰±”Í½±ÕÑ¥½¸¥Ì©Õ‘•……¥¹ÍĞ•áÁ±¥¥ĞÉ•ÅÕ¥É•µ•¹ÑÌ…¹É•ÁÉ•Í•¹Ñ…Ñ¥Ù”Ñ•ÍÑÌ¸ˆ°4(€€€€€€€Ñ½Á¥Œ°4(€€€€€€€É•™•É•¹•%4(€€€€€€¤°4(€€€€€ÅÕ•ÍÑ¥½¸ 4(€€€€€€€€‘íÍÑ…•%‘ôµ•á…´µÄÉ€°4(€€€€€€€Qİ¼…ÁÁÉ½…¡•ÌÑ¼€‘íÑ½Á¥ôµ••ĞÑ¡”¡…ÁÁäÁ…Ñ ¸!½ÜÍ¡½Õ±Ñ¡”Ñ•…´¡½½Í”‰•Ñİ••¸Ñ¡•´ı€°4(€€€€€€€€‰½µÁ…É”Ñ¡•´ÕÍ¥¹œÕÍ•ÈÙ…±Õ”°™…¥±ÕÉ”‰•¡…Ù¥½È°Í•ÕÉ¥Ñä°½ÍĞ°…¹ÍÕÁÁ½ÉÑ…‰¥±¥Ñäˆ°4(€€€€€€€l4(€€€€€€€€€€‰¡½½Í”Ñ¡”…ÁÁÉ½… İ¥Ñ Ñ¡”±½¹•ÍĞ™•…ÑÕÉ”±¥ÍĞˆ°4(€€€€€€€€€€‰¡½½Í”İ¡¥¡•Ù•Èİ…Ìµ•¹Ñ¥½¹•µ½ÍĞÉ••¹Ñ±ä½¹±¥¹”ˆ°4(€€€€€€€€€€‰%¹½É”½Á•É…Ñ¥½¹…°É•ÅÕ¥É•µ•¹ÑÌÕ¹Ñ¥°…™Ñ•È±…Õ¹ ˆ°4(€€€€€€€t°4(€€€€€€€€‰M•¹…É¥¼…ÍÍ•ÍÍµ•¹ÑÌÉ•İ…É‘•™•¹Í¥‰±”ÑÉ…‘”µ½™™ÌÉ…Ñ¡•ÈÑ¡…¸Ñ½½°ÁÉ•™•É•¹”¸ˆ°4(€€€€€€€Ñ½Á¥Œ°4(€€€€€€€É•™•É•¹•%4(€€€€€€¤°4(€€€€€ÅÕ•ÍÑ¥½¸ 4(€€€€€€€€‘íÍÑ…•%‘ôµ•á…´µÄÍ€°4(€€€€€€€Ñ•ÍĞ½˜€‘íÑ½Á¥ô™…¥±Ì½¹±ä½¸…¸¥µÁ½ÉÑ…¹Ğ•‘”…Í”¸]¡…Ğ¥ÌÑ¡”µ½ÍĞÁÉ½™•ÍÍ¥½¹…°É•ÍÁ½¹Í”ı€°4(€€€€€€€€‰I•½ÉÑ¡”™…¥±ÕÉ”°™¥à½ÈÍ…™•±ä¡…¹‘±”¥Ğ°…¹…‘Ñ¡”…Í”Ñ¼É•É•ÍÍ¥½¸•Ù…±Õ…Ñ¥½¸ˆ°4(€€€€€€€l4(€€€€€€€€€€‰•±•Ñ”Ñ¡”•‘”…Í”™É½´Ñ¡”•Ù…±Õ…Ñ¥½¸ˆ°4(€€€€€€€€€€‰I•Á½ÉĞ½¹±äÑ¡”…Ù•É…”Í½É”ˆ°4(€€€€€€€€€€‰I•ÑÉäµ…¹Õ…±±äÕ¹Ñ¥°¥ĞÁ…ÍÍ•Ì½¹”ˆ°4(€€€€€€€t°4(€€€€€€€€‰%µÁ½ÉÑ…¹Ğ™…¥±ÕÉ•ÌµÕÍĞ‰•½µ”Ù¥Í¥‰±”°¡…¹‘±•°…¹É•Á•…Ñ…‰±äÑ•ÍÑ•¸ˆ°4(€€€€€€€Ñ½Á¥Œ°4(€€€€€€€É•™•É•¹•%4(€€€€€€¤°4(€€€€€ÅÕ•ÍÑ¥½¸ 4(€€€€€€€€‘íÍÑ…•%‘ôµ•á…´µÄÑ€°4(€€€€€€€]¡¥ ‘½Õµ•¹Ñ…Ñ¥½¸¥Ìµ½ÍĞÙ…±Õ…‰±”İ¡•¸…¹½Ñ¡•ÈÁÉ½™•ÍÍ¥½¹…°¥¹¡•É¥ÑÌİ½É¬½¸€‘íÑ½Á¥ôı€°4(€€€€€€€€‰AÕÉÁ½Í”°…ÍÍÕµÁÑ¥½¹Ì°…É¡¥Ñ•ÑÕÉ”°‘•¥Í¥½¹Ì°½¹ÑÉ½±Ì°­¹½İ¸™…¥±ÕÉ•Ì°½İ¹•ÉÍ¡¥À°…¹É•½Ù•ÉäÍÑ•ÁÌˆ°4(€€€€€€€l4(€€€€€€€€€€‰=¹±ä„ÍÉ••¹Í¡½Ğ½˜Ñ¡”™¥¹…°¥¹Ñ•É™…”ˆ°4(€€€€€€€€€€‰=¹±äÑ¡”Á…­…”½È½¹¹•Ñ½È±¥ÍĞˆ°4(€€€€€€€€€€‰ÍÑ…Ñ•µ•¹ĞÑ¡…ĞÑ¡”‘•Í¥¸¥ÌÍ•±˜µ•áÁ±…¹…Ñ½Éäˆ°4(€€€€€€€t°4(€€€€€€€€‰=Á•É…Ñ¥½¹…°‘½Õµ•¹Ñ…Ñ¥½¸ÁÉ•Í•ÉÙ•ÌÑ¡”É•…Í½¹¥¹œ…¹Í…™”µÕÍ”‰½Õ¹‘…É¥•Ì¹••‘•™½Èµ…¥¹Ñ•¹…¹”¸ˆ°4(€€€€€€€Ñ½Á¥Œ°4(€€€€€€€É•™•É•¹•%4(€€€€€€¤°4(€€€€€ÅÕ•ÍÑ¥½¸ 4(€€€€€€€€‘íÍÑ…•%‘ôµ•á…´µÄÕ€°4(€€€€€€€™Ñ•ÈÍ½É¥¹œ‰•±½ÜÑ¡”ÅÕ…±¥™¥…Ñ¥½¸Ñ¡É•Í¡½±¥¸€‘íÑ½Á¥ô°İ¡…ĞÍ¡½Õ±Ñ¡”±•…É¹•È‘¼ı€°4(€€€€€€€€‰I•Ù¥•ÜÑ¡”µ¥ÍÍ•½‰©•Ñ¥Ù•Ì°É•‰Õ¥±„™½ÕÍ••á…µÁ±”°…¹É•ÑÉäİ¥Ñ „¹•Ü…ÑÑ•µÁĞˆ°4(€€€€€€€l4(€€€€€€€€€€‰U¹±½¬•Ù•Éä±…Ñ•ÈÍÑ•À…¹åİ…äˆ°4(€€€€€€€€€€‰5•µ½É¥é”Ñ¡”…¹Íİ•ÈÁ½Í¥Ñ¥½¹Ìˆ°4(€€€€€€€€€€‰¡…¹”Ñ¡”ÍÑ½É•É•ÍÕ±Ğµ…¹Õ…±±äˆ°4(€€€€€€€t°4(€€€€€€€€‰ÍÍ•ÍÍµ•¹Ğ™…¥±ÕÉ”Í¡½Õ±ÑÉ¥•ÈÑ…É•Ñ•±•…É¹¥¹œ…¹¹•Ü•Ù¥‘•¹”°¹½Ğ‰åÁ…ÍÌÑ¡”ÁÉ½É•ÍÍ¥½¸ÉÕ±”¸ˆ°4(€€€€€€€Ñ½Á¥Œ°4(€€€€€€€É•™•É•¹•%4(€€€€€€¤°4(€€€€€€¸¸¹ÉÉ…ä¹™É½´¡ì±•¹Ñ è€ÄÔô°€¡|°½™™Í•Ğ¤€ôøì4(€€€€€€€½¹ÍĞ¹Õµ‰•È€ô½™™Í•Ğ€¬€Øì4(€€€€€€€½¹ÍĞÍ•¹…É¥½Ì€ôl4(€€€€€€€€€ì4(€€€€€€€€€€€ÁÉ½µÁĞèÍÑ…­•¡½±‘•È…Í­ÌÑ¼•áÁ…¹Ñ¡”€‘íÑ½Á¥ôÍ½±ÕÑ¥½¸‰•™½É”¥ÑÌ‰…Í•±¥¹”¥Ìµ•…ÍÕÉ•¸]¡…ĞÍ¡½Õ±¡…ÁÁ•¸™¥ÉÍĞı€°4(€€€€€€€€€€€½ÉÉ•Ğè€‰5•…ÍÕÉ”Ñ¡”‰…Í•±¥¹”…¹…É•”½¸…•ÁÑ…¹”É¥Ñ•É¥„‰•™½É”•áÁ…¹‘¥¹œÍ½Á”ˆ°4(€€€€€€€€€€€‘¥ÍÑÉ…Ñ½ÉÌèl‰áÁ…¹¥µµ•‘¥…Ñ•±äˆ°€‰I•µ½Ù”Ñ¡”‰…Í•±¥¹”ˆ°€‰5•…ÍÕÉ”½¹±ä™•…ÑÕÉ”½Õ¹Ğ‰t°4(€€€€€€€€€€€•áÁ±…¹…Ñ¥½¸è€‰‰…Í•±¥¹”µ…­•Ì¥µÁÉ½Ù•µ•¹Ğ…¹ÑÉ…‘”µ½™™Ìµ•…ÍÕÉ…‰±”¸ˆ°4(€€€€€€€€€ô°4(€€€€€€€€€ì4(€€€€€€€€€€€ÁÉ½µÁĞè¸¥µÁ½ÉÑ…¹Ğ…ÍÍÕµÁÑ¥½¸¥¸€‘íÑ½Á¥ô¡…Ì¹½Ğ‰••¸Ù…±¥‘…Ñ•¸]¡…Ğ¥ÌÑ¡”Í…™•ÍĞ‘•¥Í¥½¸ı€°4(€€€€€€€€€€€½ÉÉ•Ğè€‰5…­”Ñ¡”…ÍÍÕµÁÑ¥½¸•áÁ±¥¥Ğ…¹Ù…±¥‘…Ñ”¥Ğİ¥Ñ „‰½Õ¹‘•Ñ•ÍĞ‰•™½É”É•±å¥¹œ½¸¥Ğˆ°4(€€€€€€€€€€€‘¥ÍÑÉ…Ñ½ÉÌèl‰QÉ•…Ğ¥Ğ…Ì™…Ğˆ°€‰!¥‘”¥Ğ™É½´Ñ¡”É•Ù¥•Üˆ°€‰‘µ½É”‘•Á•¹‘•¹¥•Ì‰t°4(€€€€€€€€€€€•áÁ±…¹…Ñ¥½¸è€‰U¹Ù•É¥™¥•…ÍÍÕµÁÑ¥½¹ÌÍ¡½Õ±É•µ…¥¸Ù¥Í¥‰±”…¹‰”Ñ•ÍÑ•‰•™½É”½¹Í•ÅÕ•¹Ñ¥…°ÕÍ”¸ˆ°4(€€€€€€€€€ô°4(€€€€€€€€€ì4(€€€€€€€€€€€ÁÉ½µÁĞè€‘íÑ½Á¥ô¥µÁ±•µ•¹Ñ…Ñ¥½¸Á…ÍÍ•Ì…Ù•É…”µÅÕ…±¥Ñä¡•­Ì‰ÕĞ™…¥±Ì™½È½¹”¡¥ µ¥µÁ…ĞÉ½ÕÀ¸!½ÜÍ¡½Õ±¥Ğ‰”•Ù…±Õ…Ñ•ı€°4(€€€€€€€€€€€½ÉÉ•Ğè€‰M•µ•¹ĞÑ¡”É•ÍÕ±ÑÌ°…‘‘É•ÍÌÑ¡”¡¥ µ¥µÁ…Ğ™…¥±ÕÉ”°…¹‘•™¥¹”…¸…ÁÁÉ½ÁÉ¥…Ñ”É•±•…Í”…Ñ”ˆ°4(€€€€€€€€€€€‘¥ÍÑÉ…Ñ½ÉÌèl‰I•Á½ÉĞ½¹±äÑ¡”…Ù•É…”ˆ°€‰•±•Ñ”Ñ¡”Í•µ•¹Ğˆ°€‰1½İ•È•Ù•ÉäÅÕ…±¥Ñä¡•¬‰t°4(€€€€€€€€€€€•áÁ±…¹…Ñ¥½¸è€‰%µÁ½ÉÑ…¹ĞÍ•µ•¹Ñ•™…¥±ÕÉ•Ì…¹¹½Ğ‰”¡¥‘‘•¸‰ä…¸…•ÁÑ…‰±”…Ù•É…”¸ˆ°4(€€€€€€€€€ô°4(€€€€€€€€€ì4(€€€€€€€€€€€ÁÉ½µÁĞèQ¡”½İ¹•È½˜„€‘íÑ½Á¥ô½¹ÑÉ½°¥Ì±•…Ù¥¹œÑ¡”Ñ•…´¸]¡…ĞÁÉ½Ñ•ÑÌ½¹Ñ¥¹Õ¥Ñäı€°4(€€€€€€€€€€€½ÉÉ•Ğè€‰ÍÍ¥¸„¹•Ü½İ¹•È…¹Ù•É¥™äÑ¡”ÉÕ¹‰½½¬°…•ÍÌ°…±•ÉÑÌ°…¹É•½Ù•ÉäÁÉ½•‘ÕÉ”ˆ°4(€€€€€€€€€€€‘¥ÍÑÉ…Ñ½ÉÌèl‰I•±ä½¸µ•µ½Éäˆ°€‰¥Í…‰±”µ½¹¥Ñ½É¥¹œˆ°€‰I•µ½Ù”Ñ¡”½¹ÑÉ½°‰t°4(€€€€€€€€€€€•áÁ±…¹…Ñ¥½¸è€‰=Á•É…Ñ¥½¹…°½¹ÑÉ½±ÌÉ•ÅÕ¥É”•áÁ±¥¥Ğ½İ¹•ÉÍ¡¥À…¹ÕÍ…‰±”É•½Ù•Éä‘½Õµ•¹Ñ…Ñ¥½¸¸ˆ°4(€€€€€€€€€ô°4(€€€€€€€€€ì4(€€€€€€€€€€€ÁÉ½µÁĞè±½İ•Èµ½ÍĞ…ÁÁÉ½… Ñ¼€‘íÑ½Á¥ôÁ•É™½ÉµÌ¹•…É±ä…Ìİ•±°…ÌÑ¡”ÁÉ•™•ÉÉ•½ÁÑ¥½¸¸]¡…Ğ¥ÌÑ¡”‰•ÍĞ¡½¥”ÁÉ½•ÍÌı€°4(€€€€€€€€€€€½ÉÉ•Ğè€‰½µÁ…É”ÅÕ…±¥Ñä°É¥Í¬°±…Ñ•¹ä°µ…¥¹Ñ•¹…¹”°…¹Ñ½Ñ…°½ÍĞ……¥¹ÍĞÑ¡”…ÑÕ…°É•ÅÕ¥É•µ•¹Ğˆ°4(€€€€€€€€€€€‘¥ÍÑÉ…Ñ½ÉÌèl‰±İ…åÌ¡½½Í”Ñ¡”•áÁ•¹Í¥Ù”½ÁÑ¥½¸ˆ°€‰%¹½É”ÅÕ…±¥Ñäˆ°€‰M•±•Ğ‰ä‰É…¹É•½¹¥Ñ¥½¸‰t°4(€€€€€€€€€€€•áÁ±…¹…Ñ¥½¸è€‰Q¡”½ÉÉ•ĞÑÉ…‘”µ½™˜‘•Á•¹‘Ì½¸É•ÅÕ¥É•µ•¹ÑÌ…¹Ñ½Ñ…°½Á•É…Ñ¥¹œ¥µÁ…Ğ¸ˆ°4(€€€€€€€€€ô°4(€€€€€€€€€ì4(€€€€€€€€€€€ÁÉ½µÁĞèÑ•ÍĞÍ•Ğ™½È€‘íÑ½Á¥ô½¹Ñ…¥¹Ì•á…µÁ±•Ì½Á¥•™É½´Ñ¡”‘•Ù•±½Áµ•¹Ğİ½É¬¸]¡…Ğ¥ÌÑ¡”µ…¥¸½¹•É¸ı€°4(€€€€€€€€€€€½ÉÉ•Ğè€‰Q¡”•Ù…±Õ…Ñ¥½¸µ…ä½Ù•ÉÍÑ…Ñ”•¹•É…±¥é…Ñ¥½¸‰•…ÕÍ”Ñ¡”•Ù¥‘•¹”¥Ì¹½ĞÍÕ™™¥¥•¹Ñ±ä¥¹‘•Á•¹‘•¹Ğˆ°4(€€€€€€€€€€€‘¥ÍÑÉ…Ñ½ÉÌèl‰Q¡”Ñ•ÍĞÍ•Ğ¥ÌÑ½¼‘½Õµ•¹Ñ•ˆ°€‰Q¡”ÁÉ½©•Ğ¡…ÌÑ½¼µ…¹ä½İ¹•ÉÌˆ°€‰Q¡”¥¹Ñ•É™…”µ…ä‰”Ñ½¼Í¥µÁ±”‰t°4(€€€€€€€€€€€•áÁ±…¹…Ñ¥½¸è€‰Ù…±Õ…Ñ¥½¸•Ù¥‘•¹”Í¡½Õ±É•ÁÉ•Í•¹ĞÕ¹Í••¸½È¥¹‘•Á•¹‘•¹Ñ±äÍ•±•Ñ•…Í•Ì¸ˆ°4(€€€€€€€€€ô°4(€€€€€€€€€ì4(€€€€€€€€€€€ÁÉ½µÁĞè¡…¹”Ñ¼€‘íÑ½Á¥ô¥µÁÉ½Ù•Ì½¹”µ•ÑÉ¥Œ‰ÕĞİ½ÉÍ•¹Ì„É¥Ñ¥…°Í…™•Ñäµ•…ÍÕÉ”¸]¡…ĞÍ¡½Õ±Ñ¡”Ñ•…´‘¼ı€°4(€€€€€€€€€€€½ÉÉ•Ğè€‰ÁÁ±äÑ¡”…É••Í…™•Ñä…Ñ”…¹¥¹Ù•ÍÑ¥…Ñ”Ñ¡”ÑÉ…‘”µ½™˜‰•™½É”É•±•…Í”ˆ°4(€€€€€€€€€€€‘¥ÍÑÉ…Ñ½ÉÌèl‰I•±•…Í”‰…Í•½¸Ñ¡”¥µÁÉ½Ù•µ•ÑÉ¥Œˆ°€‰MÑ½Àµ•…ÍÕÉ¥¹œÍ…™•Ñäˆ°€‰Ù•É…”Ñ¡”µ•ÑÉ¥Ìİ¥Ñ¡½ÕĞ½¹Ñ•áĞ‰t°4(€€€€€€€€€€€•áÁ±…¹…Ñ¥½¸è€‰É¥Ñ¥…°É•±•…Í”…Ñ•ÌÍ¡½Õ±¹½Ğ‰”½Ù•ÉÉ¥‘‘•¸‰äÕ¹É•±…Ñ•…É•…Ñ”¥µÁÉ½Ù•µ•¹Ğ¸ˆ°4(€€€€€€€€€ô°4(€€€€€€€€€ì4(€€€€€€€€€€€ÁÉ½µÁĞè]¡¥ ¡…¹‘½™˜‰•ÍĞÍÕÁÁ½ÉÑÌ…¹½Ñ¡•ÈÁ•ÉÍ½¸µ…¥¹Ñ…¥¹¥¹œ€‘íÑ½Á¥ôı€°4(€€€€€€€€€€€½ÉÉ•Ğè€‰É•ÁÉ½‘Õ¥‰±”Í•ÑÕÀ°‘•¥Í¥½¸É•½É°Ñ•ÍÑÌ°µ½¹¥Ñ½É¥¹œ°­¹½İ¸±¥µ¥Ñ…Ñ¥½¹Ì°…¹É•½Ù•ÉäÍÑ•ÁÌˆ°4(€€€€€€€€€€€‘¥ÍÑÉ…Ñ½ÉÌèl‰‘•µ¼Ù¥‘•¼½¹±äˆ°€‰Ñ½½°±¥ÍĞ½¹±äˆ°€‰¸Õ¹‘½Õµ•¹Ñ•İ½É­¥¹œ•¹Ù¥É½¹µ•¹Ğ‰t°4(€€€€€€€€€€€•áÁ±…¹…Ñ¥½¸è€‰ÁÉ½™•ÍÍ¥½¹…°¡…¹‘½™˜½Ù•ÉÌÉ•ÁÉ½‘ÕÑ¥½¸°É•…Í½¹¥¹œ°Ù…±¥‘…Ñ¥½¸°…¹½Á•É…Ñ¥½¹Ì¸ˆ°4(€€€€€€€€€ô°4(€€€€€€€€€ì4(€€€€€€€€€€€ÁÉ½µÁĞèÉ•ÅÕ¥É•µ•¹Ğ™½È€‘íÑ½Á¥ô½¹™±¥ÑÌİ¥Ñ ‘…Ñ„µ…•ÍÌÁ½±¥ä¸]¡…Ğ¥ÌÑ¡”½ÉÉ•ĞÉ•ÍÁ½¹Í”ı€°4(€€€€€€€€€€€½ÉÉ•Ğè€‰I•‘•Í¥¸Ñ¡”Í½±ÕÑ¥½¸İ¥Ñ¡¥¸Á½±¥ä½È½‰Ñ…¥¸™½Éµ…°…ÁÁÉ½Ù…°‰•™½É”…•ÍÍ¥¹œÑ¡”‘…Ñ„ˆ°4(€€€€€€€€€€€‘¥ÍÑÉ…Ñ½ÉÌèl‰	åÁ…ÍÌÑ¡”Á½±¥ä™½ÈÑ•ÍÑ¥¹œˆ°€‰UÍ”Á•ÉÍ½¹…°É•‘•¹Ñ¥…±Ìˆ°€‰=µ¥ĞÑ¡”…•ÍÌ™É½´‘½Õµ•¹Ñ…Ñ¥½¸‰t°4(€€€€€€€€€€€•áÁ±…¹…Ñ¥½¸è€‰A½±¥ä…¹…•ÍÌ‰½Õ¹‘…É¥•Ì…É”‘•Í¥¸½¹ÍÑÉ…¥¹ÑÌ°¹½Ğ½ÁÑ¥½¹…°¥µÁ±•µ•¹Ñ…Ñ¥½¸‘•Ñ…¥±Ì¸ˆ°4(€€€€€€€€€ô°4(€€€€€€€€€ì4(€€€€€€€€€€€ÁÉ½µÁĞèUÍ•ÉÌİ½É¬…É½Õ¹„Ñ•¡¹¥…±±äÍÕ•ÍÍ™Õ°€‘íÑ½Á¥ôÍ½±ÕÑ¥½¸¸]¡…ĞÍ¡½Õ±‰”¥¹Ù•ÍÑ¥…Ñ•™¥ÉÍĞı€°4(€€€€€€€€€€€½ÉÉ•Ğè€‰=‰Í•ÉÙ”Ñ¡”É•…°İ½É­™±½Ü…¹¥‘•¹Ñ¥™äÕÍ…‰¥±¥Ñä°•á•ÁÑ¥½¸°ÑÉÕÍĞ°½È¥¹•¹Ñ¥Ù”…ÁÌˆ°4(€€€€€€€€€€€‘¥ÍÑÉ…Ñ½ÉÌèl‰½É”…‘½ÁÑ¥½¸İ¥Ñ¡½ÕĞÉ•Ù¥•Üˆ°€‰‘µ½É”‘…Í¡‰½…É‘Ìˆ°€‰½Õ¹Ğ‘•Á±½åµ•¹Ğ…ÌÍÕ•ÍÌ‰t°4(€€€€€€€€€€€•áÁ±…¹…Ñ¥½¸è€‰‘½ÁÑ¥½¸ÁÉ½‰±•µÌÉ•ÅÕ¥É”•Ù¥‘•¹”™É½´Ñ¡”É•…°½Á•É…Ñ¥¹œİ½É­™±½Ü¸ˆ°4(€€€€€€€€€ô°4(€€€€€€€€€ì4(€€€€€€€€€€€ÁÉ½µÁĞèÉ•ÑÉä¥¸€‘íÑ½Á¥ô…¸É•Á•…Ğ„½¹Í•ÅÕ•¹Ñ¥…°Í¥‘”•™™•Ğ¸]¡¥ ½¹ÑÉ½°¥Ìµ½ÍĞ¥µÁ½ÉÑ…¹Ğı€°4(€€€€€€€€€€€½ÉÉ•Ğè€‰UÍ”¥‘•µÁ½Ñ•¹ä½È„‘ÕÉ…‰±”ÍÑ…Ñ”¡•¬‰•™½É”É•Á•…Ñ¥¹œÑ¡”Í¥‘”•™™•Ğˆ°4(€€€€€€€€€€€‘¥ÍÑÉ…Ñ½ÉÌèl‰I•ÑÉä¥¹‘•™¥¹¥Ñ•±äˆ°€‰!¥‘”‘ÕÁ±¥…Ñ”É•½É‘Ìˆ°€‰%¹É•…Í”Á•Éµ¥ÍÍ¥½¹Ì‰t°4(€€€€€€€€€€€•áÁ±…¹…Ñ¥½¸è€‰I•ÑÉ¥•ÌµÕÍĞ¹½Ğ‘ÕÁ±¥…Ñ”½¹Í•ÅÕ•¹Ñ¥…°…Ñ¥½¹Ì¸ˆ°4(€€€€€€€€€ô°4(€€€€€€€€€ì4(€€€€€€€€€€€ÁÉ½µÁĞèÉ•Ù¥•İ•È…¹¹½ĞÉ•ÁÉ½‘Õ”Ñ¡”±…¥µ•É•ÍÕ±Ğ™½È€‘íÑ½Á¥ô¸]¡…Ğ¥ÌÑ¡”ÍÑÉ½¹•ÍĞ½ÉÉ•Ñ¥½¸ı€°4(€€€€€€€€€€€½ÉÉ•Ğè€‰AÉ½Ù¥‘”Ù•ÉÍ¥½¹•¥¹ÁÕÑÌ°‘•Á•¹‘•¹¥•Ì°¥¹ÍÑÉÕÑ¥½¹Ì°…¹•Ù…±Õ…Ñ¥½¸ÍÑ•ÁÌ°Ñ¡•¸É•ÉÕ¸Ñ¡”É•ÍÕ±Ğˆ°4(€€€€€€€€€€€‘¥ÍÑÉ…Ñ½ÉÌèl‰Í¬Ñ¡”É•Ù¥•İ•ÈÑ¼ÑÉÕÍĞÑ¡”ÍÉ••¹Í¡½Ğˆ°€‰I•µ½Ù”Ñ¡”±…¥´ˆ°€‰¡…¹”Ñ¡”µ•ÑÉ¥Œ‰t°4(€€€€€€€€€€€•áÁ±…¹…Ñ¥½¸è€‰I•ÁÉ½‘Õ¥‰¥±¥ÑäÑÕÉ¹Ì„É•ÍÕ±Ğ¥¹Ñ¼É•‘¥‰±”•Ù¥‘•¹”¸ˆ°4(€€€€€€€€€ô°4(€€€€€€€€€ì4(€€€€€€€€€€€ÁÉ½µÁĞè€‘íÑ½Á¥ôÉ•±•…Í”¡…Ì¹¼‘•™¥¹•É½±±‰…¬¸!½ÜÍ¡½Õ±É•…‘¥¹•ÍÌ‰”©Õ‘•ı€°4(€€€€€€€€€€€½ÉÉ•Ğè€‰QÉ•…ĞÉ•½Ù•Éä…Ì¥¹½µÁ±•Ñ”…¹‘•™¥¹”„Í…™”É½±±‰…¬½È½¹Ñ…¥¹µ•¹ĞÁ±…¸‰•™½É”É•±•…Í”ˆ°4(€€€€€€€€€€€‘¥ÍÑÉ…Ñ½ÉÌèl‰I•±•…Í”‰•…ÕÍ”É½±±‰…¬¥ÌÉ…É•±ä¹••‘•ˆ°€‰¥Í…‰±”…±•ÉÑÌˆ°€‰ÍÍ¥¸É•½Ù•Éä…™Ñ•È…¸¥¹¥‘•¹Ğ‰t°4(€€€€€€€€€€€•áÁ±…¹…Ñ¥½¸è€‰M…™”É•½Ù•Éä¥ÌÁ…ÉĞ½˜ÁÉ½‘ÕÑ¥½¸É•…‘¥¹•ÍÌ¸ˆ°4(€€€€€€€€€ô°4(€€€€€€€€€ì4(€€€€€€€€€€€ÁÉ½µÁĞè]¡…Ğµ…­•Ì„±¥µ¥Ñ…Ñ¥½¸ÍÑ…Ñ•µ•¹Ğ™½È€‘íÑ½Á¥ôÁÉ½™•ÍÍ¥½¹…±±äÕÍ•™Õ°ı€°4(€€€€€€€€€€€½ÉÉ•Ğè€‰%Ğ¹…µ•ÌÑ¡”…™™•Ñ•Í•¹…É¥¼°¥µÁ…Ğ°•Ù¥‘•¹”°…¹ÕÉÉ•¹Ğµ¥Ñ¥…Ñ¥½¸ˆ°4(€€€€€€€€€€€‘¥ÍÑÉ…Ñ½ÉÌèl‰%ĞÍ…åÌÉ•ÍÕ±ÑÌµ…äÙ…Éäˆ°€‰%Ğ…Ù½¥‘Ì…±°‘•Ñ…¥°ˆ°€‰%Ğ‰±…µ•ÌÑ¡”ÕÍ•È‰t°4(€€€€€€€€€€€•áÁ±…¹…Ñ¥½¸è€‰MÁ•¥™¥Œ±¥µ¥Ñ…Ñ¥½¹Ì¡•±ÀÕÍ•ÉÌ…¹µ…¥¹Ñ…¥¹•ÉÌµ…­”Í…™”‘•¥Í¥½¹Ì¸ˆ°4(€€€€€€€€€ô°4(€€€€€€€€€ì4(€€€€€€€€€€€ÁÉ½µÁĞè™Ñ•È½µÁ±•Ñ¥¹œ€‘íÑ½Á¥ô°İ¡…Ğ‰•ÍĞ‘•µ½¹ÍÑÉ…Ñ•ÌÑÉ…¹Í™•É…‰±”Õ¹‘•ÉÍÑ…¹‘¥¹œı€°4(€€€€€€€€€€€½ÉÉ•Ğè€‰M½±Ù¥¹œ„¹•ÜÍ•¹…É¥¼İ¡¥±”•áÁ±…¥¹¥¹œÉ•ÅÕ¥É•µ•¹ÑÌ°•Ù¥‘•¹”°½¹ÑÉ½±Ì°…¹ÑÉ…‘”µ½™™Ìˆ°4(€€€€€€€€€€€‘¥ÍÑÉ…Ñ½ÉÌèl‰I•Á•…Ñ¥¹œÑ¡”½É¥¥¹…°ÑÕÑ½É¥…°ˆ°€‰I•¥Ñ¥¹œ‘•™¥¹¥Ñ¥½¹Ìˆ°€‰M•±•Ñ¥¹œÑ¡”Í…µ”…¹Íİ•È½É‘•È‰t°4(€€€€€€€€€€€•áÁ±…¹…Ñ¥½¸è€‰QÉ…¹Í™•ÈÉ•ÅÕ¥É•Ì…ÁÁ±å¥¹œÑ¡”Õ¹‘•É±å¥¹œ½‰©•Ñ¥Ù•ÌÑ¼„¹•ÜÍ•¹…É¥¼¸ˆ°4(€€€€€€€€€ô°4(€€€€€€€t…Ì½¹ÍĞì4(€€€€€€€½¹ÍĞÍ•¹…É¥¼€ôÍ•¹…É¥½Ím½™™Í•Ñtì4(€€€€€€€É•ÑÕÉ¸ÅÕ•ÍÑ¥½¸ 4(€€€€€€€€€€‘íÍÑ…•%‘ôµ•á…´µÄ‘í¹Õµ‰•Éõ€°4(€€€€€€€€€Í•¹…É¥¼¹ÁÉ½µÁĞ°4(€€€€€€€€€Í•¹…É¥¼¹½ÉÉ•Ğ°4(€€€€€€€€€l¸¸¹Í•¹…É¥¼¹‘¥ÍÑÉ…Ñ½ÉÍt…ÌmÍÑÉ¥¹œ°ÍÑÉ¥¹œ°ÍÑÉ¥¹t°4(€€€€€€€€€Í•¹…É¥¼¹•áÁ±…¹…Ñ¥½¸°4(€€€€€€€€€Ñ½Á¥Œ°4(€€€€€€€€€É•™•É•¹•%4(€€€€€€€€¤ì4(€€€€€ô¤°4(€€€t°4(€ôì4)ô4(4)•áÁ½ÉĞ™Õ¹Ñ¥½¸…ÁÁ±å…É••ÉÍÍ•ÍÍµ•¹ÑA½±¥ä 4(€…É••Èè…É••É]½É­ÍÁ…•…Ñ„4(¤è…É••É]½É­ÍÁ…•…Ñ„ì4(€É•ÑÕÉ¸ì4(€€€€¸¸¹…É••È°4(€€€©½ÕÉ¹•åMÑ…•Ìè…É••È¹©½ÕÉ¹•åMÑ…•Ì¹µ…À ¡ÍÑ…”¤€ôøì4(€€€€€½¹ÍĞìÑ•ÍĞè}±•…åMÑ•ÁQ•ÍĞ°€¸¸¹…Ñ¥Ù•MÑ…”ô€ôÍÑ…”ì4(€€€€€É•ÑÕÉ¸ì4(€€€€€€€€¸¸¹…Ñ¥Ù•MÑ…”°4(€€€€€€€Ñ½Á¥ÍÍ•ÍÍµ•¹ÑÌèÍÑ…”¹É•Í½ÕÉ•Ì¹µ…À ¡½ÕÉÍ”°½ÕÉÍ•%¹‘•à¤€ôø4(€€€€€€€€€É•…Ñ•Q½Á¥ÍÍ•ÍÍµ•¹Ğ 4(€€€€€€€€€€€ÍÑ…”¹¥°4(€€€€€€€€€€€½ÕÉÍ”¹Ñ¥Ñ±”°4(€€€€€€€€€€€½ÕÉÍ•%¹‘•à°4(€€€€€€€€€€€ÍÑ…”¹ÍÕµµ…Éä°4(€€€€€€€€€€€½ÕÉÍ”¹¥4(€€€€€€€€€€¤4(€€€€€€€€¤°4(€€€€€€€Á¡…Í•á…´èÉ•…Ñ•A¡…Í•ÍÍ•ÍÍµ•¹Ğ 4(€€€€€€€€€ÍÑ…”¹¥°4(€€€€€€€€€€‘íÍÑ…”¹Ñ¥Ñ±•ô½µÁÉ•¡•¹Í¥Ù”…ÍÍ•ÍÍµ•¹Ñ€°4(€€€€€€€€€ÍÑ…”¹É•Í½ÕÉ•Ì¹µ…À ¡½ÕÉÍ”¤€ôø½ÕÉÍ”¹Ñ¥Ñ±”¤¹©½¥¸ ˆ°€ˆ¤4(€€€€€€€€¤°4(€€€€€ôì4(€€€ô¤°4(€ôì4)ô4(