import styles from "./ErrorPanel.module.css";

export interface ErrorPanelProps {
  title?: string;
  message: string;
  requestId?: string;
  retryable?: boolean;
  onRetry?: () => void;
  onSupport?: () => void;
}

export function ErrorPanel({
  title = "Something went wrong",
  message,
  requestId,
  retryable = false,
  onRetry,
  onSupport,
}: ErrorPanelProps) {
  return (
    <section
      className={styles.root}
      role="alert"
      aria-live="polite"
      data-testid="error-panel"
    >
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.body}>{message}</p>
      <div className={styles.meta}>
        {requestId ? (
          <span>
            Request ID: <span className={styles.requestId}>{requestId}</span>
          </span>
        ) : null}
        {retryable ? <span>Retry available</span> : <span>Contact support if it persists</span>}
      </div>
      <div className={styles.actions}>
        {retryable && onRetry ? (
          <button type="button" className={styles.primary} onClick={onRetry}>
            Retry
          </button>
        ) : null}
        {onSupport ? (
          <button type="button" className={styles.secondary} onClick={onSupport}>
            Get help
          </button>
        ) : null}
      </div>
    </section>
  );
}

