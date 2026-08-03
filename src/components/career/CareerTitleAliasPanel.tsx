import { getCareerTitleAliases } from "@/data/careerTitleAliases";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

export default function CareerTitleAliasPanel({ career }: { career: CareerWorkspaceData }) {
  const aliases = getCareerTitleAliases(career);
  if (!aliases.length) return null;

  const primary = aliases.slice(0, 3);
  const remaining = aliases.slice(3);

  return (
    <section aria-label="Related market titles" className="mt-6 max-w-3xl border-l-2 border-violet-300/45 pl-4 sm:pl-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/80">Market title variants</p>
        <span className="hidden h-px w-8 bg-white/10 sm:block" aria-hidden="true" />
        <p className="text-xs text-slate-400">Search by responsibilities, not title alone.</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {primary.map((alias) => (
          <span key={alias.title} className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-medium text-slate-200" title={alias.note}>{alias.title}</span>
        ))}
      </div>
      {remaining.length ? (
        <details className="group mt-3 max-w-2xl">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-violet-200 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">
            <span>View {remaining.length} additional title variants</span>
            <span className="transition group-open:rotate-180" aria-hidden="true">⌄</span>
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {remaining.map((alias) => (
              <span key={alias.title} className="rounded-lg border border-white/8 bg-slate-950/35 px-3 py-2 text-xs text-slate-300" title={alias.note}>{alias.title}</span>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}
