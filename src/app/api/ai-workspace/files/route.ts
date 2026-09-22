import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { AIW_ALLOWED_MIME, AIW_FILE_BUCKET, AIW_MAX_FILE_BYTES, chunkKnowledgeText, extractKnowledgeText, safeOriginalName, sha256Hex } from "@/lib/ai-workspace/knowledgeFiles";
import { apiError, assertSameOrigin, enforceWorkspaceRateLimit, noStoreJson, requireWorkspacePrincipal } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";
export const maxDuration = 60;

async function ownedProject(service: Awaited<ReturnType<typeof requireWorkspacePrincipal>>["service"], ownerId: string, projectId: string) {
  const { data, error } = await service.from("aiw_projects").select("id").eq("id", projectId).eq("owner_id", ownerId).eq("archived", false).maybeSingle();
  if (error) throw new WorkspaceError("PROJECT_READ_FAILED", 503);
  if (!data) throw new WorkspaceError("NOT_FOUND", 404);
}

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const { ownerId, service } = await requireWorkspacePrincipal();
    const projectId = new URL(request.url).searchParams.get("projectId") ?? "";
    if (!projectId) throw new WorkspaceError("PROJECT_REQUIRED", 400);
    await ownedProject(service, ownerId, projectId);
    const { data, error } = await service.from("aiw_files")
      .select("id,project_id,original_name,mime_type,size_bytes,sha256,status,extraction_meta,created_at,updated_at")
      .eq("owner_id", ownerId).eq("project_id", projectId).is("deleted_at", null)
      .order("created_at", { ascending: false }).limit(100);
    if (error) throw new WorkspaceError("FILE_LIST_FAILED", 503);
    return noStoreJson({ files: data ?? [], requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  let storagePath: string | null = null;
  let rowId: string | null = null;
  let service: Awaited<ReturnType<typeof requireWorkspacePrincipal>>["service"] | null = null;
  try {
    assertSameOrigin(request);
    const principal = await requireWorkspacePrincipal();
    service = principal.service;
    const { ownerId } = principal;
    await enforceWorkspaceRateLimit(service, `file:upload:${ownerId}`, 10);
    const declared = Number(request.headers.get("content-length") ?? 0);
    if (Number.isFinite(declared) && declared > AIW_MAX_FILE_BYTES + 1024 * 1024) throw new WorkspaceError("FILE_TOO_LARGE", 413);

    const form = await request.formData();
    const projectId = typeof form.get("projectId") === "string" ? String(form.get("projectId")) : "";
    const file = form.get("file");
    if (!projectId || !file || typeof file !== "object" || !("arrayBuffer" in file) || !("size" in file) || !("type" in file) || !("name" in file)) {
      throw new WorkspaceError("INVALID_FILE_UPLOAD", 400);
    }
    await ownedProject(service, ownerId, projectId);

    const upload = file as File;
    if (upload.size < 1 || upload.size > AIW_MAX_FILE_BYTES) throw new WorkspaceError("FILE_TOO_LARGE", 413);
    if (!AIW_ALLOWED_MIME.has(upload.type)) throw new WorkspaceError("UNSUPPORTED_FILE_TYPE", 415);
    const buffer = Buffer.from(await upload.arrayBuffer());
    if (buffer.byteLength !== upload.size || buffer.byteLength > AIW_MAX_FILE_BYTES) throw new WorkspaceError("INVALID_FILE_UPLOAD", 400);
    const sha256 = sha256Hex(buffer);

    const { data: duplicate, error: duplicateError } = await service.from("aiw_files")
      .select("id,original_name,status").eq("owner_id", ownerId).eq("project_id", projectId).eq("sha256", sha256)
      .is("deleted_at", null).limit(1).maybeSingle();
    if (duplicateError) throw new WorkspaceError("FILE_DEDUP_CHECK_FAILED", 503);
    if (duplicate) return noStoreJson({ file: duplicate, duplicate: true, requestId }, { status: 200 });

    const extracted = await extractKnowledgeText(buffer, upload.type);
    const chunks = chunkKnowledgeText(extracted);
    rowId = crypto.randomUUID();
    const extension = safeOriginalName(upload.name).split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10) || "bin";
    storagePath = `${ownerId}/${projectId}/${rowId}.${extension}`;

    const storage = await service.storage.from(AIW_FILE_BUCKET).upload(storagePath, buffer, { contentType: upload.type, upsert: false, cacheControl: "3600" });
    if (storage.error) throw new WorkspaceError("FILE_STORAGE_FAILED", 503);

    const { error: fileError } = await service.from("aiw_files").insert({
      id: rowId,
      owner_id: ownerId,
      project_id: projectId,
      storage_bucket: AIW_FILE_BUCKET,
      storage_path: storagePath,
      original_name: safeOriginalName(upload.name),
      mime_type: upload.type,
      size_bytes: buffer.byteLength,
      sha256,
      status: "processing",
      extraction_meta: { extractedChars: extracted.length, chunkCount: chunks.length, extractorVersion: 1 },
    });
    if (fileError) throw new WorkspaceError("FILE_METADATA_FAILED", 503);

    const rows = chunks.map((content, ordinal) => ({
      file_id: rowId,
      owner_id: ownerId,
      project_id: projectId,
      ordinal,
      content,
      metadata: { originalName: safeOriginalName(upload.name), mimeType: upload.type },
    }));
    const { error: chunksError } = await service.from("aiw_file_chunks").insert(rows);
    if (chunksError) throw new WorkspaceError("FILE_INDEX_FAILED", 503);
    const { data: ready, error: readyError } = await service.from("aiw_files")
      .update({ status: "ready", updated_at: new Date().toISOString() }).eq("id", rowId).eq("owner_id", ownerId)
      .select("id,project_id,original_name,mime_type,size_bytes,sha256,status,extraction_meta,created_at,updated_at").single();
    if (readyError || !ready) throw new WorkspaceError("FILE_INDEX_FINALIZE_FAILED", 503);
    return noStoreJson({ file: ready, duplicate: false, requestId }, { status: 201 });
  } catch (error) {
    if (service && rowId) {
      try { await service.from("aiw_file_chunks").delete().eq("file_id", rowId); } catch { /* best-effort cleanup */ }
      try { await service.from("aiw_files").delete().eq("id", rowId); } catch { /* best-effort cleanup */ }
    }
    if (service && storagePath) {
      try { await service.storage.from(AIW_FILE_BUCKET).remove([storagePath]); } catch { /* best-effort cleanup */ }
    }
    return apiError(error, requestId);
  }
}
