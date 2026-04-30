import type { RouteFixtureState } from "@/hooks/useRouteFixture";
import type { ViewStatus } from "@/ui/contracts/states";

/**
 * List routes default to `empty` until sandbox/demo data exists.
 * Any explicit `?fixture=` value wins over the demo-data default (tests/demos).
 */
export function resolveListRouteStatus(
  fx: RouteFixtureState,
  demoSeeded: boolean
): ViewStatus {
  if (fx.rawFixture) {
    return fx.status;
  }
  if (!demoSeeded) return "empty";
  return "ready";
}
