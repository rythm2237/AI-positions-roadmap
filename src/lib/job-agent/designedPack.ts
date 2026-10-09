import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {fitCV} from "@/lib/applicationStudio/contentEngine.mjs";
import { FONTS } from "@/lib/applicationStudio/design.mjs";
import { renderPDF } from "@/lib/applicationStudio/pdfRenderer.mjs";
import type { DesignDefaults } from "@/lib/applicationStudio/defaults";
import type { GeneratedApplicationPack } from "./applicationPack";
export type DesignedDocument = { kind: string; title: string; template: string; design: unknown; portrait?: string | null; sections: { title: string; text: string }[]; cvGenerationVersion?: number; maxPages?: number; contentPlan?: unknown; measure?: boolean };
export async function renderAgentPDF(doc: DesignedDocument & {measure:true}):Promise<{pages:number}>;
export async function renderAgentPDF(doc: DesignedDocument):Promise<Blob>;
export async function renderAgentPDF(doc: DesignedDocument):Promise<Blob|{pages:number}> {
  return renderPDF(doc, async (id: string) => {
    const font = FONTS.find(f => f.id === id) ?? FONTS[0];
    return Promise.all([font.file + ".ttf", font.file + "-Bold.ttf"].map(name => readFile(path.join(process.cwd(), "public/application-studio/fonts", name))));
  });
}
export async function designedPack(input: { source: string; pack: GeneratedApplicationPack; defaults: DesignDefaults | null; name: string | null; email: string; role: string; vacancy?: string }) {
  const { pack, defaults } = input;
  const style = defaults ?? { template: "Professional", design: null, portrait: null };
  const plan=await fitCV({source:input.source,targetRole:input.role,vacancy:input.vacancy||'',template:style.template,design:style.design,portrait:style.portrait},async (sections: {title:string;text:string}[])=>{
    const measurement=await renderAgentPDF({kind:'cv',title:'CV',...style,sections,measure:true});
    return (measurement as {pages:number}).pages;
  });
  // Source career history remains in the canonical resume; this asset stores a selective application view.
  // Do not inject pack summary solely because its cited IDs exist: that does not prove semantic support.
  const cv: DesignedDocument = { kind: "cv", title: "CV", ...style, sections:plan.sections, cvGenerationVersion:2, maxPages:2, contentPlan:plan };
  const letter = (kind: "cover" | "motivation", text: string): DesignedDocument => ({ kind, title: kind === "cover" ? "Cover Letter" : "Motivation Letter", ...(defaults?.letters[kind] ?? style), sections: [{ title: "", text: `${input.name || ""}\n${input.email}\n\n${text}` }] });
  return { cv, cover: letter("cover", pack.coverNote.map(p => p.text).join("\n\n")), motivation: letter("motivation", pack.motivationNote.map(p => p.text).join("\n\n")) };
}
export async function emailDesignedPack(input: { to: string; company: string; role: string; applicationId: string; version: string; documents: Record<string, DesignedDocument> }) {
  const key = process.env.RESEND_API_KEY, from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) throw new Error("RESEND_NOT_CONFIGURED");
  const filenames: Record<string, string> = { cv: "CV.pdf", cover: "Cover-Letter.pdf", motivation: "Motivation-Letter.pdf" };
  const attachments = await Promise.all(Object.entries(input.documents).map(async ([kind, doc]) => ({ filename: filenames[kind], content: Buffer.from(await ((await renderAgentPDF(doc)) as Blob).arrayBuffer()).toString("base64") })));
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
