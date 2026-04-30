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
import type { MatchRow } from "@/mocks/operational.demo";
import { DEMO_MATCHES } from "@/mocks/operational.demo";

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

function cmpStr(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function toTime(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

function uniqCompetitions(rows: MatchRow[]) {
  const set = new Set(rows.map((r) => r.competition));
  return [...set].sort().map((value) => ({ value, label: value }));
}

function uniqProvenance(rows: MatchRow[]) {
  const set = new Set(rows.map((r) => r.provenance));
  return [...set].sort().map((value) => ({ value, label: value }));
}

export function MatchesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fx = useRouteFixture();
  const demoSeeded = useDemoSeeded();
  const status = resolveListRouteStatus(fx, demoSeeded);

  const competition = searchParams.get("competition") ?? "";
  const prov = searchParams.get("prov") ?? "";
  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "";

  const filtered = useMemo(() => {
    const rows = DEMO_MATCHES.filter((m) => {
      if (competition && m.competition !== competition) return false;
      if (prov && m.provenance !== prov) return false;
      if (q) {
        const needle = q.toLowerCase();
        const hay = `${m.competition} ${m.phase} ${m.provenance}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    const key = sort || "scheduled_asc";
    const sorted = [...rows].sort((a, b) => {
      switch (key) {
        case "scheduled_desc": {
          const v = toTime(b.scheduledAt) - toTime(a.scheduledAt);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
        case "competition_asc": {
          const v = cmpStr(a.competition, b.competition);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
        case "prov_asc": {
          const v = cmpStr(a.provenance, b.provenance);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
        case "scheduled_asc":
        default: {
          const v = toTime(a.scheduledAt) - toTime(b.scheduledAt);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
      }
    });
    return sorted;
  }, [competition, prov, q, sort]);

  const hasActiveFilters = Boolean(competition || prov || q || sort);
  const filterEmpty =
    demoSeeded && (status === "ready" || status === "partial") && filtered.length === 0 && hasActiveFilters;

  const partialBanner =
    fx.rawFixture === "partial"
      ? "Some match details are incomplete or withheld under the current policy scope."
      : undefined;

  const filtersDisabled = status === "loading" || status === "error" || status === "empty";

  return (
    <RouteViewRoot
      gateAnalyticsId="matches"
      status={status}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
      partialBanner={partialBanner}
      empty={{
        analyticsId: "matches-empty",
        title: "No matches found",
        body: "Matches appear when competitions sync from a connected source, or when you load sandbox preview data.",
        primaryCta: { label: "Load sandbox data", action: "load_sandbox" },
        secondaryCta: { label: "View competitions", action: "goto_competitions" },
        onPrimary: () => {
          seedDemoWorkspace("matches_empty");
          window.location.reload();
        },
        onSecondary: () => navigate("/competitions"),
      }}
    >
      <PageFrame
        pageTestId="matches-page"
        title="Matches"
        description="Operational match list with scheduling and provenance. Filters sync to the URL."
        badges={<EnvironmentBadge />}
      >
        <FilterBar
          analyticsId="matches"
          disabled={filtersDisabled}
          showClearButton={!filterEmpty}
          search={{ param: "q", label: "Search", placeholder: "Search matches" }}
          selects={[
            {
              param: "competition",
              label: "Competition",
              options: uniqCompetitions(DEMO_MATCHES),
            },
            {
              param: "prov",
              label: "Provenance",
              options: uniqProvenance(DEMO_MATCHES),
            },
            {
              param: "sort",
              label: "Sort",
              allLabel: "Default (Soonest first)",
              options: [
                { value: "scheduled_desc", label: "Latest first" },
                { value: "competition_asc", label: "Competition A–Z" },
                { value: "prov_asc", label: "Provenance A–Z" },
              ],
            },
          ]}
        />

        {filterEmpty ? (
          <EmptyState
            analyticsId="matches-filter-empty"
            title="No matches match these filters"
            body="Clear filters or pick a different competition. The URL reflects your selections for reproducible QA."
            primaryCta={{ label: "Clear filters", action: "clear_filters" }}
            secondaryCta={{ label: "Back to competitions", action: "goto_competitions" }}
            onPrimary={() =>
              navigate({
                pathname: "/matches",
                search: mergeSearchParams(searchParams, {
                  q: null,
                  competition: null,
                  prov: null,
                  sort: null,
                }).toString(),
              })
            }
            onSecondary={() => navigate("/competitions")}
          />
        ) : (
          <DataTable
            loading={status === "loading"}
            loadingColSpan={4}
            columns={[
              { id: "comp", header: "Competition", cell: (m) => m.competition },
              { id: "phase", header: "Phase", cell: (m) => m.phase },
              { id: "when", header: "Scheduled", cell: (m) => formatWhen(m.scheduledAt) },
              { id: "prov", header: "Provenance", cell: (m) => m.provenance },
            ]}
            rows={filtered}
            onRowClick={(m) => {
              const qs = searchParams.toString();
              persistDetailListSearch("matches", qs);
              void navigate(`/matches/${m.id}`, {
                state: { listSearch: qs },
              });
            }}
            getRowLabel={(m) => `Open match ${m.competition} ${m.phase}`}
          />
        )}
      </PageFrame>
    </RouteViewRoot>
  );
}
