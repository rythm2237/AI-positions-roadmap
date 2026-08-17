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
  heroContent,
  careerPage,
  seoSource,
  envExample,
] = await Promise.all([
  read("src/app/sitemap.ts"),
  read("src/app/careers/page.tsx"),
  read("src/app/login/page.tsx"),
  read("src/app/(account)/layout.tsx"),
  read("next.config.ts"),
  read("src/app/page.tsx"),
  read("src/components/landing/SafeCareerUniverse.tsx"),
  read("src/components/opening-scene/HeroContent.tsx"),
  read("src/app/careers/[slug]/page.tsx"),
  read("src/lib/seo.ts"),
  read(".env.example"),
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
assert.match(careersHub, /min-h-dvh/, "Careers hub must remain a normal scrollable document rather than a locked viewport.");

assert.match(loginPage, /privateRouteMetadata\("Sign in"\)/, "Login must explicitly be noindex.");
assert.match(accountLayout, /privateRouteMetadata\("Private workspace"\)/, "Account route group must explicitly be noindex.");
assert.match(nextConfig, /"\/login\/:path\*"/, "Login must have an X-Robots-Tag private-route rule.");
assert.match(nextConfig, /"\/profile\/:path\*"/, "Profile must have an X-Robots-Tag private-route rule.");

assert.match(homepage, /h-dvh[\s\S]*overflow-hidden/, "Homepage must stay locked to one viewport with no landing-page scroll.");
assert.match(homepage, /<SafeCareerUniverse\s*\/>/, "Homepage must use Career Universe as the primary landing experience.");
assert.doesNotMatch(homepage, /id="career-directory"/, "Homepage must not duplicate the scrollable career directory.");
assert.match(safeUniverse, /<h1[\s\S]*?homepage-title/, "Career Universe fallback must expose the server-rendered homepage H1.");
assert.match(safeUniverse, /href="\/careers"/, "WebGL fallback must retain direct public Career discovery.");
assert.match(heroContent, /href="\/careers"/, "Primary Explore AI Careers CTA must open the scrollable Career hub.");

assert.match(careerPage, /name: "Careers", item: absoluteUrl\("\/careers"\)/, "Career breadcrumbs must include the Careers hub.");
assert.match(careerPage, /career\.projects\.flatMap\(\(project\) => project\.skills\)/, "Occupation skills must come from actual project skill data.");
assert.doesNotMatch(careerPage, /skills:\s*career\.overview\.responsibilities/, "Responsibilities must not be mislabeled as Occupation skills.");
assert.match(careerPage, /occupationFamilyForRoadmap/, "Career pages must be able to link to verified market evidence.");

assert.match(
  seoSource,
  /const CANONICAL_SITE_URL = "https:\/\/www\.airolepath\.com"/,
  "Canonical SEO origin must be the AI Role Path production domain.",
);
assert.doesNotMatch(
  seoSource,
  /siteUrl:\s*normalizeSiteUrl\(process\.env\.NEXT_PUBLIC_SITE_URL/,
  "Production canonicals must not be vulnerable to a stale NEXT_PUBLIC_SITE_URL during migration.",
);
assert.match(
  envExample,
  /NEXT_PUBLIC_SITE_URL=https:\/\/www\.airolepath\.com/,
  "Environment documentation must point at the new production origin.",
);
assert.match(nextConfig, /LEGACY_PUBLIC_HOST = "career\.rythm-os\.com"/, "Legacy public host must be retained as a redirect source.");
assert.match(nextConfig, /PRIMARY_PUBLIC_ORIGIN = "https:\/\/www\.airolepath\.com"/, "Legacy traffic must redirect directly to the canonical production origin.");
assert.match(nextConfig, /has: \[\{ type: "host", value: LEGACY_PUBLIC_HOST \}\]/, "Legacy redirect must be hostname-specific.");
assert.match(nextConfig, /permanent: true/, "Legacy host redirect must be permanent.");

console.log(`SEO foundation checks passed for ${AVAILABLE_CAREERS.length} available Careers.`);
