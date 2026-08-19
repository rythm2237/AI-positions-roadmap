import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "src/components/cv-analyzer/CVAnalyzerClient.tsx");
const semanticTarget = path.join(root, "src/lib/cvAnalyzer/semanticAnalysis.ts");
let source = fs.readFileSync(target, "utf8");
let semanticSource = fs.readFileSync(semanticTarget, "utf8");

const semanticImport = 'import { analyzeSemanticCV } from "@/lib/cvAnalyzer/semanticAnalysis";';
const catalogImport = 'import { AVAILABLE_CAREERS } from "@/data/careerCatalog";';

if (!source.includes(semanticImport)) {
  source = source.replace(
    'import { useMemo, useState } from "react";',
    `import { useMemo, useState } from "react";\n${semanticImport}\n${catalogImport}`,
  );
}

if (!source.includes("return analyzeSemanticCV(profile, rawText, AVAILABLE_CAREERS);")) {
  const start = source.indexOf("function clamp(value: number)");
  const end = source.indexOf("function Field(");
  if (start < 0 || end < 0 || end <= start) {
    throw new Error("CV Analyzer scoring signature changed; update semantic scoring patch.");
  }
  const replacement = `function analyze(profile: Profile, rawText: string): Analysis {\n  return analyzeSemanticCV(profile, rawText, AVAILABLE_CAREERS);\n}\n\n`;
  source = source.slice(0, start) + replacement + source.slice(end);
}

if (!source.includes("freshness?:")) {
  source = source.replace(
    '  matches: { title: string; match: number; weeks: string }[];\n};',
    '  matches: { title: string; match: number; weeks: string }[];\n  freshness?: { status: "current" | "possibly-outdated" | "outdated" | "unknown"; latestExperienceYear: number | null; ageYears: number | null; recommendationConfidence: "high" | "medium" | "low"; message: string };\n};',
  );
}

const replacements = [
  [
    "Professional parser + Career OS baseline scoring. Independent recruitment-engine benchmarking is the next integration layer.",
    "Professional parser + semantic section and evidence scoring. Independent recruitment-engine benchmarking remains a separate validation layer.",
  ],
  [
    'hint="Used for readiness-time estimates."',
    'hint="Used only for rough skill-gap closing estimates; it is not a hiring-time prediction."',
  ],
  [
    "Current score is a transparent Career OS baseline. Commercial recruitment-engine scores will remain separately labeled when connected.",
    "Career OS now scores detected CV sections, evidence, chronology and live-role alignment. External recruitment-engine scores will remain separately labeled when connected.",
  ],
  [
    "This report breaks the overall score into transparent dimensions, highlights evidence strengths and gaps, and suggests career matches with readiness estimates.",
    "This report scores detected CV sections and evidence, highlights strengths and gaps, and ranks live Career OS roles by evidence alignment with rough skill-gap estimates.",
  ],
  [
    "Baseline score · not presented as a Textkernel, Affinda, RChilli or employer ATS score.",
    "Career OS semantic baseline · derived from extracted CV evidence, not presented as a Textkernel, Affinda, RChilli or employer ATS score.",
  ],
  [
    "Readiness estimates adapt to {Math.max(1, Number(profile.weeklyHours) || 5)} learning hours/week.",
    "Gap-closing estimates adapt to {Math.max(1, Number(profile.weeklyHours) || 5)} learning hours/week and are not hiring-time predictions.",
  ],
  ["{match.match}% match", "{match.match}% evidence alignment"],
  ["Estimated readiness: {match.weeks}", "Gap-closing estimate: {match.weeks}"],
];

for (const [before, after] of replacements) {
  source = source.replace(before, after);
}

if (!source.includes("recentExperience, setRecentExperience")) {
  source = source.replace(
    '  const [analysis, setAnalysis] = useState<Analysis | null>(null);',
    '  const [analysis, setAnalysis] = useState<Analysis | null>(null);\n  const [showRecentUpdate, setShowRecentUpdate] = useState(false);\n  const [recentExperience, setRecentExperience] = useState({ role: "", company: "", startYear: "", current: true, endYear: "", responsibilities: "", tools: "", achievements: "", projects: "", certifications: "" });',
  );
}

if (!source.includes("function applyRecentExperience")) {
  const marker = '  function runAnalysis() {\n    if (!readyToAnalyze) return;\n    setAnalysis(analyze(profile, rawText));\n    window.setTimeout(() => document.querySelector("#cv-analysis-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);\n  }';
  const replacement = marker + '\n\n  function applyRecentExperience() {\n    const role = recentExperience.role.trim();\n    const company = recentExperience.company.trim();\n    const startYear = recentExperience.startYear.trim();\n    if (!role || !company || !startYear) return;\n\n    const endLabel = recentExperience.current ? "Present" : recentExperience.endYear.trim();\n    const dateLabel = endLabel ? startYear + " - " + endLabel : startYear;\n    const detailLines = [recentExperience.responsibilities.trim(), recentExperience.achievements.trim()]\n      .filter(Boolean)\n      .map((value) => "- " + value.replace(/\\n+/g, "\\n- "));\n    const experienceBlock = [role + " | " + company + " | " + dateLabel, ...detailLines].join("\\n");\n\n    const nextProfile: Profile = {\n      ...profile,\n      experience: [profile.experience.trim(), experienceBlock].filter(Boolean).join("\\n\\n"),\n      skills: [profile.skills.trim(), recentExperience.tools.trim()].filter(Boolean).join(", "),\n      projects: [profile.projects.trim(), recentExperience.projects.trim()].filter(Boolean).join("\\n\\n"),\n      certifications: [profile.certifications.trim(), recentExperience.certifications.trim()].filter(Boolean).join("\\n"),\n    };\n\n    setProfile(nextProfile);\n    setAnalysis(analyze(nextProfile, rawText));\n    setShowRecentUpdate(false);\n    setRecentExperience({ role: "", company: "", startYear: "", current: true, endYear: "", responsibilities: "", tools: "", achievements: "", projects: "", certifications: "" });\n    window.setTimeout(() => document.querySelector("#cv-analysis-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);\n  }';
  if (!source.includes(marker)) throw new Error("runAnalysis marker changed; update recent experience flow patch.");
  source = source.replace(marker, replacement);
}

if (!source.includes("CV freshness warning")) {
  const marker = '{analysis ? <section id="cv-analysis-results" className="mt-8 scroll-mt-24" data-help-title="CV analysis results" data-help-description="This report scores detected CV sections and evidence, highlights strengths and gaps, and ranks live Career OS roles by evidence alignment with rough skill-gap estimates.">';
  const replacement = marker + '\n          {analysis.freshness && analysis.freshness.status !== "current" ? <article className="mb-5 rounded-3xl border border-amber-300/20 bg-amber-500/[0.06] p-5" data-help-title="CV freshness warning" data-help-description="Career recommendations depend on how current the dated experience in the uploaded CV is."><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-amber-300">CV freshness warning</p><h2 className="mt-2 font-display text-xl font-semibold text-amber-100">Your CV may not reflect your current profile</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-amber-100/75">{analysis.freshness.message}</p><button type="button" onClick={() => setShowRecentUpdate(true)} className="mt-4 rounded-xl border border-amber-200/25 bg-amber-200/10 px-4 py-2.5 text-sm font-semibold text-amber-50 transition hover:bg-amber-200/15">Update my recent experience</button></div><div className="shrink-0 rounded-2xl border border-amber-300/15 bg-black/10 px-4 py-3 text-xs text-amber-100/80"><span className="block text-amber-200">Recommendation confidence</span><strong className="mt-1 block text-base capitalize text-white">{analysis.freshness.recommendationConfidence}</strong></div></div></article> : null}\n          {showRecentUpdate ? <article className="mb-5 rounded-3xl border border-violet-300/20 bg-[#0a0d20] p-5 sm:p-6" data-help-title="Recent experience update" data-help-description="Add only the roles, tools, achievements and projects missing from the uploaded CV. Career OS merges them into the analysis without rewriting the original file."><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-violet-300">Profile refresh</p><h2 className="mt-2 font-display text-xl font-semibold">Add what happened after your CV was last updated</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Only add information missing from the uploaded CV. This updates the Career OS analysis in this session; it does not overwrite your original file.</p></div><button type="button" onClick={() => setShowRecentUpdate(false)} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-400 hover:text-white">Cancel</button></div><div className="mt-6 grid gap-4 md:grid-cols-2"><Field label="Current / recent role"><input className={inputClass} value={recentExperience.role} onChange={(event) => setRecentExperience((current) => ({ ...current, role: event.target.value }))} placeholder="e.g. Fulfilment Operations Flow Planner" /></Field><Field label="Company"><input className={inputClass} value={recentExperience.company} onChange={(event) => setRecentExperience((current) => ({ ...current, company: event.target.value }))} placeholder="e.g. IKEA" /></Field><Field label="Start year"><input className={inputClass} inputMode="numeric" value={recentExperience.startYear} onChange={(event) => setRecentExperience((current) => ({ ...current, startYear: event.target.value.replace(/[^0-9]/g, "").slice(0, 4) }))} placeholder="2025" /></Field><div className="grid gap-2"><span className="text-sm font-medium text-slate-200">End date</span><label className="flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3.5 text-sm text-slate-300"><input type="checkbox" checked={recentExperience.current} onChange={(event) => setRecentExperience((current) => ({ ...current, current: event.target.checked }))} className="h-4 w-4 accent-violet-500" /> I currently work in this role</label>{!recentExperience.current ? <input className={inputClass} inputMode="numeric" value={recentExperience.endYear} onChange={(event) => setRecentExperience((current) => ({ ...current, endYear: event.target.value.replace(/[^0-9]/g, "").slice(0, 4) }))} placeholder="End year" /> : null}</div></div><div className="mt-4 grid gap-4"><Field label="Main responsibilities" hint="Focus on scope and what you actually own."><textarea className={areaClass} value={recentExperience.responsibilities} onChange={(event) => setRecentExperience((current) => ({ ...current, responsibilities: event.target.value }))} placeholder="Planning operational flow, analyzing KPIs, coordinating stakeholders..." /></Field><Field label="Key achievements" hint="Use numbers where possible: time saved, volume, cost, quality, adoption, teams or locations."><textarea className={areaClass} value={recentExperience.achievements} onChange={(event) => setRecentExperience((current) => ({ ...current, achievements: event.target.value }))} placeholder="Built a Power BI workflow used across 6 areas; reduced manual preparation by..." /></Field><div className="grid gap-4 md:grid-cols-2"><Field label="Tools and skills"><textarea className={areaClass} value={recentExperience.tools} onChange={(event) => setRecentExperience((current) => ({ ...current, tools: event.target.value }))} placeholder="Power BI, Power Automate, Copilot Studio, process analysis..." /></Field><Field label="Recent projects"><textarea className={areaClass} value={recentExperience.projects} onChange={(event) => setRecentExperience((current) => ({ ...current, projects: event.target.value }))} placeholder="Automation, analytics or transformation projects..." /></Field></div><Field label="New certifications (optional)"><textarea className={areaClass} value={recentExperience.certifications} onChange={(event) => setRecentExperience((current) => ({ ...current, certifications: event.target.value }))} /></Field></div><div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" disabled={!recentExperience.role.trim() || !recentExperience.company.trim() || !recentExperience.startYear.trim() || (!recentExperience.current && !recentExperience.endYear.trim())} onClick={applyRecentExperience} className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40">Save & re-analyze</button><span className="text-xs leading-5 text-slate-500">Required: role, company, start year and current/end status.</span></div></article> : null}';
  if (!source.includes(marker)) throw new Error("CV analysis results marker changed; update freshness UI patch.");
  source = source.replace(marker, replacement);
}

semanticSource = semanticSource.replace(
  '/\\b\\d+(?:\\.\\d+)?\\s*%\\b/g,',
  '/\\b\\d+(?:\\.\\d+)?\\s*%/g,',
);
semanticSource = semanticSource.replace(
  '"lead time", "utilization", "utilisation", "availability", "reliability", "compliance", "risk reduction",',
  '"lead time", "utilization", "utilisation", "availability", "reliability", "compliance", "risk reduction", "reduced", "increased", "improved", "accelerated",',
);
semanticSource = semanticSource.replace(
  'reports?|dashboards?|sites?|locations?|countries?|minutes?|seconds?',
  'reports?|dashboards?|sites?|locations?|areas?|items?|orders?|articles?|countries?|minutes?|seconds?',
);

if (!semanticSource.includes("freshness: CVFreshness")) {
  semanticSource = semanticSource.replace(
    'export type SemanticCVAnalysis = {\n',
    'export type CVFreshness = {\n  status: "current" | "possibly-outdated" | "outdated" | "unknown";\n  latestExperienceYear: number | null;\n  ageYears: number | null;\n  recommendationConfidence: "high" | "medium" | "low";\n  message: string;\n};\n\nexport type SemanticCVAnalysis = {\n',
  );
  semanticSource = semanticSource.replace(
    '  matches: { title: string; match: number; weeks: string }[];\n};',
    '  matches: { title: string; match: number; weeks: string }[];\n  freshness: CVFreshness;\n};',
  );
}

if (!semanticSource.includes("function assessCVFreshness")) {
  const marker = 'function gapClosingEstimate(career: CareerReference, source: string, weeklyHours: number, alignment: number) {';
  const freshnessHelpers = `function assessCVFreshness(experience: string, source: string): CVFreshness {\n  const currentYear = new Date().getUTCFullYear();\n  const experienceText = experience.trim() || source;\n  const hasCurrentRole = /(?:-|–|—|to)\\s*(?:present|current|now)\\b/i.test(experienceText);\n  const years = [...experienceText.matchAll(/\\b(?:19|20)\\d{2}\\b/g)]\n    .map((match) => Number(match[0]))\n    .filter((year) => year >= 1950 && year <= currentYear + 1);\n  const latestExperienceYear = years.length ? Math.max(...years) : null;\n\n  if (hasCurrentRole) {\n    return {\n      status: "current",\n      latestExperienceYear: currentYear,\n      ageYears: 0,\n      recommendationConfidence: "high",\n      message: "A current/present role is explicitly dated in the CV, so career recommendations can use the timeline with normal confidence.",\n    };\n  }\n\n  if (!latestExperienceYear) {\n    return {\n      status: "unknown",\n      latestExperienceYear: null,\n      ageYears: null,\n      recommendationConfidence: "low",\n      message: "Career OS could not identify a reliable recent year in the experience timeline. Update role dates before relying on career recommendations.",\n    };\n  }\n\n  const ageYears = Math.max(0, currentYear - latestExperienceYear);\n  if (ageYears <= 1) {\n    return { status: "current", latestExperienceYear, ageYears, recommendationConfidence: "high", message: "The most recent dated experience is " + latestExperienceYear + ", which appears current enough for normal recommendation confidence." };\n  }\n  if (ageYears === 2) {\n    return { status: "possibly-outdated", latestExperienceYear, ageYears, recommendationConfidence: "medium", message: "The most recent dated experience found is " + latestExperienceYear + ". Career recommendations are based on this file and may miss changes from the last " + ageYears + " years." };\n  }\n  return {\n    status: "outdated",\n    latestExperienceYear,\n    ageYears,\n    recommendationConfidence: "low",\n    message: "The most recent dated experience found is " + latestExperienceYear + ", about " + ageYears + " years ago. Update your recent roles, responsibilities, tools and achievements before treating career recommendations as a current-profile assessment.",\n  };\n}\n\n`;
  if (!semanticSource.includes(marker)) throw new Error("Gap estimate marker changed; update freshness semantic patch.");
  semanticSource = semanticSource.replace(marker, freshnessHelpers + marker);
}

if (!semanticSource.includes("const freshness = assessCVFreshness")) {
  semanticSource = semanticSource.replace(
    '  const evidenceText = `${experience}\\n${projects}`.trim() || source;\n',
    '  const evidenceText = `${experience}\\n${projects}`.trim() || source;\n  const freshness = assessCVFreshness(experience, source);\n',
  );
  semanticSource = semanticSource.replace(
    '  if (structureScore < 70) gaps.push("Make Summary, Experience, Skills and Education explicit and consistently headed so recruiters can locate them quickly.");',
    '  if (freshness.status === "outdated" || freshness.status === "unknown") gaps.push(freshness.message);\n  else if (freshness.status === "possibly-outdated") gaps.push(freshness.message);\n  if (structureScore < 70) gaps.push("Make Summary, Experience, Skills and Education explicit and consistently headed so recruiters can locate them quickly.");',
  );
  semanticSource = semanticSource.replace(
    '    matches,\n  };',
    '    matches,\n    freshness,\n  };',
  );
}

if (!source.includes("Update my recent experience") || !source.includes("function applyRecentExperience")) {
  throw new Error("Recent experience refresh flow was not applied to CV Analyzer UI.");
}

fs.writeFileSync(target, source);
fs.writeFileSync(semanticTarget, semanticSource);
console.log("CV Analyzer semantic scoring, freshness and recent-experience refresh flow applied.");
