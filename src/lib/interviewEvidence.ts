export type InterviewCriterionId = "relevance" | "evidence" | "depth" | "clarity" | "reflection";

export interface InterviewCriterion {
  id: InterviewCriterionId;
  label: string;
  description: string;
  weight: number;
}

export interface InterviewAnswerSubmission {
  questionId: string;
  question: string;
  answer: string;
  submittedAt: string;
}

export interface InterviewCriterionReview {
  id: InterviewCriterionId;
  score: number;
  feedback: string;
}

export interface InterviewAnswerReview {
  questionId: string;
  overallScore: number;
  passed: boolean;
  criteria: InterviewCriterionReview[];
  strengths: string[];
  improvements: string[];
  interviewerSummary: string;
  reviewedAt: string;
  reviewer: "ai" | "fallback";
}

export const INTERVIEW_PASSING_SCORE = 70;
export const INTERVIEW_STRONG_SCORE = 85;

export const INTERVIEW_RUBRIC: InterviewCriterion[] = [
  { id: "relevance", label: "Question relevance", description: "Directly answers what was asked and stays role-specific.", weight: 20 },
  { id: "evidence", label: "Evidence", description: "Uses concrete, truthful examples and does not invent unsupported experience.", weight: 30 },
  { id: "depth", label: "Technical/business depth", description: "Explains decisions, trade-offs, constraints and outcomes at the expected role level.", weight: 25 },
  { id: "clarity", label: "Communication", description: "Structured, concise and understandable to an interviewer.", weight: 15 },
  { id: "reflection", label: "Reflection", description: "Shows learning, limitations and realistic next improvements.", weight: 10 },
];

export function validateInterviewAnswer(answer: string): string | null {
  const trimmed = answer.trim();
  if (trimmed.length < 120) return "Provide a substantive answer of at least 120 characters.";
  if (trimmed.length > 6000) return "Keep the answer below 6000 characters.";
  return null;
}

export function interviewEvidenceStorageKey(careerSlug: string): string {
  return `career_interview_evidence__${careerSlug}`;
}
