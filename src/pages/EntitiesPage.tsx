import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { EnvironmentBadge } from "@/components/entity/EnvironmentBadge";
import { FilterBar } from "@/components/filters/FilterBar";
import { PageFrame } from "@/components/layout/PageFrame";
import { DataTable } from "@/components/patterns/DataTable";
import { RouteViewRoot } from "@/components/state/RouteViewRoot";
import { useDemoSeeded } from "@/hooks/useDemoSeeded";
import { useRouteFixture } from "@/hooks/useRouteFixture";
import { persistDetailListSearch } from "@/lib/detailListOrigin";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import { mergeSearchParams } from "@/lib/searchParams";
import { resolveListRouteStatus } from "@/lib/resolveListRouteStatus";
import { DEMO_ENTITY_SUMMARIES, type EntitySummaryRow } from "@/mocks/entities.demo";

function cmpStr(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function toTime(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

function uniqOptions(rows: EntitySummaryRow[], pick: (r: EntitySummaryRow) => string) {
  const set = new Set(rows.map(pick));
  return [...set].sort().map((value) => ({ value, label: value }));
}

export function EntitiesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fx = useRouteFixture();
  const demoSeeded = useDemoSeeded();
  const status = resolveListRouteStatus(fx, demoSeeded);

  const type = searchParams.get("type") ?? "";
  const st = searchParams.get("status") ?? "";
  const game = searchParams.get("game") ?? "";
  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "";

  const rows = useMemo(() => {
    const filtered = DEMO_ENTITY_SUMMARIES.filter((e) => {
      if (type && e.type !== type) return false;
      if (st && e.status !== st) return false;
      if (game && e.primaryGame !== game) return false;
      if (q) {
        const needle = q.toLowerCase();
        const hay = `${e.displayName} ${e.type} ${e.primaryGame} ${e.status} ${e.provenance}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });

    const key = sort || "updated_desc";
    const sorted = [...filtered].sort((a, b) => {
      switch (key) {
        case "name_asc": {
          const v = cmpStr(a.displayName, b.displayName);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
        case "name_desc": {
          const v = cmpStr(b.displayName, a.displayName);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
        case "updated_asc": {
          const v = toTime(a.lastUpdatedAt) - toTime(b.lastUpdatedAt);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
        case "updated_desc":
        default: {
          const v = toTime(b.lastUpdatedAt) - toTime(a.lastUpdatedAt);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
      }
    });
    return sorted;
  }, [game, q, sort, st, type]);

  const hasActiveFilters = Boolean(type || st || game || q || sort);
  const filterEmpty =
    demoSeeded && (status === "ready" || status === "partial") && rows.length === 0 && hasActiveFilters;

  const partialBanner =
    fx.rawFixture === "partial"
      ? "Some entity attributes (aliases, linked accounts) may be withheld under policy."
      : undefined;

  const filtersDisabled = status === "loading" || status === "error" || status === "empty";

  return (
    <RouteViewRoot
      gateAnalyticsId="entities"
      status={status}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
      partialBanner={partialBanner}
      empty={{
        analyticsId: "entities-empty",
        title: "No entities yet",
        body: "Load sandbox preview data to inspect players/teams, or connect a source so the directory populates automatically.",
        primaryCta: { label: "Load sandbox data", action: "load_sandbox" },
        secondaryCta: { label: "Back to Home", action: "goto_home" },
        onPrimary: () => {
          seedDemoWorkspace("entities_empty");
          window.location.assign("/entities");
        },
        onSecondary: () => navigate("/home"),
      }}
    >
      <PageFrame
        pageTestId="entities-page"
        title="Entities"
        description="Directory of teams and players with alias-safe display and deterministic filters."
        badges={<EnvironmentBadge />}
      >
        <FilterBar
          analyticsId="entities"
          disabled={filtersDisabled}
          showClearButton={!filterEmpty}
          search={{ param: "q", label: "Search", placeholder: "Search names, games, provenance" }}
          selects={[
            { param: "type", label: "Type", allLabel: "All", options: uniqOptions(DEMO_ENTITY_SUMMARIES, (r) => r.type) },
            {
              param: "status",
              label: "Status",
              allLabel: "All",
              options: uniqOptions(DEMO_ENTITY_SUMMARIES, (r) => r.status),
            },
            {
              param: "game",
              label: "Game",
              allLabel: "All",
              options: uniqOptions(DEMO_ENTITY_SUMMARIES, (r) => r.primaryGame),
            },
            {
              param: "sort",
              label: "Sort",
              allLabel: "Default (Last updated)",
              options: [
                { value: "updated_asc", label: "Last updated (oldest)" },
                { value: "name_asc", label: "Name A–Z" },
                { value: "name_desc", label: "Name Z–A" },
              ],
            },
          ]}
        />

        {filterEmpty ? (
          <EmptyState
            analyticsId="entities-filter-empty"
            title="No entities match these filters"
            body="Clear filters or adjust your search. Filter state is saved in the URL for reproducible QA."
            primaryCta={{ label: "Clear filters", action: "clear_filters" }}
            onPrimary={() =>
              navigate({
                pathname: "/entities",
                search: mergeSearchParams(searchParams, {
                  q: null,
                  type: null,
                  status: null,
                  game: null,
                  sort: null,
                }).toString(),
              })
            }
          />
        ) : (
          <DataTable
            loading={status === "loading"}
            loadingColSpan={6}
            caption="Alias-safe display: profiles preserve alternate handles without changing the primary name."
            columns={[
              { id: "name", header: "Entity", cell: (r) => r.displayName },
              { id: "type", header: "Type", cell: (r) => r.type },
              { id: "status", header: "Status", cell: (r) => r.status },
              { id: "game", header: "Game", cell: (r) => r.primaryGame },
              { id: "prov", header: "Provenance", cell: (r) => r.provenance },
              { id: "updated", header: "Updated", cell: (r) => new Date(r.lastUpdatedAt).toLocaleString() },
            ]}
            rows={rows}
            onRowClick={(r) => {
              const qs = searchParams.toString();
              persistDetailListSearch("entities", qs);
              void navigate(`/entities/${r.id}`, { state: { listSearch: qs } });
            }}
            getRowLabel={(r) => `Open entity ${r.displayName}`}
          />
        )}
      </PageFrame>
    </RouteViewRoot>
  );
}

