import { generateText } from "ai";
import { NextResponse } from "next/server";
import { PROJECT_PASSING_SCORE, PROJECT_RUBRIC, projectReviewLevel, type ProjectReview, type ProjectSubmission } from "@/lib/projectEvidence";

export const runtime = "nodejs";

function safeJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? text;
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Reviewer did not return JSON.");
  return JSON.parse(fenced.slice(start, end + 1));
}

function clampScore(value: unknown): number {
  const score = Number(value);
  return Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;
}

function fallbackReview(projectId: string, submission: ProjectSubmission): ProjectReview {
  const hasLink = Boolean(submission.artifactUrl?.trim() || submission.repositoryUrl?.trim());
  const evidenceDepth = submission.evidence.trim().length >= 180;
  const summaryDepth = submission.summary.trim().length >= 180;
  const reflectionDepth = submission.limitations.trim().length >= 80;
  const scores = {
    problem: summaryDepth ? 72 : 60,
    implementation: summaryDepth && hasLink ? 72 : 58,
    evidence: evidenceDepth && hasLink ? 74 : 55,
    quality: hasLink ? 68 : 50,
    reflection: reflectionDepth ? 72 : 58,
  };
  const overallScore = Math.round(PROJECT_RUBRIC.reduce((sum, item) => sum + scores[item.id] * (item.weight / 100), 0));
  return {
    projectId,
    overallScore,
    passed: overallScore >= PROJECT_PASSING_SCORE,
    level: projectReviewLevel(overallScore),
    criteria: PROJECT_RUBRIC.map((item) => ({ id: item.id, score: scores[item.id], feedback: `Automated fallback check for ${item.label.toLowerCase()}. Add more concrete, inspectable evidence for a stronger evaluation.` })),
    strengths: hasLink ? ["Submission includes inspectable project evidence."] : [],
    improvements: ["Strengthen measurable results, implementation detail, and evidence before treating this as recruiter-ready proof."],
    recruiterSummary: "Preliminary rubric check only. Re-run AI review when the reviewer service is available.",
    reviewedAt: new Date().toISOString(),
    reviewer: "fallback",
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as null | {
    careerTitle?: string;
    project?: { id?: string; title?: string; description?: string; deliverables?: string[]; skills?: string[] };
    submission?: ProjectSubmission;
  };

  if (!body?.project?.id || !body.project.title || !body.submission || body.submission.projectId !== body.project.id) {
    return NextResponse.json({ error: "Invalid project review request." }, { status: 400 });
  }

  const rubric = PROJECT_RUBRIC.map((item) => `${item.id}: ${item.label} (${item.weight}%) — ${item.description}`).join("\n");
  const prompt = `Evaluate this career project strictly as employment evidence. Do not reward claims that are not supported by the submitted evidence.\n\nCareer: ${body.careerTitle ?? "AI career"}\nProject: ${body.project.title}\nProject brief: ${body.project.description ?? ""}\nRequired deliverables: ${(body.project.deliverables ?? []).join("; ")}\nTarget skills: ${(body.project.skills ?? []).join(", ")}\n\nSubmission summary:\n${body.submission.summary}\n\nEvidence/results:\n${body.submission.evidence}\n\nArtifact URL: ${body.submission.artifactUrl ?? "none"}\nRepository URL: ${body.submission.repositoryUrl ?? "none"}\nLimitations/trade-offs:\n${body.submission.limitations}\n\nRubric:\n${rubric}\n\nReturn ONLY valid JSON with this exact shape: {"criteria":[{"id":"problem|implementation|evidence|quality|reflection","score":0,"feedback":"..."}],"strengths":["..."],"improvements":["..."],"recruiterSummary":"..."}. Score each criterion 0-100. Be demanding: 70 means portfolio-ready evidence, 85 means job-ready evidence.`;

  try {
    const result = await generateText({
      model: process.env.PROJECT_REVIEW_MODEL || "openai/gpt-4.1",
      system: "You are a senior hiring manager and technical portfolio reviewer. Evaluate evidence conservatively, explain gaps concretely, and never infer work that is not demonstrated.",
      prompt,
      maxOutputTokens: 1400,
      temperature: 0.2,
    });
    const parsed = safeJson(result.text) as { criteria?: Array<{ id?: string; score?: number; feedback?: string }>; strengths?: string[]; improvements?: string[]; recruiterSummary?: string };
    const criteria = PROJECT_RUBRIC.map((criterion) => {
      const supplied = parsed.criteria?.find((item) => item.id === criterion.id);
      return { id: criterion.id, score: clampScore(supplied?.score), feedback: supplied?.feedback?.trim() || "No criterion feedback returned." };
    });
    const overallScore = Math.round(PROJECT_RUBRIC.reduce((sum, rubricItem) => {
      const criterion = criteria.find((item) => item.id === rubricItem.id);
      return sum + (criterion?.score ?? 0) * (rubricItem.weight / 100);
    }, 0));
    const review: ProjectReview = {
      projectId: body.project.id,
      overallScore,
      passed: overallScore >= PROJECT_PASSING_SCORE,
      level: projectReviewLevel(overallScore),
      criteria,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 5) : [],
      recruiterSummary: parsed.recruiterSummary?.trim() || "No recruiter summary returned.",
      reviewedAt: new Date().toISOString(),
      reviewer: "ai",
    };
    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ review: fallbackReview(body.project.id, body.submission), warning: "AI reviewer unavailable; a conservative fallback review was used." });
  }
}
