import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { mergeSearchParams } from "@/lib/searchParams";

/**
 * Updates selected query keys while preserving the rest (fixtures, roles, etc.).
 */
export function useSyncedSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const patch = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      setSearchParams(mergeSearchParams(searchParams, updates), { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const get = useCallback((key: string) => searchParams.get(key) ?? "", [searchParams]);

  const snapshot = useMemo(() => searchParams.toString(), [searchParams]);

  return { searchParams, patch, get, snapshot };
}
