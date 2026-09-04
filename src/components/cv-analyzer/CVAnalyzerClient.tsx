"use client";

import { useState } from "react";
import { analyzeSemanticCV, type SemanticCVAnalysis } from "@/lib/cvAnalyzer/semanticAnalysis";
import { parseLinkedInProfileText, type ImportedProfileField, type LinkedInProfileImport } from "@/lib/cvAnalyzer/linkedinProfile";
import { AVAILABLE_CAREERS } from "@/data/careerCatalog";
import { CareerMatchCard } from "./CareerMatchCard";

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

type Analysis = SemanticCVAnalysis;

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

function analyze(profile: Profile, rawText: string): Analysis {
  return analyzeSemanticCV(profile, rawText, AVAILABLE_CAREERS);
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-medium text-slate-200"><span>{label}</span>{children}{hint ? <span className="text-xs font-normal leading-5 text-slate-500">{hint}</span> : null}</label>;
}

const inputClass = "min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-300/40 focus:ring-2 focus:ring-violet-500/10";
const areaClass = `${inputClass} min-h-32 resize-y py-3 leading-6`;
// LINKEDIN_PROFILE_IMPORT_V2 is canonical source code; build-time scripts validate rather than regenerate it.
const IMPORT_FIELD_LABELS: Record<ImportedProfileField, string> = {
  fullName: "Name",
  headline: "Headline",
  summary: "About",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
};

export default function CVAnalyzerClient({ initialTargetPosition = "" }: { initialTargetPosition?: string }) {
  const [mode, setMode] = useState<"choose" | "upload" | "builder" | "linkedin">("choose");
  const [profile, setProfile] = useState<Profile>(() => ({ ...initialProfile, targetPosition: initialTargetPosition, openToSuggestions: !initialTargetPosition }));
  const [wizardStep, setWizardStep] = useState(0);
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploadState, setUploadState] = useState<"idle" | "reading" | "ready" | "error">("idle");
  const [uploadError, setUploadError] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [evidenceSaveState, setEvidenceSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [evidenceSaveMessage, setEvidenceSaveMessage] = useState("");
  const [linkedinImportState, setLinkedinImportState] = useState<"idle" | "reading" | "ready" | "error">("idle");
  const [linkedinImportMessage, setLinkedinImportMessage] = useState("");
  const [linkedinImportResult, setLinkedinImportResult] = useState<LinkedInProfileImport | null>(null);
  const [showRecentUpdate, setShowRecentUpdate] = useState(false);
  const [recentExperience, setRecentExperience] = useState({ role: "", company: "", startYear: "", current: true, endYear: "", responsibilities: "", tools: "", achievements: "", projects: "", certifications: "" });

  const readyToAnalyze = rawText.trim().length > 80 || Boolean(profile.experience.trim() && profile.skills.trim());

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
    if (key in IMPORT_FIELD_LABELS && typeof value === "string") {
      const field = key as ImportedProfileField;
      setLinkedinImportResult((current) => current ? {
        ...current,
        profile: { ...current.profile, [field]: value },
        fields: { ...current.fields, [field]: { value, source: "manual", confidence: value.trim() ? "high" : "low" } },
        reviewItems: value.trim() ? current.reviewItems.filter((item) => item !== field) : Array.from(new Set([...current.reviewItems, field])),
      } : current);
    }
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


  async function readLinkedInProfilePdf(file: File) {
    setLinkedinImportState("reading");
    setLinkedinImportMessage("");
    setLinkedinImportResult(null);
    setAnalysis(null);
    const body = new FormData();
    body.append("file", file);
    try {
      const response = await fetch("/api/cv-analyzer/extract", { method: "POST", body });
      const data = await response.json() as { error?: string; text?: string; fileName?: string };
      if (!response.ok || !data.text) throw new Error(data.error || "LinkedIn profile extraction failed.");
      const parsed = parseLinkedInProfileText(data.text);
      setRawText(parsed.rawText);
      setFileName(data.fileName || file.name);
      setProfile((current) => ({ ...current, ...Object.fromEntries(Object.entries(parsed.profile).filter(([, value]) => Boolean(value))) } as Profile));
      setLinkedinImportResult(parsed);
      setLinkedinImportState("ready");
      setLinkedinImportMessage(parsed.reviewItems.length
        ? `${parsed.reviewItems.length} item${parsed.reviewItems.length === 1 ? "" : "s"} need review: ${parsed.reviewItems.map((item) => IMPORT_FIELD_LABELS[item]).join(", ")}. You can analyze now or review only these fields.`
        : "LinkedIn profile imported with complete coverage. You can analyze immediately or review the detected fields.");
    } catch (error) {
      setLinkedinImportState("error");
      setLinkedinImportMessage(error instanceof Error ? error.message : "LinkedIn profile extraction failed.");
    }
  }

  function runAnalysis() {
    if (!readyToAnalyze) return;
    setAnalysis(analyze(profile, rawText));
    setEvidenceSaveState("idle");
    setEvidenceSaveMessage("");
    window.setTimeout(() => document.querySelector("#cv-analysis-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
  }

  async function saveEvidenceForJobAgent() {
    if (!analysis || evidenceSaveState === "saving") return;
    setEvidenceSaveState("saving");
    setEvidenceSaveMessage("");
    try {
      const response = await fetch("/api/cv-analyzer/evidence", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ skills: profile.skills, languages: profile.languages, certifications: profile.certifications, projects: profile.projects, experience: profile.experience, overall: analysis.overall, strengths: analysis.strengths }) });
      const result = await response.json() as { saved?: number; error?: string };
      if (!response.ok) throw new Error(result.error || "Evidence could not be saved.");
      setEvidenceSaveState("saved");
      setEvidenceSaveMessage(`${result.saved ?? 0} provenance-linked evidence items are now available to Job Agent. Your profile was not overwritten.`);
    } catch (error) {
      setEvidenceSaveState("error");
      setEvidenceSaveMessage(error instanceof Error ? error.message : "Evidence could not be saved.");
    }
  }

  function applyRecentExperience() {
    const role = recentExperience.role.trim();
    const company = recentExperience.company.trim();
    const startYear = recentExperience.startYear.trim();
    if (!role || !company || !startYear) return;

    const endLabel = recentExperience.current ? "Present" : recentExperience.endYear.trim();
    const dateLabel = endLabel ? startYear + " - " + endLabel : startYear;
    const detailLines = [recentExperience.responsibilities.trim(), recentExperience.achievements.trim()]
      .filter(Boolean)
      .map((value) => "- " + value.replace(/\n+/g, "\n- "));
    const experienceBlock = [role + " | " + company + " | " + dateLabel, ...detailLines].join("\n");

    const nextProfile: Profile = {
      ...profile,
      experience: [profile.experience.trim(), experienceBlock].filter(Boolean).join("\n\n"),
      skills: [profile.skills.trim(), recentExperience.tools.trim()].filter(Boolean).join(", "),
      projects: [profile.projects.trim(), recentExperience.projects.trim()].filter(Boolean).join("\n\n"),
      certifications: [profile.certifications.trim(), recentExperience.certifications.trim()].filter(Boolean).join("\n"),
    };

    setProfile(nextProfile);
    setAnalysis(analyze(nextProfile, rawText));
    setShowRecentUpdate(false);
    setRecentExperience({ role: "", company: "", startYear: "", current: true, endYear: "", responsibilities: "", tools: "", achievements: "", projects: "", certifications: "" });
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
              Professional parser + semantic section and evidence scoring. Independent recruitment-engine benchmarking remains a separate validation layer.
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
          <button type="button" onClick={() => setMode("linkedin")} aria-pressed={mode === "linkedin"} className={`rounded-3xl border p-5 text-left transition ${mode === "linkedin" ? "border-violet-300/40 bg-violet-500/10 ring-1 ring-violet-300/10" : "border-white/10 bg-white/[0.025] hover:border-violet-300/25"}`} data-help-title="LinkedIn import" data-help-description="Import a complete LinkedIn profile export into CV Analyzer without retyping the same career history.">
            <span className="text-2xl" aria-hidden="true">in</span><h2 className="mt-4 font-display text-xl font-semibold">LinkedIn</h2><p className="mt-2 text-sm leading-6 text-slate-500">Import your LinkedIn profile once, prefill your career history, then go straight to analysis.</p>
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
              <Field label="Study time per week" hint="Used only for rough skill-gap closing estimates; it is not a hiring-time prediction."><input className={inputClass} type="number" min="1" max="40" value={profile.weeklyHours} onChange={(event) => update("weeklyHours", event.target.value)} /></Field>
            </div>
            <label className="mt-4 flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={profile.openToSuggestions} onChange={(event) => update("openToSuggestions", event.target.checked)} className="h-4 w-4 accent-violet-500" /> Recommend careers that fit my profile</label>
          </section>
        ) : null}


        {mode === "linkedin" ? (
          <section className="mt-6 rounded-3xl border border-violet-300/20 bg-[#080b1c]/80 p-5 sm:p-7" data-help-title="LinkedIn profile import">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-violet-300">LinkedIn profile import</p>
                <h2 className="mt-2 font-display text-2xl font-semibold">Bring your career history in once</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Paste your LinkedIn URL so this analysis stays connected to the right profile. For a complete import today, upload LinkedIn’s own <strong className="font-semibold text-slate-200">Save to PDF</strong> profile export. We analyze the complete extracted text and prefill name, headline, About, Experience, Education, Skills, Certifications, Languages and Projects when those sections are present.</p>
                <div className="mt-5 grid gap-4">
                  <Field label="LinkedIn profile URL" hint="A public profile URL alone is not scraped. Complete direct API import requires member authorization and approved LinkedIn access."><input className={inputClass} value={profile.linkedinUrl} onChange={(event) => update("linkedinUrl", event.target.value)} placeholder="https://www.linkedin.com/in/..." inputMode="url" /></Field>
                  <label className="cursor-pointer rounded-2xl border border-dashed border-violet-300/30 bg-violet-500/[0.06] px-5 py-4 text-center text-sm font-semibold text-violet-100 transition hover:bg-violet-500/[0.1]">
                    {linkedinImportState === "reading" ? "Importing LinkedIn profile…" : fileName && linkedinImportState === "ready" ? `Imported: ${fileName}` : "Upload LinkedIn profile PDF"}
                    <input type="file" accept=".pdf,application/pdf" className="sr-only" disabled={linkedinImportState === "reading"} onChange={(event) => { const file = event.target.files?.[0]; if (file) void readLinkedInProfilePdf(file); }} />
                  </label>
                </div>
                {linkedinImportMessage ? <p className={`mt-4 rounded-xl border px-4 py-3 text-sm ${linkedinImportState === "error" ? "border-rose-300/15 bg-rose-500/[0.07] text-rose-200" : "border-emerald-300/15 bg-emerald-500/[0.06] text-emerald-200"}`}>{linkedinImportMessage}</p> : null}
              </div>
              <aside className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">Import coverage</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">{(["fullName", "headline", "summary", "experience", "education", "skills", "certifications", "projects"] as ImportedProfileField[]).map((field) => {
                  const imported = linkedinImportResult?.fields[field];
                  return <div key={field} className={`rounded-xl border px-3 py-2 ${imported ? "border-emerald-300/15 bg-emerald-500/[0.05] text-emerald-200" : "border-white/8 text-slate-600"}`} title={imported ? `${imported.source} · ${imported.confidence} confidence` : "Needs review"}>{imported ? "✓" : "·"} {IMPORT_FIELD_LABELS[field]}</div>;
                })}</div>
                {linkedinImportState === "ready" && linkedinImportResult ? <p className={`mt-4 rounded-xl border px-3 py-2.5 text-xs leading-5 ${linkedinImportResult.reviewItems.length ? "border-amber-300/15 bg-amber-500/[0.05] text-amber-100/80" : "border-emerald-300/15 bg-emerald-500/[0.05] text-emerald-100/80"}`}>{linkedinImportResult.reviewItems.length ? `${linkedinImportResult.reviewItems.length} items need optional review. The rest are ready for analysis.` : "All core fields were detected. No form review is required."}</p> : null}
                <p className="mt-4 text-xs leading-5 text-slate-500">Nothing is discarded: even if a section is not recognized structurally, the full extracted LinkedIn profile text remains part of CV analysis.</p>
                {linkedinImportState === "ready" ? <button type="button" onClick={() => { setMode("builder"); setWizardStep(linkedinImportResult?.reviewItems.some((item) => item === "skills" || item === "certifications" || item === "projects") ? 3 : 1); }} className="mt-5 w-full rounded-xl border border-violet-300/20 bg-violet-500/[0.08] px-4 py-2.5 text-sm font-semibold text-violet-100 hover:bg-violet-500/[0.14]">Review imported fields (optional)</button> : null}
              </aside>
            </div>
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

        {mode !== "choose" ? <section className="mt-6 flex flex-col gap-4 rounded-3xl border border-violet-300/15 bg-violet-500/[0.055] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-display text-xl font-semibold">Run Career OS CV analysis</h2><p className="mt-1 text-sm text-slate-500">Career OS now scores detected CV sections, evidence, chronology and live-role alignment. External recruitment-engine scores will remain separately labeled when connected.</p></div><button type="button" onClick={runAnalysis} disabled={!readyToAnalyze} className="min-h-11 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-35">Analyze my CV</button></section> : null}

        {analysis ? <section id="cv-analysis-results" className="mt-8 scroll-mt-24" data-help-title="CV analysis results" data-help-description="This report scores detected CV sections and evidence, highlights strengths and gaps, and ranks live Career OS roles by evidence alignment with rough skill-gap estimates.">
          <article className="mb-5 rounded-3xl border border-cyan-300/20 bg-cyan-500/[0.05] p-5 sm:flex sm:items-center sm:justify-between sm:gap-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">Job Agent evidence bridge</p><h2 className="mt-2 font-display text-xl font-semibold">Use this analysis as sourced evidence</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">This is opt-in. It stores derived evidence excerpts with provenance for Job Agent and never overwrites profile skills, experience or languages.</p>{evidenceSaveMessage ? <p role="status" className={`mt-2 text-xs ${evidenceSaveState === "error" ? "text-rose-200" : "text-emerald-200"}`}>{evidenceSaveMessage}</p> : null}</div><button type="button" onClick={() => void saveEvidenceForJobAgent()} disabled={evidenceSaveState === "saving" || evidenceSaveState === "saved"} className="mt-4 min-h-11 shrink-0 rounded-xl bg-cyan-200 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50 sm:mt-0">{evidenceSaveState === "saving" ? "Saving…" : evidenceSaveState === "saved" ? "Evidence saved" : "Save evidence to Job Agent"}</button></article>
          {analysis.freshness && analysis.freshness.status !== "current" ? <article className="mb-5 rounded-3xl border border-amber-300/20 bg-amber-500/[0.06] p-5" data-help-title="CV freshness warning" data-help-description="Career recommendations depend on how current the dated experience in the uploaded CV is."><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-amber-300">CV freshness warning</p><h2 className="mt-2 font-display text-xl font-semibold text-amber-100">Your CV may not reflect your current profile</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-amber-100/75">{analysis.freshness.message}</p><button type="button" onClick={() => setShowRecentUpdate(true)} className="mt-4 rounded-xl border border-amber-200/25 bg-amber-200/10 px-4 py-2.5 text-sm font-semibold text-amber-50 transition hover:bg-amber-200/15">Update my recent experience</button></div><div className="shrink-0 rounded-2xl border border-amber-300/15 bg-black/10 px-4 py-3 text-xs text-amber-100/80"><span className="block text-amber-200">Recommendation confidence</span><strong className="mt-1 block text-base capitalize text-white">{analysis.freshness.recommendationConfidence}</strong></div></div></article> : null}
          {showRecentUpdate ? <article className="mb-5 rounded-3xl border border-violet-300/20 bg-[#0a0d20] p-5 sm:p-6" data-help-title="Recent experience update" data-help-description="Add only the roles, tools, achievements and projects missing from the uploaded CV. Career OS merges them into the analysis without rewriting the original file."><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-violet-300">Profile refresh</p><h2 className="mt-2 font-display text-xl font-semibold">Add what happened after your CV was last updated</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Only add information missing from the uploaded CV. This updates the Career OS analysis in this session; it does not overwrite your original file.</p></div><button type="button" onClick={() => setShowRecentUpdate(false)} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-400 hover:text-white">Cancel</button></div><div className="mt-6 grid gap-4 md:grid-cols-2"><Field label="Current / recent role"><input className={inputClass} value={recentExperience.role} onChange={(event) => setRecentExperience((current) => ({ ...current, role: event.target.value }))} placeholder="e.g. Fulfilment Operations Flow Planner" /></Field><Field label="Company"><input className={inputClass} value={recentExperience.company} onChange={(event) => setRecentExperience((current) => ({ ...current, company: event.target.value }))} placeholder="e.g. IKEA" /></Field><Field label="Start year"><input className={inputClass} inputMode="numeric" value={recentExperience.startYear} onChange={(event) => setRecentExperience((current) => ({ ...current, startYear: event.target.value.replace(/[^0-9]/g, "").slice(0, 4) }))} placeholder="2025" /></Field><div className="grid gap-2"><span className="text-sm font-medium text-slate-200">End date</span><label className="flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3.5 text-sm text-slate-300"><input type="checkbox" checked={recentExperience.current} onChange={(event) => setRecentExperience((current) => ({ ...current, current: event.target.checked }))} className="h-4 w-4 accent-violet-500" /> I currently work in this role</label>{!recentExperience.current ? <input className={inputClass} inputMode="numeric" value={recentExperience.endYear} onChange={(event) => setRecentExperience((current) => ({ ...current, endYear: event.target.value.replace(/[^0-9]/g, "").slice(0, 4) }))} placeholder="End year" /> : null}</div></div><div className="mt-4 grid gap-4"><Field label="Main responsibilities" hint="Focus on scope and what you actually own."><textarea className={areaClass} value={recentExperience.responsibilities} onChange={(event) => setRecentExperience((current) => ({ ...current, responsibilities: event.target.value }))} placeholder="Planning operational flow, analyzing KPIs, coordinating stakeholders..." /></Field><Field label="Key achievements" hint="Use numbers where possible: time saved, volume, cost, quality, adoption, teams or locations."><textarea className={areaClass} value={recentExperience.achievements} onChange={(event) => setRecentExperience((current) => ({ ...current, achievements: event.target.value }))} placeholder="Built a Power BI workflow used across 6 areas; reduced manual preparation by..." /></Field><div className="grid gap-4 md:grid-cols-2"><Field label="Tools and skills"><textarea className={areaClass} value={recentExperience.tools} onChange={(event) => setRecentExperience((current) => ({ ...current, tools: event.target.value }))} placeholder="Power BI, Power Automate, Copilot Studio, process analysis..." /></Field><Field label="Recent projects"><textarea className={areaClass} value={recentExperience.projects} onChange={(event) => setRecentExperience((current) => ({ ...current, projects: event.target.value }))} placeholder="Automation, analytics or transformation projects..." /></Field></div><Field label="New certifications (optional)"><textarea className={areaClass} value={recentExperience.certifications} onChange={(event) => setRecentExperience((current) => ({ ...current, certifications: event.target.value }))} /></Field></div><div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" disabled={!recentExperience.role.trim() || !recentExperience.company.trim() || !recentExperience.startYear.trim() || (!recentExperience.current && !recentExperience.endYear.trim())} onClick={applyRecentExperience} className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40">Save & re-analyze</button><span className="text-xs leading-5 text-slate-500">Required: role, company, start year and current/end status.</span></div></article> : null}
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <article className="rounded-3xl border border-violet-300/20 bg-[#0b0e22] p-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-violet-300">Career OS CV Score</p><div className="mt-4 flex items-end gap-3"><span className="font-display text-6xl font-bold">{analysis.overall}</span><span className="pb-2 text-lg text-slate-600">/100</span></div><p className="mt-3 text-sm font-semibold text-slate-200">{analysis.verdict}</p><p className="mt-3 text-xs leading-5 text-slate-600">Career OS semantic baseline · derived from extracted CV evidence, not presented as a Textkernel, Affinda, RChilli or employer ATS score.</p></article>
            <article className="rounded-3xl border border-white/10 bg-[#080b1c] p-6"><h2 className="font-display text-xl font-semibold">Score breakdown</h2><div className="mt-5 grid gap-4">{analysis.rows.map((row) => <div key={row.label}><div className="flex items-center justify-between gap-4 text-sm"><span className="font-medium text-slate-300">{row.label}</span><span className="font-bold text-white">{row.score}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-violet-400" style={{ width: `${row.score}%` }} /></div><p className="mt-1.5 text-xs text-slate-600">{row.note}</p></div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2"><article className="rounded-3xl border border-emerald-300/10 bg-emerald-500/[0.035] p-6"><h2 className="font-display text-xl font-semibold">Strengths</h2><ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-300">{analysis.strengths.map((item) => <li key={item} className="flex gap-3"><span className="text-emerald-300">✓</span><span>{item}</span></li>)}</ul></article><article className="rounded-3xl border border-amber-300/10 bg-amber-500/[0.035] p-6"><h2 className="font-display text-xl font-semibold">Priority gaps</h2>{analysis.gaps.length ? <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-300">{analysis.gaps.map((item) => <li key={item} className="flex gap-3"><span className="text-amber-300">→</span><span>{item}</span></li>)}</ul> : <p className="mt-4 text-sm leading-6 text-emerald-200/80">No priority CV gap was detected. Review the Career-specific evidence details below for optional improvements.</p>}</article></div>
          <article className="mt-5 rounded-3xl border border-white/10 bg-[#080b1c] p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-violet-300">{analysis.alignmentMode === "discovery" ? "Career discovery" : "Targeted analysis"}</p><h2 className="mt-2 font-display text-2xl font-semibold">{analysis.alignmentMode === "discovery" ? "Best-fit directions" : "Selected Career evidence"}</h2></div>
              <p className="text-xs text-slate-600">Gap-closing estimates adapt to {Math.max(1, Number(profile.weeklyHours) || 5)} learning hours/week and are not hiring-time predictions.</p>
            </div>
            <div className={`mt-5 grid gap-3 ${analysis.alignmentMode === "discovery" ? "md:grid-cols-3" : "md:grid-cols-1"}`}>
              {analysis.matches.map((match, index) => <CareerMatchCard key={match.careerSlug} match={match} index={index} alignmentMode={analysis.alignmentMode} />)}
            </div>
          </article>
          <article className="mt-5 rounded-3xl border border-violet-300/15 bg-violet-500/[0.055] p-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-violet-300">Next best actions</p><ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-300">{analysis.nextActions.map((item, index) => <li key={item} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-200">{index + 1}</span><span>{item}</span></li>)}</ol></article>
        </section> : null}
      </div>
    </main>
  );
}
