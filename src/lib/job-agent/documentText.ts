import "server-only";

function ensurePdfJsNodeGlobals() {
  const globals = globalThis as typeof globalThis & { DOMMatrix?: typeof DOMMatrix; Path2D?: typeof Path2D };
  if (typeof globals.DOMMatrix === "undefined") {
    class MinimalDOMMatrix {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      constructor(_init?: unknown) {}
      translate() { return this; }
      scale() { return this; }
      rotate() { return this; }
      multiply() { return this; }
      inverse() { return this; }
    }
    Object.assign(globalThis, { DOMMatrix: MinimalDOMMatrix });
  }
  if (typeof globals.Path2D === "undefined") {
    class MinimalPath2D { constructor(_path?: unknown) {} }
    Object.assign(globalThis, { Path2D: MinimalPath2D });
  }
}

export async function extractStoredCVText(file: File): Promise<string> {
  if (file.size > 8 * 1024 * 1024) throw new Error("CV files must be 8 MB or smaller.");
  const buffer = await file.arrayBuffer();
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value.trim();
  }
  if (file.type === "application/pdf") {
    ensurePdfJsNodeGlobals();
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
    const pages: string[] = [];
    for (let index = 1; index <= pdf.numPages; index++) {
      const page = await pdf.getPage(index);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
    }
    return pages.join("\n").trim();
  }
  throw new Error("Only PDF and DOCX files are supported.");
}
