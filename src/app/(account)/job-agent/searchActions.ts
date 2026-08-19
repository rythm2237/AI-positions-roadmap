"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { calculateJobFit } from "@/lib/job-agent/fit";
import { adzunaConfigured, searchAdzunaJobs } from "@/lib/job-agent/providers/adzuna";
import type { JobAgent } from "@/types/jobAgent";
import type { Profile } from "@/types/identity";

const languagePatterns: Array<[string, RegExp]> = [
  ["English", /\benglish\b/i], ["German", /\b(german|deutsch)\b/i], ["French", /\b(french|fran[cç]ais)\b/i],
  ["Dutch", /\b(dutch|nederlands)\b/i], ["Spanish", /\b(spanish|espa[nñ]ol)\b/i], ["Italian", /\b(italian|italiano)\b/i],
  ["Hungarian", /\b(hungarian|magyar)\b/i], ["Polish", /\b(polish|polski)\b/i], ["Portuguese", /\b(portuguese|portugu[eê]s)\b/i],
];

function requiredLanguages(text: string) {
  const lower = text.toLowerCase();
  return languagePatterns.flatMap(([language, pattern]) => pattern.test(text) && /required|must|fluent|professional|proficien|b2|c1|c2|native/.test(lower) ? [language] : []);
}

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
  const roleQueries = Array.from(new Set([agent.primary_career, ...agent.desired_titles, ...agent.secondary_careers].filter((value): value is string => Boolean(value)))).slice(0, 3);
  if (!countries.length || !roleQueries.length) redirect("/job-agent?error=criteria");

  const searches = countries.flatMap((country) => roleQueries.map((query) => searchAdzunaJobs({ country, query, location: agent.cities_regions[0], limit: 20 })));
  const batches = await Promise.all(searches);
  const unique = new Map<string, Awaited<ReturnType<typeof searchAdzunaJobs>>[number]>();
  for (const job of batches.flat()) unique.set(`${job.source}:${job.externalId}`, job);

  const rows = [...unique.values()].filter((job) => !agent.excluded_companies.some((company) => job.company.toLowerCase().includes(company.toLowerCase()))).map((job) => {
    const languages = requiredLanguages(job.description);
    const fit = calculateJobFit({
      title: job.title, company: job.company, location: job.location, description: job.description,
      requiredLanguages: languages, salaryMin: job.salaryMin, salaryMax: job.salaryMax, currency: job.currency, workplaceModel: job.workplaceModel,
    }, profile, agent);
    return {
      user_id: user.id,
      agent_id: agent.id,
      external_job_id: job.externalId,
      source: job.source,
      company: job.company,
      role: job.title,
      location: job.location,
      job_url: job.url,
      job_description: job.description,
      required_languages: languages,
      fit_score: fit.fitScore,
      recommendation: fit.recommendation,
      strengths: fit.strengths,
      gaps: fit.gaps,
      founder_positioning: null,
      status: fit.recommendation === "skip" ? "skipped" : fit.recommendation === "review" ? "discovered" : "recommended",
      skip_reason: fit.recommendation === "skip" ? fit.gaps.join("; ") : null,
      updated_at: new Date().toISOString(),
    };
  });

  if (rows.length) {
    const save = await supabase.from("job_opportunities").upsert(rows, { onConflict: "user_id,job_url", ignoreDuplicates: false });
    if (save.error) {
      console.error("Job Agent opportunity upsert failed", { code: save.error.code, message: save.error.message, userId: user.id });
      redirect("/job-agent?error=search-save");
    }
  }
  await supabase.from("user_activity").insert({ user_id: user.id, action: "job_agent_search_run", metadata: { reviewed: rows.length, providers: ["Adzuna"] } });
  revalidatePath("/job-agent");
  redirect(`/job-agent?searched=${rows.length}`);
}
