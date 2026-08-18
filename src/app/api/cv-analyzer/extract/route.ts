import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "txt"]);
const require = createRequire(import.meta.url);
const SELF_TEST_PDF_BASE64 = "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA1IDAgUiA+PiA+PiAvQ29udGVudHMgNCAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCA1NiA+PgpzdHJlYW0KQlQgL0YxIDE4IFRmIDcyIDcyMCBUZCAoQ1YgQW5hbHl6ZXIgUERGIHNlbGYtdGVzdCkgVGogRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYSA+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQxIDAwMDAwIG4gCjAwMDAwMDAzNDcgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgo0MTcKJSVFT0YK";

function extensionOf(name: string) {
  return name.toLowerCase().split(".").pop() ?? "";
}

function ensurePdfJsServerGlobals() {
  const scope = globalThis as Record<string, unknown>;
  if (typeof scope.DOMMatrix !== "undefined") return;

  class ServerDOMMatrix {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
    is2D = true;

    constructor(init?: number[] | Float32Array | Float64Array) {
      if (init && init.length >= 6) {
        [this.a, this.b, this.c, this.d, this.e, this.f] = Array.from(init).slice(0, 6);
      }
    }

    get isIdentity() {
      return this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 && this.e === 0 && this.f === 0;
    }

    multiplySelf(other: ServerDOMMatrix) {
      const { a, b, c, d, e, f } = this;
      this.a = a * other.a + c * other.b;
      this.b = b * other.a + d * other.b;
      this.c = a * other.c + c * other.d;
      this.d = b * other.c + d * other.d;
      this.e = a * other.e + c * other.f + e;
      this.f = b * other.e + d * other.f + f;
      return this;
    }

    preMultiplySelf(other: ServerDOMMatrix) {
      const current = new ServerDOMMatrix([this.a, this.b, this.c, this.d, this.e, this.f]);
      this.a = other.a;
      this.b = other.b;
      this.c = other.c;
      this.d = other.d;
      this.e = other.e;
      this.f = other.f;
      return this.multiplySelf(current);
    }

    translateSelf(tx = 0, ty = 0) {
      return this.multiplySelf(new ServerDOMMatrix([1, 0, 0, 1, tx, ty]));
    }

    scaleSelf(scaleX = 1, scaleY = scaleX) {
      return this.multiplySelf(new ServerDOMMatrix([scaleX, 0, 0, scaleY, 0, 0]));
    }

    rotateSelf(angle = 0) {
      const radians = (angle * Math.PI) / 180;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      return this.multiplySelf(new ServerDOMMatrix([cos, sin, -sin, cos, 0, 0]));
    }

    invertSelf() {
      const determinant = this.a * this.d - this.b * this.c;
      if (!determinant) return this;
      const { a, b, c, d, e, f } = this;
      this.a = d / determinant;
      this.b = -b / determinant;
      this.c = -c / determinant;
      this.d = a / determinant;
      this.e = (c * f - d * e) / determinant;
      this.f = (b * e - a * f) / determinant;
      return this;
    }

    toFloat32Array() {
      return new Float32Array([this.a, this.b, this.c, this.d, this.e, this.f]);
    }

    toFloat64Array() {
      return new Float64Array([this.a, this.b, this.c, this.d, this.e, this.f]);
    }
  }

  scope.DOMMatrix = ServerDOMMatrix;
}

async function extractPdf(buffer: Buffer) {
  ensurePdfJsServerGlobals();
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const workerPath = require.resolve("pdfjs-dist/build/pdf.worker.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

  const document = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      try {
        const content = await page.getTextContent();
        const text = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .filter(Boolean)
          .join(" ");
        pages.push(text);
      } finally {
        page.cleanup();
      }
    }
  } finally {
    document.cleanup();
  }

  return pages.join("\n");
}

async function extractDocx(buffer: Buffer) {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function normalizeText(text: string) {
  return text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").trim();
}

export async function GET() {
  try {
    const text = normalizeText(await extractPdf(Buffer.from(SELF_TEST_PDF_BASE64, "base64")));
    const ok = text.includes("CV Analyzer PDF self-test");
    return NextResponse.json(
      { ok, parser: "pdfjs-dist", extracted: text },
      { status: ok ? 200 : 500, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("CV PDF self-test failed", error);
    return NextResponse.json(
      { ok: false, parser: "pdfjs-dist", error: message },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a CV file to continue." }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "CV files must be 8 MB or smaller." }, { status: 413 });
    }

    const extension = extensionOf(file.name);
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json({ error: "Supported CV formats are PDF, DOCX, and TXT." }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (extension === "pdf") text = await extractPdf(buffer);
    else if (extension === "docx") text = await extractDocx(buffer);
    else text = buffer.toString("utf8");

    const normalized = normalizeText(text);
    if (!normalized) {
      return NextResponse.json({ error: "We could not extract readable text from this CV." }, { status: 422 });
    }

    return NextResponse.json({
      fileName: file.name,
      fileType: extension,
      characterCount: normalized.length,
      text: normalized.slice(0, 120_000),
    });
  } catch (error) {
    console.error("CV extraction failed", error);
    return NextResponse.json({ error: "CV extraction failed. Try another file or use the guided CV builder." }, { status: 500 });
  }
}
