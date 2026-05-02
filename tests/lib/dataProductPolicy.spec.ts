import { describe, it, expect } from "vitest";
import {
  dataProductsWithPolicyConflict,
  isLiveWidgetPublishBlocked,
  resolveProductByName,
} from "@/lib/dataProductPolicy";
import type { DataProductRow, WidgetRow } from "@/mocks/productization.demo";

const catalog: DataProductRow[] = [
  {
    id: "dp_a",
    name: "Certified feed",
    entityType: "competition",
    status: "published",
    fieldCount: 1,
    updatedAt: "2026-01-01T00:00:00.000Z",
    ingestionTier: "certified",
  },
  {
    id: "dp_b",
    name: "Community odds",
    entityType: "match",
    status: "draft",
    fieldCount: 1,
    updatedAt: "2026-01-02T00:00:00.000Z",
    ingestionTier: "community",
  },
];

describe("dataProductPolicy", () => {
  it("resolves product by display name", () => {
    expect(resolveProductByName(catalog, "Community odds")?.id).toBe("dp_b");
  });

  it("flags live draft widgets backed by community products", () => {
    const w: WidgetRow = {
      id: "wg_x",
      title: "Ticker",
      environment: "live",
      status: "draft",
      productName: "Community odds",
      updatedAt: "2026-01-03T00:00:00.000Z",
    };
    expect(isLiveWidgetPublishBlocked(w, catalog)).toBe(true);
  });

  it("does not block sandbox drafts", () => {
    const w: WidgetRow = {
      id: "wg_y",
      title: "Ticker",
      environment: "sandbox",
      status: "draft",
      productName: "Community odds",
      updatedAt: "2026-01-03T00:00:00.000Z",
    };
    expect(isLiveWidgetPublishBlocked(w, catalog)).toBe(false);
  });

  it("lists community-tier drafts as policy conflicts", () => {
    expect(dataProductsWithPolicyConflict(catalog).map((r) => r.id)).toEqual(["dp_b"]);
  });
});
