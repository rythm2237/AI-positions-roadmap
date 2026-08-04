export const TRUSTED_RESOURCE_SOURCES = [
  "Microsoft Learn", "Google", "Coursera", "edX", "DeepLearning.AI", "FastAI",
  "MIT", "Stanford", "Harvard", "Official documentation", "GitHub", "YouTube",
] as const;

export interface ResourceCandidate {
  id: string; title: string; url: string; provider: string;
  type: "Course" | "Documentation" | "Video" | "Article" | "Practice";
  language: string; difficulty: "Beginner" | "Intermediate" | "Advanced";
  cost: "Free" | "Paid" | "Free/Paid"; official: boolean; rating?: number;
  status: "ai-generated" | "accepted" | "rejected";
}
export interface ResourceDiscoveryProvider {
  readonly name: string;
  findResources(input: { careerSlug: string; milestoneTitle: string }): Promise<ResourceCandidate[]>;
}

/** Safe default until a search API is configured: no candidate can be published automatically. */
export class PreviewOnlyResourceProvider implements ResourceDiscoveryProvider {
  readonly name = "Preview-only provider";
  async findResources(): Promise<ResourceCandidate[]> { return []; }
}

