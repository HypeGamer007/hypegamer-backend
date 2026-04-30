import { test, expect } from "@playwright/test";

test.describe("phase 1 sorting", () => {
  test("competitions name desc changes top row", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("hypegamer_demo_seeded", "1");
      localStorage.setItem("hypegamer_onboarding_complete", "1");
    });
    await page.goto("/competitions?sort=name_desc");
    await expect(page.getByTestId("view-status")).toContainText("ready");
    const firstDataRow = page.locator("tbody tr").first();
    await expect(firstDataRow.locator("td").first()).toHaveText("Spring Invitational");
  });

  test("sources health sort puts healthy before failed", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("hypegamer_demo_seeded", "1");
      localStorage.setItem("hypegamer_onboarding_complete", "1");
    });
    await page.goto("/sources?sort=health");
    await expect(page.getByTestId("view-status")).toContainText("ready");
    const firstDataRow = page.locator("tbody tr").first();
    await expect(firstDataRow.locator("td").nth(1)).toHaveText("healthy");
  });
});

