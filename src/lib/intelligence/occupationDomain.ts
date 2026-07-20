export const OCCUPATION_COUNTRIES = ["us", "ca", "au", "gb", "fr", "de", "ie", "no"] as const;
export type OccupationCountry = typeof OCCUPATION_COUNTRIES[number];
export type MappingConfidence = "low" | "moderate" | "high";
export type MappingReviewStatus = "draft" | "under-review" | "approved" | "rejected";

export interface OccupationFamilyInput {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  classificationScope: string;
  aliases: string[];
  includedOccupations: string[];
  excludedOccupations: string[];
  methodologySummary: string;
  mappingVersion: string;
}

export interface OccupationMappingInput {
  occupationFamilyId: string;
  countryCode: string;
  classificationSystem: string;
  occupationCode: string;
  occupationTitle: string;
  relevanceLevel: "primary" | "related" | "adjacent";
  weight: number;
  inclusionReason: string;
  exclusions: string[];
  mappingConfidence: MappingConfidence;
  mappingVersion: string;
  reviewStatus: MappingReviewStatus;
  evidenceUrls: string[];
  notes: string;
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const versionPattern = /^[a-zA-Z0-9._-]{1,40}$/;
export function validateOccupationFamily(input: OccupationFamilyInput) {
  const errors: string[] = [];
  if (!slugPattern.test(input.slug)) errors.push("INVALID_SLUG");
  if (input.name.trim().length < 2 || input.name.length > 120) errors.push("INVALID_NAME");
  if (input.shortName.trim().length < 2 || input.shortName.length > 80) errors.push("INVALID_SHORT_NAME");
  if (!input.description.trim() || input.description.length > 2000) errors.push("INVALID_DESCRIPTION");
  if (!input.classificationScope.trim()) errors.push("CLASSIFICATION_SCOPE_REQUIRED");
  if (!input.methodologySummary.trim()) errors.push("METHODOLOGY_REQUIRED");
  if (!versionPattern.test(input.mappingVersion)) errors.push("INVALID_MAPPING_VERSION");
  if ([input.aliases, input.includedOccupations, input.excludedOccupations].some(values => values.length > 50 || values.some(value => !value.trim() || value.length > 160))) errors.push("INVALID_OCCUPATION_LIST");
  return { valid: errors.length === 0, errors };
}

export function validateOccupationMapping(input: OccupationMappingInput) {
  const errors: string[] = [];
  if (!OCCUPATION_COUNTRIES.includes(input.countryCode.toLowerCase() as OccupationCountry)) errors.push("UNSUPPORTED_COUNTRY");
  if (!input.classificationSystem.trim() || !input.occupationCode.trim() || !input.occupationTitle.trim()) errors.push("CLASSIFICATION_REQUIRED");
  if (!Number.isFinite(input.weight) || input.weight <= 0 || input.weight > 1) errors.push("INVALID_WEIGHT");
  if (!input.inclusionReason.trim()) errors.push("INCLUSION_REASON_REQUIRED");
  if (!versionPattern.test(input.mappingVersion)) errors.push("INVALID_MAPPING_VERSION");
  if (input.evidenceUrls.some(url => { try { return new URL(url).protocol !== "https:"; } catch { return true; } })) errors.push("INVALID_EVIDENCE_URL");
  return { valid: errors.length === 0, errors };
}
