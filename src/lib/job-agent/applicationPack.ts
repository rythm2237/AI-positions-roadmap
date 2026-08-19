import "server-only";

import { generateText, jsonSchema, Output, type JSONSchema7 } from "ai";
import { createClient } from "@/lib/supabase/server";
import { extractCVText } from "@/lib/intelligence/localCVAnalysis";
import type { Profile, ResumeRecord } from "@/types/identity";
import type { JobOpportunity } from "@/types/jobAgent";

export type CanonicalFact = { id: string; text: string };
export type GroundedText = { text: string; evidenceIds: string[] };
export type GeneratedApplicationPack = {
  professionalSummary: GroundedText;
  selectedSkills: string[];
  cvHighlights: GroundedText[];
  portfolioCases: Array<{ title: string; framing: "Founder" | "Product Builder" | "Independent Project" | "Selected Project" | "Case Study" | "Digital Transformation Project"; relevance: GroundedText }>;
  founderPositioning: { decision: "use" | "reframe" | "omit"; explanation: string };
  coverNote: GroundedText[];
  screeningAnswers: Array<{ question: string; answer: string | null; evidenceIds: string[]; requiresUserDecision: boolean }>;
  missingUserDecisions: string[];
};

const groundedSchema: JSONSchema7 = {
  type: "object", additionalProperties: false, required: ["text", "evidenceIds"],
  properties: { text: { type: "string" }, evidenceIds: { type: "array", items: { type: "string" } } },
};

const applicationPackSchema = jsonSchema<GeneratedApplicationPack>({
  type: "object", additionalProperties: false,
  required: ["professionalSummary", "selectedSkills", "cvHighlights", "portfolioCases", "founderPositioning", "coverNote", "screeningAnswers", "missingUserDecisions"],
  properties: {
    professionalSummary: groundedSchema,
    selectedSkills: { type: "array", items: { type: "string" } },
    cvHighlights: { type: "array", items: groundedSchema },
    portfolioCases: {
      type: "array", items: {
        type: "object", additionalProperties: false, required: ["title", "framing", "relevance"],
        properties: {
          title: { type: "string" },
          framing: { type: "string", enum: ["Founder", "Product Builder", "Independent Project", "Selected Project", "Case Study", "Digital Transformation Project"] },
          relevance: groundedSchema,
        },
      },
    },
    founderPositioning: {
      type: "object", additionalProperties: false, required: ["decision", "explanation"],
      properties: { decision: { type: "string", enum: ["use", "reframe", "omit"] }, explanation: { type: "string" } },
    },
    coverNote: { type: "array", items: groundedSchema },
    screeningAnswers: {
      type: "array", items: {
        type: "object", additionalProperties: false, required: ["question", "answer", "evidenceIds", "requiresUserDecision"],
        properties: {
          question: { type: "string" }, answer: { type: ["string", "null"] },
          evidenceIds: { type: "array", items: { type: "string" } }, requiresUserDecision: { type: "boolean" },
        },
      },
    },
    missingUserDecisions: { type: "array", items: { type: "string" } },
  },
} as JSONSchema7);

function factList(profile: Profile, resumeText: string): CanonicalFact[] {
  const facts: CanonicalFact[] = [];
  const add = (id: string, text: string | null | undefined) => { if (text?.trim()) facts.push({ id, text: text.trim() }); };
  add("profile.current_position", profile.current_position);
  add("profile.current_country", profile.current_country);
  if (profile.years_experience !== null) add("profile.years_experience", `${profile.years_experience} years of experience`);
  profile.skills.forEach((value, index) => add(`profile.skill.${index}`, value));
  profile.certificates.forEach((value, index) => add(`profile.certificate.${index}`, value));
  profile.languages.forEach((value, index) => add(`profile.language.${index}`, value));
  add("profile.target_career", profile.target_career);
  resumeText.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length >= 3).slice(0, 300).forEach((line, index) => add(`resume.line.${index}`, line));
  return facts;
}

function validateEvidence(pack: GeneratedApplicationPack, facts: CanonicalFact[]) {
  const valid = new Set(facts.map((fact) => fact.id));
  const grounded: GroundedText[] = [pack.professionalSummary, ...pack.cvHighlights, ...pack.coverNote, ...pack.portfolioCases.map((item) => item.relevance)];
  const ids = [...grounded.flatMap((item) => item.evidenceIds), ...pack.screeningAnswers.flatMap((item) => item.evidenceIds)];
  const unknown = ids.filter((id) => !valid.has(id));
  if (unknown.length) throw new Error(`APPLICATION_PACK_UNKNOWN_EVIDENCE:${unknown.slice(0, 5).join(",")}`);
  for (const item of grounded) {
    if (item.text.trim() && item.evidenceIds.length === 0) throw new Error("APPLICATION_PACK_UNGROUNDED_TEXT");
  }
}

async function resumeText(resume: ResumeRecord) {
  if (resume.file_type === "doc") throw new Error("MASTER_CV_DOC_REQUIRES_DOCX_OR_PDF");
  const supabase = await createClient();
  const download = await supabase.storage.from("resumes").download(resume.storage_path);
  if (download.error) throw download.error;
  const mime = resume.file_type === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const file = new File([await download.data.arrayBuffer()], `${resume.title}.${resume.file_type}`, { type: mime });
  return extractCVText(file);
}

export async function generateApplicationPack(input: { profile: Profile; resume: ResumeRecord; job: JobOpportunity & { job_description?: string | null; required_languages?: string[] } }) {
  const cvText = await resumeText(input.resume);
  if (!cvText.trim()) throw new Error("MASTER_CV_EMPTY");
  const facts = factList(input.profile, cvText);
  const factText = facts.map((fact) => `[${fact.id}] ${fact.text}`).join("\n");
  const result = await generateText({
    model: process.env.JOB_AGENT_MODEL ?? "openai/gpt-5.4-mini",
    maxOutputTokens: 9000,
    system: `You are the Job Application Pack Engine inside AI Career OS. Build a concise, ATS-friendly application package using ONLY the supplied canonical facts. Never invent or infer an employer, role, date, metric, degree, certification, skill, language, customer, funding, team size, legal status, salary history or project outcome. Every substantive generated statement must cite one or more canonical fact IDs in evidenceIds. If the vacancy asks for information that is absent, mark it as a gap or missing user decision. Do not answer consequential questions about salary, relocation, visa/sponsorship, legal declarations, medical/disability, conflicts, non-compete, interview availability or background checks unless the exact answer appears in canonical facts. Founder positioning may be used, reframed or omitted per vacancy, but facts must remain unchanged.`,
    prompt: `Vacancy\nCompany: ${input.job.company}\nRole: ${input.job.role}\nLocation: ${input.job.location ?? "Not specified"}\nDescription:\n${input.job.job_description ?? "No description stored."}\nDetected language requirements: ${(input.job.required_languages ?? []).join(", ") || "None detected"}\n\nCanonical facts:\n${factText}\n\nGenerate the application pack. Select only real, relevant projects or accomplishments that are present in the canonical facts. Screening answers should cover only common factual questions that are directly supportable.`,
    output: Output.object({ schema: applicationPackSchema }),
  });
  if (!result.output) throw new Error("APPLICATION_PACK_EMPTY");
  validateEvidence(result.output, facts);
  return { pack: result.output, facts };
}
