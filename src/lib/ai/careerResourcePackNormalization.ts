import type { GeneratedLearningResource, GeneratedResourcePack } from "@/types/careerGeneration";
import type { ResourceRequirement } from "@/types/resourceRequirement";

type AssessmentSeed = GeneratedLearningResource["assessmentSeeds"][number];
type LearningMode = GeneratedLearningResource["mode"];

const learningModes: LearningMode[] = ["reading", "video", "practice"];

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function validAssessmentSeed(value: unknown): value is AssessmentSeed {
  if (!record(value)) return false;
  const answers = Array.isArray(value.answers) ? value.answers : [];
  const normalizedAnswers = answers.map((answer) => typeof answer === "string" ? answer.trim().toLocaleLowerCase("en") : "");
  return Boolean(text(value.question))
    && Boolean(text(value.explanation))
    && answers.length === 4
    && answers.every((answer) => Boolean(text(answer)) && String(answer).trim().length >= 3)
    && new Set(normalizedAnswers).size === 4
    && Number.isInteger(value.correctAnswerIndex)
    && Number(value.correctAnswerIndex) >= 0
    && Number(value.correctAnswerIndex) <= 3;
}

function cleanAssessmentSeed(value: AssessmentSeed): AssessmentSeed {
  return {
    question: value.question.trim(),
    answers: value.answers.map((answer) => answer.trim()),
    correctAnswerIndex: value.correctAnswerIndex,
    explanation: value.explanation.trim(),
  };
}

function fallbackAssessmentSeed(
  resource: Pick<GeneratedLearningResource, "title" | "provider">,
  requirement: ResourceRequirement,
  index: number,
): AssessmentSeed {
  const outcome = requirement.requiredLearningOutcomes[index % Math.max(1, requirement.requiredLearningOutcomes.length)]
    ?? requirement.topic;
  const questions = [
    `Which action best applies ${resource.title} to the milestone outcome “${outcome}”?`,
    `What is the strongest evidence that a learner used ${resource.title} to achieve “${outcome}”?`,
    `How should a learner transfer the guidance from ${resource.title} into a professional ${requirement.topic} decision?`,
    `Which approach uses ${resource.title} responsibly when working toward “${outcome}”?`,
    `After completing ${resource.title}, what should the learner do to prove job-relevant capability?`,
  ];
  const correctAnswers = [
    "Apply the guidance to a scoped task and capture evidence against the declared outcome.",
    "Compare a concrete artifact and measured result with an explicit success criterion.",
    "Adapt the method to the real context, document assumptions, and validate the result.",
    "Record limitations, risks, human review points, and the evidence used for the decision.",
    "Produce a reviewable artifact showing the decision, execution, result, and reflection.",
  ];
  const distractors = [
    "Memorize the provider terminology without applying it to a practical situation.",
    "Treat the resource as proof of competence without producing any independent evidence.",
    "Reuse the guidance unchanged and skip validation in the learner's professional context.",
  ];
  const correctAnswerIndex = index % 4;
  const answers = [...distractors];
  answers.splice(correctAnswerIndex, 0, correctAnswers[index % correctAnswers.length]);
  return {
    question: questions[index % questions.length],
    answers,
    correctAnswerIndex,
    explanation: `${resource.provider}'s resource supports this milestone only when the learner applies it to “${outcome}” and produces verifiable evidence rather than relying on completion alone.`,
  };
}

function normalizeResource(
  value: unknown,
  requirement: ResourceRequirement,
) {
  if (!record(value)) return null;
  const mode = learningModes.includes(value.mode as LearningMode) ? value.mode as LearningMode : null;
  const title = text(value.title);
  const provider = text(value.provider);
  const canonicalUrl = text(value.canonicalUrl);
  const contentType = text(value.contentType);
  const estimatedTime = text(value.estimatedTime);
  const whyUseful = text(value.whyUseful);
  const priority = value.priority === "Essential" || value.priority === "Recommended" ? value.priority : null;
  if (!mode || !title || !provider || !canonicalUrl || !contentType || !estimatedTime || !whyUseful || !priority
    || typeof value.official !== "boolean"
    || !/^https:\/\//i.test(canonicalUrl)
    || /youtube\.com|youtu\.be/i.test(canonicalUrl)) return null;

  const sourceSeeds = Array.isArray(value.assessmentSeeds) ? value.assessmentSeeds : [];
  const seenQuestions = new Set<string>();
  const assessmentSeeds = sourceSeeds
    .filter(validAssessmentSeed)
    .map(cleanAssessmentSeed)
    .filter((seed) => {
      const key = seed.question.toLocaleLowerCase("en");
      if (seenQuestions.has(key)) return false;
      seenQuestions.add(key);
      return true;
    })
    .slice(0, 5);
  const retainedAssessmentSeeds = assessmentSeeds.length;
  while (assessmentSeeds.length < 5) {
    assessmentSeeds.push(fallbackAssessmentSeed({ title, provider }, requirement, assessmentSeeds.length));
  }

  return {
    resource: {
      mode,
      title,
      provider,
      canonicalUrl,
      contentType,
      estimatedTime,
      whyUseful,
      priority,
      official: value.official,
      assessmentSeeds,
    } satisfies GeneratedLearningResource,
    repairedAssessmentSeeds: 5 - retainedAssessmentSeeds,
  };
}

export interface NormalizedResourcePackContract {
  pack: GeneratedResourcePack;
  repairedAssessmentSeeds: number;
  repairedResourceCount: number;
}

export function normalizeResourcePackContract(
  value: unknown,
  requirement: ResourceRequirement,
): NormalizedResourcePackContract | null {
  if (!record(value) || !Array.isArray(value.resources) || value.resources.length !== 3) return null;
  const normalized = value.resources.map((resource) => normalizeResource(resource, requirement));
  if (normalized.some((resource) => !resource)) return null;
  const resources = normalized.map((item) => item!.resource);
  if (!learningModes.every((mode) => resources.filter((resource) => resource.mode === mode).length === 1)) return null;
  const canonicalUrls = resources.map((resource) => resource.canonicalUrl.replace(/\/$/, "").toLocaleLowerCase("en"));
  if (new Set(canonicalUrls).size !== 3) return null;
  resources.sort((left, right) => learningModes.indexOf(left.mode) - learningModes.indexOf(right.mode));
  return {
    pack: {
      requirementId: requirement.id,
      milestoneId: requirement.milestoneId,
      resources,
    },
    repairedAssessmentSeeds: normalized.reduce((total, item) => total + item!.repairedAssessmentSeeds, 0),
    repairedResourceCount: normalized.filter((item) => item!.repairedAssessmentSeeds > 0).length,
  };
}
