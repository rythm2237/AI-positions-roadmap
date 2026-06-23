"use client";
// src/components/career/CareerDashboard.tsx
// Full 9-tab AI Career Dashboard — ported from career-dashboard.tsx prototype.
// Client component: all state is local, no server data needed.

import { useState, useRef, useCallback } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface SkillItem {
  cat: string;
  name: string;
  demand: number;
  freq: string;
  diff: number;
  hire: number;
}

interface RoadmapPhase {
  phase: number;
  title: string;
  time: string;
  weeks: number;
  color: string;
  topics: string[];
  free: string[];
  paid: string[];
  exercise: string;
}

interface TimelineState {
  startDate: Date;
  phaseOffsets: number[];
  completedPhases: boolean[];
}

interface CVAnalysis {
  strengths: string[];
  gaps: string[];
  score: number;
  topSkills: string[];
  missingSkills: string[];
  recommendedPath: string;
  timeEstimate: string;
  priorityActions: string[];
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const POSITIONS = [
  { id: "ai-automation", label: "🤖 AI Automation Specialist" },
  { id: "prompt-engineer", label: "✍️ Prompt Engineer" },
  { id: "ai-data-analyst", label: "📊 AI Data Analyst" },
  { id: "ml-engineer", label: "⚙️ ML Engineer" },
  { id: "ai-product-manager", label: "🧭 AI Product Manager" },
];

const TABS = [
  { id: "market", label: "📊 Market" },
  { id: "skills", label: "🧠 Skills" },
  { id: "roadmap", label: "🗺️ Roadmap" },
  { id: "certs", label: "🎓 Certifications" },
  { id: "portfolio", label: "💼 Portfolio" },
  { id: "countries", label: "🌍 Countries" },
  { id: "gap", label: "🔍 Gap Analysis" },
  { id: "strategy", label: "🚀 Strategy" },
  { id: "cv", label: "📄 CV Analyzer" },
];

const skillsData: SkillItem[] = [
  { cat: "Technical", name: "REST API & Webhooks", demand: 10, freq: "95%", diff: 3, hire: 10 },
  { cat: "Technical", name: "Python", demand: 9, freq: "80%", diff: 5, hire: 9 },
  { cat: "Technical", name: "JavaScript / TypeScript", demand: 8, freq: "65%", diff: 4, hire: 8 },
  { cat: "Technical", name: "Git & Version Control", demand: 8, freq: "70%", diff: 2, hire: 7 },
  { cat: "Technical", name: "SQL (Basics)", demand: 7, freq: "55%", diff: 3, hire: 7 },
  { cat: "Technical", name: "Docker / Cloud Basics", demand: 6, freq: "40%", diff: 6, hire: 6 },
  { cat: "AI", name: "Prompt Engineering", demand: 10, freq: "90%", diff: 2, hire: 10 },
  { cat: "AI", name: "LLM APIs (OpenAI/Claude/Gemini)", demand: 10, freq: "92%", diff: 3, hire: 10 },
  { cat: "AI", name: "AI Agents & Multi-agent", demand: 9, freq: "75%", diff: 6, hire: 9 },
  { cat: "AI", name: "RAG (Retrieval-Augmented Gen)", demand: 9, freq: "70%", diff: 6, hire: 9 },
  { cat: "AI", name: "LangChain / LangGraph", demand: 8, freq: "65%", diff: 6, hire: 8 },
  { cat: "AI", name: "Vector Databases (Pinecone/pgvector)", demand: 7, freq: "50%", diff: 5, hire: 7 },
  { cat: "Automation", name: "n8n", demand: 10, freq: "88%", diff: 3, hire: 10 },
  { cat: "Automation", name: "Make.com", demand: 9, freq: "82%", diff: 2, hire: 9 },
  { cat: "Automation", name: "Zapier", demand: 8, freq: "75%", diff: 2, hire: 8 },
  { cat: "Automation", name: "Power Automate", demand: 7, freq: "55%", diff: 3, hire: 7 },
  { cat: "Automation", name: "LangChain Pipelines", demand: 8, freq: "60%", diff: 6, hire: 8 },
  { cat: "Automation", name: "CrewAI / AutoGen", demand: 7, freq: "45%", diff: 7, hire: 7 },
  { cat: "Business", name: "Process Mapping & Design", demand: 8, freq: "70%", diff: 2, hire: 8 },
  { cat: "Business", name: "API Integration (business)", demand: 9, freq: "80%", diff: 3, hire: 9 },
  { cat: "Business", name: "ROI Calculation", demand: 7, freq: "55%", diff: 3, hire: 7 },
  { cat: "Business", name: "Stakeholder Communication", demand: 8, freq: "72%", diff: 2, hire: 8 },
  { cat: "Business", name: "Technical Documentation", demand: 9, freq: "85%", diff: 2, hire: 9 },
  { cat: "Business", name: "Requirements Analysis", demand: 7, freq: "58%", diff: 3, hire: 7 },
];

const roadmapPhases: RoadmapPhase[] = [
  {
    phase: 1, title: "Technical Foundations", time: "4–6 weeks", weeks: 5, color: "#3b82f6",
    topics: ["Python basics (Automate the Boring Stuff)", "REST APIs & Webhooks", "Git & GitHub", "SQL basics (SQLZoo, Mode)"],
    free: ["freeCodeCamp Python", "Automate Boring Stuff (free)", "GitHub Learning Lab"],
    paid: ["Python Bootcamp – Udemy ($15)", "CS50 Python (free/certificate)"],
    exercise: "Write a Python script that fetches data from an API and saves it to CSV",
  },
  {
    phase: 2, title: "Automation Platforms", time: "6–8 weeks", weeks: 7, color: "#8b5cf6",
    topics: ["Make.com (Foundation → Intermediate)", "n8n (self-hosted + cloud)", "Power Automate + Copilot", "Zapier basics"],
    free: ["Make Academy (fully free)", "n8n Docs & Community", "Microsoft Learn Power Automate"],
    paid: ["n8n Course – Udemy ($15)", "Make.com Advanced – YouTube"],
    exercise: "Build 3 workflows: lead capture, email notification, data sync",
  },
  {
    phase: 3, title: "AI Fundamentals", time: "6–8 weeks", weeks: 7, color: "#10b981",
    topics: ["Prompt Engineering (DeepLearning.AI free)", "LLM APIs: OpenAI, Claude, Gemini", "RAG (Retrieval-Augmented Generation)", "AI Agents basics with LangChain"],
    free: ["DeepLearning.AI Short Courses (free)", "Anthropic Docs", "LangChain Docs", "n8n AI Agent nodes"],
    paid: ["LangChain Bootcamp – Udemy ($15)", "Building AI Apps with Claude – Anthropic"],
    exercise: "Build a RAG chatbot that answers questions from PDF documents",
  },
  {
    phase: 4, title: "Real-World Projects", time: "8–10 weeks", weeks: 9, color: "#f59e0b",
    topics: ["Customer Support Automation", "CRM & Lead Automation", "Document Processing Pipeline", "Multi-agent Research System"],
    free: ["n8n Community Templates", "GitHub Public Repos", "YouTube walkthroughs"],
    paid: ["Mentoring on MentorCruise ($50–150/mo)"],
    exercise: "5 complete projects with Teardown documents (before/after + metrics)",
  },
  {
    phase: 5, title: "Job Readiness", time: "4–6 weeks", weeks: 5, color: "#ef4444",
    topics: ["Portfolio GitHub + Loom video demos", "Azure AI-900 certification", "LinkedIn optimization with keywords", "Interview prep + salary negotiation"],
    free: ["LinkedIn Learning (Azure AI-900 prep)", "Microsoft Learn (free)", "Glassdoor Interview Questions"],
    paid: ["Leetcode Premium ($35/mo) for technical interviews"],
    exercise: "Find 3 real job listings and tailor your resume for each",
  },
];

const certsData = [
  { name: "Azure AI Fundamentals (AI-900)", value: "High", cost: "$165", diff: "Easy", roi: "Very High", rec: "✅ Start here" },
  { name: "Azure AI Engineer (AI-102)", value: "Very High", cost: "$165", diff: "Medium", roi: "Very High", rec: "✅ Best for CV" },
  { name: "n8n Certification (official)", value: "High (niche)", cost: "Free", diff: "Easy", roi: "High", rec: "✅ Do it" },
  { name: "Make.com Certification", value: "High (niche)", cost: "Free", diff: "Easy", roi: "High", rec: "✅ Do it" },
  { name: "Google AI Essentials (Coursera)", value: "Medium", cost: "$49", diff: "Easy", roi: "Medium", rec: "⚠️ Optional" },
  { name: "AWS AI Practitioner", value: "Medium", cost: "$150", diff: "Medium", roi: "Medium", rec: "⚠️ If using AWS" },
  { name: "DeepLearning.AI Courses", value: "Medium", cost: "Free–$50", diff: "Medium", roi: "High", rec: "✅ For knowledge" },
  { name: "IBM Generative AI Engineering", value: "Medium", cost: "$99", diff: "Medium", roi: "Medium", rec: "⚠️ Optional" },
  { name: "UiPath / Power Platform", value: "Low", cost: "Free–$200", diff: "Medium", roi: "Low", rec: "❌ Low priority" },
  { name: "Coursera ML Specialization", value: "Medium", cost: "$50/mo", diff: "High", roi: "Low (long)", rec: "❌ Not needed for this path" },
];

const portfolioProjects = [
  { rank: 1, name: "AI Customer Support Bot (n8n + Claude API)", diff: "Medium", tech: "n8n, Claude API, Webhook", time: "3-5 days", score: 10 },
  { rank: 2, name: "Invoice Processing & Data Extraction Pipeline", diff: "Medium", tech: "n8n, Claude Vision, Google Sheets", time: "3-4 days", score: 10 },
  { rank: 3, name: "Lead Qualification & CRM Auto-routing", diff: "Medium", tech: "Make.com, OpenAI, HubSpot/Airtable", time: "4-6 days", score: 9 },
  { rank: 4, name: "RAG Knowledge Base for Business Docs", diff: "Medium-High", tech: "Python, LangChain, Pinecone, Claude", time: "1-2 weeks", score: 9 },
  { rank: 5, name: "AI Email Triage & Auto-response System", diff: "Easy-Medium", tech: "n8n, Gmail API, OpenAI", time: "2-3 days", score: 9 },
  { rank: 6, name: "Multi-agent Research Assistant", diff: "High", tech: "LangGraph, CrewAI, Python", time: "2 weeks", score: 9 },
  { rank: 7, name: "Automated Social Media Content Pipeline", diff: "Easy", tech: "Make.com, OpenAI, Buffer/LinkedIn API", time: "2-3 days", score: 8 },
  { rank: 8, name: "Business Process Automation Dashboard", diff: "Medium", tech: "n8n, Power Automate, Dashboard UI", time: "1 week", score: 8 },
  { rank: 9, name: "AI-powered Appointment Booking Agent", diff: "Medium", tech: "n8n, Claude, Google Calendar API", time: "4-5 days", score: 8 },
  { rank: 10, name: "Slack/Teams AI Assistant for Internal Ops", diff: "Medium", tech: "n8n, Slack API, LLM", time: "4-6 days", score: 8 },
];

const countriesData = [
  { rank: 1, country: "🇳🇱 Netherlands", salary: "€70–100K", vacancies: "High", visa: "Good (DETO/Highly Skilled)", english: "Excellent", remote: "Lots", potential: "Very High", note: "30% Tax Ruling = huge net salary boost!" },
  { rank: 2, country: "🇮🇪 Ireland", salary: "€90–130K", vacancies: "Very High", visa: "Good", english: "Native", remote: "Lots", potential: "Very High", note: "Google, Meta, Apple HQ – best networking hub" },
  { rank: 3, country: "🇩🇪 Germany", salary: "€65–95K", vacancies: "Very High", visa: "Excellent (Chancenkarte)", english: "Medium", remote: "Lots", potential: "High", note: "Largest EU market, Opportunity Card visa" },
  { rank: 4, country: "🇬🇧 UK", salary: "€72–110K", vacancies: "Very High", visa: "Medium (Skilled Worker)", english: "Native", remote: "Lots", potential: "High", note: "London – strongest fintech+AI ecosystem" },
  { rank: 5, country: "🇨🇭 Switzerland", salary: "€96–160K", vacancies: "Medium", visa: "Hard", english: "Good", remote: "Medium", potential: "High", note: "Highest EU salaries, hard to enter" },
  { rank: 6, country: "🇸🇪 Sweden", salary: "€66–90K", vacancies: "Medium", visa: "Good", english: "Excellent", remote: "Lots", potential: "Medium–High", note: "Stockholm active, excellent quality of life" },
  { rank: 7, country: "🇦🇪 UAE", salary: "$80–130K (tax-free)", vacancies: "High", visa: "Easy", english: "Good", remote: "Lots", potential: "High", note: "Zero tax, Dubai startup scene" },
  { rank: 8, country: "🇸🇬 Singapore", salary: "$90–140K", vacancies: "High", visa: "Medium", english: "Native", remote: "Lots", potential: "High", note: "Asia hub, English-first" },
];

// ─── CV ANALYSIS ENGINE ───────────────────────────────────────────────────────

const KEY_SKILLS = [
  "python", "javascript", "typescript", "sql", "git", "docker", "api", "webhook",
  "prompt engineering", "llm", "openai", "claude", "gemini", "langchain", "rag",
  "vector", "pinecone", "n8n", "make.com", "zapier", "power automate", "automation",
  "ai agent", "crewai", "langraph", "process mapping", "stakeholder", "documentation",
  "requirements", "roi", "crm", "data analysis", "machine learning", "deep learning",
  "tensorflow", "pytorch", "aws", "azure", "gcp", "cloud", "kubernetes", "react",
  "node", "fastapi", "flask", "django", "mongodb", "postgresql",
];

const STRONG_SKILLS = ["n8n", "make.com", "langchain", "openai", "claude", "python", "prompt engineering", "rag", "ai agent"];
const NICE_SKILLS = ["javascript", "typescript", "sql", "git", "power automate", "zapier", "docker", "azure", "aws"];

function analyzeCV(text: string): CVAnalysis {
  const lower = text.toLowerCase();
  const found = KEY_SKILLS.filter(s => lower.includes(s));
  const strong = STRONG_SKILLS.filter(s => lower.includes(s));
  const missing = STRONG_SKILLS.filter(s => !lower.includes(s));
  const niceFound = NICE_SKILLS.filter(s => lower.includes(s));

  const score = Math.min(100, Math.round((strong.length / STRONG_SKILLS.length) * 60 + (niceFound.length / NICE_SKILLS.length) * 40));

  const hasMarketing = /marketing|campaign|seo|social media|content|brand/i.test(text);
  const hasOps = /operations|process|workflow|efficiency|improvement|lean|agile/i.test(text);
  const hasTech = /developer|engineer|software|programming|code|api|database/i.test(text);
  const hasManagement = /manager|director|lead|head of|senior|team/i.test(text);

  const strengths: string[] = [];
  const gaps: string[] = [];
  const priorityActions: string[] = [];

  if (strong.length > 0) strengths.push(`Core AI Automation skills detected: ${strong.join(", ")}`);
  if (hasMarketing) strengths.push("Marketing background → directly applicable to CRM & lead automation");
  if (hasOps) strengths.push("Operations experience → process mapping before automation is a critical skill");
  if (hasTech) strengths.push("Technical background → faster learning curve for APIs and code");
  if (hasManagement) strengths.push("Leadership experience → stakeholder management and ROI presentation");
  if (niceFound.length > 0) strengths.push(`Supporting skills: ${niceFound.join(", ")}`);
  if (strengths.length === 0) strengths.push("General professional experience — ready to build AI skills from scratch");

  if (missing.includes("n8n")) { gaps.push("n8n — most in-demand automation platform (2026)"); priorityActions.push("Start n8n Cloud free trial this week — build 3 workflows"); }
  if (missing.includes("python")) { gaps.push("Python — needed for advanced automation and AI pipelines"); priorityActions.push("Complete 'Automate the Boring Stuff with Python' (free, 4–6 weeks)"); }
  if (missing.includes("prompt engineering")) { gaps.push("Prompt Engineering — core skill for all LLM-based automation"); priorityActions.push("Take DeepLearning.AI 'Prompt Engineering for Developers' (free, 1 week)"); }
  if (missing.includes("langchain")) { gaps.push("LangChain / LangGraph — needed for AI agents and RAG pipelines"); priorityActions.push("Build a simple RAG chatbot using LangChain + Claude API"); }
  if (missing.includes("rag")) { gaps.push("RAG (Retrieval-Augmented Generation) — key for enterprise AI solutions"); }
  if (missing.includes("make.com")) { gaps.push("Make.com — second most popular no-code automation platform"); priorityActions.push("Complete Make Academy (fully free) — Foundation + Intermediate"); }
  if (gaps.length === 0) gaps.push("Minor gaps only — focus on building portfolio projects");
  if (priorityActions.length === 0) priorityActions.push("Build 5 portfolio projects and publish on GitHub with Loom demos");

  const timeEstimate = score >= 70 ? "2–3 months to first job offer"
    : score >= 40 ? "4–5 months to first job offer"
    : "5–7 months to first job offer";

  const recommendedPath = score >= 60
    ? "Fast-track: Focus on portfolio projects + Azure AI-900 certification"
    : score >= 30
    ? "Standard path: Fill skill gaps in parallel with building projects"
    : "Foundation path: Start with Python + n8n basics, then build up";

  return { strengths, gaps, score, topSkills: found.slice(0, 8), missingSkills: missing, recommendedPath, timeEstimate, priorityActions };
}

// ─── TIMELINE UTILITIES ───────────────────────────────────────────────────────

function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function CareerDashboard() {
  const [activeTab, setActiveTab] = useState("market");
  const [activePosition, setActivePosition] = useState("ai-automation");
  const [skillFilter, setSkillFilter] = useState("All");

  // CV Analyzer state
  const [cvText, setCvText] = useState("");
  const [cvAnalysis, setCvAnalysis] = useState<CVAnalysis | null>(null);
  const [cvLoading, setCvLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timeline state
  const [timeline, setTimeline] = useState<TimelineState>({
    startDate: new Date(),
    phaseOffsets: roadmapPhases.map(() => 0),
    completedPhases: roadmapPhases.map(() => false),
  });
  const [showTimelineEditor, setShowTimelineEditor] = useState(false);

  const skillCats = ["All", "Technical", "AI", "Automation", "Business"];
  const filteredSkills = skillFilter === "All" ? skillsData : skillsData.filter(s => s.cat === skillFilter);

  // ── CV Analysis ──
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCvText(text);
    };
    reader.readAsText(file);
  }, []);

  const runCVAnalysis = useCallback(() => {
    if (!cvText.trim()) return;
    setCvLoading(true);
    setTimeout(() => {
      const result = analyzeCV(cvText);
      setCvAnalysis(result);
      setCvLoading(false);
    }, 1200);
  }, [cvText]);

  // ── Timeline helpers ──
  function getPhaseStart(phaseIndex: number): Date {
    let d = new Date(timeline.startDate);
    for (let i = 0; i < phaseIndex; i++) {
      const totalWeeks = roadmapPhases[i].weeks + timeline.phaseOffsets[i];
      d = addWeeks(d, totalWeeks);
    }
    return d;
  }

  function getPhaseEnd(phaseIndex: number): Date {
    const start = getPhaseStart(phaseIndex);
    return addWeeks(start, roadmapPhases[phaseIndex].weeks + timeline.phaseOffsets[phaseIndex]);
  }

  function postponePhase(phaseIndex: number, extraWeeks: number) {
    setTimeline(prev => {
      const offsets = [...prev.phaseOffsets];
      offsets[phaseIndex] = Math.max(0, offsets[phaseIndex] + extraWeeks);
      return { ...prev, phaseOffsets: offsets };
    });
  }

  function compressPhase(phaseIndex: number) {
    setTimeline(prev => {
      const offsets = [...prev.phaseOffsets];
      offsets[phaseIndex] = Math.max(-Math.floor(roadmapPhases[phaseIndex].weeks * 0.3), offsets[phaseIndex] - 1);
      return { ...prev, phaseOffsets: offsets };
    });
  }

  function toggleComplete(phaseIndex: number) {
    setTimeline(prev => {
      const completed = [...prev.completedPhases];
      completed[phaseIndex] = !completed[phaseIndex];
      return { ...prev, completedPhases: completed };
    });
  }

  function resetTimeline() {
    setTimeline({
      startDate: new Date(),
      phaseOffsets: roadmapPhases.map(() => 0),
      completedPhases: roadmapPhases.map(() => false),
    });
  }

  const totalWeeks = roadmapPhases.reduce((sum, p, i) => sum + p.weeks + timeline.phaseOffsets[i], 0);
  const estimatedEnd = addWeeks(timeline.startDate, totalWeeks);
  const completedCount = timeline.completedPhases.filter(Boolean).length;

  // ─── STYLES ───────────────────────────────────────────────────────────────

  const s = {
    page: { fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#0f172a", minHeight: "100vh", color: "#e2e8f0" } as React.CSSProperties,
    header: { background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)", borderBottom: "1px solid #1e40af", padding: "20px 20px 16px" } as React.CSSProperties,
    card: { background: "#1e293b", borderRadius: 12, padding: 20, marginBottom: 16, border: "1px solid #334155" } as React.CSSProperties,
    table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 14 },
    th: { padding: "10px 12px", textAlign: "left" as const, borderBottom: "1px solid #334155", color: "#94a3b8", background: "#1e293b" },
    td: { padding: "10px 12px", borderBottom: "1px solid #1e293b", color: "#e2e8f0" },
    badge: (color: string) => ({ background: color + "22", border: `1px solid ${color}44`, borderRadius: 20, padding: "3px 10px", fontSize: 12, color }),
    btn: (active: boolean, color = "#2563eb") => ({
      background: active ? color : "#1e293b",
      border: `1px solid ${active ? color : "#334155"}`,
      color: active ? "#fff" : "#94a3b8",
      borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontSize: 13, transition: "all 0.2s",
    }),
    pill: (color: string) => ({ background: "#0f172a", border: `1px solid ${color}`, borderRadius: 20, padding: "4px 12px", fontSize: 13, color }),
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div style={s.page}>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={s.badge("#2563eb")}>2026 Job Market Data</span>
            <span style={s.badge("#059669")}>Glassdoor / ZipRecruiter / Job Boards</span>
          </div>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>
            🤖 AI Career Path Analyzer
          </h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
            Comprehensive 9-tab career analysis — personalized strategy, CV analysis &amp; flexible timeline
          </p>
        </div>
      </div>

      {/* ── POSITION SELECTOR ── */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "10px 20px", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 8, maxWidth: 960, margin: "0 auto", flexWrap: "wrap" }}>
          <span style={{ color: "#64748b", fontSize: 12, alignSelf: "center", whiteSpace: "nowrap" }}>Career path:</span>
          {POSITIONS.map(p => (
            <button key={p.id} onClick={() => setActivePosition(p.id)} style={s.btn(activePosition === p.id, "#7c3aed")}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB NAV ── */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 2, padding: "0 20px", maxWidth: 960, margin: "0 auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              background: activeTab === t.id ? "#1e3a5f" : "transparent",
              border: "none", borderBottom: activeTab === t.id ? "2px solid #3b82f6" : "2px solid transparent",
              color: activeTab === t.id ? "#93c5fd" : "#64748b",
              padding: "11px 13px", cursor: "pointer", fontSize: 13, fontWeight: 600,
              whiteSpace: "nowrap", transition: "all 0.2s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>

        {/* ══════════════════════════════════════════════════════
            TAB: MARKET
        ══════════════════════════════════════════════════════ */}
        {activeTab === "market" && (
          <div>
            <h2 style={{ color: "#93c5fd", marginTop: 0 }}>📊 Job Market Analysis — AI Automation Specialist</h2>

            <div style={{ ...s.card, border: "1px solid #f59e0b44" }}>
              <h3 style={{ color: "#fbbf24", marginTop: 0 }}>💡 Key Market Insight 2026</h3>
              <p style={{ margin: 0, lineHeight: 1.8, color: "#cbd5e1" }}>
                The same job with the title <strong style={{ color: "#f87171" }}>&quot;Specialist&quot;</strong> pays ~<strong>$76K</strong>,
                but with the title <strong style={{ color: "#4ade80" }}>&quot;Engineer&quot;</strong> the same work pays <strong>$107–136K</strong>.
                That means your job title is worth nearly <strong style={{ color: "#fbbf24" }}>$60,000 more</strong> — not your skills.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
              {[
                { label: "AI Integration YoY Growth", val: "+178%", color: "#4ade80" },
                { label: "AI Automation Engineer avg (USA)", val: "$107K", color: "#60a5fa" },
                { label: "Glassdoor AI Automation Engineer", val: "$136K", color: "#a78bfa" },
                { label: "n8n Jobs in March 2026", val: "455+", color: "#fbbf24" },
                { label: "AI vs non-AI salary premium", val: "+56%", color: "#f87171" },
                { label: "Agentic AI job listing growth", val: "+985%", color: "#34d399" },
              ].map((stat, i) => (
                <div key={i} style={{ background: "#1e293b", borderRadius: 10, padding: 16, border: `1px solid ${stat.color}33` }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.val}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <h3 style={{ color: "#e2e8f0" }}>Roles &amp; Salaries (USA vs Europe)</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>{["Job Title", "USA (avg)", "USA (top 10%)", "Europe (mid)", "Remote?"].map((h, i) => <th key={i} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {[
                    ["AI Automation Specialist", "$76K", "$99K", "€45–65K", "✅ Lots"],
                    ["AI Automation Engineer", "$107K", "$142K", "€65–90K", "✅ Lots"],
                    ["AI & Automation Engineer (Glassdoor)", "$136K", "$204K", "€70–100K", "✅ Lots"],
                    ["AI Workflow Automation Specialist", "$95K", "$130K", "€60–85K", "✅ Lots"],
                    ["AI Agent Developer", "$120K", "$165K", "€75–110K", "✅ Lots"],
                    ["Generative AI Consultant", "$130K", "$180K", "€80–130K", "✅ Lots"],
                    ["AI Integration Specialist", "$100K", "$145K", "€65–95K", "✅ Lots"],
                  ].map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#0f1b2d" : "#0f172a" }}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ ...s.td, color: j === 0 ? "#e2e8f0" : j >= 3 ? "#4ade80" : "#93c5fd" }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ color: "#64748b", fontSize: 12, marginTop: 8 }}>
              * Sources: ZipRecruiter Mar 2026, Glassdoor May 2026, DigitalDefynd, Alcor, Qubit Labs
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: SKILLS
        ══════════════════════════════════════════════════════ */}
        {activeTab === "skills" && (
          <div>
            <h2 style={{ color: "#93c5fd", marginTop: 0 }}>🧠 Required Skills</h2>
            <p style={{ color: "#94a3b8" }}>Based on analysis of hundreds of real job listings from LinkedIn, Glassdoor, ZipRecruiter and specialist AI job boards</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {skillCats.map(cat => <button key={cat} onClick={() => setSkillFilter(cat)} style={s.btn(skillFilter === cat)}>{cat}</button>)}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>{["Skill", "Category", "Demand (10)", "In Job Ads", "Difficulty", "Hiring Impact"].map((h, i) => <th key={i} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filteredSkills.map((sk, i) => {
                    const catColors: Record<string, string> = { Technical: "#3b82f6", AI: "#8b5cf6", Automation: "#10b981", Business: "#f59e0b" };
                    const diffLabels = ["", "Very Easy", "Easy", "Easy-Med", "Medium", "Med-Hard", "Hard", "Very Hard", "Expert"];
                    return (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#0f1b2d" : "#0f172a" }}>
                        <td style={{ ...s.td, fontWeight: 500 }}>{sk.name}</td>
                        <td style={s.td}><span style={s.badge(catColors[sk.cat] || "#64748b")}>{sk.cat}</span></td>
                        <td style={s.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 60, height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ width: `${sk.demand * 10}%`, height: "100%", background: sk.demand >= 9 ? "#4ade80" : sk.demand >= 7 ? "#fbbf24" : "#f87171", borderRadius: 3 }} />
                            </div>
                            <span style={{ color: sk.demand >= 9 ? "#4ade80" : sk.demand >= 7 ? "#fbbf24" : "#f87171", fontWeight: 700 }}>{sk.demand}</span>
                          </div>
                        </td>
                        <td style={{ ...s.td, color: "#94a3b8" }}>{sk.freq}</td>
                        <td style={{ ...s.td, color: sk.diff <= 3 ? "#4ade80" : sk.diff <= 5 ? "#fbbf24" : "#f87171" }}>{diffLabels[sk.diff]}</td>
                        <td style={s.td}>{"★".repeat(Math.round(sk.hire / 2))}<span style={{ color: "#64748b", fontSize: 12 }}> ({sk.hire}/10)</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: ROADMAP (with Flexible Timeline)
        ══════════════════════════════════════════════════════ */}
        {activeTab === "roadmap" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
              <h2 style={{ color: "#93c5fd", margin: 0 }}>🗺️ Learning Roadmap</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowTimelineEditor(!showTimelineEditor)} style={{ ...s.btn(showTimelineEditor, "#7c3aed"), fontSize: 12 }}>
                  ⏱️ {showTimelineEditor ? "Hide" : "Edit"} Timeline
                </button>
                <button onClick={resetTimeline} style={{ ...s.btn(false), fontSize: 12, color: "#f87171", borderColor: "#f8717144" }}>
                  ↺ Reset
                </button>
              </div>
            </div>
            <p style={{ color: "#94a3b8", marginTop: 4 }}>From zero to job-ready — realistic based on your profile</p>

            {/* Timeline Summary */}
            <div style={{ ...s.card, border: "1px solid #7c3aed44", marginBottom: 20 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>START DATE</div>
                  <input
                    type="date"
                    value={timeline.startDate.toISOString().split("T")[0]}
                    onChange={e => setTimeline(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                    style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "6px 10px", color: "#e2e8f0", fontSize: 13 }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>ESTIMATED COMPLETION</div>
                  <div style={{ color: "#4ade80", fontWeight: 700, fontSize: 15 }}>{formatDate(estimatedEnd)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>TOTAL DURATION</div>
                  <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: 15 }}>{totalWeeks} weeks</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>PROGRESS</div>
                  <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 15 }}>{completedCount}/{roadmapPhases.length} phases</div>
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ height: 8, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${(completedCount / roadmapPhases.length) * 100}%`, height: "100%", background: "linear-gradient(90deg,#7c3aed,#3b82f6)", borderRadius: 4, transition: "width 0.4s" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{Math.round((completedCount / roadmapPhases.length) * 100)}% complete</div>
                </div>
              </div>
            </div>

            {/* Phase Cards */}
            {roadmapPhases.map((phase, i) => {
              const phaseStart = getPhaseStart(i);
              const phaseEnd = getPhaseEnd(i);
              const isCompleted = timeline.completedPhases[i];
              const totalPhaseWeeks = phase.weeks + timeline.phaseOffsets[i];

              return (
                <div key={i} style={{ ...s.card, border: `1px solid ${isCompleted ? "#4ade8044" : phase.color + "44"}`, opacity: isCompleted ? 0.75 : 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                    <div style={{ background: isCompleted ? "#4ade80" : phase.color, borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#fff", flexShrink: 0 }}>
                      {isCompleted ? "✓" : phase.phase}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <h3 style={{ margin: 0, color: "#e2e8f0" }}>Phase {phase.phase}: {phase.title}</h3>
                        {timeline.phaseOffsets[i] > 0 && <span style={s.badge("#f59e0b")}>+{timeline.phaseOffsets[i]}w extended</span>}
                        {timeline.phaseOffsets[i] < 0 && <span style={s.badge("#10b981")}>{timeline.phaseOffsets[i]}w compressed</span>}
                      </div>
                      <div style={{ display: "flex", gap: 16, marginTop: 4, flexWrap: "wrap" }}>
                        <span style={{ color: phase.color, fontSize: 13 }}>⏱️ {totalPhaseWeeks} weeks</span>
                        <span style={{ color: "#64748b", fontSize: 13 }}>📅 {formatDate(phaseStart)} → {formatDate(phaseEnd)}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => toggleComplete(i)} style={{ ...s.btn(isCompleted, "#4ade80"), fontSize: 12, padding: "4px 10px" }}>
                        {isCompleted ? "✓ Done" : "Mark Done"}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>TOPICS</div>
                      {phase.topics.map((t, j) => <div key={j} style={{ color: "#cbd5e1", fontSize: 13, padding: "2px 0", display: "flex", gap: 6 }}><span style={{ color: phase.color }}>▸</span>{t}</div>)}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>FREE RESOURCES</div>
                      {phase.free.map((t, j) => <div key={j} style={{ color: "#4ade80", fontSize: 13, padding: "2px 0" }}>✓ {t}</div>)}
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 8, marginBottom: 6, fontWeight: 600 }}>PAID RESOURCES</div>
                      {phase.paid.map((t, j) => <div key={j} style={{ color: "#fbbf24", fontSize: 13, padding: "2px 0" }}>💲 {t}</div>)}
                    </div>
                  </div>

                  <div style={{ marginTop: 12, background: "#0f172a", borderRadius: 8, padding: 12, border: `1px solid ${phase.color}33` }}>
                    <span style={{ fontSize: 12, color: phase.color, fontWeight: 600 }}>🔨 Practical Exercise: </span>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>{phase.exercise}</span>
                  </div>

                  {/* Timeline Controls */}
                  {showTimelineEditor && !isCompleted && (
                    <div style={{ marginTop: 12, padding: 12, background: "#0f172a", borderRadius: 8, border: "1px solid #7c3aed33", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>⏱️ Adjust timeline:</span>
                      <button onClick={() => postponePhase(i, 1)} style={{ ...s.btn(false), fontSize: 12, padding: "4px 10px", color: "#fbbf24", borderColor: "#fbbf2444" }}>+1 week</button>
                      <button onClick={() => postponePhase(i, 2)} style={{ ...s.btn(false), fontSize: 12, padding: "4px 10px", color: "#fbbf24", borderColor: "#fbbf2444" }}>+2 weeks</button>
                      <button onClick={() => compressPhase(i)} style={{ ...s.btn(false), fontSize: 12, padding: "4px 10px", color: "#4ade80", borderColor: "#4ade8044" }}>− Compress</button>
                      {timeline.phaseOffsets[i] !== 0 && (
                        <button onClick={() => setTimeline(prev => { const o = [...prev.phaseOffsets]; o[i] = 0; return { ...prev, phaseOffsets: o }; })} style={{ ...s.btn(false), fontSize: 12, padding: "4px 10px", color: "#94a3b8" }}>Reset phase</button>
                      )}
                      <span style={{ fontSize: 12, color: "#64748b" }}>Current: {totalPhaseWeeks} weeks (default: {phase.weeks})</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: CERTIFICATIONS
        ══════════════════════════════════════════════════════ */}
        {activeTab === "certs" && (
          <div>
            <h2 style={{ color: "#93c5fd", marginTop: 0 }}>🎓 Certification Analysis</h2>
            <div style={{ ...s.card, border: "1px solid #f59e0b44" }}>
              <h3 style={{ color: "#fbbf24", marginTop: 0 }}>Straight answer on certifications</h3>
              <p style={{ color: "#cbd5e1", margin: 0, lineHeight: 1.8 }}>
                In the 2026 market: <strong style={{ color: "#4ade80" }}>Portfolio project &gt; Certification &gt; Degree</strong>.
                Certifications help pass ATS systems but aren&apos;t enough alone.
                Best combo: <strong style={{ color: "#93c5fd" }}>1 Microsoft/Google cert + 5 real projects on GitHub</strong>.
              </p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>{["Certification", "Hiring Value", "Cost", "Difficulty", "ROI", "Recommendation"].map((h, i) => <th key={i} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {certsData.map((c, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#0f1b2d" : "#0f172a" }}>
                      <td style={{ ...s.td, fontWeight: 500 }}>{c.name}</td>
                      <td style={{ ...s.td, color: c.value.includes("Very") ? "#4ade80" : c.value === "High" ? "#60a5fa" : c.value === "Medium" ? "#fbbf24" : "#f87171" }}>{c.value}</td>
                      <td style={{ ...s.td, color: "#94a3b8" }}>{c.cost}</td>
                      <td style={{ ...s.td, color: "#94a3b8" }}>{c.diff}</td>
                      <td style={{ ...s.td, color: c.roi.includes("Very") ? "#4ade80" : c.roi === "High" ? "#60a5fa" : c.roi === "Medium" ? "#fbbf24" : "#f87171" }}>{c.roi}</td>
                      <td style={s.td}>{c.rec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: PORTFOLIO
        ══════════════════════════════════════════════════════ */}
        {activeTab === "portfolio" && (
          <div>
            <h2 style={{ color: "#93c5fd", marginTop: 0 }}>💼 Portfolio Analysis</h2>
            <h3 style={{ color: "#e2e8f0" }}>Top 10 Projects (ranked by hiring appeal)</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>{["#", "Project", "Difficulty", "Tech Stack", "Time", "Score"].map((h, i) => <th key={i} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {portfolioProjects.map((p, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#0f1b2d" : "#0f172a" }}>
                      <td style={{ ...s.td, color: p.rank <= 5 ? "#4ade80" : "#94a3b8", fontWeight: 700 }}>{p.rank}</td>
                      <td style={s.td}>{p.name}</td>
                      <td style={{ ...s.td, color: p.diff === "Easy" ? "#4ade80" : p.diff === "Medium" ? "#fbbf24" : "#f87171", fontSize: 12 }}>{p.diff}</td>
                      <td style={{ ...s.td, color: "#64748b", fontSize: 12 }}>{p.tech}</td>
                      <td style={{ ...s.td, color: "#94a3b8", fontSize: 12 }}>{p.time}</td>
                      <td style={s.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 40, height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${p.score * 10}%`, height: "100%", background: p.score >= 9 ? "#4ade80" : "#fbbf24" }} />
                          </div>
                          <span style={{ color: p.score >= 9 ? "#4ade80" : "#fbbf24", fontWeight: 700 }}>{p.score}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: COUNTRIES
        ══════════════════════════════════════════════════════ */}
        {activeTab === "countries" && (
          <div>
            <h2 style={{ color: "#93c5fd", marginTop: 0 }}>🌍 Best Countries for AI Automation</h2>
            {countriesData.map((c, i) => (
              <div key={i} style={{ ...s.card, border: i === 0 ? "1px solid #4ade8044" : i === 1 ? "1px solid #60a5fa44" : i === 2 ? "1px solid #a78bfa44" : "1px solid #334155", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                <div style={{ background: [" #4ade80", "#60a5fa", "#a78bfa", "#fbbf24", "#f87171", "#34d399", "#818cf8", "#fb923c"][i] || "#334155", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#fff", flexShrink: 0 }}>
                  {c.rank}
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <h3 style={{ margin: "0 0 4px", color: "#e2e8f0", fontSize: 15 }}>{c.country}</h3>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>{c.note}</p>
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  {[{ label: "Salary", val: c.salary, color: "#4ade80" }, { label: "Demand", val: c.vacancies, color: "#60a5fa" }, { label: "Visa", val: c.visa, color: "#a78bfa" }, { label: "English", val: c.english, color: "#fbbf24" }, { label: "Remote", val: c.remote, color: "#34d399" }].map((item, j) => (
                    <div key={j} style={{ textAlign: "center", minWidth: 60 }}>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: item.color, fontWeight: 600 }}>{item.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: GAP ANALYSIS
        ══════════════════════════════════════════════════════ */}
        {activeTab === "gap" && (
          <div>
            <h2 style={{ color: "#93c5fd", marginTop: 0 }}>🔍 Skill Gap Analysis</h2>
            <div style={s.card}>
              <h3 style={{ color: "#e2e8f0", marginTop: 0 }}>Sample Profile</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["10+ years Marketing & Advertising", "Digital Marketing", "HTML/CSS/JavaScript", "Microsoft Power Apps", "Microsoft Ecosystem", "Process Improvement (IKEA)", "Hands-on operational experience", "EU Resident"].map((t, i) => (
                  <span key={i} style={s.pill("#3b82f6")}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ ...s.card, border: "1px solid #4ade8044" }}>
                <h3 style={{ color: "#4ade80", marginTop: 0 }}>💪 Strengths</h3>
                <ul style={{ color: "#cbd5e1", lineHeight: 2, paddingLeft: 16, margin: 0 }}>
                  <li><strong style={{ color: "#4ade80" }}>Power Apps/Automate:</strong> Directly maps to Microsoft automation stack</li>
                  <li><strong style={{ color: "#4ade80" }}>HTML/CSS/JS:</strong> Can make API calls, build simple UIs, understand webhooks</li>
                  <li><strong style={{ color: "#4ade80" }}>Marketing background:</strong> Domain expertise for CRM, lead automation</li>
                  <li><strong style={{ color: "#4ade80" }}>IKEA Operations:</strong> Real-world business process understanding</li>
                  <li><strong style={{ color: "#4ade80" }}>EU resident:</strong> Can legally work across the EU</li>
                </ul>
              </div>
              <div style={{ ...s.card, border: "1px solid #f8717144" }}>
                <h3 style={{ color: "#f87171", marginTop: 0 }}>⚠️ Key Gaps</h3>
                <ul style={{ color: "#cbd5e1", lineHeight: 2, paddingLeft: 16, margin: 0 }}>
                  <li><strong style={{ color: "#f87171" }}>Python:</strong> 2–3 months to learn (JS helps, faster curve)</li>
                  <li><strong style={{ color: "#f87171" }}>n8n / Make.com:</strong> No hands-on production experience yet</li>
                  <li><strong style={{ color: "#f87171" }}>LLM APIs:</strong> No practical integration with OpenAI/Claude</li>
                  <li><strong style={{ color: "#f87171" }}>RAG &amp; AI Agents:</strong> Know the concepts but no real project</li>
                  <li><strong style={{ color: "#f87171" }}>Portfolio:</strong> No AI Automation projects to show yet</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: STRATEGY
        ══════════════════════════════════════════════════════ */}
        {activeTab === "strategy" && (
          <div>
            <h2 style={{ color: "#93c5fd", marginTop: 0 }}>🚀 Final Strategy</h2>
            <div style={{ ...s.card, background: "linear-gradient(135deg, #1e3a5f, #0f172a)", border: "1px solid #2563eb" }}>
              <h3 style={{ color: "#fbbf24", marginTop: 0 }}>📅 Precise 6-Month Plan</h3>
              {[
                { month: "Month 1", title: "Fast Foundation", color: "#3b82f6", tasks: ["Make Academy: all 3 tracks (Foundation → Intermediate) — 2–3h daily", "Python: Automate the Boring Stuff (free) — Chapters 1–8", "Explore Power Automate AI Builder nodes", "Open n8n cloud account and build 3 simple workflows", "First project: email notification automation for a real business"] },
                { month: "Month 2", title: "Build First Showcase Projects", color: "#8b5cf6", tasks: ["Go deeper with n8n: webhooks, Function nodes, error handling", "Claude API + n8n: first AI workflow — Customer Support Bot", "Invoice Processing Pipeline (n8n + Claude Vision + Google Sheets)", "GitHub: every project with README and Teardown document", "First income: find one small client (Upwork, LinkedIn, friends)"] },
                { month: "Month 3", title: "Deeper AI", color: "#10b981", tasks: ["DeepLearning.AI: Prompt Engineering for Developers (free)", "Build RAG pipeline with LangChain + Pinecone", "Project: Knowledge Base Q&A from PDF documents", "Microsoft Power Automate + Copilot integration", "Upwork profile optimization — 2–3 freelance clients"] },
                { month: "Month 4", title: "AI Agents & Complex Projects", color: "#f59e0b", tasks: ["LangGraph / CrewAI: Multi-agent research system", "Lead Qualification Agent for a marketing agency", "Azure AI-900: start studying — Microsoft Learn (free)", "Project: Automated weekly report generator", "Networking: LinkedIn posts about your projects"] },
                { month: "Month 5", title: "Certification & Market Prep", color: "#ef4444", tasks: ["Take Azure AI-900 exam — $165 well spent", "Polish portfolio GitHub: README, Loom demos, screenshots", "LinkedIn: keyword optimization, 30 recruiter connections", "First job applications: 5–10 remote listings weekly", "Interview prep: STAR method for AI Automation scenarios"] },
                { month: "Month 6", title: "Active Job Search", color: "#22d3ee", tasks: ["Apply to 5 jobs daily — target Engineer not Specialist", "Upwork: 3–5 active clients for negotiation leverage", "LinkedIn outreach: direct to hiring managers", "Salary negotiation: start with Engineer title", "Target: 1 job offer from Netherlands/Ireland/Germany (remote OK)"] },
              ].map((m, i) => (
                <div key={i} style={{ marginBottom: 14, background: "#0f172a", borderRadius: 10, padding: 16, border: `1px solid ${m.color}33` }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                    <div style={{ background: m.color, borderRadius: 8, padding: "4px 12px", fontWeight: 700, fontSize: 13, color: "#fff", flexShrink: 0 }}>{m.month}</div>
                    <h4 style={{ margin: 0, color: m.color, fontSize: 14 }}>{m.title}</h4>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 20, color: "#cbd5e1", lineHeight: 1.8, fontSize: 14 }}>
                    {m.tasks.map((t, j) => <li key={j}>{t}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: CV ANALYZER
        ══════════════════════════════════════════════════════ */}
        {activeTab === "cv" && (
          <div>
            <h2 style={{ color: "#93c5fd", marginTop: 0 }}>📄 CV Analyzer</h2>
            <p style={{ color: "#94a3b8" }}>
              Paste your CV text or upload a <strong>.txt</strong> file. The analyzer will detect your skills, identify gaps, and generate a personalized strategy and timeline.
            </p>

            <div style={s.card}>
              <h3 style={{ color: "#e2e8f0", marginTop: 0 }}>Step 1 — Paste or Upload Your CV</h3>

              <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <button onClick={() => fileInputRef.current?.click()} style={{ ...s.btn(false, "#7c3aed"), color: "#a78bfa", borderColor: "#7c3aed44" }}>
                  📁 Upload .txt file
                </button>
                <input ref={fileInputRef} type="file" accept=".txt,.md" onChange={handleFileUpload} style={{ display: "none" }} />
                <button onClick={() => { setCvText(""); setCvAnalysis(null); }} style={{ ...s.btn(false), color: "#f87171", borderColor: "#f8717144", fontSize: 12 }}>
                  ✕ Clear
                </button>
              </div>

              <textarea
                value={cvText}
                onChange={e => setCvText(e.target.value)}
                placeholder={"Paste your CV / resume text here...\n\nExample:\nJohn Smith — AI Engineer\nSkills: Python, n8n, LangChain, OpenAI API, Make.com, SQL\nExperience: 5 years software development, 2 years automation\nEducation: BSc Computer Science\n..."}
                style={{
                  width: "100%", minHeight: 200, background: "#0f172a", border: "1px solid #334155",
                  borderRadius: 10, padding: 14, color: "#e2e8f0", fontSize: 13, lineHeight: 1.6,
                  resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                }}
              />

              <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  onClick={runCVAnalysis}
                  disabled={!cvText.trim() || cvLoading}
                  style={{
                    background: cvText.trim() ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "#1e293b",
                    border: "none", borderRadius: 10, padding: "10px 24px", color: cvText.trim() ? "#fff" : "#64748b",
                    fontSize: 14, fontWeight: 700, cursor: cvText.trim() ? "pointer" : "not-allowed", transition: "all 0.2s",
                  }}
                >
                  {cvLoading ? "⏳ Analyzing..." : "🔍 Analyze My CV"}
                </button>
                {cvText.trim() && <span style={{ fontSize: 12, color: "#64748b" }}>{cvText.split(/\s+/).length} words detected</span>}
              </div>
            </div>

            {/* ── ANALYSIS RESULTS ── */}
            {cvAnalysis && (
              <div>
                {/* Score */}
                <div style={{ ...s.card, border: "1px solid #7c3aed44", textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>AI AUTOMATION READINESS SCORE</div>
                  <div style={{ fontSize: 64, fontWeight: 900, color: cvAnalysis.score >= 70 ? "#4ade80" : cvAnalysis.score >= 40 ? "#fbbf24" : "#f87171", lineHeight: 1 }}>
                    {cvAnalysis.score}
                    <span style={{ fontSize: 24, color: "#64748b" }}>/100</span>
                  </div>
                  <div style={{ margin: "12px auto 0", maxWidth: 300, height: 10, background: "#1e293b", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ width: `${cvAnalysis.score}%`, height: "100%", background: cvAnalysis.score >= 70 ? "#4ade80" : cvAnalysis.score >= 40 ? "#fbbf24" : "#f87171", borderRadius: 5, transition: "width 0.8s" }} />
                  </div>
                  <div style={{ marginTop: 8, fontSize: 14, color: "#94a3b8" }}>
                    {cvAnalysis.score >= 70 ? "🚀 Strong foundation — focus on portfolio projects" : cvAnalysis.score >= 40 ? "📈 Good base — fill key gaps and build projects" : "🌱 Early stage — follow the full roadmap"}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  {/* Strengths */}
                  <div style={{ ...s.card, border: "1px solid #4ade8044" }}>
                    <h3 style={{ color: "#4ade80", marginTop: 0 }}>💪 Your Strengths</h3>
                    {cvAnalysis.strengths.map((str, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>
                        <span style={{ color: "#4ade80", flexShrink: 0 }}>✓</span> {str}
                      </div>
                    ))}
                    {cvAnalysis.topSkills.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>DETECTED SKILLS</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {cvAnalysis.topSkills.map((sk, i) => <span key={i} style={s.badge("#4ade80")}>{sk}</span>)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gaps */}
                  <div style={{ ...s.card, border: "1px solid #f8717144" }}>
                    <h3 style={{ color: "#f87171", marginTop: 0 }}>⚠️ Skill Gaps</h3>
                    {cvAnalysis.gaps.map((gap, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>
                        <span style={{ color: "#f87171", flexShrink: 0 }}>✗</span> {gap}
                      </div>
                    ))}
                    {cvAnalysis.missingSkills.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>MISSING CORE SKILLS</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {cvAnalysis.missingSkills.map((sk, i) => <span key={i} style={s.badge("#f87171")}>{sk}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Personalized Strategy */}
                <div style={{ ...s.card, border: "1px solid #fbbf2444" }}>
                  <h3 style={{ color: "#fbbf24", marginTop: 0 }}>🎯 Your Personalized Strategy</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
                    <div style={{ background: "#0f172a", borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>RECOMMENDED PATH</div>
                      <div style={{ fontSize: 13, color: "#93c5fd", lineHeight: 1.5 }}>{cvAnalysis.recommendedPath}</div>
                    </div>
                    <div style={{ background: "#0f172a", borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>TIME TO FIRST JOB OFFER</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#4ade80" }}>{cvAnalysis.timeEstimate}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>PRIORITY ACTIONS (do these first):</div>
                  {cvAnalysis.priorityActions.map((action, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, background: "#0f172a", borderRadius: 8, padding: 12, fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>
                      <span style={{ background: "#fbbf24", color: "#0f172a", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, flexShrink: 0 }}>{i + 1}</span>
                      {action}
                    </div>
                  ))}
                </div>

                {/* CTA to roadmap tab */}
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <button onClick={() => setActiveTab("roadmap")} style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", border: "none", borderRadius: 12, padding: "12px 32px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                    View Your Personalized Roadmap →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      <div style={{ textAlign: "center", padding: "16px", color: "#334155", fontSize: 11, borderTop: "1px solid #1e293b" }}>
        Sources: ZipRecruiter, Glassdoor, Second Talent, AINative.careers, DigitalDefynd, Alcor, Qubit Labs, Microsoft Learn | Data: June 2026
      </div>
    </div>
  );
}
