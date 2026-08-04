import Link from "next/link";
import { CAREER_STUDIO_SECTIONS, title, type CareerStudioSection } from "@/lib/admin/careerStudio";

export default function CareerStudioNav({ careerId, active, scores }: { careerId: string; active: CareerStudioSection; scores: Partial<Record<CareerStudioSection, number>> }) {
  return <nav aria-label="Career content sections" className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:pb-0">
    {CAREER_STUDIO_SECTIONS.map((section) => <Link key={section} href={`/admin/careers/${careerId}/content?section=${section}`} aria-current={active === section ? "page" : undefined} className={`flex min-h-11 min-w-36 items-center justify-between gap-4 rounded-xl px-3 py-2 text-sm transition ${active === section ? "bg-indigo-500/15 font-semibold text-indigo-100 ring-1 ring-indigo-400/25" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><span>{title(section)}</span><span className="text-[10px] tabular-nums text-slate-500">{scores[section] ?? 0}%</span></Link>)}
  </nav>;
}
