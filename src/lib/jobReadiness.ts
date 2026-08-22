import { isAssessmentQualified } from "@/lib/assessmentPolicy";
import type {
  CareerAssessment,
  CareerJourneyStage,
  CareerWorkspaceData,
  CareerWorkspaceProgress,
} from "@/types/careerWorkspace";

export type ReadinessBand = "building" | "almost-ready" | "application-ready";

export interface ReadinessDimension {
  id: "learning" | "validation" | "projects" | "career-assets" | "launch";
  label: string;
  score: number;
  weight: number;
  evidence: string;
}

export interface ReadinessGap {
  id: string;
  label: string;
  detail: string;
  severity: "high" | "medium" | "low";
  stageId?: string;
}

export interface NextBestAction {
  type: "resource" | "assessment" | "project" | "career-task" | "ready";
  title: string;
  detail: string;
  stageId?: string;
  targetId?: string;
}

export interface JobReadinessReport {
  score: number;
  band: ReadinessBand;
  dimensions: ReadinessDimension[];
  gaps: ReadinessGap[];
  nextBestAction: NextBestAction;
  remainingEffortMinutes: { min: number; max: number };
  evidence: {
    passedAssessments: number;
    totalAssessments: number;
    completedProjects: number;
    minimumProjects: number;
    completedCareerTasks: number;
    totalCareerTasks: number;
  };
}

function percent(completed: number, total: number): number {
  if (total <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((completed / total) * 100)));
}

function assessmentsForStage(stage: CareerJourneyStage): CareerAssessment[] {
  return [
    ...(stage.topicAssessments ?? []),
    ...(stage.phaseExam ? [stage.phaseExam] : []),
  ];
}

function assessmentPassed(
  assessment: CareerAssessment,
  progress: CareerWorkspaceProgress
): boolean {
  return isAssessmentQualified(
    assessment,
    progress.assessmentResults[assessment.id]
  );
}

function careerEvidenceTasks(career: CareerWorkspaceData) {
  return career.journeyStages.flatMap((stage) =>
    stage.tasks.filter((task) =>
      ["portfolio", "career", "job-search", "interview"].includes(task.type)
    )
  );
}

function incompleteStageEffort(
  stage: CareerJourneyStage,
  progress: CareerWorkspaceProgress
): { min: number; max: number } {
  const assessments = assessmentsForStage(stage);
  const stageQualified =
    assessments.length > 0 && assessments.every((item) => assessmentPassed(item, progress));

  if (stageQualified) return { min: 0, max: 0 };
  if (!stage.estimatedEffort) return { min: 0, max: 0 };

  const resources = stage.resources;
  const completedResources = resources.filter((item) =>
    progress.completedResources.includes(item.id)
  ).length;
  const resourceRatio = resources.length
    ? completedResources / resources.length
    : 1;

  const tasks = stage.tasks;
  const completedTasks = tasks.filter((item) =>
    progress.completedStageTasks.includes(item.id)
  ).length;
  const taskRatio = tasks.length ? completedTasks / tasks.length : 1;

  const passed = assessments.filter((item) => assessmentPassed(item, progress)).length;
  const assessmentRatio = assessments.length ? passed / assessments.length : 1;

  const breakdown = stage.estimatedEffort.breakdown;
  const min =
    breakdown.resources.minMinutes * (1 - resourceRatio) +
    breakdown.activities.minMinutes * (1 - taskRatio) +
    breakdown.assessment.minMinutes * (1 - assessmentRatio);
  const max =
    breakdown.resources.maxMinutes * (1 - resourceRatio) +
    breakdown.activities.maxMinutes * (1 - taskRatio) +
    breakdown.assessment.maxMinutes * (1 - assessmentRatio);

  return { min: Math.max(0, Math.round(min)), max: Math.max(0, Math.round(max)) };
}

function findNextBestAction(
  career: CareerWorkspaceData,
  progress: CareerWorkspaceProgress
): NextBestAction {
  for (const stage of career.journeyStages) {
    const firstResource = stage.resources.find(
      (resource) => !progress.completedResources.includes(resource.id)
    );
    if (firstResource) {
      return {
        type: "resource",
        title: `Continue ${stage.title}`,
        detail: `Complete the next essential learning item: ${firstResource.title}.`,
        stageId: stage.id,
        targetId: firstResource.id,
      };
    }

    const assessment = assessmentsForStage(stage).find(
      (item) => !assessmentPassed(item, progress)
    );
    if (assessment) {
      return {
        type: "assessment",
        title: `Validate ${stage.title}`,
        detail: `Pass ${assessment.title} so this skill evidence counts toward job readiness.`,
        stageId: stage.id,
        targetId: assessment.id,
      };
    }

    const task = stage.tasks.find(
      (item) => !progress.completedStageTasks.includes(item.id)
    );
    if (task) {
      return {
        type: "career-task",
        title: task.title,
        detail: task.description,
        stageId: stage.id,
        targetId: task.id,
      };
    }
  }

  const project = career.projects.find(
    (item) => !progress.completedProjects.includes(item.id)
  );
  if (project) {
    return {
      type: "project",
      title: `Build ${project.title}`,
      detail: "Complete this project to add proof-of-skill evidence before applying.",
      targetId: project.id,
    };
  }

  return {
    type: "ready",
    title: "Review matching jobs",
    detail: "Your core evidence is complete. Use job matching to evaluate specific opportunities.",
  };
}

export function getJobReadinessReport(
  career: CareerWorkspaceData,
  progress: CareerWorkspaceProgress
): JobReadinessReport {
  const resources = career.journeyStages.flatMap((stage) => stage.resources);
  const assessments = career.journeyStages.flatMap(assessmentsForStage);
  const evidenceTasks = careerEvidenceTasks(career);

  const completedResources = resources.filter((item) =>
    progress.completedResources.includes(item.id)
  ).length;
  const passedAssessments = assessments.filter((item) =>
    assessmentPassed(item, progress)
  ).length;
  const completedProjects = career.projects.filter((item) =>
    progress.completedProjects.includes(item.id)
  ).length;
  const completedCareerTasks = evidenceTasks.filter((item) =>
    progress.completedStageTasks.includes(item.id)
  ).length;

  const launchTasks = evidenceTasks.filter((item) =>
    ["job-search", "interview"].includes(item.type)
  );
  const completedLaunchTasks = launchTasks.filter((item) =>
    progress.completedStageTasks.includes(item.id)
  ).length;

  const dimensions: ReadinessDimension[] = [
    {
      id: "learning",
      label: "Learning coverage",
      score: percent(completedResources, resources.length),
      weight: 0.2,
      evidence: `${completedResources}/${resources.length} tracked learning resources completed`,
    },
    {
      id: "validation",
      label: "Validated skills",
      score: percent(passedAssessments, assessments.length),
      weight: 0.3,
      evidence: `${passedAssessments}/${assessments.length} assessments passed`,
    },
    {
      id: "projects",
      label: "Project evidence",
      score: percent(
        Math.min(completedProjects, career.progressRules.minimumProjects),
        Math.max(1, career.progressRules.minimumProjects)
      ),
      weight: 0.25,
      evidence: `${completedProjects}/${career.progressRules.minimumProjects} required projects completed`,
    },
    {
      id: "career-assets",
      label: "Career assets",
      score: percent(completedCareerTasks, evidenceTasks.length),
      weight: 0.15,
      evidence: `${completedCareerTasks}/${evidenceTasks.length} portfolio/profile/career tasks completed`,
    },
    {
      id: "launch",
      label: "Application launch",
      score: percent(completedLaunchTasks, launchTasks.length),
      weight: 0.1,
      evidence: `${completedLaunchTasks}/${launchTasks.length} job-search/interview tasks completed`,
    },
  ];

  const score = Math.round(
    dimensions.reduce((sum, dimension) => sum + dimension.score * dimension.weight, 0)
  );

  const gaps: ReadinessGap[] = [];
  const firstUnqualifiedStage = career.journeyStages.find((stage) =>
    assessmentsForStage(stage).some((item) => !assessmentPassed(item, progress))
  );
  if (firstUnqualifiedStage) {
    gaps.push({
      id: "validation-gap",
      label: "Validated skill evidence is incomplete",
      detail: `Complete the assessments in ${firstUnqualifiedStage.title}; progress alone is not treated as proof of skill.`,
      severity: "high",
      stageId: firstUnqualifiedStage.id,
    });
  }

  if (completedProjects < career.progressRules.minimumProjects) {
    gaps.push({
      id: "project-gap",
      label: "More project evidence required",
      detail: `Complete ${career.progressRules.minimumProjects - completedProjects} more project${career.progressRules.minimumProjects - completedProjects === 1 ? "" : "s"} before application-ready status.`,
      severity: "high",
    });
  }

  if (evidenceTasks.length > 0 && completedCareerTasks < evidenceTasks.length) {
    gaps.push({
      id: "career-assets-gap",
      label: "Career evidence is not complete",
      detail: "Finish the remaining portfolio, profile, job-search and interview preparation tasks.",
      severity: "medium",
    });
  }

  if (resources.length > 0 && completedResources < resources.length) {
    gaps.push({
      id: "learning-gap",
      label: "Learning path still has open items",
      detail: `${resources.length - completedResources} learning resource${resources.length - completedResources === 1 ? "" : "s"} remain uncompleted.`,
      severity: "low",
    });
  }

  const threshold = career.progressRules.readinessThreshold;
  const hardGatesSatisfied =
    passedAssessments === assessments.length &&
    completedProjects >= career.progressRules.minimumProjects;
  const band: ReadinessBand =
    score >= threshold && hardGatesSatisfied
      ? "application-ready"
      : score >= Math.max(55, threshold - 15)
        ? "almost-ready"
        : "building";

  const remainingEffortMinutes = career.journeyStages
    .map((stage) => incompleteStageEffort(stage, progress))
    .reduce(
      (total, effort) => ({
        min: total.min + effort.min,
        max: total.max + effort.max,
      }),
      { min: 0, max: 0 }
    );

  return {
    score,
    band,
    dimensions,
    gaps: gaps.slice(0, 4),
    nextBestAction: findNextBestAction(career, progress),
    remainingEffortMinutes,
    evidence: {
      passedAssessments,
      totalAssessments: assessments.length,
      completedProjects,
      minimumProjects: career.progressRules.minimumProjects,
      completedCareerTasks,
      totalCareerTasks: evidenceTasks.length,
    },
  };
}

export function estimateReadinessWeeks(
  report: JobReadinessReport,
  weeklyHours: number
): { min: number; max: number } | null {
  if (!Number.isFinite(weeklyHours) || weeklyHours <= 0) return null;
  const weeklyMinutes = weeklyHours * 60;
  return {
    min: Math.max(0, Math.ceil(report.remainingEffortMinutes.min / weeklyMinutes)),
    max: Math.max(0, Math.ceil(report.remainingEffortMinutes.max / weeklyMinutes)),
  };
}
