import type { ReactNode } from "react";
import styles from "./DetailMeta.module.css";

export interface DetailMetaItem {
  label: string;
  value: ReactNode;
}

export function DetailMeta({ items }: { items: DetailMetaItem[] }) {
  return (
    <dl className={styles.root}>
      {items.map((row) => (
        <div key={row.label} className={styles.row}>
          <dt className={styles.dt}>{row.label}</dt>
          <dd className={styles.dd}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
