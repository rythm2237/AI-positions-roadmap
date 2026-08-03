import type { CareerMilestone } from "@/types/careerMilestone";

type Props = {
  milestones: CareerMilestone[];
};

export default function MilestonePreviewList({ milestones }: Props) {
  return (
    <div className="space-y-4">
      {milestones.map((milestone, index) => (
        <article
          key={milestone.id}
          className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018))]"
        >
          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-violet-300">
                  Milestone {index + 1} · {milestone.skillLevel}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">{milestone.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{milestone.summary}</p>
              </div>
              <span className="tag">Resource curation pending</span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <section className="rounded-xl border border-white/10 bg-black/15 p-4">
                <p className="label-sm text-cyan-300">Learning outcomes</p>
                <ul className="mt-3 space-y-2">
                  {milestone.learningOutcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-2 text-sm leading-6 text-slate-300">
                      <span className="text-cyan-300">◇</span>
                      {outcome}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl border border-white/10 bg-black/15 p-4">
                <p className="label-sm text-violet-300">Required skills</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {milestone.skills.map((skill) => (
                    <span key={skill} className="tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            <section className="mt-4 rounded-xl border border-emerald-300/15 bg-emerald-400/[.04] p-4">
              <p className="label-sm text-emerald-300">Practical task</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{milestone.practicalTask}</p>
              <div className="mt-3">
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Deliverables</p>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {milestone.deliverables.map((deliverable) => (
                    <li key={deliverable} className="text-xs leading-5 text-slate-400">
                      • {deliverable}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-white/10 p-4">
              <p className="label-sm text-amber-300">Assessment scope</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {milestone.assessmentScope.map((item) => (
                  <span key={item} className="rounded-lg border border-amber-300/15 bg-amber-300/[.04] px-3 py-2 text-xs text-amber-100">
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <div className="border-t border-white/10 bg-slate-950/45 p-5">
            <p className="label-sm text-slate-400">Required learning formats</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[
                ["Reading", "Pending selection"],
                ["Video", "Pending selection"],
                ["Practice", "Pending selection"],
              ].map(([mode, status]) => (
                <div key={mode} className="rounded-xl border border-dashed border-white/15 bg-white/[.02] p-4">
                  <p className="text-sm font-semibold text-white">{mode}</p>
                  <p className="mt-1 text-xs text-slate-500">{status}</p>
                </div>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
