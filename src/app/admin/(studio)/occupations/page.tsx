import Link from "next/link";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { buildOccupationInventory, filterOccupationInventory } from "@/lib/admin/occupationInventory";
import type { OccupationInventoryItem } from "@/lib/admin/occupationInventory";
import { listOccupationFamilies, type OccupationFamilyRow } from "@/lib/admin/occupationRepository";

const statuses=[["active","Active"],["draft","Draft"],["archived","Archived"],["unconfigured","Needs setup"]] as const;

export default async function OccupationsPage({searchParams}:{searchParams:Promise<{q?:string;status?:string}>}){
  const auth=await requireAdmin();if(auth.status!=="admin")return null;
  const params=await searchParams;
  let managedFamilies:OccupationFamilyRow[]=[];
  let databaseUnavailable=false;
  try{managedFamilies=await listOccupationFamilies(auth.accessToken)}catch{databaseUnavailable=true}
  const inventory=buildOccupationInventory(managedFamilies);
  const families=filterOccupationInventory(inventory,{search:params.q,status:params.status});
  const configuredCount=inventory.filter(item=>item.managed).length;
  const activeCount=inventory.filter(item=>item.managed?.status==="active").length;
  const draftCount=inventory.filter(item=>item.managed?.status==="draft").length;
  const setupCount=inventory.filter(item=>item.catalog&&!item.managed).length;

  return <main className="p-4 sm:p-8">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Statistical domain</p><h2 className="mt-2 font-display text-3xl font-semibold text-white">Occupation-family inventory</h2><p className="mt-2 max-w-3xl text-sm text-slate-400">All Career OS occupation families are visible here. Statistical mappings and publication remain independently reviewed.</p></div><Link href="/admin/occupations/new" className="btn-primary min-h-11">New occupation family</Link></div>
    {databaseUnavailable?<p role="alert" className="mt-5 rounded-xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">The occupation database is temporarily unavailable. The canonical family catalog remains visible, but configured status and editing links may be incomplete.</p>:null}
    <section aria-label="Occupation-family summary" className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Canonical families" value={inventory.filter(item=>item.catalog).length}/><Metric label="Configured" value={configuredCount}/><Metric label="Active" value={activeCount}/><Metric label={setupCount?"Need setup":"Draft"} value={setupCount||draftCount}/></section>
    <form className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:grid-cols-[1fr_220px_auto]"><label className="text-xs text-slate-400">Search<input name="q" defaultValue={params.q} placeholder="Family, slug or domain" className="input-field mt-1 min-h-11 w-full"/></label><label className="text-xs text-slate-400">Status<select name="status" defaultValue={params.status??""} className="input-field mt-1 min-h-11 w-full"><option value="">All statuses</option>{statuses.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><button className="btn-secondary min-h-11 self-end">Apply</button></form>
    {families.length?<div className="mt-5 grid gap-3 xl:grid-cols-2">{families.map(family=><FamilyCard key={family.slug} family={family}/>)}</div>:<div className="mt-6 rounded-2xl border border-dashed border-white/15 p-10 text-center"><h3 className="font-semibold text-white">No occupation families match these filters</h3><p className="mt-2 text-sm text-slate-500">Clear the search or select All statuses to restore the complete inventory.</p><Link href="/admin/occupations" className="btn-secondary mt-4 inline-flex min-h-11">Clear filters</Link></div>}
  </main>;
}

function FamilyCard({family}:{family:OccupationInventoryItem}){
  const name=family.managed?.name??family.catalog?.name??family.slug;
  const description=family.managed?.description??family.catalog?.description??"Custom database-managed occupation family.";
  const status=family.managed?.status??"needs setup";
  const careerCount=family.catalog?.careerSlugs.length;
  return <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[.02] p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-cyan-300">{family.catalog?.domain??"Custom family"}</p><h3 className="mt-2 font-semibold text-white">{name}</h3></div><span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase text-slate-300">{status}</span></div><p className="mt-3 text-sm leading-6 text-slate-400">{description}</p><div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500"><span>{family.slug}</span><span aria-hidden="true">·</span><span>mapping {family.managed?.mapping_version??family.catalog?.mappingVersion??"custom"}</span>{careerCount?<><span aria-hidden="true">·</span><span>{careerCount} Career{careerCount===1?"":"s"}</span></>:null}</div><div className="mt-auto flex flex-wrap gap-3 pt-5">{family.managed?<Link href={`/admin/occupations/${family.managed.id}`} className="btn-secondary inline-flex min-h-11">Edit family</Link>:family.catalog?<Link href={`/admin/occupations/new?catalog=${family.catalog.slug}`} className="btn-primary inline-flex min-h-11">Set up family</Link>:null}</div></article>
}

function Metric({label,value}:{label:string;value:number}){return <article className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></article>}
