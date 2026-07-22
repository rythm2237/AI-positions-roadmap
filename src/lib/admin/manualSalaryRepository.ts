import "server-only";
import { supabaseUserFetch } from "@/lib/admin/supabaseServer";

export interface IntelligenceCountry {country_code:string;country_name:string;currency_code:string;region_group:string;status:string;sort_order:number}
export interface SalaryFamily {id:string;name:string;short_name:string;status:string}
export interface SalaryMapping {id:string;occupation_family_id:string;country_code:string;occupation_code:string;occupation_title:string;review_status:string;statistical_aggregation_allowed:boolean}
export interface SalarySource {id:string;country_code:string;source_name:string;source_type:string}
export interface SalaryApproval {source_id:string;approval_status:string;approval_expires_at:string|null}
export interface NormalizedCandidate {id:string;occupation_family_id:string;country_code:string;status:string;normalized_payload:{currencyCode?:string;metrics?:SalaryMetric[]};validation_result:{valid?:boolean};evidence_count:number;created_at:string;rejection_reason:string|null}
export interface SalaryMetric {metricCode:string;metricMeaning:string;label:string;value:number;unit:string;experienceLevel?:string;regionCode?:string;percentile?:number}
export interface SalaryPublication {candidate_id:string;occupation_family_id:string;country_code:string;status:string}

async function read<T>(path:string,token:string,init:RequestInit={}){const response=await supabaseUserFetch(`/rest/v1/${path}`,token,{...init,headers:{Prefer:"return=representation",...init.headers}});if(!response.ok)throw new Error("MANUAL_SALARY_DATABASE_ERROR");return response.json() as Promise<T>}
export function listSalaryCountries(token:string){return read<IntelligenceCountry[]>("intelligence_countries?status=eq.active&select=*&order=sort_order.asc,country_name.asc",token)}
export function listSalaryFamilies(token:string){return read<SalaryFamily[]>("occupation_families?status=eq.active&select=id,name,short_name,status&order=name.asc",token)}
export function listSalaryMappings(token:string){return read<SalaryMapping[]>("occupation_mappings?review_status=eq.approved&select=id,occupation_family_id,country_code,occupation_code,occupation_title,review_status,statistical_aggregation_allowed&order=country_code.asc,occupation_title.asc",token)}
export function listSalarySources(token:string){return read<SalarySource[]>("statistical_sources?select=id,country_code,source_name,source_type&order=country_code.asc,source_name.asc",token)}
export function listSalaryApprovals(token:string){return read<SalaryApproval[]>("statistical_source_capability_approvals?capability=eq.salary&approval_status=in.(approved,conditional)&select=source_id,approval_status,approval_expires_at",token)}
export function listSalaryCandidates(token:string){return read<NormalizedCandidate[]>("occupation_intelligence_candidates?capability=eq.salary&select=id,occupation_family_id,country_code,status,normalized_payload,validation_result,evidence_count,created_at,rejection_reason&order=created_at.desc&limit=100",token)}
export function listSalaryPublications(token:string){return read<SalaryPublication[]>("occupation_intelligence_publications?capability=eq.salary&status=eq.published&select=candidate_id,occupation_family_id,country_code,status",token)}
export function createManualSalaryCandidate(token:string,value:Record<string,unknown>){return read<NormalizedCandidate>("rpc/admin_create_manual_salary_candidate",token,{method:"POST",body:JSON.stringify({p_value:value})})}
export function publishSalaryCandidate(token:string,id:string){return read<NormalizedCandidate>("rpc/admin_publish_occupation_candidate",token,{method:"POST",body:JSON.stringify({p_candidate_id:id})})}
export function rejectSalaryCandidate(token:string,id:string,reason:string){return read<NormalizedCandidate>("rpc/admin_reject_occupation_candidate",token,{method:"POST",body:JSON.stringify({p_candidate_id:id,p_reason:reason})})}
