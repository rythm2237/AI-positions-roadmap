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

type GeoSupplement = {
  video: Omit<ReferenceLearningOption, "mode">;
  practice: Omit<ReferenceLearningOption, "mode">;
};

function officialVideo(
  title: string,
  description: string,
  url: string,
  durationLabel: string,
): Omit<ReferenceLearningOption, "mode"> {
  return {
    title,
    description,
    url,
    provider: "Google Search Central",
    durationLabel,
    isOfficial: true,
    access: "free",
    contentType: "video",
    verifiedContentType: true,
    verifiedAt: "2026-08-03",
    verificationSource: "official-video-page",
  };
}

function curatedVideo(
  title: string,
  description: string,
  url: string,
  provider: string,
  durationLabel: string,
  curationReason: string,
): Omit<ReferenceLearningOption, "mode"> {
  return {
    title,
    description,
    url,
    provider,
    durationLabel,
    isOfficial: false,
    access: "free",
    contentType: "video",
    verifiedContentType: true,
    verifiedAt: "2026-08-03",
    verificationSource: "curated-video-page",
    curationReason,
  };
}

function practice(
  resourceId: string,
  title: string,
  description: string,
  durationLabel: string,
): Omit<ReferenceLearningOption, "mode"> {
  return {
    title,
    description,
    url: `/practice/geo/${resourceId}`,
    provider: "AI Career OS GEO Practice Lab",
    durationLabel,
    isOfficial: true,
    access: "free",
    contentType: "hands-on-lab",
    verifiedContentType: true,
    verifiedAt: "2026-08-03",
    verificationSource: "career-specific-practice-lab",
  };
}

const geoLearningSupplements: Record<string, GeoSupplement> = {
  "geo-foundational-paper": {
    video: officialVideo(
      "SEO, AIO, GEO, your site, and optimization for LLMs",
      "Google Search representatives discuss what remains durable, what is speculative, and how to evaluate third-party GEO claims.",
      "https://www.youtube.com/watch?v=i4jDc58ofH4",
      "26 minutes",
    ),
    practice: practice(
      "geo-foundational-paper",
      "Build a generative visibility baseline",
      "Run a governed cross-engine query and citation study with explicit limitations and follow-up hypotheses.",
      "2-3 hours",
    ),
  },
  "geo-critical-survey": {
    video: officialVideo(
      "SEO, AIO, GEO, your site, and optimization for LLMs",
      "Use Google's direct discussion as a counterpoint to the survey and classify durable guidance versus unproven GEO claims.",
      "https://www.youtube.com/watch?v=i4jDc58ofH4",
      "26 minutes",
    ),
    practice: practice(
      "geo-critical-survey",
      "Complete a GEO evidence-maturity review",
      "Classify real GEO recommendations by evidence type, confidence, transferability, and claim risk.",
      "90-120 minutes",
    ),
  },
  "geo-google-ai-features": {
    video: officialVideo(
      "SEO, AIO, GEO, your site, and optimization for LLMs",
      "Connect Google's AI-search guidance to crawlability, useful content, source support, and realistic expectations.",
      "https://www.youtube.com/watch?v=i4jDc58ofH4",
      "26 minutes",
    ),
    practice: practice(
      "geo-google-ai-features",
      "Run an AI-search eligibility audit",
      "Inspect five pages for indexability, canonical selection, rendered content, structured data, and evidence visibility.",
      "2-3 hours",
    ),
  },
  "geo-search-essentials": {
    video: officialVideo(
      "How Google Search crawls pages",
      "A direct technical explanation of URL discovery, Googlebot, fetching, rendering, sitemaps, and crawl constraints.",
      "https://www.youtube.com/watch?v=JuK7NnfyEuc",
      "7 minutes",
    ),
    practice: practice(
      "geo-search-essentials",
      "Complete a Search Essentials compliance review",
      "Audit one template and five URLs for technical eligibility, spam-policy risk, and people-first usefulness.",
      "2-3 hours",
    ),
  },
  "geo-bing-ai-performance": {
    video: curatedVideo(
      "AI Performance in Microsoft Bing Webmaster Tools",
      "A focused walkthrough of citations, cited pages, grounding queries, exports, and the limits of attribution.",
      "https://www.youtube.com/watch?v=-4Qe9LUXwvg",
      "4 minutes",
      "Microsoft documentation explains the feature but currently offers no comparably focused official walkthrough video. This short external demonstration is used only for interface orientation; the reading remains the source of truth.",
    ),
    practice: practice(
      "geo-bing-ai-performance",
      "Analyze Bing AI Performance data",
      "Export, normalize, segment, and report citation and grounding-query data without treating it as ranking or causation.",
      "2-4 hours",
    ),
  },
  "geo-schema": {
    video: officialVideo(
      "Structured Data for beginners",
      "Google Search Central explains what structured data is, how to implement it, and how to verify it.",
      "https://www.youtube.com/watch?v=tYfCjbvaOYg",
      "3 minutes",
    ),
    practice: practice(
      "geo-schema",
      "Implement and validate entity markup",
      "Create accurate JSON-LD for a real page and validate syntax, eligibility, visible-content support, and ownership.",
      "2-3 hours",
    ),
  },
  "geo-genai-content": {
    video: officialVideo(
      "SEO, AIO, GEO, your site, and optimization for LLMs",
      "Review Google's position on content chunking, third-party tools, useful content, and optimization claims for LLMs.",
      "https://www.youtube.com/watch?v=i4jDc58ofH4",
      "26 minutes",
    ),
    practice: practice(
      "geo-genai-content",
      "Apply an AI-assisted content quality gate",
      "Verify claims, remove unsupported filler, add human expertise and accountability, and make a publication decision.",
      "90-150 minutes",
    ),
  },
  "geo-quality-guidelines": {
    video: officialVideo(
      "SEO, AIO, GEO, your site, and optimization for LLMs",
      "Use the discussion to examine authority, third-party support, site quality, and the danger of simplistic optimization scores.",
      "https://www.youtube.com/watch?v=i4jDc58ofH4",
      "26 minutes",
    ),
    practice: practice(
      "geo-quality-guidelines",
      "Assess source quality and reputation",
      "Score five competing sources for purpose, expertise, evidence, reputation, transparency, freshness, and risk.",
      "2-3 hours",
    ),
  },
  "geo-search-console": {
    video: officialVideo(
      "Analyzing performance on Google Search",
      "A current Search Console training video on interpreting performance metrics, filters, dimensions, and changes over time.",
      "https://www.youtube.com/watch?v=5LF6SwB5jZ0",
      "11 minutes",
    ),
    practice: practice(
      "geo-search-console",
      "Build a reliable search-performance baseline",
      "Export 90 days of data, normalize query intent and topics, identify anomalies, and define an experiment baseline.",
      "2-4 hours",
    ),
  },
  "geo-indexnow": {
    video: curatedVideo(
      "Bing Webmaster Tools and IndexNow implementation walkthrough",
      "A practical orientation to Bing Webmaster Tools and IndexNow submission before completing the protocol implementation lab.",
      "https://www.youtube.com/watch?v=CAtPt-xOl5s",
      "Self-paced",
      "The IndexNow protocol documentation is authoritative, but it does not currently provide a complete official implementation video. This external walkthrough is supplementary; protocol behavior must be verified against the official documentation.",
    ),
    practice: practice(
      "geo-indexnow",
      "Implement and operate IndexNow safely",
      "Submit a controlled URL change, test response handling, define triggers, and document retries, ownership, and rollback.",
      "2-3 hours",
    ),
  },
  "geo-international": {
    video: officialVideo(
      "3 Tips for International Websites",
      "Google Search Central covers international URL structure, reciprocal hreflang, and implementation validation.",
      "https://www.youtube.com/watch?v=n-6NmhCbEaI",
      "3 minutes",
    ),
    practice: practice(
      "geo-international",
      "Design a multilingual entity and hreflang architecture",
      "Create and validate a two-locale URL, entity, canonical, and reciprocal-hreflang system.",
      "2-4 hours",
    ),
  },
  "geo-career-workbook": {
    video: officialVideo(
      "SEO, AIO, GEO, your site, and optimization for LLMs",
      "Use Google's discussion to evaluate professional claims, vendors, tools, and evidence expected in modern AI-search work.",
      "https://www.youtube.com/watch?v=i4jDc58ofH4",
      "26 minutes",
    ),
    practice: practice(
      "geo-career-workbook",
      "Build a GEO portfolio evidence matrix",
      "Normalize ten vacancies and map every required capability to a concrete audit, implementation, experiment, or communication artifact.",
      "2-3 hours",
    ),
  },
};

function segmentUrl(resource: ReferenceResource, segment?: ReferenceSegment): string {
  if (!segment) return resource.canonicalUrl;
  if (segment.lessonUrl) return segment.lessonUrl;
  const url = new URL(resource.canonicalUrl);
  if (segment.anchor) url.hash = segment.anchor;
  if (typeof segment.timestampSeconds === "number") {
    url.searchParams.set("t", String(segment.timestampSeconds));
  }
  return url.toString();
}

export function getReferenceLearningOptions(
  resource: ReferenceResource | ResolvedReference,
): ReferenceLearningOption[] {
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

  const supplement = geoLearningSupplements[resource.id];
  if (!supplement) return baseOptions;

  const modes = new Set(baseOptions.map((option) => option.mode));
  if (!modes.has("video")) baseOptions.push({ mode: "video", ...supplement.video });
  if (!modes.has("practice")) baseOptions.push({ mode: "practice", ...supplement.practice });
  return baseOptions;
}

export function resolveReference(
  referenceId: string,
  includeUnavailable = false,
): ResolvedReference | null {
  const resource = byId.get(referenceId);
  if (!resource) return null;

  if (resource.status === "replaced" && resource.replacedBy) {
    return resolveReference(resource.replacedBy, includeUnavailable);
  }

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

export function resolveReferenceSegment(
  referenceId: string,
  segmentId?: string,
): ResolvedReference | null {
  const resolved = resolveReference(referenceId, true);
  if (!resolved) return null;
  if (!segmentId) return resolved;

  const segment = resolved.segments.find((item) => item.id === segmentId);
  if (!segment) {
    return {
      ...resolved,
      available: false,
      warning: "The requested resource section is unavailable.",
    };
  }

  return { ...resolved, url: segmentUrl(resolved, segment) };
}

export function resolveCareerStepReferences(referenceIds: string[]): ResolvedReference[] {
  return Array.from(new Set(referenceIds))
    .map((id) => resolveReference(id, true))
    .filter((item): item is ResolvedReference => Boolean(item));
}

export function getActiveReferencesForTopic(
  topic: string,
  level?: string,
  language = "en",
) {
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
