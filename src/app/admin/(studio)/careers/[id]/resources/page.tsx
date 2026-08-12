import Link from "next/link";
import { notFound } from "next/navigation";
import CareerResourceStudio from "@/components/admin/CareerResourceStudio";
import { approveCareerResourcesAction } from "@/app/admin/(studio)/careers/actions";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { getCareer } from "@/lib/admin/careerRepository";
import { validateCareerWorkspaceData } from "@/lib/careerContentValidation";

export default async function CareerResourcesPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ approved?: string; error?: string }> }) {
  const authorization = await requireAdmin();
  if (authorization.status !== "admin") return null;
  const { id } = await params;
  const [career, query] = await Promise.all([getCareer(authorization.accessToken, id), searchParams]);
  if (!career) notFound();
  const content = validateCareerWorkspaceData(career.workspace_data, career.slug);

  return <main className="p-4 sm:p-8">
    <Link href={`/admin/careers/${id}/content`} className="text-sm text-cyan-300 underline">← Career Blueprint review</Link>
    <div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Step 3 of 4 · Learning Sources</p><h1 className="mt-2 font-display text-3xl font-semibold text-white">Resource Studio · {career.title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Research, inspect and approve the learning layer separately from the Career Blueprint.</p></div><Link href={`/admin/careers/${id}`} className="btn-secondary min-h-11">Career control center</Link></div>
    <Pipeline current="sources" />
    {query.approved ? <p role="status" className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">Learning sources approved. Publication readiness is now validated in the Career control center.</p> : null}
    {query.error ? <p role="alert" className="mt-5 rounded-xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">{query.error === "resources-incomplete" ? "Some stages are missing a valid Reading, Video or Practice mapping. Regenerate sources and review again." : "Resolve the Career Blueprint validation findings before creating learning sources."}</p> : null}
    <div className="mt-6">{content.valid ? <CareerResourceStudio careerId={id} workspace={content.data} approveAction={approveCareerResourcesAction} /> : <section className="rounded-2xl border border-amber-300/20 bg-amber-400/5 p-6"><h2 className="font-semibold text-amber-100">Career Blueprint needs attention</h2><p className="mt-2 text-sm text-amber-100/70">Learning-source generation is locked until the Blueprint contract passes validation.</p><ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-amber-50/80">{content.errors.map((error)=><li key={error}>{error}</li>)}</ul><Link href={`/admin/careers/${id}/content`} className="btn-primary mt-5 min-h-11">Fix Blueprint findings</Link></section>}</div>
  </main>;
}

function Pipeline({ current }: { current: "sources" }) {
  const steps = [["1", "Title", "complete"], ["2", "Blueprint", "complete"], ["3", "Sources", current], ["4", "Publish", "next"]] as const;
  return <ol aria-label="Career creation progress" className="mt-7 grid gap-2 rounded-2xl border border-white/10 bg-white/[.025] p-3 sm:grid-cols-4">{steps.map(([number,label,status])=><li key={label} className={`flex items-center gap-3 rounded-xl px-3 py-3 ${status===current?"bg-violet-400/10 text-white":"text-slate-500"}`}><span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${status==="complete"?"bg-emerald-400/10 text-emerald-300":status===current?"bg-violet-400/15 text-violet-200":"bg-white/5"}`}>{status==="complete"?"✓":number}</span><span className="text-sm font-semibold">{label}</span></li>)}</ol>;
}
