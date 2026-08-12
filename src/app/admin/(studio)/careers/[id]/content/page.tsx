import Link from "next/link";
import { notFound } from "next/navigation";
import CareerContentEditor from "@/components/admin/CareerContentEditor";
import { saveCareerContentAction } from "@/app/admin/(studio)/careers/actions";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { getCareer } from "@/lib/admin/careerRepository";
import { validateCareerWorkspaceData } from "@/lib/careerContentValidation";

export default async function CareerContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string; invalid?: string; generated?: string }>;
}) {
  const authorization = await requireAdmin();
  if (authorization.status !== "admin") return null;
  const { id } = await params;
  const [career, query] = await Promise.all([getCareer(authorization.accessToken, id), searchParams]);
  if (!career) notFound();
  const validation = validateCareerWorkspaceData(career.workspace_data, career.slug);
  const validationErrors = validation.valid ? [] : validation.errors;

  return <main className="p-4 sm:p-8">
    <Link href={`/admin/careers/${id}`} className="text-sm text-cyan-300 underline">← Career control center</Link>
    <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow">Step 2 of 4 · Blueprint Review</p><h1 className="mt-2 font-display text-3xl font-semibold text-white">Content Studio · {career.title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Review the generated Career identity, roadmap, projects, portfolio, job preparation and assessments before creating learning sources.</p></div>
      {career.workspace_data ? <Link href={`/admin/careers/${id}/preview`} className="btn-secondary min-h-11">Open draft preview</Link> : null}
    </div>
    <Pipeline />
    {query.generated ? <p role="status" className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">Career Blueprint generated and saved as a private Draft. Review the content below, then continue to Learning Sources.</p> : null}
    {query.saved ? <p role="status" className="mt-5 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-200">Content saved as version {career.content_version}. {query.invalid ? "Review the validation findings below." : "Blueprint validation passed."}</p> : null}
    {query.error ? <p role="alert" className="mt-5 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-200">{query.error === "invalid-json" ? "The advanced JSON is malformed." : "Content is incomplete and cannot progress to publication."}</p> : null}
    <div className="mt-6"><CareerContentEditor careerId={id} slug={career.slug} data={career.workspace_data} validationErrors={validationErrors} action={saveCareerContentAction}/></div>
  </main>;
}

function Pipeline() {
  const steps = [["1", "Title", "complete"], ["2", "Blueprint", "current"], ["3", "Sources", "next"], ["4", "Publish", "next"]] as const;
  return <ol aria-label="Career creation progress" className="mt-7 grid gap-2 rounded-2xl border border-white/10 bg-white/[.025] p-3 sm:grid-cols-4">{steps.map(([number,label,status])=><li key={label} className={`flex items-center gap-3 rounded-xl px-3 py-3 ${status==="current"?"bg-violet-400/10 text-white":"text-slate-500"}`}><span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${status==="complete"?"bg-emerald-400/10 text-emerald-300":status==="current"?"bg-violet-400/15 text-violet-200":"bg-white/5"}`}>{status==="complete"?"✓":number}</span><span className="text-sm font-semibold">{label}</span></li>)}</ol>;
}
