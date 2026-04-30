/** Merge updates into a copy of `current` search params. Empty string removes the key. */
export function mergeSearchParams(
  current: URLSearchParams,
  updates: Record<string, string | null | undefined>
): URLSearchParams {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }
  return next;
}
