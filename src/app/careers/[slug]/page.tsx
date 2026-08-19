import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CareerWorkspace from "@/components/career/CareerWorkspace";
import { AVAILABLE_CAREERS } from "@/data/careerCatalog";
import { aiEngineerCareer } from "@/data/careers/ai-engineer";
import { aiAutomationSpecialistCareer } from "@/data/careers/ai-automation-specialist";
import {
  aiAdoptionConsultantCareer,
  aiMarketingSpecialistCareer,
  dataAnalystCareer,
  dataScientistCareer,
} from "@/data/careers/activation-batch-five";
import {
  aiKnowledgeEngineerCareer,
  biDeveloperCareer,
  businessAiConsultantCareer,
  dataEngineerCareer,
  devOpsEngineerCareer,
} from "@/data/careers/activation-batch-six";
import { cloudEngineerCareer } from "@/data/careers/cloud-engineer";
import { cybersecurityAnalystCareer } from "@/data/careers/cybersecurity-analyst";
import { enterpriseAiConsultantCareer } from "@/data/careers/enterprise-ai-consultant";
import { generativeEngineOptimizationSpecialistCareer } from "@/data/careers/generative-engine-optimization-specialist";
import { microsoftCopilotConsultantCareer } from "@/data/careers/microsoft-copilot-consultant-workspace";
import { occupationFamilyForRoadmap } from "@/lib/intelligence/occupationRepository";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";
import { absoluteUrl, buildMetadata, seoConfig } from "@/lib/seo";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

const builtIn: Record<string, CareerWorkspaceData> = {
  "ai-engineer": aiEngineerCareer,
  "ai-automation-specialist": aiAutomationSpecialistCareer,
  "ai-adoption-consultant": aiAdoptionConsultantCareer,
  "ai-marketing-specialist": aiMarketingSpecialistCareer,
  "microsoft-copilot-consultant": microsoftCopilotConsultantCareer,
  "generative-engine-optimization-specialist": generativeEngineOptimizationSpecialistCareer,
  "enterprise-ai-consultant": enterpriseAiConsultantCareer,
  "data-analyst": dataAnalystCareer,
  "data-scientist": dataScientistCareer,
  "bi-developer": biDeveloperCareer,
  "ai-knowledge-engineer": aiKnowledgeEngineerCareer,
  "data-engineer": dataEngineerCareer,
  "devops-engineer": devOpsEngineerCareer,
  "business-ai-consultant": businessAiConsultantCareer,
  "cybersecurity-analyst": cybersecurityAnalystCareer,
  "cloud-engineer": cloudEngineerCareer,
};

async function resolveCareer(slug: string) {
  const managed = await getPublishedCareer(slug);
  return managed?.data ?? builtIn[slug] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const career = await resolveCareer(slug);

  if (!career) {
    return {
      title: "Career not found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${career.title} Career Roadmap`;
  const description = career.shortDescription;
  const careerSpecificKeywords =
    career.slug === "microsoft-copilot-consultant"
      ? ["Microsoft 365 Copilot consultant", "Copilot Studio consultant"]
      : career.slug === "enterprise-ai-consultant"
        ? ["enterprise AI consultant", "enterprise AI strategy", "AI governance consultant", "enterprise AI advisory"]
        : career.slug === "generative-engine-optimization-specialist"
          ? ["GEO specialist", "generative engine optimization career", "answer engine optimization"]
          : career.slug === "cloud-engineer"
            ? ["cloud engineer roadmap", "cloud infrastructure career", "cloud platform engineer skills"]
            : [];

  return buildMetadata({
    title,
    description,
    path: `/careers/${career.slug}`,
    keywords: [
      career.title,
      `${career.title} career`,
      `${career.title} roadmap`,
      `${career.title} skills`,
      ...careerSpecificKeywords,
      "AI career roadmap",
    ],
  });
}

export default async function ManagedCareerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const career = await resolveCareer(slug);
  if (!career) notFound();

  const pageUrl = absoluteUrl(`/careers/${career.slug}`);
  const occupationSkills = Array.from(
    new Set(career.projects.flatMap((project) => project.skills).filter(Boolean)),
  ).slice(0, 30);
  const relatedCareerLinks = career.relatedCareers
    .map((reference) => {
      const normalized = reference.trim().toLowerCase();
      return AVAILABLE_CAREERS.find(
        (candidate) =>
          candidate.slug.toLowerCase() === normalized ||
          candidate.title.toLowerCase() === normalized,
      );
    })
    .filter((candidate): candidate is (typeof AVAILABLE_CAREERS)[number] => Boolean(candidate))
    .filter(
      (candidate, index, collection) =>
        candidate.slug !== career.slug &&
        collection.findIndex((item) => item.slug === candidate.slug) === index,
    );
  const occupationFamily = await occupationFamilyForRoadmap(career.slug).catch(() => null);
  const marketIntelligencePath = occupationFamily
    ? `/career-intelligence/occupations/${occupationFamily.slug}`
    : null;
  const semanticRelatedLinks = [
    ...relatedCareerLinks.map((item) => absoluteUrl(`/careers/${item.slug}`)),
    ...(marketIntelligencePath ? [absoluteUrl(marketIntelligencePath)] : []),
  ];

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: `${career.title} Career Roadmap`,
      description: career.shortDescription,
      inLanguage: seoConfig.language,
      isPartOf: { "@id": `${absoluteUrl("/")}#website` },
      about: { "@id": `${pageUrl}#occupation` },
      ...(semanticRelatedLinks.length ? { relatedLink: semanticRelatedLinks } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "Occupation",
      "@id": `${pageUrl}#occupation`,
      name: career.title,
      description: career.shortDescription,
      mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
      ...(occupationSkills.length ? { skills: occupationSkills } : {}),
      occupationalCategory: career.category,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "AI Career OS", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Careers", item: absoluteUrl("/careers") },
        { "@type": "ListItem", position: 3, name: career.title, item: pageUrl },
      ],
    },
  ];

  return (
    <>
      {schemas.map((schema) => (
        <script
          key={schema["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
        />
      ))}
      <CareerWorkspace career={career} />

      <section className="border-t border-white/10 bg-[#050817] px-5 py-10 text-white sm:px-8" aria-labelledby="job-agent-title">
        <div className="mx-auto grid max-w-6xl gap-6 rounded-3xl border border-violet-300/20 bg-gradient-to-br from-violet-400/[.09] via-white/[.025] to-cyan-400/[.05] p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-300">Final execution stage</p>
            <h2 id="job-agent-title" className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Activate your Job Application Agent</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              When you are ready to move from preparation into applications, the Agent can use your career profile, roadmap, CV, skills and projects to find matching roles, calculate Fit Scores, prepare tailored application packs and keep your application history organized.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
              <span>✓ Reuses your Career Identity</span><span>✓ No fabricated experience</span><span>✓ User-controlled authority</span><span>✓ Transparent ATS status</span>
            </div>
          </div>
          <Link
            href={`/job-agent?career=${encodeURIComponent(career.slug)}`}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            Start job search →
          </Link>
        </div>
      </section>

      {occupationFamily && marketIntelligencePath ? (
        <section className="border-t border-white/10 bg-[#050817] px-5 py-8 text-white sm:px-8" aria-labelledby="market-evidence-title">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.045] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">Evidence layer</p>
              <h2 id="market-evidence-title" className="mt-2 font-display text-xl font-semibold sm:text-2xl">
                Verified market evidence for {occupationFamily.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Salary and market evidence is kept separate from the learning roadmap. Only published snapshots are shown, with provider, publication, and retrieval dates preserved where data is available.
              </p>
            </div>
            <Link
              href={marketIntelligencePath}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              View market evidence →
            </Link>
          </div>
        </section>
      ) : null}

      <section className="border-t border-white/10 bg-[#03050e] px-5 py-10 text-white sm:px-8" aria-labelledby="related-careers-title">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-300">Keep exploring</p>
              <h2 id="related-careers-title" className="mt-2 font-display text-2xl font-semibold">Related careers</h2>
            </div>
            <Link href="/careers" className="text-sm font-semibold text-violet-300 transition hover:text-violet-200">
              Browse all careers →
            </Link>
          </div>
          {relatedCareerLinks.length ? (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCareerLinks.map((related) => (
                <li key={related.slug}>
                  <Link
                    href={`/careers/${related.slug}`}
                    className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-violet-300/30 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                  >
                    <span className="text-xs font-medium text-slate-500">{related.domain}</span>
                    <span className="mt-1 block font-display text-base font-semibold text-white">{related.title}</span>
                    <span className="mt-2 block text-sm leading-6 text-slate-400">{related.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-sm leading-6 text-slate-400">
              Explore the full Career Network to compare other available paths.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
