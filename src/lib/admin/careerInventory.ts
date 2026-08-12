import { CAREER_CATALOG, type CareerCatalogEntry } from "@/data/careerCatalog";
import type { ManagedCareer, ManagedCareerStatus } from "@/types/adminStudio";

export type CareerInventoryStatus =
  | ManagedCareerStatus
  | "available"
  | "planned"
  | "unmanaged";

export interface CareerInventoryItem {
  slug: string;
  title: string;
  domain: string;
  description: string;
  catalog: CareerCatalogEntry | null;
  managed: ManagedCareer | null;
}

export function buildCareerInventory(managedCareers: ManagedCareer[]) {
  const managedBySlug = new Map(managedCareers.map((career) => [career.slug, career]));
  const catalogItems: CareerInventoryItem[] = CAREER_CATALOG.map((catalog) => ({
    slug: catalog.slug,
    title: managedBySlug.get(catalog.slug)?.title ?? catalog.title,
    domain: catalog.domain,
    description: catalog.description,
    catalog,
    managed: managedBySlug.get(catalog.slug) ?? null,
  }));
  const catalogSlugs = new Set(CAREER_CATALOG.map((career) => career.slug));
  const managedOnly: CareerInventoryItem[] = managedCareers
    .filter((career) => !catalogSlugs.has(career.slug))
    .map((managed) => ({
      slug: managed.slug,
      title: managed.title,
      domain: "Custom / database-managed",
      description: managed.summary ?? "Database-managed Career profile.",
      catalog: null,
      managed,
    }));

  return [...catalogItems, ...managedOnly];
}

export function filterCareerInventory(
  inventory: CareerInventoryItem[],
  options: { search?: string; status?: string },
) {
  const query = options.search?.trim().toLowerCase();
  const status = options.status as CareerInventoryStatus | undefined;

  return inventory.filter((item) => {
    const matchesSearch = !query ||
      `${item.title} ${item.slug} ${item.domain}`.toLowerCase().includes(query);
    const matchesStatus = !status ||
      (status === "available" && item.catalog?.availability === "available") ||
      (status === "planned" && item.catalog?.availability === "planned") ||
      (status === "unmanaged" && !item.managed) ||
      item.managed?.status === status;
    return matchesSearch && matchesStatus;
  });
}
