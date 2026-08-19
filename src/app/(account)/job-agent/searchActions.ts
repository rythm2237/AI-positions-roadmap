"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { calculateJobFit } from "@/lib/job-agent/fit";
import { adzunaConfigured, resolveAdzunaCountry, searchAdzunaJobs } from "@/lib/job-agent/providers/adzuna";
import type { JobAgent } from "@/types/jobAgent";
import type { Profile } from "@/types/identity";

const languagePatterns: Array<[string, RegExp]> = [
  ["English", /\benglish\b/i], ["German", /\b(german|deutsch(?:e|en|er|es)?|deutschkenntnisse)\b/i], ["French", /\b(french|fran[cç]ais)\b/i],
  ["Dutch", /\b(dutch|nederlands)\b/i], ["Spanish", /\b(spanish|espa[nñ]ol)\b/i], ["Italian", /\b(italian|italiano)\b/i],
  ["Hungarian", /\b(hungarian|magyar)\b/i], ["Polish", /\b(polish|polski)\b/i], ["Portuguese", /\b(portuguese|portugu[eê]s)\b/i],
];

const requirementWords = /\b(required|requirement|must|mandatory|fluent|fluency|professional|proficien(?:t|cy)|b2|c1|c2|native|excellent|very good|written and spoken|kenntnisse|erforderlich|vorausgesetzt|fließend|fliessend|verhandlungssicher)\b/i;

function requiredLanguages(text: string) {
  const sentences = text.split(/(?<=[.!?;:\n])\s+/).filter(Boolean);
  const found = new Set<string>();
  for (const sentence of sentences) {
    if (!requirementWords.test(sentence)) continue;
    for (const [language, pattern] of languagePatterns) if (pattern.test(sentence)) found.add(language);
  }
  return [...found];
}

function inferPostingLanguage(text: string): string | null {
  const lower = text.toLowerCase();
  const germanMarkers = lower.match(/\b(und|oder|mit|für|fuer|wir|sie|der|die|das|eine|einen|deine|ihre|aufgaben|anforderungen|kenntnisse|berufserfahrung|arbeitszeit|arbeitsplatz|bewerbung)\b/g)?.length ?? 0;
  const englishMarkers = lower.match(/\b(and|or|with|for|we|you|the|your|responsibilities|requirements|experience|skills|working|workplace|application)\b/g)?.length ?? 0;
  const frenchMarkers = lower.match(/\b(et|avec|pour|nous|vous|les|des|une|compétences|competences|expérience|experience|candidature|poste)\b/g)?.length ?? 0;
  if (germanMarkers >= 5 && germanMarkers >= englishMarkers * 1.3) return "German";
  if (frenchMarkers >= 5 && frenchMarkers >= englishMarkers * 1.3) return "French";
  if (englishMarkers >= 5) return "English";
  return null;
}

const normalizeLanguage = (value: string) => value.trim().toLowerCase();
function hasLanguage(profile: Profile, language: string) {
  const target = normalizeLanguage(language);
  return profile.languages.some((item) => {
    const known = normalizeLanguage(item);
    return known.includes(target) || target.includes(known);
  });
}

function evaluateLanguageCompatibility(text: string, profile: Profile, agent: JobAgent) {
  const explicit = requiredLanguages(text);
  const inferred = inferPostingLanguage(text);
  const effective = explicit.length ? explicit : inferred ? [inferred] : [];
  const missing = effective.filter((language) => !hasLanguage(profile, language));

  if (missing.length) {
    return { compatible: false, languages: effective, gap: `Required or dominant posting language is not in the profile: ${missing.join(", ")}.` };
  }
  if (!effective.length && agent.exclude_unknown_languages) {
    return { compatible: false, languages: [], gap: "Language requirement could not be verified and unknown-language jobs are excluded." };
  }
  if (agent.english_only_priority && effective.length && !effective.includes("English")) {
    return { compatible: false, languages: effective, gap: `English-only priority excludes this ${effective.join("/")} vacancy.` };
  }
  return { compatible: true, languages: effective, gap: null as string | null };
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
  const supportedCountries = countries.filter((country) => resolveAdzunaCountry(country));
  const roleQueries = Array.from(new Set([agent.primary_career, ...agent.desired_titles, ...agent.secondary_careers].filter((value): value is string => Boolean(value)))).slice(0, 3);
  if (!countries.length || !roleQueries.length) redirect("/job-agent?error=criteria");
  if (!supportedCountries.length) redirect("/job-agent?error=country");

  const searches = supportedCountries.flatMap((country) => roleQueries.map((query) => searchAdzunaJobs({ country, query, location: agent.cities_regions[0], limit: 20 })));
  const batches = await Promise.all(searches);
  const unique = new Map<string, Awaited<ReturnType<typeof searchAdzunaJobs>>[number]>();
  for (const job of batches.flat()) unique.set(`${job.source}:${job.externalId}`, job);

  const rows = [...unique.values()]
    .filter((job) => !agent.excluded_companies.some((company) => job.company.toLowerCase().includes(company.toLowerCase())))
    .map((job) => {
      const language = evaluateLanguageCompatibility(`${job.title}\n${job.description}`, profile, agent);
      const fit = calculateJobFit({
        title: job.title, company: job.company, location: job.location, description: job.description,
        requiredLanguages: language.languages, salaryMin: job.salaryMin, salaryMax: job.salaryMax, currency: job.currency, workplaceModel: job.workplaceModel,
      }, profile, agent);
      const languageBlocked = !language.compatible;
      const recommendation = languageBlocked ? "skip" : fit.recommendation;
      const gaps = language.gap ? [language.gap, ...fit.gaps.filter((gap) => !gap.toLowerCase().includes("language"))] : fit.gaps;
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
        required_languages: language.languages,
        fit_score: languageBlocked ? Math.min(fit.fitScore, agent.auto_skip_threshold - 1) : fit.fitScore,
        recommendation,
        strengths: languageBlocked ? fit.strengths.filter((item) => !item.toLowerCase().includes("language")) : fit.strengths,
        gaps,
        founder_positioning: null,
        status: recommendation === "skip" ? "skipped" : recommendation === "review" ? "discovered" : "recommended",
        skip_reason: recommendation === "skip" ? gaps.join("; ") : null,
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
  await supabase.from("user_activity").insert({ user_id: user.id, action: "job_agent_search_run", metadata: { reviewed: rows.length, providers: ["Adzuna"], language_gate: true } });
  revalidatePath("/job-agent");
  redirect(`/job-agent?searched=${rows.length}`);
}
