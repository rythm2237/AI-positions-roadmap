import type { JobWorkplaceModel, ProviderAttemptStatus } from "../../types/jobAgent.ts";

export type ProviderSearchInput = {
  query: string;
  country: string;
  location?: string;
  limit: number;
  correlationId: string;
};

export type JobProviderType = "DIRECT" | "APIFY" | "SEARCH_API";
export type JobProviderStage = "PRIMARY" | "SECONDARY" | "FALLBACK";

export type JobProviderMetadata = {
  providerType: JobProviderType;
  stage: JobProviderStage;
  priority: number;
  supportedSources: string[];
  expensive?: boolean;
  fallbackOnly?: boolean;
};

export type CanonicalJobCandidate = {
  externalId: string;
  source: string;
  sourceQuery: string;
  company: string;
  companyNormalized?: string;
  title: string;
  normalizedTitle: string;
  location: string | null;
  city?: string | null;
  region?: string | null;
  country: string | null;
  sourceUrl: string;
  applicationUrl: string;
  description: string;
  descriptionComplete: boolean;
  workplaceModel: JobWorkplaceModel;
  employmentTypes: string[];
  seniority: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  salaryPeriod?: "hour" | "day" | "week" | "month" | "year" | null;
  requiredLanguages: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  educationRequirements: string[];
  certificationRequirements: string[];
  visaSponsorship: string | null;
  postedAt: string | null;
  expiresAt: string | null;
  canonicalKey: string;
  sourceQueries: string[];
  sources: Array<{ provider: string; sourceJobId: string; sourceQuery: string; sourceUrl: string; providerPayload: Record<string, unknown> }>;
  providerPayload?: Record<string, unknown>;
};

export type ProviderSearchOutcome = {
  provider: string;
  status: ProviderAttemptStatus;
  jobs: CanonicalJobCandidate[];
  latencyMs: number;
  requestCount: number;
  rateLimitState: Record<string, unknown>;
  rawCount?: number;
  normalizedCount?: number;
  costUsd?: number;
  metadata?: Record<string, unknown>;
  errorCode?: string;
  errorMessage?: string;
};

export type ProviderHealth = {
  configured: boolean;
  status: "healthy" | "degraded" | "unavailable";
  reason?: string;
};

export interface JobProvider {
  readonly id: string;
  readonly name: string;
  readonly enabled: boolean;
  readonly metadata: JobProviderMetadata;
  search(input: ProviderSearchInput): Promise<ProviderSearchOutcome>;
  normalize?(raw: unknown, input: ProviderSearchInput): CanonicalJobCandidate | null;
  fetchDetails?(job: CanonicalJobCandidate): Promise<CanonicalJobCandidate>;
  health(): Promise<ProviderHealth>;
  healthCheck(): Promise<ProviderHealth>;
  countrySupport(country: string): boolean;
  rateLimitState(): Promise<Record<string, unknown>>;
}

export type SearchGatewayResult = {
  jobs: CanonicalJobCandidate[];
  fallbackTriggered?: boolean;
  providerCounts?: Record<string, number>;
  shadowComparison?: {
    mode: "shadow";
    legacyCount: number;
    multisourceCount: number;
    overlapCount: number;
    legacyOnlyCount: number;
    multisourceOnlyCount: number;
    directOnlyCount: number;
    apifyOnlyCount: number;
    fallbackOnlyCount: number;
  };
  attempts: Array<{
    provider: string;
    query: string;
    country: string;
    location: string | null;
    status: ProviderAttemptStatus;
    recordsReceived: number;
    requestCount: number;
    rateLimitState: Record<string, unknown>;
    latencyMs: number;
    providerType?: JobProviderType;
    providerStage?: JobProviderStage;
    rawCount?: number;
    normalizedCount?: number;
    costUsd?: number;
    metadata?: Record<string, unknown>;
    errorCode?: string;
    errorMessage?: string;
  }>;
};
