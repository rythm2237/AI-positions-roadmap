import fs from "node:fs";

const path = "src/components/career/CareerWorkspace.tsx";
let source = fs.readFileSync(path, "utf8");
const importLine = 'import MockInterviewWorkspace from "@/components/career/interview/MockInterviewWorkspace";';
if (!source.includes(importLine)) {
  source = source.replace('import LearningWorkspace from "@/components/career/learning/LearningWorkspace";','import LearningWorkspace from "@/components/career/learning/LearningWorkspace";\n' + importLine);
}
source = source.replace('{section === "interview-brief" ? <InterviewModule /> : null}','{section === "interview-brief" ? <MockInterviewWorkspace career={career} /> : null}');
if (!source.includes('MockInterviewWorkspace career={career}')) throw new Error("Failed to wire mock interview workspace.");
fs.writeFileSync(path, source);
console.log("Mock interview workspace wired into Career Workspace.");
