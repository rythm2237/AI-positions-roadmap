import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "txt"]);

function extensionOf(name: string) {
  return name.toLowerCase().split(".").pop() ?? "";
}

async function extractPdf(buffer: Buffer) {
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
  }

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
