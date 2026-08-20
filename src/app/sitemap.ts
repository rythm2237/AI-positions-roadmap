import type { MetadataRoute } from "next";
import { AVAILABLE_CAREERS } from "@/data/careerCatalog";
import { absoluteUrl, isIndexableDeployment } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexableDeployment) return [];

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/careers"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/methodology"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/sources"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/security"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/ai-transparency"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/support"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/data-requests"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/legal"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/legal/privacy"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/legal/terms"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/legal/cookies"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/legal/refunds"), changeFrequency: "monthly", priority: 0.4 },
  ];

  const careerPages: MetadataRoute.Sitemap = AVAILABLE_CAREERS.map((career) => ({
    url: absoluteUrl(`/careers/${career.slug}`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...careerPages];
}
