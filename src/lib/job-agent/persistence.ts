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
  return rows.map((row) => {
    const key = externalKey(row);
    const stableJobUrl = key ? stableUrlByExternalKey.get(key) : null;
    return stableJobUrl && stableJobUrl !== row.job_url ? { ...row, job_url: stableJobUrl } : row;
  });
}
