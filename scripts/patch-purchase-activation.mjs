import fs from "node:fs";

const file = "src/components/career/CareerReadinessPanel.tsx";
let source = fs.readFileSync(file, "utf8");

const importLine = 'import PurchaseActivationPanel from "@/components/career/PurchaseActivationPanel";';
if (!source.includes(importLine)) {
  const anchor = 'import BaselineDiagnosticWorkspace from "@/components/career/diagnostic/BaselineDiagnosticWorkspace";';
  if (!source.includes(anchor)) throw new Error("Baseline diagnostic import anchor not found.");
  source = source.replace(anchor, `${anchor}\n${importLine}`);
}

const integration = "      <PurchaseActivationPanel careerSlug={career.slug} />";
if (!source.includes(integration)) {
  const anchor = "      <BaselineDiagnosticWorkspace career={career} />";
  if (!source.includes(anchor)) throw new Error("Baseline diagnostic integration anchor not found.");
  source = source.replace(anchor, `${anchor}\n${integration}`);
}

fs.writeFileSync(file, source);
console.log("Purchase and activation panel integrated into CareerReadinessPanel.");
