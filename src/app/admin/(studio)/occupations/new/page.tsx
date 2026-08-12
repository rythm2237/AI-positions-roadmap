import Link from "next/link";
import { OccupationForm } from "@/components/admin/OccupationControls";
import { findOccupationFamilyCatalogEntry } from "@/data/occupationFamilyCatalog";
import { requireAdmin } from "@/lib/admin/adminAuth";

export default async function NewOccupationPage({searchParams}:{searchParams:Promise<{catalog?:string}>}){
  const auth=await requireAdmin();if(auth.status!=="admin")return null;
  const query=await searchParams,defaults=query.catalog?findOccupationFamilyCatalogEntry(query.catalog):undefined;
  return <main className="p-4 sm:p-8"><Link href="/admin/occupations" className="text-sm text-cyan-300 underline">← Occupation-family inventory</Link><p className="eyebrow mt-5">Statistical domain</p><h2 className="mt-2 font-display text-3xl font-semibold text-white">{defaults?`Set up ${defaults.name}`:"New occupation family"}</h2><p className="mt-2 max-w-3xl text-sm text-slate-400">Creating the family does not approve an official occupation mapping or publish statistical data.</p><div className="mt-6"><OccupationForm defaults={defaults}/></div></main>
}
