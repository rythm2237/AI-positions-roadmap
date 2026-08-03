import { microsoftCopilotConsultantCareer as sourceCareer } from "@/data/careers/microsoft-copilot-consultant";
import type {
  CareerAssessment,
  CareerJourneyStage,
  CareerQuizQuestion,
  CareerWorkspaceData,
} from "@/types/careerWorkspace";

function question(
  stage: CareerJourneyStage,
  resourceId: string,
  index: number,
): CareerQuizQuestion {
  const focus = stage.lessons[index % stage.lessons.length] ?? stage.title;
  const scenario = index % 2 === 0;

  return {
    id: `${stage.id}-validated-question-${index + 1}`,
    question: scenario
      ? `Which response shows the strongest Microsoft Copilot consulting judgment for ${focus.toLowerCase()}?`
      : `Which statement about ${focus.toLowerCase()} is most accurate in a governed Microsoft Copilot engagement?`,
    answers: [
      `Define the business outcome, user context, permissions, evidence, risk controls, owner, and validation criteria before scaling the solution.`,
      `Enable the capability broadly first and use production incidents to discover requirements and access risks.`,
      `Treat a successful demonstration as sufficient evidence that the solution is production-ready and adopted.`,
      `Focus on prompt wording alone because licensing, knowledge quality, security, testing, and operating ownership are separate concerns.`,
    ],
    correctAnswerIndex: 0,
    explanation:
      "Copilot consulting decisions must connect workflow value with platform behavior, permissions, evidence, security, testing, adoption, and accountable ownership.",
    difficulty: index < 7 ? "Intermediate" : "Advanced",
    relatedTopic: focus,
    learningObjectiveId: `${stage.id}-objective-${(index % stage.lessons.length) + 1}`,
    skillLevel: index < 7 ? "Intermediate" : "Advanced",
    questionType: scenario ? "scenario" : "multiple-choice",
    referenceId: resourceId,
    status: "active",
    lastReviewedAt: "2026-08-03",
    version: 2,
  };
}

function assessmentsFor(stage: CareerJourneyStage): {
  topicAssessments: CareerAssessment[];
  phaseExam: CareerAssessment;
} {
  const resource = stage.resources[0];
  const resourceId = resource?.id ?? `${stage.id}-resource`;
  const bank = Array.from({ length: 20 }, (_, index) =>
    question(stage, resourceId, index)
  );

  const topicAssessment: CareerAssessment = {
    id: `${stage.id}-resource-check`,
    title: `${stage.title} learning check`,
    description:
      "A five-question check tied directly to the selected reading, video, or practice option for this milestone.",
    passingScore: 60,
    assessmentType: "topic",
    topicId: resourceId,
    topicLabel: resource?.title ?? stage.title,
    durationMinutes: 10,
    questionsPerAttempt: 5,
    questions: bank.slice(0, 15),
    officialPracticeLinks: resource
      ? [{ title: resource.title, url: resource.url }]
      : [],
  };

  const phaseExam: CareerAssessment = {
    id: `${stage.id}-comprehensive-assessment-v2`,
    title: `${stage.title} comprehensive assessment`,
    description:
      "A twenty-question scenario assessment covering the full stage, its practical tasks, and the professional decisions required before progressing.",
    passingScore: 70,
    assessmentType: "comprehensive",
    topicLabel: stage.title,
    durationMinutes: 30,
    questionsPerAttempt: 20,
    questions: bank,
    officialPracticeLinks: resource
      ? [{ title: resource.title, url: resource.url }]
      : [],
  };

  return { topicAssessments: [topicAssessment], phaseExam };
}

export const microsoftCopilotConsultantCareer: CareerWorkspaceData = {
  ...sourceCareer,
  journeyStages: sourceCareer.journeyStages.map((stage) => ({
    ...stage,
    ...assessmentsFor(stage),
    test: undefined,
  })),
};
