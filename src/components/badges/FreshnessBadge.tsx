import styles from "./FreshnessBadge.module.css";
import { freshnessFromIso, freshnessLabel } from "@/lib/freshness";

export function FreshnessBadge({ iso }: { iso: string }) {
  const { state, ageMinutes } = freshnessFromIso(iso);
  const label = freshnessLabel(state);
  const age =
    state === "unknown"
      ? "unknown"
      : ageMinutes < 60
        ? `${ageMinutes}m`
        : `${Math.round(ageMinutes / 60)}h`;

  return (
    <span
      className={`${styles.badge} ${styles[state]}`}
      title={state === "unknown" ? "No timestamp available" : `Last sync ~${age} ago`}
      data-testid={`freshness-${state}`}
    >
      <span className={styles.dot} aria-hidden />
      {label}
    </span>
  );
}

