import fs from "node:fs";

const file = "src/components/career/CareerReadinessPanel.tsx";
let source = fs.readFileSync(file, "utf8");

const importLine = 'import BaselineDiagnosticWorkspace from "@/components/career/diagnostic/BaselineDiagnosticWorkspace";';
if (!source.includes(importLine)) {
  const anchor = 'import React, { useEffect, useMemo, useState } from "react";';
  if (!source.includes(anchor)) throw new Error("CareerReadinessPanel React import anchor not found.");
  source = source.replace(anchor, `${anchor}\n${importLine}`);
}

const integration = "      <BaselineDiagnosticWorkspace career={career} />";
if (!source.includes(integration)) {
  const marker = "    </section>\n  );\n}";
  const index = source.lastIndexOf(marker);
  if (index < 0) throw new Error("CareerReadinessPanel closing section marker not found.");
  source = `${source.slice(0, index)}${integration}\n${source.slice(index)}`;
}

fs.writeFileSync(file, source);
console.log("Adaptive baseline diagnostic integrated into CareerReadinessPanel.");
