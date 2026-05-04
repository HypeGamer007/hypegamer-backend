import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDialogFocusTrap } from "@/hooks/useDialogFocusTrap";
import { useSetupChecklistProgress } from "@/hooks/useSetupChecklistProgress";
import { runFullDemoTour } from "@/lib/runFullDemoTour";
import { WORKSPACE_STORY_ELEMENT_ID } from "@/mocks/workspaceNarrative";
import styles from "./SetupChecklistMenu.module.css";

export function SetupChecklistMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const panelId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { items, incompleteCount } = useSetupChecklistProgress();

  useDialogFocusTrap(open, panelRef, {
    onEscape: () => setOpen(false),
    returnFocusRef: btnRef,
  });

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  return (
    <div className={styles.wrap}>
      <button
        ref={btnRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        data-testid="setup-checklist-trigger"
        onClick={() => setOpen((v) => !v)}
      >
        Checklist
        <span
          className={`${styles.badge} ${incompleteCount === 0 ? styles.badgeDone : ""}`}
          aria-label={incompleteCount === 0 ? "All checklist items complete" : `${incompleteCount} checklist items remaining`}
        >
          {incompleteCount === 0 ? "✓" : incompleteCount}
        </span>
      </button>
      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          className={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-label="Workspace setup checklist"
          data-testid="setup-checklist"
        >
          <h2 className={styles.panelTitle}>Setup checklist</h2>
          <div className={styles.tourBlock}>
            <p className={styles.tourLead}>
              <strong>MOBA demo tour</strong> — seeds sandbox data, marks checklist progress, and adds a sample webhook
              delivery so Developers and Integrator feel “live” without backends.
            </p>
            <button
              type="button"
              className={styles.tourBtn}
              data-testid="setup-run-full-demo-tour"
              onClick={() => {
                runFullDemoTour();
                setOpen(false);
                navigate(`/home#${WORKSPACE_STORY_ELEMENT_ID}`);
              }}
            >
              Run full MOBA demo tour
            </button>
          </div>
          <ol className={styles.list}>
            {items.map((item) => (
              <li key={item.id} className={styles.item}>
                <span className={`${styles.check} ${item.done ? styles.checkDone : ""}`} aria-hidden>
                  {item.done ? "✓" : ""}
                </span>
                <div>
                  <p className={styles.label}>{item.label}</p>
                  <p className={styles.hint}>{item.hint}</p>
                  <Link className={styles.link} to={item.to} onClick={() => setOpen(false)}>
                    {item.linkLabel}
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
