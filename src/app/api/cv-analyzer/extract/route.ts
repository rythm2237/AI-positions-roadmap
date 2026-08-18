import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "txt"]);

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
  const document = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .filter(Boolean)
      .join(" ");
    pages.push(text);
    page.cleanup();
  }

  document.cleanup();
  await document.destroy();
  return pages.join("\n");
}

async function extractDocx(buffer: Buffer) {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
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

    const normalized = text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").trim();
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
