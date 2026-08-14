import { jsonSchema, type JSONSchema7 } from "ai";
import { isDirectLearningDestination } from "@/lib/references/referenceDestinationPolicy";
import type { GeneratedResourcePack } from "@/types/careerGeneration";

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

const assessmentSeedSchema: JSONSchema7 = {
  type: "object",
  additionalProperties: false,
  required: ["question", "answers", "correctAnswerIndex", "explanation"],
  properties: {
    question: { type: "string", minLength: 15 },
    answers: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: { type: "string", minLength: 3 },
    },
    correctAnswerIndex: { type: "integer", minimum: 0, maximum: 3 },
    explanation: { type: "string", minLength: 15 },
  },
};

const learningResourceSchema: JSONSchema7 = {
  type: "object",
  additionalProperties: false,
  required: [
    "mode", "title", "provider", "canonicalUrl", "contentType", "estimatedTime",
    "whyUseful", "priority", "official", "cost", "assessmentSeeds",
  ],
  properties: {
    mode: { type: "string", enum: ["reading", "video", "course", "practice"] },
    title: { type: "string", minLength: 3 },
    provider: { type: "string", minLength: 2 },
    canonicalUrl: { type: "string", pattern: "^https://" },
    contentType: { type: "string", minLength: 3 },
    estimatedTime: { type: "string", minLength: 3 },
    whyUseful: { type: "string", minLength: 25 },
    priority: { type: "string", enum: ["Essential", "Recommended"] },
    official: { type: "boolean" },
    cost: { type: "string", enum: ["Free", "Paid", "Free/Paid"] },
    assessmentSeeds: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: assessmentSeedSchema,
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

function text(value: unknown, minimum = 1) {
  return typeof value === "string" && value.trim().length >= minimum;
}

function validAnswers(value: unknown) {
  if (!Array.isArray(value) || value.length !== 4) return false;
  const answers = value.map((answer) => typeof answer === "string" ? answer.trim() : "");
  return answers.every((answer) => answer.length >= 3)
    && new Set(answers.map((answer) => answer.toLocaleLowerCase("en"))).size === 4;
}

export function validateAdaptiveResourcePackOutput(value: unknown) {
  const invalid = (detail: string) => ({
    success: false as const,
    error: new Error(`CAREER_RESOURCE_OUTPUT_INVALID: ${detail}`),
  });

  if (!record(value)
    || !text(value.requirementId, 3)
    || !text(value.milestoneId, 3)
    || !Array.isArray(value.resources)
    || value.resources.length !== 3) {
    return invalid("pack identity or resource count is invalid");
  }

  const modes: string[] = [];
  const canonicalUrls = new Set<string>();
  for (const resource of value.resources as unknown[]) {
    if (!record(resource)
      || !text(resource.mode)
      || !text(resource.title, 3)
      || !text(resource.provider, 2)
      || !text(resource.canonicalUrl, 8)
      || !text(resource.contentType, 3)
      || !text(resource.estimatedTime, 3)
      || !text(resource.whyUseful, 25)
      || !["Essential", "Recommended"].includes(String(resource.priority))
      || !["Free", "Paid", "Free/Paid"].includes(String(resource.cost))
      || typeof resource.official !== "boolean"
      || !Array.isArray(resource.assessmentSeeds)
      || resource.assessmentSeeds.length !== 5) {
      return invalid("a resource is incomplete");
    }

    const mode = String(resource.mode) as "reading" | "video" | "course" | "practice";
    if (!["reading", "video", "course", "practice"].includes(mode)) {
      return invalid("an unsupported learning mode was returned");
    }
    if (!/^https:\/\//i.test(String(resource.canonicalUrl))
      || /youtube\.com|youtu\.be/i.test(String(resource.canonicalUrl))) {
      return invalid("a resource URL is unsafe or disallowed");
    }
    if (!isDirectLearningDestination({
      mode,
      url: String(resource.canonicalUrl),
      contentType: String(resource.contentType),
    })) {
      return invalid(`${mode} must use a direct destination, not a catalog, homepage or ambiguous landing page`);
    }

    modes.push(mode);
    canonicalUrls.add(String(resource.canonicalUrl).replace(/\/$/, "").toLocaleLowerCase("en"));

    for (const seed of resource.assessmentSeeds as unknown[]) {
      if (!record(seed)
        || !text(seed.question, 15)
        || !validAnswers(seed.answers)
        || !Number.isInteger(seed.correctAnswerIndex)
        || Number(seed.correctAnswerIndex) < 0
        || Number(seed.correctAnswerIndex) > 3
        || !text(seed.explanation, 15)) {
        return invalid("a resource assessment is invalid");
      }
    }
  }

  if (modes.filter((mode) => mode === "reading").length !== 1
    || modes.filter((mode) => mode === "video").length !== 1) {
    return invalid("exactly one reading and one video resource are required");
  }
  const extensions = modes.filter((mode) => mode === "course" || mode === "practice");
  if (extensions.length !== 1) {
    return invalid("the third resource must be exactly one direct Course or genuine hands-on Practice");
  }
  if (canonicalUrls.size !== 3) return invalid("resources must use three distinct canonical URLs");

  return { success: true as const, value: value as unknown as GeneratedResourcePack };
}

export const adaptiveResourcePackSchema = jsonSchema<GeneratedResourcePack>(
  providerSafeSchema(resourcePackJsonSchema) as JSONSchema7,
  { validate: validateAdaptiveResourcePackOutput },
);