import { createHash } from "node:crypto";
import * as mammoth from "mammoth";
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import { WorkspaceError } from "./contracts";

export const AIW_FILE_BUCKET = "ai-workspace-private";
export const AIW_MAX_FILE_BYTES = 10 * 1024 * 1024;
export const AIW_MAX_EXTRACTED_CHARS = 1_500_000;
export const AIW_MAX_CHUNKS = 400;

export const AIW_ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/csv",
]);

export function sha256Hex(buffer: Uint8Array): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function cleanText(value: string): string {
  return value.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").trim();
}

export async function extractKnowledgeText(buffer: Buffer, mimeType: string): Promise<string> {
  if (!AIW_ALLOWED_MIME.has(mimeType)) throw new WorkspaceError("UNSUPPORTED_FILE_TYPE", 415);
  let text = "";
  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    try {
      text = (await parser.getText()).text;
    } finally {
      await parser.destroy();
    }
  } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    text = (await mammoth.extractRawText({ buffer })).value;
  } else {
    text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  }
  const cleaned = cleanText(text);
  if (!cleaned) throw new WorkspaceError("FILE_HAS_NO_EXTRACTABLE_TEXT", 422);
  if (cleaned.length > AIW_MAX_EXTRACTED_CHARS) throw new WorkspaceError("EXTRACTED_TEXT_TOO_LARGE", 413);
  return cleaned;
}

export function chunkKnowledgeText(text: string, target = 5200, overlap = 500): string[] {
  if (target < 1000 || target > 7500 || overlap < 0 || overlap >= target) throw new Error("INVALID_CHUNK_POLICY");
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length && chunks.length < AIW_MAX_CHUNKS) {
    let end = Math.min(text.length, start + target);
    if (end < text.length) {
      const paragraph = text.lastIndexOf("\n\n", end);
      const newline = text.lastIndexOf("\n", end);
      const space = text.lastIndexOf(" ", end);
      const boundary = Math.max(paragraph, newline, space);
      if (boundary > start + Math.floor(target * 0.6)) end = boundary;
    }
    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk.slice(0, 8000));
    if (end >= text.length) break;
    const next = Math.max(start + 1, end - overlap);
    start = next;
  }
  if (start < text.length && chunks.length >= AIW_MAX_CHUNKS) throw new WorkspaceError("TOO_MANY_FILE_CHUNKS", 413);
  return chunks;
}

export function safeOriginalName(value: string): string {
  const normalized = value.replace(/[\\/\u0000-\u001f\u007f]/g, "_").trim().slice(0, 500);
  return normalized || "document";
}
