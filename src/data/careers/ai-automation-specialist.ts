import type {
  CareerAssessment,
  CareerResource,
  CareerWorkspaceData,
} from "@/types/careerWorkspace";
import {
  applyCareerAssessmentPolicy,
  createPhaseAssessment as phaseExam,
  createSectionQuestions as stageQuestions,
} from "@/content/assessments/assessmentBank";
import { CAREER_ASSESSMENT_PASSING_SCORE } from "@/lib/assessmentPolicy";

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
    passingScore: CAREER_ASSESSMENT_PASSING_SCORE,
    durationMinutes,
    questions: stageQuestions(id, topic, completionSignal),
  };
}

const aiAutomationSpecialistCareerBase: CareerWorkspaceData = {
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
      estimatedEffort: {
        minMinutes: 300,
        maxMinutes: 480,
        breakdown: {
          resources: { minMinutes: 120, maxMinutes: 180 },
          activities: { minMinutes: 150, maxMinutes: 240 },
          assessment: { minMinutes: 30, maxMinutes: 60 },
        },
      },
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
      estimatedEffort: {
        minMinutes: 2400,
        maxMinutes: 3600,
        breakdown: {
          resources: { minMinutes: 900, maxMinutes: 1200 },
          activities: { minMinutes: 1200, maxMinutes: 1800 },
          assessment: { minMinutes: 300, maxMinutes: 600 },
        },
      },
      summary:
        "Learn process discovery, BPMN-style thinking, requirements, data basics, APIs, authentication, Git, and scripting fundamentals.",
      explana×µÖÚ$z{-®éÜj×Wf–FVæ6RÂ&öfW76–öæÂ÷6—F–öæ–ærÂÆ–6F–öç2ÂæB–çFW'f–Ww2â"ÀĞ¢VW7F–öç3¢7FvUVW7F–öç2€Ğ¢&WFöÖF–öâ×†6RÓR"ÀĞ¢$’WFöÖF–öâV×Æ÷–ÖVçB&VF–æW72"ÀĞ¢$6ö×ÆWFR÷'FföÆ–òÂfö7W6VB&öfW76–öæÂ&öf–ÆRÂF&vWFVBÆ–6F–öâ7—7FVÒÂæB6öæf–FVçB6öÇWF–öâ–çFW'f–WrW&f÷&Öæ6R Ğ¢’ÀĞ¢ÒÀĞ¢ÒÀĞ¢ÒÀĞ¢&ö¦V7G3¢°Ğ¢°Ğ¢–C¢&WFöÖF–öâ×&ö¦V7BÖ–çFVÆÆ–vVçBÖ–æ&÷‚"ÀĞ¢F—FÆS¢$–çFVÆÆ–vVçB&WVW7BæBVÖ–ÂG&–vR"ÀĞ¢F–ff–7VÇG“¢$–çFW&ÖVF–FR"ÀĞ¢W7F–ÖFVEF–ÖS¢#"Ó2vVV·2"ÀĞ¢†6T–C¢&WFöÖF–öâ×†6RÓ2"ÀĞ¢FW67&—F–öã Ğ¢$6Æ76–g’–æ6öÖ–ær&WVW7G2ÂW‡G&7B7G'V7GW&VBFWF–Ç2ÂfÆ–FFR&WV—&VBf–VÆG2Â&–÷&—F—¦RW&vVæ7’Â&÷WFR÷væW'6†—ÂæBW66ÆFRÆ÷rÖ6öæf–FVæ6R66W2â"ÀĞ¢FVÆ—fW&&ÆW3¢°Ğ¢%&ö6W72ÖæB66WFæ6R7&—FW&–"ÀĞ¢%v÷&¶–ærv÷&¶fÆ÷r"ÀĞ¢%7G'V7GW&VB’÷WGWB66†VÖ"ÀĞ¢$6öæf–FVæ6RæB‡VÖâ×&Wf–WrÆöv–2"ÀĞ¢$Ööæ—F÷&–ærF6†&ö&B"ÀĞ¢$&6†—FV7GW&RF–w&ÒæB$TDÔR"ÀĞ¢ÒÀĞ¢6¶–ÆÇ3¢°Ğ¢%÷vW"WFöÖFR÷"ã†â"ÀĞ¢$ÄÄÒ—2"ÀĞ¢%7G'V7GW&VB÷WGWG2"ÀĞ¢$‡VÖâ–âF†RÆö÷"ÀĞ¢$Ööæ—F÷&–ær"ÀĞ¢ÒÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâ×&ö¦V7BÖFö7VÖVçB×&ö6W76–ær"ÀĞ¢F—FÆS¢$’Fö7VÖVçB&ö6W76–ær—VÆ–æR"ÀĞ¢F–ff–7VÇG“¢$–çFW&ÖVF–FR"ÀĞ¢W7F–ÖFVEF–ÖS¢#2ÓBvVV·2"ÀĞ¢†6T–C¢&WFöÖF–öâ×†6RÓ2"ÀĞ¢FW67&—F–öã Ğ¢%&ö6W72–çfö–6W2Âf÷&×2Â÷"÷W&F–öæÂFö7VÖVçG2W6–ærW‡G&7F–öâÂ6Æ76–f–6F–öâÂfÆ–FF–öâÂ&÷fÇ2ÂæBF÷vç7G&VÒ7—7FVÒWFFW2â"ÀĞ¢FVÆ—fW&&ÆW3¢°Ğ¢$Fö7VÖVçB66†VÖ"ÀĞ¢$W‡G&7F–öâæBfÆ–FF–öâv÷&¶fÆ÷r"ÀĞ¢$W†6WF–öâVWVR"ÀĞ¢$‡VÖâfW&–f–6F–öâ67&VVâ÷"&÷fÂ"ÀĞ¢$67W&7’æBf–ÇW&R&W÷'B"ÀĞ¢%6V7W&—G’æBFFÖ†æFÆ–æræ÷FW2"ÀĞ¢ÒÀĞ¢6¶–ÆÇ3¢°Ğ¢$Fö7VÖVçB’"ÀĞ¢%%"ÀĞ¢%fÆ–FF–öâ"ÀĞ¢$&÷fÇ2"ÀĞ¢$FF–çFVw&F–öâ"ÀĞ¢ÒÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâ×&ö¦V7BÖV×Æ÷–VRÖvVçB"ÀĞ¢F—FÆS¢$V×Æ÷–VR¶æ÷vÆVFvRæB7F–öâvVçB"ÀĞ¢F–ff–7VÇG“¢$Gfæ6VB"ÀĞ¢W7F–ÖFVEF–ÖS¢#2ÓRvVV·2"ÀĞ¢†6T–C¢&WFöÖF–öâ×†6RÓ2"ÀĞ¢FW67&—F–öã Ğ¢$'V–ÆBw&÷VæFVB–çFW&æÂvVçBF†Bç7vW'2VW7F–öç2g&öÒ&÷fVB¶æ÷vÆVFvRæBW&f÷&×2Æ–Ö—FVB7F–öç2F‡&÷Vv‚WF†VçF–6FVBFööÇ2â"ÀĞ¢FVÆ—fW&&ÆW3¢°Ğ¢$¶æ÷vÆVFvR&6†—FV7GW&R"ÀĞ¢$vVçB–ç7G'V7F–öç2æBFööÂFVf–æ—F–öç2"ÀĞ¢$WF†VçF–6F–öâæBWF†÷&—¦F–öâÖöFVÂ"ÀĞ¢$WfÇVF–öâFW7B6WB"ÀĞ¢$‡VÖâW66ÆF–öâæBfÆÆ&6²"ÀĞ¢$æÇ—F–72æB6fWG’&W÷'B"ÀĞ¢ÒÀĞ¢6¶–ÆÇ3¢°Ğ¢$6÷–Æ÷B7GVF–ò÷"vVçB4D²"ÀĞ¢%&WG&–WfÂ"ÀĞ¢%FööÂ6ÆÆ–ær"ÀĞ¢$66W726öçG&öÂ"ÀĞ¢$WfÇVF–öâ"ÀĞ¢ÒÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâ×&ö¦V7BÖ÷W&F–öç2ÖW†6WF–öç2"ÀĞ¢F—FÆS¢$÷W&F–öç2W†6WF–öâÖævVÖVçB7—7FVÒ"ÀĞ¢F–ff–7VÇG“¢$Gfæ6VB"ÀĞ¢W7F–ÖFVEF–ÖS¢#BÓbvVV·2"ÀĞ¢†6T–C¢&WFöÖF–öâ×†6RÓB"ÀĞ¢FW67&—F–öã Ğ¢$FWFV7BW†6WF–öç2g&öÒ÷W&F–öæÂFFÂVç&–6‚F†VÒv—F‚’ÖvVæW&FVB6öçFW‡BÂ76–vâ7F–öç2ÂG&6²&W6öÇWF–öâÂæBÖV7W&R&V7W'&–ær&ö÷B6W6W2â"ÀĞ¢FVÆ—fW&&ÆW3¢°Ğ¢$W†6WF–öâ'VÆW2æBF†öæö×’"ÀĞ¢$FF–ævW7F–öâæBVç&–6†ÖVçB—VÆ–æR"ÀĞ¢%F6²÷"&÷fÂv÷&¶fÆ÷r"ÀĞ¢$F6†&ö&BæBÆW'G2"ÀĞ¢%&ö÷BÖ6W6R7VÖÖ'’"ÀĞ¢%'Væ&öö²æB÷væW'6†—ÖöFVÂ"ÀĞ¢ÒÀĞ¢6¶–ÆÇ3¢°Ğ¢$÷W&F–öæÂæÇ—F–72"ÀĞ¢%v÷&¶fÆ÷r÷&6†W7G&F–öâ"ÀĞ¢$’7VÖÖ&—¦F–öâ"ÀĞ¢%F6²ÖævVÖVçB"ÀĞ¢%÷vW"$’"ÀĞ¢ÒÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâ×&ö¦V7B×7—7FVÒ×7–æ2"ÀĞ¢F—FÆS¢%&VÆ–&ÆR7&÷72Õ7—7FVÒ7–æ6‡&öæ—¦F–öâ"ÀĞ¢F–ff–7VÇG“¢$–çFW&ÖVF–FR"ÀĞ¢W7F–ÖFVEF–ÖS¢#"ÓBvVV·2"ÀĞ¢†6T–C¢&WFöÖF–öâ×†6RÓ""ÀĞ¢FW67&—F–öã Ğ¢%7–æ6‡&öæ—¦R&V6÷&G2&WGvVVâGvò7—7FV×2v†–ÆR†æFÆ–ærWF†VçF–6F–öâÂv–æF–öâÂWFFW2ÂGWÆ–6FW2Â&FRÆ–Ö—G2Â&WG&–W2ÂæB&V6öæ6–Æ–F–öââ"ÀĞ¢FVÆ—fW&&ÆW3¢°Ğ¢$–çFVw&F–öâ6öçG&7B"ÀĞ¢$–æ7&VÖVçFÂ7–æ6‡&öæ—¦F–öâv÷&¶fÆ÷r"ÀĞ¢$–FV×÷FVæ7’7G&FVw’"ÀĞ¢$W'&÷"æB&WG'’†æFÆ–ær"ÀĞ¢%&V6öæ6–Æ–F–öâ&W÷'B"ÀĞ¢$FWÆ÷–ÖVçBFö7VÖVçFF–öâ"ÀĞ¢ÒÀĞ¢6¶–ÆÇ3¢²%$U5B—2"Â$ôWF‚"Â$FFÖ–ær"Â$–FV×÷FVæ7’"Â%&V6öæ6–Æ–F–öâ%ÒÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâ×&ö¦V7BÖv÷fW&ææ6RÖ6VçFW""ÀĞ¢F—FÆS¢$WFöÖF–öâv÷fW&ææ6RæBÖöæ—F÷&–ær6VçFW""ÀĞ¢F–ff–7VÇG“¢$Gfæ6VB"ÀĞ¢W7F–ÖFVEF–ÖS¢#2ÓRvVV·2"ÀĞ¢†6T–C¢&WFöÖF–öâ×†6RÓB"ÀĞ¢FW67&—F–öã Ğ¢$7&VFR6VçG&Â–çfVçF÷'’æBÖöæ—F÷&–ærÆ–W"f÷"WFöÖF–öç2Â÷væW'2ÂFWVæFVæ6–W2Â&—6·2Â'Vâ†VÇF‚Â–æ6–FVçG2Â&VæVf—G2ÂæB&Wf–WrFFW2â"ÀĞ¢FVÆ—fW&&ÆW3¢°Ğ¢$WFöÖF–öâ–çfVçF÷'’66†VÖ"ÀĞ¢$†VÇF‚æBfÇVRF6†&ö&B"ÀĞ¢$f–ÇW&RF†öæö×’"ÀĞ¢$÷væW'6†—æB&Wf–Wrv÷&¶fÆ÷r"ÀĞ¢%&—6²æB6ö×Æ–æ6R6†V6¶Æ—7B"ÀĞ¢$–æ6–FVçBæB–×&÷fVÖVçB&6¶Æör"ÀĞ¢ÒÀĞ¢6¶–ÆÇ3¢²$v÷fW&ææ6R"Â$Ööæ—F÷&–ær"Â%÷vW"$’"Â%&—6²ÖævVÖVçB"Â$÷W&F–öç2%ÒÀĞ¢ÒÀĞ¢ÒÀĞ¢vÆö&Å&W6÷W&6W3¢ö&¦V7BçfÇVW2‡&W6÷W&6W2’ÀĞ¢&VF–æW73¢°Ğ¢°Ğ¢–C¢&WFöÖF–öâ×&VF–æW72×&ö6W72"ÀĞ¢Æ&VÃ¢%&ö6W72F—66÷fW'’Wf–FVæ6R"ÀĞ¢FW67&—F–öã Ğ¢%–÷R6âÖ&ö6W72Â–FVçF–g’W†6WF–öç2ÂFVf–æR&WV—&VÖVçG2ÂæBVçF–g’F†RW‡V7FVBfÇVR&Vf÷&R6VÆV7F–ærFööÇ2â"ÀĞ¢vV–v‡C¢"ÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâ×&VF–æW72×v÷&¶fÆ÷w2"ÀĞ¢Æ&VÃ¢%v÷&¶fÆ÷rVæv–æVW&–ærWf–FVæ6R"ÀĞ¢FW67&—F–öã Ğ¢%–÷R†fR'V–ÇBÖöGVÆ"v÷&¶fÆ÷w2v—F‚7FFRÂfÆ–FF–öâÂ&÷fÇ2Â&WG&–W2ÂGWÆ–6FR&÷FV7F–öâÂæBFö7VÖVçFF–öââ"ÀĞ¢vV–v‡C¢BÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâ×&VF–æW72Ö–çFVw&F–öç2"ÀĞ¢Æ&VÃ¢$’æB–çFVw&F–öâWf–FVæ6R"ÀĞ¢FW67&—F–öã Ğ¢%–÷R6âWF†VçF–6FRÂ–çFVw&FR7—7FV×2ÂfÆ–FFRFFÂ†æFÆRÆ–Ö—G2ÂæB&V6öæ6–ÆR÷WF6öÖW2â"ÀĞ¢vV–v‡C¢BÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâ×&VF–æW72Ö’"ÀĞ¢Æ&VÃ¢%&W7öç6–&ÆR’–çFVw&F–öâ"ÀĞ¢FW67&—F–öã Ğ¢%–÷R6âW6R7G'V7GW&VB÷WGWG2Âw&÷VæF–ærÂWfÇVF–öâÂ‡VÖâ&Wf–WrÂæB6öçG&öÆÆVBFööÇ2&F†W"F†â&VÇ––æröâVæ6öçG&öÆÆVB&ö×G2â"ÀĞ¢vV–v‡C¢bÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâ×&VF–æW72×&öGV7F–öâ"ÀĞ¢Æ&VÃ¢%&öGV7F–öâ&VÆ–&–Æ—G’æBv÷fW&ææ6R"ÀĞ¢FW67&—F–öã Ğ¢%–÷W"&ö¦V7G2–æ6ÇVFRÖöæ—F÷&–ærÂÆW'G2ÂFW7G2Â6V7W&—G’Â'Væ&öö·2Â÷væW'6†—Â&V6÷fW'’ÂæB6†ævRÖævVÖVçBâ"ÀĞ¢vV–v‡C¢bÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâ×&VF–æW72Ö–×7B"ÀĞ¢Æ&VÃ¢$'W6–æW72–×7BÖV7W&VÖVçB"ÀĞ¢FW67&—F–öã Ğ¢%–÷R6âW‡Æ–âF–ÖR6fVBÂW'&÷"&VGV7F–öâÂF÷F–öâÂ÷W&F–ær6÷7BÂ&—6²&VGV7F–öâÂæB&VÆ—¦VBfÇVRâ"ÀĞ¢vV–v‡C¢ÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâ×&VF–æW72×÷'FföÆ–ò"ÀĞ¢Æ&VÃ¢%÷'FföÆ–òæB6öÖ×Væ–6F–öâ"ÀĞ¢FW67&—F–öã Ğ¢%–÷R†fRF‡&VR7G&öær66R7GVF–W2æB6âFVfVæB&ö6W72Â&6†—FV7GW&RÂ6öçG&öÇ2ÂG&FRÖöfg2ÂæB÷WF6öÖW2â"ÀĞ¢vV–v‡C¢ÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâ×&VF–æW72Ö6&VW""ÀĞ¢Æ&VÃ¢$Æ–6F–öâæB–çFW'f–Wr&VF–æW72"ÀĞ¢FW67&—F–öã Ğ¢%–÷W"&W7VÖRÂÆ–æ¶VD–âÂv—D‡V"ÂF&vWB&öÆW2ÂÆ–6F–öâ7—7FVÒÂæB–çFW'f–Wr7F÷&–W2&RÆ–væVBFò–÷W"Wf–FVæ6Râ"ÀĞ¢vV–v‡C¢‚ÀĞ¢ÒÀĞ¢ÒÀĞ¢f–æÄ6†ÆÆVævS¢°Ğ¢F—FÆS¢$VçFW'&—6R’WFöÖF–öâ67FöæR"ÀĞ¢FW67&—F–öã Ğ¢$FW6–vâæBFVÆ—fW"âVæB×FòÖVæB–çFVÆÆ–vVçBWFöÖF–öâf÷"&VÂ÷W&F–öæÂ&ö6W72âF†R6öÇWF–öâ×W7B6öÖ&–æR&ö6W72F—66÷fW'’ÂFWFW&Ö–æ—7F–2v÷&¶fÆ÷rÆöv–2Â’Â6V7W&R–çFVw&F–öç2Â‡VÖâ6öçG&öÇ2ÂÖöæ—F÷&–ærÂv÷fW&ææ6RÂæBÖV7W&&ÆRfÇVRâ"ÀĞ¢&WV—&VÖVçG3¢°Ğ¢$&VÂ÷"&VÆ—7F–6ÆÇ’6–×VÆFVB'W6–æW72&ö&ÆVÒv—F‚Fö7VÖVçFVB&6VÆ–æRVff÷'BæB–âö–çG2"ÀĞ¢$7W'&VçB×7FFRæBgWGW&R×7FFR&ö6W72Ö2"ÀĞ¢$6ÆV"gVæ7F–öæÂæBæöâÖgVæ7F–öæÂ&WV—&VÖVçG2"ÀĞ¢$BÆV7BGvò7—7FVÒ–çFVw&F–öç2"ÀĞ¢$BÆV7BöæR§W7F–f–VB’6&–Æ—G’"ÀĞ¢%7G'V7GW&VBfÆ–FF–öâæB‡VÖâ×&Wf–WrÆöv–2"ÀĞ¢$WF†VçF–6F–öâÂ66W726öçG&öÂÂæB6Vç6—F—fRÖFF†æFÆ–ær"ÀĞ¢$W'&÷"†æFÆ–ærÂ&WG&–W2ÂGWÆ–6FR&÷FV7F–öâÂæB&V6÷fW'’"ÀĞ¢$Ööæ—F÷&–ærÂÆöw2ÂÆW'G2Â÷væW'6†—ÂæB'Væ&öö²"ÀĞ¢$ÖV7W&&ÆR–×7BæB$ô’ÖöFVÂ"ÀĞ¢ÒÀĞ¢FVÆ—fW&&ÆW3¢°Ğ¢%v÷&¶–ær6öÇWF–öâ÷"&öGV7F–öâ×VÆ—G’&÷F÷G—R"ÀĞ¢$&6†—FV7GW&RæB&ö6W72F–w&×2"ÀĞ¢%6÷W&6R6öFR÷"W‡÷'FVBv÷&¶fÆ÷r76WG2"ÀĞ¢%FW7BÆâæBWfÇVF–öâ&W÷'B"ÀĞ¢$Ööæ—F÷&–æræB÷W&F–öæÂF6†&ö&B"ÀĞ¢%6V7W&—G’æBv÷fW&ææ6RFö7VÖVçFF–öâ"ÀĞ¢$'W6–æW72–×7B&W÷'B"ÀĞ¢%$TDÔRÂ66R7GVG’ÂæBf—fRÖÖ–çWFRFVÖò"ÀĞ¢ÒÀĞ¢WfÇVF–öã¢°Ğ¢$'W6–æW72&ö&ÆVÒ6Æ&—G’æBWFöÖF–öâ7V—F&–Æ—G’"ÀĞ¢%v÷&¶fÆ÷ræB–çFVw&F–öâ&6†—FV7GW&R"ÀĞ¢$&÷&–FRæB6öçG&öÆÆVBW6Röb’"ÀĞ¢%&VÆ–&–Æ—G’Â6V7W&—G’Âv÷fW&ææ6RÂæBÖ–çF–æ&–Æ—G’"ÀĞ¢%FW7F–æræBWf–FVæ6RVÆ—G’"ÀĞ¢$ÖV7W&VB÷W&F–öæÂ–×7B"ÀĞ¢%FV6†æ–6ÂæB7F¶V†öÆFW"6öÖ×Væ–6F–öâ"ÀĞ¢ÒÀĞ¢ÒÀĞ¢&VÆFVD6&VW'3¢°Ğ¢$’6öÇWF–öç26öç7VÇFçB"ÀĞ¢$–çFVÆÆ–vVçBWFöÖF–öâFWfVÆ÷W""ÀĞ¢%÷vW"ÆFf÷&ÒFWfVÆ÷W""ÀĞ¢$Ö–7&÷6ögB6÷–Æ÷B7V6–Æ—7B"ÀĞ¢$WFöÖF–öâVæv–æVW""ÀĞ¢%%FWfVÆ÷W""ÀĞ¢$'W6–æW72&ö6W72WFöÖF–öâ7V6–Æ—7B"ÀĞ¢$F–v—FÂG&ç6f÷&ÖF–öâ6öç7VÇFçB"ÀĞ¢$’'W6–æW72æÇ—7B"ÀĞ¢$–çFVw&F–öâFWfVÆ÷W""ÀĞ¢ÒÀĞ¢&öw&W75'VÆW3¢°Ğ¢&VF–æW75F‡&W6†öÆC¢ƒÀĞ¢Ö–æ–×VÕ&ö¦V7G3¢2ÀĞ¢Ö–æ–×VÕV—¥66÷&S¢cÀĞ¢ÒÀĞ¢¦ö$&ö&C¢°Ğ¢F—FÆS¢$’WFöÖF–öâ6&VW"÷÷'GVæ—F–W2"ÀĞ¢FW67&—F–öã Ğ¢%F&vWB&öÆW27V6‚2’WFöÖF–öâ7V6–Æ—7BÂ–çFVÆÆ–vVçBWFöÖF–öâFWfVÆ÷W"Â÷vW"ÆFf÷&ÒFWfVÆ÷W"Â6÷–Æ÷B7GVF–ò7V6–Æ—7BÂ’6öÇWF–öç26öç7VÇFçBÂ%FWfVÆ÷W"Âv÷&¶fÆ÷rWFöÖF–öâVæv–æVW"Â'W6–æW72&ö6W72WFöÖF–öâ7V6–Æ—7BÂ–çFVw&F–öâFWfVÆ÷W"ÂæBF–v—FÂG&ç6f÷&ÖF–öâ6öç7VÇFçBâ"ÀĞ¢–çFVw&F–öå7FGW3¢&6öÖ–ær×6ööâ"ÀĞ¢f–ÇFW'3¢²$Æö6F–öâ"Â%&VÖ÷FR"Â$ÆWfVÂ"Â%6Æ'’"Â$6ö×ç’%ÒÀĞ¢6×ÆTF—66Æ–ÖW# Ğ¢$Æ—fRf6æ7’FF—2æ÷B6öææV7FVB–âF†—2v÷&·76R–WBâW6RF†R&öÆRF—FÆW2æBWf–FVæ6Rg&ÖWv÷&²Fò&W&RF&vWFVB6V&6†W2v—F†÷WB–çfVçF–ærÖ&¶WB6Æ–×2â"ÀĞ¢ÒÀĞ¢÷'FföÆ–õF6·3¢°Ğ¢°Ğ¢–C¢&WFöÖF–öâ×÷'FföÆ–òÖ66R×7GVG’Ó"ÀĞ¢F—FÆS¢%V&Æ—6‚â–çFVÆÆ–vVçBv÷&¶fÆ÷r66R7GVG’"ÀĞ¢FW67&—F–öã Ğ¢%6†÷r&ö6W72F—66÷fW'’Â&6†—FV7GW&RÂ’&÷VæF&–W2ÂfÆ–FF–öâÂW†6WF–öâ†æFÆ–ærÂÖöæ—F÷&–ærÂæBÖV7W&&ÆRfÇVRâ"ÀĞ¢G—S¢'÷'FföÆ–ò"ÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâ×÷'FföÆ–òÖ66R×7GVG’Ó""ÀĞ¢F—FÆS¢%V&Æ—6‚âVçFW'&—6R–çFVw&F–öâ66R7GVG’"ÀĞ¢FW67&—F–öã Ğ¢$W‡Æ–âWF†VçF–6F–öâÂFF6öçG&7G2Â&FRÆ–Ö—G2Â&WG&–W2Â–FV×÷FVæ7’Â&V6öæ6–Æ–F–öâÂæB÷W&F–öæÂ÷væW'6†—â"ÀĞ¢G—S¢'÷'FföÆ–ò"ÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâ×÷'FföÆ–òÖ66R×7GVG’Ó2"ÀĞ¢F—FÆS¢%V&Æ—6‚&öGV7F–öâv÷fW&ææ6R66R7GVG’"ÀĞ¢FW67&—F–öã Ğ¢$FVÖöç7G&FRFW7G2ÂÖöæ—F÷&–ærÂ6V7W&—G’6öçG&öÇ2ÂÆW'G2Â'Væ&öö·2Â–æ6–FVçB&V6÷fW'’ÂæB6öçF–çV÷W2–×&÷fVÖVçBâ"ÀĞ¢G—S¢'÷'FföÆ–ò"ÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâ×÷'FföÆ–òÖFVÖò"ÀĞ¢F—FÆS¢%&V6÷&B6öæ6—6R67FöæRFVÖò"ÀĞ¢FW67&—F–öã Ğ¢%6†÷rF†R'W6–æW72&ö&ÆVÒÂv÷&¶fÆ÷rÂ’&V†f–÷"Â6öçG&öÇ2ÂÖöæ—F÷&–ærÂæB÷WF6öÖR–âf—fRÖ–çWFW2÷"ÆW72â"ÀĞ¢G—S¢'÷'FföÆ–ò"ÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâ×÷'FföÆ–òÖ&6†—FV7GW&R"ÀĞ¢F—FÆS¢$7&VFR&WW6&ÆR&6†—FV7GW&R÷'FföÆ–ò"ÀĞ¢FW67&—F–öã Ğ¢$–æ6ÇVFR&ö6W72Ö2Â7—7FVÒ6öçFW‡BÂFFfÆ÷rÂ6WVVæ6RÂ6V7W&—G’&÷VæF&–W2ÂæB÷W&F–öæÂ÷væW'6†—F–w&×2â"ÀĞ¢G—S¢'÷'FföÆ–ò"ÀĞ¢ÒÀĞ¢ÒÀĞ¢¦ö%6V&6…F6·3¢°Ğ¢°Ğ¢–C¢&WFöÖF–öâÖ¦ö"×F6²×&öÆRÖÖG&—‚"ÀĞ¢F—FÆS¢$7&VFRF&vWB&öÆRÖG&—‚"ÀĞ¢FW67&—F–öã Ğ¢$6ö×&R&öÆRF—FÆW2Â&WV—&VB7F6·2Â–æGW7G&–W2Â6Væ–÷&—G’ÂÆö6F–öâÂ6Æ'’W‡V7FF–öç2ÂæB÷'FföÆ–òv2â"ÀĞ¢G—S¢&¦ö"×6V&6‚"ÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâÖ¦ö"×F6²Ö6ö×ç’ÖÆ—7B"ÀĞ¢F—FÆS¢$'V–ÆBF&vWB6ö×ç’Æ—7B"ÀĞ¢FW67&—F–öã Ğ¢%&–÷&—F—¦RV×Æ÷–W'2v—F‚f—6–&ÆRWFöÖF–öâÂ÷vW"ÆFf÷&ÒÂ’G&ç6f÷&ÖF–öâÂ÷W&F–öç2FV6†æöÆöw’Â÷"6öç7VÇF–ær&7F–6W2â"ÀĞ¢G—S¢&¦ö"×6V&6‚"ÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâÖ¦ö"×F6²ÖÆ–6F–öâ×7—7FVÒ"ÀĞ¢F—FÆS¢%'VâvVV¶Ç’Æ–6F–öâ7—7FVÒ"ÀĞ¢FW67&—F–öã Ğ¢%G&6²Æ–6F–öç2ÂWf–FVæ6RW6VBÂ&VfW'&Ç2ÂföÆÆ÷r×W2Â–çFW'f–Ww2ÂfVVF&6²ÂæB&V7W'&–ær6¶–ÆÂ&WV—&VÖVçG2â"ÀĞ¢G—S¢&¦ö"×6V&6‚"ÀĞ¢ÒÀĞ¢°Ğ¢–C¢&WFöÖF–öâÖ¦ö"×F6²×F–Æ÷&–ær"ÀĞ¢F—FÆS¢%F–Æ÷"Wf–FVæ6RFòV6‚&öÆR"ÀĞ¢FW67&—F–öã Ğ¢%6VÆV7BF†RÖ÷7B&VÆWfçB66R7GVF–W2æB¶W—v÷&G2v—F†÷WBW†vvW&F–ær66÷RÂ&öGV7F–öâW6vRÂ÷"÷væW'6†—â"ÀĞ¢G—S¢&¦ö"×6V&6‚"ÀĞ¢ÒÀĞ¢ÒÀĞ¢–çFW'f–Wu&W¢°Ğ¢F—FÆS¢$’WFöÖF–öâ7V6–Æ—7B–çFW'f–Wr&W&F–öâ"ÀĞ¢&7F–6T&V3¢°Ğ¢%&ö6W72F—66÷fW'’"ÀĞ¢%v÷&¶fÆ÷r&6†—FV7GW&R"ÀĞ¢%÷vW"WFöÖFR"ÀĞ¢$6÷–Æ÷B7GVF–ò"ÀĞ¢&ã†â"ÀĞ¢%V•F‚"ÀĞ¢$—2æBWF†VçF–6F–öâ"ÀĞ¢%7G'V7GW&VB’÷WGWG2"ÀĞ¢$vVçG2æBFööÂW6R"ÀĞ¢$‡VÖâ–âF†RÆö÷"ÀĞ¢$W'&÷"†æFÆ–ær"ÀĞ¢$Ööæ—F÷&–æræBv÷fW&ææ6R"ÀĞ¢%6V7W&—G’æB&—f7’"ÀĞ¢%$ô’æB'W6–æW72fÇVR"ÀĞ¢%7F¶V†öÆFW"6öÖ×Væ–6F–öâ"ÀĞ¢ÒÀĞ¢VW7F–öç3¢°Ğ¢$†÷rv÷VÆB–÷RFV6–FRv†WF†W"&ö6W726†÷VÆBW6R'VÆW2Â’Â%Ââ’–çFVw&F–öâÂ÷"6öÖ&–æF–öãò"ÀĞ¢$FW6–vââ–çfö–6R×&ö6W76–ærv÷&¶fÆ÷rv—F‚W‡G&7F–öâÂfÆ–FF–öâÂ&÷fÇ2Â7—7FVÒWFFW2ÂæBW†6WF–öâ†æFÆ–ærâ"ÀĞ¢$†÷rv÷VÆB–÷R&WfVçBGWÆ–6FR7F–öç2v†Vâv÷&¶fÆ÷r&WG&–W2gFW"'F–Âf–ÇW&Sò"ÀĞ¢%v†Vâ6†÷VÆBâ’ÖvVæW&FVB&W7VÇB&R6VçBFò‡VÖâ&Wf–WvW#ò"ÀĞ¢$†÷rv÷VÆB–÷R6V7W&RâvVçBF†B6â66W72'W6–æW72FFæBW&f÷&Ò7F–öç3ò"ÀĞ¢$W‡Æ–â†÷r–÷Rv÷VÆBÖöæ—F÷"v÷&¶fÆ÷r&VÆ–&–Æ—G’æB–FVçF–g’&V7W'&–ærf–ÇW&RGFW&ç2â"ÀĞ¢$†÷rv÷VÆB–÷R6Æ7VÆFRF†RfÇVRöbâWFöÖF–öâgFW"FWÆ÷–ÖVçCò"ÀĞ¢$FW67&–&R6—GVF–öâv†W&R–÷R6†÷VÆBæ÷BWFöÖFRF†R&ö6W7227W'&VçFÇ’FW6–væVBâ"ÀĞ¢$†÷rv÷VÆB–÷RÖ–w&FRâWFöÖF–öâ&WGvVVâFWfVÆ÷ÖVçBÂFW7BÂæB&öGV7F–öâVçf—&öæÖVçG3ò"ÀĞ¢%vÆ²F‡&÷Vv‚öæRöb–÷W"&ö¦V7G2g&öÒ'W6–æW72&ö&ÆVÒFò&6†—FV7GW&RÂ6öçG&öÇ2Â&W7VÇG2ÂæBÆW76öç2ÆV&æVBâ"ÀĞ¢$†÷rv÷VÆB–÷R&W7öæBv†Vâ7F¶V†öÆFW"&WVW7G2âWFöæöÖ÷W2vVçBv—F‚W†6W76—fRW&Ö—76–öç3ò"ÀĞ¢%v†BFö7VÖVçFF–öâ—2&WV—&VB6òæ÷F†W"FVÒ6â÷W&FRæBÖ–çF–â–÷W"6öÇWF–öãò"ÀĞ¢ÒÀĞ¢ÒÀĞ§Ó°Ğ Ğ¦W‡÷'B6öç7B”WFöÖF–öå7V6–Æ—7D6&VW"ÒÇ”6&VW$76W76ÖVçEöÆ–7’€Ğ¢”WFöÖF–öå7V6–Æ—7D6&VW$&6PĞ¢“°Ğ 