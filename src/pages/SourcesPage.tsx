import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FreshnessBadge } from "@/components/badges/FreshnessBadge";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { EnvironmentBadge } from "@/components/entity/EnvironmentBadge";
import { FilterBar } from "@/components/filters/FilterBar";
import { PageFrame } from "@/components/layout/PageFrame";
import { DataTable } from "@/components/patterns/DataTable";
import { RouteViewRoot } from "@/components/state/RouteViewRoot";
import { useDemoSeeded } from "@/hooks/useDemoSeeded";
import { useRouteFixture } from "@/hooks/useRouteFixture";
import { freshnessFromIso } from "@/lib/freshness";
import { resolveListRouteStatus } from "@/lib/resolveListRouteStatus";
import { setSourceStatusOverride, getSourceStatusOverride } from "@/lib/sourceOverrides";
import type { SourceRow } from "@/mocks/operational.demo";
import { DEMO_SOURCES } from "@/mocks/operational.demo";
import { DEMO_SOURCE_IMPACT } from "@/mocks/sourceImpact.demo";
import { persistDetailListSearch } from "@/lib/detailListOrigin";
import { mergeSearchParams } from "@/lib/searchParams";
import { emitSetupChanged } from "@/lib/setupEvents";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import { STORAGE_SOURCES_VISITED } from "@/lib/storageKeys";
import { track } from "@/lib/telemetry";

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

function statusOptions(rows: SourceRow[]) {
  const set = new Set(rows.map((r) => r.status));
  return [...set].sort().map((value) => ({ value, label: value }));
}

function cmpStr(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function toTime(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

const STATUS_RANK: Record<SourceRow["status"], number> = {
  healthy: 0,
  degraded: 1,
  paused: 2,
  failed: 3,
};

export function SourcesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fx = useRouteFixture();
  const demoSeeded = useDemoSeeded();
  const status = resolveListRouteStatus(fx, demoSeeded);
  const [pauseTargetId, setPauseTargetId] = useState<string | null>(null);
  const [overrideTick, setOverrideTick] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_SOURCES_VISITED, "1");
    emitSetupChanged();
  }, []);

  const st = searchParams.get("status") ?? "";
  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "";

  const sources = useMemo(() => {
    return DEMO_SOURCES.map((s) => {
      const ovr = getSourceStatusOverride(s.id);
      return ovr ? { ...s, status: ovr } : s;
    });
  }, [overrideTick]);

  const filtered = useMemo(() => {
    const rows = sources.filter((s) => {
      if (st && s.status !== st) return false;
      if (q && !s.displayName.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    const key = sort || "name_asc";
    const sorted = [...rows].sort((a, b) => {
      switch (key) {
        case "name_desc": {
          const v = cmpStr(b.displayName, a.displayName);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
        case "sync_desc": {
          const v = toTime(b.lastSync) - toTime(a.lastSync);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
        case "sync_asc": {
          const v = toTime(a.lastSync) - toTime(b.lastSync);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
        case "health": {
          const v = STATUS_RANK[a.status] - STATUS_RANK[b.status];
          return v !== 0 ? v : cmpStr(a.displayName, b.displayName);
        }
        case "freshness": {
          const fa = freshnessFromIso(a.lastSync).state;
          const fb = freshnessFromIso(b.lastSync).state;
          const rank = (x: string) => (x === "fresh" ? 0 : x === "stale" ? 1 : x === "old" ? 2 : 3);
          const v = rank(fa) - rank(fb);
          return v !== 0 ? v : cmpStr(a.displayName, b.displayName);
        }
        case "name_asc":
        default: {
          const v = cmpStr(a.displayName, b.displayName);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
      }
    });
    return sorted;
  }, [q, sort, sources, st]);

  const hasActiveFilters = Boolean(st || q || sort);
  const filterEmpty =
    demoSeeded && (status === "ready" || status === "partial") && filtered.length === 0 && hasActiveFilters;

  const partialBanner =
    fx.rawFixture === "partial"
      ? "Credential metadata may be hidden for some sources under the current policy."
      : undefined;

  const filtersDisabled = status === "loading" || status === "error" || status === "empty";
  const pauseTarget = pauseTargetId ? sources.find((s) => s.id === pauseTargetId) ?? null : null;
  const pauseImpact =
    pauseTarget != null ? DEMO_SOURCE_IMPACT[pauseTarget.id] ?? { impactedProductCount: 0, impactedProducts: [] } : null;

  return (
    <RouteViewRoot
      gateAnalyticsId="sources"
      status={status}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
      partialBanner={partialBanner}
      empty={{
        analyticsId: "sources-empty",
        title: "No sources connected",
        body: "When you add a source, we validate the connection and show freshness here. Use the control plane checklist if you have not finished setup.",
        primaryCta: { label: "Open setup checklist", action: "setup" },
        secondaryCta: { label: "Load sandbox data", action: "sandbox" },
        onPrimary: () => navigate("/onboarding"),
        onSecondary: () => {
          seedDemoWorkspace("sources_empty_secondary");
          window.location.assign("/home");
        },
      }}
    >
      <PageFrame
        pageTestId="sources-page"
        title="Sources"
        description="Connect feeds and imports. Each connection shows provenance and health on the command center."
        badges={<EnvironmentBadge />}
      >
        <FilterBar
          analyticsId="sources"
          disabled={filtersDisabled}
          showClearButton={!filterEmpty}
          search={{ param: "q", label: "Search", placeholder: "Search by name" }}
          selects={[
            {
              param: "status",
              label: "Health",
              options: statusOptions(sources),
            },
            {
              param: "sort",
              label: "Sort",
              allLabel: "Default (Name A–Z)",
              options: [
                { value: "name_desc", label: "Name Z–A" },
                { value: "health", label: "Health (best → worst)" },
                { value: "freshness", label: "Freshness (fresh → old)" },
                { value: "sync_desc", label: "Last sync (newest)" },
                { value: "sync_asc", label: "Last sync (oldest)" },
              ],
            },
          ]}
        />

        {filterEmpty ? (
          <EmptyState
            analyticsId="sources-filter-empty"
            title="No sources match these filters"
            body="Clear filters to see all sandbox sources again."
            primaryCta={{ label: "Clear filters", action: "clear_filters" }}
            onPrimary={() =>
              navigate({
                pathname: "/sources",
                search: mergeSearchParams(searchParams, { q: null, status: null, sort: null }).toString(),
              })
            }
          />
        ) : (
          <DataTable
            loading={status === "loading"}
            loadingColSpan={6}
            caption="Sandbox preview data. Live credentials and ingestion controls ship in a later iteration."
            columns={[
              { id: "name", header: "Source", cell: (r) => r.displayName },
              { id: "status", header: "Status", cell: (r) => r.status },
              { id: "fresh", header: "Freshness", cell: (r) => <FreshnessBadge iso={r.lastSync} /> },
              { id: "prov", header: "Provenance", cell: (r) => r.provenance },
              { id: "sync", header: "Last sync", cell: (r) => formatSync(r.lastSync) },
              {
                id: "actions",
                header: "Actions",
                cell: (r) => {
                  const canPause = r.status !== "paused";
                  return (
                    <button
                      type="button"
                      className="hg-inline-link"
                      disabled={!canPause}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!canPause) return;
                        setPauseTargetId(r.id);
                      }}
                      aria-label={canPause ? `Pause source ${r.displayName}` : `Source ${r.displayName} is paused`}
                    >
                      {canPause ? "Pause" : "Paused"}
                    </button>
                  );
                },
              },
            ]}
            rows={filtered}
            onRowClick={(r) => {
              const qs = searchParams.toString();
              persistDetailListSearch("sources", qs);
              void navigate(`/sources/${r.id}`, {
                state: { listSearch: qs },
              });
            }}
            getRowLabel={(r) => `Open source ${r.displayName}`}
          />
        )}

        <ConfirmDialog
          open={pauseTarget != null}
          title={pauseTarget ? `Pause “${pauseTarget.displayName}”?` : "Pause source"}
          body="Pausing stops ingestion and downstream updates until resumed. This action is logged."
          details={
            pauseTarget && pauseImpact ? (
              <div>
                <p style={{ margin: 0 }}>
                  <strong>Impact</strong>: {pauseImpact.impactedProductCount} product
                  {pauseImpact.impactedProductCount === 1 ? "" : "s"} may show stale data.
                </p>
                {pauseImpact.impactedProducts.length ? (
                  <ul style={{ margin: "12px 0 0 18px" }}>
                    {pauseImpact.impactedProducts.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null
          }
          confirmLabel="Pause source"
          tone="danger"
          onCancel={() => setPauseTargetId(null)}
          onConfirm={() => {
            if (!pauseTarget) return;
            setSourceStatusOverride(pauseTarget.id, "paused");
            track("source_paused", {
              sourceId: pauseTarget.id,
              impactedProductCount: pauseImpact?.impactedProductCount ?? 0,
            });
            setOverrideTick((v) => v + 1);
            setPauseTargetId(null);
          }}
          testId="pause-source-dialog"
        />
      </PageFrame>
    </RouteViewRoot>
  );
}
