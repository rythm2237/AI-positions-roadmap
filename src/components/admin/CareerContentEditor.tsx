"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

type Section = "identity" | "roadmap" | "projects" | "readiness";

export default function CareerContentEditor({
  careerId,
  slug,
  data,
  validationErrors,
  action,
}: {
  careerId: string;
  slug: string;
  data: CareerWorkspaceData | null;
  validationErrors: string[];
  action: (formData: FormData) => void;
}) {
  const [value, setValue] = useState(() => JSON.stringify(data ?? starter(slug), null, 2));
  const [activeSection, setActiveSection] = useState<Section>("identity");
  const parsed = useMemo(() => {
    try {
      return { ok: true as const, data: JSON.parse(value) as CareerWorkspaceData };
    } catch (error) {
      return { ok: false as const, message: error instanceof Error ? error.message : "Invalid JSON" };
    }
  }, [value]);
  const career = parsed.ok ? parsed.data : data;

  if (!career) {
    return (
      <section className="rounded-3xl border border-dashed border-white/15 bg-white/[.02] p-8 text-center">
        <p className="text-lg font-semibold text-white">No Career Blueprint yet</p>
        <p className="mt-2 text-sm text-slate-400">Return to the Generative Career Builder and create the first draft.</p>
        <Link href="/admin/careers/new" className="btn-primary mt-5 min-h-11">Generate Career Blueprint</Link>
      </section>
    );
  }

  const requirements = career.resourceRequirements ?? [];
  const mapped = career.resourceMappings?.filter((mapping) => mapping.status === "complete").length ?? 0;
  const sections: Array<{ id: Section; label: string; count: string }> = [
    { id: "identity", label: "Identity & overview", count: `${career.overview?.responsibilities?.length ?? 0} responsibilities` },
    { id: "roadmap", label: "Roadmap", count: `${career.journeyStages?.length ?? 0} stages` },
    { id: "projects", label: "Projects & portfolio", count: `${career.projects?.length ?? 0} projects` },
    { id: "readiness", label: "Jobs & readiness", count: `${career.readiness?.length ?? 0} criteria` },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[.045] to-transparent p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">Blueprint generated</span>
              <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-200">AI draft · Admin review required</span>
            </div>
            <h3 className="mt-4 font-display text-2xl font-semibold text-white">{career.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{career.shortDescription}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
            <Metric value={career.journeyStages.length} label="Stages" />
            <Metric value={career.projects.length} label="Projects" />
            <Metric value={requirements.length} label="Requirements" />
            <Metric value={`${mapped}/${requirements.length || 0}`} label="Approved maps" />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
          <Link href={`/admin/careers/${careerId}/preview`} className="btn-secondary min-h-11">Preview Career</Link>
          <Link href={`/admin/careers/${careerId}/resources`} className="btn-primary min-h-11">
            {career.globalResources.length ? "Review learning sources" : "Approve blueprint & create learning sources"}
          </Link>
        </div>
      </section>

      {validationErrors.length ? (
        <section className="rounded-2xl border border-amber-300/20 bg-amber-400/5 p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-amber-300" aria-hidden="true">△</span>
            <div>
              <h3 className="font-semibold text-amber-100">{validationErrors.length} validation finding{validationErrors.length === 1 ? "" : "s"}</h3>
              <p className="mt-1 text-xs text-amber-100/65">The draft is safe to inspect, but Publish remains locked until these findings are resolved.</p>
            </div>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {validationErrors.map((error) => <li key={error} className="rounded-xl bg-black/15 px-3 py-2 text-xs leading-5 text-amber-50/80">{error}</li>)}
          </ul>
        </section>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <nav aria-label="Career Blueprint sections" className="h-fit rounded-2xl border border-white/10 bg-white/[.025] p-2 lg:sticky lg:top-5">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              aria-current={activeSection === section.id ? "page" : undefined}
              className={`mb-1 w-full rounded-xl px-4 py-3 text-left transition ${activeSection === section.id ? "bg-violet-400/15 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}
            >
              <span className="block text-sm font-semibold">{section.label}</span>
              <span className="mt-1 block text-xs text-slate-500">{section.count}</span>
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {activeSection === "identity" ? <IdentityReview career={career} /> : null}
          {activeSection === "roadmap" ? <RoadmapReview career={career} /> : null}
          {activeSection === "projects" ? <ProjectsReview career={career} /> : null}
          {activeSection === "readiness" ? <ReadinessReview career={career} /> : null}
        </div>
      </section>

      <details className="group rounded-2xl border border-white/10 bg-white/[.02]">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 text-sm font-semibold text-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">
          <span>Advanced JSON editor</span>
          <span className="text-xs font-normal text-slate-500">For technical recovery and precise schema edits only <span className="ml-2 inline-block transition group-open:rotate-180">⌄</span></span>
        </summary>
        <form action={action} className="border-t border-white/10 p-4 sm:p-5">
          <input type="hidden" name="id" value={careerId} />
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className={`text-xs ${parsed.ok ? "text-emerald-300" : "text-rose-300"}`}>
              {parsed.ok ? "JSON syntax is valid. Server validation runs when saved." : `JSON error: ${parsed.message}`}
            </p>
            <SaveJsonButton disabled={!parsed.ok} />
          </div>
          <textarea
            aria-label="Career workspace JSON"
            spellCheck={false}
            name="workspaceData"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="min-h-[55vh] w-full rounded-2xl border border-white/10 bg-[#060914] p-5 font-mono text-xs leading-6 text-slate-200 outline-none focus:border-cyan-300/50"
          />
        </form>
      </details>
    </div>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return <div className="min-w-20 rounded-xl border border-white/10 bg-black/15 px-3 py-3"><p className="text-lg font-semibold text-white">{value}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">{label}</p></div>;
}

function IdentityReview({ career }: { career: CareerWorkspaceData }) {
  return <div className="space-y-4">
    <ReviewCard title="Professional identity"><p>{career.overview.body}</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><Fact label="Difficulty" value={career.difficulty}/><Fact label="Learning time" value={career.estimatedLearningTime}/><Fact label="Programming" value={career.programmingRequirement}/><Fact label="Communication" value={career.communicationLevel}/></div></ReviewCard>
    <div className="grid gap-4 md:grid-cols-2"><ListCard title="Core responsibilities" items={career.overview.responsibilities}/><ListCard title="Industries" items={career.overview.industries}/></div>
    <ListCard title="Market title variants" items={(career.titleAliases ?? []).map((item) => item.title)} />
  </div>;
}

function RoadmapReview({ career }: { career: CareerWorkspaceData }) {
  return <div className="space-y-3">{career.journeyStages.map((stage, index) => {
    const requirement = career.resourceRequirements?.find((item) => item.milestoneId === stage.id);
    return <details key={stage.id} open={index === 0} className="group rounded-2xl border border-white/10 bg-white/[.025]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">
        <div className="flex items-center gap-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-xs font-bold text-violet-200">{index + 1}</span><div><h4 className="font-semibold text-white">{stage.title}</h4><p className="mt-1 text-xs text-slate-500">{stage.lessons.length} lessons · {stage.tasks.length} tasks · {stage.phaseExam?.questions.length ?? 0} assessment questions</p></div></div>
        <span className="text-slate-500 transition group-open:rotate-180">⌄</span>
      </summary>
      <div className="border-t border-white/10 p-5 text-sm leading-6 text-slate-400"><p>{stage.explanation}</p><div className="mt-5 grid gap-4 md:grid-cols-2"><ListCard title="Lessons" items={stage.lessons}/><ListCard title="Practical evidence" items={stage.tasks.map((task) => task.title)}/></div>{requirement ? <div className="mt-4 rounded-xl border border-cyan-300/10 bg-cyan-400/5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">Resource requirement</p><p className="mt-2 text-sm text-slate-300">{requirement.topic}</p><p className="mt-1 text-xs text-slate-500">Reading · Video · Practice will be researched after Blueprint approval.</p></div> : null}</div>
    </details>;
  })}</div>;
}

function ProjectsReview({ career }: { career: CareerWorkspaceData }) {
  return <div className="grid gap-4 md:grid-cols-2">{career.projects.map((project) => <ReviewCard key={project.id} title={project.title}><p>{project.description}</p><p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Deliverables</p><ul className="mt-2 list-disc space-y-1 pl-5">{project.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></ReviewCard>)}</div>;
}

function ReadinessReview({ career }: { career: CareerWorkspaceData }) {
  return <div className="space-y-4"><ReviewCard title={career.finalChallenge.title}><p>{career.finalChallenge.description}</p><div className="mt-4"><ListCard title="Final deliverables" items={career.finalChallenge.deliverables}/></div></ReviewCard><div className="grid gap-3 sm:grid-cols-2">{career.readiness.map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-white">{item.label}</p><span className="text-xs text-cyan-300">{item.weight}%</span></div><p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p></div>)}</div><ListCard title="Interview practice" items={career.interviewPrep.questions}/></div>;
}

function ReviewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-white/10 bg-white/[.025] p-5 text-sm leading-6 text-slate-400"><h4 className="mb-3 text-base font-semibold text-white">{title}</h4>{children}</section>;
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return <section className="rounded-xl border border-white/10 bg-black/10 p-4"><h5 className="text-sm font-semibold text-slate-200">{title}</h5>{items.length ? <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-5 text-slate-400">{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-2 text-xs text-slate-600">Not generated yet.</p>}</section>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-black/10 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-sm text-slate-300">{value}</p></div>;
}

function SaveJsonButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return <button disabled={disabled || pending} className="btn-secondary min-h-10 disabled:cursor-not-allowed disabled:opacity-40">{pending ? "Saving…" : "Validate & save JSON"}</button>;
}

function starter(slug: string): Partial<CareerWorkspaceData> {
  return { slug, title: "New Career" };
}
