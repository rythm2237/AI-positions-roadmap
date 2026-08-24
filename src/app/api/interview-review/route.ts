import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { consumeBetaAiQuota } from "@/lib/betaAiQuota";
import { INTERVIEW_PASSING_SCORE, INTERVIEW_RUBRIC, type InterviewAnswerReview, type InterviewCriterionId } from "@/lib/interviewEvidence";

function clampScore(value: unknown): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function fallbackReview(questionId: string, answer: string): InterviewAnswerReview {
  const lengthScore = Math.min(80, Math.max(35, Math.round(answer.trim().length / 8)));
  const criteria = INTERVIEW_RUBRIC.map((criterion) => ({
    id: criterion.id,
    score: Math.min(lengthScore, criterion.id === "evidence" ? 55 : lengthScore),
    feedback: "Preliminary fallback review only. Re-run when the AI reviewer is available for a full qualitative assessment.",
  }));
  const overallScore = Math.round(criteria.reduce((sum, item) => {
    const weight = INTERVIEW_RUBRIC.find((criterion) => criterion.id === item.id)?.weight ?? 0;
    return sum + item.score * (weight / 100);
  }, 0));
  return {
    questionId,
    overallScore,
    passed: overallScore >= INTERVIEW_PASSING_SCORE,
    criteria,
    strengths: ["A substantive answer was submitted for review."],
    improvements: ["Re-run the AI review before treating this as interview-ready evidence."],
    interviewerSummary: "Fallback assessment only; this is not equivalent to a full AI interview review.",
    reviewedAt: new Date().toISOString(),
    reviewer: "fallback",
  };
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return Response.json({ error: "Sign in to use AI interview review during Public Beta." }, { status: 401 });
    }

    const body = await request.json();
    const careerTitle = String(body.careerTitle || "").trim();
    const questionId = String(body.questionId || "").trim();
    const question = String(body.question || "").trim();
    const answer = String(body.answer || "").trim();
    const evidenceContext = String(body.evidenceContext || "").trim();
    if (!careerTitle || !questionId || !question || answer.length < 120) {
      return Response.json({ error: "Invalid interview review request." }, { status: 400 });
    }

    try {
      const quota = await consumeBetaAiQuota(authData.user.id, "interview_review");
      if (!quota.allowed) {
        return Response.json(
          { error: `Daily Public Beta interview-review limit reached (${quota.limit}). Try again tomorrow UTC.`, quota },
          { status: 429 },
        );
      }
    } catch (error) {
      console.error("Interview review quota check failed", error);
      return Response.json({ error: "AI interview review is temporarily unavailable while usage limits are checked." }, { status: 503 });
    }

    try {
      const { text } = await generateText({
        model: process.env.INTERVIEW_REVIEW_MODEL || "openai/gpt-4.1",
        maxOutputTokens: 1400,
        temperature: 0.2,
        prompt: `You are a senior hiring manager conducting a mock interview for ${careerTitle}.
Question: ${question}
Candidate answer: ${answer}
Verified evidence context available to the candidate: ${evidenceContext || "No additional verified evidence supplied."}

Score only what the answer actually demonstrates. Do not reward invented or unsupported claims. Return strict JSON with this shape:
{"criteria":[{"id":"relevance|evidence|depth|clarity|reflection","score":0-100,"feedback":"..."}],"strengths":["..."],"improvements":["..."],"interviewerSummary":"..."}
Use exactly one entry for each criterion id.`,
      });
      const parsed = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""));
      const criteria = INTERVIEW_RUBRIC.map((criterion) => {
        const item = Array.isArray(parsed.criteria) ? parsed.criteria.find((entry: { id?: InterviewCriterionId }) => entry?.id === criterion.id) : undefined;
        return { id: criterion.id, score: clampScore(item?.score), feedback: String(item?.feedback || "No feedback returned.") };
      });
      const overallScore = Math.round(criteria.reduce((sum, item) => {
        const weight = INTERVIEW_RUBRIC.find((criterion) => criterion.id === item.id)?.weight ?? 0;
        return sum + item.score * (weight / 100);
      }, 0));
      const review: InterviewAnswerReview = {
        questionId,
        overallScore,
        passed: overallScore >= INTERVIEW_PASSING_SCORE,
        criteria,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String).slice(0, 4) : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements.map(String).slice(0, 4) : [],
        interviewerSummary: String(parsed.interviewerSummary || ""),
        reviewedAt: new Date().toISOString(),
        reviewer: "ai",
      };
      return Response.json({ review });
    } catch {
      return Response.json({ review: fallbackReview(questionId, answer) });
    }
  } catch {
    return Response.json({ error: "Unable to review interview answer." }, { status: 500 });
  }
}
