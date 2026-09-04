import { createHash } from "node:crypto";
import type { CanonicalJobCandidate } from "./contracts.ts";
import type { JobFreshnessStatus } from "../../types/jobAgent.ts";

const TRACKING_PARAMS = /^(utm_|gclid$|fbclid$|ref$|referrer$|source$|src$|trk$|tracking)/i;

export function normalizeJobText(value: string | null | undefined) {
  return (value ?? "").normalize("NFKC").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9+#.]+/g, " ").replace(/\s+/g, " ").trim();
}

export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return null;
    if (/^(?:127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(host)) return null;
    if (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function canonicalizeJobUrl(value: string) {
  const safe = safeExternalUrl(value);
  if (!safe) return null;
  const url = new URL(safe);
  for (const key of [...url.searchParams.keys()]) if (TRACKING_PARAMS.test(key)) url.searchParams.delete(key);
  url.hash = "";
  url.hostname = url.hostname.toLowerCase();
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  url.searchParams.sort();
  return url.toString();
}

export function canonicalJobKey(input: Pick<CanonicalJobCandidate, "title" | "company" | "country" | "location" | "applicationUrl">) {
  const canonicalUrl = canonicalizeJobUrl(input.applicationUrl);
  const identity = canonicalUrl
    ? `url|${canonicalUrl}`
    : [input.company, input.title, input.country, input.location].map(normalizeJobText).join("|");
  return createHash("sha256").update(identity).digest("hex");
}

function quality(job: CanonicalJobCandidate) {
  return (job.descriptionComplete ? 1000 : 0) + job.description.length + (job.applicationUrl === job.sourceUrl ? 0 : 50);
}

export function deduplicateJobs(jobs: CanonicalJobCandidate[]) {
  const byKey = new Map<string, CanonicalJobCandidate>();
  for (const candidate of jobs) {
    const applicationUrl = canonicalizeJobUrl(candidate.applicationUrl);
    const sourceUrl = canonicalizeJobUrl(candidate.sourceUrl);
    if (!applicationUrl || !sourceUrl) continue;
    const normalized = { ...candidate, applicationUrl, sourceUrl, normalizedTitle: normalizeJobText(candidate.title) };
    const key = canonicalJobKey(normalized);
    normalized.canonicalKey = key;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...normalized, sourceQueries: [...new Set([candidate.sourceQuery, ...candidate.sourceQueries])].filter(Boolean), sources: candidate.sources });
      continue;
    }
    const preferred = quality(normalized) > quality(existing) ? normalized : existing;
    byKey.set(key, {
      ...preferred,
      canonicalKey: key,
      sourceQueries: [...new Set([...existing.sourceQueries, existing.sourceQuery, ...normalized.sourceQueries, normalized.sourceQuery])].filter(Boolean),
      sources: [...new Map([...existing.sources, ...normalized.sources].map((source) => [`${source.provider}|${source.sourceUrl}|${source.sourceQuery}`, source])).values()],
    });
  }
  return [...byKey.values()];
}

export function assessFreshness(job: Pick<CanonicalJobCandidate, "postedAt" | "expiresAt">, now = new Date()): { status: JobFreshnessStatus; reason: string | null } {
  const expiresAt = job.expiresAt ? Date.parse(job.expiresAt) : Number.NaN;
  if (Number.isFinite(expiresAt) && expiresAt <= now.getTime()) return { status: "expired", reason: "The provider expiration timestamp has passed." };
  const postedAt = job.postedAt ? Date.parse(job.postedAt) : Number.NaN;
  if (!Number.isFinite(postedAt)) return { status: "unknown", reason: "The posting date is unavailable." };
  const ageDays = (now.getTime() - postedAt) / 86_400_000;
  if (ageDays > 60) return { status: "stale", reason: `The listing is approximately ${Math.floor(ageDays)} days old.` };
  return { status: "fresh", reason: null };
}
