import { getCareerTitleAliases } from "@/data/careerTitleAliases";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

export default function CareerTitleAliasPanel({
  career,
}: {
  career: CareerWorkspaceData;
}) {
  const aliases = getCareerTitleAliases(career);

  if (!aliases.length) return null;

  return (
    <section
      aria-label="Alternative job titles"
      className="mt-6 max-w-3xl rounded-2xl border border-cyan-300/15 bg-slate-950/45 p-4 backdrop-blur-sm"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/75">
        This career may also be advertised as
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {aliases.map((alias) => (
          <span
            key={alias.title}
            className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-medium text-slate-200"
            title={alias.note}
          >
            {alias.title}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-400">
        Job titles vary by country and employer. Search these titles, then compare the actual responsibilities and required skills.
      </p>
    </section>
  );
}
