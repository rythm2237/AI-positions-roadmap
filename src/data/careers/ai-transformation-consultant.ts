import { aiProductManagerCareer as workspaceLayout } from "@/data/careers/ai-product-manager";
import { applyCareerTitleAliasPolicy } from "@/data/careerTitleAliases";
import type { CareerJourneyStage, CareerRoadmapPhase, CareerWorkspaceData } from "@/types/careerWorkspace";

const slug = "ai-transformation-consultant";

const stageSpecs = [
  ["AI Transformation Orientation and Role Boundaries","Enterprise Transformation Observatory","Understand the profession, adjacent roles, enterprise transformation system, employer expectations, and evidence standards.",["Role boundaries and consulting scope","Enterprise AI transformation landscape","Professional evidence and career planning"],["Build a responsibility matrix.","Map the enterprise transformation system.","Create a vacancy-to-evidence backlog."]],
  ["Executive Discovery, Current State, and North Star","Executive Discovery and Diagnostic Studio","Diagnose strategic intent, stakeholder needs, current-state maturity, constraints, and the desired transformation direction.",["Executive and stakeholder discovery","Current-state maturity assessment","North-star and outcome definition"],["Run a discovery cycle.","Produce a current-state assessment.","Write an executive north-star brief."]],
  ["Opportunity Portfolio and AI Business Cases","AI Opportunity Portfolio Council","Discover, structure, prioritize, and economically justify an enterprise portfolio of AI opportunities.",["Opportunity discovery and use-case framing","Portfolio prioritization","Business cases and benefits ownership"],["Create an opportunity inventory.","Build a prioritization model.","Produce a scenario-based business case."]],
  ["Target Operating Model, Governance, and Foundations","AI Operating Model Design Authority","Design the organization, decision rights, responsible-AI governance, and enabling data and platform capabilities required for scale.",["Target AI operating model","Responsible AI governance","Data and platform readiness"],["Design a target operating model.","Create a governance framework.","Build a capability dependency map."]],
  ["Delivery Model, Roadmap, and Program Governance","Transformation Program Control Room","Translate strategy into an executable delivery lifecycle, sequenced roadmap, and decision-effective transformation program.",["AI delivery lifecycle and stage gates","Transformation roadmap design","Program governance and executive reporting"],["Create a governed delivery playbook.","Build an eighteen-month roadmap.","Design program governance."]],
  ["Change, Adoption, and Workforce Transformation","Workforce and Adoption Enablement Hub","Redesign work, enable adoption, and manage responsible workforce transitions across transformation waves.",["Change-impact assessment","Adoption and enablement strategy","Workforce and capability transformation"],["Complete a change-impact assessment.","Build an adoption strategy.","Create a workforce capability plan."]],
  ["Value Realization, Scale Decisions, and Assurance","Enterprise Value and Assurance Board","Measure outcomes, govern experimentation and scale, and integrate enterprise risk, assurance, and audit.",["Value-realization framework","Experimentation and scale governance","Risk, assurance, and audit integration"],["Build a value scorecard.","Create a scale-decision framework.","Design an integrated assurance plan."]],
  ["Leadership Alignment, Narrative, and Trust","Executive Alignment and Trust Forum","Secure leadership decisions, communicate a credible transformation narrative, and address resistance, ethics, and workforce trust.",["Leadership alignment and decision facilitation","Transformation narrative and communications","Resistance, ethics, and workforce trust"],["Facilitate an executive decision workshop.","Create a communication system.","Build a trust and resistance response plan."]],
  ["Enterprise AI Transformation Capstone","Executive Transformation Review Board","Deliver an integrated enterprise diagnosis, target-state transformation system, roadmap, and executive board defense.",["Enterprise transformation diagnostic","Target-state transformation design","Executive board defense"],["Complete the diagnostic.","Produce the target-state blueprint and roadmap.","Run an executive review."]],
  ["Portfolio, Job Search, and Transformation Interviews","AI Transformation Career Launchpad","Convert consulting work into credible evidence and target transformation roles by responsibility, industry, seniority, and advisory scope.",["Transformation consulting portfolio","Job-market and employer targeting","Case and executive interviews"],["Publish three redacted case studies.","Build a thirty-role target matrix.","Complete case and executive mock interviews."]],
] as const;

const journeyStages: CareerJourneyStage[] = stageSpecs.map((spec, index) => {
  const base = workspaceLayout.journeyStages[index] ?? workspaceLayout.journeyStages[0];
  const order = index + 1;
  return {
    ...base,
    id: `${slug}-stage-${order}`,
    order,
    title: spec[0],
    label: spec[0],
    landmark: spec[1],
    theme: spec[0],
    summary: spec[2],
    explanation: spec[2],
    lessons: [...spec[3]],
    resources: [],
    tasks: spec[4].map((description, taskIndex) => ({
      id: `${slug}-stage-${order}-task-${taskIndex + 1}`,
      title: spec[3][taskIndex],
      description,
      type: order === 9 ? "project" : order === 10 ? "job-search" : "lesson",
    })),
    topicAssessments: [],
    phaseExam: base.phaseExam ? {
      ...base.phaseExam,
      id: `${slug}-stage-${order}-comprehensive-assessment`,
      title: `${spec[0]} comprehensive assessment`,
      description: "A scenario checkpoint covering evidence, enterprise outcomes, trade-offs, governance, adoption, value, risk, and ownership.",
    } : undefined,
  };
});

const roadmapSpecs = [
  ["Transformation Foundations",["Role boundaries","Enterprise diagnosis","North star","Stakeholder alignment"]],
  ["Opportunity and Economics",["Opportunity discovery","Portfolio prioritization","Business cases","Benefits ownership"]],
  ["Enterprise Design",["Operating model","Responsible AI governance","Data and platform foundations","Decision rights"]],
  ["Execution and Adoption",["Delivery lifecycle","Roadmap","Program governance","Change and workforce"]],
  ["Value and Capstone",["Value realization","Scale decisions","Assurance","Executive capstone"]],
  ["Employment Readiness",["Portfolio","Role targeting","Case interviews","Executive communication"]],
] as const;

const roadmap: CareerRoadmapPhase[] = roadmapSpecs.map((spec, index) => {
  const base = workspaceLayout.roadmap[index] ?? workspaceLayout.roadmap[0];
  return {
    ...base,
    id: `${slug}-roadmap-${index + 1}`,
    phaseNumber: index + 1,
    title: spec[0],
    goal: `Build reviewable consulting capability across ${spec[1].join(", ")}.`,
    sections: [...spec[1]],
    mentorTip: "Keep recommendations traceable to evidence, enterprise outcomes, stakeholder decisions, dependencies, risk, adoption, ownership, and measurable value.",
    practicalMissions: [`Produce one executive-ready artifact for ${spec[1][0]}.`,`Facilitate one decision scenario spanning ${spec[1].slice(1).join(", ")}.`],
    expectedOutcome: `You can diagnose, design, sequence, and defend ${spec[0].toLowerCase()}.`,
    lessons: base.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      id: `${slug}-roadmap-${index + 1}-lesson-${lessonIndex + 1}`,
      title: `${spec[1][lessonIndex % spec[1].length]} practice`,
      summary: `Apply ${spec[1][lessonIndex % spec[1].length]} in an enterprise transformation scenario.`,
      resources: [],
      mission: `Create an executive-ready artifact demonstrating ${spec[1][lessonIndex % spec[1].length]}.`,
    })),
    quiz: { ...base.quiz, id: `${slug}-roadmap-${index + 1}-quiz`, phaseId: `${slug}-roadmap-${index + 1}`, title: `${spec[0]} checkpoint` },
  };
});

const career: CareerWorkspaceData = {
  ...workspaceLayout,
  slug,
  title: "AI Transformation Consultant",
  category: "Enterprise AI & Consulting",
  visual: {
    nodeLabel: "AI Transformation Consultant",
    sceneTitle: "Enterprise AI Transformation Command Center",
    sceneDescription: "An executive environment connecting strategy, portfolio, governance, operating model, delivery, adoption, workforce, value, and assurance.",
    imageAlt: "AI Transformation Consultant career journey across enterprise strategy and organizational change.",
  },
  shortDescription: "Guide enterprises from fragmented AI activity to a governed, executable, adopted, and measurable transformation through diagnosis, opportunity portfolios, operating models, roadmaps, workforce change, and value realization.",
  difficulty: "Advanced",
  estimatedLearningTime: "10-15 months part-time",
  salary: "Varies by country, consulting seniority, industry, and transformation scope",
  hiringDemand: "Growing across consulting firms, technology providers, and enterprises scaling AI beyond pilots",
  remoteAvailability: "Moderate to High, with frequent stakeholder workshops and executive engagement",
  aiCompatibilityScore: "96%",
  bestFor: ["Enterprise systems thinkers","Strategic problem solvers","Cross-functional facilitators","People comfortable with executives, ambiguity, and change"],
  programmingRequirement: "Low: technical literacy is essential, but the role focuses on enterprise design, decisions, governance, and change",
  mathRequirement: "Moderate: business cases, scenario analysis, portfolio scoring, metrics, and value realization",
  creativityLevel: "High",
  communicationLevel: "Very High",
  lastUpdated: "2026-08-03",
  metrics: [
    { label: "Primary outcome", value: "Enterprise change", detail: "AI strategy becomes governed operating capability and measurable business value." },
    { label: "Core evidence", value: "Executive-ready artifacts", detail: "Diagnostics, portfolios, operating models, governance, roadmaps, and value systems remain reviewable." },
    { label: "Operating focus", value: "Transformation system", detail: "Strategy, technology, organization, risk, adoption, workforce, and value move together." },
    { label: "Professional standard", value: "Evidence and accountability", detail: "Recommendations expose assumptions, trade-offs, owners, decisions, risks, and outcomes." },
  ],
  overview: {
    title: "What does an AI Transformation Consultant do?",
    body: "An AI Transformation Consultant helps organizations move from isolated AI experiments to coordinated enterprise change. The role diagnoses current state, aligns leaders, prioritizes opportunities, designs operating models and governance, sequences delivery and foundations, plans adoption and workforce change, integrates assurance, and establishes measurable value realization.",
    responsibilities: [
      "Conduct executive discovery and enterprise AI maturity assessments",
      "Define transformation north stars and measurable outcomes",
      "Build and prioritize enterprise AI opportunity portfolios",
      "Create business cases and benefits ownership models",
      "Design target operating models and responsible-AI governance",
      "Align data, platform, architecture, security, and assurance foundations",
      "Build delivery lifecycles, roadmaps, and program governance",
      "Lead adoption, workforce capability, leadership alignment, and value realization",
    ],
    industries: ["Professional services","Financial services","Retail","Manufacturing","Healthcare","Public sector","Technology","Telecommunications"],
  },
  journeyMap: { ...workspaceLayout.journeyMap, overviewTitle: "AI Transformation Consultant Career Journey", overviewDescription: "Progress from enterprise diagnosis to portfolio design, operating models, governance, adoption, value realization, and executive advisory." },
  journeyStages,
  roadmap,
  projects: [
    { id: `${slug}-project-1`, title: "Enterprise AI Current-State Diagnostic", difficulty: "Intermediate", estimatedTime: "30-45 hours", phaseId: `${slug}-roadmap-1`, description: "Assess strategy, portfolio, data, technology, governance, talent, adoption, operating model, and measurement maturity.", deliverables: ["Discovery plan","Stakeholder map","Maturity assessment","Evidence register","Executive findings"], skills: ["Discovery","Maturity assessment","Synthesis","Executive communication"] },
    { id: `${slug}-project-2`, title: "AI Opportunity Portfolio and Business Case", difficulty: "Intermediate", estimatedTime: "35-55 hours", phaseId: `${slug}-roadmap-2`, description: "Create, prioritize, and economically justify a balanced portfolio of enterprise AI opportunities.", deliverables: ["Opportunity inventory","Scoring model","Portfolio recommendation","Business case","Benefits map"], skills: ["Use-case discovery","Portfolio prioritization","Business cases","Benefits realization"] },
    { id: `${slug}-project-3`, title: "AI Operating Model and Governance Design", difficulty: "Advanced", estimatedTime: "45-70 hours", phaseId: `${slug}-roadmap-3`, description: "Design a scalable operating model, responsible-AI governance, decision rights, assurance pathway, and shared foundations.", deliverables: ["Operating-model blueprint","Decision-rights matrix","Governance framework","Risk tiers","Capability roadmap"], skills: ["Operating models","Responsible AI","Governance","Enterprise architecture"] },
    { id: `${slug}-project-4`, title: "Enterprise AI Transformation Capstone", difficulty: "Advanced", estimatedTime: "75-120 hours", phaseId: `${slug}-roadmap-5`, description: "Deliver and defend an integrated diagnosis, target state, portfolio, roadmap, adoption model, value framework, and executive decision package.", deliverables: ["Diagnostic","Target-state blueprint","Portfolio roadmap","Value and adoption plan","Executive board deck"], skills: ["Transformation strategy","Portfolio design","Operating model","Change","Value realization","Executive advisory"] },
  ],
  globalResources: [],
  finalChallenge: {
    title: "Enterprise AI Transformation Board Review",
    description: "Present and defend an enterprise AI transformation recommendation before a simulated executive, technology, risk, finance, workforce, and operations panel.",
    requirements: ["Evidence-based diagnosis","Prioritized opportunity portfolio","Target operating model and governance","Executable roadmap","Adoption and workforce plan","Value and assurance framework"],
    deliverables: ["Executive summary","Diagnostic report","Target-state blueprint","Portfolio and roadmap","Risk and value register","Board presentation"],
    evaluation: ["Strategic judgment","Enterprise coherence","Commercial logic","Governance and responsibility","Executability","Executive communication"],
  },
  relatedCareers: ["AI Solutions Consultant","Business AI Consultant","Enterprise AI Consultant","AI Adoption Consultant","AI Product Manager","Digital Transformation Consultant"],
  portfolioTasks: [
    { id: `${slug}-portfolio-1`, title: "Publish an enterprise AI diagnostic case study", description: "Show discovery, evidence, maturity findings, root causes, risks, and recommendations.", type: "portfolio" },
    { id: `${slug}-portfolio-2`, title: "Publish an AI portfolio and operating-model case study", description: "Show prioritization, business cases, decision rights, governance, foundations, and trade-offs.", type: "portfolio" },
    { id: `${slug}-portfolio-3`, title: "Publish a transformation roadmap and value case study", description: "Show sequencing, adoption, workforce, assurance, metrics, ownership, and executive decisions.", type: "portfolio" },
  ],
  jobSearchTasks: [
    { id: `${slug}-job-1`, title: "Build an AI transformation title matrix", description: "Map AI Transformation, Digital Transformation, AI Strategy, Enterprise AI, and adjacent roles.", type: "job-search" },
    { id: `${slug}-job-2`, title: "Match vacancies to consulting evidence", description: "Map each role to diagnosis, portfolio, operating model, governance, roadmap, adoption, value, and executive artifacts.", type: "job-search" },
    { id: `${slug}-job-3`, title: "Run a focused consulting application cycle", description: "Prioritize roles with strong industry and evidence fit, then track interview feedback and gaps.", type: "job-search" },
  ],
  interviewPrep: {
    title: "AI Transformation Consultant Interview Preparation",
    practiceAreas: ["Enterprise diagnosis","Opportunity portfolios","Business cases","Operating models","Responsible AI governance","Roadmaps","Adoption and workforce","Value realization","Executive facilitation"],
    questions: [
      "How would you diagnose why an enterprise has many AI pilots but little measurable value?",
      "Design a method for prioritizing twenty AI opportunities across five functions.",
      "When should an organization centralize or federate AI capabilities?",
      "How would you design proportionate responsible-AI governance without blocking delivery?",
      "Create an eighteen-month AI transformation roadmap for a regulated enterprise.",
      "How would you address employee resistance to an AI-enabled workflow redesign?",
      "What metrics would you use to prove transformation value?",
      "Present a recommendation to executives who disagree about speed, risk, and investment.",
    ],
  },
};

export const aiTransformationConsultantCareer = applyCareerTitleAliasPolicy(career);
