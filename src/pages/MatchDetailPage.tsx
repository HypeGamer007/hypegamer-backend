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
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import { track } from "@/lib/telemetry";
import { getMatchById } from "@/mocks/operational.demo";

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function MatchDetailPage() {
  const { matchId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fx = useRouteFixture();
  const demoSeeded = useDemoSeeded();

  const listSearch = resolveDetailListLocationSearch("matches", location.state);

  const entity = useMemo(() => getMatchById(matchId), [matchId]);
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
        analyticsId: "match-detail-no-demo",
        title: "No match data yet",
        body: "Load sandbox preview data to inspect match records, or connect a source so operational data appears here.",
        primaryCta: { label: "Load sandbox data", action: "load_sandbox" },
        secondaryCta: { label: "Back to matches", action: "back" },
        onPrimary: () => {
          seedDemoWorkspace("match_detail_empty");
          window.location.reload();
        },
        onSecondary: () =>
          void navigate({ pathname: "/matches", search: listSearch || undefined }),
      };
    }
    return {
      analyticsId: "match-detail-missing",
      title: "Match not found",
      body: "That ID is not in the current sandbox dataset. Return to the list or pick another match.",
      primaryCta: { label: "Back to matches", action: "back" },
      onPrimary: () => void navigate({ pathname: "/matches", search: listSearch || undefined }),
    };
  }, [demoSeeded, listSearch, navigate, status]);

  useEffect(() => {
    if (status === "ready" && entity) {
      track("match_viewed", {
        matchId: entity.id,
        competitionId: entity.competitionId,
        provenanceTier: entity.provenance,
      });
    }
  }, [entity, status]);

  const compPath =
    entity?.competitionId != null && entity.competitionId !== ""
      ? `/competitions/${entity.competitionId}`
      : null;

  return (
    <RouteViewRoot
      gateAnalyticsId="match-detail"
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
          pageTestId="match-detail-page"
          title={`${entity.competition} — ${entity.phase}`}
          description="Fixture-driven detail; bracket lineage and corrections ship in a later iteration."
          badges={<EnvironmentBadge />}
          breadcrumbs={
            <Breadcrumbs
              items={[
                { label: "Home", to: "/home" },
                {
                  label: "Matches",
                  to: { pathname: "/matches", search: listSearch || undefined },
                },
                { label: `${entity.competition} — ${entity.phase}` },
              ]}
            />
          }
          actions={
            <>
              <Link
                className="hg-inline-link"
                to={{ pathname: "/matches", search: listSearch || undefined }}
              >
                ← Matches
              </Link>
              {compPath ? (
                <Link className="hg-inline-link" to={compPath}>
                  Competition
                </Link>
              ) : null}
            </>
          }
        >
          <DetailMeta
            items={[
              { label: "Match id", value: entity.id },
              { label: "Competition", value: entity.competition },
              { label: "Phase", value: entity.phase },
              { label: "Scheduled", value: formatWhen(entity.scheduledAt) },
              { label: "Provenance", value: entity.provenance },
            ]}
          />
        </PageFrame>
      ) : null}
    </RouteViewRoot>
  );
}
