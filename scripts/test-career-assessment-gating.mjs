import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

const policy = read("src/lib/assessmentPolicy.ts");
const progress = read("src/lib/careerWorkspaceProgress.ts");
const bank = read("src/content/assessments/assessmentBank.ts");
const workspace = read("src/components/career/CareerWorkspace.tsx");
const learning = read("src/components/career/learning/LearningWorkspace.tsx");
const aiEngineer = read("src/data/careers/ai-engineer.ts");
const automation = read("src/data/careers/ai-automation-specialist.ts");

function journeyStageIds(source) {
  const journey = source.slice(
    source.indexOf("journeyStages:"),
    source.indexOf("roadmap:")
  );
  return [...journey.matchAll(/\bid:\s*"([^"]+)",\s*\n\s*order:\s*\d+/g)].map(
    (match) => match[1]
  );
}

const engineerStageIds = journeyStageIds(aiEngineer);
const automationStageIds = journeyStageIds(automation);
const activeStageIds = [...engineerStageIds, ...automationStageIds];

assert.equal(engineerStageIds.length, 13, "AI Engineer must have 13 Journey steps");
assert.equal(
  automationStageIds.length,
  13,
  "AI Automation Specialist must have 13 Journey steps"
);
assert.equal(new Set(activeStageIds).size, 26, "active Journey step IDs must be unique");

assert.match(policy, /CAREER_ASSESSMENT_PASSING_SCORE\s*=\s*60/);
assert.match(policy, /CAREER_ASSESSMENT_QUESTION_COUNT\s*=\s*5/);
assert.match(policy, /CAREER_SECTION_QUESTION_POOL_SIZE\s*=\s*15/);
assert.match(policy, /CAREER_PHASE_ASSESSMENT_PASSING_SCORE\s*=\s*70/);
assert.match(policy, /CAREER_PHASE_ASSESSMENT_QUESTION_COUNT\s*=\s*20/);
assert.match(policy, /return Boolean\(result\?\.passed\)/);
assert.match(progress, /\.slice\(0,\s*stageIndex\)[\s\S]*\.every\(/);
assert.match(progress, /const requiredAssessment = stage\.phaseExam \?\? stage\.test/);
assert.match(progress, /isAssessmentQualified\(/);
assert.match(progress, /isJourneyAssessmentUnlocked/);
assert.match(workspace, /isJourneyAssessmentUnlocked\([\s\S]*assessmentType/);
assert.match(learning, /"phase"[\s\S]*career,[\s\S]*progress/);

for (const stageId of activeStageIds) {
  assert.match(
    bank,
    new RegExp(`(?:^|\\n)\\s*["']?${stageId.replaceAll("-", "\\-")}["']?\\s*:`),
    `${stageId} needs a dedicated assessment profile`
  );
}

const sectionFactory = bank.slice(
  bank.indexOf("export function createSectionQuestions"),
  bank.indexOf("export function createPhaseAssessment")
);
assert.match(sectionFactory, /CAREER_SECTION_QUESTION_POOL_SIZE/);
assert.match(sectionFactory, /\`\$\{stageId\}-q15\`/);
assert.match(bank, /passingScore:\s*CAREER_ASSESSMENT_PASSING_SCORE/);
assert.match(bank, /passingScore:\s*CAREER_PHASE_ASSESSMENT_PASSING_SCORE/);
assert.match(bank, /questionsPerAttempt:\s*CAREER_PHASE_ASSESSMENT_QUESTION_COUNT/);
assert.match(bank, /Array\.from\(\{\s*length:\s*15\s*\}/);
assert.match(bank, /applyCareerAssessmentPolicy/);
assert.match(workspace, /questionsPerAttempt\s*\?\?\s*assessment\.questions\.length/);
assert.match(workspace, /passed:\s*score\s*>=\s*examSession\.assessment\.passingScore/);

const automationJourney = automation.slice(
  automation.indexOf("journeyStages:"),
  automation.indexOf("roadmap:")
);
assert.equal(
  [...automationJourney.matchAll(/estimatedEffort:\s*\{/g)].length,
  13,
  "every AI Automation Specialist step needs an effort estimate"
);

for (const estimate of automationJourney.matchAll(
  /estimatedEffort:\s*\{\s*minMinutes:\s*(\d+),\s*maxMinutes:\s*(\d+),\s*breakdown:\s*\{\s*resources:\s*\{\s*minMinutes:\s*(\d+),\s*maxMinutes:\s*(\d+)\s*\},\s*activities:\s*\{\s*minMinutes:\s*(\d+),\s*maxMinutes:\s*(\d+)\s*\},\s*assessment:\s*\{\s*minMinutes:\s*(\d+),\s*maxMinutes:\s*(\d+)\s*\}/g
)) {
  const values = estimate.slice(1).map(Number);
  const [min, max, resourcesMin, resourcesMax, activitiesMin, activitiesMax, assessmentMin, assessmentMax] =
    values;
  assert.equal(min, resourcesMin + activitiesMin + assessmentMin);
  assert.equal(max, resourcesMax + activitiesMax + assessmentMax);
}

console.log(
  `Career assessment gating validated: ${activeStageIds.length} steps, randomized five-question checks, and 20-question comprehensive assessments at 70%.`
);
