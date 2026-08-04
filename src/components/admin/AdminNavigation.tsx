import Link from "next/link";

export default function AdminNavigation() {
  return <aside className="border-b border-white/10 bg-slate-950/90 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
    <div className="p-5"><p className="eyebrow">Career OS</p><h1 className="mt-2 font-display text-xl font-semibold text-white">Admin Studio</h1></div>
    <nav aria-label="Admin Studio" className="flex gap-2 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1">
      <Link className="block min-h-11 shrink-0 rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" href="/admin">Overview</Link>
      <Link className="block min-h-11 shrink-0 rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" href="/admin/careers">Careers</Link>
      <Link className="block min-h-11 shrink-0 rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" href="/admin/occupations">Occupations</Link>
      <Link className="block min-h-11 shrink-0 rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" href="/admin/intelligence">Intelligence Data</Link>
      <Link className="block min-h-11 shrink-0 rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" href="/admin/intelligence/sources">Source Approvals</Link>
      <Link className="block min-h-11 shrink-0 rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" href="/admin/intelligence/manual-salary">Manual Salary</Link>
      <Link className="block min-h-11 shrink-0 rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" href="/admin/intelligence/official-salary">Official Salary Import</Link>
    </nav>
  </aside>;
}
