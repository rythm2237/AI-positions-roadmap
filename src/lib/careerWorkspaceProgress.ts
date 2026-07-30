import type {
  CareerWorkspaceData,
  CareerWorkspaceProgress,
  CareerWorkspaceStats,
} from "@/types/careerWorkspace";
import {
  isQualifiedResult,
  normalizeAssessmentProgress,
} from "@/lib/assessmentPolicy";

function storageKey(slug: string): string {
  return `career_workspace_progress__${slug}`;
}

export function defaultCareerWorkspaceProgress(): CareerWorkspaceProgress {
  return {
    completedLessons: [],
    completedResources: [],
    completedProjects: [],
    completedStageTasks: [],
    completedReadinessItems: [],
    quizAnswers: {},
    assessmentResults: {},
    assessmentAttempts: [],
    resourceViewedAt: {},
    notes: [],
  };
}

export function loadCareerWorkspaceProgress(slug: string): CareerWorkspaceProgress {
  if (typeof window === "undefined") return defaultCareerWorkspaceProgress();

  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    if (!raw) return defaultCareerWorkspaceProgress();
    return normalizeAssessmentProgress({
      ...defaultCareerWorkspaceProgress(),
      ...JSON.parse(raw),
    });
  } catch {
    return defaultCareerWorkspaceProgress();
  }
}

export function saveCareerWorkspaceProgress(slug: string, progress: CareerWorkspaceProgress): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey(slug), JSON.stringify(progress));
  } catch {
    // Local storage can fail in private browsing or quota-limited contexts.
  }
}

function percent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

export function getCareerWorkspaceStats(
  career: CareerWorkspaceData,
  progress: CareerWorkspaceProgress
): CareerWorkspaceStats {
  const hasJourneyStages = career.journeyStages.length > 0;
  const lessons = hasJourneyStages
    ? career.journeyStages.flatMap((stage) => stage.lessons.map((lesson) => ({ id: `${stage.id}__${lesson}` })))
    : career.roadmap.flatMap((phase) => phase.lessons);
  const resources = hasJourneyStages
    ? career.journeyStages.flatMap((stage) => stage.resources)
    : career.roadmap.flatMap((phase) => phase.lessons).flatMap((lesson) => lesson.resources);
  const assessments = career.journeyStages.flatMap((stage) => [stage.test, stage.phaseExam].filter(Boolean));
  const questions = hasJourneyStages
    ? assessments.flatMap((assessment) => assessment?.questions ?? [])
    : career.roadmap.flatMap((phase) => phase.quiz.questions);
  const tasks = career.journeyStages.flatMap((stage) => stage.tasks);

  const completedLessons = lessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length;
  const completedResources = resources.filter((resource) => progress.completedResources.includes(resource.id)).length;
  const completedProjects = career.projects.filter((project) => progress.completedProjects.includes(project.id)).length;
  const passedAssessments = assessments.filter(
    (assessment) =>
      assessment &&
      isQualifiedResult(progress.assessmentResults[assessment.id])
  ).length;
  const completedQuizzes = hasJourneyStages ? passedAssessments : questions.filter((question) => progress.quizAnswers[question.id]?.correct).length;
  const completedTasks = tasks.filter((task) => progress.completedStageTasks.includes(task.id)).length;

  const lessonProgress = percent(completedLessons, lessons.length);
  const resourceProgress = percent(completedResources, resources.length);
  const projectProgress = percent(completedProjects, career.projects.length);
  const quizProgress = hasJourneyStages ? percent(passedAssessments, assessments.length) : percent(completedQuizzes, questions.length);
  const stageProgress = percent(completedTasks + passedAssessments, tasks.length + assessments.length);

  const readinessScore = Math.round(
    (stageProgress * 0.3) +
      (resourceProgress * 0.15) +
      (projectProgress * 0.25) +
      (quizProgress * 0.2) +
      (percent(progress.completedReadinessItems.length, career.readiness.length) * 0.1)
  );

  return {
    overallProgress: Math.round((stageProgress + resourceProgress + projectProgress + quizProgress) / 4),
    lessonProgress,
    resourceProgress,
    projectProgress,
    quizProgress,
    readinessScore,
    completedLessons,
    totalLessons: lessons.length,
    completedResources,
    totalResources: resources.length,
    completedProjects,
    totalProjects: career.projects.length,
    completedQuizzes,
    totalQuizzes: hasJourneyStages ? assessments.length : questions.length,
    notesCount: progress.notes.length,
    stageProgress,
    passedAssessments,
    totalAssessments: assessments.length,
  };
}

export function getPhaseProgress(
  phaseId: string,
  career: CareerWorkspaceData,
  progress: CareerWorkspaceProgress
): number {
  const phase = career.roadmap.find((item) => item.id === phaseId);
  if (!phase) return 0;

  const lessonIds = phase.lessons.map((lesson) => lesson.id);
  const resourceIds = phase.lessons.flatMap((lesson) => lesson.resources.map((resource) => resource.id));
  const questionIds = phase.quiz.questions.map((question) => question.id);
  const total = lessonIds.length + resourceIds.length + questionIds.length;
  const completed =
    lessonIds.filter((id) => progress.completedLessons.includes(id)).length +
    resourceIds.filter((id) => progress.completedResources.includes(id)).length +
    questionIds.filter((id) => progress.quizAnswers[id]?.correct).length;

  return percent(completed, total);
}

export function isJourneyStageUnlocked(
  stageId: string,
  career: CareerWorkspaceData,
  progress: CareerWorkspaceProgress
): boolean {
  const stageIndex = career.journeyStages.findIndex((stage) => stage.id === stageId);
  if (stageIndex <= 0) return stageIndex === 0;

  return career.journeyStages
    .slice(0, stageIndex)
    .every((stage) =>
      isQualifiedResult(progress.assessmentResults[stage.test.id])
    );
}

export function isJourneyAssessmentUnlocked(
  stageId: string,
  assessmentType: "station" | "phase",
  career: CareerWorkspaceData,
  progress: CareerWorkspaceProgress
): boolean {
  if (!isJourneyStageUnlocked(stageId, career, progress)) return false;
  if (assessmentType === "station") return true;

  const stage = career.journeyStages.find((item) => item.id === stageId);
  return Boolean(
    stage && isQualifiedResult(progress.assessmentResults[stage.test.id])
  );
}

export function getJourneyStageProgress(
  stageId: string,
  career: CareerWorkspaceData,
  progress: CareerWorkspaceProgress
): number {
  const stage = career.journeyStages.find((item) => item.id === stageId);
  if (!stage) return 0;

  const taskCount = stage.tasks.length;
  const resourceCount = stage.resources.length;
  const assessmentCount = 1 + (stage.phaseExam ? 1 : 0);
  const completedTasks = stage.tasks.filter((task) => progress.completedStageTasks.includes(task.id)).length;
  const completedResources = stage.resources.filter((resource) => progress.completedResources.includes(resource.id)).length;
  const passedAssessments = [stage.test, stage.phaseExam].filter(
    (assessment) =>
      assessment &&
      isQualifiedResult(progress.assessmentResults[assessment.id])
  ).length;

  return percent(completedTasks + completedResources + passedAssessments, taskCount + resourceCount + assessmentCount);
}
