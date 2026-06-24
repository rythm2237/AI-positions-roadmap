"use client";
// src/components/roadmap/CareerReadinessSection.tsx
// Final two phases shown at the bottom of every roadmap:
//   Phase A: CV, LinkedIn & Portfolio Preparation (professional consultant guide)
//   Phase B: Job Search Strategy (find & apply to real positions)
// These are static, role-agnostic phases that appear on all roadmaps.

import { useState } from "react";

interface StepItem {
  icon: string;
  title: string;
  description: string;
  tips: string[];
  resource?: { label: string; url: string };
}

const cvSteps: StepItem[] = [
  {
    icon: "📄",
    title: "Craft your AI-focused CV",
    description:
      "Your CV needs to speak the language of hiring managers looking for AI talent. Lead with impact — what you built, automated, or improved.",
    tips: [
      "Open with a 3-line professional summary that names your target role and top 2–3 skills",
      "Use a 'Key Skills' section with exact keywords from job listings (n8n, LangChain, Make, RAG, etc.)",
      "For each role, write bullet points as: Action + Tool/Method + Measurable Result",
      "Add a 'Projects' section and link directly to GitHub repos or Loom demos",
      "Keep it to 1 page if under 5 years experience, 2 pages maximum otherwise",
    ],
    resource: {
      label: "CV template for AI roles (Google Docs)",
      url: "https://docs.google.com/",
    },
  },
  {
    icon: "🔗",
    title: "Optimise your LinkedIn profile",
    description:
      "LinkedIn is where recruiters find AI talent. Your profile needs to be discoverable, credible, and compelling.",
    tips: [
      "Headline: '[Role Title] | [Top Skill] + [Top Skill] | Open to work' — be specific",
      "About section: 3–5 sentences — who you help, how you help them, what you've built",
      "Add every relevant skill keyword (n8n, Make.com, LangChain, Prompt Engineering, RAG, etc.)",
      "Request 2–3 LinkedIn recommendations from colleagues or project collaborators",
      "Post 1–2 times per week about what you're building — visibility compounds over time",
      "Set 'Open to Work' with specific job titles and locations",
    ],
    resource: {
      label: "LinkedIn profile optimisation checklist",
      url: "https://www.linkedin.com/",
    },
  },
  {
    icon: "💼",
    title: "Build a professional portfolio",
    description:
      "A portfolio proves you can do the work. Each project should tell a story: the problem, your solution, and the result.",
    tips: [
      "Host projects on GitHub with a clear README: problem → solution → demo → how to run",
      "Record a 2–3 minute Loom walkthrough for each project — show it working live",
      "Write a short case study for your top 2 projects: before/after metrics if possible",
      "Create a simple portfolio page (GitHub Pages, Notion, or a simple site) linking all projects",
      "Include screenshots, architecture diagrams, and workflow screenshots where relevant",
    ],
    resource: {
      label: "Portfolio hosting with GitHub Pages (free)",
      url: "https://pages.github.com/",
    },
  },
  {
    icon: "🎓",
    title: "Add certifications strategically",
    description:
      "The right certifications signal credibility to hiring managers who may not be technical themselves.",
    tips: [
      "Priority 1: Azure AI Fundamentals (AI-900) — $165, widely recognised, 2–4 weeks prep",
      "Priority 2: n8n Certification — Free, niche but highly relevant for automation roles",
      "Priority 3: Make.com Certification — Free, signals hands-on platform expertise",
      "Priority 4: DeepLearning.AI courses — Free, credible in AI/ML circles",
      "List certifications prominently in your CV and LinkedIn 'Licences & Certifications' section",
    ],
    resource: {
      label: "Azure AI-900 exam page (Microsoft Learn)",
      url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/",
    },
  },
];

const jobSearchSteps: StepItem[] = [
  {
    icon: "🔍",
    title: "Find the right job listings",
    description:
      "AI automation roles are growing rapidly but often have inconsistent titles. You need to search broadly and filter smartly.",
    tips: [
      "Search titles: 'AI Automation Specialist', 'Automation Engineer', 'AI Workflow Engineer', 'No-Code AI Developer', 'Process Automation Specialist'",
      "Best platforms: LinkedIn Jobs, Indeed, Wellfound (AngelList), Otta, Himalayas (remote)",
      "Use Boolean search: (n8n OR Make.com OR Zapier) AND (AI OR automation) on LinkedIn",
      "Filter for remote-first companies — they have the largest global talent pools and often pay better",
      "Set up job alerts for your target titles — apply within 24h of posting for best response rates",
    ],
    resource: {
      label: "Wellfound — AI startup jobs",
      url: "https://wellfound.com/jobs",
    },
  },
  {
    icon: "🎯",
    title: "Tailor every application",
    description:
      "Generic applications get ignored. Spend 20 minutes tailoring each application — it dramatically improves response rates.",
    tips: [
      "Read the job description carefully — identify the 3 most important requirements",
      "Mirror the exact language from the job listing in your CV summary and cover letter",
      "Write a 3-paragraph cover letter: why this role, what you've built, what you'll do for them",
      "Use AI (Claude or ChatGPT) to help tailor your materials — but always personalise the output",
      "Aim for quality over quantity: 5 tailored applications beat 50 generic ones",
    ],
  },
  {
    icon: "🤝",
    title: "Network actively",
    description:
      "50–70% of jobs are filled through referrals. Building relationships accelerates your search significantly.",
    tips: [
      "Connect with AI automation professionals on LinkedIn — send a personal note, not a template",
      "Join n8n, Make.com, and LangChain communities (Discord, Slack, Reddit) — be helpful and visible",
      "Attend virtual AI meetups and webinars — introduce yourself and follow up with connections",
      "Ask for informational interviews: 20-minute calls to learn about someone's role and company",
      "Offer to help before asking for anything — give value first",
    ],
    resource: {
      label: "n8n Community (Discord)",
      url: "https://community.n8n.io/",
    },
  },
  {
    icon: "💬",
    title: "Prepare for interviews",
    description:
      "AI automation interviews typically combine technical demonstrations, behavioural questions, and business case discussions.",
    tips: [
      "Prepare 3 STAR stories (Situation, Task, Action, Result) for your best projects",
      "Be ready to walk through a workflow live — practice explaining your projects clearly",
      "Study the company's tech stack and current automation challenges before the interview",
      "Prepare questions that show strategic thinking: 'What processes are you looking to automate next?'",
      "Negotiate confidently — research salary ranges on Glassdoor, LinkedIn Salary, and Levels.fyi",
    ],
    resource: {
      label: "Glassdoor salary data",
      url: "https://www.glassdoor.com/Salaries/",
    },
  },
  {
    icon: "📊",
    title: "Track and optimise your search",
    description:
      "Job searching is a numbers game with a feedback loop. Track everything and iterate based on what's working.",
    tips: [
      "Use a simple spreadsheet to track: company, role, applied date, status, follow-up date",
      "Follow up on applications after 5–7 business days with a short, polite email",
      "If you get rejections, analyse the pattern — is it the CV, the cover letter, or the interview?",
      "Aim for 3–5 quality applications per week, not 20+ generic ones",
      "Celebrate progress milestones — first response, first interview, first offer",
    ],
  },
];

function StepCard({ step, index }: { step: StepItem; index: number }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-inset"
        aria-expanded={open}
      >
        <span className="text-2xl shrink-0" aria-hidden="true">
          {step.icon}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-900">{step.title}</h4>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {step.description}
          </p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <ul className="mt-4 flex flex-col gap-2.5">
            {step.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
          {step.resource && (
            <a
              href={step.resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              {step.resource.label}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function CareerReadinessSection({ roleTitle }: { roleTitle: string }) {
  const [activeTab, setActiveTab] = useState<"profile" | "jobs">("profile");

  return (
    <section
      id="career-readiness"
      className="bg-white border-b border-gray-100 px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Final Steps
            </span>
            <span className="text-xs text-gray-400">After completing your roadmap</span>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">
            Career Readiness: Land Your{" "}
            <span className="text-indigo-600">{roleTitle}</span> Role
          </h2>
          <p className="text-sm text-gray-500 max-w-2xl">
            Your skills are built — now it&apos;s time to package them professionally
            and enter the job market with confidence. Follow these steps like a
            professional career consultant would advise.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "profile"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            📄 CV, LinkedIn & Portfolio
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "jobs"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            🎯 Job Search Strategy
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "profile" && (
          <div className="flex flex-col gap-3">
            <div className="mb-4 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
              <p className="text-sm text-indigo-800">
                <strong>Professional advice:</strong> Most candidates get rejected
                not because of skills, but because of poor presentation. Invest
                2–3 hours here — it pays dividends for your entire career.
              </p>
            </div>
            {cvSteps.map((step, i) => (
              <StepCard key={step.title} step={step} index={i} />
            ))}
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="flex flex-col gap-3">
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
              <p className="text-sm text-emerald-800">
                <strong>Job search reality:</strong> The average AI automation
                role receives 50–200 applications. Quality, speed, and
                personalisation are your competitive advantages.
              </p>
            </div>
            {jobSearchSteps.map((step, i) => (
              <StepCard key={step.title} step={step} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
