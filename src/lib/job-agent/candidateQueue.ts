import { careerDomain, levelRank } from "./careerIntelligence.ts";
import type { CanonicalJobCandidate } from "./contracts.ts";
import { assessFreshness, normalizeJobText } from "./normalization.ts";
import type { NormalizedJobSearchIntent } from "../../types/jobAgent.ts";

export function prioritizeJobCandidate(job: CanonicalJobCandidate, intent: NormalizedJobSearchIntent) {
  const title = normalizeJobText(job.title);
  const domain = careerDomain(title);
  const matchingTracks = (intent.careerTracks ?? []).filter((track) => track.domain === domain);
  const targets = [intent.primaryTargetRole, ...(intent.careerTracks ?? []).flatMap((track) => track.targetTitles)];
  const titleWords = new Set(title.split(" "));
  const overlap = Math.max(0, ...targets.map((target) => {
    const words = normalizeJobText(target).split(" ").filter((word) => word.length > 2);
    return words.length ? words.filter((word) => titleWords.has(word)).length / words.length : 0;
  }));
  const seniority = levelRank(job.seniority) ?? levelRank(title);
  const aboveTrack = seniority !== null && matchingTracks.length > 0 && matchingTracks.every((track) => seniority > (levelRank(track.maximumSeniority) ?? Infinity));
  return Math.round(overlap * 16) + (matchingTracks.length ? 16 : 0) - (aboveTrack ? 12 : 0)
    + (job.source.startsWith("Direct:") ? 4 : 0) + (job.descriptionComplete ? 4 : 0)
    + (assessFreshness(job).status === "fresh" ? 4 : 0);
}
