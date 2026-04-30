import {
  SESSION_LIST_ORIGIN_COMPETITIONS,
  SESSION_LIST_ORIGIN_ENTITIES,
  SESSION_LIST_ORIGIN_MATCHES,
  SESSION_LIST_ORIGIN_SOURCES,
} from "@/lib/storageKeys";

/** Passed in `location.state` when navigating from a Phase 1 list into a detail route. */
export type DetailListOriginState = {
  /** `URLSearchParams.toString()` from the list view (no leading `?`). */
  listSearch: string;
};

export type DetailListRouteKey = "competitions" | "matches" | "sources" | "entities";

const SESSION_KEYS: Record<DetailListRouteKey, string> = {
  competitions: SESSION_LIST_ORIGIN_COMPETITIONS,
  matches: SESSION_LIST_ORIGIN_MATCHES,
  sources: SESSION_LIST_ORIGIN_SOURCES,
  entities: SESSION_LIST_ORIGIN_ENTITIES,
};

export function isDetailListOriginState(v: unknown): v is DetailListOriginState {
  if (!v || typeof v !== "object") return false;
  const ls = (v as { listSearch?: unknown }).listSearch;
  return typeof ls === "string";
}

/** Returns raw query string without `?`, from navigation state only. */
export function listSearchFromState(state: unknown): string {
  if (!isDetailListOriginState(state)) return "";
  return normalizeQueryRaw(state.listSearch);
}

function normalizeQueryRaw(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  return t.startsWith("?") ? t.slice(1) : t;
}

function readStored(route: DetailListRouteKey): string {
  try {
    return normalizeQueryRaw(sessionStorage.getItem(SESSION_KEYS[route]) ?? "");
  } catch {
    return "";
  }
}

/** Persist list filters so detail back-links survive refresh and direct detail URLs. */
export function persistDetailListSearch(route: DetailListRouteKey, listSearchRaw: string): void {
  const key = SESSION_KEYS[route];
  const normalized = normalizeQueryRaw(listSearchRaw);
  try {
    if (!normalized) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, normalized);
  } catch {
    /* private mode / quota */
  }
}

/**
 * Raw query string without `?`: prefers in-memory navigation state, then sessionStorage.
 */
export function resolveDetailListSearchRaw(route: DetailListRouteKey, state: unknown): string {
  const fromState = listSearchFromState(state);
  if (fromState) return fromState;
  return readStored(route);
}

/** `?a=b` or `""` for use as React Router `search`. */
export function resolveDetailListLocationSearch(route: DetailListRouteKey, state: unknown): string {
  const raw = resolveDetailListSearchRaw(route, state);
  if (!raw) return "";
  return `?${raw}`;
}
