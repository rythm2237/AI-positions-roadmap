import assert from "node:assert/strict";
import fs from "node:fs";
import { validateCareerPublicationReadiness, validateCareerWorkspaceData } from "../src/lib/careerContentValidation.ts";
import { careerBlueprintSchema, resourcePackSchema } from "../src/lib/ai/careerGenerationSchema.ts";

const createPage = fs.readFileSync("src/app/admin/(studio)/careers/new/page.tsx", "utf8");
const builder = fs.readFileSync("src/components/admin/GenerativeCareerBuilder.tsx", "utf8");
const contentEditor = fs.readFileSync("src/components/admin/CareerContentEditor.tsx", "utf8");
const resourceStudio = fs.readFileSync("src/components/admin/CareerResourceStudio.tsx", "utf8");
const previewPage = fs.readFileSync("src/app/admin/(studio)/careers/[id]/preview/page.tsx", "utf8");
const generationRoute = fs.readFileSync("src/app/api/admin/careers/generate/route.ts", "utf8");
const resourceRoute = fs.readFileSync("src/app/api/admin/careers/[id]/resources/generate/route.ts", "utf8");
const generator = fs.readFileSync("src/lib/ai/careerGenerator.ts", "utf8");
const actions = fs.readFileSync("src/app/admin/(studio)/careers/actions.ts", "utf8");

assert.match(createPage, /GenerativeCareerBuilder/);
assert.doesNotMatch(createPage, /CareerForm/);
assert.match(builder, /What Career do you want to create\?/);
assert.match(builder, /Generate Career/);
assert.match(contentEditor, /Advanced JSON editor/);
assert.match(contentEditor, /Approve blueprint & create learning sources/);
assert.match(resourceStudio, /Create the learning sources/);
assert.match(resourceStudio, /Approve learning sources/);
assert.match(resourceStudio, /Direct YouTube links are excluded/);
assert.doesNotMatch(previewPage, /Preview unavailable/);
assert.match(previewPage, /Admin Draft Preview/);
assert.match(generationRoute, /requireAdmin/);
assert.match(resourceRoute, /requireAdmin/);
assert.match(generator, /parallelSearch/);
assert.match(generator, /excludeDomains:\s*\["youtube\.com",\s*"youtu\.be"\]/);
assert.match(actions, /validateCareerPublicationReadiness/);
assert.match(generationRoute, /logCareerAiError/);
assert.match(resourceRoute, /logCareerAiError/);
assert.match(generator, /maxOutputTokens:\s*30000/);
assert.match(generator, /models:\s*\["anthropic\/claude-sonnet-5"\]/);

const providerUnsupportedKeywords = [
  "minLength", "maxLength", "pattern", "format", "minimum", "maximum",
  "exclusiveMinimum", "exclusiveMaximum", "multipleOf", "minItems", "maxItems",
  "uniqueItems", "minProperties", "maxProperties",
];
for (const schema of [careerBlueprintSchema, resourcePackSchema]) {
  const providerSchema = await Promise.resolve(schema.jsonSchema);
  const serialized = JSON.stringify(providerSchema);
  for (const keyword of providerUnsupportedKeywords) {
    assert.doesNotMatch(serialized, new RegExp(`"${keyword}"\\s*:`), `${keyword} must not be sent to a Structured Output provider`);
  }
}

const questions = Array.from({ length: 20 }, (_, index) => ({
  id: `q-${index}`,
  question: `Question ${index}`,
  answers: ["A", "B", "C", "D"],
  correctAnswerIndex: 0,
  explanation: "A is correct.",
  difficulty: "Intermediate",
  relatedTopic: "Career topic",
}));
const sourceQuestions = questions.slice(0, 5);
const stage = {
  id: "career-stage-1",
  order: 1,
  title: "Career foundation",
  type: "foundation",
  landmark: "Foundation lab",
  theme: "Practice professional judgment",
  x: 20,
  y: 20,
  summary: "Build the foundation.",
  explanation: "Career-specific foundation.",
  lessons: ["Core concepts"],
  resources: [],
  tasks: [],
  topicAssessments: [],
  phaseExam: { id: "exam", title: "Exam", description: "Exam", questions, questionsPerAttempt: 20, passingScore: 70 },
};
const workspace = {
  slug: "generative-career",
  title: "Generative Career",
  titleAliases: [{ title: "Generative Career Specialist" }],
  category: "AI",
  shortDescription: "A Career generated for contract testing.",
  difficulty: "Intermediate",
  estimatedLearningTime: "12 weeks",
  lastUpdated: "2026-08-12",
  visual: { nodeLabel: "Career", sceneTitle: "Journey", sceneDescription: "Journey", imageAlt: "Journey" },
  overview: { title: "Overview", body: "Career overview", responsibilities: [], industries: [] },
  journeyMap: { theme: "ai-laboratory", overviewTitle: "Journey", overviewDescription: "Journey" },
  journeyStages: [stage],
  roadmap: [{}],
  projects: [],
  globalResources: [],
  mapSections: [],
  progressRules: { readinessThreshold: 80 },
  finalChallenge: { title: "Challenge" },
  jobBoard: { title: "Jobs" },
  interviewPrep: { title: "Interview" },
  resourceRequirements: [{
    id: "requirement-1",
    careerSlug: "generative-career",
    milestoneId: "career-stage-1",
    topic: "Career foundation",
    requiredModes: ["reading", "video", "practice"],
    requiredLearningOutcomes: ["Demonstrate foundation judgment"],
    skillLevel: "Intermediate",
    allowedContentTypes: ["documentation"],
    officialPreferred: true,
    freePreferred: true,
    estimatedDuration: { minMinutes: 60, maxMinutes: 120 },
    resourceIds: [],
  }],
  resourceMappings: [{ requirementId: "requirement-1", milestoneId: "career-stage-1", status: "pending" }],
  generationMetadata: { model: "test", generatedAt: "2026-08-12T00:00:00.000Z", blueprintStatus: "generated", resourceStatus: "pending" },
};

assert.equal(validateCareerWorkspaceData(workspace, workspace.slug).valid, true, "Blueprint must validate without external resources");
assert.equal(validateCareerPublicationReadiness(workspace, workspace.slug).valid, false, "Publication must remain locked before source approval");

const resources = [
  { id: "reading", title: "Reading", type: "Documentation", provider: "Provider", cost: "Free", estimatedTime: "1 hour", whyUseful: "Career-specific reading", url: "https://example.com/reading", priority: "Essential" },
  { id: "video", title: "Video", type: "Video", provider: "Provider", cost: "Free", estimatedTime: "1 hour", whyUseful: "Career-specific video", url: "https://example.com/video", priority: "Essential" },
  { id: "practice", title: "Practice", type: "Practice", provider: "Provider", cost: "Free", estimatedTime: "1 hour", whyUseful: "Career-specific practice", url: "https://example.com/practice", priority: "Essential" },
];
const approved = {
  ...workspace,
  globalResources: resources,
  journeyStages: [{
    ...stage,
    resources,
    topicAssessments: resources.map((resource) => ({ id: `${resource.id}-assessment`, title: "Assessment", description: "Assessment", questions: sourceQuestions, questionsPerAttempt: 5, passingScore: 60 })),
  }],
  resourceRequirements: [{ ...workspace.resourceRequirements[0], resourceIds: resources.map((resource) => resource.id) }],
  resourceMappings: [{ requirementId: "requirement-1", milestoneId: "career-stage-1", reading: "reading", video: "video", practice: "practice", status: "complete" }],
  generationMetadata: { ...workspace.generationMetadata, blueprintStatus: "reviewed", resourceStatus: "complete" },
};
assert.equal(validateCareerPublicationReadiness(approved, workspace.slug).valid, true, "Approved Reading, Video and Practice mappings must unlock publication");
assert.equal(validateCareerPublicationReadiness({ ...approved, globalResources: [{ ...resources[0], url: "https://youtube.com/watch?v=test" }, ...resources.slice(1)] }, workspace.slug).valid, false, "Direct YouTube links must remain blocked");

console.log("Generative Career title → Blueprint → Sources → approval → publication gate checks passed.");
