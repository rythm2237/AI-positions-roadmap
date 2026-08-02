export type ReferenceStatus =
  | "active"
  | "needs-review"
  | "deprecated"
  | "broken"
  | "replaced";

export type ReferenceLearningMode = "reading" | "video" | "practice";

export type ReferenceContentType =
  | "documentation"
  | "tutorial"
  | "quickstart"
  | "learning-path"
  | "written-course"
  | "security-guide"
  | "video"
  | "video-course"
  | "video-series"
  | "youtube-playlist"
  | "webinar"
  | "interactive-course"
  | "guided-module"
  | "hands-on-lab"
  | "exercise-track"
  | "ctf"
  | "official-framework"
  | "guided-learning"
  | "applied-exercise"
  | "knowledge-base"
  | "hands-on-analysis"
  | "career-path"
  | "hands-on-learning-path"
  | "official-publication"
  | "case-exercise"
  | "official-project"
  | "video-tutorials"
  | "interactive-labs"
  | "official-course"
  | "guided-career-path"
  | "hands-on-lab-path";

export type ReferenceLearningOption = {
  mode: ReferenceLearningMode;
  contentType: ReferenceContentType;
  title: string;
  description?: string;
  url: string;
  provider: string;
  durationLabel?: string;
  isOfficial: boolean;
  access: string;
  verifiedContentType: boolean;
  verifiedAt: string;
  verificationSource: string;
  curationReason?: string;
};

export type ReferenceSegment = {
  id: string;
  anchor?: string;
  heading?: string;
  timestampSeconds?: number;
  endTimestampSeconds?: number;
  lessonUrl?: string;
};

export type ReferenceResource = {
  id: string;
  title: string;
  provider: string;
  description: string;
  type: string;
  canonicalUrl: string;
  isOfficial: boolean;
  topics: string[];
  skillLevels: string[];
  languages: string[];
  priority: string;
  access: string;
  durationLabel?: string;
  segments: ReferenceSegment[];
  learningOptions?: ReferenceLearningOption[];
  status: ReferenceStatus;
  lastVerifiedAt: string;
  reviewIntervalDays: number;
  nextReviewAt: string;
  replacedBy?: string;
};

export type ResolvedReference = ReferenceResource & {
  url: string;
  available: boolean;
  warning?: string;
};
