import type { CareerWorkspaceData } from "@/types/careerWorkspace";

function ensurePdfJsNodeGlobals() {
  const globals = globalThis as typeof globalThis & {
    DOMMatrix?: typeof DOMMatrix;
    Path2D?: typeof Path2D;
  };
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

export async function extractCVText(file: File): Promise<string> {
  if (file.size > 5 * 1024 * 1024) throw new Error("CV files must be 5 MB or smaller.");
  const buffer = await file.arrayBuffer();
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value.trim();
  }
  if (file.type === "application/pdf") {
    // pdfjs 6 references browser geometry globals during module initialization even when
    // we only use server-side text extraction. Minimal no-rendering shims are sufficient
    // for getTextContent and avoid requiring a native canvas package in Vercel functions.
    ensurePdfJsNodeGlobals();
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer), disableWorker: true }).promise;
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

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ");
export function analyzeCVLocally(text: string, career: CareerWorkspaceData) {
  const haystack = normalize(text);
  const stages = career.journeyStages.map(stage => {
    const terms = [stage.title, ...stage.lessons, ...stage.tasks.map(task => task.title)].flat().flatMap(value => normalize(value).split(" ")).filter(term => term.length > 3);
    const unique = [...new Set(terms)];
    const matches = unique.filter(term => haystack.includes(term));
    return { stageId: stage.id, title: stage.title, matches, coverage: unique.length ? Math.round(matches.length / unique.length * 100) : 0 };
  });
  const strengths = stages.filter(stage => stage.coverage >= 20).sort((a, b) => b.coverage - a.coverage);
  const gaps = stages.filter(stage => stage.coverage < 20);
  const keywords = [...new Set(stages.flatMap(stage => stage.matches))];
  return { skillCoverage: stages.length ? Math.round(stages.reduce((sum, stage) => sum + stage.coverage, 0) / stages.length) : 0, strengths, gaps, keywords, unclearEvidence: gaps.map(stage => `${stage.title} may be present in your experience but is not clearly evidenced in this CV.`) };
}
