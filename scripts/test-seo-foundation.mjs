import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { AVAILABLE_CAREERS } from "../src/data/careerCatalog.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const [
  sitemap,
  careersHub,
  loginPage,
  accountLayout,
  nextConfig,
  homepage,
  safeUniverse,
  careerPage,
] = await Promise.all([
  read("src/app/sitemap.ts"),
  read("src/app/careers/page.tsx"),
  read("src/app/login/page.tsx"),
  read("src/app/(account)/layout.tsx"),
  read("next.config.ts"),
  read("src/app/page.tsx"),
  read("src/components/landing/SafeCareerUniverse.tsx"),
  read("src/app/careers/[slug]/page.tsx"),
]);

assert.ok(AVAILABLE_CAREERS.length > 0, "At least one public career must be available.");
assert.equal(
  new Set(AVAILABLE_CAREERS.map((career) => career.slug)).size,
  AVAILABLE_CAREERS.length,
  "Available career slugs must be unique.",
);

assert.match(sitemap, /AVAILABLE_CAREERS\.map/, "Sitemap must derive Career URLs from AVAILABLE_CAREERS.");
assert.match(sitemap, /absoluteUrl\("\/careers"\)/, "Careers hub must be present in the sitemap.");
assert.doesNotMatch(
  sitemap,
  /const\s+careerSlugs\s*=\s*\[/,
  "Sitemap must not maintain a second hardcoded Career slug inventory.",
);

assert.match(careersHub, /AVAILABLE_CAREERS/, "Careers hub must use the public Career catalog.");
assert.match(careersHub, /href=\{`\/careers\/\$\{career\.slug\}`\}/, "Careers hub must render direct Career links.");

assert.match(loginPage, /privateRouteMetadata\("Sign in"\)/, "Login must explicitly be noindex.");
assert.match(accountLayout, /privateRouteMetadata\("Private workspace"\)/, "Account route group must explicitly be noindex.");
assert.match(nextConfig, /"\/login\/:path\*"/, "Login must have an X-Robots-Tag private-route rule.");
assert.match(nextConfig, /"\/profile\/:path\*"/, "Profile must have an X-Robots-Tag private-route rule.");

assert.match(homepage, /<h1[\s\S]*?homepage-title/, "Homepage must expose a server-rendered H1.");
assert.match(homepage, /href="\/careers"/, "Homepage must link directly to the Career hub.");
assert.match(safeUniverse, /href="\/careers"/, "WebGL fallback must retain public Career discovery.");

assert.match(careerPage, /name: "Careers", item: absoluteUrl\("\/careers"\)/, "Career breadcrumbs must include the Careers hub.");
assert.match(careerPage, /career\.projects\.flatMap\(\(project\) => project\.skills\)/, "Occupation skills must come from actual project skill data.");
assert.doesNotMatch(careerPage, /skills:\s*career\.overview\.responsibilities/, "Responsibilities must not be mislabeled as Occupation skills.");
assert.match(careerPage, /occupationFamilyForRoadmap/, "Career pages must be able to link to verified market evidence.");

console.log(`SEO foundation checks passed for ${AVAILABLE_CAREERS.length} available Careers.`);
