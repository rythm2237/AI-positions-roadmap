import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "txt"]);
const SELF_TEST_PDF_BASE64 = "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA1IDAgUiA+PiA+PiAvQ29udGVudHMgNCAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCA1NiA+PgpzdHJlYW0KQlQgL0YxIDE4IFRmIDcyIDcyMCBUZCAoQ1YgQW5hbHl6ZXIgUERGIHNlbGYtdGVzdCkgVGogRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYSA+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQxIDAwMDAwIG4gCjAwMDAwMDAzNDcgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgo0MTcKJSVFT0YK";

function extensionOf(name: string) {
  return name.toLowerCase().split(".").pop() ?? "";
}

async function extractPdf(buffer: Buffer) {
  const worker = await import("pdf-parse/worker");
  const { PDFParse } = await import("pdf-parse");

  PDFParse.setWorker(worker.getData());
  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
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
      { ok, parser: "pdf-parse@2.4.5", extracted: text },
      { status: ok ? 200 : 500, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("CV PDF self-test failed", error);
    return NextResponse.json(
      { ok: false, parser: "pdf-parse@2.4.5", error: message },
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
    const text =
      extension === "pdf"
        ? await extractPdf(buffer)
        : extension === "docx"
          ? await extractDocx(buffer)
          : buffer.toString("utf8");

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
    return NextResponse.json(
      { error: "CV extraction failed. Try another file or use the guided CV builder." },
      { status: 500 },
    );
  }
}
