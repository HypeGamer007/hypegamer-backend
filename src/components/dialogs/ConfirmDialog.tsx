import { useId, useRef } from "react";
import { useDialogFocusTrap } from "@/hooks/useDialogFocusTrap";
import styles from "./ConfirmDialog.module.css";

export function ConfirmDialog({
  open,
  title,
  body,
  details,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "primary",
  onConfirm,
  onCancel,
  testId,
}: {
  open: boolean;
  title: string;
  body: string;
  details?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
  testId?: string;
}) {
  const titleId = useId();
  const bodyId = useId();
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useDialogFocusTrap(open, overlayRef, { onEscape: onCancel });

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      data-testid={testId}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className={styles.dialog}>
        <h2 className={styles.title} id={titleId}>
          {title}
        </h2>
        <p className={styles.body} id={bodyId}>
          {body}
        </p>
        {details ? <div className={styles.panel}>{details}</div> : null}
        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${tone === "danger" ? styles.danger : styles.primary}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

