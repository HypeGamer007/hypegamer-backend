import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { resolveListRouteStatus } from "@/lib/resolveListRouteStatus";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import { mergeSearchParams } from "@/lib/searchParams";
import { track } from "@/lib/telemetry";
import { GOVERNANCE_DEMO, type TrustSignalRow } from "@/mocks/governance.demo";

function uniqTrustOptions(rows: TrustSignalRow[], pick: (r: TrustSignalRow) => string) {
  const set = new Set(rows.map(pick));
  return [...set].sort().map((value) => ({ value, label: value }));
}

export function TrustPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fx = useRouteFixture();
  const demoSeeded = useDemoSeeded();
  const status = resolveListRouteStatus(fx, demoSeeded);

  const severity = searchParams.get("severity") ?? "";
  const state = searchParams.get("state") ?? "";
  const q = searchParams.get("q") ?? "";

  const [dispositionId, setDispositionId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return GOVERNANCE_DEMO.trustSignals.filter((r) => {
      if (severity && r.severity !== severity) return false;
      if (state && r.state !== state) return false;
      if (q) {
        const needle = q.toLowerCase();
        const hay = `${r.title} ${r.severity} ${r.state} ${r.signalKind}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [q, severity, state]);

  const hasActiveFilters = Boolean(severity || state || q);
  const filterEmpty = demoSeeded && (status === "ready" || status === "partial") && rows.length === 0 && hasActiveFilters;

  const partialBanner =
    fx.rawFixture === "partial"
      ? "Evidence excerpts may be shortened for viewers under policy."
      : undefined;

  const filtersDisabled = status === "loading" || status === "error" || status === "empty";

  useEffect(() => {
    track("trust_queue_viewed", {
      demoSeeded,
      fixture: fx.rawFixture ?? "default",
    });
  }, [demoSeeded, fx.rawFixture]);

  const dispositionRow = dispositionId ? GOVERNANCE_DEMO.trustSignals.find((s) => s.id === dispositionId) : undefined;

  return (
    <RouteViewRoot
      gateAnalyticsId="trust"
      status={status}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
      partialBanner={partialBanner}
      empty={{
        analyticsId: "trust-empty",
        title: "Trust queue not initialized",
        body: "Load sandbox data to review integrity and publisher signals with policy-safe evidence previews.",
        primaryCta: { label: "Load sandbox data", action: "load_sandbox" },
        secondaryCta: { label: "Back to Home", action: "goto_home" },
        onPrimary: () => {
          seedDemoWorkspace("trust_empty");
          window.location.assign("/trust");
        },
        onSecondary: () => navigate("/home"),
      }}
    >
      <PageFrame
        pageTestId="trust-page"
        title="Trust & integrity"
        description="Signal queue with redacted evidence previews. Dispositions are demo-only but emit telemetry."
        badges={<EnvironmentBadge />}
      >
        <p style={{ margin: "0 0 16px", color: "var(--color-text-muted)", fontSize: "0.875rem", lineHeight: 1.45 }}>
          Evidence strings always redact sensitive segments in this mock. Production would attach signed artifacts and request IDs per row.
        </p>

        <FilterBar
          analyticsId="trust_queue"
          disabled={filtersDisabled}
          showClearButton={!filterEmpty}
          search={{ param: "q", label: "Search", placeholder: "Search title or kind" }}
          selects={[
            {
              param: "severity",
              label: "Severity",
              allLabel: "All",
              options: uniqTrustOptions(GOVERNANCE_DEMO.trustSignals, (r) => r.severity),
            },
            {
              param: "state",
              label: "State",
              allLabel: "All",
              options: uniqTrustOptions(GOVERNANCE_DEMO.trustSignals, (r) => r.state),
            },
          ]}
        />

        {filterEmpty ? (
          <EmptyState
            analyticsId="trust-filter-empty"
            title="No signals match these filters"
            body="Clear filters to see all demo trust rows."
            primaryCta={{ label: "Clear filters", action: "clear_filters" }}
            onPrimary={() =>
              navigate({
                pathname: "/trust",
                search: mergeSearchParams(searchParams, { q: null, severity: null, state: null }).toString(),
              })
            }
          />
        ) : (
          <DataTable<TrustSignalRow>
            loading={status === "loading"}
            loadingColSpan={7}
            caption="Restricted fields never appear in full; look for [REDACTED] markers in previews."
            columns={[
              { id: "title", header: "Signal", cell: (r) => r.title },
              { id: "sev", header: "Severity", cell: (r) => r.severity },
              { id: "state", header: "State", cell: (r) => r.state },
              { id: "kind", header: "Kind", cell: (r) => r.signalKind },
              { id: "updated", header: "Updated", cell: (r) => new Date(r.updatedAt).toLocaleString() },
              {
                id: "evidence",
                header: "Evidence preview",
                cell: (r) => (
                  <span style={{ fontSize: "0.8125rem" }} data-testid={`trust-evidence-${r.id}`}>
                    {r.evidencePreview}
                  </span>
                ),
              },
              {
                id: "actions",
                header: "",
                cell: (r) => (
                  <button
                    type="button"
                    className={dlg.btn}
                    disabled={filtersDisabled || !fx.permissions.canEdit || r.state === "closed"}
                    onClick={() => setDispositionId(r.id)}
                  >
                    Disposition…
                  </button>
                ),
              },
            ]}
            rows={rows}
          />
        )}
      </PageFrame>

      <ConfirmDialog
        open={dispositionId != null}
        title="Submit disposition?"
        body={
          dispositionRow
            ? `Mark ${dispositionRow.title} as triaged with reviewer notes (demo). Downstream audit trail would append an immutable event.`
            : ""
        }
        confirmLabel="Mark triaged"
        onCancel={() => setDispositionId(null)}
        onConfirm={() => {
          if (dispositionRow) {
            track("trust_signal_reviewed", {
              signalId: dispositionRow.id,
              disposition: "triaged",
              severity: dispositionRow.severity,
            });
          }
          setDispositionId(null);
        }}
        testId="trust-disposition-dialog"
      />
    </RouteViewRoot>
  );
}
