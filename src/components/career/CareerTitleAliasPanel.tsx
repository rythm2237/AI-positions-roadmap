import { getCareerTitleAliases } from "@/data/careerTitleAliases";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

export default function CareerTitleAliasPanel({ career }: { career: CareerWorkspaceData }) {
  const aliases = getCareerTitleAliases(career).slice(0, 6);
  if (!aliases.length) return null;

  return (
    <section
      aria-label="This career may also be advertised as"
      className="mt-6 max-w-3xl border-l-2 border-cyan-300/30 pl-4"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/75">
          Related titles used by employers
        </p>
        <p className="text-[11px] text-slate-500">
          Use these as search terms; verify the actual responsibilities.
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {aliases.map((alias) => (
          <span
            key={alias.title}
            className="relative pl-3 text-sm font-medium text-slate-300 before:absolute before:left-0 before:top-[.58em] before:h-1 before:w-1 before:rounded-full before:bg-cyan-300/55"
            title={alias.note}
          >
            {alias.title}
          </span>
        ))}
      </div>
    </section>
  );
}
