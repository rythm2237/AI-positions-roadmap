"use client";

import { useMemo, useState } from "react";

type Profile = {
  fullName: string;
  headline: string;
  targetPosition: string;
  openToSuggestions: boolean;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  projects: string;
  certifications: string;
  languages: string;
  weeklyHours: string;
  linkedinUrl: string;
};

type ScoreRow = { label: string; score: number; note: string };

type Analysis = {
  overall: number;
  verdict: string;
  rows: ScoreRow[];
  strengths: string[];
  gaps: string[];
  nextActions: string[];
  matches: { title: string; match: number; weeks: string }[];
};

const initialProfile: Profile = {
  fullName: "",
  headline: "",
  targetPosition: "",
  openToSuggestions: true,
  summary: "",
  experience: "",
  education: "",
  skills: "",
  projects: "",
  certifications: "",
  languages: "",
  weeklyHours: "5",
  linkedinUrl: "",
};

const WIZARD_STEPS = [
  ["Direction", "Target role or career discovery"],
  ["Profile", "Name, headline and professional summary"],
  ["Experience", "Roles, impact and measurable outcomes"],
  ["Skills", "Skills, projects and certifications"],
  ["Review", "Confirm the profile before analysis"],
] as const;

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function tokens(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#. -]/g, " ")
    .split(/[\s,;/|]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1);
}

function analyze(profile: Profile, rawText: string): Analysis {
  const source = [rawText, profile.summary, profile.experience, profile.education, profile.skills, profile.projects, profile.certifications].join("\n");
  const sourceLower = source.toLowerCase();
  const wordCount = source.trim().split(/\s+/).filter(Boolean).length;
  const quantified = (source.match(/(?:\b\d+(?:\.\d+)?%|\b\d+[+,]?\b|€|\$|£)/g) ?? []).length;
  const actionHits = (sourceLower.match(/\b(led|built|improved|reduced|increased|delivered|launched|automated|managed|optimized|designed|created|implemented)\b/g) ?? []).length;
  const skillList = tokens(profile.skills);
  const targetList = tokens(profile.targetPosition);
  const targetHits = targetList.filter((token) => sourceLower.includes(token)).length;

  const ats = clamp((wordCount >= 180 ? 78 : wordCount / 180 * 78) + (profile.experience ? 8 : 0) + (profile.education ? 6 : 0) + (profile.skills ? 8 : 0));
  const summaryScore = clamp(profile.summary.length >= 220 ? 88 : profile.summary.length / 220 * 88);
  const experienceScore = clamp((profile.experience.length >= 550 ? 62 : profile.experience.length / 550 * 62) + Math.min(20, quantified * 3) + Math.min(18, actionHits * 2));
  const evidenceScore = clamp(35 + Math.min(40, quantified * 5) + Math.min(25, profile.projects.length / 18));
  const skillsScore = clamp(skillList.length * 5.5 + (profile.certifications ? 10 : 0) + (profile.projects ? 10 : 0));
  const targetScore = profile.openToSuggestions || !targetList.length ? clamp((skillsScore + experienceScore) / 2) : clamp(38 + (targetHits / Math.max(1, targetList.length)) * 45 + Math.min(17, quantified * 2));
  const structure = clamp((profile.fullName ? 12 : 0) + (profile.headline ? 12 : 0) + (profile.summary ? 18 : 0) + (profile.experience ? 24 : 0) + (profile.education ? 12 : 0) + (profile.skills ? 14 : 0) + (profile.projects || profile.certifications ? 8 : 0));

  const rows: ScoreRow[] = [
    { label: "ATS readability", score: ats, note: "Checks extractable content and core CV sections." },
    { label: "Professional summary", score: summaryScore, note: "Measures clarity and depth of positioning." },
    { label: "Experience quality", score: experienceScore, note: "Rewards action language and measurable outcomes." },
    { label: "Achievement evidence", score: evidenceScore, note: "Looks for metrics, results and portfolio proof." },
    { label: "Skills relevance", score: skillsScore, note: "Measures declared skills plus supporting projects/certifications." },
    { label: "Target job alignment", score: targetScore, note: profile.openToSuggestions ? "Uses broad career-fit readiness in discovery mode." : "Compares profile evidence with the selected target." },
    { label: "CV structure", score: structure, note: "Checks whether recruiters can find essential information quickly." },
  ];

  const overall = clamp(rows.reduce((sum, row) => sum + row.score, 0) / rows.length);
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (experienceScore >= 72) strengths.push("Experience section shows credible scope, action and outcomes.");
  else gaps.push("Strengthen experience bullets with actions, scope and measurable outcomes.");
  if (skillList.length >= 8) strengths.push("Skills coverage is broad enough for meaningful role matching.");
  else gaps.push("Add a focused skills inventory so role matching is not based on job titles alone.");
  if (quantified >= 4) strengths.push("The CV contains multiple quantified proof points.");
  else gaps.push("Add numbers: scale, time saved, revenue, cost, volume, quality, users or performance change.");
  if (profile.projects) strengths.push("Projects provide evidence beyond responsibilities.");
  else gaps.push("Add at least one project that proves a high-value skill in practice.");
  if (summaryScore < 70) gaps.push("Rewrite the summary around role identity, domain strength and differentiating evidence.");
  if (!profile.openToSuggestions && targetScore < 72) gaps.push("Target-role evidence is incomplete; add role-specific skills, tools and achievements.");

  const weekly = Math.max(1, Number(profile.weeklyHours) || 5);
  const baseWeeks = Math.max(2, Math.ceil((100 - overall) * 0.55 / weekly * 5));
  const coreSkills = skillList.join(" ");
  const matchSeeds = [
    ["AI Automation Specialist", /automation|power automate|workflow|copilot|process|api/],
    ["Business AI Consultant", /business|consult|stakeholder|strategy|process|transformation/],
    ["AI Product Operations Specialist", /product|operations|analytics|process|project|kpi/],
    ["Business Analyst", /analysis|analytics|requirement|power bi|sql|process|stakeholder/],
  ] as const;
  const matches = matchSeeds
    .map(([title, pattern], index) => {
      const evidence = `${coreSkills} ${sourceLower}`.match(new RegExp(pattern.source, "g"))?.length ?? 0;
      const match = clamp(55 + Math.min(27, evidence * 4) + Math.max(0, overall - 65) * 0.35 - index * 2);
      const weeks = Math.max(2, baseWeeks + index * 2);
      return { title, match, weeks: `${weeks}–${weeks + 3} weeks at ${weekly}h/week` };
    })
    .sort((a, b) => b.match - a.match)
    .slice(0, 3);

  return {
    overall,
    verdict: overall >= 85 ? "Strong and competitive" : overall >= 70 ? "Competitive with clear improvement opportunities" : overall >= 55 ? "Promising, but evidence and positioning need work" : "Needs restructuring before targeted applications",
    rows,
    strengths: strengths.length ? strengths : ["The profile contains enough information to establish a baseline."],
    gaps: gaps.slice(0, 5),
    nextActions: [
      gaps[0] ?? "Tailor the strongest evidence to the target role.",
      "Validate high-value skills with projects, certifications or measurable work evidence.",
      profile.openToSuggestions ? "Compare the top career matches and choose one path for a targeted analysis." : `Create a targeted CV version for ${profile.targetPosition || "the selected role"}.`,
    ],
    matches,
  };
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-medium text-slate-200"><span>{label}</span>{children}{hint ? <span className="text-xs font-normal leading-5 text-slate-500">{hint}</span> : null}</label>;
}

const inputClass = "min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-300/40 focus:ring-2 focus:ring-violet-500/10";
const areaClass = `${inputClass} min-h-32 resize-y py-3 leading-6`;

export default function CVAnalyzerClient() {
  const [mode, setMode] = useState<"choose" | "upload" | "builder">("choose");
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [wizardStep, setWizardStep] = useState(0);
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploadState, setUploadState] = useState<"idle" | "reading" | "ready" | "error">("idle");
  const [uploadError, setUploadError] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const readyToAnalyze = useMemo(() => rawText.trim().length > 80 || Boolean(profile.experience.trim() && profile.skills.trim()), [profile.experience, profile.skills, rawText]);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
    setAnalysis(null);
  }

  async function readFile(file: File) {
    setUploadState("reading");
    setUploadError("");
    setAnalysis(null);
    const body = new FormData();
    body.append("file", file);
    try {
      const response = await fetch("/api/cv-analyzer/extract", { method: "POST", body });
      const data = await response.json() as { error?: string; text?: string; fileName?: string };
      if (!response.ok || !data.text) throw new Error(data.error || "CV extraction failed.");
      setRawText(data.text);
      setFileName(data.fileName || file.name);
      setUploadState("ready");
    } catch (error) {
      setUploadState("error");
      setUploadError(error instanceof Error ? error.message : "CV extraction failed.");
    }
  }

  function runAnalysis() {
    if (!readyToAnalyze) return;
    setAnalysis(analyze(profile, rawText));
    window.setTimeout(() => document.querySelector("#cv-analysis-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
  }

  return (
    <main className="min-h-screen bg-[#03050e] px-4 pb-24 pt-24 text-white sm:px-6 lg:px-8" data-help-title="CV Analyzer" data-help-description="Build or upload a CV, establish a structured career profile, and analyze strengths, weaknesses, role fit and next actions.">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2rem] border border-violet-300/15 bg-[radial-gradient(circle_at_15%_0%,rgba(124,58,237,.22),transparent_35%),linear-gradient(180deg,rgba(13,17,40,.96),rgba(5,7,20,.98))] p-6 shadow-2xl sm:p-8 lg:p-10" data-help-title="CV Analyzer overview" data-help-description="This workspace turns your CV or guided profile into an evidence-based baseline for ATS readiness, recruiter readability, skill gaps and career matching.">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[.22em] text-violet-300">Career Intelligence · CV Analyzer</p>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Know where your CV stands — and what to do next.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">Upload an existing CV or build one step by step. Career OS evaluates structure, evidence, achievements, skills and role alignment, then turns gaps into an actionable career path.</p>
            </div>
            <div className="rounded-2xl border border-emerald-300/15 bg-emerald-500/[0.06] px-4 py-3 text-xs leading-5 text-emerald-100/80">
              <strong className="block text-emerald-200">V1 analysis is live</strong>
              Professional parser + Career OS baseline scoring. Independent recruitment-engine benchmarking is the next integration layer.
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3" aria-label="CV input options">
          <button type="button" onClick={() => setMode("upload")} className={`rounded-3xl border p-5 text-left transition ${mode === "upload" ? "border-violet-300/40 bg-violet-500/10" : "border-white/10 bg-white/[0.025] hover:border-violet-300/25"}`} data-help-title="Upload existing CV" data-help-description="Upload PDF, DOCX or TXT. The file is converted to text for analysis and is not stored by the extraction endpoint.">
            <span className="text-2xl" aria-hidden="true">↥</span><h2 className="mt-4 font-display text-xl font-semibold">Upload existing CV</h2><p className="mt-2 text-sm leading-6 text-slate-500">Optional if your CV is already prepared. PDF, DOCX or TXT up to 8 MB.</p>
          </button>
          <button type="button" onClick={() => setMode("builder")} className={`rounded-3xl border p-5 text-left transition ${mode === "builder" ? "border-violet-300/40 bg-violet-500/10" : "border-white/10 bg-white/[0.025] hover:border-violet-300/25"}`} data-help-title="Guided CV builder" data-help-description="A wizard that collects career direction, profile, experience, evidence and skills before analysis.">
            <span className="text-2xl" aria-hidden="true">✦</span><h2 className="mt-4 font-display text-xl font-semibold">Build my CV</h2><p className="mt-2 text-sm leading-6 text-slate-500">A guided wizard designed to capture achievements, not just responsibilities.</p>
          </button>
          <button type="button" onClick={() => setMode("builder")} className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 text-left transition hover:border-violet-300/25" data-help-title="LinkedIn import" data-help-description="Official LinkedIn direct import requires approved API access. For V1, save your LinkedIn URL or export your LinkedIn profile as PDF and upload it here.">
            <span className="text-2xl" aria-hidden="true">in</span><h2 className="mt-4 font-display text-xl font-semibold">LinkedIn</h2><p className="mt-2 text-sm leading-6 text-slate-500">Add your profile URL now, or upload a LinkedIn profile PDF. Direct authorized import follows official API approval.</p>
          </button>
        </section>

        {mode === "choose" ? <section className="mt-6 rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">Choose an input method above to begin.</section> : null}

        {mode === "upload" ? (
          <section className="mt-6 rounded-3xl border border-white/10 bg-[#080b1c]/80 p-5 sm:p-7" data-help-title="CV upload area">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-violet-300">Step 1</p><h2 className="mt-2 font-display text-2xl font-semibold">Upload your CV</h2><p className="mt-2 text-sm leading-6 text-slate-500">We extract readable text, then you choose targeted analysis or career discovery.</p></div>
              <label className="cursor-pointer rounded-2xl border border-dashed border-violet-300/30 bg-violet-500/[0.06] px-6 py-5 text-center text-sm font-semibold text-violet-100 hover:bg-violet-500/[0.1]">
                {uploadState === "reading" ? "Reading CV…" : fileName || "Choose CV file"}
                <input type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" className="sr-only" disabled={uploadState === "reading"} onChange={(event) => { const file = event.target.files?.[0]; if (file) void readFile(file); }} />
              </label>
            </div>
            {uploadState === "ready" ? <p className="mt-4 rounded-xl border border-emerald-300/15 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-200">CV text extracted successfully. You can analyze it now or add target information below.</p> : null}
            {uploadState === "error" ? <p className="mt-4 rounded-xl border border-rose-300/15 bg-rose-500/[0.07] px-4 py-3 text-sm text-rose-200">{uploadError}</p> : null}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Target position (optional)" hint="Leave discovery on if you want Career OS to recommend suitable roles."><input className={inputClass} value={profile.targetPosition} onChange={(event) => update("targetPosition", event.target.value)} placeholder="e.g. AI Automation Specialist" /></Field>
              <Field label="Study time per week" hint="Used for readiness-time estimates."><input className={inputClass} type="number" min="1" max="40" value={profile.weeklyHours} onChange={(event) => update("weeklyHours", event.target.value)} /></Field>
            </div>
            <label className="mt-4 flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={profile.openToSuggestions} onChange={(event) => update("openToSuggestions", event.target.checked)} className="h-4 w-4 accent-violet-500" /> Recommend careers that fit my profile</label>
          </section>
        ) : null}

        {mode === "builder" ? (
          <section className="mt-6 rounded-3xl border border-white/10 bg-[#080b1c]/80 p-5 sm:p-7" data-help-title="Guided CV wizard">
            <div className="grid gap-2 sm:grid-cols-5">{WIZARD_STEPS.map(([title], index) => <button key={title} type="button" onClick={() => setWizardStep(index)} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${wizardStep === index ? "border-violet-300/35 bg-violet-500/12 text-white" : "border-white/8 text-slate-600 hover:text-slate-300"}`}>{index + 1}. {title}</button>)}</div>
            <div className="mt-7">
              {wizardStep === 0 ? <div className="grid gap-5"><div><h2 className="font-display text-2xl font-semibold">What are you aiming for?</h2><p className="mt-2 text-sm leading-6 text-slate-500">Choose a target role, or let Career OS discover strong matches.</p></div><label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={profile.openToSuggestions} onChange={(event) => update("openToSuggestions", event.target.checked)} className="h-4 w-4 accent-violet-500" /> I want career recommendations</label><Field label="Target position"><input className={inputClass} value={profile.targetPosition} disabled={profile.openToSuggestions} onChange={(event) => update("targetPosition", event.target.value)} placeholder="e.g. AI Solutions Consultant" /></Field><Field label="LinkedIn profile URL" hint="Stored only in this browser session in V1. Official direct import requires LinkedIn-approved access."><input className={inputClass} value={profile.linkedinUrl} onChange={(event) => update("linkedinUrl", event.target.value)} placeholder="https://www.linkedin.com/in/..." /></Field><Field label="Available learning time per week"><input className={inputClass} type="number" min="1" max="40" value={profile.weeklyHours} onChange={(event) => update("weeklyHours", event.target.value)} /></Field></div> : null}
              {wizardStep === 1 ? <div className="grid gap-5"><h2 className="font-display text-2xl font-semibold">Build your professional identity</h2><div className="grid gap-4 md:grid-cols-2"><Field label="Full name"><input className={inputClass} value={profile.fullName} onChange={(event) => update("fullName", event.target.value)} /></Field><Field label="Professional headline"><input className={inputClass} value={profile.headline} onChange={(event) => update("headline", event.target.value)} placeholder="Role · domain · differentiator" /></Field></div><Field label="Professional summary" hint="Focus on identity, domain strength, years/scope and differentiating evidence."><textarea className={areaClass} value={profile.summary} onChange={(event) => update("summary", event.target.value)} /></Field></div> : null}
              {wizardStep === 2 ? <div className="grid gap-5"><h2 className="font-display text-2xl font-semibold">Turn responsibilities into evidence</h2><Field label="Work experience" hint="For each role include title, company, dates, responsibilities, improvements, scale and measurable results."><textarea className={`${areaClass} min-h-64`} value={profile.experience} onChange={(event) => update("experience", event.target.value)} placeholder="Example: Automated a weekly reporting process used by 6 operational areas, reducing manual preparation time by 4 hours per week…" /></Field><Field label="Education"><textarea className={areaClass} value={profile.education} onChange={(event) => update("education", event.target.value)} /></Field></div> : null}
              {wizardStep === 3 ? <div className="grid gap-5"><h2 className="font-display text-2xl font-semibold">Show what you can do</h2><Field label="Skills" hint="Separate skills and tools with commas."><textarea className={areaClass} value={profile.skills} onChange={(event) => update("skills", event.target.value)} placeholder="Power BI, Power Automate, SQL, process analysis, stakeholder management…" /></Field><Field label="Projects"><textarea className={areaClass} value={profile.projects} onChange={(event) => update("projects", event.target.value)} /></Field><div className="grid gap-4 md:grid-cols-2"><Field label="Certifications"><textarea className={areaClass} value={profile.certifications} onChange={(event) => update("certifications", event.target.value)} /></Field><Field label="Languages"><textarea className={areaClass} value={profile.languages} onChange={(event) => update("languages", event.target.value)} /></Field></div></div> : null}
              {wizardStep === 4 ? <div><h2 className="font-display text-2xl font-semibold">Ready for analysis</h2><p className="mt-2 text-sm leading-6 text-slate-500">Career OS will score the information you provided and identify evidence gaps. You can return to any step before running the analysis.</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Direction", profile.openToSuggestions ? "Career discovery" : profile.targetPosition || "Missing"],["Experience", profile.experience ? "Added" : "Missing"],["Skills", profile.skills ? "Added" : "Missing"],["Projects", profile.projects ? "Added" : "Optional"]].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="text-xs text-slate-600">{label}</p><p className="mt-1 text-sm font-semibold text-slate-200">{value}</p></div>)}</div></div> : null}
            </div>
            <div className="mt-7 flex justify-between gap-3"><button type="button" disabled={wizardStep === 0} onClick={() => setWizardStep((step) => Math.max(0, step - 1))} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-400 disabled:opacity-30">Back</button>{wizardStep < WIZARD_STEPS.length - 1 ? <button type="button" onClick={() => setWizardStep((step) => Math.min(WIZARD_STEPS.length - 1, step + 1))} className="rounded-xl bg-violet-500 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-400">Continue</button> : null}</div>
          </section>
        ) : null}

        {mode !== "choose" ? <section className="mt-6 flex flex-col gap-4 rounded-3xl border border-violet-300/15 bg-violet-500/[0.055] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-display text-xl font-semibold">Run Career OS CV analysis</h2><p className="mt-1 text-sm text-slate-500">Current score is a transparent Career OS baseline. Commercial recruitment-engine scores will remain separately labeled when connected.</p></div><button type="button" onClick={runAnalysis} disabled={!readyToAnalyze} className="min-h-11 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-35">Analyze my CV</button></section> : null}

        {analysis ? <section id="cv-analysis-results" className="mt-8 scroll-mt-24" data-help-title="CV analysis results" data-help-description="This report breaks the overall score into transparent dimensions, highlights evidence strengths and gaps, and suggests career matches with readiness estimates.">
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <article className="rounded-3xl border border-violet-300/20 bg-[#0b0e22] p-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-violet-300">Career OS CV Score</p><div className="mt-4 flex items-end gap-3"><span className="font-display text-6xl font-bold">{analysis.overall}</span><span className="pb-2 text-lg text-slate-600">/100</span></div><p className="mt-3 text-sm font-semibold text-slate-200">{analysis.verdict}</p><p className="mt-3 text-xs leading-5 text-slate-600">Baseline score · not presented as a Textkernel, Affinda, RChilli or employer ATS score.</p></article>
            <article className="rounded-3xl border border-white/10 bg-[#080b1c] p-6"><h2 className="font-display text-xl font-semibold">Score breakdown</h2><div className="mt-5 grid gap-4">{analysis.rows.map((row) => <div key={row.label}><div className="flex items-center justify-between gap-4 text-sm"><span className="font-medium text-slate-300">{row.label}</span><span className="font-bold text-white">{row.score}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-violet-400" style={{ width: `${row.score}%` }} /></div><p className="mt-1.5 text-xs text-slate-600">{row.note}</p></div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2"><article className="rounded-3xl border border-emerald-300/10 bg-emerald-500/[0.035] p-6"><h2 className="font-display text-xl font-semibold">Strengths</h2><ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-300">{analysis.strengths.map((item) => <li key={item} className="flex gap-3"><span className="text-emerald-300">✓</span><span>{item}</span></li>)}</ul></article><article className="rounded-3xl border border-amber-300/10 bg-amber-500/[0.035] p-6"><h2 className="font-display text-xl font-semibold">Priority gaps</h2><ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-300">{analysis.gaps.map((item) => <li key={item} className="flex gap-3"><span className="text-amber-300">→</span><span>{item}</span></li>)}</ul></article></div>
          <article className="mt-5 rounded-3xl border border-white/10 bg-[#080b1c] p-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-violet-300">Career discovery</p><h2 className="mt-2 font-display text-2xl font-semibold">Best-fit directions</h2></div><p className="text-xs text-slate-600">Readiness estimates adapt to {Math.max(1, Number(profile.weeklyHours) || 5)} learning hours/week.</p></div><div className="mt-5 grid gap-3 md:grid-cols-3">{analysis.matches.map((match, index) => <div key={match.title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><div className="flex items-center justify-between"><span className="text-xs font-bold text-violet-300">#{index + 1}</span><span className="text-sm font-bold">{match.match}% match</span></div><h3 className="mt-3 font-display text-lg font-semibold">{match.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">Estimated readiness: {match.weeks}</p></div>)}</div></article>
          <article className="mt-5 rounded-3xl border border-violet-300/15 bg-violet-500/[0.055] p-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-violet-300">Next best actions</p><ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-300">{analysis.nextActions.map((item, index) => <li key={item} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-200">{index + 1}</span><span>{item}</span></li>)}</ol></article>
        </section> : null}
      </div>
    </main>
  );
}
