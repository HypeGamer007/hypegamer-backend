import type { SourceRow } from "@/mocks/operational.demo";

export type SourceStatus = SourceRow["status"];

type OverrideRecord = Record<
  string,
  {
    status: SourceStatus;
    updatedAt: string;
  }
>;

const KEY = "hypegamer_source_overrides_v1";

function readAll(): OverrideRecord {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as OverrideRecord;
  } catch {
    return {};
  }
}

function writeAll(next: OverrideRecord) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getSourceStatusOverride(sourceId: string): SourceStatus | null {
  const all = readAll();
  const v = all[sourceId];
  return v?.status ?? null;
}

export function setSourceStatusOverride(sourceId: string, status: SourceStatus) {
  const all = readAll();
  all[sourceId] = { status, updatedAt: new Date().toISOString() };
  writeAll(all);
}

export function clearSourceOverrides() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

