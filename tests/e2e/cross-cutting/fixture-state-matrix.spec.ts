import { test, expect } from "@playwright/test";

/**
 * Ensures `?fixture=` maps to the expected ViewStatusMarker text across primary hubs.
 * Note: `restricted` still reports `ready` in the marker (policy overlay is separate).
 */
const ROUTES = [
  "/home",
  "/sources",
  "/competitions",
  "/matches",
  "/entities",
  "/identity",
  "/data-products",
  "/widgets",
  "/developers",
  "/integrator",
  "/partners",
  "/trust",
  "/settings",
  "/search",
] as const;

const FIXTURE_TO_STATUS: Record<string, string> = {
  loading: "loading",
  empty: "empty",
  partial: "partial",
  error: "error",
  restricted: "ready",
  denied: "denied",
};

for (const route of ROUTES) {
  for (const [fixture, expected] of Object.entries(FIXTURE_TO_STATUS)) {
    test(`fixture=${fixture} → view-status ${expected} on ${route}`, async ({ page }) => {
      await page.goto(`${route}?fixture=${encodeURIComponent(fixture)}`);
      await expect(page.getByTestId("view-status")).toContainText(expected);
    });
  }
}
