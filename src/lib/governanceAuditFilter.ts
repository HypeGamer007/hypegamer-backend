/** Narrow row shape for client-side audit log filtering (matches governance fixture). */
export type AuditActivityFilterRow = {
  occurredAt: string;
  actorLabel: string;
  verb: string;
  objectLabel: string;
  beforeSummary: string | null;
  afterSummary: string | null;
};

export function auditMatchesQuery(row: AuditActivityFilterRow, q: string): boolean {
  if (!q.trim()) return true;
  const needle = q.toLowerCase();
  const hay = [
    row.actorLabel,
    row.verb,
    row.objectLabel,
    row.beforeSummary ?? "",
    row.afterSummary ?? "",
    row.occurredAt,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}
