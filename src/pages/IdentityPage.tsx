import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageFrame } from "@/components/layout/PageFrame";
import { RouteViewRoot } from "@/components/state/RouteViewRoot";
import { EnvironmentBadge } from "@/components/entity/EnvironmentBadge";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { useDemoSeeded } from "@/hooks/useDemoSeeded";
import { useRouteFixture } from "@/hooks/useRouteFixture";
import { resolveListRouteStatus } from "@/lib/resolveListRouteStatus";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import {
  ensureDefaultConsent,
  linkDemoAccount,
  readConsentGrants,
  readIdentityAuditLog,
  readLinkedAccounts,
  revokeConsent,
} from "@/lib/identityStore";
import styles from "./IdentityPage.module.css";

function prettyConsent(t: string) {
  switch (t) {
    case "profile_share":
      return "Profile share";
    case "stats_share":
      return "Stats share";
    case "marketing":
      return "Marketing";
    default:
      return t;
  }
}

export function IdentityPage() {
  const fx = useRouteFixture();
  const demoSeeded = useDemoSeeded();
  const status = resolveListRouteStatus(fx, demoSeeded);

  const [tick, setTick] = useState(0);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  useEffect(() => {
    ensureDefaultConsent();
    setTick((v) => v + 1);
  }, []);

  const linked = useMemo(() => readLinkedAccounts(), [tick]);
  const consent = useMemo(() => readConsentGrants(), [tick]);
  const auditLog = useMemo(() => readIdentityAuditLog(), [tick]);

  const partialBanner =
    fx.rawFixture === "partial" ? "Some identity graph edges may be withheld under policy." : undefined;

  return (
    <RouteViewRoot
      gateAnalyticsId="identity"
      status={status}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
      partialBanner={partialBanner}
      empty={{
        analyticsId: "identity-empty",
        title: "Identity not initialized",
        body: "Load sandbox data to preview linked-account and consent flows, or return later when identity services are configured.",
        primaryCta: { label: "Load sandbox data", action: "load_sandbox" },
        secondaryCta: { label: "Back to Home", action: "goto_home" },
        onPrimary: () => {
          seedDemoWorkspace("identity_empty");
          window.location.assign("/identity");
        },
        onSecondary: () => window.location.assign("/home"),
      }}
    >
      <PageFrame
        pageTestId="identity-page"
        title="Identity"
        description="Linked accounts, consent registry, and review-safe status cues."
        badges={<EnvironmentBadge />}
      >
        <div className={styles.grid}>
          <section className={styles.card} aria-labelledby="linked-h">
            <h2 id="linked-h" className={styles.h2}>
              Linked accounts
            </h2>

            {linked.length ? (
              <ul className={styles.list}>
                {linked.map((a) => (
                  <li key={a.provider}>
                    <strong>{a.provider.toUpperCase()}</strong> — {a.handle}{" "}
                    <span className={styles.muted}>({a.status})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                analyticsId="identity-linked-empty"
                title="No linked accounts"
                body="Linking accounts increases confidence and reduces alias collisions during merges."
                primaryCta={{ label: "Link Steam (demo)", action: "link_steam" }}
                secondaryCta={{ label: "Link Twitch (demo)", action: "link_twitch" }}
                onPrimary={() => {
                  linkDemoAccount("steam", "demo-steam-123");
                  setTick((v) => v + 1);
                }}
                onSecondary={() => {
                  linkDemoAccount("twitch", "demo_channel");
                  setTick((v) => v + 1);
                }}
              />
            )}

            {linked.length ? (
              <div className={styles.actionsRow}>
                <button
                  type="button"
                  className={styles.btn}
                  onClick={() => {
                    linkDemoAccount("steam", "demo-steam-123");
                    setTick((v) => v + 1);
                  }}
                >
                  Link Steam (demo)
                </button>
                <button
                  type="button"
                  className={styles.btn}
                  onClick={() => {
                    linkDemoAccount("twitch", "demo_channel");
                    setTick((v) => v + 1);
                  }}
                >
                  Link Twitch (demo)
                </button>
              </div>
            ) : null}
          </section>

          <section className={styles.card} aria-labelledby="consent-h">
            <h2 id="consent-h" className={styles.h2}>
              Consent registry
            </h2>
            <p className={styles.muted}>Revocations apply immediately and append to the audit trail below.</p>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Consent</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Updated</th>
                  <th className={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {consent.map((c) => (
                  <tr key={c.id}>
                    <td className={styles.td}>{prettyConsent(c.consentType)}</td>
                    <td className={styles.td}>{c.status}</td>
                    <td className={styles.td}>{new Date(c.updatedAt).toLocaleString()}</td>
                    <td className={styles.td}>
                      <button
                        type="button"
                        className={styles.linkBtn}
                        disabled={c.status === "revoked"}
                        onClick={() => setRevokeTarget(c.id)}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className={styles.card} aria-labelledby="audit-h">
            <h2 id="audit-h" className={styles.h2}>
              Audit trail (demo)
            </h2>
            {auditLog.length ? (
              <table className={styles.table} data-testid="identity-audit-log">
                <thead>
                  <tr>
                    <th className={styles.th}>Time</th>
                    <th className={styles.th}>Event</th>
                    <th className={styles.th}>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((e) => (
                    <tr key={e.id}>
                      <td className={styles.td}>{new Date(e.at).toLocaleString()}</td>
                      <td className={styles.td}>{e.kind === "consent_revoked" ? "Consent revoked" : e.kind}</td>
                      <td className={styles.td}>{e.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={styles.muted}>No auditable identity events in this browser session yet.</p>
            )}
            <p className={styles.muted} style={{ marginTop: 12 }}>
              Workspace-wide control-plane audit (fixture-backed) lives under{" "}
              <Link to="/settings" data-testid="identity-link-workspace-settings">
                Settings → Recent audit activity
              </Link>
              .
            </p>
          </section>
        </div>

        <ConfirmDialog
          open={revokeTarget != null}
          title="Revoke consent?"
          body="This removes permission immediately. Downstream products may lose access and show restricted fields."
          confirmLabel="Revoke consent"
          tone="danger"
          onCancel={() => setRevokeTarget(null)}
          onConfirm={() => {
            if (!revokeTarget) return;
            revokeConsent(revokeTarget);
            setRevokeTarget(null);
            setTick((v) => v + 1);
          }}
          testId="revoke-consent-dialog"
        />
      </PageFrame>
    </RouteViewRoot>
  );
}

