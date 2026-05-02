import { test, expect } from "@playwright/test";

test("competition filters clear restores rows", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
  });
  await page.goto("/competitions?q=__no_match__");
  await expect(page.getByTestId("empty-state-competitions-filter-empty")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByRole("cell", { name: "Ancient Major" })).toBeVisible();
});

test("competition status filter narrows list", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
  });
  await page.goto("/competitions?status=completed");
  await expect(page.getByRole("cell", { name: "Rosh Pit Open" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Ancient Major" })).toHaveCount(0);
});
