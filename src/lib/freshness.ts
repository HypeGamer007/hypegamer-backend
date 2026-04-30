export type FreshnessState = "fresh" | "stale" | "old" | "unknown";

export function freshnessFromIso(iso: string, now = Date.now()): { state: FreshnessState; ageMinutes: number } {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return { state: "unknown", ageMinutes: 0 };
  const ageMinutes = Math.max(0, Math.round((now - t) / 60000));
  if (ageMinutes <= 60) return { state: "fresh", ageMinutes };
  if (ageMinutes <= 24 * 60) return { state: "stale", ageMinutes };
  return { state: "old", ageMinutes };
}

export function freshnessLabel(state: FreshnessState): string {
  switch (state) {
    case "fresh":
      return "Fresh";
    case "stale":
      return "Stale";
    case "old":
      return "Old";
    default:
      return "Unknown";
  }
}

