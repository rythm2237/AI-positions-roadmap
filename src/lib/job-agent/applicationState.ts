import type { ApplicationStatus } from "../../types/jobAgent.ts";

const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  discovered: ["reviewing", "withdrawn", "expired"],
  reviewing: ["preparing", "withdrawn", "expired"],
  preparing: ["ready_for_review", "withdrawn", "expired"],
  ready_for_review: ["ready_for_submit", "preparing", "withdrawn", "expired"],
  ready_for_submit: ["manual_action_required", "submitted", "withdrawn", "expired"],
  manual_action_required: ["submitted", "withdrawn", "expired"],
  submitted: ["recruiter_response", "rejected", "withdrawn", "expired"],
  ats_pack_manual_finalization: ["manual_action_required", "submitted", "withdrawn", "expired"],
  applied: ["recruiter_response", "rejected", "withdrawn", "expired"],
  recruiter_response: ["interview", "rejected", "withdrawn"],
  interview: ["assessment", "offer", "rejected", "withdrawn"],
  assessment: ["interview", "offer", "rejected", "withdrawn"],
  offer: ["withdrawn"],
  rejected: [], withdrawn: [], expired: [], skipped: ["reviewing"],
};

export function canTransitionApplication(from: ApplicationStatus, to: ApplicationStatus) {
  return transitions[from].includes(to);
}

export function requireSubmissionEvidence(status: ApplicationStatus, evidence: { receipt?: string | null; attestedBy?: string | null }) {
  if (!["submitted", "applied"].includes(status)) return true;
  return Boolean(evidence.receipt?.trim() || evidence.attestedBy?.trim());
}
