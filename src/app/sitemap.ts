import type { MetadataRoute } from "next";
import { AVAILABLE_CAREERS } from "@/data/careerCatalog";
import { absoluteUrl, isIndexableDeployment } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexableDeployment) return [];

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/methodology"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/sources"), changeFrequency: "monthly", priority: 0.6 },
  ];

  const careerPages: MetadataRoute.Sitemap = AVAILABLE_CAREERS.map((career) => ({
    url: absoluteUrl(`/careers/${career.slug}`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...careerPages];
}
