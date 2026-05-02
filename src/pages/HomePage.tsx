import { useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { RouteViewRoot } from "@/components/state/RouteViewRoot";
import { useDemoSeeded } from "@/hooks/useDemoSeeded";
import { useRouteFixture } from "@/hooks/useRouteFixture";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import { STORAGE_DEMO_SEEDED } from "@/lib/storageKeys";
import { track } from "@/lib/telemetry";
import { GOVERNANCE_DEMO } from "@/mocks/governance.demo";
import { DEMO_SOURCES } from "@/mocks/operational.demo";
import { buildWorkspaceStoryRun } from "@/mocks/workspaceNarrative";
import { getSourceStatusOverride } from "@/lib/sourceOverrides";
import { freshnessFromIso } from "@/lib/freshness";
import styles from "./HomePage.module.css";

function readDemoSeeded(): boolean {
  return localStorage.getItem(STORAGE_DEMO_SEEDED) === "1";
}

export function HomePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fixture = params.get("fixture");
  const fx = useRouteFixture();

  const demoSeeded = useDemoSeeded();
  const status = fx.rawFixture ? fx.status : "ready";

  useEffect(() => {
    track("home_viewed", {
      demoSeeded: readDemoSeeded(),
      fixture: fixture ?? "default",
    });
  }, [fixture, demoSeeded]);

  const partialBanner =
    fx.rawFixture === "partial"
      ? "Some command center fields may be withheld under the current policy scope."
      : undefined;

  const healthSummary = useMemo(() => {
    if (!demoSeeded) return null;
    const effective = DEMO_SOURCES.map((s) => {
      const ovr = getSourceStatusOverride(s.id);
      return ovr ? { ...s, status: ovr } : s;
    });
    const counts = effective.reduce(
      (acc, s) => {
        acc.total += 1;
        acc[s.status] += 1;
        return acc;
      },
      { total: 0, healthy: 0, degraded: 0, failed: 0, paused: 0 }
    );
    const freshness = effective.reduce(
      (acc, s) => {
        const f = freshnessFromIso(s.lastSync).state;
        acc[f] += 1;
        return acc;
      },
      { fresh: 0, stale: 0, old: 0, unknown: 0 }
    );
    return { counts, freshness };
  }, [demoSeeded]);

  const governanceSnapshot = useMemo(() => {
    if (!demoSeeded) return null;
    const pendingGrants = GOVERNANCE_DEMO.partners.filter((p) => p.status === "pending").length;
    const trustFollowUps = GOVERNANCE_DEMO.trustSignals.filter((s) => s.state !== "closed").length;
    return { pendingGrants, trustFollowUps };
  }, [demoSeeded]);

  const storyRun = useMemo(() => (demoSeeded ? buildWorkspaceStoryRun() : null), [demoSeeded]);

  const activityFeed = useMemo(() => {
    if (!demoSeeded) return [];
    const auditLines = GOVERNANCE_DEMO.auditActivity.slice(0, 3).map((e) => ({
      key: e.id,
      node: (
        <span>
          {new Date(e.occurredAt).toLocaleString()} — <strong>{e.verb}</strong> — {e.objectLabel}{" "}
          <Link to="/settings" style={{ color: "var(--color-accent)", fontWeight: 600 }}>
            Audit
          </Link>
        </span>
      ),
    }));
    return [
      {
        key: "sync",
        node: (
          <span>
            Source sync completed — Spectator Match Feed ·{" "}
            <Link to="/sources" style={{ color: "var(--color-accent)", fontWeight: 600 }}>
              Sources
            </Link>
          </span>
        ),
      },
      ...auditLines,
    ];
  }, [demoSeeded]);

  return (
    <RouteViewRoot
      gateAnalyticsId="home"
      status={status}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
      partialBanner={partialBanner}
      empty={{
        analyticsId: "home-empty",
        title: "No workspace data yet",
        body: "Load sandbox preview data to inspect the control plane, or complete setup to connect real sources.",
        primaryCta: { label: "Load sandbox data", action: "load_sandbox" },
        secondaryCta: { label: "Review setup", action: "goto_setup" },
        onPrimary: () => {
          seedDemoWorkspace("home_empty_state");
          window.location.reload();
        },
        onSecondary: () => navigate("/onboarding"),
      }}
    >
      <div data-testid="home-page" aria-busy={status === "loading"}>
        {status === "loading" ? (
          <div className={styles.grid} aria-label="Loading dashboard">
            <div className={`${styles.card} ${styles.skeleton}`} />
            <div className={`${styles.card} ${styles.skeleton}`} />
            <div className={`${styles.card} ${styles.skeleton}`} />
          </div>
        ) : null}

        {status === "ready" || status === "partial" ? (
          <>
            <header className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Command center</h1>
              <p className={styles.pageSubtitle}>
                Source health, active competitions, and what to do next.
              </p>
              {demoSeeded ? (
                <nav className={styles.quickNav} aria-label="Workspace modules">
                  <Link className={styles.quickLink} to="/competitions">
                    Competitions
                  </Link>
                  <span className={styles.quickSep} aria-hidden>
                    ·
                  </span>
                  <Link className={styles.quickLink} to="/matches">
                    Matches
                  </Link>
                  <span className={styles.quickSep} aria-hidden>
                    ·
                  </span>
                  <Link className={styles.quickLink} to="/sources">
                    Sources
                  </Link>
                  <span className={styles.quickSep} aria-hidden>
                    ·
                  </span>
                  <Link className={styles.quickLink} to="/entities">
                    Entities
                  </Link>
                  <span className={styles.quickSep} aria-hidden>
                    ·
                  </span>
                  <Link className={styles.quickLink} to="/data-products">
                    Data products
                  </Link>
                  <span className={styles.quickSep} aria-hidden>
                    ·
                  </span>
                  <Link className={styles.quickLink} to="/widgets">
                    Widgets
                  </Link>
                  <span className={styles.quickSep} aria-hidden>
                    ·
                  </span>
                  <Link className={styles.quickLink} to="/developers">
                    Developers
                  </Link>
                  <span className={styles.quickSep} aria-hidden>
                    ·
                  </span>
                  <Link className={styles.quickLink} to="/integrator">
                    Integrator hub
                  </Link>
                  <span className={styles.quickSep} aria-hidden>
                    ·
                  </span>
                  <Link className={styles.quickLink} to="/partners">
                    Partners
                  </Link>
                  <span className={styles.quickSep} aria-hidden>
                    ·
                  </span>
                  <Link className={styles.quickLink} to="/trust">
                    Trust
                  </Link>
                  <span className={styles.quickSep} aria-hidden>
                    ·
                  </span>
                  <Link className={styles.quickLink} to="/settings">
                    Settings
                  </Link>
                  <span className={styles.quickSep} aria-hidden>
                    ·
                  </span>
                  <Link className={styles.quickLink} to="/search">
                    Search
                  </Link>
                </nav>
              ) : null}
            </header>

            {storyRun ? (
              <section
                className={styles.storyRun}
                aria-labelledby="workspace-story-heading"
                data-testid="home-workspace-story"
              >
                <h2 id="workspace-story-heading" className={styles.storyRunTitle}>
                  {storyRun.headline}
                </h2>
                <p className={styles.storyRunLead}>{storyRun.subline}</p>
                <ol className={styles.storySteps} aria-label="Guided demo path">
                  {storyRun.chapters.map((ch) => (
                    <li key={ch.step} className={styles.storyStep}>
                      <div className={styles.storyStepHead}>
                        <span className={styles.storyBadge} aria-hidden>
                          {ch.step}
                        </span>
                        <h3 className={styles.storyStepTitle}>{ch.title}</h3>
                      </div>
                      <p className={styles.storyStepBody}>{ch.body}</p>
                      <Link className={styles.storyStepLink} to={ch.to}>
                        {ch.cta}
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            <div className={styles.grid}>
              {demoSeeded ? (
                <section
                  className={styles.card}
                  aria-labelledby="integrator-cta-heading"
                  data-testid="home-integrator-cta"
                >
                  <h2 id="integrator-cta-heading" className={styles.cardTitle}>
                    Integrator journey
                  </h2>
                  <p className={styles.muted}>
                    Step 7 of the Ancient Major story above — connect → pipeline → readiness in one mock hub. Fixtures and
                    telemetry only; your team wires live streams later.
                  </p>
                  <p style={{ margin: 0 }}>
                    <Link className={styles.quickLink} to="/integrator?tab=connect">
                      Open Integrator hub
                    </Link>
                  </p>
                </section>
              ) : null}
              <section className={styles.card} aria-labelledby="health-heading">
                <h2 id="health-heading" className={styles.cardTitle}>
                  Source health
                </h2>
                {demoSeeded && healthSummary ? (
                  <ul className={styles.list}>
                    <li>{healthSummary.counts.healthy} healthy</li>
                    <li>{healthSummary.counts.degraded} degraded</li>
                    <li>{healthSummary.counts.failed} failed</li>
                    {healthSummary.counts.paused ? <li>{healthSummary.counts.paused} paused</li> : null}
                    <li>
                      Freshness: {healthSummary.freshness.fresh} fresh, {healthSummary.freshness.stale} stale,{" "}
                      {healthSummary.freshness.old} old
                    </li>
                  </ul>
                ) : (
                  <EmptyState
                    analyticsId="home-sources"
                    title="No sources connected"
                    body="Connect a source to start importing competitions, matches, teams, players, and results."
                    primaryCta={{ label: "Add source", action: "add_source" }}
                    secondaryCta={{ label: "Load sandbox data", action: "load_sandbox" }}
                    onPrimary={() => navigate("/sources")}
                    onSecondary={() => {
                      seedDemoWorkspace("home_empty_state");
                      window.location.reload();
                    }}
                  />
                )}
              </section>

              {demoSeeded && governanceSnapshot ? (
                <section className={styles.card} aria-labelledby="gov-heading" data-testid="home-governance-card">
                  <h2 id="gov-heading" className={styles.cardTitle}>
                    Governance snapshot
                  </h2>
                  <ul className={styles.list}>
                    <li>
                      Pending partner grants:{" "}
                      <Link to="/partners?status=pending">{governanceSnapshot.pendingGrants}</Link>
                    </li>
                    <li>
                      Trust signals (open or triaged):{" "}
                      <Link to="/trust">{governanceSnapshot.trustFollowUps}</Link>
                    </li>
                    <li>
                      <Link to="/settings">Workspace audit & retention</Link>
                    </li>
                  </ul>
                  <p className={styles.muted}>
                    Certified and community paths stay separated in grants and integrity reviews (mock data).
                  </p>
                </section>
              ) : null}

              <section className={styles.card} aria-labelledby="comp-heading">
          <h2 id="comp-heading" className={styles.cardTitle}>
            Live competitions
          </h2>
          {demoSeeded ? (
            <p className={styles.muted}>Ancient Major — live</p>
          ) : (
            <EmptyState
              analyticsId="home-competitions"
              title="No competitions yet"
              body="Competitions appear when a source syncs or when you load demo data."
              primaryCta={{ label: "Load sandbox data", action: "load_sandbox" }}
              onPrimary={() => {
                seedDemoWorkspace("home_empty_state");
                window.location.reload();
              }}
            />
          )}
              </section>

              <section className={styles.card} aria-labelledby="activity-heading">
          <h2 id="activity-heading" className={styles.cardTitle}>
            Recent activity
          </h2>
          {demoSeeded ? (
            <ul className={styles.list}>
              {activityFeed.map((item) => (
                <li key={item.key}>{item.node}</li>
              ))}
            </ul>
          ) : (
            <EmptyState
              analyticsId="home-activity"
              title="No activity yet"
              body="When sources sync or teammates act, a timeline appears here."
              secondaryCta={{ label: "Review setup", action: "goto_setup" }}
              onSecondary={() => {
                window.location.href = "/onboarding";
              }}
            />
          )}
              </section>
            </div>
          </>
        ) : null}
      </div>
    </RouteViewRoot>
  );
}
