import type { GeneratedCareerBlueprint, GeneratedCareerStage } from "@/types/careerGeneration";

const TARGET_STAGE_COUNT = 10;
const stageLevel = { Beginner: 0, Intermediate: 1, Advanced: 2 } as const;

const mergeAffinity = new Map<string, number>([
  ["resume:profile", 100],
  ["job-search:jobs", 100],
  ["projects:portfolio", 95],
  ["interview:assessment", 90],
  ["assessment:ready", 85],
  ["orientation:foundation", 85],
  ["core-skills:tools", 80],
  ["portfolio:resume", 70],
  ["profile:job-search", 70],
  ["jobs:interview", 70],
  ["tools:projects", 60],
]);

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNormalizableStage(value: unknown): value is GeneratedCareerStage {
  if (!record(value) || !record(value.effortMinutes)) return false;
  const stringKeys = [
    "title", "type", "landmark", "theme", "summary", "explanation", "phaseGoal",
    "mentorTip", "expectedOutcome", "resourceTopic", "skillLevel",
  ];
  const arrayKeys = [
    "lessons", "learningOutcomes", "tasks", "practicalMissions",
    "preferredProviders", "assessmentSeeds",
  ];
  return stringKeys.every((key) => typeof value[key] === "string")
    && arrayKeys.every((key) => Array.isArray(value[key]))
    && typeof value.effortMinutes.min === "number"
    && typeof value.effortMinutes.max === "number";
}

function interleaveUnique<T>(collections: T[][], limit: number, key: (item: T) => string) {
  const result: T[] = [];
  const seen = new Set<string>();
  const maxLength = Math.max(0, ...collections.map((collection) => collection.length));
  for (let itemIndex = 0; itemIndex < maxLength && result.length < limit; itemIndex += 1) {
    for (const collection of collections) {
      const item = collection[itemIndex];
      if (item === undefined) continue;
      const itemKey = key(item).trim().toLowerCase();
      if (!itemKey || seen.has(itemKey)) continue;
      seen.add(itemKey);
      result.push(item);
      if (result.length === limit) break;
    }
  }
  return result;
}

function textList(stages: GeneratedCareerStage[], key: "lessons" | "learningOutcomes" | "practicalMissions" | "preferredProviders", limit: number) {
  return interleaveUnique(stages.map((stage) => stage[key]), limit, (item) => item);
}

function objectList<T extends Record<string, unknown>>(collections: T[][], limit: number, identityKey: keyof T) {
  return interleaveUnique(collections, limit, (item) => String(item[identityKey] ?? JSON.stringify(item)));
}

function combinedText(stages: GeneratedCareerStage[], key: "summary" | "explanation" | "phaseGoal" | "mentorTip" | "expectedOutcome") {
  return stages.map((stage) => stage[key].trim()).filter(Boolean).join("\n\n");
}

function mergeStages(stages: GeneratedCareerStage[]): GeneratedCareerStage {
  const first = stages[0];
  const last = stages.at(-1) ?? first;
  const minEffort = Math.min(12000, stages.reduce((sum, stage) => sum + stage.effortMinutes.min, 0));
  const maxEffort = Math.min(16000, stages.reduce((sum, stage) => sum + stage.effortMinutes.max, 0));
  const skillLevel = stages.reduce<GeneratedCareerStage["skillLevel"]>((highest, stage) => (
    stageLevel[stage.skillLevel] > stageLevel[highest] ? stage.skillLevel : highest
  ), first.skillLevel);

  return {
    title: stages.map((stage) => stage.title.trim()).filter(Boolean).join(" & "),
    type: last.type,
    landmark: stages.map((stage) => stage.landmark.trim()).filter(Boolean).join(" / "),
    theme: stages.map((stage) => stage.theme.trim()).filter(Boolean).join(" + "),
    summary: combinedText(stages, "summary"),
    explanation: combinedText(stages, "explanation"),
    lessons: textList(stages, "lessons", 6),
    learningOutcomes: textList(stages, "learningOutcomes", 6),
    tasks: objectList(stages.map((stage) => stage.tasks), 5, "title"),
    phaseGoal: combinedText(stages, "phaseGoal"),
    mentorTip: combinedText(stages, "mentorTip"),
    practicalMissions: textList(stages, "practicalMissions", 5),
    expectedOutcome: combinedText(stages, "expectedOutcome"),
    resourceTopic: stages.map((stage) => stage.resourceTopic.trim()).filter(Boolean).join(" / "),
    preferredProviders: textList(stages, "preferredProviders", 5),
    skillLevel,
    effortMinutes: { min: minEffort, max: Math.max(minEffort, maxEffort) },
    assessmentSeeds: objectList(stages.map((stage) => stage.assessmentSeeds), 5, "scenario"),
  };
}

function pairScore(groups: number[][], stages: GeneratedCareerStage[], index: number) {
  const left = groups[index];
  const right = groups[index + 1];
  const leftType = stages[left.at(-1) ?? 0].type;
  const rightType = stages[right[0]].type;
  const affinity = mergeAffinity.get(`${leftType}:${rightType}`) ?? 30;
  const alreadyMergedPenalty = (left.length + right.length - 2) * 1000;
  const endpointPenalty = index === 0 || index === groups.length - 2 ? 5 : 0;
  return affinity - alreadyMergedPenalty - endpointPenalty;
}

export interface CareerBlueprintNormalizationResult {
  blueprint: GeneratedCareerBlueprint;
  originalStageCount: number;
  mergedStageGroups: number[][];
}

export function normalizeCareerBlueprintStageCount(value: unknown): CareerBlueprintNormalizationResult | null {
  if (!record(value) || !Array.isArray(value.stages) || !Array.isArray(value.projects)) return null;
  if (value.stages.length <= TARGET_STAGE_COUNT || !value.stages.every(isNormalizableStage)) return null;

  const stages = value.stages as GeneratedCareerStage[];
  const groups = stages.map((_, index) => [index]);
  while (groups.length > TARGET_STAGE_COUNT) {
    let bestIndex = 0;
    let bestScore = Number.NEGATIVE_INFINITY;
    for (let index = 0; index < groups.length - 1; index += 1) {
      const score = pairScore(groups, stages, index);
      if (score > bestScore) {
        bestIndex = index;
        bestScore = score;
      }
    }
    groups.splice(bestIndex, 2, [...groups[bestIndex], ...groups[bestIndex + 1]]);
  }

  const stageNumberMap = new Map<number, number>();
  groups.forEach((group, normalizedIndex) => {
    group.forEach((originalIndex) => stageNumberMap.set(originalIndex + 1, normalizedIndex + 1));
  });
  const normalizedProjects = value.projects.map((project) => {
    if (!record(project) || typeof project.stageNumber !== "number") return project;
    const originalStageNumber = Math.min(stages.length, Math.max(1, Math.round(project.stageNumber)));
    return { ...project, stageNumber: stageNumberMap.get(originalStageNumber) ?? TARGET_STAGE_COUNT };
  });

  return {
    blueprint: {
      ...(value as unknown as GeneratedCareerBlueprint),
      stages: groups.map((group) => group.length === 1
        ? stages[group[0]]
        : mergeStages(group.map((index) => stages[index]))),
      projects: normalizedProjects as GeneratedCareerBlueprint["projects"],
    },
    originalStageCount: stages.length,
    mergedStageGroups: groups.filter((group) => group.length > 1).map((group) => group.map((index) => index + 1)),
  };
}
