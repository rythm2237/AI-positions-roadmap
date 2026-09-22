import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { apiError, assertSameOrigin, enforceWorkspaceRateLimit, noStoreJson, requireWorkspacePrincipal } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ fileId: string }> };

export async function DELETE(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const { fileId } = await context.params;
    const { ownerId, service } = await requireWorkspacePrincipal();
    await enforceWorkspaceRateLimit(service, `file:delete:${ownerId}`, 30);
    const { data: file, error } = await service.from("aiw_files")
      .select("id,storage_bucket,storage_path,status,deleted_at")
      .eq("id", fileId).eq("owner_id", ownerId).maybeSingle();
    if (error) throw new WorkspaceError("FILE_READ_FAILED", 503);
    if (!file || file.deleted_at) throw new WorkspaceError("NOT_FOUND", 404);

    const removed = await service.storage.from(file.storage_bucket).remove([file.storage_path]);
    if (removed.error) throw new WorkspaceError("FILE_STORAGE_DELETE_FAILED", 503);
    const { error: chunkError } = await service.from("aiw_file_chunks").delete().eq("file_id", fileId).eq("owner_id", ownerId);
    if (chunkError) throw new WorkspaceError("FILE_DELETE_FAILED", 503);
    const { error: updateError } = await service.from("aiw_files").update({
      status: "deleted",
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", fileId).eq("owner_id", ownerId);
    if (updateError) throw new WorkspaceError("FILE_DELETE_FAILED", 503);
    return noStoreJson({ deleted: true, fileId, requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}
