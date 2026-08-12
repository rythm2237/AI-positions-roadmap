import "server-only";
import { gateway, generateText, isStepCount, Output } from "ai";
import { careerBlueprintSchema, resourcePackSchema } from "@/lib/ai/careerGenerationSchema";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";
import type { GeneratedCareerBlueprint, GeneratedResourcePack } from "@/types/careerGeneration";
import type { ResourceRequirement } from "@/types/resourceRequirement";

export const CAREER_BLUEPRINT_MODEL = process.env.CAREER_BLUEPRINT_MODEL ?? "openai/gpt-5.6-sol";
export const CAREER_RESOURCE_MODEL = process.env.CAREER_RESOURCE_MODEL ?? "openai/gpt-5.6-terra";

const blueprintSystemPrompt = `You are the Career Blueprint Engine inside AI Career OS.

Create an evidence-conscious, career-specific professional transformation plan. The output will power one shared Career Workspace contract across Roadmap, Learning, Projects, Portfolio, Jobs and Interview pages.

Non-negotiable rules:
- Follow Career-first, Resources-second, Mapping-third.
- Do not include URLs, courses, books, videos or named external learning resources.
- Do not copy another career's journey. Every stage, task, project and assessment seed must be specific to the requested profession.
- Define exactly 10 progressive stages from role orientation to job readiness.
- Each stage needs measurable outcomes, practical evidence and five distinct assessment scenarios.
- Treat salary and hiring demand as research-dependent. Never invent statistics, percentages or unsupported market claims.
- Write concise professional English for an international audience.
- Avoid filler, motivational clichés and generic tasks such as “learn the basics”.
- A project must create employer-reviewable evidence with explicit deliverables.
- Alternative titles must be plausible vacancy-search variants and must not repeat the canonical title.
- Readiness weights should total approximately 100; the application will normalize them.
- Resource provider preferences describe where later research should look, not selected resources.
- The content is an AI-generated draft that requires Admin review before public publication.`;

export async function generateCareerBlueprint(title: string): Promise<GeneratedCareerBlueprint> {
  const { output } = await generateText({
    model: CAREER_BLUEPRINT_MODEL,
    system: blueprintSystemPrompt,
    prompt: `Generate the complete Career Blueprint for this exact role: “${title}”. Preserve this professional identity and distinguish it from adjacent roles.`,
    maxOutputTokens: 30000,
    providerOptions: {
      gateway: { models: ["anthropic/claude-sonnet-5"] },
    },
    output: Output.object({ schema: careerBlueprintSchema }),
  });
  if (!output) throw new Error("CAREER_BLUEPRINT_EMPTY");
  return output;
}

function resourcePrompt(career: CareerWorkspaceData, requirement: ResourceRequirement) {
  return `Research and curate one learning pack for the following approved Career milestone.

Career: ${career.title}
Milestone ID: ${requirement.milestoneId}
Requirement ID: ${requirement.id}
Topic: ${requirement.topic}
Skill level: ${requirement.skillLevel}
Required outcomes:
${requirement.requiredLearningOutcomes.map((outcome) => `- ${outcome}`).join("\n")}
Preferred providers: ${(requirement.preferredProviders ?? []).join(", ") || "Official institutions and reputable providers"}

You MUST use parallel_search before choosing resources. Return exactly three distinct resources: one reading, one video and one hands-on practice resource.

Rules:
- Every URL must come from the search results and begin with https://.
- Prefer official provider documentation, official learning centers, universities, standards bodies and established professional organizations.
- Do not use direct YouTube or youtu.be links.
- Do not invent URLs, titles, providers, durations or claims.
- Choose resources that directly support the listed outcomes at the declared level.
- Generate five resource-specific assessment questions per resource.
- Use the exact Requirement ID and Milestone ID supplied above.
- If the best resource is not fully free, say so implicitly through the explanation; do not fabricate access terms.`;
}

async function generateResourcePack(career: CareerWorkspaceData, requirement: ResourceRequirement): Promise<GeneratedResourcePack> {
  const { output } = await generateText({
    model: CAREER_RESOURCE_MODEL,
    prompt: resourcePrompt(career, requirement),
    maxOutputTokens: 8000,
    providerOptions: {
      gateway: { models: ["anthropic/claude-sonnet-5"] },
    },
    tools: {
      parallel_search: gateway.tools.parallelSearch({
        mode: "one-shot",
        maxResults: 8,
        sourcePolicy: { excludeDomains: ["youtube.com", "youtu.be"] },
        excerpts: { maxCharsPerResult: 5000, maxCharsTotal: 24000 },
      }),
    },
    stopWhen: isStepCount(4),
    output: Output.object({ schema: resourcePackSchema }),
  });
  if (!output) throw new Error("CAREER_RESOURCE_PACK_EMPTY");
  const modes = new Set(output.resources.map((resource) => resource.mode));
  if (!modes.has("reading") || !modes.has("video") || !modes.has("practice")) {
    throw new Error("CAREER_RESOURCE_MODES_INCOMPLETE");
  }
  return { ...output, requirementId: requirement.id, milestoneId: requirement.milestoneId };
}

export async function generateCareerResourcePacks(career: CareerWorkspaceData) {
  const requirements = career.resourceRequirements ?? [];
  if (!requirements.length) throw new Error("CAREER_RESOURCE_REQUIREMENTS_MISSING");

  const packs: GeneratedResourcePack[] = [];
  const batchSize = 3;
  for (let index = 0; index < requirements.length; index += batchSize) {
    const batch = requirements.slice(index, index + batchSize);
    packs.push(...await Promise.all(batch.map((requirement) => generateResourcePack(career, requirement))));
  }
  return packs;
}
