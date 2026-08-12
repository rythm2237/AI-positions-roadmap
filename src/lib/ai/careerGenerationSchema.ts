import { jsonSchema, type JSONSchema7 } from "ai";
import type { GeneratedCareerBlueprint, GeneratedResourcePack } from "@/types/careerGeneration";

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

export const careerBlueprintSchema = jsonSchema<GeneratedCareerBlueprint>({
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
} satisfies JSONSchema7);

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

export const resourcePackSchema = jsonSchema<GeneratedResourcePack>({
  type: "object",
  additionalProperties: false,
  required: ["requirementId", "milestoneId", "resources"],
  properties: {
    requirementId: { type: "string", minLength: 3 },
    milestoneId: { type: "string", minLength: 3 },
    resources: { type: "array", minItems: 3, maxItems: 3, items: learningResourceSchema },
  },
} satisfies JSONSchema7);
