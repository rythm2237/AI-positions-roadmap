export type ReferenceStatus = "active" | "needs-review" | "deprecated" | "broken" | "replaced";
export type ReferenceSegment = { id: string; anchor?: string; heading?: string; timestampSeconds?: number; endTimestampSeconds?: number; lessonUrl?: string };
export type ReferenceResource = {
  id: string; title: string; provider: string; description: string; type: string; canonicalUrl: string;
  isOfficial: boolean; topics: string[]; skillLevels: string[]; languages: string[]; priority: string;
  access: string; durationLabel?: string; segments: ReferenceSegment[]; status: ReferenceStatus;
  lastVerifiedAt: string; reviewIntervalDays: number; nextReviewAt: string; replacedBy?: string;
};
export type ResolvedReference = ReferenceResource & { url: string; available: boolean; warning?: string };
