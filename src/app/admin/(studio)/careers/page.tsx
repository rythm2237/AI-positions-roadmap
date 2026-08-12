import Link from "next/link";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { listCareers } from "@/lib/admin/careerRepository";
import { buildCareerInventory, filterCareerInventory } from "@/lib/admin/careerInventory";
import type { CareerInventoryItem } from "@/lib/admin/careerInventory";
import type { ManagedCareer } from "@/types/adminStudio";

const statuses = [
  ["available", "Site: Available"],
  ["planned", "Site: Planned"],
  ["unmanaged", "Admin: Needs setup"],
  ["draft", "Admin: Draft"],
  ["review", "Admin: Review"],
  ["published", "Admin: Published"],
  ["archived", "Admin: Archived"],
] as const;

export default async function CareerListPage({searchParams}:{searchParams:Promise<{q?:string;status?:string}>}){
  const authorization=await requireAdmin();if(authorization.status!=="admin")return null;
  const params=await searchParams;
  let managedCareers:ManagedCareer[]=[];
  let databaseUnavailable=false;
  try{managedCareers=await listCareers(authorization.accessToken)}catch{databaseUnavailable=true}
  const inventory=buildCareerInventory(managedCareers);
  const careers=filterCareerInventory(inventory,{search:params.q,status:params.status});
  const catalogCount=inventory.filter(item=>item.catalog).length;
  const availableCount=inventory.filter(item=>item.catalog?.availability==="available").length;
  const managedCount=inventory.filter(item=>item.managed).length;
  const setupCount=inventory.filter(item=>item.catalog&&!item.managed).length;

  return <main className="p-4 sm:p-8">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Career Management</p><h2 className="mt-2 font-display text-3xl font-semibold text-white">Career inventory</h2><p className="mt-2 max-w-3xl text-sm text-slate-400">Every Career registered on the site is shown here, including code-driven workspaces and database-managed content.</p></div><Link href="/admin/careers/new" className="btn-primary min-h-11">Create Career</Link></div>
    {databaseUnavailable?<p role="alert" className="mt-5 rounded-xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">The managed-Career database is temporarily unavailable. The complete site catalog remains visible, but database status and editing links may be incomplete.</p>:null}
    <section aria-label="Career inventory summary" className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Site catalog" value={catalogCount}/><Metric label="Available workspaces" value={availableCount}/><Metric label="Admin managed" value={managedCount}/><Metric label="Need Admin setup" value={setupCount}/></section>
    <form className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:grid-cols-[1fr_220px_auto]"><label className="text-xs text-slate-400">Search<input name="q" defaultValue={params.q} placeholder="Title, slug or domain" className="input-field mt-1 min-h-11 w-full"/></label><label className="text-xs text-slate-400">Status<select name="status" defaultValue={params.status??""} className="input-field mt-1 min-h-11 w-full"><option value="">All statuses</option>{statuses.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><button className="btn-secondary min-h-11 self-end">Apply</button></form>
    {careers.length?<div className="mt-5 overflow-hidden rounded-2xl border border-white/10"><div className="hidden grid-cols-[1.5fr_1fr_120px_120px_150px] gap-3 bg-white/[.03] px-4 py-3 text-xs uppercase tracking-wide text-slate-500 lg:grid"><span>Career</span><span>Domain</span><span>Site</span><span>Admin</span><span>Actions</span></div>{careers.map(career=><CareerRow key={career.slug} career={career}/>)}</div>:<div className="mt-6 rounded-2xl border border-dashed border-white/15 p-10 text-center"><h3 className="font-semibold text-white">No Careers match these filters</h3><p className="mt-2 text-sm text-slate-500">Clear the search or select All statuses. The full catalog contains {catalogCount} Careers.</p><Link href="/admin/careers" className="btn-secondary mt-4 inline-flex min-h-11">Clear filters</Link></div>}
  </main>;
}

function CareerRow({career}:{career:CareerInventoryItem}){
  const siteStatus=career.catalog?.availability??"custom";
  const contentStatus=!career.managed?"Not set up":career.managed.validation_errors?.length?`${career.managed.validation_errors.length} findings`:career.managed.workspace_data?"Content validated":"Profile only";
  return <article className="grid gap-3 border-t border-white/10 p-4 first:border-t-0 lg:grid-cols-[1.5fr_1fr_120px_120px_150px] lg:items-center"><div><h3 className="font-semibold text-white">{career.title}</h3><p className="mt-1 text-xs text-slate-500">{career.slug} · {contentStatus}</p></div><div><span className="text-xs uppercase text-slate-500 lg:hidden">Domain · </span><span className="text-sm text-slate-300">{career.domain}</span></div><Status label={siteStatus}/><Status label={career.managed?.status??"needs setup"}/><div className="flex flex-wrap gap-x-3 gap-y-2 text-sm font-semibold">{career.managed?<Link className="min-h-11 py-3 text-cyan-300 underline" href={`/admin/careers/${career.managed.id}`}>Edit</Link>:career.catalog?<Link className="min-h-11 py-3 text-cyan-300 underline" href={`/admin/careers/new?catalog=${career.catalog.slug}`}>Set up</Link>:null}{career.catalog?.route?<Link className="min-h-11 py-3 text-slate-300 underline" href={career.catalog.route}>Open</Link>:null}</div></article>
}

function Status({label}:{label:string}){return <span className="w-fit rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase text-slate-300">{label}</span>}
function Metric({label,value}:{label:string;value:number}){return <article className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></article>}
