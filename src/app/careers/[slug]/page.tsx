import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiEngineerCareer } from "@/data/careers/ai-engineer";
import { aiAutomationSpecialistCareer } from "@/data/careers/ai-automation-specialist";
import { aiIntegrationSpecialistCareer } from "@/data/careers/ai-integration-specialist";
import { aiTransformationConsultantCareer } from "@/data/careers/ai-transformation-consultant";
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
import { generativeEngineOptimizationSpecialistCareer } from "@/data/careers/generative-engine-optimization-specialist";
import { microsoftCopilotConsultantCareer } from "@/data/careers/microsoft-copilot-consultant-workspace";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";
import { absoluteUrl, buildMetadata, seoConfig } from "@/lib/seo";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

const builtIn: Record<string, CareerWorkspaceData> = {
  "ai-engineer": aiEngineerCareer,
  "ai-automation-specialist": aiAutomationSpecialistCareer,
  "ai-integration-specialist": aiIntegrationSpecialistCareer,
  "ai-transformation-consultant": aiTransformationConsultantCareer,
  "ai-adoption-consultant": aiAdoptionConsultantCareer,
  "ai-marketing-specialist": aiMarketingSpecialistCareer,
  "microsoft-copilot-consultant": microsoftCopilotConsultantCareer,
  "generative-engine-optimization-specialist": generativeEngineOptimizationSpecialistCareer,
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const career = await resolveCareer(slug);
  if (!career) return { title: "Career not found", robots: { index: false, follow: false } };

  const careerSpecificKeywords =
    career.slug === "microsoft-copilot-consultant"
      ? ["Microsoft 365 Copilot consultant", "Copilot Studio consultant"]
      : career.slug === "generative-engine-optimization-specialist"
        ? ["GEO specialist", "generative engine optimization career", "answer engine optimization"]
        : career.slug === "cloud-engineer"
          ? ["cloud engineer roadmap", "cloud infrastructure career", "cloud platform engineer skills"]
          : career.slug === "ai-integration-specialist"
            ? ["AI integration specialist", "AI integration engineer roadmap", "enterprise AI API integration"]
            : career.slug === "ai-transformation-consultant"
              ? ["AI transformation consultant", "enterprise AI transformation roadmap", "AI operating model consultant"]
              : [];

  return buildMetadata({
    title: `${career.title} Career Roadmap`,
    description: career.shortDescription,
    path: `/careers/${career.slug}`,
    keywords: [career.title, `${career.title} career`, `${career.title} roadmap`, `${career.title} skills`, ...careerSpecificKeywords, "AI career roadmap"],
  });
}

export default async function ManagedCareerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const career = await resolveCareer(slug);
  if (!career) notFound();

  const pageUrl = absoluteUrl(`/careers/${career.slug}`);
  const schemas = [
    { "@context": "https://schema.org", "@type": "WebPage", "@id": `${pageUrl}#webpage`, url: pageUrl, name: `${career.title} Career Roadmap`, description: career.shortDescription, inLanguage: seoConfig.language, isPartOf: { "@id": `${absoluteUrl("/")}#website` }, about: { "@id": `${pageUrl}#occupation` } },
    { "@context": "https://schema.org", "@type": "Occupation", "@id": `${pageUrl}#occupation`, name: career.title, description: career.shortDescription, mainEntityOfPage: { "@id": `${pageUrl}#webpage` }, skills: career.overview.responsibilities, occupationalCategory: career.category },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "AI Career OS", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: career.title, item: pageUrl },
    ] },
  ];

  return (
    <>
      {schemas.map((schema) => (
        <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      ))}
      <CareerWorkspace career={career} />
    </>
  );
}
