import styles from "./Sparkline.module.css";

type SparklineTone = "accent" | "muted" | "warn" | "danger";

const toneClass: Record<SparklineTone, string> = {
  accent: styles.toneAccent,
  muted: styles.toneMuted,
  warn: styles.toneWarn,
  danger: styles.toneDanger,
};

type Props = {
  values: number[];
  tone: SparklineTone;
  /** Short description for assistive tech (series is decorative). */
  label: string;
};

/**
 * Tiny SVG sparkline — no external chart deps; values are mock fixture–derived.
 */
export function Sparkline({ values, tone, label }: Props) {
  const w = 112;
  const h = 36;
  const pad = 4;
  const series = values.length >= 2 ? values : values.length === 1 ? [values[0]!, values[0]!] : [0, 0];
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const last = series[series.length - 1]!;
  const points = series
    .map((v, i) => {
      const x = pad + (series.length === 1 ? 0 : (i / (series.length - 1)) * (w - 2 * pad));
      const y = h - pad - ((v - min) / span) * (h - 2 * pad);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className={`${styles.svg} ${toneClass[tone]}`}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`${label} trend ending near ${last} (illustrative mock).`}
    >
      <polyline className={styles.line} fill="none" strokeWidth="2" strokeLinecap="round" points={points} />
    </svg>
  );
}
