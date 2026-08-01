import assert from "node:assert/strict";
import fs from "node:fs";
import {
  addCountrySelection,
  DEFAULT_SALARY_COUNTRIES,
  MAX_SALARY_COUNTRIES,
  normalizeRequestedCountries,
  removeCountrySelection,
  salaryCountryAvailability,
  sanitizeCountrySelection,
} from "../src/lib/intelligence/countrySelection.ts";
import { COUNTRY_CATALOG, providerSupportsCountry, searchCountries } from "../src/lib/intelligence/countryCatalog.ts";

const recognized = new Set(COUNTRY_CATALOG.map((country) => country.code));
assert.ok(COUNTRY_CATALOG.length >= 240, "complete ISO catalog expected");
assert.equal(searchCountries("Germany")[0]?.code, "de");
assert.equal(searchCountries("DE")[0]?.code, "de");
assert.equal(searchCountries("Japan")[0]?.code, "jp");

assert.deepEqual(addCountrySelection(["gb"], "de"), { countries: ["gb", "de"], result: "added" });
assert.deepEqual(addCountrySelection(["gb"], "GB"), { countries: ["gb"], result: "duplicate" });
assert.equal(addCountrySelection(Array.from({ length: MAX_SALARY_COUNTRIES }, (_, index) => COUNTRY_CATALOG[index].code), "jp").result, "limit");
assert.deepEqual(removeCountrySelection(["gb", "us"], "gb"), { countries: ["us"], result: "removed" });
assert.equal(removeCountrySelection(["gb"], "gb").result, "minimum");
assert.deepEqual(sanitizeCountrySelection(["gb", "XX", "us", "gb"], recognized), ["gb", "us"]);
assert.deepEqual(sanitizeCountrySelection(["invalid"], recognized), [...DEFAULT_SALARY_COUNTRIES]);

assert.deepEqual(normalizeRequestedCountries("gb,us,ca"), { countries: ["gb", "us", "ca"], error: null });
assert.equal(normalizeRequestedCountries("gb,gb").error, "duplicate");
assert.equal(normalizeRequestedCountries("gbr").error, "invalid");
assert.equal(normalizeRequestedCountries(Array(MAX_SALARY_COUNTRIES + 1).fill("gb").join(",")).error, "limit");
assert.equal(salaryCountryAvailability(true, false, true), "published");
assert.equal(salaryCountryAvailability(true, true, true), "stale");
assert.equal(salaryCountryAvailability(false, false, true), "awaiting-verified-data");
assert.equal(salaryCountryAvailability(false, false, false), "provider-unsupported");
assert.equal(salaryCountryAvailability(false, false, true, true), "failed");
assert.equal(providerSupportsCountry("gb"), true);
assert.equal(providerSupportsCountry("es"), false);

const route = fs.readFileSync("src/app/api/career-intelligence/snapshots/route.ts", "utf8");
const repository = fs.readFileSync("src/lib/intelligence/snapshotRepository.ts", "utf8");
const component = fs.readFileSync("src/components/career/intelligence/GlobalSalaryComparison.tsx", "utf8");
assert.match(route, /countriesParam/);
assert.match(route, /latestPublishedMany/);
assert.match(route, /status: 503/);
assert.match(route, /snapshotView/); // single-country compatibility
assert.doesNotMatch(route, /ADZUNA_APP|SUPABASE_SECRET_KEY|api\.adzuna/);
assert.match(repository, /country_code=in\.\(\$\{countryFilter\}\)/);
assert.match(repository, /SUPABASE_SECRET_KEY\?\?process\.env\.SUPABASE_SERVICE_KEY/);
assert.match(component, /localStorage\.getItem\(SALARY_COUNTRY_STORAGE_KEY\)/);
assert.match(component, /role="combobox"/);
assert.match(component, /No recognized country matches/);
assert.match(component, /no verified exchange-rate source/i);
assert.doesNotMatch(component, /api\.adzuna|ADZUNA_APP|SUPABASE_SECRET_KEY/);

console.log("Global Salary Comparison selection, persistence, API, batching, provider, and security checks passed.");
