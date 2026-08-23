import fs from "node:fs";

const workspacePath = "src/components/career/CareerWorkspace.tsx";
let source = fs.readFileSync(workspacePath, "utf8");
const importLine = 'import PortfolioProofWorkspace from "@/components/career/portfolio/PortfolioProofWorkspace";\n';
if (!source.includes(importLine)) {
  const anchor = 'import GuidedProjectsWorkspace from "@/components/career/projects/GuidedProjectsWorkspace";\n';
  if (!source.includes(anchor)) throw new Error("GuidedProjectsWorkspace import anchor not found.");
  source = source.replace(anchor, anchor + importLine);
}
const legacy = 'section === "portfolio" ? <PortfolioModule progress={progress} updateProgress={updateProgress} getSectionHref={getSectionHref} /> : null';
const replacement = 'section === "portfolio" ? <PortfolioProofWorkspace career={career} /> : null';
if (source.includes(legacy)) source = source.replace(legacy, replacement);
else if (!source.includes(replacement)) throw new Error("Portfolio module integration anchor not found.");
fs.writeFileSync(workspacePath, source, "utf8");
console.log("Portfolio proof workspace wired into Career Workspace.");
