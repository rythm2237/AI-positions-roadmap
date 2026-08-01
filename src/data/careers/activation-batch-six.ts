import { aiProductManagerCareer } from "@/data/careers/ai-product-manager";
import { applyCareerTitleAliasPolicy } from "@/data/careerTitleAliases";
import type {
  CareerJourneyStage,
  CareerRoadmapPhase,
  CareerWorkspaceData,
} from "@/types/careerWorkspace";

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
  programmingRequirement: string;
  mathRequirement: string;
};

function buildCareer(spec: CareerSpec): CareerWorkspaceData {
  const base = aiProductManagerCareer;

  const journeyStages: CareerJourneyStage[] = base.journeyStages.map((stage, index) => {
    const title = spec.stages[index] ?? spec.stages[spec.stages.length - 1];
    const lessons = [
      `${title} foundations`,
      `${title} applied practice`,
      `${title} quality, measurement, and governance`,
    ];

    return {
      ...stage,
      id: `${spec.slug}-stage-${index + 1}`,
      title,
      label: title,
      landmark: title,
      theme: `Build practical evidence for ${title.toLowerCase()}.`,
      summary: `Develop professional capability in ${title.toLowerCase()} for the ${spec.title} role.`,
      explanation: `This stage converts ${title.toLowerCase()} into reviewable decisions, technical or business artifacts, tests, measurements, and professional evidence.`,
      lessons,
      tasks: [1, 2, 3].map((number) => ({
        id: `${spec.slug}-stage-${index + 1}-task-${number}`,
        title: `${title} practical mission ${number}`,
        description: `Create a reviewable artifact demonstrating ${title.toLowerCase()} in a realistic ${spec.title} scenario.`,
        type: index >= 8 ? "career" : index === 7 ? "project" : "lesson",
      })),
      topicAssessments: stage.topicAssessments?.map((assessment, assessmentIndex) => ({
        ...assessment,
        id: `${spec.slug}-stage-${index + 1}-topic-${assessmentIndex + 1}`,
        title: `${lessons[assessmentIndex % lessons.length]} knowledge check`,
        topicLabel: lessons[assessmentIndex % lessons.length],
      })),
      phaseExam: stage.phaseExam
        ? {
            ...stage.phaseExam,
            id: `${spec.slug}-stage-${index + 1}-comprehensive`,
            title: `${title} comprehensive assessment`,
            description: `A 20-question scenario assessment covering ${lessons.join(", ")}.`,
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
      mentorTip:
        "Keep every decision traceable to evidence, system constraints, stakeholders, risk, measurable outcomes, and operational ownership.",
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
        mission: `Create and review a professional artifact demonstrating ${sections[lessonIndex % sections.length]}.`,
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
    hiringDemand:
      "Strong across organizations modernizing data platforms, analytics, software delivery, and AI-enabled operations",
    remoteAvailability: "Medium to High depending on delivery and stakeholder requirements",
    aiCompatibilityScore: "95%",
    bestFor: [
      "Analytical problem solvers",
      "Systems thinkers",
      "Evidence-driven professionals",
      "Cross-functional collaborators",
    ],
    programmingRequirement: spec.programmingRequirement,
    mathRequirement: spec.mathRequirement,
    creativityLevel: "High",
    communicationLevel: "High",
    lastUpdated: "2026-08-01",
    metrics: [
      { label: "Primary outcome", value: "Reliable decisions and systems", detail: "Work must create measurable, supportable business value." },
      { label: "Evidence standard", value: "Portfolio-grade artifacts", detail: "Decisions, tests, controls, and outcomes remain inspectable." },
      { label: "Operating focus", value: "End-to-end lifecycle", detail: "Discovery, design, delivery, validation, deployment, and improvement." },
      { label: "Professional standard", value: "Governed and measurable", detail: "Quality, security, ownership, and risk are explicit." },
    ],
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
      deliverables: [
        "Problem and requirements brief",
        "Working analysis, architecture, or implementation",
        "Validation and test evidence",
        "Operations or measurement plan",
        "Portfolio case study",
      ],
      skills: project.skills,
    })),
    finalChallenge: {
      title: `${spec.title} Professional Readiness Review`,
      description: `Present and defend an end-to-end ${spec.title} engagement before a simulated technical and business review panel.`,
      requirements: [
        "Evidence-based problem definition",
        "Clear architecture or analytical method",
        "Quality, security, and governance controls",
        "Representative tests and failure cases",
        "Measurable outcomes",
        "Operational ownership and handover",
      ],
      deliverables: [
        "Executive summary",
        "Core technical or business work product",
        "Validation report",
        "Risk and governance register",
        "Implementation or operations roadmap",
        "Portfolio case study",
      ],
      evaluation: [
        "Problem understanding",
        "Technical and business judgment",
        "Evidence quality",
        "Reliability and governance",
        "Practicality",
        "Communication",
      ],
    },
    relatedCareers: spec.related,
    portfolioTasks: spec.portfolio.map((title, index) => ({
      id: `${spec.slug}-portfolio-${index + 1}`,
      title,
      description:
        "Publish a concise case study with context, method, architecture or analysis, decisions, tests, results, limitations, and next steps.",
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

export const biDeveloperCareer = buildCareer({
  slug: "bi-developer",
  title: "BI Developer",
  category: "AI Data & Analytics",
  shortDescription:
    "Build governed semantic models, reliable data transformations, performant dashboards, and decision-ready business intelligence products.",
  sceneTitle: "Business Intelligence Command Center",
  sceneDescription:
    "A governed analytics environment connecting source systems, transformations, semantic models, measures, dashboards, security, refresh, and business decisions.",
  overview:
    "A BI Developer turns operational data into reliable analytical products. The role combines requirements discovery, dimensional modeling, SQL, data transformation, semantic models, measures, visualization, security, performance, deployment, governance, and user enablement.",
  responsibilities: [
    "Translate business questions into analytical requirements",
    "Design dimensional and semantic data models",
    "Build SQL and transformation pipelines",
    "Create reusable measures and KPI definitions",
    "Develop accessible and performant dashboards",
    "Implement row-level security and governance",
    "Manage refresh, deployment, and monitoring",
    "Document and support BI products",
  ],
  industries: ["Retail", "Finance", "Supply chain", "Manufacturing", "Healthcare", "Technology", "Public sector", "Consulting"],
  stages: [
    "BI Role Orientation",
    "Business Requirements and KPI Design",
    "SQL and Data Transformation",
    "Dimensional and Semantic Modeling",
    "Measures and Analytical Logic",
    "Dashboard and UX Engineering",
    "Security, Governance, and Performance",
    "Deployment, Refresh, and Operations",
    "BI Portfolio Capstone",
    "Job Search and BI Interviews",
  ],
  roadmap: [
    ["BI Foundations", "Requirements", "KPIs", "Data literacy", "SQL", "Version control"],
    ["Data Preparation", "SQL joins", "Cleaning", "Power Query", "Validation", "Data quality"],
    ["Modeling", "Star schema", "Dimensions", "Facts", "Relationships", "Semantic models"],
    ["Measures and Analytics", "DAX", "Time intelligence", "Filter context", "KPIs", "Testing"],
    ["Delivery and Operations", "Dashboard UX", "RLS", "Performance", "Refresh", "Deployment"],
    ["Employment Readiness", "Portfolio", "Role mapping", "SQL interviews", "BI cases", "Applications"],
  ],
  projects: [
    { title: "Executive Performance Semantic Model", description: "Build a governed star schema, reusable KPI layer, and executive dashboard from multiple operational sources.", skills: ["SQL", "Dimensional modeling", "DAX", "Power BI"] },
    { title: "Sales and Inventory Intelligence Suite", description: "Create drill-through reporting, exception analysis, forecasting context, and operational decision views.", skills: ["Power Query", "Measures", "Visualization", "Business analysis"] },
    { title: "Secure Enterprise BI Deployment", description: "Implement RLS, workspace strategy, refresh, deployment controls, monitoring, and documentation.", skills: ["Security", "Governance", "Deployment", "Operations"] },
    { title: "End-to-End BI Product Capstone", description: "Deliver a production-style BI product from discovery and modeling through adoption and support.", skills: ["Requirements", "Modeling", "Analytics", "UX", "Operations"] },
  ],
  portfolio: ["Publish a semantic-model case study", "Publish a dashboard UX and performance review", "Publish an enterprise BI operations pack"],
  jobs: ["Build a BI Developer title matrix", "Map SQL, modeling, Power BI, and governance evidence", "Run a targeted BI application cycle"],
  interviewAreas: ["SQL", "Dimensional modeling", "DAX", "Power Query", "Dashboard design", "RLS", "Performance", "Deployment"],
  interviewQuestions: [
    "How would you design a star schema for sales and inventory?",
    "Explain row context and filter context.",
    "How do you prevent ambiguous relationships?",
    "How would you troubleshoot a slow Power BI report?",
    "When should logic live in SQL, Power Query, or DAX?",
    "How do you define and govern KPIs?",
    "Design row-level security for a regional organization.",
    "How would you deploy and monitor a business-critical BI product?",
  ],
  related: ["Data Analyst", "Analytics Engineer", "Data Engineer", "Power BI Developer"],
  difficulty: "Intermediate",
  learningTime: "7-10 months part-time",
  programmingRequirement: "Moderate: SQL, DAX, Power Query, data modeling, and version control",
  mathRequirement: "Moderate: business metrics, descriptive statistics, and analytical logic",
});

export const aiKnowledgeEngineerCareer = buildCareer({
  slug: "ai-knowledge-engineer",
  title: "AI Knowledge Engineer",
  category: "AI Data & Analytics",
  shortDescription:
    "Structure, govern, retrieve, evaluate, and maintain organizational knowledge for reliable AI assistants, search, RAG, and agentic systems.",
  sceneTitle: "Enterprise Knowledge Intelligence Lab",
  sceneDescription:
    "A knowledge environment connecting source systems, taxonomy, metadata, entities, document pipelines, retrieval, evaluation, permissions, and AI applications.",
  overview:
    "An AI Knowledge Engineer builds the knowledge layer used by AI systems. The role combines information architecture, taxonomy, ontology, metadata, document processing, knowledge graphs, retrieval, embeddings, RAG, evaluation, access control, provenance, governance, and lifecycle operations.",
  responsibilities: [
    "Audit knowledge sources and user needs",
    "Design taxonomies, metadata, and entity models",
    "Build ingestion and document-processing pipelines",
    "Implement search, embeddings, retrieval, and RAG",
    "Create knowledge graphs where appropriate",
    "Evaluate retrieval quality and grounded answers",
    "Preserve permissions, provenance, and freshness",
    "Operate knowledge lifecycle and governance",
  ],
  industries: ["Technology", "Consulting", "Legal", "Healthcare", "Financial services", "Retail", "Research", "Public sector"],
  stages: [
    "Knowledge Engineering Orientation",
    "Knowledge Discovery and Source Audit",
    "Taxonomy, Ontology, and Metadata",
    "Document Processing and Ingestion",
    "Search, Embeddings, and Retrieval",
    "RAG and Knowledge Graph Patterns",
    "Evaluation, Provenance, and Permissions",
    "Knowledge Operations and Governance",
    "Knowledge System Capstone",
    "Job Search and Interviews",
  ],
  roadmap: [
    ["Knowledge Foundations", "Information architecture", "User intent", "Source audit", "Metadata", "Governance"],
    ["Knowledge Modeling", "Taxonomy", "Ontology", "Entities", "Relationships", "Controlled vocabularies"],
    ["Ingestion and Retrieval", "Parsing", "Chunking", "Embeddings", "Hybrid search", "Reranking"],
    ["AI Knowledge Systems", "RAG", "Knowledge graphs", "Grounding", "Citations", "Tool retrieval"],
    ["Quality and Operations", "Evaluation", "Permissions", "Provenance", "Freshness", "Monitoring"],
    ["Employment Readiness", "Portfolio", "Role mapping", "System design", "Evaluation cases", "Applications"],
  ],
  projects: [
    { title: "Enterprise Knowledge Source Audit", description: "Map sources, owners, permissions, freshness, quality, user intent, and retrieval risks.", skills: ["Discovery", "Information architecture", "Governance", "Research"] },
    { title: "Taxonomy and Metadata System", description: "Design a governed taxonomy, entity model, metadata schema, and content lifecycle.", skills: ["Taxonomy", "Ontology", "Metadata", "Governance"] },
    { title: "Evaluated RAG Knowledge Assistant", description: "Build ingestion, hybrid retrieval, reranking, citations, permission controls, and evaluation.", skills: ["RAG", "Embeddings", "Retrieval", "Evaluation"] },
    { title: "Enterprise Knowledge Platform Capstone", description: "Deliver a production-style knowledge architecture with operations, ownership, and quality monitoring.", skills: ["Architecture", "Knowledge graphs", "Security", "Operations"] },
  ],
  portfolio: ["Publish a knowledge-source audit", "Publish a taxonomy and metadata design", "Publish an evaluated RAG system case study"],
  jobs: ["Build a knowledge-engineering title matrix", "Match retrieval, taxonomy, and RAG evidence", "Run a targeted knowledge and AI application cycle"],
  interviewAreas: ["Taxonomy", "Metadata", "Ontology", "Document ingestion", "Embeddings", "RAG", "Retrieval evaluation", "Permissions"],
  interviewQuestions: [
    "How do taxonomy and ontology differ?",
    "How would you choose a chunking strategy?",
    "When should you use keyword, vector, or hybrid search?",
    "How do you evaluate retrieval separately from generation?",
    "How would you preserve source permissions in RAG?",
    "When is a knowledge graph justified?",
    "How do you manage freshness and provenance?",
    "Design a knowledge assistant for a regulated organization.",
  ],
  related: ["AI Engineer", "Data Engineer", "Search Engineer", "Knowledge Manager"],
  difficulty: "Intermediate to Advanced",
  learningTime: "8-12 months part-time",
  programmingRequirement: "Moderate: Python, APIs, document pipelines, search systems, and data modeling",
  mathRequirement: "Moderate: similarity, ranking metrics, evaluation, and basic statistics",
});

export const dataEngineerCareer = buildCareer({
  slug: "data-engineer",
  title: "Data Engineer",
  category: "AI Data & Analytics",
  shortDescription:
    "Design, build, test, secure, and operate reliable data platforms and pipelines that support analytics, operations, and production AI.",
  sceneTitle: "Modern Data Platform Operations Center",
  sceneDescription:
    "A platform environment connecting sources, ingestion, transformation, orchestration, warehouses, lakes, quality, lineage, security, and observability.",
  overview:
    "A Data Engineer creates dependable systems for collecting, transforming, storing, serving, and governing data. The role combines SQL, Python, data modeling, batch and streaming pipelines, orchestration, cloud platforms, warehouses and lakes, testing, security, observability, cost control, and operations.",
  responsibilities: [
    "Design data platform and pipeline architecture",
    "Build batch and streaming ingestion",
    "Transform and model analytical data",
    "Implement orchestration and dependency management",
    "Enforce data quality, contracts, and lineage",
    "Secure data and manage access",
    "Monitor reliability, latency, and cost",
    "Support analytics, ML, and operational consumers",
  ],
  industries: ["Technology", "Finance", "Retail", "Logistics", "Manufacturing", "Healthcare", "Media", "Consulting"],
  stages: [
    "Data Engineering Orientation",
    "SQL, Python, and Data Foundations",
    "Data Modeling and Warehousing",
    "Batch Ingestion and Transformation",
    "Orchestration and Data Quality",
    "Streaming and Event Data",
    "Cloud Platforms, Security, and Governance",
    "Observability, Reliability, and Cost",
    "Data Platform Capstone",
    "Job Search and Data Engineering Interviews",
  ],
  roadmap: [
    ["Engineering Foundations", "SQL", "Python", "Git", "Linux", "Data formats"],
    ["Modeling and Storage", "Dimensional models", "Warehouses", "Lakes", "Lakehouse", "Partitioning"],
    ["Pipelines", "Ingestion", "ELT", "dbt", "Orchestration", "Testing"],
    ["Distributed and Streaming", "Spark", "Events", "Kafka", "State", "Schemas"],
    ["Platform Operations", "Cloud", "Security", "Lineage", "Observability", "Cost"],
    ["Employment Readiness", "Portfolio", "SQL interviews", "System design", "Coding", "Applications"],
  ],
  projects: [
    { title: "Warehouse and ELT Analytics Platform", description: "Build ingestion, transformation, dimensional models, tests, documentation, and scheduled orchestration.", skills: ["SQL", "dbt", "Warehousing", "Orchestration"] },
    { title: "Event-Driven Data Pipeline", description: "Process streaming events with schemas, partitioning, state, replay, and monitoring.", skills: ["Streaming", "Kafka", "Schemas", "Reliability"] },
    { title: "Governed Cloud Data Platform", description: "Implement identity, access, lineage, data quality, cost controls, and environment separation.", skills: ["Cloud", "Security", "Governance", "FinOps"] },
    { title: "Production Data Engineering Capstone", description: "Deliver a reliable platform from source contracts through serving, monitoring, recovery, and handover.", skills: ["Architecture", "Pipelines", "Quality", "Operations"] },
  ],
  portfolio: ["Publish an ELT platform case study", "Publish a streaming architecture and reliability report", "Publish a data platform operations pack"],
  jobs: ["Build a Data Engineer title matrix", "Map SQL, Python, cloud, and orchestration evidence", "Run a targeted data-engineering application cycle"],
  interviewAreas: ["SQL", "Python", "Data modeling", "Warehousing", "Orchestration", "Streaming", "Data quality", "System design"],
  interviewQuestions: [
    "Design a pipeline for high-volume transactional data.",
    "When would you use a warehouse, lake, or lakehouse?",
    "How do you make a pipeline idempotent?",
    "How would you handle schema evolution?",
    "Explain partitioning and its trade-offs.",
    "How do you test and monitor data quality?",
    "Design a replay strategy for event data.",
    "How would you reduce cloud data-platform cost without reducing reliability?",
  ],
  related: ["Analytics Engineer", "BI Developer", "ML Engineer", "Cloud Engineer"],
  difficulty: "Intermediate to Advanced",
  learningTime: "10-15 months part-time",
  programmingRequirement: "High: SQL, Python, data frameworks, cloud SDKs, Git, and infrastructure tooling",
  mathRequirement: "Moderate: data structures, performance, capacity, and statistical quality checks",
});

export const devOpsEngineerCareer = buildCareer({
  slug: "devops-engineer",
  title: "DevOps Engineer",
  category: "AI Infrastructure & Security",
  shortDescription:
    "Build reliable delivery, infrastructure, observability, security, and operational systems for modern cloud and AI-enabled software.",
  sceneTitle: "Cloud Delivery and Reliability Control Center",
  sceneDescription:
    "An engineering environment connecting source control, CI/CD, infrastructure as code, containers, cloud, security, telemetry, incidents, and reliability.",
  overview:
    "A DevOps Engineer improves how software is built, released, operated, secured, and recovered. The role combines Linux, networking, cloud, containers, CI/CD, infrastructure as code, configuration, secrets, observability, SRE practices, incident response, cost control, and developer enablement.",
  responsibilities: [
    "Build and maintain CI/CD pipelines",
    "Provision infrastructure as code",
    "Operate containers and cloud services",
    "Implement secrets, identity, and security controls",
    "Create monitoring, logging, tracing, and alerts",
    "Improve reliability and deployment safety",
    "Respond to incidents and automate recovery",
    "Enable development teams with platforms and standards",
  ],
  industries: ["Technology", "Finance", "Retail", "Media", "Healthcare", "Manufacturing", "Cloud services", "Consulting"],
  stages: [
    "DevOps Role Orientation",
    "Linux, Networking, and Scripting",
    "Source Control and CI",
    "Containers and Deployment",
    "Infrastructure as Code and Cloud",
    "CD, Release, and Environment Strategy",
    "Security and Supply Chain Controls",
    "Observability, SRE, and Incident Response",
    "DevOps Platform Capstone",
    "Job Search and DevOps Interviews",
  ],
  roadmap: [
    ["Systems Foundations", "Linux", "Networking", "Shell", "Python", "Git"],
    ["Build and CI", "Pipelines", "Testing", "Artifacts", "Caching", "Quality gates"],
    ["Containers and Cloud", "Docker", "Kubernetes", "Cloud services", "Networking", "Storage"],
    ["Infrastructure and Delivery", "Terraform", "Configuration", "CD", "Environments", "Rollback"],
    ["Reliability and Security", "Observability", "SLOs", "Incidents", "Secrets", "Supply chain"],
    ["Employment Readiness", "Portfolio", "Troubleshooting", "System design", "Coding", "Applications"],
  ],
  projects: [
    { title: "Secure CI/CD Pipeline", description: "Build automated tests, artifacts, vulnerability checks, deployment gates, and rollback.", skills: ["CI/CD", "Testing", "Security", "Release engineering"] },
    { title: "Infrastructure-as-Code Cloud Environment", description: "Provision network, compute, storage, identity, secrets, and environment separation.", skills: ["Terraform", "Cloud", "IAM", "Networking"] },
    { title: "Observable Container Platform", description: "Deploy a containerized service with metrics, logs, traces, SLOs, alerts, and incident runbooks.", skills: ["Containers", "Observability", "SRE", "Operations"] },
    { title: "Production DevOps Platform Capstone", description: "Deliver a secure developer-to-production platform with reliability, recovery, and cost controls.", skills: ["Platform engineering", "Automation", "Security", "Reliability"] },
  ],
  portfolio: ["Publish a CI/CD and supply-chain case study", "Publish an infrastructure-as-code environment", "Publish an observability and incident-response pack"],
  jobs: ["Build a DevOps and platform title matrix", "Map cloud, CI/CD, IaC, and SRE evidence", "Run a targeted DevOps application cycle"],
  interviewAreas: ["Linux", "Networking", "CI/CD", "Containers", "Cloud", "Terraform", "Security", "SRE"],
  interviewQuestions: [
    "How would you design a safe deployment pipeline?",
    "Explain containers versus virtual machines.",
    "How do you manage Terraform state safely?",
    "How would you investigate a sudden latency increase?",
    "What is the difference between an SLI, SLO, and SLA?",
    "How do you secure the software supply chain?",
    "Design rollback and disaster-recovery procedures.",
    "How would you balance reliability, delivery speed, and cost?",
  ],
  related: ["Platform Engineer", "Site Reliability Engineer", "Cloud Engineer", "MLOps Engineer"],
  difficulty: "Intermediate to Advanced",
  learningTime: "10-16 months part-time",
  programmingRequirement: "High: shell, Python, YAML, infrastructure as code, APIs, and automation",
  mathRequirement: "Low to Moderate: capacity, latency, reliability, and cost calculations",
});

export const businessAiConsultantCareer = buildCareer({
  slug: "business-ai-consultant",
  title: "Business AI Consultant",
  category: "Enterprise AI & Consulting",
  shortDescription:
    "Identify high-value AI opportunities and translate them into measurable business change, governed solutions, adoption plans, and value realization.",
  sceneTitle: "Business AI Opportunity and Value Lab",
  sceneDescription:
    "A consulting environment connecting strategy, processes, stakeholders, AI opportunities, solution options, governance, adoption, and measurable value.",
  overview:
    "A Business AI Consultant connects business strategy and operations with practical AI capability. The role combines discovery, process analysis, opportunity assessment, value modeling, solution framing, responsible AI, stakeholder alignment, pilot planning, adoption, and benefits realization.",
  responsibilities: [
    "Interview stakeholders and map business processes",
    "Identify and prioritize AI opportunities",
    "Assess feasibility, data, risk, and organizational readiness",
    "Frame solution options and business cases",
    "Define governance and responsible-AI controls",
    "Plan pilots, adoption, and operating ownership",
    "Communicate recommendations to executives and delivery teams",
    "Track realized value and improve the portfolio",
  ],
  industries: ["Consulting", "Retail", "Finance", "Healthcare", "Manufacturing", "Logistics", "Public sector", "Technology"],
  stages: [
    "Business AI Role Orientation",
    "Enterprise and Stakeholder Discovery",
    "Process and Opportunity Analysis",
    "AI Capability and Feasibility",
    "Business Case and Value Modeling",
    "Solution Framing and Responsible AI",
    "Pilot, Adoption, and Change",
    "Portfolio Governance and Value Realization",
    "Business AI Consulting Capstone",
    "Job Search and Case Interviews",
  ],
  roadmap: [
    ["Consulting Foundations", "Discovery", "Stakeholders", "Processes", "Strategy", "Problem framing"],
    ["Opportunity Assessment", "Use cases", "AI fit", "Data readiness", "Feasibility", "Risk"],
    ["Value and Solutions", "Business case", "ROI", "Options", "Architecture framing", "Build versus buy"],
    ["Governance and Adoption", "Responsible AI", "Controls", "Pilot", "Change", "Operating ownership"],
    ["Portfolio and Delivery", "Prioritization", "Roadmap", "Benefits", "Executive communication", "Capstone"],
    ["Employment Readiness", "Case studies", "Role mapping", "Consulting cases", "Presentations", "Applications"],
  ],
  projects: [
    { title: "Business AI Opportunity Assessment", description: "Map processes and prioritize use cases by value, feasibility, risk, readiness, and adoption complexity.", skills: ["Discovery", "Process analysis", "Prioritization", "AI literacy"] },
    { title: "AI Business Case and Solution Options", description: "Compare solution approaches and build a transparent value, cost, risk, and assumptions model.", skills: ["Business case", "ROI", "Solution framing", "Decision analysis"] },
    { title: "Responsible AI Pilot and Adoption Plan", description: "Design a controlled proof of value with evaluation, governance, change, and operating ownership.", skills: ["Pilot", "Responsible AI", "Adoption", "Governance"] },
    { title: "Enterprise Business AI Portfolio Capstone", description: "Deliver an opportunity portfolio, roadmap, operating model, and benefits-realization framework.", skills: ["Strategy", "Portfolio", "Transformation", "Executive communication"] },
  ],
  portfolio: ["Publish an AI opportunity assessment", "Publish a business case and options recommendation", "Publish an AI portfolio and value-realization roadmap"],
  jobs: ["Build a Business AI Consultant title matrix", "Match discovery, business-case, and adoption evidence", "Run a targeted consulting application cycle"],
  interviewAreas: ["Discovery", "Process analysis", "AI opportunity assessment", "Business cases", "Responsible AI", "Pilots", "Adoption", "Executive communication"],
  interviewQuestions: [
    "How do you identify a valuable AI opportunity?",
    "How would you prioritize competing use cases?",
    "When should a process not use AI?",
    "How do you build an AI business case under uncertainty?",
    "How would you compare build, buy, and partner options?",
    "Design a responsible proof of value.",
    "How do you address stakeholder resistance?",
    "How would you measure realized business value after launch?",
  ],
  related: ["AI Solutions Consultant", "AI Transformation Consultant", "Business Analyst", "AI Product Manager"],
  difficulty: "Intermediate to Advanced",
  learningTime: "7-11 months part-time",
  programmingRequirement: "Low to Moderate: data literacy, solution fluency, APIs, and prototype-level technical work",
  mathRequirement: "Moderate: ROI, scenarios, prioritization, metrics, and experiment interpretation",
});
