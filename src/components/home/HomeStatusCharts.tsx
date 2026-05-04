import { Link } from "react-router-dom";
import styles from "./HomeStatusCharts.module.css";

type Counts = {
  healthy: number;
  degraded: number;
  failed: number;
  paused: number;
  total: number;
};

type Freshness = {
  fresh: number;
  stale: number;
  old: number;
  unknown: number;
};

type Props = {
  counts: Counts;
  freshness: Freshness;
};

const DOT: Record<string, string> = {
  healthy: styles.dot_healthy,
  degraded: styles.dot_degraded,
  failed: styles.dot_failed,
  paused: styles.dot_paused,
  fresh: styles.dot_fresh,
  stale: styles.dot_stale,
  old: styles.dot_old,
  unknown: styles.dot_unknown,
};

/** Mock-only SVG visuals; proportions match current source health / freshness fixtures. */
export function HomeStatusCharts({ counts, freshness }: Props) {
  const total = counts.total || 1;
  const segments = [
    { key: "healthy", n: counts.healthy, className: styles.segHealthy, label: "Healthy" },
    { key: "degraded", n: counts.degraded, className: styles.segDegraded, label: "Degraded" },
    { key: "failed", n: counts.failed, className: styles.segFailed, label: "Failed" },
    { key: "paused", n: counts.paused, className: styles.segPaused, label: "Paused" },
  ].filter((s) => s.n > 0);

  const bars = [
    { key: "fresh", n: freshness.fresh, label: "Fresh", className: styles.barFresh },
    { key: "stale", n: freshness.stale, label: "Stale", className: styles.barStale },
    { key: "old", n: freshness.old, label: "Old", className: styles.barOld },
    { key: "unknown", n: freshness.unknown, label: "Unknown", className: styles.barUnknown },
  ];

  const chartW = 360;
  const chartH = 36;
  let x = 0;
  const rects = segments.map((s) => {
    const w = (s.n / total) * chartW;
    const r = (
      <rect
        key={s.key}
        x={x}
        y={4}
        width={Math.max(w, s.n > 0 ? 2 : 0)}
        height={chartH - 8}
        rx={4}
        className={s.className}
      />
    );
    x += w;
    return r;
  });

  const maxBar = Math.max(...bars.map((b) => b.n), 1);
  const barW = 56;
  const barMaxH = 72;
  const gap = 12;
  const barGroupW = bars.length * (barW + gap);

  return (
    <div className={styles.row} data-testid="home-status-charts">
      <section className={styles.card} aria-labelledby="home-chart-sources-h">
        <div className={styles.cardHead}>
          <h2 id="home-chart-sources-h" className={styles.cardTitle}>
            Source status mix
          </h2>
          <Link className={styles.cardLink} to="/sources">
            Sources
          </Link>
        </div>
        <svg
          className={styles.stackedSvg}
          width="100%"
          height={chartH}
          viewBox={`0 0 ${chartW} ${chartH}`}
          role="img"
          aria-label={`Mock stacked distribution: ${counts.healthy} healthy, ${counts.degraded} degraded, ${counts.failed} failed, ${counts.paused} paused of ${counts.total} sources.`}
        >
          {rects}
        </svg>
        <ul className={styles.legend}>
          {segments.map((s) => (
            <li key={s.key} className={styles.legendItem}>
              <span className={`${styles.swatch} ${DOT[s.key] ?? ""}`} aria-hidden />
              {s.label}: {s.n}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.card} aria-labelledby="home-chart-fresh-h">
        <div className={styles.cardHead}>
          <h2 id="home-chart-fresh-h" className={styles.cardTitle}>
            Freshness buckets
          </h2>
          <Link className={styles.cardLink} to="/sources">
            Detail
          </Link>
        </div>
        <svg
          className={styles.barsSvg}
          width="100%"
          height={barMaxH + 28}
          viewBox={`0 0 ${barGroupW} ${barMaxH + 28}`}
          role="img"
          aria-label={`Mock freshness bars: ${freshness.fresh} fresh, ${freshness.stale} stale, ${freshness.old} old, ${freshness.unknown} unknown.`}
        >
          {bars.map((b, i) => {
            const h = (b.n / maxBar) * barMaxH;
            const bx = i * (barW + gap);
            const by = barMaxH - h + 8;
            return (
              <g key={b.key}>
                <rect x={bx} y={by} width={barW} height={h} rx={4} className={b.className} />
                <text x={bx + barW / 2} y={barMaxH + 22} textAnchor="middle" className={styles.barLabel}>
                  {b.n}
                </text>
              </g>
            );
          })}
        </svg>
        <ul className={styles.legend}>
          {bars.map((b) => (
            <li key={b.key} className={styles.legendItem}>
              <span className={`${styles.swatch} ${DOT[b.key] ?? ""}`} aria-hidden />
              {b.label}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
