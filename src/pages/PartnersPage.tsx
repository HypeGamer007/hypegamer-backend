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
import { GOVERNANCE_DEMO, type PartnerAccessRow } from "@/mocks/governance.demo";

function uniqPartnerOptions(rows: PartnerAccessRow[], pick: (r: PartnerAccessRow) => string) {
  const set = new Set(rows.map(pick));
  return [...set].sort().map((value) => ({ value, label: value }));
}

export function PartnersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fx = useRouteFixture();
  const demoSeeded = useDemoSeeded();
  const status = resolveListRouteStatus(fx, demoSeeded);

  const st = searchParams.get("status") ?? "";
  const q = searchParams.get("q") ?? "";

  const [renewId, setRenewId] = useState<string | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [approveId, setApproveId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return GOVERNANCE_DEMO.partners.filter((r) => {
      if (st && r.status !== st) return false;
      if (q) {
        const needle = q.toLowerCase();
        const hay = `${r.orgName} ${r.partnerType} ${r.scopeSummary} ${r.status}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [q, st]);

  const hasActiveFilters = Boolean(st || q);
  const filterEmpty = demoSeeded && (status === "ready" || status === "partial") && rows.length === 0 && hasActiveFilters;

  const partialBanner =
    fx.rawFixture === "partial"
      ? "Some partner scope columns may be truncated for viewers under policy."
      : undefined;

  const filtersDisabled = status === "loading" || status === "error" || status === "empty";

  useEffect(() => {
    track("partners_directory_viewed", {
      demoSeeded,
      fixture: fx.rawFixture ?? "default",
    });
  }, [demoSeeded, fx.rawFixture]);

  const renewRow = renewId ? GOVERNANCE_DEMO.partners.find((p) => p.id === renewId) : undefined;
  const revokeRow = revokeId ? GOVERNANCE_DEMO.partners.find((p) => p.id === revokeId) : undefined;
  const approveRow = approveId ? GOVERNANCE_DEMO.partners.find((p) => p.id === approveId) : undefined;

  return (
    <RouteViewRoot
      gateAnalyticsId="partners"
      status={status}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
      partialBanner={partialBanner}
      empty={{
        analyticsId: "partners-empty",
        title: "Partner directory not initialized",
        body: "Load sandbox data to preview partner grants, scopes, and expiry in a deterministic matrix.",
        primaryCta: { label: "Load sandbox data", action: "load_sandbox" },
        secondaryCta: { label: "Back to Home", action: "goto_home" },
        onPrimary: () => {
          seedDemoWorkspace("partners_empty");
          window.location.assign("/partners");
        },
        onSecondary: () => navigate("/home"),
      }}
    >
      <PageFrame
        pageTestId="partners-page"
        title="Partners"
        description="Grant matrix with scope summaries and status. Approvals and revocations stay explicit and auditable."
        badges={<EnvironmentBadge />}
      >
        <p style={{ margin: "0 0 16px", color: "var(--color-text-muted)", fontSize: "0.875rem", lineHeight: 1.45 }}>
          Mocked governance UI: no outbound calls. Impact previews are copy-only until backend workflows land.
        </p>

        <FilterBar
          analyticsId="partners_directory"
          disabled={filtersDisabled}
          showClearButton={!filterEmpty}
          search={{ param: "q", label: "Search", placeholder: "Search org, type, or scope" }}
          selects={[
            {
              param: "status",
              label: "Status",
              allLabel: "All",
              options: uniqPartnerOptions(GOVERNANCE_DEMO.partners, (r) => r.status),
            },
          ]}
        />

        {filterEmpty ? (
          <EmptyState
            analyticsId="partners-filter-empty"
            title="No partners match these filters"
            body="Clear filters to see all demo partner rows."
            primaryCta={{ label: "Clear filters", action: "clear_filters" }}
            onPrimary={() =>
              navigate({
                pathname: "/partners",
                search: mergeSearchParams(searchParams, { q: null, status: null }).toString(),
              })
            }
          />
        ) : (
          <DataTable<PartnerAccessRow>
            loading={status === "loading"}
            loadingColSpan={6}
            caption="Certified vs community data paths are never conflated in downstream grants."
            columns={[
              { id: "org", header: "Organization", cell: (r) => r.orgName },
              { id: "type", header: "Type", cell: (r) => r.partnerType },
              { id: "scope", header: "Scopes", cell: (r) => r.scopeSummary },
              { id: "status", header: "Status", cell: (r) => r.status },
              {
                id: "exp",
                header: "Expires",
                cell: (r) => (r.expiresAt ? new Date(r.expiresAt).toLocaleDateString() : "—"),
              },
              {
                id: "actions",
                header: "",
                cell: (r) => (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className={dlg.btn}
                      disabled={filtersDisabled || !fx.permissions.canEdit || r.status !== "pending"}
                      onClick={() => setApproveId(r.id)}
                    >
                      Approve grant…
                    </button>
                    <button
                      type="button"
                      className={dlg.btn}
                      disabled={filtersDisabled || !fx.permissions.canEdit || r.status !== "active"}
                      onClick={() => setRenewId(r.id)}
                    >
                      Renew grant…
                    </button>
                    <button
                      type="button"
                      className={dlg.btn}
                      disabled={filtersDisabled || !fx.permissions.canEdit || r.status === "revoked"}
                      onClick={() => setRevokeId(r.id)}
                    >
                      Revoke…
                    </button>
                  </div>
                ),
              },
            ]}
            rows={rows}
          />
        )}
      </PageFrame>

      <ConfirmDialog
        open={approveId != null}
        title="Approve pending partner grant?"
        body={
          approveRow
            ? `Impact preview (demo): ${approveRow.orgName} moves to active with scopes: ${approveRow.scopeSummary}. Downstream API keys unlock after simulated policy check; widgets in sandbox can subscribe immediately.`
            : ""
        }
        confirmLabel="Approve grant"
        onCancel={() => setApproveId(null)}
        onConfirm={() => {
          if (approveRow) {
            track("partner_access_granted", {
              partnerOrgId: approveRow.id,
              scopeCount: 4,
              expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
              grantAction: "approve_pending",
            });
          }
          setApproveId(null);
        }}
        testId="partners-approve-grant-dialog"
      />

      <ConfirmDialog
        open={renewId != null}
        title="Renew partner grant?"
        body={
          renewRow
            ? `Impact preview (demo): ${renewRow.orgName} keeps current read scopes; expiry extends 180 days. Downstream widgets stay subscribed.`
            : ""
        }
        confirmLabel="Confirm renewal"
        onCancel={() => setRenewId(null)}
        onConfirm={() => {
          if (renewRow) {
            track("partner_access_granted", {
              partnerOrgId: renewRow.id,
              scopeCount: 3,
              expiresAt: new Date(Date.now() + 180 * 86400000).toISOString(),
              grantAction: "renew",
            });
          }
          setRenewId(null);
        }}
        testId="partners-renew-grant-dialog"
      />

      <ConfirmDialog
        open={revokeId != null}
        title="Revoke partner access?"
        body={
          revokeRow
            ? `Impact preview (demo): API keys for ${revokeRow.orgName} stop working at period end; widgets using their embed token show restricted empty states.`
            : ""
        }
        confirmLabel="Revoke access"
        tone="danger"
        onCancel={() => setRevokeId(null)}
        onConfirm={() => {
          if (revokeRow) {
            track("partners_access_revoked", {
              partnerOrgId: revokeRow.id,
              reason: "demo_revocation",
            });
          }
          setRevokeId(null);
        }}
        testId="partners-revoke-dialog"
      />
    </RouteViewRoot>
  );
}
