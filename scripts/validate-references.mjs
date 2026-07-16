import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "content/references/reference-catalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const errors = [];
const warnings = [];
const ids = new Set();
const required = ["id","title","provider","description","type","canonicalUrl","status","lastVerifiedAt","reviewIntervalDays","nextReviewAt"];

for (const item of catalog) {
  for (const field of required) if (item[field] === undefined || item[field] === "") errors.push(`${item.id ?? "unknown"}: missing ${field}`);
  if (ids.has(item.id)) errors.push(`duplicate reference id: ${item.id}`); ids.add(item.id);
  try { new URL(item.canonicalUrl); } catch { errors.push(`${item.id}: invalid URL`); }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.lastVerifiedAt) || Number.isNaN(Date.parse(item.lastVerifiedAt))) errors.push(`${item.id}: invalid lastVerifiedAt`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.nextReviewAt) || Number.isNaN(Date.parse(item.nextReviewAt))) errors.push(`${item.id}: invalid nextReviewAt`);
  if (!Number.isInteger(item.reviewIntervalDays) || item.reviewIntervalDays <= 0) errors.push(`${item.id}: invalid reviewIntervalDays`);
  if (Date.parse(item.nextReviewAt) < Date.now()) warnings.push(`${item.id}: review overdue (${item.nextReviewAt})`);
  const segmentIds = new Set(); for (const segment of item.segments ?? []) { if (!segment.id) errors.push(`${item.id}: segment missing id`); if (segmentIds.has(segment.id)) errors.push(`${item.id}: duplicate segment ${segment.id}`); segmentIds.add(segment.id); }
  if (item.replacedBy && !catalog.some((candidate) => candidate.id === item.replacedBy)) errors.push(`${item.id}: unknown replacedBy ${item.replacedBy}`);
}

for (const item of catalog) {
  const seen = new Set([item.id]); let next = item.replacedBy;
  while (next) { if (seen.has(next)) { errors.push(`${item.id}: circular replacement chain`); break; } seen.add(next); next = catalog.find((candidate) => candidate.id === next)?.replacedBy; }
}

const careerSource = fs.readFileSync(path.join(root, "src/data/careers/ai-engineer.ts"), "utf8");
for (const match of careerSource.matchAll(/resources:\s*\[([^\]]*)\]/gs)) for (const ref of match[1].matchAll(/officialResources\.([A-Za-z0-9]+)/g)) {
  const keyMap = { openaiDocs:"journey-openai-docs", huggingFaceDocs:"journey-hf-docs", microsoftLearn:"journey-ms-learn-ai", googleSkills:"journey-gcp-skills", awsSkillBuilder:"journey-aws-skillbuilder", ibmSkillsBuild:"journey-ibm-skillsbuild", deepLearningPrompting:"journey-dlai-prompting", deepLearningMlops:"journey-dlai-mlops", freeCodeCampPython:"journey-fcc-python", githubDocs:"journey-github-docs", anthropicDocs:"journey-anthropic-docs", googleAiDocs:"journey-google-ai-docs" };
  if (!ids.has(keyMap[ref[1]])) errors.push(`career step references unknown Registry key: ${ref[1]}`);
}

warnings.forEach((warning) => console.warn(`warning: ${warning}`));
if (errors.length) { errors.forEach((error) => console.error(`error: ${error}`)); process.exit(1); }
console.log(`Reference Registry valid: ${catalog.length} resources, ${warnings.length} review warning(s).`);
