import { WorkspaceError, type Permission } from "./contracts.ts";

export interface ToolInvocation {
  toolId: string; connectionId: string; ownerId: string; projectId: string;
  permission: Permission; argumentsHash: string;
}

export function authorizeTool(input: {
  invocation: ToolInvocation; ownerId: string; projectId: string;
  connection: { id: string; ownerId: string; status: string; permissions: Permission[] };
  projectTools: string[]; entitledTools: string[]; skillTools: string[];
  approval?: { toolId: string; connectionId: string; ownerId: string; projectId: string; argumentsHash: string; expiresAt: number; consumed: boolean };
  now?: number;
}) {
  const { invocation: call, connection, approval } = input;
  if (call.ownerId !== input.ownerId || call.projectId !== input.projectId || connection.ownerId !== input.ownerId
    || call.connectionId !== connection.id || connection.status !== "connected"
    || !connection.permissions.includes(call.permission)
    || !input.projectTools.includes(call.toolId) || !input.entitledTools.includes(call.toolId)
    || !input.skillTools.includes(call.toolId)) throw new WorkspaceError("TOOL_NOT_ALLOWED", 403);
  if (call.permission !== "read" && (!approval || approval.consumed || approval.expiresAt <= (input.now ?? Date.now())
    || approval.ownerId !== input.ownerId || approval.projectId !== input.projectId
    || approval.connectionId !== connection.id || approval.toolId !== call.toolId
    || approval.argumentsHash !== call.argumentsHash)) throw new WorkspaceError("TOOL_APPROVAL_REQUIRED", 403);
  // The persistence layer must atomically consume an approval before executing the action.
  return { requiresAtomicApprovalConsumption: call.permission !== "read" };
}
