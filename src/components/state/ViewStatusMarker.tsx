import type { ViewStatus } from "@/ui/contracts/states";

/**
 * Single shared marker for route/component status.
 * Tests should assert against this rather than page-specific DOM.
 */
export function ViewStatusMarker({ status }: { status: ViewStatus }) {
  return (
    <span className="sr-only" data-testid="view-status">
      {status}
    </span>
  );
}

