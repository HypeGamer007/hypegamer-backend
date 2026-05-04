import { DEMO_COMPETITIONS } from "@/mocks/operational.demo";
import { INTEGRATOR_DEMO } from "@/mocks/integrator.demo";

/** Seven-point trend ending at `end` (mock-only, for SVG sparklines). */
export function buildLinearSparklineSeries(end: number, length = 7): number[] {
  const n = Math.max(2, length);
  const e = Math.max(0, Math.round(end));
  const start = Math.max(0, e - (n - 1));
  const step = (e - start) / (n - 1);
  return Array.from({ length: n }, (_, i) => Math.round(start + step * i));
}

export type HomeKpiTileModel = {
  id: string;
  label: string;
  value: string;
  caption: string;
  to: string;
  series: number[];
  tone: "accent" | "muted" | "warn" | "danger";
};

export function countPipelineWarnEvents(): number {
  return INTEGRATOR_DEMO.pipelineEvents.filter((e) => e.level === "warn").length;
}

export function countLiveCompetitions(): number {
  return DEMO_COMPETITIONS.filter((c) => c.status === "live").length;
}

/**
 * KPI row for Home when sandbox fixtures are on. Numbers are tied to the same
 * operational, governance, and integrator mocks as the rest of the demo.
 */
export function buildHomeKpiStripModel(input: {
  healthySources: number;
  totalSources: number;
  freshSources: number;
  trustAttention: number;
}): HomeKpiTileModel[] {
  const { healthySources, totalSources, freshSources, trustAttention } = input;
  const liveComps = countLiveCompetitions();
  const warns = countPipelineWarnEvents();

  const healthySeries = buildLinearSparklineSeries(healthySources);
  const freshSeries = buildLinearSparklineSeries(freshSources);
  const liveSeries = buildLinearSparklineSeries(liveComps);
  const trustSeries = buildLinearSparklineSeries(trustAttention);
  const warnSeries = buildLinearSparklineSeries(warns);

  return [
    {
      id: "kpi_sources_healthy",
      label: "Healthy sources",
      value: `${healthySources}/${totalSources}`,
      caption: "Publisher-authorized lanes in mock health view.",
      to: "/sources",
      series: healthySeries,
      tone: healthySources < totalSources ? "warn" : "accent",
    },
    {
      id: "kpi_freshness",
      label: "Fresh sync window",
      value: `${freshSources} fresh`,
      caption: "Same-day freshness bucket across demo sources.",
      to: "/sources",
      series: freshSeries,
      tone: "accent",
    },
    {
      id: "kpi_live_comps",
      label: "Live competitions",
      value: String(liveComps),
      caption: "Includes Ancient Major in operational fixtures.",
      to: "/competitions",
      series: liveSeries,
      tone: "muted",
    },
    {
      id: "kpi_trust",
      label: "Trust attention",
      value: String(trustAttention),
      caption: "Open + triaged signals (governance demo).",
      to: "/trust",
      series: trustSeries,
      tone: trustAttention > 2 ? "warn" : "muted",
    },
    {
      id: "kpi_pipeline_warn",
      label: "Pipeline warns",
      value: String(warns),
      caption: "Integrator log severity = warn (MOBA sandbox).",
      to: "/integrator?tab=pipeline&logLevel=warn",
      series: warnSeries,
      tone: warns > 0 ? "warn" : "muted",
    },
  ];
}
