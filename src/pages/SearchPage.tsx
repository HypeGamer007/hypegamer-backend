import { useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { EnvironmentBadge } from "@/components/entity/EnvironmentBadge";
import { FilterBar } from "@/components/filters/FilterBar";
import { PageFrame } from "@/components/layout/PageFrame";
import { RouteViewRoot } from "@/components/state/RouteViewRoot";
import { useRouteFixture } from "@/hooks/useRouteFixture";
import type { ViewStatus } from "@/ui/contracts/states";
import { mergeSearchParams } from "@/lib/searchParams";
import { track } from "@/lib/telemetry";
import { SEARCH_DEMO, type SearchDemoResult } from "@/mocks/search.demo";

function matchesQuery(row: SearchDemoResult, q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return false;
  const hay = `${row.title} ${row.subtitle} ${row.matchTerms.join(" ")}`.toLowerCase();
  return hay.includes(needle);
}

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fx = useRouteFixture();
  /** Mock-first: search is always a teaching surface unless `?fixture=` overrides (same pattern as Home). */
  const status: ViewStatus = fx.rawFixture ? fx.status : "ready";

  const q = searchParams.get("q") ?? "";
  const filtersDisabled = status === "loading" || status === "error" || status === "empty";

  const hits = useMemo(() => {
    if (!q.trim()) return [];
    return SEARCH_DEMO.results.filter((r) => matchesQuery(r, q));
  }, [q]);

  useEffect(() => {
    if (!q.trim() || filtersDisabled) return;
    track("search_run", {
      queryLength: q.trim().length,
      resultCount: hits.length,
      restrictedCount: fx.restricted ? Math.min(1, hits.length) : 0,
    });
  }, [q, filtersDisabled, hits.length, fx.restricted]);

  const partialBanner =
    fx.rawFixture === "partial"
      ? "Some mock results may be hidden under the current policy preview."
      : fx.restricted && hits.length > 0
        ? "Restricted preview: counts reflect policy-limited rows your role may not open in production."
        : undefined;

  return (
    <RouteViewRoot
      gateAnalyticsId="search_notifications"
      status={status}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
      partialBanner={partialBanner}
      empty={
        fx.rawFixture === "empty"
          ? {
              analyticsId: "search-empty",
              title: "Search offline in this fixture",
              body: "Use `?fixture=` default or load another module; this state is for empty-matrix tests only.",
              secondaryCta: { label: "Back to Home", action: "goto_home" },
              onSecondary: () => navigate("/home"),
            }
          : undefined
      }
    >
      <PageFrame
        pageTestId="search-page"
        title="Search"
        description="Mock workspace search: fixture-backed matches only. Your CTO will wire real indices later."
        badges={<EnvironmentBadge />}
      >
        <p style={{ margin: "0 0 16px", color: "var(--color-text-muted)", fontSize: "0.875rem", lineHeight: 1.45 }}>
          Try: {SEARCH_DEMO.hintQueries.join(", ")} — results deep-link into the same Ancient Major demo spine as the
          Home story (sources, competition detail, products, trust).
        </p>

        <FilterBar
          analyticsId="workspace_search"
          disabled={filtersDisabled}
          showClearButton={Boolean(q)}
          search={{ param: "q", label: "Search", placeholder: "Search mock workspace…" }}
        />

        {(status === "ready" || status === "partial") && !filtersDisabled ? (
          !q.trim() ? (
            <EmptyState
              analyticsId="search-idle"
              title="Enter a query"
              body="URL-synced `q` filters the demo catalog. No requests leave the browser."
              announce={false}
            />
          ) : hits.length === 0 ? (
            <EmptyState
              analyticsId="search-no-results"
              title="No mock matches"
              body="Adjust your query or pick a hint from the line above."
              primaryCta={{ label: "Clear search", action: "clear_search" }}
              onPrimary={() =>
                navigate({ pathname: "/search", search: mergeSearchParams(searchParams, { q: null }).toString() })
              }
              announce={false}
            />
          ) : (
            <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0 }} data-testid="search-results">
              {hits.map((r) => (
                <li
                  key={r.id}
                  style={{
                    marginBottom: 10,
                    padding: "12px 14px",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-surface)",
                  }}
                >
                  <Link to={r.route} style={{ fontWeight: 600, color: "var(--color-accent)", textDecoration: "none" }}>
                    {r.title}
                  </Link>
                  <p style={{ margin: "6px 0 0", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>{r.subtitle}</p>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </PageFrame>
    </RouteViewRoot>
  );
}
