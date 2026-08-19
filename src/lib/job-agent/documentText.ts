import "server-only";

export async function extractStoredCVText(file: File): Promise<string> {
  if (file.size > 8 * 1024 * 1024) throw new Error("CV files must be 8 MB or smaller.");
  const buffer = Buffer.from(await file.arrayBuffer());
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }
  if (file.type === "application/pdf") {
    const worker = await import("pdf-parse/worker");
    const { PDFParse } = await import("pdf-parse");
    PDFParse.setWorker(worker.getData());
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      return result.text.trim();
    } finally {
      await parser.destroy();
    }
  }
  throw new Error("Only PDF and DOCX files are supported.");
}
