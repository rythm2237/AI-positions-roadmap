import fs from "node:fs";

const workspacePath = "src/components/career/CareerWorkspace.tsx";
let source = fs.readFileSync(workspacePath, "utf8");

const importAnchor = 'import LearningWorkspace from "@/components/career/learning/LearningWorkspace";\n';
const reviewerImport = 'import GuidedProjectsWorkspace from "@/components/career/projects/GuidedProjectsWorkspace";\n';
if (!source.includes(reviewerImport)) {
  if (!source.includes(importAnchor)) throw new Error("Guided project patch: import anchor not found.");
  source = source.replace(importAnchor, importAnchor + reviewerImport);
}

const legacy = '{section === "project" ? <ProjectsModule progress={progress} updateProgress={updateProgress} openNote={openNote} /> : null}';
const replacement = '{section === "project" ? <GuidedProjectsWorkspace career={career} progress={progress} updateProgress={updateProgress} openNote={openNote} /> : null}';
if (source.includes(legacy)) {
  source = source.replace(legacy, replacement);
} else if (!source.includes(replacement)) {
  throw new Error("Guided project patch: ProjectsModule consumer not found.");
}

fs.writeFileSync(workspacePath, source, "utf8");

const required = [
  'GuidedProjectsWorkspace from "@/components/career/projects/GuidedProjectsWorkspace"',
  '<GuidedProjectsWorkspace career={career}',
];
for (const token of required) {
  if (!source.includes(token)) throw new Error(`Guided project patch missing ${token}`);
}
console.log("Guided project reviewer wired into Career Workspace.");
