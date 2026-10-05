import type { Profile } from "@/types/identity";
import type { CareerWorkspaceData, CareerWorkspaceProgress } from "@/types/careerWorkspace";
import type { ProjectReview, ProjectSubmission } from "@/lib/projectEvidence";

export function buildStudioProfileDraft(
  profile: Partial<Profile>,
  career?: CareerWorkspaceData,
  progress?: Partial<CareerWorkspaceProgress>,
  projects?: { reviews?: Record<string, ProjectReview>; submissions?: Record<string, ProjectSubmission> },
) {
  const lines = [profile.name || "", profile.email || "", profile.current_country || ""];
  if (profile.current_position) lines.push("Professional Summary", `Current position (self-reported): ${profile.current_position}`);
  if (profile.years_experience != null) lines.push(`Total experience (self-reported): ${profile.years_experience} years. Employers, dates and duties must be added by the candidate.`);
  for (const [heading, values] of [["Skills", profile.skills], ["Languages", profile.languages], ["Certificates (self-reported; not independently verified)", profile.certificates]] as const) {
    if (values?.length) lines.push(heading, values.join("; "));
  }
  if (career && progress) {
    const resources = [...career.journeyStages.flatMap(stage => stage.resources), ...career.roadmap.flatMap(phase => phase.lessons.flatMap(lesson => lesson.resources))];
    const completed = [...new Map(resources.filter(resource => progress.completedResources?.includes(resource.id)).map(resource => [resource.id, resource])).values()];
    if (completed.length) lines.push("Professional Development", "Learning marked complete by the candidate in AI Career. This is not employment experience or a verified certification.", ...completed.slice(0, 40).map(resource => `${resource.title} — ${resource.provider}`));
    const qualified = career.projects.filter(project => {
      const review = projects?.reviews?.[project.id];
      const submission = projects?.submissions?.[project.id];
      return review?.reviewer === "ai" && review.passed && review.overallScore >= 70 && submission?.summary && (submission.artifactUrl || submission.repositoryUrl);
    });
    if (qualified.length) lines.push("Projects", "Candidate-submitted portfolio work with a successful AI rubric review; not independently verified employment.", ...qualified.slice(0, 10).map(project => {
      const submission = projects!.submissions![project.id];
      return `${project.title}: ${submission.summary}\nArtifact: ${submission.artifactUrl || submission.repositoryUrl}`;
    }));
  }
  return lines.filter(Boolean).join("\n").slice(0, 100_000);
}
