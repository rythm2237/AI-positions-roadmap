export interface SalaryPublishedSnapshot {
  id: string;
  career_slug: string;
  country_code: string;
  snapshot_type: "market" | "salary";
  provider: string;
  status: "published";
  normalized_payload: Record<string, unknown>;
  sample_size: number;
  total_count: number | null;
  currency_code: string | null;
  captured_at: string;
  published_at: string;
}

export type SalaryCountryAvailability = "published" | "stale" | "awaiting-verified-data" | "provider-unsupported" | "failed";

export interface SalaryCountryResult {
  countryCode: string;
  countryName: string;
  currencyCode: string | null;
  providerSupported: boolean;
  availability: SalaryCountryAvailability;
  freshness?: string;
  snapshot: SalaryPublishedSnapshot | null;
}

export interface SalaryComparisonResponse {
  career: string;
  snapshotType: "salary";
  requestId: string;
  countries: SalaryCountryResult[];
}
