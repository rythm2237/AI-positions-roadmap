import fs from "node:fs";
import path from "node:path";

const workspacePath = "src/components/career/CareerWorkspace.tsx";
const validationPath = "src/lib/careerContentValidation.ts";

let workspaceSource = fs.readFileSync(workspacePath, "utf8");
let validationSource = fs.readFileSync(validationPath, "utf8");

const assessmentPolicyImport = `import {
  didPassAssessment,
  isAssessmentQualified,
  isQualifiedResult,
} from "@/lib/assessmentPolicy";
`;

if (!workspaceSource.includes('from "@/lib/assessmentPolicy"')) {
  const navigationImport =
    'import { CAREER_NAV_ITEMS, careerSectionHref } from "@/lib/careerNavigation";\n';

  if (!workspaceSource.includes(navigationImport)) {
    throw new Error(
      "Could not locate the CareerWorkspace navigation import anchor."
    );
  }

  workspaceSource = workspaceSource.replace(
    navigationImport,
    navigationImport + assessmentPolicyImport
  );
}

const legacyBlock = /function allAssessments\([\s\S]*?\n}\n\nfunction shellButton/;

const canonicalBlock = `function allAssessments(
  career: CareerWorkspaceData
): Array<{
  assessment: CareerAssessment;
  stage: CareerJourneyStage;
  type: "topic" | "comprehensive";
}> {
  return career.journeyStages.flatMap((stage) => [
    ...(stage.topicAssessments ?? []).map((assessment) => ({
      assessment,
      stage,
      type: "topic" as const,
    })),
    ...(stage.phaseExam
      ? [
          {
            assessment: stage.phaseExam,
            stage,
            type: "comprehensive" as const,
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
        stage.title + " must provide one topic assessment for every learning topic."
      );
    }

    topicAssessments.forEach((assessment) => {
      if ((assessment.questionsPerAttempt ?? 0) !== 5) {
        warnings.push(assessment.title + " must select 5 questions per attempt.");
      }
      if (assessment.questions.length < 5) {
        warnings.push(assessment.title + " has fewer than 5 questions.");
      }
      if (assessment.passingScore !== 60) {
        warnings.push(assessment.title + " must use a 60% passing score.");
      }
    });

    if (!stage.phaseExam) {
      warnings.push(stage.title + " is missing its comprehensive assessment.");
    } else {
      if ((stage.phaseExam.questionsPerAttempt ?? 0) !== 20) {
        warnings.push(
          stage.title + " comprehensive assessment must select 20 questions."
        );
      }
      if (stage.phaseExam.questions.length < 20) {
        warnings.push(
          stage.title + " comprehensive assessment has fewer than 20 questions."
        );
      }
      if (stage.phaseExam.passingScore !== 70) {
        warnings.push(
          stage.title + " comprehensive assessment must use a 70% passing score."
        );
      }
    }

    return warnings;
  });
}

function shellButton`;

if (!legacyBlock.test(workspaceSource)) {
  throw new Error(
    "Could not locate the CareerWorkspace assessment helper block. The source shape changed and requires review."
  );
}

workspaceSource = workspaceSource.replace(legacyBlock, canonicalBlock);

const legacyPassingScore = "Passing score: {stage.test.passingScore}%";
const canonicalPassingScore =
  "Comprehensive passing score: {stage.phaseExam?.passingScore ?? 70}%";

if (!workspaceSource.includes(legacyPassingScore)) {
  throw new Error(
    "Could not locate the legacy StationDetailsModal passing-score consumer."
  );
}

workspaceSource = workspaceSource.replace(
  legacyPassingScore,
  canonicalPassingScore
);

const legacyValidation =
  "    if (!stage?.test || !list(stage.test.questions) || !stage.test.questions.length) errors.push(`Journey stage ${index + 1} needs an assessment.`);";

const canonicalValidation = `    const topicAssessments = stage?.topicAssessments;
    if (!list(topicAssessments) || !topicAssessments?.length) {
      errors.push(\`Journey stage \${index + 1} needs topic assessments.\`);
    } else {
      if (topicAssessments.length !== (stage?.lessons?.length ?? 0)) {
        errors.push(\`Journey stage \${index + 1} needs one topic assessment per lesson.\`);
      }
      topicAssessments.forEach((assessment, assessmentIndex) => {
        if (!list(assessment?.questions) || assessment.questions.length < 5) {
          errors.push(\`Journey stage \${index + 1}, topic assessment \${assessmentIndex + 1} needs at least 5 questions.\`);
        }
        if ((assessment?.questionsPerAttempt ?? 0) !== 5) {
          errors.push(\`Journey stage \${index + 1}, topic assessment \${assessmentIndex + 1} must use 5 questions per attempt.\`);
        }
        if (assessment?.passingScore !== 60) {
          errors.push(\`Journey stage \${index + 1}, topic assessment \${assessmentIndex + 1} must use a 60% passing score.\`);
        }
      });
    }
    if (!stage?.phaseExam || !list(stage.phaseExam.questions)) {
      errors.push(\`Journey stage \${index + 1} needs a comprehensive assessment.\`);
    } else {
      if (stage.phaseExam.questions.length < 20) {
        errors.push(\`Journey stage \${index + 1} comprehensive assessment needs at least 20 questions.\`);
      }
      if ((stage.phaseExam.questionsPerAttempt ?? 0) !== 20) {
        errors.push(\`Journey stage \${index + 1} comprehensive assessment must use 20 questions per attempt.\`);
      }
      if (stage.phaseExam.passingScore !== 70) {
        errors.push(\`Journey stage \${index + 1} comprehensive assessment must use a 70% passing score.\`);
      }
    }`;

if (!validationSource.includes(legacyValidation)) {
  throw new Error(
    "Could not locate the legacy career-content assessment validation."
  );
}

validationSource = validationSource.replace(
  legacyValidation,
  canonicalValidation
);

fs.writeFileSync(workspacePath, workspaceSource, "utf8");
fs.writeFileSync(validationPath, validationSource, "utf8");

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

for (const requiredSymbol of [
  "didPassAssessment",
  "isAssessmentQualified",
  "isQualifiedResult",
]) {
  if (!workspaceSource.includes(requiredSymbol)) {
    throw new Error(`Missing assessment policy symbol: ${requiredSymbol}`);
  }
}

console.log(
  "Applied canonical assessment contract, imports, and validation; no stage.test consumers remain."
);
