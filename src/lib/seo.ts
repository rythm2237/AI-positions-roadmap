import type { Metadata } from "next";

const CANONICAL_SITE_URL = "https://www.airolepath.com";

function normalizeSiteUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

export const seoConfig = {
  productName: "AI Role Path",
  siteName: "AI Role Path",
  // Canonical SEO URLs must not depend on a stale deployment environment value
  // during a domain migration. Preview deployments intentionally canonicalize to
  // the production origin as well.
  siteUrl: normalizeSiteUrl(CANONICAL_SITE_URL),
  defaultTitle: "AI Role Path — Practical AI Career Roadmaps & Career Intelligence",
  titleTemplate: "%s · AI Role Path",
  defaultDescription:
    "Explore AI, automation, data, cybersecurity, cloud, and digital transformation careers through practical role paths, skills, projects, salary context, and learning roadmaps.",
  defaultOgImage: "/og-image.png",
  locale: "en_US",
  language: "en",
  entityDescription:
    "AI Role Path is a career planning platform for exploring role-specific roadmaps, skills, projects, learning paths, and source-backed career intelligence.",
  categories: [
    "AI Engineering",
    "AI Automation",
    "AI Product Management",
    "AI Consulting",
    "Data and Analytics",
    "Cybersecurity",
    "Cloud and DevOps",
    "Digital Transformation",
  ] as const,
};

export const isIndexableDeployment =
  process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.NODE_ENV === "production";

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${seoConfig.siteUrl}/`).toString();
}

export function buildMetadata({
  title,
  description,
  path = "/",
  image = seoConfig.defaultOgImage,
  index = true,
  keywords,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  index?: boolean;
  keywords?: string[];
}): Metadata {
  const allowIndexing = index && isIndexableDeployment;
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    authors: [{ name: seoConfig.productName }],
    creator: seoConfig.productName,
    publisher: seoConfig.productName,
    openGraph: {
      type: "website",
      locale: seoConfig.locale,
      url: canonical,
      siteName: seoConfig.siteName,
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${title} — ${seoConfig.siteName}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: allowIndexing,
      follow: allowIndexing,
      googleBot: {
        index: allowIndexing,
        follow: allowIndexing,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function privateRouteMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false, noarchive: true, nosnippet: true },
  };
}
