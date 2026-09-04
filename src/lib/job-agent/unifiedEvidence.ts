import "server-only";

import { extractStoredCVText } from "./documentText";
import { evidenceFromMasterCv, evidenceFromProfile, mergeEvidence } from "./evidence";
import type { CareerEvidenceItem } from "../../types/jobAgent";
import type { Profile, ResumeRecord } from "../../types/identity";
import type { createClient } from "../supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;
type EvidenceRow = { id: string; source_type: CareerEvidenceItem["sourceType"]; source_id: string | null; evidence_type: CareerEvidenceItem["evidenceType"]; label: string; value: string; confidence: number; duration_months: number | null; provenance: Record<string, unknown>; fingerprint: string };

const toDomain = (row: EvidenceRow): CareerEvidenceItem => ({ id: row.id, sourceType: row.source_type, sourceId: row.source_id, evidenceType: row.evidence_type, label: row.label, value: row.value, confidence: Number(row.confidence), durationMonths: row.duration_months, provenance: row.provenance, fingerprint: row.fingerprint });
const toRow = (userId: string, item: CareerEvidenceItem) => ({ user_id: userId, source_type: item.sourceType, source_id: item.sourceId, evidence_type: item.evidenceType, label: item.label, value: item.value, confidence: item.confidence, duration_months: item.durationMonths, provenance: item.provenance, fingerprint: item.fingerprint, active: true, updated_at: new Date().toISOString() });

export async function loadUnifiedEvidence(supabase: SupabaseClient, userId: string, profile: Profile): Promise<{ evidence: CareerEvidenceItem[]; resume: ResumeRecord | null; warnings: string[] }> {
  const warnings: string[] = [];
  const resumeResult = await supabase.from("resumes").select("id,title,target_career,version,file_type,storage_path,uploaded_at").eq("user_id", userId).order("uploaded_at", { ascending: false }).limit(1).maybeSingle<ResumeRecord>();
  const resume = resumeResult.data ?? null;
  const profileEvidence = evidenceFromProfile(profile);
  let masterCvEvidence: CareerEvidenceItem[] = [];

  if (resume) {
    try {
      if (resume.file_type === "doc") throw new Error("MASTER_CV_DOC_REQUIRES_DOCX_OR_PDF");
      const download = await supabase.storage.from("resumes").download(resume.storage_path);
      if (download.error) throw download.error;
      const mime = resume.file_type === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const file = new File([await download.data.arrayBuffer()], `${resume.title}.${resume.file_type}`, { type: mime });
      masterCvEvidence = evidenceFromMasterCv(resume.id, await extractStoredCVText(file));
    } catch (error) {
      warnings.push(error instanceof Error ? error.message.slice(0, 160) : "MASTER_CV_EVIDENCE_UNAVAILABLE");
    }
  } else {
    warnings.push("MASTER_CV_MISSING");
  }

  const generated = mergeEvidence(profileEvidence, masterCvEvidence);
  if (generated.length) {
    const persisted = await supabase.from("job_evidence_items").upsert(generated.map((entry) => toRow(userId, entry)), { onConflict: "user_id,fingerprint" });
    if (persisted.error) warnings.push(`EVIDENCE_PERSIST_FAILED:${persisted.error.code}`);
  }
  const current = await supabase.from("job_evidence_items").select("id,source_type,source_id,evidence_type,label,value,confidence,duration_months,provenance,fingerprint").eq("user_id", userId).eq("active", true).returns<EvidenceRow[]>();
  if (current.error) {
    warnings.push(`EVIDENCE_READ_FAILED:${current.error.code}`);
    return { evidence: generated, resume, warnings };
  }
  const relevant = (current.data ?? []).filter((row) => row.source_type !== "master_cv" || row.source_id === resume?.id);
  return { evidence: mergeEvidence(relevant.map(toDomain), generated), resume, warnings };
}
