import { COUNTRY_CATALOG } from "../intelligence/countryCatalog.ts";

const recognizedCountries = new Set(COUNTRY_CATALOG.map((country) => country.code));
export const MANAGED_CAREER_STATUSES = ["draft", "archived"] as const;

export function normalizeCareerSlug(value: string) {
  return value.trim().toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export interface CareerInput { slug: string; title: string; shortTitle: string; summary: string; primaryTitle: string; aliases: string[]; defaultCountryCodes: string[] }

export function validateCareerInput(input: CareerInput, options: { requireSlug?: boolean } = {}) {
  const value = {
    slug: normalizeCareerSlug(input.slug), title: input.title.trim(), shortTitle: input.shortTitle.trim(), summary: input.summary.trim(),
    primaryTitle: input.primaryTitle.trim(), aliases: [...new Set(input.aliases.map((item) => item.trim()).filter(Boolean))],
    defaultCountryCodes: [...new Set(input.defaultCountryCodes.map((item) => item.toLowerCase()))],
  };
  const errors: Record<string,string> = {};
  if ((options.requireSlug ?? true) && (!value.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug))) errors.slug = "Use lowercase words separated by hyphens.";
  if (value.title.length < 2 || value.title.length > 120) errors.title = "Career title must be 2–120 characters.";
  if (value.shortTitle.length < 2 || value.shortTitle.length > 80) errors.shortTitle = "Short title must be 2–80 characters.";
  if (value.summary.length > 1200) errors.summary = "Summary must be 1,200 characters or fewer.";
  if (value.primaryTitle.length < 2 || value.primaryTitle.length > 120) errors.primaryTitle = "Primary taxonomy title must be 2–120 characters.";
  if (value.aliases.length > 20 || value.aliases.some((alias) => alias.length > 120)) errors.aliases = "Use at most 20 aliases of 120 characters or fewer.";
  if (value.defaultCountryCodes.length > 10 || value.defaultCountryCodes.some((code) => !recognizedCountries.has(code))) errors.defaultCountryCodes = "Choose up to 10 recognized countries.";
  return { success: Object.keys(errors).length === 0, value, errors };
}

export function careerInputFromForm(formData: FormData): CareerInput {
  return {
    slug: String(formData.get("slug") ?? ""), title: String(formData.get("title") ?? ""), shortTitle: String(formData.get("shortTitle") ?? ""),
    summary: String(formData.get("summary") ?? ""), primaryTitle: String(formData.get("primaryTitle") ?? ""),
    aliases: String(formData.get("aliases") ?? "").split(/\r?\n|,/), defaultCountryCodes: formData.getAll("defaultCountryCodes").map(String),
  };
}
