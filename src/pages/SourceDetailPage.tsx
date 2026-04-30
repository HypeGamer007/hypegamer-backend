import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { DetailMeta } from "@/components/detail/DetailMeta";
import { EnvironmentBadge } from "@/components/entity/EnvironmentBadge";
import { PageFrame } from "@/components/layout/PageFrame";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { RouteViewRoot } from "@/components/state/RouteViewRoot";
import { useDemoSeeded } from "@/hooks/useDemoSeeded";
import { useRouteFixture } from "@/hooks/useRouteFixture";
import { resolveDetailListLocationSearch } from "@/lib/detailListOrigin";
import { freshnessLabel, freshnessFromIso } from "@/lib/freshness";
import { resolveDetailRouteStatus } from "@/lib/resolveDetailRouteStatus";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import { getSourceStatusOverride } from "@/lib/sourceOverrides";
import { track } from "@/lib/telemetry";
import { getSourceById } from "@/mocks/operational.demo";

function formatSync(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function SourceDetailPage() {
  const { sourceId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fx = useRouteFixture();
  const demoSeeded = useDemoSeeded();

  const listSearch = resolveDetailListLocationSearch("sources", location.state);

  const base = getSourceById(sourceId);
  const entity = base
    ? (() => {
        const ovr = getSourceStatusOverride(base.id);
        return ovr ? { ...base, status: ovr } : base;
      })()
    : base;
  const exists = Boolean(entity);
  const status = resolveDetailRouteStatus(fx, demoSeeded, exists);

  const partialBanner =
    fx.rawFixture === "partial"
      ? "Credential metadata may be hidden for this source under the current policy scope."
      : undefined;

  const empty = useMemo(() => {
    if (status !== "empty") return undefined;
    if (!demoSeeded) {
      return {
        analyticsId: "source-detail-no-demo",
        title: "No source data yet",
        body: "Load sandbox preview data to inspect source connections, or finish setup to connect a live feed.",
        primaryCta: { label: "Load sandbox data", action: "load_sandbox" },
        secondaryCta: { label: "Back to sources", action: "back" },
        onPrimary: () => {
          seedDemoWorkspace("source_detail_empty");
          window.location.reload();
        },
        onSecondary: () => void navigate({ pathname: "/sources", search: listSearch || undefined }),
      };
    }
    return {
      analyticsId: "source-detail-missing",
      title: "Source not found",
      body: "That ID is not in the current sandbox dataset. Return to the list or pick another source.",
      primaryCta: { label: "Back to sources", action: "back" },
      onPrimary: () => void navigate({ pathname: "/sources", search: listSearch || undefined }),
    };
  }, [demoSeeded, listSearch, navigate, status]);

  useEffect(() => {
    if (status === "ready" && entity) {
      track("source_viewed", {
        sourceId: entity.id,
        status: entity.status,
        provenanceTier: entity.provenance,
      });
    }
  }, [entity, status]);

  return (
    <RouteViewRoot
      gateAnalyticsId="source-detail"
      status={status}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
      partialBanner={partialBanner}
      empty={empty}
    >
      {entity ? (
        <PageFrame
          pageTestId="source-detail-page"
          title={entity.displayName}
          description="Health and provenance at a glance. Credential rotation and ingestion controls ship in a later iteration."
          badges={<EnvironmentBadge />}
          breadcrumbs={
            <Breadcrumbs
              items={[
                { label: "Home", to: "/home" },
                {
                  label: "Sources",
                  to: { pathname: "/sources", search: listSearch || undefined },
                },
                { label: entity.displayName },
              ]}
            />
          }
          actions={
            <Link
              className="hg-inline-link"
              to={{ pathname: "/sources", search: listSearch || undefined }}
            >
              ← Sources
            </Link>
          }
        >
          <DetailMeta
            items={[
              { label: "Source id", value: entity.id },
              { label: "Health", value: entity.status },
              {
                label: "Freshness",
                value: freshnessLabel(freshnessFromIso(entity.lastSync).state),
              },
              { label: "Provenance", value: entity.provenance },
              { label: "Last sync", value: formatSync(entity.lastSync) },
            ]}
          />
        </PageFrame>
      ) : null}
    </RouteViewRoot>
  );
}
