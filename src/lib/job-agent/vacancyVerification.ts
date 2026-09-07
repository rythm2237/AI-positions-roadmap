import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { CanonicalJobCandidate } from "./contracts";
import type { JobVerificationStatus } from "../../types/jobAgent";
import { safeExternalUrl } from "./normalization";

export type VacancyVerification = {
  status: JobVerificationStatus;
  job: CanonicalJobCandidate;
  provenance: Record<string, unknown>;
  errorCode?: string;
};

type JsonLdRecord = Record<string, unknown>;

function privateAddress(address: string): boolean {
  const normalized = address.toLowerCase().split("%")[0];
  if (isIP(normalized) === 4) {
    const [a, b] = normalized.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  if (isIP(normalized) === 6) {
    const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
    return Boolean(mapped && privateAddress(mapped)) || normalized === "::" || normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || /^fe[89ab]/.test(normalized) || normalized.startsWith("ff");
  }
  return true;
}

async function assertPublicResolution(hostname: string) {
  if (hostname === "localhost" || hostname.endsWith(".localhost")) throw new Error("VERIFICATION_HOST_PRIVATE");
  const records = await lookup(hostname, { all: true, verbatim: true });
  if (!records.length || records.some((record) => privateAddress(record.address))) throw new Error("VERIFICATION_HOST_RESOLVES_PRIVATE");
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function textFromHtml(html: string) {
  return decodeHtml(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPublic(urlValue: string, redirects = 0): Promise<{ response: Response; finalUrl: string }> {
  const safe = safeExternalUrl(urlValue);
  if (!safe) throw new Error("UNSAFE_VERIFICATION_URL");
  const url = new URL(safe);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("UNSAFE_VERIFICATION_PROTOCOL");
  await assertPublicResolution(url.hostname);
  const response = await fetch(url, {
    cache: "no-store",
    redirect: "manual",
    headers: { Accept: "text/html,application/ld+json,application/json", "User-Agent": "AI-Role-Path-Job-Verification/1.1" },
    signal: AbortSignal.timeout(8_000),
  });
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    if (redirects >= 3) throw new Error("TOO_MANY_VERIFICATION_REDIRECTS");
    const location = response.headers.get("location");
    if (!location) throw new Error("INVALID_VERIFICATION_REDIRECT");
    return fetchPublic(new URL(location, url).toString(), redirects + 1);
  }
  return { response, finalUrl: url.toString() };
}

function objectRecord(value: unknown): JsonLdRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonLdRecord : null;
}

function findJobPosting(value: unknown): JsonLdRecord | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findJobPosting(item);
      if (found) return found;
    }
    return null;
  }
  const record = objectRecord(value);
  if (!record) return null;
  const type = record["@type"];
  if (type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"))) return record;
  if (record["@graph"]) return findJobPosting(record["@graph"]);
  return null;
}

function extractJobPosting(html: string): JsonLdRecord | null {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const script of scripts) {
    try {
      const parsed = JSON.parse(decodeHtml(script[1]).trim());
      const found = findJobPosting(parsed);
      if (found) return found;
    } catch {
      // Malformed unrelated JSON-LD must not fail the whole verification.
    }
  }
  return null;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? textFromHtml(value).trim() : null;
}

function organizationName(value: unknown): string | null {
  const record = objectRecord(value);
  return stringValue(record?.name);
}

function locationFromPosting(value: unknown): { location: string | null; country: string | null } {
  const entries = Array.isArray(value) ? value : value ? [value] : [];
  for (const entry of entries) {
    const record = objectRecord(entry);
    const address = objectRecord(record?.address);
    if (!address) continue;
    const locality = stringValue(address.addressLocality);
    const region = stringValue(address.addressRegion);
    const countryRecord = objectRecord(address.addressCountry);
    const country = stringValue(address.addressCountry) ?? stringValue(countryRecord?.name);
    const location = [locality, region].filter(Boolean).join(", ") || country;
    if (location || country) return { location, country };
  }
  return { location: null, country: null };
}

function employmentTypes(value: unknown): string[] {
  const values = (Array.isArray(value) ? value : [value]).filter((item): item is string => typeof item === "string");
  const result = new Set<string>();
  for (const item of values) {
    const normalized = item.toLowerCase().replace(/[\s-]+/g, "_");
    if (normalized.includes("full_time")) result.add("full_time");
    else if (normalized.includes("part_time")) result.add("part_time");
    else if (normalized.includes("contract")) result.add("contract");
    else if (normalized.includes("temporary")) result.add("contract");
    else if (normalized.includes("intern")) result.add("internship");
    else if (normalized.includes("freelance")) result.add("freelance");
    else if (normalized.includes("permanent")) result.add("permanent");
  }
  return [...result];
}

function comparable(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function meaningfulConflict(existing: string | null, verified: string | null) {
  if (!existing || !verified) return false;
  const a = comparable(existing);
  const b = comparable(verified);
  return Boolean(a && b && !a.includes(b) && !b.includes(a));
}

export async function verifyVacancy(job: CanonicalJobCandidate): Promise<VacancyVerification> {
  if ((job.source.startsWith("Greenhouse:") || job.source.startsWith("Lever:")) && job.descriptionComplete) {
    return { status: "verified", job, provenance: { method: "official_provider_api", source: job.source, sourceUrl: job.sourceUrl, verifiedAt: new Date().toISOString() } };
  }
  const safe = safeExternalUrl(job.sourceUrl || job.applicationUrl);
  if (!safe) {
    return { status: "unverified", job, provenance: { method: "not_attempted", reason: "No safe source URL is available.", sourceUrl: job.sourceUrl }, errorCode: "UNSAFE_VERIFICATION_URL" };
  }
  try {
    const { response, finalUrl } = await fetchPublic(safe);
    if (response.status === 404 || response.status === 410) {
      return { status: "verified", job: { ...job, expiresAt: new Date().toISOString() }, provenance: { method: "source_page", httpStatus: response.status, sourceUrl: finalUrl, verifiedAt: new Date().toISOString(), fields: ["application_status"] } };
    }
    if (!response.ok) return { status: "failed", job, provenance: { method: "source_page", httpStatus: response.status, sourceUrl: finalUrl }, errorCode: `HTTP_${response.status}` };
    const size = Number(response.headers.get("content-length") ?? "0");
    if (size > 2_000_000) return { status: "failed", job, provenance: { method: "source_page", sourceUrl: finalUrl }, errorCode: "VERIFICATION_RESPONSE_TOO_LARGE" };
    const contentType = response.headers.get("content-type") ?? "";
    const body = (await response.text()).slice(0, 1_500_000);
    const pageText = contentType.includes("html") ? textFromHtml(body) : body;
    const posting = contentType.includes("html") ? extractJobPosting(body) : (() => { try { return findJobPosting(JSON.parse(body)); } catch { return null; } })();
    const looksClosed = /\b(job (?:is )?no longer available|position (?:has been )?filled|applications? closed|posting (?:has )?expired)\b/i.test(pageText);

    if (posting) {
      const title = stringValue(posting.title) ?? job.title;
      const company = organizationName(posting.hiringOrganization) ?? job.company;
      const verifiedLocation = locationFromPosting(posting.jobLocation);
      const description = stringValue(posting.description) ?? (pageText.length >= 300 ? pageText.slice(0, 120_000) : job.description);
      const postingUrl = stringValue(posting.url);
      const applicationUrl = safeExternalUrl(postingUrl ?? finalUrl) ?? job.applicationUrl;
      const verifiedEmploymentTypes = employmentTypes(posting.employmentType);
      const postedAt = stringValue(posting.datePosted) ?? job.postedAt;
      const expiresAt = looksClosed ? new Date().toISOString() : stringValue(posting.validThrough) ?? job.expiresAt;
      const companyConflict = meaningfulConflict(job.company, company) && !/not specified|employer not verified/i.test(job.company);
      const titleConflict = meaningfulConflict(job.title, title);
      const countryConflict = meaningfulConflict(job.country, verifiedLocation.country);
      if (companyConflict || titleConflict || countryConflict) {
        return {
          status: "failed",
          job: { ...job, expiresAt: looksClosed ? new Date().toISOString() : job.expiresAt },
          provenance: { method: "json_ld_jobposting", sourceUrl: finalUrl, verifiedAt: new Date().toISOString(), conflict: { company: companyConflict, title: titleConflict, country: countryConflict }, verified: { title, company, location: verifiedLocation.location, country: verifiedLocation.country } },
          errorCode: "CANONICAL_METADATA_CONFLICT",
        };
      }
      const verifiedJob: CanonicalJobCandidate = {
        ...job,
        title,
        company,
        location: verifiedLocation.location ?? job.location,
        country: verifiedLocation.country ?? job.country,
        sourceUrl: finalUrl,
        applicationUrl,
        description,
        descriptionComplete: description.length >= 300,
        employmentTypes: verifiedEmploymentTypes.length ? verifiedEmploymentTypes : job.employmentTypes,
        postedAt,
        expiresAt,
      };
      return {
        status: verifiedJob.descriptionComplete ? "verified" : "partially_verified",
        job: verifiedJob,
        provenance: { method: "json_ld_jobposting", httpStatus: response.status, contentType, sourceUrl: finalUrl, verifiedAt: new Date().toISOString(), fields: ["title", "company", "location", "country", "description", "employment_type", "posted_at", "expires_at", "application_url"] },
      };
    }

    const guidanceOrListing = /\b(how to become|career opportunities|\d+[+,]?\s+(?:open )?jobs?|job listings?|browse jobs?|find jobs?)\b/i.test(`${job.title} ${pageText.slice(0, 1200)}`);
    if (guidanceOrListing) {
      return { status: "failed", job, provenance: { method: "source_page", httpStatus: response.status, sourceUrl: finalUrl, verifiedAt: new Date().toISOString(), reason: "Page does not represent one canonical vacancy." }, errorCode: "NOT_CANONICAL_VACANCY" };
    }

    const description = pageText.length >= 300 ? pageText.slice(0, 120_000) : job.description;
    const verifiedJob = { ...job, sourceUrl: finalUrl, description, descriptionComplete: description.length >= 300, expiresAt: looksClosed ? new Date().toISOString() : job.expiresAt };
    return { status: verifiedJob.descriptionComplete ? "partially_verified" : "unverified", job: verifiedJob, provenance: { method: "source_page_text", httpStatus: response.status, contentType, sourceUrl: finalUrl, verifiedAt: new Date().toISOString(), fields: verifiedJob.descriptionComplete ? ["description", "application_status"] : ["application_status"] } };
  } catch (error) {
    const code = error instanceof Error ? error.message.slice(0, 120) : "VERIFICATION_FAILED";
    return { status: "failed", job, provenance: { method: "source_page", sourceUrl: safe, failedAt: new Date().toISOString() }, errorCode: code };
  }
}
