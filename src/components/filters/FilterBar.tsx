import { useMemo } from "react";
import { useSyncedSearchParams } from "@/hooks/useSyncedSearchParams";
import { track } from "@/lib/telemetry";
import styles from "./FilterBar.module.css";

export interface FilterSelect {
  param: string;
  label: string;
  allLabel?: string;
  options: Array<{ value: string; label: string }>;
}

export interface FilterSearch {
  param: string;
  label: string;
  placeholder?: string;
}

export interface FilterBarProps {
  analyticsId: string;
  selects: FilterSelect[];
  search?: FilterSearch;
  disabled?: boolean;
  /** When false, the bar still reflects URL state but hides the Clear control (e.g. when a dedicated empty state has its own clear CTA). */
  showClearButton?: boolean;
  /** Params that count as “active filters” for Clear (defaults to all select + search params). */
  filterParamKeys?: string[];
}

export function FilterBar({
  analyticsId,
  selects,
  search,
  disabled = false,
  showClearButton = true,
  filterParamKeys,
}: FilterBarProps) {
  const { get, patch } = useSyncedSearchParams();

  const keys = useMemo(() => {
    if (filterParamKeys?.length) return filterParamKeys;
    const k = selects.map((s) => s.param);
    if (search) k.push(search.param);
    return k;
  }, [filterParamKeys, search, selects]);

  const hasActive = keys.some((k) => {
    const v = get(k);
    return v !== "" && v != null;
  });

  const clear = () => {
    const updates: Record<string, string | null> = {};
    for (const k of keys) updates[k] = null;
    track("filter_applied", { analyticsId, action: "clear_all" });
    patch(updates);
  };

  return (
    <div
      className={styles.root}
      role="search"
      aria-label="Filters"
      data-testid={`filter-bar-${analyticsId}`}
    >
      {search ? (
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${analyticsId}-${search.param}`}>
            {search.label}
          </label>
          <input
            id={`${analyticsId}-${search.param}`}
            className={styles.input}
            type="search"
            name={search.param}
            placeholder={search.placeholder}
            value={get(search.param)}
            disabled={disabled}
            onChange={(e) => {
              track("filter_applied", { analyticsId, param: search.param });
              patch({ [search.param]: e.target.value });
            }}
          />
        </div>
      ) : null}

      {selects.map((s) => (
        <div key={s.param} className={styles.field}>
          <label className={styles.label} htmlFor={`${analyticsId}-${s.param}`}>
            {s.label}
          </label>
          <select
            id={`${analyticsId}-${s.param}`}
            className={styles.select}
            name={s.param}
            value={get(s.param)}
            disabled={disabled}
            onChange={(e) => {
              track("filter_applied", { analyticsId, param: s.param, value: e.target.value });
              patch({ [s.param]: e.target.value || null });
            }}
          >
            <option value="">{s.allLabel ?? "All"}</option>
            {s.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {showClearButton ? (
        <button
          type="button"
          className={styles.clear}
          disabled={disabled || !hasActive}
          onClick={clear}
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
