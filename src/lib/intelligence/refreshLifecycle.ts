export const ACTIVE_REFRESH_ITEM_STATUSES = ["queued", "running", "retryable"] as const;
export const TERMINAL_REFRESH_ITEM_STATUSES = ["candidate", "failed", "skipped_budget", "cancelled"] as const;

export function isActiveRefreshItem(status: string) {
  return (ACTIVE_REFRESH_ITEM_STATUSES as readonly string[]).includes(status);
}

export function refreshRunExecutionStatus(statuses: string[]) {
  if (!statuses.length) return "planned";
  const active = statuses.filter(isActiveRefreshItem);
  const terminal = statuses.length - active.length;
  if (active.some(status => status === "running") || (active.length && terminal)) return "running";
  if (active.length) return "planned";
  const failures = statuses.filter(status => status === "failed" || status === "skipped_budget").length;
  if (failures === statuses.length) return "failed";
  if (failures) return "partial";
  return "completed";
}

export function candidateBlocksRefresh(status: string) {
  return status === "validating";
}
