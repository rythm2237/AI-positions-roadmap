"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { careerPositions } from "@/data/careerRoadmaps";
import type {
  AnalyzerTabId,
  CareerPosition,
  CertificationInsight,
  CountryInsight,
  GapItem,
  LearningStep,
  PortfolioProjectInsight,
  SkillInsight,
  StrategyStage,
} from "@/types/career";

interface TimelineState {
  hoursPerWeek: number;
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

const TABS: { id: AnalyzerTabId; label: string }[] = [
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

const KEY_SKILLS = [
  "python", "javascript", "typescript", "sql", "git", "docker", "api", "webhook",
  "prompt engineering", "llm", "openai", "claude", "gemini", "langchain", "rag",
  "vector", "pinecone", "n8n", "make.com", "zapier", "power automate", "automation",
  "ai agent", "crewai", "langgraph", "process mapping", "stakeholder", "documentation",
  "requirements", "roi", "crm", "data analysis", "machine learning", "deep learning",
  "tensorflow", "pytorch", "aws", "azure", "gcp", "cloud", "kubernetes", "react",
  "node", "fastapi", "flask", "django", "mongodb", "postgresql",
];

const STRONG_SKILLS = ["n8n", "make.com", "langchain", "openai", "claude", "python", "prompt engineering", "rag", "ai agent"];
const NICE_SKILLS = ["javascript", "typescript", "sql", "git", "power automate", "zapier", "docker", "azure", "aws"];

function analyzeCV(text: string, role: CareerPosition): CVAnalysis {
  const lower = text.toLowerCase();
  const found = KEY_SKILLS.filter((s) => lower.includes(s));
  const strong = STRONG_SKILLS.filter((s) => lower.includes(s));
  const missing = STRONG_SKILLS.filter((s) => !lower.includes(s));
  const niceFound = NICE_SKILLS.filter((s) => lower.includes(s));

  const score = Math.min(
    100,
    Math.round((strong.length / STRONG_SKILLS.length) * 60 + (niceFound.length / NICE_SKILLS.length) * 40)
  );

  const hasMarketing = /marketing|campaign|seo|social media|content|brand/i.test(text);
  const hasOps = /operations|process|workflow|efficiency|improvement|lean|agile/i.test(text);
  const hasTech = /developer|engineer|software|programming|code|api|database/i.test(text);
  const hasManagement = /manager|director|lead|head of|senior|team/i.test(text);

  const strengths: string[] = [];
  const gaps: string[] = [];
  const priorityActions: string[] = [];

  if (strong.length > 0) strengths.push(`Core AI-related skills detected: ${strong.join(", ")}`);
  if (hasMarketing) strengths.push("Marketing background can translate well into AI workflows and campaign systems.");
  if (hasOps) strengths.push("Operations experience helps with process design and automation thinking.");
  if (hasTech) strengths.push("Technical background reduces ramp-up time for APIs and integrations.");
  if (hasManagement) strengths.push("Leadership experience supports stakeholder management and ROI framing.");
  if (niceFound.length > 0) strengths.push(`Supporting skills found: ${niceFound.join(", ")}`);
  if (strengths.length === 0) strengths.push("General professional experience gives you a base to build targeted AI skills.");

  role.analyzerContent.gaps.slice(0, 4).forEach((item) => {
    gaps.push(`${item.skill} — ${item.urgency.toLowerCase()} priority for ${role.title.toLowerCase()} roles.`);
  });

  role.analyzerContent.learningSteps.slice(0, 3).forEach((step) => {
    priorityActions.push(step.text);
  });

  if (missing.includes("python") && !priorityActions.some((a) => a.toLowerCase().includes("python"))) {
    priorityActions.push("Add basic Python so you can move beyond tool-only workflows.");
  }

  const timeEstimate =
    score >= 70 ? "2–3 months to become competitive" : score >= 40 ? "4–5 months to become competitive" : "5–7 months to become competitive";

  const recommendedPath =
    score >= 60
      ? `Fast-track: focus on projects and role positioning for ${role.title}.`
      : score >= 30
      ? `Standard path: close the biggest gaps while building proof-of-work for ${role.title}.`
      : `Foundation path: start with role basics, tools, and one portfolio-ready project.`;

  return {
    strengths,
    gaps,
    score,
    topSkills: found.slice(0, 8),
    missingSkills: missing,
    recommendedPath,
    timeEstimate,
    priorityActions,
  };
}

function hoursToWeeks(hours: number, hoursPerWeek: number): number {
  return Math.ceil(hours / hoursPerWeek);
}

function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

type BadgeVariant = "default" | "blue" | "green" | "purple" | "amber" | "red" | "indigo";

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: BadgeVariant }) {
  const cls: Record<BadgeVariant, string> = {
    default: "bg-gray-100 text-gray-600 border border-gray-200",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    purple: "bg-purple-50 text-purple-700 border border-purple-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
    red: "bg-red-50 text-red-700 border border-red-200",
    indigo: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  };

  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls[variant]}`}>{children}</span>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

function DemandBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500">{value}/{max}</span>
    </div>
  );
}

function StatCard({ value, label, colorClass }: { value: string; label: string; colorClass: string }) {
  return (
    <Card className="text-center">
      <div className={`text-2xl font-extrabold ${colorClass}`}>{value}</div>
      <div className="mt-1 text-xs leading-snug text-gray-500">{label}</div>
    </Card>
  );
}

function StrategyColumn({ stage }: { stage: StrategyStage }) {
  const toneStyles = {
    blue: { border: "border-blue-200", text: "text-blue-700", bg: "bg-blue-50" },
    purple: { border: "border-purple-200", text: "text-purple-700", bg: "bg-purple-50" },
    green: { border: "border-emerald-200", text: "text-emerald-700", bg: "bg-emerald-50" },
  }[stage.tone];

  return (
    <div className={`rounded-2xl border p-5 ${toneStyles.border} ${toneStyles.bg}`}>
      <h3 className={`mb-3 text-sm font-bold ${toneStyles.text}`}>{stage.title}</h3>
      <ul className="space-y-2">
        {stage.items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-gray-700">
            <span className={`mt-0.5 font-bold ${toneStyles.text}`}>→</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CareerDashboard() {
  const [activeTab, setActiveTab] = useState<AnalyzerTabId>("market");
  const [activePosition, setActivePosition] = useState(careerPositions[0]?.id ?? "ai-automation-specialist");
  const [skillFilter, setSkillFilter] = useState("All");
  const [cvText, setCvText] = useState("");
  const [cvAnalysis, setCvAnalysis] = useState<CVAnalysis | null>(null);
  const [cvLoading, setCvLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeRole = useMemo(
    () => careerPositions.find((position) => position.id === activePosition) ?? careerPositions[0],
    [activePosition]
  );

  const [timeline, setTimeline] = useState<TimelineState>({
    hoursPerWeek: 10,
    phaseOffsets: activeRole.analyzerContent.roadmapPhases.map(() => 0),
    completedPhases: activeRole.analyzerContent.roadmapPhases.map(() => false),
  });
  const [showTimelineEditor, setShowTimelineEditor] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());

  const skillCats = ["All", "Technical", "AI", "Automation", "Business"];

  const filteredSkills =
    skillFilter === "All"
      ? activeRole.analyzerContent.skills
      : activeRole.analyzerContent.skills.filter((skill) => skill.category === skillFilter);

  const roadmapPhases = activeRole.analyzerContent.roadmapPhases;
  const isAvailable = activeRole.status === "available";
  const roadmapHref = `/roadmaps/${activeRole.id}`;

  const resetRoleTimeline = useCallback((role: CareerPosition) => {
    setTimeline({
      hoursPerWeek: 10,
      phaseOffsets: role.analyzerContent.roadmapPhases.map(() => 0),
      completedPhases: role.analyzerContent.roadmapPhases.map(() => false),
    });
    setShowTimelineEditor(false);
    setStartDate(new Date());
  }, []);

  const handleRoleChange = useCallback(
    (roleId: string) => {
      const nextRole = careerPositions.find((position) => position.id === roleId);
      if (!nextRole) return;
      setActivePosition(roleId);
      setSkillFilter("All");
      setCvAnalysis(null);
      resetRoleTimeline(nextRole);
    },
    [resetRoleTimeline]
  );

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCvText((ev.target?.result as string) || "");
    reader.readAsText(file);
  }, []);

  const runCVAnalysis = useCallback(() => {
    if (!cvText.trim()) return;
    setCvLoading(true);
    setTimeout(() => {
      setCvAnalysis(analyzeCV(cvText, activeRole));
      setCvLoading(false);
    }, 1000);
  }, [cvText, activeRole]);

  function getPhaseHours(phaseIndex: number): number {
    return roadmapPhases[phaseIndex].hours + timeline.phaseOffsets[phaseIndex];
  }

  function getPhaseStart(phaseIndex: number): Date {
    let totalHours = 0;
    for (let i = 0; i < phaseIndex; i += 1) totalHours += getPhaseHours(i);
    return addWeeks(startDate, hoursToWeeks(totalHours, timeline.hoursPerWeek));
  }

  function getPhaseEnd(phaseIndex: number): Date {
    return addWeeks(getPhaseStart(phaseIndex), hoursToWeeks(getPhaseHours(phaseIndex), timeline.hoursPerWeek));
  }

  function adjustPhase(phaseIndex: number, extraHours: number) {
    setTimeline((prev) => {
      const offsets = [...prev.phaseOffsets];
      offsets[phaseIndex] = Math.max(-Math.floor(roadmapPhases[phaseIndex].hours * 0.3), offsets[phaseIndex] + extraHours);
      return { ...prev, phaseOffsets: offsets };
    });
  }

  function toggleComplete(phaseIndex: number) {
    setTimeline((prev) => {
      const completed = [...prev.completedPhases];
      completed[phaseIndex] = !completed[phaseIndex];
      return { ...prev, completedPhases: completed };
    });
  }

  function resetTimeline() {
    resetRoleTimeline(activeRole);
  }

  const totalHours = roadmapPhases.reduce((sum, phase, index) => sum + phase.hours + timeline.phaseOffsets[index], 0);
  const totalWeeks = hoursToWeeks(totalHours, timeline.hoursPerWeek);
  const estimatedEnd = addWeeks(startDate, totalWeeks);
  const completedCount = timeline.completedPhases.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <section className="border-b border-gray-100 bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <nav className="mb-5 flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="font-medium transition-colors hover:text-indigo-600">Home</Link>
            <span aria-hidden="true">›</span>
            <Link href="/#roadmaps" className="font-medium transition-colors hover:text-indigo-600">Roadmaps</Link>
            <span aria-hidden="true">›</span>
            <span className="font-medium text-gray-700">Career Analyzer</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <span className="mb-3 inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-700">
                Same platform, smarter role selection
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                🤖 AI Career Analyzer
              </h1>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                Explore each roadmap with the same visual language as the main site, compare roles, and jump directly into the matching roadmap, pricing, or waitlist flow.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
                  Role-based guidance
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  Connected to all roadmaps
                </span>
              </div>
            </div>

            <div className="grid min-w-[280px] gap-3 sm:grid-cols-2">
              <Link href={roadmapHref} className="rounded-xl bg-indigo-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700">
                {isAvailable ? "Open live roadmap" : "Preview roadmap"}
              </Link>
              <Link href="/#roadmaps" className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
                Browse all paths
              </Link>
              <Link href="/#pricing" className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
                See pricing
              </Link>
              <Link href="/#waitlist" className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
                Join waitlist
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Choose a role from the main roadmap system</p>
              <h2 className="text-lg font-bold text-gray-900">Career paths connected to the first page</h2>
            </div>
            <Link href="/#roadmaps" className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-800">
              View homepage cards →
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {careerPositions.map((position) => (
              <button
                key={position.id}
                onClick={() => handleRoleChange(position.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                  activePosition === position.id
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                    : "border-gray-300 bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
                }`}
              >
                {position.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-white px-4 py-5 shadow-sm">
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
          <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge variant="indigo">{activeRole.category}</Badge>
                  <Badge variant={isAvailable ? "green" : "amber"}>{isAvailable ? "Available now" : "Coming soon"}</Badge>
                  <Badge variant="default">{activeRole.level}</Badge>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900">{activeRole.analyzerContent.heroLabel}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{activeRole.analyzerContent.heroDescription}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeRole.keySkills.map((skill) => (
                    <span key={skill} className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="min-w-[180px] rounded-2xl border border-gray-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">Roadmap status</div>
                <div className="mt-2 text-base font-bold text-gray-900">{isAvailable ? "Interactive roadmap live" : "Analyzer live, roadmap preview available"}</div>
                <div className="mt-1 text-xs text-gray-500">Duration: {activeRole.duration}</div>
                <div className="mt-3 flex flex-col gap-2">
                  <Link href={roadmapHref} className="rounded-xl bg-indigo-600 px-4 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-indigo-700">
                    {isAvailable ? "Go to roadmap" : "Preview roadmap"}
                  </Link>
                  <Link href="/#roadmaps" className="rounded-xl border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50">
                    Compare all roles
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <StatCard value={activeRole.duration} label="Learning path length" colorClass="text-indigo-600" />
            <StatCard value={activeRole.category} label="Role category" colorClass="text-purple-600" />
            <StatCard value={isAvailable ? "Live" : "Preview"} label="Roadmap access" colorClass="text-emerald-600" />
            <StatCard value={activeRole.keySkills.length.toString()} label="Core skill pillars" colorClass="text-amber-600" />
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl overflow-x-auto px-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-3 py-3.5 text-xs font-semibold transition-all ${
                activeTab === tab.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {activeTab === "market" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-gray-900">📊 Market insights for {activeRole.title}</h2>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="mb-2 text-sm font-bold text-amber-800">💡 {activeRole.analyzerContent.marketInsightTitle}</h3>
              <p className="text-sm leading-relaxed text-amber-900">{activeRole.analyzerContent.marketInsightBody}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {activeRole.analyzerContent.marketStats.map((stat) => (
                <StatCard key={stat.label} value={stat.value} label={stat.label} colorClass={stat.colorClass} />
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <h3 className="mb-3 text-sm font-bold text-gray-900">📌 Top job titles</h3>
                <div className="space-y-2">
                  {activeRole.analyzerContent.topJobTitles.map((job) => (
                    <div key={job.title} className="flex items-center justify-between gap-2 border-b border-gray-100 py-1.5 last:border-0">
                      <span className="text-xs font-medium text-gray-700">{job.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-emerald-700">{job.salary}</span>
                        <Badge variant={job.demand === "Very High" ? "green" : job.demand === "High" ? "blue" : "default"}>{job.demand}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h3 className="mb-3 text-sm font-bold text-gray-900">🏢 Likely hiring environments</h3>
                <div className="space-y-2">
                  {activeRole.analyzerContent.topHiringCompanies.map((company) => (
                    <div key={company.name} className="flex items-center justify-between gap-2 border-b border-gray-100 py-1.5 last:border-0">
                      <div>
                        <div className="text-xs font-medium text-gray-700">{company.name}</div>
                        <div className="text-xs text-gray-400">{company.type}</div>
                      </div>
                      <Badge variant="purple">{company.count}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
              <h3 className="mb-1 text-sm font-bold text-indigo-700">Connect this analysis to the main platform</h3>
              <p className="mb-4 text-xs text-indigo-600">This role matches a roadmap card on the homepage and can be explored in the roadmap system directly.</p>
              <div className="flex flex-wrap gap-3">
                <Link href={roadmapHref} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700">
                  Open matching roadmap →
                </Link>
                <Link href="/#roadmaps" className="inline-flex items-center gap-2 rounded-xl border border-indigo-300 bg-white px-4 py-2 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50">
                  See homepage roadmap cards
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-gray-900">🧠 Skills required for {activeRole.title}</h2>
            <p className="text-sm text-gray-500">Every skill shown here is specific to the selected menu context and role.</p>
            <div className="flex flex-wrap gap-2">
              {skillCats.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSkillFilter(cat)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                    skillFilter === cat ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300 bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {['Skill', 'Category', 'Demand', 'Job Freq.', 'Difficulty', 'Hire Impact'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredSkills.map((skill: SkillInsight) => (
                    <tr key={skill.name} className="transition-colors hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs font-medium text-gray-800">{skill.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant={skill.category === "AI" ? "purple" : skill.category === "Automation" ? "blue" : skill.category === "Technical" ? "green" : "amber"}>
                          {skill.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3"><DemandBar value={skill.demand} /></td>
                      <td className="px-4 py-3 text-xs font-semibold text-emerald-700">{skill.frequencyLabel}</td>
                      <td className="px-4 py-3"><DemandBar value={skill.difficulty} /></td>
                      <td className="px-4 py-3"><DemandBar value={skill.hireImpact} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "roadmap" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h2 className="text-xl font-extrabold text-gray-900">🗺️ Roadmap plan for {activeRole.title}</h2>
              <Link href={roadmapHref} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700">
                {isAvailable ? "Open full interactive roadmap →" : "Open roadmap preview →"}
              </Link>
            </div>

            <Card>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">⏱️ Personalise your timeline</h3>
                  <p className="mt-0.5 text-xs text-gray-500">Adjust the roadmap using the selected role’s own phase content.</p>
                </div>
                <button
                  onClick={() => setShowTimelineEditor((v) => !v)}
                  className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all hover:border-indigo-400 hover:text-indigo-600"
                >
                  {showTimelineEditor ? "Hide settings" : "Adjust timeline"}
                </button>
              </div>

              {showTimelineEditor && (
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Hours per week</label>
                      <div className="flex items-center gap-2">
                        {[5, 10, 15, 20, 30].map((h) => (
                          <button
                            key={h}
                            onClick={() => setTimeline((prev) => ({ ...prev, hoursPerWeek: h }))}
                            className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition-all ${
                              timeline.hoursPerWeek === h ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300 bg-white text-gray-600 hover:border-indigo-400"
                            }`}
                          >
                            {h}h
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Start date</label>
                      <input
                        type="date"
                        defaultValue={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                        className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button onClick={resetTimeline} className="mt-4 rounded-xl border border-gray-300 px-3 py-1.5 text-xs text-gray-500 transition-all hover:border-red-300 hover:text-red-600">
                      Reset
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 sm:grid-cols-4">
                <div className="text-center"><div className="text-lg font-extrabold text-gray-900">{totalHours}h</div><div className="text-xs text-gray-500">Total hours</div></div>
                <div className="text-center"><div className="text-lg font-extrabold text-indigo-600">{timeline.hoursPerWeek}h/wk</div><div className="text-xs text-gray-500">Your pace</div></div>
                <div className="text-center"><div className="text-lg font-extrabold text-purple-600">{totalWeeks} weeks</div><div className="text-xs text-gray-500">Estimated duration</div></div>
                <div className="text-center"><div className="text-lg font-extrabold text-emerald-600">{formatDate(estimatedEnd)}</div><div className="text-xs text-gray-500">Target finish</div></div>
              </div>

              {completedCount > 0 && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(completedCount / roadmapPhases.length) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-emerald-700">{completedCount}/{roadmapPhases.length} phases</span>
                  </div>
                </div>
              )}
            </Card>

            <div className="space-y-4">
              {roadmapPhases.map((phase, i) => {
                const phaseHours = getPhaseHours(i);
                const phaseWeeks = hoursToWeeks(phaseHours, timeline.hoursPerWeek);
                const isCompleted = timeline.completedPhases[i];
                return (
                  <Card key={phase.phase} className={isCompleted ? "border-emerald-200 bg-emerald-50/30" : ""}>
                    <div className="flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: isCompleted ? "#059669" : phase.color }}>
                        {isCompleted ? "✓" : phase.phase}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-gray-900">Phase {phase.phase}: {phase.title}</h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="blue">{phaseHours}h total</Badge>
                            <Badge variant="purple">{phaseWeeks} weeks @ {timeline.hoursPerWeek}h/wk</Badge>
                            <span className="text-xs text-gray-400">{formatDate(getPhaseStart(i))} → {formatDate(getPhaseEnd(i))}</span>
                          </div>
                        </div>
                        <div className="mb-3 grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="mb-1 text-xs font-semibold text-gray-500">Topics</p>
                            <ul className="space-y-0.5">
                              {phase.topics.map((topic) => <li key={topic} className="flex items-start gap-1.5 text-xs text-gray-700"><span className="mt-0.5 text-indigo-500">•</span>{topic}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-semibold text-gray-500">Free resources</p>
                            <ul className="space-y-0.5">
                              {phase.freeResources.map((resource) => <li key={resource} className="flex items-start gap-1.5 text-xs text-emerald-700"><span className="mt-0.5">✓</span>{resource}</li>)}
                            </ul>
                          </div>
                        </div>
                        <div className="mb-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-gray-700"><span className="font-semibold text-amber-700">Exercise: </span>{phase.exercise}</div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => toggleComplete(i)}
                            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                              isCompleted ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-300 bg-white text-gray-600 hover:border-emerald-400 hover:text-emerald-600"
                            }`}
                          >
                            {isCompleted ? "✓ Completed" : "Mark complete"}
                          </button>
                          {showTimelineEditor && (
                            <>
                              <button onClick={() => adjustPhase(i, -8)} className="rounded-xl border border-gray-300 px-2 py-1 text-xs text-gray-500 transition-all hover:border-blue-400 hover:text-blue-600">−8h</button>
                              <button onClick={() => adjustPhase(i, 8)} className="rounded-xl border border-gray-300 px-2 py-1 text-xs text-gray-500 transition-all hover:border-amber-400 hover:text-amber-600">+8h</button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "certs" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-gray-900">🎓 Certifications for {activeRole.title}</h2>
            <p className="text-sm text-gray-500">This menu contains the certification options most useful for the selected role.</p>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {["Certification", "Value", "Cost", "Difficulty", "ROI", "Recommendation"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {activeRole.analyzerContent.certifications.map((cert: CertificationInsight) => (
                    <tr key={cert.name} className="transition-colors hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs font-medium text-gray-800">{cert.name}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{cert.value}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-emerald-700">{cert.cost}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{cert.difficulty}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{cert.roi}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{cert.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-gray-900">💼 Portfolio ideas for {activeRole.title}</h2>
            <p className="text-sm text-gray-500">Each project here is tied to the selected role, so the content changes with the menu context.</p>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {["#", "Project", "Difficulty", "Tech Stack", "Time", "Score"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {activeRole.analyzerContent.portfolioProjects.map((project: PortfolioProjectInsight) => (
                    <tr key={project.rank} className="transition-colors hover:bg-gray-50">
                      <td className="px-4 py-3"><span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${project.rank <= 3 ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-600"}`}>{project.rank}</span></td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-800">{project.name}</td>
                      <td className="px-4 py-3"><Badge variant={project.difficulty.includes("High") ? "red" : project.difficulty.includes("Easy") ? "green" : "blue"}>{project.difficulty}</Badge></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{project.techStack}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-purple-700">{project.timeEstimate}</td>
                      <td className="px-4 py-3"><span className="text-xs font-bold text-amber-600">{project.hiringScore}/10</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "countries" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-gray-900">🌍 Best countries for {activeRole.title}</h2>
            <div className="space-y-4">
              {activeRole.analyzerContent.countries.map((country: CountryInsight, i) => (
                <Card key={country.country} className={i === 0 ? "border-emerald-200" : i === 1 ? "border-blue-200" : i === 2 ? "border-purple-200" : ""}>
                  <div className="flex items-start gap-4">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${["bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-indigo-500"][i] || "bg-gray-400"}`}>{country.rank}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-0.5 text-sm font-bold text-gray-900">{country.country}</h3>
                      <p className="mb-3 text-xs text-gray-500">{country.note}</p>
                      <div className="flex flex-wrap gap-2">
                        {[{ label: "Salary", val: country.salary, variant: "green" }, { label: "Demand", val: country.vacancies, variant: "blue" }, { label: "Visa", val: country.visa, variant: "purple" }, { label: "English", val: country.english, variant: "amber" }, { label: "Remote", val: country.remote, variant: "default" }, { label: "Potential", val: country.potential, variant: "default" }].map((item) => (
                          <div key={item.label} className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">{item.label}:</span>
                            <Badge variant={item.variant as BadgeVariant}>{item.val}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "gap" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-gray-900">🔍 Gap analysis for {activeRole.title}</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card>
                <h3 className="mb-3 text-sm font-bold text-gray-900">🎯 Priority skill gaps</h3>
                <div className="space-y-3">
                  {activeRole.analyzerContent.gaps.map((item: GapItem) => (
                    <div key={item.skill} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-700">{item.skill}</span>
                      <Badge variant={item.urgency === "Critical" ? "red" : item.urgency === "High" ? "amber" : "default"}>{item.urgency}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h3 className="mb-3 text-sm font-bold text-gray-900">📅 Recommended learning order</h3>
                <ol className="space-y-3">
                  {activeRole.analyzerContent.learningSteps.map((item: LearningStep) => (
                    <li key={item.step} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">{item.step}</span>
                      <div className="flex flex-1 items-center justify-between gap-2">
                        <span className="text-xs text-gray-700">{item.text}</span>
                        <Badge variant="blue">{item.time}</Badge>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
              <p className="mb-3 text-sm text-indigo-700">Use the connected roadmap to close these gaps with a structured path instead of random learning.</p>
              <Link href={roadmapHref} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700">
                Start with the roadmap →
              </Link>
            </div>
          </div>
        )}

        {activeTab === "strategy" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-gray-900">🚀 Career strategy for {activeRole.title}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {activeRole.analyzerContent.strategyStages.map((stage) => <StrategyColumn key={stage.title} stage={stage} />)}
            </div>

            <Card>
              <h3 className="mb-3 text-sm font-bold text-gray-900">💰 Salary negotiation strategy</h3>
              <div className="grid gap-4 text-xs text-gray-700 sm:grid-cols-2">
                <div>
                  <p className="mb-2 font-semibold text-gray-800">Research phase</p>
                  <ul className="space-y-1">
                    {activeRole.analyzerContent.salaryStrategyResearch.map((tip) => <li key={tip} className="flex items-start gap-1.5"><span className="mt-0.5 text-indigo-500">•</span>{tip}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 font-semibold text-gray-800">Negotiation tactics</p>
                  <ul className="space-y-1">
                    {activeRole.analyzerContent.salaryStrategyNegotiation.map((tip) => <li key={tip} className="flex items-start gap-1.5"><span className="mt-0.5 text-indigo-500">•</span>{tip}</li>)}
                  </ul>
                </div>
              </div>
            </Card>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-1 text-sm font-bold text-gray-900">Go from analyzer to action</h3>
              <p className="mb-4 text-xs text-gray-500">Use pricing and waitlist paths from the main site without leaving the experience.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/#pricing" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700">See pricing →</Link>
                <Link href="/#waitlist" className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50">Join waitlist</Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cv" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-gray-900">📄 CV Analyzer for {activeRole.title}</h2>
            <p className="text-sm text-gray-500">{activeRole.analyzerContent.cvIntro}</p>

            <Card>
              <div className="space-y-4">
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Paste your CV / resume text here..."
                  className="h-48 w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={runCVAnalysis}
                    disabled={!cvText.trim() || cvLoading}
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {cvLoading ? "Analysing..." : "Analyse CV"}
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition-all hover:border-indigo-400 hover:text-indigo-600"
                  >
                    Upload .txt file
                  </button>
                  <input ref={fileInputRef} type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
                  {cvText && (
                    <button onClick={() => { setCvText(""); setCvAnalysis(null); }} className="text-xs text-gray-400 transition-colors hover:text-red-500">
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </Card>

            {cvLoading && (
              <Card>
                <div className="flex items-center gap-3 py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  <span className="text-sm text-gray-500">Analysing your CV against the selected role...</span>
                </div>
              </Card>
            )}

            {cvAnalysis && !cvLoading && (
              <div className="space-y-4">
                <Card>
                  <div className="flex items-center gap-6">
                    <div className="shrink-0 text-center">
                      <div className={`text-4xl font-extrabold ${cvAnalysis.score >= 70 ? "text-emerald-600" : cvAnalysis.score >= 40 ? "text-amber-600" : "text-red-600"}`}>{cvAnalysis.score}</div>
                      <div className="mt-0.5 text-xs text-gray-400">/ 100</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-sm font-bold text-gray-900">Role readiness score</h3>
                      <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-200">
                        <div className={`h-full rounded-full ${cvAnalysis.score >= 70 ? "bg-emerald-500" : cvAnalysis.score >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${cvAnalysis.score}%` }} />
                      </div>
                      <p className="text-xs text-gray-500">{cvAnalysis.recommendedPath}</p>
                      <p className="mt-1 text-xs font-semibold text-indigo-600">{cvAnalysis.timeEstimate}</p>
                    </div>
                  </div>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <h3 className="mb-3 text-sm font-bold text-emerald-700">✅ Strengths</h3>
                    <ul className="space-y-2">
                      {cvAnalysis.strengths.map((item) => <li key={item} className="flex items-start gap-2 text-xs text-gray-700"><span className="mt-0.5 shrink-0 text-emerald-600">✓</span>{item}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                    <h3 className="mb-3 text-sm font-bold text-red-700">⚠️ Gaps</h3>
                    <ul className="space-y-2">
                      {cvAnalysis.gaps.map((item) => <li key={item} className="flex items-start gap-2 text-xs text-gray-700"><span className="mt-0.5 shrink-0 text-red-500">!</span>{item}</li>)}
                    </ul>
                  </div>
                </div>

                <Card>
                  <h3 className="mb-3 text-sm font-bold text-gray-900">🎯 Priority actions</h3>
                  <ol className="space-y-2">
                    {cvAnalysis.priorityActions.map((action, i) => (
                      <li key={`${i}-${action}`} className="flex items-start gap-3 text-xs text-gray-700">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">{i + 1}</span>
                        {action}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <Link href={roadmapHref} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700">
                      Start the matching roadmap →
                    </Link>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      <section className="border-t border-gray-100 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-10 text-center shadow-lg">
            <h2 className="text-xl font-extrabold text-white sm:text-2xl">Ready to move from analysis to roadmap?</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-indigo-200">Stay in the same product flow: choose a role, analyse fit, then continue to roadmap, pricing, or waitlist.</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={roadmapHref} className="w-full rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 sm:w-auto">
                {isAvailable ? `View ${activeRole.title} roadmap` : `Preview ${activeRole.title} roadmap`}
              </Link>
              <Link href="/#roadmaps" className="w-full rounded-xl border border-indigo-400 px-6 py-2.5 text-sm font-semibold text-indigo-100 transition-colors hover:bg-indigo-500 sm:w-auto">
                Browse all roadmaps
              </Link>
              <Link href="/#waitlist" className="w-full rounded-xl border border-indigo-400 px-6 py-2.5 text-sm font-semibold text-indigo-100 transition-colors hover:bg-indigo-500 sm:w-auto">
                Join waitlist
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
