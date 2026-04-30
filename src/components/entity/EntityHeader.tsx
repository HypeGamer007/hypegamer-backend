import type { ReactNode } from "react";
import styles from "./EntityHeader.module.css";

export interface EntityHeaderProps {
  title: string;
  description?: string;
  badges?: ReactNode;
  actions?: ReactNode;
}

/**
 * Reusable page/entity title region: title, optional badges, description, actions.
 */
export function EntityHeader({ title, description, badges, actions }: EntityHeaderProps) {
  return (
    <header className={styles.root}>
      <div className={styles.main}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {badges ? <div className={styles.badges}>{badges}</div> : null}
        </div>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
