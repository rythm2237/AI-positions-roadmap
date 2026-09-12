import { canonicalJobKey, normalizeJobText, safeExternalUrl } from "../normalization.ts";
import type { ApifyActorConfig } from "../providerConfig.ts";
import type { CanonicalJobCandidate, JobProvider, ProviderSearchInput, ProviderSearchOutcome } from "../contracts.ts";

const APIFY_API = "https://api.apify.com/v2";
const TERMINAL = new Set(["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"]);

type ApifyRun = {
  id?: string;
  status?: string;
  defaultDatasetId?: string;
  usageTotalUsd?: number;
  stats?: Record<string, unknown>;
};

type ApifyEnvelope = { data?: ApifyRun };

const stringValue = (...values: unknown[]) => values.find((value): value is string => typeof value === "string" && Boolean(value.trim()))?.trim() ?? null;
const numberValue = (...values: unknown[]) => {
  const value = values.find((item) => typeof item === "number" || (typeof item === "string" && item.trim()));
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
const strings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim()) : [];

function replaceTemplate(value: unknown, input: ProviderSearchInput): unknown {
  if (typeof value === "string") {
    if (value === "{{limit}}") return input.limit;
    return value
      .replaceAll("{{query}}", input.query)
      .replaceAll("{{location}}", input.location ?? input.country)
      .replaceAll("{{country}}", input.country)
      .replaceAll("{{limit}}", String(input.limit))
      .replaceAll("{{correlationId}}", input.correlationId);
  }
  if (Array.isArray(value)) return value.map((item) => replaceTemplate(item, input));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, replaceTemplate(item, input)]));
  return value;
}

function actorInput(config: ApifyActorConfig, input: ProviderSearchInput) {
  if (Object.keys(config.inputTemplate).length) return replaceTemplate(config.inputTemplate, input) as Record<string, unknown>;
  return {
    keywords: input.query,
    title: input.query,
    location: input.location ?? input.country,
    country: input.country,
    maxItems: Math.min(input.limit, config.maxResults),
  };
}

function actorPath(actorId: string) {
  return encodeURIComponent(actorId.replace("/", "~"));
}

async function apifyFetch<T>(path: string, init: RequestInit, timeoutMs: number, retries = 2): Promise<T> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new Error("APIFY_NOT_CONFIGURED");
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(`${APIFY_API}${path}`, {
        ...init,
        cache: "no-store",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(`APIFY_HTTP_${response.status}`);
        if (attempt < retries) continue;
      }
      if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "APIFY_AUTH_FAILURE" : `APIFY_HTTP_${response.status}`);
      return await response.json() as T;
    } catch (error) {
      lastError = error;
      if (attempt >= retries || (error instanceof Error && error.message === "APIFY_AUTH_FAILURE")) throw error;
    }
  }
  throw lastError;
}

function normalizeApifyItem(item: unknown, providerName: string, input: ProviderSearchInput): CanonicalJobCandidate | null {
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;
  const row = item as Record<string, unknown>;
  const title = stringValue(row.title, row.jobTitle, row.positionName, row.name);
  const company = stringValue(row.company, row.companyName, row.organization, row.employerName);
  const sourceUrl = safeExternalUrl(stringValue(row.jobUrl, row.url, row.link, row.jobPostingUrl, row.applyUrl));
  const applicationUrl = safeExternalUrl(stringValue(row.applyUrl, row.applicationUrl, row.jobUrl, row.url, row.link));
  if (!title || !company || !sourceUrl || !applicationUrl) return null;
  const externalId = stringValue(row.id, row.jobId, row.job_id, row.urn, row.externalId) ?? canonicalJobKey({ title, company, country: input.country, location: stringValue(row.location, row.jobLocation), applicationUrl });
  const description = stringValue(row.descriptionText, row.description, row.jobDescription, row.descriptionHtml) ?? "";
  const workplaceText = stringValue(row.workplaceType, row.remoteType, row.workplace, row.location) ?? "";
  const workplaceModel = /remote/i.test(workplaceText) ? "remote" as const : /hybrid/i.test(workplaceText) ? "hybrid" as const : /on.?site|office/i.test(workplaceText) ? "on_site" as const : "unknown" as const;
  const employmentTypes = strings(row.employmentTypes).length ? strings(row.employmentTypes) : [stringValue(row.employmentType, row.contractType)].filter((value): value is string => Boolean(value)).map((value) => normalizeJobText(value).replaceAll(" ", "_"));
  const providerPayload = { actorSource: providerName.split(":")[1] ?? "configured", raw: row };
  const job: CanonicalJobCandidate = {
    externalId,
    source: providerName,
    sourceQuery: input.query,
    company,
    title,
    normalizedTitle: normalizeJobText(title),
    location: stringValue(row.location, row.jobLocation, row.formattedLocation),
    country: stringValue(row.country, row.countryCode) ?? input.country,
    sourceUrl,
    applicationUrl,
    description,
    descriptionComplete: description.length >= 120,
    workplaceModel,
    employmentTypes,
    seniority: stringValue(row.seniority, row.seniorityLevel, row.experienceLevel),
    salaryMin: numberValue(row.salaryMin, row.minSalary),
    salaryMax: numberValue(row.salaryMax, row.maxSalary),
    currency: stringValue(row.salaryCurrency, row.currency),
    requiredLanguages: strings(row.requiredLanguages),
    requiredSkills: strings(row.requiredSkills).length ? strings(row.requiredSkills) : strings(row.skills),
    preferredSkills: strings(row.preferredSkills),
    educationRequirements: strings(row.educationRequirements),
    certificationRequirements: strings(row.certificationRequirements),
    visaSponsorship: stringValue(row.visaSponsorship, row.sponsorship),
    postedAt: stringValue(row.postedAt, row.datePosted, row.publishedAt, row.listedAt),
    expiresAt: stringValue(row.expiresAt, row.validThrough),
    canonicalKey: "",
    sourceQueries: [input.query],
    sources: [{ provider: providerName, sourceJobId: externalId, sourceQuery: input.query, sourceUrl, providerPayload }],
    providerPayload,
  };
  job.canonicalKey = canonicalJobKey(job);
  return job;
}

export class ApifyJobProvider implements JobProvider {
  readonly id: string;
  readonly name: string;
  readonly enabled = true;
  readonly metadata;
  private readonly config: ApifyActorConfig;

  constructor(config: ApifyActorConfig) {
    this.config = config;
    this.id = `apify:${config.source}`;
    this.name = `Apify:${config.source}`;
    this.metadata = { providerType: "APIFY" as const, stage: "SECONDARY" as const, priority: config.priority, supportedSources: [config.source], expensive: true };
  }

  countrySupport() { return true; }
  async health() {
    const configured = Boolean(process.env.APIFY_API_TOKEN && this.config.actorId);
    if (!configured) return { configured: false, status: "unavailable" as const, reason: "Apify token or allowlisted Actor is missing." };
    try {
      await apifyFetch<unknown>("/users/me", { method: "GET" }, 5_000, 0);
      return { configured: true, status: "healthy" as const };
    } catch (error) {
      return { configured: true, status: "degraded" as const, reason: error instanceof Error ? error.message.slice(0, 120) : "APIFY_HEALTH_CHECK_FAILED" };
    }
  }
  async healthCheck() { return this.health(); }
  async rateLimitState() { return { known: false, maxResults: this.config.maxResults, maxChargeUsd: this.config.maxChargeUsd }; }

  async search(input: ProviderSearchInput): Promise<ProviderSearchOutcome> {
    const started = Date.now();
    let requestCount = 0;
    try {
      const maxItems = Math.min(input.limit, this.config.maxResults);
      const charge = this.config.maxChargeUsd == null ? "" : `&maxTotalChargeUsd=${encodeURIComponent(String(this.config.maxChargeUsd))}`;
      requestCount += 1;
      const startedRun = await apifyFetch<ApifyEnvelope>(`/acts/${actorPath(this.config.actorId)}/runs?maxItems=${maxItems}${charge}`, { method: "POST", body: JSON.stringify(actorInput(this.config, { ...input, limit: maxItems })) }, 15_000);
      const runId = startedRun.data?.id;
      if (!runId) throw new Error("APIFY_RUN_ID_MISSING");
      const deadline = Date.now() + Math.min(55_000, Math.max(50, Number(process.env.JOB_DISCOVERY_APIFY_TIMEOUT_MS) || 45_000));
      let run = startedRun.data;
      while (!TERMINAL.has(run?.status ?? "") && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, Math.min(750, Math.max(1, deadline - Date.now()))));
        requestCount += 1;
        run = (await apifyFetch<ApifyEnvelope>(`/actor-runs/${encodeURIComponent(runId)}`, { method: "GET" }, 10_000, 1)).data;
      }
      if (!TERMINAL.has(run?.status ?? "")) {
        requestCount += 1;
        await apifyFetch<ApifyEnvelope>(`/actor-runs/${encodeURIComponent(runId)}/abort`, { method: "POST" }, 10_000, 0).catch(() => null);
        throw new Error("APIFY_ACTOR_TIMEOUT");
      }
      if (run?.status !== "SUCCEEDED") throw new Error(`APIFY_ACTOR_${run?.status ?? "FAILED"}`);
      if (!run.defaultDatasetId) throw new Error("APIFY_DATASET_MISSING");
      requestCount += 1;
      const raw = await apifyFetch<unknown[]>(`/datasets/${encodeURIComponent(run.defaultDatasetId)}/items?clean=true&limit=${maxItems}`, { method: "GET" }, 15_000, 1);
      const jobs = raw.map((item) => normalizeApifyItem(item, this.name, input)).filter((job): job is CanonicalJobCandidate => Boolean(job));
      return { provider: this.name, status: jobs.length ? "success" : "no_results", jobs, latencyMs: Date.now() - started, requestCount, rawCount: raw.length, normalizedCount: jobs.length, costUsd: numberValue(run.usageTotalUsd) ?? 0, rateLimitState: { known: false }, metadata: { actorSource: this.config.source, actorRunId: runId, datasetId: run.defaultDatasetId, runStatus: run.status } };
    } catch (error) {
      const message = error instanceof Error ? error.message : "APIFY_PROVIDER_ERROR";
      const status = message === "APIFY_AUTH_FAILURE" ? "auth_failure" as const : "provider_error" as const;
      return { provider: this.name, status, jobs: [], latencyMs: Date.now() - started, requestCount: Math.max(1, requestCount), rawCount: 0, normalizedCount: 0, rateLimitState: { known: false }, errorCode: message.slice(0, 80), errorMessage: message.slice(0, 240) };
    }
  }
}
