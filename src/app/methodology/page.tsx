import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Career Roadmap Methodology",
  description: "How AI Career OS structures career roadmaps, learning stages, projects, skills, salary context, and review controls.",
  path: "/methodology",
});

const sections = [
  {
    title: "How career roadmaps are structured",
    body: "Each career workspace is organized around role definition, skills, staged learning, practical projects, milestones, and career intelligence. The structure is intended to help users move from exploration to evidence of capability rather than only collecting course links.",
  },
  {
    title: "How role content is created",
    body: "Career content combines curated product structure with source-backed occupational and labor-market information where available. AI may assist drafting, organization, comparison, and quality checks, but published content should be reviewed before it is treated as final guidance.",
  },
  {
    title: "How learning recommendations are selected",
    body: "Learning recommendations are mapped to the capabilities required for a role. They are organized by progression stage and should support a practical outcome such as a portfolio artifact, assessment result, or demonstrable workflow.",
  },
  {
    title: "How salary information should be interpreted",
    body: "Salary figures are contextual indicators, not guarantees. Country, seniority, occupation mapping, data period, currency, employment type, and source methodology can materially change the result. Salary sections should identify their source and update context whenever the underlying data supports it.",
  },
  {
    title: "Limitations",
    body: "AI Career OS provides educational career guidance. It does not guarantee employment, salary, certification, immigration eligibility, or hiring outcomes. Users should verify time-sensitive requirements with the relevant employer, training provider, regulator, or official data publisher.",
  },
];

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-[#03050e] px-6 py-16 text-slate-100">
      <article className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">AI Career OS</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Career roadmap methodology</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">
          This page explains how AI Career OS organizes career guidance and separates curated guidance from source-backed labor-market information.
        </p>
        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              <p className="mt-3 leading-7 text-slate-300">{section.body}</p>
            </section>
          ))}
        </div>
        <nav className="mt-14 flex flex-wrap gap-4 border-t border-white/10 pt-8" aria-label="Methodology resources">
          <Link className="text-cyan-300 underline-offset-4 hover:underline" href="/sources">Review data and source policy</Link>
          <Link className="text-cyan-300 underline-offset-4 hover:underline" href="/">Return to AI Career OS</Link>
        </nav>
      </article>
    </main>
  );
}
