import type { RouteFixtureState } from "@/hooks/useRouteFixture";
import type { ViewStatus } from "@/ui/contracts/states";

/**
 * Detail routes: explicit `fixture` wins; otherwise empty without demo data or missing id.
 */
export function resolveDetailRouteStatus(
  fx: RouteFixtureState,
  demoSeeded: boolean,
  entityExists: boolean
): ViewStatus {
  if (fx.rawFixture) {
    return fx.status;
  }
  if (!demoSeeded) return "empty";
  if (!entityExists) return "empty";
  return "ready";
}
