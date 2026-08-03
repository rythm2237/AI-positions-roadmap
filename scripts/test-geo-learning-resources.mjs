import fs from "node:fs";

const databasePath = "src/data/learning/geoLearningDatabase.ts";
const resolverPath = "src/lib/references/referenceResolver.ts";
const source = fs.readFileSync(databasePath, "utf8");
const resolver = fs.readFileSync(resolverPath, "utf8");

const ids = [...source.matchAll(/id:\s*"(geo-[^"]+)"/g)].map((match) => match[1]);
const uniqueIds = new Set(ids);
if (ids.length !== 12 || uniqueIds.size !== 12) {
  throw new Error(`Expected 12 unique GEO learning resources; found ${ids.length} entries and ${uniqueIds.size} unique IDs.`);
}

const resourceBlocks = source.split(/\n\s*resource\(\{/).slice(1);
for (const block of resourceBlocks) {
  const id = block.match(/id:\s*"(geo-[^"]+)"/)?.[1] ?? "unknown";
  for (const mode of ["reading", "video", "practice"]) {
    if (!block.includes(`mode: "${mode}"`)) {
      throw new Error(`${id} is missing a verified ${mode} learning option.`);
    }
  }
  if (block.includes("youtube.com") || block.includes("youtu.be")) {
    throw new Error(`${id} uses YouTube even though provider-hosted learning was required.`);
  }
  if (block.includes('/methodology') || block.includes('/sources') || block.includes('/practice/geo/')) {
    throw new Error(`${id} routes practice to a generic or unsupported internal page.`);
  }
  const verifiedModes = [...block.matchAll(/mode:\s*"(reading|video|practice)"/g)].map((match) => match[1]);
  if (new Set(verifiedModes).size !== 3) {
    throw new Error(`${id} must expose exactly one option for each learning mode.`);
  }
}

if (!resolver.includes("GEO_LEARNING_DATABASE")) {
  throw new Error("Reference resolver is not connected to the central GEO learning database.");
}
if (resolver.includes("geoLearningSupplements") || resolver.includes("youtube.com") || resolver.includes("/practice/geo/")) {
  throw new Error("Reference resolver still contains hard-coded GEO learning content.");
}

console.log("GEO learning resources validated: 12 centralized resources, 36 verified modes, no YouTube or placeholder practice routes.");
