module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/data/roadmaps.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "allRoadmaps",
    ()=>allRoadmaps,
    "getAllSlugs",
    ()=>getAllSlugs,
    "getRoadmapBySlug",
    ()=>getRoadmapBySlug,
    "getRoadmapsByStatus",
    ()=>getRoadmapsByStatus
]);
const URLS = {
    karpathyIntroLlm: "https://www.youtube.com/watch?v=zjkBMFhNj_g",
    karpathyBuildGpt: "https://www.youtube.com/watch?v=kCc8FmEb1nY",
    fccAi: "https://www.freecodecamp.org/news/artificial-intelligence-ai/",
    openAiPrompting: "https://platform.openai.com/docs/guides/prompt-engineering",
    openAiText: "https://platform.openai.com/docs/guides/text-generation",
    openAiStructured: "https://platform.openai.com/docs/guides/structured-outputs",
    openAiVision: "https://platform.openai.com/docs/guides/vision",
    openAiSpeech: "https://platform.openai.com/docs/guides/speech-to-text",
    learnPrompting: "https://learnprompting.org/docs/introduction",
    zapierLearn: "https://zapier.com/learn",
    zapierQuickStart: "https://zapier.com/help/create/basics/create-zaps",
    zapierFormatter: "https://zapier.com/help/create/format/get-started-with-formatter",
    zapierPaths: "https://zapier.com/help/create/paths/get-started-with-paths",
    makeHelp: "https://www.make.com/en/help",
    makeRouter: "https://www.make.com/en/help/modules/router",
    n8nDocs: "https://docs.n8n.io/",
    n8nWebhook: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/",
    postman: "https://learning.postman.com/docs/introduction/overview/",
    rapidApi: "https://docs.rapidapi.com/",
    lucidchart: "https://www.lucidchart.com/pages/process-mapping",
    miroWorkflow: "https://miro.com/templates/workflow/",
    anthropicPrompting: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
    anthropicApi: "https://docs.anthropic.com/en/api/messages",
    llamaIndex: "https://docs.llamaindex.ai/en/stable/",
    unstructured: "https://docs.unstructured.io/open-source/introduction/overview",
    gmailApi: "https://developers.google.com/gmail/api/guides",
    slackWebhooks: "https://api.slack.com/messaging/webhooks",
    pandas: "https://pandas.pydata.org/docs/user_guide/10min.html",
    kaggleDataCleaning: "https://www.kaggle.com/learn/data-cleaning",
    owaspApi: "https://owasp.org/API-Security/editions/2023/en/0x11-t10/",
    googleSecurity: "https://cloud.google.com/security/best-practices",
    githubPages: "https://docs.github.com/en/pages/quickstart",
    devToAutomation: "https://dev.to/t/automation",
    notionTemplates: "https://www.notion.com/templates",
    loomDocs: "https://www.loom.com/blog/documentation",
    upworkAiAutomation: "https://www.upwork.com/hire/ai-automation-freelancers/",
    toptalFreelance: "https://www.toptal.com/freelance/dont-be-afraid-to-freelance-a-guide-to-getting-started",
    illustratedTransformer: "https://jalammar.github.io/illustrated-transformer/",
    hfGeneration: "https://huggingface.co/docs/transformers/en/generation_strategies",
    cotPaper: "https://arxiv.org/abs/2201.11903",
    googleCot: "https://research.google/blog/language-models-perform-reasoning-via-chain-of-thought/",
    gpt3Paper: "https://arxiv.org/abs/2005.14165",
    reactPaper: "https://arxiv.org/abs/2210.03629",
    langchainAgents: "https://js.langchain.com/docs/tutorials/agents/",
    langchainLcel: "https://js.langchain.com/docs/concepts/lcel/",
    promptFlow: "https://microsoft.github.io/promptflow/",
    openAiPolicies: "https://openai.com/policies/usage-policies/",
    helm: "https://crfm.stanford.edu/helm/latest/",
    promptBench: "https://arxiv.org/abs/2306.04528",
    instructor: "https://github.com/instructor-ai/instructor",
    promptLayer: "https://docs.promptlayer.com/",
    langSmith: "https://docs.smith.langchain.com/",
    geminiVision: "https://ai.google.dev/gemini-api/docs/vision",
    copilotPrompting: "https://docs.github.com/en/copilot/using-github-copilot/copilot-chat/prompt-engineering-for-copilot-chat",
    cursorDocs: "https://docs.cursor.com/",
    elevenLabs: "https://elevenlabs.io/docs/cookbooks/prompting",
    awesomePrompts: "https://github.com/f/awesome-chatgpt-prompts",
    flowGpt: "https://flowgpt.com/",
    azureOpenAi: "https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering",
    bedrockPrompting: "https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-engineering-guidelines.html",
    khanStats: "https://www.khanacademy.org/math/statistics-probability",
    statQuest: "https://www.youtube.com/@statquest",
    fccPythonData: "https://www.youtube.com/watch?v=r-uOLxNrNk8",
    kagglePython: "https://www.kaggle.com/learn/python",
    chatGptData: "https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt",
    claudeFiles: "https://support.anthropic.com/en/articles/8241126-using-files-with-claude",
    dataToViz: "https://www.data-to-viz.com/",
    storytellingData: "https://www.storytellingwithdata.com/blog",
    kaggleTitanic: "https://www.kaggle.com/c/titanic",
    colab: "https://colab.research.google.com/notebooks/intro.ipynb",
    sqlBolt: "https://sqlbolt.com/",
    postgresTutorial: "https://www.postgresql.org/docs/current/tutorial.html",
    matplotlib: "https://matplotlib.org/stable/tutorials/index.html",
    seaborn: "https://seaborn.pydata.org/tutorial.html",
    lookerStudio: "https://support.google.com/looker-studio/answer/6283323",
    powerBi: "https://learn.microsoft.com/en-us/power-bi/fundamentals/power-bi-overview",
    tableau: "https://help.tableau.com/current/guides/get-started-tutorial/en-us/get-started-tutorial-home.htm",
    kagglePandas: "https://www.kaggle.com/learn/pandas",
    kaggleMl: "https://www.kaggle.com/learn/intro-to-machine-learning",
    fccSeo: "https://www.freecodecamp.org/news/seo-for-developers/",
    googleSeo: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
    youtubeCreators: "https://www.youtube.com/creators/",
    hubspotContent: "https://blog.hubspot.com/marketing/content-marketing",
    sklearn: "https://scikit-learn.org/stable/tutorial/basic/tutorial.html",
    pytorch: "https://pytorch.org/tutorials/beginner/basics/intro.html",
    fastAi: "https://course.fast.ai/",
    mlopsZoomcamp: "https://github.com/DataTalksClub/mlops-zoomcamp",
    mindTheProduct: "https://www.mindtheproduct.com/",
    productSchoolAi: "https://productschool.com/blog/artificial-intelligence/ai-product-management",
    nngroupAiUx: "https://www.nngroup.com/articles/ai-user-experience/",
    figmaAi: "https://help.figma.com/hc/en-us/articles/23954856027159-Use-First-Draft-to-generate-designs",
    langchainRag: "https://js.langchain.com/docs/tutorials/rag/",
    pineconeLearn: "https://www.pinecone.io/learn/",
    hfCourse: "https://huggingface.co/learn/nlp-course/chapter1/1",
    euAiAct: "https://artificialintelligenceact.eu/",
    nistAiRmf: "https://www.nist.gov/itl/ai-risk-management-framework",
    googleResponsibleAi: "https://ai.google/responsibility/responsible-ai-practices/",
    salesforceAi: "https://www.salesforce.com/artificial-intelligence/",
    hubspotAiSales: "https://blog.hubspot.com/sales/ai-sales",
    googleAnalytics: "https://support.google.com/analytics/answer/9304153"
};
function r(label, type, url) {
    return {
        label,
        type,
        url
    };
}
function q(id, question, options, correctAnswerIndex, explanation) {
    return {
        id,
        question,
        options,
        correctAnswerIndex,
        explanation
    };
}
function test(id, title, questions) {
    return {
        id,
        title,
        questions
    };
}
function domainCheckQuestions(id, title, correct, distractors, explanation) {
    return [
        q(`${id}-q1`, `In ${title}, which option is the correct technical choice?`, [
            distractors[0],
            correct,
            distractors[1],
            distractors[2]
        ], 1, explanation),
        q(`${id}-q2`, `A workflow for ${title} fails because the team used "${distractors[0]}". What should they use instead?`, [
            correct,
            distractors[0],
            distractors[1],
            distractors[2]
        ], 0, explanation),
        q(`${id}-q3`, `Which review check best confirms ${title} is ready for a client or stakeholder?`, [
            "Only checking whether the output looks impressive",
            "Verifying the output against source data, constraints, and acceptance criteria",
            "Removing all logs after a successful demo",
            "Using the same prompt or workflow for every domain"
        ], 1, "Professional AI work needs verification against source data, constraints, and acceptance criteria before handoff.")
    ];
}
function section(input) {
    const supplementalQuestion = q(`${input.id}-q${input.questions.length + 1}`, `Which validation step is most appropriate for ${input.title}?`, [
        "Accepting the first AI or automation output without checking it",
        "Comparing the output with source data, tool logs, and task-specific requirements",
        "Deleting input examples after every run",
        "Changing multiple variables before each test run"
    ], 1, "Reliable AI and automation work requires validating outputs against source data, execution logs, and task requirements.");
    const questions = input.questions.length >= 3 ? input.questions.slice(0, 5) : [
        ...input.questions,
        supplementalQuestion
    ];
    return {
        id: input.id,
        title: input.title,
        description: input.description,
        estimatedTime: input.estimatedTime,
        difficulty: input.difficulty,
        learningTypes: input.learningTypes,
        resources: input.resources,
        test: test(`${input.id}-test`, `${input.title} Check`, questions)
    };
}
function lightSection(input) {
    return section({
        ...input,
        questions: domainCheckQuestions(input.id, input.title, input.correct, input.distractors, input.explanation)
    });
}
function phase(id, phaseNumber, title, description, outcome, estimatedDuration, weekRange, access, sections) {
    return {
        id,
        phaseNumber,
        title,
        description,
        estimatedDuration,
        weekRange,
        outcome,
        access,
        sections,
        finalTest: test(`${id}-final`, `Phase ${phaseNumber} Final: ${title}`, [
            q(`${id}-final-q1`, `In ${title}, what should be defined before a workflow, prompt, model, or dashboard is released?`, [
                "Only the tool brand used in the demo",
                "Input data, output format, acceptance criteria, owner, and validation method",
                "A promise that the AI will never make mistakes",
                "The color of the final presentation"
            ], 1, "A professional release needs defined inputs, outputs, owners, validation, and acceptance criteria."),
            q(`${id}-final-q2`, `Which signal indicates a quality problem during ${title}?`, [
                "The workflow includes source links and logs",
                "Outputs are confident but cannot be traced to source data, rules, or tests",
                "The project has a rollback or revision plan",
                "The team records assumptions and constraints"
            ], 1, "Confident untraceable outputs are a core risk in AI-enabled work."),
            q(`${id}-final-q3`, `Which artifact best supports maintenance after ${title} is handed off?`, [
                "A private chat message with no context",
                "A runbook or case study with data sources, configuration, tests, and known limitations",
                "A screenshot of the final result only",
                "An undocumented copy of the prompt or workflow"
            ], 1, "Maintenance requires documented sources, configuration, tests, limitations, and ownership."),
            q(`${id}-final-q4`, `When a result from ${title} affects customers or business decisions, what should happen before it is trusted?`, [
                "It should be reviewed against source evidence and domain rules",
                "It should be accepted because it was generated quickly",
                "It should be hidden from stakeholders",
                "It should be reformatted without checking substance"
            ], 0, "Customer-facing and decision-support outputs need evidence checks and domain review."),
            q(`${id}-final-q5`, `Which metric or check is most useful for proving ${title} created value?`, [
                "Number of tools mentioned in the project",
                "Measured accuracy, time saved, risk reduced, revenue impact, or stakeholder task success",
                "Whether the demo used the newest AI model",
                "Number of colors used in the interface"
            ], 1, "Professional AI work should connect technical output to measurable quality, efficiency, risk, or business value.")
        ])
    };
}
function project(id, title, scenario, skills, deliverables, estimatedTime, difficulty, relatedPhaseId) {
    return {
        id,
        title,
        scenario,
        skills,
        deliverables,
        estimatedTime,
        difficulty,
        relatedPhaseId
    };
}
function lightPhase(prefix, phaseNumber, title, description, outcome, weekRange, sections) {
    return phase(`${prefix}-p${phaseNumber}`, phaseNumber, title, description, outcome, "2 weeks", weekRange, phaseNumber === 1 ? "free" : "locked", sections.map((item, index)=>lightSection({
            ...item,
            id: `${prefix}-p${phaseNumber}-s${index + 1}`
        })));
}
const aiAutomationSpecialist = {
    id: "1",
    slug: "ai-automation-specialist",
    title: "AI Automation Specialist",
    description: "Build practical AI-powered business automations with no-code platforms, APIs, workflow design, and client-ready documentation.",
    category: "Automation",
    level: "Beginner to Intermediate",
    duration: "12 weeks",
    status: "mvp-ready",
    totalEstimatedHours: 72,
    phases: [
        phase("auto-p1", 1, "AI & Automation Foundations", "Understand LLM behavior, prompting, triggers, actions, and workflow mapping before building automations.", "You can design and explain a simple business automation with AI safely in the loop.", "2 weeks", "Week 1-2", "free", [
            section({
                id: "auto-p1-s1",
                title: "What AI Can and Cannot Do",
                description: "Learn how LLMs generate text, why hallucinations happen, and where human validation is still required.",
                estimatedTime: "3 hours",
                difficulty: "Beginner",
                learningTypes: [
                    "Video",
                    "Reading",
                    "Quiz"
                ],
                resources: [
                    r("Andrej Karpathy: Intro to LLMs", "video", URLS.karpathyIntroLlm),
                    r("freeCodeCamp: Artificial Intelligence Explained", "article", URLS.fccAi)
                ],
                questions: [
                    q("auto-p1-s1-q1", "What is an LLM hallucination?", [
                        "A model refusing to answer unsafe prompts",
                        "A confident answer that is not grounded in reliable facts",
                        "A longer context window",
                        "A lower temperature setting"
                    ], 1, "Hallucinations are plausible but false or unsupported model outputs."),
                    q("auto-p1-s1-q2", "Which task should not be fully delegated to an LLM without checks?", [
                        "Drafting a support email",
                        "Summarizing a meeting transcript",
                        "Making a legally binding decision from incomplete evidence",
                        "Generating alternate headline ideas"
                    ], 2, "High-stakes decisions need authoritative data, policies, and human accountability.")
                ]
            }),
            section({
                id: "auto-p1-s2",
                title: "Prompt Engineering Fundamentals",
                description: "Practice role, context, constraints, examples, and output formats for reliable automation prompts.",
                estimatedTime: "3 hours",
                difficulty: "Beginner",
                learningTypes: [
                    "Reading",
                    "Practice",
                    "Quiz"
                ],
                resources: [
                    r("OpenAI Prompt Engineering Guide", "article", URLS.openAiPrompting),
                    r("Learn Prompting: Introduction", "article", URLS.learnPrompting)
                ],
                questions: [
                    q("auto-p1-s2-q1", "What is few-shot prompting?", [
                        "Providing examples of the desired input-output pattern",
                        "Setting temperature to zero",
                        "Using only a system prompt",
                        "Asking the model to browse the web"
                    ], 0, "Few-shot prompts include examples so the model can infer the target pattern."),
                    q("auto-p1-s2-q2", "What is the main purpose of a system prompt?", [
                        "To define high-priority behavior and constraints",
                        "To store API keys",
                        "To increase token limits",
                        "To replace all user messages"
                    ], 0, "System prompts steer model behavior before user/task instructions are applied.")
                ]
            }),
            section({
                id: "auto-p1-s3",
                title: "Automation Concepts: Triggers, Actions, Logic",
                description: "Understand event triggers, actions, filters, webhooks, branches, and conditional logic.",
                estimatedTime: "3 hours",
                difficulty: "Beginner",
                learningTypes: [
                    "Reading",
                    "Tool",
                    "Quiz"
                ],
                resources: [
                    r("Zapier Learning Center", "article", URLS.zapierLearn),
                    r("Make Help Center", "tool", URLS.makeHelp)
                ],
                questions: [
                    q("auto-p1-s3-q1", "In automation platforms, what does a webhook usually do?", [
                        "Stores passwords",
                        "Receives or sends event data over HTTP",
                        "Formats spreadsheet columns only",
                        "Trains an AI model"
                    ], 1, "Webhooks move event data between systems through HTTP requests."),
                    q("auto-p1-s3-q2", "What is conditional logic used for in a workflow?", [
                        "Choosing different paths based on data or rules",
                        "Increasing image resolution",
                        "Creating API credentials automatically",
                        "Deleting logs after every run"
                    ], 0, "Conditions let automations branch based on values such as intent, amount, status, or user role.")
                ]
            }),
            section({
                id: "auto-p1-s4",
                title: "Mapping Business Workflows",
                description: "Map inputs, handoffs, decisions, bottlenecks, and measurable automation opportunities.",
                estimatedTime: "2.5 hours",
                difficulty: "Beginner",
                learningTypes: [
                    "Reading",
                    "Practice",
                    "Quiz"
                ],
                resources: [
                    r("Lucidchart Process Mapping Guide", "article", URLS.lucidchart),
                    r("Miro Workflow Templates", "tool", URLS.miroWorkflow)
                ],
                questions: [
                    q("auto-p1-s4-q1", "Which signal usually indicates a strong automation candidate?", [
                        "A rare one-off strategic decision",
                        "A repetitive task with structured inputs and measurable time cost",
                        "A task with no clear owner",
                        "A task that changes completely every time"
                    ], 1, "Repeatable, structured, high-volume work is easier to automate and easier to measure."),
                    q("auto-p1-s4-q2", "How should ROI be estimated for a workflow automation?", [
                        "By counting tool logos",
                        "By comparing time saved and error reduction against implementation and maintenance cost",
                        "By choosing the newest AI model",
                        "By skipping stakeholder interviews"
                    ], 1, "Automation ROI comes from measurable savings, quality gains, and ongoing costs.")
                ]
            }),
            section({
                id: "auto-p1-s5",
                title: "Hands-On: Your First Zap",
                description: "Build a trigger-action Zap, test sample data, and inspect task history for errors.",
                estimatedTime: "3 hours",
                difficulty: "Beginner",
                learningTypes: [
                    "Practice",
                    "Tool",
                    "Quiz"
                ],
                resources: [
                    r("Zapier Quick-Start Guide", "article", URLS.zapierQuickStart),
                    r("Zapier Learning Center", "video", URLS.zapierLearn)
                ],
                questions: [
                    q("auto-p1-s5-q1", "What are the two minimum parts of a Zap?", [
                        "A trigger and at least one action",
                        "A database and a dashboard",
                        "A router and an iterator",
                        "A prompt and a vector store"
                    ], 0, "A Zap starts with a trigger event and performs one or more actions."),
                    q("auto-p1-s5-q2", "What should you inspect when a Zap run fails?", [
                        "Only the name of the Zap",
                        "Task history, input data, output data, and error message",
                        "The landing page design",
                        "The browser theme"
                    ], 1, "Run history reveals exactly which step failed and which data caused the issue.")
                ]
            })
        ]),
        lightPhase("auto", 2, "No-Code Automation Platforms", "Build production workflows in Make, Zapier, n8n, and API tools.", "You can choose and configure the right automation platform for a business process.", "Week 3-4", [
            {
                title: "Make (Integromat) Deep Dive",
                description: "Use scenarios, routers, iterators, bundles, and scheduling in Make.",
                estimatedTime: "4 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Video",
                    "Tool",
                    "Practice"
                ],
                resources: [
                    r("Make Help Center", "tool", URLS.makeHelp),
                    r("Make Router Module", "article", URLS.makeRouter)
                ],
                correct: "Router module for branching bundles into multiple paths",
                distractors: [
                    "Formatter step",
                    "Vector embedding",
                    "OAuth consent screen"
                ],
                explanation: "Make routers split bundles into separate branches with filters."
            },
            {
                title: "Zapier Advanced Features",
                description: "Use Formatter, Paths, filters, delays, and multi-step Zaps.",
                estimatedTime: "4 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("Zapier Formatter Guide", "article", URLS.zapierFormatter),
                    r("Zapier Paths Guide", "article", URLS.zapierPaths)
                ],
                correct: "Paths for conditional branches in a multi-step Zap",
                distractors: [
                    "Temperature sampling",
                    "Primary key indexes",
                    "CSS grid"
                ],
                explanation: "Zapier Paths choose different action chains based on rules."
            },
            {
                title: "n8n Self-Hosted Automation",
                description: "Learn nodes, credentials, webhooks, executions, and self-hosting considerations.",
                estimatedTime: "4 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Tool",
                    "Reading"
                ],
                resources: [
                    r("n8n Documentation", "tool", URLS.n8nDocs),
                    r("n8n Webhook Node", "article", URLS.n8nWebhook)
                ],
                correct: "Webhook node for receiving external HTTP events",
                distractors: [
                    "Pivot table",
                    "Prompt persona",
                    "Color token"
                ],
                explanation: "The n8n Webhook node exposes an endpoint that can trigger workflows."
            },
            {
                title: "Connecting APIs Without Code",
                description: "Use Postman and API hubs to understand endpoints, authentication, and JSON payloads.",
                estimatedTime: "4 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Tool",
                    "Practice"
                ],
                resources: [
                    r("Postman Learning Center", "tool", URLS.postman),
                    r("RapidAPI Documentation", "article", URLS.rapidApi)
                ],
                correct: "Bearer token or API key sent with an HTTP request",
                distractors: [
                    "Alt text",
                    "Model checkpoint",
                    "Figma component"
                ],
                explanation: "Most REST APIs require credentials in headers, query params, or OAuth flows."
            }
        ]),
        lightPhase("auto", 3, "AI-Powered Workflow Design", "Add LLM APIs, document processing, communication tools, and data transformations to automations.", "You can design AI workflows that parse, classify, transform, and route business data.", "Week 5-6", [
            {
                title: "Integrating ChatGPT/Claude into Automations",
                description: "Call model APIs from workflow platforms and handle tokens, rate limits, and keys.",
                estimatedTime: "4 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("OpenAI Text Generation Guide", "article", URLS.openAiText),
                    r("Anthropic Messages API", "article", URLS.anthropicApi)
                ],
                correct: "Rate limits and token budgets must be handled for API reliability",
                distractors: [
                    "CSS cascade",
                    "SQL joins only",
                    "Image alt tags"
                ],
                explanation: "LLM API calls can fail or throttle, so workflows need limits, retries, and cost controls."
            },
            {
                title: "Document Processing Automation",
                description: "Extract text, chunk documents, and pass structured context into AI steps.",
                estimatedTime: "4 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("LlamaIndex Documentation", "article", URLS.llamaIndex),
                    r("Unstructured Documentation", "tool", URLS.unstructured)
                ],
                correct: "Chunking long documents before retrieval or summarization",
                distractors: [
                    "Setting all text to uppercase",
                    "Removing MIME types",
                    "Disabling parsing"
                ],
                explanation: "Chunking controls context size and improves retrieval quality for long documents."
            },
            {
                title: "Email & Communication Automation",
                description: "Use Gmail and Slack APIs for notifications, triage, and team handoffs.",
                estimatedTime: "3.5 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("Gmail API Guides", "article", URLS.gmailApi),
                    r("Slack Incoming Webhooks", "article", URLS.slackWebhooks)
                ],
                correct: "OAuth scopes define what an app can access in Gmail",
                distractors: [
                    "Markdown headings define permissions",
                    "A Zap title grants access",
                    "Color themes secure messages"
                ],
                explanation: "OAuth scopes limit API access such as reading, sending, or modifying Gmail data."
            },
            {
                title: "Data Extraction & Transformation",
                description: "Clean, reshape, and validate data before sending it between systems.",
                estimatedTime: "4 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("Pandas 10 Minutes Guide", "article", URLS.pandas),
                    r("Kaggle Data Cleaning", "practice", URLS.kaggleDataCleaning)
                ],
                correct: "ETL means extract, transform, and load data between systems",
                distractors: [
                    "Encrypt, tokenize, launch",
                    "Estimate, train, label",
                    "Embed, translate, loop"
                ],
                explanation: "ETL pipelines move data from sources, transform it, and load it into destinations."
            }
        ]),
        lightPhase("auto", 4, "Advanced Automation Architecture", "Make automations resilient, secure, team-ready, and portfolio-worthy.", "You can document, secure, monitor, and hand over multi-step automations.", "Week 7-9", [
            {
                title: "Error Handling & Resilience",
                description: "Design retries, fallback paths, alerts, and failure logs.",
                estimatedTime: "4 hours",
                difficulty: "Advanced",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("Make Error Handling", "article", URLS.makeHelp),
                    r("n8n Error Workflows", "article", URLS.n8nDocs)
                ],
                correct: "Retry logic with alerts and fallback handling",
                distractors: [
                    "Deleting execution history",
                    "Ignoring non-200 responses",
                    "Hard-coding every output"
                ],
                explanation: "Reliable automations expect transient failures and make them visible."
            },
            {
                title: "Automation Security Best Practices",
                description: "Manage secrets, least privilege, audit logs, and API exposure.",
                estimatedTime: "3.5 hours",
                difficulty: "Advanced",
                learningTypes: [
                    "Reading",
                    "Quiz"
                ],
                resources: [
                    r("OWASP API Security Top 10", "article", URLS.owaspApi),
                    r("Google Cloud Security Best Practices", "article", URLS.googleSecurity)
                ],
                correct: "Least privilege for API credentials and scoped access",
                distractors: [
                    "Sharing one admin token across all Zaps",
                    "Putting secrets in public docs",
                    "Disabling audit logs"
                ],
                explanation: "Automation credentials should have only the minimum access needed."
            },
            {
                title: "Scaling Automations for Teams",
                description: "Create naming conventions, version notes, owners, and operational documentation.",
                estimatedTime: "3 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("Zapier Learning Center", "article", URLS.zapierLearn),
                    r("Make Help Center", "tool", URLS.makeHelp)
                ],
                correct: "Versioned documentation with owners and rollback notes",
                distractors: [
                    "Unnamed scenarios",
                    "Private-only credentials",
                    "No handover process"
                ],
                explanation: "Teams need visible ownership, versioning, and operational context."
            },
            {
                title: "Building an Automation Portfolio",
                description: "Present business problem, architecture, screenshots, ROI, and maintenance plan.",
                estimatedTime: "3 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Project",
                    "Practice"
                ],
                resources: [
                    r("GitHub Pages Quickstart", "tool", URLS.githubPages),
                    r("dev.to Automation Case Studies", "article", URLS.devToAutomation)
                ],
                correct: "Case study with problem, workflow diagram, ROI, and lessons learned",
                distractors: [
                    "Tool list without outcomes",
                    "A private screenshot only",
                    "Unverified claims with no metrics"
                ],
                explanation: "A portfolio should prove business value, not just tool familiarity."
            }
        ]),
        lightPhase("auto", 5, "Professional Practice & Deployment", "Scope, deliver, document, and sell client-ready automation services.", "You can deliver maintainable automations with clear client expectations.", "Week 10-12", [
            {
                title: "Client Discovery & Scoping",
                description: "Gather requirements, map constraints, prevent scope creep, and estimate pricing.",
                estimatedTime: "3 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("Notion Templates", "tool", URLS.notionTemplates),
                    r("Toptal Freelance Guide", "article", URLS.toptalFreelance)
                ],
                correct: "Written scope with inputs, outputs, exclusions, owners, and acceptance criteria",
                distractors: [
                    "A vague promise to automate everything",
                    "Only a demo video",
                    "No stakeholder approval"
                ],
                explanation: "Clear scope prevents misaligned expectations and runaway work."
            },
            {
                title: "Delivering & Documenting Automations",
                description: "Create SOPs, Loom walkthroughs, runbooks, and maintenance instructions.",
                estimatedTime: "3 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("Loom Documentation Guide", "article", URLS.loomDocs),
                    r("Notion Templates", "tool", URLS.notionTemplates)
                ],
                correct: "Runbook with triggers, owners, recovery steps, and maintenance cadence",
                distractors: [
                    "A single password in chat",
                    "No screenshots or test data",
                    "Undocumented manual fixes"
                ],
                explanation: "A runbook lets clients operate and troubleshoot the automation after handover."
            },
            {
                title: "Freelance & Consulting Business Basics",
                description: "Understand positioning, pricing models, contracts, communication, and client management.",
                estimatedTime: "3 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("Upwork AI Automation Freelancers", "article", URLS.upworkAiAutomation),
                    r("Toptal Freelance Guide", "article", URLS.toptalFreelance)
                ],
                correct: "Milestone-based delivery with defined acceptance criteria",
                distractors: [
                    "Unlimited revisions forever",
                    "No contract or change process",
                    "Pricing only by tool count"
                ],
                explanation: "Professional service delivery needs milestones, scope control, and acceptance criteria."
            }
        ])
    ],
    projects: [
        project("auto-proj-1", "Customer Support Email Triage System", "Build a Make or Zapier workflow that reads incoming emails, uses GPT to classify intent, routes to the correct team, and logs to Google Sheets.", [
            "API integration",
            "Prompt engineering",
            "Conditional logic"
        ], [
            "Email trigger",
            "Intent classifier",
            "Team routing rules",
            "Google Sheets log"
        ], "6 hours", "Beginner", "auto-p3"),
        project("auto-proj-2", "Content Repurposing Pipeline", "Automate turning a blog post URL into a Twitter thread, LinkedIn post, and email newsletter using AI.", [
            "Web extraction",
            "LLM APIs",
            "Multi-channel output"
        ], [
            "URL intake",
            "AI transformations",
            "Three content formats",
            "Review queue"
        ], "8 hours", "Intermediate", "auto-p4"),
        project("auto-proj-3", "Client Onboarding Automation Suite", "Create a flow from form submission to contract generation, welcome email, CRM entry, and Slack notification.", [
            "Multi-tool integration",
            "Document generation",
            "Error handling"
        ], [
            "Intake form",
            "Generated contract draft",
            "CRM record",
            "Slack alert",
            "Runbook"
        ], "12 hours", "Advanced", "auto-p5")
    ]
};
function namedPhase(prefix, n, title, topics) {
    return lightPhase(prefix, n, title, `Build professional skill in ${title.toLowerCase()} with real tools, standards, and deliverables.`, `You can apply ${title.toLowerCase()} in portfolio-grade work.`, `Week ${n * 2 - 1}-${n * 2}`, topics);
}
const promptEngineer = {
    id: "2",
    slug: "prompt-engineer",
    title: "Prompt Engineer",
    description: "Design, test, evaluate, and manage prompts for reliable language-model applications and business workflows.",
    category: "Prompting",
    level: "Beginner to Intermediate",
    duration: "12 weeks",
    status: "mvp-ready",
    totalEstimatedHours: 70,
    phases: [
        phase("prompt-p1", 1, "Language Model Fundamentals", "Learn how LLMs tokenize, attend to context, sample outputs, and follow prompt hierarchy.", "You can explain and improve prompts using model behavior instead of guesswork.", "2 weeks", "Week 1-2", "free", [
            section({
                id: "prompt-p1-s1",
                title: "How Large Language Models Work",
                description: "Understand tokenization, attention, next-token prediction, and context windows.",
                estimatedTime: "4 hours",
                difficulty: "Beginner",
                learningTypes: [
                    "Video",
                    "Reading"
                ],
                resources: [
                    r("Andrej Karpathy: Let's build GPT", "video", URLS.karpathyBuildGpt),
                    r("The Illustrated Transformer", "article", URLS.illustratedTransformer)
                ],
                questions: [
                    q("prompt-p1-s1-q1", "What is a token in an LLM?", [
                        "A unit of text processed by the model",
                        "A database password",
                        "A training GPU",
                        "A web request header"
                    ], 0, "Models process text as tokens, which can be words, subwords, or characters."),
                    q("prompt-p1-s1-q2", "What does the attention mechanism help a transformer do?", [
                        "Relate tokens to other tokens in the context",
                        "Compress images only",
                        "Store API credentials",
                        "Disable sampling"
                    ], 0, "Attention lets tokens weigh relevant parts of the context.")
                ]
            }),
            section({
                id: "prompt-p1-s2",
                title: "The Anatomy of a Great Prompt",
                description: "Use role, task, context, constraints, examples, and output formats.",
                estimatedTime: "3 hours",
                difficulty: "Beginner",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("OpenAI Prompt Engineering Guide", "article", URLS.openAiPrompting),
                    r("Learn Prompting", "article", URLS.learnPrompting)
                ],
                questions: [
                    q("prompt-p1-s2-q1", "Which prompt element most directly controls the response schema?", [
                        "Output format instructions",
                        "Browser zoom",
                        "Model provider logo",
                        "Conversation title"
                    ], 0, "Explicit schema instructions reduce ambiguity."),
                    q("prompt-p1-s2-q2", "Why include constraints in a prompt?", [
                        "To limit acceptable behavior and outputs",
                        "To increase billing automatically",
                        "To make tokenization impossible",
                        "To remove context"
                    ], 0, "Constraints define boundaries such as length, tone, sources, and forbidden actions.")
                ]
            }),
            section({
                id: "prompt-p1-s3",
                title: "Temperature, Top-P & Sampling",
                description: "Learn how sampling controls creativity, determinism, and risk.",
                estimatedTime: "3 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading",
                    "Quiz"
                ],
                resources: [
                    r("Hugging Face Generation Strategies", "article", URLS.hfGeneration),
                    r("OpenAI Text Generation Guide", "article", URLS.openAiText)
                ],
                questions: [
                    q("prompt-p1-s3-q1", "What does temperature close to 0 usually produce?", [
                        "More deterministic outputs",
                        "Longer context windows",
                        "More API keys",
                        "Guaranteed factuality"
                    ], 0, "Lower temperature reduces randomness but does not guarantee truth."),
                    q("prompt-p1-s3-q2", "When is a higher temperature usually more appropriate?", [
                        "Brainstorming varied creative options",
                        "Extracting exact invoice totals",
                        "Running database migrations",
                        "Validating legal citations"
                    ], 0, "Creative tasks benefit from more diverse sampling.")
                ]
            }),
            section({
                id: "prompt-p1-s4",
                title: "System Prompts & Personas",
                description: "Use higher-priority instructions while keeping personas safe and task-specific.",
                estimatedTime: "3 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("Anthropic Prompt Engineering Overview", "article", URLS.anthropicPrompting),
                    r("OpenAI Prompt Engineering Guide", "article", URLS.openAiPrompting)
                ],
                questions: [
                    q("prompt-p1-s4-q1", "How does a system message differ from a user message?", [
                        "It sets higher-priority behavior for the assistant",
                        "It always contains JSON",
                        "It is ignored by model APIs",
                        "It stores billing settings"
                    ], 0, "System instructions are used to define assistant behavior and constraints."),
                    q("prompt-p1-s4-q2", "What is a risk of an overly broad persona prompt?", [
                        "Inconsistent or unsafe behavior outside the task",
                        "Lower monitor brightness",
                        "Fewer tokens in the tokenizer",
                        "Faster database joins"
                    ], 0, "Personas should serve task goals and safety constraints.")
                ]
            }),
            section({
                id: "prompt-p1-s5",
                title: "Practice: Prompt Iteration Lab",
                description: "Compare prompt versions, run A/B tests, and document improvements.",
                estimatedTime: "3 hours",
                difficulty: "Beginner",
                learningTypes: [
                    "Practice",
                    "Tool"
                ],
                resources: [
                    r("Awesome ChatGPT Prompts", "tool", URLS.awesomePrompts),
                    r("FlowGPT Prompt Library", "tool", URLS.flowGpt)
                ],
                questions: [
                    q("prompt-p1-s5-q1", "What should you change when A/B testing prompts?", [
                        "One meaningful variable at a time",
                        "Every instruction and model at once",
                        "Only the file name",
                        "The browser language only"
                    ], 0, "Controlled changes make it possible to attribute improvements."),
                    q("prompt-p1-s5-q2", "What metric best evaluates a summarization prompt?", [
                        "Faithfulness and coverage against source text",
                        "Number of emojis",
                        "Model logo color",
                        "Random output length"
                    ], 0, "Summaries should be accurate to the source and cover key points.")
                ]
            })
        ]),
        namedPhase("prompt", 2, "Advanced Prompting Techniques", [
            {
                title: "Chain-of-Thought Prompting",
                description: "Use reasoning prompts and hidden reasoning alternatives responsibly.",
                estimatedTime: "3 hours",
                difficulty: "Advanced",
                learningTypes: [
                    "Reading"
                ],
                resources: [
                    r("Wei et al. Chain-of-Thought Paper", "article", URLS.cotPaper),
                    r("Google AI: Chain of Thought", "article", URLS.googleCot)
                ],
                correct: "Decomposing multi-step reasoning into intermediate steps",
                distractors: [
                    "Increasing CSS specificity",
                    "Hashing passwords",
                    "Turning off all examples"
                ],
                explanation: "CoT-style methods improve reasoning by encouraging stepwise decomposition."
            },
            {
                title: "Few-Shot & Zero-Shot Strategies",
                description: "Choose examples when they improve consistency and omit them when they bias outputs.",
                estimatedTime: "3 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("GPT-3 Paper", "article", URLS.gpt3Paper),
                    r("Hugging Face NLP Course", "article", URLS.hfCourse)
                ],
                correct: "Few-shot examples demonstrate the target pattern",
                distractors: [
                    "Few-shot means fewer tokens always",
                    "Zero-shot requires training a model",
                    "Examples disable constraints"
                ],
                explanation: "Few-shot prompts teach format and criteria through examples."
            },
            {
                title: "ReAct & Tool-Use Prompting",
                description: "Combine reasoning traces with tool calls and observations.",
                estimatedTime: "4 hours",
                difficulty: "Advanced",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("ReAct Paper", "article", URLS.reactPaper),
                    r("LangChain Agents", "tool", URLS.langchainAgents)
                ],
                correct: "Alternating reasoning, actions, and observations",
                distractors: [
                    "Only generating images",
                    "Removing all tools",
                    "Single static completion"
                ],
                explanation: "ReAct agents reason about which tool to use and incorporate observations."
            },
            {
                title: "Prompt Chaining & Pipelines",
                description: "Break complex tasks into typed, testable prompt steps.",
                estimatedTime: "4 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Tool",
                    "Practice"
                ],
                resources: [
                    r("LangChain Expression Language", "tool", URLS.langchainLcel),
                    r("Microsoft PromptFlow", "tool", URLS.promptFlow)
                ],
                correct: "Passing structured outputs from one prompt step to the next",
                distractors: [
                    "One huge prompt for every task",
                    "No intermediate validation",
                    "Manual copy-paste only"
                ],
                explanation: "Prompt chains make complex workflows more testable and debuggable."
            }
        ]),
        namedPhase("prompt", 3, "Prompt Engineering for Products", [
            {
                title: "Prompt Design for Customer-Facing Apps",
                description: "Design safe prompts for real users, policies, and edge cases.",
                estimatedTime: "3 hours",
                difficulty: "Advanced",
                learningTypes: [
                    "Reading"
                ],
                resources: [
                    r("Anthropic Prompt Engineering", "article", URLS.anthropicPrompting),
                    r("OpenAI Usage Policies", "article", URLS.openAiPolicies)
                ],
                correct: "Clear refusal, escalation, and safe-completion behavior",
                distractors: [
                    "No safety instructions",
                    "Unbounded persona roleplay",
                    "Hiding policy from evaluation"
                ],
                explanation: "Customer-facing prompts need safe behavior and escalation paths."
            },
            {
                title: "Evaluation & Red-Teaming Prompts",
                description: "Test prompt robustness with adversarial and benchmark-style cases.",
                estimatedTime: "4 hours",
                difficulty: "Advanced",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("Stanford HELM", "article", URLS.helm),
                    r("PromptBench Paper", "article", URLS.promptBench)
                ],
                correct: "Adversarial test cases that probe jailbreaks and task failures",
                distractors: [
                    "Only checking one happy path",
                    "Changing prompts without logs",
                    "Relying on vibes"
                ],
                explanation: "Prompt evaluation needs systematic, repeatable test suites."
            },
            {
                title: "Structured Output & JSON Mode",
                description: "Constrain model output for parsers, APIs, and downstream automations.",
                estimatedTime: "3 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading",
                    "Tool"
                ],
                resources: [
                    r("OpenAI Structured Outputs", "article", URLS.openAiStructured),
                    r("Instructor Library", "tool", URLS.instructor)
                ],
                correct: "Schema-constrained JSON that downstream code can validate",
                distractors: [
                    "Free-form paragraphs only",
                    "Screenshots of data",
                    "Random indentation"
                ],
                explanation: "Structured outputs reduce parsing failures."
            },
            {
                title: "Prompt Version Control & Management",
                description: "Track prompt changes, evaluation results, and production regressions.",
                estimatedTime: "3 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Tool"
                ],
                resources: [
                    r("PromptLayer Docs", "tool", URLS.promptLayer),
                    r("LangSmith Docs", "tool", URLS.langSmith)
                ],
                correct: "Versioned prompts with traces and evaluation results",
                distractors: [
                    "Editing production prompts without history",
                    "No test cases",
                    "Deleting logs"
                ],
                explanation: "Prompt management tools support traceability and regression testing."
            }
        ]),
        namedPhase("prompt", 4, "Multimodal & Specialised Prompting", [
            {
                title: "Vision Prompting",
                description: "Prompt image-capable models for inspection, extraction, and reasoning.",
                estimatedTime: "3 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading"
                ],
                resources: [
                    r("OpenAI Vision Guide", "article", URLS.openAiVision),
                    r("Gemini Vision Docs", "article", URLS.geminiVision)
                ],
                correct: "Ask for observable evidence and structured visual findings",
                distractors: [
                    "Assume hidden facts from an image",
                    "Ignore image resolution",
                    "Skip uncertainty"
                ],
                explanation: "Vision prompts should distinguish observed evidence from inference."
            },
            {
                title: "Code Generation Prompting",
                description: "Prompt coding tools with repo context, constraints, tests, and acceptance criteria.",
                estimatedTime: "3 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("GitHub Copilot Prompt Engineering", "article", URLS.copilotPrompting),
                    r("Cursor Docs", "tool", URLS.cursorDocs)
                ],
                correct: "Provide relevant files, constraints, and tests to run",
                distractors: [
                    "Ask for unrelated refactors",
                    "Hide failing tests",
                    "Use no acceptance criteria"
                ],
                explanation: "Code prompts are strongest when grounded in project context and checks."
            },
            {
                title: "Audio & Speech Prompting",
                description: "Work with transcription, voice instructions, and speech generation constraints.",
                estimatedTime: "2.5 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading"
                ],
                resources: [
                    r("OpenAI Speech to Text", "article", URLS.openAiSpeech),
                    r("ElevenLabs Prompting", "article", URLS.elevenLabs)
                ],
                correct: "Specify speaker style, pronunciation, and transcription constraints",
                distractors: [
                    "Use visual bounding boxes",
                    "Set SQL indexes",
                    "Disable punctuation always"
                ],
                explanation: "Audio work needs modality-specific constraints for speech and transcripts."
            },
            {
                title: "Domain-Specific Prompt Libraries",
                description: "Evaluate reusable prompts for legal, marketing, coding, support, and analysis use cases.",
                estimatedTime: "2.5 hours",
                difficulty: "Beginner",
                learningTypes: [
                    "Tool",
                    "Practice"
                ],
                resources: [
                    r("Awesome ChatGPT Prompts", "tool", URLS.awesomePrompts),
                    r("FlowGPT", "tool", URLS.flowGpt)
                ],
                correct: "Adapt prompts to domain rules, data, and evaluation criteria",
                distractors: [
                    "Copy prompts blindly",
                    "Remove all constraints",
                    "Ignore compliance"
                ],
                explanation: "Prompt libraries are starting points, not validated domain solutions."
            }
        ]),
        namedPhase("prompt", 5, "Professional Prompt Engineering", [
            {
                title: "Building a Prompt Engineering Portfolio",
                description: "Show prompt versions, test cases, metrics, and business impact.",
                estimatedTime: "3 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Project"
                ],
                resources: [
                    r("GitHub Pages Quickstart", "tool", URLS.githubPages),
                    r("LangSmith Docs", "tool", URLS.langSmith)
                ],
                correct: "Before/after prompt results with evaluation metrics",
                distractors: [
                    "Only screenshots of chat messages",
                    "No baseline",
                    "No prompt versions"
                ],
                explanation: "A prompt portfolio should prove measurable improvement."
            },
            {
                title: "Consulting & Freelance Prompt Engineering",
                description: "Scope prompt projects, price deliverables, and hand over maintainable assets.",
                estimatedTime: "3 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading"
                ],
                resources: [
                    r("Upwork AI Automation Freelancers", "article", URLS.upworkAiAutomation),
                    r("Toptal Freelance Guide", "article", URLS.toptalFreelance)
                ],
                correct: "Deliverables include prompts, eval cases, documentation, and handover",
                distractors: [
                    "One prompt with no tests",
                    "Unlimited unpaid revisions",
                    "No acceptance criteria"
                ],
                explanation: "Prompt consulting needs assets clients can operate and verify."
            },
            {
                title: "Prompt Engineering for Enterprises",
                description: "Design prompts within governance, security, model-routing, and compliance constraints.",
                estimatedTime: "4 hours",
                difficulty: "Advanced",
                learningTypes: [
                    "Reading"
                ],
                resources: [
                    r("Azure OpenAI Prompt Engineering", "article", URLS.azureOpenAi),
                    r("AWS Bedrock Prompt Guidelines", "article", URLS.bedrockPrompting)
                ],
                correct: "Governed prompts with security, auditability, and evaluation gates",
                distractors: [
                    "Ad hoc prompts pasted into production",
                    "No access controls",
                    "No logs"
                ],
                explanation: "Enterprise prompt work requires operational controls, not just clever wording."
            }
        ])
    ],
    projects: [
        project("prompt-proj-1", "Support Bot Prompt Evaluation Suite", "Design prompts and test cases for a support chatbot that must answer policy questions safely.", [
            "System prompting",
            "Evaluation",
            "Red-teaming"
        ], [
            "Prompt set",
            "20 test cases",
            "Scoring rubric"
        ], "8 hours", "Intermediate", "prompt-p3"),
        project("prompt-proj-2", "Structured Extraction Prompt Pipeline", "Build chained prompts that extract JSON from messy sales notes and validate it.", [
            "Structured outputs",
            "Prompt chaining",
            "Schema validation"
        ], [
            "Extraction prompts",
            "JSON schema",
            "Error examples"
        ], "8 hours", "Intermediate", "prompt-p3"),
        project("prompt-proj-3", "Prompt Portfolio Case Study", "Create a public case study showing baseline, iterations, evals, and final prompt performance.", [
            "Portfolio writing",
            "A/B testing",
            "Metrics"
        ], [
            "Case study page",
            "Prompt versions",
            "Evaluation report"
        ], "10 hours", "Advanced", "prompt-p5")
    ]
};
const aiDataAnalyst = {
    id: "3",
    slug: "ai-data-analyst",
    title: "AI Data Analyst",
    description: "Use statistics, SQL, Python, visualization, and LLM-assisted analysis to turn raw data into decisions.",
    category: "Data",
    level: "Beginner to Intermediate",
    duration: "12 weeks",
    status: "mvp-ready",
    totalEstimatedHours: 78,
    phases: [
        phase("data-p1", 1, "Data & AI Fundamentals", "Build the statistical, Python, visualization, and LLM-assisted analysis foundation for modern data work.", "You can inspect a real dataset, ask better analytical questions, and communicate initial findings.", "2 weeks", "Week 1-2", "free", [
            section({
                id: "data-p1-s1",
                title: "Statistics for Data Analysis",
                description: "Learn averages, spread, distributions, hypothesis tests, and p-values.",
                estimatedTime: "5 hours",
                difficulty: "Beginner",
                learningTypes: [
                    "Video",
                    "Reading"
                ],
                resources: [
                    r("Khan Academy Statistics", "article", URLS.khanStats),
                    r("StatQuest YouTube Channel", "video", URLS.statQuest)
                ],
                questions: [
                    q("data-p1-s1-q1", "Which metric is most sensitive to extreme outliers?", [
                        "Mean",
                        "Median",
                        "Mode",
                        "Interquartile range"
                    ], 0, "The mean shifts strongly when extreme values are added."),
                    q("data-p1-s1-q2", "What does a p-value measure?", [
                        "The probability of observing data at least this extreme under the null hypothesis",
                        "The size of a database table",
                        "The slope of every regression line",
                        "The number of missing cells"
                    ], 0, "A p-value is interpreted relative to a null hypothesis.")
                ]
            }),
            section({
                id: "data-p1-s2",
                title: "Python for Data Analysis Basics",
                description: "Use notebooks, pandas DataFrames, indexing, data types, and simple transformations.",
                estimatedTime: "7 hours",
                difficulty: "Beginner",
                learningTypes: [
                    "Video",
                    "Practice"
                ],
                resources: [
                    r("freeCodeCamp Python for Data Science", "video", URLS.fccPythonData),
                    r("Kaggle Python Course", "practice", URLS.kagglePython)
                ],
                questions: [
                    q("data-p1-s2-q1", "Which Python library is primarily used for DataFrame manipulation?", [
                        "pandas",
                        "matplotlib",
                        "scikit-learn",
                        "pytest"
                    ], 0, "pandas provides DataFrame and Series data structures."),
                    q("data-p1-s2-q2", "In pandas, what does df.loc usually select by?", [
                        "Labels",
                        "Pixel coordinates",
                        "GPU memory",
                        "HTTP status"
                    ], 0, "loc is label-based selection.")
                ]
            }),
            section({
                id: "data-p1-s3",
                title: "Working with Data in ChatGPT/Claude",
                description: "Upload CSVs, ask analytical questions, check calculations, and interpret AI-generated findings.",
                estimatedTime: "3 hours",
                difficulty: "Beginner",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("OpenAI Data Analysis with ChatGPT", "article", URLS.chatGptData),
                    r("Using Files with Claude", "article", URLS.claudeFiles)
                ],
                questions: [
                    q("data-p1-s3-q1", "What should you do before trusting an AI-generated data insight?", [
                        "Verify the calculation or reproduce it with code",
                        "Copy it into a slide immediately",
                        "Delete the source CSV",
                        "Increase chart saturation"
                    ], 0, "LLM analysis can be wrong, so key findings need reproducible checks."),
                    q("data-p1-s3-q2", "Which prompt is best for a CSV analysis task?", [
                        "Ask a specific question and request assumptions, code, and caveats",
                        "Say 'analyze everything' only",
                        "Ask for a random chart",
                        "Hide column definitions"
                    ], 0, "Specific analytical prompts produce more auditable results.")
                ]
            }),
            section({
                id: "data-p1-s4",
                title: "Data Visualisation Principles",
                description: "Choose charts, use color intentionally, and avoid misleading encodings.",
                estimatedTime: "3 hours",
                difficulty: "Beginner",
                learningTypes: [
                    "Reading"
                ],
                resources: [
                    r("Data-to-Viz", "article", URLS.dataToViz),
                    r("Storytelling with Data Blog", "article", URLS.storytellingData)
                ],
                questions: [
                    q("data-p1-s4-q1", "Which chart is usually best for a time-series trend?", [
                        "Line chart",
                        "Pie chart",
                        "Word cloud",
                        "Stack of icons"
                    ], 0, "Line charts show change over a continuous time axis."),
                    q("data-p1-s4-q2", "Why can truncated bar chart axes mislead viewers?", [
                        "They exaggerate differences between bars",
                        "They always reduce file size",
                        "They improve statistical power",
                        "They remove missing values"
                    ], 0, "Bars encode magnitude from the baseline, so truncation can distort comparisons.")
                ]
            }),
            section({
                id: "data-p1-s5",
                title: "Hands-On: Analyse a Real Dataset",
                description: "Use the Titanic dataset in Colab to practice EDA, missing values, outliers, and initial insights.",
                estimatedTime: "5 hours",
                difficulty: "Beginner",
                learningTypes: [
                    "Practice",
                    "Project"
                ],
                resources: [
                    r("Kaggle Titanic Dataset", "practice", URLS.kaggleTitanic),
                    r("Google Colab Intro", "tool", URLS.colab)
                ],
                questions: [
                    q("data-p1-s5-q1", "What is a common first step in exploratory data analysis?", [
                        "Inspect rows, columns, data types, missing values, and summary statistics",
                        "Train a neural network immediately",
                        "Publish a dashboard before checking data",
                        "Delete categorical columns"
                    ], 0, "EDA starts with understanding structure and quality."),
                    q("data-p1-s5-q2", "How should missing values be handled?", [
                        "Investigate pattern and choose deletion, imputation, or separate category based on context",
                        "Always replace with zero",
                        "Always delete the dataset",
                        "Ignore them in every chart"
                    ], 0, "Missingness strategy depends on meaning, volume, and analytical goal.")
                ]
            })
        ]),
        namedPhase("data", 2, "SQL & Database Querying", [
            {
                title: "SQL SELECT, WHERE, GROUP BY",
                description: "Query relational data and aggregate business metrics.",
                estimatedTime: "4 hours",
                difficulty: "Beginner",
                learningTypes: [
                    "Practice"
                ],
                resources: [
                    r("SQLBolt", "practice", URLS.sqlBolt),
                    r("PostgreSQL Tutorial", "article", URLS.postgresTutorial)
                ],
                correct: "GROUP BY aggregates rows by one or more columns",
                distractors: [
                    "ORDER BY creates new tables",
                    "WHERE runs after aggregation only",
                    "SELECT encrypts records"
                ],
                explanation: "GROUP BY is used with aggregate functions such as COUNT, SUM, and AVG."
            },
            {
                title: "Joins and Data Modeling",
                description: "Combine tables with keys and understand one-to-many relationships.",
                estimatedTime: "4 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Practice"
                ],
                resources: [
                    r("SQLBolt", "practice", URLS.sqlBolt),
                    r("PostgreSQL Tutorial", "article", URLS.postgresTutorial)
                ],
                correct: "INNER JOIN returns matching rows from both tables",
                distractors: [
                    "INNER JOIN deletes duplicates",
                    "INNER JOIN creates charts",
                    "INNER JOIN trains classifiers"
                ],
                explanation: "Joins combine related rows using key relationships."
            },
            {
                title: "Window Functions",
                description: "Rank, lag, and calculate rolling metrics without collapsing rows.",
                estimatedTime: "4 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading",
                    "Practice"
                ],
                resources: [
                    r("PostgreSQL Window Functions", "article", "https://www.postgresql.org/docs/current/tutorial-window.html"),
                    r("SQLBolt", "practice", URLS.sqlBolt)
                ],
                correct: "Window functions calculate across related rows while preserving row detail",
                distractors: [
                    "Window functions only resize dashboards",
                    "They require image data",
                    "They disable sorting"
                ],
                explanation: "Window functions support ranking, moving averages, and comparisons within partitions."
            }
        ]),
        namedPhase("data", 3, "Python Analytics & Visualization", [
            {
                title: "Pandas Cleaning Workflows",
                description: "Clean missing values, types, duplicates, and derived columns.",
                estimatedTime: "5 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Practice"
                ],
                resources: [
                    r("Kaggle Pandas", "practice", URLS.kagglePandas),
                    r("Kaggle Data Cleaning", "practice", URLS.kaggleDataCleaning)
                ],
                correct: "Convert data types before grouping or calculating metrics",
                distractors: [
                    "Group strings as dates",
                    "Ignore duplicate IDs",
                    "Plot before cleaning every time"
                ],
                explanation: "Correct types prevent broken filters, aggregations, and visualizations."
            },
            {
                title: "Matplotlib and Seaborn",
                description: "Create clear exploratory and presentation charts in Python.",
                estimatedTime: "4 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Practice"
                ],
                resources: [
                    r("Matplotlib Tutorials", "article", URLS.matplotlib),
                    r("Seaborn Tutorial", "article", URLS.seaborn)
                ],
                correct: "Seaborn provides statistical visualization built on matplotlib",
                distractors: [
                    "Seaborn is a database",
                    "Matplotlib is an LLM",
                    "Charts replace data validation"
                ],
                explanation: "Seaborn simplifies common statistical chart patterns."
            },
            {
                title: "Intro to ML-Assisted Analysis",
                description: "Use basic models to explore predictors and segment customers.",
                estimatedTime: "5 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Practice"
                ],
                resources: [
                    r("Kaggle Intro to Machine Learning", "practice", URLS.kaggleMl),
                    r("scikit-learn Tutorial", "article", URLS.sklearn)
                ],
                correct: "Split training and validation data to estimate generalization",
                distractors: [
                    "Evaluate only on training data",
                    "Remove target labels randomly",
                    "Use accuracy for every problem"
                ],
                explanation: "Validation data helps detect overfitting."
            }
        ]),
        namedPhase("data", 4, "Dashboards & Reporting", [
            {
                title: "Looker Studio Dashboards",
                description: "Connect data sources and build readable executive dashboards.",
                estimatedTime: "4 hours",
                difficulty: "Beginner",
                learningTypes: [
                    "Tool"
                ],
                resources: [
                    r("Looker Studio Help", "tool", URLS.lookerStudio),
                    r("Google Analytics 4 Reports", "article", URLS.googleAnalytics)
                ],
                correct: "Use dimensions and metrics with filters to build dashboard views",
                distractors: [
                    "Use raw screenshots only",
                    "Disable data connectors",
                    "Avoid chart titles"
                ],
                explanation: "Looker Studio dashboards rely on connected dimensions, metrics, filters, and charts."
            },
            {
                title: "Power BI and Tableau Basics",
                description: "Understand common BI concepts across enterprise tools.",
                estimatedTime: "5 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Tool"
                ],
                resources: [
                    r("Power BI Overview", "article", URLS.powerBi),
                    r("Tableau Get Started", "practice", URLS.tableau)
                ],
                correct: "A calculated measure derives metrics from fields and formulas",
                distractors: [
                    "A measure is a PDF",
                    "A dashboard cannot filter",
                    "A data source is always manual"
                ],
                explanation: "Measures define reusable calculations in BI tools."
            },
            {
                title: "Automated Reporting Pipelines",
                description: "Schedule analysis, chart exports, summaries, and email delivery.",
                estimatedTime: "5 hours",
                difficulty: "Advanced",
                learningTypes: [
                    "Project"
                ],
                resources: [
                    r("Pandas 10 Minutes Guide", "article", URLS.pandas),
                    r("Make Help Center", "tool", URLS.makeHelp)
                ],
                correct: "Scheduled data refresh plus generated summary and delivery step",
                distractors: [
                    "Manual screenshots only",
                    "No timestamped outputs",
                    "No exception alerts"
                ],
                explanation: "Automated reporting needs refresh, analysis, delivery, and failure handling."
            }
        ]),
        namedPhase("data", 5, "Presenting Data Insights", [
            {
                title: "Executive Data Storytelling",
                description: "Turn analysis into a decision narrative with caveats and recommendations.",
                estimatedTime: "3 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Reading"
                ],
                resources: [
                    r("Storytelling with Data Blog", "article", URLS.storytellingData),
                    r("Data-to-Viz", "article", URLS.dataToViz)
                ],
                correct: "Lead with decision context, evidence, and recommended action",
                distractors: [
                    "Show every chart produced",
                    "Hide limitations",
                    "Use unexplained acronyms"
                ],
                explanation: "Stakeholders need concise insight tied to action."
            },
            {
                title: "Analytical QA and Reproducibility",
                description: "Validate numbers, document assumptions, and keep notebooks runnable.",
                estimatedTime: "3 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Practice"
                ],
                resources: [
                    r("Google Colab Intro", "tool", URLS.colab),
                    r("Kaggle Pandas", "practice", URLS.kagglePandas)
                ],
                correct: "Re-runable notebook with assumptions, data source, and validation checks",
                distractors: [
                    "Hard-coded mystery numbers",
                    "No source references",
                    "Deleted code cells"
                ],
                explanation: "Reproducibility lets others trust and audit the analysis."
            },
            {
                title: "Stakeholder Presentation Practice",
                description: "Prepare concise slides, answer objections, and separate facts from recommendations.",
                estimatedTime: "3 hours",
                difficulty: "Intermediate",
                learningTypes: [
                    "Practice"
                ],
                resources: [
                    r("Storytelling with Data Blog", "article", URLS.storytellingData),
                    r("GitHub Pages Quickstart", "tool", URLS.githubPages)
                ],
                correct: "Separate descriptive findings from recommended decisions",
                distractors: [
                    "Present correlation as causation",
                    "Hide uncertainty",
                    "Use only raw tables"
                ],
                explanation: "Good data presentations distinguish evidence from judgment."
            }
        ])
    ],
    projects: [
        project("data-proj-1", "Sales Performance Dashboard", "Analyse a 12-month sales CSV with Python, create five key visualisations, and write an AI-assisted executive summary.", [
            "Python",
            "Pandas",
            "Visualization",
            "Executive writing"
        ], [
            "Clean notebook",
            "Five charts",
            "Executive summary"
        ], "10 hours", "Beginner", "data-p4"),
        project("data-proj-2", "Customer Churn Analysis", "Use ML-assisted analysis to identify churn predictors in a telecom dataset and build a risk scoring model.", [
            "EDA",
            "scikit-learn",
            "Feature analysis"
        ], [
            "Churn model",
            "Risk segments",
            "Insight memo"
        ], "14 hours", "Intermediate", "data-p3"),
        project("data-proj-3", "Automated Weekly Reporting Pipeline", "Build a Python and Make workflow that pulls data, runs analysis, generates charts, and emails a formatted report every Monday.", [
            "Automation",
            "Python reporting",
            "Email delivery"
        ], [
            "Scheduled workflow",
            "Charts",
            "Email report",
            "Runbook"
        ], "16 hours", "Advanced", "data-p4")
    ]
};
function phaseOneSection(id, title, description, correct, resources) {
    return lightSection({
        id,
        title,
        description,
        estimatedTime: "3 hours",
        difficulty: "Beginner",
        learningTypes: [
            "Reading",
            "Practice"
        ],
        resources,
        correct,
        distractors: [
            "Unstructured guessing without validation",
            "Publishing output without review",
            "Skipping source constraints"
        ],
        explanation: `${correct} is the professional technique for this topic.`
    });
}
function careerRoadmap(id, slug, title, description, category, level, phase1, phaseTopics, resourcePairs, projects) {
    const prefix = slug.split("-").map((part)=>part[0]).join("");
    return {
        id,
        slug,
        title,
        description,
        category,
        level,
        duration: "12 weeks",
        status: "mvp-ready",
        totalEstimatedHours: 66,
        phases: [
            phase(`${prefix}-p1`, 1, `${title} Foundations`, `Learn the core concepts, tools, and safety checks for ${title.toLowerCase()}.`, `You can complete a practical first workflow for ${title.toLowerCase()}.`, "2 weeks", "Week 1-2", "free", phase1),
            ...phaseTopics.map((topic, index)=>namedPhase(prefix, index + 2, topic, [
                    {
                        title: `${topic}: Core Workflow`,
                        description: `Practice the core workflow for ${topic.toLowerCase()}.`,
                        estimatedTime: "3 hours",
                        difficulty: index > 1 ? "Intermediate" : "Beginner",
                        learningTypes: [
                            "Reading",
                            "Practice"
                        ],
                        resources: resourcePairs,
                        correct: `A documented ${topic.toLowerCase()} workflow with validation checks`,
                        distractors: [
                            "One-off prompt output",
                            "No stakeholder criteria",
                            "No measurable output"
                        ],
                        explanation: `Professional ${topic.toLowerCase()} work needs repeatable workflow, validation, and measurable output.`
                    },
                    {
                        title: `${topic}: Tooling`,
                        description: `Use industry tools and documentation for ${topic.toLowerCase()}.`,
                        estimatedTime: "3 hours",
                        difficulty: "Intermediate",
                        learningTypes: [
                            "Tool",
                            "Practice"
                        ],
                        resources: resourcePairs,
                        correct: `Tool configuration matched to ${topic.toLowerCase()} requirements`,
                        distractors: [
                            "Default settings for every use case",
                            "Manual copy-paste as the system",
                            "No data or prompt versioning"
                        ],
                        explanation: `Tools should be configured around the use case, risk, and output format.`
                    },
                    {
                        title: `${topic}: Quality Review`,
                        description: `Review outputs for accuracy, safety, usability, and business fit.`,
                        estimatedTime: "3 hours",
                        difficulty: "Intermediate",
                        learningTypes: [
                            "Practice",
                            "Quiz"
                        ],
                        resources: resourcePairs,
                        correct: `Quality checklist with examples, edge cases, and acceptance criteria`,
                        distractors: [
                            "Approval by intuition only",
                            "No edge cases",
                            "No ownership"
                        ],
                        explanation: "Quality review turns AI work from a demo into a dependable workflow."
                    }
                ]))
        ],
        projects
    };
}
const aiContentCreator = careerRoadmap("4", "ai-content-creator", "AI Content Creator", "Create SEO-informed articles, social content, newsletters, and scripts with AI while preserving strategy and editorial quality.", "Content", "Beginner", [
    phaseOneSection("content-p1-s1", "AI Writing Workflow Basics", "Use AI for ideation, drafting, editing, and repurposing without losing editorial judgment.", "Human-edited AI drafts with source and audience constraints", [
        r("HubSpot Content Marketing Guide", "article", URLS.hubspotContent),
        r("OpenAI Prompt Engineering Guide", "article", URLS.openAiPrompting)
    ]),
    phaseOneSection("content-p1-s2", "SEO Fundamentals for AI Content", "Learn search intent, page structure, internal links, and technical SEO basics.", "Search intent matched to content structure and keywords", [
        r("Google SEO Starter Guide", "article", URLS.googleSeo),
        r("freeCodeCamp SEO for Developers", "article", URLS.fccSeo)
    ]),
    phaseOneSection("content-p1-s3", "Content Strategy and Editorial Calendars", "Plan pillars, topics, cadence, audience fit, and review stages.", "Content pillars mapped to audience problems and funnel stage", [
        r("HubSpot Content Marketing Guide", "article", URLS.hubspotContent),
        r("Notion Templates", "tool", URLS.notionTemplates)
    ]),
    phaseOneSection("content-p1-s4", "Social Media Repurposing", "Turn one source asset into platform-specific posts and hooks.", "Platform-specific adaptation instead of one identical post everywhere", [
        r("YouTube Creators", "video", URLS.youtubeCreators),
        r("FlowGPT", "tool", URLS.flowGpt)
    ]),
    phaseOneSection("content-p1-s5", "Video Scripting with AI", "Create short-form and long-form scripts with hooks, beats, and calls to action.", "Script beats with hook, value sequence, and CTA", [
        r("YouTube Creators", "video", URLS.youtubeCreators),
        r("OpenAI Text Generation Guide", "article", URLS.openAiText)
    ])
], [
    "SEO Content Production",
    "Social Media Automation",
    "Newsletter and Email Content",
    "Video Scripting Portfolio"
], [
    r("Google SEO Starter Guide", "article", URLS.googleSeo),
    r("HubSpot Content Marketing Guide", "article", URLS.hubspotContent)
], [
    project("content-proj-1", "SEO Blog Package", "Create an AI-assisted SEO article package with brief, draft, metadata, and QA checklist.", [
        "SEO",
        "AI writing",
        "Editing"
    ], [
        "Content brief",
        "Draft",
        "Metadata",
        "QA checklist"
    ], "8 hours", "Beginner", "aicc-p2"),
    project("content-proj-2", "Social Repurposing System", "Repurpose one article into posts for LinkedIn, X, email, and video script.", [
        "Repurposing",
        "Platform adaptation",
        "Prompting"
    ], [
        "Four channel outputs",
        "Prompt library",
        "Review notes"
    ], "10 hours", "Intermediate", "aicc-p3"),
    project("content-proj-3", "AI Content Calendar", "Build a four-week AI-supported editorial calendar with production workflow.", [
        "Strategy",
        "Calendar design",
        "Workflow"
    ], [
        "Calendar",
        "Prompts",
        "Production SOP"
    ], "12 hours", "Advanced", "aicc-p5")
]);
const mlEngineer = careerRoadmap("5", "ml-engineer", "Machine Learning Engineer", "Build, evaluate, deploy, and monitor machine-learning models with Python, scikit-learn, PyTorch, and MLOps practices.", "Machine Learning", "Intermediate", [
    phaseOneSection("ml-p1-s1", "Python and Notebooks for ML", "Set up reproducible notebooks and Python environments.", "Reproducible notebook with dependencies and fixed random seeds", [
        r("Kaggle Python Course", "practice", URLS.kagglePython),
        r("Google Colab Intro", "tool", URLS.colab)
    ]),
    phaseOneSection("ml-p1-s2", "Supervised Learning Basics", "Understand features, labels, train/test splits, and baseline models.", "Train/validation split with baseline model performance", [
        r("Kaggle Intro to ML", "practice", URLS.kaggleMl),
        r("scikit-learn Tutorial", "article", URLS.sklearn)
    ]),
    phaseOneSection("ml-p1-s3", "Model Evaluation Metrics", "Choose accuracy, precision, recall, F1, ROC-AUC, or RMSE based on task.", "Metric selected according to business cost of errors", [
        r("scikit-learn Tutorial", "article", URLS.sklearn),
        r("Kaggle Intro to ML", "practice", URLS.kaggleMl)
    ]),
    phaseOneSection("ml-p1-s4", "Neural Network Foundations", "Learn tensors, gradients, loss functions, and training loops.", "Loss function and gradient-based optimization", [
        r("PyTorch Basics", "practice", URLS.pytorch),
        r("fast.ai Course", "video", URLS.fastAi)
    ]),
    phaseOneSection("ml-p1-s5", "Data Leakage and Validation", "Prevent target leakage and build reliable validation schemes.", "Leakage checks before reporting model performance", [
        r("Kaggle Data Cleaning", "practice", URLS.kaggleDataCleaning),
        r("scikit-learn Tutorial", "article", URLS.sklearn)
    ])
], [
    "scikit-learn Model Building",
    "PyTorch Deep Learning",
    "MLOps and Experiment Tracking",
    "Model Deployment and Monitoring"
], [
    r("scikit-learn Tutorial", "article", URLS.sklearn),
    r("MLOps Zoomcamp", "practice", URLS.mlopsZoomcamp)
], [
    project("ml-proj-1", "House Price Prediction Model", "Train and evaluate a regression model with feature cleaning and metric reporting.", [
        "Pandas",
        "scikit-learn",
        "Regression"
    ], [
        "Notebook",
        "Metrics",
        "Model card"
    ], "12 hours", "Beginner", "me-p2"),
    project("ml-proj-2", "Image Classifier Prototype", "Fine-tune a small neural-network classifier and report confusion matrix results.", [
        "PyTorch",
        "Evaluation",
        "Computer vision"
    ], [
        "Training notebook",
        "Confusion matrix",
        "Demo"
    ], "16 hours", "Intermediate", "me-p3"),
    project("ml-proj-3", "Model Deployment Runbook", "Package a trained model behind an API with monitoring and rollback notes.", [
        "Deployment",
        "Monitoring",
        "MLOps"
    ], [
        "API prototype",
        "Monitoring checklist",
        "Runbook"
    ], "18 hours", "Advanced", "me-p5")
]);
const aiProductManager = careerRoadmap("6", "ai-product-manager", "AI Product Manager", "Lead AI products from user problem discovery to roadmap, metrics, launch, and responsible operation.", "Product", "Beginner to Intermediate", [
    phaseOneSection("pm-p1-s1", "AI Product Strategy", "Identify where AI creates user value and where it adds risk.", "Problem framing before model or vendor selection", [
        r("Mind the Product", "article", URLS.mindTheProduct),
        r("Product School AI PM Guide", "article", URLS.productSchoolAi)
    ]),
    phaseOneSection("pm-p1-s2", "AI Capability and Feasibility", "Evaluate data availability, model limits, latency, cost, and evaluation needs.", "Feasibility review including data, latency, cost, and risk", [
        r("OpenAI Text Generation Guide", "article", URLS.openAiText),
        r("Google Responsible AI Practices", "article", URLS.googleResponsibleAi)
    ]),
    phaseOneSection("pm-p1-s3", "User Research for AI Features", "Discover user tasks, trust expectations, and failure tolerance.", "Research questions covering trust, errors, and escalation", [
        r("NN/g AI UX", "article", URLS.nngroupAiUx),
        r("Mind the Product", "article", URLS.mindTheProduct)
    ]),
    phaseOneSection("pm-p1-s4", "AI Product Metrics", "Define quality, adoption, task success, cost, latency, and safety metrics.", "Metrics that include task success and model quality", [
        r("Product School AI PM Guide", "article", URLS.productSchoolAi),
        r("Stanford HELM", "article", URLS.helm)
    ]),
    phaseOneSection("pm-p1-s5", "Responsible AI Roadmapping", "Balance experimentation, governance, legal review, and release criteria.", "Roadmap gates for evals, safety, compliance, and launch readiness", [
        r("NIST AI RMF", "article", URLS.nistAiRmf),
        r("Google Responsible AI Practices", "article", URLS.googleResponsibleAi)
    ])
], [
    "AI Opportunity Discovery",
    "Roadmapping and Prioritization",
    "AI Metrics and Experiments",
    "Stakeholder Launch Management"
], [
    r("Mind the Product", "article", URLS.mindTheProduct),
    r("NIST AI RMF", "article", URLS.nistAiRmf)
], [
    project("pm-proj-1", "AI Feature PRD", "Write a PRD for an AI assistant feature with scope, risks, evals, and metrics.", [
        "PRD writing",
        "AI strategy",
        "Metrics"
    ], [
        "PRD",
        "Risk log",
        "Metric tree"
    ], "10 hours", "Beginner", "aipm-p2"),
    project("pm-proj-2", "AI Roadmap Prioritization", "Prioritize a backlog of AI opportunities using impact, feasibility, risk, and data readiness.", [
        "Prioritization",
        "Roadmapping",
        "Stakeholder comms"
    ], [
        "Prioritization matrix",
        "Roadmap",
        "Decision memo"
    ], "10 hours", "Intermediate", "aipm-p3"),
    project("pm-proj-3", "Launch Readiness Review", "Create launch criteria and review process for a customer-facing AI feature.", [
        "Governance",
        "Evals",
        "Launch"
    ], [
        "Checklist",
        "Experiment plan",
        "Launch readout"
    ], "12 hours", "Advanced", "aipm-p5")
]);
const aiUxDesigner = careerRoadmap("7", "ai-ux-designer", "AI UX Designer", "Design AI-assisted product experiences that are understandable, controllable, ethical, and useful.", "Design", "Beginner to Intermediate", [
    phaseOneSection("ux-p1-s1", "AI UX Patterns", "Learn AI interaction patterns: suggestions, copilots, generators, agents, and review loops.", "Human-in-the-loop interaction pattern for uncertain AI output", [
        r("NN/g AI UX", "article", URLS.nngroupAiUx),
        r("Google Responsible AI Practices", "article", URLS.googleResponsibleAi)
    ]),
    phaseOneSection("ux-p1-s2", "Figma AI and Design Acceleration", "Use AI features and plugins while keeping design intent explicit.", "AI-generated draft refined with design-system constraints", [
        r("Figma First Draft Help", "tool", URLS.figmaAi),
        r("NN/g AI UX", "article", URLS.nngroupAiUx)
    ]),
    phaseOneSection("ux-p1-s3", "User Research with AI", "Summarize interviews, cluster themes, and avoid synthetic-user overtrust.", "AI-assisted synthesis checked against source evidence", [
        r("OpenAI Prompt Engineering Guide", "article", URLS.openAiPrompting),
        r("Mind the Product", "article", URLS.mindTheProduct)
    ]),
    phaseOneSection("ux-p1-s4", "Designing for Trust and Control", "Add confidence, editability, undo, provenance, and escalation paths.", "Controls for review, override, and source visibility", [
        r("Google Responsible AI Practices", "article", URLS.googleResponsibleAi),
        r("NIST AI RMF", "article", URLS.nistAiRmf)
    ]),
    phaseOneSection("ux-p1-s5", "Ethical AI Design Basics", "Consider bias, consent, privacy, explainability, and user agency.", "Bias and privacy review before shipping AI flows", [
        r("EU AI Act Overview", "article", URLS.euAiAct),
        r("NIST AI RMF", "article", URLS.nistAiRmf)
    ])
], [
    "AI Interaction Patterns",
    "Figma AI Prototyping",
    "Research Synthesis with AI",
    "Responsible AI Design Portfolio"
], [
    r("NN/g AI UX", "article", URLS.nngroupAiUx),
    r("Figma First Draft Help", "tool", URLS.figmaAi)
], [
    project("ux-proj-1", "AI Copilot UX Flow", "Design a copilot workflow with suggestions, user edits, confidence cues, and undo.", [
        "Interaction design",
        "Trust UX",
        "Figma"
    ], [
        "Flow diagram",
        "Prototype",
        "UX rationale"
    ], "10 hours", "Beginner", "aiud-p2"),
    project("ux-proj-2", "AI Research Synthesis Board", "Use AI to cluster interview notes and produce validated design insights.", [
        "Research synthesis",
        "Prompting",
        "Evidence review"
    ], [
        "Synthesis board",
        "Prompt log",
        "Findings report"
    ], "10 hours", "Intermediate", "aiud-p4"),
    project("ux-proj-3", "Responsible AI Design Case Study", "Create a case study showing risk review, controls, and final prototype.", [
        "Ethics",
        "Product design",
        "Portfolio"
    ], [
        "Prototype",
        "Risk matrix",
        "Case study"
    ], "14 hours", "Advanced", "aiud-p5")
]);
const llmApplicationDeveloper = careerRoadmap("8", "llm-app-developer", "LLM Application Developer", "Build retrieval, tool-use, structured-output, and production-ready applications on top of language models.", "Development", "Intermediate", [
    phaseOneSection("llm-p1-s1", "LLM API Fundamentals", "Call text-generation APIs, handle model parameters, tokens, and errors.", "API calls with token, latency, and error handling", [
        r("OpenAI Text Generation Guide", "article", URLS.openAiText),
        r("Anthropic Messages API", "article", URLS.anthropicApi)
    ]),
    phaseOneSection("llm-p1-s2", "Structured Outputs", "Return typed JSON for downstream code and automation.", "Schema-constrained structured output validated by code", [
        r("OpenAI Structured Outputs", "article", URLS.openAiStructured),
        r("Instructor Library", "tool", URLS.instructor)
    ]),
    phaseOneSection("llm-p1-s3", "RAG Concepts", "Understand embeddings, chunking, vector search, and grounded generation.", "Retrieval augmented generation with source-grounded context", [
        r("LangChain RAG Tutorial", "article", URLS.langchainRag),
        r("Pinecone Learn", "article", URLS.pineconeLearn)
    ]),
    phaseOneSection("llm-p1-s4", "Prompt and Response Evaluation", "Measure answer quality, faithfulness, and regression risk.", "Eval set with expected behavior and failure cases", [
        r("LangSmith Docs", "tool", URLS.langSmith),
        r("Stanford HELM", "article", URLS.helm)
    ]),
    phaseOneSection("llm-p1-s5", "App Safety and Guardrails", "Apply policy checks, refusal paths, rate limits, and logging.", "Guardrails for unsafe inputs, PII, and ungrounded answers", [
        r("OpenAI Usage Policies", "article", URLS.openAiPolicies),
        r("NIST AI RMF", "article", URLS.nistAiRmf)
    ])
], [
    "LangChain Application Patterns",
    "RAG and Vector Databases",
    "Fine-Tuning and Model Adaptation",
    "Production LLM App Deployment"
], [
    r("LangChain RAG Tutorial", "article", URLS.langchainRag),
    r("Hugging Face NLP Course", "article", URLS.hfCourse)
], [
    project("llm-proj-1", "Document Q&A App", "Build a RAG app over a small document collection with citations.", [
        "RAG",
        "Embeddings",
        "Evaluation"
    ], [
        "RAG app",
        "Source citations",
        "Eval set"
    ], "14 hours", "Intermediate", "lad-p3"),
    project("llm-proj-2", "Structured CRM Note Extractor", "Extract contacts, tasks, and risks from sales notes into typed JSON.", [
        "Structured outputs",
        "Validation",
        "Prompting"
    ], [
        "Schema",
        "Extractor",
        "Error cases"
    ], "10 hours", "Intermediate", "lad-p2"),
    project("llm-proj-3", "Production Readiness Plan", "Create deployment, monitoring, cost, safety, and incident response plan for an LLM app.", [
        "MLOps",
        "Monitoring",
        "Safety"
    ], [
        "Runbook",
        "Cost model",
        "Monitoring checklist"
    ], "12 hours", "Advanced", "lad-p5")
]);
const aiEthicsSpecialist = careerRoadmap("9", "ai-ethics-specialist", "AI Ethics & Governance Specialist", "Assess AI systems for risk, bias, policy compliance, transparency, and responsible deployment.", "Governance", "Intermediate", [
    phaseOneSection("ethics-p1-s1", "Responsible AI Frameworks", "Compare NIST, Google, and organizational responsible AI principles.", "Risk management framework mapped to AI system lifecycle", [
        r("NIST AI RMF", "article", URLS.nistAiRmf),
        r("Google Responsible AI Practices", "article", URLS.googleResponsibleAi)
    ]),
    phaseOneSection("ethics-p1-s2", "EU AI Act Basics", "Understand risk categories, obligations, and governance implications.", "Risk classification under the EU AI Act", [
        r("EU AI Act Overview", "article", URLS.euAiAct),
        r("NIST AI RMF", "article", URLS.nistAiRmf)
    ]),
    phaseOneSection("ethics-p1-s3", "Bias and Fairness Auditing", "Identify representational, measurement, and outcome bias in AI systems.", "Bias audit comparing performance across affected groups", [
        r("Google Responsible AI Practices", "article", URLS.googleResponsibleAi),
        r("Stanford HELM", "article", URLS.helm)
    ]),
    phaseOneSection("ethics-p1-s4", "Transparency and Documentation", "Create model cards, data sheets, decision logs, and user-facing disclosures.", "Model documentation covering intended use and limitations", [
        r("Hugging Face NLP Course", "article", URLS.hfCourse),
        r("NIST AI RMF", "article", URLS.nistAiRmf)
    ]),
    phaseOneSection("ethics-p1-s5", "AI Incident and Risk Review", "Prepare escalation paths, monitoring, and post-incident analysis.", "Incident process with severity, owner, mitigation, and follow-up", [
        r("OWASP API Security Top 10", "article", URLS.owaspApi),
        r("Google Cloud Security Best Practices", "article", URLS.googleSecurity)
    ])
], [
    "AI Policy and Risk Classification",
    "Bias Audit Methods",
    "Governance Documentation",
    "Responsible AI Review Board"
], [
    r("NIST AI RMF", "article", URLS.nistAiRmf),
    r("EU AI Act Overview", "article", URLS.euAiAct)
], [
    project("ethics-proj-1", "AI Risk Assessment", "Assess a fictional hiring AI feature for risk, stakeholders, controls, and launch gates.", [
        "Risk management",
        "Policy",
        "Documentation"
    ], [
        "Risk register",
        "Mitigation plan",
        "Launch gates"
    ], "10 hours", "Intermediate", "aegs-p2"),
    project("ethics-proj-2", "Bias Audit Report", "Evaluate model outputs across user groups and write a fairness findings report.", [
        "Bias audit",
        "Metrics",
        "Communication"
    ], [
        "Audit notebook",
        "Findings report",
        "Recommendations"
    ], "14 hours", "Advanced", "aegs-p3"),
    project("ethics-proj-3", "Governance Playbook", "Create a governance checklist and review process for AI product teams.", [
        "Governance",
        "Process design",
        "Responsible AI"
    ], [
        "Checklist",
        "Review workflow",
        "Template pack"
    ], "12 hours", "Advanced", "aegs-p5")
]);
const aiSalesMarketing = careerRoadmap("10", "ai-sales-marketing", "AI Sales & Marketing Specialist", "Use AI to improve CRM workflows, personalization, campaign creation, forecasting, and revenue operations.", "Sales & Marketing", "Beginner to Intermediate", [
    phaseOneSection("sales-p1-s1", "AI CRM Workflow Basics", "Use AI to summarize leads, enrich CRM records, and prioritize follow-up.", "CRM workflow with validated enrichment and next-best action", [
        r("Salesforce AI", "article", URLS.salesforceAi),
        r("HubSpot AI Sales Guide", "article", URLS.hubspotAiSales)
    ]),
    phaseOneSection("sales-p1-s2", "Personalisation at Scale", "Segment audiences and generate tailored messaging with review controls.", "Segment-specific messaging based on verified attributes", [
        r("HubSpot AI Sales Guide", "article", URLS.hubspotAiSales),
        r("OpenAI Prompt Engineering Guide", "article", URLS.openAiPrompting)
    ]),
    phaseOneSection("sales-p1-s3", "AI Ad and Campaign Creation", "Create campaign briefs, ad variants, landing-page ideas, and QA checklists.", "Campaign variants mapped to audience, channel, and offer", [
        r("Google SEO Starter Guide", "article", URLS.googleSeo),
        r("HubSpot Content Marketing Guide", "article", URLS.hubspotContent)
    ]),
    phaseOneSection("sales-p1-s4", "Sales Forecasting Foundations", "Understand pipeline stages, conversion rates, seasonality, and forecast hygiene.", "Forecast built from pipeline stages and historical conversion rates", [
        r("Google Analytics 4 Reports", "article", URLS.googleAnalytics),
        r("Khan Academy Statistics", "article", URLS.khanStats)
    ]),
    phaseOneSection("sales-p1-s5", "Responsible Sales Automation", "Respect consent, opt-outs, claims, and human review of outbound messages.", "Compliance and opt-out checks before outbound automation", [
        r("OpenAI Usage Policies", "article", URLS.openAiPolicies),
        r("NIST AI RMF", "article", URLS.nistAiRmf)
    ])
], [
    "AI CRM Operations",
    "Personalized Outreach Systems",
    "AI Campaign Production",
    "Forecasting and Revenue Reporting"
], [
    r("Salesforce AI", "article", URLS.salesforceAi),
    r("HubSpot AI Sales Guide", "article", URLS.hubspotAiSales)
], [
    project("sales-proj-1", "AI Lead Research Workflow", "Create a workflow that enriches inbound leads and drafts personalized follow-up notes.", [
        "CRM",
        "Prompting",
        "Personalization"
    ], [
        "Lead profile",
        "Email draft",
        "CRM update"
    ], "8 hours", "Beginner", "aism-p2"),
    project("sales-proj-2", "Campaign Variant Generator", "Generate and QA multiple ad and landing-page message variants for a campaign.", [
        "Campaign strategy",
        "AI writing",
        "QA"
    ], [
        "Campaign brief",
        "Variants",
        "Review checklist"
    ], "10 hours", "Intermediate", "aism-p4"),
    project("sales-proj-3", "Sales Forecasting Dashboard", "Build a simple forecast model and dashboard using CRM-style pipeline data.", [
        "Forecasting",
        "Analytics",
        "Reporting"
    ], [
        "Forecast sheet",
        "Dashboard",
        "Insight memo"
    ], "14 hours", "Advanced", "aism-p5")
]);
const allRoadmaps = [
    aiAutomationSpecialist,
    promptEngineer,
    aiDataAnalyst,
    aiContentCreator,
    mlEngineer,
    aiProductManager,
    aiUxDesigner,
    llmApplicationDeveloper,
    aiEthicsSpecialist,
    aiSalesMarketing
];
function getRoadmapBySlug(slug) {
    return allRoadmaps.find((roadmap)=>roadmap.slug === slug);
}
function getAllSlugs() {
    return allRoadmaps.map((roadmap)=>roadmap.slug);
}
function getRoadmapsByStatus(status) {
    return allRoadmaps.filter((roadmap)=>roadmap.status === status);
}
}),
"[project]/src/components/roadmap/RoadmapPageClient.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/components/roadmap/RoadmapPageClient.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/roadmap/RoadmapPageClient.tsx <module evaluation>", "default");
}),
"[project]/src/components/roadmap/RoadmapPageClient.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/components/roadmap/RoadmapPageClient.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/roadmap/RoadmapPageClient.tsx", "default");
}),
"[project]/src/components/roadmap/RoadmapPageClient.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$roadmap$2f$RoadmapPageClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/components/roadmap/RoadmapPageClient.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$roadmap$2f$RoadmapPageClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/components/roadmap/RoadmapPageClient.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$roadmap$2f$RoadmapPageClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/components/roadmap/ComingSoonRoadmap.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ComingSoonRoadmap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
;
;
function ComingSoonRoadmap({ roadmap }) {
    const previewSections = roadmap.phases.reduce((total, phase)=>total + phase.sections.length, 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "border-b border-gray-100 px-4 py-16 sm:px-6 lg:px-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-5xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-5 flex flex-wrap items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700",
                                    children: roadmap.category
                                }, void 0, false, {
                                    fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                    lineNumber: 19,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700",
                                    children: "Coming Soon"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                    lineNumber: 22,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700",
                                    children: roadmap.level
                                }, void 0, false, {
                                    fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                    lineNumber: 25,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                            lineNumber: 18,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl",
                                            children: roadmap.title
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                            lineNumber: 32,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-4 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg",
                                            children: roadmap.description
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                            lineNumber: 35,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-8 flex flex-wrap gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/#waitlist",
                                                    className: "rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                                                    children: "Join Waitlist"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                                    lineNumber: 40,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/#roadmaps",
                                                    className: "rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                                                    children: "Browse Roadmaps"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                                    lineNumber: 46,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                            lineNumber: 39,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                    lineNumber: 31,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                                    className: "rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-sm font-bold uppercase tracking-wide text-gray-700",
                                            children: "Roadmap Preview"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                            lineNumber: 56,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                                            className: "mt-5 grid grid-cols-2 gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                            className: "text-xs text-gray-500",
                                                            children: "Duration"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                                            lineNumber: 61,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                            className: "mt-1 text-sm font-bold text-gray-900",
                                                            children: roadmap.duration
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                                            lineNumber: 62,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                                    lineNumber: 60,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                            className: "text-xs text-gray-500",
                                                            children: "Hours"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                                            lineNumber: 67,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                            className: "mt-1 text-sm font-bold text-gray-900",
                                                            children: [
                                                                roadmap.totalEstimatedHours,
                                                                "h"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                                            lineNumber: 68,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                                    lineNumber: 66,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                            className: "text-xs text-gray-500",
                                                            children: "Phases"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                                            lineNumber: 73,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                            className: "mt-1 text-sm font-bold text-gray-900",
                                                            children: roadmap.phases.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                                            lineNumber: 74,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                                    lineNumber: 72,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                            className: "text-xs text-gray-500",
                                                            children: "Sections"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                                            lineNumber: 79,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                            className: "mt-1 text-sm font-bold text-gray-900",
                                                            children: previewSections
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                                            lineNumber: 80,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                                    lineNumber: 78,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                            lineNumber: 59,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                    lineNumber: 55,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                            lineNumber: 30,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                    lineNumber: 17,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "px-4 py-12 sm:px-6 lg:px-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-5xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-xl font-extrabold text-gray-900",
                            children: "What this roadmap will include"
                        }, void 0, false, {
                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                            lineNumber: 92,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-6 grid gap-4 md:grid-cols-2",
                            children: roadmap.phases.map((phase)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                    className: "rounded-xl border border-gray-200 bg-white p-5 shadow-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs font-bold uppercase tracking-wide text-indigo-600",
                                            children: [
                                                "Phase ",
                                                phase.phaseNumber,
                                                " · ",
                                                phase.weekRange
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                            lineNumber: 101,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "mt-2 text-base font-bold text-gray-900",
                                            children: phase.title
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                            lineNumber: 104,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-2 text-sm leading-relaxed text-gray-600",
                                            children: phase.description
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                            lineNumber: 107,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, phase.id, true, {
                                    fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                                    lineNumber: 97,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                            lineNumber: 95,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                    lineNumber: 91,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/roadmap/ComingSoonRoadmap.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
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
                            href: "/#roadmaps",
                            className: "text-sm font-medium text-gray-600 transition-colors hover:text-gray-900",
                            children: "Roadmaps"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/Header.tsx",
                            lineNumber: 19,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: "/#preview",
                            className: "text-sm font-medium text-gray-600 transition-colors hover:text-gray-900",
                            children: "Preview"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/Header.tsx",
                            lineNumber: 25,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: "/#how-it-works",
                            className: "text-sm font-medium text-gray-600 transition-colors hover:text-gray-900",
                            children: "How It Works"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/Header.tsx",
                            lineNumber: 31,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: "/#pricing",
                            className: "text-sm font-medium text-gray-600 transition-colors hover:text-gray-900",
                            children: "Pricing"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/Header.tsx",
                            lineNumber: 37,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: "/career-dashboard",
                            className: "text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800",
                            children: "Career Analyzer"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/Header.tsx",
                            lineNumber: 43,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/landing/Header.tsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    href: "/#waitlist",
                    className: "rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                    children: "Join Waitlist"
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/Header.tsx",
                    lineNumber: 52,
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$roadmap$2f$RoadmapPageClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/roadmap/RoadmapPageClient.tsx [app-rsc] (ecmascript)");
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$roadmap$2f$RoadmapPageClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
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

//# sourceMappingURL=%5Broot-of-the-server%5D__095elab._.js.map