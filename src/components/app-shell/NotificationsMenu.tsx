import { useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDialogFocusTrap } from "@/hooks/useDialogFocusTrap";
import { track } from "@/lib/telemetry";
import dlg from "@/components/dialogs/ConfirmDialog.module.css";
import styles from "./NotificationsMenu.module.css";

const DEMO_NOTIFICATIONS = [
  {
    id: "demo_trust",
    title: "Trust: net worth swing triaged (mock)",
    body: "Ancient Major integrity signal — same row as the Home story path.",
    to: "/trust?q=Net+worth",
  },
  {
    id: "demo_partner",
    title: "Partner grant pending approval (mock)",
    body: "Dire Circuit Events awaits org admin approval (matches governance demo).",
    to: "/partners?status=pending",
  },
  {
    id: "demo_widgets_policy",
    title: "Widgets: live GPM ribbon still blocked (mock)",
    body: "Community-backed Lane GPM snapshot keeps live publish in draft — open filtered widgets.",
    to: "/widgets?q=GPM&preview=live",
  },
] as const;

export function NotificationsMenu() {
  const panelId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useDialogFocusTrap(open, panelRef, {
    onEscape: () => setOpen(false),
    returnFocusRef: btnRef,
  });

  return (
    <div className={styles.wrap}>
      <button
        ref={btnRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        data-testid="notifications-menu-trigger"
        onClick={() => setOpen((v) => !v)}
      >
        Notifications
        <span className={styles.badge} aria-hidden>
          {DEMO_NOTIFICATIONS.length}
        </span>
      </button>
      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          className={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-label="Demo notifications"
          data-testid="notifications-menu-panel"
        >
          <p className={styles.panelHint}>Demo inbox — no delivery backend; links jump to mock screens.</p>
          <ul className={styles.list}>
            {DEMO_NOTIFICATIONS.map((n) => (
              <li key={n.id} className={styles.item}>
                <Link
                  className={styles.itemLink}
                  to={n.to}
                  onClick={() => {
                    track("notification_opened", {
                      notificationId: n.id,
                      type: "demo_fixture",
                      deepLinkRoute: n.to,
                    });
                    setOpen(false);
                  }}
                >
                  <span className={styles.itemTitle}>{n.title}</span>
                  <span className={styles.itemBody}>{n.body}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.footer}>
            <button
              type="button"
              className={dlg.btn}
              disabled
              title="Mark-all-read is disabled in this mock inbox."
            >
              Mark all read
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
