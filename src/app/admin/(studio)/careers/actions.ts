"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { AdminRepositoryError, createCareer, saveCareerContent, setCareerArchived, setCareerPublication, updateCareer } from "@/lib/admin/careerRepository";
import { careerInputFromForm, validateCareerInput } from "@/lib/admin/careerValidation";
import { validateCareerPublicationReadiness, validateCareerWorkspaceData } from "@/lib/careerContentValidation";
import {
  mappingHasAdaptiveCoverage,
  resourceIsFresh,
  resourcePassesDirectDestinationGate,
} from "@/lib/learning/adaptiveLearningContract";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";
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
  await saveCareerContent(token,id,value,result.errors);
  redirect(`/admin/careers/${id}/content?saved=content${result.valid?"":"&invalid=1"}`);
}
async function getCareerForMutation(token:string,id:string){const {getCareer}=await import("@/lib/admin/careerRepository");const career=await getCareer(token,id);if(!career)throw new Error("INVALID_CAREER");return career}
export async function publishCareerAction(formData:FormData){return changePublication(formData,true)}
export async function unpublishCareerAction(formData:FormData){return changePublication(formData,false)}
async function changePublication(formData:FormData,publish:boolean){const id=String(formData.get("id")??"");if(!/^[0-9a-f-]{36}$/i.test(id))throw new Error("INVALID_CAREER");const token=await adminToken();const career=await getCareerForMutation(token,id);const result=validateCareerPublicationReadiness(career.workspace_data,career.slug);if(publish&&!result.valid)redirect(`/admin/careers/${id}?error=publication-blocked`);await setCareerPublication(token,id,publish);revalidatePath(`/careers/${career.slug}`);revalidatePath("/");redirect(`/admin/careers/${id}?saved=${publish?"published":"unpublished"}`)}

export async function approveCareerResourcesAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("INVALID_CAREER");
  const token = await adminToken();
  const career = await getCareerForMutation(token, id);
  const content = validateCareerWorkspaceData(career.workspace_data, career.slug);
  if (!content.valid) redirect(`/admin/careers/${id}/resources?error=content-invalid`);

  const workspace = content.data;
  const requirements = workspace.resourceRequirements ?? [];
  const resourcesById = new Map(workspace.globalResources.map((resource) => [resource.id, resource]));
  const completeMappings = (workspace.resourceMappings ?? []).map((mapping) => {
    const reading = resourcesById.get(mapping.reading ?? "");
    const video = resourcesById.get(mapping.video ?? "");
    const course = resourcesById.get(mapping.course ?? "");
    const practice = resourcesById.get(mapping.practice ?? "");
    const extension = course ?? practice;
    const hasRequiredModes = Boolean(
      reading && ["Documentation", "Article"].includes(reading.type)
      && video?.type === "Video"
      && extension && ["Course", "Learning Path", "Practice", "Exam"].includes(extension.type)
      && [reading, video, extension].every(resourcePassesDirectDestinationGate)
      && [reading, video, extension].every(resourceIsFresh),
    );
    return { ...mapping, status: hasRequiredModes ? "complete" as const : mapping.status };
  });
  const approved: CareerWorkspaceData = {
    ...workspace,
    resourceMappings: completeMappings,
    generationMetadata: workspace.generationMetadata ? {
      ...workspace.generationMetadata,
      blueprintStatus: "reviewed",
      resourceStatus: requirements.length > 0 && completeMappings.length === requirements.length
        && completeMappings.every((mapping) => mapping.status === "complete" && mappingHasAdaptiveCoverage(mapping))
        ? "complete"
        : workspace.generationMetadata.resourceStatus,
    } : workspace.generationMetadata,
  };
  const publication = validateCareerPublicationReadiness(approved, career.slug);
  if (!publication.valid) {
    await saveCareerContent(token, id, approved, publication.errors);
    redirect(`/admin/careers/${id}/resources?error=resources-incomplete`);
  }
  await saveCareerContent(token, id, approved, []);
  revalidatePath(`/admin/careers/${id}`);
  revalidatePath(`/admin/careers/${id}/resources`);
  redirect(`/admin/careers/${id}/resources?approved=1`);
}