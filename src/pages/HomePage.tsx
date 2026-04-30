import { useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { RouteViewRoot } from "@/components/state/RouteViewRoot";
import { useDemoSeeded } from "@/hooks/useDemoSeeded";
import { useRouteFixture } from "@/hooks/useRouteFixture";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import { STORAGE_DEMO_SEEDED } from "@/lib/storageKeys";
import { track } from "@/lib/telemetry";
import { DEMO_SOURCES } from "@/mocks/operational.demo";
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
                </nav>
              ) : null}
            </header>

            <div className={styles.grid}>
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

              <section className={styles.card} aria-labelledby="comp-heading">
          <h2 id="comp-heading" className={styles.cardTitle}>
            Live competitions
          </h2>
          {demoSeeded ? (
            <p className={styles.muted}>Spring Invitational — live</p>
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
              <li>Source sync completed — Official Event Feed</li>
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
