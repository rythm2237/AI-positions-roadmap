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

const configuredHosts = () => (process.env.JOB_AGENT_VERIFICATION_HOSTS ?? "").split(",").map((host) => host.trim().toLowerCase()).filter((host) => /^[a-z0-9.-]+$/.test(host)).slice(0, 30);
const officialHosts = ["boards.greenhouse.io", "job-boards.greenhouse.io", "boards-api.greenhouse.io", "jobs.lever.co", "api.lever.co"];

function allowedHost(host: string) {
  return [...officialHosts, ...configuredHosts()].some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

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
  const records = await lookup(hostname, { all: true, verbatim: true });
  if (!records.length || records.some((record) => privateAddress(record.address))) throw new Error("VERIFICATION_HOST_RESOLVES_PRIVATE");
}

function textFromHtml(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
}

async function fetchAllowed(urlValue: string, redirects = 0): Promise<Response> {
  const safe = safeExternalUrl(urlValue);
  if (!safe) throw new Error("UNSAFE_VERIFICATION_URL");
  const url = new URL(safe);
  if (!allowedHost(url.hostname.toLowerCase())) throw new Error("VERIFICATION_HOST_NOT_ALLOWLISTED");
  await assertPublicResolution(url.hostname);
  const response = await fetch(url, { cache: "no-store", redirect: "manual", headers: { Accept: "text/html,application/json", "User-Agent": "AI-Role-Path-Job-Verification/1.0" }, signal: AbortSignal.timeout(7_000) });
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    if (redirects >= 2) throw new Error("TOO_MANY_VERIFICATION_REDIRECTS");
    const location = response.headers.get("location");
    if (!location) throw new Error("INVALID_VERIFICATION_REDIRECT");
    return fetchAllowed(new URL(location, url).toString(), redirects + 1);
  }
  return response;
}

export async function verifyVacancy(job: CanonicalJobCandidate): Promise<VacancyVerification> {
  if ((job.source.startsWith("Greenhouse:") || job.source.startsWith("Lever:")) && job.descriptionComplete) {
    return { status: "verified", job, provenance: { method: "official_provider_api", source: job.source, sourceUrl: job.sourceUrl, verifiedAt: new Date().toISOString() } };
  }
  const safe = safeExternalUrl(job.sourceUrl);
  if (!safe || !allowedHost(new URL(safe).hostname.toLowerCase())) {
    return { status: "unverified", job, provenance: { method: "not_attempted", reason: "Source host is not in the verification allowlist.", sourceUrl: job.sourceUrl }, errorCode: "VERIFICATION_HOST_NOT_ALLOWLISTED" };
  }
  try {
    const response = await fetchAllowed(safe);
    if (response.status === 404 || response.status === 410) return { status: "verified", job: { ...job, expiresAt: new Date().toISOString() }, provenance: { method: "source_page", httpStatus: response.status, sourceUrl: safe, verifiedAt: new Date().toISOString() } };
    if (!response.ok) return { status: "failed", job, provenance: { method: "source_page", httpStatus: response.status, sourceUrl: safe }, errorCode: `HTTP_${response.status}` };
    const size = Number(response.headers.get("content-length") ?? "0");
    if (size > 2_000_000) return { status: "failed", job, provenance: { method: "source_page", sourceUrl: safe }, errorCode: "VERIFICATION_RESPONSE_TOO_LARGE" };
    const contentType = response.headers.get("content-type") ?? "";
    const body = (await response.text()).slice(0, 1_500_000);
    const description = contentType.includes("json") ? body : textFromHtml(body);
    const looksClosed = /\b(job (?:is )?no longer available|position (?:has been )?filled|applications? closed|posting (?:has )?expired)\b/i.test(description);
    const verifiedJob = { ...job, description: description.length >= 300 ? description.slice(0, 120_000) : job.description, descriptionComplete: description.length >= 300, expiresAt: looksClosed ? new Date().toISOString() : job.expiresAt };
    return { status: verifiedJob.descriptionComplete ? "partially_verified" : "unverified", job: verifiedJob, provenance: { method: "source_page", httpStatus: response.status, contentType, sourceUrl: safe, verifiedAt: new Date().toISOString(), fields: ["description", "application_status"] } };
  } catch (error) {
    const code = error instanceof Error ? error.message.slice(0, 120) : "VERIFICATION_FAILED";
    return { status: "failed", job, provenance: { method: "source_page", sourceUrl: safe, failedAt: new Date().toISOString() }, errorCode: code };
  }
}
