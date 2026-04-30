import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { PageFrame } from "@/components/layout/PageFrame";
import { RouteViewRoot } from "@/components/state/RouteViewRoot";
import { DetailMeta } from "@/components/detail/DetailMeta";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { useDemoSeeded } from "@/hooks/useDemoSeeded";
import { useRouteFixture } from "@/hooks/useRouteFixture";
import { resolveDetailRouteStatus } from "@/lib/resolveDetailRouteStatus";
import { resolveDetailListLocationSearch } from "@/lib/detailListOrigin";
import { findMergeResolutionForEntity, recordMergeApplied } from "@/lib/entityMergeStore";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import { track } from "@/lib/telemetry";
import { getEntityById, type EntityProfile } from "@/mocks/entities.demo";
import styles from "./EntityDetailPage.module.css";

function prettyProvider(p: string) {
  return p.toUpperCase();
}

function linkedStatusNote(status: "linked" | "pending" | "error") {
  switch (status) {
    case "pending":
      return "Verification pending — the provider has not confirmed this link yet.";
    case "error":
      return "Link error — refresh tokens expired or the provider rejected the last check.";
    default:
      return "Linked — last verification succeeded in the sandbox snapshot.";
  }
}

function skillCoverageCopy(entity: EntityProfile): string | null {
  const sc = entity.skillCoverage;
  if (!sc || entity.type !== "player") return null;
  const base = `${entity.displayName}'s skill profile is derived from ranked ladders only.`;
  switch (sc.band) {
    case "high":
      return `${base} Coverage reads as high (${sc.rankedMatchSamples}+ stable samples with roster continuity).`;
    case "medium":
      return `${base} Coverage reads as medium (${sc.rankedMatchSamples} samples); copy stays hedged until more verified matches arrive.`;
    case "low":
      return `${base} Coverage reads as low (${sc.rankedMatchSamples} samples); treat as exploratory until more ranked history exists.`;
    default:
      return base;
  }
}

export function EntityDetailPage() {
  const { entityId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fx = useRouteFixture();
  const demoSeeded = useDemoSeeded();
  const [mergeOpen, setMergeOpen] = useState(false);

  const listSearch = resolveDetailListLocationSearch("entities", location.state);
  const entity = useMemo(() => getEntityById(entityId), [entityId]);
  const exists = Boolean(entity);
  const status = resolveDetailRouteStatus(fx, demoSeeded, exists);

  /** Re-read when route changes; demo `entity` objects are stable references per id, so `entity` alone is not a reliable dep. */
  const mergeResolution = useMemo(() => {
    if (!entity) return undefined;
    return findMergeResolutionForEntity(entity.id);
  }, [entity?.id, location.key, location.pathname]);

  const aliasDupCounts = useMemo(() => {
    if (!entity) return new Map<string, number>();
    const m = new Map<string, number>();
    for (const a of entity.aliases) {
      const k = a.trim().toLowerCase();
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  }, [entity]);

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

  const canConfirmMerge =
    Boolean(entity?.mergeSuggestion) &&
    fx.permissions.canEdit &&
    !fx.restricted &&
    !mergeResolution;

  const skillCopy = entity ? skillCoverageCopy(entity) : null;

  const confirmMerge = () => {
    if (!entity?.mergeSuggestion) return;
    const role = searchParams.get("role") ?? "project_admin";
    const ms = entity.mergeSuggestion;
    recordMergeApplied({
      fromEntityId: entity.id,
      intoEntityId: ms.intoEntityId,
      intoDisplayName: ms.intoDisplayName,
      confidenceBand: ms.confidenceBand,
      reviewerId: role,
    });
    track("merge_applied", {
      reviewerId: role,
      confidenceBand: ms.confidenceBand,
    });
    setMergeOpen(false);
    void navigate(`/entities/${ms.intoEntityId}`, { state: location.state });
  };

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
          description="Profile template with alias-safe rendering and reviewer-gated merge confirmation."
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
          {mergeResolution ? (
            <div className={styles.mergeBanner} data-testid="entity-merge-resolved-banner" role="status">
              <strong>Merge applied.</strong> This profile was merged into{" "}
              <Link className="hg-inline-link" to={`/entities/${mergeResolution.intoEntityId}`}>
                {mergeResolution.intoDisplayName}
              </Link>{" "}
              on {new Date(mergeResolution.at).toLocaleString()} (confidence {mergeResolution.confidenceBand}, reviewer{" "}
              {mergeResolution.reviewerId}).
            </div>
          ) : null}

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
              {entity.notes ? <p className={styles.muted}>{entity.notes}</p> : null}
            </section>

            {skillCopy ? (
              <section className={styles.card} aria-labelledby="skill-h">
                <h2 id="skill-h" className={styles.h2}>
                  Skill profile coverage
                </h2>
                <p className={styles.body}>{skillCopy}</p>
              </section>
            ) : null}

            <section className={styles.card} aria-labelledby="aliases-h">
              <h2 id="aliases-h" className={styles.h2}>
                Aliases
              </h2>
              {entity.aliases.length ? (
                <ul className={styles.list}>
                  {entity.aliases.map((a, i) => {
                    const k = a.trim().toLowerCase();
                    const dup = (aliasDupCounts.get(k) ?? 0) > 1;
                    return (
                      <li key={`${a}-${i}`}>
                        <span>{a}</span>
                        {dup ? (
                          <span className={styles.badge} title="Same literal appears more than once in source payloads.">
                            Duplicate source
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState
                  analyticsId="entity-aliases-empty"
                  title="Sparse alias list"
                  body="No alternate handles were ingested for this entity yet. Sparse profiles still render with a stable canonical name."
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
                    <li key={`${a.provider}-${a.handle}-${a.status}`}>
                      <div>
                        <strong>{prettyProvider(a.provider)}</strong> — {a.handle}{" "}
                        <span className={styles.muted}>({a.status})</span>
                      </div>
                      <div className={styles.help}>{linkedStatusNote(a.status)}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.muted}>No linked accounts in this dataset snapshot.</p>
              )}
            </section>

            <section className={styles.card} aria-labelledby="merge-h">
              <h2 id="merge-h" className={styles.h2}>
                Merge review
              </h2>
              {mergeResolution ? (
                <p className={styles.muted}>This entity record was merged. Open the canonical profile from the banner above.</p>
              ) : entity.mergeSuggestion ? (
                <>
                  <p className={styles.body}>
                    <strong>Suggested canonical profile:</strong> {entity.mergeSuggestion.intoDisplayName} (
                    {entity.mergeSuggestion.intoEntityId})
                  </p>
                  <p className={styles.muted}>{entity.mergeSuggestion.rationale}</p>
                  <p className={styles.muted}>
                    Confidence band: <strong>{entity.mergeSuggestion.confidenceBand}</strong>
                  </p>
                  {canConfirmMerge ? (
                    <button type="button" className={styles.btn} data-testid="entity-merge-confirm-open" onClick={() => setMergeOpen(true)}>
                      Confirm merge (reviewer)
                    </button>
                  ) : (
                    <p className={styles.muted} data-testid="entity-merge-readonly">
                      Merge confirmation is limited to publisher or integrity reviewers (and admins). Owners and viewers can
                      inspect the suggestion but cannot apply it in this demo.
                    </p>
                  )}
                </>
              ) : (
                <p className={styles.muted}>No open merge suggestions for this entity in the sandbox dataset.</p>
              )}
            </section>
          </div>

          <ConfirmDialog
            open={mergeOpen}
            title={`Merge “${entity.displayName}” into “${entity.mergeSuggestion?.intoDisplayName ?? ""}”?`}
            body="This action is auditable. In production it would enqueue a merge job and notify downstream products."
            confirmLabel="Apply merge"
            tone="danger"
            onCancel={() => setMergeOpen(false)}
            onConfirm={confirmMerge}
            testId="entity-merge-confirm-dialog"
          />
        </PageFrame>
      ) : null}
    </RouteViewRoot>
  );
}
