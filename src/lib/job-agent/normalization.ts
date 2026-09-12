import { createHash } from "node:crypto";
import type { CanonicalJobCandidate } from "./contracts.ts";
import { parseProviderPostedAt } from "./providerFields.ts";
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
  let safe = safeExternalUrl(value);
  if (!safe) return null;
  let url = new URL(safe);
  const wrapper = /(^|\.)google\.[a-z.]+$/.test(url.hostname) && url.pathname === "/url"
    ? url.searchParams.get("url") ?? url.searchParams.get("q")
    : /(^|\.)(?:serpapi\.com|googleusercontent\.com)$/.test(url.hostname)
      ? url.searchParams.get("url") ?? url.searchParams.get("target")
      : null;
  if (wrapper) {
    safe = safeExternalUrl(wrapper);
    if (safe) url = new URL(safe);
  }
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
  let sourceScore = 0;
  try {
    const host = new URL(job.applicationUrl).hostname.toLowerCase();
    const trustedAts = /(?:greenhouse\.io|lever\.co|myworkdayjobs\.com|amazon\.jobs|careers\.microsoft\.com)$/.test(host);
    const aggregator = /(?:linkedin\.com|indeed\.|adzuna\.|google\.)/.test(host);
    sourceScore = trustedAts ? 500 : aggregator ? -100 : 100;
  } catch {
    sourceScore = -500;
  }
  return (job.descriptionComplete ? 1000 : 0) + Math.min(job.description.length, 10_000) + sourceScore + (job.source.startsWith("Greenhouse:") || job.source.startsWith("Lever:") ? 500 : 0);
}

export function jobDescriptionFingerprint(value: string) {
  const normalized = normalizeJobText(value).split(" ").filter((token) => token.length > 2).slice(0, 240).join(" ");
  return normalized.length >= 160 ? createHash("sha256").update(normalized).digest("hex") : null;
}

function sameSourceIdentity(left: CanonicalJobCandidate, right: CanonicalJobCandidate) {
  return left.sources.some((a) => right.sources.some((b) => a.provider === b.provider && a.sourceJobId && a.sourceJobId === b.sourceJobId));
}

function conservativeCrossSourceIdentity(left: CanonicalJobCandidate, right: CanonicalJobCandidate) {
  if (normalizeJobText(left.company) !== normalizeJobText(right.company) || normalizeJobText(left.title) !== normalizeJobText(right.title)) return false;
  const leftLocation = normalizeJobText(left.location ?? left.country);
  const rightLocation = normalizeJobText(right.location ?? right.country);
  if (!leftLocation || !rightLocation || leftLocation !== rightLocation) return false;
  const leftDay = left.postedAt?.slice(0, 10);
  const rightDay = right.postedAt?.slice(0, 10);
  if (leftDay && rightDay && leftDay === rightDay) return true;
  const leftFingerprint = jobDescriptionFingerprint(left.description);
  return Boolean(leftFingerprint && leftFingerprint === jobDescriptionFingerprint(right.description));
}

export function deduplicateJobs(jobs: CanonicalJobCandidate[], now = new Date()) {
  const deduplicated: CanonicalJobCandidate[] = [];
  for (const candidate of jobs) {
    const applicationUrl = canonicalizeJobUrl(candidate.applicationUrl);
    const sourceUrl = canonicalizeJobUrl(candidate.sourceUrl);
    if (!applicationUrl || !sourceUrl) continue;
    const normalized = {
      ...candidate,
      company: candidate.company.trim(),
      companyNormalized: normalizeJobText(candidate.company),
      applicationUrl,
      sourceUrl,
      normalizedTitle: normalizeJobText(candidate.title),
      // Provider payloads can expose human-readable values such as "4 days ago".
      // Convert them before freshness checks and before writing to timestamptz columns.
      postedAt: parseProviderPostedAt(candidate.postedAt, now),
      expiresAt: parseProviderPostedAt(candidate.expiresAt, now),
    };

    // Expired vacancies are removed at the earliest canonicalization boundary. They never
    // enter verification, eligibility, ranking, persistence, dashboard counts or user UI.
    const expiration = normalized.expiresAt ? Date.parse(normalized.expiresAt) : Number.NaN;
    if (Number.isFinite(expiration) && expiration <= now.getTime()) continue;

    normalized.canonicalKey = canonicalJobKey(normalized);
    const existingIndex = deduplicated.findIndex((existing) => existing.canonicalKey === normalized.canonicalKey || sameSourceIdentity(existing, normalized) || conservativeCrossSourceIdentity(existing, normalized));
    const existing = existingIndex >= 0 ? deduplicated[existingIndex] : undefined;
    if (!existing) {
      deduplicated.push({ ...normalized, sourceQueries: [...new Set([candidate.sourceQuery, ...candidate.sourceQueries])].filter(Boolean), sources: candidate.sources });
      continue;
    }
    const preferred = quality(normalized) > quality(existing) ? normalized : existing;
    const merged = {
      ...preferred,
      sourceQueries: [...new Set([...existing.sourceQueries, existing.sourceQuery, ...normalized.sourceQueries, normalized.sourceQuery])].filter(Boolean),
      sources: [...new Map([...existing.sources, ...normalized.sources].map((source) => [`${source.provider}|${source.sourceUrl}|${source.sourceQuery}`, source])).values()],
    };
    merged.canonicalKey = canonicalJobKey(merged);
    deduplicated[existingIndex] = merged;
  }
  return deduplicated;
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
