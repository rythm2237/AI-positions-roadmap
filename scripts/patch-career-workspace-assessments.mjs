import fs from "node:fs";
import path from "node:path";

const workspacePath = "src/components/career/CareerWorkspace.tsx";
const source = fs.readFileSync(workspacePath, "utf8");

const legacyBlock = /function allAssessments\([\s\S]*?\n}\n\nfunction shellButton/;

const canonicalBlock = `function allAssessments(
  career: CareerWorkspaceData
): Array<{
  assessment: CareerAssessment;
  stage: CareerJourneyStage;
  type: "station" | "phase";
}> {
  return career.journeyStages.flatMap((stage) => [
    ...(stage.topicAssessments ?? []).map((assessment) => ({
      assessment,
      stage,
      type: "station" as const,
    })),
    ...(stage.phaseExam
      ? [
          {
            assessment: stage.phaseExam,
            stage,
            type: "phase" as const,
          },
        ]
      : []),
  ]);
}

function validateJourneyData(career: CareerWorkspaceData): string[] {
  return career.journeyStages.flatMap((stage) => {
    const warnings: string[] = [];
    const topicAssessments = stage.topicAssessments ?? [];

    if (topicAssessments.length !== stage.lessons.length) {
      warnings.push(
        \\`${stage.title} must provide one topic assessment for every learning topic.\\`
      );
    }

    topicAssessments.forEach((assessment) => {
      if ((assessment.questionsPerAttempt ?? 0) !== 5) {
        warnings.push(\\`${assessment.title} must select 5 questions per attempt.\\`);
      }
      if (assessment.questions.length < 5) {
        warnings.push(\\`${assessment.title} has fewer than 5 questions.\\`);
      }
      if (assessment.passingScore !== 60) {
        warnings.push(\\`${assessment.title} must use a 60% passing score.\\`);
      }
    });

    if (!stage.phaseExam) {
      warnings.push(\\`${stage.title} is missing its comprehensive assessment.\\`);
    } else {
      if ((stage.phaseExam.questionsPerAttempt ?? 0) !== 20) {
        warnings.push(
          \\`${stage.title} comprehensive assessment must select 20 questions.\\`
        );
      }
      if (stage.phaseExam.questions.length < 20) {
        warnings.push(
          \\`${stage.title} comprehensive assessment has fewer than 20 questions.\\`
        );
      }
      if (stage.phaseExam.passingScore !== 70) {
        warnings.push(
          \\`${stage.title} comprehensive assessment must use a 70% passing score.\\`
        );
      }
    }

    return warnings;
  });
}

function shellButton`;

if (!legacyBlock.test(source)) {
  throw new Error(
    "Could not locate the CareerWorkspace assessment helper block. The source shape changed and requires review."
  );
}

const patched = source.replace(legacyBlock, canonicalBlock);
fs.writeFileSync(workspacePath, patched, "utf8");

function collectSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(entryPath);
    return /\.(ts|tsx)$/.test(entry.name) ? [entryPath] : [];
  });
}

const deprecatedConsumers = collectSourceFiles("src").filter((filePath) => {
  const fileSource = fs.readFileSync(filePath, "utf8");
  return /\bstage\.test\b/.test(fileSource);
});

if (deprecatedConsumers.length > 0) {
  throw new Error(
    `Deprecated stage.test consumers remain:\n${deprecatedConsumers.join("\n")}`
  );
}

console.log(
  "Applied canonical topic-assessment and comprehensive-assessment contract; no stage.test consumers remain."
);
