import { test, expect } from "@playwright/test";

test("home shows empty-state cards when demo not seeded", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("hypegamer_demo_seeded");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
  });
  await page.goto("/home");
  await expect(page.getByTestId("empty-state-home-sources")).toBeVisible();
  await expect(page.getByTestId("empty-state-home-competitions")).toBeVisible();
});
