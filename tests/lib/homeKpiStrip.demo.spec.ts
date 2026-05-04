import { describe, expect, it } from "vitest";
import {
  buildHomeKpiStripModel,
  buildLinearSparklineSeries,
  countPipelineWarnEvents,
} from "@/mocks/homeKpiStrip.demo";

describe("buildLinearSparklineSeries", () => {
  it("ends at the rounded target", () => {
    const s = buildLinearSparklineSeries(3, 7);
    expect(s).toHaveLength(7);
    expect(s[s.length - 1]).toBe(3);
    expect(s[0]).toBeLessThanOrEqual(3);
  });
});

describe("buildHomeKpiStripModel", () => {
  it("produces five linked KPI tiles aligned to fixture-derived inputs", () => {
    const tiles = buildHomeKpiStripModel({
      healthySources: 2,
      totalSources: 3,
      freshSources: 1,
      trustAttention: 2,
    });
    expect(tiles).toHaveLength(5);
    expect(tiles[0]?.id).toBe("kpi_sources_healthy");
    expect(tiles[0]?.value).toBe("2/3");
    expect(tiles[2]?.to).toBe("/competitions");
    expect(tiles[4]?.to).toContain("/integrator?tab=pipeline");
    expect(countPipelineWarnEvents()).toBeGreaterThanOrEqual(1);
  });
});
