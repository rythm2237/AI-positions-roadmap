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

const geoLearningSupplements: Record<
  string,
  { video: Omit<ReferenceLearningOption, "mode">; practice: Omit<ReferenceLearningOption, "mode"> }
> = {
  "geo-foundational-paper": {
    video: { title: "How Google Search works", description: "Connect the GEO research model to official crawling, indexing, retrieval, and presentation fundamentals.", url: "https://www.youtube.com/@GoogleSearchCentral", provider: "Google Search Central", durationLabel: "30-60 minutes", isOfficial: true, access: "free", contentType: "video-course", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-provider-channel" },
    practice: { title: "Build a 10-query citation audit", description: "Create a governed query set, record cited sources, compare engines, and document confidence and limitations.", url: "/methodology", provider: "AI Career OS", durationLabel: "90-120 minutes", isOfficial: true, access: "free", contentType: "hands-on-lab", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "curated-career-practice" },
  },
  "geo-critical-survey": {
    video: { title: "Search Central evidence and quality sessions", description: "Compare established Search guidance with emerging GEO claims and evidence standards.", url: "https://www.youtube.com/@GoogleSearchCentral", provider: "Google Search Central", durationLabel: "30-60 minutes", isOfficial: true, access: "free", contentType: "video-course", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-provider-channel" },
    practice: { title: "Run an evidence-maturity review", description: "Classify ten GEO recommendations as established, emerging, or unsupported and document the evidence needed to change the classification.", url: "/methodology", provider: "AI Career OS", durationLabel: "60-90 minutes", isOfficial: true, access: "free", contentType: "hands-on-lab", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "curated-career-practice" },
  },
  "geo-google-ai-features": {
    video: { title: "Google Search Central: AI and Search", description: "Review official videos on Search systems, AI features, indexing, and website visibility.", url: "https://www.youtube.com/@GoogleSearchCentral", provider: "Google Search Central", durationLabel: "30-60 minutes", isOfficial: true, access: "free", contentType: "video-course", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-provider-channel" },
    practice: { title: "Establish an AI-search technical baseline", description: "Use Search Console to inspect index coverage, queries, pages, canonicals, and technical eligibility before proposing GEO changes.", url: "https://search.google.com/search-console/about", provider: "Google Search Console", durationLabel: "60-120 minutes", isOfficial: true, access: "free", contentType: "hands-on-lab", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-tool" },
  },
  "geo-search-essentials": {
    video: { title: "SEO Made Easy", description: "Use Google's official video series to reinforce crawling, indexing, quality, and policy fundamentals.", url: "https://www.youtube.com/@GoogleSearchCentral", provider: "Google Search Central", durationLabel: "30-60 minutes", isOfficial: true, access: "free", contentType: "video-course", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-provider-channel" },
    practice: { title: "Complete a five-URL eligibility audit", description: "Document indexability, canonical selection, rendering, internal discovery, and policy risks for five representative URLs.", url: "https://search.google.com/search-console/about", provider: "Google Search Console", durationLabel: "90-120 minutes", isOfficial: true, access: "free", contentType: "hands-on-lab", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-tool" },
  },
  "geo-bing-ai-performance": {
    video: { title: "Bing Webmaster learning center", description: "Review official Bing Webmaster guidance on indexing, visibility, reports, and AI-search measurement.", url: "https://www.bing.com/webmasters/help", provider: "Microsoft Bing", durationLabel: "30-60 minutes", isOfficial: true, access: "free", contentType: "video-course", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-provider-learning-center" },
    practice: { title: "Create a Bing AI Performance baseline", description: "Record cited pages, grounding queries, visibility trends, and limitations for a verified site.", url: "https://www.bing.com/webmasters/about", provider: "Bing Webmaster Tools", durationLabel: "60-120 minutes", isOfficial: true, access: "free", contentType: "hands-on-lab", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-tool" },
  },
  "geo-schema": {
    video: { title: "Getting started with structured data", description: "Google Search Central explains the structured-data implementation model and validation workflow.", url: "https://www.youtube.com/watch?v=tDpVxLqXCew", provider: "Google Search Central", durationLabel: "10-20 minutes", isOfficial: true, access: "free", contentType: "video-course", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-video" },
    practice: { title: "Validate an entity markup implementation", description: "Create JSON-LD for a real page, verify every property against visible content, and fix validator errors.", url: "https://validator.schema.org/", provider: "Schema.org", durationLabel: "60-120 minutes", isOfficial: true, access: "free", contentType: "hands-on-lab", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-validator" },
  },
  "geo-genai-content": {
    video: { title: "People-first content and Search quality", description: "Review official Search Central guidance on useful content, quality controls, and policy risk.", url: "https://www.youtube.com/@GoogleSearchCentral", provider: "Google Search Central", durationLabel: "30-60 minutes", isOfficial: true, access: "free", contentType: "video-course", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-provider-channel" },
    practice: { title: "Audit an AI-assisted article", description: "Check accuracy, originality, source provenance, authorship, review ownership, and user value before publication.", url: "/sources", provider: "AI Career OS", durationLabel: "60-90 minutes", isOfficial: true, access: "free", contentType: "hands-on-lab", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "curated-career-practice" },
  },
  "geo-quality-guidelines": {
    video: { title: "Search quality and trust sessions", description: "Use official Search Central sessions to connect trust, reputation, transparency, and page purpose to implementation.", url: "https://www.youtube.com/@GoogleSearchCentral", provider: "Google Search Central", durationLabel: "30-60 minutes", isOfficial: true, access: "free", contentType: "video-course", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-provider-channel" },
    practice: { title: "Score five competing sources", description: "Evaluate purpose, evidence, reputation, transparency, authorship, risk, and information quality using a consistent rubric.", url: "/methodology", provider: "AI Career OS", durationLabel: "90-120 minutes", isOfficial: true, access: "free", contentType: "hands-on-lab", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "curated-career-practice" },
  },
  "geo-search-console": {
    video: { title: "Search Console training", description: "Use official Search Central videos to learn report interpretation, filtering, and technical debugging.", url: "https://www.youtube.com/@GoogleSearchCentral", provider: "Google Search Central", durationLabel: "30-60 minutes", isOfficial: true, access: "free", contentType: "video-course", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-provider-channel" },
    practice: { title: "Build a 90-day search baseline", description: "Export query and page data, segment branded and non-branded demand, identify anomalies, and record measurement limits.", url: "https://search.google.com/search-console/about", provider: "Google Search Console", durationLabel: "90-120 minutes", isOfficial: true, access: "free", contentType: "hands-on-lab", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-tool" },
  },
  "geo-indexnow": {
    video: { title: "Bing Webmaster indexing guidance", description: "Review official Bing Webmaster material on URL discovery, indexing, and publishing workflows.", url: "https://www.bing.com/webmasters/help", provider: "Microsoft Bing", durationLabel: "20-40 minutes", isOfficial: true, access: "free", contentType: "video-course", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-provider-learning-center" },
    practice: { title: "Implement a test IndexNow submission", description: "Generate a key, submit a changed URL, record the request, and document operational ownership and failure handling.", url: "https://www.indexnow.org/documentation", provider: "IndexNow", durationLabel: "60-90 minutes", isOfficial: true, access: "free", contentType: "hands-on-lab", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-documentation-and-protocol" },
  },
  "geo-international": {
    video: { title: "International SEO guidance", description: "Review Google Search Central material on multilingual architecture, locale URLs, and hreflang.", url: "https://www.youtube.com/@GoogleSearchCentral", provider: "Google Search Central", durationLabel: "30-60 minutes", isOfficial: true, access: "free", contentType: "video-course", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-provider-channel" },
    practice: { title: "Design and validate a multilingual URL map", description: "Create a two-language architecture and verify reciprocal hreflang, canonicals, language consistency, and regional evidence.", url: "https://search.google.com/search-console/about", provider: "Google Search Console", durationLabel: "90-120 minutes", isOfficial: true, access: "free", contentType: "hands-on-lab", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-tool" },
  },
  "geo-career-workbook": {
    video: { title: "Technical communication examples", description: "Use official Search Central videos as models for concise explanations of technical evidence, limitations, and actions.", url: "https://www.youtube.com/@GoogleSearchCentral", provider: "Google Search Central", durationLabel: "30-60 minutes", isOfficial: true, access: "free", contentType: "video-course", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "official-provider-channel" },
    practice: { title: "Build your GEO evidence matrix", description: "Map target vacancies to audits, experiments, content systems, technical changes, authority work, and stakeholder evidence.", url: "/methodology", provider: "AI Career OS", durationLabel: "90-120 minutes", isOfficial: true, access: "free", contentType: "hands-on-lab", verifiedContentType: true, verifiedAt: "2026-08-03", verificationSource: "curated-career-practice" },
  },
};

function segmentUrl(resource: ReferenceResource, segment?: ReferenceSegment): string {
  if (!segment) return resource.canonicalUrl;
  if (segment.lessonUrl) return segment.lessonUrl;
  const url = new URL(resource.canonicalUrl);
  if (segment.anchor) url.hash = segment.anchor;
  if (typeof segment.timestampSeconds === "number") url.searchParams.set("t", String(segment.timestampSeconds));
  return url.toString();
}

export function getReferenceLearningOptions(resource: ReferenceResource | ResolvedReference): ReferenceLearningOption[] {
  const baseOptions = resource.learningOptions?.length
    ? [...resource.learningOptions]
    : [{ mode: "reading" as const, title: resource.title, description: resource.description, url: resource.canonicalUrl, provider: resource.provider, durationLabel: resource.durationLabel, isOfficial: resource.isOfficial, access: resource.access, contentType: "documentation", verifiedContentType: false, verifiedAt: resource.lastVerifiedAt, verificationSource: "legacy-registry-fallback" }];

  const supplement = geoLearningSupplements[resource.id];
  if (!supplement) return baseOptions;

  const modes = new Set(baseOptions.map((option) => option.mode));
  if (!modes.has("video")) baseOptions.push({ mode: "video", ...supplement.video });
  if (!modes.has("practice")) baseOptions.push({ mode: "practice", ...supplement.practice });
  return baseOptions;
}

export function resolveReference(referenceId: string, includeUnavailable = false): ResolvedReference | null {
  const resource = byId.get(referenceId);
  if (!resource) return null;
  if (resource.status === "replaced" && resource.replacedBy) return resolveReference(resource.replacedBy, includeUnavailable);
  const available = resource.status === "active" || resource.status === "needs-review";
  if (!available && !includeUnavailable) return null;
  return { ...resource, url: resource.canonicalUrl, available, warning: resource.status === "needs-review" ? "This resource is awaiting review." : available ? undefined : `This resource is ${resource.status}.` };
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
  return Array.from(new Set(referenceIds)).map((id) => resolveReference(id, true)).filter((item): item is ResolvedReference => Boolean(item));
}

export function getActiveReferencesForTopic(topic: string, level?: string, language = "en") {
  return catalog.filter((item) => (item.status === "active" || item.status === "needs-review") && item.topics.includes(topic) && item.languages.includes(language) && (!level || item.skillLevels.includes(level)));
}

export function getReplacementReference(referenceId: string) {
  const item = byId.get(referenceId);
  return item?.replacedBy ? resolveReference(item.replacedBy) : null;
}

export function validateReferenceState(referenceId: string) {
  return resolveReference(referenceId, true)?.status ?? "missing";
}
