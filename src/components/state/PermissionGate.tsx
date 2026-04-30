import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { track } from "@/lib/telemetry";
import type { PermissionModel } from "@/ui/contracts/states";

export interface PermissionGateProps {
  permissions: PermissionModel;
  /**
   * Policy restrictions mean the route exists, but content must be redacted/limited.
   * This is distinct from denied (cannot view at all).
   */
  restricted?: boolean;
  children: ReactNode;
  analyticsId: string;
  restrictedCopy?: { title: string; body: string };
  deniedCopy?: { title: string; body: string };
}

export function PermissionGate({
  permissions,
  restricted = false,
  children,
  analyticsId,
  restrictedCopy,
  deniedCopy,
}: PermissionGateProps) {
  const denyLogged = useRef(false);

  useEffect(() => {
    if (permissions.canView) {
      denyLogged.current = false;
      return;
    }
    if (denyLogged.current) return;
    denyLogged.current = true;
    const role =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("role") ?? "unspecified"
        : "unspecified";
    track("permission_denied_viewed", {
      routeId: analyticsId,
      role,
      reason: permissions.reason ?? "",
    });
  }, [analyticsId, permissions.canView, permissions.reason]);

  if (!permissions.canView) {
    return (
      <EmptyState
        analyticsId={`${analyticsId}-denied`}
        title={deniedCopy?.title ?? "Permission denied"}
        body={
          deniedCopy?.body ??
          (permissions.reason
            ? permissions.reason
            : "Your current role does not include access to this page.")
        }
        primaryCta={{ label: "Review setup", action: "goto_setup" }}
        secondaryCta={{ label: "Go home", action: "goto_home" }}
        onPrimary={() => window.location.assign("/onboarding")}
        onSecondary={() => window.location.assign("/home")}
      />
    );
  }

  if (restricted) {
    return (
      <div>
        <EmptyState
          analyticsId={`${analyticsId}-restricted`}
          title={restrictedCopy?.title ?? "Some content is restricted"}
          body={
            restrictedCopy?.body ??
            "This page is available, but certain fields or actions are limited by policy."
          }
          secondaryCta={{ label: "View policy", action: "view_policy" }}
          onSecondary={() => window.alert("Policy viewer not implemented yet.")}
        />
        <div style={{ marginTop: 16 }}>{children}</div>
      </div>
    );
  }

  return <>{children}</>;
}

