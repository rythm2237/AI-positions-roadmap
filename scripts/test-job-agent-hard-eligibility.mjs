import assert from "node:assert/strict";
import { evaluateJobEligibility } from "../src/lib/job-agent/eligibility.ts";

const profile = { languages: ["English"] };
const agent = {
  excluded_companies: [], excluded_roles: [], excluded_countries: [], search_countries: ["France"], cities_regions: [],
  workplace_preferences: ["remote", "hybrid", "on_site"], employment_types: [], min_seniority: null, max_seniority: null,
  english_only_priority: false, exclude_unknown_languages: true, minimum_salary: null, salary_negotiable: null,
  sponsorship_requirement: null,
};

const frenchC1 = evaluateJobEligibility({
  title: "Player Experience Specialist (AI & Automation)",
  company: "Sorare",
  country: "France",
  location: "Paris, Ile-de-France",
  description: "What We're Looking For. A genuine appetite for AI and automation. Excellent written communication in English and French (C1 minimum).",
  descriptionComplete: true,
  workplaceModel: "hybrid",
  employmentType: null,
}, profile, agent);
assert.equal(frenchC1.status, "blocked");
assert.deepEqual(frenchC1.requiredLanguages.sort(), ["English", "French"]);
assert.ok(frenchC1.reasons.some((reason) => reason.includes("French")));

const truncatedEnglishSnippet = evaluateJobEligibility({
  title: "Player Experience Specialist (AI & Automation)",
  company: "Sorare",
  country: "France",
  location: "Paris, Ile-de-France",
  description: "At Sorare, we want to hire passionate and innovative people. Join us in this tremendous adventure and work with our team.",
  descriptionComplete: false,
  workplaceModel: "unknown",
  employmentType: null,
}, profile, agent);
assert.equal(truncatedEnglishSnippet.status, "unverified");
assert.ok(truncatedEnglishSnippet.reasons.some((reason) => reason.includes("Full language requirements")));

const wrongCountry = evaluateJobEligibility({
  title: "AI Automation Specialist",
  company: "Example",
  country: "Germany",
  location: "Berlin",
  description: "Fluent English required.",
  descriptionComplete: true,
  workplaceModel: "remote",
  employmentType: null,
}, profile, agent);
assert.equal(wrongCountry.status, "blocked");
assert.ok(wrongCountry.reasons.some((reason) => reason.includes("outside the configured search scope")));

const remoteOnlyAgent = { ...agent, workplace_preferences: ["remote"], exclude_unknown_languages: false };
const officeOnly = evaluateJobEligibility({
  title: "AI Automation Specialist",
  company: "Example",
  country: "France",
  location: "Paris",
  description: "Fluent English required. This is an on-site role.",
  descriptionComplete: true,
  workplaceModel: "on_site",
  employmentType: null,
}, profile, remoteOnlyAgent);
assert.equal(officeOnly.status, "blocked");
assert.ok(officeOnly.reasons.some((reason) => reason.includes("Workplace model")));

const eligible = evaluateJobEligibility({
  title: "AI Automation Specialist",
  company: "Example",
  country: "France",
  location: "Paris",
  description: "Fluent English required. Remote work is available.",
  descriptionComplete: true,
  workplaceModel: "remote",
  employmentType: null,
}, profile, { ...agent, workplace_preferences: ["remote"], exclude_unknown_languages: false });
assert.equal(eligible.status, "eligible");

console.log("Job Agent hard eligibility tests passed: language, source-confidence, geography and workplace filters are enforced before fit scoring.");
