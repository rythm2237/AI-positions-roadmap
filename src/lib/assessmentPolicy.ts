import type {
  CareerAssessmentResult,
  CareerWorkspaceProgress,
} from "@/types/careerWorkspace";

export const CAREER_ASSESSMENT_PASSING_SCORE = 60;
export const CAREER_ASSESSMENT_QUESTION_COUNT = 5;

export function isQualifiedScore(score: number): boolean {
  return Number.isFinite(score) && score >= CAREER_ASSESSMENT_PASSING_SCORE;
}

export function isQualifiedResult(
  result: CareerAssessmentResult | undefined
): boolean {
  return Boolean(result && isQualifiedScore(result.score));
}

function normalizeResult(
  result: CareerAssessmentResult
): CareerAssessmentResult {
  return {
    ...result,
    passed: isQualifiedScore(result.score),
    bestScore: Math.max(result.score, result.bestScore ?? result.score),
  };
}

export function normalizeAssessmentProgress(
  progress: CareerWorkspaceProgress
): CareerWorkspaceProgress {
  return {
    ...progress,
    assessmentResults: Object.fromEntries(
      Object.entries(progress.assessmentResults).map(([id, result]) => [
        id,
        normalizeResult(result),
      ])
    ),
    assessmentAttempts: progress.assessmentAttempts.map(normalizeResult),
  };
}
