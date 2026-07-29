import Link from "next/link";
import CareerForm from "@/components/admin/CareerForm";
import { createCareerAction } from "@/app/admin/(studio)/careers/actions";
export default function NewCareerPage(){return <main className="p-4 sm:p-8"><Link href="/admin/careers" className="text-sm text-cyan-300 underline">← Managed careers</Link><div className="mt-5"><p className="eyebrow">Career Management</p><h2 className="mt-2 font-display text-3xl font-semibold text-white">Create Career draft</h2><p className="mt-2 text-sm text-slate-400">This creates a database-managed draft only. No public page or market refresh is created.</p></div><div className="mt-7 max-w-5xl"><CareerForm action={createCareerAction}/></div></main>}
