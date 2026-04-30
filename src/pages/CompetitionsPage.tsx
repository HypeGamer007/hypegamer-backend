import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EnvironmentBadge } from "@/components/entity/EnvironmentBadge";
import { FilterBar } from "@/components/filters/FilterBar";
import { PageFrame } from "@/components/layout/PageFrame";
import { DataTable } from "@/components/patterns/DataTable";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { RouteViewRoot } from "@/components/state/RouteViewRoot";
import { useDemoSeeded } from "@/hooks/useDemoSeeded";
import { useRouteFixture } from "@/hooks/useRouteFixture";
import { persistDetailListSearch } from "@/lib/detailListOrigin";
import { mergeSearchParams } from "@/lib/searchParams";
import { resolveListRouteStatus } from "@/lib/resolveListRouteStatus";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import type { CompetitionRow } from "@/mocks/operational.demo";
import { DEMO_COMPETITIONS } from "@/mocks/operational.demo";

function uniqOptions(rows: CompetitionRow[], pick: (r: CompetitionRow) => string) {
  const set = new Set(rows.map(pick));
  return [...set].sort().map((value) => ({ value, label: value }));
}

function cmpStr(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

export function CompetitionsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fx = useRouteFixture();
  const demoSeeded = useDemoSeeded();
  const status = resolveListRouteStatus(fx, demoSeeded);

  const game = searchParams.get("game") ?? "";
  const compStatus = searchParams.get("status") ?? "";
  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "";

  const filtered = useMemo(() => {
    const rows = DEMO_COMPETITIONS.filter((c) => {
      if (game && c.game !== game) return false;
      if (compStatus && c.status !== compStatus) return false;
      if (q && !c.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    const key = sort || "name_asc";
    const sorted = [...rows].sort((a, b) => {
      switch (key) {
        case "name_desc": {
          const v = cmpStr(b.name, a.name);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
        case "game_asc": {
          const v = cmpStr(a.game, b.game);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
        case "status_asc": {
          const v = cmpStr(a.status, b.status);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
        case "name_asc":
        default: {
          const v = cmpStr(a.name, b.name);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
      }
    });
    return sorted;
  }, [compStatus, game, q, sort]);

  const hasActiveFilters = Boolean(game || compStatus || q || sort);
  const filterEmpty =
    demoSeeded && (status === "ready" || status === "partial") && filtered.length === 0 && hasActiveFilters;

  const partialBanner =
    fx.rawFixture === "partial"
      ? "Some competitions are hidden or redacted by policy for this workspace."
      : undefined;

  const filtersDisabled = status === "loading" || status === "error" || status === "empty";

  return (
    <RouteViewRoot
      gateAnalyticsId="competitions"
      status={status}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
      partialBanner={partialBanner}
      empty={{
        analyticsId: "competitions-empty",
        title: "No competitions found",
        body: "Try loading sandbox data to preview this list, or connect a source so competitions sync automatically.",
        primaryCta: { label: "Load sandbox data", action: "load_sandbox" },
        secondaryCta: { label: "Connect a source", action: "goto_sources" },
        onPrimary: () => {
          seedDemoWorkspace("competitions_empty");
          window.location.reload();
        },
        onSecondary: () => navigate("/sources"),
      }}
    >
      <PageFrame
        pageTestId="competitions-page"
        title="Competitions"
        description="Operational list with provenance cues. Filters sync to the URL for shareable views and tests."
        badges={<EnvironmentBadge />}
      >
        <FilterBar
          analyticsId="competitions"
          disabled={filtersDisabled}
          showClearButton={!filterEmpty}
          search={{ param: "q", label: "Search", placeholder: "Search by name" }}
          selects={[
            {
              param: "game",
              label: "Game",
              options: uniqOptions(DEMO_COMPETITIONS, (r) => r.game),
            },
            {
              param: "status",
              label: "Status",
              options: uniqOptions(DEMO_COMPETITIONS, (r) => r.status),
            },
            {
              param: "sort",
              label: "Sort",
              allLabel: "Default (Name A–Z)",
              options: [
                { value: "name_desc", label: "Name Z–A" },
                { value: "game_asc", label: "Game A–Z" },
                { value: "status_asc", label: "Status A–Z" },
              ],
            },
          ]}
        />

        {filterEmpty ? (
          <EmptyState
            analyticsId="competitions-filter-empty"
            title="No competitions match these filters"
            body="Try clearing filters or widening your search. Active filters are saved in the URL so you can share this view."
            primaryCta={{ label: "Clear filters", action: "clear_filters" }}
            secondaryCta={{ label: "View all sources", action: "goto_sources" }}
            onPrimary={() => {
              navigate({
                pathname: "/competitions",
                search: mergeSearchParams(searchParams, {
                  q: null,
                  game: null,
                  status: null,
                  sort: null,
                }).toString(),
              });
            }}
            onSecondary={() => navigate("/sources")}
          />
        ) : (
          <DataTable
            loading={status === "loading"}
            loadingColSpan={4}
            caption="Provenance labels are always visible for trust and certification boundaries."
            columns={[
              { id: "name", header: "Competition", cell: (r) => r.name },
              { id: "game", header: "Game", cell: (r) => r.game },
              { id: "status", header: "Status", cell: (r) => r.status },
              { id: "prov", header: "Provenance", cell: (r) => r.provenance },
            ]}
            rows={filtered}
            onRowClick={(r) => {
              const qs = searchParams.toString();
              persistDetailListSearch("competitions", qs);
              void navigate(`/competitions/${r.id}`, {
                state: { listSearch: qs },
              });
            }}
            getRowLabel={(r) => `Open competition ${r.name}`}
          />
        )}
      </PageFrame>
    </RouteViewRoot>
  );
}
