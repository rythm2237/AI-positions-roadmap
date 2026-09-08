import assert from "node:assert/strict";
import test from "node:test";
import { evidenceFromCvAnalyzer, evidenceFromMasterCv } from "../src/lib/job-agent/evidence.ts";

test("ordinary prose using the verb excel is not Microsoft Excel evidence", () => {
  const evidence = evidenceFromMasterCv(
    "resume-regression-1",
    "Profile\nI excel in solving operational problems and stakeholder communication.",
  );

  assert.equal(evidence.some((item) => item.label === "Excel"), false);
});

test("training and gerund prose are not promoted to professional implementation evidence", () => {
  const evidence = evidenceFromMasterCv(
    "resume-regression-2",
    "Training\nDesigning Power Automate workflows and optimizing Power BI dashboards.",
  );

  assert.equal(
    evidence.some((item) => ["work_implementation", "quantified_achievement"].includes(item.evidenceType)),
    false,
  );
});

test("CV Analyzer gerund-only experience is not promoted to work implementation", () => {
  const evidence = evidenceFromCvAnalyzer({
    sourceId: "analyzer-regression-1",
    skills: "Power BI",
    languages: "English",
    certifications: "",
    projects: "",
    experience: "Designing Power BI dashboards and optimizing reporting workflows",
    overall: 80,
    strengths: [],
  });

  assert.equal(
    evidence.some((item) => ["work_implementation", "quantified_achievement"].includes(item.evidenceType)),
    false,
  );
});

test("explicit delivered actions remain valid implementation evidence", () => {
  const evidence = evidenceFromMasterCv(
    "resume-regression-3",
    "Experience\nDesigned Power BI dashboards for 4 teams and automated weekly reporting.",
  );

  assert.equal(
    evidence.some((item) => ["work_implementation", "quantified_achievement"].includes(item.evidenceType)),
    true,
  );
});
