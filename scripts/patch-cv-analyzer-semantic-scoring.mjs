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

if (!source.includes("CV freshness warning")) {
  const marker = '{analysis ? <section id="cv-analysis-results" className="mt-8 scroll-mt-24" data-help-title="CV analysis results" data-help-description="This report scores detected CV sections and evidence, highlights strengths and gaps, and ranks live Career OS roles by evidence alignment with rough skill-gap estimates.">';
  const replacement = `${marker}\n          {analysis.freshness && analysis.freshness.status !== "current" ? <article className="mb-5 rounded-3xl border border-amber-300/20 bg-amber-500/[0.06] p-5" data-help-title="CV freshness warning" data-help-description="Career recommendations depend on how current the dated experience in the uploaded CV is."><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-amber-300">CV freshness warning</p><h2 className="mt-2 font-display text-xl font-semibold text-amber-100">Your CV may not reflect your current profile</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-amber-100/75">{analysis.freshness.message}</p></div><div className="shrink-0 rounded-2xl border border-amber-300/15 bg-black/10 px-4 py-3 text-xs text-amber-100/80"><span className="block text-amber-200">Recommendation confidence</span><strong className="mt-1 block text-base capitalize text-white">{analysis.freshness.recommendationConfidence}</strong></div></div></article> : null}`;
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
  const freshnessHelpers = `function assessCVFreshness(experience: string, source: string): CVFreshness {\n  const currentYear = new Date().getUTCFullYear();\n  const experienceText = experience.trim() || source;\n  const hasCurrentRole = /(?:-|–|—|to)\\s*(?:present|current|now)\\b/i.test(experienceText);\n  const years = [...experienceText.matchAll(/\\b(?:19|20)\\d{2}\\b/g)]\n    .map((match) => Number(match[0]))\n    .filter((year) => year >= 1950 && year <= currentYear + 1);\n  const latestExperienceYear = years.length ? Math.max(...years) : null;\n\n  if (hasCurrentRole) {\n    return {\n      status: "current",\n      latestExperienceYear: currentYear,\n      ageYears: 0,\n      recommendationConfidence: "high",\n      message: "A current/present role is explicitly dated in the CV, so career recommendations can use the timeline with normal confidence.",\n    };\n  }\n\n  if (!latestExperienceYear) {\n    return {\n      status: "unknown",\n      latestExperienceYear: null,\n      ageYears: null,\n      recommendationConfidence: "low",\n      message: "Career OS could not identify a reliable recent year in the experience timeline. Update role dates before relying on career recommendations.",\n    };\n  }\n\n  const ageYears = Math.max(0, currentYear - latestExperienceYear);\n  if (ageYears <= 1) {\n    return { status: "current", latestExperienceYear, ageYears, recommendationConfidence: "high", message: `The most recent dated experience is ${latestExperienceYear}, which appears current enough for normal recommendation confidence.` };\n  }\n  if (ageYears === 2) {\n    return { status: "possibly-outdated", latestExperienceYear, ageYears, recommendationConfidence: "medium", message: `The most recent dated experience found is ${latestExperienceYear}. Career recommendations are based on this file and may miss changes from the last ${ageYears} years.` };\n  }\n  return {\n    status: "outdated",\n    latestExperienceYear,\n    ageYears,\n    recommendationConfidence: "low",\n    message: `The most recent dated experience found is ${latestExperienceYear}, about ${ageYears} years ago. Update your recent roles, responsibilities, tools and achievements before treating career recommendations as a current-profile assessment.`,\n  };\n}\n\n`;
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
    '  const firstGap = gaps[0] ?? "Tailor the strongest evidence to the role you want to pursue.";',
    '  const firstGap = gaps[0] ?? "Tailor the strongest evidence to the role you want to pursue.";',
  );
  semanticSource = semanticSource.replace(
    '    matches,\n  };',
    '    matches,\n    freshness,\n  };',
  );
}

fs.writeFileSync(target, source);
fs.writeFileSync(semanticTarget, semanticSource);
console.log("CV Analyzer semantic parser/scoring + freshness patch applied.");
