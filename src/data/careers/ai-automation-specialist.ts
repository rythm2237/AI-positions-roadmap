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
      explana×�µÖÚ$z{-®éÜj×�Wf–FVæ6RÂ&öfW76–öæÂ÷6—F–öæ–ærÂÆ–6F–öç2ÂæB–çFW'f–Ww2â"ÀÐ¢VW7F–öç3¢7FvUVW7F–öç2€Ð¢&WFöÖF–öâ×†6RÓR"ÀÐ¢$’WFöÖF–öâV×Æ÷–ÖVçB&VF–æW72"ÀÐ¢$6ö×ÆWFR÷'FföÆ–òÂfö7W6VB&öfW76–öæÂ&öf–ÆRÂF&vWFVBÆ–6F–öâ7—7FVÒÂæB6öæf–FVçB6öÇWF–öâ–çFW'f–WrW&f÷&Öæ6R Ð¢’ÀÐ¢ÒÀÐ¢ÒÀÐ¢ÒÀÐ¢&ö¦V7G3¢°Ð¢°Ð¢–C¢&WFöÖF–öâ×&ö¦V7BÖ–çFVÆÆ–vVçBÖ–æ&÷‚"ÀÐ¢F—FÆS¢$–çFVÆÆ–vVçB&WVW7BæBVÖ–ÂG&–vR"ÀÐ¢F–ff–7VÇG“¢$–çFW&ÖVF–FR"ÀÐ¢W7F–ÖFVEF–ÖS¢#"Ó2vVV·2"ÀÐ¢†6T–C¢&WFöÖF–öâ×†6RÓ2"ÀÐ¢FW67&—F–öã Ð¢$6Æ76–g’–æ6öÖ–ær&WVW7G2ÂW‡G&7B7G'V7GW&VBFWF–Ç2ÂfÆ–FFR&WV—&VBf–VÆG2Â&–÷&—F—¦RW&vVæ7’Â&÷WFR÷væW'6†—ÂæBW66ÆFRÆ÷rÖ6öæf–FVæ6R66W2â"ÀÐ¢FVÆ—fW&&ÆW3¢°Ð¢%&ö6W72ÖæB66WFæ6R7&—FW&–"ÀÐ¢%v÷&¶–ærv÷&¶fÆ÷r"ÀÐ¢%7G'V7GW&VB’÷WGWB66†VÖ"ÀÐ¢$6öæf–FVæ6RæB‡VÖâ×&Wf–WrÆöv–2"ÀÐ¢$Ööæ—F÷&–ærF6†&ö&B"ÀÐ¢$&6†—FV7GW&RF–w&ÒæB$TDÔR"ÀÐ¢ÒÀÐ¢6¶–ÆÇ3¢°Ð¢%÷vW"WFöÖFR÷"ã†â"ÀÐ¢$ÄÄÒ—2"ÀÐ¢%7G'V7GW&VB÷WGWG2"ÀÐ¢$‡VÖâ–âF†RÆö÷"ÀÐ¢$Ööæ—F÷&–ær"ÀÐ¢ÒÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâ×&ö¦V7BÖFö7VÖVçB×&ö6W76–ær"ÀÐ¢F—FÆS¢$’Fö7VÖVçB&ö6W76–ær—VÆ–æR"ÀÐ¢F–ff–7VÇG“¢$–çFW&ÖVF–FR"ÀÐ¢W7F–ÖFVEF–ÖS¢#2ÓBvVV·2"ÀÐ¢†6T–C¢&WFöÖF–öâ×†6RÓ2"ÀÐ¢FW67&—F–öã Ð¢%&ö6W72–çfö–6W2Âf÷&×2Â÷"÷W&F–öæÂFö7VÖVçG2W6–ærW‡G&7F–öâÂ6Æ76–f–6F–öâÂfÆ–FF–öâÂ&÷fÇ2ÂæBF÷vç7G&VÒ7—7FVÒWFFW2â"ÀÐ¢FVÆ—fW&&ÆW3¢°Ð¢$Fö7VÖVçB66†VÖ"ÀÐ¢$W‡G&7F–öâæBfÆ–FF–öâv÷&¶fÆ÷r"ÀÐ¢$W†6WF–öâVWVR"ÀÐ¢$‡VÖâfW&–f–6F–öâ67&VVâ÷"&÷fÂ"ÀÐ¢$67W&7’æBf–ÇW&R&W÷'B"ÀÐ¢%6V7W&—G’æBFFÖ†æFÆ–æræ÷FW2"ÀÐ¢ÒÀÐ¢6¶–ÆÇ3¢°Ð¢$Fö7VÖVçB’"ÀÐ¢%%"ÀÐ¢%fÆ–FF–öâ"ÀÐ¢$&÷fÇ2"ÀÐ¢$FF–çFVw&F–öâ"ÀÐ¢ÒÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâ×&ö¦V7BÖV×Æ÷–VRÖvVçB"ÀÐ¢F—FÆS¢$V×Æ÷–VR¶æ÷vÆVFvRæB7F–öâvVçB"ÀÐ¢F–ff–7VÇG“¢$Gfæ6VB"ÀÐ¢W7F–ÖFVEF–ÖS¢#2ÓRvVV·2"ÀÐ¢†6T–C¢&WFöÖF–öâ×†6RÓ2"ÀÐ¢FW67&—F–öã Ð¢$'V–ÆBw&÷VæFVB–çFW&æÂvVçBF†Bç7vW'2VW7F–öç2g&öÒ&÷fVB¶æ÷vÆVFvRæBW&f÷&×2Æ–Ö—FVB7F–öç2F‡&÷Vv‚WF†VçF–6FVBFööÇ2â"ÀÐ¢FVÆ—fW&&ÆW3¢°Ð¢$¶æ÷vÆVFvR&6†—FV7GW&R"ÀÐ¢$vVçB–ç7G'V7F–öç2æBFööÂFVf–æ—F–öç2"ÀÐ¢$WF†VçF–6F–öâæBWF†÷&—¦F–öâÖöFVÂ"ÀÐ¢$WfÇVF–öâFW7B6WB"ÀÐ¢$‡VÖâW66ÆF–öâæBfÆÆ&6²"ÀÐ¢$æÇ—F–72æB6fWG’&W÷'B"ÀÐ¢ÒÀÐ¢6¶–ÆÇ3¢°Ð¢$6÷–Æ÷B7GVF–ò÷"vVçB4D²"ÀÐ¢%&WG&–WfÂ"ÀÐ¢%FööÂ6ÆÆ–ær"ÀÐ¢$66W726öçG&öÂ"ÀÐ¢$WfÇVF–öâ"ÀÐ¢ÒÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâ×&ö¦V7BÖ÷W&F–öç2ÖW†6WF–öç2"ÀÐ¢F—FÆS¢$÷W&F–öç2W†6WF–öâÖævVÖVçB7—7FVÒ"ÀÐ¢F–ff–7VÇG“¢$Gfæ6VB"ÀÐ¢W7F–ÖFVEF–ÖS¢#BÓbvVV·2"ÀÐ¢†6T–C¢&WFöÖF–öâ×†6RÓB"ÀÐ¢FW67&—F–öã Ð¢$FWFV7BW†6WF–öç2g&öÒ÷W&F–öæÂFFÂVç&–6‚F†VÒv—F‚’ÖvVæW&FVB6öçFW‡BÂ76–vâ7F–öç2ÂG&6²&W6öÇWF–öâÂæBÖV7W&R&V7W'&–ær&ö÷B6W6W2â"ÀÐ¢FVÆ—fW&&ÆW3¢°Ð¢$W†6WF–öâ'VÆW2æBF†öæö×’"ÀÐ¢$FF–ævW7F–öâæBVç&–6†ÖVçB—VÆ–æR"ÀÐ¢%F6²÷"&÷fÂv÷&¶fÆ÷r"ÀÐ¢$F6†&ö&BæBÆW'G2"ÀÐ¢%&ö÷BÖ6W6R7VÖÖ'’"ÀÐ¢%'Væ&öö²æB÷væW'6†—ÖöFVÂ"ÀÐ¢ÒÀÐ¢6¶–ÆÇ3¢°Ð¢$÷W&F–öæÂæÇ—F–72"ÀÐ¢%v÷&¶fÆ÷r÷&6†W7G&F–öâ"ÀÐ¢$’7VÖÖ&—¦F–öâ"ÀÐ¢%F6²ÖævVÖVçB"ÀÐ¢%÷vW"$’"ÀÐ¢ÒÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâ×&ö¦V7B×7—7FVÒ×7–æ2"ÀÐ¢F—FÆS¢%&VÆ–&ÆR7&÷72Õ7—7FVÒ7–æ6‡&öæ—¦F–öâ"ÀÐ¢F–ff–7VÇG“¢$–çFW&ÖVF–FR"ÀÐ¢W7F–ÖFVEF–ÖS¢#"ÓBvVV·2"ÀÐ¢†6T–C¢&WFöÖF–öâ×†6RÓ""ÀÐ¢FW67&—F–öã Ð¢%7–æ6‡&öæ—¦R&V6÷&G2&WGvVVâGvò7—7FV×2v†–ÆR†æFÆ–ærWF†VçF–6F–öâÂv–æF–öâÂWFFW2ÂGWÆ–6FW2Â&FRÆ–Ö—G2Â&WG&–W2ÂæB&V6öæ6–Æ–F–öââ"ÀÐ¢FVÆ—fW&&ÆW3¢°Ð¢$–çFVw&F–öâ6öçG&7B"ÀÐ¢$–æ7&VÖVçFÂ7–æ6‡&öæ—¦F–öâv÷&¶fÆ÷r"ÀÐ¢$–FV×÷FVæ7’7G&FVw’"ÀÐ¢$W'&÷"æB&WG'’†æFÆ–ær"ÀÐ¢%&V6öæ6–Æ–F–öâ&W÷'B"ÀÐ¢$FWÆ÷–ÖVçBFö7VÖVçFF–öâ"ÀÐ¢ÒÀÐ¢6¶–ÆÇ3¢²%$U5B—2"Â$ôWF‚"Â$FFÖ–ær"Â$–FV×÷FVæ7’"Â%&V6öæ6–Æ–F–öâ%ÒÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâ×&ö¦V7BÖv÷fW&ææ6RÖ6VçFW""ÀÐ¢F—FÆS¢$WFöÖF–öâv÷fW&ææ6RæBÖöæ—F÷&–ær6VçFW""ÀÐ¢F–ff–7VÇG“¢$Gfæ6VB"ÀÐ¢W7F–ÖFVEF–ÖS¢#2ÓRvVV·2"ÀÐ¢†6T–C¢&WFöÖF–öâ×†6RÓB"ÀÐ¢FW67&—F–öã Ð¢$7&VFR6VçG&Â–çfVçF÷'’æBÖöæ—F÷&–ærÆ–W"f÷"WFöÖF–öç2Â÷væW'2ÂFWVæFVæ6–W2Â&—6·2Â'Vâ†VÇF‚Â–æ6–FVçG2Â&VæVf—G2ÂæB&Wf–WrFFW2â"ÀÐ¢FVÆ—fW&&ÆW3¢°Ð¢$WFöÖF–öâ–çfVçF÷'’66†VÖ"ÀÐ¢$†VÇF‚æBfÇVRF6†&ö&B"ÀÐ¢$f–ÇW&RF†öæö×’"ÀÐ¢$÷væW'6†—æB&Wf–Wrv÷&¶fÆ÷r"ÀÐ¢%&—6²æB6ö×Æ–æ6R6†V6¶Æ—7B"ÀÐ¢$–æ6–FVçBæB–×&÷fVÖVçB&6¶Æör"ÀÐ¢ÒÀÐ¢6¶–ÆÇ3¢²$v÷fW&ææ6R"Â$Ööæ—F÷&–ær"Â%÷vW"$’"Â%&—6²ÖævVÖVçB"Â$÷W&F–öç2%ÒÀÐ¢ÒÀÐ¢ÒÀÐ¢vÆö&Å&W6÷W&6W3¢ö&¦V7BçfÇVW2‡&W6÷W&6W2’ÀÐ¢&VF–æW73¢°Ð¢°Ð¢–C¢&WFöÖF–öâ×&VF–æW72×&ö6W72"ÀÐ¢Æ&VÃ¢%&ö6W72F—66÷fW'’Wf–FVæ6R"ÀÐ¢FW67&—F–öã Ð¢%–÷R6âÖ&ö6W72Â–FVçF–g’W†6WF–öç2ÂFVf–æR&WV—&VÖVçG2ÂæBVçF–g’F†RW‡V7FVBfÇVR&Vf÷&R6VÆV7F–ærFööÇ2â"ÀÐ¢vV–v‡C¢"ÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâ×&VF–æW72×v÷&¶fÆ÷w2"ÀÐ¢Æ&VÃ¢%v÷&¶fÆ÷rVæv–æVW&–ærWf–FVæ6R"ÀÐ¢FW67&—F–öã Ð¢%–÷R†fR'V–ÇBÖöGVÆ"v÷&¶fÆ÷w2v—F‚7FFRÂfÆ–FF–öâÂ&÷fÇ2Â&WG&–W2ÂGWÆ–6FR&÷FV7F–öâÂæBFö7VÖVçFF–öââ"ÀÐ¢vV–v‡C¢BÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâ×&VF–æW72Ö–çFVw&F–öç2"ÀÐ¢Æ&VÃ¢$’æB–çFVw&F–öâWf–FVæ6R"ÀÐ¢FW67&—F–öã Ð¢%–÷R6âWF†VçF–6FRÂ–çFVw&FR7—7FV×2ÂfÆ–FFRFFÂ†æFÆRÆ–Ö—G2ÂæB&V6öæ6–ÆR÷WF6öÖW2â"ÀÐ¢vV–v‡C¢BÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâ×&VF–æW72Ö’"ÀÐ¢Æ&VÃ¢%&W7öç6–&ÆR’–çFVw&F–öâ"ÀÐ¢FW67&—F–öã Ð¢%–÷R6âW6R7G'V7GW&VB÷WGWG2Âw&÷VæF–ærÂWfÇVF–öâÂ‡VÖâ&Wf–WrÂæB6öçG&öÆÆVBFööÇ2&F†W"F†â&VÇ––æröâVæ6öçG&öÆÆVB&ö×G2â"ÀÐ¢vV–v‡C¢bÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâ×&VF–æW72×&öGV7F–öâ"ÀÐ¢Æ&VÃ¢%&öGV7F–öâ&VÆ–&–Æ—G’æBv÷fW&ææ6R"ÀÐ¢FW67&—F–öã Ð¢%–÷W"&ö¦V7G2–æ6ÇVFRÖöæ—F÷&–ærÂÆW'G2ÂFW7G2Â6V7W&—G’Â'Væ&öö·2Â÷væW'6†—Â&V6÷fW'’ÂæB6†ævRÖævVÖVçBâ"ÀÐ¢vV–v‡C¢bÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâ×&VF–æW72Ö–×7B"ÀÐ¢Æ&VÃ¢$'W6–æW72–×7BÖV7W&VÖVçB"ÀÐ¢FW67&—F–öã Ð¢%–÷R6âW‡Æ–âF–ÖR6fVBÂW'&÷"&VGV7F–öâÂF÷F–öâÂ÷W&F–ær6÷7BÂ&—6²&VGV7F–öâÂæB&VÆ—¦VBfÇVRâ"ÀÐ¢vV–v‡C¢ÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâ×&VF–æW72×÷'FföÆ–ò"ÀÐ¢Æ&VÃ¢%÷'FföÆ–òæB6öÖ×Væ–6F–öâ"ÀÐ¢FW67&—F–öã Ð¢%–÷R†fRF‡&VR7G&öær66R7GVF–W2æB6âFVfVæB&ö6W72Â&6†—FV7GW&RÂ6öçG&öÇ2ÂG&FRÖöfg2ÂæB÷WF6öÖW2â"ÀÐ¢vV–v‡C¢ÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâ×&VF–æW72Ö6&VW""ÀÐ¢Æ&VÃ¢$Æ–6F–öâæB–çFW'f–Wr&VF–æW72"ÀÐ¢FW67&—F–öã Ð¢%–÷W"&W7VÖRÂÆ–æ¶VD–âÂv—D‡V"ÂF&vWB&öÆW2ÂÆ–6F–öâ7—7FVÒÂæB–çFW'f–Wr7F÷&–W2&RÆ–væVBFò–÷W"Wf–FVæ6Râ"ÀÐ¢vV–v‡C¢‚ÀÐ¢ÒÀÐ¢ÒÀÐ¢f–æÄ6†ÆÆVævS¢°Ð¢F—FÆS¢$VçFW'&—6R’WFöÖF–öâ67FöæR"ÀÐ¢FW67&—F–öã Ð¢$FW6–vâæBFVÆ—fW"âVæB×FòÖVæB–çFVÆÆ–vVçBWFöÖF–öâf÷"&VÂ÷W&F–öæÂ&ö6W72âF†R6öÇWF–öâ×W7B6öÖ&–æR&ö6W72F—66÷fW'’ÂFWFW&Ö–æ—7F–2v÷&¶fÆ÷rÆöv–2Â’Â6V7W&R–çFVw&F–öç2Â‡VÖâ6öçG&öÇ2ÂÖöæ—F÷&–ærÂv÷fW&ææ6RÂæBÖV7W&&ÆRfÇVRâ"ÀÐ¢&WV—&VÖVçG3¢°Ð¢$&VÂ÷"&VÆ—7F–6ÆÇ’6–×VÆFVB'W6–æW72&ö&ÆVÒv—F‚Fö7VÖVçFVB&6VÆ–æRVff÷'BæB–âö–çG2"ÀÐ¢$7W'&VçB×7FFRæBgWGW&R×7FFR&ö6W72Ö2"ÀÐ¢$6ÆV"gVæ7F–öæÂæBæöâÖgVæ7F–öæÂ&WV—&VÖVçG2"ÀÐ¢$BÆV7BGvò7—7FVÒ–çFVw&F–öç2"ÀÐ¢$BÆV7BöæR§W7F–f–VB’6&–Æ—G’"ÀÐ¢%7G'V7GW&VBfÆ–FF–öâæB‡VÖâ×&Wf–WrÆöv–2"ÀÐ¢$WF†VçF–6F–öâÂ66W726öçG&öÂÂæB6Vç6—F—fRÖFF†æFÆ–ær"ÀÐ¢$W'&÷"†æFÆ–ærÂ&WG&–W2ÂGWÆ–6FR&÷FV7F–öâÂæB&V6÷fW'’"ÀÐ¢$Ööæ—F÷&–ærÂÆöw2ÂÆW'G2Â÷væW'6†—ÂæB'Væ&öö²"ÀÐ¢$ÖV7W&&ÆR–×7BæB$ô’ÖöFVÂ"ÀÐ¢ÒÀÐ¢FVÆ—fW&&ÆW3¢°Ð¢%v÷&¶–ær6öÇWF–öâ÷"&öGV7F–öâ×VÆ—G’&÷F÷G—R"ÀÐ¢$&6†—FV7GW&RæB&ö6W72F–w&×2"ÀÐ¢%6÷W&6R6öFR÷"W‡÷'FVBv÷&¶fÆ÷r76WG2"ÀÐ¢%FW7BÆâæBWfÇVF–öâ&W÷'B"ÀÐ¢$Ööæ—F÷&–æræB÷W&F–öæÂF6†&ö&B"ÀÐ¢%6V7W&—G’æBv÷fW&ææ6RFö7VÖVçFF–öâ"ÀÐ¢$'W6–æW72–×7B&W÷'B"ÀÐ¢%$TDÔRÂ66R7GVG’ÂæBf—fRÖÖ–çWFRFVÖò"ÀÐ¢ÒÀÐ¢WfÇVF–öã¢°Ð¢$'W6–æW72&ö&ÆVÒ6Æ&—G’æBWFöÖF–öâ7V—F&–Æ—G’"ÀÐ¢%v÷&¶fÆ÷ræB–çFVw&F–öâ&6†—FV7GW&R"ÀÐ¢$&÷&–FRæB6öçG&öÆÆVBW6Röb’"ÀÐ¢%&VÆ–&–Æ—G’Â6V7W&—G’Âv÷fW&ææ6RÂæBÖ–çF–æ&–Æ—G’"ÀÐ¢%FW7F–æræBWf–FVæ6RVÆ—G’"ÀÐ¢$ÖV7W&VB÷W&F–öæÂ–×7B"ÀÐ¢%FV6†æ–6ÂæB7F¶V†öÆFW"6öÖ×Væ–6F–öâ"ÀÐ¢ÒÀÐ¢ÒÀÐ¢&VÆFVD6&VW'3¢°Ð¢$’6öÇWF–öç26öç7VÇFçB"ÀÐ¢$–çFVÆÆ–vVçBWFöÖF–öâFWfVÆ÷W""ÀÐ¢%÷vW"ÆFf÷&ÒFWfVÆ÷W""ÀÐ¢$Ö–7&÷6ögB6÷–Æ÷B7V6–Æ—7B"ÀÐ¢$WFöÖF–öâVæv–æVW""ÀÐ¢%%FWfVÆ÷W""ÀÐ¢$'W6–æW72&ö6W72WFöÖF–öâ7V6–Æ—7B"ÀÐ¢$F–v—FÂG&ç6f÷&ÖF–öâ6öç7VÇFçB"ÀÐ¢$’'W6–æW72æÇ—7B"ÀÐ¢$–çFVw&F–öâFWfVÆ÷W""ÀÐ¢ÒÀÐ¢&öw&W75'VÆW3¢°Ð¢&VF–æW75F‡&W6†öÆC¢ƒÀÐ¢Ö–æ–×VÕ&ö¦V7G3¢2ÀÐ¢Ö–æ–×VÕV—¥66÷&S¢cÀÐ¢ÒÀÐ¢¦ö$&ö&C¢°Ð¢F—FÆS¢$’WFöÖF–öâ6&VW"÷÷'GVæ—F–W2"ÀÐ¢FW67&—F–öã Ð¢%F&vWB&öÆW27V6‚2’WFöÖF–öâ7V6–Æ—7BÂ–çFVÆÆ–vVçBWFöÖF–öâFWfVÆ÷W"Â÷vW"ÆFf÷&ÒFWfVÆ÷W"Â6÷–Æ÷B7GVF–ò7V6–Æ—7BÂ’6öÇWF–öç26öç7VÇFçBÂ%FWfVÆ÷W"Âv÷&¶fÆ÷rWFöÖF–öâVæv–æVW"Â'W6–æW72&ö6W72WFöÖF–öâ7V6–Æ—7BÂ–çFVw&F–öâFWfVÆ÷W"ÂæBF–v—FÂG&ç6f÷&ÖF–öâ6öç7VÇFçBâ"ÀÐ¢–çFVw&F–öå7FGW3¢&6öÖ–ær×6ööâ"ÀÐ¢f–ÇFW'3¢²$Æö6F–öâ"Â%&VÖ÷FR"Â$ÆWfVÂ"Â%6Æ'’"Â$6ö×ç’%ÒÀÐ¢6×ÆTF—66Æ–ÖW# Ð¢$Æ—fRf6æ7’FF—2æ÷B6öææV7FVB–âF†—2v÷&·76R–WBâW6RF†R&öÆRF—FÆW2æBWf–FVæ6Rg&ÖWv÷&²Fò&W&RF&vWFVB6V&6†W2v—F†÷WB–çfVçF–ærÖ&¶WB6Æ–×2â"ÀÐ¢ÒÀÐ¢÷'FföÆ–õF6·3¢°Ð¢°Ð¢–C¢&WFöÖF–öâ×÷'FföÆ–òÖ66R×7GVG’Ó"ÀÐ¢F—FÆS¢%V&Æ—6‚â–çFVÆÆ–vVçBv÷&¶fÆ÷r66R7GVG’"ÀÐ¢FW67&—F–öã Ð¢%6†÷r&ö6W72F—66÷fW'’Â&6†—FV7GW&RÂ’&÷VæF&–W2ÂfÆ–FF–öâÂW†6WF–öâ†æFÆ–ærÂÖöæ—F÷&–ærÂæBÖV7W&&ÆRfÇVRâ"ÀÐ¢G—S¢'÷'FföÆ–ò"ÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâ×÷'FföÆ–òÖ66R×7GVG’Ó""ÀÐ¢F—FÆS¢%V&Æ—6‚âVçFW'&—6R–çFVw&F–öâ66R7GVG’"ÀÐ¢FW67&—F–öã Ð¢$W‡Æ–âWF†VçF–6F–öâÂFF6öçG&7G2Â&FRÆ–Ö—G2Â&WG&–W2Â–FV×÷FVæ7’Â&V6öæ6–Æ–F–öâÂæB÷W&F–öæÂ÷væW'6†—â"ÀÐ¢G—S¢'÷'FföÆ–ò"ÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâ×÷'FföÆ–òÖ66R×7GVG’Ó2"ÀÐ¢F—FÆS¢%V&Æ—6‚&öGV7F–öâv÷fW&ææ6R66R7GVG’"ÀÐ¢FW67&—F–öã Ð¢$FVÖöç7G&FRFW7G2ÂÖöæ—F÷&–ærÂ6V7W&—G’6öçG&öÇ2ÂÆW'G2Â'Væ&öö·2Â–æ6–FVçB&V6÷fW'’ÂæB6öçF–çV÷W2–×&÷fVÖVçBâ"ÀÐ¢G—S¢'÷'FföÆ–ò"ÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâ×÷'FföÆ–òÖFVÖò"ÀÐ¢F—FÆS¢%&V6÷&B6öæ6—6R67FöæRFVÖò"ÀÐ¢FW67&—F–öã Ð¢%6†÷rF†R'W6–æW72&ö&ÆVÒÂv÷&¶fÆ÷rÂ’&V†f–÷"Â6öçG&öÇ2ÂÖöæ—F÷&–ærÂæB÷WF6öÖR–âf—fRÖ–çWFW2÷"ÆW72â"ÀÐ¢G—S¢'÷'FföÆ–ò"ÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâ×÷'FföÆ–òÖ&6†—FV7GW&R"ÀÐ¢F—FÆS¢$7&VFR&WW6&ÆR&6†—FV7GW&R÷'FföÆ–ò"ÀÐ¢FW67&—F–öã Ð¢$–æ6ÇVFR&ö6W72Ö2Â7—7FVÒ6öçFW‡BÂFFfÆ÷rÂ6WVVæ6RÂ6V7W&—G’&÷VæF&–W2ÂæB÷W&F–öæÂ÷væW'6†—F–w&×2â"ÀÐ¢G—S¢'÷'FföÆ–ò"ÀÐ¢ÒÀÐ¢ÒÀÐ¢¦ö%6V&6…F6·3¢°Ð¢°Ð¢–C¢&WFöÖF–öâÖ¦ö"×F6²×&öÆRÖÖG&—‚"ÀÐ¢F—FÆS¢$7&VFRF&vWB&öÆRÖG&—‚"ÀÐ¢FW67&—F–öã Ð¢$6ö×&R&öÆRF—FÆW2Â&WV—&VB7F6·2Â–æGW7G&–W2Â6Væ–÷&—G’ÂÆö6F–öâÂ6Æ'’W‡V7FF–öç2ÂæB÷'FföÆ–òv2â"ÀÐ¢G—S¢&¦ö"×6V&6‚"ÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâÖ¦ö"×F6²Ö6ö×ç’ÖÆ—7B"ÀÐ¢F—FÆS¢$'V–ÆBF&vWB6ö×ç’Æ—7B"ÀÐ¢FW67&—F–öã Ð¢%&–÷&—F—¦RV×Æ÷–W'2v—F‚f—6–&ÆRWFöÖF–öâÂ÷vW"ÆFf÷&ÒÂ’G&ç6f÷&ÖF–öâÂ÷W&F–öç2FV6†æöÆöw’Â÷"6öç7VÇF–ær&7F–6W2â"ÀÐ¢G—S¢&¦ö"×6V&6‚"ÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâÖ¦ö"×F6²ÖÆ–6F–öâ×7—7FVÒ"ÀÐ¢F—FÆS¢%'VâvVV¶Ç’Æ–6F–öâ7—7FVÒ"ÀÐ¢FW67&—F–öã Ð¢%G&6²Æ–6F–öç2ÂWf–FVæ6RW6VBÂ&VfW'&Ç2ÂföÆÆ÷r×W2Â–çFW'f–Ww2ÂfVVF&6²ÂæB&V7W'&–ær6¶–ÆÂ&WV—&VÖVçG2â"ÀÐ¢G—S¢&¦ö"×6V&6‚"ÀÐ¢ÒÀÐ¢°Ð¢–C¢&WFöÖF–öâÖ¦ö"×F6²×F–Æ÷&–ær"ÀÐ¢F—FÆS¢%F–Æ÷"Wf–FVæ6RFòV6‚&öÆR"ÀÐ¢FW67&—F–öã Ð¢%6VÆV7BF†RÖ÷7B&VÆWfçB66R7GVF–W2æB¶W—v÷&G2v—F†÷WBW†vvW&F–ær66÷RÂ&öGV7F–öâW6vRÂ÷"÷væW'6†—â"ÀÐ¢G—S¢&¦ö"×6V&6‚"ÀÐ¢ÒÀÐ¢ÒÀÐ¢–çFW'f–Wu&W¢°Ð¢F—FÆS¢$’WFöÖF–öâ7V6–Æ—7B–çFW'f–Wr&W&F–öâ"ÀÐ¢&7F–6T&V3¢°Ð¢%&ö6W72F—66÷fW'’"ÀÐ¢%v÷&¶fÆ÷r&6†—FV7GW&R"ÀÐ¢%÷vW"WFöÖFR"ÀÐ¢$6÷–Æ÷B7GVF–ò"ÀÐ¢&ã†â"ÀÐ¢%V•F‚"ÀÐ¢$—2æBWF†VçF–6F–öâ"ÀÐ¢%7G'V7GW&VB’÷WGWG2"ÀÐ¢$vVçG2æBFööÂW6R"ÀÐ¢$‡VÖâ–âF†RÆö÷"ÀÐ¢$W'&÷"†æFÆ–ær"ÀÐ¢$Ööæ—F÷&–æræBv÷fW&ææ6R"ÀÐ¢%6V7W&—G’æB&—f7’"ÀÐ¢%$ô’æB'W6–æW72fÇVR"ÀÐ¢%7F¶V†öÆFW"6öÖ×Væ–6F–öâ"ÀÐ¢ÒÀÐ¢VW7F–öç3¢°Ð¢$†÷rv÷VÆB–÷RFV6–FRv†WF†W"&ö6W726†÷VÆBW6R'VÆW2Â’Â%Ââ’–çFVw&F–öâÂ÷"6öÖ&–æF–öãò"ÀÐ¢$FW6–vââ–çfö–6R×&ö6W76–ærv÷&¶fÆ÷rv—F‚W‡G&7F–öâÂfÆ–FF–öâÂ&÷fÇ2Â7—7FVÒWFFW2ÂæBW†6WF–öâ†æFÆ–ærâ"ÀÐ¢$†÷rv÷VÆB–÷R&WfVçBGWÆ–6FR7F–öç2v†Vâv÷&¶fÆ÷r&WG&–W2gFW"'F–Âf–ÇW&Sò"ÀÐ¢%v†Vâ6†÷VÆBâ’ÖvVæW&FVB&W7VÇB&R6VçBFò‡VÖâ&Wf–WvW#ò"ÀÐ¢$†÷rv÷VÆB–÷R6V7W&RâvVçBF†B6â66W72'W6–æW72FFæBW&f÷&Ò7F–öç3ò"ÀÐ¢$W‡Æ–â†÷r–÷Rv÷VÆBÖöæ—F÷"v÷&¶fÆ÷r&VÆ–&–Æ—G’æB–FVçF–g’&V7W'&–ærf–ÇW&RGFW&ç2â"ÀÐ¢$†÷rv÷VÆB–÷R6Æ7VÆFRF†RfÇVRöbâWFöÖF–öâgFW"FWÆ÷–ÖVçCò"ÀÐ¢$FW67&–&R6—GVF–öâv†W&R–÷R6†÷VÆBæ÷BWFöÖFRF†R&ö6W7227W'&VçFÇ’FW6–væVBâ"ÀÐ¢$†÷rv÷VÆB–÷RÖ–w&FRâWFöÖF–öâ&WGvVVâFWfVÆ÷ÖVçBÂFW7BÂæB&öGV7F–öâVçf—&öæÖVçG3ò"ÀÐ¢%vÆ²F‡&÷Vv‚öæRöb–÷W"&ö¦V7G2g&öÒ'W6–æW72&ö&ÆVÒFò&6†—FV7GW&RÂ6öçG&öÇ2Â&W7VÇG2ÂæBÆW76öç2ÆV&æVBâ"ÀÐ¢$†÷rv÷VÆB–÷R&W7öæBv†Vâ7F¶V†öÆFW"&WVW7G2âWFöæöÖ÷W2vVçBv—F‚W†6W76—fRW&Ö—76–öç3ò"ÀÐ¢%v†BFö7VÖVçFF–öâ—2&WV—&VB6òæ÷F†W"FVÒ6â÷W&FRæBÖ–çF–â–÷W"6öÇWF–öãò"ÀÐ¢ÒÀÐ¢ÒÀÐ§Ó°Ð Ð¦W‡÷'B6öç7B”WFöÖF–öå7V6–Æ—7D6&VW"ÒÇ”6&VW$76W76ÖVçEöÆ–7’€Ð¢”WFöÖF–öå7V6–Æ—7D6&VW$&6PÐ¢“°Ð 