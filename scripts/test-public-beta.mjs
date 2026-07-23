import assert from "node:assert/strict";
import fs from "node:fs";

const catalog = fs.readFileSync("src/data/careerCatalog.ts", "utf8");
const landing = fs.readFileSync("src/app/page.tsx", "utf8");
const header = fs.readFileSync("src/components/landing/Header.tsx", "utf8");
const workspace = fs.readFileSync("src/components/career/CareerWorkspace.tsx", "utf8");
const workspaceNav = fs.readFileSync("src/lib/careerNavigation.ts", "utf8");
const positions = fs.readFileSync("src/components/landing/CareerPositionsSection.tsx", "utf8");
const waitlist = fs.readFileSync("src/components/landing/WaitlistSection.tsx", "utf8");
const world = fs.readFileSync("src/components/opening-scene/World.tsx", "utf8");
const proxy = fs.readFileSync("src/proxy.ts", "utf8");

const approvedTitles = ["AI Engineer", "AI Product Manager", "AI Automation Engineer", "Intelligent Automation Engineer", "Microsoft Copilot Consultant", "AI Integration Specialist", "AI Workflow Architect", "AI Solutions Consultant", "AI Transformation Consultant", "Business AI Consultant", "Enterprise AI Consultant", "AI Adoption Consultant", "Data Analyst", "BI Developer", "Data Engineer", "Data Scientist", "AI Knowledge Engineer", "Cloud Engineer", "DevOps Engineer", "Cybersecurity Analyst", "Generative Engine Optimization (GEO) Specialist", "AI Marketing Specialist", "AI Content Strategist"];
for (const title of approvedTitles) assert.ok(catalog.includes(`"${title}"`), `Missing approved career: ${title}`);
for (const generic of ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer"]) assert.ok(!catalog.includes(`"${generic}"`), `Generic career leaked into catalog: ${generic}`);
assert.equal((catalog.match(/"available", "\/careers\//g) ?? []).length, 1, "Only AI Engineer should have an available public route");
assert.match(positions, /CAREER_DOMAINS/);
assert.match(waitlist, /CAREER_CATALOG/);
assert.match(world, /CAREER_CATALOG\.map/);
assert.doesNotMatch(landing, /CareerIntelligenceSection|PricingPreviewSection/);
assert.doesNotMatch(header, /Career Market Intelligence|Pricing|CV Analyzer/);
const publicMenu = header.match(/const PUBLIC_NAV_ITEMS = \[([\s\S]*?)\] as const;/)?.[1] ?? "";
assert.match(publicMenu, /Explore Careers/);
assert.match(publicMenu, /How It Works/);
assert.match(publicMenu, /Why Career OS/);
assert.doesNotMatch(publicMenu, /AI Engineer/);
assert.match(header, /label: "Explore AI Careers", href: "\/#career-universe"/);
assert.match(header, /Continue Journey/);
assert.match(header, /activeOverlay === "why"/);
assert.match(header, /inert=\{!activeOverlay\}/);
assert.match(workspace, /aria-label="Back to Career Universe"/);
assert.match(workspace, /href="\/"/);
const workspaceLabels = [...workspaceNav.matchAll(/label: "([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(workspaceLabels, ["Hero", "Roadmap", "Learning", "Project", "Portfolio", "Jobs", "Interview Brief"]);
assert.match(proxy, /api\/career-intelligence/);
assert.match(proxy, /status: 404/);

console.log("Public Beta catalog, availability, navigation, and route-gate checks passed.");
