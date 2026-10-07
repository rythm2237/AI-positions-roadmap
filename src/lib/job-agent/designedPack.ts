import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { FONTS } from "@/lib/applicationStudio/design.mjs";
import { renderPDF } from "@/lib/applicationStudio/pdfRenderer.mjs";
import type { DesignDefaults } from "@/lib/applicationStudio/defaults";
import type { GeneratedApplicationPack } from "./applicationPack";
export type DesignedDocument = { kind: string; title: string; template: string; design: unknown; portrait?: string | null; sections: { title: string; text: string }[] };
export async function renderAgentPDF(doc: DesignedDocument) {
  return renderPDF(doc, async (id: string) => {
    const font = FONTS.find(f => f.id === id) ?? FONTS[0];
    return Promise.all([font.file + ".ttf", font.file + "-Bold.ttf"].map(name => readFile(path.join(process.cwd(), "public/application-studio/fonts", name))));
  });
}
export function designedPack(input: { source: string; pack: GeneratedApplicationPack; defaults: DesignDefaults | null; name: string | null; email: string; role: string }) {
  const { pack, defaults } = input;
  const headings = /^(professional summary|summary|profile|work experience|professional experience|experience|employment|education|certifications|certificates|skills|technical skills|top skills|languages|projects|achievements|contact|berufserfahrung|ausbildung|kenntnisse|profil|compétences|expérience professionnelle|formation)\s*:?$/i;
  const sections: { title: string; text: string }[] = [];
  let current = { title: "Header", text: "" };
  for (const line of input.source.split("\n")) {
    if (headings.test(line.trim())) { if (current.text.trim()) sections.push(current); current = { title: line.trim().replace(/:$/, ""), text: "" }; }
    else current.text += (current.text ? "\n" : "") + line;
  }
  if (current.text.trim()) sections.push(current);
  // Retain the complete canonical CV. AI adds only a grounded summary; it never replaces employment history.
  const summary = sections.find(s => /^(professional summary|summary|profile|profil)$/i.test(s.title));
  if (summary) summary.text = pack.professionalSummary.text;
  else sections.splice(sections[0]?.title === "Header" ? 1 : 0, 0, { title: "Professional Summary", text: pack.professionalSummary.text });
  const style = defaults ?? { template: "Professional", design: null, portrait: null };
  const cv: DesignedDocument = { kind: "cv", title: "CV", ...style, sections };
  const letter = (kind: "cover" | "motivation", text: string): DesignedDocument => ({ kind, title: kind === "cover" ? "Cover Letter" : "Motivation Letter", ...(defaults?.letters[kind] ?? style), sections: [{ title: "", text: `${input.name || ""}\n${input.email}\n\n${text}` }] });
  return { cv, cover: letter("cover", pack.coverNote.map(p => p.text).join("\n\n")), motivation: letter("motivation", pack.motivationNote.map(p => p.text).join("\n\n")) };
}
export async function emailDesignedPack(input: { to: string; company: string; role: string; applicationId: string; version: string; documents: Record<string, DesignedDocument> }) {
  const key = process.env.RESEND_API_KEY, from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) throw new Error("RESEND_NOT_CONFIGURED");
  const filenames: Record<string, string> = { cv: "CV.pdf", cover: "Cover-Letter.pdf", motivation: "Motivation-Letter.pdf" };
  const attachments = await Promise.all(Object.entries(input.documents).map(async ([kind, doc]) => ({ filename: filenames[kind], content: Buffer.from(await (await renderAgentPDF(doc)).arrayBuffer()).toString("base64") })));
  const link = `https://www.airolepath.com/job-agent/applications/${encodeURIComponent(input.applicationId)}`;
  const body = { from, to: [input.to], subject: `Your application drafts · ${input.role} · ${input.company}`.replace(/[\r\n]/g, " ").slice(0, 180), text: `Your CV, cover letter and motivation letter drafts are attached, using your saved designs. Review all statements before applying: ${link}`, html: `<html lang="en"><body><h1>Your application drafts are ready</h1><p>Your CV and letters use your saved designs. Please review every statement, date and contact detail before applying.</p><p><a href="${link}">Review your application pack</a></p></body></html>`, attachments };
  const idempotencyKey = `designed-pack:${input.applicationId}:${input.version}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
    if (response.ok) return (await response.json() as { id: string }).id;
    if (!(response.status === 429 || response.status >= 500) || attempt === 2) throw new Error(`PACK_EMAIL_${response.status}`);
    await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
  }
  throw new Error("PACK_EMAIL_FAILED");
}
