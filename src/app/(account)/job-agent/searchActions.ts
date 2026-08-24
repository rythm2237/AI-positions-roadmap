"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { calculateJobFit } from "@/lib/job-agent/fit";
import { evaluateJobEligibility } from "@/lib/job-agent/eligibility";
import { adzunaConfigured, resolveAdzunaCountry, searchAdzunaJobs } from "@/lib/job-agent/providers/adzuna";
import { expandRoleQueries } from "@/lib/job-agent/roleSearchExpansion";
import type { JobAgent } from "@/types/jobAgent";
import type { Profile } from "@/types/identity";

export async function runJobSearch() {
  const user = await requireUser("/job-agent");
  const supabase = await createClient();
  if (!adzunaConfigured()) redirect("/job-agent?error=provider");

  const [agentResult, profileResult] = await Promise.all([
    supabase.from("job_agents").select("*").eq("user_id", user.id).single<JobAgent>(),
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
  ]);
  if (agentResult.error || profileResult.error) redirect("/job-agent?error=profile");

  const agent = agentResult.data;
  const profile = profileResult.data;
  if (agent.status !== "active") redirect("/job-agent?error=paused");

  const countries = agent.search_countries.slice(0, 3);
  const supportedCountries = countries.filter((country) => resolveAdzunaCountry(country));
  const roleQueries = expandRoleQueries(agent, 6);
  if (!countries.length || !roleQueries.length) redirect("/job-agent?error=criteria");
  if (!supportedCountries.length) redirect("/job-agent?error=country");

  const batches = await Promise.all(
    supportedCountries.flatMap((country) =>
      roleQueries.map((query) => searchAdzunaJobs({
        country,
        query,
        location: agent.cities_regions[0],
        limit: 20,
      }))
    )
  );

  const unique = new Map<string, Awaited<ReturnType<typeof searchAdzunaJobs>>[number]>();
  for (const job of batches.flat()) unique.set(`${job.source}:${job.externalId}`, job);

  const now = new Date().toISOString();
  const rows = [...unique.values()].map((job) => {
    const eligibility = evaluateJobEligibility({
      title: job.title,
      company: job.company,
      country: job.country,
      location: job.location,
      description: job.description,
      descriptionComplete: job.descriptionComplete,
      workplaceModel: job.workplaceModel,
      employmentType: job.employmentType,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      currency: job.currency,
    }, profile, agent);

    const fit = calculateJobFit({
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      requiredLanguages: eligibility.requiredLanguages,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      currency: job.currency,
      workplaceModel: job.workplaceModel,
    }, profile, agent);

    const hardBlocked = eligibility.status !== "eligible";
    const recommendation = hardBlocked ? "skip" : fit.recommendation;
    const eligibilityReasons = eligibility.reasons;
    const gaps = hardBlocked
      ? [...eligibilityReasons, ...fit.gaps.filter((gap) => !gap.toLowerCase().includes("language"))]
      : fit.gaps;

    return {
      user_id: user.id,
      agent_id: agent.id,
      external_job_id: job.externalId,
      source: job.source,
      company: job.company,
      role: job.title,
      location: job.location,
      country: job.country,
      job_url: job.url,
      job_description: job.description,
      required_languages: eligibility.requiredLanguages,
      salary_min: job.salaryMin,
      salary_max: job.salaryMax,
      salary_currency: job.currency,
      fit_score: hardBlocked ? Math.min(fit.fitScore, Math.max(0, agent.auto_skip_threshold - 1)) : fit.fitScore,
      recommendation,
      strengths: hardBlocked ? fit.strengths.filter((item) => !item.toLowerCase().includes("language")) : fit.strengths,
      gaps,
      founder_positioning: null,
      status: recommendation === "skip" ? "skipped" : recommendation === "review" ? "discovered" : "recommended",
      skip_reason: recommendation === "skip" ? gaps.join("; ") : null,
      eligibility_status: eligibility.status,
      eligibility_reasons: eligibilityReasons,
      eligibility_checked_at: now,
      eligibility_version: "hard-gate-v1",
      updated_at: now,
    };
  });

  if (rows.length) {
    const save = await supabase.from("job_opportunities").upsert(rows, {
      onConflict: "user_id,job_url",
      ignoreDuplicates: false,
    });
    if (save.error) {
      console.error("Job Agent opportunity upsert failed", {
        code: save.error.code,
        message: save.error.message,
        userId: user.id,
      });
      redirect("/job-agent?error=search-save");
    }
  }

  const eligible = rows.filter((row) => row.eligibility_status === "eligible").length;
  const blocked = rows.filter((row) => row.eligibility_status === "blocked").length;
  const unverified = rows.filter((row) => row.eligibility_status === "unverified").length;
  await supabase.from("user_activity").insert({
    user_id: user.id,
    action: "job_agent_search_run",
    metadata: {
      reviewed: rows.length,
      eligible,
      blocked,
      unverified,
      providers: ["Adzuna"],
      hard_eligibility_gate: "hard-gate-v1",
      expanded_role_queries: roleQueries,
    },
  });

  revalidatePath("/job-agent");
  redirect(`/job-agent?searched=${rows.length}&eligible=${eligible}&expanded=${roleQueries.length}`);
}
