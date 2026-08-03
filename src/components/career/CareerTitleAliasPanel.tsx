import { getCareerTitleAliases } from "@/data/careerTitleAliases";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

export default function CareerTitleAliasPanel({ career }: { career: CareerWorkspaceData }) {
  const aliases = getCareerTitleAliases(career).slice(0, 6);

  if (!aliases.length) return null;

  return (
    <section aria-label="Related job titles" className="mt-6 max-w-3xl border-l-2 border-cyan-300/30 pl-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/75">Related titles used by employers</p>
        <p className="text-[11px] text-slate-500">Responsibilities matter more than the label.</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {aliases.map((alias) => (
          <span key={alias.title} className="text-sm font-medium text-slate-300" title={alias.note}>
            {alias.title}
          </span>
        ))}
      </div>
    </section>
  );
}
