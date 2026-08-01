import fs from "node:fs";

const workspacePath = "src/components/career/CareerWorkspace.tsx";
const validationPath = "src/lib/careerContentValidation.ts";

let workspace = fs.readFileSync(workspacePath, "utf8");
let validation = fs.readFileSync(validationPath, "utf8");

const aliasPanelImport =
  'import CareerTitleAliasPanel from "@/components/career/CareerTitleAliasPanel";\n';

if (!workspace.includes(aliasPanelImport)) {
  const importAnchor =
    'import LearningWorkspace from "@/components/career/learning/LearningWorkspace";\n';
  if (!workspace.includes(importAnchor)) {
    throw new Error("CareerWorkspace alias-panel import anchor was not found.");
  }
  workspace = workspace.replace(importAnchor, importAnchor + aliasPanelImport);
}

const heroAnchor =
  '<p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">{career.shortDescription}</p>';
const heroAliasPanel = `${heroAnchor}\n          <CareerTitleAliasPanel career={career} />`;

if (!workspace.includes("<CareerTitleAliasPanel career={career} />")) {
  if (!workspace.includes(heroAnchor)) {
    throw new Error("CareerWorkspace Hero description anchor was not found.");
  }
  workspace = workspace.replace(heroAnchor, heroAliasPanel);
}

const validationImport =
  'import { getDefaultCareerTitleAliases } from "@/data/careerTitleAliases";\n';
if (!validation.includes(validationImport)) {
  const typeImport =
    'import type { CareerWorkspaceData } from "@/types/careerWorkspace";\n';
  if (!validation.includes(typeImport)) {
    throw new Error("Career validation import anchor was not found.");
  }
  validation = validation.replace(typeImport, typeImport + validationImport);
}

const aliasValidationAnchor =
  '  if (expectedSlug && data.slug !== expectedSlug) errors.push(`Content slug must remain ${expectedSlug}.`);';
const aliasValidationBlock = `${aliasValidationAnchor}
  const configuredAliases = list(data.titleAliases) ? data.titleAliases : [];
  const fallbackAliases = text(data.slug)
    ? getDefaultCareerTitleAliases(data.slug as string)
    : [];
  const titleAliases = configuredAliases.length ? configuredAliases : fallbackAliases;
  if (!titleAliases.length) {
    errors.push("titleAliases must include at least one alternative job title.");
  } else {
    const aliasTitles = titleAliases
      .map((alias) => alias?.title)
      .filter((title): title is string => text(title));
    if (aliasTitles.length !== titleAliases.length) {
      errors.push("Every titleAliases entry needs a non-empty title.");
    }
    const normalizedAliasTitles = aliasTitles.map((title) =>
      title.toLocaleLowerCase("en").replace(/[^a-z0-9]+/g, " ").trim()
    );
    if (new Set(normalizedAliasTitles).size !== normalizedAliasTitles.length) {
      errors.push("titleAliases must not contain duplicate titles.");
    }
    if (text(data.title)) {
      const canonical = (data.title as string)
        .toLocaleLowerCase("en")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
      if (normalizedAliasTitles.includes(canonical)) {
        errors.push("titleAliases must not repeat the canonical career title.");
      }
    }
    data.titleAliases = titleAliases;
  }`;

if (!validation.includes("titleAliases must include at least one alternative job title.")) {
  if (!validation.includes(aliasValidationAnchor)) {
    throw new Error("Career validation alias anchor was not found.");
  }
  validation = validation.replace(aliasValidationAnchor, aliasValidationBlock);
}

fs.writeFileSync(workspacePath, workspace, "utf8");
fs.writeFileSync(validationPath, validation, "utf8");

console.log(
  "Applied career title aliases to Hero and Admin content validation."
);
