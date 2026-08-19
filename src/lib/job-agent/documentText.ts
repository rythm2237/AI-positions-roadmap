import "server-only";

type ExtractionResponse = { text?: string; error?: string };

function extractionOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export async function extractStoredCVText(file: File): Promise<string> {
  if (file.size > 8 * 1024 * 1024) throw new Error("CV files must be 8 MB or smaller.");
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${extractionOrigin()}/api/cv-analyzer/extract`, {
    method: "POST",
    body,
    cache: "no-store",
  });
  const data = await response.json() as ExtractionResponse;
  if (!response.ok || !data.text?.trim()) {
    throw new Error(data.error || "MASTER_CV_EMPTY");
  }
  return data.text.trim();
}
