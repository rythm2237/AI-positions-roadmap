import assert from "node:assert/strict";
import {
  applyLearningDestinationPolicy,
  getDirectDestinationOverride,
  isDirectLearningDestination,
} from "../src/lib/references/referenceDestinationPolicy.ts";

assert.equal(
  isDirectLearningDestination({
    mode: "reading",
    contentType: "learning-path",
    url: "https://skillsbuild.org/learning-catalog",
  }),
  false,
  "catalog pages must not qualify as direct reading destinations",
);

assert.equal(
  isDirectLearningDestination({
    mode: "course",
    contentType: "official-course",
    url: "https://skillsbuild.org/learning-catalog/university-catalog",
  }),
  false,
  "course catalogs must not qualify as direct Course destinations",
);

assert.equal(
  isDirectLearningDestination({
    mode: "course",
    contentType: "official-course",
    url: "https://learn.microsoft.com/en-us/training/paths/get-started-with-artificial-intelligence-on-azure/",
  }),
  true,
  "a specific course or learning path may qualify as a direct Course destination",
);

assert.equal(
  isDirectLearningDestination({
    mode: "practice",
    contentType: "documentation",
    url: "https://docs.python.org/3/tutorial/",
  }),
  false,
  "ordinary documentation must never be relabeled as Practice",
);

assert.equal(
  isDirectLearningDestination({
    mode: "practice",
    contentType: "interactive-course",
    url: "https://github.com/skills/introduction-to-github",
  }),
  false,
  "GitHub repository roots must not qualify as direct practice destinations",
);

assert.equal(
  isDirectLearningDestination({
    mode: "video",
    contentType: "video",
    url: "https://www.youtube.com/@freecodecamp",
  }),
  false,
  "YouTube channels must not qualify as direct video destinations",
);

assert.equal(
  isDirectLearningDestination({
    mode: "video",
    contentType: "video",
    url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
  }),
  true,
  "exact YouTube watch URLs may qualify at the destination-policy layer when intentionally curated",
);

const githubStart = getDirectDestinationOverride("journey-github-docs", "practice");
assert.ok(githubStart, "GitHub practice must have a direct-start override");
assert.equal(
  isDirectLearningDestination({
    mode: "practice",
    contentType: "interactive-course",
    url: githubStart.url,
  }),
  true,
  "GitHub practice override must open the exercise-copy flow directly",
);

const ibmReading = applyLearningDestinationPolicy("journey-ibm-skillsbuild", {
  mode: "reading",
  contentType: "learning-path",
  title: "IBM SkillsBuild artificial intelligence path",
  description: "Broad AI path",
  url: "https://skillsbuild.org/adult-learners/explore-learning/artificial-intelligence",
  provider: "IBM SkillsBuild",
  verifiedContentType: true,
  verificationSource: "legacy",
});
assert.equal(ibmReading.url, "https://www.ibm.com/think/topics/artificial-intelligence");
assert.equal(ibmReading.verifiedContentType, true);
assert.match(ibmReading.verificationSource, /direct-destination/);

const rejected = applyLearningDestinationPolicy("example-resource", {
  mode: "practice",
  contentType: "hands-on-lab",
  url: "https://github.com/example/repository",
  verifiedContentType: true,
  verificationSource: "manual",
});
assert.equal(rejected.verifiedContentType, false);
assert.match(rejected.verificationSource, /destination-rejected/);

for (const [referenceId, mode] of [
  ["journey-github-docs", "practice"],
  ["journey-ibm-skillsbuild", "reading"],
  ["journey-openai-docs", "practice"],
  ["journey-hf-docs", "practice"],
]) {
  const override = getDirectDestinationOverride(referenceId, mode);
  assert.ok(override, `${referenceId}:${mode} must have an override`);
  assert.equal(
    isDirectLearningDestination({ mode, contentType: override.contentType, url: override.url }),
    true,
    `${referenceId}:${mode} override must pass destination fidelity`,
  );
}

console.log("Learning resource destination fidelity tests passed: Reading, Video, Course and selective Practice.");