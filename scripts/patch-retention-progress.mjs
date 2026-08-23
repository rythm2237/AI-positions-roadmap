import fs from "node:fs";

const file = "src/components/career/CareerReadinessPanel.tsx";
let source = fs.readFileSync(file, "utf8");

const importLine = 'import RetentionProgressPanel from "@/components/career/RetentionProgressPanel";';
if (!source.includes(importLine)) {
  const anchor = 'import React, { useEffect, useMemo, useState } from "react";';
  if (!source.includes(anchor)) throw new Error("CareerReadinessPanel React import anchor not found for retention integration.");
  source = source.replace(anchor, `${anchor}\n${importLine}`);
}

const integration = "      <RetentionProgressPanel career={career} progress={progress} />";
if (!source.includes(integration)) {
  const marker = "    </section>\n  );\n}";
  const index = source.lastIndexOf(marker);
  if (index < 0) throw new Error("CareerReadinessPanel closing section marker not found for retention integration.");
  source = `${source.slice(0, index)}${integration}\n${source.slice(index)}`;
}

fs.writeFileSync(file, source);
console.log("Weekly retention progress loop integrated into CareerReadinessPanel.");
