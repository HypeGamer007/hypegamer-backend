import type { DataProductRow, WidgetRow } from "@/mocks/productization.demo";

export function resolveProductByName(
  catalog: DataProductRow[],
  productName: string,
): DataProductRow | undefined {
  return catalog.find((r) => r.name === productName);
}

/** Community-backed data products cannot be promoted to live widgets in this mock policy gate. */
export function isLiveWidgetPublishBlocked(widget: WidgetRow, catalog: DataProductRow[]): boolean {
  if (widget.environment !== "live" || widget.status !== "draft") return false;
  const p = resolveProductByName(catalog, widget.productName);
  return p?.ingestionTier === "community";
}

export function dataProductsWithPolicyConflict(catalog: DataProductRow[]): DataProductRow[] {
  return catalog.filter((r) => r.status === "draft" && r.ingestionTier === "community");
}
