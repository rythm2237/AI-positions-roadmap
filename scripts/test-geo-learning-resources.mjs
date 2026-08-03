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

if (source.includes("coursera.org")) {
  throw new Error("GEO learning resources must not depend on Coursera or uncertain free/paid access.");
}
if (source.includes('access: "free/paid"')) {
  throw new Error("Every published GEO learning option must have verified free access.");
}
if (source.includes("youtube.com") || source.includes("youtu.be")) {
  throw new Error("GEO currently has stronger provider-hosted training; YouTube should remain a last-resort fallback.");
}

const resourceBlocks = source.split(/\n\s*resource\(\{/).slice(1);
for (const block of resourceBlocks) {
  const id = block.match(/id:\s*"(geo-[^"]+)"/)?.[1] ?? "unknown";
  const modes = [...block.matchAll(/mode:\s*"(reading|video|practice)"/g)].map((match) => match[1]);
  const uniqueModes = new Set(modes);

  if (!uniqueModes.has("reading")) {
    throw new Error(`${id} is missing a meaningful reading option.`);
  }
  if (modes.length !== uniqueModes.size) {
    throw new Error(`${id} contains duplicate learning modes.`);
  }
  if (block.includes('/methodology') || block.includes('/sources') || block.includes('/practice/geo/')) {
    throw new Error(`${id} routes learners to a generic or unsupported internal practice page.`);
  }
  if (block.includes('mode: "practice"') && !/(hands-on|interactive|assessment|analysis|audit|test|course)/i.test(block)) {
    throw new Error(`${id} labels an option as practice without a guided tool, lab, course, assessment, or analysis environment.`);
  }
  if (block.includes('access: "paid"')) {
    throw new Error(`${id} includes a paid learning option.`);
  }
}

if (!resolver.includes("GEO_LEARNING_DATABASE")) {
  throw new Error("Reference resolver is not connected to the central GEO learning database.");
}
if (resolver.includes("geoLearningSupplements") || resolver.includes("coursera.org") || resolver.includes("youtube.com") || resolver.includes("/practice/geo/")) {
  throw new Error("Reference resolver still contains hard-coded GEO learning content.");
}

const practiceCount = [...source.matchAll(/mode:\s*"practice"/g)].length;
const videoCount = [...source.matchAll(/mode:\s*"video"/g)].length;
console.log(`GEO learning resources validated: 12 centralized free resources, ${videoCount} verified watch options, ${practiceCount} guided practice options, and no forced three-mode requirement.`);