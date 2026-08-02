import type { CareerWorkspaceData } from "@/types/careerWorkspace";
import { getDefaultCareerTitleAliases } from "../data/careerTitleAliases.ts";

export type CareerContentValidation =
  | { valid: true; data: CareerWorkspaceData; errors: [] }
  | { valid: false; errors: string[] };

const text = (value: unknown) => typeof value === "string" && value.trim().length > 0;
const list = (value: unknown) => Array.isArray(value);

export function validateCareerWorkspaceData(value: unknown, expectedSlug?: string): CareerContentValidation {
  const errors: string[] = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) return { valid: false, errors: ["Content must be a JSON object."] };
  const data = value as Partial<CareerWorkspaceData>;
  if (!text(data.slug)) errors.push("slug is required.");
  if (expectedSlug && data.slug !== expectedSlug) errors.push(`Content slug must remain ${expectedSlug}.`);
  const configuredAliases = list(data.titleAliases) ? data.titleAliases : [];
  const fallbackAliases = text(data.slug)
    ? getDefaultCareerTitleAliases(data.slug as string)
    : [];
  const titleAliases = configuredAliases.length ? configuredAliases : fallbackAliases;
  if (!titleAliases.length) {
    errors.push("titleAliases must include at least one alternative job title.");
  } else {
    const aliasTitles = titleAliases
      .map((alias) => alias?.title)
      .filter((title): title is string => text(title));
    if (aliasTitles.length !== titleAliases.length) {
      errors.push("Every titleAliases entry needs a non-empty title.");
    }
    const normalizedAliasTitles = aliasTitles.map((title) =>
      title.toLocaleLowerCase("en").replace(/[^a-z0-9]+/g, " ").trim()
    );
    if (new Set(normalizedAliasTitles).size !== normalizedAliasTitles.length) {
      errors.push("titleAliases must not contain duplicate titles.");
    }
    if (text(data.title)) {
      const canonical = (data.title as string)
        .toLocaleLowerCase("en")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
      if (normalizedAliasTitles.includes(canonical)) {
        errors.push("titleAliases must not repeat the canonical career title.");
      }
    }
    data.titleAliases = titleAliases;
  }
  for (const key of ["title", "category", "shortDescription", "difficulty", "estimatedLearningTime", "lastUpdated"] as const) {
    if (!text(data[key])) errors.push(`${key} is required.`);
  }
  if (!data.visual || !text(data.visual.nodeLabel) || !text(data.visual.sceneTitle) || !text(data.visual.imageAlt)) errors.push("visual metadata is incomplete.");
  if (!data.overview || !text(data.overview.title) || !text(data.overview.body) || !list(data.overview.responsibilities)) errors.push("overview is incomplete.");
  if (!data.journeyMap || !text(data.journeyMap.theme) || !text(data.journeyMap.overviewTitle)) errors.push("journeyMap is incomplete.");
  if (!list(data.journeyStages) || !data.journeyStages?.length) errors.push("At least one journey stage is required.");
  if (!list(data.roadmap) || !data.roadmap?.length) errors.push("At least one roadmap phase is required.");
  if (!list(data.projects)) errors.push("projects must be an array.");
  if (!list(data.globalResources)) errors.push("globalResources must be an array.");
  if (!list(data.mapSections)) errors.push("mapSections must be an array.");
  const stageIds = data.journeyStages?.map((stage) => stage?.id).filter(Boolean) ?? [];
  if (new Set(stageIds).size !== stageIds.length) errors.push("Journey stage IDs must be unique.");
  data.journeyStages?.forEach((stage, index) => {
    if (!stage || !text(stage.id) || !text(stage.title)) errors.push(`Journey stage ${index + 1} needs an id and title.`);
    const topicAssessments = stage?.topicAssessments;
    if (!list(topicAssessments) || !topicAssessments?.length) {
      errors.push(`Journey stage ${index + 1} needs topic assessments.`);
    } else {
      if (topicAssessments.length !== (stage?.resources?.length ?? 0)) {
        errors.push(`Journey stage ${index + 1} needs one topic assessment per learning resource.`);
      }
      topicAssessments.forEach((assessment, assessmentIndex) => {
        if (!list(assessment?.questions) || assessment.questions.length < 5) {
          errors.push(`Journey stage ${index + 1}, topic assessment ${assessmentIndex + 1} needs at least 5 questions.`);
        }
        if ((assessment?.questionsPerAttempt ?? 0) !== 5) {
          errors.push(`Journey stage ${index + 1}, topic assessment ${assessmentIndex + 1} must use 5 questions per attempt.`);
        }
        if (assessment?.passingScore !== 60) {
          errors.push(`Journey stage ${index + 1}, topic assessment ${assessmentIndex + 1} must use a 60% passing score.`);
        }
      });
    }
    if (!stage?.phaseExam || !list(stage.phaseExam.questions)) {
      errors.push(`Journey stage ${index + 1} needs a comprehensive assessment.`);
    } else {
      if (stage.phaseExam.questions.length < 20) {
        errors.push(`Journey stage ${index + 1} comprehensive assessment needs at least 20 questions.`);
      }
      if ((stage.phaseExam.questionsPerAttempt ?? 0) !== 20) {
        errors.push(`Journey stage ${index + 1} comprehensive assessment must use 20 questions per attempt.`);
      }
      if (stage.phaseExam.passingScore !== 70) {
        errors.push(`Journey stage ${index + 1} comprehensive assessment must use a 70% passing score.`);
      }
    }
  });
  const projectIds = data.projects?.map((project) => project?.id).filter(Boolean) ?? [];
  if (new Set(projectIds).size !== projectIds.length) errors.push("Project IDs must be unique.");
  if (!data.progressRules || typeof data.progressRules.readinessThreshold !== "number") errors.push("progressRules are incomplete.");
  if (!data.finalChallenge || !text(data.finalChallenge.title)) errors.push("finalChallenge is incomplete.");
  if (!data.jobBoard || !text(data.jobBoard.title)) errors.push("jobBoard is incomplete.");
  if (!data.interviewPrep || !text(data.interviewPrep.title)) errors.push("interviewPrep is incomplete.");
  return errors.length ? { valid: false, errors } : { valid: true, data: data as CareerWorkspaceData, errors: [] };
}
