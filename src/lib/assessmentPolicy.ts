import type {
  CareerAssessment,
  CareerAssessmentResult,
  CareerWorkspaceProgress,
} from "@/types/careerWorkspace";

export const CAREER_ASSESSMENT_PASSING_SCORE = 60;
export const CAREER_ASSESSMENT_QUESTION_COUNT = 5;
export const CAREER_SECTION_QUESTION_POOL_SIZE = 15;
export const CAREER_PHASE_ASSESSMENT_PASSING_SCORE = 70;
export const CAREER_PHASE_ASSESSMENT_QUESTION_COUNT = 20;

export function isQualifiedScore(score: number): boolean {
  return Number.isFinite(score) && score >= CAREER_ASSESSMENT_PASSING_SCORE;
}

export function isQualifiedResult(
  result: CareerAssessmentResult | undefined
): boolean {
  return Boolean(result?.passed);
}

export function isAssessmentQualified(
  assessment: CareerAssessment,
  result: CareerAssessmentResult | undefined
): boolean {
  return Boolean(
    result &&
      result.passed &&
      Number.isFinite(result.score) &&
      result.score >= assessment.passingScore
  );
}

function normalizeResult(
  result: CareerAssessmentResult
): CareerAssessmentResult {
  return {
    ...result,
    passed:
      typeof result.passed === "boolean"
        ? result.passed
        : isQualifiedScore(result.score),
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
