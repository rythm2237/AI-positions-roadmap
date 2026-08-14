import "server-only";
import { supabaseUserFetch } from "@/lib/admin/supabaseServer";
import type { CareerInput } from "@/lib/admin/careerValidation";
import type { AdminAuditEntry, ManagedCareer } from "@/types/adminStudio";

export class AdminRepositoryError extends Error { constructor(public code: "duplicate_slug"|"not_found"|"state_unchanged"|"database_error"){super(code)} }

async function jsonRequest<T>(path: string, accessToken: string, init: RequestInit = {}): Promise<T> {
  const response = await supabaseUserFetch(`/rest/v1/${path}`, accessToken, { ...init, headers: { Prefer: "return=representation", ...init.headers } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { code?: string; message?: string };
    if (body.code === "23505") throw new AdminRepositoryError("duplicate_slug");
    if (body.message === "career_not_found") throw new AdminRepositoryError("not_found");
    if (body.message === "career_state_unchanged") throw new AdminRepositoryError("state_unchanged");
    throw new AdminRepositoryError("database_error");
  }
  return response.json() as Promise<T>;
}

export async function listCareers(accessToken: string, options: { search?: string; status?: string } = {}) {
  const filters = ["select=*", "order=updated_at.desc"];
  if (options.status && ["draft", "review", "published", "archived"].includes(options.status)) filters.push(`status=eq.${options.status}`);
  if (options.search?.trim()) filters.push(`or=(title.ilike.*${encodeURIComponent(options.search.trim())}*,slug.ilike.*${encodeURIComponent(options.search.trim())}*)`);
  return jsonRequest<ManagedCareer[]>(`careers?${filters.join("&")}`, accessToken);
}
export async function getCareer(accessToken: string, id: string) { const rows = await jsonRequest<ManagedCareer[]>(`careers?id=eq.${encodeURIComponent(id)}&select=*&limit=1`, accessToken); return rows[0] ?? null; }
export async function getCareerBySlug(accessToken:string,slug:string){const rows=await jsonRequest<ManagedCareer[]>(`careers?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`,accessToken);return rows[0]??null}
export async function listAudit(accessToken: string, entityId?: string, limit = 12) { const entity = entityId ? `&entity_id=eq.${encodeURIComponent(entityId)}` : ""; return jsonRequest<AdminAuditEntry[]>(`admin_audit_log?select=*&order=created_at.desc&limit=${limit}${entity}`, accessToken); }
export async function createCareer(accessToken: string, input: CareerInput) { return jsonRequest<ManagedCareer>("rpc/admin_create_career", accessToken, { method: "POST", body: JSON.stringify({ p_slug: input.slug, p_title: input.title, p_short_title: input.shortTitle, p_summary: input.summary, p_taxonomy: { primaryTitle: input.primaryTitle, aliases: input.aliases }, p_default_country_codes: input.defaultCountryCodes }) }); }
export async function updateCareer(accessToken: string, id: string, input: CareerInput) { return jsonRequest<ManagedCareer>("rpc/admin_update_career", accessToken, { method: "POST", body: JSON.stringify({ p_id: id, p_title: input.title, p_short_title: input.shortTitle, p_summary: input.summary, p_taxonomy: { primaryTitle: input.primaryTitle, aliases: input.aliases }, p_default_country_codes: input.defaultCountryCodes }) }); }
export async function setCareerArchived(accessToken: string, id: string, archived: boolean) { return jsonRequest<ManagedCareer>("rpc/admin_set_career_archived", accessToken, { method: "POST", body: JSON.stringify({ p_id: id, p_archived: archived }) }); }
export async function saveCareerContent(accessToken:string,id:string,workspaceData:unknown,validationErrors:string[]){
  const saved = await jsonRequest<ManagedCareer>("rpc/admin_save_career_content",accessToken,{method:"POST",body:JSON.stringify({p_id:id,p_workspace_data:workspaceData,p_validation_errors:validationErrors})});
  if (workspaceData && typeof workspaceData === "object" && !Array.isArray(workspaceData)) {
    await jsonRequest<Record<string, unknown>>("rpc/admin_sync_career_learning_resources", accessToken, {
      method: "POST",
      body: JSON.stringify({ p_career_id: id, p_workspace_data: workspaceData }),
    });
  }
  return saved;
}
export async function setCareerPublication(accessToken:string,id:string,publish:boolean){return jsonRequest<ManagedCareer>("rpc/admin_set_career_publication",accessToken,{method:"POST",body:JSON.stringify({p_id:id,p_publish:publish})})}