import type {
  CareerAssessment,
  CareerResource,
  CareerWorkspaceData,
} from "@/types/careerWorkspace";
import {
  createPhaseAssessment as phaseExam,
  createSectionQuestions as stageQuestions,
} from "@/content/assessments/assessmentBank";

const resources = {
  powerAutomateDocs: {
    id: "automation-power-automate-docs",
    title: "Microsoft Power Automate Documentation",
    type: "Documentation",
    provider: "Microsoft Learn",
    cost: "Free",
    estimatedTime: "Reference",
    whyUseful:
      "Official guidance for cloud flows, desktop flows, connectors, process mining, governance, testing, and troubleshooting.",
    url: "https://learn.microsoft.com/en-us/power-automate/",
    priority: "Essential",
  },
  copilotStudioDocs: {
    id: "automation-copilot-studio-docs",
    title: "Microsoft Copilot Studio Documentation",
    type: "Documentation",
    provider: "Microsoft Learn",
    cost: "Free",
    estimatedTime: "Reference",
    whyUseful:
      "Official guidance for building agents, connecting knowledge, adding tools, creating workflows, testing, analytics, and deployment.",
    url: "https://learn.microsoft.com/en-us/microsoft-copilot-studio/",
    priority: "Essential",
  },
  openAiDocs: {
    id: "journey-openai-docs",
    title: "OpenAI API Documentation",
    type: "Documentation",
    provider: "OpenAI",
    cost: "Free",
    estimatedTime: "Reference",
    whyUseful:
      "Official reference for model integration, structured outputs, tool use, evaluation, safety, and production API patterns.",
    url: "https://platform.openai.com/docs",
    priority: "Essential",
  },
  n8nDocs: {
    id: "automation-n8n-docs",
    title: "n8n Documentation",
    type: "Documentation",
    provider: "n8n",
    cost: "Free",
    estimatedTime: "Reference",
    whyUseful:
      "Practical documentation for API-first workflow automation, AI nodes, branching, sub-workflows, credentials, and error handling.",
    url: "https://docs.n8n.io/",
    priority: "Recommended",
  },
  uiPathDocs: {
    id: "automation-uipath-docs",
    title: "UiPath Documentation",
    type: "Documentation",
    provider: "UiPath",
    cost: "Free",
    estimatedTime: "Reference",
    whyUseful:
      "Enterprise reference for RPA, document understanding, low-code agents, orchestration, queues, and human validation.",
    url: "https://docs.uipath.com/",
    priority: "Recommended",
  },
  pythonDocs: {
    id: "automation-python-docs",
    title: "Python Documentation",
    type: "Documentation",
    provider: "Python Software Foundation",
    cost: "Free",
    estimatedTime: "Reference",
    whyUseful:
      "Canonical reference for scripting, data transformation, API clients, exception handling, and reusable automation utilities.",
    url: "https://docs.python.org/3/",
    priority: "Essential",
  },
  githubDocs: {
    id: "journey-github-docs",
    title: "GitHub Docs: Get Started",
    type: "Documentation",
    provider: "GitHub",
    cost: "Free",
    estimatedTime: "Reference",
    whyUseful:
      "Official guidance for repositories, branches, pull requests, Actions, documentation, and professional portfolio presentation.",
    url: "https://docs.github.com/en/get-started",
    priority: "Essential",
  },
  postmanDocs: {
    id: "automation-postman-docs",
    title: "Postman Learning Center",
    type: "Documentation",
    provider: "Postman",
    cost: "Free",
    estimatedTime: "Reference",
    whyUseful:
      "Useful for testing APIs, inspecting authentication, documenting requests, validating responses, and debugging integrations.",
    url: "https://learning.postman.com/docs/",
    priority: "Recommended",
  },
  microsoftPowerPlatformTraining: {
    id: "automation-ms-power-platform-training",
    title: "Microsoft Learn: Power Automate Training",
    type: "Course",
    provider: "Microsoft Learn",
    cost: "Free",
    estimatedTime: "20+ hours",
    whyUseful:
      "Structured learning modules for creating, managing, monitoring, and improving Microsoft Power Platform automations.",
    url: "https://learn.microsoft.com/en-us/training/powerplatform/power-automate",
    priority: "Essential",
  },
  owaspGenAi: {
    id: "automation-owasp-genai",
    title: "OWASP GenAI Security Project",
    type: "Documentation",
    provider: "OWASP",
    cost: "Free",
    estimatedTime: "Reference",
    whyUseful:
      "Security guidance for prompt injection, sensitive information disclosure, excessive agency, insecure outputs, and other GenAI risks.",
    url: "https://genai.owasp.org/",
    priority: "Recommended",
  },
} satisfies Record<string, CareerResource>;

function stationTest(
  id: string,
  title: string,
  topic: string,
  completionSignal: string,
  durationMinutes = 10
): CareerAssessment {
  return {
    id: `${id}-test`,
    title,
    description: `Complete this Career OS station check for ${topic}. Questions are original and non-official.`,
    passingScore: 80,
    durationMinutes,
    questions: stageQuestions(id, topic, completionSignal),
  };
}

export const aiAutomationSpecialistCareer: CareerWorkspaceData = {
  slug: "ai-automation-specialist",
  title: "AI Automation Specialist",
  category: "AI / Automation / Business Systems",
  visual: {
    nodeLabel: "Career Node: AI Automation Specialist",
    sceneTitle: "Inside the AI Automation Specialist node",
    sceneDescription:
      "A connected automation world where business processes, AI decisions, integrations, governance, and measurable outcomes form one professional journey.",
    imageAlt:
      "Futuristic AI automation career workspace with connected workflows, systems, agents, and operational dashboards",
  },
  shortDescription:
    "Design and implement AI-powered automation workflows that eliminate repetitive work, augment employees, and improve operational efficiency across business functions.",
  difficulty: "Intermediate",
  estimatedLearningTime: "6-12 months part-time",
  salary: "$80,000-$180,000+ depending on market, scope, and seniority",
  hiringDemand: "High and expanding across operations, consulting, IT, and digital transformation",
  remoteAvailability: "Very Good",
  aiCompatibilityScore: "9.7 / 10",
  bestFor: [
    "Operations professionals",
    "Business analysts",
    "Developers",
    "Power Platform makers",
    "Process improvement specialists",
  ],
  programmingRequirement:
    "Medium: low-code automation is central; Python or JavaScript is strongly recommended for APIs and custom logic",
  mathRequirement:
    "Low to Moderate: basic statistics, metrics, and decision logic are more important than advanced mathematics",
  creativityLevel: "High: workflow design requires practical problem solving and systems thinking",
  communicationLevel:
    "High: successful specialists translate business needs into reliable technical solutions",
  lastUpdated: "July 2026",
  metrics: [
    {
      label: "Learning time",
      value: "6-12 mo",
      detail: "A realistic part-time path for learners with operations or development experience.",
    },
    {
      label: "Portfolio target",
      value: "5 projects",
      detail: "Show business impact, technical architecture, controls, and measurable outcomes.",
    },
    {
      label: "Core stack",
      value: "Low-code + APIs",
      detail: "Combine workflow platforms, AI services, data sources, and custom code.",
    },
    {
      label: "Primary outcome",
      value: "Production automation",
      detail: "Build systems that are monitored, secure, explainable, and maintainable.",
    },
  ],
  overview: {
    title: "Build intelligent operational systems, not isolated demos",
    body:
      "AI Automation Specialists analyze business processes and redesign them as reliable digital workflows. They combine deterministic automation, APIs, data transformation, AI classification or generation, human approvals, observability, and governance. The role is especially valuable where teams need to reduce manual effort without sacrificing control, quality, security, or accountability.",
    responsibilities: [
      "Discover and prioritize automation opportunities using measurable business criteria.",
      "Map current-state and future-state workflows, including exceptions and human decisions.",
      "Build cloud flows, desktop automations, agent workflows, API integrations, and custom scripts.",
      "Integrate language models for extraction, classification, summarization, reasoning, and content generation.",
      "Design approvals, fallback paths, validation rules, audit trails, retries, and alerting.",
      "Measure time saved, error reduction, adoption, reliability, operating cost, and return on investment.",
      "Document architectures, security assumptions, data handling, ownership, and support procedures.",
    ],
    industries: [
      "Retail",
      "Logistics",
      "Finance",
      "Healthcare",
      "Manufacturing",
      "Human Resources",
      "Customer Service",
      "Consulting",
      "Public Sector",
      "Technology",
    ],
  },
  mapSections: [
    {
      id: "hero",
      label: "Hero",
      eyebrow: "Arrival",
      summary: "Role positioning, primary journey actions, and current progress.",
      x: 120,
      y: 120,
    },
    {
      id: "roadmap",
      label: "Roadmap",
      eyebrow: "Journey",
      summary: "A zero-to-employment automation journey with gated professional stations.",
      x: 470,
      y: 170,
    },
    {
      id: "learning",
      label: "Learning",
      eyebrow: "Learn",
      summary: "Station-synchronized lessons, tools, resources, tasks, notes, and assessments.",
      x: 320,
      y: 520,
    },
    {
      id: "project",
      label: "Project",
      eyebrow: "Build",
      summary: "Portfolio-grade automation projects based on realistic business scenarios.",
      x: 980,
      y: 410,
    },
    {
      id: "portfolio",
      label: "Portfolio",
      eyebrow: "Proof",
      summary: "Case studies, architecture diagrams, demos, metrics, and technical documentation.",
      x: 780,
      y: 620,
    },
    {
      id: "jobs",
      label: "Jobs",
      eyebrow: "Career",
      summary: "Job preparation for automation, AI solutions, Power Platform, and transformation roles.",
      x: 1040,
      y: 650,
    },
    {
      id: "interview-brief",
      label: "Interview Brief",
      eyebrow: "Practice",
      summary: "Workflow design, system architecture, business impact, governance, and behavioral preparation.",
      x: 520,
      y: 780,
    },
    {
      id: "intelligence",
      label: "Intelligence",
      eyebrow: "Market",
      summary: "Salary, demand, skills, role titles, and market intelligence for this occupation family.",
      x: 870,
      y: 160,
    },
  ],
  journeyMap: {
    theme: "treasure-map",
    overviewTitle: "From process discovery to production automation",
    overviewDescription:
      "Follow the route from identifying operational friction to designing, deploying, governing, and presenting intelligent automation systems. Every station produces evidence that supports the next one.",
    width: 2200,
    height: 1500,
    worldPadding: 120,
  },
  journeyStages: [
    {
      id: "automation-orientation",
      order: 1,
      title: "Career Orientation",
      type: "orientation",
      label: "Opportunity Observatory",
      landmark: "Opportunity Observatory",
      landmarkType: "symbol",
      terrain: ["symbol", "mist"],
      connections: ["process-foundations"],
      theme: "indigo",
      x: 150,
      y: 250,
      duration: "2-3 days",
      summary:
        "Understand the role, choose a target stack, assess your starting point, and define the business problems you want to solve.",
      explanation:
        "Begin by deciding whether your first specialization will be Microsoft Power Platform, n8n and APIs, UiPath, or a hybrid stack. The goal is not to collect tools; it is to identify the kinds of operational problems you can credibly automate.",
      lessons: [
        "AI Automation Specialist responsibilities",
        "Operations and developer entry paths",
        "Automation opportunity selection",
        "Portfolio and hiring evidence",
      ],
      resources: [
        resources.powerAutomateDocs,
        resources.n8nDocs,
        resources.uiPathDocs,
        resources.githubDocs,
      ],
      tasks: [
        {
          id: "automation-orientation-task-1",
          title: "Choose your primary automation stack",
          description:
            "Select Microsoft Power Platform, n8n, UiPath, or a developer-centric API stack as your first production path.",
          type: "career",
        },
        {
          id: "automation-orientation-task-2",
          title: "Create an automation opportunity backlog",
          description:
            "List ten repetitive or decision-heavy processes and rank them by value, risk, frequency, and feasibility.",
          type: "lesson",
        },
      ],
      test: stationTest(
        "automation-orientation",
        "Career orientation station test",
        "AI automation career orientation",
        "A defined target stack, baseline skills assessment, and prioritized automation opportunity backlog",
        8
      ),
    },
    {
      id: "process-foundations",
      order: 2,
      title: "Process and Automation Foundations",
      type: "foundation",
      label: "Process Mapping Camp",
      landmark: "Process Mapping Camp",
      landmarkType: "forest",
      terrain: ["forest", "bridge"],
      connections: ["workflow-engineering"],
      theme: "cyan",
      x: 430,
      y: 430,
      duration: "4-6 weeks",
      summary:
        "Learn process discovery, BPMN-style thinking, requirements, data basics, APIs, authentication, Git, and scripting fundamentals.",
      explanation:
        "Automation quality begins before implementation. You must understand actors, triggers, business rules, exceptions, data ownership, service-level expectations, and the cost of failure.",
      lessons: [
        "Current-state and future-state process mapping",
        "Triggers, actions, decisions, loops, and exceptions",
        "REST APIs, JSON, webhooks, and authentication",
        "Git, Python fundamentals, and data transformation",
        "Requirements, acceptance criteria, and success metrics",
      ],
      resources: [
        resources.pythonDocs,
        resources.postmanDocs,
        resources.githubDocs,
        resources.microsoftPowerPlatformTraining,
      ],
      tasks: [
        {
          id: "process-foundations-task-1",
          title: "Map a real business process",
          description:
            "Document actors, systems, triggers, decisions, exception paths, manual effort, and measurable pain points.",
          type: "lesson",
        },
        {
          id: "process-foundations-task-2",
          title: "Build an API data collector",
          description:
            "Use Python or a low-code HTTP action to authenticate, request JSON data, validate it, and save a structured result.",
          type: "project",
        },
      ],
      test: stationTest(
        "process-foundations",
        "Process foundations station test",
        "process discovery, APIs, data, and automation requirements",
        "A mapped process with clear requirements, exception paths, API understanding, and measurable success criteria"
      ),
      phaseExam: phaseExam(
        "process-foundations",
        "Automation foundations phase assessment",
        "process discovery, APIs, data, and automation requirements"
      ),
    },
    {
      id: "workflow-engineering",
      order: 3,
      title: "Workflow Engineering",
      type: "core-skills",
      label: "Flow Construction Yard",
      landmark: "Flow Construction Yard",
      landmarkType: "village",
      terrain: ["village", "bridge"],
      connections: ["ai-integration"],
      theme: "violet",
      x: 730,
      y: 230,
      duration: "6-8 weeks",
      summary:
        "Build deterministic workflows with triggers, conditions, loops, connectors, approvals, reusable components, and controlled state.",
      explanation:
        "This station develops the engineering discipline behind reliable automation. You will learn to separate orchestration, business rules, data transformation, and external integrations instead of building one fragile flow.",
      lessons: [
        "Event-driven, scheduled, and manual workflows",
        "Conditions, loops, parallel branches, and sub-workflows",
        "Approvals and human-in-the-loop controls",
        "Variables, state, idempotency, and duplicate prevention",
        "Reusable components and environment configuration",
      ],
      resources: [
        resources.powerAutomateDocs,
        resources.n8nDocs,
        resources.uiPathDocs,
        resources.githubDocs,
      ],
      tasks: [
        {
          id: "workflow-engineering-task-1",
          title: "Build a multi-step approval workflow",
          description:
            "Route a request using business rules, capture decisions, escalate delays, and preserve an audit trail.",
          type: "project",
        },
        {
          id: "workflow-engineering-task-2",
          title: "Add safe retry and duplicate protection",
          description:
            "Prevent repeated side effects and prove that failed steps can be retried without corrupting data.",
          type: "lesson",
        },
      ],
      test: stationTest(
        "workflow-engineering",
        "Workflow engineering station test",
        "deterministic workflow design and orchestration",
        "A modular workflow with clear triggers, branches, approvals, state management, and duplicate protection"
      ),
      phaseExam: phaseExam(
        "workflow-engineering",
        "Workflow engineering phase assessment",
        "deterministic workflow design and orchestration"
      ),
    },
    {
      id: "ai-integration",
      order: 4,
      title: "AI Integration and Agent Workflows",
      type: "tools",
      label: "Intelligence Forge",
      landmark: "Intelligence Forge",
      landmarkType: "mountain",
      terrain: ["mountain", "cliff"],
      connections: ["data-integrations"],
      theme: "blue",
      x: 1030,
      y: 470,
      duration: "8-10 weeks",
      summary:
        "Integrate language models, structured outputs, prompt systems, tools, retrieval, agents, and human review into business workflows.",
      explanation:
        "AI should be used only where ambiguity, language, unstructured content, or contextual judgment makes deterministic rules insufficient. Every AI step needs validation, confidence handling, fallback behavior, and cost controls.",
      lessons: [
        "Prompt and instruction design",
        "Structured outputs and schema validation",
        "Classification, extraction, summarization, and generation",
        "Tool calling, agent workflows, and orchestration",
        "Retrieval, grounding, citations, and knowledge sources",
        "Confidence thresholds and human validation",
      ],
      resources: [
        resources.openAiDocs,
        resources.copilotStudioDocs,
        resources.n8nDocs,
        resources.uiPathDocs,
      ],
      tasks: [
        {
          id: "ai-integration-task-1",
          title: "Build an AI document triage workflow",
          description:
            "Extract structured fields, classify the document, validate required values, and route low-confidence cases to a reviewer.",
          type: "project",
        },
        {
          id: "ai-integration-task-2",
          title: "Create an agent with controlled tools",
          description:
            "Allow an agent to read approved data and perform limited actions with authentication, validation, and confirmation boundaries.",
          type: "project",
        },
      ],
      test: stationTest(
        "ai-integration",
        "AI integration station test",
        "LLM integration, structured outputs, agents, retrieval, and human review",
        "A tested AI workflow with schema validation, grounding, confidence handling, tool boundaries, and fallback behavior"
      ),
      phaseExam: phaseExam(
        "ai-integration",
        "AI integration phase assessment",
        "LLM integration, structured outputs, agents, retrieval, and human review"
      ),
    },
    {
      id: "data-integrations",
      order: 5,
      title: "Data, APIs, and Enterprise Integrations",
      type: "tools",
      label: "Integration Harbor",
      landmark: "Integration Harbor",
      landmarkType: "port",
      terrain: ["port", "ship"],
      connections: ["production-governance"],
      theme: "emerald",
      x: 1360,
      y: 250,
      duration: "6-8 weeks",
      summary:
        "Connect business systems securely using APIs, webhooks, databases, files, queues, connectors, and reusable integration services.",
      explanation:
        "Professional automation lives between systems. This station focuses on secure authentication, data contracts, pagination, rate limits, asynchronous processing, reconciliation, and integration failure handling.",
      lessons: [
        "OAuth, API keys, service accounts, and secrets",
        "Webhooks, polling, pagination, and rate limits",
        "Databases, SharePoint, Dataverse, files, and queues",
        "Data mapping, validation, reconciliation, and lineage",
        "Custom connectors and reusable integration services",
      ],
      resources: [
        resources.postmanDocs,
        resources.powerAutomateDocs,
        resources.n8nDocs,
        resources.pythonDocs,
      ],
      tasks: [
        {
          id: "data-integrations-task-1",
          title: "Build a two-system synchronization",
          description:
            "Synchronize records incrementally, handle updates and deletions, respect API limits, and produce a reconciliation report.",
          type: "project",
        },
        {
          id: "data-integrations-task-2",
          title: "Create an integration contract",
          description:
            "Document fields, authentication, ownership, validation, errors, retries, limits, and support responsibilities.",
          type: "lesson",
        },
      ],
      test: stationTest(
        "data-integrations",
        "Data and integrations station test",
        "secure APIs, system integration, data contracts, and reconciliation",
        "A secure, documented integration with validation, rate-limit handling, reconciliation, and operational ownership"
      ),
      phaseExam: phaseExam(
        "data-integrations",
        "Enterprise integration phase assessment",
        "secure APIs, system integration, data contracts, and reconciliation"
      ),
    },
    {
      id: "production-governance",
      order: 6,
      title: "Production Reliability and Governance",
      type: "core-skills",
      label: "Control Tower",
      landmark: "Control Tower",
      landmarkType: "symbol",
      terrain: ["symbol", "cliff"],
      connections: ["automation-projects"],
      theme: "amber",
      x: 1680,
      y: 440,
      duration: "6-8 weeks",
      summary:
        "Make automations observable, secure, supportable, testable, compliant, and resilient to changing systems and data.",
      explanation:
        "A successful demo is not a production system. You must design monitoring, alerts, logs, ownership, access controls, test coverage, change management, incident response, and rollback procedures.",
      lessons: [
        "Error taxonomies, retries, dead-letter handling, and alerting",
        "Logging, tracing, dashboards, and operational metrics",
        "Access control, secrets, privacy, and data loss prevention",
        "Prompt injection, excessive agency, and unsafe outputs",
        "Testing, deployment environments, versioning, and rollback",
        "Runbooks, ownership, maintenance, and support models",
      ],
      resources: [
        resources.powerAutomateDocs,
        resources.copilotStudioDocs,
        resources.owaspGenAi,
        resources.githubDocs,
      ],
      tasks: [
        {
          id: "production-governance-task-1",
          title: "Create an automation operations dashboard",
          description:
            "Track runs, success rate, failure categories, processing time, cost, manual interventions, and business outcomes.",
          type: "project",
        },
        {
          id: "production-governance-task-2",
          title: "Write a production runbook",
          description:
            "Document ownership, dependencies, alerts, common failures, recovery, rollback, security controls, and escalation paths.",
          type: "portfolio",
        },
      ],
      test: stationTest(
        "production-governance",
        "Production governance station test",
        "automation reliability, monitoring, security, testing, and governance",
        "A monitored and governed automation with controls, tests, alerts, runbooks, ownership, and recovery procedures"
      ),
      phaseExam: phaseExam(
        "production-governance",
        "Production automation phase assessment",
        "automation reliability, monitoring, security, testing, and governance"
      ),
    },
    {
      id: "automation-projects",
      order: 7,
      title: "Real Automation Projects",
      type: "projects",
      label: "Automation Delivery Lab",
      landmark: "Automation Delivery Lab",
      landmarkType: "village",
      terrain: ["village", "river"],
      connections: ["automation-portfolio"],
      theme: "pink",
      x: 1990,
      y: 250,
      duration: "8-12 weeks",
      summary:
        "Deliver realistic automation systems that combine workflow logic, AI, integrations, controls, documentation, and measurable impact.",
      explanation:
        "This station turns individual skills into end-to-end solutions. Each project should start with a business problem and finish with a working system, operational controls, evidence, and a quantified outcome model.",
      lessons: [
        "End-to-end solution architecture",
        "Business impact and ROI measurement",
        "User acceptance testing",
        "Deployment and adoption",
        "Support and continuous improvement",
      ],
      resources: [
        resources.powerAutomateDocs,
        resources.copilotStudioDocs,
        resources.openAiDocs,
        resources.n8nDocs,
        resources.uiPathDocs,
        resources.githubDocs,
      ],
      tasks: [
        {
          id: "automation-projects-task-1",
          title: "Ship one production-style capstone",
          description:
            "Solve a real operational problem with architecture, tests, monitoring, governance, documentation, and measurable benefits.",
          type: "project",
        },
        {
          id: "automation-projects-task-2",
          title: "Run user acceptance testing",
          description:
            "Collect realistic test cases, document defects, confirm acceptance criteria, and record stakeholder feedback.",
          type: "project",
        },
      ],
      test: stationTest(
        "automation-projects",
        "Real projects station test",
        "end-to-end AI automation delivery",
        "A deployed or production-style automation with clear business value, controls, tests, monitoring, documentation, and user feedback"
      ),
      phaseExam: phaseExam(
        "automation-projects",
        "Automation delivery phase assessment",
        "end-to-end AI automation delivery"
      ),
    },
    {
      id: "automation-portfolio",
      order: 8,
      title: "Portfolio Building",
      type: "portfolio",
      label: "Proof Gallery",
      landmark: "Proof Gallery",
      landmarkType: "ruins",
      terrain: ["ruins", "symbol"],
      connections: ["automation-career-assets"],
      theme: "cyan",
      x: 1930,
      y: 820,
      duration: "2-4 weeks",
      summary:
        "Package your strongest systems as business-focused case studies with architecture, demos, metrics, controls, and lessons learned.",
      explanation:
        "Hiring teams need to understand both technical competence and business judgment. Your portfolio must show what changed, why the architecture was chosen, what could fail, and how success was measured.",
      lessons: [
        "Automation case study structure",
        "Architecture and process diagrams",
        "Demo recording and screenshots",
        "Impact, reliability, and governance metrics",
        "README and technical documentation quality",
      ],
      resources: [resources.githubDocs, resources.postmanDocs, resources.owaspGenAi],
      tasks: [
        {
          id: "automation-portfolio-task-1",
          title: "Publish three complete case studies",
          description:
            "Include problem, baseline, process map, architecture, implementation, controls, results, limitations, and next improvements.",
          type: "portfolio",
        },
        {
          id: "automation-portfolio-task-2",
          title: "Record a five-minute system walkthrough",
          description:
            "Demonstrate one workflow and explain business rules, AI boundaries, failure handling, monitoring, and impact.",
          type: "portfolio",
        },
      ],
      test: stationTest(
        "automation-portfolio",
        "Portfolio station test",
        "AI automation portfolio presentation",
        "Three recruiter-readable case studies with demos, architecture, measurable outcomes, controls, and honest limitations",
        8
      ),
    },
    {
      id: "automation-career-assets",
      order: 9,
      title: "Resume and Professional Profile",
      type: "resume",
      label: "Career Signal Station",
      landmark: "Career Signal Station",
      landmarkType: "symbol",
      terrain: ["symbol", "mist"],
      connections: ["automation-job-search"],
      theme: "blue",
      x: 1580,
      y: 1080,
      duration: "1-2 weeks",
      summary:
        "Translate automation work into credible resume bullets, LinkedIn positioning, GitHub proof, and role-specific professional language.",
      explanation:
        "Your profile should connect process improvement, technical implementation, governance, and measurable outcomes. Avoid presenting yourself as a tool operator; present yourself as a solution designer and delivery specialist.",
      lessons: [
        "Outcome-based resume bullets",
        "AI Automation Specialist positioning",
        "LinkedIn headline and About section",
        "GitHub and portfolio navigation",
        "Role-specific keywords and honest scope",
      ],
      resources: [resources.githubDocs, resources.microsoftPowerPlatformTraining],
      tasks: [
        {
          id: "automation-career-assets-task-1",
          title: "Write six evidence-based resume bullets",
          description:
            "Use action, architecture, scope, controls, and measurable result without overstating production experience.",
          type: "career",
        },
        {
          id: "automation-career-assets-task-2",
          title: "Optimize LinkedIn and GitHub",
          description:
            "Make your specialization, strongest projects, stack, and business impact understandable within one minute.",
          type: "portfolio",
        },
      ],
      test: stationTest(
        "automation-career-assets",
        "Career assets station test",
        "AI automation resume and professional profile preparation",
        "A focused resume and online profile that connect technical architecture to verified business outcomes",
        8
      ),
    },
    {
      id: "automation-job-search",
      order: 10,
      title: "Job Search Strategy",
      type: "job-search",
      label: "Opportunity Exchange",
      landmark: "Opportunity Exchange",
      landmarkType: "village",
      terrain: ["village", "bridge"],
      connections: ["automation-interview"],
      theme: "violet",
      x: 1210,
      y: 840,
      duration: "1-2 weeks",
      summary:
        "Target the right titles, companies, industries, stacks, and seniority levels while running a measurable application and networking system.",
      explanation:
        "AI automation work appears under several titles. Search across automation, Power Platform, intelligent automation, AI solutions, business systems, integration, and digital transformation roles.",
      lessons: [
        "Target role and company criteria",
        "Job description skill mapping",
        "Referral and outreach strategy",
        "Application tracking and follow-up",
        "Portfolio tailoring and gap analysis",
      ],
      resources: [
        resources.microsoftPowerPlatformTraining,
        resources.githubDocs,
        resources.copilotStudioDocs,
      ],
      tasks: [
        {
          id: "automation-job-search-task-1",
          title: "Build a target role matrix",
          description:
            "Track titles, required stacks, industries, seniority, portfolio evidence, gaps, location, and compensation expectations.",
          type: "job-search",
        },
        {
          id: "automation-job-search-task-2",
          title: "Create a weekly application operating rhythm",
          description:
            "Define targets for applications, referrals, outreach, practice, follow-up, and feedback review.",
          type: "job-search",
        },
      ],
      test: stationTest(
        "automation-job-search",
        "Job search station test",
        "AI automation job search strategy",
        "A targeted role matrix and weekly application system connected to portfolio evidence and market requirements",
        8
      ),
    },
    {
      id: "automation-interview",
      order: 11,
      title: "Interview Preparation",
      type: "interview",
      label: "Solution Review Arena",
      landmark: "Solution Review Arena",
      landmarkType: "ruins",
      terrain: ["ruins", "cliff"],
      connections: ["automation-final-assessment"],
      theme: "red",
      x: 850,
      y: 1110,
      duration: "2-4 weeks",
      summary:
        "Practice process discovery, workflow architecture, AI boundaries, integration design, reliability, governance, ROI, and stakeholder communication.",
      explanation:
        "Interviews often use ambiguous business scenarios. Strong candidates clarify the process, quantify value, separate deterministic and AI steps, identify risks, design controls, and explain trade-offs clearly.",
      lessons: [
        "Automation discovery interview",
        "Workflow and integration system design",
        "AI use-case and model decision trade-offs",
        "Security, governance, and failure analysis",
        "Business case and ROI explanation",
        "Behavioral and stakeholder stories",
      ],
      resources: [
        resources.powerAutomateDocs,
        resources.copilotStudioDocs,
        resources.openAiDocs,
        resources.owaspGenAi,
      ],
      tasks: [
        {
          id: "automation-interview-task-1",
          title: "Complete three architecture interviews",
          description:
            "Design an invoice workflow, an employee support agent, and an operations exception-management system out loud.",
          type: "interview",
        },
        {
          id: "automation-interview-task-2",
          title: "Prepare six STAR stories",
          description:
            "Cover discovery, stakeholder resistance, failure recovery, measurable impact, security judgment, and continuous improvement.",
          type: "interview",
        },
      ],
      test: stationTest(
        "automation-interview",
        "Interview preparation station test",
        "AI automation interviews and solution architecture communication",
        "Clear process discovery, architecture trade-offs, risk controls, business impact, and evidence-based project storytelling"
      ),
    },
    {
      id: "automation-final-assessment",
      order: 12,
      title: "Final Role Assessment",
      type: "assessment",
      label: "Production Readiness Gate",
      landmark: "Production Readiness Gate",
      landmarkType: "bridge",
      terrain: ["bridge", "mountain"],
      connections: ["automation-ready"],
      theme: "emerald",
      x: 500,
      y: 860,
      duration: "1 week",
      summary:
        "Review technical skill, business analysis, portfolio evidence, governance, communication, and job readiness as one professional system.",
      explanation:
        "The final assessment checks whether you can move from an ambiguous business problem to a secure, supportable, measurable automation solution and explain it to both technical and non-technical stakeholders.",
      lessons: [
        "Architecture review",
        "Portfolio quality review",
        "Production controls review",
        "Business impact review",
        "Resume and interview review",
      ],
      resources: [
        resources.powerAutomateDocs,
        resources.copilotStudioDocs,
        resources.openAiDocs,
        resources.owaspGenAi,
      ],
      tasks: [
        {
          id: "automation-final-assessment-task-1",
          title: "Complete a capstone defense",
          description:
            "Present your business problem, architecture, AI decisions, controls, metrics, failures, and next improvements.",
          type: "interview",
        },
        {
          id: "automation-final-assessment-task-2",
          title: "Run the readiness audit",
          description:
            "Verify that portfolio, resume, profiles, application strategy, and interview evidence meet your target roles.",
          type: "career",
        },
      ],
      test: stationTest(
        "automation-final-assessment",
        "Final AI Automation Specialist assessment",
        "complete AI automation professional readiness",
        "A defended capstone and verified readiness across discovery, architecture, delivery, governance, impact, portfolio, and communication",
        15
      ),
      phaseExam: phaseExam(
        "automation-final-assessment",
        "AI Automation Specialist final role assessment",
        "complete AI automation professional readiness"
      ),
    },
    {
      id: "automation-ready",
      order: 13,
      title: "Ready to Apply",
      type: "ready",
      label: "Automation Launchpad",
      landmark: "Automation Launchpad",
      landmarkType: "port",
      terrain: ["port", "ship"],
      connections: [],
      theme: "gold",
      x: 240,
      y: 1240,
      duration: "Ongoing",
      summary:
        "Run a disciplined application, networking, interview, and continuous-learning system while improving your portfolio from market feedback.",
      explanation:
        "Job readiness is not a finish line. Continue shipping small improvements, tracking market signals, tailoring evidence, practicing interviews, and learning from recruiter and stakeholder feedback.",
      lessons: [
        "Targeted application rhythm",
        "Interview feedback loop",
        "Portfolio iteration",
        "Market and tool updates",
        "Offer and role evaluation",
      ],
      resources: [
        resources.githubDocs,
        resources.microsoftPowerPlatformTraining,
        resources.copilotStudioDocs,
      ],
      tasks: [
        {
          id: "automation-ready-task-1",
          title: "Launch targeted applications",
          description:
            "Apply only where your skills and evidence match the role, then tailor the most relevant case studies and language.",
          type: "job-search",
        },
        {
          id: "automation-ready-task-2",
          title: "Review market feedback weekly",
          description:
            "Update your role matrix, portfolio, interview practice, and roadmap based on real responses and recurring requirements.",
          type: "career",
        },
      ],
      test: stationTest(
        "automation-ready",
        "Ready-to-apply confirmation",
        "sustainable AI automation application readiness",
        "A repeatable weekly system for targeted applications, networking, interview practice, feedback review, and portfolio improvement",
        8
      ),
    },
  ],
  roadmap: [
    {
      id: "automation-phase-1",
      phaseNumber: 1,
      title: "Process and Technical Foundations",
      duration: "4-6 weeks",
      goal:
        "Understand business processes, requirements, APIs, data, Git, and the technical primitives behind reliable automation.",
      status: "unlocked",
      mentorTip:
        "Do not automate a process you cannot explain. Spend enough time on exceptions, ownership, data quality, and measurable value.",
      sections: [
        "Process discovery",
        "Requirements",
        "APIs and JSON",
        "Data transformation",
        "Python and Git",
      ],
      practicalMissions: [
        "Map a real process and redesign its future state.",
        "Call an authenticated API and produce a validated structured result.",
      ],
      expectedOutcome:
        "You can analyze a process, identify a credible opportunity, define requirements, and work with common integration data formats.",
      lessons: [
        {
          id: "automation-p1-process-discovery",
          title: "Process discovery and solution framing",
          summary:
            "Learn to identify actors, triggers, rules, exceptions, data sources, risks, ownership, and measurable outcomes.",
          estimatedTime: "18 hours",
          difficulty: "Intermediate",
          outcomes: [
            "Map current and future process states",
            "Write acceptance criteria",
            "Prioritize automation opportunities",
          ],
          mission:
            "Create a process discovery document and ROI hypothesis for a repetitive operational workflow.",
          resources: [resources.powerAutomateDocs, resources.n8nDocs],
        },
        {
          id: "automation-p1-api-foundations",
          title: "APIs, data, Python, and Git",
          summary:
            "Build the technical foundation for integrating systems and extending low-code tools.",
          estimatedTime: "24 hours",
          difficulty: "Intermediate",
          outcomes: [
            "Read and transform JSON",
            "Call authenticated APIs",
            "Use Git and write reusable scripts",
          ],
          mission:
            "Build a small integration that retrieves, validates, transforms, and stores API data.",
          resources: [resources.pythonDocs, resources.postmanDocs, resources.githubDocs],
        },
      ],
      quiz: {
        id: "automation-phase-1-quiz",
        title: "Foundations checkpoint",
        phaseId: "automation-phase-1",
        description:
          "Original Career OS questions covering process discovery, requirements, APIs, and data fundamentals.",
        questions: stageQuestions(
          "automation-phase-1",
          "automation process and technical foundations",
          "A mapped and measurable process supported by clear requirements and a working API integration"
        ),
      },
    },
    {
      id: "automation-phase-2",
      phaseNumber: 2,
      title: "Workflow and Integration Engineering",
      duration: "8-12 weeks",
      goal:
        "Build modular workflows and secure integrations with approvals, state, reusable components, validation, and failure handling.",
      status: "unlocked",
      mentorTip:
        "A long flow is not automatically a good flow. Separate concerns and design for retries, support, and future change.",
      sections: [
        "Workflow patterns",
        "Approvals",
        "State and idempotency",
        "Enterprise integrations",
        "Error handling",
      ],
      practicalMissions: [
        "Build an approval workflow with audit history and escalation.",
        "Synchronize records between two systems with reconciliation.",
      ],
      expectedOutcome:
        "You can create modular, testable workflows and integrate business systems without creating uncontrolled side effects.",
      lessons: [
        {
          id: "automation-p2-workflow-design",
          title: "Workflow architecture",
          summary:
            "Design triggers, decisions, loops, approvals, sub-workflows, state, and duplicate protection.",
          estimatedTime: "30 hours",
          difficulty: "Intermediate",
          outcomes: [
            "Build modular workflows",
            "Implement approvals and escalation",
            "Prevent duplicate side effects",
          ],
          mission:
            "Create a request-to-approval workflow with validation, audit logging, escalation, and safe retry behavior.",
          resources: [resources.powerAutomateDocs, resources.n8nDocs],
        },
        {
          id: "automation-p2-integrations",
          title: "Enterprise integration patterns",
          summary:
            "Handle authentication, pagination, webhooks, rate limits, data contracts, and reconciliation.",
          estimatedTime: "28 hours",
          difficulty: "Intermediate",
          outcomes: [
            "Integrate secure APIs",
            "Handle limits and asynchronous work",
            "Reconcile data across systems",
          ],
          mission:
            "Build a reliable two-system synchronization and document its integration contract.",
          resources: [resources.postmanDocs, resources.pythonDocs, resources.powerAutomateDocs],
        },
      ],
      quiz: {
        id: "automation-phase-2-quiz",
        title: "Workflow and integration checkpoint",
        phaseId: "automation-phase-2",
        description:
          "Original Career OS questions covering workflow architecture, APIs, state, and reliability.",
        questions: stageQuestions(
          "automation-phase-2",
          "workflow and integration engineering",
          "A modular workflow and secure integration with approvals, state, retries, and reconciliation"
        ),
      },
    },
    {
      id: "automation-phase-3",
      phaseNumber: 3,
      title: "AI-Powered Automation",
      duration: "8-10 weeks",
      goal:
        "Use models and agents where they add value while preserving structure, validation, human control, grounding, and safety.",
      status: "unlocked",
      mentorTip:
        "Use deterministic rules for deterministic problems. Introduce AI only where language, ambiguity, or contextual reasoning creates real value.",
      sections: [
        "Prompt systems",
        "Structured outputs",
        "Extraction and classification",
        "Agents and tools",
        "Retrieval and grounding",
        "Human review",
      ],
      practicalMissions: [
        "Build an AI document-triage workflow with confidence-based review.",
        "Build a controlled agent that can use approved business tools.",
      ],
      expectedOutcome:
        "You can integrate AI into workflows without surrendering validation, observability, security, or human accountability.",
      lessons: [
        {
          id: "automation-p3-ai-patterns",
          title: "AI workflow patterns",
          summary:
            "Use classification, extraction, summarization, generation, and retrieval with schemas and evaluation.",
          estimatedTime: "32 hours",
          difficulty: "Intermediate",
          outcomes: [
            "Select appropriate AI tasks",
            "Validate structured outputs",
            "Create grounded and evaluated workflows",
          ],
          mission:
            "Create an AI intake workflow that extracts, validates, classifies, and routes unstructured requests.",
          resources: [resources.openAiDocs, resources.copilotStudioDocs, resources.n8nDocs],
        },
        {
          id: "automation-p3-agents",
          title: "Agents, tools, and human control",
          summary:
            "Design tool boundaries, approvals, memory, fallback behavior, and human escalation for agentic workflows.",
          estimatedTime: "28 hours",
          difficulty: "Advanced",
          outcomes: [
            "Design controlled tool use",
            "Add approval and escalation boundaries",
            "Test agent failure modes",
          ],
          mission:
            "Build an agent that reads approved sources and performs one controlled action after explicit validation.",
          resources: [resources.copilotStudioDocs, resources.openAiDocs, resources.uiPathDocs],
        },
      ],
      quiz: {
        id: "automation-phase-3-quiz",
        title: "AI automation checkpoint",
        phaseId: "automation-phase-3",
        description:
          "Original Career OS questions covering AI task selection, structured outputs, agents, grounding, and human review.",
        questions: stageQuestions(
          "automation-phase-3",
          "AI-powered automation",
          "A validated AI workflow with grounded outputs, controlled tools, evaluation, fallback behavior, and human review"
        ),
      },
    },
    {
      id: "automation-phase-4",
      phaseNumber: 4,
      title: "Production, Governance, and Value",
      duration: "6-8 weeks",
      goal:
        "Operate automation safely with monitoring, testing, security, governance, support, cost control, and measurable business impact.",
      status: "unlocked",
      mentorTip:
        "Production readiness is visible in how the system behaves when inputs, dependencies, credentials, users, and assumptions fail.",
      sections: [
        "Monitoring",
        "Testing",
        "Security",
        "Governance",
        "Runbooks",
        "ROI and adoption",
      ],
      practicalMissions: [
        "Create a monitoring dashboard and failure taxonomy.",
        "Write a runbook and calculate an impact model for a real automation.",
      ],
      expectedOutcome:
        "You can deploy and support a controlled automation with operational ownership, measurable value, and a clear recovery model.",
      lessons: [
        {
          id: "automation-p4-reliability",
          title: "Reliability, security, and governance",
          summary:
            "Design logs, alerts, access controls, testing, environments, change management, and recovery procedures.",
          estimatedTime: "28 hours",
          difficulty: "Advanced",
          outcomes: [
            "Monitor automation health",
            "Control access and sensitive data",
            "Recover and roll back safely",
          ],
          mission:
            "Add production controls, alerts, tests, and a runbook to one portfolio automation.",
          resources: [resources.powerAutomateDocs, resources.owaspGenAi, resources.githubDocs],
        },
        {
          id: "automation-p4-value",
          title: "Business impact, adoption, and continuous improvement",
          summary:
            "Measure time, quality, cost, risk, adoption, and realized benefits after deployment.",
          estimatedTime: "18 hours",
          difficulty: "Intermediate",
          outcomes: [
            "Build an ROI model",
            "Measure realized benefits",
            "Create an improvement backlog",
          ],
          mission:
            "Build a before-and-after impact model and define a monthly automation review process.",
          resources: [resources.powerAutomateDocs, resources.copilotStudioDocs],
        },
      ],
      quiz: {
        id: "automation-phase-4-quiz",
        title: "Production and governance checkpoint",
        phaseId: "automation-phase-4",
        description:
          "Original Career OS questions covering monitoring, testing, security, ownership, and measurable value.",
        questions: stageQuestions(
          "automation-phase-4",
          "production automation and governance",
          "A monitored, secure, testable, supportable automation with clear ownership and measurable business impact"
        ),
      },
    },
    {
      id: "automation-phase-5",
      phaseNumber: 5,
      title: "Portfolio and Employment Readiness",
      duration: "4-8 weeks",
      goal:
        "Turn technical work into credible evidence, professional positioning, targeted applications, and confident interviews.",
      status: "unlocked",
      mentorTip:
        "Your strongest evidence combines business understanding, architecture, controls, outcomes, and honest reflection—not tool screenshots.",
      sections: [
        "Case studies",
        "Demos",
        "Resume",
        "LinkedIn and GitHub",
        "Applications",
        "Interviews",
      ],
      practicalMissions: [
        "Publish three complete automation case studies.",
        "Complete a capstone defense and three mock architecture interviews.",
      ],
      expectedOutcome:
        "You can demonstrate job-relevant automation judgment and run a targeted search for aligned roles.",
      lessons: [
        {
          id: "automation-p5-portfolio",
          title: "Portfolio proof and professional positioning",
          summary:
            "Package systems with process maps, architecture, demos, controls, results, and recruiter-readable documentation.",
          estimatedTime: "24 hours",
          difficulty: "Intermediate",
          outcomes: [
            "Publish complete case studies",
            "Present measurable impact",
            "Position your specialization clearly",
          ],
          mission:
            "Publish three case studies and update your resume, LinkedIn, and GitHub around verified evidence.",
          resources: [resources.githubDocs, resources.microsoftPowerPlatformTraining],
        },
        {
          id: "automation-p5-interviews",
          title: "Applications and solution interviews",
          summary:
            "Practice ambiguous scenarios, role targeting, stakeholder communication, architecture trade-offs, and behavioral stories.",
          estimatedTime: "24 hours",
          difficulty: "Intermediate",
          outcomes: [
            "Target appropriate roles",
            "Explain architecture clearly",
            "Defend business and governance decisions",
          ],
          mission:
            "Complete three architecture interviews and launch a tracked weekly application system.",
          resources: [resources.powerAutomateDocs, resources.copilotStudioDocs, resources.owaspGenAi],
        },
      ],
      quiz: {
        id: "automation-phase-5-quiz",
        title: "Employment readiness checkpoint",
        phaseId: "automation-phase-5",
        description:
          "Original Career OS questions covering portfolio evidence, professional positioning, applications, and interviews.",
        questions: stageQuestions(
          "automation-phase-5",
          "AI automation employment readiness",
          "A complete portfolio, focused professional profile, targeted application system, and confident solution interview performance"
        ),
      },
    },
  ],
  projects: [
    {
      id: "automation-project-intelligent-inbox",
      title: "Intelligent Request and Email Triage",
      difficulty: "Intermediate",
      estimatedTime: "2-3 weeks",
      phaseId: "automation-phase-3",
      description:
        "Classify incoming requests, extract structured details, validate required fields, prioritize urgency, route ownership, and escalate low-confidence cases.",
      deliverables: [
        "Process map and acceptance criteria",
        "Working workflow",
        "Structured AI output schema",
        "Confidence and human-review logic",
        "Monitoring dashboard",
        "Architecture diagram and README",
      ],
      skills: [
        "Power Automate or n8n",
        "LLM APIs",
        "Structured outputs",
        "Human in the loop",
        "Monitoring",
      ],
    },
    {
      id: "automation-project-document-processing",
      title: "AI Document Processing Pipeline",
      difficulty: "Intermediate",
      estimatedTime: "3-4 weeks",
      phaseId: "automation-phase-3",
      description:
        "Process invoices, forms, or operational documents using extraction, classification, validation, approvals, and downstream system updates.",
      deliverables: [
        "Document schema",
        "Extraction and validation workflow",
        "Exception queue",
        "Human verification screen or approval",
        "Accuracy and failure report",
        "Security and data-handling notes",
      ],
      skills: [
        "Document AI",
        "RPA",
        "Validation",
        "Approvals",
        "Data integration",
      ],
    },
    {
      id: "automation-project-employee-agent",
      title: "Employee Knowledge and Action Agent",
      difficulty: "Advanced",
      estimatedTime: "3-5 weeks",
      phaseId: "automation-phase-3",
      description:
        "Build a grounded internal agent that answers questions from approved knowledge and performs limited actions through authenticated tools.",
      deliverables: [
        "Knowledge architecture",
        "Agent instructions and tool definitions",
        "Authentication and authorization model",
        "Evaluation test set",
        "Human escalation and fallback",
        "Analytics and safety report",
      ],
      skills: [
        "Copilot Studio or agent SDK",
        "Retrieval",
        "Tool calling",
        "Access control",
        "Evaluation",
      ],
    },
    {
      id: "automation-project-operations-exceptions",
      title: "Operations Exception Management System",
      difficulty: "Advanced",
      estimatedTime: "4-6 weeks",
      phaseId: "automation-phase-4",
      description:
        "Detect exceptions from operational data, enrich them with AI-generated context, assign actions, track resolution, and measure recurring root causes.",
      deliverables: [
        "Exception rules and taxonomy",
        "Data ingestion and enrichment pipeline",
        "Task or approval workflow",
        "Dashboard and alerts",
        "Root-cause summary",
        "Runbook and ownership model",
      ],
      skills: [
        "Operational analytics",
        "Workflow orchestration",
        "AI summarization",
        "Task management",
        "Power BI",
      ],
    },
    {
      id: "automation-project-system-sync",
      title: "Reliable Cross-System Synchronization",
      difficulty: "Intermediate",
      estimatedTime: "2-4 weeks",
      phaseId: "automation-phase-2",
      description:
        "Synchronize records between two systems while handling authentication, pagination, updates, duplicates, rate limits, retries, and reconciliation.",
      deliverables: [
        "Integration contract",
        "Incremental synchronization workflow",
        "Idempotency strategy",
        "Error and retry handling",
        "Reconciliation report",
        "Deployment documentation",
      ],
      skills: ["REST APIs", "OAuth", "Data mapping", "Idempotency", "Reconciliation"],
    },
    {
      id: "automation-project-governance-center",
      title: "Automation Governance and Monitoring Center",
      difficulty: "Advanced",
      estimatedTime: "3-5 weeks",
      phaseId: "automation-phase-4",
      description:
        "Create a central inventory and monitoring layer for automations, owners, dependencies, risks, run health, incidents, benefits, and review dates.",
      deliverables: [
        "Automation inventory schema",
        "Health and value dashboard",
        "Failure taxonomy",
        "Ownership and review workflow",
        "Risk and compliance checklist",
        "Incident and improvement backlog",
      ],
      skills: ["Governance", "Monitoring", "Power BI", "Risk management", "Operations"],
    },
  ],
  globalResources: Object.values(resources),
  readiness: [
    {
      id: "automation-readiness-process",
      label: "Process discovery evidence",
      description:
        "You can map a process, identify exceptions, define requirements, and quantify the expected value before selecting tools.",
      weight: 12,
    },
    {
      id: "automation-readiness-workflows",
      label: "Workflow engineering evidence",
      description:
        "You have built modular workflows with state, validation, approvals, retries, duplicate protection, and documentation.",
      weight: 14,
    },
    {
      id: "automation-readiness-integrations",
      label: "API and integration evidence",
      description:
        "You can authenticate, integrate systems, validate data, handle limits, and reconcile outcomes.",
      weight: 14,
    },
    {
      id: "automation-readiness-ai",
      label: "Responsible AI integration",
      description:
        "You can use structured outputs, grounding, evaluation, human review, and controlled tools rather than relying on uncontrolled prompts.",
      weight: 16,
    },
    {
      id: "automation-readiness-production",
      label: "Production reliability and governance",
      description:
        "Your projects include monitoring, alerts, tests, security, runbooks, ownership, recovery, and change management.",
      weight: 16,
    },
    {
      id: "automation-readiness-impact",
      label: "Business impact measurement",
      description:
        "You can explain time saved, error reduction, adoption, operating cost, risk reduction, and realized value.",
      weight: 10,
    },
    {
      id: "automation-readiness-portfolio",
      label: "Portfolio and communication",
      description:
        "You have three strong case studies and can defend process, architecture, controls, trade-offs, and outcomes.",
      weight: 10,
    },
    {
      id: "automation-readiness-career",
      label: "Application and interview readiness",
      description:
        "Your resume, LinkedIn, GitHub, target roles, application system, and interview stories are aligned to your evidence.",
      weight: 8,
    },
  ],
  finalChallenge: {
    title: "Enterprise AI Automation Capstone",
    description:
      "Design and deliver an end-to-end intelligent automation for a real operational process. The solution must combine process discovery, deterministic workflow logic, AI, secure integrations, human controls, monitoring, governance, and measurable value.",
    requirements: [
      "A real or realistically simulated business problem with documented baseline effort and pain points",
      "Current-state and future-state process maps",
      "Clear functional and non-functional requirements",
      "At least two system integrations",
      "At least one justified AI capability",
      "Structured validation and human-review logic",
      "Authentication, access control, and sensitive-data handling",
      "Error handling, retries, duplicate protection, and recovery",
      "Monitoring, logs, alerts, ownership, and a runbook",
      "A measurable impact and ROI model",
    ],
    deliverables: [
      "Working solution or production-quality prototype",
      "Architecture and process diagrams",
      "Source code or exported workflow assets",
      "Test plan and evaluation report",
      "Monitoring and operational dashboard",
      "Security and governance documentation",
      "Business impact report",
      "README, case study, and five-minute demo",
    ],
    evaluation: [
      "Business problem clarity and automation suitability",
      "Workflow and integration architecture",
      "Appropriate and controlled use of AI",
      "Reliability, security, governance, and maintainability",
      "Testing and evidence quality",
      "Measured operational impact",
      "Technical and stakeholder communication",
    ],
  },
  relatedCareers: [
    "AI Solutions Consultant",
    "Intelligent Automation Developer",
    "Power Platform Developer",
    "Microsoft Copilot Specialist",
    "Automation Engineer",
    "RPA Developer",
    "Business Process Automation Specialist",
    "Digital Transformation Consultant",
    "AI Business Analyst",
    "Integration Developer",
  ],
  progressRules: {
    readinessThreshold: 80,
    minimumProjects: 3,
    minimumQuizScore: 80,
  },
  jobBoard: {
    title: "AI Automation Career Opportunities",
    description:
      "Target roles such as AI Automation Specialist, Intelligent Automation Developer, Power Platform Developer, Copilot Studio Specialist, AI Solutions Consultant, RPA Developer, Workflow Automation Engineer, Business Process Automation Specialist, Integration Developer, and Digital Transformation Consultant.",
    integrationStatus: "coming-soon",
    filters: ["Location", "Remote", "Level", "Salary", "Company"],
    sampleDisclaimer:
      "Live vacancy data is not connected in this workspace yet. Use the role titles and evidence framework to prepare targeted searches without inventing market claims.",
  },
  portfolioTasks: [
    {
      id: "automation-portfolio-case-study-1",
      title: "Publish an intelligent workflow case study",
      description:
        "Show process discovery, architecture, AI boundaries, validation, exception handling, monitoring, and measurable value.",
      type: "portfolio",
    },
    {
      id: "automation-portfolio-case-study-2",
      title: "Publish an enterprise integration case study",
      description:
        "Explain authentication, data contracts, rate limits, retries, idempotency, reconciliation, and operational ownership.",
      type: "portfolio",
    },
    {
      id: "automation-portfolio-case-study-3",
      title: "Publish a production governance case study",
      description:
        "Demonstrate tests, monitoring, security controls, alerts, runbooks, incident recovery, and continuous improvement.",
      type: "portfolio",
    },
    {
      id: "automation-portfolio-demo",
      title: "Record a concise capstone demo",
      description:
        "Show the business problem, workflow, AI behavior, controls, monitoring, and outcome in five minutes or less.",
      type: "portfolio",
    },
    {
      id: "automation-portfolio-architecture",
      title: "Create a reusable architecture portfolio",
      description:
        "Include process maps, system context, data flow, sequence, security boundaries, and operational ownership diagrams.",
      type: "portfolio",
    },
  ],
  jobSearchTasks: [
    {
      id: "automation-job-task-role-matrix",
      title: "Create a target role matrix",
      description:
        "Compare role titles, required stacks, industries, seniority, location, salary expectations, and portfolio gaps.",
      type: "job-search",
    },
    {
      id: "automation-job-task-company-list",
      title: "Build a target company list",
      description:
        "Prioritize employers with visible automation, Power Platform, AI transformation, operations technology, or consulting practices.",
      type: "job-search",
    },
    {
      id: "automation-job-task-application-system",
      title: "Run a weekly application system",
      description:
        "Track applications, evidence used, referrals, follow-ups, interviews, feedback, and recurring skill requirements.",
      type: "job-search",
    },
    {
      id: "automation-job-task-tailoring",
      title: "Tailor evidence to each role",
      description:
        "Select the most relevant case studies and keywords without exaggerating scope, production usage, or ownership.",
      type: "job-search",
    },
  ],
  interviewPrep: {
    title: "AI Automation Specialist Interview Preparation",
    practiceAreas: [
      "Process discovery",
      "Workflow architecture",
      "Power Automate",
      "Copilot Studio",
      "n8n",
      "UiPath",
      "APIs and authentication",
      "Structured AI outputs",
      "Agents and tool use",
      "Human in the loop",
      "Error handling",
      "Monitoring and governance",
      "Security and privacy",
      "ROI and business value",
      "Stakeholder communication",
    ],
    questions: [
      "How would you decide whether a process should use rules, AI, RPA, an API integration, or a combination?",
      "Design an invoice-processing workflow with extraction, validation, approvals, system updates, and exception handling.",
      "How would you prevent duplicate actions when a workflow retries after a partial failure?",
      "When should an AI-generated result be sent to a human reviewer?",
      "How would you secure an agent that can access business data and perform actions?",
      "Explain how you would monitor workflow reliability and identify recurring failure patterns.",
      "How would you calculate the value of an automation after deployment?",
      "Describe a situation where you should not automate the process as currently designed.",
      "How would you migrate an automation between development, test, and production environments?",
      "Walk through one of your projects from business problem to architecture, controls, results, and lessons learned.",
      "How would you respond when a stakeholder requests an autonomous agent with excessive permissions?",
      "What documentation is required so another team can operate and maintain your solution?",
    ],
  },
};
