import type { ReactNode } from "react";
import { EntityHeader } from "@/components/entity/EntityHeader";
import styles from "./PageFrame.module.css";

export interface PageFrameProps {
  title: string;
  description?: string;
  badges?: ReactNode;
  actions?: ReactNode;
  /** Optional trail above the title (e.g. breadcrumbs). */
  breadcrumbs?: ReactNode;
  children: ReactNode;
  /** For e2e / analytics */
  pageTestId?: string;
}

export function PageFrame({
  title,
  description,
  badges,
  actions,
  breadcrumbs,
  children,
  pageTestId,
}: PageFrameProps) {
  return (
    <div className={styles.root} data-testid={pageTestId}>
      {breadcrumbs ? <div className={styles.breadcrumbs}>{breadcrumbs}</div> : null}
      <EntityHeader title={title} description={description} badges={badges} actions={actions} />
      {children}
    </div>
  );
}
