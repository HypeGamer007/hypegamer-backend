import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { PermissionModel, ViewStatus } from "@/ui/contracts/states";

export interface RouteFixtureState {
  rawFixture: string | null;
  status: ViewStatus;
  permissions: PermissionModel;
  requestId: string | undefined;
  /** True when URL asks for policy-limited UI */
  restricted: boolean;
}

/**
 * Parses `?fixture=` and `?role=` for demos, Storybook parity, and tests.
 * Defaults to a healthy ready state with full view/edit for project admin-like usage.
 */
export function useRouteFixture(): RouteFixtureState {
  const [params] = useSearchParams();

  return useMemo(() => {
    const rawFixture = params.get("fixture");
    const role = params.get("role");
    const requestId = params.get("requestId") ?? undefined;

    let status: ViewStatus = "ready";
    let permissions: PermissionModel = {
      canView: true,
      canEdit: true,
      canAdmin: true,
    };
    let restricted = false;

    switch (rawFixture) {
      case "loading":
        status = "loading";
        break;
      case "empty":
        status = "empty";
        break;
      case "partial":
        status = "partial";
        break;
      case "error":
        status = "error";
        break;
      case "restricted":
        status = "ready";
        restricted = true;
        permissions = { ...permissions, canEdit: false, canAdmin: false, reason: "Policy restricted" };
        break;
      case "denied":
        status = "denied";
        permissions = {
          canView: false,
          canEdit: false,
          canAdmin: false,
          reason: "Your role cannot view this module.",
        };
        break;
      default:
        break;
    }

    if (role === "viewer") {
      permissions = { canView: true, canEdit: false, canAdmin: false, reason: "Viewer role" };
    }

    return { rawFixture, status, permissions, requestId, restricted };
  }, [params]);
}
