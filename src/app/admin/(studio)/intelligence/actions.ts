"use server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { getCareerBySlug } from "@/lib/admin/careerRepository";
import { publishCandidate,rejectCandidate } from "@/lib/admin/adminIntelligenceRepository";
import { queueAdminRefresh } from "@/lib/intelligence/adminRefreshQueue";
import{validateAdminRefresh}from"@/lib/intelligence/adminRefreshValidation";
import { resolveCareer,type SnapshotType } from "@/lib/intelligence/snapshotRegistry";
import type { RefreshCareerDefinition } from "@/lib/intelligence/refreshEngine";
export interface IntelligenceActionState{error?:string}
async function admin(){const auth=await requireAdmin();if(auth.status!=="admin")throw new Error("ADMIN_REQUIRED");return auth}
async function definition(token:string,slug:string):Promise<RefreshCareerDefinition|null>{const code=resolveCareer(slug);if(code)return{careerSlug:code.careerSlug,canonicalTitle:code.canonicalTitle,directTitles:[...code.directTitles],equivalentTitles:[...code.equivalentTitles],adjacentTitles:[...code.adjacentTitles],version:String(code.version)};const career=await getCareerBySlug(token,slug);if(!career)return null;return{careerSlug:career.slug,canonicalTitle:career.taxonomy.primaryTitle,directTitles:[career.taxonomy.primaryTitle],equivalentTitles:career.taxonomy.aliases,adjacentTitles:[],version:`db-${new Date(career.updated_at).getTime()}`}}
export async function queueRefreshAction(_state:IntelligenceActionState,formData:FormData):Promise<IntelligenceActionState>{const auth=await admin(),careerSlug=String(formData.get("career")??""),countries=formData.getAll("countries").map(String),types=formData.getAll("types").map(String),provider=String(formData.get("provider")??""),sampleSize=Number(formData.get("sampleSize")),careerDefinition=await definition(auth.accessToken,careerSlug),check=validateAdminRefresh({careerSlug,countries,types,provider,sampleSize,definition:careerDefinition});if(!check.valid)return{error:check.errors.join(" · ")};let run;try{run=await queueAdminRefresh({definition:careerDefinition!,countries,types:types as SnapshotType[],sampleSize,actorUserId:auth.user.id})}catch(error){const code=error instanceof Error?error.message:"REFRESH_FAILED";return{error:["DUPLICATE_ACTIVE_REFRESH","REQUEST_BUDGET_EXCEEDED"].includes(code)?code:"Refresh could not be queued."}}redirect(`/admin/intelligence/runs/${run.runId}`)}
export async function publishCandidateAction(formData:FormData){const auth=await admin(),id=String(formData.get("id")??"");await publishCandidate(auth.accessToken,id);redirect(`/admin/intelligence/candidates/${id}?reviewed=published`)}
export async function rejectCandidateAction(formData:FormData){const auth=await admin(),id=String(formData.get("id")??""),reason=String(formData.get("reason")??"");await rejectCandidate(auth.accessToken,id,reason);redirect(`/admin/intelligence/candidates/${id}?reviewed=rejected`)}
