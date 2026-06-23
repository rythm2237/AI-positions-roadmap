module.exports = [
"[project]/src/data/careerRoadmaps.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "aiAutomationRoadmapPreview",
    ()=>aiAutomationRoadmapPreview,
    "careerPositions",
    ()=>careerPositions,
    "pricingPlans",
    ()=>pricingPlans
]);
const careerPositions = [
    {
        id: "ai-automation-specialist",
        title: "AI Automation Specialist",
        description: "Build automated workflows using AI tools, APIs, no-code platforms, and business process logic.",
        level: "Beginner to Intermediate",
        duration: "12 weeks",
        category: "Automation",
        keySkills: [
            "Workflow automation",
            "API basics",
            "AI tools",
            "Process design"
        ],
        status: "mvp-ready"
    },
    {
        id: "prompt-engineer",
        title: "Prompt Engineer",
        description: "Design, evaluate, and manage reliable prompts for language-model applications.",
        level: "Beginner to Intermediate",
        duration: "12 weeks",
        category: "Prompting",
        keySkills: [
            "Prompt design",
            "Evaluation",
            "Structured output",
            "Red-teaming"
        ],
        status: "mvp-ready"
    },
    {
        id: "ai-data-analyst",
        title: "AI Data Analyst",
        description: "Use statistics, SQL, Python, dashboards, and AI-assisted analysis to turn data into decisions.",
        level: "Beginner to Intermediate",
        duration: "12 weeks",
        category: "Data",
        keySkills: [
            "SQL",
            "Python",
            "Dashboards",
            "AI analysis"
        ],
        status: "mvp-ready"
    },
    {
        id: "ai-content-creator",
        title: "AI Content Creator",
        description: "Create SEO-informed articles, social content, newsletters, and scripts with AI.",
        level: "Beginner",
        duration: "12 weeks",
        category: "Content",
        keySkills: [
            "AI writing",
            "SEO",
            "Social content",
            "Video scripting"
        ],
        status: "mvp-ready"
    },
    {
        id: "ml-engineer",
        title: "Machine Learning Engineer",
        description: "Build, evaluate, deploy, and monitor machine-learning models with Python and MLOps.",
        level: "Intermediate",
        duration: "12 weeks",
        category: "Machine Learning",
        keySkills: [
            "Python",
            "scikit-learn",
            "PyTorch",
            "MLOps"
        ],
        status: "mvp-ready"
    },
    {
        id: "ai-product-manager",
        title: "AI Product Manager",
        description: "Lead AI products from discovery to roadmap, metrics, launch, and responsible operation.",
        level: "Beginner to Intermediate",
        duration: "12 weeks",
        category: "Product",
        keySkills: [
            "AI strategy",
            "Roadmaps",
            "Metrics",
            "Stakeholders"
        ],
        status: "mvp-ready"
    },
    {
        id: "ai-ux-designer",
        title: "AI UX Designer",
        description: "Design AI-assisted experiences that are understandable, controllable, ethical, and useful.",
        level: "Beginner to Intermediate",
        duration: "12 weeks",
        category: "Design",
        keySkills: [
            "AI UX",
            "Figma AI",
            "Trust design",
            "Research"
        ],
        status: "mvp-ready"
    },
    {
        id: "llm-app-developer",
        title: "LLM Application Developer",
        description: "Build retrieval, tool-use, structured-output, and production-ready LLM applications.",
        level: "Intermediate",
        duration: "12 weeks",
        category: "Development",
        keySkills: [
            "LangChain",
            "RAG",
            "Vector DBs",
            "LLM apps"
        ],
        status: "mvp-ready"
    },
    {
        id: "ai-ethics-specialist",
        title: "AI Ethics & Governance Specialist",
        description: "Assess AI systems for risk, bias, policy compliance, transparency, and responsible deployment.",
        level: "Intermediate",
        duration: "12 weeks",
        category: "Governance",
        keySkills: [
            "AI policy",
            "Bias audits",
            "EU AI Act",
            "Risk reviews"
        ],
        status: "mvp-ready"
    },
    {
        id: "ai-sales-marketing",
        title: "AI Sales & Marketing Specialist",
        description: "Use AI to improve CRM workflows, personalization, campaign creation, and sales forecasting.",
        level: "Beginner to Intermediate",
        duration: "12 weeks",
        category: "Sales & Marketing",
        keySkills: [
            "AI CRM",
            "Personalization",
            "Campaigns",
            "Forecasting"
        ],
        status: "mvp-ready"
    }
];
const aiAutomationRoadmapPreview = [
    {
        phaseNumber: 1,
        title: "AI Foundations",
        explanation: "Understand what AI is, how modern AI tools work, and how they fit into real business workflows. No prior experience needed.",
        access: "free"
    },
    {
        phaseNumber: 2,
        title: "Automation Tools",
        explanation: "Get hands-on with the most important automation platforms: Make, Zapier, n8n, and AI-native tools that connect your stack.",
        access: "locked"
    },
    {
        phaseNumber: 3,
        title: "Workflow Design",
        explanation: "Learn how to map, design, and document automated workflows that solve real business problems end-to-end.",
        access: "locked"
    },
    {
        phaseNumber: 4,
        title: "API & Integration Basics",
        explanation: "Understand APIs, webhooks, and how to connect external services to build powerful multi-step automations.",
        access: "locked"
    },
    {
        phaseNumber: 5,
        title: "Portfolio Projects",
        explanation: "Build 3 real-world automation projects you can showcase to clients or employers to prove your skills.",
        access: "locked"
    }
];
const pricingPlans = [
    {
        id: "free",
        name: "Free Preview",
        pricingLabel: "Free",
        features: [
            "Browse all career roles",
            "Preview roadmap structure",
            "Access Phase 1 of any roadmap",
            "Limited progress tracking"
        ],
        highlighted: false,
        ctaLabel: "Get Started Free"
    },
    {
        id: "single",
        name: "Single Roadmap Access",
        pricingLabel: "Pricing to be announced",
        features: [
            "Unlock one complete roadmap",
            "Full lessons and projects",
            "Quizzes and personal notes",
            "Full progress tracking"
        ],
        highlighted: true,
        ctaLabel: "Join Waitlist"
    },
    {
        id: "all-access",
        name: "All Access",
        pricingLabel: "Pricing to be announced",
        features: [
            "Access all current and future roadmaps",
            "Advanced progress dashboard",
            "AI feedback features (coming soon)",
            "Best for serious learners"
        ],
        highlighted: false,
        ctaLabel: "Join Waitlist"
    }
];
}),
"[project]/src/components/landing/WaitlistSection.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WaitlistSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
// src/components/landing/WaitlistSection.tsx
// Client component — real API call to /api/waitlist → Supabase + Resend.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$careerRoadmaps$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/careerRoadmaps.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function WaitlistSection() {
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [interest, setInterest] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [formState, setFormState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [errorMsg, setErrorMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    async function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;
        setFormState("submitting");
        setErrorMsg("");
        try {
            const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    interest
                })
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.error ?? "Something went wrong. Please try again.");
                setFormState("error");
                return;
            }
            setFormState("success");
        } catch  {
            setErrorMsg("Network error. Please check your connection and try again.");
            setFormState("error");
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        id: "waitlist",
        className: "bg-indigo-600 px-4 py-20 sm:px-6 lg:px-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-2xl text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-3xl font-extrabold text-white sm:text-4xl",
                    children: "Be the first to access the AI career roadmap platform."
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                    lineNumber: 51,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mx-auto mt-4 max-w-lg text-base text-indigo-200",
                    children: "Join the early access waitlist and get notified the moment your chosen roadmap goes live — plus early-bird pricing when we launch."
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                    lineNumber: 54,
                    columnNumber: 9
                }, this),
                formState === "success" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    role: "alert",
                    className: "mt-10 rounded-2xl bg-white/10 px-8 py-8 text-center backdrop-blur-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-3 flex justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                xmlns: "http://www.w3.org/2000/svg",
                                className: "h-10 w-10 text-emerald-300",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                "aria-hidden": "true",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M22 11.08V12a10 10 0 1 1-5.93-9.14"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                                        lineNumber: 77,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                        points: "22 4 12 14.01 9 11.01"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                                        lineNumber: 78,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                                lineNumber: 66,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                            lineNumber: 65,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xl font-bold text-white",
                            children: "Thanks! You're on the early access list."
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                            lineNumber: 81,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-2 text-sm text-indigo-200",
                            children: "Check your inbox — we've sent you a confirmation email."
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                            lineNumber: 84,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                    lineNumber: 61,
                    columnNumber: 11
                }, this) : /* ── Form ── */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "mt-10 flex flex-col gap-4 text-left",
                    noValidate: true,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "waitlist-name",
                                    className: "mb-1.5 block text-sm font-medium text-indigo-100",
                                    children: "Your name"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                                    lineNumber: 97,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    id: "waitlist-name",
                                    type: "text",
                                    required: true,
                                    autoComplete: "name",
                                    placeholder: "Jane Smith",
                                    value: name,
                                    onChange: (e)=>setName(e.target.value),
                                    className: "w-full rounded-xl border border-indigo-400 bg-white/10 px-4 py-3 text-sm text-white placeholder-indigo-300 backdrop-blur-sm transition focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                                    lineNumber: 103,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                            lineNumber: 96,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "waitlist-email",
                                    className: "mb-1.5 block text-sm font-medium text-indigo-100",
                                    children: "Email address"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                                    lineNumber: 117,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    id: "waitlist-email",
                                    type: "email",
                                    required: true,
                                    autoComplete: "email",
                                    placeholder: "jane@example.com",
                                    value: email,
                                    onChange: (e)=>setEmail(e.target.value),
                                    className: "w-full rounded-xl border border-indigo-400 bg-white/10 px-4 py-3 text-sm text-white placeholder-indigo-300 backdrop-blur-sm transition focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                                    lineNumber: 123,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                            lineNumber: 116,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "waitlist-interest",
                                    className: "mb-1.5 block text-sm font-medium text-indigo-100",
                                    children: "I'm most interested in"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                                    lineNumber: 137,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    id: "waitlist-interest",
                                    value: interest,
                                    onChange: (e)=>setInterest(e.target.value),
                                    className: "w-full rounded-xl border border-indigo-400 bg-indigo-700 px-4 py-3 text-sm text-white backdrop-blur-sm transition focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: "Select a career path…"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                                            lineNumber: 149,
                                            columnNumber: 17
                                        }, this),
                                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$careerRoadmaps$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["careerPositions"].map((pos)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: pos.id,
                                                children: pos.title
                                            }, pos.id, false, {
                                                fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                                                lineNumber: 151,
                                                columnNumber: 19
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                                    lineNumber: 143,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                            lineNumber: 136,
                            columnNumber: 13
                        }, this),
                        formState === "error" && errorMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            role: "alert",
                            className: "rounded-xl bg-red-500/20 px-4 py-3 text-sm text-red-200 border border-red-400/30",
                            children: [
                                "⚠️ ",
                                errorMsg
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                            lineNumber: 160,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            disabled: formState === "submitting",
                            className: "mt-2 w-full rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-600 shadow-md transition-colors hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed",
                            children: formState === "submitting" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center justify-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "h-4 w-4 animate-spin",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        "aria-hidden": "true",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                className: "opacity-25",
                                                cx: "12",
                                                cy: "12",
                                                r: "10",
                                                stroke: "currentColor",
                                                strokeWidth: "4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                                                lineNumber: 182,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                className: "opacity-75",
                                                fill: "currentColor",
                                                d: "M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                                                lineNumber: 190,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                                        lineNumber: 176,
                                        columnNumber: 19
                                    }, this),
                                    "Joining…"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                                lineNumber: 175,
                                columnNumber: 17
                            }, this) : "Join Waitlist"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                            lineNumber: 169,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-center text-xs text-indigo-300",
                            children: "No spam. Unsubscribe any time."
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                            lineNumber: 203,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/landing/WaitlistSection.tsx",
                    lineNumber: 90,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/landing/WaitlistSection.tsx",
            lineNumber: 49,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/landing/WaitlistSection.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_01923z8._.js.map