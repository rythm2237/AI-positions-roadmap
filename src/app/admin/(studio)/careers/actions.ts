"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { AdminRepositoryError, createCareer, listCareers, saveCareerContent, setCareerArchived, setCareerPublication, updateCareer } from "@/lib/admin/careerRepository";
import { careerInputFromForm, validateCareerInput } from "@/lib/admin/careerValidation";
import { evaluateContentQualityGate } from "@/lib/admin/contentQualityGate";
import { validateCareerWorkspaceData } from "@/lib/careerContentValidation";
import type { CareerFormState } from "@/types/adminStudio";

async function adminToken() { const authorization = await requireAdmin(); if (authorization.status !== "admin") throw new Error("ADMIN_REQUIRED"); return authorization.accessToken; }
function safeMutationError(error: unknown): CareerFormState { if (error instanceof AdminRepositoryError && error.code === "duplicate_slug") return { status: "error", message: "That slug is already in use.", fieldErrors: { slug: "Choose a unique slug." } }; return { status: "error", message: "The career could not be saved. Please retry." }; }

export async function createCareerAction(_previous: CareerFormState, formData: FormData): Promise<CareerFormState> {
  const parsed = validateCareerInput(careerInputFromForm(formData));
  if (!parsed.success) return { status: "error", message: "Review the highlighted fields.", fieldErrors: parsed.errors };
  let career;
  try { career = await createCareer(await adminToken(), parsed.value); } catch (error) { return safeMutationError(error); }
  redirect(`/admin/careers/${career.id}?saved=created`);
}
export async function updateCareerAction(_previous: CareerFormState, formData: FormData): Promise<CareerFormState> {
  const id = String(formData.get("id") ?? "");
  const parsed = validateCareerInput(careerInputFromForm(formData), { requireSlug: false });
  if (!/^[0-9a-f-]{36}$/i.test(id) || !parsed.success) return { status: "error", message: "Review the highlighted fields.", fieldErrors: parsed.errors };
  try { await updateCareer(await adminToken(), id, parsed.value); } catch (error) { return safeMutationError(error); }
  redirect(`/admin/careers/${id}?saved=updated`);
}
async function changeArchiveState(formData:FormData,archived:boolean){const id=String(formData.get("id")??"");if(!/^[0-9a-f-]{36}$/i.test(id))throw new Error("INVALID_CAREER");const token=await adminToken();try{await setCareerArchived(token,id,archived)}catch(error){if(error instanceof AdminRepositoryError)redirect(`/admin/careers/${id}?error=${error.code}`);throw error}redirect(`/admin/careers/${id}?saved=${archived?"archived":"restored"}`)}
export async function archiveCareerAction(formData: FormData) { return changeArchiveState(formData,true) }
export async function restoreCareerAction(formData: FormData) { return changeArchiveState(formData,false) }

export async function saveCareerContentAction(formData:FormData){
  const id=String(formData.get("id")??""),raw=String(formData.get("workspaceData")??"");
  if(!/^[0-9a-f-]{36}$/i.test(id))throw new Error("INVALID_CAREER");
  const token=await adminToken();const career=await getCareerForMutation(token,id);
  let value:unknown;try{value=JSON.parse(raw)}catch{redirect(`/admin/careers/${id}/content?error=invalid-json`)}
  const result=validateCareerWorkspaceData(value,career.slug);
  const quality=evaluateContentQualityGate({workspaceData:value,currentCareerId:id,careers:await listCareers(token)});
  const errors=[...result.errors,...quality.errors];
  await saveCareerContent(token,id,value,errors);
  redirect(`/admin/careers/${id}/content?saved=content${errors.length?"&invalid=1":""}`);
}
async function getCareerForMutation(token:string,id:string){const {getCareer}=await import("@/lib/admin/careerRepository");const career=await getCareer(token,id);if(!career)throw new Error("INVALID_CAREER");return career}
export async function publishCareerAction(formData:FormData){return changePublication(formData,true)}
export async function unpublishCareerAction(formData:FormData){return changePublication(formData,false)}
async function changePublication(formData:FormData,publish:boolean){const id=String(formData.get("id")??"");if(!/^[0-9a-f-]{36}$/i.test(id))throw new Error("INVALID_CAREER");const token=await adminToken();const career=await getCareerForMutation(token,id);const result=validateCareerWorkspaceData(career.workspace_data,career.slug);const quality=evaluateContentQualityGate({workspaceData:career.workspace_data,currentCareerId:id,careers:await listCareers(token)});if(publish&&(!result.valid||!quality.passed)){if(quality.errors.length)await saveCareerContent(token,id,career.workspace_data,[...result.errors,...quality.errors]);redirect(`/admin/careers/${id}/content?error=content-invalid`)}await setCareerPublication(token,id,publish);revalidatePath(`/careers/${career.slug}`);revalidatePath("/");redirect(`/admin/careers/${id}?saved=${publish?"published":"unpublished"}`)}
