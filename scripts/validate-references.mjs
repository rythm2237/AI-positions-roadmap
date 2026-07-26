import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "content/references/reference-catalog.json");
const careerDirectory = path.join(root, "src/data/careers");
const sourceDirectory = path.join(root, "src");

const errors = [];
const warnings = [];
const usageKeys = new Set();

function relative(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${relative(filePath)}: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
    return [];
  }
}

function walkFiles(directory, extensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"])) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(fullPath, extensions));
    else if (extensions.has(path.extname(entry.name))) files.push(fullPath);
  }
  return files;
}

function findClosingBracket(source, openingIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = openingIndex; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (character === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (character === "\\") {
        escaped = true;
        continue;
      }
      if (character === quote) quote = null;
      continue;
    }
    if (character === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "[") depth += 1;
    if (character === "]") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  return -1;
}

function extractArrayBodies(source, propertyName) {
  const bodies = [];
  const pattern = new RegExp(`\\b${propertyName}\\s*:\\s*\\[`, "g");
  for (const match of source.matchAll(pattern)) {
    const openingIndex = match.index + match[0].lastIndexOf("[");
    const closingIndex = findClosingBracket(source, openingIndex);
    if (closingIndex === -1) {
      errors.push(`unable to parse ${propertyName} array`);
      continue;
    }
    bodies.push(source.slice(openingIndex + 1, closingIndex));
  }
  return bodies;
}

function collectResourceObjectIds(source) {
  const objectIds = new Map();
  const pattern = /([A-Za-z_$][\w$]*)\s*:\s*\{\s*id\s*:\s*["'`]([^"'`]+)["'`]/g;
  for (const match of source.matchAll(pattern)) objectIds.set(match[1], match[2]);
  return objectIds;
}

function recordUsage(referenceId, filePath, context, catalogIds) {
  const key = `${referenceId}|${relative(filePath)}|${context}`;
  if (usageKeys.has(key)) return;
  usageKeys.add(key);
  if (!catalogIds.has(referenceId)) {
    errors.push(`${relative(filePath)}: unknown Registry id "${referenceId}" in ${context}`);
  }
}

if (!fs.existsSync(catalogPath)) {
  console.error(`error: missing ${relative(catalogPath)}`);
  process.exit(1);
}

const catalog = readJson(catalogPath);
if (!Array.isArray(catalog)) errors.push(`${relative(catalogPath)}: root value must be an array`);

const requiredFields = [
  "id",
  "title",
  "provider",
  "description",
  "type",
  "canonicalUrl",
  "isOfficial",
  "topics",
  "skillLevels",
  "languages",
  "priority",
  "access",
  "segments",
  "status",
  "lastVerifiedAt",
  "reviewIntervalDays",
  "nextReviewAt",
];
const validStatuses = new Set(["active", "needs-review", "deprecated", "broken", "replaced"]);
const validLearningModes = new Set(["reading", "video", "practice"]);
const contentTypesByMode = {
  reading: new Set([
    "documentation",
    "tutorial",
    "quickstart",
    "learning-path",
    "written-course",
    "security-guide",
  ]),
  video: new Set([
    "video",
    "video-course",
    "video-series",
    "youtube-playlist",
    "webinar",
  ]),
  practice: new Set([
    "interactive-course",
    "guided-module",
    "hands-on-lab",
    "exercise-track",
    "ctf",
  ]),
};

function isLikelyVideoDestination(url) {
  const host = url.hostname.replace(/^www\./, "");
  const pathname = url.pathname.toLowerCase();

  if (host === "youtube.com") {
    return pathname === "/watch" || pathname === "/playlist";
  }

  if (host === "youtu.be") return pathname.length > 1;
  if (host === "learn.deeplearning.ai") return pathname.startsWith("/courses/");
  if (host === "learn.microsoft.com") return pathname.includes("/shows/");
  if (host === "uipath.com") return pathname.includes("/learning/video-tutorials/");
  if (host === "postman.com") return pathname.includes("/events/intergalactic/");
  if (host === "owasp.org") return pathname.includes("/www-project-spotlight-series/");
  if (host === "enablement.microsoft.com") return pathname.includes("/user-training/");
  if (host === "adoption.microsoft.com") return pathname.includes("/user-training/");

  return false;
}

function isKnownNonVideoCourseDestination(url) {
  const host = url.hostname.replace(/^www\./, "");
  const pathname = url.pathname.toLowerCase();

  if (host === "learn.n8n.io" && pathname.includes("/courses/")) return true;
  if (host === "academy.uipath.com" && pathname.includes("/learning-plans/")) return true;
  if (
    host === "learn.microsoft.com" &&
    (pathname.includes("/training/paths/") ||
      pathname.includes("/training/modules/"))
  ) {
    return true;
  }

  return false;
}
const catalogIds = new Set();

for (const item of Array.isArray(catalog) ? catalog : []) {
  const itemId = item?.id ?? "unknown";
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    errors.push("reference entry must be an object");
    continue;
  }

  for (const field of requiredFields) {
    if (item[field] === undefined || item[field] === "") errors.push(`${itemId}: missing ${field}`);
  }

  if (catalogIds.has(item.id)) errors.push(`duplicate reference id: ${item.id}`);
  else catalogIds.add(item.id);

  try {
    const url = new URL(item.canonicalUrl);
    if (!new Set(["http:", "https:"]).has(url.protocol)) errors.push(`${itemId}: canonicalUrl must use http or https`);
  } catch {
    errors.push(`${itemId}: invalid canonicalUrl`);
  }

  if (typeof item.isOfficial !== "boolean") errors.push(`${itemId}: isOfficial must be boolean`);
  for (const field of ["topics", "skillLevels", "languages", "segments"]) {
    if (!Array.isArray(item[field])) errors.push(`${itemId}: ${field} must be an array`);
  }
  for (const field of ["topics", "skillLevels", "languages"]) {
    if (Array.isArray(item[field]) && item[field].length === 0) errors.push(`${itemId}: ${field} must not be empty`);
  }
  if (!validStatuses.has(item.status)) errors.push(`${itemId}: invalid status ${item.status}`);

  for (const dateField of ["lastVerifiedAt", "nextReviewAt"]) {
    const value = item[dateField];
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
      errors.push(`${itemId}: invalid ${dateField}`);
    }
  }

  if (!Number.isInteger(item.reviewIntervalDays) || item.reviewIntervalDays <= 0) {
    errors.push(`${itemId}: reviewIntervalDays must be a positive integer`);
  }

  if (
    typeof item.lastVerifiedAt === "string" &&
    typeof item.nextReviewAt === "string" &&
    Date.parse(`${item.nextReviewAt}T00:00:00Z`) < Date.parse(`${item.lastVerifiedAt}T00:00:00Z`)
  ) {
    errors.push(`${itemId}: nextReviewAt cannot be earlier than lastVerifiedAt`);
  }

  if (typeof item.nextReviewAt === "string" && Date.parse(`${item.nextReviewAt}T23:59:59Z`) < Date.now()) {
    warnings.push(`${itemId}: review overdue (${item.nextReviewAt})`);
  }

  const segmentIds = new Set();
  for (const segment of Array.isArray(item.segments) ? item.segments : []) {
    if (!segment?.id) errors.push(`${itemId}: segment missing id`);
    else if (segmentIds.has(segment.id)) errors.push(`${itemId}: duplicate segment ${segment.id}`);
    else segmentIds.add(segment.id);
  }

  if (item.learningOptions !== undefined) {
    if (!Array.isArray(item.learningOptions)) {
      errors.push(`${itemId}: learningOptions must be an array`);
    } else {
      const modes = new Set();

      for (const option of item.learningOptions) {
        if (!option || typeof option !== "object" || Array.isArray(option)) {
          errors.push(`${itemId}: learning option must be an object`);
          continue;
        }

        for (const field of [
          "mode",
          "contentType",
          "title",
          "url",
          "provider",
          "access",
          "verifiedContentType",
          "verifiedAt",
          "verificationSource",
        ]) {
          if (option[field] === undefined || option[field] === "") {
            errors.push(`${itemId}: learning option missing ${field}`);
          }
        }

        if (!validLearningModes.has(option.mode)) {
          errors.push(`${itemId}: invalid learning mode ${option.mode}`);
        } else if (modes.has(option.mode)) {
          errors.push(`${itemId}: duplicate learning mode ${option.mode}`);
        } else {
          modes.add(option.mode);
        }

        const validContentTypes = contentTypesByMode[option.mode];
        if (
          validContentTypes &&
          !validContentTypes.has(option.contentType)
        ) {
          errors.push(
            `${itemId}: contentType "${option.contentType}" is not valid for ${option.mode}`
          );
        }

        let optionUrl = null;
        try {
          optionUrl = new URL(option.url);
          if (!new Set(["http:", "https:"]).has(optionUrl.protocol)) {
            errors.push(`${itemId}: ${option.mode} URL must use http or https`);
          }
        } catch {
          errors.push(`${itemId}: invalid ${option.mode ?? "learning"} URL`);
        }

        if (typeof option.isOfficial !== "boolean") {
          errors.push(
            `${itemId}: ${option.mode ?? "learning"} isOfficial must be boolean`
          );
        }

        if (option.verifiedContentType !== true) {
          errors.push(
            `${itemId}: ${option.mode ?? "learning"} content type must be explicitly verified`
          );
        }

        if (
          typeof option.verifiedAt !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(option.verifiedAt) ||
          Number.isNaN(Date.parse(`${option.verifiedAt}T00:00:00Z`))
        ) {
          errors.push(
            `${itemId}: ${option.mode ?? "learning"} has invalid verifiedAt`
          );
        }

        if (
          option.mode === "video" &&
          optionUrl &&
          isKnownNonVideoCourseDestination(optionUrl)
        ) {
          errors.push(
            `${itemId}: ${option.url} is a course or training page, not a verified video destination`
          );
        }

        if (
          option.mode === "video" &&
          optionUrl &&
          !isLikelyVideoDestination(optionUrl)
        ) {
          errors.push(
            `${itemId}: video URL is not on an approved direct video destination (${option.url})`
          );
        }

        if (
          option.mode === "video" &&
          option.isOfficial === false &&
          !option.curationReason
        ) {
          errors.push(
            `${itemId}: external video requires curationReason`
          );
        }
      }

      if (item.learningOptions.length > 0) {
        for (const requiredMode of ["reading", "video", "practice"]) {
          if (!modes.has(requiredMode)) {
            errors.push(
              `${itemId}: learningOptions must include ${requiredMode}`
            );
          }
        }
      }
    }
  }

  if (
    item.id.startsWith("automation-") &&
    item.status === "active" &&
    (!Array.isArray(item.learningOptions) ||
      item.learningOptions.length === 0)
  ) {
    errors.push(
      `${itemId}: active automation resources require reading, video, and practice options`
    );
  }
}

for (const item of Array.isArray(catalog) ? catalog : []) {
  if (item.replacedBy && !catalogIds.has(item.replacedBy)) errors.push(`${item.id}: unknown replacedBy ${item.replacedBy}`);
  const seen = new Set([item.id]);
  let next = item.replacedBy;
  while (next) {
    if (seen.has(next)) {
      errors.push(`${item.id}: circular replacement chain`);
      break;
    }
    seen.add(next);
    next = catalog.find((candidate) => candidate.id === next)?.replacedBy;
  }
}

const careerFiles = walkFiles(careerDirectory, new Set([".ts", ".tsx"]));
if (careerFiles.length === 0) warnings.push(`${relative(careerDirectory)}: no career source files found`);

for (const filePath of careerFiles) {
  const source = fs.readFileSync(filePath, "utf8");
  const objectIds = collectResourceObjectIds(source);

  for (const propertyName of ["resources", "globalResources", "resourceIds"]) {
    for (const body of extractArrayBodies(source, propertyName)) {
      for (const match of body.matchAll(/\bid\s*:\s*["'`]([^"'`]+)["'`]/g)) {
        recordUsage(match[1], filePath, propertyName, catalogIds);
      }
      for (const match of body.matchAll(/\b[A-Za-z_$][\w$]*\.([A-Za-z_$][\w$]*)\b/g)) {
        const referenceId = objectIds.get(match[1]);
        if (referenceId) recordUsage(referenceId, filePath, propertyName, catalogIds);
      }
      if (propertyName === "resourceIds") {
        for (const match of body.matchAll(/["'`]([^"'`]+)["'`]/g)) {
          recordUsage(match[1], filePath, propertyName, catalogIds);
        }
      }
    }
  }
}

for (const filePath of walkFiles(sourceDirectory)) {
  const source = fs.readFileSync(filePath, "utf8");
  for (const match of source.matchAll(/\breferenceId\s*:\s*["'`]([^"'`]+)["'`]/g)) {
    recordUsage(match[1], filePath, "referenceId", catalogIds);
  }
  for (const body of extractArrayBodies(source, "referenceIds")) {
    for (const match of body.matchAll(/["'`]([^"'`]+)["'`]/g)) {
      recordUsage(match[1], filePath, "referenceIds", catalogIds);
    }
  }
}

warnings.forEach((warning) => console.warn(`warning: ${warning}`));
if (errors.length > 0) {
  errors.forEach((error) => console.error(`error: ${error}`));
  process.exit(1);
}

console.log(
  `Reference Registry valid: ${catalog.length} resources, ${careerFiles.length} career file(s), ${usageKeys.size} usage(s), ${warnings.length} warning(s).`
);
