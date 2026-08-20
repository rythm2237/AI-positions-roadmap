import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

const modules = ["Settings"];
export default function AdminNavigation() {
  return <aside className="border-b border-white/10 bg-slate-950/90 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
    <div className="p-5"><Link href="/" className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" aria-label="AI Role Path home"><BrandLogo className="h-7 w-auto" /></Link><h1 className="mt-3 font-display text-xl font-semibold text-white">Admin Studio</h1></div>
    <nav aria-label="Admin Studio" className="flex gap-2 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1">
      <Link className="block min-h-11 shrink-0 rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" href="/admin">Overview</Link>
      <Link className="block min-h-11 shrink-0 rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" href="/admin/careers">Careers</Link>
      <Link className="block min-h-11 shrink-0 rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" href="/admin/occupations">Occupations</Link>
      <Link className="block min-h-11 shrink-0 rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" href="/admin/intelligence">Intelligence Data</Link>
      <Link className="block min-h-11 shrink-0 rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" href="/admin/intelligence/sources">Source Approvals</Link>
      <Link className="block min-h-11 shrink-0 rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" href="/admin/intelligence/manual-salary">Manual Salary</Link>
      <Link className="block min-h-11 shrink-0 rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" href="/admin/intelligence/official-salary">Official Salary Import</Link>
      {modules.map((module) => <span key={module} aria-disabled="true" className="block min-h-11 shrink-0 cursor-not-allowed rounded-xl px-3 py-3 text-sm text-slate-600"><span>{module}</span><span className="ml-2 text-[10px] font-semibold uppercase tracking-wide">Coming next</span></span>)}
    </nav>
  </aside>;
}
