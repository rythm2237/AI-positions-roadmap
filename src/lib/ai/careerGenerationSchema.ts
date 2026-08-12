import { jsonSchema, type JSONSchema7 } from "ai";
import type { GeneratedCareerBlueprint, GeneratedResourcePack } from "@/types/careerGeneration";

const providerUnsupportedKeywords = new Set([
  "minLength", "maxLength", "pattern", "format",
  "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf",
  "minItems", "maxItems", "uniqueItems", "minProperties", "maxProperties",
]);

function providerSafeSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(providerSafeSchema);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !providerUnsupportedKeywords.has(key))
      .map(([key, nested]) => [key, providerSafeSchema(nested)]),
  );
}

const stringList = (minItems: number, maxItems: number): JSONSchema7 => ({
  type: "array",
  minItems,
  maxItems,
  items: { type: "string", minLength: 3 },
});

const taskSchema: JSONSchema7 = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description", "type"],
  properties: {
    title: { type: "string", minLength: 3 },
    description: { type: "string", minLength: 12 },
    type: {
      type: "string",
      enum: ["lesson", "resource", "project", "portfolio", "career", "interview", "job-search"],
    },
  },
};

const assessmentSeedSchema: JSONSchema7 = {
  type: "object",
  additionalProperties: false,
  required: ["scenario", "correctPrinciple", "commonMistake"],
  properties: {
    scenario: { type: "string", minLength: 20 },
    correctPrinciple: { type: "string", minLength: 10 },
    commonMistake: { type: "string", minLength: 10 },
  },
};

const careerStageSchema: JSONSchema7 = {
  type: "object",
  additionalProperties: false,
  required: [
    "title", "type", "landmark", "theme", "summary", "explanation", "lessons",
    "learningOutcomes", "tasks", "phaseGoal", "mentorTip", "practicalMissions",
    "expectedOutcome", "resourceTopic", "preferredProviders", "skillLevel",
    "effortMinutes", "assessmentSeeds",
  ],
  properties: {
    title: { type: "string", minLength: 3 },
    type: {
      type: "string",
      enum: [
        "orientation", "foundation", "core-skills", "tools", "projects", "portfolio",
        "resume", "profile", "job-search", "jobs", "interview", "assessment", "ready",
      ],
    },
    landmark: { type: "string", minLength: 3 },
    theme: { type: "string", minLength: 3 },
    summary: { type: "string", minLength: 30 },
    explanation: { type: "string", minLength: 80 },
    lessons: stringList(3, 6),
    learningOutcomes: stringList(3, 6),
    tasks: { type: "array", minItems: 3, maxItems: 5, items: taskSchema },
    phaseGoal: { type: "string", minLength: 20 },
    mentorTip: { type: "string", minLength: 20 },
    practicalMissions: stringList(2, 5),
    expectedOutcome: { type: "string", minLength: 20 },
    resourceTopic: { type: "string", minLength: 3 },
    preferredProviders: stringList(1, 5),
    skillLevel: { type: "string", enum: ["Beginner", "Intermediate", "Advanced"] },
    effortMinutes: {
      type: "object",
      additionalProperties: false,
      required: ["min", "max"],
      properties: {
        min: { type: "integer", minimum: 60, maximum: 12000 },
        max: { type: "integer", minimum: 90, maximum: 16000 },
      },
    },
    assessmentSeeds: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: assessmentSeedSchema,
    },
  },
};

const careerBlueprintJsonSchema: JSONSchema7 = {
  type: "object",
  additionalProperties: false,
  required: [
    "title", "shortTitle", "category", "summary", "aliases", "difficulty",
    "estimatedLearningTime", "salaryContext", "hiringDemandContext", "remoteAvailability",
    "aiCompatibility", "bestFor", "programmingRequirement", "mathRequirement",
    "creativityLevel", "communicationLevel", "metrics", "overview", "journeyTheme",
    "journeyDescription", "stages", "projects", "readiness", "finalChallenge",
    "relatedCareers", "portfolioTasks", "jobSearchTasks", "interviewPrep",
  ],
  properties: {
    title: { type: "string", minLength: 2, maxLength: 120 },
    shortTitle: { type: "string", minLength: 2, maxLength: 80 },
    category: { type: "string", minLength: 2, maxLength: 80 },
    summary: { type: "string", minLength: 80, maxLength: 1200 },
    aliases: stringList(3, 12),
    difficulty: { type: "string", minLength: 3 },
    estimatedLearningTime: { type: "string", minLength: 3 },
    salaryContext: { type: "string", minLength: 10 },
    hiringDemandContext: { type: "string", minLength: 10 },
    remoteAvailability: { type: "string", minLength: 5 },
    aiCompatibility: { type: "string", minLength: 5 },
    bestFor: stringList(4, 8),
    programmingRequirement: { type: "string", minLength: 5 },
    mathRequirement: { type: "string", minLength: 5 },
    creativityLevel: { type: "string", minLength: 3 },
    communicationLevel: { type: "string", minLength: 3 },
    metrics: {
      type: "array",
      minItems: 5,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "value", "detail"],
        properties: {
          label: { type: "string", minLength: 2 },
          value: { type: "string", minLength: 2 },
          detail: { type: "string", minLength: 12 },
        },
      },
    },
    overview: {
      type: "object",
      additionalProperties: false,
      required: ["title", "body", "responsibilities", "industries"],
      properties: {
        title: { type: "string", minLength: 3 },
        body: { type: "string", minLength: 120 },
        responsibilities: stringList(6, 12),
        industries: stringList(5, 12),
      },
    },
    journeyTheme: {
      type: "string",
      enum: [
        "treasure-map", "mountain-expedition", "island-adventure", "ai-laboratory",
        "cyber-fortress", "tech-city", "future-space-colony",
      ],
    },
    journeyDescription: { type: "string", minLength: 60 },
    stages: { type: "array", minItems: 10, maxItems: 10, items: careerStageSchema },
    projects: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "difficulty", "estimatedTime", "stageNumber", "description", "deliverables", "skills"],
        properties: {
          title: { type: "string", minLength: 3 },
          difficulty: { type: "string", enum: ["Beginner", "Intermediate", "Advanced"] },
          estimatedTime: { type: "string", minLength: 3 },
          stageNumber: { type: "integer", minimum: 1, maximum: 10 },
          description: { type: "string", minLength: 50 },
          deliverables: stringList(3, 7),
          skills: stringList(3, 8),
        },
      },
    },
    readiness: {
      type: "array",
      minItems: 6,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "description", "weight"],
        properties: {
          label: { type: "string", minLength: 3 },
          description: { type: "string", minLength: 15 },
          weight: { type: "integer", minimum: 1, maximum: 40 },
        },
      },
    },
    finalChallenge: {
      type: "object",
      additionalProperties: false,
      required: ["title", "description", "requirements", "deliverables", "evaluation"],
      properties: {
        title: { type: "string", minLength: 3 },
        description: { type: "string", minLength: 60 },
        requirements: stringList(4, 10),
        deliverables: stringList(4, 10),
        evaluation: stringList(4, 10),
      },
    },
    relatedCareers: stringList(3, 8),
    portfolioTasks: { type: "array", minItems: 3, maxItems: 6, items: taskSchema },
    jobSearchTasks: { type: "array", minItems: 3, maxItems: 6, items: taskSchema },
    interviewPrep: {
      type: "object",
      additionalProperties: false,
      required: ["title", "practiceAreas", "questions"],
      properties: {
        title: { type: "string", minLength: 3 },
        practiceAreas: stringList(5, 12),
        questions: stringList(10, 20),
      },
    },
  },
};

const learningResourceSchema: JSONSchema7 = {
  type: "object",
  additionalProperties: false,
  required: [
    "mode", "title", "provider", "canonicalUrl", "contentType", "estimatedTime",
    "whyUseful", "priority", "official", "assessmentSeeds",
  ],
  properties: {
    mode: { type: "string", enum: ["reading", "video", "practice"] },
    title: { type: "string", minLength: 3 },
    provider: { type: "string", minLength: 2 },
    canonicalUrl: { type: "string", pattern: "^https://" },
    contentType: { type: "string", minLength: 3 },
    estimatedTime: { type: "string", minLength: 3 },
    whyUseful: { type: "string", minLength: 25 },
    priority: { type: "string", enum: ["Essential", "Recommended"] },
    official: { type: "boolean" },
    assessmentSeeds: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "answers", "correctAnswerIndex", "explanation"],
        properties: {
          question: { type: "string", minLength: 15 },
          answers: stringList(4, 4),
          correctAnswerIndex: { type: "integer", minimum: 0, maximum: 3 },
          explanation: { type: "string", minLength: 15 },
        },
      },
    },
  },
};

const resourcePackJsonSchema: JSONSchema7 = {
  type: "object",
  additionalProperties: false,
  required: ["requirementId", "milestoneId", "resources"],
  properties: {
    requirementId: { type: "string", minLength: 3 },
    milestoneId: { type: "string", minLength: 3 },
    resources: { type: "array", minItems: 3, maxItems: 3, items: learningResourceSchema },
  },
};

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value: unknown, minimum = 1) {
  return typeof value === "string" && value.trim().length >= minimum;
}

function stringArray(value: unknown, minimum: number, maximum: number) {
  return Array.isArray(value)
    && value.length >= minimum
    && value.length <= maximum
    && value.every((item) => nonEmptyString(item, 3));
}

function objectArray(value: unknown, minimum: number, maximum: number) {
  return Array.isArray(value)
    && value.length >= minimum
    && value.length <= maximum
    && value.every(record);
}

function requiredStrings(value: Record<string, unknown>, keys: string[]) {
  return keys.every((key) => nonEmptyString(value[key]));
}

function validateCareerBlueprintOutput(value: unknown) {
  const invalid = (detail: string) => ({ success: false as const, error: new Error(`CAREER_BLUEPRINT_OUTPUT_INVALID: ${detail}`) });
  if (!record(value)) return invalid("root must be an object");
  if (!requiredStrings(value, [
    "title", "shortTitle", "category", "summary", "difficulty", "estimatedLearningTime",
    "salaryContext", "hiringDemandContext", "remoteAvailability", "aiCompatibility",
    "programmingRequirement", "mathRequirement", "creativityLevel", "communicationLevel",
    "journeyTheme", "journeyDescription",
  ])) return invalid("identity and overview strings are incomplete");
  if (!stringArray(value.aliases, 3, 12) || !stringArray(value.bestFor, 4, 8)) {
    return invalid("aliases or bestFor counts are outside the contract");
  }
  if (!objectArray(value.metrics, 5, 8) || !(value.metrics as Record<string, unknown>[]).every((item) => requiredStrings(item, ["label", "value", "detail"]))) {
    return invalid("metrics must contain 5–8 complete items");
  }
  if (!record(value.overview)
    || !requiredStrings(value.overview, ["title", "body"])
    || !stringArray(value.overview.responsibilities, 6, 12)
    || !stringArray(value.overview.industries, 5, 12)) {
    return invalid("overview is incomplete");
  }
  if (!objectArray(value.stages, 10, 10)) return invalid("exactly 10 stages are required");
  for (const [index, stage] of (value.stages as Record<string, unknown>[]).entries()) {
    if (!requiredStrings(stage, [
      "title", "type", "landmark", "theme", "summary", "explanation", "phaseGoal",
      "mentorTip", "expectedOutcome", "resourceTopic", "skillLevel",
    ])) return invalid(`stage ${index + 1} strings are incomplete`);
    if (!stringArray(stage.lessons, 3, 6)
      || !stringArray(stage.learningOutcomes, 3, 6)
      || !objectArray(stage.tasks, 3, 5)
      || !stringArray(stage.practicalMissions, 2, 5)
      || !stringArray(stage.preferredProviders, 1, 5)
      || !objectArray(stage.assessmentSeeds, 5, 5)) {
      return invalid(`stage ${index + 1} collections are outside the contract`);
    }
    if (!(stage.tasks as Record<string, unknown>[]).every((task) => requiredStrings(task, ["title", "description", "type"]))) {
      return invalid(`stage ${index + 1} tasks are incomplete`);
    }
    if (!(stage.assessmentSeeds as Record<string, unknown>[]).every((seed) => requiredStrings(seed, ["scenario", "correctPrinciple", "commonMistake"]))) {
      return invalid(`stage ${index + 1} assessment seeds are incomplete`);
    }
    if (!record(stage.effortMinutes)
      || typeof stage.effortMinutes.min !== "number"
      || typeof stage.effortMinutes.max !== "number"
      || stage.effortMinutes.min < 60
      || stage.effortMinutes.max < stage.effortMinutes.min) {
      return invalid(`stage ${index + 1} effort range is invalid`);
    }
  }
  if (!objectArray(value.projects, 4, 6)) return invalid("4–6 projects are required");
  for (const project of value.projects as Record<string, unknown>[]) {
    if (!requiredStrings(project, ["title", "difficulty", "estimatedTime", "description"])
      || typeof project.stageNumber !== "number"
      || project.stageNumber < 1
      || project.stageNumber > 10
      || !stringArray(project.deliverables, 3, 7)
      || !stringArray(project.skills, 3, 8)) return invalid("a project is incomplete");
  }
  if (!objectArray(value.readiness, 6, 10)
    || !(value.readiness as Record<string, unknown>[]).every((item) => requiredStrings(item, ["label", "description"]) && typeof item.weight === "number" && item.weight > 0)) {
    return invalid("readiness criteria are incomplete");
  }
  if (!record(value.finalChallenge)
    || !requiredStrings(value.finalChallenge, ["title", "description"])
    || !stringArray(value.finalChallenge.requirements, 4, 10)
    || !stringArray(value.finalChallenge.deliverables, 4, 10)
    || !stringArray(value.finalChallenge.evaluation, 4, 10)) return invalid("final challenge is incomplete");
  if (!stringArray(value.relatedCareers, 3, 8)
    || !objectArray(value.portfolioTasks, 3, 6)
    || !objectArray(value.jobSearchTasks, 3, 6)) return invalid("career preparation collections are incomplete");
  if (!(value.portfolioTasks as Record<string, unknown>[]).every((task) => requiredStrings(task, ["title", "description", "type"]))
    || !(value.jobSearchTasks as Record<string, unknown>[]).every((task) => requiredStrings(task, ["title", "description", "type"]))) {
    return invalid("portfolio or job-search tasks are incomplete");
  }
  if (!record(value.interviewPrep)
    || !requiredStrings(value.interviewPrep, ["title"])
    || !stringArray(value.interviewPrep.practiceAreas, 5, 12)
    || !stringArray(value.interviewPrep.questions, 10, 20)) return invalid("interview preparation is incomplete");
  return { success: true as const, value: value as unknown as GeneratedCareerBlueprint };
}

function validateResourcePackOutput(value: unknown) {
  const invalid = (detail: string) => ({ success: false as const, error: new Error(`CAREER_RESOURCE_OUTPUT_INVALID: ${detail}`) });
  if (!record(value) || !requiredStrings(value, ["requirementId", "milestoneId"]) || !objectArray(value.resources, 3, 3)) {
    return invalid("pack identity or resource count is invalid");
  }
  const modes = new Set<string>();
  for (const resource of value.resources as Record<string, unknown>[]) {
    if (!requiredStrings(resource, ["mode", "title", "provider", "canonicalUrl", "contentType", "estimatedTime", "whyUseful", "priority"])
      || typeof resource.official !== "boolean"
      || !/^https:\/\//i.test(String(resource.canonicalUrl))
      || /youtube\.com|youtu\.be/i.test(String(resource.canonicalUrl))
      || !objectArray(resource.assessmentSeeds, 5, 5)) return invalid("a resource is incomplete or unsafe");
    modes.add(String(resource.mode));
    for (const seed of resource.assessmentSeeds as Record<string, unknown>[]) {
      if (!requiredStrings(seed, ["question", "explanation"])
        || !stringArray(seed.answers, 4, 4)
        || typeof seed.correctAnswerIndex !== "number"
        || seed.correctAnswerIndex < 0
        || seed.correctAnswerIndex > 3) return invalid("a resource assessment is invalid");
    }
  }
  if (!["reading", "video", "practice"].every((mode) => modes.has(mode))) return invalid("reading, video and practice are all required");
  return { success: true as const, value: value as unknown as GeneratedResourcePack };
}

export const careerBlueprintSchema = jsonSchema<GeneratedCareerBlueprint>(
  providerSafeSchema(careerBlueprintJsonSchema) as JSONSchema7,
  { validate: validateCareerBlueprintOutput },
);

export const resourcePackSchema = jsonSchema<GeneratedResourcePack>(
  providerSafeSchema(resourcePackJsonSchema) as JSONSchema7,
  { validate: validateResourcePackOutput },
);
