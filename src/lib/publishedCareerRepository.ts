import "server-only";
import { cache } from "react";
import type { ManagedCareer } from "@/types/adminStudio";
import type { CareerResource, CareerWorkspaceData } from "@/types/careerWorkspace";
import { applyCareerAssessmentPolicy } from "@/content/assessments/assessmentBank";
import { validateCareerWorkspaceData } from "@/lib/careerContentValidation";
import type { ReferenceLearningOption } from "@/types/reference";

type PublishedResourceMapping = {
  milestone_id: string;
  mode: "reading" | "video" | "course" | "practice";
  resource: {
    id: string;
    canonical_url: string;
    mode: "reading" | "video" | "course" | "practice";
    title: string;
    provider: string;
    content_type: string;
    cost: "Free" | "Paid" | "Free/Paid";
    is_official: boolean;
    status: "active";
    source_metadata: Record<string, unknown>;
    review_interval_days: number;
    verified_at: string | null;
    next_review_at: string | null;
  } | null;
};

function modeForResource(resource: CareerResource): PublishedResourceMapping["mode"] {
  if (resource.type === "Video") return "video";
  if (resource.type === "Course" || resource.type === "Learning Path") return "course";
  if (resource.type === "Practice" || resource.type === "Exam") return "practice";
  return "reading";
}

function normalizedResourceUrl(value: string) {
  return value.trim().replace(/\/+$/, "").toLocaleLowerCase("en");
}

async function resolveRegistryResourceUpdates(careerId: string, workspace: CareerWorkspaceData): Promise<CareerWorkspaceData> {
  const settings = config();
  if (!settings) return workspace;
  const query = new URLSearchParams({
    career_id: `eq.${careerId}`,
    approved: "eq.true",
    select: "milestone_id,mode,resource:learning_resources(id,canonical_url,mode,title,provider,content_type,cost,is_official,status,source_metadata,review_interval_days,verified_at,next_review_at)",
  });
  const response = await fetch(`${settings.url}/rest/v1/career_learning_resources?${query}`, {
    headers: { apikey: settings.key, Authorization: `Bearer ${settings.key}` },
    next: { revalidate: 60, tags: [`career-resources:${careerId}`] },
  }).catch(() => null);
  if (!response?.ok) return workspace;
  const rows = await response.json().catch(() => null) as PublishedResourceMapping[] | null;
  if (!Array.isArray(rows) || !rows.length) return workspace;

  const activeRows = rows.filter((row) => row.resource && row.resource.mode === row.mode);
  const unavailableMilestones = new Set(rows.filter((row) => !row.resource).map((row) => `${row.milestone_id}:${row.mode}`));
  const replacements = new Map<string, CareerResource>();
  for (const row of activeRows) {
    const source = row.resource!;
    const metadata = source.source_metadata ?? {};
    const existing = [...workspace.globalResources, ...workspace.journeyStages.flatMap((stage) => stage.resources)]
      .find((resource) => modeForResource(resource) === row.mode && normalizedResourceUrl(resource.url) === normalizedResourceUrl(source.canonical_url));
    const learningOption: ReferenceLearningOption = {
      mode: row.mode,
      contentType: source.content_type as ReferenceLearningOption["contentType"],
      title: source.title,
      description: typeof metadata.whyUseful === "string" ? metadata.whyUseful : existing?.whyUseful,
      url: source.canonical_url,
      provider: source.provider,
      durationLabel: typeof metadata.estimatedTime === "string" ? metadata.estimatedTime : existing?.estimatedTime,
      isOfficial: source.is_official,
      access: source.cost,
      verifiedContentType: true,
      verifiedAt: source.verified_at ?? "",
      verificationSource: typeof metadata.verificationSource === "string" ? metadata.verificationSource : "central-resource-registry",
    };
    replacements.set(`${normalizedResourceUrl(source.canonical_url)}:${row.mode}`, {
      id: existing?.id ?? source.id,
      title: source.title,
      type: row.mode === "video" ? "Video" : row.mode === "course" ? "Course" : row.mode === "practice" ? "Practice" : "Documentation",
      provider: source.provider,
      cost: source.cost,
      estimatedTime: typeof metadata.estimatedTime === "string" ? metadata.estimatedTime : existing?.estimatedTime ?? "30–60 minutes",
      whyUseful: typeof metadata.whyUseful === "string" ? metadata.whyUseful : existing?.whyUseful ?? "Supports the learning outcomes for this milestone.",
      url: source.canonical_url,
      priority: metadata.priority === "Essential" ? "Essential" : existing?.priority ?? "Recommended",
      registryMetadata: {
        status: source.status === "active" ? "active" : "needs-review",
        isOfficial: source.is_official,
        contentType: source.content_type,
        verifiedAt: source.verified_at ?? "",
        nextReviewAt: source.next_review_at ?? undefined,
        reviewIntervalDays: source.review_interval_days,
        verificationSource: learningOption.verificationSource,
        language: typeof metadata.language === "string" ? metadata.language : undefined,
        certificateAvailability: typeof metadata.certificateAvailability === "string" ? metadata.certificateAvailability : undefined,
      },
      learningOptions: [learningOption],
    });
  }

  const mergeResource = (resource: CareerResource) => {
    const replacement = replacements.get(`${normalizedResourceUrl(resource.url)}:${modeForResource(resource)}`);
    return replacement ? { ...resource, ...replacement } : resource;
  };
  const journeyStages = workspace.journeyStages.map((stage) => ({
    ...stage,
    resources: unavailableMilestones.size && [...unavailableMilestones].some((key) => key.startsWith(`${stage.id}:`))
      ? stage.resources.filter((resource) => !unavailableMilestones.has(`${stage.id}:${modeForResource(resource)}`)).map(mergeResource)
      : stage.resources.map(mergeResource),
  }));
  const globalResources = workspace.globalResources
    .filter((resource) => !unavailableMilestones.has(`${workspace.resourceRequirements?.find((requirement) => requirement.resourceIds.includes(resource.id))?.milestoneId ?? ""}:${modeForResource(resource)}`))
    .map(mergeResource);

  return { ...workspace, journeyStages, globalResources };
}

function config() {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return url && key ? { url, key } : null;
}

export const getPublishedCareer = cache(async (slug: string) => {
  const settings = config();
  if (!settings) return null;

  const columns =
    "id,slug,title,short_title,summary,status,taxonomy,default_country_codes,workspace_data,content_version,published_at,updated_at";

  const response = await fetch(
    `${settings.url}/rest/v1/careers?slug=eq.${encodeURIComponent(
      slug
    )}&status=eq.published&select=${columns}&limit=1`,
    {
      headers: {
        apikey: settings.key,
        Authorization: `Bearer ${settings.key}`,
      },
      next: { revalidate: 300, tags: [`career:${slug}`] },
    }
  );

  if (!response.ok) return null;

  const career = (await response.json() as ManagedCareer[])[0];
  if (!career) return null;

  const rawWorkspace = applyCareerAssessmentPolicy(
    career.workspace_data as CareerWorkspaceData
  );
  const migratedWorkspace = await resolveRegistryResourceUpdates(career.id, rawWorkspace);
  const validation = validateCareerWorkspaceData(
    migratedWorkspace,
    career.slug
  );

  return validation.valid
    ? {
        record: { ...career, workspace_data: migratedWorkspace },
        data: validation.data,
      }
    : null;
});
