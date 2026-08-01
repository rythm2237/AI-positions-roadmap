import type { CareerWorkspaceData } from "@/types/careerWorkspace";

export type ManagedCareerStatus = "draft" | "archived" | "review" | "published";
export interface CareerTaxonomy { primaryTitle: string; aliases: string[] }

export interface ManagedCareer {
  id: string; slug: string; title: string; short_title: string; summary: string | null;
  status: ManagedCareerStatus; taxonomy: CareerTaxonomy; default_country_codes: string[];
  workspace_data: CareerWorkspaceData | null; validation_errors: string[]; content_version: number;
  published_at: string | null;
  created_by: string; updated_by: string; created_at: string; updated_at: string; archived_at: string | null;
}
export interface AdminAuditEntry {
  id: string; actor_user_id: string; action: "career.created"|"career.updated"|"career.archived"|"career.restored"|"career.content_updated"|"career.submitted"|"career.published"|"career.unpublished";
  entity_type: "career"; entity_id: string; changed_fields: { fields?: string[] }; created_at: string;
}
export interface CareerFormState { status: "idle"|"error"; message?: string; fieldErrors?: Record<string,string> }
