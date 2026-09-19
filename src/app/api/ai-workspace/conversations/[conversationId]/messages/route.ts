import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { apiError, noStoreJson, requireRegisteredWorkspacePrincipal } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ conversationId: string }> };

export async function GET(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    const { conversationId } = await context.params;
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    const url = new URL(request.url);
    const rawLimit = Number(url.searchParams.get("limit") ?? 100);
    const limit = Number.isSafeInteger(rawLimit) ? Math.max(1, Math.min(200, rawLimit)) : 100;
    const before = url.searchParams.get("before");

    const { data: conversation, error: conversationError } = await service.from("aiw_conversations")
      .select("id,project_id,title,archived").eq("id", conversationId).eq("owner_id", ownerId).maybeSingle();
    if (conversationError) throw new WorkspaceError("CONVERSATION_READ_FAILED", 503);
    if (!conversation) throw new WorkspaceError("NOT_FOUND", 404);

    let query = service.from("aiw_messages").select("id,role,content,request_id,metadata,created_at")
      .eq("owner_id", ownerId).eq("conversation_id", conversationId)
      .not("metadata", "cs", '{"internal":true}')
      .order("created_at", { ascending: false }).limit(limit + 1);
    if (before) {
      const parsed = Date.parse(before);
      if (!Number.isFinite(parsed)) throw new WorkspaceError("INVALID_CURSOR", 400);
      query = query.lt("created_at", new Date(parsed).toISOString());
    }
    const { data, error } = await query;
    if (error) throw new WorkspaceError("MESSAGE_LIST_FAILED", 503);
    const rows = data ?? [];
    const hasMore = rows.length > limit;
    const page = rows.slice(0, limit).reverse();
    const nextCursor = hasMore && page.length ? page[0].created_at : null;
    return noStoreJson({ conversation, messages: page, hasMore, nextCursor, requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}
