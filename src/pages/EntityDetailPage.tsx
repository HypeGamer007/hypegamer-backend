import { useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageFrame } from "@/components/layout/PageFrame";
import { RouteViewRoot } from "@/components/state/RouteViewRoot";
import { DetailMeta } from "@/components/detail/DetailMeta";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { useDemoSeeded } from "@/hooks/useDemoSeeded";
import { useRouteFixture } from "@/hooks/useRouteFixture";
import { resolveDetailRouteStatus } from "@/lib/resolveDetailRouteStatus";
import { resolveDetailListLocationSearch } from "@/lib/detailListOrigin";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import { getEntityById } from "@/mocks/entities.demo";
import styles from "./EntityDetailPage.module.css";

function prettyProvider(p: string) {
  return p.toUpperCase();
}

export function EntityDetailPage() {
  const { entityId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fx = useRouteFixture();
  const demoSeeded = useDemoSeeded();

  const listSearch = resolveDetailListLocationSearch("entities", location.state);
  const entity = useMemo(() => getEntityById(entityId), [entityId]);
  const exists = Boolean(entity);
  const status = resolveDetailRouteStatus(fx, demoSeeded, exists);

  const partialBanner =
    fx.rawFixture === "partial"
      ? "Some profile sections (aliases, linked accounts) may be withheld under policy."
      : undefined;

  const empty = useMemo(() => {
    if (status !== "empty") return undefined;
    if (!demoSeeded) {
      return {
        analyticsId: "entity-detail-no-demo",
        title: "No entity data yet",
        body: "Load sandbox preview data to inspect players and teams, or connect a source so profiles populate automatically.",
        primaryCta: { label: "Load sandbox data", action: "load_sandbox" },
        secondaryCta: { label: "Back to entities", action: "back" },
        onPrimary: () => {
          seedDemoWorkspace("entity_detail_empty");
          window.location.reload();
        },
        onSecondary: () => void navigate({ pathname: "/entities", search: listSearch || undefined }),
      };
    }
    return {
      analyticsId: "entity-detail-missing",
      title: "Entity not found",
      body: "That ID is not in the current sandbox dataset. Return to the directory or pick another entity.",
      primaryCta: { label: "Back to entities", action: "back" },
      onPrimary: () => void navigate({ pathname: "/entities", search: listSearch || undefined }),
    };
  }, [demoSeeded, listSearch, navigate, status]);

  return (
    <RouteViewRoot
      gateAnalyticsId="entity-detail"
      status={status}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
      partialBanner={partialBanner}
      empty={empty}
    >
      {entity ? (
        <PageFrame
          pageTestId="entity-detail-page"
          title={entity.displayName}
          description="Profile template with alias-safe rendering and reviewer-safe merge copy."
          breadcrumbs={
            <Breadcrumbs
              items={[
                { label: "Home", to: "/home" },
                { label: "Entities", to: { pathname: "/entities", search: listSearch || undefined } },
                { label: entity.displayName },
              ]}
            />
          }
          actions={
            <Link className="hg-inline-link" to={{ pathname: "/entities", search: listSearch || undefined }}>
              ← Entities
            </Link>
          }
        >
          <div className={styles.grid}>
            <section className={styles.card} aria-labelledby="meta-h">
              <h2 id="meta-h" className={styles.h2}>
                Summary
              </h2>
              <DetailMeta
                items={[
                  { label: "Id", value: entity.id },
                  { label: "Type", value: entity.type },
                  { label: "Status", value: entity.status },
                  { label: "Primary game", value: entity.primaryGame },
                  { label: "Provenance", value: entity.provenance },
                  { label: "Updated", value: new Date(entity.lastUpdatedAt).toLocaleString() },
                ]}
              />
            </section>

            <section className={styles.card} aria-labelledby="aliases-h">
              <h2 id="aliases-h" className={styles.h2}>
                Aliases
              </h2>
              {entity.aliases.length ? (
                <ul className={styles.list}>
                  {entity.aliases.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  analyticsId="entity-aliases-empty"
                  title="No known aliases"
                  body="This entity has no alternate handles in the current dataset."
                  announce={false}
                />
              )}
            </section>

            {entity.type === "team" ? (
              <section className={styles.card} aria-labelledby="roster-h">
                <h2 id="roster-h" className={styles.h2}>
                  Roster
                </h2>
                {entity.roster?.length ? (
                  <ul className={styles.list}>
                    {entity.roster.map((p) => (
                      <li key={p.id}>
                        {p.displayName}
                        {p.role ? <span className={styles.muted}> — {p.role}</span> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.muted}>No roster entries for this team in the sandbox dataset.</p>
                )}
              </section>
            ) : null}

            <section className={styles.card} aria-labelledby="linked-h">
              <h2 id="linked-h" className={styles.h2}>
                Linked accounts
              </h2>
              {entity.linkedAccounts.length ? (
                <ul className={styles.list}>
                  {entity.linkedAccounts.map((a) => (
                    <li key={`${a.provider}-${a.handle}`}>
                      {prettyProvider(a.provider)} — {a.handle}{" "}
                      <span className={styles.muted}>({a.status})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.muted}>No linked accounts in this dataset snapshot.</p>
              )}
            </section>

            <section className={styles.card} aria-labelledby="merge-h">
              <h2 id="merge-h" className={styles.h2}>
                Merge review (preview)
              </h2>
              <p className={styles.muted}>
                Merge suggestions ship in a later iteration. Reviewers will see confidence bands, an auditable diff, and
                policy-safe “what changes” summaries.
              </p>
              <button
                type="button"
                className={styles.btn}
                onClick={() => window.alert("Merge drawer not implemented yet.")}
              >
                Open merge drawer (placeholder)
              </button>
            </section>
          </div>
        </PageFrame>
      ) : null}
    </RouteViewRoot>
  );
}

