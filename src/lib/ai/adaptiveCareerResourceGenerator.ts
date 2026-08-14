import "server-only";
import { gateway, generateText, isStepCount, NoObjectGeneratedError, Output } from "ai";
import { adaptiveResourcePackSchema, validateAdaptiveResourcePackOutput } from "@/lib/ai/adaptiveResourcePackSchema";
import { normalizeResourcePackContract } from "@/lib/ai/careerResourcePackNormalization";
import { CAREER_FALLBACK_MODELS, CAREER_RESOURCE_MODEL } from "@/lib/ai/careerGenerator";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";
import type { GeneratedResourcePack } from "@/types/careerGeneration";
import type { ResourceRequirement } from "@/types/resourceRequirement";

function getErrorChain(error: unknown) {
  const chain: unknown[] = [];
  const queue: unknown[] = [error];
  const seen = new Set<unknown>();
  while (queue.length && chain.length < 12) {
    const current = queue.shift();
    if (!current || seen.has(current)) continue;
    seen.add(current);
    chain.push(current);
    if (current instanceof Error && current.cause) queue.push(current.cause);
    if (typeof current === "object") {
      const nested = current as { errors?: unknown[]; lastError?: unknown };
      if (Array.isArray(nested.errors)) queue.push(...nested.errors);
      if (nested.lastError) queue.push(nested.lastError);
    }
  }
  return chain;
}

function isRateLimitError(error: unknown) {
  return getErrorChain(error).some((item) => {
    if (typeof item === "object" && item && "statusCode" in item && item.statusCode === 429) return true;
    return item instanceof Error && /rate.?limit|too many requests|free tier requests on this model/i.test(item.message);
  });
}

function resourcePrompt(career: CareerWorkspaceData, requirement: ResourceRequirement) {
  return `Research and curate one focused learning pack for this approved Career milestone.

Career: ${career.title}
Milestone ID: ${requirement.milestoneId}
Requirement ID: ${requirement.id}
Topic: ${requirement.topic}
Skill level: ${requirement.skillLevel}
Required outcomes:
${requirement.requiredLearningOutcomes.map((outcome) => `- ${outcome}`).join("\n")}
Preferred providers: ${(requirement.preferredProviders ?? []).join(", ") || "Official institutions and reputable providers"}

You MUST use parallel_search before choosing resources.
Return exactly THREE distinct resources:
1. exactly one Reading resource;
2. exactly one Video resource;
3. exactly one adaptive extension: Course OR Practice.

ADAPTIVE EXTENSION RULE:
- Choose Practice ONLY when this exact topic has a genuinely useful hands-on environment where the learner can perform the task and observe an output: for example an executable coding lab, notebook, sandbox, codelab, guided exercise, interactive challenge or official exercise-start flow.
- Practice must NOT be ordinary documentation, a repository homepage, a generic course page, a catalog, a search page or a provider homepage.
- If a genuine hands-on environment is not clearly available, choose Course instead.
- A Course must link directly to the exact course, module, learning path or enrollment/detail page. Never return a course catalog or provider learning homepage.

SOURCE AND DESTINATION RULES:
- Every URL must come from the search results and begin with https://.
- Every URL must be a deep link to the exact consumable content or exact start action. The learner must not need to search after clicking.
- Prefer official provider documentation, official learning centers, universities, standards bodies and established professional organizations.
- Prefer free resources when quality is comparable. Paid courses are allowed when they offer materially stronger structured learning; mark cost accurately as Free, Paid, or Free/Paid.
- Do not use direct YouTube or youtu.be links.
- For Video, choose an exact video/player page from a reputable first-party or established learning provider.
- Do not invent URLs, titles, providers, durations, prices, access terms or claims.
- Choose resources that directly support the listed outcomes at the declared level.
- Generate five resource-specific assessment questions per resource.
- Every assessment must contain exactly four distinct, non-empty answers, an integer correctAnswerIndex from 0 to 3, and a substantive explanation.
- Use the exact Requirement ID and Milestone ID supplied above.

Before returning the object, verify that the modes are exactly reading + video + one of course/practice, all three URLs are distinct and direct, and the cost label for every resource is supported by the source.`;
}

type ResourceAttempt = "initial" | "retry";

async function generateAttempt(
  career: CareerWorkspaceData,
  requirement: ResourceRequirement,
  attempt: ResourceAttempt,
) {
  const result = await generateText({
    model: CAREER_RESOURCE_MODEL,
    prompt: `${resourcePrompt(career, requirement)}${attempt === "retry" ? "\n\nThis is an automatic retry. Recheck direct destination fidelity, the adaptive Course-versus-Practice decision, exact resource count, cost labels, answer counts and correctAnswerIndex values before returning the replacement pack." : ""}`,
    maxOutputTokens: 9000,
    maxRetries: 0,
    providerOptions: {
      gateway: {
        models: CAREER_FALLBACK_MODELS,
        tags: ["feature:career-resources-adaptive", `attempt:${attempt}`],
      },
    },
    tools: {
      parallel_search: gateway.tools.parallelSearch({
        mode: "one-shot",
        maxResults: 10,
        sourcePolicy: { excludeDomains: ["youtube.com", "youtu.be"] },
        excerpts: { maxCharsPerResult: 5000, maxCharsTotal: 28000 },
      }),
    },
    stopWhen: isStepCount(4),
    output: Output.object({ schema: adaptiveResourcePackSchema }),
  });
  if (!result.output) throw new Error("CAREER_RESOURCE_PACK_EMPTY");
  return {
    output: {
      ...result.output,
      requirementId: requirement.id,
      milestoneId: requirement.milestoneId,
    },
    finishReason: result.finishReason,
    usage: result.usage,
    responseModel: result.response.modelId,
  };
}

function normalizeFromError(
  error: unknown,
  requirement: ResourceRequirement,
  attempt: ResourceAttempt,
) {
  if (!NoObjectGeneratedError.isInstance(error) || !error.text) return null;
  try {
    const normalized = normalizeResourcePackContract(JSON.parse(error.text), requirement);
    if (!normalized) return null;
    const validation = validateAdaptiveResourcePackOutput(normalized.pack);
    if (!validation.success) return null;
    console.info(JSON.stringify({
      level: "info",
      message: "Adaptive Career resource pack normalized",
      attempt,
      requirementId: requirement.id,
      milestoneId: requirement.milestoneId,
      repairedAssessmentSeeds: normalized.repairedAssessmentSeeds,
      responseModel: error.response?.modelId,
    }));
    return validation.value;
  } catch {
    return null;
  }
}

export async function generateAdaptiveCareerResourcePack(
  career: CareerWorkspaceData,
  requirement: ResourceRequirement,
): Promise<GeneratedResourcePack> {
  try {
    return (await generateAttempt(career, requirement, "initial")).output;
  } catch (error) {
    if (isRateLimitError(error)) throw error;
    const normalized = normalizeFromError(error, requirement, "initial");
    if (normalized) return normalized;

    console.warn(JSON.stringify({
      level: "warn",
      message: "Adaptive Career resource pack retry started",
      requirementId: requirement.id,
      milestoneId: requirement.milestoneId,
      errorName: error instanceof Error ? error.name : "UnknownError",
    }));

    try {
      return (await generateAttempt(career, requirement, "retry")).output;
    } catch (retryError) {
      const normalizedRetry = normalizeFromError(retryError, requirement, "retry");
      if (normalizedRetry) return normalizedRetry;
      throw retryError;
    }
  }
}