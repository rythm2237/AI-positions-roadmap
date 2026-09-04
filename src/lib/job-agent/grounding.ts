export type EvidenceGroundedContent = { text: string; evidenceIds: string[] };

export function assertGroundedContent(items: EvidenceGroundedContent[], validEvidenceIds: Set<string>) {
  for (const item of items) {
    if (item.text.trim() && !item.evidenceIds.length) throw new Error("APPLICATION_PACK_UNGROUNDED_TEXT");
    const unknown = item.evidenceIds.filter((id) => !validEvidenceIds.has(id));
    if (unknown.length) throw new Error(`APPLICATION_PACK_UNKNOWN_EVIDENCE:${unknown.slice(0, 5).join(",")}`);
  }
}
