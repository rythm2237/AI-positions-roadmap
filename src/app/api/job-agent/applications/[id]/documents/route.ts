import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderAgentPDF, type DesignedDocument } from "@/lib/job-agent/designedPack";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user || user.is_anonymous) return NextResponse.json({ error: "Sign in to download your documents." }, { status: 401 });
  const { id } = await params, kind = new URL(request.url).searchParams.get("kind") || "cv";
  if (!["cv", "cover", "motivation"].includes(kind) || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid document." }, { status: 400 });
  const { data, error } = await db.from("application_assets").select("structured_content").eq("user_id", user.id).eq("application_id", id).eq("asset_type", kind === "cv" ? "cv" : "cover_note").order("created_at", { ascending: false }).limit(1).maybeSingle();
  const document = data?.structured_content?.[kind === "motivation" ? "motivationDocument" : "document"] as DesignedDocument | undefined;
  if (error || !document) return NextResponse.json({ error: "No designed document saved. Prepare a new application pack first." }, { status: 404 });
  try { const blob = await renderAgentPDF(document); return new Response(await blob.arrayBuffer(), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${kind === "cv" ? "CV" : kind === "cover" ? "Cover-Letter" : "Motivation-Letter"}.pdf"`, "Cache-Control": "private, no-store" } }); }
  catch { return NextResponse.json({ error: "Document could not be rendered." }, { status: 503 }); }
}
