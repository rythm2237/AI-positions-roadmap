import Link from "next/link";
import CareerCompletenessMatrix, { type CareerMatrixItem } from "@/components/admin/CareerCompletenessMatrix";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { listCareers } from "@/lib/admin/careerRepository";
import { buildCareerStudioCatalog } from "@/lib/admin/careerStudio";

export default async function CareerListPage(){
  const authorization=await requireAdmin();if(authorization.status!=="admin")return null;
  const catalog=buildCareerStudioCatalog(await listCareers(authorization.accessToken));
  const items:CareerMatrixItem[]=catalog.map((item)=>({slug:item.catalog.slug,title:item.catalog.title,domain:item.catalog.domain,availability:item.catalog.availability,careerId:item.career?.id??null,contentStatus:item.contentStatus,completion:item.completion,readiness:item.readiness,missingCount:item.missingCount,updatedAt:item.career?.updated_at??null,publishedAt:item.career?.published_at??null,sections:item.sections.map(({id,label,score,state})=>({id,label,score,state}))}));
  const published=items.filter((item)=>item.contentStatus==="published").length,ready=items.filter((item)=>["ready","ready-with-warnings"].includes(item.readiness)).length,average=Math.round(items.reduce((sum,item)=>sum+item.completion,0)/Math.max(items.length,1));
  return <main className="p-4 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Content operations</p><h2 className="mt-2 font-display text-3xl font-semibold text-white">Career catalog</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Review completeness, open missing sections directly, and move validated drafts through approval without changing public content until publication succeeds.</p></div><Link href="/admin/careers/new" className="btn-primary min-h-11">Create custom Career</Link></div><section aria-label="Catalog summary" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Summary label="Supported Careers" value={String(items.length)}/><Summary label="Published in CMS" value={String(published)}/><Summary label="Ready to publish" value={String(ready)}/><Summary label="Average completion" value={`${average}%`}/></section><CareerCompletenessMatrix items={items}/></main>;
}
function Summary({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></div>}
