import assert from "node:assert/strict";
import fs from "node:fs";

const catalog = fs.readFileSync("src/data/careerCatalog.ts", "utf8");
const landing = fs.readFileSync("src/app/page.tsx", "utf8");
const header = fs.readFileSync("src/components/landing/Header.tsx", "utf8");
const compactSearch = fs.readFileSync("src/components/search/CareerSearch.tsx", "utf8");
const workspace = fs.readFileSync("src/components/career/CareerWorkspace.tsx", "utf8");
const workspaceNav = fs.readFileSync("src/lib/careerNavigation.ts", "utf8");
const positions = fs.readFileSync("src/components/landing/CareerPositionsSection.tsx", "utf8");
const waitlist = fs.readFileSync("src/components/landing/WaitlistSection.tsx", "utf8");
const world = fs.readFileSync("src/components/opening-scene/World.tsx", "utf8");
const openingScene = fs.readFileSync("src/components/opening-scene/OpeningScene.tsx", "utf8");
const proxy = fs.readFileSync("src/proxy.ts", "utf8");

const approvedTitles = ["AI Engineer", "AI Product Manager", "AI Automation Specialist", "Intelligent Automation Engineer", "Microsoft Copilot Consultant", "AI Integration Specialist", "AI Workflow Architect", "AI Solutions Consultant", "AI Transformation Consultant", "Business AI Consultant", "Enterprise AI Consultant", "AI Adoption Consultant", "Data Analyst", "BI Developer", "Data Engineer", "Data Scientist", "AI Knowledge Engineer", "Cloud Engineer", "DevOps Engineer", "Cybersecurity Analyst", "Generative Engine Optimization (GEO) Specialist", "AI Marketing Specialist", "AI Content Strategist"];
for (const title of approvedTitles) assert.ok(catalog.includes(`"${title}"`), `Missing approved career: ${title}`);
for (const generic of ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer"]) assert.ok(!catalog.includes(`"${generic}"`), `Generic career leaked into catalog: ${generic}`);
assert.equal(
  (catalog.match(/"available",\s*"\/careers\//g) ?? []).length,
  approvedTitles.length,
  "Every active Career should have an available public route",
);
assert.match(positions, /CAREER_DOMAINS/);
assert.match(waitlist, /CAREER_CATALOG/);
assert.match(world, /CAREER_CATALOG\.map/);
assert.doesNotMatch(openingScene, /CareerAliasSearch/);
assert.match(header, /import RoleSearchDialog/);
assert.match(header, /<RoleSearchDialog open=\{careerSearchOpen\}/);
assert.match(compactSearch, /event\.ctrlKey \|\| event\.metaKey/);
assert.match(compactSearch, /event\.key\.toLowerCase\(\) === "k"/);
assert.match(world, /getBoundingClientRect\(\)/);
assert.match(world, /new ResizeObserver\(onResize\)/);
assert.match(world, /instancedNodes\.updateMatrixWorld\(true\)/);
assert.match(world, /hits\[0\]\.instanceId/);
assert.doesNotMatch(landing, /CareerIntelligenceSection|PricingPreviewSection/);
assert.doesNotMatch(header, /Career Market Intelligence|Pricing/);
const publicMenu = header.match(/const NAV_ITEMS: NavItem\[\] = \[([\s\S]*?)\];/)?.[1] ?? "";
assert.match(publicMenu, /Explore Careers/);
assert.match(publicMenu, /How It Works/);
assert.match(publicMenu, /Why AI Role Path/);
assert.doesNotMatch(publicMenu, /AI Engineer/);
assert.match(header, /setCareerSearchOpen\(true\)/);
assert.match(header, /overlay === "why"/);
assert.match(header, /role="dialog" aria-modal="true" aria-hidden=\{!overlay\}/);
assert.match(workspace, /aria-label="Back to Career Universe"/);
assert.match(workspace, /href="\/"/);
const workspaceLabels = [...workspaceNav.matchAll(/label: "([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(workspaceLabels, ["Hero", "Roadmap", "Learning", "Project", "Portfolio", "Jobs", "Interview Brief"]);
assert.match(proxy, /api\/career-intelligence/);
assert.match(proxy, /status: 404/);

console.log("Public Beta catalog, availability, navigation, and route-gate checks passed.");
