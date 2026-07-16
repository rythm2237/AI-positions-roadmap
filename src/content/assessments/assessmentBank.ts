import type { CareerAssessment, CareerQuizQuestion } from "@/types/careerWorkspace";

function question(id: string, prompt: string, correct: string, distractors: string[], explanation: string, topic: string): CareerQuizQuestion {
  return { id, question: prompt, answers: [correct, ...distractors], correctAnswerIndex: 0, explanation, difficulty: "Intermediate", relatedTopic: topic, learningObjectiveId: `${id}-objective`, skillLevel: "Intermediate", questionType: "multiple-choice", referenceId: "journey-ibm-skillsbuild", status: "active", lastReviewedAt: "2026-07-16", version: 1 };
}

export function createSectionQuestions(stageId: string, topic: string, goodSignal: string): CareerQuizQuestion[] {
  return [
    question(`${stageId}-q1`, `Which action best proves readiness for ${topic}?`, goodSignal, ["Watching a video without building anything", "Skipping documentation until interview week", "Choosing tools before defining the problem"], `The strongest signal for ${topic} is evidence of applied work, reflection, and measurable progress.`, topic),
    question(`${stageId}-q2`, `A learner is blocked in ${topic}. What should they do first?`, "Identify the smallest missing concept and practice it in a focused task", ["Restart the entire career path", "Add three new frameworks immediately", "Move to job applications without evidence"], "Focused review keeps momentum while protecting understanding.", topic),
    question(`${stageId}-q3`, `Which artifact is most useful for future interviews about ${topic}?`, "A concise note explaining trade-offs, mistakes, and decisions", ["A private bookmark list only", "An untested prompt copied from a blog", "A screenshot with no explanation"], "Interviewers evaluate reasoning and judgment, so artifacts should explain decisions.", topic),
    question(`${stageId}-q4`, `How should AI tools be used while learning ${topic}?`, "As a tutor and reviewer while still rebuilding the solution yourself", ["As a substitute for understanding", "Only to generate final answers", "To avoid writing tests"], "AI support is valuable when it accelerates feedback without replacing practice.", topic),
    question(`${stageId}-q5`, "What is the clearest completion signal for this station?", "The learner can explain and demonstrate the outcome without reading a script", ["The browser has many tabs open", "The learner saved a course link", "The station title sounds familiar"], "A station is complete when knowledge is usable, explainable, and visible through work.", topic),
  ];
}

export function createPhaseAssessment(stageId: string, title: string, topic: string): CareerAssessment {
  return { id: `${stageId}-phase-exam`, title, description: `Career OS assessment for ${topic}. These are original, non-official questions.`, passingScore: 80, durationMinutes: 12, questions: [
    question(`${stageId}-exam-q1`, `Which scenario best matches professional ${topic} judgment?`, "Choosing a simple, testable architecture before adding complexity", ["Adding agents to every workflow", "Ignoring latency until launch", "Relying on a single demo prompt"], "Professional judgment starts with clear requirements, testing, and maintainability.", topic),
    question(`${stageId}-exam-q2`, `What should be documented for ${topic}?`, "Assumptions, trade-offs, evaluation criteria, and failure modes", ["Only the final package list", "Nothing until a recruiter asks", "Only screenshots"], "Documentation should help future teammates understand the reasoning.", topic),
    question(`${stageId}-exam-q3`, `Which metric most improves trust in ${topic}?`, "A metric tied to user value and system quality", ["Total number of libraries", "Number of social posts", "Icon count"], "Useful metrics connect technical work to real outcomes.", topic),
    question(`${stageId}-exam-q4`, `What is the safest next step after a failed ${topic} assessment?`, "Review weak topics, rebuild a small example, and retry", ["Unlock every future station anyway", "Delete the result", "Memorize answer letters"], "Failed assessments should guide targeted review.", topic),
    question(`${stageId}-exam-q5`, "How should official vendor resources be treated?", "As trusted references for cloud and platform-specific behavior", ["As optional decoration only", "As proof generated questions are official", "As a reason to skip practice"], "Official resources are high-trust references, while Career OS questions remain non-official.", topic),
  ] };
}
