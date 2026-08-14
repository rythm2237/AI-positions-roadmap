const LEGACY_STAGE_FALLBACK = /^Describe a situation where you applied .+, the trade-offs you considered and the evidence you produced\.$/i;

export function createCareerInterviewQuestionFallbacks(careerTitle: string) {
  const role = careerTitle.trim() || "this career";
  return [
    `Walk me through a ${role} initiative: what problem did you define, what did you own, and how did you measure the result?`,
    `How would you prioritize competing ${role} opportunities when impact, feasibility, data quality, and risk point in different directions?`,
    `Describe a time stakeholders disagreed about an important decision. How did you surface trade-offs and reach a defensible outcome?`,
    `Tell me about a result that did not meet its success criteria. What evidence changed your assessment and what did you do next?`,
    `How do you decide what must remain under human review, and how do you document governance and escalation boundaries?`,
    `Give an example of working with incomplete or unreliable data. Which assumptions did you make explicit and how did you validate them?`,
    `How would you explain a complex ${role} recommendation to an executive who needs a clear decision, risk, and business outcome?`,
    `What employer-reviewable evidence best demonstrates your readiness for a ${role} role, and what are its limitations?`,
    `How would you respond if users resisted a new process or system after a technically successful pilot?`,
    `What would your first 90 days in a ${role} position look like, and which signals would show that you are making progress?`,
  ];
}

export function getReviewableInterviewQuestions(
  careerTitle: string,
  questions: string[],
  minimum = 10,
) {
  const fallbacks = createCareerInterviewQuestionFallbacks(careerTitle);
  const repaired = questions
    .map((question, index) => LEGACY_STAGE_FALLBACK.test(question.trim())
      ? fallbacks[index % fallbacks.length]
      : question.trim())
    .filter(Boolean);
  const unique = [...new Map(repaired.map((question) => [question.toLocaleLowerCase("en"), question])).values()];

  for (let index = 0; unique.length < minimum; index += 1) {
    const fallback = fallbacks[index % fallbacks.length];
    if (!unique.some((question) => question.toLocaleLowerCase("en") === fallback.toLocaleLowerCase("en"))) {
      unique.push(fallback);
    }
  }

  return unique;
}
