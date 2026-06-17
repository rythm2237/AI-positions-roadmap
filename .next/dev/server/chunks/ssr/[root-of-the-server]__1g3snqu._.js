module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/data/roadmaps.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/data/roadmaps.ts
// Static roadmap data for all 10 AI career positions.
// Edit this file to update roadmap content.
// Designed to be replaced with Supabase/API calls later.
__turbopack_context__.s([
    "allRoadmaps",
    ()=>allRoadmaps,
    "getAllSlugs",
    ()=>getAllSlugs,
    "getRoadmapBySlug",
    ()=>getRoadmapBySlug
]);
// ─── Helper: build a 2-question section test ─────────────────────────────────
function sectionTest(id, title, q1, o1, a1, e1, q2, o2, a2, e2) {
    return {
        id,
        title,
        questions: [
            {
                id: `${id}-q1`,
                question: q1,
                options: o1,
                correctAnswerIndex: a1,
                explanation: e1
            },
            {
                id: `${id}-q2`,
                question: q2,
                options: o2,
                correctAnswerIndex: a2,
                explanation: e2
            }
        ]
    };
}
// ─── Helper: build a 5-question phase final test ─────────────────────────────
function phaseTest(phaseId, title) {
    return {
        id: `${phaseId}-final`,
        title,
        questions: [
            {
                id: `${phaseId}-fq1`,
                question: "What is the primary goal of this phase?",
                options: [
                    "To memorise definitions",
                    "To apply concepts to real workflows",
                    "To read about AI history",
                    "To install software only"
                ],
                correctAnswerIndex: 1,
                explanation: "The goal is always practical application — understanding concepts so you can use them in real work."
            },
            {
                id: `${phaseId}-fq2`,
                question: "Which approach leads to the best learning outcome?",
                options: [
                    "Passive reading only",
                    "Watching videos without practice",
                    "Active practice and reflection",
                    "Skipping difficult sections"
                ],
                correctAnswerIndex: 2,
                explanation: "Active practice combined with reflection produces the deepest, most durable learning."
            },
            {
                id: `${phaseId}-fq3`,
                question: "How should you handle errors or mistakes in your work?",
                options: [
                    "Ignore them",
                    "Start over completely",
                    "Analyse and learn from them",
                    "Ask someone else to fix them"
                ],
                correctAnswerIndex: 2,
                explanation: "Mistakes are learning opportunities. Analysing what went wrong builds stronger understanding."
            },
            {
                id: `${phaseId}-fq4`,
                question: "What is the best way to demonstrate mastery of a phase?",
                options: [
                    "Completing the final test only",
                    "Building a real project and passing the test",
                    "Reading all materials twice",
                    "Watching all videos"
                ],
                correctAnswerIndex: 1,
                explanation: "Combining a real project with the final test proves both practical skill and conceptual understanding."
            },
            {
                id: `${phaseId}-fq5`,
                question: "When should you move to the next phase?",
                options: [
                    "Immediately after opening this phase",
                    "Only after memorising everything",
                    "After completing sections and feeling confident in the outcomes",
                    "After 7 days regardless of progress"
                ],
                correctAnswerIndex: 2,
                explanation: "Move forward when you have completed the sections and can clearly explain the phase outcomes in your own words."
            }
        ]
    };
}
// ─── Helper: build a lightweight section ─────────────────────────────────────
function lightSection(id, title, description, time, difficulty, types) {
    return {
        id,
        title,
        description,
        estimatedTime: time,
        difficulty,
        learningTypes: types,
        resources: [
            {
                label: `Read: ${title} Guide`,
                type: "article",
                url: "#"
            },
            {
                label: `Watch: ${title} Overview`,
                type: "video",
                url: "#"
            }
        ],
        test: sectionTest(`${id}-test`, `${title} Quiz`, "What is the most important outcome of this section?", [
            "Memorising all terminology",
            "Being able to apply the concept in a real scenario",
            "Completing the reading as fast as possible",
            "Watching all videos twice"
        ], 1, "Application is always the primary goal. Understanding concepts without applying them has little practical value.", "How do you know you have truly understood this topic?", [
            "You can recite the definition",
            "You passed the quiz",
            "You can explain it in plain language and apply it to a new situation",
            "You read the material three times"
        ], 2, "True understanding means you can explain the concept simply and transfer it to new contexts — not just recall definitions.")
    };
}
// ─── Helper: build a lightweight phase ───────────────────────────────────────
function lightPhase(id, phaseNumber, title, description, outcome, estimatedDuration, weekRange, access, sectionDefs) {
    return {
        id,
        phaseNumber,
        title,
        description,
        estimatedDuration,
        weekRange,
        outcome,
        access,
        sections: sectionDefs.map((s)=>lightSection(s.id, s.title, s.desc, s.time, s.diff, s.types)),
        finalTest: phaseTest(id, `Phase ${phaseNumber} Final Test: ${title}`)
    };
}
// ─── Helper: build a lightweight project ─────────────────────────────────────
function lightProject(id, title, scenario, skills, deliverables, time, difficulty, relatedPhaseId) {
    return {
        id,
        title,
        scenario,
        skills,
        deliverables,
        estimatedTime: time,
        difficulty,
        relatedPhaseId
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// 1. AI AUTOMATION SPECIALIST — FULL MVP ROADMAP
// ═══════════════════════════════════════════════════════════════════════════════
const aiAutomationSpecialist = {
    id: "1",
    slug: "ai-automation-specialist",
    title: "AI Automation Specialist",
    description: "Build automated workflows using AI tools, APIs, no-code platforms, and business process logic. Become the person every team needs.",
    category: "Automation",
    level: "Beginner to Intermediate",
    duration: "12 weeks",
    status: "mvp-ready",
    totalEstimatedHours: 60,
    phases: [
        // ── Phase 1: AI Foundations ──────────────────────────────────────────────
        {
            id: "p1",
            phaseNumber: 1,
            title: "AI Foundations",
            description: "Understand what AI is, how modern AI tools work, and how they fit into real business workflows. No prior experience needed.",
            estimatedDuration: "2 weeks",
            weekRange: "Week 1–2",
            outcome: "You can explain AI capabilities, write effective prompts, and identify AI opportunities in business workflows.",
            access: "free",
            sections: [
                {
                    id: "p1-s1",
                    title: "What AI Can and Cannot Do",
                    description: "A grounded, practical overview of AI capabilities and limitations so you don't over-promise or under-use AI in real projects.",
                    estimatedTime: "25 min",
                    difficulty: "Beginner",
                    learningTypes: [
                        "Reading",
                        "Video"
                    ],
                    resources: [
                        {
                            label: "Read: AI Capabilities Overview",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Watch: AI in the Real World",
                            type: "video",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p1-s1-test", "AI Capabilities Quiz", "Which of the following is something AI is NOT reliably good at?", [
                        "Generating text drafts",
                        "Recognising patterns in data",
                        "Making ethical judgements autonomously",
                        "Summarising documents"
                    ], 2, "AI lacks genuine ethical reasoning. It can process patterns but cannot make moral decisions the way humans do.", "What is a key limitation of large language models today?", [
                        "They cannot generate text",
                        "They sometimes produce confident but incorrect information",
                        "They require no training data",
                        "They understand context perfectly"
                    ], 1, "LLMs can 'hallucinate' — producing plausible-sounding but factually wrong outputs. Always verify important outputs.")
                },
                {
                    id: "p1-s2",
                    title: "Prompting Basics",
                    description: "Learn the fundamentals of prompt engineering — how to give AI clear, structured instructions to get useful, reliable outputs.",
                    estimatedTime: "30 min",
                    difficulty: "Beginner",
                    learningTypes: [
                        "Reading",
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Read: Prompt Engineering Guide",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Practice: Write 5 prompts",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p1-s2-test", "Prompting Quiz", "What makes a prompt more effective?", [
                        "Being as short as possible",
                        "Providing context, role, and clear output format",
                        "Using technical jargon",
                        "Asking multiple unrelated questions at once"
                    ], 1, "Effective prompts give the AI a clear role, relevant context, and a specific expected output format.", "What is 'few-shot prompting'?", [
                        "Asking the AI only one question",
                        "Providing examples of the desired output inside the prompt",
                        "Using very short prompts",
                        "Prompting without any context"
                    ], 1, "Few-shot prompting means giving the model 2–3 examples of the output you want, which dramatically improves consistency.")
                },
                {
                    id: "p1-s3",
                    title: "AI Tools Overview",
                    description: "Survey the most important AI tools available today — ChatGPT, Claude, Gemini, Perplexity, and specialist tools — and understand when to use each.",
                    estimatedTime: "20 min",
                    difficulty: "Beginner",
                    learningTypes: [
                        "Reading",
                        "Video"
                    ],
                    resources: [
                        {
                            label: "Read: AI Tools Comparison",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Watch: Top AI Tools for 2026",
                            type: "video",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p1-s3-test", "AI Tools Quiz", "Which AI tool is best known for real-time web search integration?", [
                        "ChatGPT (standard)",
                        "Midjourney",
                        "Perplexity AI",
                        "Stable Diffusion"
                    ], 2, "Perplexity AI specialises in search-augmented answers with citations, making it ideal for research tasks.", "What does 'multimodal AI' mean?", [
                        "AI that only processes text",
                        "AI that can process multiple types of input such as text, images, and audio",
                        "AI built by multiple companies",
                        "AI with multiple personalities"
                    ], 1, "Multimodal AI can handle different data types — text, images, audio, video — in a single model.")
                },
                {
                    id: "p1-s4",
                    title: "Practical AI Use Cases",
                    description: "Explore 10 real-world business use cases where AI automation creates immediate value — from email drafting to data extraction.",
                    estimatedTime: "25 min",
                    difficulty: "Beginner",
                    learningTypes: [
                        "Reading",
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Read: 10 Business AI Use Cases",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Practice: Identify use cases in your context",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p1-s4-test", "Use Cases Quiz", "Which of these is a strong AI automation use case?", [
                        "Replacing all human employees",
                        "Automatically categorising and routing customer support emails",
                        "Making all business decisions",
                        "Eliminating the need for strategy"
                    ], 1, "Email categorisation and routing is a well-proven, high-value AI automation use case that saves significant manual time.", "What is the best first step when identifying an AI use case?", [
                        "Buy the most expensive AI tool",
                        "Find a repetitive, rule-based task that consumes significant human time",
                        "Automate the most complex process first",
                        "Hire a data scientist immediately"
                    ], 1, "Start with repetitive, high-volume, rule-based tasks — they offer the clearest ROI and lowest risk for AI automation.")
                },
                {
                    id: "p1-s5",
                    title: "Mini Practice: Write Effective Prompts",
                    description: "Hands-on practice session — write prompts for 5 real business scenarios and evaluate the AI outputs. Build your prompting instinct.",
                    estimatedTime: "35 min",
                    difficulty: "Beginner",
                    learningTypes: [
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Open: Prompt Practice Worksheet",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p1-s5-test", "Practice Reflection", "After writing prompts for real scenarios, what did you notice most?", [
                        "AI always gives perfect answers",
                        "Specificity and context dramatically improve output quality",
                        "Shorter prompts always work better",
                        "AI tools all produce identical results"
                    ], 1, "Specificity is the single biggest lever in prompt quality. The more context and structure you provide, the better the output.", "What should you do when an AI output is not quite right?", [
                        "Accept it as-is",
                        "Abandon the task",
                        "Refine the prompt and iterate",
                        "Switch to a different tool immediately"
                    ], 2, "Prompting is iterative. Refine your instructions based on what the AI produced — this is a core skill of AI automation.")
                }
            ],
            finalTest: phaseTest("p1", "Phase 1 Final Test: AI Foundations")
        },
        // ── Phase 2: Automation Tools ────────────────────────────────────────────
        {
            id: "p2",
            phaseNumber: 2,
            title: "Automation Tools",
            description: "Get hands-on with the most important automation platforms: Make, Zapier, n8n, and AI-native tools that connect your stack.",
            estimatedDuration: "2 weeks",
            weekRange: "Week 3–4",
            outcome: "You can build basic automations in Make and Zapier, understand trigger-action logic, and connect common business tools.",
            access: "locked",
            sections: [
                {
                    id: "p2-s1",
                    title: "Introduction to Automation",
                    description: "Understand what workflow automation is, why it matters, and how it differs from AI. Build your mental model before touching any tool.",
                    estimatedTime: "20 min",
                    difficulty: "Beginner",
                    learningTypes: [
                        "Reading",
                        "Video"
                    ],
                    resources: [
                        {
                            label: "Read: Automation Fundamentals",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Watch: What is Workflow Automation?",
                            type: "video",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p2-s1-test", "Automation Intro Quiz", "What is the core principle of workflow automation?", [
                        "Replacing all human work",
                        "Triggering a sequence of actions automatically based on defined conditions",
                        "Writing code for every task",
                        "Using AI for everything"
                    ], 1, "Automation works on trigger-action logic: when X happens, do Y. This principle underlies all automation tools.", "What type of task is best suited for automation?", [
                        "Tasks requiring human creativity and empathy",
                        "One-off, highly complex decisions",
                        "Repetitive, rule-based tasks with consistent inputs",
                        "Tasks that change completely every time"
                    ], 2, "Repetitive, rule-based tasks with predictable inputs are the sweet spot for automation — they save the most time with the least risk.")
                },
                {
                    id: "p2-s2",
                    title: "Zapier Basics",
                    description: "Learn Zapier's interface, build your first Zap, understand triggers and actions, and connect two business apps without code.",
                    estimatedTime: "40 min",
                    difficulty: "Beginner",
                    learningTypes: [
                        "Video",
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Watch: Zapier Getting Started",
                            type: "video",
                            url: "#"
                        },
                        {
                            label: "Practice: Build your first Zap",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p2-s2-test", "Zapier Quiz", "In Zapier, what starts a Zap running?", [
                        "An action",
                        "A trigger",
                        "A filter",
                        "A formatter"
                    ], 1, "A trigger is the event that starts the Zap — for example, 'new email received' or 'new row added to spreadsheet'.", "What is a Zap 'filter' used for?", [
                        "To format data",
                        "To stop the Zap from running unless specific conditions are met",
                        "To connect two apps",
                        "To send notifications"
                    ], 1, "Filters let you add conditions — the Zap only continues if the filter conditions are true, preventing unwanted actions.")
                },
                {
                    id: "p2-s3",
                    title: "Make (Integromat) Basics",
                    description: "Explore Make's visual scenario builder — a more powerful and flexible alternative to Zapier for complex multi-step automations.",
                    estimatedTime: "45 min",
                    difficulty: "Beginner",
                    learningTypes: [
                        "Video",
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Watch: Make Scenario Builder Tour",
                            type: "video",
                            url: "#"
                        },
                        {
                            label: "Practice: Build your first scenario",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p2-s3-test", "Make Basics Quiz", "What is a 'scenario' in Make?", [
                        "A business plan",
                        "A visual automation workflow connecting multiple apps and actions",
                        "A type of report",
                        "A pricing plan"
                    ], 1, "A scenario in Make is a visual workflow — a series of connected modules that process data and trigger actions across apps.", "What advantage does Make have over simpler tools like Zapier?", [
                        "It is always cheaper",
                        "It only works with Google apps",
                        "It supports more complex logic, loops, error handling, and data transformations",
                        "It requires less setup"
                    ], 2, "Make supports advanced features like iterators, aggregators, routers, and custom error handling — making it ideal for complex workflows.")
                },
                {
                    id: "p2-s4",
                    title: "Airtable & Notion as Simple Databases",
                    description: "Use Airtable and Notion as lightweight databases that power your automations — storing, retrieving, and updating data without SQL.",
                    estimatedTime: "30 min",
                    difficulty: "Beginner",
                    learningTypes: [
                        "Reading",
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Read: Airtable for Automation",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Practice: Set up a simple Airtable base",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p2-s4-test", "Database Tools Quiz", "Why is Airtable useful in automation workflows?", [
                        "It replaces all databases",
                        "It provides a structured, API-connected data store that automations can read from and write to",
                        "It is only for spreadsheets",
                        "It requires coding to use"
                    ], 1, "Airtable acts as a no-code database with a built-in API, making it easy to store and retrieve data inside automation workflows.", "What is a 'view' in Airtable?", [
                        "A type of chart",
                        "A filtered and formatted display of your data without changing the underlying records",
                        "A user account",
                        "An automation trigger"
                    ], 1, "Views let you see the same data in different ways — filtered, sorted, or grouped — without modifying the actual records.")
                },
                {
                    id: "p2-s5",
                    title: "Trigger-Action Logic",
                    description: "Master the mental model behind all automation — triggers, conditions, actions, and data mapping. Build this thinking into your instinct.",
                    estimatedTime: "25 min",
                    difficulty: "Beginner",
                    learningTypes: [
                        "Reading",
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Read: Trigger-Action Design Patterns",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Practice: Map 3 real workflows",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p2-s5-test", "Trigger-Action Quiz", "What is 'data mapping' in an automation?", [
                        "Drawing a map of your office",
                        "Connecting output data from one step to the input fields of the next step",
                        "Organising files on your computer",
                        "Creating a visual chart"
                    ], 1, "Data mapping means taking the output from one step — like a customer name — and placing it into the right field in the next step.", "What should you do before building an automation in a tool?", [
                        "Start clicking immediately",
                        "Map out the trigger, conditions, and actions on paper or a diagram first",
                        "Buy a subscription",
                        "Ask the AI to build it automatically"
                    ], 1, "Planning before building saves enormous time. Sketch the trigger, conditions, and actions before touching the tool.")
                }
            ],
            finalTest: phaseTest("p2", "Phase 2 Final Test: Automation Tools")
        },
        // ── Phase 3: Workflow Design ─────────────────────────────────────────────
        {
            id: "p3",
            phaseNumber: 3,
            title: "Workflow Design",
            description: "Learn to map, design, and document business processes. Turn messy manual work into clean, reliable automated workflows.",
            estimatedDuration: "2 weeks",
            weekRange: "Week 5–6",
            outcome: "You can map any business process, design a clean automated workflow, handle errors, and document it professionally.",
            access: "locked",
            sections: [
                {
                    id: "p3-s1",
                    title: "Mapping a Business Process",
                    description: "Learn process mapping techniques — swimlane diagrams, flowcharts, and simple text maps — to understand and communicate workflows clearly.",
                    estimatedTime: "30 min",
                    difficulty: "Beginner",
                    learningTypes: [
                        "Reading",
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Read: Process Mapping Guide",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Practice: Map a process you know",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p3-s1-test", "Process Mapping Quiz", "What is the main purpose of process mapping?", [
                        "To create pretty diagrams",
                        "To make processes visible so they can be understood, improved, and automated",
                        "To replace all documentation",
                        "To slow down projects"
                    ], 1, "Process mapping makes invisible work visible — you can't improve or automate what you can't clearly see and describe.", "What does a 'swimlane diagram' show?", [
                        "A swimming pool layout",
                        "Which person or system is responsible for each step in a process",
                        "Only the start and end of a process",
                        "Financial data"
                    ], 1, "Swimlane diagrams show who does what — each lane represents a person, team, or system, making responsibility clear.")
                },
                {
                    id: "p3-s2",
                    title: "Inputs, Actions, Decisions, and Outputs",
                    description: "Break every workflow into its core components — what comes in, what decisions are made, what actions happen, and what the output is.",
                    estimatedTime: "25 min",
                    difficulty: "Beginner",
                    learningTypes: [
                        "Reading",
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Read: Workflow Components Framework",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Practice: Decompose 2 workflows",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p3-s2-test", "Workflow Components Quiz", "In workflow design, what is a 'decision point'?", [
                        "When you decide to quit the project",
                        "A step where the workflow branches based on a condition being true or false",
                        "The final output",
                        "The starting trigger"
                    ], 1, "Decision points create branches — if X is true, go this way; if false, go another way. They're the logic of your workflow.", "Why is it important to define the expected output before designing a workflow?", [
                        "It is not important",
                        "Because the output determines what inputs and actions are needed",
                        "To impress stakeholders",
                        "Because tools require it"
                    ], 1, "Starting with the desired output and working backwards is a powerful design technique — it ensures every step serves the goal.")
                },
                {
                    id: "p3-s3",
                    title: "Error Handling Basics",
                    description: "Learn how to make your automations resilient — handle failures gracefully, set up error alerts, and avoid silent failures that break workflows.",
                    estimatedTime: "30 min",
                    difficulty: "Intermediate",
                    learningTypes: [
                        "Reading",
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Read: Error Handling in Automation",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Practice: Add error handling to a scenario",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p3-s3-test", "Error Handling Quiz", "What is a 'silent failure' in automation?", [
                        "When automation runs quietly",
                        "When an automation fails but produces no alert or visible error — data is lost without anyone knowing",
                        "When automation is paused by the user",
                        "When automation runs at night"
                    ], 1, "Silent failures are dangerous — the workflow appears to run but produces wrong or missing results. Always add error alerts.", "What is the best practice for handling API rate limit errors?", [
                        "Ignore them",
                        "Delete the automation",
                        "Add retry logic with exponential backoff and an error notification",
                        "Run the workflow manually instead"
                    ], 2, "Retry logic with backoff means the automation waits and tries again — avoiding permanent failures from temporary rate limits.")
                },
                {
                    id: "p3-s4",
                    title: "Human Approval Steps",
                    description: "Design workflows that pause for human review before taking high-stakes actions — essential for responsible AI automation.",
                    estimatedTime: "25 min",
                    difficulty: "Intermediate",
                    learningTypes: [
                        "Reading",
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Read: Human-in-the-Loop Design",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Practice: Add an approval step to a workflow",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p3-s4-test", "Human Approval Quiz", "When should a workflow include a human approval step?", [
                        "Never — full automation is always better",
                        "When the automated action has significant consequences like sending emails to customers or deleting data",
                        "Only in financial workflows",
                        "When the tool requires it"
                    ], 1, "High-stakes actions — sending communications, making payments, deleting records — should have human approval to prevent costly mistakes.", "What is a practical way to implement a human approval step without code?", [
                        "Send an email and manually check it every hour",
                        "Use a form or approval button that triggers the next step only when clicked",
                        "Ask a developer to build a custom system",
                        "Skip the step entirely"
                    ], 1, "Tools like Make, Typeform, or even a simple email with a link can create an approval gate — the next step only runs after approval.")
                },
                {
                    id: "p3-s5",
                    title: "Workflow Documentation",
                    description: "Learn to document your automations professionally — so other people can understand, maintain, and improve them without your help.",
                    estimatedTime: "20 min",
                    difficulty: "Beginner",
                    learningTypes: [
                        "Reading",
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Read: Automation Documentation Best Practices",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Practice: Document one of your automations",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p3-s5-test", "Documentation Quiz", "Why is workflow documentation important?", [
                        "It is only for large companies",
                        "It ensures others can understand, maintain, and improve the automation without relying on the original builder",
                        "It is required by law",
                        "It makes workflows run faster"
                    ], 1, "Good documentation is what separates a professional automation from a fragile one-person system. It enables teams and longevity.", "What should a good automation document include?", [
                        "Only the tool name",
                        "Purpose, trigger, steps, data sources, error handling, and maintenance notes",
                        "Just a screenshot",
                        "The cost of the tool"
                    ], 1, "Comprehensive documentation covers the why, what, and how — purpose, trigger, each step, data sources, error handling, and how to maintain it.")
                }
            ],
            finalTest: phaseTest("p3", "Phase 3 Final Test: Workflow Design")
        },
        // ── Phase 4: API & Integration Basics ───────────────────────────────────
        {
            id: "p4",
            phaseNumber: 4,
            title: "API & Integration Basics",
            description: "Demystify APIs, webhooks, and JSON so you can connect any two tools — even those without native integrations.",
            estimatedDuration: "2 weeks",
            weekRange: "Week 7–8",
            outcome: "You can read API documentation, make HTTP requests, understand JSON, and connect tools through APIs in Make or Zapier.",
            access: "locked",
            sections: [
                {
                    id: "p4-s1",
                    title: "What Is an API?",
                    description: "A plain-English explanation of APIs — what they are, how they work, and why they are the backbone of all modern automation.",
                    estimatedTime: "20 min",
                    difficulty: "Beginner",
                    learningTypes: [
                        "Reading",
                        "Video"
                    ],
                    resources: [
                        {
                            label: "Read: APIs Explained Simply",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Watch: What is an API? (Analogy)",
                            type: "video",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p4-s1-test", "API Basics Quiz", "What does API stand for?", [
                        "Automated Process Integration",
                        "Application Programming Interface",
                        "Advanced Platform Intelligence",
                        "Automated Product Interface"
                    ], 1, "API stands for Application Programming Interface — it is a defined way for two software applications to communicate.", "What is the best analogy for an API?", [
                        "A filing cabinet",
                        "A waiter taking your order to the kitchen and bringing back the food",
                        "A computer screen",
                        "A database table"
                    ], 1, "The waiter analogy is apt — you (client) place an order, the waiter (API) takes it to the kitchen (server) and returns the result.")
                },
                {
                    id: "p4-s2",
                    title: "Webhooks Explained Simply",
                    description: "Understand webhooks — the 'push' alternative to polling APIs. Learn when to use them and how to set up a simple webhook receiver.",
                    estimatedTime: "25 min",
                    difficulty: "Beginner",
                    learningTypes: [
                        "Reading",
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Read: Webhooks vs APIs",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Practice: Set up a webhook in Make",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p4-s2-test", "Webhooks Quiz", "How does a webhook differ from a regular API call?", [
                        "They are the same thing",
                        "A webhook pushes data to your URL automatically when an event occurs, rather than you polling for it",
                        "Webhooks only work with Zapier",
                        "Webhooks require a database"
                    ], 1, "Webhooks are event-driven — the sender pushes data to your endpoint when something happens. You don't need to keep asking.", "What do you need to receive a webhook?", [
                        "A physical server",
                        "A publicly accessible URL that can receive HTTP POST requests",
                        "A credit card",
                        "A special programming language"
                    ], 1, "Webhook receivers are just URLs — Make, Zapier, and n8n all provide webhook URLs you can use without any server setup.")
                },
                {
                    id: "p4-s3",
                    title: "JSON Basics",
                    description: "Learn to read and understand JSON — the universal data format used by virtually every API. No coding required.",
                    estimatedTime: "25 min",
                    difficulty: "Beginner",
                    learningTypes: [
                        "Reading",
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Read: JSON for Non-Developers",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Practice: Parse 3 JSON examples",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p4-s3-test", "JSON Quiz", "What does JSON stand for?", [
                        "Java Standard Object Notation",
                        "JavaScript Object Notation",
                        "Joint System Output Network",
                        "Just Simple Object Names"
                    ], 1, "JSON stands for JavaScript Object Notation — a lightweight, human-readable format for structuring data as key-value pairs.", "In JSON, what does this represent: { \"name\": \"Alice\", \"age\": 30 }?", [
                        "A list of items",
                        "An object with two properties: name and age",
                        "A function",
                        "A database query"
                    ], 1, "A JSON object is a set of key-value pairs: { \"name\": \"Alice\", \"age\": 30 }. It is the most common structure in API responses.")
                },
                {
                    id: "p4-s4",
                    title: "Connecting Tools Through APIs",
                    description: "Use API modules in Make and Zapier to connect tools that don't have native integrations — dramatically expanding what you can automate.",
                    estimatedTime: "40 min",
                    difficulty: "Intermediate",
                    learningTypes: [
                        "Video",
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Watch: Custom API Connections in Make",
                            type: "video",
                            url: "#"
                        },
                        {
                            label: "Practice: Connect a tool via HTTP module",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p4-s4-test", "API Connections Quiz", "What is the HTTP module in Make used for?", [
                        "Browsing the web",
                        "Making custom API requests to any URL",
                        "Sending emails only",
                        "Managing files"
                    ], 1, "The HTTP module lets you make raw API requests to any endpoint — essential for connecting tools without native Make integrations.", "What do you typically need to authenticate an API request?", [
                        "Nothing — APIs are always public",
                        "An API key, token, or OAuth credentials provided by the service",
                        "Your email address only",
                        "A credit card"
                    ], 1, "Most APIs require authentication — usually an API key in the request header or OAuth tokens for user-specific access.")
                },
                {
                    id: "p4-s5",
                    title: "Testing Simple API Requests",
                    description: "Use tools like Postman or Make's built-in HTTP module to test API requests before building full automations. Debug like a pro.",
                    estimatedTime: "35 min",
                    difficulty: "Intermediate",
                    learningTypes: [
                        "Practice",
                        "Tool"
                    ],
                    resources: [
                        {
                            label: "Watch: Testing APIs with Postman",
                            type: "video",
                            url: "#"
                        },
                        {
                            label: "Practice: Test 3 real API endpoints",
                            type: "practice",
                            url: "#"
                        },
                        {
                            label: "Tool: Postman (free)",
                            type: "tool",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p4-s5-test", "API Testing Quiz", "Why should you test an API request before building a full automation?", [
                        "It is not necessary",
                        "To confirm the endpoint works, understand the response structure, and catch errors early",
                        "Because tools require it",
                        "To slow down development"
                    ], 1, "Testing first saves hours — you confirm the API works, understand what data comes back, and avoid building on a broken foundation.", "What HTTP status code indicates a successful API request?", [
                        "404",
                        "500",
                        "200",
                        "301"
                    ], 2, "HTTP 200 means OK — the request was successful. 404 means not found, 500 means server error.")
                }
            ],
            finalTest: phaseTest("p4", "Phase 4 Final Test: API & Integration Basics")
        },
        // ── Phase 5: Portfolio Projects ──────────────────────────────────────────
        {
            id: "p5",
            phaseNumber: 5,
            title: "Portfolio Projects",
            description: "Apply everything you have learned by building real automation projects. Document and present your work to demonstrate job-readiness.",
            estimatedDuration: "4 weeks",
            weekRange: "Week 9–12",
            outcome: "You have 3+ portfolio-ready automation projects, documented professionally and ready to show employers or clients.",
            access: "locked",
            sections: [
                {
                    id: "p5-s1",
                    title: "Choose a Real Business Problem",
                    description: "Select a real automation problem to solve — from your own life, a business you know, or a common business scenario. Scope it clearly.",
                    estimatedTime: "30 min",
                    difficulty: "Intermediate",
                    learningTypes: [
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Read: How to Scope an Automation Project",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Practice: Write your project brief",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p5-s1-test", "Project Scoping Quiz", "What makes a good automation project for your portfolio?", [
                        "The most technically complex project possible",
                        "A project that solves a real problem, demonstrates clear value, and uses skills from this roadmap",
                        "Any project that uses the most expensive tools",
                        "A project that took the longest to build"
                    ], 1, "Portfolio projects should solve real problems and demonstrate practical skills — not complexity for its own sake.", "What should a project brief include?", [
                        "Only the tool you will use",
                        "Problem statement, proposed solution, tools, expected outcome, and success criteria",
                        "Just the title",
                        "Your personal biography"
                    ], 1, "A clear brief keeps you focused and makes your portfolio project look professional — it shows you can think before you build.")
                },
                {
                    id: "p5-s2",
                    title: "Build a Complete Automation",
                    description: "Build your chosen automation from scratch — trigger, logic, error handling, and output. Apply everything from Phases 1–4.",
                    estimatedTime: "3 hours",
                    difficulty: "Intermediate",
                    learningTypes: [
                        "Project",
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Read: Automation Build Checklist",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Practice: Build your automation",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p5-s2-test", "Build Quality Quiz", "What should you check before considering an automation 'done'?", [
                        "That it runs once successfully",
                        "That it handles errors, edge cases, and has been tested with multiple scenarios",
                        "That it looks good",
                        "That it uses the most modules"
                    ], 1, "A complete automation handles edge cases and errors gracefully — not just the happy path.", "What is an 'edge case' in automation?", [
                        "A case that happens at the edge of the screen",
                        "An unusual input or scenario that the automation might not handle correctly",
                        "The final step in a workflow",
                        "A type of API error"
                    ], 1, "Edge cases are unusual but possible inputs — like an empty field, a duplicate record, or an unexpected data format. Always test for them.")
                },
                {
                    id: "p5-s3",
                    title: "Document the Workflow",
                    description: "Write professional documentation for your automation — purpose, architecture, data flow, error handling, and maintenance guide.",
                    estimatedTime: "45 min",
                    difficulty: "Intermediate",
                    learningTypes: [
                        "Practice",
                        "Reading"
                    ],
                    resources: [
                        {
                            label: "Read: Portfolio Documentation Template",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Practice: Write your automation docs",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p5-s3-test", "Documentation Quiz", "What is the purpose of a maintenance guide in automation documentation?", [
                        "To make the document longer",
                        "To explain how to update, fix, or extend the automation when things change",
                        "To list all the tools used",
                        "To describe the project manager"
                    ], 1, "A maintenance guide ensures the automation stays working over time — it explains how to handle common issues and updates.", "Who should be able to understand your documentation?", [
                        "Only developers",
                        "Only you",
                        "Any reasonably technical person who was not involved in building it",
                        "Only the client who paid for it"
                    ], 2, "Good documentation is written for someone who wasn't there — clear enough that they can understand, maintain, and improve the automation.")
                },
                {
                    id: "p5-s4",
                    title: "Test and Improve the System",
                    description: "Run your automation through real scenarios, find weaknesses, and improve it. Iteration is what separates good automations from great ones.",
                    estimatedTime: "1 hour",
                    difficulty: "Intermediate",
                    learningTypes: [
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Read: Automation Testing Checklist",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Practice: Run 5 test scenarios",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p5-s4-test", "Testing & Iteration Quiz", "What is the best approach to testing an automation?", [
                        "Run it once and assume it works",
                        "Test with multiple real-world scenarios including happy paths, edge cases, and error conditions",
                        "Ask someone else to test it",
                        "Only test the trigger"
                    ], 1, "Thorough testing covers the happy path, edge cases, and deliberate error conditions — all three are essential.", "What should you do after finding a bug in your automation?", [
                        "Delete the automation and start over",
                        "Document the bug, fix it, test the fix, and update your documentation",
                        "Ignore it if it rarely happens",
                        "Ask the tool's support team to fix it"
                    ], 1, "A professional approach to bugs: document, fix, test, and update docs. This process builds reliability and demonstrates professionalism.")
                },
                {
                    id: "p5-s5",
                    title: "Prepare Portfolio Presentation",
                    description: "Package your automation projects into a professional portfolio — a document, Notion page, or video walkthrough that showcases your skills.",
                    estimatedTime: "1.5 hours",
                    difficulty: "Intermediate",
                    learningTypes: [
                        "Project",
                        "Practice"
                    ],
                    resources: [
                        {
                            label: "Read: Portfolio Presentation Guide",
                            type: "article",
                            url: "#"
                        },
                        {
                            label: "Practice: Create your portfolio page",
                            type: "practice",
                            url: "#"
                        }
                    ],
                    test: sectionTest("p5-s5-test", "Portfolio Quiz", "What should your automation portfolio demonstrate to a potential employer or client?", [
                        "How many tools you know",
                        "That you can identify real problems, build reliable solutions, and document your work professionally",
                        "That you have the most expensive tools",
                        "That you work very fast"
                    ], 1, "Employers and clients want to see problem-solving ability, reliable builds, and professional communication — not just tool knowledge.", "What format works best for an automation portfolio?", [
                        "A single screenshot",
                        "A combination of written case studies, screenshots, and ideally a short video walkthrough",
                        "Only a GitHub repository",
                        "A list of tools you have used"
                    ], 1, "Multi-format portfolios — case studies, visuals, and video — give reviewers multiple ways to understand your work and skills.")
                }
            ],
            finalTest: phaseTest("p5", "Phase 5 Final Test: Portfolio Projects")
        }
    ],
    // ── Projects ──────────────────────────────────────────────────────────────
    projects: [
        {
            id: "proj-1",
            title: "Personal Task Automation System",
            scenario: "You receive tasks from multiple sources — email, Slack, and a form. Build an automation that captures all tasks into a single Airtable base, assigns priorities, and sends you a daily digest.",
            skills: [
                "Zapier or Make",
                "Airtable",
                "Email parsing",
                "Data consolidation"
            ],
            deliverables: [
                "Working automation capturing tasks from 2+ sources",
                "Airtable base with priority logic",
                "Daily digest email automation",
                "Documentation of the workflow"
            ],
            estimatedTime: "4 hours",
            difficulty: "Beginner",
            relatedPhaseId: "p2"
        },
        {
            id: "proj-2",
            title: "AI Email Sorting Workflow",
            scenario: "Build an automation that reads incoming emails, uses AI to classify them by type (support, sales, spam, other), and routes them to the right folder or Slack channel with a summary.",
            skills: [
                "Make or Zapier",
                "OpenAI API",
                "Email integration",
                "AI classification"
            ],
            deliverables: [
                "Email classification automation using AI",
                "Routing logic to 3+ destinations",
                "AI-generated email summary",
                "Error handling for unclassifiable emails"
            ],
            estimatedTime: "5 hours",
            difficulty: "Intermediate",
            relatedPhaseId: "p4"
        },
        {
            id: "proj-3",
            title: "Lead Capture and Follow-up Automation",
            scenario: "A business receives leads through a website form. Build a complete automation: capture the lead, enrich it with basic research, add it to a CRM, and trigger a personalised follow-up email sequence.",
            skills: [
                "Make",
                "Airtable CRM",
                "Email automation",
                "AI personalisation"
            ],
            deliverables: [
                "Form-to-CRM automation",
                "AI-personalised follow-up email",
                "Lead status tracking",
                "Notification to sales team"
            ],
            estimatedTime: "6 hours",
            difficulty: "Intermediate",
            relatedPhaseId: "p3"
        },
        {
            id: "proj-4",
            title: "AI Research Assistant Workflow",
            scenario: "Build an automation where a user submits a research topic via a form, AI researches and summarises the topic, and a formatted report is sent back via email and saved to a Notion database.",
            skills: [
                "Make",
                "OpenAI API",
                "Notion API",
                "Report generation"
            ],
            deliverables: [
                "Topic submission form",
                "AI research and summarisation workflow",
                "Formatted report delivered by email",
                "Notion database of all research reports"
            ],
            estimatedTime: "5 hours",
            difficulty: "Intermediate",
            relatedPhaseId: "p4"
        },
        {
            id: "proj-5",
            title: "Final Portfolio Automation System",
            scenario: "Design and build a complete end-to-end automation system for a real business scenario of your choice. The system must include a trigger, AI processing, data storage, human approval step, and a final output — documented and presented professionally.",
            skills: [
                "Make or Zapier",
                "OpenAI API",
                "Database tool",
                "API integration",
                "Documentation"
            ],
            deliverables: [
                "Complete multi-step automation with AI",
                "Human approval step",
                "Error handling and alerts",
                "Professional documentation",
                "Portfolio presentation (Notion or PDF)"
            ],
            estimatedTime: "10 hours",
            difficulty: "Advanced",
            relatedPhaseId: "p5"
        }
    ]
};
// ═══════════════════════════════════════════════════════════════════════════════
// 2. AI WORKFLOW BUILDER
// ═══════════════════════════════════════════════════════════════════════════════
const aiWorkflowBuilder = {
    id: "2",
    slug: "ai-workflow-builder",
    title: "AI Workflow Builder",
    description: "Design and connect AI-powered workflows for teams, creators, and businesses. Master the art of building systems that run themselves.",
    category: "Automation",
    level: "Beginner",
    duration: "10 weeks",
    status: "coming-soon",
    totalEstimatedHours: 48,
    phases: [
        lightPhase("wfb-p1", 1, "Workflow Thinking", "Develop the mindset and vocabulary of a workflow builder — systems thinking, process design, and automation logic.", "You can think in systems and identify workflow opportunities in any business context.", "2 weeks", "Week 1–2", "free", [
            {
                id: "wfb-p1-s1",
                title: "Systems Thinking Basics",
                desc: "Learn to see businesses as interconnected systems — inputs, processes, outputs, and feedback loops.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "wfb-p1-s2",
                title: "Workflow vs Process vs Automation",
                desc: "Understand the distinctions between workflows, processes, and automation so you can communicate precisely.",
                time: "20 min",
                diff: "Beginner",
                types: [
                    "Reading"
                ]
            },
            {
                id: "wfb-p1-s3",
                title: "Identifying Workflow Opportunities",
                desc: "A structured method to find high-value workflow opportunities in any business or team.",
                time: "30 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Practice"
                ]
            },
            {
                id: "wfb-p1-s4",
                title: "Designing Your First Workflow Map",
                desc: "Map a real workflow from scratch using a simple visual framework.",
                time: "40 min",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("wfb-p2", 2, "AI Tools for Workflows", "Master the AI tools that power modern workflows — from language models to image generators and research assistants.", "You can select and use the right AI tool for any workflow step.", "2 weeks", "Week 3–4", "locked", [
            {
                id: "wfb-p2-s1",
                title: "AI Tool Landscape",
                desc: "Survey the key AI tools used in workflow building — ChatGPT, Claude, Gemini, Perplexity, and more.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "wfb-p2-s2",
                title: "Choosing the Right AI Tool",
                desc: "A decision framework for selecting the best AI tool for each step in a workflow.",
                time: "20 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Practice"
                ]
            },
            {
                id: "wfb-p2-s3",
                title: "Prompting for Workflow Steps",
                desc: "Write prompts specifically designed for workflow integration — consistent, reliable, and structured output.",
                time: "35 min",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            },
            {
                id: "wfb-p2-s4",
                title: "AI APIs in Workflows",
                desc: "Connect AI tools via API inside Make or Zapier to create AI-powered workflow steps.",
                time: "40 min",
                diff: "Intermediate",
                types: [
                    "Practice",
                    "Video"
                ]
            }
        ]),
        lightPhase("wfb-p3", 3, "Building Connected Workflows", "Build multi-step, multi-tool workflows that connect AI with databases, communication tools, and business apps.", "You can build a complete multi-tool workflow that processes data and delivers results automatically.", "3 weeks", "Week 5–7", "locked", [
            {
                id: "wfb-p3-s1",
                title: "Multi-Step Workflow Design",
                desc: "Design workflows with multiple sequential and parallel steps — handling branching logic and data transformation.",
                time: "35 min",
                diff: "Intermediate",
                types: [
                    "Reading",
                    "Practice"
                ]
            },
            {
                id: "wfb-p3-s2",
                title: "Connecting Apps Without Code",
                desc: "Use Make and Zapier to connect apps that don't have native integrations.",
                time: "40 min",
                diff: "Intermediate",
                types: [
                    "Video",
                    "Practice"
                ]
            },
            {
                id: "wfb-p3-s3",
                title: "Data Transformation in Workflows",
                desc: "Clean, format, and transform data as it moves through your workflow — essential for reliable outputs.",
                time: "30 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "wfb-p3-s4",
                title: "Workflow Testing & Reliability",
                desc: "Test your workflows thoroughly and build in reliability — error handling, retries, and monitoring.",
                time: "30 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "wfb-p3-s5",
                title: "Team Workflow Collaboration",
                desc: "Design workflows for teams — permissions, handoffs, notifications, and shared databases.",
                time: "25 min",
                diff: "Intermediate",
                types: [
                    "Reading",
                    "Practice"
                ]
            }
        ]),
        lightPhase("wfb-p4", 4, "Workflow Projects & Portfolio", "Build and present real workflow projects that demonstrate your skills to employers and clients.", "You have 2 portfolio-ready AI workflow projects with professional documentation.", "3 weeks", "Week 8–10", "locked", [
            {
                id: "wfb-p4-s1",
                title: "Content Creation Workflow",
                desc: "Build a complete AI-powered content creation workflow — from topic to published post.",
                time: "3 hours",
                diff: "Intermediate",
                types: [
                    "Project"
                ]
            },
            {
                id: "wfb-p4-s2",
                title: "Team Reporting Workflow",
                desc: "Build an automated team reporting workflow that collects data, generates summaries, and distributes reports.",
                time: "3 hours",
                diff: "Intermediate",
                types: [
                    "Project"
                ]
            },
            {
                id: "wfb-p4-s3",
                title: "Portfolio Documentation",
                desc: "Document your projects professionally for your portfolio.",
                time: "1 hour",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            }
        ])
    ],
    projects: [
        lightProject("wfb-proj-1", "AI Content Pipeline", "Build an end-to-end content workflow: topic input → AI research → AI draft → formatted output → published to Notion.", [
            "Make",
            "OpenAI API",
            "Notion",
            "Content strategy"
        ], [
            "Working content pipeline",
            "AI-generated drafts",
            "Notion publishing",
            "Documentation"
        ], "5 hours", "Intermediate", "wfb-p4"),
        lightProject("wfb-proj-2", "Team Reporting System", "Automate weekly team reporting: collect data from multiple sources, generate an AI summary, and distribute to stakeholders.", [
            "Make",
            "Airtable",
            "OpenAI API",
            "Email/Slack"
        ], [
            "Data collection automation",
            "AI summary generation",
            "Automated distribution",
            "Documentation"
        ], "4 hours", "Intermediate", "wfb-p4")
    ]
};
// ═══════════════════════════════════════════════════════════════════════════════
// 3. NO-CODE AI AUTOMATION SPECIALIST
// ═══════════════════════════════════════════════════════════════════════════════
const noCodeAiAutomation = {
    id: "3",
    slug: "no-code-ai-automation-specialist",
    title: "No-Code AI Automation Specialist",
    description: "Create powerful business automations using Make, Zapier, Airtable, Notion, and AI assistants — without writing a single line of code.",
    category: "No-Code",
    level: "Beginner",
    duration: "8 weeks",
    status: "coming-soon",
    totalEstimatedHours: 40,
    phases: [
        lightPhase("nc-p1", 1, "No-Code Foundations", "Understand the no-code ecosystem and build your first simple automations without any technical background.", "You can navigate the no-code tool landscape and build basic automations independently.", "2 weeks", "Week 1–2", "free", [
            {
                id: "nc-p1-s1",
                title: "What is No-Code?",
                desc: "Understand the no-code movement, its power, and its limits — and why it's the fastest path to automation skills.",
                time: "20 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "nc-p1-s2",
                title: "No-Code Tool Overview",
                desc: "Survey the most important no-code tools: Make, Zapier, Airtable, Notion, Glide, and Webflow.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Reading"
                ]
            },
            {
                id: "nc-p1-s3",
                title: "Your First Automation in Zapier",
                desc: "Build a simple but real automation in Zapier — step by step, from trigger to action.",
                time: "40 min",
                diff: "Beginner",
                types: [
                    "Practice",
                    "Video"
                ]
            },
            {
                id: "nc-p1-s4",
                title: "Your First Scenario in Make",
                desc: "Build a simple scenario in Make and understand how it differs from Zapier.",
                time: "40 min",
                diff: "Beginner",
                types: [
                    "Practice",
                    "Video"
                ]
            }
        ]),
        lightPhase("nc-p2", 2, "AI + No-Code", "Combine AI tools with no-code platforms to create intelligent automations that go beyond simple trigger-action logic.", "You can integrate AI into no-code workflows to add intelligence and natural language processing.", "2 weeks", "Week 3–4", "locked", [
            {
                id: "nc-p2-s1",
                title: "Adding AI to Zapier Workflows",
                desc: "Use Zapier's AI steps and OpenAI integration to add intelligence to your Zaps.",
                time: "35 min",
                diff: "Beginner",
                types: [
                    "Practice",
                    "Video"
                ]
            },
            {
                id: "nc-p2-s2",
                title: "Adding AI to Make Scenarios",
                desc: "Use Make's OpenAI module to process text, classify data, and generate content inside scenarios.",
                time: "40 min",
                diff: "Beginner",
                types: [
                    "Practice",
                    "Video"
                ]
            },
            {
                id: "nc-p2-s3",
                title: "AI-Powered Data Extraction",
                desc: "Use AI to extract structured data from unstructured text — emails, documents, and web pages.",
                time: "35 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "nc-p2-s4",
                title: "Building AI Forms and Inputs",
                desc: "Create smart input forms that feed data into AI-powered automation workflows.",
                time: "30 min",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("nc-p3", 3, "No-Code Databases & Apps", "Use Airtable and Notion as the data backbone of your automations — storing, organising, and displaying information without code.", "You can design and use no-code databases to power complex automation workflows.", "2 weeks", "Week 5–6", "locked", [
            {
                id: "nc-p3-s1",
                title: "Airtable Database Design",
                desc: "Design Airtable bases that serve as the data layer for your automations.",
                time: "40 min",
                diff: "Beginner",
                types: [
                    "Practice",
                    "Video"
                ]
            },
            {
                id: "nc-p3-s2",
                title: "Notion as a Workflow Hub",
                desc: "Use Notion databases, pages, and templates as the central hub for your automation outputs.",
                time: "35 min",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            },
            {
                id: "nc-p3-s3",
                title: "Connecting Databases to Automations",
                desc: "Read from and write to Airtable and Notion inside Make and Zapier workflows.",
                time: "40 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "nc-p3-s4",
                title: "Building a Simple No-Code App",
                desc: "Use Glide or Softr to turn your Airtable data into a simple web app — no code required.",
                time: "1 hour",
                diff: "Intermediate",
                types: [
                    "Practice",
                    "Project"
                ]
            }
        ]),
        lightPhase("nc-p4", 4, "No-Code Projects", "Build real no-code automation projects and present them as a professional portfolio.", "You have 2 portfolio-ready no-code AI automation projects.", "2 weeks", "Week 7–8", "locked", [
            {
                id: "nc-p4-s1",
                title: "Client Onboarding Automation",
                desc: "Build a complete client onboarding workflow using forms, Airtable, AI, and email automation.",
                time: "4 hours",
                diff: "Intermediate",
                types: [
                    "Project"
                ]
            },
            {
                id: "nc-p4-s2",
                title: "Content Calendar System",
                desc: "Build a no-code content calendar that generates, schedules, and tracks content using AI.",
                time: "3 hours",
                diff: "Intermediate",
                types: [
                    "Project"
                ]
            },
            {
                id: "nc-p4-s3",
                title: "Portfolio Presentation",
                desc: "Package your projects into a professional portfolio page.",
                time: "1 hour",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            }
        ])
    ],
    projects: [
        lightProject("nc-proj-1", "Client Onboarding System", "Build a complete no-code client onboarding system: intake form → Airtable CRM → AI welcome email → Notion workspace creation.", [
            "Zapier",
            "Airtable",
            "Notion",
            "AI email"
        ], [
            "Onboarding form",
            "CRM automation",
            "AI-personalised email",
            "Notion workspace"
        ], "4 hours", "Intermediate", "nc-p4"),
        lightProject("nc-proj-2", "AI Content Calendar", "Create a no-code content calendar that uses AI to generate content ideas, schedule posts, and track performance.", [
            "Make",
            "Airtable",
            "OpenAI",
            "Social tools"
        ], [
            "Content idea generation",
            "Scheduling automation",
            "Performance tracking",
            "Documentation"
        ], "3 hours", "Intermediate", "nc-p4")
    ]
};
// ═══════════════════════════════════════════════════════════════════════════════
// 4. AI MARKETING AUTOMATION SPECIALIST
// ═══════════════════════════════════════════════════════════════════════════════
const aiMarketingAutomation = {
    id: "4",
    slug: "ai-marketing-automation-specialist",
    title: "AI Marketing Automation Specialist",
    description: "Use AI to automate content, campaigns, lead generation, email flows, and marketing operations. Become the marketer who scales without a team.",
    category: "Marketing",
    level: "Beginner to Intermediate",
    duration: "10 weeks",
    status: "coming-soon",
    totalEstimatedHours: 52,
    phases: [
        lightPhase("mkt-p1", 1, "Marketing Automation Foundations", "Understand modern marketing automation — what it is, how it works, and where AI creates the most value.", "You can map a marketing funnel and identify automation opportunities at each stage.", "2 weeks", "Week 1–2", "free", [
            {
                id: "mkt-p1-s1",
                title: "Marketing Funnel Fundamentals",
                desc: "Understand the customer journey from awareness to purchase and where automation fits at each stage.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "mkt-p1-s2",
                title: "Marketing Automation Overview",
                desc: "Survey the marketing automation landscape — tools, use cases, and what's possible without a big team.",
                time: "20 min",
                diff: "Beginner",
                types: [
                    "Reading"
                ]
            },
            {
                id: "mkt-p1-s3",
                title: "AI in Marketing",
                desc: "How AI is transforming content creation, personalisation, targeting, and campaign management.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "mkt-p1-s4",
                title: "Mapping Your Marketing Stack",
                desc: "Audit and map the tools in a marketing stack and identify integration and automation opportunities.",
                time: "30 min",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("mkt-p2", 2, "AI Content & Copywriting", "Use AI to create high-quality marketing content at scale — ads, emails, social posts, landing pages, and blogs.", "You can use AI to produce marketing content efficiently while maintaining brand voice and quality.", "2 weeks", "Week 3–4", "locked", [
            {
                id: "mkt-p2-s1",
                title: "AI Copywriting Fundamentals",
                desc: "Learn to use AI for writing compelling marketing copy — headlines, CTAs, email subject lines, and ads.",
                time: "35 min",
                diff: "Beginner",
                types: [
                    "Practice",
                    "Video"
                ]
            },
            {
                id: "mkt-p2-s2",
                title: "Brand Voice in AI Content",
                desc: "Teach AI your brand voice so content stays consistent and on-brand at scale.",
                time: "30 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "mkt-p2-s3",
                title: "Content Repurposing with AI",
                desc: "Turn one piece of content into 10 — repurpose blogs, videos, and podcasts across all channels using AI.",
                time: "35 min",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            },
            {
                id: "mkt-p2-s4",
                title: "AI Content Calendar System",
                desc: "Build an AI-powered content calendar that plans, generates, and schedules content automatically.",
                time: "1 hour",
                diff: "Intermediate",
                types: [
                    "Practice",
                    "Project"
                ]
            }
        ]),
        lightPhase("mkt-p3", 3, "Email & Lead Automation", "Build automated email sequences, lead nurturing flows, and lead capture systems using AI personalisation.", "You can build a complete lead capture and email nurturing automation.", "3 weeks", "Week 5–7", "locked", [
            {
                id: "mkt-p3-s1",
                title: "Email Marketing Automation Basics",
                desc: "Understand email automation sequences, triggers, and segmentation — the foundation of email marketing.",
                time: "30 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "mkt-p3-s2",
                title: "AI-Personalised Email Sequences",
                desc: "Use AI to personalise email sequences based on subscriber behaviour, interests, and segment.",
                time: "40 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "mkt-p3-s3",
                title: "Lead Capture & Qualification",
                desc: "Build automated lead capture, scoring, and qualification workflows that feed your CRM.",
                time: "45 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "mkt-p3-s4",
                title: "CRM Integration & Lead Routing",
                desc: "Connect lead capture to a CRM and automate lead routing, follow-up, and status updates.",
                time: "40 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "mkt-p3-s5",
                title: "Campaign Performance Reporting",
                desc: "Automate campaign performance reporting with dashboards and AI-generated summaries.",
                time: "35 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("mkt-p4", 4, "Marketing Automation Projects", "Build complete marketing automation systems and present them as a professional portfolio.", "You have 2 portfolio-ready marketing automation projects.", "3 weeks", "Week 8–10", "locked", [
            {
                id: "mkt-p4-s1",
                title: "Lead Generation Funnel",
                desc: "Build a complete AI-powered lead generation funnel from ad to CRM.",
                time: "5 hours",
                diff: "Intermediate",
                types: [
                    "Project"
                ]
            },
            {
                id: "mkt-p4-s2",
                title: "Content Marketing System",
                desc: "Build an automated content marketing system that plans, creates, and distributes content.",
                time: "4 hours",
                diff: "Intermediate",
                types: [
                    "Project"
                ]
            },
            {
                id: "mkt-p4-s3",
                title: "Portfolio Presentation",
                desc: "Present your marketing automation projects professionally.",
                time: "1 hour",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            }
        ])
    ],
    projects: [
        lightProject("mkt-proj-1", "AI Lead Generation Funnel", "Build a complete lead generation funnel: landing page → lead capture → AI qualification → CRM → personalised email sequence.", [
            "Make",
            "Airtable CRM",
            "OpenAI",
            "Email tool"
        ], [
            "Lead capture form",
            "AI qualification",
            "CRM automation",
            "Email sequence"
        ], "5 hours", "Intermediate", "mkt-p4"),
        lightProject("mkt-proj-2", "AI Content Marketing System", "Build an automated content system that generates weekly content ideas, creates drafts, and schedules distribution across channels.", [
            "Make",
            "OpenAI",
            "Social tools",
            "Notion"
        ], [
            "Content idea generation",
            "AI drafts",
            "Multi-channel scheduling",
            "Performance tracking"
        ], "4 hours", "Intermediate", "mkt-p4")
    ]
};
// ═══════════════════════════════════════════════════════════════════════════════
// 5. AI PRODUCTIVITY CONSULTANT
// ═══════════════════════════════════════════════════════════════════════════════
const aiProductivityConsultant = {
    id: "5",
    slug: "ai-productivity-consultant",
    title: "AI Productivity Consultant",
    description: "Help individuals and teams dramatically improve their productivity using AI tools, smart workflows, and personal operating systems.",
    category: "Productivity",
    level: "Beginner",
    duration: "8 weeks",
    status: "coming-soon",
    totalEstimatedHours: 38,
    phases: [
        lightPhase("prod-p1", 1, "Productivity Fundamentals", "Build a solid foundation in productivity principles before adding AI — so you amplify good habits, not bad ones.", "You can assess any person's or team's productivity system and identify improvement opportunities.", "2 weeks", "Week 1–2", "free", [
            {
                id: "prod-p1-s1",
                title: "Productivity Principles",
                desc: "Core productivity concepts: time blocking, priority frameworks, energy management, and focus systems.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "prod-p1-s2",
                title: "The Personal Operating System",
                desc: "Design a personal OS — the system that manages your tasks, goals, information, and projects.",
                time: "30 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Practice"
                ]
            },
            {
                id: "prod-p1-s3",
                title: "Productivity Audit Framework",
                desc: "A structured method to audit any person's or team's current productivity system.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            },
            {
                id: "prod-p1-s4",
                title: "Common Productivity Blockers",
                desc: "Identify and address the most common productivity killers — meetings, context switching, and unclear priorities.",
                time: "20 min",
                diff: "Beginner",
                types: [
                    "Reading"
                ]
            }
        ]),
        lightPhase("prod-p2", 2, "AI Tools for Productivity", "Master the AI tools that create the biggest productivity gains — from AI writing assistants to meeting summarisers.", "You can use AI tools to save 2+ hours per day on common knowledge work tasks.", "2 weeks", "Week 3–4", "locked", [
            {
                id: "prod-p2-s1",
                title: "AI Writing & Communication",
                desc: "Use AI to write emails, documents, and messages faster and better.",
                time: "30 min",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            },
            {
                id: "prod-p2-s2",
                title: "AI Meeting Management",
                desc: "Use AI to prepare for, run, and follow up on meetings — transcription, summaries, and action items.",
                time: "30 min",
                diff: "Beginner",
                types: [
                    "Practice",
                    "Video"
                ]
            },
            {
                id: "prod-p2-s3",
                title: "AI Research & Summarisation",
                desc: "Use AI to research topics, summarise documents, and extract key insights in minutes.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            },
            {
                id: "prod-p2-s4",
                title: "Building an AI-Enhanced Personal OS",
                desc: "Integrate AI tools into your personal operating system for maximum leverage.",
                time: "45 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("prod-p3", 3, "Consulting Skills", "Develop the consulting skills needed to assess, advise, and implement productivity improvements for clients.", "You can run a productivity consulting engagement from discovery to implementation.", "2 weeks", "Week 5–6", "locked", [
            {
                id: "prod-p3-s1",
                title: "Consulting Fundamentals",
                desc: "Core consulting skills: discovery, diagnosis, recommendation, and implementation.",
                time: "30 min",
                diff: "Beginner",
                types: [
                    "Reading"
                ]
            },
            {
                id: "prod-p3-s2",
                title: "Running a Productivity Discovery",
                desc: "How to run a discovery session with a client to understand their current system and pain points.",
                time: "35 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "prod-p3-s3",
                title: "Delivering Recommendations",
                desc: "How to present productivity recommendations clearly and get buy-in from clients.",
                time: "30 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "prod-p3-s4",
                title: "Implementation & Follow-up",
                desc: "Support clients through implementation and follow up to ensure lasting change.",
                time: "25 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("prod-p4", 4, "Consulting Projects", "Deliver real productivity consulting projects and build your portfolio.", "You have a portfolio-ready productivity consulting case study.", "2 weeks", "Week 7–8", "locked", [
            {
                id: "prod-p4-s1",
                title: "Personal Productivity Overhaul",
                desc: "Conduct a full productivity audit and redesign your own system as a case study.",
                time: "3 hours",
                diff: "Intermediate",
                types: [
                    "Project"
                ]
            },
            {
                id: "prod-p4-s2",
                title: "Team Productivity Consultation",
                desc: "Simulate a team productivity consulting engagement and produce a recommendation report.",
                time: "3 hours",
                diff: "Intermediate",
                types: [
                    "Project"
                ]
            },
            {
                id: "prod-p4-s3",
                title: "Portfolio & Service Offering",
                desc: "Package your skills into a clear consulting service offering and portfolio.",
                time: "1 hour",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            }
        ])
    ],
    projects: [
        lightProject("prod-proj-1", "Personal Productivity System", "Design and implement a complete AI-enhanced personal productivity system — tasks, goals, information, and daily routine.", [
            "Notion",
            "AI tools",
            "Calendar",
            "Task manager"
        ], [
            "Productivity audit",
            "System design",
            "AI integration",
            "30-day review"
        ], "3 hours", "Beginner", "prod-p4"),
        lightProject("prod-proj-2", "Team Productivity Consulting Report", "Conduct a simulated productivity consulting engagement and deliver a professional recommendation report.", [
            "Discovery framework",
            "AI analysis",
            "Report writing"
        ], [
            "Discovery session notes",
            "Diagnosis",
            "Recommendations",
            "Implementation plan"
        ], "3 hours", "Intermediate", "prod-p4")
    ]
};
// ═══════════════════════════════════════════════════════════════════════════════
// 6. AI OPERATIONS ASSISTANT
// ═══════════════════════════════════════════════════════════════════════════════
const aiOperationsAssistant = {
    id: "6",
    slug: "ai-operations-assistant",
    title: "AI Operations Assistant",
    description: "Support business operations with AI tools, dashboards, process automation, and reporting systems that keep teams aligned and informed.",
    category: "Operations",
    level: "Beginner to Intermediate",
    duration: "12 weeks",
    status: "coming-soon",
    totalEstimatedHours: 56,
    phases: [
        lightPhase("ops-p1", 1, "Operations Fundamentals", "Understand business operations — what ops teams do, what good operations look like, and where AI creates the most value.", "You can describe the core functions of a business operations team and identify AI opportunities.", "2 weeks", "Week 1–2", "free", [
            {
                id: "ops-p1-s1",
                title: "Business Operations Overview",
                desc: "What business operations means, what ops teams do, and why it matters for every company.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "ops-p1-s2",
                title: "Operations Metrics & KPIs",
                desc: "The key metrics that operations teams track — and how to use them to identify problems and opportunities.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Reading"
                ]
            },
            {
                id: "ops-p1-s3",
                title: "AI in Operations",
                desc: "How AI is being used across operations — from reporting to process automation to decision support.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "ops-p1-s4",
                title: "Operations Audit",
                desc: "Conduct a structured operations audit to identify inefficiencies and automation opportunities.",
                time: "35 min",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("ops-p2", 2, "Data & Reporting Automation", "Build automated data collection, processing, and reporting systems that give teams real-time visibility.", "You can build automated dashboards and reports that update without manual intervention.", "3 weeks", "Week 3–5", "locked", [
            {
                id: "ops-p2-s1",
                title: "Data Collection Automation",
                desc: "Automate the collection of operational data from multiple sources into a central database.",
                time: "40 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "ops-p2-s2",
                title: "Building Dashboards",
                desc: "Create operational dashboards in Airtable, Notion, or Google Sheets that update automatically.",
                time: "45 min",
                diff: "Intermediate",
                types: [
                    "Practice",
                    "Video"
                ]
            },
            {
                id: "ops-p2-s3",
                title: "AI-Generated Reports",
                desc: "Use AI to generate narrative summaries of operational data — turning numbers into insights.",
                time: "35 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "ops-p2-s4",
                title: "Automated Report Distribution",
                desc: "Schedule and automate the distribution of reports to stakeholders via email or Slack.",
                time: "30 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("ops-p3", 3, "Process Automation", "Automate the most common operational processes — onboarding, approvals, scheduling, and status updates.", "You can automate 3+ common operational processes end-to-end.", "4 weeks", "Week 6–9", "locked", [
            {
                id: "ops-p3-s1",
                title: "Employee Onboarding Automation",
                desc: "Build a complete employee onboarding automation — from offer accepted to day one ready.",
                time: "1 hour",
                diff: "Intermediate",
                types: [
                    "Practice",
                    "Project"
                ]
            },
            {
                id: "ops-p3-s2",
                title: "Approval Workflow Automation",
                desc: "Automate common approval workflows — expense approvals, leave requests, and vendor approvals.",
                time: "45 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "ops-p3-s3",
                title: "Meeting & Scheduling Automation",
                desc: "Automate meeting scheduling, preparation, and follow-up using AI and calendar tools.",
                time: "40 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "ops-p3-s4",
                title: "Status Update Automation",
                desc: "Build automated status update systems that keep teams informed without manual check-ins.",
                time: "35 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "ops-p3-s5",
                title: "Vendor & Supplier Automation",
                desc: "Automate vendor communication, order tracking, and invoice processing.",
                time: "40 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("ops-p4", 4, "Operations Projects", "Build complete operations automation systems and present them professionally.", "You have 2 portfolio-ready operations automation projects.", "3 weeks", "Week 10–12", "locked", [
            {
                id: "ops-p4-s1",
                title: "Operations Dashboard Project",
                desc: "Build a complete real-time operations dashboard for a sample business.",
                time: "4 hours",
                diff: "Intermediate",
                types: [
                    "Project"
                ]
            },
            {
                id: "ops-p4-s2",
                title: "Process Automation Project",
                desc: "Build a complete end-to-end process automation for a common operations workflow.",
                time: "4 hours",
                diff: "Intermediate",
                types: [
                    "Project"
                ]
            },
            {
                id: "ops-p4-s3",
                title: "Portfolio Presentation",
                desc: "Present your operations projects professionally.",
                time: "1 hour",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            }
        ])
    ],
    projects: [
        lightProject("ops-proj-1", "Real-Time Operations Dashboard", "Build a live operations dashboard that pulls data from multiple sources, shows key KPIs, and alerts the team to issues.", [
            "Airtable",
            "Make",
            "Slack",
            "AI summaries"
        ], [
            "Data collection automation",
            "Live dashboard",
            "Alert system",
            "AI narrative reports"
        ], "4 hours", "Intermediate", "ops-p4"),
        lightProject("ops-proj-2", "Employee Onboarding Automation", "Build a complete employee onboarding automation from offer acceptance to day-one setup.", [
            "Make",
            "Notion",
            "Email",
            "Slack"
        ], [
            "Onboarding trigger",
            "Task assignments",
            "Welcome communications",
            "Day-one checklist"
        ], "4 hours", "Intermediate", "ops-p4")
    ]
};
// ═══════════════════════════════════════════════════════════════════════════════
// 7. AI CUSTOMER SUPPORT AUTOMATION SPECIALIST
// ═══════════════════════════════════════════════════════════════════════════════
const aiCustomerSupportAutomation = {
    id: "7",
    slug: "ai-customer-support-automation-specialist",
    title: "AI Customer Support Automation Specialist",
    description: "Build AI-powered support flows, chatbots, knowledge bases, and ticket automation systems that delight customers at scale.",
    category: "Customer Support",
    level: "Intermediate",
    duration: "12 weeks",
    status: "coming-soon",
    totalEstimatedHours: 58,
    phases: [
        lightPhase("cs-p1", 1, "Customer Support Fundamentals", "Understand modern customer support operations and where AI creates the highest impact.", "You can analyse a support operation and identify automation opportunities.", "2 weeks", "Week 1–2", "free", [
            {
                id: "cs-p1-s1",
                title: "Support Operations Overview",
                desc: "How modern customer support teams operate — channels, tiers, metrics, and tools.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "cs-p1-s2",
                title: "Customer Journey in Support",
                desc: "Map the customer journey through a support interaction — from first contact to resolution.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Practice"
                ]
            },
            {
                id: "cs-p1-s3",
                title: "AI in Customer Support",
                desc: "How AI is transforming support — chatbots, ticket classification, knowledge bases, and sentiment analysis.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "cs-p1-s4",
                title: "Key Support Metrics",
                desc: "The metrics that matter in support: CSAT, FRT, resolution rate, and how AI improves each.",
                time: "20 min",
                diff: "Beginner",
                types: [
                    "Reading"
                ]
            }
        ]),
        lightPhase("cs-p2", 2, "Chatbot & AI Agent Design", "Design and build AI-powered chatbots and support agents that handle common customer queries.", "You can design and deploy a basic AI support chatbot.", "3 weeks", "Week 3–5", "locked", [
            {
                id: "cs-p2-s1",
                title: "Chatbot Design Principles",
                desc: "Design chatbots that feel helpful and natural — conversation flows, fallbacks, and escalation.",
                time: "35 min",
                diff: "Intermediate",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "cs-p2-s2",
                title: "Conversation Flow Mapping",
                desc: "Map conversation flows for the top 10 support queries — the foundation of any chatbot.",
                time: "40 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "cs-p2-s3",
                title: "AI Agent Tools Overview",
                desc: "Survey the tools for building AI support agents — Intercom, Tidio, Voiceflow, and custom builds.",
                time: "30 min",
                diff: "Intermediate",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "cs-p2-s4",
                title: "Building Your First Chatbot",
                desc: "Build a functional AI support chatbot for a sample business scenario.",
                time: "2 hours",
                diff: "Intermediate",
                types: [
                    "Practice",
                    "Project"
                ]
            },
            {
                id: "cs-p2-s5",
                title: "Testing and Improving",
                desc: "Test your chatbot with real scenarios and iterate based on conversation quality.",
                time: "1 hour",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("cs-p3", 3, "Knowledge Base & Ticket Automation", "Build an AI-powered knowledge base and automate ticket routing, classification, and resolution.", "You can build an AI-powered knowledge base and automate ticket workflows.", "4 weeks", "Week 6–9", "locked", [
            {
                id: "cs-p3-s1",
                title: "Knowledge Base Design",
                desc: "Design a knowledge base that AI can use to answer questions — structure, content, and maintenance.",
                time: "35 min",
                diff: "Intermediate",
                types: [
                    "Reading",
                    "Practice"
                ]
            },
            {
                id: "cs-p3-s2",
                title: "AI Content for Support",
                desc: "Use AI to generate, update, and improve knowledge base articles at scale.",
                time: "40 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "cs-p3-s3",
                title: "Ticket Classification Automation",
                desc: "Build an AI system that classifies incoming tickets by type, priority, and required skill.",
                time: "45 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "cs-p3-s4",
                title: "Auto-Resolution Workflows",
                desc: "Build workflows that automatically resolve common ticket types without human intervention.",
                time: "1 hour",
                diff: "Advanced",
                types: [
                    "Practice",
                    "Project"
                ]
            },
            {
                id: "cs-p3-s5",
                title: "Escalation Logic",
                desc: "Design intelligent escalation logic that routes complex issues to the right human agent.",
                time: "35 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("cs-p4", 4, "Support Automation Projects", "Build complete support automation systems for real business scenarios.", "You have 2 portfolio-ready support automation projects.", "3 weeks", "Week 10–12", "locked", [
            {
                id: "cs-p4-s1",
                title: "AI Support Chatbot Project",
                desc: "Build a complete AI support chatbot for a sample e-commerce business.",
                time: "5 hours",
                diff: "Intermediate",
                types: [
                    "Project"
                ]
            },
            {
                id: "cs-p4-s2",
                title: "Ticket Automation System",
                desc: "Build a complete ticket automation system with classification, routing, and escalation.",
                time: "4 hours",
                diff: "Advanced",
                types: [
                    "Project"
                ]
            },
            {
                id: "cs-p4-s3",
                title: "Portfolio Presentation",
                desc: "Present your support automation projects professionally.",
                time: "1 hour",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            }
        ])
    ],
    projects: [
        lightProject("cs-proj-1", "AI Support Chatbot", "Build an AI chatbot that handles the top 10 support queries for a sample e-commerce business, with escalation logic.", [
            "Voiceflow or Tidio",
            "OpenAI",
            "Knowledge base",
            "Escalation"
        ], [
            "Conversation flows",
            "AI responses",
            "Escalation logic",
            "Testing report"
        ], "5 hours", "Intermediate", "cs-p4"),
        lightProject("cs-proj-2", "Ticket Automation System", "Create an automated ticket routing and classification system with AI-powered auto-resolution and escalation.", [
            "Make",
            "OpenAI",
            "Helpdesk tool",
            "Slack"
        ], [
            "Ticket classification",
            "Auto-resolution",
            "Escalation routing",
            "Reporting"
        ], "4 hours", "Advanced", "cs-p4")
    ]
};
// ═══════════════════════════════════════════════════════════════════════════════
// 8. AI CONTENT SYSTEMS SPECIALIST
// ═══════════════════════════════════════════════════════════════════════════════
const aiContentSystems = {
    id: "8",
    slug: "ai-content-systems-specialist",
    title: "AI Content Systems Specialist",
    description: "Design AI-assisted content creation systems for social media, blogs, newsletters, and video workflows that produce consistent output at scale.",
    category: "Content",
    level: "Beginner",
    duration: "8 weeks",
    status: "coming-soon",
    totalEstimatedHours: 42,
    phases: [
        lightPhase("cnt-p1", 1, "Content Systems Thinking", "Move from one-off content creation to systematic, scalable content production using AI.", "You can design a repeatable content system for any channel.", "2 weeks", "Week 1–2", "free", [
            {
                id: "cnt-p1-s1",
                title: "Content System Design",
                desc: "What a content system is and why it's more powerful than creating content one piece at a time.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "cnt-p1-s2",
                title: "Content Pillars and Strategy",
                desc: "Define content pillars, themes, and a strategy that guides AI-assisted content creation.",
                time: "30 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Practice"
                ]
            },
            {
                id: "cnt-p1-s3",
                title: "AI in Content Creation",
                desc: "How AI tools are used across the content creation process — ideation, writing, editing, and distribution.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "cnt-p1-s4",
                title: "Content Calendar Design",
                desc: "Design a content calendar system that integrates AI generation and human review.",
                time: "35 min",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("cnt-p2", 2, "AI Writing & Editing", "Use AI tools to write, edit, repurpose, and improve content across formats.", "You can use AI to produce high-quality content efficiently.", "2 weeks", "Week 3–4", "locked", [
            {
                id: "cnt-p2-s1",
                title: "AI Writing Tools",
                desc: "Survey and compare the top AI writing tools — ChatGPT, Claude, Jasper, and specialist tools.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "cnt-p2-s2",
                title: "Prompt Engineering for Content",
                desc: "Write prompts that produce on-brand, high-quality content consistently.",
                time: "35 min",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            },
            {
                id: "cnt-p2-s3",
                title: "Editing and Refining AI Output",
                desc: "Develop an editing workflow that turns good AI output into great content.",
                time: "30 min",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            },
            {
                id: "cnt-p2-s4",
                title: "Repurposing Content with AI",
                desc: "Turn one piece of content into many — blog to social, video to newsletter, podcast to article.",
                time: "35 min",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("cnt-p3", 3, "Multi-Channel Content Automation", "Automate content distribution across blogs, social media, email, and video platforms.", "You can automate multi-channel content distribution.", "2 weeks", "Week 5–6", "locked", [
            {
                id: "cnt-p3-s1",
                title: "Social Media Automation",
                desc: "Automate social media posting, scheduling, and engagement monitoring.",
                time: "40 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "cnt-p3-s2",
                title: "Newsletter Automation",
                desc: "Build an automated newsletter system that generates, curates, and sends content weekly.",
                time: "45 min",
                diff: "Intermediate",
                types: [
                    "Practice",
                    "Project"
                ]
            },
            {
                id: "cnt-p3-s3",
                title: "Blog Publishing Workflows",
                desc: "Automate the blog content workflow from AI draft to published post.",
                time: "35 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "cnt-p3-s4",
                title: "Video Content Workflows",
                desc: "Use AI to assist with video scripts, thumbnails, descriptions, and repurposing.",
                time: "35 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("cnt-p4", 4, "Content System Projects", "Build a complete AI content system for a real brand or niche.", "You have a portfolio-ready AI content system.", "2 weeks", "Week 7–8", "locked", [
            {
                id: "cnt-p4-s1",
                title: "Content System Design Project",
                desc: "Design and build a complete AI content system for a sample brand.",
                time: "4 hours",
                diff: "Intermediate",
                types: [
                    "Project"
                ]
            },
            {
                id: "cnt-p4-s2",
                title: "Multi-Channel Automation",
                desc: "Automate content distribution across at least 3 channels.",
                time: "3 hours",
                diff: "Intermediate",
                types: [
                    "Project"
                ]
            },
            {
                id: "cnt-p4-s3",
                title: "Portfolio Presentation",
                desc: "Present your content system professionally.",
                time: "1 hour",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            }
        ])
    ],
    projects: [
        lightProject("cnt-proj-1", "AI Content Calendar System", "Build a complete AI-powered content calendar that generates ideas, creates drafts, and schedules posts weekly.", [
            "Make",
            "OpenAI",
            "Airtable",
            "Social tools"
        ], [
            "Content idea generation",
            "AI drafting",
            "Scheduling automation",
            "Performance tracking"
        ], "4 hours", "Intermediate", "cnt-p4"),
        lightProject("cnt-proj-2", "Multi-Channel Content Repurposing", "Create an automation that takes one blog post and repurposes it into 5 different content formats across 3 channels.", [
            "Make",
            "OpenAI",
            "Social tools",
            "Email"
        ], [
            "Blog-to-social automation",
            "Format adaptation",
            "Multi-channel distribution",
            "Documentation"
        ], "3 hours", "Intermediate", "cnt-p4")
    ]
};
// ═══════════════════════════════════════════════════════════════════════════════
// 9. JUNIOR AI AGENT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════
const juniorAiAgentBuilder = {
    id: "9",
    slug: "junior-ai-agent-builder",
    title: "Junior AI Agent Builder",
    description: "Learn to build simple AI agents that can use tools, follow workflows, and complete structured tasks with minimal human intervention.",
    category: "AI Agents",
    level: "Intermediate",
    duration: "14 weeks",
    status: "coming-soon",
    totalEstimatedHours: 68,
    phases: [
        lightPhase("agt-p1", 1, "AI Agent Foundations", "Understand what AI agents are, how they reason, and how they differ from simple chatbots.", "You can explain AI agent architecture and identify agent use cases.", "2 weeks", "Week 1–2", "free", [
            {
                id: "agt-p1-s1",
                title: "What Is an AI Agent?",
                desc: "A clear, practical explanation of AI agents — what they are, how they work, and why they matter.",
                time: "25 min",
                diff: "Intermediate",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "agt-p1-s2",
                title: "Agent vs Chatbot",
                desc: "The key differences between a chatbot and an AI agent — autonomy, tools, and multi-step reasoning.",
                time: "20 min",
                diff: "Intermediate",
                types: [
                    "Reading"
                ]
            },
            {
                id: "agt-p1-s3",
                title: "Reasoning and Planning Basics",
                desc: "How AI agents plan and reason through multi-step tasks — chain-of-thought, ReAct, and planning loops.",
                time: "30 min",
                diff: "Intermediate",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "agt-p1-s4",
                title: "Agent Use Cases",
                desc: "Real-world AI agent use cases — research agents, coding agents, support agents, and data agents.",
                time: "25 min",
                diff: "Intermediate",
                types: [
                    "Reading"
                ]
            }
        ]),
        lightPhase("agt-p2", 2, "Tool Use & Function Calling", "Build agents that use tools — web search, calculators, APIs, and databases.", "You can build agents that use multiple tools to complete tasks.", "3 weeks", "Week 3–5", "locked", [
            {
                id: "agt-p2-s1",
                title: "Tool Use Concepts",
                desc: "How AI agents decide which tool to use and when — the tool selection problem.",
                time: "25 min",
                diff: "Intermediate",
                types: [
                    "Reading"
                ]
            },
            {
                id: "agt-p2-s2",
                title: "Function Calling Basics",
                desc: "Use OpenAI's function calling to give agents structured access to external tools.",
                time: "40 min",
                diff: "Intermediate",
                types: [
                    "Practice",
                    "Video"
                ]
            },
            {
                id: "agt-p2-s3",
                title: "Web Search Integration",
                desc: "Give your agent the ability to search the web and incorporate real-time information.",
                time: "40 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "agt-p2-s4",
                title: "API Tool Integration",
                desc: "Connect your agent to external APIs — weather, databases, calculators, and more.",
                time: "45 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "agt-p2-s5",
                title: "Multi-Tool Agents",
                desc: "Build agents that intelligently select and combine multiple tools to complete complex tasks.",
                time: "1 hour",
                diff: "Advanced",
                types: [
                    "Practice",
                    "Project"
                ]
            }
        ]),
        lightPhase("agt-p3", 3, "Agent Workflow Design", "Design structured agent workflows — planning, execution, reflection, and error recovery.", "You can design and implement structured agent workflows.", "4 weeks", "Week 6–9", "locked", [
            {
                id: "agt-p3-s1",
                title: "Agent Planning Patterns",
                desc: "Common patterns for structuring agent planning — sequential, parallel, and hierarchical.",
                time: "35 min",
                diff: "Advanced",
                types: [
                    "Reading",
                    "Practice"
                ]
            },
            {
                id: "agt-p3-s2",
                title: "Execution and Monitoring",
                desc: "How to monitor agent execution, log steps, and track what the agent is doing.",
                time: "35 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "agt-p3-s3",
                title: "Error Recovery Logic",
                desc: "Build agents that recover gracefully from errors — retries, fallbacks, and human escalation.",
                time: "40 min",
                diff: "Advanced",
                types: [
                    "Practice"
                ]
            },
            {
                id: "agt-p3-s4",
                title: "Multi-Step Agent Tasks",
                desc: "Build agents that complete multi-step tasks — research, write, review, and submit.",
                time: "1 hour",
                diff: "Advanced",
                types: [
                    "Practice",
                    "Project"
                ]
            },
            {
                id: "agt-p3-s5",
                title: "Agent Testing",
                desc: "Test your agents systematically — happy paths, edge cases, and adversarial inputs.",
                time: "45 min",
                diff: "Advanced",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("agt-p4", 4, "Agent Platforms & Deployment", "Use platforms like LangChain, Flowise, and n8n AI to build and deploy agents.", "You can build and deploy agents using no-code and low-code platforms.", "3 weeks", "Week 10–12", "locked", [
            {
                id: "agt-p4-s1",
                title: "LangChain Overview",
                desc: "Introduction to LangChain — the most popular framework for building AI agents.",
                time: "40 min",
                diff: "Advanced",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "agt-p4-s2",
                title: "Flowise Visual Agents",
                desc: "Build agents visually using Flowise — a no-code interface for LangChain.",
                time: "1 hour",
                diff: "Intermediate",
                types: [
                    "Practice",
                    "Video"
                ]
            },
            {
                id: "agt-p4-s3",
                title: "n8n AI Workflows",
                desc: "Use n8n's AI nodes to build agent-like workflows without deep coding.",
                time: "45 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "agt-p4-s4",
                title: "Deployment Basics",
                desc: "Deploy your agent to a simple endpoint that can be called from other tools.",
                time: "40 min",
                diff: "Advanced",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("agt-p5", 5, "Agent Projects", "Build real AI agent projects that demonstrate practical value.", "You have 2 portfolio-ready AI agent projects.", "2 weeks", "Week 13–14", "locked", [
            {
                id: "agt-p5-s1",
                title: "Research & Summary Agent",
                desc: "Build a complete research agent that searches, reads, synthesises, and reports.",
                time: "5 hours",
                diff: "Advanced",
                types: [
                    "Project"
                ]
            },
            {
                id: "agt-p5-s2",
                title: "Task Automation Agent",
                desc: "Build an agent that accepts a task description and executes it using multiple tools.",
                time: "5 hours",
                diff: "Advanced",
                types: [
                    "Project"
                ]
            },
            {
                id: "agt-p5-s3",
                title: "Documentation and Presentation",
                desc: "Document and present your agent projects professionally.",
                time: "1 hour",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            }
        ])
    ],
    projects: [
        lightProject("agt-proj-1", "Research & Summary Agent", "Build an AI agent that researches a given topic, synthesises findings from multiple sources, and produces a structured report.", [
            "LangChain or Flowise",
            "Web search",
            "OpenAI",
            "Report generation"
        ], [
            "Topic research",
            "Multi-source synthesis",
            "Structured report",
            "Documentation"
        ], "5 hours", "Advanced", "agt-p5"),
        lightProject("agt-proj-2", "Task Automation Agent", "Build an agent that accepts a natural language task, breaks it into steps, executes each step using tools, and delivers a result.", [
            "LangChain or n8n",
            "Multiple APIs",
            "Task planning",
            "Tool use"
        ], [
            "Task parsing",
            "Step planning",
            "Tool execution",
            "Result delivery"
        ], "5 hours", "Advanced", "agt-p5")
    ]
};
// ═══════════════════════════════════════════════════════════════════════════════
// 10. AI BUSINESS PROCESS ANALYST
// ═══════════════════════════════════════════════════════════════════════════════
const aiBusinessProcessAnalyst = {
    id: "10",
    slug: "ai-business-process-analyst",
    title: "AI Business Process Analyst",
    description: "Analyse business processes and identify where AI and automation can reduce manual work and create measurable value — then design the roadmap to get there.",
    category: "Business Analysis",
    level: "Beginner to Intermediate",
    duration: "10 weeks",
    status: "coming-soon",
    totalEstimatedHours: 50,
    phases: [
        lightPhase("bpa-p1", 1, "Business Analysis Fundamentals", "Learn the core skills of business analysis — process mapping, stakeholder interviews, and requirements gathering.", "You can conduct a business process analysis and document findings professionally.", "2 weeks", "Week 1–2", "free", [
            {
                id: "bpa-p1-s1",
                title: "Business Analysis Overview",
                desc: "What business analysts do, how they create value, and where AI BPAs fit in modern organisations.",
                time: "25 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Video"
                ]
            },
            {
                id: "bpa-p1-s2",
                title: "Stakeholder Interviews",
                desc: "How to conduct effective stakeholder interviews to understand processes, pain points, and goals.",
                time: "30 min",
                diff: "Beginner",
                types: [
                    "Reading",
                    "Practice"
                ]
            },
            {
                id: "bpa-p1-s3",
                title: "Process Mapping Techniques",
                desc: "Master process mapping — flowcharts, swimlane diagrams, and value stream maps.",
                time: "35 min",
                diff: "Beginner",
                types: [
                    "Practice",
                    "Video"
                ]
            },
            {
                id: "bpa-p1-s4",
                title: "Requirements Documentation",
                desc: "Write clear, structured requirements documents that guide automation projects.",
                time: "30 min",
                diff: "Beginner",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("bpa-p2", 2, "AI Opportunity Assessment", "Learn to systematically identify, evaluate, and prioritise AI automation opportunities in any business.", "You can produce a prioritised AI opportunity assessment for any business.", "3 weeks", "Week 3–5", "locked", [
            {
                id: "bpa-p2-s1",
                title: "AI Opportunity Framework",
                desc: "A structured framework for identifying and evaluating AI automation opportunities.",
                time: "30 min",
                diff: "Intermediate",
                types: [
                    "Reading",
                    "Practice"
                ]
            },
            {
                id: "bpa-p2-s2",
                title: "Process Scoring Methodology",
                desc: "Score processes on automation suitability — volume, complexity, data quality, and impact.",
                time: "35 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "bpa-p2-s3",
                title: "ROI Estimation Basics",
                desc: "Estimate the return on investment for AI automation projects — time saved, cost reduced, and risk lowered.",
                time: "35 min",
                diff: "Intermediate",
                types: [
                    "Reading",
                    "Practice"
                ]
            },
            {
                id: "bpa-p2-s4",
                title: "Prioritisation Matrix",
                desc: "Build a prioritisation matrix that ranks automation opportunities by impact and feasibility.",
                time: "30 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "bpa-p2-s5",
                title: "Opportunity Report Writing",
                desc: "Write a professional AI opportunity assessment report that stakeholders can act on.",
                time: "45 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("bpa-p3", 3, "Automation Strategy & Roadmap", "Design an AI automation strategy and 90-day implementation roadmap for a business.", "You can design and present a credible AI automation strategy.", "3 weeks", "Week 6–8", "locked", [
            {
                id: "bpa-p3-s1",
                title: "Strategy Design",
                desc: "Design an AI automation strategy aligned with business goals and constraints.",
                time: "35 min",
                diff: "Intermediate",
                types: [
                    "Reading",
                    "Practice"
                ]
            },
            {
                id: "bpa-p3-s2",
                title: "Roadmap Planning",
                desc: "Create a phased 90-day implementation roadmap with clear milestones and success criteria.",
                time: "40 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "bpa-p3-s3",
                title: "Change Management Basics",
                desc: "Address the human side of automation — how to manage change and get team buy-in.",
                time: "30 min",
                diff: "Intermediate",
                types: [
                    "Reading"
                ]
            },
            {
                id: "bpa-p3-s4",
                title: "Stakeholder Communication",
                desc: "Communicate your automation strategy and roadmap to different stakeholder groups effectively.",
                time: "30 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            },
            {
                id: "bpa-p3-s5",
                title: "Presenting Recommendations",
                desc: "Present your analysis and recommendations in a compelling, professional format.",
                time: "35 min",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            }
        ]),
        lightPhase("bpa-p4", 4, "Analyst Projects", "Deliver a complete AI business process analysis for a real or simulated business scenario.", "You have a portfolio-ready business process analysis project.", "2 weeks", "Week 9–10", "locked", [
            {
                id: "bpa-p4-s1",
                title: "AI Opportunity Assessment Project",
                desc: "Conduct a full AI opportunity assessment for a sample business.",
                time: "4 hours",
                diff: "Intermediate",
                types: [
                    "Project"
                ]
            },
            {
                id: "bpa-p4-s2",
                title: "Automation Strategy Presentation",
                desc: "Design and present a 90-day automation strategy for your sample business.",
                time: "3 hours",
                diff: "Intermediate",
                types: [
                    "Project"
                ]
            },
            {
                id: "bpa-p4-s3",
                title: "Portfolio Presentation",
                desc: "Present your analysis projects professionally.",
                time: "1 hour",
                diff: "Intermediate",
                types: [
                    "Practice"
                ]
            }
        ])
    ],
    projects: [
        lightProject("bpa-proj-1", "AI Opportunity Assessment Report", "Conduct a full AI opportunity assessment for a sample business and produce a prioritised, professional report.", [
            "Process mapping",
            "Scoring framework",
            "ROI estimation",
            "Report writing"
        ], [
            "Process inventory",
            "Scoring matrix",
            "Prioritised opportunities",
            "Executive summary"
        ], "4 hours", "Intermediate", "bpa-p4"),
        lightProject("bpa-proj-2", "Automation Strategy Presentation", "Design a 90-day AI automation strategy and present it as a professional stakeholder presentation.", [
            "Strategy design",
            "Roadmap planning",
            "Presentation design"
        ], [
            "Strategy document",
            "90-day roadmap",
            "Stakeholder slides",
            "Success metrics"
        ], "3 hours", "Intermediate", "bpa-p4")
    ]
};
const allRoadmaps = [
    aiAutomationSpecialist,
    aiWorkflowBuilder,
    noCodeAiAutomation,
    aiMarketingAutomation,
    aiProductivityConsultant,
    aiOperationsAssistant,
    aiCustomerSupportAutomation,
    aiContentSystems,
    juniorAiAgentBuilder,
    aiBusinessProcessAnalyst
];
function getRoadmapBySlug(slug) {
    return allRoadmaps.find((r)=>r.slug === slug);
}
function getAllSlugs() {
    return allRoadmaps.map((r)=>r.slug);
}
}),
"[project]/src/components/roadmap/ComingSoonRoadmap.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[project]/src/components/landing/Header.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Header
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
// src/components/landing/Header.tsx
// Sticky top navigation with brand name, section links, and waitlist CTA.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
;
;
function Header() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    href: "/",
                    className: "flex items-center gap-2",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xl font-bold text-gray-900 tracking-tight",
                        children: "AI Career Roadmaps"
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/Header.tsx",
                        lineNumber: 12,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/Header.tsx",
                    lineNumber: 11,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                    className: "hidden items-center gap-6 md:flex",
                    "aria-label": "Main navigation",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: "#roadmaps",
                            className: "text-sm font-medium text-gray-600 transition-colors hover:text-gray-900",
                            children: "Roadmaps"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/Header.tsx",
                            lineNumber: 19,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: "#preview",
                            className: "text-sm font-medium text-gray-600 transition-colors hover:text-gray-900",
                            children: "Preview"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/Header.tsx",
                            lineNumber: 25,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: "#how-it-works",
                            className: "text-sm font-medium text-gray-600 transition-colors hover:text-gray-900",
                            children: "How It Works"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/Header.tsx",
                            lineNumber: 31,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: "#pricing",
                            className: "text-sm font-medium text-gray-600 transition-colors hover:text-gray-900",
                            children: "Pricing"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/Header.tsx",
                            lineNumber: 37,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/landing/Header.tsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    href: "#waitlist",
                    className: "rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                    children: "Join Waitlist"
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/Header.tsx",
                    lineNumber: 46,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/landing/Header.tsx",
            lineNumber: 9,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/landing/Header.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/roadmaps/[slug]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RoadmapPage,
    "generateMetadata",
    ()=>generateMetadata,
    "generateStaticParams",
    ()=>generateStaticParams
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
// src/app/roadmaps/[slug]/page.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$roadmaps$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/roadmaps.ts [app-rsc] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '@/components/roadmap/RoadmapPageClient'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$roadmap$2f$ComingSoonRoadmap$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/roadmap/ComingSoonRoadmap.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$Header$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/landing/Header.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
;
function generateStaticParams() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$roadmaps$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAllSlugs"])().map((slug)=>({
            slug
        }));
}
async function generateMetadata({ params }) {
    const { slug } = await params;
    const roadmap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$roadmaps$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getRoadmapBySlug"])(slug);
    if (!roadmap) return {
        title: "Roadmap Not Found — AI Career Roadmaps"
    };
    return {
        title: `${roadmap.title} Roadmap — AI Career Roadmaps`,
        description: roadmap.description
    };
}
async function RoadmapPage({ params }) {
    const { slug } = await params;
    const roadmap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$roadmaps$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getRoadmapBySlug"])(slug);
    if (!roadmap) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    if (roadmap.status === "coming-soon") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$Header$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/src/app/roadmaps/[slug]/page.tsx",
                    lineNumber: 40,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$roadmap$2f$ComingSoonRoadmap$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    roadmap: roadmap
                }, void 0, false, {
                    fileName: "[project]/src/app/roadmaps/[slug]/page.tsx",
                    lineNumber: 41,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(RoadmapPageClient, {
        roadmap: roadmap
    }, void 0, false, {
        fileName: "[project]/src/app/roadmaps/[slug]/page.tsx",
        lineNumber: 46,
        columnNumber: 10
    }, this);
}
}),
"[project]/src/app/roadmaps/[slug]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/roadmaps/[slug]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1g3snqu._.js.map