import type { ApplicationExecutionCapability, JobAgentMode, JobEligibilityStatus } from "../../types/jobAgent.ts";
import { safeExternalUrl } from "./normalization.ts";

export function determineExecutionCapability(input: { mode: JobAgentMode; eligibility: JobEligibilityStatus; applicationUrl: string | null; officialAutoSubmitConfigured?: boolean; officialAssistedIntegration?: boolean }): { capability: ApplicationExecutionCapability; reason: string; userAction: string | null } {
  if (input.eligibility === "blocked") return { capability: "blocked", reason: "A confirmed hard constraint conflicts with this vacancy.", userAction: null };
  const safeUrl = safeExternalUrl(input.applicationUrl);
  if (!safeUrl) return { capability: "blocked", reason: "No validated HTTPS application URL is available.", userAction: "Find the official company careers page and verify the vacancy." };
  if (input.mode === "discovery_only") return { capability: "manual_only", reason: "The user selected Discovery Only.", userAction: "Open the verified application link if you choose to apply." };
  if (input.officialAutoSubmitConfigured && input.eligibility === "eligible") return { capability: "auto_submit_supported", reason: "An approved official submission integration is configured; explicit approval is still required.", userAction: "Review the pack and approve this one submission." };
  if (input.officialAssistedIntegration) return { capability: "assisted_supported", reason: "The integration can prepare or prefill but cannot safely perform the final submit.", userAction: "Review the prefilled form and click the provider's final submit button." };
  return { capability: "manual_only", reason: "No approved official submission API is configured for this vacancy.", userAction: "Open the exact application link, upload the prepared pack, answer screening questions, then confirm submission with evidence." };
}
