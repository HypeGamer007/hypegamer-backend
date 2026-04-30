import type { KeyboardEvent, ReactNode } from "react";
import styles from "./DataTable.module.css";

export interface Column<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  caption,
  loading,
  loadingColSpan,
  onRowClick,
  getRowLabel,
}: {
  columns: Column<T>[];
  rows: T[];
  caption?: string;
  loading?: boolean;
  loadingColSpan: number;
  onRowClick?: (row: T) => void;
  /** Accessible name for the row when it is activatable (defaults to id). */
  getRowLabel?: (row: T) => string;
}) {
  const handleKey = (e: KeyboardEvent<HTMLTableRowElement>, row: T) => {
    if (!onRowClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRowClick(row);
    }
  };

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        {caption ? <caption className={styles.caption}>{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.id} className={styles.th} scope="col">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={`sk-${i}`} className={styles.skeletonRow} aria-hidden>
                  <td className={styles.td} colSpan={loadingColSpan} />
                </tr>
              ))
            : rows.map((row) => (
                <tr
                  key={row.id}
                  className={onRowClick ? styles.clickRow : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={onRowClick ? (e) => handleKey(e, row) : undefined}
                  role={onRowClick ? "link" : undefined}
                  aria-label={
                    onRowClick ? (getRowLabel ? getRowLabel(row) : `Open row ${row.id}`) : undefined
                  }
                >
                  {columns.map((c) => (
                    <td key={c.id} className={styles.td}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
