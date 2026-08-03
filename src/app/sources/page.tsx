import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Data Sources and Editorial Policy",
  description: "How AI Career OS handles occupational data, salary sources, editorial review, AI assistance, updates, and corrections.",
  path: "/sources",
});

export default function SourcesPage() {
  return (
    <main className="min-h-screen bg-[#03050e] px-6 py-16 text-slate-100">
      <article className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Transparency</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Data sources and editorial policy</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">
          AI Career OS distinguishes product guidance from official occupational and labor-market data. A visible source should support claims that depend on external datasets.
        </p>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Preferred source hierarchy</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-6 leading-7 text-slate-300">
            <li>Official national statistical agencies and government labor-market datasets.</li>
            <li>Primary occupational classifications and official documentation.</li>
            <li>Recognized education and technology-provider documentation for tool-specific requirements.</li>
            <li>Reputable secondary research only when primary data is unavailable or requires interpretation.</li>
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Salary and employment data</h2>
          <p className="mt-3 leading-7 text-slate-300">
            Salary data must be presented with its geography, occupation mapping, time period, currency, and source context when those fields are available. It should not be represented as a guaranteed offer, personal forecast, or universal market rate.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">AI-assisted content</h2>
          <p className="mt-3 leading-7 text-slate-300">
            AI may assist with drafting, structuring, summarizing, taxonomy mapping, and consistency checks. AI-generated text is not itself a source. Claims that depend on external facts should remain traceable to an underlying publisher or dataset.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Updates and corrections</h2>
          <p className="mt-3 leading-7 text-slate-300">
            Time-sensitive career intelligence should be reviewed when its source changes or becomes outdated. Corrections should preserve the distinction between editorial guidance and official data rather than silently replacing one with the other.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Current limitation</h2>
          <p className="mt-3 leading-7 text-slate-300">
            Not every career section currently exposes complete source-level provenance. Source coverage will expand as career intelligence datasets and review workflows are published. Unsupported statistics, reviews, partnerships, and outcome claims are not added for marketing purposes.
          </p>
        </section>

        <nav className="mt-14 flex flex-wrap gap-4 border-t border-white/10 pt-8" aria-label="Source policy resources">
          <Link className="text-cyan-300 underline-offset-4 hover:underline" href="/methodology">Read the roadmap methodology</Link>
          <Link className="text-cyan-300 underline-offset-4 hover:underline" href="/">Return to AI Career OS</Link>
        </nav>
      </article>
    </main>
  );
}
