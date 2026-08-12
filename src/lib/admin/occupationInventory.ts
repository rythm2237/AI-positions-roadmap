import { OCCUPATION_FAMILY_CATALOG, type OccupationFamilyCatalogEntry } from "@/data/occupationFamilyCatalog";
import type { OccupationFamilyRow } from "@/lib/admin/occupationRepository";

export interface OccupationInventoryItem {
  slug: string;
  catalog: OccupationFamilyCatalogEntry | null;
  managed: OccupationFamilyRow | null;
}

export function buildOccupationInventory(managedFamilies: OccupationFamilyRow[]) {
  const managedBySlug = new Map(managedFamilies.map((family) => [family.slug, family]));
  const catalogItems = OCCUPATION_FAMILY_CATALOG.map((catalog) => ({
    slug: catalog.slug,
    catalog,
    managed: managedBySlug.get(catalog.slug) ?? null,
  }));
  const catalogSlugs = new Set(OCCUPATION_FAMILY_CATALOG.map((family) => family.slug));
  const managedOnly = managedFamilies
    .filter((family) => !catalogSlugs.has(family.slug))
    .map((managed) => ({ slug: managed.slug, catalog: null, managed }));
  return [...catalogItems, ...managedOnly];
}

export function filterOccupationInventory(
  inventory: OccupationInventoryItem[],
  options: { search?: string; status?: string },
) {
  const query = options.search?.trim().toLowerCase();
  return inventory.filter((item) => {
    const name = item.managed?.name ?? item.catalog?.name ?? item.slug;
    const domain = item.catalog?.domain ?? "Custom occupation family";
    const matchesSearch = !query || `${name} ${item.slug} ${domain}`.toLowerCase().includes(query);
    const matchesStatus = !options.status ||
      (options.status === "unconfigured" && !item.managed) ||
      item.managed?.status === options.status;
    return matchesSearch && matchesStatus;
  });
}
