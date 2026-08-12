import assert from "node:assert/strict";
import fs from "node:fs";
import { CAREER_CATALOG, CAREER_DOMAINS } from "../src/data/careerCatalog.ts";
import { OCCUPATION_FAMILY_CATALOG } from "../src/data/occupationFamilyCatalog.ts";

assert.equal(CAREER_CATALOG.length, 23, "the Admin inventory must cover all 23 site Careers");
assert.equal(CAREER_CATALOG.filter((career) => career.availability === "available").length, 22, "22 Careers must be active");
assert.deepEqual(CAREER_CATALOG.filter((career) => career.availability === "planned").map((career) => career.slug), ["enterprise-ai-consultant"]);
assert.equal(OCCUPATION_FAMILY_CATALOG.length, CAREER_DOMAINS.length, "every Career domain must own one canonical occupation family");
assert.deepEqual(
  new Set(OCCUPATION_FAMILY_CATALOG.map((family) => family.domain)),
  new Set(CAREER_DOMAINS),
  "occupation-family domains must match the site catalog",
);

const linkedCareerSlugs = OCCUPATION_FAMILY_CATALOG.flatMap((family) => family.careerSlugs);
assert.equal(new Set(linkedCareerSlugs).size, linkedCareerSlugs.length, "a Career must not be assigned to multiple canonical families");
assert.deepEqual(
  new Set(linkedCareerSlugs),
  new Set(CAREER_CATALOG.map((career) => career.slug)),
  "every site Career must belong to an occupation family",
);

const migration = fs.readFileSync("supabase/migrations/202608120001_sync_admin_career_and_occupation_catalogs.sql", "utf8");
for (const family of OCCUPATION_FAMILY_CATALOG) assert.match(migration, new RegExp(`'${family.slug}'`));
for (const career of CAREER_CATALOG) assert.match(migration, new RegExp(`'${career.slug}'`));
assert.match(migration, /on conflict \(slug\) do nothing/);
assert.match(migration, /on conflict \(occupation_family_id,career_slug,relationship_type\) do nothing/);
assert.doesNotMatch(migration, /insert into public\.occupation_mappings|update public\.occupation_mappings/);
assert.doesNotMatch(migration, /insert into public\.occupation_intelligence_publications/);

const careerPage = fs.readFileSync("src/app/admin/(studio)/careers/page.tsx", "utf8");
const occupationPage = fs.readFileSync("src/app/admin/(studio)/occupations/page.tsx", "utf8");
assert.match(careerPage, /buildCareerInventory/);
assert.match(careerPage, /databaseUnavailable/);
assert.match(careerPage, /Need Admin setup/);
assert.match(occupationPage, /buildOccupationInventory/);
assert.match(occupationPage, /databaseUnavailable/);
assert.match(occupationPage, /Needs setup/);

console.log("Admin Career and occupation-family catalog coverage checks passed.");
