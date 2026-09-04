"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { assessFreshness } from "@/lib/job-agent/normalization";
import { configuredJobProviders, runProviderGateway } from "@/lib/job-agent/providers/gateway";
import { createJobSearchIntent, validateJobSearchIntent } from "@/lib/job-agent/intent";
import { planSearchQueries } from "@/lib/job-agent/searchStrategy";
import { loadUnifiedEvidence } from "@/lib/job-agent/unifiedEvidence";
import { verifyVacancy } from "@/lib/job-agent/vacancyVerification";
import { enrichRequirements } from "@/lib/job-agent/requirements";
import { evaluateHardEligibility } from "@/lib/job-agent/hardEligibility";
import { calculateEvidenceGroundedFit } from "@/lib/job-agent/fitIntelligence";
import { determineExecutionCapability } from "@/lib/job-agent/execution";
import { preserveOpportunityConflictUrls } from "@/lib/job-agent/persistence";
import type { JobAgent, NormalizedJobSearchIntent } from "@/types/jobAgent";
import type { Profile } from "@/types/identity";

type SearchResult = {
  searched: number;
  eligible: number;
  unverified: number;
  blocked: number;
  expired: number;
  expanded: number;
  providerErrors: number;
  outcome: "completed" | "partial" | "no_results";
  correlationId: string;
} | { error: "provider" | "provider-failure" | "profile" | "paused" | "criteria" | "country" | "search-save" };

async function persistIntent(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, agent: JobAgent, intent: NormalizedJobSearchIntent) {
  const existing = await supabase.from("job_search_intents").select("id,version").eq("user_id", userId).eq("fingerprint", intent.fingerprint).maybeSingle<{ id: string; version: number }>();
  if (existing.error) throw existing.error;
  await supabase.from("job_search_intents").update({ is_current: false }).eq("agent_id", agent.id).eq("user_id", userId);
  if (existing.data) {
    const activation = await supabase.from("job_search_intents").update({ is_current: true, confirmed_at: intent.confirmedAt }).eq("id", existing.data.id).eq("user_id", userId);
    if (activation.error) throw activation.error;
    const updateAgent = await supabase.from("job_agents").update({ intent_version: existing.data.version }).eq("id", agent.id).eq("user_id", userId);
    if (updateAgent.error) throw updateAgent.error;
    return { id: existing.data.id, version: existing.data.version };
  }
  const inserted = await supabase.from("job_search_intents").insert({ user_id: userId, agent_id: agent.id, version: intent.version, primary_target_role: intent.primaryTargetRole, hard_constraints: intent.hard, soft_preferences: intent.soft, normalized_intent: intent, fingerprint: intent.fingerprint, is_current: true, confirmed_at: intent.confirmedAt }).select("id,version").single<{ id: string; version: number }>();
  if (inserted.error) throw inserted.error;
  const updateAgent = await supabase.from("job_agents").update({ intent_version: inserted.data.version }).eq("id", agent.id).eq("user_id", userId);
  if (updateAgent.error) throw updateAgent.error;
  return inserted.data;
}

const providerCost = (provider: string, requests: number) => provider === "SerpApi" ? requests * Math.max(0, Number(process.env.SERPAPI_ESTIMATED_COST_PER_SEARCH_USD ?? 0)) : 0;

export async function searchCurrentUserJobs(): Promise<SearchResult> {
  const user = await requireUser("/job-agent");
  const supabase = await createClient();
  const providers = configuredJobProviders();
  if (!providers.length) return { error: "provider" };

  const [agentResult, profileResult] = await Promise.all([
    supabase.from("job_agents").select("*").eq("user_id", user.id).single<JobAgent>(),
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
  ]);
  if (agentResult.error || profileResult.error) return { error: "profile" };
  const agent = agentResult.data;
  const profile = profileResult.data;
  if (agent.status !== "active") return { error: "paused" };

  const intent = createJobSearchIntent(agent, agent.search_languages?.length ? agent.search_languages : profile.languages);
  if (validateJobSearchIntent(intent).length) return { error: "criteria" };
  const queries = planSearchQueries(intent, 6);
  const countries = intent.hard.countries.slice(0, 3);
  if (!countries.some((country) => providers.some((provider) => provider.countrySupport(country)))) return { error: "country" };

  const started = Date.now();
  const correlationId = randomUUID();
  let intentRecord: { id: string; version: number };
  try {
    intentRecord = await persistIntent(supabase, user.id, agent, intent);
  } catch (error) {
    console.error("Job Agent intent persistence failed", { correlationId, userId: user.id, message: error instanceof Error ? error.message : String(error) });
    return { error: "search-save" };
  }
  const searchRun = await supabase.from("job_search_runs").insert({ correlation_id: correlationId, user_id: user.id, agent_id: agent.id, intent_id: intentRecord.id, status: "running", queries_planned: queries.length * countries.length }).select("id").single<{ id: string }>();
  if (searchRun.error) return { error: "search-save" };

  const evidenceResult = await loadUnifiedEvidence(supabase, user.id, profile);
  const gateway = await runProviderGateway({ providers, queries: queries.map((query) => query.query), countries, location: intent.hard.citiesRegions[0], correlationId, limitPerRequest: 10, maxRequests: 36 });
  const providerFailures = gateway.attempts.filter((attempt) => ["provider_error", "rate_limit", "auth_failure", "invalid_query"].includes(attempt.status));
  const allFailed = gateway.attempts.length > 0 && gateway.attempts.every((attempt) => ["provider_error", "rate_limit", "auth_failure", "invalid_query"].includes(attempt.status));

  if (gateway.attempts.length) {
    const attempts = await supabase.from("job_provider_attempts").insert(gateway.attempts.map((attempt) => ({ user_id: user.id, search_run_id: searchRun.data.id, provider: attempt.provider, query: attempt.query, country: attempt.country, location: attempt.location, status: attempt.status, records_received: attempt.recordsReceived, request_count: attempt.requestCount, rate_limit_state: attempt.rateLimitState, latency_ms: attempt.latencyMs, error_code: attempt.errorCode ?? null, error_message: attempt.errorMessage?.slice(0, 500) ?? null })));
    if (attempts.error) console.error("Job Agent provider telemetry failed", { correlationId, code: attempts.error.code });
  }

  const processed = await Promise.all(gateway.jobs.slice(0, 80).map(async (candidate) => {
    const verification = await verifyVacancy(candidate);
    const job = enrichRequirements(verification.job, evidenceResult.evidence);
    const freshness = assessFreshness(job);
    const eligibility = evaluateHardEligibility({ job, profile, agent, intent: { ...intent, version: intentRecord.version }, evidence: evidenceResult.evidence, expired: freshness.status === "expired" });
    job.requiredLanguages = eligibility.requiredLanguages;
    const fit = eligibility.status === "blocked" ? null : calculateEvidenceGroundedFit(job, intent, evidenceResult.evidence);
    const classification = freshness.status === "expired" ? "expired" : eligibility.status === "blocked" ? "blocked" : fit?.classification ?? "stretch";
    const execution = determineExecutionCapability({ mode: agent.automation_mode, eligibility: eligibility.status, applicationUrl: job.applicationUrl, officialAutoSubmitConfigured: false, officialAssistedIntegration: false });
    const recommendation = classification === "strong_match" ? "strong" : classification === "good_match" ? "prepare" : classification === "blocked" || classification === "expired" ? "skip" : "review";
    return { job, verification, freshness, eligibility, fit, classification, execution, recommendation };
  }));

  const now = new Date().toISOString();
  const rows = processed.map(({ job, verification, freshness, eligibility, fit, classification, execution, recommendation }) => ({
    user_id: user.id, agent_id: agent.id, external_job_id: job.externalId, source: job.source, source_query: job.sourceQueries.join(" | ").slice(0, 1000),
    canonical_key: job.canonicalKey, company: job.company, role: job.title, normalized_title: job.normalizedTitle, location: job.location, country: job.country,
    job_url: job.applicationUrl, application_url: job.applicationUrl, source_url: job.sourceUrl, job_description: job.description, required_languages: job.requiredLanguages,
    workplace_model: job.workplaceModel, employment_types: job.employmentTypes, seniority: job.seniority, required_skills: job.requiredSkills, preferred_skills: job.preferredSkills,
    education_requirements: job.educationRequirements, certification_requirements: job.certificationRequirements, visa_sponsorship: job.visaSponsorship,
    posted_at: job.postedAt, expires_at: job.expiresAt, salary_min: job.salaryMin, salary_max: job.salaryMax, salary_currency: job.currency,
    verification_status: verification.status, verification_provenance: verification.provenance, verified_at: verification.status === "verified" || verification.status === "partially_verified" ? now : null,
    freshness_status: freshness.status, stale_reason: freshness.reason, eligibility_status: eligibility.status, eligibility_reasons: eligibility.reasons,
    eligibility_detail: { reasons: eligibility.detail }, eligibility_checked_at: now, eligibility_version: "hard-gate-v4",
    fit_score: fit?.score ?? null, fit_confidence: fit?.confidence ?? null, fit_explanation: fit?.explanation ?? {}, decision_classification: classification,
    recommendation, strengths: fit?.strengths ?? [], gaps: [...eligibility.reasons, ...(fit?.gaps ?? [])], execution_capability: execution.capability,
    status: classification === "blocked" || classification === "expired" ? "skipped" : recommendation === "strong" || recommendation === "prepare" ? "recommended" : "discovered",
    skip_reason: classification === "blocked" || classification === "expired" ? eligibility.reasons.join("; ") || freshness.reason : null,
    current_intent_version: intentRecord.version, updated_at: now,
  }));

  let savedJobs: Array<{ id: string; canonical_key: string | null; job_url: string }> = [];
  if (rows.length) {
    // `job_url` is the legacy conflict target, while providers also have a stable
    // `(user_id, source, external_job_id)` identity. Preserve the original conflict
    // URL when a provider rotates its redirect URL so both unique keys resolve to
    // the same row instead of raising 23505.
    const externalIds = [...new Set(rows.map((row) => row.external_job_id).filter(Boolean))];
    const existing = externalIds.length
      ? await supabase.from("job_opportunities").select("source,external_job_id,job_url").eq("user_id", user.id).in("external_job_id", externalIds).returns<Array<{ source: string; external_job_id: string | null; job_url: string }>>()
      : { data: [], error: null };
    if (existing.error) {
      await supabase.from("job_search_runs").update({ status: "failed", error_code: `IDENTITY_LOOKUP_${existing.error.code}`, latency_ms: Date.now() - started, completed_at: new Date().toISOString() }).eq("id", searchRun.data.id).eq("user_id", user.id);
      console.error("Job Agent opportunity identity lookup failed", { code: existing.error.code, correlationId, userId: user.id });
      return { error: "search-save" };
    }
    const persistenceRows = preserveOpportunityConflictUrls(rows, existing.data ?? []);
    const save = await supabase.from("job_opportunities").upsert(persistenceRows, { onConflict: "user_id,job_url", ignoreDuplicates: false }).select("id,canonical_key,job_url").returns<Array<{ id: string; canonical_key: string | null; job_url: string }>>();
    if (save.error) {
      await supabase.from("job_search_runs").update({ status: "failed", error_code: `PERSIST_${save.error.code}`, latency_ms: Date.now() - started, completed_at: new Date().toISOString() }).eq("id", searchRun.data.id).eq("user_id", user.id);
      console.error("Job Agent opportunity upsert failed", { code: save.error.code, message: save.error.message, correlationId, userId: user.id });
      return { error: "search-save" };
    }
    savedJobs = save.data ?? [];
  }

  const idByKey = new Map(savedJobs.map((row) => [row.canonical_key, row.id]));
  const idByUrl = new Map(savedJobs.map((row) => [row.job_url, row.id]));
  const sourceRows = new Map<string, Record<string, unknown>>();
  const verificationRows: Record<string, unknown>[] = [];
  const fitRows: Record<string, unknown>[] = [];
  const inboxRows: Record<string, unknown>[] = [];
  processed.forEach((item) => {
    const jobId = idByKey.get(item.job.canonicalKey) ?? idByUrl.get(item.job.applicationUrl);
    if (!jobId) return;
    for (const source of item.job.sources) sourceRows.set(`${source.provider}|${source.sourceUrl}`, { user_id: user.id, job_id: jobId, search_run_id: searchRun.data.id, provider: source.provider, source_job_id: source.sourceJobId, source_query: source.sourceQuery, source_url: source.sourceUrl, provider_payload: source.providerPayload });
    verificationRows.push({ user_id: user.id, job_id: jobId, status: item.verification.status, method: String(item.verification.provenance.method ?? "unknown"), source_url: item.job.sourceUrl, fields: item.verification.provenance, error_code: item.verification.errorCode ?? null, verified_at: now });
    if (item.fit) fitRows.push({ user_id: user.id, job_id: jobId, intent_id: intentRecord.id, score: item.fit.score, confidence: item.fit.confidence, classification: item.fit.classification, dimensions: item.fit.explanation.dimensions, strongest_evidence_ids: item.fit.explanation.strongestEvidence.map((evidence) => evidence.evidenceId).filter(Boolean), missing_evidence: item.fit.explanation.missingEvidence, transferable_evidence_ids: item.fit.explanation.transferableEvidence.map((evidence) => evidence.evidenceId).filter(Boolean), explanation: item.fit.explanation, scoring_version: "evidence-fit-v1" });
    if (item.classification === "strong_match" || item.classification === "good_match" || item.eligibility.status === "unverified") inboxRows.push({ user_id: user.id, job_id: jobId, category: item.classification === "strong_match" ? "new_strong_match" : "new_review_job", title: `${item.job.title} at ${item.job.company}`.slice(0, 160), body: item.fit?.explanation.whyRankedHere.join(" ") || item.eligibility.reasons.join(" "), priority: item.classification === "strong_match" ? "high" : "normal", recommended_action: item.eligibility.status === "unverified" ? "Review unverified hard requirements before preparing an application." : "Review the evidence and application readiness.", deep_link: `/job-agent/jobs/${jobId}`, dedupe_key: `search:${searchRun.data.id}:job:${jobId}` });
  });

  const secondaryWrites = await Promise.all([
    sourceRows.size ? supabase.from("job_opportunity_sources").upsert([...sourceRows.values()], { onConflict: "user_id,provider,source_url" }) : Promise.resolve({ error: null }),
    verificationRows.length ? supabase.from("job_verifications").upsert(verificationRows, { onConflict: "job_id,method,source_url" }) : Promise.resolve({ error: null }),
    fitRows.length ? supabase.from("job_fit_assessments").upsert(fitRows, { onConflict: "job_id,intent_id,scoring_version" }) : Promise.resolve({ error: null }),
    inboxRows.length ? supabase.from("job_agent_inbox").upsert(inboxRows, { onConflict: "user_id,dedupe_key" }) : Promise.resolve({ error: null }),
  ]);
  const persistenceErrors = secondaryWrites.flatMap((result, index) => result.error ? [`${["sources", "verification", "fit", "inbox"][index]}:${result.error.code}`] : []);
  if (persistenceErrors.length) console.error("Job Agent secondary persistence was partial", { correlationId, userId: user.id, errorCodes: persistenceErrors });

  const eligible = processed.filter((item) => item.eligibility.status === "eligible").length;
  const unverified = processed.filter((item) => item.eligibility.status === "unverified").length;
  const blocked = processed.filter((item) => item.eligibility.status === "blocked" && item.freshness.status !== "expired").length;
  const expired = processed.filter((item) => item.freshness.status === "expired").length;
  const recommended = processed.filter((item) => item.classification === "strong_match" || item.classification === "good_match").length;
  const status = allFailed ? "failed" : providerFailures.length || persistenceErrors.length ? "partial" : "completed";
  const attemptsByStatus = Object.fromEntries([...new Set(gateway.attempts.map((attempt) => attempt.status))].map((attemptStatus) => [attemptStatus, gateway.attempts.filter((attempt) => attempt.status === attemptStatus).length]));
  const estimatedCost = gateway.attempts.reduce((sum, attempt) => sum + providerCost(attempt.provider, attempt.requestCount), 0);
  await supabase.from("job_search_runs").update({ status, provider_records: gateway.jobs.length, deduplicated_count: processed.length, eligible_count: eligible, unverified_count: unverified, blocked_count: blocked, recommended_count: recommended, expired_count: expired, provider_summary: { attemptsByStatus, evidenceWarnings: evidenceResult.warnings, persistenceErrors }, api_usage: { requests: gateway.attempts.reduce((sum, attempt) => sum + attempt.requestCount, 0) }, estimated_cost: estimatedCost, latency_ms: Date.now() - started, error_code: allFailed ? "ALL_PROVIDERS_FAILED" : persistenceErrors.length ? "SECONDARY_PERSISTENCE_PARTIAL" : null, completed_at: new Date().toISOString() }).eq("id", searchRun.data.id).eq("user_id", user.id);

  await supabase.from("user_activity").insert({ user_id: user.id, action: "job_agent_search_run_v2", metadata: { correlation_id: correlationId, intent_version: intentRecord.version, searched: processed.length, eligible, unverified, blocked, expired, recommended, provider_errors: providerFailures.length, providers: providers.map((provider) => provider.name), queries: queries.map((query) => query.query), latency_ms: Date.now() - started } });
  revalidatePath("/job-agent");

  if (allFailed && !processed.length) return { error: "provider-failure" };
  return { searched: processed.length, eligible, unverified, blocked, expired, expanded: queries.length, providerErrors: providerFailures.length, outcome: processed.length ? providerFailures.length || persistenceErrors.length ? "partial" : "completed" : "no_results", correlationId };
}

export async function runJobSearch() {
  const result = await searchCurrentUserJobs();
  if ("error" in result) redirect(`/job-agent?error=${result.error}`);
  redirect(`/job-agent?searched=${result.searched}&eligible=${result.eligible}&unverified=${result.unverified}&blocked=${result.blocked}&expired=${result.expired}&expanded=${result.expanded}&provider_errors=${result.providerErrors}&outcome=${result.outcome}&correlation=${result.correlationId}`);
}
