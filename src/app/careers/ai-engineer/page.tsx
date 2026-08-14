import type { Metadata } from "next";
import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiEngineerCareer } from "@/data/careers/ai-engineer";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";
import { absoluteUrl, buildMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AI Engineer Career Roadmap",
  description:
    "Follow a production-focused AI Engineer roadmap covering Python, machine learning, LLM applications, RAG, evaluation, deployment, portfolio proof, interviews, and job readiness.",
  path: "/careers/ai-engineer",
  keywords: [
    "AI Engineer",
    "AI Engineer career",
    "AI Engineer roadmap",
    "AI Engineer skills",
    "LLM engineer roadmap",
    "RAG engineer career",
    "production AI engineering",
  ],
});

export default async function AIEngineerCareerPage() {
  const managed = await getPublishedCareer("ai-engineer");
  const career = managed?.data ?? aiEngineerCareer;
  const pageUrl = absoluteUrl("/careers/ai-engineer");
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: "AI Engineer Career Roadmap",
      description: career.shortDescription,
      inLanguage: seoConfig.language,
      isPartOf: { "@id": `${absoluteUrl("/")}#website` },
      about: { "@id": `${pageUrl}#occupation` },
    },
    {
      "@context": "https://schema.org",
      "@type": "Occupation",
      "@id": `${pageUrl}#occupation`,
      name: career.title,
      description: career.shortDescription,
      occupationalCategory: career.category,
      skills: career.overview.responsibilities,
      mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "AI Career OS", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "AI Engineer", item: pageUrl },
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
    </>
  );
}
