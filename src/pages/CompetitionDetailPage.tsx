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
import { resolveDetailRouteStatus } from "@/lib/resolveDetailRouteStatus";
import { getCompetitionById } from "@/mocks/operational.demo";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import { track } from "@/lib/telemetry";

export function CompetitionDetailPage() {
  const { competitionId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fx = useRouteFixture();
  const demoSeeded = useDemoSeeded();

  const listSearch = resolveDetailListLocationSearch("competitions", location.state);

  const entity = useMemo(() => getCompetitionById(competitionId), [competitionId]);
  const exists = Boolean(entity);
  const status = resolveDetailRouteStatus(fx, demoSeeded, exists);

  const partialBanner =
    fx.rawFixture === "partial"
      ? "Some fields may be withheld under the current policy scope."
      : undefined;

  const empty = useMemo(() => {
    if (status !== "empty") return undefined;
    if (!demoSeeded) {
      return {
        analyticsId: "competition-detail-no-demo",
        title: "No competition data yet",
        body: "Load sandbox preview data to inspect competition records, or connect a source so operational data appears here.",
        primaryCta: { label: "Load sandbox data", action: "load_sandbox" },
        secondaryCta: { label: "Back to competitions", action: "back" },
        onPrimary: () => {
          seedDemoWorkspace("competition_detail_empty");
          window.location.reload();
        },
        onSecondary: () =>
          void navigate({ pathname: "/competitions", search: listSearch || undefined }),
      };
    }
    return {
      analyticsId: "competition-detail-missing",
      title: "Competition not found",
      body: "That ID is not in the current sandbox dataset. Return to the list or pick another competition.",
      primaryCta: { label: "Back to competitions", action: "back" },
      onPrimary: () => void navigate({ pathname: "/competitions", search: listSearch || undefined }),
    };
  }, [demoSeeded, listSearch, navigate, status]);

  useEffect(() => {
    if (status === "ready" && entity) {
      track("competition_viewed", {
        competitionId: entity.id,
        provenanceTier: entity.provenance,
      });
    }
  }, [entity, status]);

  return (
    <RouteViewRoot
      gateAnalyticsId="competition-detail"
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
          pageTestId="competition-detail-page"
          title={entity.name}
          description="Detail view is fixture-driven today; lineage and corrections ship in a later iteration."
          badges={<EnvironmentBadge />}
          breadcrumbs={
            <Breadcrumbs
              items={[
                { label: "Home", to: "/home" },
                {
                  label: "Competitions",
                  to: { pathname: "/competitions", search: listSearch || undefined },
                },
                { label: entity.name },
              ]}
            />
          }
          actions={
            <Link
              className="hg-inline-link"
              to={{ pathname: "/competitions", search: listSearch || undefined }}
            >
              ← Competitions
            </Link>
          }
        >
          <DetailMeta
            items={[
              { label: "Id", value: entity.id },
              { label: "Game", value: entity.game },
              { label: "Status", value: entity.status },
              { label: "Provenance", value: entity.provenance },
            ]}
          />
        </PageFrame>
      ) : null}
    </RouteViewRoot>
  );
}
