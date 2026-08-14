import assert from "node:assert/strict";
import fs from "node:fs";
import { validateCareerPublicationReadiness, validateCareerWorkspaceData } from "../src/lib/careerContentValidation.ts";
import { careerBlueprintSchema, resourcePackSchema, validateCareerBlueprintOutput } from "../src/lib/ai/careerGenerationSchema.ts";
import { applyResourcePacks } from "../src/lib/ai/careerBlueprintAssembler.ts";
import { normalizeCareerBlueprintContract } from "../src/lib/ai/careerBlueprintNormalization.ts";
import { getReviewableInterviewQuestions } from "../src/lib/careerInterviewQuality.ts";
import { careerWorkspaceSectionHref } from "../src/lib/careerNavigation.ts";
import { normalizeJourneyGeometry } from "../src/lib/journey/normalizeJourneyGeometry.ts";
import type { GeneratedResourcePack } from "../src/types/careerGeneration.ts";

const createPage = fs.readFileSync("src/app/admin/(studio)/careers/new/page.tsx", "utf8");
const builder = fs.readFileSync("src/components/admin/GenerativeCareerBuilder.tsx", "utf8");
const contentEditor = fs.readFileSync("src/components/admin/CareerContentEditor.tsx", "utf8");
const resourceStudio = fs.readFileSync("src/components/admin/CareerResourceStudio.tsx", "utf8");
const previewPage = fs.readFileSync("src/app/admin/(studio)/careers/[id]/preview/page.tsx", "utf8");
const generationRoute = fs.readFileSync("src/app/api/admin/careers/generate/route.ts", "utf8");
const resourceRoute = fs.readFileSync("src/app/api/admin/careers/[id]/resources/generate/route.ts", "utf8");
const generator = fs.readFileSync("src/lib/ai/careerGenerator.ts", "utf8");
const aiError = fs.readFileSync("src/lib/ai/aiError.ts", "utf8");
const actions = fs.readFileSync("src/app/admin/(studio)/careers/actions.ts", "utf8");
const workspaceComponent = fs.readFileSync("src/components/career/CareerWorkspace.tsx", "utf8");
const learningWorkspace = fs.readFileSync("src/components/career/learning/LearningWorkspace.tsx", "utf8");
const assembler = fs.readFileSync("src/lib/ai/careerBlueprintAssembler.ts", "utf8");

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
assert.match(previewPage, /navigationBasePath/);
assert.match(previewPage, /learningSourcesHref/);
assert.match(workspaceComponent, /ResizeObserver/);
assert.equal((workspaceComponent.match(/steps\.map\(/g) ?? []).length, 1, "Job preparation steps must render once");
assert.match(learningWorkspace, /Learning sources are not mapped yet/);
assert.match(assembler, /JOURNEY_MAP_WIDTH\s*=\s*3200/);
assert.match(generationRoute, /requireAdmin/);
assert.match(resourceRoute, /requireAdmin/);
assert.match(generator, /parallelSearch/);
assert.match(generator, /excludeDomains:\s*\["youtube\.com",\s*"youtu\.be"\]/);
assert.match(actions, /validateCareerPublicationReadiness/);
assert.match(generationRoute, /logCareerAiError/);
assert.match(resourceRoute, /logCareerAiError/);
assert.match(generator, /maxOutputTokens:\s*30000/);
assert.match(generator, /CAREER_BLUEPRINT_MODEL[^\n]+"openai\/gpt-5\.4-mini"/);
assert.match(generator, /CAREER_RESOURCE_MODEL[^\n]+"openai\/gpt-5\.4-mini"/);
assert.match(generator, /CAREER_FALLBACK_MODELS\s*=\s*\["google\/gemini-3-flash",\s*"openai\/gpt-5-mini"\]/);
assert.match(generator, /maxRetries:\s*0/);
assert.doesNotMatch(generator, /Promise\.all\(batch/);
assert.match(resourceRoute, /generateCareerResourcePack/);
assert.match(resourceRoute, /requirementId/);
assert.match(resourceStudio, /JSON\.stringify\(\{ requirementId: requirement\.id \}\)/);
assert.match(resourceStudio, /Each completed stage is validated and saved immediately/);
assert.match(assembler, /label:\s*stage\.title/);
assert.doesNotMatch(generator, /gpt-5\.6|claude-sonnet-5/);
assert.match(generator, /NoObjectGeneratedError/);
assert.match(generator, /Career Blueprint repair started/);
assert.match(generator, /attempt:\$\{attempt\}/);
assert.match(generator, /generateBlueprintAttempt\([\s\S]+"repair"/);
assert.match(generator, /previous_blueprint_json/);
assert.match(generator, /generatedStageCount:\s*repaired\.output\.stages\.length/);
assert.match(generator, /normalizeBlueprintFromError/);
assert.match(generator, /Career Blueprint contract normalized/);
assert.match(builder, /Validating and repairing the Career Blueprint contract/);
assert.match(aiError, /customer_verification_required/);
assert.match(aiError, /AI_GATEWAY_MODEL_RESTRICTED/);
assert.match(aiError, /AI_GATEWAY_FREE_TIER_RATE_LIMITED/);
assert.match(aiError, /nested\.errors/);
assert.match(aiError, /RestrictedModelsError/);
assert.match(aiError, /finishReason:\s*objectError\?\.finishReason/);
assert.match(aiError, /generatedStageCount/);
assert.ok(
  aiError.indexOf("customer_verification_required") < aiError.indexOf("statusCode === 401"),
  "Gateway billing verification errors must be classified before generic 403 authentication failures",
);
assert.ok(
  aiError.indexOf("RestrictedModelsError") < aiError.indexOf("statusCode === 401"),
  "Gateway Free Tier model restrictions must be classified before generic 403 authentication failures",
);

const generatedStageTypes = [
  "orientation", "foundation", "core-skills", "tools", "projects", "portfolio",
  "resume", "profile", "job-search", "jobs", "interview", "ready",
];
const generatedStages = generatedStageTypes.map((type, index) => ({
  title: `Stage ${index + 1}`,
  type,
  landmark: `Landmark ${index + 1}`,
  theme: `Theme ${index + 1}`,
  summary: `A complete summary for generated stage ${index + 1} with measurable professional progress.`,
  explanation: `A detailed explanation for generated stage ${index + 1} that preserves career-specific evidence, decisions, deliverables and professional standards.`,
  lessons: Array.from({ length: 3 }, (_, item) => `Stage ${index + 1} lesson ${item + 1}`),
  learningOutcomes: Array.from({ length: 3 }, (_, item) => `Stage ${index + 1} outcome ${item + 1}`),
  tasks: Array.from({ length: 3 }, (_, item) => ({ title: `Stage ${index + 1} task ${item + 1}`, description: "Create measurable professional evidence.", type: "lesson" })),
  phaseGoal: `Complete the professional goal for stage ${index + 1}.`,
  mentorTip: `Validate the evidence and decisions created in stage ${index + 1}.`,
  practicalMissions: [`Stage ${index + 1} mission 1`, `Stage ${index + 1} mission 2`],
  expectedOutcome: `Produce reviewable evidence for stage ${index + 1}.`,
  resourceTopic: `Stage ${index + 1} professional topic`,
  preferredProviders: ["Official provider"],
  skillLevel: index < 4 ? "Beginner" : index < 8 ? "Intermediate" : "Advanced",
  effortMinutes: { min: 120, max: 240 },
  assessmentSeeds: Array.from({ length: 5 }, (_, item) => ({
    scenario: `Stage ${index + 1} assessment scenario ${item + 1} with a practical decision.`,
    correctPrinciple: `Apply stage ${index + 1} principle ${item + 1}.`,
    commonMistake: `Avoid stage ${index + 1} mistake ${item + 1}.`,
  })),
}));
const overflowingStages = generatedStages.map((stage, index) => index === 0 ? {
  ...stage,
  lessons: Array.from({ length: 8 }, (_, item) => `Overflow lesson ${item + 1}`),
  learningOutcomes: Array.from({ length: 8 }, (_, item) => `Overflow outcome ${item + 1}`),
  tasks: Array.from({ length: 7 }, (_, item) => ({ title: `Overflow task ${item + 1}`, description: "Create measurable professional evidence.", type: "lesson" })),
  practicalMissions: Array.from({ length: 7 }, (_, item) => `Overflow mission ${item + 1}`),
  preferredProviders: Array.from({ length: 7 }, (_, item) => `Official provider ${item + 1}`),
  assessmentSeeds: Array.from({ length: 7 }, (_, item) => ({
    scenario: `Overflow assessment scenario ${item + 1} with a practical decision.`,
    correctPrinciple: `Apply overflow principle ${item + 1}.`,
    commonMistake: `Avoid overflow mistake ${item + 1}.`,
  })),
} : stage);
const normalizedBlueprint = normalizeCareerBlueprintContract({
  metrics: Array.from({ length: 10 }, (_, index) => ({ label: `Metric ${index + 1}`, value: "High", detail: "A complete professional metric detail." })),
  stages: overflowingStages,
  projects: Array.from({ length: 8 }, (_, index) => ({
    title: index === 0 ? "Late-stage project" : `Project ${index + 1}`,
    stageNumber: index === 0 ? 12 : 7,
    deliverables: Array.from({ length: 9 }, (_, item) => `Deliverable ${item + 1}`),
    skills: Array.from({ length: 10 }, (_, item) => `Skill ${item + 1}`),
  })),
});
assert.ok(normalizedBlueprint, "A complete 12-stage Blueprint must be structurally normalizable");
assert.equal(normalizedBlueprint.blueprint.stages.length, 10);
assert.equal(normalizedBlueprint.mergedStageGroups.length, 2, "Two non-overlapping stage groups should be consolidated");
assert.match(normalizedBlueprint.blueprint.stages.map((item) => item.title).join(" | "), /Stage 12/, "Final job-readiness content must be preserved");
assert.equal(normalizedBlueprint.blueprint.projects[0].stageNumber, 10, "Projects linked to stage 12 must map to the final normalized stage");
assert.equal(normalizedBlueprint.blueprint.projects.length, 6, "Excess projects must be capped at the contract maximum");
assert.equal(normalizedBlueprint.blueprint.projects[0].deliverables.length, 7);
assert.equal(normalizedBlueprint.blueprint.projects[0].skills.length, 8);
assert.equal(normalizedBlueprint.blueprint.metrics.length, 8, "Excess metrics must be capped at the contract maximum");
assert.equal(normalizedBlueprint.blueprint.stages[0].assessmentSeeds.length, 5);
assert.ok(normalizedBlueprint.adjustedCollections.some((item) => item.path === "metrics"));
assert.ok(normalizedBlueprint.adjustedCollections.some((item) => item.path === "stages[0].lessons"));
assert.ok(normalizedBlueprint.blueprint.stages.every((item) => item.assessmentSeeds.length === 5));
assert.ok(normalizedBlueprint.blueprint.stages.every((item) => item.lessons.length <= 6 && item.tasks.length <= 5));

const underfilledStages = generatedStages.slice(0, 10).map((stage, index) => index === 0 ? {
  ...stage,
  lessons: stage.lessons.slice(0, 2),
  learningOutcomes: stage.learningOutcomes.slice(0, 2),
  tasks: stage.tasks.slice(0, 2),
  practicalMissions: stage.practicalMissions.slice(0, 1),
  preferredProviders: [],
  assessmentSeeds: stage.assessmentSeeds.slice(0, 4),
} : stage);
const completedBlueprint = normalizeCareerBlueprintContract({
  title: "AI and Process Innovation Specialist",
  shortTitle: "AI Process Innovation",
  category: "AI Transformation",
  summary: "A complete professional pathway for applying AI to process innovation, operational improvement, adoption and evidence-based transformation decisions.",
  aliases: ["Process Innovation Specialist"],
  difficulty: "Intermediate",
  estimatedLearningTime: "6–12 months",
  salaryContext: "Salary depends on market, seniority and scope.",
  hiringDemandContext: "Demand requires current market research before publication.",
  remoteAvailability: "Hybrid and remote availability varies by employer.",
  aiCompatibility: "AI is central to analysis, design and implementation.",
  bestFor: ["Operational improvement professionals"],
  programmingRequirement: "Low-code to intermediate programming",
  mathRequirement: "Applied business mathematics and statistics",
  creativityLevel: "High",
  communicationLevel: "High",
  metrics: Array.from({ length: 3 }, (_, index) => ({ label: `Metric ${index + 1}`, value: "High", detail: "A complete professional metric detail." })),
  overview: {
    title: "Career overview",
    body: "This role identifies process problems, designs responsible AI-enabled improvements, validates measurable outcomes and supports stakeholder adoption across operational environments.",
    responsibilities: ["Analyze operational processes", "Design evidence-based improvements"],
    industries: ["Technology and software", "Professional services"],
  },
  journeyTheme: "ai-laboratory",
  journeyDescription: "A progressive journey from role orientation through applied delivery, portfolio evidence and job readiness.",
  stages: underfilledStages,
  projects: Array.from({ length: 2 }, (_, index) => ({
    title: `Existing project ${index + 1}`,
    difficulty: "Intermediate",
    estimatedTime: "20 hours",
    stageNumber: index + 4,
    description: "Create an employer-reviewable process innovation artifact supported by decisions, evidence and measurable acceptance criteria.",
    deliverables: ["Problem definition", "Implementation artifact"],
    skills: ["Process analysis", "AI solution design"],
  })),
  readiness: [
    { label: "Process analysis", description: "Can analyze a workflow and define measurable improvement criteria.", weight: 20 },
    { label: "AI solution design", description: "Can select and justify an appropriate AI-enabled approach.", weight: 20 },
  ],
  finalChallenge: {
    title: "AI process innovation capstone",
    description: "Deliver an end-to-end, employer-reviewable transformation case with traceable decisions, evidence, risks and measurable outcomes.",
    requirements: ["Define the professional problem", "Document stakeholder requirements"],
    deliverables: ["Solution artifact", "Evidence report"],
    evaluation: ["Problem relevance", "Evidence quality"],
  },
  relatedCareers: ["AI Transformation Analyst", "Process Automation Consultant"],
  portfolioTasks: [{ title: "Publish a case study", description: "Present the problem, decisions, artifact and evidence.", type: "portfolio" }],
  jobSearchTasks: [{ title: "Map target vacancies", description: "Compare vacancy requirements with verified portfolio evidence.", type: "job-search" }],
  interviewPrep: {
    title: "AI process innovation interview preparation",
    practiceAreas: ["Process analysis", "AI solution design", "Stakeholder alignment", "Risk management"],
    questions: Array.from({ length: 9 }, (_, index) => `How would you handle professional AI process innovation scenario ${index + 1}?`),
  },
});
assert.ok(completedBlueprint, "A ten-stage Blueprint with underfilled collections must be recoverable");
assert.equal(validateCareerBlueprintOutput(completedBlueprint.blueprint).success, true, "Contract completion must produce a fully valid Blueprint");
assert.equal(completedBlueprint.blueprint.metrics.length, 5);
assert.equal(completedBlueprint.blueprint.stages[0].lessons.length, 3);
assert.equal(completedBlueprint.blueprint.stages[0].tasks.length, 3);
assert.equal(completedBlueprint.blueprint.stages[0].assessmentSeeds.length, 5);
assert.equal(completedBlueprint.blueprint.projects.length, 4);
assert.ok(completedBlueprint.adjustedCollections.some((item) => item.path === "metrics" && item.reason === "completed"));
assert.ok(completedBlueprint.adjustedCollections.some((item) => item.path === "stages[0].assessmentSeeds" && item.reason === "completed"));
assert.equal(completedBlueprint.blueprint.interviewPrep.questions.length, 10);
assert.doesNotMatch(
  completedBlueprint.blueprint.interviewPrep.questions.join("\n"),
  /Describe a situation where you applied Stage \d+ professional topic/,
  "Interview completion must not expose internal stage resource topics",
);

const legacyInterviewQuestions = getReviewableInterviewQuestions(
  "AI & Process Innovation",
  [
    "Walk me through a process you improved and how you measured the result.",
    "Describe a situation where you applied Resume strategy, candidate positioning, and role-aligned profile writing, the trade-offs you considered and the evidence you produced.",
  ],
);
assert.equal(legacyInterviewQuestions.length, 10);
assert.doesNotMatch(legacyInterviewQuestions.join("\n"), /Resume strategy, candidate positioning/);

const legacyGeometry = normalizeJourneyGeometry(
  Array.from({ length: 10 }, (_, index) => ({
    id: `stage-${index + 1}`,
    order: index + 1,
    title: `Stage ${index + 1}`,
    type: "foundation" as const,
    landmark: `Landmark ${index + 1}`,
    theme: "Professional progression",
    x: 18 + index * 5,
    y: 12 + index * 6,
    summary: "Build professional evidence.",
    explanation: "Complete this career stage with reviewable evidence.",
    lessons: ["Career lesson"],
    resources: [],
    tasks: [],
  })),
  1200,
  900,
);
assert.equal(legacyGeometry.convertedFromPercentages, true);
assert.equal(legacyGeometry.width, 3200);
assert.ok(legacyGeometry.stages.every((item) => item.x > 100 && item.y > 100));
assert.equal(
  careerWorkspaceSectionHref("ai-process-innovation", "learning", "stage-1", "/admin/careers/career-id/preview"),
  "/admin/careers/career-id/preview?section=learning&step=stage-1",
);

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
  estimatedEffort: {
    minMinutes: 100,
    maxMinutes: 160,
    breakdown: {
      resources: { minMinutes: 0, maxMinutes: 0 },
      activities: { minMinutes: 60, maxMinutes: 100 },
      assessment: { minMinutes: 40, maxMinutes: 60 },
    },
  },
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

const workspaceValidation = validateCareerWorkspaceData(workspace, workspace.slug);
assert.equal(workspaceValidation.valid, true, "Blueprint must validate without external resources");
assert.equal(workspaceValidation.data.journeyStages[0].label, "Career foundation", "Generic or missing map labels must normalize to the Career-specific stage title");
assert.equal(validateCareerPublicationReadiness(workspace, workspace.slug).valid, false, "Publication must remain locked before source approval");

const assessmentSeeds = Array.from({ length: 5 }, (_, index) => ({
  question: `Resource question ${index + 1}`,
  answers: ["Correct", "Distractor 1", "Distractor 2", "Distractor 3"],
  correctAnswerIndex: 0,
  explanation: "The correct answer applies the requirement outcome.",
}));
const resourcePack: GeneratedResourcePack = {
  requirementId: "requirement-1",
  milestoneId: "career-stage-1",
  resources: [
    { mode: "reading", title: "Official reading", provider: "Provider", canonicalUrl: "https://example.com/official-reading", contentType: "documentation", estimatedTime: "60 minutes", whyUseful: "Supports the required learning outcome.", priority: "Essential", official: true, assessmentSeeds },
    { mode: "video", title: "Official video", provider: "Provider", canonicalUrl: "https://example.com/official-video", contentType: "video-course", estimatedTime: "60 minutes", whyUseful: "Demonstrates the required professional workflow.", priority: "Essential", official: true, assessmentSeeds },
    { mode: "practice", title: "Official practice", provider: "Provider", canonicalUrl: "https://example.com/official-practice", contentType: "hands-on-lab", estimatedTime: "60 minutes", whyUseful: "Creates evidence for the required outcome.", priority: "Essential", official: true, assessmentSeeds },
  ],
};
const checkpointed = applyResourcePacks(workspaceValidation.data, [resourcePack]);
const regenerated = applyResourcePacks(checkpointed, [resourcePack]);
assert.equal(checkpointed.globalResources.length, 3);
assert.equal(regenerated.globalResources.length, 3, "Regenerating one requirement must not duplicate registry resources");
assert.equal(checkpointed.journeyStages[0].estimatedEffort?.minMinutes, 160);
assert.equal(regenerated.journeyStages[0].estimatedEffort?.minMinutes, 160, "Resource effort must be idempotent across retries");
assert.equal(regenerated.journeyStages[0].topicAssessments?.length, 3);

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
