import { useId, useMemo, useState } from "react";
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
import { readExtraApiKeys, writeExtraApiKeys } from "@/lib/productizationStorage";
import { resolveListRouteStatus } from "@/lib/resolveListRouteStatus";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import { mergeSearchParams } from "@/lib/searchParams";
import { track } from "@/lib/telemetry";
import { DEMO_API_KEYS, type ApiKeyRow } from "@/mocks/productization.demo";

function uniqOptions(rows: ApiKeyRow[], pick: (r: ApiKeyRow) => string) {
  const set = new Set(rows.map(pick));
  return [...set].sort().map((value) => ({ value, label: value }));
}

function newSecret(): string {
  const tail = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return `hg_demo_${tail}`;
}

function maskSecret(full: string): string {
  if (full.length <= 10) return "••••";
  return `${full.slice(0, 8)}…${full.slice(-4)}`;
}

export function DevelopersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fx = useRouteFixture();
  const demoSeeded = useDemoSeeded();
  const status = resolveListRouteStatus(fx, demoSeeded);

  const [storageTick, setStorageTick] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [revealSecret, setRevealSecret] = useState<string | null>(null);
  const [pendingRow, setPendingRow] = useState<ApiKeyRow | null>(null);
  const [keyLabel, setKeyLabel] = useState("");
  const [keyType, setKeyType] = useState<ApiKeyRow["keyType"]>("server");

  const titleId = useId();
  const bodyId = useId();

  const kt = searchParams.get("keyType") ?? "";
  const q = searchParams.get("q") ?? "";

  const catalog = useMemo(() => {
    void storageTick;
    return [...DEMO_API_KEYS, ...readExtraApiKeys()];
  }, [storageTick]);

  const rows = useMemo(() => {
    const base = catalog;
    return base.filter((r) => {
      if (kt && r.keyType !== kt) return false;
      if (q) {
        const needle = q.toLowerCase();
        const hay = `${r.label} ${r.keyType} ${r.maskedSecret}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [catalog, kt, q]);

  const hasActiveFilters = Boolean(kt || q);
  const filterEmpty =
    demoSeeded && (status === "ready" || status === "partial") && rows.length === 0 && hasActiveFilters;

  const partialBanner =
    fx.rawFixture === "partial"
      ? "Delivery logs and retry timelines may be truncated for viewers under policy."
      : undefined;

  const filtersDisabled = status === "loading" || status === "error" || status === "empty";

  const startCreate = () => {
    setKeyLabel("");
    setKeyType("server");
    setCreateOpen(true);
  };

  const generateKey = () => {
    const secret = newSecret();
    const id = `key_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
    const row: ApiKeyRow = {
      id,
      label: keyLabel.trim() || "New API key",
      keyType: keyType,
      maskedSecret: maskSecret(secret),
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
    };
    setPendingRow(row);
    setRevealSecret(secret);
    setCreateOpen(false);
    track("api_key_created", {
      projectId: "demo_project",
      keyType: keyType,
    });
  };

  const finishReveal = () => {
    if (pendingRow) {
      writeExtraApiKeys([...readExtraApiKeys(), pendingRow]);
      setStorageTick((t) => t + 1);
    }
    setRevealSecret(null);
    setPendingRow(null);
  };

  return (
    <RouteViewRoot
      gateAnalyticsId="developers"
      status={status}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
      partialBanner={partialBanner}
      empty={{
        analyticsId: "developers-empty",
        title: "No API keys yet",
        body: "Create keys for ingestion workers or read-only dashboards. Keys are shown in full only once; store them in your secret manager.",
        primaryCta: { label: "Load sandbox data", action: "load_sandbox" },
        secondaryCta: { label: "Back to Home", action: "goto_home" },
        onPrimary: () => {
          seedDemoWorkspace("developers_empty");
          window.location.assign("/developers");
        },
        onSecondary: () => navigate("/home"),
      }}
    >
      <PageFrame
        pageTestId="developers-page"
        title="Developers"
        description="API keys with reveal-once handling and masked listings afterward."
        badges={<EnvironmentBadge />}
        actions={
          <button type="button" className={dlg.btn} disabled={filtersDisabled} onClick={startCreate}>
            Create API key
          </button>
        }
      >
        <FilterBar
          analyticsId="developers"
          disabled={filtersDisabled}
          showClearButton={!filterEmpty}
          search={{ param: "q", label: "Search", placeholder: "Search labels or key types" }}
          selects={[
            {
              param: "keyType",
              label: "Key type",
              allLabel: "All",
              options: uniqOptions(catalog, (r) => r.keyType),
            },
          ]}
        />

        {filterEmpty ? (
          <EmptyState
            analyticsId="developers-filter-empty"
            title="No keys match these filters"
            body="Clear filters to see all keys in this workspace."
            primaryCta={{ label: "Clear filters", action: "clear_filters" }}
            onPrimary={() =>
              navigate({
                pathname: "/developers",
                search: mergeSearchParams(searchParams, { q: null, keyType: null }).toString(),
              })
            }
          />
        ) : (
          <DataTable
            loading={status === "loading"}
            loadingColSpan={5}
            caption="Secrets are never shown again after you close the reveal dialog."
            columns={[
              { id: "label", header: "Label", cell: (r) => r.label },
              { id: "type", header: "Type", cell: (r) => r.keyType },
              { id: "secret", header: "Key", cell: (r) => r.maskedSecret },
              {
                id: "last",
                header: "Last used",
                cell: (r) => (r.lastUsedAt ? new Date(r.lastUsedAt).toLocaleString() : "—"),
              },
              { id: "created", header: "Created", cell: (r) => new Date(r.createdAt).toLocaleString() },
            ]}
            rows={rows}
          />
        )}
      </PageFrame>

      {createOpen ? (
        <div
          className={dlg.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={bodyId}
          data-testid="create-api-key-dialog"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCreateOpen(false);
          }}
        >
          <div className={dlg.dialog}>
            <h2 className={dlg.title} id={titleId}>
              Create API key
            </h2>
            <p className={dlg.body} id={bodyId}>
              You will see the full secret exactly once. Copy it to a password manager before continuing.
            </p>
            <div className={dlg.panel}>
              <label className={dlg.body} htmlFor="api-key-label">
                Label
              </label>
              <input
                id="api-key-label"
                type="text"
                value={keyLabel}
                onChange={(e) => setKeyLabel(e.target.value)}
                style={{ width: "100%", marginTop: 8, marginBottom: 16 }}
              />
              <label className={dlg.body} htmlFor="api-key-type">
                Key type
              </label>
              <select
                id="api-key-type"
                value={keyType}
                onChange={(e) => setKeyType(e.target.value as ApiKeyRow["keyType"])}
                style={{ width: "100%", marginTop: 8 }}
              >
                <option value="server">server</option>
                <option value="readonly">readonly</option>
              </select>
            </div>
            <div className={dlg.actions}>
              <button type="button" className={dlg.btn} onClick={() => setCreateOpen(false)}>
                Cancel
              </button>
              <button type="button" className={`${dlg.btn} ${dlg.primary}`} onClick={generateKey}>
                Generate key
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {revealSecret ? (
        <div
          className={dlg.overlay}
          role="dialog"
          aria-modal="true"
          data-testid="api-key-reveal-dialog"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) finishReveal();
          }}
        >
          <div className={dlg.dialog}>
            <h2 className={dlg.title}>Your new API key</h2>
            <p className={dlg.body}>Copy this value now. For security it will not be shown again.</p>
            <div className={dlg.panel}>
              <code data-testid="api-key-secret-value" style={{ wordBreak: "break-all" }}>
                {revealSecret}
              </code>
            </div>
            <div className={dlg.actions}>
              <button type="button" className={`${dlg.btn} ${dlg.primary}`} onClick={finishReveal}>
                I have stored this key
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </RouteViewRoot>
  );
}
