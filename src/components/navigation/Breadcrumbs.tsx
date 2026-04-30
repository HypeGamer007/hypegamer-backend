import { Link, type To } from "react-router-dom";
import styles from "./Breadcrumbs.module.css";

export type BreadcrumbItem = { label: string; to?: To };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav className={styles.nav} aria-label="Breadcrumb" data-testid="breadcrumb-nav">
      <ol className={styles.ol}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className={styles.li}>
              {i > 0 ? (
                <span className={styles.sep} aria-hidden>
                  /
                </span>
              ) : null}
              {item.to != null && !isLast ? (
                <Link className={styles.link} to={item.to}>
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? styles.current : styles.link} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
