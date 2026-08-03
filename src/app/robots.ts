import type { MetadataRoute } from "next";
import { absoluteUrl, isIndexableDeployment } from "@/lib/seo";

const blockedPaths = [
  "/admin/",
  "/api/",
  "/auth/",
  "/account/",
  "/dashboard/",
  "/onboarding/",
  "/callback/",
  "/preview/",
  "/test/",
  "/workspace/",
];

export default function robots(): MetadataRoute.Robots {
  if (!isIndexableDeployment) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
      sitemap: absoluteUrl("/sitemap.xml"),
      host: absoluteUrl("/"),
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: blockedPaths,
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
