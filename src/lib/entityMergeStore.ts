import { STORAGE_ENTITY_MERGE_AUDIT } from "@/lib/storageKeys";

export type MergeAuditEntry = {
  id: string;
  at: string;
  fromEntityId: string;
  intoEntityId: string;
  intoDisplayName: string;
  confidenceBand: string;
  reviewerId: string;
};

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readMergeAuditLog(): MergeAuditEntry[] {
  return parseJson<MergeAuditEntry[]>(localStorage.getItem(STORAGE_ENTITY_MERGE_AUDIT), []);
}

function writeMergeAuditLog(entries: MergeAuditEntry[]) {
  localStorage.setItem(STORAGE_ENTITY_MERGE_AUDIT, JSON.stringify(entries));
}

export function findMergeResolutionForEntity(entityId: string): MergeAuditEntry | undefined {
  return readMergeAuditLog().find((e) => e.fromEntityId === entityId);
}

export function recordMergeApplied(entry: Omit<MergeAuditEntry, "id" | "at"> & { id?: string; at?: string }) {
  const row: MergeAuditEntry = {
    id: entry.id ?? `merge_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
    at: entry.at ?? new Date().toISOString(),
    fromEntityId: entry.fromEntityId,
    intoEntityId: entry.intoEntityId,
    intoDisplayName: entry.intoDisplayName,
    confidenceBand: entry.confidenceBand,
    reviewerId: entry.reviewerId,
  };
  writeMergeAuditLog([row, ...readMergeAuditLog()]);
}
