type OpportunityIdentity = {
  source: string;
  external_job_id: string | null;
  job_url: string;
};

const externalKey = (row: Pick<OpportunityIdentity, "source" | "external_job_id">) =>
  row.external_job_id ? `${row.source}\u0000${row.external_job_id}` : null;

export function preserveOpportunityConflictUrls<T extends OpportunityIdentity>(rows: T[], existing: OpportunityIdentity[]): T[] {
  const stableUrlByExternalKey = new Map(
    existing.flatMap((row) => {
      const key = externalKey(row);
      return key ? [[key, row.job_url] as const] : [];
    }),
  );
  return dedupeOpportunityPersistenceRows(rows.map((row) => {
    const key = externalKey(row);
    const stableJobUrl = key ? stableUrlByExternalKey.get(key) : null;
    return stableJobUrl && stableJobUrl !== row.job_url ? { ...row, job_url: stableJobUrl } : row;
  }));
}

export function dedupeOpportunityPersistenceRows<T extends OpportunityIdentity>(rows: T[]): T[] {
  const seenExternal = new Set<string>();
  const seenUrls = new Set<string>();
  const deduped: T[] = [];

  for (const row of rows) {
    const ext = externalKey(row);
    const url = row.job_url.trim();
    if (ext && seenExternal.has(ext)) continue;
    if (url && seenUrls.has(url)) continue;
    if (ext) seenExternal.add(ext);
    if (url) seenUrls.add(url);
    deduped.push(row);
  }

  return deduped;
}
