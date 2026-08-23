import fs from "node:fs";

const path = "src/components/career/CareerWorkspace.tsx";
let source = fs.readFileSync(path, "utf8");

const importAnchor = 'import { EffortEstimate } from "@/components/career/EffortEstimate";';
const importLine = 'import { JobLaunchWorkspace } from "@/components/career/jobs/JobLaunchWorkspace";';
if (!source.includes(importLine)) {
  if (!source.includes(importAnchor)) throw new Error("Job launch patch import anchor not found.");
  source = source.replace(importAnchor, `${importAnchor}\n${importLine}`);
}

const legacy = 'section === "jobs" ? <JobsModule progress={progress} updateProgress={updateProgress} getSectionHref={getSectionHref} /> : null';
const replacement = 'section === "jobs" ? <JobLaunchWorkspace career={career} progress={progress} /> : null';
if (source.includes(legacy)) source = source.replace(legacy, replacement);
if (!source.includes(replacement)) throw new Error("Job launch workspace integration failed.");

fs.writeFileSync(path, source);
console.log("Evidence-based job launch workspace wired into Career Workspace.");
