import "server-only";

import type { JobProviderStage, JobProviderType } from "./contracts";

export type DiscoveryMode = "legacy" | "shadow" | "primary";

export type ApifyActorConfig = {
  source: string;
  actorId: string;
  enabled: boolean;
  priority: number;
  maxResults: number;
  maxChargeUsd: number | null;
  inputTemplate: Record<string, unknown>;
};

export type WorkdaySiteConfig = { tenant: string; site: string; host: string; company: string; priority: number };

const boundedInt = (value: string | undefined, fallback: number, min: number, max: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, Math.floor(parsed))) : fallback;
};

const boundedMoney = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 100) : null;
};

const enabled = (value: string | undefined, fallback: boolean) => value == null ? fallback : value === "true";

export function discoveryConfig() {
  const requestedMode = process.env.JOB_DISCOVERY_V2_MODE;
  const mode: DiscoveryMode = requestedMode === "shadow" || requestedMode === "primary" ? requestedMode : "legacy";
  return {
    mode,
    directEnabled: enabled(process.env.JOB_PROVIDER_DIRECT_ENABLED, true),
    apifyEnabled: enabled(process.env.JOB_PROVIDER_APIFY_ENABLED, false),
    serpApiEnabled: enabled(process.env.JOB_PROVIDER_SERPAPI_ENABLED, true),
    adzunaEnabled: enabled(process.env.JOB_PROVIDER_ADZUNA_ENABLED, true),
    minimumBeforeFallback: boundedInt(process.env.JOB_DISCOVERY_MIN_RESULTS_BEFORE_FALLBACK, 20, 0, 200),
    maxResultsPerProvider: boundedInt(process.env.JOB_DISCOVERY_MAX_RESULTS_PER_PROVIDER, 25, 1, 100),
    maxRequests: boundedInt(process.env.JOB_DISCOVERY_MAX_REQUESTS, 36, 1, 60),
    maxApifyRuns: boundedInt(process.env.JOB_DISCOVERY_MAX_APIFY_RUNS, 2, 0, 10),
    apifyDailyBudgetUsd: boundedMoney(process.env.JOB_DISCOVERY_APIFY_DAILY_BUDGET_USD),
    requestTimeoutMs: boundedInt(process.env.JOB_DISCOVERY_REQUEST_TIMEOUT_MS, 15_000, 1_000, 60_000),
    gatewayDeadlineMs: boundedInt(process.env.JOB_DISCOVERY_GATEWAY_DEADLINE_MS, 120_000, 5_000, 180_000),
    priorities: {
      greenhouse: boundedInt(process.env.JOB_PROVIDER_GREENHOUSE_PRIORITY, 10, 1, 999),
      lever: boundedInt(process.env.JOB_PROVIDER_LEVER_PRIORITY, 11, 1, 999),
      adzuna: boundedInt(process.env.JOB_PROVIDER_ADZUNA_PRIORITY, 30, 1, 999),
      serpApi: boundedInt(process.env.JOB_PROVIDER_SERPAPI_PRIORITY, 100, 1, 999),
    },
  };
}

function validActorId(value: string) {
  return /^[A-Za-z0-9_-]{1,80}(?:\/[A-Za-z0-9_.-]{1,100})?$/.test(value);
}

export function configuredApifyActors(): ApifyActorConfig[] {
  if (!discoveryConfig().apifyEnabled || !process.env.APIFY_API_TOKEN) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(process.env.JOB_DISCOVERY_APIFY_ACTORS ?? "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const source = typeof row.source === "string" ? row.source.trim().toLowerCase() : "";
    const actorId = typeof row.actorId === "string" ? row.actorId.trim() : "";
    if (!/^[a-z0-9_-]{1,40}$/.test(source) || !validActorId(actorId) || row.enabled === false) return [];
    const inputTemplate = row.inputTemplate && typeof row.inputTemplate === "object" && !Array.isArray(row.inputTemplate)
      ? row.inputTemplate as Record<string, unknown>
      : {};
    return [{
      source,
      actorId,
      enabled: true,
      priority: Math.max(1, Math.min(999, Number(row.priority) || 20)),
      maxResults: Math.max(1, Math.min(discoveryConfig().maxResultsPerProvider, Number(row.maxResults) || 25)),
      maxChargeUsd: boundedMoney(row.maxChargeUsd),
      inputTemplate,
    } satisfies ApifyActorConfig];
  }).slice(0, discoveryConfig().maxApifyRuns);
}

export function configuredWorkdaySites(): WorkdaySiteConfig[] {
  let parsed: unknown;
  try { parsed = JSON.parse(process.env.JOB_DISCOVERY_WORKDAY_SITES ?? "[]"); } catch { return []; }
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const tenant = typeof row.tenant === "string" ? row.tenant.trim() : "";
    const site = typeof row.site === "string" ? row.site.trim() : "";
    const host = typeof row.host === "string" ? row.host.trim().toLowerCase() : "";
    const company = typeof row.company === "string" ? row.company.trim() : "";
    if (![tenant, site].every((value) => /^[A-Za-z0-9_-]{1,80}$/.test(value)) || !/^[a-z0-9.-]+\.myworkdayjobs\.com$/.test(host) || company.length < 2 || company.length > 120) return [];
    return [{ tenant, site, host, company, priority: Math.max(1, Math.min(999, Number(row.priority) || 12)) }];
  }).slice(0, 10);
}

export function providerMetadata(providerType: JobProviderType, stage: JobProviderStage, priority: number, supportedSources: string[], options: { expensive?: boolean; fallbackOnly?: boolean } = {}) {
  return { providerType, stage, priority, supportedSources, ...options } as const;
}
