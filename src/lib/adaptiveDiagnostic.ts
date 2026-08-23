import type { CareerJourneyStage, CareerQuizQuestion, CareerWorkspaceData } from "@/types/careerWorkspace";

export type DiagnosticPlacement = "foundation-gap" | "priority" | "validate";

export interface BaselineDiagnosticQuestion {
  id: string;
  stageId: string;
  stageTitle: string;
  question: string;
  answers: string[];
  correctAnswerIndex: number;
  relatedTopic: string;
}

export interface StageDiagnosticResult {
  stageId: string;
  stageTitle: string;
  stageOrder: number;
  score: number;
  correct: number;
  answered: number;
  placement: DiagnosticPlacement;
  recommendation: string;
}

export interface BaselineDiagnosticResult {
  version: 1;
  completedAt: string;
  overallScore: number;
  answered: number;
  totalQuestions: number;
  recommendedStartStageId?: string;
  stageResults: StageDiagnosticResult[];
}

const MAX_QUESTIONS = 12;

function stageQuestions(stage: CareerJourneyStage): CareerQuizQuestion[] {
  const assessments = [
    ...(stage.topicAssessments ?? []),
    ...(stage.phaseExam ? [stage.phaseExam] : []),
  ];
  const seen = new Set<string>();
  const questions: CareerQuizQuestion[] = [];
  for (const assessment of assessments) {
    for (const question of assessment.questions) {
      if (question.status === "retired" || seen.has(question.id)) continue;
      seen.add(question.id);
      questions.push(question);
    }
  }
  return questions;
}

export function buildBaselineDiagnostic(career: CareerWorkspaceData): BaselineDiagnosticQuestion[] {
  const stages = career.journeyStages
    .filter((stage) => stageQuestions(stage).length > 0)
    .sort((a, b) => a.order - b.order);

  const selected: BaselineDiagnosticQuestion[] = [];
  for (let round = 0; round < 2 && selected.length < MAX_QUESTIONS; round += 1) {
    for (const stage of stages) {
      const question = stageQuestions(stage)[round];
      if (!question) continue;
      selected.push({
        id: question.id,
        stageId: stage.id,
        stageTitle: stage.title,
        question: question.question,
        answers: question.answers,
        correctAnswerIndex: question.correctAnswerIndex,
        relatedTopic: question.relatedTopic,
      });
      if (selected.length >= MAX_QUESTIONS) break;
    }
  }
  return selected;
}

function placementFor(score: number): DiagnosticPlacement {
  if (score >= 75) return "validate";
  if (score >= 50) return "priority";
  return "foundation-gap";
}

function recommendationFor(placement: DiagnosticPlacement): string {
  if (placement === "validate") return "Fast-track learning review, then pass the formal assessment before this stage counts as validated evidence.";
  if (placement === "priority") return "Keep this stage in the active roadmap and focus on weak topics before assessment.";
  return "Treat this as a foundation gap and complete the essential learning before attempting the formal assessment.";
}

export function scoreBaselineDiagnostic(
  career: CareerWorkspaceData,
  questions: BaselineDiagnosticQuestion[],
  answers: Record<string, number>
): BaselineDiagnosticResult {
  const stages = new Map<string, { stage: CareerJourneyStage; questions: BaselineDiagnosticQuestion[] }>();
  for (const question of questions) {
    const stage = career.journeyStages.find((item) => item.id === question.stageId);
    if (!stage) continue;
    const current = stages.get(stage.id) ?? { stage, questions: [] };
    current.questions.push(question);
    stages.set(stage.id, current);
  }

  const stageResults = [...stages.values()]
    .map(({ stage, questions: stageQs }) => {
      const answeredQuestions = stageQs.filter((question) => Number.isInteger(answers[question.id]));
      const correct = answeredQuestions.filter((question) => answers[question.id] === question.correctAnswerIndex).length;
      const score = answeredQuestions.length ? Math.round((correct / answeredQuestions.length) * 100) : 0;
      const placement = placementFor(score);
      return {
        stageId: stage.id,
        stageTitle: stage.title,
        stageOrder: stage.order,
        score,
        correct,
        answered: answeredQuestions.length,
        placement,
        recommendation: recommendationFor(placement),
      } satisfies StageDiagnosticResult;
    })
    .sort((a, b) => a.stageOrder - b.stageOrder);

  const answered = questions.filter((question) => Number.isInteger(answers[question.id])).length;
  const correct = questions.filter((question) => answers[question.id] === question.correctAnswerIndex).length;
  const overallScore = answered ? Math.round((correct / answered) * 100) : 0;
  const recommendedStart = stageResults.find((stage) => stage.placement !== "validate") ?? stageResults[0];

  return {
    version: 1,
    completedAt: new Date().toISOString(),
    overallScore,
    answered,
    totalQuestions: questions.length,
    recommendedStartStageId: recommendedStart?.stageId,
    stageResults,
  };
}

export function adaptiveDiagnosticStorageKey(careerSlug: string): string {
  return `career_baseline_diagnostic__${careerSlug}`;
}
