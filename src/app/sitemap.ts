import type { MetadataRoute } from "next";
import { absoluteUrl, isIndexableDeployment } from "@/lib/seo";

const PUBLIC_CAREER_SLUGS = [
  "ai-engineer",
  "ai-automation-specialist",
  "ai-adoption-consultant",
  "ai-marketing-specialist",
  "microsoft-copilot-consultant",
  "data-analyst",
  "data-scientist",
  "bi-developer",
  "ai-knowledge-engineer",
  "data-engineer",
  "devops-engineer",
  "business-ai-consultant",
  "cybersecurity-analyst",
  "cloud-engineer",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexableDeployment) return [];

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const careerPages: MetadataRoute.Sitemap = PUBLIC_CAREER_SLUGS.map((slug) => ({
    url: absoluteUrl(`/careers/${slug}`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...careerPages];
}
