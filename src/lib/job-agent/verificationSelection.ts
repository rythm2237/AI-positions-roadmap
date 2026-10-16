/** Select a bounded, source-diverse verification cohort without increasing per-run cost. */
export function selectCandidatesForVerification<T extends { source: string }>(jobs: T[], limit: number): T[] {
  const cap = Math.max(0, Math.floor(limit));
  if (jobs.length <= cap) return jobs.slice();
  if (!cap) return [];
  const groups = new Map<string, T[]>();
  for (const job of jobs) {
    const key = job.source || "Unknown";
    const rows = groups.get(key) ?? [];
    rows.push(job);
    groups.set(key, rows);
  }
  // Preserve the encounter order of providers and the ranking within each provider.
  const queues = [...groups.values()];
  const result: T[] = [];
  while (result.length < cap) {
    let advanced = false;
    for (const queue of queues) {
      if (result.length === cap) break;
      const next = queue.shift();
      if (next) { result.push(next); advanced = true; }
    }
    if (!advanced) break;
  }
  return result;
}
