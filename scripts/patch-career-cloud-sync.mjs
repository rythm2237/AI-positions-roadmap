import fs from "node:fs";

const file = "src/components/career/CareerWorkspace.tsx";
let source = fs.readFileSync(file, "utf8");

const importLine = 'import CareerCloudSyncBridge from "@/components/career/CareerCloudSyncBridge";';
if (!source.includes(importLine)) {
  const anchor = 'import LearningWorkspace from "@/components/career/learning/LearningWorkspace";';
  if (!source.includes(anchor)) throw new Error("CareerCloudSync import anchor not found.");
  source = source.replace(anchor, `${anchor}\n${importLine}`);
}

const bridge = "      <CareerCloudSyncBridge careerSlug={career.slug} />";
if (!source.includes(bridge)) {
  const provider = "    <CareerDataContext.Provider value={career}>";
  if (!source.includes(provider)) throw new Error("CareerCloudSync provider anchor not found.");
  source = source.replace(provider, `${provider}\n${bridge}`);
}

fs.writeFileSync(file, source);
console.log("Account-backed career cloud sync integrated into CareerWorkspace.");
