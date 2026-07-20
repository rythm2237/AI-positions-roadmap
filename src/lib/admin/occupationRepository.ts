import "server-only";
import { supabaseUserFetch } from "@/lib/admin/supabaseServer";
import type { OccupationFamilyInput,OccupationMappingInput } from "@/lib/intelligence/occupationDomain";

export interface OccupationFamilyRow {id:string;slug:string;name:string;short_name:string;description:string;status:"draft"|"active"|"archived";classification_scope:string;aliases:string[];included_occupations:string[];excluded_occupations:string[];methodology_summary:string;mapping_version:string;created_at:string;updated_at:string}
export interface OccupationMappingRow {id:string;occupation_family_id:string;country_code:string;classification_system:string;occupation_code:string;occupation_title:string;relevance_level:string;weight:number;inclusion_reason:string;exclusions:string[];mapping_confidence:string;mapping_version:string;review_status:string;evidence_urls:string[];notes:string|null;reviewed_at:string|null}
export interface OccupationRoadmapLinkRow {occupation_family_id:string;career_slug:string;relationship_type:string;priority:number;status:string}

async function read<T>(path:string,token:string,init:RequestInit={}){const response=await supabaseUserFetch(`/rest/v1/${path}`,token,{...init,headers:{Prefer:"return=representation",...init.headers}});if(!response.ok)throw new Error("OCCUPATION_DATABASE_ERROR");return response.json() as Promise<T>}
export function listOccupationFamilies(token:string){return read<OccupationFamilyRow[]>("occupation_families?select=*&order=updated_at.desc",token)}
export async function getOccupationFamily(token:string,id:string){const rows=await read<OccupationFamilyRow[]>(`occupation_families?id=eq.${encodeURIComponent(id)}&select=*&limit=1`,token);return rows[0]??null}
export function listOccupationMappings(token:string,familyId:string){return read<OccupationMappingRow[]>(`occupation_mappings?occupation_family_id=eq.${encodeURIComponent(familyId)}&select=*&order=country_code.asc,weight.desc`,token)}
export function listOccupationRoadmapLinks(token:string,familyId:string){return read<OccupationRoadmapLinkRow[]>(`occupation_roadmap_links?occupation_family_id=eq.${encodeURIComponent(familyId)}&select=*&order=priority.asc`,token)}
export function saveOccupationFamily(token:string,id:string|null,value:OccupationFamilyInput){return read<OccupationFamilyRow>("rpc/admin_save_occupation_family",token,{method:"POST",body:JSON.stringify({p_id:id,p_value:value})})}
export function setOccupationArchived(token:string,id:string,archived:boolean){return read<OccupationFamilyRow>("rpc/admin_set_occupation_archived",token,{method:"POST",body:JSON.stringify({p_id:id,p_archived:archived})})}
export function upsertOccupationMapping(token:string,value:OccupationMappingInput){return read<OccupationMappingRow>("rpc/admin_upsert_occupation_mapping",token,{method:"POST",body:JSON.stringify({p_value:value})})}
export function upsertOccupationRoadmapLink(token:string,input:{occupationFamilyId:string;careerSlug:string;relationshipType:string;priority:number;status:string}){return read<OccupationRoadmapLinkRow>("rpc/admin_upsert_occupation_roadmap_link",token,{method:"POST",body:JSON.stringify({p_occupation_family_id:input.occupationFamilyId,p_career_slug:input.careerSlug,p_relationship_type:input.relationshipType,p_priority:input.priority,p_status:input.status})})}
