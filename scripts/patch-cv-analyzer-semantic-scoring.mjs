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

fs.writeFileSync(target, source);
fs.writeFileSync(semanticTarget, semanticSource);
console.log("CV Analyzer semantic parser/scoring patch applied.");
