import assert from "node:assert/strict";
import { normalizeResourcePackContract } from "../src/lib/ai/careerResourcePackNormalization.ts";

const requirement = {
  id: "ai-process-innovation-stage-1-resource-requirement",
  careerSlug: "ai-process-innovation",
  milestoneId: "ai-process-innovation-stage-1",
  topic: "Role orientation and process innovation scope",
  requiredModes: ["reading", "video", "practice"] as ["reading", "video", "practice"],
  requiredLearningOutcomes: [
    "Define the role boundary",
    "Identify a measurable process problem",
    "Document evidence and governance constraints",
  ],
  skillLevel: "Beginner" as const,
  allowedContentTypes: ["documentation", "course", "lab"],
  officialPreferred: true,
  freePreferred: true,
  estimatedDuration: { minMinutes: 60, maxMinutes: 180 },
  resourceIds: [],
};

const validSeed = (index: number) => ({
  question: `Which professional action best demonstrates outcome ${index + 1}?`,
  answers: ["Apply the method and collect evidence", "Memorize the title only", "Skip validation completely", "Assume success without evidence"],
  correctAnswerIndex: 0,
  explanation: "Application with explicit evidence is the reviewable professional response.",
});

const resource = (mode: "reading" | "video" | "practice") => ({
  mode,
  title: `${mode} source for process innovation`,
  provider: "Official Provider",
  canonicalUrl: `https://example.com/${mode}`,
  contentType: mode === "video" ? "Video course" : "Official guide",
  estimatedTime: "60 minutes",
  whyUseful: "It directly supports the approved milestone outcome with practical professional guidance.",
  priority: "Essential",
  official: true,
  assessmentSeeds: Array.from({ length: 5 }, (_, index) => validSeed(index)),
});

const malformed = {
  requirementId: "model-invented-requirement",
  milestoneId: "model-invented-milestone",
  resources: [
    {
      ...resource("reading"),
      assessmentSeeds: [
        validSeed(0),
        validSeed(1),
        validSeed(2),
        { ...validSeed(3), answers: ["Valid answer", "", "Third answer", "Fourth answer"] },
      ],
    },
    resource("video"),
    resource("practice"),
  ],
};

const normalized = normalizeResourcePackContract(malformed, requirement);
assert.ok(normalized, "A pack with valid searched resources and a malformed assessment must be repairable");
assert.equal(normalized.pack.requirementId, requirement.id);
assert.equal(normalized.pack.milestoneId, requirement.milestoneId);
assert.deepEqual(normalized.pack.resources.map((item) => item.mode), ["reading", "video", "practice"]);
assert.ok(normalized.pack.resources.every((item) => item.assessmentSeeds.length === 5));
assert.ok(normalized.pack.resources.every((item) => item.assessmentSeeds.every((seed) => seed.answers.length === 4 && seed.correctAnswerIndex >= 0 && seed.correctAnswerIndex <= 3)));
assert.equal(normalized.repairedResourceCount, 1);
assert.equal(normalized.repairedAssessmentSeeds, 2);

assert.equal(normalizeResourcePackContract({ ...malformed, resources: [resource("reading"), resource("reading"), resource("practice")] }, requirement), null, "Duplicate learning modes must not be reclassified silently");
assert.equal(normalizeResourcePackContract({ ...malformed, resources: [resource("reading"), { ...resource("video"), canonicalUrl: "https://example.com/reading/" }, resource("practice")] }, requirement), null, "A source pack must use three distinct canonical URLs");
assert.equal(normalizeResourcePackContract({ ...malformed, resources: [{ ...resource("reading"), canonicalUrl: "https://youtube.com/watch?v=test" }, resource("video"), resource("practice")] }, requirement), null, "Direct YouTube links must remain blocked");

console.log("Career resource pack assessment normalization and safety guardrails passed.");
