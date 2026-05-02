import { test, expect } from "@playwright/test";

/**
 * Smoke check for state envelope text on implemented routes.
 * Expand with role/fixture matrix as routes are added.
 */
const routes = [
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
];

for (const route of routes) {
  test(`view-status resolves on ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByTestId("view-status")).toBeVisible();
    await expect(page.getByTestId("view-status")).toContainText(
      /(loading|ready|empty|partial|error|restricted|denied)/
    );
  });
}
