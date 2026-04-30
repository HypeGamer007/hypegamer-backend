import { test, expect } from "@playwright/test";

test("competitions shows demo rows when sandbox seeded", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
  });
  await page.goto("/competitions");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await expect(page.getByText("Spring Invitational")).toBeVisible();
});

test("competitions shows empty state without demo data", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("hypegamer_demo_seeded");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
  });
  await page.goto("/competitions");
  await expect(page.getByTestId("empty-state-competitions-empty")).toBeVisible();
});
