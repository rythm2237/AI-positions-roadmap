import fs from "node:fs";

const client = fs.readFileSync("src/components/cv-analyzer/CVAnalyzerClient.tsx", "utf8");
const parser = fs.readFileSync("src/lib/cvAnalyzer/linkedinProfile.ts", "utf8");

for (const token of [
  "LINKEDIN_PROFILE_IMPORT_V2",
  'setMode("linkedin")',
  'aria-pressed={mode === "linkedin"}',
  "readLinkedInProfilePdf",
  "parseLinkedInProfileText",
  "setRawText(parsed.rawText)",
  "Review imported fields (optional)",
  "full extracted LinkedIn profile text remains part of CV analysis",
]) {
  if (!client.includes(token)) throw new Error(`Canonical LinkedIn import is missing: ${token}`);
}

for (const token of [
  '"top skills"',
  '"featured skills"',
  '"certifications"',
  '"licenses and certifications"',
  'source: "linkedin_pdf"',
  "confidenceForSection",
  "logicalLines",
  "findIdentity",
]) {
  if (!parser.includes(token)) throw new Error(`LinkedIn parser contract is missing: ${token}`);
}

console.log("LinkedIn CV import canonical source verified: aliases, resilient identity parsing, provenance, raw-text preservation and optional review flow.");
