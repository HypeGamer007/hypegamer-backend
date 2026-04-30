import { test, expect } from "@playwright/test";

test.describe("core routes expose view status", () => {
  test("home shows ready by default", async ({ page }) => {
    await page.goto("/home");
    await expect(page.getByTestId("view-status")).toContainText("ready");
  });

  test("sources page resolves view status", async ({ page }) => {
    await page.goto("/sources");
    await expect(page.getByTestId("view-status")).toContainText(/ready|empty/);
  });

  test("onboarding wizard is visible", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByTestId("onboarding-wizard")).toBeVisible();
  });
});
