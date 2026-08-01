import { notFound } from "next/navigation";
import CareerWorkspace from "@/components/career/CareerWorkspace";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { getCareer } from "@/lib/admin/careerRepository";
import { validateCareerWorkspaceData } from "@/lib/careerContentValidation";
export default async function CareerPreviewPage({params}:{params:Promise<{id:string}>}){const auth=await requireAdmin();if(auth.status!=="admin")return null;const {id}=await params,career=await getCareer(auth.accessToken,id);if(!career)notFound();const result=validateCareerWorkspaceData(career.workspace_data,career.slug);if(!result.valid)return <main className="p-8 text-slate-200"><h1 className="text-2xl font-semibold">Preview unavailable</h1><p className="mt-3 text-slate-400">Resolve all content validation findings first.</p></main>;return <CareerWorkspace career={result.data}/>}
