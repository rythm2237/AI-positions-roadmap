import Link from "next/link";
import { notFound } from "next/navigation";
import CareerWorkspace from "@/components/career/CareerWorkspace";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { getCareer } from "@/lib/admin/careerRepository";
import { validateCareerPublicationReadiness, validateCareerWorkspaceData } from "@/lib/careerContentValidation";

export default async function CareerPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const authorization = await requireAdmin();
  if (authorization.status !== "admin") return null;
  const { id } = await params;
  const career = await getCareer(authorization.accessToken, id);
  if (!career) notFound();
  const content = validateCareerWorkspaceData(career.workspace_data, career.slug);
  const publication = validateCareerPublicationReadiness(career.workspace_data, career.slug);

  if (!content.valid) return <main className="p-4 sm:p-8"><Link href={`/admin/careers/${id}/content`} className="text-sm text-cyan-300 underline">← Content Studio</Link><section className="mt-6 max-w-4xl rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-400/10 to-transparent p-6 sm:p-8"><p className="eyebrow">Draft preview blocked</p><h1 className="mt-3 font-display text-3xl font-semibold text-white">{content.errors.length} Career Blueprint finding{content.errors.length === 1 ? "" : "s"} need attention</h1><p className="mt-3 text-sm leading-6 text-slate-400">The old preview page stopped here without explaining the problem. Every blocking finding is now visible and linked to the workspace where it can be resolved.</p><ul className="mt-6 grid gap-2 sm:grid-cols-2">{content.errors.map((error)=><li key={error} className="rounded-xl border border-white/10 bg-black/15 p-3 text-sm leading-5 text-amber-50/80">{error}</li>)}</ul><div className="mt-6 flex flex-wrap gap-3"><Link href={`/admin/careers/${id}/content`} className="btn-primary min-h-11">Resolve in Content Studio</Link><Link href={`/admin/careers/${id}`} className="btn-secondary min-h-11">Career control center</Link></div></section></main>;

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
      <aside className="shrink-0 border-b border-violet-300/20 bg-[#0b0c1b] px-4 py-3 text-slate-200 sm:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Admin Draft Preview · {career.title}</p>
            <p className="mt-1 text-xs text-slate-500">{publication.valid ? "Publication checks passed." : `${publication.errors.length} publication check${publication.errors.length === 1 ? "" : "s"} remain; preview is still available for review.`}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href={`/admin/careers/${id}/content`} className="min-h-11 py-3 text-sm font-semibold text-cyan-300 underline">Edit Blueprint</Link>
            <Link href={`/admin/careers/${id}/resources`} className="min-h-11 py-3 text-sm font-semibold text-cyan-300 underline">Learning Sources</Link>
          </div>
        </div>
      </aside>
      <div className="min-h-0 flex-1">
        <CareerWorkspace
          career={content.data}
          embedded
          navigationBasePath={`/admin/careers/${id}/preview`}
          learningSourcesHref={`/admin/careers/${id}/resources`}
        />
      </div>
    </div>
  );
}
