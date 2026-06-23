(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/career/CareerDashboard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CareerDashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
// src/components/career/CareerDashboard.tsx
// Full 9-tab AI Career Dashboard — ported from career-dashboard.tsx prototype.
// Client component: all state is local, no server data needed.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
// ─── DATA ─────────────────────────────────────────────────────────────────────
const POSITIONS = [
    {
        id: "ai-automation",
        label: "🤖 AI Automation Specialist"
    },
    {
        id: "prompt-engineer",
        label: "✍️ Prompt Engineer"
    },
    {
        id: "ai-data-analyst",
        label: "📊 AI Data Analyst"
    },
    {
        id: "ml-engineer",
        label: "⚙️ ML Engineer"
    },
    {
        id: "ai-product-manager",
        label: "🧭 AI Product Manager"
    }
];
const TABS = [
    {
        id: "market",
        label: "📊 Market"
    },
    {
        id: "skills",
        label: "🧠 Skills"
    },
    {
        id: "roadmap",
        label: "🗺️ Roadmap"
    },
    {
        id: "certs",
        label: "🎓 Certifications"
    },
    {
        id: "portfolio",
        label: "💼 Portfolio"
    },
    {
        id: "countries",
        label: "🌍 Countries"
    },
    {
        id: "gap",
        label: "🔍 Gap Analysis"
    },
    {
        id: "strategy",
        label: "🚀 Strategy"
    },
    {
        id: "cv",
        label: "📄 CV Analyzer"
    }
];
const skillsData = [
    {
        cat: "Technical",
        name: "REST API & Webhooks",
        demand: 10,
        freq: "95%",
        diff: 3,
        hire: 10
    },
    {
        cat: "Technical",
        name: "Python",
        demand: 9,
        freq: "80%",
        diff: 5,
        hire: 9
    },
    {
        cat: "Technical",
        name: "JavaScript / TypeScript",
        demand: 8,
        freq: "65%",
        diff: 4,
        hire: 8
    },
    {
        cat: "Technical",
        name: "Git & Version Control",
        demand: 8,
        freq: "70%",
        diff: 2,
        hire: 7
    },
    {
        cat: "Technical",
        name: "SQL (Basics)",
        demand: 7,
        freq: "55%",
        diff: 3,
        hire: 7
    },
    {
        cat: "Technical",
        name: "Docker / Cloud Basics",
        demand: 6,
        freq: "40%",
        diff: 6,
        hire: 6
    },
    {
        cat: "AI",
        name: "Prompt Engineering",
        demand: 10,
        freq: "90%",
        diff: 2,
        hire: 10
    },
    {
        cat: "AI",
        name: "LLM APIs (OpenAI/Claude/Gemini)",
        demand: 10,
        freq: "92%",
        diff: 3,
        hire: 10
    },
    {
        cat: "AI",
        name: "AI Agents & Multi-agent",
        demand: 9,
        freq: "75%",
        diff: 6,
        hire: 9
    },
    {
        cat: "AI",
        name: "RAG (Retrieval-Augmented Gen)",
        demand: 9,
        freq: "70%",
        diff: 6,
        hire: 9
    },
    {
        cat: "AI",
        name: "LangChain / LangGraph",
        demand: 8,
        freq: "65%",
        diff: 6,
        hire: 8
    },
    {
        cat: "AI",
        name: "Vector Databases (Pinecone/pgvector)",
        demand: 7,
        freq: "50%",
        diff: 5,
        hire: 7
    },
    {
        cat: "Automation",
        name: "n8n",
        demand: 10,
        freq: "88%",
        diff: 3,
        hire: 10
    },
    {
        cat: "Automation",
        name: "Make.com",
        demand: 9,
        freq: "82%",
        diff: 2,
        hire: 9
    },
    {
        cat: "Automation",
        name: "Zapier",
        demand: 8,
        freq: "75%",
        diff: 2,
        hire: 8
    },
    {
        cat: "Automation",
        name: "Power Automate",
        demand: 7,
        freq: "55%",
        diff: 3,
        hire: 7
    },
    {
        cat: "Automation",
        name: "LangChain Pipelines",
        demand: 8,
        freq: "60%",
        diff: 6,
        hire: 8
    },
    {
        cat: "Automation",
        name: "CrewAI / AutoGen",
        demand: 7,
        freq: "45%",
        diff: 7,
        hire: 7
    },
    {
        cat: "Business",
        name: "Process Mapping & Design",
        demand: 8,
        freq: "70%",
        diff: 2,
        hire: 8
    },
    {
        cat: "Business",
        name: "API Integration (business)",
        demand: 9,
        freq: "80%",
        diff: 3,
        hire: 9
    },
    {
        cat: "Business",
        name: "ROI Calculation",
        demand: 7,
        freq: "55%",
        diff: 3,
        hire: 7
    },
    {
        cat: "Business",
        name: "Stakeholder Communication",
        demand: 8,
        freq: "72%",
        diff: 2,
        hire: 8
    },
    {
        cat: "Business",
        name: "Technical Documentation",
        demand: 9,
        freq: "85%",
        diff: 2,
        hire: 9
    },
    {
        cat: "Business",
        name: "Requirements Analysis",
        demand: 7,
        freq: "58%",
        diff: 3,
        hire: 7
    }
];
const roadmapPhases = [
    {
        phase: 1,
        title: "Technical Foundations",
        time: "4–6 weeks",
        weeks: 5,
        color: "#3b82f6",
        topics: [
            "Python basics (Automate the Boring Stuff)",
            "REST APIs & Webhooks",
            "Git & GitHub",
            "SQL basics (SQLZoo, Mode)"
        ],
        free: [
            "freeCodeCamp Python",
            "Automate Boring Stuff (free)",
            "GitHub Learning Lab"
        ],
        paid: [
            "Python Bootcamp – Udemy ($15)",
            "CS50 Python (free/certificate)"
        ],
        exercise: "Write a Python script that fetches data from an API and saves it to CSV"
    },
    {
        phase: 2,
        title: "Automation Platforms",
        time: "6–8 weeks",
        weeks: 7,
        color: "#8b5cf6",
        topics: [
            "Make.com (Foundation → Intermediate)",
            "n8n (self-hosted + cloud)",
            "Power Automate + Copilot",
            "Zapier basics"
        ],
        free: [
            "Make Academy (fully free)",
            "n8n Docs & Community",
            "Microsoft Learn Power Automate"
        ],
        paid: [
            "n8n Course – Udemy ($15)",
            "Make.com Advanced – YouTube"
        ],
        exercise: "Build 3 workflows: lead capture, email notification, data sync"
    },
    {
        phase: 3,
        title: "AI Fundamentals",
        time: "6–8 weeks",
        weeks: 7,
        color: "#10b981",
        topics: [
            "Prompt Engineering (DeepLearning.AI free)",
            "LLM APIs: OpenAI, Claude, Gemini",
            "RAG (Retrieval-Augmented Generation)",
            "AI Agents basics with LangChain"
        ],
        free: [
            "DeepLearning.AI Short Courses (free)",
            "Anthropic Docs",
            "LangChain Docs",
            "n8n AI Agent nodes"
        ],
        paid: [
            "LangChain Bootcamp – Udemy ($15)",
            "Building AI Apps with Claude – Anthropic"
        ],
        exercise: "Build a RAG chatbot that answers questions from PDF documents"
    },
    {
        phase: 4,
        title: "Real-World Projects",
        time: "8–10 weeks",
        weeks: 9,
        color: "#f59e0b",
        topics: [
            "Customer Support Automation",
            "CRM & Lead Automation",
            "Document Processing Pipeline",
            "Multi-agent Research System"
        ],
        free: [
            "n8n Community Templates",
            "GitHub Public Repos",
            "YouTube walkthroughs"
        ],
        paid: [
            "Mentoring on MentorCruise ($50–150/mo)"
        ],
        exercise: "5 complete projects with Teardown documents (before/after + metrics)"
    },
    {
        phase: 5,
        title: "Job Readiness",
        time: "4–6 weeks",
        weeks: 5,
        color: "#ef4444",
        topics: [
            "Portfolio GitHub + Loom video demos",
            "Azure AI-900 certification",
            "LinkedIn optimization with keywords",
            "Interview prep + salary negotiation"
        ],
        free: [
            "LinkedIn Learning (Azure AI-900 prep)",
            "Microsoft Learn (free)",
            "Glassdoor Interview Questions"
        ],
        paid: [
            "Leetcode Premium ($35/mo) for technical interviews"
        ],
        exercise: "Find 3 real job listings and tailor your resume for each"
    }
];
const certsData = [
    {
        name: "Azure AI Fundamentals (AI-900)",
        value: "High",
        cost: "$165",
        diff: "Easy",
        roi: "Very High",
        rec: "✅ Start here"
    },
    {
        name: "Azure AI Engineer (AI-102)",
        value: "Very High",
        cost: "$165",
        diff: "Medium",
        roi: "Very High",
        rec: "✅ Best for CV"
    },
    {
        name: "n8n Certification (official)",
        value: "High (niche)",
        cost: "Free",
        diff: "Easy",
        roi: "High",
        rec: "✅ Do it"
    },
    {
        name: "Make.com Certification",
        value: "High (niche)",
        cost: "Free",
        diff: "Easy",
        roi: "High",
        rec: "✅ Do it"
    },
    {
        name: "Google AI Essentials (Coursera)",
        value: "Medium",
        cost: "$49",
        diff: "Easy",
        roi: "Medium",
        rec: "⚠️ Optional"
    },
    {
        name: "AWS AI Practitioner",
        value: "Medium",
        cost: "$150",
        diff: "Medium",
        roi: "Medium",
        rec: "⚠️ If using AWS"
    },
    {
        name: "DeepLearning.AI Courses",
        value: "Medium",
        cost: "Free–$50",
        diff: "Medium",
        roi: "High",
        rec: "✅ For knowledge"
    },
    {
        name: "IBM Generative AI Engineering",
        value: "Medium",
        cost: "$99",
        diff: "Medium",
        roi: "Medium",
        rec: "⚠️ Optional"
    },
    {
        name: "UiPath / Power Platform",
        value: "Low",
        cost: "Free–$200",
        diff: "Medium",
        roi: "Low",
        rec: "❌ Low priority"
    },
    {
        name: "Coursera ML Specialization",
        value: "Medium",
        cost: "$50/mo",
        diff: "High",
        roi: "Low (long)",
        rec: "❌ Not needed for this path"
    }
];
const portfolioProjects = [
    {
        rank: 1,
        name: "AI Customer Support Bot (n8n + Claude API)",
        diff: "Medium",
        tech: "n8n, Claude API, Webhook",
        time: "3-5 days",
        score: 10
    },
    {
        rank: 2,
        name: "Invoice Processing & Data Extraction Pipeline",
        diff: "Medium",
        tech: "n8n, Claude Vision, Google Sheets",
        time: "3-4 days",
        score: 10
    },
    {
        rank: 3,
        name: "Lead Qualification & CRM Auto-routing",
        diff: "Medium",
        tech: "Make.com, OpenAI, HubSpot/Airtable",
        time: "4-6 days",
        score: 9
    },
    {
        rank: 4,
        name: "RAG Knowledge Base for Business Docs",
        diff: "Medium-High",
        tech: "Python, LangChain, Pinecone, Claude",
        time: "1-2 weeks",
        score: 9
    },
    {
        rank: 5,
        name: "AI Email Triage & Auto-response System",
        diff: "Easy-Medium",
        tech: "n8n, Gmail API, OpenAI",
        time: "2-3 days",
        score: 9
    },
    {
        rank: 6,
        name: "Multi-agent Research Assistant",
        diff: "High",
        tech: "LangGraph, CrewAI, Python",
        time: "2 weeks",
        score: 9
    },
    {
        rank: 7,
        name: "Automated Social Media Content Pipeline",
        diff: "Easy",
        tech: "Make.com, OpenAI, Buffer/LinkedIn API",
        time: "2-3 days",
        score: 8
    },
    {
        rank: 8,
        name: "Business Process Automation Dashboard",
        diff: "Medium",
        tech: "n8n, Power Automate, Dashboard UI",
        time: "1 week",
        score: 8
    },
    {
        rank: 9,
        name: "AI-powered Appointment Booking Agent",
        diff: "Medium",
        tech: "n8n, Claude, Google Calendar API",
        time: "4-5 days",
        score: 8
    },
    {
        rank: 10,
        name: "Slack/Teams AI Assistant for Internal Ops",
        diff: "Medium",
        tech: "n8n, Slack API, LLM",
        time: "4-6 days",
        score: 8
    }
];
const countriesData = [
    {
        rank: 1,
        country: "🇳🇱 Netherlands",
        salary: "€70–100K",
        vacancies: "High",
        visa: "Good (DETO/Highly Skilled)",
        english: "Excellent",
        remote: "Lots",
        potential: "Very High",
        note: "30% Tax Ruling = huge net salary boost!"
    },
    {
        rank: 2,
        country: "🇮🇪 Ireland",
        salary: "€90–130K",
        vacancies: "Very High",
        visa: "Good",
        english: "Native",
        remote: "Lots",
        potential: "Very High",
        note: "Google, Meta, Apple HQ – best networking hub"
    },
    {
        rank: 3,
        country: "🇩🇪 Germany",
        salary: "€65–95K",
        vacancies: "Very High",
        visa: "Excellent (Chancenkarte)",
        english: "Medium",
        remote: "Lots",
        potential: "High",
        note: "Largest EU market, Opportunity Card visa"
    },
    {
        rank: 4,
        country: "🇬🇧 UK",
        salary: "€72–110K",
        vacancies: "Very High",
        visa: "Medium (Skilled Worker)",
        english: "Native",
        remote: "Lots",
        potential: "High",
        note: "London – strongest fintech+AI ecosystem"
    },
    {
        rank: 5,
        country: "🇨🇭 Switzerland",
        salary: "€96–160K",
        vacancies: "Medium",
        visa: "Hard",
        english: "Good",
        remote: "Medium",
        potential: "High",
        note: "Highest EU salaries, hard to enter"
    },
    {
        rank: 6,
        country: "🇸🇪 Sweden",
        salary: "€66–90K",
        vacancies: "Medium",
        visa: "Good",
        english: "Excellent",
        remote: "Lots",
        potential: "Medium–High",
        note: "Stockholm active, excellent quality of life"
    },
    {
        rank: 7,
        country: "🇦🇪 UAE",
        salary: "$80–130K (tax-free)",
        vacancies: "High",
        visa: "Easy",
        english: "Good",
        remote: "Lots",
        potential: "High",
        note: "Zero tax, Dubai startup scene"
    },
    {
        rank: 8,
        country: "🇸🇬 Singapore",
        salary: "$90–140K",
        vacancies: "High",
        visa: "Medium",
        english: "Native",
        remote: "Lots",
        potential: "High",
        note: "Asia hub, English-first"
    }
];
// ─── CV ANALYSIS ENGINE ───────────────────────────────────────────────────────
const KEY_SKILLS = [
    "python",
    "javascript",
    "typescript",
    "sql",
    "git",
    "docker",
    "api",
    "webhook",
    "prompt engineering",
    "llm",
    "openai",
    "claude",
    "gemini",
    "langchain",
    "rag",
    "vector",
    "pinecone",
    "n8n",
    "make.com",
    "zapier",
    "power automate",
    "automation",
    "ai agent",
    "crewai",
    "langraph",
    "process mapping",
    "stakeholder",
    "documentation",
    "requirements",
    "roi",
    "crm",
    "data analysis",
    "machine learning",
    "deep learning",
    "tensorflow",
    "pytorch",
    "aws",
    "azure",
    "gcp",
    "cloud",
    "kubernetes",
    "react",
    "node",
    "fastapi",
    "flask",
    "django",
    "mongodb",
    "postgresql"
];
const STRONG_SKILLS = [
    "n8n",
    "make.com",
    "langchain",
    "openai",
    "claude",
    "python",
    "prompt engineering",
    "rag",
    "ai agent"
];
const NICE_SKILLS = [
    "javascript",
    "typescript",
    "sql",
    "git",
    "power automate",
    "zapier",
    "docker",
    "azure",
    "aws"
];
function analyzeCV(text) {
    const lower = text.toLowerCase();
    const found = KEY_SKILLS.filter((s)=>lower.includes(s));
    const strong = STRONG_SKILLS.filter((s)=>lower.includes(s));
    const missing = STRONG_SKILLS.filter((s)=>!lower.includes(s));
    const niceFound = NICE_SKILLS.filter((s)=>lower.includes(s));
    const score = Math.min(100, Math.round(strong.length / STRONG_SKILLS.length * 60 + niceFound.length / NICE_SKILLS.length * 40));
    const hasMarketing = /marketing|campaign|seo|social media|content|brand/i.test(text);
    const hasOps = /operations|process|workflow|efficiency|improvement|lean|agile/i.test(text);
    const hasTech = /developer|engineer|software|programming|code|api|database/i.test(text);
    const hasManagement = /manager|director|lead|head of|senior|team/i.test(text);
    const strengths = [];
    const gaps = [];
    const priorityActions = [];
    if (strong.length > 0) strengths.push(`Core AI Automation skills detected: ${strong.join(", ")}`);
    if (hasMarketing) strengths.push("Marketing background → directly applicable to CRM & lead automation");
    if (hasOps) strengths.push("Operations experience → process mapping before automation is a critical skill");
    if (hasTech) strengths.push("Technical background → faster learning curve for APIs and code");
    if (hasManagement) strengths.push("Leadership experience → stakeholder management and ROI presentation");
    if (niceFound.length > 0) strengths.push(`Supporting skills: ${niceFound.join(", ")}`);
    if (strengths.length === 0) strengths.push("General professional experience — ready to build AI skills from scratch");
    if (missing.includes("n8n")) {
        gaps.push("n8n — most in-demand automation platform (2026)");
        priorityActions.push("Start n8n Cloud free trial this week — build 3 workflows");
    }
    if (missing.includes("python")) {
        gaps.push("Python — needed for advanced automation and AI pipelines");
        priorityActions.push("Complete 'Automate the Boring Stuff with Python' (free, 4–6 weeks)");
    }
    if (missing.includes("prompt engineering")) {
        gaps.push("Prompt Engineering — core skill for all LLM-based automation");
        priorityActions.push("Take DeepLearning.AI 'Prompt Engineering for Developers' (free, 1 week)");
    }
    if (missing.includes("langchain")) {
        gaps.push("LangChain / LangGraph — needed for AI agents and RAG pipelines");
        priorityActions.push("Build a simple RAG chatbot using LangChain + Claude API");
    }
    if (missing.includes("rag")) {
        gaps.push("RAG (Retrieval-Augmented Generation) — key for enterprise AI solutions");
    }
    if (missing.includes("make.com")) {
        gaps.push("Make.com — second most popular no-code automation platform");
        priorityActions.push("Complete Make Academy (fully free) — Foundation + Intermediate");
    }
    if (gaps.length === 0) gaps.push("Minor gaps only — focus on building portfolio projects");
    if (priorityActions.length === 0) priorityActions.push("Build 5 portfolio projects and publish on GitHub with Loom demos");
    const timeEstimate = score >= 70 ? "2–3 months to first job offer" : score >= 40 ? "4–5 months to first job offer" : "5–7 months to first job offer";
    const recommendedPath = score >= 60 ? "Fast-track: Focus on portfolio projects + Azure AI-900 certification" : score >= 30 ? "Standard path: Fill skill gaps in parallel with building projects" : "Foundation path: Start with Python + n8n basics, then build up";
    return {
        strengths,
        gaps,
        score,
        topSkills: found.slice(0, 8),
        missingSkills: missing,
        recommendedPath,
        timeEstimate,
        priorityActions
    };
}
// ─── TIMELINE UTILITIES ───────────────────────────────────────────────────────
function addWeeks(date, weeks) {
    const d = new Date(date);
    d.setDate(d.getDate() + weeks * 7);
    return d;
}
function formatDate(date) {
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}
function CareerDashboard() {
    _s();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("market");
    const [activePosition, setActivePosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("ai-automation");
    const [skillFilter, setSkillFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("All");
    // CV Analyzer state
    const [cvText, setCvText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [cvAnalysis, setCvAnalysis] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [cvLoading, setCvLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Timeline state
    const [timeline, setTimeline] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        startDate: new Date(),
        phaseOffsets: roadmapPhases.map({
            "CareerDashboard.useState": ()=>0
        }["CareerDashboard.useState"]),
        completedPhases: roadmapPhases.map({
            "CareerDashboard.useState": ()=>false
        }["CareerDashboard.useState"])
    });
    const [showTimelineEditor, setShowTimelineEditor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const skillCats = [
        "All",
        "Technical",
        "AI",
        "Automation",
        "Business"
    ];
    const filteredSkills = skillFilter === "All" ? skillsData : skillsData.filter((s)=>s.cat === skillFilter);
    // ── CV Analysis ──
    const handleFileUpload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CareerDashboard.useCallback[handleFileUpload]": (e)=>{
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ({
                "CareerDashboard.useCallback[handleFileUpload]": (ev)=>{
                    const text = ev.target?.result;
                    setCvText(text);
                }
            })["CareerDashboard.useCallback[handleFileUpload]"];
            reader.readAsText(file);
        }
    }["CareerDashboard.useCallback[handleFileUpload]"], []);
    const runCVAnalysis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CareerDashboard.useCallback[runCVAnalysis]": ()=>{
            if (!cvText.trim()) return;
            setCvLoading(true);
            setTimeout({
                "CareerDashboard.useCallback[runCVAnalysis]": ()=>{
                    const result = analyzeCV(cvText);
                    setCvAnalysis(result);
                    setCvLoading(false);
                }
            }["CareerDashboard.useCallback[runCVAnalysis]"], 1200);
        }
    }["CareerDashboard.useCallback[runCVAnalysis]"], [
        cvText
    ]);
    // ── Timeline helpers ──
    function getPhaseStart(phaseIndex) {
        let d = new Date(timeline.startDate);
        for(let i = 0; i < phaseIndex; i++){
            const totalWeeks = roadmapPhases[i].weeks + timeline.phaseOffsets[i];
            d = addWeeks(d, totalWeeks);
        }
        return d;
    }
    function getPhaseEnd(phaseIndex) {
        const start = getPhaseStart(phaseIndex);
        return addWeeks(start, roadmapPhases[phaseIndex].weeks + timeline.phaseOffsets[phaseIndex]);
    }
    function postponePhase(phaseIndex, extraWeeks) {
        setTimeline((prev)=>{
            const offsets = [
                ...prev.phaseOffsets
            ];
            offsets[phaseIndex] = Math.max(0, offsets[phaseIndex] + extraWeeks);
            return {
                ...prev,
                phaseOffsets: offsets
            };
        });
    }
    function compressPhase(phaseIndex) {
        setTimeline((prev)=>{
            const offsets = [
                ...prev.phaseOffsets
            ];
            offsets[phaseIndex] = Math.max(-Math.floor(roadmapPhases[phaseIndex].weeks * 0.3), offsets[phaseIndex] - 1);
            return {
                ...prev,
                phaseOffsets: offsets
            };
        });
    }
    function toggleComplete(phaseIndex) {
        setTimeline((prev)=>{
            const completed = [
                ...prev.completedPhases
            ];
            completed[phaseIndex] = !completed[phaseIndex];
            return {
                ...prev,
                completedPhases: completed
            };
        });
    }
    function resetTimeline() {
        setTimeline({
            startDate: new Date(),
            phaseOffsets: roadmapPhases.map(()=>0),
            completedPhases: roadmapPhases.map(()=>false)
        });
    }
    const totalWeeks = roadmapPhases.reduce((sum, p, i)=>sum + p.weeks + timeline.phaseOffsets[i], 0);
    const estimatedEnd = addWeeks(timeline.startDate, totalWeeks);
    const completedCount = timeline.completedPhases.filter(Boolean).length;
    // ─── STYLES ───────────────────────────────────────────────────────────────
    const s = {
        page: {
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            background: "#0f172a",
            minHeight: "100vh",
            color: "#e2e8f0"
        },
        header: {
            background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
            borderBottom: "1px solid #1e40af",
            padding: "20px 20px 16px"
        },
        card: {
            background: "#1e293b",
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
            border: "1px solid #334155"
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14
        },
        th: {
            padding: "10px 12px",
            textAlign: "left",
            borderBottom: "1px solid #334155",
            color: "#94a3b8",
            background: "#1e293b"
        },
        td: {
            padding: "10px 12px",
            borderBottom: "1px solid #1e293b",
            color: "#e2e8f0"
        },
        badge: (color)=>({
                background: color + "22",
                border: `1px solid ${color}44`,
                borderRadius: 20,
                padding: "3px 10px",
                fontSize: 12,
                color
            }),
        btn: (active, color = "#2563eb")=>({
                background: active ? color : "#1e293b",
                border: `1px solid ${active ? color : "#334155"}`,
                color: active ? "#fff" : "#94a3b8",
                borderRadius: 20,
                padding: "6px 14px",
                cursor: "pointer",
                fontSize: 13,
                transition: "all 0.2s"
            }),
        pill: (color)=>({
                background: "#0f172a",
                border: `1px solid ${color}`,
                borderRadius: 20,
                padding: "4px 12px",
                fontSize: 13,
                color
            })
    };
    // ─── RENDER ───────────────────────────────────────────────────────────────
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: s.page,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: s.header,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        maxWidth: 960,
                        margin: "0 auto"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                marginBottom: 12,
                                flexWrap: "wrap"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: s.badge("#2563eb"),
                                    children: "2026 Job Market Data"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                    lineNumber: 372,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: s.badge("#059669"),
                                    children: "Glassdoor / ZipRecruiter / Job Boards"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                    lineNumber: 373,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                            lineNumber: 371,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            style: {
                                margin: "0 0 4px",
                                fontSize: 22,
                                fontWeight: 800,
                                color: "#f1f5f9"
                            },
                            children: "🤖 AI Career Path Analyzer"
                        }, void 0, false, {
                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                            lineNumber: 375,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                margin: 0,
                                color: "#94a3b8",
                                fontSize: 13
                            },
                            children: "Comprehensive 9-tab career analysis — personalized strategy, CV analysis & flexible timeline"
                        }, void 0, false, {
                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                            lineNumber: 378,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                    lineNumber: 370,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                lineNumber: 369,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: "#0f172a",
                    borderBottom: "1px solid #1e293b",
                    padding: "10px 20px",
                    overflowX: "auto"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "flex",
                        gap: 8,
                        maxWidth: 960,
                        margin: "0 auto",
                        flexWrap: "wrap"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                color: "#64748b",
                                fontSize: 12,
                                alignSelf: "center",
                                whiteSpace: "nowrap"
                            },
                            children: "Career path:"
                        }, void 0, false, {
                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                            lineNumber: 387,
                            columnNumber: 11
                        }, this),
                        POSITIONS.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActivePosition(p.id),
                                style: s.btn(activePosition === p.id, "#7c3aed"),
                                children: p.label
                            }, p.id, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 389,
                                columnNumber: 13
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                    lineNumber: 386,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                lineNumber: 385,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: "#0f172a",
                    borderBottom: "1px solid #1e293b",
                    overflowX: "auto"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "flex",
                        gap: 2,
                        padding: "0 20px",
                        maxWidth: 960,
                        margin: "0 auto"
                    },
                    children: TABS.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setActiveTab(t.id),
                            style: {
                                background: activeTab === t.id ? "#1e3a5f" : "transparent",
                                border: "none",
                                borderBottom: activeTab === t.id ? "2px solid #3b82f6" : "2px solid transparent",
                                color: activeTab === t.id ? "#93c5fd" : "#64748b",
                                padding: "11px 13px",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                transition: "all 0.2s"
                            },
                            children: t.label
                        }, t.id, false, {
                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                            lineNumber: 400,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                    lineNumber: 398,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                lineNumber: 397,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: 960,
                    margin: "0 auto",
                    padding: "24px 20px"
                },
                children: [
                    activeTab === "market" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    color: "#93c5fd",
                                    marginTop: 0
                                },
                                children: "📊 Job Market Analysis — AI Automation Specialist"
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 418,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    ...s.card,
                                    border: "1px solid #f59e0b44"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            color: "#fbbf24",
                                            marginTop: 0
                                        },
                                        children: "💡 Key Market Insight 2026"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 421,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            margin: 0,
                                            lineHeight: 1.8,
                                            color: "#cbd5e1"
                                        },
                                        children: [
                                            "The same job with the title ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    color: "#f87171"
                                                },
                                                children: '"Specialist"'
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 423,
                                                columnNumber: 45
                                            }, this),
                                            " pays ~",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "$76K"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 423,
                                                columnNumber: 120
                                            }, this),
                                            ", but with the title ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    color: "#4ade80"
                                                },
                                                children: '"Engineer"'
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 424,
                                                columnNumber: 36
                                            }, this),
                                            " the same work pays ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "$107–136K"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 424,
                                                columnNumber: 122
                                            }, this),
                                            ". That means your job title is worth nearly ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    color: "#fbbf24"
                                                },
                                                children: "$60,000 more"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 425,
                                                columnNumber: 59
                                            }, this),
                                            " — not your skills."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 422,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 420,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                                    gap: 14,
                                    marginBottom: 24
                                },
                                children: [
                                    {
                                        label: "AI Integration YoY Growth",
                                        val: "+178%",
                                        color: "#4ade80"
                                    },
                                    {
                                        label: "AI Automation Engineer avg (USA)",
                                        val: "$107K",
                                        color: "#60a5fa"
                                    },
                                    {
                                        label: "Glassdoor AI Automation Engineer",
                                        val: "$136K",
                                        color: "#a78bfa"
                                    },
                                    {
                                        label: "n8n Jobs in March 2026",
                                        val: "455+",
                                        color: "#fbbf24"
                                    },
                                    {
                                        label: "AI vs non-AI salary premium",
                                        val: "+56%",
                                        color: "#f87171"
                                    },
                                    {
                                        label: "Agentic AI job listing growth",
                                        val: "+985%",
                                        color: "#34d399"
                                    }
                                ].map((stat, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: "#1e293b",
                                            borderRadius: 10,
                                            padding: 16,
                                            border: `1px solid ${stat.color}33`
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 26,
                                                    fontWeight: 800,
                                                    color: stat.color
                                                },
                                                children: stat.val
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 439,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 12,
                                                    color: "#94a3b8",
                                                    marginTop: 4
                                                },
                                                children: stat.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 440,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 438,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 429,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    color: "#e2e8f0"
                                },
                                children: "Roles & Salaries (USA vs Europe)"
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 445,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    overflowX: "auto"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    style: s.table,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    "Job Title",
                                                    "USA (avg)",
                                                    "USA (top 10%)",
                                                    "Europe (mid)",
                                                    "Remote?"
                                                ].map((h, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: s.th,
                                                        children: h
                                                    }, i, false, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 449,
                                                        columnNumber: 109
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 449,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 448,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: [
                                                [
                                                    "AI Automation Specialist",
                                                    "$76K",
                                                    "$99K",
                                                    "€45–65K",
                                                    "✅ Lots"
                                                ],
                                                [
                                                    "AI Automation Engineer",
                                                    "$107K",
                                                    "$142K",
                                                    "€65–90K",
                                                    "✅ Lots"
                                                ],
                                                [
                                                    "AI & Automation Engineer (Glassdoor)",
                                                    "$136K",
                                                    "$204K",
                                                    "€70–100K",
                                                    "✅ Lots"
                                                ],
                                                [
                                                    "AI Workflow Automation Specialist",
                                                    "$95K",
                                                    "$130K",
                                                    "€60–85K",
                                                    "✅ Lots"
                                                ],
                                                [
                                                    "AI Agent Developer",
                                                    "$120K",
                                                    "$165K",
                                                    "€75–110K",
                                                    "✅ Lots"
                                                ],
                                                [
                                                    "Generative AI Consultant",
                                                    "$130K",
                                                    "$180K",
                                                    "€80–130K",
                                                    "✅ Lots"
                                                ],
                                                [
                                                    "AI Integration Specialist",
                                                    "$100K",
                                                    "$145K",
                                                    "€65–95K",
                                                    "✅ Lots"
                                                ]
                                            ].map((row, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    style: {
                                                        background: i % 2 === 0 ? "#0f1b2d" : "#0f172a"
                                                    },
                                                    children: row.map((cell, j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                ...s.td,
                                                                color: j === 0 ? "#e2e8f0" : j >= 3 ? "#4ade80" : "#93c5fd"
                                                            },
                                                            children: cell
                                                        }, j, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 463,
                                                            columnNumber: 25
                                                        }, this))
                                                }, i, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 461,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 451,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                    lineNumber: 447,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 446,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: "#64748b",
                                    fontSize: 12,
                                    marginTop: 8
                                },
                                children: "* Sources: ZipRecruiter Mar 2026, Glassdoor May 2026, DigitalDefynd, Alcor, Qubit Labs"
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 470,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                        lineNumber: 417,
                        columnNumber: 11
                    }, this),
                    activeTab === "skills" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    color: "#93c5fd",
                                    marginTop: 0
                                },
                                children: "🧠 Required Skills"
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 481,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: "#94a3b8"
                                },
                                children: "Based on analysis of hundreds of real job listings from LinkedIn, Glassdoor, ZipRecruiter and specialist AI job boards"
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 482,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    gap: 8,
                                    marginBottom: 20,
                                    flexWrap: "wrap"
                                },
                                children: skillCats.map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setSkillFilter(cat),
                                        style: s.btn(skillFilter === cat),
                                        children: cat
                                    }, cat, false, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 484,
                                        columnNumber: 37
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 483,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    overflowX: "auto"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    style: s.table,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    "Skill",
                                                    "Category",
                                                    "Demand (10)",
                                                    "In Job Ads",
                                                    "Difficulty",
                                                    "Hiring Impact"
                                                ].map((h, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: s.th,
                                                        children: h
                                                    }, i, false, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 489,
                                                        columnNumber: 120
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 489,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 488,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: filteredSkills.map((sk, i)=>{
                                                const catColors = {
                                                    Technical: "#3b82f6",
                                                    AI: "#8b5cf6",
                                                    Automation: "#10b981",
                                                    Business: "#f59e0b"
                                                };
                                                const diffLabels = [
                                                    "",
                                                    "Very Easy",
                                                    "Easy",
                                                    "Easy-Med",
                                                    "Medium",
                                                    "Med-Hard",
                                                    "Hard",
                                                    "Very Hard",
                                                    "Expert"
                                                ];
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    style: {
                                                        background: i % 2 === 0 ? "#0f1b2d" : "#0f172a"
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                ...s.td,
                                                                fontWeight: 500
                                                            },
                                                            children: sk.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 497,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: s.td,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: s.badge(catColors[sk.cat] || "#64748b"),
                                                                children: sk.cat
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 498,
                                                                columnNumber: 42
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 498,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: s.td,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 6
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            width: 60,
                                                                            height: 6,
                                                                            background: "#1e293b",
                                                                            borderRadius: 3,
                                                                            overflow: "hidden"
                                                                        },
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                width: `${sk.demand * 10}%`,
                                                                                height: "100%",
                                                                                background: sk.demand >= 9 ? "#4ade80" : sk.demand >= 7 ? "#fbbf24" : "#f87171",
                                                                                borderRadius: 3
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                            lineNumber: 502,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                        lineNumber: 501,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            color: sk.demand >= 9 ? "#4ade80" : sk.demand >= 7 ? "#fbbf24" : "#f87171",
                                                                            fontWeight: 700
                                                                        },
                                                                        children: sk.demand
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                        lineNumber: 504,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 500,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 499,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                ...s.td,
                                                                color: "#94a3b8"
                                                            },
                                                            children: sk.freq
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 507,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                ...s.td,
                                                                color: sk.diff <= 3 ? "#4ade80" : sk.diff <= 5 ? "#fbbf24" : "#f87171"
                                                            },
                                                            children: diffLabels[sk.diff]
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 508,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: s.td,
                                                            children: [
                                                                "★".repeat(Math.round(sk.hire / 2)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: "#64748b",
                                                                        fontSize: 12
                                                                    },
                                                                    children: [
                                                                        " (",
                                                                        sk.hire,
                                                                        "/10)"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                    lineNumber: 509,
                                                                    columnNumber: 79
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 509,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, i, true, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 496,
                                                    columnNumber: 23
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 491,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                    lineNumber: 487,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 486,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                        lineNumber: 480,
                        columnNumber: 11
                    }, this),
                    activeTab === "roadmap" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexWrap: "wrap",
                                    gap: 12,
                                    marginBottom: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        style: {
                                            color: "#93c5fd",
                                            margin: 0
                                        },
                                        children: "🗺️ Learning Roadmap"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 525,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            gap: 8
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setShowTimelineEditor(!showTimelineEditor),
                                                style: {
                                                    ...s.btn(showTimelineEditor, "#7c3aed"),
                                                    fontSize: 12
                                                },
                                                children: [
                                                    "⏱️ ",
                                                    showTimelineEditor ? "Hide" : "Edit",
                                                    " Timeline"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 527,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: resetTimeline,
                                                style: {
                                                    ...s.btn(false),
                                                    fontSize: 12,
                                                    color: "#f87171",
                                                    borderColor: "#f8717144"
                                                },
                                                children: "↺ Reset"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 530,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 526,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 524,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: "#94a3b8",
                                    marginTop: 4
                                },
                                children: "From zero to job-ready — realistic based on your profile"
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 535,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    ...s.card,
                                    border: "1px solid #7c3aed44",
                                    marginBottom: 20
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 20,
                                        alignItems: "center"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: 11,
                                                        color: "#64748b",
                                                        marginBottom: 2
                                                    },
                                                    children: "START DATE"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 541,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "date",
                                                    value: timeline.startDate.toISOString().split("T")[0],
                                                    onChange: (e)=>setTimeline((prev)=>({
                                                                ...prev,
                                                                startDate: new Date(e.target.value)
                                                            })),
                                                    style: {
                                                        background: "#0f172a",
                                                        border: "1px solid #334155",
                                                        borderRadius: 8,
                                                        padding: "6px 10px",
                                                        color: "#e2e8f0",
                                                        fontSize: 13
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 542,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 540,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: 11,
                                                        color: "#64748b",
                                                        marginBottom: 2
                                                    },
                                                    children: "ESTIMATED COMPLETION"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 550,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        color: "#4ade80",
                                                        fontWeight: 700,
                                                        fontSize: 15
                                                    },
                                                    children: formatDate(estimatedEnd)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 551,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 549,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: 11,
                                                        color: "#64748b",
                                                        marginBottom: 2
                                                    },
                                                    children: "TOTAL DURATION"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 554,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        color: "#fbbf24",
                                                        fontWeight: 700,
                                                        fontSize: 15
                                                    },
                                                    children: [
                                                        totalWeeks,
                                                        " weeks"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 555,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 553,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: 11,
                                                        color: "#64748b",
                                                        marginBottom: 2
                                                    },
                                                    children: "PROGRESS"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 558,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        color: "#a78bfa",
                                                        fontWeight: 700,
                                                        fontSize: 15
                                                    },
                                                    children: [
                                                        completedCount,
                                                        "/",
                                                        roadmapPhases.length,
                                                        " phases"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 559,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 557,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                flex: 1,
                                                minWidth: 120
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        height: 8,
                                                        background: "#1e293b",
                                                        borderRadius: 4,
                                                        overflow: "hidden"
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: `${completedCount / roadmapPhases.length * 100}%`,
                                                            height: "100%",
                                                            background: "linear-gradient(90deg,#7c3aed,#3b82f6)",
                                                            borderRadius: 4,
                                                            transition: "width 0.4s"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 563,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 562,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: 11,
                                                        color: "#64748b",
                                                        marginTop: 3
                                                    },
                                                    children: [
                                                        Math.round(completedCount / roadmapPhases.length * 100),
                                                        "% complete"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 565,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 561,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                    lineNumber: 539,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 538,
                                columnNumber: 13
                            }, this),
                            roadmapPhases.map((phase, i)=>{
                                const phaseStart = getPhaseStart(i);
                                const phaseEnd = getPhaseEnd(i);
                                const isCompleted = timeline.completedPhases[i];
                                const totalPhaseWeeks = phase.weeks + timeline.phaseOffsets[i];
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        ...s.card,
                                        border: `1px solid ${isCompleted ? "#4ade8044" : phase.color + "44"}`,
                                        opacity: isCompleted ? 0.75 : 1
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: 12,
                                                marginBottom: 12,
                                                flexWrap: "wrap"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        background: isCompleted ? "#4ade80" : phase.color,
                                                        borderRadius: "50%",
                                                        width: 36,
                                                        height: 36,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontWeight: 800,
                                                        fontSize: 16,
                                                        color: "#fff",
                                                        flexShrink: 0
                                                    },
                                                    children: isCompleted ? "✓" : phase.phase
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 580,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        flex: 1
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 8,
                                                                flexWrap: "wrap"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                    style: {
                                                                        margin: 0,
                                                                        color: "#e2e8f0"
                                                                    },
                                                                    children: [
                                                                        "Phase ",
                                                                        phase.phase,
                                                                        ": ",
                                                                        phase.title
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                    lineNumber: 585,
                                                                    columnNumber: 25
                                                                }, this),
                                                                timeline.phaseOffsets[i] > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: s.badge("#f59e0b"),
                                                                    children: [
                                                                        "+",
                                                                        timeline.phaseOffsets[i],
                                                                        "w extended"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                    lineNumber: 586,
                                                                    columnNumber: 58
                                                                }, this),
                                                                timeline.phaseOffsets[i] < 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: s.badge("#10b981"),
                                                                    children: [
                                                                        timeline.phaseOffsets[i],
                                                                        "w compressed"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                    lineNumber: 587,
                                                                    columnNumber: 58
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 584,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: "flex",
                                                                gap: 16,
                                                                marginTop: 4,
                                                                flexWrap: "wrap"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: phase.color,
                                                                        fontSize: 13
                                                                    },
                                                                    children: [
                                                                        "⏱️ ",
                                                                        totalPhaseWeeks,
                                                                        " weeks"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                    lineNumber: 590,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: "#64748b",
                                                                        fontSize: 13
                                                                    },
                                                                    children: [
                                                                        "📅 ",
                                                                        formatDate(phaseStart),
                                                                        " → ",
                                                                        formatDate(phaseEnd)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                    lineNumber: 591,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 589,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 583,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: "flex",
                                                        gap: 6,
                                                        flexShrink: 0
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>toggleComplete(i),
                                                        style: {
                                                            ...s.btn(isCompleted, "#4ade80"),
                                                            fontSize: 12,
                                                            padding: "4px 10px"
                                                        },
                                                        children: isCompleted ? "✓ Done" : "Mark Done"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 595,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 594,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 579,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: "grid",
                                                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                                gap: 16
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                fontSize: 12,
                                                                color: "#64748b",
                                                                marginBottom: 6,
                                                                fontWeight: 600
                                                            },
                                                            children: "TOPICS"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 603,
                                                            columnNumber: 23
                                                        }, this),
                                                        phase.topics.map((t, j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    color: "#cbd5e1",
                                                                    fontSize: 13,
                                                                    padding: "2px 0",
                                                                    display: "flex",
                                                                    gap: 6
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            color: phase.color
                                                                        },
                                                                        children: "▸"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                        lineNumber: 604,
                                                                        columnNumber: 150
                                                                    }, this),
                                                                    t
                                                                ]
                                                            }, j, true, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 604,
                                                                columnNumber: 51
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 602,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                fontSize: 12,
                                                                color: "#64748b",
                                                                marginBottom: 6,
                                                                fontWeight: 600
                                                            },
                                                            children: "FREE RESOURCES"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 607,
                                                            columnNumber: 23
                                                        }, this),
                                                        phase.free.map((t, j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    color: "#4ade80",
                                                                    fontSize: 13,
                                                                    padding: "2px 0"
                                                                },
                                                                children: [
                                                                    "✓ ",
                                                                    t
                                                                ]
                                                            }, j, true, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 608,
                                                                columnNumber: 49
                                                            }, this)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                fontSize: 12,
                                                                color: "#64748b",
                                                                marginTop: 8,
                                                                marginBottom: 6,
                                                                fontWeight: 600
                                                            },
                                                            children: "PAID RESOURCES"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 609,
                                                            columnNumber: 23
                                                        }, this),
                                                        phase.paid.map((t, j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    color: "#fbbf24",
                                                                    fontSize: 13,
                                                                    padding: "2px 0"
                                                                },
                                                                children: [
                                                                    "💲 ",
                                                                    t
                                                                ]
                                                            }, j, true, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 610,
                                                                columnNumber: 49
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 606,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 601,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 12,
                                                background: "#0f172a",
                                                borderRadius: 8,
                                                padding: 12,
                                                border: `1px solid ${phase.color}33`
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: 12,
                                                        color: phase.color,
                                                        fontWeight: 600
                                                    },
                                                    children: "🔨 Practical Exercise: "
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 615,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: 13,
                                                        color: "#94a3b8"
                                                    },
                                                    children: phase.exercise
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 616,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 614,
                                            columnNumber: 19
                                        }, this),
                                        showTimelineEditor && !isCompleted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 12,
                                                padding: 12,
                                                background: "#0f172a",
                                                borderRadius: 8,
                                                border: "1px solid #7c3aed33",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10,
                                                flexWrap: "wrap"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: 12,
                                                        color: "#a78bfa",
                                                        fontWeight: 600
                                                    },
                                                    children: "⏱️ Adjust timeline:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 622,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>postponePhase(i, 1),
                                                    style: {
                                                        ...s.btn(false),
                                                        fontSize: 12,
                                                        padding: "4px 10px",
                                                        color: "#fbbf24",
                                                        borderColor: "#fbbf2444"
                                                    },
                                                    children: "+1 week"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 623,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>postponePhase(i, 2),
                                                    style: {
                                                        ...s.btn(false),
                                                        fontSize: 12,
                                                        padding: "4px 10px",
                                                        color: "#fbbf24",
                                                        borderColor: "#fbbf2444"
                                                    },
                                                    children: "+2 weeks"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 624,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>compressPhase(i),
                                                    style: {
                                                        ...s.btn(false),
                                                        fontSize: 12,
                                                        padding: "4px 10px",
                                                        color: "#4ade80",
                                                        borderColor: "#4ade8044"
                                                    },
                                                    children: "− Compress"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 625,
                                                    columnNumber: 23
                                                }, this),
                                                timeline.phaseOffsets[i] !== 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setTimeline((prev)=>{
                                                            const o = [
                                                                ...prev.phaseOffsets
                                                            ];
                                                            o[i] = 0;
                                                            return {
                                                                ...prev,
                                                                phaseOffsets: o
                                                            };
                                                        }),
                                                    style: {
                                                        ...s.btn(false),
                                                        fontSize: 12,
                                                        padding: "4px 10px",
                                                        color: "#94a3b8"
                                                    },
                                                    children: "Reset phase"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 627,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: 12,
                                                        color: "#64748b"
                                                    },
                                                    children: [
                                                        "Current: ",
                                                        totalPhaseWeeks,
                                                        " weeks (default: ",
                                                        phase.weeks,
                                                        ")"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 629,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 621,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, i, true, {
                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                    lineNumber: 578,
                                    columnNumber: 17
                                }, this);
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                        lineNumber: 523,
                        columnNumber: 11
                    }, this),
                    activeTab === "certs" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    color: "#93c5fd",
                                    marginTop: 0
                                },
                                children: "🎓 Certification Analysis"
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 643,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    ...s.card,
                                    border: "1px solid #f59e0b44"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            color: "#fbbf24",
                                            marginTop: 0
                                        },
                                        children: "Straight answer on certifications"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 645,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            color: "#cbd5e1",
                                            margin: 0,
                                            lineHeight: 1.8
                                        },
                                        children: [
                                            "In the 2026 market: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    color: "#4ade80"
                                                },
                                                children: "Portfolio project > Certification > Degree"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 647,
                                                columnNumber: 37
                                            }, this),
                                            ". Certifications help pass ATS systems but aren't enough alone. Best combo: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    color: "#93c5fd"
                                                },
                                                children: "1 Microsoft/Google cert + 5 real projects on GitHub"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 649,
                                                columnNumber: 29
                                            }, this),
                                            "."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 646,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 644,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    overflowX: "auto"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    style: s.table,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    "Certification",
                                                    "Hiring Value",
                                                    "Cost",
                                                    "Difficulty",
                                                    "ROI",
                                                    "Recommendation"
                                                ].map((h, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: s.th,
                                                        children: h
                                                    }, i, false, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 655,
                                                        columnNumber: 119
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 655,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 654,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: certsData.map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    style: {
                                                        background: i % 2 === 0 ? "#0f1b2d" : "#0f172a"
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                ...s.td,
                                                                fontWeight: 500
                                                            },
                                                            children: c.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 660,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                ...s.td,
                                                                color: c.value.includes("Very") ? "#4ade80" : c.value === "High" ? "#60a5fa" : c.value === "Medium" ? "#fbbf24" : "#f87171"
                                                            },
                                                            children: c.value
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 661,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                ...s.td,
                                                                color: "#94a3b8"
                                                            },
                                                            children: c.cost
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 662,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                ...s.td,
                                                                color: "#94a3b8"
                                                            },
                                                            children: c.diff
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 663,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                ...s.td,
                                                                color: c.roi.includes("Very") ? "#4ade80" : c.roi === "High" ? "#60a5fa" : c.roi === "Medium" ? "#fbbf24" : "#f87171"
                                                            },
                                                            children: c.roi
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 664,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: s.td,
                                                            children: c.rec
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 665,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, i, true, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 659,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 657,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                    lineNumber: 653,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 652,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                        lineNumber: 642,
                        columnNumber: 11
                    }, this),
                    activeTab === "portfolio" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    color: "#93c5fd",
                                    marginTop: 0
                                },
                                children: "💼 Portfolio Analysis"
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 679,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    color: "#e2e8f0"
                                },
                                children: "Top 10 Projects (ranked by hiring appeal)"
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 680,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    overflowX: "auto"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    style: s.table,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    "#",
                                                    "Project",
                                                    "Difficulty",
                                                    "Tech Stack",
                                                    "Time",
                                                    "Score"
                                                ].map((h, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: s.th,
                                                        children: h
                                                    }, i, false, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 684,
                                                        columnNumber: 100
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 684,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 683,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: portfolioProjects.map((p, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    style: {
                                                        background: i % 2 === 0 ? "#0f1b2d" : "#0f172a"
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                ...s.td,
                                                                color: p.rank <= 5 ? "#4ade80" : "#94a3b8",
                                                                fontWeight: 700
                                                            },
                                                            children: p.rank
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 689,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: s.td,
                                                            children: p.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 690,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                ...s.td,
                                                                color: p.diff === "Easy" ? "#4ade80" : p.diff === "Medium" ? "#fbbf24" : "#f87171",
                                                                fontSize: 12
                                                            },
                                                            children: p.diff
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 691,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                ...s.td,
                                                                color: "#64748b",
                                                                fontSize: 12
                                                            },
                                                            children: p.tech
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 692,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                ...s.td,
                                                                color: "#94a3b8",
                                                                fontSize: 12
                                                            },
                                                            children: p.time
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 693,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: s.td,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 4
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            width: 40,
                                                                            height: 6,
                                                                            background: "#1e293b",
                                                                            borderRadius: 3,
                                                                            overflow: "hidden"
                                                                        },
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                width: `${p.score * 10}%`,
                                                                                height: "100%",
                                                                                background: p.score >= 9 ? "#4ade80" : "#fbbf24"
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                            lineNumber: 697,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                        lineNumber: 696,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            color: p.score >= 9 ? "#4ade80" : "#fbbf24",
                                                                            fontWeight: 700
                                                                        },
                                                                        children: p.score
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                        lineNumber: 699,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 695,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 694,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, i, true, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 688,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 686,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                    lineNumber: 682,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 681,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                        lineNumber: 678,
                        columnNumber: 11
                    }, this),
                    activeTab === "countries" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    color: "#93c5fd",
                                    marginTop: 0
                                },
                                children: "🌍 Best Countries for AI Automation"
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 715,
                                columnNumber: 13
                            }, this),
                            countriesData.map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        ...s.card,
                                        border: i === 0 ? "1px solid #4ade8044" : i === 1 ? "1px solid #60a5fa44" : i === 2 ? "1px solid #a78bfa44" : "1px solid #334155",
                                        display: "flex",
                                        gap: 16,
                                        flexWrap: "wrap",
                                        alignItems: "flex-start"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                background: [
                                                    " #4ade80",
                                                    "#60a5fa",
                                                    "#a78bfa",
                                                    "#fbbf24",
                                                    "#f87171",
                                                    "#34d399",
                                                    "#818cf8",
                                                    "#fb923c"
                                                ][i] || "#334155",
                                                borderRadius: "50%",
                                                width: 38,
                                                height: 38,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 800,
                                                fontSize: 16,
                                                color: "#fff",
                                                flexShrink: 0
                                            },
                                            children: c.rank
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 718,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                flex: 1,
                                                minWidth: 160
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    style: {
                                                        margin: "0 0 4px",
                                                        color: "#e2e8f0",
                                                        fontSize: 15
                                                    },
                                                    children: c.country
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 722,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    style: {
                                                        margin: 0,
                                                        color: "#94a3b8",
                                                        fontSize: 13
                                                    },
                                                    children: c.note
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 723,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 721,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: "flex",
                                                gap: 14,
                                                flexWrap: "wrap"
                                            },
                                            children: [
                                                {
                                                    label: "Salary",
                                                    val: c.salary,
                                                    color: "#4ade80"
                                                },
                                                {
                                                    label: "Demand",
                                                    val: c.vacancies,
                                                    color: "#60a5fa"
                                                },
                                                {
                                                    label: "Visa",
                                                    val: c.visa,
                                                    color: "#a78bfa"
                                                },
                                                {
                                                    label: "English",
                                                    val: c.english,
                                                    color: "#fbbf24"
                                                },
                                                {
                                                    label: "Remote",
                                                    val: c.remote,
                                                    color: "#34d399"
                                                }
                                            ].map((item, j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        textAlign: "center",
                                                        minWidth: 60
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                fontSize: 11,
                                                                color: "#64748b",
                                                                marginBottom: 2
                                                            },
                                                            children: item.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 728,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                fontSize: 12,
                                                                color: item.color,
                                                                fontWeight: 600
                                                            },
                                                            children: item.val
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 729,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, j, true, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 727,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 725,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, i, true, {
                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                    lineNumber: 717,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                        lineNumber: 714,
                        columnNumber: 11
                    }, this),
                    activeTab === "gap" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    color: "#93c5fd",
                                    marginTop: 0
                                },
                                children: "🔍 Skill Gap Analysis"
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 743,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: s.card,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            color: "#e2e8f0",
                                            marginTop: 0
                                        },
                                        children: "Sample Profile"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 745,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 8
                                        },
                                        children: [
                                            "10+ years Marketing & Advertising",
                                            "Digital Marketing",
                                            "HTML/CSS/JavaScript",
                                            "Microsoft Power Apps",
                                            "Microsoft Ecosystem",
                                            "Process Improvement (IKEA)",
                                            "Hands-on operational experience",
                                            "EU Resident"
                                        ].map((t, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: s.pill("#3b82f6"),
                                                children: t
                                            }, i, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 748,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 746,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 744,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 16,
                                    marginBottom: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            ...s.card,
                                            border: "1px solid #4ade8044"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    color: "#4ade80",
                                                    marginTop: 0
                                                },
                                                children: "💪 Strengths"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 754,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                style: {
                                                    color: "#cbd5e1",
                                                    lineHeight: 2,
                                                    paddingLeft: 16,
                                                    margin: 0
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                style: {
                                                                    color: "#4ade80"
                                                                },
                                                                children: "Power Apps/Automate:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 756,
                                                                columnNumber: 23
                                                            }, this),
                                                            " Directly maps to Microsoft automation stack"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 756,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                style: {
                                                                    color: "#4ade80"
                                                                },
                                                                children: "HTML/CSS/JS:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 757,
                                                                columnNumber: 23
                                                            }, this),
                                                            " Can make API calls, build simple UIs, understand webhooks"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 757,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                style: {
                                                                    color: "#4ade80"
                                                                },
                                                                children: "Marketing background:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 758,
                                                                columnNumber: 23
                                                            }, this),
                                                            " Domain expertise for CRM, lead automation"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 758,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                style: {
                                                                    color: "#4ade80"
                                                                },
                                                                children: "IKEA Operations:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 759,
                                                                columnNumber: 23
                                                            }, this),
                                                            " Real-world business process understanding"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 759,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                style: {
                                                                    color: "#4ade80"
                                                                },
                                                                children: "EU resident:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 760,
                                                                columnNumber: 23
                                                            }, this),
                                                            " Can legally work across the EU"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 760,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 755,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 753,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            ...s.card,
                                            border: "1px solid #f8717144"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    color: "#f87171",
                                                    marginTop: 0
                                                },
                                                children: "⚠️ Key Gaps"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 764,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                style: {
                                                    color: "#cbd5e1",
                                                    lineHeight: 2,
                                                    paddingLeft: 16,
                                                    margin: 0
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                style: {
                                                                    color: "#f87171"
                                                                },
                                                                children: "Python:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 766,
                                                                columnNumber: 23
                                                            }, this),
                                                            " 2–3 months to learn (JS helps, faster curve)"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 766,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                style: {
                                                                    color: "#f87171"
                                                                },
                                                                children: "n8n / Make.com:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 767,
                                                                columnNumber: 23
                                                            }, this),
                                                            " No hands-on production experience yet"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 767,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                style: {
                                                                    color: "#f87171"
                                                                },
                                                                children: "LLM APIs:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 768,
                                                                columnNumber: 23
                                                            }, this),
                                                            " No practical integration with OpenAI/Claude"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 768,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                style: {
                                                                    color: "#f87171"
                                                                },
                                                                children: "RAG & AI Agents:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 769,
                                                                columnNumber: 23
                                                            }, this),
                                                            " Know the concepts but no real project"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 769,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                style: {
                                                                    color: "#f87171"
                                                                },
                                                                children: "Portfolio:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 770,
                                                                columnNumber: 23
                                                            }, this),
                                                            " No AI Automation projects to show yet"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 770,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 765,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 763,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 752,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                        lineNumber: 742,
                        columnNumber: 11
                    }, this),
                    activeTab === "strategy" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    color: "#93c5fd",
                                    marginTop: 0
                                },
                                children: "🚀 Final Strategy"
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 782,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    ...s.card,
                                    background: "linear-gradient(135deg, #1e3a5f, #0f172a)",
                                    border: "1px solid #2563eb"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            color: "#fbbf24",
                                            marginTop: 0
                                        },
                                        children: "📅 Precise 6-Month Plan"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 784,
                                        columnNumber: 15
                                    }, this),
                                    [
                                        {
                                            month: "Month 1",
                                            title: "Fast Foundation",
                                            color: "#3b82f6",
                                            tasks: [
                                                "Make Academy: all 3 tracks (Foundation → Intermediate) — 2–3h daily",
                                                "Python: Automate the Boring Stuff (free) — Chapters 1–8",
                                                "Explore Power Automate AI Builder nodes",
                                                "Open n8n cloud account and build 3 simple workflows",
                                                "First project: email notification automation for a real business"
                                            ]
                                        },
                                        {
                                            month: "Month 2",
                                            title: "Build First Showcase Projects",
                                            color: "#8b5cf6",
                                            tasks: [
                                                "Go deeper with n8n: webhooks, Function nodes, error handling",
                                                "Claude API + n8n: first AI workflow — Customer Support Bot",
                                                "Invoice Processing Pipeline (n8n + Claude Vision + Google Sheets)",
                                                "GitHub: every project with README and Teardown document",
                                                "First income: find one small client (Upwork, LinkedIn, friends)"
                                            ]
                                        },
                                        {
                                            month: "Month 3",
                                            title: "Deeper AI",
                                            color: "#10b981",
                                            tasks: [
                                                "DeepLearning.AI: Prompt Engineering for Developers (free)",
                                                "Build RAG pipeline with LangChain + Pinecone",
                                                "Project: Knowledge Base Q&A from PDF documents",
                                                "Microsoft Power Automate + Copilot integration",
                                                "Upwork profile optimization — 2–3 freelance clients"
                                            ]
                                        },
                                        {
                                            month: "Month 4",
                                            title: "AI Agents & Complex Projects",
                                            color: "#f59e0b",
                                            tasks: [
                                                "LangGraph / CrewAI: Multi-agent research system",
                                                "Lead Qualification Agent for a marketing agency",
                                                "Azure AI-900: start studying — Microsoft Learn (free)",
                                                "Project: Automated weekly report generator",
                                                "Networking: LinkedIn posts about your projects"
                                            ]
                                        },
                                        {
                                            month: "Month 5",
                                            title: "Certification & Market Prep",
                                            color: "#ef4444",
                                            tasks: [
                                                "Take Azure AI-900 exam — $165 well spent",
                                                "Polish portfolio GitHub: README, Loom demos, screenshots",
                                                "LinkedIn: keyword optimization, 30 recruiter connections",
                                                "First job applications: 5–10 remote listings weekly",
                                                "Interview prep: STAR method for AI Automation scenarios"
                                            ]
                                        },
                                        {
                                            month: "Month 6",
                                            title: "Active Job Search",
                                            color: "#22d3ee",
                                            tasks: [
                                                "Apply to 5 jobs daily — target Engineer not Specialist",
                                                "Upwork: 3–5 active clients for negotiation leverage",
                                                "LinkedIn outreach: direct to hiring managers",
                                                "Salary negotiation: start with Engineer title",
                                                "Target: 1 job offer from Netherlands/Ireland/Germany (remote OK)"
                                            ]
                                        }
                                    ].map((m, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginBottom: 14,
                                                background: "#0f172a",
                                                borderRadius: 10,
                                                padding: 16,
                                                border: `1px solid ${m.color}33`
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: "flex",
                                                        gap: 10,
                                                        alignItems: "center",
                                                        marginBottom: 10
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                background: m.color,
                                                                borderRadius: 8,
                                                                padding: "4px 12px",
                                                                fontWeight: 700,
                                                                fontSize: 13,
                                                                color: "#fff",
                                                                flexShrink: 0
                                                            },
                                                            children: m.month
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 795,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            style: {
                                                                margin: 0,
                                                                color: m.color,
                                                                fontSize: 14
                                                            },
                                                            children: m.title
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 796,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 794,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                    style: {
                                                        margin: 0,
                                                        paddingLeft: 20,
                                                        color: "#cbd5e1",
                                                        lineHeight: 1.8,
                                                        fontSize: 14
                                                    },
                                                    children: m.tasks.map((t, j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: t
                                                        }, j, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 799,
                                                            columnNumber: 44
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 798,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 793,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 783,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                        lineNumber: 781,
                        columnNumber: 11
                    }, this),
                    activeTab === "cv" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    color: "#93c5fd",
                                    marginTop: 0
                                },
                                children: "📄 CV Analyzer"
                            }, void 0, false, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 812,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: "#94a3b8"
                                },
                                children: [
                                    "Paste your CV text or upload a ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: ".txt"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 814,
                                        columnNumber: 46
                                    }, this),
                                    " file. The analyzer will detect your skills, identify gaps, and generate a personalized strategy and timeline."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 813,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: s.card,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            color: "#e2e8f0",
                                            marginTop: 0
                                        },
                                        children: "Step 1 — Paste or Upload Your CV"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 818,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            gap: 10,
                                            marginBottom: 14,
                                            flexWrap: "wrap"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>fileInputRef.current?.click(),
                                                style: {
                                                    ...s.btn(false, "#7c3aed"),
                                                    color: "#a78bfa",
                                                    borderColor: "#7c3aed44"
                                                },
                                                children: "📁 Upload .txt file"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 821,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                ref: fileInputRef,
                                                type: "file",
                                                accept: ".txt,.md",
                                                onChange: handleFileUpload,
                                                style: {
                                                    display: "none"
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 824,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    setCvText("");
                                                    setCvAnalysis(null);
                                                },
                                                style: {
                                                    ...s.btn(false),
                                                    color: "#f87171",
                                                    borderColor: "#f8717144",
                                                    fontSize: 12
                                                },
                                                children: "✕ Clear"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 825,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 820,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        value: cvText,
                                        onChange: (e)=>setCvText(e.target.value),
                                        placeholder: "Paste your CV / resume text here...\n\nExample:\nJohn Smith — AI Engineer\nSkills: Python, n8n, LangChain, OpenAI API, Make.com, SQL\nExperience: 5 years software development, 2 years automation\nEducation: BSc Computer Science\n...",
                                        style: {
                                            width: "100%",
                                            minHeight: 200,
                                            background: "#0f172a",
                                            border: "1px solid #334155",
                                            borderRadius: 10,
                                            padding: 14,
                                            color: "#e2e8f0",
                                            fontSize: 13,
                                            lineHeight: 1.6,
                                            resize: "vertical",
                                            fontFamily: "inherit",
                                            boxSizing: "border-box"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 830,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 12,
                                            display: "flex",
                                            gap: 10,
                                            alignItems: "center"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: runCVAnalysis,
                                                disabled: !cvText.trim() || cvLoading,
                                                style: {
                                                    background: cvText.trim() ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "#1e293b",
                                                    border: "none",
                                                    borderRadius: 10,
                                                    padding: "10px 24px",
                                                    color: cvText.trim() ? "#fff" : "#64748b",
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    cursor: cvText.trim() ? "pointer" : "not-allowed",
                                                    transition: "all 0.2s"
                                                },
                                                children: cvLoading ? "⏳ Analyzing..." : "🔍 Analyze My CV"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 842,
                                                columnNumber: 17
                                            }, this),
                                            cvText.trim() && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 12,
                                                    color: "#64748b"
                                                },
                                                children: [
                                                    cvText.split(/\s+/).length,
                                                    " words detected"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 853,
                                                columnNumber: 35
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 841,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 817,
                                columnNumber: 13
                            }, this),
                            cvAnalysis && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            ...s.card,
                                            border: "1px solid #7c3aed44",
                                            textAlign: "center"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 13,
                                                    color: "#94a3b8",
                                                    marginBottom: 8
                                                },
                                                children: "AI AUTOMATION READINESS SCORE"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 862,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 64,
                                                    fontWeight: 900,
                                                    color: cvAnalysis.score >= 70 ? "#4ade80" : cvAnalysis.score >= 40 ? "#fbbf24" : "#f87171",
                                                    lineHeight: 1
                                                },
                                                children: [
                                                    cvAnalysis.score,
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: 24,
                                                            color: "#64748b"
                                                        },
                                                        children: "/100"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 865,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 863,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    margin: "12px auto 0",
                                                    maxWidth: 300,
                                                    height: 10,
                                                    background: "#1e293b",
                                                    borderRadius: 5,
                                                    overflow: "hidden"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        width: `${cvAnalysis.score}%`,
                                                        height: "100%",
                                                        background: cvAnalysis.score >= 70 ? "#4ade80" : cvAnalysis.score >= 40 ? "#fbbf24" : "#f87171",
                                                        borderRadius: 5,
                                                        transition: "width 0.8s"
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 868,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 867,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: 8,
                                                    fontSize: 14,
                                                    color: "#94a3b8"
                                                },
                                                children: cvAnalysis.score >= 70 ? "🚀 Strong foundation — focus on portfolio projects" : cvAnalysis.score >= 40 ? "📈 Good base — fill key gaps and build projects" : "🌱 Early stage — follow the full roadmap"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 870,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 861,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            gap: 16,
                                            marginBottom: 16
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    ...s.card,
                                                    border: "1px solid #4ade8044"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        style: {
                                                            color: "#4ade80",
                                                            marginTop: 0
                                                        },
                                                        children: "💪 Your Strengths"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 878,
                                                        columnNumber: 21
                                                    }, this),
                                                    cvAnalysis.strengths.map((str, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: "flex",
                                                                gap: 8,
                                                                marginBottom: 8,
                                                                fontSize: 13,
                                                                color: "#cbd5e1",
                                                                lineHeight: 1.5
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: "#4ade80",
                                                                        flexShrink: 0
                                                                    },
                                                                    children: "✓"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                    lineNumber: 881,
                                                                    columnNumber: 25
                                                                }, this),
                                                                " ",
                                                                str
                                                            ]
                                                        }, i, true, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 880,
                                                            columnNumber: 23
                                                        }, this)),
                                                    cvAnalysis.topSkills.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginTop: 12
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 11,
                                                                    color: "#64748b",
                                                                    marginBottom: 6
                                                                },
                                                                children: "DETECTED SKILLS"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 886,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: "flex",
                                                                    flexWrap: "wrap",
                                                                    gap: 6
                                                                },
                                                                children: cvAnalysis.topSkills.map((sk, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: s.badge("#4ade80"),
                                                                        children: sk
                                                                    }, i, false, {
                                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                        lineNumber: 888,
                                                                        columnNumber: 64
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 887,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 885,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 877,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    ...s.card,
                                                    border: "1px solid #f8717144"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        style: {
                                                            color: "#f87171",
                                                            marginTop: 0
                                                        },
                                                        children: "⚠️ Skill Gaps"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 896,
                                                        columnNumber: 21
                                                    }, this),
                                                    cvAnalysis.gaps.map((gap, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: "flex",
                                                                gap: 8,
                                                                marginBottom: 8,
                                                                fontSize: 13,
                                                                color: "#cbd5e1",
                                                                lineHeight: 1.5
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: "#f87171",
                                                                        flexShrink: 0
                                                                    },
                                                                    children: "✗"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                    lineNumber: 899,
                                                                    columnNumber: 25
                                                                }, this),
                                                                " ",
                                                                gap
                                                            ]
                                                        }, i, true, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 898,
                                                            columnNumber: 23
                                                        }, this)),
                                                    cvAnalysis.missingSkills.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginTop: 12
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 11,
                                                                    color: "#64748b",
                                                                    marginBottom: 6
                                                                },
                                                                children: "MISSING CORE SKILLS"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 904,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: "flex",
                                                                    flexWrap: "wrap",
                                                                    gap: 6
                                                                },
                                                                children: cvAnalysis.missingSkills.map((sk, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: s.badge("#f87171"),
                                                                        children: sk
                                                                    }, i, false, {
                                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                        lineNumber: 906,
                                                                        columnNumber: 68
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 905,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 903,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 895,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 875,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            ...s.card,
                                            border: "1px solid #fbbf2444"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    color: "#fbbf24",
                                                    marginTop: 0
                                                },
                                                children: "🎯 Your Personalized Strategy"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 915,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "grid",
                                                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                                    gap: 16,
                                                    marginBottom: 16
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            background: "#0f172a",
                                                            borderRadius: 10,
                                                            padding: 14
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 11,
                                                                    color: "#64748b",
                                                                    marginBottom: 4
                                                                },
                                                                children: "RECOMMENDED PATH"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 918,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 13,
                                                                    color: "#93c5fd",
                                                                    lineHeight: 1.5
                                                                },
                                                                children: cvAnalysis.recommendedPath
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 919,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 917,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            background: "#0f172a",
                                                            borderRadius: 10,
                                                            padding: 14
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 11,
                                                                    color: "#64748b",
                                                                    marginBottom: 4
                                                                },
                                                                children: "TIME TO FIRST JOB OFFER"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 922,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 20,
                                                                    fontWeight: 800,
                                                                    color: "#4ade80"
                                                                },
                                                                children: cvAnalysis.timeEstimate
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                                lineNumber: 923,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                        lineNumber: 921,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 916,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 12,
                                                    color: "#64748b",
                                                    marginBottom: 8,
                                                    fontWeight: 600
                                                },
                                                children: "PRIORITY ACTIONS (do these first):"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                lineNumber: 926,
                                                columnNumber: 19
                                            }, this),
                                            cvAnalysis.priorityActions.map((action, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: "flex",
                                                        gap: 10,
                                                        marginBottom: 10,
                                                        background: "#0f172a",
                                                        borderRadius: 8,
                                                        padding: 12,
                                                        fontSize: 13,
                                                        color: "#cbd5e1",
                                                        lineHeight: 1.5
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                background: "#fbbf24",
                                                                color: "#0f172a",
                                                                borderRadius: "50%",
                                                                width: 20,
                                                                height: 20,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                fontWeight: 800,
                                                                fontSize: 11,
                                                                flexShrink: 0
                                                            },
                                                            children: i + 1
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                            lineNumber: 929,
                                                            columnNumber: 23
                                                        }, this),
                                                        action
                                                    ]
                                                }, i, true, {
                                                    fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                                    lineNumber: 928,
                                                    columnNumber: 21
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 914,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            textAlign: "center",
                                            padding: "20px 0"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setActiveTab("roadmap"),
                                            style: {
                                                background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                                                border: "none",
                                                borderRadius: 12,
                                                padding: "12px 32px",
                                                color: "#fff",
                                                fontSize: 15,
                                                fontWeight: 700,
                                                cursor: "pointer"
                                            },
                                            children: "View Your Personalized Roadmap →"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                            lineNumber: 937,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                        lineNumber: 936,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                                lineNumber: 859,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/career/CareerDashboard.tsx",
                        lineNumber: 811,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                lineNumber: 411,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    textAlign: "center",
                    padding: "16px",
                    color: "#334155",
                    fontSize: 11,
                    borderTop: "1px solid #1e293b"
                },
                children: "Sources: ZipRecruiter, Glassdoor, Second Talent, AINative.careers, DigitalDefynd, Alcor, Qubit Labs, Microsoft Learn | Data: June 2026"
            }, void 0, false, {
                fileName: "[project]/src/components/career/CareerDashboard.tsx",
                lineNumber: 948,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/career/CareerDashboard.tsx",
        lineNumber: 366,
        columnNumber: 5
    }, this);
}
_s(CareerDashboard, "MsYVgA/W+cNCQfzEixlb02ii1cA=");
_c = CareerDashboard;
var _c;
__turbopack_context__.k.register(_c, "CareerDashboard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_career_CareerDashboard_tsx_178ntba._.js.map