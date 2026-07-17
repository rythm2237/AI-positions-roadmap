export const DEFAULT_SALARY_COUNTRIES = ["gb", "us", "ca"] as const;
export const MAX_SALARY_COUNTRIES = 10;
export const SALARY_COUNTRY_STORAGE_KEY = "career-os:salary-comparison:v1";

export function normalizeCountryCode(value: string) {
  return value.trim().toLowerCase();
}

export function sanitizeCountrySelection(
  values: unknown,
  recognizedCodes: ReadonlySet<string>,
  maximum = MAX_SALARY_COUNTRIES,
) {
  if (!Array.isArray(values)) return [...DEFAULT_SALARY_COUNTRIES];
  const valid = values
    .filter((value): value is string => typeof value === "string")
    .map(normalizeCountryCode)
    .filter((value, index, all) => recognizedCodes.has(value) && all.indexOf(value) === index)
    .slice(0, maximum);
  return valid.length ? valid : [...DEFAULT_SALARY_COUNTRIES];
}

export function addCountrySelection(current: string[], code: string, maximum = MAX_SALARY_COUNTRIES) {
  const normalized = normalizeCountryCode(code);
  if (current.includes(normalized)) return { countries: current, result: "duplicate" as const };
  if (current.length >= maximum) return { countries: current, result: "limit" as const };
  return { countries: [...current, normalized], result: "added" as const };
}

export function removeCountrySelection(current: string[], code: string) {
  if (current.length <= 1) return { countries: current, result: "minimum" as const };
  return { countries: current.filter((item) => item !== normalizeCountryCode(code)), result: "removed" as const };
}

export function normalizeRequestedCountries(value: string | null, maximum = MAX_SALARY_COUNTRIES) {
  if (!value) return { countries: [] as string[], error: "missing" as const };
  const countries = value.split(",").map(normalizeCountryCode).filter(Boolean);
  if (!countries.length) return { countries: [], error: "missing" as const };
  if (countries.length > maximum) return { countries: [], error: "limit" as const };
  if (new Set(countries).size !== countries.length) return { countries: [], error: "duplicate" as const };
  if (countries.some((country) => !/^[a-z]{2}$/.test(country))) return { countries: [], error: "invalid" as const };
  return { countries, error: null };
}

export function salaryCountryAvailability(hasSnapshot: boolean, stale: boolean, providerSupported: boolean, readFailed = false) {
  if (readFailed) return "failed" as const;
  if (hasSnapshot) return stale ? "stale" as const : "published" as const;
  return providerSupported ? "awaiting-verified-data" as const : "provider-unsupported" as const;
}
