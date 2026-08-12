import Link from "next/link";
import { notFound } from "next/navigation";
import LearningContentEditor from "@/components/admin/LearningContentEditor";
import { saveCareerContentAction } from "@/app/admin/(studio)/careers/actions";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { getCareer } from "@/lib/admin/careerRepository";

export default async function CareerLearningPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{saved?:string;invalid?:string;error?:string}>}){
  const auth=await requireAdmin();if(auth.status!=="admin")return null;
  const {id}=await params;const career=await getCareer(auth.accessToken,id);if(!career)notFound();
  const query=await searchParams;
  if(!career.workspace_data)return <main className="p-4 sm:p-8"><Link href={`/admin/careers/${id}`} className="text-sm text-cyan-300 underline">← Career details</Link><h1 className="mt-5 text-3xl font-semibold text-white">Learning CMS · {career.title}</h1><p className="mt-3 text-slate-400">Create or generate the Career foundation in Content Studio first.</p><Link href={`/admin/careers/${id}/content`} className="btn-primary mt-5 inline-flex min-h-11 items-center">Open Content Studio</Link></main>;
  return <main className="p-4 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><Link href={`/admin/careers/${id}`} className="text-sm text-cyan-300 underline">← Career details</Link><h1 className="mt-4 font-display text-3xl font-semibold text-white">Learning CMS · {career.title}</h1><p className="mt-2 max-w-3xl text-sm text-slate-400">Manage stages and learning resources without editing JSON. AI Resource Finder produces review candidates only; publication remains human-controlled.</p></div><Link href={`/admin/careers/${id}/content`} className="btn-secondary min-h-11">Content Studio</Link></div>{query.saved?<p role="status" className="mt-5 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-200">Learning content saved. {query.invalid?"Validation findings remain before publication.":"Validation passed."}</p>:null}{query.error?<p role="alert" className="mt-5 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-200">The Learning draft could not be saved.</p>:null}<div className="mt-6"><LearningContentEditor careerId={id} data={career.workspace_data} action={saveCareerContentAction}/></div></main>
}
