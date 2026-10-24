import { CAREER_GATE_VERSION } from './careerIntelligence.ts';
export type NotificationJob = {
  eligibility_status: string; verification_status?: string; freshness_status?: string;
  eligibility_version?: string; fit_score: number | null; decision_classification?: string | null;
  status: string; recommendation: string | null; decision_status: string; snoozed_until?: string | null;
};
export function recommendationEligible(job: NotificationJob, options: {minimum_match_score?:number; include_stretch?:boolean}, now=new Date()) {
  if(job.eligibility_status!=='eligible' || job.verification_status!=='verified' || job.eligibility_version!==CAREER_GATE_VERSION) return false;
  if(['expired','stale'].includes(job.freshness_status??'') || ['skipped','expired'].includes(job.status) || job.recommendation==='skip') return false;
  if(['rejected','approved'].includes(job.decision_status) || (job.decision_status==='snoozed' && (!job.snoozed_until||Date.parse(job.snoozed_until)>now.getTime()))) return false;
  if(job.fit_score===null || job.fit_score<(options.minimum_match_score??68)) return false;
  return ['strong_match','good_match'].includes(job.decision_classification??'') || Boolean(options.include_stretch && ['stretch','worth_reviewing'].includes(job.decision_classification??''));
}

/** Separate, clearly labelled human-review cohort. Never upgrades a weak fit to recommended. */
export function verifiedReviewCandidate(job: NotificationJob, options: { minimum_match_score?: number }, now = new Date()) {
  if (job.eligibility_status !== 'eligible' || job.verification_status !== 'verified' || job.eligibility_version !== CAREER_GATE_VERSION) return false;
  if (['expired','stale'].includes(job.freshness_status ?? '') || ['skipped','expired'].includes(job.status) || job.recommendation === 'skip') return false;
  if (['rejected','approved'].includes(job.decision_status) || (job.decision_status === 'snoozed' && (!job.snoozed_until || Date.parse(job.snoozed_until) > now.getTime()))) return false;
  const score = job.fit_score;
  const minimum = options.minimum_match_score ?? 68;
  return score !== null && score >= 45 && score < minimum
    && ['stretch','worth_reviewing','good_match'].includes(job.decision_classification ?? '');
}
