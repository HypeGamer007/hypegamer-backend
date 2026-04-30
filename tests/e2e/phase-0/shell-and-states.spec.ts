import { test, expect } from "@playwright/test";

test("phase 0 shell loads and exposes loading state", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hypegamer_onboarding_complete", "1");
  });
  await page.goto("/home?fixture=loading");
  await expect(page.getByTestId("app-shell")).toBeVisible();
  await expect(page.getByTestId("view-status")).toContainText("loading");
});
