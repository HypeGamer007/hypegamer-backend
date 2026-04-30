import type { ReactNode } from "react";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { ErrorPanel } from "@/components/state/ErrorPanel";
import { PermissionGate } from "@/components/state/PermissionGate";
import { ViewStatusMarker } from "@/components/state/ViewStatusMarker";
import type { PermissionModel, ViewStatus } from "@/ui/contracts/states";
import styles from "./RouteViewRoot.module.css";

export interface RouteViewRootProps {
  status: ViewStatus;
  permissions: PermissionModel;
  restricted?: boolean;
  requestId?: string;
  onRetry?: () => void;
  empty?: {
    analyticsId: string;
    title: string;
    body: string;
    primaryCta?: { label: string; action: string };
    secondaryCta?: { label: string; action: string };
    onPrimary?: () => void;
    onSecondary?: () => void;
  };
  partialBanner?: string;
  children: ReactNode;
  gateAnalyticsId: string;
}

export function RouteViewRoot({
  status,
  permissions,
  restricted = false,
  requestId,
  onRetry,
  empty,
  partialBanner,
  children,
  gateAnalyticsId,
}: RouteViewRootProps) {
  return (
    <>
      <ViewStatusMarker status={status} />
      <PermissionGate
        permissions={permissions}
        restricted={restricted}
        analyticsId={gateAnalyticsId}
      >
        {status === "loading" ? (
          <div className={styles.loading} aria-busy="true">
            {children}
          </div>
        ) : null}

        {status === "error" ? (
          <ErrorPanel
            message="We could not load this module. You can retry or contact support with the request ID."
            requestId={requestId ?? "unknown"}
            retryable
            onRetry={onRetry}
          />
        ) : null}

        {status === "empty" && empty ? (
          <EmptyState
            analyticsId={empty.analyticsId}
            title={empty.title}
            body={empty.body}
            primaryCta={empty.primaryCta}
            secondaryCta={empty.secondaryCta}
            onPrimary={empty.onPrimary}
            onSecondary={empty.onSecondary}
          />
        ) : null}

        {status === "ready" || status === "partial" ? (
          <>
            {status === "partial" && partialBanner ? (
              <p className={styles.partial} role="status">
                {partialBanner}
              </p>
            ) : null}
            {children}
          </>
        ) : null}
      </PermissionGate>
    </>
  );
}
