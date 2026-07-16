import catalogData from "../../../content/references/reference-catalog.json";
import type { ReferenceResource, ReferenceSegment, ResolvedReference } from "@/types/reference";

const catalog = catalogData as ReferenceResource[];
const byId = new Map(catalog.map((item) => [item.id, item]));

function segmentUrl(resource: ReferenceResource, segment?: ReferenceSegment): string {
  if (!segment) return resource.canonicalUrl;
  if (segment.lessonUrl) return segment.lessonUrl;
  const url = new URL(resource.canonicalUrl);
  if (segment.anchor) url.hash = segment.anchor;
  if (typeof segment.timestampSeconds === "number") url.searchParams.set("t", String(segment.timestampSeconds));
  return url.toString();
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
  const item = byId.get(referenceId); return item?.replacedBy ? resolveReference(item.replacedBy) : null;
}

export function validateReferenceState(referenceId: string) { return resolveReference(referenceId, true)?.status ?? "missing"; }
