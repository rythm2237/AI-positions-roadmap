import type { GeneratedCareerBlueprint, GeneratedCareerStage } from "@/types/careerGeneration";
import { createCareerInterviewQuestionFallbacks } from "../careerInterviewQuality.ts";

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
  adjustedCollections: Array<{
    path: string;
    from: number;
    to: number;
    reason: "capped" | "completed" | "sanitized";
  }>;
}

type Adjustment = CareerBlueprintNormalizationResult["adjustedCollections"][number];
type GeneratedTask = GeneratedCareerStage["tasks"][number];
type GeneratedAssessmentSeed = GeneratedCareerStage["assessmentSeeds"][number];
type GeneratedMetric = GeneratedCareerBlueprint["metrics"][number];
type GeneratedProject = GeneratedCareerBlueprint["projects"][number];
type GeneratedReadiness = GeneratedCareerBlueprint["readiness"][number];

const allowedTaskTypes = new Set([
  "lesson", "resource", "project", "portfolio", "career", "interview", "job-search",
]);

function meaningfulText(value: unknown, minimum = 3): value is string {
  return typeof value === "string" && value.trim().length >= minimum;
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown, fallback: string) {
  return meaningfulText(value, 1) ? value.trim() : fallback;
}

function validTask(value: unknown): value is GeneratedTask {
  return record(value)
    && meaningfulText(value.title)
    && meaningfulText(value.description, 1)
    && typeof value.type === "string"
    && allowedTaskTypes.has(value.type);
}

function validAssessmentSeed(value: unknown): value is GeneratedAssessmentSeed {
  return record(value)
    && meaningfulText(value.scenario, 1)
    && meaningfulText(value.correctPrinciple, 1)
    && meaningfulText(value.commonMistake, 1);
}

function validMetric(value: unknown): value is GeneratedMetric {
  return record(value)
    && meaningfulText(value.label, 1)
    && meaningfulText(value.value, 1)
    && meaningfulText(value.detail, 1);
}

function validProject(value: unknown): value is GeneratedProject {
  return record(value)
    && meaningfulText(value.title, 1)
    && meaningfulText(value.difficulty, 1)
    && meaningfulText(value.estimatedTime, 1)
    && meaningfulText(value.description, 1)
    && typeof value.stageNumber === "number"
    && value.stageNumber >= 1
    && value.stageNumber <= TARGET_STAGE_COUNT
    && Array.isArray(value.deliverables)
    && value.deliverables.length >= 3
    && Array.isArray(value.skills)
    && value.skills.length >= 3;
}

function validReadiness(value: unknown): value is GeneratedReadiness {
  return record(value)
    && meaningfulText(value.label, 1)
    && meaningfulText(value.description, 1)
    && typeof value.weight === "number"
    && value.weight > 0;
}

function fitCollection<T>(
  path: string,
  collection: unknown[],
  minimum: number,
  maximum: number,
  isValid: (value: unknown) => value is T,
  createFallback: (index: number) => T,
  adjustments: CareerBlueprintNormalizationResult["adjustedCollections"],
) {
  const valid = collection.filter(isValid);
  const result = valid.slice(0, maximum);
  while (result.length < minimum) result.push(createFallback(result.length));

  if (collection.length !== result.length || valid.length !== collection.length) {
    const reason: Adjustment["reason"] = collection.length > maximum
      ? "capped"
      : valid.length < minimum
        ? "completed"
        : "sanitized";
    adjustments.push({ path, from: collection.length, to: result.length, reason });
  }
  return result;
}

function fitTextCollection(
  path: string,
  collection: unknown[],
  minimum: number,
  maximum: number,
  createFallback: (index: number) => string,
  adjustments: CareerBlueprintNormalizationResult["adjustedCollections"],
) {
  return fitCollection(path, collection, minimum, maximum, (value): value is string => meaningfulText(value), createFallback, adjustments);
}

function normalizeStageCollections(
  stage: GeneratedCareerStage,
  index: number,
  adjustments: CareerBlueprintNormalizationResult["adjustedCollections"],
): GeneratedCareerStage {
  const path = `stages[${index}]`;
  const title = stringValue(stage.title, `Career stage ${index + 1}`);
  const topic = stringValue(stage.resourceTopic, title);
  const expectedOutcome = stringValue(stage.expectedOutcome, `Produce reviewable professional evidence for ${title}.`);
  const lessonFallbacks = [
    `Professional foundations and decision criteria for ${topic}`,
    `Applied methods and evidence standards for ${title}`,
    `Quality review and stakeholder communication for ${title}`,
  ];
  const outcomeFallbacks = [
    `Explain the professional decisions required during ${title}.`,
    `Apply ${topic} to create reviewable evidence.`,
    `Evaluate completed work against this outcome: ${expectedOutcome}`,
  ];
  const lessons = fitTextCollection(`${path}.lessons`, stage.lessons, 3, 6, (item) => lessonFallbacks[item % lessonFallbacks.length], adjustments);
  const learningOutcomes = fitTextCollection(`${path}.learningOutcomes`, stage.learningOutcomes, 3, 6, (item) => outcomeFallbacks[item % outcomeFallbacks.length], adjustments);
  const tasks = fitCollection<GeneratedTask>(
    `${path}.tasks`, stage.tasks, 3, 5, validTask,
    (item) => ({
      title: `${title} evidence task ${item + 1}`,
      description: `Create a reviewable artifact that demonstrates this outcome: ${learningOutcomes[item % learningOutcomes.length]}`,
      type: "project",
    }),
    adjustments,
  );
  const practicalMissions = fitTextCollection(
    `${path}.practicalMissions`, stage.practicalMissions, 2, 5,
    (item) => item % 2 === 0
      ? `Create and document a realistic ${title} deliverable for professional review.`
      : `Present and defend the decisions made while completing ${title}.`,
    adjustments,
  );
  const preferredProviders = fitTextCollection(
    `${path}.preferredProviders`, stage.preferredProviders, 1, 5,
    () => `Official professional bodies and established providers for ${topic}`,
    adjustments,
  );
  const assessmentTemplates = [
    {
      scenario: `A stakeholder asks you to choose an approach for ${title} with incomplete information. What should guide the decision?`,
      correctPrinciple: `Use explicit criteria, evidence, constraints and the intended professional outcome.`,
      commonMistake: `Choosing a familiar approach without validating it against the actual requirements.`,
    },
    {
      scenario: `A deliverable from ${title} appears complete but does not demonstrate the expected outcome. How should it be reviewed?`,
      correctPrinciple: `Evaluate the evidence against measurable acceptance criteria and revise the weak areas.`,
      commonMistake: `Approving the deliverable because the activity was completed rather than checking its evidence.`,
    },
    {
      scenario: `During ${title}, two valid options create different trade-offs. How should you select between them?`,
      correctPrinciple: `Compare impact, risk, feasibility and stakeholder requirements before selecting an option.`,
      commonMistake: `Optimizing a single benefit while ignoring downstream risks and operational constraints.`,
    },
    {
      scenario: `A practical result in ${title} cannot be reproduced by another reviewer. What is the correct response?`,
      correctPrinciple: `Document assumptions, inputs, steps, decisions and evidence so the work is reproducible.`,
      commonMistake: `Relying on an undocumented demonstration or personal explanation as sufficient evidence.`,
    },
    {
      scenario: `You need to communicate the outcome of ${title} to a non-specialist stakeholder. What should the explanation prioritize?`,
      correctPrinciple: `Connect the evidence and decisions to stakeholder goals, risks and measurable outcomes.`,
      commonMistake: `Presenting technical detail without explaining its business or professional significance.`,
    },
  ];
  const assessmentSeeds = fitCollection<GeneratedAssessmentSeed>(
    `${path}.assessmentSeeds`, stage.assessmentSeeds, 5, 5, validAssessmentSeed,
    (item) => assessmentTemplates[item % assessmentTemplates.length],
    adjustments,
  );

  return {
    ...stage,
    lessons,
    learningOutcomes,
    tasks,
    practicalMissions,
    preferredProviders,
    assessmentSeeds,
  };
}

export function normalizeCareerBlueprintContract(value: unknown): CareerBlueprintNormalizationResult | null {
  if (!record(value) || !Array.isArray(value.stages) || !Array.isArray(value.projects)) return null;
  if (value.stages.length < TARGET_STAGE_COUNT || !value.stages.every(isNormalizableStage)) return null;

  const stages = value.stages as GeneratedCareerStage[];
  const adjustedCollections: CareerBlueprintNormalizationResult["adjustedCollections"] = [];
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
  const normalizedStages = groups.map((group) => group.length === 1
    ? stages[group[0]]
    : mergeStages(group.map((index) => stages[index])))
    .map((stage, index) => normalizeStageCollections(stage, index, adjustedCollections));

  const normalizedValue: Record<string, unknown> = { ...value };
  const title = stringValue(value.title, "Career professional");
  const shortTitle = stringValue(value.shortTitle, title);
  const category = stringValue(value.category, "Professional practice");
  const estimatedLearningTime = stringValue(value.estimatedLearningTime, "Role-dependent learning path");
  const programmingRequirement = stringValue(value.programmingRequirement, "Role-dependent");
  const mathRequirement = stringValue(value.mathRequirement, "Role-dependent");
  const communicationLevel = stringValue(value.communicationLevel, "Professional communication required");
  const creativityLevel = stringValue(value.creativityLevel, "Applied creativity required");
  const metricFallbacks: GeneratedMetric[] = [
    { label: "Learning horizon", value: estimatedLearningTime, detail: `Expected learning horizon for becoming effective as a ${shortTitle}.` },
    { label: "Programming", value: programmingRequirement, detail: `Programming expectation for this ${shortTitle} career path.` },
    { label: "Mathematics", value: mathRequirement, detail: `Mathematical and quantitative expectation for this career path.` },
    { label: "Communication", value: communicationLevel, detail: `Communication capability needed to deliver and explain professional outcomes.` },
    { label: "Creativity", value: creativityLevel, detail: `Creative problem-solving expectation for this professional role.` },
    { label: "Difficulty", value: stringValue(value.difficulty, "Intermediate"), detail: `Overall learning and practice difficulty for the ${shortTitle} pathway.` },
  ];
  normalizedValue.aliases = fitTextCollection(
    "aliases", arrayValue(value.aliases), 3, 12,
    (item) => [`${shortTitle} Specialist`, `${shortTitle} Analyst`, `${shortTitle} Consultant`][item % 3],
    adjustedCollections,
  );
  normalizedValue.bestFor = fitTextCollection(
    "bestFor", arrayValue(value.bestFor), 4, 8,
    (item) => [
      `Professionals building a career in ${shortTitle}`,
      `Analysts focused on measurable ${category} outcomes`,
      `Operators translating workflow problems into evidence-based improvements`,
      `Cross-functional professionals combining domain knowledge with responsible AI-enabled change`,
    ][item % 4],
    adjustedCollections,
  );
  normalizedValue.metrics = fitCollection<GeneratedMetric>(
    "metrics", arrayValue(value.metrics), 5, 8, validMetric,
    (item) => metricFallbacks[item % metricFallbacks.length],
    adjustedCollections,
  );

  if (record(value.overview)) {
    const overview = { ...value.overview };
    overview.responsibilities = fitTextCollection(
      "overview.responsibilities", arrayValue(value.overview.responsibilities), 6, 12,
      (item) => {
        const stage = normalizedStages[item % normalizedStages.length];
        return `Own ${stage.title} work and produce evidence aligned with: ${stage.expectedOutcome}`;
      },
      adjustedCollections,
    );
    const industryFallbacks = [
      "Technology and software", "Professional services and consulting", "Financial services",
      "Healthcare and life sciences", "Manufacturing and supply chain", "Retail and e-commerce",
      "Public sector and education",
    ];
    overview.industries = fitTextCollection(
      "overview.industries", arrayValue(value.overview.industries), 5, 12,
      (item) => industryFallbacks[item % industryFallbacks.length],
      adjustedCollections,
    );
    normalizedValue.overview = overview;
  }

  const createProject = (item: number): GeneratedProject => {
    const stageIndex = [3, 5, 7, 9][item % 4];
    const stage = normalizedStages[stageIndex];
    const deliverables = [
      `Documented ${stage.title} problem definition and success criteria`,
      `Reviewable implementation artifact demonstrating ${stage.expectedOutcome}`,
      `Evidence-based evaluation with limitations and improvement recommendations`,
    ];
    const skills = [stage.resourceTopic, stage.title, stage.learningOutcomes[0]];
    return {
      title: `${stage.title} evidence project`,
      difficulty: stage.skillLevel,
      estimatedTime: `${Math.max(4, Math.ceil(stage.effortMinutes.max / 60))} hours`,
      stageNumber: stageIndex + 1,
      description: `Create an employer-reviewable project that applies ${stage.resourceTopic} and demonstrates this outcome: ${stage.expectedOutcome}`,
      deliverables,
      skills,
    };
  };
  const projectCandidates = value.projects.map((project, index) => {
    if (!record(project)) return project;
    const originalStageNumber = typeof project.stageNumber === "number"
      ? Math.min(stages.length, Math.max(1, Math.round(project.stageNumber)))
      : Math.min(TARGET_STAGE_COUNT, index + 1);
    const stageNumber = stageNumberMap.get(originalStageNumber) ?? Math.min(TARGET_STAGE_COUNT, originalStageNumber);
    const stage = normalizedStages[stageNumber - 1];
    return {
      ...project,
      title: stringValue(project.title, `${stage.title} evidence project`),
      difficulty: ["Beginner", "Intermediate", "Advanced"].includes(String(project.difficulty)) ? project.difficulty : stage.skillLevel,
      estimatedTime: stringValue(project.estimatedTime, `${Math.max(4, Math.ceil(stage.effortMinutes.max / 60))} hours`),
      stageNumber,
      description: stringValue(project.description, `Create reviewable evidence that demonstrates ${stage.expectedOutcome}`),
      deliverables: fitTextCollection(
        `projects[${index}].deliverables`, arrayValue(project.deliverables), 3, 7,
        (item) => [
          `Documented problem definition and acceptance criteria for ${stage.title}`,
          `Reviewable professional artifact demonstrating ${stage.expectedOutcome}`,
          `Evaluation report with evidence, limitations and next actions`,
        ][item % 3],
        adjustedCollections,
      ),
      skills: fitTextCollection(
        `projects[${index}].skills`, arrayValue(project.skills), 3, 8,
        (item) => [stage.resourceTopic, stage.title, stage.learningOutcomes[0]][item % 3],
        adjustedCollections,
      ),
    };
  });
  const normalizedProjects = fitCollection<GeneratedProject>(
    "projects", projectCandidates, 4, 6, validProject, createProject, adjustedCollections,
  );

  const readinessCandidates = arrayValue(value.readiness).map((item, index) => {
    if (!record(item)) return item;
    const stage = normalizedStages[Math.min(index, normalizedStages.length - 1)];
    return {
      ...item,
      label: stringValue(item.label, `${stage.title} readiness`),
      description: stringValue(item.description, `Can independently produce and explain evidence for ${stage.expectedOutcome}`),
      weight: typeof item.weight === "number" && item.weight > 0 ? item.weight : 10,
    };
  });
  normalizedValue.readiness = fitCollection<GeneratedReadiness>(
    "readiness", readinessCandidates, 6, 10, validReadiness,
    (item) => {
      const stage = normalizedStages[item % normalizedStages.length];
      return {
        label: `${stage.title} readiness`,
        description: `Can independently produce, review and explain evidence for ${stage.expectedOutcome}`,
        weight: 10,
      };
    },
    adjustedCollections,
  );

  if (record(value.finalChallenge)) {
    const finalChallenge = { ...value.finalChallenge };
    finalChallenge.requirements = fitTextCollection(
      "finalChallenge.requirements", arrayValue(value.finalChallenge.requirements), 4, 10,
      (item) => `Apply ${normalizedStages[[2, 4, 6, 8][item % 4]].resourceTopic} with documented decisions and constraints.`,
      adjustedCollections,
    );
    finalChallenge.deliverables = fitTextCollection(
      "finalChallenge.deliverables", arrayValue(value.finalChallenge.deliverables), 4, 10,
      (item) => normalizedProjects[item % normalizedProjects.length].deliverables[item % 3],
      adjustedCollections,
    );
    finalChallenge.evaluation = fitTextCollection(
      "finalChallenge.evaluation", arrayValue(value.finalChallenge.evaluation), 4, 10,
      (item) => [
        "Quality and relevance of the professional problem definition",
        "Traceability of decisions to evidence and stakeholder requirements",
        "Completeness, usability and reproducibility of the deliverables",
        "Quality of risk analysis, limitations and improvement recommendations",
      ][item % 4],
      adjustedCollections,
    );
    normalizedValue.finalChallenge = finalChallenge;
  }

  normalizedValue.relatedCareers = fitTextCollection(
    "relatedCareers", arrayValue(value.relatedCareers), 3, 8,
    (item) => [`${shortTitle} Analyst`, `${shortTitle} Consultant`, `${shortTitle} Program Lead`][item % 3],
    adjustedCollections,
  );
  normalizedValue.portfolioTasks = fitCollection<GeneratedTask>(
    "portfolioTasks", arrayValue(value.portfolioTasks), 3, 6, validTask,
    (item) => ({
      title: `Publish ${normalizedProjects[item % normalizedProjects.length].title}`,
      description: `Present the problem, decisions, deliverables, evidence and measured outcome in an employer-reviewable case study.`,
      type: "portfolio",
    }),
    adjustedCollections,
  );
  normalizedValue.jobSearchTasks = fitCollection<GeneratedTask>(
    "jobSearchTasks", arrayValue(value.jobSearchTasks), 3, 6, validTask,
    (item) => ({
      title: [`Map target ${shortTitle} vacancies`, `Tailor evidence to role requirements`, `Run a documented application review`][item % 3],
      description: `Use verified vacancy requirements and portfolio evidence to improve the next ${shortTitle} application.`,
      type: "job-search",
    }),
    adjustedCollections,
  );

  if (record(value.interviewPrep)) {
    const interviewPrep = { ...value.interviewPrep };
    const interviewFallbacks = createCareerInterviewQuestionFallbacks(title);
    interviewPrep.practiceAreas = fitTextCollection(
      "interviewPrep.practiceAreas", arrayValue(value.interviewPrep.practiceAreas), 5, 12,
      (item) => normalizedStages[item % normalizedStages.length].title,
      adjustedCollections,
    );
    interviewPrep.questions = fitTextCollection(
      "interviewPrep.questions", arrayValue(value.interviewPrep.questions), 10, 20,
      (item) => interviewFallbacks[item % interviewFallbacks.length],
      adjustedCollections,
    );
    normalizedValue.interviewPrep = interviewPrep;
  }

  return {
    blueprint: {
      ...(normalizedValue as unknown as GeneratedCareerBlueprint),
      stages: normalizedStages,
      projects: normalizedProjects,
    },
    originalStageCount: stages.length,
    mergedStageGroups: groups.filter((group) => group.length > 1).map((group) => group.map((index) => index + 1)),
    adjustedCollections,
  };
}
