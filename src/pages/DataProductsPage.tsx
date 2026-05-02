import { useId, useMemo, useState } from "react";
import { dataProductsWithPolicyConflict } from "@/lib/dataProductPolicy";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  readExtraDataProducts,
  writeExtraDataProducts,
} from "@/lib/productizationStorage";
import { resolveListRouteStatus } from "@/lib/resolveListRouteStatus";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import { mergeSearchParams } from "@/lib/searchParams";
import { track } from "@/lib/telemetry";
import {
  DEMO_DATA_PRODUCTS,
  type DataProductRow,
} from "@/mocks/productization.demo";

function cmpStr(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function toTime(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

function uniqOptions(rows: DataProductRow[], pick: (r: DataProductRow) => string) {
  const set = new Set(rows.map(pick));
  return [...set].sort().map((value) => ({ value, label: value }));
}

const ENTITY_TYPES: DataProductRow["entityType"][] = [
  "competition",
  "match",
  "team",
  "player",
];

export function DataProductsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fx = useRouteFixture();
  const demoSeeded = useDemoSeeded();
  const status = resolveListRouteStatus(fx, demoSeeded);

  const [storageTick, setStorageTick] = useState(0);
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftEntityType, setDraftEntityType] =
    useState<DataProductRow["entityType"]>("competition");

  const titleId = useId();
  const bodyId = useId();

  const type = searchParams.get("type") ?? "";
  const st = searchParams.get("status") ?? "";
  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "";

  const catalog = useMemo(() => {
    void storageTick;
    return [...DEMO_DATA_PRODUCTS, ...readExtraDataProducts()];
  }, [storageTick]);

  const policyConflicts = useMemo(() => dataProductsWithPolicyConflict(catalog), [catalog]);

  const rows = useMemo(() => {
    const base = catalog;
    const filtered = base.filter((r) => {
      if (type && r.entityType !== type) return false;
      if (st && r.status !== st) return false;
      if (q) {
        const needle = q.toLowerCase();
        const hay = `${r.name} ${r.entityType} ${r.status}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    const key = sort || "updated_desc";
    return [...filtered].sort((a, b) => {
      switch (key) {
        case "name_asc": {
          const v = cmpStr(a.name, b.name);
          return v !== 0 ? v : cmpStr(a.id, b.id);
        }
        case "name_desc": {
          const v = cmpStr(b.name, a.name);
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
  }, [catalog, q, sort, st, type]);

  const hasActiveFilters = Boolean(type || st || q || sort);
  const filterEmpty =
    demoSeeded && (status === "ready" || status === "partial") && rows.length === 0 && hasActiveFilters;

  const partialBanner =
    fx.rawFixture === "partial"
      ? "Some eligibility rules may be hidden until policy review completes."
      : undefined;

  const filtersDisabled = status === "loading" || status === "error" || status === "empty";

  const playerPolicyNote =
    draftEntityType === "player"
      ? "Player-facing extracts may require an integrity reviewer before publish."
      : null;

  const saveDraft = () => {
    const name = draftName.trim() || "Untitled draft";
    const id = `dp_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
    const row: DataProductRow = {
      id,
      name,
      entityType: draftEntityType,
      status: "draft",
      fieldCount: 0,
      updatedAt: new Date().toISOString(),
      ingestionTier: draftEntityType === "player" || draftEntityType === "match" ? "community" : "certified",
    };
    const next = [...readExtraDataProducts(), row];
    writeExtraDataProducts(next);
    track("data_product_created", {
      dataProductId: id,
      entityType: draftEntityType,
    });
    setDraftOpen(false);
    setDraftName("");
    setDraftEntityType("competition");
    setStorageTick((t) => t + 1);
  };

  return (
    <RouteViewRoot
      gateAnalyticsId="data_products"
      status={status}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
      partialBanner={partialBanner}
      empty={{
        analyticsId: "data-products-empty",
        title: "No data products yet",
        body: "Create curated feeds from competitions, matches, teams, or players. Load sandbox data to explore sample drafts and published products.",
        primaryCta: { label: "Load sandbox data", action: "load_sandbox" },
        secondaryCta: { label: "Back to Home", action: "goto_home" },
        onPrimary: () => {
          seedDemoWorkspace("data_products_empty");
          window.location.assign("/data-products");
        },
        onSecondary: () => navigate("/home"),
      }}
    >
      <PageFrame
        pageTestId="data-products-page"
        title="Data products"
        description="Schema-bound extracts you can publish to widgets and partner contracts."
        badges={<EnvironmentBadge />}
        actions={
          <button
            type="button"
            className={dlg.btn}
            disabled={filtersDisabled}
            onClick={() => setDraftOpen(true)}
          >
            New draft
          </button>
        }
      >
        {demoSeeded && (status === "ready" || status === "partial") && !filtersDisabled ? (
          <>
            {policyConflicts.length ? (
              <div
                role="alert"
                data-testid="data-products-policy-conflicts"
                style={{
                  marginBottom: 16,
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid color-mix(in srgb, var(--color-text) 25%, var(--color-border))",
                  background: "color-mix(in srgb, var(--color-text) 6%, var(--color-surface))",
                }}
              >
                <strong style={{ display: "block", marginBottom: 8 }}>Policy conflict — community drafts</strong>
                <p style={{ margin: "0 0 8px", fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.45 }}>
                  These drafts ingest <strong>community</strong> tier sources. Publishing to live widgets or certified-only
                  paths is blocked until a certified overlay or reviewer exception exists (mock rule).
                </p>
                <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.875rem" }}>
                  {policyConflicts.map((r) => (
                    <li key={r.id}>{r.name}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <section
              aria-labelledby="dp-matrix-h"
              data-testid="data-products-policy-matrix"
              style={{
                marginBottom: 20,
                padding: "12px 14px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                background: "var(--color-surface)",
              }}
            >
              <h2 id="dp-matrix-h" style={{ margin: "0 0 8px", fontSize: "0.9375rem" }}>
                Extract eligibility matrix (demo)
              </h2>
              <p style={{ margin: "0 0 10px", fontSize: "0.8125rem", color: "var(--color-text-muted)", lineHeight: 1.45 }}>
                Invalid combinations show as <strong>conflict</strong>. Certified and community streams stay visually
                distinct per product rules.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}
                  aria-label="Entity type versus ingestion tier eligibility (read-only demo)"
                >
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--color-border)" }}>
                        Entity
                      </th>
                      <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--color-border)" }}>
                        Certified path
                      </th>
                      <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--color-border)" }}>
                        Community path
                      </th>
                      <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--color-border)" }}>
                        Live widget
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--color-border)" }}>Competition</td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--color-border)" }}>Allowed</td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--color-border)" }}>Review</td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--color-border)" }}>Review</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--color-border)" }}>Match</td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--color-border)" }}>Allowed</td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--color-border)" }}>
                        <strong>Conflict</strong> if live
                      </td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--color-border)" }}>Blocked</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--color-border)" }}>Player</td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--color-border)" }}>Allowed</td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--color-border)" }}>Restricted</td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--color-border)" }}>Blocked</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

        <FilterBar
          analyticsId="data_products"
          disabled={filtersDisabled}
          showClearButton={!filterEmpty}
          search={{ param: "q", label: "Search", placeholder: "Search by name or type" }}
          selects={[
            {
              param: "type",
              label: "Entity type",
              allLabel: "All",
              options: uniqOptions(catalog, (r) => r.entityType),
            },
            {
              param: "status",
              label: "Status",
              allLabel: "All",
              options: uniqOptions(catalog, (r) => r.status),
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
            analyticsId="data-products-filter-empty"
            title="No products match these filters"
            body="Clear filters or adjust your search. Filter state stays in the URL for reproducible QA."
            primaryCta={{ label: "Clear filters", action: "clear_filters" }}
            onPrimary={() =>
              navigate({
                pathname: "/data-products",
                search: mergeSearchParams(searchParams, {
                  q: null,
                  type: null,
                  status: null,
                  sort: null,
                }).toString(),
              })
            }
          />
        ) : (
          <DataTable
            loading={status === "loading"}
            loadingColSpan={5}
            caption="Drafts stay private until published; field picks must stay within policy for each entity type."
            columns={[
              { id: "name", header: "Product", cell: (r) => r.name },
              { id: "entity", header: "Entity type", cell: (r) => r.entityType },
              { id: "status", header: "Status", cell: (r) => r.status },
              { id: "fields", header: "Fields", cell: (r) => r.fieldCount },
              { id: "updated", header: "Updated", cell: (r) => new Date(r.updatedAt).toLocaleString() },
            ]}
            rows={rows}
          />
        )}
      </PageFrame>

      {draftOpen ? (
        <div
          className={dlg.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={bodyId}
          data-testid="new-data-product-dialog"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDraftOpen(false);
          }}
        >
          <div className={dlg.dialog}>
            <h2 className={dlg.title} id={titleId}>
              New data product draft
            </h2>
            <p className={dlg.body} id={bodyId}>
              Name the extract and choose the primary entity type. Publishing still runs through policy checks.
            </p>
            <div className={dlg.panel}>
              <label className={dlg.body} htmlFor="dp-draft-name">
                Name
              </label>
              <input
                id="dp-draft-name"
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                style={{ width: "100%", marginTop: 8, marginBottom: 16 }}
              />
              <label className={dlg.body} htmlFor="dp-draft-entity">
                Entity type
              </label>
              <select
                id="dp-draft-entity"
                value={draftEntityType}
                onChange={(e) =>
                  setDraftEntityType(e.target.value as DataProductRow["entityType"])
                }
                style={{ width: "100%", marginTop: 8 }}
              >
                {ENTITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {playerPolicyNote ? (
                <p style={{ marginTop: 12, fontSize: "0.875rem" }} role="status">
                  {playerPolicyNote}
                </p>
              ) : null}
            </div>
            <div className={dlg.actions}>
              <button type="button" className={dlg.btn} onClick={() => setDraftOpen(false)}>
                Cancel
              </button>
              <button type="button" className={`${dlg.btn} ${dlg.primary}`} onClick={saveDraft}>
                Create draft
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </RouteViewRoot>
  );
}
