import fs from "node:fs";

const path = "src/data/careers/intelligent-automation-engineer.ts";
let source = fs.readFileSync(path, "utf8");

const replacements = [
  [
    'salary: "Varies by country, seniority, platform stack, and enterprise scope",',
    'salary: "Market-dependent — see Career Intelligence for verified salary data",',
  ],
  [
    'hiringDemand: "Strong in enterprise operations, shared services, finance, supply chain, consulting, and digital transformation",',
    'hiringDemand: "See Career Intelligence for current demand signals",',
  ],
  [
    'remoteAvailability: "Medium to High",',
    'remoteAvailability: "Varies by employer, seniority, location, client environment, and operating model",',
  ],
  [
    'aiCompatibilityScore: "95%",',
    'aiCompatibilityScore: "Not scored — role definition is intelligent-automation-native",',
  ],
  [
    'lastUpdated: "2026-08-01",',
    'lastUpdated: "2026-08-14",',
  ],
];

for (const [from, to] of replacements) {
  if (!source.includes(from)) {
    throw new Error(`Intelligent Automation Engineer production patch target not found: ${from}`);
  }
  source = source.replace(from, to);
}

for (const token of [
  'hiringDemand: "Strong in enterprise operations',
  'remoteAvailability: "Medium to High"',
  'aiCompatibilityScore: "95%"',
]) {
  if (source.includes(token)) {
    throw new Error(`Unsupported Intelligent Automation Engineer market token remains: ${token}`);
  }
}

fs.writeFileSync(path, source);
console.log("Intelligent Automation Engineer hardened: evidence-safe market claims applied while retaining audited shared learning resources.");
