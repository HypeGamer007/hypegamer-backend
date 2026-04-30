import type { EmptyStateModel } from "@/ui/contracts/components";
import styles from "./EmptyState.module.css";
import { track } from "@/lib/telemetry";

export interface EmptyStateProps extends EmptyStateModel {
  /** Stable id for analytics and tests */
  analyticsId: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  /** When true, announces content for screen readers on mount/update */
  announce?: boolean;
}

/**
 * Value-preserving empty state: always explains why it is empty and the best next action.
 */
export function EmptyState({
  title,
  body,
  primaryCta,
  secondaryCta,
  analyticsId,
  onPrimary,
  onSecondary,
  announce = true,
}: EmptyStateProps) {
  return (
    <section
      className={styles.root}
      data-testid={`empty-state-${analyticsId}`}
      aria-labelledby={`${analyticsId}-title`}
    >
      {announce ? (
        <div className="sr-only" role="status" aria-live="polite">
          {title}. {body}
        </div>
      ) : null}
      <div className={styles.icon} aria-hidden>
        <span className={styles.iconGlyph}>◇</span>
      </div>
      <h2 id={`${analyticsId}-title`} className={styles.title}>
        {title}
      </h2>
      <p className={styles.body}>{body}</p>
      <div className={styles.actions}>
        {primaryCta ? (
          <button
            type="button"
            className={styles.primary}
            data-analytics={analyticsId}
            onClick={() => {
              track("empty_state_cta_clicked", { analyticsId, action: primaryCta.action });
              onPrimary?.();
            }}
          >
            {primaryCta.label}
          </button>
        ) : null}
        {secondaryCta ? (
          <button
            type="button"
            className={styles.secondary}
            data-analytics={`${analyticsId}-secondary`}
            onClick={() => {
              track("empty_state_cta_clicked", { analyticsId, action: secondaryCta.action });
              onSecondary?.();
            }}
          >
            {secondaryCta.label}
          </button>
        ) : null}
      </div>
    </section>
  );
}
