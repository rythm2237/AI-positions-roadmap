import {
  CareerPosition,
  RoadmapPhase,
  PricingPlan,
} from "@/types/career";

// ─── Career Positions ──────────────────────────────────────────────────────
// Edit this array to add, remove, or update career cards on the landing page.

export const careerPositions: CareerPosition[] = [
  {
    id: "ai-automation-specialist",
    title: "AI Automation Specialist",
    description:
      "Build automated workflows using AI tools, APIs, no-code platforms, and business process logic.",
    level: "Beginner to Intermediate",
    duration: "12 weeks",
    category: "Automation",
    keySkills: ["Workflow automation", "API basics", "AI tools", "Process design"],
    status: "mvp-ready",
  },
  {
    id: "prompt-engineer",
    title: "Prompt Engineer",
    description:
      "Design, evaluate, and manage reliable prompts for language-model applications.",
    level: "Beginner to Intermediate",
    duration: "12 weeks",
    category: "Prompting",
    keySkills: ["Prompt design", "Evaluation", "Structured output", "Red-teaming"],
    status: "mvp-ready",
  },
  {
    id: "ai-data-analyst",
    title: "AI Data Analyst",
    description:
      "Use statistics, SQL, Python, dashboards, and AI-assisted analysis to turn data into decisions.",
    level: "Beginner to Intermediate",
    duration: "12 weeks",
    category: "Data",
    keySkills: ["SQL", "Python", "Dashboards", "AI analysis"],
    status: "mvp-ready",
  },
  {
    id: "ai-content-creator",
    title: "AI Content Creator",
    description:
      "Create SEO-informed articles, social content, newsletters, and scripts with AI.",
    level: "Beginner",
    duration: "12 weeks",
    category: "Content",
    keySkills: ["AI writing", "SEO", "Social content", "Video scripting"],
    status: "mvp-ready",
  },
  {
    id: "ml-engineer",
    title: "Machine Learning Engineer",
    description:
      "Build, evaluate, deploy, and monitor machine-learning models with Python and MLOps.",
    level: "Intermediate",
    duration: "12 weeks",
    category: "Machine Learning",
    keySkills: ["Python", "scikit-learn", "PyTorch", "MLOps"],
    status: "mvp-ready",
  },
  {
    id: "ai-product-manager",
    title: "AI Product Manager",
    description:
      "Lead AI products from discovery to roadmap, metrics, launch, and responsible operation.",
    level: "Beginner to Intermediate",
    duration: "12 weeks",
    category: "Product",
    keySkills: ["AI strategy", "Roadmaps", "Metrics", "Stakeholders"],
    status: "mvp-ready",
  },
  {
    id: "ai-ux-designer",
    title: "AI UX Designer",
    description:
      "Design AI-assisted experiences that are understandable, controllable, ethical, and useful.",
    level: "Beginner to Intermediate",
    duration: "12 weeks",
    category: "Design",
    keySkills: ["AI UX", "Figma AI", "Trust design", "Research"],
    status: "mvp-ready",
  },
  {
    id: "llm-app-developer",
    title: "LLM Application Developer",
    description:
      "Build retrieval, tool-use, structured-output, and production-ready LLM applications.",
    level: "Intermediate",
    duration: "12 weeks",
    category: "Development",
    keySkills: ["LangChain", "RAG", "Vector DBs", "LLM apps"],
    status: "mvp-ready",
  },
  {
    id: "ai-ethics-specialist",
    title: "AI Ethics & Governance Specialist",
    description:
      "Assess AI systems for risk, bias, policy compliance, transparency, and responsible deployment.",
    level: "Intermediate",
    duration: "12 weeks",
    category: "Governance",
    keySkills: ["AI policy", "Bias audits", "EU AI Act", "Risk reviews"],
    status: "mvp-ready",
  },
  {
    id: "ai-sales-marketing",
    title: "AI Sales & Marketing Specialist",
    description:
      "Use AI to improve CRM workflows, personalization, campaign creation, and sales forecasting.",
    level: "Beginner to Intermediate",
    duration: "12 weeks",
    category: "Sales & Marketing",
    keySkills: ["AI CRM", "Personalization", "Campaigns", "Forecasting"],
    status: "mvp-ready",
  },
];

// ─── AI Automation Specialist — Roadmap Preview ────────────────────────────
// Edit phases here to update the featured roadmap preview section.

export const aiAutomationRoadmapPreview: RoadmapPhase[] = [
  {
    phaseNumber: 1,
    title: "AI Foundations",
    explanation:
      "Understand what AI is, how modern AI tools work, and how they fit into real business workflows. No prior experience needed.",
    access: "free",
  },
  {
    phaseNumber: 2,
    title: "Automation Tools",
    explanation:
      "Get hands-on with the most important automation platforms: Make, Zapier, n8n, and AI-native tools that connect your stack.",
    access: "locked",
  },
  {
    phaseNumber: 3,
    title: "Workflow Design",
    explanation:
      "Learn how to map, design, and document automated workflows that solve real business problems end-to-end.",
    access: "locked",
  },
  {
    phaseNumber: 4,
    title: "API & Integration Basics",
    explanation:
      "Understand APIs, webhooks, and how to connect external services to build powerful multi-step automations.",
    access: "locked",
  },
  {
    phaseNumber: 5,
    title: "Portfolio Projects",
    explanation:
      "Build 3 real-world automation projects you can showcase to clients or employers to prove your skills.",
    access: "locked",
  },
];

// ─── Pricing Plans ─────────────────────────────────────────────────────────
// Edit plan features here. Prices will be added once finalised.

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free Preview",
    pricingLabel: "Free",
    features: [
      "Browse all career roles",
      "Preview roadmap structure",
      "Access Phase 1 of any roadmap",
      "Limited progress tracking",
    ],
    highlighted: false,
    ctaLabel: "Get Started Free",
  },
  {
    id: "single",
    name: "Single Roadmap Access",
    pricingLabel: "Pricing to be announced",
    features: [
      "Unlock one complete roadmap",
      "Full lessons and projects",
      "Quizzes and personal notes",
      "Full progress tracking",
    ],
    highlighted: true,
    ctaLabel: "Join Waitlist",
  },
  {
    id: "all-access",
    name: "All Access",
    pricingLabel: "Pricing to be announced",
    features: [
      "Access all current and future roadmaps",
      "Advanced progress dashboard",
      "AI feedback features (coming soon)",
      "Best for serious learners",
    ],
    highlighted: false,
    ctaLabel: "Join Waitlist",
  },
];
