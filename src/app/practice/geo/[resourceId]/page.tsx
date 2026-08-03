import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";

const labs = {
  "geo-foundational-paper": {
    title: "Generative visibility baseline lab",
    outcome: "Build a reproducible baseline of how a domain is represented and cited across generative answer experiences.",
    tools: ["Google AI Mode or Gemini", "Microsoft Copilot", "Spreadsheet"],
    steps: [
      "Define ten informational queries with a clear audience and intent.",
      "Run each query in two answer engines using a clean session and record the date, engine, answer, cited URLs, and citation position.",
      "Classify each cited source by publisher type, evidence strength, freshness, and relationship to the query.",
      "Separate observations from hypotheses; do not infer causation from one run.",
      "Write three prioritized follow-up tests based on the evidence gaps.",
    ],
    deliverables: ["10-query dataset", "Citation-source comparison", "Evidence limitations note", "Three testable hypotheses"],
  },
  "geo-critical-survey": {
    title: "GEO evidence-maturity review",
    outcome: "Distinguish established search practice, emerging GEO evidence, and unsupported optimization claims.",
    tools: ["Research papers", "Google Search documentation", "Evidence matrix"],
    steps: [
      "Collect ten GEO recommendations from articles, vendors, or internal proposals.",
      "For each recommendation, record the claimed mechanism and expected outcome.",
      "Classify the supporting evidence as primary research, official documentation, observational case study, or unsupported opinion.",
      "Assign a confidence level and document what evidence would change it.",
      "Reject or rewrite recommendations that promise deterministic rankings or citations.",
    ],
    deliverables: ["10-claim evidence matrix", "Confidence rubric", "Rejected-claim log", "Revised recommendation set"],
  },
  "geo-google-ai-features": {
    title: "AI-search eligibility audit",
    outcome: "Verify that representative pages meet the technical and content conditions required to participate in Google Search and AI features.",
    tools: ["Google Search Console", "URL Inspection", "Rich Results Test", "Page source"],
    steps: [
      "Select five representative pages from one domain.",
      "Check index status, canonical selection, rendered HTML, robots directives, and structured-data eligibility.",
      "Confirm that key claims and entities are visible in rendered content, not only injected into metadata.",
      "Record technical blockers separately from content-quality opportunities.",
      "Create a remediation backlog ordered by user impact and technical dependency.",
    ],
    deliverables: ["Five-URL audit", "Rendered-content evidence", "Blocker classification", "Prioritized remediation backlog"],
  },
  "geo-search-essentials": {
    title: "Search Essentials compliance review",
    outcome: "Evaluate a site against technical requirements, spam policies, and people-first content principles.",
    tools: ["Google Search Essentials", "robots.txt tester", "URL Inspection", "Manual page review"],
    steps: [
      "Select one template and five URLs that use it.",
      "Check crawl access, indexability, canonical consistency, internal discovery, and template duplication.",
      "Review the pages for scaled low-value patterns, hidden content, misleading markup, or doorway behavior.",
      "Document which findings are policy risks and which are normal quality improvements.",
      "Define acceptance criteria for the corrected template.",
    ],
    deliverables: ["Template compliance report", "Policy-risk register", "Acceptance criteria", "Validation checklist"],
  },
  "geo-bing-ai-performance": {
    title: "Bing AI Performance analysis",
    outcome: "Use citation and grounding-query data without misrepresenting it as ranking, authority, traffic, or causation.",
    tools: ["Bing Webmaster Tools", "AI Performance export", "Spreadsheet or Power BI"],
    steps: [
      "Export cited-page and grounding-query data for the longest available period.",
      "Create page, topic, and query-intent groupings.",
      "Compare citation volume, cited-page breadth, and citation share where available.",
      "Annotate content releases and technical changes without claiming they caused observed shifts.",
      "Prepare a one-page decision brief with findings, uncertainty, and next tests.",
    ],
    deliverables: ["Cleaned export", "Topic and intent model", "Trend analysis", "Decision brief"],
  },
  "geo-schema": {
    title: "Entity and structured-data implementation lab",
    outcome: "Create valid JSON-LD that accurately represents visible content and entity relationships.",
    tools: ["Schema.org Validator", "Google Rich Results Test", "JSON-LD editor"],
    steps: [
      "Choose a real article, organization, course, product, or defined-term page.",
      "Identify the primary entity, supporting entities, and relationships actually visible on the page.",
      "Implement the minimum accurate JSON-LD; do not add unsupported ratings, authors, or claims.",
      "Validate syntax and eligible rich-result requirements.",
      "Create a maintenance note describing ownership and update triggers.",
    ],
    deliverables: ["Entity map", "Validated JSON-LD", "Before-and-after validation evidence", "Maintenance note"],
  },
  "geo-genai-content": {
    title: "AI-assisted content quality gate",
    outcome: "Review AI-assisted content for originality, evidence, user value, accountability, and publication readiness.",
    tools: ["Source register", "Editorial checklist", "Plagiarism and fact verification tools"],
    steps: [
      "Select one AI-assisted draft and identify its intended audience and decision task.",
      "Verify every material factual claim against a primary or authoritative source.",
      "Remove unsupported generalizations, fabricated examples, and redundant filler.",
      "Add human expertise, limitations, authorship, review ownership, and update criteria.",
      "Run a final usefulness test: can the reader complete the intended task accurately?",
    ],
    deliverables: ["Claim-source register", "Edited article", "Quality-gate checklist", "Publication decision"],
  },
  "geo-quality-guidelines": {
    title: "Source quality and reputation assessment",
    outcome: "Evaluate candidate sources consistently for purpose, expertise, evidence, reputation, transparency, and risk.",
    tools: ["Search Quality Rater Guidelines", "Source evaluation rubric", "Web research"],
    steps: [
      "Choose five sources competing to answer the same high-value query.",
      "Score page purpose, first-hand experience, expertise, evidence, reputation, transparency, and freshness.",
      "Separate page-level quality from domain-level reputation.",
      "Document missing evidence and any high-stakes risks.",
      "Select the strongest source set and justify exclusions.",
    ],
    deliverables: ["Five-source scorecard", "Reputation evidence log", "Risk notes", "Defensible source selection"],
  },
  "geo-search-console": {
    title: "Search performance baseline and anomaly analysis",
    outcome: "Create a reliable pre-intervention baseline for later GEO experiments.",
    tools: ["Google Search Console", "Spreadsheet or Looker Studio"],
    steps: [
      "Export at least 90 days of query and page performance data.",
      "Separate branded and non-branded demand and group queries by intent and topic.",
      "Identify pages with high impressions and weak engagement or unstable visibility.",
      "Annotate seasonality, migrations, releases, and known tracking limitations.",
      "Define the baseline metrics and observation window for one future experiment.",
    ],
    deliverables: ["Clean baseline dataset", "Query taxonomy", "Opportunity shortlist", "Experiment measurement plan"],
  },
  "geo-indexnow": {
    title: "IndexNow implementation and operations test",
    outcome: "Implement controlled URL-change notifications with validation, logging, ownership, and failure handling.",
    tools: ["IndexNow protocol", "HTTP client", "Server or framework integration"],
    steps: [
      "Generate and host a valid IndexNow key.",
      "Submit one controlled URL update and record the request and response.",
      "Test invalid-key, foreign-host, and rate-limit failure scenarios safely.",
      "Define which publish, update, and delete events should trigger submission.",
      "Document retries, monitoring, secrets ownership, and rollback behavior.",
    ],
    deliverables: ["Working submission", "Response log", "Trigger policy", "Operational runbook"],
  },
  "geo-international": {
    title: "Multilingual entity and hreflang architecture lab",
    outcome: "Design a maintainable international architecture with consistent entities, locale URLs, canonicals, and reciprocal hreflang.",
    tools: ["Google international-site guidance", "Hreflang validator", "Crawler"],
    steps: [
      "Choose two languages or regional variants and define the intended audience for each.",
      "Create a URL and entity map showing equivalent and non-equivalent pages.",
      "Implement self-referential and reciprocal hreflang with consistent canonicals.",
      "Validate language, currency, contact, and organization signals in visible content.",
      "Document fallback behavior and publishing ownership.",
    ],
    deliverables: ["Locale URL map", "Validated hreflang set", "Entity consistency review", "Publishing runbook"],
  },
  "geo-career-workbook": {
    title: "GEO portfolio evidence matrix",
    outcome: "Convert career requirements into inspectable evidence rather than unsupported skill claims.",
    tools: ["Target job descriptions", "Portfolio repository", "Evidence matrix"],
    steps: [
      "Collect ten relevant vacancies across GEO, AEO, AI Search, SEO, content intelligence, and organic growth.",
      "Normalize titles and group requirements into research, content, technical, authority, analytics, and stakeholder capabilities.",
      "Map every capability to a specific portfolio artifact or mark it as a gap.",
      "Prioritize two new artifacts that close the highest-value gaps.",
      "Write concise evidence statements for CV and interview use.",
    ],
    deliverables: ["10-role matrix", "Capability taxonomy", "Portfolio evidence map", "Two-artifact build plan"],
  },
} as const;

type LabId = keyof typeof labs;

export async function generateMetadata({ params }: { params: Promise<{ resourceId: string }> }): Promise<Metadata> {
  const { resourceId } = await params;
  const lab = labs[resourceId as LabId];
  if (!lab) return { title: "Practice lab not found", robots: { index: false, follow: false } };
  return buildMetadata({ title: `${lab.title} | GEO Practice Lab`, description: lab.outcome, path: `/practice/geo/${resourceId}` });
}

export default async function GeoPracticeLabPage({ params }: { params: Promise<{ resourceId: string }> }) {
  const { resourceId } = await params;
  const lab = labs[resourceId as LabId];
  if (!lab) notFound();

  return (
    <main className="min-h-screen bg-[#03050e] px-5 py-10 text-slate-100 sm:px-8 lg:px-12">
      <article className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">GEO Practice Lab</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">{lab.title}</h1>
          </div>
          <Link href="/careers/generative-engine-optimization-specialist/learning" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-300/40 hover:text-white">Back to learning</Link>
        </div>

        <section className="mt-8 rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.04] p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Required outcome</p>
          <p className="mt-3 text-lg leading-8 text-slate-200">{lab.outcome}</p>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
            <h2 className="text-2xl font-semibold">Execution steps</h2>
            <ol className="mt-6 space-y-5">
              {lab.steps.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-300/25 bg-violet-400/10 text-sm font-semibold text-violet-200">{index + 1}</span>
                  <p className="pt-1 text-sm leading-6 text-slate-300">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Tools</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {lab.tools.map((tool) => <li key={tool} className="rounded-lg border border-white/8 bg-black/15 px-3 py-2">{tool}</li>)}
              </ul>
            </section>
            <section className="rounded-2xl border border-emerald-300/15 bg-emerald-400/[0.04] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-200">Completion evidence</h2>
              <ul className="mt-4 space-y-3 text-sm leading-5 text-slate-300">
                {lab.deliverables.map((item) => <li key={item} className="flex gap-2"><span className="text-emerald-300">✓</span><span>{item}</span></li>)}
              </ul>
            </section>
          </aside>
        </div>
      </article>
    </main>
  );
}
