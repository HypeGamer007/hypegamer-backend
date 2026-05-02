import { useEffect, useId, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dlg from "@/components/dialogs/ConfirmDialog.module.css";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { EnvironmentBadge } from "@/components/entity/EnvironmentBadge";
import { PageFrame } from "@/components/layout/PageFrame";
import { DataTable } from "@/components/patterns/DataTable";
import { RouteViewRoot } from "@/components/state/RouteViewRoot";
import { useDemoSeeded } from "@/hooks/useDemoSeeded";
import { useRouteFixture } from "@/hooks/useRouteFixture";
import { auditMatchesQuery } from "@/lib/governanceAuditFilter";
import { resolveListRouteStatus } from "@/lib/resolveListRouteStatus";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import { track } from "@/lib/telemetry";
import { GOVERNANCE_DEMO, type AuditActivityRow, type RoleSummaryRow, type WorkspaceMemberRow } from "@/mocks/governance.demo";
import styles from "@/pages/SettingsPage.module.css";

export function SettingsPage() {
  const navigate = useNavigate();
  const fx = useRouteFixture();
  const demoSeeded = useDemoSeeded();
  const status = resolveListRouteStatus(fx, demoSeeded);

  const [retentionDays, setRetentionDays] = useState(GOVERNANCE_DEMO.settingsCopy.retentionDaysDefault);
  const [auditQuery, setAuditQuery] = useState("");
  const retentionLabelId = useId();
  const auditFilterId = useId();
  const auditExportHelpId = useId();
  const inviteMemberHelpId = useId();

  const auditRows = useMemo(() => {
    return GOVERNANCE_DEMO.auditActivity.filter((row) => auditMatchesQuery(row, auditQuery));
  }, [auditQuery]);

  const partialBanner =
    fx.rawFixture === "partial"
      ? "Some administrative fields may be read-only until policy review completes."
      : undefined;

  const filtersDisabled = status === "loading" || status === "error" || status === "empty";
  const canEditSettings = Boolean(fx.permissions.canAdmin);

  useEffect(() => {
    track("settings_workspace_viewed", {
      demoSeeded,
      fixture: fx.rawFixture ?? "default",
      canEdit: canEditSettings,
    });
  }, [demoSeeded, fx.rawFixture, canEditSettings]);

  const saveRetention = () => {
    track("settings_retention_saved", {
      retentionDays,
      actorId: "demo_admin",
    });
  };

  return (
    <RouteViewRoot
      gateAnalyticsId="audit_settings"
      status={status}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
      partialBanner={partialBanner}
      empty={{
        analyticsId: "settings-empty",
        title: "Workspace settings not initialized",
        body: "Load sandbox data to preview audit retention and notification defaults for this demo workspace.",
        primaryCta: { label: "Load sandbox data", action: "load_sandbox" },
        secondaryCta: { label: "Back to Home", action: "goto_home" },
        onPrimary: () => {
          seedDemoWorkspace("audit_settings_empty");
          window.location.assign("/settings");
        },
        onSecondary: () => navigate("/home"),
      }}
    >
      <PageFrame
        pageTestId="settings-page"
        title="Workspace settings"
        description="Audit retention, notifications, and IdP placeholders. Read-only when your role cannot administer the workspace."
        badges={<EnvironmentBadge />}
      >
        <p style={{ margin: "0 0 16px", color: "var(--color-text-muted)", fontSize: "0.875rem", lineHeight: 1.45 }}>
          Mocked administration UI. IdP federation and member invites ship with backend contracts from `specs/openapi/control-plane.yaml`.
        </p>

        {status === "loading" ? (
          <div className={styles.skeletonStack} aria-busy="true" aria-label="Loading settings">
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
          </div>
        ) : null}

        {(status === "ready" || status === "partial") && !filtersDisabled ? (
          <>
            <section className={styles.card} aria-labelledby="ws-h">
              <h2 id="ws-h" className={styles.h2}>
                Workspace
              </h2>
              <p className={styles.muted}>{GOVERNANCE_DEMO.settingsCopy.workspaceLabel}</p>
              <p className={styles.muted}>Project ID: demo_project · Environment from local preference.</p>
            </section>

            <section className={styles.card} aria-labelledby="members-h">
              <h2 id="members-h" className={styles.h2}>
                Members
              </h2>
              <p className={styles.muted}>Fixture-backed directory. Invites and SCIM sync require live directory APIs.</p>
              <div className={styles.actions} style={{ marginBottom: 12 }}>
                <button
                  type="button"
                  className={`${dlg.btn} ${dlg.primary}`}
                  disabled
                  aria-describedby={inviteMemberHelpId}
                  data-testid="settings-invite-member"
                >
                  Invite member…
                </button>
                <p id={inviteMemberHelpId} className={styles.muted} style={{ marginTop: 8, maxWidth: 360 }}>
                  Disabled in mock UI. When connected, invites respect workspace policy and audit every change.
                </p>
              </div>
              <DataTable<WorkspaceMemberRow>
                loading={false}
                loadingColSpan={4}
                caption="Read-only roster; role keys align with `?role=` matrix tests."
                columns={[
                  { id: "name", header: "Name", cell: (r) => r.displayName },
                  { id: "role", header: "Role", cell: (r) => r.roleKey },
                  {
                    id: "status",
                    header: "Status",
                    cell: (r) => (r.status === "invited" ? "Invited" : "Active"),
                  },
                ]}
                rows={GOVERNANCE_DEMO.workspaceMembers}
              />
            </section>

            <section className={styles.card} aria-labelledby="roles-h">
              <h2 id="roles-h" className={styles.h2}>
                Roles & access
              </h2>
              <p className={styles.muted}>
                High-level capabilities for this workspace (demo copy). Route-level enforcement is documented in the
                route manifest.
              </p>
              <DataTable<RoleSummaryRow>
                loading={false}
                loadingColSpan={3}
                caption="Not exhaustive; see Partners / Trust / Settings routes for allowed roles per surface."
                columns={[
                  { id: "key", header: "Role key", cell: (r) => r.roleKey },
                  { id: "label", header: "Label", cell: (r) => r.label },
                  { id: "caps", header: "Capabilities (summary)", cell: (r) => r.capabilities },
                ]}
                rows={GOVERNANCE_DEMO.roleSummaries}
              />
            </section>

            <section className={styles.card} aria-labelledby="audit-h">
              <h2 id="audit-h" className={styles.h2}>
                Recent audit activity
              </h2>
              <p className={styles.muted}>
                Immutable-style feed (fixture-backed). Before/after summaries are truncated for display; production binds
                request IDs and signed exports.
              </p>
              <div className={styles.auditToolbar}>
                <div className={styles.auditFilter}>
                  <label className={styles.label} htmlFor={auditFilterId}>
                    Filter events
                  </label>
                  <input
                    id={auditFilterId}
                    type="search"
                    className={styles.input}
                    placeholder="Actor, verb, object, or summary"
                    value={auditQuery}
                    onChange={(e) => setAuditQuery(e.target.value)}
                    data-testid="settings-audit-filter"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    className={dlg.btn}
                    disabled
                    aria-describedby={auditExportHelpId}
                    data-testid="settings-audit-export"
                  >
                    Export CSV…
                  </button>
                  <p id={auditExportHelpId} className={styles.muted} style={{ marginTop: 8, maxWidth: 280 }}>
                    Export disabled in mock UI. Live export requires elevated session, row caps, and redaction review
                    before download.
                  </p>
                </div>
              </div>
              {auditRows.length === 0 ? (
                <p className={styles.muted} role="status" data-testid="settings-audit-empty">
                  No audit rows match this filter.
                </p>
              ) : (
                <div className={styles.auditScroll} data-testid="settings-audit-table-wrap">
                  <DataTable<AuditActivityRow>
                    loading={false}
                    loadingColSpan={6}
                    caption="Read-only audit preview; scrolls for larger workspaces."
                    columns={[
                      {
                        id: "at",
                        header: "Time",
                        cell: (r) => new Date(r.occurredAt).toLocaleString(),
                      },
                      { id: "actor", header: "Actor", cell: (r) => r.actorLabel },
                      { id: "verb", header: "Verb", cell: (r) => r.verb },
                      { id: "object", header: "Object", cell: (r) => r.objectLabel },
                      {
                        id: "before",
                        header: "Before",
                        cell: (r) => r.beforeSummary ?? "—",
                      },
                      {
                        id: "after",
                        header: "After",
                        cell: (r) => r.afterSummary ?? "—",
                      },
                    ]}
                    rows={auditRows}
                  />
                </div>
              )}
            </section>

            <section className={styles.card} aria-labelledby="ret-h">
              <h2 id="ret-h" className={styles.h2}>
                Audit retention
              </h2>
              <label className={styles.label} htmlFor={retentionLabelId}>
                Days to retain control-plane audit logs
              </label>
              <input
                id={retentionLabelId}
                type="number"
                min={30}
                max={3650}
                className={styles.input}
                readOnly={!canEditSettings}
                aria-readonly={!canEditSettings}
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value) || GOVERNANCE_DEMO.settingsCopy.retentionDaysDefault)}
                data-testid="settings-retention-input"
              />
              <div className={styles.actions}>
                <button
                  type="button"
                  className={`${dlg.btn} ${dlg.primary}`}
                  disabled={!canEditSettings}
                  data-testid="settings-save-retention"
                  onClick={saveRetention}
                >
                  Save retention
                </button>
              </div>
              {!canEditSettings ? (
                <p className={styles.hint} role="status" data-testid="settings-readonly-hint">
                  Read-only: your role can view policy but cannot change retention in this demo.
                </p>
              ) : null}
            </section>

            <section className={styles.card} aria-labelledby="notif-h">
              <h2 id="notif-h" className={styles.h2}>
                Notifications
              </h2>
              <p className={styles.muted}>{GOVERNANCE_DEMO.settingsCopy.notificationsDefault}</p>
            </section>

            <section className={styles.card} aria-labelledby="idp-h">
              <h2 id="idp-h" className={styles.h2}>
                Identity provider
              </h2>
              <EmptyState
                analyticsId="settings-idp-placeholder"
                title="IdP federation not connected"
                body="SCIM / SAML placeholders will bind here. Until then, roles are simulated via URL `?role=` for matrix tests."
                announce={false}
              />
            </section>
          </>
        ) : null}
      </PageFrame>
    </RouteViewRoot>
  );
}
