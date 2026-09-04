import type { JobWorkplaceModel, ProviderAttemptStatus } from "../../types/jobAgent.ts";

export type ProviderSearchInput = {
  query: string;
  country: string;
  location?: string;
  limit: number;
  correlationId: string;
};

export type CanonicalJobCandidate = {
  externalId: string;
  source: string;
  sourceQuery: string;
  company: string;
  title: string;
  normalizedTitle: string;
  location: string | null;
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
  errorCode?: string;
  errorMessage?: string;
};

export type ProviderHealth = {
  configured: boolean;
  status: "healthy" | "degraded" | "unavailable";
  reason?: string;
};

export interface JobProvider {
  readonly name: string;
  search(input: ProviderSearchInput): Promise<ProviderSearchOutcome>;
  fetchDetails?(job: CanonicalJobCandidate): Promise<CanonicalJobCandidate>;
  health(): Promise<ProviderHealth>;
  countrySupport(country: string): boolean;
  rateLimitState(): Promise<Record<string, unknown>>;
}

export type SearchGatewayResult = {
  jobs: CanonicalJobCandidate[];
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
    errorCode?: string;
    errorMessage?: string;
  }>;
};
