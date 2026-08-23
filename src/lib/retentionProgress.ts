import { getApplicationMetrics, nextTrackerAction, type TrackedApplication } from "@/lib/applicationTracker";
import { getJobReadinessReport } from "@/lib/jobReadiness";
import type { CareerWorkspaceData, CareerWorkspaceProgress } from "@/types/careerWorkspace";

export interface RetentionSnapshot {
  version: 1;
  capturedAt: string;
  readinessScore: number;
  validationScore: number;
  projectScore: number;
  passedAssessments: number;
  completedProjects: number;
  completedCareerTasks: number;
  applications: number;
  interviews: number;
  offers: number;
}

export interface WeeklyProgressReport {
  current: RetentionSnapshot;
  previous?: RetentionSnapshot;
  readinessDelta: number;
  validationDelta: number;
  projectDelta: number;
  explanation: string[];
  nextBestAction: string;
  reminders: string[];
  milestone?: string;
  marketNote: string;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function retentionStorageKey(careerSlug: string): string {
  return `career_retention_snapshots__${careerSlug}`;
}

export function buildRetentionSnapshot(
  career: CareerWorkspaceData,
  progress: CareerWorkspaceProgress,
  applications: TrackedApplication[],
  now = new Date()
): RetentionSnapshot {
  const readiness = getJobReadinessReport(career, progress);
  const metrics = getApplicationMetrics(applications);
  const validation = readiness.dimensions.find((item) => item.id === "validation")?.score ?? 0;
  const projects = readiness.dimensions.find((item) => item.id === "projects")?.score ?? 0;
  return {
    version: 1,
    capturedAt: now.toISOString(),
    readinessScore: readiness.score,
    validationScore: validation,
    projectScore: projects,
    passedAssessments: readiness.evidence.passedAssessments,
    completedProjects: readiness.evidence.completedProjects,
    completedCareerTasks: readiness.evidence.completedCareerTasks,
    applications: metrics.total,
    interviews: metrics.interviews,
    offers: metrics.offers,
  };
}

function deltaLabel(value: number, label: string): string | null {
  if (!value) return null;
  return `${label} ${value > 0 ? "increased" : "decreased"} by ${Math.abs(value)} points.`;
}

function latestActivityAt(progress: CareerWorkspaceProgress, applications: TrackedApplication[]): Date | null {
  const timestamps = [
    ...Object.values(progress.resourceViewedAt ?? {}),
    ...(progress.assessmentAttempts ?? []).map((item) => item.submittedAt),
    ...applications.map((item) => item.lastActivityAt),
  ].filter(Boolean).map((value) => new Date(value).getTime()).filter(Number.isFinite);
  if (!timestamps.length) return progress.startedAt ? new Date(progress.startedAt) : null;
  return new Date(Math.max(...timestamps));
}

function milestoneFor(score: number, previousScore?: number): string | undefined {
  const thresholds = [25, 50, 75, 90];
  const crossed = thresholds.filter((threshold) => score >= threshold && (previousScore ?? -1) < threshold).pop();
  return crossed ? `Milestone reached: ${crossed}% evidence-based job readiness.` : undefined;
}

export function buildWeeklyProgressReport(
  career: CareerWorkspaceData,
  progress: CareerWorkspaceProgress,
  applications: TrackedApplication[],
  snapshots: RetentionSnapshot[],
  now = new Date()
): WeeklyProgressReport {
  const current = buildRetentionSnapshot(career, progress, applications, now);
  const previous = [...snapshots].reverse().find((item) => new Date(item.capturedAt).getTime() <= now.getTime() - WEEK_MS) ?? snapshots.at(-1);
  const readinessDelta = current.readinessScore - (previous?.readinessScore ?? current.readinessScore);
  const validationDelta = current.validationScore - (previous?.validationScore ?? current.validationScore);
  const projectDelta = current.projectScore - (previous?.projectScore ?? current.projectScore);
  const explanation = [
    deltaLabel(readinessDelta, "Overall readiness"),
    deltaLabel(validationDelta, "Validated-skill coverage"),
    deltaLabel(projectDelta, "Project evidence"),
  ].filter((value): value is string => Boolean(value));

  if (previous) {
    const assessmentGain = current.passedAssessments - previous.passedAssessments;
    const projectGain = current.completedProjects - previous.completedProjects;
    const applicationGain = current.applications - previous.applications;
    if (assessmentGain > 0) explanation.push(`${assessmentGain} additional assessment${assessmentGain === 1 ? "" : "s"} passed.`);
    if (projectGain > 0) explanation.push(`${projectGain} additional reviewed project${projectGain === 1 ? "" : "s"} completed.`);
    if (applicationGain > 0) explanation.push(`${applicationGain} application${applicationGain === 1 ? "" : "s"} added to the pipeline.`);
  }
  if (!explanation.length) explanation.push("No measurable readiness change is recorded yet for this comparison period.");

  const reminders: string[] = [];
  const overdue = applications.filter((item) => item.nextFollowUpAt && new Date(item.nextFollowUpAt) <= now && !["offer", "rejected", "withdrawn"].includes(item.stage));
  if (overdue.length) reminders.push(`${overdue.length} application follow-up${overdue.length === 1 ? " is" : "s are"} due.`);
  const lastActivity = latestActivityAt(progress, applications);
  if (lastActivity && now.getTime() - lastActivity.getTime() >= WEEK_MS) reminders.push("No tracked learning, assessment or application activity has been recorded in the last 7 days.");
  if (!reminders.length) reminders.push("No overdue follow-up or inactivity reminder right now.");

  const readiness = getJobReadinessReport(career, progress);
  const pipelineAction = nextTrackerAction(applications, now);
  const nextBestAction = applications.length && readiness.band === "application-ready"
    ? pipelineAction
    : `${readiness.nextBestAction.title}: ${readiness.nextBestAction.detail}`;

  return {
    current,
    previous,
    readinessDelta,
    validationDelta,
    projectDelta,
    explanation,
    nextBestAction,
    reminders,
    milestone: milestoneFor(current.readinessScore, previous?.readinessScore),
    marketNote: `Career Intelligence is the source of market signals for ${career.title}. Last curated career-content update: ${career.lastUpdated}.`,
  };
}

export function shouldCaptureWeeklySnapshot(snapshots: RetentionSnapshot[], now = new Date()): boolean {
  const latest = snapshots.at(-1);
  if (!latest) return true;
  return now.getTime() - new Date(latest.capturedAt).getTime() >= WEEK_MS;
}
