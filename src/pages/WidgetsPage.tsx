import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { isLiveWidgetPublishBlocked } from "@/lib/dataProductPolicy";
import {
  addWidgetPublishedId,
  addWidgetUnpublishedId,
  readExtraDataProducts,
  readWidgetPublishedIds,
  readWidgetUnpublishedIds,
  removeWidgetPublishedId,
} from "@/lib/productizationStorage";
import { resolveListRouteStatus } from "@/lib/resolveListRouteStatus";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import { mergeSearchParams } from "@/lib/searchParams";
import { track } from "@/lib/telemetry";
import { DEMO_DATA_PRODUCTS, DEMO_WIDGETS, type WidgetRow } from "@/mocks/productization.demo";

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
  const [unpublishId, setUnpublishId] = useState<string | null>(null);
  const [policyBlockBody, setPolicyBlockBody] = useState<string | null>(null);
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
    const unpublished = readWidgetUnpublishedIds();
    return DEMO_WIDGETS.map((w) => {
      if (unpublished.has(w.id)) return { ...w, status: "draft" as const };
      if (published.has(w.id)) return { ...w, status: "published" as const };
      return w;
    });
  }, [storageTick]);

  const productCatalog = useMemo(() => {
    void storageTick;
    return [...DEMO_DATA_PRODUCTS, ...readExtraDataProducts()];
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
  const unpublishTarget = unpublishId ? mergedRows.find((w) => w.id === unpublishId) ?? null : null;

  const embedSrcDoc = useMemo(() => {
    if (fx.restricted) return "";
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:system-ui;margin:8px"><p>Demo embed (fixture).</p><p data-testid="embed-marker" id="embed-marker">DEMO_EMBED_MARKER</p></body></html>`;
  }, [fx.restricted]);

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
        <p style={{ margin: "0 0 16px", color: "var(--color-text-muted)", fontSize: "0.875rem", lineHeight: 1.45 }}>
          Live embed access is governed by{" "}
          <Link to="/partners" data-testid="widgets-link-partner-grants">
            partner grants
          </Link>{" "}
          (mock matrix); keep sandbox and production tokens separated.
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
        {!filtersDisabled && (status === "ready" || status === "partial") ? (
          <section
            aria-labelledby="embed-preview-h"
            style={{
              marginBottom: 20,
              padding: "12px 14px",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-surface)",
            }}
          >
            <h2 id="embed-preview-h" style={{ margin: "0 0 8px", fontSize: "0.9375rem" }}>
              Embed preview (iframe)
            </h2>
            {fx.restricted ? (
              <p
                data-testid="widget-embed-restricted"
                style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.45 }}
              >
                Preview HTML is withheld under restricted policy. Production would still stream redacted metrics only —
                no raw PII in embed documents.
              </p>
            ) : (
              <iframe
                title="Widget embed sandbox preview"
                sandbox=""
                srcDoc={embedSrcDoc}
                data-testid="widget-embed-preview-frame"
                style={{ width: "100%", minHeight: 120, border: "1px solid var(--color-border)", borderRadius: 4 }}
              />
            )}
          </section>
        ) : null}

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
            caption="Publish promotes a draft to the selected environment subject to role policy. Unpublish clears demo persistence only."
            columns={[
              { id: "title", header: "Widget", cell: (r) => r.title },
              { id: "product", header: "Data product", cell: (r) => r.productName },
              { id: "env", header: "Environment", cell: (r) => r.environment },
              { id: "status", header: "Status", cell: (r) => r.status },
              { id: "updated", header: "Updated", cell: (r) => new Date(r.updatedAt).toLocaleString() },
              {
                id: "actions",
                header: "",
                cell: (r) => {
                  if (r.status === "published") {
                    return (
                      <button type="button" className={dlg.btn} onClick={() => setUnpublishId(r.id)}>
                        Unpublish…
                      </button>
                    );
                  }
                  const blocked = isLiveWidgetPublishBlocked(r, productCatalog);
                  return (
                    <button
                      type="button"
                      className={dlg.btn}
                      onClick={() => {
                        if (blocked) {
                          setPolicyBlockBody(
                            `“${r.title}” is tied to a community-tier data product. Live publish is blocked until a certified overlay exists (mock policy gate). Use sandbox or change backing product.`,
                          );
                          return;
                        }
                        setPublishId(r.id);
                      }}
                    >
                      Publish…
                    </button>
                  );
                },
              },
            ]}
            rows={rows}
          />
        )}
      </PageFrame>

      <ConfirmDialog
        open={unpublishTarget != null}
        title={unpublishTarget ? `Unpublish “${unpublishTarget.title}”?` : "Unpublish widget"}
        body="Removes the published flag in this browser session only. Live CDN invalidation is out of scope for the mock."
        confirmLabel="Unpublish"
        tone="danger"
        cancelLabel="Cancel"
        onCancel={() => setUnpublishId(null)}
        onConfirm={() => {
          if (!unpublishTarget) return;
          removeWidgetPublishedId(unpublishTarget.id);
          addWidgetUnpublishedId(unpublishTarget.id);
          track("widget_unpublished", {
            widgetId: unpublishTarget.id,
            environment: unpublishTarget.environment,
          });
          setUnpublishId(null);
          setStorageTick((t) => t + 1);
        }}
        testId="unpublish-widget-dialog"
      />

      <ConfirmDialog
        open={publishTarget != null}
        title={publishTarget ? `Publish “${publishTarget.title}”?` : "Publish widget"}
        body="Publishing applies the current data product policy and environment routing."
        confirmLabel="Publish widget"
        cancelLabel="Cancel"
        onCancel={() => setPublishId(null)}
        onConfirm={() => {
          if (!publishTarget) return;
          if (isLiveWidgetPublishBlocked(publishTarget, productCatalog)) {
            setPublishId(null);
            setPolicyBlockBody("Live publish blocked for community-backed products (policy).");
            return;
          }
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

      {policyBlockBody ? (
        <div
          className={dlg.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="widget-policy-title"
          data-testid="widget-policy-block-dialog"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPolicyBlockBody(null);
          }}
        >
          <div className={dlg.dialog}>
            <h2 className={dlg.title} id="widget-policy-title">
              Cannot publish
            </h2>
            <p className={dlg.body}>{policyBlockBody}</p>
            <div className={dlg.actions}>
              <button type="button" className={`${dlg.btn} ${dlg.primary}`} onClick={() => setPolicyBlockBody(null)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </RouteViewRoot>
  );
}
