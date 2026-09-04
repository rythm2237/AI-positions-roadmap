import "server-only";

async function extractPdf(buffer: Buffer) {
  const worker = await import("pdf-parse/worker");
  const { PDFParse } = await import("pdf-parse");
  PDFParse.setWorker(worker.getData());
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    return (await parser.getText()).text;
  } finally {
    await parser.destroy();
  }
}

async function extractDocx(buffer: Buffer) {
  const mammoth = await import("mammoth");
  return (await mammoth.extractRawText({ buffer })).value;
}

export async function extractStoredCVText(file: File): Promise<string> {
  if (file.size > 8 * 1024 * 1024) throw new Error("CV files must be 8 MB or smaller.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const extracted = file.type === "application/pdf"
    ? await extractPdf(buffer)
    : file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ? await extractDocx(buffer)
      : buffer.toString("utf8");
  const normalized = extracted.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").trim();
  if (!normalized) throw new Error("MASTER_CV_EMPTY");
  return normalized.slice(0, 120_000);
}
