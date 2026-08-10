import type { ManagedCareer } from "@/types/adminStudio";

export type ContentQualityFinding = {
  code: "direct_youtube" | "duplicate_content";
  message: string;
};

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);
const MIN_DUPLICATE_TEXT_LENGTH = 140;
const DUPLICATE_SIMILARITY_THRESHOLD = 0.88;

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("en")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(value: string) {
  return new Set(normalizeText(value).split(" ").filter((token) => token.length > 2));
}

function similarity(left: string, right: string) {
  const a = tokenSet(left);
  const b = tokenSet(right);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  return intersection / Math.max(a.size, b.size);
}

function visit(value: unknown, path: string, strings: Array<{ path: string; value: string }>) {
  if (typeof value === "string") {
    strings.push({ path, value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => visit(item, `${path}[${index}]`, strings));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => visit(item, path ? `${path}.${key}` : key, strings));
  }
}

function stringsFrom(value: unknown) {
  const strings: Array<{ path: string; value: string }> = [];
  visit(value, "", strings);
  return strings;
}

function directYouTubeFindings(workspaceData: unknown): ContentQualityFinding[] {
  const findings: ContentQualityFinding[] = [];
  for (const entry of stringsFrom(workspaceData)) {
    if (!/^https?:\/\//i.test(entry.value.trim())) continue;
    try {
      const host = new URL(entry.value.trim()).hostname.toLocaleLowerCase("en");
      if (YOUTUBE_HOSTS.has(host)) findings.push({ code: "direct_youtube", message: `Direct YouTube learning/resource URL is not allowed by default: ${entry.path}. Replace it with an official or reputable provider source, or document an approved exception.` });
    } catch {
      // URL validity is handled by the content-specific editor/validator where applicable.
    }
  }
  return findings;
}

function substantialContent(value: unknown) {
  return stringsFrom(value)
    .filter((entry) => entry.value.trim().length >= MIN_DUPLICATE_TEXT_LENGTH)
    .filter((entry) => !/^https?:\/\//i.test(entry.value.trim()))
    .filter((entry) => !entry.path.toLocaleLowerCase("en").includes("disclaimer"));
}

function duplicateFindings(workspaceData: unknown, currentCareerId: string, careers: ManagedCareer[]): ContentQualityFinding[] {
  const current = substantialContent(workspaceData);
  const findings: ContentQualityFinding[] = [];
  const reported = new Set<string>();

  for (const other of careers) {
    if (other.id === currentCareerId || !other.workspace_data) continue;
    const otherContent = substantialContent(other.workspace_data);
    for (const left of current) {
      for (const right of otherContent) {
        const leftNormalized = normalizeText(left.value);
        const rightNormalized = normalizeText(right.value);
        const exact = leftNormalized === rightNormalized;
        const score = exact ? 1 : similarity(left.value, right.value);
        if (score < DUPLICATE_SIMILARITY_THRESHOLD) continue;
        const key = `${other.id}:${left.path}:${right.path}`;
        if (reported.has(key)) continue;
        reported.add(key);
        findings.push({
          code: "duplicate_content",
          message: `Highly similar user-facing content (${Math.round(score * 100)}%) found between ${left.path} and ${other.title} → ${right.path}. Rewrite it to be career-specific before publishing.`,
        });
        if (findings.length >= 20) return findings;
      }
    }
  }
  return findings;
}

export function evaluateContentQualityGate(input: {
  workspaceData: unknown;
  currentCareerId: string;
  careers: ManagedCareer[];
}) {
  const findings = [
    ...directYouTubeFindings(input.workspaceData),
    ...duplicateFindings(input.workspaceData, input.currentCareerId, input.careers),
  ];
  return {
    passed: findings.length === 0,
    findings,
    errors: findings.map((finding) => `[Quality Gate · ${finding.code}] ${finding.message}`),
  };
}
