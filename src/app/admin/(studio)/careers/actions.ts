"use server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { AdminRepositoryError, createCareer, setCareerArchived, updateCareer } from "@/lib/admin/careerRepository";
import { careerInputFromForm, validateCareerInput } from "@/lib/admin/careerValidation";
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
