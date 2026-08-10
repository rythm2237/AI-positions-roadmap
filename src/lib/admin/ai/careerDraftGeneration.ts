import "server-only";
import { createStructuredAdminResponse } from "@/lib/admin/ai/openaiAdminClient";

export type CareerDraftRequest = {
  slug: string;
  title: string;
  shortTitle: string;
  summary?: string;
  primaryTitle: string;
  aliases: string[];
};

export type CareerDraftPatch = {
  category: string;
  shortDescription: string;
  difficulty: string;
  estimatedLearningTime: string;
  overview: { title: string; body: string; responsibilities: string[]; industries: string[] };
  journeyMap: { overviewTitle: string; overviewDescription: string };
  stages: Array<{ id: string; title: string; description: string; learningGoals: string[] }>;
  roadmap: Array<{ title: string; description: string; outcomes: string[] }>;
  projects: Array<{ title: string; description: string; skills: string[] }>;
  resourceNeeds: Array<{ stageId: string; topic: string; preferredProviderTypes: string[]; searchIntent: string }>;
  qualityNotes: string[];
};

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["category","shortDescription","difficulty","estimatedLearningTime","overview","journeyMap","stages","roadmap","projects","resourceNeeds","qualityNotes"],
  properties: {
    category: { type: "string" },
    shortDescription: { type: "string" },
    difficulty: { type: "string" },
    estimatedLearningTime: { type: "string" },
    overview: {
      type: "object", additionalProperties: false,
      required: ["title","body","responsibilities","industries"],
      properties: {
        title: { type: "string" }, body: { type: "string" },
        responsibilities: { type: "array", items: { type: "string" } },
        industries: { type: "array", items: { type: "string" } },
      },
    },
    journeyMap: {
      type: "object", additionalProperties: false,
      required: ["overviewTitle","overviewDescription"],
      properties: { overviewTitle: { type: "string" }, overviewDescription: { type: "string" } },
    },
    stages: {
      type: "array", minItems: 4, maxItems: 7,
      items: {
        type: "object", additionalProperties: false,
        required: ["id","title","description","learningGoals"],
        properties: {
          id: { type: "string" }, title: { type: "string" }, description: { type: "string" },
          learningGoals: { type: "array", minItems: 3, maxItems: 8, items: { type: "string" } },
        },
      },
    },
    roadmap: {
      type: "array", minItems: 3, maxItems: 7,
      items: {
        type: "object", additionalProperties: false,
        required: ["title","description","outcomes"],
        properties: {
          title: { type: "string" }, description: { type: "string" },
          outcomes: { type: "array", minItems: 2, maxItems: 7, items: { type: "string" } },
        },
      },
    },
    projects: {
      type: "array", minItems: 3, maxItems: 6,
      items: {
        type: "object", additionalProperties: false,
        required: ["title","description","skills"],
        properties: {
          title: { type: "string" }, description: { type: "string" },
          skills: { type: "array", minItems: 2, maxItems: 8, items: { type: "string" } },
        },
      },
    },
    resourceNeeds: {
      type: "array", minItems: 4,
      items: {
        type: "object", additionalProperties: false,
        required: ["stageId","topic","preferredProviderTypes","searchIntent"],
        properties: {
          stageId: { type: "string" }, topic: { type: "string" },
          preferredProviderTypes: { type: "array", minItems: 2, maxItems: 5, items: { type: "string" } },
          searchIntent: { type: "string" },
        },
      },
    },
    qualityNotes: { type: "array", items: { type: "string" } },
  },
} as const;

const instructions = `You are the Career OS Admin Studio content architect.
Generate a professional, non-duplicative career blueprint grounded in the actual responsibilities and skill progression of the requested role.
Do not invent salary figures, hiring statistics, certifications, or factual claims that require external verification.
Do not provide direct course URLs. Instead define resource needs and preferred provider types so a separate resource-discovery workflow can verify authoritative sources.
Resource priority must be: official documentation or official academy; vendor training; university or recognized certification organization; reputable professional education provider; YouTube only as a last-resort exception.
Avoid generic text that could be pasted unchanged into unrelated careers. Make responsibilities, stages, projects and learning goals role-specific.
Output only the requested structured object.`;

export async function generateCareerDraft(request: CareerDraftRequest) {
  const input = `Create the initial Career OS blueprint for:\n${JSON.stringify(request, null, 2)}\n\nThe output is a draft for human review. It must not imply that external facts were verified.`;
  return createStructuredAdminResponse<CareerDraftPatch>({
    name: "career_os_admin_draft",
    description: "A structured first-pass Career OS content blueprint for Admin Studio review.",
    schema,
    instructions,
    input,
  });
}
