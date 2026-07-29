import countries from "world-countries";
import providerCountries from "../../../content/intelligence/country-registry.json" with { type: "json" };

export interface SelectableCountry {
  code: string;
  name: string;
  officialName: string;
  currencyCode: string | null;
  aliases: string[];
}

export const SUGGESTED_SALARY_COUNTRIES = ["us", "ca", "gb", "de", "fr", "nl", "ch", "es", "se", "au"] as const;

export const COUNTRY_CATALOG: SelectableCountry[] = countries
  .filter((country) => country.cca2)
  .map((country) => ({
    code: country.cca2.toLowerCase(),
    name: country.name.common,
    officialName: country.name.official,
    currencyCode: Object.keys(country.currencies)[0] ?? null,
    aliases: [...country.altSpellings, country.cca3].filter(Boolean),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const countriesByCode = new Map(COUNTRY_CATALOG.map((country) => [country.code, country]));
const providerByCode = new Map(providerCountries.map((country) => [country.productCode, country]));

export function resolveSelectableCountry(code: string) {
  return countriesByCode.get(code.trim().toLowerCase()) ?? null;
}

export function providerSupportsCountry(code: string) {
  return providerByCode.get(code.trim().toLowerCase())?.configured === true;
}

export function countryCurrency(code: string) {
  return providerByCode.get(code.trim().toLowerCase())?.currencyCode ?? resolveSelectableCountry(code)?.currencyCode ?? null;
}

export function searchCountries(query: string, excluded: ReadonlySet<string> = new Set()) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return COUNTRY_CATALOG.filter((country) => {
    if (excluded.has(country.code)) return false;
    return country.code.includes(normalized)
      || country.name.toLowerCase().includes(normalized)
      || country.officialName.toLowerCase().includes(normalized)
      || country.aliases.some((alias) => alias.toLowerCase().includes(normalized));
  }).sort((a, b) => {
    const score = (country: SelectableCountry) => country.code === normalized ? 0 : country.name.toLowerCase() === normalized ? 1 : country.name.toLowerCase().startsWith(normalized) ? 2 : 3;
    return score(a) - score(b) || a.name.localeCompare(b.name);
  });
}
