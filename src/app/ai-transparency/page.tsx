import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AI Transparency",
  description: "How AI is used in AI Role Path, where human judgment remains necessary, and how users should interpret AI-assisted outputs.",
  path: "/ai-transparency",
});

const uses = [
  ["Career exploration", "AI-assisted features may help organize role options, skills, and possible next steps from the information available to the product."],
  ["CV analysis", "AI may extract, summarize, and compare CV information to role requirements. It can miss context, infer incorrectly, or reflect limitations in the source material."],
  ["Roadmaps and learning", "AI may help structure learning paths, project ideas, and career-development sequences. These are guidance, not accreditation or guarantees of employment."],
  ["Career intelligence", "AI can help interpret source-backed market information, but salary, hiring demand, role definitions, and requirements change over time and by location."],
] as const;

export default function AITransparencyPage() {
  return (
    <main className="min-h-screen bg-[#03050e] px-5 py-14 text-slate-200 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Trust</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">AI Transparency</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-400">
          AI Role Path uses AI to assist with analysis, organization, and guidance. AI-generated or AI-assisted output can be incomplete or wrong, so important career decisions should be checked against current job requirements and reliable source material.
        </p>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold text-white">Where AI may be used</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {uses.map(([title, description]) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-violet-300/15 bg-violet-500/[0.055] p-6">
          <h2 className="font-display text-xl font-semibold text-white">Human judgment remains necessary</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            AI Role Path does not know every employer's current hiring criteria, does not guarantee interview or employment outcomes, and should not be treated as the sole basis for financial, legal, immigration, education, or employment decisions.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold text-white">Sources and freshness</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Where career intelligence depends on external evidence, AI Role Path is designed to preserve source context and make methodology visible. Users should check the publication date, geography, and scope of the underlying evidence.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link href="/sources" className="font-semibold text-violet-300 hover:text-violet-200">View sources →</Link>
            <Link href="/methodology" className="font-semibold text-violet-300 hover:text-violet-200">View methodology →</Link>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold text-white">Privacy and data</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Information submitted to AI-assisted features is handled according to the product's privacy notice and the technical controls used by the service. Avoid submitting unnecessary secrets or highly sensitive information.
          </p>
          <Link href="/legal/privacy" className="mt-4 inline-block text-sm font-semibold text-violet-300 hover:text-violet-200">Read the privacy notice →</Link>
        </section>
      </div>
    </main>
  );
}
