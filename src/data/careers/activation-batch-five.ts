import { aiProductManagerCareer } from "@/data/careers/ai-product-manager";
import { applyCareerTitleAliasPolicy } from "@/data/careerTitleAliases";
import type { CareerJourneyStage, CareerRoadmapPhase, CareerWorkspaceData } from "@/types/careerWorkspace";

type CareerSpec = {
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  sceneTitle: string;
  sceneDescription: string;
  overview: string;
  responsibilities: string[];
  industries: string[];
  stages: string[];
  roadmap: string[][];
  projects: Array<{ title: string; description: string; skills: string[] }>;
  portfolio: string[];
  jobs: string[];
  interviewAreas: string[];
  interviewQuestions: string[];
  related: string[];
  difficulty: string;
  learningTime: string;
};

function buildCareer(spec: CareerSpec): CareerWorkspaceData {
  const base = aiProductManagerCareer;
  const journeyStages: CareerJourneyStage[] = base.journeyStages.map((stage, index) => {
    const title = spec.stages[index] ?? spec.stages[spec.stages.length - 1];
    return {
      ...stage,
      id: `${spec.slug}-stage-${index + 1}`,
      title,
      label: title,
      landmark: title,
      theme: `Build practical evidence for ${title.toLowerCase()}.`,
      summary: `Develop and demonstrate professional capability in ${title.toLowerCase()}.`,
      explanation: `This stage converts ${title.toLowerCase()} into reviewable decisions, artifacts, measurements, and professional evidence for the ${spec.title} role.`,
      lessons: [
        `${title} foundations`,
        `${title} applied practice`,
        `${title} measurement and governance`,
      ],
      tasks: [1, 2, 3].map((number) => ({
        id: `${spec.slug}-stage-${index + 1}-task-${number}`,
        title: `${title} practical mission ${number}`,
        description: `Create a reviewable artifact that demonstrates ${title.toLowerCase()} in a realistic professional scenario.`,
        type: index >= 8 ? "career" : index === 7 ? "project" : "lesson",
      })),
      topicAssessments: stage.topicAssessments?.map((assessment, assessmentIndex) => ({
        ...assessment,
        id: `${spec.slug}-stage-${index + 1}-topic-${assessmentIndex + 1}`,
        title: `${title} knowledge check`,
        topicLabel: title,
      })),
      phaseExam: stage.phaseExam
        ? {
            ...stage.phaseExam,
            id: `${spec.slug}-stage-${index + 1}-comprehensive`,
            title: `${title} comprehensive assessment`,
            description: `A 20-question scenario assessment covering ${title.toLowerCase()}.`,
          }
        : undefined,
    };
  });

  const roadmap: CareerRoadmapPhase[] = base.roadmap.map((phase, index) => {
    const sections = spec.roadmap[index] ?? spec.roadmap[spec.roadmap.length - 1];
    return {
      ...phase,
      id: `${spec.slug}-roadmap-${index + 1}`,
      phaseNumber: index + 1,
      title: sections[0],
      goal: `Build practical competence across ${sections.join(", ")}.`,
      sections,
      mentorTip: `Keep every decision traceable to evidence, stakeholders, risk, measurable outcomes, and operational ownership.`,
      practicalMissions: [
        `Complete one applied mission for ${sections[1] ?? sections[0]}.`,
        `Produce reviewable evidence covering ${sections.slice(2, 5).join(", ")}.`,
      ],
      expectedOutcome: `You can demonstrate and defend work across ${sections.join(", ")}.`,
      quiz: {
        ...phase.quiz,
        id: `${spec.slug}-roadmap-${index + 1}-quiz`,
        phaseId: `${spec.slug}-roadmap-${index + 1}`,
        title: `${sections[0]} checkpoint`,
      },
      lessons: phase.lessons.map((lesson, lessonIndex) => ({
        ...lesson,
        id: `${spec.slug}-roadmap-${index + 1}-lesson-${lessonIndex + 1}`,
        title: `${sections[lessonIndex % sections.length]} practice`,
        summary: `Apply ${sections[lessonIndex % sections.length]} in a ${spec.title} scenario.`,
        mission: `Create a professional artifact demonstrating ${sections[lessonIndex % sections.length]}.`,
      })),
    };
  });

  const career: CareerWorkspaceData = {
    ...base,
    slug: spec.slug,
    title: spec.title,
    category: spec.category,
    visual: {
      nodeLabel: spec.title,
      sceneTitle: spec.sceneTitle,
      sceneDescription: spec.sceneDescription,
      imageAlt: `${spec.title} professional workspace and career journey.`,
    },
    shortDescription: spec.shortDescription,
    difficulty: spec.difficulty,
    estimatedLearningTime: spec.learningTime,
    salary: "Varies by country, seniority, industry, and scope",
    hiringDemand: "Growing across organizations adopting data, AI, automation, and digital operating models",
    remoteAvailability: "Medium to High depending on stakeholder and delivery requirements",
    aiCompatibilityScore: "94%",
    bestFor: ["Analytical problem solvers", "Cross-functional collaborators", "Evidence-driven professionals", "People building practical AI-era capabilities"],
    programmingRequirement: spec.category === "AI Data & Analytics" ? "Moderate: SQL, Python, notebooks, data tools, and version control" : "Low to Moderate: data literacy, platform fluency, and prototype-level technical work",
    mathRequirement: spec.title === "Data Scientist" ? "High: statistics, probability, experimentation, and machine learning" : spec.title === "Data Analyst" ? "Moderate: descriptive statistics, business metrics, and experimentation" : "Low to Moderate: measurement, prioritization, and business-case analysis",
    creativityLevel: "High",
    communicationLevel: "Very High",
    lastUpdated: "2026-08-01",
    overview: {
      title: `What does a ${spec.title} do?`,
      body: spec.overview,
      responsibilities: spec.responsibilities,
      industries: spec.industries,
    },
    journeyMap: {
      ...base.journeyMap,
      overviewTitle: `${spec.title} Career Journey`,
      overviewDescription: spec.shortDescription,
    },
    journeyStages,
    roadmap,
    projects: spec.projects.map((project, index) => ({
      id: `${spec.slug}-project-${index + 1}`,
      title: project.title,
      difficulty: index >= 2 ? "Advanced" : "Intermediate",
      estimatedTime: index >= 2 ? "50-80 hours" : "25-45 hours",
      phaseId: `${spec.slug}-roadmap-${Math.min(index + 2, 5)}`,
      description: project.description,
      deliverables: ["Problem brief", "Working analysis or prototype", "Decision record", "Measurement plan", "Case study"],
      skills: project.skills,
    })),
    finalChallenge: {
      title: `${spec.title} Professional Readiness Review`,
      description: `Present and defend an end-to-end ${spec.title} engagement before a simulated cross-functional review panel.`,
      requirements: ["Evidence-based problem definition", "Clear methodology and decisions", "Risk and governance controls", "Measurable outcomes", "Operational ownership", "Professional communication"],
      deliverables: ["Executive summary", "Core work product", "Measurement framework", "Risk register", "Implementation or action roadmap", "Portfolio case study"],
      evaluation: ["Problem understanding", "Technical and business judgment", "Evidence quality", "Risk management", "Practicality", "Communication"],
    },
    relatedCareers: spec.related,
    portfolioTasks: spec.portfolio.map((title, index) => ({
      id: `${spec.slug}-portfolio-${index + 1}`,
      title,
      description: `Publish a concise case study with context, method, decisions, evidence, results, limitations, and next steps.`,
      type: "portfolio",
    })),
    jobSearchTasks: spec.jobs.map((title, index) => ({
      id: `${spec.slug}-job-${index + 1}`,
      title,
      description: `Use role-title mapping and evidence matching to target relevant ${spec.title} vacancies.`,
      type: "job-search",
    })),
    interviewPrep: {
      title: `${spec.title} Interview Preparation`,
      practiceAreas: spec.interviewAreas,
      questions: spec.interviewQuestions,
    },
  };

  return applyCareerTitleAliasPolicy(career);
}

export const aiAdoptionConsultantCareer = buildCareer({
  slug: "ai-adoption-consultant",
  title: "AI Adoption Consultant",
  category: "Enterprise AI & Consulting",
  shortDescription: "Help teams adopt AI responsibly by redesigning workflows, building trust and capability, managing change, and measuring realized usage and value.",
  sceneTitle: "AI Adoption and Change Lab",
  sceneDescription: "A transformation environment connecting users, workflows, enablement, governance, communications, champions, support, and value realization.",
  overview: "An AI Adoption Consultant turns available AI capability into sustained, responsible changes in how people work. The role combines discovery, workflow redesign, change management, enablement, governance, communications, support, measurement, and continuous improvement.",
  responsibilities: ["Assess adoption readiness", "Map roles and workflows", "Design human-AI ways of working", "Create enablement and communications", "Build champion networks", "Address resistance and trust", "Measure usage, proficiency, outcomes, and risk", "Improve adoption based on evidence"],
  industries: ["Professional services", "Retail", "Financial services", "Healthcare", "Public sector", "Manufacturing", "Technology", "Education"],
  stages: ["Role Orientation", "Adoption Readiness", "Workflow Redesign", "Stakeholder and Change Strategy", "Enablement and Capability Building", "Responsible Use and Governance", "Pilot and Rollout", "Measurement and Optimization", "Adoption Portfolio", "Job Search and Interviews"],
  roadmap: [["Adoption Foundations", "Readiness", "Stakeholders", "Workflows", "Barriers", "Outcomes"], ["Change and Workflow Design", "Human-AI work", "Change impacts", "Communications", "Champions", "Support"], ["Enablement and Governance", "Training", "Prompt practice", "Policies", "Risk", "Responsible use"], ["Pilot and Rollout", "Pilot design", "Cohorts", "Feedback", "Escalation", "Scale"], ["Measurement and Portfolio", "Adoption metrics", "Proficiency", "Value", "Case studies", "Capstone"], ["Employment Readiness", "Role mapping", "Resume", "Portfolio", "Case interviews", "Applications"]],
  projects: [
    { title: "AI Adoption Readiness Assessment", description: "Assess users, workflows, leadership, governance, capability, trust, and support readiness.", skills: ["Discovery", "Readiness", "Stakeholders", "Research"] },
    { title: "Human-AI Workflow Adoption Plan", description: "Redesign one workflow and define behavior change, training, communications, controls, and support.", skills: ["Workflow redesign", "Change management", "Enablement"] },
    { title: "Responsible AI Adoption Pilot", description: "Design and evaluate a controlled pilot with champions, policies, feedback, and measurable exit criteria.", skills: ["Pilot", "Governance", "Measurement", "Adoption"] },
    { title: "Enterprise AI Adoption Program", description: "Create a multi-wave adoption roadmap with operating model, metrics, risk controls, and value realization.", skills: ["Strategy", "Operating model", "Change", "Value"] },
  ],
  portfolio: ["Publish an adoption-readiness case study", "Publish a workflow-redesign and enablement plan", "Publish an adoption metrics dashboard"],
  jobs: ["Build an AI adoption title matrix", "Match change and workflow evidence to vacancies", "Run a targeted consulting application cycle"],
  interviewAreas: ["Readiness assessment", "Change management", "Workflow redesign", "Enablement", "Governance", "Adoption metrics", "Stakeholder resistance", "Value realization"],
  interviewQuestions: ["How would you assess AI adoption readiness?", "How do you redesign work rather than only train users?", "How would you address resistance and trust?", "What metrics distinguish access from adoption?", "How would you govern responsible use without blocking experimentation?", "Design a Copilot or GenAI adoption pilot.", "How do you build a champion network?", "How would you prove realized value?"],
  related: ["AI Transformation Consultant", "Microsoft Copilot Consultant", "Change Management Consultant", "AI Solutions Consultant"],
  difficulty: "Intermediate to Advanced",
  learningTime: "7-10 months part-time",
});

export const microsoftCopilotConsultantCareer = buildCareer({
  slug: "microsoft-copilot-consultant",
  title: "Microsoft Copilot Consultant",
  category: "AI Automation",
  shortDescription: "Design, deploy, govern, and drive adoption of Microsoft Copilot and Copilot Studio solutions across real business workflows.",
  sceneTitle: "Microsoft Copilot Solution Center",
  sceneDescription: "A Microsoft ecosystem connecting Microsoft 365 Copilot, Copilot Studio, Power Platform, Graph, connectors, agents, security, governance, and adoption.",
  overview: "A Microsoft Copilot Consultant helps organizations select, configure, extend, secure, govern, and adopt Microsoft Copilot capabilities. The role bridges business workflows, Microsoft 365, Copilot Studio, Power Platform, identity, data protection, agents, analytics, and change management.",
  responsibilities: ["Discover Microsoft 365 workflows", "Assess licensing and readiness", "Design Copilot use cases", "Build Copilot Studio agents", "Connect knowledge and tools", "Configure security and governance", "Run pilots and adoption programs", "Measure usage and business outcomes"],
  industries: ["Enterprise services", "Retail", "Finance", "Healthcare", "Manufacturing", "Public sector", "Education", "Consulting"],
  stages: ["Role and Microsoft Ecosystem", "Microsoft 365 Copilot Foundations", "Copilot Studio", "Knowledge and Grounding", "Actions and Power Platform", "Security and Governance", "Testing and Analytics", "Deployment and Adoption", "Copilot Portfolio", "Job Search and Interviews"],
  roadmap: [["Microsoft Ecosystem", "M365 Copilot", "Licensing", "Graph", "Identity", "Readiness"], ["Copilot Studio Foundations", "Topics", "Generative answers", "Knowledge", "Variables", "Testing"], ["Actions and Integration", "Power Automate", "Connectors", "APIs", "Dataverse", "Approvals"], ["Security and Governance", "DLP", "Permissions", "Environments", "ALM", "Responsible AI"], ["Deployment and Adoption", "Pilots", "Analytics", "Training", "Champions", "Value"], ["Employment Readiness", "Certifications", "Portfolio", "Role mapping", "Interviews", "Applications"]],
  projects: [
    { title: "Microsoft 365 Copilot Readiness Assessment", description: "Assess licensing, identity, data access, information hygiene, use cases, governance, and adoption readiness.", skills: ["M365", "Readiness", "Security", "Discovery"] },
    { title: "Copilot Studio Knowledge Agent", description: "Build a grounded agent with approved knowledge, topics, analytics, and fallback behavior.", skills: ["Copilot Studio", "Knowledge", "Testing", "Analytics"] },
    { title: "Copilot Action and Approval Workflow", description: "Connect an agent to Power Automate and business systems with validation and approval controls.", skills: ["Power Automate", "Actions", "Connectors", "Governance"] },
    { title: "Enterprise Copilot Deployment Blueprint", description: "Create a secure deployment, governance, adoption, analytics, and value-realization plan.", skills: ["Architecture", "Governance", "Adoption", "Value"] },
  ],
  portfolio: ["Publish a Copilot readiness assessment", "Publish a Copilot Studio agent case study", "Publish a governance and adoption blueprint"],
  jobs: ["Build a Microsoft Copilot role matrix", "Map Microsoft ecosystem skills to evidence", "Run a targeted partner and enterprise application cycle"],
  interviewAreas: ["Microsoft 365 Copilot", "Copilot Studio", "Power Platform", "Grounding", "Actions", "Security", "Governance", "Adoption"],
  interviewQuestions: ["How do Microsoft 365 Copilot and Copilot Studio differ?", "How would you assess Copilot readiness?", "How do permissions affect grounded answers?", "Design a Copilot Studio agent with an approval action.", "How would you apply DLP and environment strategy?", "How do you test an agent?", "How would you run a pilot?", "How do you measure Copilot value?"],
  related: ["AI Adoption Consultant", "Power Platform Consultant", "AI Automation Specialist", "AI Solutions Consultant"],
  difficulty: "Intermediate",
  learningTime: "6-9 months part-time",
});

export const aiMarketingSpecialistCareer = buildCareer({
  slug: "ai-marketing-specialist",
  title: "AI Marketing Specialist",
  category: "AI Marketing",
  shortDescription: "Use AI responsibly across research, segmentation, content, campaigns, lifecycle operations, experimentation, analytics, and measurable growth.",
  sceneTitle: "AI Marketing Growth Lab",
  sceneDescription: "A marketing system connecting customer insight, content, channels, automation, experimentation, analytics, governance, and growth.",
  overview: "An AI Marketing Specialist applies AI to improve marketing research, planning, content operations, personalization, campaign execution, lifecycle journeys, testing, analytics, and decision speed while preserving brand, privacy, evidence, and human accountability.",
  responsibilities: ["Research audiences and markets", "Design AI-assisted content workflows", "Build campaign and lifecycle automations", "Develop segmentation and personalization", "Run experiments", "Analyze funnel performance", "Protect privacy and brand quality", "Measure incremental business impact"],
  industries: ["E-commerce", "SaaS", "Retail", "Media", "Financial services", "Travel", "Consumer products", "Agencies"],
  stages: ["AI Marketing Orientation", "Audience and Market Intelligence", "Content and Creative Systems", "Campaign Automation", "Lifecycle and Personalization", "Experimentation", "Analytics and Attribution", "Governance and Privacy", "Marketing Portfolio", "Job Search and Interviews"],
  roadmap: [["Marketing Foundations", "Customer journey", "Positioning", "Funnel", "Metrics", "AI use cases"], ["Research and Content", "Audience research", "Competitive intelligence", "Content systems", "Creative testing", "Brand"], ["Automation and Lifecycle", "CRM", "Email", "Lead scoring", "Journeys", "Personalization"], ["Experimentation and Analytics", "A/B testing", "Incrementality", "Attribution", "Dashboards", "Forecasting"], ["Governance and Capstone", "Privacy", "Consent", "Quality", "Campaign capstone", "ROI"], ["Employment Readiness", "Portfolio", "Role mapping", "Resume", "Case interviews", "Applications"]],
  projects: [
    { title: "AI-Assisted Market and Audience Research", description: "Create an evidence-grounded market, competitor, audience, and opportunity analysis.", skills: ["Research", "Segmentation", "Synthesis", "Validation"] },
    { title: "Governed AI Content Campaign", description: "Design a multi-channel content workflow with brand controls, review, testing, and measurement.", skills: ["Content", "Campaigns", "Governance", "Testing"] },
    { title: "AI Lifecycle Marketing Automation", description: "Build a lifecycle journey with segmentation, triggers, personalization, safeguards, and analytics.", skills: ["CRM", "Automation", "Personalization", "Analytics"] },
    { title: "AI Marketing Growth Capstone", description: "Deliver a measurable growth plan spanning research, content, campaigns, experiments, analytics, and ROI.", skills: ["Strategy", "Growth", "Experimentation", "ROI"] },
  ],
  portfolio: ["Publish a market-intelligence case study", "Publish a governed campaign workflow", "Publish an experiment and analytics report"],
  jobs: ["Build an AI marketing title matrix", "Map channel and analytics evidence to vacancies", "Run a targeted growth and marketing application cycle"],
  interviewAreas: ["Audience research", "Content systems", "Campaign automation", "Lifecycle", "Personalization", "Experimentation", "Analytics", "Privacy"],
  interviewQuestions: ["Where should AI be used in marketing?", "How do you validate AI-generated research?", "Design a governed content workflow.", "How would you personalize without violating privacy?", "How do you measure incrementality?", "What is the difference between attribution and causality?", "How would you test creative variants?", "How do you calculate campaign ROI?"],
  related: ["AI Content Strategist", "GEO Specialist", "Marketing Automation Specialist", "Growth Marketing Manager"],
  difficulty: "Intermediate",
  learningTime: "6-9 months part-time",
});

export const dataAnalystCareer = buildCareer({
  slug: "data-analyst",
  title: "Data Analyst",
  category: "AI Data & Analytics",
  shortDescription: "Turn business questions into reliable datasets, analysis, dashboards, experiments, and decision-ready insights.",
  sceneTitle: "Decision Intelligence Studio",
  sceneDescription: "An analytics environment connecting business questions, SQL, data quality, modeling, visualization, statistics, experimentation, and communication.",
  overview: "A Data Analyst translates business questions into trustworthy analysis. The role combines requirements, SQL, spreadsheets, data cleaning, semantic modeling, visualization, descriptive statistics, experimentation, dashboard design, and stakeholder communication.",
  responsibilities: ["Clarify business questions", "Query and clean data", "Validate data quality", "Define metrics", "Build dashboards", "Analyze trends and drivers", "Support experiments", "Communicate recommendations and limitations"],
  industries: ["Retail", "Finance", "Technology", "Healthcare", "Logistics", "Manufacturing", "Marketing", "Public sector"],
  stages: ["Data Analyst Orientation", "Spreadsheet and Data Foundations", "SQL", "Data Cleaning and Quality", "Business Metrics", "Visualization and BI", "Statistics and Experiments", "Advanced Analysis", "Analytics Portfolio", "Job Search and Interviews"],
  roadmap: [["Analytics Foundations", "Business questions", "Spreadsheets", "Data types", "Quality", "Documentation"], ["SQL and Data Preparation", "SQL", "Joins", "Aggregations", "Cleaning", "Validation"], ["Metrics and BI", "KPIs", "Semantic models", "Power BI", "Dashboards", "Storytelling"], ["Statistics and Experiments", "Distributions", "Sampling", "Hypothesis tests", "A/B tests", "Uncertainty"], ["Advanced Analysis and Portfolio", "Cohorts", "Funnels", "Forecasting", "Capstone", "Case studies"], ["Employment Readiness", "SQL interviews", "Case studies", "Resume", "Role mapping", "Applications"]],
  projects: [
    { title: "Business Performance Dashboard", description: "Build a validated KPI model and interactive dashboard with documented definitions.", skills: ["SQL", "Power BI", "Metrics", "Visualization"] },
    { title: "Customer Funnel and Cohort Analysis", description: "Analyze acquisition, activation, retention, conversion, and cohort behavior.", skills: ["SQL", "Funnels", "Cohorts", "Insights"] },
    { title: "Experiment Analysis", description: "Evaluate an A/B test with assumptions, uncertainty, effect size, and recommendation.", skills: ["Statistics", "Experiments", "Python", "Communication"] },
    { title: "Decision Analytics Capstone", description: "Solve a real business problem from question and data audit through analysis, dashboard, and recommendation.", skills: ["Analytics", "BI", "Statistics", "Stakeholders"] },
  ],
  portfolio: ["Publish a SQL and dashboard case study", "Publish a funnel or cohort analysis", "Publish an experiment analysis"],
  jobs: ["Build a Data Analyst role matrix", "Practice SQL and analytics cases", "Run a targeted analyst application cycle"],
  interviewAreas: ["SQL", "Data quality", "Metrics", "Dashboards", "Statistics", "Experiments", "Business cases", "Communication"],
  interviewQuestions: ["How do you validate a metric?", "Explain joins and duplicate rows.", "How would you investigate a KPI decline?", "Design a dashboard for an operations team.", "How do you analyze an A/B test?", "What causes misleading averages?", "How do you handle missing data?", "Present an insight to a non-technical leader."],
  related: ["BI Developer", "Product Analyst", "Business Intelligence Analyst", "Data Scientist"],
  difficulty: "Beginner to Intermediate",
  learningTime: "6-10 months part-time",
});

export const dataScientistCareer = buildCareer({
  slug: "data-scientist",
  title: "Data Scientist",
  category: "AI Data & Analytics",
  shortDescription: "Use statistics, experimentation, machine learning, and causal reasoning to solve business problems and support reliable decisions.",
  sceneTitle: "Data Science Research and Production Lab",
  sceneDescription: "A data science environment connecting problem formulation, statistics, experiments, feature engineering, models, evaluation, deployment, monitoring, and decisions.",
  overview: "A Data Scientist frames decision problems, explores data, designs experiments, builds statistical and machine-learning models, evaluates uncertainty and business impact, communicates findings, and collaborates on deployment and monitoring.",
  responsibilities: ["Frame analytical and prediction problems", "Explore and validate data", "Design experiments", "Build statistical and ML models", "Evaluate performance and uncertainty", "Avoid leakage and bias", "Communicate recommendations", "Support deployment and monitoring"],
  industries: ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing", "Logistics", "Marketing", "Energy"],
  stages: ["Data Science Orientation", "Python and Data Foundations", "Statistics and Probability", "Exploratory Analysis", "Machine Learning", "Experimentation and Causal Inference", "Model Evaluation and Responsible ML", "Deployment and Monitoring", "Data Science Portfolio", "Job Search and Interviews"],
  roadmap: [["Technical Foundations", "Python", "NumPy", "pandas", "SQL", "Git"], ["Statistics and EDA", "Probability", "Distributions", "Inference", "Visualization", "Feature analysis"], ["Machine Learning", "Regression", "Classification", "Trees", "Feature engineering", "Pipelines"], ["Experiments and Causality", "A/B tests", "Power", "Bias", "Causal inference", "Decision analysis"], ["Production and Portfolio", "Evaluation", "Responsible ML", "Deployment", "Monitoring", "Capstone"], ["Employment Readiness", "Coding", "Statistics interviews", "ML cases", "Portfolio", "Applications"]],
  projects: [
    { title: "Predictive Modeling Study", description: "Build and compare baseline and advanced models with rigorous validation and business interpretation.", skills: ["Python", "ML", "Validation", "Features"] },
    { title: "Experiment and Causal Analysis", description: "Design or analyze an experiment and discuss identification, uncertainty, and decision implications.", skills: ["Statistics", "Experiments", "Causality", "Communication"] },
    { title: "Responsible ML Evaluation", description: "Evaluate performance, calibration, subgroup behavior, drift risk, explainability, and governance controls.", skills: ["Evaluation", "Responsible ML", "Bias", "Monitoring"] },
    { title: "End-to-End Data Science Capstone", description: "Deliver a complete project from problem framing and data audit through modeling, evaluation, deployment plan, and business recommendation.", skills: ["Data science", "ML", "Experimentation", "Production"] },
  ],
  portfolio: ["Publish a predictive modeling case study", "Publish an experiment or causal analysis", "Publish a responsible-ML evaluation"],
  jobs: ["Build a Data Scientist role matrix", "Practice statistics, coding, and ML cases", "Run a targeted data-science application cycle"],
  interviewAreas: ["Python", "SQL", "Probability", "Statistics", "Machine learning", "Experiments", "Model evaluation", "Product and business cases"],
  interviewQuestions: ["How do you prevent data leakage?", "Explain bias-variance trade-off.", "How do you choose an evaluation metric?", "Design an experiment with limited traffic.", "What is calibration?", "How do you handle class imbalance?", "How would you monitor a model?", "Explain a model result to an executive."],
  related: ["Machine Learning Engineer", "Data Analyst", "Applied Scientist", "Product Data Scientist"],
  difficulty: "Intermediate to Advanced",
  learningTime: "10-16 months part-time",
});
