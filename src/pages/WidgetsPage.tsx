import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "@/pages/WidgetsPage.module.css";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import dlg from "@/components/dialogs/ConfirmDialog.module.css";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { EnvironmentBadge } from "@/components/entity/EnvironmentBadge";
import { FilterBar } from "@/components/filters/FilterBar";
import { PageFrame } from "@/components/layout/PageFrame";
import { DataTable } from "@/components/patterns/DataTable";
import { RouteViewRoot } from "@/components/state/RouteViewRoot";
import { useDemoSeeded } from "@/hooks/useDemoSeeded";
import { useRouteFixture } from "@/hooks/useRouteFixture";
import {
  addWidgetPublishedId,
  readWidgetPublishedIds,
} from "@/lib/productizationStorage";
import { resolveListRouteStatus } from "@/lib/resolveListRouteStatus";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import { mergeSearchParams } from "@/lib/searchParams";
import { track } from "@/lib/telemetry";
import { DEMO_WIDGETS, type WidgetRow } from "@/mocks/productization.demo";

function cmpStr(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function toTime(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

function uniqOptions(rows: WidgetRow[], pick: (r: WidgetRow) => string) {
  const set = new Set(rows.map(pick));
  return [...set].sort().map((value) => ({ value, label: value }));
}

export function WidgetsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fx = useRouteFixture();
  const demoSeeded = useDemoSeeded();
  const status = resolveListRouteStatus(fx, demoSeeded);

  const [publishId, setPublishId] = useState<string | null>(null);
  const [storageTick, setStorageTick] = useState(0);

  const env = searchParams.get("env") ?? "";
  const st = searchParams.get("status") ?? "";
  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const previewParam = searchParams.get("preview");
  const preview = previewParam === "live" ? "live" : "sandbox";

  const mergedRows = useMemo(() => {
    void storageTick;
    const published = readWidgetPublishedIds();
    return DEMO_WIDGETS.map((w) =>
      published.has(w.id) ? { ...w, status: "published" as const } : w
    );
  }, [storageTick]);

  const rows = useMemo(() => {
    const filtered = mergedRows.filter((r) => {
      if (env && r.environment !== env) return false;
      if (st && r.status !== st) return false;
      if (q) {
        const needle = q.toLowerCase();
        const hay = `${r.title} ${r.productName} ${r.environment} ${r.status}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    const key = sort || "updated_desc";
    return [...filtered].sort((a, b) => {
      switch (key) {
        case "name_asc": {
          const v = cmpStr(a.title, b.title);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
        case "name_desc": {
          const v = cmpStr(b.title, a.title);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
        case "updated_asc": {
          const v = toTime(a.updatedAt) - toTime(b.updatedAt);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
        case "updated_desc":
        default: {
          const v = toTime(b.updatedAt) - toTime(a.updatedAt);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
      }
    });
  }, [env, mergedRows, q, sort, st]);

  const hasActiveFilters = Boolean(env || st || q || sort || previewParam === "live");
  const filterEmpty =
    demoSeeded && (status === "ready" || status === "partial") && rows.length === 0 && hasActiveFilters;

  const partialBanner =
    fx.rawFixture === "partial"
      ? "Live widget payloads may omit restricted fields compared to sandbox previews."
      : undefined;

  const filtersDisabled = status === "loading" || status === "error" || status === "empty";

  const previewBanner =
    preview === "live"
      ? "Preview parity mode: responses mirror live policy masking (still using sandbox traffic)."
      : "Sandbox preview: fixtures only; no billing or partner traffic.";

  const publishTarget = publishId ? mergedRows.find((w) => w.id === publishId) ?? null : null;

  return (
    <RouteViewRoot
      gateAnalyticsId="widgets"
      status={status}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
      partialBanner={partialBanner}
      empty={{
        analyticsId: "widgets-empty",
        title: "No widgets yet",
        body: "Publish embeddable views backed by data products. Load sandbox data to try publish flows in a safe environment.",
        primaryCta: { label: "Load sandbox data", action: "load_sandbox" },
        secondaryCta: { label: "Back to Home", action: "goto_home" },
        onPrimary: () => {
          seedDemoWorkspace("widgets_empty");
          window.location.assign("/widgets");
        },
        onSecondary: () => navigate("/home"),
      }}
    >
      <PageFrame
        pageTestId="widgets-page"
        title="Widgets"
        description="Embeds and tickers with sandbox vs live preview toggles."
        badges={<EnvironmentBadge />}
      >
        <p data-testid="widget-preview-banner" style={{ marginBottom: 16, color: "var(--color-text-muted)" }}>
          {previewBanner}
        </p>
        <div className={styles.previewToggle} role="group" aria-label="Preview mode" data-testid="widget-preview-toggle">
          <button
            type="button"
            className={preview === "sandbox" ? styles.previewBtnActive : styles.previewBtn}
            aria-pressed={preview === "sandbox"}
            disabled={filtersDisabled}
            onClick={() =>
              navigate({
                pathname: "/widgets",
                search: mergeSearchParams(searchParams, { preview: "sandbox" }).toString(),
              })
            }
          >
            Sandbox fixtures
          </button>
          <button
            type="button"
            className={preview === "live" ? styles.previewBtnActive : styles.previewBtn}
            aria-pressed={preview === "live"}
            disabled={filtersDisabled}
            onClick={() =>
              navigate({
                pathname: "/widgets",
                search: mergeSearchParams(searchParams, { preview: "live" }).toString(),
              })
            }
          >
            Live parity
          </button>
        </div>
        <FilterBar
          analyticsId="widgets"
          disabled={filtersDisabled}
          showClearButton={!filterEmpty}
          search={{ param: "q", label: "Search", placeholder: "Search widgets or products" }}
          selects={[
            {
              param: "env",
              label: "Environment",
              allLabel: "All",
              options: uniqOptions(mergedRows, (r) => r.environment),
            },
            {
              param: "status",
              label: "Status",
              allLabel: "All",
              options: uniqOptions(mergedRows, (r) => r.status),
            },
            {
              param: "sort",
              label: "Sort",
              allLabel: "Default (Last updated)",
              options: [
                { value: "updated_asc", label: "Last updated (oldest)" },
                { value: "name_asc", label: "Title A–Z" },
                { value: "name_desc", label: "Title Z–A" },
              ],
            },
          ]}
        />

        {filterEmpty ? (
          <EmptyState
            analyticsId="widgets-filter-empty"
            title="No widgets match these filters"
            body="Clear filters or switch preview mode."
            primaryCta={{ label: "Clear filters", action: "clear_filters" }}
            onPrimary={() =>
              navigate({
                pathname: "/widgets",
                search: mergeSearchParams(searchParams, {
                  q: null,
                  env: null,
                  status: null,
                  sort: null,
                  preview: null,
                }).toString(),
              })
            }
          />
        ) : (
          <DataTable
            loading={status === "loading"}
            loadingColSpan={6}
            caption="Publish promotes a draft to the selected environment subject to role policy."
            columns={[
              { id: "title", header: "Widget", cell: (r) => r.title },
              { id: "product", header: "Data product", cell: (r) => r.productName },
              { id: "env", header: "Environment", cell: (r) => r.environment },
              { id: "status", header: "Status", cell: (r) => r.status },
              { id: "updated", header: "Updated", cell: (r) => new Date(r.updatedAt).toLocaleString() },
              {
                id: "actions",
                header: "",
                cell: (r) =>
                  r.status === "draft" ? (
                    <button type="button" className={dlg.btn} onClick={() => setPublishId(r.id)}>
                      Publish…
                    </button>
                  ) : (
                    <span style={{ color: "var(--color-text-muted)" }}>Live</span>
                  ),
              },
            ]}
            rows={rows}
          />
        )}
      </PageFrame>

      <ConfirmDialog
        open={publishTarget != null}
        title={publishTarget ? `Publish “${publishTarget.title}”?` : "Publish widget"}
        body="Publishing applies the current data product policy and environment routing."
        confirmLabel="Publish widget"
        cancelLabel="Cancel"
        onCancel={() => setPublishId(null)}
        onConfirm={() => {
          if (!publishTarget) return;
          addWidgetPublishedId(publishTarget.id);
          track("widget_published", {
            widgetId: publishTarget.id,
            environment: publishTarget.environment,
          });
          setPublishId(null);
          setStorageTick((t) => t + 1);
        }}
        testId="publish-widget-dialog"
      />
    </RouteViewRoot>
  );
}
