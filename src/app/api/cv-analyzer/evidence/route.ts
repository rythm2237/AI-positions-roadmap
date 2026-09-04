import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { evidenceFromCvAnalyzer } from "@/lib/job-agent/evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to save CV evidence." }, { status: 401 });
  let payload: Record<string, unknown>;
  try { payload = await request.json() as Record<string, unknown>; }
  catch { return NextResponse.json({ error: "Invalid evidence payload." }, { status: 400 }); }
  const overall = Number(payload.overall);
  if (!Number.isFinite(overall) || overall < 0 || overall > 100) return NextResponse.json({ error: "Invalid analysis score." }, { status: 422 });
  const strengths = Array.isArray(payload.strengths) ? payload.strengths.map((value) => text(value, 500)).filter(Boolean).slice(0, 20) : [];
  const sourceId = `cv-analysis:${randomUUID()}`;
  const evidence = evidenceFromCvAnalyzer({ sourceId, skills: text(payload.skills, 20_000), languages: text(payload.languages, 5_000), certifications: text(payload.certifications, 10_000), projects: text(payload.projects, 30_000), experience: text(payload.experience, 50_000), overall, strengths });
  const result = await supabase.from("job_evidence_items").upsert(evidence.map((item) => ({ user_id: user.id, source_type: item.sourceType, source_id: item.sourceId, evidence_type: item.evidenceType, label: item.label, value: item.value, confidence: item.confidence, duration_months: item.durationMonths, provenance: item.provenance, fingerprint: item.fingerprint, active: true, updated_at: new Date().toISOString() })), { onConflict: "user_id,fingerprint" });
  if (result.error) {
    console.error("CV Analyzer evidence persistence failed", { userId: user.id, code: result.error.code });
    return NextResponse.json({ error: "CV evidence could not be saved." }, { status: 500 });
  }
  return NextResponse.json({ saved: evidence.length, sourceId }, { headers: { "Cache-Control": "no-store" } });
}
