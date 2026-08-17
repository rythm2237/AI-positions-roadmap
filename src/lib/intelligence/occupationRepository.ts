import "server-only";

import { intelligenceServiceFetch, type PublishedSnapshot } from "@/lib/intelligence/snapshotRepository";
import type { SnapshotType } from "@/lib/intelligence/snapshotRegistry";

export interface PublicOccupationFamily {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  description: string;
  classification_scope: string;
  aliases: string[];
  included_occupations: string[];
  excluded_occupations: string[];
  methodology_summary: string;
  mapping_version: string;
  status: "active";
}

const publicFamilySelect =
  "id,slug,name,short_name,description,classification_scope,aliases,included_occupations,excluded_occupations,methodology_summary,mapping_version,status";

export function listPublicOccupationFamilies() {
  return intelligenceServiceFetch<PublicOccupationFamily[]>(
    `occupation_families?status=eq.active&select=${publicFamilySelect}&order=name.asc`,
  );
}

export async function getPublicOccupationFamily(slug: string) {
  const rows = await intelligenceServiceFetch<PublicOccupationFamily[]>(
    `occupation_families?slug=eq.${encodeURIComponent(slug)}&status=eq.active&select=${publicFamilySelect}&limit=1`,
  );
  return rows[0] ?? null;
}

export async function occupationFamilyForRoadmap(careerSlug: string) {
  const links = await intelligenceServiceFetch<Array<{ occupation_family_id: string }>>(
    `occupation_roadmap_links?career_slug=eq.${encodeURIComponent(careerSlug)}&status=eq.active&select=occupation_family_id&order=priority.asc&limit=1`,
  );
  const occupationFamilyId = links[0]?.occupation_family_id;
  if (!occupationFamilyId) return null;

  const rows = await intelligenceServiceFetch<PublicOccupationFamily[]>(
    `occupation_families?id=eq.${encodeURIComponent(occupationFamilyId)}&status=eq.active&select=${publicFamilySelect}&limit=1`,
  );
  return rows[0] ?? null;
}

export function occupationRoadmapLinks(id: string) {
  return intelligenceServiceFetch<Array<{ career_slug: string; relationship_type: string; priority: number }>>(
    `occupation_roadmap_links?occupation_family_id=eq.${id}&status=eq.active&select=career_slug,relationship_type,priority&order=priority.asc`,
  );
}

export async function latestPublishedForOccupation(id: string, countries: string[], type: SnapshotType) {
  if (!countries.length) return new Map<string, PublishedSnapshot>();
  const links = await intelligenceServiceFetch<Array<{ snapshot_id: string }>>(
    `intelligence_snapshot_occupation_links?occupation_family_id=eq.${id}&select=snapshot_id`,
  );
  if (!links.length) return new Map<string, PublishedSnapshot>();
  const ids = links.map((link) => link.snapshot_id).join(",");
  const countryFilter = countries.map((value) => value.toLowerCase()).join(",");
  const rows = await intelligenceServiceFetch<PublishedSnapshot[]>(
    `intelligence_snapshots?id=in.(${ids})&country_code=in.(${countryFilter})&snapshot_type=eq.${type}&status=eq.published&order=published_at.desc&select=*`,
  );
  const result = new Map<string, PublishedSnapshot>();
  for (const row of rows) if (!result.has(row.country_code)) result.set(row.country_code, row);
  return result;
}
