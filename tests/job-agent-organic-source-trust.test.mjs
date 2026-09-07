import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../src/lib/job-agent/providers/adzuna.ts", import.meta.url), "utf8");

test("organic SerpApi fallback rejects known job aggregators", () => {
  for (const marker of ["jobleads.", "linkedin.", "indeed.", "glassdoor.", "jobrapido.", "jooble.", "careerjet.", "profession.hu"]) {
    assert.match(source, new RegExp(marker.replace(".", "\\."), "i"));
  }
  assert.match(source, /isAggregatorOrganicResult\(result\)/);
  assert.match(source, /if \(isAggregatorOrganicResult\(result\) \|\| isListingStyleOrganicTitle\(result\.title\)\) return false;/);
});

test("organic fallback remains available for direct vacancy and ATS-like pages", () => {
  assert.match(source, /workable\|greenhouse\|lever\|smartrecruiters\|ashbyhq\|workdayjobs/);
  assert.match(source, /company: result\.source\?\.trim\(\) \|\| "Employer not verified"/);
});
