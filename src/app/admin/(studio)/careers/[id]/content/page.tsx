import Link from "next/link";
import { notFound } from "next/navigation";
import CareerContentEditor from "@/components/admin/CareerContentEditor";
import CareerStudioNav from "@/components/admin/CareerStudioNav";
import { saveCareerContentAction } from "@/app/admin/(studio)/careers/actions";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { getCareer } from "@/lib/admin/careerRepository";
import { CAREER_STUDIO_SECTIONS, scoreCareerSections, type CareerStudioSection } from "@/lib/admin/careerStudio";

export default async function CareerContentPage({ params, searchParams }: { params: Promise<{id:string}>; searchParams: Promise<{saved?:string;error?:string;invalid?:string;section?:string}> }) {
  const auth = await requireAdmin(); if (auth.status !== "admin") return null;
  const { id } = await params, career = await getCareer(auth.accessToken,id); if (!career) notFound();
  const query = await searchParams;
  const section = CAREER_STUDIO_SECTIONS.includes(query.section as CareerStudioSection) ? query.section as CareerStudioSection : "overview";
  const sectionScores = Object.fromEntries(scoreCareerSections(career.workspace_data).map((item) => [item.id,item.score]));
  return <main className="p-4 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-5"><div><Link href={`/admin/careers/${id}`} className="text-sm text-cyan-300 underline">← Career overview</Link><p className="mt-5 eyebrow">Content Studio</p><h2 className="mt-2 font-display text-3xl font-semibold text-white">{career.title}</h2><p className="mt-2 text-sm text-slate-400">Draft v{career.content_version} · {career.status === "published" ? "Published" : "Not public"} · Last edited {new Date(career.updated_at).toLocaleString()}</p></div><div className="flex gap-2">{career.workspace_data ? <Link href={`/admin/careers/${id}/preview`} className="btn-secondary min-h-11">Preview public page</Link> : null}<Link href={`/admin/careers/${id}`} className="btn-secondary min-h-11">Workflow</Link></div></div>
    {query.saved ? <p role="status" className="mt-5 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-200">Draft saved as content version {career.content_version}. {query.invalid ? "Resolve the validation findings before approval." : "Validation passed."}</p> : null}
    {query.error ? <p role="alert" className="mt-5 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-200">{query.error === "invalid-json" ? "The structured data is malformed." : "Content is incomplete and cannot be published."}</p> : null}
    <div className="mt-7 grid gap-6 lg:grid-cols-[210px_minmax(0,1fr)]"><aside className="lg:sticky lg:top-6 lg:self-start"><CareerStudioNav careerId={id} active={section} scores={sectionScores}/></aside><div className="min-w-0">{career.validation_errors?.length ? <details className="mb-5 rounded-xl border border-amber-300/20 bg-amber-400/5 p-4"><summary className="cursor-pointer font-semibold text-amber-100">{career.validation_errors.length} validation findings</summary><ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-100/80">{career.validation_errors.map((error) => <li key={error}>{error}</li>)}</ul></details> : null}<CareerContentEditor careerId={id} slug={career.slug} data={career.workspace_data} section={section} action={saveCareerContentAction}/></div></div>
  </main>;
}
