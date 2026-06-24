import {
  CareerPosition,
  RoadmapPhase,
  PricingPlan,
  CareerAnalyzerContent,
} from "@/types/career";

const baseCountries = [
  { rank: 1, country: "🇳🇱 Netherlands", salary: "€70–100K", vacancies: "High", visa: "Good", english: "Excellent", remote: "Lots", potential: "Very High", note: "Strong English-first hiring and healthy startup scene." },
  { rank: 2, country: "🇮🇪 Ireland", salary: "€90–130K", vacancies: "Very High", visa: "Good", english: "Native", remote: "Lots", potential: "Very High", note: "European HQ market with dense SaaS and AI hiring." },
  { rank: 3, country: "🇩🇪 Germany", salary: "€65–95K", vacancies: "Very High", visa: "Excellent", english: "Medium", remote: "Lots", potential: "High", note: "Biggest EU market and strong demand for technical operators." },
  { rank: 4, country: "🇬🇧 UK", salary: "€72–110K", vacancies: "Very High", visa: "Medium", english: "Native", remote: "Lots", potential: "High", note: "London remains one of the strongest AI hiring hubs." },
  { rank: 5, country: "🇦🇪 UAE", salary: "$80–130K", vacancies: "High", visa: "Easy", english: "Good", remote: "Lots", potential: "High", note: "Tax-friendly market with fast-moving digital transformation." },
];

const certificationSet = [
  { name: "Azure AI Fundamentals (AI-900)", value: "High", cost: "$165", difficulty: "Easy", roi: "Very High", recommendation: "✅ Strong starter credential" },
  { name: "Make.com Certification", value: "High", cost: "Free", difficulty: "Easy", roi: "High", recommendation: "✅ Great for practical proof" },
  { name: "n8n Certification / Official Learning", value: "High", cost: "Free", difficulty: "Easy", roi: "High", recommendation: "✅ Useful for workflow-focused roles" },
  { name: "DeepLearning.AI Short Courses", value: "Medium", cost: "Free–$50", difficulty: "Medium", roi: "High", recommendation: "✅ Good knowledge booster" },
  { name: "AWS AI Practitioner", value: "Medium", cost: "$150", difficulty: "Medium", roi: "Medium", recommendation: "⚠️ Optional depending on stack" },
];

function createAnalyzerContent(config: {
  title: string;
  summary: string;
  marketInsightTitle: string;
  marketInsightBody: string;
  marketStats: CareerAnalyzerContent["marketStats"];
  topJobTitles: CareerAnalyzerContent["topJobTitles"];
  topHiringCompanies: CareerAnalyzerContent["topHiringCompanies"];
  skills: CareerAnalyzerContent["skills"];
  roadmapPhases: CareerAnalyzerContent["roadmapPhases"];
  portfolioProjects: CareerAnalyzerContent["portfolioProjects"];
  gaps: CareerAnalyzerContent["gaps"];
  learningSteps: CareerAnalyzerContent["learningSteps"];
  strategyStages: CareerAnalyzerContent["strategyStages"];
  cvIntro: string;
}): CareerAnalyzerContent {
  return {
    heroLabel: config.title,
    heroDescription: config.summary,
    roleSummary: config.summary,
    marketInsightTitle: config.marketInsightTitle,
    marketInsightBody: config.marketInsightBody,
    marketStats: config.marketStats,
    topJobTitles: config.topJobTitles,
    topHiringCompanies: config.topHiringCompanies,
    skills: config.skills,
    roadmapPhases: config.roadmapPhases,
    certifications: certificationSet,
    portfolioProjects: config.portfolioProjects,
    countries: baseCountries,
    gaps: config.gaps,
    learningSteps: config.learningSteps,
    strategyStages: config.strategyStages,
    salaryStrategyResearch: [
      "Benchmark salaries in your target country and role family before applying.",
      "Collect 5 relevant job descriptions and note the repeated tools and business outcomes.",
      "Translate your projects into time saved, cost reduced, or revenue created.",
      "Prepare a realistic target range rather than a single number."
    ],
    salaryStrategyNegotiation: [
      "Ask for the employer's range before naming your number.",
      "Anchor with evidence from portfolio work, tools used, and market comps.",
      "Negotiate total package: salary, remote flexibility, learning budget, and title.",
      "Use a role title aligned with higher-value work when your scope supports it."
    ],
    cvIntro: config.cvIntro,
  };
}

const automationContent = createAnalyzerContent({
  title: "AI Automation Specialist",
  summary: "Build workflow systems with AI tools, APIs, no-code platforms, and process design skills.",
  marketInsightTitle: "AI automation roles reward execution, not just theory.",
  marketInsightBody: "Companies increasingly hire people who can connect tools, deploy workflows, and prove measurable efficiency gains across marketing, support, ops, and internal processes.",
  marketStats: [
    { value: "+340%", label: "AI integration growth", colorClass: "text-emerald-600" },
    { value: "$107–136K", label: "Automation engineer salary", colorClass: "text-indigo-600" },
    { value: "12,000+", label: "Open roles globally", colorClass: "text-purple-600" },
    { value: "68%", label: "Remote-friendly roles", colorClass: "text-amber-600" },
  ],
  topJobTitles: [
    { title: "AI Automation Engineer", salary: "$107–136K", demand: "Very High" },
    { title: "Workflow Automation Specialist", salary: "$85–110K", demand: "High" },
    { title: "AI Integration Specialist", salary: "$85–115K", demand: "High" },
    { title: "Automation Consultant", salary: "$80–120K", demand: "Medium" },
  ],
  topHiringCompanies: [
    { name: "Accenture / Deloitte / PwC", type: "Consulting", count: "200+ roles" },
    { name: "Microsoft / Google / AWS", type: "Big Tech", count: "100+ roles" },
    { name: "HubSpot / Salesforce", type: "CRM / SaaS", count: "50+ roles" },
    { name: "AI-native startups", type: "Startup", count: "500+ roles" },
  ],
  skills: [
    { category: "Technical", name: "REST APIs & Webhooks", demand: 10, frequencyLabel: "95%", difficulty: 3, hireImpact: 10 },
    { category: "Technical", name: "Python", demand: 9, frequencyLabel: "80%", difficulty: 5, hireImpact: 9 },
    { category: "AI", name: "Prompt Engineering", demand: 10, frequencyLabel: "90%", difficulty: 2, hireImpact: 10 },
    { category: "AI", name: "LLM APIs", demand: 10, frequencyLabel: "92%", difficulty: 3, hireImpact: 10 },
    { category: "Automation", name: "n8n", demand: 10, frequencyLabel: "88%", difficulty: 3, hireImpact: 10 },
    { category: "Automation", name: "Make.com", demand: 9, frequencyLabel: "82%", difficulty: 2, hireImpact: 9 },
    { category: "Business", name: "Process Mapping", demand: 8, frequencyLabel: "70%", difficulty: 2, hireImpact: 8 },
    { category: "Business", name: "Technical Documentation", demand: 9, frequencyLabel: "85%", difficulty: 2, hireImpact: 9 },
  ],
  roadmapPhases: [
    { phase: 1, title: "Technical Foundations", hours: 40, color: "#4f46e5", topics: ["Python basics", "REST APIs", "Git", "SQL basics"], freeResources: ["freeCodeCamp Python", "Automate the Boring Stuff"], paidResources: ["Python Bootcamp"], exercise: "Build a script that moves API data into a spreadsheet." },
    { phase: 2, title: "Automation Platforms", hours: 60, color: "#7c3aed", topics: ["n8n", "Make.com", "Zapier basics", "Power Automate"], freeResources: ["Make Academy", "n8n docs"], paidResources: ["n8n course"], exercise: "Build 3 business workflows end to end." },
    { phase: 3, title: "AI Workflows", hours: 60, color: "#059669", topics: ["Prompt design", "LLM APIs", "RAG basics", "AI agents"], freeResources: ["DeepLearning.AI courses", "Anthropic docs"], paidResources: ["LangChain bootcamp"], exercise: "Create a document-answering AI workflow." },
    { phase: 4, title: "Portfolio & Job Readiness", hours: 70, color: "#d97706", topics: ["Case studies", "Loom demos", "LinkedIn optimisation", "Interview prep"], freeResources: ["GitHub", "LinkedIn Learning"], paidResources: ["Mentorship"], exercise: "Ship 5 portfolio automations with measurable ROI." },
  ],
  portfolioProjects: [
    { rank: 1, name: "AI customer support bot", difficulty: "Medium", techStack: "n8n, Claude API, webhook", timeEstimate: "~20h", hiringScore: 10 },
    { rank: 2, name: "Invoice extraction workflow", difficulty: "Medium", techStack: "n8n, vision AI, Sheets", timeEstimate: "~16h", hiringScore: 10 },
    { rank: 3, name: "Lead qualification automation", difficulty: "Medium", techStack: "Make.com, CRM, OpenAI", timeEstimate: "~24h", hiringScore: 9 },
    { rank: 4, name: "Knowledge base RAG assistant", difficulty: "Medium-High", techStack: "Python, LangChain, vector DB", timeEstimate: "~40h", hiringScore: 9 },
  ],
  gaps: [
    { skill: "n8n", urgency: "Critical" },
    { skill: "Make.com", urgency: "Critical" },
    { skill: "Prompt Engineering", urgency: "Critical" },
    { skill: "LLM APIs", urgency: "High" },
    { skill: "Python", urgency: "High" },
    { skill: "RAG Pipelines", urgency: "Medium" },
  ],
  learningSteps: [
    { step: "1", text: "Build 3 no-code automations in n8n.", time: "~16h" },
    { step: "2", text: "Complete Make Academy foundation modules.", time: "~20h" },
    { step: "3", text: "Learn prompt engineering and LLM API basics.", time: "~12h" },
    { step: "4", text: "Create 2 AI-enhanced workflows with clear business outcomes.", time: "~20h" },
  ],
  strategyStages: [
    { title: "Month 1–2: Foundations", tone: "blue", items: ["Learn automation tools", "Understand APIs and prompts", "Build first workflows"] },
    { title: "Month 3–4: Build", tone: "purple", items: ["Ship portfolio automations", "Document ROI", "Add AI-enhanced workflows"] },
    { title: "Month 5–6: Launch", tone: "green", items: ["Optimise CV + LinkedIn", "Apply weekly", "Use project metrics in interviews"] },
  ],
  cvIntro: "Paste your CV and compare it against AI automation hiring expectations, workflow tools, and business execution skills.",
});

const lightweightRole = (title: string, summary: string, skillFocus: string[], projectName: string): CareerAnalyzerContent =>
  createAnalyzerContent({
    title,
    summary,
    marketInsightTitle: `${title} roles are growing where companies need focused AI execution.`,
    marketInsightBody: `The strongest candidates combine practical tool fluency, clear communication, and 2–4 portfolio examples that match the exact workflow scope of the role.`,
    marketStats: [
      { value: "+180%", label: "Role demand growth", colorClass: "text-emerald-600" },
      { value: "$80–120K", label: "Typical salary band", colorClass: "text-indigo-600" },
      { value: "Mid–High", label: "Portfolio importance", colorClass: "text-purple-600" },
      { value: "Remote", label: "Strong global access", colorClass: "text-amber-600" },
    ],
    topJobTitles: [
      { title, salary: "$80–120K", demand: "High" },
      { title: `Junior ${title}`, salary: "$55–80K", demand: "High" },
      { title: `${title} Consultant`, salary: "$85–125K", demand: "Medium" },
    ],
    topHiringCompanies: [
      { name: "B2B SaaS companies", type: "SaaS", count: "Growing" },
      { name: "Agencies and consultancies", type: "Services", count: "Active" },
      { name: "AI product teams", type: "AI-native", count: "Growing" },
    ],
    skills: [
      { category: "AI", name: skillFocus[0] || "Prompt design", demand: 9, frequencyLabel: "80%", difficulty: 3, hireImpact: 9 },
      { category: "AI", name: skillFocus[1] || "LLM workflow thinking", demand: 8, frequencyLabel: "72%", difficulty: 4, hireImpact: 8 },
      { category: "Technical", name: "Tool fluency", demand: 8, frequencyLabel: "75%", difficulty: 3, hireImpact: 8 },
      { category: "Business", name: "Documentation", demand: 7, frequencyLabel: "65%", difficulty: 2, hireImpact: 7 },
      { category: "Business", name: "Stakeholder communication", demand: 8, frequencyLabel: "70%", difficulty: 2, hireImpact: 8 },
    ],
    roadmapPhases: [
      { phase: 1, title: "Foundations", hours: 30, color: "#4f46e5", topics: ["Role basics", "Core tools", "Prompt usage"], freeResources: ["Docs", "YouTube walkthroughs"], paidResources: ["Starter course"], exercise: `Create your first ${title.toLowerCase()} workflow.` },
      { phase: 2, title: "Hands-on Build", hours: 40, color: "#7c3aed", topics: ["Project planning", "Tool chaining", "Testing"], freeResources: ["Templates", "Community examples"], paidResources: ["Intermediate course"], exercise: `Ship a small ${projectName} project.` },
      { phase: 3, title: "Portfolio & Positioning", hours: 30, color: "#059669", topics: ["Case study writing", "LinkedIn positioning", "CV alignment"], freeResources: ["Portfolio templates"], paidResources: ["Mentoring"], exercise: "Publish 2 role-specific case studies." },
    ],
    portfolioProjects: [
      { rank: 1, name: projectName, difficulty: "Medium", techStack: skillFocus.join(", "), timeEstimate: "~12–20h", hiringScore: 9 },
      { rank: 2, name: `Role-specific mini audit for ${title}`, difficulty: "Easy", techStack: "Docs, templates", timeEstimate: "~6h", hiringScore: 7 },
    ],
    gaps: [
      { skill: skillFocus[0] || "Prompt design", urgency: "Critical" },
      { skill: skillFocus[1] || "Portfolio proof", urgency: "High" },
      { skill: "Case-study storytelling", urgency: "Medium" },
    ],
    learningSteps: [
      { step: "1", text: `Learn the core tools used in ${title.toLowerCase()} roles.`, time: "~10h" },
      { step: "2", text: "Build one portfolio-ready workflow or deliverable.", time: "~12h" },
      { step: "3", text: "Document outcomes and align your CV to the role.", time: "~6h" },
    ],
    strategyStages: [
      { title: "Foundation", tone: "blue", items: ["Learn the role", "Study tool stack", "Build one starter project"] },
      { title: "Proof", tone: "purple", items: ["Create 2 case studies", "Show business value", "Refine positioning"] },
      { title: "Launch", tone: "green", items: ["Target matching roles", "Customise CV", "Apply with proof of work"] },
    ],
    cvIntro: `Paste your CV to evaluate how well it aligns with ${title.toLowerCase()} expectations and what to improve next.`,
  });

export const careerPositions: CareerPosition[] = [
  {
    id: "ai-automation-specialist",
    title: "AI Automation Specialist",
    description: "Build automated workflows using AI tools, APIs, no-code platforms, and business process logic.",
    level: "Beginner to Intermediate",
    duration: "12 weeks",
    category: "Automation",
    keySkills: ["Workflow automation", "API basics", "AI tools", "Process design"],
    status: "available",
    analyzerContent: automationContent,
  },
  {
    id: "ai-workflow-builder",
    title: "AI Workflow Builder",
    description: "Design and connect AI-powered workflows for teams, creators, and businesses.",
    level: "Beginner",
    duration: "10 weeks",
    category: "Automation",
    keySkills: ["Workflow design", "AI tools", "Team collaboration", "Process mapping"],
    status: "coming-soon",
    analyzerContent: lightweightRole("AI Workflow Builder", "Connect tools and AI steps into dependable workflow systems for real teams.", ["Workflow design", "AI tools"], "Workflow orchestration case study"),
  },
  {
    id: "no-code-ai-automation-specialist",
    title: "No-Code AI Automation Specialist",
    description: "Create business automations using tools like Make, Zapier, Airtable, Notion, and AI assistants.",
    level: "Beginner",
    duration: "8 weeks",
    category: "No-Code",
    keySkills: ["Make", "Zapier", "Airtable", "Notion", "AI assistants"],
    status: "coming-soon",
    analyzerContent: lightweightRole("No-Code AI Automation Specialist", "Build useful AI workflows fast without deep engineering prerequisites.", ["Make", "Zapier"], "No-code lead routing automation"),
  },
  {
    id: "ai-marketing-automation-specialist",
    title: "AI Marketing Automation Specialist",
    description: "Use AI to automate content, campaigns, lead generation, email flows, and marketing operations.",
    level: "Beginner to Intermediate",
    duration: "10 weeks",
    category: "Marketing",
    keySkills: ["Email automation", "Lead generation", "AI content", "Campaign management"],
    status: "coming-soon",
    analyzerContent: lightweightRole("AI Marketing Automation Specialist", "Use AI and automations to improve lead generation, campaigns, and lifecycle communication.", ["Campaign automation", "AI content systems"], "AI campaign operations dashboard"),
  },
  {
    id: "ai-productivity-consultant",
    title: "AI Productivity Consultant",
    description: "Help individuals and teams improve productivity using AI tools, workflows, and personal operating systems.",
    level: "Beginner",
    duration: "8 weeks",
    category: "Productivity",
    keySkills: ["AI tools", "Workflow design", "Consulting", "Personal OS"],
    status: "coming-soon",
    analyzerContent: lightweightRole("AI Productivity Consultant", "Help people and teams reduce busywork with practical AI workflows and operating systems.", ["Consulting", "Workflow design"], "Team productivity audit + AI system"),
  },
  {
    id: "ai-operations-assistant",
    title: "AI Operations Assistant",
    description: "Support business operations with AI tools, dashboards, process automation, and reporting systems.",
    level: "Beginner to Intermediate",
    duration: "12 weeks",
    category: "Operations",
    keySkills: ["Dashboards", "Process automation", "Reporting", "AI tools"],
    status: "coming-soon",
    analyzerContent: lightweightRole("AI Operations Assistant", "Use AI workflows and reporting systems to improve recurring operational work.", ["Reporting automation", "Process support"], "Weekly ops reporting workflow"),
  },
  {
    id: "ai-customer-support-automation-specialist",
    title: "AI Customer Support Automation Specialist",
    description: "Build AI-powered support flows, chatbots, knowledge bases, and ticket automation systems.",
    level: "Intermediate",
    duration: "12 weeks",
    category: "Customer Support",
    keySkills: ["Chatbots", "Knowledge bases", "Ticket automation", "Support flows"],
    status: "coming-soon",
    analyzerContent: lightweightRole("AI Customer Support Automation Specialist", "Design faster support systems with AI chat, routing, and knowledge automation.", ["Chatbots", "Knowledge bases"], "AI support triage assistant"),
  },
  {
    id: "ai-content-systems-specialist",
    title: "AI Content Systems Specialist",
    description: "Design AI-assisted content creation systems for social media, blogs, newsletters, and video workflows.",
    level: "Beginner",
    duration: "8 weeks",
    category: "Content",
    keySkills: ["Content systems", "Social media", "AI writing", "Video workflows"],
    status: "coming-soon",
    analyzerContent: lightweightRole("AI Content Systems Specialist", "Build repeatable AI content systems for publishing teams and creators.", ["Content systems", "AI writing"], "Content pipeline automation"),
  },
  {
    id: "junior-ai-agent-builder",
    title: "Junior AI Agent Builder",
    description: "Learn to build simple AI agents that can use tools, follow workflows, and complete structured tasks.",
    level: "Intermediate",
    duration: "14 weeks",
    category: "AI Agents",
    keySkills: ["AI agents", "Tool use", "Workflow logic", "Structured tasks"],
    status: "coming-soon",
    analyzerContent: lightweightRole("Junior AI Agent Builder", "Prototype useful agent workflows that can reason, use tools, and complete repeatable tasks.", ["AI agents", "Tool use"], "Agent-based research workflow"),
  },
  {
    id: "ai-business-process-analyst",
    title: "AI Business Process Analyst",
    description: "Analyze business processes and identify where AI and automation can reduce manual work.",
    level: "Beginner to Intermediate",
    duration: "10 weeks",
    category: "Business Analysis",
    keySkills: ["Process analysis", "AI strategy", "Automation mapping", "Reporting"],
    status: "coming-soon",
    analyzerContent: lightweightRole("AI Business Process Analyst", "Map processes, identify inefficiencies, and define where AI creates real leverage.", ["Process analysis", "Automation mapping"], "AI process opportunity assessment"),
  },
];

export const aiAutomationRoadmapPreview: RoadmapPhase[] = [
  {
    phaseNumber: 1,
    title: "AI Foundations",
    explanation: "Understand what AI is, how modern AI tools work, and how they fit into real business workflows. No prior experience needed.",
    access: "free",
  },
  {
    phaseNumber: 2,
    title: "Automation Tools",
    explanation: "Get hands-on with the most important automation platforms: Make, Zapier, n8n, and AI-native tools that connect your stack.",
    access: "locked",
  },
  {
    phaseNumber: 3,
    title: "Workflow Design",
    explanation: "Learn how to map, design, and document automated workflows that solve real business problems end-to-end.",
    access: "locked",
  },
  {
    phaseNumber: 4,
    title: "API & Integration Basics",
    explanation: "Understand APIs, webhooks, and how to connect external services to build powerful multi-step automations.",
    access: "locked",
  },
  {
    phaseNumber: 5,
    title: "Portfolio Projects",
    explanation: "Build 3 real-world automation projects you can showcase to clients or employers to prove your skills.",
    access: "locked",
  },
];

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
