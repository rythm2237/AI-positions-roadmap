import Link from "next/link";
import { notFound } from "next/navigation";
import CareerForm from "@/components/admin/CareerForm";
import ArchiveCareerControl from "@/components/admin/ArchiveCareerControl";
import { publishCareerAction, unpublishCareerAction, updateCareerAction } from "@/app/admin/(studio)/careers/actions";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { getCareer, listAudit } from "@/lib/admin/careerRepository";
import { validateCareerPublicationReadiness, validateCareerWorkspaceData } from "@/lib/careerContentValidation";

export default async function EditCareerPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const authorization = await requireAdmin();
  if (authorization.status !== "admin") return null;
  const { id } = await params;
  const [career, audit, query] = await Promise.all([getCareer(authorization.accessToken, id), listAudit(authorization.accessToken, id, 8), searchParams]);
  if (!career) notFound();
  const content = validateCareerWorkspaceData(career.workspace_data, career.slug);
  const publication = validateCareerPublicationReadiness(career.workspace_data, career.slug);
  const resources = content.valid ? content.data.generationMetadata?.resourceStatus : "pending";
  const ready = publication.valid;

  return <main className="p-4 sm:p-8">
    <Link href="/admin/careers" className="text-sm text-cyan-300 underline">← Managed Careers</Link>
    <div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Career Control Center</p><h1 className="mt-2 font-display text-3xl font-semibold text-white">{career.title}</h1><p className="mt-2 text-sm text-slate-400">Status: <span className="font-semibold uppercase text-slate-200">{career.status}</span> · Content v{career.content_version} · Updated {new Date(career.updated_at).toLocaleString()}</p></div><ArchiveCareerControl id={career.id} archived={career.status === "archived"}/></div>
    {query.saved ? <p role="status" className="mt-5 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-200">Career {query.saved} successfully.</p> : null}
    {query.error ? <p role="alert" className="mt-5 rounded-xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">{query.error === "publication-blocked" ? "Publish is locked. Complete every Blueprint and Learning Source requirement shown below." : "The requested state change could not be completed."}</p> : null}

    <section className="mt-7 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[.045] to-transparent p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-slate-500">Publication readiness</p><h2 className="mt-2 text-xl font-semibold text-white">{ready ? "Ready to publish" : "Draft is protected"}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{ready ? `All Career and Learning Source contracts passed. Public URL: /careers/${career.slug}` : "The Career remains private until content, mappings and source approval are complete."}</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${ready ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-200"}`}>{ready ? "All checks passed" : `${publication.valid ? 0 : publication.errors.length} checks remaining`}</span></div>
      <div className="mt-6 grid gap-3 md:grid-cols-3"><StatusCard label="Career Blueprint" state={content.valid ? "complete" : "attention"} detail={content.valid ? `${content.data.journeyStages.length} stages validated` : `${content.errors.length} findings`}/><StatusCard label="Learning Sources" state={resources === "complete" ? "complete" : resources === "needs-review" ? "review" : "pending"} detail={resources === "complete" ? "Approved and mapped" : resources === "needs-review" ? "Ready for Admin approval" : "Generate after Blueprint review"}/><StatusCard label="Publication" state={career.status === "published" ? "complete" : ready ? "review" : "locked"} detail={career.status === "published" ? "Live" : ready ? "Ready for Admin action" : "Locked by validation"}/></div>
      {!ready && !publication.valid ? <details className="mt-5 rounded-xl border border-amber-300/15 bg-amber-400/5 p-4"><summary className="cursor-pointer text-sm font-semibold text-amber-100">Show blocking findings ({publication.errors.length})</summary><ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-5 text-amber-50/75">{publication.errors.map((error)=><li key={error}>{error}</li>)}</ul></details> : null}
      <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5"><Link href={`/admin/careers/${id}/content`} className="btn-secondary min-h-11">Review Blueprint</Link>{career.workspace_data ? <Link href={`/admin/careers/${id}/resources`} className="btn-secondary min-h-11">Learning Sources</Link> : null}{career.workspace_data ? <Link href={`/admin/careers/${id}/preview`} className="btn-secondary min-h-11">Draft Preview</Link> : null}{career.status === "published" ? <form action={unpublishCareerAction}><input type="hidden" name="id" value={id}/><button className="btn-secondary min-h-11">Unpublish</button></form> : <form action={publishCareerAction}><input type="hidden" name="id" value={id}/><button disabled={!ready || career.status === "archived"} className="btn-primary min-h-11 disabled:cursor-not-allowed disabled:opacity-40">Publish Career</button></form>}</div>
    </section>

    <details className="mt-7 max-w-5xl rounded-2xl border border-white/10 bg-white/[.02]"><summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-slate-300">Edit Career identity metadata <span className="ml-2 text-slate-600">⌄</span></summary><div className="border-t border-white/10 p-5"><CareerForm action={updateCareerAction} career={career}/></div></details>
    <section className="mt-8 max-w-5xl rounded-2xl border border-white/10 bg-white/[.025] p-5"><h3 className="font-semibold text-white">Recent audit activity</h3>{audit.length ? <ul className="mt-3 divide-y divide-white/10">{audit.map((entry)=><li key={entry.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span>{entry.action.replace("career.", "Career ")} <span className="text-slate-500">· {(entry.changed_fields.fields ?? []).join(", ")}</span></span><time className="text-slate-500">{new Date(entry.created_at).toLocaleString()}</time></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">No audit activity is available.</p>}</section>
  </main>;
}

function StatusCard({ label, state, detail }: { label: string; state: "complete" | "review" | "pending" | "attention" | "locked"; detail: string }) {
  const classes = state === "complete" ? "bg-emerald-400/10 text-emerald-300" : state === "review" ? "bg-cyan-400/10 text-cyan-200" : state === "attention" ? "bg-rose-400/10 text-rose-200" : "bg-white/5 text-slate-500";
  return <article className="rounded-2xl border border-white/10 bg-black/10 p-4"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-white">{label}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${classes}`}>{state}</span></div><p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p></article>;
}
