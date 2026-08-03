import catalogData from "../../../content/references/reference-catalog.json";
import cybersecurityCatalogData from "../../../content/references/cybersecurity-reference-catalog.json";
import cybersecurityStageCatalogData from "../../../content/references/cybersecurity-stage-reference-catalog.json";
import geoCatalogData from "../../../content/references/geo-reference-catalog.json";
import type {
  ReferenceLearningOption,
  ReferenceResource,
  ReferenceSegment,
  ResolvedReference,
} from "@/types/reference";

const catalog = [
  ...(catalogData as ReferenceResource[]),
  ...(cybersecurityCatalogData as ReferenceResource[]),
  ...(cybersecurityStageCatalogData as ReferenceResource[]),
  ...(geoCatalogData as ReferenceResource[]),
];
const byId = new Map(catalog.map((item) => [item.id, item]));

type GeoSupplementSpec = {
  videoTitle: string;
  videoUrl: string;
  videoProvider: string;
  practiceTitle: string;
  practiceUrl: string;
  practiceProvider: string;
};

const geoSupplementSpecs: Record<string, GeoSupplementSpec> = {
  "geo-foundational-paper": {
    videoTitle: "How Google Search works",
    videoUrl: "https://www.youtube.com/@GoogleSearchCentral",
    videoProvider: "Google Search Central",
    practiceTitle: "Build a 10-query citation audit",
    practiceUrl: "/methodology",
    practiceProvider: "AI Career OS",
  },
  "geo-critical-survey": {
    videoTitle: "Search evidence and quality sessions",
    videoUrl: "https://www.youtube.com/@GoogleSearchCentral",
    videoProvider: "Google Search Central",
    practiceTitle: "Run an evidence-maturity review",
    practiceUrl: "/methodology",
    practiceProvider: "AI Career OS",
  },
  "geo-google-ai-features": {
    videoTitle: "Google Search Central: AI and Search",
    videoUrl: "https://www.youtube.com/@GoogleSearchCentral",
    videoProvider: "Google Search Central",
    practiceTitle: "Establish an AI-search technical baseline",
    practiceUrl: "https://search.google.com/search-console/about",
    practiceProvider: "Google Search Console",
  },
  "geo-search-essentials": {
    videoTitle: "SEO Made Easy",
    videoUrl: "https://www.youtube.com/@GoogleSearchCentral",
    videoProvider: "Google Search Central",
    practiceTitle: "Complete a five-URL eligibility audit",
    practiceUrl: "https://search.google.com/search-console/about",
    practiceProvider: "Google Search Console",
  },
  "geo-bing-ai-performance": {
    videoTitle: "Bing Webmaster learning center",
    videoUrl: "https://www.bing.com/webmasters/help",
    videoProvider: "Microsoft Bing",
    practiceTitle: "Create a Bing AI Performance baseline",
    practiceUrl: "https://www.bing.com/webmasters/about",
    practiceProvider: "Bing Webmaster Tools",
  },
  "geo-schema": {
    videoTitle: "Getting started with structured data",
    videoUrl: "https://www.youtube.com/watch?v=tDpVxLqXCew",
    videoProvider: "Google Search Central",
    practiceTitle: "Validate an entity markup implementation",
    practiceUrl: "https://validator.schema.org/",
    practiceProvider: "Schema.org",
  },
  "geo-genai-content": {
    videoTitle: "People-first content and Search quality",
    videoUrl: "https://www.youtube.com/@GoogleSearchCentral",
    videoProvider: "Google Search Central",
    practiceTitle: "Audit an AI-assisted article",
    practiceUrl: "/sources",
    practiceProvider: "AI Career OS",
  },
  "geo-quality-guidelines": {
    videoTitle: "Search quality and trust sessions",
    videoUrl: "https://www.youtube.com/@GoogleSearchCentral",
    videoProvider: "Google Search Central",
    practiceTitle: "Score five competing sources",
    practiceUrl: "/methodology",
    practiceProvider: "AI Career OS",
  },
  "geo-search-console": {
    videoTitle: "Search Console training",
    videoUrl: "https://www.youtube.com/@GoogleSearchCentral",
    videoProvider: "Google Search Central",
    practiceTitle: "Build a 90-day search baseline",
    practiceUrl: "https://search.google.com/search-console/about",
    practiceProvider: "Google Search Console",
  },
  "geo-indexnow": {
    videoTitle: "Bing Webmaster indexing guidance",
    videoUrl: "https://www.bing.com/webmasters/help",
    videoProvider: "Microsoft Bing",
    practiceTitle: "Implement a test IndexNow submission",
    practiceUrl: "https://www.indexnow.org/documentation",
    practiceProvider: "IndexNow",
  },
  "geo-international": {
    videoTitle: "International SEO guidance",
    videoUrl: "https://www.youtube.com/@GoogleSearchCentral",
    videoProvider: "Google Search Central",
    practiceTitle: "Design and validate a multilingual URL map",
    practiceUrl: "https://search.google.com/search-console/about",
    practiceProvider: "Google Search Console",
  },
  "geo-career-workbook": {
    videoTitle: "Technical communication examples",
    videoUrl: "https://www.youtube.com/@GoogleSearchCentral",
    videoProvider: "Google Search Central",
    practiceTitle: "Build your GEO evidence matrix",
    practiceUrl: "/methodology",
    practiceProvider: "AI Career OS",
  },
};

function buildGeoSupplements(resource: ReferenceResource | ResolvedReference): ReferenceLearningOption[] {
  const spec = geoSupplementSpecs[resource.id];
  if (!spec) return [];
  return [
    {
      mode: "video",
      contentType: "video-course",
      title: spec.videoTitle,
      description: `Watch verified provider material that supports the ${resource.title} milestone.`,
      url: spec.videoUrl,
      provider: spec.videoProvider,
      durationLabel: "30-60 minutes",
      isOfficial: true,
      access: "free",
      verifiedContentType: true,
      verifiedAt: "2026-08-03",
      verificationSource: "official-provider-channel-or-learning-center",
    },
    {
      mode: "practice",
      contentType: "hands-on-lab",
      title: spec.practiceTitle,
      description: `Complete an applied exercise and save reviewable evidence for the ${resource.title} milestone.`,
      url: spec.practiceUrl,
      provider: spec.practiceProvider,
      durationLabel: "60-120 minutes",
      isOfficial: true,
      access: "free",
      verifiedContentType: true,
      verifiedAt: "2026-08-03",
      verificationSource: "official-tool-or-curated-career-practice",
    },
  ];
}

function segmentUrl(resource: ReferenceResource, segment?: ReferenceSegment): string {
  if (!segment) return resource.canonicalUrl;
  if (segment.lessonUrl) return segment.lessonUrl;
  const url = new URL(resource.canonicalUrl);
  if (segment.anchor) url.hash = segment.anchor;
  if (typeof segment.timestampSeconds === "number") url.searchParams.set("t", String(segment.timestampSeconds));
  return url.toString();
}

export function getReferenceLearningOptions(resource: ReferenceResource | ResolvedReference): ReferenceLearningOption[] {
  const baseOptions: ReferenceLearningOption[] = resource.learningOptions?.length
    ? [...resource.learningOptions]
    : [
        {
          mode: "reading",
          title: resource.title,
          description: resource.description,
          url: resource.canonicalUrl,
          provider: resource.provider,
          durationLabel: resource.durationLabel,
          isOfficial: resource.isOfficial,
          access: resource.access,
          contentType: "documentation",
          verifiedContentType: false,
          verifiedAt: resource.lastVerifiedAt,
          verificationSource: "legacy-registry-fallback",
        },
      ];

  const existingModes = new Set(baseOptions.map((option) => option.mode));
  const supplements = buildGeoSupplements(resource).filter((option) => !existingModes.has(option.mode));
  return [...baseOptions, ...supplements];
}

export function resolveReference(referenceId: string, includeUnavailable = false): ResolvedReference | null {
  const resource = byId.get(referenceId);
  if (!resource) return null;
  if (resource.status === "replaced" && resource.replacedBy) return resolveReference(resource.replacedBy, includeUnavailable);
  const available = resource.status === "active" || resource.status === "needs-review";
  if (!available && !includeUnavailable) return null;
  return {
    ...resource,
    url: resource.canonicalUrl,
    available,
    warning:
      resource.status === "needs-review"
        ? "This resource is awaiting review."
        : available
          ? undefined
          : `This resource is ${resource.status}.`,
  };
}

export function resolveReferenceSegment(referenceId: string, segmentId?: string): ResolvedReference | null {
  const resolved = resolveReference(referenceId, true);
  if (!resolved) return null;
  if (!segmentId) return resolved;
  const segment = resolved.segments.find((item) => item.id === segmentId);
  if (!segment) return { ...resolved, available: false, warning: "The requested resource section is unavailable." };
  return { ...resolved, url: segmentUrl(resolved, segment) };
}

export function resolveCareerStepReferences(referenceIds: string[]): ResolvedReference[] {
  return Array.from(new Set(referenceIds))
    .map((id) => resolveReference(id, true))
    .filter((item): item is ResolvedReference => Boolean(item));
}

export function getActiveReferencesForTopic(topic: string, level?: string, language = "en") {
  return catalog.filter(
    (item) =>
      (item.status === "active" || item.status === "needs-review") &&
      item.topics.includes(topic) &&
      item.languages.includes(language) &&
      (!level || item.skillLevels.includes(level)),
  );
}

export function getReplacementReference(referenceId: string) {
  const item = byId.get(referenceId);
  return item?.replacedBy ? resolveReference(item.replacedBy) : null;
}

export function validateReferenceState(referenceId: string) {
  return resolveReference(referenceId, true)?.status ?? "missing";
}
