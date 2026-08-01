import fs from "node:fs";

const path = "src/components/career/CareerWorkspace.tsx";
const source = fs.readFileSync(path, "utf8");

const oldImplementation = /function allAssessments\([\s\S]*?\n}\n\nfunction validateJourneyData/;

const replacement = `function allAssessments(
  career: CareerWorkspaceData
): Array<{
  assessment: CareerAssessment;
  stage: CareerJourneyStage;
  type: "station" | "phase";
}> {
  return career.journeyStages.flatMap((stage) => {
    const assessments: Array<{
      assessment: CareerAssessment;
      stage: CareerJourneyStage;
      type: "station" | "phase";
    }> = [];

    if (stage.test) {
      assessments.push({
        assessment: stage.test,
        stage,
        type: "station",
      });
    }

    if (stage.phaseExam) {
      assessments.push({
        assessment: stage.phaseExam,
        stage,
        type: "phase",
      });
    }

    return assessments;
  });
}

function validateJourneyData`;

if (!oldImplementation.test(source)) {
  throw new Error("Could not locate allAssessments in CareerWorkspace.tsx");
}

const patched = source.replace(oldImplementation, replacement);
fs.writeFileSync(path, patched, "utf8");
console.log("Applied type-safe CareerWorkspace assessment patch.");
